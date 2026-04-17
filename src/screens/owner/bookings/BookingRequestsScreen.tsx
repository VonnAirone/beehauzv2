import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Calendar, Users, Clock, CheckCircle, XCircle, User, Home, X } from 'lucide-react-native';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';
import { supabase } from '../../../services/supabase';
import { useAuthContext } from '../../../context/AuthContext';

interface BookingRequest {
  id: string;
  requesterId: string | null;
  propertyName: string;
  requesterName: string;
  startDate: string | null;
  endDate: string | null;
  headsCount: number | null;
  status: string;
  createdAt: string;
}

interface BookingDetail {
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
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  new: { label: 'Pending', bg: '#FFF6E5', text: '#9A6B00', border: '#FFE2A6' },
  accepted: { label: 'Accepted', bg: '#E7F7EF', text: '#0F8A5F', border: '#BFEAD7' },
  rejected: { label: 'Rejected', bg: '#FDECEC', text: '#B42318', border: '#F9C5C5' },
  cancelled: { label: 'Cancelled', bg: '#F2F4F7', text: '#6B7280', border: '#E5E7EB' },
};

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
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
};

export const BookingRequestsScreen: React.FC = () => {
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Detail modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    try {
      // Get owner's property IDs
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', user.id);

      if (!properties || properties.length === 0) {
        setBookings([]);
        return;
      }

      const propertyIds = properties.map((p: any) => p.id);

      // Fetch booking requests for those properties
      const { data } = await supabase
        .from('booking_requests')
        .select('id, requester_id, requester_name, start_date, end_date, heads_count, status, created_at, properties:property_id(name)')
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false });

      if (data) {
        setBookings(data.map((row: any) => ({
          id: row.id,
          requesterId: row.requester_id || null,
          propertyName: row.properties?.name || 'Unknown property',
          requesterName: row.requester_name || 'Unknown',
          startDate: row.start_date,
          endDate: row.end_date,
          headsCount: row.heads_count,
          status: row.status,
          createdAt: row.created_at,
        })));
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBookings();
  };

  const handleCardPress = async (booking: BookingRequest) => {
    setModalVisible(true);
    setBookingDetail(null);
    setIsLoadingDetail(true);

    try {
      let requesterEmail: string | null = null;
      let requesterPhone: string | null = null;

      if (booking.requesterId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name, phone')
          .eq('id', booking.requesterId)
          .maybeSingle();

        if (profile) {
          requesterEmail = profile.email || null;
          requesterPhone = profile.phone || null;
        }
      }

      let history: Array<{ propertyName: string; dateStarted: string; dateLeft: string | null; status: string }> = [];

      if (booking.requesterId) {
        const { data: tenantRecords } = await supabase
          .from('tenants')
          .select('date_started, date_left, status, properties:property_id(name)')
          .eq('user_id', booking.requesterId)
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
        requestId: booking.id,
        requesterName: booking.requesterName,
        requesterEmail,
        requesterPhone,
        startDate: booking.startDate,
        endDate: booking.endDate,
        headsCount: booking.headsCount,
        status: booking.status,
        createdAt: booking.createdAt,
        history,
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (status: 'accepted' | 'rejected') => {
    if (!bookingDetail) return;
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({ status })
        .eq('id', bookingDetail.requestId);

      if (error) return;

      setBookingDetail((prev) => prev ? { ...prev, status } : null);
      setBookings((prev) =>
        prev.map((b) => b.id === bookingDetail.requestId ? { ...b, status } : b)
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setBookingDetail(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.textStyles.h4, styles.title]}>Booking Requests</Text>
        <Text style={[typography.textStyles.bodySmall, styles.subtitle]}>
          Review and manage tenant applications
        </Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
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

        {!isLoading && bookings.length === 0 && (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No booking requests yet</Text>
            <Text style={styles.emptySubtitle}>
              When tenants submit a booking request for your properties, it will appear here.
            </Text>
          </View>
        )}

        {!isLoading && bookings.map((booking) => {
          const config = statusConfig[booking.status] || statusConfig.new;
          const isPending = booking.status === 'new';

          return (
            <TouchableOpacity
              key={booking.id}
              style={styles.card}
              onPress={() => handleCardPress(booking)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.propertyRow}>
                  <Text style={styles.propertyName} numberOfLines={1}>
                    Booking Request
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: config.bg, borderColor: config.border }]}>
                  <Text style={[styles.statusText, { color: config.text }]}>
                    {config.label}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardDetailRow}>
                  <Users size={13} color={colors.gray[500]} />
                  <Text style={styles.cardDetailText}>
                    {booking.requesterName}
                  </Text>
                </View>
                <View style={styles.cardDetailRow}>
                  <Calendar size={13} color={colors.gray[500]} />
                  <Text style={styles.cardDetailText}>
                    {booking.startDate || 'No date'}{booking.endDate ? ` — ${booking.endDate}` : ''}
                  </Text>
                </View>
                {booking.headsCount != null && (
                  <View style={styles.cardDetailRow}>
                    <Users size={13} color={colors.gray[500]} />
                    <Text style={styles.cardDetailText}>
                      {booking.headsCount} {booking.headsCount === 1 ? 'person' : 'people'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.timeRow}>
                  <Clock size={11} color={colors.gray[400]} />
                  <Text style={styles.timeText}>Submitted {formatTimeAgo(booking.createdAt)}</Text>
                </View>
                {isPending && (
                  <Text style={styles.actionHint}>Tap to review</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Booking Detail Modal (matches Dashboard style) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.modalTitle}>Booking Request</Text>
              <TouchableOpacity onPress={closeModal}>
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
                      onPress={() => handleUpdateStatus('rejected')}
                      disabled={isUpdating}
                    >
                      <XCircle size={18} color="#B42318" />
                      <Text style={styles.detailRejectText}>
                        {isUpdating ? 'Updating...' : 'Reject'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.detailActionButton, styles.detailAcceptButton]}
                      onPress={() => handleUpdateStatus('accepted')}
                      disabled={isUpdating}
                    >
                      <CheckCircle size={18} color={colors.white} />
                      <Text style={styles.detailAcceptText}>
                        {isUpdating ? 'Updating...' : 'Accept'}
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
    backgroundColor: '#F7F8FA',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.gray[600],
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
    gap: 12,
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

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  propertyName: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[900],
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Figtree_600SemiBold',
  },
  cardBody: {
    gap: 6,
    marginBottom: 10,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardDetailText: {
    fontSize: 12,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[600],
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[400],
  },
  actionHint: {
    fontSize: 11,
    fontFamily: 'Figtree_500Medium',
    color: colors.primary,
  },

  // Detail Modal (matching Dashboard style)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
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
