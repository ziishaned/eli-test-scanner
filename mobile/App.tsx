import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";

import CameraScreen from "./src/screens/CameraScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import OfflineNotice from "./src/components/OfflineNotice";
import { RootTabParamList } from "./src/types";

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <OfflineNotice />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === "Camera") {
                iconName = focused ? "camera" : "camera-outline";
              } else if (route.name === "History") {
                iconName = focused ? "list" : "list-outline";
              } else {
                iconName = "help-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "#007AFF",
            tabBarInactiveTintColor: "#8E8E93",
            tabBarStyle: {
              backgroundColor: "#F8F9FA",
              borderTopColor: "#E5E5E5",
              paddingBottom: 5,
              paddingTop: 5,
              height: 85,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "600",
            },
            headerShown: false,
          })}
        >
          <Tab.Screen
            name="Camera"
            component={CameraScreen}
            options={{
              tabBarLabel: "Camera",
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              tabBarLabel: "History",
            }}
          />
        </Tab.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
