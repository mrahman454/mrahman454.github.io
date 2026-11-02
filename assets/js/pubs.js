/* Publication pop-up: shows the key points of a paper when the mouse rests on it.
   - Key points come from `highlights:` in the paper's file. If a paper has none,
     the most informative sentences of its abstract are picked automatically.
   - The "Abstract" button shows the full abstract in place (also for touch/keyboard). */
(function () {
  var entries = document.querySelectorAll('.pub.has-abstract');
  if (!entries.length) return;

  /* $...$ maths -> \(...\) so MathJax (loaded in the footer) renders it */
  function toTex(text) { return text.replace(/\$([^$]+)\$/g, '\\($1\\)'); }
  function typeset(el) {
    if (window.MathJax && MathJax.typesetPromise) { MathJax.typesetPromise([el]).catch(function () {}); }
  }

  /* Pick up to 3 informative sentences from an abstract (used when no highlights) */
  var CUES = /\b(we (propose|present|introduce|show|prove|design|mount|obtain|achieve|recover|report|find|provide)|this (paper|work)|first|outperform|record|best|reduc|faster|practical|key.recovery|distinguisher|attack|secure)\b/i;
  function keySentences(abstract) {
    var sents = abstract.replace(/\s+/g, ' ').match(/[^.!?]+(?:[.!?](?!\d)|$)/g) || [];
    var scored = sents.map(function (s, i) {
      s = s.trim();
      var score = (CUES.test(s) ? 2 : 0) + (/\d/.test(s) ? 1 : 0) + (i === 0 ? 0.5 : 0) - (s.length > 260 ? 1 : 0);
      return { s: s, i: i, score: score };
    }).filter(function (o) { return o.s.length > 30; });
    scored.sort(function (a, b) { return b.score - a.score || a.i - b.i; });
    return scored.slice(0, 3).sort(function (a, b) { return a.i - b.i; }).map(function (o) {
      return o.s.length > 190 ? o.s.slice(0, 187).replace(/\s+\S*$/, '') + '…' : o.s;
    });
  }

  function pointsFor(li) {
    var hl = li.querySelectorAll('.pub__highlights li');
    if (hl.length) return Array.prototype.map.call(hl, function (x) { return x.textContent; });
    var ab = li.querySelector('.pub__abstract');
    return ab ? keySentences(ab.dataset.raw || ab.textContent) : [];
  }

  /* ---------- Hover pop-up (only on devices with a mouse) ---------- */
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var pop, tags, list, foot, timer = null, current = null, mouseX = 0;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html) e.innerHTML = html;
    return e;
  }
  function makePop() {
    pop = el('div', 'abs-pop');
    pop.id = 'abs-pop';
    pop.setAttribute('role', 'tooltip');
    pop.appendChild(el('span', 'abs-pop__arrow'));
    pop.appendChild(el('div', 'abs-pop__head',
      '<span class="abs-pop__dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<span class="abs-pop__title"><b>$</b> tldr paper</span>' +
      '<span class="abs-pop__label">Key points</span>'));
    var body = el('div', 'abs-pop__body');
    tags = el('div', 'abs-pop__tags');
    list = el('ul', 'abs-pop__list');
    body.appendChild(tags);
    body.appendChild(list);
    pop.appendChild(body);
    foot = el('div', 'abs-pop__foot', 'Click <b>Abstract</b> for the full text');
    pop.appendChild(foot);
    document.body.appendChild(pop);
  }

  function tag(text, cls) { var t = el('span', 'abs-pop__tag ' + cls); t.textContent = text; return t; }

  function fill(li) {
    tags.innerHTML = '';
    if (li.dataset.venue) tags.appendChild(tag(li.dataset.venue, 'abs-pop__tag--venue'));
    if (li.dataset.areaName) tags.appendChild(tag(li.dataset.areaName, 'abs-pop__tag--area'));
    if (li.dataset.award) tags.appendChild(tag('★ Award', 'abs-pop__tag--award'));
    list.innerHTML = '';
    pointsFor(li).forEach(function (p) { var item = el('li'); item.textContent = toTex(p); list.appendChild(item); });
    foot.style.display = li.querySelector('.pub__abstract') ? '' : 'none';
  }

  function place(li) {
    var r = li.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight, gap = 12;
    var w = Math.min(420, vw - 24);
    pop.style.width = w + 'px';
    var anchor = Math.min(Math.max(mouseX, r.left + 20), r.right - 20);
    var left = Math.min(Math.max(12, anchor - 60), vw - w - 12);
    pop.style.left = left + 'px';
    pop.style.setProperty('--arrow-x', Math.min(Math.max(anchor - left, 18), w - 18) + 'px');
    var h = pop.offsetHeight;
    var above = !(vh - r.bottom - gap >= h) && (r.top - gap >= h);
    pop.classList.toggle('is-above', above);
    pop.style.top = (above ? r.top - h - gap : Math.min(r.bottom + gap, vh - h - 12)) + 'px';
  }

  function show(li) {
    if (li.classList.contains('abs-open')) return;   /* full abstract already open */
    if (!pop) makePop();
    current = li;
    fill(li);
    place(li);
    pop.classList.add('is-open');
    typeset(list);
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
      li.addEventListener('mouseenter', function (e) {
        mouseX = e.clientX;
        clearTimeout(timer);
        timer = setTimeout(function () { show(li); }, 300);
      });
      li.addEventListener('mousemove', function (e) { if (!current) mouseX = e.clientX; });
      li.addEventListener('mouseleave', hide);
    });
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('resize', hide);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  }

  /* ---------- "Abstract" button: full abstract in place ---------- */
  entries.forEach(function (li) {
    var btn = li.querySelector('.pub__abs-btn');
    var box = li.querySelector('.pub__abstract');
    if (!btn || !box) return;
    box.dataset.raw = box.textContent;
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
