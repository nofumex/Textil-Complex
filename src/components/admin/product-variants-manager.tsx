'use client';

import React, { useState, useEffect } from 'react';
import { ProductVariant } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface ProductVariantsManagerProps {
  productSlug: string;
  initialVariants: ProductVariant[];
  onVariantsUpdate: (variants: ProductVariant[]) => void;
}

interface VariantFormData {
  id?: string;
  size: string;
  color: string;
  material: string;
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
}

export const ProductVariantsManager: React.FC<ProductVariantsManagerProps> = ({
  productSlug,
  initialVariants,
  onVariantsUpdate,
}) => {
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  const handleAddVariant = () => {
    setEditingVariant({
      size: '',
      color: '',
      material: '',
      price: 0,
      stock: 0,
      sku: '',
      isActive: true,
    });
    setIsEditing(true);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant({
      id: variant.id,
      size: variant.size || '',
      color: variant.color || '',
      material: variant.material || '',
      price: Number(variant.price),
      stock: variant.stock,
      sku: variant.sku,
      isActive: variant.isActive,
    });
    setIsEditing(true);
  };

  const handleSaveVariant = async () => {
    if (!editingVariant) return;

    setIsLoading(true);
    try {
      const url = editingVariant.id
        ? `/api/admin/products/${productSlug}/variants/${editingVariant.id}`
        : `/api/admin/products/${productSlug}/variants`;

      const method = editingVariant.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingVariant),
      });

      const result = await response.json();

      if (result.success) {
        // Обновляем локальное состояние
        let updatedVariants;
        if (editingVariant.id) {
          updatedVariants = variants.map(v => 
            v.id === editingVariant.id ? result.data : v
          );
        } else {
          updatedVariants = [...variants, result.data];
        }
        
        setVariants(updatedVariants);
        onVariantsUpdate(updatedVariants);
        success('Вариация сохранена', 'Вариация товара успешно сохранена');
        setIsEditing(false);
        setEditingVariant(null);
      } else {
        error('Ошибка сохранения', result.error);
      }
    } catch (err) {
      error('Ошибка сохранения', 'Произошла ошибка при сохранении вариации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту вариацию?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${productSlug}/variants/${variantId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        const updatedVariants = variants.filter(v => v.id !== variantId);
        setVariants(updatedVariants);
        onVariantsUpdate(updatedVariants);
        success('Вариация удалена', 'Вариация товара успешно удалена');
      } else {
        error('Ошибка удаления', result.error);
      }
    } catch (err) {
      error('Ошибка удаления', 'Произошла ошибка при удалении вариации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingVariant(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Вариации товара</h3>
        <Button onClick={handleAddVariant} disabled={isLoading}>
          Добавить вариацию
        </Button>
      </div>

      {/* Список вариаций */}
      {variants.length > 0 ? (
        <div className="space-y-4">
          {variants.map((variant) => (
            <div key={variant.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Цвет:</span>
                      <div className="text-gray-900">
                        {variant.color && !['пестротканное', 'пестротканые', 'гладкокрашеное', 'гладкокрашеные'].some(keyword => 
                          variant.color?.toLowerCase().includes(keyword.toLowerCase())
                        ) ? variant.color : 'Не указан'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Размер:</span>
                      <div className="text-gray-900">{variant.size || 'Не указан'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Цена:</span>
                      <div className="text-gray-900">
                        {new Intl.NumberFormat('ru-RU', { 
                          style: 'currency', 
                          currency: 'RUB' 
                        }).format(Number(variant.price))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Остаток:</span>
                      <div className={`text-gray-900 ${variant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {variant.stock} шт.
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-gray-600">Артикул:</span>
                    <span className="text-gray-900 ml-1">{variant.sku}</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      variant.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {variant.isActive ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditVariant(variant)}
                    disabled={isLoading}
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteVariant(variant.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>У товара пока нет вариаций</p>
          <p className="text-sm">Нажмите "Добавить вариацию" для создания первой вариации</p>
        </div>
      )}

      {/* Форма редактирования */}
      {isEditing && editingVariant && (
        <div className="border rounded-lg p-6 bg-white">
          <h4 className="text-lg font-semibold mb-4">
            {editingVariant.id ? 'Редактировать вариацию' : 'Добавить вариацию'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цвет
              </label>
              <input
                type="text"
                value={editingVariant.color}
                onChange={(e) => setEditingVariant({
                  ...editingVariant,
                  color: e.target.value,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: Белый, Красный, Синий"
              />
              <p className="text-xs text-gray-500 mt-1">
                Указывайте только цвета. Не используйте категории товаров (например: "пестротканное").
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Размер
              </label>
              <input
                type="text"
                value={editingVariant.size}
                onChange={(e) => setEditingVariant({
                  ...editingVariant,
                  size: e.target.value,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: 50x70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Материал
              </label>
              <input
                type="text"
                value={editingVariant.material}
                onChange={(e) => setEditingVariant({
                  ...editingVariant,
                  material: e.target.value,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: Хлопок"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Артикул
              </label>
              <input
                type="text"
                value={editingVariant.sku}
                onChange={(e) => setEditingVariant({
                  ...editingVariant,
                  sku: e.target.value,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Уникальный артикул"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цена (₽)
              </label>
              <input
                type="number"
                value={editingVariant.price}
                onChange={(e) => setEditingVariant({
                  ...editingVariant,
                  price: parseFloat(e.target.value) || 0,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Остаток (шт.)
              </label>
              <input
                type="number"
                value={editingVariant.stock}
                onChange={(e) => setEditingVariant({
                  ...editingVariant,
                  stock: parseInt(e.target.value) || 0,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editingVariant.isActive}
                onChange={(e) => setEditingVariant({
                  ...editingVariant,
                  isActive: e.target.checked,
                })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Активна</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSaveVariant}
              disabled={isLoading || !editingVariant.sku || editingVariant.price <= 0}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantsManager;
