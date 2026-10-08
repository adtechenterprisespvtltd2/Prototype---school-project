'use client'

import { useMemo, useState } from 'react'
import Header from '@/components/header'
import { useAuth } from '@/context/auth-context'
import {
  BarChart3,
  BellRing,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HelpCircle,
MessageCircle,
  NotebookPen,
  Paperclip,
  Send,
  TrendingUp,
  Upload,
  Users,
  Clock3,
  X,
  CalendarRange,
} from 'lucide-react'
import TimetableView from '@/components/timetable-view'
import { teacherTimetable } from '@/lib/timetable-data'
import { useSchoolData } from '@/context/school-data-context'
import { AttendanceManager } from '@/components/school/attendance'
import { ResultsManager } from '@/components/school/results'
import { HomeworkManager } from '@/components/school/homework'
import { ClassId, examResult, studentsIn, summarizeAttendance, todayISO } from '@/lib/school-data'

type PortalTab =
  | 'dashboard'
  | 'students'
  | 'attendance'
  | 'results'
  | 'homework'
  | 'notes'
  | 'questions'
  | 'papers'
  | 'communication'
  | 'statistics'
  | 'timetable'

type Attachment = {
  name: string
  size: string
}

type NoteItem = {
  id: number
  title: string
  subject: string
  postedOn: string
  attachment?: Attachment
}

type QuestionItem = {
  id: number
  subject: string
  chapter: string
  questions: string[]
  difficulty: string
  marks: number
  attachment?: Attachment
}

type PaperItem = {
  id: number
  subject: string
  exam: string
  year: string
  marks: string
  duration: string
  attachment?: Attachment
}

type MessageItem = {
  id: number
  parent: string
  message: string
  time: string
}

function AttachmentPicker({
  label,
  attachment,
  onFile,
  onClear,
}: {
  label: string
  attachment: Attachment | null
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
}) {
  return (
    <div>
      <label className="flex cursor-pointer flex-col items-start gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-slate-400 hover:bg-slate-100">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Paperclip size={16} className="text-slate-500" />
          {label}
        </span>
        {attachment ? (
          <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <FileText size={14} />
            {attachment.name} ({attachment.size})
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onClear()
              }}
              className="text-emerald-600 transition hover:text-red-600"
            >
              <X size={14} />
            </button>
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-500">Attach a document (PDF, DOC, image, etc.)</span>
        )}
        <input type="file" onChange={onFile} className="hidden" />
      </label>
    </div>
  )
}

function TeacherPortalContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<PortalTab>('dashboard')

  const [notes, setNotes] = useState<NoteItem[]>([
    { id: 1, title: 'Chapter 4 revision notes', subject: 'Mathematics', postedOn: '2026-08-04' },
    { id: 2, title: 'History worksheet', subject: 'Social Studies', postedOn: '2026-08-03' },
  ])

  const [questions, setQuestions] = useState<QuestionItem[]>([
    { id: 1, subject: 'Mathematics', chapter: 'Calculus - Differentiation', questions: ['Derive the chain rule', 'Solve maxima and minima problems'], difficulty: 'Hard', marks: 8 },
    { id: 2, subject: 'Physics', chapter: 'Quantum Mechanics', questions: ['Explain wave-particle duality', 'State Heisenberg uncertainty principle'], difficulty: 'Hard', marks: 10 },
  ])

  const [papers, setPapers] = useState<PaperItem[]>([
    { id: 1, subject: 'Mathematics', exam: 'Mid-Term Exam', year: '2024', marks: '100 Marks', duration: '3 Hours' },
    { id: 2, subject: 'Physics', exam: 'Final Exam', year: '2023', marks: '100 Marks', duration: '3 Hours' },
  ])

  const [messages, setMessages] = useState<MessageItem[]>([
    { id: 1, parent: 'Anna Smith', message: 'Thanks for the progress update. We will work on homework this week.', time: '10 mins ago' },
    { id: 2, parent: 'Laura Wilson', message: 'Please share extra practice material for the next test.', time: '1 hour ago' },
  ])

  const [noteForm, setNoteForm] = useState({ title: '', subject: '', summary: '' })
  const [questionForm, setQuestionForm] = useState({ subject: '', chapter: '', questions: '', difficulty: 'Medium', marks: '' })
  const [paperForm, setPaperForm] = useState({ subject: '', exam: '', year: '', marks: '', duration: '' })
  const [messageForm, setMessageForm] = useState({ parent: '', message: '' })

  const [noteAttachment, setNoteAttachment] = useState<Attachment | null>(null)
  const [questionAttachment, setQuestionAttachment] = useState<Attachment | null>(null)
  const [paperAttachment, setPaperAttachment] = useState<Attachment | null>(null)

  const readAttachment = (e: React.ChangeEvent<HTMLInputElement>): Attachment | null => {
    const file = e.target.files?.[0]
    if (!file) return null
    return { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` }
  }

  const { data: schoolData } = useSchoolData()
  const homeClass: ClassId = user?.classId === 'CLASS-10B' ? '10B' : '10A'
  const todayRegister = schoolData.attendance[todayISO()] || {}
  const latestExam = [...schoolData.exams].filter((e) => e.published && schoolData.marks[e.id]).sort((a, b) => b.date.localeCompare(a.date))[0]

  // Class roster enriched with live attendance and the latest published exam score.
  const students = useMemo(
    () =>
      studentsIn(homeClass).map((s) => ({
        id: s.id,
        name: s.name,
        rollNo: `${s.classId}-${String(s.rollNo).padStart(2, '0')}`,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        attendance: summarizeAttendance(schoolData.attendance, s.id).percent,
        average: latestExam ? examResult(schoolData.marks, latestExam, s.id).percent : 0,
        today: todayRegister[s.id],
      })),
    [homeClass, schoolData.attendance, schoolData.marks, latestExam, todayRegister]
  )

  const classAverage = Math.round(students.reduce((sum, s) => sum + s.average, 0) / students.length)
  const attendanceAverage = Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length)
  const topStudent = [...students].sort((a, b) => b.average - a.average)[0]

  const presentToday = students.filter((s) => s.today === 'present' || s.today === 'late').length
  const homeworkDue = schoolData.homework.filter((h) => h.dueDate >= todayISO()).length

  const tabs: { id: PortalTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'students', label: 'Manage Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'results', label: 'Results', icon: Upload },
    { id: 'homework', label: 'Homework', icon: BookOpenCheck },
    { id: 'notes', label: 'Upload Notes', icon: NotebookPen },
    { id: 'questions', label: 'Important Questions', icon: HelpCircle },
    { id: 'papers', label: 'Question Papers', icon: FileText },
    { id: 'communication', label: 'Parent Communication', icon: MessageCircle },
    { id: 'statistics', label: 'Statistics', icon: TrendingUp },
    { id: 'timetable', label: 'Timetable', icon: CalendarRange },
  ]

  const handleNoteSubmit = () => {
    if (!noteForm.title || !noteForm.subject || !noteForm.summary) return

    setNotes((currentNotes) => [
      {
        id: currentNotes.length + 1,
        title: noteForm.title,
        subject: noteForm.subject,
        postedOn: new Date().toISOString().split('T')[0],
        attachment: noteAttachment || undefined,
      },
      ...currentNotes,
    ])
    setNoteForm({ title: '', subject: '', summary: '' })
    setNoteAttachment(null)
  }

  const handleQuestionSubmit = () => {
    if (!questionForm.subject || !questionForm.chapter || !questionForm.questions || !questionForm.marks) return

    setQuestions((currentQuestions) => [
      {
        id: currentQuestions.length + 1,
        subject: questionForm.subject,
        chapter: questionForm.chapter,
        questions: questionForm.questions.split('\n').map((q) => q.trim()).filter(Boolean),
        difficulty: questionForm.difficulty,
        marks: Number(questionForm.marks),
        attachment: questionAttachment || undefined,
      },
      ...currentQuestions,
    ])
    setQuestionForm({ subject: '', chapter: '', questions: '', difficulty: 'Medium', marks: '' })
    setQuestionAttachment(null)
  }

  const handlePaperSubmit = () => {
    if (!paperForm.subject || !paperForm.exam || !paperForm.year || !paperForm.marks || !paperForm.duration) return

    setPapers((currentPapers) => [
      {
        id: currentPapers.length + 1,
        subject: paperForm.subject,
        exam: paperForm.exam,
        year: paperForm.year,
        marks: paperForm.marks,
        duration: paperForm.duration,
        attachment: paperAttachment || undefined,
      },
      ...currentPapers,
    ])
    setPaperForm({ subject: '', exam: '', year: '', marks: '', duration: '' })
    setPaperAttachment(null)
  }

  const handleMessageSubmit = () => {
    if (!messageForm.parent || !messageForm.message) return

    setMessages((currentMessages) => [
      {
        id: currentMessages.length + 1,
        parent: messageForm.parent,
        message: messageForm.message,
        time: 'Just now',
      },
      ...currentMessages,
    ])
    setMessageForm({ parent: '', message: '' })
  }

  const statCards = [
    { label: 'Students', value: students.length, icon: Users },
    { label: 'Attendance', value: `${attendanceAverage}%`, icon: ClipboardCheck },
    { label: 'Class Average', value: `${classAverage}%`, icon: TrendingUp },
    { label: 'Active Homework', value: homeworkDue, icon: FileText },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <Header />

      <section className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-4 py-16 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-8 h-96 w-96 rounded-full bg-slate-700 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-blue-600 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 backdrop-blur">
                <BellRing size={16} />
                Teacher Portal
              </p>
              <h1 className="text-4xl font-bold md:text-6xl">
                Welcome, {user?.name || 'Teacher'}
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-300">
                Manage your class, keep parents informed, and track every student from one dashboard.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.label} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                    <Icon size={24} className="mb-4 text-cyan-300" />
                    <p className="text-sm text-slate-300">{card.label}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
<div className="mb-8 flex gap-2 overflow-x-auto rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-w-fit flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-3 py-4 text-xs sm:px-6 sm:py-4 sm:text-sm font-bold transition-all ${active
                  ? 'bg-gradient-to-r from-slate-800 to-blue-900 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {activeTab === 'dashboard' && (
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl lg:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-900">Class at a glance</h2>
                </div>
                <Clock3 className="text-slate-400" size={28} />
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-900 p-5 text-white">
                  <p className="text-sm text-slate-300">Present Today</p>
                  <p className="mt-3 text-4xl font-bold">{presentToday}</p>
                </div>
                <div className="rounded-2xl bg-blue-950 p-5 text-white">
                  <p className="text-sm text-blue-200">Attendance Rate</p>
                  <p className="mt-3 text-4xl font-bold">{attendanceAverage}%</p>
                </div>
                <div className="rounded-2xl bg-slate-800 p-5 text-white">
                  <p className="text-sm text-slate-300">Average Score</p>
                  <p className="mt-3 text-4xl font-bold">{classAverage}%</p>
                </div>
                <div className="rounded-2xl bg-cyan-900 p-5 text-white">
                  <p className="text-sm text-cyan-200">Homework Due</p>
                  <p className="mt-3 text-4xl font-bold">{homeworkDue}</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-slate-900 p-3 text-white">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Manage Students</p>
                      <p className="text-sm text-slate-600">Track student progress and contact details.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-900 p-3 text-white">
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Parent Communication</p>
                      <p className="text-sm text-slate-600">Send updates about homework, attendance, and results.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Quick Actions</p>
              <div className="mt-5 space-y-3">
                {[
                  { label: 'Mark Attendance', target: 'attendance' as PortalTab },
                  { label: 'Upload Results', target: 'results' as PortalTab },
                  { label: 'Assign Homework', target: 'homework' as PortalTab },
                  { label: 'Send Note', target: 'notes' as PortalTab },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setActiveTab(action.target)}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 text-left font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <span>{action.label}</span>
                    <CheckCircle2 size={16} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'students' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Manage Students</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">Class {homeClass} roster</h2>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                {students.length} students
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {students.map((student) => (
                <article key={student.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
                      <p className="text-sm text-slate-500">Roll No. {student.rollNo}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                      {student.today ? student.today[0].toUpperCase() + student.today.slice(1) : 'Not marked'}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Attendance</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{student.attendance}%</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Latest exam</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{student.average}%</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Parent</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{student.parentName}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-600">Contact: {student.parentPhone}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'attendance' && <AttendanceManager defaultClass={homeClass} />}

        {activeTab === 'results' && <ResultsManager defaultClass={homeClass} />}

        {activeTab === 'homework' && <HomeworkManager teacherName={user?.name || 'Class Teacher'} />}

        {activeTab === 'notes' && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Upload Notes</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Share class notes</h2>

              <div className="mt-6 space-y-4">
                <input
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="Note title"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                />
                <input
                  value={noteForm.subject}
                  onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                  placeholder="Subject"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                />
                <textarea
                  value={noteForm.summary}
                  onChange={(e) => setNoteForm({ ...noteForm, summary: e.target.value })}
                  placeholder="Short summary for students"
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                />
                <AttachmentPicker
                  label="Attach document"
                  attachment={noteAttachment}
                  onFile={(e) => setNoteAttachment(readAttachment(e))}
                  onClear={() => setNoteAttachment(null)}
                />
                <button
                  onClick={handleNoteSubmit}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
                >
                  <NotebookPen size={18} />
                  Upload Notes
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Recent notes</p>
              <div className="mt-6 space-y-4">
                {notes.map((note) => (
                  <article key={note.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-bold text-slate-900">{note.title}</p>
                    <p className="text-sm text-slate-600">{note.subject}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Posted {note.postedOn}</p>
                    {note.attachment && (
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
                        <Paperclip size={14} className="text-emerald-600" />
                        {note.attachment.name} ({note.attachment.size})
                      </span>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'questions' && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Important Questions</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Add chapter-wise questions</h2>

              <div className="mt-6 space-y-4">
                <input
                  value={questionForm.subject}
                  onChange={(e) => setQuestionForm({ ...questionForm, subject: e.target.value })}
                  placeholder="Subject"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                />
                <input
                  value={questionForm.chapter}
                  onChange={(e) => setQuestionForm({ ...questionForm, chapter: e.target.value })}
                  placeholder="Chapter name"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                />
                <textarea
                  value={questionForm.questions}
                  onChange={(e) => setQuestionForm({ ...questionForm, questions: e.target.value })}
                  placeholder="Enter questions (one per line)"
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={questionForm.marks}
                    onChange={(e) => setQuestionForm({ ...questionForm, marks: e.target.value })}
                    placeholder="Marks"
                    type="number"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  />
                  <select
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <AttachmentPicker
                  label="Attach question document"
                  attachment={questionAttachment}
                  onFile={(e) => setQuestionAttachment(readAttachment(e))}
                  onClear={() => setQuestionAttachment(null)}
                />
                <button
                  onClick={handleQuestionSubmit}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
                >
                  <HelpCircle size={18} />
                  Publish Questions
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Published questions</p>
              <div className="mt-6 space-y-4">
                {questions.map((q) => (
                  <article key={q.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{q.chapter}</p>
                        <p className="text-sm text-slate-600">{q.subject}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${q.difficulty === 'Hard' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {q.difficulty} · {q.marks} marks
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1">
                      {q.questions.map((question, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <HelpCircle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                          {question}
                        </li>
                      ))}
                    </ul>
                    {q.attachment && (
                      <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
                        <Paperclip size={14} className="text-amber-600" />
                        {q.attachment.name} ({q.attachment.size})
                      </span>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'papers' && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Question Papers</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Upload a question paper</h2>

              <div className="mt-6 space-y-4">
                <input
                  value={paperForm.subject}
                  onChange={(e) => setPaperForm({ ...paperForm, subject: e.target.value })}
                  placeholder="Subject"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                />
                <input
                  value={paperForm.exam}
                  onChange={(e) => setPaperForm({ ...paperForm, exam: e.target.value })}
                  placeholder="Exam type (e.g. Mid-Term / Final)"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={paperForm.year}
                    onChange={(e) => setPaperForm({ ...paperForm, year: e.target.value })}
                    placeholder="Year"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  />
                  <input
                    value={paperForm.marks}
                    onChange={(e) => setPaperForm({ ...paperForm, marks: e.target.value })}
                    placeholder="Total marks"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  />
                </div>
                <input
                  value={paperForm.duration}
                  onChange={(e) => setPaperForm({ ...paperForm, duration: e.target.value })}
                  placeholder="Duration (e.g. 3 Hours)"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                />
                <AttachmentPicker
                  label="Attach question paper (PDF)"
                  attachment={paperAttachment}
                  onFile={(e) => setPaperAttachment(readAttachment(e))}
                  onClear={() => setPaperAttachment(null)}
                />
                <button
                  onClick={handlePaperSubmit}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
                >
                  <Upload size={18} />
                  Publish Question Paper
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Published papers</p>
              <div className="mt-6 space-y-4">
                {papers.map((paper) => (
                  <article key={paper.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{paper.exam} - {paper.subject}</p>
                        <p className="text-sm text-slate-600">{paper.year} · {paper.marks} · {paper.duration}</p>
                      </div>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{paper.subject}</span>
                    </div>
                    {paper.attachment && (
                      <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
                        <Paperclip size={14} className="text-blue-600" />
                        {paper.attachment.name} ({paper.attachment.size})
                      </span>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'communication' && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Parent Communication</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Send a message to parents</h2>

              <div className="mt-6 space-y-4">
                <input
                  value={messageForm.parent}
                  onChange={(e) => setMessageForm({ ...messageForm, parent: e.target.value })}
                  placeholder="Parent name"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                />
                <textarea
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  placeholder="Write your update"
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                />
                <button
                  onClick={handleMessageSubmit}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
                >
                  <Send size={18} />
                  Send Message
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Recent conversations</p>
              <div className="mt-6 space-y-4">
                {messages.map((message) => (
                  <article key={message.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-slate-900">{message.parent}</p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{message.time}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{message.message}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'timetable' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <TimetableView
              entries={teacherTimetable}
              title="My Teaching Schedule"
              subtitle="Your weekly classes, laboratories and free periods • Academic Year 2025-2026"
            />
          </section>
        )}

        {activeTab === 'statistics' && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Statistics</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Class performance</h2>

              <div className="mt-6 space-y-5">
                {students.map((student) => (
                  <div key={student.id}>
                    <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>{student.name}</span>
                      <span>{student.average}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-slate-700 to-blue-700"
                        style={{ width: `${student.average}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Insights</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-900 p-5 text-white">
                  <p className="text-sm text-slate-300">Highest scorer</p>
                  <p className="mt-2 text-2xl font-bold">{topStudent?.name}</p>
                  <p className="text-sm text-slate-300">{topStudent?.average}% in {latestExam?.name}</p>
                </div>
                <div className="rounded-2xl bg-blue-950 p-5 text-white">
                  <p className="text-sm text-blue-200">Attendance trend</p>
                  <p className="mt-2 text-2xl font-bold">Stable</p>
                  <p className="text-sm text-blue-200">Class average {attendanceAverage}%</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-700">Summary</p>
                <p className="mt-2 text-sm text-slate-600">
                  The dashboard keeps attendance, homework, results, notes, and parent communication visible so you can manage the whole class from one place.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default TeacherPortalContent
