import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../styles/colors';

export interface PriceRangeOption {
  label: string;
  min: number;
  max: number;
}

export interface SchoolOption {
  id: string;
  shortName: string;
}

interface SearchFilterChipsProps {
  initialSelectedSchool?: string;
  initialPriceRange?: { min: number; max: number };
  schools: ReadonlyArray<SchoolOption>;
  onChange: (filters: { selectedSchool: string; priceRange: { min: number; max: number } }) => void;
  onMoreFilters: () => void;
}

export const DEFAULT_PRICE_RANGES: PriceRangeOption[] = [
  { label: 'Under ₱2,000', min: 0, max: 2000 },
  { label: '₱2,000 - ₱3,000', min: 2000, max: 3000 },
  { label: '₱3,000 - ₱4,000', min: 3000, max: 4000 },
  { label: '₱4,000 - ₱5,000', min: 4000, max: 5000 },
  { label: 'Above ₱5,000', min: 5000, max: 10000 },
];

export const SearchFilterChips: React.FC<SearchFilterChipsProps> = ({
  initialSelectedSchool = '',
  initialPriceRange = { min: 0, max: 10000 },
  schools,
  onChange,
  onMoreFilters,
}) => {
  const [selectedSchool, setSelectedSchool] = useState(initialSelectedSchool);
  const [priceRange, setPriceRange] = useState(initialPriceRange);

  useEffect(() => {
    setSelectedSchool(initialSelectedSchool);
  }, [initialSelectedSchool]);

  useEffect(() => {
    setPriceRange(initialPriceRange);
  }, [initialPriceRange]);

  const handleSelectSchool = (value: string) => {
    const nextValue = value === selectedSchool ? '' : value;
    setSelectedSchool(nextValue);
    onChange({ selectedSchool: nextValue, priceRange });
  };

  const handleSelectPriceRange = (range: { min: number; max: number }) => {
    const isSameRange =
      priceRange.min === range.min && priceRange.max === range.max;
    const nextRange = isSameRange ? { min: 0, max: 10000 } : range;
    setPriceRange(nextRange);
    onChange({ selectedSchool, priceRange: nextRange });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <TouchableOpacity
          style={[styles.chip, selectedSchool === '' && styles.chipActive]}
          onPress={() => handleSelectSchool('')}
        >
          <Text
            style={[styles.chipText, selectedSchool === '' && styles.chipTextActive]}
          >
            All Locations
          </Text>
        </TouchableOpacity>
        {schools.map((school) => (
          <TouchableOpacity
            key={school.id}
            style={[
              styles.chip,
              selectedSchool === school.shortName && styles.chipActive,
            ]}
            onPress={() => handleSelectSchool(school.shortName)}
          >
            <Text
              style={[
                styles.chipText,
                selectedSchool === school.shortName && styles.chipTextActive,
              ]}
            >
              {school.shortName}
            </Text>
          </TouchableOpacity>
        ))}
        {DEFAULT_PRICE_RANGES.map((range, index) => (
          <TouchableOpacity
            key={`${range.label}-${index}`}
            style={[
              styles.chip,
              priceRange.min === range.min &&
                priceRange.max === range.max &&
                styles.chipActive,
            ]}
            onPress={() => handleSelectPriceRange({ min: range.min, max: range.max })}
          >
            <Text
              style={[
                styles.chipText,
                priceRange.min === range.min &&
                  priceRange.max === range.max &&
                  styles.chipTextActive,
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  row: {
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[700],
  },
  chipTextActive: {
    color: colors.white,
    fontFamily: 'Figtree_600SemiBold',
  },
});
