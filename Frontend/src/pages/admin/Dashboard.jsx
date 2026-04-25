import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaFolderOpen, FaUsers, FaEnvelope, FaBlog, FaComments, FaCogs, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const StatCard = ({ icon: Icon, label, count, color, path }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={22} className="text-white" />
      </div>
      <Link to={path} className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:gap-2 transition-all">
        Manage <FaArrowRight size={10} />
      </Link>
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white">{count}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
  </motion.div>
);

const Dashboard = () => {
  const [counts, setCounts] = useState({
    projects: 0, testimonials: 0, messages: 0,
    blog: 0, skills: 0, services: 0
  });
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projects, testimonials, messages, blog, skills, services] = await Promise.all([
          api.get('/projects'),
          api.get('/testimonials/all'),
          api.get('/contact'),
          api.get('/blog/all'),
          api.get('/skills'),
          api.get('/services/all'),
        ]);
        setCounts({
          projects: projects.data.data.length,
          testimonials: testimonials.data.data.length,
          messages: messages.data.data.length,
          blog: blog.data.data.length,
          skills: skills.data.data.length,
          services: services.data.data.length,
        });
        setRecentMessages(messages.data.data.slice(0, 5));
      } catch (err) {}
    };
    fetchData();
  }, []);

  const stats = [
    { icon: FaFolderOpen, label: 'Total Projects', count: counts.projects, color: 'bg-blue-500', path: '/admin/projects' },
    { icon: FaComments, label: 'Testimonials', count: counts.testimonials, color: 'bg-purple-500', path: '/admin/testimonials' },
    { icon: FaEnvelope, label: 'Messages', count: counts.messages, color: 'bg-green-500', path: '/admin/messages' },
    { icon: FaBlog, label: 'Blog Posts', count: counts.blog, color: 'bg-orange-500', path: '/admin/blog' },
    { icon: FaCogs, label: 'Skills', count: counts.skills, color: 'bg-indigo-500', path: '/admin/skills' },
    { icon: FaUsers, label: 'Services', count: counts.services, color: 'bg-pink-500', path: '/admin/services' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back! Here's an overview of your portfolio.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Recent Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Messages</h2>
          <Link to="/admin/messages" className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            View All <FaArrowRight size={10} />
          </Link>
        </div>
        {recentMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-600">No messages yet.</div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {recentMessages.map(msg => (
              <div key={msg._id} className={`p-4 flex items-start gap-4 ${!msg.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {msg.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{msg.name}</p>
                    {!msg.isRead && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                  </div>
                  <p className="text-xs text-gray-400">{msg.email}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{msg.message}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
