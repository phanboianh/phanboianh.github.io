// Vẽ website từ file noi-dung.js — dùng cho cả index.html (trang chủ) và design.html (trang từng mục).
// Khi thêm/bớt sản phẩm thì KHÔNG cần sửa file này — chỉ cần dùng Trình chỉnh sửa.
(() => {
  const D = window.PORTFOLIO;
  // ---------- Ngôn ngữ: Tiếng Việt / English ----------
  // Chọn bằng nút VI · EN trên menu (nhớ trong trình duyệt) hoặc link …?lang=en
  // Bản tiếng Anh: mỗi ô có thêm ô "<tên>_en" (Trình chỉnh sửa → phần 🇬🇧). Ô tiếng Anh để trống thì dùng tiếng Việt.
  const LANG = (() => {
    let l = new URLSearchParams(location.search).get('lang');
    try { if (l) localStorage.setItem('lang', l); else l = localStorage.getItem('lang'); } catch (e) { /* trình duyệt chặn lưu trữ */ }
    return l === 'en' ? 'en' : 'vi';
  })();
  const EN = LANG === 'en';
  const L = (vi, en) => (EN ? en : vi);
  document.documentElement.lang = LANG;
  // Đổi toàn bộ nội dung sang tiếng Anh một lần: x.tieuDe = x.tieuDe_en (nếu có)
  (function useEn(o) {
    if (!EN || !o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(useEn);
    Object.keys(o).forEach((k) => {
      if (k.endsWith('_en')) { if (String(o[k] ?? '').trim()) o[k.slice(0, -3)] = o[k]; } else useEn(o[k]);
    });
  })(D);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  const paras = (t) => String(t || '').split(/\n+/).filter((x) => x.trim()).map((x) => `<p>${esc(x)}</p>`).join('');
  const isVid = (s) => /\.(mp4|m4v|mov|webm)$/i.test(String(s || '').split(/[?#]/)[0]);
  const canHover = matchMedia('(hover: hover)').matches;
  // Ô "link" có thể ghi nhiều dòng, dạng "Nhãn | https://..." hoặc chỉ link
  const SITES = [[/youtu\.?be/, 'YouTube'], [/facebook\.com|fb\.watch/, 'Facebook'], [/drive\.google/, 'Google Drive'], [/behance\.net/, 'Behance'], [/tiktok\.com/, 'TikTok'], [/instagram\.com/, 'Instagram']];
  const links = (t) => String(t || '').split(/\n+/).map((l) => l.trim()).filter(Boolean).map((l) => {
    const [a, b] = l.includes(' | ') ? l.split(' | ') : ['', l];
    const site = (SITES.find(([re]) => re.test(b)) || [])[1];
    return { url: b.trim(), nhan: a.trim() || (site ? L(`Xem trên ${site}`, `Watch on ${site}`) : L('Xem thêm', 'See more')) };
  });
  const ytId = (t) => { const m = String(t || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/); return m && m[1]; };

  if (!D) {
    document.body.innerHTML = '<p style="padding:40px;font:16px system-ui">Không đọc được file noi-dung.js. Nếu bạn vừa sửa tay, hãy kiểm tra dấu ngoặc kép và dấu phẩy.</p>';
    return;
  }
  const T = D.thongTin || {};
  const CATS = D.nhomDesign && D.nhomDesign.length ? D.nhomDesign : [{ ma: 'graphic', ten: 'Graphic design', moTa: '' }];
  // Giữ vị trí gốc (i) để nút "Xem trên web" trong Trình chỉnh sửa trỏ đúng sản phẩm
  const DS = (D.design || []).map((p, i) => ({ ...p, i, nhom: p.nhom || CATS[0].ma })).filter((p) => p.anh && p.anh.length);
  // Video hiện trên web khi có file video, hoặc link YouTube, hoặc ít nhất một ảnh bìa
  const VS = (D.video || []).map((v) => ({ ...v, yt: !v.video && ytId(v.link) })).map((v) => ({ ...v, bia: v.anhBia || (v.yt ? `https://i.ytimg.com/vi/${v.yt}/hqdefault.jpg` : '') }))
    .filter((v) => v.video || v.yt || v.bia);
  const inCat = (ma) => DS.filter((p) => p.nhom === ma);
  const name = (T.ten || '').trim();
  const page = document.body.dataset.page;

  // ---------- Phần chung của mọi trang ----------
  // Chữ cố định trong HTML: phần tử có data-en="…" đổi sang tiếng Anh
  if (EN) $$('[data-en]').forEach((el) => { el.textContent = el.dataset.en; });
  // Nút đổi ngôn ngữ (cạnh nút Liên hệ)
  $('.nav nav').insertAdjacentHTML('beforeend', `<button class="lang mono" id="lang" title="${L('Switch to English', 'Chuyển sang tiếng Việt')}"><b class="${EN ? '' : 'on'}">VI</b><i>/</i><b class="${EN ? 'on' : ''}">EN</b></button>`);
  $('#lang').addEventListener('click', () => {
    const next = EN ? 'vi' : 'en';
    try { localStorage.setItem('lang', next); } catch (e) { /* bỏ qua */ }
    const u = new URL(location.href);
    u.searchParams.delete('lang');
    if (!EN) u.searchParams.set('lang', 'en'); // giữ ?lang=en trên link để gửi đi là mở đúng bản tiếng Anh
    location.href = u.toString();
  });
  $('#logo').textContent = T.logo || name; // nút về trang chủ (đổi chữ ở tab Thông tin & liên hệ)
  $('#copy').textContent = `© ${new Date().getFullYear()} ${name}`;
  $('#c1').textContent = T.tieuDeLienHe || '';
  $('#c2').textContent = T.tieuDeLienHe2 || '';
  const mail = $('#mail');
  if (T.email) { mail.textContent = T.email; mail.href = 'mailto:' + T.email; } else mail.hidden = true;

  // Ảnh hoặc video (video tự chạy không tiếng khi cuộn tới)
  const media = (src, alt, extra = '', style = '') => isVid(src)
    ? `<video src="${esc(src)}" muted loop playsinline preload="metadata" data-auto ${extra}${style ? ` style="${style}"` : ''}></video>`
    : `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async"${style ? ` style="${style}"` : ''}>`;

  // Khối chữ: thể loại, tên, chú thích, vai trò/công cụ
  function aside(p, isVideo) {
    const cred = [[L('Thể loại', 'Type'), p.loai], [L('Vai trò', 'Role'), p.vaiTro], [L('Công cụ', 'Tools'), p.congCu], [L('Năm', 'Year'), p.nam], [L('Thời lượng', 'Length'), isVideo && p.thoiLuong]]
      .filter(([, v]) => v).map(([t, v]) => `<div><dt class="mono">${t}</dt><dd>${esc(v)}</dd></div>`).join('');
    return `<aside class="p-t"><div class="in">
      <span class="mono kick">${[p.loai, p.nam].filter(Boolean).map(esc).join(' · ')}</span>
      <h2>${esc(p.tieuDe)}</h2>
      <div class="p-desc">${paras(p.chuThich || p.moTa)}</div>
      ${cred ? `<dl class="p-cred">${cred}</dl>` : ''}
      ${p.caseStudy || links(p.link).length ? `<div class="p-links">${p.caseStudy ? `<button class="p-link mono cs-go" data-case>${L('Đọc case study ↓', 'Read the case study ↓')}</button>` : ''}${links(p.link).map((l) => `<a class="p-link mono" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.nhan)} ↗</a>`).join('')}</div>` : ''}
    </div></aside>`;
  }
  // Case study (ô "Case study" trong Trình chỉnh sửa), viết bằng vài ký hiệu đơn giản:
  //   > câu mở · - Nhãn: nội dung (dòng thông tin) · ## Tiêu đề phần · 1. Câu đầu in đậm. Phần giải thích
  //   ![chú thích](đường dẫn ảnh) — nhiều dòng ảnh liền nhau thì xếp cạnh nhau
  function caseHTML(t) {
    let h = '', group = '', buf = [];
    const flush = () => {
      if (group === 'facts') h += `<dl class="cs-facts">${buf.join('')}</dl>`;
      if (group === 'imgs') h += `<div class="cs-imgs n${buf.length}">${buf.join('')}</div>`;
      group = ''; buf = [];
    };
    const add = (g, x) => { if (group !== g) flush(); group = g; buf.push(x); };
    String(t || '').split('\n').map((l) => l.trim()).filter(Boolean).forEach((l) => {
      let m;
      if ((m = l.match(/^!\[(.*)\]\((.+)\)$/))) add('imgs', `<figure>${media(m[2], m[1])}${m[1] ? `<figcaption class="mono">${esc(m[1])}</figcaption>` : ''}</figure>`);
      else if ((m = l.match(/^-\s*([^:]{1,30}):\s*(.+)$/))) add('facts', `<div><dt class="mono">${esc(m[1])}</dt><dd>${esc(m[2])}</dd></div>`);
      else {
        flush();
        if ((m = l.match(/^##\s*(.+)$/))) h += `<h3 class="cs-h">${esc(m[1])}</h3>`;
        else if ((m = l.match(/^>\s*(.+)$/))) h += `<p class="cs-lede">${esc(m[1])}</p>`;
        else if ((m = l.match(/^(\d+)[.)]\s*(.+)$/))) {
          const [, head, rest] = m[2].match(/^(.+?[.!?…])\s+(.+)$/) || [, m[2], ''];
          h += `<div class="cs-step"><span class="mono">${pad(m[1])}</span><div><h4>${esc(head)}</h4>${rest ? `<p>${esc(rest)}</p>` : ''}</div></div>`;
        } else h += `<p>${esc(l.replace(/^-\s*/, ''))}</p>`;
      }
    });
    flush();
    return `<article class="case" id="case"><span class="mono kick">Case study</span>${h}</article>`;
  }
  // Ảnh/video của một sản phẩm, theo bố cục chọn trong Trình chỉnh sửa:
  //   trinhChieu = khung cố định, lướt bằng mũi tên ← → (mặc định) · luoi = lưới 2 cột · doc = xếp dọc từng ảnh
  // Khung ảnh (chọn riêng cho từng sản phẩm): khung = tỉ lệ khung, datAnh = vua (thấy trọn ảnh) / phu (phủ kín, cắt mép),
  // layNet = giữ phần nào khi cắt (top / center / bottom)
  function gallery(list, alt, p) {
    if (!list.length) return '';
    const mode = p.boCuc, phu = p.datAnh === 'phu';
    const look = ` style="--ratio:${esc(p.khung || '16 / 10')};--focus:${esc(p.layNet || 'center')}"`;
    const fit = phu ? ' phu' : '';
    // Ảnh đã cắt riêng thì hiện đúng vùng đã cắt; trong khung trình chiếu thì vừa khít khung (không tràn)
    const R = GIAO_DIEN.ratioNum(p.khung);
    const one = (a, inShow) => {
      const c = GIAO_DIEN.getCrop(p, a);
      return c ? GIAO_DIEN.cropImg(a, c, inShow && c.r < R ? 'h' : 'w', alt) : media(a, alt, 'controls');
    };
    if (mode === 'doc' || list.length === 1) return list.map((a) => `<div class="p-m${fit}"${look}>${one(a)}</div>`).join('');
    // Lưới: mục nào bật "Cả hàng" trong Trình chỉnh sửa thì tách ra một hàng riêng, rộng hết khung
    const full = (a) => (p.caHang && p.caHang[a] ? ' class="full"' : '');
    if (mode === 'luoi') return `<div class="p-m g-grid${fit}"${look}>${list.map((a) => `<figure${full(a)}>${one(a)}</figure>`).join('')}</div>`;
    return `<div class="p-m g-show${fit}"${look}>
      <div class="g-frame">
        <div class="g-track">${list.map((a) => `<div class="g-slide">${isVid(a) ? '' : `<img class="g-bg" src="${esc(a)}" alt="" aria-hidden="true">`}${one(a, true)}</div>`).join('')}</div>
        <button class="g-arrow g-prev" aria-label="${L('Ảnh trước', 'Previous')}">←</button><button class="g-arrow g-next" aria-label="${L('Ảnh sau', 'Next')}">→</button>
        <span class="mono g-count">01 / ${pad(list.length)}</span>
      </div>
      <div class="g-thumbs">${list.map((a, k) => `<button data-k="${k}" class="${k ? '' : 'on'}" aria-label="Ảnh ${k + 1}">${isVid(a) ? '<span>▶</span>' : `<img src="${esc(a)}" alt="">`}</button>`).join('')}</div>
    </div>`;
  }
  // Trình chiếu: mũi tên, ảnh nhỏ, vuốt ngang (điện thoại) đều dùng chung một dải cuộn ngang
  function initGalleries(root) {
    $$('.g-show', root).forEach((g) => {
      const track = $('.g-track', g), count = $('.g-count', g), thumbs = $$('.g-thumbs button', g), n = thumbs.length;
      let at = 0;
      const mark = (k) => {
        at = k;
        count.textContent = `${pad(k + 1)} / ${pad(n)}`;
        thumbs.forEach((b, x) => b.classList.toggle('on', x === k));
      };
      const go = (k) => {
        k = (k + n) % n; // qua ảnh cuối thì quay về ảnh đầu
        mark(k);
        $$('video', track).forEach((v) => v.pause());
        const left = k * track.clientWidth;
        track.scrollTo({ left, behavior: 'smooth' });
        // Trình duyệt nào không trượt mượt được thì chuyển thẳng tới ảnh
        setTimeout(() => { if (at === k && Math.abs(track.scrollLeft - left) > 4) track.scrollLeft = left; }, 700);
      };
      $('.g-prev', g).onclick = () => go(at - 1);
      $('.g-next', g).onclick = () => go(at + 1);
      thumbs.forEach((b) => { b.onclick = () => go(+b.dataset.k); });
      // Vuốt ngang trên điện thoại: cập nhật số thứ tự khi dừng ở ảnh khác
      track.addEventListener('scroll', () => {
        const k = Math.round(track.scrollLeft / track.clientWidth);
        if (k !== at && Math.abs(track.scrollLeft - k * track.clientWidth) < 4) mark(k);
      }, { passive: true });
    });
  }
  // Trên điện thoại: ảnh/video đầu tiên đứng trước phần chữ, phần còn lại xếp sau
  function firstMediaOnTop(root) {
    $$('.p-body', root).forEach((body) => {
      const m = $('.p-m', body), t = $('.p-t', body);
      if (m && t) body.insertBefore(m, t);
    });
  }

  // Liên hệ ở cuối mọi trang
  $('#links').innerHTML = (T.lienKet || []).filter((l) => l.nhan || l.chu).map((l) => {
    const ext = /^https?:/.test(l.link || '');
    const val = l.link ? `<a href="${esc(l.link)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${esc(l.chu)}</a>` : `<span>${esc(l.chu)}</span>`;
    return `<div><span class="mono">${esc(l.nhan)}</span>${val}</div>`;
  }).join('');


  // Thẻ video (trang Video: bấm mở bảng chi tiết · trang chủ: href dẫn sang trang Video, mở đúng dự án)
  const vcard = (v, i, href = '') => `
      <${href ? `a href="${href}"` : 'article'} class="vcard" data-i="${i}" data-cursor data-reveal>
        <div class="scr">
          ${v.video ? media(v.xemTruoc || v.video, v.tieuDe, v.anhBia ? `poster="${esc(v.anhBia)}"` : '') : media(v.bia, v.tieuDe)}
          <span class="mono idx">${pad(i + 1)}</span>
          ${v.thoiLuong ? `<span class="mono tc">${esc(v.thoiLuong)}</span>` : ''}
          <span class="play">▶</span>
          ${v.caseStudy ? '<span class="mono cs-badge">Case study</span>' : ''}
        </div>
        <div class="info">
          <div><h3>${esc(v.tieuDe)}</h3>${v.vaiTro ? `<p class="mono role">${esc(v.vaiTro)}</p>` : ''}${v.moTa ? `<p>${esc(v.moTa)}</p>` : ''}</div>
          <span class="mono kind">${esc(v.loai)}</span>
        </div>
      </${href ? 'a' : 'article'}>`;
  // Thẻ sản phẩm Design: ảnh bìa, tên, vai trò, mảng · năm
  const catName = (ma) => (CATS.find((c) => c.ma === ma) || {}).ten || '';
  const dcard = (p, j, href = `#sp-${p.i}`) => `
      <a class="dcard" href="${href}" data-i="${j}" data-cursor data-reveal>
        <div class="dthumb">${media(p.anh[0], p.tieuDe)}</div>
        <div class="info">
          <div><h3>${esc(p.tieuDe)}</h3>${p.vaiTro ? `<p class="mono role">${esc(p.vaiTro)}</p>` : ''}</div>
          <span class="mono kind">${esc([catName(p.nhom), p.nam].filter(Boolean).join(' · '))}</span>
        </div>
      </a>`;
  // Các con số nổi bật (tab About me)
  const numsHTML = (A) => (A.conSo || []).filter((c) => c.so).map((c) => `<div data-reveal><b>${esc(c.so)}</b><span>${esc(c.nhan)}</span></div>`).join('');

  const muc = new URLSearchParams(location.search).get('muc');
  // Tiêu đề theo vị trí ứng tuyển (tab About me → "Tiêu đề theo vị trí"): gửi link …/?vt=editor
  // Nhớ trong phiên xem, để bấm logo quay về trang chủ vẫn giữ đúng tiêu đề
  const viTri = (() => {
    const list = (D.about || {}).viTri || [];
    let ma = new URLSearchParams(location.search).get('vt');
    try { if (ma) sessionStorage.setItem('vt', ma); else ma = sessionStorage.getItem('vt'); } catch (e) { /* trình duyệt chặn lưu trữ */ }
    return list.find((v) => v.ma && v.ma === ma) || null;
  })();
  if (page === 'home') homePage(); else if (page === 'video') videoPage(); else designAll();

  // ======================= TRANG CHỦ =======================
  // Tên to + nghề + showreel · video nổi bật · Design · About · liên hệ
  function homePage() {
    const A = D.about || {};
    const role = (viTri && viTri.chucDanh) || A.chucDanh, line = (viTri && viTri.motCau) || A.motCau;
    document.title = [A.hoTen || name, role].filter(Boolean).join(' — ');
    $('#vh-name span').textContent = A.hoTen || name;
    $('#vh-role').textContent = role || '';
    $('#vh-line').textContent = line || '';
    // Phần được ưu tiên theo vị trí (video / design) đưa lên ngay dưới showreel
    if (viTri && viTri.uuTien) {
      const first = $(`[data-sec="${viTri.uuTien}"]`), top = $('[data-sec]');
      if (first && top && first !== top) top.before(first);
    }
    showreel();
    // Case study: thẻ nhỏ xếp cạnh nhau, bấm vào mở video và cuộn tới bài viết
    const cs = VS.map((v, i) => [v, i]).filter(([v]) => v.caseStudy);
    if (cs.length) {
      $('#cases').hidden = false;
      $('#case-list').innerHTML = cs.map(([v, i]) => `
        <a class="ccard" href="video.html#case-${i + 1}" data-cursor data-reveal>
          <div class="cthumb">${media(v.bia, v.tieuDe)}<span class="mono cs-badge">Case study</span></div>
          <div class="cbody">
            <div><h3>${esc(v.tieuDe)}</h3><p class="mono role">${esc([v.loai, v.nam].filter(Boolean).join(' · '))}</p></div>
            <span class="mono read">${L('Đọc →', 'Read →')}</span>
          </div>
        </a>`).join('');
    }
    // Video nổi bật: những video tick "Nổi bật ở trang chủ" trong Trình chỉnh sửa (chưa tick cái nào thì lấy 4 video đầu)
    const picked = VS.map((v, i) => [v, i]).filter(([v]) => v.noiBat);
    const feat = (picked.length ? picked : VS.map((v, i) => [v, i])).slice(0, 4);
    $('#vgrid').innerHTML = feat.map(([v, i]) => vcard(v, i, `video.html#video-${i + 1}`)).join('');
    // Design nổi bật: sản phẩm tick "Nổi bật ở trang chủ" (chưa tick thì lấy 3 sản phẩm đầu)
    const dp = DS.filter((p) => p.noiBat), dfeat = (dp.length ? dp : DS).slice(0, 3);
    $('#dgrid').innerHTML = dfeat.map((p, j) => dcard(p, j, `design.html#sp-${p.i}`)).join('');
    fillAbout(); // phần About (CV) ngay dưới
    // Mở bằng link …#about (nút "03 About" từ trang khác): cuộn tới sau khi nội dung đã vẽ xong
    if (location.hash === '#about') {
      const go = () => $('#about').scrollIntoView({ behavior: 'instant', block: 'start' });
      requestAnimationFrame(go);
      if (document.fonts) document.fonts.ready.then(go);
    }
  }

  // Showreel đầu trang chủ (tab Thông tin & liên hệ → "Showreel"): tự chạy không tiếng, bấm để xem có tiếng
  // Chưa có file (hoặc file lỗi) thì cả khối ẩn đi
  function showreel() {
    const box = $('#reel');
    if (!box || !T.showreel) return;
    const v = $('video', box), btn = $('.reel-btn', box);
    v.addEventListener('error', () => { box.hidden = true; });
    v.addEventListener('loadeddata', () => { box.hidden = false; });
    if (T.anhShowreel) v.poster = T.anhShowreel;
    v.src = T.showreel;
    v.play().catch(() => {});
    btn.addEventListener('click', () => {
      v.muted = false; v.controls = true; v.loop = false; v.currentTime = 0;
      v.play().catch(() => {});
      box.classList.add('on');
    });
  }

  // ======================= DESIGN: tất cả sản phẩm + nút lọc =======================
  function designAll() {
    document.title = `Design — ${(D.about || {}).hoTen || name}`;
    // ?muc=3d (link cũ) → mở sẵn bộ lọc 3D
    let filt = CATS.some((c) => c.ma === muc) ? muc : 'all';
    const shown = () => DS.filter((p) => filt === 'all' || p.nhom === filt);
    const chips = () => {
      $('#dfilter').innerHTML = [['all', L('Tất cả', 'All'), DS.length], ...CATS.map((c) => [c.ma, c.ten, inCat(c.ma).length])].filter(([, , n]) => n)
        .map(([m, t, n]) => `<button data-f="${esc(m)}" class="${m === filt ? 'on' : ''}">${esc(t)}<i>${n}</i></button>`).join('');
    };
    const draw = () => {
      chips();
      $('#dgrid').innerHTML = shown().map((p, j) => dcard(p, j)).join('') || `<p class="none">${L('Chưa có sản phẩm — thêm trong Trình chỉnh sửa.', 'No work yet.')}</p>`;
      $$('#dgrid [data-reveal]').forEach((el) => el.classList.add('in'));
      $$('#dgrid video[data-auto]').forEach((v) => v.play().catch(() => {}));
    };
    $('#dfilter').addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (b) { filt = b.dataset.f; draw(); } });
    draw();
    const P = makePanel({ items: shown, label: 'Design', hash: (p) => `sp-${p.i}`, body: (p) => `${aside(p, false)}${gallery(p.anh, p.tieuDe, p)}${p.caseStudy ? caseHTML(p.caseStudy) : ''}` });
    $('#dgrid').addEventListener('click', (e) => { const c = e.target.closest('.dcard'); if (c) { e.preventDefault(); P.open(+c.dataset.i); } });
    // Mở thẳng một sản phẩm: design.html#sp-3 (nút "Xem trên web" trong Trình chỉnh sửa, thẻ ở trang chủ)
    const m = location.hash.match(/^#sp-(\d+)$/);
    if (m) { filt = 'all'; draw(); const j = shown().findIndex((p) => p.i === +m[1]); if (j >= 0) P.open(j); }
  }

  // ======================= VIDEO =======================
  function videoPage() {
    document.title = `Video — ${(D.about || {}).hoTen || name}`;
    // Video: lưới video xem trước tự chạy, thấy sản phẩm ngay
    $('#vgrid').innerHTML = VS.map((v, i) => vcard(v, i)).join('');

    // Bảng chi tiết video
    const P = makePanel({ items: () => VS, label: 'Video', hash: (v, i) => `video-${i + 1}`, body: (v) => {
      const main = v.video ? `<video src="${esc(v.video)}"${v.anhBia ? ` poster="${esc(v.anhBia)}"` : ''} controls autoplay playsinline></video>`
        : v.yt ? `<div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/${v.yt}?rel=0" title="${esc(v.tieuDe)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`
        : `<img src="${esc(v.bia)}" alt="${esc(v.tieuDe)}">`;
      const extra = (v.anh || []).filter((a) => a !== v.bia || v.yt);
      return `${aside(v, true)}<div class="p-m">${main}</div>${v.caseStudy ? caseHTML(v.caseStudy) : ''}${gallery(extra, v.tieuDe, v)}`;
    } });
    $('#vgrid').addEventListener('click', (e) => { const c = e.target.closest('.vcard'); if (c) P.open(+c.dataset.i); });
    // #video-2 mở video số 2 · #case-2 mở video số 2 rồi cuộn tới phần case study
    const m = location.hash.match(/^#(video|case)-(\d+)$/);
    if (m) { P.open(+m[2] - 1); if (m[1] === 'case') P.toCase(900); } // đợi bảng trượt lên xong, video có kích thước
  }

  // Bảng chi tiết trượt lên (dùng chung cho Video và Design): ← → hoặc nút Trước/Tiếp để chuyển, Esc để đóng
  function makePanel({ items, label, hash, body }) {
    const panel = $('#panel'), content = $('#p-content'), where = $('#p-where');
    let cur = -1;
    const stop = () => $$('video', content).forEach((v) => v.pause());
    function open(i) {
      const L = items(), v = L[i];
      if (!v) return;
      stop();
      cur = i;
      const n = L.length, prev = L[(i - 1 + n) % n], next = L[(i + 1) % n];
      where.textContent = `${label} — ${pad(i + 1)} / ${pad(n)}`;
      content.innerHTML = `
        <div class="p-body">${body(v)}</div>
        ${n > 1 ? `<div class="p-nav">
          <button data-go="${(i - 1 + n) % n}"><span class="mono">← Trước</span><b>${esc(prev.tieuDe)}</b></button>
          <button data-go="${(i + 1) % n}"><span class="mono">Tiếp →</span><b>${esc(next.tieuDe)}</b></button>
        </div>` : ''}`;
      firstMediaOnTop(content);
      initGalleries(content);
      $$('video[data-auto]', content).forEach((x) => x.play().catch(() => {}));
      panel.classList.add('open');
      panel.scrollTop = 0;
      document.documentElement.classList.add('lock');
      history.replaceState(null, '', `#${hash(v, i)}`);
    }
    function close() {
      if (cur < 0) return;
      cur = -1;
      stop();
      panel.classList.remove('open');
      document.documentElement.classList.remove('lock');
      history.replaceState(null, '', location.pathname + location.search);
      setTimeout(() => { if (cur < 0) content.innerHTML = ''; }, 800);
    }
    // Cuộn bảng chi tiết tới phần case study (nút "Đọc case study ↓", link #case-n)
    // (trừ vị trí của chính bảng vì bảng có thể đang trượt lên)
    const toCase = (wait = 120) => setTimeout(() => {
      const c = $('#case', content);
      if (c) panel.scrollTo({ top: c.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop - 80, behavior: 'smooth' });
    }, wait);
    content.addEventListener('click', (e) => {
      const g = e.target.closest('[data-go]');
      if (g) open(+g.dataset.go);
      if (e.target.closest('[data-case]')) toCase();
    });
    $('#p-close').addEventListener('click', close);
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (cur >= 0 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) open((cur + (e.key === 'ArrowRight' ? 1 : -1) + items().length) % items().length);
    });
    panel.addEventListener('mouseenter', () => $('#cursor').classList.remove('big'));
    return { open, close, toCase };
  }

  // ======================= PHẦN ABOUT (CV, nằm trong trang chủ) =======================
  function fillAbout() {
    const A = D.about || {};
    $('#ab-sum').innerHTML = paras(A.tomTat);
    const phone = (T.lienKet || []).find((l) => /^tel:/.test(l.link || ''));
    $('#ab-contact').innerHTML = [
      T.email && `<a href="mailto:${esc(T.email)}">${esc(T.email)}</a>`,
      phone && `<a href="${esc(phone.link)}">${esc(phone.chu)}</a>`,
      A.khuVuc && `<span>${esc(A.khuVuc)}</span>`,
    ].filter(Boolean).join('');
    const nums = numsHTML(A);
    if (nums) $('#ab-nums').innerHTML = nums; else $('#ab-nums').remove();
    // Kinh nghiệm dạng gọn: thời gian | nơi làm | vai trò (mô tả chi tiết để trong file CV)
    const row = (list) => (list || []).filter((e) => e.vaiTro || e.noi).map((e) => `
      <div class="xp"><span class="mono">${esc(e.thoiGian)}</span><b>${esc(e.noi)}</b><span class="xp-role">${esc(e.vaiTro)}</span></div>`).join('');
    $('#ab-exp').innerHTML = row(A.kinhNghiem);
    $('#ab-act').innerHTML = row(A.hoatDong);
    $$('.xp-col').forEach((c) => { if (!$('.xp', c)) c.remove(); });
    // Nút Tải CV: chỉ hiện khi đã tải file CV lên trong Trình chỉnh sửa (tab About me)
    if (A.cv) {
      ['#cv-top', '#cv-bottom'].forEach((id) => { const a = $(id); a.href = A.cv; a.setAttribute('download', ''); });
      $('#cv-top').hidden = false; $('#cv-cta').hidden = false;
    }
  }


  // ======================= ẢNH TRANG TRÍ =======================
  // Ảnh đặt tự do ở 3 vùng: đầu trang Video, đầu trang About, phần liên hệ (sửa trong Trình chỉnh sửa → tab "Ảnh trang trí").
  // Mỗi ảnh: { src, x, y (tâm ảnh, % của vùng), w (% bề rộng vùng), xoay (độ), kieu: polaroid / hoa / tron / khung,
  //   chu (chữ viết tay dưới polaroid), lop: truoc / sau (trước hay sau chữ), xDT/yDT/wDT: vị trí riêng trên điện thoại, anDT: ẩn trên điện thoại }
  const editDeco = /[?&]trangtri=/.test(location.search) && window.parent !== window && window.parent.__deco;
  const isPhone = () => matchMedia('(max-width: 760px)').matches;
  function renderDeco() {
    const TT = (editDeco ? window.parent.__deco.get() : D.trangTri) || {}, phone = isPhone();
    $$('[data-deco]').forEach((zone) => {
      const key = zone.dataset.deco;
      $$(':scope > .deco', zone).forEach((x) => x.remove());
      (TT[key] || []).forEach((it, i) => {
        if (!it.src || (phone && it.anDT && !editDeco)) return;
        const x = phone && it.xDT != null ? it.xDT : it.x, y = phone && it.yDT != null ? it.yDT : it.y, w = phone && it.wDT != null ? it.wDT : it.w;
        const c = GIAO_DIEN.getCrop(TT, it.src);
        const el = document.createElement('figure');
        el.className = `deco ${it.kieu || 'polaroid'}${it.lop === 'sau' ? ' sau' : ''}${phone && it.anDT ? ' an-dt' : ''}`;
        el.style.cssText = `left:${+x}%;top:${+y}%;--w:${+w || 16}%;--rot:${+it.xoay || 0}deg`;
        el.innerHTML = (c ? GIAO_DIEN.cropImg(it.src, c) : `<img src="${esc(it.src)}" alt="" draggable="false">`) +
          (it.kieu === 'polaroid' && it.chu ? `<figcaption>${esc(it.chu)}</figcaption>` : '');
        el.dataset.i = i;
        if (editDeco) {
          const sel = window.parent.__deco.sel;
          if (sel && sel.zone === key && sel.i === i) el.classList.add('chon');
          // Kéo thả trong Trình chỉnh sửa: ghi lại vị trí mới (máy tính hoặc điện thoại tuỳ khung đang xem)
          el.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            window.parent.__deco.select(key, i);
            const r = zone.getBoundingClientRect(), sx = e.clientX, sy = e.clientY, x0 = +x, y0 = +y;
            el.setPointerCapture(e.pointerId);
            const mv = (ev) => {
              const nx = Math.round((x0 + (ev.clientX - sx) / r.width * 100) * 10) / 10, ny = Math.round((y0 + (ev.clientY - sy) / r.height * 100) * 10) / 10;
              el.style.left = nx + '%'; el.style.top = ny + '%';
              el._pos = [nx, ny];
            };
            const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); if (el._pos) window.parent.__deco.move(key, i, el._pos[0], el._pos[1], phone); };
            el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up);
          });
        }
        zone.append(el);
      });
    });
  }
  renderDeco();
  addEventListener('resize', () => { clearTimeout(renderDeco.t); renderDeco.t = setTimeout(renderDeco, 150); });
  if (editDeco) {
    window.__renderDeco = renderDeco;
    document.documentElement.classList.add('edit-deco');
    $$('[data-reveal]').forEach((e) => e.classList.add('in'));
  }

  // ---------- Hiệu ứng chung ----------
  // Hiện dần khi cuộn tới
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  $$('[data-reveal]').forEach((el) => io.observe(el));

  // Video không tiếng tự chạy khi thấy, tự dừng khi cuộn qua (đỡ nặng máy)
  const vio = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())), { threshold: 0.35 });
  $$('video[data-auto]').forEach((v) => vio.observe(v));

  // Con trỏ tròn "XEM" trên những thứ bấm được (chỉ máy tính)
  if (canHover) {
    const cursor = $('#cursor');
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    (function follow() {
      cx += (mx - cx) * 0.35; cy += (my - cy) * 0.35;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    })();
    $$('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
    });
  }
})();
