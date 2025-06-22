import React, { useState } from "react";

const companyOptions = [
    { value: "company1", label: "Company 1" },
    { value: "company2", label: "Company 2" },
];

const customerOptions = [
    { value: "customer1", label: "Customer 1" },
    { value: "customer2", label: "Customer 2" },
];

const statusOptions = [
    { value: "paid", label: "Paid" },
    { value: "unpaid", label: "Unpaid" },
    { value: "overdue", label: "Overdue" },
    { value: "draft", label: "Draft" },
];

export default function FiltersBar({ onChange, onReset }) {
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [company, setCompany] = useState("");
    const [customer, setCustomer] = useState("");
    const [status, setStatus] = useState("");

    const handleReset = () => {
        setDateRange({ from: "", to: "" });
        setCompany("");
        setCustomer("");
        setStatus("");
        if (onReset) onReset();
    };

    // Call onChange when any filter changes (to be implemented later)

    return (
        <div className="flex flex-wrap gap-4 items-end bg-white p-4 rounded shadow">
            {/* Date Range Picker (placeholder) */}
            <div>
                <label className="block text-xs font-semibold mb-1">Invoice Date</label>
                <div className="flex gap-2">
                    <input
                        type="date"
                        className="border rounded px-2 py-1"
                        value={dateRange.from}
                        onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
                    />
                    <span className="mx-1">to</span>
                    <input
                        type="date"
                        className="border rounded px-2 py-1"
                        value={dateRange.to}
                        onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
                    />
                </div>
            </div>
            {/* Company Dropdown */}
            <div>
                <label className="block text-xs font-semibold mb-1">Company</label>
                <select
                    className="border rounded px-2 py-1"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                >
                    <option value="">All</option>
                    {companyOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            {/* Customer Dropdown */}
            <div>
                <label className="block text-xs font-semibold mb-1">Customer</label>
                <select
                    className="border rounded px-2 py-1"
                    value={customer}
                    onChange={e => setCustomer(e.target.value)}
                >
                    <option value="">All</option>
                    {customerOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            {/* Invoice Status Dropdown */}
            <div>
                <label className="block text-xs font-semibold mb-1">Invoice Status</label>
                <select
                    className="border rounded px-2 py-1"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                >
                    <option value="">All</option>
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            {/* Reset Filters Button */}
            <button
                className="ml-auto px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={handleReset}
            >
                Reset Filters
            </button>
        </div>
    );
} 