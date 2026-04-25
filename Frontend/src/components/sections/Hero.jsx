import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { FaDownload, FaEnvelope, FaArrowRight } from 'react-icons/fa';
import api from '../../utils/api';

/* ── Custom cursor ── */
const Cursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const raf = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top = e.clientY + 'px';
      }
    };

    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12);
      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x + 'px';
        ringRef.current.style.top = ring.current.y + 'px';
      }
      raf.current = requestAnimationFrame(tick);
    };

    const onEnter = () => {
      dotRef.current?.classList.add('hovered');
      ringRef.current?.classList.add('hovered');
    };
    const onLeave = () => {
      dotRef.current?.classList.remove('hovered');
      ringRef.current?.classList.remove('hovered');
    };

    window.addEventListener('mousemove', onMove);
    document.querySelectorAll('a,button,label,[data-hover]').forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
};

/* ── Scramble text ── */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
const ScrambleText = ({ texts, className }) => {
  const [display, setDisplay] = useState('');
  const indexRef = useRef(0);
  const iterRef = useRef(0);

  useEffect(() => {
    if (!texts?.length) return;
    let frame;
    const run = () => {
      const target = texts[indexRef.current % texts.length];
      iterRef.current++;
      setDisplay(
        target.split('').map((ch, i) =>
          i < Math.floor(iterRef.current / 2)
            ? ch
            : CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join('')
      );
      if (iterRef.current < target.length * 2) {
        frame = setTimeout(run, 40);
      } else {
        iterRef.current = 0;
        indexRef.current++;
        frame = setTimeout(run, 2800);
      }
    };
    frame = setTimeout(run, 300);
    return () => clearTimeout(frame);
  }, [texts]);

  return <span className={className}>{display}<span className="text-indigo-400 animate-pulse">_</span></span>;
};

/* ── Floating particles ── */
const Particles = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 6,
    dur: Math.random() * 8 + 6,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-indigo-400/30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [-20, 20, -20], opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

/* ── Count-up number ── */
const CountUp = ({ target, suffix }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = () => {
      start += Math.ceil(target / 40);
      if (start >= target) { setVal(target); return; }
      setVal(start);
      requestAnimationFrame(step);
    };
    const t = setTimeout(() => requestAnimationFrame(step), 600);
    return () => clearTimeout(t);
  }, [target]);
  return <>{val}{suffix}</>;
};

const findStat = (stats, kw) => stats.find(s => s.label.toLowerCase().includes(kw.toLowerCase()));

const Hero = () => {
  const [hero, setHero] = useState(null);
  const [stats, setStats] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    api.get('/hero').then(r => setHero(r.data.data)).catch(() => {});
    api.get('/stats').then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  const expStat = findStat(stats, 'experience');
  const projStat = findStat(stats, 'project');
  const clientStat = findStat(stats, 'client');

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <Cursor />
      <section
        id="home"
        ref={containerRef}
        className="relative min-h-screen flex items-center overflow-hidden grid-bg bg-hero"
      >
        <Particles />

        {/* Big ambient glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* ── LEFT ── */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* availability badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full neon-border mb-6 text-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-gray-300">Available for projects</span>
              </motion.div>

              {/* name */}
              <h1
                className="glitch text-5xl sm:text-6xl lg:text-7xl font-black leading-none mb-3 text-white"
                data-text={`Hi, I'm\n${hero?.name || 'Smart IT'}`}
              >
                <span className="text-gray-400 text-3xl sm:text-4xl font-light block mb-1">Hi, I'm</span>
                <span className="text-gradient">{hero?.name || 'Smart IT Solution'}</span>
              </h1>

              {/* scramble role */}
              <div className="text-xl sm:text-2xl font-mono mb-6 h-9 text-gray-300">
                <ScrambleText
                  texts={hero?.typingTexts || ['Full Stack Developer', 'MERN Stack Expert', 'Project Manager']}
                  className="text-indigo-300"
                />
              </div>

              <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-10 max-w-lg">
                {hero?.introduction || 'Building high-performance web apps that clients love. From architecture to deployment — I own the full stack.'}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4 mb-14">
                <motion.button
                  onClick={() => scrollTo('projects')}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center gap-2 overflow-hidden transition-colors"
                >
                  <span className="relative z-10">View Work</span>
                  <FaArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>

                <motion.button
                  onClick={() => scrollTo('contact')}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-7 py-3.5 neon-border text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-white/5 transition-colors"
                >
                  <FaEnvelope size={14} /> Hire Me
                </motion.button>

                {hero?.cvUrl && (
                  <motion.a
                    href={hero.cvUrl}
                    download
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-7 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold flex items-center gap-2 border border-white/10 transition-colors"
                  >
                    <FaDownload size={14} /> Resume
                  </motion.a>
                )}
              </div>

              {/* stats strip */}
              <div className="flex gap-8">
                {[
                  { value: expStat?.value || 5, suffix: expStat?.suffix || '+', label: 'Years Exp.' },
                  { value: projStat?.value || 50, suffix: projStat?.suffix || '+', label: 'Projects' },
                  { value: clientStat?.value || 30, suffix: clientStat?.suffix || '+', label: 'Happy Clients' },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="text-3xl font-black text-gradient tabular-nums">
                      <CountUp target={Number(s.value) || 0} suffix={s.suffix} />
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── RIGHT — profile image ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center lg:justify-center"
            >
              <div className="relative float-slow">
                {/* outer glow ring */}
                <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 blur-2xl" />

                {/* hex frame */}
                <div
                  className="relative w-64 h-64 sm:w-80 sm:h-80"
                  style={{
                    clipPath: 'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
                    background: 'linear-gradient(135deg,#6366f1,#a855f7,#ec4899)',
                    padding: '3px',
                  }}
                >
                  <div
                    className="w-full h-full overflow-hidden"
                    style={{ clipPath: 'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)' }}
                  >
                    {hero?.profileImage ? (
                      <img src={hero.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                        <span className="text-white text-7xl font-black opacity-40">S</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* orbiting dot */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-4 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/80" />
                </motion.div>
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-pink-400 shadow-lg shadow-pink-400/80" />
                </motion.div>

                {/* floating tag cards */}
                <motion.div
                  animate={{ y: [-6, 6, -6] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -left-14 top-1/4 glass-strong px-4 py-2.5 rounded-xl whitespace-nowrap"
                >
                  <p className="text-xs text-gray-400">Experience</p>
                  <p className="text-sm font-bold text-indigo-300">
                    {expStat ? `${expStat.value}${expStat.suffix || '+'} Years` : '5+ Years'}
                  </p>
                </motion.div>

                <motion.div
                  animate={{ y: [6, -6, 6] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -right-14 bottom-1/4 glass-strong px-4 py-2.5 rounded-xl whitespace-nowrap"
                >
                  <p className="text-xs text-gray-400">Projects Done</p>
                  <p className="text-sm font-bold text-purple-300">
                    {projStat ? `${projStat.value}${projStat.suffix || '+'}` : '50+'}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gray-600 uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-indigo-500 to-transparent" />
        </motion.div>
      </section>
    </>
  );
};

export default Hero;
