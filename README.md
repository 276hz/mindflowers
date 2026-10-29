# Tâm An (MindFlow) — bản nâng cấp Cloudflare Pages

Ứng dụng web tiếng Việt theo hướng **local-first**: dữ liệu mặc định lưu trong trình duyệt, có thể xuất/nhập JSON và tùy chọn đồng bộ qua Cloudflare Pages Functions + KV.

## Tính năng
- Dashboard: tâm trạng, năng lượng, câu trích dẫn và biểu đồ.
- Theo dõi thói quen, nhật ký biết ơn/CBT, Pomodoro, bài tập thở.
- Bánh xe cuộc đời và mục tiêu.
- Giao diện sáng/tối, responsive cho điện thoại, trạng thái focus dễ nhìn và hỗ trợ giảm chuyển động.
- Sao lưu/khôi phục JSON có giới hạn kích thước và chuẩn hóa dữ liệu nhập.
- Cloud Sync có cả lưu lên KV và tải xuống từ KV.
- PWA/service worker với cache giới hạn trong phạm vi ứng dụng; không cache API.
- Endpoint kiểm tra JSON, giới hạn payload 100 KB và không giả vờ đồng bộ thành công khi chưa cấu hình KV.

## Chạy thử / triển khai
Yêu cầu Node.js hiện hành.

```bash
npm install
npm run dev
npm run deploy
```

Hoặc đưa repo lên GitHub rồi kết nối Cloudflare Pages:
- Framework preset: `None`
- Build command: để trống
- Build output directory: `public`

## Bật đồng bộ Cloudflare KV
1. Tạo KV namespace trong Cloudflare.
2. Vào Pages project → Settings → Functions → KV namespace bindings.
3. Tạo binding có tên chính xác `MINDFLOW_KV`, trỏ tới namespace vừa tạo.
4. Deploy lại ứng dụng.
5. Trong mục **Dữ liệu & Cloud**, tự đặt một khóa riêng tối thiểu 16 ký tự chỉ gồm chữ, số, dấu chấm, gạch dưới, gạch ngang hoặc `~`. Dùng cùng khóa trên các thiết bị của bạn.
6. Chọn **Lưu lên cloud** để gửi dữ liệu; chọn **Tải về** trên thiết bị khác để khôi phục.

### Lưu ý bảo mật quan trọng
- Khóa đồng bộ đóng vai trò như một bí mật truy cập; không chia sẻ và không dùng mật khẩu bạn đang dùng ở dịch vụ khác.
- Dữ liệu trong KV không được mã hóa đầu-cuối bởi ứng dụng. Không đồng bộ thông tin cực kỳ nhạy cảm.
- KV phù hợp cho dữ liệu cá nhân nhẹ; endpoint giới hạn payload 100 KB. Với dữ liệu lớn, xuất/nhập tệp JSON.
- Cloudflare KV là eventual-consistent; thay đổi có thể không xuất hiện tức thì ở mọi nơi.
- Nếu không cấu hình `MINDFLOW_KV`, đồng bộ sẽ báo lỗi rõ ràng và dữ liệu vẫn có thể được lưu cục bộ.
- Không có backend identity/rate-limit riêng trong bản này. Khóa dài ngẫu nhiên giúp giảm khả năng đoán nhưng không thay thế hệ thống đăng nhập hoàn chỉnh.

## Dữ liệu & riêng tư
Dữ liệu ứng dụng nằm trong LocalStorage của trình duyệt hiện tại, trừ khi người dùng chủ động đồng bộ lên KV. Hãy tải bản sao lưu JSON định kỳ. Xóa dữ liệu trình duyệt có thể xóa dữ liệu local.

## Kiểm tra nhanh trước khi phát hành
- Mở dashboard trên điện thoại và desktop.
- Kiểm tra chuyển tab, đổi sáng/tối, ghi thói quen, nhật ký và mục tiêu.
- Thử xuất JSON rồi nhập lại.
- Kiểm tra offline sau lần tải đầu.
- Nếu bật Cloud Sync, xác nhận cả POST và GET hoạt động với KV binding.
