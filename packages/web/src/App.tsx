import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ContentBrief } from "./routes/ContentBrief";
import { GscCallback } from "./routes/GscCallback";
import { Home } from "./routes/Home";
import { KeywordMap } from "./routes/KeywordMap";
import { LlmoAudit } from "./routes/LlmoAudit";
import { SiteAudit } from "./routes/SiteAudit";

export const router = createBrowserRouter([
  { path: "/gsc-callback", element: <GscCallback /> },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "llmo", element: <LlmoAudit /> },
      { path: "site", element: <SiteAudit /> },
      { path: "brief", element: <ContentBrief /> },
      { path: "keywords", element: <KeywordMap /> },
    ],
  },
]);
