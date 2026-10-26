# HANDOVER — Website portfolio cá nhân (cập nhật 2026-10-24)

## 0h. Thứ tự trang mới (2026-10-26) — ƯU TIÊN HƠN 0c
- index.html = trang **Video** (trang đầu, có dòng #who "Tên — Nghề" + about.motCau) · design.html = **Design & Illustration** · about.html = **About** (dạng CV) · Contact ở cuối mọi trang. video.html chỉ còn tự chuyển về index.html (giữ nguyên #video-n).
- about.chucDanh "Video Editor & Scriptwriter" hiện to bằng màu nhấn. Thêm trường about.motCau. Thẻ video hiện vaiTro. conSo xếp theo công việc trước: Best MV · 2 MV The 1210 Label · 3 quốc gia LED · 1,1M TikTok (đã bỏ 247K và 21K).
- Dang-len-mang đổi số phiên bản ở index/design/about.

## 0g. Giới hạn dung lượng (2026-10-26)
- GitHub từ chối file trên 100 MB (đã gặp: remake-va-toi-di.mp4 113 MB). Đã nén lại còn 44 MB (720p, crf 24). Bản gốc để trong `tools/video-goc/` (đã đưa vào gitignore).
- may-chu.py: video đã nén mà vẫn > `LIMIT_VIDEO` (45 MB) thì nén lại lần lượt 1280/crf25 → 1280/crf29 → 960/crf31. Dang-len-mang.command chặn và báo nếu có file > 95 MB trong assets.

## 0f. Giao diện tuỳ chỉnh (2026-10-26)
- `giao-dien.js` (nạp trong <head> cùng noi-dung.js, `<html data-site>`) đọc `PORTFOLIO.giaoDien` = { boMau, nen, chu, nhan, fontTieuDe, fontChu, coTieuDe, doDam, tiLeBia }, rồi ghi các biến CSS: --bg/--bg-rgb/--ink/--ink-rgb/--ink2/--mute/--card/--strip/--sprocket/--accent/--title/--sans/--mono/--ts/--tw/--tls/--cat-ratio. Font tải động từ Google, mỗi font một link với đúng độ đậm có sẵn. Có 5 bộ màu có sẵn và 10 font có tiếng Việt.
- site.css không còn màu viết cứng, trừ chữ trắng phủ trên ảnh. Tiêu đề dùng `calc(cỡ * var(--ts))`, độ đậm var(--tw), khoảng chữ × var(--tls) (font có chân thì nới ra).
- Mỗi sản phẩm có `khung` (tỉ lệ), `datAnh` (vua/phu), `layNet` (top/center/bottom). gallery() đặt --ratio/--focus và class .phu.
- Thêm `hieuUng` (khong/gradient/vutru) + `mau2`, và `vienPhim` (phim/mau/khong) + `mauVien` → `data-fx` và `data-vien` trên <html>. Lớp `.cosmos` (fixed, z-index -1) do GIAO_DIEN.cosmos() chèn vào: 3 lớp sao (box-shadow, chỉ animate opacity) và 9 sao 4 cánh. Có thêm bộ màu Galaxy.
- Cắt ảnh kiểu iPhone: nút ✂ trên ảnh trong Trình chỉnh sửa mở `openCrop()` (kéo góc/cạnh/dời, khoá tỉ lệ). Lưu `p.catAnh[src] = {x,y,w,h,r}` (phần 0–1 của ảnh, r = tỉ lệ px của vùng cắt). Hiển thị bằng `GIAO_DIEN.cropImg()`: div.crop có aspect-ratio r, bên trong img dịch/phóng theo %. Dùng chung cho site.js gallery(), ô xem trước và ảnh nhỏ trong Trình chỉnh sửa. Trong trình chiếu thì vừa khít khung (fill 'h' khi r < tỉ lệ khung).
- cropImg cắt được cả video (video tự chạy, không có controls). `p.caHang[src] = true` → figure.full (column-span: all) trong bố cục Lưới. Ảnh nhỏ trong Trình chỉnh sửa có nút ✂ Cắt và ⤓ Cả hàng.
- Trình chỉnh sửa có tab "Giao diện" (ô xem trước dùng chung GIAO_DIEN.apply), và form sản phẩm có thêm mục "Khung ảnh".

## 0e. ĐÃ LÊN MẠNG (2026-10-25)
- Web: **https://phanboianh.github.io**. Repo `phanboianh/phanboianh.github.io` (Public, Pages lấy nhánh main ở thư mục gốc). Git đã đăng nhập bằng `gh` (Homebrew) với tài khoản phanboianh. Email commit đặt trong repo này là phanboianh8063@gmail.com.
- Đăng lại sau khi sửa: bấm đúp `Dang-len-mang.command` (git add/commit/push). Pages tự build lại trong khoảng 1–2 phút.
- `.gitignore` bỏ qua `tools/sao-luu/`, `.DS_Store`, `*.tmp`, `__pycache__`. Trình chỉnh sửa (`chinh-sua.html`) cũng nằm trên mạng, nhưng không có máy chủ thì nó chỉ hiện trang báo "mở đúng cách", không sửa được gì.

## 0d. Cập nhật 2026-10-25 (lần 2) — bố cục ảnh trong từng sản phẩm
- Mỗi sản phẩm (design và video) có trường `boCuc`: `trinhChieu` (mặc định: khung 16:10 cố định, lướt bằng scroll-snap, mũi tên ← →, dải ảnh nhỏ, nền là chính ảnh làm mờ thay cho viền đen), `luoi` (masonry 2 cột), `doc` (xếp dọc, ảnh đúng tỉ lệ, không còn nền đen). Hàm `gallery()` / `initGalleries()` trong site.js. Sản phẩm chỉ có 1 ảnh thì luôn xếp dọc.
- Video: ô "Ảnh / video thêm" (`anh[]`) nhận cả file video (máy chủ tự nén), hiện dưới video chính theo bố cục đã chọn.
- Ảnh Radar Sống Khoẻ và Mầm là ảnh chụp màn hình video trong trình duyệt (3024px, đã cắt thanh trình duyệt). Nên thay bằng khung hình xuất thẳng từ file video gốc nếu người dùng còn file.

## 0c. Cập nhật 2026-10-25 — cấu trúc 3 trang (ưu tiên hơn 0 / 0b)
- **Đã bỏ màn hình đầu trang** (tên lớn, veMinh, ảnh nền). Menu giờ là 01 About (`index.html`, chính là trang About) · 02 Design (`design.html`, không có `?muc` thì hiện 4 mục, có `?muc=` thì hiện trang mục) · 03 Video (`video.html` + bảng chi tiết) · 04 Contact (`#contact` ở cuối mọi trang). `about.html` chỉ còn tự chuyển về index.html.
- `site.js`: designHome / designPage / videoPage / aboutPage; phần liên hệ vẽ chung.
- Kinh nghiệm viết lại theo CV `~/Documents/JOBS/CV/EDITOR/CV_PHAN BỘI ÁNH.pdf`. `about.kinhNghiem` (3 mục) + `about.hoatDong` (4 mục), mỗi mục { noi, thoiGian, vaiTro, moTa, ketQua } (moTa/ketQua: mỗi dòng = 1 gạch đầu dòng).
- Nhãn nhỏ in hoa (`.mono`, menu) đổi từ JetBrains Mono sang **Arimo 700**; đã bỏ JetBrains Mono.
- Lưu ý số liệu lệch giữa CV và portfolio PDF: phim ngắn 14 ngày (CV ghi trailer 41K; PDF ghi phim 41K, trailer 19K), MV UP NK (CV 1,1K lượt thích; PDF 1,2K). Trang About theo CV, chú thích sản phẩm vẫn theo PDF. Chờ người dùng xác nhận.

## 0b. Cập nhật 2026-10-24 (lần 2) — About + nội dung thật (BẢN THỬ)
- Trang mới `about.html` (menu: 01 Design · 02 Video · 03 About · 04 Contact) vẽ từ `PORTFOLIO.about` = { hoTen, chucDanh, anh, khuVuc, tomTat, conSo[{so,nhan}], kinhNghiem[{thoiGian,vaiTro,noi,moTa}], kyNang[{nhom,muc}], congCu, hocVan[{thoiGian,ten,moTa}], ngonNgu, mucTieu }. Lấy từ trang 2 của PDF `~/Documents/JOBS/CV/EDITOR/PORTFOLIO_PHAN BỘI ÁNH.pdf`, dịch sang tiếng Việt. Phần kinh nghiệm ghép từ các trang dự án.
- Video không cần file: link YouTube trong ô `link` sẽ được nhúng (youtube-nocookie), ảnh bìa tự lấy từ i.ytimg nếu trống. Video chỉ có `anhBia` thì hiện ảnh. Có `anh[]` = ảnh thêm dưới video. Ô `link` nhận nhiều dòng, dạng `Nhãn | url`, tên nút tự đoán theo trang web.
- Nội dung thử: dự án thật từ PDF dùng ảnh trong `CLAUDE PROJECT/ẢNH PORT` (đã cắt khung trình duyệt, lưu ở `assets/port/`). Giữ 5 sản phẩm AI cũ (False Eden ×2, Jimin, Pumpkin ×2), có ghi "AI hỗ trợ". Đã bỏ Chiron, Gelato và toàn bộ video mẫu. **Bản mẫu cũ lưu ở `tools/noi-dung-ban-mau.js`** — muốn quay lại thì chép đè lên noi-dung.js.
- "Và Tôi Đi" và "Bunnie Studio — LED" đã có chữ nhưng chưa có ảnh, nên đang ẩn. Còn thiếu ảnh gốc cho: Swizzy branding, minigame Đờn ca tài tử, Lay's, AI character, render 3D phòng/bánh, Trăng Khê. Chú thích Pakamio là bản nháp, chưa rõ bối cảnh và vai trò. Ảnh Pakamio gốc chỉ khoảng 500px (web hiển thị đúng cỡ gốc, không phóng to).
- Trình chỉnh sửa có thêm tab "About me" (bảng nhiều dòng có thêm/xoá/↑↓, ảnh chân dung). Video có thêm ô "Ảnh thêm", ô link nhiều dòng.

## 0. Cập nhật 2026-10-24 (đọc trước — phần dưới có chỗ đã cũ)
- Site giờ có 2 trang: `index.html` (trang chủ) + `design.html?muc=<ma>` (trang từng mục Design: graphic · illustration · motion · 3d, lấy từ `nhomDesign[]`). CSS chung ở `site.css`, JS chung ở `site.js` (không còn CSS trong index.html).
- Theo góp ý của người dùng:
  - Đầu trang **bỏ video showreel**, thay bằng **nền tĩnh + giới thiệu**: nền tối có ánh đỏ nhẹ và 4 góc khung ngắm. Bên trái là dòng "Portfolio — năm", bên phải là đoạn `thongTin.veMinh`. Tên nằm **1 hàng**, cỡ chữ do JS `fitName()` tính cho vừa chiều ngang. Ảnh nền tuỳ chọn là `thongTin.anhNen`, có ảnh thì body thêm class `has-bg` và phủ lớp tối. Trường `showreel` / `anhShowreel` vẫn còn trong dữ liệu nhưng không dùng nữa.
  - Mọi tiêu đề lớn và logo đổi sang **Arimo** 700, chữ khít (biến CSS `--title`). Đã bỏ Cormorant và chữ nghiêng. Chữ thường vẫn là Be Vietnam Pro, nhãn nhỏ vẫn là JetBrains Mono.
  - Trang `design.html`: **thanh nút mục nằm trên cùng**, dính theo khi cuộn. Đầu thanh có "← Design", nút đang chọn màu sáng. Bên dưới mới tới số thứ tự, tên mục và mô tả.
- Trình chỉnh sửa, tab Thông tin: ô "Giới thiệu về bạn" (`veMinh`), "Nghề / chuyên môn" (`gioiThieu`), ô Ảnh nền (kéo thả, nút Bỏ ảnh nền) thay cho ô showreel.
- Đã kiểm tra ở 1440px và 375px, không bị cuộn ngang, không có lỗi console. Đã thử trọn vòng tải ảnh nền → Lưu → hiện trên web → Bỏ → Lưu. Dữ liệu thử đã xoá.
- **Việc đang chờ:** chuyển nội dung thật từ bản Canva (xem memory portfolio-canva) sang site này và thêm nhúng video YouTube. Bản Canva giữ làm portfolio PDF. Người dùng có thể muốn đưa ảnh chân dung vào ô Ảnh nền. Đoạn `veMinh` hiện là bản nháp do Claude viết.

> Dán đoạn này vào cuộc trò chuyện mới: **"Đọc file `CLAUDE PROJECT/portfolio-web/HANDOVER.md` rồi làm tiếp website portfolio của mình."**

## 1. Người dùng & cách làm việc
- Nói tiếng Việt, mới học code/Terminal. Giải thích từng bước bấm chuột theo menu macOS tiếng Việt, mỗi khối code chỉ một lệnh.
- Thích Claude tự làm, tự kiểm tra, rồi mở kết quả cho họ xem. Có con mắt designer, thích kiểu sang trọng, chuyên nghiệp.
- Không có ảnh/video tham khảo thì làm 2–3 bản thử phong cách trước khi làm bản đầy đủ.
- Ghi tên và vai trò trung thực. Thương hiệu thật thì ghi "dự án cá nhân / fan project, không chính thức". Không làm giả metadata, không giấu việc có dùng AI.

## 2. Yêu cầu gốc & quyết định đã chốt
- Website portfolio có 3 phần chính: **Design · Video Production · Contact**.
- Đã thử 3 phong cách (`style-tests/`: A Cinema, B Editorial, C Night Glass). **Người dùng chọn A — Cinema**: nền đen, chữ serif Cormorant, hạt phim, timecode, dải phim cuộn ngang cho Design, danh sách Video có video nổi theo chuột.
- Người dùng muốn **tự thêm/bớt sản phẩm** (sản phẩm mẫu Claude đưa vào *không phải* thứ họ muốn trưng bày) và **có chú thích ở từng sản phẩm** → đã làm Trình chỉnh sửa + trang chú thích.

## 3. Cấu trúc thư mục `portfolio-web/`
| File | Vai trò |
|---|---|
| `index.html` + `site.js` | Website (CSS nằm trong index.html). Vẽ hoàn toàn từ `noi-dung.js`. |
| `noi-dung.js` | Toàn bộ nội dung: `window.PORTFOLIO = { thongTin, design[], video[] }`. Viết dạng JSON nên mở thẳng bằng file:// vẫn chạy. |
| `chinh-sua.html` + `chinh-sua.js` | Trình chỉnh sửa không cần code: thêm, sửa, xoá, sắp xếp ↑↓, kéo thả ảnh/video, sửa thông tin và liên hệ, Lưu (⌘S). |
| `tools/may-chu.py` | Server Python chỉ dùng thư viện chuẩn, chạy ở 127.0.0.1:4321 (cổng bận thì tự lùi tới 4340). Có API `POST /api/luu` và `POST /api/tai-len?ten=`, bắt buộc header `X-Portfolio: 1`. Hỗ trợ Range để Safari phát được video, gửi header no-store. |
| `Mo-trinh-chinh-sua.command` | Người dùng bấm đúp file này để mở Terminal + trình duyệt (cờ `--khong-mo` để chạy mà không mở trình duyệt). |
| `HUONG-DAN.md` | Hướng dẫn dùng cho người dùng (tiếng Việt). |
| `assets/img`, `assets/video` | Media mẫu: `showreel.mp4` 23.6s ghép từ video của họ, `p-*.mp4` bản xem trước không tiếng, `f-*.mp4` bản đầy đủ có tiếng. |
| `assets/tai-len/` | Nơi chứa file tải lên qua Trình chỉnh sửa (hiện đang trống). |
| `tools/sao-luu/` | Mỗi lần Lưu sẽ sao lưu bản cũ của noi-dung.js, giữ 30 bản. |
| `style-tests/` | 3 bản thử cũ, chỉ để tham khảo, không có link nào trỏ tới. |

**Các trường dữ liệu**
- Design: `tieuDe, loai, nam, anh[] (ảnh 0 = ảnh bìa), moTa (dòng ngắn dưới hình), chuThich (xuống dòng = tách đoạn), vaiTro, congCu, link`.
- Video: giống Design nhưng thay `anh[]` bằng `video, xemTruoc, anhBia, thoiLuong`.
- `thongTin`: `ten, gioiThieu, showreel, anhShowreel, tieuDeLienHe, tieuDeLienHe2, email, lienKet[{nhan, chu, link}]`.

**Cách xử lý file tải lên**
- Ảnh: dùng `sips`, chỉ thu nhỏ nếu cạnh dài hơn 2400px, không phóng to. PNG có nền trong suốt giữ nguyên PNG, còn lại đổi sang JPG chất lượng 82. HEIC được hỗ trợ.
- Video: dùng `ffmpeg` ở `/opt/homebrew/bin`. Bản chính H.264 rộng tối đa 1920, crf 23, AAC. Bản xem trước 8 giây rộng 960, không tiếng. Ảnh bìa lấy ở giây 1. Thời lượng đọc bằng `ffprobe`.

**Các tính năng của trang**
- Chiều cao vùng dải phim tự tính theo số sản phẩm. Ảnh ngang (tỉ lệ > 1.15) tự dùng khung rộng.
- Có link thẳng tới từng sản phẩm, ví dụ `index.html#design-2`. Phím Esc để đóng, ← → để chuyển sản phẩm.
- Trên điện thoại, trang chú thích xếp: ảnh đầu → chữ → các ảnh còn lại.

## 4. Đã kiểm tra (2026-10-18)
- Máy tính 1440px và điện thoại 375px: không bị cuộn ngang, không có lỗi console.
- Trọn vòng Trình chỉnh sửa: thêm sản phẩm, đổi tên, kéo 2 ảnh, sắp xếp, thêm video (thời lượng và ảnh bìa tự điền), xoá, sửa email và liên kết, Lưu. Sau đó website hiển thị đúng; chữ HTML gõ trong chú thích được hiện nguyên dạng chữ, không chạy thành code.
- Gọi thẳng server: HEIC/PNG/JPG đều ổn, MOV iPhone đổi sang MP4 1080×1920 trong khoảng 4 giây, chặn được yêu cầu thiếu header, báo lỗi với file .txt, Range trả về 206.
- Mở bằng `open Mo-trinh-chinh-sua.command` chạy được. Dữ liệu thử đã xoá, `noi-dung.js` đã khôi phục bản gốc.
- Lưu ý: trình duyệt xem thử của Claude chạy hiệu ứng rất chậm. Khi chụp màn hình kiểm tra, hãy cho hiệu ứng chạy xong ngay bằng `document.getAnimations().forEach(a=>a.finish())` và đặt `scrollBehavior='auto'`.

## 5. Trạng thái hiện tại / việc còn mở
- Nội dung vẫn là **mẫu**: 5 Design (False Eden, Chiron Profilée, Happy Jimin Day, Pumpkin Night, Gelato Flavours) và 6 video (AP Studio, Dive-In Serum, False Eden, Showcase Reel, Gelato Flavours, Pumpkin Night), chú thích là bản nháp. Người dùng sẽ tự thay qua Trình chỉnh sửa.
- Liên hệ vẫn là chữ tạm: `ten@email.com`, `@tenban`, `+84 000 000 000`.
- Tên hiển thị đang là "Ánh Phan". Người dùng còn có tên "Annie" (annie.design) và thương hiệu AP Studio, nhưng chưa xác nhận dùng tên nào.
- Chưa chốt chỉ tiếng Việt hay song ngữ VI/EN.
- **Bước tiếp theo có khả năng nhất: đưa lên mạng.** Hướng dẫn hosting miễn phí (Netlify Drop hoặc GitHub Pages) từng bước bấm chuột; người dùng phải tự tạo tài khoản. Bản đăng lên **không gồm** `tools/`, `chinh-sua.*`, `style-tests/`, `*.command`, `HANDOVER.md`, `HUONG-DAN.md`. Nên làm sẵn một lệnh hoặc script đóng gói thư mục `xuat-ban/`. Nhắc người dùng: mỗi lần sửa xong phải đăng lại. Tên miền riêng là tuỳ chọn.
- Ý tưởng có thể làm sau: nút lọc theo thể loại (lấy từ bản C), ảnh chân dung + đoạn "About", ảnh xem trước khi chia sẻ link (thẻ og:image), favicon.

## 6. Môi trường
- macOS, đã có Python 3.9.6 (`/usr/bin/python3`), Node, ffmpeg/ffprobe (Homebrew), sips.
- File `CLAUDE PROJECT/.claude/launch.json` có 2 cấu hình xem thử: `portfolio-web` (http.server cổng 4173) và `portfolio-editor` (may-chu.py cổng 4321, `--khong-mo`).
- Nguồn tác phẩm gốc: `portfolio-canva/`, `glass-lily/`, `bugatti-profilee/output/`, `vinamilk-gelato/`, `promo-video/out/`.
