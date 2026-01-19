import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { colors, typography } from "../theme";

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message = "Carregando…" }: LoadingViewProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontFamily: typography.fontFamily.regular,
    color: colors.text.muted,
    opacity: 0.7,
  },
});
