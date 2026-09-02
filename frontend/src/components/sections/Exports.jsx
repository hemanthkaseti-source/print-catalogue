import { useState } from 'react';
import { MARKETS, CONTACT } from '../../lib/content';
import { Reveal } from '../motion/Reveal';
import { SectionHead } from '../shared/SectionHead';
import { WorldMap } from '../diagrams/WorldMap';

export const Exports = () => {
  const [active, setActive] = useState(null);
  return (
    <section id="exports" className="theme-light" data-testid="exports-section">
      <div className="wrap py-24 md:py-32">
        <SectionHead no="10" label="Global exports" title={['Plates that cross', 'borders on schedule.']} lede="We ship press-ready plates door-to-door across East and Central Africa and South Asia today, with new markets opening. Same workflow, same colour targets, same measured pass — wherever your press is." />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-16 items-start">
          <Reveal className="lg:col-span-8 lg:sticky lg:top-24">
            <WorldMap active={active} onHover={setActive} />
          </Reveal>
          <div className="lg:col-span-4">
            <div className="eyebrow mb-4">Current markets</div>
            <ul>
              {MARKETS.map((m, i) => (
                <Reveal as="li" delay={i * 0.06} key={m.code}>
                  <button onMouseEnter={() => setActive(m.code)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(m.code)} className={`w-full text-left hairline-t py-4 grid grid-cols-[32px_1fr_auto] gap-4 items-baseline transition-colors duration-300 ${active === m.code ? 'text-ink' : 'text-muted hover:text-ink'}`} data-testid={`export-market-${m.code}`}>
                    <span className={`font-mono text-xs ${active === m.code ? 'text-acc' : ''}`}>{m.code}</span>
                    <span>
                      <span className="font-display font-medium tracking-tight text-base md:text-lg block">{m.name}</span>
                      <span className="text-xs">{m.city} · {m.note}</span>
                    </span>
                    <span className="font-mono text-[10px]">{m.coords[1].toFixed(1)}°, {m.coords[0].toFixed(1)}°</span>
                  </button>
                </Reveal>
              ))}
            </ul>
            <Reveal className="hairline-t pt-6 mt-2">
              <div className="eyebrow mb-2">Expansion focus</div>
              <p className="body">Wider Sub-Saharan Africa, the Middle East and South-East Asia. If your plant is not on this map yet, it soon can be.</p>
              <p className="body mt-4 text-xs">{CONTACT.shipping}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
