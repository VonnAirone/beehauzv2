import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MapPin, Calendar, CircleDollarSign, LogOut } from 'lucide-react-native';
import { TenantStackParamList } from '../../../navigation/types';
import { colors } from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { SubPageHeader } from '../../../components/common';
import { supabase } from '../../../services/supabase';
import { useAuthContext } from '../../../context/AuthContext';

interface TenancyInfo {
  id: string;
  propertyName: string;
  propertyAddress: string;
  dateStarted: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: string;
}

const formatDate = (date: string | null) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (value: number) => {
  if (!value || value <= 0) return '₱0.00';
  return `₱${value.toLocaleString()}`;
};

const getStatusStyle = (status: string | null) => {
  switch (status) {
    case 'paid':
      return { bg: '#E7F7EF', text: '#0F8A5F', border: '#BFEAD7', label: 'Paid' };
    case 'pending':
      return { bg: '#FFF6E5', text: '#9A6B00', border: '#FFE2A6', label: 'Pending' };
    case 'due':
      return { bg: '#FDECEC', text: '#B42318', border: '#F9C5C5', label: 'Due' };
    default:
      return { bg: '#F2F4F7', text: colors.gray[600], border: colors.gray[200], label: 'No Record' };
  }
};

export const MyStayScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<TenantStackParamList>>();
  const { user } = useAuthContext();

  const [tenancy, setTenancy] = useState<TenancyInfo | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMoveOutLoading, setIsMoveOutLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('tenants')
        .select('id, date_started, properties:property_id(name, address), tenant_payments(id, amount, due_date, paid_at, status)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .is('date_left', null)
        .limit(1)
        .maybeSingle();

      if (data) {
        const prop = data.properties as any;
        setTenancy({
          id: data.id,
          propertyName: prop?.name || 'Unknown property',
          propertyAddress: prop?.address || 'No address',
          dateStarted: data.date_started,
        });

        const paymentsList = Array.isArray(data.tenant_payments) ? data.tenant_payments : [];
        const sorted = paymentsList
          .filter((p: any) => p?.due_date)
          .sort((a: any, b: any) => String(b.due_date).localeCompare(String(a.due_date)));

        setPayments(
          sorted.map((p: any) => ({
            id: p.id,
            amount: p.amount || 0,
            dueDate: p.due_date,
            paidAt: p.paid_at,
            status: p.status,
          }))
        );
      } else {
        setTenancy(null);
        setPayments([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleMoveOut = () => {
    Alert.alert(
      'Request Move-Out',
      'Are you sure you want to move out? This will notify the property owner and end your tenancy.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Move Out',
          style: 'destructive',
          onPress: confirmMoveOut,
        },
      ]
    );
  };

  const confirmMoveOut = async () => {
    if (!tenancy) return;
    setIsMoveOutLoading(true);

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('tenants')
      .update({ status: 'left', date_left: today })
      .eq('id', tenancy.id);

    setIsMoveOutLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to process your move-out request. Please try again.');
      return;
    }

    Alert.alert('Move-Out Confirmed', 'Your tenancy has been ended. Thank you for staying!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const renderStatusBadge = (status: string | null) => {
    const s = getStatusStyle(status);
    return (
      <View style={[styles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
        <Text style={[styles.statusBadgeText, { color: s.text }]}>{s.label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SubPageHeader title="My Stay" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {!isLoading && !tenancy && (
          <View style={styles.emptyContainer}>
            <MapPin size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No active tenancy</Text>
            <Text style={styles.emptySubtitle}>
              You are not currently staying at any boarding house.
            </Text>
          </View>
        )}

        {!isLoading && tenancy && (
          <>
            {/* Property Card */}
            <View style={styles.propertyCard}>
              <Text style={styles.propertyName}>{tenancy.propertyName}</Text>
              <View style={styles.propertyDetailRow}>
                <MapPin size={14} color={colors.gray[500]} />
                <Text style={styles.propertyDetailText}>{tenancy.propertyAddress}</Text>
              </View>
              <View style={styles.propertyDetailRow}>
                <Calendar size={14} color={colors.gray[500]} />
                <Text style={styles.propertyDetailText}>
                  Staying since {formatDate(tenancy.dateStarted)}
                </Text>
              </View>
            </View>

            {/* Payment History */}
            <Text style={styles.sectionTitle}>Payment History</Text>

            {payments.length === 0 ? (
              <View style={styles.emptyPayments}>
                <CircleDollarSign size={36} color={colors.gray[300]} />
                <Text style={styles.emptyPaymentsText}>No payment records yet</Text>
              </View>
            ) : (
              <View style={styles.paymentsList}>
                {payments.map((payment) => (
                  <View key={payment.id} style={styles.paymentCard}>
                    <View style={styles.paymentCardHeader}>
                      <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                      {renderStatusBadge(payment.status)}
                    </View>
                    <View style={styles.paymentCardBody}>
                      <View style={styles.paymentDetailRow}>
                        <Calendar size={13} color={colors.gray[500]} />
                        <Text style={styles.paymentDetailText}>Due: {formatDate(payment.dueDate)}</Text>
                      </View>
                      {payment.paidAt && (
                        <View style={styles.paymentDetailRow}>
                          <Calendar size={13} color={colors.gray[500]} />
                          <Text style={styles.paymentDetailText}>Paid: {formatDate(payment.paidAt)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Move-Out Button */}
            <TouchableOpacity
              style={[styles.moveOutButton, isMoveOutLoading && styles.moveOutButtonDisabled]}
              onPress={handleMoveOut}
              disabled={isMoveOutLoading}
              activeOpacity={0.7}
            >
              <LogOut size={20} color={colors.error} />
              <Text style={styles.moveOutButtonText}>
                {isMoveOutLoading ? 'Processing...' : 'Request Move-Out'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.gray[900],
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[700],
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // Property Card
  propertyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: 24,
  },
  propertyName: {
    fontSize: 18,
    fontFamily: 'Figtree_700Bold',
    color: colors.gray[900],
    marginBottom: 12,
  },
  propertyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  propertyDetailText: {
    fontSize: 13,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[600],
    flex: 1,
  },

  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[900],
    marginBottom: 12,
  },

  // Empty Payments
  emptyPayments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  emptyPaymentsText: {
    fontSize: 13,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[500],
  },

  // Payments List
  paymentsList: {
    gap: 10,
  },
  paymentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  paymentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentAmount: {
    fontSize: 16,
    fontFamily: 'Figtree_700Bold',
    color: colors.gray[900],
  },
  paymentCardBody: {
    gap: 4,
  },
  paymentDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentDetailText: {
    fontSize: 12,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[600],
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: 'Figtree_600SemiBold',
  },

  // Move-Out Button
  moveOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 32,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  moveOutButtonDisabled: {
    opacity: 0.6,
  },
  moveOutButtonText: {
    fontSize: 15,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.error,
  },
});
