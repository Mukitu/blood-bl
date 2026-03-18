'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, Rating } from '@/types'
import { Phone, MapPin, Droplet, Stethoscope, Truck, Star, Calendar, MessageSquare } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

export default function PublicProfile() {
  const { id } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    if (id) {
      fetchProfile()
      fetchRatings()
    }
  }, [id])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error: any) {
      toast.error('প্রোফাইল লোড করতে সমস্যা হয়েছে')
    }
  }

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          rater:users!ratings_rater_id_fkey(name, photo_url)
        `)
        .eq('receiver_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRatings(data as any[])
    } catch (error: any) {
      console.error('Error fetching ratings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ইউজার পাওয়া যায়নি</h2>
        <p className="text-gray-500 mb-6">হয়তো ইউজারটি ডিলিট করা হয়েছে অথবা লিংকটি ভুল।</p>
        <button onClick={() => window.history.back()} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold">ফিরে যান</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header / Cover */}
      <div className="bg-red-600 h-48 md:h-64 relative">
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
            {user.photo_url ? (
              <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-bold text-red-600">{user.blood_group}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-20 md:pt-8 md:pl-56">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <div className="flex items-center gap-1.5">
                <MapPin size={18} className="text-red-500" />
                <span>{user.upazila}, {user.district}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={18} className="text-blue-500" />
                <span>মেম্বার হয়েছেন: {new Date(user.created_at).toLocaleDateString('bn-BD')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {(!user.blood_group || user.is_doctor || user.is_ambulance) && (
              <a 
                href={`tel:${user.phone}`}
                className="flex-1 md:flex-none bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all text-center"
              >
                কল করুন
              </a>
            )}
            {user.blood_group && !user.is_doctor && !user.is_ambulance && (
              <p className="text-sm text-gray-500 italic">রক্তের জন্য অনুরোধ পাঠান, গৃহীত হলে নম্বর পাবেন।</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {/* Left Column: Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Droplet size={18} className="text-red-600" />
                রক্তদানের তথ্য
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                  <span className="text-gray-600 text-sm">রক্তের গ্রুপ</span>
                  <span className="text-xl font-bold text-red-600">{user.blood_group}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 text-sm">মোট রক্তদান</span>
                  <span className="text-lg font-bold text-gray-900">{user.total_donations} বার</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
                  <span className="text-gray-600 text-sm">গড় রেটিং</span>
                  <div className="flex items-center gap-1">
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold text-yellow-700">{user.avg_rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>

            {user.is_doctor && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Stethoscope size={18} className="text-green-600" />
                  ডাক্তার প্রোফাইল
                </h3>
                <div className="space-y-2">
                  <p className="text-green-600 font-bold">{user.doctor_speciality}</p>
                  <p className="text-sm text-gray-600">{user.chamber_address}</p>
                  <p className="text-sm font-bold text-gray-900 mt-2">ফি: {user.visit_fee} টাকা</p>
                </div>
              </div>
            )}

            {user.is_ambulance && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck size={18} className="text-orange-600" />
                  অ্যাম্বুলেন্স সার্ভিস
                </h3>
                <div className="space-y-2">
                  <p className="text-orange-600 font-bold">{user.vehicle_type}</p>
                  <p className="text-sm text-gray-600">গাড়ি নম্বর: {user.vehicle_number}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Reviews */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                  <MessageSquare size={20} className="text-gray-400" />
                  রিভিউ এবং রেটিং ({ratings.length})
                </h3>
              </div>

              {ratings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Star size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-500">এখনো কোনো রিভিউ নেই</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                            {rating.rater?.photo_url ? (
                              <img src={rating.rater.photo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-gray-400 font-bold">{rating.rater?.name?.[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{rating.rater?.name}</p>
                            <p className="text-xs text-gray-500">{new Date(rating.created_at).toLocaleDateString('bn-BD')}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              size={14} 
                              className={`${s <= rating.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      {rating.comment && (
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-xl text-sm leading-relaxed">
                          {rating.comment}
                        </p>
                      )}
                      {rating.stars <= 2 && (
                        <div className="mt-2 flex items-center gap-1.5 text-red-500 text-xs font-bold">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          সতর্কতা: নেতিবাচক রিভিউ
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
