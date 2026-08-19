import { Component, ChangeDetectionStrategy, Input, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  APPROVED_TEMPLATES,
  LandingTemplate,
  TemplateOverrides,
  resolveTemplateStyleVars,
} from '@org/landing-templates';

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop`;

const IMG = {
  hero: [
    'photo-1741201864879-c5e7f81c98b0',
    'photo-1602631985686-1bb0e6a8696e',
    'photo-1511795409834-ef04bbd61622',
    'photo-1522673607200-164d1b6ce486',
    'photo-1587271407850-8d438ca9fdf2',
    'photo-1465495976277-4387d4b0b4c6',
    'photo-1607330289024-1535c6b4e1c1',
    'photo-1519741497674-611481863552',
  ],
  brides: [
    'photo-1531123897727-8f129e1688ce',
    'photo-1589156280159-27698a70f29e',
    'photo-1607330289024-1535c6b4e1c1',
    'photo-1531746020798-e6953c6e8e04',
    'photo-1587271407850-8d438ca9fdf2',
    'photo-1465495976277-4387d4b0b4c6',
  ],
  grooms: [
    'photo-1583394838336-acd977736f90',
    'photo-1568602471122-7832951cc4c5',
    'photo-1506794778202-cad84cf45f1d',
    'photo-1635488640163-e5f6782cda6e',
    'photo-1520854221256-17451cc331bf',
    'photo-1519225421980-715cb0215aed',
  ],
  stories: [
    'photo-1519741497674-611481863552',
    'photo-1587271407850-8d438ca9fdf2',
    'photo-1465495976277-4387d4b0b4c6',
    'photo-1583939003579-730e3918a45a',
    'photo-1602631985686-1bb0e6a8696e',
    'photo-1511795409834-ef04bbd61622',
  ],
};

const TRUST: string[] = [
  'badge-check',
  '100% Verified Profiles',
  'shield-check',
  'Privacy Protected',
  'heart-handshake',
  'Family-Focused Matching',
];

const FEATURES: { icon: string; title: string; text: string }[] = [
  { icon: 'user-check', title: 'Verified by Hand', text: 'Every profile is personally screened so families only meet genuine, documented matches.' },
  { icon: 'sparkles', title: 'Culturally Curated', text: 'Matches aligned to caste, horoscope, region and family values — the way elders expect.' },
  { icon: 'lock', title: 'Privacy First', text: 'Family details and photos are never shared without explicit consent.' },
];

const STEPS: { title: string; text: string }[] = [
  { title: 'Create a Profile', text: 'Share family details, education and preferences in minutes.' },
  { title: 'Receive Matches', text: 'Get hand-picked suggestions reviewed by our match experts.' },
  { title: 'Celebrate Together', text: 'Meet families and begin your lifelong union.' },
];

const STORIES: { name: string; meta: string; quote: string; image: number }[] = [
  { name: 'Ashwini & Kedar', meta: 'Married Nov 2025 · Pune', quote: 'Our families connected within two weeks. The verification team gave everyone complete confidence.', image: 0 },
  { name: 'Meera & Sahil', meta: 'Married Jan 2026 · Mumbai', quote: 'Horoscope matching and family meetings were handled so respectfully. The traditional way, done right.', image: 1 },
  { name: 'Priya & Arjun', meta: 'Married Mar 2026 · Nashik', quote: 'From first meeting to mangalsutra in six months. Our families are grateful for such a caring platform.', image: 2 },
];

const WHY_ITEMS: { icon: string; title: string; text: string }[] = [
  { icon: 'sparkles', title: 'AI-Powered Matching', text: 'Smart algorithms learn your family\u2019s preferences and surface truly compatible profiles.' },
  { icon: 'shield-check', title: 'Rigorous Verification', text: 'Every profile is screened and mobile-verified before it reaches you.' },
  { icon: 'heart-handshake', title: 'Personal Assistance', text: 'Dedicated relationship managers guide parents at every step.' },
  { icon: 'users', title: '5 Lakh+ Happy Stories', text: 'Real Marathi couples found their life partner on our platform.' },
  { icon: 'badge-check', title: 'Trusted for 26 Years', text: 'The most trusted Marathi matrimony service, generation after generation.' },
  { icon: 'map-pin', title: 'Melavas Across Maharashtra', text: 'Attend community meetups and family introductions near you, in person.' },
];

const CASTES: string[] = [
  'Deshastha Brahmin', '96 Kuli Maratha', 'Maratha', 'Kunbi', 'CKP', 'Pathare Prabhu',
  'Somvanshi Kshatriya', 'Chandraseniya Kayastha', 'Agri', 'Bhandari', 'Vani', 'Gurav',
  'Sonar', 'Koli', 'Mali', 'Dhangar', 'Teli', 'Shimpi', 'Lohar', 'Vaishya', 'Jain',
  'Neo Buddhist', 'Sutar', 'Nhavi', 'Gavandi', 'Kumbhar',
];

const EVENTS: { day: string; month: string; title: string; place: string }[] = [
  { day: '8', month: 'Aug', title: 'Shubh Aarambh (Marathi)', place: 'Pune · Vadhu-var meetup for all castes' },
  { day: '22', month: 'Aug', title: 'Shubh Aarambh (Marathi)', place: 'Mumbai · Family introductions' },
  { day: '30', month: 'Aug', title: 'Lagna Tharavtana', place: 'Counselling workshop for parents' },
  { day: '20', month: 'Sep', title: 'New York Meet Up', place: 'NRI Marathi community gathering' },
];

const DEFAULT_STATS: { value: string; label: string }[] = [
  { value: '50K+', label: 'Brides' },
  { value: '48K+', label: 'Grooms' },
  { value: '30K+', label: 'Weddings' },
  { value: '4.9\u2605', label: 'Family Rating' },
];

const ICONS: Record<string, string> = {
  'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  'heart-handshake': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/>',
  'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
  sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01Z"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  apple: '<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-template-preview',
  standalone: true,
  template: `
    <div class="tpl-root tpl-wrap" [attr.data-tpl]="tpl.id" [style]="hostStyle">
      @for (section of sections; track section) {
        @switch (section) {
          @case ('nav') {
            <div class="tpl-nav" [style]="navDark ? 'background:var(--tp-ink)' : ''">
              <div class="nav-brand">
                <span class="nav-logo">{{ brandLetter }}</span>
                <span>{{ brandName }}</span>
              </div>
              <div class="nav-links">
                <a href="#">Home</a>
                <a href="#">Search</a>
                <a href="#">How It Works</a>
                <a href="#">Plans</a>
                <a href="#">Contact</a>
              </div>
              <div class="nav-right">
                <a class="nav-login" href="#" [style]="navDark ? 'color:var(--tp-od)' : 'color:var(--tp-p)'">Login</a>
                <a class="tbtn btn-{{ tpl.btn }} btn-sm" href="#">Register Free</a>
              </div>
            </div>
          }
          @case ('hero') {
            @switch (tpl.hero) {
              @case ('frame') {
                <header class="hero tsec {{ heroDark ? 'dark' : '' }}">
                  <div class="hero-frame {{ heroDark ? '' : 'on-light' }}">
                    <div style="position:relative;z-index:2">
                      <div class="eyebrow {{ heroDark ? 'on-dark' : '' }}">{{ eyebrowText }}</div>
                      <div style="height:14px"></div>
                      <h1 [innerHTML]="heroH1Html"></h1>
                      <p class="hero-sub {{ heroDark ? 'on-dark-soft' : '' }}">{{ heroSub }}</p>
                      <div class="hero-ctas">
                        <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                        <a class="tbtn {{ heroDark ? 'btn-ghost' : 'btn-ghost-dark' }}" href="#">{{ cta2 }}</a>
                      </div>
                      <div class="hero-trust {{ heroDark ? 'on-dark-soft' : '' }}">
                        @for (tr of heroTrust; track tr.label) {
                          <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                        }
                      </div>
                      <div class="hero-grid {{ tpl.gridVar || 'gold-ring' }}">
                        @for (img of heroImages; track img) {
                          <img [src]="img" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                        }
                      </div>
                    </div>
                  </div>
                </header>
              }
              @case ('royal') {
                <header class="hero tsec {{ heroDark ? 'dark' : '' }}">
                  <div class="hero-frame {{ heroDark ? '' : 'on-light' }}">
                    <div style="position:relative;z-index:2">
                      <div class="eyebrow {{ heroDark ? 'on-dark' : '' }}">{{ eyebrowText }}</div>
                      <div style="height:14px"></div>
                      <h1 [innerHTML]="heroH1Html"></h1>
                      <p class="hero-sub {{ heroDark ? 'on-dark-soft' : '' }}">{{ heroSub }}</p>
                      <div class="hero-ctas">
                        <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                        <a class="tbtn {{ heroDark ? 'btn-ghost' : 'btn-ghost-dark' }}" href="#">{{ cta2 }}</a>
                      </div>
                      <div class="hero-trust {{ heroDark ? 'on-dark-soft' : '' }}">
                        @for (tr of heroTrust; track tr.label) {
                          <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                        }
                      </div>
                      <div class="hero-grid {{ tpl.gridVar || 'gold-ring' }}">
                        @for (img of heroImages; track img) {
                          <img [src]="img" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                        }
                      </div>
                    </div>
                  </div>
                </header>
              }
              @case ('rangoli') {
                <header class="hero tsec {{ heroDark ? 'dark' : '' }}">
                  <div class="hero-orn"><div class="orn orn-rangoli" style="width:130px;height:130px"></div></div>
                  <div class="eyebrow {{ heroDark ? 'on-dark' : '' }}">{{ eyebrowText }}</div>
                  <div style="height:12px"></div>
                  <h1 [innerHTML]="heroH1Html"></h1>
                  <p class="hero-sub {{ heroDark ? 'on-dark-soft' : '' }}">{{ heroSub }}</p>
                  <div class="hero-ctas">
                    <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                    <a class="tbtn {{ heroDark ? 'btn-ghost' : 'btn-ghost-dark' }}" href="#">{{ cta2 }}</a>
                  </div>
                  <div class="hero-trust {{ heroDark ? 'on-dark-soft' : '' }}">
                    @for (tr of heroTrust; track tr.label) {
                      <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                    }
                  </div>
                  <div class="hero-grid {{ tpl.gridVar || 'gold-ring' }}">
                    @for (img of heroImages; track img) {
                      <img [src]="img" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                    }
                  </div>
                </header>
              }
              @case ('mandala') {
                <header class="hero tsec {{ heroDark ? 'dark' : '' }}">
                  <div class="hero-orn"><div class="orn orn-mandala"></div></div>
                  <div class="eyebrow {{ heroDark ? 'on-dark' : '' }}">{{ eyebrowText }}</div>
                  <div style="height:12px"></div>
                  <h1 [innerHTML]="heroH1Html"></h1>
                  <p class="hero-sub {{ heroDark ? 'on-dark-soft' : '' }}">{{ heroSub }}</p>
                  <div class="hero-ctas">
                    <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                    <a class="tbtn {{ heroDark ? 'btn-ghost' : 'btn-ghost-dark' }}" href="#">{{ cta2 }}</a>
                  </div>
                  <div class="hero-trust {{ heroDark ? 'on-dark-soft' : '' }}">
                    @for (tr of heroTrust; track tr.label) {
                      <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                    }
                  </div>
                  <div class="hero-grid {{ tpl.gridVar || 'gold-ring' }}">
                    @for (img of heroImages; track img) {
                      <img [src]="img" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                    }
                  </div>
                </header>
              }
              @case ('arch') {
                <header class="hero tsec {{ heroDark ? 'dark' : '' }}">
                  <img class="hero-arch-img" [src]="heroArchImage" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                  <div class="eyebrow {{ heroDark ? 'on-dark' : '' }}">{{ eyebrowText }}</div>
                  <h1 [innerHTML]="heroH1Html"></h1>
                  <p class="hero-sub {{ heroDark ? 'on-dark-soft' : '' }}">{{ heroSub }}</p>
                  <div class="hero-ctas">
                    <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                    <a class="tbtn {{ heroDark ? 'btn-ghost' : 'btn-ghost-dark' }}" href="#">{{ cta2 }}</a>
                  </div>
                  <div class="hero-trust {{ heroDark ? 'on-dark-soft' : '' }}">
                    @for (tr of heroTrust; track tr.label) {
                      <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                    }
                  </div>
                </header>
              }
              @case ('collage') {
                <header class="hero tsec {{ heroDark ? 'dark' : '' }}">
                  <div class="eyebrow {{ heroDark ? 'on-dark' : '' }}">{{ eyebrowText }}</div>
                  <h1 [innerHTML]="heroH1Html"></h1>
                  <p class="hero-sub {{ heroDark ? 'on-dark-soft' : '' }}">{{ heroSub }}</p>
                  <div class="hero-ctas">
                    <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                    <a class="tbtn {{ heroDark ? 'btn-ghost' : 'btn-ghost-dark' }}" href="#">{{ cta2 }}</a>
                  </div>
                  <div class="hero-trust {{ heroDark ? 'on-dark-soft' : '' }}">
                    @for (tr of heroTrust; track tr.label) {
                      <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                    }
                  </div>
                  <div class="hero-grid {{ tpl.gridVar || 'gold-ring' }}">
                    @for (img of heroImages; track img) {
                      <img [src]="img" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                    }
                  </div>
                </header>
              }
              @case ('split') {
                <header class="hero tsec {{ heroDark ? 'dark' : '' }}">
                  <div class="hero-split">
                    <div>
                      <div class="eyebrow {{ heroDark ? 'on-dark' : '' }}">{{ eyebrowText }}</div>
                      <h1 [innerHTML]="heroH1Html"></h1>
                      <p class="hero-sub {{ heroDark ? 'on-dark-soft' : '' }}">{{ heroSub }}</p>
                      <div class="hero-ctas">
                        <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                        <a class="tbtn {{ heroDark ? 'btn-ghost' : 'btn-outline' }}" href="#">{{ cta2 }}</a>
                      </div>
                      <div class="hero-trust {{ heroDark ? 'on-dark-soft' : '' }}">
                        @for (tr of heroTrust; track tr.label) {
                          <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                        }
                      </div>
                    </div>
                    <div class="hero-stack">
                      @for (img of heroSplitImages; track img) {
                        <img [src]="img" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                      }
                    </div>
                  </div>
                </header>
              }
              @case ('fullbleed') {
                <header class="hero tsec" [style]="'background-image:' + heroFullbleedBg">
                  <div class="tsec-inner hero-fullbleed" style="padding:120px 24px 96px">
                    <div class="hero-orn"><div class="orn {{ heroOrnClass || 'orn-rangoli' }}" style="width:110px;height:110px;opacity:.9"></div></div>
                    <div class="eyebrow on-dark">{{ eyebrowText }}</div>
                    <h1 [innerHTML]="heroH1Html"></h1>
                    <p class="hero-sub on-dark-soft">{{ heroSub }}</p>
                    <div class="hero-ctas">
                      <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                      <a class="tbtn btn-ghost" href="#">{{ cta2 }}</a>
                    </div>
                    <div class="hero-trust on-dark-soft">
                      @for (tr of heroTrust; track tr.label) {
                        <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                      }
                    </div>
                  </div>
                </header>
              }
              @case ('parallax') {
                <header class="hero tsec hero-parallax" [style]="'background-image:' + heroParallaxBg">
                  <div class="tsec-inner" style="position:relative;z-index:2;padding:120px 24px 100px">
                    <div class="eyebrow on-dark">{{ eyebrowText }}</div>
                    <div style="height:14px"></div>
                    <h1 [innerHTML]="heroH1Html"></h1>
                    <p class="hero-sub on-dark-soft">{{ heroSub }}</p>
                    <div class="hero-ctas">
                      <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                      <a class="tbtn btn-ghost" href="#">{{ cta2 }}</a>
                    </div>
                    <div class="hero-trust on-dark-soft">
                      @for (tr of heroTrust; track tr.label) {
                        <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                      }
                    </div>
                  </div>
                </header>
              }
              @case ('gradient-anim') {
                <header class="hero tsec hero-gradient-anim" style="padding:120px 24px 100px">
                  <div class="eyebrow on-dark">{{ eyebrowText }}</div>
                  <div style="height:14px"></div>
                  <h1 style="color:#fff" [innerHTML]="heroH1Html"></h1>
                  <p class="hero-sub on-dark-soft">{{ heroSub }}</p>
                  <div class="hero-ctas">
                    <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                    <a class="tbtn btn-ghost" href="#">{{ cta2 }}</a>
                  </div>
                  <div class="hero-trust on-dark-soft">
                    @for (tr of heroTrust; track tr.label) {
                      <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                    }
                  </div>
                </header>
              }
              @case ('masonry') {
                <header class="hero tsec">
                  <div class="eyebrow">{{ eyebrowText }}</div>
                  <div style="height:14px"></div>
                  <h1 [innerHTML]="heroH1Html"></h1>
                  <p class="hero-sub">{{ heroSub }}</p>
                  <div class="hero-ctas">
                    <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                    <a class="tbtn btn-ghost-dark" href="#">{{ cta2 }}</a>
                  </div>
                  <div class="hero-trust">
                    @for (tr of heroTrust; track tr.label) {
                      <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                    }
                  </div>
                  <div class="hero-masonry">
                    @for (img of heroImages; track img) {
                      <img [src]="img" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                    }
                  </div>
                </header>
              }
              @case ('circular') {
                <header class="hero tsec">
                  <div class="eyebrow">{{ eyebrowText }}</div>
                  <div style="height:14px"></div>
                  <h1 [innerHTML]="heroH1Html"></h1>
                  <p class="hero-sub">{{ heroSub }}</p>
                  <div class="hero-ctas">
                    <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                    <a class="tbtn btn-ghost-dark" href="#">{{ cta2 }}</a>
                  </div>
                  <div class="hero-circular">
                    @for (img of heroImages; track img) {
                      <img [src]="img" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                    }
                  </div>
                </header>
              }
              @case ('hscroll') {
                <header class="hero tsec">
                  <div class="eyebrow">{{ eyebrowText }}</div>
                  <div style="height:14px"></div>
                  <h1 [innerHTML]="heroH1Html"></h1>
                  <p class="hero-sub">{{ heroSub }}</p>
                  <div class="hero-ctas">
                    <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                    <a class="tbtn btn-ghost-dark" href="#">{{ cta2 }}</a>
                  </div>
                  <div class="hero-hscroll" style="max-width:1140px;margin:36px auto 0;padding:0 24px">
                    @for (img of heroImages; track img) {
                      <img [src]="img" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                    }
                  </div>
                </header>
              }
              @case ('asymmetric') {
                <header class="hero tsec">
                  <div class="hero-asymmetric {{ heroAsymmetricReverse ? 'reverse' : '' }}">
                    <div>
                      <div class="eyebrow">{{ eyebrowText }}</div>
                      <h1 [innerHTML]="heroH1Html"></h1>
                      <p class="hero-sub">{{ heroSub }}</p>
                      <div class="hero-ctas">
                        <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                        <a class="tbtn btn-ghost-dark" href="#">{{ cta2 }}</a>
                      </div>
                      <div class="hero-trust">
                        @for (tr of heroTrust; track tr.label) {
                          <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                        }
                      </div>
                    </div>
                    <div>
                      <img [src]="heroArchImage" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                    </div>
                  </div>
                </header>
              }
              @case ('floating') {
                <header class="hero tsec hero-floating">
                  <div class="float-el"></div>
                  <div class="float-el"></div>
                  <div class="float-el"></div>
                  <div class="float-el"></div>
                  <div class="eyebrow">{{ eyebrowText }}</div>
                  <div style="height:14px"></div>
                  <h1 [innerHTML]="heroH1Html"></h1>
                  <p class="hero-sub">{{ heroSub }}</p>
                  <div class="hero-ctas">
                    <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                    <a class="tbtn btn-ghost-dark" href="#">{{ cta2 }}</a>
                  </div>
                  <div class="hero-trust">
                    @for (tr of heroTrust; track tr.label) {
                      <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                    }
                  </div>
                </header>
              }
              @case ('form') {
                <header class="hero tsec">
                  <div class="hero-form">
                    <div>
                      <div class="eyebrow">{{ eyebrowText }}</div>
                      <h1 [innerHTML]="heroH1Html"></h1>
                      <p class="hero-sub">{{ heroSub }}</p>
                      <div class="hero-ctas">
                        <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                        <a class="tbtn btn-ghost-dark" href="#">{{ cta2 }}</a>
                      </div>
                      <div class="hero-trust">
                        @for (tr of heroTrust; track tr.label) {
                          <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                        }
                      </div>
                      <div class="divider {{ motifDividerClass }} hero-rule"></div>
                    </div>
                    <div class="searchpanel">
                      <h4>{{ tpl.formTitle || 'Create Free Matrimony Profile' }}</h4>
                      <p class="sp-sub">{{ tpl.formSub || 'Join lakhs of happy Marathi families. Free forever.' }}</p>
                      <div class="sp-field">
                        <div class="pill-group">
                          <div class="pill {{ !formForGroom ? 'active' : '' }}">Bride</div>
                          <div class="pill {{ formForGroom ? 'active' : '' }}">Groom</div>
                        </div>
                      </div>
                      <div class="sp-field">
                        <label for="tpl-preview-looking">Looking for</label>
                        <select class="sp-select" id="tpl-preview-looking">
                          <option>{{ (formForGroom ? 'Bride' : 'Groom') + ' aged 22 - 30' }}</option>
                          <option>{{ (formForGroom ? 'Bride' : 'Groom') + ' aged 31 - 40' }}</option>
                        </select>
                      </div>
                      <div class="sp-field">
                        <label for="tpl-preview-caste">Caste / Community</label>
                        <select class="sp-select" id="tpl-preview-caste">
                          <option>Any Marathi community</option>
                          <option>Maratha / 96 Kuli</option>
                        </select>
                      </div>
                      <a class="tbtn btn-{{ tpl.btn }} formbtn" href="#">{{ cta1 }}</a>
                      <div class="mini-stat">
                        <div><b>5L+</b><span>Happy Stories</span></div>
                        <div><b>350L+</b><span>Members</span></div>
                        <div><b>100%</b><span>Mobile-verified</span></div>
                      </div>
                    </div>
                  </div>
                </header>
              }
              @default {
                <header class="hero tsec {{ heroDark ? 'dark' : '' }}">
                  <div class="eyebrow {{ heroDark ? 'on-dark' : '' }}">{{ eyebrowText }}</div>
                  <h1 [innerHTML]="heroH1Html"></h1>
                  <p class="hero-sub {{ heroDark ? 'on-dark-soft' : '' }}">{{ heroSub }}</p>
                  <div class="hero-ctas">
                    <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                    <a class="tbtn {{ heroDark ? 'btn-ghost' : 'btn-outline' }}" href="#">{{ cta2 }}</a>
                  </div>
                  <div class="hero-trust {{ heroDark ? 'on-dark-soft' : '' }}">
                    @for (tr of heroTrust; track tr.label) {
                      <span><span [innerHTML]="icon(tr.icon)"></span>{{ tr.label }}</span>
                    }
                  </div>
                  <div class="divider {{ motifDividerClass }} hero-rule"></div>
                </header>
              }
            }
          }
          @case ('banner') {
            @if (tpl.banner !== false) {
              <section class="banner tsec">
                <img class="banner-bgimg" [src]="bannerImg" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                <div class="divider m-butti banner-top"></div>
                <div class="banner-inner">
                  <div class="eyebrow" style="color:var(--tp-sf);justify-content:center">Create a Free Matrimony Profile</div>
                  <h2>50,000+ Successful Marriages &amp; Counting</h2>
                  <p>Our community celebrates one new wedding every 15 minutes — find your soulmate among lakhs of verified Marathi profiles.</p>
                  <div class="banner-chips">
                    <span><span [innerHTML]="icon('user-check')"></span>100% Verified</span>
                    <span><span [innerHTML]="icon('shield-check')"></span>Privacy Protected</span>
                    <span><span [innerHTML]="icon('heart-handshake')"></span>Family Approved</span>
                  </div>
                  <div class="banner-ctas">
                    <a class="tbtn btn-{{ tpl.btn }}" href="#">Create Free Profile</a>
                    <a class="tbtn btn-ghost" href="#">Learn More</a>
                  </div>
                </div>
                <div class="divider m-butti banner-bottom"></div>
              </section>
            }
          }
          @case ('stats') {
            <section class="tsec {{ tpl.hero === 'frame' ? 'altsection' : '' }}">
              @if (tpl.floatingStats) {
                <div class="stats-float">
                  <div class="stats-card stats-dividers" style="box-shadow:0 22px 50px rgba(0,0,0,.12)">
                    @for (s of statCells; track s.label) {
                      <div class="stat-cell"><p class="stat-val">{{ s.value }}</p><p class="stat-lab">{{ s.label }}</p></div>
                    }
                  </div>
                </div>
              } @else if (tpl.statsDark) {
                <div class="stats-dark stats-dividers">
                  @for (s of statCells; track s.label) {
                    <div class="stat-cell"><p class="stat-val">{{ s.value }}</p><p class="stat-lab">{{ s.label }}</p></div>
                  }
                </div>
              } @else {
                <div class="stats-card stats-dividers">
                  @for (s of statCells; track s.label) {
                    <div class="stat-cell"><p class="stat-val">{{ s.value }}</p><p class="stat-lab">{{ s.label }}</p></div>
                  }
                </div>
              }
            </section>
          }
          @case ('features') {
            <section class="tsec tpy-24">
              <div class="tsec-inner ttext-center">
                <div class="eyebrow">Why Marathi Families Trust Us</div>
                <h2 class="sectitle" style="margin-top:14px">Matrimony the Way It Should Be</h2>
                <div class="divider {{ motifClass }}" style="margin-top:20px;opacity:.6"></div>
                <div class="feat-grid">
                  @for (f of featureCards; track f.title) {
                    <div class="feat-card {{ tpl.featStyle || '' }}">
                      <div class="icon-tile {{ tpl.iconRound ? 'circle' : '' }}"><span [innerHTML]="icon(f.icon)"></span></div>
                      <h3>{{ f.title }}</h3>
                      <p>{{ f.text }}</p>
                    </div>
                  }
                </div>
              </div>
            </section>
          }
          @case ('how') {
            <section class="tsec darksec tpy-24" style="position:relative;overflow:hidden">
              <div class="tsec-inner ttext-center">
                <div class="eyebrow on-dark">How It Works</div>
                <h2 class="sectitle on-dark" style="margin-top:14px">Three Simple Steps to Your Match</h2>
                <div class="steps">
                  @for (s of steps; track s.title; let i = $index) {
                    <div>
                      <div class="step-num {{ tpl.stepSolid ? 'solid' : tpl.stepLight ? 'light' : 'glass' }}">{{ i + 1 }}</div>
                      <h3 class="on-dark">{{ s.title }}</h3>
                      <p class="on-dark-soft">{{ s.text }}</p>
                    </div>
                  }
                </div>
                <div class="divider {{ motifClass }}" style="max-width:200px;margin:44px auto 0;opacity:.5"></div>
              </div>
            </section>
          }
          @case ('profiles') {
            <section class="tsec altsection tpy-24">
              <div class="tsec-inner">
                <div class="prof-head">
                  <div>
                    <div class="eyebrow">Freshly Joined Members</div>
                    <h2 class="sectitle" style="margin-top:12px">Recently Added Profiles</h2>
                  </div>
                  <a class="viewall" href="#">View all profiles <span [innerHTML]="icon('arrow-right')"></span></a>
                </div>
                <div class="prof-grid">
                  @for (p of profileCards; track p.name) {
                    <div class="prof-card">
                      <div class="prof-img-wrap">
                        <img [src]="p.img" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                        <span class="prof-badge {{ tpl.badgeWhite ? 'white' : '' }}"><span [innerHTML]="icon('badge-check')"></span>{{ p.status }}</span>
                      </div>
                      <div class="prof-body">
                        <p class="prof-name">{{ p.name }}</p>
                        <p class="prof-sub">{{ p.sub }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </section>
          }
          @case ('success') {
            <section class="tsec tpy-24">
              <div class="tsec-inner ttext-center">
                <div class="eyebrow">Success Stories</div>
                <h2 class="sectitle" style="margin-top:14px">A Thousand Happy Beginnings</h2>
                <div class="divider {{ motifClass }}" style="margin-top:20px;opacity:.6"></div>
                <div class="story-grid">
                  @for (s of storyCards; track s.name) {
                    <div class="story-card">
                      <img [src]="s.img" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                      <div class="story-body">
                        <div class="story-stars">
                          <span [innerHTML]="icon('star')"></span><span [innerHTML]="icon('star')"></span><span [innerHTML]="icon('star')"></span><span [innerHTML]="icon('star')"></span><span [innerHTML]="icon('star')"></span>
                        </div>
                        <h3>{{ s.name }}</h3>
                        <p class="story-meta">{{ s.meta }}</p>
                        <p class="story-quote">&ldquo;{{ s.quote }}&rdquo;</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </section>
          }
          @case ('cta') {
            <section class="tsec tpy-24">
              <div class="tsec-inner">
                @if (tpl.hero === 'minimal' || tpl.hero === 'split') {
                  <div class="cta-panel cta-border" [style]="tpl.motif !== 'none' ? 'border-top:3px solid var(--tp-s);border-bottom:3px solid var(--tp-s)' : ''">
                    <div class="divider {{ motifClass }}" style="max-width:180px;margin:0 auto 26px;opacity:.6"></div>
                    <h2>{{ ctaTitle }}</h2>
                    <p class="muted">{{ ctaSub }}</p>
                    <div class="cta-ctas">
                      <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                      <a class="tbtn btn-outline" href="#">Talk to an Advisor</a>
                    </div>
                  </div>
                } @else {
                  <div class="cta-panel darksec" [style]="tpl.motif !== 'none' ? 'border-top:3px solid var(--tp-s);border-bottom:3px solid var(--tp-s)' : ''">
                    <div class="divider {{ motifClass }}" style="max-width:180px;margin:0 auto 26px;opacity:.6"></div>
                    <h2 class="on-dark">{{ ctaTitle }}</h2>
                    <p class="on-dark-soft">{{ ctaSub }}</p>
                    <div class="cta-ctas">
                      <a class="tbtn btn-{{ tpl.btn }}" href="#">{{ cta1 }}</a>
                      <a class="tbtn btn-ghost" href="#">Talk to an Advisor</a>
                    </div>
                  </div>
                }
              </div>
            </section>
          }
          @case ('why') {
            <section class="tsec tpy-24">
              <div class="tsec-inner ttext-center">
                <div class="eyebrow">{{ tpl.whyEyebrow || 'Why Choose Us' }}</div>
                <h2 class="sectitle" style="margin-top:14px">{{ tpl.whyTitle || 'Trusted by Families, Powered by Technology' }}</h2>
                <div class="divider {{ motifClass }}" style="margin-top:20px;opacity:.6"></div>
                <div class="why-grid">
                  @for (w of whyItems; track w.title) {
                    <div class="why-card">
                      <div class="icon-tile circle" style="margin:0 auto"><span [innerHTML]="icon(w.icon)"></span></div>
                      <h3>{{ w.title }}</h3>
                      <p>{{ w.text }}</p>
                    </div>
                  }
                </div>
              </div>
            </section>
          }
          @case ('castes') {
            <section class="tsec altsection tpy-24">
              <div class="tsec-inner ttext-center">
                <div class="eyebrow">{{ tpl.casteEyebrow || 'Communities We Serve' }}</div>
                <h2 class="sectitle" style="margin-top:14px">{{ tpl.casteTitle || '200+ Marathi Castes & Communities' }}</h2>
                <div class="caste-wrap">
                  @for (c of castes; track c; let i = $index) {
                    <span class="caste-chip {{ i < 4 ? 'hot' : '' }}">{{ c }}</span>
                  }
                </div>
                <p class="muted" style="margin-top:24px;font-size:13px">{{ tpl.casteNote || 'From Brahmin to Kshatriya and every community in between — find a match who shares your heritage.' }}</p>
              </div>
            </section>
          }
          @case ('melava') {
            <section class="tsec tpy-24">
              <div class="tsec-inner ttext-center">
                <div class="eyebrow">{{ tpl.melavaEyebrow || 'Melava & Events' }}</div>
                <h2 class="sectitle" style="margin-top:14px">{{ tpl.melavaTitle || 'Meet Families In Person' }}</h2>
                <div class="event-grid">
                  @for (e of events; track e.title + e.day) {
                    <div class="event-card">
                      <div class="event-date"><b>{{ e.day }}</b><span>{{ e.month }}</span></div>
                      <h3>{{ e.title }}</h3>
                      <p>{{ e.place }}</p>
                      <span class="event-tag">View details</span>
                    </div>
                  }
                </div>
              </div>
            </section>
          }
          @case ('app') {
            <section class="tsec tpy-24">
              <div class="tsec-inner">
                <div class="appband darksec" style="position:relative;overflow:hidden">
                  <div>
                    <div class="eyebrow on-dark">{{ tpl.appEyebrow || 'Download the App' }}</div>
                    <h2 class="sectitle on-dark" style="margin-top:14px">{{ tpl.appTitle || 'Find Your Match in 30 Seconds' }}</h2>
                    <p class="on-dark-soft" style="margin-top:12px;font-size:14px;max-width:460px;line-height:1.7">{{ tpl.appSub || 'Fast, simple and delightful. The most loved Marathi matrimony app — search, chat and connect on the go.' }}</p>
                    <div class="storebtns">
                      <a class="storebtn" href="#"><span [innerHTML]="icon('smartphone')"></span> Google Play</a>
                      <a class="storebtn" href="#" style="background:#0f172a"><span [innerHTML]="icon('apple')"></span> App Store</a>
                    </div>
                  </div>
                  <div>
                    <div class="ttext-center">
                      <div class="rating" style="justify-content:center"><span class="stars">★★★★★</span><span>4.3 · 10M+ Downloads</span></div>
                      <div style="margin-top:12px;font-size:12px;color:var(--tp-ods)">Based on customer reviews</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          }
          @case ('testimonials') {
            <section class="tsec tpy-24">
              <div class="tsec-inner ttext-center">
                <div class="eyebrow">What Families Say</div>
                <h2 class="sectitle" style="margin-top:14px">Testimonials from Happy Families</h2>
                <div class="divider {{ motifClass }}" style="margin-top:20px;opacity:.6"></div>
                <div class="testimonial-track" style="margin-top:48px;max-width:720px;margin-left:auto;margin-right:auto">
                  @for (s of testimonialItems; track s.name) {
                    <div class="testimonial-item glass-card">
                      <img class="t-avatar" [src]="s.img" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                      <blockquote>"{{ s.quote }}"</blockquote>
                      <div class="t-author">{{ s.name }}</div>
                      <div class="t-role">{{ s.meta }}</div>
                    </div>
                  }
                </div>
                <div class="testimonial-dots">
                  @for (s of testimonialItems; track s.name; let i = $index) {
                    <span [class]="i === 0 ? 'active' : ''"></span>
                  }
                </div>
              </div>
            </section>
          }
          @case ('counters') {
            <section class="tsec tpy-24">
              <div class="tsec-inner ttext-center">
                <div class="eyebrow">By the Numbers</div>
                <h2 class="sectitle" style="margin-top:14px">Our Journey in Numbers</h2>
                <div class="divider {{ motifClass }}" style="margin-top:20px;opacity:.6"></div>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:26px;margin-top:48px">
                  @for (c of counterItems; track c.label) {
                    <div style="text-align:center">
                      <div class="counter-val">{{ c.value }}</div>
                      <p style="font-size:13px;color:var(--tp-ts);margin-top:8px;font-weight:600">{{ c.label }}</p>
                    </div>
                  }
                </div>
              </div>
            </section>
          }
          @case ('beforeafter') {
            <section class="tsec altsection tpy-24">
              <div class="tsec-inner ttext-center">
                <div class="eyebrow">Before &amp; After</div>
                <h2 class="sectitle" style="margin-top:14px">Transform Your Story</h2>
                <div class="divider {{ motifClass }}" style="margin-top:20px;opacity:.6"></div>
                <div class="before-after-wrap" style="max-width:640px;margin:48px auto 0;height:400px">
                  <img class="ba-after" [src]="beforeAfterImages.after" alt="" loading="lazy" [style.background]="tileBg" (error)="onImgError($event)" />
                  <div class="ba-before" style="width:50%">
                    <img [src]="beforeAfterImages.before" alt="" loading="lazy" style="width:640px;max-width:none" [style.background]="tileBg" (error)="onImgError($event)" />
                  </div>
                  <div class="ba-divider" style="left:50%"></div>
                  <div class="ba-handle" style="left:50%">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 4l-6 8 6 8"/><path d="M16 4l6 8-6 8"/></svg>
                  </div>
                </div>
              </div>
            </section>
          }
          @case ('footer') {
            <footer class="tpl-footer darksec">
              <div class="foot-grid">
                <div>
                  <div class="foot-brand"><span class="nav-logo" style="background:var(--tp-sf);color:var(--tp-p)">{{ brandLetter }}</span>{{ brandName }}</div>
                  <p class="foot-blurb">{{ footerBlurb }}</p>
                </div>
                <div>
                  <h4>Find a Match</h4>
                  <ul>
                    <li><a href="#">Brides</a></li>
                    <li><a href="#">Grooms</a></li>
                    <li><a href="#">NRI Profiles</a></li>
                    <li><a href="#">Horoscope Matching</a></li>
                  </ul>
                </div>
                <div>
                  <h4>Community</h4>
                  <ul>
                    <li><a href="#">Success Stories</a></li>
                    <li><a href="#">Matrimonial Events</a></li>
                    <li><a href="#">Blog</a></li>
                    <li><a href="#">Help &amp; Support</a></li>
                  </ul>
                </div>
                <div>
                  <h4>Contact Us</h4>
                  <ul class="foot-contact">
                    <li><span [innerHTML]="icon('phone')"></span>+91 98765 43210</li>
                    <li><span [innerHTML]="icon('mail')"></span>care@matrimony.com</li>
                  </ul>
                </div>
              </div>
              <div class="foot-bottom">
                <p>© {{ year }} {{ brandName }}. All rights reserved.</p>
                <p>
                  <a href="#">Privacy Policy</a>
                  <a href="#">Terms &amp; Conditions</a>
                  <a href="#">Refund Policy</a>
                </p>
              </div>
            </footer>
          }
        }
      }
    </div>
  `,
})
export class TemplatePreviewComponent implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);

  @Input({ required: true }) tpl!: LandingTemplate;
  @Input() overrides: TemplateOverrides = {};

  ngOnInit(): void {
    this.loadTemplateFonts();
  }

  get year(): number {
    return new Date().getFullYear();
  }

  get hostStyle(): Record<string, string> {
    const { vars } = resolveTemplateStyleVars(this.tpl, this.overrides);
    const style: Record<string, string> = {};
    for (const key of Object.keys(vars)) {
      style[`--${key}`] = vars[key];
    }
    return style;
  }

  get sections(): string[] {
    return ['nav', 'hero', ...this.tpl.order, 'footer'];
  }

  get brandName(): string {
    return `${this.tpl.brand} Matrimony`;
  }

  get brandLetter(): string {
    return this.brandName.trim().charAt(0).toUpperCase() || 'M';
  }

  get navDark(): boolean {
    return typeof this.tpl.nav === 'object' && !!this.tpl.nav?.dark;
  }

  get eyebrowText(): string {
    return this.tpl.eyebrow || '';
  }

  get heroH1Html(): SafeHtml {
    const title = this.tpl.h1 || this.brandName;
    return this.sanitizer.bypassSecurityTrustHtml(title);
  }

  get heroSub(): string {
    return this.tpl.sub || 'Find your perfect life partner among lakhs of verified families, the way elders expect.';
  }

  get cta1(): string {
    return this.tpl.cta1 || 'Register Free';
  }

  get cta2(): string {
    return this.tpl.cta2 || 'Search Matches';
  }

  get heroDark(): boolean {
    return !!this.tpl.darkHero;
  }

  get heroOrnClass(): string {
    return this.tpl.orn === 'rangoli'
      ? 'orn-rangoli'
      : this.tpl.orn === 'kite'
        ? 'orn-kite'
        : this.tpl.orn === 'mandala'
          ? 'orn-mandala'
          : '';
  }

  get heroImages(): string[] {
    const start = (this.templateIndex() * 2) % IMG.hero.length;
    return [0, 1, 2, 3].map((i) => U(IMG.hero[(start + i) % IMG.hero.length]) + '&w=500&q=60');
  }

  get heroArchImage(): string {
    return U(IMG.hero[this.templateIndex() % IMG.hero.length]) + '&w=420&q=70';
  }

  get heroSplitImages(): string[] {
    return this.heroImages.slice(0, 3).map((s) => s.replace('&w=500', '&w=520'));
  }

  get heroFullbleedBg(): string {
    const src = this.tpl.bannerImg || IMG.hero[(this.templateIndex() + 3) % IMG.hero.length];
    const base = src.includes('://') ? src : U(src);
    return `url('${base}&w=1600&q=70'), linear-gradient(160deg,var(--tp-p),var(--tp-d1) 55%,var(--tp-d2))`;
  }

  get heroTrust(): { icon: string; label: string }[] {
    return [0, 2, 4].map((i) => ({ icon: TRUST[i], label: TRUST[i + 1] }));
  }

  get heroParallaxBg(): string {
    const src = this.tpl.bannerImg || IMG.hero[(this.templateIndex() + 3) % IMG.hero.length];
    const base = src.includes('://') ? src : U(src);
    return `url('${base}&w=1600&q=70')`;
  }

  get heroAsymmetricReverse(): boolean {
    return this.templateIndex() % 2 === 1;
  }

  get testimonialItems(): { name: string; meta: string; quote: string; img: string }[] {
    return STORIES.map((s) => ({ ...s, img: U(IMG.stories[(s.image + this.templateIndex()) % IMG.stories.length]) + '&w=200&q=60' }));
  }

  get counterItems(): { value: string; label: string }[] {
    return DEFAULT_STATS;
  }

  get beforeAfterImages(): { before: string; after: string } {
    const start = (this.templateIndex() * 2) % IMG.stories.length;
    return {
      before: U(IMG.stories[start % IMG.stories.length]) + '&w=800&q=70',
      after: U(IMG.stories[(start + 1) % IMG.stories.length]) + '&w=800&q=70',
    };
  }

  get motifDividerClass(): string {
    return this.tpl.motif === 'butti2' ? 'm-butti2' : `m-${this.tpl.motif}`;
  }

  get motifClass(): string {
    return `m-${this.tpl.motif}`;
  }

  get formForGroom(): boolean {
    return this.tpl.formFor === 'groom';
  }

  get bannerImg(): string {
    const src = this.tpl.bannerImg || IMG.hero[(this.templateIndex() + 3) % IMG.hero.length];
    const base = src.includes('://') ? src : U(src);
    return base + '&w=1920&q=70';
  }

  get statCells(): { value: string; label: string }[] {
    return DEFAULT_STATS;
  }

  get featureCards(): { icon: string; title: string; text: string }[] {
    return FEATURES;
  }

  get steps(): { title: string; text: string }[] {
    return STEPS;
  }

  get profileCards(): { name: string; sub: string; status: string; img: string }[] {
    const start = this.templateIndex();
    const names = [
      { name: 'Pranali K', sub: 'Pune · Software Engineer', status: 'Verified' },
      { name: 'Aditya S', sub: 'Mumbai · Bank Manager', status: 'Verified' },
      { name: 'Sneha J', sub: 'Nashik · Teacher', status: 'New' },
      { name: 'Rohan D', sub: 'NRI · London', status: 'New' },
    ];
    return names.map((n, i) => {
      const pool = i % 2 === 0 ? IMG.brides : IMG.grooms;
      const idx = (start + Math.floor(i / 2)) % pool.length;
      return { ...n, img: U(pool[idx]) + '&w=600&q=60' };
    });
  }

  get storyCards(): { name: string; meta: string; quote: string; img: string }[] {
    return STORIES.map((s) => ({ ...s, img: U(IMG.stories[(s.image + this.templateIndex()) % IMG.stories.length]) + '&w=700&q=60' }));
  }

  get castes(): string[] {
    return CASTES;
  }

  get events(): (typeof EVENTS)[number][] {
    return EVENTS;
  }

  get whyItems(): { icon: string; title: string; text: string }[] {
    return WHY_ITEMS;
  }

  get ctaTitle(): string {
    return "Your Family's Search Ends Here";
  }

  get ctaSub(): string {
    return 'Join thousands of families who found their perfect match with dignity and joy.';
  }

  get footerBlurb(): string {
    return 'The trusted matrimony platform weaving families together with tradition and trust.';
  }

  icon(name: string): SafeHtml {
    const d = ICONS[name] ?? ICONS['check'];
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`,
    );
  }

  get tileBg(): string {
    return `linear-gradient(135deg,${this.tpl.c.pl},${this.tpl.c.bg})`;
  }

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== this.fallbackImg()) {
      target.src = this.fallbackImg();
    }
  }

  private fallbackImg(): string {
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
      `<stop offset='0' stop-color='${this.tpl.c.p}'/><stop offset='1' stop-color='${this.tpl.c.ink}'/>` +
      `</linearGradient></defs>` +
      `<rect width='800' height='600' fill='url(#g)'/>` +
      `<circle cx='400' cy='300' r='150' fill='none' stroke='${this.tpl.c.s}' stroke-width='4'/>` +
      `<circle cx='400' cy='300' r='100' fill='none' stroke='${this.tpl.c.sf}' stroke-width='2'/>` +
      `</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  private templateIndex(): number {
    const i = APPROVED_TEMPLATES.findIndex((t) => t.id === this.tpl.id);
    return i < 0 ? 0 : i;
  }

  private loadTemplateFonts(): void {
    const fonts = resolveTemplateStyleVars(this.tpl, this.overrides).fonts;
    const families = Array.from(new Set([fonts.heading, fonts.body])).filter(Boolean);
    if (families.length === 0) {
      return;
    }
    const href =
      'https://fonts.googleapis.com/css2?' +
      families.map((f) => `${f.replace(/ /g, '+')}:wght@400..800`).join('&') +
      '&display=swap';
    if (document.querySelector(`link[href="${href}"]`)) {
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}
