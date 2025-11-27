import { Applicant } from "../unified-schema";

function toArray(value: any): any[] {
	if (!value) return [];
	if (Array.isArray(value)) return value;
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function computeProfileCompleteness(applicant: Partial<Applicant>): number {
	const education = toArray(applicant.education);
	const workExperience = toArray(applicant.workExperience);
	const otherSkills = toArray(applicant.otherSkills);
	const preferredOccupations = toArray(applicant.preferredOccupations);

	const fields = [
		!!(applicant.surname && applicant.firstName && applicant.dateOfBirth), // Personal Info
		!!(applicant.contactNumber || applicant.email), // Contact Info
		!!(applicant.houseStreetVillage && applicant.barangay), // Address
		education.length > 0, // Education
		workExperience.length > 0, // Work Experience
		otherSkills.length > 0, // Skills
		preferredOccupations.length > 0, // Job Preferences
	];

	const filledCount = fields.filter(Boolean).length;
	return Math.round((filledCount / fields.length) * 100);
}

