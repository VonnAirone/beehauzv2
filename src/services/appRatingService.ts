import { supabase } from './supabase';

export interface AppRating {
  id?: string;
  user_id?: string;
  user_email?: string;
  rating: number; // 1-5 stars
  feedback?: string;
  trigger_type: string; // Which trigger caused the rating prompt
  user_type?: string;
  app_version?: string;
  platform?: string; // ios, android, web
  created_at?: string;
  updated_at?: string;
}

export interface RatingSubmissionData {
  rating: number;
  feedback?: string;
  trigger_type: string;
  user_email?: string; // For anonymous users
  user_type?: string;
  app_version?: string;
  platform?: string;
}

class AppRatingService {
  // Submit a new app rating
  async submitAppRating(data: RatingSubmissionData): Promise<{ success: boolean; error?: string; data?: AppRating }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user profile for additional context
      let userProfile = null;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, email')
          .eq('id', user.id)
          .single();
        userProfile = profile;
      }

      // For anonymous users, email is optional
      const userEmail = user?.email || userProfile?.email || data.user_email || null;

      const ratingData: Partial<AppRating> = {
        user_id: user?.id || undefined,
        rating: data.rating,
        feedback: data.feedback || undefined,
        trigger_type: data.trigger_type,
        user_email: userEmail,
        user_type: data.user_type || userProfile?.user_type || 'tenant',
        app_version: data.app_version || '1.0.0',
        platform: data.platform || 'mobile',
      };

      const { data: response, error } = await supabase
        .from('app_ratings')
        .insert(ratingData)
        .select()
        .single();

      if (error) {
        if (__DEV__) console.error('App rating submission error:', error);
        return {
          success: false,
          error: 'Failed to submit rating. Please try again.',
        };
      }

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      if (__DEV__) console.error('Unexpected error submitting app rating:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  // Get app ratings for current user (for admin or user history)
  async getUserAppRatings(): Promise<{ success: boolean; error?: string; data?: AppRating[] }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User must be authenticated to view ratings',
        };
      }

      const { data: ratings, error } = await supabase
        .from('app_ratings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (__DEV__) console.error('Error fetching user app ratings:', error);
        return {
          success: false,
          error: 'Failed to fetch ratings',
        };
      }

      return {
        success: true,
        data: ratings || [],
      };
    } catch (error) {
      if (__DEV__) console.error('Unexpected error fetching user app ratings:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  // Get app rating statistics (for admin dashboard)
  async getAppRatingStatistics(): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      // Get basic statistics
      const { data: stats, error: statsError } = await supabase
        .from('app_ratings')
        .select('rating, trigger_type, user_type, platform, created_at');

      if (statsError) {
        if (__DEV__) console.error('Error fetching app rating statistics:', statsError);
        return {
          success: false,
          error: 'Failed to fetch statistics',
        };
      }

      if (!stats) {
        return {
          success: true,
          data: {
            total_ratings: 0,
            average_rating: 0,
            by_rating: {},
            by_trigger: {},
            by_platform: {},
            by_user_type: {},
            recent_ratings: [],
          },
        };
      }

      // Process statistics
      const totalRatings = stats.length;
      const averageRating = totalRatings > 0 
        ? stats.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
        : 0;

      const byRating = stats.reduce((acc, rating) => {
        acc[rating.rating] = (acc[rating.rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const byTrigger = stats.reduce((acc, rating) => {
        acc[rating.trigger_type] = (acc[rating.trigger_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byPlatform = stats.reduce((acc, rating) => {
        acc[rating.platform] = (acc[rating.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byUserType = stats.reduce((acc, rating) => {
        acc[rating.user_type] = (acc[rating.user_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get recent ratings (last 10)
      const recentRatings = stats
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      return {
        success: true,
        data: {
          total_ratings: totalRatings,
          average_rating: Math.round(averageRating * 100) / 100,
          by_rating: byRating,
          by_trigger: byTrigger,
          by_platform: byPlatform,
          by_user_type: byUserType,
          recent_ratings: recentRatings,
        },
      };
    } catch (error) {
      if (__DEV__) console.error('Unexpected error fetching app rating statistics:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  // Check if user has already rated the app
  async hasUserRatedApp(): Promise<{ success: boolean; error?: string; data?: boolean }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: true, data: false }; // Anonymous users haven't rated
      }

      const { data: rating, error } = await supabase
        .from('app_ratings')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        if (__DEV__) console.error('Error checking if user rated app:', error);
        return {
          success: false,
          error: 'Failed to check rating status',
        };
      }

      return {
        success: true,
        data: !!rating,
      };
    } catch (error) {
      if (__DEV__) console.error('Unexpected error checking if user rated app:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }
}

export const appRatingService = new AppRatingService();