import { type ReactNode } from 'react';
import { AlertCircle, ArrowRight, Check, ChevronDown, CirclePlus, LoaderCircle, RefreshCw, X } from 'lucide-react';
import type { HealthEvent, Profile } from '@workspace/api-client-react';

export const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export function formatDate(value?: string | null, style: 'short' | 'long' = 'short') {
  if (!value) return 'Not added yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { month: style === 'long' ? 'long' : 'short', day: 'numeric', year: style === 'long' ? 'numeric' : undefined }).format(date);
}

export function daysFromNow(value: string) {
  const days = Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
  if (days < 0) return 'Past due';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

const typeStyles: Record<string, { label: string; color: string }> = {
  visit: { label: 'Visit', color: 'bg-[#e5f1ee] text-[#24665b]' },
  symptom: { label: 'Symptom', color: 'bg-[#fff0df] text-[#a95f22]' },
  medication: { label: 'Medication', color: 'bg-[#ebe8f4] text-[#645283]' },
  test: { label: 'Test', color: 'bg-[#e5edf3] text-[#315b76]' },
  diagnosis: { label: 'Diagnosis', color: 'bg-[#f4e6e6] text-[#95504f]' },
  note: { label: 'Note', color: 'bg-[#f2eddd] text-[#816e37]' },
};

export function EventTypeBadge({ type }: { type: string }) {
  const entry = typeStyles[type] ?? typeStyles.note;
  return <span className={cx('inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[.05em] uppercase', entry.color)} data-testid={`badge-event-type-${type}`}>{entry.label}</span>;
}

export function ProfileAvatar({ profile, size = 'md' }: { profile: Pick<Profile, 'initials' | 'color'>; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-8 w-8 text-[11px]', md: 'h-11 w-11 text-sm', lg: 'h-16 w-16 text-lg' };
  return <div className={cx('flex shrink-0 items-center justify-center rounded-2xl font-bold text-[#173f48]', sizes[size])} style={{ backgroundColor: profile.color || '#dfe9d9' }} data-testid={`avatar-profile-${profile.initials}`}>{profile.initials}</div>;
}

export function Button({ children, variant = 'primary', className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'quiet' | 'outline' | 'danger' }) {
  const variants = {
    primary: 'bg-[#173f48] text-[#fbfaf5] hover:bg-[#215865] shadow-[0_8px_20px_rgba(23,63,72,.14)]',
    quiet: 'bg-[#f0eee7] text-[#35535a] hover:bg-[#e5e1d6]',
    outline: 'border border-[#cbd6d0] bg-transparent text-[#35535a] hover:bg-[#f4f3ec]',
    danger: 'bg-[#f6e2df] text-[#8f4746] hover:bg-[#efd1cc]',
  };
  return <button className={cx('inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50', variants[variant], className)} {...props}>{children}</button>;
}

export function LoadingState({ lines = 4 }: { lines?: number }) {
  return <div className="space-y-4" data-testid="status-loading">{Array.from({ length: lines }).map((_, i) => <div className="flex animate-pulse-soft items-center gap-4" key={i}><div className="h-10 w-10 rounded-xl bg-[#e5e5dc]" /><div className="flex-1 space-y-2"><div className="h-3 w-2/5 rounded bg-[#e5e5dc]" /><div className="h-3 w-4/5 rounded bg-[#eaeae3]" /></div></div>)}</div>;
}

export function ErrorState({ onRetry, message = 'We could not load this part of your health memory.' }: { onRetry?: () => void; message?: string }) {
  return <div className="rounded-2xl border border-[#e7c9c4] bg-[#fff5f2] p-7 text-center" data-testid="status-error"><AlertCircle className="mx-auto mb-3 h-7 w-7 text-[#a6544f]" /><h3 className="font-serif text-xl text-[#713d3b]">A small interruption</h3><p className="mx-auto mt-1 max-w-sm text-sm text-[#875e5a]">{message}</p>{onRetry && <Button variant="outline" className="mt-5" onClick={onRetry}><RefreshCw className="h-4 w-4" /> Try again</Button>}</div>;
}

export function EmptyState({ icon: Icon = CirclePlus, title, detail, action }: { icon?: typeof CirclePlus; title: string; detail: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-[#cbd6d0] bg-[#faf9f3] p-10 text-center" data-testid="status-empty"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f1ee] text-[#24665b]"><Icon className="h-5 w-5" /></div><h3 className="font-serif text-xl text-[#173f48]">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6f7f7d]">{detail}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export function Modal({ open, title, detail, onClose, children }: { open: boolean; title: string; detail?: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#153940]/30 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true"><div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] bg-[#fffdf8] p-6 shadow-2xl sm:max-w-xl sm:rounded-[2rem] sm:p-8"><div className="mb-6 flex items-start justify-between gap-4"><div><h2 className="font-serif text-2xl text-[#173f48]">{title}</h2>{detail && <p className="mt-1 text-sm text-[#75817f]">{detail}</p>}</div><button className="rounded-full p-2 text-[#75817f] hover:bg-[#f0eee7]" onClick={onClose} aria-label="Close dialog" data-testid="button-close-dialog"><X className="h-5 w-5" /></button></div>{children}</div></div>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="block space-y-2"><span className="text-xs font-bold uppercase tracking-[.11em] text-[#6f7f7d]">{label}</span>{children}{hint && <span className="block text-xs text-[#8b9692]">{hint}</span>}</label>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx('h-11 w-full rounded-xl border border-[#d3dcd6] bg-[#fcfcf8] px-3.5 text-sm text-[#173f48] outline-none transition placeholder:text-[#a4aeaa] focus:border-[#4f8d81] focus:ring-2 focus:ring-[#4f8d81]/15', props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx('min-h-24 w-full resize-y rounded-xl border border-[#d3dcd6] bg-[#fcfcf8] px-3.5 py-3 text-sm leading-6 text-[#173f48] outline-none transition placeholder:text-[#a4aeaa] focus:border-[#4f8d81] focus:ring-2 focus:ring-[#4f8d81]/15', props.className)} />;
}

export function EventRow({ event, profile, onClick }: { event: HealthEvent; profile?: Profile; onClick?: () => void }) {
  return <div onClick={onClick} onKeyDown={(eventKey) => { if (onClick && (eventKey.key === 'Enter' || eventKey.key === ' ')) { eventKey.preventDefault(); onClick(); } }} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} className="group flex w-full items-start gap-4 rounded-2xl border border-[#e4e5dc] bg-[#fffdf8] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#b8c9c0] hover:shadow-[0_8px_20px_rgba(23,63,72,.06)]" data-testid={`row-event-${event.id}`}><div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf2ec] text-[#3e7065]"><span className="font-mono text-xs font-bold uppercase">{event.type.slice(0, 2)}</span></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><EventTypeBadge type={event.type} /><span className="font-mono text-[11px] text-[#98a19d]">{formatDate(event.date)}</span>{profile && <span className="text-xs text-[#71817d]">· {profile.name}</span>}</div><h3 className="mt-2 truncate font-bold text-[#173f48]">{event.title}</h3><p className="mt-1 line-clamp-2 text-sm leading-5 text-[#71817d]">{event.description}</p>{event.provider && <p className="mt-2 text-xs font-medium text-[#52756e]">{event.provider}{event.location ? ` · ${event.location}` : ''}</p>}</div><ArrowRight className="mt-3 h-4 w-4 shrink-0 text-[#b4c0b9] transition group-hover:translate-x-1 group-hover:text-[#4c877b]" /></div>;
}

export function SelectChevron() { return <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#81918b]" />; }

export function CompletedMark() { return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4d8b7d] text-[#fffdf8]"><Check className="h-3.5 w-3.5" /></span>; }

export function BusyLabel({ children }: { children: ReactNode }) { return <span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />{children}</span>; }