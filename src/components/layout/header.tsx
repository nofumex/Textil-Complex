'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart, User, Search, Phone, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => setMounted(true), []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { getTotalItems, toggleCart } = useCartStore();
  const cartItemsCount = getTotalItems();

  const navigation = [
    { name: 'Главная', href: '/' },
    { name: 'Каталог', href: '/catalog' },
    { name: 'О компании', href: '/about' },
    { name: 'Доставка', href: '/delivery' },
    { name: 'Контакты', href: '/contacts' },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b">
      {/* Top bar */}
      <div className="bg-gray-50 py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>+7 (495) 123-45-67</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Пн-Пт: 9:00-18:00</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <Link href="/profile" className="hover:text-primary-600">
                  Личный кабинет
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hover:text-primary-600">
                    Вход
                  </Link>
                  <Link href="/register" className="hover:text-primary-600">
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ТК</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Текстиль Комплекс</h1>
              <p className="text-sm text-gray-500">Постельные принадлежности с 2004 года</p>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Поиск товаров..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user?.firstName}
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="sm">
                    Войти
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:block mt-4">
          <ul className="flex space-x-8">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск товаров..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Mobile navigation */}
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-primary-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile auth */}
            <div className="pt-4 border-t space-y-2">
              {isAuthenticated ? (
                <Link href="/profile" className="block py-2 text-gray-700">
                  Личный кабинет
                </Link>
              ) : (
                <>
                  <Link href="/login" className="block py-2 text-gray-700">
                    Вход
                  </Link>
                  <Link href="/register" className="block py-2 text-gray-700">
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


