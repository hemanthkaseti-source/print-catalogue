import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APPLICATIONS } from '../../lib/content';
import { Reveal, EASE } from '../motion/Reveal';
import { SectionHead } from '../shared/SectionHead';

export const Applications = () => {
  const [active, setActive] = useState(0);
  const app = APPLICATIONS[active];

  return (
    <section id="applications" className="theme-light" data-testid="applications-section">
      <div className="wrap py-24 md:py-32">
        <SectionHead no="08" label="Applications" title={['Whatever you print,', 'we plate for it.']} />

        <Reveal className="mt-16 flex flex-wrap gap-x-8 gap-y-3 hairline-b pb-4 no-print">
          {APPLICATIONS.map((a, i) => (
            <button key={a.id} onClick={() => setActive(i)} className={`relative font-mono text-[11px] uppercase tracking-[0.2em] py-2 transition-colors duration-300 ${active === i ? 'text-ink' : 'text-muted hover:text-ink'}`} data-testid={`application-tab-${a.id}`} aria-selected={active === i}>
              {a.label}
              {active === i && <motion.span layoutId="app-underline" className="absolute -bottom-4 left-0 right-0 h-px bg-ink" />}
            </button>
          ))}
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12 no-print">
          <div className="lg:col-span-7 relative overflow-hidden aspect-[4/3] lg:aspect-[16/10] bg-white">
            <AnimatePresence mode="wait">
              <motion.img key={app.id} src={app.img} alt={app.title} className="absolute inset-0 w-full h-full object-cover" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: EASE }} data-testid="application-image" />
            </AnimatePresence>
          </div>
          <div className="lg:col-span-5 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div key={app.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: EASE }}>
                <div className="chapter-no mb-4">0{active + 1} / 06</div>
                <h3 className="h2 !text-3xl md:!text-4xl" data-testid="application-title">{app.title}</h3>
                <p className="lede mt-6">{app.text}</p>
              </motion.div>
            </AnimatePresence>
            <ul className="grid grid-cols-3 mt-10 hairline-t">
              {app.specs.map((s) => <li key={s} className="pt-4 pr-4 font-mono text-[11px] uppercase tracking-wider text-muted">{s}</li>)}
            </ul>
          </div>
        </div>

        <div className="print-only mt-10 grid grid-cols-3 gap-6">
          {APPLICATIONS.map((a) => (
            <div key={a.id}><img src={a.img} alt={a.title} className="w-full aspect-square object-cover" /><div className="font-display font-medium mt-2">{a.label}</div><p className="text-xs body">{a.text}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
};
