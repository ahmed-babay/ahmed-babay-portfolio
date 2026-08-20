/**
 * palette.js — ⌘K / Ctrl+K command palette.
 *
 * A quiet power-user affordance: jump to any section, open any profile, grab
 * the CV. Entirely optional — every destination in here is also a normal link
 * somewhere on the page.
 */
(function () {
  'use strict';

  var palette = document.querySelector('[data-palette]');
  if (!palette) return;

  var input   = palette.querySelector('input');
  var list    = palette.querySelector('[data-palette-list]');
  var trigger = document.querySelector('[data-palette-open]');

  var ICONS = {
    section: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    link:    '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    file:    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    mail:    '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    theme:   '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>'
  };

  var COMMANDS = [
    { group: 'Navigate', label: 'Work',          icon: 'section', href: 'index.html#work' },
    { group: 'Navigate', label: 'Experience',    icon: 'section', href: 'index.html#experience' },
    { group: 'Navigate', label: 'Capabilities',  icon: 'section', href: 'index.html#skills' },
    { group: 'Navigate', label: 'Education',     icon: 'section', href: 'index.html#education' },
    { group: 'Navigate', label: 'About',         icon: 'section', href: 'index.html#about' },
    { group: 'Navigate', label: 'Contact',       icon: 'section', href: 'index.html#contact' },
    { group: 'Navigate', label: 'All case studies', icon: 'section', href: 'projects.html' },

    { group: 'Elsewhere', label: 'GitHub',   icon: 'link', href: 'https://github.com/ahmed-babay', external: true },
    { group: 'Elsewhere', label: 'LinkedIn', icon: 'link', href: 'https://www.linkedin.com/in/ahmed-babay-0a6a9b1b1/', external: true },

    { group: 'Actions', label: 'Download CV (PDF)', icon: 'file', href: 'metadata/Ahmed_Babay_CV.pdf', download: true },
    { group: 'Actions', label: 'Send an email',     icon: 'mail', href: 'mailto:ahmed.babay.personal@gmail.com' },
    { group: 'Actions', label: 'Toggle theme',      icon: 'theme', action: function () {
        var btn = document.querySelector('[data-theme-toggle]');
        if (btn) btn.click();
      }
    }
  ];

  var results = [];
  var cursor = 0;

  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
           (ICONS[name] || ICONS.link) + '</svg>';
  }

  function render(query) {
    var q = query.trim().toLowerCase();

    results = COMMANDS.filter(function (cmd) {
      return !q || cmd.label.toLowerCase().indexOf(q) > -1 || cmd.group.toLowerCase().indexOf(q) > -1;
    });

    cursor = 0;

    if (!results.length) {
      list.innerHTML = '<p class="palette__empty">No matches for &ldquo;' +
        query.replace(/[<>&]/g, '') + '&rdquo;</p>';
      return;
    }

    var html = '';
    var lastGroup = null;

    results.forEach(function (cmd, i) {
      if (cmd.group !== lastGroup) {
        html += '<p class="palette__group">' + cmd.group + '</p>';
        lastGroup = cmd.group;
      }
      html += '<button type="button" class="palette__item" role="option" data-index="' + i + '"' +
              ' aria-selected="' + (i === 0) + '">' + icon(cmd.icon) +
              '<span>' + cmd.label + '</span>' +
              (cmd.external ? '<span class="hint">↗</span>' : '') +
              '</button>';
    });

    list.innerHTML = html;
  }

  function highlight(next) {
    if (!results.length) return;
    cursor = (next + results.length) % results.length;

    var items = list.querySelectorAll('.palette__item');
    items.forEach(function (item, i) {
      item.setAttribute('aria-selected', String(i === cursor));
    });

    var active = items[cursor];
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function run(cmd) {
    if (!cmd) return;
    close();

    if (cmd.action) { cmd.action(); return; }

    if (cmd.external) {
      window.open(cmd.href, '_blank', 'noopener');
    } else if (cmd.download) {
      var a = document.createElement('a');
      a.href = cmd.href;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      window.location.href = cmd.href;
    }
  }

  var lastFocused = null;

  function open() {
    lastFocused = document.activeElement;
    palette.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    input.value = '';
    render('');
    input.focus();
  }

  function close() {
    palette.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  input.addEventListener('input', function () { render(input.value); });

  list.addEventListener('click', function (e) {
    var item = e.target.closest('.palette__item');
    if (item) run(results[Number(item.dataset.index)]);
  });

  list.addEventListener('mousemove', function (e) {
    var item = e.target.closest('.palette__item');
    if (item) highlight(Number(item.dataset.index));
  });

  palette.addEventListener('click', function (e) {
    if (e.target === palette) close();
  });

  palette.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown')      { e.preventDefault(); highlight(cursor + 1); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); highlight(cursor - 1); }
    else if (e.key === 'Enter')     { e.preventDefault(); run(results[cursor]); }
    else if (e.key === 'Escape')    { e.preventDefault(); close(); }
  });

  if (trigger) trigger.addEventListener('click', open);

  document.addEventListener('keydown', function (e) {
    var isOpen = palette.classList.contains('is-open');

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      isOpen ? close() : open();
      return;
    }

    // "/" opens the palette, but not while the visitor is typing somewhere else.
    var tag = document.activeElement && document.activeElement.tagName;
    if (e.key === '/' && !isOpen && tag !== 'INPUT' && tag !== 'TEXTAREA') {
      e.preventDefault();
      open();
    }
  });
})();
