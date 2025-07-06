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
    Package,
    Hash,
    DollarSign,
    Ruler,
    FileText,
    Tag,
    Calendar,
    TrendingUp
} from "lucide-react";
import { cn } from "../../lib/utils";

const ItemView = ({ open, onOpenChange, item }) => {
    if (!item) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100">
                            <Package className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
                            <p className="text-sm text-gray-500 mt-1">Item Details</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Package className="h-4 w-4 text-indigo-600" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Item Name
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-indigo-600" />
                                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Type
                                    </label>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "w-fit text-xs",
                                            item.type === "Goods"
                                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                                : "bg-purple-50 text-purple-700 border-purple-200"
                                        )}
                                    >
                                        <Tag className="h-3 w-3 mr-1" />
                                        {item.type}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Unit of Measurement
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Ruler className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">{item.unit || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        HSN/SAC Code
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-mono text-gray-900">{item.hsnSacCode || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {item.description && (
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Description
                                    </label>
                                    <div className="flex items-start gap-2">
                                        <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pricing Information */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                Pricing Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Selling Price
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="text-lg font-semibold text-green-600">
                                            {formatCurrency(item.sellingPrice)}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Currency
                                    </label>
                                    <Badge variant="outline" className="w-fit bg-gray-50 text-gray-700 border-gray-200">
                                        {item.currency || 'INR'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Information */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Calendar className="h-4 w-4 text-gray-600" />
                                System Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Item ID
                                    </label>
                                    <span className="text-sm font-mono text-gray-900">#{item.id}</span>
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
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Created Date
                                    </label>
                                    <span className="text-sm text-gray-900">{formatDate(item.createdAt)}</span>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Last Updated
                                    </label>
                                    <span className="text-sm text-gray-900">{formatDate(item.updatedAt)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ItemView; 