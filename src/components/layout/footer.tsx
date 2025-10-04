import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">ТК</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Текстиль Комплекс</h3>
                <p className="text-sm text-gray-400">Работаем с 2004 года</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              ООО «Текстиль Комплекс» — ваш надёжный партнёр в сфере постельных принадлежностей. 
              Большой склад, оперативная отшивка, собственный автотранспорт для быстрой доставки.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Навигация</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-gray-300 hover:text-white transition-colors">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  О компании
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-gray-300 hover:text-white transition-colors">
                  Доставка и оплата
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-gray-300 hover:text-white transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Услуги</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/services/custom" className="text-gray-300 hover:text-white transition-colors">
                  Индивидуальная отшивка
                </Link>
              </li>
              <li>
                <Link href="/services/wholesale" className="text-gray-300 hover:text-white transition-colors">
                  Оптовые поставки
                </Link>
              </li>
              <li>
                <Link href="/services/samples" className="text-gray-300 hover:text-white transition-colors">
                  Заказ образцов
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  Часто задаваемые вопросы
                </Link>
              </li>
              <li>
                <Link href="/return" className="text-gray-300 hover:text-white transition-colors">
                  Возврат и обмен
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Контакты</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">+7 (495) 123-45-67</p>
                  <p className="text-gray-400 text-sm">Основной номер</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white">info@textil-kompleks.ru</p>
                  <p className="text-gray-400 text-sm">Основная почта</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white">г. Москва, ул. Примерная, д. 123</p>
                  <p className="text-gray-400 text-sm">Адрес склада</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white">Пн-Пт: 9:00-18:00</p>
                  <p className="text-gray-400 text-sm">Время работы</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-400">20+</div>
              <p className="text-gray-300">лет на рынке</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-400">5000+</div>
              <p className="text-gray-300">довольных клиентов</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-400">24/7</div>
              <p className="text-gray-300">поддержка клиентов</p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-12">
          <h4 className="text-lg font-semibold mb-4">Наш склад на карте</h4>
          <div className="w-full h-72 rounded-lg overflow-hidden border border-gray-800">
            <iframe
              title="Карта склада"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2244.167968695143!2d37.620393!3d55.75396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTXCsDQ1JzEzLjMiTiAzN8KwMzcnMTMuNCJF!5e0!3m2!1sru!2sru!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} ООО «Текстиль Комплекс». Все права защищены.
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Политика конфиденциальности
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Условия использования
              </Link>
              <Link href="/sitemap.xml" className="text-gray-400 hover:text-white text-sm transition-colors">
                Карта сайта
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


