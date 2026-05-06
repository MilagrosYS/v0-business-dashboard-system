'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Minus, X } from 'lucide-react'
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
import { useDashboardStore } from '@/lib/store'
import { SparePart, StockMovement } from '@/lib/types'
import { cn } from '@/lib/utils'

type ModalMode = 'detail' | null

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
  const { spareParts, addStock, removeStock, getMovementsForPart } = useDashboardStore()
  const [search, setSearch] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
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
  

  
  const closeModal = () => {
    setModalMode(null)
    setSelectedPart(null)
    setMovements([])
    setAddRemoveMode(null)
    setAddRemoveQty('')
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
    if (movement.type === 'add') {
      return movement.note || 'Added to stock'
    } else if (movement.type === 'remove') {
      if (movement.note) {
        return `"${movement.note}"`
      }
      return 'manual'
    } else {
      return movement.note || 'Adjustment'
    }
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
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-lg font-semibold text-primary">
                      {selectedPart.partNumber}
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {selectedPart.internalCode}
                    </span>
                  </div>
                  <p className="text-sm text-card-foreground">{selectedPart.description}</p>
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
                  <div className="max-h-40 space-y-1.5 overflow-y-auto">
                    {movements.map((movement) => (
                      <div
                        key={movement.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className={cn(
                          'font-mono font-semibold',
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
    </div>
  )
}
