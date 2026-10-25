import * as React from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * 可键盘操作的可点击 Card：role="button" + tabIndex={0} + Enter/Space 触发。
 * 修复 ShipCard / RulesSection / TemplatesSection 三处 onClick Card 键盘不可达的问题。
 * onClick 收敛为无参回调（三个消费方均无需事件对象），键盘路径可直接调用。
 */
export function ClickableCard({
  className,
  onClick,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<typeof Card>, 'onClick' | 'onKeyDown'> & {
  onClick?: () => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === 'Enter' || e.key === ' ') {
      // Space 默认滚动页面，Enter 默认无操作，统一吞掉并触发点击
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn('cursor-pointer', className)}
      {...props}
    />
  );
}
