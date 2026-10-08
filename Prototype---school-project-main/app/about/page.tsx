'use client'

import Header from '@/components/header'
import { SiteFooter } from '@/components/home-sections'
import { Heart, Target, Zap, Users, Award, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Excellence',
      description: 'Striving for the highest standards in education and character development',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Heart,
      title: 'Compassion',
      description: 'Creating a caring environment where every student feels valued and supported',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Embracing modern teaching methods and emerging technologies',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building strong relationships among students, staff, and parents',
      color: 'from-emerald-500 to-emerald-600',
    },
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
          <h1 className="text-5xl md:text-6xl font-bold mb-4">About EduPro</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">A legacy of excellence, innovation, and commitment to shaping future leaders</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg">
                  <Target size={28} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">Our Mission</h3>
              </div>
              <p className="text-slate-700 leading-relaxed text-lg">
                To provide world-class education that nurtures intellectual growth, builds strong character, and prepares students to make a positive impact on society.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg">
                  <Zap size={28} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">Our Vision</h3>
              </div>
              <p className="text-slate-700 leading-relaxed text-lg">
                To be a leading institution recognized for academic excellence, innovation, and the holistic development of young minds into responsible global citizens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => {
              const Icon = value.icon
              return (
                <div key={idx} className="group bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className={`bg-gradient-to-r ${value.color} p-4 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: 'Students', value: '10,000+', color: 'from-blue-500 to-blue-600' },
              { icon: Award, label: 'Faculty', value: '500+', color: 'from-purple-500 to-purple-600' },
              { icon: Target, label: 'Programs', value: '50+', color: 'from-orange-500 to-orange-600' },
              { icon: Heart, label: 'Alumni', value: '50,000+', color: 'from-pink-500 to-pink-600' },
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className={`bg-gradient-to-br ${stat.color} text-white p-8 rounded-2xl text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}>
                  <Icon size={40} className="mx-auto mb-4 opacity-80" />
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-blue-100 font-semibold">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-blue-100 text-lg mb-8">Be part of a transformative educational journey</p>
          <Link href="/admissions" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all">
            Apply Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
          Back to Home
        </Link>
      </div>
      <SiteFooter />
    </main>
  )
}
