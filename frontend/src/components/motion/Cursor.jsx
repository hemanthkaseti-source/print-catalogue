import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const Cursor = () => {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    const over = (e) => setHover(!!e.target.closest?.('a, button, [data-cursor], input, select, textarea, label'));
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerover', over); };
  }, [x, y]);

  return (
    <motion.div
      className="cursor-ring no-print"
      style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
      animate={{ scale: hover ? 3.2 : 1, opacity: hover ? 0.9 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    />
  );
};
