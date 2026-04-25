import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGithub, FaExternalLinkAlt, FaStar, FaCalendar,
  FaTimes, FaChevronLeft, FaChevronRight,
  FaPlayCircle, FaImage, FaVideo, FaCode, FaLayerGroup,
  FaArrowRight, FaEye, FaRocket, FaAward, FaFilter
} from 'react-icons/fa';
import api from '../../utils/api';

const toAbsoluteUrl = (url) => {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

/* ─── Enhanced Category Colors ─── */
const CAT_COLORS = {
  'Web Applications':  { bg: '#6366f1', accent: '#818cf8', light: '#6366f133' },
  'E-commerce':        { bg: '#a855f7', accent: '#d8b4fe', light: '#a855f733' },
  'Admin Dashboards':  { bg: '#06b6d4', accent: '#22d3ee', light: '#06b6d433' },
  'Mobile Apps':       { bg: '#f59e0b', accent: '#fbbf24', light: '#f59e0b33' },
  'Client Projects':   { bg: '#ec4899', accent: '#f472b6', light: '#ec489933' },
  'Other':             { bg: '#10b981', accent: '#6ee7b7', light: '#10b98133' },
};
const FALLBACK = { bg: '#6366f1', accent: '#818cf8', light: '#6366f133' };
const getCol = (cat) => CAT_COLORS[cat] || FALLBACK;

/* ─── Enhanced Project Gallery Lightbox ─── */
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
                style={{ background: `linear-gradient(135deg, ${col.bg}, #a855f7)`, color: '#fff' }}>
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

/* ─── Modern Project Card with Image + Details Below ─── */
const ProjectCard = ({ project, col, onClick, index }) => {
  const images = project.images?.length ? project.images : project.image ? [{ url: project.image }] : [];
  const imageUrl = images[0]?.url || null;
  const hasMedia = images.length > 0 || project.video?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group flex flex-col overflow-hidden rounded-2xl"
      style={{
        height: '480px',
        background: 'var(--bg-surface-strong)',
        border: `1.5px solid ${col.bg}33`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Image Section — fixed height */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ height: '200px', background: `linear-gradient(135deg, ${col.bg}22, ${col.bg}44)` }}>
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaCode size={48} style={{ color: col.bg, opacity: 0.3 }} />
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: col.bg }}>
            {project.category}
          </span>
          {project.isFeatured && (
            <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-yellow-500 text-yellow-900">
              <FaStar size={10} /> Featured
            </span>
          )}
        </div>

        {/* Gallery count badge */}
        {hasMedia && (
          <button
            onClick={onClick}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
            style={{
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {project.video?.url ? <FaVideo size={11} /> : <FaImage size={11} />}
            {images.length + (project.video?.url ? 1 : 0)}
          </button>
        )}
      </div>

      {/* Content Section — fills remaining height */}
      <div className="flex flex-col flex-1 p-5 min-h-0">
        {/* Title — fixed 2-line height */}
        <h3 className="text-base font-black leading-tight mb-2 line-clamp-2" style={{ color: 'var(--text-primary)', minHeight: '2.5rem' }}>
          {project.title}
        </h3>

        {/* Description — fixed 3-line clamp */}
        <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)', minHeight: '2.5rem' }}>
          {project.description || ''}
        </p>

        {/* Tech Stack — fixed height area */}
        <div className="mb-3" style={{ minHeight: '3rem' }}>
          <p className="text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Stack
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(project.technologies || []).slice(0, 3).map((t, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                style={{
                  background: `${col.bg}22`,
                  border: `1px solid ${col.bg}55`,
                  color: col.bg,
                }}
              >
                {t}
              </span>
            ))}
            {(project.technologies?.length || 0) > 3 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Spacer pushes buttons to bottom */}
        <div className="flex-1" />

        {/* Action Buttons — 3 icon-only, centered */}
        <div className="flex items-center justify-center gap-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          {/* View / Gallery */}
          <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            title="View project"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all"
            style={{
              background: `linear-gradient(135deg, ${col.bg}, ${col.accent})`,
              boxShadow: `0 4px 12px ${col.bg}55`,
            }}
          >
            <FaEye size={15} />
          </motion.button>

          {/* GitHub */}
          <motion.a
            href={project.githubUrl || undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.stopPropagation(); if (!project.githubUrl) e.preventDefault(); }}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            title="GitHub repo"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all"
            style={{
              background: `linear-gradient(135deg, ${col.bg}, ${col.accent})`,
              boxShadow: `0 4px 12px ${col.bg}55`,
              opacity: project.githubUrl ? 1 : 0.35,
              cursor: project.githubUrl ? 'pointer' : 'not-allowed',
            }}
          >
            <FaGithub size={15} />
          </motion.a>

          {/* Live Demo */}
          <motion.a
            href={project.liveUrl ? toAbsoluteUrl(project.liveUrl) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.stopPropagation(); if (!project.liveUrl) e.preventDefault(); }}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            title="Live demo"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all"
            style={{
              background: `linear-gradient(135deg, ${col.bg}, ${col.accent})`,
              boxShadow: `0 4px 12px ${col.bg}55`,
              opacity: project.liveUrl ? 1 : 0.35,
              cursor: project.liveUrl ? 'pointer' : 'not-allowed',
            }}
          >
            <FaExternalLinkAlt size={13} />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Project Showcase Stats ─── */
const ProjectStats = ({ projects }) => {
  const stats = [
    { icon: FaRocket, label: 'Projects', value: projects.length },
    { icon: FaAward, label: 'Featured', value: projects.filter(p => p.isFeatured).length },
    { icon: FaCode, label: 'Categories', value: new Set(projects.map(p => p.category)).size },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 my-12"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          whileHover={{ y: -4 }}
          className="flex flex-col items-center p-4 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, var(--bg-surface-strong)22 0%, var(--bg-surface)22 100%)',
            border: '1.5px solid var(--border)',
          }}
        >
          <stat.icon size={24} style={{ color: '#6366f1', marginBottom: 8 }} />
          <p className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
            {stat.value}
          </p>
          <p className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>
            {stat.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
};

/* ─── Main Projects Section with Horizontal Scroll ─── */
const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [galleryProject, setGalleryProject] = useState(null);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data.data || [])).catch(() => {});
  }, []);

  const sorted = [...projects].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  const categories = ['All', ...Array.from(new Set(sorted.map(p => p.category).filter(Boolean)))];
  const filtered = activeFilter === 'All' ? sorted : sorted.filter(p => p.category === activeFilter);

  const handleCategoryChange = (cat) => {
    setActiveFilter(cat);
    // Reset scroll position when category changes
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [filtered]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 400;
      const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="projects" className="section-padding relative overflow-hidden bg-page">
      <div className="w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto mb-8"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>
            Showcasing {projects.length} imaginative web solutions.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto mb-10"
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: activeFilter === cat ? '#6366f1' : 'var(--bg-surface)',
                  color: activeFilter === cat ? 'white' : 'var(--text-primary)',
                  border: `1.5px solid ${activeFilter === cat ? '#6366f1' : 'var(--border)'}`,
                }}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Horizontal Scroll Container */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto text-center py-20"
          >
            <FaEye size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)' }}>
              {projects.length === 0 ? 'Projects will appear here once added from the admin panel.' : 'No projects in this category.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            {/* Left Scroll Button */}
            <AnimatePresence>
              {canScrollLeft && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => scroll('left')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-md transition-all hidden sm:flex items-center justify-center"
                  style={{
                    background: 'rgba(99,102,241,0.9)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <FaChevronLeft size={18} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Right Scroll Button */}
            <AnimatePresence>
              {canScrollRight && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={() => scroll('right')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-md transition-all hidden sm:flex items-center justify-center"
                  style={{
                    background: 'rgba(99,102,241,0.9)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <FaChevronRight size={18} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scroll-smooth"
              style={{
                scrollBehavior: 'smooth',
                scrollPaddingLeft: '40px',
                scrollPaddingRight: '40px',
              }}
            >
              <div className="flex gap-6 pb-4 px-4 sm:px-0 sm:pl-16 sm:pr-16 min-w-max">
                {filtered.map((project, i) => (
                  <div key={project._id || i} className="flex-shrink-0" style={{ width: '300px' }}>
                    <ProjectCard
                      project={project}
                      col={getCol(project.category)}
                      onClick={() => { setSelected(project); setGalleryProject(null); }}
                      index={i}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll Info */}
            <div className="text-center mt-6">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Scroll to see more projects →
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selected && (
          <ProjectDetail
            project={selected}
            onClose={() => setSelected(null)}
            onGallery={(p) => { setGalleryProject(p); }}
          />
        )}
      </AnimatePresence>

      {/* Gallery Lightbox */}
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
