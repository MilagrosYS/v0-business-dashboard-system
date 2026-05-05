export interface Company {
  id: string
  name: string
  ruc: string
  contact: string
  phone: string
  email: string
  lastActivity: Date
  createdAt: Date
}

export interface SparePart {
  id: string
  internalCode: string
  partNumber: string
  model: string
  equipment: string
  description: string
  measurement: string
  price: number
  quantity: number
}

export interface StockMovement {
  id: string
  partId: string
  partNumber: string
  type: 'add' | 'remove' | 'adjust'
  quantity: number
  previousStock: number
  newStock: number
  note?: string
  createdAt: Date
}

export interface InventoryItem {
  partId: string
  partNumber: string
  description: string
  currentStock: number
  minimumStock: number
}

export type ActivityStatus = 'active' | 'warning' | 'inactive'

export function getActivityStatus(lastActivity: Date): ActivityStatus {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 30) return 'active'
  if (diffDays <= 90) return 'warning'
  return 'inactive'
}
