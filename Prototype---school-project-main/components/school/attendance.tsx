'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarCheck2,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Flame,
  Phone,
  Send,
  UserCheck,
  UserX,
} from 'lucide-react'
import { useSchoolData } from '@/context/school-data-context'
import {
  AttendanceStatus,
  CLASSES,
  ClassId,
  HOLIDAYS,
  LOW_ATTENDANCE_PERCENT,
  TERM_START,
  addDays,
  downloadCSV,
  findStudent,
  formatDate,
  isSchoolDay,
  isWeekend,
  parseISODate,
  schoolDaysBetween,
  studentsIn,
  summarizeAttendance,
  todayISO,
} from '@/lib/school-data'
import { cn } from '@/lib/utils'
import { Badge, EmptyState, Panel, PanelHeader, ProgressBar, Segmented, StatTile, Toast, inputClass, secondaryButton } from './ui'

export const STATUS_META: Record<AttendanceStatus, { label: string; short: string; active: string; dot: string; cell: string }> = {
  present: { label: 'Present', short: 'P', active: 'bg-emerald-600 text-white border-emerald-600', dot: 'bg-emerald-500', cell: 'bg-emerald-100 text-emerald-800' },
  absent: { label: 'Absent', short: 'A', active: 'bg-rose-600 text-white border-rose-600', dot: 'bg-rose-500', cell: 'bg-rose-100 text-rose-800' },
  late: { label: 'Late', short: 'L', active: 'bg-amber-500 text-white border-amber-500', dot: 'bg-amber-500', cell: 'bg-amber-100 text-amber-800' },
  leave: { label: 'Leave', short: 'Lv', active: 'bg-sky-600 text-white border-sky-600', dot: 'bg-sky-500', cell: 'bg-sky-100 text-sky-800' },
}

const STATUSES: AttendanceStatus[] = ['present', 'absent', 'late', 'leave']

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
      {STATUSES.map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_META[s].dot)} />
          {STATUS_META[s].label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
        Holiday
      </span>
    </div>
  )
}

function percentTone(p: number) {
  if (p >= 90) return 'text-emerald-600'
  if (p >= LOW_ATTENDANCE_PERCENT) return 'text-amber-600'
  return 'text-rose-600'
}

function monthKey(iso: string) {
  return iso.slice(0, 7)
}

function shiftMonth(key: string, delta: number) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  return parseISODate(`${key}-01`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

function daysInMonth(key: string) {
  const [y, m] = key.split('-').map(Number)
  const count = new Date(y, m, 0).getDate()
  return Array.from({ length: count }, (_, i) => `${key}-${String(i + 1).padStart(2, '0')}`)
}

/* ------------------------------------------------------------------------- */
/*                               Teacher register                            */
/* ------------------------------------------------------------------------- */

export function AttendanceManager({ defaultClass = '10A' }: { defaultClass?: ClassId }) {
  const { data, setAttendance, setAttendanceBulk } = useSchoolData()
  const today = todayISO()
  const [classId, setClassId] = useState<ClassId>(defaultClass)
  const [date, setDate] = useState(today)
  const [view, setView] = useState<'daily' | 'monthly'>('daily')
  const [month, setMonth] = useState(monthKey(today))
  const [toast, setToast] = useState<string | null>(null)

  const students = studentsIn(classId)
  const day = data.attendance[date] || {}
  const schoolDay = isSchoolDay(date)
  const marked = students.filter((s) => day[s.id])
  const counts = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: students.filter((st) => day[st.id] === s).length }),
    {} as Record<AttendanceStatus, number>
  )
  const absentees = students.filter((s) => day[s.id] === 'absent')
  const todayRate = marked.length ? Math.round(((counts.present + counts.late) / Math.max(1, marked.length - counts.leave)) * 100) : 0

  const termSummary = useMemo(
    () => Object.fromEntries(students.map((s) => [s.id, summarizeAttendance(data.attendance, s.id)])),
    [data.attendance, students]
  )

  const stepDay = (delta: number) => {
    let d = addDays(date, delta)
    // Jump over weekends/holidays so the arrows always land on a school day.
    for (let i = 0; i < 7 && !isSchoolDay(d); i++) d = addDays(d, delta)
    if (d > today || d < TERM_START) return
    setDate(d)
  }

  const markAllPresent = () => {
    const entries: Record<string, AttendanceStatus> = {}
    students.forEach((s) => {
      if (!day[s.id]) entries[s.id] = 'present'
    })
    if (Object.keys(entries).length === 0) {
      students.forEach((s) => (entries[s.id] = 'present'))
    }
    setAttendanceBulk(date, entries)
    setToast(`Marked ${Object.keys(entries).length} students present`)
  }

  const monthDays = daysInMonth(month).filter((d) => d >= TERM_START && d <= today && !isWeekend(d))

  const exportMonth = () => {
    const header = ['Roll', 'Student', ...monthDays.map((d) => d.slice(8)), 'Present', 'Absent', 'Late', 'Leave', '%']
    const rows = students.map((s) => {
      const sum = summarizeAttendance(data.attendance, s.id, `${month}-01`, `${month}-31`)
      return [
        s.rollNo,
        s.name,
        ...monthDays.map((d) => (HOLIDAYS[d] ? 'H' : data.attendance[d]?.[s.id] ? STATUS_META[data.attendance[d][s.id]].short : '')),
        sum.present,
        sum.absent,
        sum.late,
        sum.leave,
        sum.percent,
      ]
    })
    downloadCSV(`attendance-${classId}-${month}.csv`, [header, ...rows])
  }

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader
          eyebrow="Attendance"
          title={view === 'daily' ? 'Daily register' : 'Monthly register'}
          description={view === 'daily' ? 'Tap a status for each student. Changes save instantly and parents see them right away.' : 'Full month at a glance. Export it for records or the school office.'}
          actions={
            <>
              <Segmented value={classId} onChange={setClassId} options={CLASSES.map((c) => ({ value: c, label: `Class ${c}` }))} />
              <Segmented
                value={view}
                onChange={setView}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
              />
            </>
          }
        />

        {view === 'daily' ? (
          <>
            <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => stepDay(-1)} className={secondaryButton} aria-label="Previous school day">
                  <ChevronLeft size={16} />
                </button>
                <input
                  type="date"
                  value={date}
                  min={TERM_START}
                  max={today}
                  onChange={(e) => e.target.value && setDate(e.target.value)}
                  className={cn(inputClass, 'w-auto py-2.5')}
                />
                <button type="button" onClick={() => stepDay(1)} disabled={date >= today} className={secondaryButton} aria-label="Next school day">
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-600">
                  {formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
                {date !== today && (
                  <button type="button" onClick={() => setDate(today)} className="text-sm font-bold text-blue-700 hover:underline">
                    Today
                  </button>
                )}
              </div>
            </div>

            {!schoolDay ? (
              <EmptyState
                icon={<CalendarDays size={36} />}
                title={HOLIDAYS[date] ? `Holiday – ${HOLIDAYS[date]}` : 'Weekend'}
                description="No register is taken on this day. Pick another date."
              />
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-600">
                    <span className="font-bold text-slate-900">{marked.length}</span> of {students.length} marked
                  </p>
                  <button type="button" onClick={markAllPresent} className={secondaryButton}>
                    <CheckCheck size={16} className="text-emerald-600" />
                    {marked.length === 0 ? 'Mark all present' : 'Mark remaining present'}
                  </button>
                </div>

                <ul className="space-y-2.5">
                  {students.map((s) => {
                    const status = day[s.id]
                    const term = termSummary[s.id]
                    return (
                      <li
                        key={s.id}
                        className={cn(
                          'flex flex-col gap-3 rounded-2xl border p-3 transition sm:flex-row sm:items-center sm:justify-between sm:p-4',
                          status ? 'border-slate-200 bg-white' : 'border-dashed border-slate-300 bg-slate-50'
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                            {s.rollNo}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">{s.name}</p>
                            <p className="text-xs text-slate-500">
                              Term attendance{' '}
                              <span className={cn('font-bold', percentTone(term.percent))}>{term.percent}%</span>
                              {term.percent < LOW_ATTENDANCE_PERCENT && (
                                <span className="ml-2 inline-flex items-center gap-1 font-bold text-rose-600">
                                  <AlertTriangle size={12} /> Low
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:flex">
                          {STATUSES.map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setAttendance(date, s.id, st)}
                              aria-pressed={status === st}
                              className={cn(
                                'rounded-xl border px-3 py-2 text-xs font-bold transition sm:min-w-[72px]',
                                status === st ? STATUS_META[st].active : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                              )}
                            >
                              {STATUS_META[st].label}
                            </button>
                          ))}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} disabled={month <= monthKey(TERM_START)} className={secondaryButton} aria-label="Previous month">
                  <ChevronLeft size={16} />
                </button>
                <span className="min-w-[150px] text-center font-bold text-slate-900">{monthLabel(month)}</span>
                <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} disabled={month >= monthKey(today)} className={secondaryButton} aria-label="Next month">
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Legend />
                <button type="button" onClick={exportMonth} className={secondaryButton}>
                  <Download size={16} /> Export CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left font-bold text-slate-600">Student</th>
                    {monthDays.map((d) => (
                      <th key={d} className={cn('px-1 py-2 text-center font-semibold', HOLIDAYS[d] ? 'text-violet-500' : 'text-slate-500')} title={HOLIDAYS[d]}>
                        <div>{parseISODate(d).toLocaleDateString('en-IN', { weekday: 'narrow' })}</div>
                        <div className="text-slate-800">{Number(d.slice(8))}</div>
                      </th>
                    ))}
                    <th className="px-3 py-2 text-right font-bold text-slate-600">%</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const sum = summarizeAttendance(data.attendance, s.id, `${month}-01`, `${month}-31`)
                    return (
                      <tr key={s.id} className="border-t border-slate-100">
                        <td className="sticky left-0 z-10 whitespace-nowrap bg-white px-3 py-2 font-semibold text-slate-800">
                          {s.rollNo}. {s.name}
                        </td>
                        {monthDays.map((d) => {
                          const st = data.attendance[d]?.[s.id]
                          return (
                            <td key={d} className="px-0.5 py-1 text-center">
                              {HOLIDAYS[d] ? (
                                <span className="inline-block h-6 w-6 rounded-md bg-violet-100 leading-6 text-violet-600">H</span>
                              ) : st ? (
                                <span className={cn('inline-block h-6 w-6 rounded-md font-bold leading-6', STATUS_META[st].cell)}>{STATUS_META[st].short}</span>
                              ) : (
                                <span className="inline-block h-6 w-6 rounded-md bg-slate-50 leading-6 text-slate-300">·</span>
                              )}
                            </td>
                          )
                        })}
                        <td className={cn('px-3 py-2 text-right font-bold', percentTone(sum.percent))}>{sum.marked ? `${sum.percent}%` : '–'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>

      {view === 'daily' && schoolDay && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <PanelHeader eyebrow="Summary" title={`Class ${classId} · ${formatDate(date, { day: 'numeric', month: 'short' })}`} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Present" value={counts.present} tone="emerald" />
              <StatTile label="Absent" value={counts.absent} tone="rose" />
              <StatTile label="Late" value={counts.late} tone="amber" />
              <StatTile label="On leave" value={counts.leave} tone="blue" />
            </div>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm font-semibold text-slate-700">
                <span>Attendance rate</span>
                <span>{marked.length ? `${todayRate}%` : 'Not marked yet'}</span>
              </div>
              <ProgressBar value={todayRate} barClassName="from-emerald-500 to-teal-600" />
            </div>
          </Panel>

          <Panel>
            <PanelHeader eyebrow="Follow up" title="Absent today" />
            {absentees.length === 0 ? (
              <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">No absentees{marked.length < students.length ? ' so far' : ''}. 🎉</p>
            ) : (
              <ul className="space-y-3">
                {absentees.map((s) => (
                  <li key={s.id} className="rounded-2xl border border-rose-100 bg-rose-50 p-3">
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-600">
                      <Phone size={12} /> {s.parentName} · {s.parentPhone}
                    </p>
                    <button
                      type="button"
                      onClick={() => setToast(`Absence alert sent to ${s.parentName}`)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:underline"
                    >
                      <Send size={12} /> Notify parent
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/*                         Student / parent calendar                         */
/* ------------------------------------------------------------------------- */

export function AttendanceCalendar({ studentId, viewer = 'student' }: { studentId: string; viewer?: 'student' | 'parent' }) {
  const { data } = useSchoolData()
  const today = todayISO()
  const [month, setMonth] = useState(monthKey(today))
  const student = findStudent(studentId)

  const term = summarizeAttendance(data.attendance, studentId)
  const monthSum = summarizeAttendance(data.attendance, studentId, `${month}-01`, `${month}-31`)

  // Current run of consecutive days attended (present or late).
  const streak = useMemo(() => {
    const days = schoolDaysBetween(TERM_START, today).reverse()
    let count = 0
    for (const d of days) {
      const st = data.attendance[d]?.[studentId]
      if (!st) continue
      if (st === 'present' || st === 'late') count++
      else break
    }
    return count
  }, [data.attendance, studentId, today])

  const recentAbsences = Object.entries(data.attendance)
    .filter(([, day]) => day[studentId] === 'absent' || day[studentId] === 'leave')
    .map(([d, day]) => ({ date: d, status: day[studentId] }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  const days = daysInMonth(month)
  const leadingBlanks = (parseISODate(days[0]).getDay() + 6) % 7 // Monday-first grid

  // Days needed in a row to climb back to the minimum.
  const counted = term.marked - term.leave
  const attended = term.present + term.late
  const needed = term.percent >= LOW_ATTENDANCE_PERCENT ? 0 : Math.ceil((LOW_ATTENDANCE_PERCENT * counted - 100 * attended) / (100 - LOW_ATTENDANCE_PERCENT))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Term attendance" value={`${term.percent}%`} hint={`${attended} of ${counted} days`} tone="slate" icon={<CalendarCheck2 size={18} className="text-cyan-300" />} />
        <StatTile label={monthLabel(month).split(' ')[0]} value={monthSum.marked ? `${monthSum.percent}%` : '–'} hint={`${monthSum.marked} days recorded`} tone="blue" />
        <StatTile label="Absent days" value={term.absent} hint={`${term.late} late · ${term.leave} leave`} tone="light" icon={<UserX size={18} className="text-rose-500" />} />
        <StatTile label="Current streak" value={`${streak} days`} hint="in a row at school" tone="light" icon={<Flame size={18} className="text-orange-500" />} />
      </div>

      {term.percent < LOW_ATTENDANCE_PERCENT && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
          <p>
            <span className="font-bold">Attendance is below the required {LOW_ATTENDANCE_PERCENT}%.</span>{' '}
            {viewer === 'parent' ? `${student?.name.split(' ')[0]} needs` : 'You need'} about {needed} more consecutive school days to get back on track.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} disabled={month <= monthKey(TERM_START)} className={secondaryButton} aria-label="Previous month">
                <ChevronLeft size={16} />
              </button>
              <h3 className="min-w-[160px] text-center text-lg font-bold text-slate-900">{monthLabel(month)}</h3>
              <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} disabled={month >= monthKey(today)} className={secondaryButton} aria-label="Next month">
                <ChevronRight size={16} />
              </button>
            </div>
            <Legend />
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold uppercase text-slate-400 sm:gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
            {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`b${i}`} />)}
            {days.map((d) => {
              const st = data.attendance[d]?.[studentId]
              const holiday = HOLIDAYS[d]
              const weekend = isWeekend(d)
              const future = d > today
              return (
                <div
                  key={d}
                  title={holiday || (st ? STATUS_META[st].label : undefined)}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-bold normal-case transition',
                    holiday ? 'bg-violet-100 text-violet-700' : st ? STATUS_META[st].cell : weekend ? 'text-slate-300' : future ? 'bg-slate-50 text-slate-300' : 'bg-slate-50 text-slate-400',
                    d === today && 'ring-2 ring-slate-900 ring-offset-2'
                  )}
                >
                  {Number(d.slice(8))}
                  {st && <span className="hidden text-[10px] font-semibold opacity-80 sm:block">{STATUS_META[st].label}</span>}
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Breakdown" title="This term" />
          <div className="space-y-4">
            {STATUSES.map((s) => (
              <div key={s}>
                <div className="mb-1.5 flex justify-between text-sm font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_META[s].dot)} /> {STATUS_META[s].label}
                  </span>
                  <span>{term[s]} days</span>
                </div>
                <ProgressBar value={term.marked ? (term[s] / term.marked) * 100 : 0} barClassName={cn('bg-none', STATUS_META[s].dot)} />
              </div>
            ))}
          </div>

          <h4 className="mb-3 mt-8 text-xs font-bold uppercase tracking-wide text-slate-500">Recent absences</h4>
          {recentAbsences.length === 0 ? (
            <p className="text-sm text-slate-500">No absences this term.</p>
          ) : (
            <ul className="space-y-2">
              {recentAbsences.map((a) => (
                <li key={a.date} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-semibold text-slate-700">{formatDate(a.date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <Badge className={STATUS_META[a.status].cell}>{STATUS_META[a.status].label}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/*                             Principal overview                            */
/* ------------------------------------------------------------------------- */

export function AttendanceOverview() {
  const { data } = useSchoolData()
  const today = todayISO()
  const markedDates = Object.keys(data.attendance).filter((d) => d <= today).sort()
  const [date, setDate] = useState(markedDates[markedDates.length - 1] || today)

  const classStats = CLASSES.map((c) => {
    const students = studentsIn(c)
    const day = data.attendance[date] || {}
    const marked = students.filter((s) => day[s.id]).length
    const present = students.filter((s) => day[s.id] === 'present' || day[s.id] === 'late').length
    const absent = students.filter((s) => day[s.id] === 'absent').length
    const terms = students.map((s) => ({ student: s, sum: summarizeAttendance(data.attendance, s.id) }))
    const termAvg = Math.round((terms.reduce((a, t) => a + t.sum.percent, 0) / terms.length) * 10) / 10
    const low = terms.filter((t) => t.sum.percent < LOW_ATTENDANCE_PERCENT)
    return { classId: c, total: students.length, marked, present, absent, termAvg, low }
  })

  const totals = classStats.reduce((a, c) => ({ total: a.total + c.total, present: a.present + c.present, absent: a.absent + c.absent, marked: a.marked + c.marked }), { total: 0, present: 0, absent: 0, marked: 0 })
  const lowAll = classStats.flatMap((c) => c.low)

  const trend = markedDates.slice(-12).map((d) => {
    const day = data.attendance[d]
    const vals = Object.values(day)
    const attended = vals.filter((v) => v === 'present' || v === 'late').length
    const counted = vals.filter((v) => v !== 'leave').length
    return { date: d, percent: counted ? Math.round((attended / counted) * 100) : 0 }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-2xl font-bold text-slate-900">School attendance</h3>
        <input type="date" value={date} min={TERM_START} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} className={cn(inputClass, 'w-auto')} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Students" value={totals.total} tone="slate" />
        <StatTile label="In school" value={totals.present} hint={totals.marked < totals.total ? `${totals.total - totals.marked} not marked yet` : 'All registers complete'} tone="emerald" icon={<UserCheck size={18} />} />
        <StatTile label="Absent" value={totals.absent} tone="rose" icon={<UserX size={18} />} />
        <StatTile label={`Below ${LOW_ATTENDANCE_PERCENT}%`} value={lowAll.length} hint="students this term" tone="amber" icon={<AlertTriangle size={18} />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {classStats.map((c) => (
          <Panel key={c.classId}>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-xl font-bold text-slate-900">Class {c.classId}</h4>
              {c.marked === 0 ? <Badge className="bg-slate-100 text-slate-600">Register pending</Badge> : <Badge className="bg-emerald-100 text-emerald-700">{c.present}/{c.total} present</Badge>}
            </div>
            <div className="mb-1.5 flex justify-between text-sm font-semibold text-slate-700">
              <span>{formatDate(date, { day: 'numeric', month: 'short' })}</span>
              <span>{c.marked ? Math.round((c.present / c.marked) * 100) : 0}%</span>
            </div>
            <ProgressBar value={c.marked ? (c.present / c.marked) * 100 : 0} barClassName="from-emerald-500 to-teal-600" />
            <div className="mb-1.5 mt-4 flex justify-between text-sm font-semibold text-slate-700">
              <span>Term average</span>
              <span className={percentTone(c.termAvg)}>{c.termAvg}%</span>
            </div>
            <ProgressBar value={c.termAvg} />
            {c.low.length > 0 && (
              <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm">
                <p className="mb-1 font-bold text-rose-700">Needs attention</p>
                {c.low.map((l) => (
                  <p key={l.student.id} className="text-rose-800">
                    {l.student.name} – {l.sum.percent}%
                  </p>
                ))}
              </div>
            )}
          </Panel>
        ))}
      </div>

      <Panel>
        <PanelHeader eyebrow="Trend" title="Last 12 school days" />
        <div className="flex h-44 items-end gap-1.5 sm:gap-3">
          {trend.map((t) => (
            <button
              key={t.date}
              type="button"
              onClick={() => setDate(t.date)}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
              title={`${formatDate(t.date)} – ${t.percent}%`}
            >
              <span className="text-[10px] font-bold text-slate-500 opacity-0 transition group-hover:opacity-100 sm:text-xs">{t.percent}%</span>
              <span
                className={cn('w-full rounded-t-lg transition', t.date === date ? 'bg-blue-700' : 'bg-slate-300 group-hover:bg-slate-400')}
                style={{ height: `${Math.max(4, (t.percent - 50) * 2)}%` }}
              />
              <span className="text-[10px] font-semibold text-slate-500">{Number(t.date.slice(8))}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Bars show 50–100%. Click a day to inspect it.</p>
      </Panel>
    </div>
  )
}
