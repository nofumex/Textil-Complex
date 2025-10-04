'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Truck,
  CreditCard,
  Image,
  Link
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
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
    setSettings(prev => ({ ...prev, [key]: value }));
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

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Общие настройки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название сайта
              </label>
              <Input
                value={settings.site_name || ''}
                onChange={(e) => handleInputChange('site_name', e.target.value)}
                placeholder="Название сайта"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание сайта
              </label>
              <Input
                value={settings.site_description || ''}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
                placeholder="Описание сайта"
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
                value={settings.contact_email || ''}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="info@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <Input
                value={settings.contact_phone || ''}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Режим работы
            </label>
            <Input
              value={settings.working_hours || ''}
              onChange={(e) => handleInputChange('working_hours', e.target.value)}
              placeholder="Пн-Пт: 9:00-18:00, Сб: 10:00-15:00"
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Настройки доставки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Бесплатная доставка от (руб.)
              </label>
              <Input
                type="number"
                value={settings.free_delivery_from || ''}
                onChange={(e) => handleInputChange('free_delivery_from', Number(e.target.value))}
                placeholder="3000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Стоимость доставки по умолчанию (руб.)
              </label>
              <Input
                type="number"
                value={settings.default_delivery_price || ''}
                onChange={(e) => handleInputChange('default_delivery_price', Number(e.target.value))}
                placeholder="500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Настройки email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP хост
              </label>
              <Input
                value={settings.smtp_host || ''}
                onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP порт
              </label>
              <Input
                type="number"
                value={settings.smtp_port || ''}
                onChange={(e) => handleInputChange('smtp_port', Number(e.target.value))}
                placeholder="587"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP пользователь
              </label>
              <Input
                value={settings.smtp_user || ''}
                onChange={(e) => handleInputChange('smtp_user', e.target.value)}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP пароль
              </label>
              <Input
                type="password"
                value={settings.smtp_password || ''}
                onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email отправителя
            </label>
            <Input
              type="email"
              value={settings.from_email || ''}
              onChange={(e) => handleInputChange('from_email', e.target.value)}
              placeholder="noreply@example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link className="h-5 w-5 mr-2" />
            Социальные сети
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VKontakte
              </label>
              <Input
                value={settings.social_vk || ''}
                onChange={(e) => handleInputChange('social_vk', e.target.value)}
                placeholder="https://vk.com/yourpage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telegram
              </label>
              <Input
                value={settings.social_telegram || ''}
                onChange={(e) => handleInputChange('social_telegram', e.target.value)}
                placeholder="https://t.me/yourpage"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <Input
                value={settings.social_whatsapp || ''}
                onChange={(e) => handleInputChange('social_whatsapp', e.target.value)}
                placeholder="+7 (495) 123-45-67"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <Input
                value={settings.social_instagram || ''}
                onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                placeholder="https://instagram.com/yourpage"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
