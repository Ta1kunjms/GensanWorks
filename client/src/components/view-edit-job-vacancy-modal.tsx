import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { authFetch } from '@/lib/auth';
import { X } from 'lucide-react';
import { SkillSpecializationInput } from "@/components/skill-specialization-input";

// Legacy interface retained for reference, replaced by shared JobVacancy
interface LegacyJobVacancy {
  id: string;
  employerId: string;
  establishmentName: string;
  positionTitle: string;
  numberOfVacancies: number;
  industryType?: any;
  minimumEducationRequired?: string;
  mainSkillOrSpecialization?: string;
  yearsOfExperienceRequired?: number;
  agePreference?: string;
  startingSalaryOrWage?: number;
  salaryType?: string;
  jobStatus?: string;
  benefits?: any;
  additionalRequirements?: string;
  jobDescription?: string;
  preparedByName?: string;
  preparedByDesignation?: string;
  preparedByContact?: string;
  dateAccomplished?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ViewEditJobVacancyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vacancyId?: string;
  onSave?: () => void;
  viewOnly?: boolean;
  startInEdit?: boolean;
}

type AdminJobDetails = {
  id?: string;
  employerId?: string;
  employer_id?: string;
  establishmentName?: string;
  companyName?: string;
  positionTitle?: string;
  position_title?: string;
  description?: string;
  location?: string;
  barangay?: string;
  municipality?: string;
  province?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryPeriod?: string;
  jobStatus?: string;
  minimumEducationRequired?: string;
  mainSkillOrSpecialization?: string;
  yearsOfExperienceRequired?: number | null;
  agePreference?: string;
  vacantPositions?: number | null;
  paidEmployees?: number | null;
  industryCodes?: unknown;
  preparedByName?: string;
  preparedByDesignation?: string;
  preparedByContact?: string;
  dateAccomplished?: string;
  status?: string;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export function ViewEditJobVacancyModal({
  open,
  onOpenChange,
  vacancyId,
  onSave,
  viewOnly = false,
  startInEdit = false,
}: ViewEditJobVacancyModalProps) {
  const { toast } = useToast();
  const [vacancy, setVacancy] = useState<AdminJobDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminJobDetails>>({});

  useEffect(() => {
    if (open && vacancyId) {
      fetchVacancy();
    }
    if (open) {
      setIsEditing(!viewOnly && startInEdit);
    }
  }, [open, vacancyId, startInEdit]);

  const fetchVacancy = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/admin/jobs/${vacancyId}`);
      if (!res.ok) throw new Error('Failed to fetch job details');
      const job = (await res.json()) as AdminJobDetails;

      setVacancy(job);
      setFormData(job);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const industryCodes = useMemo(() => {
    const raw = vacancy?.industryCodes;
    if (Array.isArray(raw)) return raw.map((v) => String(v)).filter(Boolean);
    if (typeof raw === 'string' && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map((v) => String(v)).filter(Boolean);
      } catch {
        return [];
      }
    }
    return [];
  }, [vacancy?.industryCodes]);

  const salaryDisplay = useMemo(() => {
    const min = vacancy?.salaryMin ?? null;
    const max = vacancy?.salaryMax ?? null;
    const period = vacancy?.salaryPeriod || '';
    if (typeof min === 'number' && typeof max === 'number' && max > min) {
      return `₱${min.toLocaleString()} - ₱${max.toLocaleString()}${period ? ` / ${period}` : ''}`;
    }
    const amount = typeof min === 'number' ? min : typeof max === 'number' ? max : null;
    return amount !== null ? `₱${amount.toLocaleString()}${period ? ` / ${period}` : ''}` : 'Negotiable';
  }, [vacancy?.salaryMin, vacancy?.salaryMax, vacancy?.salaryPeriod]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!vacancyId) return;

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};

      const add = (key: string, value: unknown) => {
        if (value !== undefined) payload[key] = value;
      };

      add('establishmentName', formData.establishmentName);
      add('positionTitle', formData.positionTitle);
      add('description', formData.description);
      add('location', formData.location);
      add('barangay', formData.barangay);
      add('municipality', formData.municipality);
      add('province', formData.province);
      add('jobStatus', formData.jobStatus);
      add('agePreference', formData.agePreference);
      add('preparedByName', formData.preparedByName);
      add('preparedByDesignation', formData.preparedByDesignation);
      add('preparedByContact', formData.preparedByContact);
      add('dateAccomplished', formData.dateAccomplished);

      // Map legacy/display fields in this modal back to the update schema (jobCreateSchema.partial)
      add('minimumEducation', (formData as any).minimumEducationRequired);
      const years = (formData as any).yearsOfExperienceRequired;
      if (years !== undefined && years !== '') {
        const parsed = Number(years);
        if (!Number.isNaN(parsed)) add('yearsOfExperience', parsed);
      }

      const vacantPositions = formData.vacantPositions;
      if (vacantPositions !== undefined && vacantPositions !== null) {
        const parsed = Number(vacantPositions);
        if (!Number.isNaN(parsed)) add('vacantPositions', parsed);
      }

      const paidEmployees = formData.paidEmployees;
      if (paidEmployees !== undefined && paidEmployees !== null) {
        const parsed = Number(paidEmployees);
        if (!Number.isNaN(parsed)) add('paidEmployees', parsed);
      }

      // Skill input maps to `skills` for updates
      if (formData.mainSkillOrSpecialization !== undefined) {
        add('skills', formData.mainSkillOrSpecialization);
      }

      const res = await authFetch(`/api/admin/jobs/${vacancyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to update job' }));
        const msg = (errorData && (errorData.message || errorData.error)) || 'Failed to update job';
        throw new Error(msg);
      }

      toast({ title: 'Success', description: 'Job updated successfully' });
      setIsEditing(false);
      onSave?.();
      await fetchVacancy();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to update job', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-0 shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 bg-white/70 backdrop-blur">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              {isEditing ? 'Edit Job Vacancy' : 'Job Vacancy Details'}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              {isEditing ? 'Update the fields below and save changes.' : 'Review the vacancy information.'}
            </DialogDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold uppercase tracking-wide">
              {vacancy?.jobStatus === 'P' ? 'Permanent' : vacancy?.jobStatus === 'T' ? 'Temporary' : vacancy?.jobStatus === 'C' ? 'Contractual' : 'Unspecified'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
              Posted {vacancy?.createdAt ? new Date(vacancy.createdAt).toLocaleDateString() : 'Recently'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-full max-w-md space-y-3">
              <div className="h-4 rounded-full bg-slate-200" />
              <div className="h-4 rounded-full bg-slate-200 w-2/3" />
              <div className="grid grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl bg-slate-100 border border-slate-200" />
                ))}
              </div>
            </div>
          </div>
        ) : vacancy ? (
          <div className="space-y-6 px-6 pb-6 pt-2 overflow-y-auto max-h-[75vh]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[{
                label: 'Starting Salary',
                value: salaryDisplay,
                helper: vacancy.salaryPeriod ? `${vacancy.salaryPeriod}` : 'Per submission',
              }, {
                label: 'Openings',
                value: `${vacancy.vacantPositions ?? 0}`,
                helper: vacancy.vacantPositions === 1 ? 'slot' : 'slots',
              }, {
                label: 'Experience',
                value: `${vacancy.yearsOfExperienceRequired ?? 0}+ yrs`,
                helper: vacancy.minimumEducationRequired || 'Education not set',
              }].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">{stat.label}</p>
                  <p className="text-xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.helper}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Core Details</p>
                    <p className="text-sm text-slate-500">Position, salary, headcount, and quals</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    {
                      label: 'Establishment Name',
                      name: 'establishmentName',
                      value: vacancy.establishmentName,
                      type: 'text',
                    },
                    {
                      label: 'Position Title',
                      name: 'positionTitle',
                      value: vacancy.positionTitle,
                      type: 'text',
                    },
                    {
                      label: 'Salary',
                      name: 'salaryDisplay',
                      value: salaryDisplay,
                      type: 'text',
                    },
                    {
                      label: 'Location',
                      name: 'location',
                      value: vacancy.location || [vacancy.barangay, vacancy.municipality, vacancy.province].filter(Boolean).join(', ') || '—',
                      type: 'text',
                    },
                    {
                      label: 'Barangay',
                      name: 'barangay',
                      value: vacancy.barangay || '—',
                      type: 'text',
                    },
                    {
                      label: 'Municipality/City',
                      name: 'municipality',
                      value: vacancy.municipality || '—',
                      type: 'text',
                    },
                    {
                      label: 'Province',
                      name: 'province',
                      value: vacancy.province || '—',
                      type: 'text',
                    },
                    {
                      label: 'No. of Vacant Positions',
                      name: 'vacantPositions',
                      value: vacancy.vacantPositions ?? 0,
                      type: 'number',
                      rawValue: formData.vacantPositions,
                    },
                    {
                      label: 'No. of Paid Employees',
                      name: 'paidEmployees',
                      value: vacancy.paidEmployees ?? 0,
                      type: 'number',
                      rawValue: formData.paidEmployees,
                    },
                    {
                      label: 'Minimum Education Required',
                      name: 'minimumEducationRequired',
                      value: vacancy.minimumEducationRequired || 'N/A',
                      type: 'text',
                    },
                    {
                      label: 'Years of Experience Required',
                      name: 'yearsOfExperienceRequired',
                      value: `${vacancy.yearsOfExperienceRequired || 0} years`,
                      type: 'number',
                      rawValue: formData.yearsOfExperienceRequired,
                    },
                    {
                      label: 'Age Preference',
                      name: 'agePreference',
                      value: vacancy.agePreference || 'N/A',
                      type: 'text',
                    },
                  ].map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 block">{field.label}</label>
                      {isEditing ? (
                        <Input type={field.type} name={field.name} value={(formData as any)[field.name] ?? ''} onChange={handleInputChange} />
                      ) : (
                        <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-slate-900">{field.value}</p>
                      )}
                    </div>
                  ))}
                </div>

                {vacancy.description && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">Description</label>
                    <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-slate-900 whitespace-pre-wrap">{vacancy.description}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Industry</p>
                    <p className="text-sm text-slate-500">SRS Form 2A industry codes</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {industryCodes.length > 0 ? (
                    industryCodes.map((code) => (
                      <span key={code} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800 border border-slate-200">
                        {code}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">N/A</p>
                  )}
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Job Requirements</p>
                    <p className="text-sm text-slate-500">Status, age preference, and skills</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Job Status (P/T/C) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">Job Status</label>
                    {isEditing ? (
                      <select
                        name="jobStatus"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                        value={formData.jobStatus || vacancy.jobStatus || 'P'}
                        onChange={(e) => handleInputChange(e as any)}
                      >
                        <option value="P">Permanent (P)</option>
                        <option value="T">Temporary (T)</option>
                        <option value="C">Contractual (C)</option>
                      </select>
                    ) : (
                      <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-slate-900">
                        {vacancy.jobStatus === 'P' ? 'Permanent (P)' : vacancy.jobStatus === 'T' ? 'Temporary (T)' : vacancy.jobStatus === 'C' ? 'Contractual (C)' : 'N/A'}
                      </p>
                    )}
                  </div>

                  {/* Age Preference */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">
                      Age Preference
                    </label>
                    {isEditing ? (
                      <Input
                        name="agePreference"
                        value={formData.agePreference || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-slate-900">{vacancy.agePreference || 'N/A'}</p>
                    )}
                  </div>

                  {/* Main Skill */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">
                      Main Skill or Specialization
                    </label>
                    {isEditing ? (
                      <SkillSpecializationInput
                        value={String((formData.mainSkillOrSpecialization as any) || '')}
                        onChange={(next) =>
                          setFormData((prev) => ({
                            ...prev,
                            mainSkillOrSpecialization: next,
                          }))
                        }
                        placeholder="Type a skill and press Enter"
                      />
                    ) : (
                      <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-slate-900">{vacancy.mainSkillOrSpecialization || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Prepared By</p>
                    <p className="text-sm text-slate-500">Contact person for this submission</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">
                      Prepared By Name
                    </label>
                    {isEditing ? (
                      <Input
                        name="preparedByName"
                        value={formData.preparedByName || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-slate-900">{vacancy.preparedByName || 'N/A'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">
                      Designation
                    </label>
                    {isEditing ? (
                      <Input
                        name="preparedByDesignation"
                        value={formData.preparedByDesignation || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-slate-900">{vacancy.preparedByDesignation || 'N/A'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">
                      Contact
                    </label>
                    {isEditing ? (
                      <Input
                        name="preparedByContact"
                        value={formData.preparedByContact || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-slate-900">{vacancy.preparedByContact || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              onOpenChange(false);
            }}
          >
            Close
          </Button>

          {!viewOnly && (
            <>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(vacancy || {});
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
