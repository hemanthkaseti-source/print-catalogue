import { ArrowRight } from 'lucide-react';
import { CONTACT, OUTCOMES } from '../../lib/content';
import { Reveal, Line } from '../motion/Reveal';
import { Counter } from '../motion/Counter';
import { Marquee } from '../shared/Marquee';

export const RebrandBar = () => (
  <section className="theme-light" data-testid="rebrand-section">
    <div className="wrap py-10 md:py-14">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <Reveal className="md:col-span-6 flex items-center gap-4 flex-wrap">
          <span className="eyebrow line-through decoration-1 opacity-60">{CONTACT.formerly}</span>
          <ArrowRight size={14} className="text-acc" />
          <span className="font-display font-semibold tracking-tight text-lg md:text-2xl" data-testid="rebrand-company-name">{CONTACT.company}</span>
        </Reveal>
        <div className="md:col-span-6 grid grid-cols-3 gap-6">
          {[['Est.', String(CONTACT.established)], ['Base', 'Bengaluru, India'], ['Footprint', '6 export markets']].map(([k, v], i) => (
            <Reveal key={k} delay={i * 0.08} className="hairline-l pl-4">
              <div className="eyebrow">{k}</div>
              <div className="font-display font-medium tracking-tight text-base md:text-lg mt-1">{v}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
    <Line />
    <Marquee
      className="py-5 font-display font-medium tracking-tight text-2xl md:text-4xl"
      items={['Kodak Flexcel NX', 'Esko CDI', 'Shine LED Exposure', 'Automation Engine', 'Fingerprinting', 'Colour Management', 'Global Exports']}
    />
    <Line />
  </section>
);

export const Outcomes = () => (
  <section className="theme-dark" data-testid="outcomes-section">
    <div className="wrap py-24 md:py-32">
      <Reveal className="flex items-center gap-4 mb-14">
        <span className="chapter-no">01</span><span className="h-px w-8" style={{ background: 'var(--line)' }} /><span className="eyebrow">Outcomes on your press</span>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {OUTCOMES.map((o, i) => (
          <Reveal key={o.label} delay={i * 0.1} className="hairline-t lg:hairline-l lg:border-t-0 pt-8 lg:pt-0 lg:pl-8 pb-10 lg:pb-0 flex flex-col gap-6 group" data-testid={`outcome-metric-${i + 1}`}>
            <div className="font-display font-semibold tracking-[-0.04em] text-5xl md:text-6xl lg:text-[4.2rem] leading-none">
              <Counter value={o.value} decimals={o.decimals || 0} prefix={o.prefix} suffix={o.suffix} />
            </div>
            <div>
              <div className="h3 mb-3">{o.label}</div>
              <p className="body">{o.note}</p>
            </div>
            <span className="mt-auto h-px w-10 bg-acc transition-[width] duration-700 group-hover:w-full" />
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
