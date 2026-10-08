'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Medal,
  Megaphone,
  MessageCircle,
  Phone,
  Quote,
  Sparkles,
  Trophy,
  UserCheck,
  Users,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { useSchoolData } from '@/context/school-data-context'
import {
  CLASSES,
  HOLIDAYS,
  ROSTER,
  SCHOOL_EVENTS,
  SCHOOL_INFO,
  SUBJECTS,
  classRanking,
  formatDate,
  noticesFor,
  parseISODate,
  summarizeAttendance,
  todayISO,
} from '@/lib/school-data'

function SectionHeading({ eyebrow, title, description, center = true }: { eyebrow: string; title: string; description?: string; center?: boolean }) {
  return (
    <div className={center ? 'mx-auto mb-10 max-w-2xl text-center sm:mb-12' : 'mb-8'}>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{eyebrow}</p>
      <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base text-slate-600 sm:text-lg">{description}</p>}
    </div>
  )
}

function Placeholder({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />
}

/* Latest public notices, scrolling under the hero (like a school notice board). */
export function NoticesStrip() {
  const { data, ready } = useSchoolData()
  const notices = noticesFor(data.notices, 'everyone')
    .filter((n) => n.audience === 'everyone')
    .slice(0, 5)

  return (
    <section aria-label="Latest notices" className="border-b border-blue-900/20 bg-slate-900 text-white">
      <div className="mx-auto flex max-w-7xl items-stretch">
        <Link href="/notices" className="z-10 flex shrink-0 items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-sm font-bold text-slate-900 sm:px-6">
          <Megaphone size={18} />
          <span className="hidden sm:inline">Latest notices</span>
          <span className="sm:hidden">Notices</span>
        </Link>
        <div className="relative flex-1 overflow-hidden">
          {ready && notices.length > 0 ? (
            <div className="notice-marquee flex w-max items-center gap-10 py-3 pl-6 hover:[animation-play-state:paused]">
              {[...notices, ...notices].map((n, i) => (
                <Link key={`${n.id}-${i}`} href="/notices" className="flex items-center gap-2 whitespace-nowrap text-sm hover:text-cyan-300" aria-hidden={i >= notices.length}>
                  {n.priority === 'high' && <span className="rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold uppercase">New</span>}
                  <span className="font-semibold">{n.title}</span>
                  <span className="text-slate-400">· {formatDate(n.date, { day: 'numeric', month: 'short' })}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-6 py-3 text-sm text-slate-400">{ready ? 'No notices right now.' : 'Loading notices…'}</p>
          )}
        </div>
      </div>
    </section>
  )
}

/* One-tap shortcuts for parents (like DPS's "Online" menu). Portals open as the demo parent. */
export function ParentQuickLinks() {
  const links = [
    { href: '/parent-portal?tab=fees', label: 'Pay fees', icon: CreditCard, color: 'bg-emerald-100 text-emerald-700' },
    { href: '/parent-portal?tab=attendance', label: 'Attendance', icon: CalendarCheck2, color: 'bg-blue-100 text-blue-700' },
    { href: '/parent-portal?tab=reportcard', label: 'Report card', icon: GraduationCap, color: 'bg-violet-100 text-violet-700' },
    { href: '/parent-portal?tab=homework', label: 'Homework', icon: ClipboardList, color: 'bg-amber-100 text-amber-700' },
    { href: '/parent-portal?tab=messages', label: 'Message teacher', icon: MessageCircle, color: 'bg-cyan-100 text-cyan-700' },
    { href: '/parent-portal?tab=timetable', label: 'Timetable', icon: Clock, color: 'bg-rose-100 text-rose-700' },
    { href: '/notices', label: 'Notices', icon: Megaphone, color: 'bg-orange-100 text-orange-700' },
    { href: '/admissions', label: 'Admissions', icon: Award, color: 'bg-indigo-100 text-indigo-700' },
  ]
  return (
    <section className="bg-white px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="For parents" title="Quick links" description="Everything you need for your child, one tap away." />
        <div className="grid grid-cols-4 gap-3 sm:gap-4 lg:grid-cols-8">
          {links.map((l) => {
            const Icon = l.icon
            return (
              <Link
                key={l.label}
                href={l.href}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg sm:p-5"
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl sm:h-14 sm:w-14 ${l.color}`}>
                  <Icon size={22} />
                </span>
                <span className="text-xs font-bold leading-tight text-slate-800 sm:text-sm">{l.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* Message from the principal (like DAIS and DPS). */
export function PrincipalMessage() {
  return (
    <section className="bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-50 px-4 py-12 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-5 lg:gap-12">
        <div className="flex flex-col items-center text-center lg:col-span-2">
          <div className="relative">
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-blue-900 text-5xl font-bold text-white shadow-2xl ring-8 ring-white sm:h-48 sm:w-48">
              DB
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-slate-900 shadow">Principal</span>
          </div>
          <p className="mt-6 text-xl font-bold text-slate-900">{SCHOOL_INFO.principal}</p>
          <p className="text-sm text-slate-500">M.Sc., B.Ed. · 22 years in education</p>
        </div>
        <div className="lg:col-span-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Principal&apos;s message</p>
          <h2 className="mb-5 text-3xl font-bold text-slate-900 sm:text-4xl">Every child can shine</h2>
          <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <Quote className="absolute -top-4 left-6 h-9 w-9 rounded-xl bg-blue-600 p-2 text-white" />
            <div className="space-y-4 text-base leading-relaxed text-slate-700">
              <p>
                At {SCHOOL_INFO.name} we believe school should be a place where curiosity is rewarded, effort is noticed and every child feels they belong. Our teachers know each student by name, and our classrooms encourage questions as much as answers.
              </p>
              <p>
                We work closely with parents — through regular updates, open communication and shared goals — because a child grows best when home and school pull in the same direction.
              </p>
            </div>
            <div className="mt-6 flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
              <div>
                <p className="font-bold text-slate-900">{SCHOOL_INFO.principal}</p>
                <p className="text-sm text-slate-500">Principal, {SCHOOL_INFO.name}</p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/signature.png" alt="" className="h-12 w-auto opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* "Go figure" numbers from the live school records (like Exeter). */
export function StatsBand() {
  const { data, ready } = useSchoolData()
  const stats = useMemo(() => {
    const latest = [...data.exams].filter((e) => e.published && data.marks[e.id]).sort((a, b) => b.date.localeCompare(a.date))[0]
    const ranked = latest ? CLASSES.flatMap((c) => classRanking(data.marks, latest, c)) : []
    const pass = ranked.length ? Math.round((ranked.filter((r) => r.result.passed).length / ranked.length) * 100) : 0
    const attendance = Math.round(ROSTER.reduce((a, s) => a + summarizeAttendance(data.attendance, s.id).percent, 0) / ROSTER.length)
    const teachers = new Set([...data.timetables['class-10A'], ...data.timetables.school].map((e) => e.teacher).filter((t) => t !== '—' && t !== 'All Faculty'))
    return [
      { value: ROSTER.length, label: 'Students', icon: Users },
      { value: teachers.size, label: 'Teachers', icon: BookOpen },
      { value: `${Math.round(ROSTER.length / Math.max(1, teachers.size))}:1`, label: 'Student–teacher ratio', icon: UserCheck },
      { value: `${pass}%`, label: latest ? `Pass rate · ${latest.name}` : 'Pass rate', icon: Award },
      { value: `${attendance}%`, label: 'Average attendance', icon: CalendarCheck2 },
      { value: SUBJECTS.length, label: 'Subjects taught', icon: GraduationCap },
    ]
  }, [data])

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-4 py-12 text-white sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">By the numbers</p>
          <h2 className="text-3xl font-bold sm:text-4xl">Our school at a glance</h2>
          <p className="text-sm text-slate-400">Live from the school records</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur sm:p-5">
                <Icon size={22} className="mx-auto mb-2 text-cyan-300" />
                {ready ? <p className="text-3xl font-bold sm:text-4xl">{s.value}</p> : <Placeholder className="mx-auto h-9 w-16 bg-white/10" />}
                <p className="mt-1 text-xs font-semibold text-slate-300 sm:text-sm">{s.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* Toppers of the latest exam (like DAIS's Spotlight) next to the upcoming calendar. */
export function SpotlightAndEvents() {
  const { data, ready } = useSchoolData()
  const today = todayISO()

  const spotlight = useMemo(() => {
    const latest = [...data.exams].filter((e) => e.published && data.marks[e.id]).sort((a, b) => b.date.localeCompare(a.date))[0]
    if (!latest) return null
    const all = CLASSES.flatMap((c) => classRanking(data.marks, latest, c)).sort((a, b) => b.result.percent - a.result.percent)
    const perfect = ROSTER.map((s) => ({ s, p: summarizeAttendance(data.attendance, s.id).percent }))
      .sort((a, b) => b.p - a.p)
      .slice(0, 1)
    return { exam: latest, toppers: all.slice(0, 3), classToppers: CLASSES.map((c) => ({ c, top: classRanking(data.marks, latest, c)[0] })), attendance: perfect[0] }
  }, [data])

  const events = useMemo(() => {
    const list = [
      ...SCHOOL_EVENTS.map((e) => ({ date: e.date, title: e.title, detail: e.detail, tag: e.kind === 'sports' ? 'Sports' : e.kind === 'meeting' ? 'Meeting' : e.kind === 'cultural' ? 'Cultural' : 'Event', color: 'bg-blue-600' })),
      ...Object.entries(HOLIDAYS).map(([date, name]) => ({ date, title: name, detail: 'School closed', tag: 'Holiday', color: 'bg-violet-600' })),
      ...data.exams.map((e) => ({ date: e.date, title: e.name, detail: `Out of ${e.maxMarks} per subject`, tag: 'Exam', color: 'bg-rose-600' })),
    ]
    return list.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6)
  }, [data.exams, today])

  const medal = ['bg-amber-400 text-amber-950', 'bg-slate-300 text-slate-800', 'bg-orange-300 text-orange-950']

  return (
    <section className="bg-white px-4 py-12 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
        <div>
          <SectionHeading center={false} eyebrow="Spotlight" title="Our achievers" description={spotlight ? `Top performers in the ${spotlight.exam.name}` : undefined} />
          {!ready ? (
            <div className="space-y-3">
              <Placeholder className="h-20" />
              <Placeholder className="h-20" />
              <Placeholder className="h-20" />
            </div>
          ) : !spotlight ? (
            <p className="text-slate-500">Results will appear here once published.</p>
          ) : (
            <div className="space-y-3">
              {spotlight.toppers.map((t, i) => (
                <div key={t.student.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-4 shadow-sm">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${medal[i]}`}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-bold text-slate-900">{t.student.name}</p>
                    <p className="text-sm text-slate-500">Class {t.student.classId} · Grade {t.result.grade}</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{t.result.percent}%</p>
                </div>
              ))}
              <div className="grid gap-3 sm:grid-cols-3">
                {spotlight.classToppers.map(({ c, top }) =>
                  top ? (
                    <div key={c} className="rounded-2xl bg-blue-50 p-4">
                      <Trophy size={18} className="mb-1 text-blue-600" />
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Class {c} topper</p>
                      <p className="font-bold text-slate-900">{top.student.name}</p>
                    </div>
                  ) : null
                )}
                {spotlight.attendance && (
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <Medal size={18} className="mb-1 text-emerald-600" />
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Best attendance</p>
                    <p className="font-bold text-slate-900">
                      {spotlight.attendance.s.name} · {spotlight.attendance.p}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <SectionHeading center={false} eyebrow="Calendar" title="Coming up" description="Events, exams and holidays this term" />
          {!ready ? (
            <div className="space-y-3">
              <Placeholder className="h-16" />
              <Placeholder className="h-16" />
              <Placeholder className="h-16" />
            </div>
          ) : (
            <ul className="space-y-3">
              {events.map((e) => {
                const d = parseISODate(e.date)
                return (
                  <li key={`${e.date}-${e.title}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white ${e.color}`}>
                      <span className="text-lg font-bold leading-none">{d.getDate()}</span>
                      <span className="text-[11px] font-semibold uppercase">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-900">{e.title}</p>
                      <p className="truncate text-sm text-slate-500">
                        {d.toLocaleDateString('en-IN', { weekday: 'long' })} · {e.detail}
                      </p>
                    </div>
                    <span className="hidden shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 sm:inline">{e.tag}</span>
                  </li>
                )
              })}
            </ul>
          )}
          <Link href="/events" className="mt-4 inline-flex items-center gap-2 font-bold text-blue-700 hover:gap-3">
            All events <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* Admissions call to action (like Exeter and DAIS). */
export function AdmissionsBanner() {
  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-white shadow-2xl sm:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-300" /> Admissions open
            </span>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">Join {SCHOOL_INFO.name} for 2027–28</h2>
            <p className="mt-3 max-w-xl text-blue-100">
              Applications are open for all classes. Apply online in a few minutes, book a campus visit, or call the admissions office with any questions.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-blue-50">
              <li className="flex items-center gap-2"><ShieldCheck size={16} /> {SCHOOL_INFO.board.split(' (')[0]} curriculum</li>
              <li className="flex items-center gap-2"><Users size={16} /> Small class sizes</li>
              <li className="flex items-center gap-2"><MessageCircle size={16} /> Regular parent updates</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/admissions" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-indigo-700 shadow-lg transition hover:scale-[1.02]">
              Apply now <ArrowRight size={18} />
            </Link>
            <a href={`tel:${SCHOOL_INFO.phone.replace(/\s/g, '')}`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/40 px-6 py-4 font-bold text-white transition hover:bg-white/10">
              <Phone size={18} /> Call admissions
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Site footer with contact details and the CBSE Mandatory Public Disclosure link. */
export function SiteFooter() {
  const year = new Date().getFullYear()
  const columns = [
    {
      title: 'School',
      links: [
        { href: '/about', label: 'About us' },
        { href: '/academics', label: 'Academics' },
        { href: '/admissions', label: 'Admissions' },
        { href: '/events', label: 'Events' },
        { href: '/notices', label: 'Notices' },
      ],
    },
    {
      title: 'Portals',
      links: [
        { href: '/student-portal', label: 'Student portal' },
        { href: '/parent-portal', label: 'Parent portal' },
        { href: '/teacher-portal', label: 'Teacher portal' },
        { href: '/principal-portal', label: 'Principal dashboard' },
        { href: '/accountant-portal', label: 'Accounts office' },
      ],
    },
  ]

  return (
    <footer className="bg-slate-950 px-4 pb-8 pt-12 text-slate-300 sm:pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-blue-400 to-cyan-300 p-2">
                <BookOpen size={22} className="text-slate-900" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{SCHOOL_INFO.name}</p>
                <p className="text-xs text-slate-400">Shaping future leaders</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">Affiliated to {SCHOOL_INFO.board}. Classes 10A and 10B in this prototype.</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 font-bold text-white">{col.title}</p>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="mb-4 font-bold text-white">Contact</p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-cyan-400" />
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SCHOOL_INFO.address)}`} target="_blank" rel="noreferrer" className="hover:text-white">
                  {SCHOOL_INFO.address}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone size={18} className="shrink-0 text-cyan-400" />
                <a href={`tel:${SCHOOL_INFO.phone.replace(/\s/g, '')}`} className="hover:text-white">{SCHOOL_INFO.phone}</a>
              </li>
              <li className="flex gap-3">
                <Mail size={18} className="shrink-0 text-cyan-400" />
                <a href={`mailto:${SCHOOL_INFO.email}`} className="hover:text-white">{SCHOOL_INFO.email}</a>
              </li>
              <li className="flex gap-3">
                <CalendarDays size={18} className="shrink-0 text-cyan-400" />
                <span>{SCHOOL_INFO.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-500">© {year} {SCHOOL_INFO.name}. School prototype – sample data.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/mandatory-disclosure" className="inline-flex items-center gap-1.5 font-semibold text-amber-300 hover:text-amber-200">
              <FileText size={15} /> CBSE Mandatory Disclosure
            </Link>
            <Link href="/notices" className="hover:text-white">Notices</Link>
            <Link href="/login" className="hover:text-white">Portal login</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
