import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Animated, Alert } from 'react-native';
import { Star, X, Heart, ThumbsUp } from 'lucide-react-native';
import { useAppRating } from '../../context/AppRatingContext';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';

interface AppRatingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AppRatingModal: React.FC<AppRatingModalProps> = ({ visible, onClose }) => {
  const { submitRating, currentTrigger, triggers } = useAppRating();
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentTriggerInfo = triggers.find(t => t.id === currentTrigger);

  const handleStarPress = (rating: number) => {
    setSelectedRating(rating);
    if (rating >= 4) {
      // High rating - show immediate submission option
      setShowFeedback(true);
    } else {
      // Lower rating - ask for feedback
      setShowFeedback(true);
    }
  };

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitRating(selectedRating, feedback.trim() || undefined);
      
      if (selectedRating >= 4) {
        Alert.alert(
          'Thank you! 🎉',
          'We\'re so happy you\'re enjoying Beehauz! Would you mind leaving a review on the App Store?',
          [
            { text: 'Maybe Later', style: 'cancel' },
            { text: 'Sure!', onPress: () => {
              // TODO: Open App Store rating
              console.log('Open App Store rating');
            }}
          ]
        );
      } else {
        Alert.alert(
          'Thank you for your feedback!',
          'We appreciate your honest feedback and will work to improve your experience.',
          [{ text: 'OK', style: 'default' }]
        );
      }
      
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedRating(0);
    setFeedback('');
    setShowFeedback(false);
    onClose();
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  const getRatingEmoji = (rating: number) => {
    switch (rating) {
      case 1: return '😞';
      case 2: return '😐';
      case 3: return '🙂';
      case 4: return '😊';
      case 5: return '🤩';
      default: return '';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Heart size={24} color={colors.primary} fill={colors.primary} />
              </View>
              <View>
                <Text style={[typography.textStyles.h3, styles.title]}>
                  Rate Your Experience
                </Text>
                <Text style={[typography.textStyles.caption, styles.subtitle]}>
                  How are you finding Beehauz?
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Star Rating */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleStarPress(star)}
                  style={styles.starButton}
                  disabled={isSubmitting}
                >
                  <Star
                    size={36}
                    color={star <= selectedRating ? colors.warning : colors.gray[300]}
                    fill={star <= selectedRating ? colors.warning : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating Text */}
            {selectedRating > 0 && (
              <View style={styles.ratingFeedback}>
                <Text style={styles.ratingEmoji}>{getRatingEmoji(selectedRating)}</Text>
                <Text style={[typography.textStyles.body, styles.ratingText]}>
                  {getRatingText(selectedRating)}
                </Text>
              </View>
            )}

            {/* Feedback Input */}
            {showFeedback && (
              <View style={styles.feedbackContainer}>
                <Text style={[typography.textStyles.body, styles.feedbackLabel]}>
                  {selectedRating >= 4 
                    ? 'Tell us what you love about Beehauz! (Optional)'
                    : 'Help us improve - what could be better?'
                  }
                </Text>
                <TextInput
                  style={styles.feedbackInput}
                  placeholder={selectedRating >= 4 
                    ? 'Share what you enjoy most...'
                    : 'Let us know how we can improve...'
                  }
                  placeholderTextColor={colors.text.tertiary}
                  value={feedback}
                  onChangeText={setFeedback}
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                  editable={!isSubmitting}
                />
                <Text style={styles.characterCount}>{feedback.length}/500</Text>
              </View>
            )}

            {/* Trigger Context */}
            {currentTriggerInfo && (
              <View style={styles.contextContainer}>
                <ThumbsUp size={16} color={colors.gray[400]} />
                <Text style={[typography.textStyles.caption, styles.contextText]}>
                  {currentTriggerInfo.description}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {showFeedback && (
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.skipButton} 
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={[typography.textStyles.button, styles.skipButtonText]}>
                  Maybe Later
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting || selectedRating === 0}
              >
                <Text style={[typography.textStyles.button, styles.submitButtonText]}>
                  {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    padding: 20,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    color: colors.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    color: colors.gray[600],
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingFeedback: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  ratingText: {
    color: colors.gray[700],
    fontWeight: '600',
  },
  feedbackContainer: {
    marginBottom: 16,
  },
  feedbackLabel: {
    color: colors.gray[700],
    marginBottom: 12,
    lineHeight: 20,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Figtree_400Regular',
    textAlignVertical: 'top',
    minHeight: 80,
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
  },
  characterCount: {
    textAlign: 'right',
    marginTop: 4,
    fontSize: 12,
    color: colors.gray[500],
  },
  contextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  contextText: {
    color: colors.gray[600],
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
  },
  skipButtonText: {
    color: colors.gray[600],
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitButtonText: {
    color: colors.white,
  },
});