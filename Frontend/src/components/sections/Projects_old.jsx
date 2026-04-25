import { useEffect, useState, useCallback } from 'react';
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


/* ─── Modern Interactive Project Card ─── */
const ProjectCard = ({ project, col, onClick, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const images = project.images?.length ? project.images : project.image ? [{ url: project.image }] : [];
  const imageUrl = images[0]?.url || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="group relative h-96 cursor-pointer overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, var(--bg-surface-strong) 0%, var(--bg-surface) 100%)',
        border: `1.5px solid ${col.bg}33`,
        boxShadow: isHovered ? `0 20px 60px ${col.bg}33` : '0 10px 30px rgba(0,0,0,0.1)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${col.bg}22, ${col.bg}44)` }}
          >
            <FaCode size={64} style={{ color: col.bg, opacity: 0.2 }} />
          </div>
        )}
        {/* Overlay */}
        <motion.div
          className="absolute inset-0"
          initial={{ background: 'rgba(0,0,0,0.3)' }}
          animate={{ background: isHovered ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.3)' }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        {/* Top badges */}
        <div className="flex flex-wrap gap-2 items-start justify-between">
          <div className="flex gap-2 flex-wrap">
            <motion.span
              className="px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-md"
              style={{
                background: `${col.bg}dd`,
                border: `1px solid ${col.accent}55`,
              }}
            >
              {project.category}
            </motion.span>
            {project.isFeatured && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-yellow-500 text-yellow-900 backdrop-blur-md"
              >
                <FaStar size={10} /> Featured
              </motion.span>
            )}
          </div>

          {/* Stats indicators */}
          <div className="flex gap-2 text-white text-xs opacity-75">
            {(project.images?.length || (project.image ? 1 : 0)) > 0 && (
              <div className="flex items-center gap-1">
                <FaImage size={10} />
                {project.images?.length || 1}
              </div>
            )}
            {project.video?.url && <div className="flex items-center gap-1"><FaVideo size={10} /></div>}
          </div>
        </div>

        {/* Title & Description */}
        <div className="flex-1 flex flex-col justify-center">
          <motion.h3
            className="text-xl sm:text-2xl font-black leading-tight text-white mb-2"
            animate={{ opacity: isHovered ? 1 : 0.9 }}
          >
            {project.title}
          </motion.h3>
          <motion.p
            className="text-xs sm:text-sm text-white/80 line-clamp-2"
            animate={{ opacity: isHovered ? 1 : 0.7 }}
          >
            {project.description || 'Click to view project details'}
          </motion.p>
        </div>

        {/* Bottom Actions */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-wrap gap-1">
            {project.technologies?.slice(0, 3).map((t, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-[9px] font-bold text-white/90"
                style={{
                  background: `${col.bg}77`,
                  border: `1px solid ${col.accent}55`,
                }}
              >
                {t}
              </span>
            ))}
            {(project.technologies?.length || 0) > 3 && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold text-white/60">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
          <motion.div
            className="p-2 rounded-full"
            style={{ background: `${col.bg}aa`, color: 'white' }}
            whileHover={{ scale: 1.15, rotate: 45 }}
          >
            <FaArrowRight size={12} />
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient Border Effect */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${col.accent}00 0%, ${col.accent}44 50%, ${col.bg}00 100%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      />
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

/* ─── Main Projects Section with Modern Grid Display ─── */
const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [galleryProject, setGalleryProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'featured'

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data.data || [])).catch(() => {});
  }, []);

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];
  const filtered = activeFilter === 'All' ? projects : projects.filter(p => p.category === activeFilter);
  const featured = projects.filter(p => p.isFeatured).slice(0, 3);

  return (
    <section id="projects" className="section-padding relative overflow-hidden bg-page">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4 sm:mb-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1.5px solid rgba(99,102,241,0.3)',
              color: '#6366f1',
            }}
          >
            <FaRocket size={13} /> Project Showcase
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-4" style={{ color: 'var(--text-primary)' }}>
            Crafted <span className="text-gradient">Digital Experiences</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            A showcase of my recent projects, featuring web applications, e-commerce solutions, and innovative digital products.
          </p>
        </motion.div>

        {/* Stats Section */}
        {projects.length > 0 && <ProjectStats projects={projects} />}

        {/* View Mode Toggle & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
        >
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => { setActiveFilter(cat); setViewMode('grid'); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5"
                style={{
                  background: activeFilter === cat ? '#6366f1' : 'var(--bg-surface)',
                  color: activeFilter === cat ? 'white' : 'var(--text-muted)',
                  border: `1.5px solid ${activeFilter === cat ? '#6366f1' : 'var(--border)'}`,
                }}
              >
                <FaFilter size={11} className="hidden sm:inline" />
                {cat}
              </motion.button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            {featured.length > 0 && (
              <motion.button
                onClick={() => setViewMode('featured')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5"
                style={{
                  background: viewMode === 'featured' ? '#a855f7' : 'var(--bg-surface)',
                  color: viewMode === 'featured' ? 'white' : 'var(--text-muted)',
                  border: `1.5px solid ${viewMode === 'featured' ? '#a855f7' : 'var(--border)'}`,
                }}
              >
                <FaStar size={12} />
                <span className="hidden sm:inline">Featured</span>
              </motion.button>
            )}
            <motion.button
              onClick={() => setViewMode('grid')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5"
              style={{
                background: viewMode === 'grid' ? '#06b6d4' : 'var(--bg-surface)',
                color: viewMode === 'grid' ? 'white' : 'var(--text-muted)',
                border: `1.5px solid ${viewMode === 'grid' ? '#06b6d4' : 'var(--border)'}`,
              }}
            >
              <FaLayerGroup size={12} />
              <span className="hidden sm:inline">All</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Projects Display */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 sm:py-20"
          >
            <FaEye size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)' }}>
              {projects.length === 0 ? 'Projects will appear here once added from the admin panel.' : 'No projects in this category.'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'featured' && featured.length > 0 ? (
              /* Featured Projects Carousel */
              <motion.div
                key="featured"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
              >
                {featured.map((project, i) => (
                  <ProjectCard
                    key={project._id || i}
                    project={project}
                    col={getCol(project.category)}
                    onClick={() => { setSelected(project); setGalleryProject(null); }}
                    index={i}
                  />
                ))}
              </motion.div>
            ) : (
              /* Full Grid Layout */
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              >
                {filtered.map((project, i) => (
                  <ProjectCard
                    key={project._id || i}
                    project={project}
                    col={getCol(project.category)}
                    onClick={() => { setSelected(project); setGalleryProject(null); }}
                    index={i}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Result Count */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mt-10 sm:mt-14"
          >
            <span
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1.5px solid rgba(99,102,241,0.25)',
                color: '#6366f1',
              }}
            >
              {filtered.length} Project{filtered.length !== 1 ? 's' : ''} Displayed
            </span>
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
