'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/hooks/useApi';

interface PageProps { params: { id: string } }

export default function AdminCustomerDetailPage({ params }: PageProps) {
  const router = useRouter();
  // Reuse users hook by filtering by id; API supports /users with filters, but we have GET /users/:id as well
  const { data, loading, error } = (function useUserById(id: string) {
    const { data, loading, error } = (require('@/hooks/useApi') as any).useApi(`/users/${id}`, { dependencies: [id] });
    return { data, loading, error } as { data: any, loading: boolean, error: string | null };
  })(params.id);

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-1/4 bg-gray-200 rounded mb-6" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-700">Пользователь не найден</p>
            <div className="mt-4">
              <Button variant="outline" onClick={() => router.push('/admin/customers')}>Назад к списку</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = data;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
        <Button variant="outline" onClick={() => router.push('/admin/customers')}>Назад</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о клиенте</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><span className="text-gray-500">Email:</span> {user.email}</div>
          {user.phone && <div><span className="text-gray-500">Телефон:</span> {user.phone}</div>}
          {user.company && <div><span className="text-gray-500">Компания:</span> {user.company}</div>}
          <div><span className="text-gray-500">Роль:</span> {user.role}</div>
          <div><span className="text-gray-500">Статус:</span> {user.isBlocked ? 'Заблокирован' : 'Активен'}</div>
        </CardContent>
      </Card>
    </div>
  );
}














