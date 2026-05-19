export interface Company {
  id: string
  name: string
  ruc: string
  address: string
  contact: string
  phone: string
  email: string
  lastActivity: Date
  createdAt: Date
  status: 'active' | 'inactive'
}

export interface SparePart {
  id: string
  internalCode: string
  partNumber: string
  model: string
  equipment: string
  description: string
  function?: string
  category?: string
  measurement: string
  price: number
  quantity: number
  location?: string
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

// Normalize part number by removing spaces for comparison
// Allows matching "3128 3140 12" with "3128314012"
export function normalizePartNumber(partNumber: string): string {
  return partNumber.replace(/\s+/g, '')
}

// Quotation types
export interface QuotationItem {
  id: string
  internalCode: string
  partNumber: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  partId?: string // Link to spare part if exists
}

export interface Quotation {
  id: string
  quotationNumber: string
  date: Date
  seller: string
  currency: string
  validity: number // days
  companyId: string
  companyName: string
  companyRuc: string
  items: QuotationItem[]
  subtotal: number
  igv: number
  total: number
  createdAt: Date
  updatedAt: Date
}

// Settings types
export interface BusinessInfo {
  companyName: string
  ruc: string
  addressArequipa: string
  addressLima: string
  email: string
  phone: string
  logo: string // base64 or URL
}

export interface BankAccount {
  bankName: string
  accountNumber: string
  cci?: string
}

export interface SystemSettings {
  igvPercentage: number
  currency: string
  exchangeRate: number // PEN per USD
  sellerName: string
  businessInfo: BusinessInfo
  bankAccounts: BankAccount[]
}

export interface UserProfile {
  name: string
  username: string
  profileImage: string
}
