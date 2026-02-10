import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

interface HiddenAdminAccessProps {
  children: React.ReactNode;
}

export const HiddenAdminAccess: React.FC<HiddenAdminAccessProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});