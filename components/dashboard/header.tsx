'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'

interface HeaderProps {
  onNavigateToSettings: () => void
}

export function Header({ onNavigateToSettings }: HeaderProps) {
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
    <header className="fixed right-0 top-0 z-30 ml-64 flex h-16 w-[calc(100%-16rem)] items-center justify-end border-b border-border bg-card/80 px-6 backdrop-blur-sm">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
        >
          {/* Profile Avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {userProfile.name.charAt(0).toUpperCase()}
          </div>
          
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
              Profile / Settings
            </button>
            <div className="my-1 border-t border-border" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
