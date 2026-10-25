// Phần dùng chung cho 3 bản thử phong cách:
// hiện dần khi cuộn, video tự chạy khi rê chuột, và khung xem video/ảnh lớn.
(() => {
  const canHover = matchMedia('(hover: hover)').matches;

  // 1. Hiện dần: thêm class "in" khi phần tử [data-reveal] lọt vào màn hình
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  // 2. Video xem trước: máy tính thì rê chuột mới chạy, điện thoại thì chạy khi cuộn tới
  document.querySelectorAll('[data-play]').forEach((card) => {
    const v = card.querySelector('video');
    if (!v) return;
    const play = () => v.play().catch(() => {});
    if (canHover) {
      card.addEventListener('mouseenter', play);
      card.addEventListener('mouseleave', () => v.pause());
    } else {
      new IntersectionObserver(([e]) => (e.isIntersecting ? play() : v.pause()), { threshold: 0.6 }).observe(v);
    }
  });

  // 3. Khung xem lớn: [data-full="video.mp4"] hoặc [data-img="anh.jpg"]
  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.innerHTML = '<button class="lb-x" aria-label="Đóng">×</button><div class="lb-stage"></div>';
  document.body.append(lb);
  const stage = lb.querySelector('.lb-stage');
  const close = () => { lb.classList.remove('open'); setTimeout(() => (stage.innerHTML = ''), 300); };

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-full],[data-img]');
    if (!t) return;
    e.preventDefault();
    if (t.dataset.full) {
      stage.innerHTML = `<video src="${t.dataset.full}" controls autoplay playsinline></video>`;
    } else {
      stage.innerHTML = `<img src="${t.dataset.img}" alt="">`;
    }
    lb.classList.add('open');
  });
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.lb-x')) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();
