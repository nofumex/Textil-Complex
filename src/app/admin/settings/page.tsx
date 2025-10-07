'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Save, 
  RefreshCw,
  Phone,
  Link
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialLinks: [] as { label: string; url: string }[],
    extraContacts: [] as { title: string; values: string[] }[],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const { data: settingsData, loading: dataLoading, error } = useSettings();

  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
    }
  }, [settingsData]);

  const handleInputChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  // Dynamic helpers
  const updateSocial = (index: number, key: 'label' | 'url', value: string) => {
    setSettings((prev: any) => {
      const next = [...(prev.socialLinks || [])];
      next[index] = { ...(next[index] || { label: '', url: '' }), [key]: value };
      return { ...prev, socialLinks: next };
    });
  };

  const addSocial = () => {
    setSettings((prev: any) => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), { label: '', url: '' }],
    }));
  };

  const removeSocial = (index: number) => {
    setSettings((prev: any) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const updateExtraTitle = (index: number, value: string) => {
    setSettings((prev: any) => {
      const next = [...(prev.extraContacts || [])];
      next[index] = { ...(next[index] || { title: '', values: [] }), title: value };
      return { ...prev, extraContacts: next };
    });
  };

  const addExtraGroup = () => {
    setSettings((prev: any) => ({
      ...prev,
      extraContacts: [...(prev.extraContacts || []), { title: '', values: [''] }],
    }));
  };

  const removeExtraGroup = (index: number) => {
    setSettings((prev: any) => ({
      ...prev,
      extraContacts: (prev.extraContacts || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const updateExtraValue = (groupIndex: number, valueIndex: number, value: string) => {
    setSettings((prev: any) => {
      const groups = [...(prev.extraContacts || [])];
      const group = groups[groupIndex] || { title: '', values: [] };
      const values = [...(group.values || [])];
      values[valueIndex] = value;
      groups[groupIndex] = { ...group, values };
      return { ...prev, extraContacts: groups };
    });
  };

  const addExtraValue = (groupIndex: number) => {
    setSettings((prev: any) => {
      const groups = [...(prev.extraContacts || [])];
      const group = groups[groupIndex] || { title: '', values: [] };
      groups[groupIndex] = { ...group, values: [...(group.values || []), ''] };
      return { ...prev, extraContacts: groups };
    });
  };

  const removeExtraValue = (groupIndex: number, valueIndex: number) => {
    setSettings((prev: any) => {
      const groups = [...(prev.extraContacts || [])];
      const group = groups[groupIndex] || { title: '', values: [] };
      groups[groupIndex] = { ...group, values: (group.values || []).filter((_: any, i: number) => i !== valueIndex) };
      return { ...prev, extraContacts: groups };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage('Настройки сохранены успешно');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`Ошибка: ${result.error}`);
      }
    } catch (error) {
      setMessage('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-red-600">Ошибка загрузки настроек: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Настройки</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Сохранить
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('Ошибка') 
            ? 'bg-red-50 text-red-800 border border-red-200' 
            : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {/* Общие настройки удалены по требованию */}

      {/* Contact Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="h-5 w-5 mr-2" />
            Контактная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={settings.contactEmail || ''}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="info@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <Input
                value={settings.contactPhone || ''}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="+7 (495) 123-45-67"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Адрес
            </label>
            <Input
              value={settings.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="г. Москва, ул. Примерная, д. 123"
            />
          </div>
          {/* Режим работы удалён по требованию */}
        </CardContent>
      </Card>

      {/* Блоки доставки и email удалены по требованию */}

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link className="h-5 w-5 mr-2" />
            Социальные сети
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(settings.socialLinks || []).map((item: any, idx: number) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Название сети</label>
                <Input value={item?.label || ''} onChange={(e) => updateSocial(idx, 'label', e.target.value)} placeholder="Напр.: ВК, WB, Telegram" />
              </div>
              <div className="md:col-span-7">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка</label>
                <Input value={item?.url || ''} onChange={(e) => updateSocial(idx, 'url', e.target.value)} placeholder="https://vk.com/yourpage" />
              </div>
              <div className="md:col-span-1">
                <Button variant="outline" onClick={() => removeSocial(idx)}>Удалить</Button>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addSocial}>Добавить соцсеть</Button>
        </CardContent>
      </Card>

      {/* Additional Data */}
      <Card>
        <CardHeader>
          <CardTitle>Дополнительные данные</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(settings.extraContacts || []).map((group: any, gIdx: number) => (
            <div key={gIdx} className="space-y-3 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                  <Input value={group?.title || ''} onChange={(e) => updateExtraTitle(gIdx, e.target.value)} placeholder="Напр.: Отдел продаж готовых изделий" />
                </div>
                <Button variant="outline" onClick={() => removeExtraGroup(gIdx)}>Удалить блок</Button>
              </div>

              <div className="space-y-2">
                {(group?.values || []).map((val: string, vIdx: number) => (
                  <div key={vIdx} className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Значение</label>
                      <Input value={val || ''} onChange={(e) => updateExtraValue(gIdx, vIdx, e.target.value)} placeholder="+7 (___) ___-__-__" />
                    </div>
                    <Button variant="outline" onClick={() => removeExtraValue(gIdx, vIdx)}>Удалить</Button>
                  </div>
                ))}
                <Button variant="outline" onClick={() => addExtraValue(gIdx)}>Добавить значение</Button>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addExtraGroup}>Добавить блок</Button>
        </CardContent>
      </Card>
    </div>
  );
}
