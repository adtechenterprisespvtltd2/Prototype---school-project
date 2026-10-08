'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { useSchoolData } from '@/context/school-data-context'
import { ClassId, Message, findStudent, studentsIn } from '@/lib/school-data'
import { cn } from '@/lib/utils'
import { EmptyState, Panel, PanelHeader, inputClass, primaryButton } from './ui'

function formatSent(sentAt: string) {
  return new Date(sentAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

function Thread({ messages, viewer }: { messages: Message[]; viewer: 'teacher' | 'parent' }) {
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' })
  }, [messages.length])

  if (messages.length === 0) {
    return <EmptyState icon={<MessageCircle size={36} />} title="No messages yet" description="Start the conversation below." />
  }
  return (
    <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
      {messages.map((m) => {
        const mine = m.from === viewer
        return (
          <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[85%] rounded-2xl px-4 py-3 text-sm', mine ? 'rounded-br-md bg-slate-900 text-white' : 'rounded-bl-md bg-slate-100 text-slate-800')}>
              <p className={cn('mb-1 text-xs font-bold', mine ? 'text-slate-300' : 'text-slate-500')}>{m.author}</p>
              <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
              <p className={cn('mt-1 text-right text-[10px]', mine ? 'text-slate-400' : 'text-slate-400')}>{formatSent(m.sentAt)}</p>
            </div>
          </div>
        )
      })}
      <div ref={end} />
    </div>
  )
}

function Composer({ onSend, placeholder }: { onSend: (text: string) => void; placeholder: string }) {
  const [text, setText] = useState('')
  const send = () => {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }
  return (
    <div className="mt-4 flex gap-2">
      <textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
          }
        }}
        placeholder={placeholder}
        className={cn(inputClass, 'resize-none')}
      />
      <button type="button" onClick={send} disabled={!text.trim()} className={cn(primaryButton, 'self-end')} aria-label="Send message">
        <Send size={16} />
      </button>
    </div>
  )
}

/* Teacher: one conversation per student's parent in the class. */
export function TeacherInbox({ teacherName, classId }: { teacherName: string; classId: ClassId }) {
  const { data, sendMessage } = useSchoolData()
  const roster = studentsIn(classId)
  const threadFor = (studentId: string) => data.messages.filter((m) => m.studentId === studentId).sort((a, b) => a.sentAt.localeCompare(b.sentAt))
  // Most recent conversations first.
  const ordered = [...roster].sort((a, b) => (threadFor(b.id).at(-1)?.sentAt ?? '').localeCompare(threadFor(a.id).at(-1)?.sentAt ?? ''))
  const [selected, setSelected] = useState(ordered[0]?.id)
  const student = selected ? findStudent(selected) : undefined
  const thread = selected ? threadFor(selected) : []

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Panel className="min-w-0 lg:col-span-2">
        <PanelHeader eyebrow="Parent communication" title={`Class ${classId} parents`} />
        <ul className="space-y-2">
          {ordered.map((s) => {
            const last = threadFor(s.id).at(-1)
            const awaitingReply = last?.from === 'parent'
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelected(s.id)}
                  className={cn('w-full rounded-2xl border p-3 text-left transition', s.id === selected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:bg-slate-50')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold">{s.parentName}</p>
                    {awaitingReply && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" title="Waiting for your reply" />}
                  </div>
                  <p className={cn('text-xs', s.id === selected ? 'text-slate-300' : 'text-slate-500')}>Parent of {s.name}</p>
                  {last && <p className={cn('mt-1 truncate text-xs', s.id === selected ? 'text-slate-200' : 'text-slate-600')}>{last.from === 'teacher' ? 'You: ' : ''}{last.text}</p>}
                </button>
              </li>
            )
          })}
        </ul>
      </Panel>

      <Panel className="min-w-0 lg:col-span-3">
        {student && (
          <>
            <PanelHeader eyebrow={`Parent of ${student.name}`} title={student.parentName} description={student.parentPhone} />
            <Thread messages={thread} viewer="teacher" />
            <Composer
              placeholder={`Message ${student.parentName}… (Enter to send)`}
              onSend={(text) => sendMessage({ studentId: student.id, from: 'teacher', author: teacherName, text })}
            />
          </>
        )}
      </Panel>
    </div>
  )
}

/* Parent: their conversation with the child's class teacher. */
export function ParentMessages({ studentId, parentName, teacherName = 'Dr. Sarah Johnson' }: { studentId: string; parentName: string; teacherName?: string }) {
  const { data, sendMessage } = useSchoolData()
  const student = findStudent(studentId)
  const thread = data.messages.filter((m) => m.studentId === studentId).sort((a, b) => a.sentAt.localeCompare(b.sentAt))

  return (
    <Panel>
      <PanelHeader eyebrow="Messages" title={`Chat with ${teacherName}`} description={`Class teacher of ${student?.name ?? 'your child'} · Class ${student?.classId ?? ''}`} />
      <Thread messages={thread} viewer="parent" />
      <Composer placeholder="Write to the class teacher… (Enter to send)" onSend={(text) => sendMessage({ studentId, from: 'parent', author: parentName, text })} />
    </Panel>
  )
}
