/* Easter eggs (fun mode only):
     type "aether"     -> the page gets "encrypted" and decrypted again
     type "sudo"       -> a classic terminal reply
     Konami code       -> secret level: the TOY-FEISTEL challenge
   Also provides window.siteCelebrate() (used when a challenge level is solved). */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HEX = '0123456789abcdef';
  function rb() { return HEX[Math.random() * 16 | 0] + HEX[Math.random() * 16 | 0]; }
  function serious() { return document.documentElement.classList.contains('serious'); }
  var base = (document.querySelector('.masthead__menu-item--lg a') || {}).getAttribute ?
    document.querySelector('.masthead__menu-item--lg a').getAttribute('href').replace(/\/$/, '') : '';

  /* ---------- small toast message ---------- */
  var toastTimer = null;
  function toast(html, ms) {
    var t = document.getElementById('egg-toast');
    if (!t) { t = document.createElement('div'); t.id = 'egg-toast'; t.className = 'egg-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = html;
    t.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-open'); }, ms || 4000);
  }

  /* ---------- hex confetti ---------- */
  window.siteCelebrate = function () {
    if (reduce) return;
    var colours = ['#cba6f7', '#89b4fa', '#a6e3a1', '#f9e2af', '#f38ba8', '#94e2d5'];
    for (var i = 0; i < 46; i++) {
      var s = document.createElement('span');
      s.className = 'egg-confetti';
      s.textContent = rb();
      s.style.left = (Math.random() * 100) + 'vw';
      s.style.color = colours[i % colours.length];
      s.style.animationDelay = (Math.random() * 0.5) + 's';
      s.style.animationDuration = (1.6 + Math.random() * 1.2) + 's';
      document.body.appendChild(s);
      setTimeout(function (el) { return function () { el.remove(); }; }(s), 3600);
    }
  };

  /* ---------- "aether": encrypt and decrypt the page ---------- */
  var running = false;
  function aether() {
    if (running) return;
    running = true;
    var heads = Array.prototype.slice.call(document.querySelectorAll('h1, h2, .pub__title, .t-name')).slice(0, 40);
    var saved = heads.map(function (h) { return h.innerHTML; });
    var lens = heads.map(function (h) { return Math.max(4, Math.min(60, h.textContent.length)); });

    var ov = document.createElement('div');
    ov.className = 'egg-overlay';
    ov.innerHTML = '<div class="egg-win"><div class="egg-win__bar"><span class="tl-dots"><i></i><i></i><i></i></span>' +
      '<span>./aether --encrypt ' + location.hostname + location.pathname + '</span></div>' +
      '<div class="egg-grid"></div><div class="egg-log"></div></div>';
    document.body.appendChild(ov);
    var grid = ov.querySelector('.egg-grid'), log = ov.querySelector('.egg-log');
    var cells = [];
    for (var i = 0; i < 64; i++) { var c = document.createElement('span'); c.textContent = rb(); grid.appendChild(c); cells.push(c); }
    function line(t, cls) { var d = document.createElement('div'); d.textContent = t; if (cls) d.className = cls; log.appendChild(d); }

    var round = 0, steps = reduce ? 1 : 12;
    line('key   = ' + Array.from({ length: 16 }, rb).join(''));
    var timer = setInterval(function () {
      round++;
      cells.forEach(function (c) { c.textContent = rb(); c.classList.toggle('hot', Math.random() < 0.3); });
      heads.forEach(function (h, k) { h.textContent = Array.from({ length: Math.ceil(lens[k] / 2) }, rb).join(''); });
      if (round >= steps) {
        clearInterval(timer);
        line('round 12/12 done: page encrypted (' + heads.length + ' blocks)');
        line('tag   = ' + Array.from({ length: 16 }, rb).join(''));
        setTimeout(function () {
          line('decrypting... tag ok ✓', 'ok');
          heads.forEach(function (h, k) { h.innerHTML = saved[k]; });
          setTimeout(function () { ov.classList.add('is-closing'); setTimeout(function () { ov.remove(); running = false; }, 400); }, 1100);
        }, 700);
      }
    }, reduce ? 10 : 110);
    ov.addEventListener('click', function () { clearInterval(timer); heads.forEach(function (h, k) { h.innerHTML = saved[k]; }); ov.remove(); running = false; });
  }

  /* ---------- key listener ---------- */
  var typed = '', konami = [], KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
    if (serious()) return;
    var k = (e.key || '').toLowerCase();
    konami.push(k); konami = konami.slice(-KONAMI.length);
    if (konami.join(',') === KONAMI.join(',')) {
      konami = [];
      toast('&#127918; <b>Secret level unlocked.</b> <a href="' + base + '/challenge/">Can you break TOY-FEISTEL?</a>', 7000);
      window.siteCelebrate();
      return;
    }
    if (k.length !== 1) return;
    typed = (typed + k).slice(-12);
    if (/aether$/.test(typed)) { typed = ''; aether(); }
    else if (/sudo$/.test(typed)) { typed = ''; toast('<code>mrahman is not in the sudoers file. This incident will be reported.</code> &#128521;'); }
  });

  if (window.console && console.log) {
    console.log('%c mrahman@ntu:~$ %c Hello, curious one! Try typing "aether" or "sudo" on the page, or the Konami code. A cipher challenge waits at ' +
      (location.origin + base) + '/challenge/',
      'background:#1e1e2e;color:#a6e3a1;font-family:monospace;padding:2px 4px', 'color:inherit');
  }
})();
