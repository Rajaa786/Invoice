import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./alert-dialog";
import { AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

const ConfirmationDialog = ({
    open,
    onOpenChange,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
    variant = "destructive", // destructive, warning, info
    isLoading = false,
    itemName = "",
    itemType = "item"
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case "destructive":
                return {
                    icon: <Trash2 className="h-5 w-5 text-red-600" />,
                    iconBg: "bg-red-100",
                    buttonClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                };
            case "warning":
                return {
                    icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
                    iconBg: "bg-amber-100",
                    buttonClass: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
                };
            default:
                return {
                    icon: <AlertTriangle className="h-5 w-5 text-blue-600" />,
                    iconBg: "bg-blue-100",
                    buttonClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-full", variantStyles.iconBg)}>
                            {variantStyles.icon}
                        </div>
                        <div className="flex-1">
                            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                                {title}
                            </AlertDialogTitle>
                        </div>
                    </div>
                </AlertDialogHeader>

                <AlertDialogDescription className="text-sm text-gray-600 mt-2">
                    {itemName ? (
                        <span>
                            {description.replace("This action", `Deleting "${itemName}"`)} This {itemType} will be permanently removed from your system.
                        </span>
                    ) : (
                        description
                    )}
                </AlertDialogDescription>

                <AlertDialogFooter className="mt-6 gap-2">
                    <AlertDialogCancel
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            "px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 min-w-[80px]",
                            variantStyles.buttonClass,
                            isLoading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isLoading ? "Deleting..." : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export { ConfirmationDialog }; 