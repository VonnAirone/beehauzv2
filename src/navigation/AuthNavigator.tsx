import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen, OwnerSignupScreen, SignupScreen } from '../screens/auth';
import { AuthStackParamList } from './types';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="OwnerSignup" component={OwnerSignupScreen} />
    </Stack.Navigator>
  );
};