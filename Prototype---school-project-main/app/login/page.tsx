'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, UserRole } from '@/context/auth-context'
import Link from 'next/link'
import { BookOpen, AlertCircle, GraduationCap, BookOpenCheck, Users, Briefcase, ArrowLeft, Wallet, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const roles: { value: UserRole; label: string; Icon: any; description: string }[] = [
    { value: 'student', label: 'Student', Icon: GraduationCap, description: 'View courses & grades' },
    { value: 'teacher', label: 'Teacher', Icon: BookOpenCheck, description: 'Manage classes' },
    { value: 'parent', label: 'Parent', Icon: Users, description: 'Monitor child' },
    { value: 'principal', label: 'Principal', Icon: Briefcase, description: 'View all data' },
    { value: 'accountant', label: 'Accountant', Icon: Wallet, description: 'Fees & payment sheet' },
  ]

  // Prototype: no credentials – picking a role signs straight into that role's demo account.
  const demoEmails: Partial<Record<UserRole, string>> = {
    student: 'student@school.com',
    teacher: 'teacher@school.com',
    parent: 'parent@school.com',
    principal: 'principal@school.com',
    accountant: 'accountant@school.com',
  }

  const enterAs = async (role: UserRole) => {
    if (loadingRole) return
    setError('')
    setLoadingRole(role)
    try {
      await login(demoEmails[role]!, 'password', role)
      router.push(`/${role}-portal`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoadingRole(null)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Background image with blur and overlay */}
      <div
        className="absolute inset-0 scale-105 blur-[2px] brightness-75"
        style={{
          backgroundImage: "url('/school-building.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[12px]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.02))]"></div>

      {/* Decorative glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-8 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-8 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/85 backdrop-blur-[24px] rounded-[24px] shadow-[0_25px_80px_rgba(2,6,23,0.15)] overflow-hidden border border-blue-200/50">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-8 py-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-400 to-cyan-300 p-3 rounded-lg">
                <BookOpen size={28} className="text-slate-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">EduPro</h1>
                <p className="text-blue-300 text-sm">Admin Portal</p>
              </div>
            </div>
            <p className="text-blue-100">Choose a role to enter the portal</p>
          </div>

          <div className="px-8 py-8">
            <label className="block text-slate-700 font-bold text-sm mb-4">Continue as</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role, i) => {
                const Icon = role.Icon
                const loading = loadingRole === role.value
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => enterAs(role.value)}
                    disabled={!!loadingRole}
                    className={`group p-4 rounded-lg border-2 text-center transition-all duration-200 disabled:cursor-wait ${
                      i === roles.length - 1 && roles.length % 2 === 1 ? 'col-span-2' : ''
                    } ${
                      loading
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-slate-200/70 bg-white/80 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5'
                    } ${loadingRole && !loading ? 'opacity-50' : ''}`}
                  >
                    {loading ? (
                      <Loader2 size={32} className="mx-auto mb-2 text-blue-600 animate-spin" />
                    ) : (
                      <Icon size={32} className="mx-auto mb-2 text-blue-600 transition-transform group-hover:scale-110" />
                    )}
                    <div className="font-bold text-slate-900">{role.label}</div>
                    <div className="text-xs text-slate-600">{loading ? 'Opening portal…' : role.description}</div>
                  </button>
                )
              })}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <p className="mt-6 text-center text-xs text-slate-500">Prototype mode – no email or password needed.</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-blue-200 text-sm font-medium">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
