export interface BarberService {
  id: string;
  name: string;
  price: number;
  duration: string;
  category: 'fades' | 'classic' | 'beard' | 'kids';
  badge?: string;
  shortDesc: string;
  includes: string[];
  image: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  styleTag: string;
  category: 'fades' | 'afro' | 'executive' | 'kids';
  serviceName: string;
  price: number;
  barberNote: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  service: string;
  rating: number;
  comment: string;
}

export const BARBER_SERVICES: BarberService[] = [
  {
    id: 'low-fade',
    name: 'Low Fade',
    price: 6000,
    duration: '35 Mins',
    category: 'fades',
    badge: 'Lagos Bestseller',
    shortDesc:
      'Seamless drop blend around the ear and nape that preserves full crown weight for deep 360 waves or subtle curls.',
    includes: [
      'Precision zero-gap temple & nape taper',
      'Surgical straight-razor hairline & C-cup carving',
      'Raw Nigerian shea & argan wave pomade finish',
    ],
    image: '/images/cut-low-fade.jpg',
  },
  {
    id: 'high-fade',
    name: 'High Fade',
    price: 6500,
    duration: '40 Mins',
    category: 'fades',
    badge: 'Corporate Favorite',
    shortDesc:
      'Commanding high-contrast transition rising above the temples—engineered for sharp jawlines and Monday boardroom presence.',
    includes: [
      'High-elevation clipper gradient blend',
      'Crisp forehead line-up without pushing back hairline',
      'Cooling menthol aftershave mist & brush finish',
    ],
    image: '/images/cut-high-fade.jpg',
  },
  {
    id: 'skin-fade',
    name: 'Skin Fade',
    price: 7500,
    duration: '45 Mins',
    category: 'fades',
    badge: 'Signature Craft',
    shortDesc:
      'Ultra-blurry foil-shaver bald fade with microscopic gradient transitions from bare skin to rich textured top.',
    includes: [
      'Hypoallergenic titanium foil shaver zero-finish',
      'Hot eucalyptus steam towel neck treatment',
      'Anti-bump tea tree & aloe soothing ritual',
    ],
    image: '/images/cut-skin-fade.jpg',
  },
  {
    id: 'buzz-cut',
    name: 'Buzz Cut',
    price: 5000,
    duration: '30 Mins',
    category: 'classic',
    shortDesc:
      'Uniform, athletic low-maintenance crop with geometric perimeter architecture and a relaxing scalp rejuvenation massage.',
    includes: [
      'Uniform multi-angle guard leveling',
      'Laser-straight hairline & sideburn detailing',
      'Invigorating peppermint scalp tonic massage',
    ],
    image: '/images/cut-low-fade.jpg',
  },
  {
    id: 'afro',
    name: 'Afro',
    price: 6000,
    duration: '40 Mins',
    category: 'classic',
    badge: '4C Texture Specialist',
    shortDesc:
      'Freehand architectural Afro shaping, sponge-twist or coil definition, paired with a clean blowout temple and neck taper.',
    includes: [
      'Freehand scissor & clipper-over-comb crown sculpting',
      'Optional sponge twist / curl definition styling',
      'Blowout temple taper & crisp perimeter line-up',
    ],
    image: '/images/cut-afro-taper.jpg',
  },
  {
    id: 'beard-trim',
    name: 'Beard Trim',
    price: 3500,
    duration: '25 Mins',
    category: 'beard',
    shortDesc:
      'Bespoke facial hair architecture—faded sideburns, symmetric cheek lines, and a hot towel straight-razor finish.',
    includes: [
      'Graduated sideburn-to-beard fade integration',
      'Hot steam towel pore opening & straight-razor edge',
      'Cold-pressed cedarwood & jojoba beard elixir',
    ],
    image: '/images/cut-skin-fade.jpg',
  },
  {
    id: 'haircut-beard',
    name: 'Haircut + Beard',
    price: 9000,
    duration: '60 Mins',
    category: 'beard',
    badge: 'The Odogwu Package • Save ₦1,000',
    shortDesc:
      'Our flagship executive ritual. Any signature Fade, Afro, or Buzz Cut combined with full hot-towel beard sculpting.',
    includes: [
      'Full custom haircut & fade of your choice',
      'Luxury hot & cold double-towel beard sculpting',
      'Complimentary chilled Chapman, Palm Wine, or Espresso',
    ],
    image: '/images/hero-barber.jpg',
  },
  {
    id: 'kids-haircut',
    name: 'Kids Haircut',
    price: 4000,
    duration: '30 Mins',
    category: 'kids',
    badge: 'Ages 3 – 12',
    shortDesc:
      'Patient, gentle, and ultra-clean cuts for young kings—using whisper-quiet clippers and zero-sting sanitizers.',
    includes: [
      'Skin-friendly, zero-pull clipper guards for sensitive scalps',
      'Optional subtle surgical part line for school or weekend',
      'Complimentary juice box & PS5 gaming chair access',
    ],
    image: '/images/cut-kids.jpg',
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: '360 Deep Waves & Blurry Low Taper',
    styleTag: 'Low Fade • 360 Waves',
    category: 'fades',
    serviceName: 'Low Fade',
    price: 6000,
    barberNote: 'Cut with #1.5 with-the-grain to preserve wave depth, finished with raw shea pomade.',
    image: '/images/cut-low-fade.jpg',
  },
  {
    id: 'gal-2',
    title: 'Zero-Foil Skin Fade & Boxed Beard',
    styleTag: 'Haircut + Beard • Owambe Ready',
    category: 'executive',
    serviceName: 'Haircut + Beard',
    price: 9000,
    barberNote: 'High-contrast foil fade blended seamlessly into a razor-sculpted full Nigerian beard.',
    image: '/images/cut-skin-fade.jpg',
  },
  {
    id: 'gal-3',
    title: 'Sponge-Twist Afro Crown & Temple Taper',
    styleTag: 'Afro • 4C Coil Sculpting',
    category: 'afro',
    serviceName: 'Afro',
    price: 6000,
    barberNote: 'Natural 4C volume shaped freehand with a crisp C-cup arc and temple taper.',
    image: '/images/cut-afro-taper.jpg',
  },
  {
    id: 'gal-4',
    title: 'Victoria Island Executive High Fade',
    styleTag: 'High Fade • Boardroom Sharp',
    category: 'executive',
    serviceName: 'High Fade',
    price: 6500,
    barberNote: 'Paired effortlessly with Senator native wear or a three-piece suit.',
    image: '/images/cut-high-fade.jpg',
  },
  {
    id: 'gal-5',
    title: 'Young King Burst Fade & Curved Part',
    styleTag: 'Kids Haircut • Neat & Gentle',
    category: 'kids',
    serviceName: 'Kids Haircut',
    price: 4000,
    barberNote: 'Gentle precision without nicking sensitive skin—school-approved and party-sharp.',
    image: '/images/cut-kids.jpg',
  },
  {
    id: 'gal-6',
    title: 'Master Chair Precision Session',
    styleTag: 'Skin Fade • Master Barber Craft',
    category: 'fades',
    serviceName: 'Skin Fade',
    price: 7500,
    barberNote: 'Every hairline is mapped to your natural cranial geometry—never pushed back.',
    image: '/images/hero-barber.jpg',
  },
  {
    id: 'gal-7',
    title: 'The Lekki Phase 1 Flagship Lounge',
    styleTag: 'Studio Interior • 24/7 Power & AC',
    category: 'executive',
    serviceName: 'Haircut + Beard',
    price: 9000,
    barberNote: 'Custom hydraulic leather chairs, warm tungsten lighting, and hospital-grade sterilizers.',
    image: '/images/lounge-interior.jpg',
  },
  {
    id: 'gal-8',
    title: 'Tunde "Blade" Adeyemi at Work',
    styleTag: 'Beard Trim • Hot Towel Ritual',
    category: 'afro',
    serviceName: 'Beard Trim',
    price: 3500,
    barberNote: '11+ years of mastering African hair patterns and razor-bump prevention.',
    image: '/images/founder-portrait.jpg',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'rev-1',
    name: 'Olumide Bankole',
    role: 'Fintech Product Lead',
    location: 'Victoria Island, Lagos',
    service: 'Haircut + Beard (₦9,000)',
    rating: 5,
    comment:
      'Before finding Tunde at Sharp Cuts, barbers kept pushing my hairline back or giving me razor bumps on my neck. Three years here and my fade is spotless every Friday. The hot towel beard ritual is unmatched in Lagos.',
  },
  {
    id: 'rev-2',
    name: 'Chukwuka Nwosu',
    role: 'Architect & Groom',
    location: 'Lekki Phase 1, Lagos',
    service: 'Skin Fade (₦7,500)',
    rating: 5,
    comment:
      'Booked Sharp Cuts for myself and my 6 groomsmen before my traditional wedding. Tunde and his chairs had every single guy looking like magazine covers. Zero power cuts, cold Chapman on arrival, and surgical clippers.',
  },
  {
    id: 'rev-3',
    name: 'Babajide & Ayo Olatunji',
    role: 'Father & Son Clients',
    location: 'Ikoyi, Lagos',
    service: 'Low Fade + Kids Haircut',
    rating: 5,
    comment:
      'My 7-year-old son used to dread haircuts until we came to Sharp Cuts. Tunde is so patient with kids, the clippers never pinch, and we both walk out looking fresh for Sunday service.',
  },
];

export const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:30 PM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '06:30 PM',
  '07:45 PM',
];
