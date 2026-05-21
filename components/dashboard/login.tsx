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
    <>
      {/* Mobile Version */}
      <div className="lg:hidden relative min-h-screen flex items-start pt-16 justify-start overflow-hidden p-4"
        style={{
          backgroundImage: "url('/images/fondo-login-movil.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}>
        
        {/* Mobile form container */}
        <div className="relative z-10 w-full max-w-sm mx-auto">
          <div className="flex flex-col items-center space-y-4">
            {/* Logo section */}
            <div className="flex justify-center">
              <img
                src="/images/logo-maquinarias.png"
                alt="VR Maquinarias Inversiones"
                className="h-16 object-contain"
              />
            </div>
            
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* Usuario field */}
              <div className="space-y-1">
                <label htmlFor="username-mobile" className="block text-base font-semibold text-slate-800">
                  Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="username-mobile"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="border border-gray-200 bg-white pl-12 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-full py-2"
                  />
                </div>
              </div>
              
              {/* Contraseña field */}
              <div className="space-y-1">
                <label htmlFor="password-mobile" className="block text-base font-semibold text-slate-800">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password-mobile"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border border-gray-200 bg-white pl-12 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-full py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
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
                <div className="rounded-lg border border-red-300 bg-red-50 p-2 text-xs text-red-700">
                  {error}
                </div>
              )}
              
              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-blue-600 px-6 py-2 font-semibold text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 disabled:opacity-70 text-sm"
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
      </div>

      {/* Desktop Version */}
      <div className="hidden lg:flex relative min-h-screen items-center justify-center overflow-hidden p-4"
        style={{
          backgroundImage: "url('/images/fondo-detras-login.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}>
        
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Login Card */}
        <div className="relative z-10 w-full max-w-2xl">
          <div className="flex flex-col lg:flex-row overflow-hidden shadow-2xl bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl">
            {/* Left side - Illustration */}
            <div className="hidden lg:flex lg:w-1/2">
              <img
                src="/images/fondo-ilustracion-login.png"
                alt="Ilustración"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Right side - Login form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 bg-white/20 backdrop-blur-md">
              <div className="w-full max-w-sm space-y-8">
                {/* Logo section */}
                <div className="flex justify-center mb-6">
                  <img
                    src="/images/logo-maquinarias.png"
                    alt="VR Maquinarias Inversiones"
                    className="h-16 object-contain"
                  />
                </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Usuario field */}
              <div className="space-y-2">
                <label htmlFor="username-desktop" className="block text-sm font-semibold text-gray-700">
                  Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="username-desktop"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="border border-gray-200 bg-gray-50 pl-12 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                  />
                </div>
              </div>
              
              {/* Contraseña field */}
              <div className="space-y-2">
                <label htmlFor="password-desktop" className="block text-sm font-semibold text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password-desktop"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border border-gray-200 bg-gray-50 pl-12 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
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
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              
              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 disabled:opacity-70"
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
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  )
}
