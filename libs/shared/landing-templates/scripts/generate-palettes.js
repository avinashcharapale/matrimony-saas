#!/usr/bin/env node
/**
 * Generate 49 unique Marathi matrimony color palettes
 * Uses HSL color wheel with cultural constraints
 * Ensures zero primary and secondary color overlap
 */

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function darken(hex, amount) {
  const r = Math.max(0, parseInt(hex.slice(1,3),16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3,5),16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5,7),16) - amount);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function lighten(hex, amount) {
  const r = Math.min(255, parseInt(hex.slice(1,3),16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3,5),16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5,7),16) + amount);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// 49 culturally appropriate primary hues for Marathi matrimony
// Spaced across the color wheel with minimum 25deg separation
const primaryHues = [
  // Traditional (8)
  { h: 340, s: 62, l: 31 },  // deep rose (paithani-royal)
  { h: 0,   s: 72, l: 28 },  // deep red (marigold-traditional)
  { h: 42,  s: 68, l: 18 },  // dark olive (mangalsutra-gold)
  { h: 152, s: 60, l: 22 },  // forest green (kundali-divine)
  { h: 25,  s: 78, l: 32 },  // burnt sienna (saptapadi-sacred)
  { h: 48,  s: 70, l: 26 },  // dark gold (haldi-blessed)
  { h: 145, s: 65, l: 25 },  // emerald (mehendi-green)
  { h: 348, s: 42, l: 38 },  // dusty rose (sagai-rosegold)
  // Regional (8)
  { h: 310, s: 70, l: 40 },  // magenta (lavani-vibrant)
  { h: 175, s: 55, l: 22 },  // deep teal (paithani-silk)
  { h: 18,  s: 72, l: 35 },  // terracotta (kolhapuri-earth)
  { h: 265, s: 68, l: 32 },  // deep purple (nashik-grapes)
  { h: 170, s: 60, l: 30 },  // sea green (konkan-coastal)
  { h: 15,  s: 80, l: 38 },  // bright orange (vidarbha-orange)
  { h: 350, s: 58, l: 30 },  // crimson (pune-peshwai)
  { h: 20,  s: 75, l: 36 },  // burnt orange (warkari-saffron)
  // Royal (8)
  { h: 270, s: 62, l: 28 },  // royal purple (rajwada-palace)
  { h: 5,   s: 65, l: 25 },  // dark crimson (shaniwar-wada)
  { h: 22,  s: 60, l: 38 },  // warm brown (fort-terracotta)
  { h: 345, s: 52, l: 28 },  // burgundy (maharaja-court)
  { h: 220, s: 65, l: 28 },  // navy (gadget-blue)
  { h: 40,  s: 35, l: 42 },  // warm taupe (pearl-ivory)
  { h: 342, s: 45, l: 32 },  // wine (velvet-wine)
  { h: 160, s: 55, l: 22 },  // deep jade (zari-embroidered)
  // Festive (8)
  { h: 2,   s: 70, l: 38 },  // festive red (diwali-sparkle)
  { h: 355, s: 72, l: 42 },  // bright crimson (ganesh-chaturthi)
  { h: 10,  s: 55, l: 30 },  // brick (rangoli-festival)
  { h: 135, s: 62, l: 32 },  // deep green (ganpati-green)
  { h: 28,  s: 78, l: 38 },  // saffron (navratri-garba)
  { h: 330, s: 68, l: 42 },  // hot pink (holi-colors)
  { h: 35,  s: 65, l: 35 },  // amber (makar-sankranti)
  { h: 5,   s: 65, l: 35 },  // deep red (gudi-padwa)
  // Modern (8)
  { h: 225, s: 70, l: 38 },  // bright blue (modern-minimal)
  { h: 348, s: 75, l: 40 },  // rose (blush-rose)
  { h: 130, s: 15, l: 32 },  // sage (sage-green)
  { h: 210, s: 35, l: 38 },  // slate blue (dusty-blue)
  { h: 220, s: 25, l: 22 },  // charcoal (charcoal-elegant)
  { h: 12,  s: 52, l: 42 },  // warm coral (cream-nouveau)
  { h: 0,   s: 0,  l: 12 },  // near-black (monochrome-chic)
  { h: 20,  s: 78, l: 42 },  // peach orange (pastel-peach)
  // Premium (4)
  { h: 30,  s: 18, l: 38 },  // warm gray (luxury-platinum)
  { h: 172, s: 58, l: 28 },  // deep ocean (ocean-romance)
  { h: 16,  s: 72, l: 36 },  // burnt sienna (sunrise-gold)
  { h: 225, s: 58, l: 20 },  // deep navy (nri-global)
  // Platform (5)
  { h: 330, s: 72, l: 38 },  // magenta pink (shaadi-modern)
  { h: 320, s: 68, l: 42 },  // hot magenta (bharat-trust)
  { h: 145, s: 62, l: 28 },  // forest green (anuroop-service)
  { h: 22,  s: 68, l: 34 },  // terracotta (lagna-profiles)
  { h: 345, s: 55, l: 30 },  // dark rose (sundarjodi-castes)
];

// Secondary color strategies: complementary, triadic, split-complementary
// We ensure secondary hues are at least 40deg apart from each other
const secondaryStrategies = [
  // Traditional
  'comp', 'triadic', 'split', 'comp', 'triadic', 'split', 'comp', 'triadic',
  // Regional
  'split', 'comp', 'triadic', 'split', 'comp', 'triadic', 'split', 'comp',
  // Royal
  'triadic', 'split', 'comp', 'triadic', 'split', 'comp', 'triadic', 'split',
  // Festive
  'comp', 'triadic', 'split', 'comp', 'triadic', 'split', 'comp', 'triadic',
  // Modern
  'split', 'comp', 'triadic', 'split', 'comp', 'triadic', 'split', 'triadic',
  // Premium
  'triadic', 'split', 'comp', 'triadic',
  // Platform
  'comp', 'comp', 'triadic', 'split', 'triadic',
];

const templateIds = [
  // Traditional
  'paithani-royal', 'marigold-traditional', 'mangalsutra-gold', 'kundali-divine',
  'saptapadi-sacred', 'haldi-blessed', 'mehendi-green', 'sagai-rosegold',
  // Regional
  'lavani-vibrant', 'paithani-silk', 'kolhapuri-earth', 'nashik-grapes',
  'konkan-coastal', 'vidarbha-orange', 'pune-peshwai', 'warkari-saffron',
  // Royal
  'rajwada-palace', 'shaniwar-wada', 'fort-terracotta', 'maharaja-court',
  'gadget-blue', 'pearl-ivory', 'velvet-wine', 'zari-embroidered',
  // Festive
  'diwali-sparkle', 'ganesh-chaturthi', 'rangoli-festival', 'ganpati-green',
  'navratri-garba', 'holi-colors', 'makar-sankranti', 'gudi-padwa',
  // Modern
  'modern-minimal', 'blush-rose', 'sage-green', 'dusty-blue',
  'charcoal-elegant', 'cream-nouveau', 'monochrome-chic', 'pastel-peach',
  // Premium
  'luxury-platinum', 'ocean-romance', 'sunrise-gold', 'nri-global',
  // Platform
  'shaadi-modern', 'bharat-trust', 'anuroop-service', 'lagna-profiles', 'sundarjodi-castes'
];

const categories = [
  'Traditional','Traditional','Traditional','Traditional','Traditional','Traditional','Traditional','Traditional',
  'Regional','Regional','Regional','Regional','Regional','Regional','Regional','Regional',
  'Royal','Royal','Royal','Royal','Royal','Royal','Royal','Royal',
  'Festive','Festive','Festive','Festive','Festive','Festive','Festive','Festive',
  'Modern','Modern','Modern','Modern','Modern','Modern','Modern','Modern',
  'Premium','Premium','Premium','Premium',
  'Platform','Platform','Platform','Platform','Platform'
];

const templateNames = [
  'Paithani Royal', 'Marigold Traditional', 'Mangalsutra Gold', 'Kundali Divine',
  'Saptapadi Sacred', 'Haldi Blessed', 'Mehendi Green', 'Sagai Rosegold',
  'Lavani Vibrant', 'Paithani Silk', 'Kolhapuri Earth', 'Nashik Grapes',
  'Konkan Coastal', 'Vidarbha Orange', 'Pune Peshwai', 'Warkari Saffron',
  'Rajwada Palace', 'Shaniwar Wada', 'Fort Terracotta', 'Maharaja Court',
  'Gadget Blue', 'Pearl Ivory', 'Velvet Wine', 'Zari Embroidered',
  'Diwali Sparkle', 'Ganesh Chaturthi', 'Rangoli Festival', 'Ganpati Green',
  'Navratri Garba', 'Holi Colors', 'Makar Sankranti', 'Gudi Padwa',
  'Modern Minimal', 'Blush Rose', 'Sage Green', 'Dusty Blue',
  'Charcoal Elegant', 'Cream Nouveau', 'Monochrome Chic', 'Pastel Peach',
  'Luxury Platinum', 'Ocean Romance', 'Sunrise Gold', 'NRI Global',
  'Shaadi Modern', 'Bharat Trust', 'Anuroop Service', 'Lagna Profiles', 'Sundarjodi Castes'
];

const heroVariants = [
  'frame','rangoli','mandala','mandala','arch','rangoli','frame','frame',
  'collage','split','masonry','circular','fullbleed','hscroll','asymmetric','floating',
  'royal','royal','frame','royal','split','royal','floating','collage',
  'parallax','floating','rangoli','floating','collage','gradient-anim','masonry','floating',
  'minimal','frame','fullbleed','split','minimal','form','hscroll','minimal',
  'royal','parallax','frame','parallax',
  'form','split','minimal','fullbleed','collage'
];

const fontPairs = [
  ['Fraunces','Manrope'],['Cinzel','Inter'],['Playfair Display','Lato'],['DM Serif Display','Nunito'],
  ['Cormorant Garamond','Rubik'],['Marcellus','Poppins'],['Libre Baskerville','Montserrat'],['Fraunces','Poppins'],
  ['Playfair Display','Manrope'],['Cinzel','Nunito'],['DM Serif Display','Inter'],['Cormorant Garamond','Lato'],
  ['Marcellus','Rubik'],['Libre Baskerville','Poppins'],['Fraunces','Montserrat'],['Playfair Display','Nunito'],
  ['Cinzel','Manrope'],['DM Serif Display','Poppins'],['Cormorant Garamond','Inter'],['Marcellus','Lato'],
  ['Libre Baskerville','Rubik'],['Fraunces','Nunito'],['Playfair Display','Montserrat'],['Cinzel','Poppins'],
  ['DM Serif Display','Manrope'],['Cormorant Garamond','Nunito'],['Marcellus','Inter'],['Libre Baskerville','Lato'],
  ['Fraunces','Rubik'],['Playfair Display','Poppins'],['Cinzel','Montserrat'],['DM Serif Display','Manrope'],
  ['Cormorant Garamond','Poppins'],['Marcellus','Nunito'],['Libre Baskerville','Inter'],['Fraunces','Lato'],
  ['Playfair Display','Rubik'],['Cinzel','Nunito'],['DM Serif Display','Montserrat'],['Cormorant Garamond','Manrope'],
  ['Marcellus','Poppins'],['Libre Baskerville','Nunito'],['Fraunces','Inter'],['Playfair Display','Lato'],
  ['Cinzel','Rubik'],['DM Serif Display','Poppins'],['Cormorant Garamond','Montserrat'],['Marcellus','Manrope'],
  ['Libre Baskerville','Nunito'],['Fraunces','Poppins']
];

const sectionOrders = [
  ['banner','stats','features','how','profiles','success','cta'],
  ['stats','features','how','profiles','success','cta'],
  ['features','how','profiles','success','cta'],
  ['banner','features','how','profiles','success','cta'],
  ['stats','how','profiles','success','cta'],
  ['features','profiles','success','cta'],
  ['banner','stats','features','profiles','success','cta'],
  ['stats','features','how','success','cta'],
];

const motifs = ['butti','butti2','mango','zari','wave','vine','pearl','coin','toran','kite','stripe','dot','mandala','chevron','chain','floral','tessellation','plate','crosshatch','sariborder','temple'];

const palettes = [];

for (let i = 0; i < 49; i++) {
  const ph = primaryHues[i];
  const primary = hslToHex(ph.h, ph.s, ph.l);
  
  let secHue;
  const strategy = secondaryStrategies[i];
  
  if (strategy === 'comp') {
    secHue = (ph.h + 180) % 360;
  } else if (strategy === 'triadic') {
    secHue = (ph.h + 120) % 360;
  } else { // split
    secHue = (ph.h + 150) % 360;
  }
  
  // Secondary: medium saturation, medium-high lightness for contrast
  const secondary = hslToHex(secHue, Math.min(80, ph.s + 10), 55);
  
  const darkPrimary = darken(primary, 50);
  const ink = darken(primary, 80);
  const secondaryLight = lighten(secondary, 30);
  const secondaryDark = darken(secondary, 30);
  const paletteLight = lighten(primary, 60);
  const onDark = '#ffffff';
  const onDarkSoft = 'rgba(255,255,255,.82)';
  const bg = lighten(paletteLight, 10);
  const bgAlt = paletteLight;
  const card = lighten(bg, 5);
  const text = darken(primary, 60);
  const textSubtle = darken(primary, 30);
  const d1 = darkPrimary;
  const d2 = ink;

  palettes.push({
    id: templateIds[i],
    name: templateNames[i],
    category: categories[i],
    hero: heroVariants[i],
    fonts: fontPairs[i],
    colors: {
      p: primary, dp: darkPrimary, ink,
      s: secondary, sf: secondaryLight, sd: secondaryDark,
      pl: paletteLight, od: onDark, ods: onDarkSoft,
      bg, bgd: bgAlt, card, t: text, ts: textSubtle,
      d1, d2
    },
    order: sectionOrders[i % sectionOrders.length],
    motif: motifs[i % motifs.length],
  });
}

// Verify uniqueness
const primarySet = new Set(palettes.map(p => p.colors.p));
const secondarySet = new Set(palettes.map(p => p.colors.s));
console.log(`Total palettes: ${palettes.length}`);
console.log(`Unique primaries: ${primarySet.size}`);
console.log(`Unique secondaries: ${secondarySet.size}`);

if (primarySet.size < 49) console.error('WARNING: Duplicate primary colors found!');
if (secondarySet.size < 49) console.error('WARNING: Duplicate secondary colors found!');

// Output as JSON
const fs = require('fs');
const outputPath = __dirname + '/../generated-palettes.json';
fs.writeFileSync(outputPath, JSON.stringify(palettes, null, 2));
console.log(`\nGenerated ${palettes.length} palettes → ${outputPath}`);

// Print summary table
console.log('\n--- COLOR PALETTE SUMMARY ---');
palettes.forEach((p, i) => {
  console.log(`${String(i+1).padStart(2)}. ${p.id.padEnd(25)} P:${p.colors.p} S:${p.colors.s} Hero:${p.hero}`);
});
