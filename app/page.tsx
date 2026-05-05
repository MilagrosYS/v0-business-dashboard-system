'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Overview } from '@/components/dashboard/overview'
import { Companies } from '@/components/dashboard/companies'
import { SpareParts } from '@/components/dashboard/spare-parts'
import { Inventory } from '@/components/dashboard/inventory'

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview')
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="ml-64 min-h-screen p-8">
        {activeSection === 'overview' && <Overview />}
        {activeSection === 'companies' && <Companies />}
        {activeSection === 'parts' && <SpareParts />}
        {activeSection === 'inventory' && <Inventory />}
      </main>
    </div>
  )
}
