'use client'

import { useState } from 'react'
import { Eye, EyeOff, LogIn, User, Lock } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Background image URL - now unused but kept for reference
// const BACKGROUND_IMAGE_URL = '/images/fondo-login.png'

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
    <div className="relative min-h-screen flex overflow-hidden bg-slate-950">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-950">
        <img
          src="/images/fondo-ilustracion.png"
          alt="Ilustración"
          className="w-full h-full object-contain max-w-lg"
        />
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="w-full max-w-md space-y-8">
          {/* Logo section */}
          <div className="flex justify-center mb-8">
            <img
              src="/images/logo-maquinarias.png"
              alt="VR Maquinarias Inversiones"
              className="h-20 object-contain"
            />
          </div>
          
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
                  className="border border-white/20 bg-white/5 pl-12 text-white placeholder:text-white/40 focus:border-blue-500/50 focus:bg-white/10 focus:ring-blue-500/20 rounded-xl"
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
                  className="border border-white/20 bg-white/5 pl-12 pr-12 text-white placeholder:text-white/40 focus:border-blue-500/50 focus:bg-white/10 focus:ring-blue-500/20 rounded-xl"
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
              className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/50 disabled:opacity-70"
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
      
      {/* CSS for animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
