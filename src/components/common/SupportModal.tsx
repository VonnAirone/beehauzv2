import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { X, Camera, CheckCircle, AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';
import { spacing, borderRadius } from '../../styles/spacing';
import { supabase } from '../../services/supabase';
import { useAuthContext } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Dropdown } from './Dropdown';
import { Input } from './Input';
import { Button } from './Button';

// ─── Types ───────────────────────────────────────────────────
interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
  defaultIssueType?: string;
}

const ISSUE_OPTIONS = [
  { label: 'Account Creation', value: 'account_creation' },
  { label: 'Payment', value: 'payment' },
  { label: 'Booking Request', value: 'booking_request' },
  { label: 'Property', value: 'property' },
  { label: 'Other', value: 'other' },
];

// ─── Component ───────────────────────────────────────────────
export const SupportModal: React.FC<SupportModalProps> = ({
  visible,
  onClose,
  defaultIssueType,
}) => {
  const { user } = useAuthContext();
  const { isMobile, isTablet } = useResponsive();
  const isCompact = isMobile || isTablet;

  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [proofImage, setProofImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submittedWhen = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const submittedBy = user?.fullName || user?.email || 'Unknown';

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setIssueType(defaultIssueType || '');
      setDescription('');
      setProofImage(null);
      setError(null);
      setSuccess(false);
    }
  }, [visible, defaultIssueType]);

  // Auto-close after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission to access photos is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setProofImage(result.assets[0]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!issueType) {
      setError('Please select an issue type.');
      return;
    }
    if (!user?.id) {
      setError('You must be logged in to submit a ticket.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let proofUrl: string | null = null;

      // Upload proof image if selected
      if (proofImage?.uri) {
        const fileName = `${user.id}/${Date.now()}.jpg`;
        const response = await fetch(proofImage.uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('support-proofs')
          .upload(fileName, blob, { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('support-proofs')
          .getPublicUrl(fileName);

        proofUrl = urlData.publicUrl;
      }

      // Insert ticket
      const { error: insertError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          issue_type: issueType,
          description: description.trim() || null,
          proof_url: proofUrl,
          submitted_by: submittedBy,
        });

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit ticket.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Success State ──────────────────────────────────────────
  if (success) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.modal, isCompact && styles.modalCompact]}
          >
            <View style={styles.successContainer}>
              <CheckCircle size={48} color={colors.success} />
              <Text style={styles.successTitle}>Ticket Submitted</Text>
              <Text style={styles.successSubtitle}>
                We'll review your request and get back to you soon.
              </Text>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  // ─── Form ───────────────────────────────────────────────────
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={[styles.modal, isCompact && styles.modalCompact]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Contact Support</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Issue Type */}
            <Dropdown
              label="Issue"
              placeholder="Select an issue type"
              options={ISSUE_OPTIONS}
              value={issueType}
              onSelect={setIssueType}
            />

            {/* Description */}
            <Input
              label="Description (optional)"
              placeholder="Describe your issue..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />

            {/* Submitted When */}
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>Submitted When</Text>
              <Text style={styles.readOnlyValue}>{submittedWhen}</Text>
            </View>

            {/* Submitted By */}
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>Submitted By</Text>
              <Text style={styles.readOnlyValue}>{submittedBy}</Text>
            </View>

            {/* Proof Upload */}
            <View style={styles.proofSection}>
              <Text style={styles.readOnlyLabel}>Proof (Image or Screenshot)</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {proofImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: proofImage.uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImage}
                      onPress={() => setProofImage(null)}
                    >
                      <X size={14} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Camera size={24} color={colors.gray[400]} />
                    <Text style={styles.imagePickerText}>Tap to upload image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorRow}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              disabled={isSubmitting}
              style={styles.actionButton}
            />
            <Button
              title="Submit"
              variant="primary"
              onPress={handleSubmit}
              loading={isSubmitting}
              loadingText="Submitting..."
              style={styles.actionButton}
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
  },
  modalCompact: {
    maxWidth: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[3],
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[900],
  },
  body: {
    flexShrink: 1,
  },
  bodyContent: {
    paddingHorizontal: spacing[5],
    gap: spacing[3],
    paddingBottom: spacing[2],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  readOnlyField: {
    marginVertical: 2,
  },
  readOnlyLabel: {
    marginBottom: 8,
    color: colors.gray[700],
    fontFamily: 'Figtree_500Medium',
    fontSize: 14,
  },
  readOnlyValue: {
    fontSize: 14,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[900],
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 15,
  },
  proofSection: {
    marginVertical: 2,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[6],
    gap: spacing[2],
  },
  imagePickerText: {
    fontSize: 13,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[400],
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Figtree_400Regular',
    color: colors.error,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  actionButton: {
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[5],
    gap: spacing[3],
  },
  successTitle: {
    fontSize: 18,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[900],
  },
  successSubtitle: {
    fontSize: 14,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[500],
    textAlign: 'center',
  },
});
