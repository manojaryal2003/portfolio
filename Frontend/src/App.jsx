import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

// Pages
import Home from './pages/Home';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import AdminHero from './pages/admin/AdminHero';
import AdminAbout from './pages/admin/AdminAbout';
import AdminStats from './pages/admin/AdminStats';
import AdminSkills from './pages/admin/AdminSkills';
import AdminServices from './pages/admin/AdminServices';
import AdminProjects from './pages/admin/AdminProjects';
import AdminExperience from './pages/admin/AdminExperience';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminBlog from './pages/admin/AdminBlog';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSocial from './pages/admin/AdminSocial';

const AdminPage = ({ component: Component }) => (
  <ProtectedRoute>
    <AdminLayout>
      <Component />
    </AdminLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', fontSize: '14px' },
            }}
          />
          <Routes>
            {/* Portfolio */}
            <Route path="/" element={<Home />} />

            {/* Admin */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminPage component={Dashboard} />} />
            <Route path="/admin/hero" element={<AdminPage component={AdminHero} />} />
            <Route path="/admin/about" element={<AdminPage component={AdminAbout} />} />
            <Route path="/admin/stats" element={<AdminPage component={AdminStats} />} />
            <Route path="/admin/skills" element={<AdminPage component={AdminSkills} />} />
            <Route path="/admin/services" element={<AdminPage component={AdminServices} />} />
            <Route path="/admin/projects" element={<AdminPage component={AdminProjects} />} />
            <Route path="/admin/experience" element={<AdminPage component={AdminExperience} />} />
            <Route path="/admin/testimonials" element={<AdminPage component={AdminTestimonials} />} />
            <Route path="/admin/blog" element={<AdminPage component={AdminBlog} />} />
            <Route path="/admin/messages" element={<AdminPage component={AdminMessages} />} />
            <Route path="/admin/social" element={<AdminPage component={AdminSocial} />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
