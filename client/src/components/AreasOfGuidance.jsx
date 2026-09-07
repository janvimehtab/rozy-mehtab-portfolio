import React from 'react';
import { BookOpen, Briefcase, Compass, FileWarning, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AreasOfGuidance({ onSelectPurposeAndOpen }) {
  const areas = [
    {
      id: 'Career Advice',
      title: 'Career Path Planning & Higher Education',
      tagline: 'Undergrad to Postgrad Transitions',
      icon: Compass,
      description: 'Strategic roadmaps for graduation students evaluating MBA, MCA, M.Sc, civil services, or immediate campus corporate employment.',
      points: [
        'Course selection aligned with industry trends',
        'Postgraduate entrance exam timelines',
        'Bridging non-technical degrees to tech/business roles'
      ],
      color: 'border-rose-200 hover:border-brand-500 bg-rose-50/30'
    },
    {
      id: 'Internship Guidance',
      title: 'Internship Opportunities & Applications',
      tagline: 'Resume Review & Industry Positioning',
      icon: Briefcase,
      description: 'How to land recognized internships during semester breaks, structure project portfolios, and prepare for interviews.',
      points: [
        'Resume formatting for ATS screening',
        'Finding legitimate accredited internships',
        'Converting internships into Pre-Placement Offers (PPOs)'
      ],
      color: 'border-amber-200 hover:border-amber-500 bg-amber-50/30'
    },
    {
      id: 'General Academic Query',
      title: 'Admission & Eligibility Regulations',
      tagline: 'Punjabi University Patiala Guidelines',
      icon: BookOpen,
      description: 'Clear, authoritative guidance on admission criteria, cut-offs, migration certificates, and subject combination rules.',
      points: [
        'PMN College & Punjabi University eligibility checks',
        'Late admission condonation procedures',
        'Subject change & semester credit transfers'
      ],
      color: 'border-blue-200 hover:border-blue-500 bg-blue-50/30'
    },
    {
      id: 'General Academic Query',
      title: 'Exam & Administrative Dispute Resolution',
      tagline: 'Resolving Bureaucratic Bottlenecks',
      icon: FileWarning,
      description: 'Direct institutional troubleshooting for withheld results, re-evaluation delays, attendance shortfalls, or admit card discrepancies.',
      points: [
        'Punjabi University re-evaluation protocols',
        'Correcting names/roll numbers on official marksheets',
        'Navigating grievance redressal mechanisms'
      ],
      color: 'border-purple-200 hover:border-purple-500 bg-purple-50/30'
    }
  ];

  return (
    <section id="guidance" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-100 text-brand-800 text-xs font-bold uppercase tracking-wider mb-3">
            Scope of Mentorship
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
            Areas of Guidance & Clear Boundaries
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Sessions are tailored, 20-minute focused video consultations designed to resolve specific academic questions. Choose an area below to book.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {areas.map((area, index) => {
            const Icon = area.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`p-8 rounded-3xl border-2 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between ${area.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-brand-700">
                      <Icon className="w-6 h-6 text-brand-700" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                      {area.tagline}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {area.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    {area.description}
                  </p>

                  <div className="space-y-2 mb-8">
                    {area.points.map((point, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectPurposeAndOpen(area.id)}
                  className="w-full py-3 bg-white hover:bg-brand-700 text-slate-800 hover:text-white border border-slate-300 hover:border-transparent rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs group cursor-pointer"
                >
                  <span>Book for this topic</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
