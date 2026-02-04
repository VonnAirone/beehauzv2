import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Star, Bed } from 'lucide-react-native';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';
import { BoardingHouse } from '../../types/tenant';

interface BoardingHouseListCardProps {
  boardingHouse: BoardingHouse;
  onPress: (boardingHouse: BoardingHouse) => void;
}

export const BoardingHouseListCard: React.FC<BoardingHouseListCardProps> = ({
  boardingHouse,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(boardingHouse)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: boardingHouse.images[0] }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[typography.textStyles.h4, styles.name]} numberOfLines={1}>
            {boardingHouse.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.rating}>{boardingHouse.rating}</Text>
          </View>
        </View>
        
        <View style={styles.locationRow}>
          <MapPin size={14} color={colors.gray[500]} />
          <Text style={[typography.textStyles.caption, styles.location]} numberOfLines={1}>
            {boardingHouse.location}
          </Text>
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.bedsContainer}>
            <Bed size={14} color={colors.gray[500]} />
            <Text style={styles.beds}>{boardingHouse.availableBeds} beds</Text>
          </View>
          
          <Text style={[typography.textStyles.h4, styles.price]}>
            ₱{boardingHouse.ratePerMonth.toLocaleString()}/month
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  name: {
    flex: 1,
    color: colors.gray[900],
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  location: {
    flex: 1,
    color: colors.gray[600],
    fontSize: 13,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bedsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  beds: {
    fontSize: 12,
    color: colors.gray[600],
  },
  price: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});