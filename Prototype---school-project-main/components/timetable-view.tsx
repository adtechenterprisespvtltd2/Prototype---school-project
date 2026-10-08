'use client'

import { useState } from 'react'
import { CalendarRange, Clock, MapPin, User, BookOpen } from 'lucide-react'
import { DAYS, TIME_SLOTS, PERIOD_LABELS, subjectColors, type TimetableEntry } from '@/lib/timetable-data'

export default function TimetableView({
  entries,
  title = 'Weekly Class Timetable',
  subtitle,
  onEditSlot,
}: {
  entries: TimetableEntry[]
  title?: string
  subtitle?: string
  // When given, every period in the week table becomes clickable for editing.
  onEditSlot?: (entry: TimetableEntry) => void
}) {
  const [activeDay, setActiveDay] = useState(DAYS[0])

  const todayClasses = entries.filter((e) => e.day === activeDay)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 inline-flex items-center gap-3">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-2.5 rounded-2xl">
              <CalendarRange size={24} />
            </span>
            {title}
          </h3>
          {subtitle && <p className="text-slate-600 mt-2">{subtitle}</p>}
        </div>
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl">
          <Clock size={16} className="text-blue-600" />
          Academic Year 2025-2026
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${
              activeDay === day
                ? 'bg-gradient-to-r from-slate-800 to-blue-900 text-white shadow-lg transform scale-105'
                : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-blue-300'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Classes for selected day */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {todayClasses.map((cls, idx) => {
          const color = subjectColors[cls.subject] || 'from-slate-500 to-slate-700'
          const isFree = cls.subject === 'Free Period'
          return (
            <div
              key={idx}
              className={`group rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                isFree ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className={`${isFree ? 'bg-slate-400' : `bg-gradient-to-r ${color}`} text-white text-xs font-bold px-3 py-1.5 rounded-lg`}>
                  {cls.period}
                </span>
                <span className="text-xs font-semibold text-slate-500 inline-flex items-center gap-1">
                  <Clock size={12} /> {cls.time}
                </span>
              </div>

              <h4 className={`${isFree ? 'text-slate-500' : 'text-slate-900'} text-lg font-bold mb-2`}>{cls.subject}</h4>

              <div className="space-y-1.5 text-sm text-slate-600">
                <p className="inline-flex items-center gap-2">
                  <User size={14} className="text-blue-600 shrink-0" /> {cls.teacher}
                </p>
                <p className="inline-flex items-center gap-2">
                  <MapPin size={14} className="text-blue-600 shrink-0" /> {cls.room}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Full week summary table */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-lg mt-4">
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white px-6 py-4 flex items-center gap-3">
          <BookOpen size={20} className="text-blue-400" />
          <h4 className="font-bold text-lg">Full Week Schedule</h4>
          {onEditSlot && <span className="ml-auto text-xs font-semibold text-blue-200">Click any period to edit it</span>}
        </div>
        <div className="p-4 sm:p-6 overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Day</th>
                {TIME_SLOTS.map((slot, i) => (
                  <th key={i} className="py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-xs">
                    <span className="block">{PERIOD_LABELS[i]}</span>
                    <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">{slot}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DAYS.map((day) => (
                <tr key={day} className={`hover:bg-slate-50/60 transition-colors ${activeDay === day ? 'bg-blue-50/40' : ''}`}>
                  <td className="py-3 pr-3 font-bold text-slate-900 whitespace-nowrap">{day}</td>
                  {TIME_SLOTS.map((slot, i) => {
                    const entry = entries.find((e) => e.day === day && e.period === PERIOD_LABELS[i])
                    const color = entry ? subjectColors[entry.subject] || 'from-slate-500 to-slate-700' : 'from-slate-200 to-slate-200'
                    const isFree = entry?.subject === 'Free Period'
                    return (
                      <td key={i} className="py-2 px-2">
                        {entry && onEditSlot ? (
                          <button
                            type="button"
                            onClick={() => onEditSlot(entry)}
                            title={`Edit ${day} ${entry.period}`}
                            className={`${isFree ? 'bg-slate-100 text-slate-500' : `bg-gradient-to-r ${color} text-white`} w-full rounded-xl px-2.5 py-2 text-center text-[11px] font-bold leading-tight ring-offset-2 transition hover:ring-2 hover:ring-blue-500`}
                          >
                            <span className="block">{entry.subject}</span>
                            <span className={`block text-[9px] font-semibold mt-0.5 ${isFree ? 'text-slate-400' : 'text-white/80'}`}>
                              {entry.room}
                            </span>
                          </button>
                        ) : entry ? (
                          <div className={`${isFree ? 'bg-slate-100 text-slate-500' : `bg-gradient-to-r ${color} text-white`} rounded-xl px-2.5 py-2 text-center text-[11px] font-bold leading-tight`}>
                            <span className="block">{entry.subject}</span>
                            <span className={`block text-[9px] font-semibold mt-0.5 ${isFree ? 'text-slate-400' : 'text-white/80'}`}>
                              {entry.room}
                            </span>
                          </div>
                        ) : (
                          <div className="bg-slate-50 rounded-xl px-2.5 py-2 text-center text-[11px] text-slate-400 font-semibold">
                            —
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
