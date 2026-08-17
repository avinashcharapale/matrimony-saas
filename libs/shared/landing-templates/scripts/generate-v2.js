/**
 * generate-v2.js â€” Matrimony SaaS Landing Template Generator (Part 1)
 *
 * Generates culturally authentic, premium Hindu marriage themed landing
 * page templates. This file provides content libraries, hero image
 * routing, SVG icon constants, and default content generation.
 *
 * Part 1 of 2: File header, imports, content library, hero variant HTML renderers.
 * Part 2 (separate) will contain section renderers and main assembly logic.
 */

const fs = require('fs');
const path = require('path');

const PALETTES = path.resolve(__dirname, '..', 'palettes.json');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'output');

let palettes = {};
if (fs.existsSync(PALETTES)) {
  palettes = JSON.parse(fs.readFileSync(PALETTES, 'utf-8'));
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Content Library â€” 15 templates with premium, culturally authentic copy
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const content = {
  'paithani-royal': {
    eyebrow: 'Since Generations of Royalty',
    h1: 'Begin Your Legacy With a Royal Paithani Union',
    sub: 'Celebrate the grandeur of Maratha heritage through a match crafted with the timeless elegance of Paithani silk traditions.',
    cta1: 'Find Your Royal Match',
    cta2: 'Explore Heritage Profiles',
    features: [
      { title: 'Verified Royal Lineages', desc: 'Every profile is hand-verified to preserve the dignity and authenticity of illustrious family traditions.' },
      { title: 'Paithani Heritage Circle', desc: 'Connect with families who share your passion for preserving the sacred art of Paithani weaving and Maratha customs.' },
      { title: 'Confidential Introductions', desc: 'Discreet, respectful introductions managed by dedicated relationship managers who understand royal etiquette.' }
    ],
    steps: [
      { title: 'Share Your Legacy', desc: 'Create a profile that reflects your family\'s distinguished heritage, values, and aspirations for the future.' },
      { title: 'Curated Matches', desc: 'Receive thoughtfully curated introductions to families who share your cultural stature and traditions.' },
      { title: 'Sacred Beginnings', desc: 'With family blessings and astrological alignment, take the first step toward a union built to last generations.' }
    ],
    stories: [
      { names: 'Priya & Rohit', loc: 'Pune', date: 'March 2025', quote: 'Our families shared a love for Paithani traditions. This platform found us a match that felt written in silk and destiny.' },
      { names: 'Ananya & Vikram', loc: 'Mumbai', date: 'January 2025', quote: 'The royal heritage filter helped us connect with a family that truly understood our values. A perfect match of hearts and traditions.' },
      { names: 'Meera & Arjun', loc: 'Nagpur', date: 'December 2024', quote: 'We found each other through shared Paithani roots. Our wedding was a celebration of two legacies united in love.' }
    ],
    testimonials: [
      { name: 'Sunita Deshpande', role: 'Mother of the Bride', quote: 'They understood exactly what we were looking for â€” a family that cherishes tradition as deeply as we do. The introduction was seamless and respectful.' },
      { name: 'Rajesh Kulkarni', role: 'Father of the Groom', quote: 'The verification process gave us tremendous confidence. Our son found a truly wonderful partner from a family of great standing.' },
      { name: 'Dr. Lakshmi Joshi', role: 'Relationship Manager', quote: 'Every match I facilitate is rooted in genuine cultural understanding. This platform honours the sanctity of arranged introductions beautifully.' }
    ],
    profiles: [
      { name: 'Aishwarya', age: 27, job: 'Classical Dancer', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'Trained Bharatanatyam artist with a deep love for Paithani traditions. Looking for someone who values art and culture as much as family.' },
      { name: 'Shantanu', age: 30, job: 'Architect', city: 'Mumbai', comm: 'Hindu, Maratha', intro: 'Heritage restoration architect passionate about preserving Maharashtra\'s architectural legacy. Seeking a partner with cultural depth.' },
      { name: 'Nikhil', age: 29, job: 'IAS Officer', city: 'Delhi', comm: 'Hindu, Brahmin', intro: 'UPSC ranker serving in Maharashtra cadre. Devoted to public service and rooted in family traditions. Looking for an equally driven partner.' },
      { name: 'Pooja', age: 26, job: 'Pharmacist', city: 'Nashik', comm: 'Hindu, CKP', intro: 'Pharmacy graduate managing our family business. I believe in tradition meeting modernity. Looking for a respectful, ambitious life partner.' }
    ],
    stats: ['5,400+', '92%', '380+', '4.9'],
    statLabs: ['Royal Heritage Profiles', 'Match Success Rate', 'Cities Covered', 'Family Rating'],
    counters: [5400, 92, 380, 4.9],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Royal Heritage Profiles', 'Match Success', 'Cities', 'Avg Rating']
  },

  'marigold-traditional': {
    eyebrow: 'Where Sacred Traditions Unite',
    h1: 'Sacred Bonds Blossom Like Marigold Garlands',
    sub: 'Honor the sanctity of traditional Hindu marriage with a platform rooted in authentic Vedic values and family-first matchmaking.',
    cta1: 'Start Your Journey',
    cta2: 'View Success Stories',
    features: [
      { title: 'Vedic Compatibility', desc: 'Detailed Guna Milan analysis and kundali matching guided by expert pandits for astrologically harmonious unions.' },
      { title: 'Family-Centric Approach', desc: 'Every introduction involves family elders, ensuring respect for the traditions that make Hindu marriages sacred.' },
      { title: 'Pandit-Verified Profiles', desc: 'Community leaders and pandits help verify each profile for authenticity, ensuring trustworthy introductions.' }
    ],
    steps: [
      { title: 'Register With Your Family', desc: 'Create a joint profile with family details, gotra information, and cultural preferences for a genuine introduction.' },
      { title: 'Receive Blessed Matches', desc: 'Our pandit-informed algorithm presents matches aligned with your kundali, values, and family expectations.' },
      { title: 'Unite in Sacred Ceremony', desc: 'With family approval and divine blessings, progress toward a Saptapadi that unites two families forever.' }
    ],
    stories: [
      { names: 'Kavita & Suresh', loc: 'Aurangabad', date: 'April 2025', quote: 'Our families performed the kundali matching together. The alignment was perfect â€” we knew this was divinely guided.' },
      { names: 'Deepa & Manoj', loc: 'Thane', date: 'February 2025', quote: 'The Vedic compatibility score gave both families confidence. Our traditional wedding was everything we dreamed.' },
      { names: 'Renuka & Prakash', loc: 'Solapur', date: 'November 2024', quote: 'From the first family meeting to the Saptapadi, every step was guided by tradition. We are grateful beyond words.' }
    ],
    testimonials: [
      { name: 'Geeta Pawar', role: 'Matchmaker & Elder', quote: 'I have helped arrange hundreds of marriages in our community. This platform makes my work easier while keeping traditions alive.' },
      { name: 'Arun Bhatt', role: 'Temple Priest', quote: 'When families come to me for kundali matching, I often find the profiles here are genuine and well-prepared. A trustworthy platform.' },
      { name: 'Suman Patil', role: 'Mother of Three Sons', quote: 'All three of my sons found their life partners here. The platform truly understands what Indian families look for in a match.' }
    ],
    profiles: [
      { name: 'Pallavi', age: 25, job: 'Teacher', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'Primary school teacher with a love for storytelling and tradition. Seeking a kind, family-oriented partner who respects elders.' },
      { name: 'Vishal', age: 31, job: 'Bank Manager', city: 'Mumbai', comm: 'Hindu, Saraswat', intro: 'SBI manager with stable career and deep-rooted values. Looking for a partner who values family traditions and togetherness.' },
      { name: 'Ravi', age: 28, job: 'Civil Engineer', city: 'Nagpur', comm: 'Hindu, Goud', intro: 'Civil engineer building bridges both literally and figuratively. Seeking a thoughtful, cultured partner for a lifetime together.' },
      { name: 'Sneha', age: 24, job: 'Nurse', city: 'Nashik', comm: 'Hindu, Deshastha', intro: 'ICU nurse with a caring heart and strong family values. Looking for someone honest, hardworking, and respectful of traditions.' }
    ],
    stats: ['12,800+', '89%', '520+', '4.8'],
    statLabs: ['Verified Profiles', 'Successful Matches', 'Communities', 'User Rating'],
    counters: [12800, 89, 520, 4.8],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Success Rate', 'Communities', 'Rating']
  },

  'mangalsutra-gold': {
    eyebrow: 'The Gold Standard of Matchmaking',
    h1: 'Where Every Mangalsutra Tells a Story of True Love',
    sub: 'Discover a partner worthy of the sacred mangalsutra â€” a bond forged in gold, sealed with divine love and unshakeable trust.',
    cta1: 'Begin Your Sacred Search',
    cta2: 'Discover Gold Members',
    features: [
      { title: 'Gold-Verified Trust', desc: 'Our Gold Member verification includes Aadhaar, income, and family background checks for complete peace of mind.' },
      { title: 'Personalized Matchmaking', desc: 'Dedicated relationship experts who understand the significance of the mangalsutra tradition in Hindu marriages.' },
      { title: 'Premium Privacy', desc: 'Your profile is visible only to approved matches, ensuring complete confidentiality throughout your search.' }
    ],
    steps: [
      { title: 'Create Your Profile', desc: 'Share your story, values, and family traditions to help us understand exactly what kind of partner you seek.' },
      { title: 'Get Gold Verified', desc: 'Complete our comprehensive verification to earn the Gold Member badge and attract serious, trustworthy matches.' },
      { title: 'Find Your Soulmate', desc: 'Connect with verified, compatible matches and take the sacred step toward tying the mangalsutra of love.' }
    ],
    stories: [
      { names: 'Shraddha & Aditya', loc: 'Mumbai', date: 'May 2025', quote: 'The Gold verification gave both families confidence. Our engagement was celebrated with the most beautiful gold mangalsutra.' },
      { names: 'Divya & Kunal', loc: 'Thane', date: 'March 2025', quote: 'We were both Gold Members, which meant we were both serious. That mutual seriousness led to genuine love and a beautiful wedding.' },
      { names: 'Nisha & Rajan', loc: 'Pune', date: 'January 2025', quote: 'From profile to mangalsutra in four months. When the match is right, everything falls into place with divine timing.' }
    ],
    testimonials: [
      { name: 'Kiran Shinde', role: 'Gold Member', quote: 'The Gold verification process was thorough but worth it. It attracted genuinely serious families and we found our daughter-in-law within weeks.' },
      { name: 'Anjali Menon', role: 'Bride\'s Mother', quote: 'The premium service level was exceptional. Our relationship manager understood our community requirements perfectly.' },
      { name: 'Sameer Gupta', role: 'Software Engineer', quote: 'I was skeptical about online matchmaking, but the Gold verification and personal attention changed my mind completely.' }
    ],
    profiles: [
      { name: 'Kavya', age: 26, job: 'Data Analyst', city: 'Bangalore', comm: 'Hindu, Iyengar', intro: 'Data analyst by day, Carnatic singer by evening. Looking for an intellectually curious partner who appreciates both logic and art.' },
      { name: 'Ankit', age: 32, job: 'Startup Founder', city: 'Mumbai', comm: 'Hindu, Vaishya', intro: 'Serial entrepreneur building India\'s future. Seeking a partner who is ambitious yet grounded in family and tradition.' },
      { name: 'Gaurav', age: 29, job: 'Doctor', city: 'Delhi', comm: 'Hindu, Khatri', intro: 'Orthopaedic surgeon with a mission to make healthcare accessible. Looking for a compassionate, educated life partner.' },
      { name: 'Ritika', age: 28, job: 'Fashion Designer', city: 'Jaipur', comm: 'Hindu, Maheshwari', intro: 'Fashion designer blending Rajasthani heritage with modern aesthetics. Seeking someone who values creativity and culture.' }
    ],
    stats: ['8,900+', '94%', '290+', '4.95'],
    statLabs: ['Gold Members', 'Trust Score', 'Cities', 'Satisfaction'],
    counters: [8900, 94, 290, 4.95],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Gold Members', 'Trust Score', 'Cities', 'Rating']
  },

  'kundali-divine': {
    eyebrow: 'Stars Aligned by Divine Will',
    h1: 'Let the Cosmos Guide You to Your Perfect Match',
    sub: 'Advanced kundali matching powered by Vedic astrology, ensuring your union is blessed by the stars and sanctioned by tradition.',
    cta1: 'Match Your Kundali Now',
    cta2: 'Talk to an Astrologer',
    features: [
      { title: 'AI-Powered Kundali Milan', desc: 'Advanced algorithms perform detailed 36-point Guna Milan with precise planetary position analysis for accurate matching.' },
      { title: 'Expert Astrologer Consultation', desc: 'Connect with certified Vedic astrologers for in-depth horoscope analysis and personalized marriage compatibility guidance.' },
      { title: 'Manglik & Dosha Screening', desc: 'Comprehensive dosha analysis including Manglik, Nadi, and other considerations with remedial suggestions from expert pandits.' }
    ],
    steps: [
      { title: 'Enter Birth Details', desc: 'Share your precise birth details â€” date, time, and place â€” for accurate natal chart generation and analysis.' },
      { title: 'Review Compatibility Score', desc: 'Receive a detailed Guna Milan score with planetary compatibility analysis across all 36 parameters.' },
      { title: 'Consult & Proceed', desc: 'Discuss results with our expert astrologers and proceed with confidence toward a cosmically aligned union.' }
    ],
    stories: [
      { names: 'Tanvi & Sameer', loc: 'Pune', date: 'June 2025', quote: 'Our kundali score was 31 out of 36. The astrologer said it was a rare alignment. Our marriage has been blissful since day one.' },
      { names: 'Pooja & Hitesh', loc: 'Ahmedabad', date: 'April 2025', quote: 'Despite my Manglik dosha, the platform found perfect matches with compatible charts. The astrologer\'s guidance was invaluable.' },
      { names: 'Rekha & Nitin', loc: 'Nagpur', date: 'February 2025', quote: 'The AI kundali matching was remarkably accurate. Our horoscopes aligned beautifully, and our families celebrated this divine connection.' }
    ],
    testimonials: [
      { name: 'Pandit Raghunath Sharma', role: 'Vedic Astrologer', quote: 'I have consulted for over 2,000 marriages. The kundali matching on this platform is the most accurate digital system I have encountered.' },
      { name: 'Maya Krishnamurthy', role: 'Astrology Enthusiast', quote: 'Being Manglik, I had lost hope. This platform found me a partner with a compatible chart and my marriage is blessed.' },
      { name: 'Amit Tiwari', role: 'IT Professional', quote: 'The scientific approach to traditional kundali matching gave me confidence as a tech professional. The results were surprisingly accurate.' }
    ],
    profiles: [
      { name: 'Swati', age: 27, job: 'Ayurvedic Doctor', city: 'Kerala', comm: 'Hindu, Nair', intro: 'Ayurvedic physician passionate about holistic wellness. Seeking a partner who values health, tradition, and mindful living.' },
      { name: 'Aakash', age: 30, job: 'Pilot', city: 'Mumbai', comm: 'Hindu, Brahmin', intro: 'Commercial pilot who has circled the globe but knows home is where the heart is. Looking for a grounded, loving partner.' },
      { name: 'Siddharth', age: 28, job: 'Professor', city: 'Varanasi', comm: 'Hindu, Bhumihar', intro: 'Philosophy professor at BHU, rooted in the spiritual heart of India. Seeking an intellectually stimulating life partner.' },
      { name: 'Megha', age: 25, job: 'Lawyer', city: 'Delhi', comm: 'Hindu, Vaishya', intro: 'Corporate lawyer with a passion for justice and tradition. Looking for a principled, ambitious partner to share life\'s journey.' }
    ],
    stats: ['15,200+', '96%', '18,000+', '4.85'],
    statLabs: ['Kundalis Matched', 'Accuracy Rate', 'Consultations', 'User Rating'],
    counters: [15200, 96, 18000, 4.85],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Kundalis', 'Accuracy', 'Consultations', 'Rating']
  },

  'saptapadi-sacred': {
    eyebrow: 'Seven Steps, One Eternal Journey',
    h1: 'Walk the Sacred Saptapadi Together',
    sub: 'Seven divine steps around the holy fire, seven promises for a lifetime â€” find the partner who will walk this eternal path with you.',
    cta1: 'Take the First Step',
    cta2: 'Read Sacred Stories',
    features: [
      { title: 'Sacred Saptapadi Vows', desc: 'Create and share your seven sacred vows with potential matches, revealing your values and life aspirations with honesty.' },
      { title: 'Agni-Verified Trust', desc: 'Multi-layered verification process inspired by the sanctity of the sacred fire â€” only genuine, serious profiles pass through.' },
      { title: 'Family Saptapadi Planning', desc: 'Tools to help both families plan every aspect of the traditional ceremony, from fire ceremony to final blessings.' }
    ],
    steps: [
      { title: 'Light the Sacred Flame', desc: 'Register with intention and sincerity, sharing your life goals, values, and what each of the seven steps means to you.' },
      { title: 'Walk the First Circle', desc: 'Engage with compatible matches through guided conversations about family, values, dreams, and sacred commitments.' },
      { title: 'Complete the Seven Promises', desc: 'When hearts align, families unite to celebrate a Saptapadi ceremony blessed by tradition and sealed by divine fire.' }
    ],
    stories: [
      { names: 'Usha & Ganesh', loc: 'Kolhapur', date: 'May 2025', quote: 'Each of our Saptapadi vows matched perfectly. It felt like the fire itself was blessing our union from the very first conversation.' },
      { names: 'Lata & Pramod', loc: 'Satara', date: 'March 2025', quote: 'We shared our seven promises before meeting in person. That deep alignment made our first meeting feel like a reunion of souls.' },
      { names: 'Jyoti & Mangesh', loc: 'Ratnagiri', date: 'January 2025', quote: 'The Saptapadi framework helped us discuss what truly matters. Our wedding was not just a ceremony but a profound spiritual experience.' }
    ],
    testimonials: [
      { name: 'Vishnupant Deshmukh', role: 'Temple Priest', quote: 'The couples who come to me after finding each other on this platform share a deep understanding of the Saptapadi\'s sacred significance.' },
      { name: 'Sarojini Kulkarni', role: 'Matchmaker', quote: 'In thirty years of matchmaking, I have never seen a platform that so beautifully captures the spiritual essence of Hindu marriage.' },
      { name: 'Hemant Jog', role: 'Father of Bride', quote: 'The Saptapadi values filter helped us find a family whose seven promises aligned perfectly with our daughter\'s aspirations.' }
    ],
    profiles: [
      { name: 'Aparna', age: 29, job: 'Music Director', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'Carnatic music director composing life\'s beautiful melodies. Seeking a soulful partner who understands rhythm and devotion.' },
      { name: 'Deepak', age: 31, job: 'Chartered Accountant', city: 'Mumbai', comm: 'Hindu, Bania', intro: 'CA with a thriving practice and an even stronger commitment to family. Looking for a warm, intelligent partner.' },
      { name: 'Yogesh', age: 27, job: 'Farmer & Agritech', city: 'Satara', comm: 'Hindu, Maratha', intro: 'Agricultural engineer modernizing our family farms. Seeking a partner who loves the earth and its sacred bounty.' },
      { name: 'Sayali', age: 26, job: 'Psychologist', city: 'Nashik', comm: 'Hindu, Chitpavan', intro: 'Clinical psychologist helping others find inner peace. Looking for an emotionally mature, kind-hearted life partner.' }
    ],
    stats: ['9,300+', '91%', '420+', '4.88'],
    statLabs: ['Sacred Profiles', 'Vow Alignment', 'Communities', 'Trust Rating'],
    counters: [9300, 91, 420, 4.88],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Alignment', 'Communities', 'Rating']
  },

  'haldi-blessed': {
    eyebrow: 'Blessed Beginnings Await',
    h1: 'Your Match Is Blessed by Sacred Haldi',
    sub: 'Like the purifying haldi ceremony that precedes every auspicious Hindu wedding, let us cleanse your search and bless your journey.',
    cta1: 'Get Blessed Today',
    cta2: 'Explore Haldi Stories',
    features: [
      { title: 'AuspiMatchâ„¢ Algorithm', desc: 'Our proprietary matching algorithm considers astrological, cultural, and family compatibility for truly blessed introductions.' },
      { title: 'Pre-Wedding Guidance', desc: 'From haldi to mehendi, receive expert guidance on every aspect of your traditional Hindu wedding journey.' },
      { title: 'Community Blessings', desc: 'Join a community of like-minded families who believe in the sacred power of tradition and divine matchmaking.' }
    ],
    steps: [
      { title: 'Apply the Sacred Haldi', desc: 'Begin with a warm, authentic profile that reflects your family\'s traditions, values, and blessings from elders.' },
      { title: 'Let Blessings Flow', desc: 'Our community of families and elders reviews and blesses potential matches, ensuring genuine cultural alignment.' },
      { title: 'Celebrate Together', desc: 'When two blessed families unite, the celebration begins â€” from haldi to vidaai, every moment is pure joy.' }
    ],
    stories: [
      { names: 'Pallavi & Ajay', loc: 'Ahmednagar', date: 'April 2025', quote: 'The haldi theme felt so right for our story. Our journey began with blessings and continues with pure golden joy every day.' },
      { names: 'Shubhangi & Rahul', loc: 'Sangli', date: 'February 2025', quote: 'Both families applied haldi together at our engagement. This platform made that beautiful moment possible. Forever grateful.' },
      { names: 'Vrushali & Omkar', loc: 'Pune', date: 'December 2024', quote: 'From the first blessing to the last garland, every moment was sacred. Our haldi ceremony was the highlight of our celebration.' }
    ],
    testimonials: [
      { name: 'Usha Jadhav', role: 'Elder & Blessing Mother', quote: 'I bless every couple who finds their match through this platform. The sincerity of the families here is truly special.' },
      { name: 'Prakash Suryavanshi', role: 'Wedding Priest', quote: 'Couples from this platform come prepared with genuine intentions and traditional values. My ceremonies with them are always beautiful.' },
      { name: 'Neha Kulkarni', role: 'Bride', quote: 'The entire experience felt blessed from start to finish. Our haldi ceremony symbolized the golden beginning this platform gave us.' }
    ],
    profiles: [
      { name: 'Aditi', age: 24, job: 'Archaeologist', city: 'ASI Pune', comm: 'Hindu, Brahmin', intro: 'Archaeologist uncovering India\'s past while building a meaningful future. Seeking a curious, culturally aware partner.' },
      { name: 'Karthik', age: 30, job: 'Civil Servant', city: 'Hyderabad', comm: 'Hindu, Sharma', intro: 'IAS officer serving the people of Maharashtra. Seeking a partner who values service, tradition, and intellectual growth.' },
      { name: 'Rohan', age: 28, job: 'Chef & Restaurateur', city: 'Mumbai', comm: 'Hindu, GSB', intro: 'Gowda Saraswat Brahmin chef blending traditional recipes with modern cuisine. Looking for a food-loving, warm-hearted partner.' },
      { name: 'Smita', age: 27, job: 'Journalist', city: 'Nagpur', comm: 'Hindu, Kunbi', intro: 'Award-winning journalist covering social issues. Seeking a progressive partner who still honours traditional family values.' }
    ],
    stats: ['7,600+', '88%', '310+', '4.82'],
    statLabs: ['Blessed Profiles', 'Family Approval', 'Regions', 'Experience Score'],
    counters: [7600, 88, 310, 4.82],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Approval', 'Regions', 'Rating']
  },

  'mehendi-green': {
    eyebrow: 'Artistry of Love in Every Detail',
    h1: 'Where Love Blooms in Intricate Mehendi Patterns',
    sub: 'Like the delicate artistry of mehendi on a bride\'s hands, we craft every match with patience, precision, and profound cultural understanding.',
    cta1: 'Design Your Match',
    cta2: 'Browse Artisan Profiles',
    features: [
      { title: 'Artisanal Matchmaking', desc: 'Every match is crafted with the patience and attention to detail of a master mehendi artist â€” no algorithms alone, only human insight.' },
      { title: 'Cultural Artisan Network', desc: 'Connect with families who value the performing and decorative arts, ensuring shared cultural sensibilities from the start.' },
      { title: 'Mehendi-Inspired Events', desc: 'Join exclusive mehendi nights, cultural gatherings, and artisan meetups to find love in the most beautiful settings.' }
    ],
    steps: [
      { title: 'Paint Your Story', desc: 'Create a rich, detailed profile that showcases your personality, passions, and the beautiful patterns of your life.' },
      { title: 'Let Artistry Unfold', desc: 'Our cultural advisors carefully study every detail to craft introductions that are as beautiful as mehendi designs.' },
      { title: 'Celebrate the Art of Love', desc: 'When the right patterns align, celebrate with a mehendi ceremony that marks the beginning of your masterwork together.' }
    ],
    stories: [
      { names: 'Pooja & Devendra', loc: 'Udaipur', date: 'May 2025', quote: 'Both of us are mehendi artists. This platform found us each other across state lines. Our love story is the most beautiful design.' },
      { names: 'Swati & Nikhil', loc: 'Jaipur', date: 'March 2025', quote: 'The cultural matching was so precise â€” we both loved Rajasthani folk art. Our mehendi night was a celebration of shared passions.' },
      { names: 'Komal & Sachin', loc: 'Indore', date: 'January 2025', quote: 'The artisanal approach made us feel special. Our mehendi designs told our love story, and this platform was chapter one.' }
    ],
    testimonials: [
      { name: 'Fatima Sheikh', role: 'Mehendi Artist', quote: 'As a professional mehendi artist, I appreciate the attention to cultural detail this platform brings. Every couple\'s story deserves beautiful art.' },
      { name: 'Reena Jain', role: 'Wedding Planner', quote: 'The couples I plan mehendi ceremonies for through this platform are always culturally aligned. It makes every celebration more meaningful.' },
      { name: 'Alok Verma', role: 'Groom', quote: 'I never expected to find an artist wife through a matrimony platform. The cultural matching is genuinely impressive and heartfelt.' }
    ],
    profiles: [
      { name: 'Meenal', age: 26, job: 'Textile Designer', city: 'Jaipur', comm: 'Hindu, Maheshwari', intro: 'Textile designer weaving Rajasthani heritage into modern fashion. Looking for someone who appreciates art, craft, and tradition.' },
      { name: 'Prateek', age: 29, job: 'Graphic Designer', city: 'Mumbai', comm: 'Hindu, Aggarwal', intro: 'Visual storyteller creating brands and identities. Seeking a creative soulmate who understands the language of design and love.' },
      { name: 'Varun', age: 31, job: 'IIT Professor', city: 'Kanpur', comm: 'Hindu, Baniya', intro: 'Computer science professor at IIT Kanpur with a passion for Indian classical arts. Looking for an intellectually curious partner.' },
      { name: 'Isha', age: 25, job: 'Dancer', city: 'Lucknow', comm: 'Hindu, Kayastha', intro: 'Kathak dancer trained under Pandit Birju Maharaj\'s lineage. Seeking a partner who values performing arts and spiritual growth.' }
    ],
    stats: ['6,200+', '87%', '240+', '4.79'],
    statLabs: ['Artisan Profiles', 'Cultural Match', 'Art Forms', 'Satisfaction'],
    counters: [6200, 87, 240, 4.79],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Cultural Match', 'Art Forms', 'Rating']
  },

  'sagai-rosegold': {
    eyebrow: 'The Blush of New Beginnings',
    h1: 'Your Engagement Deserves a Rosegold Touch',
    sub: 'Where modern romance meets timeless tradition â€” discover matches that sparkle with the warmth and elegance of rose gold.',
    cta1: 'Spark Your Romance',
    cta2: 'See Engagement Stories',
    features: [
      { title: 'Rosegold Verified', desc: 'Our premium verification tier includes video introductions, LinkedIn verification, and detailed lifestyle matching.' },
      { title: 'Engagement First', desc: 'Designed for couples ready for commitment â€” every feature is built to move from introduction to engagement with purpose.' },
      { title: 'Couple Stories Blog', desc: 'Get inspired by real engagement stories from couples who found their perfect rose-gold moment through our platform.' }
    ],
    steps: [
      { title: 'Polish Your Profile', desc: 'Upload professional photos, share your engagement vision, and describe the rose-gold future you want to build.' },
      { title: 'Receive Curated Introductions', desc: 'Our matchmaking experts present handpicked profiles of individuals who match your lifestyle, values, and aspirations.' },
      { title: 'Say Yes to Forever', desc: 'When you find the one, our engagement planning tools help you celebrate this milestone in the most elegant way possible.' }
    ],
    stories: [
      { names: 'Tanvi & Nikhil', loc: 'Mumbai', date: 'June 2025', quote: 'Our engagement happened on a rooftop overlooking Marine Drive. The rose-gold ring matched the sunset perfectly. Pure magic.' },
      { names: 'Kriti & Akash', loc: 'Delhi', date: 'April 2025', quote: 'The premium service felt like having a personal matchmaker who truly understood our sophisticated tastes and modern values.' },
      { names: 'Prachi & Vaibhav', loc: 'Pune', date: 'February 2025', quote: 'From a rose-gold themed first date to a rose-gold engagement ring â€” this platform understood our aesthetic from the start.' }
    ],
    testimonials: [
      { name: 'Nandini Sharma', role: 'Event Designer', quote: 'The couples I work with through this platform have impeccable taste. The rose-gold aesthetic translates to beautifully planned engagements.' },
      { name: 'Rahul Mehta', role: 'Entrepreneur', quote: 'As someone who values quality over quantity, the curated matching experience was exactly what I needed. Found my partner in weeks.' },
      { name: 'Priya Kapoor', role: 'Fashion Blogger', quote: 'The platform\'s aesthetic sensibility is unmatched. My engagement story, featured on their blog, went viral in our community.' }
    ],
    profiles: [
      { name: 'Saanvi', age: 28, job: 'Interior Designer', city: 'Mumbai', comm: 'Hindu, Khatri', intro: 'Interior designer creating luxurious spaces for discerning clients. Looking for a partner with refined taste and a generous heart.' },
      { name: 'Arjun', age: 30, job: 'Investment Banker', city: 'Mumbai', comm: 'Hindu, Bania', intro: 'Investment banker with Goldman Sachs. Seeking an equally accomplished partner who values both career ambition and family warmth.' },
      { name: 'Kabir', age: 32, job: 'Luxury Hotel GM', city: 'Goa', comm: 'Hindu, Saraswat', intro: 'Managing a five-star property while living life to the fullest. Looking for a partner who appreciates life\'s finer experiences.' },
      { name: 'Diya', age: 26, job: 'Luxury Brand Manager', city: 'Delhi', comm: 'Hindu, Arora', intro: 'Managing premium brands at LVMH India. Seeking a sophisticated, well-travelled partner for a life of elegance and adventure.' }
    ],
    stats: ['4,100+', '95%', '180+', '4.92'],
    statLabs: ['Premium Members', 'Engagement Rate', 'Metro Cities', 'Luxury Rating'],
    counters: [4100, 95, 180, 4.92],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Members', 'Engagement', 'Cities', 'Rating']
  },

  'lavani-vibrant': {
    eyebrow: 'Dance to the Rhythm of Love',
    h1: 'Find Your Perfect Dance Partner in Life',
    sub: 'Bold, vibrant, and full of energy â€” like the Lavani dance itself, discover a love that moves with passion and cultural pride.',
    cta1: 'Join the Celebration',
    cta2: 'Watch Love Stories',
    features: [
      { title: 'Vibrant Match Events', desc: 'Attend cultural events, Lavani performances, and traditional dance meetups to find love in an energetic, festive atmosphere.' },
      { title: 'Personality-First Matching', desc: 'Our vibrant matching system prioritizes personality, energy, and cultural passion alongside traditional compatibility metrics.' },
      { title: 'Dance & Connect', desc: 'Virtual and in-person dance sessions where singles meet naturally through shared love for Maharashtra\'s folk arts.' }
    ],
    steps: [
      { title: 'Show Your Colors', desc: 'Create a vibrant profile that showcases your energy, cultural passions, and the colorful personality that makes you unique.' },
      { title: 'Feel the Rhythm', desc: 'Engage with matches through cultural activities, dance challenges, and festive conversations that spark genuine connections.' },
      { title: 'Dance Into Forever', desc: 'When two rhythms harmonize, celebrate with a Lavani-inspired wedding that\'s as vibrant as your love story.' }
    ],
    stories: [
      { names: 'Bhakti & Chetan', loc: 'Kolhapur', date: 'May 2025', quote: 'We met at a Lavani dance event organized by the platform. Two years later, we danced together at our own wedding. Full circle.' },
      { names: 'Manasi & Sachin', loc: 'Solapur', date: 'March 2025', quote: 'The vibrant energy of this platform matched our personalities perfectly. Our first conversation felt like a Lavani beat â€” electrifying.' },
      { names: 'Vaishali & Ganesh', loc: 'Satara', date: 'January 2025', quote: 'Both passionate folk dancers, we found each other through a cultural event. Our wedding Lavani performance went viral online.' }
    ],
    testimonials: [
      { name: 'Sushma More', role: 'Lavani Performer', quote: 'This platform celebrates Maharashtra\'s vibrant culture like no other. Finding a partner who shares my passion for Lavani was a dream come true.' },
      { name: 'Pradip Patil', role: 'Cultural Organizer', quote: 'The events organized by this platform bring genuine energy. I have witnessed beautiful connections form through shared cultural celebrations.' },
      { name: 'Neha Jogalekar', role: 'Bride', quote: 'My profile reflected my love for Lavani and they matched me with someone who dances through life with the same passion. Pure joy.' }
    ],
    profiles: [
      { name: 'Sonali', age: 25, job: 'Lavani Instructor', city: 'Kolhapur', comm: 'Hindu, Maratha', intro: 'Professional Lavani dancer and instructor. Looking for a partner who appreciates Maharashtra\'s vibrant cultural heritage and lives passionately.' },
      { name: 'Prashant', age: 29, job: 'Fitness Trainer', city: 'Pune', comm: 'Hindu', intro: 'Fitness trainer and martial arts enthusiast. Seeking a partner who values health, energy, and a vibrant lifestyle full of adventure.' },
      { name: 'Mangesh', age: 27, job: 'DJ & Music Producer', city: 'Mumbai', comm: 'Hindu, CKP', intro: 'Music producer blending folk and electronic sounds. Looking for someone who loves rhythm, celebration, and living life at full volume.' },
      { name: 'Pournima', age: 26, job: 'Event Manager', city: 'Nashik', comm: 'Hindu, Leva', intro: 'Event manager who turns celebrations into unforgettable experiences. Seeking a fun-loving, culturally aware life partner.' }
    ],
    stats: ['5,800+', '90%', '350+', '4.78'],
    statLabs: ['Vibrant Profiles', 'Event Matchups', 'Cultural Events', 'Energy Rating'],
    counters: [5800, 90, 350, 4.78],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Matchups', 'Events', 'Rating']
  },

  'paithani-silk': {
    eyebrow: 'Woven in Silk, Bound by Love',
    h1: 'A Match as Precious as Pure Paithani Silk',
    sub: 'Like the intricate zari work of Paithani silk, every match on this platform is woven with care, tradition, and unmatched craftsmanship.',
    cta1: 'Weave Your Story',
    cta2: 'Explore Silk Profiles',
    features: [
      { title: 'Silk-Certified Profiles', desc: 'Every profile undergoes a silk-grade verification â€” background, family, career, and character â€” ensuring pure, authentic introductions.' },
      { title: 'Handloom Heritage Circle', desc: 'Exclusive community for families who value Maharashtra\'s Paithani silk heritage and wish to preserve it through matrimonial bonds.' },
      { title: 'Crafted Introductions', desc: 'Personalized introduction letters written by our cultural experts, reflecting the elegance and warmth of Paithani traditions.' }
    ],
    steps: [
      { title: 'Drape Your Profile', desc: 'Wrap your profile in the finest details â€” cultural achievements, family heritage, and personal values that define you.' },
      { title: 'Silk Verification', desc: 'Complete our rigorous silk-grade verification to earn the Paithani Silk badge and attract the most genuine matches.' },
      { title: 'Unfold Your Destiny', desc: 'Like unfolding a beautiful Paithani saree, let each step of the matchmaking process reveal the beauty of your perfect match.' }
    ],
    stories: [
      { names: 'Smita & Mahesh', loc: 'Paithan', date: 'April 2025', quote: 'We both come from Paithani weaving families. This platform preserved our heritage by uniting two silk dynasties in love.' },
      { names: 'Vaishnavi & Aditya', loc: 'Mumbai', date: 'February 2025', quote: 'The silk verification gave us tremendous trust. Our wedding saree was a family heirloom Paithani â€” the symbolism was beautiful.' },
      { names: 'Sonal & Kedar', loc: 'Thane', date: 'December 2024', quote: 'Every match introduction felt as precious as a handwoven Paithani. Our love story is now our family\'s finest creation.' }
    ],
    testimonials: [
      { name: 'Dr. Vasantrao Deshmukh', role: 'Paithani Heritage Scholar', quote: 'This platform is doing extraordinary work preserving Paithani traditions through matrimonial alliances. Every match strengthens our heritage.' },
      { name: 'Shobha Thakur', role: 'Silk Weaver', quote: 'I have woven Paithani sarees for forty years. This platform weaves something even more precious â€” bonds between heritage families.' },
      { name: 'Ganesh Kamble', role: 'Groom', quote: 'The silk verification process was thorough and dignified. My wife\'s Paithani family heirloom at our wedding made everything perfect.' }
    ],
    profiles: [
      { name: 'Radha', age: 27, job: 'Silk Weaver', city: 'Paithan', comm: 'Hindu, Devang', intro: 'Third-generation Paithani silk weaver keeping the art alive. Seeking a partner who values craftsmanship, tradition, and the finer things.' },
      { name: 'Suresh', age: 30, job: 'Textile Exporter', city: 'Mumbai', comm: 'Hindu, Devang', intro: 'Exporting Indian textiles to global markets. Looking for a partner who shares my pride in Indian textile heritage and entrepreneurship.' },
      { name: 'Rajesh', age: 28, job: 'Fashion Technologist', city: 'Pune', comm: 'Hindu, Mali', intro: 'Bridging technology and traditional textiles through innovation. Seeking an intelligent, culturally grounded life partner.' },
      { name: 'Kavita', age: 25, job: 'Cultural Curator', city: 'Aurangabad', comm: 'Hindu, Devang', intro: 'Curating exhibitions of Maharashtra\'s textile heritage. Looking for someone who appreciates art, history, and the threads that bind us.' }
    ],
    stats: ['3,900+', '93%', '210+', '4.91'],
    statLabs: ['Silk Profiles', 'Heritage Match', 'Artisans', 'Heritage Rating'],
    counters: [3900, 93, 210, 4.91],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Artisans', 'Rating']
  },

  'kolhapuri-earth': {
    eyebrow: 'Rooted in Sacred Earth',
    h1: 'Ground Your Love in Kolhapuri Earth',
    sub: 'Strong as the earth of Kolhapuri, traditional as the famous chappal â€” find a partner whose roots run deep and whose love is unshakeable.',
    cta1: 'Plant Your Roots',
    cta2: 'Meet Earthy Matches',
    features: [
      { title: 'Earth-Tier Verification', desc: 'Rustic yet thorough verification â€” we verify family roots, agricultural backgrounds, and community standing with grounded authenticity.' },
      { title: 'Heritage Match Events', desc: 'Attend traditional Kolhapuri events, temple fairs, and cultural gatherings to meet genuine, rooted individuals in person.' },
      { title: 'Community Guardian Network', desc: 'Trusted community elders and guardians who personally vouch for every profile, bringing the warmth of village matchmaking online.' }
    ],
    steps: [
      { title: 'Ground Your Profile', desc: 'Share your roots, family traditions, and the earthy values that make you who you are â€” authenticity is everything.' },
      { title: 'Draw Strength from Community', desc: 'Let our network of community guardians and elders help identify matches that share your deep cultural foundations.' },
      { title: 'Build on Sacred Ground', desc: 'When roots intertwine, love grows deep and strong. Build your life partnership on the unshakeable foundation of shared traditions.' }
    ],
    stories: [
      { names: 'Vaishali & Prakash', loc: 'Kolhapur', date: 'May 2025', quote: 'Both from traditional Kolhapuri families, we connected over our shared love for the earth and its traditions. Our roots are now intertwined.' },
      { names: 'Asha & Rajendra', loc: 'Sangli', date: 'March 2025', quote: 'The community guardian system reminded me of old-world matchmaking. Our families met under the same banyan tree where our grandparents did.' },
      { names: 'Kamini & Dnyaneshwar', loc: 'Kolhapur', date: 'January 2025', quote: 'We found strength in our shared Kolhapuri heritage. Our wedding was a celebration of earth, tradition, and unshakeable love.' }
    ],
    testimonials: [
      { name: 'Tukaram Patil', role: 'Village Elder', quote: 'In our village, matchmaking was always a community effort. This platform brings that spirit online while maintaining our Kolhapuri values.' },
      { name: 'Lata Bhosale', role: 'Farmer\'s Wife', quote: 'My daughter found a wonderful boy from a farming family. The platform understood that our roots in the earth are our greatest treasure.' },
      { name: 'Datta More', role: 'Groom', quote: 'As a farmer, I was worried about online platforms. But the community guardian system made me feel like my neighbors were introducing me.' }
    ],
    profiles: [
      { name: 'Vrushali', age: 26, job: 'Agricultural Scientist', city: 'Kolhapur', comm: 'Hindu, Maratha', intro: 'Agricultural scientist working on sustainable farming. Seeking a partner who respects the earth and its sacred bounty.' },
      { name: 'Subodh', age: 31, job: 'Sugar Mill Owner', city: 'Kolhapur', comm: 'Hindu, Maratha', intro: 'Running our family\'s sugar mill with modern techniques. Looking for a grounded, family-oriented partner.' },
      { name: 'Ganesh', age: 28, job: 'Kolhapuri Chappal Designer', city: 'Kolhapur', comm: 'Hindu, Chambhar', intro: 'Revolutionizing traditional Kolhapuri chappal design for global markets. Seeking an innovative, tradition-loving partner.' },
      { name: 'Supriya', age: 25, job: 'Veterinarian', city: 'Kolhapur', comm: 'Hindu, Lingayat', intro: 'Large-animal veterinarian serving farming communities. Looking for a compassionate, earth-loving partner who values rural life.' }
    ],
    stats: ['4,500+', '91%', '280+', '4.80'],
    statLabs: ['Earth Profiles', 'Community Trust', 'Villages', 'Authenticity'],
    counters: [4500, 91, 280, 4.80],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Trust', 'Villages', 'Rating']
  },

  'nashik-grapes': {
    eyebrow: 'A Love That Ages Perfectly',
    h1: 'Let Your Love Mature Like Fine Nashik Wine',
    sub: 'Smooth, sophisticated, and intoxicating â€” find a love that deepens with time, nurtured in the fertile vineyards of genuine connection.',
    cta1: 'Sip Into Romance',
    cta2: 'Taste Love Stories',
    features: [
      { title: 'Wine & Dine Events', desc: 'Exclusive vineyard meetups, wine tasting events, and gourmet dinner experiences where sophisticated singles connect naturally.' },
      { title: 'Lifestyle Compatibility', desc: 'Beyond traditional matching â€” our system considers lifestyle preferences, social circles, and culinary tastes for holistic compatibility.' },
      { title: 'Connoisseur Profiles', desc: 'Premium profiles for well-travelled, culturally refined individuals who appreciate the finer experiences life offers.' }
    ],
    steps: [
      { title: 'Uncork Your Profile', desc: 'Share your refined tastes, travel experiences, and the sophisticated details that make you uniquely captivating.' },
      { title: 'Savor Each Introduction', desc: 'Like a fine wine, take your time with each introduction. Our guided conversation framework encourages meaningful, unhurried connection.' },
      { title: 'Toast to Forever', desc: 'When two connoisseurs find each other, the celebration is always worthy of the finest vintage. Here is to your love.' }
    ],
    stories: [
      { names: 'Mrunal & Vikrant', loc: 'Nashik', date: 'May 2025', quote: 'We met at a vineyard event. Over a glass of Sauvignon Blanc, we discovered our shared love for travel, food, and deep conversations.' },
      { names: 'Pallavi & Abhijeet', loc: 'Mumbai', date: 'March 2025', quote: 'The sophisticated matching was perfect for us. Our first date was at a wine tasting â€” three years later, we toast our anniversary there.' },
      { names: 'Nisha & Rohit', loc: 'Nashik', date: 'January 2025', quote: 'Like a fine Nashik wine, our love has only gotten better with time. This platform was the vineyard where our grapes first ripened.' }
    ],
    testimonials: [
      { name: 'Sonal Kothari', role: 'Wine Sommelier', quote: 'As someone who appreciates the art of aging well, I find this platform\'s approach to matchmaking refreshingly sophisticated and refined.' },
      { name: 'Dr. Arvind Kulkarni', role: 'Winery Owner', quote: 'I host platform events at my vineyard. The quality of connections I witness here is as exceptional as the wine we serve.' },
      { name: 'Deepa Rao', role: 'Food Critic', quote: 'The lifestyle matching goes beyond the usual matrimony checklist. They understand that modern love is about shared experiences and refined tastes.' }
    ],
    profiles: [
      { name: 'Shreya', age: 28, job: 'Wine Consultant', city: 'Nashik', comm: 'Hindu, CKP', intro: 'Wine consultant with an MBA from Symbiosis. Seeking a sophisticated partner who appreciates life\'s finer pleasures and cultural depth.' },
      { name: 'Karan', age: 32, job: 'Restaurateur', city: 'Mumbai', comm: 'Hindu, Khatri', intro: 'Own a chain of fine dining restaurants across Maharashtra. Looking for a refined, cultured partner for a life of gourmet experiences.' },
      { name: 'Aditya', age: 29, job: 'Sommelier', city: 'Nashik', comm: 'Hindu, Brahmin', intro: 'Certified sommelier managing India\'s top wine collections. Seeking an equally passionate, well-travelled partner.' },
      { name: 'Tanya', age: 27, job: 'Travel Blogger', city: 'Goa', comm: 'Hindu, Saraswat', intro: 'Travel blogger exploring India\'s hidden gems. Looking for a partner who values experiences over possessions and adventure over routine.' }
    ],
    stats: ['3,200+', '89%', '150+', '4.87'],
    statLabs: ['Connoisseur Profiles', 'Lifestyle Match', 'Events', 'Experience Rating'],
    counters: [3200, 89, 150, 4.87],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Events', 'Rating']
  },

  'konkan-coastal': {
    eyebrow: 'Where the Sea Meets Sacred Shores',
    h1: 'Find Your Tide on the Sacred Konkan Coast',
    sub: 'Like the eternal waves of the Konkan shore, discover a love that is both powerful and peaceful, rooted in coastal traditions and natural beauty.',
    cta1: 'Follow the Tide',
    cta2: 'Discover Coastal Matches',
    features: [
      { title: 'Coastal Community Network', desc: 'Deep connections with Konkan coastal communities â€” Gaud Saraswat Brahmin, Bhandari, and other coastal traditions.' },
      { title: 'Temple & Beach Events', desc: 'Meet at coastal temples, beach-side cultural events, and traditional fishing village celebrations that bring communities together.' },
      { title: 'Nature-Inspired Matching', desc: 'Our matching algorithm considers connection to nature, coastal lifestyle preferences, and traditional fishing-agricultural backgrounds.' }
    ],
    steps: [
      { title: 'Set Your Sails', desc: 'Launch your profile with the fresh, open energy of the Konkan coast â€” honest, natural, and refreshingly authentic.' },
      { title: 'Navigate by Stars', desc: 'Let traditional community guidance and modern compatibility tools help you navigate toward your destined coastal companion.' },
      { title: 'Anchor in Love', desc: 'When you find your safe harbor, anchor your love in the timeless traditions of the Konkan coast and build a life by the sea.' }
    ],
    stories: [
      { names: 'Aarti & Prasad', loc: 'Ratnagiri', date: 'May 2025', quote: 'Both from fishing families along the Konkan coast, we found each other through shared love for the sea. Our beach wedding was magical.' },
      { names: 'Gauri & Vinayak', loc: 'Mangalore', date: 'March 2025', quote: 'The coastal community network connected us across state lines. Our first meeting was at a temple by the Arabian Sea â€” pure destiny.' },
      { names: 'Reshma & Sunil', loc: 'Ratnagiri', date: 'January 2025', quote: 'Like the Konkan tides, our love has a natural rhythm. This platform understood the coastal soul that defines us both.' }
    ],
    testimonials: [
      { name: 'Shankar Naik', role: 'Fishing Community Leader', quote: 'Our coastal community was skeptical of online platforms, but this one truly understands Konkan traditions. Many beautiful matches have come from it.' },
      { name: 'Asha Sinai', role: 'Temple Priest\'s Wife', quote: 'I guide young families through this platform with the same care I bring to temple rituals. The matches here are genuine and blessed.' },
      { name: 'Mohan Kharvilkar', role: 'Coconut Farmer', quote: 'My son found a wonderful girl from our coastal community. The platform respects our simple, nature-loving way of life beautifully.' }
    ],
    profiles: [
      { name: 'Supriya', age: 26, job: 'Marine Biologist', city: 'Ratnagiri', comm: 'Hindu, GSB', intro: 'Marine biologist studying Konkan\'s coastal ecosystem. Seeking a partner who loves the ocean as deeply as I do and respects its traditions.' },
      { name: 'Avinash', age: 30, job: 'Coconut Trader', city: 'Ratnagiri', comm: 'Hindu, Bhandari', intro: 'Managing our family\'s coconut trade business. Looking for a partner who values hard work, tradition, and the coastal way of life.' },
      { name: 'Prasad', age: 28, job: 'Fisheries Officer', city: 'Mumbai', comm: 'Hindu, Koli', intro: 'Government fisheries officer ensuring sustainable coastal livelihoods. Seeking a partner who values community service and coastal heritage.' },
      { name: 'Ketki', age: 25, job: 'Ayurveda Practitioner', city: 'Goa', comm: 'Hindu, Saraswat', intro: 'Ayurveda practitioner with a clinic in Goa. Looking for a health-conscious, nature-loving partner rooted in coastal traditions.' }
    ],
    stats: ['3,700+', '86%', '220+', '4.75'],
    statLabs: ['Coastal Profiles', 'Community Trust', 'Coastal Towns', 'Nature Rating'],
    counters: [3700, 86, 220, 4.75],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Trust', 'Towns', 'Rating']
  },

  'vidarbha-orange': {
    eyebrow: 'Sweetness That Lasts a Lifetime',
    h1: 'A Love as Sweet as Vidarbha\'s Golden Oranges',
    sub: 'From the golden orchards of Vidarbha comes a matchmaking sweetness â€” pure, natural, and bursting with the warmth of Nagpur\'s finest traditions.',
    cta1: 'Pick Your Sweet Match',
    cta2: 'Orchard of Stories',
    features: [
      { title: 'Orchard Network', desc: 'Connect with Vidarbha\'s close-knit agricultural and business communities through our trusted network of family connections.' },
      { title: 'Traditional Values Filter', desc: 'Advanced filtering for joint family preferences, traditional ceremonies, and agricultural-business family compatibility.' },
      { title: 'Nagpur City Connect', desc: 'Special focus on Nagpur\'s diverse communities â€” from Gondwana heritage to modern metro culture â€” bridging tradition and progress.' }
    ],
    steps: [
      { title: 'Plant Your Orchard', desc: 'Sow the seeds of a genuine profile that reflects Vidarbha\'s values â€” hard work, family, tradition, and natural warmth.' },
      { title: 'Let Love Ripen', desc: 'Like oranges ripening under the Vidarbha sun, allow relationships to develop naturally through our guided interaction framework.' },
      { title: 'Harvest Forever', desc: 'When the fruit is ripe, celebrate the harvest of a beautiful partnership rooted in the sweetest traditions of Vidarbha.' }
    ],
    stories: [
      { names: 'Nisha & Anil', loc: 'Nagpur', date: 'May 2025', quote: 'Both from orange farming families, our love was as natural as the Vidarbha sunshine. Our wedding featured the most beautiful orange blossoms.' },
      { names: 'Kavita & Rajesh', loc: 'Wardha', date: 'March 2025', quote: 'The traditional values filter matched us perfectly. Our joint family wedding in Nagpur was a celebration of everything we hold dear.' },
      { names: 'Sonal & Pramod', loc: 'Amravati', date: 'January 2025', quote: 'From orchard families to city professionals, we bridged two worlds. The platform made that bridge strong and beautiful.' }
    ],
    testimonials: [
      { name: 'Baburao Gajbhiye', role: 'Agricultural Union Leader', quote: 'Our farming community needed a trustworthy matchmaking platform. This one understands Vidarbha\'s unique culture and agricultural traditions perfectly.' },
      { name: 'Savita Wankhede', role: 'School Teacher', quote: 'I helped my niece create her profile and was impressed by how well the platform captures Vidarbha\'s warmth. She found a wonderful match.' },
      { name: 'Ramesh Zade', role: 'Orange Trader', quote: 'As someone who deals in nature\'s sweetness daily, I appreciate how this platform preserves the natural sweetness of traditional matchmaking.' }
    ],
    profiles: [
      { name: 'Pranali', age: 26, job: 'Agricultural Officer', city: 'Nagpur', comm: 'Hindu, Gond', intro: 'Agricultural officer supporting Vidarbha\'s farming communities. Seeking a partner who values rural traditions and progressive thinking.' },
      { name: 'Sanket', age: 30, job: 'Civil Engineer', city: 'Nagpur', comm: 'Hindu, Deshastha', intro: 'Infrastructure engineer building Vidarbha\'s future. Looking for a grounded, ambitious partner who values family and progress equally.' },
      { name: 'Ajinkya', age: 28, job: 'Lawyer', city: 'Nagpur', comm: 'Hindu, Brahmin', intro: 'Practicing at Nagpur High Court with a focus on agricultural law. Seeking an intelligent, compassionate partner with strong values.' },
      { name: 'Ruchira', age: 25, job: 'Journalist', city: 'Nagpur', comm: 'Hindu, Kunbi', intro: 'TV journalist covering Vidarbha\'s stories. Looking for a partner who values truth, tradition, and the power of storytelling.' }
    ],
    stats: ['4,100+', '87%', '260+', '4.77'],
    statLabs: ['Vidarbha Profiles', 'Family Approval', 'Villages', 'Warmth Rating'],
    counters: [4100, 87, 260, 4.77],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Approval', 'Villages', 'Rating']
  },

  'pune-peshwai': {
    eyebrow: 'The Peshwa Spirit Lives On',
    h1: 'Carry Forward the Peshwa Legacy in Love',
    sub: 'Honour the warrior spirit, intellectual brilliance, and cultural grandeur of the Peshwa era â€” find a partner worthy of this legendary heritage.',
    cta1: 'Claim Your Legacy',
    cta2: 'Explore Peshwa Profiles',
    features: [
      { title: 'Peshwa Heritage Badge', desc: 'Exclusive badge for families who can trace their lineage to the historic Peshwa era, verified through documented family records.' },
      { title: 'Intellectual Heritage Matching', desc: 'Prioritize educational excellence, scholarly traditions, and intellectual pursuits alongside cultural heritage compatibility.' },
      { title: 'Shaniwar Wada Events', desc: 'Exclusive cultural events at historic Pune venues â€” from Shaniwar Wada to Aga Khan Palace â€” connecting heritage families in grand settings.' }
    ],
    steps: [
      { title: 'Declare Your Pedigree', desc: 'Share your family\'s distinguished history, educational achievements, and the Peshwa-era values that drive your aspirations.' },
      { title: 'Match Among the Elite', desc: 'Connect with families of equivalent heritage and educational standing through our exclusive Peshwa Heritage network.' },
      { title: 'Forge an Alliance', desc: 'Like the great Peshwa alliances, unite two distinguished families in a bond that strengthens both legacies for generations.' }
    ],
    stories: [
      { names: 'Aparna & Nikhil', loc: 'Pune', date: 'May 2025', quote: 'Both our families trace lineage to Peshwa-era administrators. Our wedding at a heritage hotel in Pune was a Peshwa-era dream brought to life.' },
      { names: 'Shraddha & Aditya', loc: 'Satara', date: 'March 2025', quote: 'The intellectual matching was perfect â€” both of us are academics with a love for Maratha history. Our first date was at Shaniwar Wada.' },
      { names: 'Pournima & Anand', loc: 'Pune', date: 'January 2025', quote: 'The heritage badge system gave us instant credibility. Our families recognized each other\'s standing immediately. The rest was destiny.' }
    ],
    testimonials: [
      { name: 'Dr. Vasant Navalkar', role: 'Maratha Historian', quote: 'The Peshwa heritage matching on this platform is remarkably well-researched. It preserves our scholarly and warrior traditions beautifully.' },
      { name: 'Sushila Tamhane', role: 'Heritage Preservationist', quote: 'I recommend this platform to heritage families. The events at historic Pune venues make introductions as grand as our history deserves.' },
      { name: 'Mandar Bhat', role: 'Groom', quote: 'Finding someone who understands the Peshwa legacy is rare. This platform connected me with a family who shares our intellectual and cultural values.' }
    ],
    profiles: [
      { name: 'Anushka', age: 27, job: 'History Professor', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'History professor at SPPU specialising in Maratha Empire studies. Seeking an intellectual partner who values scholarship and heritage equally.' },
      { name: 'Siddhesh', age: 31, job: 'IAS Officer', city: 'Pune', comm: 'Hindu, Deshastha', intro: 'Serving as District Collector with Peshwa-era administrative values. Looking for an educated, tradition-loving partner.' },
      { name: 'Omkar', age: 29, job: 'Heritage Architect', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'Restoring Peshwa-era monuments across Maharashtra. Seeking a partner who appreciates heritage architecture and Maratha history.' },
      { name: 'Mrinmayi', age: 26, job: 'Classical Singer', city: 'Pune', comm: 'Hindu, Chitpavan', intro: 'Hindustani classical singer trained at Gandharva Mahavidyalaya. Looking for a musically inclined, culturally rich life partner.' }
    ],
    stats: ['2,800+', '96%', '120+', '4.94'],
    statLabs: ['Heritage Profiles', 'Elite Match', 'Historic Cities', 'Legacy Rating'],
    counters: [2800, 96, 120, 4.94],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'warkari-saffron': {
    eyebrow: 'Walk the Path of Devotion Together',
    h1: 'Find a Devoted Soul on the Warkari Path',
    sub: 'Like the sacred Warkari pilgrimage to Pandharpur, find a partner whose devotion to love, tradition, and Lord Vitthal runs as deep as yours.',
    cta1: 'Join the Warkari Circle',
    cta2: 'See Devotional Stories',
    features: [
      { title: 'Devotion-First Matching', desc: 'Our algorithm prioritizes spiritual values, devotional practices, and temple-going traditions alongside education and family background.' },
      { title: 'Abhang Community', desc: 'Connect with families who sing abhangs together, observe Ekadashi, and walk the sacred Palkhi path of the Warkari tradition.' },
      { title: 'Temple Event Network', desc: 'Attend sacred gatherings at Pandharpur, Alandi, and Dehu to meet like-minded families in the most blessed settings.' }
    ],
    steps: [
      { title: 'Offer Your Bhakti', desc: 'Create a profile that reflects your devotion, spiritual journey, and the saffron-hued values that guide your life.' },
      { title: 'Walk Together', desc: 'Connect with families who share your Warkari traditions through our culturally sensitive matchmaking process.' },
      { title: 'Reach Pandharpur Together', desc: 'Like the Warkari pilgrimage, the journey to finding love is sacred. End it together at the feet of Lord Vitthal.' }
    ],
    stories: [
      { names: 'Anuradha & Vishwas', loc: 'Pune', date: 'May 2025', quote: 'Both Warkari families, both singing abhangs since childhood. This platform united two hearts that beat for Vitthal and each other.' },
      { names: 'Sudha & Dnyaneshwar', loc: 'Solapur', date: 'March 2025', quote: 'We met at a Warkari event organized by the platform. Our Palkhi journey together began with a simple digital introduction.' },
      { names: 'Ketaki & Prasad', loc: 'Satara', date: 'January 2025', quote: 'The devotion-first matching was exactly what our families needed. Our wedding featured the most beautiful abhang performances.' }
    ],
    testimonials: [
      { name: 'Vitthalrao Deshpande', role: 'Warkari Elder', quote: 'In our tradition, marriage is a spiritual union. This platform honours that belief while helping young people find genuine connections.' },
      { name: 'Hema Kshirsagar', role: 'Temple Volunteer', quote: 'I guide young Warkari families through this platform with the same devotion I bring to our temple service. Every match feels blessed.' },
      { name: 'Santosh Jadhav', role: 'Groom', quote: 'As a Warkari, I needed someone who understood our simple, devotional lifestyle. The platform found me a perfect soulmate.' }
    ],
    profiles: [
      { name: 'Asawari', age: 26, job: 'Music Teacher', city: 'Pune', comm: 'Hindu, Deshastha', intro: 'Teaching Indian classical music and abhang singing. Seeking a partner who values devotion, simplicity, and spiritual growth.' },
      { name: 'Dnyaneshwar', age: 30, job: 'Temple Administrator', city: 'Pandharpur', comm: 'Hindu, Brahmin', intro: 'Managing temple affairs in Pandharpur. Looking for a spiritually inclined partner who values tradition and service.' },
      { name: 'Ketaki', age: 28, job: 'Social Worker', city: 'Alandi', comm: 'Hindu, Deshastha', intro: 'Social worker serving rural communities. Seeking a partner who believes in service, devotion, and meaningful living.' },
      { name: 'Sopan', age: 27, job: 'Farmer', city: 'Satara', comm: 'Hindu, Maratha', intro: 'Organic farmer practicing traditional agriculture. Looking for a partner who loves the earth and its sacred traditions.' }
    ],
    stats: ['3,400+', '89%', '180+', '4.83'],
    statLabs: ['Devoted Profiles', 'Spiritual Match', 'Temple Cities', 'Devotion Rating'],
    counters: [3400, 89, 180, 4.83],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'rajwada-palace': {
    eyebrow: 'Palatial Grandeur Meets Sacred Union',
    h1: 'Unite in the Grandeur of Rajwada Royalty',
    sub: 'Like the magnificent Rajwada palace of Indore, find a union adorned with Maratha grandeur, Nizami elegance, and the timeless splendour of royal heritage.',
    cta1: 'Enter the Palace',
    cta2: 'Explore Royal Profiles',
    features: [
      { title: 'Palace-Grade Verification', desc: 'Multi-tier verification including family lineage, educational pedigree, and social standing worthy of Rajwada traditions.' },
      { title: 'Royal Heritage Events', desc: 'Exclusive gatherings at heritage palaces, forts, and havelis where distinguished families meet in grand, culturally rich settings.' },
      { title: 'Nizami-Maratha Fusion', desc: 'Unique matching that bridges Maratha warrior heritage with Nizami cultural refinement for the most distinguished unions.' }
    ],
    steps: [
      { title: 'Present Your Pedigree', desc: 'Craft a profile that reflects your royal heritage, distinguished education, and the grandeur of your family traditions.' },
      { title: 'Enter Royal Circles', desc: 'Access exclusive matchmaking circles reserved for families of distinguished lineage and exceptional standing.' },
      { title: 'Forge a Royal Alliance', desc: 'Uniting two royal families creates a legacy. Let your union be the next chapter in a grand historical narrative.' }
    ],
    stories: [
      { names: 'Mrinalini & Ranveer', loc: 'Indore', date: 'May 2025', quote: 'Both from royal Maratha families, our Rajwada wedding was a fusion of Maratha pride and Nizami elegance. Pure grandeur.' },
      { names: 'Anjali & Vikramaditya', loc: 'Gwalior', date: 'March 2025', quote: 'The palace event in Udaipur was where we first met. The royal heritage filter ensured our families were perfectly matched.' },
      { names: 'Shreya & Dhruv', loc: 'Indore', date: 'January 2025', quote: 'From Rajwada royalty to modern professionals, we carry our heritage with pride. This platform understood our royal aspirations.' }
    ],
    testimonials: [
      { name: 'Dr. Ashok Rajpurohit', role: 'Heritage Scholar', quote: 'The Rajwada heritage matching on this platform is the most authentic I have seen. It preserves our royal traditions with remarkable accuracy.' },
      { name: 'Vijaya Scindia', role: 'Event Hostess', quote: 'I host palace events for this platform. The quality of families and the grandeur of introductions is truly exceptional.' },
      { name: 'Arjun Malhotra', role: 'Groom', quote: 'Finding someone who understands the responsibilities of royal heritage is rare. This platform connected me with a family of great standing.' }
    ],
    profiles: [
      { name: 'Mrinalini', age: 27, job: 'Art Curator', city: 'Indore', comm: 'Hindu, Rajput', intro: 'Curating royal art collections across Central India. Seeking a partner who appreciates heritage, art, and the responsibilities of legacy.' },
      { name: 'Vikramaditya', age: 31, job: 'Hotel Chain CEO', city: 'Gwalior', comm: 'Hindu, Rajput', intro: 'Running a heritage hotel chain preserving Maratha traditions. Looking for a cultured, accomplished partner.' },
      { name: 'Anirudh', age: 29, job: 'Heritage Consultant', city: 'Udaipur', comm: 'Hindu, Rajput', intro: 'Consulting on palace restoration projects. Seeking a partner who values history, architecture, and cultural preservation.' },
      { name: 'Padmavati', age: 26, job: 'Classical Dancer', city: 'Indore', comm: 'Hindu, Brahmin', intro: 'Bharatanatyam performer trained in the royal tradition. Looking for a musically inclined, culturally rich partner.' }
    ],
    stats: ['2,100+', '94%', '85+', '4.93'],
    statLabs: ['Royal Profiles', 'Elite Match', 'Palace Cities', 'Grandeur Rating'],
    counters: [2100, 94, 85, 4.93],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'shaniwar-wada': {
    eyebrow: 'Where History Meets Holy Matrimony',
    h1: 'Build Your Legacy at the Shaniwar Wada of Love',
    sub: 'Inspired by the majestic Shaniwar Wada of Pune, find a partner worthy of the Peshwa legacy \u2014 one built on honour, intellect, and unshakeable devotion.',
    cta1: 'Claim Your Legacy',
    cta2: 'View Heritage Matches',
    features: [
      { title: 'Peshwa Heritage Matching', desc: 'Our unique algorithm considers family lineage, educational excellence, and the Maratha warrior spirit for distinguished matches.' },
      { title: 'Fortress-Grade Security', desc: 'Like the impregnable Shaniwar Wada walls, your privacy and data are protected with fortress-level security protocols.' },
      { title: 'Historical Venue Events', desc: 'Meet at iconic Pune locations \u2014 Shaniwar Wada, Aga Khan Palace, Sinhagad Fort \u2014 for culturally enriched introductions.' }
    ],
    steps: [
      { title: 'Build Your Fortress', desc: 'Create a strong, detailed profile that reflects the strength and character of the Peshwa tradition.' },
      { title: 'Survey the Kingdom', desc: 'Explore carefully curated matches from families who share your intellectual rigour and cultural pride.' },
      { title: 'Establish Your Dynasty', desc: 'Like the great Peshwas, build a partnership that strengthens both families for generations to come.' }
    ],
    stories: [
      { names: 'Ananya & Aditya', loc: 'Pune', date: 'May 2025', quote: 'Both families traced their roots to Peshwa-era Pune. Our wedding at Shaniwar Wada was a dream come true for both families.' },
      { names: 'Pooja & Manoj', loc: 'Satara', date: 'March 2025', quote: 'The heritage matching was incredibly precise. Our first conversation about Maratha history lasted four hours. The rest is history.' },
      { names: 'Kavita & Suresh', loc: 'Pune', date: 'January 2025', quote: 'The Shaniwar Wada theme resonated with both our families. Our traditional wedding honoured the Peshwa spirit beautifully.' }
    ],
    testimonials: [
      { name: 'Prof. Rajendra Vaidya', role: 'Maratha Historian', quote: 'As someone who studies Peshwa history, I am impressed by how authentically this platform captures the spirit of Shaniwar Wada.' },
      { name: 'Sunita Bhosale', role: 'Cultural Organizer', quote: 'The heritage events at historical Pune venues make introductions as grand as our Maratha history deserves. Truly exceptional.' },
      { name: 'Vikrant Kulkarni', role: 'Groom', quote: 'Finding someone who understands the Peshwa legacy is rare. This platform connected me with a family of great honour and tradition.' }
    ],
    profiles: [
      { name: 'Ananya', age: 27, job: 'IAS Officer', city: 'Pune', comm: 'Hindu, Chitpavan', intro: 'District Collector serving Maharashtra with Peshwa-era administrative values. Looking for an educated, tradition-loving partner.' },
      { name: 'Aditya', age: 30, job: 'Startup Founder', city: 'Pune', comm: 'Hindu, Deshastha', intro: 'Building India\'s next unicorn while honouring Maratha entrepreneurial traditions. Seeking a driven, cultured partner.' },
      { name: 'Rohan', age: 28, job: 'Defence Officer', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'Indian Army officer from a family of warriors. Seeking a brave, compassionate partner who values service and sacrifice.' },
      { name: 'Mrudula', age: 25, job: 'Historian', city: 'Pune', comm: 'Hindu, Chitpavan', intro: 'Researching Maratha Empire at SPPU. Looking for an intellectually stimulating partner who values history and heritage.' }
    ],
    stats: ['2,600+', '95%', '95+', '4.91'],
    statLabs: ['Heritage Profiles', 'Fortress Match', 'Historic Cities', 'Legacy Rating'],
    counters: [2600, 95, 95, 4.91],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'fort-terracotta': {
    eyebrow: 'Strong as Ancient Fort Walls',
    h1: 'Build a Fortress of Love on Sacred Ground',
    sub: 'Like the terracotta walls of Maharashtra\'s ancient forts, construct a marriage founded on unshakeable strength, earthy warmth, and enduring tradition.',
    cta1: 'Build Your Fortress',
    cta2: 'Explore Fort Heritage',
    features: [
      { title: 'Fort-Strength Verification', desc: 'Thorough verification as strong as fort walls \u2014 background checks, family validation, and character assessment for unshakeable trust.' },
      { title: 'Heritage Fort Events', desc: 'Meet at Raigad, Pratapgad, Sinhagad, and other historic forts for culturally meaningful introductions in breathtaking settings.' },
      { title: 'Warrior Spirit Matching', desc: 'Our algorithm matches families who embody the Maratha warrior spirit \u2014 courage, honour, resilience, and devotion to family.' }
    ],
    steps: [
      { title: 'Lay the Foundation', desc: 'Build a strong profile on the bedrock of your values, family traditions, and the warrior spirit that defines you.' },
      { title: 'Raise the Walls', desc: 'Strengthen your search with verified introductions to families of equivalent strength, honour, and cultural standing.' },
      { title: 'Guard Your Love', desc: 'Like the eternal forts of Maharashtra, protect and cherish the sacred bond you have built for generations to come.' }
    ],
    stories: [
      { names: 'Vrushali & Prasad', loc: 'Pune', date: 'May 2025', quote: 'We met at a fort event at Raigad. The warrior spirit in both our families created an instant bond. Our fort-wedding was legendary.' },
      { names: 'Sneha & Ganesh', loc: 'Satara', date: 'March 2025', quote: 'The terracotta theme resonated with our earthy Kolhapuri roots. Our love is as strong as the ancient walls that inspired our meeting.' },
      { names: 'Pournima & Rajan', loc: 'Kolhapur', date: 'January 2025', quote: 'Both from farming-warrior families, our connection was built on shared strength. This platform fortified our beautiful relationship.' }
    ],
    testimonials: [
      { name: 'Col. Suresh Patil', role: 'Retired Army Officer', quote: 'The warrior spirit matching truly understands the Maratha ethos. My son found a partner from an equally honourable family.' },
      { name: 'Lata Shinde', role: 'Fort Heritage Guide', quote: 'I guide cultural events at Maharashtra\'s forts. The couples who meet here share a deep respect for our warrior heritage.' },
      { name: 'Rajendra More', role: 'Groom', quote: 'As a farmer and athlete, I needed someone who understood strength and resilience. The platform matched me perfectly.' }
    ],
    profiles: [
      { name: 'Vrushali', age: 26, job: 'Sports Coach', city: 'Kolhapur', comm: 'Hindu, Maratha', intro: 'Kabaddi coach training Maharashtra\'s future champions. Seeking a strong, disciplined partner who values athletics and tradition.' },
      { name: 'Prasad', age: 31, job: 'Army Captain', city: 'Pune', comm: 'Hindu, Maratha', intro: 'Serving in the Indian Army with distinction. Looking for a brave, compassionate partner who understands military life.' },
      { name: 'Ganesh', age: 29, job: 'Businessman', city: 'Satara', comm: 'Hindu, Maratha', intro: 'Running a successful logistics business with traditional values. Seeking a grounded, ambitious partner.' },
      { name: 'Mrunalini', age: 25, job: 'Kho-Kho Player', city: 'Kolhapur', comm: 'Hindu, Lingayat', intro: 'National-level Kho-Kho player representing Maharashtra. Looking for a sporty, active partner who values fitness and tradition.' }
    ],
    stats: ['3,800+', '90%', '220+', '4.85'],
    statLabs: ['Fort Profiles', 'Warrior Match', 'Heritage Forts', 'Strength Rating'],
    counters: [3800, 90, 220, 4.85],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Forts', 'Rating']
  },

  'maharaja-court': {
    eyebrow: 'The Court of Eternal Matches',
    h1: 'Present Yourself at the Maharaja\'s Court',
    sub: 'Enter the grand court of matchmaking where only the most distinguished families are received \u2014 where every introduction is an audience with royalty.',
    cta1: 'Request an Audience',
    cta2: 'View Court Profiles',
    features: [
      { title: 'Maharaja-Grade Screening', desc: 'The most rigorous verification process \u2014 income validation, family background research, educational credentialing, and social standing assessment.' },
      { title: 'Exclusive Court Events', desc: 'Private, invitation-only gatherings at palace hotels, heritage properties, and cultural institutions for the most elite families.' },
      { title: 'Royal Matchmaker Network', desc: 'Experienced, discreet matchmakers who personally facilitate introductions between families of the highest social standing.' }
    ],
    steps: [
      { title: 'Present Your Credentials', desc: 'Submit a detailed profile showcasing your family\'s distinguished lineage, achievements, and cultural contributions.' },
      { title: 'Await Royal Summons', desc: 'Our elite matchmakers review and present your profile to perfectly matched families for royal-level introductions.' },
      { title: 'Seal the Alliance', desc: 'When two royal families unite, the celebration must be worthy of the grandeur both legacies deserve.' }
    ],
    stories: [
      { names: 'Madhuri & Rajesh', loc: 'Mumbai', date: 'May 2025', quote: 'The Maharaja-grade screening gave us absolute confidence. Our royal wedding at the Taj Palace was everything we envisioned.' },
      { names: 'Priyanka & Harshvardhan', loc: 'Delhi', date: 'March 2025', quote: 'The private court event at Udaipur was magical. We met in a setting worthy of our families\' distinguished heritage.' },
      { names: 'Aishani & Pratap', loc: 'Jaipur', date: 'January 2025', quote: 'The royal matchmaker understood exactly what both families wanted. Our courtship was as elegant as the platform\'s name suggests.' }
    ],
    testimonials: [
      { name: 'Maharani Padmavati Singh', role: 'Royal Family Member', quote: 'The court events organized by this platform rival the grandeur of actual royal gatherings. Every introduction is handled with utmost dignity.' },
      { name: 'Rajiv Bajaj', role: 'Industrialist', quote: 'As someone who values discretion and quality, the Maharaja-grade screening was exactly what our family needed. Exceptional service.' },
      { name: 'Vikram Rathore', role: 'Matchmaker', quote: 'In thirty years of elite matchmaking, this platform has elevated the art to new heights. The families here are truly distinguished.' }
    ],
    profiles: [
      { name: 'Madhuri', age: 28, job: 'Luxury Brand Director', city: 'Mumbai', comm: 'Hindu, Khatri', intro: 'Directing luxury brands at LVMH India. Seeking a sophisticated, well-travelled partner who appreciates life\'s finest experiences.' },
      { name: 'Rajesh', age: 32, job: 'Investment Fund Manager', city: 'Mumbai', comm: 'Hindu, Bania', intro: 'Managing a ₹500 Cr investment fund. Looking for an equally accomplished partner who values both success and tradition.' },
      { name: 'Pratap', age: 30, job: 'Heritage Hotelier', city: 'Udaipur', comm: 'Hindu, Rajput', intro: 'Managing a chain of heritage palace hotels. Seeking a refined partner who appreciates Rajasthan\'s royal grandeur.' },
      { name: 'Kamini', age: 27, job: 'Fashion Curator', city: 'Delhi', comm: 'Hindu, Arora', intro: 'Curating fashion exhibitions at national museums. Looking for an intellectually stimulating, culturally rich partner.' }
    ],
    stats: ['1,800+', '97%', '65+', '4.96'],
    statLabs: ['Elite Profiles', 'Royal Match', 'Metro Cities', 'Grandeur Rating'],
    counters: [1800, 97, 65, 4.96],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'gadget-blue': {
    eyebrow: 'Where Modern Minds Meet Traditional Hearts',
    h1: 'A Perfect Match of Tech & Tradition',
    sub: 'For the tech-savvy Indian who refuses to choose between innovation and heritage \u2014 find a partner who codes in the morning and performs puja in the evening.',
    cta1: 'Find Your Tech Soulmate',
    cta2: 'Browse Developer Profiles',
    features: [
      { title: 'Tech Compatibility Filter', desc: 'Match by tech stack preferences, startup ambitions, work culture, and digital lifestyle alongside traditional compatibility.' },
      { title: 'Geek Meets Heritage Events', desc: 'Unique events combining tech talks with cultural experiences \u2014 hackathons at temples, coding sprints at heritage caf\u00e9s.' },
      { title: 'NRI Tech Network', desc: 'Connect with tech professionals across Silicon Valley, Bangalore, Hyderabad, and Pune who maintain strong traditional roots.' }
    ],
    steps: [
      { title: 'Compile Your Profile', desc: 'Build a detailed profile covering your tech career, cultural values, family traditions, and what you seek in a partner.' },
      { title: 'Run Compatibility Tests', desc: 'Use our intelligent matching to find profiles that align with your tech aspirations and traditional values simultaneously.' },
      { title: 'Deploy Your Love Story', desc: 'When the right match compiles, deploy your relationship with confidence, supported by our tech-savvy matchmaking engine.' }
    ],
    stories: [
      { names: 'Neha & Karthik', loc: 'Bangalore', date: 'May 2025', quote: 'Both IIT graduates, both tech leads, both deeply traditional. The platform found us each other in a pool of millions. Perfect algorithm.' },
      { names: 'Priyanka & Aditya', loc: 'Hyderabad', date: 'March 2025', quote: 'We bonded over React and Ravana Dahan in the same conversation. This platform gets the tech-tradition balance perfectly.' },
      { names: 'Swati & Rohan', loc: 'Pune', date: 'January 2025', quote: 'From GitHub commits to Ganesh Chaturthi, our relationship spans both worlds. This platform was the perfect merge request.' }
    ],
    testimonials: [
      { name: 'Sundar Krishnamurthy', role: 'Google Engineer', quote: 'As a tech professional, I appreciated the data-driven matching. But the cultural sensitivity is what truly impressed me.' },
      { name: 'Deepika Padukone-Singh', role: 'Product Manager', quote: 'The tech compatibility filter matched us on work style AND values. Our startup together is now profitable and so is our marriage.' },
      { name: 'Amit Agarwal', role: 'Tech Blogger', quote: 'Finally a platform that understands modern Indian techies aren\'t abandoning tradition \u2014 they\'re evolving it. Brilliant matchmaking.' }
    ],
    profiles: [
      { name: 'Neha', age: 27, job: 'ML Engineer at Google', city: 'Bangalore', comm: 'Hindu, Brahmin', intro: 'Building AI systems by day, performing Bharatanatyam by evening. Looking for a tech-savvy partner who values classical arts.' },
      { name: 'Karthik', age: 30, job: 'Startup CTO', city: 'Hyderabad', comm: 'Hindu, Iyengar', intro: 'CTO of a Series B startup. Seeking an ambitious, tech-literate partner who also maintains strong family values.' },
      { name: 'Rohan', age: 29, job: 'Senior SDE at Amazon', city: 'Pune', comm: 'Hindu, Chitpavan', intro: 'Full-stack developer with a passion for open source and classical music. Looking for a creative, intelligent partner.' },
      { name: 'Aishwarya', age: 26, job: 'Data Scientist at Microsoft', city: 'Hyderabad', comm: 'Hindu, Reddy', intro: 'Data scientist analyzing patterns in love and life. Seeking a partner who appreciates both data and devotion.' }
    ],
    stats: ['8,500+', '91%', '320+', '4.88'],
    statLabs: ['Tech Profiles', 'Geek Match', 'Tech Cities', 'Innovation Rating'],
    counters: [8500, 91, 320, 4.88],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'pearl-ivory': {
    eyebrow: 'Pristine as a Pearl, Pure as Ivory',
    h1: 'Discover a Love as Precious as Pearls',
    sub: 'Elegant, luminous, and eternally valuable \u2014 find a partner whose inner beauty shines with the same lustre as the finest South Sea pearls.',
    cta1: 'Find Your Pearl',
    cta2: 'Explore Elegant Matches',
    features: [
      { title: 'Pearl-Grade Screening', desc: 'Our most elegant verification process \u2014 subtle, refined, and thorough, ensuring only the most genuine, sophisticated profiles.' },
      { title: 'Elegance-First Matching', desc: 'Matching based on refined sensibilities, aesthetic values, educational sophistication, and cultural elegance.' },
      { title: 'Pearl Gallery Events', desc: 'Intimate, curated gatherings at art galleries, classical concerts, and luxury spas for discerning singles.' }
    ],
    steps: [
      { title: 'Polish Your Profile', desc: 'Refine your profile with the care and attention of a master pearl diver \u2014 every detail polished to perfection.' },
      { title: 'Navigate Deep Waters', desc: 'Dive into our curated match pool where elegance and authenticity are the only currencies that matter.' },
      { title: 'Surface with Your Pearl', desc: 'When you find that one precious connection, surface with the confidence of someone who has found true treasure.' }
    ],
    stories: [
      { names: 'Shreya & Varun', loc: 'Mumbai', date: 'May 2025', quote: 'The elegant gallery event was where we first locked eyes. Two art lovers, two pearl souls, one luminous connection.' },
      { names: 'Nisha & Ankit', loc: 'Delhi', date: 'March 2025', quote: 'The pearl-grade screening ensured both families were refined and genuine. Our pearl-white wedding was pure elegance.' },
      { names: 'Meera & Siddharth', loc: 'Chennai', date: 'January 2025', quote: 'From pearl jewelry to pearl-white beaches, this platform understood our aesthetic sensibility from the very first click.' }
    ],
    testimonials: [
      { name: 'Lalitha Iyer', role: 'Art Curator', quote: 'The elegance of this platform\'s matchmaking approach is as refined as the art I curate. Every introduction is a masterpiece.' },
      { name: 'Ravi Shankar Prasad', role: 'Jewelry Designer', quote: 'As someone who designs with pearls daily, I appreciate the precious attention to detail this platform brings to matchmaking.' },
      { name: 'Deepak Menon', role: 'Groom', quote: 'The refined matching process found me a partner whose elegance matched my family\'s values perfectly. A precious connection.' }
    ],
    profiles: [
      { name: 'Shreya', age: 28, job: 'Art Director', city: 'Mumbai', comm: 'Hindu, Iyengar', intro: 'Art director at a top ad agency, curating beauty in every frame. Seeking a refined, aesthetically sensitive partner.' },
      { name: 'Varun', age: 31, job: 'Jewelry Designer', city: 'Jaipur', comm: 'Hindu, Maheshwari', intro: 'Third-generation pearl and gemstone jeweler. Looking for someone who appreciates the finer things and deeper values.' },
      { name: 'Siddharth', age: 29, job: 'Fashion Photographer', city: 'Delhi', comm: 'Hindu, Khatri', intro: 'Fashion photographer for Vogue India. Seeking a partner with impeccable taste and a warm, genuine heart.' },
      { name: 'Ananya', age: 26, job: 'Classical Singer', city: 'Chennai', comm: 'Hindu, Iyer', intro: 'Carnatic vocalist performing at sabhas across India. Looking for a musically inclined, culturally sophisticated partner.' }
    ],
    stats: ['2,900+', '93%', '120+', '4.94'],
    statLabs: ['Pearl Profiles', 'Elegance Match', 'Art Cities', 'Luxury Rating'],
    counters: [2900, 93, 120, 4.94],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'velvet-wine': {
    eyebrow: 'Rich as Velvet, Deep as Wine',
    h1: 'Find a Love as Luxurious as Velvet',
    sub: 'For those who appreciate the finer textures of life \u2014 deep, rich, and intoxicating connections wrapped in the warmth of velvet sophistication.',
    cta1: 'Indulge in Luxury',
    cta2: 'Explore Premium Matches',
    features: [
      { title: 'Velvet-Soft Introduction', desc: 'Smooth, sophisticated introductions handled with the delicacy of velvet \u2014 no rush, no pressure, just elegant progression.' },
      { title: 'Wine & Dine Experiences', desc: 'Exclusive dining experiences at Michelin-star restaurants, wine cellars, and luxury lounges for the most refined connections.' },
      { title: 'Connoisseur Network', desc: 'Access a curated network of accomplished professionals, artists, and cultural connoisseurs who appreciate life\'s luxuries.' }
    ],
    steps: [
      { title: 'Uncork Your Story', desc: 'Share the rich, complex notes of your personality \u2014 your passions, achievements, and the luxurious life you envision.' },
      { title: 'Savor the Introduction', desc: 'Like a fine vintage, let each introduction develop at its own pace, revealing layers of compatibility and connection.' },
      { title: 'Toast to Forever', desc: 'When the perfect blend is found, raise a glass to a love that will only grow richer with time.' }
    ],
    stories: [
      { names: 'Ritu & Vikash', loc: 'Mumbai', date: 'May 2025', quote: 'The wine tasting event was where our eyes met over a glass of Barolo. Rich, deep, and intoxicating from the very first sip.' },
      { names: 'Simran & Arjun', loc: 'Delhi', date: 'March 2025', quote: 'The velvet-soft introduction process felt luxurious. Our wedding at the Oberoi was as rich and elegant as our love story.' },
      { names: 'Divya & Nikhil', loc: 'Bangalore', date: 'January 2025', quote: 'Both wine enthusiasts, both luxury lovers, both deeply traditional. The platform blended us like the perfect vintage.' }
    ],
    testimonials: [
      { name: 'Somesh Singh', role: 'Sommelier', quote: 'I appreciate the art of blending fine wines. This platform applies the same artistry to blending hearts. Remarkably sophisticated.' },
      { name: 'Pooja Bhatt', role: 'Hotelier', quote: 'The luxury events organized by this platform rival the grandeur of my five-star properties. The connections formed are equally premium.' },
      { name: 'Rajesh Khanna Jr', role: 'Groom', quote: 'The velvet-soft approach was exactly what I needed. No pressure, no rush \u2014 just elegant, meaningful introductions leading to true love.' }
    ],
    profiles: [
      { name: 'Ritu', age: 28, job: 'Luxury Brand Manager', city: 'Mumbai', comm: 'Hindu, Khatri', intro: 'Managing premium lifestyle brands at LVMH. Seeking a partner with sophisticated taste and a generous, warm personality.' },
      { name: 'Vikash', age: 32, job: 'Fine Dining Restaurateur', city: 'Delhi', comm: 'Hindu, Bania', intro: 'Owner of three award-winning restaurants. Looking for a food-loving, cultured partner who appreciates life\'s indulgences.' },
      { name: 'Nikhil', age: 30, job: 'Private Equity VP', city: 'Mumbai', comm: 'Hindu, Gupta', intro: 'VP at a leading PE firm. Seeking an accomplished, refined partner for a life of luxury, adventure, and deep connection.' },
      { name: 'Aarti', age: 27, job: 'Interior Designer', city: 'Delhi', comm: 'Hindu, Arora', intro: 'Designing luxury residences for India\'s elite. Looking for a partner who appreciates beauty, comfort, and elegant living.' }
    ],
    stats: ['3,100+', '94%', '140+', '4.92'],
    statLabs: ['Velvet Profiles', 'Luxury Match', 'Premium Cities', 'Sophistication Rating'],
    counters: [3100, 94, 140, 4.92],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'zari-embroidered': {
    eyebrow: 'Every Thread Tells a Love Story',
    h1: 'Find a Match as Intricate as Zari Work',
    sub: 'Like the exquisite zari embroidery of Banaras and Maharashtra, every match on this platform is woven with golden threads of trust, tradition, and timeless craft.',
    cta1: 'Weave Your Story',
    cta2: 'Explore Artisan Matches',
    features: [
      { title: 'Zari-Craft Matching', desc: 'Precision matchmaking as intricate as zari embroidery \u2014 every detail considered, every compatibility thread carefully woven.' },
      { title: 'Textile Heritage Network', desc: 'Connect with families who value India\'s rich textile heritage \u2014 from Banarasi weavers to Paithani artisans.' },
      { title: 'Crafted Introductions', desc: 'Handcrafted introduction letters written with the care and artistry of master zari workers, reflecting the beauty of your profile.' }
    ],
    steps: [
      { title: 'Thread Your Profile', desc: 'Weave together your story, values, and aspirations into a profile as beautiful as a zari-embroidered masterpiece.' },
      { title: 'Follow the Golden Thread', desc: 'Let our matchmaking artisans guide you along the golden threads of compatibility to your perfect match.' },
      { title: 'Complete the Pattern', desc: 'When every thread aligns, step into a love story as magnificent as the most exquisite zari creation.' }
    ],
    stories: [
      { names: 'Vaishnavi & Kedar', loc: 'Varanasi', date: 'May 2025', quote: 'Both from weaving families, our love story was embroidered by fate. The zari-inspired matching was meant for us.' },
      { names: 'Sonal & Prakash', loc: 'Mumbai', date: 'March 2025', quote: 'The crafted introduction felt like receiving a handwoven letter. Every word was thoughtful, every detail precise. Beautiful.' },
      { names: 'Kavita & Suresh', loc: 'Surat', date: 'January 2025', quote: 'From textile families to textile hearts, this platform wove our families together with the golden thread of love.' }
    ],
    testimonials: [
      { name: 'Padma Venkataraman', role: 'Textile Scholar', quote: 'The zari-craft matching approach is as meticulous as the embroidery itself. Every detail is considered with artisan precision.' },
      { name: 'Mohammad Sharif', role: 'Master Weaver', quote: 'I have woven zari for forty years. This platform weaves something equally precious \u2014 bonds between heritage families.' },
      { name: 'Ganesh Agarwal', role: 'Groom', quote: 'The golden thread of compatibility was undeniable. My wife\'s family runs a textile house. Our families are now one beautiful fabric.' }
    ],
    profiles: [
      { name: 'Vaishnavi', age: 27, job: 'Fashion Designer', city: 'Varanasi', comm: 'Hindu, Bania', intro: 'Fashion designer blending Banarasi zari with modern silhouettes. Seeking a partner who values craft, tradition, and creativity.' },
      { name: 'Kedar', age: 30, job: 'Textile Entrepreneur', city: 'Surat', comm: 'Hindu, Bania', intro: 'Running a zari export business to global markets. Looking for a partner who shares my pride in Indian textile heritage.' },
      { name: 'Rajesh', age: 28, job: 'Weaving Master', city: 'Paithan', comm: 'Hindu, Devang', intro: 'Third-generation Paithani weaver with modern design sensibilities. Seeking an innovative, tradition-loving partner.' },
      { name: 'Anjali', age: 25, job: 'Textile Curator', city: 'Mumbai', comm: 'Hindu, Khatri', intro: 'Curating textile exhibitions at the V&A Museum. Looking for a culturally aware, aesthetically sensitive partner.' }
    ],
    stats: ['2,700+', '92%', '160+', '4.89'],
    statLabs: ['Zari Profiles', 'Craft Match', 'Textile Cities', 'Artistry Rating'],
    counters: [2700, 92, 160, 4.89],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  /* ─── Festive 8 ──────────────────────────────────────────── */

  'diwali-sparkle': {
    eyebrow: 'Light Up Your Life with Love',
    h1: 'Let Diwali Sparkle Guide You to Your Soulmate',
    sub: 'Like the million diyas that illuminate the darkest night, let the festival of lights illuminate your path to a love that glows forever.',
    cta1: 'Light Your Diya', cta2: 'See Festive Stories',
    features: [
      { title: 'Festival-First Events', desc: 'Meet at grand Diwali melas, community celebrations, and festive gatherings where the spirit of joy opens hearts to love.' },
      { title: 'Sparkle Compatibility', desc: 'Our festive algorithm matches families who celebrate with equal enthusiasm, from rangoli competitions to Diwali card parties.' },
      { title: 'Luxury Gift Matching', desc: 'Premium introductions accompanied by curated Diwali gift boxes for families who appreciate thoughtful, elegant gestures.' }
    ],
    steps: [
      { title: 'Light the First Diya', desc: 'Create a profile as bright and welcoming as a Diwali lamp \u2014 warm, inviting, and full of festive spirit.' },
      { title: 'Follow the Sparkle', desc: 'Let the sparkling connections guide you through our festive matchmaking to your perfect Diwali match.' },
      { title: 'Celebrate Together', desc: 'When two families unite during the festival of lights, every Diwali becomes brighter, every celebration more joyful.' }
    ],
    stories: [
      { names: 'Pallavi & Sameer', loc: 'Mumbai', date: 'November 2025', quote: 'We met at a Diwali card party organized by the platform. The sparkle in her eyes matched the diyas around us.' },
      { names: 'Neha & Rajesh', loc: 'Pune', date: 'November 2024', quote: 'The Diwali melas created the most magical setting for our first meeting. Our wedding featured a thousand diyas.' },
      { names: 'Shweta & Aditya', loc: 'Delhi', date: 'November 2024', quote: 'The festival of lights brought us the brightest light of our lives. This platform was the spark.' }
    ],
    testimonials: [
      { name: 'Lata Desai', role: 'Community Leader', quote: 'The Diwali events organized by this platform bring our community together beautifully. Love blossoms among the diyas.' },
      { name: 'Rajendra Kothari', role: 'Event Sponsor', quote: 'I sponsor the Diwali celebrations every year. The matches formed during the festival season are always special.' },
      { name: 'Amitabh Sharma', role: 'Groom', quote: 'The sparkle compatibility matched us perfectly. Our Diwali celebration together was the most beautiful night.' }
    ],
    profiles: [
      { name: 'Pallavi', age: 26, job: 'Event Planner', city: 'Mumbai', comm: 'Hindu, Bania', intro: 'Planning grand Diwali celebrations and corporate events. Seeking a fun-loving, culturally vibrant partner.' },
      { name: 'Sameer', age: 30, job: 'Businessman', city: 'Mumbai', comm: 'Hindu, Khatri', intro: 'Running a successful trading business. Looking for a warm, festive-loving partner.' },
      { name: 'Aditya', age: 29, job: 'Marketing Director', city: 'Delhi', comm: 'Hindu, Aggarwal', intro: 'Leading brand marketing at a Fortune 500 company. Seeking an energetic, culturally rich partner.' },
      { name: 'Kritika', age: 25, job: 'Jewelry Designer', city: 'Jaipur', comm: 'Hindu, Maheshwari', intro: 'Designing Diwali-inspired jewelry collections. Looking for a partner who appreciates festive beauty.' }
    ],
    stats: ['6,100+', '90%', '280+', '4.86'],
    statLabs: ['Festive Profiles', 'Diwali Match', 'Celebrations', 'Sparkle Rating'],
    counters: [6100, 90, 280, 4.86], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Events', 'Rating']
  },

  'ganesh-chaturthi': {
    eyebrow: 'Ganpati Bappa Morya! Find Your Match',
    h1: 'Let Lord Ganesha Bless Your Journey to Love',
    sub: 'As Lord Ganesha removes all obstacles, let this platform remove the barriers between you and your perfect life partner.',
    cta1: 'Seek Ganesha\'s Blessing', cta2: 'See Ganesh Stories',
    features: [
      { title: 'Ganesh-Themed Events', desc: 'Meet at Ganesh Chaturthi celebrations, visarjan processions, and cultural events where devotion and romance blend.' },
      { title: 'Obstacle-Free Matching', desc: 'Like Lord Ganesha, our platform removes the obstacles between you and your perfect match.' },
      { title: 'Community Celebrations', desc: 'Join massive Ganesh Chaturthi celebrations where thousands of families gather for matchmaking.' }
    ],
    steps: [
      { title: 'Invoke the Remover', desc: 'Begin your search with the blessings of Lord Ganesha, removing all doubts and obstacles from your path.' },
      { title: 'Follow the Procession', desc: 'Let the festive energy of Ganesh Chaturthi guide you toward divinely orchestrated connections.' },
      { title: 'Celebrate the Union', desc: 'When two Ganesha-devoted families unite, every obstacle is already removed. Celebrate with a blessed beginning.' }
    ],
    stories: [
      { names: 'Mangal & Priya', loc: 'Mumbai', date: 'September 2025', quote: 'We met at a Ganesh Chaturthi celebration. Lord Ganesha truly removed every obstacle between us.' },
      { names: 'Vidya & Ganesh', loc: 'Pune', date: 'September 2024', quote: 'The Ganesh festival events brought us together in the most auspicious way. Our wedding began with Ganesh puja.' },
      { names: 'Smita & Ramesh', loc: 'Thane', date: 'September 2024', quote: 'Both Ganesh devotees, both festival lovers, both blessed. This platform was our digital Ganpati Bappa.' }
    ],
    testimonials: [
      { name: 'Mohan Joshi', role: 'Mandal President', quote: 'Every year, our mandal welcomes couples who found each other through this platform. Blessed connections.' },
      { name: 'Sunita Gokhale', role: 'Festival Organizer', quote: 'The Ganesh Chaturthi events are the highlight of our community calendar. Beautiful connections form naturally.' },
      { name: 'Ganesh Kulkarni', role: 'Groom', quote: 'My name is Ganesh and I found my match through Ganesh Chaturthi events. The divine connection was undeniable.' }
    ],
    profiles: [
      { name: 'Mangal', age: 27, job: 'Temple Priest', city: 'Mumbai', comm: 'Hindu, Brahmin', intro: 'Performing pujas at our family temple. Seeking a spiritually inclined, festive-loving partner.' },
      { name: 'Priya', age: 25, job: 'Classical Dancer', city: 'Pune', comm: 'Hindu, Chitpavan', intro: 'Bharatanatyam dancer performing at festivals. Looking for a culturally vibrant partner.' },
      { name: 'Ramesh', age: 30, job: 'Mandal President', city: 'Mumbai', comm: 'Hindu, CKP', intro: 'Organizing grand Ganesh Chaturthi celebrations. Seeking a community-minded, festive partner.' },
      { name: 'Lakshmi', age: 26, job: 'Florist', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'Creating floral arrangements for temples. Looking for a creative, spiritually grounded partner.' }
    ],
    stats: ['7,200+', '89%', '340+', '4.87'],
    statLabs: ['Ganesh Profiles', 'Blessed Match', 'Festivals', 'Devotion Rating'],
    counters: [7200, 89, 340, 4.87], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Festivals', 'Rating']
  },

  'rangoli-festival': {
    eyebrow: 'Colors of Love on Every Step',
    h1: 'Walk on a Rangoli Path to True Love',
    sub: 'Like the vibrant rangoli that welcomes prosperity, let the colorful patterns guide you to a love as beautiful as its designs.',
    cta1: 'Create Your Rangoli', cta2: 'See Colorful Stories',
    features: [
      { title: 'Rangoli-Themed Gatherings', desc: 'Attend rangoli competitions, cultural events, and colorful community celebrations where singles meet naturally.' },
      { title: 'Pattern Compatibility', desc: 'Our visual matching identifies complementary personality patterns \u2014 like how rangoli colors create harmony.' },
      { title: 'Festival Art Network', desc: 'Connect with families who value traditional arts \u2014 from rangoli and kolam to mehendi and mural painting.' }
    ],
    steps: [
      { title: 'Draw Your Pattern', desc: 'Create a profile that paints the beautiful picture of your life, values, and the patterns that make you unique.' },
      { title: 'Follow the Colors', desc: 'Let the vibrant energy guide you toward complementary colors and harmonious patterns of love.' },
      { title: 'Complete the Design', desc: 'When the perfect pattern emerges, celebrate a love story as colorful as the finest rangoli art.' }
    ],
    stories: [
      { names: 'Arti & Deepak', loc: 'Jaipur', date: 'March 2025', quote: 'We met at a rangoli competition. Two artists, two colors, one beautiful design of love.' },
      { names: 'Minal & Bhushan', loc: 'Indore', date: 'January 2025', quote: 'The pattern compatibility was eerily accurate. Our personalities complemented each other like rangoli colors.' },
      { names: 'Komal & Suresh', loc: 'Nagpur', date: 'November 2024', quote: 'From rangoli art to rangoli hearts, this platform drew the most beautiful pattern in our lives.' }
    ],
    testimonials: [
      { name: 'Padma Rangole', role: 'Rangoli Artist', quote: 'The pattern compatibility concept is brilliant. Love, like rangoli, needs complementary colors to truly shine.' },
      { name: 'Shobha Kulkarni', role: 'Cultural Organizer', quote: 'The rangoli events bring such joy. Many beautiful matches have started with a simple kolam design.' },
      { name: 'Prakash Nair', role: 'Groom', quote: 'I never expected to find my match through art. The rangoli connection was instant and beautiful.' }
    ],
    profiles: [
      { name: 'Arti', age: 26, job: 'Art Teacher', city: 'Jaipur', comm: 'Hindu, Maheshwari', intro: 'Teaching traditional Indian arts. Seeking a creative, culturally rich partner.' },
      { name: 'Deepak', age: 30, job: 'Graphic Designer', city: 'Mumbai', comm: 'Hindu, Aggarwal', intro: 'Digital artist drawing rangoli-inspired designs. Looking for an art-loving partner.' },
      { name: 'Minal', age: 28, job: 'Textile Artist', city: 'Indore', comm: 'Hindu, Bania', intro: 'Creating rangoli-inspired textile patterns. Seeking an artistic partner.' },
      { name: 'Suresh', age: 29, job: 'Photographer', city: 'Nagpur', comm: 'Hindu, Deshastha', intro: 'Photographing India\'s festivals. Looking for a vibrant, culturally aware partner.' }
    ],
    stats: ['4,300+', '88%', '200+', '4.81'],
    statLabs: ['Rangoli Profiles', 'Color Match', 'Art Events', 'Creativity Rating'],
    counters: [4300, 88, 200, 4.81], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Events', 'Rating']
  },

  'ganpati-green': {
    eyebrow: 'New Beginnings, Blessed Beginnings',
    h1: 'Begin Your Love Story with Ganesha\'s Grace',
    sub: 'The fresh green of new leaves and the auspicious start of Ganesh Chaturthi \u2014 find a love that begins with divine blessings.',
    cta1: 'Start Fresh', cta2: 'Read Blessed Stories',
    features: [
      { title: 'Green-Theme Events', desc: 'Meet at eco-friendly Ganesh celebrations, nature walks, and green festivals where like-minded families connect.' },
      { title: 'Fresh Start Matching', desc: 'Our algorithm prioritizes new beginnings and the green energy of couples ready to build something beautiful.' },
      { title: 'Eco-Cultural Network', desc: 'Join families who celebrate traditions while embracing sustainability and environmental consciousness.' }
    ],
    steps: [
      { title: 'Plant the Seed', desc: 'Start with a fresh, honest profile that reflects your values and the green future you envision.' },
      { title: 'Watch It Grow', desc: 'Like a seedling nurtured by divine blessings, let your connection grow naturally.' },
      { title: 'Bloom Together', desc: 'When two fresh souls unite under Ganesha\'s grace, the resulting love blooms with unmatched beauty.' }
    ],
    stories: [
      { names: 'Usha & Prakash', loc: 'Nashik', date: 'September 2025', quote: 'The eco-friendly Ganesh event was where we first met. Our green-themed wedding was beautiful.' },
      { names: 'Kavita & Vikram', loc: 'Pune', date: 'September 2024', quote: 'Fresh starts, green energy, blessed beginnings. Everything was fresh, natural, and divinely guided.' },
      { names: 'Meena & Sunil', loc: 'Thane', date: 'September 2024', quote: 'Our love grew like fresh leaves on a sacred peepal tree. Nature and tradition united us.' }
    ],
    testimonials: [
      { name: 'Dr. Vandana Shiva', role: 'Environmental Activist', quote: 'The eco-cultural approach shows tradition and sustainability can beautifully coexist in matchmaking.' },
      { name: 'Rajesh Patil', role: 'Festival Organizer', quote: 'The green Ganesh events have changed how our community celebrates. Many eco-conscious matches formed.' },
      { name: 'Amit Deshmukh', role: 'Groom', quote: 'Finding someone who values tradition and nature was easy. Our eco-wedding was a celebration of both.' }
    ],
    profiles: [
      { name: 'Usha', age: 27, job: 'Environmental Scientist', city: 'Nashik', comm: 'Hindu, Brahmin', intro: 'Researching sustainable agriculture. Seeking a nature-loving, tradition-respecting partner.' },
      { name: 'Prakash', age: 30, job: 'Organic Farmer', city: 'Nashik', comm: 'Hindu, Maratha', intro: 'Running a certified organic farm. Looking for an eco-conscious, grounded partner.' },
      { name: 'Vikram', age: 29, job: 'Renewable Energy Engineer', city: 'Pune', comm: 'Hindu, Deshastha', intro: 'Building solar projects for rural Maharashtra. Seeking a progressive, environmentally aware partner.' },
      { name: 'Sunita', age: 26, job: 'Wildlife Photographer', city: 'Nagpur', comm: 'Hindu, Kunbi', intro: 'Documenting Maharashtra\'s wildlife. Looking for a nature-loving, adventurous partner.' }
    ],
    stats: ['3,600+', '87%', '190+', '4.80'],
    statLabs: ['Green Profiles', 'Fresh Match', 'Eco Events', 'Nature Rating'],
    counters: [3600, 87, 190, 4.80], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Events', 'Rating']
  },

  'navratri-garba': {
    eyebrow: 'Dance Through Nine Nights to Find Love',
    h1: 'Let Garba\'s Rhythm Lead You to Your Match',
    sub: 'Nine nights of dance, devotion, and destiny \u2014 find a partner who moves to the same beat and dances through life with you.',
    cta1: 'Join the Garba', cta2: 'Watch Dance Stories',
    features: [
      { title: 'Garba Night Events', desc: 'Exclusive Navratri garba nights where singles meet through the magical energy of traditional dance circles.' },
      { title: 'Rhythm Compatibility', desc: 'Match by cultural energy, dance preferences, and festive enthusiasm alongside traditional compatibility.' },
      { title: 'Dance & Connect', desc: 'Virtual garba sessions and in-person events where connections form through shared rhythmic joy.' }
    ],
    steps: [
      { title: 'Step Into the Circle', desc: 'Join the garba circle with a vibrant profile showcasing your energy and love for celebration.' },
      { title: 'Find Your Rhythm', desc: 'Our algorithm finds partners whose rhythm harmonizes with yours in perfect synchrony.' },
      { title: 'Dance Into Forever', desc: 'When the right dance partner appears, the music of your love story plays on forever.' }
    ],
    stories: [
      { names: 'Bhavna & Chirag', loc: 'Ahmedabad', date: 'October 2025', quote: 'We locked eyes across the garba circle. Nine nights of dancing led to a lifetime of love.' },
      { names: 'Nutan & Paresh', loc: 'Baroda', date: 'October 2024', quote: 'The garba night was the most magical matchmaking setting imaginable. Dance, music, love.' },
      { names: 'Hema & Jagdish', loc: 'Surat', date: 'October 2024', quote: 'From garba partners to life partners, our journey was a beautiful dance.' }
    ],
    testimonials: [
      { name: 'Falguni Pathak', role: 'Garba Singer', quote: 'The garba events capture the true spirit of Navratri. Love dances in every circle.' },
      { name: 'Ketan Patel', role: 'Event Organizer', quote: 'Managing garba nights is pure joy. The energy, the connection, the matches \u2014 all magical.' },
      { name: 'Rajesh Joshi', role: 'Groom', quote: 'I never imagined finding my wife at a garba night. When our rhythms matched, it was divinely choreographed.' }
    ],
    profiles: [
      { name: 'Bhavna', age: 25, job: 'Dance Instructor', city: 'Ahmedabad', comm: 'Hindu, Patel', intro: 'Professional garba dance instructor. Seeking a dance-loving, energetic partner.' },
      { name: 'Chirag', age: 30, job: 'Businessman', city: 'Ahmedabad', comm: 'Hindu, Patel', intro: 'Running a textile business while dancing through every garba season. Looking for a festive partner.' },
      { name: 'Paresh', age: 28, job: 'Fitness Coach', city: 'Baroda', comm: 'Hindu, Brahmin', intro: 'Fitness coach and garba enthusiast. Seeking a health-conscious, dance-loving partner.' },
      { name: 'Nutan', age: 26, job: 'Fashion Designer', city: 'Surat', comm: 'Hindu, Bania', intro: 'Designing modern chaniya cholis for Navratri. Looking for a festive, joyful partner.' }
    ],
    stats: ['5,500+', '91%', '250+', '4.84'],
    statLabs: ['Garba Profiles', 'Dance Match', 'Navratri Cities', 'Energy Rating'],
    counters: [5500, 91, 250, 4.84], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'holi-colors': {
    eyebrow: 'Splash Into the Colors of Love',
    h1: 'Find Your Perfect Color in the Holi of Life',
    sub: 'Life is a canvas waiting for your colors. Find a partner who brings the most vibrant hues to your world.',
    cta1: 'Make Your Splash', cta2: 'See Colorful Matches',
    features: [
      { title: 'Holi-Themed Events', desc: 'Colorful singles events inspired by Holi \u2014 paint parties, color runs, and festive gatherings.' },
      { title: 'Personality Color Match', desc: 'Our system matches personality types through color psychology \u2014 warm with warm, vibrant with vibrant.' },
      { title: 'Festival of Connection', desc: 'Year-round events inspired by the spirit of Holi \u2014 where strangers become soulmates.' }
    ],
    steps: [
      { title: 'Choose Your Colors', desc: 'Paint your profile with the most authentic colors of your personality \u2014 bold, vivid, and unapologetically you.' },
      { title: 'Make Your Splash', desc: 'Dive into our colorful community where walls come down and genuine connections splash across every interaction.' },
      { title: 'Blend Your Colors', desc: 'When the perfect blend is found, your life becomes a masterpiece \u2014 every color enhanced by love.' }
    ],
    stories: [
      { names: 'Pooja & Amit', loc: 'Delhi', date: 'March 2025', quote: 'She threw the brightest pink, I threw the deepest blue. Together we made purple \u2014 perfect harmony.' },
      { names: 'Ritu & Nikhil', loc: 'Mumbai', date: 'March 2024', quote: 'The Holi event broke all our walls. From the first splash to our wedding, it has been beautiful.' },
      { names: 'Divya & Rajat', loc: 'Jaipur', date: 'March 2024', quote: 'Love found us amid the colors. This platform was the canvas, Holi was the medium, love was the masterpiece.' }
    ],
    testimonials: [
      { name: 'Gulzar Ali', role: 'Event Photographer', quote: 'I photograph Holi events for this platform. Every frame tells a love story.' },
      { name: 'Anjali Mehra', role: 'Color Psychologist', quote: 'The personality color match is fascinating and surprisingly accurate. Colors truly reveal who we are meant for.' },
      { name: 'Vikrant Singh', role: 'Groom', quote: 'The Holi event was the most fun matchmaking experience. Less pressure, more color, beautiful splash of love.' }
    ],
    profiles: [
      { name: 'Pooja', age: 27, job: 'Art Director', city: 'Delhi', comm: 'Hindu, Khatri', intro: 'Creating colorful campaigns. Seeking a vibrant, creative partner.' },
      { name: 'Amit', age: 30, job: 'Travel Photographer', city: 'Mumbai', comm: 'Hindu, Aggarwal', intro: 'Capturing India\'s colors. Looking for a colorful, adventurous partner.' },
      { name: 'Nikhil', age: 29, job: 'DJ & Music Producer', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'Spinning beats that make people dance. Seeking a music-loving, festive partner.' },
      { name: 'Ritu', age: 26, job: 'Content Creator', city: 'Jaipur', comm: 'Hindu, Maheshwari', intro: 'Creating colorful cultural content. Looking for a creative, energetic partner.' }
    ],
    stats: ['7,800+', '87%', '350+', '4.79'],
    statLabs: ['Colorful Profiles', 'Splash Match', 'Festival Events', 'Vibrancy Rating'],
    counters: [7800, 87, 350, 4.79], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Events', 'Rating']
  },

  'makar-sankranti': {
    eyebrow: 'Rise High Like a Kite of Love',
    h1: 'Let Your Love Soar Above the Rest',
    sub: 'Like the kites that fill the Sankranti sky, let your love rise above the ordinary. Find a partner held by trust and tradition.',
    cta1: 'Fly Your Kite', cta2: 'See Sankranti Stories',
    features: [
      { title: 'Kite Festival Events', desc: 'Meet at Makar Sankranti kite festivals, til-gul gatherings, and harvest celebrations.' },
      { title: 'Elevation Matching', desc: 'Our algorithm lifts you above the noise to find matches that soar to your level of ambition and values.' },
      { title: 'Harvest Network', desc: 'Connect with families from Maharashtra\'s agricultural heartland who celebrate with traditional warmth.' }
    ],
    steps: [
      { title: 'Unfold Your Kite', desc: 'Launch your profile into the Sankranti sky with the brightness of a kite catching the winter wind.' },
      { title: 'Rise Above', desc: 'Let our matchmaking lift you above crowded results to the clear sky of perfect compatibility.' },
      { title: 'Soar Together', desc: 'When two kites meet in the sky, the celebration below is worth watching. Your love becomes the talk of the festival.' }
    ],
    stories: [
      { names: 'Surekha & Mahesh', loc: 'Pune', date: 'January 2025', quote: 'We met at a Sankranti kite festival. The til-gul exchange became our first gesture of sweetness.' },
      { names: 'Asha & Dattaram', loc: 'Satara', date: 'January 2024', quote: 'Like the best kite flyer, this platform knew exactly how to connect our strings.' },
      { names: 'Suman & Pramod', loc: 'Solapur', date: 'January 2024', quote: 'The harvest festival setting was perfect for our agricultural families. Our love grew like sugarcane.' }
    ],
    testimonials: [
      { name: 'Bajirao Patil', role: 'Kite Festival Organizer', quote: 'The Sankranti events add a beautiful matchmaking dimension to our kite festival tradition.' },
      { name: 'Kamalabai Deshmukh', role: 'Village Elder', quote: 'Sankranti was always a time for new beginnings. This platform brings that same auspicious energy.' },
      { name: 'Sanjay Kshirsagar', role: 'Groom', quote: 'The kite festival was the most joyful setting to meet my match. We have been soaring together.' }
    ],
    profiles: [
      { name: 'Surekha', age: 27, job: 'Agricultural Officer', city: 'Pune', comm: 'Hindu, Maratha', intro: 'Supporting farming communities. Seeking a grounded, nature-loving partner.' },
      { name: 'Mahesh', age: 31, job: 'Sugar Mill Manager', city: 'Satara', comm: 'Hindu, Maratha', intro: 'Managing a cooperative sugar mill. Looking for a family-oriented partner.' },
      { name: 'Pramod', age: 29, job: 'Farmer & Exporter', city: 'Solapur', comm: 'Hindu, Lingayat', intro: 'Exporting premium turmeric and spices. Seeking an ambitious, tradition-loving partner.' },
      { name: 'Lata', age: 25, job: 'Nutritionist', city: 'Nashik', comm: 'Hindu, Brahmin', intro: 'Promoting healthy eating using traditional foods. Looking for a health-conscious partner.' }
    ],
    stats: ['3,900+', '88%', '210+', '4.82'],
    statLabs: ['Sankranti Profiles', 'Harvest Match', 'Festival Cities', 'Elevation Rating'],
    counters: [3900, 88, 210, 4.82], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'gudi-padwa': {
    eyebrow: 'A New Year, A New Beginning',
    h1: 'Gudi Padwa Brings the Gift of Love',
    sub: 'The Maharashtrian New Year marks the most auspicious time for new beginnings. Let the Gudi of happiness guide you to love.',
    cta1: 'Raise Your Gudi', cta2: 'See New Year Stories',
    features: [
      { title: 'Padwa Celebrations', desc: 'Exclusive Gudi Padwa events, new year parties, and traditional Maharashtrian gatherings.' },
      { title: 'Prosperity Matching', desc: 'Match with families who share your vision of prosperity \u2014 educational, financial, and spiritual growth.' },
      { title: 'Marathi Heritage Network', desc: 'Deep connections with Maharashtrian families who celebrate Gudi Padwa with traditional fervour.' }
    ],
    steps: [
      { title: 'Raise the Gudi', desc: 'Hoist your profile high with pride \u2014 your achievements, traditions, and the prosperous future you envision.' },
      { title: 'Welcome the New', desc: 'Like the new year, welcome each introduction with fresh energy and the auspicious spirit of Gudi Padwa.' },
      { title: 'Prosper Together', desc: 'When two prosperous families unite on this auspicious day, the year ahead is filled with abundance.' }
    ],
    stories: [
      { names: 'Ranjana & Suresh', loc: 'Pune', date: 'March 2025', quote: 'We met at a Gudi Padwa celebration. The auspicious energy blessed our union from the first conversation.' },
      { names: 'Vandana & Prakash', loc: 'Mumbai', date: 'March 2024', quote: 'The Padwa event was the perfect setting for our Maharashtrian families to connect.' },
      { names: 'Sushma & Anil', loc: 'Satara', date: 'March 2024', quote: 'Raising the Gudi of happiness together, our families celebrated the most auspicious new year.' }
    ],
    testimonials: [
      { name: 'Uday Deshmukh', role: 'Cultural Organizer', quote: 'The Gudi Padwa events capture the true spirit of Maharashtrian new year. Beautiful matches begin here.' },
      { name: 'Aruna Bhave', role: 'Traditional Expert', quote: 'The platform\'s approach to tradition is refreshingly authentic. Every introduction feels blessed.' },
      { name: 'Mohan Rao', role: 'Groom', quote: 'The new year energy was exactly what we needed. Our Padwa meeting led to beautiful new beginnings.' }
    ],
    profiles: [
      { name: 'Ranjana', age: 27, job: 'Bank Manager', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'Managing a major bank branch. Seeking a financially stable, tradition-loving partner.' },
      { name: 'Suresh', age: 30, job: 'Civil Servant', city: 'Mumbai', comm: 'Hindu, Deshastha', intro: 'IAS officer serving Maharashtra. Looking for an educated, culturally grounded partner.' },
      { name: 'Prakash', age: 29, job: 'Business Consultant', city: 'Pune', comm: 'Hindu, Chitpavan', intro: 'Consulting for Fortune 500 companies. Seeking an ambitious, culturally rich partner.' },
      { name: 'Vandana', age: 26, job: 'Chartered Accountant', city: 'Mumbai', comm: 'Hindu, CKP', intro: 'Top CA at a Big Four firm. Looking for an intellectually driven, tradition-respecting partner.' }
    ],
    stats: ['4,200+', '90%', '230+', '4.85'],
    statLabs: ['Padwa Profiles', 'Prosperity Match', 'New Year Events', 'Auspicious Rating'],
    counters: [4200, 90, 230, 4.85], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Events', 'Rating']
  },

  /* ─── Modern 8 ───────────────────────────────────────────── */

  'modern-minimal': {
    eyebrow: 'Less is More, Love is Everything',
    h1: 'Minimal Design, Maximum Connection',
    sub: 'Stripped of clutter, focused on what matters \u2014 find a love as clean, honest, and beautifully simple.',
    cta1: 'Start Simply', cta2: 'See Real Stories',
    features: [
      { title: 'Minimal Matching', desc: 'No unnecessary features, no overwhelming options \u2014 just clean, focused matchmaking that puts connection first.' },
      { title: 'Values-First Filter', desc: 'Strip away the noise. Our filter focuses on core values, life goals, and authentic personality compatibility.' },
      { title: 'Clean Interface', desc: 'A distraction-free platform where the focus remains entirely on meaningful connections.' }
    ],
    steps: [
      { title: 'Simplify Your Profile', desc: 'Share only what truly matters \u2014 your core values, genuine interests, and the authentic person you are.' },
      { title: 'Focus on Connection', desc: 'With minimal distractions, every conversation is deeper, every connection more meaningful.' },
      { title: 'Build Something Essential', desc: 'Create a relationship built on the essential elements of love \u2014 trust, respect, and genuine companionship.' }
    ],
    stories: [
      { names: 'Ankita & Ravi', loc: 'Bangalore', date: 'June 2025', quote: 'The minimal approach was refreshing. No gimmicks, just genuine connection. Our simple love story is the most beautiful.' },
      { names: 'Tanya & Karan', loc: 'Mumbai', date: 'April 2025', quote: 'We both value simplicity. The minimal design attracted us, and the depth of matching kept us.' },
      { names: 'Pooja & Nikhil', loc: 'Delhi', date: 'February 2025', quote: 'Less clutter, more meaning. Our connection started with the most honest, unpretentious conversation.' }
    ],
    testimonials: [
      { name: 'Nidhi Malhotra', role: 'UX Designer', quote: 'As a designer, I appreciate the minimal aesthetic. The simple design connects people effectively.' },
      { name: 'Rahul Khanna', role: 'Architect', quote: 'The minimalist approach resonated with my design philosophy. My wife and I found beauty in the simplicity.' },
      { name: 'Priya Singh', role: 'Bride', quote: 'No gimmicks, no pressure. Just honest matchmaking that led me to the most genuine partner.' }
    ],
    profiles: [
      { name: 'Ankita', age: 27, job: 'Product Designer', city: 'Bangalore', comm: 'Hindu, Brahmin', intro: 'Designing minimal, user-centric products. Seeking a like-minded minimalist.' },
      { name: 'Ravi', age: 30, job: 'Software Architect', city: 'Bangalore', comm: 'Hindu, Iyengar', intro: 'Building clean, efficient systems. Looking for a partner who appreciates simplicity and depth.' },
      { name: 'Karan', age: 29, job: 'Photographer', city: 'Mumbai', comm: 'Hindu, Khatri', intro: 'Minimalist photographer capturing essential moments. Seeking an authentic partner.' },
      { name: 'Tanya', age: 26, job: 'Writer', city: 'Delhi', comm: 'Hindu, Bania', intro: 'Writing clean, impactful prose. Looking for a thoughtful, minimal-lifestyle partner.' }
    ],
    stats: ['5,400+', '92%', '280+', '4.90'],
    statLabs: ['Minimal Profiles', 'Authentic Match', 'Metro Cities', 'Simplicity Rating'],
    counters: [5400, 92, 280, 4.90], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'blush-rose': {
    eyebrow: 'Soft as a Rose, Strong as Love',
    h1: 'Fall in Love with the Blush of Romance',
    sub: 'Delicate yet bold, soft yet passionate \u2014 find a love that blooms with rose petals and deep roots.',
    cta1: 'Bloom Together', cta2: 'See Romance Stories',
    features: [
      { title: 'Rose-First Events', desc: 'Romantic gatherings at botanical gardens, rose cafes, and floral art exhibitions.' },
      { title: 'Romance Compatibility', desc: 'Our blush algorithm matches emotional intelligence, romantic style, and love language.' },
      { title: 'Botanical Network', desc: 'Connect with sensitive, creative individuals who appreciate nature\'s delicate beauty.' }
    ],
    steps: [
      { title: 'Plant Your Rose', desc: 'Create a profile as delicate yet strong as a rose \u2014 soft in presentation, deep in character.' },
      { title: 'Let It Bloom', desc: 'Allow each connection to unfold gently, like rose petals opening to the morning sun.' },
      { title: 'Share the Fragrance', desc: 'When two roses bloom together, their combined fragrance fills the world.' }
    ],
    stories: [
      { names: 'Rose & Rahul', loc: 'Bangalore', date: 'May 2025', quote: 'The blush-themed garden event was the most romantic setting. Our love bloomed among roses.' },
      { names: 'Priya & Abhishek', loc: 'Pune', date: 'March 2025', quote: 'The rose compatibility was eerily accurate. We both appreciate softness with strength.' },
      { names: 'Megha & Varun', loc: 'Mumbai', date: 'January 2025', quote: 'From blush first meetings to rosy engagements, this platform painted our story beautifully.' }
    ],
    testimonials: [
      { name: 'Neha Kapoor', role: 'Florist', quote: 'Working with roses daily, I understand their delicate strength. This platform matches with the same precision.' },
      { name: 'Sanjay Dutt', role: 'Event Planner', quote: 'The blush events are always the most romantic. The connections are as beautiful as the roses.' },
      { name: 'Vikash Mehta', role: 'Groom', quote: 'The romantic approach was exactly what I needed. No pressure, just a beautiful blooming love story.' }
    ],
    profiles: [
      { name: 'Rose', age: 26, job: 'Florist & Entrepreneur', city: 'Bangalore', comm: 'Hindu, Iyengar', intro: 'Running a premium floral design studio. Seeking a gentle, romantic partner.' },
      { name: 'Rahul', age: 30, job: 'Poet & Professor', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'Teaching literature while writing poetry. Looking for a soulful, romantic partner.' },
      { name: 'Varun', age: 29, job: 'Perfumer', city: 'Mumbai', comm: 'Hindu, Khatri', intro: 'Creating artisan fragrances inspired by Indian gardens. Seeking a sensory, creative partner.' },
      { name: 'Megha', age: 27, job: 'Botanical Illustrator', city: 'Delhi', comm: 'Hindu, Aggarwal', intro: 'Illustrating India\'s rare flowers. Looking for an artistic, nature-loving partner.' }
    ],
    stats: ['4,600+', '91%', '220+', '4.88'],
    statLabs: ['Rose Profiles', 'Romance Match', 'Garden Cities', 'Tenderness Rating'],
    counters: [4600, 91, 220, 4.88], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'sage-green': {
    eyebrow: 'Grounded in Nature, Growing in Love',
    h1: 'Find a Love as Fresh as Sage Green',
    sub: 'Calm, grounded, and naturally beautiful \u2014 discover a love that grows organically, nurtured by authenticity.',
    cta1: 'Grow Together', cta2: 'See Natural Stories',
    features: [
      { title: 'Nature-Inspired Events', desc: 'Meet at botanical gardens, nature retreats, and eco-resorts in peaceful settings.' },
      { title: 'Growth Compatibility', desc: 'Our algorithm matches growth mindsets, natural living preferences, and peace-oriented lifestyles.' },
      { title: 'Wellness Network', desc: 'Connect with wellness-focused individuals who practice yoga, meditation, and mindful living.' }
    ],
    steps: [
      { title: 'Plant Your Roots', desc: 'Create a grounded profile reflecting your natural values and desire for organic growth.' },
      { title: 'Nurture the Connection', desc: 'Like tending a garden, nurture each connection with patience and calm energy.' },
      { title: 'Bloom Naturally', desc: 'When two grounded souls connect, love grows naturally, deeply, and beautifully.' }
    ],
    stories: [
      { names: 'Maya & Hari', loc: 'Kerala', date: 'May 2025', quote: 'Both yoga practitioners, both nature lovers. The sage-green matching was perfectly aligned.' },
      { names: 'Deepa & Kiran', loc: 'Pune', date: 'March 2025', quote: 'The nature retreat was where we first talked. Two hours about trees and philosophy. We were hooked.' },
      { names: 'Sita & Ram', loc: 'Mysore', date: 'January 2025', quote: 'Like sage growing steadily, our love has been calm, deep, and naturally beautiful.' }
    ],
    testimonials: [
      { name: 'Dr. Vandana Sharma', role: 'Ayurveda Practitioner', quote: 'The sage-green approach aligns with Ayurvedic principles \u2014 balanced, natural, deeply nourishing.' },
      { name: 'Baba Ramdev', role: 'Yoga Guru', quote: 'Natural connections require natural environments. This platform creates the most peaceful matchmaking experience.' },
      { name: 'Arjun Reddy', role: 'Groom', quote: 'The calm, grounded energy attracted me. No rushing, no gimmicks \u2014 just genuine, natural connection.' }
    ],
    profiles: [
      { name: 'Maya', age: 28, job: 'Yoga Instructor', city: 'Kerala', comm: 'Hindu, Nair', intro: 'Teaching Ashtanga yoga at a wellness retreat. Seeking a calm, spiritually grounded partner.' },
      { name: 'Hari', age: 31, job: 'Organic Farmer', city: 'Mysore', comm: 'Hindu, Brahmin', intro: 'Running a permaculture farm. Looking for a nature-loving, peaceful partner.' },
      { name: 'Kiran', age: 29, job: 'Meditation Teacher', city: 'Pune', comm: 'Hindu, Deshastha', intro: 'Guiding meditation retreats. Seeking a mindful, calm partner.' },
      { name: 'Deepa', age: 26, job: 'Botanist', city: 'Bangalore', comm: 'Hindu, Iyengar', intro: 'Studying medicinal plants. Looking for a nature-passionate, curious partner.' }
    ],
    stats: ['3,800+', '89%', '180+', '4.86'],
    statLabs: ['Sage Profiles', 'Natural Match', 'Wellness Cities', 'Calm Rating'],
    counters: [3800, 89, 180, 4.86], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'dusty-blue': {
    eyebrow: 'Deep as the Ocean, Steady as the Tide',
    h1: 'Find a Love as Deep as Dusty Blue',
    sub: 'Sophisticated, serene, and endlessly deep \u2014 discover a love that is both calming and profoundly beautiful.',
    cta1: 'Dive Deep', cta2: 'See Serene Stories',
    features: [
      { title: 'Blue-Chip Events', desc: 'Sophisticated gatherings at art museums, jazz lounges, and twilight venues.' },
      { title: 'Depth Compatibility', desc: 'Our algorithm matches intellectual depth, emotional maturity, and sophisticated sensibilities.' },
      { title: 'Twilight Network', desc: 'A curated community who appreciate the deeper, more sophisticated side of culture.' }
    ],
    steps: [
      { title: 'Dive Below Surface', desc: 'Create a profile that reveals your intellectual depth and emotional maturity.' },
      { title: 'Navigate the Depths', desc: 'Explore connections at the deepest level of compatibility.' },
      { title: 'Surface with Treasure', desc: 'When you find a connection this deep, surface with the treasure of enduring love.' }
    ],
    stories: [
      { names: 'Meera & Arjun', loc: 'Mumbai', date: 'May 2025', quote: 'The twilight art event was where we connected. Two deep thinkers, one beautiful bond.' },
      { names: 'Shweta & Nitin', loc: 'Delhi', date: 'March 2025', quote: 'The depth compatibility was uncanny. Our conversations went from surface to soul in minutes.' },
      { names: 'Lata & Sanjay', loc: 'Pune', date: 'January 2025', quote: 'Like the dusty blue sky at twilight, our love is serene and endlessly beautiful.' }
    ],
    testimonials: [
      { name: 'Kavita Krishna', role: 'Art Curator', quote: 'The sophisticated events match the depth and beauty of the art I curate. Every connection is a masterpiece.' },
      { name: 'Rahul Bose', role: 'Filmmaker', quote: 'As someone who values depth over flash, the dusty-blue approach resonated deeply.' },
      { name: 'Amitabh Singh', role: 'Groom', quote: 'The intellectual depth matching found me a partner who challenges and inspires me daily.' }
    ],
    profiles: [
      { name: 'Meera', age: 28, job: 'Museum Director', city: 'Mumbai', comm: 'Hindu, Iyer', intro: 'Directing a contemporary art museum. Seeking an intellectually deep partner.' },
      { name: 'Arjun', age: 31, job: 'Literature Professor', city: 'Delhi', comm: 'Hindu, Brahmin', intro: 'Teaching comparative literature at JNU. Looking for a deeply intellectual partner.' },
      { name: 'Sanjay', age: 29, job: 'Filmmaker', city: 'Pune', comm: 'Hindu, Chitpavan', intro: 'Making independent films about Indian culture. Seeking a thoughtful, artistic partner.' },
      { name: 'Shweta', age: 27, job: 'Classical Musician', city: 'Mumbai', comm: 'Hindu, Iyengar', intro: 'Hindustani classical vocalist. Looking for a musically sensitive partner.' }
    ],
    stats: ['3,200+', '93%', '150+', '4.91'],
    statLabs: ['Dusty Blue Profiles', 'Depth Match', 'Twilight Cities', 'Sophistication Rating'],
    counters: [3200, 93, 150, 4.91], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'charcoal-elegant': {
    eyebrow: 'Timeless Elegance in Every Detail',
    h1: 'Classic Elegance Never Goes Out of Style',
    sub: 'Like charcoal on canvas, find a love that is bold yet refined, classic yet contemporary \u2014 timeless elegance.',
    cta1: 'Embrace Elegance', cta2: 'See Classic Stories',
    features: [
      { title: 'Charcoal-Grade Screening', desc: 'The most refined verification \u2014 sophisticated, discreet, and thorough.' },
      { title: 'Classical Events', desc: 'Exclusive gatherings at classical concerts, art galleries, and heritage hotels.' },
      { title: 'Timeless Network', desc: 'A community who appreciate classical art, literary traditions, and refined taste.' }
    ],
    steps: [
      { title: 'Sketch Your Essence', desc: 'Create a profile with the elegant simplicity of a charcoal sketch.' },
      { title: 'Appreciate the Nuance', desc: 'Engage at a level where subtle gestures speak louder than grand declarations.' },
      { title: 'Frame Your Future', desc: 'When timeless elegance meets timeless elegance, the result is a love story worthy of being framed.' }
    ],
    stories: [
      { names: 'Aparna & Vikram', loc: 'Mumbai', date: 'May 2025', quote: 'The classical music event was our venue. Two lovers of Ravi Shankar, two lovers of elegance.' },
      { names: 'Nandini & Rajan', loc: 'Delhi', date: 'March 2025', quote: 'The charcoal-grade screening ensured both families shared refined sensibilities.' },
      { names: 'Lalita & Mohan', loc: 'Kolkata', date: 'January 2025', quote: 'Timeless connection, classic love story. Substance over spectacle, always.' }
    ],
    testimonials: [
      { name: 'Zubin Mehta', role: 'Music Conductor', quote: 'The elegance reminds me of a well-conducted symphony \u2014 every element in perfect harmony.' },
      { name: 'Ruskin Bond', role: 'Author', quote: 'Like a well-written novel, this matchmaking unfolds with quiet elegance and profound depth.' },
      { name: 'Rahul Dravid', role: 'Groom', quote: 'The gentleman\'s approach to matchmaking. No grandstanding, just quiet, elegant connections.' }
    ],
    profiles: [
      { name: 'Aparna', age: 28, job: 'Art Historian', city: 'Mumbai', comm: 'Hindu, Brahmin', intro: 'Researching classical Indian art. Seeking a culturally refined partner.' },
      { name: 'Vikram', age: 31, job: 'Classical Musician', city: 'Delhi', comm: 'Hindu, Iyer', intro: 'Sitar performer. Looking for a musically sensitive, cultured partner.' },
      { name: 'Mohan', age: 30, job: 'Literary Editor', city: 'Kolkata', comm: 'Hindu, Baidya', intro: 'Editing for India\'s premier publishing house. Seeking a literary, thoughtful partner.' },
      { name: 'Lalita', age: 27, job: 'Classical Dancer', city: 'Chennai', comm: 'Hindu, Iyer', intro: 'Bharatanatyam performer. Looking for an artistically inclined, elegant partner.' }
    ],
    stats: ['2,800+', '94%', '120+', '4.93'],
    statLabs: ['Charcoal Profiles', 'Classic Match', 'Heritage Cities', 'Elegance Rating'],
    counters: [2800, 94, 120, 4.93], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'cream-nouveau': {
    eyebrow: 'A Fresh Take on Timeless Love',
    h1: 'Where Modern Sensibility Meets Classic Romance',
    sub: 'Cream soft, nouveau bold \u2014 find a love that blends contemporary aesthetics with Indian tradition.',
    cta1: 'Discover Fresh Love', cta2: 'See Modern Stories',
    features: [
      { title: 'Nouveau Events', desc: 'Modern gatherings at rooftop cafes, contemporary art spaces, and boutique hotels.' },
      { title: 'Style Compatibility', desc: 'Match by aesthetic sensibilities and modern values that still honour cultural roots.' },
      { title: 'Creative Network', desc: 'Connect with designers, architects, writers, and creative professionals.' }
    ],
    steps: [
      { title: 'Design Your Profile', desc: 'Craft a profile with the fresh spirit of art nouveau \u2014 classic beauty with modern flair.' },
      { title: 'Explore New Styles', desc: 'Approach each introduction with curiosity and openness to new connections.' },
      { title: 'Create a Masterpiece', desc: 'Together, create a love story that is both timeless and refreshingly modern.' }
    ],
    stories: [
      { names: 'Divya & Amit', loc: 'Mumbai', date: 'May 2025', quote: 'The rooftop cafe event was peak nouveau \u2014 modern setting, traditional hearts.' },
      { names: 'Nisha & Prateek', loc: 'Bangalore', date: 'March 2025', quote: 'The cream-nouveau aesthetic matched our blended lifestyle perfectly.' },
      { names: 'Kavita & Saurabh', loc: 'Delhi', date: 'January 2025', quote: 'Fresh, innovative, deeply romantic. Our love is a nouveau masterpiece.' }
    ],
    testimonials: [
      { name: 'Rajeev Sethi', role: 'Art Director', quote: 'The nouveau approach is refreshingly innovative while respecting tradition. Beautiful balance.' },
      { name: 'Twinkle Khanna', role: 'Author', quote: 'Fresh, modern, witty \u2014 this platform gets the contemporary Indian woman. Found my match effortlessly.' },
      { name: 'Imran Khan', role: 'Groom', quote: 'The modern-nouveau approach was exactly what both our families needed. Contemporary romance with traditional values.' }
    ],
    profiles: [
      { name: 'Divya', age: 27, job: 'Brand Strategist', city: 'Mumbai', comm: 'Hindu, Khatri', intro: 'Creating fresh brand identities. Seeking a creative, modern partner with traditional values.' },
      { name: 'Amit', age: 30, job: 'Architect', city: 'Bangalore', comm: 'Hindu, Iyengar', intro: 'Designing sustainable, beautiful spaces. Looking for an aesthetically inclined partner.' },
      { name: 'Prateek', age: 29, job: 'UI/UX Designer', city: 'Delhi', comm: 'Hindu, Bania', intro: 'Designing beautiful digital experiences. Seeking a design-loving, culturally aware partner.' },
      { name: 'Nisha', age: 26, job: 'Lifestyle Blogger', city: 'Mumbai', comm: 'Hindu, Aggarwal', intro: 'Curating a modern Indian lifestyle. Looking for a stylish, culturally grounded partner.' }
    ],
    stats: ['4,100+', '90%', '200+', '4.87'],
    statLabs: ['Nouveau Profiles', 'Style Match', 'Creative Cities', 'Freshness Rating'],
    counters: [4100, 90, 200, 4.87], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'monochrome-chic': {
    eyebrow: 'Black, White, and Beautifully Bold',
    h1: 'Love in Monochrome is Anything But Plain',
    sub: 'Bold contrasts, clean lines, and striking simplicity \u2014 find a love that makes a statement without saying a word.',
    cta1: 'Make a Statement', cta2: 'See Bold Stories',
    features: [
      { title: 'Chic Events', desc: 'Monochrome-themed gallery openings, fashion shows, and black-tie galas.' },
      { title: 'Contrast Matching', desc: 'Match complementary opposites \u2014 where bold contrasts create the most striking harmonies.' },
      { title: 'Fashion Network', desc: 'Connect with fashion-forward individuals who appreciate the power of monochrome aesthetics.' }
    ],
    steps: [
      { title: 'Strike a Pose', desc: 'Create a bold, confident profile that stands out in the crowd like black on white.' },
      { title: 'Find Your Contrast', desc: 'Discover matches whose complementary differences create the most beautiful contrast.' },
      { title: 'Live in Color', desc: 'When monochrome meets its match, the world bursts into the most vibrant colors of love.' }
    ],
    stories: [
      { names: 'Zara & Kabir', loc: 'Mumbai', date: 'May 2025', quote: 'At the black-tie gala, we were the boldest contrast in the room. Opposites attract, beautifully.' },
      { names: 'Naina & Vikash', loc: 'Delhi', date: 'March 2025', quote: 'The contrast matching was perfect \u2014 her extroversion balanced my introversion. Monochrome magic.' },
      { names: 'Simran & Arjun', loc: 'Bangalore', date: 'January 2025', quote: 'Bold, chic, and unapologetically us. Our love is the most striking monochrome statement.' }
    ],
    testimonials: [
      { name: 'Masaba Gupta', role: 'Fashion Designer', quote: 'The chic aesthetic of this platform speaks to the fashion-forward Indian. Bold and beautiful matchmaking.' },
      { name: 'Bobby Khanna', role: 'Fashion Photographer', quote: 'The contrast matching concept is brilliant \u2014 like photography, the best compositions have striking contrast.' },
      { name: 'Farhan Akhtar', role: 'Groom', quote: 'The monochrome approach was refreshingly bold. Found someone whose contrasts perfectly complement mine.' }
    ],
    profiles: [
      { name: 'Zara', age: 27, job: 'Fashion Editor', city: 'Mumbai', comm: 'Hindu, Khatri', intro: 'Editing fashion spreads for Vogue India. Seeking a bold, style-conscious partner.' },
      { name: 'Kabir', age: 30, job: 'Film Director', city: 'Mumbai', comm: 'Hindu, Pathan', intro: 'Directing indie films with bold narratives. Looking for a creative, daring partner.' },
      { name: 'Vikash', age: 29, job: 'Graphic Designer', city: 'Delhi', comm: 'Hindu, Bania', intro: 'Creating bold, monochrome brand identities. Seeking a design-savvy, confident partner.' },
      { name: 'Naina', age: 26, job: 'Journalist', city: 'Bangalore', comm: 'Hindu, Brahmin', intro: 'Investigative journalist with bold opinions. Looking for a thoughtful, courageous partner.' }
    ],
    stats: ['3,600+', '91%', '160+', '4.89'],
    statLabs: ['Chic Profiles', 'Contrast Match', 'Fashion Cities', 'Boldness Rating'],
    counters: [3600, 91, 160, 4.89], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'pastel-peach': {
    eyebrow: 'Gentle Warmth, Tender Connection',
    h1: 'A Love as Warm as Pastel Peach',
    sub: 'Soft, warm, and inviting \u2014 find a love that wraps you in the gentle comfort of pastel peach on a summer morning.',
    cta1: 'Feel the Warmth', cta2: 'See Tender Stories',
    features: [
      { title: 'Warm Events', desc: 'Cozy gatherings at peach-themed cafes, art workshops, and intimate dinner parties.' },
      { title: 'Warmth Compatibility', desc: 'Match by emotional warmth, nurturing nature, and gentle personality traits.' },
      { title: 'Comfort Network', desc: 'Connect with warm-hearted individuals who value comfort, kindness, and gentle companionship.' }
    ],
    steps: [
      { title: 'Warm Your Profile', desc: 'Create a profile as warm and inviting as peach blossoms in spring.' },
      { title: 'Share the Warmth', desc: 'Let each interaction radiate the gentle warmth that attracts your perfect match.' },
      { title: 'Build a Cozy Life', desc: 'When two warm hearts connect, every moment becomes a cozy celebration of love.' }
    ],
    stories: [
      { names: 'Peach & Pranav', loc: 'Pune', date: 'May 2025', quote: 'The cozy cafe event was the warmest setting. Two gentle souls, one peachy connection.' },
      { names: 'Ria & Rohan', loc: 'Mumbai', date: 'March 2025', quote: 'The warmth compatibility was spot-on. We both radiate the same gentle, nurturing energy.' },
      { names: 'Simi & Sagar', loc: 'Ahmedabad', date: 'January 2025', quote: 'From pastel first meetings to peachy wedding days, our love has been pure warmth.' }
    ],
    testimonials: [
      { name: 'Neena Gupta', role: 'Actress', quote: 'The warmth of this platform is genuine. No cold algorithms, just warm, human matchmaking.' },
      { name: 'Rohit Bal', role: 'Fashion Designer', quote: 'The pastel-peach aesthetic captures the gentle beauty of Indian romance. Soft, warm, timeless.' },
      { name: 'Vicky Kaushal', role: 'Groom', quote: 'The gentle approach was exactly what my heart needed. Found warmth, found love, found home.' }
    ],
    profiles: [
      { name: 'Peach', age: 26, job: 'Baker & Entrepreneur', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'Running a premium bakery. Seeking a warm, nurturing partner who appreciates life\'s simple pleasures.' },
      { name: 'Pranav', age: 30, job: 'Teacher', city: 'Mumbai', comm: 'Hindu, Chitpavan', intro: 'Teaching mathematics with warmth and patience. Looking for a gentle, caring partner.' },
      { name: 'Sagar', age: 29, job: 'Doctor', city: 'Ahmedabad', comm: 'Hindu, Patel', intro: 'Pediatrician with a warm heart for children. Seeking a compassionate, warm-hearted partner.' },
      { name: 'Ria', age: 27, job: 'Counselor', city: 'Bangalore', comm: 'Hindu, Iyengar', intro: 'Child psychologist helping families thrive. Looking for a nurturing, emotionally intelligent partner.' }
    ],
    stats: ['4,400+', '92%', '210+', '4.88'],
    statLabs: ['Warm Profiles', 'Tender Match', 'Cozy Cities', 'Warmth Rating'],
    counters: [4400, 92, 210, 4.88], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  /* ─── Premium 4 ──────────────────────────────────────────── */

  'luxury-platinum': {
    eyebrow: 'The Pinnacle of Premium Matchmaking',
    h1: 'Platinum-Class Matchmaking for the Elite',
    sub: 'Reserved for the most distinguished \u2014 where platinum-level verification meets platinum-level expectations.',
    cta1: 'Apply for Platinum', cta2: 'See Elite Stories',
    features: [
      { title: 'Platinum Verification', desc: 'Income validation, lifestyle audit, family background research, and social standing verification.' },
      { title: 'Concierge Service', desc: 'Dedicated relationship manager, personalized date planning, and 24/7 priority support.' },
      { title: 'Platinum Events', desc: 'Invitation-only galas, international travel events, and private island retreats.' }
    ],
    steps: [
      { title: 'Apply for Entry', desc: 'Submit your application for our platinum tier \u2014 for those who expect nothing but the best.' },
      { title: 'Meet Your Concierge', desc: 'Your dedicated relationship manager handles every aspect of your matchmaking journey.' },
      { title: 'Platinum Experience', desc: 'Every introduction is curated, every event is exclusive, every moment is platinum.' }
    ],
    stories: [
      { names: 'Aditi & Ranvir', loc: 'Mumbai', date: 'May 2025', quote: 'The platinum experience was beyond our expectations. Our Maldives retreat meeting was pure luxury.' },
      { names: 'Gayatri & Ishaan', loc: 'Delhi', date: 'March 2025', quote: 'The concierge service made everything effortless. Our love story is as premium as the platform.' },
      { names: 'Kavya & Armaan', loc: 'Bangalore', date: 'January 2025', quote: 'Platinum matching found us platinum love. No compromise on quality, no compromise on happiness.' }
    ],
    testimonials: [
      { name: 'Nita Ambani', role: 'Philanthropist', quote: 'The platinum standard in matchmaking. Every detail is considered, every family treated with the utmost respect.' },
      { name: 'Kiran Mazumdar', role: 'Business Leader', quote: 'The quality of introductions is exceptional. Platinum matching for platinum expectations.' },
      { name: 'Hrithik Roshan', role: 'Groom', quote: 'The platinum service found me my platinum partner. Premium in every sense of the word.' }
    ],
    profiles: [
      { name: 'Aditi', age: 28, job: 'Luxury Brand CEO', city: 'Mumbai', comm: 'Hindu, Khatri', intro: 'CEO of a luxury lifestyle brand. Seeking an equally accomplished, refined partner.' },
      { name: 'Ranvir', age: 32, job: 'Private Equity MD', city: 'Mumbai', comm: 'Hindu, Bania', intro: 'Managing Director at a top PE firm. Looking for a sophisticated, driven partner.' },
      { name: 'Armaan', age: 31, job: 'Hotel Chain Owner', city: 'Delhi', comm: 'Hindu, Rajput', intro: 'Owning a chain of luxury boutique hotels. Seeking an elegant, cultured partner.' },
      { name: 'Gayatri', age: 27, job: 'Art Gallery Director', city: 'Bangalore', comm: 'Hindu, Iyer', intro: 'Directing a contemporary art gallery. Looking for a culturally sophisticated partner.' }
    ],
    stats: ['1,200+', '98%', '45+', '4.98'],
    statLabs: ['Platinum Members', 'Elite Match', 'Global Cities', 'Luxury Rating'],
    counters: [1200, 98, 45, 4.98], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Members', 'Match', 'Cities', 'Rating']
  },

  'ocean-romance': {
    eyebrow: 'Endless as the Ocean, Deep as Love',
    h1: 'Find a Love as Vast as the Ocean',
    sub: 'Like the endless horizon where sky meets sea, discover a love that is vast, deep, and boundlessly romantic.',
    cta1: 'Set Sail', cta2: 'See Ocean Stories',
    features: [
      { title: 'Ocean Events', desc: 'Beach-side dinners, yacht parties, and coastal retreats for the most romantic connections.' },
      { title: 'Depth Matching', desc: 'Our algorithm matches emotional depth, romantic vision, and the vastness of your aspirations.' },
      { title: 'Coastal Network', desc: 'Connect with well-travelled, ocean-loving individuals from coastal communities worldwide.' }
    ],
    steps: [
      { title: 'Set Your Course', desc: 'Chart your romantic journey with a profile as vast and inviting as the open ocean.' },
      { title: 'Navigate by Stars', desc: 'Let our celestial matching guide you across the ocean of profiles to your perfect horizon.' },
      { title: 'Anchor in Love', desc: 'When you find your safe harbor, anchor your love in the timeless depths of commitment.' }
    ],
    stories: [
      { names: 'Tara & Karthik', loc: 'Goa', date: 'May 2025', quote: 'The beach sunset dinner was where our ocean romance began. Endless horizons, endless love.' },
      { names: 'Meera & Nikhil', loc: 'Mumbai', date: 'March 2025', quote: 'The yacht party was the most romantic setting. Two ocean souls found their tide.' },
      { names: 'Lakshmi & Prasad', loc: 'Kochi', date: 'January 2025', quote: 'Like the ocean, our love has beautiful depths and gentle surfaces. Boundlessly romantic.' }
    ],
    testimonials: [
      { name: 'Sania Mirza', role: 'Tennis Champion', quote: 'The ocean events are as refreshing as a sea breeze. Found love where the waves meet the shore.' },
      { name: 'Rahul Dravid', role: 'Cricket Legend', quote: 'The depth matching goes far beneath the surface. Found a connection as vast as the ocean itself.' },
      { name: 'Dino Morea', role: 'Groom', quote: 'The ocean romance theme was perfect for my coastal soul. Love as boundless as the Arabian Sea.' }
    ],
    profiles: [
      { name: 'Tara', age: 27, job: 'Marine Biologist', city: 'Goa', comm: 'Hindu, Saraswat', intro: 'Studying coral reefs in the Arabian Sea. Seeking an ocean-loving, adventurous partner.' },
      { name: 'Karthik', age: 30, job: 'Yacht Designer', city: 'Mumbai', comm: 'Hindu, Bhatia', intro: 'Designing luxury yachts. Looking for a partner who loves the sea as much as I do.' },
      { name: 'Nikhil', age: 29, job: 'Coastal Conservationist', city: 'Kochi', comm: 'Hindu, GSB', intro: 'Protecting India\'s coastline. Seeking a nature-loving, ocean-passionate partner.' },
      { name: 'Meera', age: 26, job: 'Travel Writer', city: 'Mumbai', comm: 'Hindu, Iyer', intro: 'Writing about coastal destinations worldwide. Looking for a well-travelled, ocean-spirit partner.' }
    ],
    stats: ['3,500+', '90%', '140+', '4.89'],
    statLabs: ['Ocean Profiles', 'Depth Match', 'Coastal Cities', 'Romance Rating'],
    counters: [3500, 90, 140, 4.89], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'sunrise-gold': {
    eyebrow: 'Every Morning Brings a Golden Chance',
    h1: 'Wake Up to the Gold of True Love',
    sub: 'Like the first golden rays of sunrise, find a love that illuminates your world with warmth, hope, and the promise of a beautiful new day.',
    cta1: 'Rise with Love', cta2: 'See Golden Stories',
    features: [
      { title: 'Golden Hour Events', desc: 'Sunrise yoga sessions, golden-hour photography walks, and dawn picnics for romantics.' },
      { title: 'Optimism Matching', desc: 'Match by positive energy, morning person compatibility, and optimistic life outlook.' },
      { title: 'Dawn Network', desc: 'Connect with early risers, sunrise enthusiasts, and positive-energy individuals.' }
    ],
    steps: [
      { title: 'Catch the First Light', desc: 'Create a profile that shines with the golden optimism of a fresh sunrise.' },
      { title: 'Follow the Sunrise', desc: 'Let each golden connection guide you eastward toward the horizon of love.' },
      { title: 'Shine Together', desc: 'When two sunrises meet, the entire world is bathed in golden light. Shine together forever.' }
    ],
    stories: [
      { names: 'Gauri & Surya', loc: 'Jaipur', date: 'May 2025', quote: 'The sunrise yoga event was golden. Two early risers, one golden love story.' },
      { names: 'Kiran & Dev', loc: 'Udaipur', date: 'March 2025', quote: 'The golden-hour photography walk was the most romantic first date. Golden moments, golden love.' },
      { names: 'Anjali & Ravi', loc: 'Pune', date: 'January 2025', quote: 'Like sunrise after darkness, our love brought golden light to both our lives.' }
    ],
    testimonials: [
      { name: 'PV Sindhu', role: 'Olympic Champion', quote: 'The sunrise events fill you with golden energy. Found love in the most optimistic, beautiful setting.' },
      { name: 'Mary Kom', role: 'Boxing Champion', quote: 'Rise and shine \u2014 this platform helps you find love at the golden hour of life.' },
      { name: 'Ranveer Singh', role: 'Groom', quote: 'The golden optimism of this platform matched my energy perfectly. Found my sunrise, found my gold.' }
    ],
    profiles: [
      { name: 'Gauri', age: 27, job: 'Yoga Instructor', city: 'Jaipur', comm: 'Hindu, Maheshwari', intro: 'Teaching sunrise yoga at heritage hotels. Seeking a positive, morning-person partner.' },
      { name: 'Surya', age: 30, job: 'Photographer', city: 'Udaipur', comm: 'Hindu, Rajput', intro: 'Capturing golden-hour landscapes. Looking for a partner who loves early mornings and golden light.' },
      { name: 'Dev', age: 29, job: 'Wellness Entrepreneur', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'Running sunrise wellness retreats. Seeking an optimistic, health-conscious partner.' },
      { name: 'Kiran', age: 26, job: 'Journalist', city: 'Delhi', comm: 'Hindu, Khatri', intro: 'Covering positive stories of India. Looking for an optimistic, warm-hearted partner.' }
    ],
    stats: ['3,800+', '91%', '170+', '4.87'],
    statLabs: ['Golden Profiles', 'Sunrise Match', 'Dawn Cities', 'Gold Rating'],
    counters: [3800, 91, 170, 4.87], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'nri-global': {
    eyebrow: 'Connecting Indian Hearts Across the Globe',
    h1: 'Find Your Indian Soulmate, Anywhere in the World',
    sub: 'From Silicon Valley to Singapore, London to Dubai \u2014 connect with verified NRIs who carry Indian traditions across the globe.',
    cta1: 'Go Global', cta2: 'See NRI Stories',
    features: [
      { title: 'Global NRI Network', desc: 'Access verified profiles of NRIs across 50+ countries, from tech hubs to financial centers.' },
      { title: 'Cross-Cultural Matching', desc: 'Match NRIs who have maintained Indian values while embracing global perspectives.' },
      { title: 'Virtual & In-Person Events', desc: 'Attend NRI meetups in major global cities \u2014 from New York to Sydney to Dubai.' }
    ],
    steps: [
      { title: 'Go Global', desc: 'Create a profile that bridges your Indian heritage with your global lifestyle.' },
      { title: 'Cross Borders', desc: 'Connect with NRIs worldwide who share your unique blend of Indian values and international outlook.' },
      { title: 'Unite Worlds', desc: 'When two global Indians unite, their love story spans continents and cultures.' }
    ],
    stories: [
      { names: 'Priya & Raj', loc: 'San Francisco', date: 'May 2025', quote: 'Both NRIs in Silicon Valley, both missing home. This platform brought two Indian hearts together in America.' },
      { names: 'Anjali & Vikram', loc: 'London', date: 'March 2025', quote: 'The NRI events in London were perfect. Found someone who understood both my Indian roots and British life.' },
      { names: 'Meera & Arjun', loc: 'Dubai', date: 'January 2025', quote: 'From Dubai to Delhi, our love crosses borders. The global matching was brilliantly accurate.' }
    ],
    testimonials: [
      { name: 'Sundar Pichai', role: 'Tech CEO', quote: 'The NRI network understands the unique challenges of finding love abroad. Exceptional global matchmaking.' },
      { name: 'Indra Nooyi', role: 'Business Leader', quote: 'Bridging Indian traditions with global lifestyles \u2014 this platform does it beautifully for NRIs worldwide.' },
      { name: 'Kapil Dev', role: 'Groom', quote: 'Found my Indian soulmate in London. The global network made the impossible possible.' }
    ],
    profiles: [
      { name: 'Priya', age: 27, job: 'Software Engineer at Google', city: 'San Francisco', comm: 'Hindu, Iyengar', intro: 'NRI in Bay Area. Missing Indian traditions while building tech at Google. Seeking an Indian-rooted partner.' },
      { name: 'Raj', age: 30, job: 'Investment Banker', city: 'London', comm: 'Hindu, Khatri', intro: 'NRI at Goldman Sachs London. Looking for someone who bridges Indian values with global ambitions.' },
      { name: 'Vikram', age: 29, job: 'Doctor', city: 'Dubai', comm: 'Hindu, Brahmin', intro: 'NRI physician in Dubai. Seeking a partner who understands both Indian traditions and NRI life.' },
      { name: 'Anjali', age: 26, job: 'Management Consultant', city: 'Singapore', comm: 'Hindu, Aggarwal', intro: 'NRI consultant at McKinsey Singapore. Looking for a globally minded, Indian-hearted partner.' }
    ],
    stats: ['12,000+', '89%', '50+', '4.88'],
    statLabs: ['Global NRI Profiles', 'Cross-Border Match', 'Countries', 'Global Rating'],
    counters: [12000, 89, 50, 4.88], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Countries', 'Rating']
  },

  /* ─── Platform 5 ─────────────────────────────────────────── */

  'shaadi-modern': {
    eyebrow: 'Modern Matchmaking, Timeless Values',
    h1: 'The Future of Indian Matchmaking is Here',
    sub: 'AI-powered compatibility, video introductions, and verified profiles \u2014 matchmaking redefined for the modern Indian family.',
    cta1: 'Try Modern Shaadi', cta2: 'See How It Works',
    features: [
      { title: 'AI Compatibility Engine', desc: 'Advanced AI matching considers 100+ compatibility factors for scientifically backed introductions.' },
      { title: 'Video Profiles', desc: 'Record video introductions to make genuine connections before meeting in person.' },
      { title: 'Smart Verification', desc: 'Multi-layer verification including Aadhaar, income, education, and character checks.' }
    ],
    steps: [
      { title: 'Build Your Smart Profile', desc: 'Create a comprehensive profile with video, photos, and detailed compatibility preferences.' },
      { title: 'Let AI Match', desc: 'Our advanced AI engine analyzes 100+ factors to present your most compatible matches.' },
      { title: 'Video Connect', desc: 'Start with video introductions to establish genuine chemistry before meeting in person.' }
    ],
    stories: [
      { names: 'Riya & Aditya', loc: 'Mumbai', date: 'May 2025', quote: 'The AI matching was eerily accurate. Our compatibility score was 94% and it showed from date one.' },
      { names: 'Nisha & Karan', loc: 'Delhi', date: 'March 2025', quote: 'The video profile feature helped us connect emotionally before meeting. Modern love, timeless values.' },
      { names: 'Pooja & Rohan', loc: 'Bangalore', date: 'January 2025', quote: 'Smart verification gave both families confidence. The modern approach worked beautifully for us.' }
    ],
    testimonials: [
      { name: 'Nandan Nilekani', role: 'Tech Leader', quote: 'The AI matching technology is impressive. It brings the precision of technology to the art of matchmaking.' },
      { name: 'Falguni Nayar', role: 'Entrepreneur', quote: 'Modern tools for modern families. This platform respects tradition while embracing innovation.' },
      { name: 'Virat Kohli', role: 'Groom', quote: 'The modern approach felt authentic and efficient. Found genuine connection through technology.' }
    ],
    profiles: [
      { name: 'Riya', age: 27, job: 'Data Scientist at Meta', city: 'Bangalore', comm: 'Hindu, Brahmin', intro: 'Data scientist who believes in AI-powered matching. Seeking an intelligent, tech-savvy partner.' },
      { name: 'Aditya', age: 30, job: 'Product Manager', city: 'Mumbai', comm: 'Hindu, Khatri', intro: 'Building products that millions use. Looking for a modern, ambitious partner with traditional values.' },
      { name: 'Karan', age: 29, job: 'Startup Founder', city: 'Delhi', comm: 'Hindu, Aggarwal', intro: 'Founded a YC-backed startup. Seeking a driven, tech-literate partner.' },
      { name: 'Nisha', age: 26, job: 'AI Researcher', city: 'Bangalore', comm: 'Hindu, Iyengar', intro: 'Working on cutting-edge AI at Microsoft. Looking for a brilliant, innovation-minded partner.' }
    ],
    stats: ['15,000+', '93%', '500+', '4.90'],
    statLabs: ['Modern Profiles', 'AI Match Rate', 'Cities', 'Tech Rating'],
    counters: [15000, 93, 500, 4.90], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Cities', 'Rating']
  },

  'bharat-trust': {
    eyebrow: 'Bharat ka Bharosa, Aapka Vishwas',
    h1: 'India\'s Most Trusted Matchmaking Platform',
    sub: 'Endorsed by families, verified by tradition, trusted by millions \u2014 the platform India turns to when it means forever.',
    cta1: 'Join the Trust', cta2: 'See Family Stories',
    features: [
      { title: 'Family Trust Rating', desc: 'Every profile carries a family trust score based on verification, reviews, and community standing.' },
      { title: 'Elder Advisory Board', desc: 'Our panel of respected community elders personally reviews and endorses high-trust profiles.' },
      { title: 'Community Endorsements', desc: 'Profiles endorsed by community leaders, pandits, and family elders carry a Trust Badge.' }
    ],
    steps: [
      { title: 'Earn Trust', desc: 'Complete comprehensive verification and earn your Family Trust Badge to attract genuine matches.' },
      { title: 'Seek Endorsement', desc: 'Request endorsements from community elders, family friends, and respected community members.' },
      { title: 'Build with Trust', desc: 'When trust is the foundation, every step of the relationship is stronger and more meaningful.' }
    ],
    stories: [
      { names: 'Geeta & Mohan', loc: 'Pune', date: 'May 2025', quote: 'The Trust Badge gave us immediate confidence. Our families connected based on mutual trust and respect.' },
      { names: 'Suman & Ramesh', loc: 'Nagpur', date: 'March 2025', quote: 'The elder advisory board personally endorsed both our families. Trust was established before we even met.' },
      { names: 'Lata & Dnyaneshwar', loc: 'Satara', date: 'January 2025', quote: 'India\'s trust is in tradition, and this platform preserves that tradition. We found the most trusted match.' }
    ],
    testimonials: [
      { name: 'APJ Abdul Kalam', role: 'Former President', quote: 'Trust is the foundation of every great nation. This platform builds trust in the most sacred of relationships.' },
      { name: 'Amartya Sen', role: 'Nobel Laureate', quote: 'The community endorsement model is innovative yet deeply traditional. Trust as currency in matchmaking.' },
      { name: 'MS Dhoni', role: 'Groom', quote: 'The trust-based approach gave our family complete peace of mind. India\'s most trusted for a reason.' }
    ],
    profiles: [
      { name: 'Geeta', age: 27, job: 'Government Officer', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'IAS officer with highest trust ratings. Seeking a trustworthy, family-oriented partner.' },
      { name: 'Mohan', age: 30, job: 'Bank Manager', city: 'Nagpur', comm: 'Hindu, Deshastha', intro: 'SBI branch manager with impeccable reputation. Looking for a trustworthy, tradition-loving partner.' },
      { name: 'Ramesh', age: 29, job: 'Lawyer', city: 'Satara', comm: 'Hindu, Maratha', intro: 'Practicing at district court with highest community standing. Seeking an honest, respected partner.' },
      { name: 'Suman', age: 26, job: 'Doctor', city: 'Pune', comm: 'Hindu, Chitpavan', intro: 'Government hospital doctor serving the community. Looking for a service-minded, trusted partner.' }
    ],
    stats: ['20,000+', '95%', '600+', '4.92'],
    statLabs: ['Trusted Profiles', 'Family Approval', 'Communities', 'Trust Rating'],
    counters: [20000, 95, 600, 4.92], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Approval', 'Communities', 'Rating']
  },

  'anuroop-service': {
    eyebrow: 'Personal Matchmaking, Professional Service',
    h1: 'Your Dedicated Matchmaking Concierge',
    sub: 'Not just a platform \u2014 a personal service. Our expert matchmakers work tirelessly to find your perfect traditional match.',
    cta1: 'Hire a Matchmaker', cta2: 'See Service Stories',
    features: [
      { title: 'Personal Matchmaker', desc: 'A dedicated relationship manager who understands your family, preferences, and cultural requirements.' },
      { title: 'Background Research', desc: 'Thorough background verification including family visits, community standing, and personal interviews.' },
      { title: 'Guided Introductions', desc: 'Every introduction is personally facilitated with context, preparation, and follow-up support.' }
    ],
    steps: [
      { title: 'Share Your Story', desc: 'Meet with your personal matchmaker to share your complete story, values, and expectations.' },
      { title: 'Receive Curated Matches', desc: 'Your matchmaker presents carefully researched, personally vetted introductions one at a time.' },
      { title: 'Guided Journey', desc: 'Your matchmaker guides you through every step \u2014 from first meeting to engagement celebration.' }
    ],
    stories: [
      { names: 'Anita & Suresh', loc: 'Mumbai', date: 'May 2025', quote: 'Our matchmaker understood our family within two meetings. The personal service was beyond compare.' },
      { names: 'Vidya & Prakash', loc: 'Pune', date: 'March 2025', quote: 'The personal matchmaking felt like having a wise aunt guiding us. Warm, professional, and deeply caring.' },
      { names: 'Kamini & Rajesh', loc: 'Delhi', date: 'January 2025', quote: 'Our matchmaker did home visits to both families before arranging the introduction. Thorough and caring.' }
    ],
    testimonials: [
      { name: 'Sudha Murty', role: 'Author & Philanthropist', quote: 'Personal matchmaking preserves the human touch that algorithms cannot replicate. This service understands that.' },
      { name: 'Vijaya Mallya', role: 'Socialite', quote: 'The concierge-level service is exceptional. Every introduction is handled with the utmost care and discretion.' },
      { name: 'Sunil Gavaskar', role: 'Groom', quote: 'Our matchmaker became part of our family. The personal attention and cultural understanding was remarkable.' }
    ],
    profiles: [
      { name: 'Anita', age: 27, job: 'Marketing VP', city: 'Mumbai', comm: 'Hindu, Khatri', intro: 'VP at a leading FMCG company. Seeking a personal matchmaker to find a compatible, traditional partner.' },
      { name: 'Suresh', age: 30, job: 'Business Owner', city: 'Pune', comm: 'Hindu, Bania', intro: 'Third-generation business owner. Looking for a personal service that understands our family legacy.' },
      { name: 'Rajesh', age: 29, job: 'Army Officer', city: 'Delhi', comm: 'Hindu, Rajput', intro: 'Serving in the Indian Army. Seeking a dedicated matchmaker who understands military family culture.' },
      { name: 'Vidya', age: 26, job: 'Professor', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'Professor at Pune University. Looking for a personal, culturally sensitive matchmaking service.' }
    ],
    stats: ['5,000+', '96%', '300+', '4.95'],
    statLabs: ['Service Members', 'Personal Match', 'City Coverage', 'Service Rating'],
    counters: [5000, 96, 300, 4.95], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Members', 'Match', 'Cities', 'Rating']
  },

  'lagna-profiles': {
    eyebrow: 'Curated Profiles for Serious Matchmaking',
    h1: 'Every Profile Tells a Complete Story',
    sub: 'Detailed family backgrounds, verified credentials, and honest introductions \u2014 profiles designed for families who take matchmaking seriously.',
    cta1: 'Create Your Profile', cta2: 'Browse Verified Profiles',
    features: [
      { title: 'Comprehensive Profiles', desc: 'Family tree, horoscope, education, career, lifestyle, and personal interests \u2014 all in one detailed profile.' },
      { title: 'Family Video Intros', desc: 'Families can record video introductions to give a genuine, personal first impression.' },
      { title: 'Verified Credentials', desc: 'Aadhaar, PAN, degree certificates, and employment verification \u2014 every credential is checked.' }
    ],
    steps: [
      { title: 'Build a Complete Profile', desc: 'Fill every section with honesty and detail \u2014 the more complete your profile, the better your matches.' },
      { title: 'Get Verified', desc: 'Complete our comprehensive verification to earn the Verified Profile badge.' },
      { title: 'Connect with Confidence', desc: 'Browse verified profiles with the confidence that every detail has been checked and validated.' }
    ],
    stories: [
      { names: 'Sunita & Manoj', loc: 'Nashik', date: 'May 2025', quote: 'The comprehensive profile told us everything we needed to know. The introduction was informed and confident.' },
      { names: 'Asha & Vijay', loc: 'Solapur', date: 'March 2025', quote: 'The family video introduction was a game-changer. We felt we knew them before meeting. Beautiful concept.' },
      { names: 'Kamla & Gopal', loc: 'Kolhapur', date: 'January 2025', quote: 'The verified credentials gave us 100% confidence. No doubts, no second-guessing. Just genuine matchmaking.' }
    ],
    testimonials: [
      { name: 'Arvind Kejriwal', role: 'Politician', quote: 'Transparency and verification are the cornerstones of trust. This platform delivers both in profile matchmaking.' },
      { name: 'Anna Hazare', role: 'Social Activist', quote: 'Honest profiles lead to honest relationships. The verification process here is thorough and commendable.' },
      { name: 'Narendra Modi', role: 'Groom', quote: 'The detailed, verified profiles made our matchmaking journey confident and transparent. Complete stories, complete trust.' }
    ],
    profiles: [
      { name: 'Sunita', age: 27, job: 'Chartered Accountant', city: 'Nashik', comm: 'Hindu, Brahmin', intro: 'Top CA with fully verified credentials. Seeking a thoroughly verified, compatible partner.' },
      { name: 'Manoj', age: 30, job: 'Civil Engineer', city: 'Pune', comm: 'Hindu, Deshastha', intro: 'Building infrastructure projects. Every credential verified, every detail honest. Looking for a genuine match.' },
      { name: 'Vijay', age: 29, job: 'Pharmacist', city: 'Solapur', comm: 'Hindu, Maratha', intro: 'Running a chain of pharmacies. Seeking a verified, trustworthy partner for a serious relationship.' },
      { name: 'Asha', age: 26, job: 'Bank Officer', city: 'Kolhapur', comm: 'Hindu, Lingayat', intro: 'Officer at Bank of Maharashtra. Looking for a verified, well-established partner.' }
    ],
    stats: ['10,000+', '94%', '450+', '4.89'],
    statLabs: ['Verified Profiles', 'Serious Match', 'Communities', 'Trust Rating'],
    counters: [10000, 94, 450, 4.89], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Communities', 'Rating']
  },

  'sundarjodi-castes': {
    eyebrow: 'Beautiful Matches Across Every Community',
    h1: 'Find Your Perfect Jodi, Regardless of Caste',
    sub: 'While respecting every tradition, we believe love transcends boundaries. Find beautiful matches within your community or beyond \u2014 the choice is yours.',
    cta1: 'Find Your Jodi', cta2: 'See Cross-Community Stories',
    features: [
      { title: 'Community-Specific Matching', desc: 'Dedicated sections for every community \u2014 Brahmin, Maratha, Kayastha, Lingayat, and 50+ communities.' },
      { title: 'Cross-Community Openness', desc: 'For families open to inter-community matches, our algorithm finds compatible partners across all communities.' },
      { title: 'Cultural Sensitivity', desc: 'Our platform respects every community\'s traditions while facilitating connections based on genuine compatibility.' }
    ],
    steps: [
      { title: 'Choose Your Path', desc: 'Select community-specific matching or open cross-community matching based on your family\'s preferences.' },
      { title: 'Discover Compatibility', desc: 'Our algorithm respects community traditions while finding deep compatibility matches.' },
      { title: 'Celebrate Unity', desc: 'Whether within community or across boundaries, celebrate the beautiful union of two hearts.' }
    ],
    stories: [
      { names: 'Pooja & Rakesh', loc: 'Pune', date: 'May 2025', quote: 'Both from the same community, the matching was culturally perfect. Our traditional wedding was beautiful.' },
      { names: 'Meena & Sameer', loc: 'Mumbai', date: 'March 2025', quote: 'An inter-community match that both families embraced. Love truly transcends all boundaries.' },
      { names: 'Lakshmi & Ganesh', loc: 'Nagpur', date: 'January 2025', quote: 'The community-specific matching found us the perfect match within our tradition. Beautiful jodi.' }
    ],
    testimonials: [
      { name: 'Pratibha Patil', role: 'Former President', quote: 'India\'s diversity is its strength. This platform celebrates every community while finding beautiful matches.' },
      { name: 'Kirori Mal Bajaj', role: 'Industrialist', quote: 'The community-specific approach respects tradition while the cross-community option embraces progress.' },
      { name: 'Raj Thackeray', role: 'Groom', quote: 'Whether within our community or beyond, the matching quality is exceptional. Beautiful jodi, beautiful platform.' }
    ],
    profiles: [
      { name: 'Pooja', age: 27, job: 'Software Engineer', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'Software engineer seeking a culturally compatible Brahmin partner. Traditional values, modern career.' },
      { name: 'Rakesh', age: 30, job: 'Doctor', city: 'Mumbai', comm: 'Hindu, Maratha', intro: 'Surgeon at a leading hospital. Seeking a well-educated Maratha partner who values tradition.' },
      { name: 'Sameer', age: 29, job: 'Businessman', city: 'Nagpur', comm: 'Hindu, CKP', intro: 'Running a manufacturing business. Open to cross-community matches with shared values.' },
      { name: 'Meena', age: 26, job: 'Teacher', city: 'Solapur', comm: 'Hindu, Lingayat', intro: 'High school teacher passionate about education. Seeking a kind, ambitious partner from any community.' }
    ],
    stats: ['25,000+', '91%', '700+', '4.86'],
    statLabs: ['Community Profiles', 'Jodi Match', 'Communities', 'Diversity Rating'],
    counters: [25000, 91, 700, 4.86], counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Match', 'Communities', 'Rating']
  }
};

/* ─── Default Content Generator ─────────────────────────────────── */

function getDefaultContent(id, name, category) {
  const catLabel = category || 'Traditional Hindu';
  return {
    eyebrow: `${catLabel} Matrimony`,
    h1: `Find Your Perfect ${name || 'Life'} Partner`,
    sub: `A premium matchmaking experience rooted in authentic Hindu traditions. Discover matches that align with your values, culture, and life aspirations.`,
    cta1: 'Start Your Journey',
    cta2: 'View Success Stories',
    features: [
      { title: 'Verified Authentic Profiles', desc: 'Every profile is manually verified for authenticity, ensuring genuine families and serious match seekers only.' },
      { title: 'Advanced Compatibility', desc: 'Our intelligent matching considers cultural values, family traditions, educational background, and lifestyle preferences.' },
      { title: 'Family-Centric Approach', desc: 'Designed with Indian families in mind â€” involve parents, elders, and community guardians in your matchmaking journey.' }
    ],
    steps: [
      { title: 'Create Your Profile', desc: 'Share your story, values, family background, and what you seek in a life partner with honesty and warmth.' },
      { title: 'Discover Matches', desc: 'Browse curated introductions tailored to your preferences, or let our experts find matches that align with your vision.' },
      { title: 'Begin Your Journey', desc: 'Connect with genuine matches, involve your families, and take the first step toward a beautiful, traditional wedding.' }
    ],
    stories: [
      { names: 'Priya & Rahul', loc: 'Pune', date: '2025', quote: 'The platform understood our cultural values perfectly. Our families bonded instantly, and our wedding was a beautiful celebration of tradition.' },
      { names: 'Anita & Sunil', loc: 'Mumbai', date: '2025', quote: 'From the first introduction to our engagement, everything felt natural and blessed. We are grateful for this platform and its community.' },
      { names: 'Kavita & Manoj', loc: 'Nashik', date: '2024', quote: 'The verification process gave us confidence. We found a wonderful match whose family values aligned perfectly with ours.' }
    ],
    testimonials: [
      { name: 'Sunita Sharma', role: 'Mother of Bride', quote: 'The platform made the matchmaking process smooth and respectful. Our daughter found a wonderful partner from a great family.' },
      { name: 'Rajesh Kumar', role: 'Father of Groom', quote: 'As a father, I valued the verification and family-oriented approach. The introduction process was dignified and thorough.' },
      { name: 'Dr. Priya Menon', role: 'Relationship Expert', quote: 'This platform bridges tradition and modernity beautifully. The matches are thoughtful, and the cultural sensitivity is commendable.' }
    ],
    profiles: [
      { name: 'Deepika', age: 27, job: 'Software Engineer', city: 'Pune', comm: 'Hindu, Brahmin', intro: 'Software engineer at a leading tech company, with a love for classical dance and traditional values. Seeking a kind, ambitious partner.' },
      { name: 'Rahul', age: 30, job: 'Doctor', city: 'Mumbai', comm: 'Hindu, Vaishya', intro: 'Orthopaedic surgeon with a commitment to healing and tradition. Looking for a compassionate, family-oriented life partner.' },
      { name: 'Amit', age: 29, job: 'Business Analyst', city: 'Delhi', comm: 'Hindu, Khatri', intro: 'Business analyst with global experience and traditional roots. Seeking an educated, warm-hearted partner for a lifetime of growth.' },
      { name: 'Neha', age: 26, job: 'Architect', city: 'Bangalore', comm: 'Hindu, Goud', intro: 'Architect designing spaces that blend modern aesthetics with traditional sensibilities. Looking for a creative, respectful partner.' }
    ],
    stats: ['10,000+', '88%', '500+', '4.8'],
    statLabs: ['Verified Profiles', 'Success Rate', 'Cities', 'User Rating'],
    counters: [10000, 88, 500, 4.8],
    counterSuffix: ['+', '%', '+', ''],
    counterLabs: ['Profiles', 'Success Rate', 'Cities', 'Rating']
  };
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Hero Image & Profile Image URLs
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const heroImages = {
  Traditional: [
    'https://images.unsplash.com/photo-1741201864879-c5e7f81c98b0?w=1200&q=80',
    'https://images.unsplash.com/photo-1741201865831-8fbb8d4fe24f?w=1200&q=80',
    'https://images.unsplash.com/photo-1764286954620-28029fbae9b6?w=1200&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
    'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=1200&q=80',
    'https://images.unsplash.com/photo-1520860246301-891810ddbf4e?w=1200&q=80',
    'https://images.unsplash.com/photo-1621430931505-7284b3d87532?w=1200&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80'
  ],
  Regional: [
    'https://images.unsplash.com/photo-1764286954620-28029fbae9b6?w=1200&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
    'https://images.unsplash.com/photo-1741201864879-c5e7f81c98b0?w=1200&q=80',
    'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=1200&q=80',
    'https://images.unsplash.com/photo-1741201865831-8fbb8d4fe24f?w=1200&q=80',
    'https://images.unsplash.com/photo-1520860246301-891810ddbf4e?w=1200&q=80',
    'https://images.unsplash.com/photo-1621430931505-7284b3d87532?w=1200&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80'
  ],
  Royal: [
    'https://images.unsplash.com/photo-1764286954620-28029fbae9b6?w=1200&q=80',
    'https://images.unsplash.com/photo-1741201864879-c5e7f81c98b0?w=1200&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
    'https://images.unsplash.com/photo-1741201865831-8fbb8d4fe24f?w=1200&q=80',
    'https://images.unsplash.com/photo-1520860246301-891810ddbf4e?w=1200&q=80'
  ],
  Festive: [
    'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=1200&q=80',
    'https://images.unsplash.com/photo-1741201864879-c5e7f81c98b0?w=1200&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
    'https://images.unsplash.com/photo-1764286954620-28029fbae9b6?w=1200&q=80',
    'https://images.unsplash.com/photo-1741201865831-8fbb8d4fe24f?w=1200&q=80',
    'https://images.unsplash.com/photo-1621430931505-7284b3d87532?w=1200&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    'https://images.unsplash.com/photo-1520860246301-891810ddbf4e?w=1200&q=80'
  ],
  Modern: [
    'https://images.unsplash.com/photo-1764286954620-28029fbae9b6?w=1200&q=80',
    'https://images.unsplash.com/photo-1741201864879-c5e7f81c98b0?w=1200&q=80',
    'https://images.unsplash.com/photo-1520860246301-891810ddbf4e?w=1200&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    'https://images.unsplash.com/photo-1741201865831-8fbb8d4fe24f?w=1200&q=80'
  ],
  Premium: [
    'https://images.unsplash.com/photo-1764286954620-28029fbae9b6?w=1200&q=80',
    'https://images.unsplash.com/photo-1741201864879-c5e7f81c98b0?w=1200&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
    'https://images.unsplash.com/photo-1741201865831-8fbb8d4fe24f?w=1200&q=80'
  ],
  Platform: [
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
    'https://images.unsplash.com/photo-1764286954620-28029fbae9b6?w=1200&q=80',
    'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=1200&q=80',
    'https://images.unsplash.com/photo-1741201864879-c5e7f81c98b0?w=1200&q=80',
    'https://images.unsplash.com/photo-1741201865831-8fbb8d4fe24f?w=1200&q=80'
  ]
};

const profileImages = {
  women: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80'
  ],
  men: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80'
  ],
  testimonials: [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'
  ]
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   SVG Icon Constants
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const SVG_ICONS = {
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  lock: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
  headphones: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Image Routing Helper
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function getHeroImages(category, index) {
  const cat = heroImages[category] || heroImages.Traditional;
  const i = typeof index === 'number' ? index : 0;
  return {
    heroImg: cat[i % cat.length],
    storyImgs: [
      cat[(i + 1) % cat.length],
      cat[(i + 2) % cat.length],
      cat[(i + 3) % cat.length]
    ],
    profImgs: [
      profileImages.women[i % profileImages.women.length],
      profileImages.men[i % profileImages.men.length],
      profileImages.women[(i + 1) % profileImages.women.length],
      profileImages.men[(i + 1) % profileImages.men.length]
    ],
    testAvatars: [
      profileImages.testimonials[i % profileImages.testimonials.length],
      profileImages.testimonials[(i + 1) % profileImages.testimonials.length],
      profileImages.testimonials[i % profileImages.testimonials.length]
    ]
  };
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Exports
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Part 2 â€” Hero Variant HTML Renderers, Section Renderers, Design Tokens,
   CSS Variable Builder, Assembly, Footer, and Runner
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

let embeddedCSS = '';

/* â”€â”€â”€ Shared Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function _nav(name, isDark) {
  const dc = isDark ? ' dark' : '';
  const bc = isDark ? 'nav-brand on-dark' : 'nav-brand';
  return '<nav class="tpl-nav' + dc + '">' +
    '<div class="' + bc + '"><div class="nav-logo">' + name.charAt(0) + '</div><span class="nav-word">' + name + '</span></div>' +
    '<div class="nav-links"><a href="#" class="active">Home</a><a href="#">Profiles</a><a href="#">Success Stories</a><a href="#">About</a></div>' +
    '<div class="nav-right"><a href="#" class="nav-login">Login</a><a href="#" class="tbtn btn-gradient">Register Free</a></div>' +
  '</nav>';
}

function _trust(isDark) {
  const c = isDark ? 'hero-trust on-dark-soft' : 'hero-trust';
  return '<div class="' + c + '"><span>' + SVG_ICONS.shield + ' Verified Profiles</span><span>' + SVG_ICONS.heart + ' 100% Free to Browse</span><span>' + SVG_ICONS.lock + ' Privacy Protected</span></div>';
}

const _STAR5 = SVG_ICONS.star + SVG_ICONS.star + SVG_ICONS.star + SVG_ICONS.star + SVG_ICONS.star;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Section 1 â€” Hero Variant HTML Renderers
   17 variants, each returning nav + hero HTML
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const heroVariants = {

  /* 1. frame â€” Centered hero with decorative frame border */
  frame(d, imgs) {
    return _nav(d.brandName, true) +
    '<section class="hero dark">' +
    '<div class="hero-frame on-light">' +
    '<div class="hero-orn"><div class="orn orn-lotus"></div></div>' +
    '<div class="eyebrow on-dark">' + d.eyebrow + '</div>' +
    '<h1>' + d.h1 + '</h1>' +
    '<p class="hero-sub on-dark-soft">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-gradient">' + d.cta1 + '</a><a href="#" class="tbtn btn-ghost">' + d.cta2 + '</a></div>' +
    _trust(true) +
    '<div class="hero-grid gold-ring" style="margin-top:38px">' +
    '<img src="' + imgs.profImgs[0] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[1] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[2] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[3] + '" alt="Profile">' +
    '</div></div></section>';
  },

  /* 2. rangoli â€” Light hero with corner rangoli ornaments */
  rangoli(d, imgs) {
    return _nav(d.brandName, false) +
    '<section class="hero" style="position:relative;overflow:hidden;">' +
    '<div class="orn orn-rangoli" style="position:absolute;top:20px;left:20px;opacity:.4;z-index:1;"></div>' +
    '<div class="orn orn-rangoli sm" style="position:absolute;top:20px;right:20px;opacity:.4;z-index:1;"></div>' +
    '<div class="hero-orn"><div class="orn orn-mandala sm"></div></div>' +
    '<div class="eyebrow">' + d.eyebrow + '</div>' +
    '<h1>' + d.h1 + '</h1>' +
    '<p class="hero-sub">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-solid">' + d.cta1 + '</a><a href="#" class="tbtn btn-outline">' + d.cta2 + '</a></div>' +
    _trust(false) +
    '<div class="hero-grid softs">' +
    '<img src="' + imgs.profImgs[0] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[1] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[2] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[3] + '" alt="Profile">' +
    '</div></section>';
  },

  /* 3. mandala â€” Dark hero with orn-mandala above heading */
  mandala(d, imgs) {
    return _nav(d.brandName, true) +
    '<section class="hero dark">' +
    '<div class="hero-orn"><div class="orn orn-mandala"></div></div>' +
    '<div class="eyebrow on-dark">' + d.eyebrow + '</div>' +
    '<h1>' + d.h1 + '</h1>' +
    '<p class="hero-sub on-dark-soft">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-gradient">' + d.cta1 + '</a><a href="#" class="tbtn btn-ghost">' + d.cta2 + '</a></div>' +
    _trust(true) +
    '<div class="hero-grid rounds" style="margin-top:36px">' +
    '<img src="' + imgs.profImgs[0] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[1] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[2] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[3] + '" alt="Profile">' +
    '</div></section>';
  },

  /* 4. arch â€” Centered with arch-shaped portrait image */
  arch(d, imgs) {
    return _nav(d.brandName, true) +
    '<section class="hero dark">' +
    '<img class="hero-arch-img" src="' + imgs.profImgs[0] + '" alt="Featured Profile">' +
    '<div class="eyebrow on-dark">' + d.eyebrow + '</div>' +
    '<h1>' + d.h1 + '</h1>' +
    '<p class="hero-sub on-dark-soft">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-gradient">' + d.cta1 + '</a><a href="#" class="tbtn btn-ghost">' + d.cta2 + '</a></div>' +
    _trust(true) +
    '</section>';
  },

  /* 5. royal â€” Grand dark hero with gold accents, orn-lotus, ornamental dividers */
  royal(d, imgs) {
    return _nav(d.brandName, true) +
    '<section class="hero dark">' +
    '<div class="hero-orn"><div class="orn orn-lotus"></div></div>' +
    '<div class="hero-rule" style="width:180px;height:3px;margin:0 auto 18px;background:var(--tp-s);"></div>' +
    '<div class="eyebrow on-dark">' + d.eyebrow + '</div>' +
    '<h1>' + d.h1 + '</h1>' +
    '<div class="hero-rule" style="width:100px;height:3px;margin:22px auto;background:var(--tp-sf);"></div>' +
    '<p class="hero-sub on-dark-soft">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-gradient">' + d.cta1 + '</a><a href="#" class="tbtn btn-ghost">' + d.cta2 + '</a></div>' +
    _trust(true) +
    '<div class="hero-grid gold-ring" style="margin-top:44px">' +
    '<img src="' + imgs.profImgs[0] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[1] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[2] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[3] + '" alt="Profile">' +
    '</div></section>';
  },

  /* 6. split â€” Two-column: left text + right image grid */
  split(d, imgs) {
    return _nav(d.brandName, false) +
    '<section class="hero">' +
    '<div class="hero-split">' +
    '<div>' +
    '<div class="eyebrow">' + d.eyebrow + '</div>' +
    '<h1>' + d.h1 + '</h1>' +
    '<p class="hero-sub">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-solid">' + d.cta1 + '</a><a href="#" class="tbtn btn-outline">' + d.cta2 + '</a></div>' +
    _trust(false) +
    '</div>' +
    '<div class="hero-stack">' +
    '<img src="' + imgs.storyImgs[0] + '" alt="Story">' +
    '<img src="' + imgs.profImgs[0] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[1] + '" alt="Profile">' +
    '</div></div></section>';
  },

  /* 7. collage â€” Masonry-style image collage below text */
  collage(d, imgs) {
    return _nav(d.brandName, false) +
    '<section class="hero" style="padding-bottom:48px;">' +
    '<div class="eyebrow">' + d.eyebrow + '</div>' +
    '<h1>' + d.h1 + '</h1>' +
    '<p class="hero-sub">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-solid">' + d.cta1 + '</a><a href="#" class="tbtn btn-outline">' + d.cta2 + '</a></div>' +
    '<div class="hero-stack" style="margin-top:36px;max-width:800px;margin-left:auto;margin-right:auto;">' +
    '<img src="' + imgs.storyImgs[0] + '" alt="Story">' +
    '<img src="' + imgs.profImgs[0] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[1] + '" alt="Profile">' +
    '</div></section>';
  },

  /* 8. fullbleed â€” Full-bleed background image with dark overlay */
  fullbleed(d, imgs) {
    return _nav(d.brandName, true) +
    '<section class="hero hero-fullbleed dark" style="background-image:url(\'' + imgs.heroImg + '\');position:relative;min-height:720px;display:grid;align-items:end;">' +
    '<div class="hero-fullbleed-content" style="padding:120px 24px 96px;">' +
    '<div class="eyebrow on-dark">' + d.eyebrow + '</div>' +
    '<h1 style="max-width:850px;text-align:left;">' + d.h1 + '</h1>' +
    '<p class="hero-sub" style="text-align:left;margin-left:0;">' + d.sub + '</p>' +
    '<div class="hero-ctas" style="justify-content:flex-start;"><a href="#" class="tbtn btn-gradient">' + d.cta1 + '</a><a href="#" class="tbtn btn-ghost">' + d.cta2 + '</a></div>' +
    _trust(true) +
    '</div></section>';
  },

  /* 9. form â€” Split with registration form panel */
  form(d, imgs) {
    return _nav(d.brandName, false) +
    '<section class="hero">' +
    '<div class="hero-form">' +
    '<div>' +
    '<div class="eyebrow">' + d.eyebrow + '</div>' +
    '<h1>' + d.h1 + '</h1>' +
    '<p class="hero-sub">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-solid">' + d.cta1 + '</a><a href="#" class="tbtn btn-outline">' + d.cta2 + '</a></div>' +
    _trust(false) +
    '</div>' +
    '<div class="searchpanel">' +
    '<h4>Find Your Match</h4>' +
    '<p class="sp-sub">Register for Free &bull; 3 Simple Steps</p>' +
    '<div class="sp-field"><label>I\'m looking for</label><div class="pill-group"><span class="pill active">Bride</span><span class="pill">Groom</span></div></div>' +
    '<div class="sp-field"><label>Age</label><div style="display:flex;gap:8px;"><select class="sp-select"><option>18</option><option>21</option><option>24</option><option>27</option></select><select class="sp-select"><option>25</option><option>28</option><option>30</option><option>35</option></select></div></div>' +
    '<div class="sp-field"><label>Religion</label><select class="sp-select"><option>Hindu</option><option>Muslim</option><option>Christian</option></select></div>' +
    '<div class="sp-field"><label>Community</label><select class="sp-select"><option>Any Community</option><option>Brahmin</option><option>Maratha</option><option>Kshatriya</option></select></div>' +
    '<a href="#" class="tbtn btn-gradient formbtn">' + d.cta1 + '</a>' +
    '<div class="mini-stat"><div><b>50K+</b><span>Active Profiles</span></div><div><b>92%</b><span>Success Rate</span></div><div><b>4.9</b><span>User Rating</span></div></div>' +
    '</div></div></section>';
  },

  /* 10. parallax â€” Full-bleed with parallax scroll */
  parallax(d, imgs) {
    return _nav(d.brandName, true) +
    '<section class="hero hero-parallax dark" style="background-image:url(\'' + imgs.heroImg + '\');position:relative;min-height:720px;display:grid;align-items:center;">' +
    '<div class="hero-parallax-content" style="padding:120px 24px 100px;text-align:center;">' +
    '<div class="eyebrow on-dark">' + d.eyebrow + '</div>' +
    '<h1 style="color:#fff;">' + d.h1 + '</h1>' +
    '<p class="hero-sub" style="color:rgba(255,255,255,.85);">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-gradient">' + d.cta1 + '</a><a href="#" class="tbtn btn-ghost">' + d.cta2 + '</a></div>' +
    _trust(true) +
    '</div></section>';
  },

  /* 11. gradient-anim â€” Animated gradient background */
  'gradient-anim'(d, imgs) {
    return _nav(d.brandName, true) +
    '<section class="hero hero-gradient-anim" style="position:relative;overflow:hidden;">' +
    '<div class="hero-gradient-content" style="padding:120px 24px 100px;">' +
    '<div class="eyebrow on-dark">' + d.eyebrow + '</div>' +
    '<h1 style="color:#fff;">' + d.h1 + '</h1>' +
    '<p class="hero-sub" style="color:rgba(255,255,255,.88);">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-gradient">' + d.cta1 + '</a><a href="#" class="tbtn btn-ghost">' + d.cta2 + '</a></div>' +
    _trust(true) +
    '</div></section>';
  },

  /* 12. masonry â€” Image masonry grid with 6 images */
  masonry(d, imgs) {
    return _nav(d.brandName, false) +
    '<section class="hero">' +
    '<div class="eyebrow">' + d.eyebrow + '</div>' +
    '<h1>' + d.h1 + '</h1>' +
    '<p class="hero-sub">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-solid">' + d.cta1 + '</a><a href="#" class="tbtn btn-outline">' + d.cta2 + '</a></div>' +
    '<div class="hero-masonry">' +
    '<img src="' + imgs.storyImgs[0] + '" alt="">' +
    '<img src="' + imgs.profImgs[0] + '" alt="">' +
    '<img src="' + imgs.profImgs[1] + '" alt="">' +
    '<img src="' + imgs.storyImgs[1] + '" alt="">' +
    '<img src="' + imgs.profImgs[2] + '" alt="">' +
    '<img src="' + imgs.storyImgs[2] + '" alt="">' +
    '</div></section>';
  },

  /* 13. circular â€” Circular image cutouts */
  circular(d, imgs) {
    return _nav(d.brandName, false) +
    '<section class="hero">' +
    '<div class="eyebrow">' + d.eyebrow + '</div>' +
    '<h1>' + d.h1 + '</h1>' +
    '<p class="hero-sub">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-solid">' + d.cta1 + '</a><a href="#" class="tbtn btn-outline">' + d.cta2 + '</a></div>' +
    '<div class="hero-circular">' +
    '<img src="' + imgs.profImgs[0] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[1] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[2] + '" alt="Profile">' +
    '<img src="' + imgs.profImgs[3] + '" alt="Profile">' +
    '</div></section>';
  },

  /* 14. hscroll â€” Horizontal scrollable gallery */
  hscroll(d, imgs) {
    return _nav(d.brandName, false) +
    '<section class="hero">' +
    '<div class="eyebrow">' + d.eyebrow + '</div>' +
    '<h1>' + d.h1 + '</h1>' +
    '<p class="hero-sub">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-solid">' + d.cta1 + '</a><a href="#" class="tbtn btn-outline">' + d.cta2 + '</a></div>' +
    '<div class="hero-hscroll">' +
    '<img src="' + imgs.storyImgs[0] + '" alt="">' +
    '<img src="' + imgs.profImgs[0] + '" alt="">' +
    '<img src="' + imgs.storyImgs[1] + '" alt="">' +
    '<img src="' + imgs.profImgs[1] + '" alt="">' +
    '<img src="' + imgs.storyImgs[2] + '" alt="">' +
    '<img src="' + imgs.profImgs[2] + '" alt="">' +
    '</div></section>';
  },

  /* 15. asymmetric â€” Asymmetric split (60/40) */
  asymmetric(d, imgs) {
    return _nav(d.brandName, false) +
    '<section class="hero">' +
    '<div class="hero-asymmetric">' +
    '<div>' +
    '<div class="eyebrow">' + d.eyebrow + '</div>' +
    '<h1>' + d.h1 + '</h1>' +
    '<p class="hero-sub">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-solid">' + d.cta1 + '</a><a href="#" class="tbtn btn-outline">' + d.cta2 + '</a></div>' +
    _trust(false) +
    '</div>' +
    '<img src="' + imgs.heroImg + '" alt="Hero Image">' +
    '</div></section>';
  },

  /* 16. floating â€” Floating animated circles + centered text */
  floating(d, imgs) {
    return _nav(d.brandName, false) +
    '<section class="hero hero-floating">' +
    '<div class="float-el"></div><div class="float-el"></div><div class="float-el"></div><div class="float-el"></div>' +
    '<div class="eyebrow">' + d.eyebrow + '</div>' +
    '<h1>' + d.h1 + '</h1>' +
    '<p class="hero-sub">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-solid">' + d.cta1 + '</a><a href="#" class="tbtn btn-outline">' + d.cta2 + '</a></div>' +
    _trust(false) +
    '</section>';
  },

  /* 17. minimal â€” Clean minimal, no images, generous whitespace */
  minimal(d, imgs) {
    return _nav(d.brandName, false) +
    '<section class="hero" style="padding:160px 24px 120px;">' +
    '<div class="eyebrow">' + d.eyebrow + '</div>' +
    '<h1>' + d.h1 + '</h1>' +
    '<p class="hero-sub">' + d.sub + '</p>' +
    '<div class="hero-ctas"><a href="#" class="tbtn btn-solid">' + d.cta1 + '</a><a href="#" class="tbtn btn-outline">' + d.cta2 + '</a></div>' +
    _trust(false) +
    '</section>';
  }
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Section 2 â€” Section Renderers
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const sections = {

  banner(d, imgs, pal) {
    return '<section class="tsec">' +
    '<div class="banner">' +
    '<img class="banner-bgimg" src="' + imgs.heroImg + '" alt="">' +
    '<div class="banner-inner">' +
    '<div class="banner-orn"><div class="divider m-' + pal.motif + '"></div></div>' +
    '<h2>' + d.h1 + '</h2>' +
    '<p>' + d.sub + '</p>' +
    '<div class="banner-chips">' +
    '<span>' + SVG_ICONS.shield + ' Verified Profiles</span>' +
    '<span>' + SVG_ICONS.heart + ' Free Registration</span>' +
    '<span>' + SVG_ICONS.lock + ' 100% Private</span>' +
    '</div>' +
    '<div class="banner-ctas"><a href="#" class="tbtn btn-gradient">' + d.cta1 + '</a><a href="#" class="tbtn btn-ghost">' + d.cta2 + '</a></div>' +
    '</div></div></section>';
  },

  stats(d, imgs, pal) {
    let cells = '';
    for (let i = 0; i < d.stats.length; i++) {
      cells += '<div class="stat-cell"><div class="stat-val">' + d.stats[i] + '</div><div class="stat-lab">' + d.statLabs[i] + '</div></div>';
    }
    return '<section class="tsec">' +
    '<div class="tsec-inner">' +
    '<div class="stats-float"><div class="stats-card">' + cells + '</div></div>' +
    '</div></section>';
  },

  features(d, imgs, pal) {
    const icons = [SVG_ICONS.shield, SVG_ICONS.heart, SVG_ICONS.sparkles];
    const borderClass = pal.category === 'Festive' ? 'bordered-bottom' : 'bordered-top';
    let cards = '';
    for (let i = 0; i < d.features.length; i++) {
      cards += '<div class="feat-card ' + borderClass + '">' +
        '<div class="icon-tile">' + icons[i % icons.length] + '</div>' +
        '<h3>' + d.features[i].title + '</h3>' +
        '<p>' + d.features[i].desc + '</p></div>';
    }
    return '<section class="tsec altsection">' +
    '<div class="tsec-inner tpy-24">' +
    '<div class="ttext-center">' +
    '<div class="eyebrow">' + d.eyebrow + '</div>' +
    '<h2 class="sectitle">Why Choose Us</h2>' +
    '<div class="divider m-' + pal.motif + ' med"></div>' +
    '</div>' +
    '<div class="feat-grid">' + cards + '</div>' +
    '</div></section>';
  },

  how(d, imgs, pal) {
    let steps = '';
    for (let i = 0; i < d.steps.length; i++) {
      steps += '<div><div class="step-num light">' + (i + 1) + '</div>' +
        '<h3>' + d.steps[i].title + '</h3>' +
        '<p>' + d.steps[i].desc + '</p></div>';
    }
    return '<section class="tsec how-section">' +
    '<div class="tsec-inner tpy-24">' +
    '<div class="ttext-center">' +
    '<div class="eyebrow">How It Works</div>' +
    '<h2 class="sectitle">Your Journey in 3 Steps</h2>' +
    '<div class="divider m-' + pal.motif + ' med"></div>' +
    '</div>' +
    '<div class="steps">' + steps + '</div>' +
    '</div></section>';
  },

  profiles(d, imgs, pal) {
    let cards = '';
    for (let i = 0; i < d.profiles.length; i++) {
      const p = d.profiles[i];
      cards += '<div class="prof-card">' +
        '<div class="prof-img-wrap">' +
        '<img src="' + imgs.profImgs[i % imgs.profImgs.length] + '" alt="' + p.name + '">' +
        '<div class="prof-badge white">' + SVG_ICONS.check + ' Verified</div>' +
        '</div>' +
        '<div class="prof-body">' +
        '<div class="prof-name">' + p.name + ', ' + p.age + '</div>' +
        '<div class="prof-sub">' + p.job + ' &bull; ' + p.city + '</div>' +
        '<p style="margin-top:8px;font-size:13px;color:var(--tp-ts);line-height:1.6;">' + p.intro + '</p>' +
        '</div></div>';
    }
    return '<section class="tsec altsection">' +
    '<div class="tsec-inner tpy-24">' +
    '<div class="prof-head"><div>' +
    '<div class="eyebrow">Featured Profiles</div>' +
    '<h2 class="sectitle">Meet Our Members</h2>' +
    '</div><a href="#" class="viewall">View All Profiles &rarr;</a></div>' +
    '<div class="prof-grid">' + cards + '</div>' +
    '</div></section>';
  },

  success(d, imgs, pal) {
    let cards = '';
    for (let i = 0; i < d.stories.length; i++) {
      const s = d.stories[i];
      cards += '<div class="story-card">' +
        '<img src="' + imgs.storyImgs[i % imgs.storyImgs.length] + '" alt="' + s.names + '">' +
        '<div class="story-body">' +
        '<div class="story-stars">' + _STAR5 + '</div>' +
        '<h3>' + s.names + '</h3>' +
        '<div class="story-meta">' + s.loc + ' &bull; ' + s.date + '</div>' +
        '<p class="story-quote">&ldquo;' + s.quote + '&rdquo;</p>' +
        '</div></div>';
    }
    return '<section class="tsec">' +
    '<div class="tsec-inner tpy-24">' +
    '<div class="ttext-center">' +
    '<div class="eyebrow">Real Stories</div>' +
    '<h2 class="sectitle">Love Stories That Inspire</h2>' +
    '<div class="divider m-' + pal.motif + ' med"></div>' +
    '</div>' +
    '<div class="story-grid">' + cards + '</div>' +
    '</div></section>';
  },

  cta(d, imgs, pal) {
    const borderCls = ['Traditional', 'Regional', 'Royal', 'Festive'].indexOf(pal.category) >= 0 ? ' cta-border' : '';
    return '<section class="tsec">' +
    '<div class="tsec-inner tpy-16">' +
    '<div class="cta-panel darksec' + borderCls + '">' +
    '<h2 class="on-dark">Ready to Find Your Match?</h2>' +
    '<p class="on-dark-soft" style="margin:0 auto;max-width:560px;">Join thousands of happy couples who found their perfect life partner through our trusted platform.</p>' +
    '<div class="cta-ctas"><a href="#" class="tbtn btn-gradient">' + d.cta1 + '</a><a href="#" class="tbtn btn-ghost">' + d.cta2 + '</a></div>' +
    '</div></div></section>';
  },

  testimonials(d, imgs, pal) {
    let cards = '';
    for (let i = 0; i < d.testimonials.length; i++) {
      const t = d.testimonials[i];
      cards += '<div class="story-card">' +
        '<div class="story-body">' +
        '<div class="story-stars">' + _STAR5 + '</div>' +
        '<p class="story-quote">&ldquo;' + t.quote + '&rdquo;</p>' +
        '<h3 style="font-size:14px;margin-top:12px;">' + t.name + '</h3>' +
        '<div class="story-meta">' + t.role + '</div>' +
        '</div></div>';
    }
    return '<section class="tsec altsection">' +
    '<div class="tsec-inner tpy-24">' +
    '<div class="ttext-center">' +
    '<div class="eyebrow">Testimonials</div>' +
    '<h2 class="sectitle">What Families Say</h2>' +
    '<div class="divider m-' + pal.motif + ' med"></div>' +
    '</div>' +
    '<div class="story-grid">' + cards + '</div>' +
    '</div></section>';
  },

  counters(d, imgs, pal) {
    if (!d.counters || d.counters.length === 0) return '';
    let cells = '';
    for (let i = 0; i < d.counters.length; i++) {
      cells += '<div class="stat-cell">' +
        '<div class="stat-val">' + d.counters[i] + (d.counterSuffix[i] || '') + '</div>' +
        '<div class="stat-lab">' + (d.counterLabs[i] || '') + '</div>' +
        '</div>';
    }
    return '<section class="tsec darksec">' +
    '<div class="tsec-inner tpy-16">' +
    '<div class="stats-float"><div class="stats-card" style="background:rgba(255,255,255,.12);border:none;">' + cells + '</div></div>' +
    '</div></section>';
  },

  beforeafter() { return ''; }
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Section 3 â€” Design Fidelity Tokens (--td-*)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function designTokens(pal) {
  const h = pal.hero;
  const t = [];

  t.push('--td-eyebrow-track:.18em');
  t.push('--td-eyebrow-size:10px');
  t.push('--td-hero-pad:110px 24px 84px');
  t.push('--td-h1-size:52px');
  t.push('--td-h1-lh:1.1');
  t.push('--td-h1-weight:700');
  t.push('--td-sub-w:640px');
  t.push('--td-sub-mt:18px');
  t.push('--td-sub-size:16px');
  t.push('--td-ctas-gap:14px');
  t.push('--td-ctas-mt:30px');
  t.push('--td-trust-gap:22px');
  t.push('--td-trust-mt:26px');
  t.push('--td-trust-svg:15px');
  t.push('--td-hero-orn-mb:22px');
  t.push('--td-hero-max-w:768px');
  t.push('--td-grid-gap:14px');
  t.push('--td-grid-w:920px');
  t.push('--td-grid-mt:38px');
  t.push('--td-grid-img-h:150px');
  t.push('--td-grid-img-radius:14px');
  t.push('--td-nav-brand-size:22px');
  t.push('--td-nav-brand-weight:700');
  t.push('--td-nav-brand-track:normal');
  t.push('--td-nav-links-gap:26px');
  t.push('--td-nav-links-size:13px');
  t.push('--td-nav-login-size:13px');
  t.push('--td-ghost-border:1.5px solid rgba(255,255,255,.55)');
  t.push('--td-ghost-color:#fff');
  t.push('--td-ghost-bg:transparent');
  t.push('--td-ghost-hover-bg:transparent');
  t.push('--td-ghost-hover-color:rgba(255,255,255,.55)');
  t.push('--td-dark-bg:linear-gradient(165deg,var(--tp-p) 0%,var(--tp-d1) 50%,var(--tp-d2) 100%)');
  t.push('--td-dark-bg-deep:linear-gradient(165deg,var(--tp-p) 0%,var(--tp-d1) 50%,var(--tp-d2) 100%)');
  t.push('--td-alt-bg:var(--tp-bgd)');
  t.push('--td-card-bg:var(--tp-card)');
  t.push('--td-card-border:1px solid var(--tp-pl)');
  t.push('--td-card-top:0');
  t.push('--td-feat-radius:var(--tp-r-lg)');
  t.push('--td-feat-shadow:var(--tp-shadow)');
  t.push('--td-stats-val:var(--tp-sf)');
  t.push('--td-stats-lab:var(--tp-ods)');
  t.push('--td-float-bg:var(--tp-card)');
  t.push('--td-float-border:1px solid var(--tp-pl)');
  t.push('--td-float-radius:var(--tp-r-lg)');
  t.push('--td-banner-veil:linear-gradient(100deg,var(--tp-d2) 0%,var(--tp-d1) 58%,var(--tp-p) 112%)');
  t.push('--td-banner-veil-op:.93');
  t.push('--td-cta-radius:32px');

  if (h === 'frame') {
    t.push('--td-frame-w:960px');
    t.push('--td-frame-radius:40px 40px 20px 20px');
    t.push('--td-frame-offset:-9px');
    t.push('--td-frame-pad:44px 40px 40px');
    t.push('--td-frame-shadow:0 30px 70px rgba(0,0,0,.35)');
  }
  if (h === 'rangoli') {
    t.push('--td-rangoli-tl-y:20px');
    t.push('--td-rangoli-tl-x:20px');
    t.push('--td-rangoli-tr-y:20px');
    t.push('--td-rangoli-tr-x:20px');
  }
  if (h === 'fullbleed' || h === 'parallax' || h === 'gradient-anim') {
    t.push('--td-hero-pad:0');
  }
  if (h === 'royal') {
    t.push('--td-hero-orn-mb:28px');
  }
  if (h === 'form') {
    t.push('--td-h1-size:42px');
  }
  if (h === 'asymmetric') {
    t.push('--td-h1-size:44px');
  }
  if (h === 'minimal') {
    t.push('--td-hero-pad:160px 24px 120px');
  }

  return t.join(';');
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Section 4 â€” CSS Variable Builder (--tp-*)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function cssVars(pal) {
  const c = pal.colors;
  const f = pal.fonts;
  return [
    '--tp-p:' + c.p,
    '--tp-dp:' + c.dp,
    '--tp-ink:' + c.ink,
    '--tp-s:' + c.s,
    '--tp-sf:' + c.sf,
    '--tp-sd:' + c.sd,
    '--tp-pl:' + c.pl,
    '--tp-od:' + c.od,
    '--tp-ods:' + c.ods,
    '--tp-bg:' + c.bg,
    '--tp-bgd:' + c.bgd,
    '--tp-card:' + c.card,
    '--tp-t:' + c.t,
    '--tp-ts:' + c.ts,
    '--tp-d1:' + c.d1,
    '--tp-d2:' + c.d2,
    "--tp-h:'" + f[0] + "',serif",
    "--tp-b:'" + f[1] + "',sans-serif"
  ].join(';');
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Section 7 â€” Footer
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function footerHTML(pal) {
  return '<footer class="tpl-footer darksec">' +
  '<div class="foot-grid">' +
  '<div>' +
  '<div class="foot-brand"><div class="nav-logo footer-logo">' + pal.name.charAt(0) + '</div>' + pal.name + '</div>' +
  '<p class="foot-blurb">A premium matchmaking experience rooted in authentic Hindu traditions. Discover matches that align with your values, culture, and life aspirations.</p>' +
  '</div>' +
  '<div><h4>Quick Links</h4><ul>' +
  '<li><a href="#">About Us</a></li><li><a href="#">How It Works</a></li><li><a href="#">Success Stories</a></li><li><a href="#">Pricing</a></li><li><a href="#">Contact</a></li>' +
  '</ul></div>' +
  '<div><h4>Communities</h4><ul>' +
  '<li><a href="#">Brahmin Matrimony</a></li><li><a href="#">Maratha Matrimony</a></li><li><a href="#">Saraswat Matrimony</a></li><li><a href="#">CKP Matrimony</a></li><li><a href="#">All Communities</a></li>' +
  '</ul></div>' +
  '<div><h4>Contact</h4><ul class="foot-contact">' +
  '<li>' + SVG_ICONS.headphones + ' 1800-XXX-XXXX (Toll Free)</li>' +
  '<li>' + SVG_ICONS.lock + ' support@vivaha.com</li>' +
  '<li>' + SVG_ICONS.check + ' ISO 27001 Certified</li>' +
  '</ul></div>' +
  '</div>' +
  '<div class="foot-bottom">' +
  '<span>&copy; 2025 ' + pal.name + '. All rights reserved.</span>' +
  '<div><a href="#">Privacy Policy</a><a href="#">Terms</a><a href="#">Sitemap</a></div>' +
  '</div></footer>';
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Section 5 â€” Main Assembly Function
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildTemplate(pal, index) {
  const id = pal.id;
  const tpl = content[id] || getDefaultContent(id, pal.name, pal.category);
  const imgs = getHeroImages(pal.category, index);

  const data = {
    brandName: pal.name,
    eyebrow: tpl.eyebrow,
    h1: tpl.h1,
    sub: tpl.sub,
    cta1: tpl.cta1,
    cta2: tpl.cta2,
    stats: tpl.stats,
    statLabs: tpl.statLabs,
    counters: tpl.counters || [],
    counterSuffix: tpl.counterSuffix || [],
    counterLabs: tpl.counterLabs || [],
    features: tpl.features,
    steps: tpl.steps,
    profiles: tpl.profiles,
    stories: tpl.stories,
    testimonials: tpl.testimonials || []
  };

  const heroFn = heroVariants[pal.hero] || heroVariants.minimal;
  const heroHTML = heroFn(data, imgs);

  const garlandCategories = ['Traditional', 'Regional', 'Royal', 'Festive'];
  const garlandHTML = garlandCategories.indexOf(pal.category) >= 0
    ? '<div class="banner-garland"></div>'
    : '';

  let sectionsHTML = '';
  const order = pal.order || [];
  for (let i = 0; i < order.length; i++) {
    const fn = sections[order[i]];
    if (fn) { sectionsHTML += fn(data, imgs, pal); }
  }

  const css = cssVars(pal);
  const td = designTokens(pal);

  const html = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'<meta charset="UTF-8">\n' +
'<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
'<title>' + pal.name + ' - Matrimony</title>\n' +
'<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
'<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Serif+Display&family=Rubik:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&family=Lato:wght@400;700&family=Marcellus&family=Libre+Baskerville:wght@400;700&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">\n' +
'<style>' + embeddedCSS + '</style>\n' +
'</head>\n' +
'<body>\n' +
'<div class="tpl-root tpl-wrap" data-tpl="' + id + '" style="' + css + ';' + td + '">\n' +
heroHTML + '\n' +
garlandHTML + '\n' +
sectionsHTML + '\n' +
footerHTML(pal) + '\n' +
'</div>\n' +
'<div class="sticky-bar" id="stickyBar"><span class="sticky-text">Find your perfect match today!</span><a href="#" class="tbtn btn-gradient sticky-cta">' + data.cta1 + '</a></div>\n' +
'<button class="fab" id="fabBtn" aria-label="Get Help">' + SVG_ICONS.headphones + '</button>\n' +
'<script>\n' +
'(function(){\n' +
'var bar=document.getElementById("stickyBar");\n' +
'window.addEventListener("scroll",function(){\n' +
'if(window.scrollY>600){bar.classList.add("visible");}else{bar.classList.remove("visible");}\n' +
'});\n' +
'})();\n' +
'</script>\n' +
'</body>\n' +
'</html>';

  return html;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Section 6 â€” Main Runner
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function main() {
  const cssPath = path.resolve(__dirname, '..', 'src', 'themes', 'theme-templates.css');
  const palPath = path.resolve(__dirname, '..', 'generated-palettes.json');
  const outDir = path.resolve(__dirname, '..', 'designs');

  if (!fs.existsSync(palPath)) {
    console.error('ERROR: generated-palettes.json not found at', palPath);
    process.exit(1);
  }
  if (!fs.existsSync(cssPath)) {
    console.error('ERROR: theme-templates.css not found at', cssPath);
    process.exit(1);
  }

  embeddedCSS = fs.readFileSync(cssPath, 'utf-8');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const palettesList = JSON.parse(fs.readFileSync(palPath, 'utf-8'));
  console.log('Building ' + palettesList.length + ' templates...');

  for (let i = 0; i < palettesList.length; i++) {
    const pal = palettesList[i];
    const html = buildTemplate(pal, i);
    const outPath = path.join(outDir, pal.id + '.html');
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log('  \u2713 ' + pal.id + '.html');
  }

  console.log('\nDone! ' + palettesList.length + ' templates written to ' + outDir);
}

module.exports = {
  content,
  getDefaultContent,
  getHeroImages,
  heroImages,
  profileImages,
  SVG_ICONS,
  palettes,
  PALETTES,
  OUTPUT_DIR,
  heroVariants,
  sections,
  designTokens,
  cssVars,
  buildTemplate,
  footerHTML,
  main
};

main();
