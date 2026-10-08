'use client'

import { useMemo, useRef, useState } from 'react'
import {
  Award,
  BarChart3,
  CheckCircle2,
  Download,
  EyeOff,
  FileSpreadsheet,
  GraduationCap,
  Medal,
  Plus,
  Printer,
  Send,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  XCircle,
} from 'lucide-react'
import { useSchoolData } from '@/context/school-data-context'
import {
  CLASSES,
  ClassId,
  Exam,
  GRADE_STYLES,
  PASS_PERCENT,
  SUBJECTS,
  classRanking,
  downloadCSV,
  examResult,
  findStudent,
  formatDate,
  gradeFor,
  remarkFor,
  studentsIn,
  summarizeAttendance,
} from '@/lib/school-data'
import { cn } from '@/lib/utils'
import { Badge, EmptyState, Field, Modal, Panel, PanelHeader, ProgressBar, Segmented, StatTile, Toast, inputClass, primaryButton, secondaryButton } from './ui'

function GradeBadge({ grade, className }: { grade: string | null; className?: string }) {
  if (!grade) return <span className="text-slate-300">–</span>
  return <Badge className={cn('border', GRADE_STYLES[grade], className)}>{grade}</Badge>
}

const GRADE_ORDER = ['A+', 'A', 'B+', 'B', 'C', 'D', 'F']

function printReportCard() {
  const cleanup = () => {
    document.body.classList.remove('printing-report')
    window.removeEventListener('afterprint', cleanup)
  }
  document.body.classList.add('printing-report')
  window.addEventListener('afterprint', cleanup)
  window.print()
}

/* ------------------------------------------------------------------------- */
/*                              Teacher marks entry                          */
/* ------------------------------------------------------------------------- */

export function ResultsManager({ defaultSubject = 'Mathematics', defaultClass = '10A' }: { defaultSubject?: string; defaultClass?: ClassId }) {
  const { data, setMark, setExamPublished, addExam } = useSchoolData()
  const [examId, setExamId] = useState(() => data.exams.find((e) => !e.published && data.marks[e.id])?.id || data.exams[0].id)
  const [subject, setSubject] = useState(defaultSubject)
  const [classId, setClassId] = useState<ClassId>(defaultClass)
  const [showNewExam, setShowNewExam] = useState(false)
  const [newExam, setNewExam] = useState({ name: '', maxMarks: '50', date: '' })
  const [toast, setToast] = useState<string | null>(null)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const exam = data.exams.find((e) => e.id === examId) || data.exams[0]
  const students = studentsIn(classId)
  const book = data.marks[exam.id]?.[subject] || {}

  const entered = students.filter((s) => book[s.id] !== undefined)
  const values = entered.map((s) => (book[s.id] / exam.maxMarks) * 100)
  const avg = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0
  const passCount = values.filter((v) => v >= PASS_PERCENT).length
  const best = entered.reduce<{ name: string; m: number } | null>((b, s) => (!b || book[s.id] > b.m ? { name: s.name, m: book[s.id] } : b), null)
  const distribution = GRADE_ORDER.map((g) => ({ grade: g, count: values.filter((v) => gradeFor(v) === g).length }))

  const completeness = SUBJECTS.map((sub) => ({
    subject: sub,
    count: students.filter((s) => data.marks[exam.id]?.[sub]?.[s.id] !== undefined).length,
  }))
  const totalEntered = completeness.reduce((a, c) => a + c.count, 0)
  const totalNeeded = SUBJECTS.length * students.length

  const onChange = (studentId: string, raw: string) => {
    if (raw === '') return setMark(exam.id, subject, studentId, null)
    const n = Number(raw)
    if (Number.isNaN(n)) return
    setMark(exam.id, subject, studentId, Math.max(0, Math.min(exam.maxMarks, Math.round(n * 2) / 2)))
  }

  const togglePublish = () => {
    if (!exam.published && totalEntered < totalNeeded) {
      const ok = window.confirm(`${totalNeeded - totalEntered} marks are still missing for Class ${classId}. Publish anyway? Students will see only the subjects that are entered.`)
      if (!ok) return
    }
    setExamPublished(exam.id, !exam.published)
    setToast(exam.published ? `${exam.name} hidden from students and parents` : `${exam.name} published to students and parents`)
  }

  const exportExam = () => {
    const header = ['Roll', 'Student', ...SUBJECTS, 'Total', 'Max', '%', 'Grade', 'Rank']
    const ranking = classRanking(data.marks, exam, classId)
    const rows = students.map((s) => {
      const r = examResult(data.marks, exam, s.id)
      const rank = ranking.findIndex((x) => x.student.id === s.id) + 1
      return [s.rollNo, s.name, ...r.subjects.map((x) => x.marks ?? ''), r.total, r.maxTotal, r.percent, r.maxTotal ? r.grade : '', rank || '']
    })
    downloadCSV(`${exam.name.replace(/\s+/g, '-')}-${classId}.csv`, [header, ...rows])
  }

  const createExam = () => {
    const max = Number(newExam.maxMarks)
    if (!newExam.name.trim() || !newExam.date || !(max > 0)) return
    addExam({ name: newExam.name.trim(), maxMarks: max, date: newExam.date })
    setShowNewExam(false)
    setNewExam({ name: '', maxMarks: '50', date: '' })
    setToast('Exam created – select it to start entering marks')
  }

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader
          eyebrow="Results"
          title="Enter & publish marks"
          description="Marks save as you type. Publish an exam when it is ready and students and parents get their report cards instantly."
          actions={
            <>
              <button type="button" onClick={() => setShowNewExam(true)} className={secondaryButton}>
                <Plus size={16} /> New exam
              </button>
              <button type="button" onClick={exportExam} className={secondaryButton}>
                <FileSpreadsheet size={16} /> Export
              </button>
            </>
          }
        />

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {data.exams.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setExamId(e.id)}
              className={cn(
                'min-w-[170px] rounded-2xl border p-3 text-left transition',
                e.id === exam.id ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <p className="font-bold">{e.name}</p>
              <p className={cn('text-xs', e.id === exam.id ? 'text-slate-300' : 'text-slate-500')}>
                {formatDate(e.date)} · out of {e.maxMarks}
              </p>
              <span className={cn('mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', e.published ? 'bg-emerald-400/20 text-emerald-500' : 'bg-amber-400/20 text-amber-500')}>
                {e.published ? 'Published' : 'Draft'}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <Segmented value={classId} onChange={setClassId} options={CLASSES.map((c) => ({ value: c, label: c }))} />
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className={cn(inputClass, 'w-auto py-2.5 font-semibold')}>
              {SUBJECTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={togglePublish}
            className={cn(primaryButton, exam.published ? 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50' : 'bg-emerald-600 hover:bg-emerald-700')}
          >
            {exam.published ? <EyeOff size={16} /> : <Send size={16} />}
            {exam.published ? 'Unpublish' : 'Publish results'}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3 text-left">Roll</th>
                <th className="px-3 py-3 text-left">Student</th>
                <th className="px-3 py-3 text-left">Marks / {exam.maxMarks}</th>
                <th className="hidden px-3 py-3 text-left sm:table-cell">%</th>
                <th className="px-3 py-3 text-left">Grade</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const value = book[s.id]
                const pct = value !== undefined ? Math.round((value / exam.maxMarks) * 1000) / 10 : null
                return (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold text-slate-500">{s.rollNo}</td>
                    <td className="px-3 py-2 font-semibold text-slate-900">{s.name}</td>
                    <td className="px-3 py-2">
                      <input
                        ref={(el) => {
                          inputs.current[i] = el
                        }}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={exam.maxMarks}
                        step={0.5}
                        value={value ?? ''}
                        placeholder="—"
                        onChange={(e) => onChange(s.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'ArrowDown') {
                            e.preventDefault()
                            inputs.current[i + 1]?.focus()
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault()
                            inputs.current[i - 1]?.focus()
                          }
                        }}
                        aria-label={`${s.name} marks`}
                        className={cn(
                          'w-24 rounded-xl border px-3 py-2 font-bold outline-none transition focus:ring-4',
                          pct !== null && pct < PASS_PERCENT ? 'border-rose-300 bg-rose-50 text-rose-700 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                        )}
                      />
                    </td>
                    <td className="hidden px-3 py-2 text-slate-600 sm:table-cell">{pct !== null ? `${pct}%` : '–'}</td>
                    <td className="px-3 py-2">
                      <GradeBadge grade={pct !== null ? gradeFor(pct) : null} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">Tip: press Enter to jump to the next student. Marks below {PASS_PERCENT}% are highlighted.</p>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader eyebrow="Analysis" title={`${subject} · Class ${classId}`} />
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Class average" value={entered.length ? `${avg}%` : '–'} tone="slate" />
            <StatTile label="Pass rate" value={entered.length ? `${Math.round((passCount / entered.length) * 100)}%` : '–'} tone="emerald" />
            <StatTile label="Top score" value={best ? `${best.m}/${exam.maxMarks}` : '–'} hint={best?.name} tone="blue" />
            <StatTile label="Entered" value={`${entered.length}/${students.length}`} tone="light" />
          </div>
          <h4 className="mb-3 mt-6 text-xs font-bold uppercase tracking-wide text-slate-500">Grade distribution</h4>
          <div className="flex h-32 items-end gap-2">
            {distribution.map((d) => (
              <div key={d.grade} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-xs font-bold text-slate-600">{d.count || ''}</span>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-slate-700 to-blue-600" style={{ height: `${entered.length ? (d.count / entered.length) * 100 : 0}%`, minHeight: d.count ? 6 : 0 }} />
                <span className="text-xs font-bold text-slate-500">{d.grade}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Progress" title={`${exam.name} completion`} description={`${totalEntered} of ${totalNeeded} marks entered for Class ${classId}`} />
          <div className="space-y-3">
            {completeness.map((c) => (
              <button key={c.subject} type="button" onClick={() => setSubject(c.subject)} className="block w-full text-left">
                <div className="mb-1 flex justify-between text-sm font-semibold">
                  <span className={c.subject === subject ? 'text-blue-700' : 'text-slate-700'}>{c.subject}</span>
                  <span className={c.count === students.length ? 'text-emerald-600' : 'text-slate-500'}>
                    {c.count === students.length ? <CheckCircle2 size={16} className="inline" /> : `${c.count}/${students.length}`}
                  </span>
                </div>
                <ProgressBar value={(c.count / students.length) * 100} barClassName={c.count === students.length ? 'from-emerald-500 to-teal-500' : undefined} />
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <Modal open={showNewExam} onClose={() => setShowNewExam(false)} title="Create a new exam">
        <div className="space-y-4">
          <Field label="Exam name">
            <input value={newExam.name} onChange={(e) => setNewExam({ ...newExam, name: e.target.value })} placeholder="e.g. Pre-Board Examination" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Max marks per subject">
              <input type="number" min={1} value={newExam.maxMarks} onChange={(e) => setNewExam({ ...newExam, maxMarks: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Exam date">
              <input type="date" value={newExam.date} onChange={(e) => setNewExam({ ...newExam, date: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <button type="button" onClick={createExam} disabled={!newExam.name.trim() || !newExam.date} className={cn(primaryButton, 'w-full')}>
            <Plus size={16} /> Create exam
          </button>
        </div>
      </Modal>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/*                         Student / parent report card                      */
/* ------------------------------------------------------------------------- */

export function ReportCard({ studentId }: { studentId: string }) {
  const { data } = useSchoolData()
  const student = findStudent(studentId)
  const published = data.exams.filter((e) => e.published).sort((a, b) => a.date.localeCompare(b.date))
  const [examId, setExamId] = useState(published[published.length - 1]?.id)
  const exam = published.find((e) => e.id === examId) || published[published.length - 1]

  const trend = useMemo(
    () => published.map((e) => ({ exam: e, result: examResult(data.marks, e, studentId) })).filter((t) => t.result.maxTotal > 0),
    [published, data.marks, studentId]
  )

  if (!student) return null
  if (!exam) {
    return <EmptyState icon={<GraduationCap size={40} />} title="No results published yet" description="Report cards appear here as soon as teachers publish an exam." />
  }

  const result = examResult(data.marks, exam, studentId)
  const ranking = classRanking(data.marks, exam, student.classId)
  const rank = ranking.findIndex((r) => r.student.id === studentId) + 1
  const attendance = summarizeAttendance(data.attendance, studentId)
  const scored = result.subjects.filter((s) => s.percent !== null)
  const strongest = [...scored].sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0))[0]
  const weakest = [...scored].sort((a, b) => (a.percent ?? 0) - (b.percent ?? 0))[0]
  const examIndex = trend.findIndex((t) => t.exam.id === exam.id)
  const previous = examIndex > 0 ? trend[examIndex - 1] : null
  const change = previous ? Math.round((result.percent - previous.result.percent) * 10) / 10 : null

  // Class average per subject for comparison.
  const classAvg = (subject: string) => {
    const vals = studentsIn(student.classId)
      .map((s) => data.marks[exam.id]?.[subject]?.[s.id])
      .filter((v): v is number => v !== undefined)
    return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length / exam.maxMarks) * 1000) / 10 : null
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented value={exam.id} onChange={setExamId} options={published.map((e) => ({ value: e.id, label: e.name }))} />
        <button type="button" onClick={printReportCard} className={secondaryButton}>
          <Printer size={16} /> Print / Save PDF
        </button>
      </div>

      <div className="report-print-area mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-violet-200/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <div className="h-2 w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500" />
        <div className="relative flex flex-col items-center justify-between gap-4 overflow-hidden bg-gradient-to-r from-indigo-950 via-violet-900 to-slate-900 p-6 text-white sm:p-8 md:flex-row">
          <GraduationCap className="absolute right-6 top-4 h-24 w-24 text-white/5" />
          <div className="relative flex items-center gap-4">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5">
              <GraduationCap className="h-8 w-8 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">EDUPRO HIGH SCHOOL</h2>
              <p className="mt-0.5 text-xs uppercase tracking-widest text-fuchsia-200/90 sm:text-sm">Academic Performance Report Card</p>
            </div>
          </div>
          <div className="relative text-center md:text-right">
            <p className="text-sm font-bold text-cyan-300">{exam.name}</p>
            <p className="mt-0.5 text-xs text-slate-300">Held on {formatDate(exam.date)}</p>
            {rank > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                <Award size={14} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-300">
                  Rank #{rank} of {ranking.length}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-violet-100 bg-gradient-to-r from-slate-50 via-violet-50 to-cyan-50 p-6 text-sm md:grid-cols-4">
          {[
            ['Student name', student.name],
            ['Class', student.classId],
            ['Roll number', String(student.rollNo)],
            ['Student ID', student.id],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{k}</p>
              <p className="text-base font-extrabold text-slate-800">{v}</p>
            </div>
          ))}
        </div>

        <div className="p-4 sm:p-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-3 text-left">Subject</th>
                  <th className="py-3 text-center">Marks</th>
                  <th className="py-3 text-left">Score</th>
                  <th className="py-3 text-center">Class avg</th>
                  <th className="py-3 text-center">Grade</th>
                  <th className="hidden py-3 pl-4 text-left md:table-cell">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.subjects.map((s) => {
                  const avg = classAvg(s.subject)
                  return (
                    <tr key={s.subject}>
                      <td className="py-3 font-bold text-slate-900">{s.subject}</td>
                      <td className="py-3 text-center font-semibold text-slate-700">{s.marks !== null ? `${s.marks}/${exam.maxMarks}` : <span className="text-xs text-slate-400">Awaited</span>}</td>
                      <td className="py-3">
                        {s.percent !== null && (
                          <div className="flex items-center gap-2">
                            <ProgressBar value={s.percent} className="w-20" barClassName={s.percent < PASS_PERCENT ? 'from-rose-500 to-rose-600' : 'from-violet-500 to-cyan-500'} />
                            <span className="text-xs font-bold text-slate-700">{s.percent}%</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-center text-xs font-semibold text-slate-500">{avg !== null ? `${avg}%` : '–'}</td>
                      <td className="py-3 text-center">
                        <GradeBadge grade={s.grade} />
                      </td>
                      <td className="hidden py-3 pl-4 text-xs italic text-slate-600 md:table-cell">{s.percent !== null ? remarkFor(s.percent) : ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
          <StatTile label="Total" value={`${result.total}/${result.maxTotal}`} tone="violet" />
          <StatTile
            label="Percentage"
            value={`${result.percent}%`}
            hint={change !== null ? `${change >= 0 ? '▲' : '▼'} ${Math.abs(change)}% vs ${previous!.exam.name}` : undefined}
            tone="blue"
          />
          <StatTile label="Overall grade" value={result.grade} hint={remarkFor(result.percent)} tone="emerald" />
          <StatTile
            label="Result"
            value={
              <span className="inline-flex items-center gap-2">
                {result.passed ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                {!result.complete ? 'Partial' : result.passed ? 'Passed' : 'Needs support'}
              </span>
            }
            hint={`Attendance ${attendance.percent}%`}
            tone={result.passed ? 'slate' : 'rose'}
          />
        </div>
      </div>

      <div className="no-print grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader eyebrow="Trend" title="Progress across exams" />
          {trend.length < 2 ? (
            <p className="text-sm text-slate-500">The trend appears once more than one exam is published.</p>
          ) : (
            <div className="flex h-44 items-end gap-4">
              {trend.map((t) => (
                <button key={t.exam.id} type="button" onClick={() => setExamId(t.exam.id)} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-sm font-bold text-slate-800">{t.result.percent}%</span>
                  <span
                    className={cn('w-full max-w-[72px] rounded-t-xl', t.exam.id === exam.id ? 'bg-gradient-to-t from-violet-700 to-fuchsia-500' : 'bg-slate-300')}
                    style={{ height: `${t.result.percent}%` }}
                  />
                  <span className="text-center text-xs font-semibold text-slate-500">{t.exam.name}</span>
                </button>
              ))}
            </div>
          )}
        </Panel>
        <Panel>
          <PanelHeader eyebrow="Insights" title="Where to focus" />
          <div className="space-y-3">
            {strongest && (
              <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4">
                <Trophy className="mt-0.5 shrink-0 text-emerald-600" size={20} />
                <p className="text-sm text-emerald-900">
                  <span className="font-bold">Strongest subject: {strongest.subject}</span> at {strongest.percent}%.
                </p>
              </div>
            )}
            {weakest && weakest !== strongest && (
              <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4">
                <Target className="mt-0.5 shrink-0 text-amber-600" size={20} />
                <p className="text-sm text-amber-900">
                  <span className="font-bold">Focus area: {weakest.subject}</span> at {weakest.percent}%. A little extra practice here lifts the overall grade most.
                </p>
              </div>
            )}
            {change !== null && (
              <div className={cn('flex items-start gap-3 rounded-2xl p-4', change >= 0 ? 'bg-blue-50' : 'bg-rose-50')}>
                {change >= 0 ? <TrendingUp className="mt-0.5 shrink-0 text-blue-600" size={20} /> : <TrendingDown className="mt-0.5 shrink-0 text-rose-600" size={20} />}
                <p className={cn('text-sm', change >= 0 ? 'text-blue-900' : 'text-rose-900')}>
                  {change >= 0 ? 'Improved' : 'Dropped'} by <span className="font-bold">{Math.abs(change)}%</span> since {previous!.exam.name}.
                </p>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/*                             Principal overview                            */
/* ------------------------------------------------------------------------- */

export function ResultsOverview() {
  const { data } = useSchoolData()
  const withMarks = data.exams.filter((e) => data.marks[e.id])
  const [examId, setExamId] = useState(withMarks.filter((e) => e.published).pop()?.id || withMarks[0]?.id)
  const exam = data.exams.find((e) => e.id === examId) as Exam | undefined

  if (!exam) return <EmptyState icon={<BarChart3 size={40} />} title="No exam results yet" />

  const classStats = CLASSES.map((c) => {
    const ranking = classRanking(data.marks, exam, c)
    const avg = ranking.length ? Math.round((ranking.reduce((a, r) => a + r.result.percent, 0) / ranking.length) * 10) / 10 : 0
    const pass = ranking.filter((r) => r.result.passed).length
    return { classId: c, ranking, avg, pass }
  })
  const all = classStats.flatMap((c) => c.ranking).sort((a, b) => b.result.percent - a.result.percent)
  const schoolAvg = all.length ? Math.round((all.reduce((a, r) => a + r.result.percent, 0) / all.length) * 10) / 10 : 0
  const passRate = all.length ? Math.round((all.filter((r) => r.result.passed).length / all.length) * 100) : 0

  const subjectAvg = SUBJECTS.map((subject) => {
    const vals = Object.values(data.marks[exam.id]?.[subject] || {})
    return { subject, avg: vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length / exam.maxMarks) * 1000) / 10 : null }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-2xl font-bold text-slate-900">Examination results</h3>
        <Segmented
          value={exam.id}
          onChange={setExamId}
          options={withMarks.map((e) => ({ value: e.id, label: e.published ? e.name : `${e.name} (draft)` }))}
        />
      </div>

      {!exam.published && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          This exam is still a draft – teachers are entering marks. Figures below are provisional.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="School average" value={`${schoolAvg}%`} tone="slate" />
        <StatTile label="Pass rate" value={`${passRate}%`} tone="emerald" />
        <StatTile label="Topper" value={all[0] ? `${all[0].result.percent}%` : '–'} hint={all[0]?.student.name} tone="violet" icon={<Medal size={18} />} />
        <StatTile label="Students graded" value={all.length} tone="light" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader eyebrow="Subjects" title="Average score by subject" />
          <div className="space-y-4">
            {subjectAvg.map((s) => (
              <div key={s.subject}>
                <div className="mb-1.5 flex justify-between text-sm font-semibold text-slate-700">
                  <span>{s.subject}</span>
                  <span>{s.avg !== null ? `${s.avg}%` : 'Pending'}</span>
                </div>
                <ProgressBar value={s.avg ?? 0} barClassName={s.avg !== null && s.avg < 60 ? 'from-amber-500 to-orange-500' : undefined} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHeader eyebrow="Merit list" title="Top 5 students" />
          <ol className="space-y-2.5">
            {all.slice(0, 5).map((r, i) => (
              <li key={r.student.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={cn('flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold', i === 0 ? 'bg-amber-400 text-amber-950' : i === 1 ? 'bg-slate-300 text-slate-800' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-white text-slate-600')}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{r.student.name}</p>
                    <p className="text-xs text-slate-500">Class {r.student.classId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{r.result.percent}%</span>
                  <GradeBadge grade={r.result.grade} />
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {classStats.map((c) => (
          <Panel key={c.classId}>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-xl font-bold text-slate-900">Class {c.classId}</h4>
              <Badge className="bg-slate-100 text-slate-700">Avg {c.avg}%</Badge>
            </div>
            <p className="mb-3 text-sm text-slate-600">
              {c.pass} of {c.ranking.length} passed · topper <span className="font-bold text-slate-900">{c.ranking[0]?.student.name ?? '–'}</span>
            </p>
            <div className="space-y-2">
              {c.ranking.map((r) => (
                <div key={r.student.id} className="flex items-center gap-3 text-sm">
                  <span className="w-32 truncate font-semibold text-slate-700">{r.student.name}</span>
                  <ProgressBar value={r.result.percent} className="flex-1" barClassName={!r.result.passed ? 'from-rose-500 to-rose-600' : undefined} />
                  <span className="w-12 text-right font-bold text-slate-800">{r.result.percent}%</span>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className={secondaryButton}
          onClick={() => {
            const rows = all.map((r, i) => [i + 1, r.student.name, r.student.classId, r.result.total, r.result.maxTotal, r.result.percent, r.result.grade, r.result.passed ? 'Pass' : 'Fail'])
            downloadCSV(`${exam.name.replace(/\s+/g, '-')}-merit-list.csv`, [['Rank', 'Student', 'Class', 'Total', 'Max', '%', 'Grade', 'Result'], ...rows])
          }}
        >
          <Download size={16} /> Download merit list
        </button>
      </div>
    </div>
  )
}
