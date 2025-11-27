/**
 * View Job Vacancy Modal (Jobseeker)
 * Display-only modal for jobseekers to view job vacancy details
 */
import { useState, useEffect } from 'react';
import type { JobVacancy } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, MapPin, DollarSign, GraduationCap, Clock, Users } from 'lucide-react';


interface ViewJobVacancyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vacancyId?: string;
  onApply?: (vacancy: JobVacancy) => void;
}

export function ViewJobVacancyModal({
  open,
  onOpenChange,
  vacancyId,
  onApply,
}: ViewJobVacancyModalProps) {
  const { toast } = useToast();
  const [vacancy, setVacancy] = useState<JobVacancy | null>(null);
  const [loading, setLoading] = useState(false);

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
      let parsedIndustryCodes: string[] = [];
      if (typeof data.industryCodes === 'string') {
        try { parsedIndustryCodes = JSON.parse(data.industryCodes); }
        catch { parsedIndustryCodes = []; }
      } else if (Array.isArray(data.industryCodes)) {
        parsedIndustryCodes = data.industryCodes;
      }
      const normalized: JobVacancy = { ...data, industryCodes: parsedIndustryCodes as any };
      setVacancy(normalized);
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

  const handleApply = () => {
    if (vacancy && onApply) {
      onApply(vacancy);
      onOpenChange(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600">Loading job details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!vacancy) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {vacancy.positionTitle}
          </DialogTitle>
          <p className="text-lg text-slate-600 mt-1">{vacancy.establishmentName}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Key Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vacant Positions */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Vacant Positions</p>
                <p className="text-lg font-bold text-slate-900">{vacancy.vacantPositions || 0}</p>
              </div>
            </div>

            {/* Paid Employees */}
            <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Paid Employees</p>
                <p className="text-lg font-bold text-slate-900">{vacancy.paidEmployees || 0}</p>
              </div>
            </div>

            {/* Salary */}
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Starting Salary/Wage</p>
                <p className="text-lg font-bold text-slate-900">
                  ₱{(vacancy.startingSalaryOrWage || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Education */}
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <GraduationCap className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Education Required</p>
                <p className="text-base font-semibold text-slate-900">
                  {vacancy.minimumEducationRequired || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Experience */}
            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Experience Required</p>
                <p className="text-lg font-bold text-slate-900">
                  {vacancy.yearsOfExperienceRequired || 0}+ years
                </p>
              </div>
            </div>
          </div>

          {/* Main Skill/Specialization */}
          {vacancy.mainSkillOrSpecialization && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Main Skill or Specialization
              </h3>
              <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">
                {vacancy.mainSkillOrSpecialization}
              </p>
            </div>
          )}

          {/* Industry Codes */}
          {vacancy.industryCodes && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Industry Engaged In</h3>
              <div className="bg-slate-50 p-3 rounded-lg space-y-1">
                {(() => {
                  const industryNameMap: Record<string, string> = {
                    '01': 'Agriculture','02': 'Fishing','03': 'Mining and Quarrying','04': 'Manufacturing',
                    '05': 'Electrical, Gas and Water Supply','06': 'Construction','07': 'Wholesale and Retail Trade','08': 'Hotels and Restaurant',
                    '09': 'Transport, Storage and Communication','10': 'Financial Intermediation','11': 'Real Estate, Renting and Business Activities','12': 'Public Administration and Defense',
                    '13': 'Education','14': 'Health and Social Work','15': 'Other Community, Social and Personal Service Activities','16': 'Private Households as Employers','17': 'Extra-Territorial Organizations and Bodies'
                  };
                  let codes: string[] = [];
                  if (typeof vacancy.industryCodes === 'string') {
                    try { codes = JSON.parse(vacancy.industryCodes); } catch {}
                  } else if (Array.isArray(vacancy.industryCodes)) {
                    codes = vacancy.industryCodes;
                  }
                  return codes.length > 0 ? (
                    codes.map((code) => (
                      <p key={code} className="text-sm text-slate-900">
                        {code} - {industryNameMap[code] || 'Unknown'}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">N/A</p>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Age Preference */}
          {vacancy.agePreference && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Age Preference</h3>
              <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">
                {vacancy.agePreference}
              </p>
            </div>
          )}

          {/* Job Status */}
          {vacancy.jobStatus && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Employment Type</h3>
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {vacancy.jobStatus === 'P' ? 'Permanent (P)' : 
                 vacancy.jobStatus === 'T' ? 'Temporary (T)' : 
                 vacancy.jobStatus === 'C' ? 'Contractual (C)' : 'N/A'}
              </span>
            </div>
          )}

          {/* Contact Information */}
          {(vacancy.preparedByName || vacancy.preparedByContact) && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Contact Information</h3>
              <div className="bg-slate-50 p-3 rounded-lg space-y-1">
                {vacancy.preparedByName && (
                  <p className="text-slate-900">
                    <span className="font-medium">Prepared by:</span> {vacancy.preparedByName}
                    {vacancy.preparedByDesignation && ` (${vacancy.preparedByDesignation})`}
                  </p>
                )}
                {vacancy.preparedByContact && (
                  <p className="text-slate-900">
                    <span className="font-medium">Contact:</span> {vacancy.preparedByContact}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            onClick={handleApply}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Apply for this Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
