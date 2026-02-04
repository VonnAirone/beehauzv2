import { supabase } from './supabase';

export interface SurveyResponse {
  id?: string;
  user_id?: string | null;
  service_type: 'laundry' | 'delivery';
  response_level: 'not-interested' | 'maybe' | 'very-interested';
  user_email?: string;
  user_type?: string;
  additional_feedback?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SurveySubmissionData {
   service_type: 'laundry' | 'delivery';
  response_level: 'not-interested' | 'maybe' | 'very-interested';
  additional_feedback?: string;
  user_email?: string; // Required for anonymous users
  user_type?: string;  // Optional, defaults to 'tenant'
}

class SurveyService {
  // Test Supabase connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('count')
        .limit(1);
      
      if (error) {
        console.warn('Connection test failed:', error.message);
        return { success: false, error: error.message };
      }
      
      console.log('Supabase connection successful');
      return { success: true };
    } catch (error) {
      console.warn('Connection test error:', error);
      return { success: false, error: String(error) };
    }
  }

  // Test anonymous survey submission directly
  async testAnonymousSubmission(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Testing anonymous submission with email:', email);
      
      const testData = {
        user_id: null,
        service_type: 'laundry' as const,
        response_level: 'very-interested' as const,
        user_email: email,
        user_type: 'tenant',
        additional_feedback: 'Test anonymous submission'
      };

      const { data, error } = await supabase
        .from('survey_responses')
        .insert(testData)
        .select()
        .single();

      if (error) {
        console.warn('Anonymous test failed:', error);
        return { success: false, error: error.message };
      }

      console.log('Anonymous test successful:', data);
      return { success: true };
    } catch (error) {
      console.warn('Anonymous test error:', error);
      return { success: false, error: String(error) };
    }
  }

  // Submit a new survey response
  async submitSurveyResponse(data: SurveySubmissionData): Promise<{ success: boolean; error?: string; data?: SurveyResponse }> {
    try {
      // Test Supabase connection first
      console.log('Survey service: Starting submission process');
      
      // Get current user - handle potential auth errors
      let user = null;
      try {
        const { data: authData } = await supabase.auth.getUser();
        user = authData.user;
      } catch (authError) {
        console.log('Survey service: Auth check failed, treating as anonymous:', authError);
        user = null;
      }
      
      console.log('Survey service: User status:', user ? 'logged in' : 'anonymous', user ? `ID: ${user.id}` : '');
      
      // For anonymous users, validate email first
      if (!user) {
        if (!data.user_email) {
          return {
            success: false,
            error: 'Email is required for anonymous survey submissions',
          };
        }

        // Basic email validation for anonymous users
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.user_email)) {
          return {
            success: false,
            error: 'Please provide a valid email address',
          };
        }
      }
      
      // Get user profile for additional context (only for logged-in users)
      let userProfile = null;
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type, email')
            .eq('id', user.id)
            .single();
          userProfile = profile;
        } catch (profileError) {
          console.log('Survey service: Profile fetch failed, continuing without profile:', profileError);
        }
      }

      // Determine email and user type
      const userEmail = user?.email || userProfile?.email || data.user_email || null;
      const userType = data.user_type || userProfile?.user_type || 'tenant';

      const surveyData: Partial<SurveyResponse> = {
        user_id: user?.id || null, // Explicitly set to null for anonymous users
        service_type: data.service_type,
        response_level: data.response_level,
        user_email: userEmail,
        user_type: userType,
        additional_feedback: data.additional_feedback || undefined,
      };

      console.log('Survey service: Submitting data:', {
        user_id: surveyData.user_id ? 'logged_in_user' : 'anonymous',
        service_type: surveyData.service_type,
        response_level: surveyData.response_level,
        user_email: userEmail ? 'provided' : 'missing',
        user_type: userType,
        isAnonymous: !user
      });

      // For anonymous users, ensure we're not authenticated to trigger the right RLS policy
      let insertResult;
      if (!user) {
        // Explicitly ensure no authentication for anonymous submissions
        console.log('Survey service: Submitting as anonymous user');
        insertResult = await supabase
          .from('survey_responses')
          .insert(surveyData)
          .select()
          .single();
      } else {
        // Regular authenticated submission
        console.log('Survey service: Submitting as authenticated user');
        insertResult = await supabase
          .from('survey_responses')
          .insert(surveyData)
          .select()
          .single();
      }

      const { data: response, error } = insertResult;

      if (error) {
        // Log error details for debugging in production
        console.warn('Survey submission error:', {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          surveyData: surveyData
        });
        return {
          success: false,
          error: `Failed to submit survey response: ${error.message}`,
        };
      }

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      if (__DEV__) console.error('Unexpected error submitting survey:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  // Get survey responses for current user
  async getUserSurveyResponses(): Promise<{ success: boolean; error?: string; data?: SurveyResponse[] }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const { data: responses, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (__DEV__) console.error('Error fetching user survey responses:', error);
        return {
          success: false,
          error: 'Failed to fetch survey responses.',
        };
      }

      return {
        success: true,
        data: responses || [],
      };
    } catch (error) {
      if (__DEV__) console.error('Unexpected error fetching survey responses:', error);
      return {
        success: false,
        error: 'An unexpected error occurred.',
      };
    }
  }

  // Check if user has already responded to a specific service survey
  async hasUserRespondedToService(serviceType: 'laundry' | 'delivery', anonymousEmail?: string): Promise<{ success: boolean; hasResponded: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For anonymous users, check by email if provided
        if (anonymousEmail) {
          const { data: responses, error } = await supabase
            .from('survey_responses')
            .select('id')
            .eq('user_email', anonymousEmail.trim())
            .eq('service_type', serviceType)
            .is('user_id', null)
            .limit(1);

          if (error) {
            if (__DEV__) console.error('Error checking anonymous survey response:', error);
            return {
              success: false,
              hasResponded: false,
              error: 'Failed to check survey status.',
            };
          }

          return {
            success: true,
            hasResponded: responses && responses.length > 0,
          };
        }
        
        // For anonymous users without email, we can't track previous responses
        return {
          success: true,
          hasResponded: false,
        };
      }

      const { data: responses, error } = await supabase
        .from('survey_responses')
        .select('id')
        .eq('user_id', user.id)
        .eq('service_type', serviceType)
        .limit(1);

      if (error) {
        if (__DEV__) console.error('Error checking survey response:', error);
        return {
          success: false,
          hasResponded: false,
          error: 'Failed to check survey status.',
        };
      }

      return {
        success: true,
        hasResponded: (responses && responses.length > 0),
      };
    } catch (error) {
      if (__DEV__) console.error('Unexpected error checking survey response:', error);
      return {
        success: false,
        hasResponded: false,
        error: 'An unexpected error occurred.',
      };
    }
  }

  // Update survey response with additional feedback
  async updateSurveyResponse(responseId: string, additionalFeedback: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('survey_responses')
        .update({ additional_feedback: additionalFeedback })
        .eq('id', responseId);

      if (error) {
        if (__DEV__) console.error('Error updating survey response:', error);
        return {
          success: false,
          error: 'Failed to update survey response.',
        };
      }

      return { success: true };
    } catch (error) {
      if (__DEV__) console.error('Unexpected error updating survey response:', error);
      return {
        success: false,
        error: 'An unexpected error occurred.',
      };
    }
  }

  // Get survey statistics (for admin/analytics)
  async getSurveyStatistics(): Promise<{ 
    success: boolean; 
    error?: string; 
    data?: {
      total_responses: number;
      by_service: { [key: string]: number };
      by_response_level: { [key: string]: number };
      recent_responses: SurveyResponse[];
    } 
  }> {
    try {
      // This would typically require admin permissions
      const { data: responses, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (__DEV__) console.error('Error fetching survey statistics:', error);
        return {
          success: false,
          error: 'Failed to fetch survey statistics.',
        };
      }

      const stats = {
        total_responses: responses?.length || 0,
        by_service: {} as { [key: string]: number },
        by_response_level: {} as { [key: string]: number },
        recent_responses: responses?.slice(0, 10) || [],
      };

      // Calculate statistics
      responses?.forEach((response) => {
        // Count by service type
        stats.by_service[response.service_type] = (stats.by_service[response.service_type] || 0) + 1;
        
        // Count by response level
        stats.by_response_level[response.response_level] = (stats.by_response_level[response.response_level] || 0) + 1;
      });

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      if (__DEV__) console.error('Unexpected error fetching survey statistics:', error);
      return {
        success: false,
        error: 'An unexpected error occurred.',
      };
    }
  }
}

export const surveyService = new SurveyService();