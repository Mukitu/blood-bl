'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { BLOOD_GROUPS, DISTRICTS, SPECIALITIES } from '@/lib/constants'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [district, setDistrict] = useState('')
  const [upazila, setUpazila] = useState('')
  const [bio, setBio] = useState('')
  
  const [isDoctor, setIsDoctor] = useState(false)
  const [speciality, setSpeciality] = useState('')
  const [chamberAddress, setChamberAddress] = useState('')
  const [visitFee, setVisitFee] = useState('')

  const [isAmbulance, setIsAmbulance] = useState(false)
  const [vehicleType, setVehicleType] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')

  const [lat, setLat] = useState<number | undefined>()
  const [lng, setLng] = useState<number | undefined>()

  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()
  const toast = useToast()
  const router = useRouter()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude)
          setLng(position.coords.longitude)
        },
        (error) => {
          console.error("Error getting location:", error)
        }
      )
    }
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (phone.length !== 11 || !phone.startsWith('01')) {
      toast.error('সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)')
      setLoading(false)
      return
    }

    try {
      await signUp({
        name,
        email,
        phone,
        password,
        blood_group: bloodGroup,
        district,
        upazila,
        bio,
        is_doctor: isDoctor,
        doctor_speciality: speciality,
        chamber_address: chamberAddress,
        visit_fee: visitFee,
        is_ambulance: isAmbulance,
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber,
        lat,
        lng
      })
      toast.success('সফলভাবে একাউন্ট তৈরি হয়েছে!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'একাউন্ট তৈরি ব্যর্থ হয়েছে।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <Heart className="h-8 w-8 text-red-600 fill-current" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            নতুন একাউন্ট তৈরি করুন
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            অথবা{' '}
            <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
              লগইন করুন
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">নাম</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ইমেইল</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="example@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">মোবাইল নম্বর</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">পাসওয়ার্ড</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">রক্তের গ্রুপ</label>
              <select
                required
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="">নির্বাচন করুন</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">জেলা</label>
              <select
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="">নির্বাচন করুন</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">উপজেলা</label>
              <input
                type="text"
                required
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">নিজের সম্পর্কে (ঐচ্ছিক)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex items-center">
              <input
                id="is_doctor"
                type="checkbox"
                checked={isDoctor}
                onChange={(e) => setIsDoctor(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="is_doctor" className="ml-2 block text-sm text-gray-900 font-medium">
                আমি একজন ডাক্তার
              </label>
            </div>
            
            {isDoctor && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-red-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700">বিশেষত্ব</label>
                  <select
                    value={speciality}
                    onChange={(e) => setSpeciality(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ভিজিট ফি</label>
                  <input
                    type="text"
                    value={visitFee}
                    onChange={(e) => setVisitFee(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">চেম্বার ঠিকানা</label>
                  <input
                    type="text"
                    value={chamberAddress}
                    onChange={(e) => setChamberAddress(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center mt-4">
              <input
                id="is_ambulance"
                type="checkbox"
                checked={isAmbulance}
                onChange={(e) => setIsAmbulance(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="is_ambulance" className="ml-2 block text-sm text-gray-900 font-medium">
                আমার অ্যাম্বুলেন্স আছে
              </label>
            </div>

            {isAmbulance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-red-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700">গাড়ির ধরন</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">নির্বাচন করুন</option>
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                    <option value="ICU">ICU</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">গাড়ির নম্বর</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'অপেক্ষা করুন...' : 'রেজিস্টার'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
