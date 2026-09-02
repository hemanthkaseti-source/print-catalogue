import { useState } from 'react';

const GRID = 6;

const Dots = ({ pressure, flat, color }) => {
  const cells = [];
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const base = 4 + ((r + c) / (GRID * 2 - 2)) * 9;
      const gain = flat ? pressure * 1.2 : pressure * 5.5;
      const radius = base + gain;
      cells.push(
        <g key={`${r}-${c}`} transform={`translate(${20 + c * 30}, ${20 + r * 30})`}>
          {!flat && <circle r={radius + pressure * 3} fill={color} opacity={0.18 + pressure * 0.2} />}
          <circle r={radius} fill={color} />
          {flat && <circle r={Math.max(radius - 2.5, 1)} fill={color} opacity={0.35} stroke="#0E0E10" strokeWidth={0.6} />}
        </g>
      );
    }
  }
  return <>{cells}</>;
};

const Profile = ({ flat, pressure }) => {
  const top = flat ? 'M20,60 L20,22 L60,22 L60,60' : 'M20,60 C22,30 38,18 40,18 C42,18 58,30 60,60';
  const squish = 1 + pressure * (flat ? 0.05 : 0.35);
  return (
    <svg viewBox="0 0 80 64" className="w-24 h-20">
      <line x1="0" y1="60" x2="80" y2="60" stroke="var(--line)" strokeWidth="1" />
      <g transform={`translate(40,60) scale(${squish},1) translate(-40,-60)`}>
        <path d={top} fill="var(--acc)" opacity={0.9} />
      </g>
      <line x1="8" y1={flat ? 22 : 18 + pressure * 6} x2="72" y2={flat ? 22 : 18 + pressure * 6} stroke="var(--fg)" strokeDasharray="2 2" strokeWidth="0.5" />
    </svg>
  );
};

export const DotComparison = () => {
  const [pressure, setPressure] = useState(0.35);
  const convGain = Math.round(12 + pressure * 26);
  const nxGain = Math.round(6 + pressure * 6);

  return (
    <div className="hairline border p-6 md:p-8 bg-elev" data-testid="nx-dot-comparison">
      <div className="grid grid-cols-2 gap-6 md:gap-10">
        {[{ t: 'Conventional dot', flat: false, gain: convGain, color: '#9A9A9E' }, { t: 'Flexcel NX flat-top', flat: true, gain: nxGain, color: 'var(--acc)' }].map((p) => (
          <div key={p.t} data-testid={p.flat ? 'nx-panel-flat' : 'nx-panel-conventional'}>
            <div className="flex items-center justify-between mb-4">
              <span className="eyebrow">{p.t}</span>
              <span className="font-mono text-xs text-acc">+{p.gain}% gain</span>
            </div>
            <svg viewBox="0 0 190 190" className="w-full aspect-square">
              <rect width="190" height="190" fill="transparent" />
              <Dots pressure={pressure} flat={p.flat} color={p.color} />
            </svg>
            <div className="flex items-center gap-4 mt-4">
              <Profile flat={p.flat} pressure={pressure} />
              <p className="text-xs body">{p.flat ? 'Flat surface, sharp shoulders: ink transfers cleanly, size stays put under impression.' : 'Rounded crown spreads under impression: highlights fill in and shadows plug.'}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 hairline-t pt-6 no-print">
        <div className="flex items-center justify-between eyebrow mb-4">
          <span>Impression pressure</span>
          <span className="text-acc">{Math.round(pressure * 100)}%</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" value={pressure} onChange={(e) => setPressure(parseFloat(e.target.value))} className="range" aria-label="Impression pressure" data-testid="nx-dot-comparison-toggle" />
        <div className="flex justify-between eyebrow mt-3 opacity-70"><span>Kiss</span><span>Heavy</span></div>
      </div>
    </div>
  );
};
