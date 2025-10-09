'use client';

import React, { useState } from 'react';
import { ProductVariant } from '@prisma/client';
import { ProductWithDetails } from '@/types/index';
import ProductVariants from './product-variants';
import ProductActions from './product-actions';

interface ProductDetailsProps {
  product: ProductWithDetails;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<number>(Number(product.price));

  const handleVariantChange = (variant: ProductVariant | null, price: number) => {
    setSelectedVariant(variant);
    setCurrentPrice(price);
    
    if (variant) {
      setSelectedColor(variant.color || '');
      setSelectedSize(variant.size || '');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>
      {product.material && <p className="text-gray-600 mb-6">{product.material}</p>}
      
      {/* Product Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-6">
          <ProductVariants
            variants={product.variants}
            basePrice={Number(product.price)}
            onVariantChange={handleVariantChange}
          />
        </div>
      )}

      {/* Price Display (if no variants or as fallback) */}
      {(!product.variants || product.variants.length === 0) && (
        <div className="flex items-baseline space-x-3 mb-6">
          <span className="text-3xl font-bold">
            {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(Number(product.price))}
          </span>
          {product.oldPrice && (
            <span className="text-gray-400 line-through">
              {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(Number(product.oldPrice))}
            </span>
          )}
        </div>
      )}

      {/* Product Description */}
      <div className="prose max-w-none mb-8">
        {product.description && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Описание</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        )}
        {product.content && (
          <div className="text-gray-700 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: product.content }} />
          </div>
        )}
      </div>

      {/* Product Specifications */}
      <div className="space-y-2 text-sm text-gray-600 mb-6">
        {product.dimensions && <div>Размеры: {product.dimensions}</div>}
        {product.weight && <div>Вес: {product.weight} кг</div>}
        <div>Наличие: {product.isInStock ? 'В наличии' : 'Нет в наличии'}</div>
        <div>Артикул: {product.sku}</div>
        {product.categoryObj && (
          <div>Категория: {product.categoryObj.name}</div>
        )}
      </div>

      {/* Product Actions */}
      <ProductActions
        product={product}
        selectedVariant={selectedVariant}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
      />
    </div>
  );
};

export default ProductDetails;

