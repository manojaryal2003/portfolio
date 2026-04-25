import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaEnvelopeOpen, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchMessages = () => api.get('/contact').then(r => setMessages(r.data.data));
  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      fetchMessages();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try { await api.delete(`/contact/${id}`); toast.success('Deleted'); fetchMessages(); if (selected?._id === id) setSelected(null); }
    catch { toast.error('Failed to delete'); }
  };

  const unread = messages.filter(m => !m.isRead).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        {unread > 0 && (
          <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">{unread} new</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message list */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{messages.length} total messages</p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
            {messages.map(msg => (
              <div
                key={msg._id}
                onClick={() => { setSelected(msg); if (!msg.isRead) markRead(msg._id); }}
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selected?._id === msg._id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''} ${!msg.isRead ? 'border-l-2 border-indigo-500' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {msg.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${!msg.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{msg.name}</p>
                      <p className="text-xs text-gray-400 truncate">{msg.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!msg.isRead ? <FaEnvelope size={12} className="text-indigo-500" /> : <FaEnvelopeOpen size={12} className="text-gray-400" />}
                    <button onClick={e => { e.stopPropagation(); handleDelete(msg._id); }} className="p-1 text-red-400 hover:text-red-600">
                      <FaTrash size={11} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 pl-10 truncate">{msg.message}</p>
                <p className="text-xs text-gray-400 mt-1 pl-10">{new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            ))}
            {messages.length === 0 && <div className="p-8 text-center text-gray-400">No messages yet.</div>}
          </div>
        </div>

        {/* Message detail */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          {selected ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{selected.name}</h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">{selected.email}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => handleDelete(selected._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <FaTrash size={16} />
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <a href={`mailto:${selected.email}`}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                Reply via Email
              </a>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
              <div className="text-center">
                <FaEnvelope size={40} className="mx-auto mb-3 opacity-30" />
                <p>Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
