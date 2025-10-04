import React from 'react';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { api } from '@/hooks/useApi';

interface ProductPageProps {
  params: { slug: string };
}

async function fetchProduct(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/products/${slug}`, { cache: 'no-store' });
  const json = await res.json();
  if (!json.success) return null;
  return json.data;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await fetchProduct(params.slug);
  if (!product) return notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img src={product.images?.[0] || '/product-placeholder.jpg'} alt={product.title} className="w-full h-full object-cover" />
              </div>
              {product.images?.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((src: string, i: number) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded overflow-hidden">
                      <img src={src} alt={`${product.title} ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>
              {product.material && <p className="text-gray-600 mb-6">{product.material}</p>}
              <div className="flex items-baseline space-x-3 mb-6">
                <span className="text-3xl font-bold">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(Number(product.price))}</span>
                {product.oldPrice && (
                  <span className="text-gray-400 line-through">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(Number(product.oldPrice))}</span>
                )}
              </div>
              <div className="prose max-w-none mb-8">
                <p>{product.description}</p>
                {product.content && <div dangerouslySetInnerHTML={{ __html: product.content }} />}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {product.dimensions && <div>Размеры: {product.dimensions}</div>}
                {product.weight && <div>Вес: {product.weight} кг</div>}
                <div>Наличие: {product.isInStock ? 'В наличии' : 'Нет в наличии'}</div>
                <div>Артикул: {product.sku}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


