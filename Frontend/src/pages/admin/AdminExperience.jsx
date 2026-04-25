import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const emptyForm = { company: '', role: '', startDate: '', endDate: 'Present', isCurrent: false, description: '', responsibilities: [], technologies: [] };

const Modal = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState(item ? { ...item, responsibilities: item.responsibilities || [], technologies: item.technologies || [] } : emptyForm);
  const [respInput, setRespInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      if (item?._id) { await api.put(`/experience/${item._id}`, fd); toast.success('Updated!'); }
      else { await api.post('/experience', fd); toast.success('Added!'); }
      onSave();
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white">{item ? 'Edit Experience' : 'Add Experience'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><FaTimes size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company *</label>
              <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} required
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
              <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
              <input value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required placeholder="2020"
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input value={form.isCurrent ? 'Present' : form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} disabled={form.isCurrent} placeholder="Present"
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-50" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isCurrent} onChange={e => setForm({ ...form, isCurrent: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Currently working here</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Responsibilities</label>
            <div className="flex gap-2 mb-2">
              <input value={respInput} onChange={e => setRespInput(e.target.value)} onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); if (respInput.trim()) { setForm({ ...form, responsibilities: [...form.responsibilities, respInput.trim()] }); setRespInput(''); } } }} placeholder="Add responsibility..."
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <button type="button" onClick={() => { if (respInput.trim()) { setForm({ ...form, responsibilities: [...form.responsibilities, respInput.trim()] }); setRespInput(''); } }} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm">Add</button>
            </div>
            <ul className="space-y-1">
              {form.responsibilities.map((r, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                  <span className="flex-1">{r}</span>
                  <button type="button" onClick={() => setForm({ ...form, responsibilities: form.responsibilities.filter((_, idx) => idx !== i) })} className="text-red-400 hover:text-red-600">×</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Technologies</label>
            <div className="flex gap-2 mb-2">
              <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); if (techInput.trim()) { setForm({ ...form, technologies: [...form.technologies, techInput.trim()] }); setTechInput(''); } } }} placeholder="Add technology..."
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <button type="button" onClick={() => { if (techInput.trim()) { setForm({ ...form, technologies: [...form.technologies, techInput.trim()] }); setTechInput(''); } }} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.technologies.map((t, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs">
                  {t} <button type="button" onClick={() => setForm({ ...form, technologies: form.technologies.filter((_, idx) => idx !== i) })} className="text-indigo-300 hover:text-red-500">×</button>
                </span>
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

const AdminExperience = () => {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetch = () => api.get('/experience').then(r => setItems(r.data.data));
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/experience/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Work Experience</h1>
        <motion.button onClick={() => { setEditing(null); setModalOpen(true); }} whileHover={{ scale: 1.02 }}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <FaPlus size={14} /> Add Experience
        </motion.button>
      </div>
      <div className="space-y-4">
        {items.map(exp => (
          <div key={exp._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{exp.role}</h3>
                <p className="text-indigo-600 dark:text-indigo-400 text-sm">{exp.company}</p>
                <p className="text-xs text-gray-400 mt-1">{exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(exp); setModalOpen(true); }} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"><FaEdit size={14} /></button>
                <button onClick={() => handleDelete(exp._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><FaTrash size={14} /></button>
              </div>
            </div>
            {exp.responsibilities?.length > 0 && (
              <ul className="mt-3 space-y-1">
                {exp.responsibilities.slice(0, 3).map((r, i) => (
                  <li key={i} className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />{r}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      {items.length === 0 && <div className="text-center py-16 text-gray-400">No experience yet.</div>}
      <AnimatePresence>
        {modalOpen && <Modal item={editing} onClose={() => setModalOpen(false)} onSave={() => { setModalOpen(false); fetch(); }} />}
      </AnimatePresence>
    </div>
  );
};

export default AdminExperience;
