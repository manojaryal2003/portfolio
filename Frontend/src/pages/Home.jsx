import { useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/layout/WhatsAppButton';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Skills from '../components/sections/Skills';
import Services from '../components/sections/Services';
import Projects from '../components/sections/Projects';
import FeaturedProjects from '../components/sections/FeaturedProjects';
import Experience from '../components/sections/Experience';
import Testimonials from '../components/sections/Testimonials';
import Blog from '../components/sections/Blog';
import Contact from '../components/sections/Contact';
import ErrorBoundary from '../components/ErrorBoundary';

const Home = () => {
  useEffect(() => {
    document.body.classList.add('portfolio-cursor');
    return () => document.body.classList.remove('portfolio-cursor');
  }, []);

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <ErrorBoundary name="Hero"><Hero /></ErrorBoundary>
      <ErrorBoundary name="About"><About /></ErrorBoundary>
      <ErrorBoundary name="Skills"><Skills /></ErrorBoundary>
      <ErrorBoundary name="Services"><Services /></ErrorBoundary>
      <ErrorBoundary name="FeaturedProjects"><FeaturedProjects /></ErrorBoundary>
      <ErrorBoundary name="Projects"><Projects /></ErrorBoundary>
      <ErrorBoundary name="Experience"><Experience /></ErrorBoundary>
      <ErrorBoundary name="Testimonials"><Testimonials /></ErrorBoundary>
      <ErrorBoundary name="Blog"><Blog /></ErrorBoundary>
      <ErrorBoundary name="Contact"><Contact /></ErrorBoundary>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Home;
