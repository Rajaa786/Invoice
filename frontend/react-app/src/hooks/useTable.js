import { useState, useMemo } from 'react';

export const useTable = (data = [], defaultSort = null) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState(defaultSort || { column: null, direction: null });
    const [activeFilters, setActiveFilters] = useState([]);

    // Sorting function
    const sortData = (data, sortConfig) => {
        if (!sortConfig.column || !sortConfig.direction) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.column];
            const bValue = b[sortConfig.column];

            if (aValue === bValue) return 0;
            if (sortConfig.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    // Filtering function
    const filterData = (data, filters, searchTerm) => {
        let filteredData = [...data];

        // Apply active filters
        if (filters.length > 0) {
            filteredData = filteredData.filter(item => {
                return filters.every(filter => {
                    if (filter.type === 'category') {
                        return filter.values.includes(item[filter.column]);
                    }
                    if (filter.type === 'range') {
                        const value = parseFloat(item[filter.column]);
                        return value >= filter.min && value <= filter.max;
                    }
                    return true;
                });
            });
        }

        // Apply search term
        if (searchTerm) {
            filteredData = filteredData.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        return filteredData;
    };

    // Process data with current sorting and filtering
    const processedData = useMemo(() => {
        let processed = filterData(data, activeFilters, searchTerm);
        return sortData(processed, sortConfig);
    }, [data, activeFilters, searchTerm, sortConfig]);

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

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const addFilter = (filter) => {
        setActiveFilters(prev => [...prev, filter]);
        setCurrentPage(1); // Reset to first page when adding filter
    };

    const removeFilter = (columnName) => {
        setActiveFilters(prev => prev.filter(f => f.column !== columnName));
    };

    const clearFilters = () => {
        setActiveFilters([]);
        setSearchTerm('');
        setCurrentPage(1);
    };

    return {
        currentPage,
        setCurrentPage,
        sortConfig,
        activeFilters,
        searchTerm,
        processedData,
        handleSort,
        handleSearch,
        addFilter,
        removeFilter,
        clearFilters
    };
}; 