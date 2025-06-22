import React from "react";

const mockMetrics = [
    { title: "Total Invoiced", value: "₹1,20,000" },
    { title: "Total Received", value: "₹90,000" },
    { title: "Pending Payments", value: "₹30,000" },
    { title: "Overdue Amount", value: "₹10,000" },
    { title: "Total Invoices Count", value: "24" },
    { title: "Avg. Invoice Value", value: "₹5,000" },
];

export default function SummaryMetrics() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockMetrics.map((metric) => (
                <div
                    key={metric.title}
                    className="bg-white rounded shadow p-4 flex flex-col items-center justify-center min-h-[90px]"
                >
                    <div className="text-xs text-gray-500 font-semibold mb-1 text-center">{metric.title}</div>
                    <div className="text-xl font-bold text-gray-800 text-center">{metric.value}</div>
                </div>
            ))}
        </div>
    );
} 