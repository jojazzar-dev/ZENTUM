import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// --- محرك تحويل الموقع إلى تطبيق (PWA Registration Engine) ---
// هذا الكود هو المسؤول عن إظهار رسالة "Add to Home Screen"
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // تسجيل ملف الخدمة من المسار الرئيسي لضمان تغطية كامل صفحات التداول
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('ZENTUM PWA: Engine is Online and ready.');

        // فحص التحديثات الجديدة لضمان دقة الأسعار دائماً
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) return;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('ZENTUM: New version available. Please refresh.');
              }
            }
          };
        };
      })
      .catch(error => {
        console.error('ZENTUM PWA: System failed to start.', error);
      });
  });
}