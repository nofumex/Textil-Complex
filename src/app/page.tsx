import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/home/hero-section';
import { TrustSection } from '@/components/home/trust-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { ServicesSection } from '@/components/home/services-section';
import { ContactSection } from '@/components/home/contact-section';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        <TrustSection />
        <FeaturedProducts />
        <ServicesSection />
        <ContactSection />
      </main>
      
      <Footer />
    </div>
  );
}


