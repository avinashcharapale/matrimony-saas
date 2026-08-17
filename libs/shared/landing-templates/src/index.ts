export type {
  LandingTemplate,
  TemplateCategory,
  TemplateHeroVariant,
  TemplateMotif,
  TemplateButtonStyle,
  TemplateSectionKey,
  TemplateCardStyle,
  TemplateColors,
  TemplateOverrides,
} from './lib/landing-template.model';
export {
  APPROVED_TEMPLATES,
  APPROVED_TEMPLATE_IDS,
  findTemplate,
} from './lib/approved-templates';
export type { TemplateStyleVars } from './lib/template-theme';
export {
  resolveTemplateStyleVars,
  templateFontCss,
  shade,
} from './lib/template-theme';
