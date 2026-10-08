'use client'

import Header from '@/components/header'
import { SiteFooter } from '@/components/home-sections'
import { BookOpen, Users, Award, Sparkles, ArrowRight, Target, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AcademicsPage() {
  const stats = [
    { label: 'Students', value: '1,400+', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Faculty', value: '125+', icon: BookOpen, color: 'from-purple-500 to-purple-600' },
    { label: 'Pass Rate', value: '98%', icon: Award, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Programs', value: '50+', icon: Sparkles, color: 'from-orange-500 to-orange-600' },
  ]

  const programs = [
    {
      name: 'Primary Section',
      grades: 'Grade 1-5',
      students: 420,
      focus: 'Foundational Learning & Character Building',
    },
    {
      name: 'Secondary Section',
      grades: 'Grade 6-8',
      students: 380,
      focus: 'Critical Thinking & Specialization',
    },
    {
      name: 'Senior Section',
      grades: 'Grade 9-10',
      students: 350,
      focus: 'Board Prep & Career Guidance',
    },
    {
      name: 'Higher Secondary',
      grades: 'Grade 11-12',
      students: 250,
      focus: 'Advanced Studies & University Prep',
    },
  ]

  const subjects = [
    'Physics', 'Chemistry', 'Biology', 'Mathematics',
    'English', 'Hindi', 'History', 'Geography',
    'Computer Science', 'Commerce', 'Civics', 'Sanskrit'
  ]

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-8 right-10 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Academic Excellence</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">Comprehensive curriculum designed for holistic development and success</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className={`bg-gradient-to-br ${stat.color} p-8 rounded-2xl text-white text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}>
                  <Icon size={40} className="mx-auto mb-4 opacity-80" />
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-blue-100 text-sm font-semibold">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Educational Programs</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Structured curriculum across different grade levels</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program, idx) => (
              <div key={idx} className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="mb-4">
                  <span className="inline-block bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-2 rounded-lg text-sm font-bold">
                    {program.grades}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition">{program.name}</h3>
                <p className="text-slate-600 mb-4">{program.focus}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-sm font-semibold text-slate-600 inline-flex items-center gap-1.5"><Users size={15} className="text-blue-600" /> {program.students} Students</span>
                  <ArrowRight size={20} className="text-blue-600 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Subjects Offered</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((subject, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 text-center font-semibold text-slate-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 cursor-pointer hover:shadow-lg">
                {subject}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaching Approach */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Teaching Approach</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border border-white/10 p-6 rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"></div>
              <div className="relative flex items-center gap-4 mb-3">
                <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center">
                  <Target size={26} className="text-slate-900" />
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">Interactive Learning</h3>
              </div>
              <p className="relative text-blue-100/80 text-sm leading-relaxed">Blend traditional methods with technology for engaging experiences</p>
            </div>
            <div className="group relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border border-white/10 p-6 rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"></div>
              <div className="relative flex items-center gap-4 mb-3">
                <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center">
                  <Users size={26} className="text-slate-900" />
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">Personalized Attention</h3>
              </div>
              <p className="relative text-blue-100/80 text-sm leading-relaxed">Small classes ensure individual focus and tailored guidance</p>
            </div>
            <div className="group relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border border-white/10 p-6 rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"></div>
              <div className="relative flex items-center gap-4 mb-3">
                <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center">
                  <Star size={26} className="text-slate-900" />
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">Holistic Development</h3>
              </div>
              <p className="relative text-blue-100/80 text-sm leading-relaxed">Character building and overall personality growth</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Interested in Joining?</h2>
          <Link href="/admissions" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-lg font-bold hover:shadow-2xl hover:shadow-blue-600/50 transition-all duration-200">
            Apply Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
