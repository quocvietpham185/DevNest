import { NextResponse } from "next/server";
import { fetchRepoMetadata } from "@/lib/github";

/**
 * POST { repoUrl: "owner/name" | "https://github.com/owner/name" }
 * → GitHub metadata to prefill the "share a repo" form (see FEATURES.md, Repo Share).
 */
export async function POST(request: Request) {
  const { repoUrl } = await request.json();

  if (!repoUrl || typeof repoUrl !== "string") {
    return NextResponse.json({ error: "repoUrl is required" }, { status: 400 });
  }

  try {
    const metadata = await fetchRepoMetadata(repoUrl);
    return NextResponse.json(metadata);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch repo metadata" },
      { status: 422 },
    );
  }
}
