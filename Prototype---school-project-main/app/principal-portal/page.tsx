'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/header'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/context/auth-context'
import { Users, BookOpen, TrendingUp, Award, AlertCircle, BarChart3, Edit2, Eye, X, Filter, Bell, Plus, Trash2, ArrowLeft, CalendarRange, CalendarCheck2, GraduationCap, Wallet } from 'lucide-react'
import Link from 'next/link'
import TimetableView from '@/components/timetable-view'
import MobileTabs, { type MobileTab } from '@/components/mobile-tabs'
import { TimetableEntry, subjectColors } from '@/lib/timetable-data'
import { useSchoolData } from '@/context/school-data-context'
import { CLASSES, GRADE_STYLES, NOTICE_AUDIENCE_LABELS, NOTICE_CATEGORIES, NoticeAudience, NoticePriority, PASS_PERCENT, ROSTER, SUBJECTS, TimetableKey, examResult, feeLedger, formatINR, homeworkStatus, noticesFor, summarizeAttendance } from '@/lib/school-data'
import { AttendanceOverview } from '@/components/school/attendance'
import { ResultsOverview } from '@/components/school/results'
import { PaymentSheet } from '@/components/school/fees'

function PrincipalPortalContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const mobileTabs: MobileTab[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
    { id: 'results', label: 'Results', icon: GraduationCap },
    { id: 'fees', label: 'Fee Collection', icon: Wallet },
    { id: 'departments', label: 'Departments', icon: BookOpen },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'timetable', label: 'Timetable', icon: CalendarRange },
  ]
  const [showNewNotice, setShowNewNotice] = useState(false)
  const { data: shared, addNotice, deleteNotice, updateTimetableSlot } = useSchoolData()
  const emptyNotice = { title: '', content: '', priority: 'medium' as NoticePriority, category: 'general', audience: 'everyone' as NoticeAudience }
  const [noticeData, setNoticeData] = useState(emptyNotice)
  const notices = noticesFor(shared.notices, 'staff')

  const handleAddNotice = () => {
    if (noticeData.title.trim() && noticeData.content.trim()) {
      addNotice({ ...noticeData, title: noticeData.title.trim(), content: noticeData.content.trim(), createdBy: 'Principal' })
      setNoticeData(emptyNotice)
      setShowNewNotice(false)
    }
  }

  const handleDeleteNotice = (id: string) => {
    if (window.confirm('Delete this notice for everyone?')) deleteNotice(id)
  }

  // Timetable editing
  const timetableOptions: { key: TimetableKey; label: string; subtitle: string }[] = [
    { key: 'school', label: 'School overview', subtitle: 'Weekly schedule overview across all classes' },
    { key: 'class-10A', label: 'Class 10A', subtitle: 'Seen by Class 10A students and their parents' },
    { key: 'teacher', label: 'Dr. Sarah Johnson', subtitle: 'Seen by Dr. Sarah Johnson in the teacher portal' },
  ]
  const [timetableKey, setTimetableKey] = useState<TimetableKey>('class-10A')
  const [editingSlot, setEditingSlot] = useState<TimetableEntry | null>(null)
  const [slotForm, setSlotForm] = useState({ subject: '', teacher: '', room: '' })

  const openSlot = (entry: TimetableEntry) => {
    setEditingSlot(entry)
    setSlotForm({ subject: entry.subject, teacher: entry.teacher, room: entry.room })
  }

  const saveSlot = () => {
    if (!editingSlot || !slotForm.subject.trim()) return
    updateTimetableSlot(timetableKey, editingSlot.day, editingSlot.period, {
      subject: slotForm.subject.trim(),
      teacher: slotForm.teacher.trim() || '—',
      room: slotForm.room.trim() || '—',
    })
    setEditingSlot(null)
  }

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'from-red-500 to-red-600'
    if (priority === 'medium') return 'from-orange-500 to-orange-600'
    return 'from-blue-500 to-blue-600'
  }
  const data = shared
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [filterClass, setFilterClass] = useState('All')

  // Latest published exam drives every marks-based figure on this page.
  const latestExam = [...data.exams].filter((e) => e.published && data.marks[e.id]).sort((a, b) => b.date.localeCompare(a.date))[0]

  const allStudents = ROSTER.map((s) => {
    const result = latestExam ? examResult(data.marks, latestExam, s.id) : null
    const fees = feeLedger(data.payments, s.id)
    const homework = data.homework.filter((h) => h.classId === s.classId)
    const handedIn = homework.filter((h) => !['pending', 'overdue'].includes(homeworkStatus(h, data.submissions[h.id]?.[s.id]))).length
    return {
      ...s,
      class: s.classId,
      marks: result?.percent ?? 0,
      grade: result && result.maxTotal ? result.grade : '–',
      passed: result?.passed ?? false,
      attendance: summarizeAttendance(data.attendance, s.id).percent,
      fees,
      homeworkDone: homework.length ? Math.round((handedIn / homework.length) * 100) : 100,
    }
  })

  const average = (values: number[]) => (values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0)
  const graded = allStudents.filter((s) => s.grade !== '–')

  // Distinct teaching staff named in the timetables.
  const timetableEntries = [...data.timetables['class-10A'], ...data.timetables.school].filter((e) => e.teacher !== '—' && e.teacher !== 'All Faculty')
  const faculty = new Set(timetableEntries.map((e) => e.teacher))

  const stats = [
    { label: 'Total Students', value: allStudents.length, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Faculty Members', value: faculty.size, icon: BookOpen, color: 'from-purple-500 to-purple-600' },
    { label: 'Pass Rate', value: graded.length ? `${Math.round((graded.filter((s) => s.passed).length / graded.length) * 100)}%` : '–', icon: Award, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Average Percentage', value: graded.length ? `${average(graded.map((s) => s.marks))}%` : '–', icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
  ]

  // One department per subject: teachers from the timetable, pass rate from the latest exam.
  const departments = SUBJECTS.map((subject) => {
    const teachers = new Set(timetableEntries.filter((e) => e.subject.startsWith(subject)).map((e) => e.teacher))
    const scores = latestExam ? Object.values(data.marks[latestExam.id]?.[subject] || {}).map((m) => (m / latestExam.maxMarks) * 100) : []
    return {
      name: subject,
      students: allStudents.length,
      teachers: teachers.size || 1,
      passRate: scores.length ? Math.round((scores.filter((v) => v >= PASS_PERCENT).length / scores.length) * 100) : 0,
      average: average(scores),
    }
  })

  const classData = CLASSES.map((c) => {
    const members = allStudents.filter((s) => s.classId === c)
    return {
      class: `Class ${c}`,
      students: members.length,
      avgPercentage: average(members.filter((s) => s.grade !== '–').map((s) => s.marks)),
      attendance: average(members.map((s) => s.attendance)),
    }
  })

  const filteredStudents = filterClass === 'All' ? allStudents : allStudents.filter((s) => s.classId === filterClass)
  const selectedStudent = allStudents.find((s) => s.id === selectedStudentId) || null

  useEffect(() => {
    if (!selectedStudentId && !editingSlot) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setSelectedStudentId(null)
      setEditingSlot(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedStudentId, editingSlot])

  const getGradeColor = (marks: number) => {
    if (marks >= 90) return 'from-emerald-500 to-emerald-600'
    if (marks >= 80) return 'from-blue-500 to-blue-600'
    if (marks >= 70) return 'from-yellow-500 to-yellow-600'
    return 'from-red-500 to-red-600'
  }

  const feeBadge = {
    cleared: { label: 'Fees cleared', className: 'from-emerald-500 to-emerald-600' },
    'on-track': { label: 'Fees on track', className: 'from-blue-500 to-blue-600' },
    overdue: { label: 'Fees overdue', className: 'from-rose-500 to-rose-600' },
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <Header />

      {/* Hero Section */}
      <section className="relative py-8 sm:py-16 px-4 bg-gradient-to-r from-slate-900 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-8 right-10 w-80 h-80 bg-slate-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-2 sm:mb-3">Principal Dashboard</h1>
          <p className="text-blue-100 text-base sm:text-xl">Complete school overview and student management</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-16">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl border-2 border-blue-200 p-5 sm:p-8 mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">Welcome, {user?.name}</h2>
          <p className="text-slate-600 text-sm sm:text-lg">Here's an overview of your school's performance and key metrics.</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-14">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className={`bg-gradient-to-br ${stat.color} text-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2`}>
                <Icon size={40} className="mb-2 sm:mb-4 opacity-80 w-7 h-7 sm:w-10 sm:h-10" />
                <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-blue-100 font-semibold text-sm sm:text-base">{stat.label}</div>
              </div>
            )
          })}
        </div>

        <MobileTabs tabs={mobileTabs} active={activeTab} onChange={setActiveTab} />

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Tab Buttons */}
          <div className="hidden sm:flex border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-2 flex-wrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 min-w-fit px-6 py-4 font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 rounded-xl ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-slate-900 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <BarChart3 size={20} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex-1 min-w-fit px-6 py-4 font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 rounded-xl ${
                activeTab === 'students'
                  ? 'bg-gradient-to-r from-slate-900 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Users size={20} />
              Students
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 min-w-fit px-6 py-4 font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 rounded-xl ${
                activeTab === 'attendance'
                  ? 'bg-gradient-to-r from-slate-900 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <CalendarCheck2 size={20} />
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 min-w-fit px-6 py-4 font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 rounded-xl ${
                activeTab === 'results'
                  ? 'bg-gradient-to-r from-slate-900 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <GraduationCap size={20} />
              Results
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`flex-1 min-w-fit px-6 py-4 font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 rounded-xl ${
                activeTab === 'fees'
                  ? 'bg-gradient-to-r from-slate-900 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Wallet size={20} />
              Fee Collection
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`flex-1 min-w-fit px-6 py-4 font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 rounded-xl ${
                activeTab === 'departments'
                  ? 'bg-gradient-to-r from-slate-900 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <BookOpen size={20} />
              Departments
            </button>
<button
              onClick={() => setActiveTab('notices')}
              className={`flex-1 min-w-fit px-6 py-4 font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 rounded-xl ${
                activeTab === 'notices'
                  ? 'bg-gradient-to-r from-slate-900 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Bell size={20} />
              Notices
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className={`flex-1 min-w-fit px-6 py-4 font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 rounded-xl ${
                activeTab === 'timetable'
                  ? 'bg-gradient-to-r from-slate-900 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <CalendarRange size={20} />
              Timetable
            </button>
          </div>

          {/* Content */}
<div className="p-4 sm:p-6 lg:p-10 bg-gradient-to-b from-white to-slate-50">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-slate-900">Class Performance Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {classData.map((cls, idx) => (
                    <div key={idx} className="group bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-2xl transition-all">
                      <h4 className="text-2xl font-bold text-slate-900 mb-6">{cls.class}</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                          <span className="font-semibold text-slate-700">Students</span>
                          <span className="text-2xl font-bold text-blue-600">{cls.students}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl">
                          <span className="font-semibold text-slate-700">Average Percentage</span>
                          <span className="text-2xl font-bold text-emerald-600">{cls.avgPercentage}%</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">
                          <span className="font-semibold text-slate-700">Attendance</span>
                          <span className="text-2xl font-bold text-orange-600">{cls.attendance}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900">Manage All Students</h3>
                  <div className="flex items-center gap-3">
                    <Filter size={20} className="text-slate-600" />
                    <select
                      value={filterClass}
                      onChange={(e) => setFilterClass(e.target.value)}
                      className="px-4 py-2 border-2 border-slate-300 rounded-lg font-bold focus:outline-none focus:border-blue-500"
                    >
                      <option>All</option>
                      {CLASSES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="group bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">{student.name}</h4>
                          <p className="text-slate-600 text-sm mt-1">Class: {student.class} | Roll {student.rollNo} | ID: {student.id}</p>
                        </div>
                        <button
                          onClick={() => setSelectedStudentId(student.id)}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:shadow-lg transition-all"
                        >
                          <Eye size={18} />
                          View
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-slate-600 font-semibold mb-2">{latestExam ? latestExam.name : 'Marks'}</p>
                          <div className={`bg-gradient-to-r ${getGradeColor(student.marks)} text-white px-4 py-3 rounded-xl font-bold text-xl text-center`}>
                            {student.grade === '–' ? '–' : `${student.marks}%`}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 font-semibold mb-2">Attendance</p>
                          <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-4 py-3 rounded-xl font-bold text-xl text-center">
                            {student.attendance}%
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 font-semibold mb-2">Fees</p>
                          <div className={`bg-gradient-to-r ${feeBadge[student.fees.status].className} text-white px-4 py-3 rounded-xl font-bold text-center`}>
                            {feeBadge[student.fees.status].label}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 font-semibold mb-2">Grade</p>
                          <div className={`bg-gradient-to-r ${getGradeColor(student.marks)} text-white px-4 py-3 rounded-xl font-bold text-center`}>
                            {student.grade}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Departments Tab */}
            {activeTab === 'departments' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Department Overview{latestExam && <span className="block text-base font-semibold text-slate-500 mt-1">Pass rates from {latestExam.name}</span>}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {departments.map((dept, idx) => (
                    <div key={idx} className="group bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-2xl transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-2xl font-bold text-slate-900">{dept.name}</h4>
                        <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-full font-bold">
                          {dept.passRate}% Pass
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl">
                          <p className="text-sm text-slate-600 font-semibold">Students</p>
                          <p className="text-2xl font-bold text-blue-600 mt-2">{dept.students}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl">
                          <p className="text-sm text-slate-600 font-semibold">Teachers</p>
                          <p className="text-2xl font-bold text-purple-600 mt-2">{dept.teachers}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl">
                          <p className="text-sm text-slate-600 font-semibold">Average score</p>
                          <p className="text-2xl font-bold text-orange-600 mt-2">{dept.average}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notices Tab */}
            {activeTab === 'notices' && (
              <div className="space-y-6">
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Notices & Announcements</h3>
                  <button
                    onClick={() => setShowNewNotice(true)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Plus size={20} />
                    New Notice
                  </button>
                </div>

                {/* New Notice Form */}
                {showNewNotice && (
<div className="w-full max-w-full overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-8 rounded-2xl border-2 border-purple-200 mb-8">
                    <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">Create New Notice</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={noticeData.title}
                          onChange={(e) => setNoticeData({...noticeData, title: e.target.value})}
                          placeholder="Enter notice title"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
                        <textarea
                          value={noticeData.content}
                          onChange={(e) => setNoticeData({...noticeData, content: e.target.value})}
                          placeholder="Enter notice content"
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none font-medium"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                          <select
                            value={noticeData.priority}
                            onChange={(e) => setNoticeData({...noticeData, priority: e.target.value as NoticePriority})}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none font-medium"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                          <select
                            value={noticeData.category}
                            onChange={(e) => setNoticeData({...noticeData, category: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none font-medium capitalize"
                          >
                            {NOTICE_CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Show to</label>
                          <select
                            value={noticeData.audience}
                            onChange={(e) => setNoticeData({...noticeData, audience: e.target.value as NoticeAudience})}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none font-medium"
                          >
                            {(Object.keys(NOTICE_AUDIENCE_LABELS) as NoticeAudience[]).map((a) => (
                              <option key={a} value={a}>{NOTICE_AUDIENCE_LABELS[a]}</option>
                            ))}
                          </select>
                        </div>
                      </div>
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                        <button
                          onClick={handleAddNotice}
                          className="flex-1 min-w-0 w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={20} />
                          Publish Notice
                        </button>
                        <button
                          onClick={() => {
                            setShowNewNotice(false)
                            setNoticeData(emptyNotice)
                          }}
                          className="flex-1 min-w-0 w-full sm:w-auto bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-400 transition-all flex items-center justify-center gap-2"
                        >
                          <X size={20} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

{/* Notices List */}
                <div className="space-y-4">
                  {notices.map((notice) => (
                    <div key={notice.id} className="group bg-gradient-to-br from-white to-slate-50 p-4 sm:p-8 rounded-2xl border-2 border-slate-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300">
                      <div className="flex justify-between items-start gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <span className={`bg-gradient-to-r ${getPriorityColor(notice.priority)} text-white px-4 py-2 rounded-lg text-xs font-bold uppercase`}>
                              {notice.priority}
                            </span>
                            <span className="text-sm font-semibold text-slate-600">{notice.date}</span>
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                              {NOTICE_AUDIENCE_LABELS[notice.audience]} · {notice.category}
                            </span>
                          </div>
                          <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 break-words">{notice.title}</h4>
                          <p className="text-slate-700 mb-3 leading-relaxed break-words">{notice.content}</p>
<p className="text-sm text-slate-600 inline-flex items-center gap-1.5"><Edit2 size={14} className="text-slate-500" /> By {notice.createdBy}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="text-red-500 hover:bg-red-50 p-3 rounded-lg transition shrink-0"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
</div>
              </div>
            )}

            {/* Timetable Tab */}
            {activeTab === 'attendance' && <AttendanceOverview />}

            {activeTab === 'results' && <ResultsOverview />}

            {activeTab === 'fees' && <PaymentSheet readOnly />}

            {activeTab === 'timetable' && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1 w-fit max-w-full">
                  {timetableOptions.map((o) => (
                    <button
                      key={o.key}
                      onClick={() => setTimetableKey(o.key)}
                      className={`rounded-xl px-4 py-2 text-sm font-bold transition ${timetableKey === o.key ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <TimetableView
                  key={timetableKey}
                  entries={shared.timetables[timetableKey]}
                  title={timetableKey === 'school' ? 'School-wide Timetable' : `${timetableOptions.find((o) => o.key === timetableKey)!.label} Timetable`}
                  subtitle={`${timetableOptions.find((o) => o.key === timetableKey)!.subtitle} • changes appear there instantly`}
                  onEditSlot={openSlot}
                />
              </div>
            )}
          </div>
        </div>

<Link href="/" className="inline-block mt-12 text-slate-900 hover:text-slate-700 font-semibold flex items-center gap-2 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
          Back to Home
        </Link>
      </div>

      {/* Timetable slot editor */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingSlot(null)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Edit period</h2>
                <p className="text-slate-600 text-sm">
                  {editingSlot.day} · {editingSlot.period} · {editingSlot.time}
                </p>
              </div>
              <button onClick={() => setEditingSlot(null)} className="p-2 hover:bg-slate-100 rounded-lg transition" aria-label="Close">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <label className="block">
                <span className="block text-sm font-bold text-slate-700 mb-2">Subject</span>
                <input
                  list="timetable-subjects"
                  value={slotForm.subject}
                  onChange={(e) => setSlotForm({ ...slotForm, subject: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                />
                <datalist id="timetable-subjects">
                  {Object.keys(subjectColors).map((sub) => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
              </label>
              <label className="block">
                <span className="block text-sm font-bold text-slate-700 mb-2">Teacher</span>
                <input
                  list="timetable-teachers"
                  value={slotForm.teacher}
                  onChange={(e) => setSlotForm({ ...slotForm, teacher: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                />
                <datalist id="timetable-teachers">
                  {Array.from(faculty).map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </label>
              <label className="block">
                <span className="block text-sm font-bold text-slate-700 mb-2">Room</span>
                <input
                  value={slotForm.room}
                  onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                />
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingSlot(null)} className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={saveSlot} disabled={!slotForm.subject.trim()} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student profile */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStudentId(null)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedStudent.name}</h2>
                <p className="text-slate-600 text-sm">
                  Class {selectedStudent.classId} · Roll {selectedStudent.rollNo} · {selectedStudent.id}
                </p>
              </div>
              <button onClick={() => setSelectedStudentId(null)} className="p-2 hover:bg-slate-100 rounded-lg transition" aria-label="Close">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{latestExam?.name ?? 'Latest exam'}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{selectedStudent.grade === '–' ? '–' : `${selectedStudent.marks}%`}</p>
                {selectedStudent.grade !== '–' && (
                  <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${GRADE_STYLES[selectedStudent.grade]}`}>Grade {selectedStudent.grade}</span>
                )}
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Attendance</p>
                <p className={`mt-1 text-2xl font-bold ${selectedStudent.attendance < 75 ? 'text-rose-600' : 'text-slate-900'}`}>{selectedStudent.attendance}%</p>
                <p className="text-xs text-slate-500">this term</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Homework</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{selectedStudent.homeworkDone}%</p>
                <p className="text-xs text-slate-500">handed in</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Fees balance</p>
                <p className={`mt-1 text-2xl font-bold ${selectedStudent.fees.overdue > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{formatINR(selectedStudent.fees.balance)}</p>
                <p className="text-xs text-slate-500">{selectedStudent.fees.overdue > 0 ? `${formatINR(selectedStudent.fees.overdue)} overdue` : 'nothing overdue'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 text-sm mb-6">
              <p className="font-bold text-slate-900">Parent / guardian</p>
              <p className="text-slate-600">
                {selectedStudent.parentName} · {selectedStudent.parentPhone}
              </p>
            </div>

            <p className="text-xs text-slate-500">
              Marks and attendance come from the teachers&apos; registers and fees from the accounts office, so they are updated there rather than edited here.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}

export default function PrincipalPortal() {
  return (
    <ProtectedRoute allowedRoles={['principal']}>
      <PrincipalPortalContent />
    </ProtectedRoute>
  )
}
