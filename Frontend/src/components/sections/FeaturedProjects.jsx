import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaImages, FaVideo } from 'react-icons/fa';

const toAbsoluteUrl = (url) => {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};
import api from '../../utils/api';
import { ProjectGallery } from './Projects';

const FeaturedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [galleryProject, setGalleryProject] = useState(null);

  useEffect(() => {
    api.get('/projects?featured=true').then(res => setProjects(res.data.data)).catch(() => {});
  }, []);

  if (!projects.length) return null;

  return (
    <section className="section-padding relative overflow-hidden bg-featured">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-indigo-400 text-sm font-mono uppercase tracking-widest mb-2">// selected work</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">
            Featured <span className="text-gradient">Work</span>
          </h2>
        </motion.div>

        <div className="space-y-16">
          {projects.slice(0, 3).map((project, i) => {
            const mediaCount = (project.images?.length || (project.image ? 1 : 0)) + (project.video?.url ? 1 : 0);
            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
              >
                <div className={i % 2 !== 0 ? 'lg:order-2' : ''}>
                  <div className="rounded-2xl overflow-hidden shadow-2xl relative group cursor-pointer" onClick={() => setGalleryProject(project)}>
                    {project.image ? (
                      <img src={project.image} alt={project.title} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-6xl font-bold opacity-30">{project.title?.[0]}</span>
                      </div>
                    )}
                    {/* hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl font-semibold text-sm shadow-xl"
                      >
                        <FaImages size={15} />
                        Gallery
                        {mediaCount > 0 && (
                          <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">{mediaCount}</span>
                        )}
                      </motion.div>
                    </div>

                    {/* video badge */}
                    {project.video?.url && (
                      <div className="absolute bottom-3 right-3 bg-purple-600/90 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 group-hover:opacity-0 transition-opacity">
                        <FaVideo size={9} /> Video
                      </div>
                    )}
                  </div>
                </div>

                <div className={i % 2 !== 0 ? 'lg:order-1' : ''}>
                  <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">
                    // Featured Project
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-2 mb-3">{project.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-5">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.technologies?.map((tech, ti) => (
                      <span key={ti} className="px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg text-sm font-medium border border-indigo-500/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <button
                      onClick={() => setGalleryProject(project)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl text-sm font-medium transition-colors"
                    >
                      <FaImages size={14} /> View Gallery
                      {mediaCount > 0 && <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">{mediaCount}</span>}
                    </button>
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                        <FaGithub size={18} /> Source Code
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={toAbsoluteUrl(project.liveUrl)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-sm font-medium transition-colors">
                        <FaExternalLinkAlt size={14} /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {galleryProject && (
          <ProjectGallery project={galleryProject} onClose={() => setGalleryProject(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturedProjects;
