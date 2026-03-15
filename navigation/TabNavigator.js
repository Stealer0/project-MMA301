import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';

import FortuneScreen from "../screens/FortuneScreen";
import NumberTableScreen from "../screens/NumberTableScreen";
import HistoryScreen from "../screens/HistoryScreen";
import DayNumberScreen from "../screens/DayNumberScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CalculatorScreen from "../screens/CalculatorScreen";
import AIAnalysisScreen from "../screens/AIAnalysisScreen";
import IntroScreen from "../screens/IntroScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator(){

  return(
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Thông Tin') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Thần Số Học') {
            iconName = focused ? 'calculator' : 'calculator-outline';
          } else if (route.name === 'Chuyên Gia AI') {
            iconName = focused ? 'planet' : 'planet-outline';
          } else if (route.name === 'Bói số') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bảng') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Lịch sử') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Số ngày') {
            iconName = focused ? 'calendar' : 'calendar-outline';
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
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
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
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        sceneStyle: {
          backgroundColor: '#110F19'
        }
      })}
    >
      <Tab.Screen name="Thông Tin" component={IntroScreen} />
      <Tab.Screen name="Thần Số Học" component={CalculatorScreen} />
      <Tab.Screen name="Chuyên Gia AI" component={AIAnalysisScreen} />
      <Tab.Screen name="Bói số" component={FortuneScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Bảng" component={NumberTableScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Lịch sử" component={HistoryScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Số ngày" component={DayNumberScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Hồ sơ" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}