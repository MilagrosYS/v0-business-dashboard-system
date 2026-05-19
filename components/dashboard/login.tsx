'use client'

import { useState } from 'react'
import { Eye, EyeOff, LogIn, User, Lock } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Background image URL - change this to your preferred night landscape image
const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop&q=80'

export function Login() {
  const { login } = useDashboardStore()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const success = login(username, password)
    
    if (!success) {
      setError('Usuario o contraseña incorrectos')
    }
    
    setIsLoading(false)
  }
  
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={BACKGROUND_IMAGE_URL}
          alt="Background"
          className="h-full w-full object-cover"
        />
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-blue-900/30 to-purple-950/40" />
        
        {/* Animated stars effect */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute h-0.5 w-0.5 rounded-full bg-white/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Glassmorphic card */}
      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Logo section */}
        <div className="flex flex-col items-center space-y-6">
          <div className="h-24 w-32">
            <img
              src="/vr-logo.png"
              alt="VR Maquinarias Inversiones"
              className="h-full w-full object-contain"
              width={128}
              height={96}
            />
          </div>
          <p className="text-center text-sm font-medium tracking-wide text-white/90">
            Sistema de Gestión
          </p>
        </div>
        
        {/* Form card with glassmorphism */}
        <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Usuario field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-white/90">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="border-white/30 bg-white/10 pl-12 text-white placeholder:text-white/50 focus:border-blue-400/50 focus:bg-white/15 focus:ring-blue-400/20"
                />
              </div>
            </div>
            
            {/* Contraseña field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-white/90">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-white/30 bg-white/10 pl-12 pr-12 text-white placeholder:text-white/50 focus:border-blue-400/50 focus:bg-white/15 focus:ring-blue-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 transition-colors hover:text-white/80"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}
            
            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/50 hover:from-blue-500 hover:to-blue-400 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Iniciando sesión...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Iniciar sesión
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
      
      {/* CSS for twinkling stars animation */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
