import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';
import { Card } from '../../components/common/Card';

interface BetaMetrics {
  totalUsers: number;
  totalSurveys: number;
  totalRatings: number;
  averageRating: number;
  dailyActiveUsers: number;
  surveyParticipationRate: number;
  topUserType: string;
  crashReports: number;
}

const BetaAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BetaMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBetaMetrics = async () => {
    try {
      // Fetch total users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, user_type, created_at');

      if (usersError) throw usersError;

      // Fetch surveys
      const { data: surveys, error: surveysError } = await supabase
        .from('survey_responses')
        .select('id, user_id, created_at');

      if (surveysError) throw surveysError;

      // Fetch ratings
      const { data: ratings, error: ratingsError } = await supabase
        .from('app_ratings')
        .select('id, rating, user_id, created_at');

      if (ratingsError) throw ratingsError;

      // Calculate metrics with proper null checks
      const totalUsers = users?.length || 0;
      const totalSurveys = surveys?.length || 0;
      const totalRatings = ratings?.length || 0;
      
      const averageRating = ratings && ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      // Daily active users (last 24 hours) - with safety checks
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const dailyActiveUsers = users && users.length > 0 
        ? users.filter(u => u.created_at && new Date(u.created_at) > oneDayAgo).length 
        : 0;

      // Survey participation rate - with safety checks
      const uniqueSurveyParticipants = surveys && surveys.length > 0
        ? new Set(surveys.map(s => s.user_id).filter(Boolean)).size
        : 0;
      const surveyParticipationRate = totalUsers > 0 
        ? (uniqueSurveyParticipants / totalUsers) * 100 
        : 0;

      // Top user type - with proper empty array handling
      const userTypeCounts = users && users.length > 0 
        ? users.reduce((acc, user) => {
            acc[user.user_type || 'unknown'] = (acc[user.user_type || 'unknown'] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        : {};
      
      const topUserType = userTypeCounts && Object.keys(userTypeCounts).length > 0
        ? Object.keys(userTypeCounts).reduce((a, b) => 
            userTypeCounts[a] > userTypeCounts[b] ? a : b
          )
        : 'N/A';

      setMetrics({
        totalUsers,
        totalSurveys,
        totalRatings,
        averageRating: Math.round((averageRating || 0) * 10) / 10,
        dailyActiveUsers,
        surveyParticipationRate: Math.round(surveyParticipationRate || 0),
        topUserType,
        crashReports: 0, // Would come from crash reporting service
      });
    } catch (error) {
      if (__DEV__) console.error('Error fetching beta metrics:', error);
      // Set default metrics on error
      setMetrics({
        totalUsers: 0,
        totalSurveys: 0,
        totalRatings: 0,
        averageRating: 0,
        dailyActiveUsers: 0,
        surveyParticipationRate: 0,
        topUserType: 'N/A',
        crashReports: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBetaMetrics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBetaMetrics();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Beta Analytics...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>🚀 Beta Testing Dashboard</Text>
        
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics?.totalUsers || 0}</Text>
            <Text style={styles.metricLabel}>Total Beta Users</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics?.dailyActiveUsers || 0}</Text>
            <Text style={styles.metricLabel}>Daily Active (24h)</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics?.totalSurveys || 0}</Text>
            <Text style={styles.metricLabel}>Survey Responses</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics?.surveyParticipationRate || 0}%</Text>
            <Text style={styles.metricLabel}>Survey Participation</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics?.totalRatings || 0}</Text>
            <Text style={styles.metricLabel}>App Ratings</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>⭐ {metrics?.averageRating || 0}</Text>
            <Text style={styles.metricLabel}>Average Rating</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics?.topUserType || 'N/A'}</Text>
            <Text style={styles.metricLabel}>Top User Type</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics?.crashReports || 0}</Text>
            <Text style={styles.metricLabel}>Crash Reports</Text>
          </Card>
        </View>

        <Text style={styles.lastUpdated}>
          Last updated: {new Date().toLocaleString()}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// Export both named and default for compatibility
export { BetaAnalyticsDashboard };
export default BetaAnalyticsDashboard;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    color: '#333',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    marginBottom: 16,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  lastUpdated: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 20,
  },
});