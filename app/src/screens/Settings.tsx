import React, { useEffect } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Input, LoadingView } from "../components";
import { useSettings } from "../hooks";
import { colors, typography } from "../theme";

export function Settings() {
  const { settings, loading, saving, loadSettings, saveSettings, updateSettings } = useSettings();

  useEffect(() => {
    loadSettings();
  }, []);

  async function onSave() {
    if (!settings) return;
    await saveSettings({
      notificationsEnabled: settings.notificationsEnabled,
      darkModeEnabled: settings.darkModeEnabled,
      enableSignature: settings.enableSignature,
      profileSignature: settings.profileSignature,
    });
  }

  if (loading || !settings) {
    return <LoadingView />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Receber Notificações</Text>
        <Switch
          value={settings.notificationsEnabled}
          onValueChange={(v) => updateSettings({ notificationsEnabled: v })}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Modo Dark</Text>
        <Switch
          value={settings.darkModeEnabled}
          onValueChange={(v) => updateSettings({ darkModeEnabled: v })}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Assinatura do Perfil</Text>
        <Switch
          value={settings.enableSignature}
          onValueChange={(v) => updateSettings({ enableSignature: v })}
        />
      </View>

      {settings.enableSignature && (
        <View style={styles.block}>
          <Text style={styles.label}>Editar Assinatura</Text>
          <Input
            value={settings.profileSignature ?? ""}
            placeholder="Digite sua assinatura"
            onChangeText={(t) => updateSettings({ profileSignature: t })}
          />
          <Text style={styles.hint}>Esta assinatura será exibida na página inicial.</Text>
        </View>
      )}

      <Button
        title="Salvar"
        onPress={onSave}
        disabled={saving}
        loading={saving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: typography.fontSize.base, fontFamily: typography.fontFamily.medium },
  block: { gap: 8, paddingTop: 8 },
  hint: { fontSize: typography.fontSize.xs, fontFamily: typography.fontFamily.regular, opacity: 0.7 },
});
