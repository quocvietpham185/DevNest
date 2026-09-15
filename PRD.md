# DevNest — Product Requirements Document

> Nền tảng cộng đồng dành cho developer — nơi viết blog kỹ thuật, giới thiệu dự án đang xây, hỏi đáp/thảo luận, và chia sẻ repository đáng chú ý.

| | |
|---|---|
| **Phiên bản** | 1.0 |
| **Trạng thái** | Draft / MVP |
| **Ngày** | 15/09/2026 |
| **Phạm vi** | MVP |

> Đây là bản viết lại từ đầu, thay thế hoàn toàn v0.1 và v0.2. Thay đổi lớn nhất so với v0.2: **GitHub không còn là điều kiện bắt buộc** để dùng DevNest, và tích hợp GitHub được đơn giản hoá mạnh cho MVP — xem mục 5 và mục 12 để biết lý do.

---

## Mục lục

1. [Tổng quan & Tầm nhìn](#1-tổng-quan--tầm-nhìn)
2. [Mục tiêu & Thước đo thành công](#2-mục-tiêu--thước-đo-thành-công)
3. [Đối tượng người dùng](#3-đối-tượng-người-dùng)
4. [Phạm vi MVP](#4-phạm-vi-mvp)
5. [Tích hợp GitHub (đã đơn giản hoá)](#5-tích-hợp-github-đã-đơn-giản-hoá)
6. [Tech Stack](#6-tech-stack)
7. [Kiến trúc tổng thể](#7-kiến-trúc-tổng-thể)
8. [Mô hình dữ liệu](#8-mô-hình-dữ-liệu)
9. [API chính của Backend](#9-api-chính-của-backend)
10. [Yêu cầu phi chức năng](#10-yêu-cầu-phi-chức-năng)
11. [Giả định & Rủi ro](#11-giả-định--rủi-ro)
12. [Vì sao đơn giản hoá GitHub integration](#12-vì-sao-đơn-giản-hoá-github-integration)
13. [Roadmap sau MVP](#13-roadmap-sau-mvp)

---

# 1. Tổng quan & Tầm nhìn

Một developer thường rải hoạt động của mình trên nhiều nơi: code trên GitHub, viết blog trên dev.to/Hashnode, hỏi đáp trên Stack Overflow, share project trên mạng xã hội. **DevNest** gộp bốn hoạt động này vào một cộng đồng duy nhất:

```text
Blog          — viết & đọc bài kỹ thuật
Project       — giới thiệu dự án đang xây, tìm feedback/cộng tác viên
Q&A           — hỏi đáp, thảo luận kỹ thuật
Repo          — chia sẻ repository đáng chú ý (không bắt buộc phải có GitHub)
```

**GitHub trong DevNest chỉ là một lựa chọn, không phải điều kiện bắt buộc**: user có thể đăng ký bằng email/password bình thường, và "chia sẻ repo" chỉ đơn giản là dán một đường link kèm ghi chú — không cần kết nối tài khoản GitHub. Đây là thay đổi có chủ đích so với bản nháp trước (xem mục 12) để cộng đồng không bị bó hẹp vào riêng hệ sinh thái GitHub.

### Vấn đề cần giải quyết

Developer cần một nơi để:
- xây dựng thương hiệu cá nhân thông qua bài viết;
- giới thiệu project đang xây dựng và tìm feedback;
- đặt câu hỏi kỹ thuật và giúp người khác trả lời;
- chia sẻ repository/công cụ đáng chú ý;
- khám phá nội dung được tạo bởi đúng cộng đồng developer, không lẫn với mạng xã hội chung.

### Sứ mệnh của MVP

Chứng minh giả thuyết rằng:

> **Blog + Project + Q&A + Repo có thể cùng tồn tại trong một community feed và tạo thành một vòng lặp "đăng → khám phá → tương tác", mà không cần bắt buộc mọi hoạt động phải đi qua GitHub.**

MVP ưu tiên validate sản phẩm với chi phí vận hành backend thấp — không đầu tư vào tích hợp GitHub sâu trước khi biết cộng đồng có thực sự cần nó hay không.

---

# 2. Mục tiêu & Thước đo thành công

| Chỉ số | Mục tiêu MVP | Ghi chú |
|---|---|---|
| WAU (Weekly Active Users) | 150+ | trong 6 tuần đầu sau launch |
| Bài đăng / tuần | 30+ | blog + project + Q&A + repo cộng lại |
| W2 Retention | ≥ 25% | user quay lại tuần thứ 2 |
| Time-to-publish | < 3 phút | từ bắt đầu tạo bài đến publish |
| Tỷ lệ bài có ít nhất 1 tương tác | ≥ 40% | like/comment/bookmark trong 48h |
| Tỷ lệ câu hỏi Q&A có câu trả lời | ≥ 50% | trong 72h sau khi đăng |
| Tỷ lệ lỗi API | < 1% | theo dõi qua backend logging |

Nếu sau 6 tuần W2 Retention dưới 10%, giả thuyết "4 loại nội dung sống chung" cần được xem lại trước khi build thêm tính năng nâng cao.

---

# 3. Đối tượng người dùng

### 3.1 Dev đang xây side-project
Muốn show tiến độ, tìm feedback sớm và thu hút cộng tác viên.

### 3.2 Dev viết blog kỹ thuật
Muốn xây dựng thương hiệu cá nhân và chia sẻ kiến thức với đúng cộng đồng kỹ thuật. Đây là nhóm nội dung được ưu tiên nhất trong DevNest.

### 3.3 Dev cần giúp đỡ / thích trả lời câu hỏi
Muốn đặt câu hỏi kỹ thuật cụ thể, hoặc giúp người khác giải quyết vấn đề để xây uy tín trong cộng đồng.

### 3.4 Dev đi khám phá
Muốn tìm repository, project và bài viết chất lượng để học hỏi — không nhất thiết phải có tài khoản GitHub.

---

# 4. Phạm vi MVP

Vòng lặp cốt lõi:

```text
Đăng nội dung (blog / project / Q&A / repo)
      ↓
Được khám phá (feed, tag, search)
      ↓
Được tương tác (like / comment / bookmark)
      ↓
Follow user / tag → quay lại feed
```

## 4.1 Trong phạm vi MVP

**Auth & Profile**
- Đăng ký / đăng nhập bằng **email + password** hoặc **GitHub OAuth** — cả hai đều là lựa chọn ngang hàng, không bắt buộc GitHub.
- Nếu đăng nhập qua GitHub: lấy avatar + username làm giá trị mặc định ban đầu (không đồng bộ sâu thêm followers/company/location...).
- Onboarding lần đầu: chọn 3–5 tag quan tâm để cá nhân hoá feed.
- Trang profile công khai: thông tin cơ bản + danh sách Blog/Project/Q&A/Repo đã đăng.
- Trang chỉnh sửa profile (bio, avatar, website, skills).
- Đăng xuất.

**Blog** (trọng tâm chính của cộng đồng)
- Editor Markdown (soạn + xem trước song song), upload ảnh.
- Gắn tag (tối đa 5), lưu draft / publish.
- Trang đọc bài: syntax highlighting cho code block, ước tính thời gian đọc, SEO meta/OpenGraph động.
- Sửa / xoá bài đã đăng.

**Project Showcase**
- Form tạo project: tên, mô tả, tech stack (tag), link repo/demo, ảnh cover.
- Trạng thái: Đang phát triển / Hoàn thành / Tìm cộng tác viên.
- Trang chi tiết, sửa/xoá.

**Q&A / Thảo luận**
- Đăng câu hỏi: title + nội dung Markdown + tag.
- Trả lời câu hỏi (dạng comment gắn vào câu hỏi).
- Người hỏi có thể đánh dấu 1 câu trả lời là **Best answer**.
- Trạng thái câu hỏi: Chưa giải quyết / Đã giải quyết.
- Sắp xếp danh sách câu hỏi: mới nhất / nhiều câu trả lời nhất.

**Repo Share** (đơn giản — xem mục 5 và 12 để biết lý do)
- Dán link GitHub repo, tự nhập title/mô tả/ghi chú cá nhân ("vì sao repo này hay").
- Tuỳ chọn: fetch nhẹ một lần lúc submit (tên, mô tả, stars, ngôn ngữ chính) để gợi ý điền sẵn form — **không bắt buộc**, và nếu fetch lỗi/timeout thì vẫn cho đăng bằng thông tin tự nhập.
- Không cache, không refresh định kỳ, không fetch README ở MVP.

**Feed & Khám phá**
- Feed mới nhất, lọc theo tag.
- Phân biệt rõ 4 loại nội dung (blog/project/Q&A/repo) bằng nhãn/màu khác nhau trên card.
- Pagination / infinite scroll.
- Empty state & error state.

**Tương tác xã hội**
- Like, bình luận (phẳng, riêng Q&A có thêm "đánh dấu best answer"), bookmark.
- Follow user, follow tag.

**Tìm kiếm**
- Full-text search (Postgres `tsvector`) trên cả 4 loại nội dung + username.
- Trang kết quả có filter theo loại nội dung.

**Vận hành**
- Report/flag nội dung.
- Sitemap.xml + metadata/OpenGraph động.
- Logging request/error cơ bản.

## 4.2 Không nằm trong MVP

- Auto-sync GitHub profile (followers, company, location, public repos...).
- Cache + refresh định kỳ metadata repo, fetch/hiển thị README trong app, xử lý rate-limit GitHub nâng cao.
- GitHub activity, pinned repositories, GitHub webhook.
- Download/chạy source code repository trên server DevNest.
- AI phân tích code/README, reputation & badge nâng cao, job board, public API, cross-post Twitter/LinkedIn, real-time notification nâng cao.

---

# 5. Tích hợp GitHub (đã đơn giản hoá)

So với bản nháp trước, GitHub chỉ còn giữ **hai vai trò nhỏ** ở MVP:

```text
1. GitHub OAuth — một trong hai lựa chọn đăng nhập (song song email/password)
2. Repo Share   — gợi ý điền sẵn form bằng một lần fetch nhẹ (tuỳ chọn, không bắt buộc)
```

### 5.1 GitHub OAuth (tuỳ chọn)

```text
User
 ↓
Chọn "Đăng nhập bằng email" HOẶC "Continue with GitHub"
 ↓
Supabase Auth xử lý cả hai phương thức
 ↓
Nếu GitHub: lấy avatar + username làm giá trị mặc định
 ↓
Tạo profile DevNest (áp dụng chung cho cả 2 phương thức đăng nhập)
```

Không xin quyền GitHub nào ngoài thông tin public cơ bản (username, avatar, email công khai nếu có).

### 5.2 Repo Share — fetch nhẹ, không bắt buộc

```text
User dán link GitHub repo
 ↓
Backend thử gọi GitHub API 1 lần (timeout ngắn, vd. 3s)
 ↓
Thành công → điền sẵn tên/mô tả/stars/ngôn ngữ vào form (user vẫn sửa được)
 ↓
Thất bại/timeout/rate limit → form vẫn mở, user tự nhập tay, không chặn việc đăng bài
```

Không có bước cache, không có job refresh định kỳ, không lưu README. Metadata được lưu **đúng một lần** tại thời điểm đăng, y như dữ liệu blog/project khác — nếu sau này số liệu (stars...) đổi thì đã cũ, và điều đó chấp nhận được ở MVP.

Xem mục 12 để biết đầy đủ lý do vì sao MVP không làm sâu hơn phần này.

---

# 6. Tech Stack

## 6.1 Frontend (`client/`)
```text
React 19
Vite
TypeScript
Tailwind CSS
React Router
react-markdown + remark-gfm
```

## 6.2 Backend (`server/`)
```text
Node.js
Express
TypeScript
Octokit          — chỉ dùng cho fetch nhẹ một lần ở Repo Share (mục 5.2)
```

Backend chịu trách nhiệm: business logic cần giữ bí mật (GitHub token khi fetch metadata), validate input, và mọi thao tác cần bỏ qua RLS.

Phần lớn CRUD (đăng bài, like, comment, follow...) gọi thẳng từ React sang Supabase, được bảo vệ bằng Row Level Security — không cần qua Node cho mọi request.

## 6.3 Database / Backend Services
```text
Supabase
├── PostgreSQL   — dữ liệu chính, full-text search
├── Auth         — email/password VÀ GitHub OAuth provider
└── Storage      — ảnh cover/avatar
```

---

# 7. Kiến trúc tổng thể

```text
┌───────────────┐          ┌──────────────┐          ┌───────────────┐
│  React + Vite │  REST    │   Node.js    │  Octokit │    GitHub     │
│               │─────────>│   (Express)  │─────────>│  REST API     │
│  Feed/Blog/   │          │              │          │ (fetch nhẹ,   │
│  Project/Q&A  │          │  Repo Share  │<─────────│  không cache) │
│  Repo/Profile │          │  fetch nhẹ   │          └───────────────┘
└───────┬───────┘          └──────────────┘
        │
        │ CRUD trực tiếp qua RLS (auth, posts, like, comment, follow, search)
        ▼
┌────────────────────┐
│      Supabase       │
│ Postgres · Auth ·   │
│ Storage             │
└────────────────────┘
```

---

# 8. Mô hình dữ liệu

Dùng một bảng cha chung `content_items` cho cả 4 loại nội dung — feed, tag, like, comment, bookmark, search chỉ cần biết `content_items`, không cần quan tâm loại nội dung cụ thể là gì. Mỗi loại nội dung có một bảng con riêng chỉ chứa field đặc thù của nó (khớp đúng `supabase/schema.sql` hiện có, cộng thêm bảng `questions` mới cho Q&A).

```text
content_items (id, author_id, kind, title, search_vector, created_at, updated_at)
  kind ∈ {'post', 'project', 'repo', 'question'}
  │
  ├── posts        (body_markdown, cover_image_url, published, published_at)
  ├── projects      (description, status, repo_url, demo_url, cover_image_url)
  ├── repos         (github_url, owner, name, description, stars, primary_language, note)
  └── questions      (body_markdown, status, accepted_comment_id)   ← MỚI, chưa có trong schema.sql

content_tags   (content_id, tag_id)
tags           (id, name, slug)
likes          (user_id, content_id)
comments       (id, content_id, author_id, body, created_at, is_accepted_answer)
bookmarks      (user_id, content_id)
user_follows   (follower_id, followee_id)
tag_follows    (user_id, tag_id)
profiles       (id, username, github_username, avatar_url, bio)
```

> **Việc cần làm khi bắt đầu code Q&A** (không nằm trong lượt sửa tài liệu này): thêm bảng `questions`, mở rộng `content_items_kind_check` để nhận `'question'`, và thêm cột `is_accepted_answer boolean` vào `comments` — cập nhật `supabase/schema.sql` + RLS policy tương ứng.

---

# 9. API chính của Backend

Phần lớn thao tác gọi thẳng Supabase từ client (xem mục 6.2). Backend Node chỉ cần các route sau:

```http
POST /api/repos/lookup       # fetch nhẹ metadata GitHub cho Repo Share (đã có, server/src/routes/repos.ts)
GET  /api/health
```

Mọi CRUD khác (posts, projects, questions, repos, likes, comments, bookmarks, follows, search) đi thẳng qua Supabase client SDK với RLS, không cần route Express riêng ở MVP.

---

# 10. Yêu cầu phi chức năng

| Hạng mục | Yêu cầu MVP |
|---|---|
| Hiệu năng | Feed first load < 2.5s trên 4G |
| Bảo mật | RLS bật cho mọi bảng chứa dữ liệu user |
| Markdown | Sanitize để chống XSS |
| GitHub token | Không expose secret/token nhạy cảm ở frontend |
| Repo Share | Timeout fetch GitHub ngắn (≤ 3s), không chặn luồng đăng bài khi lỗi |
| SEO | Blog/project/Q&A/profile có title/meta/OpenGraph |
| Accessibility | Keyboard navigation, alt text, contrast cơ bản |
| Responsive | Hỗ trợ mobile |
| Logging | Log request/error cơ bản |

---

# 11. Giả định & Rủi ro

## 11.1 Cộng đồng trống khi ra mắt
Tự mồi 20–30 bài chất lượng (đa dạng cả 4 loại nội dung, không chỉ repo) trước khi mời user đầu tiên.

## 11.2 SEO với React SPA
React SPA có hạn chế với SEO. MVP dùng dynamic meta tags + sitemap. Nếu SEO trở thành kênh tăng trưởng chính, có thể chuyển route công khai sang SSR ở giai đoạn sau.

## 11.3 Chất lượng dữ liệu Repo Share
Vì không cache/refresh, số liệu (stars...) của repo đã share sẽ cũ dần theo thời gian — chấp nhận được ở MVP, ghi rõ "Dữ liệu tại thời điểm chia sẻ" trên UI để không gây hiểu nhầm.

## 11.4 Q&A có thể không đủ câu trả lời lúc đầu
Nếu cộng đồng nhỏ, câu hỏi có thể không được trả lời kịp. Cần theo dõi chỉ số "tỷ lệ câu hỏi có câu trả lời" (mục 2) và cân nhắc cơ chế nhắc người follow tag liên quan nếu tỷ lệ thấp.

---

# 12. Vì sao đơn giản hoá GitHub integration

Bản nháp trước bắt buộc đăng nhập bằng GitHub OAuth và tự động đồng bộ toàn bộ GitHub profile, cache + refresh định kỳ metadata mọi repo, và fetch/hiển thị README — tương đương một hệ thống cache/sync riêng phải vận hành 24/7. Sau khi rà lại, hai vấn đề khiến phần này **chưa khả thi cho MVP**:

1. **Quá nhiều việc backend so với giá trị chứng minh được**: cần Octokit + tầng cache Postgres + job refresh định kỳ + xử lý đủ loại lỗi (repo bị xoá/đổi tên, README quá lớn, GitHub timeout...) — trong khi MVP chỉ cần biết "cộng đồng có thích tính năng share repo hay không", không cần dữ liệu GitHub luôn mới nhất.
2. **Rủi ro rate limit khi scale**: GitHub giới hạn 5.000 request/giờ dù đã xác thực. Một cơ chế refresh định kỳ cho *mọi* repo đã share sẽ chạm giới hạn này rất nhanh khi số lượng repo tăng, và việc xử lý đúng đắn (backoff, hàng đợi, cache invalidation) là một hạng mục kỹ thuật riêng, không nên làm trước khi biết tính năng có được dùng nhiều hay không.

Ngoài ra, bắt buộc GitHub OAuth để đăng nhập vô tình giới hạn cộng đồng chỉ còn dev có tài khoản GitHub công khai quen thuộc, trong khi DevNest muốn là nơi cho **mọi loại nội dung developer** (kể cả Q&A không liên quan gì đến một repo cụ thể).

→ MVP giữ lại đúng phần giá trị cốt lõi (dán link + ghi chú cá nhân, có gợi ý điền sẵn nếu GitHub API sẵn sàng), và dời toàn bộ phần vận hành phức tạp sang **Phase 2 — GitHub sâu hơn** (mục 13), sau khi đã có dữ liệu thực tế về mức độ dùng tính năng.

---

# 13. Roadmap sau MVP

## Phase 1 — MVP
```text
✅ Auth: email/password + GitHub OAuth (tuỳ chọn)
✅ Blog, Project Showcase, Q&A, Repo Share (đơn giản)
✅ Feed, Tag, Search
✅ Like / Comment / Bookmark / Follow
✅ Profile
```

## Phase 2 — GitHub sâu hơn
```text
🔜 Auto-sync GitHub profile (followers, company, location, public repos)
🔜 Cache + refresh định kỳ metadata repo
🔜 Fetch & hiển thị README trong app
🔜 GitHub activity, pinned repositories
🔜 GitHub webhook
🔜 Rate-limit handling nâng cao (queue, backoff)
```

## Phase 3 — AI & Developer Intelligence
```text
🔜 AI đọc README, tạo project summary
🔜 AI gợi ý tag
🔜 AI hỗ trợ viết documentation
```

## Phase 4 — Community Platform
```text
🔜 Reputation / Badge (đặc biệt hữu ích cho Q&A)
🔜 Job board
🔜 Public API
🔜 Cross-posting
```
