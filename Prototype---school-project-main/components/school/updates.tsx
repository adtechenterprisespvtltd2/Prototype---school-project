'use client'

import { useState } from 'react'
import { BellRing, Megaphone, Send, Trash2 } from 'lucide-react'
import { useSchoolData } from '@/context/school-data-context'
import { NOTICE_AUDIENCE_LABELS, NoticeAudience, NoticePriority, formatDate } from '@/lib/school-data'
import { UpdateRow, useMyUpdates, useOpenUpdate } from '@/components/notification-bell'
import { cn } from '@/lib/utils'
import { Badge, Field, Panel, PanelHeader, Toast, inputClass, primaryButton } from './ui'

/* Recent updates for the signed-in parent or student, shown on their first tab. */
export function UpdatesPanel({ limit = 6 }: { limit?: number }) {
  const updates = useMyUpdates()
  const openUpdate = useOpenUpdate()
  const [showAll, setShowAll] = useState(false)
  const urgent = updates.filter((u) => u.urgent).length
  const shown = showAll ? updates : updates.slice(0, limit)

  return (
    <Panel className="p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <BellRing size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">Latest updates</h3>
        </div>
        {urgent > 0 && <Badge className="bg-rose-100 text-rose-700">{urgent} need attention</Badge>}
      </div>
      {updates.length === 0 ? (
        <p className="px-1 py-4 text-sm text-slate-500">Nothing new right now.</p>
      ) : (
        <>
          <div className="divide-y divide-slate-100">
            {shown.map((u) => (
              <UpdateRow key={u.id} update={u} onOpen={openUpdate} />
            ))}
          </div>
          {updates.length > limit && (
            <button type="button" onClick={() => setShowAll(!showAll)} className="mt-2 w-full rounded-xl py-2 text-sm font-bold text-blue-700 hover:bg-blue-50">
              {showAll ? 'Show less' : `Show all ${updates.length}`}
            </button>
          )}
        </>
      )}
    </Panel>
  )
}

/* Teacher: post a notice to their class's parents and/or students. */
export function ClassNoticeComposer({ teacherName }: { teacherName: string }) {
  const { data, addNotice, deleteNotice } = useSchoolData()
  const empty = { title: '', content: '', audience: 'parents' as NoticeAudience, priority: 'medium' as NoticePriority }
  const [form, setForm] = useState(empty)
  const [toast, setToast] = useState<string | null>(null)
  const mine = data.notices.filter((n) => n.createdBy === teacherName).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)

  const post = () => {
    if (!form.title.trim() || !form.content.trim()) return
    addNotice({ ...form, title: form.title.trim(), content: form.content.trim(), category: 'academic', createdBy: teacherName })
    setToast(`Notice sent to ${NOTICE_AUDIENCE_LABELS[form.audience].toLowerCase()}`)
    setForm(empty)
  }

  return (
    <Panel>
      <PanelHeader eyebrow="Class notice" title="Post a notice" description="Shows in the Notices tab and the notification bell of the people you choose." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Field label="Title">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Maths test on Monday" className={inputClass} />
          </Field>
          <Field label="Message">
            <textarea rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="What do parents or students need to know?" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Send to">
              <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as NoticeAudience })} className={inputClass}>
                <option value="parents">Parents</option>
                <option value="students">Students</option>
                <option value="everyone">Parents & students</option>
              </select>
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as NoticePriority })} className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
          </div>
          <button type="button" onClick={post} disabled={!form.title.trim() || !form.content.trim()} className={cn(primaryButton, 'w-full sm:w-auto')}>
            <Send size={16} /> Post notice
          </button>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Your recent notices</p>
          {mine.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">You haven&apos;t posted any notices yet.</p>
          ) : (
            <ul className="space-y-2">
              {mine.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Megaphone size={14} className="shrink-0 text-blue-600" />
                      <span className="truncate">{n.title}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(n.date)} · to {NOTICE_AUDIENCE_LABELS[n.audience].toLowerCase()}
                    </p>
                  </div>
                  <button type="button" aria-label="Delete notice" onClick={() => window.confirm('Delete this notice?') && deleteNotice(n.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </Panel>
  )
}
