export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          plan: "free" | "intermediate" | "premium"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          plan?: "free" | "intermediate" | "premium"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          plan?: "free" | "intermediate" | "premium"
          created_at?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          description: string | null
          phone: string | null
          address: string | null
          hours: string | null
          website: string | null
          theme: "clasico" | "moderno" | "elegante" | "colorido" | "rustico" | "premium"
          logo_url: string | null
          is_active: boolean
          features: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          description?: string | null
          phone?: string | null
          address?: string | null
          hours?: string | null
          website?: string | null
          theme?: "clasico" | "moderno" | "elegante" | "colorido" | "rustico" | "premium"
          logo_url?: string | null
          is_active?: boolean
          features?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          description?: string | null
          phone?: string | null
          address?: string | null
          hours?: string | null
          website?: string | null
          theme?: "clasico" | "moderno" | "elegante" | "colorido" | "rustico" | "premium"
          logo_url?: string | null
          is_active?: boolean
          features?: Json
          created_at?: string
          updated_at?: string
        }
      }
      menu_categories: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          icon: string
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          icon?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          icon?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          restaurant_id: string
          category_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          ingredients: string[] | null
          allergens: string[] | null
          is_featured: boolean
          is_available: boolean
          sort_order: number
          views: number
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          category_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          ingredients?: string[] | null
          allergens?: string[] | null
          is_featured?: boolean
          is_available?: boolean
          sort_order?: number
          views?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          category_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          ingredients?: string[] | null
          allergens?: string[] | null
          is_featured?: boolean
          is_available?: boolean
          sort_order?: number
          views?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      menu_analytics: {
        Row: {
          id: string
          restaurant_id: string
          item_id: string | null
          event_type: string
          user_agent: string | null
          ip_address: string | null
          referrer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          item_id?: string | null
          event_type: string
          user_agent?: string | null
          ip_address?: string | null
          referrer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          item_id?: string | null
          event_type?: string
          user_agent?: string | null
          ip_address?: string | null
          referrer?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: "free" | "intermediate" | "premium"
          status: string
          current_period_start: string | null
          current_period_end: string | null
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: "free" | "intermediate" | "premium"
          status: string
          current_period_start?: string | null
          current_period_end?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: "free" | "intermediate" | "premium"
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscription_history: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          event_type: string
          from_plan: "free" | "intermediate" | "premium" | null
          to_plan: "free" | "intermediate" | "premium" | null
          amount: number | null
          currency: string | null
          billing_cycle: string | null
          reason: string | null
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          source: string | null
          effective_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          event_type: string
          from_plan?: "free" | "intermediate" | "premium" | null
          to_plan?: "free" | "intermediate" | "premium" | null
          amount?: number | null
          currency?: string | null
          billing_cycle?: string | null
          reason?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          source?: string | null
          effective_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          event_type?: string
          from_plan?: "free" | "intermediate" | "premium" | null
          to_plan?: "free" | "intermediate" | "premium" | null
          amount?: number | null
          currency?: string | null
          billing_cycle?: string | null
          reason?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          source?: string | null
          effective_date?: string
          created_at?: string
        }
      }
      user_activity_log: {
        Row: {
          id: string
          user_id: string
          event_type: string
          event_category: string
          description: string | null
          resource_id: string | null
          resource_type: string | null
          old_values: Json | null
          new_values: Json | null
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          event_category: string
          description?: string | null
          resource_id?: string | null
          resource_type?: string | null
          old_values?: Json | null
          new_values?: Json | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          event_category?: string
          description?: string | null
          resource_id?: string | null
          resource_type?: string | null
          old_values?: Json | null
          new_values?: Json | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          created_at?: string
        }
      }
      usage_metrics: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string | null
          period_start: string
          period_end: string
          period_type: string
          menu_views: number
          menu_items_created: number
          menu_items_updated: number
          categories_created: number
          qr_downloads: number
          menu_shares: number
          plan_limit_items: number | null
          plan_limit_restaurants: number | null
          current_items_count: number
          current_restaurants_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id?: string | null
          period_start: string
          period_end: string
          period_type: string
          menu_views?: number
          menu_items_created?: number
          menu_items_updated?: number
          categories_created?: number
          qr_downloads?: number
          menu_shares?: number
          plan_limit_items?: number | null
          plan_limit_restaurants?: number | null
          current_items_count?: number
          current_restaurants_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string | null
          period_start?: string
          period_end?: string
          period_type?: string
          menu_views?: number
          menu_items_created?: number
          menu_items_updated?: number
          categories_created?: number
          qr_downloads?: number
          menu_shares?: number
          plan_limit_items?: number | null
          plan_limit_restaurants?: number | null
          current_items_count?: number
          current_restaurants_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_item_views: {
        Args: {
          item_uuid: string
        }
        Returns: undefined
      }
      log_subscription_change: {
        Args: {
          p_user_id: string
          p_subscription_id: string
          p_event_type: string
          p_from_plan?: "free" | "intermediate" | "premium" | null
          p_to_plan?: "free" | "intermediate" | "premium" | null
          p_amount?: number | null
          p_reason?: string | null
          p_metadata?: Json
        }
        Returns: string
      }
      log_user_activity: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_event_category: string
          p_description?: string | null
          p_resource_id?: string | null
          p_resource_type?: string | null
          p_old_values?: Json | null
          p_new_values?: Json | null
          p_metadata?: Json
        }
        Returns: string
      }
      update_usage_metrics: {
        Args: {
          p_user_id: string
          p_restaurant_id?: string | null
          p_metric_type: string
          p_increment?: number
        }
        Returns: undefined
      }
    }
    Enums: {
      plan_type: "free" | "intermediate" | "premium"
      menu_theme: "clasico" | "moderno" | "elegante" | "colorido" | "rustico" | "premium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
