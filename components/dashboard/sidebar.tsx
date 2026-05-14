'use client'

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
  { id: 'overview', label: 'Panel Principal', icon: LayoutDashboard },
  { id: 'companies', label: 'Empresas', icon: Building2 },
  { id: 'parts', label: 'Repuestos', icon: Package },
  { id: 'inventory', label: 'Inventario', icon: Warehouse },
  { id: 'quotations', label: 'Cotizaciones', icon: FileText },
  { id: 'history', label: 'Historial', icon: History },
]

export function Sidebar({ activeSection, onSectionChange, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex h-16 items-center border-b border-sidebar-border transition-all duration-300',
          collapsed ? 'justify-center px-2' : 'gap-3 px-6'
        )}>
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Package className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className={cn(
            'overflow-hidden transition-all duration-300',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}>
            <h1 className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap">PartsControl</h1>
            <p className="text-xs text-sidebar-muted whitespace-nowrap">Panel de Control</p>
          </div>
        </div>
        
        {/* Collapse Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            'absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar text-sidebar-muted shadow-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
        
        {/* Navigation */}
        <nav className={cn(
          'mt-6 transition-all duration-300',
          collapsed ? 'px-2' : 'px-3'
        )}>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              
              const button = (
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'flex w-full items-center rounded-lg text-sm font-medium transition-all duration-200',
                    collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                      : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-300',
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
                      <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground">
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
        
        {/* Settings Button */}
        <div className={cn(
          'absolute bottom-16 left-0 right-0 transition-all duration-300',
          collapsed ? 'px-2' : 'px-3'
        )}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSectionChange('settings')}
                  className={cn(
                    'flex w-full items-center justify-center rounded-lg p-2.5 text-sm font-medium transition-all duration-200',
                    activeSection === 'settings'
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                      : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Settings className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground">
                Configuracion
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => onSectionChange('settings')}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                activeSection === 'settings'
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Settings className="h-5 w-5" />
              <span>Configuracion</span>
            </button>
          )}
        </div>
        
        {/* Footer */}
        <div className={cn(
          'absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4 transition-all duration-300',
          collapsed ? 'px-2' : 'px-4'
        )}>
          <p className={cn(
            'text-center text-xs text-sidebar-muted transition-all duration-300',
            collapsed ? 'opacity-0' : 'opacity-100'
          )}>
            {collapsed ? '' : 'Gestion de Repuestos v1.0'}
          </p>
        </div>
      </aside>
    </TooltipProvider>
  )
}
