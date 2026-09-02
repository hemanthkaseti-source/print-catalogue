import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { geoNaturalEarth1, geoPath, geoInterpolate, geoGraticule } from 'd3-geo';
import { feature } from 'topojson-client';
import { MARKETS, ORIGIN } from '../../lib/content';

const W = 960, H = 520;
const REGION = { type: 'Polygon', coordinates: [[[-22, -38], [-22, 40], [102, 40], [102, -38], [-22, -38]]] };
const HIGHLIGHT = new Set(MARKETS.map((m) => m.id));

export const WorldMap = ({ active, onHover }) => {
  const [countries, setCountries] = useState(null);

  useEffect(() => {
    fetch('/world-110m.json').then((r) => r.json()).then((topo) => setCountries(feature(topo, topo.objects.countries).features)).catch(() => setCountries([]));
  }, []);

  const projection = useMemo(() => geoNaturalEarth1().fitExtent([[10, 10], [W - 10, H - 10]], REGION), []);
  const path = useMemo(() => geoPath(projection), [projection]);
  const graticule = useMemo(() => path(geoGraticule().step([10, 10])()), [path]);

  const arcs = useMemo(() => MARKETS.map((m) => {
    const interp = geoInterpolate(ORIGIN.coords, m.coords);
    const coords = Array.from({ length: 41 }, (_, i) => interp(i / 40));
    return { code: m.code, d: path({ type: 'LineString', coordinates: coords }) };
  }), [path]);

  const origin = projection(ORIGIN.coords);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" data-testid="world-map">
      <path d={graticule} fill="none" stroke="var(--line)" strokeWidth="0.4" />
      {countries && countries.map((c, i) => {
        const id = +c.id;
        const hl = HIGHLIGHT.has(id);
        const isOrigin = id === ORIGIN.id;
        return (
          <path key={i} d={path(c)} fill={isOrigin ? 'var(--fg)' : hl ? 'var(--acc)' : 'rgba(14,14,16,0.07)'} stroke="var(--bg)" strokeWidth="0.5"
            opacity={hl && active && active !== MARKETS.find((m) => m.id === id)?.code ? 0.45 : 1} style={{ transition: 'opacity .4s' }} />
        );
      })}
      {arcs.map((a, i) => (
        <motion.path key={a.code} d={a.d} fill="none" stroke="var(--fg)" strokeWidth={active === a.code ? 1.6 : 0.8} strokeDasharray="3 3" opacity={active && active !== a.code ? 0.25 : 0.8}
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, delay: 0.3 + i * 0.12, ease: 'easeOut' }} />
      ))}
      {origin && (
        <g transform={`translate(${origin[0]},${origin[1]})`}>
          <circle r="5" fill="var(--fg)" />
          <circle r="12" fill="none" stroke="var(--fg)" strokeWidth="0.8"><animate attributeName="r" values="6;16" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" /></circle>
          <text x="10" y="-8" fontFamily="JetBrains Mono" fontSize="9" fill="var(--fg)">BENGALURU · HQ</text>
        </g>
      )}
      {MARKETS.map((m) => {
        const [x, y] = projection(m.coords);
        const on = active === m.code;
        return (
          <g key={m.code} transform={`translate(${x},${y})`} onMouseEnter={() => onHover(m.code)} onMouseLeave={() => onHover(null)} className="cursor-pointer" data-testid={`export-country-pin-${m.code}`}>
            <circle r="14" fill="transparent" />
            <motion.circle r="4" fill="var(--bg)" stroke="var(--fg)" strokeWidth="1.5" animate={{ scale: on ? 1.6 : 1 }} />
            <text x={m.lbl[0]} y={m.lbl[1]} textAnchor={m.lbl[2]} fontFamily="JetBrains Mono" fontSize="9" fill="var(--fg)" opacity={on ? 1 : 0.7}>{m.name.toUpperCase()}</text>
          </g>
        );
      })}
    </svg>
  );
};
