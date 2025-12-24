import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Target, User, Settings } from 'lucide-react-native';

// Screens
import AuthScreen from '../screens/AuthScreen';
import PlayerHomeScreen from '../screens/PlayerHomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminScreen from '../screens/AdminScreen';
import SponsorScreen from '../screens/SponsorScreen';

// Context
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function PlayerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={PlayerHomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Loading handled by AuthProvider
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : user.role === 'admin' ? (
          <Stack.Screen name="Admin" component={AdminScreen} />
        ) : user.role === 'sponsor' ? (
          <Stack.Screen name="Sponsor" component={SponsorScreen} />
        ) : (
          <Stack.Screen name="Main" component={PlayerTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}