import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import {
  ChevronDown,
  Calendar,
  GraduationCap,
  CircleDollarSign,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
} from 'lucide-react-native';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';
import { spacing, borderRadius, shadows } from '../../../styles/spacing';
import { supabase } from '../../../services/supabase';
import { useAuthContext } from '../../../context/AuthContext';
import { useResponsive } from '../../../hooks/useResponsive';

// ─── Types ───────────────────────────────────────────────────
interface Property {
  id: string;
  name: string;
}

interface TenantPayment {
  id: string;
  tenantId: string;
  tenantName: string;
  school: string;
  yearLevel: string;
  dateStarted: string;
  status: 'active' | 'left';
  paymentStatus: 'paid' | 'pending' | 'due' | null;
  paymentId: string | null;
  dueDate: string | null;
  paidAt: string | null;
  amount: number | null;
  propertyName: string;
  propertyId: string;
}

type PaymentFilter = 'all' | 'paid' | 'pending' | 'due';

// ─── Helpers ─────────────────────────────────────────────────
const formatDate = (date: string | null) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

// ─── Component ───────────────────────────────────────────────
export const PaymentsScreen: React.FC = () => {
  const { user } = useAuthContext();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const isCompact = isMobile || isTablet;

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const [tenantPayments, setTenantPayments] = useState<TenantPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PaymentFilter>('all');

  // Update status modal
  const [selectedTenant, setSelectedTenant] = useState<TenantPayment | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch properties
  const fetchProperties = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('properties')
      .select('id, name')
      .eq('owner_id', user.id)
      .order('name');
    if (data) setProperties(data);
  }, [user?.id]);

  // Fetch tenants with payments
  const fetchTenantPayments = useCallback(async (showFullLoader = true) => {
    if (!user?.id) return;
    if (showFullLoader) setIsLoading(true);
    setError(null);

    try {
      const { data: props, error: propsError } = await supabase
        .from('properties')
        .select('id, name')
        .eq('owner_id', user.id);

      if (propsError) throw propsError;
      if (!props || props.length === 0) {
        setTenantPayments([]);
        return;
      }

      const propertyMap = new Map(props.map(p => [p.id, p.name]));
      let propertyIds = props.map(p => p.id);

      if (selectedProperty !== 'all') {
        propertyIds = [selectedProperty];
      }

      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, name, year_level, school, date_started, status, property_id, tenant_payments(id, status, due_date, paid_at, amount)')
        .in('property_id', propertyIds)
        .eq('status', 'active')
        .order('date_started', { ascending: false });

      if (tenantsError) throw tenantsError;

      const mapped: TenantPayment[] = (tenantsData ?? []).map((t: any) => {
        const payments = Array.isArray(t.tenant_payments) ? t.tenant_payments : [];
        const latest = payments
          .filter((p: any) => p?.due_date)
          .sort((a: any, b: any) => String(b.due_date).localeCompare(String(a.due_date)))[0] || null;

        return {
          id: t.id + (latest?.id || ''),
          tenantId: t.id,
          tenantName: t.name,
          school: t.school || 'Not specified',
          yearLevel: t.year_level || '—',
          dateStarted: t.date_started || '—',
          status: t.status,
          paymentStatus: latest?.status || null,
          paymentId: latest?.id || null,
          dueDate: latest?.due_date || null,
          paidAt: latest?.paid_at || null,
          amount: latest?.amount || null,
          propertyName: propertyMap.get(t.property_id) || 'Unknown',
          propertyId: t.property_id,
        };
      });

      setTenantPayments(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment data.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, selectedProperty]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);
  useEffect(() => { fetchTenantPayments(); }, [fetchTenantPayments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTenantPayments(false);
  };

  // Filter tenants by payment status
  const filteredTenants = tenantPayments.filter(t => {
    if (statusFilter === 'all') return true;
    return t.paymentStatus === statusFilter;
  });

  // Update payment status
  const handleUpdateStatus = async (newStatus: 'paid' | 'pending' | 'due') => {
    if (!selectedTenant) return;
    setIsUpdating(true);

    try {
      if (selectedTenant.paymentId) {
        // Update existing payment
        const updateData: any = { status: newStatus };
        if (newStatus === 'paid') {
          updateData.paid_at = new Date().toISOString();
        } else {
          updateData.paid_at = null;
        }
        const { error } = await supabase
          .from('tenant_payments')
          .update(updateData)
          .eq('id', selectedTenant.paymentId);
        if (error) throw error;
      } else {
        // Create new payment record
        const now = new Date();
        const { error } = await supabase
          .from('tenant_payments')
          .insert({
            tenant_id: selectedTenant.tenantId,
            amount: 0,
            due_date: now.toISOString().split('T')[0],
            status: newStatus,
            paid_at: newStatus === 'paid' ? now.toISOString() : null,
          });
        if (error) throw error;
      }

      setShowStatusModal(false);
      setSelectedTenant(null);
      fetchTenantPayments(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      if (Platform.OS === 'web') {
        alert(msg);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // ─── Stats ─────────────────────────────────────────────────
  const paidCount = tenantPayments.filter(t => t.paymentStatus === 'paid').length;
  const pendingCount = tenantPayments.filter(t => t.paymentStatus === 'pending').length;
  const dueCount = tenantPayments.filter(t => t.paymentStatus === 'due').length;

  const selectedPropertyName = selectedProperty === 'all'
    ? 'All Properties'
    : properties.find(p => p.id === selectedProperty)?.name || 'Select';

  // ─── Render Status Badge ──────────────────────────────────
  const renderStatusBadge = (status: string | null, small = false) => {
    const s = getStatusStyle(status);
    return (
      <View style={[
        styles.statusBadge,
        { backgroundColor: s.bg, borderColor: s.border },
        small && styles.statusBadgeSmall,
      ]}>
        <Text style={[
          styles.statusBadgeText,
          { color: s.text },
          small && styles.statusBadgeTextSmall,
        ]}>
          {s.label}
        </Text>
      </View>
    );
  };

  // ─── Render Tenant Card (Mobile/Tablet) ────────────────────
  const renderTenantCard = (tenant: TenantPayment) => (
    <TouchableOpacity
      key={tenant.id}
      style={[styles.tenantCard, isTablet && styles.tenantCardTablet]}
      activeOpacity={0.7}
      onPress={() => { setSelectedTenant(tenant); setShowStatusModal(true); }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardNameRow}>
          <Text style={styles.cardName} numberOfLines={1}>{tenant.tenantName}</Text>
          {renderStatusBadge(tenant.paymentStatus)}
        </View>
        {selectedProperty === 'all' && (
          <Text style={styles.cardProperty} numberOfLines={1}>{tenant.propertyName}</Text>
        )}
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.cardDetailRow}>
          <GraduationCap size={14} color={colors.gray[400]} />
          <Text style={styles.cardDetailText}>{tenant.school} • {tenant.yearLevel}</Text>
        </View>
        <View style={styles.cardDetailRow}>
          <Calendar size={14} color={colors.gray[400]} />
          <Text style={styles.cardDetailText}>Since {formatDate(tenant.dateStarted)}</Text>
        </View>
        {tenant.dueDate && (
          <View style={styles.cardDetailRow}>
            <Clock size={14} color={colors.gray[400]} />
            <Text style={styles.cardDetailText}>Due: {formatDate(tenant.dueDate)}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardUpdateHint}>Tap to update status</Text>
      </View>
    </TouchableOpacity>
  );

  // ─── Render Table Row (Desktop) ────────────────────────────
  const renderTableRow = (tenant: TenantPayment, index: number) => (
    <TouchableOpacity
      key={tenant.id}
      style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}
      activeOpacity={0.7}
      onPress={() => { setSelectedTenant(tenant); setShowStatusModal(true); }}
    >
      <Text style={[styles.tableCell, styles.tableCellName]} numberOfLines={1}>{tenant.tenantName}</Text>
      {selectedProperty === 'all' && (
        <Text style={[styles.tableCell, styles.tableCellProperty]} numberOfLines={1}>{tenant.propertyName}</Text>
      )}
      <Text style={[styles.tableCell, styles.tableCellSchool]} numberOfLines={1}>{tenant.school}</Text>
      <Text style={[styles.tableCell, styles.tableCellDate]}>{formatDate(tenant.dateStarted)}</Text>
      <Text style={[styles.tableCell, styles.tableCellDate]}>{formatDate(tenant.dueDate)}</Text>
      <View style={[styles.tableCellStatus]}>
        {renderStatusBadge(tenant.paymentStatus, true)}
      </View>
    </TouchableOpacity>
  );

  // ─── Render Status Update Modal ────────────────────────────
  const renderStatusModal = () => (
    <Modal
      visible={showStatusModal}
      transparent
      animationType="fade"
      onRequestClose={() => { setShowStatusModal(false); setSelectedTenant(null); }}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => { setShowStatusModal(false); setSelectedTenant(null); }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={[styles.modalContent, isCompact && styles.modalContentCompact]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Payment Status</Text>
            <TouchableOpacity onPress={() => { setShowStatusModal(false); setSelectedTenant(null); }}>
              <X size={22} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          {selectedTenant && (
            <View style={styles.modalTenantInfo}>
              <Text style={styles.modalTenantName}>{selectedTenant.tenantName}</Text>
              <Text style={styles.modalTenantDetail}>{selectedTenant.propertyName}</Text>
              {selectedTenant.dueDate && (
                <Text style={styles.modalTenantDetail}>Due date: {formatDate(selectedTenant.dueDate)}</Text>
              )}
              <View style={styles.modalCurrentStatus}>
                <Text style={styles.modalCurrentLabel}>Current:</Text>
                {renderStatusBadge(selectedTenant.paymentStatus, true)}
              </View>
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.statusOption, styles.statusOptionPaid]}
              onPress={() => handleUpdateStatus('paid')}
              disabled={isUpdating}
            >
              <CheckCircle size={20} color="#0F8A5F" />
              <Text style={[styles.statusOptionText, { color: '#0F8A5F' }]}>Paid</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusOption, styles.statusOptionPending]}
              onPress={() => handleUpdateStatus('pending')}
              disabled={isUpdating}
            >
              <Clock size={20} color="#9A6B00" />
              <Text style={[styles.statusOptionText, { color: '#9A6B00' }]}>Pending</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusOption, styles.statusOptionDue]}
              onPress={() => handleUpdateStatus('due')}
              disabled={isUpdating}
            >
              <AlertTriangle size={20} color="#B42318" />
              <Text style={[styles.statusOptionText, { color: '#B42318' }]}>Due</Text>
            </TouchableOpacity>
          </View>

          {isUpdating && (
            <ActivityIndicator style={{ marginTop: 12 }} color={colors.primary} />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  // ─── Property Picker Modal ─────────────────────────────────
  const renderPropertyPicker = () => (
    <Modal
      visible={showPropertyPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPropertyPicker(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowPropertyPicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={[styles.modalContent, isCompact && styles.modalContentCompact]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Property</Text>
            <TouchableOpacity onPress={() => setShowPropertyPicker(false)}>
              <X size={22} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerList}>
            <TouchableOpacity
              style={[styles.pickerItem, selectedProperty === 'all' && styles.pickerItemActive]}
              onPress={() => { setSelectedProperty('all'); setShowPropertyPicker(false); }}
            >
              <Text style={[styles.pickerItemText, selectedProperty === 'all' && styles.pickerItemTextActive]}>
                All Properties
              </Text>
            </TouchableOpacity>
            {properties.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.pickerItem, selectedProperty === p.id && styles.pickerItemActive]}
                onPress={() => { setSelectedProperty(p.id); setShowPropertyPicker(false); }}
              >
                <Text style={[styles.pickerItemText, selectedProperty === p.id && styles.pickerItemTextActive]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  // ─── Main Render ───────────────────────────────────────────
  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >  
      <View style={styles.header}>
        <View>
          <Text style={[typography.textStyles.h2, styles.headerTitle]}>Payments</Text>
          <Text style={[typography.textStyles.bodySmall, styles.headerSubtitle]}>Track tenant payment status</Text>
        </View>
      </View>
        {/* Property Selector */}
        {properties.length > 1 && (
          <TouchableOpacity
            style={styles.propertySelector}
            onPress={() => setShowPropertyPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.propertySelectorText} numberOfLines={1}>{selectedPropertyName}</Text>
            <ChevronDown size={18} color={colors.gray[500]} />
          </TouchableOpacity>
        )}

        {/* Stats Row */}
        <View style={[styles.statsRow, isCompact && styles.statsRowCompact]}>
          <View style={[styles.statCard, styles.statCardTotal]}>
            <Text style={styles.statNumber}>{tenantPayments.length}</Text>
            <Text style={styles.statLabel}>Total Tenants</Text>
          </View>
          <View style={[styles.statCard, styles.statCardPaid]}>
            <Text style={[styles.statNumber, { color: '#0F8A5F' }]}>{paidCount}</Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          <View style={[styles.statCard, styles.statCardPending]}>
            <Text style={[styles.statNumber, { color: '#9A6B00' }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, styles.statCardDue]}>
            <Text style={[styles.statNumber, { color: '#B42318' }]}>{dueCount}</Text>
            <Text style={styles.statLabel}>Due</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {(['all', 'paid', 'pending', 'due'] as PaymentFilter[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
              onPress={() => setStatusFilter(f)}
            >
              <Text style={[styles.filterChipText, statusFilter === f && styles.filterChipTextActive]}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading */}
        {isLoading && (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {/* Error */}
        {error && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchTenantPayments()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty */}
        {!isLoading && !error && filteredTenants.length === 0 && (
          <View style={styles.emptyState}>
            <CircleDollarSign size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>
              {tenantPayments.length === 0 ? 'No tenants yet' : 'No matching tenants'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {tenantPayments.length === 0
                ? 'Add tenants from your dashboard to track payments'
                : 'Try changing the filter'}
            </Text>
          </View>
        )}

        {/* Tenant List - Mobile/Tablet Cards */}
        {!isLoading && !error && filteredTenants.length > 0 && isCompact && (
          <View style={[styles.cardsGrid, isTablet && styles.cardsGridTablet]}>
            {filteredTenants.map(renderTenantCard)}
          </View>
        )}

        {/* Tenant List - Desktop Table */}
        {!isLoading && !error && filteredTenants.length > 0 && isDesktop && (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.tableCellName]}>Tenant</Text>
              {selectedProperty === 'all' && (
                <Text style={[styles.tableHeaderCell, styles.tableCellProperty]}>Property</Text>
              )}
              <Text style={[styles.tableHeaderCell, styles.tableCellSchool]}>School</Text>
              <Text style={[styles.tableHeaderCell, styles.tableCellDate]}>Started</Text>
              <Text style={[styles.tableHeaderCell, styles.tableCellDate]}>Due Date</Text>
              <Text style={[styles.tableHeaderCell, styles.tableCellStatus]}>Status</Text>
            </View>
            {filteredTenants.map(renderTableRow)}
          </View>
        )}
      </ScrollView>

      {renderStatusModal()}
      {renderPropertyPicker()}
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    marginBottom: spacing[5],
  },
  headerTitle: {
    color: colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },

  // Property Selector
  propertySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  propertySelectorText: {
    fontSize: 14,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[800],
    flex: 1,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  statsRowCompact: {
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  statCard: {
    flex: 1,
    minWidth: 70,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  statCardTotal: {},
  statCardPaid: {
    borderColor: '#BFEAD7',
  },
  statCardPending: {
    borderColor: '#FFE2A6',
  },
  statCardDue: {
    borderColor: '#F9C5C5',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Figtree_700Bold',
    color: colors.gray[900],
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[500],
    marginTop: 2,
    textAlign: 'center'
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  filterChip: {
    paddingVertical: spacing[1] + 2,
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[600],
  },
  filterChipTextActive: {
    color: colors.white,
  },

  // Cards Grid
  cardsGrid: {
    gap: spacing[3],
  },
  cardsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Tenant Card
  tenantCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.gray[100],
    ...shadows.sm,
  },
  tenantCardTablet: {
    width: '48.5%' as any,
  },
  cardHeader: {
    marginBottom: spacing[3],
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  cardName: {
    fontSize: 15,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[900],
    flex: 1,
  },
  cardProperty: {
    fontSize: 12,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[500],
    marginTop: 2,
  },
  cardDetails: {
    gap: spacing[2],
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  cardDetailText: {
    fontSize: 13,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[600],
  },
  cardFooter: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  cardUpdateHint: {
    fontSize: 12,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[400],
    textAlign: 'center',
  },

  // Status Badge
  statusBadge: {
    borderRadius: borderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  statusBadgeSmall: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: 'Figtree_600SemiBold',
    textAlign: 'center',
  },
  statusBadgeTextSmall: {
    fontSize: 11,
  },

  // Desktop Table
  tableContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  tableHeaderCell: {
    fontSize: 12,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  tableRowEven: {
    backgroundColor: colors.gray[50],
  },
  tableCell: {
    fontSize: 13,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[700],
  },
  tableCellName: {
    flex: 2,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[900],
  },
  tableCellProperty: {
    flex: 2,
  },
  tableCellSchool: {
    flex: 2,
  },
  tableCellDate: {
    flex: 1.5,
  },
  tableCellStatus: {
    flex: 1,
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[12],
    gap: spacing[3],
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
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Figtree_400Regular',
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.white,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    width: '100%',
    maxWidth: 400,
  },
  modalContentCompact: {
    maxWidth: '100%' as any,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[900],
  },
  modalTenantInfo: {
    marginBottom: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  modalTenantName: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[900],
    marginBottom: 4,
  },
  modalTenantDetail: {
    fontSize: 13,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[500],
    marginTop: 2,
  },
  modalCurrentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  modalCurrentLabel: {
    fontSize: 13,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[600],
  },
  modalActions: {
    gap: spacing[3],
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3] + 2,
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  statusOptionPaid: {
    backgroundColor: '#E7F7EF',
    borderColor: '#BFEAD7',
  },
  statusOptionPending: {
    backgroundColor: '#FFF6E5',
    borderColor: '#FFE2A6',
  },
  statusOptionDue: {
    backgroundColor: '#FDECEC',
    borderColor: '#F9C5C5',
  },
  statusOptionText: {
    fontSize: 15,
    fontFamily: 'Figtree_600SemiBold',
  },

  // Picker Modal
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    marginBottom: spacing[1],
  },
  pickerItemActive: {
    backgroundColor: colors.primary + '15',
  },
  pickerItemText: {
    fontSize: 15,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[700],
  },
  pickerItemTextActive: {
    color: colors.primary,
    fontFamily: 'Figtree_600SemiBold',
  },
});
