// Vẽ website từ file noi-dung.js — dùng cho cả index.html (trang chủ) và design.html (trang từng mục).
// Khi thêm/bớt sản phẩm thì KHÔNG cần sửa file này — chỉ cần dùng Trình chỉnh sửa.
(() => {
  const D = window.PORTFOLIO;
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
    return { url: b.trim(), nhan: a.trim() || (site ? `Xem trên ${site}` : 'Xem thêm') };
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
  $('#logo').textContent = name;
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
    const cred = [['Thể loại', p.loai], ['Vai trò', p.vaiTro], ['Công cụ', p.congCu], ['Năm', p.nam], ['Thời lượng', isVideo && p.thoiLuong]]
      .filter(([, v]) => v).map(([t, v]) => `<div><dt class="mono">${t}</dt><dd>${esc(v)}</dd></div>`).join('');
    return `<aside class="p-t"><div class="in">
      <span class="mono kick">${[p.loai, p.nam].filter(Boolean).map(esc).join(' · ')}</span>
      <h2>${esc(p.tieuDe)}</h2>
      <div class="p-desc">${paras(p.chuThich || p.moTa)}</div>
      ${cred ? `<dl class="p-cred">${cred}</dl>` : ''}
      ${links(p.link).length ? `<div class="p-links">${links(p.link).map((l) => `<a class="p-link mono" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.nhan)} ↗</a>`).join('')}</div>` : ''}
    </div></aside>`;
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
        <button class="g-arrow g-prev" aria-label="Ảnh trước">←</button><button class="g-arrow g-next" aria-label="Ảnh sau">→</button>
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


  const muc = new URLSearchParams(location.search).get('muc');
  if (page === 'about') aboutPage(); else if (page === 'video') videoPage(); else if (muc) designPage(); else designHome();

  // ======================= DESIGN: 4 mục =======================
  function designHome() {
    document.title = `Design — ${name}`;
    $('#design-cat').remove();
    $('#n-design').textContent = `(${pad(DS.length)})`;
    // Design: 4 khung = 4 mục, ảnh bìa lấy từ sản phẩm đầu tiên của mục
    $('#cats').innerHTML = CATS.map((c, k) => {
      const list = inCat(c.ma), cover = list[0] && list[0].anh[0];
      return `<a class="cat${cover ? '' : ' empty'}" href="design.html?muc=${encodeURIComponent(c.ma)}" data-cursor data-reveal>
        ${cover ? media(cover, c.ten).replace(' loading="lazy"', '') : ''}
        <span class="mono no">${pad(k + 1)}</span>
        <div class="meta">
          <h3>${esc(c.ten)}</h3>
          ${c.moTa ? `<p>${esc(c.moTa)}</p>` : ''}
          <div class="foot mono"><span>${list.length ? pad(list.length) + ' sản phẩm' : 'Sắp có'}</span><b>Xem →</b></div>
        </div>
      </a>`;
    }).join('');

  }

  // ======================= VIDEO =======================
  function videoPage() {
    const A = D.about || {};
    document.title = `${A.hoTen || name} — ${A.chucDanh || 'Video'}`;
    $('#n-video').textContent = `(${pad(VS.length)})`;
    // Trang đầu tiên: một dòng cho người xem biết ngay đây là ai, làm nghề gì
    $('#who').innerHTML = [A.hoTen || name, A.chucDanh].filter(Boolean).map((x, k) => k ? `<b>${esc(x)}</b>` : esc(x)).join(' — ') +
      (A.motCau ? `<span>${esc(A.motCau)}</span>` : '');
    // Video: lưới video xem trước tự chạy, thấy sản phẩm ngay
    $('#vgrid').innerHTML = VS.map((v, i) => `
      <article class="vcard" data-i="${i}" data-cursor data-reveal>
        <div class="scr">
          ${v.video ? media(v.xemTruoc || v.video, v.tieuDe, v.anhBia ? `poster="${esc(v.anhBia)}"` : '') : media(v.bia, v.tieuDe)}
          <span class="mono idx">${pad(i + 1)}</span>
          ${v.thoiLuong ? `<span class="mono tc">${esc(v.thoiLuong)}</span>` : ''}
          <span class="play">▶</span>
        </div>
        <div class="info">
          <div><h3>${esc(v.tieuDe)}</h3>${v.vaiTro ? `<p class="mono role">${esc(v.vaiTro)}</p>` : ''}${v.moTa ? `<p>${esc(v.moTa)}</p>` : ''}</div>
          <span class="mono kind">${esc(v.loai)}</span>
        </div>
      </article>`).join('');

    // Bảng chi tiết video
    const panel = $('#panel'), content = $('#p-content'), where = $('#p-where');
    let cur = -1;
    const stop = () => $$('video', content).forEach((v) => v.pause());
    function openVideo(i) {
      const v = VS[i];
      if (!v) return;
      stop();
      cur = i;
      const n = VS.length, prev = VS[(i - 1 + n) % n], next = VS[(i + 1) % n];
      where.textContent = `01 Video — ${pad(i + 1)} / ${pad(n)}`;
      const main = v.video ? `<video src="${esc(v.video)}"${v.anhBia ? ` poster="${esc(v.anhBia)}"` : ''} controls autoplay playsinline></video>`
        : v.yt ? `<div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/${v.yt}?rel=0" title="${esc(v.tieuDe)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`
        : `<img src="${esc(v.bia)}" alt="${esc(v.tieuDe)}">`;
      const extra = (v.anh || []).filter((a) => a !== v.bia || v.yt);
      content.innerHTML = `
        <div class="p-body">${aside(v, true)}
          <div class="p-m">${main}</div>
          ${gallery(extra, v.tieuDe, v)}
        </div>
        ${n > 1 ? `<div class="p-nav">
          <button data-go="${(i - 1 + n) % n}"><span class="mono">← Trước</span><b>${esc(prev.tieuDe)}</b></button>
          <button data-go="${(i + 1) % n}"><span class="mono">Tiếp →</span><b>${esc(next.tieuDe)}</b></button>
        </div>` : ''}`;
      firstMediaOnTop(content);
      initGalleries(content);
      panel.classList.add('open');
      panel.scrollTop = 0;
      document.documentElement.classList.add('lock');
      history.replaceState(null, '', `#video-${i + 1}`);
    }
    function closeVideo() {
      if (cur < 0) return;
      cur = -1;
      stop();
      panel.classList.remove('open');
      document.documentElement.classList.remove('lock');
      history.replaceState(null, '', location.pathname + location.search);
      setTimeout(() => { if (cur < 0) content.innerHTML = ''; }, 800);
    }
    $('#vgrid').addEventListener('click', (e) => { const c = e.target.closest('.vcard'); if (c) openVideo(+c.dataset.i); });
    content.addEventListener('click', (e) => { const g = e.target.closest('[data-go]'); if (g) openVideo(+g.dataset.go); });
    $('#p-close').addEventListener('click', closeVideo);
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeVideo();
      if (cur >= 0 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) openVideo((cur + (e.key === 'ArrowRight' ? 1 : -1) + VS.length) % VS.length);
    });
    const m = location.hash.match(/^#video-(\d+)$/);
    if (m) openVideo(+m[1] - 1);

    panel.addEventListener('mouseenter', () => $('#cursor').classList.remove('big'));
  }

  // ======================= TRANG MỤC DESIGN =======================
  function designPage() {
    $('#design-home').remove();
    const ma = new URLSearchParams(location.search).get('muc');
    const k = Math.max(0, CATS.findIndex((c) => c.ma === ma));
    const c = CATS[k], list = inCat(c.ma);
    document.title = `${c.ten} — ${name}`;
    $('#cat-no').textContent = `${pad(k + 1)} / ${pad(CATS.length)} · ${pad(list.length)} sản phẩm`;
    $('#cat-name').textContent = c.ten;
    $('#cat-desc').textContent = c.moTa || '';
    $('#subnav').innerHTML = `<a class="back" href="design.html">← Design</a>` +
      CATS.map((x) => `<a href="design.html?muc=${encodeURIComponent(x.ma)}" class="tab${x === c ? ' on' : ''}"${x === c ? ' aria-current="page"' : ''}>${esc(x.ten)}<i>${inCat(x.ma).length}</i></a>`).join('');
    // Trên điện thoại thanh mục cuộn ngang: đưa nút đang chọn vào giữa
    const sn = $('#subnav'), on = $('.on', sn);
    if (on) sn.scrollLeft = on.offsetLeft - (sn.clientWidth - on.offsetWidth) / 2;

    $('#works').innerHTML = list.length ? list.map((p, j) => `
      <article class="work" id="sp-${p.i}">
        <span class="mono num">${pad(j + 1)} / ${pad(list.length)}</span>
        <div class="p-body">
          ${aside(p, false)}
          ${gallery(p.anh, p.tieuDe, p)}
        </div>
      </article>`).join('')
      : '<p class="none">Mục này chưa có sản phẩm — thêm trong Trình chỉnh sửa.</p>';
    firstMediaOnTop($('#works'));
    initGalleries($('#works'));

    const nx = CATS[(k + 1) % CATS.length], next = $('#cat-next');
    if (CATS.length > 1) {
      next.href = `design.html?muc=${encodeURIComponent(nx.ma)}`;
      next.innerHTML = `<span class="mono">Mục tiếp theo</span><b>${esc(nx.ten)} <span>→</span></b>`;
    } else next.remove();

    // Mở thẳng tới một sản phẩm, ví dụ design.html?muc=3d#sp-0
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => t.scrollIntoView(), 50); }
  }

  // ======================= TRANG ABOUT =======================
  function aboutPage() {
    const A = D.about || {};
    const lines = (t) => String(t || '').split(/\n+/).map((x) => x.trim()).filter(Boolean);
    document.title = `About — ${name}`;
    $('#ab-name').textContent = A.hoTen || name;
    $('#ab-role').textContent = A.chucDanh || '';
    $('#ab-line').textContent = A.motCau || '';
    $('#ab-sum').innerHTML = paras(A.tomTat);
    const ph = $('#ab-photo');
    if (A.anh) ph.innerHTML = `<img src="${esc(A.anh)}" alt="${esc(A.hoTen || name)}">`; else ph.remove();
    const phone = (T.lienKet || []).find((l) => /^tel:/.test(l.link || ''));
    $('#ab-contact').innerHTML = [
      T.email && `<a href="mailto:${esc(T.email)}">${esc(T.email)}</a>`,
      phone && `<a href="${esc(phone.link)}">${esc(phone.chu)}</a>`,
      A.khuVuc && `<span>${esc(A.khuVuc)}</span>`,
    ].filter(Boolean).join('');
    const nums = (A.conSo || []).filter((c) => c.so);
    $('#ab-nums').innerHTML = nums.map((c) => `<div data-reveal><b>${esc(c.so)}</b><span>${esc(c.nhan)}</span></div>`).join('');
    if (!nums.length) $('#ab-nums').remove();
    // Kinh nghiệm làm việc + Dự án & hoạt động: cùng một kiểu dòng (thời gian | nơi + vai trò | mô tả + kết quả)
    const exp = (list) => (list || []).filter((e) => e.vaiTro || e.noi).map((e) => `
      <div class="exp" data-reveal>
        <span class="mono">${esc(e.thoiGian)}</span>
        <div><h3>${esc(e.noi)}</h3><p class="org mono">${esc(e.vaiTro)}</p></div>
        <div class="d"><ul>${lines(e.moTa).map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
          ${lines(e.ketQua).length ? `<span class="mono res">Kết quả</span><ul>${lines(e.ketQua).map((m) => `<li>${esc(m)}</li>`).join('')}</ul>` : ''}</div>
      </div>`).join('');
    $('#ab-exp').innerHTML = exp(A.kinhNghiem);
    $('#ab-act').innerHTML = exp(A.hoatDong);
    if (!$('#ab-act').innerHTML.trim()) $('#ab-act').closest('section').remove();
    $('#ab-skills').innerHTML = (A.kyNang || []).filter((k) => k.nhom).map((k) => `
      <div><span class="mono">${esc(k.nhom)}</span><ul>${lines(k.muc).map((m) => `<li>${esc(m)}</li>`).join('')}</ul></div>`).join('');
    $('#ab-tools').innerHTML = lines(A.congCu).map((t) => `<li>${esc(t)}</li>`).join('');
    $('#ab-edu').innerHTML = (A.hocVan || []).filter((h) => h.ten).map((h) => `
      <div><span class="mono">${esc(h.thoiGian)}</span><h3>${esc(h.ten)}</h3><p>${esc(h.moTa)}</p></div>`).join('');
    $('#ab-lang').innerHTML = lines(A.ngonNgu).map((t) => `<li>${esc(t)}</li>`).join('');
    $('#ab-goal').innerHTML = paras(A.mucTieu);
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
