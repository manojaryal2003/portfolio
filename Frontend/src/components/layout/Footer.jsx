import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaHeart } from 'react-icons/fa';
import api from '../../utils/api';

const iconMap = { FaLinkedin, FaGithub, FaTwitter, FaInstagram };
const navLinks = ['Home', 'About', 'Skills', 'Services', 'Projects', 'Contact'];

const Footer = () => {
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    api.get('/social').then(res => setSocials(res.data.data)).catch(() => {});
  }, []);

  return (
    <footer className="relative overflow-hidden bg-footer">
      {/* top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <h3 className="text-xl font-black mb-3">
              <span className="text-gradient">Smart</span><span className="text-white">IT</span>
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Full Stack Developer & Project Manager crafting high-performance web experiences.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Navigation</h4>
            <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
              {navLinks.map(link => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-gray-500 hover:text-indigo-400 text-sm transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Connect</h4>
            <div className="flex gap-2">
              {socials.map(social => {
                const Icon = iconMap[social.icon] || FaGithub;
                return (
                  <motion.a
                    key={social._id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.15, y: -3 }}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 flex items-center justify-center text-gray-500 hover:text-indigo-400 transition-all"
                  >
                    <Icon size={15} />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-600 text-xs flex items-center gap-1.5">
            Made with <FaHeart className="text-pink-500" size={10} /> by Smart IT Solution
          </p>
          <p className="text-gray-700 text-xs">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
