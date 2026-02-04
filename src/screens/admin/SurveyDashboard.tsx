import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { BarChart3, PieChart, TrendingUp, Users } from 'lucide-react-native';
import { surveyService, SurveyResponse } from '../../services/surveyService';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';

interface SurveyStats {
  total_responses: number;
  by_service: { [key: string]: number };
  by_response_level: { [key: string]: number };
  recent_responses: SurveyResponse[];
}

export const SurveyDashboard: React.FC = () => {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSurveyStats();
  }, []);

  const loadSurveyStats = async () => {
    try {
      setLoading(true);
      const result = await surveyService.getSurveyStatistics();
      
      if (result.success && result.data) {
        setStats(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load survey statistics');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getResponseLevelColor = (level: string) => {
    switch (level) {
      case 'very-interested': return colors.success;
      case 'maybe': return colors.warning;
      case 'not-interested': return colors.error;
      default: return colors.gray[400];
    }
  };

  const getResponseLevelLabel = (level: string) => {
    switch (level) {
      case 'very-interested': return 'Very Interested';
      case 'maybe': return 'Maybe';
      case 'not-interested': return 'Not Interested';
      default: return level;
    }
  };

  const getServiceLabel = (service: string) => {
    switch (service) {
      case 'laundry': return 'Laundry Services';
      case 'delivery': return 'Delivery Services';
      default: return service;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading survey statistics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSurveyStats}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No survey data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[typography.textStyles.h2, styles.title]}>Survey Dashboard</Text>
        <Text style={[typography.textStyles.body, styles.subtitle]}>
          User feedback on new services
        </Text>
      </View>

      {/* Overview Cards */}
      <View style={styles.overviewSection}>
        <View style={styles.statCard}>
          <Users size={24} color={colors.primary} />
          <Text style={styles.statNumber}>{stats.total_responses}</Text>
          <Text style={styles.statLabel}>Total Responses</Text>
        </View>
      </View>

      {/* Service Breakdown */}
      <View style={styles.section}>
        <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
          <BarChart3 size={20} color={colors.gray[700]} /> Responses by Service
        </Text>
        <View style={styles.chartContainer}>
          {Object.entries(stats.by_service).map(([service, count]) => (
            <View key={service} style={styles.barItem}>
              <Text style={styles.barLabel}>{getServiceLabel(service)}</Text>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      width: `${(count / Math.max(...Object.values(stats.by_service))) * 100}%`,
                      backgroundColor: service === 'laundry' ? colors.primary : colors.secondary,
                    }
                  ]} 
                />
                <Text style={styles.barValue}>{count}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Interest Level Breakdown */}
      <View style={styles.section}>
        <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
          <PieChart size={20} color={colors.gray[700]} /> Interest Levels
        </Text>
        <View style={styles.chartContainer}>
          {Object.entries(stats.by_response_level).map(([level, count]) => (
            <View key={level} style={styles.barItem}>
              <Text style={styles.barLabel}>{getResponseLevelLabel(level)}</Text>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      width: `${(count / Math.max(...Object.values(stats.by_response_level))) * 100}%`,
                      backgroundColor: getResponseLevelColor(level),
                    }
                  ]} 
                />
                <Text style={styles.barValue}>{count}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Responses */}
      <View style={styles.section}>
        <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
          <TrendingUp size={20} color={colors.gray[700]} /> Recent Responses
        </Text>
        <View style={styles.recentResponses}>
          {stats.recent_responses.slice(0, 5).map((response, index) => (
            <View key={response.id || index} style={styles.responseItem}>
              <View style={styles.responseHeader}>
                <Text style={styles.responseService}>
                  {getServiceLabel(response.service_type)}
                </Text>
                <Text style={styles.responseDate}>
                  {new Date(response.created_at || '').toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.responseBody}>
                <View 
                  style={[
                    styles.responseLevelBadge,
                    { backgroundColor: getResponseLevelColor(response.response_level) }
                  ]}
                >
                  <Text style={styles.responseLevelText}>
                    {getResponseLevelLabel(response.response_level)}
                  </Text>
                </View>
                {response.user_type && (
                  <Text style={styles.responseUserType}>({response.user_type})</Text>
                )}
              </View>
              {response.additional_feedback && (
                <Text style={styles.responseFeedback}>{response.additional_feedback}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  loadingText: {
    marginTop: 16,
    color: colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: 20,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    color: colors.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    color: colors.gray[600],
  },
  overviewSection: {
    padding: 20,
  },
  statCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
  },
  statLabel: {
    color: colors.gray[600],
    marginTop: 4,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    color: colors.gray[900],
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartContainer: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  barItem: {
    marginBottom: 16,
  },
  barLabel: {
    color: colors.gray[700],
    marginBottom: 8,
    fontWeight: '500',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 20,
  },
  barValue: {
    color: colors.gray[600],
    fontWeight: '600',
    minWidth: 20,
  },
  recentResponses: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  responseItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  responseService: {
    fontWeight: '600',
    color: colors.gray[900],
  },
  responseDate: {
    color: colors.gray[500],
    fontSize: 12,
  },
  responseBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  responseLevelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  responseLevelText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  responseUserType: {
    color: colors.gray[500],
    fontSize: 12,
  },
  responseFeedback: {
    color: colors.gray[600],
    fontStyle: 'italic',
  },
});