import { Reveal, SplitLines } from '../motion/Reveal';

export const SectionHead = ({ no, label, title, lede, dark, right, className = '' }) => {
  const lines = Array.isArray(title) ? title : [title];
  return (
    <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 ${className}`}>
      <Reveal className="md:col-span-3 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <span className="chapter-no" data-testid={`chapter-no-${no}`}>{no}</span>
          <span className="h-px w-8" style={{ background: 'var(--line)' }} />
          <span className="eyebrow">{label}</span>
        </div>
      </Reveal>
      <div className={`md:col-span-9 ${right ? 'lg:col-start-5 lg:col-span-8' : ''}`}>
        <SplitLines inView lines={lines} className="h2 max-w-5xl" />
        {lede && <Reveal delay={0.25} className="lede mt-8 max-w-2xl">{lede}</Reveal>}
      </div>
    </div>
  );
};
