import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaReact, FaNodeJs, FaGitAlt, FaDocker, FaHtml5, FaCss3Alt } from 'react-icons/fa';
import { SiJavascript, SiTailwindcss, SiMongodb, SiExpress, SiMysql, SiFirebase, SiPostman } from 'react-icons/si';
import api from '../../utils/api';

const iconMap = {
  FaReact, FaNodeJs, FaGitAlt, FaDocker, FaHtml5, FaCss3Alt, FaGit: FaGitAlt,
  SiJavascript, SiTailwindcss, SiMongodb, SiExpress, SiMysql, SiFirebase, SiPostman,
};

const categoryColors = {
  Frontend:            { from: '#6366f1', to: '#818cf8' },
  Backend:             { from: '#10b981', to: '#34d399' },
  Database:            { from: '#f59e0b', to: '#fbbf24' },
  'Tools & Platforms': { from: '#a855f7', to: '#c084fc' },
  Other:               { from: '#64748b', to: '#94a3b8' },
};

const SkillOrb = ({ name, proficiency, icon, index }) => {
  const Icon = iconMap[icon];
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (proficiency / 100) * circumference;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="flex flex-col items-center gap-1.5 group"
      title={`${name} — ${proficiency}%`}
    >
      <div className="relative w-11 h-11">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <motion.circle
            cx="24" cy="24" r={r}
            fill="none"
            stroke="url(#sg)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={inView ? { strokeDashoffset: offset } : {}}
            transition={{ duration: 1.1, ease: 'easeOut', delay: index * 0.04 + 0.2 }}
          />
          <defs>
            <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {Icon
            ? <Icon size={14} className="text-gray-400 group-hover:text-indigo-300 transition-colors" />
            : <span className="text-[9px] font-bold text-gray-500">{proficiency}%</span>
          }
        </div>
      </div>
      <p className="text-[10px] font-medium text-gray-400 group-hover:text-white transition-colors text-center leading-tight max-w-[52px] truncate">
        {name}
      </p>
    </motion.div>
  );
};

const CategoryBlock = ({ category, catSkills, gi }) => {
  const col = categoryColors[category] || categoryColors.Other;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: gi * 0.06 }}
      className="glass rounded-xl p-4 border border-white/5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-0.5 h-4 rounded-full" style={{ background: `linear-gradient(${col.from}, ${col.to})` }} />
        <h3
          className="text-xs font-bold uppercase tracking-widest"
          style={{ background: `linear-gradient(135deg,${col.from},${col.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          {category}
        </h3>
        <span className="ml-auto text-[10px] text-gray-600">{catSkills.length}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {catSkills.map((skill, i) => (
          <SkillOrb key={skill._id} {...skill} index={i} />
        ))}
      </div>
    </motion.div>
  );
};

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    api.get('/skills').then(res => setSkills(res.data.data)).catch(() => {});
  }, []);

  const categories = ['All', ...new Set(skills.map(s => s.category))];
  const filtered = activeCategory === 'All' ? skills : skills.filter(s => s.category === activeCategory);
  const grouped = filtered.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <section id="skills" className="section-padding relative overflow-hidden bg-page">
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <p className="text-indigo-400 text-sm font-mono uppercase tracking-widest mb-2">// tech stack</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">
            Skills & <span className="text-gradient">Technologies</span>
          </h2>
        </motion.div>

        {/* filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 2-column grid of category blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(grouped).map(([category, catSkills], gi) => (
            <CategoryBlock key={category} category={category} catSkills={catSkills} gi={gi} />
          ))}
        </div>

        {skills.length === 0 && (
          <div className="text-center py-12 text-gray-600">Loading skills...</div>
        )}
      </div>
    </section>
  );
};

export default Skills;
