import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Phone, Mail, Copy, User, Building2, CreditCard, MapPin, AlertCircle, Wand2, Building, Plus } from "lucide-react";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { cn } from "../../lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import CompanyForm from "./CompanyForm";

const CustomerForm = ({ open, onOpenChange, onSave, editCustomer = null }) => {
  const [formData, setFormData] = useState({
    // Customer info (Required fields)
    customerType: "Business", // Default value matching schema
    salutation: "Mr.", // Default value
    firstName: "",
    lastName: "",
    panNumber: "",
    companyName: "",
    currency: "INR", // Default currency
    gstApplicable: "No", // Default value matching schema (Yes/No not boolean)
    gstin: "",
    stateCode: "",
    companyId: "", // Single company association

    // Billing address (Required fields)
    billingCountry: "India", // Default country
    billingState: "",
    billingCity: "",
    billingZip: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingContactNo: "",
    billingEmail: "",
    billingAlternateContactNo: "",

    // Shipping address (Required fields)
    shippingCountry: "India", // Default country
    shippingState: "",
    shippingCity: "",
    shippingZip: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingContactNo: "",
    shippingEmail: "",
    shippingAlternateContactNo: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Add new state for company selection UI
  const [companySelectOpen, setCompanySelectOpen] = useState(false);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Fetch companies when component mounts
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const result = await window.electron.getCompany();
        if (result.success) {
          setCompanies(result.companies || []);
        } else {
          console.error("Failed to fetch companies:", result.error);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // Initialize form with edit data when editCustomer changes
  useEffect(() => {
    if (editCustomer) {
      // First set the basic customer data
      setFormData({
        customerType: editCustomer.customerType || "Business",
        salutation: editCustomer.salutation || "Mr.",
        firstName: editCustomer.firstName || "",
        lastName: editCustomer.lastName || "",
        panNumber: editCustomer.panNumber || "",
        companyName: editCustomer.companyName || "",
        currency: editCustomer.currency || "INR",
        gstApplicable: editCustomer.gstApplicable || "No",
        gstin: editCustomer.gstin || "",
        stateCode: editCustomer.stateCode || "",
        companyId: "", // Will be populated from API call
        billingCountry: editCustomer.billingCountry || "India",
        billingState: editCustomer.billingState || "",
        billingCity: editCustomer.billingCity || "",
        billingZip: editCustomer.billingZip || "",
        billingAddressLine1: editCustomer.billingAddressLine1 || "",
        billingAddressLine2: editCustomer.billingAddressLine2 || "",
        billingContactNo: editCustomer.billingContactNo || "",
        billingEmail: editCustomer.billingEmail || "",
        billingAlternateContactNo: editCustomer.billingAlternateContactNo || "",
        shippingCountry: editCustomer.shippingCountry || "India",
        shippingState: editCustomer.shippingState || "",
        shippingCity: editCustomer.shippingCity || "",
        shippingZip: editCustomer.shippingZip || "",
        shippingAddressLine1: editCustomer.shippingAddressLine1 || "",
        shippingAddressLine2: editCustomer.shippingAddressLine2 || "",
        shippingContactNo: editCustomer.shippingContactNo || "",
        shippingEmail: editCustomer.shippingEmail || "",
        shippingAlternateContactNo: editCustomer.shippingAlternateContactNo || "",
      });

      // Fetch associated company for this customer
      const fetchCustomerCompany = async () => {
        try {
          const result = await window.electron.getCustomerCompanies(editCustomer.id);
          if (result.success && result.result && result.result.length > 0) {
            // Get the first company (since we're now only allowing one company per customer)
            setFormData(prev => ({
              ...prev,
              companyId: result.result[0].id || ""
            }));
          } else {
            console.error("Failed to fetch customer company or no company associated:", result.error);
          }
        } catch (error) {
          console.error("Error fetching customer company:", error);
        }
      };

      fetchCustomerCompany();
    } else {
      // Reset form when not editing
      setFormData({
        customerType: "Business",
        salutation: "Mr.",
        firstName: "",
        lastName: "",
        panNumber: "",
        companyName: "",
        currency: "INR",
        gstApplicable: "No",
        gstin: "",
        stateCode: "",
        companyId: "", // Reset company association
        billingCountry: "India",
        billingState: "",
        billingCity: "",
        billingZip: "",
        billingAddressLine1: "",
        billingAddressLine2: "",
        billingContactNo: "",
        billingEmail: "",
        billingAlternateContactNo: "",
        shippingCountry: "India",
        shippingState: "",
        shippingCity: "",
        shippingZip: "",
        shippingAddressLine1: "",
        shippingAddressLine2: "",
        shippingContactNo: "",
        shippingEmail: "",
        shippingAlternateContactNo: "",
      });
    }
    setErrors({});
  }, [editCustomer, open]);

  const stateCityMapping = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
    "Haryana": ["Gurgaon", "Faridabad", "Panipat"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubli"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior"],
    "Maharashtra": ["Mumbai", "Mumbai Suburban", "Pune", "Nagpur", "Aurangabad", "Nashik"],
    "Manipur": ["Imphal", "Thoubal", "Churachandpur"],
    "Meghalaya": ["Shillong", "Tura", "Jowai"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar"],
    "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur"],
    "Sikkim": ["Gangtok", "Namchi", "Gyalshing"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
    "Tripura": ["Agartala", "Dharmanagar", "Udaipur"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Nainital"],
    "West Bengal": ["Kolkata", "Asansol", "Siliguri"],
    "Delhi": ["New Delhi", "Dwarka", "Karol Bagh"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Leh"],
    "Ladakh": ["Leh", "Kargil"],
    "Puducherry": ["Puducherry", "Karaikal", "Yanam"],
    "Chandigarh": ["Chandigarh"],
    "Andaman and Nicobar Islands": ["Port Blair"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
    "Lakshadweep": ["Kavaratti"],
  };

  const indianStates = Object.keys(stateCityMapping).sort();

  // Get available cities based on the selected state
  const getBillingCities = () => stateCityMapping[formData.billingState] || [];
  const getShippingCities = () => stateCityMapping[formData.shippingState] || [];

  const handleInputChange = (field, value) => {
    // For state fields, ensure proper capitalization
    if (field === "billingState" || field === "shippingState") {
      // Convert first letter of each word to uppercase
      value = value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset city when state changes
    if (field === "billingState") {
      setFormData((prev) => ({
        ...prev,
        billingCity: "",
      }));
    } else if (field === "shippingState") {
      setFormData((prev) => ({
        ...prev,
        shippingCity: "",
      }));
    }
  };

  const handleCompanySelection = (companyId) => {
    const company = companies.find(c => String(c.id) === String(companyId));
    setSelectedCompany(company);
    setFormData(prev => ({
      ...prev,
      companyId: companyId
    }));
  };

  const copyBillingToShipping = async () => {
    // First update the state without the city
    const updatedData = {
      ...formData,
      shippingCountry: formData.billingCountry,
      shippingState: formData.billingState,
      shippingZip: formData.billingZip,
      shippingAddressLine1: formData.billingAddressLine1,
      shippingAddressLine2: formData.billingAddressLine2,
      shippingContactNo: formData.billingContactNo,
      shippingEmail: formData.billingEmail,
      shippingAlternateContactNo: formData.billingAlternateContactNo,
    };

    // Set the form data without the city first
    setFormData(updatedData);

    // Use setTimeout to allow React to update the state and re-render
    // This ensures the city dropdown is no longer disabled
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        shippingCity: formData.billingCity,
      }));
    }, 0);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.currency) newErrors.currency = "Currency is required";

    // Billing address validation
    if (!formData.billingCountry) newErrors.billingCountry = "Country is required";
    if (!formData.billingState) newErrors.billingState = "State is required";
    if (!formData.billingCity) newErrors.billingCity = "City is required";
    if (!formData.billingZip.trim()) newErrors.billingZip = "ZIP code is required";
    if (!formData.billingAddressLine1.trim()) newErrors.billingAddressLine1 = "Address is required";
    if (!formData.billingContactNo.trim()) newErrors.billingContactNo = "Contact number is required";
    if (!formData.billingEmail.trim()) newErrors.billingEmail = "Email is required";

    // Shipping address validation
    if (!formData.shippingCountry) newErrors.shippingCountry = "Country is required";
    if (!formData.shippingState) newErrors.shippingState = "State is required";
    if (!formData.shippingCity) newErrors.shippingCity = "City is required";
    if (!formData.shippingZip.trim()) newErrors.shippingZip = "ZIP code is required";
    if (!formData.shippingAddressLine1.trim()) newErrors.shippingAddressLine1 = "Address is required";
    if (!formData.shippingContactNo.trim()) newErrors.shippingContactNo = "Contact number is required";
    if (!formData.shippingEmail.trim()) newErrors.shippingEmail = "Email is required";

    // GST validation
    if (formData.gstApplicable === "Yes") {
      if (!formData.gstin.trim()) newErrors.gstin = "GSTIN is required when GST is applicable";
      if (!formData.stateCode.trim()) newErrors.stateCode = "State code is required when GST is applicable";
    }

    // Company validation
    if (!formData.companyId) newErrors.companyId = "Please select a company";

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.billingEmail && !emailRegex.test(formData.billingEmail)) {
      newErrors.billingEmail = "Invalid email format";
    }
    if (formData.shippingEmail && !emailRegex.test(formData.shippingEmail)) {
      newErrors.shippingEmail = "Invalid email format";
    }

    // Phone number validation (basic)
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.billingContactNo && !phoneRegex.test(formData.billingContactNo.replace(/\D/g, ''))) {
      newErrors.billingContactNo = "Invalid phone number (10 digits required)";
    }
    if (formData.shippingContactNo && !phoneRegex.test(formData.shippingContactNo.replace(/\D/g, ''))) {
      newErrors.shippingContactNo = "Invalid phone number (10 digits required)";
    }

    // ZIP code validation (6 digits for India)
    const zipRegex = /^[0-9]{6}$/;
    if (formData.billingZip && !zipRegex.test(formData.billingZip.replace(/\D/g, ''))) {
      newErrors.billingZip = "Invalid ZIP code (6 digits required)";
    }
    if (formData.shippingZip && !zipRegex.test(formData.shippingZip.replace(/\D/g, ''))) {
      newErrors.shippingZip = "Invalid ZIP code (6 digits required)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting customer data:", formData);

      let result;
      if (editCustomer) {
        // Update existing customer
        result = await window.electron.updateCustomer({ ...formData, id: editCustomer.id });

        // Update customer-company association
        if (result.success) {
          const updateCompanyResult = await window.electron.updateCustomerCompanies(
            editCustomer.id,
            formData.companyId ? [formData.companyId] : []
          );

          if (!updateCompanyResult.success) {
            console.error("Failed to update customer-company association:", updateCompanyResult.error);
          }
        }
      } else {
        // Create new customer
        result = await window.electron.addCustomer(formData);

        // Add customer-company association for new customer
        if (result.success && formData.companyId) {
          const newCustomerId = result.result.lastInsertRowid; // Use lastInsertRowid for new customer
          const updateCompanyResult = await window.electron.updateCustomerCompanies(
            newCustomerId,
            [formData.companyId]
          );

          if (!updateCompanyResult.success) {
            console.error("Failed to add customer-company association:", updateCompanyResult.error);
          }
        }
      }

      if (result.success) {
        console.log("Customer saved:", result.result);
        if (onSave) onSave(result.result);

        // Reset form state after successful save
        if (!editCustomer) {
          setFormData({
            customerType: "Business",
            salutation: "Mr.",
            firstName: "",
            lastName: "",
            panNumber: "",
            companyName: "",
            currency: "INR",
            gstApplicable: "No",
            gstin: "",
            stateCode: "",
            companyId: "",
            billingCountry: "India",
            billingState: "",
            billingCity: "",
            billingZip: "",
            billingAddressLine1: "",
            billingAddressLine2: "",
            billingContactNo: "",
            billingEmail: "",
            billingAlternateContactNo: "",
            shippingCountry: "India",
            shippingState: "",
            shippingCity: "",
            shippingZip: "",
            shippingAddressLine1: "",
            shippingAddressLine2: "",
            shippingContactNo: "",
            shippingEmail: "",
            shippingAlternateContactNo: "",
          });
          setSelectedCompany(null);
          setErrors({});
        }
        onOpenChange(false);
      } else {
        console.error("Failed to save customer:", result.error);
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      setErrors({ submit: "Failed to save customer. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to generate dummy customer data
  const generateDummyData = () => {
    const randomNum = Math.floor(Math.random() * 1000);
    const randomState = indianStates[Math.floor(Math.random() * indianStates.length)];
    const randomCity = stateCityMapping[randomState][0];
    const isGstApplicable = Math.random() > 0.5 ? "Yes" : "No";

    // If there are companies available, select a random one
    if (companies.length > 0) {
      const randomCompany = companies[Math.floor(Math.random() * companies.length)];
      setSelectedCompany(randomCompany);
      setFormData(prev => ({
        ...prev,
        companyId: randomCompany.id
      }));
    }

    const dummyData = {
      customerType: Math.random() > 0.5 ? "Business" : "Individual",
      salutation: "Mr.",
      firstName: `John${randomNum}`,
      lastName: `Doe${randomNum}`,
      panNumber: "ABCDE1234F",
      companyName: `Tech Solutions ${randomNum}`,
      currency: "INR",
      gstApplicable: isGstApplicable,
      gstin: isGstApplicable === "Yes" ? "27AABCT1234A1Z5" : "",
      stateCode: isGstApplicable === "Yes" ? "27" : "",
      companyId: selectedCompany?.id || "", // Preserve the selected company ID

      // Billing address
      billingCountry: "India",
      billingState: randomState,
      billingCity: randomCity,
      billingZip: `${Math.floor(Math.random() * 900000) + 100000}`,
      billingAddressLine1: "123 Business Park",
      billingAddressLine2: "Tech Hub Area",
      billingContactNo: `94${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      billingEmail: `contact${randomNum}@techsolutions.com`,
      billingAlternateContactNo: `98${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,

      // Shipping address (same as billing for dummy data)
      shippingCountry: "India",
      shippingState: randomState,
      shippingCity: randomCity,
      shippingZip: `${Math.floor(Math.random() * 900000) + 100000}`,
      shippingAddressLine1: "123 Business Park",
      shippingAddressLine2: "Tech Hub Area",
      shippingContactNo: `94${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      shippingEmail: `contact${randomNum}@techsolutions.com`,
      shippingAlternateContactNo: `98${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    };

    setFormData(dummyData);
    setErrors({});
  };

  // Add company form save handler
  const handleSaveCompany = async () => {
    // Refresh companies list
    const response = await window.electron.getCompany();
    if (response.success) {
      setCompanies(response.companies || []);
    }
    setCompanyFormOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
            <DialogDescription className="sr-only">
              {editCustomer ? "Edit existing customer details" : "Add a new customer to the system"}
            </DialogDescription>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateDummyData}
              className="h-8 text-xs gap-1.5"
            >
              <Wand2 className="w-3 h-3" />
              Generate Test Data
            </Button>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Company Selection Card */}
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-medium">Company Information</h3>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Select Company</Label>
                  <div className="flex items-center gap-2">
                    {selectedCompany && selectedCompany.logo && (
                      <div className="h-9 w-9 rounded border overflow-hidden flex-shrink-0">
                        <img
                          src={selectedCompany.logo}
                          alt={`${selectedCompany.companyName} logo`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                    <Select
                      open={companySelectOpen}
                      onOpenChange={setCompanySelectOpen}
                      onValueChange={(value) => {
                        handleCompanySelection(value);
                        setCompanySelectOpen(false);
                      }}
                    >
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue
                          placeholder={
                            selectedCompany
                              ? selectedCompany.companyName
                              : "Select a company"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <Command>
                          <div className="p-2 border-b flex gap-2">
                            <CommandInput placeholder="Search companies..." className="flex-1 h-9 text-xs" />
                            <Button
                              size="sm"
                              onClick={() => setCompanyFormOpen(true)}
                              className="h-9 text-xs px-3"
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add New
                            </Button>
                          </div>
                          <CommandEmpty>
                            <div className="p-3 text-center text-muted-foreground">
                              <p className="text-xs">No companies found</p>
                              <p className="text-xs mt-1">Click "Add New" to create one</p>
                            </div>
                          </CommandEmpty>
                          <CommandGroup className="max-h-48 overflow-y-auto">
                            {companies.map((company) => (
                              <CommandItem
                                key={company.id}
                                value={String(company.id)}
                                onSelect={(value) => {
                                  handleCompanySelection(value);
                                  setCompanySelectOpen(false);
                                }}
                                className="flex items-center gap-2 p-2 text-xs"
                              >
                                {company.logo && (
                                  <div className="h-7 w-7 rounded overflow-hidden flex-shrink-0">
                                    <img
                                      src={company.logo}
                                      alt={`${company.companyName} logo`}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                )}
                                <span>{company.companyName}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.companyId && (
                    <p className="text-destructive text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.companyId}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Select the company this customer should be associated with. Customers will only be available for invoices from the selected company.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rest of the form fields */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Customer Type */}
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Label className="text-xs font-medium flex items-center gap-2 min-w-[100px]">
                      <User className="w-3 h-3 text-muted-foreground" />
                      Customer Type
                    </Label>
                    <RadioGroup
                      defaultValue={formData.customerType}
                      onValueChange={(value) => handleInputChange("customerType", value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="Business" id="business" className="h-3 w-3" />
                        <Label htmlFor="business" className="text-xs cursor-pointer">Business</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="Individual" id="individual" className="h-3 w-3" />
                        <Label htmlFor="individual" className="text-xs cursor-pointer">Individual</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Details & Business Info */}
              <Card className="shadow-sm">
                <CardContent className="p-4 space-y-6">
                  {/* Customer Details Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-primary" />
                      <h3 className="text-xs font-medium">Customer Details</h3>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Title</Label>
                          <Select
                            value={formData.salutation}
                            onValueChange={(value) => handleInputChange("salutation", value)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Title" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mr.">Mr.</SelectItem>
                              <SelectItem value="Ms.">Ms.</SelectItem>
                              <SelectItem value="Mrs.">Mrs.</SelectItem>
                              <SelectItem value="Dr.">Dr.</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="col-span-5">
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            First Name
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Input
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            className={cn(
                              "h-9 text-xs",
                              errors.firstName && "border-destructive"
                            )}
                          />
                          {errors.firstName && (
                            <p className="text-destructive text-[10px] flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {errors.firstName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="col-span-5">
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Last Name
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Input
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className={cn(
                              "h-9 text-xs",
                              errors.lastName && "border-destructive"
                            )}
                          />
                          {errors.lastName && (
                            <p className="text-destructive text-[10px] flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3 h-3 text-primary" />
                      <h3 className="text-xs font-medium">Business Information</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Company Name
                          <span className="text-destructive ml-0.5">*</span>
                        </Label>
                        <Input
                          placeholder="Enter company name"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange("companyName", e.target.value)}
                          className={cn(
                            "h-9 text-xs",
                            errors.companyName && "border-destructive"
                          )}
                        />
                        {errors.companyName && (
                          <p className="text-destructive text-[10px] flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" />
                            {errors.companyName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">PAN Number</Label>
                        <Input
                          placeholder="Enter PAN number"
                          value={formData.panNumber}
                          onChange={(e) => handleInputChange("panNumber", e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Currency
                          <span className="text-destructive ml-0.5">*</span>
                        </Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => handleInputChange("currency", value)}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Select Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inr">
                              <div className="flex items-center gap-2 text-xs">
                                <CreditCard className="w-3 h-3" />
                                <span>INR - Indian Rupee</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="usd">
                              <div className="flex items-center gap-2 text-xs">
                                <CreditCard className="w-3 h-3" />
                                <span>USD - US Dollar</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="eur">
                              <div className="flex items-center gap-2 text-xs">
                                <CreditCard className="w-3 h-3" />
                                <span>EUR - Euro</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">GST Registration</Label>
                        <div className="flex items-center justify-between h-7">
                          <div className="flex items-center gap-1">
                            <Switch
                              id="gst-switch"
                              checked={formData.gstApplicable === "Yes"}
                              onCheckedChange={(checked) =>
                                handleInputChange("gstApplicable", checked ? "Yes" : "No")
                              }
                              className="scale-[0.65] origin-left data-[state=checked]:bg-primary"
                            />
                            <Label
                              htmlFor="gst-switch"
                              className="text-xs text-muted-foreground cursor-pointer select-none -ml-0.5"
                            >
                              GST Applicable
                            </Label>
                          </div>
                          {formData.gstApplicable === "Yes" && (
                            <Badge variant="outline" className="bg-primary/5 text-[10px] h-5 shrink-0">
                              GST Registered
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {formData.gstApplicable === "Yes" && (
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            GSTIN/UIN
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Input
                            placeholder="Enter GST number"
                            value={formData.gstin}
                            onChange={(e) => handleInputChange("gstin", e.target.value)}
                            className={cn(
                              "h-9 text-xs",
                              errors.gstin && "border-destructive"
                            )}
                          />
                          {errors.gstin && (
                            <p className="text-destructive text-[10px] flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {errors.gstin}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            State Code
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Input
                            placeholder="Enter state code"
                            value={formData.stateCode}
                            onChange={(e) => handleInputChange("stateCode", e.target.value)}
                            className={cn(
                              "h-9 text-xs",
                              errors.stateCode && "border-destructive"
                            )}
                          />
                          {errors.stateCode && (
                            <p className="text-destructive text-[10px] flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {errors.stateCode}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-3 h-3 text-primary" />
                    <h3 className="text-xs font-medium">Address Information</h3>
                  </div>

                  <Tabs defaultValue="billing" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 h-9 mb-4">
                      <TabsTrigger value="billing" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Billing Address
                      </TabsTrigger>
                      <TabsTrigger value="shipping" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Shipping Address
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="billing" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Country/Region
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Select
                            value={formData.billingCountry}
                            onValueChange={(value) => handleInputChange("billingCountry", value)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="india">India</SelectItem>
                              <SelectItem value="us">United States</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            State
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Select
                            value={formData.billingState}
                            onValueChange={(value) => handleInputChange("billingState", value)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                              {indianStates.map((state) => (
                                <SelectItem key={state} value={state} className="text-xs">
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Address Line 1
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Textarea
                            placeholder="Street Address, Building Name"
                            value={formData.billingAddressLine1}
                            onChange={(e) => handleInputChange("billingAddressLine1", e.target.value)}
                            className={cn(
                              "min-h-[70px] text-xs resize-none",
                              errors.billingAddressLine1 && "border-destructive"
                            )}
                          />
                          {errors.billingAddressLine1 && (
                            <p className="text-destructive text-[10px] flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {errors.billingAddressLine1}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Address Line 2</Label>
                          <Textarea
                            placeholder="Locality, Area"
                            value={formData.billingAddressLine2}
                            onChange={(e) => handleInputChange("billingAddressLine2", e.target.value)}
                            className="min-h-[70px] text-xs resize-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            City
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Select
                            value={formData.billingCity}
                            onValueChange={(value) => handleInputChange("billingCity", value)}
                            disabled={!formData.billingState}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                            <SelectContent>
                              {getBillingCities().map((city) => (
                                <SelectItem key={city} value={city} className="text-xs">
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            ZIP Code
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Input
                            placeholder="Enter ZIP code"
                            value={formData.billingZip}
                            onChange={(e) => handleInputChange("billingZip", e.target.value)}
                            className={cn(
                              "h-9 text-xs",
                              errors.billingZip && "border-destructive"
                            )}
                            maxLength={6}
                          />
                          {errors.billingZip && (
                            <p className="text-destructive text-[10px] flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {errors.billingZip}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Contact Number
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <Input
                              className="pl-8 h-9 text-xs"
                              placeholder="Enter contact number"
                              value={formData.billingContactNo}
                              onChange={(e) => handleInputChange("billingContactNo", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Email Address
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <Input
                              className="pl-8 h-9 text-xs"
                              placeholder="Enter email address"
                              type="email"
                              value={formData.billingEmail}
                              onChange={(e) => handleInputChange("billingEmail", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Alternate Contact</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <Input
                              className="pl-8 h-9 text-xs"
                              placeholder="Enter alternate number"
                              value={formData.billingAlternateContactNo}
                              onChange={(e) => handleInputChange("billingAlternateContactNo", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="shipping" className="space-y-4">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={copyBillingToShipping}
                          className="h-8 text-xs gap-1.5"
                        >
                          <Copy className="w-3 h-3" />
                          Copy from Billing
                        </Button>
                      </div>

                      {/* Shipping address fields - Same structure as billing but with shipping fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Country/Region
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Select
                            value={formData.shippingCountry}
                            onValueChange={(value) => handleInputChange("shippingCountry", value)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="india">India</SelectItem>
                              <SelectItem value="us">United States</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            State
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Select
                            value={formData.shippingState}
                            onValueChange={(value) => handleInputChange("shippingState", value)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                              {indianStates.map((state) => (
                                <SelectItem key={state} value={state} className="text-xs">
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Address Line 1
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Textarea
                            placeholder="Street Address, Building Name"
                            value={formData.shippingAddressLine1}
                            onChange={(e) => handleInputChange("shippingAddressLine1", e.target.value)}
                            className={cn(
                              "min-h-[70px] text-xs resize-none",
                              errors.shippingAddressLine1 && "border-destructive"
                            )}
                          />
                          {errors.shippingAddressLine1 && (
                            <p className="text-destructive text-[10px] flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {errors.shippingAddressLine1}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Address Line 2</Label>
                          <Textarea
                            placeholder="Locality, Area"
                            value={formData.shippingAddressLine2}
                            onChange={(e) => handleInputChange("shippingAddressLine2", e.target.value)}
                            className="min-h-[70px] text-xs resize-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            City
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Select
                            value={formData.shippingCity}
                            onValueChange={(value) => handleInputChange("shippingCity", value)}
                            disabled={!formData.shippingState}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                            <SelectContent>
                              {getShippingCities().map((city) => (
                                <SelectItem key={city} value={city} className="text-xs">
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            ZIP Code
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <Input
                            placeholder="Enter ZIP code"
                            value={formData.shippingZip}
                            onChange={(e) => handleInputChange("shippingZip", e.target.value)}
                            className={cn(
                              "h-9 text-xs",
                              errors.shippingZip && "border-destructive"
                            )}
                            maxLength={6}
                          />
                          {errors.shippingZip && (
                            <p className="text-destructive text-[10px] flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {errors.shippingZip}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Contact Number
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <Input
                              className="pl-8 h-9 text-xs"
                              placeholder="Enter contact number"
                              value={formData.shippingContactNo}
                              onChange={(e) => handleInputChange("shippingContactNo", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Email Address
                            <span className="text-destructive ml-0.5">*</span>
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <Input
                              className="pl-8 h-9 text-xs"
                              placeholder="Enter email address"
                              type="email"
                              value={formData.shippingEmail}
                              onChange={(e) => handleInputChange("shippingEmail", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Alternate Contact</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <Input
                              className="pl-8 h-9 text-xs"
                              placeholder="Enter alternate number"
                              value={formData.shippingAlternateContactNo}
                              onChange={(e) => handleInputChange("shippingAlternateContactNo", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Error display */}
              {errors.submit && (
                <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    <p className="text-xs font-medium">{errors.submit}</p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 text-xs min-w-[80px]"
                >
                  {isSubmitting ? "Saving..." : editCustomer ? "Update Customer" : "Save Customer"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Form Dialog */}
      {companyFormOpen && (
        <CompanyForm
          open={companyFormOpen}
          onOpenChange={() => setCompanyFormOpen(false)}
          onSave={handleSaveCompany}
        />
      )}
    </>
  );
};

export default CustomerForm;