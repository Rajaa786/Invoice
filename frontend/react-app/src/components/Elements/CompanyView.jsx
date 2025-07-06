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
    Building2,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Users,
    TrendingUp,
    Globe,
    Calendar,
    FileText,
    Briefcase
} from "lucide-react";
import { cn } from "../../lib/utils";

const CompanyView = ({ open, onOpenChange, company }) => {
    if (!company) return null;

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                            {company.logoPath ? (
                                <img
                                    src={company.logoPath}
                                    alt="Company Logo"
                                    className="h-8 w-8 rounded object-cover"
                                />
                            ) : (
                                <Building2 className="h-5 w-5 text-blue-600" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{company.companyName}</h2>
                            <p className="text-sm text-gray-500 mt-1">Company Details</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Building2 className="h-4 w-4 text-blue-600" />
                                Company Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Company Name
                                </label>
                                <p className="text-sm font-medium text-gray-900">{company.companyName}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Company Type
                                    </label>
                                    <Badge variant="outline" className="w-fit bg-blue-50 text-blue-700 border-blue-200">
                                        <Briefcase className="h-3 w-3 mr-1" />
                                        {company.companyType || 'N/A'}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Industry
                                    </label>
                                    <p className="text-sm text-gray-900">{company.industry || company.companyType || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Company Size
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">{company.companySize || company.businessModel || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Annual Revenue
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-medium text-green-600">
                                            {company.annualRevenue ? formatCurrency(company.annualRevenue) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {company.description && (
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Description
                                    </label>
                                    <div className="flex items-start gap-2">
                                        <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-700 leading-relaxed">{company.description}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Phone className="h-4 w-4 text-green-600" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Email Address
                                </label>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">{company.email || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Contact Number
                                </label>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">{company.contactNo || 'N/A'}</span>
                                </div>
                            </div>

                            {company.alternateContactNo && (
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Alternate Contact
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-700">{company.alternateContactNo}</span>
                                        <Badge variant="outline" className="text-xs">Alt</Badge>
                                    </div>
                                </div>
                            )}

                            {company.website && (
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Website
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-gray-400" />
                                        <a
                                            href={company.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                                        >
                                            {company.website}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Address Information */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="h-4 w-4 text-orange-600" />
                                Address Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Address
                                </label>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-900">{company.addressLine1 || 'N/A'}</p>
                                    {company.addressLine2 && (
                                        <p className="text-sm text-gray-700">{company.addressLine2}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        City
                                    </label>
                                    <p className="text-sm text-gray-900">{company.city || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        State
                                    </label>
                                    <p className="text-sm text-gray-900">{company.state || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Postal Code
                                    </label>
                                    <p className="text-sm text-gray-900">{company.postalCode || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Country
                                    </label>
                                    <p className="text-sm text-gray-900">{company.country || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* GST & Legal Information */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CreditCard className="h-4 w-4 text-green-600" />
                                GST & Legal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    GST Registration
                                </label>
                                <Badge
                                    variant={company.gstApplicable === "Yes" ? "default" : "secondary"}
                                    className={cn(
                                        "w-fit text-xs",
                                        company.gstApplicable === "Yes"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-gray-50 text-gray-700 border-gray-200"
                                    )}
                                >
                                    {company.gstApplicable === "Yes" ? "GST Registered" : "Not Registered"}
                                </Badge>
                            </div>

                            {company.gstApplicable === "Yes" && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            GSTIN/UIN
                                        </label>
                                        <p className="text-sm font-mono text-gray-900">{company.gstin || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            State Code
                                        </label>
                                        <p className="text-sm font-mono text-gray-900">{company.stateCode || 'N/A'}</p>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    PAN Number
                                </label>
                                <p className="text-sm font-mono text-gray-900">{company.panNumber || 'N/A'}</p>
                            </div>

                            {company.cinNumber && (
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        CIN Number
                                    </label>
                                    <p className="text-sm font-mono text-gray-900">{company.cinNumber}</p>
                                </div>
                            )}
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
                            <div className="grid grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Company ID
                                    </label>
                                    <span className="text-sm font-mono text-gray-900">#{company.id}</span>
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
                                        Created Date
                                    </label>
                                    <span className="text-sm text-gray-900">{formatDate(company.createdAt)}</span>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Last Updated
                                    </label>
                                    <span className="text-sm text-gray-900">{formatDate(company.updatedAt)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CompanyView; 