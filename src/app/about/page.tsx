import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header is global from RootLayout */}
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">О компании</h1>
          <p className="text-gray-700 leading-relaxed mb-4">
            ООО «Текстиль Комплекс» — надёжный поставщик постельных принадлежностей с 2004 года. Мы
            обеспечиваем стабильные поставки, гибкие условия и индивидуальный подход к каждому клиенту.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Собственный склад, собственная логистика и контроль качества на всех этапах — гарантия
            своевременных поставок и соответствия продукции заявленным характеристикам.
          </p>
        </div>
      </main>
      {/* Footer is global from RootLayout */}
    </div>
  );
}


