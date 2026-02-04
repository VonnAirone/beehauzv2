import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Dimensions } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';

export interface DropdownOption {
  label: string;
  value: string;
  description?: string;
  icon?: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value?: string;
  onSelect: (value: string) => void;
  error?: string;
  disabled?: boolean;
  maxHeight?: number;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onSelect,
  error,
  disabled = false,
  maxHeight = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const selectedOption = options.find(option => option.value === value);
  const screenHeight = Dimensions.get('window').height;
  const modalMaxHeight = Math.min(maxHeight, screenHeight * 0.6);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsVisible(false);
  };

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      style={[
        styles.option,
        item.value === value && styles.selectedOption
      ]}
      onPress={() => handleSelect(item.value)}
    >
      <View style={styles.optionContent}>
        {item.icon && <Text style={styles.optionIcon}>{item.icon}</Text>}
        <View style={styles.optionText}>
          <Text style={[
            typography.textStyles.body,
            styles.optionLabel,
            item.value === value && styles.selectedOptionText
          ]}>
            {item.label}
          </Text>
          {item.description && (
            <Text style={[typography.textStyles.bodySmall, styles.optionDescription]}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
      {item.value === value && (
        <Check size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={[typography.textStyles.body, styles.label]}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.dropdown,
          error && styles.dropdownError,
          disabled && styles.dropdownDisabled
        ]}
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
      >
        <View style={styles.dropdownContent}>
          {selectedOption?.icon && (
            <Text style={styles.selectedIcon}>{selectedOption.icon}</Text>
          )}
          <Text style={[
            typography.textStyles.body,
            styles.dropdownText,
            !selectedOption && styles.placeholderText
          ]}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>
        <ChevronDown 
          size={20} 
          color={disabled ? colors.gray[400] : colors.gray[600]} 
        />
      </TouchableOpacity>

      {error && <Text style={[typography.textStyles.bodySmall, styles.error]}>{error}</Text>}

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={[styles.modal, { maxHeight: modalMaxHeight }]}>
            <View style={styles.modalHeader}>
              <Text style={[typography.textStyles.h4, styles.modalTitle]}>
                Select {label || 'Option'}
              </Text>
            </View>
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
  },
  label: {
    marginBottom: 8,
    color: colors.gray[700],
    fontWeight: '500',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 15,
    backgroundColor: colors.white,
  },
  dropdownError: {
    borderColor: colors.error,
  },
  dropdownDisabled: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[200],
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dropdownText: {
    color: colors.gray[900],
    flex: 1,
  },
  placeholderText: {
    color: colors.gray[500],
  },
  error: {
    color: colors.error,
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    color: colors.gray[900],
    textAlign: 'center',
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  selectedOption: {
    backgroundColor: colors.primary + '10',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    color: colors.gray[900],
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  optionDescription: {
    color: colors.gray[500],
    marginTop: 2,
  },
});