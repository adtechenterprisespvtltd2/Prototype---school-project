'use client'

import { useEffect, useState, type ComponentType } from 'react'
import { ChevronDown, X } from 'lucide-react'

export type MobileTab = { id: string; label: string; icon: ComponentType<{ size?: number; className?: string }> }

// Phone-only section switcher: a sticky bar showing the current section that opens a grid of all sections.
// Portals keep their normal tab bar from the `sm` breakpoint up.
export default function MobileTabs({ tabs, active, onChange }: { tabs: MobileTab[]; active: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const current = tabs.find((t) => t.id === active) ?? tabs[0]
  const CurrentIcon = current.icon

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (id: string) => {
    onChange(id)
    setOpen(false)
    // Bring the new section into view just below the sticky bars.
    requestAnimationFrame(() => {
      const anchor = document.getElementById('portal-sections')
      if (anchor) window.scrollTo({ top: anchor.getBoundingClientRect().top + window.scrollY - 150, behavior: 'smooth' })
    })
  }

  return (
    <>
      <div id="portal-sections" className="sticky top-20 z-40 -mx-4 mb-4 border-b sm:hidden border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-left text-white shadow-lg active:scale-[0.99]"
        >
          <span className="flex min-w-0 items-center gap-3">
            <CurrentIcon size={20} className="shrink-0 text-cyan-300" />
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Section</span>
              <span className="block truncate font-bold">{current.label}</span>
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1.5 text-xs font-bold">
            All {tabs.length} <ChevronDown size={16} />
          </span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end bg-slate-950/50 sm:hidden backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Choose a section"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl animate-fade-in-up"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Go to section</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {tabs.map((t) => {
                const Icon = t.icon
                const isActive = t.id === current.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => choose(t.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-2xl border p-2 text-center text-xs font-bold leading-tight transition ${
                      isActive ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 active:bg-slate-100'
                    }`}
                  >
                    <Icon size={22} className={isActive ? 'text-cyan-300' : 'text-blue-600'} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
