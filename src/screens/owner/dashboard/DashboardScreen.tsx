import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';
import { supabase } from '../../../services/supabase';
import { useAuthContext } from '../../../context/AuthContext';
import { Input } from '../../../components/common';
import { Plus } from 'lucide-react-native';

export const OwnerDashboardScreen: React.FC = () => {
  const { user } = useAuthContext();

  const [tenants, setTenants] = React.useState<Array<{
    id: string;
    name: string;
    yearLevel: string;
    school: string;
    dateStarted: string;
    dateLeft: string;
    dateLeftRaw: string | null;
    paymentStatus: string;
    paymentStatusRaw: string | null;
    paymentDueDate: string | null;
    paymentPaidAt: string | null;
  }>>([]);
  const [isLoadingTenants, setIsLoadingTenants] = React.useState(false);
  const [tenantsError, setTenantsError] = React.useState<string | null>(null);
  const [isInviteModalVisible, setInviteModalVisible] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [isInviting, setIsInviting] = React.useState(false);
  const [inviteError, setInviteError] = React.useState<string | null>(null);

  const mapPaymentStatus = (status?: string | null) => {
    switch ((status || '').toLowerCase()) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'due':
        return 'Due';
      default:
        return 'N/A';
    }
  };

  const fetchTenants = React.useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingTenants(true);
    setTenantsError(null);

    try {
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', user.id);

      if (propertiesError) {
        throw propertiesError;
      }

      if (!properties || properties.length === 0) {
        setTenants([]);
        return;
      }

      const propertyIds = properties.map((property) => property.id);

      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, year_level, school, date_started, date_left, status, tenant_payments(status, due_date, paid_at)')
        .in('property_id', propertyIds)
        .order('date_started', { ascending: false });

      if (error) {
        throw error;
      }

      const mappedTenants = (data ?? []).map((tenant: any) => {
        const payments = Array.isArray(tenant.tenant_payments) ? tenant.tenant_payments : [];
        const latestPayment = payments
          .filter((payment: any) => payment?.due_date)
          .sort((a: any, b: any) => String(b.due_date).localeCompare(String(a.due_date)))[0];

        const paymentStatus = tenant.status === 'left'
          ? 'Left'
          : mapPaymentStatus(latestPayment?.status);

        return {
          id: tenant.id,
          name: tenant.name,
          yearLevel: tenant.year_level || 'Not specified',
          school: tenant.school || 'Not specified',
          dateStarted: tenant.date_started || '-',
          dateLeft: tenant.date_left || '-',
          dateLeftRaw: tenant.date_left || null,
          paymentStatus,
          paymentStatusRaw: latestPayment?.status || null,
          paymentDueDate: latestPayment?.due_date || null,
          paymentPaidAt: latestPayment?.paid_at || null,
        };
      });

      setTenants(mappedTenants);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tenants.';
      setTenantsError(message);
    } finally {
      setIsLoadingTenants(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleOpenInvite = () => {
    setInviteEmail('');
    setInviteError(null);
    setInviteModalVisible(true);
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteError('Email is required.');
      return;
    }

    setIsInviting(true);
    setInviteError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: inviteEmail.trim(),
      });

      if (error) {
        setInviteError(error.message || 'Failed to send invite.');
        return;
      }

      Alert.alert('Invite sent', 'An invite link has been sent to the student.');
      setInviteModalVisible(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send invite.';
      setInviteError(message);
    } finally {
      setIsInviting(false);
    }
  };

  const stats = React.useMemo(() => {
    const today = new Date();
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter((tenant) => !tenant.dateLeftRaw).length;
    const leftTenants = tenants.filter((tenant) => !!tenant.dateLeftRaw).length;

    const pendingPayments = tenants.filter((tenant) => {
      if (tenant.dateLeftRaw) return false;
      return (tenant.paymentStatusRaw || '').toLowerCase() === 'pending';
    }).length;

    const dueThisWeek = tenants.filter((tenant) => {
      if (tenant.dateLeftRaw) return false;
      if (!tenant.paymentDueDate) return false;
      if ((tenant.paymentStatusRaw || '').toLowerCase() === 'paid') return false;

      const dueDate = new Date(tenant.paymentDueDate);
      return dueDate < today;
    }).length;

    return [
      { label: 'Total Tenants', value: String(totalTenants) },
      { label: 'Active Tenants', value: String(activeTenants) },
      { label: 'Pending Payments', value: String(pendingPayments) }
    ];
  }, [tenants]);

  const [notifications, setNotifications] = React.useState<Array<{
    id: string;
    title: string;
    body: string | null;
    created_at: string;
  }>>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(false);

  const formatTimeAgo = (value: string) => {
    const now = new Date();
    const created = new Date(value);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  React.useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const loadNotifications = async () => {
      setIsLoadingNotifications(true);
      try {
        const { data } = await supabase
          .from('owner_notifications')
          .select('id, title, body, created_at')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (!isMounted) return;
        setNotifications(data ?? []);
      } finally {
        if (isMounted) setIsLoadingNotifications(false);
      }
    };

    loadNotifications();

    const channel = supabase
      .channel(`owner-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'owner_notifications',
          filter: `owner_id=eq.${user.id}`,
        },
        (payload) => {
          const next = payload.new as { id: string; title: string; body: string | null; created_at: string };
          setNotifications((prev) => [next, ...prev]);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <View style={styles.container}>
      <Text style={[typography.textStyles.h2, styles.title]}>Owner Dashboard</Text>
      <Text style={[typography.textStyles.body, styles.subtitle]}>
        Welcome back! Here's your property overview.
      </Text>

      <View style={styles.contentRow}>
        <ScrollView
          style={styles.mainColumn}
          contentContainerStyle={styles.contentContainerStyle}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsGrid}>
            {stats.map((item) => (
              <View key={item.label} style={styles.statCard}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.tableCardWrapper}>
            <View style={styles.tableCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Tenants</Text>
              <TouchableOpacity style={styles.inviteButton} onPress={handleOpenInvite}>
                <Text style={styles.inviteButtonText}>Invite a user</Text>
                <Plus size={16} color={'white'}/>
              </TouchableOpacity>
            </View>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colName]}>Name</Text>
              <Text style={[styles.tableHeaderCell, styles.colYear]}>Year Level</Text>
              <Text style={[styles.tableHeaderCell, styles.colSchool]}>School</Text>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>Date Started</Text>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>Date Left</Text>
              <Text style={[styles.tableHeaderCell, styles.colStatus]}>Payment Status</Text>
            </View>

            {isLoadingTenants && (
              <Text style={styles.emptyTableText}>Loading tenants...</Text>
            )}

            {!isLoadingTenants && tenantsError && (
              <Text style={styles.emptyTableText}>Unable to load tenants.</Text>
            )}

            {!isLoadingTenants && !tenantsError && tenants.length === 0 && (
              <Text style={styles.emptyTableText}>No tenants enrolled in your property.</Text>
            )}

            {!isLoadingTenants && !tenantsError && tenants.length > 0 && tenants.map((tenant) => (
              <View key={tenant.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colName]} numberOfLines={1}>
                  {tenant.name}
                </Text>
                <Text style={[styles.tableCell, styles.colYear]} numberOfLines={1}>
                  {tenant.yearLevel}
                </Text>
                <Text style={[styles.tableCell, styles.colSchool]} numberOfLines={1}>
                  {tenant.school}
                </Text>
                <Text style={[styles.tableCell, styles.colDate]}>{tenant.dateStarted}</Text>
                <Text style={[styles.tableCell, styles.colDate]}>{tenant.dateLeft}</Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.colStatus,
                    styles.statusBadge,
                    tenant.paymentStatus === 'Paid' && styles.statusPaid,
                    tenant.paymentStatus === 'Pending' && styles.statusPending,
                    tenant.paymentStatus === 'Due' && styles.statusDue,
                    tenant.paymentStatus === 'Left' && styles.statusLeft,
                  ]}
                >
                  {tenant.paymentStatus}
                </Text>
              </View>
            ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.sideColumn}>
          <View style={styles.notificationCard}>
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Notifications</Text>
            {isLoadingNotifications && (
              <Text style={styles.notificationEmpty}>Loading notifications...</Text>
            )}
            {!isLoadingNotifications && notifications.length === 0 && (
              <Text style={styles.notificationEmpty}>No notifications yet.</Text>
            )}
            {!isLoadingNotifications && notifications.map((note) => (
              <View key={note.id} style={styles.notificationItem}>
                <View style={styles.notificationText}>
                  <Text style={styles.notificationTitle}>{note.title}</Text>
                  {!!note.body && <Text style={styles.notificationSubtitle}>{note.body}</Text>}
                </View>
                <Text style={styles.notificationTime}>{formatTimeAgo(note.created_at)}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Modal
        visible={isInviteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Invite a student</Text>
            <Text style={styles.modalSubtitle}>Send an invite link to join your property.</Text>

            <Input
              label="Student Email"
              placeholder="student@email.com"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={inviteError || undefined}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setInviteModalVisible(false)}
                disabled={isInviting}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={handleSendInvite}
                disabled={isInviting}
              >
                <Text style={styles.modalPrimaryText}>
                  {isInviting ? 'Sending...' : 'Send Invite'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F8FA',
  },
  title: {
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.gray[600],
    marginBottom: 16,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  mainColumn: {
    flex: 1,
  },
  contentContainerStyle: {
    flexGrow: 1,  
  },
  sideColumn: {
    width: 300,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flexGrow: 1,
    minWidth: 160,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[600],
  },
  tableCardWrapper: {
    flex: 1,
  },
  tableCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 16,
  },
  sectionTitle: {
    color: colors.gray[900],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  inviteButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 11,
    color: colors.gray[500],
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12,
    color: colors.gray[800],
  },
  colName: {
    flex: 1.6,
  },
  colYear: {
    flex: 1,
  },
  colSchool: {
    flex: 1.4,
  },
  colDate: {
    flex: 1,
  },
  colStatus: {
    flex: 1,
    textAlign: 'center',
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingVertical: 4,
    paddingHorizontal: 8,
    textAlign: 'center',
    overflow: 'hidden',
  },
  statusPaid: {
    backgroundColor: '#E7F7EF',
    color: '#0F8A5F',
    borderColor: '#BFEAD7',
  },
  statusPending: {
    backgroundColor: '#FFF6E5',
    color: '#9A6B00',
    borderColor: '#FFE2A6',
  },
  statusDue: {
    backgroundColor: '#FDECEC',
    color: '#B42318',
    borderColor: '#F9C5C5',
  },
  statusLeft: {
    backgroundColor: '#F2F4F7',
    color: colors.gray[600],
    borderColor: colors.gray[200],
  },
  emptyTableText: {
    color: colors.gray[500],
    textAlign: 'center',
    fontSize: 13,
    paddingVertical: 12,
  },
  notificationCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  notificationText: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[900],
  },
  notificationSubtitle: {
    fontSize: 12,
    color: colors.gray[600],
  },
  notificationTime: {
    fontSize: 11,
    color: colors.gray[500],
  },
  notificationEmpty: {
    color: colors.gray[500],
    fontSize: 13,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.gray[600],
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCancelButton: {
    backgroundColor: colors.gray[100],
  },
  modalPrimaryButton: {
    backgroundColor: colors.primary,
  },
  modalCancelText: {
    color: colors.gray[700],
    fontWeight: '600',
  },
  modalPrimaryText: {
    color: colors.white,
    fontWeight: '600',
  },
});