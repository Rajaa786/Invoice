import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e42"];

export default function CompanySplit() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        window.electron?.analytics?.getCompanySplit()?.then((res) => {
            if (mounted) {
                setData(Array.isArray(res) ? res : []);
                setLoading(false);
            }
        }).catch(() => setLoading(false));
        return () => { mounted = false; };
    }, []);

    if (loading) {
        return <div className="bg-white rounded shadow p-4 min-h-[320px] flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="bg-white rounded shadow p-4 min-h-[320px] flex flex-col">
            <span className="font-semibold text-sm mb-2">Company-wise Revenue Split</span>
            <div className="flex-1 flex flex-col md:flex-row gap-4 items-stretch">
                <div className="w-full md:w-1/2 flex items-center justify-center min-h-[220px]">
                    <div className="w-full h-56 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="revenue"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={60}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="w-full md:w-1/2 overflow-auto flex items-center">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr>
                                <th className="px-2 py-1 text-left">Company</th>
                                <th className="px-2 py-1 text-left">No. of Invoices</th>
                                <th className="px-2 py-1 text-left">Total Billed (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((company, i) => (
                                <tr key={i} className="even:bg-gray-50">
                                    <td className="px-2 py-1 font-medium">{company.name}</td>
                                    <td className="px-2 py-1">{company.invoices}</td>
                                    <td className="px-2 py-1">₹{company.revenue.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 