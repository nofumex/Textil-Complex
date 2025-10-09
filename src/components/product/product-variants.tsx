'use client';

import React, { useState, useEffect } from 'react';
import { ProductVariant } from '@prisma/client';

interface ProductVariantsProps {
  variants: ProductVariant[];
  basePrice: number;
  onVariantChange: (variant: ProductVariant | null, price: number) => void;
}

export const ProductVariants: React.FC<ProductVariantsProps> = ({
  variants,
  basePrice,
  onVariantChange,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<number>(basePrice);

  // Get unique colors and sizes from variants
  const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)));
  const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean)));

  // Find current variant based on selections
  const currentVariant = variants.find(v => 
    v.color === selectedColor && v.size === selectedSize
  );

  // Update price when variant changes
  useEffect(() => {
    const price = currentVariant ? Number(currentVariant.price) : basePrice;
    setCurrentPrice(price);
    onVariantChange(currentVariant || null, price);
  }, [currentVariant, basePrice, onVariantChange]);

  // Auto-select first available options if only one of each
  useEffect(() => {
    if (colors.length === 1 && !selectedColor) {
      setSelectedColor(colors[0]);
    }
    if (sizes.length === 1 && !selectedSize) {
      setSelectedSize(sizes[0]);
    }
  }, [colors, sizes, selectedColor, selectedSize]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // Reset size if the selected size is not available for this color
    const availableSizes = variants
      .filter(v => v.color === color)
      .map(v => v.size)
      .filter(Boolean);
    
    if (selectedSize && !availableSizes.includes(selectedSize)) {
      setSelectedSize('');
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    // Reset color if the selected color is not available for this size
    const availableColors = variants
      .filter(v => v.size === size)
      .map(v => v.color)
      .filter(Boolean);
    
    if (selectedColor && !availableColors.includes(selectedColor)) {
      setSelectedColor('');
    }
  };

  const getAvailableSizes = () => {
    if (!selectedColor) return sizes;
    return variants
      .filter(v => v.color === selectedColor)
      .map(v => v.size)
      .filter(Boolean);
  };

  const getAvailableColors = () => {
    if (!selectedSize) return colors;
    return variants
      .filter(v => v.size === selectedSize)
      .map(v => v.color)
      .filter(Boolean);
  };

  const isVariantInStock = (color: string, size: string) => {
    const variant = variants.find(v => v.color === color && v.size === size);
    return variant ? variant.stock > 0 : false;
  };

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Цвет</h3>
          <div className="flex flex-wrap gap-2">
            {getAvailableColors().map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`px-4 py-2 text-sm border rounded-md transition-colors ${
                  selectedColor === color
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Размер</h3>
          <div className="flex flex-wrap gap-2">
            {getAvailableSizes().map((size) => {
              const inStock = isVariantInStock(selectedColor, size);
              return (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  disabled={!inStock}
                  className={`px-4 py-2 text-sm border rounded-md transition-colors ${
                    selectedSize === size
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : inStock
                      ? 'border-gray-300 hover:border-gray-400'
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Display */}
      <div className="flex items-baseline space-x-3">
        <span className="text-3xl font-bold text-gray-900">
          {new Intl.NumberFormat('ru-RU', { 
            style: 'currency', 
            currency: 'RUB' 
          }).format(currentPrice)}
        </span>
        {currentPrice !== basePrice && (
          <span className="text-lg text-gray-500">
            (базовая цена: {new Intl.NumberFormat('ru-RU', { 
              style: 'currency', 
              currency: 'RUB' 
            }).format(basePrice)})
          </span>
        )}
      </div>

      {/* Stock Status */}
      {currentVariant && (
        <div className="text-sm">
          {currentVariant.stock > 0 ? (
            <span className="text-green-600">
              В наличии: {currentVariant.stock} шт.
            </span>
          ) : (
            <span className="text-red-600">Нет в наличии</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductVariants;

