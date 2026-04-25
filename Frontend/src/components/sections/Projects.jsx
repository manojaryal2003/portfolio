import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGithub, FaExternalLinkAlt, FaStar, FaCalendar,
  FaTimes, FaChevronLeft, FaChevronRight,
  FaPlayCircle, FaImage, FaVideo, FaCode, FaLayerGroup,
} from 'react-icons/fa';
import api from '../../utils/api';

const toAbsoluteUrl = (url) => {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

/* ─── Category color map ─── */
const CAT_COLORS = {
  'Web Applications':  { bg: '#6366f1', glow: 'rgba(99,102,241,0.55)'  },
  'E-commerce':        { bg: '#a855f7', glow: 'rgba(168,85,247,0.55)'  },
  'Admin Dashboards':  { bg: '#06b6d4', glow: 'rgba(6,182,212,0.55)'   },
  'Mobile Apps':       { bg: '#f59e0b', glow: 'rgba(245,158,11,0.55)'  },
  'Client Projects':   { bg: '#ec4899', glow: 'rgba(236,72,153,0.55)'  },
  'Other':             { bg: '#10b981', glow: 'rgba(16,185,129,0.55)'  },
};
const FALLBACK = { bg: '#6366f1', glow: 'rgba(99,102,241,0.55)' };
const getCol = (cat) => CAT_COLORS[cat] || FALLBACK;

/* ─── SVG snake constants ─── */
const VW    = 1000;
const LEFT  = 200;
const RIGHT = 800;
const ROW_H = 110;   // compact — many projects
const PAD_T = 60;
const PAD_B = 60;

const stopY = (i) => PAD_T + i * ROW_H;
const stopX = (i) => i % 2 === 0 ? RIGHT : LEFT;
const svgH  = (n) => n ? stopY(n - 1) + PAD_B : 200;

const buildPath = (n) => {
  if (!n) return '';
  const p = [];
  for (let i = 0; i < n; i++) {
    const x = stopX(i), y = stopY(i);
    if (i === 0) p.push(`M ${x} ${y}`);
    if (i < n - 1) {
      const nx = stopX(i + 1), ny = stopY(i + 1), my = (y + ny) / 2;
      p.push(`C ${x} ${my}, ${nx} ${my}, ${nx} ${ny}`);
    }
  }
  return p.join(' ');
};

/* ─── Gallery lightbox (kept from original) ─── */
const ProjectGallery = ({ project, onClose }) => {
  const images = project.images?.length
    ? project.images
    : project.image ? [{ url: project.image }] : [];
  const hasVideo = !!project.video?.url;
  const mediaList = [
    ...images.map(img => ({ type: 'image', url: img.url })),
    ...(hasVideo ? [{ type: 'video', url: project.video.url }] : []),
  ];
  const [current, setCurrent] = useState(0);
  const total = mediaList.length;
  const prev = useCallback(() => setCurrent(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent(i => (i + 1) % total), [total]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const active = mediaList[current];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex flex-col bg-black/96"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <div>
          <h3 className="btn-white-text font-bold text-lg" style={{ color: '#fff' }}>{project.title}</h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{current + 1} / {total}</p>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl btn-white-text transition-colors"
          style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
          <FaTimes size={18} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center relative px-4 min-h-0" onClick={e => e.stopPropagation()}>
        {total > 1 && (
          <button onClick={prev}
            className="absolute left-4 z-10 p-3 rounded-full btn-white-text transition-colors"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
            <FaChevronLeft size={18} />
          </button>
        )}
        <AnimatePresence mode="wait">
          <motion.div key={current}
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
            className="w-full h-full flex items-center justify-center">
            {active?.type === 'video' ? (
              <video src={active.url} controls autoPlay
                className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
                style={{ maxHeight: 'calc(100vh - 200px)' }} onClick={e => e.stopPropagation()} />
            ) : active?.type === 'image' ? (
              <img src={active.url} alt={project.title}
                className="max-w-full max-h-full rounded-xl shadow-2xl object-contain select-none"
                style={{ maxHeight: 'calc(100vh - 200px)' }} draggable={false} />
            ) : (
              <div className="text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <FaImage size={48} className="mx-auto mb-3 opacity-30" />
                <p>No media available</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {total > 1 && (
          <button onClick={next}
            className="absolute right-4 z-10 p-3 rounded-full btn-white-text transition-colors"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
            <FaChevronRight size={18} />
          </button>
        )}
      </div>
      {total > 1 && (
        <div className="flex-shrink-0 px-4 py-3" onClick={e => e.stopPropagation()}>
          <div className="flex gap-2 overflow-x-auto justify-center">
            {mediaList.map((item, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === current ? 'border-indigo-500 scale-105' : 'border-transparent opacity-50'}`}>
                {item.type === 'video'
                  ? <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(88,28,135,0.6)' }}>
                      <FaPlayCircle size={18} style={{ color: '#c084fc' }} />
                    </div>
                  : <img src={item.url} alt="" className="w-full h-full object-cover" />}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex-shrink-0 flex items-center justify-center gap-4 pb-5" onClick={e => e.stopPropagation()}>
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm btn-white-text transition-colors"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            <FaGithub size={15} /> Source Code
          </a>
        )}
        {project.liveUrl && (
          <a href={toAbsoluteUrl(project.liveUrl)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm btn-white-text transition-colors hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff' }}>
            <FaExternalLinkAlt size={13} /> Live Demo
          </a>
        )}
      </div>
    </motion.div>
  );
};

/* ─── Full Project Detail Modal ─── */
const ProjectDetail = ({ project, onClose, onGallery }) => {
  const col = getCol(project.category);
  const images = project.images?.length ? project.images : project.image ? [{ url: project.image }] : [];
  const hasVideo = !!project.video?.url;
  const mediaCount = images.length + (hasVideo ? 1 : 0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{
          background: 'var(--bg-surface-strong)',
          border: `1.5px solid ${col.bg}33`,
          boxShadow: `0 32px 100px ${col.glow}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* gradient top bar */}
        <div className="h-1 w-full rounded-t-3xl"
          style={{ background: `linear-gradient(90deg, ${col.bg}, #a855f7, #06b6d4)` }} />

        {/* hero image */}
        <div className="relative w-full h-52 overflow-hidden">
          {images[0]?.url ? (
            <img src={images[0].url} alt={project.title}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${col.bg}22, ${col.bg}44)` }}>
              <FaCode size={48} style={{ color: col.bg, opacity: 0.4 }} />
            </div>
          )}
          {/* dark overlay for readability */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />

          {/* badges on image */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: col.bg }}>
              {project.category}
            </span>
            {project.isFeatured && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900 flex items-center gap-1">
                <FaStar size={9} /> Featured
              </span>
            )}
          </div>

          {/* close btn */}
          <button onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-xl btn-white-text transition-colors"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            <FaTimes size={15} />
          </button>

          {/* media count + gallery btn */}
          {mediaCount > 0 && (
            <button onClick={() => onGallery(project)}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-white-text text-xs font-semibold transition-colors"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
              {hasVideo ? <FaVideo size={11} /> : <FaImage size={11} />}
              {mediaCount} media · View Gallery
            </button>
          )}
        </div>

        {/* content */}
        <div className="p-6">
          {/* title + date */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-2xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
              {project.title}
            </h2>
            {project.completionDate && (
              <span className="flex items-center gap-1.5 text-xs font-mono flex-shrink-0 mt-1"
                style={{ color: 'var(--text-muted)' }}>
                <FaCalendar size={9} />
                {new Date(project.completionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* description */}
          {project.description && (
            <p className="text-sm leading-relaxed mb-5"
              style={{ color: 'var(--text-secondary)' }}>
              {project.description}
            </p>
          )}

          {/* tech stack */}
          {project.technologies?.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-widest font-bold mb-2.5"
                style={{ color: 'var(--text-muted)' }}>Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: `${col.bg}15`, border: `1px solid ${col.bg}35`, color: col.bg }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* thumbnail strip if multiple images */}
          {images.length > 1 && (
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-widest font-bold mb-2.5"
                style={{ color: 'var(--text-muted)' }}>Screenshots</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.slice(0, 6).map((img, i) => (
                  <button key={i} onClick={() => onGallery(project)}
                    className="flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all hover:scale-105"
                    style={{ borderColor: col.bg, opacity: 0.85 }}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" style={{ display: 'block' }} />
                  </button>
                ))}
                {images.length > 6 && (
                  <button onClick={() => onGallery(project)}
                    className="flex-shrink-0 w-20 h-14 rounded-xl flex items-center justify-center text-xs font-bold border-2"
                    style={{ borderColor: col.bg, color: col.bg, background: `${col.bg}15` }}>
                    +{images.length - 6} more
                  </button>
                )}
              </div>
            </div>
          )}

          {/* action buttons */}
          <div className="flex flex-wrap gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            {project.liveUrl && (
              <a href={toAbsoluteUrl(project.liveUrl)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold btn-white-text transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${col.bg}, #a855f7)`, boxShadow: `0 4px 16px ${col.glow}`, color: '#fff' }}>
                <FaExternalLinkAlt size={12} /> Live Demo
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }}>
                <FaGithub size={14} /> Source Code
              </a>
            )}
            {mediaCount > 0 && (
              <button onClick={() => onGallery(project)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border)', color: 'var(--text-secondary)' }}>
                <FaImage size={13} /> Gallery ({mediaCount})
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Inline SVG Nepal flag: pole + two triangular pennants ─── */
const NepalFlag = ({ cx, cy, size = 10 }) => {
  const pw = size * 0.12;  // pole width
  const ph = size * 1.6;   // pole height
  const px = cx - pw / 2;
  const py = cy - size * 0.8;
  // top pennant (moon) – smaller
  const t1x = px + pw; const t1y = py;
  const t1w = size * 0.85; const t1h = size * 0.6;
  // bottom pennant (sun) – wider
  const t2x = px + pw; const t2y = py + t1h - 1;
  const t2w = size * 1.1; const t2h = size * 0.8;
  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* pole */}
      <rect x={px} y={py} width={pw} height={ph} fill="#4a3000" rx={pw / 2} />
      {/* top triangle */}
      <polygon
        points={`${t1x},${t1y} ${t1x},${t1y + t1h} ${t1x + t1w},${t1y + t1h * 0.55}`}
        fill="#dc143c" stroke="#003893" strokeWidth="1.5"
      />
      {/* moon on top pennant */}
      <circle cx={t1x + t1w * 0.32} cy={t1y + t1h * 0.42} r={size * 0.09} fill="white" />
      <circle cx={t1x + t1w * 0.42} cy={t1y + t1h * 0.32} r={size * 0.075} fill="#dc143c" />
      {/* bottom triangle */}
      <polygon
        points={`${t2x},${t2y} ${t2x},${t2y + t2h} ${t2x + t2w},${t2y + t2h * 0.5}`}
        fill="#dc143c" stroke="#003893" strokeWidth="1.5"
      />
      {/* sun on bottom pennant (simple star-like shape) */}
      <circle cx={t2x + t2w * 0.35} cy={t2y + t2h * 0.5} r={size * 0.1} fill="white" />
    </g>
  );
};

/* ─── Snake checkpoint label card — compact, title + category only ─── */
const CheckpointLabel = ({ project, x, isRight, y, col, index, isActive, onClick }) => {
  const CARD_W = 155;  // compact width
  const GAP    = 28;
  // isRight=true → dot is on RIGHT (x=800) → card goes to the RIGHT (outer)
  // isRight=false → dot is on LEFT (x=200) → card goes to the LEFT (outer)
  const cardX  = isRight ? x + GAP : x - CARD_W - GAP;

  return (
    <foreignObject
      x={cardX} y={y - 30}
      width={CARD_W} height={64}
      style={{ overflow: 'visible' }}
    >
      <div xmlns="http://www.w3.org/1999/xhtml">
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0, x: isRight ? 24 : -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ delay: index * 0.035, type: 'spring', stiffness: 280, damping: 26 }}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            borderRadius: 12,
            padding: '8px 12px',
            cursor: 'pointer',
            background: isActive
              ? `linear-gradient(135deg, ${col.bg}20, ${col.bg}0a)`
              : 'var(--bg-surface-strong)',
            border: `1.5px solid ${isActive ? col.bg + '70' : 'var(--border)'}`,
            boxShadow: isActive
              ? `0 4px 20px ${col.glow}`
              : '0 2px 10px rgba(0,0,0,0.06)',
            backdropFilter: 'blur(16px)',
            transition: 'all 0.22s',
          }}
        >
          {/* category chip */}
          <span style={{
            display: 'inline-block',
            fontSize: 8, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: col.bg,
            padding: '1px 6px', borderRadius: 4,
            background: col.bg + '18',
            marginBottom: 4,
          }}>
            {project.category}
          </span>
          {/* title */}
          <p style={{
            fontSize: 11, fontWeight: 700, lineHeight: 1.3,
            color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            margin: 0,
          }}>
            {project.isFeatured && <span style={{ color: '#f59e0b', marginRight: 3 }}>★</span>}
            {project.title}
          </p>
        </motion.button>
      </div>
    </foreignObject>
  );
};

/* ─── Main Projects Section ─── */
const Projects = () => {
  const [projects, setProjects]         = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selected, setSelected]         = useState(null);
  const [activeIdx, setActiveIdx]       = useState(null);
  const [galleryProject, setGalleryProject] = useState(null);

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data.data || [])).catch(() => {});
  }, []);

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];
  const filtered   = activeFilter === 'All' ? projects : projects.filter(p => p.category === activeFilter);
  const n          = filtered.length;
  const VH         = svgH(n);
  const path       = buildPath(n);

  const open  = (proj, i) => { setSelected(proj); setActiveIdx(i); };
  const close = ()        => { setSelected(null); setActiveIdx(null); };

  return (
    <section id="projects" className="section-padding relative overflow-hidden bg-page">
      <div className="max-w-7xl mx-auto">

        {/* heading */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-10">
          <p className="text-indigo-400 text-sm font-mono uppercase tracking-widest mb-2">// my work</p>
          <h2 className="text-4xl sm:text-5xl font-black" style={{ color: 'var(--text-primary)' }}>
            All <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Click any checkpoint to explore the project
          </p>
        </motion.div>

        {/* category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
            <motion.button key={cat} onClick={() => { setActiveFilter(cat); close(); }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                background: activeFilter === cat ? '#6366f1' : 'var(--bg-surface)',
                color: activeFilter === cat ? 'white' : 'var(--text-muted)',
                border: `1.5px solid ${activeFilter === cat ? '#6366f1' : 'var(--border)'}`,
              }}>
              {cat}
            </motion.button>
          ))}
        </div>

        {n === 0 ? (
          <p className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
            {projects.length === 0
              ? 'Projects will appear here once added from the admin panel.'
              : 'No projects in this category.'}
          </p>
        ) : (
          <>
            {/* START */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1.5px solid rgba(99,102,241,0.25)', color: '#6366f1' }}>
                ▲ Start
              </span>
            </motion.div>

            {/* SNAKE SVG */}
            <svg
              viewBox={`0 0 ${VW} ${VH}`}
              preserveAspectRatio="xMidYMid meet"
              className="w-full"
              style={{ display: 'block', overflow: 'visible' }}
            >
              <defs>
                {/* indigo → violet → purple → pink — matches site UI palette */}
                <linearGradient id="projGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%"   stopColor="#6366f1" />
                  <stop offset="35%"  stopColor="#818cf8" />
                  <stop offset="70%"  stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <filter id="proj-glow" x="-15%" y="-30%" width="130%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="b" />
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="dot-glow2" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="5" result="b" />
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* outer glow */}
              <path d={path} fill="none" stroke="url(#projGrad)" strokeWidth="24"
                strokeLinecap="round" strokeLinejoin="round"
                opacity="0.12" filter="url(#proj-glow)" />
              {/* dashed main stroke */}
              <path d={path} fill="none" stroke="url(#projGrad)" strokeWidth="5"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="16 9" opacity="0.65" />
              {/* solid thin centre */}
              <path d={path} fill="none" stroke="url(#projGrad)" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
              {/* white shimmer */}
              <path d={path} fill="none" stroke="white" strokeWidth="1"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.4"
                strokeDasharray="8 16" />

              {/* checkpoints + labels */}
              {filtered.map((proj, i) => {
                const x      = stopX(i);
                const y      = stopY(i);
                const isAct  = activeIdx === i;
                const col    = getCol(proj.category);
                // right dot (x=800) → card to the RIGHT (outer space)
                // left dot  (x=200) → card to the LEFT  (outer space)
                const labelRight = x === RIGHT;

                return (
                  <g key={proj._id || i}>
                    {/* pulse ring */}
                    {isAct && (
                      <motion.circle cx={x} cy={y} r={22}
                        fill={col.glow}
                        animate={{ r: [22, 34, 22], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                      />
                    )}

                    {/* dot */}
                    <circle cx={x} cy={y} r={isAct ? 14 : 11}
                      fill="white"
                      stroke={col.bg}
                      strokeWidth={isAct ? 2.5 : 2}
                      filter={isAct ? 'url(#dot-glow2)' : undefined}
                      style={{ transition: 'all 0.3s', cursor: 'pointer' }}
                      onClick={() => open(proj, i)}
                    />
                    {/* Standing Nepal flag SVG on each checkpoint */}
                    <g onClick={() => open(proj, i)} style={{ cursor: 'pointer' }}>
                      <NepalFlag cx={x} cy={y} size={isAct ? 12 : 9} />
                    </g>

                    {/* connector dashed line from dot to card */}
                    <line
                      x1={labelRight ? x + (isAct ? 14 : 11) : x - (isAct ? 14 : 11)} y1={y}
                      x2={labelRight ? x + 32 : x - 32} y2={y}
                      stroke={col.bg} strokeWidth="1.2" strokeDasharray="4 3"
                      opacity={isAct ? 0.7 : 0.35}
                      style={{ transition: 'opacity 0.3s' }}
                    />

                    {/* label card */}
                    <CheckpointLabel
                      project={proj}
                      x={x} y={y}
                      isRight={labelRight}
                      col={col}
                      index={i}
                      isActive={isAct}
                      onClick={() => open(proj, i)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* END */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} className="flex justify-center mt-4">
              <motion.span
                animate={{ boxShadow: ['0 0 0 rgba(99,102,241,0)', '0 0 20px rgba(99,102,241,0.35)', '0 0 0 rgba(99,102,241,0)'] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1.5px solid rgba(99,102,241,0.3)', color: '#6366f1' }}>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                {n} Project{n !== 1 ? 's' : ''}
              </motion.span>
            </motion.div>
          </>
        )}
      </div>

      {/* Project detail modal */}
      <AnimatePresence>
        {selected && (
          <ProjectDetail
            project={selected}
            onClose={close}
            onGallery={(p) => { setGalleryProject(p); }}
          />
        )}
      </AnimatePresence>

      {/* Gallery lightbox */}
      <AnimatePresence>
        {galleryProject && (
          <ProjectGallery project={galleryProject} onClose={() => setGalleryProject(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export { ProjectGallery };
export default Projects;
