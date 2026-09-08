# DevNest

Nền tảng cộng đồng cho developer — blog kỹ thuật, project showcase, và chia sẻ repo hay, trong một feed và một cộng đồng duy nhất.

Xem [PRD.md](./PRD.md) cho tầm nhìn/scope và [FEATURES.md](./FEATURES.md) cho roadmap tính năng.

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS) — frontend + backend (Route Handlers)
- [Supabase](https://supabase.com) — Postgres, Auth (GitHub OAuth), Storage
- [Octokit](https://github.com/octokit/octokit.js) — gọi GitHub API để lấy metadata repo
- `react-markdown` + `remark-gfm` — render blog Markdown

Lý do chọn stack này: xem PRD.md mục 5.

## Bắt đầu

### 1. Cài dependency

```bash
npm install
```

### 2. Tạo project Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com).
2. Bật GitHub làm OAuth provider: **Authentication → Providers → GitHub**.
3. Áp schema: mở **SQL Editor**, dán nội dung [`supabase/schema.sql`](./supabase/schema.sql) và chạy — hoặc `npx supabase db push` nếu dùng Supabase CLI.
4. Copy `.env.example` thành `.env.local` và điền `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` từ **Project Settings → API**.
5. (Tuỳ chọn) Thêm `GITHUB_TOKEN` (personal access token) để nâng rate limit khi fetch metadata repo — xem PRD.md mục 6.

### 3. Chạy dev server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Cấu trúc thư mục

```
src/
  app/                  # Route Handlers + trang (App Router)
    api/repos/lookup/    # POST: fetch metadata GitHub cho tính năng "Share a repo"
  lib/
    supabase/           # Supabase client (browser + server)
    github.ts           # Wrapper Octokit để fetch metadata repo
  middleware.ts         # Refresh session Supabase trên mỗi request
supabase/
  schema.sql            # Schema Postgres: profiles, content_items, posts,
                         # projects, repos, tags, likes, comments, bookmarks, follows
```

## Trạng thái

Scaffold ban đầu — theo Phase 1 (MVP) trong [FEATURES.md](./FEATURES.md). Chưa có UI cho auth/editor/feed thật; xem mục "Bước tiếp theo" trong PRD.md.
