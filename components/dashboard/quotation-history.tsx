'use client'

import { useState, useMemo } from 'react'
import { Building2, FileText, Download, Copy, Search, ChevronRight, ArrowLeft, Calendar, DollarSign } from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ViewMode = 'companies' | 'company-detail' | 'quotation-detail'

interface CompanyGroup {
  companyId: string
  companyName: string
  companyRuc: string
  totalAmount: number
  quotationCount: number
}

export function QuotationHistory() {
  const { quotations, companies, systemSettings, duplicateQuotation } = useDashboardStore()
  
  const [viewMode, setViewMode] = useState<ViewMode>('companies')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  
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
  
  // Filter company groups
  const filteredCompanyGroups = useMemo(() => {
    return companyGroups.filter(group => 
      group.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.companyRuc.includes(searchTerm)
    )
  }, [companyGroups, searchTerm])
  
  // Get quotations for selected company
  const companyQuotations = useMemo(() => {
    if (!selectedCompanyId) return []
    
    let filtered = quotations.filter(q => q.companyId === selectedCompanyId)
    
    // Apply filters
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString()
      filtered = filtered.filter(q => new Date(q.date).toDateString() === filterDate)
    }
    
    if (minAmount) {
      filtered = filtered.filter(q => q.total >= parseFloat(minAmount))
    }
    
    if (maxAmount) {
      filtered = filtered.filter(q => q.total <= parseFloat(maxAmount))
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [quotations, selectedCompanyId, dateFilter, minAmount, maxAmount])
  
  // Handle company click
  const handleCompanyClick = (companyId: string) => {
    setSelectedCompanyId(companyId)
    setViewMode('company-detail')
  }
  
  // Handle quotation click
  const handleQuotationClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation)
    setViewMode('quotation-detail')
  }
  
  // Handle back navigation
  const handleBack = () => {
    if (viewMode === 'quotation-detail') {
      setViewMode('company-detail')
      setSelectedQuotation(null)
    } else if (viewMode === 'company-detail') {
      setViewMode('companies')
      setSelectedCompanyId(null)
      setDateFilter('')
      setMinAmount('')
      setMaxAmount('')
    }
  }
  
  // Handle duplicate
  const handleDuplicate = (id: string) => {
    const newQuotation = duplicateQuotation(id)
    if (newQuotation) {
      setSelectedQuotation(newQuotation)
    }
  }
  
  // Export to PDF (simulated)
  const handleExportPDF = (quotation: Quotation) => {
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
  
  // Get selected company name
  const selectedCompanyName = selectedCompanyId 
    ? companyGroups.find(g => g.companyId === selectedCompanyId)?.companyName 
    : ''
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {viewMode !== 'companies' && (
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {viewMode === 'companies' && 'Quotation History'}
            {viewMode === 'company-detail' && selectedCompanyName}
            {viewMode === 'quotation-detail' && selectedQuotation?.quotationNumber}
          </h2>
          <p className="text-muted-foreground">
            {viewMode === 'companies' && 'Browse quotations grouped by company'}
            {viewMode === 'company-detail' && `${companyQuotations.length} quotation(s)`}
            {viewMode === 'quotation-detail' && `Created on ${selectedQuotation ? new Date(selectedQuotation.createdAt).toLocaleDateString() : ''}`}
          </p>
        </div>
      </div>
      
      {/* Companies View */}
      {viewMode === 'companies' && (
        <>
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by company or RUC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Company Cards */}
          {filteredCompanyGroups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium text-muted-foreground">No quotations yet</p>
                <p className="text-sm text-muted-foreground">Create your first quotation to see it here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCompanyGroups.map(group => (
                <Card 
                  key={group.companyId}
                  className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                  onClick={() => handleCompanyClick(group.companyId)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{group.companyName}</h3>
                          <p className="text-sm text-muted-foreground">{group.companyRuc}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Quoted</p>
                        <p className="text-lg font-bold text-primary">
                          {systemSettings.currency}{group.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quotations</p>
                        <p className="text-lg font-bold">{group.quotationCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Company Detail View */}
      {viewMode === 'company-detail' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Min"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-24"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-24"
              />
            </div>
            {(dateFilter || minAmount || maxAmount) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => { setDateFilter(''); setMinAmount(''); setMaxAmount(''); }}
              >
                Clear filters
              </Button>
            )}
          </div>
          
          {/* Quotation Cards */}
          {companyQuotations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium text-muted-foreground">No quotations found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {companyQuotations.map(quotation => (
                <Card 
                  key={quotation.id}
                  className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                  onClick={() => handleQuotationClick(quotation)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{quotation.quotationNumber}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(quotation.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-lg font-bold text-primary">
                          {systemSettings.currency}{quotation.total.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Items</p>
                        <p className="text-lg font-bold">{quotation.items.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Quotation Detail View */}
      {viewMode === 'quotation-detail' && selectedQuotation && (
        <>
          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button onClick={() => handleExportPDF(selectedQuotation)}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => handleDuplicate(selectedQuotation.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
          </div>
          
          {/* Quotation Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quotation Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div>
                  <span className="text-sm text-muted-foreground">Company</span>
                  <p className="font-medium">{selectedQuotation.companyName}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">RUC</span>
                  <p className="font-medium">{selectedQuotation.companyRuc}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Seller</span>
                  <p className="font-medium">{selectedQuotation.seller}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Validity</span>
                  <p className="font-medium">{selectedQuotation.validity} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Int. Code</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedQuotation.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.internalCode || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{item.partNumber || '-'}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {systemSettings.currency}{item.unitPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {systemSettings.currency}{item.total.toFixed(2)}
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
                    <span>{systemSettings.currency}{selectedQuotation.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IGV ({systemSettings.igvPercentage}%)</span>
                    <span>{systemSettings.currency}{selectedQuotation.igv.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{systemSettings.currency}{selectedQuotation.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
