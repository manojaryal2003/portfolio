import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import api from '../../utils/api';

const COLOR_OPTIONS = [
  { value: 'indigo', label: 'Indigo', bg: 'bg-indigo-600' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-600' },
  { value: 'green', label: 'Green', bg: 'bg-green-600' },
  { value: 'orange', label: 'Orange', bg: 'bg-orange-500' },
  { value: 'pink', label: 'Pink', bg: 'bg-pink-500' },
];

const colorClass = (color) => ({
  indigo: 'text-indigo-600 dark:text-indigo-400',
  purple: 'text-purple-600 dark:text-purple-400',
  green: 'text-green-600 dark:text-green-400',
  orange: 'text-orange-500 dark:text-orange-400',
  pink: 'text-pink-500 dark:text-pink-400',
}[color] || 'text-indigo-600 dark:text-indigo-400');

const EMPTY_BADGE = { label: '', value: '', color: 'indigo' };

const AdminHero = () => {
  const [form, setForm] = useState({ name: '', title: '', introduction: '', typingTexts: [] });
  const [typingInput, setTypingInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [badges, setBadges] = useState([]);
  const [newBadge, setNewBadge] = useState(EMPTY_BADGE);
  const [editingBadge, setEditingBadge] = useState(null); // { id, label, value, color }
  const [badgeLoading, setBadgeLoading] = useState(false);

  useEffect(() => {
    api.get('/hero').then(res => {
      const d = res.data.data;
      setForm({ name: d.name || '', title: d.title || '', introduction: d.introduction || '', typingTexts: d.typingTexts || [] });
      setImagePreview(d.profileImage || '');
      setBadges(d.floatingBadges || []);
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/hero', form);
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        await api.post('/hero/upload-image', fd);
      }
      toast.success('Hero section updated!');
    } catch {
      toast.error('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const addTypingText = () => {
    if (typingInput.trim()) {
      setForm({ ...form, typingTexts: [...form.typingTexts, typingInput.trim()] });
      setTypingInput('');
    }
  };

  const removeTypingText = (i) => setForm({ ...form, typingTexts: form.typingTexts.filter((_, idx) => idx !== i) });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddBadge = async () => {
    if (!newBadge.label.trim() || !newBadge.value.trim()) {
      toast.error('Label and value are required');
      return;
    }
    setBadgeLoading(true);
    try {
      const res = await api.post('/hero/badges', newBadge);
      setBadges(res.data.data.floatingBadges);
      setNewBadge(EMPTY_BADGE);
      toast.success('Badge added!');
    } catch {
      toast.error('Failed to add badge');
    } finally {
      setBadgeLoading(false);
    }
  };

  const handleUpdateBadge = async () => {
    if (!editingBadge.label.trim() || !editingBadge.value.trim()) {
      toast.error('Label and value are required');
      return;
    }
    setBadgeLoading(true);
    try {
      const res = await api.put(`/hero/badges/${editingBadge.id}`, {
        label: editingBadge.label,
        value: editingBadge.value,
        color: editingBadge.color,
      });
      setBadges(res.data.data.floatingBadges);
      setEditingBadge(null);
      toast.success('Badge updated!');
    } catch {
      toast.error('Failed to update badge');
    } finally {
      setBadgeLoading(false);
    }
  };

  const handleDeleteBadge = async (id) => {
    setBadgeLoading(true);
    try {
      const res = await api.delete(`/hero/badges/${id}`);
      setBadges(res.data.data.floatingBadges);
      toast.success('Badge removed!');
    } catch {
      toast.error('Failed to delete badge');
    } finally {
      setBadgeLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Hero Section</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
        {/* Profile Image */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Profile Image</label>
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
              {imagePreview ? <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" /> : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">?</div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange}
              className="text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-600 file:font-medium hover:file:bg-indigo-100 cursor-pointer" />
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        {/* Introduction */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Introduction</label>
          <textarea value={form.introduction} onChange={e => setForm({ ...form, introduction: e.target.value })} rows={4}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>

        {/* Typing Texts */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Typing Effect Texts</label>
          <div className="flex gap-2 mb-3">
            <input value={typingInput} onChange={e => setTypingInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addTypingText()}
              placeholder="Add a typing text..."
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            <button onClick={addTypingText} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.typingTexts.map((text, i) => (
              <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
                {text}
                <button onClick={() => removeTypingText(i)} className="text-indigo-400 hover:text-red-500 transition-colors">×</button>
              </span>
            ))}
          </div>
        </div>

        <motion.button onClick={handleSave} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium disabled:opacity-60 transition-all">
          {loading ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </div>

      {/* Floating Badges */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mt-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Floating Badges</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">These appear around the profile circle. Add up to 6 badges.</p>
          </div>
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium">
            {badges.length} badge{badges.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Existing Badges */}
        <div className="space-y-3 mb-6">
          {badges.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No badges yet. Add one below.</p>
          )}
          {badges.map(badge => (
            <div key={badge._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              {editingBadge?.id === badge._id ? (
                <>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      value={editingBadge.label}
                      onChange={e => setEditingBadge({ ...editingBadge, label: e.target.value })}
                      placeholder="Label"
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      value={editingBadge.value}
                      onChange={e => setEditingBadge({ ...editingBadge, value: e.target.value })}
                      placeholder="Value"
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-1">
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setEditingBadge({ ...editingBadge, color: c.value })}
                        className={`w-5 h-5 rounded-full ${c.bg} transition-all ${editingBadge.color === c.value ? 'ring-2 ring-offset-1 ring-gray-400' : 'opacity-50 hover:opacity-100'}`}
                        title={c.label}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={handleUpdateBadge} disabled={badgeLoading}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors">
                      <FaCheck size={12} />
                    </button>
                    <button onClick={() => setEditingBadge(null)}
                      className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors">
                      <FaTimes size={12} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${COLOR_OPTIONS.find(c => c.value === badge.color)?.bg || 'bg-indigo-600'}`} />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{badge.label}</p>
                      <p className={`text-sm font-bold ${colorClass(badge.color)}`}>{badge.value}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setEditingBadge({ id: badge._id, label: badge.label, value: badge.value, color: badge.color })}
                      className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                      <FaEdit size={12} />
                    </button>
                    <button onClick={() => handleDeleteBadge(badge._id)} disabled={badgeLoading}
                      className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors">
                      <FaTrash size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add New Badge */}
        {badges.length < 6 && (
          <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Add New Badge</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input
                value={newBadge.label}
                onChange={e => setNewBadge({ ...newBadge, label: e.target.value })}
                placeholder="Label (e.g. Experience)"
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                value={newBadge.value}
                onChange={e => setNewBadge({ ...newBadge, value: e.target.value })}
                onKeyPress={e => e.key === 'Enter' && handleAddBadge()}
                placeholder="Value (e.g. 5+ Years)"
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Color:</span>
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setNewBadge({ ...newBadge, color: c.value })}
                    className={`w-6 h-6 rounded-full ${c.bg} transition-all ${newBadge.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-60 hover:opacity-100'}`}
                    title={c.label}
                  />
                ))}
              </div>
              <button onClick={handleAddBadge} disabled={badgeLoading || !newBadge.label.trim() || !newBadge.value.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <FaPlus size={12} /> Add Badge
              </button>
            </div>
          </div>
        )}
        {badges.length >= 6 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 text-center pt-2 border-t border-gray-100 dark:border-gray-700">
            Maximum 6 badges reached. Remove one to add another.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminHero;
