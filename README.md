# Ahmed Babay — Portfolio

Personal site and case-study portfolio.
**Live:** https://ahmedbabay.me

Built as a hand-written static site: no framework, no build step, no
dependencies to install. Push to `main` and GitHub Pages serves it.

---

## Structure

```
index.html          The house — one scroll-driven scene. Ten acts, each
                    owning a room: outside, the whole house, entrance hall
                    (at a glance), studio (selected work), office (experience),
                    kitchen (capabilities), attic (education), living room
                    (about), back garden (the eight case studies in full),
                    mailbox (contact)
projects.html       The same eight case studies as a plain document. The site
                    itself now reads them in the back garden; this page stays
                    for deep links and for anyone without JavaScript
404.html            Not-found page

assets/
  css/
    base.css        Design tokens, reset, typography, layout primitives
    components.css  Buttons, chips, cards, palette, lightbox, toast
    house.css       The cutaway scene, the camera, the acts, day & night
    rooms.css       The 3D room stages: shadow-box layers, fire, cat, grain
    work.css        Case-studies page
  js/
    theme.js        Night/day persistence (no flash of wrong theme)
    ui.js           Reveal, carousels, filters, lightbox, copy, toast
    palette.js      ⌘K command palette
    house.js        Scroll-driven camera: maps scroll position to an SVG viewBox
    rooms.js        Cross-dissolves the 3D interiors, and the pointer camera
    constellation.js Ambient canvas backdrop (case-studies page)
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

- **The camera** is scroll-driven. Each act dwells on its room while you read,
  then travels to the next over the tail of the section. Nothing to click —
  the floor plan, the room hotspots and ⌘K all just scroll you somewhere.
- **The house** is a single inline SVG holding the exterior, the cutaway
  interior and every prop. Moving into a room animates the `viewBox`, so a room
  fills the frame at full vector fidelity and there is no second scene to load.
- **Each room is also a full-viewport interior** — a shadow box of six planes
  sharing one drawing space, pushed apart along Z. A plane at depth `z` is
  scaled by `(1300 - z) / 1300`, which exactly cancels the perspective divide:
  head-on the layers register as one picture, and a couple of degrees of camera
  rotation separates them into real parallax. CSS 3D, no WebGL, no models.
- **Leaving a room is scroll-driven, not timed.** The room behind you drifts
  toward the camera and dissolves while the next walks up out of the dark, so
  you can stop halfway and stand in the doorway.
- **Jumping is not scrolling.** The floor plan, the room hotspots and the
  command palette set the scroll position with `behavior: 'instant'`, so none
  of the rooms in between are ever built, then play a one-shot push-in from the
  whole-house framing. It reads as flying there rather than cutting.
- **Every light is drawn in the scene, not over it.** Glows live inside the SVG
  anchored to the fitting that makes them, each with a small hot core at the
  bulb; the only screen-space overlay left is a uniform warm breath with no
  position to get wrong.
- Anything animated inside a stage sets `transform-box: fill-box`. Without it
  `transform-origin` resolves against the SVG viewport rather than the shape,
  and things pivot from somewhere out in space.
- **⌘K / Ctrl+K** (or `/`) opens the command palette — jump to any room, any
  case study, or the CV.
- **Night and day** is the theme toggle: dark is the house at night with the
  windows lit and lamps on; light is the same house in the afternoon. It
  persists in `localStorage` and syncs across tabs. An inline script in
  `<head>` applies it before first paint.
- **No-JS**: both pages are complete, readable documents without JavaScript.
  With the scene switched off the acts are ordinary stacked sections. Scripts
  only enhance — they never render content.
- **Reduced motion**: the camera snaps instead of easing, and the ambient
  animation — stars, smoke, fireflies, lamps, the cat — all stands down.

## Running locally

Any static server works:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Tech

HTML · CSS · vanilla JavaScript · [Devicon](https://devicon.dev) for tech marks ·
Google Fonts. No trackers, no analytics, no cookies.
