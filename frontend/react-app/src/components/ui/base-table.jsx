import React from 'react';
import { Search, ChevronUp, ChevronDown, Filter, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "./table";
import { Button } from "./button";
import { Badge } from "./badge";
import { Input } from "./input";
import { cn } from "../../lib/utils";
import { useTable } from "../../hooks/useTable";

const ITEMS_PER_PAGE = 10;

export const BaseTable = ({
    data = [],
    columns = [],
    title,
    defaultSort,
    rowColorAccessor,
    loading = false,
    renderCustomHeader,
    renderCustomFilters,
    renderEmptyState,
}) => {
    const {
        currentPage,
        setCurrentPage,
        sortConfig,
        activeFilters,
        searchTerm,
        processedData,
        handleSort,
        handleSearch,
        removeFilter,
        clearFilters,
    } = useTable(data, defaultSort);

    // Pagination calculations
    const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentData = processedData.slice(startIndex, endIndex);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <CardTitle>{title || "Data Table"}</CardTitle>
                        <CardDescription>
                            View and manage your data • {processedData.length} of {data.length} records
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
                        {renderCustomHeader && renderCustomHeader()}
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

                {/* Custom Filters Area */}
                {renderCustomFilters && renderCustomFilters()}
            </CardHeader>

            <CardContent>
                <div className="w-full overflow-x-auto">
                    <Table className="w-full min-w-[800px]">
                        <TableHeader>
                            <TableRow>
                                {columns.map((column) => (
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
                                            {column.filterable && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        column.onFilter && column.onFilter();
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                            <p className="text-muted-foreground">Loading data...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : currentData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center py-8">
                                        {renderEmptyState ? (
                                            renderEmptyState()
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-muted-foreground">No matching results found</p>
                                                {(searchTerm || activeFilters.length > 0) && (
                                                    <Button variant="outline" size="sm" onClick={clearFilters}>
                                                        Clear filters
                                                    </Button>
                                                )}
                                            </div>
                                        )}
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
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.accessor}
                                                className="max-w-[200px] group relative"
                                            >
                                                {column.cell ? column.cell(row) : row[column.accessor]}
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
                            Showing {startIndex + 1} to {Math.min(endIndex, processedData.length)} of {processedData.length} entries
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}; 