import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Heart, HeartOff } from 'lucide-react-native';
import { BoardingHouseListCard } from '../../../components/tenant';
import { useFavorites } from '../../../context/FavoritesContext';
import { TenantStackParamList } from '../../../navigation/types';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';
import { BoardingHouse } from '../../../types/tenant';

type FavoritesListScreenNavigationProp = StackNavigationProp<TenantStackParamList, 'FavoritesList'>;

export const FavoritesListScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesListScreenNavigationProp>();
  const { favorites, markFavoritesAsViewed } = useFavorites();

  // Mark favorites as viewed when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      markFavoritesAsViewed();
    }, [markFavoritesAsViewed])
  );

  const handlePropertyPress = (boardingHouse: BoardingHouse) => {
    navigation.navigate('BoardingHouseDetail', { boardingHouse });
  };

  const renderFavoriteItem = ({ item }: { item: BoardingHouse }) => (
    <View style={styles.favoriteItem}>
      <BoardingHouseListCard
        boardingHouse={item}
        onPress={() => handlePropertyPress(item)}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <HeartOff size={64} color={colors.gray[400]} />
      </View>
      <Text style={[typography.textStyles.h3, styles.emptyTitle]}>No Favorites Yet</Text>
      <Text style={[typography.textStyles.body, styles.emptyText]}>
        Explore properties and tap the heart icon to save them here for easy access later.
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => navigation.navigate('TenantTabs')}
      >
        <Text style={[typography.textStyles.button, styles.exploreButtonText]}>
          Explore Properties
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.gray[700]} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[typography.textStyles.h3, styles.headerTitle]}>My Favorites</Text>
          <Text style={[typography.textStyles.bodySmall, styles.headerSubtitle]}>
            {favorites.length} {favorites.length === 1 ? 'property' : 'properties'}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.gray[900],
    fontFamily: 'Figtree_600SemiBold',
  },
  headerSubtitle: {
    color: colors.gray[600],
    marginTop: 2,
  },
  headerSpacer: {
    width: 32,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Extra space for bottom navigation
  },
  favoriteItem: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    color: colors.gray[700],
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: colors.white,
  },
});