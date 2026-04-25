import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const emptyForm = { platform: '', url: '', icon: '', isActive: true, order: 0 };

const Modal = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState(item || emptyForm);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (item?._id) { await api.put(`/social/${item._id}`, form); toast.success('Updated!'); }
      else { await api.post('/social', form); toast.success('Added!'); }
      onSave();
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white">{item ? 'Edit Social' : 'Add Social'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><FaTimes size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {[
            { label: 'Platform *', key: 'platform', required: true, placeholder: 'LinkedIn' },
            { label: 'URL *', key: 'url', required: true, placeholder: 'https://linkedin.com/in/...' },
            { label: 'Icon (react-icons name)', key: 'icon', placeholder: 'FaLinkedin' },
          ].map(({ label, key, required, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={required} placeholder={placeholder}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
          </label>
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

const AdminSocial = () => {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetch = () => api.get('/social/all').then(r => setItems(r.data.data));
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/social/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Social Links</h1>
        <motion.button onClick={() => { setEditing(null); setModalOpen(true); }} whileHover={{ scale: 1.02 }}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <FaPlus size={14} /> Add Link
        </motion.button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {items.map(item => (
          <div key={item._id} className="flex items-center gap-4 p-4 border-b border-gray-50 dark:border-gray-700 last:border-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {item.platform[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white">{item.platform}</p>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline truncate block">{item.url}</a>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
              {item.isActive ? 'Active' : 'Hidden'}
            </span>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(item); setModalOpen(true); }} className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"><FaEdit size={14} /></button>
              <button onClick={() => handleDelete(item._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><FaTrash size={14} /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="p-8 text-center text-gray-400">No social links yet.</div>}
      </div>
      <AnimatePresence>
        {modalOpen && <Modal item={editing} onClose={() => setModalOpen(false)} onSave={() => { setModalOpen(false); fetch(); }} />}
      </AnimatePresence>
    </div>
  );
};

export default AdminSocial;
