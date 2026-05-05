'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react'
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

export function Companies() {
  const { companies, addCompany, updateCompany, deleteCompany } = useDashboardStore()
  const [search, setSearch] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Company | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    ruc: '',
    contact: '',
    phone: '',
    email: '',
  })
  
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
    setFormData({ name: '', ruc: '', contact: '', phone: '', email: '' })
    setModalMode('create')
  }
  
  const openEdit = (company: Company) => {
    setSelectedCompany(company)
    setFormData({
      name: company.name,
      ruc: company.ruc,
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
  
  const handleDelete = () => {
    if (deleteConfirm) {
      deleteCompany(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Companies</h2>
          <p className="text-muted-foreground">Manage your client companies</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Company
        </Button>
      </div>
      
      {/* Search */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by company name or RUC..."
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
          <CardTitle className="text-lg text-card-foreground">Company List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>RUC</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No companies found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => {
                  const status = getActivityStatus(company.lastActivity)
                  return (
                    <TableRow key={company.id} className="table-row-hover group">
                      <TableCell className="font-medium text-card-foreground">{company.name}</TableCell>
                      <TableCell className="font-mono text-sm">{company.ruc}</TableCell>
                      <TableCell>{company.contact}</TableCell>
                      <TableCell>{company.phone}</TableCell>
                      <TableCell>{company.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'h-2.5 w-2.5 rounded-full',
                              statusColors[status]
                            )}
                            title={`Activity: ${status}`}
                          />
                          <div className="hidden gap-1 group-hover:flex">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openView(company)}
                              className="h-7 w-7"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEdit(company)}
                              className="h-7 w-7"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteConfirm(company)}
                              className="h-7 w-7 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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
            <DialogTitle>{modalMode === 'create' ? 'New Company' : 'Edit Company'}</DialogTitle>
            <DialogDescription>
              {modalMode === 'create' 
                ? 'Add a new client company to your system.' 
                : 'Update the company information.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="ruc">RUC *</Label>
                <Input
                  id="ruc"
                  value={formData.ruc}
                  onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                  placeholder="20123456789"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Company Name S.A."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Person</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+51 999 888 777"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@company.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">
                {modalMode === 'create' ? 'Create' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View Modal */}
      <Dialog open={modalMode === 'view'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary">
                    {selectedCompany.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">{selectedCompany.name}</h3>
                  <p className="font-mono text-sm text-muted-foreground">{selectedCompany.ruc}</p>
                </div>
              </div>
              
              <div className="grid gap-3 rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Contact</span>
                  <span className="text-sm font-medium text-card-foreground">{selectedCompany.contact || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <span className="text-sm font-medium text-card-foreground">{selectedCompany.phone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium text-card-foreground">{selectedCompany.email || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        statusColors[getActivityStatus(selectedCompany.lastActivity)]
                      )}
                    />
                    <span className="text-sm font-medium capitalize text-card-foreground">
                      {getActivityStatus(selectedCompany.lastActivity)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Activity</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {selectedCompany.lastActivity.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button onClick={() => selectedCompany && openEdit(selectedCompany)}>
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteConfirm?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
