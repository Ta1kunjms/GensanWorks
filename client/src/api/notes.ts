export async function fetchNotes(limit?: number) {
  const q = limit ? `?limit=${limit}` : "";
  const res = await fetch(`/api/notes${q}`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}
