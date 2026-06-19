import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PatientsScreen from '../screens/PatientsScreen';
import PatientProfileScreen from '../screens/PatientProfileScreen';
import ReportsScreen from '../screens/ReportsScreen';
import CreateReportScreen from '../screens/CreateReportScreen';
import PrintReportScreen from '../screens/PrintReportScreen';
import DoctorsScreen from '../screens/DoctorsScreen';
import DoctorAnalyticsScreen from '../screens/DoctorAnalyticsScreen';
import TestsScreen from '../screens/TestsScreen';
import BillingScreen from '../screens/BillingScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import InventoryScreen from '../screens/InventoryScreen';
import StaffScreen from '../screens/StaffScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WidalTestScreen from '../screens/WidalTestScreen';
import ReportLookupScreen from '../screens/ReportLookupScreen';
import PublicPrintScreen from '../screens/PublicPrintScreen';
import PublicWelcomeScreen from '../screens/PublicWelcomeScreen';
import PublicAppointmentScreen from '../screens/PublicAppointmentScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ label, focused }) => (
  <View style={styles.tabIcon}>
    <Text style={[styles.tabText, focused && styles.tabTextActive]}>
      {label.slice(0, 2).toUpperCase()}
    </Text>
  </View>
);

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: '#00488d',
      tabBarInactiveTintColor: '#999',
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
    }}
  >
    <Tab.Screen
      name="DashboardTab"
      component={DashboardScreen}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <TabIcon label="HM" focused={focused} /> }}
    />
    <Tab.Screen
      name="PatientsTab"
      component={PatientsScreen}
      options={{ tabBarLabel: 'Patients', tabBarIcon: ({ focused }) => <TabIcon label="PT" focused={focused} /> }}
    />
    <Tab.Screen
      name="ReportsTab"
      component={ReportsScreen}
      options={{ tabBarLabel: 'Reports', tabBarIcon: ({ focused }) => <TabIcon label="RP" focused={focused} /> }}
    />
    <Tab.Screen
      name="BillingTab"
      component={BillingScreen}
      options={{ tabBarLabel: 'Billing', tabBarIcon: ({ focused }) => <TabIcon label="BL" focused={focused} /> }}
    />
    <Tab.Screen
      name="MoreTab"
      component={MoreStack}
      options={{ tabBarLabel: 'More', tabBarIcon: ({ focused }) => <TabIcon label="MO" focused={focused} /> }}
    />
  </Tab.Navigator>
);

const MoreStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#00488d' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '800' } }}>
    <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
    <Stack.Screen name="Patients" component={PatientsScreen} options={{ title: 'Patients' }} />
    <Stack.Screen name="PatientProfile" component={PatientProfileScreen} options={{ title: 'Patient Profile' }} />
    <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
    <Stack.Screen name="CreateReport" component={CreateReportScreen} options={{ title: 'New Report' }} />
    <Stack.Screen name="PrintReport" component={PrintReportScreen} options={{ title: 'Print Report' }} />
    <Stack.Screen name="Doctors" component={DoctorsScreen} options={{ title: 'Doctors' }} />
    <Stack.Screen name="DoctorAnalytics" component={DoctorAnalyticsScreen} options={{ title: 'Dr. Analytics' }} />
    <Stack.Screen name="Tests" component={TestsScreen} options={{ title: 'Tests' }} />
    <Stack.Screen name="Billing" component={BillingScreen} options={{ title: 'Billing' }} />
    <Stack.Screen name="Appointments" component={AppointmentsScreen} options={{ title: 'Appointments' }} />
    <Stack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory' }} />
    <Stack.Screen name="Staff" component={StaffScreen} options={{ title: 'Staff' }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    <Stack.Screen name="WidalTest" component={WidalTestScreen} options={{ title: 'Widal Test' }} />
  </Stack.Navigator>
);

const PublicStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PublicWelcome" component={PublicWelcomeScreen} />
    <Stack.Screen name="ReportLookup" component={ReportLookupScreen} />
    <Stack.Screen name="PublicAppointment" component={PublicAppointmentScreen} />
    <Stack.Screen name="PublicPrint" component={PublicPrintScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#00488d' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '800' } }}>
          <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
          <Stack.Screen name="PatientProfile" component={PatientProfileScreen} options={{ title: 'Patient Profile' }} />
          <Stack.Screen name="CreateReport" component={CreateReportScreen} options={{ title: 'New Report' }} />
          <Stack.Screen name="PrintReport" component={PrintReportScreen} options={{ title: 'Print Report' }} />
          <Stack.Screen name="DoctorAnalytics" component={DoctorAnalyticsScreen} options={{ title: 'Dr. Analytics' }} />
          <Stack.Screen name="WidalTest" component={WidalTestScreen} options={{ title: 'Widal Test' }} />
          <Stack.Screen name="Doctors" component={DoctorsScreen} options={{ title: 'Doctors' }} />
          <Stack.Screen name="Tests" component={TestsScreen} options={{ title: 'Tests' }} />
          <Stack.Screen name="Billing" component={BillingScreen} options={{ title: 'Billing' }} />
          <Stack.Screen name="Appointments" component={AppointmentsScreen} options={{ title: 'Appointments' }} />
          <Stack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory' }} />
          <Stack.Screen name="Staff" component={StaffScreen} options={{ title: 'Staff' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        </Stack.Navigator>
      ) : (
        <PublicStack />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 4,
    paddingTop: 4,
    height: 60,
  },
  tabIcon: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 14, fontWeight: '800', color: '#999' },
  tabTextActive: { color: '#00488d' },
});

export default AppNavigator;
