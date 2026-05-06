'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Download, Save } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { QuotationItem, Company, normalizePartNumber } from '@/lib/types'
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
import { jsPDF } from 'jspdf'

const generateItemId = () => Math.random().toString(36).substring(2, 15)

type CurrencyType = 'USD' | 'PEN'

export function Quotations() {
  const { 
    companies, 
    spareParts, 
    systemSettings,
    getNextQuotationNumber,
    addQuotation,
    updateQuotation,
    quotations
  } = useDashboardStore()
  
  const [quotationNumber, setQuotationNumber] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [companySearch, setCompanySearch] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false)
  const [currency, setCurrency] = useState<CurrencyType>('USD')
  const [items, setItems] = useState<QuotationItem[]>([
    { id: generateItemId(), internalCode: '', partNumber: '', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ])
  const [savedQuotationId, setSavedQuotationId] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const companyInputRef = useRef<HTMLDivElement>(null)
  
  // Currency symbols and conversion
  const currencySymbol = currency === 'USD' ? '$' : 'S/'
  const exchangeRate = systemSettings.exchangeRate
  
  // Convert price based on currency (prices stored in USD)
  const convertPrice = (usdPrice: number): number => {
    return currency === 'USD' ? usdPrice : usdPrice * exchangeRate
  }
  
  // Generate quotation number on mount
  useEffect(() => {
    setQuotationNumber(getNextQuotationNumber())
  }, [getNextQuotationNumber])
  
  // Close company suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (companyInputRef.current && !companyInputRef.current.contains(event.target as Node)) {
        setShowCompanySuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Filter companies based on search
  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
    c.ruc.includes(companySearch)
  ).slice(0, 5)
  
  // Calculate totals (always in displayed currency)
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const igv = subtotal * (systemSettings.igvPercentage / 100)
  const total = subtotal + igv
  
  // Handle company selection
  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company)
    setCompanySearch(company.name)
    setShowCompanySuggestions(false)
    setHasUnsavedChanges(true)
  }
  
  // Handle currency switch
  const handleCurrencySwitch = (newCurrency: CurrencyType) => {
    if (newCurrency === currency) return
    
    // Convert all prices
    setItems(prev => prev.map(item => {
      let newUnitPrice: number
      if (newCurrency === 'PEN') {
        // Converting from USD to PEN
        newUnitPrice = item.unitPrice * exchangeRate
      } else {
        // Converting from PEN to USD
        newUnitPrice = item.unitPrice / exchangeRate
      }
      const newTotal = item.quantity * newUnitPrice
      return { ...item, unitPrice: newUnitPrice, total: newTotal }
    }))
    
    setCurrency(newCurrency)
    setHasUnsavedChanges(true)
  }
  
  // Handle part number change with auto-fill (supports spaces or no spaces)
  const handlePartNumberChange = (itemId: string, partNumber: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      
      // Normalize the input to match with or without spaces
      const normalizedInput = normalizePartNumber(partNumber).toLowerCase()
      const part = spareParts.find(p => 
        normalizePartNumber(p.partNumber).toLowerCase() === normalizedInput
      )
      
      if (part) {
        const displayPrice = convertPrice(part.price)
        const newTotal = item.quantity * displayPrice
        return {
          ...item,
          partNumber: part.partNumber,
          internalCode: part.internalCode,
          description: part.description,
          unitPrice: displayPrice,
          total: newTotal,
          partId: part.id,
        }
      }
      
      return { ...item, partNumber }
    }))
    setHasUnsavedChanges(true)
  }
  
  // Handle internal code change with auto-fill (supports spaces or no spaces)
  const handleInternalCodeChange = (itemId: string, internalCode: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      
      // Normalize the input to match with or without spaces
      const normalizedInput = normalizePartNumber(internalCode).toLowerCase()
      const part = spareParts.find(p => 
        normalizePartNumber(p.internalCode).toLowerCase() === normalizedInput
      )
      
      if (part) {
        const displayPrice = convertPrice(part.price)
        const newTotal = item.quantity * displayPrice
        return {
          ...item,
          partNumber: part.partNumber,
          internalCode: part.internalCode,
          description: part.description,
          unitPrice: displayPrice,
          total: newTotal,
          partId: part.id,
        }
      }
      
      return { ...item, internalCode }
    }))
    setHasUnsavedChanges(true)
  }
  
  // Handle quantity change
  const handleQuantityChange = (itemId: string, quantity: number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      const newTotal = quantity * item.unitPrice
      return { ...item, quantity, total: newTotal }
    }))
    setHasUnsavedChanges(true)
  }
  
  // Handle unit price change
  const handleUnitPriceChange = (itemId: string, unitPrice: number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      const newTotal = item.quantity * unitPrice
      return { ...item, unitPrice, total: newTotal }
    }))
    setHasUnsavedChanges(true)
  }
  
  // Handle description change
  const handleDescriptionChange = (itemId: string, description: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, description } : item
    ))
    setHasUnsavedChanges(true)
  }
  
  // Add new row
  const addRow = () => {
    setItems(prev => [...prev, {
      id: generateItemId(),
      internalCode: '',
      partNumber: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }])
    setHasUnsavedChanges(true)
  }
  
  // Remove row
  const removeRow = (itemId: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== itemId))
      setHasUnsavedChanges(true)
    }
  }
  
  // Save quotation
  const handleSave = () => {
    if (!selectedCompany) return
    
    const validItems = items.filter(item => item.description && item.quantity > 0)
    if (validItems.length === 0) return
    
    // Convert prices back to USD for storage if in PEN
    const itemsInUSD = currency === 'PEN' 
      ? validItems.map(item => ({
          ...item,
          unitPrice: item.unitPrice / exchangeRate,
          total: item.total / exchangeRate,
        }))
      : validItems
    
    const subtotalUSD = currency === 'PEN' ? subtotal / exchangeRate : subtotal
    const igvUSD = currency === 'PEN' ? igv / exchangeRate : igv
    const totalUSD = currency === 'PEN' ? total / exchangeRate : total
    
    if (savedQuotationId) {
      updateQuotation(savedQuotationId, {
        date: new Date(date),
        currency,
        items: itemsInUSD,
        subtotal: subtotalUSD,
        igv: igvUSD,
        total: totalUSD,
      })
    } else {
      const newQuotation = addQuotation({
        date: new Date(date),
        seller: systemSettings.sellerName,
        currency,
        validity: 7,
        companyId: selectedCompany.id,
        companyName: selectedCompany.name,
        companyRuc: selectedCompany.ruc,
        items: itemsInUSD,
        subtotal: subtotalUSD,
        igv: igvUSD,
        total: totalUSD,
      })
      setSavedQuotationId(newQuotation.id)
    }
    
    setHasUnsavedChanges(false)
  }
  
  // Export to PDF
  const handleExportPDF = () => {
    const quotation = quotations.find(q => q.id === savedQuotationId)
    if (!quotation || !selectedCompany) return
    
    const { businessInfo, bankAccounts } = systemSettings
    const doc = new jsPDF()
    
    let y = 20
    const leftMargin = 15
    const rightMargin = 195
    const pageWidth = 180
    
    // Header - Company Info
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(businessInfo.companyName, leftMargin, y)
    y += 7
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`RUC: ${businessInfo.ruc}`, leftMargin, y)
    y += 5
    doc.text(`Arequipa: ${businessInfo.addressArequipa}`, leftMargin, y)
    y += 5
    doc.text(`Lima: ${businessInfo.addressLima}`, leftMargin, y)
    y += 5
    doc.text(`Email: ${businessInfo.email} | Tel: ${businessInfo.phone}`, leftMargin, y)
    y += 12
    
    // Line separator
    doc.setDrawColor(2, 46, 117)
    doc.setLineWidth(0.5)
    doc.line(leftMargin, y, rightMargin, y)
    y += 10
    
    // Quotation Info
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`COTIZACIÓN: ${quotation.quotationNumber}`, leftMargin, y)
    y += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Fecha: ${new Date(quotation.date).toLocaleDateString('es-PE')}`, leftMargin, y)
    doc.text(`Vendedor: ${quotation.seller}`, 100, y)
    y += 5
    doc.text(`Validez: ${quotation.validity} días`, leftMargin, y)
    doc.text(`Moneda: ${currency === 'USD' ? 'Dólares (USD)' : 'Soles (PEN)'}`, 100, y)
    y += 10
    
    // Customer Info
    doc.setFillColor(240, 240, 245)
    doc.rect(leftMargin, y - 3, pageWidth, 28, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.text('CLIENTE:', leftMargin + 3, y + 4)
    doc.setFont('helvetica', 'normal')
    doc.text(selectedCompany.name, leftMargin + 25, y + 4)
    y += 7
    doc.text(`RUC: ${selectedCompany.ruc}`, leftMargin + 3, y + 4)
    y += 5
    doc.text(`Dirección: ${selectedCompany.address}`, leftMargin + 3, y + 4)
    y += 5
    doc.text(`Email: ${selectedCompany.email} | Tel: ${selectedCompany.phone} | Contacto: ${selectedCompany.contact}`, leftMargin + 3, y + 4)
    y += 15
    
    // Products Table Header
    doc.setFillColor(2, 46, 117)
    doc.rect(leftMargin, y, pageWidth, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    
    const colWidths = [12, 22, 28, 70, 14, 22, 22]
    let x = leftMargin + 2
    const headers = ['Item', 'Cód. Int.', 'Part Number', 'Descripción', 'Cant.', 'P. Unit.', 'Total']
    headers.forEach((header, i) => {
      doc.text(header, x, y + 5.5)
      x += colWidths[i]
    })
    y += 10
    
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    
    // Products Rows
    items.filter(item => item.description && item.quantity > 0).forEach((item, index) => {
      // Check if we need a new page
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      
      // Calculate row height based on description length
      const maxDescWidth = 68
      const descLines = doc.splitTextToSize(item.description, maxDescWidth)
      const rowHeight = Math.max(7, descLines.length * 4 + 3)
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 252)
        doc.rect(leftMargin, y - 1, pageWidth, rowHeight, 'F')
      }
      
      x = leftMargin + 2
      doc.text(String(index + 1), x, y + 4)
      x += colWidths[0]
      doc.text(item.internalCode || '-', x, y + 4)
      x += colWidths[1]
      doc.text(item.partNumber || '-', x, y + 4)
      x += colWidths[2]
      
      // Multi-line description
      doc.text(descLines, x, y + 4)
      x += colWidths[3]
      
      doc.text(String(item.quantity), x, y + 4)
      x += colWidths[4]
      doc.text(`${currencySymbol}${item.unitPrice.toFixed(2)}`, x, y + 4)
      x += colWidths[5]
      doc.text(`${currencySymbol}${item.total.toFixed(2)}`, x, y + 4)
      
      y += rowHeight
    })
    
    y += 5
    
    // Totals
    const totalsX = 140
    doc.setFont('helvetica', 'normal')
    doc.text('Subtotal:', totalsX, y)
    doc.text(`${currencySymbol}${subtotal.toFixed(2)}`, totalsX + 35, y, { align: 'right' })
    y += 5
    doc.text(`IGV (${systemSettings.igvPercentage}%):`, totalsX, y)
    doc.text(`${currencySymbol}${igv.toFixed(2)}`, totalsX + 35, y, { align: 'right' })
    y += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('TOTAL:', totalsX, y)
    doc.text(`${currencySymbol}${total.toFixed(2)}`, totalsX + 35, y, { align: 'right' })
    y += 15
    
    // Payment Section
    if (y > 240) {
      doc.addPage()
      y = 20
    }
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('CUENTAS CORRIENTE DOLARES', leftMargin, y)
    y += 6
    
    doc.setFont('helvetica', 'normal')
    bankAccounts.forEach(account => {
      doc.text(`${account.bankName}: ${account.accountNumber}`, leftMargin, y)
      y += 4
      if (account.cci) {
        doc.text(`CCI: ${account.cci}`, leftMargin, y)
        y += 5
      }
    })
    
    // Save PDF
    doc.save(`${quotation.quotationNumber}.pdf`)
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Nueva Cotizacion</h2>
          <p className="text-muted-foreground">Crear cotizacion para cliente</p>
        </div>
        
        {/* Currency Selector */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => handleCurrencySwitch('USD')}
            className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
              currency === 'USD' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            $ USD
          </button>
          <button
            onClick={() => handleCurrencySwitch('PEN')}
            className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
              currency === 'PEN' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            S/ PEN
          </button>
          <span className="px-2 text-xs text-muted-foreground">
            TC: {exchangeRate.toFixed(2)}
          </span>
        </div>
      </div>
      
      {/* Quotation Header - Compact */}
      <div className="grid grid-cols-4 gap-4 rounded-lg border border-border bg-card p-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">N Cotizacion</label>
          <p className="text-base font-semibold text-primary">{quotationNumber}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Fecha</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setHasUnsavedChanges(true); }}
            className="mt-0.5 h-8"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Vendedor</label>
          <p className="text-sm">{systemSettings.sellerName}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Validez</label>
          <p className="text-sm">7 días</p>
        </div>
      </div>
      
      {/* Customer Selection */}
      <Card className="border-border">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Cliente</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative" ref={companyInputRef}>
            <Input
              placeholder="Buscar por nombre o RUC..."
              value={companySearch}
              onChange={(e) => {
                setCompanySearch(e.target.value)
                setShowCompanySuggestions(true)
                if (!e.target.value) setSelectedCompany(null)
              }}
              onFocus={() => setShowCompanySuggestions(true)}
              className="max-w-md"
            />
            
            {showCompanySuggestions && companySearch && filteredCompanies.length > 0 && (
              <div className="absolute z-10 mt-1 w-full max-w-md rounded-md border border-border bg-card shadow-lg">
                {filteredCompanies.map(company => (
                  <button
                    key={company.id}
                    onClick={() => handleSelectCompany(company)}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span className="font-medium">{company.name}</span>
                    <span className="text-muted-foreground">{company.ruc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {selectedCompany && (
            <div className="mt-3 grid grid-cols-3 gap-x-6 gap-y-2 rounded-lg bg-muted/50 p-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Empresa</span>
                <p className="font-medium">{selectedCompany.name}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">RUC</span>
                <p className="font-medium">{selectedCompany.ruc}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Contacto</span>
                <p>{selectedCompany.contact}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Dirección</span>
                <p>{selectedCompany.address}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Email</span>
                <p>{selectedCompany.email}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Teléfono</span>
                <p>{selectedCompany.phone}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Products Table */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-base">Productos</CardTitle>
          <Button onClick={addRow} size="sm" variant="outline">
            <Plus className="mr-1 h-4 w-4" />
            Agregar
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">Item</TableHead>
                  <TableHead className="w-24">Cód. Int.</TableHead>
                  <TableHead className="w-28">Part Number</TableHead>
                  <TableHead className="min-w-64">Descripción</TableHead>
                  <TableHead className="w-16">Cant.</TableHead>
                  <TableHead className="w-28">P. Unit.</TableHead>
                  <TableHead className="w-28">Total</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id} className="align-top">
                    <TableCell className="text-center font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.internalCode}
                        onChange={(e) => handleInternalCodeChange(item.id, e.target.value)}
                        className="h-8 whitespace-nowrap"
                        placeholder="-"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.partNumber}
                        onChange={(e) => handlePartNumberChange(item.id, e.target.value)}
                        className="h-8 whitespace-nowrap"
                        placeholder="-"
                      />
                    </TableCell>
                    <TableCell>
                      <textarea
                        value={item.description}
                        onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                        placeholder="Descripción del producto"
                        className="min-h-8 w-full resize-none rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        rows={1}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement
                          target.style.height = 'auto'
                          target.style.height = target.scrollHeight + 'px'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                        className="h-8 w-14"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          {currencySymbol}
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleUnitPriceChange(item.id, parseFloat(e.target.value) || 0)}
                          className="h-8 pl-6"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{currencySymbol}{item.total.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(item.id)}
                        disabled={items.length === 1}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Totals - Compact */}
          <div className="mt-4 flex justify-end">
            <div className="w-64 space-y-1 rounded-lg bg-muted/50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IGV ({systemSettings.igvPercentage}%)</span>
                <span>{currencySymbol}{igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 text-base font-bold">
                <span>Total</span>
                <span className="text-primary">{currencySymbol}{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment Info - Compact */}
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Cuentas Corriente Dólares</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {systemSettings.bankAccounts.map((account, i) => (
            <div key={i}>
              <span className="font-medium">{account.bankName}:</span>{' '}
              <span className="text-muted-foreground">{account.accountNumber}</span>
              {account.cci && (
                <p className="text-xs text-muted-foreground">CCI: {account.cci}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={!selectedCompany || items.every(i => !i.description)}
        >
          <Save className="mr-2 h-4 w-4" />
          Guardar
        </Button>
        
        {savedQuotationId && !hasUnsavedChanges && (
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        )}
        
        {savedQuotationId && hasUnsavedChanges && (
          <span className="text-sm text-muted-foreground">
            Guarde para exportar PDF
          </span>
        )}
      </div>
    </div>
  )
}
