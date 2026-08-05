# ANAAD — Website

A single-page, cinema-themed website for the anonymous Punjabi artist **Anaad**, built
around a scroll-driven "walk through an abandoned grand cinema" concept: theatre
curtains physically part open in 3D as you scroll the hero, parallax depth layers
move each background at its own rate, and a film-reel timecode tracker on the left
edge counts up like a running reel as you move through the page.

No build step, no dependencies to install — it's plain HTML/CSS/JS.

## Running it

Just open `index.html` in a browser, or serve the folder locally:

```bash
cd anaad
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploying it

Upload the whole folder as-is to any static host (Netlify, Vercel, GitHub Pages,
Cloudflare Pages, S3, etc.). There's nothing to build.

## Structure

```
anaad/
├── index.html          All page content/sections
├── css/style.css        Design tokens, layout, animation
├── js/main.js            Scroll reveals, parallax, curtain-open, tilt, reel tracker
├── assets/images/        Web-optimized JPGs (compressed from the originals)
└── README.md
```

## Design notes

- **Palette:** void black, deep velvet red, aged theatre gold, warm bone white, muted
  ash gray, and a rare ember-orange accent — pulled from the curtain, mask embroidery,
  and foundry imagery.
- **Type:** Cinzel (display), UnifrakturCook (used sparingly for the "Anaad" wordmark
  and a few script accents, echoing the gothic embroidery on the balaclava), Jost
  (body), Space Mono (labels, timecodes — reinforcing the film motif).
- **Signature element:** the opening curtain hero and the persistent reel-timecode
  tracker, which turns scroll position into an actual "running time" rather than a
  decorative progress bar.
- Respects `prefers-reduced-motion` (curtains/parallax/tilt are disabled, reveals
  still fade in without translation).

## Customizing content

All copy lives directly in `index.html`, organized into `<section>` blocks matching
the site's structure (About, Philosophy, What Anaad Does, Discography, Sound, Videos,
Visual Identity, Quote, Experience, Collaborations, Services, Media, Contact). Update
the `mailto:` link in the Contact section with a real booking address before launch.

Images are pre-compressed to keep the page fast — if you swap in new photography,
run it through similar compression (long edge ~1920px, JPEG quality ~78) to keep load
times low.
