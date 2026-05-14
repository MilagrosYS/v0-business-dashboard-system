'use client'

import { useState, useMemo } from 'react'
import { Building2, FileText, Download, Copy, Search, ChevronRight, ArrowLeft, DollarSign, Trash2, Eye, FolderOpen } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { Quotation } from '@/lib/types'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { jsPDF } from 'jspdf'

type ViewMode = 'main' | 'company-quotations' | 'quotation-detail'

interface CompanyGroup {
  companyId: string
  companyName: string
  companyRuc: string
  totalAmount: number
  quotationCount: number
}

export function QuotationHistory() {
  const { quotations, companies, systemSettings, duplicateQuotation, deleteQuotation } = useDashboardStore()
  
  const [viewMode, setViewMode] = useState<ViewMode>('main')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  
  // Filter states for main view
  const [searchTerm, setSearchTerm] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  // Filter states for company folder view
  const [companySearchTerm, setCompanySearchTerm] = useState('')
  const [companyMinAmount, setCompanyMinAmount] = useState('')
  const [companyDateFrom, setCompanyDateFrom] = useState('')
  const [companyDateTo, setCompanyDateTo] = useState('')
  
  // Delete confirmation state
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null)
  
  // Group quotations by company
  const companyGroups = useMemo(() => {
    const groups: Record<string, CompanyGroup> = {}
    
    quotations.forEach(q => {
      if (!groups[q.companyId]) {
        groups[q.companyId] = {
          companyId: q.companyId,
          companyName: q.companyName,
          companyRuc: q.companyRuc,
          totalAmount: 0,
          quotationCount: 0,
        }
      }
      groups[q.companyId].totalAmount += q.total
      groups[q.companyId].quotationCount += 1
    })
    
    return Object.values(groups).sort((a, b) => b.totalAmount - a.totalAmount)
  }, [quotations])
  
  // Filter recent quotations (main view)
  const filteredQuotations = useMemo(() => {
    let filtered = [...quotations].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(q => 
        q.quotationNumber.toLowerCase().includes(searchLower) ||
        q.companyName.toLowerCase().includes(searchLower)
      )
    }
    
    if (minAmount) {
      filtered = filtered.filter(q => q.total >= parseFloat(minAmount))
    }
    
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter(q => new Date(q.date) >= fromDate)
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(q => new Date(q.date) <= toDate)
    }
    
    return filtered
  }, [quotations, searchTerm, minAmount, dateFrom, dateTo])
  
  // Get quotations for selected company with filters (NO company name filter)
  const companyQuotations = useMemo(() => {
    if (!selectedCompanyId) return []
    
    let filtered = quotations
      .filter(q => q.companyId === selectedCompanyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Search by quotation number only (not company name since we're already in a company)
    if (companySearchTerm) {
      const searchLower = companySearchTerm.toLowerCase()
      filtered = filtered.filter(q => 
        q.quotationNumber.toLowerCase().includes(searchLower)
      )
    }
    
    if (companyMinAmount) {
      filtered = filtered.filter(q => q.total >= parseFloat(companyMinAmount))
    }
    
    if (companyDateFrom) {
      const fromDate = new Date(companyDateFrom)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter(q => new Date(q.date) >= fromDate)
    }
    
    if (companyDateTo) {
      const toDate = new Date(companyDateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(q => new Date(q.date) <= toDate)
    }
    
    return filtered
  }, [quotations, selectedCompanyId, companySearchTerm, companyMinAmount, companyDateFrom, companyDateTo])
  
  // Handle company click
  const handleCompanyClick = (companyId: string) => {
    setSelectedCompanyId(companyId)
    setViewMode('company-quotations')
    // Reset company filters
    setCompanySearchTerm('')
    setCompanyMinAmount('')
    setCompanyDateFrom('')
    setCompanyDateTo('')
  }
  
  // Handle quotation click
  const handleQuotationClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation)
    setViewMode('quotation-detail')
  }
  
  // Handle back navigation
  const handleBack = () => {
    if (viewMode === 'quotation-detail') {
      if (selectedCompanyId) {
        setViewMode('company-quotations')
      } else {
        setViewMode('main')
      }
      setSelectedQuotation(null)
    } else if (viewMode === 'company-quotations') {
      setViewMode('main')
      setSelectedCompanyId(null)
    }
  }
  
  // Handle duplicate
  const handleDuplicate = (quotation: Quotation) => {
    const newQuotation = duplicateQuotation(quotation.id)
    if (newQuotation) {
      setSelectedQuotation(newQuotation)
    }
  }
  
  // Handle delete
  const handleDelete = () => {
    if (quotationToDelete) {
      deleteQuotation(quotationToDelete.id)
      setQuotationToDelete(null)
      if (selectedQuotation?.id === quotationToDelete.id) {
        setSelectedQuotation(null)
        if (selectedCompanyId) {
          setViewMode('company-quotations')
        } else {
          setViewMode('main')
        }
      }
    }
  }
  
  // Export to PDF
  const handleExportPDF = (quotation: Quotation) => {
    const company = companies.find(c => c.id === quotation.companyId)
    const { businessInfo, bankAccounts } = systemSettings
    const currencySymbol = quotation.currency === 'USD' ? '$' : 'S/'
    
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
    doc.text(`COTIZACION: ${quotation.quotationNumber}`, leftMargin, y)
    y += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Fecha: ${new Date(quotation.date).toLocaleDateString('es-PE')}`, leftMargin, y)
    doc.text(`Vendedor: ${quotation.seller}`, 100, y)
    y += 5
    doc.text(`Validez: ${quotation.validity} dias`, leftMargin, y)
    doc.text(`Moneda: ${quotation.currency === 'USD' ? 'Dolares (USD)' : 'Soles (PEN)'}`, 100, y)
    y += 10
    
    // Customer Info
    doc.setFillColor(240, 240, 245)
    doc.rect(leftMargin, y - 3, pageWidth, 28, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.text('CLIENTE:', leftMargin + 3, y + 4)
    doc.setFont('helvetica', 'normal')
    doc.text(quotation.companyName, leftMargin + 25, y + 4)
    y += 7
    doc.text(`RUC: ${quotation.companyRuc}`, leftMargin + 3, y + 4)
    y += 5
    if (company) {
      doc.text(`Direccion: ${company.address}`, leftMargin + 3, y + 4)
      y += 5
      doc.text(`Email: ${company.email} | Tel: ${company.phone} | Contacto: ${company.contact || '-'}`, leftMargin + 3, y + 4)
    }
    y += 15
    
    // Products Table Header
    doc.setFillColor(2, 46, 117)
    doc.rect(leftMargin, y, pageWidth, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    
    const colWidths = [12, 22, 28, 70, 14, 22, 22]
    let x = leftMargin + 2
    const headers = ['Item', 'Cod. Int.', 'Part Number', 'Descripcion', 'Cant.', 'P. Unit.', 'Total']
    headers.forEach((header, i) => {
      doc.text(header, x, y + 5.5)
      x += colWidths[i]
    })
    y += 10
    
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    
    // Products Rows
    quotation.items.forEach((item, index) => {
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      
      const maxDescWidth = 68
      const descLines = doc.splitTextToSize(item.description, maxDescWidth)
      const rowHeight = Math.max(7, descLines.length * 4 + 3)
      
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
    doc.text(`${currencySymbol}${quotation.subtotal.toFixed(2)}`, totalsX + 35, y, { align: 'right' })
    y += 5
    doc.text(`IGV (${systemSettings.igvPercentage}%):`, totalsX, y)
    doc.text(`${currencySymbol}${quotation.igv.toFixed(2)}`, totalsX + 35, y, { align: 'right' })
    y += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('TOTAL:', totalsX, y)
    doc.text(`${currencySymbol}${quotation.total.toFixed(2)}`, totalsX + 35, y, { align: 'right' })
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
    
    doc.save(`${quotation.quotationNumber}.pdf`)
  }
  
  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setMinAmount('')
    setDateFrom('')
    setDateTo('')
  }
  
  const clearCompanyFilters = () => {
    setCompanySearchTerm('')
    setCompanyMinAmount('')
    setCompanyDateFrom('')
    setCompanyDateTo('')
  }
  
  const hasFilters = searchTerm || minAmount || dateFrom || dateTo
  const hasCompanyFilters = companySearchTerm || companyMinAmount || companyDateFrom || companyDateTo
  
  // Get selected company name
  const selectedCompanyName = selectedCompanyId 
    ? companyGroups.find(g => g.companyId === selectedCompanyId)?.companyName 
    : ''
  
  // Quotation Card Component - Only "Ver detalle" button visible
  const QuotationCard = ({ quotation, showCompany = false }: { quotation: Quotation; showCompany?: boolean }) => (
    <Card className="transition-all hover:border-primary/50 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{quotation.quotationNumber}</h3>
              {showCompany && (
                <p className="text-sm text-muted-foreground">{quotation.companyName}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(quotation.date).toLocaleDateString('es-PE')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-base font-bold text-primary">
              {quotation.currency === 'USD' ? '$' : 'S/'}{quotation.total.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Items</p>
            <p className="text-base font-bold">{quotation.items.length}</p>
          </div>
        </div>
        
        {/* Only Ver detalle button visible */}
        <div className="mt-3">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-full gap-1.5"
            onClick={(e) => {
              e.stopPropagation()
              handleQuotationClick(quotation)
            }}
          >
            <Eye className="h-4 w-4" />
            Ver detalle
          </Button>
        </div>
      </CardContent>
    </Card>
  )
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {viewMode !== 'main' && (
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {viewMode === 'main' && 'Historial de Cotizaciones'}
            {viewMode === 'company-quotations' && selectedCompanyName}
            {viewMode === 'quotation-detail' && selectedQuotation?.quotationNumber}
          </h2>
          <p className="text-muted-foreground">
            {viewMode === 'main' && 'Busca, filtra y gestiona todas tus cotizaciones'}
            {viewMode === 'company-quotations' && `${companyQuotations.length} cotizacion(es)`}
            {viewMode === 'quotation-detail' && `Creada el ${selectedQuotation ? new Date(selectedQuotation.createdAt).toLocaleDateString('es-PE') : ''}`}
          </p>
        </div>
      </div>
      
      {/* Main View */}
      {viewMode === 'main' && (
        <>
          {/* Filters */}
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="N de cotizacion o empresa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Monto minimo</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Fecha desde</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Fecha hasta</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
              {hasFilters && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredQuotations.length} resultado(s)
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Quotations */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Ultimas Cotizaciones</h3>
            {filteredQuotations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-lg font-medium text-muted-foreground">
                    {hasFilters ? 'No se encontraron cotizaciones' : 'Sin cotizaciones aun'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {hasFilters ? 'Intenta ajustar los filtros' : 'Crea tu primera cotizacion para verla aqui'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredQuotations.slice(0, 6).map(quotation => (
                  <QuotationCard key={quotation.id} quotation={quotation} showCompany />
                ))}
              </div>
            )}
          </div>
          
          {/* Company Groups */}
          {companyGroups.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-foreground">Cotizaciones por Empresa</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {companyGroups.map(group => (
                  <Card 
                    key={group.companyId}
                    className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                    onClick={() => handleCompanyClick(group.companyId)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <FolderOpen className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{group.companyName}</h3>
                            <p className="text-sm text-muted-foreground">{group.companyRuc}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Cotizado</p>
                          <p className="text-base font-bold text-primary">
                            ${group.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Cotizaciones</p>
                          <p className="text-base font-bold">{group.quotationCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Company Quotations View */}
      {viewMode === 'company-quotations' && (
        <>
          {/* Filters for company view - NO company name filter */}
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">N de Cotizacion</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por numero..."
                      value={companySearchTerm}
                      onChange={(e) => setCompanySearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Monto minimo</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={companyMinAmount}
                      onChange={(e) => setCompanyMinAmount(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Fecha desde</label>
                  <Input
                    type="date"
                    value={companyDateFrom}
                    onChange={(e) => setCompanyDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Fecha hasta</label>
                  <Input
                    type="date"
                    value={companyDateTo}
                    onChange={(e) => setCompanyDateTo(e.target.value)}
                  />
                </div>
              </div>
              {hasCompanyFilters && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {companyQuotations.length} resultado(s)
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearCompanyFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {companyQuotations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium text-muted-foreground">
                  {hasCompanyFilters ? 'No se encontraron cotizaciones' : 'Sin cotizaciones'}
                </p>
                {hasCompanyFilters && (
                  <p className="text-sm text-muted-foreground">Intenta ajustar los filtros</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {companyQuotations.map(quotation => (
                <QuotationCard key={quotation.id} quotation={quotation} />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Quotation Detail View - Actions moved here */}
      {viewMode === 'quotation-detail' && selectedQuotation && (
        <>
          {/* Actions inside detail view */}
          <div className="flex items-center gap-3">
            <Button onClick={() => handleExportPDF(selectedQuotation)}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
            <Button variant="outline" onClick={() => handleDuplicate(selectedQuotation)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicar
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setQuotationToDelete(selectedQuotation)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
          
          {/* Quotation Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informacion de Cotizacion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div>
                  <span className="text-sm text-muted-foreground">Empresa</span>
                  <p className="font-medium">{selectedQuotation.companyName}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">RUC</span>
                  <p className="font-medium">{selectedQuotation.companyRuc}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Vendedor</span>
                  <p className="font-medium">{selectedQuotation.seller}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Validez</span>
                  <p className="font-medium">{selectedQuotation.validity} dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cod. Int.</TableHead>
                    <TableHead>Numero de Parte</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">P. Unitario</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedQuotation.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.internalCode || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{item.partNumber || '-'}</TableCell>
                      <TableCell>{item.description || '-'}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {selectedQuotation.currency === 'USD' ? '$' : 'S/'}{item.unitPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {selectedQuotation.currency === 'USD' ? '$' : 'S/'}{item.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Totals */}
              <div className="mt-6 flex justify-end">
                <div className="w-72 space-y-2 rounded-lg bg-muted/50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{selectedQuotation.currency === 'USD' ? '$' : 'S/'}{selectedQuotation.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IGV ({systemSettings.igvPercentage}%)</span>
                    <span>{selectedQuotation.currency === 'USD' ? '$' : 'S/'}{selectedQuotation.igv.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{selectedQuotation.currency === 'USD' ? '$' : 'S/'}{selectedQuotation.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!quotationToDelete} onOpenChange={() => setQuotationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Cotizacion</AlertDialogTitle>
            <AlertDialogDescription>
              Esta seguro de eliminar la cotizacion <strong>{quotationToDelete?.quotationNumber}</strong>?
              Esta accion no se puede deshacer y el stock de los productos sera restaurado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
