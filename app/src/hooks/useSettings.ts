import { useState } from "react";
import { Alert } from "react-native";
import { getSettings, putSettings } from "../api";
import type { Settings } from "../types";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
      return data;
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Falha ao carregar configurações");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(data: Partial<Settings>) {
    try {
      setSaving(true);
      const updated = await putSettings({
        notificationsEnabled: data.notificationsEnabled ?? settings?.notificationsEnabled ?? false,
        darkModeEnabled: data.darkModeEnabled ?? settings?.darkModeEnabled ?? false,
        enableSignature: data.enableSignature ?? settings?.enableSignature ?? false,
        profileSignature: data.profileSignature ?? null,
      });
      setSettings(updated);
      Alert.alert("Ok", "Preferências salvas.");
      return updated;
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Falha ao salvar");
      return null;
    } finally {
      setSaving(false);
    }
  }

  function updateSettings(data: Partial<Settings>) {
    setSettings((prev) => (prev ? { ...prev, ...data } : null));
  }

  return {
    settings,
    loading,
    saving,
    loadSettings,
    saveSettings,
    updateSettings,
  };
}
