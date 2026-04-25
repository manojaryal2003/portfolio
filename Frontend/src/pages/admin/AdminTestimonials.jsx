import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const emptyForm = { name: '', company: '', message: '', rating: 5, isActive: true };

const Modal = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState(item || emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(item?.photo || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile);
      if (item?._id) { await api.put(`/testimonials/${item._id}`, fd); toast.success('Updated!'); }
      else { await api.post('/testimonials', fd); toast.success('Added!'); }
      onSave();
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white">{item ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><FaTimes size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
              {photoPreview ? <img src={photoPreview} alt="" className="w-full h-full object-cover" /> :
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">{form.name?.[0] || '?'}</div>}
            </div>
            <input type="file" accept="image/*" onChange={e => { setPhotoFile(e.target.files[0]); setPhotoPreview(URL.createObjectURL(e.target.files[0])); }}
              className="text-sm text-gray-600 dark:text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 file:text-xs" />
          </div>
          {[{ label: 'Client Name *', key: 'name', required: true }, { label: 'Company', key: 'company' }].map(({ label, key, required }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={required}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review *</label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={3}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}>
                  <FaStar size={22} className={n <= form.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium disabled:opacity-60">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AdminTestimonials = () => {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetch = () => api.get('/testimonials/all').then(r => setItems(r.data.data));
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/testimonials/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Testimonials</h1>
        <motion.button onClick={() => { setEditing(null); setModalOpen(true); }} whileHover={{ scale: 1.02 }}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <FaPlus size={14} /> Add Testimonial
        </motion.button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(t => (
          <div key={t._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              {t.photo ? <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover" /> :
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">{t.name[0]}</div>}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                {t.company && <p className="text-xs text-gray-400">{t.company}</p>}
              </div>
            </div>
            <div className="flex mb-2">{Array.from({ length: t.rating || 5 }).map((_, i) => <FaStar key={i} size={12} className="text-yellow-400" />)}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">"{t.message}"</p>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(t); setModalOpen(true); }} className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg text-sm flex items-center justify-center gap-1"><FaEdit size={12} /> Edit</button>
              <button onClick={() => handleDelete(t._id)} className="flex-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg text-sm flex items-center justify-center gap-1"><FaTrash size={12} /> Delete</button>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <div className="text-center py-16 text-gray-400">No testimonials yet.</div>}
      <AnimatePresence>
        {modalOpen && <Modal item={editing} onClose={() => setModalOpen(false)} onSave={() => { setModalOpen(false); fetch(); }} />}
      </AnimatePresence>
    </div>
  );
};

export default AdminTestimonials;
