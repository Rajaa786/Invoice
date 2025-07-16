import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Classic Blue Template - Professional and elegant design
const colors = {
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    accent: '#10b981',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    background: '#f8fafc',
    white: '#ffffff',
    success: '#059669',
    warning: '#d97706'
};

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 8.5,
        color: colors.text,
        backgroundColor: colors.white,
        padding: 20,
        lineHeight: 1.3,
    },

    // Modern Header Styles
    header: {
        backgroundColor: colors.white,
        marginBottom: 12,
        borderBottom: `2pt solid ${colors.primary}`,
        paddingBottom: 12,
    },

    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    companyInfo: {
        flex: 1,
    },

    logoContainer: {
        maxWidth: 160,
        height: 70,
        marginRight: 15,
        objectFit: 'contain',
    },

    headerCompanyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 2,
        letterSpacing: 0.5,
    },

    headerTagline: {
        fontSize: 12,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },

    headerRight: {
        alignItems: 'flex-end',
    },

    taxInvoiceTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        // fontFamily: 'Helvetica-Bold',
        color: colors.primary,
        marginBottom: 5,
        letterSpacing: 1,
    },

    invoiceNumberText: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: 'bold',
    },

    // Company and Invoice Info Section - Compact Design
    infoSection: {
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'space-between',
    },

    companyInfoSection: {
        flex: 1.5,
        marginRight: 20,
    },

    invoiceInfoSection: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
    },

    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        borderBottom: `1pt solid ${colors.border}`,
        paddingBottom: 3,
    },

    companyName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 6,
    },

    addressText: {
        fontSize: 9,
        color: colors.textSecondary,
        lineHeight: 1.3,
        marginBottom: 2,
    },

    gstinText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 4,
        backgroundColor: colors.background,
        padding: 3,
        borderRadius: 3,
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        alignItems: 'center',
    },

    infoLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.textSecondary,
        flex: 1,
    },

    infoValue: {
        fontSize: 9,
        color: colors.text,
        fontWeight: 'bold',
        textAlign: 'right',
        flex: 1,
    },

    // Customer Section - Compact
    customerSection: {
        backgroundColor: colors.background,
        padding: 8,
        marginBottom: 10,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
        borderLeft: `3pt solid ${colors.primary}`,
    },

    customerName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },

    // Modern Table Styles
    tableContainer: {
        marginBottom: 6, // reduced from 8
        borderRadius: 4,
        overflow: 'hidden',
        border: `1pt solid ${colors.border}`,
        backgroundColor: colors.white,
    },

    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        padding: 8,
        borderBottom: `1pt solid ${colors.border}`,
    },

    tableHeaderCell: {
        color: colors.white,
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },

    tableRow: {
        flexDirection: 'row',
        padding: 6,
        borderBottom: `0.5pt solid ${colors.border}`,
        minHeight: 24,
        alignItems: 'center',
    },

    tableRowAlt: {
        backgroundColor: colors.background,
    },

    tableCell: {
        fontSize: 9,
        color: colors.text,
        lineHeight: 1.2,
    },

    tableCellCenter: {
        textAlign: 'center',
    },

    tableCellRight: {
        textAlign: 'right',
    },

    // Optimized Column widths (percentages that add up to 100%)
    col1: { width: '5%' },   // Sl.
    col2: { width: '40%' },  // Description
    col3: { width: '10%' },  // HSN/SAC
    col4: { width: '7%' },   // Qty
    col5: { width: '12%' },  // Rate
    col6: { width: '8%' },   // Unit
    col7: { width: '18%' },  // Amount

    // Compact Tax and Total Rows
    taxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        backgroundColor: colors.background,
        borderBottom: `0.5pt solid ${colors.border}`,
    },

    taxLabel: {
        fontSize: 9,
        color: colors.text,
        fontWeight: 'bold',
    },

    taxAmount: {
        fontSize: 9,
        color: colors.text,
        fontWeight: 'bold',
    },

    // Subtotal Row
    subtotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        backgroundColor: colors.white,
        borderBottom: `0.5pt solid ${colors.border}`,
    },

    subtotalLabel: {
        fontSize: 9,
        color: colors.text,
        fontWeight: 'bold',
    },

    subtotalAmount: {
        fontSize: 9,
        color: colors.text,
        fontWeight: 'bold',
    },

    // Taxable Value Section
    taxableValueSection: {
        marginBottom: 8,
        backgroundColor: colors.white,
    },

    taxableValueHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        padding: 6,
        marginBottom: 2,
    },

    taxableValueHeaderCell: {
        color: colors.white,
        fontSize: 8,
        fontWeight: 'bold',
        padding: '4 2',
    },

    taxableValueRow: {
        flexDirection: 'row',
        padding: 4,
        marginBottom: 1,
    },

    taxableValueCell: {
        fontSize: 8,
        padding: '3 2',
    },

    // Bank Details Section
    bankDetailsSection: {
        marginBottom: 8,
        padding: 8,
        backgroundColor: colors.background,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
        borderLeft: `3pt solid ${colors.primary}`,
    },

    bankDetailsTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },

    bankDetailsRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },

    bankDetailsLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.textSecondary,
        width: '30%',
    },

    bankDetailsValue: {
        fontSize: 8,
        color: colors.text,
        width: '70%',
    },

    // Company Tax Info Section
    companyTaxInfoSection: {
        flexDirection: 'row',
        marginBottom: 8,
        justifyContent: 'space-between',
    },

    companyTaxInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 6,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
        flex: 1,
        marginRight: 4,
    },

    companyTaxInfoLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.primary,
        marginRight: 4,
    },

    companyTaxInfoValue: {
        fontSize: 8,
        color: colors.text,
        fontWeight: 'bold',
    },

    totalRow: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: colors.success,
        alignItems: 'center',
        width: '100%',
        marginTop: 1,
    },

    totalLabel: {
        fontSize: 10,
        color: colors.white,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    totalAmount: {
        fontSize: 10,
        color: colors.white,
        fontWeight: 'bold',
    },

    // Compact Amount in Words
    amountWordsSection: {
        backgroundColor: colors.background,
        padding: 8,
        marginBottom: 8,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
        borderLeft: `3pt solid ${colors.primary}`,
    },

    amountWordsTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },

    amountWordsText: {
        fontSize: 9,
        color: colors.text,
        fontStyle: 'italic',
        fontWeight: 'bold',
    },

    // Compact Footer Section
    footerSection: {
        flexDirection: 'row',
        marginBottom: 6,
        gap: 8,
    },

    declarationBox: {
        flex: 2,
        backgroundColor: colors.background,
        padding: 10,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
    },

    signatureBox: {
        flex: 1,
        backgroundColor: colors.white,
        padding: 10,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
        alignItems: 'center',
    },

    declarationTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 6,
        textTransform: 'uppercase',
    },

    declarationText: {
        fontSize: 8,
        color: colors.textSecondary,
        lineHeight: 1.3,
    },

    signatureArea: {
        minHeight: 25,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: `1pt solid ${colors.border}`,
        width: '80%',
    },

    signatureText: {
        fontSize: 8,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 3,
    },

    authorizedSignatory: {
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
    },

    // Compact Footer
    footer: {
        textAlign: 'center',
        fontSize: 7,
        color: colors.textSecondary,
        fontStyle: 'italic',
        paddingTop: 6,
        borderTop: `0.5pt solid ${colors.border}`,
    },

    // Compact Notes
    notesSection: {
        marginBottom: 8,
        padding: 8,
        backgroundColor: colors.background,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
        borderLeft: `3pt solid ${colors.primary}`,
    },

    notesTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },

    notesText: {
        fontSize: 8,
        color: colors.textSecondary,
        lineHeight: 1.3,
    },

    summarySection: {
        backgroundColor: colors.white,
        borderTop: `1pt solid ${colors.border}`,
        width: '100%',
    },

    summaryRow: {
        flexDirection: 'row',
        padding: 6,
        borderBottom: `0.5pt solid ${colors.border}`,
        alignItems: 'center',
        width: '100%',
    },

    summaryLabel: {
        fontSize: 9,
        color: colors.text,
        fontWeight: 'bold',
    },

    summaryValue: {
        fontSize: 9,
        color: colors.text,
        fontWeight: 'bold',
    },
});

// Helper functions (shared across all templates)
const formatCurrency = (value) => {
    const numericValue = parseFloat(value) || 0;
    return "₹" + numericValue.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    });
};

const formatDate = (date) => {
    if (!date) return "";
    try {
        if (date instanceof Date) {
            return date.toLocaleDateString("en-GB");
        }
        return new Date(date).toLocaleDateString("en-GB");
    } catch (error) {
        return "Invalid Date";
    }
};

const numberToWords = (num) => {
    if (isNaN(num) || num === 0) return "Zero";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convertHundreds = (n) => {
        let result = "";
        if (n > 99) {
            result += ones[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n > 19) {
            result += tens[Math.floor(n / 10)] + " ";
            n %= 10;
        }
        if (n > 0) {
            result += ones[n] + " ";
        }
        return result;
    };

    const convertToWords = (n) => {
        if (n === 0) return "Zero";
        let result = "";

        if (n >= 10000000) {
            result += convertHundreds(Math.floor(n / 10000000)) + "Crore ";
            n %= 10000000;
        }
        if (n >= 100000) {
            result += convertHundreds(Math.floor(n / 100000)) + "Lakh ";
            n %= 100000;
        }
        if (n >= 1000) {
            result += convertHundreds(Math.floor(n / 1000)) + "Thousand ";
            n %= 1000;
        }
        result += convertHundreds(n);
        return result.trim();
    };

    return convertToWords(Math.floor(num)) + " Only";
};

const calculateTotals = (items, invoice) => {
    const subtotal = items.reduce((sum, item) => {
        const amount = parseFloat(item.amount) || (parseFloat(item.quantity) * parseFloat(item.rate)) || 0;
        return sum + amount;
    }, 0);

    // Get GST details from invoice object
    const customerStateCode = invoice.customerStateCode;
    const cgstAmount = invoice.cgstAmount || 0;
    const sgstAmount = invoice.sgstAmount || 0;
    const igstAmount = invoice.igstAmount || 0;
    const cgstRate = invoice.cgstRate || 0;
    const sgstRate = invoice.sgstRate || 0;
    const igstRate = invoice.igstRate || 0;
    const totalGST = invoice.totalGST || 0;

    // Determine if we're in preview mode
    const isPreviewMode = invoice.isPreviewMode || false;

    // Get GST display settings with defaults
    const gstDisplaySettings = invoice.gstDisplaySettings || {
        defaultMode: 'split',
        showSplitByDefault: true
    };

    // Smart GST display logic with preview mode handling:
    let shouldShowSplit = false;

    if (isPreviewMode) {
        // In preview mode, respect the settings
        shouldShowSplit = gstDisplaySettings.showSplitByDefault && gstDisplaySettings.defaultMode === 'split';
        console.log('🔍 [ClassicBlueTemplate] Preview Mode GST Display:', {
            showSplitByDefault: gstDisplaySettings.showSplitByDefault,
            defaultMode: gstDisplaySettings.defaultMode,
            shouldShowSplit
        });
    } else {
        // In normal mode, use business logic
        shouldShowSplit = invoice.isIntraState;
        console.log('🔍 [ClassicBlueTemplate] Normal Mode GST Display:', {
            customerStateCode,
            isIntraState: invoice.isIntraState,
            shouldShowSplit
        });
    }

    console.log('💰 [ClassicBlueTemplate] GST Display Logic:', {
        isPreviewMode,
        customerStateCode,
        defaultMode: gstDisplaySettings.defaultMode,
        isIntraState: invoice.isIntraState,
        shouldShowSplit,
        cgstAmount,
        sgstAmount,
        igstAmount,
        gstDisplaySettings
    });

    return {
        subtotal,
        cgstRate,
        sgstRate,
        igstRate,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalGST,
        customerStateCode,
        shouldShowSplit,
        isPreviewMode,
        grandTotal: subtotal + totalGST
    };
};

// Template Components
// Refactored Header: Compact, logo left, company info right, GSTIN included
const InvoiceHeader = ({ invoice, dynamicStyles }) => (
    <View style={[styles.header, { marginBottom: 6, paddingBottom: 6 }]}> {/* Reduce spacing */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {/* Logo on the left */}
            <View style={{ maxWidth: 90, height: 50, marginRight: 12, justifyContent: 'flex-start' }}>
                <Image
                    src={invoice.company?.logo || "/cyphersol-logo.png"}
                    style={{ maxWidth: '100%', height: '100%', objectFit: 'contain' }}
                />
            </View>
            {/* Company info stacked to the right of logo */}
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }}>
                <Text style={[styles.headerCompanyName, { fontSize: 14, marginBottom: 1 }]}>{invoice.company?.companyName || 'Company Name'}</Text>
                {invoice.company?.addressLine1 && (
                    <Text style={[styles.addressText, { fontSize: 8, marginBottom: 0 }]}>{invoice.company.addressLine1}</Text>
                )}
                <Text style={[styles.addressText, { fontSize: 8, marginBottom: 0 }]}>
                    {invoice.company?.city && `${invoice.company.city}, `}
                    {invoice.company?.state && `${invoice.company.state} `}
                    {invoice.company?.zip}
                </Text>
                {invoice.company?.contactNo && (
                    <Text style={[styles.addressText, { fontSize: 8, marginBottom: 0 }]}>Ph: {invoice.company.contactNo}</Text>
                )}
                {invoice.company?.email && (
                    <Text style={[styles.addressText, { fontSize: 8, marginBottom: 0 }]}>Email: {invoice.company.email}</Text>
                )}
                {/* GSTIN in header */}
                {invoice.company?.gstin && (
                    <Text style={[styles.addressText, { fontSize: 8, marginBottom: 0, fontWeight: 'bold', color: colors.primary }]}>
                        GSTIN: {invoice.company.gstin}
                    </Text>
                )}
            </View>
            {/* Invoice Title and Number on the far right */}
            <View style={{ alignItems: 'flex-end', minWidth: 90 }}>
                <Text style={[styles.taxInvoiceTitle, { fontSize: 16, marginBottom: 2 }]}>TAX INVOICE</Text>
                <Text style={[styles.invoiceNumberText, { fontSize: 9 }]}>{invoice.invoiceNumber || 'INV-001'}</Text>
            </View>
        </View>
    </View>
);

// --- Step 2: Two-Column Layout for Bill To and Invoice Details ---
const InfoTwoColumn = ({ invoice, dynamicStyles }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        {/* Left: Bill To (Customer) - Hug Content Bottom */}
        <View style={{ flex: 1.2, backgroundColor: colors.background, padding: 10, paddingBottom: 0, borderRadius: 4, border: `1pt solid ${colors.border}`, marginRight: 12 }}>
            <Text style={[dynamicStyles?.sectionTitle || styles.sectionTitle, { marginBottom: 3 }]}>Bill To</Text>
            {/* Company Name (if available) */}
            {invoice.customer?.companyName && (
                <Text style={[styles.customerName, { fontSize: 11, color: colors.primary, marginBottom: 1, fontWeight: 'bold' }]}>
                    {invoice.customer.companyName}
                </Text>
            )}
            {/* Individual Customer Name */}
            <Text style={[styles.customerName, { fontSize: 10, color: colors.textSecondary, marginBottom: 2 }]}>
                {invoice.customer?.name || invoice.customerName || "Customer Name"}
            </Text>
            {invoice.customer?.addressLine1 && (
                <Text style={[styles.addressText, { lineHeight: 1.3, marginBottom: 1 }]}>{invoice.customer.addressLine1}</Text>
            )}
            {invoice.customer?.addressLine2 && (
                <Text style={[styles.addressText, { lineHeight: 1.3, marginBottom: 1 }]}>{invoice.customer.addressLine2}</Text>
            )}
            <Text style={[styles.addressText, { lineHeight: 1.3, marginBottom: 1 }]}> {[
                invoice.customer?.city,
                invoice.customer?.state,
                invoice.customer?.zip
            ].filter(Boolean).join(", ")} </Text>
            {(invoice.customer?.phone || invoice.customer?.email) && (
                <View style={{ marginBottom: 1 }}>
                    {invoice.customer?.phone && (
                        <Text style={[styles.addressText, { lineHeight: 1.3 }]}>Ph: {invoice.customer.phone}</Text>
                    )}
                    {invoice.customer?.email && (
                        <Text style={[styles.addressText, { lineHeight: 1.3 }]}>Email: {invoice.customer.email}</Text>
                    )}
                </View>
            )}
            {(invoice.isPreviewMode || invoice.customer?.gstApplicable === 'Yes') && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
                    <Text style={{ fontSize: 9, color: colors.textSecondary, lineHeight: 1.3 }}>GSTIN:</Text>
                    <Text style={{ marginLeft: 4, fontSize: 9, color: colors.primary, fontWeight: 'bold', lineHeight: 1.3 }}>{invoice.customer?.gstin || (invoice.isPreviewMode ? '27ABCDE1234F1Z5' : '')}</Text>
                </View>
            )}
        </View>
        {/* Right: Invoice Details - Hug Content Bottom */}
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 10, paddingBottom: 0, borderRadius: 4, border: `1pt solid ${colors.border}` }}>
            <Text style={[dynamicStyles?.sectionTitle || styles.sectionTitle, { marginBottom: 6 }]}>Invoice Details</Text>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Invoice No:</Text>
                <Text style={styles.infoValue}>{invoice.invoiceNumber || "INV-001"}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Invoice Date:</Text>
                <Text style={styles.infoValue}>{formatDate(invoice.invoiceDate)}</Text>
            </View>
            {/* Conditionally show Payment Date if available */}
            {invoice.paidDate && (
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Payment Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(invoice.paidDate)}</Text>
                </View>
            )}
            {/* Conditionally show Due Date if available and not paid */}
            {invoice.dueDate && !invoice.paidDate && (
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Due Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(invoice.dueDate)}</Text>
                </View>
            )}
            {/* Conditionally show Payment Terms if available and not paid */}
            {invoice.paymentTerms && !invoice.paidDate && (
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Terms:</Text>
                    <Text style={styles.infoValue}>{invoice.paymentTerms ? `Net ${invoice.paymentTerms}` : "Net 30"}</Text>
                </View>
            )}
        </View>
    </View>
);

const CustomerInfo = ({ invoice, dynamicStyles }) => (
    <View style={[styles.customerSection, { marginBottom: 12 }]}>
        <Text style={[dynamicStyles?.sectionTitle || styles.sectionTitle, { marginBottom: 6 }]}>Bill To</Text>

        {/* Customer Name with enhanced styling */}
        <Text style={[styles.customerName, {
            fontSize: 12,
            color: colors.primary,
            letterSpacing: 0.3,
            marginBottom: 6
        }]}>
            {invoice.customer?.name || invoice.customerName || "Customer Name"}
        </Text>

        {/* Address Block */}
        <View style={{ marginBottom: 6 }}>
            {invoice.customer?.addressLine1 && (
                <Text style={[styles.addressText, { lineHeight: 1.4 }]}>
                    {invoice.customer.addressLine1}
                </Text>
            )}
            {/* City, State, ZIP in one line */}
            <Text style={[styles.addressText, { lineHeight: 1.4 }]}>
                {[
                    invoice.customer?.city,
                    invoice.customer?.state,
                    invoice.customer?.zip
                ].filter(Boolean).join(", ")}
            </Text>
        </View>

        {/* Contact Information */}
        {(invoice.customer?.phone || invoice.customer?.email) && (
            <View style={{ marginBottom: 6 }}>
                {invoice.customer?.phone && (
                    <Text style={[styles.addressText, { lineHeight: 1.4 }]}>
                        Ph: {invoice.customer.phone}
                    </Text>
                )}
                {invoice.customer?.email && (
                    <Text style={[styles.addressText, { lineHeight: 1.4 }]}>
                        Email: {invoice.customer.email}
                    </Text>
                )}
            </View>
        )}

        {/* GSTIN with better color differentiation */}
        {(invoice.isPreviewMode || invoice.customer?.gstApplicable === 'Yes') && (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 2
            }}>
                <Text style={{
                    fontSize: 9,
                    color: colors.textSecondary,
                    lineHeight: 1.4
                }}>
                    GSTIN:
                </Text>
                <Text style={{
                    marginLeft: 4,
                    fontSize: 9,
                    color: colors.primary,
                    fontWeight: 'bold',
                    lineHeight: 1.4
                }}>
                    {invoice.customer?.gstin || (invoice.isPreviewMode ? '27ABCDE1234F1Z5' : '')}
                </Text>
            </View>
        )}
    </View>
);

// Streamlined Totals Section - More Compact
const ItemsTable = ({ invoice, totals, dynamicStyles }) => {
    const items = invoice.items || [];
    const tableHeaderCellStyle = dynamicStyles?.tableHeaderCell || styles.tableHeaderCell;
    const tableCellStyle = dynamicStyles?.tableCell || styles.tableCell;

    return (
        <View style={styles.tableContainer}>
            {/* Header Row */}
            <View style={styles.tableHeader}>
                <Text style={[tableHeaderCellStyle, { width: '5%', textAlign: 'right', paddingRight: 8 }]}>NO.</Text>
                <Text style={[tableHeaderCellStyle, { width: '35%', textAlign: 'left', paddingLeft: 4 }]}>DESCRIPTION</Text>
                <Text style={[tableHeaderCellStyle, { width: '15%', textAlign: 'right', paddingRight: 8 }]}>HSN/SAC</Text>
                <Text style={[tableHeaderCellStyle, { width: '10%', textAlign: 'right', paddingRight: 8 }]}>QTY</Text>
                <Text style={[tableHeaderCellStyle, { width: '13%', textAlign: 'right', paddingRight: 8 }]}>RATE</Text>
                <Text style={[tableHeaderCellStyle, { width: '10%', textAlign: 'right', paddingRight: 8 }]}>UNIT</Text>
                <Text style={[tableHeaderCellStyle, { width: '12%', textAlign: 'right', paddingRight: 8 }]}>AMOUNT</Text>
            </View>

            {/* Item Rows */}
            {items.map((item, index) => {
                const qty = parseFloat(item.quantity) || 1;
                const rate = parseFloat(item.rate) || 0;
                const amount = parseFloat(item.amount) || (qty * rate);

                return (
                    <View key={index} style={[styles.tableRow, index % 2 === 1 && { backgroundColor: colors.background }]}>
                        <Text style={[tableCellStyle, { width: '5%', textAlign: 'right', paddingRight: 8 }]}>{index + 1}</Text>
                        <Text style={[tableCellStyle, { width: '35%', textAlign: 'left', paddingLeft: 4 }]}>{item.details || item.name || "Item"}</Text>
                        <Text style={[tableCellStyle, { width: '15%', textAlign: 'right', paddingRight: 8 }]}>{item.hsn || "998391"}</Text>
                        <Text style={[tableCellStyle, { width: '10%', textAlign: 'right', paddingRight: 8 }]}>{qty}</Text>
                        <Text style={[tableCellStyle, { width: '13%', textAlign: 'right', paddingRight: 8 }]}>{formatCurrency(rate).replace('₹', '')}</Text>
                        <Text style={[tableCellStyle, { width: '10%', textAlign: 'right', paddingRight: 8 }]}>{item.per || "Nos"}</Text>
                        <Text style={[tableCellStyle, { width: '12%', textAlign: 'right', paddingRight: 8 }]}>{formatCurrency(amount).replace('₹', '')}</Text>
                    </View>
                );
            })}

            {/* Compact Summary Section */}
            <View style={styles.summarySection}>
                {/* Subtotal */}
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { width: '88%', textAlign: 'right', paddingRight: 8 }]}>Sub Total:</Text>
                    <Text style={[styles.summaryValue, { width: '12%', textAlign: 'right', paddingRight: 8 }]}>{formatCurrency(totals.subtotal).replace('₹', '')}</Text>
                </View>

                {/* GST Section */}
                {totals.shouldShowSplit ? (
                    <>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { width: '88%', textAlign: 'right', paddingRight: 8 }]}>CGST ({totals.cgstRate}%):</Text>
                            <Text style={[styles.summaryValue, { width: '12%', textAlign: 'right', paddingRight: 8 }]}>{formatCurrency(totals.cgstAmount).replace('₹', '')}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { width: '88%', textAlign: 'right', paddingRight: 8 }]}>SGST ({totals.sgstRate}%):</Text>
                            <Text style={[styles.summaryValue, { width: '12%', textAlign: 'right', paddingRight: 8 }]}>{formatCurrency(totals.sgstAmount).replace('₹', '')}</Text>
                        </View>
                    </>
                ) : (
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { width: '88%', textAlign: 'right', paddingRight: 8 }]}>IGST ({totals.igstRate}%):</Text>
                        <Text style={[styles.summaryValue, { width: '12%', textAlign: 'right', paddingRight: 8 }]}>{formatCurrency(totals.igstAmount).replace('₹', '')}</Text>
                    </View>
                )}

                {/* Compact Grand Total with Inline Amount in Words */}
                <View style={[styles.totalRow, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }]}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 10, color: colors.white, fontStyle: 'italic', lineHeight: 1.2, marginRight: 6 }}>
                            Amount in Words:
                        </Text>
                        <Text style={{
                            fontSize: 11, // value stays large
                            color: colors.white,
                            fontWeight: 'bold',
                            fontStyle: 'normal',
                            marginRight: 8,
                        }}>
                            INR {numberToWords(totals.grandTotal)}
                        </Text>
                    </View>
                    {/* Grand Total aligned like summary/tax rows */}
                    <Text style={{
                        ...styles.totalLabel,
                        paddingRight: 8,
                        fontSize: 9,
                        fontWeight: 'bold',
                    }}>
                        GRAND TOTAL:
                    </Text>
                    <Text style={{
                        ...styles.totalAmount,
                        width: '12%',
                        textAlign: 'right',
                        paddingRight: 8,
                        fontSize: 9,
                        fontWeight: 'bold',
                    }}>
                        {formatCurrency(totals.grandTotal).replace('₹', '')}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const TaxableValueSection = ({ invoice, totals, dynamicStyles }) => {
    // Group items by HSN/SAC
    const items = invoice.items || [];
    const isIntraState = totals.shouldShowSplit;
    const cgstRate = totals.cgstRate || 0;
    const sgstRate = totals.sgstRate || 0;
    const igstRate = totals.igstRate || 0;

    // Group by HSN
    const hsnGroups = {};
    items.forEach(item => {
        const hsn = item.hsn || 'N/A';
        if (!hsnGroups[hsn]) {
            hsnGroups[hsn] = { taxable: 0, items: [] };
        }
        hsnGroups[hsn].taxable += parseFloat(item.amount) || 0;
        hsnGroups[hsn].items.push(item);
    });

    // Prepare rows
    const rows = Object.entries(hsnGroups).map(([hsn, group]) => {
        const taxable = group.taxable;
        let cgst = 0, sgst = 0, igst = 0, totalTax = 0;
        if (isIntraState) {
            cgst = taxable * (cgstRate / 100);
            sgst = taxable * (sgstRate / 100);
            totalTax = cgst + sgst;
        } else {
            igst = taxable * (igstRate / 100);
            totalTax = igst;
        }
        return {
            hsn,
            taxable,
            cgst,
            sgst,
            igst,
            totalTax
        };
    });

    // Totals
    const totalTaxable = rows.reduce((sum, r) => sum + r.taxable, 0);
    const totalCgst = rows.reduce((sum, r) => sum + r.cgst, 0);
    const totalSgst = rows.reduce((sum, r) => sum + r.sgst, 0);
    const totalIgst = rows.reduce((sum, r) => sum + r.igst, 0);
    const totalTaxAmount = rows.reduce((sum, r) => sum + r.totalTax, 0);

    return (
        <View style={styles.taxableValueSection}>
            {/* Table Header */}
            <View style={[styles.taxableValueHeader, { alignItems: 'center' }]}>
                <Text style={[styles.taxableValueHeaderCell, { width: '18%', textAlign: 'left' }]}>HSN/SAC</Text>
                <Text style={[styles.taxableValueHeaderCell, { width: '18%', textAlign: 'right' }]}>Taxable Value</Text>
                {isIntraState ? (
                    <>
                        <Text style={[styles.taxableValueHeaderCell, { width: '12%', textAlign: 'center' }]}>CGST Rate</Text>
                        <Text style={[styles.taxableValueHeaderCell, { width: '12%', textAlign: 'right' }]}>CGST Amt</Text>
                        <Text style={[styles.taxableValueHeaderCell, { width: '12%', textAlign: 'center' }]}>SGST Rate</Text>
                        <Text style={[styles.taxableValueHeaderCell, { width: '12%', textAlign: 'right' }]}>SGST Amt</Text>
                    </>
                ) : (
                    <>
                        <Text style={[styles.taxableValueHeaderCell, { width: '12%', textAlign: 'center' }]}>IGST Rate</Text>
                        <Text style={[styles.taxableValueHeaderCell, { width: '12%', textAlign: 'right' }]}>IGST Amt</Text>
                    </>
                )}
                <Text style={[styles.taxableValueHeaderCell, { width: '16%', textAlign: 'right' }]}>Total Tax Amount</Text>
            </View>
            {/* Table Rows */}
            {rows.map((row, idx) => (
                <View key={row.hsn + idx} style={styles.taxableValueRow}>
                    <Text style={[styles.taxableValueCell, { width: '18%', textAlign: 'left' }]}>{row.hsn}</Text>
                    <Text style={[styles.taxableValueCell, { width: '18%', textAlign: 'right' }]}>{row.taxable.toFixed(2)}</Text>
                    {isIntraState ? (
                        <>
                            <Text style={[styles.taxableValueCell, { width: '12%', textAlign: 'center' }]}>{cgstRate}%</Text>
                            <Text style={[styles.taxableValueCell, { width: '12%', textAlign: 'right' }]}>{row.cgst.toFixed(2)}</Text>
                            <Text style={[styles.taxableValueCell, { width: '12%', textAlign: 'center' }]}>{sgstRate}%</Text>
                            <Text style={[styles.taxableValueCell, { width: '12%', textAlign: 'right' }]}>{row.sgst.toFixed(2)}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={[styles.taxableValueCell, { width: '12%', textAlign: 'center' }]}>{igstRate}%</Text>
                            <Text style={[styles.taxableValueCell, { width: '12%', textAlign: 'right' }]}>{row.igst.toFixed(2)}</Text>
                        </>
                    )}
                    <Text style={[styles.taxableValueCell, { width: '16%', textAlign: 'right', fontWeight: 'bold' }]}>{row.totalTax.toFixed(2)}</Text>
                </View>
            ))}
            {/* Total Row */}
            <View style={[styles.taxableValueRow, { backgroundColor: colors.background }]}>
                <Text style={[styles.taxableValueCell, { width: '18%', textAlign: 'left', fontWeight: 'bold' }]}>Total</Text>
                <Text style={[styles.taxableValueCell, { width: '18%', textAlign: 'right', fontWeight: 'bold' }]}>{totalTaxable.toFixed(2)}</Text>
                {isIntraState ? (
                    <>
                        <Text style={[styles.taxableValueCell, { width: '12%', textAlign: 'center', fontWeight: 'bold' }]}>{cgstRate}%</Text>
                        <Text style={[styles.taxableValueCell, { width: '12%', textAlign: 'right', fontWeight: 'bold' }]}>{totalCgst.toFixed(2)}</Text>
                        <Text style={[styles.taxableValueCell, { width: '12%', textAlign: 'center', fontWeight: 'bold' }]}>{sgstRate}%</Text>
                        <Text style={[styles.taxableValueCell, { width: '12%', textAlign: 'right', fontWeight: 'bold' }]}>{totalSgst.toFixed(2)}</Text>
                    </>
                ) : (
                    <>
                        <Text style={[styles.taxableValueCell, { width: '12%', textAlign: 'center', fontWeight: 'bold' }]}>{igstRate}%</Text>
                        <Text style={[styles.taxableValueCell, { width: '12%', textAlign: 'right', fontWeight: 'bold' }]}>{totalIgst.toFixed(2)}</Text>
                    </>
                )}
                <Text style={[styles.taxableValueCell, { width: '16%', textAlign: 'right', fontWeight: 'bold' }]}>{totalTaxAmount.toFixed(2)}</Text>
            </View>
        </View>
    );
};

// Compact Bank Details Section
const BankDetails = ({ invoice, dynamicStyles }) => (
    <View style={[styles.bankDetailsSection, { padding: 6, marginBottom: 6 }]}>
        <Text style={[styles.bankDetailsTitle, { fontSize: 8, marginBottom: 3 }]}>Company's Bank Details</Text>
        <View style={[styles.bankDetailsRow, { marginBottom: 2 }]}>
            <Text style={[styles.bankDetailsLabel, { fontSize: 7, width: '25%' }]}>BANK:</Text>
            <Text style={[styles.bankDetailsValue, { fontSize: 7, width: '75%' }]}>{invoice.company?.bankName || "Karnataka Bank"}</Text>
        </View>
        <View style={[styles.bankDetailsRow, { marginBottom: 2 }]}>
            <Text style={[styles.bankDetailsLabel, { fontSize: 7, width: '25%' }]}>A/C NO.:</Text>
            <Text style={[styles.bankDetailsValue, { fontSize: 7, width: '75%' }]}>{invoice.company?.accountNumber || "6272000100026401"}</Text>
        </View>
        <View style={[styles.bankDetailsRow, { marginBottom: 2 }]}>
            <Text style={[styles.bankDetailsLabel, { fontSize: 7, width: '25%' }]}>IFSC:</Text>
            <Text style={[styles.bankDetailsValue, { fontSize: 7, width: '75%' }]}>{invoice.company?.ifscCode || "KARB0000627"}</Text>
        </View>
        <View style={[styles.bankDetailsRow, { marginBottom: 0 }]}>
            <Text style={[styles.bankDetailsLabel, { fontSize: 7, width: '25%' }]}>BRANCH:</Text>
            <Text style={[styles.bankDetailsValue, { fontSize: 7, width: '75%' }]}>{invoice.company?.bankBranch || "CBS"}</Text>
        </View>
    </View>
);

// Compact Footer Section
const Footer = ({ invoice, dynamicStyles }) => (
    <View style={[styles.footerSection, { marginBottom: 4, gap: 6 }]}>
        <View style={[styles.declarationBox, { padding: 8 }]}>
            <Text style={[styles.declarationTitle, { fontSize: 8, marginBottom: 4 }]}>Declaration</Text>
            <Text style={[styles.declarationText, { fontSize: 7, lineHeight: 1.2 }]}>
                All payments made via cheques to be addressed to: CypherSOL Fintech India Pvt. Ltd.
            </Text>
        </View>

        <View style={[styles.signatureBox, { padding: 8 }]}>
            <View style={[styles.signatureArea, { minHeight: 20, marginBottom: 6 }]}>
                <Image
                    src={invoice.signature || "/signature.jpg"}
                    style={{ width: 60, height: 30 }}
                />
            </View>
            <Text style={[styles.signatureText, { fontSize: 7, marginBottom: 2 }]}>
                for {invoice.company?.companyName || "Company Name"}
            </Text>
            <Text style={[styles.authorizedSignatory, { fontSize: 7 }]}>Authorized Signatory</Text>
        </View>
    </View>
);

// Compact Notes Section
const NotesSection = ({ invoice, dynamicStyles, fontScale }) => (
    invoice.customerNotes && (
        <View style={[styles.notesSection, { padding: 6, marginBottom: 6 }]}>
            <Text style={[styles.notesTitle, { fontSize: 8 * fontScale, marginBottom: 3 }]}>Notes:</Text>
            <Text style={[styles.notesText, { fontSize: 7 * fontScale, lineHeight: 1.2 }]}>{invoice.customerNotes}</Text>
        </View>
    )
);

// Main Classic Blue Template Component
export const ClassicBlueTemplate = (invoice) => {
    // Add debug logging
    console.log('🔍 ClassicBlueTemplate - Invoice Data:', {
        fullInvoice: invoice,
        company: invoice?.company,
        logo: invoice?.company?.logo,
        companyName: invoice?.company?.companyName
    });

    const totals = calculateTotals(invoice.items || [], invoice);

    // Get dynamic settings from invoice data
    const pageSize = invoice.pageSize || invoice.templateSettings?.pageSize || 'A4';
    const fontSize = invoice.templateSettings?.fontSize || 'normal';

    // Calculate font scale based on fontSize setting
    const getFontScale = () => {
        switch (fontSize) {
            case 'small': return 0.85;
            case 'large': return 1.15;
            case 'normal':
            default: return 1.0;
        }
    };

    const fontScale = getFontScale();

    // Create dynamic styles based on settings with safe property access
    let dynamicStyles;
    try {
        dynamicStyles = StyleSheet.create({
            page: {
                ...styles.page,
                fontSize: (styles.page?.fontSize || 9) * fontScale,
            },
            headerCompanyName: {
                ...styles.headerCompanyName,
                fontSize: (styles.headerCompanyName?.fontSize || 20) * fontScale,
            },
            taxInvoiceTitle: {
                ...styles.taxInvoiceTitle,
                fontSize: (styles.taxInvoiceTitle?.fontSize || 24) * fontScale,
            },
            companyName: {
                ...styles.companyName,
                fontSize: (styles.companyName?.fontSize || 14) * fontScale,
            },
            sectionTitle: {
                ...styles.sectionTitle,
                fontSize: (styles.sectionTitle?.fontSize || 11) * fontScale,
            },
            tableHeaderCell: {
                ...styles.tableHeaderCell,
                fontSize: (styles.tableHeaderCell?.fontSize || 9) * fontScale,
            },
            tableCell: {
                ...styles.tableCell,
                fontSize: (styles.tableCell?.fontSize || 9) * fontScale,
            }
        });
    } catch (error) {
        console.warn('⚠️ [ClassicBlueTemplate] Failed to create dynamic styles, using fallback:', error);
        // Fallback to static styles
        dynamicStyles = {
            page: styles.page,
            headerCompanyName: styles.headerCompanyName,
            taxInvoiceTitle: styles.taxInvoiceTitle,
            companyName: styles.companyName,
            sectionTitle: styles.sectionTitle,
            tableHeaderCell: styles.tableHeaderCell,
            tableCell: styles.tableCell
        };
    }

    console.log(`🎨 [ClassicBlueTemplate] Rendering with settings:`, {
        pageSize,
        fontSize,
        fontScale,
        hasTemplateSettings: !!invoice.templateSettings,
        companyName: invoice.company?.companyName,
        hasLogo: !!invoice.company?.logo,
        logoPath: invoice.company?.logo,
        itemCount: invoice.items?.length,
        hasDynamicStyles: !!dynamicStyles,
        invoiceStructure: {
            hasInvoiceNumber: !!invoice.invoiceNumber,
            hasCompany: !!invoice.company,
            hasCustomer: !!invoice.customer,
            hasItems: !!invoice.items,
            totalsCalculated: !!totals
        }
    });

    try {

        console.log('🧩 Page Size Type:', typeof pageSize);
        console.log('🧩 Page Size Constructor:', pageSize?.constructor?.name);
        console.log('🧩 Page Size:', pageSize);

        return (
            <Document>
                <Page size={pageSize} style={dynamicStyles.page}>
                    <InvoiceHeader invoice={invoice} dynamicStyles={dynamicStyles} />
                    <InfoTwoColumn invoice={invoice} dynamicStyles={dynamicStyles} />
                    <ItemsTable invoice={invoice} totals={totals} dynamicStyles={dynamicStyles} />
                    {/* Always show Taxable Value Section when there's a subtotal */}
                    <TaxableValueSection invoice={invoice} totals={totals} dynamicStyles={dynamicStyles} />
                    {/* Removed CompanyTaxInfo - GSTIN is now in header */}
                    {/* Bank Details Section */}
                    <BankDetails invoice={invoice} dynamicStyles={dynamicStyles} />
                    <Footer invoice={invoice} dynamicStyles={dynamicStyles} />
                    <NotesSection invoice={invoice} dynamicStyles={dynamicStyles} fontScale={fontScale} />
                    <Text style={[styles.footer, { fontSize: (styles.footer?.fontSize || 7) * fontScale }]}>This is a Computer Generated Invoice</Text>
                </Page>
            </Document>
        );
    } catch (error) {
        console.error('❌ [ClassicBlueTemplate] Failed to create PDF document:', error);

        // Return a simple fallback document
        return (
            <Document>
                <Page size="A4" style={{ padding: 30, fontFamily: 'Helvetica' }}>
                    <View style={{ textAlign: 'center', marginBottom: 20 }}>
                        <Text style={{ fontSize: 24, color: '#e74c3c', marginBottom: 10 }}>Template Error</Text>
                        <Text style={{ fontSize: 12 }}>Unable to render the full template.</Text>
                        <Text style={{ fontSize: 10, marginTop: 10 }}>
                            Error: {error.message || 'Unknown PDF rendering error'}
                        </Text>
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 12, marginBottom: 5 }}>Invoice: {invoice.invoiceNumber}</Text>
                        <Text style={{ fontSize: 12, marginBottom: 5 }}>Company: {invoice.company?.companyName}</Text>
                        <Text style={{ fontSize: 12, marginBottom: 5 }}>Customer: {invoice.customer?.name}</Text>
                        <Text style={{ fontSize: 12 }}>Total: ₹{totals.grandTotal?.toLocaleString('en-IN')}</Text>
                    </View>
                </Page>
            </Document>
        );
    }
};

export default ClassicBlueTemplate;