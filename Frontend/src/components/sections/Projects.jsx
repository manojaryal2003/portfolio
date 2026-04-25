import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGithub, FaExternalLinkAlt, FaStar, FaCalendar,
  FaImages, FaTimes, FaChevronLeft, FaChevronRight,
  FaPlayCircle, FaExpand, FaImage, FaVideo,
} from 'react-icons/fa';
import api from '../../utils/api';

const categories = ['All', 'Web Applications', 'E-commerce', 'Admin Dashboards', 'Mobile Apps', 'Client Projects', 'Other'];

const toAbsoluteUrl = (url) => {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

/* ─────────────────────────────────────────
   Gallery lightbox
───────────────────────────────────────── */
const ProjectGallery = ({ project, onClose }) => {
  // build unified media list: images first, then video at end
  const images = project.images?.length
    ? project.images
    : project.image
      ? [{ url: project.image, publicId: project.imagePublicId }]
      : [];

  const hasVideo = !!project.video?.url;
  const mediaList = [
    ...images.map(img => ({ type: 'image', url: img.url })),
    ...(hasVideo ? [{ type: 'video', url: project.video.url }] : []),
  ];

  const [current, setCurrent] = useState(0);
  const total = mediaList.length;

  const prev = useCallback(() => setCurrent(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent(i => (i + 1) % total), [total]);

  // keyboard nav + close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const active = mediaList[current];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-black/95"
        onClick={onClose}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">{project.title}</h3>
            <p className="text-gray-400 text-sm mt-0.5">
              {total === 0 ? 'No media' : `${current + 1} / ${total}`}
              {hasVideo && images.length > 0 && (
                <span className="ml-2 text-xs">
                  <span className="text-indigo-400">{images.length} photo{images.length > 1 ? 's' : ''}</span>
                  <span className="text-gray-600 mx-1">·</span>
                  <span className="text-purple-400">1 video</span>
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <FaTimes size={18} />
          </button>
        </div>

        {/* main viewer */}
        <div className="flex-1 flex items-center justify-center relative px-4 min-h-0" onClick={e => e.stopPropagation()}>
          {/* prev */}
          {total > 1 && (
            <button onClick={prev}
              className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <FaChevronLeft size={18} />
            </button>
          )}

          {/* media */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex items-center justify-center"
            >
              {active?.type === 'video' ? (
                <video
                  src={active.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
                  style={{ maxHeight: 'calc(100vh - 220px)' }}
                  onClick={e => e.stopPropagation()}
                />
              ) : active?.type === 'image' ? (
                <img
                  src={active.url}
                  alt={`${project.title} ${current + 1}`}
                  className="max-w-full max-h-full rounded-xl shadow-2xl object-contain select-none"
                  style={{ maxHeight: 'calc(100vh - 220px)' }}
                  draggable={false}
                />
              ) : (
                <div className="text-gray-500 text-center">
                  <FaImage size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No media available</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* next */}
          {total > 1 && (
            <button onClick={next}
              className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <FaChevronRight size={18} />
            </button>
          )}
        </div>

        {/* thumbnail strip */}
        {total > 1 && (
          <div className="flex-shrink-0 px-4 py-4" onClick={e => e.stopPropagation()}>
            <div className="flex gap-2 overflow-x-auto justify-center pb-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
              {mediaList.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    i === current
                      ? 'border-indigo-500 scale-105 opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-purple-900/60 flex items-center justify-center">
                      <FaPlayCircle size={22} className="text-purple-300" />
                    </div>
                  ) : (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* project links footer */}
        <div className="flex-shrink-0 flex items-center justify-center gap-4 pb-5" onClick={e => e.stopPropagation()}>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors">
              <FaGithub size={15} /> Source Code
            </a>
          )}
          {project.liveUrl && (
            <a href={toAbsoluteUrl(project.liveUrl)} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-sm transition-colors">
              <FaExternalLinkAlt size={13} /> Live Demo
            </a>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ─────────────────────────────────────────
   Project card with hover overlay
───────────────────────────────────────── */
const ProjectCard = ({ project, onGallery }) => {
  const mediaCount = (project.images?.length || (project.image ? 1 : 0)) + (project.video?.url ? 1 : 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.03] hover:border-indigo-500/30 group transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      <div className="relative overflow-hidden h-48">
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-4xl font-bold opacity-30">{project.title?.[0]}</span>
          </div>
        )}

        {/* hover overlay with Gallery button */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.button
            onClick={() => onGallery(project)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl font-semibold text-sm shadow-xl"
          >
            <FaImages size={15} />
            Gallery
            {mediaCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">{mediaCount}</span>
            )}
          </motion.button>
        </div>

        {/* badges */}
        {project.isFeatured && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <FaStar size={10} /> Featured
          </div>
        )}
        <div className="absolute top-3 left-3 bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-medium">
          {project.category}
        </div>

        {/* media count badges bottom-right */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-0">
          {/* hidden when overlay shows */}
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1 group-hover:opacity-0 transition-opacity">
          {project.images?.length > 1 && (
            <span className="bg-black/60 text-white px-1.5 py-0.5 rounded-full text-xs flex items-center gap-1">
              <FaImage size={9} /> {project.images.length}
            </span>
          )}
          {project.video?.url && (
            <span className="bg-black/60 text-white px-1.5 py-0.5 rounded-full text-xs flex items-center gap-1">
              <FaVideo size={9} /> Video
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
          {project.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.technologies?.slice(0, 4).map((tech, i) => (
            <span key={i} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md text-xs font-medium">
              {tech}
            </span>
          ))}
          {project.technologies?.length > 4 && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md text-xs">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          {project.completionDate && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <FaCalendar size={10} />
              {new Date(project.completionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          )}
          <div className="flex gap-3 ml-auto">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <FaGithub size={18} />
              </a>
            )}
            {project.liveUrl && (
              <a href={toAbsoluteUrl(project.liveUrl)} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <FaExternalLinkAlt size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   Projects section
───────────────────────────────────────── */
const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState('All');
  const [galleryProject, setGalleryProject] = useState(null);

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data.data)).catch(() => {});
  }, []);

  const filtered = active === 'All' ? projects : projects.filter(p => p.category === active);

  return (
    <section id="projects" className="section-padding relative overflow-hidden bg-page">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-indigo-400 text-sm font-mono uppercase tracking-widest mb-2">// my work</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">
            All <span className="text-gradient">Projects</span>
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
            <motion.button
              key={cat}
              onClick={() => setActive(cat)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map(project => (
              <ProjectCard key={project._id} project={project} onGallery={setGalleryProject} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && projects.length > 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <p>No projects in this category yet.</p>
          </div>
        )}
        {projects.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <p>Projects will appear here once added from the admin panel.</p>
          </div>
        )}
      </div>

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
