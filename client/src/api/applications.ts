import { authFetch } from "@/lib/auth";

export interface JobseekerApplicationItem {
  id: string;
  job: {
    title: string;
    location: string;
    employer: { company: string };
  };
  status: string;
  createdAt?: string;
}

export async function fetchJobseekerApplications(): Promise<JobseekerApplicationItem[]> {
  const res = await authFetch("/api/jobseeker/applications");
  if (!res.ok) {
    let message = "Failed to fetch applications";
    try {
      const err = await res.json();
      message = err?.error || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}
