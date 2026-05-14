'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Settings, LogOut } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onNavigateToSettings: () => void
  sidebarCollapsed?: boolean
}

export function Header({ onNavigateToSettings, sidebarCollapsed = false }: HeaderProps) {
  const { userProfile, logout } = useDashboardStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleSettingsClick = () => {
    setShowDropdown(false)
    onNavigateToSettings()
  }
  
  const handleLogout = () => {
    setShowDropdown(false)
    logout()
  }
  
  return (
    <header className={cn(
      'fixed right-0 top-0 z-30 flex h-16 items-center justify-end border-b border-border bg-card/80 px-6 backdrop-blur-sm transition-all duration-300 ease-in-out',
      sidebarCollapsed ? 'ml-16 w-[calc(100%-4rem)]' : 'ml-64 w-[calc(100%-16rem)]'
    )}>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
        >
          {/* Profile Avatar */}
          {userProfile.profileImage ? (
            <img 
              src={userProfile.profileImage} 
              alt="Perfil" 
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
          )}
          
          {/* Name */}
          <span className="text-sm font-medium">{userProfile.name}</span>
          
          {/* Dropdown Arrow */}
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
            <button
              onClick={handleSettingsClick}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
              Perfil / Configuracion
            </button>
            <div className="my-1 border-t border-border" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesion
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
