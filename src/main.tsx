import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index-new-layout.css?v=2';

// Register service worker for PWA with immediate updates
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Force immediate update check
      registration.update();
      
      // Listen for updates and reload immediately
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              window.location.reload();
            }
          });
        }
      });
    }).catch(() => {
      // Service worker registration handled by Vite PWA plugin
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

