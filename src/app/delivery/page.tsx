import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function DeliveryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header is global from RootLayout */}
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Доставка и оплата</h1>
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-2">Варианты доставки</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Курьерская доставка по Москве и области</li>
                <li>Транспортные компании по России</li>
                <li>Самовывоз со склада</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">Оплата</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Безналичный расчёт</li>
                <li>Наличный расчёт при самовывозе</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      {/* Footer is global from RootLayout */}
    </div>
  );
}


