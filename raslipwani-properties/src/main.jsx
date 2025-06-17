import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
// Add Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
 

  <React.StrictMode>
    <App />
  </React.StrictMode>
  </HelmetProvider>
);
