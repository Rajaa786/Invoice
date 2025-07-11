import React, { useState } from 'react';
import { Users, Building2, MapPin } from "lucide-react";
import { Badge } from "../ui/badge";
import { BaseTable } from "../ui/base-table";
import { ActionButtons } from "../ui/action-buttons";
import { ConfirmationDialog } from "../ui/confirmation-dialog";
import CustomerView from "../Elements/CustomerView";
import CustomerForm from "../Elements/CustomerForm";

const CustomerTable = ({ data = [], loading = false, onRefresh }) => {
    const [viewCustomer, setViewCustomer] = useState(null);
    const [editCustomer, setEditCustomer] = useState(null);
    const [deleteCustomer, setDeleteCustomer] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = (customer) => {
        setViewCustomer(customer);
    };

    const handleEdit = (customer) => {
        setEditCustomer(customer);
    };

    const handleDelete = (customer) => {
        setDeleteCustomer(customer);
    };

    const confirmDelete = async () => {
        if (!deleteCustomer) return;

        setIsDeleting(true);
        try {
            const result = await window.electron.deleteCustomer(deleteCustomer.id);
            if (result.success) {
                if (onRefresh) onRefresh();
                setDeleteCustomer(null);
            } else {
                console.error("Error deleting customer:", result.error);
            }
        } catch (error) {
            console.error("Error deleting customer:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSave = (savedCustomer) => {
        if (onRefresh) onRefresh();
        setEditCustomer(null);
    };

    const getCustomerDisplayName = (customer) => {
        if (customer.companyName) return customer.companyName;
        return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A';
    };

    const columns = [
        {
            header: "Customer",
            accessor: "firstName",
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-1 min-w-0 max-w-[160px]">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${row.customerType === "Business" ? "bg-blue-100" : "bg-purple-100"
                        }`}>
                        {row.customerType === "Business" ? (
                            <Building2 className="w-2 h-2 text-blue-600" />
                        ) : (
                            <Users className="w-2 h-2 text-purple-600" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs truncate">
                            {`${row.firstName || ''} ${row.lastName || ''}`.trim() || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 truncate capitalize">{row.customerType}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Type",
            accessor: "customerType",
            sortable: true,
            cell: (row) => (
                <Badge
                    variant="outline"
                    className="text-xs capitalize whitespace-nowrap px-1 py-0"
                >
                    {(row.customerType || "Individual").substring(0, 8)}
                </Badge>
            )
        },
        {
            header: "Contact",
            accessor: "billingEmail",
            sortable: true,
            cell: (row) => (
                <div className="space-y-1 min-w-0 max-w-[140px]">
                    <div className="text-xs truncate">{row.billingEmail || "N/A"}</div>
                    <div className="text-xs text-gray-500 truncate">{row.billingContactNo || "N/A"}</div>
                </div>
            )
        },
        {
            header: "Location",
            accessor: "billingState",
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-1 min-w-0 max-w-[100px]">
                    <MapPin className="w-2 h-2 text-gray-400 flex-shrink-0" />
                    <span className="text-xs truncate">
                        {row.billingCity && row.billingState
                            ? `${row.billingCity}, ${row.billingState}`
                            : 'N/A'
                        }
                    </span>
                </div>
            )
        },
        {
            header: "GST",
            accessor: "gstApplicable",
            sortable: true,
            cell: (row) => (
                <div className="space-y-1">
                    <Badge
                        variant={row.gstApplicable === "Yes" ? "default" : "secondary"}
                        className={`text-xs whitespace-nowrap px-1 py-0 ${row.gstApplicable === "Yes"
                            ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                            : ""
                            }`}
                    >
                        {row.gstApplicable === "Yes" ? "GST" : "No"}
                    </Badge>
                    {row.gstApplicable === "Yes" && row.gstin && (
                        <div className="text-xs text-gray-500 font-mono truncate max-w-[80px]">
                            {row.gstin.substring(0, 8)}...
                        </div>
                    )}
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
                    viewLabel="View Customer Details"
                    editLabel="Edit Customer"
                    deleteLabel="Delete Customer"
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
                title="Customer Directory"
                rowColorAccessor="rowClassName"
                defaultSort={{ column: "companyName", direction: "asc" }}
                loading={loading}
            />

            {/* View Customer Dialog */}
            <CustomerView
                open={!!viewCustomer}
                onOpenChange={(open) => !open && setViewCustomer(null)}
                customer={viewCustomer}
            />

            {/* Edit Customer Dialog */}
            <CustomerForm
                open={!!editCustomer}
                onOpenChange={(open) => !open && setEditCustomer(null)}
                onSave={handleSave}
                editCustomer={editCustomer}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={!!deleteCustomer}
                onOpenChange={(open) => !open && setDeleteCustomer(null)}
                onConfirm={confirmDelete}
                title="Delete Customer"
                description="This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                isLoading={isDeleting}
                itemName={deleteCustomer ? getCustomerDisplayName(deleteCustomer) : ""}
                itemType="customer"
            />
        </>
    );
};

export default CustomerTable; 