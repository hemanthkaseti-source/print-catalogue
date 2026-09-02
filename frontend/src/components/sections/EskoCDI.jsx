import { motion } from 'framer-motion';
import { IMG } from '../../lib/content';
import { Reveal, EASE } from '../motion/Reveal';
import { SectionHead } from '../shared/SectionHead';

const StepRepeat = () => (
  <svg viewBox="0 0 320 200" className="w-full" data-testid="esko-step-repeat-diagram">
    {[0, 1, 2, 3].map((c) => [0, 1].map((r) => (
      <motion.rect key={`${c}${r}`} x={16 + c * 74} y={22 + r * 82} width={62} height={68} fill="none" stroke="var(--fg)" strokeWidth="0.8"
        initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 + (c * 2 + r) * 0.08, duration: 0.6, ease: EASE }} style={{ transformOrigin: 'center' }} />
    )))}
    {[0, 1, 2, 3].map((c) => (
      <motion.line key={c} x1={16 + c * 74} y1="8" x2={16 + c * 74} y2="192" stroke="var(--acc)" strokeWidth="0.6" strokeDasharray="3 3"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 + c * 0.1, duration: 0.8 }} />
    ))}
    <text x="16" y="14" fontFamily="JetBrains Mono" fontSize="7" fill="var(--fg-muted)">AUTO STEP & REPEAT · 4×2 · REPEAT 296mm</text>
  </svg>
);

const FEATURES = [
  ['4000 dpi', 'Imaging resolution', 'Fine text, micro-type and smooth vignettes without banding.'],
  ['1:1', 'Repeat accuracy', 'Every reorder is imaged from the same locked file and curve — identical to the last run.'],
  ['Automated', 'Step-and-repeat & job tracking', 'The Esko Automation Engine builds layouts and tracks every job, removing manual steps that introduce error.'],
  ['-30%', 'Turnaround time', 'Fewer manual touches mean plates ship sooner and press schedules hold.'],
];

export const EskoCDI = () => (
  <section className="theme-light" data-testid="esko-section">
    <div className="wrap py-24 md:py-32">
      <SectionHead no="04" label="Esko CDI + Automation Engine" title={['Repeatability,', 'engineered in.']} lede="The Esko CDI images plates with a precision laser, while the Automation Engine handles step-and-repeat, imposition and job tracking. Fewer manual steps means fewer surprises — and less downtime on your press." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-20">
        <Reveal className="lg:col-span-7 relative overflow-hidden aspect-[16/10]">
          <motion.img src={IMG.laserCdi} alt="Esko CDI laser imaging drum" className="absolute inset-0 w-full h-full object-cover" initial={{ scale: 1.15 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: EASE }} />
        </Reveal>
        <Reveal delay={0.15} className="lg:col-span-5 bg-elev hairline border p-6 md:p-8 flex flex-col justify-between">
          <StepRepeat />
          <p className="body mt-6">Layouts are generated from the job ticket, not drawn by hand. Cylinder repeat, bleed and distortion are applied automatically and logged against the job.</p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-16">
        {FEATURES.map(([v, t, d], i) => (
          <Reveal key={t} delay={i * 0.08} className="hairline-t pt-6 pb-8 lg:pr-8 lg:[&:not(:first-child)]:pl-8 lg:[&:not(:first-child)]:border-l" data-testid={`esko-feature-${i + 1}`}>
            <div className="font-display font-semibold tracking-[-0.03em] text-3xl md:text-4xl">{v}</div>
            <div className="font-display font-medium tracking-tight mt-3">{t}</div>
            <p className="body mt-2 text-sm">{d}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
