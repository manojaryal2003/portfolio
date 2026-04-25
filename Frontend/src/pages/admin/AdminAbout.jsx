import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AdminAbout = () => {
  const [form, setForm] = useState({ description: '', role: '', company: '', experience: '', expertise: [] });
  const [expertiseInput, setExpertiseInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/about').then(res => {
      const d = res.data.data;
      setForm({ description: d.description || '', role: d.role || '', company: d.company || '', experience: d.experience || '', expertise: d.expertise || [] });
      setImagePreview(d.profileImage || '');
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/about', form);
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        await api.post('/about/upload-image', fd);
      }
      toast.success('About section updated!');
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const addExpertise = () => {
    if (expertiseInput.trim()) {
      setForm({ ...form, expertise: [...form.expertise, expertiseInput.trim()] });
      setExpertiseInput('');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About Section</h1>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Profile Image</label>
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700">
              {imagePreview ? <img src={imagePreview} alt="" className="w-full h-full object-cover" /> :
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">?</div>}
            </div>
            <input type="file" accept="image/*" onChange={e => { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); }}
              className="text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-600 file:font-medium" />
          </div>
        </div>
        {[
          { label: 'Role', key: 'role', placeholder: 'Full Stack Developer & Project Manager' },
          { label: 'Company', key: 'company', placeholder: 'Smart IT Solution' },
          { label: 'Experience Summary', key: 'experience', placeholder: '5+ years in Full Stack Development' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
            <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Expertise Tags</label>
          <div className="flex gap-2 mb-3">
            <input value={expertiseInput} onChange={e => setExpertiseInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addExpertise()} placeholder="Add skill..."
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            <button onClick={addExpertise} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.expertise.map((skill, i) => (
              <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
                {skill}
                <button onClick={() => setForm({ ...form, expertise: form.expertise.filter((_, idx) => idx !== i) })} className="text-indigo-400 hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>
        <motion.button onClick={handleSave} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium disabled:opacity-60">
          {loading ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </div>
    </div>
  );
};

export default AdminAbout;
