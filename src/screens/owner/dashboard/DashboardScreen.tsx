import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';
import { supabase } from '../../../services/supabase';
import { useAuthContext } from '../../../context/AuthContext';
import { Input } from '../../../components/common';
import { Plus, User, Clock, Home, X, CheckCircle, XCircle } from 'lucide-react-native';

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
    related_request_id: string | null;
    created_at: string;
  }>>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(false);

  const [bookingDetailVisible, setBookingDetailVisible] = React.useState(false);
  const [bookingDetail, setBookingDetail] = React.useState<{
    requestId: string;
    requesterName: string;
    requesterEmail: string | null;
    requesterPhone: string | null;
    startDate: string | null;
    endDate: string | null;
    headsCount: number | null;
    status: string;
    createdAt: string;
    history: Array<{ propertyName: string; dateStarted: string; dateLeft: string | null; status: string }>;
  } | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

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
          .select('id, title, body, related_request_id, created_at')
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
          const next = payload.new as { id: string; title: string; body: string | null; related_request_id: string | null; created_at: string };
          setNotifications((prev) => [next, ...prev]);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleNotificationPress = async (notification: typeof notifications[0]) => {
    if (!notification.related_request_id) return;

    setBookingDetailVisible(true);
    setBookingDetail(null);
    setIsLoadingDetail(true);

    try {
      const { data: request } = await supabase
        .from('booking_requests')
        .select('id, requester_id, requester_name, start_date, end_date, heads_count, status, created_at')
        .eq('id', notification.related_request_id)
        .maybeSingle();

      if (!request) {
        setIsLoadingDetail(false);
        return;
      }

      let requesterEmail: string | null = null;
      let requesterPhone: string | null = null;

      if (request.requester_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name, phone')
          .eq('id', request.requester_id)
          .maybeSingle();

        if (profile) {
          requesterEmail = profile.email || null;
          requesterPhone = profile.phone || null;
        }
      }

      let history: Array<{ propertyName: string; dateStarted: string; dateLeft: string | null; status: string }> = [];

      if (request.requester_id) {
        const { data: tenantRecords } = await supabase
          .from('tenants')
          .select('date_started, date_left, status, properties:property_id(name)')
          .eq('user_id', request.requester_id)
          .order('date_started', { ascending: false });

        if (tenantRecords) {
          history = tenantRecords.map((record: any) => ({
            propertyName: record.properties?.name || 'Unknown property',
            dateStarted: record.date_started,
            dateLeft: record.date_left,
            status: record.status,
          }));
        }
      }

      setBookingDetail({
        requestId: request.id,
        requesterName: request.requester_name,
        requesterEmail,
        requesterPhone,
        startDate: request.start_date,
        endDate: request.end_date,
        headsCount: request.heads_count,
        status: request.status,
        createdAt: request.created_at,
        history,
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleUpdateBookingStatus = async (status: 'accepted' | 'rejected') => {
    if (!bookingDetail) return;

    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({ status })
        .eq('id', bookingDetail.requestId);

      if (error) {
        Alert.alert('Error', 'Failed to update booking status. Please try again.');
        return;
      }

      setBookingDetail((prev) => prev ? { ...prev, status } : null);
      Alert.alert(
        status === 'accepted' ? 'Booking Accepted' : 'Booking Rejected',
        status === 'accepted'
          ? `You have accepted the booking request from ${bookingDetail.requesterName}.`
          : `You have rejected the booking request from ${bookingDetail.requesterName}.`
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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
              <TouchableOpacity
                key={note.id}
                style={[styles.notificationItem, note.related_request_id && styles.notificationClickable]}
                onPress={() => handleNotificationPress(note)}
                disabled={!note.related_request_id}
                activeOpacity={0.7}
              >
                <View style={styles.notificationText}>
                  <Text style={styles.notificationTitle}>{note.title}</Text>
                  {!!note.body && <Text style={styles.notificationSubtitle}>{note.body}</Text>}
                </View>
                <Text style={styles.notificationTime}>{formatTimeAgo(note.created_at)}</Text>
              </TouchableOpacity>
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

      <Modal
        visible={bookingDetailVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBookingDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.detailModalCard]}>
            <View style={styles.detailHeader}>
              <Text style={styles.modalTitle}>Booking Request</Text>
              <TouchableOpacity onPress={() => setBookingDetailVisible(false)}>
                <X size={20} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            {isLoadingDetail && (
              <Text style={styles.detailLoading}>Loading details...</Text>
            )}

            {!isLoadingDetail && !bookingDetail && (
              <Text style={styles.detailLoading}>Unable to load booking details.</Text>
            )}

            {!isLoadingDetail && bookingDetail && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Tenant Profile */}
                <View style={styles.detailSection}>
                  <View style={styles.detailSectionHeader}>
                    <User size={16} color={colors.primary} />
                    <Text style={styles.detailSectionTitle}>Tenant Profile</Text>
                  </View>
                  <View style={styles.detailProfileCard}>
                    <View style={styles.detailAvatar}>
                      <Text style={styles.detailAvatarText}>
                        {bookingDetail.requesterName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </Text>
                    </View>
                    <View style={styles.detailProfileInfo}>
                      <Text style={styles.detailName}>{bookingDetail.requesterName}</Text>
                      {bookingDetail.requesterEmail && (
                        <Text style={styles.detailSubInfo}>{bookingDetail.requesterEmail}</Text>
                      )}
                      {bookingDetail.requesterPhone && (
                        <Text style={styles.detailSubInfo}>{bookingDetail.requesterPhone}</Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Booking Info */}
                <View style={styles.detailSection}>
                  <View style={styles.detailSectionHeader}>
                    <Clock size={16} color={colors.primary} />
                    <Text style={styles.detailSectionTitle}>Booking Details</Text>
                  </View>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailLabel}>Start Date</Text>
                      <Text style={styles.detailValue}>{bookingDetail.startDate || 'Not specified'}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailLabel}>End Date</Text>
                      <Text style={styles.detailValue}>{bookingDetail.endDate || 'Not specified'}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailLabel}>No. of Heads</Text>
                      <Text style={styles.detailValue}>{bookingDetail.headsCount ?? 'Not specified'}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <Text style={[
                        styles.detailStatusBadge,
                        bookingDetail.status === 'new' && styles.detailStatusNew,
                        bookingDetail.status === 'accepted' && styles.detailStatusAccepted,
                        bookingDetail.status === 'rejected' && styles.detailStatusRejected,
                      ]}>
                        {bookingDetail.status.charAt(0).toUpperCase() + bookingDetail.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Tenant History */}
                <View style={styles.detailSection}>
                  <View style={styles.detailSectionHeader}>
                    <Home size={16} color={colors.primary} />
                    <Text style={styles.detailSectionTitle}>Property History</Text>
                  </View>
                  {bookingDetail.history.length === 0 ? (
                    <Text style={styles.detailEmptyHistory}>No previous property records found.</Text>
                  ) : (
                    bookingDetail.history.map((record, index) => (
                      <View key={index} style={styles.detailHistoryItem}>
                        <View style={styles.detailHistoryDot} />
                        <View style={styles.detailHistoryContent}>
                          <Text style={styles.detailHistoryName}>{record.propertyName}</Text>
                          <Text style={styles.detailHistoryDate}>
                            {record.dateStarted} — {record.dateLeft || 'Present'}
                          </Text>
                        </View>
                        <Text style={[
                          styles.detailHistoryStatus,
                          record.status === 'active' && { color: '#0F8A5F' },
                          record.status === 'left' && { color: colors.gray[500] },
                        ]}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Text>
                      </View>
                    ))
                  )}
                </View>

                {/* Accept / Reject Buttons */}
                {bookingDetail.status === 'new' && (
                  <View style={styles.detailActions}>
                    <TouchableOpacity
                      style={[styles.detailActionButton, styles.detailRejectButton]}
                      onPress={() => handleUpdateBookingStatus('rejected')}
                      disabled={isUpdatingStatus}
                    >
                      <XCircle size={18} color="#B42318" />
                      <Text style={styles.detailRejectText}>
                        {isUpdatingStatus ? 'Updating...' : 'Reject'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.detailActionButton, styles.detailAcceptButton]}
                      onPress={() => handleUpdateBookingStatus('accepted')}
                      disabled={isUpdatingStatus}
                    >
                      <CheckCircle size={18} color={colors.white} />
                      <Text style={styles.detailAcceptText}>
                        {isUpdatingStatus ? 'Updating...' : 'Accept'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {bookingDetail.status !== 'new' && (
                  <View style={styles.detailStatusMessage}>
                    <Text style={styles.detailStatusMessageText}>
                      This request has been {bookingDetail.status}.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
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
  notificationClickable: {
    backgroundColor: colors.primary + '08',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  detailModalCard: {
    maxWidth: 480,
    maxHeight: '80%',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailLoading: {
    color: colors.gray[500],
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 24,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  detailProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.gray[50],
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  detailAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAvatarText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  detailProfileInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 2,
  },
  detailSubInfo: {
    fontSize: 12,
    color: colors.gray[600],
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailGridItem: {
    width: '48%',
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  detailLabel: {
    fontSize: 11,
    color: colors.gray[500],
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[900],
  },
  detailStatusBadge: {
    fontSize: 13,
    fontWeight: '600',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  detailStatusNew: {
    backgroundColor: '#FFF6E5',
    color: '#9A6B00',
  },
  detailStatusAccepted: {
    backgroundColor: '#E7F7EF',
    color: '#0F8A5F',
  },
  detailStatusRejected: {
    backgroundColor: '#FDECEC',
    color: '#B42318',
  },
  detailEmptyHistory: {
    fontSize: 13,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: 12,
  },
  detailHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  detailHistoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  detailHistoryContent: {
    flex: 1,
  },
  detailHistoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[900],
  },
  detailHistoryDate: {
    fontSize: 11,
    color: colors.gray[500],
  },
  detailHistoryStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  detailActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  detailRejectButton: {
    backgroundColor: '#FDECEC',
    borderWidth: 1,
    borderColor: '#F9C5C5',
  },
  detailAcceptButton: {
    backgroundColor: colors.primary,
  },
  detailRejectText: {
    color: '#B42318',
    fontWeight: '600',
    fontSize: 14,
  },
  detailAcceptText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  detailStatusMessage: {
    backgroundColor: colors.gray[50],
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  detailStatusMessageText: {
    fontSize: 13,
    color: colors.gray[600],
    fontWeight: '500',
  },
});