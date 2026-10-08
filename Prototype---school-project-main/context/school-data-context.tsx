'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  ACADEMIC_YEAR,
  AttendanceStatus,
  Attachment,
  DATA_VERSION,
  Exam,
  Homework,
  Payment,
  PaymentMethod,
  Message,
  Notice,
  QuestionPaper,
  QuestionSet,
  SchoolData,
  StudyNote,
  TimetableKey,
  allocatePayment,
  buildContentSeed,
  buildSeedData,
  todayISO,
} from '@/lib/school-data'
import { TimetableEntry } from '@/lib/timetable-data'

const STORAGE_KEY = 'edupro-school-data'

type NewHomework = Omit<Homework, 'id' | 'assignedOn'>

interface SchoolDataContextType {
  data: SchoolData
  // attendance
  setAttendance: (date: string, studentId: string, status: AttendanceStatus) => void
  setAttendanceBulk: (date: string, entries: Record<string, AttendanceStatus>) => void
  // results
  setMark: (examId: string, subject: string, studentId: string, marks: number | null) => void
  setExamPublished: (examId: string, published: boolean) => void
  addExam: (exam: Omit<Exam, 'id' | 'published'>) => void
  // homework
  addHomework: (hw: NewHomework) => void
  deleteHomework: (id: string) => void
  submitHomework: (homeworkId: string, studentId: string, answer: string, attachment?: Attachment) => void
  reviewSubmission: (homeworkId: string, studentId: string, score: number, feedback: string) => void
  // fees
  recordPayment: (p: { studentId: string; amount: number; method: PaymentMethod; reference: string; date?: string; installmentIds?: string[]; receivedBy: string }) => Payment | null
  // notices
  addNotice: (n: Omit<Notice, 'id' | 'date'>) => void
  deleteNotice: (id: string) => void
  // study material
  addNote: (n: Omit<StudyNote, 'id' | 'postedOn'>) => void
  addQuestionSet: (q: Omit<QuestionSet, 'id'>) => void
  addPaper: (p: Omit<QuestionPaper, 'id'>) => void
  deleteMaterial: (kind: 'notes' | 'questionSets' | 'papers', id: string) => void
  // messages
  sendMessage: (m: Omit<Message, 'id' | 'sentAt'>) => void
  // timetables
  updateTimetableSlot: (key: TimetableKey, day: string, period: string, patch: Partial<Pick<TimetableEntry, 'subject' | 'teacher' | 'room'>>) => void
  resetDemoData: () => void
}

const SchoolDataContext = createContext<SchoolDataContextType | undefined>(undefined)

function loadStored(): SchoolData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SchoolData
    if (parsed.version === DATA_VERSION) return parsed
    // Version 1 had no notices, material, messages or timetables: keep its records and add those.
    if (parsed.version === 1) return { ...buildContentSeed(), ...parsed, version: DATA_VERSION }
    return null
  } catch {
    return null
  }
}

export function SchoolDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SchoolData>(() => buildSeedData())
  // Persisting starts only after the stored copy is loaded, so the seed never overwrites it.
  const [hydrated, setHydrated] = useState(false)
  // Skip writing back a change that just arrived from another tab.
  const fromOtherTab = useRef(false)

  useEffect(() => {
    const stored = loadStored()
    if (stored) setData(stored)
    setHydrated(true)

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try {
        fromOtherTab.current = true
        setData(JSON.parse(e.newValue))
      } catch {
        fromOtherTab.current = false
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (fromOtherTab.current) {
      fromOtherTab.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Storage full or unavailable – the app keeps working in memory.
    }
  }, [data, hydrated])

  const setAttendance = useCallback((date: string, studentId: string, status: AttendanceStatus) => {
    setData((d) => ({ ...d, attendance: { ...d.attendance, [date]: { ...d.attendance[date], [studentId]: status } } }))
  }, [])

  const setAttendanceBulk = useCallback((date: string, entries: Record<string, AttendanceStatus>) => {
    setData((d) => ({ ...d, attendance: { ...d.attendance, [date]: { ...d.attendance[date], ...entries } } }))
  }, [])

  const setMark = useCallback((examId: string, subject: string, studentId: string, marks: number | null) => {
    setData((d) => {
      const exam = { ...(d.marks[examId] || {}) }
      const subjectMarks = { ...(exam[subject] || {}) }
      if (marks === null) delete subjectMarks[studentId]
      else subjectMarks[studentId] = marks
      exam[subject] = subjectMarks
      return { ...d, marks: { ...d.marks, [examId]: exam } }
    })
  }, [])

  const setExamPublished = useCallback((examId: string, published: boolean) => {
    setData((d) => ({ ...d, exams: d.exams.map((e) => (e.id === examId ? { ...e, published } : e)) }))
  }, [])

  const addExam = useCallback((exam: Omit<Exam, 'id' | 'published'>) => {
    setData((d) => ({ ...d, exams: [...d.exams, { ...exam, id: `EX-${Date.now()}`, published: false }] }))
  }, [])

  const addHomework = useCallback((hw: NewHomework) => {
    setData((d) => ({ ...d, homework: [{ ...hw, id: `HW-${Date.now()}`, assignedOn: todayISO() }, ...d.homework] }))
  }, [])

  const deleteHomework = useCallback((id: string) => {
    setData((d) => {
      const { [id]: _removed, ...submissions } = d.submissions
      return { ...d, homework: d.homework.filter((h) => h.id !== id), submissions }
    })
  }, [])

  const submitHomework = useCallback((homeworkId: string, studentId: string, answer: string, attachment?: Attachment) => {
    const now = new Date()
    const submittedAt = `${todayISO()}T${now.toTimeString().slice(0, 8)}`
    setData((d) => ({
      ...d,
      submissions: {
        ...d.submissions,
        [homeworkId]: { ...d.submissions[homeworkId], [studentId]: { submittedAt, answer, attachment } },
      },
    }))
  }, [])

  const reviewSubmission = useCallback((homeworkId: string, studentId: string, score: number, feedback: string) => {
    setData((d) => {
      const existing = d.submissions[homeworkId]?.[studentId]
      if (!existing) return d
      return {
        ...d,
        submissions: {
          ...d.submissions,
          [homeworkId]: {
            ...d.submissions[homeworkId],
            [studentId]: { ...existing, score, feedback, reviewedAt: new Date().toISOString() },
          },
        },
      }
    })
  }, [])

  // Computed against the latest state synchronously so the caller gets the receipt back.
  const dataRef = useRef(data)
  dataRef.current = data

  const recordPayment: SchoolDataContextType['recordPayment'] = useCallback((p) => {
    const current = dataRef.current
    const { allocations } = allocatePayment(current.payments, p.studentId, p.amount, p.installmentIds)
    if (allocations.length === 0) return null
    const allocated = allocations.reduce((s, a) => s + a.amount, 0)
    const payment: Payment = {
      id: `PAY-${Date.now()}`,
      receiptNo: `RCP-${ACADEMIC_YEAR}-${String(current.payments.length + 1).padStart(4, '0')}`,
      studentId: p.studentId,
      amount: allocated,
      date: p.date || todayISO(),
      method: p.method,
      reference: p.reference,
      allocations,
      receivedBy: p.receivedBy,
    }
    const next = { ...current, payments: [...current.payments, payment] }
    dataRef.current = next
    setData(next)
    return payment
  }, [])

  const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  const addNotice = useCallback((n: Omit<Notice, 'id' | 'date'>) => {
    setData((d) => ({ ...d, notices: [{ ...n, id: newId('NOT'), date: todayISO() }, ...d.notices] }))
  }, [])

  const deleteNotice = useCallback((id: string) => {
    setData((d) => ({ ...d, notices: d.notices.filter((n) => n.id !== id) }))
  }, [])

  const addNote = useCallback((n: Omit<StudyNote, 'id' | 'postedOn'>) => {
    setData((d) => ({ ...d, notes: [{ ...n, id: newId('NOTE'), postedOn: todayISO() }, ...d.notes] }))
  }, [])

  const addQuestionSet = useCallback((q: Omit<QuestionSet, 'id'>) => {
    setData((d) => ({ ...d, questionSets: [{ ...q, id: newId('QS') }, ...d.questionSets] }))
  }, [])

  const addPaper = useCallback((p: Omit<QuestionPaper, 'id'>) => {
    setData((d) => ({ ...d, papers: [{ ...p, id: newId('QP') }, ...d.papers] }))
  }, [])

  const deleteMaterial = useCallback((kind: 'notes' | 'questionSets' | 'papers', id: string) => {
    setData((d) => ({ ...d, [kind]: (d[kind] as { id: string }[]).filter((x) => x.id !== id) }))
  }, [])

  const sendMessage = useCallback((m: Omit<Message, 'id' | 'sentAt'>) => {
    const sentAt = `${todayISO()}T${new Date().toTimeString().slice(0, 8)}`
    setData((d) => ({ ...d, messages: [...d.messages, { ...m, id: newId('MSG'), sentAt }] }))
  }, [])

  const updateTimetableSlot = useCallback((key: TimetableKey, day: string, period: string, patch: Partial<Pick<TimetableEntry, 'subject' | 'teacher' | 'room'>>) => {
    setData((d) => ({
      ...d,
      timetables: { ...d.timetables, [key]: d.timetables[key].map((e) => (e.day === day && e.period === period ? { ...e, ...patch } : e)) },
    }))
  }, [])

  const resetDemoData = useCallback(() => {
    setData(buildSeedData())
  }, [])

  const value = useMemo(
    () => ({
      data,
      setAttendance,
      setAttendanceBulk,
      setMark,
      setExamPublished,
      addExam,
      addHomework,
      deleteHomework,
      submitHomework,
      reviewSubmission,
      recordPayment,
      addNotice,
      deleteNotice,
      addNote,
      addQuestionSet,
      addPaper,
      deleteMaterial,
      sendMessage,
      updateTimetableSlot,
      resetDemoData,
    }),
    [data, setAttendance, setAttendanceBulk, setMark, setExamPublished, addExam, addHomework, deleteHomework, submitHomework, reviewSubmission, recordPayment, addNotice, deleteNotice, addNote, addQuestionSet, addPaper, deleteMaterial, sendMessage, updateTimetableSlot, resetDemoData]
  )

  return <SchoolDataContext.Provider value={value}>{children}</SchoolDataContext.Provider>
}

export function useSchoolData() {
  const context = useContext(SchoolDataContext)
  if (!context) throw new Error('useSchoolData must be used within a SchoolDataProvider')
  return context
}
