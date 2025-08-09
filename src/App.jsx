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
import { ClerkProvider, useUser, RedirectToSignIn } from '@clerk/clerk-react';
import AdminLayout from './pages/admin/AdminLayout';
import Header from './components/Header';
import Footer from './components/Footer';
import { supabase } from './utils/supabaseClient';

// Lazy-loaded main components
const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const Services = lazy(() => import('./pages/ServicesMain')); // Updated path
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

// Placeholder components for new service pages
const PropertySales = lazy(() => import('./components/services/PropertySales'));
const PropertyAcquisition = lazy(() => import('./components/services/PropertyAcquisition'));
const PropertyValuation = lazy(() => import('./components/services/PropertyValuation'));
const PropertyManagement = lazy(() => import('./components/services/PropertyManagement'));
const ViewingExperience = lazy(() => import('./components/services/ViewingExperience'));

// Admin components
import Dashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/AdminProperties';
import Bookings from './features/bookings/Bookings';
import ClientManagement from './pages/admin/ClientManagement';
import PropertyModal from './components/PropertyModal'; 

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser();
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }
  
  return children;
};

function App() {
  if (!clerkPubKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="mb-4">
            Clerk publishable key is missing. Please set up your environment variables:
          </p>
          <ol className="list-decimal pl-5 mb-4 space-y-2">
            <li>Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in project root</li>
            <li>Add <code className="bg-gray-100 px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY=your_key_here</code></li>
            <li>Restart the development server</li>
          </ol>
          <p className="mb-2">
            Get your keys from{' '}
            <a 
              href="https://dashboard.clerk.com" 
              className="text-blue-600 hover:underline font-medium"
              target="_blank"
              rel="noreferrer"
            >
              Clerk Dashboard
            </a>
          </p>
          <p className="text-sm text-gray-600 mt-4">
            If you've already added the key, make sure you've restarted the server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      appearance={{
        baseTheme: "dark",
        variables: {
          colorPrimary: '#0D4B6E',
        }
      }}
    >
      {/* Global SEO Structure */}
      <Helmet>
        <html lang="en" />
        <link rel="canonical" href="https://raslipwani.com" />
        
        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Raslipwani Properties",
            "url": "https://raslipwani.com/",
            "logo": "https://raslipwani.com/logo.png",
            "sameAs": [
              "https://www.facebook.com/raslipwani",
              "https://www.instagram.com/raslipwani",
              "https://twitter.com/raslipwani"
            ],
            "contactPoint": [{
              "@type": "ContactPoint",
              "telephone": "+254758066526",
              "contactType": "Customer Service",
              "areaServed": "KE"
            }]
          })}
        </script>
        
        {/* Website Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Raslipwani Properties",
            "url": "https://raslipwani.com/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://raslipwani.com/properties?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      
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
            
            {/* Updated services routes */}
            <Route path="/services" element={<Services />} />
            <Route path="/services/sales" element={<PropertySales />} />
            <Route path="/services/acquisition" element={<PropertyAcquisition />} />
            <Route path="/services/valuation" element={<PropertyValuation />} />
            <Route path="/services/management" element={<PropertyManagement />} />
            <Route path="/services/viewing" element={<ViewingExperience />} />
            
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* SEO-friendly redirects */}
            <Route path="/listings" element={<Navigate to="/properties" replace />} />
            <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
            
            <Route path="/property/:id" element={<PropertyModalRoute />} />
            
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
              <Route path="clients" element={<ClientManagement />} />
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
    </ClerkProvider>
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
