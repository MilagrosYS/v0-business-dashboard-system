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
import { SparePart, normalizePartNumber } from '@/lib/types'

type ModalMode = 'create' | 'edit' | 'detail' | null

export function SpareParts() {
  const { spareParts, addSparePart, updateSparePart, deleteSparePart } = useDashboardStore()
  const [search, setSearch] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<SparePart | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  
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
  
  // Check if form has required data and has changed (for edit mode)
  const isFormValid = formData.partNumber.trim() !== '' && formData.description.trim() !== ''
  const hasChanges = modalMode === 'create' ? true : (
    selectedPart && (
      formData.internalCode !== selectedPart.internalCode ||
      formData.partNumber !== selectedPart.partNumber ||
      formData.model !== selectedPart.model ||
      formData.equipment !== selectedPart.equipment ||
      formData.description !== selectedPart.description ||
      formData.measurement !== selectedPart.measurement ||
      formData.price !== selectedPart.price.toString()
    )
  )
  const canSubmit = isFormValid && hasChanges
  
  const filteredParts = useMemo(() => {
    if (!search) return spareParts
    const searchLower = search.toLowerCase()
    const searchNormalized = normalizePartNumber(search).toLowerCase()
    return spareParts.filter(
      (p) =>
        normalizePartNumber(p.partNumber).toLowerCase().includes(searchNormalized) ||
        normalizePartNumber(p.internalCode).toLowerCase().includes(searchNormalized) ||
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
  
  const openEdit = (e: React.MouseEvent, part: SparePart) => {
    e.stopPropagation()
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
  
  const openDetail = (part: SparePart) => {
    setSelectedPart(part)
    setModalMode('detail')
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
  
  const handleDelete = (e: React.MouseEvent, part: SparePart) => {
    e.stopPropagation()
    setDeleteConfirm(part)
  }
  
  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteSparePart(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Repuestos</h2>
          <p className="text-muted-foreground">Gestion del catalogo de productos</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Repuesto
        </Button>
      </div>
      
      {/* Search */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por numero de parte, codigo interno o descripcion..."
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
          <CardTitle className="text-lg text-card-foreground">Catalogo de Repuestos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Item</TableHead>
                <TableHead>Codigo Interno</TableHead>
                <TableHead>Numero de Parte</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Descripcion</TableHead>
                <TableHead>Medida</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                    No se encontraron repuestos
                  </TableCell>
                </TableRow>
              ) : (
                filteredParts.map((part, index) => (
                  <TableRow 
                    key={part.id} 
                    className="table-row-hover cursor-pointer"
                    style={{
                      transform: hoveredRow === part.id ? 'translateX(-4px)' : 'translateX(0)',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={() => setHoveredRow(part.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => openDetail(part)}
                  >
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {index + 1}
                    </TableCell>
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
                      <div 
                        className="flex gap-1 justify-end"
                        style={{
                          opacity: hoveredRow === part.id ? 1 : 0,
                          transition: 'opacity 0.15s ease'
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => openEdit(e, part)}
                          className="h-7 w-7"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => handleDelete(e, part)}
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
      
      {/* Detail Modal */}
      <Dialog open={modalMode === 'detail'} onOpenChange={closeModal}>
        <DialogContent className="max-w-md">
          <div className="absolute right-4 top-4">
            <Button variant="ghost" size="icon-sm" onClick={closeModal} className="h-7 w-7">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {selectedPart && (
            <div className="space-y-4 pt-2">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-lg font-semibold text-primary">
                    {selectedPart.partNumber}
                  </span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {selectedPart.internalCode}
                  </span>
                </div>
                <p className="text-sm text-card-foreground">{selectedPart.description}</p>
              </div>
              
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-0.5">Modelo</p>
                  <p className="font-medium">{selectedPart.model || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Equipo</p>
                  <p className="font-medium">{selectedPart.equipment || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Medida</p>
                  <p className="font-medium">{selectedPart.measurement || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Precio</p>
                  <p className="font-medium">${selectedPart.price.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Current Quantity */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Cantidad Actual</span>
                <span className="font-mono text-xl font-bold text-primary">
                  {selectedPart.quantity}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Create/Edit Modal */}
      <Dialog open={modalMode === 'create' || modalMode === 'edit'} onOpenChange={closeModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{modalMode === 'create' ? 'Nuevo Repuesto' : 'Editar Repuesto'}</DialogTitle>
            <DialogDescription>
              {modalMode === 'create' 
                ? 'Agrega un nuevo repuesto a tu catalogo.' 
                : 'Actualiza la informacion del repuesto.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="internalCode">Codigo Interno</Label>
                  <Input
                    id="internalCode"
                    value={formData.internalCode}
                    onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                    placeholder="Ingresa codigo interno..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="partNumber">Numero de Parte *</Label>
                  <Input
                    id="partNumber"
                    value={formData.partNumber}
                    onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                    placeholder="Ingresa numero de parte..."
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Ingresa modelo..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="equipment">Equipo</Label>
                  <Input
                    id="equipment"
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    placeholder="Ingresa equipo..."
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Descripcion *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingresa descripcion..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="measurement">Medida</Label>
                  <Input
                    id="measurement"
                    value={formData.measurement}
                    onChange={(e) => setFormData({ ...formData, measurement: e.target.value })}
                    placeholder="Ingresa medida..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Ingresa precio..."
                  />
                </div>
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
      
      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Repuesto</DialogTitle>
            <DialogDescription>
              Estas seguro que deseas eliminar {deleteConfirm?.partNumber}? Esto tambien eliminara todos los movimientos de stock relacionados. Esta accion no se puede deshacer.
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
