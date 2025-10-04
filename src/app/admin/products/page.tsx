'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { formatPrice, formatDate, getStockStatus } from '@/lib/utils';

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const { success, error } = useToast();

  // Mock data - в реальном приложении будет загружаться из API
  const products = [
    {
      id: '1',
      title: 'Комплект постельного белья "Классик"',
      sku: 'BED001',
      category: 'Постельное белье',
      price: 2500,
      oldPrice: 3000,
      stock: 15,
      status: 'VISIBLE',
      isActive: true,
      createdAt: new Date(),
      images: ['https://example.com/image1.jpg'],
    },
    {
      id: '2',
      title: 'Подушка ортопедическая "Комфорт"',
      sku: 'PIL001',
      category: 'Подушки',
      price: 1200,
      stock: 8,
      status: 'VISIBLE',
      isActive: true,
      createdAt: new Date(),
      images: ['https://example.com/image2.jpg'],
    },
    {
      id: '3',
      title: 'Одеяло пуховое "Зимнее"',
      sku: 'DUV001',
      category: 'Одеяла',
      price: 5500,
      stock: 3,
      status: 'VISIBLE',
      isActive: true,
      createdAt: new Date(),
      images: ['https://example.com/image3.jpg'],
    },
  ];

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        // API call to delete product
        success('Товар удалён', 'Товар успешно удалён из каталога');
        setDeleteModalOpen(false);
        setProductToDelete(null);
      } catch (err) {
        error('Ошибка', 'Не удалось удалить товар');
      }
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      error('Выберите товары', 'Необходимо выбрать хотя бы один товар');
      return;
    }

    try {
      switch (action) {
        case 'delete':
          // API call to bulk delete
          success('Товары удалены', `Удалено ${selectedProducts.length} товаров`);
          break;
        case 'activate':
          // API call to bulk activate
          success('Товары активированы', `Активировано ${selectedProducts.length} товаров`);
          break;
        case 'deactivate':
          // API call to bulk deactivate
          success('Товары деактивированы', `Деактивировано ${selectedProducts.length} товаров`);
          break;
        case 'export':
          // API call to export selected
          success('Экспорт запущен', 'Файл будет готов через несколько минут');
          break;
      }
      setSelectedProducts([]);
    } catch (err) {
      error('Ошибка', 'Не удалось выполнить операцию');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      VISIBLE: 'bg-green-100 text-green-800',
      HIDDEN: 'bg-gray-100 text-gray-800',
      DRAFT: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      VISIBLE: 'Опубликован',
      HIDDEN: 'Скрыт',
      DRAFT: 'Черновик',
    };
    return texts[status as keyof typeof texts] || status;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление товарами</h1>
          <p className="text-gray-600">Всего товаров: {products.length}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" asChild>
            <Link href="/admin/products/import">
              <Upload className="h-4 w-4 mr-2" />
              Импорт
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          <Button asChild>
            <Link href="/admin/products/create">
              <Plus className="h-4 w-4 mr-2" />
              Добавить товар
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск по названию, SKU, категории..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="">Все категории</option>
              <option value="bedding">Постельное белье</option>
              <option value="pillows">Подушки</option>
              <option value="blankets">Одеяла</option>
            </select>
            
            <select className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="">Все статусы</option>
              <option value="VISIBLE">Опубликованы</option>
              <option value="HIDDEN">Скрыты</option>
              <option value="DRAFT">Черновики</option>
            </select>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-primary-700">
              Выбрано товаров: {selectedProducts.length}
            </p>
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={() => handleBulkAction('activate')}>
                Активировать
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                Деактивировать
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                Экспорт
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Товар
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цена
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Склад
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата создания
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={product.images[0] || '/placeholder-product.jpg'}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded-lg mr-4"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.title}
                          </p>
                          {product.oldPrice && (
                            <p className="text-xs text-green-600">
                              Скидка {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </p>
                        {product.oldPrice && (
                          <p className="text-xs text-gray-500 line-through">
                            {formatPrice(product.oldPrice)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                          {product.stock}
                        </span>
                        {stockStatus.status === 'low_stock' && (
                          <AlertTriangle className="h-4 w-4 text-orange-500 ml-1" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {getStatusText(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/products/${product.sku.toLowerCase()}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Показано <span className="font-medium">1</span> по <span className="font-medium">{products.length}</span> из{' '}
              <span className="font-medium">{products.length}</span> результатов
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Предыдущая
              </Button>
              <Button variant="outline" size="sm" className="bg-primary-600 text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                Следующая
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Удалить товар"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Вы уверены, что хотите удалить этот товар? Это действие нельзя отменить.
          </p>
          <div className="flex space-x-4">
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="flex-1"
            >
              Удалить
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1"
            >
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


