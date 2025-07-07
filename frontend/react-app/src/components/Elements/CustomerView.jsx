import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import {
    Users,
    Building2,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    FileText,
    User,
    Calendar,
    Globe
} from "lucide-react";
import { cn } from "../../lib/utils";

const CustomerView = ({ open, onOpenChange, customer }) => {
    if (!customer) return null;

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCustomerDisplayName = () => {
        if (customer.companyName) return customer.companyName;
        return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            customer.customerType === "Business" ? "bg-blue-100" : "bg-purple-100"
                        )}>
                            {customer.customerType === "Business" ? (
                                <Building2 className="h-5 w-5 text-blue-600" />
                            ) : (
                                <Users className="h-5 w-5 text-purple-600" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{getCustomerDisplayName()}</h2>
                            <p className="text-sm text-gray-500 mt-1">Customer Details</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="h-4 w-4 text-blue-600" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Customer Type
                                </label>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "w-fit text-xs",
                                        customer.customerType === "Business"
                                            ? "bg-blue-50 text-blue-700 border-blue-200"
                                            : "bg-purple-50 text-purple-700 border-purple-200"
                                    )}
                                >
                                    {customer.customerType === "Business" ? (
                                        <Building2 className="h-3 w-3 mr-1" />
                                    ) : (
                                        <Users className="h-3 w-3 mr-1" />
                                    )}
                                    {customer.customerType}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        First Name
                                    </label>
                                    <p className="text-sm font-medium text-gray-900">{customer.firstName || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Last Name
                                    </label>
                                    <p className="text-sm font-medium text-gray-900">{customer.lastName || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Company Name
                                </label>
                                <p className="text-sm font-medium text-gray-900">{customer.companyName || 'N/A'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        PAN Number
                                    </label>
                                    <p className="text-sm font-mono text-gray-900">{customer.panNumber || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Currency
                                    </label>
                                    <Badge variant="outline" className="w-fit bg-gray-50 text-gray-700 border-gray-200">
                                        <Globe className="h-3 w-3 mr-1" />
                                        {customer.currency || 'INR'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* GST Information */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CreditCard className="h-4 w-4 text-green-600" />
                                GST Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    GST Registration
                                </label>
                                <Badge
                                    variant={customer.gstApplicable === "Yes" ? "default" : "secondary"}
                                    className={cn(
                                        "w-fit text-xs",
                                        customer.gstApplicable === "Yes"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-gray-50 text-gray-700 border-gray-200"
                                    )}
                                >
                                    {customer.gstApplicable === "Yes" ? "GST Registered" : "Not Registered"}
                                </Badge>
                            </div>

                            {customer.gstApplicable === "Yes" && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            GSTIN/UIN
                                        </label>
                                        <p className="text-sm font-mono text-gray-900">{customer.gstin || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            State Code
                                        </label>
                                        <p className="text-sm font-mono text-gray-900">{customer.stateCode || 'N/A'}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Billing Address */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="h-4 w-4 text-orange-600" />
                                Billing Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Address
                                </label>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-900">{customer.billingAddressLine1 || 'N/A'}</p>
                                    {customer.billingAddressLine2 && (
                                        <p className="text-sm text-gray-700">{customer.billingAddressLine2}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        City
                                    </label>
                                    <p className="text-sm text-gray-900">{customer.billingCity || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        State
                                    </label>
                                    <p className="text-sm text-gray-900">{customer.billingState || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Country
                                </label>
                                <p className="text-sm text-gray-900">{customer.billingCountry || 'N/A'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Contact Information
                                </label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">{customer.billingContactNo || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">{customer.billingEmail || 'N/A'}</span>
                                    </div>
                                    {customer.billingAlternateContactNo && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">{customer.billingAlternateContactNo}</span>
                                            <Badge variant="outline" className="text-xs">Alt</Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="h-4 w-4 text-purple-600" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Address
                                </label>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-900">{customer.shippingAddressLine1 || 'N/A'}</p>
                                    {customer.shippingAddressLine2 && (
                                        <p className="text-sm text-gray-700">{customer.shippingAddressLine2}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        City
                                    </label>
                                    <p className="text-sm text-gray-900">{customer.shippingCity || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        State
                                    </label>
                                    <p className="text-sm text-gray-900">{customer.shippingState || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Country
                                </label>
                                <p className="text-sm text-gray-900">{customer.shippingCountry || 'N/A'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Contact Information
                                </label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">{customer.shippingContactNo || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">{customer.shippingEmail || 'N/A'}</span>
                                    </div>
                                    {customer.shippingAlternateContactNo && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">{customer.shippingAlternateContactNo}</span>
                                            <Badge variant="outline" className="text-xs">Alt</Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Information */}
                    <Card className="shadow-sm border-gray-200 lg:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Calendar className="h-4 w-4 text-gray-600" />
                                System Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Customer ID
                                    </label>
                                    <span className="text-sm font-mono text-gray-900">#{customer.id}</span>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Status
                                    </label>
                                    <Badge
                                        variant="outline"
                                        className="w-fit bg-emerald-50 text-emerald-700 border-emerald-200"
                                    >
                                        Active
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Salutation
                                    </label>
                                    <span className="text-sm text-gray-900">{customer.salutation || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Created Date
                                    </label>
                                    <span className="text-sm text-gray-900">{formatDate(customer.createdAt)}</span>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Last Updated
                                    </label>
                                    <span className="text-sm text-gray-900">{formatDate(customer.updatedAt)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerView; 