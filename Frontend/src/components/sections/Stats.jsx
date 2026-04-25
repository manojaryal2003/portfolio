import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaProjectDiagram, FaUsers, FaUserTie, FaBriefcase } from 'react-icons/fa';
import api from '../../utils/api';

const iconMap = { FaProjectDiagram, FaUsers, FaUserTie, FaBriefcase };

const useCounter = (end, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!start || started.current) return;
    started.current = true;
    const startTime = performance.now();
    const animate = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) requestAnimationFrame(animate);
      else setCount(end);
    };
    requestAnimationFrame(animate);
  }, [start, end, duration]);
  return count;
};

const accents = ['#6366f1','#a855f7','#ec4899','#06b6d4'];
const glows   = ['rgba(99,102,241,0.25)','rgba(168,85,247,0.25)','rgba(236,72,153,0.25)','rgba(6,182,212,0.25)'];

const StatItem = ({ stat, i, inView }) => {
  const Icon = iconMap[stat.icon] || FaBriefcase;
  const count = useCounter(stat.value, 2000, inView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      className="relative flex flex-col items-center text-center group"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
        style={{ background: `${accents[i % 4]}22`, boxShadow: inView ? `0 0 24px ${glows[i % 4]}` : 'none' }}
      >
        <Icon size={24} style={{ color: accents[i % 4] }} />
      </div>
      <div
        className="text-4xl sm:text-5xl font-black mb-1 tabular-nums"
        style={{ color: accents[i % 4], textShadow: `0 0 20px ${accents[i % 4]}60` }}
      >
        {count}{stat.suffix || '+'}
      </div>
      <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">{stat.label}</p>
    </motion.div>
  );
};

const Stats = () => {
  const [stats, setStats] = useState([]);
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    api.get('/stats').then(res => setStats(res.data.data)).catch(() => {});
  }, []);

  const defaultStats = [
    { label: 'Projects Completed', value: 50, suffix: '+', icon: 'FaProjectDiagram' },
    { label: 'Clients Served', value: 30, suffix: '+', icon: 'FaUsers' },
    { label: 'Team Members', value: 15, suffix: '+', icon: 'FaUserTie' },
    { label: 'Years Experience', value: 5, suffix: '+', icon: 'FaBriefcase' },
  ];

  const displayStats = stats.length > 0 ? stats : defaultStats;

  return (
    <section ref={ref} className="py-20 relative overflow-hidden bg-stats">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      {/* divider line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {displayStats.map((stat, i) => (
            <StatItem key={stat._id || i} stat={stat} i={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
