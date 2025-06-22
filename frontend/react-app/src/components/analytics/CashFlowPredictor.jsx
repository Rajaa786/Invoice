import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Legend
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Target
} from "lucide-react";
import { motion } from "framer-motion";

const CashFlowPredictor = () => {
    const [selectedPeriod, setSelectedPeriod] = useState("3months");
    const [cashFlowData, setCashFlowData] = useState([]);
    const [predictions, setPredictions] = useState({});

    // Mock cash flow data with predictions
    const mockCashFlowData = {
        "3months": [
            {
                period: "Jan 2024",
                actualInflow: 450000,
                predictedInflow: 470000,
                actualOutflow: 280000,
                predictedOutflow: 290000,
                netCashFlow: 170000,
                predictedNetFlow: 180000,
                confidence: 87
            },
            {
                period: "Feb 2024",
                actualInflow: 520000,
                predictedInflow: 510000,
                actualOutflow: 310000,
                predictedOutflow: 320000,
                netCashFlow: 210000,
                predictedNetFlow: 190000,
                confidence: 84
            },
            {
                period: "Mar 2024",
                actualInflow: null,
                predictedInflow: 580000,
                actualOutflow: null,
                predictedOutflow: 340000,
                netCashFlow: null,
                predictedNetFlow: 240000,
                confidence: 78
            },
            {
                period: "Apr 2024",
                actualInflow: null,
                predictedInflow: 620000,
                actualOutflow: null,
                predictedOutflow: 360000,
                netCashFlow: null,
                predictedNetFlow: 260000,
                confidence: 72
            },
            {
                period: "May 2024",
                actualInflow: null,
                predictedInflow: 680000,
                actualOutflow: null,
                predictedOutflow: 380000,
                netCashFlow: null,
                predictedNetFlow: 300000,
                confidence: 68
            }
        ]
    };

    const mockPredictions = {
        summary: {
            nextMonthFlow: 240000,
            quarterlyGrowth: 15.5,
            riskLevel: "low",
            cashRunway: "12+ months",
            recommendedActions: [
                "Consider expanding operations in Q2",
                "Optimal time for equipment investment",
                "Negotiate better payment terms with suppliers"
            ]
        },
        risks: [
            {
                type: "payment_delay",
                probability: 23,
                impact: 85000,
                description: "Potential delay from major client ABC Corp"
            },
            {
                type: "seasonal_dip",
                probability: 15,
                impact: 120000,
                description: "Historical Q3 revenue decline"
            }
        ]
    };

    useEffect(() => {
        setCashFlowData(mockCashFlowData[selectedPeriod]);
        setPredictions(mockPredictions);
    }, [selectedPeriod]);

    const formatCurrency = (value) => {
        if (!value) return "₹0";
        return `₹${(value / 1000).toFixed(0)}K`;
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'low': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'high': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Cash Flow Predictor
                            <Badge variant="secondary" className="ml-2">AI-Powered</Badge>
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant={selectedPeriod === "3months" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedPeriod("3months")}
                            >
                                3 Months
                            </Button>
                            <Button
                                variant={selectedPeriod === "6months" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedPeriod("6months")}
                            >
                                6 Months
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="forecast" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="forecast">Cash Flow Forecast</TabsTrigger>
                            <TabsTrigger value="insights">Insights & Risks</TabsTrigger>
                            <TabsTrigger value="scenarios">Scenario Planning</TabsTrigger>
                        </TabsList>

                        <TabsContent value="forecast" className="space-y-4">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-800">Next Month</span>
                                    </div>
                                    <div className="text-2xl font-bold text-green-900">
                                        {formatCurrency(predictions.summary?.nextMonthFlow)}
                                    </div>
                                    <div className="text-xs text-green-600">Predicted Net Flow</div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-800">Growth Rate</span>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-900">
                                        +{predictions.summary?.quarterlyGrowth}%
                                    </div>
                                    <div className="text-xs text-blue-600">Quarterly Growth</div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm font-medium text-purple-800">Cash Runway</span>
                                    </div>
                                    <div className="text-2xl font-bold text-purple-900">
                                        {predictions.summary?.cashRunway}
                                    </div>
                                    <div className="text-xs text-purple-600">At Current Burn</div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-4 w-4 text-orange-600" />
                                        <span className="text-sm font-medium text-orange-800">Risk Level</span>
                                    </div>
                                    <div className="text-2xl font-bold text-orange-900 capitalize">
                                        {predictions.summary?.riskLevel}
                                    </div>
                                    <Badge className={getRiskColor(predictions.summary?.riskLevel)} size="sm">
                                        Stable
                                    </Badge>
                                </motion.div>
                            </div>

                            {/* Cash Flow Chart */}
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={cashFlowData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="period"
                                            tick={{ fontSize: 12 }}
                                            stroke="#6b7280"
                                        />
                                        <YAxis
                                            tickFormatter={formatCurrency}
                                            tick={{ fontSize: 12 }}
                                            stroke="#6b7280"
                                        />
                                        <Tooltip
                                            formatter={(value, name) => [formatCurrency(value), name]}
                                            labelStyle={{ color: '#374151' }}
                                            contentStyle={{
                                                backgroundColor: '#f9fafb',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />

                                        {/* Actual data */}
                                        <Area
                                            type="monotone"
                                            dataKey="actualInflow"
                                            stackId="1"
                                            stroke="#10b981"
                                            fill="#10b981"
                                            fillOpacity={0.6}
                                            name="Actual Inflow"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="actualOutflow"
                                            stackId="2"
                                            stroke="#ef4444"
                                            fill="#ef4444"
                                            fillOpacity={0.6}
                                            name="Actual Outflow"
                                        />

                                        {/* Predicted data */}
                                        <Line
                                            type="monotone"
                                            dataKey="predictedInflow"
                                            stroke="#10b981"
                                            strokeDasharray="5 5"
                                            strokeWidth={2}
                                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                            name="Predicted Inflow"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="predictedOutflow"
                                            stroke="#ef4444"
                                            strokeDasharray="5 5"
                                            strokeWidth={2}
                                            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                                            name="Predicted Outflow"
                                        />

                                        {/* Net flow line */}
                                        <Line
                                            type="monotone"
                                            dataKey="predictedNetFlow"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                                            name="Net Cash Flow"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>

                        <TabsContent value="insights" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* AI Recommendations */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            AI Recommendations
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {predictions.summary?.recommendedActions?.map((action, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                                                >
                                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-green-800">{action}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Risk Analysis */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5 text-orange-600" />
                                            Risk Analysis
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {predictions.risks?.map((risk, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-orange-800">
                                                            {risk.description}
                                                        </span>
                                                        <Badge variant="outline" className="text-orange-600">
                                                            {risk.probability}% chance
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-orange-600">
                                                        Potential Impact: {formatCurrency(risk.impact)}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="scenarios" className="space-y-4">
                            <div className="text-center py-8 text-gray-500">
                                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium mb-2">Scenario Planning</h3>
                                <p className="text-sm">
                                    Advanced scenario modeling coming soon.
                                    Test different business scenarios and their impact on cash flow.
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default CashFlowPredictor; 