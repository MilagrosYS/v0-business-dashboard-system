'use client'

import { useState } from 'react'
import { useDashboardStore } from '@/lib/store'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Overview } from '@/components/dashboard/overview'
import { Companies } from '@/components/dashboard/companies'
import { SpareParts } from '@/components/dashboard/spare-parts'
import { Inventory } from '@/components/dashboard/inventory'
import { Quotations } from '@/components/dashboard/quotations'
import { QuotationHistory } from '@/components/dashboard/quotation-history'
import { Settings } from '@/components/dashboard/settings'
import { Login } from '@/components/dashboard/login'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { isAuthenticated } = useDashboardStore()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Header 
        onNavigateToSettings={() => setActiveSection('settings')}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <main className={cn(
        'min-h-screen pt-16 p-8 transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        {activeSection === 'overview' && <Overview />}
        {activeSection === 'companies' && <Companies />}
        {activeSection === 'parts' && <SpareParts />}
        {activeSection === 'inventory' && <Inventory />}
        {activeSection === 'quotations' && <Quotations />}
        {activeSection === 'history' && <QuotationHistory />}
        {activeSection === 'settings' && <Settings />}
      </main>
    </div>
  )
}
