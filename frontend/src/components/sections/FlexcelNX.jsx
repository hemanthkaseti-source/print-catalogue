import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { IMG } from '../../lib/content';
import { Reveal, EASE } from '../motion/Reveal';
import { SectionHead } from '../shared/SectionHead';
import { DotComparison } from '../diagrams/DotComparison';

const OUTCOMES = [
  ['Solid ink density', 'Flat-top dots lay a uniform ink film — denser solids with less ink.'],
  ['Highlight & shadow detail', 'Stable 0.4% minimum dots keep vignettes open and shadows from plugging.'],
  ['Dot stability on press', 'Dots hold their size through impression changes and long runs.'],
  ['Print contrast', 'Wider tonal range between highlight and solid gives punchier, more photographic packs.'],
];

export const FlexcelNX = () => (
  <section id="technology" className="theme-dark relative overflow-hidden" data-testid="flexcel-section">
    <div className="wrap py-24 md:py-32">
      <SectionHead no="03" label="Kodak Flexcel NX" title={['The flat-top dot', 'that changed flexo.']} lede="Kodak Flexcel NX writes the image at 1:1 onto a thermal imaging layer, then laminates it to the plate. The result is a true flat-top dot — the reason NX plates print more like gravure than conventional flexo." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-20 items-start">
        <div className="lg:col-span-5 flex flex-col gap-10">
          <Reveal className="relative overflow-hidden aspect-[4/3] print:aspect-[16/7] spotlight">
            <motion.img src={IMG.plateCylinder} alt="Kodak Flexcel NX photopolymer plate with relief image" className="w-full h-full object-cover" initial={{ scale: 1.15 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: EASE }} />
            <div className="absolute top-4 left-4 eyebrow !text-bone/80 bg-ink/50 backdrop-blur px-3 py-1.5">Flexcel NX photopolymer plate</div>
          </Reveal>
          <ul className="flex flex-col">
            {OUTCOMES.map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.08} as="li" className="hairline-t py-5 grid grid-cols-[24px_1fr] gap-4" data-testid={`nx-outcome-${i + 1}`}>
                <Check size={16} className="text-acc mt-1" />
                <div>
                  <div className="font-display font-medium tracking-tight">{t}</div>
                  <p className="body mt-1">{d}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal delay={0.15} className="lg:col-span-7">
          <div className="eyebrow mb-4">Interactive · Conventional vs Flexcel NX under impression</div>
          <DotComparison />
          <p className="body mt-5 text-xs max-w-xl no-print">Diagram is illustrative. Drag the slider to see how each dot type responds to increasing impression on press.</p>
        </Reveal>
      </div>
    </div>
  </section>
);
