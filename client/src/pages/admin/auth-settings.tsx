import { useEffect, useState } from "react";
import { fetchAuthSettings, updateAuthSettings } from "@/api/settings";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { AuthSettings, AuthProvider, GoogleProvider, CustomProvider } from "@shared/schema";

// Type guards for discriminated union
function isGoogleProvider(p: AuthProvider): p is GoogleProvider {
  return p.id === "google";
}
function isCustomProvider(p: AuthProvider): p is CustomProvider {
  return p.id === "custom";
}

export default function AdminAuthSettingsPage() {
  const [settings, setSettings] = useState<AuthSettings>({ providers: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchAuthSettings();
        setSettings(s);
      } catch (e: any) {
        setError(e?.message || "Failed to load settings");
      }
    })();
  }, []);

  // Update a provider by id using type guards
  const updateProvider = (providerId: AuthProvider["id"], updater: (p: AuthProvider) => AuthProvider) => {
    setSettings(prev => ({
      providers: prev.providers.map(p => p.id === providerId ? updater(p) : p) as AuthProvider[]
    }));
  };

  // Only send allowed fields for each provider type
  function sanitizeProvider(p: AuthProvider): AuthProvider {
    if (isGoogleProvider(p)) {
      return {
        id: "google",
        enabled: !!p.enabled,
        config: {
          clientId: p.config.clientId || "",
          clientSecret: p.config.clientSecret || "",
          callbackUrl: p.config.callbackUrl || ""
        }
      };
    }
    if (isCustomProvider(p)) {
      return {
        id: "custom",
        enabled: !!p.enabled,
        config: {
          displayName: p.config.displayName || "",
          issuer: p.config.issuer || "",
          clientId: p.config.clientId || ""
        }
      };
    }
    // fallback: passthrough
    return p;
  }

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const sanitized: AuthSettings = {
        providers: settings.providers.map(sanitizeProvider) as AuthProvider[]
      };
      const saved = await updateAuthSettings(sanitized);
      setSettings(saved);
      setSuccess("Settings saved successfully.");
    } catch (e: any) {
      let msg = e?.message || "Failed to save settings";
      if (e?.response) {
        try {
          const data = await e.response.json();
          msg = data?.error || msg;
        } catch {}
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // For demo: allow adding new providers (future extensibility)
  const availableProviders: Array<{ id: "google" | "custom"; label: string }> = [
    { id: "google", label: "Google Sign-In" },
    { id: "custom", label: "Custom SSO" },
  ];

  const addProvider = (id: "google" | "custom") => {
    if (!settings.providers.some(p => p.id === id)) {
      let newProvider: AuthProvider;
      if (id === "google") {
        newProvider = {
          id: "google",
          enabled: false,
          config: { clientId: "", clientSecret: "", callbackUrl: "" }
        };
      } else {
        newProvider = {
          id: "custom",
          enabled: false,
          config: { displayName: "", issuer: "", clientId: "" }
        };
      }
      setSettings(prev => ({ providers: [...prev.providers, newProvider] }));
    }
    setShowAdd(false);
  };

  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Navbar handles page title; keep styling here. */}
      <p className="text-2xl font-semibold">Authentication Settings</p>
      <p className="text-sm text-muted-foreground">Configure available sign-in options. Login pages will adapt to enabled providers.</p>

      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}

      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={() => setShowAdd(v => !v)}>
            <Plus className="w-4 h-4 mr-1" /> Add Provider
          </Button>
        </div>
        {showAdd && (
          <div className="mb-4">
            <div className="flex gap-2 flex-wrap">
              {availableProviders.filter(ap => !settings.providers.some(p => p.id === ap.id)).length === 0 ? (
                <span className="text-xs text-muted-foreground">All providers added</span>
              ) : (
                availableProviders.filter(ap => !settings.providers.some(p => p.id === ap.id)).map(ap => (
                  <Button key={ap.id} size="sm" variant="secondary" onClick={() => addProvider(ap.id)}>
                    {ap.label}
                  </Button>
                ))
              )}
            </div>
          </div>
        )}
        {/* Render all providers */}
        {settings.providers.length === 0 && (
          <div className="text-sm text-muted-foreground">No providers added. Click "Add Provider" to begin.</div>
        )}
        {settings.providers.map((provider) => {
          if (isGoogleProvider(provider)) {
            const g = provider;
            return (
              <div key={g.id} className="border rounded-md p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Google Sign-In</div>
                    <div className="text-sm text-muted-foreground">Enable Google OAuth using your Client ID.</div>
                  </div>
                  <Switch checked={!!g.enabled} onCheckedChange={(val) => updateProvider(g.id, (p) => ({ ...p, enabled: val }))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="text-sm">Google Client ID</label>
                    <Input
                      placeholder="e.g., 1234567890-abc.apps.googleusercontent.com"
                      value={g.config.clientId || ""}
                      onChange={(e) => updateProvider(g.id, (p) => ({ ...p, config: { ...p.config, clientId: e.target.value } }))}
                      disabled={!g.enabled}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Client Secret</label>
                    <Input
                      placeholder="Google OAuth client secret"
                      value={g.config.clientSecret || ""}
                      onChange={(e) => updateProvider(g.id, (p) => ({ ...p, config: { ...p.config, clientSecret: e.target.value } }))}
                      disabled={!g.enabled}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Callback URL</label>
                    <Input
                      placeholder="e.g., http://localhost:5000/auth/google/callback"
                      value={g.config.callbackUrl || ""}
                      onChange={(e) => updateProvider(g.id, (p) => ({ ...p, config: { ...p.config, callbackUrl: e.target.value } }))}
                      disabled={!g.enabled}
                    />
                  </div>
                </div>
              </div>
            );
          } else if (isCustomProvider(provider)) {
            const c = provider;
            return (
              <div key={c.id} className="border rounded-md p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.config.displayName || "Custom SSO"}</div>
                    <div className="text-sm text-muted-foreground">Enable a custom SSO provider.</div>
                  </div>
                  <Switch checked={!!c.enabled} onCheckedChange={(val) => updateProvider(c.id, (p) => ({ ...p, enabled: val }))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="text-sm">Display Name</label>
                    <Input
                      placeholder="e.g., My Company SSO"
                      value={c.config.displayName || ""}
                      onChange={(e) => updateProvider(c.id, (p) => ({ ...p, config: { ...p.config, displayName: e.target.value } }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm">SSO Issuer URL</label>
                    <Input
                      placeholder="e.g., https://sso.example.com"
                      value={c.config.issuer || ""}
                      onChange={(e) => updateProvider(c.id, (p) => ({ ...p, config: { ...p.config, issuer: e.target.value } }))}
                      disabled={!c.enabled}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Client ID</label>
                    <Input
                      placeholder="e.g., my-app-client-id"
                      value={c.config.clientId || ""}
                      onChange={(e) => updateProvider(c.id, (p) => ({ ...p, config: { ...p.config, clientId: e.target.value } }))}
                      disabled={!c.enabled}
                    />
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="flex gap-2">
        <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>

      <div className="text-xs text-muted-foreground">
        Note: Server must also be configured with Google OAuth credentials. Enabling here toggles UI and routing.
      </div>
    </div>
  );
}
