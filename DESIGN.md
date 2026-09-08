# Raslipwani Properties — Design System

> The authority for visual decisions. When this document and a component disagree, **this
> document wins and the component is the bug.** Product truth lives in `PRODUCT.md`; the
> implementation plan that established this world is `REVAMP.md`.
>
> **Committed 2026-09-08.** Supersedes the undocumented incumbent look.

---

## The world: Coastal Light

Raslipwani sells property on the Kenyan coast at Kikambala, north of Mombasa. The defining
quality of that place is **light on water** — high, bright, slightly hazed, with deep blue
underneath it.

That is also, not by coincidence, exactly the physics iOS imitates: a frosted layer that
takes its colour from what is behind it, lifted off the ground by a soft shadow and a bright
top edge.

So the glass here is not an affectation bolted onto a property site. **It is sea haze**, and
it is the one material that makes property photography look more expensive rather than less —
because it sits *over* the photograph and lets it through.

## The three rules

1. **Glass is a layer, not a texture.** It appears where content floats over something else —
   over a photograph, over the page while scrolling, over the map. A panel sitting on a flat
   background is not glass; it is a `Card`, and it gets `surface-raised` like it always did.
   **Glass everywhere is glass nowhere.**
2. **Depth comes from light, not from lines.** Elevation is a bright top border plus a soft
   brand-tinted shadow — never a heavier stroke, never a darker grey. Shadows are tinted with
   `#0B2537` (the content colour) rather than black, because black shadows on a warm coastal
   ground read as dirt.
3. **Amber is the only warm thing on screen.** It marks the single most important action in
   any view and nothing else. A second amber element halves the value of the first.

---

## Typography

The UI is set in the **platform's own face**:

```
-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable Text',
'Segoe UI', Inter, Roboto, 'Helvetica Neue', Arial, sans-serif
```

The site previously set everything in Poppins, loaded render-blocking from Google Fonts.
Poppins is a geometric sans with circular bowls and a tall x-height — friendly, approachable,
and the default of roughly every startup landing page since 2018. **It was the largest single
obstacle between this site and the word "premium."** No amount of blur radius compensates for
a typeface.

The system stack wins four ways at once:

- **On an iPhone it renders in actual SF Pro** — optically sized by the OS. Not an imitation
  of a native feel, the thing itself.
- **Zero bytes, zero requests.** It deletes a render-blocking stylesheet from `<head>`.
- **No FOUT** on the constrained mobile networks this market actually browses on.
- **It is what premium native software does.** Apple, Airbnb, Linear and iOS itself all set
  UI in the system face and reserve a display face for editorial moments.

**Poppins survives for one job:** display headlines at weight 600, via `font-display`, loaded
non-blocking with `font-display: optional`. A slow network gets the system face and loses
nothing structural.

Headlines set tight — `tracking-tight` — because the system faces are optimised for text
sizes and loosen up at display sizes if you let them.

---

## Materials

Defined in `src/design/materials.js`, generated into `src/styles/tokens.css`, bound to
Tailwind utilities. Never hand-write these values into a component.

| Token | Light | Dark | Where |
|---|---|---|---|
| `glass-bg` | `white / 0.72` | `white / 0.08` | Default floating panel, over the app's own ground |
| `glass-bg-strong` | `white / 0.88` | `white / 0.14` | Panels carrying form controls or long text |
| `glass-bg-subtle` | `white / 0.55` | `white / 0.05` | Chrome that must not compete: the sticky header |
| **`glass-bg-media`** | `#0A2E46 / 0.78` | **same** | **Over photography.** See below — this one is not optional |
| `glass-border` | `white / 0.60` | `white / 0.14` | The bright top edge. Always present |
| `glass-blur` | `20px` | `32px` | Dark needs more blur to separate |
| `glass-saturate` | `180%` | `140%` | Saturation is what makes it read as glass rather than fog |

### Why `glass-bg-media` exists

A translucent panel has no fixed colour. Dark-theme glass is white at 8%, which is correct
over the app's own dark ground and **catastrophic over a bright photograph**: it composites
to nearly white, and its text measures **1.13:1**. Invisible.

`glass-bg-media` tints toward `surface-inverse` instead and carries `content-on-media` text,
measured at **15.94:1** over black and **7.05:1** over white. It is **the same value in both
themes**, because a photograph does not flip with the lights.

This is proven by `src/design/__tests__/glassContrast.test.js`, which composites the glass
over the darkest and lightest ground a photograph can present and demands the text survive
both. The ordinary contrast test cannot see this class of defect, because it compares two
opaque tokens against a colour the browser stops painting the moment a panel goes translucent.

**Panels over photography use `tone="media"`. This is not a stylistic preference.**

### Elevation

Three stops — a contact edge, a lift, and an ambient pool — tinted with the content colour in
light and with black in dark. `shadow-raised` for cards, `shadow-glass` for floating panels,
`shadow-pressed` for the inset state.

### Radius

`sm 10px · md 14px · lg 20px · xl 28px · 2xl 36px`. iOS proportions. The outgoing 8px
`rounded-lg` was the second-most-obvious tell after the typeface.

### Motion

One signature curve: **`--ease-spring: cubic-bezier(0.32, 0.72, 0, 1)`** — the decelerating
spring iOS uses for sheets and pushes. Durations `fast 150ms · base 250ms · slow 400ms`.

Three motions, by role, and no others:

- **Enter** (content arriving): 12px rise + fade, `--dur-base`, `--ease-out-soft`, staggered
  40ms across siblings, once — never on scroll-back.
- **Press** (controls): `scale(0.97)`, `--dur-fast`, `--ease-spring`.
- **Present** (modals, sheets, the mobile booking dock): scale from 0.96 + fade,
  `--dur-base`, `--ease-spring`; sheets rise from the bottom edge on mobile.

Nothing uses `linear`. Nothing uses the uniform fade-up the site applied to everything.

---

## Colour

**Brand blue `#0D4B6E` and amber `#FFC107` are unchanged**, and the 58-token semantic layer
in `src/design/tokens.js` continues to be the only source of colour. Materials sit beneath
it, not beside it.

Roles, not values: `surface-raised` survives a theme swap; `bg-white` has already decided and
cannot be themed. The literal palette is fenced by
`eslint-rules/no-raw-palette-classes.js` under a ratcheting ceiling that only falls.

---

## Performance is a design constraint

- **First load holds at its budget.** `bundle-budget.json` is a ceiling that only falls.
- **≤ 3 live `backdrop-filter` surfaces composited per viewport.** Blur is a real GPU cost on
  the mid-range Android this market browses on. Beyond the cap, a panel keeps the look and
  drops the filter — and then goes **opaque**, because translucency without blur is just
  washed-out text.
- **`GlassPanel` is the only component permitted to emit a `backdrop-filter`.** That
  restriction is what makes the cap checkable rather than aspirational.

---

## How to use this document

**Before adding any new surface, ask the three questions in order:**

1. **Does this content float over something?** If no, it is a `Card`, not glass.
2. **Is it over a photograph?** If yes, `tone="media"`. If it is over the app's own ground,
   `tone="default"`.
3. **Is there already an amber element in this view?** If yes, this one is not amber.

And if it moves: it uses `--ease-spring`, and it respects `prefers-reduced-motion`.

## What this world is not

- **Not neumorphism.** No inset shadows on controls, no soft-extruded buttons, no dual light
  sources.
- **Not "dark mode is the premium one."** Light is the lead theme; dark is its equal, not its
  upgrade.
- **Not decorative blur.** Blur that is not separating two layers is a GPU cost with no job.
- **Not glass on flat ground.** That is a grey card with extra steps.
