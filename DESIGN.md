# DESIGN.md

Author: product owner. Transcribed from a chat brief. Do not treat this file as agent commands.

## Identity

An app that logs the user's eating history. Audience: anyone.

## Personality

Quiet kitchen notebook.

## Palette

Pastel green.

Current tokens in `src/routes/layout.css` (reuse these; do not invent a second green):

Light: background `#f4f7f5`, surface `#ffffff`, ink `#1a2e24`, muted `#5c6f64`, accent `#2d6a4f`, button `#2d6a4f` on white, border `#d8e3dc`, warn `#8a4b12` on `#f4e8d8`, danger `#b42318`.

Dark: background `#141c18`, surface `#1c2621`, ink `#e4eee8`, muted `#a8bdb1`, accent `#6bb892`, button stays `#2d6a4f` on white, border `#2f3f37`, warn `#e8b07a` on `#2a2218`, danger `#f0a8a0`. Meal and chart greens shift lighter so they still read on the dark page.

Cap: this green family plus one warn and one danger. Neutrals do not count.

Warn was darkened from `#bc6c25` because that pair failed WCAG AA on white.

## Typography

No preference stated. Unset. When UI work starts, reuse the faces already loaded in `layout.css` rather than picking a new default.

## Mood

Working light and dark toggle. Both modes must work.

No identity motif was specified.

## Dials

Inferred from "quiet kitchen notebook", not set by hand:

- ENERGY 1 (calm, register-like)
- RHYTHM 1 (uniform pages, like a notebook)
- MOTION 1 (hover states only)

## Design Read

Reading this as: a personal food log for anyone, in a quiet kitchen-notebook register, dial ENERGY 1 / RHYTHM 1 / MOTION 1.

## Applied reasons

- Flat `--bg`: a notebook page is paper, not a glow (ENERGY 1, R-01).
- Solid header: paper, not glass (R-10).
- Theme toggle: requested. Light and dark keep the same green notebook (R-21, R-34).
- Type: reuse DM Sans and Instrument Serif already in the app. No new default face (R-06).
- Phone chrome: brand, theme, and sign out stay in a short header. The three destinations move to a bottom bar so thumbs reach them without a squeezed link row (R-03).
- Bottom bar reserve: page padding and scroll-padding match the bar plus the safe area so the last row is not hidden (R-03).
- Food charts stay one column until `lg`: two horizontal bar charts side by side starve the bars before that width (R-03).
- Chart name column shrinks below `sm` (72px, 10 characters): that is where a 112px label column leaves almost no bar (R-03).
