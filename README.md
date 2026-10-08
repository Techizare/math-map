# Map of Mathematics

An interactive, zoomable map of mathematical ideas. Each concept is a node; an arrow runs from an idea to the ideas that build on it, so dependent concepts are children of their prerequisites, Principia-style.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The whole viewer: markup, styles and script in one page. Loads D3 7.9.0 from cdnjs. |
| `data/concepts.json` | The dataset. Grow the map by editing only this file. |
| `tools/validate.mjs` | Checks the dataset: unique ids, known domains and prerequisites, no cycles. |

## Architecture

- **Static site, no build step.** The page fetches `data/concepts.json`, so it can be hosted anywhere static files are served (GitHub Pages, Netlify, an Artifact).
- **Graph model.** Each concept lists the concepts it `requires`. From that the viewer derives parents and children, each concept's depth (longest chain back to propositional logic), its full set of prerequisites, and everything built on it. Node size grows with how much of the map rests on it.
- **Layout.** A D3 force simulation, run to completion once at load so the map is stable. Two views:
  - *Foundations*: a radial force puts each concept on the ring for its depth, so the axioms sit at the centre and every step outward is one more layer of dependency. Ring radii grow with the square root of the number of concepts inside them, so the disc fills evenly.
  - *Clusters*: links and repulsion only, no rings.
  In both, the `domain` field is used only for colour. Clusters come purely from the dependency structure.
- **Rendering.** Canvas, not SVG, so it stays fast as the dataset grows into the thousands. Labels appear by importance as you zoom in, with simple collision avoidance.
- **Deep links.** `#concept-id` in the URL opens that concept.

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

## Working on it

```sh
node tools/validate.mjs          # check the data after editing
python3 -m http.server 8000      # then open http://localhost:8000
```

Opening `index.html` straight from disk won't work, because browsers block `fetch` from `file://` pages.

`index.html` is a complete page and works on any static host, including GitHub Pages.
