import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
} from 'react-native';
import { SecureAnalyticsDashboard } from '../../screens/admin/SecureAnalyticsDashboard';
import { AdminAccessManager } from '../../services/adminAccessManager';

interface HiddenAdminAccessProps {
  children: React.ReactNode;
}

export const HiddenAdminAccess: React.FC<HiddenAdminAccessProps> = ({ children }) => {
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const hasAccess = await AdminAccessManager.isAdminAccessGranted();
      const wasLoggedIn = isAdminLoggedIn;
      
      setIsAdminLoggedIn(hasAccess);
      
      // Show security modal when admin just logged in
      if (hasAccess && !wasLoggedIn) {
        setShowSecurityModal(true);
      }
      
      // Hide modal when admin logs out
      if (!hasAccess && wasLoggedIn) {
        setShowSecurityModal(false);
      }
    };

    checkAdminStatus();
    
    // Check every 2 seconds for admin login changes
    const interval = setInterval(checkAdminStatus, 2000);
    
    return () => clearInterval(interval);
  }, [isAdminLoggedIn]);

  const closeSecurityModal = async () => {
    setShowSecurityModal(false);
    // Clear admin access to prevent re-prompting
    await AdminAccessManager.clearAdminAccess();
    setIsAdminLoggedIn(false);
  };

  return (
    <View style={styles.container}>
      {children}

      {/* Security Dashboard Modal - appears automatically when admin logs in */}
      <Modal
        visible={showSecurityModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeSecurityModal}
      >
        <SecureAnalyticsDashboard onClose={closeSecurityModal} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});