import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Users, CreditCard, RefreshCw } from 'lucide-react';

interface SilatSubNavProps {
  totalAtlets: number;
  totalKontingen: number;
  totalPayments: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function SilatSubNav({
  totalAtlets,
  totalKontingen,
  totalPayments,
  onRefresh,
  isRefreshing,
}: SilatSubNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Data Atlet',
      href: '/admin/silat/atlet',
      icon: Trophy,
      count: totalAtlets,
    },
    {
      name: 'Kontingen & Official',
      href: '/admin/silat/kontingen',
      icon: Users,
      count: totalKontingen,
    },
    {
      name: 'Transaksi Pembayaran',
      href: '/admin/silat/pembayaran',
      icon: CreditCard,
      count: totalPayments,
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-2xl p-1.5 sm:p-2">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
              {item.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-end px-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
          title="Segarkan data dari database"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00b4d8]' : ''}`} />
          <span>{isRefreshing ? 'Memuat...' : 'Refresh'}</span>
        </button>
      </div>
    </div>
  );
}
