import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { Plus, MapPin, Trash2 } from 'lucide-react-native';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';
import { Input } from '../../components/common';
import { supabase } from '../../services/supabase';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface University {
  id: string;
  name: string;
  short_name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface UniversityFormData {
  id: string;
  name: string;
  shortName: string;
  address: string;
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

export const AdminUniversitiesScreen: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [formData, setFormData] = useState<UniversityFormData>({
    id: '',
    name: '',
    shortName: '',
    address: '',
    coordinates: [14.5995, 120.9842], // Default to Manila
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUniversities = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setUniversities(data || []);
    } catch (error) {
      console.error('Error fetching universities:', error);
      Alert.alert('Error', 'Failed to load universities');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  const handleOpenAdd = () => {
    setEditingUniversity(null);
    setFormData({
      id: '',
      name: '',
      shortName: '',
      address: '',
      coordinates: [14.5995, 120.9842],
    });
    setFormError(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (university: University) => {
    setEditingUniversity(university);
    setFormData({
      id: university.id,
      name: university.name,
      shortName: university.short_name,
      address: university.address,
      coordinates: [university.latitude, university.longitude],
    });
    setFormError(null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    // Validate
    if (!formData.name.trim()) {
      setFormError('University name is required');
      return;
    }
    if (!formData.shortName.trim()) {
      setFormError('Short name is required');
      return;
    }
    if (!formData.address.trim()) {
      setFormError('Address is required');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const universityData = {
        name: formData.name.trim(),
        short_name: formData.shortName.trim(),
        address: formData.address.trim(),
        latitude: formData.coordinates[0],
        longitude: formData.coordinates[1],
      };

      if (editingUniversity) {
        // Update existing
        const { error } = await supabase
          .from('universities')
          .update(universityData)
          .eq('id', editingUniversity.id);

        if (error) throw error;

        Alert.alert('Success', 'University updated successfully');
      } else {
        // Add new
        const { error } = await supabase
          .from('universities')
          .insert([universityData]);

        if (error) throw error;

        Alert.alert('Success', 'University added successfully');
      }

      setModalVisible(false);
      fetchUniversities(); // Refresh the list
    } catch (error) {
      console.error('Error saving university:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to save university');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (university: University) => {
    Alert.alert(
      'Delete University',
      `Are you sure you want to delete ${university.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('universities')
                .delete()
                .eq('id', university.id);

              if (error) throw error;

              Alert.alert('Success', 'University deleted successfully');
              fetchUniversities(); // Refresh the list
            } catch (error) {
              console.error('Error deleting university:', error);
              Alert.alert('Error', 'Failed to delete university');
            }
          },
        },
      ]
    );
  };

  const handleLocationSelect = (coords: [number, number]) => {
    setFormData(prev => ({ ...prev, coordinates: coords }));
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.textStyles.h2, styles.title]}>University Management</Text>
      <Text style={[typography.textStyles.body, styles.subtitle]}>
        Manage universities and set their precise locations on the map.
      </Text>

      <View style={styles.tableCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Universities</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleOpenAdd}>
            <Text style={styles.addButtonText}>Add University</Text>
            <Plus size={16} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.colName]}>Name</Text>
          <Text style={[styles.tableHeaderCell, styles.colShortName]}>Short Name</Text>
          <Text style={[styles.tableHeaderCell, styles.colAddress]}>Address</Text>
          <Text style={[styles.tableHeaderCell, styles.colCoordinates]}>Coordinates</Text>
          <Text style={[styles.tableHeaderCell, styles.colActions]}>Actions</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading universities...</Text>
          </View>
        ) : universities.length === 0 ? (
          <Text style={styles.emptyText}>No universities found. Add one to get started.</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.tableScroll}>
            {universities.map((university) => (
              <View key={university.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colName]} numberOfLines={1}>
                  {university.name}
                </Text>
                <Text style={[styles.tableCell, styles.colShortName]} numberOfLines={1}>
                  {university.short_name}
                </Text>
                <Text style={[styles.tableCell, styles.colAddress]} numberOfLines={2}>
                  {university.address}
                </Text>
                <Text style={[styles.tableCell, styles.colCoordinates]} numberOfLines={1}>
                  {university.latitude.toFixed(4)}, {university.longitude.toFixed(4)}
                </Text>
                <View style={styles.colActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleOpenEdit(university)}
                  >
                    <MapPin size={14} color={colors.primary} />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(university)}
                  >
                    <Trash2 size={14} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Add/Edit Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingUniversity ? 'Edit University' : 'Add University'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Click on the map to set the university location
            </Text>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <Input
                label="University Name"
                placeholder="e.g., University of Santo Tomas"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />

              <Input
                label="Short Name"
                placeholder="e.g., UST"
                value={formData.shortName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, shortName: text }))}
              />

              <Input
                label="Address"
                placeholder="e.g., España Boulevard, Sampaloc, Manila"
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              />

              <View style={styles.coordinatesRow}>
                <Input
                  label="Latitude"
                  value={formData.coordinates[0].toFixed(6)}
                  editable={false}
                />
                <Input
                  label="Longitude"
                  value={formData.coordinates[1].toFixed(6)}
                  editable={false}
                />
              </View>

              {/* Map Picker */}
              <Text style={styles.mapLabel}>Click on the map to set location:</Text>
              <View style={styles.mapContainer}>
                <MapContainer
                  center={formData.coordinates}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker onLocationSelect={handleLocationSelect} />
                  <Marker position={formData.coordinates} />
                </MapContainer>
              </View>

              {formError && (
                <Text style={styles.errorText}>{formError}</Text>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={styles.modalPrimaryText}>
                  {isSaving ? 'Saving...' : editingUniversity ? 'Save Changes' : 'Add University'}
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
    flex: 1.5,
  },
  colShortName: {
    flex: 0.8,
  },
  colAddress: {
    flex: 1.5,
  },
  colCoordinates: {
    flex: 1,
  },
  colActions: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
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
  deleteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: colors.error + '20',
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
