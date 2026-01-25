import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import DashboardHeader from '../components/layout/DashboardHeader'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="px-4 lg:px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
