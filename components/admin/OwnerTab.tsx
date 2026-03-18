'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Loader2, User as UserIcon } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import Image from 'next/image'

export default function OwnerTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ownerInfo, setOwnerInfo] = useState({
    name: '',
    description: '',
    photo_url: ''
  })
  const toast = useToast()

  useEffect(() => {
    fetchOwnerInfo()
  }, [])

  const fetchOwnerInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'owner_info')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setOwnerInfo(data.value)
      }
    } catch (error: any) {
      console.error('Error fetching owner info:', error)
      toast.error('তথ্য লোড করতে সমস্যা হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'owner_info',
          value: ownerInfo,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      toast.success('মালিক পরিচিতি আপডেট করা হয়েছে')
    } catch (error: any) {
      console.error('Error saving owner info:', error)
      toast.error('তথ্য সেভ করতে সমস্যা হয়েছে')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-50 p-2 rounded-lg">
            <UserIcon className="text-red-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">মালিক পরিচিতি সেটিংস</h3>
            <p className="text-sm text-gray-500">এখানে আপনার নাম, ছবি এবং বর্ণনা যোগ করুন</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-white border-2 border-red-100 shadow-sm">
              {ownerInfo.photo_url ? (
                <Image
                  src={ownerInfo.photo_url}
                  alt="Preview"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-300">
                  <UserIcon size={40} />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">ছবির প্রিভিউ</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">নাম</label>
              <input
                type="text"
                value={ownerInfo.name}
                onChange={(e) => setOwnerInfo({ ...ownerInfo, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                placeholder="আপনার নাম লিখুন"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ছবির ইউআরএল (Image URL)</label>
              <input
                type="text"
                value={ownerInfo.photo_url}
                onChange={(e) => setOwnerInfo({ ...ownerInfo, photo_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">বর্ণনা (Description)</label>
              <textarea
                value={ownerInfo.description}
                onChange={(e) => setOwnerInfo({ ...ownerInfo, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all min-h-[150px]"
                placeholder="আপনার সম্পর্কে বিস্তারিত লিখুন..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg shadow-red-100"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  সেভ হচ্ছে...
                </>
              ) : (
                <>
                  <Save size={20} />
                  তথ্য সেভ করুন
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
