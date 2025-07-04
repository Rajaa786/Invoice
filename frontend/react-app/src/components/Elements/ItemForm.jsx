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
import { Package, Hash, DollarSign, AlertCircle } from "lucide-react";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";

const ItemForm = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hsnSacCode: "",
    unit: "",
    sellingPrice: "",
    purchasePrice: "",
    openingStock: "",
    minStockAlert: "",
    taxRate: "",
  });

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

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = "Item name is required";
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (!formData.sellingPrice) newErrors.sellingPrice = "Selling price is required";

    // Number validations
    if (formData.sellingPrice && isNaN(parseFloat(formData.sellingPrice))) {
      newErrors.sellingPrice = "Must be a valid number";
    }
    if (formData.purchasePrice && isNaN(parseFloat(formData.purchasePrice))) {
      newErrors.purchasePrice = "Must be a valid number";
    }
    if (formData.openingStock && isNaN(parseInt(formData.openingStock))) {
      newErrors.openingStock = "Must be a valid number";
    }
    if (formData.minStockAlert && isNaN(parseInt(formData.minStockAlert))) {
      newErrors.minStockAlert = "Must be a valid number";
    }
    if (formData.taxRate && (isNaN(parseFloat(formData.taxRate)) || parseFloat(formData.taxRate) > 100)) {
      newErrors.taxRate = "Must be a valid percentage (0-100)";
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
      const itemData = {
        itemType: "Goods",
        name: formData.name,
        hsnSacCode: formData.hsnSacCode || null,
        unit: formData.unit || null,
        price: parseFloat(formData.sellingPrice) || 0,
        description: formData.description || null,
      };

      await window.electron.addItems(itemData);
      if (onSave) onSave(itemData);
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
          <DialogTitle className="flex items-center gap-2 text-base">
            <Package className="w-4 h-4 text-primary" />
            Create New Item
          </DialogTitle>
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

                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Unit
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleInputChange("unit", value)}
                  >
                    <SelectTrigger className={errors.unit ? "border-destructive" : ""}>
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
                  {errors.unit && (
                    <p className="text-destructive text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" />
                      {errors.unit}
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

          {/* Pricing & Tax */}
          <Card className="shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-primary" />
                <h3 className="text-xs font-medium">Pricing & Tax</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-1.5">
                  <Label className="text-xs">Purchase Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.purchasePrice}
                      onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                      className={`pl-7 ${errors.purchasePrice ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.purchasePrice && (
                    <p className="text-destructive text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" />
                      {errors.purchasePrice}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">
                    HSN/SAC Code
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input
                      placeholder="Enter HSN/SAC code"
                      value={formData.hsnSacCode}
                      onChange={(e) => handleInputChange("hsnSacCode", e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Tax Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter tax rate"
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange("taxRate", e.target.value)}
                    className={errors.taxRate ? "border-destructive" : ""}
                  />
                  {errors.taxRate && (
                    <p className="text-destructive text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" />
                      {errors.taxRate}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card className="shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-3 h-3 text-primary" />
                <h3 className="text-xs font-medium">Stock Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Opening Stock</Label>
                  <Input
                    type="number"
                    placeholder="Enter opening stock"
                    value={formData.openingStock}
                    onChange={(e) => handleInputChange("openingStock", e.target.value)}
                    className={errors.openingStock ? "border-destructive" : ""}
                  />
                  {errors.openingStock && (
                    <p className="text-destructive text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" />
                      {errors.openingStock}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Min Stock Alert</Label>
                  <Input
                    type="number"
                    placeholder="Enter min stock level"
                    value={formData.minStockAlert}
                    onChange={(e) => handleInputChange("minStockAlert", e.target.value)}
                    className={errors.minStockAlert ? "border-destructive" : ""}
                  />
                  {errors.minStockAlert && (
                    <p className="text-destructive text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" />
                      {errors.minStockAlert}
                    </p>
                  )}
                </div>
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
              {isSubmitting ? "Saving..." : "Save Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ItemForm;