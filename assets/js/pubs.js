/* Abstract pop-up for publication entries.
   - Mouse: rest on a paper and its abstract opens in a small window.
   - Touch / keyboard: the "Abstract" button expands it in place. */
(function () {
  var entries = document.querySelectorAll('.pub.has-abstract');
  if (!entries.length) return;

  /* Write $...$ maths as \(...\) so MathJax (loaded in the footer) renders it */
  function toTex(text) { return text.replace(/\$([^$]+)\$/g, '\\($1\\)'); }
  function typeset(el) {
    if (window.MathJax && MathJax.typesetPromise) { MathJax.typesetPromise([el]).catch(function () {}); }
  }

  /* ---------- Hover pop-up (only on devices that can hover) ---------- */
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var pop = null, body = null, timer = null, current = null;

  function makePop() {
    pop = document.createElement('div');
    pop.className = 'abs-pop';
    pop.setAttribute('role', 'tooltip');
    pop.id = 'abs-pop';
    var head = document.createElement('div');
    head.className = 'abs-pop__head';
    head.innerHTML = '<span class="abs-pop__cmd">$ cat abstract.txt</span><span class="abs-pop__label">Abstract</span>' +
      '<span class="abs-pop__hint">click \u201cAbstract\u201d to keep it open</span>';
    body = document.createElement('div');
    body.className = 'abs-pop__body';
    pop.appendChild(head);
    pop.appendChild(body);
    document.body.appendChild(pop);
  }

  function place(li) {
    var r = li.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight, gap = 8;
    var w = Math.min(Math.max(r.width, 340), 720, vw - 24);
    pop.style.width = w + 'px';
    var left = Math.min(Math.max(12, r.left), vw - w - 12);
    pop.style.left = left + 'px';
    var h = pop.offsetHeight;
    var below = vh - r.bottom - gap, above = r.top - gap;
    var top;
    if (h <= below) top = r.bottom + gap;              /* fits under the entry */
    else if (h <= above) top = r.top - h - gap;        /* fits above it */
    else top = Math.max(12, vh - h - 12);              /* otherwise keep it on screen */
    pop.style.top = top + 'px';
  }

  function show(li) {
    if (!pop) makePop();
    var src = li.querySelector('.pub__abstract');
    if (!src || li.classList.contains('abs-open')) return;
    current = li;
    body.textContent = toTex(src.textContent);
    pop.classList.add('is-open');
    place(li);
    typeset(body);
    li.setAttribute('aria-describedby', 'abs-pop');
  }
  function hide() {
    clearTimeout(timer);
    if (pop) pop.classList.remove('is-open');
    if (current) current.removeAttribute('aria-describedby');
    current = null;
  }

  if (canHover) {
    entries.forEach(function (li) {
      li.addEventListener('mouseenter', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { show(li); }, 350);
      });
      li.addEventListener('mouseleave', hide);
    });
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('resize', hide);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  }

  /* ---------- "Abstract" button: expand in place ---------- */
  entries.forEach(function (li) {
    var btn = li.querySelector('.pub__abs-btn');
    var box = li.querySelector('.pub__abstract');
    if (!btn || !box) return;
    btn.addEventListener('click', function () {
      hide();
      var open = box.hidden;
      if (open && !box.dataset.ready) {
        box.textContent = toTex(box.textContent);
        box.dataset.ready = '1';
        typeset(box);
      }
      box.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      li.classList.toggle('abs-open', open);
    });
  });
})();
