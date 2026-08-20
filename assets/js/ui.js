/**
 * ui.js — interaction layer.
 *
 * Everything here degrades gracefully: with JS disabled the page is still a
 * complete, readable document. Nothing below renders content, it only enhances.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------- Nav ---- */

  var nav = $('[data-nav]');
  var progress = $('[data-progress]');

  function onScroll() {
    var y = window.scrollY;

    if (nav) nav.classList.toggle('is-stuck', y > 8);

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------- Drawer ---- */

  var drawer = $('[data-drawer]');
  var menuBtn = $('[data-menu-toggle]');

  function setDrawer(open) {
    if (!drawer || !menuBtn) return;
    drawer.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setDrawer(!drawer.classList.contains('is-open'));
    });
  }

  if (drawer) {
    $$('a', drawer).forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setDrawer(false);
  });

  /* ------------------------------------------------------------- Reveal ---- */

  var revealables = $$('[data-reveal], .reveal-lines');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) {
      // Stagger siblings that opt in via data-reveal-group on the parent.
      var parent = el.parentElement;
      if (parent && parent.hasAttribute('data-reveal-group')) {
        var index = $$('[data-reveal]', parent).indexOf(el);
        if (index > 0) el.style.setProperty('--reveal-delay', index * 90 + 'ms');
      }
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------------- Scrollspy ---- */

  var spyLinks = $$('[data-spy]');

  if (spyLinks.length && 'IntersectionObserver' in window) {
    var sections = spyLinks
      .map(function (link) { return document.getElementById(link.dataset.spy); })
      .filter(Boolean);

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        spyLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.dataset.spy === entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* -------------------------------------------------------- Card sheen ---- */

  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    $$('.card--glow').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
      });
    });
  }

  /* --------------------------------------------------------- Count-up ----- */

  var counters = $$('[data-count]');

  if (counters.length && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { countObserver.observe(el); });
  }

  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = (el.dataset.count.split('.')[1] || '').length;

    if (reduceMotion || isNaN(target)) {
      el.textContent = target.toFixed(decimals);
      return;
    }

    var duration = 1300;
    var start = performance.now();

    (function tick(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }

  /* ------------------------------------------------------------- Toast ---- */

  var toast = $('[data-toast]');
  var toastTimer;

  function showToast(message) {
    if (!toast) return;
    $('[data-toast-text]', toast).textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2400);
  }

  window.showToast = showToast;

  /* -------------------------------------------------------------- Copy ---- */

  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var text = btn.dataset.copy;

      var done = function () { showToast('Copied ' + text); };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }

      function fallback() {
        var input = document.createElement('textarea');
        input.value = text;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        try { document.execCommand('copy'); done(); } catch (err) { /* no-op */ }
        document.body.removeChild(input);
      }
    });
  });

  /* ---------------------------------------------------------- Lightbox ---- */

  var lightbox = $('[data-lightbox]');

  if (lightbox) {
    var lightboxImg = $('img', lightbox);
    var lastFocused = null;

    $$('[data-zoom]').forEach(function (holder) {
      holder.addEventListener('click', function () {
        var img = holder.tagName === 'IMG' ? holder : $('img', holder);
        if (!img) return;
        lastFocused = document.activeElement;
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        $('[data-lightbox-close]', lightbox).focus();
      });
    });

    var closeLightbox = function () {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    };

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.closest('[data-lightbox-close]')) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
    });
  }

  /* -------------------------------------------------------- Carousels ----- */

  $$('[data-carousel]').forEach(function (carousel) {
    var slides = $$('[data-slide]', carousel);
    var dots = $$('[data-dot]', carousel);
    var index = 0;
    var timer;

    if (slides.length < 2) {
      $$('[data-carousel-nav]', carousel).forEach(function (n) { n.style.display = 'none'; });
      return;
    }

    function go(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === index);
        s.setAttribute('aria-hidden', String(i !== index));
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-current', String(i === index));
      });
    }

    function restart() {
      if (reduceMotion) return;
      clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, 5500);
    }

    $$('[data-carousel-nav]', carousel).forEach(function (btn) {
      btn.addEventListener('click', function () {
        go(index + Number(btn.dataset.carouselNav));
        restart();
      });
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { go(i); restart(); });
    });

    carousel.addEventListener('mouseenter', function () { clearInterval(timer); });
    carousel.addEventListener('mouseleave', restart);

    go(0);
    restart();
  });

  /* ----------------------------------------------------------- Filters ---- */

  var filterBar = $('[data-filters]');

  if (filterBar) {
    var targets = $$('[data-tags]');

    $$('button', filterBar).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.dataset.filter;

        $$('button', filterBar).forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });

        var shown = 0;
        targets.forEach(function (el) {
          var match = filter === 'all' || el.dataset.tags.split(' ').indexOf(filter) > -1;
          el.hidden = !match;
          if (match) shown++;
        });

        var count = $('[data-filter-count]');
        if (count) count.textContent = shown;
      });
    });
  }

  /* ---------------------------------------------------------- Contact ----- */

  var form = $('[data-contact-form]');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new FormData(form);
      var name = (data.get('name') || '').trim();
      var email = (data.get('email') || '').trim();
      var message = (data.get('message') || '').trim();

      var body = 'From: ' + name + ' <' + email + '>\n\n' + message;
      var subject = 'Portfolio enquiry from ' + name;

      window.location.href =
        'mailto:' + form.dataset.contactForm +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      showToast('Opening your email client…');
    });
  }

  /* ------------------------------------------------------------- Year ----- */

  $$('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
