import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Format API error responses. If the server returned a Zod error with `details`,
// this will join the individual issues into a readable message.
export function formatApiError(body: any): string {
  if (!body) return 'Unknown server error';
  if (Array.isArray(body)) return body.map(String).join('; ');
  if (body.details && Array.isArray(body.details)) {
    return body.details
      .map((d: any) => {
        const path = Array.isArray(d.path) ? d.path.join('.') : String(d.path || '');
        return path ? `${path}: ${d.message}` : d.message;
      })
      .join('; ');
  }
  if (body.error) return typeof body.error === 'string' ? body.error : JSON.stringify(body.error);
  if (body.message) return String(body.message);
  return JSON.stringify(body);
}
