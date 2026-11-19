(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) Hero network: thin purple threads between drifting nodes (brand motif)
  var cv = document.querySelector('.net');
  if (cv && !reduce) {
    var ctx = cv.getContext('2d'), nodes = [], W, H, mouse = { x: -999, y: -999 };
    function size() {
      var r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      var n = Math.round(Math.min(70, W * H / 14000)); nodes = [];
      for (var i = 0; i < n; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, p: Math.random() * 6 });
    }
    cv.parentNode.addEventListener('mousemove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    cv.parentNode.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });
    var t = 0, vis = true;
    new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(cv);
    function frame() {
      requestAnimationFrame(frame); if (!vis) return; t += .02;
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(function (a) { a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1; });
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, dd = dx * dx + dy * dy;
          if (dd < 19000) { ctx.strokeStyle = 'rgba(168,85,247,' + (.45 * (1 - dd / 19000)) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        var mx = a.x - mouse.x, my = a.y - mouse.y;
        if (mx * mx + my * my < 26000) { ctx.strokeStyle = 'rgba(216,180,254,.7)'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
        ctx.fillStyle = 'rgba(192,132,252,' + (.55 + .35 * Math.sin(t + a.p)) + ')';
        ctx.beginPath(); ctx.arc(a.x, a.y, 2, 0, 6.3); ctx.fill();
      }
    }
    size(); addEventListener('resize', size); frame();
  }

  // 2) Highlighter sweep + count-up when scrolled into view
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      if (e.target.classList.contains('mark')) e.target.classList.add('on');
    });
  }, { threshold: .6 });
  document.querySelectorAll('.mark').forEach(function (m) { io.observe(m); });

  document.querySelectorAll('[data-count]').forEach(function (el) {
    if (reduce) return;
    var to = +el.dataset.count, suf = el.textContent.replace(/[0-9,]/g, ''), t0 = null;
    function step(ts) { t0 = t0 || ts; var k = Math.min((ts - t0) / 1400, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(step); }
    el.textContent = '0' + suf; requestAnimationFrame(step);
  });

  // 3) Cursor glow in the people section
  document.querySelectorAll('section.tint').forEach(function (s) {
    s.addEventListener('mousemove', function (e) { var r = s.getBoundingClientRect(); s.style.setProperty('--mx', (e.clientX - r.left) + 'px'); s.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
})();
