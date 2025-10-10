'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Toast } from '@/components/ui/toast';

interface ImportResult {
  success: boolean;
  processed: number;
  created: number;
  updated: number;
  variantsCreated: number;
  errors: string[];
  warnings: string[];
}

export default function ImportVariantsPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileList | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [options, setOptions] = useState({
    defaultCurrency: 'RUB',
    updateExisting: false,
    skipInvalid: false,
    autoCreateCategories: true,
    createAllVariants: true,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleImport = async () => {
    if (!files || files.length === 0) {
      alert('Пожалуйста, выберите XML файлы для импорта');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      
      // Add files
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      // Add options
      formData.append('defaultCurrency', options.defaultCurrency);
      formData.append('updateExisting', options.updateExisting.toString());
      formData.append('skipInvalid', options.skipInvalid.toString());
      formData.append('autoCreateCategories', options.autoCreateCategories.toString());
      formData.append('createAllVariants', options.createAllVariants.toString());

      const response = await fetch('/api/admin/import/wordpress-variants', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setImportResult(result.data);
        setShowResult(true);
      } else {
        alert(`Ошибка импорта: ${result.error}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Произошла ошибка при импорте');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setImportResult(null);
    setFiles(null);
    // Reset file input
    const fileInput = document.getElementById('xml-files') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Импорт товаров с вариациями</h1>
          <p className="text-gray-600">
            Импортируйте товары из WordPress XML файла с автоматическим созданием всех комбинаций вариаций (цвета и размеры).
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Настройки импорта</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Валюта по умолчанию</label>
              <Input
                type="text"
                value={options.defaultCurrency}
                onChange={(e) => setOptions({ ...options, defaultCurrency: e.target.value })}
                placeholder="RUB"
              />
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.updateExisting}
                onChange={(e) => setOptions({ ...options, updateExisting: e.target.checked })}
                className="mr-2"
              />
              Обновлять существующие товары
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.skipInvalid}
                onChange={(e) => setOptions({ ...options, skipInvalid: e.target.checked })}
                className="mr-2"
              />
              Пропускать некорректные товары
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.autoCreateCategories}
                onChange={(e) => setOptions({ ...options, autoCreateCategories: e.target.checked })}
                className="mr-2"
              />
              Автоматически создавать категории
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.createAllVariants}
                onChange={(e) => setOptions({ ...options, createAllVariants: e.target.checked })}
                className="mr-2"
              />
              Создавать все комбинации вариаций
            </label>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">XML файлы</label>
            <input
              id="xml-files"
              type="file"
              multiple
              accept=".xml,text/xml,application/xml"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Выберите один или несколько XML файлов экспорта WordPress
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleImport}
              disabled={!files || files.length === 0 || isImporting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isImporting ? 'Импорт...' : 'Начать импорт'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Назад
            </Button>
          </div>
        </Card>

        {/* Import Instructions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Инструкции по импорту</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p><strong>Поддерживаемые форматы:</strong> WordPress XML экспорт</p>
            <p><strong>Вариации:</strong> Система автоматически создаст все комбинации цветов и размеров</p>
            <p><strong>Атрибуты:</strong> pa_cvet (цвет), pa_razmer (размер)</p>
            <p><strong>Цены:</strong> Будет использована минимальная цена как базовая</p>
            <p><strong>Изображения:</strong> Автоматически импортируются из галереи товара</p>
          </div>
        </Card>
      </div>

      {/* Results Modal */}
      {showResult && importResult && (
        <Modal
          isOpen={showResult}
          onClose={handleCloseResult}
          title="Результаты импорта"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded">
                <div className="text-sm font-medium text-green-800">Обработано</div>
                <div className="text-2xl font-bold text-green-600">{importResult.processed}</div>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm font-medium text-blue-800">Создано</div>
                <div className="text-2xl font-bold text-blue-600">{importResult.created}</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <div className="text-sm font-medium text-yellow-800">Обновлено</div>
                <div className="text-2xl font-bold text-yellow-600">{importResult.updated}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <div className="text-sm font-medium text-purple-800">Вариаций</div>
                <div className="text-2xl font-bold text-purple-600">{importResult.variantsCreated}</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Ошибки:</h4>
                <div className="bg-red-50 p-3 rounded max-h-32 overflow-y-auto">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600">{error}</div>
                  ))}
                </div>
              </div>
            )}

            {importResult.warnings.length > 0 && (
              <div>
                <h4 className="font-semibold text-yellow-600 mb-2">Предупреждения:</h4>
                <div className="bg-yellow-50 p-3 rounded max-h-32 overflow-y-auto">
                  {importResult.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-yellow-600">{warning}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleCloseResult} className="bg-blue-600 hover:bg-blue-700">
                Закрыть
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
