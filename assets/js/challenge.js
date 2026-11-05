/* TOY-FEISTEL challenge (/challenge/).
   The cipher is exposed as `toy` so visitors can experiment in the browser console:
     toy.encrypt(0x24D13340, [0x1234, 0xABCD])   -> ciphertext (number)
     toy.F(x, k), toy.S(x), toy.Sinv(x), toy.rotl(x, r), toy.rotr(x, r), toy.hex(n)
   Answers are checked by re-encrypting the published plaintexts; no key is stored here. */
(function () {
  var SBOX = [0xC, 5, 6, 0xB, 9, 0, 0xA, 0xD, 3, 0xE, 0xF, 8, 4, 7, 1, 2];   /* PRESENT S-box */
  var INV = SBOX.map(function (_, i) { return SBOX.indexOf(i); });
  function nib(table, x) { var y = 0; for (var i = 0; i < 4; i++) y |= table[(x >>> (4 * i)) & 15] << (4 * i); return y; }
  function S(x) { return nib(SBOX, x); }
  function Sinv(x) { return nib(INV, x); }
  function rotl(x, r) { return ((x << r) | (x >>> (16 - r))) & 0xFFFF; }
  function rotr(x, r) { return ((x >>> r) | (x << (16 - r))) & 0xFFFF; }
  function F(x, k) { return rotl(S((x ^ k) & 0xFFFF), 5); }
  function encrypt(p, keys) {
    var L = (p >>> 16) & 0xFFFF, R = p & 0xFFFF;
    keys.forEach(function (k) { var t = R; R = (L ^ F(R, k)) & 0xFFFF; L = t; });
    return ((L << 16) | R) >>> 0;
  }
  function hex(n, w) { return (n >>> 0).toString(16).toUpperCase().padStart(w || 8, '0'); }
  window.toy = { encrypt: encrypt, F: F, S: S, Sinv: Sinv, rotl: rotl, rotr: rotr, hex: hex, SBOX: SBOX.slice() };

  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  document.querySelectorAll('.chal-level').forEach(function (box) {
    var level = box.getAttribute('data-level');
    var rounds = +box.getAttribute('data-rounds');
    var pairs = JSON.parse(box.getAttribute('data-pairs'));
    var input = box.querySelector('.chal-input');
    var out = box.querySelector('.chal-result');
    var done = box.querySelector('.chal-done');

    function solved(key, again) {
      box.classList.add('is-solved');
      out.className = 'chal-result is-ok';
      out.textContent = again ? '✓ solved before on this device (key ' + key + ')'
                              : '✓ correct! Key ' + key + ' encrypts every plaintext to its ciphertext.';
      if (done) done.hidden = false;
      if (!again) {
        store.set('toy-feistel-' + level, key);
        if (window.siteCelebrate) window.siteCelebrate();
      }
    }
    var prev = store.get('toy-feistel-' + level);
    if (prev) solved(prev, true);

    box.querySelector('.chal-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.replace(/[\s_:-]/g, '').toUpperCase();
      if (!/^[0-9A-F]+$/.test(v) || v.length !== 4 * rounds) {
        out.className = 'chal-result is-bad';
        out.textContent = 'Enter ' + (4 * rounds) + ' hex digits (' + rounds + ' round keys of 16 bits: K1 K2' + (rounds > 2 ? ' K3' : '') + ').';
        return;
      }
      var keys = [];
      for (var i = 0; i < rounds; i++) keys.push(parseInt(v.substr(4 * i, 4), 16));
      var wrong = pairs.filter(function (pc) { return hex(encrypt(parseInt(pc[0], 16), keys)) !== pc[1]; }).length;
      if (wrong === 0) { solved(v, false); }
      else {
        out.className = 'chal-result is-bad';
        out.textContent = '✗ not quite: ' + wrong + ' of ' + pairs.length + ' pair' + (pairs.length > 1 ? 's do' : ' does') + ' not match. Keep going!';
        box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
      }
    });
  });

  if (window.console && console.log) {
    console.log('%c TOY-FEISTEL ', 'background:#cba6f7;color:#1e1e2e;font-weight:bold',
      'The cipher is available as `toy`, e.g. toy.encrypt(0x24D13340, [0x1234, 0xABCD]). Good luck!');
  }
})();
