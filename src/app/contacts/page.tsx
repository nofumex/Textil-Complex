import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function ContactsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header is global from RootLayout */}
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Контакты</h1>
          <div className="space-y-4 text-gray-700">
            <p>Телефон: +7 (495) 123-45-67</p>
            <p>Email: info@textil-kompleks.ru</p>
            <p>Адрес склада: г. Москва, ул. Примерная, д. 123</p>
          </div>
        </div>
      </main>
      {/* Footer is global from RootLayout */}
    </div>
  );
}


