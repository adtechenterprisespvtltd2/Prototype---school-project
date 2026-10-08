// "What's new" feed for the notification bell and the parent overview.
// Everything is derived from the shared school records, so nothing extra is stored.

import {
  ClassId,
  INSTALLMENTS,
  SchoolData,
  addDays,
  feeLedger,
  findStudent,
  formatDate,
  formatINR,
  homeworkStatus,
  noticesFor,
  studentsIn,
  todayISO,
} from './school-data'

export type UpdateKind = 'homework' | 'result' | 'attendance' | 'notice' | 'message' | 'fee' | 'submission'

export type Update = {
  id: string
  kind: UpdateKind
  title: string
  detail: string
  at: string // ISO date or date-time, used for sorting and unread state
  tab: string // portal tab to open
  urgent?: boolean
}

const RECENT_DAYS = 14

function newestFirst(list: Update[]) {
  return list.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 25)
}

function sharedStudentUpdates(data: SchoolData, studentId: string, audience: 'students' | 'parents', tabs: { homework: string; results: string; notices: string }) {
  const student = findStudent(studentId)
  if (!student) return []
  const today = todayISO()
  const since = addDays(today, -RECENT_DAYS)
  const first = student.name.split(' ')[0]
  const updates: Update[] = []

  for (const hw of data.homework.filter((h) => h.classId === student.classId)) {
    const sub = data.submissions[hw.id]?.[studentId]
    const status = homeworkStatus(hw, sub)
    if (hw.assignedOn >= since) {
      updates.push({
        id: `hw-${hw.id}`,
        kind: 'homework',
        title: `New homework: ${hw.title}`,
        detail: `${hw.subject} · due ${formatDate(hw.dueDate, { day: 'numeric', month: 'short' })}${audience === 'parents' && sub ? ` · ${first} has handed it in` : ''}`,
        at: hw.assignedOn,
        tab: tabs.homework,
      })
    }
    if (status === 'pending' && hw.dueDate <= addDays(today, 1)) {
      updates.push({
        id: `hw-due-${hw.id}`,
        kind: 'homework',
        title: `${hw.dueDate === today ? 'Due today' : 'Due tomorrow'}: ${hw.title}`,
        detail: audience === 'parents' ? `${first} has not handed it in yet` : 'Not handed in yet',
        at: `${today}T00:00:01`,
        tab: tabs.homework,
        urgent: true,
      })
    }
    if (sub?.reviewedAt && sub.reviewedAt.slice(0, 10) >= since) {
      updates.push({
        id: `hw-rev-${hw.id}`,
        kind: 'homework',
        title: `Homework graded: ${sub.score}/${hw.maxMarks}`,
        detail: `${hw.title}${sub.feedback ? ` – “${sub.feedback}”` : ''}`,
        at: sub.reviewedAt,
        tab: tabs.homework,
      })
    }
  }

  for (const exam of data.exams.filter((e) => e.published && data.marks[e.id])) {
    updates.push({
      id: `exam-${exam.id}`,
      kind: 'result',
      title: `Results published: ${exam.name}`,
      detail: audience === 'parents' ? `${first}'s report card is ready` : 'Your report card is ready',
      at: exam.date,
      tab: tabs.results,
    })
  }

  for (const n of noticesFor(data.notices, audience).filter((n) => n.date >= since)) {
    updates.push({ id: `notice-${n.id}`, kind: 'notice', title: n.title, detail: `Notice from ${n.createdBy}`, at: n.date, tab: tabs.notices, urgent: n.priority === 'high' })
  }
  return updates
}

export function studentUpdates(data: SchoolData, studentId: string): Update[] {
  return newestFirst(sharedStudentUpdates(data, studentId, 'students', { homework: 'homework', results: 'grades', notices: 'notices' }))
}

export function parentUpdates(data: SchoolData, studentId: string): Update[] {
  const student = findStudent(studentId)
  if (!student) return []
  const first = student.name.split(' ')[0]
  const today = todayISO()
  const since = addDays(today, -RECENT_DAYS)
  const updates = sharedStudentUpdates(data, studentId, 'parents', { homework: 'homework', results: 'reportcard', notices: 'notices' })

  for (const [date, day] of Object.entries(data.attendance)) {
    const status = day[studentId]
    if (date < since || (status !== 'absent' && status !== 'late')) continue
    updates.push({
      id: `att-${date}`,
      kind: 'attendance',
      title: `${first} was ${status === 'absent' ? 'absent' : 'late'}`,
      detail: formatDate(date, { weekday: 'long', day: 'numeric', month: 'short' }),
      at: date,
      tab: 'attendance',
      urgent: status === 'absent',
    })
  }

  for (const m of data.messages.filter((m) => m.studentId === studentId && m.from === 'teacher' && m.sentAt.slice(0, 10) >= since)) {
    updates.push({ id: `msg-${m.id}`, kind: 'message', title: `Message from ${m.author}`, detail: m.text, at: m.sentAt, tab: 'messages' })
  }

  const ledger = feeLedger(data.payments, studentId)
  if (ledger.overdue > 0) {
    const months = ledger.lines.filter((l) => l.status === 'overdue').length
    updates.push({
      id: `fee-overdue-${ledger.overdue}`,
      kind: 'fee',
      title: `${formatINR(ledger.overdue)} fees overdue`,
      detail: `${months} month${months > 1 ? 's' : ''} pending – pay online from the Fees tab`,
      at: `${today}T00:00:00`,
      tab: 'fees',
      urgent: true,
    })
  }
  for (const p of ledger.payments.filter((p) => p.date >= since)) {
    const label = p.allocations.map((a) => INSTALLMENTS.find((i) => i.id === a.installmentId)?.label.replace(' Tuition', '')).join(', ')
    updates.push({ id: `pay-${p.id}`, kind: 'fee', title: `Payment received: ${formatINR(p.amount)}`, detail: `${label} · receipt ${p.receiptNo}`, at: p.date, tab: 'fees' })
  }
  return newestFirst(updates)
}

export function teacherUpdates(data: SchoolData, classId: ClassId): Update[] {
  const since = addDays(todayISO(), -RECENT_DAYS)
  const updates: Update[] = []
  for (const s of studentsIn(classId)) {
    const thread = data.messages.filter((m) => m.studentId === s.id).sort((a, b) => a.sentAt.localeCompare(b.sentAt))
    const last = thread[thread.length - 1]
    if (last?.from === 'parent') {
      updates.push({ id: `msg-${last.id}`, kind: 'message', title: `${s.parentName} is waiting for a reply`, detail: last.text, at: last.sentAt, tab: 'communication', urgent: true })
    }
  }
  for (const hw of data.homework.filter((h) => h.classId === classId)) {
    for (const [sid, sub] of Object.entries(data.submissions[hw.id] || {})) {
      if (sub.reviewedAt || sub.submittedAt.slice(0, 10) < since) continue
      updates.push({ id: `sub-${hw.id}-${sid}`, kind: 'submission', title: `${findStudent(sid)?.name} handed in homework`, detail: `${hw.title} – waiting for your review`, at: sub.submittedAt, tab: 'homework' })
    }
  }
  return newestFirst(updates)
}
