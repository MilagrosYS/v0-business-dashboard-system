'use client'

import Image from 'next/image'
import { Building2, Package, Warehouse, LayoutDashboard, FileText, History, ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const navItems = [
  { id: 'overview', label: 'Panel principal', icon: LayoutDashboard, section: 'main' },
  { id: 'companies', label: 'Empresas', icon: Building2, section: 'main' },
  { id: 'parts', label: 'Repuestos', icon: Package, section: 'main' },
  { id: 'inventory', label: 'Inventario', icon: Warehouse, section: 'main' },
  { id: 'quotations', label: 'Cotizacion', icon: FileText, section: 'cotizaciones' },
  { id: 'history', label: 'Historial', icon: History, section: 'cotizaciones' },
]

export function Sidebar({ activeSection, onSectionChange, collapsed, onToggleCollapse }: SidebarProps) {
  const mainItems = navItems.filter(item => item.section === 'main')
  const cotizacionesItems = navItems.filter(item => item.section === 'cotizaciones')

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-[#1c1b1b] border-r border-[#434656]/30 transition-all duration-300 ease-in-out flex flex-col sidebar-transition',
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          'flex items-center justify-center border-b border-[#434656]/30 transition-all duration-300',
          collapsed ? 'h-20 px-4' : 'h-28 px-8 pt-6 pb-4'
        )}>
          {!collapsed && (
            <div className="w-full flex justify-center">
              <Image 
                src="/vr-logo.png" 
                alt="VR Maquinarias Inversiones"
                width={160}
                height={120}
                className="h-auto"
                priority
              />
            </div>
          )}
          {collapsed && (
            <div className="flex items-center justify-center">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <span className="absolute text-2xl font-bold text-white leading-none -translate-x-1">V</span>
                <span className="absolute text-2xl font-bold text-[#00c1fd] leading-none translate-x-1">R</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Container */}
        <nav className={cn(
          'flex-1 overflow-y-auto transition-all duration-300 flex flex-col',
          collapsed ? 'px-3 py-4 space-y-2' : 'px-4 py-6 space-y-1'
        )}>
          <ul className="space-y-1">
            {/* Main Navigation Items */}
            {mainItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              
              const button = (
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'flex w-full items-center transition-all duration-200 relative overflow-hidden group',
                    collapsed 
                      ? 'justify-center p-2.5 h-12 rounded-lg' 
                      : 'gap-4 px-4 py-3 h-auto rounded-r-full',
                    isActive ? 'text-white' : 'text-[#c3c5d9] hover:text-[#e5e2e1]'
                  )}
                  title={item.label}
                >
                  {/* Active glow effect */}
                  {isActive && !collapsed && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00c1fd]/20 via-[#00c1fd]/10 to-transparent pointer-events-none" />
                  )}
                  {isActive && !collapsed && (
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#00c1fd]/30 to-transparent shadow-lg shadow-[#00c1fd]/40 pointer-events-none" />
                  )}
                  {isActive && !collapsed && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#00c1fd] pointer-events-none" />
                  )}
                  
                  <Icon className={cn(
                    'h-6 w-6 flex-shrink-0 relative z-10 transition-all duration-200',
                    isActive ? 'text-[#00c1fd]' : 'text-[#c3c5d9] group-hover:text-[#e5e2e1]'
                  )} />
                  <span className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-300 text-left relative z-10 font-medium text-sm',
                    collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  )}>
                    {item.label}
                  </span>
                </button>
              )
              
              return (
                <li key={item.id}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {button}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-[#201f1f] text-[#e5e2e1] border border-[#434656]/50">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    button
                  )}
                </li>
              )
            })}

            {/* Cotizaciones Section Divider */}
            {!collapsed && (
              <>
                <li className="pt-6 pb-3">
                  <div className="flex items-center gap-3 px-4">
                    <p className="text-xs font-semibold text-[#8d90a2] uppercase tracking-widest">Cotizaciones</p>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#434656]/50 to-transparent" />
                  </div>
                </li>
              </>
            )}

            {/* Cotizaciones Items */}
            {cotizacionesItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              
              const button = (
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'flex w-full items-center transition-all duration-200 relative overflow-hidden group',
                    collapsed 
                      ? 'justify-center p-2.5 h-12 rounded-lg' 
                      : 'gap-4 px-4 py-3 h-auto rounded-r-full',
                    isActive ? 'text-white' : 'text-[#c3c5d9] hover:text-[#e5e2e1]'
                  )}
                  title={item.label}
                >
                  {/* Active glow effect */}
                  {isActive && !collapsed && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00c1fd]/20 via-[#00c1fd]/10 to-transparent pointer-events-none" />
                  )}
                  {isActive && !collapsed && (
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#00c1fd]/30 to-transparent shadow-lg shadow-[#00c1fd]/40 pointer-events-none" />
                  )}
                  {isActive && !collapsed && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#00c1fd] pointer-events-none" />
                  )}
                  
                  <Icon className={cn(
                    'h-6 w-6 flex-shrink-0 relative z-10 transition-all duration-200',
                    isActive ? 'text-[#00c1fd]' : 'text-[#c3c5d9] group-hover:text-[#e5e2e1]'
                  )} />
                  <span className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-300 text-left relative z-10 font-medium text-sm',
                    collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  )}>
                    {item.label}
                  </span>
                </button>
              )
              
              return (
                <li key={item.id}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {button}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-[#201f1f] text-[#e5e2e1] border border-[#434656]/50">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    button
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Settings & Collapse */}
        <div className={cn(
          'border-t border-[#434656]/30 transition-all duration-300 flex flex-col gap-3',
          collapsed ? 'px-3 py-4' : 'px-4 py-4'
        )}>
          {/* Settings Button */}
          {!collapsed && (
            <button
              onClick={() => onSectionChange('settings')}
              className={cn(
                'flex w-full items-center gap-4 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-r-full relative overflow-hidden group border border-[#434656]/50 hover:border-[#434656]/70',
                activeSection === 'settings'
                  ? 'text-white border-[#00c1fd]/50 bg-[#00c1fd]/5'
                  : 'text-[#c3c5d9] hover:text-[#e5e2e1]'
              )}
            >
              {activeSection === 'settings' && (
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#00c1fd]/20 to-transparent pointer-events-none" />
              )}
              <Settings className={cn(
                'h-5 w-5 relative z-10 transition-all duration-200',
                activeSection === 'settings' ? 'text-[#00c1fd]' : 'text-[#c3c5d9] group-hover:text-[#e5e2e1]'
              )} />
              <span className="relative z-10">Configuracion</span>
            </button>
          )}

          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSectionChange('settings')}
                  className={cn(
                    'flex w-full items-center justify-center rounded-lg p-2.5 h-12 text-sm font-medium transition-all duration-200 border border-[#434656]/50 hover:border-[#434656]/70',
                    activeSection === 'settings'
                      ? 'text-[#00c1fd] border-[#00c1fd]/50 bg-[#00c1fd]/5'
                      : 'text-[#c3c5d9] hover:text-[#e5e2e1]'
                  )}
                >
                  <Settings className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#201f1f] text-[#e5e2e1] border border-[#434656]/50">
                Configuracion
              </TooltipContent>
            </Tooltip>
          )}

          {/* Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className={cn(
              'absolute -right-4 top-20 z-50 rounded-full bg-[#353534] backdrop-blur-md p-2 shadow-lg shadow-[#00c1fd]/20 hover:bg-[#3a3939] transition-all active:scale-95 border border-[#434656]/50',
              'flex items-center justify-center'
            )}
            title="Toggle sidebar"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-[#8fd8ff]" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-[#8fd8ff]" />
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
