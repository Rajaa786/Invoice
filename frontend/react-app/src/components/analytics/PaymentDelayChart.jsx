import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const mockDSOData = [
    { month: "Jan", dso: 18 },
    { month: "Feb", dso: 20 },
    { month: "Mar", dso: 15 },
    { month: "Apr", dso: 22 },
];

const mockCustomers = [
    { customer: "Acme Corp", dso: 25 },
    { customer: "Beta Ltd", dso: 22 },
    { customer: "Gamma Inc", dso: 20 },
];

export default function PaymentDelayChart() {
    return (
        <div className="bg-white rounded shadow p-4 h-64 flex flex-col">
            <span className="font-semibold text-sm mb-2">Payment Delay / DSO Chart</span>
            <div className="flex-1 flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-2/3 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockDSOData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={v => `${v} days`} />
                            <Legend />
                            <Line type="monotone" dataKey="dso" stroke="#3b82f6" name="Avg. Days to Payment" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/3 overflow-auto">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr>
                                <th className="px-2 py-1 text-left">Customer</th>
                                <th className="px-2 py-1 text-left">Avg. Days to Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockCustomers.map((row, i) => (
                                <tr key={i} className="even:bg-gray-50">
                                    <td className="px-2 py-1 font-medium">{row.customer}</td>
                                    <td className="px-2 py-1">{row.dso}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 