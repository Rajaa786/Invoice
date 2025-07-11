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
import { Package, Hash, DollarSign, AlertCircle, Wand2, Building, Plus } from "lucide-react";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import CompanyForm from "./CompanyForm";

const ItemForm = ({ isOpen, onClose, onSave, editItem = null }) => {
  const [formData, setFormData] = useState({
    // Schema-defined fields
    type: "Goods",           // Required, defaulted to 'Goods' (only 'Goods' or 'Service' allowed)
    name: "",               // Required
    hsnSacCode: "",         // Optional
    unit: "",              // Optional
    sellingPrice: "",       // Required
    currency: "INR",        // Fixed to INR as per schema
    description: "",        // Optional
    companyId: "",         // Single company ID this item is associated with
  });

  // State for companies
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
        const response = await window.electron.getCompany();
        if (response.success) {
          setCompanies(response.companies || []);
        } else {
          console.error("Failed to fetch companies:", response.error);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // Initialize form with edit data when editItem changes
  useEffect(() => {
    if (editItem) {
      // For edit mode, we need to fetch the associated company for this item
      const fetchItemCompany = async () => {
        try {
          const response = await window.electron.getItemCompanies(editItem.id);
          if (response.success && response.companies && response.companies.length > 0) {
            // Get the first company (since we're now only allowing one company per item)
            const companyId = response.companies[0].id;
            setFormData({
              type: editItem.type || "Goods",
              name: editItem.name || "",
              hsnSacCode: editItem.hsnSacCode || "",
              unit: editItem.unit || "",
              sellingPrice: editItem.sellingPrice?.toString() || "",
              currency: editItem.currency || "INR",
              description: editItem.description || "",
              companyId: companyId,
            });
          } else {
            // No companies associated
            setFormData({
              type: editItem.type || "Goods",
              name: editItem.name || "",
              hsnSacCode: editItem.hsnSacCode || "",
              unit: editItem.unit || "",
              sellingPrice: editItem.sellingPrice?.toString() || "",
              currency: editItem.currency || "INR",
              description: editItem.description || "",
              companyId: "",
            });
          }
        } catch (error) {
          console.error("Error fetching item company:", error);
          // Still set the form data without company ID
          setFormData({
            type: editItem.type || "Goods",
            name: editItem.name || "",
            hsnSacCode: editItem.hsnSacCode || "",
            unit: editItem.unit || "",
            sellingPrice: editItem.sellingPrice?.toString() || "",
            currency: editItem.currency || "INR",
            description: editItem.description || "",
            companyId: "",
          });
        }
      };

      fetchItemCompany();
    } else {
      // Reset form when not editing
      setFormData({
        type: "Goods",
        name: "",
        hsnSacCode: "",
        unit: "",
        sellingPrice: "",
        currency: "INR",
        description: "",
        companyId: "",
      });
    }
    setErrors({});
  }, [editItem, isOpen]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unitOptions = [
    "PCS",
    "BOX",
    "KG",
    "GM",
    "LTR",
    "MTR",
    "CM",
    "SET",
    "DOZEN",
    "PAIR",
  ];

  const typeOptions = ["Goods", "Service"]; // Explicitly limited as per schema

  // Function to generate dummy item data
  const generateDummyData = () => {
    const randomNum = Math.floor(Math.random() * 1000);
    const randomUnit = unitOptions[Math.floor(Math.random() * unitOptions.length)];
    const randomType = typeOptions[Math.floor(Math.random() * typeOptions.length)];
    const randomPrice = Math.floor(Math.random() * 10000) + 100; // Random price between 100 and 10100
    const randomHSN = Math.floor(Math.random() * 9000) + 1000; // 4-digit HSN code

    const dummyData = {
      type: randomType,
      name: `Test Item ${randomNum}`,
      description: `This is a test ${randomType.toLowerCase()} with ID ${randomNum}. It is measured in ${randomUnit}.`,
      hsnSacCode: randomHSN.toString(),
      unit: randomUnit,
      sellingPrice: randomPrice.toString(),
      currency: "INR",
    };

    setFormData(dummyData);
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Function to validate HSN/SAC code format
  const validateHSNSACCode = (code) => {
    if (!code) return true; // Optional field
    // HSN codes are typically 4-8 digits
    return /^\d{4,8}$/.test(code);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation as per schema
    if (!formData.type || !["Goods", "Service"].includes(formData.type)) {
      newErrors.type = "Item type must be either 'Goods' or 'Service'";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Item name is required";
    }
    if (!formData.sellingPrice || formData.sellingPrice.trim() === "") {
      newErrors.sellingPrice = "Selling price is required";
    } else if (isNaN(parseFloat(formData.sellingPrice)) || parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = "Must be a valid positive number";
    }
    if (!formData.companyId) {
      newErrors.companyId = "Please select a company";
    }

    // Optional field validations
    if (formData.hsnSacCode && !validateHSNSACCode(formData.hsnSacCode)) {
      newErrors.hsnSacCode = "HSN/SAC code must be 4-8 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update handleCompanySelection
  const handleCompanySelection = (companyId) => {
    const company = companies.find(c => String(c.id) === String(companyId));
    setSelectedCompany(company);
    setFormData(prev => ({
      ...prev,
      companyId: companyId
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Only send schema-defined fields to the backend
      const itemData = {
        type: formData.type,
        name: formData.name.trim(),
        hsnSacCode: formData.hsnSacCode.trim() || null,
        unit: formData.unit || null,
        sellingPrice: parseFloat(formData.sellingPrice),
        currency: formData.currency,
        description: formData.description.trim() || null,
      };

      if (editItem) {
        // Update existing item
        await window.electron.updateItem({ ...itemData, id: editItem.id });
        // Also update company association
        if (formData.companyId) {
          await window.electron.updateItemCompanies(editItem.id, [formData.companyId]);
        } else {
          // If no company is selected, clear all associations
          await window.electron.updateItemCompanies(editItem.id, []);
        }
        if (onSave) onSave({ ...itemData, id: editItem.id });
      } else {
        // Create new item
        const result = await window.electron.addItems(itemData);
        console.log("Item added successfully: ", result);

        // Add company association for the new item
        if (result.success && formData.companyId) {
          const newItemId = result.result.lastInsertRowid; // Use lastInsertRowid for new item
          const updateCompanyResult = await window.electron.updateItemCompanies(
            newItemId,
            [formData.companyId]
          );

          if (!updateCompanyResult.success) {
            console.error("Failed to add item-company association:", updateCompanyResult.error);
          }
        }

        if (result.success) {
          console.log("Item saved:", result.result);
          if (onSave) onSave(result.result);

          // Reset form state after successful save
          setFormData({
            type: "Goods",
            name: "",
            hsnSacCode: "",
            unit: "",
            sellingPrice: "",
            currency: "INR",
            description: "",
            companyId: "",
          });
          setSelectedCompany(null);
          setErrors({});
        } else {
          console.error("Failed to save item:", result.error);
          setErrors({ submit: result.error });
        }
      }
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
      setErrors({ submit: "Failed to save item. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-row items-center justify-between">
              <div>
                <DialogTitle>{editItem ? "Edit Item" : "Add New Item"}</DialogTitle>
                <DialogDescription className="sr-only">
                  {editItem ? "Edit existing item details" : "Add a new item to the system"}
                </DialogDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={generateDummyData}
              >
                <Wand2 className="w-3 h-3 mr-1" />
                Generate Test Data
              </Button>
            </div>
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
                    Select the company this item should be associated with. Items will only be available for invoices from the selected company.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rest of the form fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <Card className="shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 text-primary" />
                    <h3 className="text-xs font-medium">Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        Item Type
                        <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleInputChange("type", value)}
                      >
                        <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {typeOptions.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.type && (
                        <p className="text-destructive text-[10px] flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {errors.type}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        Item Name
                        <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      <Input
                        placeholder="Enter item name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && (
                        <p className="text-destructive text-[10px] flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Unit</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => handleInputChange("unit", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {unitOptions.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">HSN/SAC Code</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <Input
                          placeholder="Enter 4-8 digit HSN/SAC code"
                          value={formData.hsnSacCode}
                          onChange={(e) => handleInputChange("hsnSacCode", e.target.value)}
                          className={`pl-8 ${errors.hsnSacCode ? "border-destructive" : ""}`}
                        />
                      </div>
                      {errors.hsnSacCode && (
                        <p className="text-destructive text-[10px] flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {errors.hsnSacCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      placeholder="Enter item description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="min-h-[60px] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Section */}
              <Card className="shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3 h-3 text-primary" />
                    <h3 className="text-xs font-medium">Pricing</h3>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      Selling Price
                      <span className="text-destructive ml-0.5">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.sellingPrice}
                        onChange={(e) => handleInputChange("sellingPrice", e.target.value)}
                        className={`pl-7 ${errors.sellingPrice ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.sellingPrice && (
                      <p className="text-destructive text-[10px] flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" />
                        {errors.sellingPrice}
                      </p>
                    )}
                  </div>
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
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-8 text-xs min-w-[80px]"
                >
                  {isSubmitting ? "Saving..." : editItem ? "Update Item" : "Save Item"}
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

export default ItemForm;