'use client'

import { useState } from 'react'
import Header from '@/components/header'
import { SiteFooter } from '@/components/home-sections'
import { CheckCircle, Clock, FileText, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdmissionsPage() {
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    motherName: '',
    dob: '',
    email: '',
    phone: '',
    grade: '',
    previousSchool: '',
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    alert('Application submitted successfully! We will contact you soon.')
    setFormData({
      studentName: '',
      fatherName: '',
      motherName: '',
      dob: '',
      email: '',
      phone: '',
      grade: '',
      previousSchool: '',
    })
  }

  const process = [
    {
      step: '1',
      title: 'Application',
      description: 'Fill out the admission form with required information'
    },
    {
      step: '2',
      title: 'Document Submission',
      description: 'Submit birth certificate, previous school records, and vaccination proof'
    },
    {
      step: '3',
      title: 'Entrance Exam',
      description: 'Appear for the entrance test in English, Mathematics, and General Knowledge'
    },
    {
      step: '4',
      title: 'Interview',
      description: 'Meet with admission counselor and school principal'
    },
    {
      step: '5',
      title: 'Selection',
      description: 'Receive admission decision and enrollment confirmation'
    },
  ]

  const requirements = [
    'Birth Certificate (Original + 2 copies)',
    'Previous School Transfer Certificate',
    'Character Certificate from Previous School',
    'Vaccination Certificate',
    'Parent\'s ID Proof (Aadhar/Passport)',
    'Proof of Residence',
    '4 Recent Passport Size Photographs',
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admissions 2026-27</h1>
          <p className="text-gray-600 mt-2">Join Stellar Academy and Start Your Journey</p>
        </div>

        {/* Key Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Last Date to Apply</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">March 15, 2026</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Entrance Exam Date</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">March 25, 2026</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Result Declaration</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">April 10, 2026</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Classes Begin</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">May 1, 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Form</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Student Name *</label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Father&apos;s Name *</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter father name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Mother&apos;s Name *</label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter mother name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Grade Applying For *</label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Grade</option>
                      <option value="1">Grade 1</option>
                      <option value="6">Grade 6</option>
                      <option value="9">Grade 9</option>
                      <option value="11">Grade 11</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Previous School</label>
                    <input
                      type="text"
                      name="previousSchool"
                      value={formData.previousSchool}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter previous school name"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Submit Application
                  </button>
                  <button
                    type="reset"
                    className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Required Documents */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText size={24} className="text-blue-600" />
              Required Documents
            </h3>
            <ul className="space-y-3">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Admission Process */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Admission Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {process.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

<Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
      <SiteFooter />
    </main>
  )
}
