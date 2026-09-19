import { type ReactNode } from 'react';
import { BookHeart, CalendarClock, ChevronRight, CircleUserRound, Home, Menu, Plus, UsersRound, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { cx } from './shared';

const nav = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/timeline', label: 'Timeline', icon: CalendarClock },
  { href: '/profiles', label: 'People', icon: UsersRound },
  { href: '/reminders', label: 'Follow-ups', icon: CircleUserRound },
];

export function HealthVaultShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="min-h-[100dvh] bg-[#f5faff] text-[#18324b]">
    <aside className={cx('fixed inset-y-0 left-0 z-30 flex w-[248px] -translate-x-full flex-col border-r border-[#deebf4] bg-white px-5 py-6 transition-transform duration-300 lg:translate-x-0', mobileOpen && 'translate-x-0')}>
      <div className="flex items-center justify-between px-2">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)} data-testid="link-brand">
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#d9efff] text-[#2474ad]"><BookHeart className="h-5 w-5" /></span>
          <span><span className="block font-serif text-[23px] leading-none tracking-[-.03em] text-[#173b59]">Nura</span><span className="mt-1 block text-[10px] font-medium tracking-[.03em] text-[#7e96aa]">Your family’s health, remembered.</span></span>
        </Link>
        <button className="rounded-lg p-2 text-[#718da3] lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation"><X className="h-5 w-5" /></button>
      </div>
      <div className="mt-12 flex-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#8ba4b8]">Your family</p>
        <nav className="mt-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => { const active = href === '/' ? location === '/' : location.startsWith(href); return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={cx('group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition', active ? 'bg-[#e8f5ff] text-[#1c6ea7]' : 'text-[#60798f] hover:bg-[#f2f8fc] hover:text-[#173b59]')} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon className={cx('h-[18px] w-[18px]', active ? 'text-[#3189c5]' : 'text-[#8aa5b9]')} /><span>{label}</span>{active && <ChevronRight className="ml-auto h-4 w-4 text-[#5aa5d4]" />}</Link>})}
        </nav>
        <Link href="/timeline?new=1" onClick={() => setMobileOpen(false)} className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-[#267db8] px-3 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(38,125,184,.16)] transition hover:bg-[#1f6fa5]" data-testid="link-add-memory"><Plus className="h-4 w-4" />Add health memory</Link>
      </div>
      <div className="rounded-2xl border border-[#dbeef9] bg-[#f3faff] p-4"><p className="font-serif text-base text-[#1e557d]">Small details help later.</p><p className="mt-1 text-xs leading-5 text-[#7592a7]">Keep what matters in one calm, shared place.</p></div>
      <div className="mt-5 flex items-center gap-3 px-2 text-xs text-[#7d96aa]"><div className="h-7 w-7 rounded-full bg-[#d9efff] text-center leading-7 font-bold text-[#2877ac]">N</div><span>Nura family space</span></div>
    </aside>
    <div className="lg:pl-[248px]">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#deebf4] bg-[#f5faff]/95 px-5 backdrop-blur-md sm:px-8 lg:px-12">
        <button className="rounded-xl p-2 text-[#54758e] hover:bg-[#e9f5fc] lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu className="h-5 w-5" /></button>
        <div className="hidden items-center gap-2 text-sm text-[#718ba0] sm:flex"><span className="font-semibold">A gentle place to remember</span><span className="h-1 w-1 rounded-full bg-[#b7d1e1]" /><span>Your family’s health, remembered.</span></div>
        <div className="ml-auto flex items-center gap-2"><Link href="/timeline?new=1" className="inline-flex items-center gap-2 rounded-xl bg-[#e7f5ff] px-3 py-2 text-sm font-bold text-[#2675aa] transition hover:bg-[#d9effc]" data-testid="link-header-add-memory"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Add memory</span></Link><Link href="/profiles" className="flex items-center gap-2 rounded-xl border border-[#d7e8f2] bg-white px-3 py-2 text-sm font-bold text-[#476b85] transition hover:bg-[#f2f8fc]" data-testid="link-switch-profile"><UsersRound className="h-4 w-4" /><span className="hidden sm:inline">People</span></Link></div>
      </header>
      <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">{children}</main>
    </div>
  </div>;
}