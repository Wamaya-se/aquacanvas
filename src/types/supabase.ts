export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      discount_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_amount_cents: number | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          stripe_coupon_id: string
          stripe_promo_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_amount_cents?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          stripe_coupon_id: string
          stripe_promo_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_amount_cents?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          stripe_coupon_id?: string
          stripe_promo_id?: string | null
        }
        Relationships: []
      }
      environment_previews: {
        Row: {
          ai_cost_time_ms: number | null
          ai_task_id: string | null
          created_at: string
          id: string
          image_path: string | null
          metadata: Json | null
          order_id: string
          scene_id: string
          status: Database["public"]["Enums"]["preview_status"]
        }
        Insert: {
          ai_cost_time_ms?: number | null
          ai_task_id?: string | null
          created_at?: string
          id?: string
          image_path?: string | null
          metadata?: Json | null
          order_id: string
          scene_id: string
          status?: Database["public"]["Enums"]["preview_status"]
        }
        Update: {
          ai_cost_time_ms?: number | null
          ai_task_id?: string | null
          created_at?: string
          id?: string
          image_path?: string | null
          metadata?: Json | null
          order_id?: string
          scene_id?: string
          status?: Database["public"]["Enums"]["preview_status"]
        }
        Relationships: [
          {
            foreignKeyName: "environment_previews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environment_previews_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "environment_scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      environment_scenes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_path: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_path: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          created_at: string
          id: string
          image_path: string
          metadata: Json | null
          order_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_path: string
          metadata?: Json | null
          order_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_path?: string
          metadata?: Json | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_images_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          ai_cost_time_ms: number | null
          ai_model: string | null
          ai_task_id: string | null
          created_at: string
          customer_email: string | null
          discount_code_id: string | null
          format_id: string | null
          generated_image_path: string | null
          guest_session_id: string | null
          id: string
          locale: string
          orientation: string | null
          original_image_path: string | null
          price_cents: number | null
          product_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          stripe_session_id: string | null
          style_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_cost_time_ms?: number | null
          ai_model?: string | null
          ai_task_id?: string | null
          created_at?: string
          customer_email?: string | null
          discount_code_id?: string | null
          format_id?: string | null
          generated_image_path?: string | null
          guest_session_id?: string | null
          id?: string
          locale?: string
          orientation?: string | null
          original_image_path?: string | null
          price_cents?: number | null
          product_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_session_id?: string | null
          style_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_cost_time_ms?: number | null
          ai_model?: string | null
          ai_task_id?: string | null
          created_at?: string
          customer_email?: string | null
          discount_code_id?: string | null
          format_id?: string | null
          generated_image_path?: string | null
          guest_session_id?: string | null
          id?: string
          locale?: string
          orientation?: string | null
          original_image_path?: string | null
          price_cents?: number | null
          product_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_session_id?: string | null
          style_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "print_formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "styles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      print_formats: {
        Row: {
          created_at: string
          description: string | null
          format_type: string
          height_cm: number
          id: string
          is_active: boolean
          name: string
          orientation: string
          price_cents: number
          slug: string
          sort_order: number
          width_cm: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          format_type?: string
          height_cm: number
          id?: string
          is_active?: boolean
          name: string
          orientation?: string
          price_cents?: number
          slug: string
          sort_order?: number
          width_cm: number
        }
        Update: {
          created_at?: string
          description?: string | null
          format_type?: string
          height_cm?: number
          id?: string
          is_active?: boolean
          name?: string
          orientation?: string
          price_cents?: number
          slug?: string
          sort_order?: number
          width_cm?: number
        }
        Relationships: []
      }
      processed_stripe_events: {
        Row: {
          event_id: string
          event_type: string
          processed_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          processed_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          processed_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          body: string | null
          created_at: string
          description: string | null
          example_after: string | null
          example_before: string | null
          faq: Json | null
          headline: string
          hero_image_url: string | null
          id: string
          is_active: boolean
          name: string
          price_cents: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          style_id: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          description?: string | null
          example_after?: string | null
          example_before?: string | null
          faq?: Json | null
          headline: string
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_cents?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          style_id: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          description?: string | null
          example_after?: string | null
          example_before?: string | null
          faq?: Json | null
          headline?: string
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          style_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "styles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          body: string
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          locale: string
          order_id: string | null
          product_id: string
          rating: number
          status: Database["public"]["Enums"]["review_status"]
          title: string | null
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          locale?: string
          order_id?: string | null
          product_id: string
          rating: number
          status?: Database["public"]["Enums"]["review_status"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          locale?: string
          order_id?: string | null
          product_id?: string
          rating?: number
          status?: Database["public"]["Enums"]["review_status"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      styles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          model_id: string
          name: string
          price_cents: number
          prompt_template: string
          slug: string
          sort_order: number
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          model_id: string
          name: string
          price_cents?: number
          prompt_template: string
          slug: string
          sort_order?: number
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          model_id?: string
          name?: string
          price_cents?: number
          prompt_template?: string
          slug?: string
          sort_order?: number
          thumbnail_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_discount_uses: {
        Args: { discount_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      order_status: "created" | "processing" | "generated" | "paid" | "shipped"
      preview_status: "pending" | "processing" | "success" | "fail"
      review_status: "pending" | "approved" | "rejected"
      user_role: "customer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      order_status: ["created", "processing", "generated", "paid", "shipped"],
      preview_status: ["pending", "processing", "success", "fail"],
      user_role: ["customer", "admin"],
    },
  },
} as const

// ──────────────────────────────────────────────────────────────────────
// Convenience type aliases — keep in sync with `Database['public']['Enums']`.
// These are exported separately so existing imports across the codebase keep
// working without rewriting every call site to `Database['public']['Enums'][…]`.
// ──────────────────────────────────────────────────────────────────────

export type OrderStatus = Database['public']['Enums']['order_status']
export type UserRole = Database['public']['Enums']['user_role']
export type PreviewStatus = Database['public']['Enums']['preview_status']

// Orientation is a domain-level constraint enforced at the application layer
// (validators/order.ts) — the DB column is plain `text`. Kept here so the
// type is shared.
export type Orientation = 'portrait' | 'landscape' | 'square'
