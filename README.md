# DevNest

Nền tảng cộng đồng cho developer — blog kỹ thuật, project showcase, và chia sẻ repo hay, trong một feed và một cộng đồng duy nhất.

Xem [PRD.md](./PRD.md) cho tầm nhìn/scope và [FEATURES.md](./FEATURES.md) cho roadmap tính năng.

## Tech stack

- **`client/`** — React 19 + Vite + TypeScript + Tailwind CSS + React Router
- **`server/`** — Node.js + Express + TypeScript
- **Supabase** — Postgres, Auth (GitHub OAuth), Storage — dùng trực tiếp từ `client` (RLS bảo vệ dữ liệu)
- **Octokit** (trong `server`) — gọi GitHub API để lấy metadata repo, giữ `GITHUB_TOKEN` phía server thay vì lộ ra browser

Lý do chọn stack này: xem PRD.md mục 5.

## Cấu trúc thư mục

```
client/            React (Vite) — SPA
  src/
    components/    Navbar, ...
    pages/         Home (feed), ShareRepo
    hooks/         useSession (Supabase auth state)
    lib/           supabaseClient.ts, api.ts (gọi server)
server/            Node.js + Express — API
  src/
    routes/repos.ts   POST /api/repos/lookup — proxy GitHub API (Octokit)
    lib/github.ts     Wrapper Octokit
    index.ts          Express app
supabase/
  schema.sql       Schema Postgres: profiles, content_items, posts,
                   projects, repos, tags, likes, comments, bookmarks, follows
```

## Bắt đầu

### 1. Cài dependency (workspaces — cài một lần ở root)

```bash
npm install
```

### 2. Tạo project Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com).
2. Bật GitHub làm OAuth provider: **Authentication → Providers → GitHub**.
3. Áp schema: mở **SQL Editor**, dán nội dung [`supabase/schema.sql`](./supabase/schema.sql) và chạy — hoặc `npx supabase db push` nếu dùng Supabase CLI.
4. Copy `client/.env.example` → `client/.env.local`, điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` từ **Project Settings → API**.
5. Copy `server/.env.example` → `server/.env`. (Tuỳ chọn) thêm `GITHUB_TOKEN` (personal access token) để nâng rate limit khi fetch metadata repo — xem PRD.md mục 6.

### 3. Chạy dev server

```bash
npm run dev
```

Lệnh này chạy song song `server` (http://localhost:4000) và `client` (http://localhost:5173).

## Trạng thái

Scaffold ban đầu — theo Phase 1 (MVP) trong [FEATURES.md](./FEATURES.md). Đã có: đăng nhập GitHub (Supabase Auth), feed placeholder, và trang "Share repo" gọi thật vào backend Express → GitHub API. Chưa có: blog editor, project showcase, lưu dữ liệu vào Postgres — xem mục "Bước tiếp theo" trong PRD.md.
