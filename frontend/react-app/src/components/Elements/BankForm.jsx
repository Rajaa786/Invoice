import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { X, Check, AlertCircle, Loader2, Building, User, CreditCard, CheckCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "../ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils";

// Custom DialogContent without built-in close button
const CustomDialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
                className
            )}
            {...props}
        >
            {children}
        </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
));
CustomDialogContent.displayName = "CustomDialogContent";

const BankForm = ({ open, onOpenChange, onSave }) => {
    const [formData, setFormData] = useState({
        ifscCode: "",
        bankName: "",
        branchName: "",
        accountNumber: "",
        accountHolderName: "",
        accountType: "savings",
        description: "",
    });

    const [validationState, setValidationState] = useState({
        ifscValidating: false,
        ifscValid: false,
        ifscError: "",
        bankDetails: null,
    });

    const [errors, setErrors] = useState({});
    const [accountTypeOpen, setAccountTypeOpen] = useState(false);

    // Account type options
    const accountTypes = [
        { value: "savings", label: "Savings Account", icon: "💳" },
        { value: "current", label: "Current Account", icon: "🏢" },
        { value: "salary", label: "Salary Account", icon: "💰" },
        { value: "business", label: "Business Account", icon: "🏪" },
        { value: "nri", label: "NRI Account", icon: "🌍" },
        { value: "joint", label: "Joint Account", icon: "👥" },
    ];

    // Simulate IFSC validation API
    const validateIFSC = async (ifscCode) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock validation logic
        if (ifscCode.length === 11 && ifscCode.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) {
            // Mock bank data based on IFSC
            const bankData = {
                "SBIN0001234": {
                    bankName: "State Bank of India",
                    branchName: "Main Branch, Mumbai",
                    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/State_Bank_of_India_logo.svg/1200px-State_Bank_of_India_logo.svg.png"
                },
                "HDFC0000987": {
                    bankName: "HDFC Bank",
                    branchName: "Central Branch, Delhi",
                    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/HDFC_Bank_Logo.svg/1200px-HDFC_Bank_Logo.svg.png"
                },
                "ICIC0000456": {
                    bankName: "ICICI Bank",
                    branchName: "Corporate Branch, Bangalore",
                    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/ICICI_Bank_logo.svg/1200px-ICICI_Bank_logo.svg.png"
                }
            };

            return {
                success: true,
                data: bankData[ifscCode] || {
                    bankName: "Sample Bank",
                    branchName: "Sample Branch",
                    logo: null
                }
            };
        } else {
            return {
                success: false,
                error: "Invalid IFSC code format"
            };
        }
    };

    const handleIFSCChange = async (value) => {
        const upperValue = value.toUpperCase();
        setFormData(prev => ({ ...prev, ifscCode: upperValue }));

        // Clear previous validation state
        setValidationState(prev => ({
            ...prev,
            ifscValidating: false,
            ifscValid: false,
            ifscError: "",
            bankDetails: null
        }));

        // Validate when IFSC is complete (11 characters)
        if (upperValue.length === 11) {
            setValidationState(prev => ({ ...prev, ifscValidating: true }));

            try {
                const result = await validateIFSC(upperValue);

                if (result.success) {
                    setValidationState(prev => ({
                        ...prev,
                        ifscValidating: false,
                        ifscValid: true,
                        bankDetails: result.data
                    }));

                    // Auto-populate bank details
                    setFormData(prev => ({
                        ...prev,
                        bankName: result.data.bankName,
                        branchName: result.data.branchName
                    }));
                } else {
                    setValidationState(prev => ({
                        ...prev,
                        ifscValidating: false,
                        ifscValid: false,
                        ifscError: result.error
                    }));
                }
            } catch (error) {
                setValidationState(prev => ({
                    ...prev,
                    ifscValidating: false,
                    ifscValid: false,
                    ifscError: "Network error. Please try again."
                }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.ifscCode) newErrors.ifscCode = "IFSC code is required";
        if (!formData.accountNumber) newErrors.accountNumber = "Account number is required";
        if (!formData.accountHolderName) newErrors.accountHolderName = "Account holder name is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSave(formData);
            handleClose();
        }
    };

    const handleClose = () => {
        setFormData({
            ifscCode: "",
            bankName: "",
            branchName: "",
            accountNumber: "",
            accountHolderName: "",
            accountType: "savings",
            description: "",
        });
        setValidationState({
            ifscValidating: false,
            ifscValid: false,
            ifscError: "",
            bankDetails: null,
        });
        setErrors({});
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <CustomDialogContent className="sm:max-w-lg">
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-semibold text-gray-900">
                            Add Bank Account
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="h-8 w-8 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
                        >
                            <X className="h-4 w-4 text-gray-500 hover:text-gray-700 transition-colors" />
                        </Button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        Enter your bank's IFSC code to get started. We'll automatically fetch your bank details.
                    </p>
                </DialogHeader>

                <div className="space-y-4">
                    {/* IFSC Code Section - The Smart Starting Point */}
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-gray-800">
                                IFSC Code *
                            </Label>
                            <div className="relative">
                                <Input
                                    value={formData.ifscCode}
                                    onChange={(e) => handleIFSCChange(e.target.value)}
                                    placeholder="e.g., SBIN0001234"
                                    maxLength={11}
                                    className={`pr-12 h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${validationState.ifscValidating
                                        ? "border-blue-300 bg-blue-50"
                                        : validationState.ifscValid
                                            ? "border-green-300 bg-green-50"
                                            : validationState.ifscError
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200"
                                        }`}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {validationState.ifscValidating && (
                                        <div className="flex items-center gap-1.5">
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                            <span className="text-xs text-blue-600 font-medium">Validating...</span>
                                        </div>
                                    )}
                                    {validationState.ifscValid && !validationState.ifscValidating && (
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-xs text-green-600 font-medium">Verified</span>
                                        </div>
                                    )}
                                    {validationState.ifscError && !validationState.ifscValidating && (
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                    )}
                                </div>
                            </div>

                            {validationState.ifscError && (
                                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {validationState.ifscError}
                                </p>
                            )}

                            {errors.ifscCode && (
                                <p className="text-xs text-red-600 mt-1">{errors.ifscCode}</p>
                            )}
                        </div>
                    </div>

                    {/* Auto-populated Bank Details - The Smart Reveal */}
                    {validationState.ifscValid && validationState.bankDetails && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-md p-3 shadow-sm">
                            <div className="flex items-center gap-3">
                                {validationState.bankDetails.logo && (
                                    <div className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0 border border-green-200 bg-white p-1">
                                        <img
                                            src={validationState.bankDetails.logo}
                                            alt={`${validationState.bankDetails.bankName} logo`}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Building className="h-3 w-3 text-green-600" />
                                        <span className="text-sm font-semibold text-green-800">
                                            {validationState.bankDetails.bankName}
                                        </span>
                                        <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-green-300 text-green-700 bg-green-100">
                                            ✓ Verified
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-green-700">
                                        {validationState.bankDetails.branchName}
                                    </p>
                                    <p className="text-xs text-green-600 mt-0.5">
                                        Bank details automatically fetched from IFSC code
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account Details Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-800">
                                    Account Number *
                                </Label>
                                <Input
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                                    placeholder="Enter account number"
                                    className="h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                                {errors.accountNumber && (
                                    <p className="text-xs text-red-600 mt-1">{errors.accountNumber}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-800">
                                    Account Type
                                </Label>
                                <Popover open={accountTypeOpen} onOpenChange={setAccountTypeOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={accountTypeOpen}
                                            className="w-full justify-between h-9 text-sm border-gray-200 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            {formData.accountType ? (
                                                <span className="flex items-center gap-2">
                                                    <span>{accountTypes.find(type => type.value === formData.accountType)?.icon}</span>
                                                    <span>{accountTypes.find(type => type.value === formData.accountType)?.label}</span>
                                                </span>
                                            ) : (
                                                "Select type..."
                                            )}
                                            <svg className="ml-2 h-4 w-4 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search account types..." />
                                            <CommandEmpty>No account type found.</CommandEmpty>
                                            <CommandGroup>
                                                {accountTypes.map((type) => (
                                                    <CommandItem
                                                        key={type.value}
                                                        value={type.value}
                                                        onSelect={(value) => {
                                                            setFormData(prev => ({ ...prev, accountType: value }));
                                                            setAccountTypeOpen(false);
                                                        }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span>{type.icon}</span>
                                                        <span>{type.label}</span>
                                                        {formData.accountType === type.value && (
                                                            <Check className="ml-auto h-4 w-4" />
                                                        )}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-gray-800">
                                Account Holder Name *
                            </Label>
                            <Input
                                value={formData.accountHolderName}
                                onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                                placeholder="Enter account holder's full name"
                                className="h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                            {errors.accountHolderName && (
                                <p className="text-xs text-red-600 mt-1">{errors.accountHolderName}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-gray-800">
                                Additional Notes
                            </Label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Add any notes to help identify this account later..."
                                className="w-full h-16 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                                rows={2}
                            />
                            <p className="text-xs text-gray-500">
                                Optional: Add notes to help identify this account later
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1 h-9 text-sm border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="flex-1 h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                    >
                        Save Account
                    </Button>
                </div>
            </CustomDialogContent>
        </Dialog>
    );
};

export default BankForm; 