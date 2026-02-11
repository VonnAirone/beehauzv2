import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Building2, User, Calendar, Heart, Home } from 'lucide-react-native';
import { Card } from '../../../components/common';
import { TenantStackParamList } from '../../../navigation/types';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';

type AboutUsScreenNavigationProp = StackNavigationProp<TenantStackParamList, 'AboutUs'>;

export const AboutUsScreen: React.FC = () => {
  const navigation = useNavigation<AboutUsScreenNavigationProp>();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.gray[700]} />
        </TouchableOpacity>
        <Text style={[typography.textStyles.h3, styles.headerTitle]}>About Us</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Beehauz Logo/Brand Section */}
        <Card style={styles.card}>
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Home size={48} color={colors.primary} />
            </View>
            <Text style={[typography.textStyles.h2, styles.brandName]}>Beehauz</Text>
            <Text style={[typography.textStyles.body, styles.brandTagline]}>
              Your one-stop student services app
            </Text>
          </View>
        </Card>

        {/* About Beehauz */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Building2 size={24} color={colors.primary} />
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>About Beehauz</Text>
          </View>
          
          <Text style={[typography.textStyles.body, styles.description]}>
            Beehauz is a comprehensive student services platform designed to make student life easier and more convenient. 
            We connect students with essential services including boarding house accommodations, laundry services (Palaba), 
            and food delivery (Pabakal).
          </Text>
          
          <Text style={[typography.textStyles.body, styles.description]}>
            Our mission is to create a seamless ecosystem where students can find quality accommodations, manage their daily needs, 
            and focus on what matters most - their education and personal growth.
          </Text>

          <Text style={[typography.textStyles.body, styles.description]}>
            Whether you're looking for a safe and comfortable place to stay, need your laundry done, or want delicious food 
            delivered to your doorstep, Beehauz has got you covered.
          </Text>
        </Card>

        {/* Founder Information */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <User size={24} color={colors.primary} />
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Our Founder</Text>
          </View>
          
          <View style={styles.founderInfo}>
            <View style={styles.founderAvatar}>
              <Text style={[typography.textStyles.h3, styles.founderInitials]}>AV</Text>
            </View>
            <View style={styles.founderDetails}>
              <Text style={[typography.textStyles.h4, styles.founderName]}>Airone Vonn Villasor</Text>
              <Text style={[typography.textStyles.body, styles.founderTitle]}>Founder & CEO</Text>
            </View>
          </View>
          
          <Text style={[typography.textStyles.body, styles.description]}>
            Airone Vonn Villasor founded Beehauz with a vision to revolutionize student services and create a platform 
            that truly understands and addresses the unique needs of students in their academic journey.
          </Text>
        </Card>

        {/* Company Information */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Calendar size={24} color={colors.primary} />
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Company Information</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[typography.textStyles.bodySmall, styles.infoLabel]}>Founded</Text>
              <Text style={[typography.textStyles.body, styles.infoValue]}>March 2025</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[typography.textStyles.bodySmall, styles.infoLabel]}>Headquarters</Text>
              <Text style={[typography.textStyles.body, styles.infoValue]}>Antique, Philippines</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[typography.textStyles.bodySmall, styles.infoLabel]}>Industry</Text>
              <Text style={[typography.textStyles.body, styles.infoValue]}>Student Services & Technology</Text>
            </View>
          </View>
        </Card>

        {/* Mission & Vision */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Heart size={24} color={colors.primary} />
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Our Mission & Vision</Text>
          </View>
          
          <View style={styles.missionSection}>
            <Text style={[typography.textStyles.h4, styles.subSectionTitle]}>Mission</Text>
            <Text style={[typography.textStyles.body, styles.description]}>
              To provide students with a comprehensive, reliable, and user-friendly platform that simplifies their daily lives 
              and enhances their academic experience through quality services and innovative solutions.
            </Text>
          </View>

          <View style={styles.missionSection}>
            <Text style={[typography.textStyles.h4, styles.subSectionTitle]}>Vision</Text>
            <Text style={[typography.textStyles.body, styles.description]}>
              To become the leading student services platform in the Philippines, empowering students to focus on their 
              education while we take care of their everyday needs.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: colors.gray[900],
    fontFamily: 'Figtree_600SemiBold',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  card: {
    margin: 20,
    marginBottom: 16,
  },
  brandSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandName: {
    color: colors.gray[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  brandTagline: {
    color: colors.gray[600],
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    color: colors.gray[900],
  },
  description: {
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: 16,
  },
  founderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  founderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  founderInitials: {
    color: colors.white,
    fontSize: 20,
  },
  founderDetails: {
    flex: 1,
  },
  founderName: {
    color: colors.gray[900],
    marginBottom: 4,
  },
  founderTitle: {
    color: colors.gray[600],
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    paddingVertical: 12,
  },
  infoItem: {
    flexDirection: 'column',
  },
  infoLabel: {
    color: colors.gray[500],
    marginBottom: 4,
  },
  infoValue: {
    color: colors.gray[900],
  },
  missionSection: {
    marginBottom: 20,
  },
  subSectionTitle: {
    color: colors.gray[800],
    marginBottom: 8,
  },
});