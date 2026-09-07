import React from 'react';
import { Quote, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import InstagramIcon from './InstagramIcon';
import momPortrait from '../assets/mom-portfolio-image.jpeg';

const INSTAGRAM_URL = "https://www.instagram.com/rozymehtabofficial?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==";

export default function AboutSection() {
  const coreHighlights = [
    {
      title: '16+ Years of Administrative Leadership',
      description: 'Senior administrative authority at PMN College, Rajpura, guiding thousands of student admissions, records, and degree verifications.'
    },
    {
      title: 'Punjabi University Policy & Regulation Insider',
      description: 'Mastery over Punjabi University, Patiala ordinances, examination by-laws, credit-transfer frameworks, and re-evaluation procedures.'
    },
    {
      title: 'Digital Creator Demystifying Bureaucracy',
      description: 'Creating high-clarity video updates and carousels on Instagram so students never miss critical deadlines or form submissions.'
    },
    {
      title: 'Direct 1-on-1 Career & Academic Roadmaps',
      description: 'Personalized guidance analyzing each student’s background to map out higher education, postgraduate entrances, and internship paths.'
    },
    {
      title: 'Student-First Empathetic Advocacy',
      description: 'Dedicated to resolving unfair administrative hurdles, exam discrepancies, and college-level disputes with institutional know-how.'
    }
  ];

  return (
    <section id="about" className="py-20 bg-[#fdfbf7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header - Centered per feedback */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider mb-3">
            Her Story & Mission
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-serif">
            A Dual Identity: College Administrator & Digital Student Mentor
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Bridging the gap between official administrative boardrooms and the real-world anxieties of modern college students.
          </p>
        </div>

        {/* Stacked Layout: Story & Mission on Top, 5 Pillars Below */}
        <div className="space-y-16">
          
          {/* 1. Her Story & Mission Card (Stacked) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs">
            {/* Story Text */}
            <div className="lg:col-span-7 space-y-4 text-slate-700 leading-relaxed text-base">
              <p className="text-lg font-medium text-slate-900 leading-snug">
                "With over <strong className="text-brand-700 font-semibold">16 years of administrative leadership at PMN College, Rajpura</strong> (affiliated with Punjabi University), I bridge the gap between official academic policies and real-world career trajectories for students."
              </p>
              <p>
                Too often, students lose opportunities, miss scholarship deadlines, or struggle with degree verifications simply because university guidelines are buried in bureaucratic legalese.
              </p>
              <p>
                As a dedicated digital creator on Instagram (<strong className="text-brand-700 font-semibold">@rozymehtabofficial</strong>), I transform complex university notices, admission rules, and academic policies into clear, accessible insights—empowering students across Punjab to move forward with complete confidence.
              </p>
            </div>

            {/* Mission Quote Box with integrated single-line Instagram redirect */}
            <div className="lg:col-span-5">
              <div className="p-7 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 text-white relative shadow-xl overflow-hidden flex flex-col justify-between">
                <Quote className="w-10 h-10 text-rose-400/20 absolute top-3 right-3" />
                
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-rose-300">
                    Her Guiding Principle
                  </span>
                  <blockquote className="mt-2.5 font-serif text-lg sm:text-xl italic leading-snug text-white">
                    "Every student deserves clear, accurate guidance without bureaucratic delays."
                  </blockquote>
                  
                  <div className="mt-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-rose-400 overflow-hidden shrink-0">
                      <img
                        src={momPortrait}
                        alt="Rozy Mehtab"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100">Rozy Mehtab</div>
                      <div className="text-xs text-rose-200">
                        College Administrator & Digital Mentor
                      </div>
                    </div>
                  </div>
                </div>

                {/* Single line Instagram redirect inside the box */}
                <div className="mt-6 pt-4 border-t border-slate-700/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <InstagramIcon className="w-4 h-4 text-rose-400" />
                    <span>Daily alerts on Instagram:</span>
                  </div>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-rose-300 hover:text-white transition-colors group"
                  >
                    <span>@rozymehtabofficial</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 2. The 5 Core Highlights (Stacked Below) */}
          <div>
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Core Foundations
              </span>
              <h3 className="text-2xl font-bold text-slate-900 font-serif mt-1">
                The 5 Pillars of Her Mentorship
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {coreHighlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className={`p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-md transition-all group ${
                    index === 3 || index === 4 ? 'md:col-span-1 lg:col-span-1' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0 mb-3 border border-rose-100 group-hover:bg-brand-700 group-hover:text-white transition-colors">
                    0{index + 1}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors mb-2">
                    {highlight.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {highlight.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
