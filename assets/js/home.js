/* Home page effects: hex background, cipher-state window, counters, fade-in.
   Kept in its own file so the HTML minifier cannot break it. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HEX = '0123456789abcdef';
  function rb() { return HEX[Math.random() * 16 | 0] + HEX[Math.random() * 16 | 0]; }

  /* ---------- Background: grid of hex bytes that blink ---------- */
  var bg = document.getElementById('hex-bg');
  if (bg && bg.getContext) {
    var ctx = bg.getContext('2d');
    var CELL_W = 34, CELL_H = 26, cols = 0, rows = 0, cells = [];
    /* Catppuccin accents used for the flashes */
    var FLASH = ['203,166,247', '137,180,250', '166,227,161', '148,226,213'];

    function resize() {
      var dpr = window.devicePixelRatio || 1;
      var w = window.innerWidth, h = window.innerHeight;
      bg.width = w * dpr; bg.height = h * dpr;
      bg.style.width = w + 'px'; bg.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL_W) + 1;
      rows = Math.ceil(h / CELL_H) + 1;
      cells = [];
      for (var i = 0; i < cols * rows; i++) {
        cells.push({ v: rb(), glow: 0, c: FLASH[0] });
      }
      draw();
    }
    function draw() {
      var w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.font = '11px "JetBrains Mono", Menlo, Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var k = cells[r * cols + c];
          var x = c * CELL_W + CELL_W / 2, y = r * CELL_H + CELL_H / 2;
          if (k.glow > 0.02) {
            ctx.fillStyle = 'rgba(' + k.c + ',' + (0.08 + k.glow * 0.55).toFixed(3) + ')';
            k.glow *= 0.93;
          } else {
            ctx.fillStyle = 'rgba(88,91,112,0.16)';
            k.glow = 0;
          }
          ctx.fillText(k.v, x, y);
        }
      }
    }
    function tick() {
      var n = Math.max(4, cells.length / 120 | 0);
      for (var i = 0; i < n; i++) {
        var k = cells[Math.random() * cells.length | 0];
        if (k) { k.v = rb(); k.glow = 1; k.c = FLASH[Math.random() * FLASH.length | 0]; }
      }
      draw();
    }
    resize();
    window.addEventListener('resize', resize);
    if (!reduce) setInterval(tick, 90);
  }

  /* ---------- Cipher-state window ---------- */
  var grid = document.getElementById('cipher-state');
  if (grid) {
    var COLS = 8, ROWS = 6, boxes = [];
    for (var i = 0; i < COLS * ROWS; i++) {
      var s = document.createElement('span');
      s.textContent = rb();
      grid.appendChild(s);
      boxes.push(s);
    }
    var roundEl = document.getElementById('cipher-round');
    var statusEl = document.getElementById('cipher-status');
    var round = 1, step = 0;
    function flash(el, cls) {
      el.textContent = rb();
      el.classList.remove('hot', 'col');
      void el.offsetWidth;
      el.classList.add(cls);
    }
    function step1() {
      for (var n = 0; n < 3; n++) flash(boxes[Math.random() * boxes.length | 0], 'hot');
      if (step % 6 === 0) {
        var c = (step / 6) % COLS;
        for (var r = 0; r < ROWS; r++) flash(boxes[r * COLS + c], 'col');
      }
      if (step % 24 === 23 && roundEl) {
        round = round % 12 + 1;
        roundEl.textContent = (round < 10 ? '0' : '') + round;
        if (statusEl) {
          if (round === 12) { statusEl.textContent = 'ciphertext ready ✓'; statusEl.classList.add('ok'); }
          else if (round === 1) { statusEl.textContent = 'encrypting…'; statusEl.classList.remove('ok'); }
        }
      }
      step++;
    }
    if (!reduce) setInterval(step1, 120);
  }

  /* ---------- Count-up numbers and fade-in ---------- */
  function countUp(el) {
    var end = +el.getAttribute('data-count'), t0 = null;
    if (reduce) { el.textContent = end; return; }
    function f(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1000, 1);
      el.textContent = Math.round(end * p);
      if (p < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
  var items = document.querySelectorAll('.reveal, [data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    /* Only hide content once we know the observer will reveal it */
    document.documentElement.classList.add('reveal-on');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (e.target.hasAttribute('data-count')) countUp(e.target);
        else e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }
})();
