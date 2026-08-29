/**
 * house.js — the scroll-driven camera.
 *
 * The page scrolls like any other page. What makes it a house is that the
 * scrollbar drives a camera through one continuous SVG world: each section
 * ("act") owns a room, the camera dwells there while you read, then travels to
 * the next room over the tail of that section.
 *
 * The camera is an animated viewBox rather than a transform, so a room fills
 * the frame at full vector fidelity and there is never a second scene to load.
 *
 * Nothing here renders content. With JS off the acts are ordinary sections.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var world = $('[data-world]');
  var svg   = $('[data-world-svg]');
  if (!world || !svg) return;

  /* ------------------------------------------------------------------------
     The map. Rects are world coordinates and match the drawn geometry.
     `fit` is how much of the scene viewport that room should fill.
     ------------------------------------------------------------------------ */

  var ROOMS = {
    exterior: { rect: { x: 380,  y: 120, w: 1320, h: 920 }, inside: false, fit: [0.52, 0.74] },
    house:    { rect: { x: 566,  y: 116, w: 908,  h: 912 }, inside: true,  fit: [0.46, 0.82] },
    hall:     { rect: { x: 634,  y: 662, w: 194,  h: 324 }, inside: true,  fit: [0.62, 0.84] },
    studio:   { rect: { x: 634,  y: 316, w: 444,  h: 332 }, inside: true,  fit: [0.88, 0.86] },
    office:   { rect: { x: 1092, y: 316, w: 314,  h: 332 }, inside: true,  fit: [0.80, 0.86] },
    kitchen:  { rect: { x: 1172, y: 662, w: 234,  h: 324 }, inside: true,  fit: [0.68, 0.84] },
    attic:    { rect: { x: 690,  y: 152, w: 660,  h: 170 }, inside: true,  fit: [0.90, 0.60] },
    living:   { rect: { x: 842,  y: 662, w: 316,  h: 324 }, inside: true,  fit: [0.84, 0.86] },
    yard:     { rect: { x: 566,  y: 116, w: 908,  h: 912 }, inside: true,  fit: [0.46, 0.82] },
    mail:     { rect: { x: 392,  y: 772, w: 268,  h: 262 }, inside: false, fit: [0.60, 0.78] }
  };

  /* Acts, in document order. The DOM is the source of truth. */
  var acts = $$('[data-act]').map(function (el) {
    return { el: el, room: el.dataset.act, top: 0, height: 0 };
  });
  if (!acts.length) return;

  function measure() {
    acts.forEach(function (a) {
      a.top = a.el.getBoundingClientRect().top + window.scrollY;
      a.height = a.el.offsetHeight;
    });
  }

  /* ------------------------------------------------------------------------
     Framing — the scene has its own viewport (a column on desktop, a pinned
     band on phones), so measure the SVG rather than the window.
     ------------------------------------------------------------------------ */

  function targetBox(id) {
    var room = ROOMS[id] || ROOMS.exterior;
    var W = svg.clientWidth  || window.innerWidth  || 1;
    var H = svg.clientHeight || window.innerHeight || 1;

    var rw = room.rect.w;
    var rh = room.rect.h;
    var cx = room.rect.x + rw / 2;
    var cy = room.rect.y + rh / 2;

    /* World units per screen pixel — whichever axis binds first. */
    var upp = Math.max(rw / (W * room.fit[0]), rh / (H * room.fit[1]));

    /* Bias the subject left on wide screens; the text column takes the right. */
    var bias = W >= 1000 ? 0.33 : 0.5;

    return { x: cx - W * upp * bias, y: cy - (H * upp) / 2, w: W * upp, h: H * upp };
  }

  /* ------------------------------------------------------------------------
     Scroll to camera
     ------------------------------------------------------------------------ */

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smooth(t)  { return t * t * (3 - 2 * t); }

  function lerpBox(a, b, t) {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      w: a.w + (b.w - a.w) * t,
      h: a.h + (b.h - a.h) * t
    };
  }

  function resolve(y) {
    var vh = window.innerHeight;
    /* A very small lead. Any more and a room swaps in while you are still
       reading the one before it. */
    var probe = y + vh * 0.05;

    var i = 0;
    for (var k = 0; k < acts.length; k++) {
      if (probe >= acts[k].top) i = k;
    }

    var act  = acts[i];
    var next = acts[i + 1];
    var here = targetBox(act.room);

    if (!next) return { box: here, room: act.room, from: act.room, to: act.room, blend: 0 };

    /* Travel over the tail of the act, so the move feels the same whether the
       section is one screen tall or five. Short, and it lands in the trailing
       space below the content — a tall section like the back garden would
       otherwise start swapping out while you were still reading the last case
       study. */
    var travel = Math.min(act.height * 0.28, vh * 0.38);
    var start  = act.top + act.height - travel;

    if (probe <= start) {
      return { box: here, room: act.room, from: act.room, to: next.room, blend: 0 };
    }

    var raw = clamp01((probe - start) / travel);

    return {
      box: lerpBox(here, targetBox(next.room), smooth(raw)),
      room: raw < 0.5 ? act.room : next.room,
      from: act.room,
      to: next.room,
      blend: raw
    };
  }

  /* ------------------------------------------------------------------------
     Painting and scene state
     ------------------------------------------------------------------------ */

  var cam = null, want = null;

  function paint(b) {
    svg.setAttribute('viewBox',
      b.x.toFixed(2) + ' ' + b.y.toFixed(2) + ' ' + b.w.toFixed(2) + ' ' + b.h.toFixed(2));
  }

  var roomArt = $$('[data-room-art]');
  var cells   = $$('[data-goto]');
  var current = null;

  function setRoom(id) {
    if (id === current) return;
    current = id;

    var room = ROOMS[id] || ROOMS.exterior;

    world.classList.toggle('is-inside', !!room.inside);
    document.documentElement.classList.toggle('is-outside', id === 'exterior');

    /* Everything but the room you are reading about recedes. */
    var spotlit = room.inside && id !== 'house';
    roomArt.forEach(function (g) {
      g.classList.toggle('is-dim', spotlit && g.dataset.roomArt !== id);
    });

    cells.forEach(function (c) {
      c.classList.toggle('is-here', c.dataset.goto === id);
    });

    /* Both a latch and an event: under reduced motion start() runs while
       house.js is still executing, so rooms.js has not attached a listener
       yet and needs something to read on init. */
    document.documentElement.dataset.room = id;
    window.dispatchEvent(new CustomEvent('roomchange', { detail: { room: id } }));

    try {
      history.replaceState(null, '', id === 'exterior' ? location.pathname : '#' + id);
    } catch (e) { /* file:// — the URL just will not update */ }
  }

  /* ------------------------------------------------------------------------
     The loop. Scroll sets the goal; the frame eases toward it, which gives the
     camera a little weight without ever decoupling it from the scrollbar.
     ------------------------------------------------------------------------ */

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var r = resolve(window.scrollY);
      want = r.box;
      setRoom(r.room);

      /* Every frame, so the interiors can cross-dissolve on the scrollbar
         rather than on a timer. */
      window.dispatchEvent(new CustomEvent('roomtravel', {
        detail: { from: r.from, to: r.to, blend: r.blend }
      }));

      if (reduce) { cam = want; paint(cam); }
    });
  }

  function loop() {
    if (want) {
      if (!cam) cam = want;
      var e = 0.16;
      cam = {
        x: cam.x + (want.x - cam.x) * e,
        y: cam.y + (want.y - cam.y) * e,
        w: cam.w + (want.w - cam.w) * e,
        h: cam.h + (want.h - cam.h) * e
      };
      paint(cam);
    }
    requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------------------------
     Panels reveal as they arrive; numbers count up once.
     ------------------------------------------------------------------------ */

  var panels = $$('[data-panel]');

  function tally(scope) {
    $$('[data-tally]', scope).forEach(function (el) {
      if (el.dataset.tallyDone) return;
      el.dataset.tallyDone = '1';
      var end = parseFloat(el.dataset.tally);
      var decimals = (el.dataset.tally.split('.')[1] || '').length;
      if (reduce) { el.textContent = end.toFixed(decimals); return; }
      var t0 = performance.now();
      (function run(now) {
        var p = Math.min(1, (now - t0) / 1100);
        el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(decimals);
        if (p < 1) requestAnimationFrame(run);
      })(t0);
    });
  }

  if (reduce || !('IntersectionObserver' in window)) {
    panels.forEach(function (p) { p.classList.add('is-in'); tally(p); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        tally(entry.target);
        io.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -12% 0px',
      /* Zero, not a fraction: the back garden's panel is taller than the
         viewport several times over, so a 10% threshold could never be met and
         the whole thing stayed at opacity 0. */
      threshold: 0
    });
    panels.forEach(function (p) { io.observe(p); });
  }

  /* ------------------------------------------------------------------------
     Jumping: floor plan, room hotspots, links, the command palette. They all
     do the same ordinary thing — scroll to a section.
     ------------------------------------------------------------------------ */

  function jump(room, instant) {
    var act = acts.filter(function (a) { return a.room === room; })[0];
    if (!act) return;
    measure();

    /* Instant, so none of the rooms in between are ever built or drawn, and
       the camera is placed rather than animated — a click that replays a
       fly-in reads as the room re-rendering itself. */
    window.scrollTo({ top: act.top + 2, left: 0, behavior: 'instant' });
    onScroll();

    var r = resolve(window.scrollY);
    cam = want = r.box;
    paint(cam);
  }

  window.houseGo = jump;

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-goto]');
    if (!t) return;
    e.preventDefault();
    jump(t.dataset.goto);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = document.activeElement;
    if (t && t.dataset && t.dataset.goto && t.tagName.toLowerCase() === 'g') {
      e.preventDefault();
      jump(t.dataset.goto);
    }
  });

  /* ------------------------------------------------------------------------
     Pointer parallax — a few pixels of drift, enough to suggest depth
     ------------------------------------------------------------------------ */

  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    var praf = 0;
    window.addEventListener('pointermove', function (e) {
      if (praf) return;
      praf = requestAnimationFrame(function () {
        praf = 0;
        var r = world.getBoundingClientRect();
        var dx = ((e.clientX - r.left) / (r.width  || 1) - 0.5) * -16;
        var dy = ((e.clientY - r.top)  / (r.height || 1) - 0.5) * -10;
        svg.style.setProperty('--px', dx.toFixed(1) + 'px');
        svg.style.setProperty('--py', dy.toFixed(1) + 'px');
      });
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     Wiring
     ------------------------------------------------------------------------ */

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      measure();
      var r = resolve(window.scrollY);
      want = cam = r.box;
      paint(cam);
    }, 140);
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  /* Late-loading screenshots change section heights. */
  window.addEventListener('load', function () { measure(); onScroll(); });

  /* ------------------------------------------------------------------------
     Boot — count the lights on, then hand the camera to the scrollbar
     ------------------------------------------------------------------------ */

  var boot  = $('[data-boot]');
  var pctEl = $('[data-boot-pct]');
  var lines = $$('[data-boot-line]');

  function start() {
    measure();

    var first = (location.hash || '').replace('#', '');
    if (ROOMS[first] && first !== 'exterior') jump(first, true);

    var r = resolve(window.scrollY);
    cam = want = r.box;
    paint(cam);
    setRoom(r.room);

    if (boot) boot.classList.add('is-done');
    if (!reduce) loop();

    setTimeout(function () {
      document.documentElement.classList.add('is-live');
      $$('.mask-lines').forEach(function (m) { m.classList.add('is-in'); });
      measure();
      onScroll();
    }, 360);
  }

  if (boot && !reduce) {
    var pct = 0;
    var tick = setInterval(function () {
      pct = Math.min(100, pct + Math.random() * 13 + 6);
      if (pctEl) pctEl.textContent = Math.floor(pct);
      var lit = Math.round((pct / 100) * lines.length);
      lines.forEach(function (l, i) { l.classList.toggle('is-on', i < lit); });
      if (pct >= 100) { clearInterval(tick); setTimeout(start, 340); }
    }, 120);
  } else {
    if (pctEl) pctEl.textContent = '100';
    start();
  }
})();
