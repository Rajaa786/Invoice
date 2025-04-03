import React, { useState, useEffect } from "react";
import { Search, Phone, Plus, Mail } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const customerData = [
  {
    name: "John Doe",
    numberOfInvoices: 5,
    totalInvoiced: 25000,
    totalUnpaid: 10000,
  },
  {
    name: "Jane Smith",
    numberOfInvoices: 3,
    totalInvoiced: 15000,
    totalUnpaid: 5000,
  },
  {
    name: "Mike Johnson",
    numberOfInvoices: 7,
    totalInvoiced: 35000,
    totalUnpaid: 12000,
  },
  {
    name: "Sarah Wilson",
    numberOfInvoices: 4,
    totalInvoiced: 20000,
    totalUnpaid: 8000,
  },
  {
    name: "David Brown",
    numberOfInvoices: 6,
    totalInvoiced: 30000,
    totalUnpaid: 15000,
  },
];

const Customers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState(customerData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [currentFilterColumn, setCurrentFilterColumn] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [customerType, setCustomerType] = useState("business");
  const [gstApplicable, setGstApplicable] = useState(false);
  const rowsPerPage = 10;

  // Get dynamic columns from first data item
  const columns = customerData.length > 0 ? Object.keys(customerData[0]) : [];

  // Determine which columns are numeric
  const numericColumns = columns.filter((column) =>
    customerData.some((row) => {
      const value = String(row[column]);
      return !isNaN(Number.parseFloat(value)) && !value.includes("-");
    })
  );

  useEffect(() => {
    setFilteredData(customerData);
  }, []);

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    if (searchValue === "") {
      setFilteredData(customerData);
      setCurrentPage(1);
      return;
    }

    const filtered = customerData.filter((row) =>
      Object.entries(row).some(([key, value]) =>
        String(value).toLowerCase().includes(searchValue.toLowerCase())
      )
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const handleSelectAll = () => {
    const visibleCategories = getFilteredUniqueValues(currentFilterColumn);
    const allSelected = visibleCategories.every((cat) =>
      selectedCategories.includes(cat)
    );
    setSelectedCategories(allSelected ? [] : visibleCategories);
  };

  const handleColumnFilter = () => {
    if (selectedCategories.length === 0) {
      setFilteredData(customerData);
    } else {
      const filtered = customerData.filter((row) =>
        selectedCategories.includes(String(row[currentFilterColumn]))
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1);
    setFilterModalOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilteredData(customerData);
    setCurrentPage(1);
    setSelectedCategories([]);
    setCategorySearchTerm("");
  };

  const getUniqueValues = (columnName) => {
    return [...new Set(customerData.map((row) => String(row[columnName])))];
  };

  const getFilteredUniqueValues = (columnName) => {
    const uniqueValues = getUniqueValues(columnName);
    if (!categorySearchTerm) return uniqueValues;
    return uniqueValues.filter((value) =>
      value.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > 2) {
        pageNumbers.push("ellipsis");
      }
      if (currentPage !== 1 && currentPage !== totalPages) {
        pageNumbers.push(currentPage);
      }
      if (currentPage < totalPages - 1) {
        pageNumbers.push("ellipsis");
      }
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  return (
    <div className="p-8 pt-4 space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <CardTitle>Recent Customers</CardTitle>
              <CardDescription>View and manage your customers</CardDescription>
            </div>
            <div className="relative flex items-center gap-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 w-[400px]"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Button
                variant="default"
                onClick={() => setCustomerFormOpen(true)}
              >
                <Plus className="h-5 w-5" />
                New
              </Button>
              <Button variant="default" onClick={() => clearFilters()}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>
                      <div className="flex items-center gap-2">
                        {column.charAt(0).toUpperCase() +
                          column.slice(1).toLowerCase()}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setCurrentFilterColumn(column);
                            setSelectedCategories([]);
                            setCategorySearchTerm("");
                            setFilterModalOpen(true);
                          }}
                        >
                          ▼
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      No matching results found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((row, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell
                          key={column}
                          className="max-w-[200px] group relative"
                        >
                          <div className="truncate">{row[column]}</div>
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
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={cn(
                        "cursor-pointer",
                        currentPage === 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                  {getPageNumbers().map((pageNumber, index) => (
                    <PaginationItem key={index}>
                      {pageNumber === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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
      </Card>

      {/* Filter Modal */}
      {filterModalOpen && (
        <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Filter {currentFilterColumn}</DialogTitle>
              <p className="text-sm text-gray-600">
                Make changes to your filter here. Click save when you're done.
              </p>
            </DialogHeader>
            <Input
              type="text"
              placeholder="Search categories..."
              value={categorySearchTerm}
              onChange={(e) => setCategorySearchTerm(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-60 overflow-y-auto space-y-[1px] mb-4">
              {getFilteredUniqueValues(currentFilterColumn).map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-1 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                >
                  <Checkbox
                    checked={selectedCategories.includes(value)}
                    onCheckedChange={() => handleCategorySelect(value)}
                  />
                  <span className="text-gray-700">{value}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button
                variant="default"
                className="bg-black hover:bg-gray-800"
                onClick={handleColumnFilter}
              >
                Save changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Customer Form Dialog */}
      <Dialog open={customerFormOpen} onOpenChange={setCustomerFormOpen}>
        <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            {/* Customer Type */}
            <div className="flex items-center space-x-4">
              {/* Label */}
              <Label className="text-sm font-medium">Customer Type</Label>

              {/* Radio Buttons */}
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="customerType"
                    value="business"
                    checked={customerType === "business"}
                    onChange={() => setCustomerType("business")}
                  />
                  <span>Business</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="customerType"
                    value="individual"
                    checked={customerType === "individual"}
                    onChange={() => setCustomerType("individual")}
                  />
                  <span>Individual</span>
                </label>
              </div>
            </div>

            {/* Primary Contact */}
            <div className="flex space-x-4">
              {/* Customer Name */}
              <div className="flex flex-col space-y-1 w-5/6">
                <div className="flex items-center space-x-1">
                  <Label className="text-sm font-medium">Customer Name</Label>
                </div>
                <div className="flex space-x-2">
                  <Select defaultValue="mr">
                    <SelectTrigger className="max-w-20">
                      <SelectValue placeholder="Title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mr">Mr.</SelectItem>
                      <SelectItem value="ms">Ms.</SelectItem>
                      <SelectItem value="mrs">Mrs.</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="First Name" />
                  <Input placeholder="Last Name" />
                </div>
              </div>

              {/* PAN Number */}
              <div className="flex flex-col space-y-1 w-1/2">
                <div className="flex items-center space-x-1">
                  <Label className="text-sm font-medium">PAN No.</Label>
                </div>
                <Input placeholder="Enter PAN Number" className="w-full" />
              </div>
            </div>

            <div className="flex space-x-4">
              {/* Company Name */}
              <div className="flex flex-col space-y-1 w-1/2">
                <Label className="text-sm font-medium">Company Name</Label>
                <Input placeholder="Company Name" />
              </div>

              {/* Currency */}
              <div className="flex flex-col space-y-1 w-1/2">
                <Label className="text-sm font-medium">Currency</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="INR - Indian Rupee" />
                  </SelectTrigger>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <Label className="text-sm font-medium">Is GST Applicable?</Label>
              <input
                type="radio"
                name="gstApplicable"
                value="yes"
                onChange={(e) => setGstApplicable(e.target.value === "yes")}
              />{" "}
              Yes
              <input
                type="radio"
                name="gstApplicable"
                value="no"
                defaultChecked
                onChange={(e) => setGstApplicable(e.target.value === "yes")}
              />{" "}
              No
            </div>

            {gstApplicable && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <Label className="text-sm font-medium">GSTIN/UIN</Label>
                  <Input placeholder="GST Number" />
                </div>

                <div className="flex flex-col space-y-1">
                  <Label className="text-sm font-medium">State Code</Label>
                  <Input placeholder="State Code" />
                </div>
              </div>
            )}

            {/* Addresses - New Section */}
            <div className="pt-2">
              <Tabs defaultValue="billing">
                <TabsList className="grid w-[300px] grid-cols-2 pb-10">
                  <TabsTrigger value="billing">Billing Address</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping Address</TabsTrigger>
                </TabsList>

                <TabsContent value="billing" className="ml-2 mt-4">
                  <div className="flex flex-col space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1">
                        <Label className="text-sm font-medium">
                          Country/Region
                        </Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Label className="text-sm font-medium">State</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maharashtra">
                              Maharashtra
                            </SelectItem>
                            <SelectItem value="delhi">Delhi</SelectItem>
                            <SelectItem value="karnataka">Karnataka</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex space-x-4 ">
                      <div className="flex flex-col space-y-1 w-1/2">
                        <Label className="text-sm font-medium">
                          Address Line 1
                        </Label>
                        <Textarea
                          placeholder="Street Address, Building Name"
                          rows={2}
                        />
                      </div>

                      <div className="flex flex-col space-y-1 w-1/2">
                        <Label className="text-sm font-medium">
                          Address Line 2
                        </Label>
                        <Textarea placeholder="Locality, Area" rows={2} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1">
                        <Label className="text-sm font-medium">City</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select City" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mumbai">Mumbai</SelectItem>
                            <SelectItem value="pune">Pune</SelectItem>
                            <SelectItem value="nagpur">Nagpur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1">
                          <Label className="text-sm font-medium">
                            Contact No.
                          </Label>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Phone className="h-4 w-4" />
                          </div>
                          <Input className="pl-10 w-full" placeholder="Phone" />
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      {/* Email Address */}
                      <div className="flex flex-col space-y-1 w-1/2">
                        <div className="flex items-center space-x-1">
                          <Label className="text-sm font-medium">
                            Email Address
                          </Label>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="h-4 w-4" />
                          </div>
                          <Input
                            className="pl-10 w-full"
                            placeholder="Email Address"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="flex flex-col space-y-1 w-1/2">
                        <div className="flex items-center space-x-1">
                          <Label className="text-sm font-medium">
                            Alternate Contact No.
                          </Label>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Phone className="h-4 w-4" />
                          </div>
                          <Input className="pl-10 w-full" placeholder="Phone" />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="ml-2 mt-4">
                  {/* <div className="flex items-center mb-4">
                    <Checkbox id="copy-billing" />
                    <Label htmlFor="copy-billing" className="ml-2 text-sm">
                      Copy Billing address
                    </Label>
                  </div> */}

                  <div className="flex flex-col space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1">
                        <Label className="text-sm font-medium">
                          Country/Region
                        </Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Label className="text-sm font-medium">State</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maharashtra">
                              Maharashtra
                            </SelectItem>
                            <SelectItem value="delhi">Delhi</SelectItem>
                            <SelectItem value="karnataka">Karnataka</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex space-x-4 ">
                      <div className="flex flex-col space-y-1 w-1/2">
                        <Label className="text-sm font-medium">
                          Address Line 1
                        </Label>
                        <Textarea
                          placeholder="Street Address, Building Name"
                          rows={2}
                        />
                      </div>

                      <div className="flex flex-col space-y-1 w-1/2">
                        <Label className="text-sm font-medium">
                          Address Line 2
                        </Label>
                        <Textarea placeholder="Locality, Area" rows={2} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1">
                        <Label className="text-sm font-medium">City</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select City" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mumbai">Mumbai</SelectItem>
                            <SelectItem value="pune">Pune</SelectItem>
                            <SelectItem value="nagpur">Nagpur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1">
                          <Label className="text-sm font-medium">
                            Contact No.
                          </Label>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Phone className="h-4 w-4" />
                          </div>
                          <Input className="pl-10 w-full" placeholder="Phone" />
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      {/* Email Address */}
                      <div className="flex flex-col space-y-1 w-1/2">
                        <div className="flex items-center space-x-1">
                          <Label className="text-sm font-medium">
                            Email Address
                          </Label>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="h-4 w-4" />
                          </div>
                          <Input
                            className="pl-10 w-full"
                            placeholder="Email Address"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="flex flex-col space-y-1 w-1/2">
                        <div className="flex items-center space-x-1">
                          <Label className="text-sm font-medium">
                            Alternate Contact No.
                          </Label>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Phone className="h-4 w-4" />
                          </div>
                          <Input className="pl-10 w-full" placeholder="Phone" />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </form>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCustomerFormOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="default">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
