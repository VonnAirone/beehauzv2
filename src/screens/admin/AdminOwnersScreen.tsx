import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Plus } from 'lucide-react-native';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';
import { supabase } from '../../services/supabase';
import { Input, Dropdown } from '../../components/common';

interface OwnerRow {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
}

interface PropertyRow {
  id: string;
  name: string;
  address: string | null;
  owner_id: string;
  created_at: string;
}

interface PropertyWithTenants extends PropertyRow {
  tenantCount: number;
}

interface TenantRow {
  id: string;
  property_id: string;
}

export const AdminOwnersScreen: React.FC = () => {
  const [owners, setOwners] = React.useState<OwnerRow[]>([]);
  const [properties, setProperties] = React.useState<PropertyRow[]>([]);
  const [tenants, setTenants] = React.useState<TenantRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [isInviteModalVisible, setInviteModalVisible] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [isInviting, setIsInviting] = React.useState(false);

  const [isAssignModalVisible, setAssignModalVisible] = React.useState(false);
  const [selectedOwner, setSelectedOwner] = React.useState<OwnerRow | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = React.useState('');
  const [assignError, setAssignError] = React.useState<string | null>(null);
  const [isAssigning, setIsAssigning] = React.useState(false);

  const fetchOwnersAndProperties = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: ownersData, error: ownersError } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .eq('user_type', 'owner')
        .order('created_at', { ascending: false });

      if (ownersError) {
        throw ownersError;
      }

      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, address, owner_id, created_at')
        .order('created_at', { ascending: false });

      if (propertiesError) {
        throw propertiesError;
      }

      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, property_id')
        .order('property_id');

      if (tenantsError) {
        throw tenantsError;
      }

      setOwners(ownersData ?? []);
      setProperties(propertiesData ?? []);
      setTenants(tenantsData ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load owners.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOwnersAndProperties();
  }, [fetchOwnersAndProperties]);

  const tenantCountByProperty = React.useMemo(() => {
    return tenants.reduce<Record<string, number>>((acc, tenant) => {
      acc[tenant.property_id] = (acc[tenant.property_id] || 0) + 1;
      return acc;
    }, {});
  }, [tenants]);

  const propertiesByOwner = React.useMemo(() => {
    return properties.reduce<Record<string, PropertyWithTenants[]>>((acc, property) => {
      if (!acc[property.owner_id]) {
        acc[property.owner_id] = [];
      }
      acc[property.owner_id].push({
        ...property,
        tenantCount: tenantCountByProperty[property.id] || 0,
      });
      return acc;
    }, {});
  }, [properties, tenantCountByProperty]);

  const totalTenantsByOwner = React.useMemo(() => {
    return properties.reduce<Record<string, number>>((acc, property) => {
      const tenantCount = tenantCountByProperty[property.id] || 0;
      acc[property.owner_id] = (acc[property.owner_id] || 0) + tenantCount;
      return acc;
    }, {});
  }, [properties, tenantCountByProperty]);

  const ownerNameById = React.useMemo(() => {
    return owners.reduce<Record<string, string>>((acc, owner) => {
      acc[owner.id] = owner.full_name || owner.email;
      return acc;
    }, {});
  }, [owners]);

  const propertyOptions = React.useMemo(() => {
    return properties.map((property) => {
      const ownerLabel = ownerNameById[property.owner_id];
      return {
        label: property.name,
        value: property.id,
        description: `${property.address || 'No address'}${ownerLabel ? ` · Owned by ${ownerLabel}` : ''}`,
      };
    });
  }, [properties, ownerNameById]);

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
      const { error: inviteSendError } = await supabase.auth.signInWithOtp({
        email: inviteEmail.trim(),
      });

      if (inviteSendError) {
        setInviteError(inviteSendError.message || 'Failed to send invite.');
        return;
      }

      Alert.alert('Invite sent', 'An invite link has been sent to the owner.');
      setInviteModalVisible(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send invite.';
      setInviteError(message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleOpenAssign = (owner: OwnerRow) => {
    setSelectedOwner(owner);
    setSelectedPropertyId('');
    setAssignError(null);
    setAssignModalVisible(true);
  };

  const handleAssignProperty = async () => {
    if (!selectedOwner) {
      setAssignError('Select an owner to continue.');
      return;
    }

    if (!selectedPropertyId) {
      setAssignError('Select a property to connect.');
      return;
    }

    setIsAssigning(true);
    setAssignError(null);

    try {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ owner_id: selectedOwner.id })
        .eq('id', selectedPropertyId);

      if (updateError) {
        setAssignError(updateError.message || 'Failed to connect property.');
        return;
      }

      Alert.alert('Connected', 'Owner has been connected to the property.');
      setAssignModalVisible(false);
      fetchOwnersAndProperties();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect property.';
      setAssignError(message);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.textStyles.h2, styles.title]}>Owner Management</Text>
      <Text style={[typography.textStyles.body, styles.subtitle]}>
        Manage owners, connect them to properties, and send owner invites.
      </Text>

      <View style={styles.tableCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Owners</Text>
          <TouchableOpacity style={styles.inviteButton} onPress={handleOpenInvite}>
            <Text style={styles.inviteButtonText}>Invite owner</Text>
            <Plus size={16} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.colName]}>Name</Text>
          <Text style={[styles.tableHeaderCell, styles.colEmail]}>Email</Text>
          <Text style={[styles.tableHeaderCell, styles.colProperties]}>Properties</Text>
          <Text style={[styles.tableHeaderCell, styles.colTenants]}>Tenants</Text>
          <Text style={[styles.tableHeaderCell, styles.colAction]}>Action</Text>
        </View>

        {isLoading && (
          <Text style={styles.emptyTableText}>Loading owners...</Text>
        )}

        {!isLoading && error && (
          <Text style={styles.emptyTableText}>Unable to load owners.</Text>
        )}

        {!isLoading && !error && owners.length === 0 && (
          <Text style={styles.emptyTableText}>No owners found.</Text>
        )}

        {!isLoading && !error && owners.length > 0 && (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.tableScroll}>
            {owners.map((owner) => (
              <View key={owner.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colName]} numberOfLines={1}>
                  {owner.full_name || 'Unnamed owner'}
                </Text>
                <Text style={[styles.tableCell, styles.colEmail]} numberOfLines={1}>
                  {owner.email}
                </Text>
                <View style={[styles.colProperties]}>
                  {propertiesByOwner[owner.id] && propertiesByOwner[owner.id].length > 0 ? (
                    <Text style={[styles.tableCell, styles.propertiesText]} numberOfLines={2}>
                      {propertiesByOwner[owner.id]
                        .map(p => p.name)
                        .join(', ')}
                    </Text>
                  ) : (
                    <Text style={[styles.tableCell, styles.emptyPropertiesText]}>
                      No properties
                    </Text>
                  )}
                </View>
                <View style={[styles.colTenants]}>
                  <Text style={[styles.tableCell, styles.tenantsText]}>
                    {totalTenantsByOwner[owner.id] || 0}
                  </Text>
                </View>
                <View style={styles.colAction}>
                  {(!propertiesByOwner[owner.id] || propertiesByOwner[owner.id].length === 0) && (
                    <TouchableOpacity
                      style={styles.connectButton}
                      onPress={() => handleOpenAssign(owner)}
                    >
                      <Text style={styles.connectButtonText}>Connect property</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <Modal
        visible={isInviteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Invite an owner</Text>
            <Text style={styles.modalSubtitle}>Send an invite link to join as an owner.</Text>

            <Input
              label="Owner Email"
              placeholder="owner@email.com"
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
        visible={isAssignModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Connect Owner to Property</Text>
            <Text style={styles.modalSubtitle}>
              {selectedOwner?.full_name || selectedOwner?.email || 'Selected owner'}
            </Text>

            <Dropdown
              label="Property"
              placeholder={propertyOptions.length ? 'Select property' : 'No properties available'}
              options={propertyOptions}
              value={selectedPropertyId}
              onSelect={setSelectedPropertyId}
              error={assignError || undefined}
              disabled={!propertyOptions.length}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setAssignModalVisible(false)}
                disabled={isAssigning}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={handleAssignProperty}
                disabled={isAssigning}
              >
                <Text style={styles.modalPrimaryText}>
                  {isAssigning ? 'Saving...' : 'Save connection'}
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
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  emptyTableText: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: 20,
  },
  colName: {
    flex: 1.4,
  },
  colEmail: {
    flex: 2,
  },
  colProperties: {
    flex: 2,
  },
  colTenants: {
    flex: 0.7,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  colAction: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  propertiesText: {
    fontSize: 11,
    lineHeight: 14,
    color: colors.gray[800],
  },
  emptyPropertiesText: {
    fontSize: 11,
    color: colors.gray[500],
    fontStyle: 'italic',
  },
  tenantsText: {
    fontSize: 12,
    color: colors.gray[800],
    fontWeight: '600',
    textAlign: 'left',
  },
  connectButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  connectButtonText: {
    fontSize: 12,
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
    maxWidth: 460,
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
