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
  // Multiple data arrays
  emails?: string[]
  phones?: string[]
  addresses?: string[]
  assignedContacts?: { name: string; role: string }[]
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

// Status labels for UI display
export const statusLabels: Record<ActivityStatus, string> = {
  active: 'Activo',
  warning: 'Inactivo reciente',
  inactive: 'Sin actividad',
}

// Calculate status based on last quotation date
// GREEN (active): Has quotation in last 3 months
// ORANGE (warning): No quotation in last 3 months, but has one in last 5 months
// RED (inactive): No quotation in more than 5 months
export function getActivityStatus(lastQuotationDate: Date | null): ActivityStatus {
  if (!lastQuotationDate) return 'inactive'
  
  const now = new Date()
  const diffMonths = (now.getTime() - lastQuotationDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  
  if (diffMonths <= 3) return 'active'
  if (diffMonths <= 5) return 'warning'
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
