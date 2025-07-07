import React, { useState } from "react";
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Copy,
    ExternalLink
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "./dropdown-menu";
import { Button } from "./button";
import { cn } from "../../lib/utils";

const ActionMenu = ({
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
    size = "sm"
}) => {
    const [open, setOpen] = useState(false);

    const handleAction = (action, callback) => {
        if (callback && !disabled) {
            callback();
            setOpen(false);
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size={size}
                    className={cn(
                        "h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200",
                        "focus:ring-2 focus:ring-primary/20 focus:ring-offset-1",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={disabled}
                >
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-48 shadow-lg border-gray-200 bg-white/95 backdrop-blur-sm"
            >
                {showView && (
                    <DropdownMenuItem
                        onClick={() => handleAction('view', onView)}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors duration-150"
                    >
                        <Eye className="h-4 w-4" />
                        {viewLabel}
                    </DropdownMenuItem>
                )}

                {showEdit && (
                    <DropdownMenuItem
                        onClick={() => handleAction('edit', onEdit)}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-amber-50 hover:text-amber-700 cursor-pointer transition-colors duration-150"
                    >
                        <Edit className="h-4 w-4" />
                        {editLabel}
                    </DropdownMenuItem>
                )}

                {showDuplicate && (
                    <DropdownMenuItem
                        onClick={() => handleAction('duplicate', onDuplicate)}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-green-50 hover:text-green-700 cursor-pointer transition-colors duration-150"
                    >
                        <Copy className="h-4 w-4" />
                        {duplicateLabel}
                    </DropdownMenuItem>
                )}

                {showExport && (
                    <DropdownMenuItem
                        onClick={() => handleAction('export', onExport)}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 cursor-pointer transition-colors duration-150"
                    >
                        <ExternalLink className="h-4 w-4" />
                        {exportLabel}
                    </DropdownMenuItem>
                )}

                {showDelete && (
                    <>
                        <DropdownMenuSeparator className="bg-gray-100" />
                        <DropdownMenuItem
                            onClick={() => handleAction('delete', onDelete)}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 hover:text-red-700 cursor-pointer transition-colors duration-150 text-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                            {deleteLabel}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export { ActionMenu }; 