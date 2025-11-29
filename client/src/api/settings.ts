import type { AuthProvider, AuthSettings } from "@shared/schema";

export async function fetchAuthSettings(): Promise<AuthSettings> {
  const res = await fetch("/api/settings/auth");
  if (!res.ok) throw new Error("Failed to fetch auth settings");
  return res.json();
}

export async function updateAuthSettings(settings: AuthSettings): Promise<AuthSettings> {
  const res = await fetch("/api/settings/auth", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Failed to update auth settings");
  return res.json();
}
