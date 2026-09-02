import { useEffect, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { ArrowDownToLine } from 'lucide-react';
import { NAV } from '../../lib/content';
import { scrollToId } from '../../hooks/useLenis';
import { downloadPdf } from '../../lib/api';

export const Nav = () => {
  const { scrollY, scrollYProgress } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 200 && !open);
  });

  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  const go = (id) => { setOpen(false); scrollToId(id); };

  return (
    <>
      <motion.header
        className="no-print fixed top-0 inset-x-0 z-50 mix-blend-difference text-white"
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        data-testid="site-nav"
      >
        <div className="wrap flex items-center justify-between h-16 md:h-20">
          <button onClick={() => go('top')} className="flex items-center gap-3 font-display font-semibold tracking-tight text-sm md:text-base" data-testid="nav-logo">
            <span className="w-2 h-2 bg-white" />
            Sree Bloomy Graphics
            <span className="hidden md:inline font-mono text-[10px] tracking-[0.2em] opacity-70 ml-2">PVT. LTD.</span>
          </button>
          <nav className="hidden lg:flex items-center gap-8">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} className="group relative font-mono text-[11px] uppercase tracking-[0.2em]" data-testid={`nav-link-${n.id}`}>
                {n.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-[width] duration-500 group-hover:w-full" />
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={downloadPdf} className="hidden sm:inline-flex items-center gap-2 border border-white/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors duration-300" data-testid="nav-download-pdf-button">
              <ArrowDownToLine size={14} /> PDF
            </button>
            <button onClick={() => setOpen(!open)} className="lg:hidden flex flex-col gap-1.5 p-2" aria-label="Menu" data-testid="nav-menu-toggle">
              <span className={`block h-px w-6 bg-white transition-transform duration-300 ${open ? 'translate-y-[3.5px] rotate-45' : ''}`} />
              <span className={`block h-px w-6 bg-white transition-transform duration-300 ${open ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
        <motion.div className="h-px bg-white origin-left" style={{ scaleX: scrollYProgress }} />
      </motion.header>

      <motion.div
        className="no-print fixed inset-0 z-40 theme-dark flex flex-col justify-center lg:hidden"
        initial={false}
        animate={{ clipPath: open ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        data-testid="mobile-menu"
      >
        <div className="wrap flex flex-col gap-6">
          {NAV.map((n, i) => (
            <button key={n.id} onClick={() => go(n.id)} className="text-left font-display text-4xl font-semibold tracking-tight flex items-baseline gap-4" data-testid={`mobile-nav-link-${n.id}`}>
              <span className="chapter-no">0{i + 1}</span>{n.label}
            </button>
          ))}
          <button onClick={() => { setOpen(false); downloadPdf(); }} className="btn btn-ghost w-fit mt-6" data-testid="mobile-download-pdf-button"><ArrowDownToLine size={14} /> Download PDF catalogue</button>
        </div>
      </motion.div>
    </>
  );
};
