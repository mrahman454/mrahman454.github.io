/* World maps (Co-authors "Map" view and Talks page).
   Each .map-wrap contains the static world map SVG (_includes/world-map.svg) and a
   <script type="application/json" class="map-data"> block:
     { "countries": [{ "id": "392", "papers": 18, "label": "Japan: 18 papers" }],
       "points":    [{ "lat": 34.69, "lng": 135.18, "size": 16, "mine": true,
                       "title": "University of Hyogo", "lines": ["Kobe, JP", "16 papers"] }] }
   Dots use the same Equal Earth projection as the map (scripts/build_world_map.py). */
(function () {
  var A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2;
  function project(lng, lat, scale, width) {
    var lam = lng * Math.PI / 180, phi = lat * Math.PI / 180;
    var t = Math.asin(M * Math.sin(phi)), t2 = t * t, t6 = Math.pow(t, 6);
    var x = lam * Math.cos(t) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
    var y = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
    return [width / 2 + x * scale, -y * scale];
  }
  var SVGNS = 'http://www.w3.org/2000/svg';

  var tip = null;
  function showTip(evt, title, lines) {
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'map-tip';
      tip.setAttribute('role', 'tooltip');
      document.body.appendChild(tip);
    }
    tip.innerHTML = '';
    var h = document.createElement('div'); h.className = 'map-tip__title'; h.textContent = title; tip.appendChild(h);
    (lines || []).forEach(function (l) { var d = document.createElement('div'); d.textContent = l; tip.appendChild(d); });
    tip.classList.add('is-open');
    var x = evt.clientX + 14, y = evt.clientY + 14, w = tip.offsetWidth, hgt = tip.offsetHeight;
    if (x + w > window.innerWidth - 8) x = evt.clientX - w - 14;
    if (y + hgt > window.innerHeight - 8) y = evt.clientY - hgt - 14;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }
  function hideTip() { if (tip) tip.classList.remove('is-open'); }
  window.addEventListener('scroll', hideTip, { passive: true });

  function draw(wrap) {
    var svg = wrap.querySelector('svg.world-map');
    var src = wrap.querySelector('script.map-data');
    if (!svg || !src) return;
    var data;
    try { data = JSON.parse(src.textContent); } catch (e) { return; }
    var scale = +svg.getAttribute('data-scale'), width = +svg.getAttribute('data-width');

    /* countries: shade by number of papers (4 levels) */
    var max = 1;
    (data.countries || []).forEach(function (c) { if (c.papers > max) max = c.papers; });
    (data.countries || []).forEach(function (c) {
      var path = svg.querySelector('path[data-id="' + c.id + '"]');
      if (!path) return;
      var level = Math.max(1, Math.min(4, Math.ceil(4 * Math.sqrt(c.papers / max))));
      path.setAttribute('data-level', level);
      var t = path.querySelector('title'); if (t) t.remove();
      path.addEventListener('mousemove', function (e) { showTip(e, c.name || path.getAttribute('data-name'), [c.label]); });
      path.addEventListener('mouseleave', hideTip);
    });

    /* dots */
    var layer = svg.querySelector('.world-map__dots');
    var pts = (data.points || []).slice().sort(function (a, b) { return b.size - a.size; });
    var maxSize = 1;
    pts.forEach(function (p) { if (p.size > maxSize) maxSize = p.size; });
    pts.forEach(function (p) {
      var xy = project(p.lng, p.lat, scale, width);
      var c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('cx', xy[0].toFixed(1));
      c.setAttribute('cy', xy[1].toFixed(1));
      c.setAttribute('r', (3 + 7 * Math.sqrt(p.size / maxSize)).toFixed(1));
      c.setAttribute('class', 'world-map__dot' + (p.mine ? ' is-mine' : ''));
      c.setAttribute('tabindex', '0');
      c.setAttribute('aria-label', p.title + ': ' + (p.lines || []).join(', '));
      c.addEventListener('mousemove', function (e) { showTip(e, p.title, p.lines); });
      c.addEventListener('mouseleave', hideTip);
      c.addEventListener('focus', function () {
        var r = c.getBoundingClientRect();
        showTip({ clientX: r.right, clientY: r.bottom }, p.title, p.lines);
      });
      c.addEventListener('blur', hideTip);
      layer.appendChild(c);
    });
  }

  document.querySelectorAll('.map-wrap').forEach(draw);
})();
