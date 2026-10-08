'use client'

import { useState } from 'react'
import Header from '@/components/header'
import { ProtectedRoute } from '@/components/protected-route'
import { FileText, Download, Printer, TrendingUp, Calendar, DollarSign, ArrowLeft, Sheet } from 'lucide-react'
import Link from 'next/link'
import { PaymentSheet } from '@/components/school/fees'
import MobileTabs from '@/components/mobile-tabs'
import { useSchoolData } from '@/context/school-data-context'
import { CLASSES, PaymentMethod, ROSTER, feeLedger, findStudent, formatINR } from '@/lib/school-data'

interface StudentReceipt {
  id: string
  studentId: string
  name: string
  utrNo: string
  feeAmount: number
  date: string
  paymentMethod: string
  status: 'Paid' | 'Pending'
}

interface RevenueData {
  week: number
  weeklyRevenue: number
  monthlyRevenue: number
  yearlyRevenue: number
}

interface RevenueStudentInfo {
  name: string
  className: string
  rollNo: string
}

function AccountantPortalContent() {
  const [activeTab, setActiveTab] = useState<'sheet' | 'receipts' | 'revenue'>('sheet')
  const { data, recordPayment } = useSchoolData()
  const receipts: StudentReceipt[] = [...data.payments]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .map((p) => ({
      id: p.id,
      studentId: p.studentId,
      name: findStudent(p.studentId)?.name ?? p.studentId,
      utrNo: p.reference,
      feeAmount: p.amount,
      date: p.date,
      paymentMethod: p.method,
      status: 'Paid',
    }))

  const [formData, setFormData] = useState({
    studentId: '',
    utrNo: '',
    feeAmount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
  })

  const [previewReceipt, setPreviewReceipt] = useState<StudentReceipt | null>(null)
  const [hasGeneratedReceipt, setHasGeneratedReceipt] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [selectedRevenueStudent, setSelectedRevenueStudent] = useState<RevenueStudentInfo | null>(null)

  const [revenueData] = useState<RevenueData[]>([
    { week: 1, weeklyRevenue: 50000, monthlyRevenue: 200000, yearlyRevenue: 2400000 },
    { week: 2, weeklyRevenue: 55000, monthlyRevenue: 210000, yearlyRevenue: 2520000 },
    { week: 3, weeklyRevenue: 48000, monthlyRevenue: 195000, yearlyRevenue: 2340000 },
    { week: 4, weeklyRevenue: 62000, monthlyRevenue: 225000, yearlyRevenue: 2700000 },
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'utrNo' ? value.toUpperCase().replace(/\s/g, '') : value
    }))
    setFormErrors(prev => {
      const { [name]: _removedError, ...remainingErrors } = prev
      return remainingErrors
    })
  }

  const generateReceipt = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const errors: Record<string, string> = {}
    const feeAmount = Number(formData.feeAmount)
    const utrNo = formData.utrNo.trim()

    if (!formData.studentId) errors.studentId = 'Select the student.'
    if (!/^[A-Z0-9-]{6,30}$/.test(utrNo)) errors.utrNo = 'Enter a valid transaction ID (6–30 letters, numbers, or hyphens).'
    if (!Number.isFinite(feeAmount) || feeAmount <= 0) errors.feeAmount = 'Enter an amount greater than ₹0.'
    if (!formData.date) errors.date = 'Select the payment date.'
    if (!formData.paymentMethod) errors.paymentMethod = 'Select a payment method.'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const balance = feeLedger(data.payments, formData.studentId).balance
    if (feeAmount > balance) {
      setFormErrors({ feeAmount: balance === 0 ? 'This student has no fees outstanding.' : `Amount is more than the outstanding balance of ${formatINR(balance)}.` })
      return
    }

    // Recorded as a real payment, so it also shows on the payment sheet and the parent's fee tab.
    const methodMap: Record<string, PaymentMethod> = { 'Bank Transfer': 'Bank Transfer', Online: 'UPI', Cash: 'Cash', Cheque: 'Cheque' }
    const payment = recordPayment({
      studentId: formData.studentId,
      amount: feeAmount,
      method: methodMap[formData.paymentMethod] ?? 'Bank Transfer',
      reference: utrNo,
      date: formData.date,
      receivedBy: 'Mr. Rajesh Kumar',
    })
    if (!payment) return

    const newReceipt: StudentReceipt = {
      id: payment.id,
      studentId: payment.studentId,
      name: findStudent(payment.studentId)?.name ?? '',
      utrNo,
      feeAmount: payment.amount,
      date: payment.date,
      paymentMethod: formData.paymentMethod,
      status: 'Paid',
    }

    setPreviewReceipt(newReceipt)
    setHasGeneratedReceipt(true)
    setFormErrors({})
    setFormData({
      studentId: '',
      utrNo: '',
      feeAmount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
    })
  }

  const downloadReceipt = (receipt: StudentReceipt) => {
    const receiptHTML = generateReceiptHTML(receipt)
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(receiptHTML))
    element.setAttribute('download', `Receipt_${receipt.utrNo}.html`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const printReceipt = (receipt: StudentReceipt) => {
    const receiptHTML = generateReceiptHTML(receipt)
    const printWindow = window.open('', '', 'height=500,width=800')
    if (printWindow) {
      printWindow.document.write(receiptHTML)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const generateReceiptHTML = (receipt: StudentReceipt): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .receipt-container { max-width: 600px; margin: 0 auto; border: 2px solid #000; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0; color: #666; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .detail-item { }
          .detail-label { font-weight: bold; color: #333; font-size: 12px; }
          .detail-value { font-size: 14px; margin-top: 5px; }
          .student-section { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #000; }
          .student-name { font-size: 20px; font-weight: bold; margin: 10px 0; }
          .fee-table { width: 100%; margin-bottom: 20px; }
          .fee-table td { padding: 10px; border-bottom: 1px solid #ddd; }
          .fee-table .header-row { font-weight: bold; border-bottom: 1px solid #333; }
          .total-section { text-align: right; margin-bottom: 20px; }
          .total-amount { font-size: 24px; font-weight: bold; }
          .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; border-top: 2px solid #000; padding-top: 20px; }
          .signature-line { min-height: 80px; }
          .signature-label { font-size: 12px; color: #666; }
          .footer { margin-top: 20px; padding: 10px; background: #f5f5f5; font-size: 11px; line-height: 1.6; }
          @media print {
            body { margin: 0; }
            .receipt-container { border: 1px solid #ccc; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>FEE RECEIPT</h1>
            <p>EduPro School Management System</p>
          </div>

          <div class="details">
            <div class="detail-item">
              <div class="detail-label">Receipt No.</div>
              <div class="detail-value">${receipt.utrNo}</div>
            </div>
            <div class="detail-item" style="text-align: right;">
              <div class="detail-label">Date</div>
              <div class="detail-value">${receipt.date}</div>
            </div>
          </div>

          <div class="student-section">
            <div class="detail-label">Student Name</div>
            <div class="student-name">${receipt.name}</div>
          </div>

          <table class="fee-table">
            <tr class="header-row">
              <td>Description</td>
              <td style="text-align: right;">Amount</td>
            </tr>
            <tr>
              <td>School Fee</td>
              <td style="text-align: right; font-weight: bold;">₹${receipt.feeAmount.toLocaleString()}</td>
            </tr>
          </table>

          <div class="total-section">
            <div style="color: #666; font-size: 12px;">Total Amount</div>
            <div class="total-amount">₹${receipt.feeAmount.toLocaleString()}</div>
          </div>

          <div class="signature-section">
            <div class="signature-line">
              <div class="signature-label">Received By</div>
              <div style="border-top: 1px solid #000; margin-top: 50px; padding-top: 5px;">_________________</div>
            </div>
            <div class="signature-line">
              <div class="signature-label">Authorized By</div>
              <div style="border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; text-align: right;">_________________</div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Payment Method:</strong> ${receipt.paymentMethod}</p>
            <p><strong>Status:</strong> ${receipt.status}</p>
            <p>This is a computer-generated receipt. No signature required.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const calculateTotalRevenue = () => {
    return receipts.reduce((sum, receipt) => sum + receipt.feeAmount, 0)
  }

  const getStudentRevenue = (studentName: string) => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setHours(0, 0, 0, 0)
    startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7))

    return receipts.reduce(
      (totals, receipt) => {
        if (receipt.name !== studentName) return totals

        const paymentDate = new Date(`${receipt.date}T00:00:00`)
        if (paymentDate >= startOfWeek && paymentDate <= today) totals.weekly += receipt.feeAmount
        if (paymentDate.getMonth() === today.getMonth() && paymentDate.getFullYear() === today.getFullYear()) totals.monthly += receipt.feeAmount
        if (paymentDate.getFullYear() === today.getFullYear()) totals.yearly += receipt.feeAmount
        return totals
      },
      { weekly: 0, monthly: 0, yearly: 0 }
    )
  }

  const getStudentRevenueRows = () => {
    return Array.from(new Set(receipts.map((receipt) => receipt.name))).map((name) => {
      const studentReceipts = receipts.filter((receipt) => receipt.name === name)
      return {
        name,
        latestReceipt: studentReceipts[0],
        paymentCount: studentReceipts.length,
        ...getStudentRevenue(name),
      }
    })
  }

  const getStudentRevenueTimeline = (studentName: string) => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setHours(0, 0, 0, 0)
    startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    const studentPayments = receipts.filter((receipt) => receipt.name.toLowerCase() === studentName.toLowerCase())
    const amountFor = (matches: (date: Date) => boolean) => studentPayments.reduce((total, receipt) => {
      const paymentDate = new Date(`${receipt.date}T00:00:00`)
      return matches(paymentDate) ? total + receipt.feeAmount : total
    }, 0)

    const weekly = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + index)
      return {
        label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        amount: amountFor((paymentDate) => paymentDate.toDateString() === date.toDateString()),
      }
    })

    const monthly = Array.from({ length: Math.ceil(new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() / 7) }, (_, index) => {
      const startDay = index * 7 + 1
      const endDay = Math.min(startDay + 6, new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate())
      return {
        label: `Week ${index + 1}`,
        amount: amountFor((paymentDate) => paymentDate.getFullYear() === today.getFullYear() && paymentDate.getMonth() === today.getMonth() && paymentDate.getDate() >= startDay && paymentDate.getDate() <= endDay),
      }
    })

    const yearly = Array.from({ length: 12 }, (_, index) => ({
      label: new Date(today.getFullYear(), index, 1).toLocaleDateString('en-IN', { month: 'short' }),
      amount: amountFor((paymentDate) => paymentDate.getFullYear() === today.getFullYear() && paymentDate.getMonth() === index),
    }))

    return { weekly, monthly, yearly }
  }

  const [revenueStudentId, setRevenueStudentId] = useState('')

  const submitRevenueStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const student = findStudent(revenueStudentId)
    if (!student) return
    setSelectedRevenueStudent({ name: student.name, className: student.classId, rollNo: String(student.rollNo) })
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-5 sm:py-8">
        <div className="flex items-start sm:items-center justify-between gap-3 mb-5 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Accountant Portal</h1>
            <p className="text-gray-600 mt-2">Manage student receipts and revenue tracking</p>
          </div>
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ArrowLeft size={20} />
            Back Home
          </Link>
        </div>

        {/* SHOW ONLY RECEIPT WHEN GENERATED - HIDE EVERYTHING ELSE */}
        {previewReceipt ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">✅ Receipt Generated Successfully!</h2>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Receipt */}
            <div className="max-w-2xl mx-auto bg-white border-2 border-gray-900 p-8 mb-8" id="receipt-preview">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">FEE RECEIPT</h1>
                <p className="text-gray-600 mt-1">EduPro School Management System</p>
                <p className="text-xs text-gray-500 mt-1">Receipt No. {previewReceipt.utrNo}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b-2 border-gray-900">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Receipt Number</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{previewReceipt.utrNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">Date</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{previewReceipt.date}</p>
                </div>
              </div>

              <div className="mb-8 pb-8 border-b-2 border-gray-900">
                <p className="text-sm font-semibold text-gray-700">Student Name</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{previewReceipt.name}</p>
              </div>

              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="text-left py-3 text-sm font-semibold text-gray-700">Description</th>
                      <th className="text-right py-3 text-sm font-semibold text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="py-4 text-gray-900">School Fee (Tuition)</td>
                      <td className="text-right py-4 font-semibold text-gray-900">₹{previewReceipt.feeAmount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-8 pb-8 border-b-2 border-gray-900">
                <div className="text-right">
                  <p className="text-xs text-gray-600 mb-1">Total Amount Due</p>
                  <p className="text-3xl font-bold text-gray-900">₹{previewReceipt.feeAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-8">
                <div>
                  <p className="text-xs text-gray-600 mb-16">Received By</p>
                  <p className="text-sm font-semibold text-gray-900 border-t-2 border-gray-900 pt-2">_________________</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 mb-16">Authorized By</p>
                  <p className="text-sm font-semibold text-gray-900 border-t-2 border-gray-900 pt-2">_________________</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded text-xs text-gray-600 border border-blue-200">
                <p className="mb-1"><strong>Payment Method:</strong> {previewReceipt.paymentMethod}</p>
                <p className="mb-1"><strong>Status:</strong> <span className="text-green-600 font-semibold">{previewReceipt.status}</span></p>
                <p className="text-gray-500">This is a computer-generated receipt and is valid without a signature.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mt-8 mb-8 flex-wrap">
              <button
                onClick={() => printReceipt(previewReceipt)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-8 rounded-lg font-semibold transition shadow-lg transform hover:scale-105"
              >
                <Printer size={20} />
                Print Receipt
              </button>
              <button
                onClick={() => downloadReceipt(previewReceipt)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-semibold transition shadow-lg transform hover:scale-105"
              >
                <Download size={20} />
                Download Receipt
              </button>
            </div>

            {/* Back Button */}
            <div className="text-center">
              <button
                onClick={() => setPreviewReceipt(null)}
                className="text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                ← Generate Another Receipt
              </button>
            </div>
          </div>
        ) : (
          <>
            <MobileTabs
              tabs={[
                { id: 'sheet', label: 'Payment Sheet', icon: Sheet },
                { id: 'receipts', label: 'Receipts & Payments', icon: FileText },
                { id: 'revenue', label: 'Revenue Report', icon: TrendingUp },
              ]}
              active={activeTab}
              onChange={(id) => setActiveTab(id as 'sheet' | 'receipts' | 'revenue')}
            />

            {/* Tab Navigation */}
            <div className="hidden sm:block bg-white rounded-lg border border-gray-200 mb-6 sticky top-24 z-40">
              <div className="flex overflow-x-auto border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('sheet')}
                  className={`flex-1 whitespace-nowrap py-4 px-6 font-semibold transition ${
                    activeTab === 'sheet'
                      ? 'text-slate-900 border-b-2 border-slate-900 bg-slate-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Sheet size={20} />
                    Payment Sheet
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('receipts')}
                  className={`flex-1 py-4 px-6 font-semibold transition ${
                    activeTab === 'receipts'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FileText size={20} />
                    Receipts & Payments
                  </div>
                </button>
                <button
                    onClick={() => setActiveTab('revenue')}
                    className={`flex-1 py-4 px-6 font-semibold transition ${
                      activeTab === 'revenue'
                        ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp size={20} />
                      Revenue Report
                    </div>
                  </button>
          </div>
        </div>

        {activeTab === 'sheet' && <PaymentSheet receivedBy="Mr. Rajesh Kumar" />}

        {/* Receipts Tab */}
        {activeTab === 'receipts' && !previewReceipt && (
          <div className="space-y-6">
            {/* Add Receipt Form */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Generate Student Receipt</h2>
              <p className="text-center text-sm text-gray-600 -mt-5 mb-6">Enter payment details below. Required fields are marked with *.</p>
              <form onSubmit={generateReceipt} noValidate className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    👤 Student Name *
                  </label>
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    aria-invalid={Boolean(formErrors.studentId)}
                    aria-describedby={formErrors.studentId ? 'name-error' : undefined}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  >
                    <option value="">Select student</option>
                    {CLASSES.map((c) => (
                      <optgroup key={c} label={`Class ${c}`}>
                        {ROSTER.filter((st) => st.classId === c).map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} (Roll {st.rollNo})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {formData.studentId && (
                    <p className="mt-2 text-sm text-gray-600">
                      Outstanding: <span className="font-semibold text-gray-900">{formatINR(feeLedger(data.payments, formData.studentId).balance)}</span>
                    </p>
                  )}
                  {formErrors.studentId && <p id="name-error" className="mt-2 text-sm text-red-600">{formErrors.studentId}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🔖 UTR Number (Unique Transaction Reference) *
                  </label>
                  <input
                    type="text"
                    name="utrNo"
                    value={formData.utrNo}
                    onChange={handleInputChange}
                    placeholder="e.g., UTR20240815001"
                    maxLength={30}
                    autoCapitalize="characters"
                    spellCheck={false}
                    aria-invalid={Boolean(formErrors.utrNo)}
                    aria-describedby="utr-help utr-error"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  />
                  <p id="utr-help" className="text-xs text-gray-600 mt-2">Use the bank/UPI reference or receipt number. Spaces are removed automatically.</p>
                  {formErrors.utrNo && <p id="utr-error" className="mt-2 text-sm text-red-600">{formErrors.utrNo}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    💰 Fee Amount (₹) *
                  </label>
                  <input
                    type="number"
                    name="feeAmount"
                    value={formData.feeAmount}
                    onChange={handleInputChange}
                    placeholder="e.g., 5000"
                    min="1"
                    step="0.01"
                    inputMode="decimal"
                    aria-invalid={Boolean(formErrors.feeAmount)}
                    aria-describedby={formErrors.feeAmount ? 'amount-error' : undefined}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition"
                  />
                  {formErrors.feeAmount && <p id="amount-error" className="mt-2 text-sm text-red-600">{formErrors.feeAmount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    📅 Payment Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split('T')[0]}
                      aria-invalid={Boolean(formErrors.date)}
                      aria-describedby={formErrors.date ? 'date-error' : undefined}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg text-gray-900 [color-scheme:light] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition"
                    />
                    <Calendar size={21} aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-900" />
                  </div>
                  {formErrors.date && <p id="date-error" className="mt-2 text-sm text-red-600">{formErrors.date}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    💳 Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    aria-invalid={Boolean(formErrors.paymentMethod)}
                    aria-describedby={formErrors.paymentMethod ? 'method-error' : undefined}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition"
                  >
                    <option value="Bank Transfer">🏦 Bank Transfer (NEFT/RTGS)</option>
                    <option value="Online">💻 Online Payment (Google Pay, PhonePe, Paytm, UPI)</option>
                    <option value="Cash">💵 Cash Payment (Direct)</option>
                    <option value="Cheque">📄 Cheque Payment</option>
                  </select>
                  {formErrors.paymentMethod && <p id="method-error" className="mt-2 text-sm text-red-600">{formErrors.paymentMethod}</p>}
                </div>
              </div>
              <button
                type="submit"
                className="mt-8 w-full md:w-96 mx-auto block bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-lg font-bold text-lg shadow-lg transition transform hover:scale-105"
              >
                ✓ Generate Receipt
              </button>
              </form>
            </div>

            <div className="hidden" aria-hidden="true">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Receipts</p>
                    <p className="text-3xl font-bold mt-2">{receipts.length}</p>
                  </div>
                  <FileText size={40} className="opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Revenue</p>
                    <p className="text-3xl font-bold mt-2">₹{calculateTotalRevenue().toLocaleString()}</p>
                  </div>
                  <DollarSign size={40} className="opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Avg. Per Receipt</p>
                    <p className="text-3xl font-bold mt-2">
                      ₹{receipts.length > 0 ? Math.round(calculateTotalRevenue() / receipts.length).toLocaleString() : '0'}
                    </p>
                  </div>
                  <Calendar size={40} className="opacity-50" />
                </div>
              </div>
            </div>

            {/* Receipts List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Generated Receipts</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">UTR No.</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Method</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {receipts.map((receipt) => (
                      <tr key={receipt.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{receipt.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{receipt.utrNo}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">₹{receipt.feeAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{receipt.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{receipt.paymentMethod}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            {receipt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => downloadReceipt(receipt)}
                              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition"
                              title="Download"
                            >
                              <Download size={18} />
                            </button>
                            <button
                              onClick={() => printReceipt(receipt)}
                              className="text-purple-600 hover:text-purple-800 p-2 hover:bg-purple-50 rounded transition"
                              title="Print"
                            >
                              <Printer size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 text-center">View Student Revenue</h2>
              <p className="text-center text-sm text-gray-600 mt-2 mb-6">Choose a student to see the fees they have paid.</p>
              <form onSubmit={submitRevenueStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <select
                  value={revenueStudentId}
                  onChange={(e) => setRevenueStudentId(e.target.value)}
                  className="md:col-span-2 w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select student</option>
                  {CLASSES.map((c) => (
                    <optgroup key={c} label={`Class ${c}`}>
                      {ROSTER.filter((st) => st.classId === c).map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} (Roll {st.rollNo})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-bold transition">Show Revenue</button>
              </form>
            </div>

            {selectedRevenueStudent && (receipts.length === 0 || !getStudentRevenueRows().some((student) => student.name.toLowerCase() === selectedRevenueStudent.name.toLowerCase()) ? (
              <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
                <TrendingUp size={42} className="mx-auto text-green-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">No payment data found</h2>
                <p className="text-gray-600 mt-2">{selectedRevenueStudent.name} has no payments recorded yet. Record one in Receipts & Payments or the Payment Sheet.</p>
              </div>
            ) : (
              <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                <p className="text-sm opacity-90">Student</p>
                <p className="text-2xl font-bold mt-2">{selectedRevenueStudent.name}</p>
                <p className="text-sm mt-1 opacity-90">Class {selectedRevenueStudent.className} · Roll {selectedRevenueStudent.rollNo}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-lg">
                <p className="text-sm opacity-90">This Month</p>
                <p className="text-3xl font-bold mt-2">₹{getStudentRevenue(selectedRevenueStudent.name).monthly.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-lg">
                <p className="text-sm opacity-90">This Year</p>
                <p className="text-3xl font-bold mt-2">₹{getStudentRevenue(selectedRevenueStudent.name).yearly.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900">Student Revenue Graph</h2>
              <p className="text-sm text-gray-600 mt-1 mb-6">Weekly, monthly and yearly fee collection for {selectedRevenueStudent.name}.</p>
              <div className="hidden">
              <div className="space-y-6">
                {getStudentRevenueRows().filter((student) => student.name.toLowerCase() === selectedRevenueStudent.name.toLowerCase()).map((student) => {
                  const maximumRevenue = Math.max(student.weekly, student.monthly, student.yearly, 1)
                  return (
                    <div key={student.name} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                      <p className="font-semibold text-gray-900 mb-3">{student.name}</p>
                      {([
                        ['Weekly', student.weekly, 'bg-blue-500'],
                        ['Monthly', student.monthly, 'bg-green-500'],
                        ['Yearly', student.yearly, 'bg-purple-500'],
                      ] as const).map(([label, amount, color]) => (
                        <div key={label} className="flex items-center gap-3 mb-2">
                          <span className="w-16 text-sm text-gray-600">{label}</span>
                          <div className="flex-1 h-7 overflow-hidden rounded-full bg-gray-100">
                            <div className={`${color} h-full min-w-1 flex items-center justify-end px-3 text-xs font-semibold text-white transition-all`} style={{ width: `${Math.max((amount / maximumRevenue) * 100, amount > 0 ? 8 : 0)}%` }} />
                          </div>
                          <span className="w-28 text-right text-sm font-semibold text-gray-900">₹{amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
              </div>
              <div className="space-y-8">
                {(['weekly', 'monthly', 'yearly'] as const).map((period) => {
                  const timeline = getStudentRevenueTimeline(selectedRevenueStudent.name)[period]
                  const maximumAmount = Math.max(...timeline.map((item) => item.amount), 1)
                  const titles = { weekly: 'Weekly Revenue (Day-wise)', monthly: 'Monthly Revenue (Week-wise)', yearly: 'Yearly Revenue (Month-wise)' }
                  const colors = { weekly: 'bg-blue-500', monthly: 'bg-green-500', yearly: 'bg-purple-500' }
                  return (
                    <div key={period}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{titles[period]}</h3>
                      <div className="flex h-56 items-end gap-2 border-b border-l border-gray-200 px-3 pt-5">
                        {timeline.map((item) => (
                          <div key={item.label} className="flex h-full flex-1 flex-col justify-end items-center min-w-0 group">
                            <span className="mb-2 text-xs font-semibold text-gray-700 whitespace-nowrap">₹{item.amount.toLocaleString()}</span>
                            <div className={`${colors[period]} w-full max-w-10 min-h-1 rounded-t transition-all`} style={{ height: `${Math.max((item.amount / maximumAmount) * 100, item.amount > 0 ? 5 : 1)}%` }} title={`${item.label}: ₹${item.amount.toLocaleString()}`} />
                            <span className="mt-2 text-xs text-gray-600">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{selectedRevenueStudent.name}'s Revenue</h2>
                <p className="text-sm text-gray-600 mt-1">Class {selectedRevenueStudent.className} · Roll No. {selectedRevenueStudent.rollNo}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">UTR / Transaction No.</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment Method</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Weekly Revenue</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Monthly Revenue</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Yearly Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getStudentRevenueRows().filter((student) => student.name.toLowerCase() === selectedRevenueStudent.name.toLowerCase()).map((student) => {
                      return (
                        <tr key={student.name} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}<span className="block text-xs font-normal text-gray-500 mt-1">{student.paymentCount} payment{student.paymentCount > 1 ? 's' : ''}</span></td>
                          <td className="px-6 py-4 text-sm text-gray-700">{student.latestReceipt.utrNo}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{student.latestReceipt.date}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{student.latestReceipt.paymentMethod}</td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">₹{student.weekly.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">₹{student.monthly.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">₹{student.yearly.toLocaleString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="hidden">
            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Current Week Revenue</p>
                    <p className="text-3xl font-bold mt-2">₹{revenueData[revenueData.length - 1].weeklyRevenue.toLocaleString()}</p>
                  </div>
                  <Calendar size={40} className="opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Current Month Revenue</p>
                    <p className="text-3xl font-bold mt-2">₹{revenueData[revenueData.length - 1].monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <Calendar size={40} className="opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Yearly Revenue</p>
                    <p className="text-3xl font-bold mt-2">₹{revenueData[revenueData.length - 1].yearlyRevenue.toLocaleString()}</p>
                  </div>
                  <TrendingUp size={40} className="opacity-50" />
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Trend</h2>
              <div className="space-y-6">
                {/* Weekly Revenue */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Revenue</h3>
                  <div className="space-y-3">
                    {revenueData.map((data) => (
                      <div key={`weekly-${data.week}`} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-medium text-gray-700">Week {data.week}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full flex items-center justify-end pr-4 text-white text-sm font-semibold"
                            style={{ width: `${(data.weeklyRevenue / 62000) * 100}%` }}
                          >
                            ₹{data.weeklyRevenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Revenue */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
                  <div className="space-y-3">
                    {revenueData.map((data) => (
                      <div key={`monthly-${data.week}`} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-medium text-gray-700">Month {data.week}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-400 h-full flex items-center justify-end pr-4 text-white text-sm font-semibold"
                            style={{ width: `${(data.monthlyRevenue / 225000) * 100}%` }}
                          >
                            ₹{data.monthlyRevenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Yearly Revenue */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Yearly Revenue</h3>
                  <div className="space-y-3">
                    {revenueData.map((data) => (
                      <div key={`yearly-${data.week}`} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-medium text-gray-700">Year {data.week}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-400 h-full flex items-center justify-end pr-4 text-white text-sm font-semibold"
                            style={{ width: `${(data.yearlyRevenue / 2700000) * 100}%` }}
                          >
                            ₹{data.yearlyRevenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Summary Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Revenue Summary</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Period</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Weekly</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Monthly</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Yearly</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {revenueData.map((data, index) => (
                      <tr key={data.week} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {index === 0 ? 'Week 1' : index === 1 ? 'Week 2' : index === 2 ? 'Week 3' : 'Week 4'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                          ₹{data.weeklyRevenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                          ₹{data.monthlyRevenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                          ₹{data.yearlyRevenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {index === 0 ? (
                            <span className="text-gray-600">-</span>
                          ) : (
                            <span className={data.weeklyRevenue > revenueData[index - 1].weeklyRevenue ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                              {data.weeklyRevenue > revenueData[index - 1].weeklyRevenue ? '+' : ''}
                              {Math.round((((data.weeklyRevenue - revenueData[index - 1].weeklyRevenue) / revenueData[index - 1].weeklyRevenue) * 100) * 10) / 10}%
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
              </>
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </main>
  )
}

export default function AccountantPortal() {
  return (
    <ProtectedRoute allowedRoles={['accountant']}>
      <AccountantPortalContent />
    </ProtectedRoute>
  )
}
