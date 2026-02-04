# BoardingHouse Finder App

A React Native mobile application for boarding house accommodation, designed specifically for students and property owners.

## 📱 Features

### For Students (Tenants)
- 🔍 Search and filter boarding houses
- 📍 Location-based search with map view
- ❤️ Save favorites
- 📅 Book accommodations
- ⭐ Rate and review properties
- 💬 Message property owners
- 📊 View booking history

### For Property Owners
- 🏠 Manage property listings
- 👥 Manage tenant applications
- 📈 View earnings and analytics
- 📋 Handle booking requests
- 💬 Communicate with tenants
- 📊 Dashboard with insights

### Shared Features
- 🔐 Secure authentication
- 👤 User profiles
- 📱 Push notifications
- 💬 In-app messaging
- ⚙️ Settings and preferences

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components (Button, Input, Card)
│   ├── owner/          # Owner-specific components
│   ├── tenant/         # Tenant-specific components
│   ├── forms/          # Form components
│   └── ui/             # Pure UI components
├── screens/            # App screens/pages
│   ├── auth/           # Authentication screens
│   ├── owner/          # Owner-only screens
│   ├── tenant/         # Tenant-only screens
│   ├── shared/         # Screens used by both user types
│   └── onboarding/     # App introduction screens
├── navigation/         # Navigation configuration
├── services/           # API calls and external services
│   ├── owner/          # Owner-specific services
│   ├── tenant/         # Tenant-specific services
│   └── shared/         # Common services
├── hooks/              # Custom React hooks
├── context/            # React Context providers
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── styles/             # Global styles and themes
└── assets/             # Images, icons, fonts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- React Native development environment

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Install navigation dependencies (when ready):
   ```bash
   npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
   npx expo install react-native-screens react-native-safe-area-context
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## 📦 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (to be installed)
- **State Management**: React Context + Custom Hooks
- **Styling**: StyleSheet with custom design system
- **API**: RESTful API (to be implemented)

## 🎨 Design System

The app uses a consistent design system with:
- **Colors**: Primary (#007AFF), Secondary (#FF9500), and neutral grays
- **Typography**: System fonts with defined text styles
- **Spacing**: 4px grid system
- **Components**: Reusable UI components with consistent styling

## 🔧 Development Guidelines

1. **Component Organization**: Keep components in appropriate folders (common, owner, tenant)
2. **Type Safety**: Use TypeScript for all files with proper type definitions
3. **Hooks**: Create custom hooks for complex logic and API interactions
4. **Services**: Organize API calls by user type and functionality
5. **Testing**: Write tests for components, hooks, and utilities

## 📱 User Types

The app supports two distinct user types:
- **Owner**: Property owners who list and manage boarding houses
- **Tenant**: Students looking for accommodation

Each user type has a tailored experience with specific features and navigation.

## 🚧 Next Steps

1. Install React Navigation dependencies
2. Implement complete navigation system
3. Set up backend API integration
4. Add authentication flow
5. Implement core features for both user types
6. Add testing suite
7. Configure app deployment

## 📄 License

This project is licensed under the MIT License.