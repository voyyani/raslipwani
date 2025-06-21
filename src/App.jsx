import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Outlet  
} from 'react-router-dom';
import { ClerkProvider, useUser, RedirectToSignIn } from '@clerk/clerk-react';
import AdminLayout from './pages/admin/AdminLayout';

import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/AdminProperties';
import Bookings from './pages/admin/Bookings';
import ClientManagement from './pages/admin/ClientManagement';
import PropertyModal from './components/PropertyModal'; 
import { Analytics } from "@vercel/analytics/next"
// Get Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser();
  
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }
  
  return children;
};

function App() {
  // Show error if Clerk key is missing
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
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* New route for property modal */}
          <Route path="/property/:id" element={<PropertyModalRoute />} />
          
          {/* Protected admin routes */}
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
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ClerkProvider>
  );
}

// New component to handle property modal route
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
    navigate(-1); // Go back to previous page when closing modal
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