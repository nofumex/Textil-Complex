'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function ExportProductsPage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const handleExportAll = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/export');
      if (!res.ok) throw new Error('Ошибка экспорта');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      success('Экспорт выполнен', 'CSV файл сформирован');
    } catch (e: any) {
      error('Ошибка', e.message || 'Не удалось экспортировать');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/admin/products" className="text-sm text-gray-600 hover:text-gray-900">Назад к товарам</Link>
          <span className="text-gray-400">/</span>
          <span className="text-sm text-gray-900 font-medium">Экспорт товаров</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <p className="text-gray-700">Скачайте CSV файл со всеми характеристиками товаров. Откройте файл в Excel — кодировка и разделители уже настроены.</p>
        <div className="flex gap-3">
          <Button onClick={handleExportAll} disabled={loading}>
            {loading ? 'Формирование...' : 'Экспорт всех товаров'}
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/admin/import?action=sample">Скачать пример CSV</a>
          </Button>
        </div>
      </div>
    </div>
  );
}








