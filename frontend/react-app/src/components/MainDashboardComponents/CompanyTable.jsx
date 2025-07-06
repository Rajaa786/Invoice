import React, { useState } from 'react';
import { Building2, TrendingUp, Users, MapPin } from "lucide-react";
import { Badge } from "../ui/badge";
import { BaseTable } from "../ui/base-table";
import { ActionButtons } from "../ui/action-buttons";
import { ConfirmationDialog } from "../ui/confirmation-dialog";
import CompanyView from "../Elements/CompanyView";
import CompanyForm from "../Elements/CompanyForm";

const CompanyTable = ({ data = [], loading = false, onRefresh }) => {
    const [viewCompany, setViewCompany] = useState(null);
    const [editCompany, setEditCompany] = useState(null);
    const [deleteCompany, setDeleteCompany] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = (company) => {
        setViewCompany(company);
    };

    const handleEdit = (company) => {
        setEditCompany(company);
    };

    const handleDelete = (company) => {
        setDeleteCompany(company);
    };

    const confirmDelete = async () => {
        if (!deleteCompany) return;

        setIsDeleting(true);
        try {
            const result = await window.electron.deleteCompany(deleteCompany.id);
            if (result.success) {
                if (onRefresh) onRefresh();
                setDeleteCompany(null);
            } else {
                console.error("Error deleting company:", result.error);
            }
        } catch (error) {
            console.error("Error deleting company:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSave = (savedCompany) => {
        if (onRefresh) onRefresh();
        setEditCompany(null);
    };

    const columns = [
        {
            header: "Company",
            accessor: "companyName",
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-1 min-w-0 max-w-[160px]">
                    {row.logoPath ? (
                        <img
                            src={row.logoPath}
                            alt="Logo"
                            className="w-5 h-5 rounded-full object-cover border flex-shrink-0"
                        />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-2 h-2 text-blue-600" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs truncate">{row.companyName}</div>
                        <div className="text-xs text-gray-500 truncate capitalize">{row.companyType}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Industry",
            accessor: "industry",
            sortable: true,
            cell: (row) => (
                <Badge variant="outline" className="text-xs capitalize whitespace-nowrap px-1 py-0">
                    {(row.industry || row.companyType).substring(0, 8)}
                </Badge>
            )
        },
        {
            header: "Location",
            accessor: "state",
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-1 min-w-0 max-w-[100px]">
                    <MapPin className="w-2 h-2 text-gray-400 flex-shrink-0" />
                    <span className="text-xs truncate">{row.city}, {row.state}</span>
                </div>
            )
        },
        {
            header: "Contact",
            accessor: "email",
            sortable: true,
            cell: (row) => (
                <div className="space-y-1 min-w-0 max-w-[140px]">
                    <div className="text-xs truncate">{row.email}</div>
                    <div className="text-xs text-gray-500 truncate">{row.contactNo}</div>
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
            header: "Size",
            accessor: "companySize",
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-1 min-w-0">
                    <Users className="w-2 h-2 text-gray-400 flex-shrink-0" />
                    <span className="text-xs capitalize truncate whitespace-nowrap">
                        {(row.companySize || row.businessModel || "N/A").substring(0, 6)}
                    </span>
                </div>
            )
        },
        {
            header: "Revenue",
            accessor: "annualRevenue",
            sortable: true,
            sortAccessor: "annualRevenue",
            cell: (row) => (
                <div className="flex items-center gap-1 min-w-0">
                    <TrendingUp className="w-2 h-2 text-green-500 flex-shrink-0" />
                    <span className="text-xs font-medium truncate whitespace-nowrap">
                        {row.annualRevenue ? `₹${(row.annualRevenue / 100000).toFixed(0)}L` : "N/A"}
                    </span>
                </div>
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
                    viewLabel="View Company Details"
                    editLabel="Edit Company"
                    deleteLabel="Delete Company"
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
                title="Company Directory"
                rowColorAccessor="rowClassName"
                defaultSort={{ column: "companyName", direction: "asc" }}
                loading={loading}
            />

            {/* View Company Dialog */}
            <CompanyView
                open={!!viewCompany}
                onOpenChange={(open) => !open && setViewCompany(null)}
                company={viewCompany}
            />

            {/* Edit Company Dialog */}
            {editCompany && (
                <CompanyForm
                    open={!!editCompany}
                    onOpenChange={(open) => !open && setEditCompany(null)}
                    onSave={handleSave}
                    editCompany={editCompany}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={!!deleteCompany}
                onOpenChange={(open) => !open && setDeleteCompany(null)}
                onConfirm={confirmDelete}
                title="Delete Company"
                description="This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                isLoading={isDeleting}
                itemName={deleteCompany?.companyName}
                itemType="company"
            />
        </>
    );
};

export default CompanyTable; 