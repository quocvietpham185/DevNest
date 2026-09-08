# DevNest — Product Requirements Document

> Nền tảng cộng đồng dành cho developer — nơi đăng blog kỹ thuật, giới thiệu dự án đang xây, chia sẻ repository đáng chú ý và xây dựng một developer profile được liên kết trực tiếp với GitHub.

| | |
|---|---|
| **Phiên bản** | 0.2 |
| **Trạng thái** | Draft / MVP |
| **Ngày** | 08/09/2026 |
| **Phạm vi** | MVP |

---

## Mục lục

1. [Tổng quan & Tầm nhìn](#1-tổng-quan--tầm-nhìn)
2. [Mục tiêu & Thước đo thành công](#2-mục-tiêu--thước-đo-thành-công)
3. [Đối tượng người dùng](#3-đối-tượng-người-dùng)
4. [Phạm vi MVP](#4-phạm-vi-mvp)
5. [Tích hợp GitHub](#5-tích-hợp-github)
6. [Tính năng đề xuất bổ sung](#6-tính-năng-đề-xuất-bổ-sung)
7. [Tech Stack đề xuất](#7-tech-stack-đề-xuất)
8. [Kiến trúc tổng thể](#8-kiến-trúc-tổng-thể)
9. [Mô hình dữ liệu chính](#9-mô-hình-dữ-liệu-chính)
10. [API chính của Backend](#10-api-chính-của-backend)
11. [Yêu cầu phi chức năng](#11-yêu-cầu-phi-chức-năng)
12. [Giả định & Rủi ro](#12-giả-định--rủi-ro)
13. [Roadmap sau MVP](#13-roadmap-sau-mvp)

---

# 1. Tổng quan & Tầm nhìn

Hiện tại, một developer thường rải hoạt động của mình trên nhiều nơi: code trên GitHub, viết blog trên dev.to/Hashnode, share project trên mạng xã hội và tìm cộng đồng ở nhiều nền tảng khác nhau.

**DevNest** gộp ba loại nội dung — blog, project showcase và repository — vào một cộng đồng duy nhất, đồng thời tận dụng GitHub như nguồn dữ liệu kỹ thuật đáng tin cậy cho profile và repository.

### Vấn đề cần giải quyết

Developer cần một nơi để:

- xây dựng thương hiệu cá nhân thông qua bài viết;
- giới thiệu project đang xây dựng và tìm feedback;
- chia sẻ repository đáng chú ý;
- có một profile kỹ thuật liên kết trực tiếp với tài khoản GitHub;
- khám phá nội dung được tạo bởi đúng cộng đồng developer.

### Sứ mệnh của MVP

Chứng minh giả thuyết rằng:

> **Blog + Project + Repository + GitHub Profile có thể cùng tồn tại trong một community feed và tạo thành một vòng lặp “đăng → khám phá → tương tác”.**

MVP ưu tiên validate sản phẩm, không ưu tiên scale lớn hoặc tự động hóa GitHub ở mức sâu.

---

# 2. Mục tiêu & Thước đo thành công

| Chỉ số | Mục tiêu MVP | Ghi chú |
|---|---|---|
| WAU (Weekly Active Users) | 150+ | trong 6 tuần đầu sau launch |
| Bài đăng / tuần | 30+ | blog + project + repo |
| W2 Retention | ≥ 25% | user quay lại tuần thứ 2 |
| Time-to-publish | < 3 phút | từ bắt đầu tạo bài đến publish |
| Tỷ lệ bài có ít nhất 1 tương tác | ≥ 40% | like/comment/bookmark trong 48h |
| Tỷ lệ lỗi API | < 1% | theo dõi qua backend logging |
| Tỷ lệ import GitHub thành công | ≥ 95% | với public repository hợp lệ |
| Tỷ lệ profile GitHub sync thành công | ≥ 95% | sau khi user đăng nhập/liên kết |

Nếu sau 6 tuần W2 Retention dưới 10%, giả thuyết “3 loại nội dung sống chung” cần được xem lại trước khi build thêm tính năng nâng cao.

---

# 3. Đối tượng người dùng

### 3.1 Dev đang xây side-project

Muốn show tiến độ, tìm feedback sớm và thu hút cộng tác viên.

### 3.2 Dev viết blog kỹ thuật

Muốn xây dựng thương hiệu cá nhân và chia sẻ kiến thức với đúng cộng đồng kỹ thuật.

### 3.3 Dev đi khám phá

Muốn tìm repository, project và bài viết chất lượng để học hỏi.

### 3.4 Dev muốn xây dựng developer profile

Muốn biến GitHub + project + blog thành một profile cá nhân tập trung thay vì chỉ có một đường link GitHub đơn lẻ.

---

# 4. Phạm vi MVP

MVP tập trung vào vòng lặp cốt lõi:

```text
Đăng nội dung
      ↓
GitHub/Project information
      ↓
Được khám phá
      ↓
Like / Comment / Bookmark
      ↓
Follow user / tag
```

## 4.1 Trong phạm vi MVP

- Đăng nhập qua GitHub OAuth.
- Đồng bộ thông tin cơ bản từ GitHub vào Profile.
- Profile cá nhân.
- Đăng blog bằng Markdown.
- Đăng Project Showcase.
- Share GitHub Repository.
- Tự động fetch metadata repository từ GitHub.
- Tự động fetch README của repository.
- Hiển thị repository card có thông tin GitHub.
- Cho phép refresh metadata repository.
- Feed: mới nhất / theo tag.
- Like, comment, bookmark.
- Follow user / follow tag.
- Tìm kiếm bài viết, project, repository và user.
- Hiển thị GitHub statistics cơ bản trên profile.
- Pagination / infinite scroll.
- Draft bài viết.
- Report / flag nội dung.
- Sitemap.xml + metadata/OpenGraph động.

## 4.2 Không nằm trong MVP

- Download toàn bộ source code repository về hệ thống.
- Chạy hoặc build source code của repository trên server DevNest.
- Auto-sync roadmap/changelog nâng cao.
- AI phân tích toàn bộ source code.
- Reputation/badge system nâng cao.
- Job board.
- Public API.
- Cross-post Twitter/LinkedIn.
- Real-time notification nâng cao.

---

# 5. Tích hợp GitHub

GitHub là nguồn dữ liệu bên ngoài phục vụ hai nhóm chức năng chính:

```text
GitHub
├── Authentication / Identity
│   └── GitHub OAuth
│
├── User Profile
│   ├── username
│   ├── name
│   ├── avatar
│   ├── bio
│   ├── company
│   ├── location
│   ├── website
│   ├── followers
│   ├── following
│   └── public repositories
│
└── Repository
    ├── metadata
    ├── statistics
    ├── topics
    ├── language
    ├── license
    └── README
```

## 5.1 GitHub OAuth / Login

Người dùng có thể đăng nhập bằng GitHub.

### Flow

```text
User
 ↓
Click "Continue with GitHub"
 ↓
GitHub Authorization
 ↓
GitHub redirect về DevNest
 ↓
Backend xác thực authorization
 ↓
Supabase Auth / User
 ↓
Sync GitHub profile
 ↓
Tạo/cập nhật DevNest profile
```

DevNest chỉ yêu cầu quyền tối thiểu cần thiết cho MVP.

**Nguyên tắc:** không yêu cầu quyền truy cập private repository nếu MVP chưa cần.

---

## 5.2 Đồng bộ GitHub Profile

Sau khi đăng nhập, DevNest lấy thông tin GitHub profile và lưu các trường cần thiết.

### Thông tin có thể đồng bộ

| Field | Mục đích |
|---|---|
| GitHub username | định danh tài khoản |
| Display name | tên hiển thị |
| Avatar | ảnh profile |
| Bio | mô tả |
| Company | thông tin công việc |
| Location | vị trí |
| Website | liên kết ngoài |
| GitHub URL | link GitHub |
| Followers | thống kê |
| Following | thống kê |
| Public repositories | thống kê |
| GitHub account created date | thông tin profile |

### Profile DevNest

Profile không phụ thuộc hoàn toàn vào GitHub. User vẫn có thể bổ sung:

```text
DevNest Profile
├── avatar
├── display name
├── bio
├── location
├── website
├── GitHub username
├── skills / tags
├── blog posts
├── project showcases
├── shared repositories
└── GitHub statistics
```

GitHub được xem là nguồn xác thực và dữ liệu kỹ thuật, còn DevNest lưu thêm các nội dung/community data riêng.

---

## 5.3 Refresh GitHub Profile

User có nút:

```text
[Sync GitHub]
```

Khi click:

```text
DevNest
  ↓
GitHub API
  ↓
Get authenticated user
  ↓
Update profile
```

Không gọi GitHub API mỗi lần profile được mở.

Có thể áp dụng:

- cache profile;
- refresh thủ công;
- refresh định kỳ ở giai đoạn sau.

---

## 5.4 Share Repository

User nhập GitHub URL:

```text
https://github.com/owner/repository
```

Backend thực hiện:

```text
Validate URL
     ↓
Parse owner/repository
     ↓
GitHub API: Get repository
     ↓
Validate repository
     ↓
Get metadata
     ↓
Get README
     ↓
Save/cache in Supabase
     ↓
Create Repo Post
```

### Metadata cần lưu

```text
repo_url
owner
owner_avatar
name
full_name
description
stars
forks
watchers
open_issues
language
languages
topics
license
default_branch
created_at
updated_at
github_updated_at
last_synced_at
```

### UI Repository Card

```text
┌───────────────────────────────────────────┐
│  owner / repository                       │
│                                           │
│  Repository description                   │
│                                           │
│  ⭐ 1.2K   🍴 150   TypeScript            │
│                                           │
│  Topics: react · ai · developer-tools     │
│                                           │
│  [Read README] [View on GitHub]           │
└───────────────────────────────────────────┘
```

---

## 5.5 Lấy README

Khi import repository, backend có thể lấy README từ GitHub.

Flow:

```text
Repository URL
       ↓
Get Repository
       ↓
Get Repository README
       ↓
Decode / parse README
       ↓
Sanitize
       ↓
Store/cache README
       ↓
Render trong DevNest
```

README được sử dụng để:

- tạo preview repository;
- giúp người dùng khám phá project mà không phải rời DevNest;
- hiển thị documentation cơ bản;
- hỗ trợ search nội dung README nếu cần.

### Nguyên tắc

DevNest **không cần download toàn bộ source code**.

Chỉ lấy README và metadata cần thiết.

---

## 5.6 Repository Refresh / Sync

Repository card có:

```text
Last synced: 2 hours ago
[Refresh]
```

Khi refresh:

```text
DevNest DB
    ↓
Kiểm tra last_synced_at
    ↓
Nếu đủ thời gian refresh
    ↓
GitHub API
    ↓
Update metadata + README
```

MVP có thể chọn chiến lược:

- sync khi repo được import;
- refresh thủ công;
- refresh định kỳ 6–12 giờ cho repo đã được sử dụng nhiều.

Không refresh mỗi lần user mở feed.

---

## 5.7 GitHub Repository Cache

GitHub data phải được cache trong Supabase/Postgres.

```text
Client
  ↓
Node.js
  ↓
Supabase Cache
  ↓
Nếu cache còn hợp lệ → trả dữ liệu
  ↓
Nếu hết hạn → GitHub API
  ↓
Update cache
```

Mục đích:

- giảm số request GitHub;
- giảm latency;
- tránh phụ thuộc hoàn toàn vào GitHub trong mỗi page load;
- tránh chạm rate limit.

---

## 5.8 Xử lý repository không hợp lệ

Các trường hợp cần xử lý:

```text
Repo không tồn tại
Repo đã bị xóa
Repo bị đổi tên
Repo URL sai
GitHub timeout
GitHub rate limit
README không tồn tại
README quá lớn / không thể parse
```

Frontend phải hiển thị lỗi có ý nghĩa:

```text
❌ Không tìm thấy repository này.

❌ Không thể đồng bộ GitHub lúc này.

⚠️ README chưa có hoặc không thể tải.

⚠️ GitHub API đang giới hạn request, vui lòng thử lại sau.
```

---

## 5.9 Source Code Repository — không tải trong MVP

MVP **không lưu toàn bộ source code repository**.

```text
GitHub
 └── Source code ← giữ tại GitHub

DevNest
 ├── Repository metadata
 ├── README
 ├── Topics
 └── Cache information
```

Lý do:

- giảm storage;
- giảm độ phức tạp;
- tránh phải đồng bộ version;
- tránh tải dữ liệu không cần thiết;
- phù hợp với mục tiêu MVP.

Việc clone/download source chỉ được xem xét khi DevNest có tính năng phân tích code, AI hoặc các workflow kỹ thuật cần repository contents.

---

# 6. Tính năng đề xuất bổ sung

## 6.1 Nên có ngay trong MVP

| Tính năng | Lý do |
|---|---|
| Onboarding chọn tag | cá nhân hóa feed |
| Draft | tránh mất nội dung |
| Report / Flag | vận hành cộng đồng |
| Pagination / infinite scroll | hiệu năng feed |
| Empty state & error state | UX |
| Dynamic SEO metadata | hỗ trợ index/search |
| GitHub Profile Sync | profile có dữ liệu ngay sau signup |
| Repository README preview | giúp khám phá repo trực tiếp |
| Sync status | cho biết dữ liệu GitHub cập nhật lúc nào |

## 6.2 Có thể làm sau khi có traction

| Tính năng | Mục đích |
|---|---|
| Email digest | tăng retention |
| Dark mode | UX |
| Admin/moderation dashboard | xử lý report |
| Analytics cho tác giả | tăng động lực viết |
| Rate limiting nâng cao | chống spam/bot |
| GitHub activity | hiển thị activity gần đây |
| GitHub pinned repositories | nâng chất lượng profile |
| Project auto-sync | giảm thao tác thủ công |

---

# 7. Tech Stack đề xuất

## 7.1 Frontend

```text
React 18
Vite
TypeScript
Tailwind CSS
React Router
TanStack Query
Zustand
react-helmet-async
react-markdown
shiki
Axios / Fetch
```

## 7.2 Backend

```text
Node.js
Express hoặc NestJS
TypeScript
Octokit
Zod / validation library
Rate limiter
```

Backend chịu trách nhiệm:

- xác thực request;
- business logic;
- gọi GitHub API;
- GitHub profile sync;
- repository import;
- README fetch;
- cache;
- sitemap;
- error handling;
- logging.

## 7.3 Database / Backend Services

```text
Supabase
├── PostgreSQL
├── Auth
├── Storage
└── Realtime
```

## 7.4 GitHub

```text
GitHub OAuth
GitHub REST API
Octokit
```

GitHub được tích hợp chủ yếu qua backend Node.js thay vì để frontend gọi trực tiếp.

---

# 8. Kiến trúc tổng thể

```text
                         ┌─────────────────┐
                         │     GitHub      │
                         │                 │
                         │ OAuth           │
                         │ User API        │
                         │ Repository API  │
                         │ README API      │
                         └────────┬────────┘
                                  │
                               Octokit
                                  │
┌───────────────┐          ┌──────▼───────┐
│ React + Vite  │ REST/JSON│   Node.js    │
│               │─────────>│   Backend    │
│ Feed          │<─────────│              │
│ Profile       │          │ Auth         │
│ Blog          │          │ GitHub       │
│ Project       │          │ Repository   │
│ Repo          │          │ README       │
└───────────────┘          │ Cache        │
                           └──────┬───────┘
                                  │
                                  ▼
                           ┌───────────────┐
                           │   Supabase    │
                           │               │
                           │ PostgreSQL    │
                           │ Auth          │
                           │ Storage       │
                           │ Realtime      │
                           └───────────────┘
```

### GitHub Repository Import Flow

```text
User
 ↓
Enter GitHub URL
 ↓
React
 ↓
POST /api/github/repositories/import
 ↓
Node.js
 ↓
GitHub REST API
 ├── Get repository
 └── Get README
 ↓
Normalize + sanitize
 ↓
Upsert Repository Cache
 ↓
Create Repo Post
 ↓
Supabase
 ↓
React render
```

### GitHub Profile Sync Flow

```text
GitHub OAuth
 ↓
Supabase / Backend authentication
 ↓
GitHub access token
 ↓
GET authenticated user
 ↓
Normalize profile data
 ↓
Upsert DevNest profile
 ↓
User profile page
```

---

# 9. Mô hình dữ liệu chính

## 9.1 users

```text
id
github_user_id
github_username
email
created_at
updated_at
```

## 9.2 profiles

```text
id
user_id
display_name
avatar_url
bio
location
website
github_username
skills
created_at
updated_at
```

## 9.3 posts

```text
id
author_id
type                # blog | project | repo
title
slug
content
cover_image
published_at
created_at
updated_at
```

## 9.4 repositories

```text
id
owner
name
full_name
github_url
description
avatar_url
stars
forks
watchers
open_issues
language
languages
topics
license
default_branch
readme_content
readme_html
github_updated_at
last_synced_at
sync_status
created_at
updated_at
```

## 9.5 post_repositories

Liên kết repository với post.

```text
post_id
repository_id
```

## 9.6 tags

```text
id
name
slug
```

## 9.7 post_tags

```text
post_id
tag_id
```

## 9.8 likes

```text
user_id
post_id
created_at
```

## 9.9 comments

```text
id
user_id
post_id
content
created_at
updated_at
```

## 9.10 bookmarks

```text
user_id
post_id
created_at
```

## 9.11 follows

```text
follower_id
following_user_id
created_at
```

## 9.12 tag_follows

```text
user_id
tag_id
created_at
```

---

# 10. API chính của Backend

## Authentication

```http
GET /api/auth/github
GET /api/auth/github/callback
POST /api/auth/logout
```

## Profile

```http
GET /api/profile/me
PATCH /api/profile/me
POST /api/profile/github/sync
GET /api/profile/:username
```

## GitHub Repository

```http
POST /api/github/repositories/import
GET /api/github/repositories/:id
POST /api/github/repositories/:id/sync
```

## Posts

```http
GET /api/posts
POST /api/posts
GET /api/posts/:slug
PATCH /api/posts/:id
DELETE /api/posts/:id
```

## Interaction

```http
POST /api/posts/:id/like
DELETE /api/posts/:id/like

POST /api/posts/:id/bookmark
DELETE /api/posts/:id/bookmark

POST /api/posts/:id/comments
GET /api/posts/:id/comments
```

## Search

```http
GET /api/search?q=
```

Backend phải chịu trách nhiệm gọi GitHub API. Frontend **không lưu GitHub Client Secret / access token nhạy cảm** và không nên tự gọi GitHub API cho các nghiệp vụ server-side.

---

# 11. Yêu cầu phi chức năng

| Hạng mục | Yêu cầu MVP |
|---|---|
| Hiệu năng | Feed first load < 2.5s trên 4G |
| API | Endpoint đọc phổ biến mục tiêu < 300ms khi dùng cache |
| Bảo mật | RLS bật cho dữ liệu user |
| Markdown | sanitize để chống XSS |
| GitHub token | không expose secret/token nhạy cảm ở frontend |
| GitHub API | cache metadata và README |
| Rate limit | giới hạn request từ client và xử lý GitHub rate limit |
| Reliability | GitHub timeout không làm toàn bộ DevNest lỗi |
| SEO | blog/project/profile có title/meta/OpenGraph |
| Accessibility | keyboard navigation, alt text, contrast cơ bản |
| Responsive | hỗ trợ mobile |
| Logging | log request/error/sync status |
| Observability | theo dõi GitHub API errors và sync failures |

---

# 12. Giả định & Rủi ro

## 12.1 GitHub API rate limit

GitHub có giới hạn request đối với API. Vì vậy DevNest không được thiết kế theo mô hình:

```text
mỗi lượt xem repo
       ↓
gọi GitHub API
```

Mà phải là:

```text
request
 ↓
cache
 ↓
nếu cache hợp lệ → trả ngay
 ↓
nếu hết hạn → refresh GitHub
```

## 12.2 GitHub API không khả dụng

Repository đã import vẫn phải có khả năng hiển thị bằng dữ liệu cache.

```text
GitHub DOWN
   ↓
DevNest
   ↓
Hiển thị cached data
   ↓
"Last synced 5 hours ago"
```

## 12.3 README thay đổi

README cần có `last_synced_at` và trạng thái sync để DevNest có thể cập nhật định kỳ hoặc theo yêu cầu.

## 12.4 OAuth permissions

Chỉ xin quyền GitHub thực sự cần thiết. Không yêu cầu quyền private repository trong MVP nếu tính năng không dùng tới.

## 12.5 Source code quá lớn

Không download full repository trong MVP. Điều này giúp giảm storage, network bandwidth và độ phức tạp đồng bộ.

## 12.6 Cộng đồng trống khi ra mắt

Tự mồi 20–30 bài chất lượng trước khi mời user đầu tiên.

## 12.7 SEO với React SPA

React SPA có hạn chế đối với SEO. MVP sử dụng dynamic meta tags, sitemap và các biện pháp pre-render nếu cần. Nếu SEO trở thành kênh tăng trưởng chính, có thể chuyển các route public sang framework SSR ở giai đoạn sau.

---

# 13. Roadmap sau MVP

## Phase 1 — MVP

```text
✅ GitHub OAuth
✅ GitHub Profile Sync
✅ Blog
✅ Project Showcase
✅ Repository Import
✅ Repository Metadata
✅ README Import
✅ Repository Cache
✅ Feed
✅ Like / Comment / Bookmark
✅ Follow
✅ Search
✅ Profile
```

## Phase 2 — GitHub sâu hơn

```text
🔜 GitHub activity
🔜 Pinned repositories
🔜 Repository sync tự động
🔜 Commit / release information
🔜 Changelog integration
🔜 GitHub webhook
```

## Phase 3 — AI & Developer Intelligence

```text
🔜 AI đọc README
🔜 AI tạo project summary
🔜 AI tạo project tags
🔜 AI phân tích cấu trúc repository
🔜 AI hỗ trợ viết documentation
```

## Phase 4 — Community Platform

```text
🔜 Reputation
🔜 Badge
🔜 Job board
🔜 Collaboration
🔜 Public API
🔜 Cross-posting
```

---

# Kết luận kiến trúc GitHub cho DevNest

GitHub trong DevNest đóng vai trò **identity provider + nguồn dữ liệu kỹ thuật**, không phải nơi để DevNest sao chép toàn bộ source code.

```text
GitHub
├── OAuth
│   └── Login / Identity
│
├── User API
│   └── Profile Sync
│
└── Repository API
    ├── Repository metadata
    ├── Stars / Forks
    ├── Languages
    ├── Topics
    ├── License
    └── README
            ↓
        Node.js
            ↓
        Cache / Normalize
            ↓
        Supabase
            ↓
        DevNest UI
```

MVP chỉ lưu những dữ liệu cần thiết để tạo trải nghiệm khám phá repository tốt. **Full source code vẫn nằm trên GitHub** và người dùng có thể chuyển sang GitHub bằng nút `View on GitHub`.

