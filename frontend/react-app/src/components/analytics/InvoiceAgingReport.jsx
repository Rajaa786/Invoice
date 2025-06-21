import React from "react";

const mockAgingData = [
    { bucket: "0–30 days", invoices: 8, total: 12000 },
    { bucket: "31–60 days", invoices: 4, total: 8000 },
    { bucket: "61–90 days", invoices: 2, total: 4000 },
    { bucket: "90+ days", invoices: 1, total: 2000 },
];

const maxTotal = Math.max(...mockAgingData.map(row => row.total));

export default function InvoiceAgingReport() {
    return (
        <div className="bg-white rounded shadow p-4 h-64 flex flex-col">
            <span className="font-semibold text-sm mb-2">Invoice Aging Report</span>
            <div className="overflow-auto flex-1">
                <table className="min-w-full text-xs">
                    <thead>
                        <tr>
                            <th className="px-2 py-1 text-left">Aging Bucket</th>
                            <th className="px-2 py-1 text-left">No. of Invoices</th>
                            <th className="px-2 py-1 text-left">Total Amount (₹)</th>
                            <th className="px-2 py-1 text-left">Visualization</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockAgingData.map((row, i) => (
                            <tr key={i} className="even:bg-gray-50">
                                <td className="px-2 py-1 font-medium">{row.bucket}</td>
                                <td className="px-2 py-1">{row.invoices}</td>
                                <td className="px-2 py-1">₹{row.total.toLocaleString()}</td>
                                <td className="px-2 py-1">
                                    <div className="bg-blue-100 h-3 rounded">
                                        <div
                                            className="bg-blue-500 h-3 rounded"
                                            style={{ width: `${(row.total / maxTotal) * 100}%` }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 