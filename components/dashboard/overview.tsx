'use client'

import { Building2, Package, Warehouse, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardStore } from '@/lib/store'

export function Overview() {
  const { companies, spareParts, stockMovements } = useDashboardStore()
  
  const totalStock = spareParts.reduce((sum, part) => sum + part.quantity, 0)
  const totalValue = spareParts.reduce((sum, part) => sum + (part.price * part.quantity), 0)
  const lowStockCount = spareParts.filter(part => part.quantity < 10).length
  const recentMovements = stockMovements
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
  
  const stats = [
    {
      title: 'Total Empresas',
      value: companies.length,
      icon: Building2,
      description: 'Clientes activos',
    },
    {
      title: 'Repuestos',
      value: spareParts.length,
      icon: Package,
      description: 'Catalogo de productos',
    },
    {
      title: 'Stock Total',
      value: totalStock.toLocaleString(),
      icon: Warehouse,
      description: 'Unidades en inventario',
    },
    {
      title: 'Valor del Inventario',
      value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      description: 'Total estimado',
    },
  ]
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Panel Principal</h2>
        <p className="text-muted-foreground">Bienvenido al sistema de gestion de repuestos</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="card-hover border border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Low Stock Alert */}
        <Card className="card-hover border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Alertas de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockCount > 0 ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-warning/20">
                  <Warehouse className="h-5 w-5 text-status-warning" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">{lowStockCount} items con stock bajo</p>
                  <p className="text-sm text-muted-foreground">Revisar control de inventario</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-active/20">
                  <Warehouse className="h-5 w-5 text-status-active" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">Niveles de stock saludables</p>
                  <p className="text-sm text-muted-foreground">Todos los items sobre el minimo</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card className="card-hover border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Movimientos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentMovements.length > 0 ? (
              <ul className="space-y-2">
                {recentMovements.slice(0, 3).map((movement) => (
                  <li key={movement.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-muted-foreground">{movement.partNumber}</span>
                    <span className={
                      movement.type === 'add' 
                        ? 'text-status-active' 
                        : movement.type === 'remove' 
                        ? 'text-status-inactive' 
                        : 'text-status-warning'
                    }>
                      {movement.type === 'add' && '+'}
                      {movement.type === 'remove' && '-'}
                      {movement.type === 'adjust' ? `→ ${movement.newStock}` : movement.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Sin movimientos recientes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
