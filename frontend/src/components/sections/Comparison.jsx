import { useState } from 'react';
import { motion } from 'framer-motion';
import { IMG } from '../../lib/content';
import { Reveal } from '../motion/Reveal';
import { SectionHead } from '../shared/SectionHead';

const DotGainChart = () => {
  const pts = (fn) => Array.from({ length: 21 }, (_, i) => { const x = i * 5; return `${20 + x * 3},${180 - fn(x) * 1.6}`; }).join(' ');
  const conv = (x) => Math.min(100, x + 22 * Math.sin((x / 100) * Math.PI));
  const nx = (x) => Math.min(100, x + 7 * Math.sin((x / 100) * Math.PI));
  return (
    <svg viewBox="0 0 340 200" className="w-full" data-testid="dot-gain-chart">
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1="20" y1={180 - v * 1.6} x2="320" y2={180 - v * 1.6} stroke="var(--line)" strokeWidth="0.5" />
          <text x="0" y={183 - v * 1.6} fontFamily="JetBrains Mono" fontSize="7" fill="var(--fg-muted)">{v}</text>
          <text x={18 + v * 3} y="194" fontFamily="JetBrains Mono" fontSize="7" fill="var(--fg-muted)">{v}</text>
        </g>
      ))}
      <line x1="20" y1="180" x2="320" y2="20" stroke="var(--fg)" strokeWidth="0.6" strokeDasharray="3 3" />
      <motion.polyline points={pts(conv)} fill="none" stroke="#9A9A9E" strokeWidth="1.4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6 }} />
      <motion.polyline points={pts(nx)} fill="none" stroke="var(--acc)" strokeWidth="1.8" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, delay: 0.3 }} />
      <text x="120" y="60" fontFamily="JetBrains Mono" fontSize="7" fill="#9A9A9E">CONVENTIONAL</text>
      <text x="200" y="110" fontFamily="JetBrains Mono" fontSize="7" fill="var(--acc)">FLEXCEL NX</text>
      <text x="24" y="14" fontFamily="JetBrains Mono" fontSize="7" fill="var(--fg-muted)">PRINTED TONE % vs FILE TONE %</text>
    </svg>
  );
};

const InkSavings = () => {
  const [spend, setSpend] = useState(120000);
  const rate = 0.17;
  const saving = Math.round(spend * rate);
  return (
    <div className="flex flex-col gap-6" data-testid="ink-savings-calculator">
      <div className="flex items-center justify-between eyebrow"><span>Annual ink spend (USD)</span><span className="text-acc">${spend.toLocaleString()}</span></div>
      <input type="range" min="20000" max="1000000" step="5000" value={spend} onChange={(e) => setSpend(+e.target.value)} className="range" aria-label="Annual ink spend" data-testid="ink-savings-slider" />
      <div className="grid grid-cols-2 gap-6 hairline-t pt-6">
        <div>
          <div className="eyebrow mb-2">Estimated saving / yr</div>
          <div className="font-display font-semibold tracking-[-0.03em] text-3xl md:text-4xl text-acc" data-testid="ink-savings-value">${saving.toLocaleString()}</div>
        </div>
        <div>
          <div className="eyebrow mb-2">At assumed reduction</div>
          <div className="font-display font-semibold tracking-[-0.03em] text-3xl md:text-4xl">{Math.round(rate * 100)}%</div>
        </div>
      </div>
      <p className="body text-xs">Indicative only. Actual savings depend on anilox volume, substrate and current plate technology. We quantify this during a fingerprinting session.</p>
    </div>
  );
};

const BeforeAfter = () => {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative aspect-[4/3] overflow-hidden select-none" data-testid="before-after">
      <img src={IMG.pouch} alt="Conventional print result" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'contrast(0.78) saturate(0.7) blur(0.8px) brightness(1.05)' }} />
      <img src={IMG.pouch} alt="Flexcel NX print result" className="absolute inset-0 w-full h-full object-cover" style={{ clipPath: `inset(0 0 0 ${pos}%)` }} />
      <div className="absolute inset-y-0 w-px bg-bone" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full border border-bone bg-ink/60 backdrop-blur grid place-items-center font-mono text-[9px] text-bone">⇔</span>
      </div>
      <span className="absolute top-3 left-3 eyebrow !text-bone bg-ink/60 px-2 py-1">Conventional</span>
      <span className="absolute top-3 right-3 eyebrow !text-bone bg-ink/60 px-2 py-1">Flexcel NX</span>
      <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(+e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize" aria-label="Compare before and after" data-testid="before-after-slider" />
    </div>
  );
};

export const Comparison = () => (
  <section className="theme-dark" data-testid="comparison-section">
    <div className="wrap py-24 md:py-32">
      <SectionHead no="09" label="Comparison" title={['See the difference', 'before you print it.']} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-16">
        <Reveal className="lg:col-span-5"><BeforeAfter /><p className="body text-xs mt-3">Drag to compare. Illustrative simulation of highlight detail and solid density.</p></Reveal>
        <Reveal delay={0.1} className="lg:col-span-4 bg-elev hairline border p-6 md:p-8"><div className="eyebrow mb-4">Tone value increase</div><DotGainChart /><p className="body text-xs mt-4">Flatter curve = more of your file's tonal range makes it to the pack.</p></Reveal>
        <Reveal delay={0.2} className="lg:col-span-3 bg-elev hairline border p-6 md:p-8"><InkSavings /></Reveal>
      </div>
    </div>
  </section>
);
