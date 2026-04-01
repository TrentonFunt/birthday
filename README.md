# BirthdayQuest (static HTML/JS + Tailwind v4)

A small “click-through quest” birthday website (mobile-first) with a passcode gate, a few gamified screens, and a final voucher reveal + Cloudinary video.

## Customize

Edit [`content.js`](./content.js):
- **Passcode**: `CONTENT.gate.passcode`
- **Names/messages**: `CONTENT.person` + `CONTENT.screens.*`
- **Photos**: set paths in `CONTENT.screens.photos.cards`
- **Voucher image**: `CONTENT.screens.final.voucherImageSrc`
- **Cloudinary videos**: `CONTENT.screens.final.videos[]` (`secure_url` for each)

## Theme colours

Defined in [`src/tailwind.css`](./src/tailwind.css) under `@layer base` (`--c-dark`, `--c-bright`, `--c-neutral`). Tailwind scans [`index.html`](./index.html) and [`app.js`](./app.js) via `@source` so class names in JS are included in the build. If text looks unstyled or “black”, run `npm run build:css` again.

## Cloudinary notes

- Upload your video as a **video** resource.
- Copy the Cloudinary **secure URL** (often looks like `https://res.cloudinary.com/<cloud_name>/video/upload/<public_id>.mp4`).
- Paste it into `content.js`.
- Optional (recommended) delivery tweaks: in the URL you can insert transformations like `f_auto,q_auto` (example: `.../video/upload/f_auto,q_auto/<public_id>.mp4`).

Privacy: the passcode gate is “private-ish” (client-side). For stronger control later, you can switch to **signed Cloudinary URLs** (would require adding a small Vercel serverless function).

## Install

```bash
npm install
```

## Build Tailwind CSS

```bash
npm run build:css
```

This generates `assets/tailwind.css` (used by `index.html`).

### If you see `could not determine executable to run` (npx / tailwindcss)

That is **not** because you skipped React/Next/etc. In **Tailwind v4**, the `tailwindcss` npm package is the **engine only**; the **CLI** lives in **`@tailwindcss/cli`**. Without it, `npx tailwindcss` has nothing to run. This repo lists both in `devDependencies`; run `npm install`, then `npm run build:css` (npm puts `tailwindcss` on your PATH from `node_modules/.bin`).

## Run locally

Build CSS first, then run any static server. Examples:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy to Vercel

- Import this repo in Vercel.
- Framework: **Other** (static)
- Build command: `npm run build`
- Output directory: root (default)

