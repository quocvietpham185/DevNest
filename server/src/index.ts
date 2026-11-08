import "dotenv/config";
import cors from "cors";
import express from "express";
import { reposRouter, refreshAllSharedRepos } from "./routes/repos.js";
import { githubRouter } from "./routes/github.js";
import { supabaseServer } from "./lib/supabase.js";

const app = express();
// Named SERVER_PORT (not PORT) so it doesn't collide with a PORT env var
// aimed at another process when running client and server concurrently.
const port = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 4000;
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json());
app.use((req, _res, next) => {
  const startedAt = Date.now();
  _res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} ${_res.statusCode} ${Date.now() - startedAt}ms`);
  });
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/repos", reposRouter);
app.use("/api/github", githubRouter);

/**
 * Phase 1 / Operational requirement: Dynamic Sitemap.xml
 */
app.get("/sitemap.xml", async (_req, res) => {
  try {
    const [itemsRes, usersRes] = await Promise.all([
      supabaseServer
        .from("content_items")
        .select("id, kind, updated_at")
        .order("updated_at", { ascending: false })
        .limit(200),
      supabaseServer.from("profiles").select("username, created_at").limit(100),
    ]);

    const staticUrls = ["/", "/questions", "/repos", "/search"].map(
      (path) => `  <url><loc>${clientOrigin}${path}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`
    );

    const contentUrls = (itemsRes.data || []).map((item) => {
      let pathPrefix = "blog";
      if (item.kind === "project") pathPrefix = "projects";
      else if (item.kind === "question") pathPrefix = "questions";
      else if (item.kind === "repo") pathPrefix = "repos";

      const lastMod = item.updated_at ? new Date(item.updated_at).toISOString().split("T")[0] : "";
      return `  <url><loc>${clientOrigin}/${pathPrefix}/${item.id}</loc>${
        lastMod ? `<lastmod>${lastMod}</lastmod>` : ""
      }<changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    });

    const userUrls = (usersRes.data || []).map(
      (u) =>
        `  <url><loc>${clientOrigin}/u/${encodeURIComponent(u.username)}</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>`
    );

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...contentUrls, ...userUrls].join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (err) {
    console.error("Failed to generate sitemap:", err);
    res.status(500).send("Error generating sitemap");
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled API error", error);
  res.status(500).json({ error: "Internal server error" });
});

// Phase 2: Periodic background metadata refresh (every 30 minutes)
setInterval(() => {
  console.log("[Phase 2 Background Job] Refreshing repo metadata...");
  refreshAllSharedRepos().catch((err) => console.error("Background repo refresh failed:", err));
}, 30 * 60 * 1000);

app.listen(port, () => {
  console.log(`DevNest API listening on http://localhost:${port}`);
});
