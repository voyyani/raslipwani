import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { inject } from '@vercel/analytics';

// Initialize Vercel Analytics on the client side
inject();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <>
        <SpeedInsights />
        <App />
      </>
    </HelmetProvider>
  </React.StrictMode>
);
