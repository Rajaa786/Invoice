import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

const mockTaxData = [
    { month: "Jan", cgst: 2000, sgst: 2000, igst: 1000 },
    { month: "Feb", cgst: 2500, sgst: 2500, igst: 1200 },
    { month: "Mar", cgst: 3000, sgst: 3000, igst: 1500 },
    { month: "Apr", cgst: 2200, sgst: 2200, igst: 1100 },
];

export default function TaxLiabilityReport() {
    return (
        <div className="bg-white rounded shadow p-4 h-64 flex flex-col">
            <span className="font-semibold text-sm mb-2">Tax Liability Report</span>
            <div className="flex-1 flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-2/3 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockTaxData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="cgst" stackId="a" fill="#3b82f6" name="CGST" />
                            <Bar dataKey="sgst" stackId="a" fill="#22c55e" name="SGST" />
                            <Bar dataKey="igst" stackId="a" fill="#f59e42" name="IGST" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/3 overflow-auto">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr>
                                <th className="px-2 py-1 text-left">Month</th>
                                <th className="px-2 py-1 text-left">CGST</th>
                                <th className="px-2 py-1 text-left">SGST</th>
                                <th className="px-2 py-1 text-left">IGST</th>
                                <th className="px-2 py-1 text-left">Total Tax</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockTaxData.map((row, i) => (
                                <tr key={i} className="even:bg-gray-50">
                                    <td className="px-2 py-1 font-medium">{row.month}</td>
                                    <td className="px-2 py-1">₹{row.cgst.toLocaleString()}</td>
                                    <td className="px-2 py-1">₹{row.sgst.toLocaleString()}</td>
                                    <td className="px-2 py-1">₹{row.igst.toLocaleString()}</td>
                                    <td className="px-2 py-1 font-semibold">₹{(row.cgst + row.sgst + row.igst).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 