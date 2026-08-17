# landing-templates

Approved landing-page design templates for tenants (the super-admin picker catalog).

- `src/lib/landing-template.model.ts` — template types
- `src/lib/approved-templates.ts` — the 49 approved templates (AUTO-GENERATED)
- `src/lib/template-theme.ts` — CSS variable resolution (template defaults overridable by DB branding)
- `src/themes/theme-templates.css` — the shared template renderer stylesheet

## Regenerating template data

`approved-templates.ts` is generated from `.superdesign/design_iterations/approved-templates.json`
(the gallery Export output). Re-run the generation step after approving new templates.
