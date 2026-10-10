# Map of Mathematics

An interactive, zoomable map of mathematical ideas. Each concept is a node; an arrow runs from an idea to the ideas that build on it, so dependent concepts are children of their prerequisites, Principia-style.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The whole viewer: markup, styles and script in one page. Loads D3 7.9.0 from cdnjs. |
| `data/concepts.json` | The dataset. Grow the map by editing only this file. |
| `data/details.json` | The long explanation and worked example for each concept, fetched the first time one is opened. |
| `data/illustrations.js` | Small canvas animations for the concepts where motion helps, loaded on demand. |
| `tools/validate.mjs` | Checks the dataset: unique ids, known domains and prerequisites, no cycles. |

## Architecture

- **Static site, no build step.** The page fetches `data/concepts.json`, so it can be hosted anywhere static files are served (GitHub Pages, Netlify, an Artifact).
- **Graph model.** Each concept lists the concepts it `requires`. From that the viewer derives parents and children, each concept's depth (longest chain back to propositional logic), its full set of prerequisites, and everything built on it. Node size grows with how much of the map rests on it.
- **Layout.** A D3 force simulation, run to completion once at load so the map is stable. Two views:
  - *Foundations*: a radial force puts each concept on the ring for its depth, so the axioms sit at the centre and every step outward is one more layer of dependency. Ring radii grow with the square root of the number of concepts inside them, so the disc fills evenly.
  - *Clusters*: links and repulsion only, no rings.
  In both, the `domain` field is used only for colour. Clusters come purely from the dependency structure.
- **Rendering.** Canvas, not SVG, so it stays fast as the dataset grows into the thousands. Labels appear by importance as you zoom in, with simple collision avoidance.
- **Compare.** Select a concept, press *Compare with another idea* (or shift-click a second dot), and the map shows how the two are related: the routes from one to the other, or their nearest shared prerequisites and the first ideas that build on both.
- **Explanations.** Each concept panel has an expandable *Explanation and example*: the idea in plain words, the most elegant worked example, and why it matters. Some concepts also have a looping animation, which pauses on request and starts paused for people who prefer reduced motion. Maths is written in TeX and rendered to MathML by KaTeX 0.16.9 from cdnjs, loaded only when an explanation is opened.
- **Deep links.** `#concept-id` opens a concept; `#first-id~second-id` opens a comparison.

## Data format

```json
{ "id": "galois-theory", "name": "Galois theory", "domain": "algebra", "kind": "concept",
  "requires": ["field-extension", "symmetric-group", "quotient-group"],
  "summary": "One or two plain sentences a newcomer can follow." }
```

- `id`: lowercase letters, digits and hyphens. Used in links, so don't rename lightly.
- `domain`: one of the ids in the `domains` list at the top of the file.
- `kind`: `axiom`, `concept` or `theorem` (drawn as diamond, dot and ring).
- `requires`: only the *direct* prerequisites. The viewer works out the rest of the chain.

### Explanations

`data/details.json` maps each concept id to four strings:

```json
{ "version": 1, "illustrated": ["fourier-series", "..."],
  "details": { "lagranges-theorem": { "intuition": "...", "exampleTitle": "Rotations of a square", "example": "...", "why": "..." } } }
```

The strings are a small Markdown subset: paragraphs separated by blank lines, `**bold**`, `*italic*`, `- ` and `1. ` lists, inline maths in `$...$` and display maths as its own paragraph in `$$...$$`. Write a literal dollar sign as `\$`.

An animation registers itself in `data/illustrations.js`:

```js
(window.MathIllustrations ||= {})["fourier-series"] = {
  caption: "What the viewer is watching.", duration: 10, still: 7, aspect: 0.62,
  draw(ctx, w, h, t, theme) { /* draw in CSS pixels; t runs from 0 to duration */ }
};
```

`draw` must depend only on its arguments, so the same `t` always gives the same picture, and should use the theme's colours so it works in light and dark. List the concept's id in `illustrated` too.

## Working on it

```sh
node tools/validate.mjs          # check the data (and details.json) after editing
python3 -m http.server 8000      # then open http://localhost:8000
```

Opening `index.html` straight from disk won't work, because browsers block `fetch` from `file://` pages.

`index.html` is a complete page and works on any static host, including GitHub Pages.

## Licence

MIT. See `LICENSE`.
