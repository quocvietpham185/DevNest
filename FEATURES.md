# DevNest — Feature Roadmap

> Kế hoạch tính năng chia theo 3 giai đoạn. Phạm vi hiện tại (theo [PRD.md](./PRD.md)) chỉ build **Phase 1**; Phase 2 và 3 để tham khảo định hướng, chưa lên lịch cụ thể.

| Giai đoạn | Mục tiêu |
|---|---|
| **Phase 1 — MVP** | Vòng lặp cốt lõi: đăng nội dung → được khám phá → được tương tác |
| **Phase 2 — Differentiators** | Tính năng tạo khác biệt, giữ chân người dùng quay lại |
| **Phase 3 — Mở rộng** | Hạ tầng & tính năng cho quy mô lớn hơn |

---

## Phase 1 — MVP

### Auth
- [ ] Đăng nhập / đăng ký qua GitHub OAuth (Supabase Auth)
- [ ] Đăng xuất
- [ ] Onboarding lần đầu: chọn username, avatar (mặc định lấy từ GitHub), 3–5 tag quan tâm

### Blog
- [ ] Editor Markdown (soạn + xem trước song song)
- [ ] Upload ảnh trong bài viết (Supabase Storage)
- [ ] Gắn tag cho bài viết (tối đa 5)
- [ ] Lưu nháp (draft) / xuất bản (publish)
- [ ] Trang đọc bài viết: syntax highlighting cho code block, ước tính thời gian đọc
- [ ] Sửa / xoá bài viết đã đăng

### Project Showcase
- [ ] Form tạo project: tên, mô tả, tech stack (tag), link repo, link demo, ảnh/video cover
- [ ] Trạng thái project: Đang phát triển / Hoàn thành / Tìm cộng tác viên
- [ ] Trang chi tiết project
- [ ] Sửa / xoá project đã đăng

### Repo Share
- [ ] Dán link GitHub repo → tự động fetch metadata (tên, mô tả, stars, ngôn ngữ chính, README preview) qua Octokit
- [ ] Cho phép người dùng viết thêm ghi chú cá nhân ("vì sao repo này hay")
- [ ] Cache metadata repo trong Postgres, refresh định kỳ (tránh chạm GitHub rate limit — xem PRD mục 6)

### Feed & Khám phá
- [ ] Trang chủ dạng feed: Mới nhất
- [ ] Lọc feed theo tag
- [ ] Feed hiển thị đúng 3 loại nội dung (blog / project / repo) với UI phân biệt rõ

### Tương tác xã hội
- [ ] Like bài viết / project / repo share
- [ ] Bình luận (dạng phẳng, chưa cần reply lồng nhau)
- [ ] Bookmark (lưu để đọc sau)
- [ ] Follow user khác
- [ ] Follow tag

### Tìm kiếm
- [ ] Tìm kiếm full-text (Postgres `tsvector`) trên bài viết, project, repo, username
- [ ] Trang kết quả tìm kiếm có filter theo loại nội dung

### Profile
- [ ] Trang profile công khai: thông tin cơ bản, danh sách bài viết / project / repo đã đăng
- [ ] Trang chỉnh sửa profile cá nhân (bio, avatar, social links)
- [ ] Tab "Đã lưu" (bookmark) chỉ chủ tài khoản thấy được

---

## Phase 2 — Differentiators

- [ ] **Project roadmap/changelog**: dev cập nhật tiến độ dự án theo thời gian, follower theo dõi được (build-in-public)
- [ ] **"Đang tìm cộng tác viên"**: gắn cờ project cần người, kèm role cụ thể (frontend, design, docs...)
- [ ] **Repo of the Week**: tổng hợp tự động hoặc do cộng đồng vote hàng tuần
- [ ] **Đánh giá repo được share**: cộng đồng rate/review "hữu ích cho việc gì"
- [ ] **Series bài viết** nhiều phần (tutorial dài)
- [ ] **Embed code snippet chạy được** trong bài viết (CodeSandbox/StackBlitz embed)
- [ ] **Badge / reputation system** dựa trên đóng góp (bài viết, comment hữu ích, project được star)
- [ ] **Weekly digest email** tổng hợp nội dung nổi bật theo tag đang follow

## Phase 3 — Mở rộng

- [ ] Notification real-time đầy đủ (like, comment, follow mới) qua Supabase Realtime
- [ ] RSS feed cho blog cá nhân và theo tag
- [ ] API công khai cho bên thứ ba
- [ ] Job board / kết nối project cần người với người tìm việc
- [ ] Analytics cho tác giả (views, read time, click-through tới repo)
- [ ] Cross-post sang Twitter/X, LinkedIn
- [ ] Gợi ý bằng AI: tóm tắt README dài, gợi ý tag tự động, gợi ý repo liên quan
- [ ] Tuỳ chỉnh theme editor / dark mode nâng cao

---

## Ghi chú thứ tự triển khai Phase 1

Gợi ý thứ tự build để có sản phẩm chạy được sớm nhất, thay vì làm tuần tự theo nhóm ở trên:

1. Auth (GitHub OAuth) — mọi tính năng khác phụ thuộc vào việc có user
2. Blog (tạo, đọc, sửa, xoá) — loại nội dung đơn giản nhất để dựng xong luồng CRUD + feed
3. Feed + Tag — có nội dung để hiển thị trước khi làm thêm loại nội dung khác
4. Project Showcase — tái dùng phần lớn UI/luồng từ Blog
5. Repo Share — phần phức tạp nhất (gọi GitHub API, cache) nên làm sau khi luồng CRUD đã ổn định
6. Like / Comment / Bookmark / Follow — lớp tương tác phủ lên trên nội dung đã có
7. Search — cần đủ dữ liệu thật để test có ý nghĩa
8. Profile hoàn chỉnh — gom lại mọi loại nội dung của một user
