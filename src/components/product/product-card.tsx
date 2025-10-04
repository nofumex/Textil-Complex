'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { useToast } from '@/components/ui/toast';
import { formatPrice, getStockStatus } from '@/lib/utils';
import { ProductWithDetails } from '@/types';

interface ProductCardProps {
  product: ProductWithDetails;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode = 'grid' 
}) => {
  const { addItem } = useCartStore();
  const { success } = useToast();
  const stockStatus = getStockStatus(product.stock);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.isInStock && product.stock > 0) {
      addItem(product);
      success('Товар добавлен', `${product.title} добавлен в корзину`);
    }
  };

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

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image */}
          <Link href={`/products/${product.slug}`} className="md:w-48 flex-shrink-0">
            <div className="aspect-square overflow-hidden rounded-lg">
              <img
                src={product.images[0] || '/placeholder-product.jpg'}
                alt={product.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`badge ${getCategoryColor(product.category)}`}>
                  {getCategoryLabel(product.category)}
                </span>
                {product.oldPrice && (
                  <span className="badge bg-red-100 text-red-800">
                    -{Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)}%
                  </span>
                )}
                <span className={`badge ${stockStatus.status === 'in_stock' ? 'badge-success' : stockStatus.status === 'low_stock' ? 'badge-warning' : 'badge-error'}`}>
                  {stockStatus.message}
                </span>
              </div>

              {/* Title and description */}
              <Link href={`/products/${product.slug}`}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-2 line-clamp-2">
                  {product.title}
                </h3>
              </Link>
              
              <p className="text-gray-600 line-clamp-2 mb-4">
                {product.description}
              </p>

              {/* Material */}
              {product.material && (
                <p className="text-sm text-gray-500 mb-4">
                  Материал: {product.material}
                </p>
              )}

              {/* Rating */}
              {product.averageRating && product.averageRating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.averageRating.toFixed(1)} ({product._count?.reviews || 0})
                  </span>
                </div>
              )}
            </div>

            {/* Price and actions */}
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(Number(product.price))}
                  </span>
                  {product.oldPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(Number(product.oldPrice))}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex items-center gap-2"
                >
                  <Link href={`/products/${product.slug}`}>
                    <Eye className="h-4 w-4" />
                    Подробнее
                  </Link>
                </Button>
                
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.isInStock || product.stock === 0}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {product.isInStock && product.stock > 0 ? 'В корзину' : 'Нет в наличии'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-300 overflow-hidden group"
      data-testid="product-card"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${product.slug}`}>
          <img
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-2">
          <span className={`badge ${getCategoryColor(product.category)}`}>
            {getCategoryLabel(product.category)}
          </span>
          {product.oldPrice && (
            <span className="badge bg-red-100 text-red-800 block">
              -{Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)}%
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
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            asChild
            className="flex items-center gap-2"
          >
            <Link href={`/products/${product.slug}`}>
              <Eye className="h-4 w-4" />
              Подробнее
            </Link>
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:text-white hover:bg-white/20"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Rating */}
        {product.averageRating && product.averageRating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.averageRating.toFixed(1)} ({product._count?.reviews || 0})
            </span>
          </div>
        )}

        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Material */}
        {product.material && (
          <p className="text-sm text-gray-600 mb-3">
            {product.material}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(Number(product.price))}
          </span>
          {product.oldPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(Number(product.oldPrice))}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            className="w-full"
            onClick={handleAddToCart}
            disabled={!product.isInStock || product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.isInStock && product.stock > 0 ? 'В корзину' : 'Нет в наличии'}
          </Button>
          
          <Button variant="outline" size="sm" className="w-full">
            Купить в 1 клик
          </Button>
        </div>
      </div>
    </div>
  );
};


