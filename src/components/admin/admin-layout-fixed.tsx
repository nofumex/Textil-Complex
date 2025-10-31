'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  Upload, 
  Download,
  X,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useLogout } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Hide public site header/footer on admin pages
  useEffect(() => {
    document.body.classList.add('admin-page');
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);
  
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, logout: logoutStore } = useAuthStore();
  const { logout } = useLogout();

  useEffect(() => {
    let isMounted = true;
    const hydrateUser = async () => {
      try {
        setAuthError(null);
        console.log('AdminLayout: Starting auth check, current user:', user);
        
        // If we already have a user with correct role, no need to fetch
        if (user && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
          console.log('AdminLayout: User already authenticated with correct role');
          if (isMounted) setCheckingAuth(false);
          return;
        }

        console.log('AdminLayout: Fetching user from server...');
        // Try to fetch current user from server session
        const res = await fetch('/api/auth/me', { 
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log('AdminLayout: /api/auth/me response:', res.status, res.statusText);
        
        if (res.ok) {
          const json = await res.json();
          console.log('AdminLayout: User data received:', json);
          const fetchedUser = json?.data?.user;
          if (fetchedUser && (fetchedUser.role === 'ADMIN' || fetchedUser.role === 'MANAGER')) {
            setUser(fetchedUser);
            if (isMounted) setCheckingAuth(false);
            return;
          } else {
            console.log('AdminLayout: User role not sufficient:', fetchedUser?.role);
          }
        }

        // If unauthorized, try to refresh token and retry once
        if (res.status === 401) {
          console.log('AdminLayout: 401 received, trying to refresh token...');
          try {
            const refreshRes = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            console.log('AdminLayout: Refresh response:', refreshRes.status, refreshRes.statusText);
            
            if (refreshRes.ok) {
              const meRetry = await fetch('/api/auth/me', { 
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                }
              });
              
              console.log('AdminLayout: Retry /api/auth/me response:', meRetry.status, meRetry.statusText);
              
              if (meRetry.ok) {
                const json = await meRetry.json();
                const fetchedUser = json?.data?.user;
                if (fetchedUser && (fetchedUser.role === 'ADMIN' || fetchedUser.role === 'MANAGER')) {
                  setUser(fetchedUser);
                  if (isMounted) setCheckingAuth(false);
                  return;
                }
              }
            }
          } catch (refreshError) {
            console.error('AdminLayout: Refresh token error:', refreshError);
          }
        }

        // Not authorized
        console.log('AdminLayout: Not authorized, redirecting to login');
        if (isMounted) {
          setCheckingAuth(false);
          setAuthError('Недостаточно прав для доступа к админ-панели');
          router.push('/login');
        }
      } catch (error) {
        console.error('AdminLayout: Auth check error:', error);
        if (isMounted) {
          setCheckingAuth(false);
          setAuthError('Ошибка проверки аутентификации');
          router.push('/login');
        }
      }
    };

    hydrateUser();
    return () => {
      isMounted = false;
    };
  }, [user, setUser, router]);

  const handleLogout = async () => {
    try {
      await logout();
      logoutStore();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      logoutStore();
      router.push('/login');
    }
  };

  const navigation = [
    {
      name: 'Главная',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Товары',
      href: '/admin/products',
      icon: Package,
    },
    {
      name: 'Заказы',
      href: '/admin/orders',
      icon: ShoppingCart,
    },
    {
      name: 'Клиенты',
      href: '/admin/customers',
      icon: Users,
    },
    {
      name: 'Аналитика',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      name: 'Настройки',
      href: '/admin/settings',
      icon: Settings,
    },
    {
      name: 'Импорт/Экспорт',
      href: '/admin/import-export',
      icon: Upload,
    },
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Ошибка аутентификации</p>
            <p>{authError}</p>
          </div>
          <Button onClick={() => router.push('/login')}>
            Перейти к входу
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-gray-900">Админ-панель</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.firstName?.[0] || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-semibold text-gray-900">Админ-панель</h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.firstName?.[0] || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-600 lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {user?.role === 'ADMIN' ? 'Администратор' : 'Менеджер'}
            </span>
          </div>
        </div>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};
