'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Download, Save } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { QuotationItem } from '@/lib/types'
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

const generateItemId = () => Math.random().toString(36).substring(2, 15)

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
  const [selectedCompany, setSelectedCompany] = useState<{ id: string; name: string; ruc: string } | null>(null)
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false)
  const [items, setItems] = useState<QuotationItem[]>([
    { id: generateItemId(), internalCode: '', partNumber: '', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ])
  const [savedQuotationId, setSavedQuotationId] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const companyInputRef = useRef<HTMLDivElement>(null)
  
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
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const igv = subtotal * (systemSettings.igvPercentage / 100)
  const total = subtotal + igv
  
  // Handle company selection
  const handleSelectCompany = (company: typeof companies[0]) => {
    setSelectedCompany({ id: company.id, name: company.name, ruc: company.ruc })
    setCompanySearch(company.name)
    setShowCompanySuggestions(false)
    setHasUnsavedChanges(true)
  }
  
  // Handle part number change with auto-fill
  const handlePartNumberChange = (itemId: string, partNumber: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      
      const part = spareParts.find(p => p.partNumber.toLowerCase() === partNumber.toLowerCase())
      
      if (part) {
        const newTotal = item.quantity * part.price
        return {
          ...item,
          partNumber: part.partNumber,
          internalCode: part.internalCode,
          description: part.description,
          unitPrice: part.price,
          total: newTotal,
          partId: part.id,
        }
      }
      
      return { ...item, partNumber }
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
    
    if (savedQuotationId) {
      // Update existing quotation
      updateQuotation(savedQuotationId, {
        date: new Date(date),
        items: validItems,
        subtotal,
        igv,
        total,
      })
    } else {
      // Create new quotation
      const newQuotation = addQuotation({
        date: new Date(date),
        seller: systemSettings.sellerName,
        currency: systemSettings.currency,
        validity: 7,
        companyId: selectedCompany.id,
        companyName: selectedCompany.name,
        companyRuc: selectedCompany.ruc,
        items: validItems,
        subtotal,
        igv,
        total,
      })
      setSavedQuotationId(newQuotation.id)
    }
    
    setHasUnsavedChanges(false)
  }
  
  // Export to PDF (simulated)
  const handleExportPDF = () => {
    const quotation = quotations.find(q => q.id === savedQuotationId)
    if (!quotation) return
    
    // Create a simple text representation for download
    const content = `
QUOTATION: ${quotation.quotationNumber}
Date: ${new Date(quotation.date).toLocaleDateString()}
Company: ${quotation.companyName}
RUC: ${quotation.companyRuc}
Seller: ${quotation.seller}

ITEMS:
${quotation.items.map(item => 
  `${item.partNumber || 'N/A'} - ${item.description} x${item.quantity} @ ${systemSettings.currency}${item.unitPrice.toFixed(2)} = ${systemSettings.currency}${item.total.toFixed(2)}`
).join('\n')}

Subtotal: ${systemSettings.currency}${quotation.subtotal.toFixed(2)}
IGV (${systemSettings.igvPercentage}%): ${systemSettings.currency}${quotation.igv.toFixed(2)}
TOTAL: ${systemSettings.currency}${quotation.total.toFixed(2)}

Valid for ${quotation.validity} days
    `.trim()
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${quotation.quotationNumber}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">New Quotation</h2>
        <p className="text-muted-foreground">Create a quotation for your customer</p>
      </div>
      
      {/* Quotation Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quotation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Quotation Number</label>
              <p className="mt-1 text-lg font-semibold text-primary">{quotationNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setHasUnsavedChanges(true); }}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Seller</label>
              <p className="mt-1 text-base">{systemSettings.sellerName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Currency / Validity</label>
              <p className="mt-1 text-base">{systemSettings.currency} / 7 days</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Customer Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative" ref={companyInputRef}>
            <Input
              placeholder="Search by company name or RUC..."
              value={companySearch}
              onChange={(e) => {
                setCompanySearch(e.target.value)
                setShowCompanySuggestions(true)
                if (!e.target.value) setSelectedCompany(null)
              }}
              onFocus={() => setShowCompanySuggestions(true)}
              className="max-w-md"
            />
            
            {/* Suggestions dropdown */}
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
            <div className="mt-4 rounded-lg bg-muted/50 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Company</span>
                  <p className="font-medium">{selectedCompany.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">RUC</span>
                  <p className="font-medium">{selectedCompany.ruc}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Products Table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Products</CardTitle>
          <Button onClick={addRow} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Int. Code</TableHead>
                  <TableHead className="w-32">Part Number</TableHead>
                  <TableHead className="min-w-48">Description</TableHead>
                  <TableHead className="w-24">Qty</TableHead>
                  <TableHead className="w-28">Unit Price</TableHead>
                  <TableHead className="w-28">Total</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.internalCode}
                        readOnly
                        className="bg-muted/50"
                        placeholder="-"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.partNumber}
                        onChange={(e) => handlePartNumberChange(item.id, e.target.value)}
                        placeholder="e.g. COT-001"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                        placeholder="Product description"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleUnitPriceChange(item.id, parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{systemSettings.currency}{item.total.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-72 space-y-2 rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{systemSettings.currency}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IGV ({systemSettings.igvPercentage}%)</span>
                <span>{systemSettings.currency}{igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{systemSettings.currency}{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={!selectedCompany || items.every(i => !i.description)}
          size="lg"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Quotation
        </Button>
        
        {savedQuotationId && !hasUnsavedChanges && (
          <Button onClick={handleExportPDF} variant="outline" size="lg">
            <Download className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
        )}
        
        {savedQuotationId && hasUnsavedChanges && (
          <span className="text-sm text-muted-foreground">
            Save to enable PDF export
          </span>
        )}
      </div>
    </div>
  )
}
