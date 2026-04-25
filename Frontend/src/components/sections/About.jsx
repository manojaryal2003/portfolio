import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaBuilding, FaUserTie, FaArrowRight } from 'react-icons/fa';
import api from '../../utils/api';

const About = () => {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    api.get('/about').then(res => setAbout(res.data.data)).catch(() => {});
  }, []);

  return (
    <section id="about" className="section-padding relative overflow-hidden bg-about">

      {/* section label */}
      <div className="absolute top-12 right-8 text-[10rem] font-black text-white/[0.02] select-none pointer-events-none leading-none">
        ABOUT
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-indigo-400 text-sm font-mono uppercase tracking-widest mb-2">// about me</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">
            The person <span className="text-gradient">behind the code</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* accent lines */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-indigo-500/50 rounded-tl-2xl" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-purple-500/50 rounded-br-2xl" />

              <div className="w-64 h-72 sm:w-72 sm:h-80 rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                {about?.profileImage ? (
                  <img src={about.profileImage} alt="About" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                    <FaUserTie size={80} className="text-white/20" />
                  </div>
                )}
                {/* bottom name plate */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                  <div className="glass-strong rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600/30 flex items-center justify-center">
                      <FaBuilding className="text-indigo-400" size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Working at</p>
                      <p className="text-sm font-bold text-white">{about?.company || 'Smart IT Solution'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {about?.role || 'Full Stack Developer & Project Manager'}
            </h3>
            <p className="text-indigo-400 font-mono text-sm mb-5">
              @ {about?.company || 'Smart IT Solution'}
            </p>

            <p className="text-gray-400 leading-relaxed mb-6 text-base">
              {about?.description || 'Experienced Full Stack Developer and Project Manager with a passion for building modern web applications and leading teams to deliver exceptional results.'}
            </p>

            {about?.experience && (
              <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <span className="text-gray-300 text-sm">{about.experience}</span>
              </div>
            )}

            {about?.expertise?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Core Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {about.expertise.map((skill, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            <motion.button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ x: 4 }}
              className="mt-8 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors"
            >
              Let's work together <FaArrowRight size={12} />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
