import { authFetch } from "@/lib/auth";

export interface Applicant {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  contactNumber?: string;
  barangay?: string;
  municipality?: string;
  employmentType?: string;
  employmentStatus?: string;
  createdAt?: string;
  // ...add more fields as needed
}

export interface FetchApplicantsResponse {
  applicants: Applicant[];
  total: number;
  limit: number;
  offset: number;
}

export async function fetchApplicants({
  page = 1,
  limit = 20,
  sortBy = "createdAt",
  sortOrder = "desc",
  search = "",
  employmentStatus = "",
  barangay = "",
  employmentType = "",
  registeredFrom = "",
  registeredTo = "",
}: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  employmentStatus?: string;
  barangay?: string;
  employmentType?: string;
  registeredFrom?: string;
  registeredTo?: string;
} = {}): Promise<FetchApplicantsResponse> {
  const offset = (page - 1) * limit;
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());
  params.append("sortBy", sortBy);
  params.append("sortOrder", sortOrder);
  if (search) params.append("search", search);
  if (employmentStatus) params.append("employmentStatus", employmentStatus);
  if (barangay) params.append("barangay", barangay);
  if (employmentType) params.append("employmentType", employmentType);
  if (registeredFrom) params.append("registeredFrom", registeredFrom);
  if (registeredTo) params.append("registeredTo", registeredTo);

  const res = await authFetch(`/api/admin/applicants?${params.toString()}`);
  if (!res.ok) {
    let message = "Failed to fetch applicants";
    try {
      const err = await res.json();
      message = err?.error || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}
