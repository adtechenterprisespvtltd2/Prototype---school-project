'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, BellRing, CheckCircle2, Download, IndianRupee, Plus, Printer, Receipt, Search, Wallet } from 'lucide-react'
import { useSchoolData } from '@/context/school-data-context'
import {
  CLASSES,
  ClassId,
  FeeLine,
  INSTALLMENTS,
  MONTHS,
  PAYMENT_METHODS,
  Payment,
  PaymentMethod,
  ROSTER,
  allocatePayment,
  downloadCSV,
  feeLedger,
  findStudent,
  formatDate,
  formatINR,
  todayISO,
} from '@/lib/school-data'
import { cn } from '@/lib/utils'
import { Badge, EmptyState, Field, Modal, Panel, PanelHeader, ProgressBar, Segmented, StatTile, Toast, inputClass, primaryButton, secondaryButton } from './ui'

const LINE_STYLES: Record<FeeLine['status'], { cell: string; label: string }> = {
  paid: { cell: 'bg-emerald-100 text-emerald-700', label: 'Paid' },
  partial: { cell: 'bg-amber-100 text-amber-700', label: 'Part paid' },
  overdue: { cell: 'bg-rose-100 text-rose-700', label: 'Overdue' },
  upcoming: { cell: 'bg-slate-100 text-slate-400', label: 'Upcoming' },
}

const STUDENT_STATUS = {
  cleared: { label: 'Cleared', className: 'bg-emerald-100 text-emerald-700' },
  overdue: { label: 'Overdue', className: 'bg-rose-100 text-rose-700' },
  'on-track': { label: 'On track', className: 'bg-blue-100 text-blue-700' },
}

export function openReceipt(payment: Payment) {
  const labels = payment.allocations.map((a) => INSTALLMENTS.find((i) => i.id === a.installmentId)?.label.replace(' Tuition', '') ?? a.installmentId)
  const month = labels.length > 2 ? `${labels[0]} – ${labels[labels.length - 1]}` : labels.join(' & ')
  window.open(`/print-receipt?month=${encodeURIComponent(month)}&amount=${payment.amount}&txnId=${encodeURIComponent(payment.reference || payment.receiptNo)}`, '_blank')
}

function LegendRow() {
  return (
    <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
      {(Object.keys(LINE_STYLES) as FeeLine['status'][]).map((k) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <span className={cn('h-3 w-3 rounded', LINE_STYLES[k].cell)} />
          {LINE_STYLES[k].label}
        </span>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/*                              Record a payment                             */
/* ------------------------------------------------------------------------- */

function RecordPaymentForm({ initialStudentId, receivedBy, onDone }: { initialStudentId?: string; receivedBy: string; onDone: (p: Payment) => void }) {
  const { data, recordPayment } = useSchoolData()
  const [studentId, setStudentId] = useState(initialStudentId || ROSTER[0].id)
  const ledger = feeLedger(data.payments, studentId)
  const suggested = ledger.overdue || ledger.lines.find((l) => l.balance > 0)?.balance || 0
  const [amount, setAmount] = useState(String(suggested))
  const [method, setMethod] = useState<PaymentMethod>('UPI')
  const [reference, setReference] = useState('')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')

  const value = Number(amount)
  const preview = value > 0 ? allocatePayment(data.payments, studentId, value) : { allocations: [], unallocated: 0 }

  const changeStudent = (id: string) => {
    setStudentId(id)
    const l = feeLedger(data.payments, id)
    setAmount(String(l.overdue || l.lines.find((x) => x.balance > 0)?.balance || 0))
  }

  const save = () => {
    if (!(value > 0)) return setError('Enter an amount greater than ₹0.')
    if (value > ledger.balance) return setError(`Amount is more than the outstanding balance of ${formatINR(ledger.balance)}.`)
    if (method !== 'Cash' && reference.trim().length < 4) return setError('Enter the transaction / cheque reference.')
    const payment = recordPayment({ studentId, amount: value, method, reference: reference.trim().toUpperCase() || `CASH-${Date.now().toString().slice(-6)}`, date, receivedBy })
    if (payment) onDone(payment)
  }

  return (
    <div className="space-y-4">
      <Field label="Student">
        <select value={studentId} onChange={(e) => changeStudent(e.target.value)} className={inputClass}>
          {CLASSES.map((c) => (
            <optgroup key={c} label={`Class ${c}`}>
              {ROSTER.filter((s) => s.classId === c).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Roll {s.rollNo})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="font-semibold text-slate-500">Paid</p>
          <p className="font-bold text-emerald-600">{formatINR(ledger.paid)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="font-semibold text-slate-500">Overdue</p>
          <p className="font-bold text-rose-600">{formatINR(ledger.overdue)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="font-semibold text-slate-500">Balance</p>
          <p className="font-bold text-slate-900">{formatINR(ledger.balance)}</p>
        </div>
      </div>
      {ledger.balance === 0 ? (
        <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">All fees for this year are cleared.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (₹)">
              <input type="number" min={1} value={amount} onChange={(e) => { setAmount(e.target.value); setError('') }} className={inputClass} />
            </Field>
            <Field label="Date">
              <input type="date" max={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Method">
              <select value={method} onChange={(e) => { setMethod(e.target.value as PaymentMethod); setError('') }} className={inputClass}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label={method === 'Cheque' ? 'Cheque no.' : 'UTR / Txn ID'}>
              <input value={reference} disabled={method === 'Cash'} placeholder={method === 'Cash' ? 'Not needed' : 'e.g. UTR123456789'} onChange={(e) => { setReference(e.target.value); setError('') }} className={inputClass} />
            </Field>
          </div>
          {preview.allocations.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-3 text-sm">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Will be applied to</p>
              {preview.allocations.map((a) => (
                <p key={a.installmentId} className="flex justify-between text-slate-700">
                  <span>{INSTALLMENTS.find((i) => i.id === a.installmentId)?.label}</span>
                  <span className="font-semibold">{formatINR(a.amount)}</span>
                </p>
              ))}
            </div>
          )}
          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
          <button type="button" onClick={save} className={cn(primaryButton, 'w-full')}>
            <CheckCircle2 size={16} /> Save payment & generate receipt
          </button>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/*                               Payment sheet                               */
/* ------------------------------------------------------------------------- */

export function PaymentSheet({ receivedBy = 'Accounts Office', readOnly = false }: { receivedBy?: string; readOnly?: boolean }) {
  const { data } = useSchoolData()
  const [query, setQuery] = useState('')
  const [classFilter, setClassFilter] = useState<'all' | ClassId>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'on-track' | 'cleared'>('all')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [recordFor, setRecordFor] = useState<string | null | undefined>(undefined)
  const [lastPayment, setLastPayment] = useState<Payment | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const rows = useMemo(() => ROSTER.map((s) => ({ student: s, ledger: feeLedger(data.payments, s.id) })), [data.payments])

  const totals = rows.reduce(
    (a, r) => ({ expected: a.expected + r.ledger.total, paid: a.paid + r.ledger.paid, overdue: a.overdue + r.ledger.overdue, defaulters: a.defaulters + (r.ledger.overdue > 0 ? 1 : 0) }),
    { expected: 0, paid: 0, overdue: 0, defaulters: 0 }
  )
  const thisMonth = todayISO().slice(0, 7)
  const collectedThisMonth = data.payments.filter((p) => p.date.startsWith(thisMonth)).reduce((a, p) => a + p.amount, 0)

  const filtered = rows
    .filter((r) => classFilter === 'all' || r.student.classId === classFilter)
    .filter((r) => statusFilter === 'all' || r.ledger.status === statusFilter)
    .filter((r) => !query.trim() || `${r.student.name} ${r.student.parentName} ${r.student.id}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.student.classId.localeCompare(b.student.classId) || a.student.rollNo - b.student.rollNo)

  const recent = [...data.payments].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 8)

  const exportSheet = () => {
    const header = ['Student ID', 'Student', 'Class', 'Roll', 'Parent', 'Phone', ...MONTHS.map((m) => m.slice(0, 3)), 'Total', 'Paid', 'Balance', 'Overdue', 'Status']
    const out = filtered.map((r) => [
      r.student.id,
      r.student.name,
      r.student.classId,
      r.student.rollNo,
      r.student.parentName,
      r.student.parentPhone,
      ...r.ledger.lines.map((l) => l.paid),
      r.ledger.total,
      r.ledger.paid,
      r.ledger.balance,
      r.ledger.overdue,
      STUDENT_STATUS[r.ledger.status].label,
    ])
    downloadCSV(`fee-payment-sheet-${todayISO()}.csv`, [header, ...out])
  }

  const detail = detailId ? rows.find((r) => r.student.id === detailId) : null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Collected" value={formatINR(totals.paid)} hint={`of ${formatINR(totals.expected)} for the year`} tone="emerald" icon={<Wallet size={18} />} />
        <StatTile label="Outstanding" value={formatINR(totals.expected - totals.paid)} hint={`${Math.round((totals.paid / totals.expected) * 100)}% collected`} tone="slate" />
        <StatTile label="Overdue" value={formatINR(totals.overdue)} hint={`${totals.defaulters} students behind`} tone="rose" icon={<AlertTriangle size={18} />} />
        <StatTile label="This month" value={formatINR(collectedThisMonth)} hint="received so far" tone="blue" icon={<IndianRupee size={18} />} />
      </div>

      <Panel>
        <PanelHeader
          eyebrow="Payment sheet"
          title="Fee collection 2026"
          description="Monthly tuition of ₹5,000 due on the 10th. Click a student for their full ledger."
          actions={
            <>
              <button type="button" onClick={exportSheet} className={secondaryButton}>
                <Download size={16} /> Export CSV
              </button>
              {!readOnly && (
                <button type="button" onClick={() => setRecordFor(null)} className={primaryButton}>
                  <Plus size={16} /> Record payment
                </button>
              )}
            </>
          }
        />

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search student or parent" className={cn(inputClass, 'py-2.5 pl-10')} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Segmented value={classFilter} onChange={setClassFilter} options={[{ value: 'all', label: 'All classes' }, ...CLASSES.map((c) => ({ value: c, label: c }))]} />
            <Segmented
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'on-track', label: 'On track' },
                { value: 'cleared', label: 'Cleared' },
              ]}
            />
          </div>
        </div>

        <div className="mb-3">
          <LegendRow />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Search size={32} />} title="No students match" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-50 px-3 py-3 text-left">Student</th>
                  {MONTHS.map((m) => (
                    <th key={m} className="px-1 py-3 text-center">{m.slice(0, 3)}</th>
                  ))}
                  <th className="px-3 py-3 text-right">Paid</th>
                  <th className="px-3 py-3 text-right">Balance</th>
                  <th className="px-3 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ student, ledger }) => (
                  <tr key={student.id} onClick={() => setDetailId(student.id)} className="cursor-pointer border-t border-slate-100 transition hover:bg-blue-50/40">
                    <td className="sticky left-0 z-10 whitespace-nowrap bg-white px-3 py-2.5">
                      <p className="font-bold text-slate-900">{student.name}</p>
                      <p className="text-xs text-slate-500">
                        {student.classId} · Roll {student.rollNo}
                      </p>
                    </td>
                    {ledger.lines.map((l) => (
                      <td key={l.id} className="px-0.5 py-2 text-center">
                        <span title={`${l.label}: ${LINE_STYLES[l.status].label}${l.paid ? ` (${formatINR(l.paid)})` : ''}`} className={cn('inline-flex h-7 w-9 items-center justify-center rounded-lg text-[11px] font-bold', LINE_STYLES[l.status].cell)}>
                          {l.status === 'paid' ? '✓' : l.status === 'partial' ? '½' : l.status === 'overdue' ? '!' : '·'}
                        </span>
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-emerald-700">{formatINR(ledger.paid)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right font-bold text-slate-900">{formatINR(ledger.balance)}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge className={STUDENT_STATUS[ledger.status].className}>{STUDENT_STATUS[ledger.status].label}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
                <tr>
                  <td className="sticky left-0 z-10 bg-slate-50 px-3 py-3">Collected per month</td>
                  {INSTALLMENTS.map((inst, i) => {
                    const sum = filtered.reduce((a, r) => a + r.ledger.lines[i].paid, 0)
                    return (
                      <td key={inst.id} className="px-0.5 py-3 text-center text-[10px]">
                        {sum ? `${Math.round(sum / 1000)}k` : '–'}
                      </td>
                    )
                  })}
                  <td className="px-3 py-3 text-right text-emerald-700">{formatINR(filtered.reduce((a, r) => a + r.ledger.paid, 0))}</td>
                  <td className="px-3 py-3 text-right">{formatINR(filtered.reduce((a, r) => a + r.ledger.balance, 0))}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader eyebrow="Activity" title="Recent payments" />
        <ul className="divide-y divide-slate-100">
          {recent.map((p) => {
            const s = findStudent(p.studentId)
            return (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">
                    {s?.name} <span className="font-medium text-slate-500">· {s?.classId}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.receiptNo} · {formatDate(p.date)} · {p.method}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-emerald-700">{formatINR(p.amount)}</span>
                  <button type="button" onClick={() => openReceipt(p)} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Print receipt">
                    <Printer size={16} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </Panel>

      <Modal open={!!detail} onClose={() => setDetailId(null)} title={detail ? `${detail.student.name} · fee ledger` : ''} wide>
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div>
                <p className="font-bold text-slate-900">
                  Class {detail.student.classId} · Roll {detail.student.rollNo} · {detail.student.id}
                </p>
                <p className="text-slate-600">
                  Parent: {detail.student.parentName} · {detail.student.parentPhone}
                </p>
              </div>
              <Badge className={STUDENT_STATUS[detail.ledger.status].className}>{STUDENT_STATUS[detail.ledger.status].label}</Badge>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-sm font-semibold text-slate-700">
                <span>{formatINR(detail.ledger.paid)} paid</span>
                <span>{formatINR(detail.ledger.balance)} remaining</span>
              </div>
              <ProgressBar value={(detail.ledger.paid / detail.ledger.total) * 100} barClassName="from-emerald-500 to-teal-600" />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {detail.ledger.lines.map((l) => (
                <div key={l.id} className={cn('rounded-xl p-2.5 text-xs', LINE_STYLES[l.status].cell)}>
                  <p className="font-bold">{l.label.replace(' Tuition', '')}</p>
                  <p>{l.status === 'paid' ? formatINR(l.paid) : l.status === 'upcoming' ? `Due ${formatDate(l.dueDate, { day: 'numeric', month: 'short' })}` : `${formatINR(l.balance)} due`}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Payment history</h4>
              {detail.ledger.payments.length === 0 ? (
                <p className="text-sm text-slate-500">No payments yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                  {detail.ledger.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {formatDate(p.date)} · {p.method}
                        </p>
                        <p className="text-xs text-slate-500">
                          {p.receiptNo} · {p.reference}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-700">{formatINR(p.amount)}</span>
                        <button type="button" onClick={() => openReceipt(p)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Print receipt">
                          <Receipt size={15} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {!readOnly && detail.ledger.balance > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRecordFor(detail.student.id)
                    setDetailId(null)
                  }}
                  className={primaryButton}
                >
                  <Plus size={16} /> Record payment
                </button>
              )}
              {detail.ledger.overdue > 0 && (
                <button type="button" onClick={() => setToast(`Fee reminder sent to ${detail.student.parentName}`)} className={secondaryButton}>
                  <BellRing size={16} /> Send reminder ({formatINR(detail.ledger.overdue)} overdue)
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={recordFor !== undefined} onClose={() => setRecordFor(undefined)} title="Record a fee payment">
        {recordFor !== undefined && (
          <RecordPaymentForm
            initialStudentId={recordFor || undefined}
            receivedBy={receivedBy}
            onDone={(p) => {
              setRecordFor(undefined)
              setLastPayment(p)
            }}
          />
        )}
      </Modal>

      <Modal open={!!lastPayment} onClose={() => setLastPayment(null)} title="Payment recorded">
        {lastPayment && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 size={34} className="text-emerald-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{formatINR(lastPayment.amount)}</p>
            <p className="mt-1 text-sm text-slate-600">
              from {findStudent(lastPayment.studentId)?.name} · {lastPayment.method}
            </p>
            <p className="mt-1 font-mono text-xs text-slate-500">{lastPayment.receiptNo}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setLastPayment(null)} className={secondaryButton}>
                Done
              </button>
              <button type="button" onClick={() => openReceipt(lastPayment)} className={primaryButton}>
                <Printer size={16} /> Print receipt
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}
