import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';
import { supabase } from '../../services/supabase';

interface TenantRow {
  id: string;
  name: string;
  yearLevel: string;
  school: string;
  dateStarted: string;
  dateLeft: string;
  status: string;
  propertyName: string;
  ownerName: string;
}

export const AdminTenantsScreen: React.FC = () => {
  const [tenants, setTenants] = React.useState<TenantRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTenants = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, name, year_level, school, date_started, date_left, status, property_id')
        .order('date_started', { ascending: false });

      if (tenantsError) {
        throw tenantsError;
      }

      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, owner_id');

      if (propertiesError) {
        throw propertiesError;
      }

      // Fetch owners
      const { data: ownersData, error: ownersError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('user_type', 'owner');

      if (ownersError) {
        throw ownersError;
      }

      // Create lookup maps
      const propertiesMap = (propertiesData ?? []).reduce((acc: any, prop: any) => {
        acc[prop.id] = prop;
        return acc;
      }, {});

      const ownersMap = (ownersData ?? []).reduce((acc: any, owner: any) => {
        acc[owner.id] = owner;
        return acc;
      }, {});

      // Map tenants with property and owner info
      const mappedTenants = (tenantsData ?? []).map((tenant: any) => {
        const property = propertiesMap[tenant.property_id];
        const owner = property ? ownersMap[property.owner_id] : null;
        const ownerLabel = owner?.full_name || owner?.email || 'Not assigned';

        return {
          id: tenant.id,
          name: tenant.name,
          yearLevel: tenant.year_level || 'Not specified',
          school: tenant.school || 'Not specified',
          dateStarted: tenant.date_started || '-',
          dateLeft: tenant.date_left || '-',
          status: (tenant.status || 'active').toLowerCase(),
          propertyName: property?.name || 'Unknown property',
          ownerName: ownerLabel,
        };
      });

      setTenants(mappedTenants);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load tenants.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const formatStatus = (status: string) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'active') return 'Active';
    if (normalized === 'left') return 'Left';
    if (normalized === 'pending') return 'Pending';
    return status || 'N/A';
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.textStyles.h2, styles.title]}>Tenant Overview</Text>
      <Text style={[typography.textStyles.body, styles.subtitle]}>
        Review tenants across all properties.
      </Text>

      <View style={styles.tableCard}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.colName]}>Name</Text>
          <Text style={[styles.tableHeaderCell, styles.colProperty]}>Property</Text>
          <Text style={[styles.tableHeaderCell, styles.colOwner]}>Owner</Text>
          <Text style={[styles.tableHeaderCell, styles.colStatus]}>Status</Text>
          <Text style={[styles.tableHeaderCell, styles.colDate]}>Date Started</Text>
        </View>

        {isLoading && (
          <Text style={styles.emptyTableText}>Loading tenants...</Text>
        )}

        {!isLoading && error && (
          <Text style={styles.emptyTableText}>Unable to load tenants.</Text>
        )}

        {!isLoading && !error && tenants.length === 0 && (
          <Text style={styles.emptyTableText}>No tenants found.</Text>
        )}

        {!isLoading && !error && tenants.length > 0 && (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.tableScroll}>
            {tenants.map((tenant) => (
              <View key={tenant.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colName]} numberOfLines={1}>
                  {tenant.name}
                </Text>
                <Text style={[styles.tableCell, styles.colProperty]} numberOfLines={1}>
                  {tenant.propertyName}
                </Text>
                <Text style={[styles.tableCell, styles.colOwner]} numberOfLines={1}>
                  {tenant.ownerName}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.colStatus,
                    styles.statusBadge,
                    tenant.status === 'active' && styles.statusActive,
                    tenant.status === 'pending' && styles.statusPending,
                    tenant.status === 'left' && styles.statusLeft,
                  ]}
                >
                  {formatStatus(tenant.status)}
                </Text>
                <Text style={[styles.tableCell, styles.colDate]}>
                  {tenant.dateStarted}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
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
    maxHeight: 520,
  },
  emptyTableText: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: 20,
  },
  colName: {
    flex: 1.3,
  },
  colProperty: {
    flex: 1.4,
  },
  colOwner: {
    flex: 1.4,
  },
  colStatus: {
    flex: 0.8,
    textAlign: 'center',
  },
  colDate: {
    flex: 1,
  },
  statusBadge: {
    textAlign: 'center',
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  statusActive: {
    backgroundColor: colors.success + '20',
    color: colors.success,
  },
  statusPending: {
    backgroundColor: colors.warning + '20',
    color: colors.warning,
  },
  statusLeft: {
    backgroundColor: colors.gray[200],
    color: colors.gray[600],
  },
});
