import React, { useState } from 'react';
import { Package, Hash, DollarSign, Ruler } from "lucide-react";
import { Badge } from "../ui/badge";
import { BaseTable } from "../ui/base-table";
import { ActionButtons } from "../ui/action-buttons";
import { ConfirmationDialog } from "../ui/confirmation-dialog";
import ItemView from "../Elements/ItemView";
import ItemForm from "../Elements/ItemForm";

const ItemTable = ({ data = [], loading = false, onRefresh }) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [viewItem, setViewItem] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = (item) => {
        setViewItem(item);
    };

    const handleEdit = (item) => {
        setEditItem(item);
    };

    const handleDelete = (item) => {
        setDeleteItem(item);
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;

        setIsDeleting(true);
        try {
            const result = await window.electron.deleteItem(deleteItem.id);
            if (result.success) {
                if (onRefresh) onRefresh();
                setDeleteItem(null);
            } else {
                console.error("Error deleting item:", result.error);
            }
        } catch (error) {
            console.error("Error deleting item:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSave = (savedItem) => {
        if (onRefresh) onRefresh();
        setEditItem(null);
    };

    const columns = [
        {
            header: "Item",
            accessor: "name",
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-1 min-w-0 max-w-[160px]">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-2 h-2 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs truncate">{row.name}</div>
                        <div className="text-xs text-gray-500 truncate">{row.unit || "N/A"}</div>
                    </div>
                </div>
            )
        },
        {
            header: "HSN/SAC",
            accessor: "hsnSacCode",
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-1 min-w-0 max-w-[100px]">
                    <Hash className="w-2 h-2 text-gray-400 flex-shrink-0" />
                    <span className="text-xs truncate font-mono">
                        {row.hsnSacCode || "N/A"}
                    </span>
                </div>
            )
        },
        {
            header: "Description",
            accessor: "description",
            sortable: true,
            cell: (row) => (
                <div className="min-w-0 max-w-[200px]">
                    <span className="text-xs truncate block">
                        {row.description || "No description"}
                    </span>
                </div>
            )
        },
        {
            header: "Rate",
            accessor: "sellingPrice",
            sortable: true,
            sortAccessor: "sellingPrice",
            cell: (row) => (
                <div className="flex items-center gap-1 min-w-0">
                    <DollarSign className="w-2 h-2 text-green-500 flex-shrink-0" />
                    <span className="text-xs font-medium truncate whitespace-nowrap">
                        ₹{parseFloat(row.sellingPrice || 0).toFixed(2)}
                    </span>
                </div>
            )
        },
        {
            header: "Unit",
            accessor: "unit",
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-1 min-w-0">
                    <Ruler className="w-2 h-2 text-gray-400 flex-shrink-0" />
                    <Badge
                        variant="outline"
                        className="text-xs capitalize whitespace-nowrap px-1 py-0"
                    >
                        {(row.unit || "N/A").substring(0, 6)}
                    </Badge>
                </div>
            )
        },
        {
            header: "Status",
            accessor: "status",
            sortable: true,
            cell: (row) => (
                <Badge
                    variant="outline"
                    className="text-xs whitespace-nowrap px-1 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                >
                    Active
                </Badge>
            )
        },
        {
            header: "Actions",
            accessor: "actions",
            sortable: false,
            cell: (row) => (
                <ActionButtons
                    onView={() => handleView(row)}
                    onEdit={() => handleEdit(row)}
                    onDelete={() => handleDelete(row)}
                    viewLabel="View Item Details"
                    editLabel="Edit Item"
                    deleteLabel="Delete Item"
                    showDuplicate={false}
                    showExport={false}
                />
            )
        }
    ];

    return (
        <>
            <BaseTable
                data={data}
                columns={columns}
                title="Item Inventory"
                defaultSort={{ column: "name", direction: "asc" }}
                loading={loading}
            />

            {/* View Item Dialog */}
            <ItemView
                open={!!viewItem}
                onOpenChange={(open) => !open && setViewItem(null)}
                item={viewItem}
            />

            {/* Edit Item Dialog */}
            <ItemForm
                isOpen={!!editItem}
                onClose={() => setEditItem(null)}
                onSave={handleSave}
                editItem={editItem}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={!!deleteItem}
                onOpenChange={(open) => !open && setDeleteItem(null)}
                onConfirm={confirmDelete}
                title="Delete Item"
                description="This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                isLoading={isDeleting}
                itemName={deleteItem?.name}
                itemType="item"
            />
        </>
    );
};

export default ItemTable; 