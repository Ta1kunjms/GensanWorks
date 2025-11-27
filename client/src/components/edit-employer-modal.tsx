import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditEmployerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employer: any;
  onEmployerUpdated?: () => void;
}

const INDUSTRY_TYPES = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
];

const INDUSTRY_LABELS: Record<string, string> = {
  "01": "Agriculture, Forestry and Fishing",
  "02": "Mining and Quarrying",
  "03": "Manufacturing",
  "04": "Electricity, Gas, Steam and Air Conditioning Supply",
  "05": "Water Supply; Sewerage, Waste Management",
  "06": "Construction",
  "07": "Wholesale and Retail Trade; Repair of Motor Vehicles",
  "08": "Transportation and Storage",
  "09": "Accommodation and Food Service Activities",
  "10": "Information and Communication",
  "11": "Financial and Insurance Activities",
  "12": "Real Estate Activities",
  "13": "Professional, Scientific and Technical Activities",
  "14": "Administrative and Support Service Activities",
  "15": "Public Administration and Defense",
  "16": "Activities of Private Households as Employers",
  "17": "Extraterritorial Organizations and Bodies",
  "18": "Education",
  "19": "Human Health and Social Work Activities",
  "20": "Arts, Entertainment and Recreation",
};

export function EditEmployerModal({
  open,
  onOpenChange,
  employer,
  onEmployerUpdated,
}: EditEmployerModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(employer || {});

  useEffect(() => {
    setFormData(employer || {});
  }, [employer, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleIndustryToggle = (code: string) => {
    const current = formData.industryType || [];
    if (current.includes(code)) {
      handleInputChange("industryType", current.filter((c: string) => c !== code));
    } else {
      handleInputChange("industryType", [...current, code]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.establishmentName?.trim()) {
      toast({
        title: "Validation Error",
        description: "Establishment name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/employers/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update employer");

      toast({
        title: "Success",
        description: "Employer updated successfully",
      });

      onOpenChange(false);
      onEmployerUpdated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Employer - {formData.establishmentName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 sticky top-0">
            <TabsTrigger value="info">Basic Info</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <div className="p-4 overflow-y-auto flex-1 space-y-6">
            {/* Basic Info Tab */}
            <TabsContent value="info" className="space-y-4">
              <div>
                <Label>Establishment Name *</Label>
                <Input
                  value={formData.establishmentName || ""}
                  onChange={(e) => handleInputChange("establishmentName", e.target.value)}
                  placeholder="Establishment Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contact Number</Label>
                  <Input
                    value={formData.contactNumber || ""}
                    onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                    placeholder="Contact Number"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Company TIN</Label>
                  <Input
                    value={formData.companyTIN || ""}
                    onChange={(e) => handleInputChange("companyTIN", e.target.value)}
                    placeholder="Company TIN"
                  />
                </div>
                <div>
                  <Label>Business Permit Number</Label>
                  <Input
                    value={formData.businessPermitNumber || ""}
                    onChange={(e) => handleInputChange("businessPermitNumber", e.target.value)}
                    placeholder="Business Permit Number"
                  />
                </div>
              </div>

              <div>
                <Label>BIR 2303 Number</Label>
                <Input
                  value={formData.bir2303Number || ""}
                  onChange={(e) => handleInputChange("bir2303Number", e.target.value)}
                  placeholder="BIR 2303 Number"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.srsSubscriber || false}
                  onCheckedChange={(checked) => handleInputChange("srsSubscriber", checked)}
                />
                <Label className="text-sm font-normal cursor-pointer">SRS Subscriber</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.isManpowerAgency || false}
                  onCheckedChange={(checked) => handleInputChange("isManpowerAgency", checked)}
                />
                <Label className="text-sm font-normal cursor-pointer">Is Manpower Agency</Label>
              </div>

              {formData.isManpowerAgency && (
                <div>
                  <Label>DOLE Certification Number</Label>
                  <Input
                    value={formData.doleCertificationNumber || ""}
                    onChange={(e) => handleInputChange("doleCertificationNumber", e.target.value)}
                    placeholder="DOLE Certification Number"
                  />
                </div>
              )}
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="space-y-4">
              <div>
                <Label>House/Street/Village</Label>
                <Input
                  value={formData.houseStreetVillage || ""}
                  onChange={(e) => handleInputChange("houseStreetVillage", e.target.value)}
                  placeholder="House/Street/Village"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Barangay</Label>
                  <Input
                    value={formData.barangay || ""}
                    onChange={(e) => handleInputChange("barangay", e.target.value)}
                    placeholder="Barangay"
                  />
                </div>
                <div>
                  <Label>Municipality</Label>
                  <Input
                    value={formData.municipality || ""}
                    onChange={(e) => handleInputChange("municipality", e.target.value)}
                    placeholder="Municipality"
                  />
                </div>
              </div>

              <div>
                <Label>Province</Label>
                <Input
                  value={formData.province || ""}
                  onChange={(e) => handleInputChange("province", e.target.value)}
                  placeholder="Province"
                />
              </div>
            </TabsContent>

            {/* Employment Tab */}
            <TabsContent value="employment" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Number of Paid Employees *</Label>
                  <Input
                    type="number"
                    value={formData.numberOfPaidEmployees || ""}
                    onChange={(e) => handleInputChange("numberOfPaidEmployees", parseInt(e.target.value) || 0)}
                    placeholder="Number of Paid Employees"
                  />
                </div>
                <div>
                  <Label>Number of Vacant Positions *</Label>
                  <Input
                    type="number"
                    value={formData.numberOfVacantPositions || ""}
                    onChange={(e) => handleInputChange("numberOfVacantPositions", parseInt(e.target.value) || 0)}
                    placeholder="Number of Vacant Positions"
                  />
                </div>
              </div>

              <div>
                <Label className="block mb-3">Industry Type</Label>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto border p-3 rounded">
                  {INDUSTRY_TYPES.map((code) => (
                    <div key={code} className="flex items-start space-x-2">
                      <Checkbox
                        checked={(formData.industryType || []).includes(code)}
                        onCheckedChange={() => handleIndustryToggle(code)}
                        id={`industry-${code}`}
                      />
                      <label
                        htmlFor={`industry-${code}`}
                        className="text-sm font-normal cursor-pointer leading-tight"
                      >
                        {INDUSTRY_LABELS[code] || code}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Chairperson Name</Label>
                  <Input
                    value={formData.chairpersonName || ""}
                    onChange={(e) => handleInputChange("chairpersonName", e.target.value)}
                    placeholder="Chairperson Name"
                  />
                </div>
                <div>
                  <Label>Chairperson Contact</Label>
                  <Input
                    value={formData.chairpersonContact || ""}
                    onChange={(e) => handleInputChange("chairpersonContact", e.target.value)}
                    placeholder="Chairperson Contact"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Secretary Name</Label>
                  <Input
                    value={formData.secretaryName || ""}
                    onChange={(e) => handleInputChange("secretaryName", e.target.value)}
                    placeholder="Secretary Name"
                  />
                </div>
                <div>
                  <Label>Secretary Contact</Label>
                  <Input
                    value={formData.secretaryContact || ""}
                    onChange={(e) => handleInputChange("secretaryContact", e.target.value)}
                    placeholder="Secretary Contact"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prepared By Name *</Label>
                  <Input
                    value={formData.preparedByName || ""}
                    onChange={(e) => handleInputChange("preparedByName", e.target.value)}
                    placeholder="Prepared By Name"
                  />
                </div>
                <div>
                  <Label>Prepared By Designation</Label>
                  <Input
                    value={formData.preparedByDesignation || ""}
                    onChange={(e) => handleInputChange("preparedByDesignation", e.target.value)}
                    placeholder="Designation"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prepared By Contact</Label>
                  <Input
                    value={formData.preparedByContact || ""}
                    onChange={(e) => handleInputChange("preparedByContact", e.target.value)}
                    placeholder="Contact"
                  />
                </div>
                <div>
                  <Label>Date Accomplished</Label>
                  <Input
                    type="date"
                    value={formData.dateAccomplished || ""}
                    onChange={(e) => handleInputChange("dateAccomplished", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Remarks</Label>
                <Input
                  value={formData.remarks || ""}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  placeholder="Remarks"
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
