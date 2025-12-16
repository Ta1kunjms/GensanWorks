import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DEFAULT_MUNICIPALITY, DEFAULT_PROVINCE } from "@/lib/locations";

export interface SRSFormData {
  establishmentName: string;
  tradeName: string;
  houseStreetVillage: string;
  barangay: string;
  municipality: string;
  province: string;
  geographicCode?: string;
  barangayChairperson?: string;
  barangaySecretary?: string;
  chairpersonContact?: string;
  secretaryContact?: string;
}

interface Props {
  initialData: Partial<SRSFormData>;
  onSave: (data: SRSFormData) => void;
  disabled?: boolean;
}

const emptyForm: SRSFormData = {
  establishmentName: "",
  tradeName: "",
  houseStreetVillage: "",
  barangay: "",
  municipality: DEFAULT_MUNICIPALITY,
  province: DEFAULT_PROVINCE,
  geographicCode: "",
  barangayChairperson: "",
  barangaySecretary: "",
  chairpersonContact: "",
  secretaryContact: "",
};

const applyLocationDefaults = (data: Partial<SRSFormData>): SRSFormData => {
  const merged = { ...emptyForm, ...data } as SRSFormData;
  return {
    ...merged,
    municipality: merged.municipality?.trim() ? merged.municipality : DEFAULT_MUNICIPALITY,
    province: merged.province?.trim() ? merged.province : DEFAULT_PROVINCE,
  };
};

export function SRSForm({ initialData, onSave, disabled }: Props) {
  const [form, setForm] = useState<SRSFormData>(() => applyLocationDefaults(initialData));

  useEffect(() => {
    setForm(applyLocationDefaults(initialData));
  }, [initialData]);

  const handleChange = (field: keyof SRSFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Label>Establishment Name</Label>
      <Input value={form.establishmentName} onChange={(e) => handleChange("establishmentName", e.target.value)} disabled={disabled} />
      <Label>Trade Name</Label>
      <Input value={form.tradeName} onChange={(e) => handleChange("tradeName", e.target.value)} disabled={disabled} />
      <Label>House/Street/Village</Label>
      <Input value={form.houseStreetVillage} onChange={(e) => handleChange("houseStreetVillage", e.target.value)} disabled={disabled} />
      <Label>Barangay</Label>
      <Input value={form.barangay} onChange={(e) => handleChange("barangay", e.target.value)} disabled={disabled} />
      <Label>Municipality</Label>
      <Input value={form.municipality} onChange={(e) => handleChange("municipality", e.target.value)} disabled={disabled} />
      <Label>Province</Label>
      <Input value={form.province} onChange={(e) => handleChange("province", e.target.value)} disabled={disabled} />
      <Label>Geographic Code</Label>
      <Input value={form.geographicCode || ""} onChange={(e) => handleChange("geographicCode", e.target.value)} disabled={disabled} />
      <Label>Barangay Chairperson</Label>
      <Input value={form.barangayChairperson || ""} onChange={(e) => handleChange("barangayChairperson", e.target.value)} disabled={disabled} />
      <Label>Barangay Secretary</Label>
      <Input value={form.barangaySecretary || ""} onChange={(e) => handleChange("barangaySecretary", e.target.value)} disabled={disabled} />
      <Label>Chairperson Contact</Label>
      <Input value={form.chairpersonContact || ""} onChange={(e) => handleChange("chairpersonContact", e.target.value)} disabled={disabled} />
      <Label>Secretary Contact</Label>
      <Input value={form.secretaryContact || ""} onChange={(e) => handleChange("secretaryContact", e.target.value)} disabled={disabled} />
      {!disabled && (
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Save SRS Form
        </Button>
      )}
    </form>
  );
}
