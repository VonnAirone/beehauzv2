import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft, X } from 'lucide-react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
                <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.gray[700]} />
        </TouchableOpacity>
        <Text style={[typography.textStyles.h2, styles.title]}>
          Privacy Policy
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[typography.textStyles.bodySmall, styles.lastUpdated]}>
          Last updated: October 2025
        </Text>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            1. Information We Collect
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            • Account information (name, email address, phone number){'\n'}
            • Location data to show nearby boarding houses{'\n'}
            • University and academic information (optional){'\n'}
            • Survey responses and app ratings{'\n'}
            • Usage analytics to improve our service
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            2. How We Use Your Information
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            • To provide boarding house search and matching services{'\n'}
            • To connect you with property owners{'\n'}
            • To personalize your experience{'\n'}
            • To send important updates about your account{'\n'}
            • To improve our app through analytics
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            3. Information Sharing
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            We do not sell or rent your personal information. We may share your information only:{'\n'}
            • With property owners when you express interest in their listings{'\n'}
            • With service providers who help us operate the app{'\n'}
            • When required by law or to protect our rights
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            4. Location Information
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            We use your location to show boarding houses near you and your university. You can disable location access anytime in your device settings, but this may limit some app features.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            5. Data Security
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            We use industry-standard security measures to protect your data, including encryption and secure servers. However, no method of transmission over the internet is 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            6. Your Rights
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            You can:{'\n'}
            • Access and update your account information anytime{'\n'}
            • Delete your account and associated data{'\n'}
            • Opt out of non-essential communications{'\n'}
            • Request a copy of your data
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            7. Contact Us
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            If you have questions about this privacy policy or your data, contact us at:{'\n'}
            Email: privacy@beehauz.com{'\n'}
            Support: help@beehauz.com
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
    headerSpacer: {
    width: 32,
  },
  closeButton: {
    padding: spacing[2],
    marginRight: spacing[3],
  },
  title: {
    color: colors.gray[900],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  lastUpdated: {
    color: colors.gray[500],
    marginVertical: spacing[4],
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    color: colors.gray[900],
    marginBottom: spacing[3],
  },
  sectionText: {
    color: colors.gray[700],
    lineHeight: 22,
  },
  bottomSpacing: {
    height: spacing[8],
  },
});