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
  const G = window.GIAO_DIEN;
  S.giaoDien = { ...G.DEFAULT, ...(S.giaoDien || {}) };
  S.trangTri = { home: [], about: [], contact: [], catAnh: {}, ...(S.trangTri || {}) };
  if (S.trangTri.video) { S.trangTri.home = S.trangTri.home.length ? S.trangTri.home : S.trangTri.video; delete S.trangTri.video; } // tên cũ của vùng trang chủ
  ['conSo', 'kinhNghiem', 'hoatDong', 'kyNang', 'hocVan'].forEach((k) => { S.about[k] = S.about[k] || []; });
  S.nhomDesign = S.nhomDesign && S.nhomDesign.length ? S.nhomDesign : CAT_DEFAULT;
  S.design.forEach((p) => {
    p.anh = Array.isArray(p.anh) ? p.anh : p.anh ? [p.anh] : [];
    if (!S.nhomDesign.some((c) => c.ma === p.nhom)) p.nhom = S.nhomDesign[0].ma;
  });
  const catName = (ma) => (S.nhomDesign.find((c) => c.ma === ma) || {}).ten || '';

  const isYT = (t) => /youtu\.?be/.test(String(t || ''));
  let tab = ['info', 'design', 'video', 'about', 'look', 'deco'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'design';
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
    tabsEl.innerHTML = [['info', 'Thông tin & liên hệ'], ['look', 'Giao diện'], ['deco', 'Ảnh trang trí'], ['about', 'About me'], ['design', 'Design', S.design.length], ['video', 'Video', S.video.length]]
      .map(([k, t, n]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${t}${n !== undefined ? `<b>${n}</b>` : ''}</button>`).join('');
    if (tab === 'info') return renderInfo();
    if (tab === 'about') return renderAbout();
    if (tab === 'look') return renderLook();
    if (tab === 'deco') return renderDeco();
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
          <div><b>${p.noiBat ? '⭐ ' : ''}${esc(p.tieuDe || '(chưa đặt tên)')}</b>${missing
            ? `<small class="warn">Chưa có ${k === 'design' ? 'ảnh' : 'video, link YouTube hay ảnh bìa'} — chưa hiện trên web</small>`
            : `<small>${[k === 'design' && filt === 'all' ? catName(p.nhom) : p.loai, p.nam].filter(Boolean).map(esc).join(' · ')}</small>`}</div>
          <div class="ord">
            <button class="icon" data-act="up" title="Đưa lên trên"${vi === 0 ? ' disabled' : ''}>↑</button>
            <button class="icon" data-act="down" title="Đưa xuống dưới"${vi === vis.length - 1 ? ' disabled' : ''}>↓</button>
          </div>
        </div>`;
      }).join('') : '<p class="empty">Chưa có sản phẩm nào trong mục này.</p>');
  }

  // Ảnh nhỏ trong ô ảnh/video: hiện đúng vùng đã cắt, kèm nút ✂ Cắt và ⤓ Cả hàng (hiện khi rê chuột)
  function thumbHTML(p, a, j) {
    const c = G.getCrop(p, a), row = p.caHang && p.caHang[a];
    const pic = c ? G.cropImg(a, c, c.r >= 1 ? 'w' : 'h') : isVid(a) ? `<video src="${esc(a)}#t=1" muted preload="metadata"></video>` : `<img src="${esc(a)}" alt="">`;
    return pic + (isVid(a) ? '<span class="badge vid">Video</span>' : '') + (c ? '<span class="badge cut">Đã cắt</span>' : '') + (row ? '<span class="badge row">Cả hàng</span>' : '') +
      `<div class="m-acts"><button class="crop-btn" data-act="crop" data-j="${j}">✂ Cắt</button>` +
      `<button class="crop-btn" data-act="full" data-j="${j}" title="Trong bố cục Lưới: tách ảnh/video này xuống một hàng riêng, rộng hết khung">${row ? '↺ Bỏ cả hàng' : '⤓ Cả hàng'}</button></div>`;
  }

  function mediaDesign(p) {
    return `<div class="field"><span>Ảnh / video<em>cái đầu tiên là ảnh bìa · thả nhiều file cùng lúc được · mục Motion design thì thả video vào đây</em></span>
      <div class="media">
        ${p.anh.map((a, j) => `<div class="m">${thumbHTML(p, a, j)}${j === 0 ? '<span class="badge">Ảnh bìa</span>' : ''}
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
        ${p.anh.map((a, j) => `<div class="m">${thumbHTML(p, a, j)}
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

  // Khung ảnh: tỉ lệ khung, vừa khung / phủ kín, giữ phần nào khi cắt
  const opts = (f, list, val) => `<select data-f="${f}">${list.map(([v, t]) => `<option value="${esc(v)}"${val === v ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
  const frameField = (p) => `<div class="field"><span>Khung ảnh<em>tỉ lệ khung dùng cho Trình chiếu; với Lưới / Xếp dọc chỉ áp dụng khi chọn "Phủ kín"</em></span>
    <div class="grid3">
      ${opts('khung', [['16 / 9', 'Ngang 16:9 — hợp video'], ['16 / 10', 'Ngang 16:10 (mặc định)'], ['4 / 3', 'Ngang 4:3'], ['1 / 1', 'Vuông 1:1'], ['4 / 5', 'Dọc 4:5 — hợp poster'], ['3 / 4', 'Dọc 3:4']], p.khung || '16 / 10')}
      ${opts('datAnh', [['vua', 'Vừa khung — thấy trọn ảnh'], ['phu', 'Phủ kín — lấp đầy khung, cắt mép']], p.datAnh || 'vua')}
      ${opts('layNet', [['center', 'Khi cắt: giữ phần giữa'], ['top', 'Khi cắt: giữ phần trên'], ['bottom', 'Khi cắt: giữ phần dưới']], p.layNet || 'center')}
    </div></div>`;

  // Xem trước ảnh của sản phẩm đúng như trên web: bố cục, tỉ lệ khung, vừa khung / phủ kín, phần giữ lại khi cắt
  let fpAt = 0;
  function framePreview(p) {
    const list = (p.anh || []).filter(Boolean);
    if (!list.length) return '<div class="fp-empty">Thêm ảnh để xem trước</div>';
    const phu = p.datAnh === 'phu', ratio = p.khung || '16 / 10', focus = p.layNet || 'center';
    const mode = list.length === 1 ? 'doc' : p.boCuc || 'trinhChieu';
    const R = G.ratioNum(ratio);
    const el = (a, cls = '') => {
      const c = cls && G.getCrop(p, a);
      if (isVid(a) && !c) return `<video class="${cls}" src="${esc(a)}#t=1" muted preload="metadata"></video>`;
      return c ? G.cropImg(a, c, cls === 'fp-main' && c.r < R ? 'h' : 'w') : `<img class="${cls}" src="${esc(a)}" alt="">`;
    };
    const look = `style="--ratio:${esc(ratio)};--focus:${esc(focus)}"`;
    if (mode === 'luoi') return `<div class="fp fp-grid${phu ? ' phu' : ''}" ${look}>${list.map((a) => `<figure${p.caHang && p.caHang[a] ? ' class="full"' : ''}>${el(a, 'fp-it')}</figure>`).join('')}</div>`;
    if (mode === 'doc') return `<div class="fp fp-doc${phu ? ' phu' : ''}" ${look}>${list.slice(0, 3).map((a) => `<figure>${el(a, 'fp-it')}</figure>`).join('')}${list.length > 3 ? `<p class="hint">… và ${list.length - 3} ảnh nữa xếp tiếp bên dưới</p>` : ''}</div>`;
    fpAt = Math.min(fpAt, list.length - 1);
    const a = list[fpAt];
    return `<div class="fp fp-show${phu ? ' phu' : ''}" ${look}>
      <div class="fp-frame">${isVid(a) ? '' : `<img class="fp-bg" src="${esc(a)}" alt="">`}${el(a, 'fp-main')}
        <button class="fp-arrow" data-act="fp-prev">←</button><button class="fp-arrow r" data-act="fp-next">→</button>
        <span class="fp-count">${String(fpAt + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}</span></div>
      <div class="fp-thumbs">${list.map((x, k) => `<button data-act="fp-go" data-k="${k}" class="${k === fpAt ? 'on' : ''}">${el(x)}</button>`).join('')}</div>
    </div>`;
  }
  const curItem = () => S[tab] && S[tab][sel[tab]];
  const refreshPreview = () => { const b = $('#framePrev'), p = curItem(); if (b && p) b.innerHTML = framePreview(p); };
  const refreshFrame = refreshPreview;

  // ---------- Cắt ảnh kiểu app Ảnh trên iPhone ----------
  // Kéo 4 góc / 4 cạnh để đổi vùng cắt, kéo bên trong để dời, chọn tỉ lệ có sẵn, bấm Xong để lưu.
  const RATIOS = [['free', 'Tự do'], ['orig', 'Gốc'], ['1', 'Vuông'], ['frame', 'Theo khung'], ['1.7778', '16:9'], ['1.3333', '4:3'], ['0.8', '4:5'], ['0.75', '3:4'], ['0.5625', '9:16']];
  function openCrop(p, src) {
    if (!src) return;
    const old = G.getCrop(p, src);
    let c = old ? { x: old.x, y: old.y, w: old.w, h: old.h } : { x: 0, y: 0, w: 1, h: 1 };
    let lock = null, nw = 1, nh = 1, mode = null, start = null;
    const ov = document.createElement('div');
    ov.className = 'cropper';
    ov.innerHTML = `<div class="cr-top"><button class="btn" data-c="cancel">Huỷ</button><b>Cắt ảnh</b>
        <div><button class="btn" data-c="reset">Đặt lại</button> <button class="btn primary" data-c="done">Xong</button></div></div>
      <div class="cr-stage"><div class="cr-img">${isVid(src) ? `<video src="${esc(src)}" muted loop playsinline autoplay preload="metadata"></video>` : `<img src="${esc(src)}" alt="" draggable="false">`}
        <div class="cr-box" data-h="move">${['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((h) => `<span class="cr-h ${h}" data-h="${h}"></span>`).join('')}</div></div></div>
      <div class="cr-ratios">${RATIOS.map(([k, t]) => `<button data-r="${k}">${t}</button>`).join('')}</div>
      <p class="cr-tip">Kéo góc hoặc cạnh để cắt · kéo bên trong khung để dời · bấm tỉ lệ để khoá hình dạng khung</p>`;
    document.body.append(ov);
    document.documentElement.style.overflow = 'hidden';
    const img = $('.cr-img > img, .cr-img > video', ov), box = $('.cr-box', ov), wrap = $('.cr-img', ov);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const draw = () => Object.assign(box.style, { left: c.x * 100 + '%', top: c.y * 100 + '%', width: c.w * 100 + '%', height: c.h * 100 + '%' });
    const k = () => (nw / nh) / lock; // khi khoá tỉ lệ: cao = rộng × k (tính theo phần của ảnh)
    // Vùng lớn nhất theo tỉ lệ đang khoá, đặt giữa vùng hiện tại
    function fitLock() {
      if (!lock) return;
      let w = 1, h = k();
      if (h > 1) { h = 1; w = 1 / k(); }
      const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
      c = { w, h, x: clamp(cx - w / 2, 0, 1 - w), y: clamp(cy - h / 2, 0, 1 - h) };
    }
    function move(m, dx, dy) {
      const s0 = start.c, MIN = .06;
      if (m === 'move') return { ...s0, x: clamp(s0.x + dx, 0, 1 - s0.w), y: clamp(s0.y + dy, 0, 1 - s0.h) };
      let l = s0.x, t = s0.y, r = s0.x + s0.w, b = s0.y + s0.h;
      if (m.includes('w')) l = clamp(l + dx, 0, r - MIN);
      if (m.includes('e')) r = clamp(r + dx, l + MIN, 1);
      if (m.includes('n')) t = clamp(t + dy, 0, b - MIN);
      if (m.includes('s')) b = clamp(b + dy, t + MIN, 1);
      let w = r - l, h = b - t;
      if (lock) {
        if (m === 'n' || m === 's') w = h / k(); else h = w * k();
        if (h > 1) { h = 1; w = h / k(); }
        if (w > 1) { w = 1; h = w * k(); }
        if (m.includes('n')) t = b - h; else if (m === 'e' || m === 'w') t = s0.y + s0.h / 2 - h / 2;
        if (m.includes('w')) l = r - w; else if (m === 'n' || m === 's') l = s0.x + s0.w / 2 - w / 2;
        l = clamp(l, 0, 1 - w); t = clamp(t, 0, 1 - h);
      }
      return { x: l, y: t, w, h };
    }
    const ready = () => { nw = img.naturalWidth || img.videoWidth || 1; nh = img.naturalHeight || img.videoHeight || 1; draw(); };
    if (img.tagName === 'VIDEO') { if (img.readyState >= 1) ready(); else img.addEventListener('loadedmetadata', ready); } else if (img.complete) ready(); else img.onload = ready;
    ov.addEventListener('pointerdown', (e) => {
      const h = e.target.closest('[data-h]');
      if (!h) return;
      e.preventDefault();
      mode = h.dataset.h; start = { px: e.clientX, py: e.clientY, c: { ...c } };
      ov.setPointerCapture(e.pointerId);
      box.classList.add('drag');
    });
    ov.addEventListener('pointermove', (e) => {
      if (!mode) return;
      c = move(mode, (e.clientX - start.px) / wrap.clientWidth, (e.clientY - start.py) / wrap.clientHeight);
      draw();
    });
    const end = () => { mode = null; box.classList.remove('drag'); };
    ov.addEventListener('pointerup', end);
    ov.addEventListener('pointercancel', end);
    const close = () => { ov.remove(); document.documentElement.style.overflow = ''; removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); if (e.key === 'Enter') done(); };
    addEventListener('keydown', onKey);
    function done() {
      p.catAnh = p.catAnh || {};
      const r4 = (v) => Math.round(v * 10000) / 10000;
      if (c.w > .995 && c.h > .995) delete p.catAnh[src]; // để nguyên cả ảnh = không cắt
      else p.catAnh[src] = { x: r4(c.x), y: r4(c.y), w: r4(c.w), h: r4(c.h), r: r4((c.w * nw) / (c.h * nh)) };
      setDirty(); close(); refreshMedia();
      toast(p.catAnh[src] ? 'Đã cắt ✓ — nhớ bấm Lưu' : 'Đã bỏ cắt');
    }
    ov.addEventListener('click', (e) => {
      const b = e.target.closest('[data-c]'), r = e.target.closest('[data-r]');
      if (b) {
        if (b.dataset.c === 'cancel') close();
        if (b.dataset.c === 'done') done();
        if (b.dataset.c === 'reset') { lock = null; c = { x: 0, y: 0, w: 1, h: 1 }; $$('[data-r]', ov).forEach((x) => x.classList.remove('on')); draw(); }
      }
      if (r) {
        const v = r.dataset.r;
        lock = v === 'free' ? null : v === 'orig' ? nw / nh : v === 'frame' ? G.ratioNum(p.khung) : +v;
        $$('[data-r]', ov).forEach((x) => x.classList.toggle('on', x === r));
        fitLock(); draw();
      }
    });
  }

  // ---------- Tab Ảnh trang trí: kéo thả ảnh ngay trên trang web thật ----------
  // Khung bên trái là chính trang web (iframe, chế độ ?trangtri=1); kéo ảnh trong đó để đổi vị trí.
  // Vị trí máy tính (x, y, w) và điện thoại (xDT, yDT, wDT) lưu riêng.
  const ZONES = [['home', 'Trang chủ', 'index.html', ''], ['about', 'Đầu trang About', 'about.html', ''], ['contact', 'Phần liên hệ', 'index.html', '#contact']];
  const KIEU = [['polaroid', 'Polaroid — khung trắng, băng dính'], ['hoa', 'Hoà vào nền — mép mờ dần'], ['tron', 'Tròn — viền màu nhấn'], ['khung', 'Khung mảnh']];
  let decoZone = 'home', decoDev = 'pc', decoSel = -1;
  window.__deco = {
    get: () => S.trangTri,
    get sel() { return decoSel >= 0 ? { zone: decoZone, i: decoSel } : null; },
    select(zone, i) {
      if (zone !== decoZone) return;
      decoSel = i; renderDecoSide(); markDecoSel();
    },
    move(zone, i, x, y, phone) {
      const it = S.trangTri[zone][i];
      if (phone) { it.xDT = x; it.yDT = y; if (it.wDT == null) it.wDT = it.w; } else { it.x = x; it.y = y; }
      setDirty();
    },
  };
  const decoWin = () => { const f = $('#decoFrame'); return f && f.contentWindow; };
  const decoFrame = () => { const w = decoWin(); if (w && w.__renderDeco) w.__renderDeco(); };
  const markDecoSel = () => {
    const w = decoWin(); if (!w || !w.document) return;
    w.document.querySelectorAll('.deco').forEach((d) => d.classList.toggle('chon', d.parentElement.dataset.deco === decoZone && +d.dataset.i === decoSel));
  };
  function renderDeco() {
    const z = ZONES.find((x) => x[0] === decoZone);
    main.innerHTML = `<div class="deco-top">
        <div class="chips">${ZONES.map(([k, t]) => `<button data-act="deco-zone" data-v="${k}" class="${k === decoZone ? 'on' : ''}">${t} <b>${S.trangTri[k].length}</b></button>`).join('')}</div>
        <div class="chips">${[['pc', '💻 Máy tính'], ['dt', '📱 Điện thoại']].map(([k, t]) => `<button data-act="deco-dev" data-v="${k}" class="${k === decoDev ? 'on' : ''}">${t}</button>`).join('')}</div>
      </div>
      <div class="deco-grid">
        <div class="deco-stage ${decoDev}" id="decoStage"><iframe id="decoFrame" title="Xem trước trang web" src="${z[2]}?trangtri=1${z[3]}"></iframe></div>
        <div class="form deco-side" id="decoSide"></div>
      </div>`;
    const f = $('#decoFrame'), st = $('#decoStage');
    const fit = () => { if (decoDev === 'pc') { const k = st.clientWidth / 1280; f.style.transform = `scale(${k})`; st.style.height = 800 * k + 'px'; } };
    fit(); addEventListener('resize', fit);
    f.addEventListener('load', () => {
      const d = f.contentDocument, el = d && d.querySelector(`[data-deco="${decoZone}"]`);
      if (el) f.contentWindow.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + f.contentWindow.scrollY - 90));
      markDecoSel();
    });
    renderDecoSide();
  }
  function renderDecoSide() {
    const box = $('#decoSide'); if (!box) return;
    const L = S.trangTri[decoZone], it = L[decoSel], phone = decoDev === 'dt';
    const thumb = (x) => { const c = G.getCrop(S.trangTri, x.src); return c ? G.cropImg(x.src, c, c.r >= 1 ? 'w' : 'h') : `<img src="${esc(x.src)}" alt="">`; };
    const w = it ? (phone && it.wDT != null ? it.wDT : it.w) : 0;
    box.innerHTML = `<p class="section-title first">Ảnh trong "${esc(ZONES.find((x) => x[0] === decoZone)[1])}"</p>
      <div class="deco-list">${L.map((x, i) => `<button class="deco-item${i === decoSel ? ' on' : ''}" data-act="deco-sel" data-i="${i}"><span class="m">${thumb(x)}</span>${esc(KIEU.find((k) => k[0] === x.kieu)?.[1].split(' —')[0] || 'Ảnh')}${x.anDT ? ' · ẩn trên ĐT' : ''}</button>`).join('')}
        <div class="drop" data-drop="deco"><div><b>+</b>Thêm ảnh</div></div></div>
      ${it ? `<p class="section-title">Ảnh đang chọn ${phone ? '<em class="dev">(đang chỉnh cho điện thoại)</em>' : ''}</p>
        <label class="field"><span>Kiểu</span><select data-dk="kieu">${KIEU.map(([v, t]) => `<option value="${v}"${(it.kieu || 'polaroid') === v ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
        ${(it.kieu || 'polaroid') === 'polaroid' ? `<label class="field"><span>Chữ viết tay dưới ảnh<em>không bắt buộc</em></span><input data-dk="chu" value="${esc(it.chu)}" placeholder="vd: Spring 2025"></label>` : ''}
        <label class="field"><span>Cỡ ảnh<em id="dkW">${w}%</em></span><input type="range" min="5" max="60" step="0.5" data-dk="w" value="${w}"></label>
        <label class="field"><span>Xoay<em id="dkR">${+it.xoay || 0}°</em></span><input type="range" min="-25" max="25" step="1" data-dk="xoay" value="${+it.xoay || 0}"></label>
        <label class="field"><span>Nằm</span><select data-dk="lop"><option value="truoc"${it.lop !== 'sau' ? ' selected' : ''}>Trước chữ</option><option value="sau"${it.lop === 'sau' ? ' selected' : ''}>Sau chữ</option></select></label>
        ${phone ? `<label class="field check"><input type="checkbox" data-dk="anDT"${it.anDT ? ' checked' : ''}> Ẩn ảnh này trên điện thoại</label>
          <button class="btn small" data-act="deco-resetdt">↺ Dùng lại vị trí như máy tính</button>` : ''}
        <div class="deco-btns">
          <button class="btn small" data-act="deco-crop">✂ Cắt ảnh</button>
          <button class="btn small" data-act="deco-layer" data-v="up" title="Đưa lên trên các ảnh khác">⬆ Lên trên</button>
          <button class="btn small" data-act="deco-layer" data-v="down" title="Đưa xuống dưới các ảnh khác">⬇ Xuống dưới</button>
          <button class="btn small danger" data-act="deco-del">Xoá ảnh</button>
        </div>` : `<p class="hint" style="margin-top:14px">Bấm vào một ảnh (ở danh sách hoặc ngay trên trang bên trái) để chỉnh.</p>`}
      <p class="hint" style="margin-top:16px">🖐 <b>Kéo ảnh trực tiếp trên trang bên trái</b> để đổi vị trí. Vị trí trên <b>máy tính</b> và <b>điện thoại</b> lưu riêng: bấm 📱 Điện thoại để sắp xếp riêng cho màn hình nhỏ. Xong nhớ bấm <b>Lưu thay đổi</b>.</p>`;
  }
  // ô tick (Nổi bật ở trang chủ)
  main.addEventListener('input', (e) => {
    const k = e.target.dataset.chk, it = k && S[tab] && S[tab][sel[tab]];
    if (!it) return;
    it[k] = e.target.checked;
    setDirty(); renderList(tab);
  });
  main.addEventListener('input', (e) => {
    const k0 = e.target.dataset.dk;
    if (tab !== 'deco' || !k0) return;
    const it = S.trangTri[decoZone][decoSel]; if (!it) return;
    const phone = decoDev === 'dt';
    const k = k0 === 'w' && phone ? 'wDT' : k0;
    it[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'range' ? +e.target.value : e.target.value;
    if (k0 === 'w') $('#dkW').textContent = e.target.value + '%';
    if (k0 === 'xoay') $('#dkR').textContent = e.target.value + '°';
    setDirty(); decoFrame();
    if (k0 === 'kieu' || k0 === 'anDT') renderDecoSide();
  });

  // ---------- Tab Giao diện: màu, font, cỡ chữ ----------
  function renderLook() {
    const g = S.giaoDien;
    const covers = S.nhomDesign.map((c) => (S.design.find((p) => p.nhom === c.ma && p.anh.length) || {}).anh).map((a) => (a && a[0]) || '');
    const fontOpts = (f) => opts(f, G.FONTS.map((x) => [x.ten, x.ten + (x.serif ? ' (có chân)' : '')]), g[f]);
    main.innerHTML = `<div class="form" style="max-width:1100px">
      <div class="look">
        <div>
          <p class="section-title first">Bộ màu có sẵn</p>
          <div class="presets">${G.PRESETS.map((p) => `<button class="preset${g.boMau === p.ma ? ' on' : ''}" data-preset="${p.ma}">
            <span style="background:${p.hieuUng === 'khong' ? p.nen : `radial-gradient(90% 90% at 90% 0%, ${p.mau2}, ${p.nen} 70%)`}"><i style="background:${p.chu}"></i><i style="background:${p.nhan}"></i></span>${p.ten}</button>`).join('')}</div>
          <p class="section-title">Tự chọn màu</p>
          <div class="grid3">
            <label class="field color"><span>Màu nền</span><input type="color" data-f="nen" value="${esc(g.nen)}"></label>
            <label class="field color"><span>Màu chữ</span><input type="color" data-f="chu" value="${esc(g.chu)}"></label>
            <label class="field color"><span>Màu nhấn<em>chữ đỏ, nút</em></span><input type="color" data-f="nhan" value="${esc(g.nhan)}"></label>
          </div>
          <p class="section-title">Hiệu ứng nền</p>
          <div class="grid2">
            <label class="field"><span>Kiểu nền</span>${opts('hieuUng', [['khong', 'Màu trơn'], ['gradient', 'Gradient — 2 vệt màu loang'], ['vutru', 'Vũ trụ — gradient + sao lấp lánh ✦']], g.hieuUng)}</label>
            <label class="field color"><span>Màu gradient<em>màu loang thứ hai</em></span><input type="color" data-f="mau2" value="${esc(g.mau2)}"></label>
          </div>
          <div class="grid2">
            <label class="field"><span>Độ sáng của sao<em id="saoVal">${Math.round(g.saoSang * 100)}%</em></span><input type="range" min="0.2" max="1" step="0.05" data-f="saoSang" value="${esc(g.saoSang)}"></label>
            <label class="field"><span>Khi cuộn xuống đọc</span>${opts('saoMoKhiCuon', [['co', 'Sao mờ dần — dễ đọc chữ hơn'], ['khong', 'Giữ nguyên độ sáng']], g.saoMoKhiCuon)}</label>
          </div>
          <p class="section-title">Viền quanh 4 mục Design</p>
          <div class="grid2">
            <label class="field"><span>Kiểu viền</span>${opts('vienPhim', [['phim', 'Dải phim — có lỗ phim'], ['mau', 'Viền màu trơn'], ['khong', 'Không viền']], g.vienPhim)}</label>
            <label class="field color"><span>Màu viền<em>dùng cho dải phim và viền trơn</em></span><input type="color" data-f="mauVien" value="${esc(g.mauVien)}"></label>
          </div>
          <p class="section-title">Font &amp; cỡ chữ</p>
          <div class="grid2">
            <label class="field"><span>Font tiêu đề<em>chữ to</em></span>${fontOpts('fontTieuDe')}</label>
            <label class="field"><span>Font chữ thường<em>đoạn văn</em></span>${fontOpts('fontChu')}</label>
          </div>
          <div class="grid2">
            <label class="field"><span>Cỡ tiêu đề<em id="tsVal">${Math.round(g.coTieuDe * 100)}%</em></span><input type="range" min="0.7" max="1.3" step="0.05" data-f="coTieuDe" value="${esc(g.coTieuDe)}"></label>
            <label class="field"><span>Độ đậm tiêu đề</span>${opts('doDam', [['400', 'Thường'], ['500', 'Vừa'], ['600', 'Đậm vừa'], ['700', 'Đậm']], String(g.doDam))}</label>
          </div>
          <p class="section-title">Ô ảnh bìa 4 mục Design</p>
          <label class="field"><span>Tỉ lệ ô</span>${opts('tiLeBia', [['3 / 4.3', 'Dọc cao (mặc định)'], ['3 / 4', 'Dọc 3:4'], ['4 / 5', 'Dọc 4:5'], ['1 / 1', 'Vuông'], ['4 / 3', 'Ngang 4:3']], g.tiLeBia)}</label>
          <button class="btn small" data-act="look-reset">↺ Về mặc định (Cinema)</button>
        </div>
        <div class="look-side">
          <p class="section-title first">Xem trước</p>
          <div class="lp" id="lookPreview">
            <div class="lp-nav"><b>${esc(S.thongTin.ten || 'Tên')}</b><span>01 Video</span><span class="on">02 Design</span><span>03 About</span></div>
            <div class="lp-kick">About me</div>
            <div class="lp-h">${esc(S.about.hoTen || S.thongTin.ten || 'Tên của bạn')}</div>
            <p class="lp-p">${esc(String(S.about.tomTat || 'Đoạn giới thiệu ngắn về bạn.').split('\n')[0])}</p>
            <div class="lp-row"><span class="lp-num">1,1M</span><span class="lp-btn">Xem trên YouTube ↗</span></div>
            <div class="lp-cats">${covers.map((c, i) => `<i>${c && !isVid(c) ? `<img src="${esc(c)}" alt="">` : ''}<b>${esc((S.nhomDesign[i] || {}).ten || '')}</b></i>`).join('')}</div>
          </div>
          <p class="hint">Bấm <b>Lưu thay đổi</b> rồi <b>Xem website ↗</b> để xem trên trang thật.</p>
        </div>
      </div>
    </div>`;
    bindFields(main, g);
    G.apply(g, $('#lookPreview'));
  }

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
      ${isD ? '' : `<label class="field check"><input type="checkbox" data-chk="noiBat"${p.noiBat ? ' checked' : ''}> ⭐ Nổi bật ở trang chủ <em style="font-weight:400;color:var(--mute)">(trang chủ hiện tối đa 4 video được tick)</em></label>`}
      <div id="mediaBox">${isD ? mediaDesign(p) : mediaVideo(p) + mediaExtra(p)}</div>
      ${layoutField(p)}
      ${frameField(p)}
      <div class="field"><span>Xem trước trên web<em>đổi bố cục / khung ở trên là thấy ngay · bấm ← → hoặc ảnh nhỏ để xem từng ảnh</em></span><div id="framePrev">${framePreview(p)}</div></div>
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
  function renderAbout() {
    const a = S.about;
    main.innerHTML = `<div class="form" style="max-width:920px">
      <p class="hint" style="margin:0 0 18px">Nội dung trang <b>About</b> (nút "03 About" trên menu, giống một bản CV). Tên và nghề cũng hiện ở đầu trang Video, là trang đầu tiên của web. Email và số điện thoại lấy từ tab "Thông tin & liên hệ".</p>
      <div class="grid2">
        ${field('hoTen', 'Họ tên', a.hoTen, { em: 'chữ to đầu trang' })}
        ${field('chucDanh', 'Nghề / chức danh', a.chucDanh, { em: 'chữ to, màu nhấn', ph: 'Video Editor & Scriptwriter' })}
      </div>
      ${field('motCau', 'Một câu nói bạn làm gì', a.motCau, { em: 'hiện dưới nghề, và ở đầu trang Video', ph: 'Mình viết kịch bản và dựng MV, phim ngắn…', max: 110 })}
      ${field('khuVuc', 'Khu vực', a.khuVuc, { ph: 'TP. Hồ Chí Minh, Việt Nam' })}
      ${area('tomTat', 'Giới thiệu', a.tomTat, 'xuống dòng để tách đoạn')}
      <p class="hint">📷 Ảnh của bạn (chân dung, polaroid, ảnh tròn…) giờ thêm, xoá và kéo vị trí trong tab <b>Ảnh trang trí</b>.</p>
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
    if (tab === 'about') return;
    if (tab === 'deco') { renderDecoSide(); decoFrame(); return; }
    const p = S[tab][sel[tab]], b = $('#mediaBox');
    if (b && p) b.innerHTML = tab === 'design' ? mediaDesign(p) : mediaVideo(p) + mediaExtra(p);
    refreshFrame();
    const tl = $('[data-f="thoiLuong"]');
    if (tl && p) tl.value = p.thoiLuong || '';
    renderList(tab);
  }

  main.addEventListener('input', (e) => {
    if ((tab === 'design' || tab === 'video') && ['boCuc', 'khung', 'datAnh', 'layNet'].includes(e.target.dataset.f)) return refreshFrame();
    if (tab !== 'look' || !e.target.dataset.f) return;
    const g = S.giaoDien;
    if (['nen', 'chu', 'nhan'].includes(e.target.dataset.f)) { g.boMau = 'tuChon'; $$('.preset', main).forEach((b) => b.classList.remove('on')); }
    if (e.target.dataset.f === 'coTieuDe') $('#tsVal').textContent = Math.round(g.coTieuDe * 100) + '%';
    if (e.target.dataset.f === 'saoSang') $('#saoVal').textContent = Math.round(g.saoSang * 100) + '%';
    G.apply(g, $('#lookPreview'));
  });

  // ---------- Bấm nút ----------
  main.addEventListener('click', (e) => {
    const pr = e.target.closest('[data-preset]');
    if (pr) {
      const p = G.PRESETS.find((x) => x.ma === pr.dataset.preset);
      Object.assign(S.giaoDien, { boMau: p.ma, nen: p.nen, chu: p.chu, nhan: p.nhan, hieuUng: p.hieuUng, mau2: p.mau2 });
      setDirty(); renderLook();
      return;
    }
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
      } else if (act === 'full') {
        const src = p.anh[+a.dataset.j];
        p.caHang = p.caHang || {};
        if (p.caHang[src]) delete p.caHang[src]; else p.caHang[src] = true;
        setDirty(); refreshMedia();
        if (p.caHang[src] && p.boCuc !== 'luoi') toast('"Cả hàng" có tác dụng khi Bố cục ảnh là Lưới 2 cột');
      } else if (act === 'crop') {
        openCrop(p, p.anh[+a.dataset.j]);
      } else if (act === 'fp-prev' || act === 'fp-next' || act === 'fp-go') {
        const n = (p.anh || []).length;
        fpAt = act === 'fp-go' ? +a.dataset.k : (fpAt + (act === 'fp-next' ? 1 : -1) + n) % n;
        refreshFrame();
      } else if (act === 'look-reset') {
        S.giaoDien = { ...G.DEFAULT };
        setDirty(); renderLook();
      } else if (act === 'row-add' || act === 'row-del' || act === 'row-up' || act === 'row-down') {
        const list = S.about[a.dataset.key], j = +a.dataset.j;
        if (act === 'row-add') list.push(Object.fromEntries(ROWS[a.dataset.key].map(([f]) => [f, ''])));
        else if (act === 'row-del') { if (!confirm('Xoá mục này?')) return; list.splice(j, 1); }
        else { const n = act === 'row-up' ? j - 1 : j + 1; [list[j], list[n]] = [list[n], list[j]]; }
        const y = scrollY; setDirty(); renderAbout(); scrollTo(0, y);
      } else if (act === 'deco-zone' || act === 'deco-dev') {
        if (act === 'deco-zone') { decoZone = a.dataset.v; decoSel = -1; } else decoDev = a.dataset.v;
        renderDeco();
      } else if (act === 'deco-sel') {
        decoSel = +a.dataset.i; renderDecoSide(); markDecoSel();
      } else if (act === 'deco-del') {
        if (!confirm('Bỏ ảnh này khỏi trang?\n\nFile ảnh vẫn còn trong máy, không bị xoá.')) return;
        S.trangTri[decoZone].splice(decoSel, 1); decoSel = -1;
        setDirty(); renderDecoSide(); decoFrame();
      } else if (act === 'deco-crop') {
        openCrop(S.trangTri, S.trangTri[decoZone][decoSel].src);
      } else if (act === 'deco-resetdt') {
        const it = S.trangTri[decoZone][decoSel];
        ['xDT', 'yDT', 'wDT'].forEach((k) => delete it[k]);
        setDirty(); renderDecoSide(); decoFrame();
      } else if (act === 'deco-layer') {
        const L = S.trangTri[decoZone], j = decoSel, n = a.dataset.v === 'up' ? j + 1 : j - 1;
        if (n < 0 || n >= L.length) return;
        [L[j], L[n]] = [L[n], L[j]]; decoSel = n;
        setDirty(); renderDecoSide(); decoFrame();
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
    if (it) { fpAt = 0; sel[tab] = +it.dataset.i; renderList(tab); renderForm(tab); return; }
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
    const target = kind === 'deco' ? S.trangTri : S[tab][sel[tab]];
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
        else if (kind === 'deco') {
          // ảnh mới: polaroid giữa vùng, lệch nhẹ; tự chọn để chỉnh luôn
          target[decoZone].push({ src: r.duongDan, x: 60, y: 50, w: 14, xoay: -4, kieu: 'polaroid', chu: '', lop: 'truoc' });
          decoSel = target[decoZone].length - 1;
        }
        else {
          Object.assign(target, { video: r.video, xemTruoc: r.xemTruoc, anhBia: r.anhBia });
          if (r.thoiLuong) target.thoiLuong = r.thoiLuong;
        }
        if (r.canhBao) toast(r.canhBao, true);
        job.done();
        busy--; setDirty();
        const shown = tab === 'info' ? S.thongTin : tab === 'about' ? S.about : tab === 'deco' ? S.trangTri : S[tab][sel[tab]];
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
