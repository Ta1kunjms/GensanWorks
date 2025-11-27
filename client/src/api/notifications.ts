import { Notification } from "@shared/schema";

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch('/api/notifications');
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markNotificationRead(id: string): Promise<{ id: string; read: boolean }> {
  const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to mark notification read');
  return res.json();
}

// Simple SSE subscription helper
export function subscribeNotifications(onEvent: (type: string, data: any) => void): () => void {
  const es = new EventSource('/api/notifications/stream');
  es.addEventListener('new', (e) => {
    try { onEvent('new', JSON.parse((e as MessageEvent).data)); } catch {}
  });
  es.addEventListener('read', (e) => {
    try { onEvent('read', JSON.parse((e as MessageEvent).data)); } catch {}
  });
  es.addEventListener('seed', (e) => {
    try { onEvent('seed', JSON.parse((e as MessageEvent).data)); } catch {}
  });
  es.onerror = () => {
    // Allow auto-retry by EventSource default; could implement backoff here
  };
  return () => es.close();
}
