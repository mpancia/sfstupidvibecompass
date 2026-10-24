# SF Political Compass For AI Morons

A parody of a vibe-coded San Francisco political compass. Static site, no build step, no dependencies.

- `data.js`: questions, quadrants, chart placements, fake propositions
- `app.js`: quiz flow, scoring, SVG compass, share link, PNG export
- `styles.css`, `index.html`: layout

Results are encoded in the URL hash (`#r=...`), so shared links work without a server.

## Run locally

    python3 -m http.server 8741

Then open http://localhost:8741. ES modules need an HTTP server; `file://` will not work.

## Deploy

Served by GitHub Pages from `main` at the repo root. The `CNAME` file sets the custom domain, and `.nojekyll` turns off Jekyll processing.

DNS at the registrar, for the apex domain:

    A      @    185.199.108.153
    A      @    185.199.109.153
    A      @    185.199.110.153
    A      @    185.199.111.153
    CNAME  www  mpancia.github.io

## Changing content

Edit `QS` in `data.js` to change questions. Each has an axis (`x` or `y`) and a sign `s`. Edit `ENT` to move people on the chart, and `PROPS` for the fake ballot. Counts in the page text come from the array lengths. The `20 questions` figure in the meta tags of `index.html` is hardcoded and needs updating by hand.
