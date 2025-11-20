export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          profile_image_url: string | null
          followers_count: number | null
          following_count: number | null
          tweet_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          display_name?: string | null
          bio?: string | null
          profile_image_url?: string | null
          followers_count?: number | null
          following_count?: number | null
          tweet_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          profile_image_url?: string | null
          followers_count?: number | null
          following_count?: number | null
          tweet_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      analyses: {
        Row: {
          id: string
          profile_id: string
          ego_score: number
          value_score: number
          overall_score: number
          main_character_score: number | null
          humble_brag_score: number | null
          self_promotion_score: number | null
          industry: string | null
          tier: string
          tier_emoji: string
          summary: string
          most_egotistical_tweet_id: string | null
          most_egotistical_tweet_text: string | null
          most_egotistical_tweet_score: number | null
          least_egotistical_tweet_id: string | null
          least_egotistical_tweet_text: string | null
          least_egotistical_tweet_score: number | null
          tweets_analyzed: number
          analysis_date: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          ego_score: number
          value_score: number
          overall_score: number
          main_character_score?: number | null
          humble_brag_score?: number | null
          self_promotion_score?: number | null
          industry?: string | null
          tier: string
          tier_emoji: string
          summary: string
          most_egotistical_tweet_id?: string | null
          most_egotistical_tweet_text?: string | null
          most_egotistical_tweet_score?: number | null
          least_egotistical_tweet_id?: string | null
          least_egotistical_tweet_text?: string | null
          least_egotistical_tweet_score?: number | null
          tweets_analyzed: number
          analysis_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          ego_score?: number
          value_score?: number
          overall_score?: number
          main_character_score?: number | null
          humble_brag_score?: number | null
          self_promotion_score?: number | null
          industry?: string | null
          tier?: string
          tier_emoji?: string
          summary?: string
          most_egotistical_tweet_id?: string | null
          most_egotistical_tweet_text?: string | null
          most_egotistical_tweet_score?: number | null
          least_egotistical_tweet_id?: string | null
          least_egotistical_tweet_text?: string | null
          least_egotistical_tweet_score?: number | null
          tweets_analyzed?: number
          analysis_date?: string
          created_at?: string
        }
      }
    }
    Views: {
      leaderboard_overall: {
        Row: {
          username: string
          display_name: string | null
          profile_image_url: string | null
          overall_score: number
          ego_score: number
          value_score: number
          tier: string
          tier_emoji: string
          analysis_date: string
        }
      }
      leaderboard_by_industry: {
        Row: {
          username: string
          display_name: string | null
          profile_image_url: string | null
          industry: string | null
          overall_score: number
          ego_score: number
          value_score: number
          tier: string
          tier_emoji: string
          analysis_date: string
          rank: number
        }
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
