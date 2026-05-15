'use client'

import { useState, useCallback } from 'react'
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

export type InventoryFilter = 'all' | 'low-stock'

export default function Dashboard() {
  const { isAuthenticated } = useDashboardStore()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>('all')
  
  // Navigation handlers with filter support
  const navigateToInventory = useCallback((filter: InventoryFilter = 'all') => {
    setInventoryFilter(filter)
    setActiveSection('inventory')
  }, [])
  
  const navigateToHistory = useCallback(() => {
    setActiveSection('history')
  }, [])
  
  // Reset filter when navigating away from inventory via sidebar
  const handleSectionChange = useCallback((section: string) => {
    if (section !== 'inventory') {
      setInventoryFilter('all')
    }
    setActiveSection(section)
  }, [])
  
  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Header 
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <main className={cn(
        'min-h-screen pt-16 p-8 transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        {activeSection === 'overview' && (
          <Overview 
            onNavigateToInventory={navigateToInventory}
            onNavigateToHistory={navigateToHistory}
          />
        )}
        {activeSection === 'companies' && <Companies />}
        {activeSection === 'parts' && <SpareParts />}
        {activeSection === 'inventory' && (
          <Inventory 
            initialFilter={inventoryFilter}
            onFilterChange={setInventoryFilter}
          />
        )}
        {activeSection === 'quotations' && <Quotations />}
        {activeSection === 'history' && <QuotationHistory />}
        {activeSection === 'settings' && <Settings />}
      </main>
    </div>
  )
}
