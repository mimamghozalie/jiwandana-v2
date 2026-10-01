'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Silakan masukkan username dan password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Username atau password salah.');
        setLoading(false);
        return;
      }

      // Login success, redirect to destination
      router.push(from);
      router.refresh();
    } catch {
      setErrorMsg('Gagal terhubung ke server. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070e1a] text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#e9c176]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-md flex justify-between items-center py-4 z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-7 h-7">
            <Image src="/logo.webp" alt="Logo" fill className="object-contain" />
          </div>
          <span className="font-serif font-bold text-sm tracking-wider text-[#e9c176] group-hover:text-white transition-colors">
            JIWANDANA
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>Ke Website</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </header>

      {/* Center Login Card */}
      <main className="w-full max-w-md my-auto z-10">
        <div className="bg-[#0a1424] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative backdrop-blur-xl">
          {/* Card Top Title & Icon */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#e9c176]/10 border border-[#e9c176]/30 flex items-center justify-center mx-auto text-[#e9c176] shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
              Login Admin Panel
            </h1>
            <p className="text-xs text-slate-400">
              Masuk untuk mengakses sistem CMS dan manajemen peserta
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium block">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username admin"
                  autoComplete="username"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#e9c176] focus:ring-1 focus:ring-[#e9c176] outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#e9c176] focus:ring-1 focus:ring-[#e9c176] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-[#e9c176] hover:bg-[#d1a751] disabled:opacity-50 text-[#0d1c32] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#e9c176]/10 flex items-center justify-center gap-2 cursor-pointer transform active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Panel CMS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Card Footer Info */}
          <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-white/5">
            <span>Akses terbatas untuk administrator berwenang JIWANDANA.</span>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full max-w-md text-center py-4 text-[11px] text-slate-500 z-10">
        <span>© 2026 JIWANDANA Event Organizer • Dilindungi SSL 256-bit</span>
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070e1a] flex items-center justify-center text-slate-400 text-xs">
          Memuat halaman login...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}

