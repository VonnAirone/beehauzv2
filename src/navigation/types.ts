import { NavigatorScreenParams } from '@react-navigation/native';
import { BoardingHouse } from '../types/tenant';
import { BlogPost } from '../data/sampleBlogPosts';

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<TenantStackParamList> | NavigatorScreenParams<OwnerStackParamList> | NavigatorScreenParams<AdminStackParamList>;
  Admin: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OwnerSignup: undefined;
};

export type OwnerTabParamList = {
  Dashboard: undefined;
  Properties: undefined;
  Payments: undefined;
  More: undefined;
};

export type OwnerStackParamList = {
  OwnerTabs: NavigatorScreenParams<OwnerTabParamList> | undefined;
  Profile: undefined;
  PrivacyPolicy: undefined;
  AboutUs: undefined;
  TermsAndConditions: undefined;
  AddProperty: undefined;
  EditProperty: { propertyId: string };
  PropertyDetail: { propertyId: string };
  Tenants: undefined;
  TenantDetail: { tenantId: string };
  BookingHistory: undefined;
  Earnings: undefined;
  Messages: undefined;
  Chat: { chatId: string };
};

export type AdminStackParamList = {
  Tenants: undefined;
  Owner: undefined;
  Properties: undefined;
  Universities: undefined;
};

export type TenantTabParamList = {
  Search: undefined;
  Map: undefined;
  MyBookings: undefined;
  Notifications: undefined;
  Profile: undefined;
  More: undefined;
};

export type TenantStackParamList = {
  TenantTabs: NavigatorScreenParams<TenantTabParamList> | undefined;
  Filter: undefined;
  MapView: {
    focusedPropertyId?: string;
    focusedPropertyName?: string;
    focusedPropertyAddress?: string;
  } | undefined;
  BoardingHousesList: undefined;
  BoardingHouseDetail: { boardingHouse: BoardingHouse };
  BlogDetail: { blog: BlogPost };
  FavoritesList: undefined;
  PersonalInformation: undefined;
  EditProfile: undefined;
  StudentProfile: undefined;
  PrivacyPolicy: undefined;
  AboutUs: undefined;
  TermsAndConditions: undefined;
  Gallery: { houseId: string };
  Booking: { houseId: string };
  BookingDetail: { bookingId: string };
  Reviews: undefined;
  Messages: undefined;
  Chat: { chatId: string };
};

export type SharedScreens = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Messages: undefined;
  Chat: { chatId: string };
  Notifications: undefined;
};