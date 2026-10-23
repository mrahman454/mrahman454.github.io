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
            ctx.fillStyle = 'rgba(' + k.c + ',' + (0.05 + k.glow * 0.32).toFixed(3) + ')';
            k.glow *= 0.93;
          } else {
            ctx.fillStyle = 'rgba(88,91,112,0.09)';
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

/* ---------- The cipher window runs away from the cursor ---------- */
(function () {
  var win = document.querySelector('.t-win');
  if (!win) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var status = document.getElementById('cipher-status');
  var TAUNTS = ['access denied', 'nice try 😉', 'key not found', 'too slow!', 'brute force? no.', 'can’t catch me'];
  var NEAR = 70;          /* px: how close the cursor may get before it dodges */
  var MAX = 260;          /* px: furthest it may wander from its home */
  var MARGIN = 12;        /* px: keep this far from the window edges */
  var ox = 0, oy = 0, homeTimer = null, tauntTimer = null, lastMove = 0;

  win.style.transition = 'transform 0.35s cubic-bezier(.2,.9,.3,1.2)';
  win.style.willChange = 'transform';
  win.style.position = 'relative';
  win.style.zIndex = '2';

  function apply() { win.style.transform = 'translate(' + ox + 'px,' + oy + 'px)'; }

  function taunt() {
    if (!status) return;
    status.textContent = TAUNTS[Math.random() * TAUNTS.length | 0];
    status.classList.remove('ok');
    status.style.color = '#f38ba8';
    clearTimeout(tauntTimer);
    tauntTimer = setTimeout(function () {
      status.style.color = '';
      status.textContent = 'encrypting…';
    }, 1600);
  }

  function goHomeLater() {
    clearTimeout(homeTimer);
    homeTimer = setTimeout(function () { ox = 0; oy = 0; apply(); }, 2200);
  }

  /* Box position if it sat at offset (nx, ny) */
  function rectAt(nx, ny) {
    var r = win.getBoundingClientRect();
    /* subtract the offset it actually has right now (it may be mid-slide) */
    var cx = 0, cy = 0, t = getComputedStyle(win).transform;
    if (t && t !== 'none' && window.DOMMatrixReadOnly) {
      var m = new DOMMatrixReadOnly(t); cx = m.m41; cy = m.m42;
    }
    var bx = r.left - cx, by = r.top - cy;
    return { left: bx + nx, top: by + ny, right: bx + nx + r.width, bottom: by + ny + r.height };
  }
  function fits(r) {
    return r.left >= MARGIN && r.top >= MARGIN + 50 &&
           r.right <= window.innerWidth - MARGIN && r.bottom <= window.innerHeight - MARGIN;
  }
  function distTo(r, x, y) {
    var dx = Math.max(r.left - x, 0, x - r.right);
    var dy = Math.max(r.top - y, 0, y - r.bottom);
    return Math.sqrt(dx * dx + dy * dy);
  }

  function dodge(x, y) {
    var best = null, bestD = -1;
    /* try a ring of directions and distances, keep the one farthest from the cursor */
    for (var a = 0; a < 16; a++) {
      var ang = a / 16 * Math.PI * 2;
      for (var s = 140; s <= 260; s += 60) {
        var nx = ox + Math.cos(ang) * s, ny = oy + Math.sin(ang) * s;
        if (Math.abs(nx) > MAX || Math.abs(ny) > MAX) continue;
        var r = rectAt(nx, ny);
        if (!fits(r)) continue;
        var d = distTo(r, x, y);
        if (d > bestD) { bestD = d; best = [nx, ny]; }
      }
    }
    if (!best) best = [0, 0];
    ox = Math.round(best[0]); oy = Math.round(best[1]);
    apply();
    taunt();
    goHomeLater();
  }

  document.addEventListener('mousemove', function (e) {
    var now = Date.now();
    if (now - lastMove < 120) return;   /* let the previous hop finish */
    var r = win.getBoundingClientRect();
    if (distTo(r, e.clientX, e.clientY) < NEAR) { lastMove = now; dodge(e.clientX, e.clientY); }
  });

  /* Phones: a tap makes it hop sideways */
  win.addEventListener('touchstart', function () {
    var w = win.getBoundingClientRect().width;
    var room = Math.max(40, Math.min(90, (window.innerWidth - w) / 2 + 60));
    ox = ox > 0 ? -room : room;
    oy = 0;
    apply();
    taunt();
    goHomeLater();
  }, { passive: true });

  window.addEventListener('resize', function () { ox = 0; oy = 0; apply(); });
})();

/* ---------- Greet the visitor by country (from the browser's time zone) ----------
   Nothing is sent anywhere: the time zone comes from the visitor's own browser. */
(function () {
  var box = document.getElementById('visitor');
  var out = document.getElementById('visitor-msg');
  if (!box || !out || !window.Intl) return;

  var tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return; }

  /* time zone -> [country, code] */
  var Z = {
    'Asia/Tokyo': ['Japan', 'JP'], 'Asia/Kolkata': ['India', 'IN'], 'Asia/Calcutta': ['India', 'IN'],
    'Asia/Singapore': ['Singapore', 'SG'], 'Asia/Dhaka': ['Bangladesh', 'BD'], 'Asia/Shanghai': ['China', 'CN'],
    'Asia/Chongqing': ['China', 'CN'], 'Asia/Urumqi': ['China', 'CN'], 'Asia/Hong_Kong': ['Hong Kong', 'HK'],
    'Asia/Taipei': ['Taiwan', 'TW'], 'Asia/Seoul': ['South Korea', 'KR'], 'Asia/Kathmandu': ['Nepal', 'NP'],
    'Asia/Colombo': ['Sri Lanka', 'LK'], 'Asia/Karachi': ['Pakistan', 'PK'], 'Asia/Dubai': ['the UAE', 'AE'],
    'Asia/Riyadh': ['Saudi Arabia', 'SA'], 'Asia/Qatar': ['Qatar', 'QA'], 'Asia/Tehran': ['Iran', 'IR'],
    'Asia/Jerusalem': ['Israel', 'IL'], 'Asia/Tel_Aviv': ['Israel', 'IL'], 'Asia/Bangkok': ['Thailand', 'TH'],
    'Asia/Ho_Chi_Minh': ['Vietnam', 'VN'], 'Asia/Saigon': ['Vietnam', 'VN'], 'Asia/Jakarta': ['Indonesia', 'ID'],
    'Asia/Kuala_Lumpur': ['Malaysia', 'MY'], 'Asia/Manila': ['the Philippines', 'PH'], 'Asia/Thimphu': ['Bhutan', 'BT'],
    'Asia/Yangon': ['Myanmar', 'MM'], 'Asia/Almaty': ['Kazakhstan', 'KZ'], 'Asia/Tashkent': ['Uzbekistan', 'UZ'],
    'Europe/London': ['the UK', 'GB'], 'Europe/Dublin': ['Ireland', 'IE'], 'Europe/Paris': ['France', 'FR'],
    'Europe/Berlin': ['Germany', 'DE'], 'Europe/Amsterdam': ['the Netherlands', 'NL'], 'Europe/Brussels': ['Belgium', 'BE'],
    'Europe/Luxembourg': ['Luxembourg', 'LU'], 'Europe/Zurich': ['Switzerland', 'CH'], 'Europe/Vienna': ['Austria', 'AT'],
    'Europe/Rome': ['Italy', 'IT'], 'Europe/Madrid': ['Spain', 'ES'], 'Europe/Lisbon': ['Portugal', 'PT'],
    'Europe/Copenhagen': ['Denmark', 'DK'], 'Europe/Oslo': ['Norway', 'NO'], 'Europe/Stockholm': ['Sweden', 'SE'],
    'Europe/Helsinki': ['Finland', 'FI'], 'Europe/Warsaw': ['Poland', 'PL'], 'Europe/Prague': ['Czechia', 'CZ'],
    'Europe/Budapest': ['Hungary', 'HU'], 'Europe/Bucharest': ['Romania', 'RO'], 'Europe/Athens': ['Greece', 'GR'],
    'Europe/Istanbul': ['Türkiye', 'TR'], 'Europe/Kiev': ['Ukraine', 'UA'], 'Europe/Kyiv': ['Ukraine', 'UA'],
    'Europe/Moscow': ['Russia', 'RU'], 'Europe/Tallinn': ['Estonia', 'EE'], 'Europe/Riga': ['Latvia', 'LV'],
    'Europe/Vilnius': ['Lithuania', 'LT'], 'Europe/Belgrade': ['Serbia', 'RS'], 'Europe/Zagreb': ['Croatia', 'HR'],
    'Europe/Ljubljana': ['Slovenia', 'SI'], 'Europe/Sofia': ['Bulgaria', 'BG'], 'Europe/Bratislava': ['Slovakia', 'SK'],
    'America/New_York': ['the USA', 'US'], 'America/Chicago': ['the USA', 'US'], 'America/Denver': ['the USA', 'US'],
    'America/Phoenix': ['the USA', 'US'], 'America/Los_Angeles': ['the USA', 'US'], 'America/Anchorage': ['the USA', 'US'],
    'America/Detroit': ['the USA', 'US'], 'Pacific/Honolulu': ['the USA', 'US'], 'America/Toronto': ['Canada', 'CA'],
    'America/Vancouver': ['Canada', 'CA'], 'America/Edmonton': ['Canada', 'CA'], 'America/Winnipeg': ['Canada', 'CA'],
    'America/Halifax': ['Canada', 'CA'], 'America/Montreal': ['Canada', 'CA'], 'America/Mexico_City': ['Mexico', 'MX'],
    'America/Sao_Paulo': ['Brazil', 'BR'], 'America/Argentina/Buenos_Aires': ['Argentina', 'AR'], 'America/Buenos_Aires': ['Argentina', 'AR'],
    'America/Santiago': ['Chile', 'CL'], 'America/Bogota': ['Colombia', 'CO'], 'America/Lima': ['Peru', 'PE'],
    'Australia/Sydney': ['Australia', 'AU'], 'Australia/Melbourne': ['Australia', 'AU'], 'Australia/Brisbane': ['Australia', 'AU'],
    'Australia/Perth': ['Australia', 'AU'], 'Australia/Adelaide': ['Australia', 'AU'], 'Australia/Canberra': ['Australia', 'AU'],
    'Pacific/Auckland': ['New Zealand', 'NZ'], 'Africa/Cairo': ['Egypt', 'EG'], 'Africa/Johannesburg': ['South Africa', 'ZA'],
    'Africa/Lagos': ['Nigeria', 'NG'], 'Africa/Nairobi': ['Kenya', 'KE'], 'Africa/Casablanca': ['Morocco', 'MA'],
    'Africa/Tunis': ['Tunisia', 'TN'], 'Africa/Algiers': ['Algeria', 'DZ'], 'Africa/Accra': ['Ghana', 'GH']
  };
  var HELLO = {
    JP: 'こんにちは', IN: 'नमस्ते', BD: 'স্বাগতম', SG: 'Hello', US: 'Howdy', GB: 'Cheers', IE: 'Dia duit',
    CA: 'Hello', AU: 'G’day', BT: 'Kuzuzangpo', MM: 'Mingalaba', NG: 'Hello', GH: 'Akwaaba', CN: '你好', HK: '你好', TW: '你好', KR: '안녕하세요',
    NP: 'नमस्ते', LK: 'ආයුබෝවන්', PK: 'السلام علیکم', AE: 'مرحبا', SA: 'مرحبا', QA: 'مرحبا', EG: 'مرحبا',
    MA: 'مرحبا', TN: 'مرحبا', DZ: 'مرحبا', IR: 'سلام', IL: 'שלום', TH: 'สวัสดี', VN: 'Xin chào',
    ID: 'Halo', MY: 'Hai', PH: 'Kumusta', FR: 'Bonjour', BE: 'Bonjour', LU: 'Moien', DE: 'Hallo',
    AT: 'Servus', CH: 'Grüezi', NL: 'Hallo', IT: 'Ciao', ES: 'Hola', MX: 'Hola', AR: 'Hola', CL: 'Hola',
    CO: 'Hola', PE: 'Hola', PT: 'Olá', BR: 'Olá', DK: 'Hej', SE: 'Hej', NO: 'Hei', FI: 'Hei',
    PL: 'Cześć', CZ: 'Ahoj', SK: 'Ahoj', HU: 'Szia', RO: 'Salut', GR: 'Γεια σου', TR: 'Merhaba',
    UA: 'Привіт', RU: 'Привет', EE: 'Tere', LV: 'Sveiki', LT: 'Labas', RS: 'Zdravo', HR: 'Bok',
    SI: 'Živjo', BG: 'Здравей', KZ: 'Сәлем', UZ: 'Salom', KE: 'Jambo', ZA: 'Sawubona', NZ: 'Kia ora'
  };

  var hit = Z[tz];
  var city = tz.indexOf('/') > -1 ? tz.split('/').pop().replace(/_/g, ' ') : '';
  var RENAMED = { 'Calcutta': 'Kolkata', 'Saigon': 'Ho Chi Minh City', 'Kiev': 'Kyiv', 'Rangoon': 'Yangon', 'Katmandu': 'Kathmandu' };
  if (RENAMED[city]) city = RENAMED[city];
  var hour = new Date().getHours();
  var time = '';
  try { time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch (e) {}

  /* message built as coloured pieces: [text, class] */
  var parts = [];
  if (hit) {
    parts.push(['Hey visitor from ', ''], [hit[0], 'v-place'], [' ', ''], ['[' + hit[1] + ']', 'v-cc'], ['! ', '']);
    if (HELLO[hit[1]]) parts.push([HELLO[hit[1]], 'v-hello'], ['! ', '']);
  } else if (city) {
    parts.push(['Hey visitor from ', ''], [city, 'v-place'], ['! ', '']);
  } else {
    parts.push(['Hey there, visitor! ', '']);
  }
  if (time) parts.push(["It's ", ''], [time, 'v-time'], [city ? ' in ' + city + '.' : ' where you are.', '']);
  if (hour >= 23 || hour < 5) parts.push([' Burning the midnight oil? ☕', '']);
  else if (hour < 9) parts.push([' Early bird, I see.', '']);

  box.hidden = false;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    parts.forEach(function (p) { var s = document.createElement('span'); s.className = p[1]; s.textContent = p[0]; out.appendChild(s); });
    return;
  }

  /* type it out, character by character */
  var pi = 0, ci = 0, span = null;
  var cursor = document.createElement('span');
  cursor.className = 'blink';
  cursor.textContent = '_';
  out.appendChild(cursor);
  function type() {
    if (pi >= parts.length) { setTimeout(function () { cursor.remove(); }, 1500); return; }
    if (!span) { span = document.createElement('span'); span.className = parts[pi][1]; out.insertBefore(span, cursor); }
    var chars = Array.from(parts[pi][0]);
    span.textContent = chars.slice(0, ++ci).join('');
    if (ci >= chars.length) { pi++; ci = 0; span = null; }
    setTimeout(type, 28);
  }
  setTimeout(type, 400);
})();
