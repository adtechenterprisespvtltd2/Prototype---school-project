// Shared school records used by every portal (attendance, results, fees, homework,
// notices, study material, messages and timetables).
// Everything here is plain data + pure helpers; state lives in context/school-data-context.tsx.

import { TimetableEntry, classTimetable, schoolTimetable, teacherTimetable } from './timetable-data'

export type ClassId = '10A' | '10B'

export type RosterStudent = {
  id: string
  name: string
  classId: ClassId
  rollNo: number
  parentName: string
  parentPhone: string
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave'

// attendance[date][studentId] = status
export type AttendanceRegister = Record<string, Record<string, AttendanceStatus>>

export type Exam = {
  id: string
  name: string
  maxMarks: number
  date: string
  published: boolean
}

// marks[examId][subject][studentId] = marks obtained
export type MarksBook = Record<string, Record<string, Record<string, number>>>

export type Attachment = { name: string; size: string }

export type Homework = {
  id: string
  title: string
  subject: string
  classId: ClassId
  description: string
  assignedOn: string
  dueDate: string
  maxMarks: number
  attachment?: Attachment
  assignedBy: string
}

export type Submission = {
  submittedAt: string
  answer: string
  attachment?: Attachment
  score?: number
  feedback?: string
  reviewedAt?: string
}

// submissions[homeworkId][studentId]
export type SubmissionBook = Record<string, Record<string, Submission>>

export type Installment = {
  id: string
  label: string
  dueDate: string
  amount: number
}

export type PaymentMethod = 'UPI' | 'Cash' | 'Card' | 'Bank Transfer' | 'Cheque'

export type Payment = {
  id: string
  receiptNo: string
  studentId: string
  amount: number
  date: string
  method: PaymentMethod
  reference: string
  allocations: { installmentId: string; amount: number }[]
  receivedBy: string
}

export type NoticePriority = 'high' | 'medium' | 'low'
export type NoticeAudience = 'everyone' | 'students' | 'parents' | 'staff'

export type Notice = {
  id: string
  title: string
  content: string
  priority: NoticePriority
  category: string
  audience: NoticeAudience
  date: string
  createdBy: string
}

export type StudyNote = {
  id: string
  title: string
  subject: string
  summary: string
  postedOn: string
  postedBy: string
  attachment?: Attachment
}

export type QuestionSet = {
  id: string
  subject: string
  chapter: string
  questions: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  marks: number
  postedBy: string
  attachment?: Attachment
}

export type QuestionPaper = {
  id: string
  subject: string
  exam: string
  year: string
  marks: string
  duration: string
  postedBy: string
  attachment?: Attachment
}

// One conversation per student between their parent and the class teacher.
export type Message = {
  id: string
  studentId: string
  from: 'teacher' | 'parent'
  author: string
  text: string
  sentAt: string
}

export type TimetableKey = 'class-10A' | 'teacher' | 'school'

export type SchoolData = {
  version: number
  attendance: AttendanceRegister
  exams: Exam[]
  marks: MarksBook
  homework: Homework[]
  submissions: SubmissionBook
  payments: Payment[]
  notices: Notice[]
  notes: StudyNote[]
  questionSets: QuestionSet[]
  papers: QuestionPaper[]
  messages: Message[]
  timetables: Record<TimetableKey, TimetableEntry[]>
}

export const DATA_VERSION = 2
export const ACADEMIC_YEAR = '2026'
export const PASS_PERCENT = 35
export const LOW_ATTENDANCE_PERCENT = 75

export const CLASSES: ClassId[] = ['10A', '10B']

export const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'Computer Science']

export const ROSTER: RosterStudent[] = [
  { id: 'STU101', name: 'John Smith', classId: '10A', rollNo: 1, parentName: 'Anna Smith', parentPhone: '+91 98200 11101' },
  { id: 'STU102', name: 'Emma Wilson', classId: '10A', rollNo: 2, parentName: 'Laura Wilson', parentPhone: '+91 98200 11102' },
  { id: 'STU103', name: 'Michael Brown', classId: '10A', rollNo: 3, parentName: 'David Brown', parentPhone: '+91 98200 11103' },
  { id: 'STU104', name: 'Sarah Davis', classId: '10A', rollNo: 4, parentName: 'Maria Davis', parentPhone: '+91 98200 11104' },
  { id: 'STU105', name: 'James Miller', classId: '10A', rollNo: 5, parentName: 'Robert Miller', parentPhone: '+91 98200 11105' },
  { id: 'STU106', name: 'Lisa Anderson', classId: '10A', rollNo: 6, parentName: 'Monica Anderson', parentPhone: '+91 98200 11106' },
  { id: 'STU107', name: 'Noah Patel', classId: '10A', rollNo: 7, parentName: 'Kiran Patel', parentPhone: '+91 98200 11107' },
  { id: 'STU001', name: 'Alex Johnson', classId: '10A', rollNo: 12, parentName: 'Emily Johnson', parentPhone: '+91 98200 11112' },
  { id: 'STU201', name: 'Priya Nair', classId: '10B', rollNo: 1, parentName: 'Suresh Nair', parentPhone: '+91 98200 22201' },
  { id: 'STU202', name: 'Rohan Mehta', classId: '10B', rollNo: 2, parentName: 'Neha Mehta', parentPhone: '+91 98200 22202' },
  { id: 'STU203', name: 'Olivia Clark', classId: '10B', rollNo: 3, parentName: 'Henry Clark', parentPhone: '+91 98200 22203' },
  { id: 'STU204', name: 'Ethan Lewis', classId: '10B', rollNo: 4, parentName: 'Grace Lewis', parentPhone: '+91 98200 22204' },
  { id: 'STU205', name: 'Mia Robinson', classId: '10B', rollNo: 5, parentName: 'Paul Robinson', parentPhone: '+91 98200 22205' },
  { id: 'STU206', name: 'Arjun Singh', classId: '10B', rollNo: 6, parentName: 'Harpreet Singh', parentPhone: '+91 98200 22206' },
]

export const HOLIDAYS: Record<string, string> = {
  '2026-08-15': 'Independence Day',
  '2026-08-28': 'Raksha Bandhan',
  '2026-09-14': 'Ganesh Chaturthi',
  '2026-10-02': 'Gandhi Jayanti',
  '2026-10-20': 'Dussehra',
  '2026-11-09': 'Diwali',
}

export const TERM_START = '2026-06-15'

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const INSTALLMENTS: Installment[] = MONTHS.map((month, i) => ({
  id: `TUI-${String(i + 1).padStart(2, '0')}`,
  label: `${month} Tuition`,
  dueDate: `${ACADEMIC_YEAR}-${String(i + 1).padStart(2, '0')}-10`,
  amount: 5000,
}))

export const PAYMENT_METHODS: PaymentMethod[] = ['UPI', 'Cash', 'Card', 'Bank Transfer', 'Cheque']

export const NOTICE_CATEGORIES = ['academic', 'admission', 'holiday', 'sports', 'general', 'facility']

export const NOTICE_AUDIENCE_LABELS: Record<NoticeAudience, string> = {
  everyone: 'Everyone',
  students: 'Students',
  parents: 'Parents',
  staff: 'Staff only',
}

// Which notices a viewer gets: public pages see "everyone", portals also see their own audience.
export function noticesFor(notices: Notice[], viewer: NoticeAudience) {
  return notices
    .filter((n) => n.audience === 'everyone' || n.audience === viewer || viewer === 'staff')
    .sort((a, b) => b.date.localeCompare(a.date))
}

/* ---------------------------------- dates --------------------------------- */

// Local-time ISO date (toISOString would shift the day in IST).
export function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function parseISODate(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO() {
  return toISODate(new Date())
}

export function addDays(iso: string, days: number) {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function daysBetween(fromISO: string, toISO: string) {
  return Math.round((parseISODate(toISO).getTime() - parseISODate(fromISO).getTime()) / 86_400_000)
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return parseISODate(iso).toLocaleDateString('en-IN', opts)
}

export function isWeekend(iso: string) {
  const day = parseISODate(iso).getDay()
  return day === 0 || day === 6
}

export function isSchoolDay(iso: string) {
  return !isWeekend(iso) && !HOLIDAYS[iso]
}

export function schoolDaysBetween(fromISO: string, toISO: string) {
  const days: string[] = []
  for (let d = fromISO; d <= toISO; d = addDays(d, 1)) {
    if (isSchoolDay(d)) days.push(d)
  }
  return days
}

export function formatINR(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`
}

/* --------------------------------- grading -------------------------------- */

export function gradeFor(percent: number) {
  if (percent >= 90) return 'A+'
  if (percent >= 80) return 'A'
  if (percent >= 70) return 'B+'
  if (percent >= 60) return 'B'
  if (percent >= 50) return 'C'
  if (percent >= PASS_PERCENT) return 'D'
  return 'F'
}

export const GRADE_STYLES: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  A: 'bg-green-100 text-green-700 border-green-200',
  'B+': 'bg-teal-100 text-teal-700 border-teal-200',
  B: 'bg-blue-100 text-blue-700 border-blue-200',
  C: 'bg-amber-100 text-amber-700 border-amber-200',
  D: 'bg-orange-100 text-orange-700 border-orange-200',
  F: 'bg-rose-100 text-rose-700 border-rose-200',
}

export function remarkFor(percent: number) {
  if (percent >= 90) return 'Outstanding performance'
  if (percent >= 80) return 'Excellent work'
  if (percent >= 70) return 'Very good, keep it up'
  if (percent >= 60) return 'Good, room to grow'
  if (percent >= 50) return 'Satisfactory'
  if (percent >= PASS_PERCENT) return 'Needs more practice'
  return 'Needs attention'
}

/* ------------------------------ derived views ----------------------------- */

export function studentsIn(classId: ClassId) {
  return ROSTER.filter((s) => s.classId === classId).sort((a, b) => a.rollNo - b.rollNo)
}

export function findStudent(id: string) {
  return ROSTER.find((s) => s.id === id)
}

export type AttendanceSummary = {
  present: number
  absent: number
  late: number
  leave: number
  marked: number
  percent: number
}

export function summarizeAttendance(register: AttendanceRegister, studentId: string, fromISO?: string, toISO?: string): AttendanceSummary {
  const summary = { present: 0, absent: 0, late: 0, leave: 0, marked: 0, percent: 0 }
  for (const [date, day] of Object.entries(register)) {
    if ((fromISO && date < fromISO) || (toISO && date > toISO)) continue
    const status = day[studentId]
    if (!status) continue
    summary[status]++
    summary.marked++
  }
  // Late counts as attended; approved leave is excluded from the denominator.
  const counted = summary.marked - summary.leave
  summary.percent = counted > 0 ? Math.round(((summary.present + summary.late) / counted) * 1000) / 10 : 100
  return summary
}

export type ExamResult = {
  subjects: { subject: string; marks: number | null; percent: number | null; grade: string | null }[]
  total: number
  maxTotal: number
  percent: number
  grade: string
  passed: boolean
  complete: boolean
}

export function examResult(marks: MarksBook, exam: Exam, studentId: string): ExamResult {
  const book = marks[exam.id] || {}
  let total = 0
  let maxTotal = 0
  let passed = true
  const subjects = SUBJECTS.map((subject) => {
    const value = book[subject]?.[studentId]
    if (value === undefined) return { subject, marks: null, percent: null, grade: null }
    const percent = Math.round((value / exam.maxMarks) * 1000) / 10
    total += value
    maxTotal += exam.maxMarks
    if (percent < PASS_PERCENT) passed = false
    return { subject, marks: value, percent, grade: gradeFor(percent) }
  })
  const percent = maxTotal > 0 ? Math.round((total / maxTotal) * 1000) / 10 : 0
  return {
    subjects,
    total,
    maxTotal,
    percent,
    grade: gradeFor(percent),
    passed: passed && maxTotal > 0,
    complete: subjects.every((s) => s.marks !== null),
  }
}

export function classRanking(marks: MarksBook, exam: Exam, classId: ClassId) {
  return studentsIn(classId)
    .map((s) => ({ student: s, result: examResult(marks, exam, s.id) }))
    .filter((r) => r.result.maxTotal > 0)
    .sort((a, b) => b.result.percent - a.result.percent)
}

export type FeeLine = Installment & { paid: number; balance: number; status: 'paid' | 'partial' | 'overdue' | 'upcoming' }

export function feeLedger(payments: Payment[], studentId: string, onDate = todayISO()) {
  const paidBy: Record<string, number> = {}
  const studentPayments = payments.filter((p) => p.studentId === studentId)
  for (const p of studentPayments) {
    for (const a of p.allocations) paidBy[a.installmentId] = (paidBy[a.installmentId] || 0) + a.amount
  }
  const lines: FeeLine[] = INSTALLMENTS.map((inst) => {
    const paid = Math.min(inst.amount, paidBy[inst.id] || 0)
    const balance = inst.amount - paid
    let status: FeeLine['status'] = 'upcoming'
    if (balance === 0) status = 'paid'
    else if (inst.dueDate < onDate) status = 'overdue'
    else if (paid > 0) status = 'partial'
    return { ...inst, paid, balance, status }
  })
  const total = lines.reduce((s, l) => s + l.amount, 0)
  const paid = lines.reduce((s, l) => s + l.paid, 0)
  const overdue = lines.filter((l) => l.status === 'overdue').reduce((s, l) => s + l.balance, 0)
  const lastPayment = studentPayments.sort((a, b) => b.date.localeCompare(a.date))[0]
  const status: 'cleared' | 'overdue' | 'on-track' = paid >= total ? 'cleared' : overdue > 0 ? 'overdue' : 'on-track'
  return { lines, total, paid, balance: total - paid, overdue, status, lastPayment, payments: studentPayments }
}

// Spread an amount over the oldest unpaid installments (or only the chosen ones).
export function allocatePayment(payments: Payment[], studentId: string, amount: number, onlyIds?: string[]) {
  const { lines } = feeLedger(payments, studentId)
  const allocations: Payment['allocations'] = []
  let remaining = amount
  for (const line of lines) {
    if (remaining <= 0) break
    if (line.balance <= 0) continue
    if (onlyIds && !onlyIds.includes(line.id)) continue
    const take = Math.min(line.balance, remaining)
    allocations.push({ installmentId: line.id, amount: take })
    remaining -= take
  }
  return { allocations, unallocated: remaining }
}

export type HomeworkStatus = 'pending' | 'overdue' | 'submitted' | 'late' | 'reviewed'

export function homeworkStatus(hw: Homework, submission: Submission | undefined, onDate = todayISO()): HomeworkStatus {
  if (submission?.reviewedAt) return 'reviewed'
  if (submission) return submission.submittedAt.slice(0, 10) > hw.dueDate ? 'late' : 'submitted'
  return hw.dueDate < onDate ? 'overdue' : 'pending'
}

export const HOMEWORK_STATUS_STYLES: Record<HomeworkStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-blue-100 text-blue-700' },
  overdue: { label: 'Overdue', className: 'bg-rose-100 text-rose-700' },
  submitted: { label: 'Submitted', className: 'bg-emerald-100 text-emerald-700' },
  late: { label: 'Submitted late', className: 'bg-amber-100 text-amber-700' },
  reviewed: { label: 'Reviewed', className: 'bg-violet-100 text-violet-700' },
}

export function csvEscape(value: string | number) {
  const s = String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/* ---------------------------------- seed ---------------------------------- */

// Deterministic pseudo-random number in [0, 1) from a string, so demo data is stable.
function hashRandom(key: string) {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  h ^= h >>> 13
  h = Math.imul(h, 0x5bd1e995)
  h ^= h >>> 15
  return (h >>> 0) / 4294967296
}

// Per-student "ability" drives realistic, varied marks and attendance.
const ABILITY: Record<string, number> = {
  STU101: 0.86, STU102: 0.95, STU103: 0.72, STU104: 0.83, STU105: 0.9, STU106: 0.64, STU107: 0.55, STU001: 0.93,
  STU201: 0.91, STU202: 0.68, STU203: 0.79, STU204: 0.47, STU205: 0.88, STU206: 0.74,
}

// How many monthly installments each student had paid before today (rest are open).
const MONTHS_PAID: Record<string, number> = {
  STU101: 10, STU102: 12, STU103: 8, STU104: 10, STU105: 9, STU106: 6, STU107: 7, STU001: 2,
  STU201: 12, STU202: 9, STU203: 10, STU204: 5, STU205: 10, STU206: 8,
}

export function buildSeedData(today = todayISO()): SchoolData {
  const yesterday = addDays(today, -1)

  // Attendance: every school day from term start up to yesterday.
  const attendance: AttendanceRegister = {}
  for (const date of schoolDaysBetween(TERM_START, yesterday)) {
    attendance[date] = {}
    for (const s of ROSTER) {
      const r = hashRandom(`${s.id}|${date}`)
      const absentRate = 0.02 + (1 - ABILITY[s.id]) * 0.18
      attendance[date][s.id] =
        r < absentRate ? 'absent' : r < absentRate + 0.04 ? 'late' : r > 0.985 ? 'leave' : 'present'
    }
  }

  const exams: Exam[] = [
    { id: 'UT1', name: 'Unit Test 1', maxMarks: 25, date: '2026-07-17', published: true },
    { id: 'MID', name: 'Mid-Term Examination', maxMarks: 100, date: '2026-09-18', published: true },
    { id: 'UT2', name: 'Unit Test 2', maxMarks: 25, date: '2026-10-06', published: false },
    { id: 'FIN', name: 'Final Examination', maxMarks: 100, date: '2027-02-26', published: false },
  ]

  const marks: MarksBook = {}
  for (const exam of exams) {
    if (exam.id === 'FIN') continue
    marks[exam.id] = {}
    SUBJECTS.forEach((subject, si) => {
      // Unit Test 2 is still being graded: only the first three subjects are in.
      if (exam.id === 'UT2' && si > 2) return
      marks[exam.id][subject] = {}
      for (const s of ROSTER) {
        const noise = (hashRandom(`${s.id}|${exam.id}|${subject}`) - 0.5) * 0.24
        const pct = Math.max(0.2, Math.min(1, ABILITY[s.id] + noise))
        marks[exam.id][subject][s.id] = Math.round(pct * exam.maxMarks)
      }
    })
  }

  const homework: Homework[] = [
    {
      id: 'HW-1', title: 'Quadratic equations – Exercise 4.3', subject: 'Mathematics', classId: '10A',
      description: 'Solve all questions from Exercise 4.3. Show every step and verify two answers by substitution.',
      assignedOn: addDays(today, -12), dueDate: addDays(today, -7), maxMarks: 20, assignedBy: 'Dr. Sarah Johnson',
      attachment: { name: 'exercise-4.3.pdf', size: '312.4 KB' },
    },
    {
      id: 'HW-2', title: 'Ohm’s law lab report', subject: 'Physics', classId: '10A',
      description: 'Write up the Ohm’s law experiment: aim, apparatus, observation table, V–I graph and conclusion.',
      assignedOn: addDays(today, -6), dueDate: addDays(today, -1), maxMarks: 25, assignedBy: 'Dr. James Wilson',
    },
    {
      id: 'HW-3', title: 'Essay: “The road not taken”', subject: 'English', classId: '10A',
      description: 'Write a 400-word reflective essay on the poem’s central metaphor and what it means to you.',
      assignedOn: addDays(today, -3), dueDate: addDays(today, 2), maxMarks: 20, assignedBy: 'Prof. Michael Brown',
    },
    {
      id: 'HW-4', title: 'Arithmetic progressions worksheet', subject: 'Mathematics', classId: '10A',
      description: 'Complete the attached worksheet (15 questions). Questions 11–15 are challenge problems.',
      assignedOn: addDays(today, -1), dueDate: addDays(today, 5), maxMarks: 15, assignedBy: 'Dr. Sarah Johnson',
      attachment: { name: 'ap-worksheet.pdf', size: '198.0 KB' },
    },
    {
      id: 'HW-5', title: 'Chemical reactions – balancing practice', subject: 'Chemistry', classId: '10B',
      description: 'Balance the 20 equations from page 14 and classify each reaction type.',
      assignedOn: addDays(today, -4), dueDate: addDays(today, 3), maxMarks: 20, assignedBy: 'Dr. Lisa Miller',
    },
  ]

  const submissions: SubmissionBook = {}
  for (const hw of homework) {
    submissions[hw.id] = {}
    for (const s of studentsIn(hw.classId)) {
      const r = hashRandom(`${s.id}|${hw.id}`)
      const pastDue = hw.dueDate < today
      const willSubmit = r < (pastDue ? 0.6 + ABILITY[s.id] * 0.35 : 0.25 + ABILITY[s.id] * 0.2)
      if (!willSubmit && s.id !== 'STU001') continue
      if (s.id === 'STU001' && (hw.id === 'HW-3' || hw.id === 'HW-4')) continue // Alex still has these to do
      const offset = Math.floor(r * 5)
      const submittedOn = pastDue ? addDays(hw.dueDate, r > 0.82 ? 1 : -offset) : addDays(hw.assignedOn, Math.min(offset, daysBetween(hw.assignedOn, today)))
      const sub: Submission = {
        submittedAt: `${submittedOn}T${String(16 + Math.floor(r * 5)).padStart(2, '0')}:30:00`,
        answer: 'Completed – please see the attached work.',
        attachment: { name: `${s.name.split(' ')[0].toLowerCase()}-${hw.id.toLowerCase()}.pdf`, size: `${(200 + r * 900).toFixed(1)} KB` },
      }
      if (hw.id === 'HW-1') {
        sub.score = Math.round(Math.min(1, ABILITY[s.id] + (r - 0.5) * 0.2) * hw.maxMarks)
        sub.feedback = sub.score >= hw.maxMarks * 0.8 ? 'Neat working and correct method. Well done!' : 'Check your factorisation steps in Q4 and Q7.'
        sub.reviewedAt = `${addDays(hw.dueDate, 2)}T10:00:00`
      }
      submissions[hw.id][s.id] = sub
    }
  }

  const payments: Payment[] = []
  let receiptSeq = 1
  for (const s of ROSTER) {
    const months = MONTHS_PAID[s.id]
    for (let i = 0; i < months; i++) {
      const inst = INSTALLMENTS[i]
      const r = hashRandom(`${s.id}|pay|${i}`)
      const date = addDays(inst.dueDate, Math.floor(r * 9) - 6)
      if (date >= today) break
      payments.push({
        id: `PAY-${s.id}-${i}`,
        receiptNo: `RCP-${ACADEMIC_YEAR}-${String(receiptSeq++).padStart(4, '0')}`,
        studentId: s.id,
        amount: inst.amount,
        date,
        method: PAYMENT_METHODS[Math.floor(r * 3)],
        reference: `UTR${Math.floor(hashRandom(`${s.id}|utr|${i}`) * 1e10).toString().padStart(10, '0')}`,
        allocations: [{ installmentId: inst.id, amount: inst.amount }],
        receivedBy: 'Mr. Rajesh Kumar',
      })
    }
  }
  payments.sort((a, b) => a.date.localeCompare(b.date))
  payments.forEach((p, i) => (p.receiptNo = `RCP-${ACADEMIC_YEAR}-${String(i + 1).padStart(4, '0')}`))

  return { version: DATA_VERSION, attendance, exams, marks, homework, submissions, payments, ...buildContentSeed(today) }
}

/* Notices, study material, messages and timetables – added in data version 2. */
export function buildContentSeed(today = todayISO()) {
  const notices: Notice[] = [
    { id: 'NOT-1', title: 'Unit Test 2 results coming soon', content: 'Unit Test 2 marks are being entered by subject teachers. Report cards will be published on the portal once every subject is complete.', priority: 'medium', category: 'academic', audience: 'everyone', date: addDays(today, -1), createdBy: 'Principal' },
    { id: 'NOT-2', title: 'Parent-Teacher Meeting', content: 'PTM for Classes 10A and 10B is on Saturday from 10 AM to 1 PM. Please book a slot with the class teacher through the portal messages.', priority: 'high', category: 'general', audience: 'parents', date: addDays(today, -2), createdBy: 'Principal' },
    { id: 'NOT-3', title: 'Dussehra holiday', content: 'The school will remain closed on 20 October for Dussehra. Classes resume the next day as per the regular timetable.', priority: 'medium', category: 'holiday', audience: 'everyone', date: addDays(today, -3), createdBy: 'Principal' },
    { id: 'NOT-4', title: 'Fee reminder – October tuition', content: 'October tuition fees are due on the 10th. Fees can be paid online from the parent portal or at the accounts office.', priority: 'high', category: 'general', audience: 'parents', date: addDays(today, -5), createdBy: 'Accounts Office' },
    { id: 'NOT-5', title: 'Inter-school sports registration', content: 'Registration for the inter-school athletics meet is open. Interested students should give their names to the sports department by Friday.', priority: 'low', category: 'sports', audience: 'students', date: addDays(today, -6), createdBy: 'Sports Dept' },
    { id: 'NOT-6', title: 'Science lab upgraded', content: 'The physics and chemistry labs now have new equipment. Lab sessions follow the timetable from next week.', priority: 'low', category: 'facility', audience: 'everyone', date: addDays(today, -9), createdBy: 'Principal' },
    { id: 'NOT-7', title: 'Admissions open for 2027-28', content: 'Online admission for the next academic year has started. Visit the admissions page to apply and upload documents.', priority: 'medium', category: 'admission', audience: 'everyone', date: addDays(today, -12), createdBy: 'Admissions Office' },
    { id: 'NOT-8', title: 'Staff meeting on Friday', content: 'All teachers are requested to attend the staff meeting on Friday after P5 in the conference room to review Unit Test 2 marks entry.', priority: 'medium', category: 'general', audience: 'staff', date: addDays(today, -1), createdBy: 'Principal' },
  ]

  const notes: StudyNote[] = [
    { id: 'NOTE-1', title: 'Quadratic equations – formula sheet', subject: 'Mathematics', summary: 'All standard forms, the discriminant and nature of roots on one page.', postedOn: addDays(today, -4), postedBy: 'Dr. Sarah Johnson', attachment: { name: 'quadratics-formula-sheet.pdf', size: '410.2 KB' } },
    { id: 'NOTE-2', title: 'Electricity – handwritten notes', subject: 'Physics', summary: 'Ohm’s law, resistance in series and parallel, power and heating effect.', postedOn: addDays(today, -7), postedBy: 'Dr. James Wilson', attachment: { name: 'electricity-notes.pdf', size: '2.4 MB' } },
    { id: 'NOTE-3', title: 'Chemical reactions summary', subject: 'Chemistry', summary: 'Types of reactions with one balanced example each.', postedOn: addDays(today, -9), postedBy: 'Dr. Lisa Miller', attachment: { name: 'reactions-summary.pdf', size: '1.1 MB' } },
    { id: 'NOTE-4', title: '“The road not taken” – analysis', subject: 'English', summary: 'Theme, imagery and line-by-line explanation for the essay homework.', postedOn: addDays(today, -3), postedBy: 'Prof. Michael Brown', attachment: { name: 'road-not-taken.pdf', size: '820.5 KB' } },
  ]

  const questionSets: QuestionSet[] = [
    { id: 'QS-1', subject: 'Mathematics', chapter: 'Quadratic Equations', questions: ['Find the nature of roots using the discriminant', 'Solve by completing the square', 'Word problems on speed and area'], difficulty: 'Hard', marks: 8, postedBy: 'Dr. Sarah Johnson' },
    { id: 'QS-2', subject: 'Physics', chapter: 'Electricity', questions: ['Derive the formula for resistors in parallel', 'State and verify Ohm’s law', 'Numericals on electric power and energy'], difficulty: 'Medium', marks: 6, postedBy: 'Dr. James Wilson' },
    { id: 'QS-3', subject: 'Chemistry', chapter: 'Chemical Reactions and Equations', questions: ['Balance and classify the given reactions', 'Explain corrosion and rancidity with examples'], difficulty: 'Medium', marks: 5, postedBy: 'Dr. Lisa Miller' },
    { id: 'QS-4', subject: 'English', chapter: 'Poetry – The Road Not Taken', questions: ['Explain the central metaphor of the poem', 'What does the poet mean by “that has made all the difference”?'], difficulty: 'Easy', marks: 4, postedBy: 'Prof. Michael Brown' },
  ]

  const papers: QuestionPaper[] = [
    { id: 'QP-1', subject: 'Mathematics', exam: 'Mid-Term Examination', year: '2026', marks: '100 Marks', duration: '3 Hours', postedBy: 'Dr. Sarah Johnson', attachment: { name: 'maths-midterm-2026.pdf', size: '640.0 KB' } },
    { id: 'QP-2', subject: 'Physics', exam: 'Final Examination', year: '2025', marks: '100 Marks', duration: '3 Hours', postedBy: 'Dr. James Wilson', attachment: { name: 'physics-final-2025.pdf', size: '702.3 KB' } },
    { id: 'QP-3', subject: 'Chemistry', exam: 'Mid-Term Examination', year: '2026', marks: '100 Marks', duration: '3 Hours', postedBy: 'Dr. Lisa Miller', attachment: { name: 'chemistry-midterm-2026.pdf', size: '588.9 KB' } },
    { id: 'QP-4', subject: 'English', exam: 'Unit Test 1', year: '2026', marks: '25 Marks', duration: '1 Hour', postedBy: 'Prof. Michael Brown', attachment: { name: 'english-ut1-2026.pdf', size: '215.4 KB' } },
  ]

  const at = (daysAgo: number, time: string) => `${addDays(today, -daysAgo)}T${time}`
  const messages: Message[] = [
    { id: 'MSG-1', studentId: 'STU001', from: 'teacher', author: 'Dr. Sarah Johnson', text: 'Alex did very well in the Mid-Term – 92.2% and rank 2 in class. Please make sure the October fee is cleared before the PTM.', sentAt: at(3, '15:10:00') },
    { id: 'MSG-2', studentId: 'STU001', from: 'parent', author: 'Emily Johnson', text: 'Thank you! We will pay this week. Could you suggest extra practice for English?', sentAt: at(3, '19:42:00') },
    { id: 'MSG-3', studentId: 'STU001', from: 'teacher', author: 'Dr. Sarah Johnson', text: 'Sure – I have shared the English analysis notes on the portal. The essay homework is a good start.', sentAt: at(2, '08:05:00') },
    { id: 'MSG-4', studentId: 'STU101', from: 'parent', author: 'Anna Smith', text: 'Thanks for the progress update. We will work on homework this week.', sentAt: at(1, '18:20:00') },
    { id: 'MSG-5', studentId: 'STU102', from: 'parent', author: 'Laura Wilson', text: 'Please share extra practice material for the next test.', sentAt: at(0, '07:45:00') },
    { id: 'MSG-6', studentId: 'STU106', from: 'teacher', author: 'Dr. Sarah Johnson', text: 'Lisa has missed a few classes recently and has overdue homework. Can we talk at the PTM?', sentAt: at(1, '12:30:00') },
  ]

  return {
    notices,
    notes,
    questionSets,
    papers,
    messages,
    timetables: {
      'class-10A': classTimetable.map((e) => ({ ...e })),
      teacher: teacherTimetable.map((e) => ({ ...e })),
      school: schoolTimetable.map((e) => ({ ...e })),
    } as Record<TimetableKey, TimetableEntry[]>,
  }
}
