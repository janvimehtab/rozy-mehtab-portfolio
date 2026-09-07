import React, { useState, useEffect } from 'react';
import { Calendar, Menu, X } from 'lucide-react';
import InstagramIcon from './InstagramIcon';

const INSTAGRAM_URL = "https://www.instagram.com/rozymehtabofficial?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==";

export default function Navbar({ onOpenBooking }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-editorial-border py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Left: Brand Name */}
          <div className="flex items-center">
            <a href="#" className="flex items-center group">
              <span className="font-serif italic text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors">
                Rozy.
              </span>
            </a>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a
              href="#about"
              className="hover:text-slate-900 transition-colors uppercase tracking-wider text-xs font-semibold"
            >
              About
            </a>
            <a
              href="#guidance"
              className="hover:text-slate-900 transition-colors uppercase tracking-wider text-xs font-semibold"
            >
              Areas of Guidance
            </a>
            <a
              href="#resources"
              className="hover:text-slate-900 transition-colors uppercase tracking-wider text-xs font-semibold"
            >
              Student Resources
            </a>
          </nav>

          {/* Right: High-Contrast Pill CTA Button ("Contact") & Instagram */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenBooking}
              className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Contact</span>
            </button>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white hover:bg-rose-50 text-slate-700 hover:text-brand-600 flex items-center justify-center transition-all border border-slate-200/80 shadow-xs"
              title="Follow Rozy Mehtab on Instagram"
              aria-label="Instagram Profile"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center"
              title="Instagram"
            >
              <InstagramIcon className="w-4 h-4 text-white" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden pt-4 pb-3 border-t border-slate-200 mt-3 space-y-2">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-brand-600"
            >
              About
            </a>
            <a
              href="#guidance"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-brand-600"
            >
              Areas of Guidance
            </a>
            <a
              href="#resources"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-brand-600"
            >
              Student Resources
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full text-left py-2 text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Book Session (₹0 Free)</span>
            </button>
            <div className="pt-3 flex justify-between items-center border-t border-slate-100">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-600 flex items-center gap-1.5 font-medium"
              >
                <InstagramIcon className="w-4 h-4 text-brand-600" /> Follow on Instagram
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
