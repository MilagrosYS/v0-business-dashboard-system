'use client'

import { useState, useRef, useMemo } from 'react'
import { User, Settings as SettingsIcon, Save, Eye, EyeOff, Check, Building2, CreditCard, Plus, Trash2, Camera } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { BankAccount } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function Settings() {
  const { userProfile, systemSettings, updateProfile, updatePassword, updateSettings } = useDashboardStore()
  
  // Profile state
  const [name, setName] = useState(userProfile.name)
  const [username, setUsername] = useState(userProfile.username)
  const [profileImage, setProfileImage] = useState(userProfile.profileImage)
  const [profileSaved, setProfileSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
  
  // Bank account delete confirmation
  const [bankToDeleteIndex, setBankToDeleteIndex] = useState<number | null>(null)
  
  // Check if profile has changes
  const hasProfileChanges = useMemo(() => {
    return name !== userProfile.name ||
           username !== userProfile.username ||
           profileImage !== userProfile.profileImage
  }, [name, username, profileImage, userProfile])
  
  // Check if system settings have changes
  const hasSettingsChanges = useMemo(() => {
    return igvPercentage !== systemSettings.igvPercentage.toString() ||
           currency !== systemSettings.currency ||
           exchangeRate !== systemSettings.exchangeRate.toString() ||
           sellerName !== systemSettings.sellerName
  }, [igvPercentage, currency, exchangeRate, sellerName, systemSettings])
  
  // Check if business info has changes
  const hasBusinessChanges = useMemo(() => {
    return JSON.stringify(businessInfo) !== JSON.stringify(systemSettings.businessInfo)
  }, [businessInfo, systemSettings.businessInfo])
  
  // Check if bank accounts have changes
  const hasBankChanges = useMemo(() => {
    return JSON.stringify(bankAccounts) !== JSON.stringify(systemSettings.bankAccounts)
  }, [bankAccounts, systemSettings.bankAccounts])
  
  // Handle profile image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setProfileImage(base64)
      }
      reader.readAsDataURL(file)
    }
  }
  
  // Save profile
  const handleSaveProfile = () => {
    if (!hasProfileChanges) return
    updateProfile({ name, username, profileImage })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }
  
  // Change password
  const handleChangePassword = () => {
    setPasswordError('')
    setPasswordSuccess(false)
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contrasenas no coinciden')
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError('La contrasena debe tener al menos 6 caracteres')
      return
    }
    
    const success = updatePassword('', newPassword)
    
    if (success) {
      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 2000)
    }
  }
  
  // Save system settings
  const handleSaveSettings = () => {
    if (!hasSettingsChanges) return
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
    if (!hasBusinessChanges) return
    updateSettings({ businessInfo })
    setBusinessSaved(true)
    setTimeout(() => setBusinessSaved(false), 2000)
  }
  
  // Save bank accounts
  const handleSaveBankAccounts = () => {
    if (!hasBankChanges) return
    updateSettings({ bankAccounts })
    setBanksSaved(true)
    setTimeout(() => setBanksSaved(false), 2000)
  }
  
  // Add bank account
  const addBankAccount = () => {
    setBankAccounts([...bankAccounts, { bankName: '', accountNumber: '', cci: '' }])
  }
  
  // Remove bank account (with confirmation)
  const confirmRemoveBankAccount = () => {
    if (bankToDeleteIndex !== null) {
      setBankAccounts(bankAccounts.filter((_, i) => i !== bankToDeleteIndex))
      setBankToDeleteIndex(null)
    }
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
        <h2 className="text-2xl font-bold text-foreground">Configuracion</h2>
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
                <CardDescription>Actualiza tu informacion de cuenta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Perfil" 
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
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
            
            <Button 
              onClick={handleSaveProfile} 
              className="w-full transition-opacity"
              disabled={!hasProfileChanges}
            >
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
                <CardTitle className="text-lg">Cambiar Contrasena</CardTitle>
                <CardDescription>Actualiza tu contrasena de acceso</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nueva Contrasena</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa nueva contrasena"
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
              <label className="text-sm font-medium">Confirmar Nueva Contrasena</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma nueva contrasena"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {passwordError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {passwordError}
              </div>
            )}
            
            {passwordSuccess && (
              <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600">
                Contrasena actualizada correctamente!
              </div>
            )}
            
            <Button 
              onClick={handleChangePassword} 
              className="w-full transition-opacity"
              disabled={!newPassword || !confirmPassword}
            >
              <Save className="mr-2 h-4 w-4" />
              Cambiar Contrasena
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
                <CardTitle className="text-lg">Configuracion del Sistema</CardTitle>
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
              <Button 
                onClick={handleSaveSettings}
                disabled={!hasSettingsChanges}
                className="transition-opacity"
              >
                {settingsSaved ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Guardado!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Guardar Configuracion
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
                <CardTitle className="text-lg">Informacion de la Empresa</CardTitle>
                <CardDescription>Datos que apareceran en las cotizaciones PDF</CardDescription>
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
                <label className="text-sm font-medium">Direccion Arequipa</label>
                <Input
                  value={businessInfo.addressArequipa}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, addressArequipa: e.target.value })}
                  placeholder="Direccion en Arequipa"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Direccion Lima</label>
                <Input
                  value={businessInfo.addressLima}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, addressLima: e.target.value })}
                  placeholder="Direccion en Lima"
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
                <label className="text-sm font-medium">Telefono</label>
                <Input
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                  placeholder="Telefono de contacto"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={handleSaveBusinessInfo}
                disabled={!hasBusinessChanges}
                className="transition-opacity"
              >
                {businessSaved ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Guardado!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Guardar Informacion
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
                      placeholder="Numero de cuenta"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CCI (opcional)</label>
                    <Input
                      value={account.cci || ''}
                      onChange={(e) => updateBankAccount(index, 'cci', e.target.value)}
                      placeholder="Codigo interbancario"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBankToDeleteIndex(index)}
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
              <Button 
                onClick={handleSaveBankAccounts}
                disabled={!hasBankChanges}
                className="transition-opacity"
              >
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
      
      {/* Bank Account Delete Confirmation */}
      <AlertDialog open={bankToDeleteIndex !== null} onOpenChange={() => setBankToDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Cuenta Bancaria</AlertDialogTitle>
            <AlertDialogDescription>
              Esta seguro de eliminar esta cuenta bancaria?
              {bankToDeleteIndex !== null && bankAccounts[bankToDeleteIndex]?.bankName && (
                <span className="font-medium"> ({bankAccounts[bankToDeleteIndex].bankName})</span>
              )}
              <br />
              Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveBankAccount} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
