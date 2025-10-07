'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Truck, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Static import allows using an image from the repository root (bundled by Next.js)
// The file `image.png` is located at the project root. Next can bundle it via static import.
// If you later move it into `public/`, replace the import with "/hero.png" and remove the static import.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - next/image static import type inference
import HeroImage from '../../../image.png';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] opacity-5"></div>
      
      <div className="relative container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Image (first on mobile) */}
          <div className="relative lg:order-2 mb-8 pb-8">
            <div className="rounded-2xl overflow-hidden shadow-2xl relative bg-white">
              <Image
                src={HeroImage}
                alt="Главное изображение"
                quality={100}
                unoptimized
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Floating cards outside, slightly overlapping the image */}
            <div className="absolute -top-4 -left-4 bg-white rounded-lg p-4 shadow-lg animate-float">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">На складе</span>
              </div>
            </div>
            {/* Removed bottom-right badge by request */}

            {/* Additional info moved under image */}
            <div className="mt-10 bg-white rounded-lg p-6 shadow-sm border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">5000+</div>
                  <div className="text-sm text-gray-600">Товаров в наличии</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">24ч</div>
                  <div className="text-sm text-gray-600">Отгрузка заказа</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">99%</div>
                  <div className="text-sm text-gray-600">Довольных клиентов</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8 lg:order-1">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="text-primary-600">ООО Текстиль Комплекс</span> — 
                постельные принадлежности в наличии
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Работаем с 2004 года. Быстрая доставка собственным автотранспортом
              </p>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">20+ лет опыта</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Большой склад</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Собственный автотранспорт</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Быстрая отшивка</span>
              </div>
            </div>

            {/* Call to action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/catalog">
                <Button size="xl" className="w-full sm:w-auto btn-shimmer">
                  Посмотреть каталог
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button id="cta-sample" variant="outline" size="xl" className="w-full sm:w-auto">
                Заказать образец
              </Button>
            </div>

            
          </div>

          
        </div>
      </div>
    </section>
  );
};

/* Add these styles to your globals.css */
const floatStyle = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;


