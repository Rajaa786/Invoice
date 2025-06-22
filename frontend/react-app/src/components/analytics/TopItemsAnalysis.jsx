import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const mockItems = [
    { name: "Item A", quantity: 120, revenue: 24000, avgRate: 200, hsn: "1001" },
    { name: "Item B", quantity: 80, revenue: 16000, avgRate: 200, hsn: "1002" },
    { name: "Item C", quantity: 60, revenue: 12000, avgRate: 200, hsn: "1003" },
    { name: "Item D", quantity: 40, revenue: 8000, avgRate: 200, hsn: "1004" },
];

export default function TopItemsAnalysis() {
    return (
        <div className="bg-white rounded shadow p-4 h-64 flex flex-col">
            <span className="font-semibold text-sm mb-2">Top Items Analysis</span>
            <div className="flex-1 flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-2/3 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockItems} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (₹)" />
                            <Bar dataKey="quantity" fill="#22c55e" name="Quantity Sold" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/3 overflow-auto">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr>
                                <th className="px-2 py-1 text-left">Item Name</th>
                                <th className="px-2 py-1 text-left">Quantity</th>
                                <th className="px-2 py-1 text-left">Revenue (₹)</th>
                                <th className="px-2 py-1 text-left">Avg. Rate</th>
                                <th className="px-2 py-1 text-left">HSN Code</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockItems.map((item, i) => (
                                <tr key={i} className="even:bg-gray-50">
                                    <td className="px-2 py-1 font-medium">{item.name}</td>
                                    <td className="px-2 py-1">{item.quantity}</td>
                                    <td className="px-2 py-1">₹{item.revenue.toLocaleString()}</td>
                                    <td className="px-2 py-1">{item.avgRate}</td>
                                    <td className="px-2 py-1">{item.hsn}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 