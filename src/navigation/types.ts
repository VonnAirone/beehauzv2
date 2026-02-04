import { BoardingHouse } from '../types/tenant';
import { BlogPost } from '../data/sampleBlogPosts';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type OwnerStackParamList = {
  Dashboard: undefined;
  Properties: undefined;
  AddProperty: undefined;
  EditProperty: { propertyId: string };
  PropertyDetail: { propertyId: string };
  Tenants: undefined;
  TenantDetail: { tenantId: string };
  BookingRequests: undefined;
  BookingHistory: undefined;
  Earnings: undefined;
  Profile: undefined;
  Messages: undefined;
  Chat: { chatId: string };
};

export type TenantTabParamList = {
  Search: undefined;
  Map: undefined;
  MyBookings: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type TenantStackParamList = {
  TenantTabs: undefined;
  Filter: undefined;
  MapView: undefined;
  BoardingHousesList: undefined;
  BoardingHouseDetail: { boardingHouse: BoardingHouse };
  BlogDetail: { blog: BlogPost };
  FavoritesList: undefined;
  PersonalInformation: undefined;
  EditProfile: undefined;
  PrivacyPolicy: undefined;
  AboutUs: undefined;
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