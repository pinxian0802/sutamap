export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          name_en: string
          description: string | null
          color: string
          icon: string
          checkin_radius_meters: number
          xp_per_checkin: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      locations: {
        Row: {
          id: string
          category_id: string
          name: string
          name_en: string | null
          prefecture: string | null
          lat: number
          lng: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['locations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['locations']['Insert']>
      }
      user_profiles: {
        Row: {
          id: string
          username: string
          total_xp: number
          level: number
          active_title_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
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
      }
      titles: {
        Row: {
          id: string
          name: string
          description: string | null
          category_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['titles']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['titles']['Insert']>
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string
          category_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['badges']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['badges']['Insert']>
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
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_badges']['Row'], 'id' | 'earned_at'>
        Update: never
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
      }
    }
  }
}
