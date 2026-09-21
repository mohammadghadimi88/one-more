# One More

A minimal daily crowd-prediction game built with plain HTML, CSS and JavaScript.

## Features
- Daily deterministic challenge
- 20 curated questions with fixed benchmark percentages
- Percentage prediction slider
- Score based on prediction error
- Local streak, average and best score
- Share / challenge link using `?q=ID`
- Responsive mobile-first UI
- Installable PWA
- Offline cache
- GitHub Pages deployment through GitHub Actions

## GitHub Pages
This repository is designed to deploy as a static site using the included workflow in `.github/workflows/deploy.yml`.

After pushing the repository:
1. Open **Settings → Pages**.
2. Set the source to **GitHub Actions** if GitHub asks for a source.
3. The workflow deploys on pushes to `main`.

Project-site URL pattern:
`https://YOUR-USERNAME.github.io/REPOSITORY/`

## Important product note
The displayed "crowd" percentages are curated fixed benchmarks, not live polling. The interface is intentionally explicit about that.

## Local use
Open `index.html` in a browser. For service-worker/PWA testing, serve the folder from a local HTTP server.

## Customize
Edit `app.js` to add questions or change the scoring formula.
