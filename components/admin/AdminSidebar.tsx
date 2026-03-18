'use client'

import { 
  BarChart3, 
  Users, 
  Droplet, 
  Star, 
  Ban, 
  DollarSign, 
  Globe, 
  Image as ImageIcon, 
  Settings, 
  LogOut 
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const tabs = [
  { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: BarChart3 },
  { id: 'users', label: 'ব্যবহারকারী', icon: Users },
  { id: 'requests', label: 'অনুরোধ', icon: Droplet },
  { id: 'ratings', label: 'রেটিং', icon: Star },
  { id: 'blocked', label: 'ব্লকড', icon: Ban },
  { id: 'adsense', label: 'AdSense', icon: DollarSign },
  { id: 'adsterra', label: 'Adsterra', icon: Globe },
  { id: 'banners', label: 'ব্যনার', icon: ImageIcon },
  { id: 'owner', label: 'মালিক পরিচিতি', icon: Users },
  { id: 'settings', label: 'সেটিংস', icon: Settings },
]

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const { signOut } = useAuth()

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col bg-[#1A0A0A] text-white min-h-screen w-64 flex-shrink-0 p-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="bg-red-600 p-2 rounded-lg">
            <Droplet className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">রক্তসেতু Admin</h1>
        </div>

        <nav className="flex-1 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-[#C0001A] text-white shadow-lg shadow-red-900/20' 
                    : 'text-gray-400 hover:bg-[#3D1A1A] hover:text-white'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-900/10 rounded-xl transition-all mt-4 border-t border-white/5 pt-4"
        >
          <LogOut size={18} />
          লগআউট
        </button>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden flex overflow-x-auto bg-[#1A0A0A] p-2 gap-2 sticky top-0 z-50 border-b border-white/5 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#C0001A] text-white' 
                  : 'text-gray-400 bg-white/5'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>
    </>
  )
}
