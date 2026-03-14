import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';

import FortuneScreen from "../screens/FortuneScreen";
import NumberTableScreen from "../screens/NumberTableScreen";
import HistoryScreen from "../screens/HistoryScreen";
import DayNumberScreen from "../screens/DayNumberScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator(){

  return(
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Bói số') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bảng') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Lịch sử') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Số ngày') {
            iconName = focused ? 'star' : 'star-outline';
          } else if (route.name === 'Hồ sơ') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#CB9F42',
        tabBarInactiveTintColor: '#A09EAD',
        tabBarStyle: {
          backgroundColor: '#161421',
          borderTopWidth: 0,
        },
        headerStyle: {
          backgroundColor: '#110F19',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: '#CB9F42',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        sceneStyle: {
          backgroundColor: '#110F19'
        }
      })}
    >
      <Tab.Screen name="Bói số" component={FortuneScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Bảng" component={NumberTableScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Lịch sử" component={HistoryScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Số ngày" component={DayNumberScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Hồ sơ" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}