import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Company, SparePart, StockMovement, InventoryItem, Quotation, SystemSettings, UserProfile } from './types'

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15)

// Sample data
const sampleCompanies: Company[] = [
  {
    id: generateId(),
    name: 'Construcciones ABC S.A.',
    ruc: '20123456789',
    address: 'Av. Industrial 1234, Lima',
    contact: 'Juan Perez',
    phone: '+51 999 888 777',
    email: 'contacto@abc.com',
    lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    name: 'Minera del Norte',
    ruc: '20987654321',
    address: 'Carretera Panamericana Norte Km 45, Trujillo',
    contact: 'Maria Garcia',
    phone: '+51 888 777 666',
    email: 'compras@mineranorte.com',
    lastActivity: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    name: 'Transportes Rapidos',
    ruc: '20111222333',
    address: 'Jr. Los Transportistas 567, Callao',
    contact: 'Carlos Lopez',
    phone: '+51 777 666 555',
    email: 'info@transportesrapidos.pe',
    lastActivity: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
    createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000),
  },
]

const sampleParts: SparePart[] = [
  {
    id: generateId(),
    internalCode: 'INT-001',
    partNumber: 'COT-001',
    model: 'CAT 320D',
    equipment: 'Excavadora',
    description: 'Filtro de aceite hidraulico',
    measurement: 'Unidad',
    price: 85.50,
    quantity: 25,
  },
  {
    id: generateId(),
    internalCode: 'INT-002',
    partNumber: 'BRK-045',
    model: 'Volvo A40',
    equipment: 'Camion Articulado',
    description: 'Pastillas de freno delanteras',
    measurement: 'Juego',
    price: 320.00,
    quantity: 12,
  },
  {
    id: generateId(),
    internalCode: 'INT-003',
    partNumber: 'ENG-112',
    model: 'Komatsu PC200',
    equipment: 'Excavadora',
    description: 'Correa de alternador',
    measurement: 'Unidad',
    price: 45.00,
    quantity: 8,
  },
  {
    id: generateId(),
    internalCode: 'INT-004',
    partNumber: 'HYD-088',
    model: 'CAT 966H',
    equipment: 'Cargador Frontal',
    description: 'Manguera hidraulica 1/2"',
    measurement: 'Metro',
    price: 28.50,
    quantity: 150,
  },
]

const sampleMovements: StockMovement[] = [
  {
    id: generateId(),
    partId: sampleParts[0].id,
    partNumber: 'COT-001',
    type: 'add',
    quantity: 10,
    previousStock: 15,
    newStock: 25,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    partId: sampleParts[0].id,
    partNumber: 'COT-001',
    type: 'remove',
    quantity: 2,
    previousStock: 17,
    newStock: 15,
    note: 'Venta a Minera del Norte',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    partId: sampleParts[1].id,
    partNumber: 'BRK-045',
    type: 'adjust',
    quantity: 12,
    previousStock: 10,
    newStock: 12,
    note: 'Ajuste por inventario',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

interface DashboardStore {
  // Companies
  companies: Company[]
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'lastActivity'>) => void
  updateCompany: (id: string, company: Partial<Company>) => void
  deleteCompany: (id: string) => void
  
  // Spare Parts
  spareParts: SparePart[]
  addSparePart: (part: Omit<SparePart, 'id' | 'quantity'>) => void
  updateSparePart: (id: string, part: Partial<SparePart>) => void
  deleteSparePart: (id: string) => void
  
  // Inventory
  stockMovements: StockMovement[]
  addStock: (partId: string, quantity: number) => void
  removeStock: (partId: string, quantity: number) => void
  adjustStock: (partId: string, newTotal: number, note?: string) => void
  getInventoryItems: () => InventoryItem[]
  getMovementsForPart: (partId: string) => StockMovement[]
  
  // Quotations
  quotations: Quotation[]
  quotationCounter: number
  addQuotation: (quotation: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt' | 'updatedAt'>) => Quotation
  updateQuotation: (id: string, quotation: Partial<Quotation>) => void
  deleteQuotation: (id: string) => void
  getNextQuotationNumber: () => string
  getQuotationsByCompany: (companyId: string) => Quotation[]
  duplicateQuotation: (id: string) => Quotation | null
  
  // Auth & Settings
  isAuthenticated: boolean
  userProfile: UserProfile
  systemSettings: SystemSettings
  login: (username: string, password: string) => boolean
  logout: () => void
  updateProfile: (profile: Partial<UserProfile>) => void
  updatePassword: (currentPassword: string, newPassword: string) => boolean
  updateSettings: (settings: Partial<SystemSettings>) => void
}

// Default credentials
const DEFAULT_USERNAME = 'admin'
const DEFAULT_PASSWORD = 'admin123'

// Store password in memory (in real app, this would be hashed and in a database)
let currentPassword = DEFAULT_PASSWORD

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  companies: sampleCompanies,
  spareParts: sampleParts,
  stockMovements: sampleMovements,
  quotations: [],
  quotationCounter: 0,
  isAuthenticated: false,
  userProfile: {
    name: 'VyR Team',
    username: 'admin',
    profileImage: '',
  },
  systemSettings: {
    igvPercentage: 18,
    currency: '$',
    sellerName: 'Luis Villavicencio',
  },
  
  // Company methods
  addCompany: (company) => set((state) => ({
    companies: [...state.companies, {
      ...company,
      id: generateId(),
      createdAt: new Date(),
      lastActivity: new Date(),
    }]
  })),
  
  updateCompany: (id, company) => set((state) => ({
    companies: state.companies.map((c) => 
      c.id === id ? { ...c, ...company } : c
    )
  })),
  
  deleteCompany: (id) => set((state) => ({
    companies: state.companies.filter((c) => c.id !== id)
  })),
  
  // Spare Part methods
  addSparePart: (part) => set((state) => ({
    spareParts: [...state.spareParts, {
      ...part,
      id: generateId(),
      quantity: 0,
    }]
  })),
  
  updateSparePart: (id, part) => set((state) => ({
    spareParts: state.spareParts.map((p) => 
      p.id === id ? { ...p, ...part } : p
    )
  })),
  
  deleteSparePart: (id) => set((state) => ({
    spareParts: state.spareParts.filter((p) => p.id !== id),
    stockMovements: state.stockMovements.filter((m) => m.partId !== id),
  })),
  
  // Inventory methods
  addStock: (partId, quantity) => {
    const part = get().spareParts.find(p => p.id === partId)
    if (!part) return
    
    const previousStock = part.quantity
    const newStock = previousStock + quantity
    
    set((state) => ({
      spareParts: state.spareParts.map((p) =>
        p.id === partId ? { ...p, quantity: newStock } : p
      ),
      stockMovements: [...state.stockMovements, {
        id: generateId(),
        partId,
        partNumber: part.partNumber,
        type: 'add',
        quantity,
        previousStock,
        newStock,
        createdAt: new Date(),
      }]
    }))
  },
  
  removeStock: (partId, quantity) => {
    const part = get().spareParts.find(p => p.id === partId)
    if (!part || part.quantity < quantity) return
    
    const previousStock = part.quantity
    const newStock = previousStock - quantity
    
    set((state) => ({
      spareParts: state.spareParts.map((p) =>
        p.id === partId ? { ...p, quantity: newStock } : p
      ),
      stockMovements: [...state.stockMovements, {
        id: generateId(),
        partId,
        partNumber: part.partNumber,
        type: 'remove',
        quantity,
        previousStock,
        newStock,
        createdAt: new Date(),
      }]
    }))
  },
  
  adjustStock: (partId, newTotal, note) => {
    const part = get().spareParts.find(p => p.id === partId)
    if (!part) return
    
    const previousStock = part.quantity
    
    set((state) => ({
      spareParts: state.spareParts.map((p) =>
        p.id === partId ? { ...p, quantity: newTotal } : p
      ),
      stockMovements: [...state.stockMovements, {
        id: generateId(),
        partId,
        partNumber: part.partNumber,
        type: 'adjust',
        quantity: newTotal,
        previousStock,
        newStock: newTotal,
        note,
        createdAt: new Date(),
      }]
    }))
  },
  
  getInventoryItems: () => {
    return get().spareParts.map((part) => ({
      partId: part.id,
      partNumber: part.partNumber,
      description: part.description,
      currentStock: part.quantity,
      minimumStock: 10,
    }))
  },
  
  getMovementsForPart: (partId) => {
    return get().stockMovements
      .filter((m) => m.partId === partId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },
  
  // Quotation methods
  getNextQuotationNumber: () => {
    const year = new Date().getFullYear()
    const counter = get().quotationCounter + 1
    return `COT-${year}-${counter.toString().padStart(5, '0')}`
  },
  
  addQuotation: (quotation) => {
    const quotationNumber = get().getNextQuotationNumber()
    const newQuotation: Quotation = {
      ...quotation,
      id: generateId(),
      quotationNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    // Reduce stock for each item with a partId
    quotation.items.forEach(item => {
      if (item.partId) {
        get().removeStock(item.partId, item.quantity)
      }
    })
    
    // Update company's last activity
    get().updateCompany(quotation.companyId, { lastActivity: new Date() })
    
    set((state) => ({
      quotations: [...state.quotations, newQuotation],
      quotationCounter: state.quotationCounter + 1,
    }))
    
    return newQuotation
  },
  
  updateQuotation: (id, updates) => {
    const oldQuotation = get().quotations.find(q => q.id === id)
    if (!oldQuotation) return
    
    // If items changed, adjust stock differences
    if (updates.items) {
      // Restore old stock
      oldQuotation.items.forEach(item => {
        if (item.partId) {
          get().addStock(item.partId, item.quantity)
        }
      })
      
      // Deduct new stock
      updates.items.forEach(item => {
        if (item.partId) {
          get().removeStock(item.partId, item.quantity)
        }
      })
    }
    
    set((state) => ({
      quotations: state.quotations.map((q) =>
        q.id === id ? { ...q, ...updates, updatedAt: new Date() } : q
      )
    }))
  },
  
  deleteQuotation: (id) => {
    const quotation = get().quotations.find(q => q.id === id)
    if (!quotation) return
    
    // Restore stock
    quotation.items.forEach(item => {
      if (item.partId) {
        get().addStock(item.partId, item.quantity)
      }
    })
    
    set((state) => ({
      quotations: state.quotations.filter((q) => q.id !== id)
    }))
  },
  
  getQuotationsByCompany: (companyId) => {
    return get().quotations
      .filter((q) => q.companyId === companyId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },
  
  duplicateQuotation: (id) => {
    const original = get().quotations.find(q => q.id === id)
    if (!original) return null
    
    const newQuotation = get().addQuotation({
      date: new Date(),
      seller: original.seller,
      currency: original.currency,
      validity: original.validity,
      companyId: original.companyId,
      companyName: original.companyName,
      companyRuc: original.companyRuc,
      items: original.items.map(item => ({ ...item, id: generateId() })),
      subtotal: original.subtotal,
      igv: original.igv,
      total: original.total,
    })
    
    return newQuotation
  },
  
  // Auth methods
  login: (username, password) => {
    if (username === DEFAULT_USERNAME && password === currentPassword) {
      set({ isAuthenticated: true })
      return true
    }
    return false
  },
  
  logout: () => {
    set({ isAuthenticated: false })
  },
  
  updateProfile: (profile) => {
    set((state) => ({
      userProfile: { ...state.userProfile, ...profile }
    }))
  },
  
  updatePassword: (oldPassword, newPassword) => {
    if (oldPassword === currentPassword) {
      currentPassword = newPassword
      return true
    }
    return false
  },
  
  updateSettings: (settings) => {
    set((state) => ({
      systemSettings: { ...state.systemSettings, ...settings }
    }))
  },
}))
