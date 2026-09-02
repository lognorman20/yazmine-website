## Learned User Preferences

- Mobile-first CSS: base styles target small screens; desktop layout only inside `@media (min-width: ...)`.
- Follow anti-ai-slop for all UI on this site: no purple gradients, SaaS templates, decorative shadows, emoji chrome, or vague CTAs like "Learn more".
- Use CSS modules with locked tokens in `src/styles/tokens.css`; do not add Tailwind.
- Body and secondary fonts must complement Instrument Serif; avoid Inter, Roboto, and generic system-ui as the site's personality.
- Social links use SVG icons in the footer, not text labels; no YouTube link on the site.
- Contact holds location and contact info only; hours and policies live in `HoursAndPolicies`; social links stay in the footer.
- Keep section vertical padding tight; user corrected excessive spacing above and below section content.
- Orchestrator owns design and planning; delegate implementation to composer-2.5 subagents.
- Link labels should name the destination (e.g. "Read the Canvas Rebel interview"), not generic "Learn more".
- Respond in caveman mode unless the user says "stop caveman" or "normal mode".

## Learned Workspace Facts

- Vite + React + TypeScript SPA for LusciousbyYazmine (hairstylist Yazmine Taylor; Brooklyn natural hair, locs, braiding).
- Design tokens in `src/styles/tokens.css`: cream `#F7F3ED`, terracotta accent `#B86F3D`, Instrument Serif display, Satoshi body.
- Media assets live under `public/media/`; hero loops all videos back-to-back; About portrait is `yazmine_headshot`; gallery mixes photos and videos.
- Canvas Rebel interview (`https://canvasrebel.com/meet-yazmine-taylor/`) is the canonical source for About copy.
- Official business flyer is source of truth for hours, deposit/payment/lateness/rescheduling policies, and public contact details.
- Section order in `App.tsx`: Hero, About, Services, Gallery, Products, HoursAndPolicies, Contact, Footer (with Nav).
- Social handles: Instagram, TikTok, and Facebook are @lusciousbyyazmine.
- Booking/scheduling URL: `https://lusciousbyyazmine.as.me/`.
