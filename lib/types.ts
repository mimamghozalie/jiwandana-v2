export interface EventItem {
  id: string;
  slug: string;
  title: string;
  category: 'perlombaan' | 'festival' | 'olahraga' | 'umum';
  event_date: string;
  location: string;
  status: 'active' | 'upcoming' | 'completed';
  badge_text?: string;
  poster_url: string;
  description: string;
  rundown?: string;
  juknis_url?: string;
  registration_url?: string;
  portfolio_url?: string;
  guide_book_url?: string;
  rules_url?: string;
  created_at?: string;
}

export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  category: 'perlombaan' | 'festival' | 'internasional' | 'corporate';
  client?: string;
  event_date: string;
  location?: string;
  cover_image: string;
  gallery_images: string[];
  stats?: {
    participants?: string;
    contingents?: string;
    arenas?: string;
    medals?: string;
  };
  description: string;
  created_at?: string;
}

export interface BookingSubmission {
  id?: string;
  instansi: string;
  pemohon: string;
  contact: string;
  event_type: string;
  scale: string;
  document_url?: string | null;
  status?: 'pending' | 'contacted' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at?: string;
}

export interface ContactSubmission {
  id?: string;
  nama: string;
  email: string;
  jenis_acara: string;
  detail_acara: string;
  status?: 'unread' | 'read' | 'replied';
  created_at?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  avatar_url: string;
  rating: number;
  content: string;
  event_name?: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  icon: string;
  short_desc: string;
  full_desc: string;
  features: string[];
}

export interface TrailrunWaypoint {
  name: string;
  km: string;
  elev: string;
  type: string;
}

export interface TrailrunRoute {
  title: string;
  distance: string;
  elevation: string;
  maxAlt: string;
  cot: string;
  wsCount: string;
  surface: {
    trail: string;
    stone: string;
    road: string;
  };
  waypoints: TrailrunWaypoint[];
  elevationPoints: number[];
}

export interface TrailrunCard {
  id: string;
  categoryName: string;
  categoryCode: string;
  badge: string;
  distance: string;
  elevationGain: string;
  cutOffTime: string;
  waterStations: string;
  bannerImage: string;
  prices: {
    early: string;
    presale: string;
    regular: string;
  };
  facilities: string[];
  description: string;
  backStats: {
    distance: string;
    elevation: string;
    cutOff: string;
    startTime: string;
  };
  elevationSvgPath: string;
  elevationSvgFill: string;
  summitPoint: {
    x: number;
    y: number;
  };
}

export interface TrailrunRegistration {
  id?: string;
  nama: string;
  email: string;
  no_bib: string;
  no_hp: string;
  alamat: string;
  kota: string;
  provinsi: string;
  kewarganegaraan: string;
  tanggal_lahir: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  nama_komunitas?: string;
  golongan_darah: 'A' | 'B' | 'AB' | 'O';
  riwayat_medis?: string;
  kontak_darurat: string;
  kategori: string;
  status?: 'pending' | 'confirmed' | 'paid';
  created_at?: string;
}

