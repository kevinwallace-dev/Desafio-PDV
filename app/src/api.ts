import type { Settings } from "./types";

export const BASE_URL = "http://YOUR_API_URL_HERE";
// Para testar no celular:
// - Emulador Android: http://10.0.2.2:3000
// - Celular fora da rede: use ngrok ex.:(ngrok-free.dev)
// - Mesma rede wifi: http://SEU_IP_LOCAL:3000

const USER_ID = 1;

async function mustJson(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    const errorMsg = text || `HTTP ${res.status}`;
    throw new Error(errorMsg);
  }
  return res.json();
}

export function getSettings(): Promise<Settings> {
  return fetch(`${BASE_URL}/v1/users/${USER_ID}/settings`).then(mustJson);
}

export function putSettings(
  payload: Partial<Pick<Settings, "notificationsEnabled" | "darkModeEnabled" | "enableSignature" | "profileSignature">>
): Promise<Settings> {
  return fetch(`${BASE_URL}/v1/users/${USER_ID}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(mustJson);
}

export function getAuditLogs(limit: number = 50): Promise<{ items: any[] }> {
  return fetch(`${BASE_URL}/v1/users/${USER_ID}/audit?limit=${limit}`).then(mustJson);
}
