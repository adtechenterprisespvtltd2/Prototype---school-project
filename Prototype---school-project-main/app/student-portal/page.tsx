'use client'

import { useState } from 'react'
import Header from '@/components/header'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/context/auth-context'
import { BookOpen, Clock, CheckCircle, CalendarCheck2, AlertCircle, Download, Award, TrendingUp, Bell, User, Megaphone, ArrowLeft, Printer, GraduationCap, HelpCircle, FileText, ClipboardList, NotebookPen, CalendarRange } from 'lucide-react'
import Link from 'next/link'
import TimetableView from '@/components/timetable-view'
import { classTimetable } from '@/lib/timetable-data'
import { AttendanceCalendar } from '@/components/school/attendance'
import { ReportCard } from '@/components/school/results'
import { HomeworkBoard } from '@/components/school/homework'

function StudentPortalContent() {
  const { user } = useAuth()
  const studentId = user?.id || 'STU001'
  const [activeTab, setActiveTab] = useState('courses')

  const notices = [
    { id: 1, title: 'Mid-Term Exam Schedule', content: 'Exams start from March 1st. All students must report 15 mins early.', priority: 'high', date: '2024-02-15', createdBy: 'Principal' },
    { id: 2, title: 'Lab Session Cancelled', content: 'Lab session on Friday is postponed to next week.', priority: 'medium', date: '2024-02-14', createdBy: 'Dr. Anderson' },
    { id: 3, title: 'Annual Sports Day', content: 'Sports day on 25th March. Students should wear their house colors.', priority: 'low', date: '2024-02-10', createdBy: 'Sports Dept' },
  ]

  const courses = [
    { id: 1, name: 'Mathematics - Calculus', instructor: 'Dr. Sarah Johnson', progress: 95, grade: 'A', marks: 96, remarks: 'Excellent analytical and problem-solving skills.' },
    { id: 2, name: 'Physics - Quantum Mechanics', instructor: 'Dr. James Wilson', progress: 94, grade: 'A', marks: 95, remarks: 'Outstanding comprehension of complex physics concepts.' },
    { id: 3, name: 'Chemistry - Organic Chemistry', instructor: 'Dr. Lisa Miller', progress: 98, grade: 'A+', marks: 98, remarks: 'Exceptional performance in laboratory work and exams.' },
    { id: 4, name: 'English Literature', instructor: 'Prof. Michael Brown', progress: 98, grade: 'A', marks: 96, remarks: 'Strong essay writing and literature interpretation.' },
  ]

  const assignments = [
    { id: 1, title: 'Math Problem Set 5', course: 'Mathematics', dueDate: '2024-02-15', status: 'pending' },
    { id: 2, title: 'Essay on Romeo & Juliet', course: 'English Literature', dueDate: '2024-02-20', status: 'submitted' },
    { id: 3, title: 'Physics Lab Report', course: 'Physics', dueDate: '2024-02-10', status: 'overdue' },
{ id: 4, title: 'Historical Research Paper', course: 'History', dueDate: '2024-02-25', status: 'pending' },
  ]

  const importantQuestions = [
    { id: 1, subject: 'Mathematics', chapter: 'Calculus - Differentiation', questions: ['Derive the chain rule with examples', 'Solve maxima and minima problems', 'Application of derivatives in real life'], difficulty: 'Hard', marks: 8 },
    { id: 2, subject: 'Physics', chapter: 'Quantum Mechanics', questions: ['Explain wave-particle duality', 'State and prove Heisenberg uncertainty principle', 'Describe photoelectric effect with equations'], difficulty: 'Hard', marks: 10 },
    { id: 3, subject: 'Chemistry', chapter: 'Organic Chemistry', questions: ['Explain isomerism types', 'Write mechanisms of substitution reactions', 'Describe functional group identification'], difficulty: 'Medium', marks: 7 },
    { id: 4, subject: 'English Literature', chapter: 'Romeo & Juliet', questions: ['Analyze the theme of fate vs free will', 'Character sketch of Juliet', 'Discuss the role of the Nurse'], difficulty: 'Medium', marks: 6 },
  ]

  const questionPapers = [
    { id: 1, subject: 'Mathematics', exam: 'Mid-Term Exam', year: '2024', marks: '100 Marks', duration: '3 Hours' },
    { id: 2, subject: 'Physics', exam: 'Final Exam', year: '2023', marks: '100 Marks', duration: '3 Hours' },
    { id: 3, subject: 'Chemistry', exam: 'Mid-Term Exam', year: '2024', marks: '80 Marks', duration: '2.5 Hours' },
    { id: 4, subject: 'English Literature', exam: 'Unit Test', year: '2024', marks: '40 Marks', duration: '1.5 Hours' },
  ]

  const notes = [
    { id: 1, subject: 'Physics', title: 'Handwritten Notes - Quantum Mechanics', date: '2024-02-10', size: '2.4 MB' },
    { id: 2, subject: 'English Literature', title: 'Summary Notes - Romeo & Juliet', date: '2024-02-08', size: '1.8 MB' },
    { id: 3, subject: 'Chemistry', title: 'Organic Chemistry Reaction Guide', date: '2024-02-09', size: '3.1 MB' },
  ]

  const gradeColors: Record<string, string> = {
    'A+': 'from-emerald-500 to-emerald-600',
    'A': 'from-green-500 to-green-600',
    'A-': 'from-teal-500 to-teal-600',
    'B+': 'from-blue-500 to-blue-600',
    'B': 'from-cyan-500 to-cyan-600',
  }

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'from-red-500 to-red-600'
    if (priority === 'medium') return 'from-orange-500 to-orange-600'
    return 'from-blue-500 to-blue-600'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <Header />

      {/* Hero Banner */}
      <section className="relative py-16 px-4 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-8 right-10 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-3">Welcome back, {user?.name || 'Student'}</h1>
          <p className="text-blue-100 text-xl">Track your academic progress and manage your coursework efficiently</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Tabs Section */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Tab Buttons */}
          <div className="flex border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-center transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 rounded-xl whitespace-nowrap ${
                activeTab === 'courses'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <BookOpen size={16} className="sm:w-5 sm:h-5" />
              Courses
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-center transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 rounded-xl whitespace-nowrap ${
                activeTab === 'assignments'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Clock size={16} className="sm:w-5 sm:h-5" />
              Assignments
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-center transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 rounded-xl whitespace-nowrap ${
                activeTab === 'grades'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <CheckCircle size={16} className="sm:w-5 sm:h-5" />
              Report Card
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-center transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 rounded-xl whitespace-nowrap ${
                activeTab === 'attendance'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <CalendarCheck2 size={16} className="sm:w-5 sm:h-5" />
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('notices')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-center transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 rounded-xl whitespace-nowrap ${
                activeTab === 'notices'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
<Bell size={16} className="sm:w-5 sm:h-5" />
              Notices
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-center transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 rounded-xl whitespace-nowrap ${
                activeTab === 'questions'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <HelpCircle size={16} className="sm:w-5 sm:h-5" />
              Important Questions
            </button>
            <button
              onClick={() => setActiveTab('papers')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-center transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 rounded-xl whitespace-nowrap ${
                activeTab === 'papers'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <FileText size={16} className="sm:w-5 sm:h-5" />
              Question Papers
            </button>
<button
              onClick={() => setActiveTab('homework')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-center transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 rounded-xl whitespace-nowrap ${
                activeTab === 'homework'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <ClipboardList size={16} className="sm:w-5 sm:h-5" />
              Homework
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-center transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 rounded-xl whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
<NotebookPen size={16} className="sm:w-5 sm:h-5" />
              Notes
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-center transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 rounded-xl whitespace-nowrap ${
                activeTab === 'timetable'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <CalendarRange size={16} className="sm:w-5 sm:h-5" />
              Timetable
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-10 bg-gradient-to-b from-white to-slate-50">
            {activeTab === 'courses' && (
              <div className="space-y-6">
                {courses.map((course) => (
                  <div key={course.id} className="group bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition mb-2">{course.name}</h3>
                        <p className="text-slate-600 text-base inline-flex items-center gap-1.5"><User size={16} className="text-blue-600" /> {course.instructor}</p>
                      </div>
                      <span className={`bg-gradient-to-r ${gradeColors[course.grade]} text-white text-base font-bold px-5 py-3 rounded-xl shadow-lg`}>
                        {course.grade}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-600">Progress</span>
                          <span className="text-sm font-bold text-blue-600">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-300 rounded-full h-4">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-4 rounded-full transition-all duration-500 shadow-lg" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="group bg-gradient-to-br from-slate-50 to-slate-100 p-5 sm:p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{assignment.title}</h3>
                        <p className="text-slate-600 text-xs sm:text-sm mt-1">{assignment.course}</p>
                        <p className="text-slate-500 text-xs sm:text-sm mt-2 font-medium">Due: {assignment.dueDate}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                        {assignment.status === 'submitted' && (
                          <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm">
                            <CheckCircle size={16} /> Submitted
                          </span>
                        )}
                        {assignment.status === 'pending' && (
                          <span className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm">
                            <Clock size={16} /> Pending
                          </span>
                        )}
                        {assignment.status === 'overdue' && (
                          <span className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm">
                            <AlertCircle size={16} /> Overdue
                          </span>
                        )}
                        <button className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition ml-auto sm:ml-0">
                          <Download size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

{activeTab === 'grades' && <ReportCard studentId={studentId} />}

            {activeTab === 'attendance' && <AttendanceCalendar studentId={studentId} />}

            {/* Notices Tab */}
            {activeTab === 'notices' && (
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-900 mb-6">School Notices & Announcements</h3>
                <div className="space-y-4">
                  {notices.map((notice) => (
                    <div key={notice.id} className="group bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border-2 border-slate-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`bg-gradient-to-r ${getPriorityColor(notice.priority)} text-white px-4 py-2 rounded-lg text-xs font-bold uppercase`}>
                              {notice.priority}
                            </span>
                            <span className="text-sm font-semibold text-slate-600">{notice.date}</span>
                          </div>
                          <h4 className="text-2xl font-bold text-slate-900 mb-2">{notice.title}</h4>
                          <p className="text-slate-700 mb-3 leading-relaxed">{notice.content}</p>
<p className="text-sm text-slate-600 inline-flex items-center gap-1.5"><Megaphone size={14} className="text-blue-600" /> By {notice.createdBy}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Questions Tab */}
            {activeTab === 'questions' && (
              <div className="space-y-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Chapter-wise Important Questions</h3>
                {importantQuestions.map((item) => (
                  <div key={item.id} className="group bg-gradient-to-br from-white to-slate-50 p-4 sm:p-6 lg:p-8 rounded-2xl border-2 border-slate-200 hover:border-amber-400 hover:shadow-2xl transition-all duration-300">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">
                            {item.subject}
                          </span>
                          <span className="text-sm font-semibold text-slate-600 break-words">{item.chapter}</span>
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 break-words">{item.chapter}</h4>
                        <ul className="space-y-2">
                          {item.questions.map((q, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-700 leading-relaxed">
                              <HelpCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                              <span className="break-words">{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0 w-full lg:w-auto justify-start">
                        <span className={`bg-gradient-to-r ${item.difficulty === 'Hard' ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600'} text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg`}>
                          {item.difficulty}
                        </span>
                        <span className="text-sm font-bold text-slate-600">{item.marks} marks</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Question Papers Tab */}
            {activeTab === 'papers' && (
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-900 mb-6">Question Papers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {questionPapers.map((paper) => (
                    <div key={paper.id} className="group bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">
                              {paper.subject}
                            </span>
                            <span className="text-sm font-semibold text-slate-600">{paper.year}</span>
                          </div>
                          <h4 className="text-xl font-bold text-slate-900 mb-2">{paper.exam}</h4>
                          <p className="text-slate-600 text-sm mb-4">{paper.subject}</p>
                          <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                              <FileText size={14} className="text-blue-600" /> {paper.marks}
                            </span>
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                              <Clock size={14} className="text-blue-600" /> {paper.duration}
                            </span>
                          </div>
                        </div>
                        <button className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-xl transition shrink-0">
                          <Download size={22} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Homework Tab */}
            {activeTab === 'homework' && <HomeworkBoard studentId={studentId} />}

{/* Timetable Tab */}
            {activeTab === 'timetable' && (
              <TimetableView
                entries={classTimetable}
                title="My Weekly Timetable"
                subtitle="Class 10A • Academic Year 2025-2026"
              />
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Study Notes & Materials</h3>
                <div className="space-y-4">
                  {notes.map((item) => (
                    <div key={item.id} className="group bg-gradient-to-br from-emerald-50 to-slate-50 p-4 sm:p-6 rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase">
                              Notes
                            </span>
                            <span className="text-sm font-semibold text-slate-600">{item.subject}</span>
                          </div>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 break-words">{item.title}</h4>
                          <p className="text-slate-500 text-sm mt-2">Posted: {item.date}</p>
                          <p className="text-slate-600 text-sm mt-1 inline-flex items-center gap-1.5">
                            <FileText size={14} className="text-emerald-500" /> Size: {item.size}
                          </p>
                        </div>
                        <div className="flex items-center justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-emerald-100 shrink-0">
                          <button className="text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition">
                            <Download size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
<Link href="/" className="inline-block mt-8 text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
          Back to Home
        </Link>
      </div>
    </main>
  )
}

export default function StudentPortal() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentPortalContent />
    </ProtectedRoute>
  )
}
