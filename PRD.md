# DevNest — Product Requirements Document

> Nền tảng cộng đồng cho developer — nơi đăng blog kỹ thuật, giới thiệu dự án đang xây, và chia sẻ những repo mã nguồn đáng chú ý, trong một cộng đồng duy nhất.

| | |
|---|---|
| **Phiên bản** | 0.1 |
| **Trạng thái** | Draft |
| **Ngày** | 08/09/2026 |
| **Phạm vi** | MVP |

## Mục lục

1. [Tổng quan & Tầm nhìn](#1-tổng-quan--tầm-nhìn)
2. [Mục tiêu & Thước đo thành công](#2-mục-tiêu--thước-đo-thành-công)
3. [Đối tượng người dùng](#3-đối-tượng-người-dùng)
4. [Phạm vi MVP](#4-phạm-vi-mvp)
5. [Tech Stack đề xuất](#5-tech-stack-đề-xuất)
6. [Giả định & Rủi ro](#6-giả-định--rủi-ro)
7. [Bước tiếp theo](#7-bước-tiếp-theo)

---

## 1. Tổng quan & Tầm nhìn

Hiện tại, một developer phải rải hoạt động của mình trên nhiều nơi: code trên GitHub, viết blog trên dev.to/Hashnode, share repo hay trên Twitter/Reddit, launch dự án trên Product Hunt. **DevNest** gộp ba loại nội dung — blog, project showcase, repo chia sẻ — vào một cộng đồng, một hồ sơ cá nhân duy nhất.

**Vấn đề cần giải quyết:** dev không có một nơi duy nhất để vừa xây dựng thương hiệu cá nhân (viết lách), vừa show sản phẩm đang làm (tìm feedback/cộng tác viên), vừa khám phá công cụ hay do cộng đồng chọn lọc — thay vì thuật toán mạng xã hội chung chung.

**Sứ mệnh của bản MVP:** chứng minh giả thuyết rằng ba loại nội dung này có thể cùng sống trong một feed, được cùng một nhóm người dùng tương tác, mà không cần thêm tính năng phức tạp.

## 2. Mục tiêu & Thước đo thành công

Mục tiêu của giai đoạn MVP là **validate**, không phải scale. Các chỉ số dưới đây dùng để quyết định có đầu tư tiếp hay pivot, không phải để báo cáo tăng trưởng.

| Chỉ số | Mục tiêu MVP | Ghi chú |
|---|---|---|
| WAU (Weekly Active Users) | 150+ | trong 6 tuần đầu sau launch |
| Bài đăng / tuần | 30+ | blog + project + repo cộng lại |
| W2 Retention | ≥ 25% | user quay lại tuần thứ 2 |
| Time-to-publish | < 3 phút | từ lúc bấm "đăng bài" đến publish |

Nếu sau 6 tuần retention tuần 2 dưới 10%, giả thuyết "3 loại nội dung sống chung" cần được xem lại trước khi build thêm tính năng nâng cao.

## 3. Đối tượng người dùng

- **Dev đang xây side-project** — Muốn show tiến độ, tìm feedback sớm và cộng tác viên, thay vì đợi đến khi "hoàn chỉnh" mới dám launch.
- **Dev viết blog kỹ thuật** — Muốn xây thương hiệu cá nhân, viết bài dễ (Markdown), được đọc bởi đúng cộng đồng kỹ thuật thay vì thuật toán social ngẫu nhiên.
- **Dev đi khám phá** — Muốn tìm repo hay, project thú vị, hoặc bài viết chất lượng để học — tin tưởng nội dung được cộng đồng dev thật chọn lọc.

## 4. Phạm vi MVP

Theo yêu cầu, các tính năng nâng cao (auto-sync roadmap, reputation, job board, AI, API công khai...) được **để lại cho giai đoạn sau**. MVP chỉ tập trung vào vòng lặp cốt lõi: `đăng nội dung → được khám phá → được tương tác`.

### ✓ Trong phạm vi MVP

- Đăng nhập qua GitHub OAuth
- Đăng blog (Markdown editor)
- Đăng Project Showcase
- Share repo (tự fetch metadata GitHub)
- Feed: mới nhất / theo tag
- Like, comment, bookmark
- Follow user / follow tag
- Tìm kiếm (bài viết, project, repo, user)
- Trang profile cá nhân

### — Để dành sau

- Auto-sync roadmap/changelog dự án
- Reputation & badge system
- Job board / tìm cộng tác viên nâng cao
- Gợi ý & tóm tắt bằng AI
- API công khai cho bên thứ ba
- Notification realtime nâng cao
- Cross-post sang Twitter/LinkedIn

## 5. Tech Stack đề xuất

Đề xuất ban đầu: **React + Node + Firebase/Supabase**. Hướng đó đúng, chỉ cần chốt cụ thể hai điểm: framework React nào, và Firebase hay Supabase.

> **Quyết định:** Dùng **Next.js** (không phải React thuần/CRA/Vite) và **Supabase** (không phải Firebase). Không cần dựng server Node riêng cho MVP — Next.js API Route Handlers đảm nhiệm phần "Node backend".

### Vì sao Next.js thay vì React SPA thuần

DevNest là nền tảng nội dung (blog, project) — cần được Google index tốt. React thuần (Vite/CRA) render phía client, SEO yếu. Next.js hỗ trợ SSR/SSG sẵn, mỗi bài blog/project có một URL render sẵn nội dung — quan trọng để nội dung được tìm thấy qua tìm kiếm, không chỉ qua feed nội bộ.

### Vì sao Supabase thay vì Firebase

Dữ liệu của DevNest mang tính quan hệ rõ: user — post — project — repo — tag — like — comment — follow, nhiều bảng tham chiếu lẫn nhau và cần join, full-text search, đếm/aggregate. Đây là bài toán Postgres (Supabase) giải tự nhiên hơn Firestore (NoSQL, join thủ công phía client, dễ phình chi phí đọc).

| Tiêu chí | Firebase | Supabase |
|---|---|---|
| Mô hình dữ liệu | NoSQL (Firestore) — phải denormalize, join thủ công | **Postgres — quan hệ, join, transaction thật** |
| Tìm kiếm nội dung | Cần dịch vụ ngoài (Algolia) ngay từ đầu | **Full-text search có sẵn trong Postgres cho MVP** |
| Auth + GitHub OAuth | Có, ổn định | **Có, tương đương, tích hợp thẳng với RLS** |
| Bảo mật theo hàng dữ liệu | Security Rules (cú pháp riêng, dễ sai) | **Row Level Security bằng SQL chuẩn** |
| Realtime (comment/like) | Có | **Có, trên cùng Postgres đang dùng** |
| Rủi ro khóa nhà cung cấp | Thấp | Thấp hơn — Postgres chuẩn, có thể tự host sau này |

### Kiến trúc tổng thể

```
Client
  Next.js 14+ (App Router) · TypeScript · Tailwind CSS
  react-markdown / MDX + shiki cho code block trong blog & README preview
        │
        ▼
Backend logic
  Next.js Route Handlers (thay cho server Node riêng)
  Gọi GitHub API qua Octokit để lấy metadata repo (stars, ngôn ngữ, README)
        │
        ▼
Data / Auth / Storage
  Supabase — Postgres (dữ liệu quan hệ) · Auth với GitHub OAuth · Storage cho ảnh
        │
        ▼
Bên ngoài
  GitHub REST API — nguồn metadata repo, cần cache để tránh chạm rate limit
```

### Danh sách công nghệ cụ thể

`Next.js 14` · `TypeScript` · `Tailwind CSS` · `Supabase (Postgres)` · `Supabase Auth · GitHub OAuth` · `Supabase Storage` · `Octokit` · `react-markdown + shiki` · `Postgres tsvector search` · `Vercel hosting`

Khi nào mới cần một server Node riêng: nếu về sau có cron job nặng, hàng đợi xử lý, hoặc webhook liên tục từ GitHub — lúc đó thêm một service Node nhỏ (Railway/Fly.io) chạy song song, không phải viết lại kiến trúc chính.

## 6. Giả định & Rủi ro

**Giả định:** gần như mọi người dùng mục tiêu đã có tài khoản GitHub — hợp lý vì đối tượng là developer, và OAuth GitHub là bắt buộc chứ không phải một lựa chọn phụ.

- **Rủi ro — GitHub rate limit:** GitHub API giới hạn 5.000 request/giờ cho request đã xác thực. Nếu fetch metadata repo real-time mỗi lần trang được xem sẽ chạm limit nhanh. → Cache metadata repo trong Postgres, chỉ refresh định kỳ (vd. mỗi 6–12 giờ) hoặc khi user chủ động bấm "cập nhật".
- **Rủi ro — Cộng đồng trống khi ra mắt:** Nền tảng cộng đồng chết nếu ra mắt trống trơn (bài toán con gà quả trứng). → Cần tự mồi 20–30 bài chất lượng (blog/project/repo) trước khi mời người dùng đầu tiên.
- **Rủi ro — Full-text search giới hạn:** Postgres full-text search đủ tốt ở quy mô nhỏ nhưng sẽ đuối khi nội dung lớn hoặc cần tìm kiếm ngữ nghĩa. → Đây là điểm nâng cấp sang Meilisearch/Algolia ở giai đoạn sau, không chặn MVP.

## 7. Bước tiếp theo

1. Chốt PRD này (bản 0.1) trước khi đi sâu vào phân tích yêu cầu.
2. **Requirements Analysis:** liệt kê yêu cầu chức năng theo từng nhóm (Auth, Blog, Project, Repo, Social, Search) và yêu cầu phi chức năng (hiệu năng, bảo mật, SEO).
3. **User Stories & Acceptance Criteria** cho từng epic trong phạm vi MVP.
4. **Feature Specification** chi tiết cho các tính năng lõi (editor Markdown, repo card auto-fetch, feed, search).
5. Thiết kế schema Postgres (`users`, `posts`, `projects`, `repos`, `tags`, `likes`, `comments`, `follows`) trên Supabase.
