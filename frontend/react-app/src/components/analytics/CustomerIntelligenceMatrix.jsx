import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    BarChart,
    Bar,
    Legend
} from "recharts";
import {
    Users,
    Star,
    TrendingUp,
    AlertTriangle,
    Heart,
    DollarSign,
    Calendar,
    Target,
    Crown,
    Zap
} from "lucide-react";
import { motion } from "framer-motion";

const CustomerIntelligenceMatrix = () => {
    const [selectedView, setSelectedView] = useState("matrix");
    const [customerData, setCustomerData] = useState([]);

    // Mock customer intelligence data
    const mockCustomerData = [
        {
            id: 1,
            name: "Tech Solutions Ltd",
            revenue: 2500000,
            frequency: 24,
            avgOrderValue: 104167,
            paymentScore: 95,
            growthRate: 45,
            riskLevel: "low",
            segment: "Champion",
            ltv: 5200000,
            satisfaction: 4.8,
            lastOrder: "2024-01-15",
            predictedChurn: 5,
            recommendedAction: "Upsell premium services"
        },
        {
            id: 2,
            name: "ABC Manufacturing",
            revenue: 1800000,
            frequency: 18,
            avgOrderValue: 100000,
            paymentScore: 78,
            growthRate: 12,
            riskLevel: "medium",
            segment: "Loyal",
            ltv: 3600000,
            satisfaction: 4.2,
            lastOrder: "2024-01-10",
            predictedChurn: 15,
            recommendedAction: "Improve service quality"
        },
        {
            id: 3,
            name: "StartupCo",
            revenue: 450000,
            frequency: 12,
            avgOrderValue: 37500,
            paymentScore: 85,
            growthRate: 78,
            riskLevel: "low",
            segment: "Rising Star",
            ltv: 1200000,
            satisfaction: 4.6,
            lastOrder: "2024-01-20",
            predictedChurn: 8,
            recommendedAction: "Nurture relationship"
        },
        {
            id: 4,
            name: "Legacy Corp",
            revenue: 3200000,
            frequency: 8,
            avgOrderValue: 400000,
            paymentScore: 65,
            growthRate: -5,
            riskLevel: "high",
            segment: "At Risk",
            ltv: 2800000,
            satisfaction: 3.1,
            lastOrder: "2023-12-05",
            predictedChurn: 65,
            recommendedAction: "Urgent intervention needed"
        },
        {
            id: 5,
            name: "Growth Industries",
            revenue: 980000,
            frequency: 15,
            avgOrderValue: 65333,
            paymentScore: 88,
            growthRate: 35,
            riskLevel: "low",
            segment: "Potential",
            ltv: 2100000,
            satisfaction: 4.4,
            lastOrder: "2024-01-18",
            predictedChurn: 12,
            recommendedAction: "Expand service offerings"
        }
    ];

    const segmentColors = {
        "Champion": "#10b981",
        "Loyal": "#3b82f6",
        "Rising Star": "#f59e0b",
        "Potential": "#8b5cf6",
        "At Risk": "#ef4444"
    };

    const segmentStats = [
        { segment: "Champion", count: 1, revenue: 2500000, color: "#10b981" },
        { segment: "Loyal", count: 1, revenue: 1800000, color: "#3b82f6" },
        { segment: "Rising Star", count: 1, revenue: 450000, color: "#f59e0b" },
        { segment: "Potential", count: 1, revenue: 980000, color: "#8b5cf6" },
        { segment: "At Risk", count: 1, revenue: 3200000, color: "#ef4444" }
    ];

    useEffect(() => {
        setCustomerData(mockCustomerData);
    }, []);

    const formatCurrency = (value) => {
        return `₹${(value / 100000).toFixed(1)}L`;
    };

    const getSegmentIcon = (segment) => {
        switch (segment) {
            case 'Champion': return Crown;
            case 'Loyal': return Heart;
            case 'Rising Star': return Star;
            case 'Potential': return Target;
            case 'At Risk': return AlertTriangle;
            default: return Users;
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm">Revenue: {formatCurrency(data.revenue)}</p>
                    <p className="text-sm">Orders: {data.frequency}</p>
                    <p className="text-sm">Segment: {data.segment}</p>
                    <p className="text-sm">Churn Risk: {data.predictedChurn}%</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            Customer Intelligence Matrix
                            <Badge variant="secondary" className="ml-2">
                                <Zap className="h-3 w-3 mr-1" />
                                AI-Powered
                            </Badge>
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant={selectedView === "matrix" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedView("matrix")}
                            >
                                Matrix View
                            </Button>
                            <Button
                                variant={selectedView === "segments" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedView("segments")}
                            >
                                Segments
                            </Button>
                            <Button
                                variant={selectedView === "insights" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedView("insights")}
                            >
                                AI Insights
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-4">
                        <TabsContent value="matrix" className="space-y-4">
                            {/* Customer Matrix Scatter Plot */}
                            <div className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart data={customerData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="revenue"
                                            name="Revenue"
                                            tickFormatter={formatCurrency}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            dataKey="frequency"
                                            name="Order Frequency"
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Scatter dataKey="frequency">
                                            {customerData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={segmentColors[entry.segment]}
                                                />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Customer Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {customerData.map((customer, index) => {
                                    const IconComponent = getSegmentIcon(customer.segment);
                                    return (
                                        <motion.div
                                            key={customer.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="p-2 rounded-lg"
                                                        style={{ backgroundColor: `${segmentColors[customer.segment]}20` }}
                                                    >
                                                        <IconComponent
                                                            className="h-4 w-4"
                                                            style={{ color: segmentColors[customer.segment] }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-sm">{customer.name}</h3>
                                                        <Badge
                                                            className="text-xs mt-1"
                                                            style={{
                                                                backgroundColor: `${segmentColors[customer.segment]}20`,
                                                                color: segmentColors[customer.segment]
                                                            }}
                                                        >
                                                            {customer.segment}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Badge className={getRiskColor(customer.riskLevel)} size="sm">
                                                    {customer.riskLevel}
                                                </Badge>
                                            </div>

                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Revenue:</span>
                                                    <span className="font-medium">{formatCurrency(customer.revenue)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">LTV:</span>
                                                    <span className="font-medium">{formatCurrency(customer.ltv)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Churn Risk:</span>
                                                    <span className="font-medium">{customer.predictedChurn}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Growth:</span>
                                                    <span className={`font-medium ${customer.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {customer.growthRate > 0 ? '+' : ''}{customer.growthRate}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t">
                                                <p className="text-xs text-gray-600 mb-2">Recommended Action:</p>
                                                <p className="text-xs font-medium">{customer.recommendedAction}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </TabsContent>

                        <TabsContent value="segments" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Segment Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Segment Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={segmentStats}
                                                        dataKey="count"
                                                        nameKey="segment"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={80}
                                                        label={({ segment, count }) => `${segment} (${count})`}
                                                    >
                                                        {segmentStats.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Revenue by Segment */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Revenue by Segment</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={segmentStats}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="segment" tick={{ fontSize: 12 }} />
                                                    <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                                                    <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                                                    <Bar dataKey="revenue">
                                                        {segmentStats.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="insights" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Key Insights */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                            Key Insights
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-sm text-green-800">
                                                    <strong>Growth Opportunity:</strong> StartupCo shows 78% growth rate.
                                                    Perfect candidate for expanded service offerings.
                                                </p>
                                            </div>
                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm text-blue-800">
                                                    <strong>Retention Focus:</strong> Tech Solutions Ltd is your top performer.
                                                    Consider exclusive partnership benefits.
                                                </p>
                                            </div>
                                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                <p className="text-sm text-yellow-800">
                                                    <strong>Revenue Potential:</strong> ABC Manufacturing has potential for
                                                    25% revenue increase with improved service quality.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Risk Alerts */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                            Risk Alerts
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                                <p className="text-sm text-red-800">
                                                    <strong>High Churn Risk:</strong> Legacy Corp (65% churn probability).
                                                    Immediate intervention required.
                                                </p>
                                            </div>
                                            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                                <p className="text-sm text-orange-800">
                                                    <strong>Payment Delays:</strong> ABC Manufacturing showing payment
                                                    score decline. Monitor closely.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default CustomerIntelligenceMatrix; 