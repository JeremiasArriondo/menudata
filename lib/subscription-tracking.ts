import { supabase } from "./supabase"
import type { Database } from "./database.types"

type SubscriptionHistory = Database["public"]["Tables"]["subscription_history"]["Insert"]
type UserActivityLog = Database["public"]["Tables"]["user_activity_log"]["Insert"]
type UsageMetrics = Database["public"]["Tables"]["usage_metrics"]["Row"]

export class SubscriptionTracker {
  // Registrar cambio de suscripción
  static async logSubscriptionChange(data: {
    userId: string
    subscriptionId?: string
    eventType: string
    fromPlan?: string
    toPlan?: string
    amount?: number
    reason?: string
    metadata?: any
  }) {
    if (!supabase) return null

    const { data: result, error } = await supabase.rpc("log_subscription_change", {
      p_user_id: data.userId,
      p_subscription_id: data.subscriptionId || null,
      p_event_type: data.eventType,
      p_from_plan: data.fromPlan || null,
      p_to_plan: data.toPlan || null,
      p_amount: data.amount || null,
      p_reason: data.reason || null,
      p_metadata: data.metadata || {},
    })

    if (error) {
      console.error("Error logging subscription change:", error)
      return null
    }

    return result
  }

  // Registrar actividad del usuario
  static async logUserActivity(data: {
    userId: string
    eventType: string
    eventCategory: string
    description?: string
    resourceId?: string
    resourceType?: string
    oldValues?: any
    newValues?: any
    metadata?: any
  }) {
    if (!supabase) return null

    const { data: result, error } = await supabase.rpc("log_user_activity", {
      p_user_id: data.userId,
      p_event_type: data.eventType,
      p_event_category: data.eventCategory,
      p_description: data.description || null,
      p_resource_id: data.resourceId || null,
      p_resource_type: data.resourceType || null,
      p_old_values: data.oldValues || null,
      p_new_values: data.newValues || null,
      p_metadata: data.metadata || {},
    })

    if (error) {
      console.error("Error logging user activity:", error)
      return null
    }

    return result
  }

  // Actualizar métricas de uso
  static async updateUsageMetrics(userId: string, metricType: string, restaurantId?: string, increment = 1) {
    if (!supabase) return

    const { error } = await supabase.rpc("update_usage_metrics", {
      p_user_id: userId,
      p_restaurant_id: restaurantId || null,
      p_metric_type: metricType,
      p_increment: increment,
    })

    if (error) {
      console.error("Error updating usage metrics:", error)
    }
  }

  // Obtener historial de suscripciones
  static async getSubscriptionHistory(userId: string, limit = 50) {
    if (!supabase) return []

    const { data, error } = await supabase
      .from("subscription_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching subscription history:", error)
      return []
    }

    return data || []
  }

  // Obtener log de actividad
  static async getUserActivityLog(userId: string, limit = 100) {
    if (!supabase) return []

    const { data, error } = await supabase
      .from("user_activity_log")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching user activity log:", error)
      return []
    }

    return data || []
  }

  // Obtener métricas de uso
  static async getUsageMetrics(userId: string, restaurantId?: string) {
    if (!supabase) return null

    let query = supabase
      .from("usage_metrics")
      .select("*")
      .eq("user_id", userId)
      .eq("period_type", "monthly")
      .order("period_start", { ascending: false })
      .limit(1)

    if (restaurantId) {
      query = query.eq("restaurant_id", restaurantId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching usage metrics:", error)
      return null
    }

    return data?.[0] || null
  }

  // Verificar límites del plan
  static async checkPlanLimits(userId: string, resourceType: "restaurants" | "menu_items") {
    const metrics = await this.getUsageMetrics(userId)
    if (!metrics) return { withinLimits: true, current: 0, limit: null }

    const current = resourceType === "restaurants" ? metrics.current_restaurants_count : metrics.current_items_count

    const limit = resourceType === "restaurants" ? metrics.plan_limit_restaurants : metrics.plan_limit_items

    return {
      withinLimits: limit === null || current < limit,
      current,
      limit,
    }
  }
}

// Hook para usar en componentes React
export function useSubscriptionTracking() {
  return {
    logSubscriptionChange: SubscriptionTracker.logSubscriptionChange,
    logUserActivity: SubscriptionTracker.logUserActivity,
    updateUsageMetrics: SubscriptionTracker.updateUsageMetrics,
    getSubscriptionHistory: SubscriptionTracker.getSubscriptionHistory,
    getUserActivityLog: SubscriptionTracker.getUserActivityLog,
    getUsageMetrics: SubscriptionTracker.getUsageMetrics,
    checkPlanLimits: SubscriptionTracker.checkPlanLimits,
  }
}
