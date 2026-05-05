'use client'

import { useState } from 'react'
import { User, Settings as SettingsIcon, Save, Eye, EyeOff, Check } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
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
  const [sellerName, setSellerName] = useState(systemSettings.sellerName)
  const [settingsSaved, setSettingsSaved] = useState(false)
  
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
      setPasswordError('New passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
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
      setPasswordError('Current password is incorrect')
    }
  }
  
  // Save system settings
  const handleSaveSettings = () => {
    updateSettings({
      igvPercentage: parseFloat(igvPercentage) || 18,
      currency,
      sellerName,
    })
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2000)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your profile and system preferences</p>
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
                <CardTitle className="text-lg">Profile</CardTitle>
                <CardDescription>Update your account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Image */}
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
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
              />
            </div>
            
            <Button onClick={handleSaveProfile} className="w-full">
              {profileSaved ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Saved!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Profile
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
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
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
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
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
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            
            {passwordError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {passwordError}
              </div>
            )}
            
            {passwordSuccess && (
              <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600">
                Password updated successfully!
              </div>
            )}
            
            <Button 
              onClick={handleChangePassword} 
              className="w-full"
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              <Save className="mr-2 h-4 w-4" />
              Change Password
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
                <CardTitle className="text-lg">System Settings</CardTitle>
                <CardDescription>Configure your business preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">IGV Percentage (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={igvPercentage}
                  onChange={(e) => setIgvPercentage(e.target.value)}
                  placeholder="18"
                />
                <p className="text-xs text-muted-foreground">Tax percentage for quotations</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency Symbol</label>
                <Input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="$"
                />
                <p className="text-xs text-muted-foreground">Currency displayed in quotations</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Seller Name</label>
                <Input
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Seller name"
                />
                <p className="text-xs text-muted-foreground">Default seller on new quotations</p>
              </div>
            </div>
            
            <div className="mt-6">
              <Button onClick={handleSaveSettings}>
                {settingsSaved ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Saved!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Settings
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
