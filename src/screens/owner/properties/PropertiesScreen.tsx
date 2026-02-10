import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  Home,
  MapPin,
  DollarSign,
  FileText,
  Pencil,
  X,
  Check,
  GraduationCap,
  Star,
  MessageSquare,
  User,
} from 'lucide-react-native';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';
import { spacing, shadows } from '../../../styles/spacing';
import { supabase } from '../../../services/supabase';
import { useAuthContext } from '../../../context/AuthContext';
import { useResponsive } from '../../../hooks/useResponsive';
import { Input } from '../../../components/common';
import { LocationPickerMap } from '../../../components/common/LocationPickerMap';

interface OwnerProperty {
  id: string;
  name: string;
  address: string | null;
  description: string | null;
  price: number | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  is_accredited: boolean;
  created_at: string;
}

interface EditFormData {
  name: string;
  address: string;
  description: string;
  price: string;
  latitude: number | null;
  longitude: number | null;
  is_accredited: boolean;
}

interface PropertyReview {
  id: string;
  property_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  tenant: { full_name: string | null };
  property: { name: string };
}

export const PropertiesScreen: React.FC = () => {
  const { user } = useAuthContext();
  const { isMobile, isDesktop } = useResponsive();

  const [properties, setProperties] = React.useState<OwnerProperty[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Edit modal state
  const [editingProperty, setEditingProperty] = React.useState<OwnerProperty | null>(null);
  const [editForm, setEditForm] = React.useState<EditFormData>({
    name: '',
    address: '',
    description: '',
    price: '',
    latitude: null,
    longitude: null,
    is_accredited: false,
  });
  const [isSaving, setIsSaving] = React.useState(false);

  // Reviews state
  const [reviews, setReviews] = React.useState<PropertyReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = React.useState(false);
  const [selectedPropertyFilter, setSelectedPropertyFilter] = React.useState<string | null>(null);

  const fetchProperties = React.useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from('properties')
        .select('id, name, address, description, price, latitude, longitude, image_url, is_accredited, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setProperties(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Fetch reviews for all owner properties
  const fetchReviews = React.useCallback(async () => {
    if (properties.length === 0) return;
    setReviewsLoading(true);

    try {
      const propertyIds = properties.map((p) => p.id);
      const { data, error: fetchErr } = await supabase
        .from('property_reviews')
        .select('id, property_id, rating, comment, created_at, tenant:profiles!tenant_id(full_name), property:properties!property_id(name)')
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setReviews((data as unknown as PropertyReview[]) ?? []);
    } catch {
      // Silently fail — reviews are supplementary
    } finally {
      setReviewsLoading(false);
    }
  }, [properties]);

  React.useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filteredReviews = selectedPropertyFilter
    ? reviews.filter((r) => r.property_id === selectedPropertyFilter)
    : reviews;

  const openEditModal = (property: OwnerProperty) => {
    setEditingProperty(property);
    setEditForm({
      name: property.name || '',
      address: property.address || '',
      description: property.description || '',
      price: property.price != null ? String(property.price) : '',
      latitude: property.latitude,
      longitude: property.longitude,
      is_accredited: property.is_accredited,
    });
  };

  const closeEditModal = () => {
    setEditingProperty(null);
  };

  const handleSave = async () => {
    if (!editingProperty) return;
    if (!editForm.name.trim()) {
      Alert.alert('Validation', 'Property name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const updates: Record<string, any> = {
        name: editForm.name.trim(),
        address: editForm.address.trim() || null,
        description: editForm.description.trim() || null,
        price: editForm.price ? parseFloat(editForm.price) : null,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        is_accredited: editForm.is_accredited,
      };

      if (editForm.latitude != null && editForm.longitude != null) {
        updates.geocoded_at = new Date().toISOString();
      }

      const { error: updateErr } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', editingProperty.id);

      if (updateErr) throw updateErr;

      setProperties((prev) =>
        prev.map((p) => (p.id === editingProperty.id ? { ...p, ...updates } : p)),
      );

      Alert.alert('Success', 'Property updated successfully.');
      closeEditModal();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update property.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (value: number | null) => {
    if (value == null) return 'Not set';
    return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;
  };

  // ─── Property Card ────────────────────────────────────────────
  const renderPropertyCard = (property: OwnerProperty) => {
    const cardWidth = isDesktop ? '48%' : '100%';

    return (
      <View key={property.id} style={[styles.card, { width: cardWidth as any }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Home size={18} color={colors.primary} />
            <Text style={[typography.textStyles.h4, styles.cardTitle]} numberOfLines={2}>
              {property.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(property)}
            activeOpacity={0.7}
          >
            <Pencil size={15} color={colors.white} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Accredited badge */}
        {property.is_accredited && (
          <View style={styles.accreditedBadge}>
            <GraduationCap size={13} color={colors.white} />
            <Text style={styles.accreditedText}>Accredited</Text>
          </View>
        )}

        {/* Details */}
        <View>
          <DetailRow
            icon={<MapPin size={14} color={colors.text.secondary} />}
            label="Address"
            value={property.address || 'Not set'}
          />
          <DetailRow
            icon={<DollarSign size={14} color={colors.text.secondary} />}
            label="Monthly Rate"
            value={formatPrice(property.price)}
            valueColor={property.price != null ? colors.primary : colors.text.tertiary}
          />
          <DetailRow
            icon={<FileText size={14} color={colors.text.secondary} />}
            label="Description"
            value={property.description || 'No description'}
            numberOfLines={2}
          />
          <DetailRow
            icon={<MapPin size={14} color={colors.text.secondary} />}
            label="Coordinates"
            value={
              property.latitude != null && property.longitude != null
                ? `${property.latitude.toFixed(5)}, ${property.longitude.toFixed(5)}`
                : 'Not pinned on map'
            }
            valueColor={
              property.latitude != null ? colors.text.primary : colors.text.tertiary
            }
            isLast
          />
        </View>
      </View>
    );
  };

  // ─── Edit Modal ───────────────────────────────────────────────
  const renderEditModal = () => {
    if (!editingProperty) return null;

    return (
      <Modal
        visible={!!editingProperty}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalContainer}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text style={[typography.textStyles.h3, styles.modalTitle]}>Edit Property</Text>
            <TouchableOpacity onPress={closeEditModal} style={styles.closeButton}>
              <X size={22} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={[
              styles.modalContent,
              { maxWidth: isDesktop ? 640 : undefined },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {/* Name */}
            <Input
              label="Property Name"
              placeholder="e.g. My Boarding House"
              value={editForm.name}
              onChangeText={(v) => setEditForm((f) => ({ ...f, name: v }))}
            />

            {/* Address */}
            <Input
              label="Address"
              placeholder="Full address"
              value={editForm.address}
              onChangeText={(v) => setEditForm((f) => ({ ...f, address: v }))}
            />

            {/* Description */}
            <View style={styles.fieldGroup}>
              <Text style={[typography.textStyles.body, styles.fieldLabel]}>Description</Text>
              <Input
                placeholder="Describe your property, available rooms, amenities..."
                value={editForm.description}
                onChangeText={(v) => setEditForm((f) => ({ ...f, description: v }))}
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />
            </View>

            {/* Price */}
            <Input
              label="Monthly Rate (₱)"
              placeholder="e.g. 2500"
              value={editForm.price}
              onChangeText={(v) => setEditForm((f) => ({ ...f, price: v.replace(/[^0-9.]/g, '') }))}
              keyboardType="numeric"
            />

            {/* Accredited toggle */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setEditForm((f) => ({ ...f, is_accredited: !f.is_accredited }))}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  editForm.is_accredited && styles.checkboxChecked,
                ]}
              >
                {editForm.is_accredited && <Check size={14} color={colors.white} />}
              </View>
              <GraduationCap size={16} color={colors.text.secondary} />
              <Text style={[typography.textStyles.body, { color: colors.text.primary }]}>
                University Accredited
              </Text>
            </TouchableOpacity>

            {/* Map location picker */}
            <LocationPickerMap
              latitude={editForm.latitude}
              longitude={editForm.longitude}
              onLocationSelect={(lat, lng) =>
                setEditForm((f) => ({ ...f, latitude: lat, longitude: lng }))
              }
              height={isMobile ? 240 : 320}
            />

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeEditModal}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Check size={16} color={colors.white} />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.textStyles.h2, styles.title]}>My Properties</Text>
          <Text style={[typography.textStyles.bodySmall, styles.subtitle]}>
            Manage your boarding house listings
          </Text>
        </View>

        {/* Loading */}
        {isLoading && (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[typography.textStyles.body, styles.stateText]}>Loading properties...</Text>
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.centerState}>
            <Text style={[typography.textStyles.body, { color: colors.error }]}>{error}</Text>
            <TouchableOpacity onPress={fetchProperties} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty */}
        {!isLoading && !error && properties.length === 0 && (
          <View style={styles.centerState}>
            <Home size={48} color={colors.text.tertiary} />
            <Text style={[typography.textStyles.h4, styles.emptyTitle]}>No properties yet</Text>
            <Text style={[typography.textStyles.bodySmall, styles.stateText]}>
              Your properties will appear here.
            </Text>
          </View>
        )}

        {/* Property cards */}
        {!isLoading && properties.length > 0 && (
          <View style={styles.cardsGrid}>
            {properties.map(renderPropertyCard)}
          </View>
        )}

        {/* Reviews section */}
        {!isLoading && properties.length > 0 && (
          <View style={reviewStyles.section}>
            {/* Section header */}
            <View style={reviewStyles.sectionHeader}>
              <View style={reviewStyles.sectionTitleRow}>
                <Star size={18} color={colors.warning} />
                <Text style={[typography.textStyles.h3, reviewStyles.sectionTitle]}>Reviews</Text>
              </View>
              <Text style={[typography.textStyles.caption, { color: colors.text.tertiary }]}>
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </Text>
            </View>

            {/* Property filter chips — shown if multiple properties */}
            {properties.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={reviewStyles.filterScroll}
                contentContainerStyle={reviewStyles.filterRow}
              >
                <TouchableOpacity
                  style={[
                    reviewStyles.filterChip,
                    selectedPropertyFilter === null && reviewStyles.filterChipActive,
                  ]}
                  onPress={() => setSelectedPropertyFilter(null)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      reviewStyles.filterChipText,
                      selectedPropertyFilter === null && reviewStyles.filterChipTextActive,
                    ]}
                  >
                    All Properties
                  </Text>
                </TouchableOpacity>
                {properties.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      reviewStyles.filterChip,
                      selectedPropertyFilter === p.id && reviewStyles.filterChipActive,
                    ]}
                    onPress={() => setSelectedPropertyFilter(p.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        reviewStyles.filterChipText,
                        selectedPropertyFilter === p.id && reviewStyles.filterChipTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Reviews list */}
            <View style={reviewStyles.listCard}>
              {reviewsLoading && (
                <View style={reviewStyles.emptyState}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}

              {!reviewsLoading && filteredReviews.length === 0 && (
                <View style={reviewStyles.emptyState}>
                  <MessageSquare size={32} color={colors.text.tertiary} />
                  <Text style={[typography.textStyles.bodySmall, { color: colors.text.tertiary, marginTop: 8 }]}>
                    No reviews yet
                  </Text>
                </View>
              )}

              {!reviewsLoading &&
                filteredReviews.map((review, index) => (
                  <View
                    key={review.id}
                    style={[
                      reviewStyles.reviewRow,
                      index === filteredReviews.length - 1 && reviewStyles.reviewRowLast,
                    ]}
                  >
                    {/* Avatar + name */}
                    <View style={reviewStyles.reviewHeader}>
                      <View style={reviewStyles.avatar}>
                        <User size={14} color={colors.white} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.textStyles.bodySmall, { fontWeight: '600', color: colors.text.primary }]}>
                          {review.tenant?.full_name || 'Anonymous'}
                        </Text>
                        {properties.length > 1 && !selectedPropertyFilter && (
                          <Text style={[typography.textStyles.caption, { color: colors.text.tertiary }]}>
                            {review.property?.name}
                          </Text>
                        )}
                      </View>
                      <Text style={[typography.textStyles.caption, { color: colors.text.tertiary }]}>
                        {new Date(review.created_at).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>

                    {/* Star rating */}
                    <View style={reviewStyles.starsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          color={colors.warning}
                          fill={s <= review.rating ? colors.warning : 'none'}
                        />
                      ))}
                      <Text style={[typography.textStyles.caption, { color: colors.text.secondary, marginLeft: 4 }]}>
                        {review.rating}.0
                      </Text>
                    </View>

                    {/* Comment */}
                    {review.comment && (
                      <Text
                        style={[typography.textStyles.bodySmall, { color: colors.text.secondary, marginTop: 4 }]}
                        numberOfLines={3}
                      >
                        {review.comment}
                      </Text>
                    )}
                  </View>
                ))}
            </View>
          </View>
        )}
      </ScrollView>

      {renderEditModal()}
    </View>
  );
};

// ─── Detail Row ───────────────────────────────────────────────
function DetailRow({
  icon,
  label,
  value,
  valueColor,
  numberOfLines = 1,
  isLast = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  numberOfLines?: number;
  isLast?: boolean;
}) {
  return (
    <View style={[detailStyles.row, isLast && detailStyles.rowLast]}>
      <View style={detailStyles.labelRow}>
        {icon}
        <Text style={[typography.textStyles.caption, detailStyles.label]}>{label}</Text>
      </View>
      <Text
        style={[
          typography.textStyles.bodySmall,
          detailStyles.value,
          valueColor ? { color: valueColor } : undefined,
        ]}
        numberOfLines={numberOfLines}
      >
        {value}
      </Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  label: {
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: colors.text.primary,
  },
});

// ─── Review Styles ────────────────────────────────────────────
const reviewStyles = StyleSheet.create({
  section: {
    marginTop: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: colors.text.primary,
  },
  filterScroll: {
    marginBottom: spacing[3],
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  listCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.base,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[10],
  },
  reviewRow: {
    padding: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },
  reviewRowLast: {
    borderBottomWidth: 0,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});

// ─── Main Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  header: {
    marginBottom: spacing[5],
  },
  title: {
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.text.secondary,
  },

  // Cards grid
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.base,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
    gap: spacing[2],
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    color: colors.text.primary,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  accreditedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16a34a',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: spacing[2],
  },
  accreditedText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },

  // States
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[16],
    gap: spacing[3],
  },
  stateText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyTitle: {
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
  retryButton: {
    marginTop: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing[1],
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: spacing[4],
    gap: spacing[3],
    alignSelf: 'center',
    width: '100%',
  },
  fieldGroup: {
    marginVertical: 2,
  },
  fieldLabel: {
    color: colors.text.primary,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: spacing[2],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
