'use client'

import { useState } from 'react'
import { User, Settings as SettingsIcon, Save, Eye, EyeOff, Check, Building2, CreditCard, Plus, Trash2 } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { BankAccount } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function Settings() {
  const { userProfile, systemSettings, updateProfile, updatePassword, updateSettings } = useDashboardStore()
  
  // Profile state
  const [name, setName] = useState(userProfile.name)
  const [username, setUsername] = useState(userProfile.username)
  const [profileSaved, setProfileSaved] = useState(false)
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  
  // System settings state
  const [igvPercentage, setIgvPercentage] = useState(systemSettings.igvPercentage.toString())
  const [currency, setCurrency] = useState(systemSettings.currency)
  const [exchangeRate, setExchangeRate] = useState(systemSettings.exchangeRate.toString())
  const [sellerName, setSellerName] = useState(systemSettings.sellerName)
  const [settingsSaved, setSettingsSaved] = useState(false)
  
  // Business info state
  const [businessInfo, setBusinessInfo] = useState(systemSettings.businessInfo)
  const [businessSaved, setBusinessSaved] = useState(false)
  
  // Bank accounts state
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(systemSettings.bankAccounts)
  const [banksSaved, setBanksSaved] = useState(false)
  
  // Save profile
  const handleSaveProfile = () => {
    updateProfile({ name, username })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }
  
  // Change password
  const handleChangePassword = () => {
    setPasswordError('')
    setPasswordSuccess(false)
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    
    const success = updatePassword(currentPassword, newPassword)
    
    if (success) {
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 2000)
    } else {
      setPasswordError('La contraseña actual es incorrecta')
    }
  }
  
  // Save system settings
  const handleSaveSettings = () => {
    updateSettings({
      igvPercentage: parseFloat(igvPercentage) || 18,
      currency,
      exchangeRate: parseFloat(exchangeRate) || 3.75,
      sellerName,
    })
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2000)
  }
  
  // Save business info
  const handleSaveBusinessInfo = () => {
    updateSettings({ businessInfo })
    setBusinessSaved(true)
    setTimeout(() => setBusinessSaved(false), 2000)
  }
  
  // Save bank accounts
  const handleSaveBankAccounts = () => {
    updateSettings({ bankAccounts })
    setBanksSaved(true)
    setTimeout(() => setBanksSaved(false), 2000)
  }
  
  // Add bank account
  const addBankAccount = () => {
    setBankAccounts([...bankAccounts, { bankName: '', accountNumber: '', cci: '' }])
  }
  
  // Remove bank account
  const removeBankAccount = (index: number) => {
    setBankAccounts(bankAccounts.filter((_, i) => i !== index))
  }
  
  // Update bank account
  const updateBankAccount = (index: number, field: keyof BankAccount, value: string) => {
    setBankAccounts(bankAccounts.map((account, i) => 
      i === index ? { ...account, [field]: value } : account
    ))
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configuración</h2>
        <p className="text-muted-foreground">Administra tu perfil y preferencias del sistema</p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Perfil</CardTitle>
                <CardDescription>Actualiza tu información de cuenta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-muted-foreground">@{username}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuario</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu usuario"
              />
            </div>
            
            <Button onClick={handleSaveProfile} className="w-full">
              {profileSaved ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Guardado!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Perfil
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Password Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Cambiar Contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña Actual</label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa contraseña actual"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Nueva Contraseña</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa nueva contraseña"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Nueva Contraseña</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma nueva contraseña"
              />
            </div>
            
            {passwordError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {passwordError}
              </div>
            )}
            
            {passwordSuccess && (
              <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600">
                Contraseña actualizada correctamente!
              </div>
            )}
            
            <Button 
              onClick={handleChangePassword} 
              className="w-full"
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              <Save className="mr-2 h-4 w-4" />
              Cambiar Contraseña
            </Button>
          </CardContent>
        </Card>
        
        {/* System Settings Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <SettingsIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Configuración del Sistema</CardTitle>
                <CardDescription>Configura las preferencias de negocio</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">IGV (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={igvPercentage}
                  onChange={(e) => setIgvPercentage(e.target.value)}
                  placeholder="18"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Moneda por Defecto</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PEN">PEN (S/)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Cambio (PEN/USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  placeholder="3.75"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Vendedor por Defecto</label>
                <Input
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Nombre del vendedor"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <Button onClick={handleSaveSettings}>
                {settingsSaved ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Guardado!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Guardar Configuración
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Business Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Información de la Empresa</CardTitle>
                <CardDescription>Datos que aparecerán en las cotizaciones PDF</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre de Empresa</label>
                <Input
                  value={businessInfo.companyName}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, companyName: e.target.value })}
                  placeholder="Nombre de la empresa"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">RUC</label>
                <Input
                  value={businessInfo.ruc}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, ruc: e.target.value })}
                  placeholder="RUC de la empresa"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Dirección Arequipa</label>
                <Input
                  value={businessInfo.addressArequipa}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, addressArequipa: e.target.value })}
                  placeholder="Dirección en Arequipa"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Dirección Lima</label>
                <Input
                  value={businessInfo.addressLima}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, addressLima: e.target.value })}
                  placeholder="Dirección en Lima"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                  placeholder="Email de contacto"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono</label>
                <Input
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                  placeholder="Teléfono de contacto"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <Button onClick={handleSaveBusinessInfo}>
                {businessSaved ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Guardado!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Guardar Información
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Bank Accounts Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Cuentas Bancarias</CardTitle>
                  <CardDescription>Cuentas para mostrar en cotizaciones</CardDescription>
                </div>
              </div>
              <Button onClick={addBankAccount} variant="outline" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bankAccounts.map((account, index) => (
                <div key={index} className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Banco</label>
                    <Input
                      value={account.bankName}
                      onChange={(e) => updateBankAccount(index, 'bankName', e.target.value)}
                      placeholder="Nombre del banco"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">N° Cuenta</label>
                    <Input
                      value={account.accountNumber}
                      onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)}
                      placeholder="Número de cuenta"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CCI (opcional)</label>
                    <Input
                      value={account.cci || ''}
                      onChange={(e) => updateBankAccount(index, 'cci', e.target.value)}
                      placeholder="Código interbancario"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBankAccount(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {bankAccounts.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  No hay cuentas bancarias configuradas
                </p>
              )}
            </div>
            
            <div className="mt-6">
              <Button onClick={handleSaveBankAccounts}>
                {banksSaved ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Guardado!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Guardar Cuentas
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
