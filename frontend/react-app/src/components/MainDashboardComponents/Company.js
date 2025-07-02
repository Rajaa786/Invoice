import React, { useState, useEffect } from "react";
import { Plus, Building2, TrendingUp, Users } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import CompanyTable from "./CompanyTable";
import CompanyForm from "../Elements/CompanyForm";

const Company = () => {
  const [companyData, setCompanyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [companyStats, setCompanyStats] = useState({
    total: 0,
    withGST: 0,
    industries: 0,
    avgRevenue: 0
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await window.electron.getCompany();
      console.log("Companies API response:", response);

      if (response.success) {
        const companiesData = response.companies || [];

        // Enhanced data processing
        const processedCompanies = companiesData.map((company) => ({
          ...company,
          id: company.id,
          companyName: company.companyName || "",
          companyType: company.companyType || "",
          industry: company.industry || company.companyType,
          email: company.email || "",
          contactNo: company.contactNo || "",
          gstApplicable: company.gstApplicable || "No",
          gstin: company.gstin || "",
          state: company.state || "",
          city: company.city || "",
          companySize: company.companySize || "",
          businessModel: company.businessModel || "",
          annualRevenue: company.annualRevenue || 0,
          logoPath: company.logoPath || null,
          // Add row styling based on GST status
          rowClassName: company.gstApplicable === "Yes" ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
        }));

        // Calculate statistics
        const stats = {
          total: processedCompanies.length,
          withGST: processedCompanies.filter(c => c.gstApplicable === "Yes").length,
          industries: [...new Set(processedCompanies.map(c => c.industry).filter(Boolean))].length,
          avgRevenue: processedCompanies.length > 0
            ? processedCompanies.reduce((sum, c) => sum + (c.annualRevenue || 0), 0) / processedCompanies.length
            : 0
        };

        setCompanyStats(stats);
        setCompanyData(processedCompanies);
      } else {
        console.error("Failed to fetch companies:", response.error);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    try {
      // Refresh the companies list after saving
      await fetchCompanies();
      setCompanyFormOpen(false);
    } catch (error) {
      console.error("Error saving company:", error);
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-black overflow-hidden">
      {/* Header with Statistics - Fixed height container */}
      <div className="px-4 py-3 border-b border-gray-200">
        {/* Title and New Company Button */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Companies</h2>
            <p className="text-xs text-muted-foreground">Manage your business entities and partners</p>
          </div>

          <Button
            onClick={() => setCompanyFormOpen(true)}
            className="flex items-center gap-1 text-xs px-3 py-1"
            size="sm"
          >
            <Plus className="h-3 w-3" />
            New Company
          </Button>
        </div>

        {/* Statistics Cards - Responsive grid */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="border-blue-200 p-2">
            <div className="text-xs font-medium text-blue-600 flex items-center gap-1 mb-1">
              <Building2 className="h-3 w-3" />
              Total
            </div>
            <div className="text-sm font-bold text-blue-700">{companyStats.total}</div>
            <p className="text-xs text-blue-600">Companies</p>
          </Card>

          <Card className="border-green-200 p-2">
            <div className="text-xs font-medium text-green-600 flex items-center gap-1 mb-1">
              <Badge className="h-2 w-2 bg-green-500" />
              GST
            </div>
            <div className="text-sm font-bold text-green-700">{companyStats.withGST}</div>
            <p className="text-xs text-green-600">
              {companyStats.total > 0 ? Math.round((companyStats.withGST / companyStats.total) * 100) : 0}%
            </p>
          </Card>

          <Card className="border-purple-200 p-2">
            <div className="text-xs font-medium text-purple-600 flex items-center gap-1 mb-1">
              <Users className="h-3 w-3" />
              Industries
            </div>
            <div className="text-sm font-bold text-purple-700">{companyStats.industries}</div>
            <p className="text-xs text-purple-600">Sectors</p>
          </Card>

          <Card className="border-orange-200 p-2">
            <div className="text-xs font-medium text-orange-600 flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3" />
              Revenue
            </div>
            <div className="text-xs font-bold text-orange-700">
              ₹{(companyStats.avgRevenue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-orange-600">Avg</p>
          </Card>
        </div>
      </div>

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-black rounded-lg m-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CompanyTable data={companyData} loading={isLoading} />
      </div>

      {/* Company Form Dialog */}
      <CompanyForm
        open={companyFormOpen}
        onOpenChange={setCompanyFormOpen}
        onSave={handleSaveCompany}
      />
    </div>
  );
};

export default Company;
