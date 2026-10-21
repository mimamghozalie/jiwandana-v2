import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DaftarTrailrunPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const mode = resolvedParams?.mode;
  const type = resolvedParams?.type;
  const dist = resolvedParams?.dist;

  const isBulk = mode === 'bulk' || type === 'kelompok';
  const queryParts: string[] = [];

  if (dist && typeof dist === 'string') {
    queryParts.push(`dist=${encodeURIComponent(dist)}`);
  }

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  if (isBulk) {
    redirect(`/trailrun/daftar/kelompok${queryString}`);
  } else {
    redirect(`/trailrun/daftar/individu${queryString}`);
  }
}
