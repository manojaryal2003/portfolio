import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../../utils/api';

const TestimonialCard = ({ t, i }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: i * 0.08 }}
    className="glass rounded-2xl p-6 border border-white/5 hover:border-indigo-500/20 transition-all flex flex-col gap-4"
  >
    <FaQuoteLeft className="text-indigo-500/40 text-2xl" />
    <p className="text-gray-400 text-sm leading-relaxed flex-1">"{t.message}"</p>
    <div className="flex items-center gap-3 pt-3 border-t border-white/5">
      {t.photo ? (
        <img src={t.photo} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {t.name?.[0]}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-semibold text-white text-sm truncate">{t.name}</p>
        {t.company && <p className="text-xs text-gray-500 truncate">{t.company}</p>}
      </div>
      <div className="ml-auto flex gap-0.5 flex-shrink-0">
        {Array.from({ length: t.rating || 5 }).map((_, ri) => (
          <FaStar key={ri} size={11} className="text-yellow-400" />
        ))}
      </div>
    </div>
  </motion.div>
);

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.get('/testimonials').then(res => setTestimonials(res.data.data)).catch(() => {});
  }, []);

  if (!testimonials.length) return null;

  const prev = () => setCurrent(c => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent(c => (c + 1) % testimonials.length);

  return (
    <section className="section-padding relative overflow-hidden bg-page">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="absolute top-8 left-0 text-[8rem] font-black text-white/[0.015] select-none pointer-events-none leading-none">
        TESTIMONIALS
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-white">
            What Clients <span className="text-gradient">Say</span>
          </h2>
        </motion.div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => <TestimonialCard key={t._id} t={t} i={i} />)}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <TestimonialCard t={testimonials[current]} i={0} />
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={prev} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 flex items-center justify-center text-gray-400 hover:text-white transition-all">
              <FaChevronLeft size={13} />
            </button>
            <div className="flex gap-1.5">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all ${i === current ? 'bg-indigo-500 w-5' : 'bg-white/15 w-1.5'}`}
                />
              ))}
            </div>
            <button onClick={next} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 flex items-center justify-center text-gray-400 hover:text-white transition-all">
              <FaChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
