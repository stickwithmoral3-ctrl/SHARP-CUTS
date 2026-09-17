import React, { useState, useEffect, useRef } from 'react';
import {
  Scissors,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Award,
  Star,
  ChevronRight,
  Menu,
  X,
  MessageCircle,
  User,
  Maximize2,
  Zap,
  Check,
  AlertCircle,
  ArrowRight,
  Coffee,
} from 'lucide-react';
import {
  BARBER_SERVICES,
  GALLERY_ITEMS,
  TESTIMONIALS,
  TIME_SLOTS,
  BarberService,
  GalleryItem,
} from './data/barbershopData';

interface BookingFormState {
  fullName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  service: string;
  complimentaryDrink: string;
  notes: string;
}

interface BookingFormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  date?: string;
  time?: string;
  service?: string;
}

interface ConfirmedBooking extends BookingFormState {
  referenceId: string;
  price: number;
  duration: string;
  createdAt: string;
}

export function App() {
  // Navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [scrolled, setScrolled] = useState(false);

  // Services filtering state
  const [serviceFilter, setServiceFilter] = useState<'all' | 'fades' | 'classic' | 'beard' | 'kids'>('all');

  // About section tab state
  const [aboutTab, setAboutTab] = useState<'story' | 'hygiene' | 'lounge'>('story');

  // Gallery filter & lightbox state
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'fades' | 'afro' | 'executive' | 'kids'>('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Default today's date in YYYY-MM-DD
  const getTodayStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Booking form state
  const [bookingForm, setBookingForm] = useState<BookingFormState>({
    fullName: '',
    phone: '',
    email: '',
    date: getTodayStr(),
    time: '11:00 AM',
    service: 'Low Fade',
    complimentaryDrink: 'Chilled Chapman',
    notes: '',
  });
  const [bookingErrors, setBookingErrors] = useState<BookingFormErrors>({});
  const [bookingConfirmed, setBookingConfirmed] = useState<ConfirmedBooking | null>(null);
  const [servicePulse, setServicePulse] = useState(false);
  const [preselectedBanner, setPreselectedBanner] = useState<string | null>(null);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    contactInfo: '',
    subject: 'General Inquiry / VIP Grooming',
    message: '',
  });
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);

  const serviceSelectRef = useRef<HTMLSelectElement | null>(null);

  // Format Naira helper
  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG')}`;
  };

  // Find currently selected service object
  const currentServiceObj: BarberService =
    BARBER_SERVICES.find((s) => s.name.toLowerCase() === bookingForm.service.toLowerCase()) ||
    BARBER_SERVICES[0];

  // Handle scroll tracking for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
      const sectionIds = ['home', 'services', 'about', 'gallery', 'booking', 'contact'];
      const scrollPosition = window.scrollY + 180;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to external custom event from script.js if triggered
  useEffect(() => {
    const handleCustomServiceSelect = (e: Event) => {
      const customEvent = e as CustomEvent<{ serviceName?: string }>;
      if (customEvent.detail?.serviceName) {
        handleBookThisHaircut(customEvent.detail.serviceName);
      }
    };
    window.addEventListener('sharpcuts:select-service', handleCustomServiceSelect);
    return () => window.removeEventListener('sharpcuts:select-service', handleCustomServiceSelect);
  }, []);

  // Smooth scroll to any section
  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Core requirement: When a customer clicks "Book This Haircut" from Services or Gallery,
  // automatically select that haircut in the booking form and scroll to Booking.
  const handleBookThisHaircut = (serviceName: string) => {
    const matchedService =
      BARBER_SERVICES.find((s) => s.name.toLowerCase() === serviceName.toLowerCase()) ||
      BARBER_SERVICES[0];

    setBookingForm((prev) => ({
      ...prev,
      service: matchedService.name,
    }));
    setBookingErrors((prev) => ({ ...prev, service: undefined }));
    setBookingConfirmed(null);
    setPreselectedBanner(
      `${matchedService.name} (${formatNaira(matchedService.price)}) has been pre-selected for your appointment.`
    );

    scrollToSection('booking');

    // Trigger gold pulse highlight on the service dropdown
    setServicePulse(false);
    setTimeout(() => {
      setServicePulse(true);
      if (serviceSelectRef.current) {
        serviceSelectRef.current.focus({ preventScroll: true });
      }
    }, 350);
  };

  // Quick date helpers for Nigerian weekend / weekday scheduling
  const setQuickDate = (daysOffset: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    setBookingForm((prev) => ({ ...prev, date: `${yyyy}-${mm}-${dd}` }));
    setBookingErrors((prev) => ({ ...prev, date: undefined }));
  };

  // Validate Booking Form before submission
  const validateBookingForm = (): boolean => {
    const errors: BookingFormErrors = {};

    if (!bookingForm.fullName.trim() || bookingForm.fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name (e.g., Chukwudi Okafor).';
    }

    const cleanedPhone = bookingForm.phone.replace(/[\s\-()]/g, '');
    if (!cleanedPhone || cleanedPhone.length < 7 || !/^\+?[0-9]{7,15}$/.test(cleanedPhone)) {
      errors.phone = 'Please enter a valid phone number (e.g., 0803 123 4567 or +234...).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!bookingForm.email.trim() || !emailRegex.test(bookingForm.email.trim())) {
      errors.email = 'Please enter a valid email address for your confirmation pass.';
    }

    if (!bookingForm.date) {
      errors.date = 'Please choose your preferred appointment date.';
    }

    if (!bookingForm.time) {
      errors.time = 'Please choose an appointment time slot.';
    }

    if (!bookingForm.service) {
      errors.service = 'Please select a haircut or grooming service.';
    }

    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Booking Form
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBookingForm()) {
      return;
    }

    const randomRef = `SC-LKK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newConfirmation: ConfirmedBooking = {
      ...bookingForm,
      referenceId: randomRef,
      price: currentServiceObj.price,
      duration: currentServiceObj.duration,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setBookingConfirmed(newConfirmation);
  };

  // Submit Contact Form
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.contactInfo.trim() || !contactForm.message.trim()) {
      setContactError('Please fill in your name, phone/email, and message before sending.');
      return;
    }
    setContactError(null);
    setContactSuccess(true);
    setContactForm({
      name: '',
      contactInfo: '',
      subject: 'General Inquiry / VIP Grooming',
      message: '',
    });
  };

  const filteredServices =
    serviceFilter === 'all'
      ? BARBER_SERVICES
      : BARBER_SERVICES.filter((item) => item.category === serviceFilter);

  const filteredGallery =
    galleryFilter === 'all'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === galleryFilter);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' },
    { id: 'booking', label: 'Booking' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F5F5F7] flex flex-col selection:bg-[#D4AF37] selection:text-[#0A0A0C]">
      {/* Top Nigerian Executive Hospitality Announcement Strip */}
      <div className="bg-[#131418] border-b border-white/10 text-xs sm:text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[#A1A1AA]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span className="font-medium text-[#F5F5F7]">Lekki Phase 1 Flagship Lounge:</span>
            <span>Open Daily • 100% Uninterrupted Solar & Inverter Power</span>
          </div>
          <div className="hidden md:flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-[#D4AF37]">
              <ShieldCheck className="w-3.5 h-3.5" /> Hospital-Grade UV Blade Sterilization
            </span>
            <a
              href="https://wa.me/2348094458820?text=Hello%20Sharp%20Cuts%20Lagos%2C%20I%20would%20like%20to%20make%20an%20inquiry."
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#25D366] transition-colors flex items-center gap-1 font-medium text-[#F5F5F7]"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> +234 809 445 8820
            </a>
          </div>
        </div>
      </div>

      {/* Responsive Sticky Navbar: Home | Services | About | Gallery | Contact | Booking */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0A0A0C]/90 backdrop-blur-xl border-b border-[#D4AF37]/25 shadow-2xl'
            : 'bg-[#0A0A0C]/75 backdrop-blur-md border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#B8860B] to-[#7A5805] p-[1px] shadow-lg shadow-[#D4AF37]/15">
              <div className="w-full h-full bg-[#0A0A0C] rounded-[11px] flex items-center justify-center group-hover:bg-[#131418] transition-colors">
                <Scissors className="w-5 h-5 text-[#D4AF37] -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white block leading-none">
                SHARP <span className="gold-gradient-text">CUTS</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#A1A1AA] block mt-1">
                Lagos Grooming House
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30'
                      : 'text-[#F5F5F7]/85 hover:text-[#D4AF37] hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            {bookingConfirmed && (
              <button
                onClick={() => scrollToSection('booking')}
                className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Pass: {bookingConfirmed.referenceId}
              </button>
            )}
            <button
              onClick={() => scrollToSection('booking')}
              className="gold-button-gradient font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-[#131418] border border-white/10 text-[#F5F5F7] hover:border-[#D4AF37]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#D4AF37]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#131418] border-b border-[#D4AF37]/30 px-4 pt-3 pb-6 space-y-2 shadow-2xl">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                }}
                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  activeSection === item.id
                    ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                    : 'text-[#F5F5F7] hover:bg-white/5'
                }`}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-3">
              <button
                onClick={() => scrollToSection('booking')}
                className="w-full gold-button-gradient font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <Calendar className="w-4 h-4" />
                Book an Appointment
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* =====================================================================
            SECTION 1: HOME (HERO)
            ===================================================================== */}
        <section
          id="home"
          className="relative overflow-hidden adire-bg-pattern pt-10 pb-20 lg:pt-16 lg:pb-28 border-b border-white/10"
        >
          {/* Ambient Gold Spotlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 right-1/4 w-[520px] h-[520px] rounded-full bg-[#D4AF37]/10 blur-[130px]"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {/* Left Narrative Column */}
              <div className="lg:col-span-7 space-y-7">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1C1E24] border border-[#D4AF37]/35 text-[#D4AF37] text-xs font-semibold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Premier Nigerian Barbershop • Lekki Phase 1, Lagos</span>
                </div>

                <h1 className="font-display text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-tight leading-[1.06] text-white">
                  Sharp Cuts.{' '}
                  <span className="gold-gradient-text block mt-1">Clean Confidence.</span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-[#A1A1AA] max-w-2xl leading-relaxed font-normal">
                  Welcome to <strong className="text-white font-semibold">Sharp Cuts</strong>—Lagos’s
                  flagship grooming house founded by Nigerian Master Barber{' '}
                  <strong className="text-[#D4AF37] font-semibold">Tunde “Blade” Adeyemi</strong>. We
                  deliver surgical skin fades, 360 wave architecture, freehand Afro sculpting, and hot-towel
                  beard rituals crafted specifically for Black hair textures.
                </p>

                {/* Primary Hero Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => scrollToSection('booking')}
                    className="gold-button-gradient px-7 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 shadow-xl cursor-pointer"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Book an Appointment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('services')}
                    className="px-7 py-4 rounded-xl font-bold text-base border border-[#D4AF37]/45 bg-[#131418]/90 text-[#F5F5F7] hover:border-[#D4AF37] hover:bg-[#1C1E24] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Scissors className="w-4 h-4 text-[#D4AF37]" />
                    <span>View Services</span>
                  </button>
                </div>

                {/* Quick-Book Express Service Pills */}
                <div className="pt-2">
                  <p className="text-xs uppercase tracking-wider text-[#A1A1AA] mb-2.5 font-semibold">
                    Instant Chair Selection — Tap a style to book right away:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Low Fade', 'Skin Fade', 'Haircut + Beard', 'Afro', 'Kids Haircut'].map((cutName) => {
                      const svc = BARBER_SERVICES.find((s) => s.name === cutName);
                      return (
                        <button
                          key={cutName}
                          type="button"
                          onClick={() => handleBookThisHaircut(cutName)}
                          className="text-xs px-3.5 py-2 rounded-lg bg-[#131418] hover:bg-[#D4AF37]/15 border border-white/10 hover:border-[#D4AF37]/50 text-[#F5F5F7] transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <span>{cutName}</span>
                          {svc && (
                            <span className="font-mono-price text-[#D4AF37] font-semibold">
                              {formatNaira(svc.price)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Key Credibility Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                  <div>
                    <p className="font-mono-price text-2xl sm:text-3xl font-bold text-[#D4AF37]">11+ Yrs</p>
                    <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">Master Barber Craft</p>
                  </div>
                  <div>
                    <p className="font-mono-price text-2xl sm:text-3xl font-bold text-white">14,500+</p>
                    <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">Clean Cuts in Lagos</p>
                  </div>
                  <div>
                    <p className="font-mono-price text-2xl sm:text-3xl font-bold text-[#D4AF37]">4.9 ★</p>
                    <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">Client Satisfaction</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Editorial Image of Black Nigerian Male Barber Working */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 shadow-[0_25px_70px_-15px_rgba(212,175,55,0.25)] bg-[#131418] group">
                  <img
                    src="/images/hero-barber.jpg"
                    alt="Master Barber Tunde Adeyemi giving a precision fade haircut to a Nigerian client inside Sharp Cuts barbershop in Lagos"
                    className="w-full h-[460px] sm:h-[540px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/25 to-transparent" />

                  {/* Top-Right Live Hygiene Pill */}
                  <div className="absolute top-4 right-4 bg-[#0A0A0C]/85 backdrop-blur-md border border-[#D4AF37]/40 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-lg">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs font-semibold text-white">Zero-Bump Autoclave Hygiene</span>
                  </div>

                  {/* Bottom Barber Caption Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-[#131418]/95 backdrop-blur-xl border border-white/15 rounded-xl p-4 shadow-2xl">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold">
                          Founder & Head Barber on Duty
                        </p>
                        <p className="text-base font-bold text-white mt-0.5">
                          Tunde “Blade” Adeyemi — Lekki Chair #1
                        </p>
                        <p className="text-xs text-[#A1A1AA] mt-0.5">
                          Specializing in 4C Hair Geometry, Blurry Fades & Razor Line-Ups
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => scrollToSection('booking')}
                        className="shrink-0 px-3.5 py-2 rounded-lg bg-[#D4AF37] text-[#0A0A0C] font-bold text-xs hover:bg-[#E5C158] transition-colors cursor-pointer"
                      >
                        Reserve Chair
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 2: SERVICES (NAIRA ₦ PRICING + "BOOK THIS HAIRCUT")
            ===================================================================== */}
        <section id="services" className="py-20 lg:py-28 bg-[#0A0A0C] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                  <Scissors className="w-4 h-4" />
                  <span>Executive Grooming Menu • Prices in Nigerian Naira (₦)</span>
                </div>
                <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  Signature Cuts & <span className="gold-gradient-text">Grooming Services</span>
                </h2>
                <p className="text-[#A1A1AA] mt-3 max-w-2xl text-base">
                  Every appointment includes a personal cranial consultation, hospital-grade UV-sterilized
                  clippers, organic Nigerian shea & tea-tree scalp finish, and a chilled drink on the house.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Services (8)' },
                  { id: 'fades', label: 'Fades' },
                  { id: 'classic', label: 'Afro & Buzz' },
                  { id: 'beard', label: 'Beard & Combos' },
                  { id: 'kids', label: 'Kids' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setServiceFilter(tab.id as typeof serviceFilter)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      serviceFilter === tab.id
                        ? 'bg-[#D4AF37] text-[#0A0A0C] shadow-lg shadow-[#D4AF37]/20'
                        : 'bg-[#131418] text-[#A1A1AA] hover:text-white border border-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Services Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredServices.map((service) => {
                const isCurrentlySelected =
                  bookingForm.service.toLowerCase() === service.name.toLowerCase();

                return (
                  <div
                    key={service.id}
                    className={`card-luxury rounded-2xl overflow-hidden flex flex-col justify-between ${
                      isCurrentlySelected ? 'ring-2 ring-[#D4AF37] border-[#D4AF37]' : ''
                    }`}
                  >
                    <div>
                      {/* Card Image Header with Price Tag */}
                      <div className="relative h-44 overflow-hidden bg-[#131418]">
                        <img
                          src={service.image}
                          alt={`${service.name} haircut at Sharp Cuts Nigeria`}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#131418] via-transparent to-black/35" />

                        {service.badge && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#0A0A0C]/90 border border-[#D4AF37]/40 text-[#D4AF37] text-[11px] font-bold uppercase tracking-wider">
                            {service.badge}
                          </span>
                        )}

                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#0A0A0C]/85 text-[#F5F5F7] text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#D4AF37]" />
                          {service.duration}
                        </span>

                        {/* Price Badge */}
                        <div className="absolute bottom-3 right-3 bg-[#0A0A0C]/95 border border-[#D4AF37]/50 px-3 py-1 rounded-lg shadow-lg">
                          <span className="font-mono-price text-lg font-extrabold text-[#D4AF37]">
                            {formatNaira(service.price)}
                          </span>
                        </div>
                      </div>

                      {/* Service Details */}
                      <div className="p-5">
                        <div className="flex items-baseline justify-between gap-2 mb-2">
                          <h3 className="font-display text-xl font-bold text-white">{service.name}</h3>
                        </div>

                        <p className="text-sm text-[#A1A1AA] leading-relaxed mb-4">{service.shortDesc}</p>

                        <ul className="space-y-1.5 border-t border-white/10 pt-3.5 mb-5">
                          {service.includes.map((inc, idx) => (
                            <li key={idx} className="text-xs text-[#F5F5F7]/90 flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Required Action Button: "Book This Haircut" */}
                    <div className="p-5 pt-0">
                      <button
                        type="button"
                        onClick={() => handleBookThisHaircut(service.name)}
                        className="w-full py-3 px-4 rounded-xl font-bold text-sm gold-button-gradient flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Scissors className="w-4 h-4" />
                        <span>Book This Haircut</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Grooming Assurance Banner */}
            <div className="mt-12 rounded-2xl bg-[#131418] border border-[#D4AF37]/25 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
                  <Coffee className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">
                    Preparing for a Nigerian Traditional Wedding, Groomsmen Shoot, or Corporate Event?
                  </h4>
                  <p className="text-sm text-[#A1A1AA] mt-0.5">
                    Every haircut at Sharp Cuts comes with complimentary chilled Chapman, Zobo, or Espresso,
                    plus zero-wait priority chair scheduling when booked online.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleBookThisHaircut('Haircut + Beard')}
                className="shrink-0 px-6 py-3.5 rounded-xl bg-[#1C1E24] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0A0A0C] border border-[#D4AF37]/40 font-bold text-sm transition-all cursor-pointer"
              >
                Book The Odogwu Package (₦9,000)
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 3: ABOUT (THE NIGERIAN OWNER & MASTER BARBER)
            ===================================================================== */}
        <section
          id="about"
          className="py-20 lg:py-28 bg-[#131418] adire-bg-pattern border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Portrait of Black Nigerian Owner/Barber */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#D4AF37]/35 shadow-2xl">
                  <img
                    src="/images/founder-portrait.jpg"
                    alt="Tunde 'Blade' Adeyemi — Black Nigerian Owner and Head Master Barber of Sharp Cuts Lagos"
                    className="w-full h-[480px] sm:h-[540px] object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 bg-[#0A0A0C]/90 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display text-lg font-bold text-white">
                          Tunde “Blade” Adeyemi
                        </p>
                        <p className="text-xs text-[#D4AF37] font-semibold">
                          Founder & Master Barber • Born & Trained in Lagos, Nigeria
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono-price text-xs px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                          EST. 2018
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Experience Stat Card */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-[#0A0A0C] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-[#A1A1AA] uppercase tracking-wider">Origin Story</p>
                    <p className="text-sm font-bold text-white mt-1">
                      Surulere Apprentice → Lekki Phase 1 Flagship Owner
                    </p>
                  </div>
                  <div className="bg-[#0A0A0C] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-[#A1A1AA] uppercase tracking-wider">Specialty</p>
                    <p className="text-sm font-bold text-[#D4AF37] mt-1">
                      4C Coils, 360 Waves & Zero-Bump Razor Work
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Authentic Personal Story & Philosophy */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em]">
                  <Award className="w-4 h-4" />
                  <span>Meet the Owner & Master Barber</span>
                </div>

                <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                  “A Nigerian Man’s Haircut Is His Crown Before He Speaks a Word.”
                </h2>

                {/* Interactive Story Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
                  {[
                    { id: 'story', label: "Tunde's Journey & Passion" },
                    { id: 'hygiene', label: 'Zero-Bump Hygiene Standard' },
                    { id: 'lounge', label: 'The Lagos Lounge Culture' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAboutTab(tab.id as typeof aboutTab)}
                      className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        aboutTab === tab.id
                          ? 'bg-[#D4AF37] text-[#0A0A0C]'
                          : 'bg-[#0A0A0C] text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {aboutTab === 'story' && (
                  <div className="space-y-4 text-[#A1A1AA] text-base leading-relaxed">
                    <p>
                      Growing up in <strong className="text-white">Surulere, Lagos</strong>, I spent my
                      Saturday mornings watching how a clean fade could transform a man’s entire posture.
                      After 11 years behind the chair—and cutting for everyone from tech founders in Yaba and
                      bank executives in Victoria Island to grooms preparing for their traditional
                      introductions—I founded <strong className="text-[#D4AF37]">Sharp Cuts</strong> with one
                      non-negotiable mission: elevating Nigerian barbering into a true craft.
                    </p>
                    <p>
                      Too many barbers rush through a haircut, push back your natural hairline to create a
                      fake edge, or use unsterilized blades that leave painful bumps at the back of your neck.
                      At Sharp Cuts, we map your head shape before touching a clipper. We respect your natural
                      front hairline, blend transitions down to the millimeter, and treat your scalp with raw
                      Nigerian shea moisture and cold-pressed oils.
                    </p>
                  </div>
                )}

                {aboutTab === 'hygiene' && (
                  <div className="space-y-4 text-[#A1A1AA] text-base leading-relaxed">
                    <p>
                      In Nigeria’s tropical climate, clipper hygiene is everything. We eliminated shared
                      unsanitized brushes and alcohol-only sprays. Every single blade at Sharp Cuts goes
                      through a <strong className="text-white">3-stage hospital-grade autoclave and UV-C sterilization cycle</strong> between clients.
                    </p>
                    <p>
                      We pair fresh single-use Japanese platinum straight-razor blades with hot eucalyptus
                      steam towels and soothing tea-tree alum blocks—guaranteeing a razor-sharp line-up with
                      zero skin irritation or after-shave bumps.
                    </p>
                  </div>
                )}

                {aboutTab === 'lounge' && (
                  <div className="space-y-4 text-[#A1A1AA] text-base leading-relaxed">
                    <p>
                      Sharp Cuts feels like home the moment you step off Admiralty Way. Whether NEPA takes
                      light or Lagos traffic is heavy outside, our studio runs on{' '}
                      <strong className="text-white">whisper-quiet 24/7 solar and inverter power</strong> with
                      ice-cold air conditioning, Afrobeats & soulful highlife curated at conversation volume,
                      high-speed fiber Wi-Fi, and complimentary chilled Chapman or Zobo.
                    </p>
                  </div>
                )}

                {/* Core Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-[#0A0A0C] border border-white/10 rounded-xl p-4">
                    <ShieldCheck className="w-6 h-6 text-[#D4AF37] mb-2" />
                    <h3 className="text-sm font-bold text-white">Natural Hairline Respect</h3>
                    <p className="text-xs text-[#A1A1AA] mt-1">
                      Crisp geometric edge-ups without ever pushing your natural forehead line back.
                    </p>
                  </div>
                  <div className="bg-[#0A0A0C] border border-white/10 rounded-xl p-4">
                    <Zap className="w-6 h-6 text-[#D4AF37] mb-2" />
                    <h3 className="text-sm font-bold text-white">24/7 Power & AC Comfort</h3>
                    <p className="text-xs text-[#A1A1AA] mt-1">
                      Dedicated hybrid solar-inverter system ensures your cut never pauses mid-fade.
                    </p>
                  </div>
                  <div className="bg-[#0A0A0C] border border-white/10 rounded-xl p-4">
                    <Sparkles className="w-6 h-6 text-[#D4AF37] mb-2" />
                    <h3 className="text-sm font-bold text-white">African Hair Mastery</h3>
                    <p className="text-xs text-[#A1A1AA] mt-1">
                      Tailored guards and combs designed for 4C coils, 360 waves, and thick beards.
                    </p>
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleBookThisHaircut('Haircut + Beard')}
                    className="gold-button-gradient px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book a Session with Tunde</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('gallery')}
                    className="px-5 py-3.5 rounded-xl border border-white/15 hover:border-[#D4AF37] text-sm font-semibold text-white transition-colors cursor-pointer"
                  >
                    Explore Our Cut Lookbook →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 4: GALLERY (NIGERIAN HAIRSTYLES, FADES & LOUNGE)
            ===================================================================== */}
        <section id="gallery" className="py-20 lg:py-28 bg-[#0A0A0C] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                  <Sparkles className="w-4 h-4" />
                  <span>The Sharp Cuts Lookbook • Real Craft, Zero Filters</span>
                </div>
                <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  Nigerian Fades, Waves & <span className="gold-gradient-text">Crown Architecture</span>
                </h2>
                <p className="text-[#A1A1AA] mt-3 max-w-2xl text-base">
                  Inspect the transitions, razor lines, and lounge atmosphere. See a cut that fits your style?
                  Click <strong className="text-white">“Book This Style”</strong> to load it directly into your
                  appointment form.
                </p>
              </div>

              {/* Gallery Category Filter */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Styles (8)' },
                  { id: 'fades', label: 'Skin & Low Fades' },
                  { id: 'afro', label: 'Afro & 4C Coils' },
                  { id: 'executive', label: 'Executive & Beard' },
                  { id: 'kids', label: 'Young Kings' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setGalleryFilter(cat.id as typeof galleryFilter)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      galleryFilter === cat.id
                        ? 'bg-[#D4AF37] text-[#0A0A0C]'
                        : 'bg-[#131418] text-[#A1A1AA] hover:text-white border border-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-2xl overflow-hidden bg-[#131418] border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/20 to-transparent" />

                    {/* Top Style Tag & Lightbox Zoom */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-[#0A0A0C]/85 border border-[#D4AF37]/40 text-[#D4AF37] text-[11px] font-bold">
                        {item.styleTag}
                      </span>
                      <button
                        type="button"
                        aria-label={`Zoom ${item.title}`}
                        onClick={() => setLightboxItem(item)}
                        className="w-8 h-8 rounded-lg bg-[#0A0A0C]/85 text-white hover:text-[#D4AF37] flex items-center justify-center border border-white/15 cursor-pointer"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price Pill */}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[#0A0A0C]/90 border border-[#D4AF37]/40 font-mono-price text-xs font-bold text-[#D4AF37]">
                      {formatNaira(item.price)}
                    </div>
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed">{item.barberNote}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookThisHaircut(item.serviceName)}
                      className="mt-4 w-full py-2.5 px-3 rounded-lg bg-[#1C1E24] hover:bg-[#D4AF37] text-[#F5F5F7] hover:text-[#0A0A0C] border border-white/10 hover:border-[#D4AF37] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Book This Style ({item.serviceName})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Client Testimonials Row */}
            <div className="mt-16 pt-12 border-t border-white/10">
              <h3 className="font-display text-2xl font-bold text-white text-center mb-8">
                What Lagos Gentlemen Say About <span className="text-[#D4AF37]">Sharp Cuts</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TESTIMONIALS.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-[#131418] border border-white/10 rounded-2xl p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-[#D4AF37]">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                          ))}
                        </div>
                        <span className="text-xs font-mono-price text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-md">
                          {rev.service}
                        </span>
                      </div>
                      <p className="text-sm text-[#F5F5F7]/90 italic leading-relaxed">“{rev.comment}”</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">{rev.name}</p>
                        <p className="text-xs text-[#A1A1AA]">
                          {rev.role} • {rev.location}
                        </p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 5: BOOKING (FUNCTIONAL APPOINTMENT FORM & AUTO-SELECTED SERVICE)
            ===================================================================== */}
        <section
          id="booking"
          className="py-20 lg:py-28 bg-[#131418] adire-bg-pattern border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-10">
              <div className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                <Calendar className="w-4 h-4" />
                <span>Instant Chair Reservation • Zero Waiting Line</span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Book Your <span className="gold-gradient-text">Appointment</span>
              </h2>
              <p className="text-[#A1A1AA] mt-3 text-base">
                Select your haircut, preferred date, and time slot below. Clicking{' '}
                <strong className="text-white">“Book This Haircut”</strong> on any service above automatically
                locks that cut into your reservation form.
              </p>
            </div>

            {/* Notification Banner when a haircut was auto-selected from Services/Gallery */}
            {preselectedBanner && (
              <div className="mb-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37] px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0" />
                  <p className="text-sm font-semibold text-white">{preselectedBanner}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreselectedBanner(null)}
                  className="text-xs text-[#D4AF37] hover:underline shrink-0 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left 7 Columns: Functional Appointment Form */}
              <div className="lg:col-span-7 bg-[#0A0A0C] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl">
                {/* Confirmation Banner: Required "Booking confirmed!" */}
                {bookingConfirmed && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mb-8 rounded-2xl bg-emerald-950/70 border-2 border-emerald-400 p-6 shadow-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-display text-2xl font-extrabold text-white">
                            Booking confirmed!
                          </h3>
                          <span className="font-mono-price text-xs font-bold px-3 py-1 rounded-full bg-emerald-400 text-[#0A0A0C]">
                            REF: {bookingConfirmed.referenceId}
                          </span>
                        </div>
                        <p className="text-sm text-emerald-200 mt-1">
                          We’ve reserved Master Chair #1 for{' '}
                          <strong className="text-white">{bookingConfirmed.fullName}</strong>. A confirmation
                          copy has been queued for <strong className="text-white">{bookingConfirmed.email}</strong>{' '}
                          and <strong className="text-white">{bookingConfirmed.phone}</strong>.
                        </p>

                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#0A0A0C]/80 rounded-xl p-4 border border-emerald-500/30 text-xs">
                          <div>
                            <span className="text-[#A1A1AA] block">Selected Haircut</span>
                            <strong className="text-[#D4AF37] text-sm">{bookingConfirmed.service}</strong>
                          </div>
                          <div>
                            <span className="text-[#A1A1AA] block">Amount (Naira)</span>
                            <strong className="font-mono-price text-white text-sm">
                              {formatNaira(bookingConfirmed.price)}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[#A1A1AA] block">Date & Time</span>
                            <strong className="text-white text-sm">
                              {bookingConfirmed.date} @ {bookingConfirmed.time}
                            </strong>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <a
                            href={`https://wa.me/2348094458820?text=${encodeURIComponent(
                              `Hello Sharp Cuts Lagos! My booking is confirmed (${bookingConfirmed.referenceId}).\nName: ${bookingConfirmed.fullName}\nService: ${bookingConfirmed.service} (${formatNaira(
                                bookingConfirmed.price
                              )})\nDate: ${bookingConfirmed.date} at ${bookingConfirmed.time}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-[#25D366] text-[#0A0A0C] font-bold text-xs flex items-center gap-2 hover:brightness-110 transition-all"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Send Pass to WhatsApp</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => setBookingConfirmed(null)}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs cursor-pointer"
                          >
                            Modify or Book Another Cut
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} noValidate className="space-y-5">
                  {/* Field 1: Haircut / Service Selector (Synchronized with "Book This Haircut") */}
                  <div>
                    <label
                      htmlFor="booking-service"
                      className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2"
                    >
                      1. Select Haircut / Grooming Service *
                    </label>
                    <select
                      id="booking-service"
                      ref={serviceSelectRef}
                      name="service"
                      value={bookingForm.service}
                      onChange={(e) => {
                        setBookingForm({ ...bookingForm, service: e.target.value });
                        setBookingErrors({ ...bookingErrors, service: undefined });
                      }}
                      className={`w-full rounded-xl bg-[#131418] border ${
                        bookingErrors.service
                          ? 'border-red-500'
                          : servicePulse
                          ? 'border-[#D4AF37] highlight-pulse'
                          : 'border-white/15 focus:border-[#D4AF37]'
                      } px-4 py-3.5 text-white font-semibold text-sm focus:outline-none transition-all`}
                    >
                      {BARBER_SERVICES.map((svc) => (
                        <option key={svc.id} value={svc.name} className="bg-[#131418] text-white">
                          {svc.name} — {formatNaira(svc.price)} ({svc.duration})
                        </option>
                      ))}
                    </select>
                    {bookingErrors.service && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {bookingErrors.service}
                      </p>
                    )}

                    {/* Quick Service Pill Bar inside Booking Form */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {BARBER_SERVICES.map((svc) => {
                        const active = bookingForm.service === svc.name;
                        return (
                          <button
                            key={svc.id}
                            type="button"
                            onClick={() => {
                              setBookingForm({ ...bookingForm, service: svc.name });
                              setBookingErrors({ ...bookingErrors, service: undefined });
                            }}
                            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                              active
                                ? 'bg-[#D4AF37] text-[#0A0A0C] font-bold'
                                : 'bg-[#131418] text-[#A1A1AA] hover:text-white border border-white/10'
                            }`}
                          >
                            {svc.name} ({formatNaira(svc.price)})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fields 2 & 3: Full Name & Phone Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="booking-fullname"
                        className="block text-xs font-bold uppercase tracking-wider text-[#F5F5F7] mb-2"
                      >
                        2. Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="booking-fullname"
                          name="fullName"
                          type="text"
                          required
                          placeholder="e.g. Chukwudi Okafor"
                          value={bookingForm.fullName}
                          onChange={(e) => {
                            setBookingForm({ ...bookingForm, fullName: e.target.value });
                            if (bookingErrors.fullName) {
                              setBookingErrors({ ...bookingErrors, fullName: undefined });
                            }
                          }}
                          className={`w-full rounded-xl bg-[#131418] border ${
                            bookingErrors.fullName
                              ? 'border-red-500'
                              : 'border-white/15 focus:border-[#D4AF37]'
                          } pl-10 pr-4 py-3 text-sm text-white placeholder-[#71717A] focus:outline-none`}
                        />
                      </div>
                      {bookingErrors.fullName && (
                        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {bookingErrors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="booking-phone"
                        className="block text-xs font-bold uppercase tracking-wider text-[#F5F5F7] mb-2"
                      >
                        3. Phone Number (Nigeria) *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="booking-phone"
                          name="phone"
                          type="tel"
                          required
                          placeholder="e.g. 0803 123 4567"
                          value={bookingForm.phone}
                          onChange={(e) => {
                            setBookingForm({ ...bookingForm, phone: e.target.value });
                            if (bookingErrors.phone) {
                              setBookingErrors({ ...bookingErrors, phone: undefined });
                            }
                          }}
                          className={`w-full rounded-xl bg-[#131418] border ${
                            bookingErrors.phone
                              ? 'border-red-500'
                              : 'border-white/15 focus:border-[#D4AF37]'
                          } pl-10 pr-4 py-3 text-sm text-white placeholder-[#71717A] focus:outline-none`}
                        />
                      </div>
                      {bookingErrors.phone && (
                        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {bookingErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Field 4: Email Address */}
                  <div>
                    <label
                      htmlFor="booking-email"
                      className="block text-xs font-bold uppercase tracking-wider text-[#F5F5F7] mb-2"
                    >
                      4. Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="booking-email"
                        name="email"
                        type="email"
                        required
                        placeholder="e.g. chukwudi@lagosmail.ng"
                        value={bookingForm.email}
                        onChange={(e) => {
                          setBookingForm({ ...bookingForm, email: e.target.value });
                          if (bookingErrors.email) {
                            setBookingErrors({ ...bookingErrors, email: undefined });
                          }
                        }}
                        className={`w-full rounded-xl bg-[#131418] border ${
                          bookingErrors.email ? 'border-red-500' : 'border-white/15 focus:border-[#D4AF37]'
                        } pl-10 pr-4 py-3 text-sm text-white placeholder-[#71717A] focus:outline-none`}
                      />
                    </div>
                    {bookingErrors.email && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {bookingErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Fields 5 & 6: Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label
                          htmlFor="booking-date"
                          className="block text-xs font-bold uppercase tracking-wider text-[#F5F5F7]"
                        >
                          5. Preferred Date *
                        </label>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setQuickDate(0)}
                            className="text-[11px] text-[#D4AF37] hover:underline cursor-pointer"
                          >
                            Today
                          </button>
                          <span className="text-white/20">•</span>
                          <button
                            type="button"
                            onClick={() => setQuickDate(1)}
                            className="text-[11px] text-[#D4AF37] hover:underline cursor-pointer"
                          >
                            Tomorrow
                          </button>
                        </div>
                      </div>
                      <input
                        id="booking-date"
                        name="date"
                        type="date"
                        required
                        min={getTodayStr()}
                        value={bookingForm.date}
                        onChange={(e) => {
                          setBookingForm({ ...bookingForm, date: e.target.value });
                          if (bookingErrors.date) {
                            setBookingErrors({ ...bookingErrors, date: undefined });
                          }
                        }}
                        className={`w-full rounded-xl bg-[#131418] border ${
                          bookingErrors.date ? 'border-red-500' : 'border-white/15 focus:border-[#D4AF37]'
                        } px-4 py-3 text-sm text-white focus:outline-none`}
                      />
                      {bookingErrors.date && (
                        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {bookingErrors.date}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="booking-time"
                        className="block text-xs font-bold uppercase tracking-wider text-[#F5F5F7] mb-2"
                      >
                        6. Preferred Time *
                      </label>
                      <select
                        id="booking-time"
                        name="time"
                        required
                        value={bookingForm.time}
                        onChange={(e) => {
                          setBookingForm({ ...bookingForm, time: e.target.value });
                          if (bookingErrors.time) {
                            setBookingErrors({ ...bookingErrors, time: undefined });
                          }
                        }}
                        className={`w-full rounded-xl bg-[#131418] border ${
                          bookingErrors.time ? 'border-red-500' : 'border-white/15 focus:border-[#D4AF37]'
                        } px-4 py-3 text-sm text-white focus:outline-none`}
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot} className="bg-[#131418]">
                            {slot}
                          </option>
                        ))}
                      </select>
                      {bookingErrors.time && (
                        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {bookingErrors.time}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Complimentary Nigerian Lounge Refreshment */}
                  <div>
                    <label
                      htmlFor="booking-drink"
                      className="block text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-2"
                    >
                      Complimentary Lounge Refreshment (Included Free)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Chilled Chapman', 'Hibiscus Zobo', 'Cold Palm Wine', 'Bottle Water'].map((drink) => (
                        <button
                          key={drink}
                          type="button"
                          onClick={() => setBookingForm({ ...bookingForm, complimentaryDrink: drink })}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            bookingForm.complimentaryDrink === drink
                              ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                              : 'bg-[#131418] border-white/10 text-[#A1A1AA] hover:text-white'
                          }`}
                        >
                          {drink}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full gold-button-gradient py-4 px-6 rounded-xl font-extrabold text-base flex items-center justify-center gap-2.5 shadow-xl cursor-pointer"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>
                        Confirm Appointment • {bookingForm.service} ({formatNaira(currentServiceObj.price)})
                      </span>
                    </button>
                    <p className="text-center text-xs text-[#A1A1AA] mt-2.5">
                      No advance online card charge required • Pay in Naira (POS, Transfer, or Cash) after your
                      cut at our Lekki Phase 1 lounge.
                    </p>
                  </div>
                </form>
              </div>

              {/* Right 5 Columns: Live Naira Summary Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#0A0A0C] border border-[#D4AF37]/40 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="relative h-48">
                    <img
                      src={currentServiceObj.image}
                      alt={currentServiceObj.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/40 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                      <div>
                        <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-bold block">
                          Selected Service Summary
                        </span>
                        <h3 className="font-display text-2xl font-extrabold text-white">
                          {currentServiceObj.name}
                        </h3>
                      </div>
                      <span className="font-mono-price text-2xl font-extrabold text-[#D4AF37]">
                        {formatNaira(currentServiceObj.price)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-sm text-[#A1A1AA]">{currentServiceObj.shortDesc}</p>

                    <div className="space-y-2 border-t border-b border-white/10 py-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#A1A1AA]">Master Barber:</span>
                        <span className="text-white font-semibold">Tunde “Blade” Adeyemi</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A1A1AA]">Estimated Chair Time:</span>
                        <span className="text-white font-semibold">{currentServiceObj.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A1A1AA]">Date & Time Slot:</span>
                        <span className="text-[#D4AF37] font-semibold">
                          {bookingForm.date || 'Select Date'} • {bookingForm.time}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A1A1AA]">Complimentary Hospitality:</span>
                        <span className="text-white font-semibold">{bookingForm.complimentaryDrink}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-bold text-white">Total Due at Studio</span>
                      <span className="font-mono-price text-2xl font-extrabold text-[#D4AF37]">
                        {formatNaira(currentServiceObj.price)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hygiene & Punctuality Guarantee Box */}
                <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0" />
                    <h4 className="text-sm font-bold text-white">The Sharp Cuts Punctuality Promise</h4>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    We respect Lagos time. Your chair is sanitized and waiting 5 minutes before your booked
                    slot. Running late in Third Mainland or Lekki-Epe traffic? Tap the WhatsApp button below
                    and we’ll hold your slot for 20 minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 6: CONTACT (LOCATION, HOURS, WHATSAPP CTA & SIMPLE CONTACT FORM)
            ===================================================================== */}
        <section id="contact" className="py-20 lg:py-28 bg-[#0A0A0C]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left 6 Columns: Nigerian Barbershop Contact Details + WhatsApp Button */}
              <div className="lg:col-span-6 space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>Visit Our Lekki Lounge or Message Us</span>
                  </div>
                  <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                    Get in Touch with <span className="gold-gradient-text">Sharp Cuts</span>
                  </h2>
                  <p className="text-[#A1A1AA] mt-3 text-base">
                    Walk-ins are welcome, and scheduled appointments enjoy immediate zero-wait chair seating.
                    Reach out via WhatsApp, phone call, or our direct concierge message form.
                  </p>
                </div>

                {/* Prominent WhatsApp Button */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-[#25D366]/15 via-[#131418] to-[#131418] border border-[#25D366]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-[#25D366] block">
                      Fastest Response in Lagos (Under 5 Mins)
                    </span>
                    <h3 className="font-display text-lg font-bold text-white mt-0.5">
                      Chat Directly with Tunde’s Desk on WhatsApp
                    </h3>
                    <p className="text-xs text-[#A1A1AA] mt-1">
                      Send a photo of the haircut you want or request home/hotel VIP barber service.
                    </p>
                  </div>
                  <a
                    href="https://wa.me/2348094458820?text=Hello%20Sharp%20Cuts%20Lagos!%20I%20would%20like%20to%20book%20a%20haircut%20or%20make%20an%20inquiry."
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-[#0A0A0C] font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>

                {/* Contact Info Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#131418] border border-white/10 rounded-2xl p-5">
                    <MapPin className="w-5 h-5 text-[#D4AF37] mb-2.5" />
                    <h3 className="text-sm font-bold text-white">Flagship Location</h3>
                    <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
                      Plot 14B Admiralty Way, Lekki Phase 1, Lagos, Nigeria
                      <span className="block text-[#D4AF37] mt-1">
                        (Opposite Zenith Bank • Secure Valet Parking Available)
                      </span>
                    </p>
                  </div>

                  <div className="bg-[#131418] border border-white/10 rounded-2xl p-5">
                    <Clock className="w-5 h-5 text-[#D4AF37] mb-2.5" />
                    <h3 className="text-sm font-bold text-white">Opening Hours</h3>
                    <ul className="text-xs text-[#A1A1AA] mt-1 space-y-1">
                      <li className="flex justify-between">
                        <span>Monday – Friday:</span>
                        <span className="text-white font-semibold">8:30 AM – 9:00 PM</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Saturday (Owambe Early):</span>
                        <span className="text-[#D4AF37] font-semibold">7:30 AM – 9:30 PM</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Sunday:</span>
                        <span className="text-white font-semibold">12:00 PM – 8:00 PM</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-[#131418] border border-white/10 rounded-2xl p-5">
                    <Phone className="w-5 h-5 text-[#D4AF37] mb-2.5" />
                    <h3 className="text-sm font-bold text-white">Phone & Direct Line</h3>
                    <p className="text-xs text-[#A1A1AA] mt-1">Call or SMS our front desk:</p>
                    <a
                      href="tel:+2348094458820"
                      className="font-mono-price text-sm font-bold text-[#D4AF37] hover:underline block mt-1"
                    >
                      +234 809 445 8820
                    </a>
                    <span className="text-xs text-[#A1A1AA]">0809 445 8820 (MTN / Airtel)</span>
                  </div>

                  <div className="bg-[#131418] border border-white/10 rounded-2xl p-5">
                    <Mail className="w-5 h-5 text-[#D4AF37] mb-2.5" />
                    <h3 className="text-sm font-bold text-white">Email & Groomsmen Bookings</h3>
                    <p className="text-xs text-[#A1A1AA] mt-1">For corporate or wedding packages:</p>
                    <a
                      href="mailto:concierge@sharpcuts.ng"
                      className="text-sm font-bold text-[#D4AF37] hover:underline block mt-1"
                    >
                      concierge@sharpcuts.ng
                    </a>
                    <span className="text-xs text-[#A1A1AA]">bookings@sharpcuts.ng</span>
                  </div>
                </div>
              </div>

              {/* Right 6 Columns: Simple Contact Form */}
              <div className="lg:col-span-6">
                <div className="bg-[#131418] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl">
                  <h3 className="font-display text-2xl font-bold text-white mb-2">Send Us a Message</h3>
                  <p className="text-sm text-[#A1A1AA] mb-6">
                    Have a question about a specific hairstyle, home service in Ikoyi/VI/Lekki, or group
                    groomsmen booking? Send a message below.
                  </p>

                  {contactSuccess && (
                    <div className="mb-6 rounded-xl bg-emerald-950/80 border border-emerald-400 p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                          Message sent! Tunde’s concierge desk will reply within 30 minutes.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setContactSuccess(false)}
                        className="text-xs text-emerald-300 underline cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {contactError && (
                    <div className="mb-5 rounded-xl bg-red-950/60 border border-red-500/60 p-3.5 text-xs text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{contactError}</span>
                    </div>
                  )}

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-bold uppercase text-white mb-1.5">
                        Your Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="e.g. Damilola Adewale"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full rounded-xl bg-[#0A0A0C] border border-white/15 focus:border-[#D4AF37] px-4 py-3 text-sm text-white placeholder-[#71717A] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-info"
                        className="block text-xs font-bold uppercase text-white mb-1.5"
                      >
                        Phone Number or Email *
                      </label>
                      <input
                        id="contact-info"
                        type="text"
                        required
                        placeholder="e.g. 0809 445 8820 or dami@email.com"
                        value={contactForm.contactInfo}
                        onChange={(e) => setContactForm({ ...contactForm, contactInfo: e.target.value })}
                        className="w-full rounded-xl bg-[#0A0A0C] border border-white/15 focus:border-[#D4AF37] px-4 py-3 text-sm text-white placeholder-[#71717A] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="block text-xs font-bold uppercase text-white mb-1.5"
                      >
                        Inquiry Topic
                      </label>
                      <select
                        id="contact-subject"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className="w-full rounded-xl bg-[#0A0A0C] border border-white/15 focus:border-[#D4AF37] px-4 py-3 text-sm text-white focus:outline-none"
                      >
                        <option value="General Inquiry / VIP Grooming">General Inquiry / Walk-In Availability</option>
                        <option value="Home / Hotel VIP Service (Lekki / VI / Ikoyi)">
                          Home / Hotel VIP Service (Lekki / VI / Ikoyi)
                        </option>
                        <option value="Groomsmen & Traditional Wedding Package">
                          Groomsmen & Traditional Wedding Package
                        </option>
                        <option value="Kids First Haircut Consultation">Kids Haircut Consultation</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-xs font-bold uppercase text-white mb-1.5"
                      >
                        Your Message *
                      </label>
                      <textarea
                        id="contact-message"
                        rows={4}
                        required
                        placeholder="Tell us how we can help you look your sharpest..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full rounded-xl bg-[#0A0A0C] border border-white/15 focus:border-[#D4AF37] px-4 py-3 text-sm text-white placeholder-[#71717A] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-xl gold-button-gradient font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Send Message to Sharp Cuts</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          FOOTER
          ===================================================================== */}
      <footer className="bg-[#070709] border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center text-[#0A0A0C]">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display text-xl font-extrabold text-white">
                  SHARP <span className="text-[#D4AF37]">CUTS</span>
                </p>
                <p className="text-xs text-[#A1A1AA]">
                  Sharp Cuts. Clean Confidence. • Plot 14B Admiralty Way, Lekki Phase 1, Lagos
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className="text-[#A1A1AA] hover:text-[#D4AF37] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
            <p>© {new Date().getFullYear()} Sharp Cuts Nigeria Ltd. Owned & Operated by Master Barber Tunde Adeyemi.</p>
            <p className="text-[#A1A1AA]">All Prices Listed in Nigerian Naira (₦) • VAT Inclusive</p>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal for Gallery Inspection */}
      {lightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="max-w-2xl w-full bg-[#131418] border border-[#D4AF37]/50 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-96 bg-black">
              <img
                src={lightboxItem.image}
                alt={lightboxItem.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0A0A0C]/90 text-white hover:text-[#D4AF37] flex items-center justify-center border border-white/20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase text-[#D4AF37]">{lightboxItem.styleTag}</span>
                <h3 className="font-display text-xl font-bold text-white mt-0.5">{lightboxItem.title}</h3>
                <p className="text-xs text-[#A1A1AA] mt-1">{lightboxItem.barberNote}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const targetService = lightboxItem.serviceName;
                  setLightboxItem(null);
                  handleBookThisHaircut(targetService);
                }}
                className="shrink-0 gold-button-gradient px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Scissors className="w-4 h-4" />
                <span>
                  Book {lightboxItem.serviceName} ({formatNaira(lightboxItem.price)})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
