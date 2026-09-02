import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export const EASE = [0.16, 1, 0.3, 1];

export const Reveal = ({ children, delay = 0, y = 28, className = '', as = 'div', once = true, ...rest }) => {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-8% 0px -8% 0px' }}
      transition={{ duration: 1, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export const SplitLines = ({ lines, className = '', lineClass = '', delay = 0, stagger = 0.12, inView = false }) => {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: '-10% 0px -10% 0px' });
  const show = inView ? seen : true;
  return (
    <div ref={ref} className={className} aria-label={lines.join(' ')}>
      {lines.map((line, i) => (
        <div key={i} className="overflow-hidden" style={{ paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
          <motion.div
            className={`block ${lineClass}`}
            initial={{ y: '110%', opacity: 0 }}
            animate={show ? { y: '0%', opacity: 1 } : { y: '110%', opacity: 0 }}
            transition={{ duration: 1.1, delay: delay + i * stagger, ease: EASE }}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export const Line = ({ className = '', delay = 0 }) => (
  <motion.div
    className={`h-px w-full origin-left ${className}`}
    style={{ background: 'var(--line)' }}
    initial={{ scaleX: 0 }}
    whileInView={{ scaleX: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 1.4, delay, ease: EASE }}
  />
);
