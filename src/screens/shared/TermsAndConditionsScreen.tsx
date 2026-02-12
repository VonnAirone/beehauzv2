import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SubPageHeader } from '../../components/common';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

export const TermsAndConditionsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <SubPageHeader title="Terms and Conditions" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[typography.textStyles.bodySmall, styles.lastUpdated]}>
          Last updated: February 2026
        </Text>

        <View style={styles.section}>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            Welcome to Beehauz. By accessing or using the Beehauz application ("App"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree with any part of these Terms, please do not use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            1. Definitions
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            {'\u2022'} "Beehauz" refers to the platform, its operators, and affiliated services{'\n'}
            {'\u2022'} "User" refers to any person who accesses or uses the App, including students/tenants and property owners{'\n'}
            {'\u2022'} "Student" or "Tenant" refers to users searching for or booking boarding house accommodations{'\n'}
            {'\u2022'} "Owner" refers to property owners who list and manage boarding house properties on the platform{'\n'}
            {'\u2022'} "Property" or "Listing" refers to any boarding house or accommodation listed on the App
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            2. Eligibility
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            You must be at least 18 years old to create an account and use the App. By using Beehauz, you represent that you meet this age requirement and that the information you provide during registration is accurate and complete.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            3. Account Registration
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            {'\u2022'} You are responsible for maintaining the confidentiality of your account credentials{'\n'}
            {'\u2022'} You are responsible for all activities that occur under your account{'\n'}
            {'\u2022'} You must provide accurate and up-to-date information during registration{'\n'}
            {'\u2022'} Beehauz reserves the right to suspend or terminate accounts that violate these Terms
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            4. Use of the Platform
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionSubtitle]}>
            For Students / Tenants
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            {'\u2022'} You may use the App to search, compare, and book boarding house accommodations{'\n'}
            {'\u2022'} Booking requests submitted through the App are subject to approval by property owners{'\n'}
            {'\u2022'} You agree to provide truthful information in your profile and booking requests{'\n'}
            {'\u2022'} You agree to communicate respectfully with property owners through the platform
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionSubtitle]}>
            For Property Owners
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            {'\u2022'} You may use the App to list, manage, and promote your boarding house properties{'\n'}
            {'\u2022'} You are responsible for the accuracy of your property listings, including pricing, descriptions, photos, and availability{'\n'}
            {'\u2022'} You agree to respond to booking requests in a timely manner{'\n'}
            {'\u2022'} You agree to comply with all applicable local laws and regulations regarding property rental and tenant management
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            5. Booking and Transactions
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            {'\u2022'} Beehauz facilitates connections between students and property owners but is not a party to any rental agreement between them{'\n'}
            {'\u2022'} All booking arrangements, including terms of stay, payment, and house rules, are agreed upon directly between the student and the property owner{'\n'}
            {'\u2022'} Beehauz is not responsible for disputes arising from rental agreements, payment issues, or property conditions{'\n'}
            {'\u2022'} Users are encouraged to verify property details and terms before confirming any booking
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            6. Content and Conduct
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            You agree not to:{'\n\n'}
            {'\u2022'} Post false, misleading, or fraudulent content{'\n'}
            {'\u2022'} Upload content that is offensive, defamatory, or violates the rights of others{'\n'}
            {'\u2022'} Use the App for any unlawful purpose or activity{'\n'}
            {'\u2022'} Attempt to gain unauthorized access to other accounts or system resources{'\n'}
            {'\u2022'} Interfere with or disrupt the functioning of the App{'\n'}
            {'\u2022'} Scrape, copy, or reproduce any part of the platform without permission
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            7. Intellectual Property
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            All content, features, and functionality of the Beehauz App — including its design, logos, text, graphics, and software — are owned by Beehauz and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from any part of the App without prior written consent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            8. Limitation of Liability
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            Beehauz is provided on an "as is" and "as available" basis. We do not guarantee that the App will be error-free, uninterrupted, or meet your specific requirements.{'\n\n'}
            To the fullest extent permitted by law, Beehauz shall not be liable for:{'\n\n'}
            {'\u2022'} Any direct, indirect, incidental, or consequential damages arising from your use of the App{'\n'}
            {'\u2022'} Loss of data, revenue, or profits resulting from use or inability to use the App{'\n'}
            {'\u2022'} Actions or omissions of other users, including property owners and tenants{'\n'}
            {'\u2022'} The condition, safety, or legality of any listed property
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            9. Disclaimers
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            {'\u2022'} Beehauz does not own, operate, or manage any boarding house listed on the platform{'\n'}
            {'\u2022'} Beehauz does not guarantee the accuracy of property listings, reviews, or user-provided information{'\n'}
            {'\u2022'} Accreditation status displayed on the platform is based on information provided by property owners and may not reflect real-time status{'\n'}
            {'\u2022'} Users are advised to conduct their own due diligence before entering into any rental arrangement
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            10. Privacy
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            Your use of Beehauz is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information. By using the App, you consent to the practices described in the Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            11. Termination
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            Beehauz reserves the right to suspend or terminate your account at any time, with or without notice, for conduct that violates these Terms or is harmful to other users, Beehauz, or third parties. Upon termination, your right to use the App ceases immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            12. Changes to These Terms
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            We may update these Terms from time to time. Any changes will be posted within the App, and the "Last updated" date will be revised accordingly. Continued use of Beehauz after changes are posted constitutes acceptance of the updated Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            13. Governing Law
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes arising from or related to these Terms shall be resolved in the appropriate courts of the Philippines.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            14. Contact Us
          </Text>
          <Text style={[typography.textStyles.body, styles.sectionText]}>
            If you have questions or concerns about these Terms, you may reach us at:{'\n\n'}
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
