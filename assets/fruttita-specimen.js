/* Fruttita Specimen · motion 2 of 3 (2026-09-15)
   Record rows: labels, numbers and bars appear once when scrolled into view.
   No library. Honours prefers-reduced-motion (the <html> class sp-motion is only
   set in theme.liquid when motion is allowed and IntersectionObserver exists). */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('sp-motion')) return;

  var GROUPS = '.sp-row, .sp-rec-head, .sp-trip, .sp-steplist, .sp-hero .facts, .sp-pdp-hero .facts';
  var ITEMS = ':scope > .k, :scope > .v > :not(.sp-kv):not(.sp-certs), :scope > .v > .sp-kv > *, :scope > .v > .sp-certs > li, :scope > .v > .one .sp-bars > div, :scope > .sp-lab, :scope > div, :scope > li';
  var STEP = 90;   // ms between items
  var CAP = 10;    // stagger stops growing after this many items

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function countUp(el, delay) {
    var txt = el.textContent;
    var m = txt.match(/^([^\d]*?)(\d+(?:[.,]\d+)?)(.*)$/s);
    if (!m) return;
    var pre = m[1], raw = m[2], post = m[3];
    var num = parseFloat(raw.replace(',', '.'));
    if (!(num > 0)) return;
    var dec = (raw.split(/[.,]/)[1] || '').length;
    var sep = raw.indexOf(',') > -1 ? ',' : '.';
    var dur = 900, start = null;
    el.textContent = pre + (0).toFixed(dec).replace('.', sep) + post;
    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      var v = num * easeOut(t);
      el.textContent = pre + v.toFixed(dec).replace('.', sep) + post;
      if (t < 1) requestAnimationFrame(frame); else el.textContent = txt;
    }
    setTimeout(function () { requestAnimationFrame(frame); }, delay);
    // Fallback: where rAF is throttled or paused (background tabs, screenshot renderers) the real value still lands.
    setTimeout(function () { el.textContent = txt; }, delay + dur + 400);
  }

  function prepare(group) {
    var items = group.querySelectorAll(ITEMS);
    var kvPair = 0;
    Array.prototype.forEach.call(items, function (el, i) {
      var idx = i;
      if (el.parentNode.classList.contains('sp-kv')) { idx = Math.floor(kvPair / 2) + 1; kvPair++; }
      el.style.setProperty('--i', Math.min(idx, CAP));
      el.classList.add('sp-rv');
    });
    return items;
  }

  function reveal(group) {
    group.classList.add('in');
    var nums = group.querySelectorAll('.facts > div > b, .sp-bars b');
    Array.prototype.forEach.call(nums, function (b) {
      var item = b.closest('.sp-rv');
      var i = item ? parseInt(item.style.getPropertyValue('--i') || '0', 10) : 0;
      countUp(b, i * STEP + 120);
    });
  }

  var groups = document.querySelectorAll(GROUPS);
  if (!groups.length) return;
  Array.prototype.forEach.call(groups, prepare);

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      reveal(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  Array.prototype.forEach.call(groups, function (g) {
    // Anything already inside the first viewport (hero facts on phones) reveals right away;
    // the observer only handles what the reader scrolls to.
    if (g.getBoundingClientRect().top < window.innerHeight) { reveal(g); return; }
    io.observe(g);
  });

  // Safety: whatever is still hidden after 3 s (observer quirks, editor iframes) is shown.
  setTimeout(function () { Array.prototype.forEach.call(groups, function (g) { if (!g.classList.contains('in')) reveal(g); }); }, 3000);

  // Theme editor: re-run for re-rendered sections.
  document.addEventListener('shopify:section:load', function (ev) {
    Array.prototype.forEach.call(ev.target.querySelectorAll(GROUPS), function (g) { prepare(g); reveal(g); });
  });
})();

/* Fruttita Specimen · motion 3 of 3 (2026-09-17)
   Fig. 2 process figure: stations, connectors and a travelling pulp dot play once when scrolled
   into view; "Play again" restarts. Same guard: nothing runs without <html class="sp-motion">. */
(function () {
  'use strict';
  if (!document.documentElement.classList.contains('sp-motion')) return;
  var secs = document.querySelectorAll('.sp-proc');
  if (!secs.length) return;
  function play(sec) { sec.classList.remove('is-on'); void sec.offsetWidth; sec.classList.add('is-on'); }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting || e.intersectionRatio < 0.3) return;
      io.unobserve(e.target); play(e.target);
    });
  }, { threshold: [0.3] });
  Array.prototype.forEach.call(secs, function (sec) {
    var btn = sec.querySelector('.sp-proc-replay');
    if (btn) btn.addEventListener('click', function () { play(sec); });
    var r = sec.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.7 && r.bottom > 0) { play(sec); return; }
    io.observe(sec);
  });
  setTimeout(function () { Array.prototype.forEach.call(secs, function (s) { if (!s.classList.contains('is-on')) s.classList.add('is-on'); }); }, 6000);
})();
