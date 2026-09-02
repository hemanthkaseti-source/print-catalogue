import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

let lenisInstance = null;
export const getLenis = () => lenisInstance;

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance) lenisInstance.scrollTo(el, { offset: 0, duration: 1.6 });
  else el.scrollIntoView({ behavior: 'smooth' });
};

export const useLenis = () => {
  const raf = useRef(null);
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    lenisInstance = lenis;
    const loop = (t) => { lenis.raf(t); raf.current = requestAnimationFrame(loop); };
    raf.current = requestAnimationFrame(loop);
    const onPrint = () => lenis.stop();
    window.addEventListener('sbg:print', onPrint);
    window.addEventListener('afterprint', () => lenis.start());
    return () => { cancelAnimationFrame(raf.current); lenis.destroy(); lenisInstance = null; window.removeEventListener('sbg:print', onPrint); };
  }, []);
};
