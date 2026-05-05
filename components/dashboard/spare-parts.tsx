'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
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
import { SparePart } from '@/lib/types'

type ModalMode = 'create' | 'edit' | null

export function SpareParts() {
  const { spareParts, addSparePart, updateSparePart, deleteSparePart } = useDashboardStore()
  const [search, setSearch] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<SparePart | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    internalCode: '',
    partNumber: '',
    model: '',
    equipment: '',
    description: '',
    measurement: '',
    price: '',
  })
  
  const filteredParts = useMemo(() => {
    if (!search) return spareParts
    const searchLower = search.toLowerCase()
    return spareParts.filter(
      (p) =>
        p.partNumber.toLowerCase().includes(searchLower) ||
        p.internalCode.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
    )
  }, [spareParts, search])
  
  const openCreate = () => {
    setFormData({
      internalCode: '',
      partNumber: '',
      model: '',
      equipment: '',
      description: '',
      measurement: '',
      price: '',
    })
    setModalMode('create')
  }
  
  const openEdit = (part: SparePart) => {
    setSelectedPart(part)
    setFormData({
      internalCode: part.internalCode,
      partNumber: part.partNumber,
      model: part.model,
      equipment: part.equipment,
      description: part.description,
      measurement: part.measurement,
      price: part.price.toString(),
    })
    setModalMode('edit')
  }
  
  const closeModal = () => {
    setModalMode(null)
    setSelectedPart(null)
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const partData = {
      internalCode: formData.internalCode,
      partNumber: formData.partNumber,
      model: formData.model,
      equipment: formData.equipment,
      description: formData.description,
      measurement: formData.measurement,
      price: parseFloat(formData.price) || 0,
    }
    
    if (modalMode === 'create') {
      addSparePart(partData)
    } else if (modalMode === 'edit' && selectedPart) {
      updateSparePart(selectedPart.id, partData)
    }
    closeModal()
  }
  
  const handleDelete = () => {
    if (deleteConfirm) {
      deleteSparePart(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Spare Parts</h2>
          <p className="text-muted-foreground">Product catalog management</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Part
        </Button>
      </div>
      
      {/* Search */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by part number, internal code, or description..."
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
          <CardTitle className="text-lg text-card-foreground">Parts Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Internal Code</TableHead>
                <TableHead>Part Number</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Measurement</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    No spare parts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredParts.map((part) => (
                  <TableRow key={part.id} className="table-row-hover group">
                    <TableCell className="font-mono text-sm">{part.internalCode}</TableCell>
                    <TableCell className="font-mono text-sm font-medium text-primary">{part.partNumber}</TableCell>
                    <TableCell>{part.model}</TableCell>
                    <TableCell>{part.equipment}</TableCell>
                    <TableCell className="max-w-48 truncate">{part.description}</TableCell>
                    <TableCell>{part.measurement}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${part.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {part.quantity}
                    </TableCell>
                    <TableCell>
                      <div className="hidden gap-1 group-hover:flex">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(part)}
                          className="h-7 w-7"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteConfirm(part)}
                          className="h-7 w-7 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Create/Edit Modal */}
      <Dialog open={modalMode === 'create' || modalMode === 'edit'} onOpenChange={closeModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{modalMode === 'create' ? 'New Spare Part' : 'Edit Spare Part'}</DialogTitle>
            <DialogDescription>
              {modalMode === 'create' 
                ? 'Add a new spare part to your catalog.' 
                : 'Update the spare part information.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="internalCode">Internal Code</Label>
                  <Input
                    id="internalCode"
                    value={formData.internalCode}
                    onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                    placeholder="INT-001"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="partNumber">Part Number *</Label>
                  <Input
                    id="partNumber"
                    value={formData.partNumber}
                    onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                    placeholder="COT-001"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="CAT 320D"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="equipment">Equipment</Label>
                  <Input
                    id="equipment"
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    placeholder="Excavadora"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Filtro de aceite hidraulico"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="measurement">Measurement</Label>
                  <Input
                    id="measurement"
                    value={formData.measurement}
                    onChange={(e) => setFormData({ ...formData, measurement: e.target.value })}
                    placeholder="Unidad"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
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
      
      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Spare Part</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteConfirm?.partNumber}? This will also remove all related stock movements. This action cannot be undone.
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
