import React from "react";
import { Eye, Edit, Trash2, Copy, ExternalLink } from "lucide-react";
import { Button } from "./button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./tooltip";
import { cn } from "../../lib/utils";

const ActionButtons = ({
    onView,
    onEdit,
    onDelete,
    onDuplicate,
    onExport,
    viewLabel = "View Details",
    editLabel = "Edit",
    deleteLabel = "Delete",
    duplicateLabel = "Duplicate",
    exportLabel = "Export",
    showView = true,
    showEdit = true,
    showDelete = true,
    showDuplicate = false,
    showExport = false,
    disabled = false,
    size = "sm",
    variant = "ghost"
}) => {
    const buttonSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
    const iconSize = size === "sm" ? "h-4 w-4" : "h-4 w-4";

    const ActionButton = ({
        onClick,
        icon: Icon,
        label,
        className,
        hoverClassName,
        show = true
    }) => {
        if (!show) return null;

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={variant}
                        size="sm"
                        className={cn(
                            buttonSize,
                            "p-0 transition-all duration-200 hover:scale-105 shadow-sm border border-gray-100",
                            className,
                            hoverClassName,
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={onClick}
                        disabled={disabled}
                    >
                        <Icon className={cn(iconSize, "transition-colors duration-200")} />
                        <span className="sr-only">{label}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg"
                >
                    <p>{label}</p>
                </TooltipContent>
            </Tooltip>
        );
    };

    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-1">
                <ActionButton
                    show={showView}
                    onClick={onView}
                    icon={Eye}
                    label={viewLabel}
                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 hover:shadow-blue-100/50"
                    hoverClassName="hover:border-blue-200"
                />

                <ActionButton
                    show={showEdit}
                    onClick={onEdit}
                    icon={Edit}
                    label={editLabel}
                    className="text-gray-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 hover:shadow-amber-100/50"
                    hoverClassName="hover:border-amber-200"
                />

                <ActionButton
                    show={showDuplicate}
                    onClick={onDuplicate}
                    icon={Copy}
                    label={duplicateLabel}
                    className="text-gray-500 hover:text-green-600 hover:bg-green-50 hover:border-green-200 hover:shadow-green-100/50"
                    hoverClassName="hover:border-green-200"
                />

                <ActionButton
                    show={showExport}
                    onClick={onExport}
                    icon={ExternalLink}
                    label={exportLabel}
                    className="text-gray-500 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200 hover:shadow-purple-100/50"
                    hoverClassName="hover:border-purple-200"
                />

                <ActionButton
                    show={showDelete}
                    onClick={onDelete}
                    icon={Trash2}
                    label={deleteLabel}
                    className="text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 hover:shadow-red-100/50"
                    hoverClassName="hover:border-red-200"
                />
            </div>
        </TooltipProvider>
    );
};

export { ActionButtons }; 