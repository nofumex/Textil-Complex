'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, getStockStatus } from '@/lib/utils';

export const FeaturedProducts: React.FC = () => {
  // Mock data - в реальном приложении будет загружаться из API
  const featuredProducts = [
    {
      id: '1',
      title: 'Комплект постельного белья "Классик"',
      slug: 'komplekt-klassik',
      price: 2500,
      oldPrice: 3000,
      images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop'],
      category: 'MIDDLE',
      stock: 15,
      rating: 4.8,
      reviewsCount: 24,
      material: '100% хлопок',
      inStock: true,
    },
    {
      id: '2',
      title: 'Подушка ортопедическая "Комфорт"',
      slug: 'podushka-komfort',
      price: 1200,
      images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop'],
      category: 'ECONOMY',
      stock: 8,
      rating: 4.6,
      reviewsCount: 18,
      material: 'Пенополиуретан',
      inStock: true,
    },
    {
      id: '3',
      title: 'Одеяло пуховое "Премиум"',
      slug: 'odeyalo-premium',
      price: 5500,
      images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'],
      category: 'LUXURY',
      stock: 3,
      rating: 4.9,
      reviewsCount: 12,
      material: 'Натуральный пух',
      inStock: true,
    },
    {
      id: '4',
      title: 'Наматрасник водонепроницаемый',
      slug: 'namatrasnik-waterproof',
      price: 1800,
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop'],
      category: 'MIDDLE',
      stock: 22,
      rating: 4.7,
      reviewsCount: 31,
      material: 'Полиэстер + TPU',
      inStock: true,
    },
  ];

  const getCategoryLabel = (category: string) => {
    const labels = {
      ECONOMY: 'Эконом',
      MIDDLE: 'Средний',
      LUXURY: 'Люкс',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      ECONOMY: 'bg-green-100 text-green-800',
      MIDDLE: 'bg-blue-100 text-blue-800',
      LUXURY: 'bg-purple-100 text-purple-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Популярные товары
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Самые востребованные постельные принадлежности из нашего каталога
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group card-hover"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 space-y-2">
                    <span className={`badge ${getCategoryColor(product.category)}`}>
                      {getCategoryLabel(product.category)}
                    </span>
                    {product.oldPrice && (
                      <span className="badge bg-red-100 text-red-800">
                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Stock status */}
                  <div className="absolute top-3 right-3">
                    <span className={`badge ${stockStatus.status === 'in_stock' ? 'badge-success' : stockStatus.status === 'low_stock' ? 'badge-warning' : 'badge-error'}`}>
                      {stockStatus.message}
                    </span>
                  </div>

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                    <Link href={`/products/${product.slug}`}>
                      <Button size="sm" variant="secondary">
                        <Eye className="h-4 w-4 mr-2" />
                        Подробнее
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating} ({product.reviewsCount})
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.title}
                  </h3>

                  {/* Material */}
                  <p className="text-sm text-gray-600 mb-3">
                    {product.material}
                  </p>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.oldPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button className="w-full" disabled={!product.inStock}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.inStock ? 'В корзину' : 'Нет в наличии'}
                    </Button>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      Купить в 1 клик
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View all button */}
        <div className="text-center mt-12">
          <Link href="/catalog">
            <Button size="lg" variant="outline">
              Посмотреть весь каталог
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};


