import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SubPageHeader } from '../../components/common';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

export const PrivacyPolicyScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <SubPageHeader title="Privacy Policy" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[typography.textStyles.bodySmall, styles.lastUpdated]}>
          Last updated: February 2026
        </Text>

        <View style={styles.section}>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            Beehauz ("we," "us," or "our") is committed to protecting the privacy of all users of the Beehauz platform, including students/tenants and property owners. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our application and services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            1. Information We Collect
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionSubtitle]}>
            For All Users
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            {'\u2022'} Account information: full name, email address, phone number{'\n'}
            {'\u2022'} Authentication credentials{'\n'}
            {'\u2022'} Profile information and preferences{'\n'}
            {'\u2022'} Device information and usage analytics
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionSubtitle]}>
            For Students / Tenants
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            {'\u2022'} University and academic information (school, year level){'\n'}
            {'\u2022'} Location data for nearby boarding house search{'\n'}
            {'\u2022'} Booking history and saved properties{'\n'}
            {'\u2022'} Reviews and ratings submitted
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionSubtitle]}>
            For Property Owners
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            {'\u2022'} Property details: name, address, description, pricing, photos{'\n'}
            {'\u2022'} Property coordinates and map location{'\n'}
            {'\u2022'} Tenant management records{'\n'}
            {'\u2022'} Booking request and payment tracking data
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            2. How We Use Your Information
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            {'\u2022'} To provide, maintain, and improve our platform{'\n'}
            {'\u2022'} To connect students with property owners through booking requests{'\n'}
            {'\u2022'} To display property listings and search results{'\n'}
            {'\u2022'} To process and manage booking transactions{'\n'}
            {'\u2022'} To send notifications about account activity, booking updates, and important announcements{'\n'}
            {'\u2022'} To personalize your experience based on your preferences{'\n'}
            {'\u2022'} To ensure safety and prevent fraud or misuse
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            3. Information Sharing
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            We do not sell, rent, or trade your personal information to third parties. We may share your information only in the following circumstances:{'\n\n'}
            {'\u2022'} Between tenants and owners: When a student submits a booking request, their name and contact details are shared with the property owner to facilitate the transaction{'\n'}
            {'\u2022'} Service providers: With trusted third-party services that help us operate the platform (e.g., hosting, analytics){'\n'}
            {'\u2022'} Legal compliance: When required by law, regulation, or legal process{'\n'}
            {'\u2022'} Safety: To protect the rights, safety, or property of Beehauz, our users, or the public
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            4. Location Information
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            For students, we use location data to show boarding houses near your university or current location. For property owners, we collect property coordinates to display listings accurately on the map. You can disable location access anytime through your device settings, though this may limit map-related features.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            5. Data Security
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            We implement industry-standard security measures to protect your personal data, including encrypted data transmission, secure authentication, and access controls. While we strive to protect your information, no system is completely secure, and we cannot guarantee absolute security.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            6. Data Retention
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            We retain your personal information for as long as your account is active or as needed to provide our services. If you delete your account, we will remove your personal data within a reasonable timeframe, except where retention is required by law or for legitimate business purposes such as resolving disputes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            7. Your Rights
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            Under the Data Privacy Act of 2012 (Republic Act No. 10173), you have the right to:{'\n\n'}
            {'\u2022'} Access your personal data held by Beehauz{'\n'}
            {'\u2022'} Correct any inaccurate or incomplete information{'\n'}
            {'\u2022'} Request deletion of your account and associated data{'\n'}
            {'\u2022'} Object to or restrict the processing of your data{'\n'}
            {'\u2022'} Withdraw consent at any time{'\n'}
            {'\u2022'} Lodge a complaint with the National Privacy Commission
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            8. Children's Privacy
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            Beehauz is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have collected data from a minor, we will take steps to delete it promptly.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            9. Changes to This Policy
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            We may update this Privacy Policy from time to time. Any changes will be posted within the app, and the "Last updated" date will be revised accordingly. Continued use of Beehauz after changes are posted constitutes acceptance of the updated policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            10. Contact Us
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, you may reach us at:{'\n\n'}
            Email: villasoraironevonn@gmail.com{'\n'}
            Facebook: facebook.com/beehauz
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
  sectionSubtitle: {
    color: colors.gray[800],
    fontWeight: '600',
    marginTop: spacing[2],
    marginBottom: spacing[1],
  },
  sectionText: {
    color: colors.gray[700],
    lineHeight: 22,
  },
  bottomSpacing: {
    height: spacing[8],
  },
});