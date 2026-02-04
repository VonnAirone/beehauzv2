import { supabase, Database } from './supabase';
import { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { AdminAccessManager } from './adminAccessManager';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  userType: 'owner' | 'tenant';
}

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  userType: 'owner' | 'tenant' | 'admin';
  emailVerified: boolean;
  createdAt: string;
  // Additional profile fields
  phone: string | null;
  address: string | null;
  university: string | null;
  yearLevel: string | null;
  dateOfBirth: string | null;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  user_type: 'tenant' | 'owner' | 'admin';
  phone: string | null;
  address: string | null;
  university: string | null;
  year_level: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

class SupabaseAuthService {
  
  // Convert Supabase user + profile to our User interface
  private mapToUser(supabaseUser: SupabaseUser, profile?: Profile | null): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      fullName: profile?.full_name || null,
      userType: profile?.user_type || 'tenant',
      emailVerified: supabaseUser.email_confirmed_at !== null,
      createdAt: supabaseUser.created_at || '',
      // Additional profile fields
      phone: profile?.phone || null,
      address: profile?.address || null,
      university: profile?.university || null,
      yearLevel: profile?.year_level || null,
      dateOfBirth: profile?.date_of_birth || null,
    };
  }

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // Get current user with profile
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // Get user profile from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return this.mapToUser(user, profile);
  }

  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Check for admin credentials first (before Supabase auth)
      const isAdminLogin = await AdminAccessManager.checkAdminCredentials(
        credentials.email, 
        credentials.password
      );

      // If admin login, return success without Supabase auth
      if (isAdminLogin) {
        const adminUser: User = {
          id: 'admin-user',
          email: credentials.email,
          fullName: 'System Administrator',
          userType: 'admin',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          phone: null,
          address: null,
          university: null,
          yearLevel: null,
          dateOfBirth: null,
        };
        return { success: true, user: adminUser };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          success: false,
          error: this.formatAuthError(error),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Login failed. Please try again.',
        };
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const user = this.mapToUser(data.user, profile);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during login.',
      };
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            user_type: data.userType,
          }
        }
      });

      if (authError) {
        return {
          success: false,
          error: this.formatAuthError(authError),
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Registration failed. Please try again.',
        };
      }

      // Step 2: Create profile (this should be handled by a database trigger in production)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          user_type: data.userType,
        });

      if (profileError) {
        if (__DEV__) console.warn('Profile creation failed:', profileError);
        // Continue anyway as the auth user was created successfully
      }

      // Get the created profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      const user = this.mapToUser(authData.user, profile);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during registration.',
      };
    }
  }

  // Logout
  async logout(): Promise<AuthResponse> {
    try {
      // Clear admin access on logout
      await AdminAccessManager.clearAdminAccess();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: this.formatAuthError(error),
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during logout.',
      };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app://reset-password', // Configure this for your app
      });

      if (error) {
        return {
          success: false,
          error: this.formatAuthError(error),
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred while sending reset email.',
      };
    }
  }

  // Listen to auth changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const user = this.mapToUser(session.user, profile);
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // Format Supabase auth errors to user-friendly messages
  private formatAuthError(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link before signing in.';
      case 'User already registered':
        return 'An account with this email already exists. Please try logging in instead.';
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.';
      case 'Invalid email':
        return 'Please enter a valid email address.';
      case 'Signup is disabled':
        return 'New registrations are currently disabled. Please contact support.';
      default:
        return error.message || 'An authentication error occurred.';
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<{
    fullName: string;
    phone: string;
    address: string;
    university: string;
    yearLevel: string;
    dateOfBirth: string;
  }>): Promise<{ success: boolean; error?: string }> {
    try {
      const profileUpdates: any = {};
      
      if (updates.fullName !== undefined) profileUpdates.full_name = updates.fullName;
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
      if (updates.address !== undefined) profileUpdates.address = updates.address;
      if (updates.university !== undefined) profileUpdates.university = updates.university;
      if (updates.yearLevel !== undefined) profileUpdates.year_level = updates.yearLevel;
      if (updates.dateOfBirth !== undefined) profileUpdates.date_of_birth = updates.dateOfBirth;
      
      profileUpdates.updated_at = new Date().toISOString();

      if (__DEV__) {
        console.log('Updating profile with data:', profileUpdates);
        console.log('User ID:', userId);
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId)
        .select();

      if (error) {
        if (__DEV__) console.error('Supabase update error:', error);
        return {
          success: false,
          error: `Database error: ${error.message}`,
        };
      }

      return { success: true };
    } catch (error) {
      if (__DEV__) console.error('Unexpected error in updateProfile:', error);
      return {
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService();