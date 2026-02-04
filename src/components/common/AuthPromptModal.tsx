import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Heart, MessageCircle, Calendar, Star, Map, Eye } from 'lucide-react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { FeatureType, getAuthPromptForFeature } from '../../utils/guestAccess';

interface AuthPromptModalProps {
  visible: boolean;
  feature: FeatureType;
  onClose: () => void;
  onSignUp: () => void;
  onLogin: () => void;
}

const getFeatureIcon = (feature: FeatureType) => {
  const iconProps = { size: 48, color: colors.primary };
  
  switch (feature) {
    case 'save_favorites':
      return <Heart {...iconProps} />;
    case 'contact_owner':
      return <MessageCircle {...iconProps} />;
    case 'make_booking':
      return <Calendar {...iconProps} />;
    case 'write_review':
      return <Star {...iconProps} />;
    case 'view_owner_details':
      return <User {...iconProps} />;
    case 'access_full_map':
      return <Map {...iconProps} />;
    case 'view_all_properties':
      return <Eye {...iconProps} />;
    default:
      return <User {...iconProps} />;
  }
};

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  visible,
  feature,
  onClose,
  onSignUp,
  onLogin,
}) => {
  const promptConfig = getAuthPromptForFeature(feature);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            {getFeatureIcon(feature)}
          </View>
          
          <Text style={styles.title}>{promptConfig.title}</Text>
          <Text style={styles.message}>{promptConfig.message}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.signUpButton]}
              onPress={onSignUp}
            >
              <Text style={styles.signUpButtonText}>{promptConfig.action}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.loginButton]}
              onPress={onLogin}
            >
              <Text style={styles.loginButtonText}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6], // 24px
  },
  modal: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: spacing[8], // 32px
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing[6], // 24px
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[4], // 16px
  },
  message: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[8], // 32px
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing[4], // 16px
  },
  button: {
    paddingVertical: spacing[4], // 16px
    paddingHorizontal: spacing[6], // 24px
    borderRadius: 8,
    alignItems: 'center',
  },
  signUpButton: {
    backgroundColor: colors.primary,
  },
  signUpButtonText: {
    ...typography.textStyles.button,
    color: colors.white,
  },
  loginButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  loginButtonText: {
    ...typography.textStyles.body,
    color: colors.primary,
  },
  closeButton: {
    marginTop: spacing[6], // 24px
    padding: spacing[3], // 12px
  },
  closeButtonText: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
  },
});