'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Minus, Pencil, X } from 'lucide-react'
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

type ModalMode = 'detail' | 'adjust' | null

const MINIMUM_STOCK = 10

function getStockStatus(current: number, minimum: number) {
  if (current === 0) return 'critical'
  if (current < minimum) return 'warning'
  if (current < minimum * 1.5) return 'approaching'
  return 'good'
}

function getStockStatusColor(status: string) {
  switch (status) {
    case 'critical': return 'bg-status-inactive'
    case 'warning': return 'bg-status-warning'
    case 'approaching': return 'bg-amber-400'
    case 'good': return 'bg-status-active'
    default: return 'bg-muted'
  }
}

function getStockStatusText(status: string) {
  switch (status) {
    case 'critical': return 'Critical'
    case 'warning': return 'Low Stock'
    case 'approaching': return 'Approaching Minimum'
    case 'good': return 'Good'
    default: return 'Unknown'
  }
}

export function Inventory() {
  const { spareParts, addStock, removeStock, adjustStock, getMovementsForPart } = useDashboardStore()
  const [search, setSearch] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [quantity, setQuantity] = useState('')
  const [adjustNote, setAdjustNote] = useState('')
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [addRemoveMode, setAddRemoveMode] = useState<'add' | 'remove' | null>(null)
  const [addRemoveQty, setAddRemoveQty] = useState('')
  
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
  
  const openDetail = (part: SparePart) => {
    setSelectedPart(part)
    setMovements(getMovementsForPart(part.id))
    setModalMode('detail')
    setAddRemoveMode(null)
    setAddRemoveQty('')
  }
  
  const openAdjust = (e: React.MouseEvent, part: SparePart) => {
    e.stopPropagation()
    setSelectedPart(part)
    setQuantity(part.quantity.toString())
    setAdjustNote('')
    setModalMode('adjust')
  }
  
  const closeModal = () => {
    setModalMode(null)
    setSelectedPart(null)
    setQuantity('')
    setAdjustNote('')
    setMovements([])
    setAddRemoveMode(null)
    setAddRemoveQty('')
  }
  
  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPart) return
    
    const qty = parseInt(quantity)
    if (isNaN(qty) || qty < 0) return
    
    adjustStock(selectedPart.id, qty, adjustNote || undefined)
    closeModal()
  }
  
  const handleAddStock = () => {
    if (!selectedPart) return
    const qty = parseInt(addRemoveQty)
    if (isNaN(qty) || qty <= 0) return
    
    addStock(selectedPart.id, qty)
    // Refresh movements and reset
    setMovements(getMovementsForPart(selectedPart.id))
    setSelectedPart({ ...selectedPart, quantity: selectedPart.quantity + qty })
    setAddRemoveMode(null)
    setAddRemoveQty('')
  }
  
  const handleRemoveStock = () => {
    if (!selectedPart) return
    const qty = parseInt(addRemoveQty)
    if (isNaN(qty) || qty <= 0 || qty > selectedPart.quantity) return
    
    removeStock(selectedPart.id, qty)
    // Refresh movements and reset
    setMovements(getMovementsForPart(selectedPart.id))
    setSelectedPart({ ...selectedPart, quantity: selectedPart.quantity - qty })
    setAddRemoveMode(null)
    setAddRemoveQty('')
  }
  
  const formatMovement = (movement: StockMovement) => {
    if (movement.type === 'add') {
      return `+${movement.quantity}`
    } else if (movement.type === 'remove') {
      return `-${movement.quantity}`
    } else {
      return `→${movement.newStock}`
    }
  }
  
  const getMovementLabel = (movement: StockMovement) => {
    if (movement.note) return movement.note
    if (movement.type === 'add') return 'manual'
    if (movement.type === 'remove') return movement.partNumber
    return 'adjustment'
  }
  
  const getMovementColor = (type: StockMovement['type']) => {
    switch (type) {
      case 'add': return 'text-status-active'
      case 'remove': return 'text-status-inactive'
      case 'adjust': return 'text-status-warning'
    }
  }
  
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
          <CardTitle className="text-lg text-card-foreground">Stock Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Item</TableHead>
                <TableHead>Internal Code</TableHead>
                <TableHead>Part Number</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredParts.map((part, index) => {
                  const status = getStockStatus(part.quantity, MINIMUM_STOCK)
                  return (
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
                      <TableCell className="font-mono text-sm font-medium text-primary">
                        {part.partNumber}
                      </TableCell>
                      <TableCell className="max-w-64 truncate">{part.description}</TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          'font-mono font-medium',
                          status === 'critical' || status === 'warning' ? 'text-status-warning' : 'text-card-foreground'
                        )}>
                          {part.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div 
                          className="flex justify-end"
                          style={{
                            opacity: hoveredRow === part.id ? 1 : 0,
                            transition: 'opacity 0.15s ease'
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => openAdjust(e, part)}
                            className="h-7 w-7"
                          >
                            <Pencil className="h-3.5 w-3.5" />
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
              {/* Header Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-muted-foreground">
                        Item {filteredParts.findIndex(p => p.id === selectedPart.id) + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg font-semibold text-primary">
                        {selectedPart.partNumber}
                      </span>
                      <span className="font-mono text-sm text-muted-foreground">
                        {selectedPart.internalCode}
                      </span>
                    </div>
                    <p className="text-sm text-card-foreground mt-1">{selectedPart.description}</p>
                  </div>
                </div>
                
                {/* Stock Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-muted/50 px-3 py-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Current Stock</p>
                    <p className="font-mono text-xl font-bold text-primary">
                      {selectedPart.quantity}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 px-3 py-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Minimum Stock</p>
                    <p className="font-mono text-xl font-bold text-muted-foreground">
                      {MINIMUM_STOCK}
                    </p>
                  </div>
                </div>
                
                {/* Status Indicator */}
                {(() => {
                  const status = getStockStatus(selectedPart.quantity, MINIMUM_STOCK)
                  return (
                    <div className="flex items-center gap-2">
                      <div className={cn('h-2.5 w-2.5 rounded-full', getStockStatusColor(status))} />
                      <span className="text-sm text-card-foreground">{getStockStatusText(status)}</span>
                    </div>
                  )
                })()}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => {
                    setAddRemoveMode('add')
                    setAddRemoveQty('')
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Stock
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => {
                    setAddRemoveMode('remove')
                    setAddRemoveQty('')
                  }}
                  disabled={selectedPart.quantity === 0}
                >
                  <Minus className="h-4 w-4" />
                  Remove Stock
                </Button>
              </div>
              
              {/* Add/Remove Form */}
              {addRemoveMode && (
                <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max={addRemoveMode === 'remove' ? selectedPart.quantity : undefined}
                      value={addRemoveQty}
                      onChange={(e) => setAddRemoveQty(e.target.value)}
                      placeholder={`Quantity to ${addRemoveMode}...`}
                      className="flex-1 h-8"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={addRemoveMode === 'add' ? handleAddStock : handleRemoveStock}
                      disabled={!addRemoveQty || parseInt(addRemoveQty) <= 0}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        setAddRemoveMode(null)
                        setAddRemoveQty('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Movement History */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-card-foreground">Movement History</h4>
                {movements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No movements recorded</p>
                ) : (
                  <div className="max-h-32 space-y-1.5 overflow-y-auto">
                    {movements.slice(0, 10).map((movement) => (
                      <div
                        key={movement.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className={cn(
                          'font-mono font-semibold w-12',
                          getMovementColor(movement.type)
                        )}>
                          {formatMovement(movement)}
                        </span>
                        <span className="text-muted-foreground">
                          {getMovementLabel(movement)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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
          <form onSubmit={handleAdjustSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="adjust-quantity">New Stock Total</Label>
                <Input
                  id="adjust-quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter new total..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adjust-note">Note (optional)</Label>
                <Input
                  id="adjust-note"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Reason for adjustment..."
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
              <Button type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
