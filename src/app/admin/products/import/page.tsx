'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, ArrowLeft, FileDown, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function ImportProductsPage() {
  const { success, error } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [validateOnly, setValidateOnly] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    if (!file) {
      error('Ошибка', 'Выберите CSV файл');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('validateOnly', String(validateOnly));
      fd.append('updateExisting', String(updateExisting));
      fd.append('skipInvalid', String(skipInvalid));

      const res = await fetch('/api/admin/import', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.success) {
        success(validateOnly ? 'Валидация завершена' : 'Импорт выполнен', json.message || 'Готово');
      } else {
        error('Ошибка', json.error || 'Не удалось выполнить импорт');
      }
      setResult(json.data || json);
    } catch (e) {
      error('Ошибка', 'Не удалось выполнить импорт');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к товарам
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Импорт товаров</h1>
            <p className="text-gray-600">Загрузите CSV для массового добавления/обновления</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <a href="/api/admin/import?action=sample">
              <FileDown className="h-4 w-4 mr-2" />
              Скачать пример CSV
            </a>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">CSV файл</label>
          <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <p className="text-xs text-gray-500">Поддерживается формат CSV, кодировка UTF-8. Макс 10MB.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={validateOnly} onChange={(e) => setValidateOnly(e.target.checked)} />
            Только валидация (без сохранения)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={updateExisting} onChange={(e) => setUpdateExisting(e.target.checked)} />
            Обновлять существующие товары
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={skipInvalid} onChange={(e) => setSkipInvalid(e.target.checked)} />
            Пропускать некорректные строки
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleImport} disabled={loading}>
            <Upload className="h-4 w-4 mr-2" />
            {loading ? 'Обработка...' : validateOnly ? 'Проверить CSV' : 'Импортировать'}
          </Button>
        </div>

        {result && (
          <div className="rounded-md border p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className={result?.success ? 'text-green-600' : 'text-red-600'} />
              <span className="font-medium">Результат</span>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <p>Обработано: {result.processed ?? '-'}</p>
              <p>Создано: {result.created ?? '-'}</p>
              <p>Обновлено: {result.updated ?? '-'}</p>
              {Array.isArray(result.errors) && result.errors.length > 0 && (
                <div>
                  <p className="font-medium text-red-600 mt-2">Ошибки:</p>
                  <ul className="list-disc list-inside text-red-600">
                    {result.errors.map((e: string, idx: number) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(result.warnings) && result.warnings.length > 0 && (
                <div>
                  <p className="font-medium text-yellow-700 mt-2">Предупреждения:</p>
                  <ul className="list-disc list-inside text-yellow-700">
                    {result.warnings.map((w: string, idx: number) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




