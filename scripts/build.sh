#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# Normalize MSYS/Cygwin path to native Windows form for child native processes (node/vite).
# Without this, git-bash passes /c/Users/... to node.exe which misparses it as a relative
# path and build output lands in a stray C:\c\... directory while the script exits 0.
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    # 禁用 MSYS 的两类路径转换，否则以 / 开头的变量值（如 ASSETS_CDN_PATH=/）
    # 传给 node.exe 时会被改写成 Git 安装根（C:/Program Files/Git），产物资源引用全部失效
    export MSYS_NO_PATHCONV=1
    export MSYS2_ENV_CONV_EXCL='*'
    if command -v cygpath >/dev/null 2>&1; then
      ROOT="$(cygpath -m "$ROOT")"
    else
      # Fallback: pwd -W prints native drive-letter paths even without cygpath
      ROOT="$(cd "$(dirname "$0")/.." && pwd -W 2>/dev/null || pwd -P)"
    fi
    ;;
esac
OUTPUT="$ROOT/dist/output"
OUTPUT_RESOURCE="$ROOT/dist/output_resource"
OUTPUT_STATIC="$ROOT/dist/output_static"

# 映射平台环境变量到 preset 期望的变量名
#   MIAODA_APP_ID            → /app/<appId> 作为客户端 base path
#   MIAODA_RESOURCE_CDN_PREFIX → assets (JS/CSS) 的 CDN 前缀
# CLI 注入约定见 miaoda-cli src/services/deploy/modern/atoms/build.ts
export CLIENT_BASE_PATH="${MIAODA_APP_ID:+/app/$MIAODA_APP_ID}"
export ASSETS_CDN_PATH="${MIAODA_RESOURCE_CDN_PREFIX:-/}"
export STATIC_ASSETS_BASE_URL="${MIAODA_STATIC_CDN_PREFIX}"
export NODE_ENV="${NODE_ENV:-production}"

# 清理
rm -rf "$ROOT/dist"

# 1. Vite 构建 → dist/client/（相对于项目根目录输出）
npx vite build --outDir "$ROOT/dist/client" --emptyOutDir

# 2. HTML → dist/output/
mkdir -p "$OUTPUT"
find "$ROOT/dist/client" -maxdepth 1 \( -name '*.html' -o -name 'routes.json' \) -exec cp {} "$OUTPUT/" \;

# 3. assets/ → dist/output_resource/（JS/CSS/字体，上传到 CDN）
if [ -d "$ROOT/dist/client/assets" ]; then
  mkdir -p "$OUTPUT_RESOURCE"
  cp -r "$ROOT/dist/client/assets" "$OUTPUT_RESOURCE/"
fi

# 4. 私有静态资源 → dist/output_static/（排除代码文件）
if [ -d "$ROOT/shared/static" ]; then
  mkdir -p "$OUTPUT_STATIC"
  cp -r "$ROOT/shared/static/." "$OUTPUT_STATIC/"
  find "$OUTPUT_STATIC/" -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) -delete
fi

# 5. capability 配置 → dist/output_capabilities/
if [ -d "$ROOT/shared/capabilities" ]; then
  mkdir -p "$ROOT/dist/output_capabilities"
  cp -r "$ROOT/shared/capabilities/." "$ROOT/dist/output_capabilities/"
fi

# 清理中间产物
rm -rf "$ROOT/dist/client"

# 6. 合并到 dist/output/（Cloudflare Pages 单目录部署）
if [ -d "$OUTPUT_RESOURCE" ]; then
  cp -r "$OUTPUT_RESOURCE/." "$OUTPUT/"
  rm -rf "$OUTPUT_RESOURCE"
fi
if [ -d "$OUTPUT_STATIC" ]; then
  cp -r "$OUTPUT_STATIC/." "$OUTPUT/"
  rm -rf "$OUTPUT_STATIC"
fi
if [ -d "$ROOT/dist/output_capabilities" ]; then
  cp -r "$ROOT/dist/output_capabilities/." "$OUTPUT/"
  rm -rf "$ROOT/dist/output_capabilities"
fi

# Guard against silent failure: the merged output must contain a real index.html
if [ ! -s "$OUTPUT/index.html" ]; then
  echo "FATAL: $OUTPUT/index.html missing or empty after merge" >&2
  echo "  (hint: check that vite build wrote to $ROOT/dist/client)" >&2
  exit 1
fi

# Guard: index.html must not contain MSYS-mangled paths (Git Bash maps / → C:/Program Files/Git)
if grep -q 'Program Files' "$OUTPUT/index.html"; then
  echo "FATAL: dist/output/index.html contains MSYS-mangled asset paths" >&2
  echo "  (hint: a '/'-prefixed variable was rewritten by Git Bash path conversion)" >&2
  exit 1
fi

# Guard: every assets/ reference in index.html must exist in the merged output
BUILD_GUARD_MISSING=0
for BUILD_GUARD_REF in $(grep -o 'assets/[^"]*' "$OUTPUT/index.html" | sort -u); do
  if [ ! -f "$OUTPUT/$BUILD_GUARD_REF" ]; then
    echo "FATAL: index.html references missing asset: $BUILD_GUARD_REF" >&2
    BUILD_GUARD_MISSING=1
  fi
done
[ "$BUILD_GUARD_MISSING" -eq 0 ] || exit 1

echo "Build complete"
echo "  All output → dist/output/"
