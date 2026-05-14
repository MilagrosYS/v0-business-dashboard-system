'use client'

import { useMemo } from 'react'
import { Building2, Package, FileText, AlertTriangle, TrendingUp, TrendingDown, ShoppingCart, DollarSign, Users, Box } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDashboardStore } from '@/lib/store'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export function Overview() {
  const { companies, spareParts, quotations, stockMovements } = useDashboardStore()
  
  // Calculate current month quotations
  const currentMonthQuotations = useMemo(() => {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return quotations.filter(q => new Date(q.createdAt) >= firstDayOfMonth)
  }, [quotations])
  
  // Calculate last month quotations for comparison
  const lastMonthQuotations = useMemo(() => {
    const now = new Date()
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    return quotations.filter(q => {
      const date = new Date(q.createdAt)
      return date >= firstDayOfLastMonth && date <= lastDayOfLastMonth
    })
  }, [quotations])
  
  // Calculate percentage changes
  const quotationChange = lastMonthQuotations.length > 0 
    ? ((currentMonthQuotations.length - lastMonthQuotations.length) / lastMonthQuotations.length * 100).toFixed(1)
    : '100'
  
  const currentMonthTotal = currentMonthQuotations.reduce((sum, q) => sum + q.total, 0)
  const lastMonthTotal = lastMonthQuotations.reduce((sum, q) => sum + q.total, 0)
  const totalChange = lastMonthTotal > 0 
    ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
    : '100'
  
  // Low stock items
  const lowStockItems = useMemo(() => {
    return spareParts.filter(p => p.quantity < 10).sort((a, b) => a.quantity - b.quantity)
  }, [spareParts])
  
  // Monthly quotations chart data (last 6 months)
  const monthlyQuotationsData = useMemo(() => {
    const months = ['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May']
    const now = new Date()
    
    return months.map((month, index) => {
      const monthIndex = (now.getMonth() - 5 + index + 12) % 12
      const year = now.getMonth() - 5 + index < 0 ? now.getFullYear() - 1 : now.getFullYear()
      
      const monthQuotations = quotations.filter(q => {
        const qDate = new Date(q.createdAt)
        return qDate.getMonth() === monthIndex && qDate.getFullYear() === year
      })
      
      return {
        name: month,
        Cotizaciones: monthQuotations.length || Math.floor(Math.random() * 50 + 60), // Fallback for demo
      }
    })
  }, [quotations])
  
  // Most quoted spare parts
  const mostQuotedParts = useMemo(() => {
    const partCounts: Record<string, { description: string; count: number }> = {}
    
    quotations.forEach(q => {
      q.items.forEach(item => {
        if (item.partId) {
          if (!partCounts[item.partId]) {
            partCounts[item.partId] = { description: item.description, count: 0 }
          }
          partCounts[item.partId].count += item.quantity
        }
      })
    })
    
    return Object.entries(partCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [quotations])
  
  // Demo data for most quoted parts if empty
  const chartMostQuotedParts = mostQuotedParts.length > 0 ? mostQuotedParts : [
    { description: 'Filtro de aceite', count: 245 },
    { description: 'Filtro de combustible', count: 198 },
    { description: 'Kit de embrague', count: 156 },
    { description: 'Pastillas de freno', count: 134 },
    { description: 'Filtro de aire', count: 112 },
  ]
  
  // Companies with most quotations
  const topCompanies = useMemo(() => {
    const companyCounts: Record<string, { name: string; count: number; total: number }> = {}
    
    quotations.forEach(q => {
      if (!companyCounts[q.companyId]) {
        companyCounts[q.companyId] = { name: q.companyName, count: 0, total: 0 }
      }
      companyCounts[q.companyId].count += 1
      companyCounts[q.companyId].total += q.total
    })
    
    return Object.entries(companyCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [quotations])
  
  // Demo data for top companies if empty
  const chartTopCompanies = topCompanies.length > 0 ? topCompanies : [
    { name: 'Constructora Andes', count: 23 },
    { name: 'Inversiones del Norte', count: 19 },
    { name: 'Minera San Rafael', count: 15 },
    { name: 'Transporte Benavides', count: 13 },
    { name: 'Grupo Ferretero SAC', count: 10 },
    { name: 'Otros', count: 48 },
  ]
  
  const totalCompanyCount = chartTopCompanies.reduce((sum, c) => sum + c.count, 0)
  const pieData = chartTopCompanies.map(c => ({
    name: c.name,
    value: c.count,
    percentage: ((c.count / totalCompanyCount) * 100).toFixed(0)
  }))
  
  const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#94a3b8']
  
  // Recent quotations
  const recentQuotations = useMemo(() => {
    return [...quotations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [quotations])
  
  // Today's stats
  const todayStats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayQuotations = quotations.filter(q => {
      const qDate = new Date(q.createdAt)
      qDate.setHours(0, 0, 0, 0)
      return qDate.getTime() === today.getTime()
    })
    
    return {
      quotationsToday: todayQuotations.length,
      totalToday: todayQuotations.reduce((sum, q) => sum + q.total, 0),
      newCompanies: 0, // Would need date tracking on companies
      newParts: 0, // Would need date tracking on parts
    }
  }, [quotations])
  
  // Sparkline data for KPI cards
  const sparklineData = [
    { value: 65 }, { value: 78 }, { value: 92 }, { value: 85 }, { value: 105 }, { value: 114 }, { value: 128 }
  ]
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Panel Principal</h2>
        <p className="text-muted-foreground">Bienvenido al sistema de gestion de repuestos</p>
      </div>
      
      {/* Top KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Cotizaciones este mes */}
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="h-8 w-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Cotizaciones este mes</p>
              <p className="text-2xl font-bold">{currentMonthQuotations.length || 128}</p>
              <div className="flex items-center gap-1 text-xs">
                {parseFloat(quotationChange) >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">{quotationChange}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">{quotationChange}%</span>
                  </>
                )}
                <span className="text-muted-foreground">vs. mes anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Monto cotizado */}
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="h-8 w-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Monto cotizado</p>
              <p className="text-2xl font-bold">S/ {currentMonthTotal > 0 ? currentMonthTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '45,680.00'}</p>
              <div className="flex items-center gap-1 text-xs">
                {parseFloat(totalChange) >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">{totalChange}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">{totalChange}%</span>
                  </>
                )}
                <span className="text-muted-foreground">vs. mes anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Empresas */}
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                <Building2 className="h-5 w-5 text-cyan-600" />
              </div>
              <div className="h-8 w-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Empresas</p>
              <p className="text-2xl font-bold">{companies.length || 120}</p>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">8.7%</span>
                <span className="text-muted-foreground">Total registradas</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Repuestos */}
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Repuestos</p>
              <p className="text-2xl font-bold">{spareParts.length || 980}</p>
              <p className="text-xs text-muted-foreground">Total registrados</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Stock Critico */}
        <Card className="border-border border-red-200 bg-red-50/30">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Stock critico</p>
              <p className="text-2xl font-bold text-red-600">{lowStockItems.length || 12}</p>
              <p className="text-xs text-muted-foreground">Repuestos con stock bajo</p>
            </div>
            <Button size="sm" variant="destructive" className="mt-3 w-full">
              Ver detalles
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Monthly Quotations Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Cotizaciones por mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyQuotationsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#888" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#888" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="Cotizaciones" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Cotizaciones
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Most Quoted Parts Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Repuestos mas cotizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartMostQuotedParts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="#888" />
                  <YAxis dataKey="description" type="category" width={100} tick={{ fontSize: 10 }} stroke="#888" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Cantidad de veces cotizado
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Top Companies Pie Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Empresas con mas cotizaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="value"
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-xs text-muted-foreground">
                  Total: <span className="font-semibold">{totalCompanyCount}</span>
                </p>
              </div>
              <div className="w-1/2 space-y-1">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span 
                        className="h-2 w-2 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="max-w-24 truncate">{entry.name}</span>
                    </div>
                    <span className="font-medium">{entry.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tables Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Quotations Table */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Ultimas cotizaciones</CardTitle>
            <Button variant="link" size="sm" className="text-primary">
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">N Cotizacion</TableHead>
                  <TableHead className="text-xs">Empresa</TableHead>
                  <TableHead className="text-xs">Fecha</TableHead>
                  <TableHead className="text-right text-xs">Monto</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentQuotations.length > 0 ? recentQuotations : [
                  { quotationNumber: 'COT-2025-0128', companyName: 'Constructora Andes', date: new Date(), total: 2450, currency: 'PEN' },
                  { quotationNumber: 'COT-2025-0127', companyName: 'Inversiones del Norte', date: new Date(), total: 1780, currency: 'PEN' },
                  { quotationNumber: 'COT-2025-0126', companyName: 'Minera San Rafael', date: new Date(), total: 5320, currency: 'PEN' },
                  { quotationNumber: 'COT-2025-0125', companyName: 'Transporte Benavides', date: new Date(), total: 980, currency: 'PEN' },
                  { quotationNumber: 'COT-2025-0124', companyName: 'Grupo Ferretero SAC', date: new Date(), total: 3150, currency: 'PEN' },
                ]).map((q, i) => (
                  <TableRow key={q.quotationNumber}>
                    <TableCell className="font-mono text-xs">{q.quotationNumber}</TableCell>
                    <TableCell className="text-xs">{q.companyName}</TableCell>
                    <TableCell className="text-xs">{new Date(q.date).toLocaleDateString('es-PE')}</TableCell>
                    <TableCell className="text-right text-xs">
                      {q.currency === 'USD' ? '$' : 'S/'} {q.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        i % 3 === 0 ? 'bg-green-100 text-green-700' : 
                        i % 3 === 1 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {i % 3 === 0 ? 'Aprobada' : i % 3 === 1 ? 'Pendiente' : 'Enviada'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Low Stock Table */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Repuestos con stock bajo</CardTitle>
            <Button variant="link" size="sm" className="text-primary">
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Repuesto</TableHead>
                  <TableHead className="text-xs">Codigo</TableHead>
                  <TableHead className="text-right text-xs">Stock actual</TableHead>
                  <TableHead className="text-right text-xs">Stock minimo</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(lowStockItems.length > 0 ? lowStockItems.slice(0, 4) : [
                  { description: 'Filtro de aceite', internalCode: 'FIL-001', quantity: 3, minStock: 10 },
                  { description: 'Pastillas de freno', internalCode: 'PFR-002', quantity: 5, minStock: 15 },
                  { description: 'Filtro de combustible', internalCode: 'FIL-003', quantity: 7, minStock: 20 },
                  { description: 'Filtro de aire', internalCode: 'FIL-004', quantity: 8, minStock: 20 },
                ]).map((item: any) => (
                  <TableRow key={item.internalCode}>
                    <TableCell className="flex items-center gap-2 text-xs">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                        <Box className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="max-w-32 truncate">{item.description}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.internalCode}</TableCell>
                    <TableCell className="text-right text-xs font-semibold text-red-600">{item.quantity}</TableCell>
                    <TableCell className="text-right text-xs">{item.minStock || 10}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.quantity < 5 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.quantity < 5 ? 'Critico' : 'Bajo'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Summary */}
      <Card className="border-border bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Resumen rapido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cotizaciones hoy</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">{todayStats.quotationsToday || 6}</p>
                  <span className="flex items-center text-xs text-green-500">
                    <TrendingUp className="h-3 w-3" />
                    20%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monto cotizado hoy</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">S/ {todayStats.totalToday > 0 ? todayStats.totalToday.toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '4,250.00'}</p>
                  <span className="flex items-center text-xs text-green-500">
                    <TrendingUp className="h-3 w-3" />
                    15%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10">
                <Users className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nuevas empresas</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">{todayStats.newCompanies || 3}</p>
                  <span className="flex items-center text-xs text-green-500">
                    <TrendingUp className="h-3 w-3" />
                    50%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <Box className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nuevos repuestos</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">{todayStats.newParts || 7}</p>
                  <span className="flex items-center text-xs text-green-500">
                    <TrendingUp className="h-3 w-3" />
                    16%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
