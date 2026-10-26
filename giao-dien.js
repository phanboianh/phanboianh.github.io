// Giao diện: bộ màu, font, cỡ chữ — dùng chung cho website và Trình chỉnh sửa (ô xem trước).
// Dữ liệu nằm ở noi-dung.js → giaoDien. Sửa trong Trình chỉnh sửa → tab "Giao diện", không cần sửa file này.
(() => {
  // Bộ màu có sẵn: nền, chữ, màu nhấn, hiệu ứng nền (khong / gradient / vutru) và màu thứ hai của gradient
  const PRESETS = [
    { ma: 'cinema', ten: 'Cinema', nen: '#0a0909', chu: '#eee8e1', nhan: '#ff3b5c', hieuUng: 'khong', mau2: '#3a1020' },
    { ma: 'galaxy', ten: 'Galaxy ✦', nen: '#0a1030', chu: '#f3efe4', nhan: '#f5c842', hieuUng: 'vutru', mau2: '#3b2a8f' },
    { ma: 'night', ten: 'Night Blue', nen: '#0e1a3b', chu: '#f3efe4', nhan: '#f5c842', hieuUng: 'gradient', mau2: '#2c4a9e' },
    { ma: 'cream', ten: 'Cream', nen: '#f2ece2', chu: '#1b1714', nhan: '#d0402b', hieuUng: 'khong', mau2: '#f0c9a8' },
    { ma: 'olive', ten: 'Olive', nen: '#12150f', chu: '#e9ead9', nhan: '#b9d84a', hieuUng: 'khong', mau2: '#2c3a14' },
    { ma: 'white', ten: 'Studio trắng', nen: '#ffffff', chu: '#111111', nhan: '#2d5bff', hieuUng: 'khong', mau2: '#dfe6ff' },
  ];
  // Font Google có hỗ trợ tiếng Việt. w = các độ đậm có sẵn, tls = hệ số khoảng chữ tiêu đề, serif = font có chân
  const FONTS = [
    { ten: 'Arimo', w: '400;500;600;700', tls: 1 },
    { ten: 'Be Vietnam Pro', w: '300;400;500;600;700', tls: .8 },
    { ten: 'Inter', w: '300;400;500;600;700', tls: .8 },
    { ten: 'Montserrat', w: '300;400;500;600;700', tls: .6 },
    { ten: 'Manrope', w: '300;400;500;600;700', tls: .7 },
    { ten: 'Lexend', w: '300;400;500;600;700', tls: .6 },
    { ten: 'Space Grotesk', w: '300;400;500;600;700', tls: .7 },
    { ten: 'Playfair Display', w: '400;500;600;700', tls: .4, serif: 1 },
    { ten: 'Cormorant Garamond', w: '300;400;500;600;700', tls: .4, serif: 1 },
    { ten: 'Lora', w: '400;500;600;700', tls: .3, serif: 1 },
  ];
  const DEFAULT = { boMau: 'cinema', nen: '#0a0909', chu: '#eee8e1', nhan: '#ff3b5c', fontTieuDe: 'Arimo', fontChu: 'Be Vietnam Pro', coTieuDe: '1', doDam: '700', tiLeBia: '3 / 4.3',
    hieuUng: 'khong', mau2: '#3a1020', vienPhim: 'phim', mauVien: '#000000', saoSang: '0.5', saoMoKhiCuon: 'co' };

  const hex = (h) => { const m = String(h || '').replace('#', '').match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i); return m ? m.slice(1).map((x) => parseInt(x, 16)) : null; };
  const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
  const css = (c) => `rgb(${c.join(',')})`;
  const font = (ten) => FONTS.find((f) => f.ten === ten) || FONTS[0];
  const stack = (f) => `'${f.ten}', ${f.serif ? 'Georgia, serif' : "'Helvetica Neue', Arial, sans-serif"}`;

  // Tải font từ Google Fonts (mỗi font một thẻ link riêng, tải rồi thì thôi)
  function loadFont(ten) {
    const f = font(ten), id = 'gf-' + f.ten.replace(/\s+/g, '-');
    if (document.getElementById(id)) return;
    const l = document.createElement('link');
    l.id = id; l.rel = 'stylesheet';
    l.href = `https://fonts.googleapis.com/css2?family=${f.ten.replace(/\s+/g, '+')}:wght@${f.w}&display=swap&subset=vietnamese`;
    document.head.append(l);
  }

  // Ghi các biến CSS lên một phần tử (mặc định là cả trang)
  function apply(cfg, el = document.documentElement) {
    const g = { ...DEFAULT, ...(cfg || {}) };
    const bg = hex(g.nen) || hex(DEFAULT.nen), ink = hex(g.chu) || hex(DEFAULT.chu);
    const light = bg[0] * .3 + bg[1] * .59 + bg[2] * .11 > 140; // nền sáng?
    const ft = font(g.fontTieuDe), fc = font(g.fontChu);
    const set = (k, v) => el.style.setProperty(k, v);
    set('--bg', css(bg)); set('--bg-rgb', bg.join(', '));
    set('--ink', css(ink)); set('--ink-rgb', ink.join(', '));
    set('--ink2', css(mix(ink, bg, .18)));
    set('--mute', css(mix(ink, bg, .45)));
    set('--card', css(mix(bg, ink, light ? .06 : .045)));
    // Dải phim quanh 4 mục Design: phim (có lỗ phim) / mau (viền màu trơn) / khong (bỏ viền)
    const vien = hex(g.mauVien) || (light ? mix(ink, bg, .04) : [0, 0, 0]);
    set('--strip', css(vien));
    set('--sprocket', css(mix(vien, bg, .22).map((x, i) => Math.min(255, x + (light ? 0 : 28)))));
    el.dataset.vien = g.vienPhim || 'phim';
    // Hiệu ứng nền: gradient (2 vệt màu loang) hoặc vutru (gradient + sao lấp lánh)
    const g2 = hex(g.mau2) || mix(bg, hex(g.nhan) || ink, .3);
    set('--g2-rgb', g2.join(', '));
    set('--acc-rgb', (hex(g.nhan) || hex(DEFAULT.nhan)).join(', '));
    el.dataset.fx = g.hieuUng || 'khong';
    // Độ sáng của sao (0.2–1) và có cho sao mờ dần khi cuộn xuống đọc nội dung hay không
    set('--sao', String(+g.saoSang || .5));
    el.dataset.saoCuon = g.saoMoKhiCuon === 'khong' ? 'khong' : 'co';
    set('--accent', g.nhan || DEFAULT.nhan);
    set('--title', stack(ft));
    set('--sans', stack(fc));
    // Nhãn nhỏ in hoa dùng font không chân: theo font tiêu đề, nếu tiêu đề là font có chân thì theo font chữ thường
    set('--mono', ft.serif ? (fc.serif ? stack(FONTS[0]) : stack(fc)) : stack(ft));
    set('--ts', String(+g.coTieuDe || 1));
    set('--tw', String(g.doDam || 700));
    set('--tls', String(ft.tls));
    set('--cat-ratio', g.tiLeBia || DEFAULT.tiLeBia);
    loadFont(ft.ten); loadFont(fc.ten);
    if (ft.serif || fc.serif) loadFont(FONTS[0].ten);
    if (el === document.documentElement) el.style.colorScheme = light ? 'light' : 'dark';
  }

  // Lớp nền vũ trụ: 3 lớp sao nhỏ (đổ bóng từ 1 điểm, chỉ nhấp nháy độ mờ nên rất nhẹ máy) + vài ngôi sao 4 cánh
  function cosmos(root) {
    if (root.querySelector(':scope > .cosmos')) return;
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const layer = (n, size) => Array.from({ length: n }, () => `${(rnd() * 100).toFixed(2)}vw ${(rnd() * 100).toFixed(2)}vh 0 ${size}px rgba(var(--ink-rgb), ${(.35 + rnd() * .6).toFixed(2)})`).join(',');
    const c = document.createElement('div');
    c.className = 'cosmos';
    c.setAttribute('aria-hidden', 'true');
    c.innerHTML = `<div class="sky"><i class="s1" style="box-shadow:${layer(110, 0)}"></i><i class="s2" style="box-shadow:${layer(45, .6)}"></i><i class="s3" style="box-shadow:${layer(18, 1.1)}"></i>` +
      Array.from({ length: 7 }, () => `<b style="left:${(rnd() * 96).toFixed(1)}%;top:${(rnd() * 92).toFixed(1)}%;--d:${(4 + rnd() * 5).toFixed(1)}s;--z:${(.45 + rnd() * .7).toFixed(2)}"></b>`).join('') + '</div>';
    root.prepend(c);
    // Sao sáng rõ ở đầu trang, mờ dần khi cuộn xuống để đọc chữ không bị rối mắt
    const sky = c.firstChild;
    let ticking = false;
    const fade = () => {
      ticking = false;
      const on = document.documentElement.dataset.saoCuon !== 'khong';
      sky.style.setProperty('--fade', on ? String(1 - Math.min(scrollY / (innerHeight * .9), 1) * .7) : '1');
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(fade); } }, { passive: true });
    fade();
  }

  // Ảnh đã cắt (cắt trong Trình chỉnh sửa, kiểu app Ảnh trên iPhone):
  // p.catAnh[đường dẫn ảnh] = { x, y, w, h (vùng giữ lại, tính theo phần của ảnh 0–1), r (tỉ lệ rộng/cao của vùng đó) }
  const getCrop = (p, a) => { const c = p && p.catAnh && p.catAnh[a]; return c && c.w && c.h && c.r ? c : null; };
  const ratioNum = (t) => { const [x, y] = String(t || '16 / 10').split('/').map(Number); return x / y || 1.6; };
  // Khung có đúng tỉ lệ vùng cắt, bên trong là ảnh gốc được phóng và dịch sao cho chỉ thấy vùng đã cắt.
  // fill = 'w' (rộng 100%) hoặc 'h' (cao 100%, dùng trong khung trình chiếu khi vùng cắt dọc hơn khung)
  // Video cắt được y như ảnh: video tự chạy không tiếng, lặp lại (không có thanh điều khiển vì nó sẽ bị cắt mất)
  function cropImg(src, c, fill = 'w', alt = '') {
    const q = (v) => String(v).replace(/"/g, '&quot;');
    const pos = `style="width:${(100 / c.w).toFixed(3)}%;left:${(-c.x / c.w * 100).toFixed(3)}%;top:${(-c.y / c.h * 100).toFixed(3)}%"`;
    const inner = /\.(mp4|m4v|mov|webm)$/i.test(String(src).split(/[?#]/)[0])
      ? `<video src="${q(src)}" muted loop playsinline autoplay preload="metadata" data-auto ${pos}></video>`
      : `<img src="${q(src)}" alt="${q(alt)}" loading="lazy" decoding="async" ${pos}>`;
    return `<div class="crop" style="aspect-ratio:${+c.r};${fill === 'h' ? 'height:100%' : 'width:100%'}">${inner}</div>`;
  }

  window.GIAO_DIEN = { PRESETS, FONTS, DEFAULT, apply, loadFont, cosmos, getCrop, cropImg, ratioNum };
  // Trên website: thêm lớp nền (chỉ hiện khi bật gradient / vũ trụ)
  if (document.documentElement.dataset.site !== undefined) document.addEventListener('DOMContentLoaded', () => cosmos(document.body));
  // Trên website: áp dụng ngay khi tải trang để không bị nháy màu cũ
  if (document.documentElement.dataset.site !== undefined && window.PORTFOLIO) apply(window.PORTFOLIO.giaoDien);
})();
