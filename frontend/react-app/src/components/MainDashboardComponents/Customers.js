import React, { useState, useEffect } from "react";
import { Plus, Users, Building2, TrendingUp, MapPin } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import CustomerTable from "./CustomerTable";
import CustomerForm from "../Elements/CustomerForm";

const Customers = () => {
  const [customerData, setCustomerData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [customerStats, setCustomerStats] = useState({
    total: 0,
    business: 0,
    withGST: 0,
    activeStates: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await window.electron.getCustomer();
      console.log("Customers API response:", response);

      if (response.success) {
        const customersData = response.customers || [];

        // Enhanced data processing
        const processedCustomers = customersData.map((customer) => ({
          ...customer,
          id: customer.id,
          companyName: customer.companyName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
          customerType: customer.customerType || "Individual",
          billingEmail: customer.billingEmail || "",
          billingContactNo: customer.billingContactNo || "",
          gstApplicable: customer.gstApplicable || "No",
          gstin: customer.gstin || "",
          billingState: customer.billingState || "",
          billingCity: customer.billingCity || "",
          firstName: customer.firstName || "",
          lastName: customer.lastName || "",
          // Add row styling based on GST status
          rowClassName: customer.gstApplicable === "Yes" ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
        }));

        // Calculate statistics
        const stats = {
          total: processedCustomers.length,
          business: processedCustomers.filter(c => c.customerType === "Business").length,
          withGST: processedCustomers.filter(c => c.gstApplicable === "Yes").length,
          activeStates: [...new Set(processedCustomers.map(c => c.billingState).filter(Boolean))].length
        };

        setCustomerStats(stats);
        setCustomerData(processedCustomers);
      } else {
        console.error("Failed to fetch customers:", response.error);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomer = async () => {
    try {
      // Refresh the customers list after saving
      await fetchCustomers();
      setCustomerFormOpen(false);
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-black overflow-hidden">
      {/* Header with Statistics - Fixed height container */}
      <div className="px-4 py-3 border-b border-gray-200">
        {/* Title and New Customer Button */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Customers</h2>
            <p className="text-xs text-muted-foreground">Manage your customer relationships and contacts</p>
          </div>

          <Button
            onClick={() => setCustomerFormOpen(true)}
            className="flex items-center gap-1 text-xs px-3 py-1"
            size="sm"
          >
            <Plus className="h-3 w-3" />
            New Customer
          </Button>
        </div>

        {/* Statistics Cards - Responsive grid */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="border-blue-200 p-2">
            <div className="text-xs font-medium text-blue-600 flex items-center gap-1 mb-1">
              <Users className="h-3 w-3" />
              Total
            </div>
            <div className="text-sm font-bold text-blue-700">{customerStats.total}</div>
            <p className="text-xs text-blue-600">Customers</p>
          </Card>

          <Card className="border-green-200 p-2">
            <div className="text-xs font-medium text-green-600 flex items-center gap-1 mb-1">
              <Building2 className="h-3 w-3" />
              Business
            </div>
            <div className="text-sm font-bold text-green-700">{customerStats.business}</div>
            <p className="text-xs text-green-600">
              {customerStats.total > 0 ? Math.round((customerStats.business / customerStats.total) * 100) : 0}%
            </p>
          </Card>

          <Card className="border-purple-200 p-2">
            <div className="text-xs font-medium text-purple-600 flex items-center gap-1 mb-1">
              <Badge className="h-2 w-2 bg-purple-500" />
              GST
            </div>
            <div className="text-sm font-bold text-purple-700">{customerStats.withGST}</div>
            <p className="text-xs text-purple-600">
              {customerStats.total > 0 ? Math.round((customerStats.withGST / customerStats.total) * 100) : 0}%
            </p>
          </Card>

          <Card className="border-orange-200 p-2">
            <div className="text-xs font-medium text-orange-600 flex items-center gap-1 mb-1">
              <MapPin className="h-3 w-3" />
              States
            </div>
            <div className="text-sm font-bold text-orange-700">{customerStats.activeStates}</div>
            <p className="text-xs text-orange-600">Active</p>
          </Card>
        </div>
      </div>

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-black rounded-lg m-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CustomerTable data={customerData} loading={isLoading} />
      </div>

      {/* Customer Form Dialog */}
      {customerFormOpen && (
        <CustomerForm
          isOpen={customerFormOpen}
          onClose={() => setCustomerFormOpen(false)}
          onSave={handleSaveCustomer}
        />
      )}
    </div>
  );
};

export default Customers;
