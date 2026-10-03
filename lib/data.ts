import { EventItem, PortfolioItem, TestimonialItem, ServiceItem } from './types';
import portfoliosData from '@/data/portfolios.json';
export const initialEvents: EventItem[] = [];


export const initialPortfolios: PortfolioItem[] = portfoliosData as unknown as PortfolioItem[];


export const initialTestimonials: TestimonialItem[] = [
  {
    id: '1',
    name: 'H. Gendon Subandono',
    role: 'Ketua Panitia Pelaksana Kejurnas',
    avatar_url: 'https://i.pravatar.cc/150?img=67',
    rating: 5,
    content: 'Penyelenggaraan Kejuaraan Nasional Pencak Silat oleh JIWANDANA sangat luar biasa. Pengaturan gelanggang tanding, tata suara iringan gamelan, pencahayaan megah, dan sistem penilaian digital berjalan tanpa kendala sedikit pun. Sangat membanggakan seni bela diri bangsa!',
    event_name: 'KONI Championship I'
  },
  {
    id: '2',
    name: 'Drs. Bambang Sudarsono, M.Pd.',
    role: 'Pengurus Cabang Olahraga Bela Diri',
    avatar_url: 'https://i.pravatar.cc/150?img=53',
    rating: 5,
    content: 'Manajemen waktu dan disiplin panitia JIWANDANA benar-benar patut diacungi jempol. Seluruh jadwal ratusan partai tanding tuntas tepat waktu dari babak penyisihan hingga penyerahan medali di panggung megah.',
    event_name: 'Turnamen Silat Remaja Jatim'
  },
  {
    id: '3',
    name: 'Siti Rahmawati, S.Sn.',
    role: 'Koreografer & Kurator Tari Nusantara',
    avatar_url: 'https://i.pravatar.cc/150?img=47',
    rating: 5,
    content: 'Kerjasama dengan tim JIWANDANA untuk festival seni dan budaya sangat profesional. Audio visual, panggung artistik, dan alur perhelatan dirancang dengan sangat estetis dan menghargai nilai-nilai luhur tradisi.',
    event_name: 'Festival Tari Kontemporer'
  }
];

export const initialServices: ServiceItem[] = [
  {
    id: '1',
    slug: 'kejuaraan-silat',
    title: 'Manajemen Kejuaraan Silat & Olahraga',
    icon: 'emoji_events',
    short_desc: 'Produksi turnamen kompetisi olahraga dengan matras standar internasional, digital score system, wasit juri resmi, dan medali eksklusif.',
    full_desc: 'Kami adalah spesialis pelaksana kejuaraan beladiri dan turnamen olahraga bergengsi. Dari perencanaan teknis bagan tanding, perizinan aparat kepolisian, penyediaan matras berstandar IPSI/KONI, sistem skoring elektronik real-time di layar LED, hingga tim medis dan tenaga pengamanan terlatih.',
    features: [
      'Digital Scoring Board & Screen TV tiap gelanggang',
      'Matras tanding resmi bersertifikasi KONI/IPSI',
      'Manajemen bagan digital & live draw',
      'Medali cor logam eksklusif & piala bergilir marmer'
    ]
  },
  {
    id: '2',
    slug: 'festival-budaya-musik',
    title: 'Festival Seni, Musik & Budaya',
    icon: 'theater_comedy',
    short_desc: 'Perancangan panggung megah, tata cahaya dramatis, sistem tata suara konser line-array, dan koordinasi pengisi acara kesenian nusantara.',
    full_desc: 'Mewujudkan gelaran budaya dan konser musik yang berjiwa dan berkarakter. Kami menangani tata panggung rigging berkelas, tata lampu moving beam dengan laser mapping, sound system kejernihan prima, hingga tata kelola seniman, musisi, dan alur penonton yang aman dan nyaman.',
    features: [
      'Panggung Rigging Aluminium & Ground Support',
      'Tata suara line-array akustik presisi tinggi',
      'Tata cahaya lighting concert-grade & ambient effects',
      'Kurasi seniman tradisi & manajemen musisi nasional'
    ]
  },
  {
    id: '3',
    slug: 'race-management',
    title: 'Race Management (Road & Trail Run)',
    icon: 'sprint',
    short_desc: 'Perencanaan rute lari alam/jalan raya, timing chip system, perizinan jalur, pos medis water station, dan race pack eksklusif.',
    full_desc: 'Membuka potensi wisata daerah melalui perhelatan lari kompetitif maupun rekreasional (Sports Tourism). Mulai dari survei kontur elevasi jalur, Marshall sepeda, hydration point medis, timing chip akurat, hingga jersey finisher berkualitas tinggi.',
    features: [
      'Sistem timing chip pencatat waktu otomatis',
      'Survei rute, pengawalan, dan marshall berpengalaman',
      'Water station terstandar dan pos medis siaga darurat',
      'Jersey sublimasi premium, bib number, dan medali finisher'
    ]
  },
  {
    id: '4',
    slug: 'corporate-expo',
    title: 'Corporate Gathering, Gala Dinner & Expo',
    icon: 'apartment',
    short_desc: 'Acara korporat prestisius, pameran produk eksklusif, malam penganugerahan, dan gathering instansi dengan pelayanan bintang lima.',
    full_desc: 'Perusahaan dan institusi memerlukan gelaran yang mencerminkan martabat serta reputasi tinggi. JIWANDANA merancang konsep kreatif gala dinner, booth expo pameran modern, multimedia interaktif, dan hospitality VIP berkelas hotel bintang lima.',
    features: [
      'Desain booth pameran 3D dan backdrop kustom',
      'Show management dan rundown presisi per detik',
      'Penyediaan MC bilingual, hiburan orkestra, dan dokumentasi 4K',
      'Layanan catering fine-dining dan VIP table arrangement'
    ]
  }
];
