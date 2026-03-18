'use client'

import { useState } from 'react'
import { X, Droplet, Send, User, Hospital, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

interface RequestModalProps {
  donor: {
    id: string
    name: string
    blood_group: string
  }
  onClose: () => void
}

export default function RequestModal({ donor, onClose }: RequestModalProps) {
  const { user } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    hospital_name: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('অনুরোধ করতে লগইন করুন')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('blood_requests')
        .insert({
          requester_id: user.id,
          donor_id: donor.id,
          patient_name: formData.patient_name,
          patient_phone: formData.patient_phone,
          hospital_name: formData.hospital_name,
          blood_group: donor.blood_group,
          status: 'pending'
        })

      if (error) throw error
      toast.success('অনুরোধ পাঠানো হয়েছে ✓')
      onClose()
    } catch (error) {
      console.error('Error sending request:', error)
      toast.error('অনুরোধ পাঠানো সম্ভব হয়নি, আবার চেষ্টা করুন')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-100 p-3 rounded-xl text-red-600">
            <Droplet size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">রক্তের অনুরোধ</h3>
        </div>

        <div className="bg-red-50 p-4 rounded-xl mb-6 border border-red-100">
          <p className="text-sm text-red-800 font-medium">
            আপনি <span className="font-bold">{donor.name}</span> এর কাছে <span className="font-bold">{donor.blood_group}</span> রক্তের জন্য অনুরোধ পাঠাচ্ছেন।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <User size={14} className="text-gray-400" /> রোগীর নাম
            </label>
            <input
              required
              type="text"
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C0001A] text-sm"
              placeholder="রোগীর নাম লিখুন"
              value={formData.patient_name}
              onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <Phone size={14} className="text-gray-400" /> রোগীর মোবাইল নম্বর
            </label>
            <input
              required
              type="tel"
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C0001A] text-sm"
              placeholder="রোগীর মোবাইল নম্বর লিখুন"
              value={formData.patient_phone}
              onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <Hospital size={14} className="text-gray-400" /> হাসপাতালের নাম
            </label>
            <input
              required
              type="text"
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#C0001A] text-sm"
              placeholder="হাসপাতালের নাম ও ঠিকানা লিখুন"
              value={formData.hospital_name}
              onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C0001A] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#8B0000] transition-colors shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'পাঠানো হচ্ছে...' : <><Send size={18} /> অনুরোধ পাঠান</>}
          </button>
        </form>
      </div>
    </div>
  )
}
