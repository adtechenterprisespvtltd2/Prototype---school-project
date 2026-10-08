'use client'

import Link from 'next/link'
import { Menu, X, Search, Bell, BookOpen, LogOut, User, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { useSchoolData } from '@/context/school-data-context'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const { resetDemoData } = useSchoolData()

  const confirmReset = () => {
    if (window.confirm('Reset all demo data? Attendance, marks, homework and payments go back to the original sample records on every portal.')) {
      resetDemoData()
      setUserMenuOpen(false)
      setMenuOpen(false)
    }
  }

  const navLinks = [
    { href: '/academics', label: 'Academics' },
    { href: '/admissions', label: 'Admissions' },
    { href: '/events', label: 'Events' },
    { href: '/notices', label: 'Notices' },
    { href: '/about', label: 'About' },
    { href: '/accountant-portal', label: 'Accountant' },
  ]

  const getPortalRoute = (role: string) => {
    const roleRoutes: { [key: string]: string } = {
      student: '/student-portal',
      teacher: '/teacher-portal',
      principal: '/principal-portal',
      parent: '/parent-portal',
      admin: '/admin-portal',      accountant: '/accountant-portal',    }
    return roleRoutes[role] || '/'
  }

  return (
    <header className="relative sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-lg">
      {/* Animated gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 animate-gradient"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-blue-400 to-cyan-300 p-2 rounded-lg group-hover:shadow-lg transition-shadow">
              <BookOpen size={24} className="text-slate-900 font-bold" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold text-white">EduPro</div>
              <div className="text-xs text-blue-300">Admin Portal</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-700/50 transition-all duration-200 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-300 group-hover:w-2/3"></span>
              </Link>
            ))}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 hover:bg-blue-700/50 hover:scale-110 rounded-lg transition-all duration-200 hidden sm:flex">
              <Search size={20} className="text-white" />
            </button>
            <button className="p-2 hover:bg-blue-700/50 hover:scale-110 rounded-lg transition-all duration-200 relative hidden sm:flex">
              <Bell size={20} className="text-white" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </button>
            
            {/* User Menu */}
            {user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-blue-700/50 hover:bg-blue-700/70 px-3 py-2 rounded-lg transition text-white"
                >
                  <User size={20} />
                  <span className="text-sm font-semibold">{user.name.split(' ')[0]}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-200">
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-600 capitalize">{user.role}</p>
                    </div>
                    <button
                      onClick={confirmReset}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-sm font-medium"
                    >
                      <RotateCcw size={16} />
                      Reset demo data
                    </button>
                    <button
                      onClick={() => {
                        logout()
                        setUserMenuOpen(false)
                        router.push('/login')
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm font-medium"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all hidden sm:inline-block"
              >
                Login
              </Link>
            )}
            
            <button
              className="lg:hidden p-2 hover:bg-blue-700/50 rounded-lg transition text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="lg:hidden pb-4 pt-2 space-y-1 bg-blue-900/50 rounded-lg mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-white text-sm font-medium hover:bg-blue-700/50 rounded transition"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href={getPortalRoute(user.role)}
                  className="block px-4 py-2 text-blue-300 text-sm font-bold hover:bg-blue-700/50 rounded transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Portal
                </Link>
                <button
                  onClick={confirmReset}
                  className="block w-full text-left px-4 py-2 text-blue-100 text-sm font-bold hover:bg-blue-700/50 rounded transition"
                >
                  Reset demo data
                </button>
                <button
                  onClick={() => {
                    logout()
                    setMenuOpen(false)
                    router.push('/login')
                  }}
                  className="block w-full text-left px-4 py-2 text-red-300 text-sm font-bold hover:bg-blue-700/50 rounded transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-4 py-2 text-blue-300 text-sm font-bold hover:bg-blue-700/50 rounded transition"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
