import React, { Suspense, lazy } from 'react';
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
import ErrorBoundary from './components/ErrorBoundary';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import PublicLayout from './components/PublicLayout';
import ToastProvider from './components/Toast';
import { propertyQueries } from '@/services/properties';
import { STALE_TIME } from '@/services/cachePolicy';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import DynamicSEO from './components/DynamicSEO';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: STALE_TIME.standard,
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

// International section. The hub triages three audiences; UN & diplomatic
// housing is the one that needs a page of its own.
//
// SHELVED (phase deferred): the section is withheld from the public site for
// now. The pages and their content live on under src/pages/International.jsx
// and src/pages/international/ — restore by uncommenting these two imports,
// the routes below, the nav entry in src/components/header/navItems.js, the
// admin nav entry in src/pages/admin/header/adminNavItems.js, and the two
// sitemap URLs in public/sitemap.xml.
// const International = lazy(() => import('./pages/International'));
// const UNHousing = lazy(() => import('./pages/UNHousing'));

// Statutory pages. Mandatory for a business processing personal data under the
// Kenyan Data Protection Act, 2019 — the footer has linked to them all along.
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

// Placeholder components for new service pages
const ViewingExperience = lazy(() => import('./components/services/ViewingExperience'));

// Admin sign-in (Supabase Auth)
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

// Admin components. Lazy-loaded: the admin console is reachable only by a
// signed-in admin, so none of it belongs in the bundle a first-time visitor
// downloads.
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProperties = lazy(() => import('./pages/admin/AdminProperties'));
// Analytics that delays the first paint is measuring a page it made slower.
const Analytics = lazy(() =>
  import('@vercel/analytics/react').then((module) => ({ default: module.Analytics }))
);
const SpeedInsights = lazy(() =>
  import('@vercel/speed-insights/react').then((module) => ({ default: module.SpeedInsights }))
);

// Statically imported for a branch that is false on every normal load.
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));

const Bookings = lazy(() => import('./features/bookings/Bookings'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const ClientManagement = lazy(() => import('./pages/admin/ClientManagement'));
const ClientDetail = lazy(() => import('./pages/admin/ClientDetail'));
const Settings = lazy(() => import('./pages/admin/Settings'));

const PropertyModal = lazy(() => import('./components/PropertyModal'));

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
      <Suspense fallback={null}>
        <MaintenancePage
          durationDays={maintenanceConfig.durationDays}
          message={maintenanceConfig.message}
          brandName={maintenanceConfig.brandName}
          brandLogo={maintenanceConfig.brandLogo}
          tagline={maintenanceConfig.tagline}
        />
      </Suspense>
    );
  }

  return (
    <ErrorBoundary name="root">
      <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
        <ToastProvider />
        {/* Below the router's Suspense would be tidier, but these two mount
            once for the whole app and must not remount per route. */}
        <Suspense fallback={null}>
          <Analytics />
          <SpeedInsights />
        </Suspense>
      {/* Dynamic SEO using settings */}
      <DynamicSEO />
      
      <Router>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        }>
          <ErrorBoundary name="route">
          <Routes>
            {/*
              Every public page hangs off one layout route. The chrome — header,
              footer, and the route-aware canonical tag — is rendered once by
              <PublicLayout> instead of eleven times by eleven pages, so the
              header's scroll listener survives navigation instead of being torn
              down and rebuilt on each one.
            */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              {/* International section — SHELVED for a later phase.
              <Route path="/international" element={<International />} />
              <Route path="/international/un-housing" element={<UNHousing />} />
              */}

              {/* Updated services routes */}
              <Route path="/services" element={<Services />} />
              <Route path="/services/viewing" element={<ViewingExperience />} />

              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Statutory pages linked from the footer on every page */}
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />

              {/* Enhanced 404 page. Inside the layout so a mistyped URL still
                  offers the navigation that gets the visitor somewhere real. */}
              <Route path="*" element={<NotFound />} />
            </Route>

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
                    <ErrorBoundary name="admin">
                      <Outlet />
                    </ErrorBoundary>
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
          </Routes>
          </ErrorBoundary>
        </Suspense>
      </Router>
      </SettingsProvider>
    </AuthProvider>
      </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

/**
 * The 404. It renders inside <PublicLayout>, so it supplies only its <main> —
 * the header and footer come from the layout route, which is the point: a
 * visitor who mistyped a URL keeps the navigation that gets them somewhere real.
 */
const NotFound = () => (
  <main className="flex-grow container mx-auto px-4 py-32 text-center">
    <Helmet>
      <title>Page Not Found | Raslipwani Properties</title>
      {/* A soft 404 that search engines are welcome to index is worse than none. */}
      <meta name="robots" content="noindex" />
    </Helmet>
    <h1 className="text-4xl font-bold mb-6">Page Not Found</h1>
    <p className="text-xl mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
    <Link
      to="/"
      className="inline-block bg-primary text-content-on-brand font-bold py-3 px-8 rounded-md hover:bg-primary-dark transition-colors"
    >
      Return to Homepage
    </Link>
  </main>
);

const PropertyModalRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: property, isLoading: loading } = useQuery(propertyQueries.detail(id));

  const closeModal = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-scrim/80 z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-line-media"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-scrim/80 z-50 flex items-center justify-center">
      {property ? (
        <PropertyModal property={property} closeModal={closeModal} />
      ) : (
        <div className="bg-surface-raised p-8 rounded-xl max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <p>The property you requested doesn't exist or has been removed.</p>
          <button 
            onClick={closeModal}
            className="mt-6 bg-primary text-content-on-brand py-2 px-6 rounded-lg hover:bg-primary-dark"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default App;