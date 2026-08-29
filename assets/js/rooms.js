/**
 * rooms.js — the interiors.
 *
 * house.js drives the cutaway and reports, every frame, which room you are
 * leaving, which you are arriving in, and how far between them the scrollbar
 * has taken you. This turns that into a physical move: the room you are
 * leaving drifts toward the camera and dissolves, while the next one walks up
 * out of the dark. Because it is bound to the scroll position rather than a
 * timer, you can stop halfway and stand in the doorway.
 *
 * The camera also answers the pointer with a couple of degrees of rotation —
 * enough for the parallax planes to separate.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var stages = {};
  $$('[data-stage]').forEach(function (el) { stages[el.dataset.stage] = el; });
  if (!Object.keys(stages).length) return;

  /* How far a room travels as it leaves (toward you) and arrives (from afar). */
  var EXIT_PUSH  = 190;
  var ENTER_PUSH = -340;

  var shown = {};
  var live = null;

  function apply(id, vis, push) {
    var el = stages[id];
    if (!el) return;
    shown[id] = vis;
    el.style.setProperty('--vis', vis.toFixed(3));
    el.classList.toggle('is-on', vis > 0.004);
    var cam = el.querySelector('.stage__cam');
    if (cam) cam.style.setProperty('--push', push.toFixed(1) + 'px');
  }

  function clear(except) {
    Object.keys(stages).forEach(function (id) {
      if (except.indexOf(id) > -1) return;
      if (shown[id] === 0) return;
      apply(id, 0, 0);
    });
  }

  Object.keys(stages).forEach(function (id) { shown[id] = 0; });

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t)     { return t * t * (3 - 2 * t); }

  /* The cutaway house shows through wherever no interior is covering it, so
     the middle of a journey is spent looking at the whole house. */
  function syncWorld() {
    var sum = 0, top = 0;
    Object.keys(shown).forEach(function (id) {
      sum += shown[id];
      if (shown[id] > top) top = shown[id];
    });
    if (sum > 1) sum = 1;
    document.documentElement.style.setProperty('--world-vis', (1 - sum).toFixed(3));
    document.documentElement.classList.toggle('in-room', sum > 0.02);
    live = null;
    Object.keys(shown).forEach(function (id) {
      if (shown[id] === top && top > 0.02) live = stages[id];
    });
  }

  function travel(from, to, blend) {
    if (!from) return;

    if (!blend || from === to) {
      apply(from, 1, 0);
      clear([from]);
      syncWorld();
      return;
    }

    /* A straight dissolve: the room you leave drifts toward you as the next
       one walks up out of the dark. The garden is no different. */
    var t = ease(blend);

    apply(from, 1 - t, t * EXIT_PUSH);
    apply(to,   t,     (1 - t) * ENTER_PUSH);
    clear([from, to]);
    syncWorld();
  }

  window.addEventListener('roomtravel', function (e) {
    var d = e.detail || {};
    travel(d.from, d.to, d.blend || 0);
  });

  /* A "read the case study" link goes out to the garden and lands on that
     write-up. house.js does the travelling; this does the last few hundred
     pixels once the panel is in place. */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-case]');
    if (!t) return;
    var id = t.dataset.case;
    setTimeout(function () {
      var el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
      Array.prototype.forEach.call(document.querySelectorAll('.case.is-target'),
        function (c) { c.classList.remove('is-target'); });
      el.classList.add('is-target');
    }, reduce ? 0 : 620);
  });

  /* house.js may have settled before this file ran (it does under reduced
     motion, where start() is synchronous), so catch up from the latch. */
  travel(document.documentElement.dataset.room, null, 0);

  /* ------------------------------------------------------------------------
     Pointer camera. Two or three degrees is plenty — past that the flat planes
     announce themselves as flat planes.
     ------------------------------------------------------------------------ */

  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    var raf = 0;
    var rx = 0, ry = 0, tx = 0, ty = 0;

    function tick() {
      ry += (tx - ry) * 0.06;
      rx += (ty - rx) * 0.06;

      Object.keys(stages).forEach(function (id) {
        if (!shown[id]) return;
        var cam = stages[id].querySelector('.stage__cam');
        if (!cam) return;
        cam.style.setProperty('--ry', ry.toFixed(3) + 'deg');
        cam.style.setProperty('--rx', rx.toFixed(3) + 'deg');
      });

      raf = (Math.abs(tx - ry) < 0.01 && Math.abs(ty - rx) < 0.01)
        ? 0
        : requestAnimationFrame(tick);
    }

    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth  - 0.5) * -5.0;
      ty = (e.clientY / window.innerHeight - 0.5) *  2.8;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  }
})();
