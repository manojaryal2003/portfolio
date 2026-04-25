import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBriefcase, FaCalendarAlt, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../../utils/api';

/* ─── Detail Modal ─── */
const DetailModal = ({ exp, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="glass-strong rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto"
        style={{ border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 0 60px rgba(99,102,241,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 w-full rounded-t-2xl" style={{ background: 'linear-gradient(90deg,#6366f1,#a855f7,#ec4899)' }} />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            {exp.companyLogo ? (
              <img src={exp.companyLogo} alt={exp.company} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-white/10" />
            ) : (
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
                <FaBriefcase className="text-indigo-400" size={22} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-white leading-tight">{exp.role}</h3>
              <p className="text-indigo-400 font-semibold text-sm mt-0.5">{exp.company}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-gray-500 text-xs font-mono">
                  <FaCalendarAlt size={9} />
                  {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                </span>
                {exp.isCurrent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                    ● CURRENT
                  </span>
                )}
                {exp.location && (
                  <span className="flex items-center gap-1 text-gray-600 text-xs">
                    <FaMapMarkerAlt size={9} /> {exp.location}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-xl text-gray-500 hover:text-white transition-colors flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <FaTimes size={14} />
            </button>
          </div>

          {exp.description && (
            <p className="text-gray-400 text-sm leading-relaxed mb-4 pb-4 border-b border-white/5">{exp.description}</p>
          )}

          {exp.responsibilities?.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3 font-bold">Key Responsibilities</p>
              <ul className="space-y-2.5">
                {exp.responsibilities.map((r, i) => (
                  <motion.li key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 text-sm text-gray-300"
                  >
                    <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {r}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {exp.technologies?.length > 0 && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3 font-bold">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {exp.technologies.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
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

/* ─── Palette per index ─── */
const PALETTES = [
  { bg: '#6366f1', dark: '#4338ca', light: '#a5b4fc', glow: 'rgba(99,102,241,0.7)'   },
  { bg: '#a855f7', dark: '#7c3aed', light: '#d8b4fe', glow: 'rgba(168,85,247,0.7)'  },
  { bg: '#ec4899', dark: '#be185d', light: '#f9a8d4', glow: 'rgba(236,72,153,0.7)'  },
  { bg: '#10b981', dark: '#059669', light: '#6ee7b7', glow: 'rgba(16,185,129,0.7)'  },
  { bg: '#f59e0b', dark: '#d97706', light: '#fde68a', glow: 'rgba(245,158,11,0.7)'  },
  { bg: '#06b6d4', dark: '#0891b2', light: '#a5f3fc', glow: 'rgba(6,182,212,0.7)'   },
];

/* ─── SVG Avatar (person with number badge) ─── */
const PersonAvatar = ({ col, index, isActive, isCurrent }) => (
  <svg width="52" height="72" viewBox="0 0 52 72" fill="none"
    style={{
      filter: isActive
        ? `drop-shadow(0 0 14px ${col.glow}) drop-shadow(0 0 6px ${col.glow})`
        : `drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
      transition: 'filter 0.3s',
    }}>
    {/* shadow under feet */}
    <ellipse cx="26" cy="70" rx="11" ry="3.5" fill="rgba(0,0,0,0.35)" />

    {/* legs */}
    <rect x="18" y="50" width="7" height="16" rx="3.5" fill={col.dark} />
    <rect x="27" y="50" width="7" height="16" rx="3.5" fill={col.dark} />

    {/* body */}
    <rect x="14" y="30" width="24" height="24" rx="6" fill={col.bg} />
    {/* shirt collar detail */}
    <path d="M22 30 L26 36 L30 30" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />

    {/* left arm */}
    <rect x="6" y="31" width="8" height="14" rx="4" fill={col.bg}
      style={{ transformOrigin: '14px 36px', transform: isActive ? 'rotate(-30deg)' : 'rotate(15deg)', transition: 'transform 0.4s' }} />
    {/* right arm */}
    <rect x="38" y="31" width="8" height="14" rx="4" fill={col.bg}
      style={{ transformOrigin: '38px 36px', transform: isActive ? 'rotate(30deg)' : 'rotate(-15deg)', transition: 'transform 0.4s' }} />

    {/* neck */}
    <rect x="22" y="24" width="8" height="8" rx="3" fill={col.bg} />

    {/* head */}
    <circle cx="26" cy="16" r="14" fill={col.bg} />
    {/* face shine */}
    <circle cx="20" cy="11" r="4" fill="rgba(255,255,255,0.12)" />

    {/* eyes */}
    <circle cx="21" cy="14" r="2.5" fill="white" />
    <circle cx="31" cy="14" r="2.5" fill="white" />
    <circle cx={isActive ? "22" : "21.5"} cy="14" r="1.2" fill="#1e1b4b" />
    <circle cx={isActive ? "32" : "31.5"} cy="14" r="1.2" fill="#1e1b4b" />
    {/* eye shine */}
    <circle cx="22" cy="13" r="0.6" fill="white" />
    <circle cx="32" cy="13" r="0.6" fill="white" />

    {/* smile */}
    <path d={isActive ? "M20 20 Q26 25 32 20" : "M20 20 Q26 23 32 20"}
      stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" fill="none" />

    {/* number badge on chest */}
    <circle cx="26" cy="40" r="7" fill="rgba(0,0,0,0.3)" />
    <circle cx="26" cy="40" r="6" fill={col.dark} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    <text x="26" y="44" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="monospace">
      {String(index + 1).padStart(2, '0')}
    </text>

    {/* current star crown */}
    {isCurrent && (
      <>
        <text x="26" y="-1" textAnchor="middle" fontSize="10" fill="#fbbf24">★</text>
        <text x="14" y="4" textAnchor="middle" fontSize="7" fill="#fbbf24">✦</text>
        <text x="38" y="4" textAnchor="middle" fontSize="7" fill="#fbbf24">✦</text>
      </>
    )}
  </svg>
);

/* ─── Info card that floats beside each checkpoint ─── */
const InfoCard = ({ exp, col, side, index, onClick, isActive }) => (
  <motion.button
    onClick={onClick}
    initial={{ opacity: 0, x: side === 'left' ? -40 : 40 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.15 + 0.2, type: 'spring', stiffness: 260, damping: 24 }}
    whileHover={{ scale: 1.03, y: -2 }}
    className="relative text-left w-52 rounded-xl p-3.5 cursor-pointer"
    style={{
      background: isActive
        ? `linear-gradient(135deg, ${col.dark}cc, ${col.bg}99)`
        : 'rgba(15,15,40,0.85)',
      border: `1px solid ${isActive ? col.bg : 'rgba(255,255,255,0.08)'}`,
      boxShadow: isActive ? `0 0 24px ${col.glow}` : '0 4px 20px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(16px)',
      transition: 'all 0.3s',
    }}
  >
    {/* number chip */}
    <div className="flex items-center gap-2 mb-2">
      <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black"
        style={{ background: col.bg, color: 'white' }}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="text-[10px] font-mono uppercase tracking-widest"
        style={{ color: col.light }}>{exp.startDate}</span>
      {exp.isCurrent && (
        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      )}
    </div>

    <p className="text-white font-bold text-sm leading-tight mb-0.5 line-clamp-2">{exp.role}</p>
    <p className="text-xs font-medium" style={{ color: col.light }}>{exp.company}</p>

    {exp.description && (
      <p className="text-gray-500 text-[11px] mt-2 leading-relaxed line-clamp-2">{exp.description}</p>
    )}

    <div className="mt-2.5 flex items-center gap-1.5">
      <span className="text-[10px] font-semibold" style={{ color: col.light }}>View details</span>
      <span className="text-[10px]" style={{ color: col.light }}>→</span>
    </div>

    {/* connector arrow pointing toward road */}
    <div
      className="absolute top-1/2 -translate-y-1/2"
      style={{
        [side === 'left' ? 'right' : 'left']: -8,
        width: 0, height: 0,
        borderTop: '7px solid transparent',
        borderBottom: '7px solid transparent',
        [side === 'left' ? 'borderLeft' : 'borderRight']: `8px solid ${isActive ? col.bg : 'rgba(255,255,255,0.08)'}`,
      }}
    />
  </motion.button>
);

/* ─── Single checkpoint row ─── */
const CheckpointRow = ({ exp, index, total, isActive, onOpen }) => {
  const col = exp.isCurrent
    ? { bg: '#10b981', dark: '#065f46', light: '#6ee7b7', glow: 'rgba(16,185,129,0.7)' }
    : PALETTES[index % PALETTES.length];

  const cardOnLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className="relative flex items-center justify-center"
      style={{ minHeight: 120 }}
    >
      {/* vertical road line through center */}
      {index < total - 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full z-0"
          style={{ width: 60, height: 80, background: 'linear-gradient(to bottom, #1a1a3e, #0f0f2a)', borderLeft: '2px solid rgba(99,102,241,0.2)', borderRight: '2px solid rgba(99,102,241,0.2)' }} />
      )}

      {/* LEFT side */}
      <div className="flex-1 flex justify-end pr-6">
        {cardOnLeft ? (
          <InfoCard exp={exp} col={col} side="left" index={index} onClick={onOpen} isActive={isActive} />
        ) : (
          <div className="w-52" />
        )}
      </div>

      {/* Center avatar + road node */}
      <div className="relative flex flex-col items-center" style={{ width: 100, zIndex: 10 }}>
        {/* road circle node */}
        <motion.div
          className="absolute"
          style={{
            bottom: -14,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${col.bg}, ${col.dark})`,
            border: `3px solid ${col.light}`,
            boxShadow: isActive ? `0 0 24px ${col.glow}, 0 0 8px ${col.glow}` : `0 0 10px ${col.glow}`,
            zIndex: 2,
          }}
          animate={isActive ? { scale: [1, 1.25, 1] } : {}}
          transition={{ duration: 1.2, repeat: Infinity }}
        />

        {/* pulsing ring on active */}
        {isActive && (
          <motion.div
            className="absolute"
            style={{ bottom: -14, width: 28, height: 28, borderRadius: '50%', border: `2px solid ${col.bg}`, zIndex: 1 }}
            animate={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* clickable avatar */}
        <motion.button
          onClick={onOpen}
          whileHover={{ y: -8, scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative"
          title={`${exp.role} @ ${exp.company}`}
          style={{ marginBottom: 14 }}
        >
          {/* glow under feet */}
          <div style={{
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: 48, height: 12, borderRadius: '50%',
            background: col.glow, filter: 'blur(8px)',
            opacity: isActive ? 0.9 : 0.4,
          }} />
          <PersonAvatar col={col} index={index} isActive={isActive} isCurrent={exp.isCurrent} />
        </motion.button>
      </div>

      {/* RIGHT side */}
      <div className="flex-1 flex justify-start pl-6">
        {!cardOnLeft ? (
          <InfoCard exp={exp} col={col} side="right" index={index} onClick={onOpen} isActive={isActive} />
        ) : (
          <div className="w-52" />
        )}
      </div>
    </motion.div>
  );
};

/* ─── Winding road SVG in center column ─── */
const CenterRoad = ({ count }) => {
  if (count === 0) return null;
  const rowH = 130;
  const totalH = count * rowH + 80;

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none" style={{ width: 100, height: totalH, zIndex: 0 }}>
      <svg width="100" height={totalH} viewBox={`0 0 100 ${totalH}`}>
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a3e" />
            <stop offset="50%" stopColor="#12123a" />
            <stop offset="100%" stopColor="#0f0f2a" />
          </linearGradient>
          <linearGradient id="edgeL" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.5)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0.5)" />
          </linearGradient>
        </defs>

        {/* road fill */}
        <rect x="20" y="0" width="60" height={totalH} fill="url(#rg)" />
        {/* left edge */}
        <line x1="20" y1="0" x2="20" y2={totalH} stroke="url(#edgeL)" strokeWidth="2" />
        {/* right edge */}
        <line x1="80" y1="0" x2="80" y2={totalH} stroke="url(#edgeL)" strokeWidth="2" />

        {/* center dashed lane */}
        <line x1="50" y1="0" x2="50" y2={totalH}
          stroke="rgba(129,140,248,0.5)" strokeWidth="2"
          strokeDasharray="14 10" />

        {/* small lane markers */}
        <line x1="35" y1="0" x2="35" y2={totalH}
          stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <line x1="65" y1="0" x2="65" y2={totalH}
          stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

        {/* top cap */}
        <ellipse cx="50" cy="10" rx="30" ry="10" fill="#1a1a3e" />
        {/* bottom cap */}
        <ellipse cx="50" cy={totalH - 10} rx="30" ry="10" fill="#0f0f2a" />
      </svg>
    </div>
  );
};

/* ─── Main ─── */
const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [selected, setSelected] = useState(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get('/experience').then(res => setExperiences(res.data.data)).catch(() => {});
  }, []);

  const handleOpen = (exp) => { setActive(exp._id); setSelected(exp); };
  const handleClose = () => { setSelected(null); setActive(null); };

  return (
    <section id="experience" className="section-padding relative overflow-hidden bg-experience">
      {/* watermark */}
      <div className="absolute top-8 right-0 text-[8rem] font-black select-none pointer-events-none leading-none"
        style={{ color: 'var(--watermark)' }}>JOURNEY</div>

      {/* ambient glows */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(168,85,247,0.07) 0%,transparent 70%)', filter: 'blur(50px)' }} />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* heading */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <p className="text-indigo-400 text-sm font-mono uppercase tracking-widest mb-2">// career journey</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">
            Work <span className="text-gradient">Experience</span>
          </h2>
          <p className="text-gray-500 text-sm mt-3 flex items-center gap-2">
            <span className="w-4 h-px bg-gray-700 inline-block" />
            Click an avatar or card to explore each role
            <span className="w-4 h-px bg-gray-700 inline-block" />
          </p>
        </motion.div>

        {experiences.length > 0 ? (
          <div className="relative">
            {/* START label */}
            <div className="flex justify-center mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black font-mono uppercase tracking-widest"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#818cf8' }}>
                ▲ Start of Journey
              </span>
            </div>

            {/* center road */}
            <CenterRoad count={experiences.length} />

            {/* checkpoint rows */}
            <div className="relative flex flex-col gap-4" style={{ zIndex: 5 }}>
              {experiences.map((exp, i) => (
                <CheckpointRow
                  key={exp._id}
                  exp={exp}
                  index={i}
                  total={experiences.length}
                  isActive={active === exp._id}
                  onOpen={() => handleOpen(exp)}
                />
              ))}
            </div>

            {/* NOW label */}
            <div className="flex justify-center mt-8">
              <motion.span
                animate={{ boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 20px rgba(16,185,129,0.5)', '0 0 0px rgba(16,185,129,0)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-3 py-1 rounded-full text-[10px] font-black font-mono uppercase tracking-widest flex items-center gap-1.5"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Present — Still Growing
              </motion.span>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 text-gray-600">
            Career journey will appear once experience is added from the admin panel.
          </div>
        )}
      </div>

      {selected && <DetailModal exp={selected} onClose={handleClose} />}
    </section>
  );
};

export default Experience;
