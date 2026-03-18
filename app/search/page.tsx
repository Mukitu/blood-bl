'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Droplet, Stethoscope, Truck, Search as SearchIcon, Phone, MapPin, Navigation, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BLOOD_GROUPS, DISTRICTS, SPECIALITIES } from '@/lib/constants'
import { User } from '@/types'
import { useToast } from '@/hooks/useToast'
import { calculateDistance } from '@/lib/utils'
import dynamic from 'next/dynamic'
import RequestModal from '@/components/RequestModal'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-full bg-gray-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    </div>
  )
})

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const toast = useToast()
  
  const type = searchParams.get('type') || 'blood'
  const initialBloodGroup = searchParams.get('bloodGroup') || ''
  const initialDistrict = searchParams.get('district') || ''

  const [activeTab, setActiveTab] = useState<'blood' | 'doctor' | 'ambulance'>(type as any)
  const [bloodGroup, setBloodGroup] = useState(initialBloodGroup)
  const [district, setDistrict] = useState(initialDistrict)
  const [speciality, setSpeciality] = useState('')
  
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [selectedDonor, setSelectedDonor] = useState<User | null>(null)

  const handleSearch = async (useLocation = false) => {
    setLoading(true)
    try {
      let query = supabase.from('users').select('*').eq('is_active', true)

      if (activeTab === 'blood') {
        query = query.eq('is_donor', true)
        if (bloodGroup) query = query.eq('blood_group', bloodGroup)
      } else if (activeTab === 'doctor') {
        query = query.eq('is_doctor', true)
        if (speciality) query = query.eq('doctor_speciality', speciality)
      } else if (activeTab === 'ambulance') {
        query = query.eq('is_ambulance', true)
      }

      if (!useLocation && district) {
        query = query.eq('district', district)
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase query error:', error)
        throw new Error(error.message)
      }

      let fetchedResults = data as User[]

      if (useLocation && userLocation) {
        // Sort by distance
        fetchedResults = fetchedResults.map(user => {
          if (user.lat && user.lng) {
            const distance = calculateDistance(userLocation.lat, userLocation.lng, user.lat, user.lng)
            return { ...user, distance }
          }
          return { ...user, distance: Infinity }
        }).sort((a, b) => (a as any).distance - (b as any).distance)
      }

      setResults(fetchedResults)
    } catch (error: any) {
      console.error('Search error:', error)
      toast.error(error.message || 'ফলাফল লোড করতে সমস্যা হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleSearch()
    const params = new URLSearchParams()
    params.set('type', activeTab)
    if (bloodGroup) params.set('bloodGroup', bloodGroup)
    if (district) params.set('district', district)
    router.replace(`/search?${params.toString()}`, { scroll: false })
  }, [activeTab, bloodGroup, district, speciality])

  const handleNearbySearch = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude }
          setUserLocation(loc)
          handleSearch(true)
        },
        (error) => {
          toast.error('Location access denied')
          setLoading(false)
        }
      )
    } else {
      toast.error('Geolocation is not supported by this browser.')
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-full md:w-96 bg-white shadow-lg z-10 flex flex-col h-full overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 text-sm font-medium flex flex-col items-center gap-1 transition-colors ${activeTab === 'blood' ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('blood')}
          >
            <Droplet size={20} />
            রক্তদাতা
          </button>
          <button
            className={`flex-1 py-4 text-sm font-medium flex flex-col items-center gap-1 transition-colors ${activeTab === 'doctor' ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('doctor')}
          >
            <Stethoscope size={20} />
            ডাক্তার
          </button>
          <button
            className={`flex-1 py-4 text-sm font-medium flex flex-col items-center gap-1 transition-colors ${activeTab === 'ambulance' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('ambulance')}
          >
            <Truck size={20} />
            অ্যাম্বুলেন্স
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
          <button 
            onClick={handleNearbySearch}
            className="w-full bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
          >
            <Navigation size={18} />
            আমার কাছের খুঁজুন
          </button>
          
          <div className="flex gap-2">
            <div className="flex-1 h-px bg-gray-300 my-auto"></div>
            <span className="text-xs text-gray-500 font-medium">অথবা ফিল্টার করুন</span>
            <div className="flex-1 h-px bg-gray-300 my-auto"></div>
          </div>

          {activeTab === 'blood' && (
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">সব রক্তের গ্রুপ</option>
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          )}

          {activeTab === 'doctor' && (
            <select
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">সব স্পেশালিটি</option>
              {SPECIALITIES.map(sp => <option key={sp} value={sp}>{sp}</option>)}
            </select>
          )}

          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          >
            <option value="">সব জেলা</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <SearchIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p>কোনো ফলাফল পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((user) => (
                <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                    {user.blood_group && activeTab === 'blood' && (
                      <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        {user.blood_group}
                      </span>
                    )}
                  </div>

                  {user.total_ratings > 0 && (
                    <div className="flex items-center gap-1 text-yellow-600 font-bold text-xs mb-2">
                      <Star size={12} className="fill-yellow-600" />
                      {user.avg_rating.toFixed(1)} ({user.total_ratings})
                    </div>
                  )}
                  
                  {user.doctor_speciality && activeTab === 'doctor' && (
                    <p className="text-sm text-green-600 font-medium mb-2">{user.doctor_speciality}</p>
                  )}

                  <div className="space-y-1.5 mt-3">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Phone size={16} className="mr-2 text-gray-400" />
                      <a href={`tel:${user.phone}`} className="hover:text-red-600">{user.phone}</a>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin size={16} className="mr-2 text-gray-400" />
                      {user.upazila}, {user.district}
                      {(user as any).distance !== undefined && (user as any).distance !== Infinity && (
                        <span className="ml-2 text-blue-600 font-medium">
                          ({((user as any).distance).toFixed(1)} km)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={`tel:${user.phone}`} className="flex-1 min-w-[80px] bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-2 rounded-lg text-sm font-medium transition-colors">
                      কল করুন
                    </a>
                    <button 
                      onClick={() => window.location.href = `/profile/${user.id}`}
                      className="flex-1 min-w-[80px] bg-white hover:bg-gray-50 text-gray-700 text-center py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                    >
                      প্রোফাইল
                    </button>
                    {activeTab === 'blood' && (
                      <button 
                        onClick={() => setSelectedDonor(user)}
                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 text-center py-2 rounded-lg text-sm font-medium transition-colors border border-red-200"
                      >
                        অনুরোধ করুন
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 h-[50vh] md:h-full relative bg-gray-200 z-0">
        <MapComponent users={results} centerLoc={userLocation} />
      </div>

      {selectedDonor && (
        <RequestModal 
          donor={selectedDonor} 
          onClose={() => setSelectedDonor(null)} 
        />
      )}
    </div>
  )
}

export default function Search() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[calc(100vh-64px)]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>}>
      <SearchContent />
    </Suspense>
  )
}

