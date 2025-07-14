import React, { useState, useEffect } from "react";
import { Mail, Phone, Building2, Globe, Calendar, Users, TrendingUp, MapPin, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useToast } from "../../hooks/use-toast";

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

const industries = [
  "Technology", "Manufacturing", "Healthcare", "Finance", "Education",
  "Retail", "Real Estate", "Transportation", "Energy", "Agriculture",
  "Construction", "Telecommunications", "Media & Entertainment", "Food & Beverage"
];

const CompanyForm = ({ open, onOpenChange, onSave }) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Basic Information
    companyType: "manufacturer",
    companyName: "",
    currency: "inr",

    // GST Information
    gstApplicable: false,
    gstin: "",
    stateCode: "",

    // Address Information
    country: "india",
    addressLine1: "",
    addressLine2: "",
    state: "",
    city: "",

    // Contact Information
    email: "",
    contactNo: "",
    website: "",

    // Business Information
    industry: "",
    establishedYear: "",
    employeeCount: "",
    companySize: "",
    businessModel: "",
    annualRevenue: "",

    // Market Information
    primaryMarket: "",
    customerSegment: "",
    valueProposition: "",

    // Operational Information
    operatingHours: "",
    timezone: "Asia/Kolkata",

    // Financial Information
    fiscalYearStart: "",
    taxId: "",

    // Files
    logo: null,
    signature: null,
    // Bank details
    bank: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      branchName: "",
      accountHolderName: "",
    },
  });

  const [imagePreviews, setImagePreviews] = useState({
    logo: null,
    signature: null,
  });

  const [activeTab, setActiveTab] = useState("basic");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "state" && { city: "" }),
    }));
  };

  const handleFileChange = (field, file) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => ({
          ...prev,
          [field]: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreviews((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    // Basic required fields
    const requiredFields = {
      companyName: "Company name",
      country: "Country",
      addressLine1: "Address line 1",
      state: "State",
      city: "City",
      email: "Email address",
      contactNo: "Contact number"
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field].trim() === "") {
        toast({
          title: "Validation Error",
          description: `Please enter ${label}`,
          variant: "destructive",
        });
        return false;
      }
    }

    // GST specific validation
    if (formData.gstApplicable) {
      if (!formData.gstin || formData.gstin.trim() === "") {
        toast({
          title: "Validation Error",
          description: "Please enter GSTIN/UIN",
          variant: "destructive",
        });
        return false;
      }
      if (!formData.stateCode || formData.stateCode.trim() === "") {
        toast({
          title: "Validation Error",
          description: "Please enter state code",
          variant: "destructive",
        });
        return false;
      }
    }

    // Email validation
    if (!validateEmail(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    // Phone validation
    if (!validatePhone(formData.contactNo)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid contact number",
        variant: "destructive",
      });
      return false;
    }

    // Bank validation: if any bank field is filled, all must be filled
    const { bank } = formData;
    const anyBankFieldFilled = Object.values(bank).some(v => v && v.trim() !== "");
    if (anyBankFieldFilled) {
      const requiredBankFields = {
        bankName: "Bank name",
        accountNumber: "Account number",
        ifscCode: "IFSC code",
        branchName: "Branch name",
        accountHolderName: "Account holder name",
      };
      for (const [field, label] of Object.entries(requiredBankFields)) {
        if (!bank[field] || bank[field].trim() === "") {
          toast({
            title: "Validation Error",
            description: `Please enter ${label} in Bank Details`,
            variant: "destructive",
          });
          return false;
        }
      }
    }

    return true;
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(String(phone));
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const dataToSend = { ...formData };

      // Convert files to base64
      if (formData.logo) {
        const logoBase64 = await fileToBase64(formData.logo);
        dataToSend.logo = logoBase64;
      }

      if (formData.signature) {
        const signatureBase64 = await fileToBase64(formData.signature);
        dataToSend.signature = signatureBase64;
      }

      // Remove bank from company payload
      delete dataToSend.bank;

      console.log("Sending form data:", {
        ...dataToSend,
        logo: dataToSend.logo ? "[LOGO DATA BASE64]" : null,
        signature: dataToSend.signature ? "[SIGNATURE DATA BASE64]" : null,
      });

      const result = await window.electron.addCompany(dataToSend);

      if (result.success) {
        // Add bank account if all fields are filled
        const { bank } = formData;
        const allBankFieldsFilled = Object.values(bank).every(v => v && v.trim() !== "");
        if (allBankFieldsFilled) {
          await window.electron.addBank({
            companyId: result.result.id,
            bankName: bank.bankName,
            accountNumber: bank.accountNumber,
            ifscCode: bank.ifscCode,
            branchName: bank.branchName,
            accountHolderName: bank.accountHolderName,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        toast({
          title: "Success",
          description: "Company created successfully",
          variant: "success",
        });

        // Reset form
        setFormData({
          companyType: "manufacturer",
          companyName: "",
          currency: "inr",
          gstApplicable: false,
          gstin: "",
          stateCode: "",
          country: "india",
          addressLine1: "",
          addressLine2: "",
          state: "",
          city: "",
          email: "",
          contactNo: "",
          website: "",
          industry: "",
          establishedYear: "",
          employeeCount: "",
          companySize: "",
          businessModel: "",
          annualRevenue: "",
          primaryMarket: "",
          customerSegment: "",
          valueProposition: "",
          operatingHours: "",
          timezone: "Asia/Kolkata",
          fiscalYearStart: "",
          taxId: "",
          logo: null,
          signature: null,
          bank: {
            bankName: "",
            accountNumber: "",
            ifscCode: "",
            branchName: "",
            accountHolderName: "",
          },
        });

        setImagePreviews({ logo: null, signature: null });
        setActiveTab("basic");

        if (onSave) onSave(result.result);
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create company",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      console.error("Error in form submission:", error);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const availableCities = stateCityMapping[formData.state] || [];

  const fillDummyData = () => {
    const randomNum = Math.floor(Math.random() * 1000);
    setFormData({
      companyType: "manufacturer",
      companyName: `Tech Solutions ${randomNum}`,
      currency: "inr",
      gstApplicable: true,
      gstin: "27AABCT1234A1Z5",
      stateCode: "27",
      country: "india",
      addressLine1: "123 Business Park",
      addressLine2: "Tech Hub Area",
      state: "maharashtra",
      city: "Mumbai",
      email: `contact${randomNum}@techsolutions.com`,
      contactNo: "9" + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0'),
      website: `www.techsolutions${randomNum}.com`,
      industry: "technology",
      establishedYear: "2020",
      employeeCount: "50",
      companySize: "startup",
      businessModel: "b2b",
      annualRevenue: "10000000",
      primaryMarket: "domestic",
      customerSegment: "enterprise",
      valueProposition: "Innovative Tech Solutions",
      operatingHours: "24/7",
      timezone: "Asia/Kolkata",
      fiscalYearStart: "04-01",
      taxId: "TECH" + randomNum,
      logo: null,
      signature: null,
      bank: {
        bankName: "Test Bank",
        accountNumber: "1234567890123456",
        ifscCode: "TEST0001234",
        branchName: "Test Branch",
        accountHolderName: "Test Account Holder",
      },
    });

    toast({
      title: "Dummy Data Filled",
      description: "Form has been filled with dummy data. You can edit it before submitting.",
      variant: "success",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-4 w-4" />
            Create New Company
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create a new company profile with business and contact information
          </DialogDescription>
          <Button
            onClick={fillDummyData}
            className="absolute right-12 top-4 bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs"
            size="sm"
          >
            Fill Test Data
          </Button>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-9">
            <TabsTrigger value="basic" className="text-xs">Basic Info</TabsTrigger>
            <TabsTrigger value="business" className="text-xs">Business</TabsTrigger>
            <TabsTrigger value="address" className="text-xs">Address</TabsTrigger>
            <TabsTrigger value="additional" className="text-xs">Additional</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Building2 className="h-3 w-3" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Company Type */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Company Type*</Label>
                    <div className="flex flex-wrap gap-4">
                      {["manufacturer", "trader", "services"].map((type) => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="companyType"
                            value={type}
                            checked={formData.companyType === type}
                            onChange={() => handleInputChange("companyType", type)}
                            className="text-blue-600"
                          />
                          <span className="capitalize text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Company Name and Currency */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Company Name*</Label>
                      <Input
                        placeholder="Enter company name"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Currency*</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => handleInputChange("currency", value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inr">INR - Indian Rupee</SelectItem>
                          <SelectItem value="usd">USD - US Dollar</SelectItem>
                          <SelectItem value="eur">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Email Address*</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-3 w-3 text-gray-400" />
                        <Input
                          className="pl-9 text-sm"
                          placeholder="company@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Contact Number*</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-3 w-3 text-gray-400" />
                        <Input
                          className="pl-9 text-sm"
                          placeholder="1234567890"
                          value={formData.contactNo}
                          onChange={(e) => handleInputChange("contactNo", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-3 w-3 text-gray-400" />
                        <Input
                          className="pl-9 text-sm"
                          placeholder="www.company.com"
                          value={formData.website}
                          onChange={(e) => handleInputChange("website", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Company Logo</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange("logo", e.target.files[0])}
                        className="text-sm"
                      />
                      {imagePreviews.logo && (
                        <div className="relative border rounded-lg p-2">
                          <img
                            src={imagePreviews.logo}
                            alt="Logo Preview"
                            className="h-16 w-16 object-contain mx-auto"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-5 w-5 p-0 text-xs"
                            onClick={() => handleFileChange("logo", null)}
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Authorized Signature</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange("signature", e.target.files[0])}
                        className="text-sm"
                      />
                      {imagePreviews.signature && (
                        <div className="relative border rounded-lg p-2">
                          <img
                            src={imagePreviews.signature}
                            alt="Signature Preview"
                            className="h-16 w-16 object-contain mx-auto"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-5 w-5 p-0 text-xs"
                            onClick={() => handleFileChange("signature", null)}
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Business Information Tab */}
            <TabsContent value="business" className="space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-3 w-3" />
                    Business Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Industry</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) => handleInputChange("industry", value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry.toLowerCase()}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Established Year</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-3 w-3 text-gray-400" />
                        <Input
                          className="pl-9 text-sm"
                          type="number"
                          placeholder="2020"
                          min="1800"
                          max={new Date().getFullYear()}
                          value={formData.establishedYear}
                          onChange={(e) => handleInputChange("establishedYear", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Company Size</Label>
                      <Select
                        value={formData.companySize}
                        onValueChange={(value) => handleInputChange("companySize", value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup (1-10)</SelectItem>
                          <SelectItem value="sme">SME (11-250)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (250+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Employee Count</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-3 w-3 text-gray-400" />
                        <Input
                          className="pl-9 text-sm"
                          type="number"
                          placeholder="50"
                          value={formData.employeeCount}
                          onChange={(e) => handleInputChange("employeeCount", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Annual Revenue (₹)</Label>
                      <Input
                        type="number"
                        placeholder="10000000"
                        value={formData.annualRevenue}
                        onChange={(e) => handleInputChange("annualRevenue", e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Business Model</Label>
                      <Select
                        value={formData.businessModel}
                        onValueChange={(value) => handleInputChange("businessModel", value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="b2b">B2B</SelectItem>
                          <SelectItem value="b2c">B2C</SelectItem>
                          <SelectItem value="b2b2c">B2B2C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Primary Market</Label>
                      <Select
                        value={formData.primaryMarket}
                        onValueChange={(value) => handleInputChange("primaryMarket", value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select market" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="domestic">Domestic</SelectItem>
                          <SelectItem value="international">International</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Customer Segment</Label>
                      <Select
                        value={formData.customerSegment}
                        onValueChange={(value) => handleInputChange("customerSegment", value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select segment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                          <SelectItem value="smb">SMB</SelectItem>
                          <SelectItem value="consumer">Consumer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Address Information Tab */}
            <TabsContent value="address" className="space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3" />
                    Address & Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* GST Information */}
                  <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                    <div className="space-y-2">
                      <Label className="font-medium text-xs">GST Registration</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gstApplicable"
                            checked={formData.gstApplicable === true}
                            onChange={() => handleInputChange("gstApplicable", true)}
                          />
                          <span className="text-sm">Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gstApplicable"
                            checked={formData.gstApplicable === false}
                            onChange={() => handleInputChange("gstApplicable", false)}
                          />
                          <span className="text-sm">No</span>
                        </label>
                      </div>
                    </div>

                    {formData.gstApplicable && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">GSTIN/UIN*</Label>
                          <Input
                            placeholder="22AAAAA0000A1Z5"
                            value={formData.gstin}
                            onChange={(e) => handleInputChange("gstin", e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">State Code*</Label>
                          <Input
                            placeholder="22"
                            value={formData.stateCode}
                            onChange={(e) => handleInputChange("stateCode", e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Country*</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => handleInputChange("country", value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="india">India</SelectItem>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Address Line 1*</Label>
                        <Textarea
                          placeholder="Street address, building name"
                          rows={2}
                          value={formData.addressLine1}
                          onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Address Line 2</Label>
                        <Textarea
                          placeholder="Locality, area"
                          rows={2}
                          value={formData.addressLine2}
                          onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">State*</Label>
                        <Select
                          value={formData.state}
                          onValueChange={(value) => handleInputChange("state", value)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {indianStates.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">City*</Label>
                        <Select
                          value={formData.city}
                          onValueChange={(value) => handleInputChange("city", value)}
                          disabled={!formData.state}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Select city" />
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Additional Information Tab */}
            <TabsContent value="additional" className="space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileText className="h-3 w-3" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Operating Hours</Label>
                      <Select
                        value={formData.operatingHours}
                        onValueChange={(value) => handleInputChange("operatingHours", value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select hours" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24/7">24/7</SelectItem>
                          <SelectItem value="business_hours">Business Hours</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Fiscal Year Start</Label>
                      <Input
                        placeholder="04-01 (MM-DD)"
                        value={formData.fiscalYearStart}
                        onChange={(e) => handleInputChange("fiscalYearStart", e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Tax ID</Label>
                      <Input
                        placeholder="Tax identification number"
                        value={formData.taxId}
                        onChange={(e) => handleInputChange("taxId", e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Value Proposition</Label>
                      <Select
                        value={formData.valueProposition}
                        onValueChange={(value) => handleInputChange("valueProposition", value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select proposition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cost_leadership">Cost Leadership</SelectItem>
                          <SelectItem value="differentiation">Differentiation</SelectItem>
                          <SelectItem value="focus">Focus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Bank Account Details Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileText className="h-3 w-3" />
                    Bank Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Bank Name*</Label>
                      <Input
                        placeholder="Enter bank name"
                        value={formData.bank.bankName}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          bank: { ...prev.bank, bankName: e.target.value }
                        }))}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Account Number*</Label>
                      <Input
                        placeholder="Enter account number"
                        value={formData.bank.accountNumber}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          bank: { ...prev.bank, accountNumber: e.target.value }
                        }))}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">IFSC Code*</Label>
                      <Input
                        placeholder="Enter IFSC code"
                        value={formData.bank.ifscCode}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          bank: { ...prev.bank, ifscCode: e.target.value }
                        }))}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Branch Name*</Label>
                      <Input
                        placeholder="Enter branch name"
                        value={formData.bank.branchName}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          bank: { ...prev.bank, branchName: e.target.value }
                        }))}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Account Holder Name*</Label>
                      <Input
                        placeholder="Enter account holder name"
                        value={formData.bank.accountHolderName}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          bank: { ...prev.bank, accountHolderName: e.target.value }
                        }))}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <DialogFooter className="flex justify-between pt-4 border-t">
              <div className="text-xs text-gray-500">
                * Required fields
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm">
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Create Company
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyForm;