/**
 * Jobseeker Profile Page - NSRP Registration Form
 * Route: /jobseeker/profile
 * Only accessible to users with role='jobseeker' or 'freelancer'
 * Displays complete NSRP (National Service and Referral Program) registration data
 */
import { useState, useEffect } from 'react';
import { useAuth, authFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SkillSpecializationInput } from '@/components/skill-specialization-input';
import { useFieldErrors, type FieldErrors } from '@/lib/field-errors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Settings,
  FileText,
  Phone,
  Mail,
  Calendar,
  Heart,
  Globe,
  Building2,
  CheckCircle2,
  Edit3,
  Save,
  X,
} from 'lucide-react';
import type { Applicant } from '@shared/schema';
import {
  nsrpEmploymentTypes,
  nsrpEmploymentStatusOptions,
  nsrpEmployedBranches,
  nsrpSelfEmploymentCategories,
  nsrpUnemployedReasons,
} from '@shared/schema';
import { EDUCATION_LEVEL_OPTIONS } from '@shared/education';
import { type ProvinceOption, type MunicipalityOption, type BarangayOption } from '@/lib/locations';
const employmentStatusChoices = [
  ...nsrpEmploymentStatusOptions,
  'Self-employed',
  'New Entrant/Fresh Graduate',
  'Finished Contract',
  'Resigned',
  'Retired',
  'Terminated/Laid off',
  'Terminated/Laid off due to calamity',
  'Terminated/Laid off (local)',
  'Terminated/Laid off (abroad)',
];

const educationLevels = EDUCATION_LEVEL_OPTIONS.filter((level) => level !== 'No specific requirement');

const workExperienceStatusOptions = ['Permanent', 'Contractual', 'Temporary'];

const otherSkillsOptions = [
  'Auto Mechanic',
  'Beautician',
  'Carpentry Work',
  'Computer Literate',
  'Domestic Chores',
  'Driver',
  'Electrician',
  'Embroidery',
  'Gardening',
  'Masonry',
  'Painter/Artist',
  'Painting Jobs',
  'Photography',
  'Plumbing',
  'Sewing Dresses',
  'Stenography',
  'Tailoring',
  'Others',
] as const;

const adminBarangays = [
  'Apopong',
  'Baluan',
  'Batomelong',
  'Buayan',
  'Bula',
  'Calumpang',
  'City Heights',
  'Conel',
  'Dadiangas East',
  'Dadiangas North',
  'Dadiangas South',
  'Dadiangas West',
  'Fatima',
  'Katangawan',
  'Labangal',
  'Lagao',
  'Ligaya',
  'Mabuhay',
  'Olympog',
  'San Isidro',
  'San Jose',
  'Siguel',
  'Sinawal',
  'Tambler',
  'Tinagacan',
  'Upper Labay',
];

const adminLocationOptions: ProvinceOption[] = [
  {
    code: 'SC',
    name: 'South Cotabato',
    municipalities: [
      {
        code: 'GENSAN',
        name: 'General Santos City',
        barangays: adminBarangays.map((b) => ({ code: b, name: b })),
      },
    ],
  },
];

export default function JobseekerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Applicant | null>(null);
  const [formData, setFormData] = useState<Partial<Applicant>>({});
  const [provinceOptions, setProvinceOptions] = useState<ProvinceOption[]>(adminLocationOptions);
  const [municipalityOptions, setMunicipalityOptions] = useState<MunicipalityOption[]>([]);
  const [barangayOptions, setBarangayOptions] = useState<BarangayOption[]>([]);

  type AddressField = 'houseStreetVillage' | 'barangay' | 'municipality' | 'province';
  const { fieldErrors, clearFieldError, setErrorsAndFocus, setFieldErrors } = useFieldErrors<AddressField>();

  useEffect(() => {
    if (loading) return;
    const hasProvince = Boolean(formData.province?.trim());
    if (!hasProvince && adminLocationOptions.length) {
      const defaultProvince = adminLocationOptions[0];
      const defaultMunicipality = defaultProvince.municipalities[0];
      setFormData((prev) => ({
        ...prev,
        province: defaultProvince.name,
        municipality: defaultMunicipality?.name || prev.municipality,
      }));
    }
  }, [loading, formData.province]);

  useEffect(() => {
    fetchProfileData();
  }, [user?.id]);

  useEffect(() => {
    if (!provinceOptions.length) {
      setMunicipalityOptions([]);
      setBarangayOptions([]);
      return;
    }

    const province = provinceOptions.find((p) => p.name === formData.province);
    const municipalities = province?.municipalities || [];
    setMunicipalityOptions(municipalities);

    if (formData.municipality && !municipalities.some((m) => m.name === formData.municipality)) {
      setFormData((prev) => ({ ...prev, municipality: '', barangay: '' }));
    }
  }, [provinceOptions, formData.province, formData.municipality]);

  useEffect(() => {
    const municipality = municipalityOptions.find((m) => m.name === formData.municipality);
    const brgys = municipality?.barangays || [];
    setBarangayOptions(brgys);

    if (formData.barangay && !brgys.some((b) => b.name === formData.barangay)) {
      setFormData((prev) => ({ ...prev, barangay: '' }));
    }
  }, [municipalityOptions, formData.municipality, formData.barangay]);

  const fetchProfileData = async () => {
    if (!user?.id) {
      console.log('No user ID found');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching profile for user:', user.id);
      
      const res = await authFetch(`/api/applicants/${user.id}?view=profile`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to fetch profile' }));
        throw new Error(errorData.error || 'Failed to fetch profile');
      }
      
      const data = await res.json();
      console.log('Profile data fetched:', data);

      const normalizedSex = data.sex === 'Male' || data.sex === 'Female' ? data.sex : 'Male';
      
      // Normalize date fields: convert ISO strings to YYYY-MM-DD format for date inputs
      const normalizeDate = (dateValue: any): string => {
        if (!dateValue) return '';
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return '';
          // Extract YYYY-MM-DD from ISO string
          return date.toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      const normalizedData = {
        ...data,
        sex: normalizedSex,
        dateOfBirth: normalizeDate(data.dateOfBirth),
        returnToPHDate: normalizeDate(data.returnToPHDate),
      };

      setProfileData(normalizedData);
      setFormData(normalizedData);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();

    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your profile.',
        variant: 'destructive',
      });
      return;
    }

    const requiredAddress = [
      { key: 'houseStreetVillage', label: 'House/Street/Village' },
      { key: 'barangay', label: 'Barangay' },
      { key: 'municipality', label: 'Municipality/City' },
      { key: 'province', label: 'Province' },
    ] as const;

    const nextErrors: FieldErrors<AddressField> = {};
    for (const { key, label } of requiredAddress) {
      if (!String((formData as any)[key] || '').trim()) {
        nextErrors[key] = `${label} is required`;
      }
    }

    if (Object.keys(nextErrors).length) {
      setErrorsAndFocus(nextErrors);
      return;
    }

    try {
      const stripNullish = (value: any): any => {
        if (value === null || value === undefined) return undefined;
        if (Array.isArray(value)) {
          return value
            .map(stripNullish)
            .filter((v) => v !== undefined);
        }
        if (typeof value === 'object') {
          const out: Record<string, any> = {};
          for (const [k, v] of Object.entries(value)) {
            const cleaned = stripNullish(v);
            if (cleaned === undefined) continue;
            out[k] = cleaned;
          }
          return out;
        }
        return value;
      };

      const cleanedFormData = stripNullish(formData) as Partial<Applicant>;

      console.log('Updating profile with data:', cleanedFormData);
      
      const res = await authFetch(`/api/applicants/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cleanedFormData,
          sex: cleanedFormData.sex === 'Female' ? 'Female' : 'Male',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to update profile' }));
        throw new Error(errorData.error || 'Failed to update profile');
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      setIsEditing(false);
      await fetchProfileData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: keyof Applicant, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (
      field === 'houseStreetVillage' ||
      field === 'barangay' ||
      field === 'municipality' ||
      field === 'province'
    ) {
      clearFieldError(field as AddressField);
    }
  };

  const handleProvinceChange = (value: string) => {
    setFormData(prev => ({ ...prev, province: value, municipality: '', barangay: '' }));
    clearFieldError('province');
    clearFieldError('municipality');
    clearFieldError('barangay');
  };

  const handleMunicipalityChange = (value: string) => {
    setFormData(prev => ({ ...prev, municipality: value, barangay: '' }));
    clearFieldError('municipality');
    clearFieldError('barangay');
  };

  const syncEmploymentType = (
    detail?: string | null,
    category?: string | null,
    categoryOther?: string | null,
  ) => {
    if (detail === 'Self-employed') {
      if (category === 'Others') {
        handleInputChange('employmentType', categoryOther || 'Others');
      } else if (category) {
        handleInputChange('employmentType', category as Applicant['employmentType']);
      } else {
        handleInputChange('employmentType', 'Self-employed');
      }
      return;
    }

    if (detail === 'Wage employed') {
      handleInputChange('employmentType', 'Wage employed');
      return;
    }

    handleInputChange('employmentType', undefined);
  };

  const resetEmploymentDetailFields = () => {
    handleInputChange('employmentStatusDetail', undefined);
    handleInputChange('selfEmployedCategory', undefined);
    handleInputChange('selfEmployedCategoryOther', '');
  };

  const resetUnemploymentFields = () => {
    handleInputChange('unemployedReason', undefined);
    handleInputChange('unemployedReasonOther', '');
    handleInputChange('unemployedAbroadCountry', '');
    handleInputChange('monthsUnemployed', undefined);
  };

  const handleEmploymentStatusChange = (value: Applicant['employmentStatus']) => {
    handleInputChange('employmentStatus', value);
    if (value === 'Employed') {
      resetUnemploymentFields();
    } else if (value === 'Unemployed') {
      resetEmploymentDetailFields();
      handleInputChange('employmentType', undefined);
    }
  };

  const handleEmploymentStatusDetailChange = (value: Applicant['employmentStatusDetail']) => {
    handleInputChange('employmentStatusDetail', value);
    if (value !== 'Self-employed') {
      handleInputChange('selfEmployedCategory', undefined);
      handleInputChange('selfEmployedCategoryOther', '');
    }
    syncEmploymentType(value, formData.selfEmployedCategory, formData.selfEmployedCategoryOther);
  };

  const handleSelfEmployedCategoryChange = (value: Applicant['selfEmployedCategory']) => {
    handleInputChange('selfEmployedCategory', value);
    if (value !== 'Others') {
      handleInputChange('selfEmployedCategoryOther', '');
    }
    syncEmploymentType(formData.employmentStatusDetail, value, formData.selfEmployedCategoryOther);
  };

  const handleUnemployedReasonChange = (value: Applicant['unemployedReason']) => {
    handleInputChange('unemployedReason', value);
    if (value !== 'Terminated/Laid off (abroad)') {
      handleInputChange('unemployedAbroadCountry', '');
    }
    if (value !== 'Others') {
      handleInputChange('unemployedReasonOther', '');
    }
  };


  const handleOtherSkillToggle = (skill: typeof otherSkillsOptions[number]) => {
    setFormData(prev => {
      const skills = (prev.otherSkills || []) as typeof otherSkillsOptions[number][];
      const exists = skills.includes(skill);
      const next = exists ? skills.filter((s) => s !== skill) : [...skills, skill];
      return { ...prev, otherSkills: next };
    });
  };

  // Helpers for editing array fields in formData
  const updateArrayField = (key: keyof Applicant, index: number, field: string, value: any) => {
    setFormData(prev => {
      const arr = Array.isArray((prev as any)[key]) ? ([...(prev as any)[key]] as any[]) : [];
      arr[index] = { ...(arr[index] || {}), [field]: value };
      return { ...prev, [key]: arr } as Partial<Applicant>;
    });
  };

  const addArrayItem = (key: keyof Applicant, item: any) => {
    setFormData(prev => {
      const arr = Array.isArray((prev as any)[key]) ? ([...(prev as any)[key]] as any[]) : [];
      arr.push(item);
      return { ...prev, [key]: arr } as Partial<Applicant>;
    });
  };

  const removeArrayItem = (key: keyof Applicant, index: number) => {
    setFormData(prev => {
      const arr = Array.isArray((prev as any)[key]) ? ([...(prev as any)[key]] as any[]) : [];
      arr.splice(index, 1);
      return { ...prev, [key]: arr } as Partial<Applicant>;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-slate-600">No profile data found. Please contact administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sectionCardClass = "bg-white rounded-2xl border border-slate-100 shadow-sm";
  const sectionHeaderClass = "border-b border-slate-100";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50 py-8 px-4">
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row gap-6">
        {/* Profile Card Left */}
        <aside className="w-full lg:w-72 bg-white rounded-3xl shadow-xl p-6 space-y-6 border border-blue-100 flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
              alt="Profile"
              className="w-28 h-28 rounded-2xl object-cover shadow-lg"
            />
            <button
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-lg"
              onClick={() => {}}
              title="Edit profile image"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mt-4">{user?.name || "Jobseeker"}</h2>
          <p className="text-sm text-slate-500">{user?.role === "freelancer" ? "Freelancer" : "Jobseeker"}</p>
          <div className="mt-2 flex flex-col items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">NSRP Profile</Badge>
            <p className="text-xs text-slate-500">Keep your details updated for better matching and referrals.</p>
          </div>
        </aside>

        {/* Main Info Card Right */}
        <section className="flex-1">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-blue-500">Profile Overview</p>
                <p className="text-3xl font-semibold text-slate-900">NSRP Profile</p>
                <p className="text-slate-500 text-sm">Update your personal information, address, and work details.</p>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 border-0 shadow-md">
                    <Edit3 className="w-4 h-4 mr-2" />Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 border-0 shadow-md">
                      <Save className="w-4 h-4 mr-2" />Save
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(profileData);
                      }}
                      variant="outline"
                    >
                      <X className="w-4 h-4 mr-2" />Cancel
                    </Button>
                  </>
                )}
              </div>
            </header>

            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="mb-4 grid grid-cols-5 gap-2">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="employment">Employment</TabsTrigger>
                <TabsTrigger value="industry">Industry</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card className={sectionCardClass}>
            <CardHeader className={sectionHeaderClass}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 text-white shadow-lg">
                      <User className="w-5 h-5" />
                    </div>
                    Personal Information
                  </CardTitle>
                  <CardDescription className="mt-2 text-slate-600 dark:text-slate-300">Your basic personal details from NSRP registration form</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 dark:from-white/5 dark:to-blue-500/5">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Name Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Surname *</Label>
                        <Input
                          value={formData.surname || ''}
                          onChange={(e) => handleInputChange('surname', e.target.value)}
                          placeholder="Last name"
                          className="mt-1.5 border-slate-200 bg-white/50 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name *</Label>
                        <Input
                          value={formData.firstName || ''}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="First name"
                          className="mt-1.5 border-slate-200 bg-white/50 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Middle Name</Label>
                        <Input
                          value={formData.middleName || ''}
                          onChange={(e) => handleInputChange('middleName', e.target.value)}
                          placeholder="Middle name"
                          className="mt-1.5 border-slate-200 bg-white/50 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Suffix</Label>
                        <Input
                          value={formData.suffix || ''}
                          onChange={(e) => handleInputChange('suffix', e.target.value)}
                          placeholder="Jr., Sr., III"
                          className="mt-1.5 border-slate-200 bg-white/50 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/30 p-6 dark:from-white/5 dark:to-purple-500/5">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth *</Label>
                        <Input
                          type="date"
                          value={formData.dateOfBirth || ''}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="mt-1.5 border-slate-200 bg-white/50 shadow-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sex</Label>
                        <select
                          value={formData.sex || 'Male'}
                          onChange={(e) => handleInputChange('sex', e.target.value)}
                          className="mt-1.5 w-full px-3 py-2 border border-slate-200 bg-white/50 rounded-lg shadow-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-white/10 dark:bg-white/5"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Civil Status</Label>
                        <select
                          value={formData.civilStatus || 'Single'}
                          onChange={(e) => handleInputChange('civilStatus', e.target.value)}
                          className="mt-1.5 w-full px-3 py-2 border border-slate-200 bg-white/50 rounded-lg shadow-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-white/10 dark:bg-white/5"
                        >
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Height</Label>
                        <Input
                          value={formData.height || ''}
                          onChange={(e) => handleInputChange('height', e.target.value)}
                          placeholder="e.g., 5'6"
                          className="mt-1.5 border-slate-200 bg-white/50 shadow-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Religion</Label>
                        <Input
                          value={formData.religion || ''}
                          onChange={(e) => handleInputChange('religion', e.target.value)}
                          placeholder="Your religion"
                          className="mt-1.5 border-slate-200 bg-white/50 shadow-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Disability Status</Label>
                        <select
                          value={formData.disability || 'None'}
                          onChange={(e) => handleInputChange('disability', e.target.value)}
                          className="mt-1.5 w-full px-3 py-2 border border-slate-200 bg-white/50 rounded-lg shadow-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-white/10 dark:bg-white/5"
                        >
                          <option value="None">None</option>
                          <option value="Visual">Visual</option>
                          <option value="Hearing">Hearing</option>
                          <option value="Speech">Speech</option>
                          <option value="Physical">Physical</option>
                          <option value="Mental">Mental</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 p-6 dark:from-white/5 dark:to-emerald-500/5">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Number</Label>
                        <Input
                          value={formData.contactNumber || ''}
                          onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                          placeholder="09XX XXX XXXX"
                          className="mt-1.5 border-slate-200 bg-white/50 shadow-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</Label>
                        <Input
                          type="email"
                          value={formData.email || ''}
                          disabled
                          placeholder="your.email@example.com"
                          className="mt-1.5 border-slate-200 bg-white/50 shadow-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5"
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Email cannot be changed here.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-6 dark:from-blue-500/5 dark:to-indigo-500/5">
                    <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="group">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-500/10 p-2 transition-transform group-hover:scale-110">
                            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Full Name</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{`${profileData.firstName} ${profileData.middleName || ''} ${profileData.surname} ${profileData.suffix || ''}`.trim()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-purple-500/10 p-2 transition-transform group-hover:scale-110">
                            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Date of Birth</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-pink-500/10 p-2 transition-transform group-hover:scale-110">
                            <User className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sex</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{profileData.sex}</p>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-rose-500/10 p-2 transition-transform group-hover:scale-110">
                            <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Civil Status</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{profileData.civilStatus}</p>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-indigo-500/10 p-2 transition-transform group-hover:scale-110">
                            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Height</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{profileData.height || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-violet-500/10 p-2 transition-transform group-hover:scale-110">
                            <Heart className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Religion</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{profileData.religion || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 p-6 dark:from-emerald-500/5 dark:to-teal-500/5">
                    <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="group">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-emerald-500/10 p-2 transition-transform group-hover:scale-110">
                            <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Contact Number</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{profileData.contactNumber || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-teal-500/10 p-2 transition-transform group-hover:scale-110">
                            <Mail className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{profileData.email || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="group md:col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-amber-500/10 p-2 transition-transform group-hover:scale-110">
                            <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Disability Status</p>
                            <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{profileData.disability || 'None'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Tab */}
        <TabsContent value="address">
          <Card className={sectionCardClass}>
            <CardHeader className={sectionHeaderClass}>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-2.5 text-white shadow-lg">
                  <MapPin className="w-5 h-5" />
                </div>
                Address Information
              </CardTitle>
              <CardDescription className="text-base">Your residential address (Part of I. Personal Information)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="rounded-2xl bg-gradient-to-br from-orange-50/50 to-red-50/30 p-6 dark:from-orange-500/5 dark:to-red-500/5">
                  <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Residential Address</h3>
                  <div className="space-y-5">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">House/Street/Village *</Label>
                      <Input
                        aria-invalid={!!fieldErrors.houseStreetVillage}
                        value={formData.houseStreetVillage || ''}
                        onChange={(e) => handleInputChange('houseStreetVillage', e.target.value)}
                        placeholder="Complete address"
                        className="mt-1.5 border-slate-200 bg-white/50 shadow-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:border-destructive aria-[invalid=true]:focus:ring-2 aria-[invalid=true]:focus:ring-destructive/20 dark:border-white/10 dark:bg-white/5"
                      />
                      {fieldErrors.houseStreetVillage && (
                        <p className="mt-1 text-xs text-destructive">{fieldErrors.houseStreetVillage}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Province *</Label>
                        {provinceOptions.length ? (
                          <select
                            aria-invalid={!!fieldErrors.province}
                            value={formData.province || ''}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className="mt-1.5 w-full px-3 py-2 border border-slate-200 bg-white/50 rounded-lg shadow-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:border-destructive aria-[invalid=true]:focus:ring-2 aria-[invalid=true]:focus:ring-destructive/20 dark:border-white/10 dark:bg-white/5"
                          >
                            <option value="">Select province</option>
                            {provinceOptions.map((province) => (
                              <option key={province.code} value={province.name}>{province.name}</option>
                            ))}
                            {formData.province && !provinceOptions.some((p) => p.name === formData.province) && (
                              <option value={formData.province}>{`Keep current: ${formData.province}`}</option>
                            )}
                          </select>
                        ) : (
                          <Input
                            aria-invalid={!!fieldErrors.province}
                            value={formData.province || ''}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            placeholder="Enter province"
                            className="mt-1.5 border-slate-200 bg-white/50 shadow-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:border-destructive aria-[invalid=true]:focus:ring-2 aria-[invalid=true]:focus:ring-destructive/20 dark:border-white/10 dark:bg-white/5"
                          />
                        )}
                        {fieldErrors.province && <p className="mt-1 text-xs text-destructive">{fieldErrors.province}</p>}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Municipality/City *</Label>
                        {municipalityOptions.length ? (
                          <select
                            aria-invalid={!!fieldErrors.municipality}
                            value={formData.municipality || ''}
                            onChange={(e) => handleMunicipalityChange(e.target.value)}
                            className="mt-1.5 w-full px-3 py-2 border border-slate-200 bg-white/50 rounded-lg shadow-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:border-destructive aria-[invalid=true]:focus:ring-2 aria-[invalid=true]:focus:ring-destructive/20 dark:border-white/10 dark:bg-white/5"
                            disabled={!formData.province}
                          >
                            <option value="">Select municipality/city</option>
                            {municipalityOptions.map((muni) => (
                              <option key={muni.code} value={muni.name}>{muni.name}</option>
                            ))}
                            {formData.municipality && !municipalityOptions.some((m) => m.name === formData.municipality) && (
                              <option value={formData.municipality}>{`Keep current: ${formData.municipality}`}</option>
                            )}
                          </select>
                        ) : (
                          <Input
                            aria-invalid={!!fieldErrors.municipality}
                            value={formData.municipality || ''}
                            onChange={(e) => handleMunicipalityChange(e.target.value)}
                            placeholder="Enter municipality or city"
                            className="mt-1.5 border-slate-200 bg-white/50 shadow-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:border-destructive aria-[invalid=true]:focus:ring-2 aria-[invalid=true]:focus:ring-destructive/20 dark:border-white/10 dark:bg-white/5"
                          />
                        )}
                        {fieldErrors.municipality && (
                          <p className="mt-1 text-xs text-destructive">{fieldErrors.municipality}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Barangay *</Label>
                        {barangayOptions.length ? (
                          <select
                            aria-invalid={!!fieldErrors.barangay}
                            value={formData.barangay || ''}
                            onChange={(e) => handleInputChange('barangay', e.target.value)}
                            className="mt-1.5 w-full px-3 py-2 border border-slate-200 bg-white/50 rounded-lg shadow-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:border-destructive aria-[invalid=true]:focus:ring-2 aria-[invalid=true]:focus:ring-destructive/20 dark:border-white/10 dark:bg-white/5"
                            disabled={!formData.municipality}
                          >
                            <option value="">Select barangay</option>
                            {barangayOptions.map((barangay) => (
                              <option key={barangay.code} value={barangay.name}>{barangay.name}</option>
                            ))}
                            {formData.barangay && !barangayOptions.some((b) => b.name === formData.barangay) && (
                              <option value={formData.barangay}>{`Keep current: ${formData.barangay}`}</option>
                            )}
                          </select>
                        ) : (
                          <Input
                            aria-invalid={!!fieldErrors.barangay}
                            value={formData.barangay || ''}
                            onChange={(e) => handleInputChange('barangay', e.target.value)}
                            placeholder="Enter barangay"
                            className="mt-1.5 border-slate-200 bg-white/50 shadow-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:border-destructive aria-[invalid=true]:focus:ring-2 aria-[invalid=true]:focus:ring-destructive/20 dark:border-white/10 dark:bg-white/5"
                          />
                        )}
                        {fieldErrors.barangay && <p className="mt-1 text-xs text-destructive">{fieldErrors.barangay}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-gradient-to-br from-orange-50/50 to-red-50/30 p-6 dark:from-orange-500/5 dark:to-red-500/5">
                  <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Residential Address</h3>
                  <div className="group">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-orange-500/10 p-2 transition-transform group-hover:scale-110">
                        <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Complete Address</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                          {profileData.houseStreetVillage}<br />
                          {profileData.barangay}, {profileData.municipality}<br />
                          {profileData.province}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employment Status Tab */}
        <TabsContent value="employment">
          <Card className={sectionCardClass}>
            <CardHeader className={sectionHeaderClass}>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 text-white shadow-lg">
                  <Briefcase className="w-5 h-5" />
                </div>
                Employment Status
              </CardTitle>
              <CardDescription className="text-base">Your current employment status (OFW, 4Ps, etc.)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoField icon={Briefcase} label="Employment Status" value={profileData.employmentStatus || 'Not specified'} />
                  <InfoField icon={Briefcase} label="Employment Type" value={profileData.employmentType || 'Not specified'} />
                  <InfoField icon={Globe} label="OFW Status" value={profileData.isOFW ? `Yes - ${profileData.owfCountry || 'N/A'}` : 'No'} />
                  <InfoField icon={Globe} label="Former OFW" value={profileData.isFormerOFW ? `Yes - ${profileData.formerOFWCountry || 'N/A'}` : 'No'} />
                  <InfoField icon={CheckCircle2} label="4Ps Beneficiary" value={profileData.is4PSBeneficiary ? `Yes - ID: ${profileData.householdID || 'N/A'}` : 'No'} />
                  <InfoField icon={Calendar} label="Months Unemployed" value={profileData.monthsUnemployed?.toString() || 'N/A'} />
                  {profileData.unemployedReason && (
                    <InfoField icon={Briefcase} label="Unemployment Reason" value={profileData.unemployedReason} />
                  )}
                  {profileData.selfEmployedCategory && (
                    <InfoField icon={Briefcase} label="Self-employed Category" value={profileData.selfEmployedCategory} />
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 p-6 dark:from-emerald-500/5 dark:to-teal-500/5">
                    <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Primary Employment Status</h3>
                    <div>
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employment Status *</Label>
                      <select
                        value={formData.employmentStatus || ''}
                        onChange={(e) => handleEmploymentStatusChange(e.target.value as Applicant['employmentStatus'])}
                        className="mt-1.5 w-full px-4 py-2.5 border border-slate-200 bg-white/50 rounded-lg shadow-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5"
                      >
                        <option value="">Select employment status</option>
                        {nsrpEmploymentStatusOptions.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {formData.employmentStatus === 'Employed' && (
                    <div className="rounded-2xl border-2 border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-6 shadow-sm dark:border-blue-500/20 dark:from-blue-500/10 dark:to-indigo-500/5">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="rounded-lg bg-blue-500/10 p-1.5">
                          <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300">Employment Details</h3>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employment Type</Label>
                          <select
                            value={formData.employmentStatusDetail || ''}
                            onChange={(e) => handleEmploymentStatusDetailChange(e.target.value as Applicant['employmentStatusDetail'])}
                            className="mt-1.5 w-full px-4 py-2.5 border border-blue-200 bg-white/70 rounded-lg shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-blue-500/30 dark:bg-white/10"
                          >
                            <option value="">Select employment type</option>
                            {nsrpEmployedBranches.map((branch) => (
                              <option key={branch} value={branch}>{branch}</option>
                            ))}
                          </select>
                        </div>

                        {formData.employmentStatusDetail === 'Self-employed' && (
                          <div className="rounded-xl border-2 border-indigo-200/50 bg-gradient-to-br from-indigo-50 to-purple-50/40 p-5 shadow-sm dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-purple-500/5">
                            <div className="mb-3 flex items-center gap-2">
                              <div className="rounded-lg bg-indigo-500/10 p-1.5">
                                <Briefcase className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">Self-Employment Details</h4>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Self-employed Category</Label>
                                <select
                                  value={formData.selfEmployedCategory || ''}
                                  onChange={(e) => handleSelfEmployedCategoryChange(e.target.value as Applicant['selfEmployedCategory'])}
                                  className="mt-1.5 w-full px-4 py-2.5 border border-indigo-200 bg-white/70 rounded-lg shadow-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-indigo-500/30 dark:bg-white/10"
                                >
                                  <option value="">Select self-employed category</option>
                                  {nsrpSelfEmploymentCategories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                  ))}
                                </select>
                              </div>
                              {formData.selfEmployedCategory === 'Others' && (
                                <div>
                                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Specify Self-employed Category</Label>
                                  <Input
                                    value={formData.selfEmployedCategoryOther || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      handleInputChange('selfEmployedCategoryOther', val);
                                      if (formData.employmentStatusDetail === 'Self-employed') {
                                        handleInputChange('employmentType', val || 'Others');
                                      }
                                    }}
                                    placeholder="Please specify your self-employment category"
                                    className="mt-1.5 border-indigo-200 bg-white/70 shadow-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-indigo-500/30 dark:bg-white/10"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.employmentStatus === 'Unemployed' && (
                    <div className="rounded-2xl border-2 border-rose-200/50 bg-gradient-to-br from-rose-50 to-pink-50/40 p-6 shadow-sm dark:border-rose-500/20 dark:from-rose-500/10 dark:to-pink-500/5">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="rounded-lg bg-rose-500/10 p-1.5">
                          <Briefcase className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-900 dark:text-rose-300">Unemployment Details</h3>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reason for Unemployment</Label>
                          <select
                            value={formData.unemployedReason || ''}
                            onChange={(e) => handleUnemployedReasonChange(e.target.value as Applicant['unemployedReason'])}
                            className="mt-1.5 w-full px-4 py-2.5 border border-rose-200 bg-white/70 rounded-lg shadow-sm transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-500/30 dark:bg-white/10"
                          >
                            <option value="">Select reason for unemployment</option>
                            {nsrpUnemployedReasons.map((reason) => (
                              <option key={reason} value={reason}>{reason}</option>
                            ))}
                          </select>
                        </div>
                        {formData.unemployedReason === 'Others' && (
                          <div>
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Specify Unemployment Reason</Label>
                            <Input
                              value={formData.unemployedReasonOther || ''}
                              onChange={(e) => handleInputChange('unemployedReasonOther', e.target.value)}
                              placeholder="Please specify the reason"
                              className="mt-1.5 border-rose-200 bg-white/70 shadow-sm transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-500/30 dark:bg-white/10"
                            />
                          </div>
                        )}
                        {formData.unemployedReason === 'Terminated/Laid off (abroad)' && (
                          <div>
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Country of Previous Employment</Label>
                            <Input
                              value={formData.unemployedAbroadCountry || ''}
                              onChange={(e) => handleInputChange('unemployedAbroadCountry', e.target.value)}
                              placeholder="Enter country name"
                              className="mt-1.5 border-rose-200 bg-white/70 shadow-sm transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-500/30 dark:bg-white/10"
                            />
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">How many months looking for work?</Label>
                          <Input
                            type="number"
                            value={formData.monthsUnemployed ?? ''}
                            onChange={(e) =>
                              handleInputChange(
                                'monthsUnemployed',
                                e.target.value ? parseInt(e.target.value) : undefined,
                              )
                            }
                            placeholder="e.g., 3"
                            className="mt-1.5 border-rose-200 bg-white/70 shadow-sm transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-500/30 dark:bg-white/10"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl bg-gradient-to-br from-violet-50/50 to-purple-50/30 p-6 dark:from-violet-500/5 dark:to-purple-500/5\">
                    <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300\">Additional Employment Information</h3>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="isOFW"
                            checked={formData.isOFW || false}
                            onChange={(e) => handleInputChange('isOFW', e.target.checked)}
                            className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                          <Label htmlFor="isOFW" className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">Are you an OFW (Overseas Filipino Worker)?</Label>
                        </div>

                        {formData.isOFW && (
                          <div className="ml-8 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/5">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Country of Work</Label>
                            <Input
                              value={formData.owfCountry || ''}
                              onChange={(e) => handleInputChange('owfCountry', e.target.value)}
                              placeholder="Enter country where you work"
                              className="mt-1.5 border-emerald-200 bg-white/70 shadow-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="isFormerOFW"
                            checked={formData.isFormerOFW || false}
                            onChange={(e) => handleInputChange('isFormerOFW', e.target.checked)}
                            className="w-5 h-5 text-teal-600 border-slate-300 rounded focus:ring-2 focus:ring-teal-500 transition-all"
                          />
                          <Label htmlFor="isFormerOFW" className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">Are you a former OFW?</Label>
                        </div>

                        {formData.isFormerOFW && (
                          <div className="ml-8 space-y-4 rounded-lg border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-500/30 dark:bg-teal-500/5">
                            <div>
                              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Latest Country of Deployment</Label>
                              <Input
                                value={formData.formerOFWCountry || ''}
                                onChange={(e) => handleInputChange('formerOFWCountry', e.target.value)}
                                placeholder="Enter country of previous deployment"
                                className="mt-1.5 border-teal-200 bg-white/70 shadow-sm transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Return to Philippines</Label>
                              <Input
                                type="date"
                                value={formData.returnToPHDate || ''}
                                onChange={(e) => handleInputChange('returnToPHDate', e.target.value)}
                                className="mt-1.5 border-teal-200 bg-white/70 shadow-sm transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="is4PSBeneficiary"
                            checked={formData.is4PSBeneficiary || false}
                            onChange={(e) => handleInputChange('is4PSBeneficiary', e.target.checked)}
                            className="w-5 h-5 text-amber-600 border-slate-300 rounded focus:ring-2 focus:ring-amber-500 transition-all"
                          />
                          <Label htmlFor="is4PSBeneficiary" className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">Are you a 4Ps (Pantawid Pamilya) beneficiary?</Label>
                        </div>

                        {formData.is4PSBeneficiary && (
                          <div className="ml-8 rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-500/30 dark:bg-amber-500/5">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Household ID Number</Label>
                            <Input
                              value={formData.householdID || ''}
                              onChange={(e) => handleInputChange('householdID', e.target.value)}
                              placeholder="Enter your 4Ps Household ID"
                              className="mt-1.5 border-amber-200 bg-white/70 shadow-sm transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="industry">
          <Card className={sectionCardClass}>
            <CardHeader className={sectionHeaderClass}>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                IV. EDUCATIONAL BACKGROUND
              </CardTitle>
              <CardDescription>Your educational attainment and qualifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                {!isEditing ? (
                  <div className="space-y-4">
                    {profileData.education && profileData.education.length > 0 ? (
                      profileData.education.map((edu: any, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-slate-200/70 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-slate-950/30"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField label="Level" value={edu.level} />
                            <InfoField label="Course/Program" value={edu.course || 'N/A'} />
                            <InfoField label="School Name" value={edu.schoolName || 'N/A'} />
                            <InfoField label="Year Graduated" value={edu.yearGraduated || 'N/A'} />
                            {edu.strand && <InfoField label="Strand (SHS)" value={edu.strand} />}
                            {edu.levelReached && <InfoField label="Level Reached" value={edu.levelReached} />}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500">No education records added yet</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.education && formData.education.length > 0 ? (
                      formData.education.map((edu: any, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-slate-200/70 bg-slate-50/50 p-4 space-y-3 dark:border-white/10 dark:bg-slate-950/30"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Education #{idx + 1}</h4>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const newEducation = [...(formData.education || [])];
                                newEducation.splice(idx, 1);
                                handleInputChange('education', newEducation);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>Educational Level *</Label>
                              <select
                                value={edu.level || ''}
                                onChange={(e) => {
                                  const newEducation = [...(formData.education || [])];
                                  newEducation[idx].level = e.target.value;
                                  handleInputChange('education', newEducation);
                                }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                              >
                                <option value="">Select level</option>
                                {educationLevels.map((level) => (
                                  <option key={level} value={level}>{level}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label>Course/Program</Label>
                              <Input
                                value={edu.course || ''}
                                onChange={(e) => {
                                  const newEducation = [...(formData.education || [])];
                                  newEducation[idx].course = e.target.value;
                                  handleInputChange('education', newEducation);
                                }}
                                placeholder="Enter course or program"
                              />
                            </div>
                            <div>
                              <Label>School Name</Label>
                              <Input
                                value={edu.schoolName || ''}
                                onChange={(e) => {
                                  const newEducation = [...(formData.education || [])];
                                  newEducation[idx].schoolName = e.target.value;
                                  handleInputChange('education', newEducation);
                                }}
                                placeholder="Enter school name"
                              />
                            </div>
                            <div>
                              <Label>Year Graduated</Label>
                              <Input
                                value={edu.yearGraduated || ''}
                                onChange={(e) => {
                                  const newEducation = [...(formData.education || [])];
                                  newEducation[idx].yearGraduated = e.target.value;
                                  handleInputChange('education', newEducation);
                                }}
                                placeholder="e.g., 2020"
                              />
                            </div>
                            {edu.level === 'Senior High School' && (
                              <div>
                                <Label>Strand</Label>
                                <Input
                                  value={edu.strand || ''}
                                  onChange={(e) => {
                                    const newEducation = [...(formData.education || [])];
                                    newEducation[idx].strand = e.target.value;
                                    handleInputChange('education', newEducation);
                                  }}
                                  placeholder="e.g., STEM, ABM, HUMSS"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500">No education records added yet</p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addArrayItem('education', {
                        level: '',
                        course: '',
                        schoolName: '',
                        yearGraduated: '',
                        strand: '',
                        levelReached: '',
                      })}
                      className="mt-4"
                    >
                      Add Education
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">V. TECHNICAL/VOCATIONAL TRAINING</h3>
                {!isEditing ? (
                  profileData.technicalTraining && profileData.technicalTraining.length > 0 ? (
                    <div className="space-y-4">
                      {profileData.technicalTraining.map((training, idx) => (
                        <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField label="Course" value={training.course} />
                            <InfoField label="Hours of Training" value={training.hoursOfTraining?.toString() || 'N/A'} />
                            <InfoField label="Institution" value={training.trainingInstitution || 'N/A'} />
                            <InfoField label="Skills Acquired" value={training.skillsAcquired || 'N/A'} />
                            <InfoField label="Certificates" value={training.certificatesReceived || 'N/A'} className="md:col-span-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">No technical training specified</p>
                  )
                ) : (
                  <div className="space-y-3">
                    {(formData.technicalTraining || []).map((t: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Course</Label>
                            <Input value={t.course || ''} onChange={(e) => updateArrayField('technicalTraining', idx, 'course', e.target.value)} />
                          </div>
                          <div>
                            <Label>Hours of Training</Label>
                            <Input type="number" value={t.hoursOfTraining ?? ''} onChange={(e) => updateArrayField('technicalTraining', idx, 'hoursOfTraining', e.target.value ? parseInt(e.target.value) : null)} />
                          </div>
                          <div>
                            <Label>Institution</Label>
                            <Input value={t.trainingInstitution || ''} onChange={(e) => updateArrayField('technicalTraining', idx, 'trainingInstitution', e.target.value)} />
                          </div>
                          <div>
                            <Label>Skills Acquired</Label>
                            <Input value={t.skillsAcquired || ''} onChange={(e) => updateArrayField('technicalTraining', idx, 'skillsAcquired', e.target.value)} />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Certificates</Label>
                            <Input value={t.certificatesReceived || ''} onChange={(e) => updateArrayField('technicalTraining', idx, 'certificatesReceived', e.target.value)} />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button variant="outline" onClick={() => removeArrayItem('technicalTraining', idx)}>Remove</Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="secondary" onClick={() => addArrayItem('technicalTraining', { course: '', hoursOfTraining: null })}>Add Training</Button>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">VI. PROFESSIONAL LICENSES AND CERTIFICATIONS</h3>
                {!isEditing ? (
                  profileData.professionalLicenses && profileData.professionalLicenses.length > 0 ? (
                    <div className="space-y-4">
                      {profileData.professionalLicenses.map((license, idx) => (
                        <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <InfoField label="Eligibility/License" value={license.eligibility} />
                            <InfoField label="Date Taken" value={license.dateTaken || 'N/A'} />
                            <InfoField label="License Number" value={license.licenseNumber || 'N/A'} />
                            <InfoField label="Valid Until" value={license.validUntil || 'N/A'} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">No professional licenses specified</p>
                  )
                ) : (
                  <div className="space-y-3">
                    {(formData.professionalLicenses || []).map((lic: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <Label>Eligibility/License</Label>
                            <Input value={lic.eligibility || ''} onChange={(e) => updateArrayField('professionalLicenses', idx, 'eligibility', e.target.value)} />
                          </div>
                          <div>
                            <Label>Date Taken</Label>
                            <Input type="date" value={lic.dateTaken || ''} onChange={(e) => updateArrayField('professionalLicenses', idx, 'dateTaken', e.target.value)} />
                          </div>
                          <div>
                            <Label>License Number</Label>
                            <Input value={lic.licenseNumber || ''} onChange={(e) => updateArrayField('professionalLicenses', idx, 'licenseNumber', e.target.value)} />
                          </div>
                          <div>
                            <Label>Valid Until</Label>
                            <Input type="date" value={lic.validUntil || ''} onChange={(e) => updateArrayField('professionalLicenses', idx, 'validUntil', e.target.value)} />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button variant="outline" onClick={() => removeArrayItem('professionalLicenses', idx)}>Remove</Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="secondary" onClick={() => addArrayItem('professionalLicenses', { eligibility: '' })}>Add License</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Experience Tab */}
        <TabsContent value="industry">
          <Card className={sectionCardClass}>
            <CardHeader className={sectionHeaderClass}>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                VII. WORK EXPERIENCE
              </CardTitle>
              <CardDescription>Your employment history (last 10 years)</CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                profileData.workExperience && profileData.workExperience.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.workExperience.map((work, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-200/70 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-slate-950/30"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <InfoField label="Company" value={work.companyName} />
                          <InfoField label="Position" value={work.position} />
                          <InfoField label="Duration" value={`${work.numberOfMonths || 0} months`} />
                          <InfoField label="Address" value={work.address || 'N/A'} />
                          <InfoField label="Employment Status" value={work.status || 'N/A'} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No work experience specified</p>
                )
              ) : (
                <div className="space-y-3">
                  {(formData.workExperience || []).map((w: any, idx: number) => (
                    <div key={idx} className="rounded-lg border border-slate-200/70 p-4 dark:border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <Label>Company</Label>
                          <Input value={w.companyName || ''} onChange={(e) => updateArrayField('workExperience', idx, 'companyName', e.target.value)} />
                        </div>
                        <div>
                          <Label>Position</Label>
                          <Input value={w.position || ''} onChange={(e) => updateArrayField('workExperience', idx, 'position', e.target.value)} />
                        </div>
                        <div>
                          <Label>Months</Label>
                          <Input type="number" value={w.numberOfMonths ?? ''} onChange={(e) => updateArrayField('workExperience', idx, 'numberOfMonths', e.target.value ? parseInt(e.target.value) : null)} />
                        </div>
                        <div>
                          <Label>Address</Label>
                          <Input value={w.address || ''} onChange={(e) => updateArrayField('workExperience', idx, 'address', e.target.value)} />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <select
                            value={w.status || ''}
                            onChange={(e) => updateArrayField('workExperience', idx, 'status', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          >
                            <option value="">Select status</option>
                            {workExperienceStatusOptions.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                            {w.status && !workExperienceStatusOptions.includes(w.status as any) && (
                              <option value={w.status}>{`Keep current: ${w.status}`}</option>
                            )}
                          </select>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button variant="outline" onClick={() => removeArrayItem('workExperience', idx)}>Remove</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={() => addArrayItem('workExperience', { companyName: '', position: '' })}>Add Experience</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="industry">
          <Card className={sectionCardClass}>
            <CardHeader className={sectionHeaderClass}>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                VIII. OTHER SKILLS ACQUIRED WITHOUT CERTIFICATE
              </CardTitle>
              <CardDescription>Skills you've acquired through experience or training</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEditing ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Other Skills Acquired</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.otherSkills && profileData.otherSkills.length > 0 ? (
                      profileData.otherSkills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm">{skill}</Badge>
                      ))
                    ) : (
                      <p className="text-slate-500">No skills specified</p>
                    )}
                  </div>
                  {profileData.otherSkillsSpecify && (
                    <p className="mt-3 text-sm text-slate-600">
                      <strong>Additional:</strong> {profileData.otherSkillsSpecify}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Other Skills</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {otherSkillsOptions.map((skill) => {
                      const checked = (formData.otherSkills || []).includes(skill);
                      return (
                        <label key={skill} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleOtherSkillToggle(skill)}
                          />
                          {skill}
                        </label>
                      );
                    })}
                  </div>
                  {(formData.otherSkills || []).includes('Others') && (
                    <div>
                      <Label>Please specify other skills</Label>
                      <div className="mt-2">
                        <SkillSpecializationInput
                          value={String(formData.otherSkillsSpecify ?? "")}
                          onChange={(next) => handleInputChange('otherSkillsSpecify', next)}
                          placeholder="Type a skill and press Enter"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {!isEditing ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Languages className="w-5 h-5" />
                    Language/Dialect Proficiency
                  </h3>
                  {profileData.languageProficiency && profileData.languageProficiency.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.languageProficiency.map((lang, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-slate-200/70 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-slate-950/30"
                        >
                          <h4 className="font-semibold mb-2">{lang.language}</h4>
                          <div className="flex flex-wrap gap-2">
                            {lang.read && <Badge variant="outline">Read</Badge>}
                            {lang.write && <Badge variant="outline">Write</Badge>}
                            {lang.speak && <Badge variant="outline">Speak</Badge>}
                            {lang.understand && <Badge variant="outline">Understand</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">No language proficiency specified</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {(formData.languageProficiency || []).map((lang: any, idx: number) => (
                    <div key={idx} className="rounded-lg border border-slate-200/70 p-4 dark:border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                          <Label>Language</Label>
                          <Input value={lang.language || ''} onChange={(e) => updateArrayField('languageProficiency', idx, 'language', e.target.value)} />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!lang.read} onChange={(e) => updateArrayField('languageProficiency', idx, 'read', e.target.checked)} /> Read
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!lang.write} onChange={(e) => updateArrayField('languageProficiency', idx, 'write', e.target.checked)} /> Write
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!lang.speak} onChange={(e) => updateArrayField('languageProficiency', idx, 'speak', e.target.checked)} /> Speak
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!lang.understand} onChange={(e) => updateArrayField('languageProficiency', idx, 'understand', e.target.checked)} /> Understand
                          </label>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button variant="outline" onClick={() => removeArrayItem('languageProficiency', idx)}>Remove</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={() => addArrayItem('languageProficiency', { language: '', read: false, write: false, speak: false, understand: false })}>Add Language</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="documents">
          <Card className={sectionCardClass}>
            <CardHeader className={sectionHeaderClass}>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents
              </CardTitle>
              <CardDescription>Your identifiers, preferences, and NSRP registration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField icon={Briefcase} label="Preferred Employment Type" value={profileData.employmentType4 || 'Not specified'} />
                    <InfoField icon={FileText} label="Account Role" value={user?.role || 'jobseeker'} />
                    <InfoField icon={Calendar} label="Profile Created" value={profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'} />
                    <InfoField icon={Calendar} label="Last Updated" value={profileData.updatedAt ? new Date(profileData.updatedAt).toLocaleDateString() : 'N/A'} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField icon={Briefcase} label="Job Preference" value={profileData.jobPreference || 'Not specified'} />
                    <InfoField icon={Briefcase} label="Government ID Type" value={profileData.governmentIdType || 'Not specified'} />
                    <InfoField icon={Briefcase} label="Government ID Number" value={profileData.governmentIdNumber || 'Not specified'} />
                    <InfoField icon={Briefcase} label="NSRP Number" value={profileData.nsrpNumber || 'Not specified'} />
                    <InfoField icon={Briefcase} label="Willing to Relocate" value={profileData.willingToRelocate ? 'Yes' : 'No'} />
                    <InfoField icon={Briefcase} label="Willing to Work Overseas" value={profileData.willingToWorkOverseas ? 'Yes' : 'No'} />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Profile Completeness</h3>
                    <ProfileCompleteness data={profileData} />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Preferred Employment Type</Label>
                      <select
                        value={formData.employmentType4 || ''}
                        onChange={(e) => handleInputChange('employmentType4', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="">Select type</option>
                        {nsrpEmploymentTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Job Preference</Label>
                      <select
                        value={formData.jobPreference || ''}
                        onChange={(e) => handleInputChange('jobPreference', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="">Select preference</option>
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contractual">Contractual</option>
                        <option value="Seasonal">Seasonal</option>
                        <option value="Internship">Internship</option>
                        <option value="Flexible">Flexible</option>
                        <option value="Project-Based">Project-Based</option>
                      </select>
                    </div>
                    <div>
                      <Label>Government ID Type</Label>
                      <Input
                        value={formData.governmentIdType || ''}
                        onChange={(e) => handleInputChange('governmentIdType', e.target.value)}
                        placeholder="e.g., PhilHealth, SSS"
                      />
                    </div>
                    <div>
                      <Label>Government ID Number</Label>
                      <Input
                        value={formData.governmentIdNumber || ''}
                        onChange={(e) => handleInputChange('governmentIdNumber', e.target.value)}
                        placeholder="ID Number"
                      />
                    </div>
                    <div>
                      <Label>NSRP Number</Label>
                      <Input
                        value={formData.nsrpNumber || ''}
                        onChange={(e) => handleInputChange('nsrpNumber', e.target.value)}
                        placeholder="NSRP Number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!formData.willingToRelocate}
                        onChange={(e) => handleInputChange('willingToRelocate', e.target.checked)}
                      />
                      Willing to relocate
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!formData.willingToWorkOverseas}
                        onChange={(e) => handleInputChange('willingToWorkOverseas', e.target.checked)}
                      />
                      Willing to work overseas
                    </label>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Profile Completeness</h3>
                    <ProfileCompleteness data={{ ...profileData, ...formData } as Applicant} />
                  </div>
                </div>
              )}

              <Separator />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">NSRP Registration Information</h4>
                <p className="text-sm text-blue-800">
                  This profile follows the official <strong>National Service and Referral Program (NSRP)</strong> registration form format.
                  Keep your information up-to-date to increase your chances of job placement.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
          </div>
        </section>
      </div>
    </div>
  );
}

// Helper component for displaying info fields
function InfoField({ icon: Icon, label, value, className = '' }: { icon?: any; label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </label>
      <p className="text-slate-900 mt-1">{value}</p>
    </div>
  );
}

// Profile completeness calculator
function ProfileCompleteness({ data }: { data: Applicant }) {
  const fields = [
    { name: 'Personal Info', filled: !!(data.surname && data.firstName && data.dateOfBirth) },
    { name: 'Contact Info', filled: !!(data.contactNumber || data.email) },
    { name: 'Address', filled: !!(data.houseStreetVillage && data.barangay) },
    { name: 'Education', filled: !!(data.education && data.education.length > 0) },
    { name: 'Work Experience', filled: !!(data.workExperience && data.workExperience.length > 0) },
    { name: 'Skills', filled: !!(data.otherSkills && data.otherSkills.length > 0) },
    { name: 'Job Preferences', filled: !!(data.preferredOccupations && data.preferredOccupations.length > 0) },
  ];

  const filledCount = fields.filter(f => f.filled).length;
  const percentage = Math.round((filledCount / fields.length) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Profile Completion</span>
        <span className="text-sm font-bold text-purple-600">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-purple-600 to-blue-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
        {fields.map((field, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            {field.filled ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
            )}
            <span className={field.filled ? 'text-slate-900' : 'text-slate-500'}>{field.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple tag editor for string arrays
function TagEditor({ values, onChange, placeholder }: { values: string[]; onChange: (vals: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const v = input.trim();
    if (!v) return;
    const next = [...values, v];
    onChange(next);
    setInput('');
  };

  const removeTag = (idx: number) => {
    const next = values.filter((_, i) => i !== idx);
    onChange(next);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder || 'Add item and press Enter'} />
        <Button type="button" onClick={addTag} variant="secondary">Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v, idx) => (
          <span key={idx} className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-100 text-slate-800 text-sm">
            {v}
            <button type="button" className="text-slate-500 hover:text-slate-700" onClick={() => removeTag(idx)}>??</button>
          </span>
        ))}
        {values.length === 0 && <p className="text-slate-500">No items</p>}
      </div>
    </div>
  );
}


