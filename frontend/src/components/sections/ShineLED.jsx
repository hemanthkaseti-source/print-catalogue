import { motion } from 'framer-motion';
import { IMG } from '../../lib/content';
import { Reveal, EASE } from '../motion/Reveal';
import { SectionHead } from '../shared/SectionHead';

const Uniformity = () => {
  const lamp = 'M0,62 C30,40 60,70 90,48 C120,30 150,66 180,44 C210,34 240,70 270,50 C300,36 320,60 340,52';
  const led = 'M0,40 L340,40';
  return (
    <svg viewBox="0 0 340 120" className="w-full" data-testid="led-uniformity-diagram">
      {[20, 40, 60, 80, 100].map((y) => <line key={y} x1="0" y1={y} x2="340" y2={y} stroke="var(--line)" strokeWidth="0.5" />)}
      <motion.path d={lamp} fill="none" stroke="#9A9A9E" strokeWidth="1.2" strokeDasharray="4 3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: 'easeOut' }} />
      <motion.path d={led} fill="none" stroke="var(--acc)" strokeWidth="1.8" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, delay: 0.4, ease: 'easeOut' }} />
      <text x="0" y="114" fontFamily="JetBrains Mono" fontSize="7" fill="var(--fg-muted)">PLATE LEFT EDGE</text>
      <text x="340" y="114" textAnchor="end" fontFamily="JetBrains Mono" fontSize="7" fill="var(--fg-muted)">RIGHT EDGE</text>
      <text x="0" y="10" fontFamily="JetBrains Mono" fontSize="7" fill="var(--fg-muted)">UV ENERGY ACROSS PLATE WIDTH</text>
      <text x="300" y="34" fontFamily="JetBrains Mono" fontSize="7" fill="var(--acc)">SHINE LED</text>
      <text x="270" y="76" fontFamily="JetBrains Mono" fontSize="7" fill="#9A9A9E">TUBE LAMPS</text>
    </svg>
  );
};

const POINTS = [
  ['Uniform exposure', 'Consistent energy across the full plate width — no edge fall-off, no hot centre.'],
  ['Plate durability', 'Harder, fully cured relief lasts longer on press and resists solvent swell.'],
  ['Reduced process variation', 'LEDs don\'t age like tubes. Day-one and day-500 plates receive the same dose.'],
  ['Energy efficiency', 'Instant on/off with no warm-up — lower power draw and no ozone.'],
];

export const ShineLED = () => (
  <section className="theme-dark" data-testid="shine-section">
    <div className="wrap py-24 md:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7">
          <SectionHead no="05" label="Shine LED exposure" title={['Every plate gets', 'the same light.']} lede="Exposure decides relief depth, shoulder angle and dot hardness. Shine UV-LED exposure removes the variable that traditional lamp banks introduce — so the plate you receive in month twelve prints like the one in month one." />
        </div>
        <Reveal delay={0.2} className="lg:col-span-5 bg-elev hairline border p-6 md:p-8">
          <Uniformity />
        </Reveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-20">
        <Reveal className="lg:col-span-7 relative overflow-hidden aspect-[16/9] spotlight">
          <motion.img src={IMG.ledGlow} alt="Shine UV-LED exposure frame with plate under even violet light" className="absolute inset-0 w-full h-full object-cover" initial={{ scale: 1.15 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: EASE }} />
        </Reveal>
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
          {POINTS.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.08} className="hairline-t py-6 pr-6" data-testid={`led-point-${i + 1}`}>
              <div className="flex items-center gap-3 mb-2"><span className="chapter-no">0{i + 1}</span><span className="font-display font-medium tracking-tight">{t}</span></div>
              <p className="body">{d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);
