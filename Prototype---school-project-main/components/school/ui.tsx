'use client'

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8', className)}>{children}</section>
}

export function PanelHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

const TONES = {
  slate: 'bg-slate-900 text-white [&_.sub]:text-slate-300',
  blue: 'bg-blue-950 text-white [&_.sub]:text-blue-200',
  emerald: 'bg-emerald-600 text-white [&_.sub]:text-emerald-100',
  rose: 'bg-rose-600 text-white [&_.sub]:text-rose-100',
  amber: 'bg-amber-500 text-white [&_.sub]:text-amber-50',
  cyan: 'bg-cyan-900 text-white [&_.sub]:text-cyan-200',
  violet: 'bg-violet-700 text-white [&_.sub]:text-violet-200',
  light: 'bg-slate-50 border border-slate-200 text-slate-900 [&_.sub]:text-slate-500',
}

export function StatTile({ label, value, hint, tone = 'light', icon }: { label: string; value: ReactNode; hint?: ReactNode; tone?: keyof typeof TONES; icon?: ReactNode }) {
  return (
    <div className={cn('rounded-2xl p-4 sm:p-5', TONES[tone])}>
      <div className="flex items-center justify-between gap-2">
        <p className="sub text-xs font-semibold uppercase tracking-wide">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold sm:text-3xl">{value}</p>
      {hint && <p className="sub mt-1 text-xs">{hint}</p>}
    </div>
  )
}

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold', className)}>{children}</span>
}

export function ProgressBar({ value, className, barClassName }: { value: number; className?: string; barClassName?: string }) {
  return (
    <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-slate-100', className)}>
      <div className={cn('h-full rounded-full bg-gradient-to-r from-slate-700 to-blue-700 transition-all duration-500', barClassName)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
      <div className="mb-3 text-slate-400">{icon}</div>
      <p className="font-bold text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
    </div>
  )
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[] }) {
  return (
    <div className="inline-flex max-w-full overflow-x-auto rounded-2xl bg-slate-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition sm:text-sm',
            value === o.value ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100'

export const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50'

export const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn('max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [message, onDone])
  if (!message) return null
  return (
    <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 animate-fade-in-up rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
      {message}
    </div>
  )
}

export function readFileAttachment(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0]
  if (!file) return null
  return { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` }
}
