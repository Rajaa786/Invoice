import React, { useState } from "react";

const mockData = [
    {
        customer: "Acme Corp",
        invoices: 8,
        total: 40000,
        avgPayment: 12,
        overdue: 1,
        outstanding: 5000,
    },
    {
        customer: "Beta Ltd",
        invoices: 5,
        total: 25000,
        avgPayment: 18,
        overdue: 2,
        outstanding: 8000,
    },
    {
        customer: "Gamma Inc",
        invoices: 10,
        total: 60000,
        avgPayment: 10,
        overdue: 0,
        outstanding: 0,
    },
    {
        customer: "Delta LLC",
        invoices: 3,
        total: 12000,
        avgPayment: 25,
        overdue: 1,
        outstanding: 4000,
    },
];

const columns = [
    { key: "customer", label: "Customer Name" },
    { key: "invoices", label: "Number of Invoices" },
    { key: "total", label: "Total Invoiced (₹)" },
    { key: "avgPayment", label: "Avg. Payment Time (days)" },
    { key: "overdue", label: "Overdue Invoices" },
    { key: "outstanding", label: "Outstanding (₹)" },
];

export default function CustomerRevenueTable() {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("total");
    const [sortDir, setSortDir] = useState("desc");

    const filtered = mockData.filter(row =>
        row.customer.toLowerCase().includes(search.toLowerCase())
    );
    const sorted = [...filtered].sort((a, b) => {
        if (sortDir === "asc") return a[sortKey] > b[sortKey] ? 1 : -1;
        return a[sortKey] < b[sortKey] ? 1 : -1;
    });

    return (
        <div className="bg-white rounded shadow p-4 h-80 flex flex-col">
            <div className="flex items-center mb-2">
                <span className="font-semibold text-sm">Customer-wise Revenue</span>
                <input
                    className="ml-auto border rounded px-2 py-1 text-sm"
                    placeholder="Search customer..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="ml-2 px-3 py-1 bg-blue-500 text-white rounded text-xs">Export</button>
            </div>
            <div className="overflow-auto flex-1">
                <table className="min-w-full text-xs">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className="px-2 py-1 text-left cursor-pointer select-none"
                                    onClick={() => {
                                        if (sortKey === col.key) setSortDir(sortDir === "asc" ? "desc" : "asc");
                                        else { setSortKey(col.key); setSortDir("desc"); }
                                    }}
                                >
                                    {col.label}
                                    {sortKey === col.key && (sortDir === "asc" ? " ▲" : " ▼")}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((row, i) => (
                            <tr key={i} className="even:bg-gray-50">
                                <td className="px-2 py-1 font-medium">{row.customer}</td>
                                <td className="px-2 py-1">{row.invoices}</td>
                                <td className="px-2 py-1">₹{row.total.toLocaleString()}</td>
                                <td className="px-2 py-1">{row.avgPayment}</td>
                                <td className="px-2 py-1">{row.overdue}</td>
                                <td className="px-2 py-1">₹{row.outstanding.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 