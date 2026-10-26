# Hướng dẫn tự sửa portfolio

Website nằm trong thư mục `Desktop → CLAUDE PROJECT → portfolio-web`.
Bạn **không cần đụng vào code**. Mọi việc thêm, sửa, xoá sản phẩm đều làm trong **Trình chỉnh sửa**.

---

## 1. Mở Trình chỉnh sửa

1. Mở **Finder** → **Màn hình nền** (Desktop) → `CLAUDE PROJECT` → `portfolio-web`.
2. Bấm đúp file **`Mo-trinh-chinh-sua.command`**.
3. Một cửa sổ **Terminal** đen hiện ra, kèm dòng ✅ *Trình chỉnh sửa portfolio đang chạy*. Sau đó trình duyệt tự mở trang chỉnh sửa.
   - **Đừng đóng cửa sổ Terminal đó** khi đang chỉnh sửa, vì nó giúp lưu file và nén ảnh/video.
   - Nếu macOS hỏi *"Terminal muốn truy cập tệp trong thư mục Màn hình nền"*: bấm **Cho phép**.
   - Nếu macOS báo *"không thể mở vì không xác định được nhà phát triển"*: bấm **chuột phải** (hoặc giữ Control rồi bấm) vào file → **Mở** → **Mở**. Chỉ cần làm vậy ở lần đầu.

> Nếu bạn bấm đúp vào `chinh-sua.html` thay vì file `.command`, trang sẽ báo *"Hãy mở Trình chỉnh sửa đúng cách"*. Lúc đó quay lại bước 2.

---

## 2. Thêm một sản phẩm Design

1. Bấm tab **Design** ở phía trên.
2. Bấm **+ Thêm sản phẩm Design** ở cột bên trái. Sản phẩm mới sẽ nằm trên cùng.
3. **Hình ảnh**: kéo ảnh từ Finder thả vào ô **"Kéo ảnh vào đây"**, hoặc bấm vào ô đó để chọn ảnh.
   - Bạn có thể chọn nhiều ảnh cùng lúc. **Ảnh đầu tiên là ảnh bìa** (có nhãn đỏ *Ảnh bìa*).
   - Dùng nút **← →** dưới mỗi ảnh để đổi thứ tự, và nút **✕** để bỏ ảnh.
   - Ảnh JPG, PNG hay HEIC (ảnh iPhone) đều được, máy sẽ tự thu nhỏ cho nhẹ.
4. Điền các ô sau:

| Ô | Hiện ở đâu trên web | Ví dụ |
|---|---|---|
| Tên sản phẩm | Dưới hình + tiêu đề lớn | False Eden |
| Thể loại | Góc phải dưới hình | 3D · Poster |
| Năm | Cạnh thể loại | 2026 |
| **Mô tả ngắn** | Một dòng nhỏ ngay dưới hình | Khu vườn thuỷ tinh không có thật. |
| **Chú thích chi tiết** | Trang riêng mở ra khi người xem bấm vào sản phẩm | Ý tưởng, quá trình, kết quả… |
| Vai trò của bạn | Bảng thông tin trong trang riêng | Concept, 3D, art direction |
| Công cụ | Bảng thông tin trong trang riêng | Blender, Photoshop |
| Link xem thêm | Nút "Xem thêm ↗" (không bắt buộc) | Link Behance |

5. Bấm **Lưu thay đổi** ở góc phải trên (hoặc bấm phím **⌘ Command + S**).

**Mẹo:** trong ô *Chú thích chi tiết*, bấm **Return** (xuống dòng) để tách thành đoạn mới.

---

## 3. Thêm một video

1. Bấm tab **Video** → **+ Thêm video**.
2. Kéo file video (MP4 hoặc MOV quay từ iPhone đều được) vào ô **"Kéo video vào đây"**.
   - Máy sẽ **tự nén** video, tạo **bản xem trước 8 giây** (chạy khi rê chuột) và **ảnh bìa**. Video dài có thể mất vài phút, xem tiến độ ở góc phải dưới.
   - Ô **Thời lượng** tự điền. Muốn đổi ảnh bìa thì kéo ảnh khác vào ô **Đổi ảnh bìa**.
3. Điền tên, thể loại, mô tả ngắn, chú thích… giống phần Design.
4. Bấm **Lưu thay đổi**.

---

## 4. Sắp xếp và xoá

- **Đổi thứ tự**: bấm nút **↑ ↓** cạnh mỗi sản phẩm ở cột trái. Thứ tự trong danh sách là thứ tự trên web.
- **Xoá**: chọn sản phẩm → bấm **Xoá** (góc phải trên của khung) → **OK**.
  Thao tác này chỉ gỡ sản phẩm khỏi web, file ảnh/video gốc vẫn còn trong máy.
- Sản phẩm **chưa có ảnh/video** sẽ có dòng vàng *"chưa hiện trên web"*. Nó được giữ lại để bạn làm tiếp sau.

---

## 5. Sửa tên và liên hệ

Bấm tab **Thông tin & liên hệ**:

- **Tên hiển thị**: tên ở góc trái trên của mọi trang.
- Website gồm **Trang chủ** (tên, ảnh, video nổi bật, Design, giới thiệu ngắn) và 3 trang con **Video · Design · About**. Bấm tên "Ánh Phan" ở góc trái để về trang chủ. Liên hệ nằm ở cuối mỗi trang.
- Muốn video nào hiện ở trang chủ: tab **Video** → chọn video → tick **⭐ Nổi bật ở trang chủ** (tối đa 4).
- **Email** và **Các liên kết** (Instagram, Behance, TikTok, điện thoại…):
  - Bấm **+ Thêm liên kết** để thêm dòng mới, hoặc **✕** để xoá dòng.
  - Với số điện thoại, ô *Link* ghi dạng `tel:+84901234567` để người xem bấm là gọi được.

Sửa xong nhớ bấm **Lưu thay đổi**.

---

## 5b. Trang About me

Bấm tab **About me** trong Trình chỉnh sửa (ô **Nghề** và **Một câu nói bạn làm gì** còn hiện ở đầu trang Video):

- **Họ tên, chức danh, khu vực, giới thiệu**: phần đầu trang About.
- **Ảnh chân dung**: kéo ảnh vào ô. Nếu để trống, phần chữ sẽ trải rộng hết trang.
- **Con số nổi bật, Kinh nghiệm làm việc, Dự án & hoạt động, Kỹ năng, Học vấn**: mỗi ô xám là một mục. Bấm **+ Thêm** để thêm mục, **✕** để xoá, **↑ ↓** để đổi thứ tự.
- **Công cụ, Ngôn ngữ**: mỗi dòng một mục.

## 5c. Video lấy từ YouTube, Drive, Facebook

- Không cần tải file video lên. Chỉ cần dán link YouTube vào ô **Link xem thêm**, web sẽ phát video ngay trong trang.
- Link Drive, Facebook hay Behance sẽ hiện thành nút bấm. Muốn có nhiều nút thì ghi mỗi dòng một link, ví dụ:
  `Trailer | https://drive.google.com/...`
  `Phim chính thức | https://facebook.com/...`
- Với link không phải YouTube, nhớ kéo một **ảnh bìa** vào để video hiện trên web.
- Ô **Ảnh / video thêm** dùng cho khung hình, ảnh hậu trường, ảnh kết quả, và **cả file video** (MP4, MOV). Video thả vào đây sẽ phát ngay trên web, nằm dưới video chính.

## 5d. Chọn bố cục ảnh cho từng sản phẩm

Trong form của mỗi sản phẩm (cả Design và Video) có ô **Bố cục ảnh**:

| Lựa chọn | Hiện trên web | Hợp với |
|---|---|---|
| **Trình chiếu** (mặc định) | Một khung cố định, bấm **← →** hoặc bấm ảnh nhỏ bên dưới để lướt; trên điện thoại thì vuốt ngang. Ảnh khác kích thước sẽ có nền là chính ảnh đó làm mờ, không có viền đen. | Dự án nhiều ảnh, kích thước lộn xộn |
| **Lưới 2 cột** | Ảnh xếp so le 2 cột, giữ đúng tỉ lệ | Bộ ảnh nhỏ, ảnh dọc, ảnh chụp màn hình |
| **Xếp dọc** | Mỗi ảnh to, cuộn xuống để xem | Poster, ảnh cần xem chi tiết |

Đổi xong nhớ bấm **Lưu**, rồi bấm **Xem trên web ↗** để xem thử.

## 5e. Đổi màu, font, cỡ chữ (tab Giao diện)

- **Bộ màu có sẵn**: bấm Cinema, Night Blue, Cream, Olive hoặc Studio trắng để đổi màu cả web.
- **Tự chọn màu**: bấm vào ô màu để chọn **Màu nền**, **Màu chữ**, **Màu nhấn** (màu của chữ đỏ và nút).
- **Hiệu ứng nền**: *Màu trơn*, *Gradient* (2 vệt màu loang), hoặc *Vũ trụ* (gradient kèm sao nhỏ nhấp nháy và sao 4 cánh lấp lánh). Ô **Màu gradient** chọn màu loang thứ hai. Bộ màu **Galaxy ✦** đã bật sẵn hiệu ứng vũ trụ.
- **Độ sáng của sao**: kéo thanh trượt (20%–100%, mặc định 50%). **Khi cuộn xuống đọc**: chọn *Sao mờ dần* để chữ dễ đọc hơn (sao sáng ở đầu trang, mờ dần khi cuộn).
- **Viền quanh 4 mục Design**: *Dải phim* (có lỗ phim), *Viền màu trơn*, hoặc *Không viền*. Ô **Màu viền** để đổi màu dải.
- **Font tiêu đề / Font chữ thường**: chọn từ danh sách (đều hỗ trợ tiếng Việt). Font ghi "(có chân)" là kiểu cổ điển, sang.
- **Cỡ tiêu đề**: kéo thanh trượt (70%–130%). **Độ đậm tiêu đề**: Thường → Đậm.
- **Ô ảnh bìa 4 mục Design**: chọn dọc, vuông hay ngang.
- Ô **Xem trước** bên phải đổi ngay khi bạn chỉnh. Ưng thì bấm **Lưu**. Muốn quay lại như cũ thì bấm **↺ Về mặc định**.

## 5f. Khung ảnh cho từng sản phẩm

Trong form mỗi sản phẩm, dưới **Bố cục ảnh** có mục **Khung ảnh**:
- **Tỉ lệ khung**: ngang 16:9 (hợp video), 16:10, 4:3, vuông 1:1, dọc 4:5 (hợp poster), dọc 3:4.
- **Vừa khung**: thấy trọn ảnh, chỗ trống có nền mờ. **Phủ kín**: ảnh lấp đầy khung, cắt bớt mép. Lưới và Xếp dọc chỉ dùng tỉ lệ khung khi chọn Phủ kín, để mọi ảnh bằng nhau.
- **Khi cắt: giữ phần giữa / trên / dưới**: ví dụ ảnh chân dung thì chọn "phần trên" để không mất mặt.

Ngay dưới có ô **Xem trước trên web**: đổi bố cục hay khung là thấy ngay ảnh sẽ hiện thế nào. Bấm **← →** hoặc ảnh nhỏ để xem từng ảnh.

**Cắt từng ảnh (giống app Ảnh trên iPhone)**
1. Ở ô ảnh của sản phẩm, rê chuột lên ảnh muốn cắt → bấm **✂ Cắt**.
2. Một màn hình đen hiện ra với khung cắt:
   - **Kéo 4 góc hoặc 4 cạnh** để thu nhỏ hay phóng to vùng giữ lại.
   - **Kéo bên trong khung** để dời vùng cắt.
   - Bấm tỉ lệ ở dưới để khoá hình dạng khung: **Tự do, Gốc, Vuông, Theo khung** (đúng tỉ lệ khung trình chiếu của sản phẩm), **16:9, 4:3, 4:5, 3:4, 9:16**.
3. Bấm **Xong** (hoặc phím Return). Bấm **Huỷ** (hoặc Esc) để bỏ. Bấm **Đặt lại** để quay về nguyên ảnh.
4. Ảnh đã cắt có nhãn **Đã cắt**, và ô Xem trước hiện đúng vùng đã cắt. Muốn bỏ cắt thì mở lại **✂ Cắt** → **Đặt lại** → **Xong**.

**Cắt video**: làm y như ảnh, bấm **✂ Cắt** trên video. Video đã cắt sẽ tự chạy không tiếng và lặp lại, không có thanh điều khiển (vì thanh điều khiển sẽ bị cắt mất).

**Đưa một ảnh/video xuống hàng riêng** (khi Bố cục ảnh là *Lưới 2 cột*): rê chuột lên ảnh/video → bấm **⤓ Cả hàng**. Mục đó sẽ tách ra một hàng riêng, rộng hết khung. Muốn nó nằm cuối thì dùng nút **→** để đưa nó xuống cuối danh sách. Bấm **↺ Bỏ cả hàng** để trả về như cũ.

Ảnh gốc không bị cắt thật, chỉ đổi cách hiển thị, nên bạn đổi qua lại thoải mái.

## 5g. Ảnh trang trí (ảnh của bạn trên web)

Bấm tab **Ảnh trang trí**:
1. Chọn vùng ở trên: **Trang chủ**, **Đầu trang About** hay **Phần liên hệ**. Khung bên trái chính là trang web thật.
2. **Kéo ảnh trực tiếp trên trang** để đổi chỗ.
3. Bấm một ảnh để chỉnh ở cột phải: **Kiểu** (Polaroid, Hoà vào nền, Tròn, Khung mảnh), **chữ viết tay** dưới polaroid, **Cỡ**, **Xoay**, nằm **trước hay sau chữ**, **✂ Cắt**, **Lên trên / Xuống dưới**, **Xoá**.
4. **+ Thêm ảnh**: kéo ảnh mới vào ô này.
5. Bấm **📱 Điện thoại** để sắp xếp riêng cho màn hình điện thoại (kéo, đổi cỡ, hoặc tick *Ẩn ảnh này trên điện thoại*). Vị trí máy tính không bị ảnh hưởng.
6. Xong bấm **Lưu thay đổi**.

## 6. Xem kết quả và tắt

- Bấm **Xem website ↗** để mở website trong tab mới. Nếu đang mở sẵn, bấm **⌘ Command + R** để tải lại.
- Trong form của từng sản phẩm có nút **Xem trên web ↗**, mở thẳng trang chú thích của sản phẩm đó. Nhớ **Lưu trước** rồi mới bấm.
- **Tắt**: bấm Lưu → đóng tab trình duyệt → đóng cửa sổ Terminal (nếu Terminal hỏi *"Chấm dứt tiến trình?"* thì bấm **Chấm dứt**).

---

## 7. Nếu có sự cố

| Hiện tượng | Cách xử lý |
|---|---|
| Đã sửa nhưng web không đổi | Kiểm tra đã bấm **Lưu** chưa (chấm xanh *Đã lưu*), rồi tải lại trang web bằng ⌘ R. |
| Báo *"Mất kết nối"* khi tải file | Cửa sổ Terminal đã bị đóng. Bấm đúp lại `Mo-trinh-chinh-sua.command`. |
| Video tải mãi không xong | Video rất dài hoặc 4K thì nén lâu. Đợi thanh tiến độ, đừng đóng Terminal. |
| Lỡ tay làm hỏng nội dung | Mỗi lần Lưu, bản cũ được cất trong `tools/sao-luu/` (giữ 30 bản gần nhất). Chép bản mới nhất ra ngoài, đổi tên thành `noi-dung.js` rồi thay file cũ. |

---

## 8. Mẹo viết chú thích hay

Mỗi sản phẩm nên trả lời 3 câu ngắn:

1. **Đề bài / ý tưởng là gì?** Ví dụ: *"Một khu vườn đẹp nhưng không có thật."*
2. **Bạn đã làm gì?** Ví dụ: *"Dựng 3D và ánh sáng trong Blender, dàn chữ trong Photoshop."*
3. **Kết quả?** Ví dụ: số ảnh, định dạng, nơi đăng, phản hồi.

Với sản phẩm dùng **thương hiệu thật** mà không phải đơn đặt hàng (ví dụ concept quảng cáo, fan art), nên ghi rõ *"Dự án cá nhân / fan project, không phải sản phẩm chính thức của thương hiệu"*. Như vậy khách hàng tin hơn và bạn tránh rắc rối bản quyền.

---

## 9. Đưa bản sửa lên mạng

Website đang ở **https://phanboianh.github.io**. Sửa trong Trình chỉnh sửa xong **chỉ mới thay đổi trên máy bạn**. Muốn web trên mạng cập nhật theo:

1. Bấm **Lưu** trong Trình chỉnh sửa.
2. Vào Finder → `portfolio-web`, bấm đúp file **`Dang-len-mang.command`**.
3. Thấy dòng ✅ *Đã đăng lên mạng* là xong. Đợi 1–2 phút rồi mở web, bấm **⌘ R** để tải lại.
