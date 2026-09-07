import React from 'react';
import { Award, MessageSquare, Gift, School, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MetricsStrip() {
  const metrics = [
    {
      value: '16+ Years',
      label: 'College Administration',
      subtext: 'PMN College, Rajpura (Affiliated with Punjabi Univ.)',
      icon: Award,
      color: 'from-rose-500 to-brand-700',
      bgLight: 'bg-rose-50',
      borderLight: 'border-rose-200'
    },
    {
      value: '100+',
      label: 'Student Queries Resolved',
      subtext: 'Direct guidance on Instagram & campus queries',
      icon: MessageSquare,
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      borderLight: 'border-amber-200'
    },
    {
      value: '100%',
      label: 'Free for Students',
      subtext: 'Valid through October 2026 for all college students',
      icon: Gift,
      color: 'from-emerald-500 to-teal-700',
      bgLight: 'bg-emerald-50',
      borderLight: 'border-emerald-200'
    },
    {
      value: 'Official',
      label: 'University Expertise',
      subtext: 'Punjabi University rules, cut-offs & dispute resolution',
      icon: School,
      color: 'from-indigo-500 to-purple-700',
      bgLight: 'bg-indigo-50',
      borderLight: 'border-indigo-200'
    },
  ];

  return (
    <section className="py-12 bg-white border-y border-editorial-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-widest text-brand-700 font-bold">
            Proven Track Record & Credibility
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Empowering Punjab's College Students With Truth & Direction
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`p-6 rounded-2xl bg-white border ${item.borderLight} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`w-12 h-12 rounded-xl ${item.bgLight} flex items-center justify-center text-slate-800 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-slate-800" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono">
                    Verified
                  </span>
                </div>

                <div className="text-3xl font-extrabold text-slate-900 font-serif tracking-tight">
                  {item.value}
                </div>
                <div className="text-sm font-bold text-slate-800 mt-1">
                  {item.label}
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.subtext}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
