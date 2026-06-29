import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import WikiHomePage from "@/pages/WikiHomePage/WikiHomePage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<WikiHomePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
