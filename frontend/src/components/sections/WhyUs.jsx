import { motion } from 'framer-motion';
import { WHY, IMG } from '../../lib/content';
import { Reveal, EASE } from '../motion/Reveal';
import { SectionHead } from '../shared/SectionHead';

export const WhyUs = () => (
  <section className="theme-light" data-testid="why-section">
    <div className="wrap py-24 md:py-32">
      <SectionHead no="02" label="Why Sree Bloomy" title={['Built around', 'your press, not ours.']} lede="Every decision in our workflow is measured against one question: does this improve the print coming off your press? Machines are the means. Outcomes are the product." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-20">
        <Reveal className="lg:col-span-5 relative overflow-hidden aspect-[4/5] lg:aspect-auto lg:min-h-[640px]">
          <motion.img
            src={IMG.facility}
            alt="Sree Bloomy Graphics prepress facility"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.15 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: EASE }}
          />
          <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-ink/70 to-transparent text-bone">
            <div className="eyebrow !text-bone/70">Facility · Bengaluru</div>
            <div className="font-display font-medium tracking-tight mt-1">Imaging, exposure & finishing under one roof</div>
          </div>
        </Reveal>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2">
          {WHY.map((w, i) => (
            <Reveal key={w.no} delay={i * 0.08} className="group hairline-t sm:[&:nth-child(odd)]:border-r p-7 md:p-9 flex flex-col gap-10 min-h-[280px] hover:bg-elev transition-colors duration-500" data-testid={`why-card-${w.no}`}>
              <div className="flex items-center justify-between">
                <span className="chapter-no">{w.no}</span>
                <span className="w-2 h-2 rounded-full bg-acc opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="mt-auto">
                <h3 className="h3 mb-3">{w.title}</h3>
                <p className="body">{w.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);
