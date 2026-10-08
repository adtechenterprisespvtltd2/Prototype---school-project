'use client'

import { useAuth, UserRole } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, loginAsRole } = useAuth()
  const router = useRouter()
  const allowed = !!user && allowedRoles.includes(user.role)

  // Prototype mode: opening a portal signs in as that portal's demo user
  // instead of sending people back to the login page.
  useEffect(() => {
    if (isLoading || allowed) return
    loginAsRole(allowedRoles[0]).catch(() => router.push('/login'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, allowed])

  if (isLoading || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4 animate-spin">
            <div className="w-12 h-12 bg-white rounded-full"></div>
          </div>
          <p className="text-slate-600 font-semibold">{isLoading && user ? 'Loading...' : 'Opening portal...'}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
