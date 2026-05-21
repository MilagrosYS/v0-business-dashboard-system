'use client'

import { useState, useRef, useMemo } from 'react'
import { User, Lock, Settings as SettingsIcon, Save, Eye, EyeOff, Check, Building2, CreditCard, Trash2, Camera } from 'lucide-react'
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
    <div className="space-y-6 pt-6">
      {/* System Settings Card - FIRST */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">Configuración del Sistema</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4 items-end">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase">IGV (%)</label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={igvPercentage}
                  onChange={(e) => setIgvPercentage(e.target.value)}
                  placeholder="18"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Moneda por Defecto</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="USD">Dólares (USD)</option>
                <option value="PEN">Soles (PEN)</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Tipo de Cambio</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  placeholder="3.4"
                  className="pl-7"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSaveSettings}
              disabled={!hasSettingsChanges}
              className="bg-primary hover:bg-primary/90 text-white font-semibold h-10 whitespace-nowrap"
            >
              {settingsSaved ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Guardado!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  GUARDAR CAMBIOS
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Profile & Security Section - Side by Side - SECOND */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Perfil de Usuario</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-start gap-4">
              <div className="flex flex-col items-start gap-2">
                <div className="relative">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Perfil" 
                      className="h-24 w-24 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded bg-primary/10 text-2xl font-bold text-primary">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Cambiar Foto
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Nombre Completo</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Luis"
                  className="border-0 border-b border-border rounded-none px-0 py-2"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                  <span>●</span> Nombre de Usuario
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="border-0 border-b border-border rounded-none px-0 py-2"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSaveProfile} 
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
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
                  GUARDAR CAMBIOS
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Security Card */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Seguridad</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Contraseña Actual</label>
              <Input
                type="password"
                placeholder="••••••••"
                disabled
                className="border-0 border-b border-border rounded-none px-0 py-2"
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Nueva Contraseña</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder=""
                    className="border-0 border-b border-border rounded-none px-0 py-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Confirmar</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder=""
                    className="border-0 border-b border-border rounded-none px-0 py-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-primary flex-shrink-0">ⓘ</span>
              <span>La contraseña debe tener al menos 8 caracteres.</span>
            </p>
            
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
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
              disabled={!newPassword || !confirmPassword}
            >
              {passwordSuccess ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Guardado!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  GUARDAR CAMBIOS
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Business Info Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base font-semibold">Información de la Empresa</CardTitle>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Basic Info - Razón Social & RUC */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Razón Social</label>
              <Input
                value={businessInfo.companyName}
                onChange={(e) => setBusinessInfo({ ...businessInfo, companyName: e.target.value })}
                placeholder="MACHINA ERP INDUSTRIAL S.A.C."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">RUC</label>
              <Input
                value={businessInfo.ruc}
                onChange={(e) => setBusinessInfo({ ...businessInfo, ruc: e.target.value })}
                placeholder="20601234567"
              />
            </div>
          </div>
          
          {/* Addresses Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Dirección</label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary text-xs font-semibold h-auto p-0"
                onClick={() => {}}
              >
                + AGREGAR
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase w-20">Sede Lima</span>
                <Input
                  value={businessInfo.addressLima}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, addressLima: e.target.value })}
                  placeholder="Av. Industrial 450, Parque Industrial, Arequipa"
                  className="flex-1"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive h-auto p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase w-20">Sede AQP</span>
                <Input
                  value={businessInfo.addressArequipa}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, addressArequipa: e.target.value })}
                  placeholder="Calle Los Metales 120, Urbanización Industrial, Lima"
                  className="flex-1"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive h-auto p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Email & Phone Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary text-xs font-semibold h-auto p-0"
                onClick={() => {}}
              >
                + AGREGAR
              </Button>
            </div>
            
            <div className="grid gap-2 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                  placeholder="contacto@machina-erp.pe"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive h-auto p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">Teléfono</span>
                <Input
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                  placeholder="+51 987 654 321"
                  className="flex-1"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive h-auto p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary text-xs font-semibold h-auto p-0"
                  onClick={() => {}}
                >
                  + AGREGAR
                </Button>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleSaveBusinessInfo}
            disabled={!hasBusinessChanges}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold mt-4"
          >
            {businessSaved ? (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Guardado!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                GUARDAR CAMBIOS
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {/* Bank Accounts Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base font-semibold">Cuentas Bancarias</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Cuentas para mostrar en cotizaciones</p>
              </div>
            </div>
            <Button 
              onClick={addBankAccount} 
              variant="ghost" 
              size="sm"
              className="text-primary text-xs font-semibold"
            >
              + AGREGAR
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bankAccounts.map((account, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Banco</label>
                  <Input
                    value={account.bankName}
                    onChange={(e) => updateBankAccount(index, 'bankName', e.target.value)}
                    placeholder="BCP"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Nº Cuenta</label>
                  <Input
                    value={account.accountNumber}
                    onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)}
                    placeholder="215-0578-2429-1-33"
                  />
                </div>
                <div className="space-y-3 flex items-end justify-between">
                  <div className="flex-1 space-y-3">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">CCI (Opcional)</label>
                    <Input
                      value={account.cci || ''}
                      onChange={(e) => updateBankAccount(index, 'cci', e.target.value)}
                      placeholder="0022151057842429133"
                    />
                  </div>
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
            </div>
          ))}
          
          {bankAccounts.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No hay cuentas bancarias configuradas
            </p>
          )}
          
          <Button 
            onClick={handleSaveBankAccounts}
            disabled={!hasBankChanges}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold mt-6"
          >
            {banksSaved ? (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Guardado!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                GUARDAR CUENTAS
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
      
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
