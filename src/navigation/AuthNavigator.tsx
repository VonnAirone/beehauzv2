import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen, OwnerSignupScreen, SignupScreen } from '../screens/auth';
import { AuthStackParamList } from './types';
import { useUserType } from '../context/UserTypeContext';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  const { pendingAuthAction, setPendingAuthAction } = useUserType();

  const initialRoute = pendingAuthAction === 'ownerSignup' ? 'OwnerSignup' : 'Login';

  React.useEffect(() => {
    if (pendingAuthAction) setPendingAuthAction(null);
  }, []);

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
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