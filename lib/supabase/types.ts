export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          name: string
          country_id: string
          flag: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          country_id: string
          flag: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          country_id?: string
          flag?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          name: string
          location: string
          description: string | null
          duration: string
          activity_type: string
          image_url: string | null
          physical_rating: number
          scenic_rating: number
          cultural_rating: number
          is_scheduled: boolean
          scheduled_date: string | null
          scheduled_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          name: string
          location: string
          description?: string | null
          duration: string
          activity_type: string
          image_url?: string | null
          physical_rating?: number
          scenic_rating?: number
          cultural_rating?: number
          is_scheduled?: boolean
          scheduled_date?: string | null
          scheduled_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          name?: string
          location?: string
          description?: string | null
          duration?: string
          activity_type?: string
          image_url?: string | null
          physical_rating?: number
          scenic_rating?: number
          cultural_rating?: number
          is_scheduled?: boolean
          scheduled_date?: string | null
          scheduled_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
