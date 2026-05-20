'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Trash2, X, Package, MapPin, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react'
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
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useDashboardStore } from '@/lib/store'
import { SparePart, normalizePartNumber } from '@/lib/types'
import { cn } from '@/lib/utils'

type ModalMode = 'create' | 'edit' | 'detail' | null

const CATEGORIES = ['Filtración', 'Rodillos', 'Tuberías', 'Componentes', 'Accesorios', 'Otros']
const ITEMS_PER_PAGE = 12

// Stock level color mapping - only for CANTIDAD column
const getStockColor = (quantity: number) => {
  if (quantity <= 5) return 'text-red-600' // Bajo stock
  if (quantity <= 15) return 'text-orange-500' // Medio stock
  return 'text-green-600' // Buen stock
}

export function SpareParts() {
  const { spareParts, addSparePart, updateSparePart, deleteSparePart } = useDashboardStore()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<SparePart | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    internalCode: '',
    partNumber: '',
    model: '',
    equipment: '',
    description: '',
    function: '',
    category: '',
    measurement: '',
    price: '',
    location: '',
    locations: [] as string[],
    suppliers: [] as string[],
    assignedContacts: [] as { name: string; role: string }[],
  })
  
  // Check if form has required data and has changed
  const isFormValid = formData.partNumber.trim() !== '' && formData.description.trim() !== ''
  const hasChanges = modalMode === 'create' ? true : (
    selectedPart && (
      formData.internalCode !== (selectedPart.internalCode || '') ||
      formData.partNumber !== selectedPart.partNumber ||
      formData.model !== (selectedPart.model || '') ||
      formData.equipment !== (selectedPart.equipment || '') ||
      formData.description !== selectedPart.description ||
      formData.function !== (selectedPart.function || '') ||
      formData.category !== (selectedPart.category || '') ||
      formData.measurement !== (selectedPart.measurement || '') ||
      formData.price !== selectedPart.price.toString() ||
      formData.location !== (selectedPart.location || '')
    )
  )
  const canSubmit = isFormValid && hasChanges
  
  const filteredParts = useMemo(() => {
    let result = spareParts
    
    if (search) {
      const searchLower = search.toLowerCase()
      const searchNormalized = normalizePartNumber(search).toLowerCase()
      result = result.filter(
        (p) =>
          normalizePartNumber(p.partNumber).toLowerCase().includes(searchNormalized) ||
          normalizePartNumber(p.internalCode).toLowerCase().includes(searchNormalized) ||
          p.description.toLowerCase().includes(searchLower) ||
          (p.function?.toLowerCase().includes(searchLower) || false)
      )
    }
    
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter)
    }
    
    return result
  }, [spareParts, search, categoryFilter])
  
  // Pagination
  const totalPages = Math.ceil(filteredParts.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedParts = filteredParts.slice(startIndex, endIndex)
  
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }
  
  const openCreate = () => {
    setFormData({
      internalCode: '',
      partNumber: '',
      model: '',
      equipment: '',
      description: '',
      function: '',
      category: '',
      measurement: '',
      price: '',
      location: '',
      locations: [],
      suppliers: [],
      assignedContacts: [],
    })
    setModalMode('create')
  }
  const openEdit = (part: SparePart) => {
    setSelectedPart(part)
    setFormData({
      internalCode: part.internalCode || '',
      partNumber: part.partNumber,
      model: part.model || '',
      equipment: part.equipment || '',
      description: part.description,
      function: part.function || '',
      category: part.category || '',
      measurement: part.measurement || '',
      price: part.price.toString(),
      location: part.location || '',
      locations: part.location ? [part.location] : [],
      suppliers: [],
      assignedContacts: [],
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
      function: formData.function,
      category: formData.category,
      measurement: formData.measurement,
      price: parseFloat(formData.price) || 0,
      location: formData.location,
    }
    
    if (modalMode === 'create') {
      addSparePart(partData)
    } else if (modalMode === 'edit' && selectedPart) {
      updateSparePart(selectedPart.id, partData)
    }
    closeModal()
    setCurrentPage(1)
  }
  
  const handleDelete = (e: React.MouseEvent, part: SparePart) => {
    e.stopPropagation()
    setDeleteConfirm(part)
  }
  
  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteSparePart(deleteConfirm.id)
      setDeleteConfirm(null)
      if (paginatedParts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Repuestos</h2>
          <p className="text-sm text-muted-foreground">{filteredParts.length} repuestos</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-4 w-4" />
          Nuevo Repuesto
        </Button>
      </div>
      
      {/* Search and Filters */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por numero de parte, codigo interno, descripcion o funcion..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="category-filter" className="text-sm text-muted-foreground mb-2 block">Categoría (Todos)</Label>
                <select
                  id="category-filter"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Todas las categorías</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Table */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground">Catalogo de Repuestos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">ITEM</TableHead>
                  <TableHead>CÓDIGO INTERNO</TableHead>
                  <TableHead>NÚMERO DE PARTE</TableHead>
                  <TableHead>MODELO</TableHead>
                  <TableHead>EQUIPO</TableHead>
                  <TableHead>DESCRIPCIÓN</TableHead>
                  <TableHead>FUNCIÓN</TableHead>
                  <TableHead>MEDIDA</TableHead>
                  <TableHead className="text-right">PRECIO</TableHead>
                  <TableHead className="text-right">CANTIDAD</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedParts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                      No se encontraron repuestos
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedParts.map((part, index) => {
                    return (
                      <TableRow 
                        key={part.id} 
                        className="table-row-hover cursor-pointer"
                        onMouseEnter={() => setHoveredRow(part.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        onClick={() => openDetail(part)}
                      >
                        <TableCell className="text-center font-mono text-sm text-muted-foreground">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{part.internalCode}</TableCell>
                        <TableCell className="font-mono text-sm font-medium text-primary">{part.partNumber}</TableCell>
                        <TableCell className="text-sm">{part.model || '-'}</TableCell>
                        <TableCell className="text-sm">{part.equipment || '-'}</TableCell>
                        <TableCell className="max-w-40 truncate text-sm">{part.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{part.function || '-'}</TableCell>
                        <TableCell className="text-sm">{part.measurement || '-'}</TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          ${part.price.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-mono text-sm font-bold ${getStockColor(part.quantity)}`}>
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
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(e, part)
                              }}
                              className="h-8 px-2 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
              <div className="text-sm text-muted-foreground">
                {`Mostrando ${filteredParts.length === 0 ? 0 : startIndex + 1} a ${Math.min(endIndex, filteredParts.length)} de ${filteredParts.length} registros`}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1 ||
                      (page === 2 && currentPage === 1) ||
                      (page === totalPages - 1 && currentPage === totalPages)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={cn(
                            'h-8 w-8 p-0 text-xs',
                            page === currentPage && 'bg-foreground text-background'
                          )}
                        >
                          {page}
                        </Button>
                      )
                    } else if (
                      (page === 2 && currentPage > 3) ||
                      (page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <span key={page} className="text-xs text-muted-foreground">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Detail Modal */}
      <Dialog open={modalMode === 'detail'} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-2xl border-0 shadow-lg p-0 overflow-hidden">
          {/* Blue top border accent */}
          <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
          
          <div className="p-6 space-y-6">
            {/* Header with close button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Detalle de Repuesto</h1>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {selectedPart && (
              <div className="space-y-6">
                {/* Part Number and Description */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Numero de Parte</p>
                      <p className="text-lg font-semibold text-foreground font-mono">{selectedPart.partNumber}</p>
                    </div>
                    {selectedPart.quantity !== undefined && (
                      <div className="text-right">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock Almacen</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedPart.quantity}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedPart.description}</p>
                </div>
                
                {/* Internal Code and Category */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Codigo Interno</p>
                    <p className="text-sm font-medium text-foreground font-mono">{selectedPart.internalCode}</p>
                  </div>
                  {selectedPart.category && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Categoria</p>
                      <p className="text-sm font-medium text-foreground">{selectedPart.category}</p>
                    </div>
                  )}
                </div>
                
                {/* Model, Equipment, Measurement */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Modelo</p>
                    <p className="text-sm font-medium text-foreground">{selectedPart.model || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Equipo</p>
                    <p className="text-sm font-medium text-foreground">{selectedPart.equipment || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Medida</p>
                    <p className="text-sm font-medium text-foreground">{selectedPart.measurement || '-'}</p>
                  </div>
                </div>
                
                {/* Location and Price */}
                <div className="grid grid-cols-2 gap-6">
                  {selectedPart.location && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ubicación</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm text-foreground">{selectedPart.location}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Precio Unitario</p>
                    <p className="text-sm font-medium text-foreground">${selectedPart.price.toFixed(2)}</p>
                  </div>
                </div>
                
                {/* Function Card */}
                {selectedPart.function && (
                  <div className="rounded-lg border border-border bg-blue-50 p-4">
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">Función del Componente</p>
                    <p className="text-sm text-blue-800">{selectedPart.function}</p>
                  </div>
                )}
                
                {/* Edit Button */}
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button
                    className="bg-foreground text-background hover:bg-foreground/90 text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEdit(selectedPart)
                    }}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
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
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    {modalMode === 'create' ? 'Nuevo Repuesto' : 'Editar Repuesto'}
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
                  
                  {/* Numero de Parte */}
                  <div className="space-y-1.5">
                    <Label htmlFor="partNumber" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Numero de Parte
                    </Label>
                    <Input
                      id="partNumber"
                      value={formData.partNumber}
                      onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                      placeholder="3128 3140 12"
                      required
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Codigo Interno and Categoria */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="internalCode" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Codigo Interno
                      </Label>
                      <Input
                        id="internalCode"
                        value={formData.internalCode}
                        onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                        placeholder="20170072465"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="category" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Categoria
                      </Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Seleccionar</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Descripcion */}
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Descripcion
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-input rounded-md bg-background">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Descripcion del repuesto"
                          required
                          className="text-sm border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                      <button
                        type="button"
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => setFormData({ ...formData, description: '' })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    onClick={() => {/* Add more description logic */}}
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ AGREGAR</span>
                  </button>
                </div>
                
                {/* Column 2: ESPECIFICACIONES */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full" />
                    <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Especificaciones
                    </h3>
                  </div>
                  
                  {/* Modelo */}
                  <div className="space-y-1.5">
                    <Label htmlFor="model" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Modelo
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="modelo@equipo.pe"
                        className="text-sm flex-1"
                      />
                      <button
                        type="button"
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => setFormData({ ...formData, model: '' })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Equipo */}
                  <div className="space-y-1.5">
                    <Label htmlFor="equipment" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Equipo
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="equipment"
                        value={formData.equipment}
                        onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                        placeholder="equipo@maquinaria.pe"
                        className="text-sm flex-1"
                      />
                      <button
                        type="button"
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => setFormData({ ...formData, equipment: '' })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    onClick={() => {/* Add more specs logic */}}
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ AGREGAR</span>
                  </button>
                  
                  {/* Medida y Precio */}
                  <div className="space-y-1.5 pt-2">
                    <Label htmlFor="measurement" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Medida / Precio
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="measurement"
                        value={formData.measurement}
                        onChange={(e) => setFormData({ ...formData, measurement: e.target.value })}
                        placeholder="Medida"
                        className="text-sm flex-1"
                      />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="$0.00"
                        className="text-sm w-24"
                      />
                      <button
                        type="button"
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => setFormData({ ...formData, measurement: '', price: '' })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    onClick={() => {/* Add more measurement/price logic */}}
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ AGREGAR</span>
                  </button>
                </div>
                
                {/* Column 3: UBICACION / FUNCION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full" />
                    <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Ubicacion y Funcion
                    </h3>
                  </div>
                  
                  {/* Location items */}
                  <div className="space-y-2">
                    {(formData.locations.length > 0 ? formData.locations : [formData.location || '']).filter(Boolean).map((loc, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background"
                      >
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 text-blue-600 text-xs font-semibold flex-shrink-0">
                          {loc.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{loc}</p>
                          <p className="text-xs text-muted-foreground uppercase">Almacen</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newLocations = formData.locations.filter((_, i) => i !== index)
                            setFormData({ ...formData, locations: newLocations, location: newLocations[0] || '' })
                          }}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Empty state or add new location */}
                    {formData.locations.length === 0 && !formData.location && (
                      <div className="space-y-1.5">
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Ubicacion en almacen"
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2 border border-dashed border-border rounded-lg"
                    onClick={() => {
                      const newLoc = prompt('Ingrese nueva ubicacion:')
                      if (newLoc) {
                        const currentLocations = formData.locations.length > 0 ? formData.locations : (formData.location ? [formData.location] : [])
                        setFormData({ ...formData, locations: [...currentLocations, newLoc], location: currentLocations[0] || newLoc })
                      }
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>AGREGAR UBICACION</span>
                  </button>
                  
                  {/* Funcion */}
                  <div className="space-y-1.5 pt-2">
                    <Label htmlFor="function" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Funcion del Componente
                    </Label>
                    <Input
                      id="function"
                      value={formData.function}
                      onChange={(e) => setFormData({ ...formData, function: e.target.value })}
                      placeholder="Funcion del repuesto"
                      className="text-sm"
                    />
                  </div>
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
      
      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <div className="h-1 bg-gradient-to-r from-red-600 to-red-400" />
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Eliminar Repuesto</h2>
            <p className="text-sm text-muted-foreground">
              Estas seguro que deseas eliminar <span className="font-semibold text-foreground">{deleteConfirm?.partNumber}</span>? Esta accion no se puede deshacer.
            </p>
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" className="flex-1" onClick={confirmDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
