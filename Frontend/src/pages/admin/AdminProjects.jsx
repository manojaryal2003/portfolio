import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaStar, FaTimes, FaImage, FaVideo, FaTimesCircle, FaPlayCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const CATEGORIES = ['Web Applications', 'E-commerce', 'Admin Dashboards', 'Mobile Apps', 'Client Projects', 'Other'];

const emptyForm = {
  title: '', description: '', technologies: '', category: 'Web Applications',
  githubUrl: '', liveUrl: '', completionDate: '', isFeatured: false,
};

const Modal = ({ project, onClose, onSave }) => {
  const [form, setForm] = useState(project ? {
    ...project,
    technologies: project.technologies?.join(', ') || '',
    completionDate: project.completionDate ? project.completionDate.split('T')[0] : '',
  } : emptyForm);

  // existing media from server
  const [existingImages, setExistingImages] = useState(project?.images?.length ? project.images : project?.image ? [{ url: project.image, publicId: project.imagePublicId }] : []);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [existingVideo, setExistingVideo] = useState(project?.video?.url ? project.video : null);
  const [removeVideo, setRemoveVideo] = useState(false);

  // new files picked by user
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [newVideoPreview, setNewVideoPreview] = useState('');

  const [loading, setLoading] = useState(false);

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const totalExisting = existingImages.length - removedImageIds.length;
    const totalNew = newImageFiles.length + files.length;
    if (totalExisting + totalNew > 15) {
      toast.error('Maximum 15 images allowed');
      return;
    }
    setNewImageFiles(prev => [...prev, ...files]);
    setNewImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeExistingImage = (publicId) => {
    setRemovedImageIds(prev => [...prev, publicId]);
    setExistingImages(prev => prev.filter(img => img.publicId !== publicId));
  };

  const removeNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewVideoFile(file);
    setNewVideoPreview(URL.createObjectURL(file));
    setRemoveVideo(false);
    e.target.value = '';
  };

  const handleRemoveVideo = () => {
    setNewVideoFile(null);
    setNewVideoPreview('');
    setExistingVideo(null);
    setRemoveVideo(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const normalizeUrl = (url) => {
        if (!url) return url;
        return /^https?:\/\//i.test(url) ? url : `https://${url}`;
      };

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'technologies') {
          fd.append(k, JSON.stringify(v.split(',').map(t => t.trim()).filter(Boolean)));
        } else if ((k === 'liveUrl' || k === 'githubUrl') && v) {
          fd.append(k, normalizeUrl(v));
        } else {
          fd.append(k, v);
        }
      });

      newImageFiles.forEach(f => fd.append('images', f));
      if (newVideoFile) fd.append('video', newVideoFile);
      if (removedImageIds.length) fd.append('removedImageIds', JSON.stringify(removedImageIds));
      if (removeVideo) fd.append('removeVideo', 'true');

      if (project?._id) {
        await api.put(`/projects/${project._id}`, fd);
        toast.success('Project updated!');
      } else {
        await api.post('/projects', fd);
        toast.success('Project created!');
      }
      onSave();
    } catch (err) {
      toast.error('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const totalImageCount = existingImages.length + newImageFiles.length;
  const hasVideo = (!removeVideo && existingVideo) || newVideoPreview;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white">{project ? 'Edit Project' : 'Add Project'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <FaTimes size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">

          {/* ── IMAGES ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <FaImage size={13} className="text-indigo-500" /> Project Images
                <span className="text-xs text-gray-400 font-normal">({totalImageCount}/15)</span>
              </label>
              {totalImageCount < 15 && (
                <label className="cursor-pointer px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">
                  + Add Images
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
                </label>
              )}
            </div>

            {totalImageCount === 0 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:border-indigo-400 transition-colors">
                <FaImage size={24} className="text-gray-300 mb-2" />
                <span className="text-sm text-gray-400">Click to upload images (up to 15)</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
              </label>
            )}

            {totalImageCount > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {/* existing images */}
                {existingImages.map((img, i) => (
                  <div key={img.publicId || i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/80 text-white text-center text-xs py-0.5">Cover</div>
                    )}
                    <button type="button" onClick={() => removeExistingImage(img.publicId)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaTimesCircle size={14} />
                    </button>
                  </div>
                ))}
                {/* new images */}
                {newImagePreviews.map((src, i) => (
                  <div key={`new-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-indigo-300 dark:border-indigo-500">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">New</div>
                    <button type="button" onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaTimesCircle size={14} />
                    </button>
                  </div>
                ))}
                {/* add more slot */}
                {totalImageCount < 15 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors">
                    <FaPlus size={16} className="text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">Add</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* ── VIDEO ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <FaVideo size={13} className="text-purple-500" /> Project Video
                <span className="text-xs text-gray-400 font-normal">(optional)</span>
              </label>
              {!hasVideo && (
                <label className="cursor-pointer px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors">
                  + Add Video
                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                </label>
              )}
            </div>

            {!hasVideo && (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:border-purple-400 transition-colors">
                <FaPlayCircle size={22} className="text-gray-300 mb-1" />
                <span className="text-sm text-gray-400">Upload a video (mp4, mov, webm…)</span>
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
              </label>
            )}

            {hasVideo && (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-black">
                <video
                  src={newVideoPreview || existingVideo?.url}
                  controls
                  className="w-full max-h-48 object-contain"
                />
                {newVideoFile && (
                  <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">New</div>
                )}
                <button type="button" onClick={handleRemoveVideo}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                  <FaTimes size={12} />
                </button>
              </div>
            )}
          </div>

          {/* ── TEXT FIELDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technologies (comma separated)</label>
              <input value={form.technologies} onChange={e => setForm({ ...form, technologies: e.target.value })}
                placeholder="React.js, Node.js, MongoDB"
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Completion Date</label>
              <input type="date" value={form.completionDate} onChange={e => setForm({ ...form, completionDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub URL</label>
              <input value={form.githubUrl} onChange={e => setForm({ ...form, githubUrl: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Live URL</label>
              <input value={form.liveUrl} onChange={e => setForm({ ...form, liveUrl: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Mark as Featured Project</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium disabled:opacity-60">
              {loading ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchProjects = () => api.get('/projects').then(r => setProjects(r.data.data));
  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try { await api.delete(`/projects/${id}`); toast.success('Deleted'); fetchProjects(); }
    catch { toast.error('Failed to delete'); }
  };

  const openEdit = (p) => { setEditing(p); setModalOpen(true); };
  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const onSave = () => { setModalOpen(false); fetchProjects(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <motion.button onClick={openAdd} whileHover={{ scale: 1.02 }} className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <FaPlus size={14} /> Add Project
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map(project => (
          <motion.div key={project._id} layout className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="h-36 relative">
              {project.image ? (
                <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
              )}
              {project.isFeatured && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <FaStar size={9} /> Featured
                </div>
              )}
              <div className="absolute top-2 left-2 bg-indigo-600 text-white px-2 py-0.5 rounded-full text-xs">
                {project.category}
              </div>
              {/* media badges */}
              <div className="absolute bottom-2 right-2 flex gap-1">
                {project.images?.length > 1 && (
                  <div className="bg-black/60 text-white px-1.5 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <FaImage size={9} /> {project.images.length}
                  </div>
                )}
                {project.video?.url && (
                  <div className="bg-black/60 text-white px-1.5 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <FaVideo size={9} /> Video
                  </div>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{project.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{project.description}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(project)} className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium flex items-center justify-center gap-1 hover:bg-indigo-100">
                  <FaEdit size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(project._id)} className="flex-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg text-sm font-medium flex items-center justify-center gap-1 hover:bg-red-100">
                  <FaTrash size={13} /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-16 text-gray-400">No projects yet. Add your first project!</div>
      )}

      <AnimatePresence>
        {modalOpen && <Modal project={editing} onClose={() => setModalOpen(false)} onSave={onSave} />}
      </AnimatePresence>
    </div>
  );
};

export default AdminProjects;
