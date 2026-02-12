import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, BellOff } from 'lucide-react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { supabase } from '../../services/supabase';
import { useAuthContext } from '../../context/AuthContext';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

const timeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ visible, onClose }) => {
  const { user, isAuthenticated } = useAuthContext();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id || !isAuthenticated) return;

    setIsLoading(true);
    try {
      if (user.userType === 'owner') {
        const { data } = await supabase
          .from('owner_notifications')
          .select('id, title, body, is_read, created_at')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30);

        setNotifications(
          (data || []).map((n) => ({
            id: n.id,
            title: n.title,
            body: n.body || '',
            createdAt: n.created_at,
            isRead: n.is_read,
          }))
        );
      } else {
        // Tenant: show booking status updates as notifications
        const { data } = await supabase
          .from('booking_requests')
          .select('id, status, updated_at, properties:property_id(name)')
          .eq('requester_id', user.id)
          .in('status', ['accepted', 'rejected'])
          .order('updated_at', { ascending: false })
          .limit(30);

        setNotifications(
          (data || []).map((b) => {
            const prop = b.properties as any;
            const propertyName = prop?.name || 'a property';
            const isAccepted = b.status === 'accepted';
            return {
              id: b.id,
              title: isAccepted ? 'Booking Accepted' : 'Booking Declined',
              body: isAccepted
                ? `Your booking for ${propertyName} has been accepted!`
                : `Your booking for ${propertyName} was declined.`,
              createdAt: b.updated_at,
              isRead: true,
            };
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.userType, isAuthenticated]);

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible, fetchNotifications]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={[typography.textStyles.h4, styles.headerTitle]}>Notifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <BellOff size={48} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>
                We'll notify you about booking updates and important announcements.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {notifications.map((n) => (
                <View
                  key={n.id}
                  style={[styles.notificationItem, !n.isRead && styles.notificationUnread]}
                >
                  <View style={styles.dotColumn}>
                    {!n.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{n.title}</Text>
                    <Text style={styles.notificationBody} numberOfLines={2}>
                      {n.body}
                    </Text>
                    <Text style={styles.notificationTime}>{timeAgo(n.createdAt)}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingRight: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: 360,
    maxWidth: '95%',
    maxHeight: '70%',
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    color: colors.gray[900],
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[700],
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    maxHeight: 400,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  notificationUnread: {
    backgroundColor: colors.primary + '08',
  },
  dotColumn: {
    width: 20,
    paddingTop: 6,
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notificationContent: {
    flex: 1,
    gap: 2,
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[900],
  },
  notificationBody: {
    fontSize: 13,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[600],
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[400],
    marginTop: 4,
  },
});
