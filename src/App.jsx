import React, { Suspense, lazy, useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Outlet,
  useParams,
  useNavigate,
  Link
} from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import AdminLayout from './pages/admin/AdminLayout';
import Header from './components/Header';
import Footer from './components/Footer';
import ToastProvider from './components/Toast';
import { supabase } from './utils/supabaseClient';
import { SettingsProvider } from './contexts/SettingsContext';
import DynamicSEO from './components/DynamicSEO';
import MaintenancePage from './pages/MaintenancePage';
import './styles/admin-mobile.css'; // Import admin mobile optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
// Lazy-loaded main components
const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const Services = lazy(() => import('./pages/ServicesMain')); // Updated path
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

// International market page
const International = lazy(() => import('./pages/International'));

// Statutory pages. Mandatory for a business processing personal data under the
// Kenyan Data Protection Act, 2019 — the footer has linked to them all along.
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

// Placeholder components for new service pages
const ViewingExperience = lazy(() => import('./components/services/ViewingExperience'));

// Admin sign-in (Supabase Auth)
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

// Admin components
import Dashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/AdminProperties';
import Bookings from './features/bookings/Bookings';
import AdminBookings from './pages/admin/AdminBookings';
import ClientManagement from './pages/admin/ClientManagement';
import ClientDetail from './pages/admin/ClientDetail';
import Settings from './pages/admin/Settings';
import PropertyModal from './components/PropertyModal'; 

const defaultBrandLogo = 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1751885050/Raslipwani_Logo_qgwaen.jpg';

const getMaintenanceConfig = () => {
  const isEnabled =
    import.meta.env.VITE_MAINTENANCE_MODE === 'true' ||
    import.meta.env.VITE_MAINTENANCE_MODE === '1';

  const durationDays = Number(import.meta.env.VITE_MAINTENANCE_DAYS ?? 7);

  return {
    enabled: isEnabled,
    durationDays: Number.isFinite(durationDays) && durationDays > 0 ? durationDays : 7,
    message:
      import.meta.env.VITE_MAINTENANCE_MESSAGE ||
      'We are refining the experience behind the scenes to bring you a faster, smoother, and more secure platform.',
    brandName: import.meta.env.VITE_SITE_NAME || 'Raslipwani Properties',
    brandLogo: import.meta.env.VITE_SITE_LOGO || defaultBrandLogo,
    tagline: import.meta.env.VITE_SITE_TAGLINE || 'Your Premier Real Estate Partner Across Kenya',
  };
};

function App() {
  const maintenanceConfig = getMaintenanceConfig();

  if (maintenanceConfig.enabled) {
    return (
      <MaintenancePage
        durationDays={maintenanceConfig.durationDays}
        message={maintenanceConfig.message}
        brandName={maintenanceConfig.brandName}
        brandLogo={maintenanceConfig.brandLogo}
        tagline={maintenanceConfig.tagline}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
        <ToastProvider />
        <Analytics />
        <SpeedInsights />
      {/* Dynamic SEO using settings */}
      <DynamicSEO />
      
      <Router>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            {/* International market route */}
            <Route path="/international" element={<International />} />
            
            
            {/* Updated services routes */}
            <Route path="/services" element={<Services />} />
            <Route path="/services/viewing" element={<ViewingExperience />} />
            
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Statutory pages linked from the footer on every page */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            
            {/* SEO-friendly redirects */}
            <Route path="/listings" element={<Navigate to="/properties" replace />} />
            <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
            
            <Route path="/property/:id" element={<PropertyModalRoute />} />
            <Route
              path="/maintenance"
              element={
                <MaintenancePage
                  durationDays={maintenanceConfig.durationDays}
                  message={maintenanceConfig.message}
                  brandName={maintenanceConfig.brandName}
                  brandLogo={maintenanceConfig.brandLogo}
                  tagline={maintenanceConfig.tagline}
                />
              }
            />
             
            {/* Must precede /admin so the protected branch does not swallow it */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Outlet />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            >
              <Route index element={<Dashboard />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="viewings" element={<Bookings />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="clients" element={<ClientManagement />} />
              <Route path="clients/:id" element={<ClientDetail />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Enhanced 404 page */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-32 text-center">
                  <h1 className="text-4xl font-bold mb-6">Page Not Found</h1>
                  <p className="text-xl mb-8">The page you're looking for doesn't exist or has been moved.</p>
                  <Link 
                    to="/" 
                    className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Return to Homepage
                  </Link>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </Suspense>
      </Router>
      </SettingsProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

const PropertyModalRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setProperty(data);
      } catch (err) {
        console.error('Failed to load property:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchProperty();
  }, [id]);

  const closeModal = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      {property ? (
        <PropertyModal property={property} closeModal={closeModal} />
      ) : (
        <div className="bg-white p-8 rounded-xl max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <p>The property you requested doesn't exist or has been removed.</p>
          <button 
            onClick={closeModal}
            className="mt-6 bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary-dark"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default App;