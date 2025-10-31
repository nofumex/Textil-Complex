'use client';

import React from 'react';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // only show once if not previously accepted
    try {
      const accepted = localStorage.getItem('cookie-consent-accepted');
      if (!accepted) setVisible(true);
    } catch {}
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-5xl m-4 rounded-lg bg-gray-900 text-white shadow-lg">
        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="text-sm text-gray-100">
            Мы используем файлы cookie для работы сайта, аналитики и улучшения сервиса. Продолжая пользоваться сайтом, вы соглашаетесь с использованием cookie. Подробнее — в
            <a href="/privacy" className="text-blue-300 underline ml-1" target="_blank" rel="noopener noreferrer">Политике обработки персональных данных</a>.
          </p>
          <div className="flex-1" />
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-900 hover:bg-gray-100"
            onClick={() => {
              try { localStorage.setItem('cookie-consent-accepted', '1'); } catch {}
              setVisible(false);
            }}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;


