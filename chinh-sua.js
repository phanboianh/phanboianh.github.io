// Trình chỉnh sửa: thêm / sửa / xoá / sắp xếp sản phẩm, rồi bấm "Lưu" để ghi vào noi-dung.js.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const main = $('#main'), tabsEl = $('#tabs'), saveBtn = $('#save'), statusEl = $('#status');
  const year = String(new Date().getFullYear());
  const isVid = (x) => /\.(mp4|m4v|mov|webm)$/i.test(String(x || '').split(/[?#]/)[0]);
  const CAT_DEFAULT = [
    { ma: 'graphic', ten: 'Graphic design', moTa: '' }, { ma: 'illustration', ten: 'Illustration', moTa: '' },
    { ma: 'motion', ten: 'Motion design', moTa: '' }, { ma: '3d', ten: '3D', moTa: '' },
  ];

  // Mẫu trống khi bấm "+ Thêm"
  const blank = {
    design: () => ({ tieuDe: 'Sản phẩm mới', loai: '', nam: year, anh: [], moTa: '', chuThich: '', vaiTro: '', congCu: '', link: '' }),
    video: () => ({ tieuDe: 'Video mới', loai: '', nam: year, video: '', xemTruoc: '', anhBia: '', anh: [], thoiLuong: '', moTa: '', chuThich: '', vaiTro: '', congCu: '', link: '' }),
  };

  // ---------- Dữ liệu đang sửa ----------
  const S = JSON.parse(JSON.stringify(window.PORTFOLIO || { thongTin: {}, design: [], video: [] }));
  S.thongTin = S.thongTin || {};
  S.thongTin.lienKet = S.thongTin.lienKet || [];
  S.design = S.design || [];
  S.video = S.video || [];
  S.video.forEach((p) => { p.anh = Array.isArray(p.anh) ? p.anh : []; });
  S.about = S.about || {};
  ['conSo', 'kinhNghiem', 'hoatDong', 'kyNang', 'hocVan'].forEach((k) => { S.about[k] = S.about[k] || []; });
  S.nhomDesign = S.nhomDesign && S.nhomDesign.length ? S.nhomDesign : CAT_DEFAULT;
  S.design.forEach((p) => {
    p.anh = Array.isArray(p.anh) ? p.anh : p.anh ? [p.anh] : [];
    if (!S.nhomDesign.some((c) => c.ma === p.nhom)) p.nhom = S.nhomDesign[0].ma;
  });
  const catName = (ma) => (S.nhomDesign.find((c) => c.ma === ma) || {}).ten || '';

  const isYT = (t) => /youtu\.?be/.test(String(t || ''));
  let tab = ['info', 'design', 'video', 'about'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'design';
  const sel = { design: 0, video: 0 };
  let dirty = false, busy = 0;
  let filt = 'all'; // đang lọc mục nào trong tab Design

  // ---------- Lưu ----------
  function setDirty(v = true) {
    dirty = v;
    statusEl.textContent = busy ? 'Đang tải file lên…' : v ? 'Có thay đổi chưa lưu' : 'Đã lưu';
    statusEl.classList.toggle('dirty', v || busy > 0);
    saveBtn.disabled = !v || busy > 0;
  }
  async function save() {
    if (!dirty || busy) return;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Đang lưu…';
    try {
      const r = await fetch('/api/luu', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Portfolio': '1' }, body: JSON.stringify(S) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.loi);
      setDirty(false);
      toast('Đã lưu ✓  Bấm "Xem website" để xem');
    } catch (e) {
      toast('Chưa lưu được: ' + e.message, true);
      saveBtn.disabled = false;
    }
    saveBtn.textContent = 'Lưu thay đổi';
  }
  saveBtn.onclick = save;
  addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); } });
  addEventListener('beforeunload', (e) => { if (dirty || busy) { e.preventDefault(); e.returnValue = ''; } });

  // ---------- Thông báo nhỏ ----------
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg, err = false) {
    toastEl.textContent = msg;
    toastEl.className = 'toast on' + (err ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('on'), err ? 5000 : 2600);
  }

  // ---------- Các ô nhập ----------
  const field = (f, label, val, o = {}) => `
    <label class="field"><span>${label}${o.em ? `<em>${o.em}</em>` : ''}${o.max ? `<i class="counter" data-c="${f}"></i>` : ''}</span>
    <input data-f="${f}" value="${esc(val)}" placeholder="${esc(o.ph || '')}"${o.max ? ` data-max="${o.max}"` : ''}></label>`;
  const area = (f, label, val, hint) => `
    <label class="field"><span>${label}<em>${hint}</em></span><textarea data-f="${f}">${esc(val)}</textarea></label>`;

  function bindFields(root, obj, k) {
    $$('[data-f]', root).forEach((inp) => {
      const count = () => {
        const c = $(`[data-c="${inp.dataset.f}"]`, root);
        if (!c) return;
        c.textContent = `${inp.value.length}/${inp.dataset.max}`;
        c.classList.toggle('over', inp.value.length > +inp.dataset.max);
      };
      inp.addEventListener('input', () => {
        obj[inp.dataset.f] = inp.value;
        setDirty();
        count();
        if (k && ['tieuDe', 'loai', 'nam', 'nhom'].includes(inp.dataset.f)) renderList(k);
      });
      if (inp.dataset.max) count();
    });
  }

  // ---------- Vẽ giao diện ----------
  function render() {
    tabsEl.innerHTML = [['info', 'Thông tin & liên hệ'], ['about', 'About me'], ['design', 'Design', S.design.length], ['video', 'Video', S.video.length]]
      .map(([k, t, n]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${t}${n !== undefined ? `<b>${n}</b>` : ''}</button>`).join('');
    if (tab === 'info') return renderInfo();
    if (tab === 'about') return renderAbout();
    if (sel[tab] >= S[tab].length) sel[tab] = Math.max(0, S[tab].length - 1);
    main.innerHTML = '<div class="split"><div class="list" id="list"></div><div id="form"></div></div>';
    renderList(tab);
    renderForm(tab);
  }
  tabsEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    tab = b.dataset.tab;
    history.replaceState(null, '', '#' + tab);
    render();
    scrollTo(0, 0);
  });

  function thumbOf(k, p) {
    if (k === 'design') {
      const a = p.anh[0];
      return !a ? 'Chưa có ảnh' : isVid(a) ? `<video src="${esc(a)}#t=1" muted preload="metadata"></video>` : `<img src="${esc(a)}" alt="">`;
    }
    if (p.anhBia) return `<img src="${esc(p.anhBia)}" alt="">`;
    return p.video ? `<video src="${esc(p.xemTruoc || p.video)}#t=1" muted preload="metadata"></video>` : 'Chưa có video';
  }

  function renderList(k) {
    const el = $('#list');
    if (!el) return;
    const items = S[k];
    const show = (p) => k !== 'design' || filt === 'all' || p.nhom === filt;
    const chips = k !== 'design' ? '' : `<div class="chips">${[['all', 'Tất cả', items.length], ...S.nhomDesign.map((c) => [c.ma, c.ten, items.filter((p) => p.nhom === c.ma).length])]
      .map(([m, t, n]) => `<button data-filt="${esc(m)}" class="${filt === m ? 'on' : ''}">${esc(t)} <b>${n}</b></button>`).join('')}</div>`;
    const vis = items.map((p, i) => [p, i]).filter(([p]) => show(p));
    el.innerHTML = chips + `<button class="add" data-act="add">+ Thêm ${k === 'design' ? 'sản phẩm Design' : 'video'}</button>` +
      (vis.length ? vis.map(([p, i], vi) => {
        const missing = k === 'design' ? !p.anh.length : !p.video && !p.anhBia && !isYT(p.link);
        return `<div class="item ${i === sel[k] ? 'on' : ''}" data-i="${i}">
          <div class="th">${thumbOf(k, p)}</div>
          <div><b>${esc(p.tieuDe || '(chưa đặt tên)')}</b>${missing
            ? `<small class="warn">Chưa có ${k === 'design' ? 'ảnh' : 'video, link YouTube hay ảnh bìa'} — chưa hiện trên web</small>`
            : `<small>${[k === 'design' && filt === 'all' ? catName(p.nhom) : p.loai, p.nam].filter(Boolean).map(esc).join(' · ')}</small>`}</div>
          <div class="ord">
            <button class="icon" data-act="up" title="Đưa lên trên"${vi === 0 ? ' disabled' : ''}>↑</button>
            <button class="icon" data-act="down" title="Đưa xuống dưới"${vi === vis.length - 1 ? ' disabled' : ''}>↓</button>
          </div>
        </div>`;
      }).join('') : '<p class="empty">Chưa có sản phẩm nào trong mục này.</p>');
  }

  function mediaDesign(p) {
    return `<div class="field"><span>Ảnh / video<em>cái đầu tiên là ảnh bìa · thả nhiều file cùng lúc được · mục Motion design thì thả video vào đây</em></span>
      <div class="media">
        ${p.anh.map((a, j) => `<div class="m">${isVid(a) ? `<video src="${esc(a)}#t=1" muted preload="metadata"></video><span class="badge vid">Video</span>` : `<img src="${esc(a)}" alt="">`}${j === 0 ? '<span class="badge">Ảnh bìa</span>' : ''}
          <div class="tools">
            <button class="icon" data-act="img-left" data-j="${j}" title="Đưa lên trước"${j === 0 ? ' disabled' : ''}>←</button>
            <button class="icon" data-act="img-del" data-j="${j}" title="Bỏ ảnh này">✕</button>
            <button class="icon" data-act="img-right" data-j="${j}" title="Đưa ra sau"${j === p.anh.length - 1 ? ' disabled' : ''}>→</button>
          </div></div>`).join('')}
        <div class="drop" data-drop="anh"><div><b>+</b>Kéo ảnh hoặc video<br>vào đây, hoặc bấm để chọn</div></div>
      </div></div>`;
  }

  function mediaVideo(p) {
    const cover = `<div class="drop" data-drop="bia">${p.anhBia ? `<div><img src="${esc(p.anhBia)}" alt="" style="max-width:100%;max-height:110px;border-radius:6px;margin:0 auto 6px">Đổi ảnh bìa</div>` : '<div><b>+</b>Ảnh bìa<br>(không bắt buộc)</div>'}</div>`;
    return `<div class="field"><span>Video<em>MP4 hoặc MOV · máy sẽ tự nén cho nhẹ và tạo bản xem trước</em></span>
      <div class="vid">
        ${p.video
          ? `<video src="${esc(p.video)}"${p.anhBia ? ` poster="${esc(p.anhBia)}"` : ''} controls preload="metadata"></video>`
          : '<div class="drop" data-drop="video" style="min-height:220px"><div><b>+</b>Kéo video vào đây<br>hoặc bấm để chọn</div></div>'}
        <div class="side">${p.video ? '<div class="drop" data-drop="video"><div><b>↻</b>Đổi video khác</div></div>' : ''}${cover}</div>
      </div></div>`;
  }

  // Ảnh / video thêm (hiện dưới video chính trong trang chi tiết)
  function mediaExtra(p) {
    return `<div class="field"><span>Ảnh / video thêm<em>khung hình, hậu trường, clip ngắn… hiện dưới video chính · thả được cả file video</em></span>
      <div class="media">
        ${p.anh.map((a, j) => `<div class="m">${isVid(a) ? `<video src="${esc(a)}#t=1" muted preload="metadata"></video><span class="badge vid">Video</span>` : `<img src="${esc(a)}" alt="">`}
          <div class="tools">
            <button class="icon" data-act="img-left" data-j="${j}" title="Đưa lên trước"${j === 0 ? ' disabled' : ''}>←</button>
            <button class="icon" data-act="img-del" data-j="${j}" title="Bỏ ảnh này">✕</button>
            <button class="icon" data-act="img-right" data-j="${j}" title="Đưa ra sau"${j === p.anh.length - 1 ? ' disabled' : ''}>→</button>
          </div></div>`).join('')}
        <div class="drop" data-drop="anh"><div><b>+</b>Kéo ảnh hoặc video<br>vào đây</div></div>
      </div></div>`;
  }

  // Cách xếp ảnh/video trong trang chi tiết
  const LAYOUTS = [['trinhChieu', 'Trình chiếu — khung cố định, lướt bằng mũi tên ← →'], ['luoi', 'Lưới 2 cột — thấy nhiều ảnh cùng lúc'], ['doc', 'Xếp dọc — mỗi ảnh to, cuộn xuống để xem']];
  const layoutField = (p) => `<label class="field"><span>Bố cục ảnh<em>cách xếp ảnh/video trong trang của sản phẩm này</em></span>
    <select data-f="boCuc">${LAYOUTS.map(([v, t]) => `<option value="${v}"${(p.boCuc || 'trinhChieu') === v ? ' selected' : ''}>${t}</option>`).join('')}</select></label>`;

  function renderForm(k) {
    const f = $('#form'), i = sel[k], p = S[k][i];
    if (!p) { f.innerHTML = '<div class="form"><p class="empty">Bấm "+ Thêm" bên trái để tạo sản phẩm đầu tiên.</p></div>'; return; }
    const isD = k === 'design';
    f.innerHTML = `<div class="form">
      <div class="form-head">
        <h2>${isD ? 'Sản phẩm Design' : 'Video'} số ${i + 1}</h2>
        <a class="btn small" href="${isD ? `design.html?muc=${encodeURIComponent(p.nhom)}#sp-${i}` : `video.html#video-${i + 1}`}" target="_blank" title="Nhớ bấm Lưu trước">Xem trên web ↗</a>
        <button class="btn small danger" data-act="del">Xoá</button>
      </div>
      ${isD ? `<label class="field"><span>Thuộc mục<em>sản phẩm sẽ hiện trong trang của mục này</em></span>
        <select data-f="nhom">${S.nhomDesign.map((c) => `<option value="${esc(c.ma)}"${c.ma === p.nhom ? ' selected' : ''}>${esc(c.ten)}</option>`).join('')}</select></label>` : ''}
      <div id="mediaBox">${isD ? mediaDesign(p) : mediaVideo(p) + mediaExtra(p)}</div>
      ${layoutField(p)}
      <div class="grid2">
        ${field('tieuDe', 'Tên sản phẩm', p.tieuDe)}
        ${field('loai', 'Thể loại', p.loai, { ph: isD ? 'Ví dụ: Poster, 3D, Bao bì' : 'Ví dụ: Phim sản phẩm, Motion' })}
      </div>
      <div class="grid2">
        ${field('nam', 'Năm', p.nam)}
        ${isD ? '' : field('thoiLuong', 'Thời lượng', p.thoiLuong, { em: 'tự điền khi tải video', ph: '00:30' })}
      </div>
      ${field('moTa', 'Mô tả ngắn', p.moTa, { em: 'hiện ngay dưới hình, nên 1 câu', max: 80 })}
      ${area('chuThich', 'Chú thích chi tiết', p.chuThich, 'hiện khi người xem bấm vào sản phẩm · xuống dòng để tách đoạn')}
      <div class="grid2">
        ${field('vaiTro', 'Vai trò của bạn', p.vaiTro, { ph: 'Ví dụ: Concept, thiết kế, 3D' })}
        ${field('congCu', 'Công cụ', p.congCu, { ph: 'Ví dụ: Photoshop, Blender' })}
      </div>
      ${area('link', 'Link xem thêm', p.link, isD ? 'không bắt buộc · mỗi dòng một link · muốn đặt tên nút thì ghi: Tên nút | https://...'
        : 'link YouTube sẽ phát ngay trên web (không cần tải video lên) · mỗi dòng một link · đặt tên nút: Trailer | https://...')}
    </div>`;
    bindFields(f, p, k);
  }

  function renderInfo() {
    const t = S.thongTin;
    main.innerHTML = `<div class="form" style="max-width:920px">
      <div class="grid2">
        ${field('ten', 'Tên hiển thị', t.ten, { em: 'chữ to ở đầu trang' })}
        ${field('email', 'Email', t.email, { ph: 'ten@email.com' })}
      </div>
      <p class="section-title">Các mục trong Design</p>
      <div id="catRows">${S.nhomDesign.map((c, j) => `<div class="grid2">
        <label class="field"><span>Mục ${j + 1} — tên</span><input data-cat="${j}" data-cf="ten" value="${esc(c.ten)}"></label>
        <label class="field"><span>Mô tả ngắn<em>hiện trên ô của mục</em></span><input data-cat="${j}" data-cf="moTa" value="${esc(c.moTa)}"></label>
      </div>`).join('')}</div>
      <p class="section-title">Phần liên hệ</p>
      <div class="grid2">
        ${field('tieuDeLienHe', 'Câu lớn — dòng 1', t.tieuDeLienHe)}
        ${field('tieuDeLienHe2', 'Câu lớn — dòng 2 (chữ đỏ)', t.tieuDeLienHe2)}
      </div>
      <div class="field"><span>Các liên kết<em>Để trống ô Link nếu chỉ muốn hiện chữ</em></span>
        <div class="links-row hint"><span>Nhãn</span><span>Chữ hiển thị</span><span>Link</span><span></span></div>
        <div id="linkRows">${linkRows(t)}</div>
        <button class="btn small" data-act="link-add">+ Thêm liên kết</button>
        <p class="hint">Mẹo: điện thoại thì Link ghi tel:+84901234567 · email khác thì ghi mailto:ten@email.com</p>
      </div>
    </div>`;
    bindFields(main, t);
    bindLinks();
    $$('[data-cat]', main).forEach((inp) => inp.addEventListener('input', () => {
      S.nhomDesign[+inp.dataset.cat][inp.dataset.cf] = inp.value;
      setDirty();
    }));
  }
  const linkRows = (t) => t.lienKet.map((l, j) => `<div class="links-row">
      <input data-l="${j}" data-lf="nhan" value="${esc(l.nhan)}" placeholder="Instagram">
      <input data-l="${j}" data-lf="chu" value="${esc(l.chu)}" placeholder="@tenban">
      <input data-l="${j}" data-lf="link" value="${esc(l.link)}" placeholder="https://instagram.com/tenban">
      <button class="icon" data-act="link-del" data-j="${j}" title="Xoá dòng này">✕</button></div>`).join('');
  function bindLinks() {
    $$('[data-l]', main).forEach((inp) => inp.addEventListener('input', () => {
      S.thongTin.lienKet[+inp.dataset.l][inp.dataset.lf] = inp.value;
      setDirty();
    }));
  }

  // ---------- Tab About me ----------
  // Bảng nhiều dòng (kinh nghiệm, con số, kỹ năng, học vấn): mỗi dòng là một mục, có nút thêm / xoá / ↑↓
  const ROWS = {
    conSo: [['so', 'Con số', '1M+'], ['nhan', 'Ghi chú', 'lượt xem clip TikTok']],
    kinhNghiem: [['noi', 'Công ty / dự án', 'The 1210 Label'], ['thoiGian', 'Thời gian', '9/2025 – nay'], ['vaiTro', 'Vai trò', 'Freelancer · Video Editor'], ['moTa', 'Công việc (mỗi dòng một ý)', 'Viết kịch bản…', 1], ['ketQua', 'Kết quả (mỗi dòng một ý)', 'MV đạt 4,8K lượt xem…', 1]],
    get hoatDong() { return this.kinhNghiem; },
    kyNang: [['nhom', 'Nhóm kỹ năng', 'Video & nội dung'], ['muc', 'Các kỹ năng (mỗi dòng một kỹ năng)', 'Dựng video', 1]],
    hocVan: [['thoiGian', 'Thời gian', '2022 – 2026'], ['ten', 'Trường', 'Đại học…'], ['moTa', 'Ngành, xếp loại', 'Cử nhân…']],
  };
  const rowsHTML = (key) => `<div class="rows">${S.about[key].map((r, j) => `<div class="row-card">
      <div class="grid2">${ROWS[key].map(([f, label, ph, big]) => `<label class="field"${big ? ' style="grid-column:1/-1"' : ''}><span>${label}</span>${big
        ? `<textarea data-r="${key}" data-ri="${j}" data-rf="${f}" placeholder="${esc(ph)}" style="min-height:90px">${esc(r[f])}</textarea>`
        : `<input data-r="${key}" data-ri="${j}" data-rf="${f}" value="${esc(r[f])}" placeholder="${esc(ph)}">`}</label>`).join('')}</div>
      <div class="row-tools">
        <button class="icon" data-act="row-up" data-key="${key}" data-j="${j}" title="Đưa lên"${j === 0 ? ' disabled' : ''}>↑</button>
        <button class="icon" data-act="row-down" data-key="${key}" data-j="${j}" title="Đưa xuống"${j === S.about[key].length - 1 ? ' disabled' : ''}>↓</button>
        <button class="icon" data-act="row-del" data-key="${key}" data-j="${j}" title="Xoá mục này">✕</button>
      </div></div>`).join('')}
      <button class="btn small" data-act="row-add" data-key="${key}">+ Thêm</button></div>`;
  const photoHTML = (a) => a.anh
    ? `<img src="${esc(a.anh)}" alt="" style="width:100%;max-height:320px;object-fit:contain;border-radius:10px;background:#000">
       <div class="side"><div class="drop" data-drop="chan-dung"><div><b>↻</b>Đổi ảnh</div></div>
         <button class="btn small danger" data-act="chan-dung-del">Bỏ ảnh</button></div>`
    : '<div class="drop" data-drop="chan-dung" style="min-height:160px"><div><b>+</b>Kéo ảnh chân dung vào đây<br>(không bắt buộc)</div></div>';

  function renderAbout() {
    const a = S.about;
    main.innerHTML = `<div class="form" style="max-width:920px">
      <p class="hint" style="margin:0 0 18px">Nội dung trang <b>About</b> — trang đầu tiên của website (nút "01 About" trên menu). Email và số điện thoại lấy từ tab "Thông tin & liên hệ".</p>
      <div class="grid2">
        ${field('hoTen', 'Họ tên', a.hoTen, { em: 'chữ to đầu trang' })}
        ${field('chucDanh', 'Chức danh', a.chucDanh, { ph: 'Video Editor' })}
      </div>
      ${field('khuVuc', 'Khu vực', a.khuVuc, { ph: 'TP. Hồ Chí Minh, Việt Nam' })}
      ${area('tomTat', 'Giới thiệu', a.tomTat, 'xuống dòng để tách đoạn')}
      <div class="field"><span>Ảnh chân dung<em>ảnh dọc đẹp nhất · để trống thì phần chữ trải rộng</em></span><div class="vid" id="photoBox">${photoHTML(a)}</div></div>
      <p class="section-title">Con số nổi bật</p>${rowsHTML('conSo')}
      <p class="section-title">Kinh nghiệm làm việc</p>${rowsHTML('kinhNghiem')}
      <p class="section-title">Dự án & hoạt động</p>${rowsHTML('hoatDong')}
      <p class="section-title">Kỹ năng</p>${rowsHTML('kyNang')}
      <p class="section-title">Công cụ, học vấn, ngôn ngữ, mục tiêu</p>
      ${area('congCu', 'Công cụ', a.congCu, 'mỗi dòng một công cụ')}
      ${rowsHTML('hocVan')}
      <div style="height:18px"></div>
      ${area('ngonNgu', 'Ngôn ngữ', a.ngonNgu, 'mỗi dòng một ngôn ngữ')}
      ${area('mucTieu', 'Mục tiêu nghề nghiệp', a.mucTieu, 'xuống dòng để tách đoạn')}
    </div>`;
    bindFields(main, a);
    $$('[data-r]', main).forEach((inp) => inp.addEventListener('input', () => {
      S.about[inp.dataset.r][+inp.dataset.ri][inp.dataset.rf] = inp.value;
      setDirty();
    }));
  }

  // Sau khi tải file xong: chỉ vẽ lại phần ảnh/video, không làm mất chữ đang gõ
  function refreshMedia() {
    if (tab === 'info') return;
    if (tab === 'about') { const b = $('#photoBox'); if (b) b.innerHTML = photoHTML(S.about); return; }
    const p = S[tab][sel[tab]], b = $('#mediaBox');
    if (b && p) b.innerHTML = tab === 'design' ? mediaDesign(p) : mediaVideo(p) + mediaExtra(p);
    const tl = $('[data-f="thoiLuong"]');
    if (tl && p) tl.value = p.thoiLuong || '';
    renderList(tab);
  }

  // ---------- Bấm nút ----------
  main.addEventListener('click', (e) => {
    const fc = e.target.closest('[data-filt]');
    if (fc) {
      filt = fc.dataset.filt;
      const first = S.design.findIndex((p) => filt === 'all' || p.nhom === filt);
      if (first >= 0) sel.design = first;
      renderList('design'); renderForm('design');
      return;
    }
    const a = e.target.closest('[data-act]');
    if (a) {
      const act = a.dataset.act, k = tab, items = S[k], i = sel[k], p = items && items[i];
      const row = a.closest('.item'), ri = row ? +row.dataset.i : i;
      if (act === 'add') {
        items.unshift(k === 'design' ? { ...blank.design(), nhom: filt === 'all' ? S.nhomDesign[0].ma : filt } : blank[k]());
        sel[k] = 0;
        setDirty(); render();
        const t = $('[data-f="tieuDe"]'); if (t) { t.focus(); t.select(); }
      } else if (act === 'up' || act === 'down') {
        // Đổi chỗ với sản phẩm kề bên đang hiện trong danh sách (khi đang lọc theo mục)
        const visible = items.map((p, x) => x).filter((x) => k !== 'design' || filt === 'all' || items[x].nhom === filt);
        const pos = visible.indexOf(ri), j = visible[act === 'up' ? pos - 1 : pos + 1];
        if (j === undefined) return;
        [items[ri], items[j]] = [items[j], items[ri]];
        sel[k] = j;
        setDirty(); renderList(k); renderForm(k);
      } else if (act === 'del') {
        if (!confirm(`Xoá "${p.tieuDe}" khỏi website?\n\nFile ảnh/video vẫn còn trong máy, không bị xoá.`)) return;
        items.splice(i, 1);
        sel[k] = Math.max(0, i - 1);
        setDirty(); render();
      } else if (act === 'img-left' || act === 'img-right') {
        const j = +a.dataset.j, n = act === 'img-left' ? j - 1 : j + 1;
        [p.anh[j], p.anh[n]] = [p.anh[n], p.anh[j]];
        setDirty(); refreshMedia();
      } else if (act === 'img-del') {
        p.anh.splice(+a.dataset.j, 1);
        setDirty(); refreshMedia();
      } else if (act === 'row-add' || act === 'row-del' || act === 'row-up' || act === 'row-down') {
        const list = S.about[a.dataset.key], j = +a.dataset.j;
        if (act === 'row-add') list.push(Object.fromEntries(ROWS[a.dataset.key].map(([f]) => [f, ''])));
        else if (act === 'row-del') { if (!confirm('Xoá mục này?')) return; list.splice(j, 1); }
        else { const n = act === 'row-up' ? j - 1 : j + 1; [list[j], list[n]] = [list[n], list[j]]; }
        const y = scrollY; setDirty(); renderAbout(); scrollTo(0, y);
      } else if (act === 'chan-dung-del') {
        S.about.anh = '';
        setDirty(); refreshMedia();
      } else if (act === 'link-add') {
        S.thongTin.lienKet.push({ nhan: '', chu: '', link: '' });
        $('#linkRows').innerHTML = linkRows(S.thongTin); bindLinks(); setDirty();
      } else if (act === 'link-del') {
        S.thongTin.lienKet.splice(+a.dataset.j, 1);
        $('#linkRows').innerHTML = linkRows(S.thongTin); bindLinks(); setDirty();
      }
      return;
    }
    const it = e.target.closest('.item');
    if (it) { sel[tab] = +it.dataset.i; renderList(tab); renderForm(tab); return; }
    const d = e.target.closest('[data-drop]');
    if (d) pick(d.dataset.drop);
  });

  // ---------- Chọn / kéo thả file ----------
  const isVideoKind = (kind) => kind === 'video';
  function pick(kind) {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = isVideoKind(kind) ? 'video/*,.mov,.mp4,.m4v' : kind === 'anh' ? 'image/*,.heic,.heif,video/*,.mov,.mp4,.m4v' : 'image/*,.heic,.heif';
    inp.multiple = kind === 'anh';
    inp.onchange = () => handleFiles(kind, [...inp.files]);
    inp.click();
  }
  main.addEventListener('dragover', (e) => { const d = e.target.closest('[data-drop]'); if (d) { e.preventDefault(); d.classList.add('over'); } });
  main.addEventListener('dragleave', (e) => { const d = e.target.closest('[data-drop]'); if (d) d.classList.remove('over'); });
  main.addEventListener('drop', (e) => {
    const d = e.target.closest('[data-drop]');
    if (!d) return;
    e.preventDefault();
    d.classList.remove('over');
    handleFiles(d.dataset.drop, [...e.dataTransfer.files]);
  });
  // Thả file ra ngoài ô thì không để trình duyệt tự mở file đó
  addEventListener('dragover', (e) => e.preventDefault());
  addEventListener('drop', (e) => e.preventDefault());

  async function handleFiles(kind, files) {
    const target = kind === 'chan-dung' ? S.about : S[tab][sel[tab]];
    if (!target) return;
    const list = kind === 'anh' ? files : files.slice(0, 1);
    for (const file of list) {
      const img = /^image\//.test(file.type) || /\.(heic|heif)$/i.test(file.name);
      const vid = /^video\//.test(file.type) || /\.(mov|mp4|m4v)$/i.test(file.name);
      const okType = kind === 'anh' ? img || vid : isVideoKind(kind) ? vid : img;
      if (!okType) { toast(`"${file.name}" không phải ${isVideoKind(kind) ? 'video' : 'ảnh'}`, true); continue; }
      const job = addJob(file.name, vid);
      busy++; setDirty(dirty);
      try {
        const r = await upload(file, job.progress);
        if (kind === 'anh') target.anh.push(r.loai === 'video' ? r.video : r.duongDan);
        else if (kind === 'bia') target.anhBia = r.duongDan;
        else if (kind === 'chan-dung') target.anh = r.duongDan;
        else {
          Object.assign(target, { video: r.video, xemTruoc: r.xemTruoc, anhBia: r.anhBia });
          if (r.thoiLuong) target.thoiLuong = r.thoiLuong;
        }
        if (r.canhBao) toast(r.canhBao, true);
        job.done();
        busy--; setDirty();
        const shown = tab === 'info' ? S.thongTin : tab === 'about' ? S.about : S[tab][sel[tab]];
        if (shown === target) refreshMedia(); else if (tab !== 'info') renderList(tab);
      } catch (err) {
        job.fail(err.message);
        busy--; setDirty(dirty);
      }
    }
  }

  function upload(file, onProgress) {
    return new Promise((resolve, reject) => {
      const x = new XMLHttpRequest();
      x.open('POST', '/api/tai-len?ten=' + encodeURIComponent(file.name));
      x.setRequestHeader('X-Portfolio', '1');
      x.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
      x.onload = () => {
        try {
          const r = JSON.parse(x.responseText);
          r.ok ? resolve(r) : reject(new Error(r.loi));
        } catch { reject(new Error('Máy chủ trả lời không hợp lệ')); }
      };
      x.onerror = () => reject(new Error('Mất kết nối — cửa sổ Terminal của Trình chỉnh sửa còn mở không?'));
      x.send(file);
    });
  }

  // Bảng tiến độ tải lên ở góc phải dưới
  const jobsEl = document.createElement('div');
  jobsEl.className = 'jobs';
  document.body.append(jobsEl);
  function addJob(name, isVideo) {
    const el = document.createElement('div');
    el.className = 'job';
    el.innerHTML = `<span>Đang tải lên: ${esc(name)}</span><div class="bar"><i></i></div>`;
    jobsEl.append(el);
    const txt = el.firstChild, bar = $('i', el);
    return {
      progress: (p) => {
        bar.style.width = p * 100 + '%';
        if (p >= 1) txt.textContent = isVideo ? `Đang nén video ${name}… (có thể mất vài phút)` : `Đang xử lý ảnh ${name}…`;
      },
      done: () => { txt.textContent = `Xong: ${name}`; bar.style.width = '100%'; setTimeout(() => el.remove(), 2500); },
      fail: (msg) => {
        el.classList.add('err');
        txt.textContent = `Lỗi với ${name}: ${msg} (bấm để ẩn)`;
        $('.bar', el).remove();
        el.onclick = () => el.remove();
      },
    };
  }

  // ---------- Khởi động ----------
  (async () => {
    const blocked = (title, body) => {
      tabsEl.remove(); saveBtn.remove(); statusEl.remove();
      main.innerHTML = `<div class="blocker"><h2>${title}</h2>${body}</div>`;
    };
    if (!window.PORTFOLIO) {
      return blocked('File nội dung đang bị lỗi',
        '<p>Không đọc được <code>noi-dung.js</code> — có thể do sửa tay bị thiếu dấu phẩy hoặc dấu ngoặc.</p><p>Cách khôi phục: mở thư mục <code>tools/sao-luu</code>, chép bản mới nhất ra ngoài, đổi tên thành <code>noi-dung.js</code> và thay file cũ.</p>');
    }
    let ok = false;
    if (location.protocol !== 'file:') {
      try { ok = (await (await fetch('/api/ping')).json()).ok; } catch { ok = false; }
    }
    if (!ok) {
      return blocked('Hãy mở Trình chỉnh sửa đúng cách',
        '<p>Trang này cần chạy cùng máy chủ nhỏ trên máy bạn thì mới lưu được.</p><p>Vào Finder → thư mục <code>portfolio-web</code> → bấm đúp file <code>Mo-trinh-chinh-sua.command</code>. Trình duyệt sẽ tự mở lại trang này.</p>');
    }
    render();
  })();
})();
