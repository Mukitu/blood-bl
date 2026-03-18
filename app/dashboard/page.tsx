'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase'
import { User, BloodRequest } from '@/types'
import { Settings, User as UserIcon, Activity, Clock, LogOut, Star } from 'lucide-react'
import RatingModal from '@/components/RatingModal'

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'profile' | 'requests' | 'history'>('profile')
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [ratings, setRatings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Rating Modal State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [selectedRequestForRating, setSelectedRequestForRating] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchRequests()
      fetchRatings()
    }
  }, [user])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .select(`
          *,
          requester:users!blood_requests_requester_id_fkey(id, name, phone, blood_group),
          donor:users!blood_requests_donor_id_fkey(id, name, phone, blood_group)
        `)
        .or(`requester_id.eq.${user?.id},donor_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data as BloodRequest[])
    } catch (error: any) {
      toast.error('অনুরোধগুলো লোড করতে সমস্যা হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('request_id')
        .eq('rater_id', user?.id)

      if (error) throw error
      setRatings(data || [])
    } catch (error: any) {
      console.error('Error fetching ratings:', error)
    }
  }

  const handleRequestAction = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('blood_requests')
        .update({ status })
        .eq('id', requestId)

      if (error) throw error
      
      toast.success(status === 'accepted' ? 'অনুরোধ গ্রহণ করা হয়েছে' : 'অনুরোধ বাতিল করা হয়েছে')
      fetchRequests()
    } catch (error: any) {
      toast.error('অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে')
    }
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">অনুগ্রহ করে লগইন করুন</h2>
        <button onClick={() => window.location.href = '/login'} className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700">
          লগইন পেজে যান
        </button>
      </div>
    )
  }

  const incomingRequests = requests.filter(r => r.donor_id === user.id && r.status === 'pending')
  const myRequests = requests.filter(r => r.requester_id === user.id)
  const history = requests.filter(r => r.status !== 'pending')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
                <span className="text-3xl font-bold text-red-600">{user.blood_group}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.phone}</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <UserIcon size={18} />
                প্রোফাইল
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'requests' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <Activity size={18} />
                  অনুরোধসমূহ
                </div>
                {incomingRequests.length > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">{incomingRequests.length}</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Clock size={18} />
                হিস্ট্রি
              </button>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors mt-4 border-t border-gray-100 pt-4"
              >
                <LogOut size={18} />
                লগআউট
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">প্রোফাইল তথ্য</h3>
                <button className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 text-sm bg-red-50 px-4 py-2 rounded-lg">
                  <Settings size={16} />
                  এডিট করুন
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">নাম</p>
                    <p className="text-lg text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">মোবাইল নম্বর</p>
                    <p className="text-lg text-gray-900">{user.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">রক্তের গ্রুপ</p>
                    <p className="text-lg font-bold text-red-600">{user.blood_group}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">ঠিকানা</p>
                    <p className="text-lg text-gray-900">{user.upazila}, {user.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">ডাক্তার স্ট্যাটাস</p>
                    <p className="text-lg text-gray-900">{user.is_doctor ? `হ্যাঁ (${user.doctor_speciality})` : 'না'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">অ্যাম্বুলেন্স স্ট্যাটাস</p>
                    <p className="text-lg text-gray-900">{user.is_ambulance ? `হ্যাঁ (${user.vehicle_type})` : 'না'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">আসা অনুরোধসমূহ</h3>
                {loading ? (
                  <p className="text-gray-500 text-center py-4">লোড হচ্ছে...</p>
                ) : incomingRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">কোনো নতুন অনুরোধ নেই</p>
                ) : (
                  <div className="space-y-4">
                    {incomingRequests.map(req => (
                      <div key={req.id} className="border border-red-100 bg-red-50/30 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <p className="font-bold text-gray-900">{req.requester?.name} <span className="text-sm font-normal text-gray-500">রক্ত চেয়েছেন</span></p>
                          <div className="text-sm text-gray-600 mt-1 space-y-1">
                            <p><span className="font-semibold">রোগী:</span> {req.patient_name}</p>
                            <p><span className="font-semibold">মোবাইল:</span> <a href={`tel:${req.patient_phone}`} className="text-red-600 hover:underline">{req.patient_phone}</a></p>
                            <p><span className="font-semibold">হাসপাতাল:</span> {req.hospital_name}</p>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">তারিখ: {new Date(req.created_at).toLocaleDateString('bn-BD')}</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button 
                            onClick={() => handleRequestAction(req.id, 'accepted')}
                            className="flex-1 sm:flex-none bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                          >
                            গ্রহণ করুন
                          </button>
                          <button 
                            onClick={() => handleRequestAction(req.id, 'declined')}
                            className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                          >
                            বাতিল
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">আমার করা অনুরোধ</h3>
                {loading ? (
                  <p className="text-gray-500 text-center py-4">লোড হচ্ছে...</p>
                ) : myRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">আপনি কোনো অনুরোধ করেননি</p>
                ) : (
                  <div className="space-y-4">
                    {myRequests.map(req => (
                      <div key={req.id} className="border border-gray-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <p className="font-medium text-gray-900">আপনি <span className="font-bold">{req.donor?.name}</span> কে অনুরোধ করেছেন</p>
                          {req.status === 'accepted' && (
                            <p className="text-sm text-green-600 font-bold mt-1">মোবাইল: <a href={`tel:${req.donor?.phone}`} className="hover:underline">{req.donor?.phone}</a></p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">তারিখ: {new Date(req.created_at).toLocaleDateString('bn-BD')}</p>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {req.status === 'pending' ? 'অপেক্ষমান' : req.status === 'accepted' ? 'গৃহীত' : 'বাতিল'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">পূর্বের রেকর্ড</h3>
              {loading ? (
                <p className="text-gray-500 text-center py-4">লোড হচ্ছে...</p>
              ) : history.length === 0 ? (
                <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">কোনো হিস্ট্রি নেই</p>
              ) : (
                <div className="space-y-4">
                  {history.map(req => {
                    const isMyRequest = req.requester_id === user.id
                    const hasRated = ratings.some(r => r.request_id === req.id)
                    const receiver = isMyRequest ? req.donor : req.requester

                    return (
                      <div key={req.id} className="border border-gray-100 bg-gray-50 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <p className="font-bold text-gray-900">
                            {isMyRequest ? `অনুরোধ করেছিলেন: ${req.donor?.name}` : `অনুরোধ পেয়েছিলেন: ${req.requester?.name}`}
                          </p>
                          {req.status === 'accepted' && isMyRequest && (
                            <p className="text-sm text-green-600 font-bold mt-1">মোবাইল: <a href={`tel:${req.donor?.phone}`} className="hover:underline">{req.donor?.phone}</a></p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">তারিখ: {new Date(req.created_at).toLocaleDateString('bn-BD')}</p>
                          <p className="text-sm text-gray-600 mt-1">রোগী: {req.patient_name} | হাসপাতাল: {req.hospital_name}</p>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            req.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {req.status === 'accepted' ? 'গৃহীত' : 'বাতিল'}
                          </span>
                          
                          {req.status === 'accepted' && !hasRated && (
                            <button
                              onClick={() => {
                                setSelectedRequestForRating({
                                  id: req.id,
                                  receiverId: receiver?.id,
                                  receiverName: receiver?.name
                                })
                                setIsRatingModalOpen(true)
                              }}
                              className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-yellow-500 transition-all"
                            >
                              <Star size={14} className="fill-yellow-900" />
                              রেটিং দিন
                            </button>
                          )}
                          
                          {hasRated && (
                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                              <Star size={12} className="fill-gray-400" />
                              রেটিং দেওয়া হয়েছে
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Rating Modal */}
      {selectedRequestForRating && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          requestId={selectedRequestForRating.id}
          raterId={user.id}
          receiverId={selectedRequestForRating.receiverId}
          receiverName={selectedRequestForRating.receiverName}
          onSuccess={() => {
            fetchRatings()
          }}
        />
      )}
    </div>
  )
}
