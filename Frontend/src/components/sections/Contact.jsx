import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const iconMap = { FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaEnvelope };

const inputClass = "w-full px-4 py-3 bg-white/5 border border-[var(--border)] hover:border-indigo-500/40 focus:border-indigo-500 rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-all text-sm";

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [socials, setSocials] = useState([]);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get('/social').then(res => setSocials(res.data.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section-padding relative overflow-hidden bg-contact">

      <div className="absolute top-8 right-0 text-[8rem] font-black text-white/[0.015] select-none pointer-events-none leading-none">
        CONTACT
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-white">
            Let's <span className="text-gradient">Build Together</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* left info col */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 flex flex-col gap-8"
          >
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Got a project in mind?</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                I'm open to freelance work, collaborations, and full-time opportunities. Drop me a message and I'll get back within 24 hours.
              </p>
            </div>

            {/* email block */}
            <a href="mailto:manojaryal2003@gmail.com"
              className="flex items-center gap-4 p-4 rounded-2xl glass border border-white/5 hover:border-indigo-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                <FaEnvelope className="text-indigo-400" size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-widest">Email</p>
                <p className="text-sm text-white font-medium truncate">manojaryal2003@gmail.com</p>
              </div>
            </a>

            {/* availability */}
            <div className="p-4 rounded-2xl glass border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-sm text-emerald-300 font-medium">Available for new projects</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-5">Response time: within 2 hours</p>
            </div>

            {/* socials */}
            {socials.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Find me on</p>
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
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 flex items-center justify-center text-gray-400 hover:text-indigo-300 transition-all"
                      >
                        <Icon size={16} />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="glass rounded-2xl p-6 sm:p-8 border border-white/5">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <FaPaperPlane size={24} className="text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Message Sent!</h4>
                  <p className="text-gray-400 text-sm">Thanks for reaching out. I'll reply within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                        placeholder="John Doe"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        required
                        placeholder="john@example.com"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">Message</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      required
                      rows={5}
                      placeholder="Tell me about your project..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><FaPaperPlane size={14} /> Send Message</>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
