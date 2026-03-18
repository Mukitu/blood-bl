'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { user, loading: authLoading, signIn } = useAuth()
  const toast = useToast()
  const router = useRouter()

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('HandleLogin called with identifier:', identifier)
    setLoading(true)

    try {
      console.log('Calling signIn...')
      await signIn(identifier, password)
      console.log('SignIn successful, redirecting...')
      toast.success('সফলভাবে লগইন হয়েছে!')
      window.location.href = '/dashboard'
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'লগইন ব্যর্থ হয়েছে। ইমেইল বা পাসওয়ার্ড ভুল।')
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <Heart className="h-8 w-8 text-red-600 fill-current" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            লগইন করুন
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            অথবা{' '}
            <Link href="/register" className="font-medium text-red-600 hover:text-red-500">
              নতুন একাউন্ট তৈরি করুন
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                মোবাইল নম্বর
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                পাসওয়ার্ড
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="পাসওয়ার্ড দিন"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'অপেক্ষা করুন...' : 'লগইন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
