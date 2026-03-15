import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from '@expo/vector-icons';

import FortuneScreen from "../screens/FortuneScreen";
import NumberTableScreen from "../screens/NumberTableScreen";
import HistoryScreen from "../screens/HistoryScreen";
import DayNumberScreen from "../screens/DayNumberScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CalculatorScreen from "../screens/CalculatorScreen";
import AIAnalysisScreen from "../screens/AIAnalysisScreen";
import IntroScreen from "../screens/IntroScreen";
import DailyCardScreen from "../screens/DailyCardScreen";
import WeeklyReportScreen from "../screens/WeeklyReportScreen";const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Intro" component={IntroScreen} />
    </Stack.Navigator>
  );
}

function CalcStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      <Stack.Screen name="AIAnalysis" component={AIAnalysisScreen} />
      <Stack.Screen name="NumberTable" component={NumberTableScreen} />
    </Stack.Navigator>
  );
}

function ForecastStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DayNumber" component={DayNumberScreen} />
      <Stack.Screen name="Fortune" component={FortuneScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}

export default function TabNavigator(){

  return(
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Trang Chủ') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tính Toán') {
            iconName = focused ? 'calculator' : 'calculator-outline';
          } else if (route.name === 'Dự Báo') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Cá Nhân') {
            iconName = focused ? 'person' : 'person-outline';
          }
                    else if (route.name === 'Tarot') {
  iconName = focused ? 'moon' : 'moon-outline';
}
         else if (route.name === 'Weekly Report') {
  iconName = focused ? 'moon' : 'moon-outline';
}

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#CB9F42',
        tabBarInactiveTintColor: '#A09EAD',
        tabBarStyle: {
          backgroundColor: '#161421',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
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
      <Tab.Screen name="Trang Chủ" component={HomeStack} />
      <Tab.Screen name="Tính Toán" component={CalcStack} />
      <Tab.Screen name="Dự Báo" component={ForecastStack} />
      <Tab.Screen name="Cá Nhân" component={ProfileStack} />
          <Tab.Screen
  name="Tarot"
  component={DailyCardScreen}
  options={{ headerShown: false }}
/>
     <Tab.Screen
  name="Weekly Report"
  component={WeeklyReportScreen}
  options={{ headerShown: false }}
/>
    </Tab.Navigator>
  );
}
