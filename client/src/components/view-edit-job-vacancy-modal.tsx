import { useState, useEffect } from 'react';
import type { JobVacancy } from '@shared/schema';
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
import { X } from 'lucide-react';

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
}

export function ViewEditJobVacancyModal({
  open,
  onOpenChange,
  vacancyId,
  onSave,
  viewOnly = false,
}: ViewEditJobVacancyModalProps) {
  const { toast } = useToast();
  const [vacancy, setVacancy] = useState<import('@shared/schema').JobVacancy | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  type FormData = Partial<JobVacancy> & { industryCodes?: string[] };
  const [formData, setFormData] = useState<FormData>({});

  useEffect(() => {
    if (open && vacancyId) {
      fetchVacancy();
    }
  }, [open, vacancyId]);

  const fetchVacancy = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/job-vacancies/${vacancyId}`);
      if (!res.ok) throw new Error('Failed to fetch vacancy');
      const data = await res.json();
      
      // Parse industryCodes if it's a JSON string
      let industryCodes: string[] = [];
      if (typeof data.industryCodes === 'string') {
        try { industryCodes = JSON.parse(data.industryCodes); }
        catch { industryCodes = []; }
      } else if (Array.isArray(data.industryCodes)) {
        industryCodes = data.industryCodes;
      }
      
      const parsedData = { ...data, industryCodes };
      setVacancy(parsedData);
      setFormData(parsedData);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'numberOfVacancies' || name === 'yearsOfExperienceRequired' || name === 'startingSalaryOrWage'
        ? Number(value)
        : value,
    }));
  };

  // Toggle industry code checkbox
  const toggleIndustryCode = (code: string) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.industryCodes) ? prev.industryCodes : [];
      const has = current.includes(code);
      const next = has ? current.filter((c) => c !== code) : [...current, code];
      return { ...prev, industryCodes: next } as any;
    });
  };

  const handleSave = async () => {
    if (!vacancyId) return;

    setSaving(true);
    try {
      // Ensure all required fields are present
      const payload = {
        employerId: formData.employerId || vacancy?.employerId || '',
        establishmentName: formData.establishmentName ?? vacancy?.establishmentName ?? '',
        positionTitle: formData.positionTitle ?? vacancy?.positionTitle ?? '',
        minimumEducationRequired: formData.minimumEducationRequired ?? vacancy?.minimumEducationRequired ?? '',
        mainSkillOrSpecialization: formData.mainSkillOrSpecialization ?? vacancy?.mainSkillOrSpecialization ?? undefined,
        yearsOfExperienceRequired: Number(formData.yearsOfExperienceRequired ?? vacancy?.yearsOfExperienceRequired ?? 0),
        agePreference: formData.agePreference ?? vacancy?.agePreference ?? undefined,
        startingSalaryOrWage: Number(formData.startingSalaryOrWage ?? vacancy?.startingSalaryOrWage ?? 0),
        vacantPositions: Number(formData.vacantPositions ?? vacancy?.vacantPositions ?? 0),
        paidEmployees: Number(formData.paidEmployees ?? vacancy?.paidEmployees ?? 0),
        jobStatus: formData.jobStatus ?? vacancy?.jobStatus ?? 'P',
        preparedByName: formData.preparedByName ?? vacancy?.preparedByName ?? '',
        preparedByDesignation: formData.preparedByDesignation ?? vacancy?.preparedByDesignation ?? '',
        preparedByContact: formData.preparedByContact ?? vacancy?.preparedByContact ?? undefined,
        dateAccomplished: formData.dateAccomplished ?? vacancy?.dateAccomplished ?? new Date().toISOString().slice(0,10),
        industryCodes: formData.industryCodes ?? vacancy?.industryCodes ?? [],
      };

      console.log('Saving vacancy with payload:', payload);

      const res = await fetch(`/api/job-vacancies/${vacancyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to update vacancy' }));
        console.error('Update failed:', errorData);
        
        // Extract error message properly
        const errorMessage = typeof errorData === 'string' 
          ? errorData 
          : errorData.error || errorData.message || JSON.stringify(errorData);
        
        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log('Update successful:', result);

      toast({
        title: 'Success',
        description: 'Job vacancy updated successfully',
      });

      setIsEditing(false);
      onOpenChange(false);
      onSave?.();
    } catch (error: any) {
      console.error('Save error:', error);
      let errorMessage = 'Unknown error';
      // Try to extract the most useful error message
      if (error && typeof error === 'object') {
        // If error is an Error instance with a message
        if (error.message && typeof error.message === 'string') {
          errorMessage = error.message;
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message && typeof error.message === 'object' && error.message.message) {
          errorMessage = error.message.message;
        } else if (error.details && Array.isArray(error.details) && error.details[0]?.message) {
          // Zod validation error details
          errorMessage = error.details[0].message;
        } else if (error.message) {
          errorMessage = JSON.stringify(error.message);
        } else {
          errorMessage = JSON.stringify(error);
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      console.error('Full error object:', error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Job Vacancy' : 'View Job Vacancy'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the job vacancy details below' : 'Job vacancy details'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600">Loading vacancy details...</p>
          </div>
        ) : vacancy ? (
          <div className="space-y-6">
            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Establishment Name */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Establishment Name
                </label>
                {isEditing ? (
                  <Input
                    name="establishmentName"
                    value={formData.establishmentName || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-slate-900">{vacancy.establishmentName}</p>
                )}
              </div>

              {/* Position Title */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Position Title
                </label>
                {isEditing ? (
                  <Input
                    name="positionTitle"
                    value={formData.positionTitle || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-slate-900">{vacancy.positionTitle}</p>
                )}
              </div>


              {/* Salary */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Starting Salary/Wage
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    name="startingSalaryOrWage"
                    value={formData.startingSalaryOrWage || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-slate-900">
                    ₱{(vacancy.startingSalaryOrWage || 0).toLocaleString()}
                  </p>
                )}
              </div>


              {/* Vacant Positions */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  No. of Vacant Position
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    name="vacantPositions"
                    value={formData.vacantPositions || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-slate-900">{vacancy.vacantPositions || 0}</p>
                )}
              </div>

              {/* Paid Employees */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  No. of Paid Employees
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    name="paidEmployees"
                    value={formData.paidEmployees || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-slate-900">{vacancy.paidEmployees || 0}</p>
                )}
              </div>

              {/* Education Required */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Minimum Education Required
                </label>
                {isEditing ? (
                  <Input
                    name="minimumEducationRequired"
                    value={formData.minimumEducationRequired || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-slate-900">{vacancy.minimumEducationRequired || 'N/A'}</p>
                )}
              </div>

              {/* Experience Required */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Years of Experience Required
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    name="yearsOfExperienceRequired"
                    value={formData.yearsOfExperienceRequired || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-slate-900">{vacancy.yearsOfExperienceRequired || 0}+ years</p>
                )}
              </div>

              {/* Industry (SRS Codes 01–17) - FULL WIDTH below grid */}
            </div>

            {/* Industry Section (Vertical List) */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-slate-700 block mb-3">Industry Engaged In</label>
              {isEditing ? (
                <div className="space-y-2">
                  {[
                    ['01','Agriculture'],['02','Fishing'],['03','Mining and Quarrying'],['04','Manufacturing'],
                    ['05','Electrical, Gas and Water Supply'],['06','Construction'],['07','Wholesale and Retail Trade'],['08','Hotels and Restaurant'],
                    ['09','Transport, Storage and Communication'],['10','Financial Intermediation'],['11','Real Estate, Renting and Business Activities'],['12','Public Administration and Defense'],
                    ['13','Education'],['14','Health and Social Work'],['15','Other Community, Social and Personal Service Activities'],['16','Private Households as Employers'],['17','Extra-Territorial Organizations and Bodies']
                  ].map(([code,label]) => (
                    <label key={code} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={((formData.industryCodes as string[] | undefined) || (vacancy.industryCodes as string[] | undefined) || []).includes(code as string)}
                        onChange={() => toggleIndustryCode(code as string)}
                      />
                      <span>{code} - {label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {(() => {
                    let codes: string[] = [];
                    if (typeof vacancy.industryCodes === 'string') {
                      try { codes = JSON.parse(vacancy.industryCodes); } catch {}
                    } else if (Array.isArray(vacancy.industryCodes)) {
                      codes = vacancy.industryCodes;
                    }
                    return codes.length > 0 ? (
                      codes.map((code) => {
                        const industryNameMap: Record<string, string> = {
                          '01': 'Agriculture','02': 'Fishing','03': 'Mining and Quarrying','04': 'Manufacturing',
                          '05': 'Electrical, Gas and Water Supply','06': 'Construction','07': 'Wholesale and Retail Trade','08': 'Hotels and Restaurant',
                          '09': 'Transport, Storage and Communication','10': 'Financial Intermediation','11': 'Real Estate, Renting and Business Activities','12': 'Public Administration and Defense',
                          '13': 'Education','14': 'Health and Social Work','15': 'Other Community, Social and Personal Service Activities','16': 'Private Households as Employers','17': 'Extra-Territorial Organizations and Bodies'
                        };
                        return (
                          <p key={code} className="text-sm text-slate-900">{code} - {industryNameMap[code] || 'Unknown'}</p>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-500">N/A</p>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Reopen grid for remaining fields */}
            <div className="grid grid-cols-2 gap-4">

              {/* Job Status (P/T/C) */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Job Status</label>
                {isEditing ? (
                  <select
                    name="jobStatus"
                    className="border rounded px-3 py-2"
                    value={formData.jobStatus || vacancy.jobStatus || 'P'}
                    onChange={(e) => handleInputChange(e as any)}
                  >
                    <option value="P">Permanent (P)</option>
                    <option value="T">Temporary (T)</option>
                    <option value="C">Contractual (C)</option>
                  </select>
                ) : (
                  <p className="text-slate-900">
                    {vacancy.jobStatus === 'P' ? 'Permanent (P)' : vacancy.jobStatus === 'T' ? 'Temporary (T)' : vacancy.jobStatus === 'C' ? 'Contractual (C)' : 'N/A'}
                  </p>
                )}
              </div>

              {/* Age Preference */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Age Preference
                </label>
                {isEditing ? (
                  <Input
                    name="agePreference"
                    value={formData.agePreference || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-slate-900">{vacancy.agePreference || 'N/A'}</p>
                )}
              </div>

              {/* Main Skill */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Main Skill or Specialization
                </label>
                {isEditing ? (
                  <Input
                    name="mainSkillOrSpecialization"
                    value={formData.mainSkillOrSpecialization || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-slate-900">{vacancy.mainSkillOrSpecialization || 'N/A'}</p>
                )}
              </div>
            </div>

            {/* Full Width Fields (none for strict SRS Form 2A beyond prepared by section) */}
            <div className="space-y-4">

              {/* Prepared By Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Prepared By Name
                  </label>
                  {isEditing ? (
                    <Input
                      name="preparedByName"
                      value={formData.preparedByName || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-slate-900">{vacancy.preparedByName || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Designation
                  </label>
                  {isEditing ? (
                    <Input
                      name="preparedByDesignation"
                      value={formData.preparedByDesignation || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-slate-900">{vacancy.preparedByDesignation || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Contact
                  </label>
                  {isEditing ? (
                    <Input
                      name="preparedByContact"
                      value={formData.preparedByContact || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-slate-900">{vacancy.preparedByContact || 'N/A'}</p>
                  )}
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
                <Button onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(vacancy || {});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                  >
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
