import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';

interface SubPageHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export const SubPageHeader: React.FC<SubPageHeaderProps> = ({ title, onBack, rightElement }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.side} onPress={onBack ?? (() => navigation.goBack())}>
        <ArrowLeft size={22} color={colors.gray[700]} />
      </TouchableOpacity>
      <Text style={[typography.textStyles.h5, styles.title]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side}>
        {rightElement ?? null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  side: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: colors.gray[900],
    textAlign: 'center',
  },
});
