'use client'

import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: string
  raterId: string
  receiverId: string
  receiverName: string
  onSuccess: () => void
}

export default function RatingModal({ isOpen, onClose, requestId, raterId, receiverId, receiverName, onSuccess }: RatingModalProps) {
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (stars === 0) {
      toast.error('অনুগ্রহ করে রেটিং দিন')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('ratings')
        .insert({
          rater_id: raterId,
          receiver_id: receiverId,
          request_id: requestId,
          stars,
          comment
        })

      if (error) throw error

      toast.success('রেটিং দেওয়ার জন্য ধন্যবাদ!')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error('রেটিং দিতে সমস্যা হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">রেটিং দিন</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4 font-medium">আপনি <span className="text-red-600 font-bold">{receiverName}</span> কে কেমন রেটিং দিতে চান?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setStars(num)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={40}
                    className={`${stars >= num ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">আপনার মন্তব্য (ঐচ্ছিক)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="আপনার অভিজ্ঞতা শেয়ার করুন..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none h-24"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || stars === 0}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200"
          >
            {loading ? 'সাবমিট হচ্ছে...' : 'সাবমিট করুন'}
          </button>
        </div>
      </div>
    </div>
  )
}
