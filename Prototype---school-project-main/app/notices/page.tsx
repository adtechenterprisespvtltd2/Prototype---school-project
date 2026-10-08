'use client'

import { useState } from 'react'
import Header from '@/components/header'
import { SiteFooter } from '@/components/home-sections'
import { Bell, AlertCircle, Info, CheckCircle, Calendar, Star, ArrowRight, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSchoolData } from '@/context/school-data-context'
import { noticesFor } from '@/lib/school-data'

export default function NoticesPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [starred, setStarred] = useState<string[]>([])
  const { data, ready } = useSchoolData()

  // Public page: only notices the principal published for everyone.
  const notices = noticesFor(data.notices, 'everyone').filter((n) => n.audience === 'everyone')

  const filteredNotices = activeFilter === 'all' 
    ? notices 
    : notices.filter(n => n.category === activeFilter)

  const toggleStar = (id: string) => {
    setStarred(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const priorityColors: Record<string, string> = {
    high: 'from-red-500 to-red-600',
    medium: 'from-orange-500 to-orange-600',
    low: 'from-blue-500 to-blue-600',
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <Header />

      {/* Hero Banner */}
      <section className="relative py-12 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Notices & Announcements</h1>
          <p className="text-indigo-100 text-lg">Stay updated with latest school announcements</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Filter Buttons */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Filter By Category</h2>
          <div className="flex flex-wrap gap-3">
            {['all', 'academic', 'admission', 'holiday', 'sports', 'general', 'facility'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-6 py-2 rounded-full font-bold transition-all duration-200 transform hover:scale-105 ${
                  activeFilter === cat
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notices List */}
        <div className="space-y-6 mb-12">
          {!ready ? (
            <div className="space-y-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-200/70" />
              ))}
            </div>
          ) : filteredNotices.length > 0 ? (
            filteredNotices.map((notice) => (
              <div 
                key={notice.id} 
                className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {/* Priority Badge */}
                      <div className={`inline-block bg-gradient-to-r ${priorityColors[notice.priority]} text-white px-4 py-1 rounded-full text-xs font-bold mb-3`}>
                        {notice.priority.toUpperCase()} PRIORITY
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition">{notice.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={16} />
                          {notice.date}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Info size={16} />
                          {notice.category.charAt(0).toUpperCase() + notice.category.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Star Button */}
                    <button
                      onClick={() => toggleStar(notice.id)}
                      className="ml-4 p-2 hover:bg-slate-100 rounded-lg transition flex-shrink-0"
                    >
                      <Star
                        size={24}
                        className={`transition-all ${starred.includes(notice.id) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}`}
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <p className="text-slate-700 mb-6 leading-relaxed text-lg">{notice.content}</p>

                  {/* Action Button */}
                  <button className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all">
                    Read Full Notice
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Bell size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 text-lg">No notices found in this category</p>
            </div>
          )}
        </div>

        {/* Subscribe Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-start gap-4 mb-4">
            <Bell size={32} className="mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold mb-2">Never Miss Important Notices</h3>
              <p className="text-indigo-100">Subscribe to get instant notifications about all school announcements</p>
            </div>
          </div>
          <div className="flex gap-3 flex-col sm:flex-row mt-6">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-slate-900 focus:outline-none font-medium"
            />
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-bold hover:bg-indigo-50 transition whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>

        <Link href="/" className="inline-block mt-12 text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
          Back to Home
        </Link>
      </div>
      <SiteFooter />
    </main>
  )
}
