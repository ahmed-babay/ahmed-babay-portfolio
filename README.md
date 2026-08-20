# Ahmed Babay — Portfolio

Personal site and case-study portfolio.
**Live:** https://ahmed-babay.github.io/ahmed-babay-portfolio/

Built as a hand-written static site: no framework, no build step, no
dependencies to install. Push to `main` and GitHub Pages serves it.

---

## Structure

```
index.html          Profile — hero, selected work, experience, capabilities,
                    education, about, contact
projects.html       Eight case studies: problem → what I built → what I took from it
404.html            Not-found page

assets/
  css/
    base.css        Design tokens, reset, typography, layout primitives
    components.css  Nav, buttons, chips, cards, timeline, palette, lightbox
    home.css        Homepage sections
    work.css        Case-studies page
  js/
    theme.js        Dark/light persistence (no flash of wrong theme)
    ui.js           Reveal, scrollspy, carousels, filters, lightbox, copy, toast
    palette.js      ⌘K command palette
    constellation.js Ambient canvas backdrop
  img/favicon.svg

metadata/           CV, portrait, logos, project screenshots
```

## Design system

Everything visual is driven by custom properties in `assets/css/base.css`.
Change a token there and it propagates across both pages and both themes.

| Token group | Notes |
|---|---|
| Colour | Dark is the default; `:root[data-theme="light"]` overrides the same names |
| Type | Space Grotesk (display), Inter (body), JetBrains Mono (labels) |
| Space | 4px base scale, `--s-1` … `--s-12` |
| Motion | `--ease`, `--dur`; every animation is disabled under `prefers-reduced-motion` |

## Behaviour

- **⌘K / Ctrl+K** (or `/`) opens the command palette — jump to any section,
  profile, or the CV.
- **Theme** persists in `localStorage` and syncs across tabs. An inline script
  in `<head>` applies it before first paint.
- **No-JS**: both pages are complete, readable documents without JavaScript.
  Scripts only enhance — they never render content.
- **Reduced motion**: the canvas backdrop, reveals, carousels, and marquee all
  stand down.

## Running locally

Any static server works:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Tech

HTML · CSS · vanilla JavaScript · [Devicon](https://devicon.dev) for tech marks ·
Google Fonts. No trackers, no analytics, no cookies.
