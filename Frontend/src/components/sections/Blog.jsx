import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendar, FaTag, FaArrowRight } from 'react-icons/fa';
import api from '../../utils/api';

const Blog = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/blog').then(res => setPosts(res.data.data)).catch(() => {});
  }, []);

  if (!posts.length) return null;

  return (
    <section id="blog" className="section-padding relative overflow-hidden bg-blog">

      <div className="absolute top-8 right-0 text-[8rem] font-black text-white/[0.015] select-none pointer-events-none leading-none">
        BLOG
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <p className="text-indigo-400 text-sm font-mono uppercase tracking-widest mb-2">// latest posts</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">
            Blog & <span className="text-gradient">Insights</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.slice(0, 6).map((post, i) => (
            <motion.article
              key={post._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/25 bg-white/[0.02] group transition-all duration-300 flex flex-col"
            >
              <div className="h-44 overflow-hidden flex-shrink-0">
                {post.image ? (
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-600/30 to-purple-600/30 flex items-center justify-center">
                    <span className="text-4xl font-black text-white/10">{post.title?.[0]}</span>
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <FaCalendar size={9} />
                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {post.category && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs">
                      <FaTag size={7} /> {post.category}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors flex-1">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold group-hover:gap-2.5 transition-all mt-auto">
                  Read More <FaArrowRight size={10} />
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
