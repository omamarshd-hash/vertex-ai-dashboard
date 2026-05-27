import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import InboxScreen from '../screens/InboxScreen';
import MeetingsScreen from '../screens/MeetingsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';

const Tab = createBottomTabNavigator();

const icons = {
  Dashboard: '📊',
  Inbox: '💬',
  AI: '🤖',
  Meetings: '📅',
  Settings: '⚙️',
};

export default function AppNavigator({ user, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.5 }}>
            {icons[route.name]}
          </Text>
        ),
        tabBarActiveTintColor: '#00c9a7',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Dashboard">{() => <DashboardScreen user={user} />}</Tab.Screen>
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="AI" component={AIAssistantScreen} />
      <Tab.Screen name="Meetings" component={MeetingsScreen} />
      <Tab.Screen name="Settings">{() => <SettingsScreen user={user} onLogout={onLogout} />}</Tab.Screen>
    </Tab.Navigator>
  );
}