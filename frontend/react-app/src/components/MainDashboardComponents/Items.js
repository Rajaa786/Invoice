import React, { useState, useEffect } from "react";
import { Plus, Package, Hash, DollarSign, TrendingUp } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import ItemTable from "./ItemTable";
import ItemForm from "../Elements/ItemForm";

const Items = () => {
  const [itemData, setItemData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [itemStats, setItemStats] = useState({
    total: 0,
    withHSN: 0,
    avgRate: 0,
    categories: 0
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await window.electron.getItem();
      console.log("Items API response:", response);

      if (response.success) {
        const itemsData = response.items || [];
        console.log("Items data:", itemsData);

        // Enhanced data processing
        const processedItems = itemsData.map((item) => ({
          ...item,
          id: item.id,
          name: item.name || "",
          hsnSacCode: item.hsnSacCode || "",
          description: item.description || "",
          rate: item.sellingPrice !== undefined ? parseFloat(item.sellingPrice) : 0,
          unit: item.unit || ""
        }));

        // Calculate statistics
        const stats = {
          total: processedItems.length,
          withHSN: processedItems.filter(i => i.hsnSacCode).length,
          avgRate: processedItems.length > 0
            ? processedItems.reduce((sum, i) => sum + (i.rate || 0), 0) / processedItems.length
            : 0,
          categories: [...new Set(processedItems.map(i => i.unit).filter(Boolean))].length
        };

        setItemStats(stats);
        setItemData(processedItems);
      } else {
        console.error("Failed to fetch items:", response.error);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveItem = async (formData) => {
    try {
      // Refresh the items list after saving
      await fetchItems();
      setItemFormOpen(false);
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-black overflow-hidden">
      {/* Header with Statistics - Fixed height container */}
      <div className="px-4 py-3 border-b border-gray-200">
        {/* Title and New Item Button */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Items</h2>
            <p className="text-xs text-muted-foreground">Manage your inventory and product catalog</p>
          </div>

          <Button
            onClick={() => setItemFormOpen(true)}
            className="flex items-center gap-1 text-xs px-3 py-1"
            size="sm"
          >
            <Plus className="h-3 w-3" />
            New Item
          </Button>
        </div>

        {/* Statistics Cards - Responsive grid */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="border-indigo-200 p-2">
            <div className="text-xs font-medium text-indigo-600 flex items-center gap-1 mb-1">
              <Package className="h-3 w-3" />
              Total
            </div>
            <div className="text-sm font-bold text-indigo-700">{itemStats.total}</div>
            <p className="text-xs text-indigo-600">Items</p>
          </Card>

          <Card className="border-blue-200 p-2">
            <div className="text-xs font-medium text-blue-600 flex items-center gap-1 mb-1">
              <Hash className="h-3 w-3" />
              HSN/SAC
            </div>
            <div className="text-sm font-bold text-blue-700">{itemStats.withHSN}</div>
            <p className="text-xs text-blue-600">
              {itemStats.total > 0 ? Math.round((itemStats.withHSN / itemStats.total) * 100) : 0}%
            </p>
          </Card>

          <Card className="border-green-200 p-2">
            <div className="text-xs font-medium text-green-600 flex items-center gap-1 mb-1">
              <DollarSign className="h-3 w-3" />
              Avg Rate
            </div>
            <div className="text-sm font-bold text-green-700">
              ₹{itemStats.avgRate.toFixed(0)}
            </div>
            <p className="text-xs text-green-600">Per Item</p>
          </Card>

          <Card className="border-orange-200 p-2">
            <div className="text-xs font-medium text-orange-600 flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3" />
              Units
            </div>
            <div className="text-sm font-bold text-orange-700">{itemStats.categories}</div>
            <p className="text-xs text-orange-600">Types</p>
          </Card>
        </div>
      </div>

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-black rounded-lg m-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        <ItemTable data={itemData} loading={isLoading} />
      </div>

      {/* Item Form Dialog */}
      {itemFormOpen && (
        <ItemForm
          isOpen={itemFormOpen}
          onClose={() => setItemFormOpen(false)}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
};

export default Items;
