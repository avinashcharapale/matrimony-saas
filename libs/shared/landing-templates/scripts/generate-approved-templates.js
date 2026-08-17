#!/usr/bin/env node
/**
 * Generate approved-templates.ts from generated-palettes.json
 * Produces the auto-generated TypeScript file with all 49 template objects
 */

const fs = require('fs');
const path = require('path');

const PALETTES_PATH = path.join(__dirname, '..', 'generated-palettes.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'lib', 'approved-templates.ts');

const palettes = JSON.parse(fs.readFileSync(PALETTES_PATH, 'utf8'));

// Content library (same as generate-templates.js)
const contentLibrary = {
  'paithani-royal': { eyebrow: 'Maharashtrian Matrimony', h1: 'Where Tradition Meets <i>Lifelong</i> Togetherness', sub: 'A trusted home for Marathi families. Verified profiles, respectful matchmaking and the warmth of our culture — curated with the elegance of a Paithani weave.', cta1: 'Create Free Profile', cta2: 'Search Matches', tag: 'Magenta & gold · silk elegance', brand: 'Paithani' },
  'marigold-traditional': { eyebrow: 'Marigold Matrimony', h1: 'Sacred Bonds Begin with <i>Marigold</i>', sub: 'Where tradition meets destiny. Join 5 lakh+ Marathi families who found their perfect match.', cta1: 'Begin Your Journey', cta2: 'View Success Stories', tag: 'Deep red & green · festive spirit', brand: 'Marigold' },
  'mangalsutra-gold': { eyebrow: 'Mangalsutra Matrimony', h1: 'Tie the <i>Mangalsutra</i> of Love', sub: 'Premium matrimony for Maharashtrian families. Verified profiles, guaranteed matches.', cta1: 'Find Your Match', cta2: 'How It Works', tag: 'Dark olive & gold · mangalsutra', brand: 'Mangalsutra' },
  'kundali-divine': { eyebrow: 'Kundali Matrimony', h1: 'Divine <i>Kundali</i> Matching', sub: 'Vedic astrology meets modern matchmaking. 200+ caste communities united.', cta1: 'Match Kundali', cta2: 'Learn More', tag: 'Forest green & pink · divine', brand: 'Kundali' },
  'saptapadi-sacred': { eyebrow: 'Saptapadi Matrimony', h1: 'Seven Steps to <i>Eternal</i> Love', sub: 'Walk the sacred path of Saptapadi with your perfect life partner.', cta1: 'Take the First Step', cta2: 'Success Stories', tag: 'Burnt sienna & teal · sacred', brand: 'Saptapadi' },
  'haldi-blessed': { eyebrow: 'Haldi Matrimony', h1: 'Blessed with <i>Haldi</i> & Happiness', sub: 'Let the golden glow of Haldi lead you to your soulmate.', cta1: 'Start Today', cta2: 'See Profiles', tag: 'Dark gold & blue · haldi blessed', brand: 'Haldi' },
  'mehendi-green': { eyebrow: 'Mehendi Matrimony', h1: 'Your Love Story Starts with <i>Mehendi</i>', sub: 'The intricate patterns of destiny unfold here. Find your perfect match.', cta1: 'Begin Now', cta2: 'View Gallery', tag: 'Emerald & rose · mehendi art', brand: 'Mehendi' },
  'sagai-rosegold': { eyebrow: 'Sagai Matrimony', h1: 'Rose Gold <i>Engagement</i> Awaits', sub: 'Where rosegold dreams meet reality. Premium Marathi matrimony.', cta1: 'Find Love', cta2: 'Explore', tag: 'Dusty rose & green · rosegold', brand: 'Sagai' },
  'lavani-vibrant': { eyebrow: 'Lavani Matrimony', h1: 'Dance into <i>Love</i> with Lavani', sub: 'Vibrant energy meets traditional values. Maharashtra most loved matrimony.', cta1: 'Join Now', cta2: 'Watch Stories', tag: 'Magenta & lime · vibrant', brand: 'Lavani' },
  'paithani-silk': { eyebrow: 'Silk Matrimony', h1: 'Silk-Smooth <i>Connections</i>', sub: 'Luxurious matchmaking wrapped in Paithani elegance.', cta1: 'Start Matching', cta2: 'Learn More', tag: 'Deep teal & red · silk', brand: 'Silk' },
  'kolhapuri-earth': { eyebrow: 'Kolhapuri Matrimony', h1: 'Grounded in <i>Kolhapuri</i> Tradition', sub: 'Strong roots, lasting bonds. Kolhapur most trusted matrimony.', cta1: 'Find Your Match', cta2: 'See Profiles', tag: 'Terracotta & lime · earthy', brand: 'Kolhapuri' },
  'nashik-grapes': { eyebrow: 'Nashik Matrimony', h1: 'Sweet as <i>Nashik</i> Grapes', sub: 'Nashik finest families await. Fresh matches daily.', cta1: 'Start Today', cta2: 'How It Works', tag: 'Purple & gold · Nashik vineyards', brand: 'Nashik' },
  'konkan-coastal': { eyebrow: 'Konkan Matrimony', h1: 'Coastal <i>Romance</i> of Konkan', sub: 'Where the Arabian Sea meets true love. Konkan community matrimony.', cta1: 'Dive In', cta2: 'Explore', tag: 'Sea green & coral · coastal', brand: 'Konkan' },
  'vidarbha-orange': { eyebrow: 'Vidarbha Matrimony', h1: 'Bright as <i>Vidarbha</i> Sun', sub: 'Vidarbha most vibrant matrimony platform. Bold matches, lasting bonds.', cta1: 'Join Now', cta2: 'View Stories', tag: 'Orange & green · vibrant sun', brand: 'Vidarbha' },
  'pune-peshwai': { eyebrow: 'Pune Matrimony', h1: 'Pune <i>Peshwai</i> Legacy', sub: 'Carry forward the proud Peshwa tradition. Premium Pune matrimony.', cta1: 'Begin Journey', cta2: 'See Success', tag: 'Crimson & green · Peshwai', brand: 'Pune' },
  'warkari-saffron': { eyebrow: 'Warkari Matrimony', h1: 'Saffron <i>Devotion</i>, True Love', sub: 'Warkari values, modern connections. Devotional matchmaking.', cta1: 'Find Love', cta2: 'Learn More', tag: 'Burnt orange & blue · saffron', brand: 'Warkari' },
  'rajwada-palace': { eyebrow: 'Rajwada Matrimony', h1: 'Royal <i>Rajwada</i> Matches', sub: 'Maharashtra royal families trusted platform. Regal matchmaking.', cta1: 'Enter the Palace', cta2: 'View Royal Profiles', tag: 'Royal purple & gold · palace', brand: 'Rajwada' },
  'shaniwar-wada': { eyebrow: 'Shaniwar Matrimony', h1: 'Shaniwar <i>Wada</i> Heritage', sub: 'Pune historic Shaniwar Wada inspired matrimony. Legacy meets love.', cta1: 'Start Now', cta2: 'Success Stories', tag: 'Crimson & sage · heritage', brand: 'Shaniwar' },
  'fort-terracotta': { eyebrow: 'Fort Matrimony', h1: 'Terracotta <i>Strength</i>, Lasting Love', sub: 'Built on the strength of Maratha forts. Enduring relationships.', cta1: 'Build Together', cta2: 'See Profiles', tag: 'Brown & blue · fort strength', brand: 'Fort' },
  'maharaja-court': { eyebrow: 'Maharaja Matrimony', h1: 'Maharaja <i>Court</i> Matrimony', sub: 'Where Maharajas choose their queens. Premium royal matchmaking.', cta1: 'Join the Court', cta2: 'Explore', tag: 'Burgundy & green · royal court', brand: 'Maharaja' },
  'gadget-blue': { eyebrow: 'Gadget Matrimony', h1: 'Tech-Smart <i>Matching</i>', sub: 'AI-powered matrimony for modern Maharashtrians. Smart matches, faster.', cta1: 'Try AI Match', cta2: 'See How', tag: 'Navy & orange · tech smart', brand: 'Gadget' },
  'pearl-ivory': { eyebrow: 'Pearl Matrimony', h1: 'Pearl <i>Elegance</i> of Love', sub: 'Ivory-smooth matchmaking. Refined, elegant, timeless.', cta1: 'Find Elegance', cta2: 'View Profiles', tag: 'Taupe & blue · pearl elegance', brand: 'Pearl' },
  'velvet-wine': { eyebrow: 'Velvet Matrimony', h1: 'Velvet <i>Wine</i> Romance', sub: 'Rich, deep connections like fine wine. Premium matrimony.', cta1: 'Savor Love', cta2: 'Learn More', tag: 'Wine & green · velvet romance', brand: 'Velvet' },
  'zari-embroidered': { eyebrow: 'Zari Matrimony', h1: 'Zari <i>Embroidered</i> Destiny', sub: 'Every thread tells a story. Intricate matchmaking, beautiful results.', cta1: 'Start Weaving', cta2: 'See Gallery', tag: 'Jade & magenta · zari art', brand: 'Zari' },
  'diwali-sparkle': { eyebrow: 'Diwali Matrimony', h1: 'Diwali <i>Sparkle</i> of Love', sub: 'Light up your life with love this Diwali. Special festive offers.', cta1: 'Sparkle Now', cta2: 'Festive Offers', tag: 'Festive red & cyan · Diwali', brand: 'Diwali' },
  'ganesh-chaturthi': { eyebrow: 'Ganesh Matrimony', h1: 'Bappa <i>Blessed</i> Matches', sub: 'Ganpati Bappa Morya! Start your journey with Lord Ganesh blessings.', cta1: 'Seek Blessings', cta2: 'View Profiles', tag: 'Crimson & green · Ganesh', brand: 'Ganesh' },
  'rangoli-festival': { eyebrow: 'Rangoli Matrimony', h1: 'Colorful <i>Rangoli</i> of Love', sub: 'Every color represents a beautiful story. Paint your love story.', cta1: 'Add Colors', cta2: 'See Stories', tag: 'Brick & teal · rangoli', brand: 'Rangoli' },
  'ganpati-green': { eyebrow: 'Ganpati Matrimony', h1: 'Ganpati <i>Green</i> Auspicious', sub: 'Auspicious green beginnings. Maharashtra most trusted festive matrimony.', cta1: 'Start Auspicious', cta2: 'Learn More', tag: 'Green & magenta · Ganpati', brand: 'Ganpati' },
  'navratri-garba': { eyebrow: 'Navratri Matrimony', h1: 'Garba <i>Dance</i> into Love', sub: 'Nine nights of devotion, lifetime of love. Navratri special matchmaking.', cta1: 'Join the Dance', cta2: 'Festival Special', tag: 'Saffron & green · Navratri', brand: 'Navratri' },
  'holi-colors': { eyebrow: 'Holi Matrimony', h1: 'Holi <i>Colors</i> of Romance', sub: 'Splash into love with vibrant colors. Holi special matrimony.', cta1: 'Add Colors', cta2: 'See Matches', tag: 'Hot pink & green · Holi', brand: 'Holi' },
  'makar-sankranti': { eyebrow: 'Sankranti Matrimony', h1: 'Sankranti <i>Kite</i> of Love', sub: 'Fly high with love this Makar Sankranti. Special offers await.', cta1: 'Fly Together', cta2: 'View Offers', tag: 'Amber & blue · Sankranti', brand: 'Sankranti' },
  'gudi-padwa': { eyebrow: 'Gudi Padwa Matrimony', h1: 'Gudi Padwa <i>New</i> Beginnings', sub: 'New year, new love. Start your journey on Gudi Padwa.', cta1: 'Start Fresh', cta2: 'Learn More', tag: 'Deep red & green · Gudi Padwa', brand: 'Gudi' },
  'modern-minimal': { eyebrow: 'Modern Matrimony', h1: 'Minimal Design, <i>Maximum</i> Love', sub: 'Clean, elegant matchmaking for modern Maharashtrians.', cta1: 'Start Simple', cta2: 'See How', tag: 'Blue & orange · minimal', brand: 'Modern' },
  'blush-rose': { eyebrow: 'Blush Matrimony', h1: 'Blush <i>Rose</i> Romance', sub: 'Soft, romantic matchmaking. Where blush meets love.', cta1: 'Find Romance', cta2: 'View Profiles', tag: 'Rose & cyan · blush', brand: 'Blush' },
  'sage-green': { eyebrow: 'Sage Matrimony', h1: 'Sage <i>Green</i> Serenity', sub: 'Calm, peaceful matchmaking. Find serenity in love.', cta1: 'Find Peace', cta2: 'Learn More', tag: 'Sage & purple · serene', brand: 'Sage' },
  'dusty-blue': { eyebrow: 'Dusty Matrimony', h1: 'Dusty <i>Blue</i> Dreams', sub: 'Dreamy blue matchmaking for thoughtful souls.', cta1: 'Dream Together', cta2: 'See Stories', tag: 'Slate blue & coral · dreamy', brand: 'Dusty' },
  'charcoal-elegant': { eyebrow: 'Charcoal Matrimony', h1: 'Charcoal <i>Elegance</i> Redefined', sub: 'Sophisticated matchmaking with charcoal grace.', cta1: 'Find Elegance', cta2: 'Explore', tag: 'Charcoal & gold · elegant', brand: 'Charcoal' },
  'cream-nouveau': { eyebrow: 'Cream Matrimony', h1: 'Cream <i>Nouveau</i> Style', sub: 'Art nouveau inspired matchmaking. Classic meets modern.', cta1: 'Start Now', cta2: 'View Gallery', tag: 'Coral & olive · nouveau', brand: 'Cream' },
  'monochrome-chic': { eyebrow: 'Mono Matrimony', h1: 'Monochrome <i>Chic</i> Matching', sub: 'Black and white simplicity. Pure, elegant matchmaking.', cta1: 'Keep It Pure', cta2: 'See Profiles', tag: 'Black & gray · monochrome', brand: 'Mono' },
  'pastel-peach': { eyebrow: 'Peach Matrimony', h1: 'Pastel <i>Peach</i> Softness', sub: 'Soft peach tones for gentle hearts. Tender matchmaking.', cta1: 'Find Tenderness', cta2: 'Learn More', tag: 'Orange & cyan · peach', brand: 'Peach' },
  'luxury-platinum': { eyebrow: 'Platinum Matrimony', h1: 'Platinum <i>Luxury</i> Matrimony', sub: 'Ultra-premium matchmaking for elite families.', cta1: 'Experience Luxury', cta2: 'View Elite Profiles', tag: 'Warm gray & green · platinum', brand: 'Platinum' },
  'ocean-romance': { eyebrow: 'Ocean Matrimony', h1: 'Ocean <i>Deep</i> Love', sub: 'Deep as the ocean, true as the tide. Premium matrimony.', cta1: 'Dive Deep', cta2: 'Explore', tag: 'Teal & magenta · ocean', brand: 'Ocean' },
  'sunrise-gold': { eyebrow: 'Sunrise Matrimony', h1: 'Golden <i>Sunrise</i> Beginnings', sub: 'Every sunrise brings new hope. Find your golden match.', cta1: 'Rise Together', cta2: 'See Success', tag: 'Sienna & blue · sunrise', brand: 'Sunrise' },
  'nri-global': { eyebrow: 'NRI Matrimony', h1: 'NRI <i>Global</i> Connections', sub: 'Connecting NRI Maharashtrians worldwide. Love knows no borders.', cta1: 'Connect Globally', cta2: 'View NRI Profiles', tag: 'Navy & rose · global', brand: 'NRI' },
  'shaadi-modern': { eyebrow: 'Shaadi Matrimony', h1: 'Modern <i>Shaadi</i> Redefined', sub: 'BharatMatrimony meets modern design. 50 lakh+ profiles.', cta1: 'Find Your Match', cta2: 'See How It Works', tag: 'Magenta & green · modern shaadi', brand: 'Shaadi' },
  'bharat-trust': { eyebrow: 'Bharat Matrimony', h1: 'Bharat <i>Trust</i> Matrimony', sub: 'India most trusted matrimony brand. 35 years of successful matches.', cta1: 'Start Now', cta2: 'Success Stories', tag: 'Hot magenta & green · trust', brand: 'Bharat' },
  'anuroop-service': { eyebrow: 'Anuroop Matrimony', h1: 'Anuroop <i>Personal</i> Service', sub: 'Personalized matchmaking with dedicated relationship managers.', cta1: 'Get Personal Help', cta2: 'See Plans', tag: 'Forest green & purple · personal', brand: 'Anuroop' },
  'lagna-profiles': { eyebrow: 'Lagna Matrimony', h1: 'Lagna <i>Verified</i> Profiles', sub: '100% verified Marathi profiles. No fakes, only genuine matches.', cta1: 'Browse Verified', cta2: 'How We Verify', tag: 'Terracotta & cyan · verified', brand: 'Lagna' },
  'sundarjodi-castes': { eyebrow: 'Sundarjodi Matrimony', h1: 'Sundarjodi <i>Community</i>', sub: '200+ Marathi communities united. Find your community match.', cta1: 'Find Your Community', cta2: 'View All Castes', tag: 'Dark rose & green · community', brand: 'Sundarjodi' },
};

const footerBlurbs = {
  'paithani-royal': 'A trusted home for Maharashtrian families — curated with the elegance of a Paithani weave since 2006.',
  'marigold-traditional': 'Where tradition meets destiny — the trusted matrimony for 5 lakh+ Marathi families.',
  'mangalsutra-gold': 'Premium matrimony for Maharashtrian families — verified profiles, guaranteed matches.',
  'kundali-divine': 'Vedic astrology meets modern matchmaking — uniting 200+ caste communities with divine compatibility.',
  'saptapadi-sacred': 'Seven sacred steps toward eternal love — trusted by thousands of Maharashtrian families.',
  'haldi-blessed': 'The golden glow of blessed beginnings — premium matrimony for traditional Maharashtrian families.',
  'mehendi-green': 'Intricate patterns of destiny, beautiful bonds of love — Maharashtra most trusted matrimony.',
  'sagai-rosegold': 'Rose-gold elegance meets heartfelt matchmaking — where engagements turn into everlasting bonds.',
  'lavani-vibrant': 'Vibrant energy meets traditional values — Maharashtra most loved matrimony since 2008.',
  'paithani-silk': 'Luxurious matchmaking wrapped in Paithani elegance — connecting fine Maharashtrian families.',
  'kolhapuri-earth': 'Grounded in Kolhapuri tradition, strong as the roots of Maharashtra — trusted since 2005.',
  'nashik-grapes': 'Sweet as Nashik grapes, fresh as the morning breeze — find your perfect match today.',
  'konkan-coastal': 'Where the Arabian Sea meets true love — the coastal matrimony for Konkan families.',
  'vidarbha-orange': 'Bright as the Vidarbha sun — vibrant matchmaking for families across Maharashtra.',
  'pune-peshwai': 'Carrying forward the proud Peshwa legacy — premium matrimony for Pune families.',
  'warkari-saffron': 'Warkari devotion, modern connections — spiritual matchmaking rooted in faith.',
  'rajwada-palace': 'Where royal families choose their perfect match — regal matchmaking since 2007.',
  'shaniwar-wada': 'Heritage inspired by Shaniwar Wada — Pune historic matrimony, legacy meets love.',
  'fort-terracotta': 'Built on the strength of Maratha forts — enduring relationships for generations.',
  'maharaja-court': 'Where Maharajas choose their queens — premium royal matchmaking for elite families.',
  'gadget-blue': 'AI-powered matrimony for modern Maharashtrians — smart matches, faster connections.',
  'pearl-ivory': 'Ivory-smooth matchmaking — refined, elegant and timeless connections.',
  'velvet-wine': 'Rich, deep connections like fine wine — premium matrimony for discerning families.',
  'zari-embroidered': 'Every thread tells a story — intricate matchmaking with beautiful results.',
  'diwali-sparkle': 'Light up your life with love this Diwali — festive matchmaking for Maharashtrian families.',
  'ganesh-chaturthi': 'Blessed by Lord Ganesh — start your journey with divine blessings and true love.',
  'rangoli-festival': 'Every color tells a beautiful story — paint your love story with vibrant traditions.',
  'ganpati-green': 'Auspicious green beginnings — Maharashtra most trusted festive matrimony.',
  'navratri-garba': 'Nine nights of devotion, lifetime of love — Navratri special matchmaking.',
  'holi-colors': 'Splash into love with vibrant colors — Holi special matrimony for joyful families.',
  'makar-sankranti': 'Fly high with love this Makar Sankranti — sweet beginnings await.',
  'gudi-padwa': 'New year, new love — celebrate new beginnings on Gudi Padwa with us.',
  'modern-minimal': 'Clean, elegant matchmaking for modern Maharashtrians — simplicity meets love.',
  'blush-rose': 'Soft, romantic matchmaking — where blush meets love for gentle hearts.',
  'sage-green': 'Calm, peaceful matchmaking — find serenity and love in perfect harmony.',
  'dusty-blue': 'Dreamy blue matchmaking for thoughtful souls — love beyond borders.',
  'charcoal-elegant': 'Sophisticated matchmaking with charcoal grace — elegance redefined.',
  'cream-nouveau': 'Art nouveau inspired matchmaking — where classic meets modern love.',
  'monochrome-chic': 'Black and white simplicity — pure, elegant matchmaking for purists.',
  'pastel-peach': 'Soft peach tones for gentle hearts — tender matchmaking, timeless love.',
  'luxury-platinum': 'Ultra-premium matchmaking for elite families — where luxury meets love.',
  'ocean-romance': 'Deep as the ocean, true as the tide — premium matrimony for ocean hearts.',
  'sunrise-gold': 'Every sunrise brings new hope — find your golden match with us.',
  'nri-global': 'Connecting NRI Maharashtrians worldwide — love knows no borders.',
  'shaadi-modern': 'Modern Shaadi redefined — 50 lakh+ verified profiles across India.',
  'bharat-trust': 'India most trusted matrimony — 35 years of successful matches and counting.',
  'anuroop-service': 'Personalized matchmaking with dedicated relationship managers — your journey, our care.',
  'lagna-profiles': '100% verified Marathi profiles — no fakes, only genuine matches and families.',
  'sundarjodi-castes': '200+ Marathi communities united — find your perfect community match today.',
};

function generateDesignTokens(t) {
  const isDark = ['frame','royal','fullbleed','parallax','gradient-anim'].includes(t.hero);
  const tokens = {};

  /* ── Global nav tokens ── */
  tokens['td-nav-brand-size'] = '22px';
  tokens['td-nav-brand-weight'] = '700';

  /* ── Dark background gradient ── */
  if (isDark) {
    tokens['td-dark-bg'] = `linear-gradient(165deg,${t.colors.p} 0%,${t.colors.d1} 50%,${t.colors.d2} 100%)`;
    tokens['td-dark-bg-deep'] = `linear-gradient(165deg,${t.colors.p} 0%,${t.colors.d1} 50%,${t.colors.d2} 100%)`;
  }

  /* ── Hero radial gradient for light heroes (Traditional/Regional/Royal/Festive) ── */
  if (!isDark && ['Traditional', 'Regional', 'Royal', 'Festive'].includes(t.category)) {
    tokens['td-hero-bg'] = `radial-gradient(110% 90% at 12% 0%,${t.colors.sf}40 0%,transparent 46%),linear-gradient(180deg,${t.colors.sf}20 0%,${t.colors.bg} 60%,${t.colors.bgd} 100%)`;
  }

  tokens['td-alt-bg'] = 'var(--tp-bgd)';
  tokens['td-card-bg'] = 'var(--tp-card)';
  tokens['td-card-border'] = '1px solid var(--tp-pl)';
  tokens['td-card-top'] = '0';
  tokens['td-feat-radius'] = 'var(--tp-r-lg)';
  tokens['td-feat-shadow'] = 'var(--tp-shadow)';

  /* ── Stats ── */
  tokens['td-stats-val'] = 'var(--tp-sf)';
  tokens['td-stats-lab'] = 'var(--tp-ods)';

  /* ── Banner ── */
  tokens['td-banner-veil'] = `linear-gradient(100deg,${t.colors.d2} 0%,${t.colors.d1} 58%,${t.colors.p} 112%)`;
  tokens['td-banner-veil-op'] = '.93';

  /* ── CTA panel ── */
  tokens['td-cta-radius'] = '32px';

  /* ── Hero-variant specific tokens ── */
  switch (t.hero) {
    case 'frame':
      tokens['td-frame-w'] = '848px';
      tokens['td-frame-radius'] = '48px 48px 24px 24px';
      tokens['td-frame-pad'] = '64px 56px';
      tokens['td-frame-offset'] = '-10px';
      tokens['td-frame-shadow'] = 'inset 0 0 0 2px rgba(0,0,0,.18),0 30px 80px rgba(63,12,34,.45)';
      break;

    case 'royal':
      tokens['td-frame-w'] = '880px';
      tokens['td-frame-radius'] = '44px 44px 22px 22px';
      tokens['td-frame-pad'] = '56px 48px';
      tokens['td-orn-size'] = '120px';
      tokens['td-hero-orn-mb'] = '26px';
      break;

    case 'parallax':
      tokens['td-hero-pad'] = '120px 24px 100px';
      tokens['td-h1-size'] = '56px';
      tokens['td-h1-weight'] = '700';
      break;

    case 'gradient-anim':
      tokens['td-hero-pad'] = '120px 24px 100px';
      tokens['td-h1-size'] = '54px';
      tokens['td-h1-weight'] = '700';
      break;

    case 'fullbleed':
      tokens['td-hero-pad'] = '0';
      tokens['td-h1-size'] = '52px';
      tokens['td-h1-weight'] = '700';
      break;

    case 'asymmetric':
      tokens['td-hero-pad'] = '0 24px';
      tokens['td-h1-size'] = '44px';
      break;

    case 'floating':
      tokens['td-hero-pad'] = '110px 24px 84px';
      break;

    case 'split':
      tokens['td-h1-size'] = '46px';
      tokens['td-hero-pad'] = '110px 24px 84px';
      break;

    case 'form':
      tokens['td-h1-size'] = '42px';
      tokens['td-hero-pad'] = '110px 24px 84px';
      break;

    case 'collage':
    case 'masonry':
      tokens['td-hero-pad'] = '110px 24px 48px';
      break;

    case 'circular':
    case 'hscroll':
      tokens['td-hero-pad'] = '110px 24px 64px';
      break;

    case 'minimal':
      tokens['td-hero-pad'] = '140px 24px 120px';
      tokens['td-h1-size'] = '58px';
      tokens['td-h1-weight'] = '600';
      break;

    case 'rangoli':
      tokens['td-hero-orn-mb'] = '22px';
      tokens['td-hero-rangoli-content'] = "''";
      tokens['td-hero-rangoli-size'] = '88px';
      tokens['td-hero-rangoli-op'] = '.25';
      tokens['td-hero-rangoli-bg'] = `radial-gradient(circle,${t.colors.s} 0 11px,transparent 12px),conic-gradient(from 0deg,${t.colors.sf} 0 22.5deg,transparent 22.5deg 45deg,${t.colors.sf} 45deg 67.5deg,transparent 67.5deg 90deg,${t.colors.sf} 90deg 112.5deg,transparent 112.5deg 135deg,${t.colors.sf} 135deg 157.5deg,transparent 157.5deg 180deg,${t.colors.sf} 180deg 202.5deg,transparent 202.5deg 225deg,${t.colors.sf} 225deg 247.5deg,transparent 247.5deg 270deg,${t.colors.sf} 270deg 292.5deg,transparent 292.5deg 315deg,${t.colors.sf} 315deg 337.5deg,transparent 337.5deg 360deg)`;
      tokens['td-hero-rangoli-mask'] = 'radial-gradient(circle,transparent 11px,#000 12px,#000 44px,transparent 45px)';
      tokens['td-rangoli-tl-y'] = '80px';
      tokens['td-rangoli-tl-x'] = '32px';
      tokens['td-rangoli-tr-y'] = '112px';
      tokens['td-rangoli-tr-x'] = '40px';
      break;

    case 'mandala':
    case 'arch':
      tokens['td-hero-orn-mb'] = '22px';
      break;
  }

  /* ── Category-specific tokens ── */
  if (['Traditional', 'Regional', 'Royal', 'Festive'].includes(t.category)) {
    tokens['td-hero-garland-h'] = '14px';
    tokens['td-hero-garland-w'] = '260px';
    tokens['td-hero-garland-mt'] = '40px';
    tokens['td-hero-garland-op'] = '.7';
    tokens['td-hero-garland-bg'] = `radial-gradient(circle at 20% 50%,${t.colors.s} 0 5px,transparent 5.5px) repeat-x center / 40px 14px,radial-gradient(circle at 30% 30%,${t.colors.sd} 0 4px,transparent 4.5px) repeat-x center / 40px 14px`;
  }

  return tokens;
}

function generateTemplateObject(t) {
  const c = contentLibrary[t.id] || { eyebrow: t.name, h1: t.name, sub: 'Premium matrimony', cta1: 'Find Match', cta2: 'Learn More', tag: t.category, brand: t.name.split(' ')[0] };
  const designTokens = generateDesignTokens(t);
  const isDark = ['frame','royal','fullbleed','parallax'].includes(t.hero);
  
  // Inject new sections into order array
  const baseOrder = Array.isArray(t.order) ? [...t.order].filter(k => k !== 'counters') : ['stats','features','how','profiles','success','cta'];
  const newOrder = [];
  for (const key of baseOrder) {
    newOrder.push(key);
    if (key === 'profiles') newOrder.push('beforeafter');
    if (key === 'success') newOrder.push('testimonials');
  }
  // Deduplicate in case order already had them
  const uniqueOrder = [...new Set(newOrder)];
  
  const obj = {
    id: t.id,
    name: t.name,
    cat: t.category,
    tag: c.tag,
    brand: c.brand,
    h: t.fonts[0],
    b: t.fonts[1],
    motif: t.motif,
    hero: t.hero,
    btn: 'gradient',
    nav: { dark: isDark, glass: !isDark },
    c: t.colors,
    eyebrow: c.eyebrow,
    h1: c.h1,
    sub: c.sub,
    cta1: c.cta1,
    cta2: c.cta2,
    footerBlurb: footerBlurbs[t.id] || `${c.brand} Matrimony — trusted by thousands of Maharashtrian families.`,
    order: uniqueOrder,
    status: 'approved',
    note: '',
    fab: true,
    stickyBar: { text: 'Find your perfect match today', cta: 'Register Free' },
    skeleton: true,
    bannerGarland: ['Traditional', 'Regional', 'Royal', 'Festive'].includes(t.category),
    statsDark: true,
  };

  if (Object.keys(designTokens).length > 0) {
    obj.designTokens = designTokens;
  }
  
  return obj;
}

// Generate the TypeScript file
let output = `/* AUTO-GENERATED from generated-palettes.json — do not edit by hand. */
import { LandingTemplate } from './landing-template.model';

export const APPROVED_TEMPLATES: LandingTemplate[] = [
`;

palettes.forEach((t, i) => {
  const obj = generateTemplateObject(t);
  output += `  ${JSON.stringify(obj, null, 2).replace(/"/g, '"')}${i < palettes.length - 1 ? ',' : ''}
`;
});

output += `];
`;

// Add APPROVED_TEMPLATE_IDS
output += `
/** All approved template IDs as a readonly array. */
export const APPROVED_TEMPLATE_IDS: string[] = APPROVED_TEMPLATES.map(t => t.id);

/** Look up a template by its ID. */
export function findTemplate(id: string): LandingTemplate | undefined {
  return APPROVED_TEMPLATES.find(t => t.id === id);
}
`;

fs.writeFileSync(OUTPUT_PATH, output);
console.log(`Generated ${palettes.length} templates → ${OUTPUT_PATH}`);
console.log(`File size: ${(output.length / 1024).toFixed(1)} KB`);
