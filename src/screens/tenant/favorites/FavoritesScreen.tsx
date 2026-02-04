import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Heart, Trash2, X } from 'lucide-react-native';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';
import { useFavorites } from '../../../context/FavoritesContext';
import { BoardingHouseListCard } from '../../../components/tenant';
import { TenantStackParamList } from '../../../navigation/types';
import { BoardingHouse } from '../../../types/tenant';

type FavoritesScreenNavigationProp = StackNavigationProp<TenantStackParamList, 'TenantTabs'>;

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const { favorites, removeFromFavorites, markFavoritesAsViewed } = useFavorites();
  const [isRemoveMode, setIsRemoveMode] = useState(false);

  // Mark favorites as viewed when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      markFavoritesAsViewed();
    }, [markFavoritesAsViewed])
  );

  const handleBoardingHousePress = (boardingHouse: BoardingHouse) => {
    console.log('Card pressed:', boardingHouse.name, 'Remove mode:', isRemoveMode);
    
    if (isRemoveMode) {
      // Show confirmation dialog when in remove mode
      console.log('Showing alert for removal');
      Alert.alert(
        'Remove Property',
        `Are you sure you want to remove "${boardingHouse.name}" from your liked list?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: () => {
              console.log('Removing property:', boardingHouse.id);
              removeFromFavorites(boardingHouse.id);
              // Exit remove mode after removing an item
              setIsRemoveMode(false);
            }
          }
        ]
      );
    } else {
      // Normal navigation when not in remove mode
      console.log('Navigating to detail screen');
      navigation.navigate('BoardingHouseDetail', { boardingHouse });
    }
  };

  const toggleRemoveMode = () => {
    console.log('Toggle remove mode:', !isRemoveMode);
    setIsRemoveMode(!isRemoveMode);
  };



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={[typography.textStyles.h2, styles.title]}>Liked</Text>
            <Text style={[typography.textStyles.body, styles.subtitle]}>
              {isRemoveMode 
                ? 'Tap properties to remove them'
                : favorites.length > 0 
                  ? `${favorites.length} liked boarding house${favorites.length !== 1 ? 's' : ''}`
                  : 'Your liked boarding houses will appear here'
              }
            </Text>
          </View>
          {favorites.length > 0 && (
            <TouchableOpacity 
              style={[styles.removeButton, isRemoveMode && styles.removeButtonActive]}
              onPress={toggleRemoveMode}
            >
              {isRemoveMode ? (
                <X size={20} color={colors.white} />
              ) : (
                <Trash2 size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart size={64} color={colors.gray[300]} />
          <Text style={[typography.textStyles.h3, styles.emptyTitle]}>No Liked Properties Yet</Text>
          <Text style={[typography.textStyles.body, styles.emptySubtitle]}>
            Start swiping right on properties you love to save them here!
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.listContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {favorites.map((boardingHouse) => (
            <View key={boardingHouse.id} style={[styles.cardContainer, isRemoveMode && styles.cardRemoveMode]}>
              <BoardingHouseListCard
                boardingHouse={boardingHouse}
                onPress={() => handleBoardingHousePress(boardingHouse)}
              />
              {isRemoveMode && (
                <View style={styles.removeOverlay} pointerEvents="none">
                  <View style={styles.removeIcon}>
                    <Trash2 size={24} color={colors.white} />
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
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
    paddingTop: 70,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.gray[600],
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  removeButtonActive: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  cardContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  cardRemoveMode: {
    opacity: 0.8,
  },
  removeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.error,
    borderStyle: 'dashed',
  },
  removeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: colors.gray[900],
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  listContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // For bottom navigation
  },
});