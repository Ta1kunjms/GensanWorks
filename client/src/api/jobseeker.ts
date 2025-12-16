import { ProfileImageResponse, ChangePassword } from "@shared/schema";
import { authFetch } from "@/lib/auth";

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

// Upload profile image for jobseeker
export async function uploadProfileImage(file: File): Promise<ProfileImageResponse> {
  const image = await fileToDataUrl(file);
  const res = await authFetch("/api/jobseeker/profile-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, fileName: file.name, mimeType: file.type }),
  });
  if (!res.ok) throw new Error("Failed to upload image");
  return res.json();
}

// Change or set password for jobseeker
export async function changePassword({ currentPassword, newPassword, confirmPassword }: ChangePassword): Promise<{ success: boolean; message: string }> {
  const res = await authFetch("/api/jobseeker/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });
  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(data?.message || data?.error || "Failed to change password");
  }
  return data;
}
