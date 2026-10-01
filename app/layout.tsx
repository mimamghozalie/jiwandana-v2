import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://jiwandana.com'),
  title: "JIWANDANA Event Organizer - Professional & Luxury Events",
  description:
    "Penyedia layanan perencanaan dan produksi event profesional berkelas tinggi. Kami merancang kejuaraan beladiri akbar, festival seni budaya nusantara, gala dinner korporat, dan perlombaan spektakuler.",
  keywords: [
    "event organizer",
    "eo mojokerto",
    "eo jawa timur",
    "kejuaraan pencak silat",
    "koni championship",
    "wedding organizer",
    "corporate gathering",
    "konser musik",
    "JIWANDANA",
  ],
  authors: [{ name: "JIWANDANA Event Organizer" }],
  icons: {
    icon: "/logo.webp",
  },
  openGraph: {
    type: "website",
    title: "JIWANDANA Event Organizer - Professional & Luxury Events",
    description:
      "Penyedia layanan perencanaan dan produksi event profesional berkelas tinggi. Mewujudkan kejuaraan beladiri akbar dan festival spektakuler.",
    images: ["/logo.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "JIWANDANA Event Organizer",
    description: "Perencanaan dan produksi event profesional berkelas tinggi di Indonesia.",
    images: ["/logo.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="light font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-[#f8f8f8] text-slate-800 selection:bg-[#C9A227]/30 selection:text-slate-900 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
