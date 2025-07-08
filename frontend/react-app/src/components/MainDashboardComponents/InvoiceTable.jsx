import React from 'react';
import { AlertTriangle, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { BaseTable } from "../ui/base-table";

// Status configuration for invoices
const INVOICE_STATUS = {
    OVERDUE: {
        label: "Overdue",
        color: "destructive",
        bgColor: "bg-red-50 border-red-200",
        textColor: "text-red-800",
        icon: AlertTriangle,
        priority: 1
    },
    DUE_SOON: {
        label: "Due Soon",
        color: "warning",
        bgColor: "bg-yellow-50 border-yellow-200",
        textColor: "text-yellow-800",
        icon: Clock,
        priority: 2
    },
    PENDING: {
        label: "Pending",
        color: "secondary",
        bgColor: "bg-blue-50 border-blue-200",
        textColor: "text-blue-800",
        icon: AlertCircle,
        priority: 3
    },
    PAID: {
        label: "Paid",
        color: "success",
        bgColor: "bg-green-50 border-green-200",
        textColor: "text-green-800",
        icon: CheckCircle,
        priority: 4
    },
};

// Status badge component
const StatusBadge = ({ status, daysUntilDue }) => {
    const statusConfig = INVOICE_STATUS[status];
    const Icon = statusConfig.icon;

    return (
        <div className="flex items-center gap-2">
            <Badge variant={statusConfig.color} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {statusConfig.label}
            </Badge>
            <span className={`text-xs font-medium ${daysUntilDue < 0 ? 'text-red-600' :
                daysUntilDue <= 7 ? 'text-yellow-600' :
                    'text-gray-600'
                }`}>
                {daysUntilDue < 0
                    ? `${Math.abs(daysUntilDue)} days overdue`
                    : daysUntilDue === 0
                        ? 'Due today'
                        : `${daysUntilDue} days left`
                }
            </span>
        </div>
    );
};

const InvoiceTable = ({ data = [], loading = false }) => {
    const columns = [
        {
            header: "Invoice No.",
            accessor: "invoiceNo",
            sortable: true,
            cell: (row) => (
                <span className="font-medium text-blue-600">{row.invoiceNo}</span>
            )
        },
        {
            header: "Customer",
            accessor: "customerName",
            sortable: true,
            cell: (row) => (
                <span className="font-medium">
                    {row.customerName || "Unknown Customer"}
                </span>
            )
        },
        {
            header: "Invoice Date",
            accessor: "invoiceDate",
            sortable: true
        },
        {
            header: "Due Date",
            accessor: "dueDate",
            sortable: true
        },
        {
            header: "Amount",
            accessor: "amount",
            sortable: true,
            sortAccessor: "amount",
            cell: (row) => (
                <span className="font-semibold">{row.formattedAmount}</span>
            )
        },
        {
            header: "Status",
            accessor: "status",
            cell: (row) => <StatusBadge status={row.status} daysUntilDue={row.daysUntilDue} />
        },
    ];

    return (
        <BaseTable
            data={data}
            columns={columns}
            title="Recent Invoices"
            rowColorAccessor="rowClassName"
            defaultSort={{ column: "priority", direction: "asc" }}
            loading={loading}
        />
    );
};

export default InvoiceTable; 