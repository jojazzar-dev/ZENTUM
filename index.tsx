import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// استيراد ملف التنسيقات العالمي لضبط توافق الموبايل
import './index.css'; 

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

/**
 * ZENTUM PWA ENGINE - REGISTRATION SYSTEM
 * ---------------------------------------
 * مسؤول عن تحويل الموقع إلى تطبيق قابل للتثبيت على واجهة الموبايل
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // تسجيل ملف الخدمة sw.js لضمان عمل التطبيق بدون إنترنت وتجاوز الحظر
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('ZENTUM PWA: Engine is Online and ready.');

        // نظام مراقبة التحديثات لضمان وصول أحدث الأسعار للمتداول
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) return;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('ZENTUM PWA: New core update detected. Refreshing assets...');
                // يمكن إضافة إشعار للمستخدم هنا لعمل Refresh
              }
            }
          };
        };
      })
      .catch(error => {
        console.error('ZENTUM PWA: System failed to initialize.', error);
      });
  });
}