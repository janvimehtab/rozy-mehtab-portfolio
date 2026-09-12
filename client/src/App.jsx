import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MetricsStrip from './components/MetricsStrip';
import AboutSection from './components/AboutSection';
import AreasOfGuidance from './components/AreasOfGuidance';
import ResourceHub from './components/ResourceHub';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal/BookingModal';
import FloatingPromoToast from './components/FloatingPromoToast';

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingPurpose, setBookingPurpose] = useState('Career Advice');

  const handleOpenBooking = (purpose = 'Career Advice') => {
    setBookingPurpose(purpose);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Navigation Bar sits cleanly at the top of the viewport */}
      <Navbar
        onOpenBooking={() => handleOpenBooking('Career Advice')}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* 3. Hero Section (Madison Reference Style: Circular Photo + Cursive Script + Smooth Animations) */}
        <HeroSection onOpenBooking={() => handleOpenBooking('Career Advice')} />

        {/* 4. Proof Strip / Impact Metrics */}
        <MetricsStrip />

        {/* 5. Her Story & Dual Identity (Admin + Creator) */}
        <AboutSection onOpenBooking={() => handleOpenBooking('Career Advice')} />

        {/* 6. Areas of Guidance (Clear Boundaries) */}
        <AreasOfGuidance onSelectPurposeAndOpen={handleOpenBooking} />

        {/* 7. Curated Academic Resources & Official Notices */}
        <ResourceHub />
      </main>

      {/* 8. Footer */}
      <Footer
        onOpenBooking={() => handleOpenBooking('Career Advice')}
      />

      {/* 9. Floating Promo Toast (Dismissible, White bg, lower-right) */}
      <FloatingPromoToast onOpenBooking={() => handleOpenBooking('Career Advice')} />

      {/* 10. Interactive Typeform-Style Multi-Step Booking Engine Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialPurpose={bookingPurpose}
      />

    </div>
  );
}
