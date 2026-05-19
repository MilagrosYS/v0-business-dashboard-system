'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, X, Building2, MapPin, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useDashboardStore } from '@/lib/store'
import { Company, getActivityStatus, ActivityStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

type ModalMode = 'create' | 'edit' | 'view' | null

const statusColors: Record<ActivityStatus, string> = {
  active: 'bg-status-active',
  warning: 'bg-status-warning',
  inactive: 'bg-status-inactive',
}

const statusLabels: Record<ActivityStatus, string> = {
  active: 'Activo',
  warning: 'Moderado',
  inactive: 'Inactivo',
}

export function Companies() {
  const { companies, addCompany, updateCompany, deleteCompany } = useDashboardStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Company | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    ruc: '',
    address: '',
    contact: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
    emails: [] as string[],
    phones: [] as string[],
    assignedContacts: [] as { name: string; role: string }[],
  })
  
  // Check if form has required data and has changed (for edit mode)
  const isFormValid = formData.name.trim() !== '' && formData.ruc.trim() !== ''
  const hasChanges = modalMode === 'create' ? true : (
    selectedCompany && (
      formData.name !== selectedCompany.name ||
      formData.ruc !== selectedCompany.ruc ||
      formData.address !== selectedCompany.address ||
      formData.contact !== selectedCompany.contact ||
      formData.phone !== selectedCompany.phone ||
      formData.email !== selectedCompany.email ||
      formData.status !== selectedCompany.status
    )
  )
  const canSubmit = isFormValid && hasChanges
  
  const filteredCompanies = useMemo(() => {
    let result = companies
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.ruc.includes(search)
      )
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter)
    }
    
    return result
  }, [companies, search, statusFilter])
  
  const openCreate = () => {
    setFormData({ 
      name: '', 
      ruc: '', 
      address: '', 
      contact: '', 
      phone: '', 
      email: '', 
      status: 'active',
      emails: [],
      phones: [],
      assignedContacts: [],
    })
    setModalMode('create')
  }
  
  const openEdit = (company: Company, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedCompany(company)
    setFormData({
      name: company.name,
      ruc: company.ruc,
      address: company.address,
      contact: company.contact,
      phone: company.phone,
      email: company.email,
      status: company.status,
      emails: company.emails || [company.email],
      phones: company.phones || [company.phone],
      assignedContacts: company.assignedContacts || [],
    })
    setModalMode('edit')
  }
  
  const openView = (company: Company) => {
    setSelectedCompany(company)
    setModalMode('view')
  }
  
  const closeModal = () => {
    setModalMode(null)
    setSelectedCompany(null)
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.ruc) return
    
    if (modalMode === 'create') {
      addCompany(formData)
    } else if (modalMode === 'edit' && selectedCompany) {
      updateCompany(selectedCompany.id, formData)
    }
    closeModal()
  }
  
  const handleDelete = (company: Company, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirm(company)
  }
  
  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteCompany(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Empresas</h2>
          <p className="text-muted-foreground">Gestiona tus empresas clientes</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Empresa
        </Button>
      </div>
      
      {/* Search and Filters */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de empresa o RUC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="status-filter" className="text-sm text-muted-foreground mb-2 block">Estado</Label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Table */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground">Lista de Empresas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Razón Social</TableHead>
                <TableHead>RUC</TableHead>
                <TableHead className="w-48">Dirección</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No se encontraron empresas
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => {
                  const status = getActivityStatus(company.lastActivity)
                  const isHovered = hoveredRow === company.id
                  return (
                    <TableRow 
                      key={company.id} 
                      className={cn(
                        "table-row-hover cursor-pointer",
                        isHovered && "table-row-slide"
                      )}
                      onMouseEnter={() => setHoveredRow(company.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onClick={() => openView(company)}
                    >
                      <TableCell className="font-medium text-card-foreground">{company.name}</TableCell>
                      <TableCell className="font-mono text-sm">{company.ruc}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{company.address || '-'}</TableCell>
                      <TableCell>{company.email || '-'}</TableCell>
                      <TableCell>{company.phone || '-'}</TableCell>
                      <TableCell>{company.contact || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {isHovered ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDelete(company, e)}
                              className="h-8 px-2 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span
                              className={cn(
                                'h-2.5 w-2.5 rounded-full',
                                statusColors[status]
                              )}
                              title={`Activity: ${statusLabels[status]}`}
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Create/Edit Modal */}
      <Dialog open={modalMode === 'create' || modalMode === 'edit'} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-2xl border-0 shadow-lg p-0 overflow-hidden">
          {/* Blue top border accent */}
          <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
          
          <div className="p-6 space-y-6">
            {/* Header with close button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    {modalMode === 'create' ? 'Nueva Empresa' : 'Editar Empresa'}
                  </h1>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Nombre and RUC */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Nombre de Empresa *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ingresa nombre de empresa"
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ruc" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    RUC *
                  </Label>
                  <Input
                    id="ruc"
                    value={formData.ruc}
                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                    placeholder="Ingresa RUC"
                    required
                    className="text-sm"
                  />
                </div>
              </div>
              
              {/* Row 2: Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Dirección Fiscal
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ingresa dirección"
                  className="text-sm"
                />
              </div>
              
              {/* Row 3: Email and Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Ingresa email"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Teléfono de Contacto
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ingresa teléfono"
                    className="text-sm"
                  />
                </div>
              </div>
              
              {/* Row 4: Contact and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Contacto Directo
                  </Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Ingresa nombre de contacto"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Estado
                  </Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 text-sm"
                  onClick={closeModal}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={!canSubmit}
                  className={cn(
                    "flex-1 bg-foreground text-background hover:bg-foreground/90 text-sm",
                    !canSubmit && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {modalMode === 'create' ? 'Crear Empresa' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* View Modal - Detail Modal */}
      <Dialog open={modalMode === 'view'} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-2xl border-0 shadow-lg p-0 overflow-hidden">
          {/* Blue top border accent */}
          <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
          
          <div className="p-6 space-y-6">
            {/* Header with close button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Detalle de Empresa</h1>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {selectedCompany && (() => {
              const status = getActivityStatus(selectedCompany.lastActivity)
              return (
                <div className="space-y-6">
                  {/* Company Name */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Razón Social</p>
                    <h2 className="text-2xl font-semibold text-foreground">{selectedCompany.name}</h2>
                  </div>
                  
                  {/* RUC and Status */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">RUC</p>
                      <p className="text-sm font-medium text-foreground font-mono">{selectedCompany.ruc}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Estado</p>
                      <div className="flex items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full', statusColors[status])} />
                        <span className="text-sm font-medium text-foreground">{statusLabels[status]}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Dirección Fiscal</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground">{selectedCompany.address || 'No especificado'}</p>
                    </div>
                  </div>
                  
                  {/* Email and Phone */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Correo Electrónico</p>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <a href={`mailto:${selectedCompany.email}`} className="text-sm text-blue-600 hover:text-blue-700 underline">
                          {selectedCompany.email || 'No especificado'}
                        </a>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Teléfono de Contacto</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <a href={`tel:${selectedCompany.phone}`} className="text-sm text-blue-600 hover:text-blue-700 underline">
                          {selectedCompany.phone || 'No especificado'}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Person Card */}
                  {selectedCompany.contact && (
                    <div className="rounded-lg border border-border bg-muted/40 p-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contacto Directo</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                          {selectedCompany.contact.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{selectedCompany.contact}</p>
                          <p className="text-xs text-muted-foreground">Representante</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button 
                      variant="outline" 
                      className="flex-1 text-sm"
                      onClick={closeModal}
                    >
                      Historial de Compras
                    </Button>
                    <Button 
                      className="flex-1 bg-foreground text-background hover:bg-foreground/90 text-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        closeModal()
                        setTimeout(() => openEdit(selectedCompany, e as any), 100)
                      }}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              )
            })()}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Empresa</DialogTitle>
            <DialogDescription>
              Estas seguro que deseas eliminar {deleteConfirm?.name}? Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
