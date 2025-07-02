"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Filter, ChevronUp, ChevronDown, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Label } from "../ui/label";

const DataTable = ({
  data = [],
  columns = [],
  title,
  rowColorAccessor,
  defaultSort = null
}) => {
  // Utility to format camelCase or PascalCase keys into human-readable headers
  const formatHeader = (key) =>
    key
      // insert space between lowercase/number and uppercase letters
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      // uppercase first character
      .replace(/^./, (str) => str.toUpperCase());

  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [currentFilterColumn, setCurrentFilterColumn] = useState(null);
  const [numericFilterModalOpen, setNumericFilterModalOpen] = useState(false);
  const [currentNumericColumn, setCurrentNumericColumn] = useState(null);
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState(defaultSort || { column: null, direction: null });
  const [activeFilters, setActiveFilters] = useState([]);
  const rowsPerPage = 10;

  // Use provided columns or derive from data
  const tableColumns = columns.length > 0 ? columns :
    (data.length > 0 ? Object.keys(data[0]).map(key => ({
      header: formatHeader(key),
      accessor: key,
      sortable: true
    })) : []);

  // Detect numeric columns
  const numericColumns = tableColumns.filter((column) => {
    if (column.accessor === 'amount' || column.accessor === 'totalAmount') return true;
    return data.some((row) => {
      const val = String(row[column.accessor]);
      return !isNaN(Number.parseFloat(val)) && !val.includes("-");
    });
  });

  // Initialize sorting if defaultSort is provided
  useEffect(() => {
    if (defaultSort) {
      setSortConfig(defaultSort);
    }
  }, [defaultSort]);

  // Update filtered data when main data changes
  useEffect(() => {
    let result = [...data];

    // Apply sorting
    if (sortConfig.column) {
      result = sortData(result, sortConfig.column, sortConfig.direction);
    }

    // Apply filters
    result = applyFilters(result);

    setFilteredData(result);
  }, [data, sortConfig, activeFilters, searchTerm]);

  // Enhanced sort function
  const sortData = (dataToSort, columnKey, direction) => {
    return [...dataToSort].sort((a, b) => {
      const column = tableColumns.find(col => col.accessor === columnKey);
      const aValue = column?.sortAccessor ? a[column.sortAccessor] : a[columnKey];
      const bValue = column?.sortAccessor ? b[column.sortAccessor] : b[columnKey];

      // Handle undefined/null values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return direction === 'asc' ? 1 : -1;
      if (bValue == null) return direction === 'asc' ? -1 : 1;

      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle date values
      if (columnKey.toLowerCase().includes('date')) {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);

        // Check if dates are valid
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return direction === 'asc' ? 1 : -1;
        if (isNaN(dateB.getTime())) return direction === 'asc' ? -1 : 1;

        return direction === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }

      // Handle string values (convert to string to handle numbers and other types)
      const strA = String(aValue).toLowerCase();
      const strB = String(bValue).toLowerCase();

      return direction === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  };

  const handleSort = (column) => {
    let direction = 'asc';
    if (sortConfig.column === column.accessor) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    setSortConfig({ column: direction ? column.accessor : null, direction });
  };

  // Apply all active filters
  const applyFilters = (dataToFilter) => {
    let result = [...dataToFilter];

    // Apply search filter
    if (searchTerm) {
      result = result.filter((row) =>
        Object.entries(row).some(([key, value]) => {
          if (typeof value === 'object') return false;
          const strVal = String(value).replace(/,/g, "");
          return strVal.toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply category filters
    activeFilters.forEach(filter => {
      if (filter.type === 'category' && filter.values.length > 0) {
        result = result.filter(row => filter.values.includes(String(row[filter.column])));
      } else if (filter.type === 'numeric') {
        result = result.filter(row => {
          const value = Number(row[filter.column]);
          return (!filter.min || value >= filter.min) && (!filter.max || value <= filter.max);
        });
      }
    });

    return result;
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setCurrentPage(1);
  };

  // Get unique values for a column
  const getUniqueValues = (columnName) => [
    ...new Set(data.map((row) => String(row[columnName])))
  ];

  // Get filtered unique values
  const getFilteredUniqueValues = (columnName) => {
    const unique = getUniqueValues(columnName);
    return categorySearchTerm
      ? unique.filter((v) =>
        v.toLowerCase().includes(categorySearchTerm.toLowerCase())
      )
      : unique;
  };

  const handleCategorySelect = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const handleSelectAll = () => {
    const visible = getFilteredUniqueValues(currentFilterColumn?.accessor);
    const allSelected = visible.every((v) => selectedCategories.includes(v));
    setSelectedCategories(allSelected ? [] : visible);
  };

  const handleColumnFilter = () => {
    if (!selectedCategories.length) {
      removeFilter(currentFilterColumn?.accessor);
    } else {
      const filter = {
        type: 'category',
        column: currentFilterColumn?.accessor,
        values: selectedCategories,
        label: `${currentFilterColumn?.header}: ${selectedCategories.length} selected`
      };
      addFilter(filter);
    }
    setFilterModalOpen(false);
    setSelectedCategories([]);
    setCategorySearchTerm("");
  };

  const handleNumericFilter = () => {
    const filter = {
      type: 'numeric',
      column: currentNumericColumn?.accessor,
      min: minValue === "" ? null : Number(minValue),
      max: maxValue === "" ? null : Number(maxValue),
      label: `${currentNumericColumn?.header}: ${minValue || '∞'} - ${maxValue || '∞'}`
    };
    addFilter(filter);
    setNumericFilterModalOpen(false);
    setMinValue("");
    setMaxValue("");
  };

  const addFilter = (filter) => {
    setActiveFilters(prev => {
      const existing = prev.findIndex(f => f.column === filter.column);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = filter;
        return updated;
      }
      return [...prev, filter];
    });
  };

  const removeFilter = (column) => {
    setActiveFilters(prev => prev.filter(f => f.column !== column));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilters([]);
    setSortConfig(defaultSort || { column: null, direction: null });
    setCurrentPage(1);
  };

  // pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const nums = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) nums.push(i);
    } else {
      nums.push(1);
      if (currentPage > 2) nums.push("ellipsis");
      if (currentPage !== 1 && currentPage !== totalPages)
        nums.push(currentPage);
      if (currentPage < totalPages - 1) nums.push("ellipsis");
      nums.push(totalPages);
    }
    return nums;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <CardTitle>{title || "Data Table"}</CardTitle>
            <CardDescription>
              View and manage your data • {filteredData.length} of {data.length} records
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 w-[300px]"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {(activeFilters.length > 0 || searchTerm) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {filter.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeFilter(filter.column)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[800px]">
            <TableHeader>
              <TableRow>
                {tableColumns.map((column) => (
                  <TableHead
                    key={column.accessor}
                    className={cn(
                      "sticky left-0 bg-white z-10",
                      column.sortable && "cursor-pointer select-none hover:bg-gray-50"
                    )}
                    onClick={() => column.sortable && handleSort(column)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={cn(
                              "h-3 w-3",
                              sortConfig.column === column.accessor &&
                                sortConfig.direction === "asc"
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          />
                          <ChevronDown
                            className={cn(
                              "h-3 w-3 -mt-1",
                              sortConfig.column === column.accessor &&
                                sortConfig.direction === "desc"
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          />
                        </div>
                      )}
                      {column.accessor !== "description" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (numericColumns.find(col => col.accessor === column.accessor)) {
                              setCurrentNumericColumn(column);
                              setNumericFilterModalOpen(true);
                            } else {
                              setCurrentFilterColumn(column);
                              setSelectedCategories([]);
                              setCategorySearchTerm("");
                              setFilterModalOpen(true);
                            }
                          }}
                        >
                          <Filter className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No matching results found</p>
                      {(searchTerm || activeFilters.length > 0) && (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map((row, idx) => (
                  <TableRow
                    key={idx}
                    className={cn(
                      "hover:bg-opacity-80 transition-colors",
                      rowColorAccessor && row[rowColorAccessor]
                    )}
                  >
                    {tableColumns.map((column) => (
                      <TableCell
                        key={column.accessor}
                        className="max-w-[200px] group relative"
                      >
                        {column.cell ? column.cell(row) : (
                          <div className="truncate">
                            {row[column.accessor]}
                          </div>
                        )}
                        {column.accessor === "description" && (
                          <div className="absolute left-0 top-10 hidden group-hover:block bg-black text-white text-sm rounded p-2 z-50 whitespace-normal min-w-[200px] max-w-[400px]">
                            {row[column.accessor]}
                          </div>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className={cn(
                      "cursor-pointer",
                      currentPage === 1 && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
                {getPageNumbers().map((page, i) => (
                  <PaginationItem key={i}>
                    {page === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    className={cn(
                      "cursor-pointer",
                      currentPage === totalPages &&
                      "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>

      {/* Category Filter Modal */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Filter {currentFilterColumn?.header}</DialogTitle>
            <DialogDescription>
              Select values to filter by. Multiple values can be selected.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Search categories..."
            value={categorySearchTerm}
            onChange={(e) => setCategorySearchTerm(e.target.value)}
            className="mb-4"
          />
          <div className="max-h-60 overflow-y-auto space-y-1 mb-4">
            {currentFilterColumn && getFilteredUniqueValues(currentFilterColumn.accessor).map((value) => (
              <label
                key={value}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
              >
                <Checkbox
                  checked={selectedCategories.includes(value)}
                  onCheckedChange={() => handleCategorySelect(value)}
                />
                <span className="text-sm">{value}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSelectAll}>
              {selectedCategories.length === getFilteredUniqueValues(currentFilterColumn?.accessor || "").length
                ? "Deselect All" : "Select All"}
            </Button>
            <Button onClick={handleColumnFilter}>
              Apply Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Numeric Filter Modal */}
      <Dialog open={numericFilterModalOpen} onOpenChange={setNumericFilterModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Filter {currentNumericColumn?.header}</DialogTitle>
            <DialogDescription>
              Set the minimum and maximum values for the filter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Minimum Value</Label>
              <Input
                type="number"
                placeholder="No minimum"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum Value</Label>
              <Input
                type="number"
                placeholder="No maximum"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNumericFilterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleNumericFilter}>
              Apply Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      )}
    </Card>
  );
};

export default DataTable;
