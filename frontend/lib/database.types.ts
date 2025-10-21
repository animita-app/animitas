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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      candles: {
        Row: {
          backgroundColor: string
          createdAt: string
          duration: Database["public"]["Enums"]["CandleDuration"]
          expiresAt: string
          flameStyle: string
          id: string
          isActive: boolean
          litAt: string
          memorialId: string
          message: string | null
          standStyle: string
          stickStyle: string
          userId: string
        }
        Insert: {
          backgroundColor?: string
          createdAt?: string
          duration: Database["public"]["Enums"]["CandleDuration"]
          expiresAt: string
          flameStyle?: string
          id: string
          isActive?: boolean
          litAt?: string
          memorialId: string
          message?: string | null
          standStyle?: string
          stickStyle?: string
          userId: string
        }
        Update: {
          backgroundColor?: string
          createdAt?: string
          duration?: Database["public"]["Enums"]["CandleDuration"]
          expiresAt?: string
          flameStyle?: string
          id?: string
          isActive?: boolean
          litAt?: string
          memorialId?: string
          message?: string | null
          standStyle?: string
          stickStyle?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "candles_memorialId_fkey"
            columns: ["memorialId"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
      memorial_images: {
        Row: {
          id: string
          memorialId: string
          uploadedAt: string
          url: string
        }
        Insert: {
          id: string
          memorialId: string
          uploadedAt?: string
          url: string
        }
        Update: {
          id?: string
          memorialId?: string
          uploadedAt?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "memorial_images_memorialId_fkey"
            columns: ["memorialId"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
      memorial_list_items: {
        Row: {
          addedById: string
          createdAt: string
          id: string
          listId: string
          memorialId: string
        }
        Insert: {
          addedById: string
          createdAt?: string
          id: string
          listId: string
          memorialId: string
        }
        Update: {
          addedById?: string
          createdAt?: string
          id?: string
          listId?: string
          memorialId?: string
        }
        Relationships: [
          {
            foreignKeyName: "memorial_list_items_listId_fkey"
            columns: ["listId"]
            isOneToOne: false
            referencedRelation: "memorial_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_list_items_memorialId_fkey"
            columns: ["memorialId"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
      memorial_lists: {
        Row: {
          createdAt: string
          createdById: string
          description: string | null
          id: string
          isPublic: boolean
          name: string
          thumbnailPicture: string | null
          updatedAt: string
          viewCount: number
        }
        Insert: {
          createdAt?: string
          createdById: string
          description?: string | null
          id: string
          isPublic?: boolean
          name: string
          thumbnailPicture?: string | null
          updatedAt: string
          viewCount?: number
        }
        Update: {
          createdAt?: string
          createdById?: string
          description?: string | null
          id?: string
          isPublic?: boolean
          name?: string
          thumbnailPicture?: string | null
          updatedAt?: string
          viewCount?: number
        }
        Relationships: []
      }
      memorial_people: {
        Row: {
          createdAt: string
          memorialId: string
          personId: string
        }
        Insert: {
          createdAt?: string
          memorialId: string
          personId: string
        }
        Update: {
          createdAt?: string
          memorialId?: string
          personId?: string
        }
        Relationships: [
          {
            foreignKeyName: "memorial_people_memorialId_fkey"
            columns: ["memorialId"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_people_personId_fkey"
            columns: ["personId"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      memorials: {
        Row: {
          createdAt: string
          createdById: string
          id: string
          isPublic: boolean
          lat: number
          lng: number
          name: string
          slug: string
          story: string | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          createdById: string
          id: string
          isPublic?: boolean
          lat: number
          lng: number
          name: string
          slug: string
          story?: string | null
          updatedAt: string
        }
        Update: {
          createdAt?: string
          createdById?: string
          id?: string
          isPublic?: boolean
          lat?: number
          lng?: number
          name?: string
          slug?: string
          story?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          birthDate: string | null
          birthPlace: string | null
          createdAt: string
          deathDate: string | null
          deathPlace: string | null
          id: string
          image: string | null
          name: string
          updatedAt: string
        }
        Insert: {
          birthDate?: string | null
          birthPlace?: string | null
          createdAt?: string
          deathDate?: string | null
          deathPlace?: string | null
          id: string
          image?: string | null
          name: string
          updatedAt: string
        }
        Update: {
          birthDate?: string | null
          birthPlace?: string | null
          createdAt?: string
          deathDate?: string | null
          deathPlace?: string | null
          id?: string
          image?: string | null
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      testimonies: {
        Row: {
          content: string
          createdAt: string
          id: string
          images: string[] | null
          isPublic: boolean
          memorialId: string
          updatedAt: string
          userId: string
        }
        Insert: {
          content: string
          createdAt?: string
          id: string
          images?: string[] | null
          isPublic?: boolean
          memorialId: string
          updatedAt: string
          userId: string
        }
        Update: {
          content?: string
          createdAt?: string
          id?: string
          images?: string[] | null
          isPublic?: boolean
          memorialId?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonies_memorialId_fkey"
            columns: ["memorialId"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          image: string | null
          phone: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          image?: string | null
          phone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          image?: string | null
          phone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          code: string
          createdAt: string
          expiresAt: string
          id: string
          phone: string
          userId: string | null
          verified: boolean
        }
        Insert: {
          code: string
          createdAt?: string
          expiresAt: string
          id: string
          phone: string
          userId?: string | null
          verified?: boolean
        }
        Update: {
          code?: string
          createdAt?: string
          expiresAt?: string
          id?: string
          phone?: string
          userId?: string | null
          verified?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      CandleDuration: "ONE_DAY" | "THREE_DAYS" | "SEVEN_DAYS"
      UserRole: "FREE" | "PREMIUM" | "ADMIN"
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
  public: {
    Enums: {
      CandleDuration: ["ONE_DAY", "THREE_DAYS", "SEVEN_DAYS"],
      UserRole: ["FREE", "PREMIUM", "ADMIN"],
    },
  },
} as const
