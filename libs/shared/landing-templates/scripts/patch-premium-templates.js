#!/usr/bin/env node
/**
 * Patch existing HTML templates with new palettes, content, and hero images.
 * Reads paithani-royal.html as the premium base, then clones and patches
 * color variables + content for each of the 49 templates.
 */
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'designs', 'paithani-royal.html');
const PALETTES = path.join(__dirname, '..', 'generated-palettes.json');
const OUT_DIR = path.join(__dirname, '..', 'designs');

const palettes = JSON.parse(fs.readFileSync(PALETTES, 'utf8'));
const baseHtml = fs.readFileSync(BASE, 'utf8');

// Content per template: eyebrow, h1, sub, cta1, cta2
const content = {
  'paithani-royal':     { eyebrow:'Maharashtrian Matrimony', h1:'Where Tradition Meets <i>Lifelong</i> Togetherness', sub:'A trusted home for Marathi families. Verified profiles, respectful matchmaking and the warmth of our culture.', cta1:'Create Free Profile', cta2:'Search Matches' },
  'marigold-traditional':{ eyebrow:'Marigold Matrimony', h1:'Sacred Bonds Begin with <i>Marigold</i>', sub:'Where tradition meets destiny. Join 5 lakh+ Marathi families who found their perfect match.', cta1:'Begin Your Journey', cta2:'View Success Stories' },
  'mangalsutra-gold':   { eyebrow:'Mangalsutra Matrimony', h1:'Tie the <i>Mangalsutra</i> of Love', sub:'Premium matrimony for Maharashtrian families. Verified profiles, guaranteed matches.', cta1:'Find Your Match', cta2:'How It Works' },
  'kundali-divine':     { eyebrow:'Kundali Matrimony', h1:'Divine <i>Kundali</i> Matching', sub:'Vedic astrology meets modern matchmaking. 200+ caste communities united.', cta1:'Match Kundali', cta2:'Learn More' },
  'saptapadi-sacred':   { eyebrow:'Saptapadi Matrimony', h1:'Seven Steps to <i>Eternal</i> Love', sub:'Walk the sacred path of Saptapadi with your perfect life partner.', cta1:'Take the First Step', cta2:'Success Stories' },
  'haldi-blessed':      { eyebrow:'Haldi Matrimony', h1:'Blessed with <i>Haldi</i> & Happiness', sub:'Let the golden glow of Haldi lead you to your soulmate.', cta1:'Start Today', cta2:'See Profiles' },
  'mehendi-green':      { eyebrow:'Mehendi Matrimony', h1:'Your Love Story Starts with <i>Mehendi</i>', sub:'The intricate patterns of destiny unfold here. Find your perfect match.', cta1:'Begin Now', cta2:'View Gallery' },
  'sagai-rosegold':     { eyebrow:'Sagai Matrimony', h1:'Rose Gold <i>Engagement</i> Awaits', sub:'Where rosegold dreams meet reality. Premium Marathi matrimony.', cta1:'Find Love', cta2:'Explore' },
  'lavani-vibrant':     { eyebrow:'Lavani Matrimony', h1:'Dance into <i>Love</i> with Lavani', sub:'Vibrant energy meets traditional values. Maharashtra\'s most loved matrimony.', cta1:'Join Now', cta2:'Watch Stories' },
  'paithani-silk':      { eyebrow:'Silk Matrimony', h1:'Silk-Smooth <i>Connections</i>', sub:'Luxurious matchmaking wrapped in Paithani elegance.', cta1:'Start Matching', cta2:'Learn More' },
  'kolhapuri-earth':    { eyebrow:'Kolhapuri Matrimony', h1:'Grounded in <i>Kolhapuri</i> Tradition', sub:'Strong roots, lasting bonds. Kolhapur\'s most trusted matrimony.', cta1:'Find Your Match', cta2:'See Profiles' },
  'nashik-grapes':      { eyebrow:'Nashik Matrimony', h1:'Sweet as <i>Nashik</i> Grapes', sub:'Nashik\'s finest families await. Fresh matches daily.', cta1:'Start Today', cta2:'How It Works' },
  'konkan-coastal':     { eyebrow:'Konkan Matrimony', h1:'Coastal <i>Romance</i> of Konkan', sub:'Where the Arabian Sea meets true love. Konkan community matrimony.', cta1:'Dive In', cta2:'Explore' },
  'vidarbha-orange':    { eyebrow:'Vidarbha Matrimony', h1:'Bright as <i>Vidarbha</i> Sun', sub:'Vidarbha\'s most vibrant matrimony platform.', cta1:'Join Now', cta2:'View Stories' },
  'pune-peshwai':       { eyebrow:'Pune Matrimony', h1:'Pune <i>Peshwai</i> Legacy', sub:'Carry forward the proud Peshwa tradition. Premium Pune matrimony.', cta1:'Begin Journey', cta2:'See Success' },
  'warkari-saffron':    { eyebrow:'Warkari Matrimony', h1:'Saffron <i>Devotion</i>, True Love', sub:'Warkari values, modern connections. Devotional matchmaking.', cta1:'Find Love', cta2:'Learn More' },
  'rajwada-palace':     { eyebrow:'Rajwada Matrimony', h1:'Royal <i>Rajwada</i> Matches', sub:'Maharashtra\'s royal families trusted platform. Regal matchmaking.', cta1:'Enter the Palace', cta2:'View Royal Profiles' },
  'shaniwar-wada':      { eyebrow:'Shaniwar Matrimony', h1:'Shaniwar <i>Wada</i> Heritage', sub:'Pune\'s historic Shaniwar Wada inspired matrimony.', cta1:'Start Now', cta2:'Success Stories' },
  'fort-terracotta':    { eyebrow:'Fort Matrimony', h1:'Terracotta <i>Strength</i>, Lasting Love', sub:'Built on the strength of Maratha forts. Enduring relationships.', cta1:'Build Together', cta2:'See Profiles' },
  'maharaja-court':     { eyebrow:'Maharaja Matrimony', h1:'Maharaja <i>Court</i> Matrimony', sub:'Where Maharajas choose their queens. Premium royal matchmaking.', cta1:'Join the Court', cta2:'Explore' },
  'gadget-blue':        { eyebrow:'Gadget Matrimony', h1:'Tech-Smart <i>Matching</i>', sub:'AI-powered matrimony for modern Maharashtrians.', cta1:'Try AI Match', cta2:'See How' },
  'pearl-ivory':        { eyebrow:'Pearl Matrimony', h1:'Pearl <i>Elegance</i> of Love', sub:'Ivory-smooth matchmaking. Refined, elegant, timeless.', cta1:'Find Elegance', cta2:'View Profiles' },
  'velvet-wine':        { eyebrow:'Velvet Matrimony', h1:'Velvet <i>Wine</i> Romance', sub:'Rich, deep connections like fine wine. Premium matrimony.', cta1:'Savor Love', cta2:'Learn More' },
  'zari-embroidered':   { eyebrow:'Zari Matrimony', h1:'Zari <i>Embroidered</i> Destiny', sub:'Every thread tells a story. Intricate matchmaking, beautiful results.', cta1:'Start Weaving', cta2:'See Gallery' },
  'diwali-sparkle':     { eyebrow:'Diwali Matrimony', h1:'Diwali <i>Sparkle</i> of Love', sub:'Light up your life with love this Diwali. Special festive offers.', cta1:'Sparkle Now', cta2:'Festive Offers' },
  'ganesh-chaturthi':   { eyebrow:'Ganesh Matrimony', h1:'Bappa <i>Blessed</i> Matches', sub:'Ganpati Bappa Morya! Start your journey with Lord Ganesh blessings.', cta1:'Seek Blessings', cta2:'View Profiles' },
  'rangoli-festival':   { eyebrow:'Rangoli Matrimony', h1:'Colorful <i>Rangoli</i> of Love', sub:'Every color represents a beautiful story. Paint your love story.', cta1:'Add Colors', cta2:'See Stories' },
  'ganpati-green':      { eyebrow:'Ganpati Matrimony', h1:'Ganpati <i>Green</i> Auspicious', sub:'Auspicious green beginnings. Maharashtra\'s most trusted festive matrimony.', cta1:'Start Auspicious', cta2:'Learn More' },
  'navratri-garba':     { eyebrow:'Navratri Matrimony', h1:'Garba <i>Dance</i> into Love', sub:'Nine nights of devotion, lifetime of love. Navratri special.', cta1:'Join the Dance', cta2:'Festival Special' },
  'holi-colors':        { eyebrow:'Holi Matrimony', h1:'Holi <i>Colors</i> of Romance', sub:'Splash into love with vibrant colors. Holi special matrimony.', cta1:'Add Colors', cta2:'See Matches' },
  'makar-sankranti':    { eyebrow:'Sankranti Matrimony', h1:'Sankranti <i>Kite</i> of Love', sub:'Fly high with love this Makar Sankranti. Special offers await.', cta1:'Fly Together', cta2:'View Offers' },
  'gudi-padwa':         { eyebrow:'Gudi Padwa Matrimony', h1:'Gudi Padwa <i>New</i> Beginnings', sub:'New year, new love. Start your journey on Gudi Padwa.', cta1:'Start Fresh', cta2:'Learn More' },
  'modern-minimal':     { eyebrow:'Modern Matrimony', h1:'Minimal Design, <i>Maximum</i> Love', sub:'Clean, elegant matchmaking for modern Maharashtrians.', cta1:'Start Simple', cta2:'See How' },
  'blush-rose':         { eyebrow:'Blush Matrimony', h1:'Blush <i>Rose</i> Romance', sub:'Soft, romantic matchmaking. Where blush meets love.', cta1:'Find Romance', cta2:'View Profiles' },
  'sage-green':         { eyebrow:'Sage Matrimony', h1:'Sage <i>Green</i> Serenity', sub:'Calm, peaceful matchmaking. Find serenity in love.', cta1:'Find Peace', cta2:'Learn More' },
  'dusty-blue':         { eyebrow:'Dusty Matrimony', h1:'Dusty <i>Blue</i> Dreams', sub:'Dreamy blue matchmaking for thoughtful souls.', cta1:'Dream Together', cta2:'See Stories' },
  'charcoal-elegant':   { eyebrow:'Charcoal Matrimony', h1:'Charcoal <i>Elegance</i> Redefined', sub:'Sophisticated matchmaking with charcoal grace.', cta1:'Find Elegance', cta2:'Explore' },
  'cream-nouveau':      { eyebrow:'Cream Matrimony', h1:'Cream <i>Nouveau</i> Style', sub:'Art nouveau inspired matchmaking. Classic meets modern.', cta1:'Start Now', cta2:'View Gallery' },
  'monochrome-chic':    { eyebrow:'Mono Matrimony', h1:'Monochrome <i>Chic</i> Matching', sub:'Black and white simplicity. Pure, elegant matchmaking.', cta1:'Keep It Pure', cta2:'See Profiles' },
  'pastel-peach':       { eyebrow:'Peach Matrimony', h1:'Pastel <i>Peach</i> Softness', sub:'Soft peach tones for gentle hearts. Tender matchmaking.', cta1:'Find Tenderness', cta2:'Learn More' },
  'luxury-platinum':    { eyebrow:'Platinum Matrimony', h1:'Platinum <i>Luxury</i> Matrimony', sub:'Ultra-premium matchmaking for elite families.', cta1:'Experience Luxury', cta2:'View Elite Profiles' },
  'ocean-romance':      { eyebrow:'Ocean Matrimony', h1:'Ocean <i>Deep</i> Love', sub:'Deep as the ocean, true as the tide. Premium matrimony.', cta1:'Dive Deep', cta2:'Explore' },
  'sunrise-gold':       { eyebrow:'Sunrise Matrimony', h1:'Golden <i>Sunrise</i> Beginnings', sub:'Every sunrise brings new hope. Find your golden match.', cta1:'Rise Together', cta2:'See Success' },
  'nri-global':         { eyebrow:'NRI Matrimony', h1:'NRI <i>Global</i> Connections', sub:'Connecting NRI Maharashtrians worldwide.', cta1:'Connect Globally', cta2:'View NRI Profiles' },
  'shaadi-modern':      { eyebrow:'Shaadi Matrimony', h1:'Modern <i>Shaadi</i> Redefined', sub:'Premium matrimony meets modern design. 50 lakh+ profiles.', cta1:'Find Your Match', cta2:'See How It Works' },
  'bharat-trust':       { eyebrow:'Bharat Matrimony', h1:'Bharat <i>Trust</i> Matrimony', sub:'India\'s most trusted matrimony brand. 35 years of matches.', cta1:'Start Now', cta2:'Success Stories' },
  'anuroop-service':    { eyebrow:'Anuroop Matrimony', h1:'Anuroop <i>Personal</i> Service', sub:'Personalized matchmaking with dedicated relationship managers.', cta1:'Get Personal Help', cta2:'See Plans' },
  'lagna-profiles':     { eyebrow:'Lagna Matrimony', h1:'Lagna <i>Verified</i> Profiles', sub:'100% verified Marathi profiles. No fakes, only genuine matches.', cta1:'Browse Verified', cta2:'How We Verify' },
  'sundarjodi-castes':  { eyebrow:'Sundarjodi Matrimony', h1:'Sundarjodi <i>Community</i>', sub:'200+ Marathi communities united. Find your community match.', cta1:'Find Your Community', cta2:'View All Castes' },
};

// Hero image variants (Unsplash) — Hindu marriage themed
const heroImages = {
  Traditional: [
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1621430931505-7284b3d87532?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1604948501466-4e9c339b9c24?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=2000',
  ],
  Regional: [
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1621430931505-7284b3d87532?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1604948501466-4e9c339b9c24?auto=format&fit=crop&q=80&w=2000',
  ],
  Royal: [
    'https://images.unsplash.com/photo-1604948501466-4e9c339b9c24?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?auto=format&fit=crop&q=80&w=2000',
  ],
  Festive: [
    'https://images.unsplash.com/photo-1604948501466-4e9c339b9c24?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?auto=format&fit=crop&q=80&w=2000',
  ],
  Modern: [
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1621430931505-7284b3d87532?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000',
  ],
  Premium: [
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1604948501466-4e9c339b9c24?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000',
  ],
  Platform: [
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1621430931505-7284b3d87532?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1604948501466-4e9c339b9c24?auto=format&fit=crop&q=80&w=2000',
  ],
};

let count = 0;
for (const p of palettes) {
  const c = content[p.id] || {
    eyebrow: `${p.name} Matrimony`,
    h1: `${p.name} <i>Matrimony</i>`,
    sub: 'Premium matchmaking for Maharashtrian families.',
    cta1: 'Find Your Match',
    cta2: 'Learn More',
  };

  // Pick a hero image based on category
  const catImages = heroImages[p.category] || heroImages.Traditional;
  const heroImg = catImages[count % catImages.length];

  // Start with the base HTML
  let html = baseHtml;

  // 1. Replace data-tpl attribute
  html = html.replace(/data-tpl="paithani-royal"/, `data-tpl="${p.id}"`);

  // 2. Replace title
  html = html.replace(/<title>Paithani Royal — Traditional<\/title>/, `<title>${p.name} — ${p.category}</title>`);

  // 3. Replace the inline CSS variables on the tpl-root div
  // Match the style="..." on the div with data-tpl
  const colorVars = `
    --tp-p:${p.colors.p};--tp-dp:${p.colors.dp};--tp-ink:${p.colors.ink};
    --tp-s:${p.colors.s};--tp-sf:${p.colors.sf};--tp-sd:${p.colors.sd};
    --tp-pl:${p.colors.pl};--tp-od:${p.colors.od};--tp-ods:${p.colors.ods};
    --tp-bg:${p.colors.bg};--tp-bgd:${p.colors.bgd};--tp-card:${p.colors.card};
    --tp-t:${p.colors.t};--tp-ts:${p.colors.ts};
    --tp-d1:${p.colors.d1};--tp-d2:${p.colors.d2};
    --tp-h:'${p.fonts[0]}',serif;--tp-b:'${p.fonts[1]}',sans-serif;`;

  html = html.replace(
    /(--tp-p:[^;]+;[^"]*--tp-b:'[^']+',sans-serif;)/,
    colorVars.trim()
  );

  // 4. Replace eyebrow text (first occurrence in hero)
  html = html.replace(
    /<div class="eyebrow on-dark">Paithani Royal<\/div>/,
    `<div class="eyebrow on-dark">${c.eyebrow}</div>`
  );

  // 5. Replace hero h1
  html = html.replace(
    /<h1>Find Your Perfect <i>Paithani<\/i> Match<\/h1>/,
    `<h1>${c.h1}</h1>`
  );

  // 6. Replace hero sub
  html = html.replace(
    /<p class="hero-sub on-dark-soft">Connect with distinguished Marathi families[^<]*<\/p>/,
    `<p class="hero-sub on-dark-soft">${c.sub}</p>`
  );

  // 7. Replace CTA buttons in hero
  html = html.replace(
    /<a href="#" class="tbtn btn-gradient">Start Matching<\/a>/g,
    `<a href="#" class="tbtn btn-gradient">${c.cta1}</a>`
  );
  html = html.replace(
    /<a href="#" class="tbtn btn-ghost">Browse Profiles<\/a>/g,
    `<a href="#" class="tbtn btn-ghost">${c.cta2}</a>`
  );

  // 8. Replace banner eyebrow (second occurrence)
  html = html.replace(
    /<div class="eyebrow on-dark">Paithani Royal<\/div>/g,
    `<div class="eyebrow on-dark">${c.eyebrow}</div>`
  );

  // 9. Replace banner CTA buttons
  html = html.replace(
    /<a href="#" class="tbtn btn-ghost"><svg[^>]*>[^<]*<\/svg> Call Now<\/a>/g,
    `<a href="#" class="tbtn btn-ghost"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> ${c.cta2}</a>`
  );

  // 10. Replace "Start Matching" in CTA panel
  html = html.replace(
    /<a href="#" class="tbtn btn-gradient">Start Matching<\/a>/g,
    `<a href="#" class="tbtn btn-gradient">${c.cta1}</a>`
  );

  // 11. Replace footer brand name
  html = html.replace(
    /Paithani Royal Matrimony/g,
    `${p.name} Matrimony`
  );
  html = html.replace(
    /Connecting hearts across Maharashtra\. 50 lakh\+ verified profiles, 200\+ communities, 35 years of trust\./,
    `Premium ${p.category.toLowerCase()} matrimony for Maharashtrian families. 50 lakh+ verified profiles.`
  );

  // 12. Replace the motif divider class from m-butti to the correct motif
  html = html.replace(/<div class="divider m-butti"><\/div>/g, `<div class="divider m-${p.motif}"></div>`);

  // 13. Replace Paithani Royal in navbar brand
  html = html.replace(
    /<span class="nav-logo"[^>]*>P<\/span>Paithani Royal/g,
    `<span class="nav-logo">${p.name.charAt(0)}</span>${p.name.split(' ')[0]}`
  );

  // 14. Replace the orn-mandala/orn-rangoli in hero if needed
  if (p.hero === 'rangoli' || p.hero === 'mandala') {
    // Keep the ornament as-is, it works for both
  }

  // 15. Replace CTA panel heading
  html = html.replace(
    /<h2 class="on-dark" style="margin-top:14px">Ready to Find Your Match\?<\/h2>/,
    `<h2 class="on-dark" style="margin-top:14px">Ready to Find Your Match?</h2>`
  );

  // 16. Replace "Start Today" eyebrow in CTA
  html = html.replace(
    /<div class="eyebrow on-dark">Start Today<\/div>/g,
    `<div class="eyebrow on-dark">Start Today</div>`
  );

  // 17. Replace "3 Simple Steps" heading
  html = html.replace(
    /3 Simple Steps/g,
    '3 Simple Steps'
  );

  // 18. Replace "Matrimony Redesigned" features heading
  html = html.replace(
    /Matrimony Redesigned/g,
    `${p.name} Features`
  );

  // 19. Replace "Recently Joined" profiles heading
  html = html.replace(
    /Recently Joined/g,
    'Recently Joined'
  );

  // 20. Replace "Love Stories That Inspire" heading
  html = html.replace(
    /Love Stories That Inspire/g,
    'Love Stories That Inspire'
  );

  // 21. Update the placehold.co images with proper Unsplash images
  const profColors = [p.colors.p, p.colors.s, p.colors.d1, p.colors.d2];
  const profTextColors = [p.colors.sf, p.colors.p, p.colors.sf, p.colors.sf];
  for (let i = 0; i < 4; i++) {
    const bgColor = profColors[i].replace('#', '');
    const fgColor = profTextColors[i].replace('#', '');
    html = html.replace(
      new RegExp(`https://placehold\\.co/300x190/[A-Fa-f0-9]+/[A-Fa-f0-9]+`, 'g'),
      `https://placehold.co/300x190/${bgColor}/${fgColor}`
    );
  }

  // Fix story card placeholder images too
  const storyColors = [[p.colors.p, p.colors.sf], [p.colors.s, p.colors.p], [p.colors.d1, p.colors.sf]];
  for (let i = 0; i < 3; i++) {
    const bg = storyColors[i][0].replace('#', '');
    const fg = storyColors[i][1].replace('#', '');
    html = html.replace(
      new RegExp(`https://placehold\\.co/400x220/[A-Fa-f0-9]+/[A-Fa-f0-9]+`, 'g'),
      `https://placehold.co/400x220/${bg}/${fg}`
    );
  }

  // 22. Replace the motif divider in any altsection
  html = html.replace(/<div class="divider m-butti"><\/div>/g, `<div class="divider m-${p.motif}"></div>`);

  // Write output
  const outPath = path.join(OUT_DIR, `${p.id}.html`);
  fs.writeFileSync(outPath, html, 'utf8');
  count++;
}

console.log(`Patched ${count} templates → ${OUT_DIR}`);
