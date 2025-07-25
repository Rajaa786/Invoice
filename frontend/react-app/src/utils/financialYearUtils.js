import { format, parseISO, isBefore, isAfter } from 'date-fns';

/**
 * Get the current financial year based on Indian FY (April 1 - March 31)
 * @returns {string} Financial year in format "2023-24"
 */
export const getCurrentFinancialYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based

    // If current month is before April (0-2), we're in the previous FY
    if (currentMonth < 3) {
        return `${currentYear - 1}-${String(currentYear).slice(-2)}`;
    } else {
        return `${currentYear}-${String(currentYear + 1).slice(-2)}`;
    }
};

/**
 * Get financial year from a specific date
 * @param {Date} date 
 * @returns {string} Financial year in format "2023-24"
 */
export const getFinancialYearFromDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-based

    if (month < 3) {
        return `${year - 1}-${String(year).slice(-2)}`;
    } else {
        return `${year}-${String(year + 1).slice(-2)}`;
    }
};

/**
 * Check if financial year has changed since last login/activity
 * @param {string} lastActivityDate - ISO date string
 * @returns {boolean}
 */
export const hasFinancialYearChanged = (lastActivityDate) => {
    if (!lastActivityDate) return false;

    const lastDate = parseISO(lastActivityDate);
    const currentFY = getCurrentFinancialYear();
    const lastFY = getFinancialYearFromDate(lastDate);

    return currentFY !== lastFY;
};

/**
 * Generate suggested company prefix based on current financial year
 * @param {string} baseInitials - Company initials without year
 * @param {boolean} includeYear - Whether to include year in prefix
 * @returns {string}
 */
export const generateFinancialYearPrefix = (baseInitials, includeYear = true) => {
    if (!includeYear) return baseInitials;

    const currentFY = getCurrentFinancialYear();
    const fyShort = currentFY.split('-')[1]; // Get "24" from "2023-24"

    return `${baseInitials}${fyShort}`;
};

/**
 * Get notification message for financial year change
 * @param {string} oldFY 
 * @param {string} newFY 
 * @param {string} companyName 
 * @returns {object}
 */
export const getFinancialYearChangeNotification = (oldFY, newFY, companyName) => {
    const fyShort = newFY.split('-')[1];

    return {
        title: "Financial Year Changed",
        message: `Financial year has changed from ${oldFY} to ${newFY}. Consider updating your company invoice prefix to include "${fyShort}" for better organization.`,
        suggestion: `Add "${fyShort}" to your company prefix`,
        newFY,
        fyShort
    };
};

/**
 * Check if a company prefix already includes a year
 * @param {string} prefix 
 * @returns {boolean}
 */
export const prefixIncludesYear = (prefix) => {
    // Check if prefix ends with 2 digits that could be a year
    const yearPattern = /\d{2}$/;
    return yearPattern.test(prefix);
};

/**
 * Remove year from prefix if present
 * @param {string} prefix 
 * @returns {string}
 */
export const removeYearFromPrefix = (prefix) => {
    // Remove trailing 2 digits if they look like a year
    return prefix.replace(/\d{2}$/, '');
}; 