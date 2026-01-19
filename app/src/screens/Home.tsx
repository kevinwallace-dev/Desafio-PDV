import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Card, LoadingView } from "../components";
import { useSettings } from "../hooks";
import { colors, typography } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function Home({ navigation }: Props) {
  const { settings, loadSettings, loading } = useSettings();

  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [])
  );

  if (loading || !settings) {
    return <LoadingView />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.welcome}>Bem vindo</Text>

        <Button
          title="Configurações"
          onPress={() => navigation.navigate("Settings")}
        />
      </View>

      {settings.enableSignature && settings.profileSignature && (
        <Card>
          <Text style={styles.signatureText}>{settings.profileSignature}</Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  topSection: {
    alignItems: "center",
    gap: 32,
  },
  welcome: {
    fontSize: typography.fontSize["4xl"],
    fontFamily: typography.fontFamily.bold,
    textAlign: "center",
    color: colors.text.primary,
  },
  signatureText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
});
