import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, Users } from 'lucide-react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { useGuestTracking } from '../../context/GuestTrackingContext';
import { useAuth } from '../../hooks/useAuth';
import { useUserType } from '../../context/UserTypeContext';
import { GUEST_LIMITS, BETA_TESTING_MODE } from '../../utils/guestAccess';

interface GuestViewProgressBannerProps {
  onSignUpPress?: () => void;
}

export const GuestViewProgressBanner: React.FC<GuestViewProgressBannerProps> = ({
  onSignUpPress,
}) => {
  const { isAuthenticated } = useAuth();
  const { viewedPropertiesCount, hasReachedViewLimit } = useGuestTracking();
  const { clearUserType } = useUserType();

  const handleSignUpPress = () => {
    if (onSignUpPress) {
      onSignUpPress();
    } else {
      clearUserType();
    }
  };

  // Don't show banner for authenticated users or during beta testing
  if (isAuthenticated || BETA_TESTING_MODE) {
    return null;
  }

  // Show different messages based on progress
  const remainingViews = GUEST_LIMITS.MAX_PROPERTIES_VIEW - viewedPropertiesCount;
  const progressPercentage = (viewedPropertiesCount / GUEST_LIMITS.MAX_PROPERTIES_VIEW) * 100;

  const getMessage = () => {
    if (hasReachedViewLimit) {
      return {
        title: "You've explored 7 properties!",
        subtitle: "Sign up to browse our full collection of boarding houses",
        urgent: true
      };
    } else if (viewedPropertiesCount >= 5) {
      return {
        title: `${remainingViews} more properties to explore`,
        subtitle: "Sign up now to unlock unlimited browsing",
        urgent: true
      };
    } else if (viewedPropertiesCount >= 3) {
      return {
        title: `${remainingViews} properties left to view`,
        subtitle: "Create an account for full access",
        urgent: false
      };
    } else {
      return {
        title: `${viewedPropertiesCount} of ${GUEST_LIMITS.MAX_PROPERTIES_VIEW} free views used`,
        subtitle: "Sign up for unlimited access to all properties",
        urgent: false
      };
    }
  };

  const message = getMessage();

  return (
    <View style={[
      styles.banner, 
      message.urgent && styles.urgentBanner
    ]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Eye 
            size={20} 
            color={message.urgent ? colors.white : colors.primary} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[
            styles.title, 
            message.urgent && styles.urgentTitle
          ]}>
            {message.title}
          </Text>
          <Text style={[
            styles.subtitle, 
            message.urgent && styles.urgentSubtitle
          ]}>
            {message.subtitle}
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.signUpButton,
            message.urgent && styles.urgentSignUpButton
          ]} 
          onPress={handleSignUpPress}
        >
          <Users 
            size={16} 
            color={message.urgent ? colors.primary : colors.white} 
          />
          <Text style={[
            styles.signUpText,
            message.urgent && styles.urgentSignUpText
          ]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(progressPercentage, 100)}%` },
              message.urgent && styles.urgentProgressFill
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.background.secondary,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    margin: spacing[4], // 16px
    borderRadius: 8,
    overflow: 'hidden',
  },
  urgentBanner: {
    backgroundColor: colors.primary,
    borderLeftColor: colors.white,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4], // 16px
    gap: spacing[3], // 12px
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.textStyles.body,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing[1], // 4px
  },
  urgentTitle: {
    color: colors.white,
  },
  subtitle: {
    ...typography.textStyles.bodySmall,
    color: colors.text.secondary,
  },
  urgentSubtitle: {
    color: colors.background.secondary,
  },
  signUpButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4], // 16px
    paddingVertical: spacing[2], // 8px
    borderRadius: 6,
    gap: spacing[2], // 8px
  },
  urgentSignUpButton: {
    backgroundColor: colors.white,
  },
  signUpText: {
    ...typography.textStyles.bodySmall,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.white,
  },
  urgentSignUpText: {
    color: colors.primary,
  },
  progressContainer: {
    paddingHorizontal: spacing[4], // 16px
    paddingBottom: spacing[4], // 16px
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.primary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  urgentProgressFill: {
    backgroundColor: colors.white,
  },
});