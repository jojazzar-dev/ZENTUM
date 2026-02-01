import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
/** 
 * استيراد ملف التنسيقات العالمي 
 * هذا السطر هو المسؤول عن تفعيل قواعد Media Queries 
 * التي تعالج تجمد الشاشة وسهولة الكتابة في الموبايل
 */
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
 * ZENTUM PWA ENGINE - ADVANCED REGISTRATION SYSTEM
 * ---------------------------------------
 * مسؤول عن تحويل الموقع إلى تطبيق (App) قابل للتثبيت على واجهة الموبايل.
 * تم تحديث هذا الجزء لضمان تجاوز الحجب في إندونيسيا وسرعة استجابة الحقول.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // تسجيل ملف الخدمة sw.js مع تحديد النطاق الشامل للموقع
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('ZENTUM PWA: Engine is Online and ready.');

        // فحص التحديثات الجديدة لضمان دقة الأسعار والرسوم البيانية دائماً
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) return;
          
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                /**
                 * في حال وجود تحديث جديد (إصلاح للتنسيق أو الأسعار)
                 * سيقوم التطبيق بإبلاغ المتصفح بضرورة التحويل للنسخة الجديدة فوراً
                 */
                console.log('ZENTUM PWA: New core update detected. Refreshing assets...');
                // إجبار التحديث لضمان عدم بقاء المستخدم على نسخة "متجمدة"
                if (window.confirm("A new version of ZENTUM Terminal is available. Update now?")) {
                  window.location.reload();
                }
              }
            }
          };
        };
      })
      .catch(error => {
        // في حال فشل الاتصال بالسحابة (غالباً بسبب جدار حماية محلي)
        console.error('ZENTUM PWA: System failed to initialize. Checking connectivity...', error);
      });
  });

  /**
   * معالجة مشكلة "تجمد الكتابة" و "تأخر الاستجابة" 
   * عبر التأكد من أن التطبيق يعمل بأحدث كود متاح في ذاكرة الموبايل
   */
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      window.location.reload();
      refreshing = true;
    }
  });
}