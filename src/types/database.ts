export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Views: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
    Tables: {
      themes: {
        Row: {
          uuid: string
          theme_id: string | null
          name: string
          name_en: string
          name_zh: string
          description: string | null
          color: string
          icon: string
          checkin_radius_meters: number
          xp_per_checkin: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['themes']['Row'], 'uuid' | 'created_at'>
        Update: Partial<Database['public']['Tables']['themes']['Insert']>
        Relationships: []
      }
      locations: {
        Row: {
          id: string
          theme_id: string
          name: string
          name_en: string | null
          name_zh: string | null
          prefecture: string | null
          lat: number
          lng: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['locations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['locations']['Insert']>
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          username: string
          user_code: string
          total_xp: number
          level: number
          active_title_id: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
        Relationships: []
      }
      checkins: {
        Row: {
          id: string
          user_id: string
          location_id: string
          photo_url: string
          checkin_lat: number
          checkin_lng: number
          distance_meters: number
          is_first: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['checkins']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['checkins']['Insert']>
        Relationships: []
      }
      titles: {
        Row: {
          id: string
          name: string
          name_en: string | null
          name_zh: string | null
          description: string | null
          theme_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['titles']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['titles']['Insert']>
        Relationships: []
      }
      user_titles: {
        Row: {
          id: string
          user_id: string
          title_id: string
          earned_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_titles']['Row'], 'id' | 'earned_at'>
        Update: never
        Relationships: []
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['friendships']['Row'], 'id' | 'created_at'>
        Update: Pick<Database['public']['Tables']['friendships']['Row'], 'status'>
        Relationships: []
      }
    }
    Functions: {
      get_all_map_locations: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_friends_with_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_location_counts_by_theme: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_profile_stats: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_locations_for_theme: {
        Args: { p_theme_id: string }
        Returns: Json
      }
    }
  }
}
