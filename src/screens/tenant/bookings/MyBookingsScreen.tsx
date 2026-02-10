import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { Calendar, MapPin, Users, Clock } from 'lucide-react-native';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';
import { supabase } from '../../../services/supabase';
import { useAuthContext } from '../../../context/AuthContext';

interface BookingRequest {
  id: string;
  propertyName: string;
  startDate: string | null;
  endDate: string | null;
  headsCount: number | null;
  status: string;
  createdAt: string;
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

export const MyBookingsScreen: React.FC = () => {
  const { user } = useAuthContext();
  const [bookings, setBookings] = React.useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [cancelModalVisible, setCancelModalVisible] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState<BookingRequest | null>(null);
  const [isCancelling, setIsCancelling] = React.useState(false);

  const fetchBookings = React.useCallback(async () => {
    if (!user?.id) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('booking_requests')
        .select('id, start_date, end_date, heads_count, status, created_at, properties:property_id(name)')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setBookings(data.map((row: any) => ({
          id: row.id,
          propertyName: row.properties?.name || 'Unknown property',
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

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBookings();
  };

  const handleCancelBooking = (booking: BookingRequest) => {
    if (booking.status !== 'new') return;
    setSelectedBooking(booking);
    setCancelModalVisible(true);
  };

  const confirmCancel = async () => {
    if (!selectedBooking) return;
    setIsCancelling(true);

    const { error } = await supabase
      .from('booking_requests')
      .update({ status: 'cancelled' })
      .eq('id', selectedBooking.id);

    setIsCancelling(false);

    if (error) {
      setCancelModalVisible(false);
      setSelectedBooking(null);
      return;
    }

    setBookings((prev) =>
      prev.map((b) => b.id === selectedBooking.id ? { ...b, status: 'cancelled' } : b)
    );
    setCancelModalVisible(false);
    setSelectedBooking(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.textStyles.h2, styles.title]}>My Bookings</Text>
        <Text style={[typography.textStyles.body, styles.subtitle]}>
          Track your reservation requests
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
          <Text style={styles.emptyText}>Loading bookings...</Text>
        )}

        {!isLoading && bookings.length === 0 && (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No booking requests yet</Text>
            <Text style={styles.emptySubtitle}>
              When you submit a booking request, it will appear here.
            </Text>
          </View>
        )}

        {!isLoading && bookings.map((booking) => {
          const config = statusConfig[booking.status] || statusConfig.new;

          const canCancel = booking.status === 'new';

          return (
            <TouchableOpacity
              key={booking.id}
              style={styles.card}
              onPress={() => handleCancelBooking(booking)}
              disabled={!canCancel}
              activeOpacity={canCancel ? 0.7 : 1}
            >
              <View style={styles.cardHeader}>
                <View style={styles.propertyRow}>
                  <MapPin size={14} color={colors.primary} />
                  <Text style={styles.propertyName} numberOfLines={1}>
                    {booking.propertyName}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: config.bg, borderColor: config.border }]}>
                  <Text style={[styles.statusText, { color: config.text }]}>
                    {config.label}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.detailRow}>
                  <Calendar size={13} color={colors.gray[500]} />
                  <Text style={styles.detailText}>
                    {booking.startDate || 'No date'}{booking.endDate ? ` — ${booking.endDate}` : ''}
                  </Text>
                </View>
                {booking.headsCount != null && (
                  <View style={styles.detailRow}>
                    <Users size={13} color={colors.gray[500]} />
                    <Text style={styles.detailText}>
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
                {canCancel && (
                  <Text style={styles.cancelHint}>Tap to cancel</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => { setCancelModalVisible(false); setSelectedBooking(null); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cancel Booking</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to cancel your booking request for{' '}
              <Text style={styles.modalPropertyName}>{selectedBooking?.propertyName}</Text>?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={() => { setCancelModalVisible(false); setSelectedBooking(null); }}
                disabled={isCancelling}
              >
                <Text style={styles.modalBtnSecondaryText}>No, Keep It</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnDestructive, isCancelling && styles.modalBtnDisabled]}
                onPress={confirmCancel}
                disabled={isCancelling}
              >
                <Text style={styles.modalBtnDestructiveText}>
                  {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
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
    backgroundColor: '#F7F8FA',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    color: colors.primary,
    marginBottom: 4,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[700],
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 13,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: 24,
  },
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
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: '600',
  },
  cardBody: {
    gap: 6,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
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
    color: colors.gray[400],
  },
  cancelHint: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 21,
    marginBottom: 24,
  },
  modalPropertyName: {
    fontWeight: '600',
    color: colors.gray[800],
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
  },
  modalBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
  },
  modalBtnDestructive: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  modalBtnDestructiveText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  modalBtnDisabled: {
    opacity: 0.6,
  },
});
