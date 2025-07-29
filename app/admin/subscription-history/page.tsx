"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Calendar, Activity, BarChart3, Download, Filter } from "lucide-react"
import { useSubscriptionTracking } from "@/lib/subscription-tracking"
import { supabase } from "@/lib/supabase"

interface SubscriptionHistoryItem {
  id: string
  event_type: string
  from_plan: string | null
  to_plan: string | null
  amount: number | null
  currency: string | null
  reason: string | null
  effective_date: string
  created_at: string
}

interface ActivityLogItem {
  id: string
  event_type: string
  event_category: string
  description: string | null
  resource_type: string | null
  created_at: string
}

interface UsageMetrics {
  menu_views: number
  menu_items_created: number
  menu_items_updated: number
  categories_created: number
  current_items_count: number
  current_restaurants_count: number
  plan_limit_items: number | null
  plan_limit_restaurants: number | null
}

export default function SubscriptionHistoryPage() {
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryItem[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([])
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const { getSubscriptionHistory, getUserActivityLog, getUsageMetrics } = useSubscriptionTracking()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!supabase) return

    try {
      // Obtener usuario actual
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (!currentUser) return

      setUser(currentUser)

      // Cargar datos en paralelo
      const [historyData, activityData, metricsData] = await Promise.all([
        getSubscriptionHistory(currentUser.id),
        getUserActivityLog(currentUser.id),
        getUsageMetrics(currentUser.id),
      ])

      setSubscriptionHistory(historyData)
      setActivityLog(activityData)
      setUsageMetrics(metricsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case "subscription_created":
      case "subscription_upgraded":
        return "bg-green-100 text-green-800"
      case "subscription_downgraded":
      case "subscription_cancelled":
        return "bg-red-100 text-red-800"
      case "payment_succeeded":
        return "bg-blue-100 text-blue-800"
      case "payment_failed":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "auth":
        return "🔐"
      case "menu":
        return "🍽️"
      case "subscription":
        return "💳"
      case "profile":
        return "👤"
      case "admin":
        return "⚙️"
      case "api":
        return "🔌"
      default:
        return "📝"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateProgress = (current: number, limit: number | null) => {
    if (!limit) return 0
    return Math.min((current / limit) * 100, 100)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Historial y Métricas</h1>
          <p className="text-muted-foreground">Seguimiento completo de tu actividad y uso de la plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas de uso */}
      {usageMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Restaurantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usageMetrics.current_restaurants_count}
                {usageMetrics.plan_limit_restaurants && (
                  <span className="text-sm text-muted-foreground">/{usageMetrics.plan_limit_restaurants}</span>
                )}
              </div>
              {usageMetrics.plan_limit_restaurants && (
                <Progress
                  value={calculateProgress(usageMetrics.current_restaurants_count, usageMetrics.plan_limit_restaurants)}
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Items de Menú</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usageMetrics.current_items_count}
                {usageMetrics.plan_limit_items && (
                  <span className="text-sm text-muted-foreground">/{usageMetrics.plan_limit_items}</span>
                )}
              </div>
              {usageMetrics.plan_limit_items && (
                <Progress
                  value={calculateProgress(usageMetrics.current_items_count, usageMetrics.plan_limit_items)}
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vistas del Menú</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageMetrics.menu_views}</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Items Creados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageMetrics.menu_items_created}</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Actividad Reciente
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Historial de Suscripción
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Log de Actividad</CardTitle>
              <CardDescription>Registro detallado de todas tus acciones en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLog.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay actividad registrada</p>
                ) : (
                  activityLog.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="text-2xl">{getCategoryIcon(activity.event_category)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.event_category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{formatDate(activity.created_at)}</span>
                        </div>
                        <p className="text-sm font-medium">{activity.event_type}</p>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Suscripción</CardTitle>
              <CardDescription>Registro de cambios en tu plan y pagos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptionHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay historial de suscripción</p>
                ) : (
                  subscriptionHistory.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="text-2xl">💳</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getEventBadgeColor(item.event_type)}>{item.event_type}</Badge>
                          <span className="text-sm text-muted-foreground">{formatDate(item.effective_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.from_plan && item.to_plan && (
                            <span className="text-sm">
                              {item.from_plan} → {item.to_plan}
                            </span>
                          )}
                          {item.amount && (
                            <span className="text-sm font-medium">
                              ${item.amount} {item.currency}
                            </span>
                          )}
                        </div>
                        {item.reason && <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Uso Mensual</CardTitle>
                <CardDescription>Actividad durante este mes</CardDescription>
              </CardHeader>
              <CardContent>
                {usageMetrics ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Items creados</span>
                      <span className="font-medium">{usageMetrics.menu_items_created}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Items actualizados</span>
                      <span className="font-medium">{usageMetrics.menu_items_updated}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Categorías creadas</span>
                      <span className="font-medium">{usageMetrics.categories_created}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Vistas del menú</span>
                      <span className="font-medium">{usageMetrics.menu_views}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No hay datos disponibles</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Límites del Plan</CardTitle>
                <CardDescription>Uso actual vs límites disponibles</CardDescription>
              </CardHeader>
              <CardContent>
                {usageMetrics ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Restaurantes</span>
                        <span className="text-sm text-muted-foreground">
                          {usageMetrics.current_restaurants_count}/{usageMetrics.plan_limit_restaurants || "∞"}
                        </span>
                      </div>
                      <Progress
                        value={calculateProgress(
                          usageMetrics.current_restaurants_count,
                          usageMetrics.plan_limit_restaurants,
                        )}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Items de menú</span>
                        <span className="text-sm text-muted-foreground">
                          {usageMetrics.current_items_count}/{usageMetrics.plan_limit_items || "∞"}
                        </span>
                      </div>
                      <Progress
                        value={calculateProgress(usageMetrics.current_items_count, usageMetrics.plan_limit_items)}
                        className="h-2"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No hay datos disponibles</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
