'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react'
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
      formData.email !== selectedCompany.email
    )
  )
  const canSubmit = isFormValid && hasChanges
  
  const filteredCompanies = useMemo(() => {
    if (!search) return companies
    const searchLower = search.toLowerCase()
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.ruc.includes(search)
    )
  }, [companies, search])
  
  const openCreate = () => {
    setFormData({ name: '', ruc: '', address: '', contact: '', phone: '', email: '' })
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
      
      {/* Search */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre de empresa o RUC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
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
                <TableHead>Nombre de Empresa</TableHead>
                <TableHead>RUC</TableHead>
                <TableHead>Direccion</TableHead>
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
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => openEdit(company, e)}
                                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDelete(company, e)}
                                className="h-8 px-2 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalMode === 'create' ? 'Nueva Empresa' : 'Editar Empresa'}</DialogTitle>
            <DialogDescription>
              {modalMode === 'create' 
                ? 'Agrega una nueva empresa cliente al sistema.' 
                : 'Actualiza la informacion de la empresa.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre de Empresa *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ingresa nombre de empresa"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ruc">RUC *</Label>
                <Input
                  id="ruc"
                  value={formData.ruc}
                  onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                  placeholder="Ingresa RUC"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Direccion</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ingresa direccion"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ingresa email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ingresa telefono"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Contacto</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Ingresa nombre de contacto"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSubmit} className={!canSubmit ? 'opacity-50' : ''}>
                {modalMode === 'create' ? 'Crear' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View Modal - Redesigned */}
      <Dialog open={modalMode === 'view'} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <button
            onClick={closeModal}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          {selectedCompany && (() => {
            const status = getActivityStatus(selectedCompany.lastActivity)
            return (
              <div className="space-y-4 pt-2">
                {/* Header with Company Name and Status */}
                <div className="flex items-start justify-between pr-6">
                  <div>
                    <h2 className="text-xl font-semibold text-card-foreground">{selectedCompany.name}</h2>
                    <p className="font-mono text-sm text-muted-foreground">{selectedCompany.ruc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        'h-3 w-3 rounded-full',
                        statusColors[status]
                      )}
                    />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(selectedCompany.lastActivity)}
                    </span>
                  </div>
                </div>
                
                {/* Company Details */}
                <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Direccion</span>
                    <span className="text-sm font-medium text-card-foreground text-right max-w-[200px]">
                      {selectedCompany.address || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm font-medium text-card-foreground">{selectedCompany.email || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Telefono</span>
                    <span className="text-sm font-medium text-card-foreground">{selectedCompany.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Contacto</span>
                    <span className="text-sm font-medium text-card-foreground">{selectedCompany.contact || '-'}</span>
                  </div>
                </div>
              </div>
            )
          })()}
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
