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
| `glass-bg` | `#FAFCFE / 0.80` | `white / 0.08` | Default floating panel, over the app's own ground |
| `glass-bg-strong` | `#FAFCFE / 0.92` | `white / 0.14` | Panels carrying form controls or long text |
| `glass-bg-subtle` | `#FAFCFE / 0.68` | `white / 0.05` | Chrome that must not compete: the sticky header |
| **`glass-bg-media`** | `#0A2E46 / 0.88` | **same** | **Over photography.** See below — this one is not optional |
| `glass-border` | `white / 0.42` | `white / 0.11` | The bright top edge. Always present |
| `glass-blur` | `14px` | `24px` | Dark needs more blur to separate |
| `glass-saturate` | `125%` | `118%` | Saturation is what makes it read as glass rather than fog |

**Quieted 2026-09-09.** The first cut of this material was too bright and too glassy, and
both halves of that are measurable rather than a matter of taste. The light tint was pure
`#FFFFFF` at 72%, which is milk rather than glass on a page whose ground was also white; it
is now `surface-raised` at 80%, so the pane belongs to the same family as everything beside
it. Saturation was 180% — past a pane and into a filter, pushing the coastal blues and the
photography's greens well beyond what was actually behind the glass. The blur came down with
it: 20px was doing separation work that opacity was already doing, at a real per-frame GPU
cost on the mid-range Android this market browses on.

The grounds moved with the material. **Nothing in the light theme is pure white any more** —
`surface-raised` is `#FAFCFE` and `surface` is `#EFF5FA`, because `surface-raised` is the
ground under every card, every form control and the two widest bands on the home page, and
at `#FFFFFF` it put body text at 17:1 across most of the viewport. That is not crispness, it
is glare, on a site read outdoors on a phone. `surface-sunken` deliberately did not move:
`content-subtle` sits at 4.57:1 on it and there is no room below that.

### Why `glass-bg-media` exists

A translucent panel has no fixed colour. Dark-theme glass is white at 8%, which is correct
over the app's own dark ground and **catastrophic over a bright photograph**: it composites
to nearly white, and its text measures **1.13:1**. Invisible.

`glass-bg-media` tints toward `surface-inverse` instead and carries `content-on-media` text,
measured at **15.17:1** over black and **9.80:1** over white. It is **the same value in both
themes**, because a photograph does not flip with the lights.

Raising it from 0.78 to 0.88 in the 2026-09-09 quieting improved the worst case — the white
end went from 7.05:1 to 9.80:1 — because on this material, less glassy is also more legible.
It is the one glass token whose opacity should keep climbing rather than falling if the
question ever comes up again: a photograph is not a design system, and nothing behind it can
be relied on.

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

**The theme is reachable from the public site.** `ThemeToggle` had lived only in the admin
shell, which meant the dark theme existed, was held to AA, was tested — and could not be
asked for by any of the people the site is actually built for. It now sits in the public
header (in its `media` tone while the header is still transparent over the hero photograph)
and, below `sm`, in the mobile menu panel. It stays three options rather than a switch:
`light | dark | system`, because a two-state switch destroys the "follow my OS" preference
the first time anyone touches it.

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
