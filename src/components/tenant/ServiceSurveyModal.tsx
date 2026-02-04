import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../../styles/colors';

export type ServiceSurveyType = 'laundry' | 'delivery';
export type ServiceSurveyResponse = 'not-interested' | 'maybe' | 'very-interested';

interface ServiceSurveyModalProps {
  visible: boolean;
  surveyType: ServiceSurveyType;
  isAuthenticated: boolean;
  anonymousEmail: string;
  onChangeEmail: (value: string) => void;
  onClose: () => void;
  onSubmit: (response: ServiceSurveyResponse) => void;
}

export const ServiceSurveyModal: React.FC<ServiceSurveyModalProps> = ({
  visible,
  surveyType,
  isAuthenticated,
  anonymousEmail,
  onChangeEmail,
  onClose,
  onSubmit,
}) => {
  const serviceDescription = surveyType === 'laundry'
    ? 'laundry and dry cleaning services'
    : 'food and grocery delivery services';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Interest Survey</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.question}>
              Would you be interested in using {serviceDescription} through Beehauz?
            </Text>

            {!isAuthenticated && (
              <View style={styles.emailInputContainer}>
                <Text style={styles.emailInputLabel}>Email (required for anonymous feedback)</Text>
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your email address"
                  placeholderTextColor={colors.text.tertiary}
                  value={anonymousEmail}
                  onChangeText={onChangeEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.options}>
              <TouchableOpacity
                style={[styles.option, styles.optionNotInterested]}
                onPress={() => onSubmit('not-interested')}
              >
                <Text style={styles.optionTextNotInterested}>Not Really</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, styles.optionMaybe]}
                onPress={() => onSubmit('maybe')}
              >
                <Text style={styles.optionTextMaybe}>Maybe</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, styles.optionInterested]}
                onPress={() => onSubmit('very-interested')}
              >
                <Text style={styles.optionTextInterested}>Yes, Definitely!</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxWidth: 350,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Figtree_700Bold',
    color: colors.primary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingBottom: 8,
  },
  question: {
    fontSize: 16,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: 20,
  },
  emailInputContainer: {
    marginBottom: 20,
  },
  emailInputLabel: {
    fontSize: 14,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[600],
    marginBottom: 8,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Figtree_400Regular',
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
  },
  options: {
    gap: 12,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  optionNotInterested: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
  },
  optionMaybe: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
  },
  optionInterested: {
    backgroundColor: colors.primary,
  },
  optionTextNotInterested: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: '#6c757d',
  },
  optionTextMaybe: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: '#856404',
  },
  optionTextInterested: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.white,
  },
});
