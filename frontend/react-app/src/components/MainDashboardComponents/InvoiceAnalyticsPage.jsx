import React from "react";
import { AnalyticsProvider } from "../../contexts/AnalyticsContext";
import FiltersBar from "../Analytics/FiltersBar";
import SummaryMetrics from "../Analytics/SummaryMetrics";
import RevenueOverTimeChart from "../Analytics/RevenueOverTimeChart";
import InvoiceStatusPie from "../Analytics/InvoiceStatusPie";
import CustomerRevenueTable from "../Analytics/CustomerRevenueTable";
import TopItemsAnalysis from "../Analytics/TopItemsAnalysis";
import CompanySplit from "../Analytics/CompanySplit";
import TaxLiabilityReport from "../Analytics/TaxLiabilityReport";
import InvoiceAgingReport from "../Analytics/InvoiceAgingReport";
import PaymentDelayChart from "../Analytics/PaymentDelayChart";
import ExportButtons from "../Analytics/ExportButtons";
import SmartAlerts from "../Analytics/SmartAlerts";
import AIBusinessIntelligence from "../Analytics/AIBusinessIntelligence";
import CashFlowPredictor from "../Analytics/CashFlowPredictor";
import CustomerMatrix from "../Analytics/CustomerMatrix";

export default function InvoiceAnalyticsPage() {
    return (
        <AnalyticsProvider>
            <div className="p-6 space-y-8">
                {/* 🎯 AI-Powered Business Intelligence Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        🧠 AI Business Intelligence
                    </h2>
                    <AIBusinessIntelligence />
                </div>

                {/* 💰 Advanced Financial Analytics */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        💰 Financial Intelligence
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CashFlowPredictor />
                        <CustomerMatrix />
                    </div>
                </div>

                {/* 📊 Traditional Analytics (Enhanced) */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        📊 Core Analytics
                    </h2>

                    {/* 1. Filters Section (Top Bar) */}
                    <div className="mb-6"><FiltersBar /></div>

                    {/* 2. Summary Metrics Section (Metric Cards) */}
                    <SummaryMetrics />

                    {/* 3. Revenue Over Time Chart */}
                    <RevenueOverTimeChart />

                    {/* 4. Invoice Status Distribution */}
                    <InvoiceStatusPie />

                    {/* 5. Customer-wise Revenue Table */}
                    <CustomerRevenueTable />

                    {/* 6. Top Items Analysis */}
                    <TopItemsAnalysis />

                    {/* 7. Company-wise Split */}
                    <CompanySplit />

                    {/* 8. Tax Liability Report */}
                    <TaxLiabilityReport />

                    {/* 9. Invoice Aging Report */}
                    <InvoiceAgingReport />

                    {/* 10. Payment Delay/DSO Chart */}
                    <PaymentDelayChart />

                    {/* 11. Exports & Reports */}
                    {/* <ExportButtons /> */}

                    {/* 12. Smart Alerts */}
                    <SmartAlerts />
                </div>
            </div>
        </AnalyticsProvider>
    );
} 