import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBriefcase, FaCalendarAlt, FaTimes, FaMapMarkerAlt, FaUser,
} from 'react-icons/fa';
import api from '../../utils/api';

/*
  ╔══════════════════════════════════════════════════════════════╗
  ║  LAYOUT STRATEGY                                            ║
  ║                                                             ║
  ║  The SVG is full-width (100%), viewBox="0 0 1000 H".        ║
  ║  Cards are rendered INSIDE the SVG as <foreignObject> so    ║
  ║  their x/y coordinates are exactly in the same space as     ║
  ║  the path — zero chance of overlap.                         ║
  ║                                                             ║
  ║  Path geometry (viewBox units, width = 1000):               ║
  ║    • Centre X = 500                                         ║
  ║    • Each pill: rx=380, ry=44  → spans x 120…880           ║
  ║    • ROW_H = 220 viewBox units per experience               ║
  ║    • Cards are 280 wide, placed in the outer zones:         ║
  ║        left zone:  x 20…360   (clear of path left edge 120) ║
  ║        right zone: x 640…980  (clear of path right edge 880)║
  ║    • Dot sits at the cap of each pill                        ║
  ╚══════════════════════════════════════════════════════════════╝
*/

const VW      = 1000;          // viewBox width
const CX      = VW / 2;       // 500
const RX      = 380;           // pill half-width  → left edge: 120, right edge: 880
const RY      = 44;            // pill half-height
const ROW_H   = 240;           // viewBox units per row
const PAD_T   = 80;            // top padding before first pill centre
const CARD_W  = 270;           // card width in viewBox units
const CARD_H  = 140;           // card height estimate
const GAP     = 28;            // gap between pill edge and card

// card zone left:  right edge = CX - RX - GAP = 500-380-28 = 92  → too small
// So push card right edge to CX-RX-GAP and card left = that - CARD_W
const LEFT_CARD_X  = CX - RX - GAP - CARD_W;  // left edge of left cards
const RIGHT_CARD_X = CX + RX + GAP;            // left edge of right cards

/* pill centre Y */
const pillY = (i) => PAD_T + i * ROW_H;

/* dot position — even rows → right cap, odd rows → left cap */
const dotAt = (i) => ({
  x: i % 2 === 0 ? CX + RX : CX - RX,
  y: pillY(i),
});

/* Build the continuous snake path */
const buildPath = (n) => {
  if (!n) return '';
  const p = [];
  for (let i = 0; i < n; i++) {
    const cy = pillY(i);
    // even rows sweep left→right (clockwise top arc)
    const goRight = i % 2 === 0;

    if (i === 0) {
      p.push(`M ${CX - RX} ${cy}`);
    }

    if (goRight) {
      p.push(`A ${RX} ${RY} 0 0 1 ${CX + RX} ${cy}`);
    } else {
      p.push(`A ${RX} ${RY} 0 0 0 ${CX - RX} ${cy}`);
    }

    if (i < n - 1) {
      const nextCY = pillY(i + 1);
      const curX   = goRight ? CX + RX : CX - RX;
      const nxtX   = (i + 1) % 2 === 0 ? CX - RX : CX + RX;
      p.push(`L ${curX} ${nextCY}`);
      if (curX !== nxtX) p.push(`L ${nxtX} ${nextCY}`);
    }
  }
  return p.join(' ');
};

const svgH = (n) => n ? pillY(n - 1) + RY + 80 : 200;

/* ─── Detail Modal ─── */
const DetailModal = ({ exp, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,10,40,0.55)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 28 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-3xl"
        style={{
          background: 'rgba(255,255,255,0.97)',
          border: '1.5px solid rgba(99,102,241,0.18)',
          boxShadow: '0 32px 100px rgba(99,102,241,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 w-full rounded-t-3xl"
          style={{ background: 'linear-gradient(90deg,#6366f1,#a855f7,#06b6d4)' }} />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            {exp.companyLogo
              ? <img src={exp.companyLogo} alt={exp.company}
                  className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 border border-indigo-100" />
              : <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#e0e7ff,#ede9fe)' }}>
                  <FaBriefcase className="text-indigo-500" size={22} />
                </div>
            }
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-gray-800">{exp.role}</h3>
              <p className="text-indigo-500 font-semibold text-sm mt-0.5">{exp.company}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="flex items-center gap-1.5 text-gray-400 text-xs font-mono">
                  <FaCalendarAlt size={9} />
                  {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                </span>
                {exp.isCurrent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#059669' }}>
                    ● CURRENT
                  </span>
                )}
                {exp.location && (
                  <span className="flex items-center gap-1 text-gray-400 text-xs">
                    <FaMapMarkerAlt size={9} /> {exp.location}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <FaTimes size={14} />
            </button>
          </div>
          {exp.description && (
            <p className="text-gray-500 text-sm leading-relaxed mb-4 pb-4 border-b border-gray-100">
              {exp.description}
            </p>
          )}
          {exp.responsibilities?.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3 font-bold">Key Responsibilities</p>
              <ul className="space-y-2">
                {exp.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {exp.technologies?.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3 font-bold">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {exp.technologies.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366f1' }}>
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

/* ─── Main ─── */
const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [selected, setSelected]       = useState(null);
  const [activeIdx, setActiveIdx]     = useState(null);

  useEffect(() => {
    api.get('/experience')
      .then(r => setExperiences(r.data.data || []))
      .catch(() => {});
  }, []);

  const open  = (exp, i) => { setSelected(exp); setActiveIdx(i); };
  const close = ()       => { setSelected(null); setActiveIdx(null); };

  const n    = experiences.length;
  const VH   = svgH(n);
  const path = buildPath(n);

  return (
    <section id="experience"
      className="relative overflow-hidden py-24"
      style={{ background: 'linear-gradient(160deg,#f0f4ff 0%,#faf5ff 48%,#f0f9ff 100%)' }}
    >
      {/* blobs */}
      {[
        { w:520, h:520, bg:'radial-gradient(circle,#c7d2fe,#e0e7ff)', top:'-130px', left:'-170px' },
        { w:400, h:400, bg:'radial-gradient(circle,#ddd6fe,#ede9fe)', top:'20%',    right:'-120px' },
        { w:340, h:340, bg:'radial-gradient(circle,#bae6fd,#e0f2fe)', bottom:'5%',  left:'10%' },
        { w:260, h:260, bg:'radial-gradient(circle,#fbcfe8,#fce7f3)', bottom:'18%', right:'6%' },
      ].map((b, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{ width:b.w, height:b.h, background:b.bg,
            filter:'blur(72px)', opacity:0.48,
            top:b.top, bottom:b.bottom, left:b.left, right:b.right }} />
      ))}

      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-16">

        {/* heading */}
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} className="mb-14 max-w-xl">
          <p className="text-indigo-400 text-sm font-mono uppercase tracking-widest mb-2">
            // career journey
          </p>
          <h2 className="text-4xl sm:text-5xl font-black"
            style={{ background:'linear-gradient(135deg,#1e1b4b,#6366f1,#a855f7)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Work Experience
          </h2>
          <p className="text-gray-400 text-sm mt-3">
            Click a card to explore each role in detail
          </p>
        </motion.div>

        {n === 0 ? (
          <p className="text-center py-24 text-gray-400">
            Career journey will appear once experience is added from the admin panel.
          </p>
        ) : (
          /*
            Full-width SVG. Everything — path, dots, cards — lives inside
            the same coordinate system. No HTML/SVG mismatch.
          */
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full"
            style={{ display:'block', overflow:'visible' }}
          >
            <defs>
              <linearGradient id="pg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.9" />
                <stop offset="40%"  stopColor="#a855f7" stopOpacity="0.9" />
                <stop offset="75%"  stopColor="#06b6d4" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
              </linearGradient>

              <filter id="path-glow" x="-10%" y="-30%" width="120%" height="160%">
                <feGaussianBlur stdDeviation="6" result="b" />
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="dot-glow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="rgba(99,102,241,0.12)" />
              </filter>
            </defs>

            {/* ── PATH LAYERS ── */}
            {/* outer glow */}
            <path d={path} fill="none" stroke="url(#pg)" strokeWidth="28"
              strokeLinecap="round" strokeLinejoin="round"
              opacity="0.12" filter="url(#path-glow)" />
            {/* mid body */}
            <path d={path} fill="none" stroke="url(#pg)" strokeWidth="12"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
            {/* bright inner line */}
            <path d={path} fill="none" stroke="white" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />

            {/* ── START label (above first pill, centred) ── */}
            <g>
              <rect x={CX - 64} y={8} width={128} height={30} rx={15}
                fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.35)" strokeWidth="1.5" />
              <text x={CX} y={28} textAnchor="middle" fontSize="12" fontWeight="800"
                fontFamily="system-ui,sans-serif" fill="#6366f1">▲  START OF JOURNEY</text>
            </g>

            {/* ── EXPERIENCE CARDS + DOTS ── */}
            {experiences.map((exp, i) => {
              const cy       = pillY(i);
              const dot      = dotAt(i);
              const isLeft   = i % 2 === 0;   // even → card on left side
              const isActive = activeIdx === i;

              // card position — strictly outside the pill zone
              const cardX = isLeft ? LEFT_CARD_X : RIGHT_CARD_X;
              const cardY = cy - CARD_H / 2 - 10;

              // connector line from dot to card edge
              const connEndX = isLeft
                ? cardX + CARD_W          // right edge of left card
                : cardX;                  // left edge of right card

              return (
                <g key={exp._id || i}>

                  {/* ── connector line dot→card ── */}
                  <line
                    x1={dot.x} y1={dot.y}
                    x2={connEndX} y2={cy}
                    stroke={isActive ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.2)'}
                    strokeWidth="1.5"
                    strokeDasharray="5 3"
                    style={{ transition: 'stroke 0.3s' }}
                  />

                  {/* ── dot ── */}
                  {isActive && (
                    <motion.circle cx={dot.x} cy={dot.y} r={20}
                      fill="rgba(99,102,241,0.15)"
                      animate={{ r:[20,32,20], opacity:[0.6,0,0.6] }}
                      transition={{ duration:1.8, repeat:Infinity }}
                    />
                  )}
                  <circle cx={dot.x} cy={dot.y} r={isActive ? 13 : 8}
                    fill={isActive ? '#6366f1' : 'white'}
                    stroke={isActive ? 'white' : 'rgba(99,102,241,0.55)'}
                    strokeWidth={isActive ? 2.5 : 2}
                    filter={isActive ? 'url(#dot-glow)' : undefined}
                    style={{ transition:'all 0.4s' }}
                  />
                  <circle cx={dot.x} cy={dot.y} r={isActive ? 5 : 3}
                    fill={isActive ? 'white' : '#6366f1'}
                    opacity={isActive ? 1 : 0.65}
                    style={{ transition:'all 0.4s' }}
                  />
                  {/* index number */}
                  <text x={dot.x} y={dot.y + (isActive ? 4 : 3.5)}
                    textAnchor="middle" fontSize={isActive ? 7 : 6}
                    fontWeight="900" fontFamily="monospace"
                    fill={isActive ? 'white' : 'rgba(99,102,241,0.8)'}
                    style={{ transition:'all 0.4s' }}>
                    {String(i + 1).padStart(2, '0')}
                  </text>

                  {/* ── CARD via foreignObject ── */}
                  <foreignObject
                    x={cardX} y={cardY}
                    width={CARD_W} height={CARD_H + 80}
                    style={{ overflow: 'visible' }}
                  >
                    {/* xmlns required for foreignObject in SVG */}
                    <div xmlns="http://www.w3.org/1999/xhtml">
                      <motion.button
                        onClick={() => open(exp, i)}
                        initial={{ opacity:0, x: isLeft ? -40 : 40 }}
                        whileInView={{ opacity:1, x:0 }}
                        viewport={{ once:true, margin:'-30px' }}
                        transition={{ delay: i*0.1, type:'spring', stiffness:240, damping:26 }}
                        whileHover={{ scale:1.03 }}
                        whileTap={{ scale:0.97 }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          borderRadius: 18,
                          padding: '14px 16px',
                          cursor: 'pointer',
                          background: isActive
                            ? 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.08))'
                            : 'rgba(255,255,255,0.92)',
                          border: `1.5px solid ${isActive ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.15)'}`,
                          boxShadow: isActive
                            ? '0 12px 48px rgba(99,102,241,0.22)'
                            : '0 4px 32px rgba(0,0,0,0.08)',
                          backdropFilter: 'blur(20px)',
                          transition: 'all 0.3s',
                        }}
                      >
                        {/* top row: logo + info + person icon */}
                        <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
                          {exp.companyLogo ? (
                            <img src={exp.companyLogo} alt={exp.company}
                              style={{ width:40, height:40, borderRadius:10, objectFit:'cover',
                                border:'1px solid rgba(99,102,241,0.15)', flexShrink:0 }} />
                          ) : (
                            <div style={{ width:40, height:40, borderRadius:10, flexShrink:0,
                              display:'flex', alignItems:'center', justifyContent:'center',
                              background:'linear-gradient(135deg,#e0e7ff,#ede9fe)',
                              border:'1px solid rgba(99,102,241,0.2)' }}>
                              <svg viewBox="0 0 20 20" width="18" height="18" fill="#6366f1">
                                <path d="M6 6a4 4 0 108 0A4 4 0 006 6zM2 17a8 8 0 0116 0H2z"/>
                              </svg>
                            </div>
                          )}

                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase',
                              letterSpacing:'0.08em', color:'#6366f1',
                              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {exp.company}
                            </p>
                            <p style={{ fontSize:13, fontWeight:700, color:'#1e1b4b',
                              lineHeight:1.3, marginTop:2,
                              display:'-webkit-box', WebkitLineClamp:2,
                              WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                              {exp.role}
                            </p>
                          </div>

                          <div style={{ width:28, height:28, borderRadius:8, flexShrink:0,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            background:'linear-gradient(135deg,#ddd6fe,#c7d2fe)',
                            border:'1px solid rgba(99,102,241,0.22)' }}>
                            <svg viewBox="0 0 20 20" width="13" height="13" fill="#6366f1">
                              <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0H3z"/>
                            </svg>
                          </div>
                        </div>

                        {/* date row */}
                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
                          <svg viewBox="0 0 16 16" width="10" height="10" fill="#94a3b8">
                            <rect x="1" y="3" width="14" height="12" rx="2" />
                            <path d="M5 1v4M11 1v4M1 7h14" stroke="#94a3b8" strokeWidth="1.5" fill="none"/>
                          </svg>
                          <span style={{ fontSize:11, color:'#94a3b8', fontFamily:'monospace' }}>
                            {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                          </span>
                          {exp.isCurrent && (
                            <span style={{ width:6, height:6, borderRadius:'50%',
                              background:'#34d399', display:'inline-block',
                              animation:'pulse 1.5s infinite' }} />
                          )}
                        </div>

                        {/* tech chips — inside card */}
                        {exp.technologies?.length > 0 && (
                          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                            {exp.technologies.slice(0, 4).map((t, ti) => (
                              <span key={ti} style={{
                                padding:'2px 8px', borderRadius:6, fontSize:10,
                                fontWeight:600, color:'#6366f1',
                                background:'rgba(99,102,241,0.08)',
                                border:'1px solid rgba(99,102,241,0.2)',
                              }}>{t}</span>
                            ))}
                          </div>
                        )}
                      </motion.button>
                    </div>
                  </foreignObject>
                </g>
              );
            })}

            {/* ── PRESENT label ── */}
            <g>
              <rect x={CX - 72} y={VH - 42} width={144} height={30} rx={15}
                fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.38)" strokeWidth="1.5" />
              <text x={CX} y={VH - 22} textAnchor="middle" fontSize="12" fontWeight="800"
                fontFamily="system-ui,sans-serif" fill="#059669">●  PRESENT</text>
            </g>
          </svg>
        )}
      </div>

      {selected && <DetailModal exp={selected} onClose={close} />}
    </section>
  );
};

export default Experience;
