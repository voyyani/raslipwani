import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
// Add Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css';
import { SpeedInsights } from "@vercel/speed-insights/react";
ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
 

  <React.StrictMode>
    <App />
  </React.StrictMode>
  </HelmetProvider>
);
