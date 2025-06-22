import React from "react";
import FiltersBar from "./FiltersBar";
import SummaryMetrics from "./SummaryMetrics";
import RevenueOverTimeChart from "./RevenueOverTimeChart";
import InvoiceStatusPie from "./InvoiceStatusPie";
import CustomerRevenueTable from "./CustomerRevenueTable";
import TopItemsAnalysis from "./TopItemsAnalysis";
import CompanySplit from "./CompanySplit";
import TaxLiabilityReport from "./TaxLiabilityReport";
import InvoiceAgingReport from "./InvoiceAgingReport";
import PaymentDelayChart from "./PaymentDelayChart";
import ExportButtons from "./ExportButtons";
import SmartAlerts from "./SmartAlerts";

export default function InvoiceAnalyticsPage() {
    return (
        <div className="p-6 space-y-8">
            {/* 1. Filters Section (Top Bar) */}
            <div><FiltersBar /></div>

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
            <ExportButtons />

            {/* 12. Smart Alerts */}
            <SmartAlerts />
        </div>
    );
} 