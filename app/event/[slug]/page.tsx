import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import EventDetailClient from './EventDetailClient';
import { getEventBySlug } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await getEventBySlug(slug);
    if (!event) return { title: 'Detail Event - JIWANDANA Event Organizer' };

    return {
      title: `${event.title} - JIWANDANA Event Organizer`,
      description: event.description,
      openGraph: {
        title: event.title,
        description: event.description,
        images: event.poster_url ? [event.poster_url] : [],
      },
    };
  } catch {
    return { title: 'Detail Event - JIWANDANA Event Organizer' };
  }
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="pt-20 min-h-screen bg-[#f8f8f8] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[#C9A227] animate-spin">
              progress_activity
            </span>
            <span className="text-sm text-slate-500 font-medium">Memuat event...</span>
          </div>
        </div>
      }
    >
      <EventDetailClient slug={slug} />
    </Suspense>
  );
}
