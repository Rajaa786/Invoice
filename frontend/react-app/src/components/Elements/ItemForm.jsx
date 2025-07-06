import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Package, Hash, DollarSign, AlertCircle, Wand2 } from "lucide-react";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";

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
  });

  // Initialize form with edit data when editItem changes
  React.useEffect(() => {
    if (editItem) {
      setFormData({
        type: editItem.type || "Goods",
        name: editItem.name || "",
        hsnSacCode: editItem.hsnSacCode || "",
        unit: editItem.unit || "",
        sellingPrice: editItem.sellingPrice?.toString() || "",
        currency: editItem.currency || "INR",
        description: editItem.description || "",
      });
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

    // Optional field validations
    if (formData.hsnSacCode && !validateHSNSACCode(formData.hsnSacCode)) {
      newErrors.hsnSacCode = "HSN/SAC code must be 4-8 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        if (onSave) onSave({ ...itemData, id: editItem.id });
      } else {
        // Create new item
        await window.electron.addItems(itemData);
        if (onSave) onSave(itemData);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] max-h-[85vh] overflow-y-auto p-4">
        <DialogHeader className="pb-2">
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4 text-primary" />
              {editItem ? "Edit Item" : "Create New Item"}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={generateDummyData}
            >
              <Wand2 className="h-4 w-4" />
              Fill with Dummy Data
            </Button>
          </div>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
};

export default ItemForm;