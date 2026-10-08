'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, BookOpenCheck, CalendarX2, GraduationCap, Megaphone, MessageCircle, Wallet, FileCheck2 } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useSchoolData } from '@/context/school-data-context'
import { ClassId } from '@/lib/school-data'
import { Update, UpdateKind, parentUpdates, studentUpdates, teacherUpdates } from '@/lib/updates'
import { openPortalTab } from '@/lib/use-portal-tab'

export const UPDATE_ICONS: Record<UpdateKind, typeof Bell> = {
  homework: BookOpenCheck,
  result: GraduationCap,
  attendance: CalendarX2,
  notice: Megaphone,
  message: MessageCircle,
  fee: Wallet,
  submission: FileCheck2,
}

const PORTAL_PATH: Record<string, string> = {
  student: '/student-portal',
  parent: '/parent-portal',
  teacher: '/teacher-portal',
}

// Updates for whoever is signed in (students, parents and teachers get a feed).
export function useMyUpdates() {
  const { user } = useAuth()
  const { data } = useSchoolData()
  return useMemo<Update[]>(() => {
    if (!user) return []
    if (user.role === 'student') return studentUpdates(data, user.id)
    if (user.role === 'parent') return parentUpdates(data, user.childrenIds?.[0] || 'STU001')
    if (user.role === 'teacher') return teacherUpdates(data, (user.classId === 'CLASS-10B' ? '10B' : '10A') as ClassId)
    return []
  }, [user, data])
}

export function relativeDay(at: string) {
  const d = new Date(at.length === 10 ? `${at}T00:00:00` : at)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((today.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86_400_000)
  if (diff <= 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function UpdateRow({ update, onOpen }: { update: Update; onOpen: (u: Update) => void }) {
  const Icon = UPDATE_ICONS[update.kind]
  return (
    <button type="button" onClick={() => onOpen(update)} className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 active:bg-slate-100">
      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${update.urgent ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold leading-snug text-slate-900">{update.title}</span>
        <span className="block truncate text-xs text-slate-500">{update.detail}</span>
      </span>
      <span className="shrink-0 text-[11px] font-semibold text-slate-400">{relativeDay(update.at)}</span>
    </button>
  )
}

export function useOpenUpdate() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  return (u: Update) => {
    const path = user ? PORTAL_PATH[user.role] : undefined
    if (!path) return
    if (pathname === path) openPortalTab(u.tab)
    else router.push(`${path}?tab=${u.tab}`)
  }
}

export default function NotificationBell() {
  const { user } = useAuth()
  const updates = useMyUpdates()
  const openUpdate = useOpenUpdate()
  const [open, setOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState<string | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const seenKey = user ? `edupro-updates-seen-${user.id}` : ''

  useEffect(() => {
    if (!seenKey) return
    try {
      setLastSeen(localStorage.getItem(seenKey))
    } catch {
      setLastSeen(null)
    }
  }, [seenKey])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user || !PORTAL_PATH[user.role]) return null

  // Before the first visit, count the last week as new.
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10)
  const unread = updates.filter((u) => u.at > (lastSeen ?? weekAgo)).length

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) {
      const now = new Date()
      const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${now.toTimeString().slice(0, 8)}`
      try {
        localStorage.setItem(seenKey, stamp)
      } catch {}
      setLastSeen(stamp)
    }
  }

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Notifications${unread ? `, ${unread} new` : ''}`}
        aria-expanded={open}
        className="relative flex rounded-lg p-2 transition-all duration-200 hover:scale-110 hover:bg-blue-700/50"
      >
        <Bell size={20} className="text-white" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white ring-2 ring-slate-900">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-20 z-[60] max-h-[75vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="font-bold text-slate-900">Updates</p>
            <span className="text-xs font-semibold text-slate-500">{updates.length ? `${updates.length} recent` : ''}</span>
          </div>
          <div className="max-h-[calc(75vh-52px)] overflow-y-auto p-1.5">
            {updates.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">You are all caught up.</p>
            ) : (
              updates.map((u) => (
                <UpdateRow
                  key={u.id}
                  update={u}
                  onOpen={(x) => {
                    setOpen(false)
                    openUpdate(x)
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
