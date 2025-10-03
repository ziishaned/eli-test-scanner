import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useAppStore } from "../store/appStore";
import { Ionicons } from "@expo/vector-icons";

export default function OfflineNotice() {
  const { isOffline, setOfflineStatus } = useAppStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setOfflineStatus(!state.isConnected);
    });

    return () => unsubscribe();
  }, [setOfflineStatus]);

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Ionicons name="wifi-outline" size={20} color="#fff" />
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FF9500",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: "absolute",
    top: 44, // Account for status bar
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});
