import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROCESS } from '../../lib/content';
import { Reveal, EASE } from '../motion/Reveal';
import { SectionHead } from '../shared/SectionHead';

const StepGlyph = ({ i }) => {
  const glyphs = [
    <><rect x="20" y="20" width="80" height="80" fill="none" stroke="var(--fg)" strokeWidth="1" /><path d="M20,44 H100 M44,20 V100" stroke="var(--acc)" strokeWidth="1" /></>,
    <><rect x="24" y="24" width="72" height="72" fill="none" stroke="var(--fg)" strokeWidth="1" /><rect x="32" y="32" width="56" height="56" fill="none" stroke="var(--acc)" strokeWidth="1" strokeDasharray="3 3" /></>,
    <><rect x="20" y="30" width="80" height="60" fill="none" stroke="var(--fg)" strokeWidth="1" />{[0, 1, 2, 3].map((k) => <rect key={k} x={26 + k * 18} y="36" width="12" height="48" fill="var(--acc)" opacity={0.25 + k * 0.2} />)}</>,
    <>{[...Array(16)].map((_, k) => <rect key={k} x={24 + (k % 4) * 20} y={24 + Math.floor(k / 4) * 20} width="12" height="12" fill="var(--acc)" opacity={0.9} />)}</>,
    <><circle cx="60" cy="60" r="36" fill="none" stroke="var(--fg)" strokeWidth="1" /><line x1="60" y1="16" x2="60" y2="60" stroke="var(--acc)" strokeWidth="1.5" /><circle cx="60" cy="60" r="3" fill="var(--acc)" /></>,
    <><rect x="20" y="70" width="80" height="14" fill="none" stroke="var(--fg)" strokeWidth="1" />{[0, 1, 2, 3, 4, 5, 6].map((k) => <line key={k} x1={26 + k * 12} y1="30" x2={26 + k * 12} y2="66" stroke="var(--acc)" strokeWidth="1" />)}</>,
    <><path d="M20,50 C40,30 60,70 80,50 S100,30 100,50" fill="none" stroke="var(--acc)" strokeWidth="1.2" /><path d="M20,70 C40,50 60,90 80,70 S100,50 100,70" fill="none" stroke="var(--fg)" strokeWidth="1" opacity="0.6" /></>,
    <><rect x="24" y="24" width="72" height="72" fill="none" stroke="var(--fg)" strokeWidth="1" /><path d="M40,60 L54,74 L82,44" fill="none" stroke="var(--acc)" strokeWidth="2" /></>,
    <><rect x="20" y="40" width="80" height="44" fill="none" stroke="var(--fg)" strokeWidth="1" /><path d="M20,52 H100" stroke="var(--acc)" strokeWidth="1" /><path d="M60,52 V84" stroke="var(--acc)" strokeWidth="1" strokeDasharray="3 3" /></>,
  ];
  return <svg viewBox="0 0 120 120" className="w-28 h-28 md:w-40 md:h-40">{glyphs[i]}</svg>;
};

export const ProcessFlow = () => {
  const [active, setActive] = useState(0);
  const step = PROCESS[active];

  return (
    <section id="process" className="theme-dark" data-testid="process-section">
      <div className="wrap py-24 md:py-32">
        <SectionHead no="07" label="Process flow" title={['Nine steps.', 'One measured result.']} lede="From the moment artwork lands to the moment plates leave for the airport, every step is defined, measured and logged. Select a step to see what happens — and why it matters on your press." />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-20">
          <Reveal className="lg:col-span-5">
            <ol className="flex flex-col">
              {PROCESS.map((p, i) => (
                <li key={p.no}>
                  <button
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    className={`w-full text-left hairline-t py-4 grid grid-cols-[48px_1fr_24px] items-center gap-4 transition-colors duration-300 ${active === i ? 'text-bone' : 'text-muted hover:text-bone'}`}
                    data-testid={`process-step-${i + 1}`}
                    aria-current={active === i}
                  >
                    <span className={`font-mono text-xs ${active === i ? 'text-acc' : ''}`}>{p.no}</span>
                    <span className="font-display font-medium tracking-tight text-base md:text-lg">{p.title}</span>
                    <motion.span className="h-1.5 w-1.5 rounded-full bg-acc" animate={{ scale: active === i ? 1 : 0 }} />
                  </button>
                </li>
              ))}
            </ol>
            <div className="hairline-t mt-0 pt-4 relative h-1">
              <motion.div className="absolute left-0 top-0 h-px bg-acc" animate={{ width: `${((active + 1) / PROCESS.length) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} />
            </div>
          </Reveal>

          <Reveal delay={0.15} className="lg:col-span-7 bg-elev hairline border p-8 md:p-12 min-h-[420px] flex flex-col" data-testid="process-detail-panel">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5, ease: EASE }} className="flex flex-col md:flex-row gap-10 h-full">
                <div className="shrink-0"><StepGlyph i={active} /></div>
                <div className="flex flex-col gap-6 flex-1">
                  <div className="flex items-center gap-4 eyebrow"><span className="text-acc">Step {step.no} / 09</span></div>
                  <h3 className="h2 !text-3xl md:!text-4xl" data-testid="process-detail-title">{step.title}</h3>
                  <p className="lede">{step.body}</p>
                  <div className="mt-auto hairline-t pt-6">
                    <div className="eyebrow mb-2">Why it matters on your press</div>
                    <p className="quote text-xl md:text-2xl">{step.why}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </Reveal>
        </div>

        <div className="print-only mt-10">
          {PROCESS.map((p) => (
            <div key={p.no} className="hairline-t py-3 grid grid-cols-[40px_180px_1fr] gap-4 text-sm"><span className="font-mono">{p.no}</span><strong>{p.title}</strong><span>{p.body}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
};
