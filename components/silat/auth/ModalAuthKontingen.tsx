'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  Shield,
  Building,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useSilatAuth } from './useSilatAuth';

interface ModalAuthKontingenProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export default function ModalAuthKontingen({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}: ModalAuthKontingenProps) {
  const { login, register } = useSilatAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form State: Cukup Nama Kontingen, Email, Password
  const [namaKontingen, setNamaKontingen] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setSuccessMsg('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSwitchTab = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Mohon masukkan email dan kata sandi.');
      return;
    }

    setLoading(true);
    const res = await login({ email, password });
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Login berhasil! Mengarahkan...');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } else {
      setErrorMsg(res.error || 'Login gagal.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!namaKontingen.trim()) {
      setErrorMsg('Nama kontingen wajib diisi.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Alamat email tidak valid.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password minimal terdiri dari 6 karakter.');
      return;
    }

    setLoading(true);
    const res = await register({
      nama_kontingen: namaKontingen.trim(),
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Akun kontingen berhasil dibuat! Mengarahkan...');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } else {
      setErrorMsg(res.error || 'Pendaftaran gagal.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-gradient-to-b from-[#0b192c]/95 via-[#0c1f38]/95 to-[#051120]/95 text-white rounded-3xl border border-cyan-500/30 shadow-[0_20px_50px_rgba(0,180,216,0.3)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glow Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-blue-500/20 blur-3xl pointer-events-none" />

        {/* Tombol Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          aria-label="Tutup Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pt-6 pb-4 px-6 text-center space-y-1 relative z-10 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold tracking-wider uppercase mb-1">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            Portal Resmi DSC 2026
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white drop-shadow-md">
            {mode === 'login' ? 'Masuk Akun Kontingen' : 'Daftar Akun Kontingen'}
          </h2>
          <p className="text-xs text-slate-300 max-w-xs mx-auto">
            {mode === 'login'
              ? 'Masukkan email & password akun kontingen Anda.'
              : 'Daftarkan nama kontingen, email & password akun Anda.'}
          </p>

          {/* Dual Tab Button */}
          <div className="pt-3 flex rounded-xl p-1 bg-white/5 border border-white/10 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => handleSwitchTab('login')}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MASUK
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('register')}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-[#ff007f] to-[#d6006c] text-white shadow-md shadow-pink-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DAFTAR BARU
            </button>
          </div>
        </div>

        {/* Form Area */}
        <div className="p-6">
          {/* Alert Error */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start gap-2.5 animate-[fadeIn_0.2s_ease-out]">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Alert Success */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5 animate-[fadeIn_0.2s_ease-out]">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ======================= TAB 1: MASUK (LOGIN) ======================= */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  Email Akun Kontingen
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kontingen@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl text-white text-sm outline-none transition placeholder:text-slate-500"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl text-white text-sm outline-none transition placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-cyan-400/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>MASUK KE AKUN KONTINGEN</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Belum memiliki akun kontingen?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('register')}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                  >
                    Daftar di sini
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* ======================= TAB 2: DAFTAR (REGISTER) ======================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* 1. Nama Kontingen */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-pink-400" />
                  Nama Kontingen
                </label>
                <input
                  type="text"
                  required
                  value={namaKontingen}
                  onChange={(e) => setNamaKontingen(e.target.value)}
                  placeholder="Contoh: Satria Diponegoro Gondang / SMPN 1 Trawas"
                  className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl text-white text-sm outline-none transition placeholder:text-slate-500"
                />
              </div>

              {/* 2. Email */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-pink-400" />
                  Email Akun
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kontingen@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl text-white text-sm outline-none transition placeholder:text-slate-500"
                />
              </div>

              {/* 3. Password */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-pink-400" />
                  Kata Sandi (Minimal 6 Karakter)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900/60 border border-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl text-white text-sm outline-none transition placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Register */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-[#ff007f] via-[#e60073] to-[#b30059] hover:from-[#ff1a8c] hover:to-[#cc0066] text-white font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-pink-500/25 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-pink-400/40"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>DAFTARKAN AKUN KONTINGEN</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <p className="text-xs text-slate-400">
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('login')}
                    className="text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer"
                  >
                    Masuk di sini
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
