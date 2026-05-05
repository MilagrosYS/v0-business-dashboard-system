'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Minus, RefreshCw, Eye, AlertTriangle } from 'lucide-react'
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
import { SparePart, StockMovement } from '@/lib/types'
import { cn } from '@/lib/utils'

type ModalMode = 'add' | 'remove' | 'adjust' | 'view' | null

export function Inventory() {
  const { spareParts, addStock, removeStock, adjustStock, getMovementsForPart } = useDashboardStore()
  const [search, setSearch] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null)
  const [quantity, setQuantity] = useState('')
  const [adjustNote, setAdjustNote] = useState('')
  const [movements, setMovements] = useState<StockMovement[]>([])
  
  const filteredParts = useMemo(() => {
    if (!search) return spareParts
    const searchLower = search.toLowerCase()
    return spareParts.filter(
      (p) =>
        p.partNumber.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
    )
  }, [spareParts, search])
  
  const openModal = (mode: ModalMode, part: SparePart) => {
    setSelectedPart(part)
    setModalMode(mode)
    setQuantity('')
    setAdjustNote('')
    
    if (mode === 'view') {
      setMovements(getMovementsForPart(part.id))
    }
  }
  
  const closeModal = () => {
    setModalMode(null)
    setSelectedPart(null)
    setQuantity('')
    setAdjustNote('')
    setMovements([])
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPart) return
    
    const qty = parseInt(quantity)
    if (isNaN(qty) || qty <= 0) return
    
    if (modalMode === 'add') {
      addStock(selectedPart.id, qty)
    } else if (modalMode === 'remove') {
      if (qty > selectedPart.quantity) return
      removeStock(selectedPart.id, qty)
    } else if (modalMode === 'adjust') {
      adjustStock(selectedPart.id, qty, adjustNote || undefined)
    }
    
    closeModal()
  }
  
  const formatMovement = (movement: StockMovement) => {
    if (movement.type === 'add') {
      return `+${movement.quantity}`
    } else if (movement.type === 'remove') {
      return `-${movement.quantity}`
    } else {
      return `→ ${movement.newStock}`
    }
  }
  
  const getMovementColor = (type: StockMovement['type']) => {
    switch (type) {
      case 'add': return 'text-status-active'
      case 'remove': return 'text-status-inactive'
      case 'adjust': return 'text-status-warning'
    }
  }
  
  const MINIMUM_STOCK = 10
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Inventory Control</h2>
        <p className="text-muted-foreground">Manage stock levels and movements</p>
      </div>
      
      {/* Search */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by part number or description..."
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
          <CardTitle className="text-lg text-card-foreground">Stock Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Number</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Minimum Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredParts.map((part) => {
                  const isLowStock = part.quantity < MINIMUM_STOCK
                  return (
                    <TableRow key={part.id} className="table-row-hover">
                      <TableCell className="font-mono text-sm font-medium text-primary">
                        {part.partNumber}
                      </TableCell>
                      <TableCell className="max-w-64 truncate">{part.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isLowStock && (
                            <AlertTriangle className="h-4 w-4 text-status-warning" />
                          )}
                          <span className={cn(
                            'font-mono font-medium',
                            isLowStock ? 'text-status-warning' : 'text-card-foreground'
                          )}>
                            {part.quantity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {MINIMUM_STOCK}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('add', part)}
                            className="h-8 gap-1 text-xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('remove', part)}
                            className="h-8 gap-1 text-xs"
                            disabled={part.quantity === 0}
                          >
                            <Minus className="h-3.5 w-3.5" />
                            Remove
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('adjust', part)}
                            className="h-8 gap-1 text-xs"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Adjust
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal('view', part)}
                            className="h-8 gap-1 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </Button>
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
      
      {/* Add Stock Modal */}
      <Dialog open={modalMode === 'add'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
            <DialogDescription>
              Add quantity to {selectedPart?.partNumber}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="add-quantity">Quantity to Add</Label>
                <Input
                  id="add-quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Current stock: <span className="font-mono font-medium">{selectedPart?.quantity}</span>
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Remove Stock Modal */}
      <Dialog open={modalMode === 'remove'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Stock</DialogTitle>
            <DialogDescription>
              Remove quantity from {selectedPart?.partNumber}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="remove-quantity">Quantity to Remove</Label>
                <Input
                  id="remove-quantity"
                  type="number"
                  min="1"
                  max={selectedPart?.quantity || 0}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Available: <span className="font-mono font-medium">{selectedPart?.quantity}</span>
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" className="gap-2">
                <Minus className="h-4 w-4" />
                Remove Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Adjust Stock Modal */}
      <Dialog open={modalMode === 'adjust'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Set new total stock for {selectedPart?.partNumber}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="adjust-quantity">New Stock Total</Label>
                <Input
                  id="adjust-quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter new total"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adjust-note">Note (optional)</Label>
                <Input
                  id="adjust-note"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Reason for adjustment"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Current stock: <span className="font-mono font-medium">{selectedPart?.quantity}</span>
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Adjust Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View Details Modal */}
      <Dialog open={modalMode === 'view'} onOpenChange={closeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Stock Details</DialogTitle>
          </DialogHeader>
          {selectedPart && (
            <div className="space-y-4 py-4">
              {/* Part Info */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-lg font-semibold text-primary">
                    {selectedPart.partNumber}
                  </span>
                  <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-lg font-bold text-primary">
                    {selectedPart.quantity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedPart.description}</p>
              </div>
              
              {/* Movement History */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-card-foreground">Movement History</h4>
                {movements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No movements recorded</p>
                ) : (
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {movements.map((movement) => (
                      <div
                        key={movement.id}
                        className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            'font-mono text-sm font-semibold',
                            getMovementColor(movement.type)
                          )}>
                            {formatMovement(movement)}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {movement.partNumber}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {movement.createdAt.toLocaleDateString()}
                          </p>
                          {movement.note && (
                            <p className="text-xs text-muted-foreground">{movement.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
