# LusciousbyYazmine

Marketing site for [LusciousbyYazmine](https://lusciousbyyazmine.vercel.app) — Brooklyn hairstylist Yazmine Taylor (natural hair, locs, braiding).

## Links

| | |
|---|---|
| **Live site** | [lusciousbyyazmine.vercel.app](https://lusciousbyyazmine.vercel.app) |
| **GitHub** | [lognorman20/yazmine-website](https://github.com/lognorman20/yazmine-website) |
| **Booking** | [lusciousbyyazmine.as.me](https://lusciousbyyazmine.as.me/) |
| **About source** | [Canvas Rebel interview](https://canvasrebel.com/meet-yazmine-taylor/) |

**Social:** [@lusciousbyyazmine](https://www.instagram.com/lusciousbyyazmine) on Instagram, TikTok, and Facebook (no YouTube).

## Stack

- Vite 8, React 19, TypeScript
- CSS Modules (no Tailwind)
- Design tokens in [`src/styles/tokens.css`](src/styles/tokens.css): cream `#F7F3ED`, terracotta `#B86F3D`, Instrument Serif (display) + Satoshi (body)
- Lint: Oxlint (`npm run lint`)

## Site structure

Single-page layout. Section order in [`src/App.tsx`](src/App.tsx):

1. Hero
2. About
3. Services
4. Gallery
5. Products
6. HoursAndPolicies
7. Contact
8. Footer

`Nav` is fixed above the main content.

Media assets live under `public/media/`.

## Local development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deployment

Hosted on [Vercel](https://vercel.com) — team/project `munyon-canyon/lusciousbyyazmine`.
