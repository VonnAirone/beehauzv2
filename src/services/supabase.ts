import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fqjmdvvbikawuacolpyu.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxam1kdnZiaWthd3VhY29scHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTA5NjksImV4cCI6MjA3NTIyNjk2OX0.6U_JNK6T2P1K6OQ02g0hApcWdymfVUr4tgL7QSGGAiw';

// Create Supabase client with AsyncStorage for persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types for better TypeScript support
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          user_type: 'tenant' | 'owner';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          user_type: 'tenant' | 'owner';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          user_type?: 'tenant' | 'owner';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}