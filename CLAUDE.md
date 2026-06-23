# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static landing page for **M.C Love Travel** — a Guatemala tour company offering overnight hikes to Volcán Acatenango with views of Volcán Fuego eruptions. Deployed on GitHub Pages at `https://denimayca0-commits.github.io/mc-love-travel/`.

No build system, no package manager, no transpilation. The entire site ships directly as static files.

## File Structure

- `index.html` — the entire site: HTML structure, embedded CSS (`<style>`), and embedded JavaScript (`<script>`) all in one file (~1700 lines)
- `worker.js` — Cloudflare Worker deployed separately; proxies Gemini API calls so the API key never reaches the client
- `fotos/webp/` — 213 WebP images numbered sequentially (`1.webp`–`213.webp`); converted from originals to reduce page weight
- `fotos/og.jpg` — social sharing preview image
- `sitemap.xml` / `robots.txt` — SEO files; update `<lastmod>` in sitemap after content changes

## Running Locally

Open `index.html` directly in a browser, or serve with any static server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

The AI chatbot will not work locally unless the `WORKER_URL` in `index.html` points to a deployed Cloudflare Worker.

## Architecture of index.html

All CSS is in one `<style>` block (lines ~59–346). All JavaScript is at the bottom in one `<script>` block (lines ~1100+). Sections follow this HTML order:

`NAV → HERO → STATS → ABOUT (#tours) → PRICING (#precios) → ITINERARY (#itinerario) → DATES (#fechas) → WHAT TO BRING (#llevar) → GALLERY (#galeria) → TESTIMONIALS (#testimonios) → FAQ (#faq) → CTA → FOOTER → CHATBOT`

### Key JavaScript Systems

**Gallery** (`galData`, `renderGalPage`, `openGalCat`): Five categories defined in `galData[]` array at line ~1121. Each category holds an array of photo numbers. `PAGE_SIZE = 12` controls pagination. `makePhotos(nums)` converts number arrays to `fotos/webp/N.webp` paths.

**Lightbox** (`openLightbox`, `updateLb`, `lbNav`): Full-screen image viewer with swipe/touch support, keyboard arrow navigation, and neighbor preloading.

**Bilingual ES/EN** (`EN_MAP`, `EN_REGEX`, `PLACEHOLDERS`, `TITLES`, `toggleLang`, `applyLang`): DOM text-walking approach. `EN_MAP` maps Spanish strings to English. `EN_REGEX` handles patterns. The current language is stored in `let lang = 'es'`. Toggling re-walks the entire DOM.

**AI Chatbot** (`WORKER_URL`, `SYS`, `ask`): Sends messages to the Cloudflare Worker at `WORKER_URL` (line ~1548), which proxies to Gemini 2.5 Flash. `SYS` is the system prompt (lines ~1553–1595) defining the assistant's knowledge about prices, reservation policy (50% deposit, non-refundable), meeting point, etc.

**Accordion** (`toggleAcc`): Simple max-height CSS transition toggled by JS.

**Fade-in animations**: `IntersectionObserver` adds `.visible` class to `.fade-in` elements.

## Cloudflare Worker

`worker.js` must be deployed separately at [dash.cloudflare.com](https://dash.cloudflare.com):
1. Create a Worker, paste the file contents, deploy
2. Add secret `GEMINI_API_KEY` in Settings → Variables
3. Update `WORKER_URL` in `index.html` with the deployed worker URL

CORS is locked to `https://denimayca0-commits.github.io` in `ALLOWED_ORIGIN`.

## Design Tokens (CSS Variables)

```css
--bg-primary: #0a0a0f      /* page background */
--bg-secondary: #111118    /* section alternates */
--bg-card: #1a1a24         /* cards */
--accent-fire: #ff4500     /* primary CTA, fire color */
--accent-orange: #ff6b35   /* secondary accent */
--accent-gold: #d4af37     /* prices, logo */
--text-primary: #f0ede6
--text-secondary: #9a9090
```

## Business Details (kept in sync across code)

- WhatsApp: `+502 5829-9965` (links use `https://wa.me/50258299965`)
- Prices: Q350 (sin alimentación, ≈ US$49.99) / Q450 (con alimentación, ≈ US$59.99)
- Reservation policy: 50% deposit required, non-refundable; remainder paid day of tour
- Meeting point: Parque Bella Avryl, La Soledad, Acatenango — 10:00 AM
- Group tours: Saturdays; private tours: Mon–Fri

These values appear in: `<script type="application/ld+json">` (structured data), the `SYS` chatbot prompt, visible HTML content, and FAQ accordion items. Update all locations when prices or policies change.

## Deployment

Push to `main` branch — GitHub Pages deploys automatically from the repository root.
