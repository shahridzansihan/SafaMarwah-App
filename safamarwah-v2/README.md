# SafaMarwah v2 — foundation

Isolated React 19 + Vite + TypeScript + Tailwind CSS 4 scaffold. **Not deployed**. Existing production website and APK are unchanged.

## Development

`npm install && npm run dev`

## Scope

Unified design tokens, shared page shell, page/subpage/article templates, desktop 3-column/tablet 2-column/mobile 1-column grid, and standalone digital-card shell. Current content and visuals are placeholders; migrate and validate existing SafaMarwah functionality before release. Offline, Android build and production routing are not yet implemented in v2.

## Vercel preview (isolated from production)

1. In Vercel, import GitHub repository `shahridzansihan/SafaMarwah-App` as a **new** project (do not reuse the production project).
2. Set **Root Directory** to `safamarwah-v2`.
3. Set **Production Branch** for this separate Vercel project to `safamarwah-v2-foundation`.
4. Framework preset: Vite; Build command: `npm run build`; Output directory: `dist`.
5. Deploy to the automatically assigned `*.vercel.app` URL. Do **not** attach `app.safamarwah.my` or modify GitHub Pages settings.

The current SPA uses hash routes, such as `/#/panduan` and `/#/blog`, to keep links usable on static hosting.
