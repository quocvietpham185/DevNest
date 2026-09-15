import "dotenv/config";
import cors from "cors";
import express from "express";
import { reposRouter } from "./routes/repos.js";

const app = express();
// Named SERVER_PORT (not PORT) so it doesn't collide with a PORT env var
// aimed at another process when running client and server concurrently.
const port = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/repos", reposRouter);

app.listen(port, () => {
  console.log(`DevNest API listening on http://localhost:${port}`);
});
