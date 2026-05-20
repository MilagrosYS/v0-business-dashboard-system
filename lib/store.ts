import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Company, SparePart, StockMovement, InventoryItem, Quotation, QuotationItem, SystemSettings, UserProfile } from './types'
import { generateId } from './utils'

// Sample data with realistic codes and part numbers
const sampleCompanies: Company[] = [
  {
    id: generateId(),
    name: 'Minera Cerro Verde S.A.A.',
    ruc: '20170072465',
    address: 'Carretera Variante de Uchumayo Km 24, Arequipa',
    contact: 'Carlos Mendoza',
    phone: '+51 954 782 145',
    email: 'compras@cerroverde.pe',
    lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    status: 'active',
    emails: ['compras@cerroverde.pe', 'logistica@cerroverde.pe'],
    phones: ['+51 954 782 145', '+51 987 654 123'],
    addresses: ['Carretera Variante de Uchumayo Km 24, Arequipa'],
    assignedContacts: [
      { name: 'Carlos Mendoza', role: 'Gerente de Compras' },
      { name: 'Maria Garcia', role: 'Jefe de Logistica' },
    ],
  },
  {
    id: generateId(),
    name: 'Southern Peru Copper Corporation',
    ruc: '20100147514',
    address: 'Av. Caminos del Inca 171, Lima',
    contact: 'Ana Rodriguez',
    phone: '+51 987 654 321',
    email: 'adquisiciones@southernperu.com.pe',
    lastActivity: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    status: 'active',
    emails: ['adquisiciones@southernperu.com.pe'],
    phones: ['+51 987 654 321'],
    addresses: ['Av. Caminos del Inca 171, Lima'],
    assignedContacts: [
      { name: 'Ana Rodriguez', role: 'Coordinadora de Adquisiciones' },
    ],
  },
  {
    id: generateId(),
    name: 'Komatsu Mitsui Maquinarias Peru',
    ruc: '20508289672',
    address: 'Av. Argentina 4453, Callao',
    contact: 'Roberto Tanaka',
    phone: '+51 942 587 632',
    email: 'repuestos@kmmp.com.pe',
    lastActivity: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
  {
    id: generateId(),
    name: 'Ferreyros S.A.',
    ruc: '20100028698',
    address: 'Av. Industrial 675, Lima',
    contact: 'Luis Ferrero',
    phone: '+51 965 412 378',
    email: 'partes@ferreyros.com.pe',
    lastActivity: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
    status: 'inactive',
  },
  {
    id: generateId(),
    name: 'Volvo Peru S.A.',
    ruc: '20100083742',
    address: 'Av. Nicolas Arriola 500, La Victoria',
    contact: '',
    phone: '',
    email: 'ventas@volvo.pe',
    lastActivity: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
]

const sampleParts: SparePart[] = [
  {
    id: generateId(),
    internalCode: '3128 3140 12',
    partNumber: '3128314012',
    model: 'CAT 320D',
    equipment: 'Excavadora',
    description: 'Filtro de aceite hidraulico alta presion',
    function: 'Sistema Presión',
    category: 'Filtración',
    measurement: 'Unidad',
    price: 185.50,
    quantity: 25,
    location: 'Pasillo B-04',
  },
  {
    id: generateId(),
    internalCode: '4587 2190 08',
    partNumber: '458721908',
    model: 'CAT 966H',
    equipment: 'Cargador Frontal',
    description: 'Kit de sellos para cilindro de levante',
    function: 'Filtrado',
    category: 'Componentes',
    measurement: 'Kit',
    price: 420.00,
    quantity: 8,
    location: 'Rack 12',
  },
  {
    id: generateId(),
    internalCode: '7241 5632 15',
    partNumber: '724156321',
    model: 'Komatsu PC200-8',
    equipment: 'Excavadora',
    description: 'Bomba de inyeccion diesel',
    function: 'Carga',
    category: 'Rodillos',
    measurement: 'Unidad',
    price: 2850.00,
    quantity: 3,
    location: 'Almacén A',
  },
  {
    id: generateId(),
    internalCode: '1095 8742 33',
    partNumber: '109587423',
    model: 'Volvo A40F',
    equipment: 'Camion Articulado',
    description: 'Turbocompresor completo',
    function: 'Potencia Motor',
    category: 'Componentes',
    measurement: 'Unidad',
    price: 3200.00,
    quantity: 2,
    location: 'Pasillo A-01',
  },
  {
    id: generateId(),
    internalCode: '5632 1478 90',
    partNumber: '563214789',
    model: 'CAT D8T',
    equipment: 'Tractor de Cadenas',
    description: 'Zapata de cadena reforzada',
    function: 'Tracción',
    category: 'Rodillos',
    measurement: 'Unidad',
    price: 145.00,
    quantity: 48,
    location: 'Estantería C',
  },
  {
    id: generateId(),
    internalCode: '8901 2345 67',
    partNumber: '890123456',
    model: 'Komatsu WA470',
    equipment: 'Cargador Frontal',
    description: 'Radiador de agua completo',
    function: 'Refrigeración',
    category: 'Accesorios',
    measurement: 'Unidad',
    price: 1850.00,
    quantity: 4,
    location: 'Zona Refrigeración',
  },
  {
    id: generateId(),
    internalCode: '2468 1357 24',
    partNumber: '246813572',
    model: 'CAT 777F',
    equipment: 'Camion Minero',
    description: 'Disco de freno trasero',
    function: 'Frenado',
    category: 'Componentes',
    measurement: 'Unidad',
    price: 890.00,
    quantity: 12,
    location: 'Pasillo D-02',
  },
  {
    id: generateId(),
    internalCode: '6543 2109 87',
    partNumber: '654321098',
    model: 'Volvo EC480D',
    equipment: 'Excavadora',
    description: 'Manguera hidraulica de retorno 1-1/4"',
    function: 'Sistema Hidráulico',
    category: 'Tuberías',
    measurement: 'Metro',
    price: 78.50,
    quantity: 150,
    location: 'Rack 5-6',
  },
  {
    id: generateId(),
    internalCode: '9876 5432 10',
    partNumber: '987654321',
    model: 'CAT 390F',
    equipment: 'Excavadora',
    description: 'Motor de giro planetary',
    function: 'Rotación',
    category: 'Componentes',
    measurement: 'Unidad',
    price: 8500.00,
    quantity: 1,
    location: 'Almacén Principal',
  },
  {
    id: generateId(),
    internalCode: '1234 5678 90',
    partNumber: '123456789',
    model: 'Komatsu HD785',
    equipment: 'Camion Minero',
    description: 'Alternador 24V 150A',
    function: 'Carga Batería',
    category: 'Accesorios',
    measurement: 'Unidad',
    price: 1250.00,
    quantity: 6,
    location: 'Pasillo E-03',
  },
]

const sampleMovements: StockMovement[] = [
  {
    id: generateId(),
    partId: sampleParts[0].id,
    partNumber: '3128314012',
    type: 'add',
    quantity: 10,
    previousStock: 15,
    newStock: 25,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    partId: sampleParts[0].id,
    partNumber: '3128314012',
    type: 'remove',
    quantity: 5,
    previousStock: 30,
    newStock: 25,
    note: 'Venta a Minera Cerro Verde',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    partId: sampleParts[1].id,
    partNumber: '458721908',
    type: 'add',
    quantity: 4,
    previousStock: 4,
    newStock: 8,
    note: 'Reposicion de inventario',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    partId: sampleParts[4].id,
    partNumber: '563214789',
    type: 'remove',
    quantity: 12,
    previousStock: 60,
    newStock: 48,
    note: 'Pedido Southern Peru',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    partId: sampleParts[6].id,
    partNumber: '246813572',
    type: 'adjust',
    quantity: 12,
    previousStock: 10,
    newStock: 12,
    note: 'Ajuste por inventario fisico',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
]

// Sample quotations for history
const sampleQuotations: Quotation[] = [
  {
    id: generateId(),
    quotationNumber: 'COT-2026-00001',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    seller: 'Luis Villavicencio',
    currency: 'USD',
    validity: 7,
    companyId: sampleCompanies[0].id,
    companyName: sampleCompanies[0].name,
    companyRuc: sampleCompanies[0].ruc,
    items: [
      {
        id: generateId(),
        internalCode: '3128 3140 12',
        partNumber: '3128314012',
        description: 'Filtro de aceite hidraulico alta presion',
        quantity: 5,
        unitPrice: 185.50,
        total: 927.50,
        partId: sampleParts[0].id,
      },
      {
        id: generateId(),
        internalCode: '4587 2190 08',
        partNumber: '458721908',
        description: 'Kit de sellos para cilindro de levante',
        quantity: 2,
        unitPrice: 420.00,
        total: 840.00,
        partId: sampleParts[1].id,
      },
    ],
    subtotal: 1767.50,
    igv: 318.15,
    total: 2085.65,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    quotationNumber: 'COT-2026-00002',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    seller: 'Luis Villavicencio',
    currency: 'USD',
    validity: 7,
    companyId: sampleCompanies[1].id,
    companyName: sampleCompanies[1].name,
    companyRuc: sampleCompanies[1].ruc,
    items: [
      {
        id: generateId(),
        internalCode: '5632 1478 90',
        partNumber: '563214789',
        description: 'Zapata de cadena reforzada',
        quantity: 24,
        unitPrice: 145.00,
        total: 3480.00,
        partId: sampleParts[4].id,
      },
    ],
    subtotal: 3480.00,
    igv: 626.40,
    total: 4106.40,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    quotationNumber: 'COT-2026-00003',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    seller: 'Luis Villavicencio',
    currency: 'USD',
    validity: 7,
    companyId: sampleCompanies[0].id,
    companyName: sampleCompanies[0].name,
    companyRuc: sampleCompanies[0].ruc,
    items: [
      {
        id: generateId(),
        internalCode: '7241 5632 15',
        partNumber: '724156321',
        description: 'Bomba de inyeccion diesel',
        quantity: 1,
        unitPrice: 2850.00,
        total: 2850.00,
        partId: sampleParts[2].id,
      },
      {
        id: generateId(),
        internalCode: '1234 5678 90',
        partNumber: '123456789',
        description: 'Alternador 24V 150A',
        quantity: 2,
        unitPrice: 1250.00,
        total: 2500.00,
        partId: sampleParts[9].id,
      },
    ],
    subtotal: 5350.00,
    igv: 963.00,
    total: 6313.00,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    quotationNumber: 'COT-2026-00004',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    seller: 'Luis Villavicencio',
    currency: 'USD',
    validity: 7,
    companyId: sampleCompanies[2].id,
    companyName: sampleCompanies[2].name,
    companyRuc: sampleCompanies[2].ruc,
    items: [
      {
        id: generateId(),
        internalCode: '9876 5432 10',
        partNumber: '987654321',
        description: 'Motor de giro planetary',
        quantity: 1,
        unitPrice: 8500.00,
        total: 8500.00,
        partId: sampleParts[8].id,
      },
    ],
    subtotal: 8500.00,
    igv: 1530.00,
    total: 10030.00,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
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
  addStock: (partId: string, quantity: number, note?: string) => void
  removeStock: (partId: string, quantity: number, note?: string) => void
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
  getLastQuotationDateForCompany: (companyId: string) => Date | null
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
  quotations: sampleQuotations,
  quotationCounter: 4,
  isAuthenticated: false,
  userProfile: {
    name: 'VyR Team',
    username: 'admin',
    profileImage: '',
  },
  systemSettings: {
    igvPercentage: 18,
    currency: 'USD',
    exchangeRate: 3.75,
    sellerName: 'Luis Villavicencio',
    businessInfo: {
      companyName: 'VyR Maquinaria e Inversiones',
      ruc: '20607951871',
      addressArequipa: 'Ciudad Blanca N-3 Paucarpata',
      addressLima: 'Asoc. Viv. Casa Huerta San Pedro Mz B Lote 14 Puente Piedra',
      email: 'maquinariainversionesvr@gmail.com',
      phone: '941113500',
      logo: '',
    },
    bankAccounts: [
      { bankName: 'BCP', accountNumber: '215-05782429-1-33', cci: '00221510578242913329' },
      { bankName: 'BANCO CONTINENTAL', accountNumber: '0011-0222-0200563856' },
      { bankName: 'BANCO DE LA NACIÓN (DETRACCIÓN)', accountNumber: '109025518' },
    ],
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
  addStock: (partId, quantity, note?: string) => {
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
        note: note || 'Agregado al stock',
        createdAt: new Date(),
      }]
    }))
  },
  
  removeStock: (partId, quantity, note?: string) => {
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
        note: note || 'manual',
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
    
    // Reduce stock for each item with a partId (note: sale to company)
    quotation.items.forEach(item => {
      if (item.partId) {
        get().removeStock(item.partId, item.quantity, `Venta a ${quotation.companyName}`)
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
  
  getLastQuotationDateForCompany: (companyId) => {
    const companyQuotations = get().quotations.filter((q) => q.companyId === companyId)
    if (companyQuotations.length === 0) return null
    
    // Find the most recent quotation date
    const sortedQuotations = companyQuotations.sort((a, b) => b.date.getTime() - a.date.getTime())
    return sortedQuotations[0].date
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
  
  updatePassword: (_oldPassword, newPassword) => {
    // Simplified password change - no current password required per requirements
    currentPassword = newPassword
    return true
  },
  
  updateSettings: (settings) => {
    set((state) => ({
      systemSettings: { ...state.systemSettings, ...settings }
    }))
  },
}))
