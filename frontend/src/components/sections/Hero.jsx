import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { IMG, CONTACT } from '../../lib/content';
import { SplitLines, EASE } from '../motion/Reveal';
import { scrollToId } from '../../hooks/useLenis';
import { downloadPdf } from '../../lib/api';

export const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 80, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 80, damping: 20 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section id="top" ref={ref} onPointerMove={onMove} className="theme-dark relative min-h-[100svh] overflow-hidden grain" data-testid="hero-section" style={{ perspective: 1200 }}>
      <motion.div className="absolute inset-0" style={{ y: imgY, scale: imgScale, rotateX: rx, rotateY: ry }}>
        <motion.img
          src={IMG.heroMacro}
          alt="Macro view of flexographic plate dot structure"
          className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.2, ease: EASE }}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

      <motion.div className="relative wrap min-h-[100svh] flex flex-col pt-28 md:pt-36 pb-10" style={{ y: textY, opacity: fade }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 eyebrow">
          <span data-testid="hero-telemetry-1">Flexographic prepress</span>
          <span className="hidden md:block">Est. {CONTACT.established} · Bengaluru, IN</span>
          <span className="hidden md:block">{CONTACT.coords}</span>
          <span className="text-right">Kodak Flexcel NX · Esko CDI · Shine LED</span>
        </motion.div>

        <div className="flex-1 flex flex-col justify-end mt-16 md:mt-0">
          <SplitLines
            lines={['Precision Prepress.', 'Predictable Print.']}
            delay={0.35}
            stagger={0.16}
            className="h1 text-[13vw] sm:text-[9.5vw] lg:text-[7.4vw] xl:text-[6.8vw] leading-[0.92]"
            lineClass="[&:nth-child(1)]:text-bone"
          />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-10 md:mt-14 items-end">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1, ease: EASE }} className="md:col-span-5 lg:col-span-4 lede">
              Sree Bloomy Graphics Pvt. Ltd. makes flexographic plates that behave the same way on every press, in every country. Less ink. Faster make-ready. Colour you can sign off once.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 1, ease: EASE }} className="md:col-span-7 lg:col-span-8 flex flex-wrap gap-3 md:justify-end">
              <button onClick={() => scrollToId('contact')} className="btn btn-solid" data-testid="hero-primary-cta">
                Send us your artwork <ArrowUpRight size={14} className="arr" />
              </button>
              <button onClick={downloadPdf} className="btn btn-ghost no-print" data-testid="hero-download-pdf-button">
                Download PDF catalogue
              </button>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }} className="mt-14 md:mt-20 hairline-t pt-5 flex items-center justify-between eyebrow">
          <span className="flex items-center gap-3"><ArrowDown size={12} className="animate-bounce" /> Scroll to explore</span>
          <span className="hidden sm:block">01 — 14 chapters</span>
          <span>Plates shipped to 6 countries</span>
        </motion.div>
      </motion.div>
    </section>
  );
};
