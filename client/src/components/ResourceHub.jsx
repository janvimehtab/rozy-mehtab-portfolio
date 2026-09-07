import React from 'react';
import { Download, ExternalLink, FileText, BellRing, Award, School } from 'lucide-react';

export default function ResourceHub() {
  const resources = [
    {
      title: 'Punjabi University Patiala Official Portal',
      category: 'University Portal',
      description: 'Direct access to examination forms, date-sheets, syllabus pdfs, and results portal.',
      link: 'http://punjabiuniversity.ac.in/',
      badge: 'Official',
      icon: School
    },
    {
      title: 'PMN College, Rajpura Official Website',
      category: 'College Information',
      description: 'College prospectus, course offerings, administrative notices, and department faculties.',
      link: 'https://pmncollege.edu.in/',
      badge: 'Campus',
      icon: FileText
    },
    {
      title: 'Post-Matric Scholarship (PMS) Punjab Portal',
      category: 'Financial Aid',
      description: 'Guidelines, eligible categories, and documents required for state scholarship fee waivers.',
      link: 'https://scholarships.punjab.gov.in/',
      badge: 'Scholarship',
      icon: Award
    },
    {
      title: 'Punjabi University Re-evaluation & Dispute Guidelines',
      category: 'Student Rights',
      description: 'Official ordinances governing rechecking windows, fee structures, and marksheet amendments.',
      link: 'http://punjabiuniversity.ac.in/syllabi',
      badge: 'Guidelines',
      icon: BellRing
    }
  ];

  return (
    <section id="resources" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute -top-24 right-10 w-80 h-80 bg-brand-800/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400 bg-rose-950/80 px-3 py-1 rounded-md border border-rose-800">
              Verified Links
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-serif">
              Curated Academic Resources
            </h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-xl">
              Authentic links to university portals, verified scholarship portals, and PMN College administrative circulars.
            </p>
          </div>
          <div>
            <a
              href="https://www.instagram.com/rozymehtabofficial?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>Regular updates on Instagram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-brand-500 hover:bg-slate-800 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center text-rose-300 group-hover:bg-brand-700 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 flex items-center gap-1.5 text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition-transform">
                  <span>Visit Resource</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
