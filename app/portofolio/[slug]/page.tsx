import React from 'react';
import { notFound } from 'next/navigation';
import { getPortfolioBySlug, getPortfolios } from '@/lib/api';
import PortfolioClient from './PortfolioClient';
import type { Metadata } from 'next';

interface PortfolioPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const portfolios = await getPortfolios();
  const defaultSlugs = ['koni-1', 'koni-championship-1', 'festival-silat-yogyakarta', 'kejurprov-silat-jatim'];
  const allSlugs = new Set([...portfolios.map((p) => p.slug), ...defaultSlugs]);
  return Array.from(allSlugs).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const portfolio = await getPortfolioBySlug(slug);
  if (!portfolio) return { title: 'Portofolio Tidak Ditemukan' };

  return {
    title: `${portfolio.title} - Portofolio JIWANDANA`,
    description: portfolio.description,
    openGraph: {
      title: portfolio.title,
      description: portfolio.description,
      images: portfolio.cover_image ? [portfolio.cover_image] : [],
    },
  };
}

export default async function PortfolioDetailPage({ params }: PortfolioPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const portfolio = await getPortfolioBySlug(slug);

  if (!portfolio) {
    notFound();
  }

  return <PortfolioClient portfolio={portfolio} />;
}

