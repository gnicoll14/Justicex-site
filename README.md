# JusticeX.ai — marketing site

Static HTML site for justicex.ai, deployed via Netlify (project `fabulous-sunshine-504c7c`).

## Structure
- Pages: `index`, `solutions`, `technology`, `markets`, `about`, `contact`, `disclaimer`, `mediator-console`
- Shared nav + footer injected by `js/partials.js`
- Styles in `css/` (`tokens.css` is the brand source of truth)
- `_backups/` holds pre-edit snapshots (git-ignored, not deployed)

## Deploy
Connected to Netlify via Git. Push to `main` publishes to justicex.ai; every branch/PR gets a Netlify **deploy preview** URL. No build step — it's static (`publish = "."`).

## Local preview
From the repo root: `python3 -m http.server 8080` then open http://localhost:8080
