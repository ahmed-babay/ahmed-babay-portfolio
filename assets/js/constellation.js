/**
 * constellation.js — ambient canvas backdrop.
 *
 * Drifting nodes with proximity-linked edges: reads as a neural graph without
 * being literal about it. Deliberately restrained — it sits at low opacity
 * behind the content and never competes with the type.
 *
 * Sits out entirely on small screens, on reduced-motion, and while the tab is
 * hidden, so it costs nothing when it is not being seen.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('constellation');
  if (!canvas) return;

  var smallScreen = window.matchMedia('(max-width: 900px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (smallScreen.matches || reduceMotion.matches) return;

  var ctx = canvas.getContext('2d', { alpha: true });
  var nodes = [];
  var pointer = { x: null, y: null };
  var frame = null;
  var w = 0;
  var h = 0;

  var LINK_DIST = 150;
  var POINTER_DIST = 230;

  /* Accent is read from the stylesheet so the canvas always matches the theme. */
  var accent = [94, 241, 200];

  function readAccent() {
    var raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim();

    var rgb = hexToRgb(raw);
    if (rgb) accent = rgb;
  }

  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return null;
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  }

  function rgba(alpha) {
    return 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',' + alpha + ')';
  }

  function isLight() {
    return document.documentElement.dataset.theme === 'light';
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    // Scale with viewport area, but hold a hard ceiling so large monitors do
    // not quietly turn this into an O(n^2) space heater.
    var count = Math.min(58, Math.floor((w * h) / 24000));
    nodes = [];

    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.3 + 0.9
      });
    }
  }

  function draw() {
    // Kept deliberately faint: this is a texture behind the type, not a feature.
    var light = isLight();
    var lineScale = light ? 0.14 : 0.17;
    var nodeAlpha = light ? 0.34 : 0.40;
    var haloAlpha = light ? 0.05 : 0.08;

    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }

    ctx.lineWidth = 0.75;

    for (var a = 0; a < nodes.length; a++) {
      for (var b = a + 1; b < nodes.length; b++) {
        var p = nodes[a];
        var q = nodes[b];
        var dx = p.x - q.x;
        var dy = p.y - q.y;
        var d2 = dx * dx + dy * dy;

        if (d2 >= LINK_DIST * LINK_DIST) continue;

        var t = 1 - Math.sqrt(d2) / LINK_DIST;
        ctx.strokeStyle = rgba((t * lineScale).toFixed(3));
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }

    if (pointer.x !== null) {
      ctx.lineWidth = 1;
      for (var c = 0; c < nodes.length; c++) {
        var m = nodes[c];
        var mdx = m.x - pointer.x;
        var mdy = m.y - pointer.y;
        var md2 = mdx * mdx + mdy * mdy;

        if (md2 >= POINTER_DIST * POINTER_DIST) continue;

        var mt = 1 - Math.sqrt(md2) / POINTER_DIST;
        ctx.strokeStyle = rgba((mt * (light ? 0.22 : 0.3)).toFixed(3));
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }
    }

    for (var k = 0; k < nodes.length; k++) {
      var node = nodes[k];
      var halo = node.r * 4.5;
      var grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, halo);

      grad.addColorStop(0, rgba(haloAlpha));
      grad.addColorStop(1, rgba(0));

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, halo, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = rgba(nodeAlpha);
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    draw();
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (frame === null) frame = requestAnimationFrame(loop);
  }

  function stop() {
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (smallScreen.matches) { stop(); ctx.clearRect(0, 0, w, h); return; }
      resize();
      seed();
      start();
    }, 180);
  });

  window.addEventListener('pointermove', function (e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  }, { passive: true });

  window.addEventListener('pointerleave', function () {
    pointer.x = pointer.y = null;
  });

  // Do not burn frames on a tab nobody is looking at.
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });

  window.addEventListener('themechange', readAccent);

  readAccent();
  resize();
  seed();
  start();
})();
