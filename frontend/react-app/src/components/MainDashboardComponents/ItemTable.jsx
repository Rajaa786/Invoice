import React from 'react';
import { Package, Hash, DollarSign, Ruler } from "lucide-react";
import { Badge } from "../ui/badge";
import { BaseTable } from "../ui/base-table";

const ItemTable = ({ data = [], loading = false }) => {
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
            accessor: "rate",
            sortable: true,
            sortAccessor: "rate",
            cell: (row) => (
                <div className="flex items-center gap-1 min-w-0">
                    <DollarSign className="w-2 h-2 text-green-500 flex-shrink-0" />
                    <span className="text-xs font-medium truncate whitespace-nowrap">
                        ₹{parseFloat(row.rate || 0).toFixed(2)}
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
        }
    ];

    return (
        <BaseTable
            data={data}
            columns={columns}
            title="Item Inventory"
            defaultSort={{ column: "name", direction: "asc" }}
            loading={loading}
        />
    );
};

export default ItemTable; 