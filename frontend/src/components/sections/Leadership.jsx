import { motion } from 'framer-motion';
import { LEADERS, CLIENTS, TESTIMONIAL } from '../../lib/content';
import { Reveal, EASE } from '../motion/Reveal';
import { SectionHead } from '../shared/SectionHead';
import { Marquee } from '../shared/Marquee';

export const Leadership = () => (
  <section id="leadership" className="theme-light" data-testid="leadership-section">
    <div className="wrap py-24 md:py-32">
      <SectionHead no="12" label="Leadership" title={['Led by people who', 'still walk the floor.']} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mt-16">
        {LEADERS.map((l, i) => (
          <Reveal key={l.name} delay={i * 0.12} className="grid grid-cols-1 sm:grid-cols-12 gap-6" data-testid={`leader-card-${i + 1}`}>
            <div className="sm:col-span-5 relative overflow-hidden aspect-[3/4]">
              <motion.img src={l.img} alt={`${l.name}, ${l.role}`} className="absolute inset-0 w-full h-full object-cover grayscale contrast-[1.05]" initial={{ scale: 1.15 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: EASE }} />
            </div>
            <div className="sm:col-span-7 flex flex-col justify-between gap-8">
              <blockquote className="quote text-2xl md:text-3xl lg:text-4xl">“{l.quote}”</blockquote>
              <div className="hairline-t pt-4">
                <div className="font-display font-semibold tracking-tight text-lg">{l.name}</div>
                <div className="eyebrow mt-1">{l.role}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const TrustBar = () => (
  <section className="theme-dark" data-testid="trust-section">
    <div className="wrap pt-20 md:pt-28">
      <Reveal className="flex items-center gap-4 mb-10">
        <span className="chapter-no">13</span><span className="h-px w-8" style={{ background: 'var(--line)' }} /><span className="eyebrow">Trusted by</span>
      </Reveal>
    </div>
    <div className="hairline-t hairline-b py-6 no-print">
      <Marquee items={CLIENTS} className="font-display font-medium tracking-tight text-xl md:text-3xl text-muted" />
    </div>
    <div className="wrap py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-10">
      <Reveal className="lg:col-span-8 lg:col-start-3">
        <blockquote className="quote text-3xl md:text-4xl lg:text-5xl" data-testid="testimonial-quote">“{TESTIMONIAL.quote}”</blockquote>
        <div className="eyebrow mt-8">— {TESTIMONIAL.by}</div>
      </Reveal>
    </div>
  </section>
);
