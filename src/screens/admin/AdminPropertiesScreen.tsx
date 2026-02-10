import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { Plus, MapPin, ShieldCheck } from 'lucide-react-native';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';
import { Input, Dropdown } from '../../components/common';
import { supabase } from '../../services/supabase';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Property {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number | null;
  owner_id: string | null;
  owner_name: string | null;
  is_accredited: boolean;
}

interface OwnerOption {
  id: string;
  full_name: string | null;
  email: string;
}

interface AddFormData {
  name: string;
  address: string;
  price: string;
  ownerId: string;
  coordinates: [number, number];
}

// Map click handler component
const LocationPicker: React.FC<{
  onLocationSelect: (coords: [number, number]) => void;
}> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const DEFAULT_COORDS: [number, number] = [14.5995, 120.9842]; // Manila

export const AdminPropertiesScreen: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<OwnerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit location modal
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editCoordinates, setEditCoordinates] = useState<[number, number]>(DEFAULT_COORDS);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Add property modal
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [addForm, setAddForm] = useState<AddFormData>({
    name: '',
    address: '',
    price: '',
    ownerId: '',
    coordinates: DEFAULT_COORDS,
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [isSavingAdd, setIsSavingAdd] = useState(false);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const [propertiesRes, ownersRes] = await Promise.all([
        supabase
          .from('properties')
          .select('id, name, address, latitude, longitude, price, owner_id, is_accredited, owner:profiles(full_name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('user_type', 'owner')
          .order('full_name', { ascending: true }),
      ]);

      if (propertiesRes.error) throw propertiesRes.error;
      if (ownersRes.error) throw ownersRes.error;

      const mapped: Property[] = (propertiesRes.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        latitude: p.latitude ? Number(p.latitude) : null,
        longitude: p.longitude ? Number(p.longitude) : null,
        price: p.price ? Number(p.price) : null,
        owner_id: p.owner_id,
        owner_name: p.owner?.full_name || null,
        is_accredited: p.is_accredited === true,
      }));

      setProperties(mapped);
      setOwners(ownersRes.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      Alert.alert('Error', 'Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // --- Edit Location handlers ---
  const handleOpenEdit = (property: Property) => {
    setEditingProperty(property);
    setEditCoordinates(
      property.latitude && property.longitude
        ? [property.latitude, property.longitude]
        : DEFAULT_COORDS
    );
    setEditError(null);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProperty) return;

    setIsSavingEdit(true);
    setEditError(null);

    try {
      const { error } = await supabase
        .from('properties')
        .update({
          latitude: editCoordinates[0],
          longitude: editCoordinates[1],
        })
        .eq('id', editingProperty.id);

      if (error) throw error;

      Alert.alert('Success', 'Property location updated successfully');
      setEditModalVisible(false);
      fetchProperties();
    } catch (error) {
      console.error('Error updating property location:', error);
      setEditError(error instanceof Error ? error.message : 'Failed to update location');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // --- Add Property handlers ---
  const handleOpenAdd = () => {
    setAddForm({ name: '', address: '', price: '', ownerId: '', coordinates: DEFAULT_COORDS });
    setAddError(null);
    setAddModalVisible(true);
  };

  const handleSaveAdd = async () => {
    if (!addForm.name.trim()) { setAddError('Property name is required'); return; }
    if (!addForm.address.trim()) { setAddError('Address is required'); return; }
    if (!addForm.ownerId) { setAddError('Please select an owner'); return; }

    setIsSavingAdd(true);
    setAddError(null);

    try {
      const { error } = await supabase
        .from('properties')
        .insert([{
          name: addForm.name.trim(),
          address: addForm.address.trim(),
          price: addForm.price ? Number(addForm.price) : null,
          owner_id: addForm.ownerId,
          latitude: addForm.coordinates[0],
          longitude: addForm.coordinates[1],
        }]);

      if (error) throw error;

      Alert.alert('Success', 'Property added successfully');
      setAddModalVisible(false);
      fetchProperties();
    } catch (error) {
      console.error('Error adding property:', error);
      setAddError(error instanceof Error ? error.message : 'Failed to add property');
    } finally {
      setIsSavingAdd(false);
    }
  };

  const handleToggleAccredited = async (property: Property) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_accredited: !property.is_accredited })
        .eq('id', property.id);

      if (error) throw error;
      fetchProperties();
    } catch (error) {
      console.error('Error toggling accreditation:', error);
      Alert.alert('Error', 'Failed to update accreditation status');
    }
  };

  const ownerOptions = owners.map(o => ({
    label: o.full_name || o.email,
    value: o.id,
    description: o.full_name ? o.email : undefined,
  }));

  const formatPrice = (price: number | null) => {
    if (price == null) return '—';
    return `₱${price.toLocaleString()}`;
  };

  const formatCoords = (lat: number | null, lng: number | null) => {
    if (lat == null || lng == null) return 'Not set';
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.textStyles.h2, styles.title]}>Property Management</Text>
      <Text style={[typography.textStyles.body, styles.subtitle]}>
        View all properties and set their exact locations on the map.
      </Text>

      <View style={styles.tableCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Properties</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleOpenAdd}>
            <Text style={styles.addButtonText}>Add Property</Text>
            <Plus size={16} color={colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colName]}>Name</Text>
              <Text style={[styles.tableHeaderCell, styles.colAddress]}>Address</Text>
              <Text style={[styles.tableHeaderCell, styles.colOwner]}>Owner</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>Price</Text>
              <Text style={[styles.tableHeaderCell, styles.colAccredited]}>Accredited</Text>
              <Text style={[styles.tableHeaderCell, styles.colCoordinates]}>Coordinates</Text>
              <Text style={[styles.tableHeaderCell, styles.colActions]}>Actions</Text>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading properties...</Text>
              </View>
            ) : properties.length === 0 ? (
              <Text style={styles.emptyText}>No properties found.</Text>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.tableScroll}>
                {properties.map((property) => (
                  <View key={property.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.colName]} numberOfLines={1}>
                      {property.name}
                    </Text>
                    <Text style={[styles.tableCell, styles.colAddress]} numberOfLines={1}>
                      {property.address || '—'}
                    </Text>
                    <Text style={[styles.tableCell, styles.colOwner]} numberOfLines={1}>
                      {property.owner_name || '—'}
                    </Text>
                    <Text style={[styles.tableCell, styles.colPrice]} numberOfLines={1}>
                      {formatPrice(property.price)}
                    </Text>
                    <View style={styles.colAccredited}>
                      <TouchableOpacity
                        style={[
                          styles.accreditedToggle,
                          property.is_accredited && styles.accreditedToggleActive,
                        ]}
                        onPress={() => handleToggleAccredited(property)}
                      >
                        <ShieldCheck size={14} color={property.is_accredited ? colors.white : colors.gray[400]} />
                      </TouchableOpacity>
                    </View>

                    <Text
                      style={[
                        styles.tableCell,
                        styles.colCoordinates,
                        !property.latitude && styles.notSetText,
                      ]}
                      numberOfLines={1}
                    >
                      {formatCoords(property.latitude, property.longitude)}
                    </Text>
                    <View style={styles.colActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleOpenEdit(property)}
                      >
                        <MapPin size={14} color={colors.primary} />
                        <Text style={styles.editButtonText}>Edit Location</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Edit Location Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Edit Location — {editingProperty?.name}
            </Text>
            <Text style={styles.modalSubtitle}>
              Click on the map to set the exact property location
            </Text>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <Input
                label="Property Name"
                value={editingProperty?.name || ''}
                editable={false}
              />

              <Input
                label="Address"
                value={editingProperty?.address || ''}
                editable={false}
              />

              <View style={styles.coordinatesRow}>
                <Input
                  label="Latitude"
                  value={editCoordinates[0].toFixed(6)}
                  editable={false}
                />
                <Input
                  label="Longitude"
                  value={editCoordinates[1].toFixed(6)}
                  editable={false}
                />
              </View>

              <Text style={styles.mapLabel}>Click on the map to set location:</Text>
              <View style={styles.mapContainer}>
                <MapContainer
                  center={editCoordinates}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker onLocationSelect={(coords) => setEditCoordinates(coords)} />
                  <Marker position={editCoordinates} />
                </MapContainer>
              </View>

              {editError && (
                <Text style={styles.errorText}>{editError}</Text>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={handleSaveEdit}
                disabled={isSavingEdit}
              >
                <Text style={styles.modalPrimaryText}>
                  {isSavingEdit ? 'Saving...' : 'Save Location'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Property Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Property</Text>
            <Text style={styles.modalSubtitle}>
              Fill in the details and click the map to set the location
            </Text>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <Input
                label="Property Name"
                placeholder="e.g., Sunrise Boarding House"
                value={addForm.name}
                onChangeText={(text) => setAddForm(prev => ({ ...prev, name: text }))}
              />

              <Input
                label="Address"
                placeholder="e.g., 123 Main St, Sibalom, Antique"
                value={addForm.address}
                onChangeText={(text) => setAddForm(prev => ({ ...prev, address: text }))}
              />

              <Input
                label="Price (₱/month)"
                placeholder="e.g., 3500"
                value={addForm.price}
                onChangeText={(text) => setAddForm(prev => ({ ...prev, price: text }))}
                keyboardType="numeric"
              />

              <Dropdown
                label="Owner"
                placeholder="Select an owner"
                options={ownerOptions}
                value={addForm.ownerId}
                onSelect={(value) => setAddForm(prev => ({ ...prev, ownerId: value }))}
              />

              <View style={styles.coordinatesRow}>
                <Input
                  label="Latitude"
                  value={addForm.coordinates[0].toFixed(6)}
                  editable={false}
                />
                <Input
                  label="Longitude"
                  value={addForm.coordinates[1].toFixed(6)}
                  editable={false}
                />
              </View>

              <Text style={styles.mapLabel}>Click on the map to set location:</Text>
              <View style={styles.mapContainer}>
                <MapContainer
                  center={addForm.coordinates}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker onLocationSelect={(coords) => setAddForm(prev => ({ ...prev, coordinates: coords }))} />
                  <Marker position={addForm.coordinates} />
                </MapContainer>
              </View>

              {addError && (
                <Text style={styles.errorText}>{addError}</Text>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={handleSaveAdd}
                disabled={isSavingAdd}
              >
                <Text style={styles.modalPrimaryText}>
                  {isSavingAdd ? 'Saving...' : 'Add Property'}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  addButtonText: {
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12,
    color: colors.gray[800],
  },
  tableScroll: {
    maxHeight: 480,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: 40,
  },
  colName: {
    flex: 1.2,
  },
  colAddress: {
    flex: 1.2,
  },
  colOwner: {
    flex: 1,
  },
  colPrice: {
    flex: 0.7,
  },
  colAccredited: {
    flex: 0.6,
    alignItems: 'flex-start',
  },
  colCoordinates: {
    flex: 1,
  },
  colActions: {
    flex: 0.8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  accreditedToggle: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  accreditedToggleActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  notSetText: {
    color: colors.gray[400],
    fontStyle: 'italic',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
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
    maxWidth: 700,
    maxHeight: '90%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 30,
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
  formScroll: {
    maxHeight: 500,
  },
  coordinatesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mapLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[700],
    marginTop: 12,
    marginBottom: 8,
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 8,
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
  modalCancelText: {
    color: colors.gray[700],
    fontWeight: '600',
  },
  modalPrimaryButton: {
    backgroundColor: colors.primary,
  },
  modalPrimaryText: {
    color: colors.white,
    fontWeight: '600',
  },
});
