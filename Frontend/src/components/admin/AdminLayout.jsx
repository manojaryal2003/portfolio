import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTachometerAlt, FaHome, FaUser, FaChartBar, FaCogs, FaFolderOpen,
  FaBriefcase, FaComments, FaBlog, FaEnvelope, FaShare, FaSignOutAlt,
  FaBars, FaTimes, FaSun, FaMoon
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: FaTachometerAlt },
  { label: 'Hero', path: '/admin/hero', icon: FaHome },
  { label: 'About', path: '/admin/about', icon: FaUser },
  { label: 'Stats', path: '/admin/stats', icon: FaChartBar },
  { label: 'Skills', path: '/admin/skills', icon: FaCogs },
  { label: 'Services', path: '/admin/services', icon: FaCogs },
  { label: 'Projects', path: '/admin/projects', icon: FaFolderOpen },
  { label: 'Experience', path: '/admin/experience', icon: FaBriefcase },
  { label: 'Testimonials', path: '/admin/testimonials', icon: FaComments },
  { label: 'Blog', path: '/admin/blog', icon: FaBlog },
  { label: 'Messages', path: '/admin/messages', icon: FaEnvelope },
  { label: 'Social Links', path: '/admin/social', icon: FaShare },
];

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, admin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden flex-shrink-0"
      >
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h1 className="text-lg font-bold text-gradient whitespace-nowrap">Portfolio Admin</h1>
          <p className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{admin?.email}</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all whitespace-nowrap"
          >
            <FaSignOutAlt size={16} /> Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>

          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              View Site →
            </a>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
