'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, X, Building2, MapPin, Mail, Phone, UserPlus } from 'lucide-react'
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
import { Company, getActivityStatus, ActivityStatus, statusLabels } from '@/lib/types'
import { cn } from '@/lib/utils'

type ModalMode = 'create' | 'edit' | 'view' | null

const statusColors: Record<ActivityStatus, string> = {
  active: 'bg-status-active',
  warning: 'bg-status-warning',
  inactive: 'bg-status-inactive',
}

export function Companies() {
  const { companies, addCompany, updateCompany, deleteCompany, getLastQuotationDateForCompany } = useDashboardStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ActivityStatus>('all')
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
    emails: [] as string[],
    phones: [] as string[],
    addresses: [] as string[],
    assignedContacts: [] as { name: string; role: string }[],
  })
  
  // Store the initial state when opening edit mode for accurate comparison
  const [initialFormData, setInitialFormData] = useState<typeof formData | null>(null)
  
  // State for adding new contact inline
  const [newContactName, setNewContactName] = useState('')
  const [newContactRole, setNewContactRole] = useState('')
  const [showAddContact, setShowAddContact] = useState(false)
  
  // Helper to compare arrays - filter out empty strings before comparison
  const arraysEqual = (a: string[], b: string[]) => {
    const filteredA = a.filter(v => v.trim() !== '')
    const filteredB = b.filter(v => v.trim() !== '')
    if (filteredA.length !== filteredB.length) return false
    return filteredA.every((val, idx) => val === filteredB[idx])
  }
  
  const contactsEqual = (a: { name: string; role: string }[], b: { name: string; role: string }[]) => {
    // Filter out contacts with empty names
    const filteredA = a.filter(c => c.name.trim() !== '')
    const filteredB = b.filter(c => c.name.trim() !== '')
    if (filteredA.length !== filteredB.length) return false
    return filteredA.every((val, idx) => val.name === filteredB[idx].name && val.role === filteredB[idx].role)
  }
  
  // Check if form has required data and has changed (for edit mode)
  const isFormValid = formData.name.trim() !== '' && formData.ruc.trim() !== ''
  
  // For edit mode, compare against initialFormData to detect real changes
  const hasChanges = modalMode === 'create' ? (
    // For create mode, check if any required field has content
    formData.name.trim() !== '' || formData.ruc.trim() !== ''
  ) : (
    // For edit mode, compare against initial state
    initialFormData && (
      formData.name !== initialFormData.name ||
      formData.ruc !== initialFormData.ruc ||
      !arraysEqual(formData.emails, initialFormData.emails) ||
      !arraysEqual(formData.phones, initialFormData.phones) ||
      !arraysEqual(formData.addresses, initialFormData.addresses) ||
      !contactsEqual(formData.assignedContacts, initialFormData.assignedContacts)
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
    
    // Filter by automatic status based on quotation dates
    if (statusFilter !== 'all') {
      result = result.filter((c) => {
        const lastQuotationDate = getLastQuotationDateForCompany(c.id)
        const companyStatus = getActivityStatus(lastQuotationDate)
        return companyStatus === statusFilter
      })
    }
    
    return result
  }, [companies, search, statusFilter, getLastQuotationDateForCompany])
  
  const openCreate = () => {
    const emptyForm = { 
      name: '', 
      ruc: '', 
      address: '', 
      contact: '', 
      phone: '', 
      email: '', 
      emails: [],
      phones: [],
      addresses: [],
      assignedContacts: [],
    }
    setFormData(emptyForm)
    setInitialFormData(null) // No initial state for create mode
    setNewContactName('')
    setNewContactRole('')
    setShowAddContact(false)
    setModalMode('create')
  }
  
  const openEdit = (company: Company, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedCompany(company)
    
    // Properly load all existing data including arrays
    // Use the array fields if they exist, otherwise fallback to single field values
    const existingEmails = company.emails && company.emails.length > 0 
      ? [...company.emails]
      : (company.email ? [company.email] : [])
    const existingPhones = company.phones && company.phones.length > 0 
      ? [...company.phones]
      : (company.phone ? [company.phone] : [])
    const existingAddresses = company.addresses && company.addresses.length > 0 
      ? [...company.addresses]
      : (company.address ? [company.address] : [])
    const existingContacts = company.assignedContacts && company.assignedContacts.length > 0
      ? company.assignedContacts.map(c => ({ ...c }))
      : []
    
    const loadedFormData = {
      name: company.name,
      ruc: company.ruc,
      address: company.address,
      contact: company.contact,
      phone: company.phone,
      email: company.email,
      emails: existingEmails,
      phones: existingPhones,
      addresses: existingAddresses,
      assignedContacts: existingContacts,
    }
    
    setFormData(loadedFormData)
    // Store a deep copy of the initial state for comparison
    setInitialFormData({
      ...loadedFormData,
      emails: [...existingEmails],
      phones: [...existingPhones],
      addresses: [...existingAddresses],
      assignedContacts: existingContacts.map(c => ({ ...c })),
    })
    setNewContactName('')
    setNewContactRole('')
    setShowAddContact(false)
    setModalMode('edit')
  }
  
  const openView = (company: Company) => {
    setSelectedCompany(company)
    setModalMode('view')
  }
  
  const closeModal = () => {
    setModalMode(null)
    setSelectedCompany(null)
    setNewContactName('')
    setNewContactRole('')
    setShowAddContact(false)
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
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | ActivityStatus)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activo (cotizacion en ultimos 3 meses)</option>
                  <option value="warning">Inactivo reciente (3-5 meses sin cotizacion)</option>
                  <option value="inactive">Sin actividad (mas de 5 meses)</option>
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
                  const lastQuotationDate = getLastQuotationDateForCompany(company.id)
                  const status = getActivityStatus(lastQuotationDate)
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
        <DialogContent className="sm:max-w-4xl border-0 shadow-lg p-0 overflow-hidden">
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
            
            <form onSubmit={handleSubmit}>
              {/* Three Column Layout */}
              <div className="grid grid-cols-3 gap-6">
                {/* Column 1: INFORMACION BASICA */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full" />
                    <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Informacion Basica
                    </h3>
                  </div>
                  
                  {/* Razon Social */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Razon Social
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Minera Cerro Verde S.A.A."
                      required
                      className="text-sm"
                    />
                  </div>
                  
                  {/* RUC */}
                  <div className="space-y-1.5">
                    <Label htmlFor="ruc" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      RUC
                    </Label>
                    <Input
                      id="ruc"
                      value={formData.ruc}
                      onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                      placeholder="20170072465"
                      required
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Direccion Fiscal */}
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Direccion Fiscal
                    </Label>
                    {(formData.addresses.length > 0 ? formData.addresses : (formData.address ? [formData.address] : [''])).map((addr, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-input rounded-md bg-background">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <input
                            value={addr}
                            onChange={(e) => {
                              const newAddresses = formData.addresses.length > 0 ? [...formData.addresses] : (formData.address ? [formData.address] : [''])
                              newAddresses[index] = e.target.value
                              setFormData({ ...formData, addresses: newAddresses, address: newAddresses[0] || '' })
                            }}
                            placeholder="Carr. Variante de Uchumayo k"
                            className="flex-1 text-sm bg-transparent border-0 p-0 h-auto focus:outline-none focus:ring-0"
                          />
                        </div>
                        <button
                          type="button"
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => {
                            const currentAddresses = formData.addresses.length > 0 ? formData.addresses : (formData.address ? [formData.address] : [])
                            const newAddresses = currentAddresses.filter((_, i) => i !== index)
                            setFormData({ ...formData, addresses: newAddresses, address: newAddresses[0] || '' })
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    onClick={() => {
                      const currentAddresses = formData.addresses.length > 0 ? formData.addresses : (formData.address ? [formData.address] : [])
                      setFormData({ ...formData, addresses: [...currentAddresses, ''] })
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ AGREGAR</span>
                  </button>
                </div>
                
                {/* Column 2: CANALES DE CONTACTO */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full" />
                    <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Canales de Contacto
                    </h3>
                  </div>
                  
                  {/* Correo Electronico */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Correo Electronico
                    </Label>
                    {(formData.emails.length > 0 ? formData.emails : (formData.email ? [formData.email] : [''])).map((email, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            const newEmails = formData.emails.length > 0 ? [...formData.emails] : (formData.email ? [formData.email] : [''])
                            newEmails[index] = e.target.value
                            setFormData({ ...formData, emails: newEmails, email: newEmails[0] || '' })
                          }}
                          placeholder="compras@cerroverde.pe"
                          className="text-sm flex-1"
                        />
                        <button
                          type="button"
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => {
                            const currentEmails = formData.emails.length > 0 ? formData.emails : (formData.email ? [formData.email] : [])
                            const newEmails = currentEmails.filter((_, i) => i !== index)
                            setFormData({ ...formData, emails: newEmails, email: newEmails[0] || '' })
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    onClick={() => {
                      const currentEmails = formData.emails.length > 0 ? formData.emails : (formData.email ? [formData.email] : [])
                      setFormData({ ...formData, emails: [...currentEmails, ''] })
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ AGREGAR</span>
                  </button>
                  
                  {/* Telefono de Contacto */}
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Telefono de Contacto
                    </Label>
                    {(formData.phones.length > 0 ? formData.phones : (formData.phone ? [formData.phone] : [''])).map((phone, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={phone}
                          onChange={(e) => {
                            const newPhones = formData.phones.length > 0 ? [...formData.phones] : (formData.phone ? [formData.phone] : [''])
                            newPhones[index] = e.target.value
                            setFormData({ ...formData, phones: newPhones, phone: newPhones[0] || '' })
                          }}
                          placeholder="+51 954 782 145"
                          className="text-sm flex-1"
                        />
                        <button
                          type="button"
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => {
                            const currentPhones = formData.phones.length > 0 ? formData.phones : (formData.phone ? [formData.phone] : [])
                            const newPhones = currentPhones.filter((_, i) => i !== index)
                            setFormData({ ...formData, phones: newPhones, phone: newPhones[0] || '' })
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    onClick={() => {
                      const currentPhones = formData.phones.length > 0 ? formData.phones : (formData.phone ? [formData.phone] : [])
                      setFormData({ ...formData, phones: [...currentPhones, ''] })
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ AGREGAR</span>
                  </button>
                </div>
                
                {/* Column 3: CONTACTOS ASIGNADOS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full" />
                    <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Contactos Asignados
                    </h3>
                  </div>
                  
                  {/* Contact cards */}
                  <div className="space-y-2">
                    {formData.assignedContacts.map((contact, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background"
                      >
                        <div className={cn(
                          "flex items-center justify-center w-9 h-9 rounded-lg text-xs font-semibold flex-shrink-0",
                          index === 0 ? "bg-blue-100 text-blue-600" : "bg-muted text-muted-foreground"
                        )}>
                          {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                          <p className="text-xs text-muted-foreground uppercase">{contact.role}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newContacts = formData.assignedContacts.filter((_, i) => i !== index)
                            setFormData({ ...formData, assignedContacts: newContacts })
                          }}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Contact Form - Inline */}
                  {showAddContact ? (
                    <div className="p-3 border border-border rounded-lg bg-muted/30 space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Nombre</Label>
                        <Input
                          value={newContactName}
                          onChange={(e) => setNewContactName(e.target.value)}
                          placeholder="Nombre del contacto"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Cargo</Label>
                        <Input
                          value={newContactRole}
                          onChange={(e) => setNewContactRole(e.target.value)}
                          placeholder="Cargo del contacto"
                          className="text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => {
                            setShowAddContact(false)
                            setNewContactName('')
                            setNewContactRole('')
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={!newContactName.trim() || !newContactRole.trim()}
                          onClick={() => {
                            if (newContactName.trim() && newContactRole.trim()) {
                              setFormData({
                                ...formData,
                                assignedContacts: [...formData.assignedContacts, { name: newContactName.trim(), role: newContactRole.trim() }]
                              })
                              setNewContactName('')
                              setNewContactRole('')
                              setShowAddContact(false)
                            }
                          }}
                        >
                          Agregar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2 border border-dashed border-border rounded-lg"
                      onClick={() => setShowAddContact(true)}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>AGREGAR CONTACTO</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={closeModal}
                >
                  CANCELAR
                </Button>
                <Button 
                  type="submit" 
                  disabled={!canSubmit}
                  className={cn(
                    "bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium px-6",
                    !canSubmit && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  GUARDAR CAMBIOS
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
              const lastQuotationDate = getLastQuotationDateForCompany(selectedCompany.id)
              const status = getActivityStatus(lastQuotationDate)
              const allAddresses = selectedCompany.addresses && selectedCompany.addresses.length > 0 
                ? selectedCompany.addresses 
                : (selectedCompany.address ? [selectedCompany.address] : [])
              const allEmails = selectedCompany.emails && selectedCompany.emails.length > 0 
                ? selectedCompany.emails 
                : (selectedCompany.email ? [selectedCompany.email] : [])
              const allPhones = selectedCompany.phones && selectedCompany.phones.length > 0 
                ? selectedCompany.phones 
                : (selectedCompany.phone ? [selectedCompany.phone] : [])
              const allContacts = selectedCompany.assignedContacts || []
              
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
                  
                  {/* All Addresses */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Dirección Fiscal {allAddresses.length > 1 && `(${allAddresses.length})`}
                    </p>
                    <div className="space-y-2">
                      {allAddresses.length > 0 ? allAddresses.map((addr, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-foreground">{addr}</p>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground">No especificado</p>
                      )}
                    </div>
                  </div>
                  
                  {/* All Emails and Phones */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Correo Electrónico {allEmails.length > 1 && `(${allEmails.length})`}
                      </p>
                      <div className="space-y-2">
                        {allEmails.length > 0 ? allEmails.map((email, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <a href={`mailto:${email}`} className="text-sm text-blue-600 hover:text-blue-700 underline">
                              {email}
                            </a>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground">No especificado</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Teléfono de Contacto {allPhones.length > 1 && `(${allPhones.length})`}
                      </p>
                      <div className="space-y-2">
                        {allPhones.length > 0 ? allPhones.map((phone, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <a href={`tel:${phone}`} className="text-sm text-blue-600 hover:text-blue-700 underline">
                              {phone}
                            </a>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground">No especificado</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* All Assigned Contacts */}
                  {allContacts.length > 0 && (
                    <div className="rounded-lg border border-border bg-muted/40 p-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Contactos Asignados ({allContacts.length})
                      </p>
                      <div className="space-y-3">
                        {allContacts.map((contact, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className={cn(
                              "flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm",
                              idx === 0 ? "bg-blue-100 text-blue-600" : "bg-muted text-muted-foreground"
                            )}>
                              {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{contact.name}</p>
                              <p className="text-xs text-muted-foreground uppercase">{contact.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Legacy Contact Person Card - only show if no assigned contacts but has contact field */}
                  {allContacts.length === 0 && selectedCompany.contact && (
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
