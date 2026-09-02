import { motion } from 'framer-motion';
import { IMG } from '../../lib/content';
import { Reveal, EASE } from '../motion/Reveal';
import { SectionHead } from '../shared/SectionHead';

const SWATCHES = [
  { name: 'Brand Red', hex: '#C8102E', de: 0.8 },
  { name: 'Deep Teal', hex: '#0B4F5C', de: 1.1 },
  { name: 'Warm Orange', hex: '#E3752B', de: 0.6 },
  { name: 'Process Cyan', hex: '#00A3E0', de: 0.9 },
  { name: 'Charcoal', hex: '#2B2B2E', de: 0.4 },
  { name: 'Kraft', hex: '#B08D57', de: 1.3 },
];

const PILLARS = [
  ['Fingerprinting', 'We characterise each press–anilox–substrate combination so plate curves reflect how your press really prints.'],
  ['ICC / G7-style control', 'Grey balance and tonal targets are managed to industry methodology, so proofs and presses agree.'],
  ['Digital proofing', 'Colour-managed contract proofs that can be signed off remotely, from any market.'],
  ['Brand colour across geographies', 'A converter in Kampala and one in Colombo receive plates built to the same colour targets.'],
];

export const ColorMgmt = () => (
  <section className="theme-light" data-testid="color-section">
    <div className="wrap py-24 md:py-32">
      <SectionHead no="06" label="Advanced prepress & colour" title={['Sign off once.', 'Print it everywhere.']} lede="Colour drift is the hidden cost of packaging. Our prepress is built so the colour you approve is the colour that ships — pack after pack, plant after plant." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-20">
        <div className="lg:col-span-5 grid grid-cols-1">
          {PILLARS.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.08} className="hairline-t py-6" data-testid={`color-pillar-${i + 1}`}>
              <div className="flex items-center gap-3 mb-2"><span className="chapter-no">0{i + 1}</span><span className="font-display font-medium tracking-tight">{t}</span></div>
              <p className="body">{d}</p>
            </Reveal>
          ))}
        </div>
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Reveal className="relative overflow-hidden aspect-[16/10]">
            <motion.img src={IMG.colorSwatches} alt="Colour management workstation with spectrophotometer" className="absolute inset-0 w-full h-full object-cover" initial={{ scale: 1.15 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: EASE }} />
          </Reveal>
          <Reveal delay={0.15} className="grid grid-cols-3 sm:grid-cols-6 hairline border" data-testid="color-swatch-strip">
            {SWATCHES.map((s, i) => (
              <div key={s.name} className="group p-3 [&:not(:last-child)]:border-r hairline">
                <motion.div className="aspect-square" style={{ background: s.hex }} initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.7, ease: EASE }} />
                <div className="mt-3 font-mono text-[10px] uppercase tracking-wider">{s.name}</div>
                <div className="font-mono text-[10px] text-acc">ΔE {s.de.toFixed(1)}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);
