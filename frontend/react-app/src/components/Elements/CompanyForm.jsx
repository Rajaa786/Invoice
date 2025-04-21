import React, { useState } from "react";
import { Mail, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const stateCityMapping = {
  "andhra pradesh": ["Visakhapatnam", "Vijayawada", "Guntur"],
  "arunachal pradesh": ["Itanagar", "Tawang", "Ziro"],
  assam: ["Guwahati", "Silchar", "Dibrugarh"],
  bihar: ["Patna", "Gaya", "Bhagalpur"],
  chhattisgarh: ["Raipur", "Bhilai", "Bilaspur"],
  goa: ["Panaji", "Margao", "Vasco da Gama"],
  gujarat: ["Ahmedabad", "Surat", "Vadodara"],
  haryana: ["Gurgaon", "Faridabad", "Panipat"],
  "himachal pradesh": ["Shimla", "Manali", "Dharamshala"],
  jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad"],
  karnataka: ["Bengaluru", "Mysuru", "Hubli"],
  kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode"],
  "madhya pradesh": ["Bhopal", "Indore", "Gwalior"],
  maharashtra: ["Mumbai", "Pune", "Nagpur"],
  manipur: ["Imphal", "Thoubal", "Churachandpur"],
  meghalaya: ["Shillong", "Tura", "Jowai"],
  mizoram: ["Aizawl", "Lunglei", "Champhai"],
  nagaland: ["Kohima", "Dimapur", "Mokokchung"],
  odisha: ["Bhubaneswar", "Cuttack", "Rourkela"],
  punjab: ["Ludhiana", "Amritsar", "Jalandhar"],
  rajasthan: ["Jaipur", "Udaipur", "Jodhpur"],
  sikkim: ["Gangtok", "Namchi", "Gyalshing"],
  "tamil nadu": ["Chennai", "Coimbatore", "Madurai"],
  telangana: ["Hyderabad", "Warangal", "Nizamabad"],
  tripura: ["Agartala", "Dharmanagar", "Udaipur"],
  "uttar pradesh": ["Lucknow", "Kanpur", "Varanasi"],
  uttarakhand: ["Dehradun", "Haridwar", "Nainital"],
  "west bengal": ["Kolkata", "Asansol", "Siliguri"],
  delhi: ["New Delhi", "Dwarka", "Karol Bagh"],
  "jammu and kashmir": ["Srinagar", "Jammu", "Leh"],
  ladakh: ["Leh", "Kargil"],
  puducherry: ["Puducherry", "Karaikal", "Yanam"],
  chandigarh: ["Chandigarh"],
  "andaman and nicobar islands": ["Port Blair"],
  "dadra and nagar haveli and daman and diu": ["Daman", "Diu", "Silvassa"],
  lakshadweep: ["Kavaratti"],
};

const indianStates = Object.keys(stateCityMapping);

const CompanyForm = ({ open, onOpenChange, onSave }) => {
  const [formData, setFormData] = useState({
    companyType: "manufacturer",
    companyName: "",
    currency: "inr",
    gstApplicable: false,
    gstin: "",
    stateCode: "",
    country: "",
    addressLine1: "",
    addressLine2: "",
    state: "",
    city: "",
    email: "",
    contactNo: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "state" && { city: "" }), // reset city if state changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form data:", formData);

    const result = await window.electron.addCompany(formData);
    if (result.success) {
      console.log("Company saved:", result.result);
      if (onSave) onSave(result.result);
      onOpenChange(false);
    } else {
      console.error("Failed to save item:", result.error);
    }
  };

  const availableCities = stateCityMapping[formData.state] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center space-x-4">
            <Label className="text-sm font-medium">Company Type</Label>

            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="companyType"
                  value="manufacturer"
                  checked={formData.companyType === "manufacturer"}
                  onChange={() => handleInputChange("companyType", "manufacturer")}
                />
                <span>Manufacturer</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="companyType"
                  value="trader"
                  checked={formData.companyType === "trader"}
                  onChange={() => handleInputChange("companyType", "trader")}
                />
                <span>Trader</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="companyType"
                  value="services"
                  checked={formData.companyType === "services"}
                  onChange={() => handleInputChange("companyType", "services")}
                />
                <span>Services</span>
              </label>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex flex-col space-y-1 w-1/2">
              <Label className="text-sm font-medium">Company Name</Label>
              <Input
                placeholder="Company Name"
                value={formData.companyName}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
              />
            </div>

            <div className="flex flex-col space-y-1 w-1/2">
              <Label className="text-sm font-medium">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inr">INR - Indian Rupee</SelectItem>
                  <SelectItem value="usd">USD - US Dollar</SelectItem>
                  <SelectItem value="eur">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Label className="text-sm font-medium">Is GST Applicable?</Label>
            <input
              type="radio"
              name="gstApplicable"
              value="yes"
              checked={formData.gstApplicable === true}
              onChange={() => handleInputChange("gstApplicable", true)}
            />{" "}
            Yes
            <input
              type="radio"
              name="gstApplicable"
              value="no"
              checked={formData.gstApplicable === false}
              onChange={() => handleInputChange("gstApplicable", false)}
            />{" "}
            No
          </div>

          {formData.gstApplicable && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium">GSTIN/UIN</Label>
                <Input 
                  placeholder="GST Number" 
                  value={formData.gstin}
                  onChange={(e) => handleInputChange("gstin", e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium">State Code</Label>
                <Input 
                  placeholder="State Code" 
                  value={formData.stateCode}
                  onChange={(e) => handleInputChange("stateCode", e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <div className="flex flex-col space-y-1">
              <Label className="text-sm font-medium">Country/Region</Label>
              <Select 
                value={formData.country}
                onValueChange={(value) => handleInputChange("country", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-4">
              <div className="flex flex-col space-y-1 w-1/2">
                <Label className="text-sm font-medium">Address Line 1</Label>
                <Textarea
                  placeholder="Street Address, Building Name"
                  rows={2}
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-1 w-1/2">
                <Label className="text-sm font-medium">Address Line 2</Label>
                <Textarea 
                  placeholder="Locality, Area" 
                  rows={2}
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium">State</Label>
                <Select 
                  value={formData.state}
                  onValueChange={(value) => handleInputChange("state", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state
                          .split(" ")
                          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium">City</Label>
                <Select 
                  value={formData.city}
                  onValueChange={(value) => handleInputChange("city", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex flex-col space-y-1 w-1/2">
                <div className="flex items-center space-x-1">
                  <Label className="text-sm font-medium">Email Address</Label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    className="pl-10 w-full"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1 w-1/2">
                <div className="flex items-center space-x-1">
                  <Label className="text-sm font-medium">Contact No.</Label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Phone className="h-4 w-4" />
                  </div>
                  <Input
                    className="pl-10 w-full"
                    placeholder="Phone"
                    value={formData.contactNo}
                    onChange={(e) => handleInputChange("contactNo", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

  export default CompanyForm;