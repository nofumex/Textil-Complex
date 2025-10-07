'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const refreshAuth = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      const json = await res.json();
      return Boolean(json?.success);
    } catch {
      return false;
    }
  };

  const authorizedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const res = await fetch(input, { ...init, credentials: 'include' });
    if (res.status === 401) {
      const refreshed = await refreshAuth();
      if (!refreshed) throw new Error('AUTH_REQUIRED');
      return fetch(input, { ...init, credentials: 'include' });
    }
    return res;
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await authorizedFetch('/api/leads');
        if (!res.ok) throw new Error('LOAD_FAILED');
        const json = await res.json();
        if (json.success) setLeads(json.data);
      } catch (e: any) {
        if (e?.message === 'AUTH_REQUIRED') {
          window.location.href = '/login';
        } else {
          setError('Не удалось загрузить заявки');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return leads;
    const q = search.toLowerCase();
    return leads.filter((l) =>
      [l.name, l.email, l.phone, l.company, l.source, l.message]
        .filter(Boolean)
        .some((v: string) => String(v).toLowerCase().includes(q))
    );
  }, [leads, search]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Заявки</h1>
          <p className="text-gray-600">Всего: {leads.length}</p>
        </div>
        <div className="w-full md:w-80">
          <Input
            placeholder="Поиск по имени, email, телефону..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Контакты</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Компания</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сообщение</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Источник</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>Загрузка...</td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>Заявок нет</td>
                </tr>
              )}
              {!loading && filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.createdAt).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lead.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div>{lead.phone || '-'}</div>
                    <div className="text-gray-500">{lead.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{lead.company || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xl">
                    <div className="line-clamp-2" title={lead.message || ''}>{lead.message || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                      {lead.source || '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


