import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaCode, FaLayerGroup, FaServer, FaProjectDiagram, FaTasks, FaComments,
  FaMobile, FaDatabase, FaCloud, FaArrowRight,
} from 'react-icons/fa';
import api from '../../utils/api';

const iconMap = { FaCode, FaLayerGroup, FaServer, FaProjectDiagram, FaTasks, FaComments, FaMobile, FaDatabase, FaCloud };

const cardGradients = [
  'from-indigo-600/20 to-indigo-600/5',
  'from-purple-600/20 to-purple-600/5',
  'from-pink-600/20 to-pink-600/5',
  'from-cyan-600/20 to-cyan-600/5',
  'from-emerald-600/20 to-emerald-600/5',
  'from-amber-600/20 to-amber-600/5',
];
const iconColors = ['text-indigo-400','text-purple-400','text-pink-400','text-cyan-400','text-emerald-400','text-amber-400'];
const glowColors = ['rgba(99,102,241,0.2)','rgba(168,85,247,0.2)','rgba(236,72,153,0.2)','rgba(6,182,212,0.2)','rgba(16,185,129,0.2)','rgba(245,158,11,0.2)'];
const borderColors = ['border-indigo-500/20','border-purple-500/20','border-pink-500/20','border-cyan-500/20','border-emerald-500/20','border-amber-500/20'];

const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get('/services').then(res => setServices(res.data.data)).catch(() => {});
  }, []);

  if (!services.length) return null;

  return (
    <section id="services" className="section-padding relative overflow-hidden bg-services">

      <div className="absolute top-8 right-0 text-[8rem] font-black text-white/[0.015] select-none pointer-events-none leading-none">
        SERVICES
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-indigo-400 text-sm font-mono uppercase tracking-widest mb-2">// what I do</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">
            Services I <span className="text-gradient">Offer</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] || FaCode;
            const colorIdx = i % cardGradients.length;
            return (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ y: -6, boxShadow: `0 20px 60px ${glowColors[colorIdx]}` }}
                className={`relative rounded-2xl p-6 border ${borderColors[colorIdx]} bg-gradient-to-br ${cardGradients[colorIdx]} backdrop-blur-sm overflow-hidden group transition-all duration-300`}
              >
                {/* bg glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 bg-gradient-to-br ${cardGradients[colorIdx]}`} />

                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${iconColors[colorIdx]}`}>
                  <Icon size={22} />
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>

                {service.pricing && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <span className={`text-xs font-semibold ${iconColors[colorIdx]}`}>{service.pricing}</span>
                  </div>
                )}

                <div className={`absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity ${iconColors[colorIdx]}`}>
                  <FaArrowRight size={14} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
