'use client'

import { useState } from 'react'
import {
  BellRing,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageSquareText,
  Paperclip,
  Plus,
  Send,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react'
import { useSchoolData } from '@/context/school-data-context'
import {
  Attachment,
  CLASSES,
  ClassId,
  HOMEWORK_STATUS_STYLES,
  Homework,
  SUBJECTS,
  daysBetween,
  findStudent,
  formatDate,
  homeworkStatus,
  studentsIn,
  todayISO,
} from '@/lib/school-data'
import { cn } from '@/lib/utils'
import { Badge, EmptyState, Field, Modal, Panel, PanelHeader, ProgressBar, Segmented, StatTile, Toast, inputClass, primaryButton, readFileAttachment, secondaryButton } from './ui'

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-700',
  Physics: 'bg-indigo-100 text-indigo-700',
  Chemistry: 'bg-emerald-100 text-emerald-700',
  English: 'bg-rose-100 text-rose-700',
  History: 'bg-amber-100 text-amber-700',
  'Computer Science': 'bg-cyan-100 text-cyan-700',
}

function dueLabel(dueDate: string) {
  const diff = daysBetween(todayISO(), dueDate)
  if (diff === 0) return { text: 'Due today', urgent: true }
  if (diff === 1) return { text: 'Due tomorrow', urgent: true }
  if (diff > 1) return { text: `Due in ${diff} days`, urgent: diff <= 2 }
  return { text: `Was due ${formatDate(dueDate, { day: 'numeric', month: 'short' })}`, urgent: false }
}

function AttachmentChip({ attachment }: { attachment: Attachment }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
      <Paperclip size={13} className="shrink-0 text-blue-600" />
      <span className="truncate">{attachment.name}</span>
      <span className="shrink-0 font-medium text-slate-400">({attachment.size})</span>
    </span>
  )
}

function FilePicker({ attachment, onChange, label }: { attachment: Attachment | null; onChange: (a: Attachment | null) => void; label: string }) {
  return (
    <label className="flex cursor-pointer flex-col items-start gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-slate-400 hover:bg-slate-100">
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Upload size={16} className="text-slate-500" /> {label}
      </span>
      {attachment ? (
        <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
          <FileText size={14} /> {attachment.name} ({attachment.size})
          <button
            type="button"
            aria-label="Remove file"
            onClick={(e) => {
              e.preventDefault()
              onChange(null)
            }}
            className="hover:text-rose-600"
          >
            <X size={14} />
          </button>
        </span>
      ) : (
        <span className="text-xs text-slate-500">PDF, image or document</span>
      )}
      <input type="file" className="hidden" onChange={(e) => onChange(readFileAttachment(e))} />
    </label>
  )
}

/* ------------------------------------------------------------------------- */
/*                               Teacher manager                             */
/* ------------------------------------------------------------------------- */

export function HomeworkManager({ teacherName, defaultSubject = 'Mathematics' }: { teacherName: string; defaultSubject?: string }) {
  const { data, addHomework, deleteHomework, reviewSubmission } = useSchoolData()
  const today = todayISO()
  const [form, setForm] = useState({ title: '', subject: defaultSubject, classId: '10A' as ClassId, dueDate: '', maxMarks: '20', description: '' })
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [filter, setFilter] = useState<'active' | 'closed' | 'all'>('active')
  const [classFilter, setClassFilter] = useState<'all' | ClassId>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const canSubmit = form.title.trim() && form.dueDate && Number(form.maxMarks) > 0

  const publish = () => {
    if (!canSubmit) return
    addHomework({
      title: form.title.trim(),
      subject: form.subject,
      classId: form.classId,
      dueDate: form.dueDate,
      maxMarks: Number(form.maxMarks),
      description: form.description.trim(),
      attachment: attachment || undefined,
      assignedBy: teacherName,
    })
    setForm({ ...form, title: '', dueDate: '', description: '' })
    setAttachment(null)
    setToast(`Homework sent to Class ${form.classId}`)
  }

  const list = data.homework
    .filter((h) => classFilter === 'all' || h.classId === classFilter)
    .filter((h) => (filter === 'all' ? true : filter === 'active' ? h.dueDate >= today : h.dueDate < today))
    .sort((a, b) => (filter === 'closed' ? b.dueDate.localeCompare(a.dueDate) : a.dueDate.localeCompare(b.dueDate)))

  const open = data.homework.find((h) => h.id === openId) || null

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <Panel className="xl:col-span-2">
        <PanelHeader eyebrow="Homework" title="Assign new work" />
        <div className="space-y-4">
          <Field label="Title">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Chapter 5 – Exercise 5.2" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Subject">
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass}>
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Class">
              <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value as ClassId })} className={inputClass}>
                {CLASSES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Due date">
              <input type="date" min={today} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Max marks">
              <input type="number" min={1} value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label="Instructions">
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What should students do? Mention pages, format, word count…" className={inputClass} />
          </Field>
          <FilePicker attachment={attachment} onChange={setAttachment} label="Attach worksheet (optional)" />
          <button type="button" onClick={publish} disabled={!canSubmit} className={cn(primaryButton, 'w-full')}>
            <Send size={16} /> Publish to Class {form.classId}
          </button>
        </div>
      </Panel>

      <Panel className="xl:col-span-3">
        <PanelHeader
          eyebrow="Assigned"
          title="Track submissions"
          actions={
            <>
              <Segmented value={classFilter} onChange={setClassFilter} options={[{ value: 'all', label: 'All' }, ...CLASSES.map((c) => ({ value: c, label: c }))]} />
              <Segmented
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'closed', label: 'Past due' },
                  { value: 'all', label: 'All' },
                ]}
              />
            </>
          }
        />
        {list.length === 0 ? (
          <EmptyState icon={<ClipboardList size={36} />} title="Nothing here" description="Homework you assign shows up here with live submission counts." />
        ) : (
          <ul className="space-y-3">
            {list.map((hw) => {
              const roster = studentsIn(hw.classId)
              const subs = data.submissions[hw.id] || {}
              const submitted = roster.filter((s) => subs[s.id]).length
              const reviewed = roster.filter((s) => subs[s.id]?.reviewedAt).length
              const due = dueLabel(hw.dueDate)
              return (
                <li key={hw.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <Badge className={SUBJECT_COLORS[hw.subject] || 'bg-slate-100 text-slate-700'}>{hw.subject}</Badge>
                        <Badge className="bg-white text-slate-600 ring-1 ring-slate-200">Class {hw.classId}</Badge>
                        <span className={cn('text-xs font-bold', due.urgent ? 'text-rose-600' : 'text-slate-500')}>{due.text}</span>
                      </div>
                      <p className="font-bold text-slate-900">{hw.title}</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Delete homework"
                      onClick={() => window.confirm(`Delete “${hw.title}” and all its submissions?`) && deleteHomework(hw.id)}
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar value={(submitted / roster.length) * 100} className="flex-1" barClassName="from-emerald-500 to-teal-600" />
                    <span className="whitespace-nowrap text-xs font-bold text-slate-600">
                      {submitted}/{roster.length} submitted · {reviewed} reviewed
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setOpenId(hw.id)} className={secondaryButton}>
                      <Users size={15} /> Submissions
                    </button>
                    {submitted < roster.length && (
                      <button type="button" onClick={() => setToast(`Reminder sent to ${roster.length - submitted} students and their parents`)} className={secondaryButton}>
                        <BellRing size={15} /> Remind pending
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      <Modal open={!!open} onClose={() => setOpenId(null)} title={open ? open.title : ''} wide>
        {open && <SubmissionsReview hw={open} onReview={(sid, score, fb) => {
          reviewSubmission(open.id, sid, score, fb)
          setToast('Review saved – student can see it now')
        }} />}
      </Modal>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}

function SubmissionsReview({ hw, onReview }: { hw: Homework; onReview: (studentId: string, score: number, feedback: string) => void }) {
  const { data } = useSchoolData()
  const subs = data.submissions[hw.id] || {}
  const roster = studentsIn(hw.classId)
  const [drafts, setDrafts] = useState<Record<string, { score: string; feedback: string }>>({})

  return (
    <div>
      <p className="mb-1 text-sm text-slate-600">{hw.description}</p>
      <p className="mb-5 text-xs font-semibold text-slate-500">
        Class {hw.classId} · due {formatDate(hw.dueDate)} · {hw.maxMarks} marks
      </p>
      <ul className="space-y-3">
        {roster.map((s) => {
          const sub = subs[s.id]
          const status = homeworkStatus(hw, sub)
          const draft = drafts[s.id] || { score: sub?.score?.toString() ?? '', feedback: sub?.feedback ?? '' }
          return (
            <li key={s.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-slate-900">
                  {s.rollNo}. {s.name}
                </p>
                <Badge className={HOMEWORK_STATUS_STYLES[status].className}>{HOMEWORK_STATUS_STYLES[status].label}</Badge>
              </div>
              {sub ? (
                <>
                  <p className="mt-1 text-xs text-slate-500">Submitted {new Date(sub.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</p>
                  {sub.answer && <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{sub.answer}</p>}
                  {sub.attachment && (
                    <div className="mt-2">
                      <AttachmentChip attachment={sub.attachment} />
                    </div>
                  )}
                  <div className="mt-3 grid gap-2 sm:grid-cols-[110px_1fr_auto]">
                    <input
                      type="number"
                      min={0}
                      max={hw.maxMarks}
                      value={draft.score}
                      placeholder={`/ ${hw.maxMarks}`}
                      onChange={(e) => setDrafts({ ...drafts, [s.id]: { ...draft, score: e.target.value } })}
                      className={cn(inputClass, 'py-2')}
                      aria-label="Score"
                    />
                    <input
                      value={draft.feedback}
                      placeholder="Feedback for the student"
                      onChange={(e) => setDrafts({ ...drafts, [s.id]: { ...draft, feedback: e.target.value } })}
                      className={cn(inputClass, 'py-2')}
                      aria-label="Feedback"
                    />
                    <button
                      type="button"
                      disabled={draft.score === '' || Number(draft.score) > hw.maxMarks || Number(draft.score) < 0}
                      onClick={() => onReview(s.id, Number(draft.score), draft.feedback.trim())}
                      className={cn(primaryButton, 'py-2')}
                    >
                      <CheckCircle2 size={15} /> {sub.reviewedAt ? 'Update' : 'Save'}
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-1 text-xs text-slate-500">No submission yet · parent {s.parentName}</p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/*                          Student / parent board                           */
/* ------------------------------------------------------------------------- */

export function HomeworkBoard({ studentId, mode = 'student' }: { studentId: string; mode?: 'student' | 'parent' }) {
  const { data, submitHomework } = useSchoolData()
  const student = findStudent(studentId)
  const [filter, setFilter] = useState<'todo' | 'done' | 'all'>('todo')
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  if (!student) return null

  const items = data.homework
    .filter((h) => h.classId === student.classId)
    .map((h) => {
      const sub = data.submissions[h.id]?.[studentId]
      return { hw: h, sub, status: homeworkStatus(h, sub) }
    })

  const todo = items.filter((i) => i.status === 'pending' || i.status === 'overdue')
  const done = items.filter((i) => !(i.status === 'pending' || i.status === 'overdue'))
  const reviewed = items.filter((i) => i.sub?.score !== undefined)
  const avgScore = reviewed.length ? Math.round((reviewed.reduce((a, i) => a + i.sub!.score! / i.hw.maxMarks, 0) / reviewed.length) * 100) : null
  const completion = items.length ? Math.round((done.length / items.length) * 100) : 100

  const shown = (filter === 'todo' ? todo : filter === 'done' ? done : items).sort((a, b) =>
    filter === 'done' ? b.hw.dueDate.localeCompare(a.hw.dueDate) : a.hw.dueDate.localeCompare(b.hw.dueDate)
  )

  const target = items.find((i) => i.hw.id === submittingId)

  const openSubmit = (id: string) => {
    const existing = data.submissions[id]?.[studentId]
    setAnswer(existing?.answer ?? '')
    setAttachment(existing?.attachment ?? null)
    setSubmittingId(id)
  }

  const submit = () => {
    if (!submittingId || (!answer.trim() && !attachment)) return
    submitHomework(submittingId, studentId, answer.trim(), attachment || undefined)
    setSubmittingId(null)
    setToast('Homework submitted – your teacher has been notified')
  }

  const firstName = student.name.split(' ')[0]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="To do" value={todo.filter((t) => t.status === 'pending').length} tone="blue" icon={<CalendarClock size={18} />} />
        <StatTile label="Overdue" value={todo.filter((t) => t.status === 'overdue').length} tone={todo.some((t) => t.status === 'overdue') ? 'rose' : 'light'} />
        <StatTile label="Completion" value={`${completion}%`} hint={`${done.length} of ${items.length} handed in`} tone="slate" icon={<BookOpenCheck size={18} className="text-cyan-300" />} />
        <StatTile label="Average score" value={avgScore !== null ? `${avgScore}%` : '–'} hint={`${reviewed.length} reviewed`} tone="light" icon={<Star size={18} className="text-amber-500" />} />
      </div>

      <Panel>
        <PanelHeader
          eyebrow="Homework"
          title={mode === 'parent' ? `${firstName}'s homework` : 'My homework'}
          actions={
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'todo', label: `To do (${todo.length})` },
                { value: 'done', label: `Handed in (${done.length})` },
                { value: 'all', label: 'All' },
              ]}
            />
          }
        />
        {shown.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={40} />}
            title={filter === 'todo' ? 'All caught up!' : 'Nothing here yet'}
            description={filter === 'todo' ? 'There is no pending homework right now.' : undefined}
          />
        ) : (
          <ul className="space-y-3">
            {shown.map(({ hw, sub, status }) => {
              const due = dueLabel(hw.dueDate)
              const style = HOMEWORK_STATUS_STYLES[status]
              return (
                <li
                  key={hw.id}
                  className={cn(
                    'rounded-2xl border p-4 sm:p-5',
                    status === 'overdue' ? 'border-rose-200 bg-rose-50/50' : status === 'pending' && due.urgent ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-slate-50'
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <Badge className={SUBJECT_COLORS[hw.subject] || 'bg-slate-100 text-slate-700'}>{hw.subject}</Badge>
                        <Badge className={style.className}>{style.label}</Badge>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{hw.title}</p>
                      {hw.description && <p className="mt-1 text-sm text-slate-600">{hw.description}</p>}
                      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                        <span className={cn(due.urgent && (status === 'pending' || status === 'overdue') && 'text-rose-600')}>{due.text}</span>
                        <span>· {hw.maxMarks} marks</span>
                        <span>· {hw.assignedBy}</span>
                      </p>
                      {hw.attachment && (
                        <div className="mt-2">
                          <AttachmentChip attachment={hw.attachment} />
                        </div>
                      )}
                    </div>
                    {mode === 'student' && !sub?.reviewedAt && (
                      <button type="button" onClick={() => openSubmit(hw.id)} className={cn(sub ? secondaryButton : primaryButton, 'shrink-0')}>
                        <Upload size={15} /> {sub ? 'Edit submission' : 'Submit'}
                      </button>
                    )}
                  </div>

                  {sub && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-sm">
                      <p className="text-xs font-semibold text-slate-500">
                        Handed in {new Date(sub.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                      </p>
                      {sub.answer && <p className="mt-1 text-slate-700">{sub.answer}</p>}
                      {sub.attachment && (
                        <div className="mt-2">
                          <AttachmentChip attachment={sub.attachment} />
                        </div>
                      )}
                      {sub.reviewedAt && (
                        <div className="mt-3 flex items-start gap-3 rounded-xl bg-violet-50 p-3">
                          <MessageSquareText size={18} className="mt-0.5 shrink-0 text-violet-600" />
                          <div>
                            <p className="font-bold text-violet-900">
                              Score: {sub.score}/{hw.maxMarks}
                            </p>
                            {sub.feedback && <p className="text-violet-800">“{sub.feedback}”</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      <Modal open={!!target} onClose={() => setSubmittingId(null)} title={target ? `Submit: ${target.hw.title}` : ''}>
        {target && (
          <div className="space-y-4">
            {target.status === 'overdue' && (
              <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">This is past the due date and will be marked as a late submission.</p>
            )}
            <Field label="Your answer / note to teacher">
              <textarea rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer or a short note about your attached work…" className={inputClass} />
            </Field>
            <FilePicker attachment={attachment} onChange={setAttachment} label="Attach your work" />
            <button type="button" onClick={submit} disabled={!answer.trim() && !attachment} className={cn(primaryButton, 'w-full')}>
              <Send size={16} /> Hand in
            </button>
          </div>
        )}
      </Modal>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}

/* Compact list used on dashboards. */
export function HomeworkDueSoon({ studentId, limit = 3 }: { studentId: string; limit?: number }) {
  const { data } = useSchoolData()
  const student = findStudent(studentId)
  if (!student) return null
  const pending = data.homework
    .filter((h) => h.classId === student.classId && !data.submissions[h.id]?.[studentId])
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, limit)
  if (pending.length === 0) return <p className="text-sm text-slate-500">No pending homework.</p>
  return (
    <ul className="space-y-2">
      {pending.map((h) => {
        const due = dueLabel(h.dueDate)
        return (
          <li key={h.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
            <span className="truncate font-semibold text-slate-800">{h.title}</span>
            <span className={cn('whitespace-nowrap text-xs font-bold', due.urgent || h.dueDate < todayISO() ? 'text-rose-600' : 'text-slate-500')}>{due.text}</span>
          </li>
        )
      })}
    </ul>
  )
}
