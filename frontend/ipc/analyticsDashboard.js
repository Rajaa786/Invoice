const { ipcMain } = require("electron");

// This would be replaced with real DB queries
const mockCompanies = [
    { name: "CypherSol Pvt Ltd", revenue: 80000, invoices: 12 },
    { name: "Beta Solutions", revenue: 40000, invoices: 7 },
    { name: "Gamma Tech", revenue: 20000, invoices: 5 },
];

function registerAnalyticsDashboardIpc() {
    ipcMain.handle("analytics:getCompanySplit", async (event) => {
        // Replace with real DB aggregation logic
        return mockCompanies;
    });
    // Add more analytics handlers here as needed
}

module.exports = { registerAnalyticsDashboardIpc }; 