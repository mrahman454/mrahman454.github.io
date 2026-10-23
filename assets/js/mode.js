/* "serious" / "fun" switch in the top bar. The choice is remembered. */
(function () {
  var btn = document.getElementById('mode-toggle');
  if (!btn) return;
  var root = document.documentElement;
  function sync() { btn.setAttribute('aria-pressed', root.classList.contains('serious') ? 'true' : 'false'); }
  sync();
  btn.addEventListener('click', function () {
    var serious = root.classList.toggle('serious');
    try { localStorage.setItem('site-mode', serious ? 'serious' : 'fun'); } catch (e) {}
    sync();
    window.scrollTo(0, 0);
    document.dispatchEvent(new CustomEvent('modechange', { detail: { serious: serious } }));
  });
})();
