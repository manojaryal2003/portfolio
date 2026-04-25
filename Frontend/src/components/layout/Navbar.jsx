import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSun, FiMoon, FiMenu, FiX,
  FiHome, FiUser, FiZap,
  FiFolder, FiClock, FiMail
} from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const navLinks = [
  { label: 'Home',       href: '#home',       icon: FiHome },
  { label: 'About',      href: '#about',      icon: FiUser },
  { label: 'Skills',     href: '#skills',     icon: FiZap },
  { label: 'Projects',   href: '#projects',   icon: FiFolder },
  { label: 'Experience', href: '#experience', icon: FiClock },
  { label: 'Contact',    href: '#contact',    icon: FiMail },
];

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [active, setActive] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const onScroll = () => {
      const sections = navLinks.map(l => l.href.replace('#', ''));
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) { setActive(id); break; }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (href) => {
    setMobileOpen(false);
    document.getElementById(href.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ── Vertical sidebar (desktop) ── */}
      <motion.nav
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-0 top-0 bottom-0 z-50 hidden md:flex flex-col items-center justify-center gap-8 py-6 w-16"
        style={{
          background: isDark
            ? 'rgba(8,8,24,0.85)'
            : 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)',
          borderRight: isDark
            ? '1px solid rgba(255,255,255,0.05)'
            : '1px solid rgba(99,102,241,0.12)',
        }}
      >
        {/* Nav icons */}
        <div className="flex flex-col items-center gap-2">
          {navLinks.map(link => {
            const id = link.href.replace('#', '');
            const isActive = active === id;
            const Icon = link.icon;
            const isHovered = hoveredLink === id;

            return (
              <div key={link.label} className="relative flex items-center">
                {/* Tooltip label */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: -8, scale: 0.85 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -8, scale: 0.85 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute left-14 whitespace-nowrap text-xs font-semibold px-2.5 py-1 rounded-lg pointer-events-none z-50"
                      style={{
                        background: isDark ? '#1a1a3a' : '#fff',
                        color: isDark ? '#f1f5f9' : '#0f172a',
                        border: isDark
                          ? '1px solid rgba(255,255,255,0.08)'
                          : '1px solid rgba(99,102,241,0.18)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                      }}
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                <motion.a
                  href={link.href}
                  onClick={e => { e.preventDefault(); go(link.href); }}
                  onHoverStart={() => setHoveredLink(id)}
                  onHoverEnd={() => setHoveredLink(null)}
                  whileHover={{ scale: 1.22 }}
                  whileTap={{ scale: 0.88 }}
                  animate={isActive
                    ? { scale: 1.1 }
                    : { scale: 1 }
                  }
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-200"
                  style={{
                    background: isActive
                      ? 'rgba(99,102,241,0.18)'
                      : 'transparent',
                    color: isActive ? '#818cf8' : isDark ? '#64748b' : '#94a3b8',
                  }}
                  title={link.label}
                >
                  {/* Active glow ring */}
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'rgba(99,102,241,0.18)',
                        boxShadow: '0 0 12px rgba(99,102,241,0.35)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Hover ripple */}
                  {isHovered && !isActive && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'rgba(99,102,241,0.08)' }}
                    />
                  )}

                  <motion.span
                    className="relative z-10"
                    animate={isHovered ? { rotate: [0, -12, 12, 0] } : { rotate: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  >
                    <Icon size={17} />
                  </motion.span>
                </motion.a>
              </div>
            );
          })}
        </div>

        {/* Theme toggle */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.15, rotate: 20 }}
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 350, damping: 18 }}
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-200"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.08)',
            color: isDark ? '#94a3b8' : '#6366f1',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(99,102,241,0.15)',
          }}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <FiSun size={15} /> : <FiMoon size={15} />}
        </motion.button>
      </motion.nav>

      {/* ── Mobile top bar ── */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex md:hidden items-center justify-between px-4 h-14"
        style={{
          background: isDark ? 'rgba(8,8,24,0.9)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: isDark
            ? '1px solid rgba(255,255,255,0.05)'
            : '1px solid rgba(99,102,241,0.12)',
        }}
      >
        <motion.a
          href="#home"
          onClick={e => { e.preventDefault(); go('#home'); }}
          whileHover={{ scale: 1.05 }}
          className="font-black text-lg tracking-tight"
        >
          <span className="text-gradient">M</span>
          <span className="text-gradient">.</span>
          <span className="text-gradient">A</span>
        </motion.a>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg transition-colors"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.08)',
              color: isDark ? '#94a3b8' : '#6366f1',
            }}
          >
            {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </motion.button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.08)',
              color: isDark ? '#94a3b8' : '#6366f1',
            }}
          >
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </motion.div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 left-0 right-0 z-40 md:hidden mx-3 mt-2 rounded-2xl overflow-hidden"
            style={{
              background: isDark ? 'rgba(10,10,30,0.97)' : 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(20px)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.05)'
                : '1px solid rgba(99,102,241,0.12)',
            }}
          >
            <div className="p-3 flex flex-col gap-1">
              {navLinks.map(link => {
                const id = link.href.replace('#', '');
                const isActive = active === id;
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={e => { e.preventDefault(); go(link.href); }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                      color: isActive
                        ? '#818cf8'
                        : isDark ? '#94a3b8' : '#475569',
                    }}
                  >
                    <Icon size={15} />
                    {link.label}
                  </a>
                );
              })}

              <motion.a
                href="#contact"
                onClick={e => { e.preventDefault(); go('#contact'); }}
                whileTap={{ scale: 0.97 }}
                className="mt-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white btn-white-text"
                style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)' }}
              >
                Hire Me
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
