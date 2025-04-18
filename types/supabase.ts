export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          alias: string
          is_vegan: boolean
          participates_in_herb: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          alias: string
          is_vegan?: boolean
          participates_in_herb?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          alias?: string
          is_vegan?: boolean
          participates_in_herb?: boolean
          created_at?: string
        }
      }
      gatherings: {
        Row: {
          id: string
          title: string
          date: string
          host_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          host_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          host_id?: string | null
          created_at?: string
        }
      }
      gathering_participants: {
        Row: {
          gathering_id: string
          user_id: string
        }
        Insert: {
          gathering_id: string
          user_id: string
        }
        Update: {
          gathering_id?: string
          user_id?: string
        }
      }
      expenses: {
        Row: {
          id: string
          gathering_id: string
          description: string
          amount: number
          category: string
          paid_by_id: string
          is_meat: boolean | null
          date: string
        }
        Insert: {
          id?: string
          gathering_id: string
          description: string
          amount: number
          category: string
          paid_by_id: string
          is_meat?: boolean | null
          date?: string
        }
        Update: {
          id?: string
          gathering_id?: string
          description?: string
          amount?: number
          category?: string
          paid_by_id?: string
          is_meat?: boolean | null
          date?: string
        }
      }
      expense_participants: {
        Row: {
          expense_id: string
          user_id: string
        }
        Insert: {
          expense_id: string
          user_id: string
        }
        Update: {
          expense_id?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

