'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X, Heart, User as UserIcon, LogOut } from 'lucide-react'

export default function Header() {
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div id="adsterra-header-slot"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-600 fill-current" />
              <span className="text-2xl font-bold text-red-600">রক্তসেতু</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <Link href="/search" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">
              খুঁজুন
            </Link>
            <Link href="/owner" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">
              মালিক পরিচিতি
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                  <UserIcon size={16} />
                  ড্যাশবোর্ড
                </Link>
                {user.is_super_admin && (
                  <Link href="/admin" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">
                    অ্যাডমিন
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <LogOut size={16} />
                  লগআউট
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">
                  লগইন
                </Link>
                <Link href="/register" className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  রেজিস্টার
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/search"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              খুঁজুন
            </Link>
            <Link
              href="/owner"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              মালিক পরিচিতি
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ড্যাশবোর্ড
                </Link>
                {user.is_super_admin && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    অ্যাডমিন
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  লগআউট
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  লগইন
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  রেজিস্টার
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
