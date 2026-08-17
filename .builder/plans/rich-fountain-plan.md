# Matrimony Landing Page Plan

## Recommendation
Refresh the existing Angular root landing page (`/`) into an original, heritage-elegant matrimony homepage inspired by the supplied reference. Preserve the current tenant-driven copy, live profile/stat APIs, localization, and existing route actions; update only the presentation, section order, and tenant-specific color treatment. The uploaded image remains a visual reference only and will not be used as a page asset.

## Confirmed experience
- **Layout:** a content-rich public homepage: navigation and contact header, couple-led hero, four credibility metrics, benefits plus matching journey, trust cards, recently added profiles, and enquiry/support footer.
- **Theme:** ivory foundation with deep maroon, saffron, and muted-gold accents; refined serif headings with clean supporting sans-serif type; restrained ornamental wave/pattern details made in CSS.
- **Motion:** reduced, purposeful interactions only—entry reveals, small card lifts, button feedback, menu slide/fade—and a `prefers-reduced-motion` fallback.
- **Review gate:** present the composition as a visual preview before implementation; implementation remains paused until the user approves the preview.

## Implementation approach
1. **Restyle the shared public shell** in `apps/web-angular/src/app/layout/layout.html` and `apps/web-angular/src/app/layout/layout.css`.
   - Retain the tenant logo, public routes, language selector, contact information, and authentication links.
   - Recompose the desktop header into the reference-inspired brand/contact/navigation/CTA hierarchy and tune the existing mobile drawer to match it responsively.
   - Do not introduce a nonfunctional “success stories” destination; retain real routes already supported by the application.

2. **Reshape the existing landing component composition** in `apps/web-angular/src/app/pages/landing/components/landing-sections.component.html`.
   - Keep the supplied, reusable sections and live input bindings.
   - Order them as hero → credibility metrics → benefits and four-step journey → trust proof → recently added profiles → final CTA/support footer, matching the approved information hierarchy.

3. **Rebuild the landing-page visual system** in `apps/web-angular/src/app/pages/landing/landing.css` and targeted section templates under `apps/web-angular/src/app/pages/landing/components/`.
   - Create the panoramic hero, warm overlay, stacked proof strip, benefit/checklist layout, numbered journey, premium trust tiles, and profile-card treatment.
   - Replace the current blue/purple stat variants with maroon/saffron/gold tonal variants; update stat classes generated in `apps/web-angular/src/app/pages/landing/landing.ts` accordingly.
   - Use CSS-created curved ribbons/floral-inspired accents rather than copying the reference artwork or introducing unapproved image URLs.
   - Keep hero image and recent profile image rendering data-driven through `TenantService` and `ProfileClient`; preserve loading behavior, alternate text, and the search/register links.
   - Add hover, focus-visible, loading/reveal, and reduced-motion styles without changing API behavior.

4. **Apply the heritage palette only to Anand Maratha** in `libs/shared/tenant-config/src/lib/tenant-config.ts`.
   - Add an `anand-maratha` custom theme override for maroon, saffron, ivory, and warm-neutral values while leaving Demo and Petwatch branding unchanged.
   - Retain the existing tenant hero copy, contact details, landing cards, footer links, and supplied hero image.

5. **Load the approved page typography** from `apps/web-angular/src/index.html` and scope it through the landing and layout CSS.
   - Use a Google-hosted editorial serif such as Playfair Display for display headings and DM Sans for body/interface content, without replacing application behavior or the wider component API.

## Files expected to change
- `apps/web-angular/src/index.html`
- `apps/web-angular/src/app/layout/layout.html`
- `apps/web-angular/src/app/layout/layout.css`
- `apps/web-angular/src/app/pages/landing/landing.ts`
- `apps/web-angular/src/app/pages/landing/landing.css`
- `apps/web-angular/src/app/pages/landing/components/landing-sections.component.html`
- `apps/web-angular/src/app/pages/landing/components/landing-hero.component.html`
- `apps/web-angular/src/app/pages/landing/components/landing-stats.component.html` (only if markup needs semantic/icon alignment)
- `apps/web-angular/src/app/pages/landing/components/landing-info.component.html`
- `apps/web-angular/src/app/pages/landing/components/landing-recent-profiles.component.html`
- `apps/web-angular/src/app/pages/landing/components/landing-trust.component.html`
- `apps/web-angular/src/app/pages/landing/components/landing-cta-footer.component.html`
- `libs/shared/tenant-config/src/lib/tenant-config.ts`

## Validation
- Run `npx nx lint web-angular` and `npx nx build web-angular`.
- Start the existing `web-angular` development target and inspect `/` for desktop and mobile widths.
- Verify the register, login, search, plans, rules, and contact routes still link correctly; profile cards still consume live/empty data safely; the mobile navigation opens and closes; keyboard focus remains visible; and reduced-motion settings suppress nonessential animations.
