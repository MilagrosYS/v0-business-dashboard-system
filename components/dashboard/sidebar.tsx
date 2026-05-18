'use client'

import Image from 'next/image'
import { Building2, Package, Warehouse, LayoutDashboard, FileText, History, ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
          'fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out flex flex-col',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          'flex items-center justify-center border-b border-gray-700 transition-all duration-300 bg-gradient-to-b from-gray-800 to-gray-900',
          collapsed ? 'h-16 px-2' : 'h-40 px-6 pt-8 pb-6'
        )}>
          {!collapsed && (
            <div className="w-full flex justify-center">
              <Image 
                src="/vr-logo.png" 
                alt="VR Maquinarias Inversiones"
                width={140}
                height={110}
                className="h-auto"
                priority
              />
            </div>
          )}
          {collapsed && (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
              <Package className="h-6 w-6 text-blue-400" />
            </div>
          )}
        </div>
        
        {/* Navigation Container */}
        <nav className={cn(
          'flex-1 overflow-y-auto transition-all duration-300',
          collapsed ? 'px-2 py-4' : 'px-4 py-6'
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
                    'flex w-full items-center rounded-lg text-sm font-medium transition-all duration-200',
                    collapsed ? 'justify-center p-2.5 h-10' : 'gap-3 px-3 py-2.5 h-auto',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/40'
                      : 'text-gray-400 hover:bg-blue-600/20 hover:text-blue-300 hover:shadow-md hover:shadow-blue-600/30'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-300 text-left',
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
                      <TooltipContent side="right" className="bg-gray-900 text-gray-100 border-gray-700">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    button
                  )}
                </li>
              )
            })}

            {/* Cotizaciones Section */}
            {!collapsed && (
              <>
                <li className="pt-4 pb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cotizaciones</p>
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
                    'flex w-full items-center rounded-lg text-sm font-medium transition-all duration-200',
                    collapsed ? 'justify-center p-2.5 h-10' : 'gap-3 px-3 py-2.5 h-auto',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/40'
                      : 'text-gray-400 hover:bg-blue-600/20 hover:text-blue-300 hover:shadow-md hover:shadow-blue-600/30'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-300 text-left',
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
                      <TooltipContent side="right" className="bg-gray-900 text-gray-100 border-gray-700">
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
          'border-t border-sidebar-border transition-all duration-300',
          collapsed ? 'px-2 py-4' : 'px-4 py-4'
        )}>
          {/* Settings Button */}
          {!collapsed && (
            <button
              onClick={() => onSectionChange('settings')}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-2',
                activeSection === 'settings'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/40'
                  : 'text-gray-400 hover:bg-blue-600/20 hover:text-blue-300 hover:shadow-md hover:shadow-blue-600/30'
              )}
            >
              <Settings className="h-5 w-5" />
              <span>Configuracion</span>
            </button>
          )}

          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSectionChange('settings')}
                  className={cn(
                    'flex w-full items-center justify-center rounded-lg p-2.5 h-10 text-sm font-medium transition-all duration-200',
                    activeSection === 'settings'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/40'
                      : 'text-gray-400 hover:bg-blue-600/20 hover:text-blue-300'
                  )}
                >
                  <Settings className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 text-gray-100 border-gray-700">
                Configuracion
              </TooltipContent>
            </Tooltip>
          )}

          {/* Collapse Toggle Button */}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className={cn(
                'w-full h-10 rounded-lg border border-gray-700 bg-gray-900 text-gray-400 shadow-md hover:bg-gray-800 hover:text-blue-400 hover:border-blue-500/50 transition-all duration-200'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className={cn(
                'w-full h-10 rounded-lg border border-gray-700 bg-gray-900 text-gray-400 shadow-md hover:bg-gray-800 hover:text-blue-400 hover:border-blue-500/50 transition-all duration-200'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
