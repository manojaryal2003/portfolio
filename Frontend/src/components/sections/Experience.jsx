import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBriefcase, FaCalendarAlt, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../../utils/api';

/* ─────────────────────────────────────────────────────────────
   SNAKE PATH  — pure SVG, 100% wide, no HTML cards on path
   The path snakes left↔right between avatar stops.

   ViewBox: 0 0 1000 H  (H computed from count)
   Left  wall  x = 120
   Right wall  x = 880
   Each row height = ROW_H
   Avatars sit exactly on the path at alternating sides.
───────────────────────────────────────────────────────────── */

const VW     = 1000;
const LEFT   = 180;          // left turn-around x
const RIGHT  = 820;          // right turn-around x
const ROW_H  = 160;          // vertical spacing between stops (compact)
const PAD_T  = 80;           // space above first stop (for START badge)
const PAD_B  = 80;           // space below last stop (for PRESENT badge)

/* Y position of stop i */
const stopY = (i) => PAD_T + i * ROW_H;

/* X position of stop i — alternates left / right */
const stopX = (i) => (i % 2 === 0 ? RIGHT : LEFT);

/* Build the snake SVG path through all stops */
const buildSnakePath = (n) => {
  if (n === 0) return '';
  const pts = [];

  for (let i = 0; i < n; i++) {
    const x  = stopX(i);
    const y  = stopY(i);
    const cx = VW / 2;   // control-point x (middle of canvas)

    if (i === 0) {
      pts.push(`M ${x} ${y}`);
    }

    if (i < n - 1) {
      const nx  = stopX(i + 1);
      const ny  = stopY(i + 1);
      const my  = (y + ny) / 2;   // midpoint y for the curve

      // Cubic bezier: from current stop, curve through the
      // opposite wall midpoint, then arrive at next stop.
      // cp1: stay near current x, drop halfway
      // cp2: swing to next x, drop halfway
      pts.push(`C ${x} ${my}, ${nx} ${my}, ${nx} ${ny}`);
    }
  }

  return pts.join(' ');
};

const svgHeight = (n) => (n === 0 ? 200 : stopY(n - 1) + PAD_B);

/* ─── PALETTES ─── */
const PALETTES = [
  { bg: '#6366f1', dark: '#4338ca', light: '#a5b4fc', glow: 'rgba(99,102,241,0.6)'  },
  { bg: '#a855f7', dark: '#7c3aed', light: '#d8b4fe', glow: 'rgba(168,85,247,0.6)' },
  { bg: '#06b6d4', dark: '#0891b2', light: '#a5f3fc', glow: 'rgba(6,182,212,0.6)'  },
  { bg: '#f59e0b', dark: '#d97706', light: '#fde68a', glow: 'rgba(245,158,11,0.6)' },
  { bg: '#ec4899', dark: '#be185d', light: '#f9a8d4', glow: 'rgba(236,72,153,0.6)' },
  { bg: '#10b981', dark: '#059669', light: '#6ee7b7', glow: 'rgba(16,185,129,0.6)' },
];

const getPalette = (exp, i) =>
  exp.isCurrent
    ? { bg: '#10b981', dark: '#065f46', light: '#6ee7b7', glow: 'rgba(16,185,129,0.65)' }
    : PALETTES[i % PALETTES.length];

/* ─── SVG Avatar ─── */
const Avatar = ({ col, index, isActive, isCurrent, onClick, x, y }) => {
  const AW = 56, AH = 76;
  return (
    <g
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      transform={`translate(${x - AW / 2}, ${y - AH + 8})`}
    >
      {/* hover / active glow beneath feet */}
      <ellipse cx={AW / 2} cy={AH - 2} rx={18} ry={6}
        fill={col.glow} opacity={isActive ? 0.7 : 0.3}
        style={{ filter: 'blur(4px)' }} />

      {/* legs */}
      <rect x={16} y={52} width={8} height={18} rx={4} fill={col.dark} />
      <rect x={26} y={52} width={8} height={18} rx={4} fill={col.dark} />

      {/* body */}
      <rect x={12} y={30} width={28} height={26} rx={7} fill={col.bg} />
      {/* collar */}
      <path d="M20 30 L28 37 L36 30" stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.5" fill="none" strokeLinejoin="round" />

      {/* arms */}
      <rect x={4} y={31} width={9} height={15} rx={4.5} fill={col.bg}
        style={{ transformOrigin:'12px 36px',
          transform: isActive ? 'rotate(-28deg)' : 'rotate(14deg)',
          transition:'transform 0.35s' }} />
      <rect x={39} y={31} width={9} height={15} rx={4.5} fill={col.bg}
        style={{ transformOrigin:'39px 36px',
          transform: isActive ? 'rotate(28deg)' : 'rotate(-14deg)',
          transition:'transform 0.35s' }} />

      {/* neck */}
      <rect x={22} y={24} width={8} height={8} rx={3} fill={col.bg} />

      {/* head */}
      <circle cx={28} cy={16} r={14} fill={col.bg} />
      <circle cx={22} cy={11} r={4} fill="rgba(255,255,255,0.13)" />

      {/* eyes */}
      <circle cx={22} cy={14} r={2.8} fill="white" />
      <circle cx={32} cy={14} r={2.8} fill="white" />
      <circle cx={isActive ? 23 : 22.5} cy={14.2} r={1.3} fill="#1e1b4b" />
      <circle cx={isActive ? 33 : 32.5} cy={14.2} r={1.3} fill="#1e1b4b" />
      <circle cx={23} cy={13.2} r={0.6} fill="white" />
      <circle cx={33} cy={13.2} r={0.6} fill="white" />

      {/* mouth */}
      <path d={isActive ? 'M21 20 Q28 26 35 20' : 'M21 20 Q28 24 35 20'}
        stroke="rgba(255,255,255,0.88)" strokeWidth="1.8"
        strokeLinecap="round" fill="none" />

      {/* badge */}
      <circle cx={28} cy={42} r={8} fill="rgba(0,0,0,0.25)" />
      <circle cx={28} cy={42} r={7} fill={col.dark}
        stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
      <text x={28} y={46} textAnchor="middle" fill="white"
        fontSize="7" fontWeight="bold" fontFamily="monospace">
        {String(index + 1).padStart(2, '0')}
      </text>

      {/* current crown */}
      {isCurrent && (
        <>
          <text x={28} y={0} textAnchor="middle" fontSize="11" fill="#fbbf24">★</text>
          <text x={15} y={5} textAnchor="middle" fontSize="8"  fill="#fbbf24">✦</text>
          <text x={41} y={5} textAnchor="middle" fontSize="8"  fill="#fbbf24">✦</text>
        </>
      )}
    </g>
  );
};

/* ─── Detail Modal ─── */
const DetailModal = ({ exp, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl"
        style={{
          background: 'var(--bg-surface-strong)',
          border: '1px solid rgba(99,102,241,0.25)',
          boxShadow: '0 0 60px rgba(99,102,241,0.18)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 w-full rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg,#6366f1,#a855f7,#06b6d4)' }} />
        <div className="p-6">
          {/* header */}
          <div className="flex items-start gap-4 mb-5">
            {exp.companyLogo
              ? <img src={exp.companyLogo} alt={exp.company}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  style={{ border: '1px solid var(--border)' }} />
              : <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                  <FaBriefcase className="text-indigo-400" size={22} />
                </div>
            }
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
                {exp.role}
              </h3>
              <p className="text-indigo-400 font-semibold text-sm mt-0.5">{exp.company}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="flex items-center gap-1.5 text-xs font-mono"
                  style={{ color: 'var(--text-muted)' }}>
                  <FaCalendarAlt size={9} />
                  {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                </span>
                {exp.isCurrent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399' }}>
                    ● CURRENT
                  </span>
                )}
                {exp.location && (
                  <span className="flex items-center gap-1 text-xs" style={{ color:'var(--text-muted)' }}>
                    <FaMapMarkerAlt size={9} /> {exp.location}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-xl transition-colors flex-shrink-0"
              style={{ color:'var(--text-muted)', background:'var(--bg-surface)' }}>
              <FaTimes size={14} />
            </button>
          </div>

          {exp.description && (
            <p className="text-sm leading-relaxed mb-4 pb-4"
              style={{ color:'var(--text-secondary)', borderBottom:'1px solid var(--border)' }}>
              {exp.description}
            </p>
          )}

          {exp.responsibilities?.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest mb-3 font-bold"
                style={{ color:'var(--text-muted)' }}>Key Responsibilities</p>
              <ul className="space-y-2.5">
                {exp.responsibilities.map((r, i) => (
                  <motion.li key={i}
                    initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 text-sm"
                    style={{ color:'var(--text-secondary)' }}>
                    <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {r}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {exp.technologies?.length > 0 && (
            <div className="pt-4" style={{ borderTop:'1px solid var(--border)' }}>
              <p className="text-[10px] uppercase tracking-widest mb-3 font-bold"
                style={{ color:'var(--text-muted)' }}>Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {exp.technologies.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.22)', color:'#818cf8' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ─── Main Section ─── */
const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [selected, setSelected]       = useState(null);
  const [activeId, setActiveId]       = useState(null);
  const [isMobile, setIsMobile]       = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    api.get('/experience')
      .then(r => setExperiences(r.data.data || []))
      .catch(() => {});
    return () => { document.body.style.overflow = ''; };
  }, []);

  const open  = (exp) => { setSelected(exp); setActiveId(exp._id); document.body.style.overflow = 'hidden'; };
  const close = ()    => { setSelected(null); setActiveId(null); document.body.style.overflow = ''; };

  const n    = experiences.length;
  const VH   = svgHeight(n);
  const path = buildSnakePath(n);
  /* On mobile, crop the empty horizontal margins so avatars render ~1.7× bigger */
  const mobileVBX = 150, mobileVBW = 700;
  const viewBox = isMobile
    ? `${mobileVBX} 0 ${mobileVBW} ${VH}`
    : `0 0 ${VW} ${VH}`;

  return (
    <section id="experience" className="section-padding relative overflow-hidden bg-experience">

      {/* ambient glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(99,102,241,0.06),transparent 70%)', filter:'blur(60px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(168,85,247,0.06),transparent 70%)', filter:'blur(60px)' }} />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* heading */}
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} className="mb-16">
          
          <h2 className="text-4xl sm:text-5xl font-black" style={{ color:'var(--text-primary)' }}>
            Work <span className="text-gradient">Experience</span>
          </h2>
          
        </motion.div>

        {n === 0 ? (
          <p className="text-center py-24" style={{ color:'var(--text-muted)' }}>
            Career journey will appear once experience is added from the admin panel.
          </p>
        ) : (
          <div className="w-full">

            {/* ── START badge — above SVG, no overlap ── */}
            <motion.div
              initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="flex justify-center mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest"
                style={{
                  background: 'rgba(99,102,241,0.08)',
                  border: '1.5px solid rgba(99,102,241,0.25)',
                  color: '#6366f1',
                }}>
                ▲ Start of Journey
              </span>
            </motion.div>

            {/* ── Full-width SVG snake ── */}
            <svg
              viewBox={viewBox}
              preserveAspectRatio="xMidYMid meet"
              className="w-full"
              style={{ display:'block', overflow:'visible' }}
            >
              <defs>
                <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.7" />
                  <stop offset="33%"  stopColor="#a855f7" stopOpacity="0.7" />
                  <stop offset="66%"  stopColor="#06b6d4" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.7" />
                </linearGradient>
                <filter id="snake-glow" x="-10%" y="-5%" width="120%" height="110%">
                  <feGaussianBlur stdDeviation="5" result="b" />
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="avatar-lift" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="6" stdDeviation="10"
                    floodColor="rgba(99,102,241,0.3)" />
                </filter>
              </defs>

              {/* outer soft glow */}
              <path d={path} fill="none"
                stroke="url(#snakeGrad)" strokeWidth="24"
                strokeLinecap="round" strokeLinejoin="round"
                opacity="0.12" filter="url(#snake-glow)" />

              {/* main path body */}
              <path d={path} fill="none"
                stroke="url(#snakeGrad)" strokeWidth="10"
                strokeLinecap="round" strokeLinejoin="round"
                opacity="0.35" />

              {/* bright centre line */}
              <path d={path} fill="none"
                stroke="rgba(255,255,255,0.6)" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />

              {/* ── avatars at each stop ── */}
              {experiences.map((exp, i) => {
                const col    = getPalette(exp, i);
                const x      = stopX(i);
                const y      = stopY(i);
                const isAct  = activeId === exp._id;

                return (
                  <g key={exp._id || i}>
                    {/* pulse ring on active */}
                    {isAct && (
                      <motion.circle cx={x} cy={y} r={36}
                        fill={col.glow}
                        animate={{ r:[36,52,36], opacity:[0.4,0,0.4] }}
                        transition={{ duration:1.8, repeat:Infinity }}
                      />
                    )}

                    {/* stop dot on path */}
                    <circle cx={x} cy={y} r={isAct ? 14 : 10}
                      fill={col.bg}
                      stroke="white"
                      strokeWidth={isAct ? 3 : 2.5}
                      style={{
                        filter: isAct
                          ? `drop-shadow(0 0 10px ${col.glow})`
                          : `drop-shadow(0 2px 6px rgba(0,0,0,0.2))`,
                        transition:'all 0.35s',
                      }}
                    />

                    {/* avatar — floats above the dot */}
                    <motion.g
                      whileHover={{ y: -10, scale: 1.1 }}
                      whileTap={{ scale: 0.92 }}
                      style={{ filter: isAct ? `drop-shadow(0 0 16px ${col.glow})` : 'none',
                        transition:'filter 0.3s' }}
                    >
                      <Avatar
                        col={col} index={i}
                        isActive={isAct}
                        isCurrent={exp.isCurrent}
                        onClick={() => open(exp)}
                        x={x} y={y}
                      />
                    </motion.g>

                    {/* label: last stop → below; others → outer side away from path */}
                    {i === n - 1 ? (
                      /* last stop: label below */
                      <>
                        <text x={x} y={y + 30}
                          textAnchor="middle" fontSize="13" fontWeight="700"
                          fontFamily="system-ui,sans-serif" fill={col.bg}>
                          {exp.company}
                        </text>
                        <text x={x} y={y + 46}
                          textAnchor="middle" fontSize="11"
                          fontFamily="system-ui,sans-serif"
                          fill="rgba(255,255,255,0.6)">
                          {exp.startDate}{exp.isCurrent ? ' — Present' : exp.endDate ? ` — ${exp.endDate}` : ''}
                        </text>
                      </>
                    ) : (
                      /* all other stops: label to the outer side */
                      (() => {
                        const onRight  = x === RIGHT;
                        const labelX   = onRight ? x + 30 : x - 30;
                        const anchor   = onRight ? 'start' : 'end';
                        return (
                          <>
                            <text x={labelX} y={y - 10}
                              textAnchor={anchor} fontSize="13" fontWeight="700"
                              fontFamily="system-ui,sans-serif" fill={col.bg}>
                              {exp.company}
                            </text>
                            <text x={labelX} y={y + 6}
                              textAnchor={anchor} fontSize="11"
                              fontFamily="system-ui,sans-serif"
                              fill="rgba(255,255,255,0.6)">
                              {exp.startDate}{exp.isCurrent ? ' — Present' : exp.endDate ? ` — ${exp.endDate}` : ''}
                            </text>
                          </>
                        );
                      })()
                    )}
                  </g>
                );
              })}
            </svg>

            {/* ── PRESENT badge — below SVG ── */}
            <motion.div
              initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="flex justify-center mt-6"
            >
              <motion.span
                animate={{ boxShadow:['0 0 0 rgba(16,185,129,0)','0 0 20px rgba(16,185,129,0.4)','0 0 0 rgba(16,185,129,0)'] }}
                transition={{ duration:2.2, repeat:Infinity }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest"
                style={{
                  background:'rgba(16,185,129,0.08)',
                  border:'1.5px solid rgba(16,185,129,0.3)',
                  color:'#10b981',
                }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Present — Still Growing
              </motion.span>
            </motion.div>

          </div>
        )}
      </div>

      {selected && <DetailModal exp={selected} onClose={close} />}
    </section>
  );
};

export default Experience;
