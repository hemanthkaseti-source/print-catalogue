export const Marquee = ({ items, className = '', itemClass = '', separator = '·' }) => {
  const row = [...items, ...items];
  return (
    <div className={`marquee overflow-hidden ${className}`} aria-hidden="true">
      <div className="marquee-track">
        {row.map((it, i) => (
          <span key={i} className={`flex items-center gap-10 pr-10 whitespace-nowrap ${itemClass}`}>
            <span>{it}</span>
            <span className="text-acc">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
