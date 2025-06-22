import React from "react";

const exportOptions = [
    { label: "Export Invoice Summary", onClick: () => alert("Export Invoice Summary") },
    { label: "Export Tax Summary", onClick: () => alert("Export Tax Summary") },
    { label: "Export Customer Ledger", onClick: () => alert("Export Customer Ledger") },
    { label: "Export Aging Report", onClick: () => alert("Export Aging Report") },
];

export default function ExportButtons() {
    return (
        <div className="flex gap-4">
            {exportOptions.map((opt, i) => (
                <button
                    key={i}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    onClick={opt.onClick}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
} 