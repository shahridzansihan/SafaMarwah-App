# SafaMarwah V2 — React migration workspace

This folder is an **in-progress React + TypeScript + Vite conversion**, branched from `backup/design-2026-10-23-latest`.

## Safety
- Original static application remains untouched at repository root.
- Original production domain must not be switched until parity testing is complete.
- Do not claim content parity yet: inner-page content and interactive features still need to be ported from the static app.

## Local development
```bash
cd v2-react
npm install
npm run dev
npm run build
```

## Vercel
Use a **separate preview project** with Root Directory `v2-react`, Framework Preset Vite, Build Command `npm run build`, Output Directory `dist`. Do not redirect app.safamarwah.my to this unfinished version.

## Migration checklist
- [x] Separate React workspace, TypeScript, Vite, routing, design tokens, shared header/footer and inner-page shell.
- [ ] Transfer complete original page content and assets, verify imagery.
- [ ] Transfer prayer-time logic, audio, offline/PWA, search, digital card, navigation and other interactive tools.
- [ ] Match Panduan master design pixel-by-pixel across breakpoints.
- [ ] Run automated build and QA, then publish preview.
