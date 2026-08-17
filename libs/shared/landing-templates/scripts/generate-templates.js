#!/usr/bin/env node
/**
 * Generate all 49 landing template HTML files
 * Reads CSS engine from theme-templates.css and palette data from generated-palettes.json
 * Produces self-contained HTML files in designs/
 */

const fs = require('fs');
const path = require('path');

const CSS_PATH = path.join(__dirname, '..', 'src', 'themes', 'theme-templates.css');
const PALETTES_PATH = path.join(__dirname, '..', 'generated-palettes.json');
const DESIGNS_DIR = path.join(__dirname, '..', 'designs');

const css = fs.readFileSync(CSS_PATH, 'utf8');
const palettes = JSON.parse(fs.readFileSync(PALETTES_PATH, 'utf8'));

// Ensure designs directory exists
if (!fs.existsSync(DESIGNS_DIR)) fs.mkdirSync(DESIGNS_DIR, { recursive: true });

// SVG icon helper
function icon(name) {
  const icons = {
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    smartphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    apple: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    checkCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
    messageCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
  };
  return icons[name] || icons.shield;
}

function stars(count = 5) {
  return Array(count).fill(icon('star')).join('');
}

// Content library for each template
const contentLibrary = {
  'paithani-royal': { eyebrow: 'Paithani Royal', h1: 'Find Your Perfect <i>Paithani</i> Match', sub: 'Connect with distinguished Marathi families. 2 lakh+ verified profiles from royal Paithani traditions.', cta1: 'Start Matching', cta2: 'Browse Profiles' },
  'marigold-traditional': { eyebrow: 'Marigold Traditional', h1: 'Sacred Bonds Begin with <i>Marigold</i>', sub: 'Where tradition meets destiny. Join 5 lakh+ Marathi families who found their perfect match.', cta1: 'Begin Your Journey', cta2: 'View Success Stories' },
  'mangalsutra-gold': { eyebrow: 'Mangalsutra Gold', h1: 'Tie the <i>Mangalsutra</i> of Love', sub: 'Premium matrimony for Maharashtrian families. Verified profiles, guaranteed matches.', cta1: 'Find Your Match', cta2: 'How It Works' },
  'kundali-divine': { eyebrow: 'Kundali Divine', h1: 'Divine <i>Kundali</i> Matching', sub: 'Vedic astrology meets modern matchmaking. 200+ caste communities united.', cta1: 'Match Kundali', cta2: 'Learn More' },
  'saptapadi-sacred': { eyebrow: 'Saptapadi Sacred', h1: 'Seven Steps to <i>Eternal</i> Love', sub: 'Walk the sacred path of Saptapadi with your perfect life partner.', cta1: 'Take the First Step', cta2: 'Success Stories' },
  'haldi-blessed': { eyebrow: 'Haldi Blessed', h1: 'Blessed with <i>Haldi</i> & Happiness', sub: 'Let the golden glow of Haldi lead you to your soulmate.', cta1: 'Start Today', cta2: 'See Profiles' },
  'mehendi-green': { eyebrow: 'Mehendi Green', h1: 'Your Love Story Starts with <i>Mehendi</i>', sub: 'The intricate patterns of destiny unfold here. Find your perfect match.', cta1: 'Begin Now', cta2: 'View Gallery' },
  'sagai-rosegold': { eyebrow: 'Sagai Rosegold', h1: 'Rose Gold <i>Engagement</i> Awaits', sub: 'Where rosegold dreams meet reality. Premium Marathi matrimony.', cta1: 'Find Love', cta2: 'Explore' },
  'lavani-vibrant': { eyebrow: 'Lavani Vibrant', h1: 'Dance into <i>Love</i> with Lavani', sub: 'Vibrant energy meets traditional values. Maharashtra most loved matrimony.', cta1: 'Join Now', cta2: 'Watch Stories' },
  'paithani-silk': { eyebrow: 'Paithani Silk', h1: 'Silk-Smooth <i>Connections</i>', sub: 'Luxurious matchmaking wrapped in Paithani elegance.', cta1: 'Start Matching', cta2: 'Learn More' },
  'kolhapuri-earth': { eyebrow: 'Kolhapuri Earth', h1: 'Grounded in <i>Kolhapuri</i> Tradition', sub: 'Strong roots, lasting bonds. Kolhapur most trusted matrimony.', cta1: 'Find Your Match', cta2: 'See Profiles' },
  'nashik-grapes': { eyebrow: 'Nashik Grapes', h1: 'Sweet as <i>Nashik</i> Grapes', sub: 'Nashik finest families await. Fresh matches daily.', cta1: 'Start Today', cta2: 'How It Works' },
  'konkan-coastal': { eyebrow: 'Konkan Coastal', h1: 'Coastal <i>Romance</i> of Konkan', sub: 'Where the Arabian Sea meets true love. Konkan community matrimony.', cta1: 'Dive In', cta2: 'Explore' },
  'vidarbha-orange': { eyebrow: 'Vidarbha Orange', h1: 'Bright as <i>Vidarbha</i> Sun', sub: 'Vidarbha most vibrant matrimony platform. Bold matches, lasting bonds.', cta1: 'Join Now', cta2: 'View Stories' },
  'pune-peshwai': { eyebrow: 'Pune Peshwai', h1: 'Pune <i>Peshwai</i> Legacy', sub: 'Carry forward the proud Peshwa tradition. Premium Pune matrimony.', cta1: 'Begin Journey', cta2: 'See Success' },
  'warkari-saffron': { eyebrow: 'Warkari Saffron', h1: 'Saffron <i>Devotion</i>, True Love', sub: 'Warkari values, modern connections. Devotional matchmaking.', cta1: 'Find Love', cta2: 'Learn More' },
  'rajwada-palace': { eyebrow: 'Rajwada Palace', h1: 'Royal <i>Rajwada</i> Matches', sub: 'Maharashtra royal families trusted platform. Regal matchmaking.', cta1: 'Enter the Palace', cta2: 'View Royal Profiles' },
  'shaniwar-wada': { eyebrow: 'Shaniwar Wada', h1: 'Shaniwar <i>Wada</i> Heritage', sub: 'Pune historic Shaniwar Wada inspired matrimony. Legacy meets love.', cta1: 'Start Now', cta2: 'Success Stories' },
  'fort-terracotta': { eyebrow: 'Fort Terracotta', h1: 'Terracotta <i>Strength</i>, Lasting Love', sub: 'Built on the strength of Maratha forts. Enduring relationships.', cta1: 'Build Together', cta2: 'See Profiles' },
  'maharaja-court': { eyebrow: 'Maharaja Court', h1: 'Maharaja <i>Court</i> Matrimony', sub: 'Where Maharajas choose their queens. Premium royal matchmaking.', cta1: 'Join the Court', cta2: 'Explore' },
  'gadget-blue': { eyebrow: 'Gadget Blue', h1: 'Tech-Smart <i>Matching</i>', sub: 'AI-powered matrimony for modern Maharashtrians. Smart matches, faster.', cta1: 'Try AI Match', cta2: 'See How' },
  'pearl-ivory': { eyebrow: 'Pearl Ivory', h1: 'Pearl <i>Elegance</i> of Love', sub: 'Ivory-smooth matchmaking. Refined, elegant, timeless.', cta1: 'Find Elegance', cta2: 'View Profiles' },
  'velvet-wine': { eyebrow: 'Velvet Wine', h1: 'Velvet <i>Wine</i> Romance', sub: 'Rich, deep connections like fine wine. Premium matrimony.', cta1: 'Savor Love', cta2: 'Learn More' },
  'zari-embroidered': { eyebrow: 'Zari Embroidered', h1: 'Zari <i>Embroidered</i> Destiny', sub: 'Every thread tells a story. Intricate matchmaking, beautiful results.', cta1: 'Start Weaving', cta2: 'See Gallery' },
  'diwali-sparkle': { eyebrow: 'Diwali Sparkle', h1: 'Diwali <i>Sparkle</i> of Love', sub: 'Light up your life with love this Diwali. Special festive offers.', cta1: 'Sparkle Now', cta2: 'Festive Offers' },
  'ganesh-chaturthi': { eyebrow: 'Ganesh Chaturthi', h1: 'Bappa <i>Blessed</i> Matches', sub: 'Ganpati Bappa Morya! Start your journey with Lord Ganesh blessings.', cta1: 'Seek Blessings', cta2: 'View Profiles' },
  'rangoli-festival': { eyebrow: 'Rangoli Festival', h1: 'Colorful <i>Rangoli</i> of Love', sub: 'Every color represents a beautiful story. Paint your love story.', cta1: 'Add Colors', cta2: 'See Stories' },
  'ganpati-green': { eyebrow: 'Ganpati Green', h1: 'Ganpati <i>Green</i> Auspicious', sub: 'Auspicious green beginnings. Maharashtra most trusted festive matrimony.', cta1: 'Start Auspicious', cta2: 'Learn More' },
  'navratri-garba': { eyebrow: 'Navratri Garba', h1: 'Garba <i>Dance</i> into Love', sub: 'Nine nights of devotion, lifetime of love. Navratri special matchmaking.', cta1: 'Join the Dance', cta2: 'Festival Special' },
  'holi-colors': { eyebrow: 'Holi Colors', h1: 'Holi <i>Colors</i> of Romance', sub: 'Splash into love with vibrant colors. Holi special matrimony.', cta1: 'Add Colors', cta2: 'See Matches' },
  'makar-sankranti': { eyebrow: 'Makar Sankranti', h1: 'Sankranti <i>Kite</i> of Love', sub: 'Fly high with love this Makar Sankranti. Special offers await.', cta1: 'Fly Together', cta2: 'View Offers' },
  'gudi-padwa': { eyebrow: 'Gudi Padwa', h1: 'Gudi Padwa <i>New</i> Beginnings', sub: 'New year, new love. Start your journey on Gudi Padwa.', cta1: 'Start Fresh', cta2: 'Learn More' },
  'modern-minimal': { eyebrow: 'Modern Minimal', h1: 'Minimal Design, <i>Maximum</i> Love', sub: 'Clean, elegant matchmaking for modern Maharashtrians.', cta1: 'Start Simple', cta2: 'See How' },
  'blush-rose': { eyebrow: 'Blush Rose', h1: 'Blush <i>Rose</i> Romance', sub: 'Soft, romantic matchmaking. Where blush meets love.', cta1: 'Find Romance', cta2: 'View Profiles' },
  'sage-green': { eyebrow: 'Sage Green', h1: 'Sage <i>Green</i> Serenity', sub: 'Calm, peaceful matchmaking. Find serenity in love.', cta1: 'Find Peace', cta2: 'Learn More' },
  'dusty-blue': { eyebrow: 'Dusty Blue', h1: 'Dusty <i>Blue</i> Dreams', sub: 'Dreamy blue matchmaking for thoughtful souls.', cta1: 'Dream Together', cta2: 'See Stories' },
  'charcoal-elegant': { eyebrow: 'Charcoal Elegant', h1: 'Charcoal <i>Elegance</i> Redefined', sub: 'Sophisticated matchmaking with charcoal grace.', cta1: 'Find Elegance', cta2: 'Explore' },
  'cream-nouveau': { eyebrow: 'Cream Nouveau', h1: 'Cream <i>Nouveau</i> Style', sub: 'Art nouveau inspired matchmaking. Classic meets modern.', cta1: 'Start Now', cta2: 'View Gallery' },
  'monochrome-chic': { eyebrow: 'Monochrome Chic', h1: 'Monochrome <i>Chic</i> Matching', sub: 'Black and white simplicity. Pure, elegant matchmaking.', cta1: 'Keep It Pure', cta2: 'See Profiles' },
  'pastel-peach': { eyebrow: 'Pastel Peach', h1: 'Pastel <i>Peach</i> Softness', sub: 'Soft peach tones for gentle hearts. Tender matchmaking.', cta1: 'Find Tenderness', cta2: 'Learn More' },
  'luxury-platinum': { eyebrow: 'Luxury Platinum', h1: 'Platinum <i>Luxury</i> Matrimony', sub: 'Ultra-premium matchmaking for elite families.', cta1: 'Experience Luxury', cta2: 'View Elite Profiles' },
  'ocean-romance': { eyebrow: 'Ocean Romance', h1: 'Ocean <i>Deep</i> Love', sub: 'Deep as the ocean, true as the tide. Premium matrimony.', cta1: 'Dive Deep', cta2: 'Explore' },
  'sunrise-gold': { eyebrow: 'Sunrise Gold', h1: 'Golden <i>Sunrise</i> Beginnings', sub: 'Every sunrise brings new hope. Find your golden match.', cta1: 'Rise Together', cta2: 'See Success' },
  'nri-global': { eyebrow: 'NRI Global', h1: 'NRI <i>Global</i> Connections', sub: 'Connecting NRI Maharashtrians worldwide. Love knows no borders.', cta1: 'Connect Globally', cta2: 'View NRI Profiles' },
  'shaadi-modern': { eyebrow: 'Shaadi Modern', h1: 'Modern <i>Shaadi</i> Redefined', sub: 'BharatMatrimony meets modern design. 50 lakh+ profiles.', cta1: 'Find Your Match', cta2: 'See How It Works' },
  'bharat-trust': { eyebrow: 'Bharat Trust', h1: 'Bharat <i>Trust</i> Matrimony', sub: 'India most trusted matrimony brand. 35 years of successful matches.', cta1: 'Start Now', cta2: 'Success Stories' },
  'anuroop-service': { eyebrow: 'Anuroop Service', h1: 'Anuroop <i>Personal</i> Service', sub: 'Personalized matchmaking with dedicated relationship managers.', cta1: 'Get Personal Help', cta2: 'See Plans' },
  'lagna-profiles': { eyebrow: 'Lagna Profiles', h1: 'Lagna <i>Verified</i> Profiles', sub: '100% verified Marathi profiles. No fakes, only genuine matches.', cta1: 'Browse Verified', cta2: 'How We Verify' },
  'sundarjodi-castes': { eyebrow: 'Sundarjodi Castes', h1: 'Sundarjodi <i>Community</i>', sub: '200+ Marathi communities united. Find your community match.', cta1: 'Find Your Community', cta2: 'View All Castes' },
};

// Motif assignments per template
const motifAssignments = {
  'paithani-royal': 'butti', 'marigold-traditional': 'butti2', 'mangalsutra-gold': 'pearl',
  'kundali-divine': 'mandala', 'saptapadi-sacred': 'vine', 'haldi-blessed': 'coin',
  'mehendi-green': 'mango', 'sagai-rosegold': 'dot', 'lavani-vibrant': 'zari',
  'paithani-silk': 'wave', 'kolhapuri-earth': 'toran', 'nashik-grapes': 'kite',
  'konkan-coastal': 'stripe', 'vidarbha-orange': 'butti', 'pune-peshwai': 'butti2',
  'warkari-saffron': 'floral', 'rajwada-palace': 'butti', 'shaniwar-wada': 'zari',
  'fort-terracotta': 'toran', 'maharaja-court': 'pearl', 'gadget-blue': 'stripe',
  'pearl-ivory': 'dot', 'velvet-wine': 'vine', 'zari-embroidered': 'zari',
  'diwali-sparkle': 'chevron', 'ganesh-chaturthi': 'chain', 'rangoli-festival': 'tessellation',
  'ganpati-green': 'floral', 'navratri-garba': 'plate', 'holi-colors': 'crosshatch',
  'makar-sankranti': 'sariborder', 'gudi-padwa': 'temple', 'modern-minimal': 'stripe',
  'blush-rose': 'dot', 'sage-green': 'vine', 'dusty-blue': 'wave',
  'charcoal-elegant': 'zari', 'cream-nouveau': 'mango', 'monochrome-chic': 'stripe',
  'pastel-peach': 'butti', 'luxury-platinum': 'pearl', 'ocean-romance': 'wave',
  'sunrise-gold': 'coin', 'nri-global': 'butti2', 'shaadi-modern': 'chain',
  'bharat-trust': 'floral', 'anuroop-service': 'mandala', 'lagna-profiles': 'toran',
  'sundarjodi-castes': 'butti'
};

function generateHTML(t) {
  const c = contentLibrary[t.id] || { eyebrow: t.name, h1: t.name, sub: 'Premium matrimony', cta1: 'Find Match', cta2: 'Learn More' };
  const motif = motifAssignments[t.id] || 'butti';
  const [headingFont, bodyFont] = t.fonts;

  const tplStyles = `
    --tp-p:${t.colors.p};--tp-dp:${t.colors.dp};--tp-ink:${t.colors.ink};
    --tp-s:${t.colors.s};--tp-sf:${t.colors.sf};--tp-sd:${t.colors.sd};
    --tp-pl:${t.colors.pl};--tp-od:${t.colors.od};--tp-ods:${t.colors.ods};
    --tp-bg:${t.colors.bg};--tp-bgd:${t.colors.bgd};--tp-card:${t.colors.card};
    --tp-t:${t.colors.t};--tp-ts:${t.colors.ts};
    --tp-d1:${t.colors.d1};--tp-d2:${t.colors.d2};
    --tp-h:'${headingFont}',serif;--tp-b:'${bodyFont}',sans-serif;`;

  // Generate hero HTML based on variant
  const heroHTML = generateHero(t, c, motif);
  
  // Generate sections based on order
  const sections = t.order.map(s => generateSection(s, t, c, motif)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${c.eyebrow} — ${t.category}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&family=Nunito:wght@400;600;700;800&family=Rubik:wght@400;500;600;700&family=Lato:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&family=Cinzel:wght@400;600;700&family=Marcellus&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
<style>
${css}
</style>
</head>
<body>
<div class="tpl-root tpl-wrap" data-tpl="${t.id}" style="${tplStyles}">
${heroHTML}
${sections}
<footer class="tpl-footer darksec">
  <div class="foot-grid">
    <div>
      <div class="foot-brand"><span class="nav-logo" style="background:${t.colors.s};color:${t.colors.p}">${(c.eyebrow||'M')[0]}</span>${c.eyebrow} Matrimony</div>
      <p class="foot-blurb">Connecting hearts across Maharashtra. 50 lakh+ verified profiles, 200+ communities, 35 years of trust.</p>
    </div>
    <div><h4>Find a Match</h4><ul><li><a href="#">Brides</a></li><li><a href="#">Grooms</a></li><li><a href="#">NRI Profiles</a></li><li><a href="#">Horoscope Matching</a></li></ul></div>
    <div><h4>Community</h4><ul><li><a href="#">Success Stories</a></li><li><a href="#">Matrimonial Events</a></li><li><a href="#">Blog</a></li><li><a href="#">Help & Support</a></li></ul></div>
    <div><h4>Contact Us</h4><ul class="foot-contact"><li>${icon('phone')} +91 98765 43210</li><li>${icon('mail')} care@${t.id}.in</li></ul></div>
  </div>
  <div class="foot-bottom"><p>&copy; 2026 ${c.eyebrow} Matrimony. All rights reserved.</p>
    <p><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Refund Policy</a></p></div>
</footer>
</div>
</body>
</html>`;
}

function generateHero(t, c, motif) {
  const isDark = ['frame','royal','fullbleed','parallax'].includes(t.hero);
  const darkClass = isDark ? ' dark' : '';
  
  switch(t.hero) {
    case 'frame':
      return `<section class="hero${darkClass}">
  <div class="hero-frame">
    <div class="hero-orn"><div class="orn-rangoli sm"></div></div>
    <div class="eyebrow${isDark?' on-dark':''}">${c.eyebrow}</div>
    <h1>${c.h1}</h1>
    <p class="hero-sub${isDark?' on-dark-soft':''}">${c.sub}</p>
    <div class="hero-ctas">
      <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
      <a href="#" class="tbtn btn-ghost">${c.cta2}</a>
    </div>
    <div class="hero-trust${isDark?' on-dark-soft':''}">
      <span>${icon('shield')} Verified Profiles</span>
      <span>${icon('check')} 200+ Communities</span>
      <span>${icon('heart')} 50 Lakh+ Matches</span>
    </div>
  </div>
</section>`;

    case 'royal':
      return `<section class="hero${darkClass}">
  <div class="hero-frame">
    <div class="hero-orn"><div class="orn-lotus sm"></div></div>
    <div class="eyebrow${isDark?' on-dark':''}">${c.eyebrow}</div>
    <h1>${c.h1}</h1>
    <p class="hero-sub${isDark?' on-dark-soft':''}">${c.sub}</p>
    <div class="hero-ctas">
      <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
      <a href="#" class="tbtn btn-ghost">${c.cta2}</a>
    </div>
    <div class="hero-trust${isDark?' on-dark-soft':''}">
      <span>${icon('shield')} Verified Profiles</span>
      <span>${icon('check')} 200+ Communities</span>
      <span>${icon('heart')} 50 Lakh+ Matches</span>
    </div>
  </div>
</section>`;

    case 'rangoli':
      return `<section class="hero${darkClass}">
  <div class="hero-orn"><div class="orn-rangoli"></div></div>
  <div class="eyebrow${isDark?' on-dark':''}">${c.eyebrow}</div>
  <h1>${c.h1}</h1>
  <p class="hero-sub${isDark?' on-dark-soft':''}">${c.sub}</p>
  <div class="hero-ctas">
    <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
    <a href="#" class="tbtn btn-ghost">${c.cta2}</a>
  </div>
  <div class="hero-trust${isDark?' on-dark-soft':''}">
    <span>${icon('shield')} Verified Profiles</span>
    <span>${icon('check')} 200+ Communities</span>
    <span>${icon('heart')} 50 Lakh+ Matches</span>
  </div>
</section>`;

    case 'mandala':
      return `<section class="hero${darkClass}">
  <div class="hero-orn"><div class="orn-mandala"></div></div>
  <div class="eyebrow${isDark?' on-dark':''}">${c.eyebrow}</div>
  <h1>${c.h1}</h1>
  <p class="hero-sub${isDark?' on-dark-soft':''}">${c.sub}</p>
  <div class="hero-ctas">
    <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
    <a href="#" class="tbtn btn-ghost">${c.cta2}</a>
  </div>
  <div class="hero-trust${isDark?' on-dark-soft':''}">
    <span>${icon('shield')} Verified Profiles</span>
    <span>${icon('check')} 200+ Communities</span>
    <span>${icon('heart')} 50 Lakh+ Matches</span>
  </div>
</section>`;

    case 'arch':
      return `<section class="hero${darkClass}">
  <img class="hero-arch-img" src="https://placehold.co/210x250/${t.colors.p.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Hero" />
  <div class="eyebrow${isDark?' on-dark':''}">${c.eyebrow}</div>
  <h1>${c.h1}</h1>
  <p class="hero-sub${isDark?' on-dark-soft':''}">${c.sub}</p>
  <div class="hero-ctas">
    <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
    <a href="#" class="tbtn btn-ghost">${c.cta2}</a>
  </div>
  <div class="hero-trust${isDark?' on-dark-soft':''}">
    <span>${icon('shield')} Verified Profiles</span>
    <span>${icon('check')} 200+ Communities</span>
    <span>${icon('heart')} 50 Lakh+ Matches</span>
  </div>
</section>`;

    case 'collage':
      return `<section class="hero${darkClass}">
  <div class="hero-grid rounds">
    <img src="https://placehold.co/300x200/${t.colors.p.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/300x200/${t.colors.s.replace('#','')}/${t.colors.p.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/300x200/${t.colors.d1.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/300x200/${t.colors.dp.replace('#','')}/${t.colors.s.replace('#','')}" alt="Profile" />
  </div>
  <div class="eyebrow${isDark?' on-dark':''}">${c.eyebrow}</div>
  <h1>${c.h1}</h1>
  <p class="hero-sub${isDark?' on-dark-soft':''}">${c.sub}</p>
  <div class="hero-ctas">
    <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
    <a href="#" class="tbtn btn-ghost">${c.cta2}</a>
  </div>
  <div class="hero-trust${isDark?' on-dark-soft':''}">
    <span>${icon('shield')} Verified Profiles</span>
    <span>${icon('check')} 200+ Communities</span>
    <span>${icon('heart')} 50 Lakh+ Matches</span>
  </div>
</section>`;

    case 'split':
      return `<section class="hero-split">
  <div>
    <div class="eyebrow">${c.eyebrow}</div>
    <h1>${c.h1}</h1>
    <p class="hero-sub">${c.sub}</p>
    <div class="hero-ctas">
      <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
      <a href="#" class="tbtn btn-outline">${c.cta2}</a>
    </div>
    <div class="hero-trust">
      <span>${icon('shield')} Verified Profiles</span>
      <span>${icon('check')} 200+ Communities</span>
    </div>
  </div>
  <div class="hero-stack">
    <img src="https://placehold.co/400x430/${t.colors.p.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/400x200/${t.colors.s.replace('#','')}/${t.colors.p.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/400x200/${t.colors.d1.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" />
  </div>
</section>`;

    case 'fullbleed':
      return `<section class="hero hero-fullbleed" style="background-image:url('https://placehold.co/1400x600/${t.colors.d2.replace('#','')}/${t.colors.p.replace('#','')}')">
  <div class="eyebrow on-dark">${c.eyebrow}</div>
  <h1>${c.h1}</h1>
  <p class="hero-sub on-dark-soft">${c.sub}</p>
  <div class="hero-ctas">
    <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
    <a href="#" class="tbtn btn-ghost">${c.cta2}</a>
  </div>
  <div class="hero-trust on-dark-soft">
    <span>${icon('shield')} Verified Profiles</span>
    <span>${icon('check')} 200+ Communities</span>
    <span>${icon('heart')} 50 Lakh+ Matches</span>
  </div>
</section>`;

    case 'minimal':
      return `<section class="hero">
  <div class="eyebrow">${c.eyebrow}</div>
  <h1>${c.h1}</h1>
  <p class="hero-sub">${c.sub}</p>
  <div class="hero-ctas">
    <a href="#" class="tbtn btn-solid">${c.cta1}</a>
    <a href="#" class="tbtn btn-outline">${c.cta2}</a>
  </div>
  <div class="hero-trust">
    <span>${icon('shield')} Verified Profiles</span>
    <span>${icon('check')} 200+ Communities</span>
    <span>${icon('heart')} 50 Lakh+ Matches</span>
  </div>
</section>`;

    case 'form':
      return `<section class="hero-form">
  <div>
    <div class="eyebrow">${c.eyebrow}</div>
    <h1>${c.h1}</h1>
    <p class="hero-sub">${c.sub}</p>
    <div class="hero-ctas">
      <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
    </div>
    <div class="hero-trust">
      <span>${icon('shield')} Verified Profiles</span>
      <span>${icon('check')} 200+ Communities</span>
    </div>
  </div>
  <div class="searchpanel">
    <h4>Find Your Match</h4>
    <p class="sp-sub">Start your journey today</p>
    <div class="sp-field"><label>I'm looking for</label><div class="pill-group"><span class="pill active">Bride</span><span class="pill">Groom</span></div></div>
    <div class="sp-field"><label>Age</label><div style="display:flex;gap:8px"><input class="sp-select" placeholder="21" style="padding:9px 12px;border-radius:10px;border:1.5px solid var(--tp-pl);background:var(--tp-bg);color:var(--tp-t);width:50%;font-size:13px" /><input class="sp-select" placeholder="30" style="padding:9px 12px;border-radius:10px;border:1.5px solid var(--tp-pl);background:var(--tp-bg);color:var(--tp-t);width:50%;font-size:13px" /></div></div>
    <div class="sp-field"><label>Community</label><select class="sp-select"><option>All Communities</option><option>Brahmin</option><option>Kshatriya</option><option>Vaishya</option><option>Shudra</option></select></div>
    <a href="#" class="tbtn btn-gradient formbtn">${icon('search')} Search Now</a>
    <div class="mini-stat"><div><b>50L+</b><span>Profiles</span></div><div><b>200+</b><span>Communities</span></div><div><b>1L+</b><span>Matches</span></div></div>
  </div>
</section>`;

    case 'parallax':
      return `<section class="hero hero-parallax" style="background-image:url('https://placehold.co/1400x600/${t.colors.d2.replace('#','')}/${t.colors.p.replace('#','')}')">
  <div class="eyebrow on-dark">${c.eyebrow}</div>
  <h1>${c.h1}</h1>
  <p class="hero-sub on-dark-soft">${c.sub}</p>
  <div class="hero-ctas">
    <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
    <a href="#" class="tbtn btn-ghost">${c.cta2}</a>
  </div>
  <div class="hero-trust on-dark-soft">
    <span>${icon('shield')} Verified Profiles</span>
    <span>${icon('check')} 200+ Communities</span>
    <span>${icon('heart')} 50 Lakh+ Matches</span>
  </div>
</section>`;

    case 'gradient-anim':
      return `<section class="hero hero-gradient-anim">
  <div class="eyebrow on-dark">${c.eyebrow}</div>
  <h1>${c.h1}</h1>
  <p class="hero-sub on-dark-soft">${c.sub}</p>
  <div class="hero-ctas">
    <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
    <a href="#" class="tbtn btn-ghost">${c.cta2}</a>
  </div>
  <div class="hero-trust on-dark-soft">
    <span>${icon('shield')} Verified Profiles</span>
    <span>${icon('check')} 200+ Communities</span>
    <span>${icon('heart')} 50 Lakh+ Matches</span>
  </div>
</section>`;

    case 'masonry':
      return `<section class="hero">
  <div class="eyebrow">${c.eyebrow}</div>
  <h1>${c.h1}</h1>
  <p class="hero-sub">${c.sub}</p>
  <div class="hero-masonry">
    <img src="https://placehold.co/400x260/${t.colors.p.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/400x130/${t.colors.s.replace('#','')}/${t.colors.p.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/400x130/${t.colors.d1.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/400x130/${t.colors.dp.replace('#','')}/${t.colors.s.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/400x260/${t.colors.d2.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/400x130/${t.colors.p.replace('#','')}/${t.colors.s.replace('#','')}" alt="Profile" />
  </div>
  <div class="hero-ctas">
    <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
    <a href="#" class="tbtn btn-outline">${c.cta2}</a>
  </div>
</section>`;

    case 'circular':
      return `<section class="hero">
  <div class="eyebrow">${c.eyebrow}</div>
  <h1>${c.h1}</h1>
  <p class="hero-sub">${c.sub}</p>
  <div class="hero-circular">
    <img src="https://placehold.co/140x140/${t.colors.p.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/140x140/${t.colors.s.replace('#','')}/${t.colors.p.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/140x140/${t.colors.d1.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/140x140/${t.colors.dp.replace('#','')}/${t.colors.s.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/140x140/${t.colors.d2.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" />
  </div>
  <div class="hero-ctas">
    <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
    <a href="#" class="tbtn btn-outline">${c.cta2}</a>
  </div>
</section>`;

    case 'hscroll':
      return `<section class="hero">
  <div class="eyebrow">${c.eyebrow}</div>
  <h1>${c.h1}</h1>
  <p class="hero-sub">${c.sub}</p>
  <div class="hero-hscroll">
    <img src="https://placehold.co/220x160/${t.colors.p.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/220x160/${t.colors.s.replace('#','')}/${t.colors.p.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/220x160/${t.colors.d1.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/220x160/${t.colors.dp.replace('#','')}/${t.colors.s.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/220x160/${t.colors.d2.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" />
    <img src="https://placehold.co/220x160/${t.colors.p.replace('#','')}/${t.colors.s.replace('#','')}" alt="Profile" />
  </div>
  <div class="hero-ctas">
    <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
    <a href="#" class="tbtn btn-outline">${c.cta2}</a>
  </div>
</section>`;

    case 'asymmetric':
      return `<section class="hero-asymmetric">
  <div>
    <div class="eyebrow">${c.eyebrow}</div>
    <h1>${c.h1}</h1>
    <p class="hero-sub">${c.sub}</p>
    <div class="hero-ctas">
      <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
      <a href="#" class="tbtn btn-outline">${c.cta2}</a>
    </div>
    <div class="hero-trust">
      <span>${icon('shield')} Verified Profiles</span>
      <span>${icon('check')} 200+ Communities</span>
    </div>
  </div>
  <img src="https://placehold.co/400x380/${t.colors.p.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" />
</section>`;

    case 'floating':
      return `<section class="hero floating-el-container">
  <div class="float-el"></div><div class="float-el"></div><div class="float-el"></div><div class="float-el"></div>
  <div class="eyebrow">${c.eyebrow}</div>
  <h1>${c.h1}</h1>
  <p class="hero-sub">${c.sub}</p>
  <div class="hero-ctas">
    <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
    <a href="#" class="tbtn btn-outline">${c.cta2}</a>
  </div>
  <div class="hero-trust">
    <span>${icon('shield')} Verified Profiles</span>
    <span>${icon('check')} 200+ Communities</span>
    <span>${icon('heart')} 50 Lakh+ Matches</span>
  </div>
</section>`;

    default:
      return `<section class="hero">
  <div class="eyebrow">${c.eyebrow}</div>
  <h1>${c.h1}</h1>
  <p class="hero-sub">${c.sub}</p>
  <div class="hero-ctas">
    <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
    <a href="#" class="tbtn btn-outline">${c.cta2}</a>
  </div>
</section>`;
  }
}

function generateSection(name, t, c, motif) {
  const sectionMotif = `<div class="divider m-${motif}"></div>`;
  
  switch(name) {
    case 'banner':
      return `<section class="tsec"><div class="tsec-inner">
  <div class="banner darksec" style="position:relative;overflow:hidden;border-radius:var(--tp-r-lg)">
    <div class="banner-inner">
      <div class="eyebrow on-dark">${c.eyebrow}</div>
      <h2>Find Your Perfect Match Today</h2>
      <p>Join 50 lakh+ Marathi families who found their soulmate. Premium matrimony with verified profiles.</p>
      <div class="banner-ctas">
        <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
        <a href="#" class="tbtn btn-ghost">${c.cta2}</a>
      </div>
      <div class="banner-chips">
        <span>${icon('shield')} 100% Verified</span>
        <span>${icon('check')} AI Matching</span>
        <span>${icon('phone')} 24/7 Support</span>
      </div>
    </div>
  </div>
</div></section>`;

    case 'stats':
      return `<section class="tsec tpy-16"><div class="tsec-inner">
  <div class="stats-float">
    <div class="stats-card stats-dividers">
      <div class="stat-cell"><div class="stat-val">50L+</div><div class="stat-lab">Active Profiles</div></div>
      <div class="stat-cell"><div class="stat-val">200+</div><div class="stat-lab">Communities</div></div>
      <div class="stat-cell"><div class="stat-val">1L+</div><div class="stat-lab">Successful Matches</div></div>
      <div class="stat-cell"><div class="stat-val">35</div><div class="stat-lab">Years of Trust</div></div>
    </div>
  </div>
</div></section>`;

    case 'features':
      return `<section class="tsec tpy-24"><div class="tsec-inner ttext-center">
  ${sectionMotif}
  <div class="eyebrow">Why Choose Us</div>
  <h2 class="sectitle" style="margin-top:14px">Matrimony Redesigned</h2>
  <div class="feat-grid">
    <div class="feat-card bordered-top">
      <div class="icon-tile circle">${icon('search')}</div>
      <h3>AI-Powered Matching</h3>
      <p>Our advanced algorithm analyzes 100+ data points to find your perfect match. Smart, fast, accurate.</p>
    </div>
    <div class="feat-card bordered-top">
      <div class="icon-tile circle">${icon('shield')}</div>
      <h3>100% Verified Profiles</h3>
      <p>Every profile is manually verified. No fake accounts, no catfish. Only genuine, serious matrimony seekers.</p>
    </div>
    <div class="feat-card bordered-top">
      <div class="icon-tile circle">${icon('messageCircle')}</div>
      <h3>Secure Communication</h3>
      <p>End-to-end encrypted chat. Connect safely with your potential life partner. Privacy guaranteed.</p>
    </div>
  </div>
</div></section>`;

    case 'how':
      return `<section class="tsec tpy-24 darksec"><div class="tsec-inner ttext-center">
  <div class="eyebrow on-dark">How It Works</div>
  <h2 class="sectitle on-dark" style="margin-top:14px">3 Simple Steps</h2>
  <div class="steps">
    <div>
      <div class="step-num glass">1</div>
      <h3 class="on-dark">Create Profile</h3>
      <p class="on-dark-soft">Sign up and create your detailed profile. Add photos, preferences, and family details.</p>
    </div>
    <div>
      <div class="step-num glass">2</div>
      <h3 class="on-dark">Get Matches</h3>
      <p class="on-dark-soft">Our AI sends you curated matches daily. Review profiles and express interest.</p>
    </div>
    <div>
      <div class="step-num glass">3</div>
      <h3 class="on-dark">Connect & Meet</h3>
      <p class="on-dark-soft">Chat securely, meet in person, and find your perfect life partner.</p>
    </div>
  </div>
</div></section>`;

    case 'profiles':
      return `<section class="tsec tpy-24"><div class="tsec-inner">
  <div class="prof-head">
    <div><div class="eyebrow">Featured Profiles</div><h2 class="sectitle" style="margin-top:14px">Recently Joined</h2></div>
    <a href="#" class="viewall">View All ${icon('arrowRight')}</a>
  </div>
  <div class="prof-grid">
    <div class="prof-card"><div class="prof-img-wrap"><img src="https://placehold.co/300x190/${t.colors.p.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" /><span class="prof-badge">${icon('check')} Verified</span></div><div class="prof-body"><div class="prof-name">Priya M.</div><div class="prof-sub">28 yrs &middot; Pune &middot; Brahmin</div></div></div>
    <div class="prof-card"><div class="prof-img-wrap"><img src="https://placehold.co/300x190/${t.colors.s.replace('#','')}/${t.colors.p.replace('#','')}" alt="Profile" /><span class="prof-badge">${icon('check')} Verified</span></div><div class="prof-body"><div class="prof-name">Rahul S.</div><div class="prof-sub">30 yrs &middot; Mumbai &middot; Kshatriya</div></div></div>
    <div class="prof-card"><div class="prof-img-wrap"><img src="https://placehold.co/300x190/${t.colors.d1.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Profile" /><span class="prof-badge">${icon('check')} Verified</span></div><div class="prof-body"><div class="prof-name">Anjali D.</div><div class="prof-sub">26 yrs &middot; Nagpur &middot; Vaishya</div></div></div>
    <div class="prof-card"><div class="prof-img-wrap"><img src="https://placehold.co/300x190/${t.colors.dp.replace('#','')}/${t.colors.s.replace('#','')}" alt="Profile" /><span class="prof-badge">${icon('check')} Verified</span></div><div class="prof-body"><div class="prof-name">Vikram P.</div><div class="prof-sub">32 yrs &middot; Kolhapur &middot; Maratha</div></div></div>
  </div>
</div></section>`;

    case 'success':
      return `<section class="tsec tpy-24 altsection"><div class="tsec-inner ttext-center">
  <div class="eyebrow">Success Stories</div>
  <h2 class="sectitle" style="margin-top:14px">Love Stories That Inspire</h2>
  <div class="story-grid">
    <div class="story-card">
      <img src="https://placehold.co/400x220/${t.colors.p.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Couple" />
      <div class="story-body">
        <div class="story-stars">${stars()}</div>
        <h3>Priya & Rahul</h3>
        <div class="story-meta">Married Dec 2025 &middot; Pune</div>
        <p class="story-quote">"We found each other on this platform and knew from the first conversation. Thank you for bringing us together!"</p>
      </div>
    </div>
    <div class="story-card">
      <img src="https://placehold.co/400x220/${t.colors.s.replace('#','')}/${t.colors.p.replace('#','')}" alt="Couple" />
      <div class="story-body">
        <div class="story-stars">${stars()}</div>
        <h3>Anjali & Vikram</h3>
        <div class="story-meta">Married Jan 2026 &middot; Mumbai</div>
        <p class="story-quote">"The AI matching was spot-on. We shared the same values and dreams. Best decision ever!"</p>
      </div>
    </div>
    <div class="story-card">
      <img src="https://placehold.co/400x220/${t.colors.d1.replace('#','')}/${t.colors.sf.replace('#','')}" alt="Couple" />
      <div class="story-body">
        <div class="story-stars">${stars()}</div>
        <h3>Meera & Arjun</h3>
        <div class="story-meta">Married Feb 2026 &middot; Kolhapur</div>
        <p class="story-quote">"From different cities, same community. This platform made it possible. Forever grateful!"</p>
      </div>
    </div>
  </div>
</div></section>`;

    case 'cta':
      return `<section class="tsec tpy-24"><div class="tsec-inner">
  <div class="cta-panel darksec">
    <div class="eyebrow on-dark">Start Today</div>
    <h2 class="on-dark" style="margin-top:14px">Ready to Find Your Match?</h2>
    <p class="on-dark-soft" style="margin-top:12px">Join 50 lakh+ Marathi singles. Create your free profile today and start receiving matches.</p>
    <div class="cta-ctas">
      <a href="#" class="tbtn btn-gradient">${c.cta1}</a>
      <a href="#" class="tbtn btn-ghost">${icon('phone')} Call Now</a>
    </div>
  </div>
</div></section>`;

    case 'why':
      return `<section class="tsec tpy-24"><div class="tsec-inner ttext-center">
  <div class="eyebrow">Why Choose Us</div>
  <h2 class="sectitle" style="margin-top:14px">Trusted by Millions</h2>
  <div class="why-grid">
    <div class="why-card">${icon('shield')}<h3>Safe & Secure</h3><p>Your data is protected with bank-level encryption. Privacy is our priority.</p></div>
    <div class="why-card">${icon('award')}<h3>Award Winning</h3><p>India's most trusted matrimony platform. 35 years of excellence.</p></div>
    <div class="why-card">${icon('users')}<h3>200+ Communities</h3><p>From Brahmin to Maratha, every Maharashtrian community represented.</p></div>
  </div>
</div></section>`;

    case 'castes':
      return `<section class="tsec tpy-24 altsection"><div class="tsec-inner ttext-center">
  <div class="eyebrow">Communities</div>
  <h2 class="sectitle" style="margin-top:14px">200+ Marathi Castes & Communities</h2>
  <div class="caste-wrap">
    <span class="caste-chip hot">Brahmin</span>
    <span class="caste-chip hot">Maratha</span>
    <span class="caste-chip hot">Kshatriya</span>
    <span class="caste-chip hot">Vaishya</span>
    <span class="caste-chip">Lingayat</span>
    <span class="caste-chip">Kokanstha</span>
    <span class="caste-chip">Chandraseniya Kayastha</span>
    <span class="caste-chip">Saraswat</span>
    <span class="caste-chip">Deshastha</span>
    <span class="caste-chip">Chitpavan</span>
    <span class="caste-kokanstha">Karhade</span>
    <span class="caste-chip">Devrukhe</span>
    <span class="caste-chip">Bhandari</span>
    <span class="caste-chip">Mali</span>
    <span class="caste-chip">Kumbhar</span>
    <span class="caste-chip">Lohar</span>
    <span class="caste-chip">Sutar</span>
    <span class="caste-chip">Teli</span>
    <span class="caste-chip">Koshti</span>
    <span class="caste-chip">Sonar</span>
  </div>
  <p class="muted" style="margin-top:24px;font-size:13px">From Brahmin to Kshatriya and every community in between — find a match who shares your heritage.</p>
</div></section>`;

    case 'melava': {
      const ev = [['08','Aug','Shubh Aarambh (Marathi)','Pune &middot; Vadhu-var meetup'],['22','Aug','Shubh Aarambh (Marathi)','Mumbai &middot; Family introductions'],['30','Aug','Lagna Tharavtana','Counselling workshop for parents']];
      return `<section class="tsec tpy-24"><div class="tsec-inner ttext-center">
  <div class="eyebrow">Melava & Events</div>
  <h2 class="sectitle" style="margin-top:14px">Meet Families In Person</h2>
  <div class="event-grid">
    ${ev.map(e => `<div class="event-card"><div class="event-date"><b>${e[0].replace(/^0/,'')}</b><span>${e[1]}</span></div><h3>${e[2]}</h3><p>${e[3]}</p><span class="event-tag">View details</span></div>`).join('\n    ')}
  </div>
</div></section>`;
    }

    case 'app':
      return `<section class="tsec tpy-24"><div class="tsec-inner">
  <div class="appband darksec" style="position:relative;overflow:hidden">
    <div>
      <div class="eyebrow on-dark">Download the App</div>
      <h2 class="sectitle on-dark" style="margin-top:14px">Find Your Match in 30 Seconds</h2>
      <p class="on-dark-soft" style="margin-top:12px;font-size:14px;max-width:460px;line-height:1.7">Fast, simple and delightful. The most loved Marathi matrimony app — search, chat and connect on the go.</p>
      <div class="storebtns"><a href="#" class="storebtn">${icon('smartphone')} Google Play</a><a href="#" class="storebtn" style="background:#0f172a">${icon('apple')} App Store</a></div>
    </div>
    <div>
      <div class="ttext-center">
        <div class="rating" style="justify-content:center"><span class="stars">★★★★★</span><span>4.3 &middot; 10M+ Downloads</span></div>
        <div style="margin-top:12px;font-size:12px;color:var(--tp-ods)">Based on customer reviews</div>
      </div>
    </div>
  </div>
</div></section>`;

    default:
      return '';
  }
}

// Generate all 49 templates
console.log(`Generating ${palettes.length} templates...`);
palettes.forEach((t, i) => {
  const html = generateHTML(t);
  const filePath = path.join(DESIGNS_DIR, `${t.id}.html`);
  fs.writeFileSync(filePath, html);
  console.log(`  ${String(i+1).padStart(2)}. ${t.id}.html (${t.hero} hero, ${t.category})`);
});
console.log(`\nDone! ${palettes.length} templates generated in ${DESIGNS_DIR}`);
