import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const emptyForm = { title: '', description: '', icon: '', pricing: '', order: 0, isActive: true };

const Modal = ({ service, onClose, onSave }) => {
  const [form, setForm] = useState(service || emptyForm);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (service?._id) { await api.put(`/services/${service._id}`, form); toast.success('Updated!'); }
      else { await api.post('/services', form); toast.success('Added!'); }
      onSave();
    } catch { toast.error('Failed to save'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white">{service ? 'Edit Service' : 'Add Service'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><FaTimes size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {[
            { label: 'Title *', key: 'title', required: true },
            { label: 'Icon (react-icons name)', key: 'icon', placeholder: 'e.g. FaCode' },
            { label: 'Pricing / Scope', key: 'pricing', placeholder: 'e.g. Starting from $500' },
          ].map(({ label, key, required, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={required} placeholder={placeholder}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
          </div>
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

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetch = () => api.get('/services/all').then(r => setServices(r.data.data));
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/services/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h1>
        <motion.button onClick={() => { setEditing(null); setModalOpen(true); }} whileHover={{ scale: 1.02 }}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <FaPlus size={14} /> Add Service
        </motion.button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(s => (
          <div key={s._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{s.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(s); setModalOpen(true); }} className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"><FaEdit size={14} /></button>
                <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><FaTrash size={14} /></button>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{s.description}</p>
            {s.pricing && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">{s.pricing}</p>}
            <span className={`mt-3 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
              {s.isActive ? 'Active' : 'Hidden'}
            </span>
          </div>
        ))}
      </div>
      {services.length === 0 && <div className="text-center py-16 text-gray-400">No services yet.</div>}
      <AnimatePresence>
        {modalOpen && <Modal service={editing} onClose={() => setModalOpen(false)} onSave={() => { setModalOpen(false); fetch(); }} />}
      </AnimatePresence>
    </div>
  );
};

export default AdminServices;
