'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { User as UserIcon } from 'lucide-react'

export default function OwnerIntroduction() {
  const [ownerInfo, setOwnerInfo] = useState<{
    name: string;
    description: string;
    photo_url: string;
  } | null>(null)
  const [loading, setLoading] = useState(true)

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

      if (error) throw error
      if (data) {
        setOwnerInfo(data.value)
      }
    } catch (error) {
      console.error('Error fetching owner info:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!ownerInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">তথ্য পাওয়া যায়নি</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-red-600 h-32"></div>
        <div className="px-8 pb-12">
          <div className="relative -top-16 flex flex-col items-center">
            <div className="relative h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-lg">
              {ownerInfo.photo_url ? (
                <Image
                  src={ownerInfo.photo_url}
                  alt={ownerInfo.name}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <UserIcon size={64} />
                </div>
              )}
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">{ownerInfo.name}</h1>
            <div className="mt-2 h-1 w-20 bg-red-600 rounded-full"></div>
            
            <div className="mt-8 prose prose-red max-w-none text-center">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {ownerInfo.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
