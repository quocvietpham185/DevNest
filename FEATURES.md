# DevNest — Feature Roadmap

> Kế hoạch tính năng chia theo giai đoạn, khớp [PRD.md](./PRD.md) v1.0. Phạm vi hiện tại chỉ build **Phase 1 (MVP)**; Phase 2-4 để tham khảo định hướng, chưa lên lịch cụ thể.

| Giai đoạn | Mục tiêu |
|---|---|
| **Phase 1 — MVP** | Vòng lặp cốt lõi: đăng nội dung (blog/project/Q&A/repo) → được khám phá → được tương tác |
| **Phase 2 — GitHub sâu hơn** | Auto-sync profile, cache/refresh repo, README, activity — chỉ làm sau khi có dữ liệu thực tế cho thấy đáng đầu tư |
| **Phase 3 — AI** | Gợi ý & tóm tắt bằng AI |
| **Phase 4 — Community Platform** | Reputation, job board, API công khai |

---

## Phase 1 — MVP

### Auth & Profile
- [ ] Đăng ký/đăng nhập bằng **email + password**
- [ ] Đăng nhập bằng **GitHub OAuth** (lựa chọn song song, không bắt buộc)
- [ ] Nếu đăng nhập qua GitHub: lấy avatar + username làm giá trị mặc định (không sync sâu thêm)
- [ ] Onboarding lần đầu: chọn 3–5 tag quan tâm
- [ ] Trang profile công khai: thông tin cơ bản + danh sách Blog/Project/Q&A/Repo đã đăng
- [ ] Trang chỉnh sửa profile (bio, avatar, website, skills)
- [ ] Đăng xuất

### Blog (trọng tâm chính)
- [ ] Editor Markdown (soạn + xem trước song song)
- [ ] Upload ảnh trong bài viết (Supabase Storage)
- [ ] Gắn tag cho bài viết (tối đa 5)
- [ ] Lưu nháp (draft) / xuất bản (publish)
- [ ] Trang đọc bài viết: syntax highlighting, ước tính thời gian đọc, SEO meta/OpenGraph động
- [ ] Sửa / xoá bài viết đã đăng

### Project Showcase
- [ ] Form tạo project: tên, mô tả, tech stack (tag), link repo, link demo, ảnh cover
- [ ] Trạng thái project: Đang phát triển / Hoàn thành / Tìm cộng tác viên
- [ ] Trang chi tiết project
- [ ] Sửa / xoá project đã đăng

### Q&A / Thảo luận (mới)
- [ ] Đăng câu hỏi: title + nội dung Markdown + tag
- [ ] Trả lời câu hỏi (comment gắn vào câu hỏi)
- [ ] Người hỏi đánh dấu 1 câu trả lời là "Best answer"
- [ ] Trạng thái câu hỏi: Chưa giải quyết / Đã giải quyết
- [ ] Sắp xếp: mới nhất / nhiều câu trả lời nhất

### Repo Share (đơn giản hoá)
- [ ] Dán link GitHub repo, tự nhập title/mô tả/ghi chú cá nhân
- [ ] Fetch nhẹ một lần lúc submit để gợi ý điền sẵn (tên, mô tả, stars, ngôn ngữ) — không bắt buộc, không chặn đăng bài nếu lỗi/timeout
- [ ] Ghi rõ trên UI "Dữ liệu tại thời điểm chia sẻ" (không cache/refresh)

### Feed & Khám phá
- [ ] Trang chủ dạng feed: Mới nhất
- [ ] Lọc feed theo tag
- [ ] Feed phân biệt rõ 4 loại nội dung (blog/project/Q&A/repo)
- [ ] Pagination / infinite scroll
- [ ] Empty state & error state

### Tương tác xã hội
- [ ] Like bài viết/project/Q&A/repo
- [ ] Bình luận (phẳng; riêng Q&A có thêm đánh dấu best answer)
- [ ] Bookmark (lưu để đọc sau)
- [ ] Follow user khác
- [ ] Follow tag

### Tìm kiếm
- [ ] Tìm kiếm full-text (Postgres `tsvector`) trên cả 4 loại nội dung + username
- [ ] Trang kết quả tìm kiếm có filter theo loại nội dung

### Vận hành
- [ ] Report / flag nội dung
- [ ] Sitemap.xml + metadata/OpenGraph động
- [ ] Logging request/error cơ bản

### Việc cần làm ở schema trước khi code Q&A
- [ ] Thêm bảng `questions` (body_markdown, status, accepted_comment_id) vào `supabase/schema.sql`
- [ ] Mở rộng `content_items_kind_check` để nhận `'question'`
- [ ] Thêm cột `is_accepted_answer boolean` vào `comments` + RLS tương ứng

---

## Phase 2 — GitHub sâu hơn

- [ ] Auto-sync GitHub profile (followers, company, location, public repos)
- [ ] Cache + refresh định kỳ metadata repo trong Postgres
- [ ] Fetch & hiển thị README trong app
- [ ] GitHub activity, pinned repositories
- [ ] GitHub webhook
- [ ] Rate-limit handling nâng cao (queue, backoff)

## Phase 3 — AI & Developer Intelligence

- [ ] AI đọc README, tạo project summary
- [ ] AI gợi ý tag tự động
- [ ] AI hỗ trợ viết documentation

## Phase 4 — Community Platform

- [ ] Reputation / Badge (đặc biệt hữu ích cho Q&A — vd. "Top answerer")
- [ ] Job board / kết nối project cần người với người tìm việc
- [ ] Public API cho bên thứ ba
- [ ] Cross-post sang Twitter/X, LinkedIn
- [ ] Notification real-time đầy đủ qua Supabase Realtime
- [ ] RSS feed cho blog cá nhân và theo tag
- [ ] Analytics cho tác giả (views, read time)
- [ ] Weekly digest email

---

## Ghi chú thứ tự triển khai Phase 1

Gợi ý thứ tự build để có sản phẩm chạy được sớm nhất:

1. **Auth** (email/password + GitHub OAuth) — mọi tính năng khác phụ thuộc vào việc có user
2. **Blog** (tạo, đọc, sửa, xoá) — loại nội dung đơn giản nhất để dựng xong luồng CRUD + feed
3. **Feed + Tag** — có nội dung để hiển thị trước khi làm thêm loại nội dung khác
4. **Project Showcase** — tái dùng phần lớn UI/luồng từ Blog
5. **Q&A** — tái dùng luồng CRUD tương tự Blog, thêm cơ chế "best answer" trên comment
6. **Repo Share** (bản đơn giản) — form nhập tay + fetch nhẹ tuỳ chọn
7. **Like / Comment / Bookmark / Follow** — lớp tương tác phủ lên trên nội dung đã có
8. **Search** — cần đủ dữ liệu thật để test có ý nghĩa
9. **Profile hoàn chỉnh** — gom lại mọi loại nội dung của một user
