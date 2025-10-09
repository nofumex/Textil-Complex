import React from 'react';
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/product/product-details';

interface ProductPageProps {
  params: { slug: string };
}

async function fetchProduct(slug: string) {
  const base = (process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.startsWith('http'))
    ? process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')
    : 'http://localhost:3000';
  const res = await fetch(`${base}/api/products/${slug}`, { cache: 'no-store' });
  const json = await res.json();
  if (!json.success) return null;
  return json.data;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await fetchProduct(params.slug);
  if (!product) return notFound();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header is global from RootLayout */}
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img src={product.images?.[0] || 'https://placehold.co/800x800?text=No+Image'} alt={product.title} className="w-full h-full object-cover" />
              </div>
              {product.images?.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((src: string, i: number) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded overflow-hidden">
                      <img src={src || 'https://placehold.co/200x200?text=No+Image'} alt={`${product.title} ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <ProductDetails product={product} />
            </div>
          </div>
        </div>
      </main>
      {/* Footer is global from RootLayout */}
    </div>
  );
}


