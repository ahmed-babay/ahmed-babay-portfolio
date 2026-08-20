/**
 * theme.js — colour scheme persistence.
 *
 * The initial value is applied by a tiny inline script in <head> so the page
 * never paints the wrong theme. This module only wires up the toggle and keeps
 * localStorage, the <meta name="theme-color"> tag, and other tabs in sync.
 */
(function () {
  'use strict';

  var KEY = 'theme';
  var root = document.documentElement;

  var META = {
    dark: '#08090c',
    light: '#f7f8fa'
  };

  function current() {
    return root.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function apply(theme) {
    root.dataset.theme = theme;

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', META[theme]);

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    });

    // Let the canvas background repaint with the new accent immediately.
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      apply(next);
      try {
        localStorage.setItem(KEY, next);
      } catch (e) {
        /* private mode — the choice just will not persist */
      }
    });
  });

  // Keep multiple open tabs consistent.
  window.addEventListener('storage', function (e) {
    if (e.key === KEY && e.newValue) apply(e.newValue);
  });

  apply(current());
})();
