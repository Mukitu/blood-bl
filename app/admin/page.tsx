'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DashboardTab from '@/components/admin/DashboardTab'
import UsersTab from '@/components/admin/UsersTab'
import RequestsTab from '@/components/admin/RequestsTab'
import RatingsTab from '@/components/admin/RatingsTab'
import BlockedTab from '@/components/admin/BlockedTab'
import AdsenseTab from '@/components/admin/AdsenseTab'
import AdsterraTab from '@/components/admin/AdsterraTab'
import BannersTab from '@/components/admin/BannersTab'
import OwnerTab from '@/components/admin/OwnerTab'
import SettingsTab from '@/components/admin/SettingsTab'
import { Droplet, LogOut } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (!user.is_super_admin) {
        router.push('/')
      }
    }
  }, [user, loading, router])

  if (loading || !user || !user.is_super_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C0001A]"></div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />
      case 'users': return <UsersTab />
      case 'requests': return <RequestsTab />
      case 'ratings': return <RatingsTab />
      case 'blocked': return <BlockedTab />
      case 'adsense': return <AdsenseTab />
      case 'adsterra': return <AdsterraTab />
      case 'banners': return <BannersTab />
      case 'owner': return <OwnerTab />
      case 'settings': return <SettingsTab />
      default: return <DashboardTab />
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8F8F8]">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="md:hidden bg-red-600 p-1.5 rounded-lg">
              <Droplet className="text-white" size={18} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {activeTab === 'dashboard' && '📊 ড্যাশবোর্ড'}
              {activeTab === 'users' && '👥 ব্যবহারকারী ব্যবস্থাপনা'}
              {activeTab === 'requests' && '🩸 রক্তের অনুরোধসমূহ'}
              {activeTab === 'ratings' && '⭐ রেটিং ও রিভিউ'}
              {activeTab === 'blocked' && '🚫 ব্লকড লিস্ট'}
              {activeTab === 'adsense' && '💰 AdSense সেটিংস'}
              {activeTab === 'adsterra' && '🌐 Adsterra সেটিংস'}
              {activeTab === 'banners' && '🖼️ বিজ্ঞাপন ব্যানার'}
              {activeTab === 'owner' && '👤 মালিক পরিচিতি'}
              {activeTab === 'settings' && '⚙️ সাইট সেটিংস'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-900">{user.name}</span>
              <span className="text-[10px] font-bold text-[#C0001A] bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Super Admin</span>
            </div>
            <button 
              onClick={signOut}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="লগআউট"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
