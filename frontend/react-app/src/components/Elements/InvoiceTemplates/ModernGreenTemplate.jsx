import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Modern Green Template - Fresh and professional design
const colors = {
    primary: '#10b981',      // Emerald Green
    secondary: '#059669',    // Forest Green
    accent: '#34d399',       // Light Green
    text: '#111827',         // Near Black
    textSecondary: '#4b5563', // Gray
    border: '#d1d5db',       // Light Gray
    background: '#f9fafb',   // Off White
    white: '#ffffff',
    success: '#059669',      // Forest Green
    warning: '#f59e0b'       // Amber
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
        alignItems: 'center',
    },

    logoContainer: {
        width: 80,
        height: 40,
        marginRight: 15,
    },

    companyInfo: {
        flex: 1,
    },

    headerCompanyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 2,
        letterSpacing: 0.5,
    },

    headerTagline: {
        fontSize: 8,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },

    headerRight: {
        alignItems: 'flex-end',
    },

    taxInvoiceTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 5,
        letterSpacing: 1,
    },

    invoiceNumberText: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: 'bold',
    },

    // Company and Invoice Info Section
    infoSection: {
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'space-between',
    },

    companyInfoSection: {
        flex: 1.5,
        marginRight: 15,
    },

    invoiceInfoSection: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 8,
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

    // Customer Section
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

    // Table Styles
    tableContainer: {
        marginBottom: 8,
        borderRadius: 4,
        overflow: 'hidden',
        border: `1pt solid ${colors.border}`,
        backgroundColor: colors.white,
    },

    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        padding: 6,
    },

    tableHeaderCell: {
        color: colors.white,
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },

    tableRow: {
        flexDirection: 'row',
        padding: 3,
        borderBottom: `0.5pt solid ${colors.border}`,
        minHeight: 16,
        alignItems: 'center',
    },

    tableRowAlt: {
        backgroundColor: colors.background,
    },

    tableCell: {
        fontSize: 8,
        color: colors.text,
        paddingHorizontal: 3,
        paddingVertical: 1,
        display: 'flex',
        alignItems: 'center',
        lineHeight: 1.2,
    },

    tableCellCenter: {
        textAlign: 'center',
    },

    tableCellRight: {
        textAlign: 'right',
    },

    // Column widths
    col1: { width: '5%' },   // Sl.
    col2: { width: '40%' },  // Description
    col3: { width: '10%' },  // HSN/SAC
    col4: { width: '7%' },   // Qty
    col5: { width: '12%' },  // Rate
    col6: { width: '8%' },   // Unit
    col7: { width: '18%' },  // Amount

    // Tax and Total Rows
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

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: colors.success,
    },

    totalLabel: {
        fontSize: 11,
        color: colors.white,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    totalAmount: {
        fontSize: 12,
        color: colors.white,
        fontWeight: 'bold',
    },

    // Amount in Words
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

    // Footer Section
    footerSection: {
        flexDirection: 'row',
        marginBottom: 6,
        gap: 8,
    },

    declarationBox: {
        flex: 2,
        backgroundColor: colors.background,
        padding: 8,
        borderRadius: 4,
        border: `1pt solid ${colors.border}`,
    },

    signatureBox: {
        flex: 1,
        backgroundColor: colors.white,
        padding: 8,
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
        minHeight: 20,
        marginBottom: 6,
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

    // Footer
    footer: {
        textAlign: 'center',
        fontSize: 7,
        color: colors.textSecondary,
        fontStyle: 'italic',
        paddingTop: 6,
        borderTop: `0.5pt solid ${colors.border}`,
    },

    // Notes
    notesSection: {
        marginBottom: 6,
        padding: 6,
        backgroundColor: colors.background,
        borderRadius: 4,
        border: `0.5pt solid ${colors.border}`,
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

    const cgstRate = parseFloat(invoice.cgstRate) || 9;
    const sgstRate = parseFloat(invoice.sgstRate) || 9;
    const cgstAmount = subtotal * (cgstRate / 100);
    const sgstAmount = subtotal * (sgstRate / 100);
    const grandTotal = subtotal + cgstAmount + sgstAmount;

    return { subtotal, cgstRate, sgstRate, cgstAmount, sgstAmount, grandTotal };
};

// Template Components
const ModernHeader = ({ invoice, dynamicStyles }) => (
    <View style={styles.header}>
        <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
                <View style={styles.companyInfo}>
                    <View style={{ width: 120, height: 'auto', marginBottom: 8 }}>
                        <Image
                            src={invoice.company?.logo || "/cyphersol-logo.png"}
                        />
                    </View>
                    <Text style={styles.headerTagline}>
                        {invoice.company?.companyName || "Cyphersol Technologies"}
                    </Text>
                </View>
            </View>

            <View style={styles.headerRight}>
                <Text style={dynamicStyles?.taxInvoiceTitle || styles.taxInvoiceTitle}>
                    TAX INVOICE
                </Text>
                <Text style={styles.invoiceNumberText}>
                    {invoice.invoiceNumber || "INV-001"}
                </Text>
            </View>
        </View>
    </View>
);

const ModernCompanyInfo = ({ invoice, dynamicStyles }) => (
    <View style={styles.infoSection}>
        <View style={styles.companyInfoSection}>
            <Text style={dynamicStyles?.sectionTitle || styles.sectionTitle}>Bill From</Text>
            <Text style={dynamicStyles?.companyName || styles.companyName}>
                {invoice.company?.companyName || "Cyphersol Technologies"}
            </Text>
            {invoice.company?.addressLine1 && (
                <Text style={styles.addressText}>{invoice.company.addressLine1}</Text>
            )}
            <Text style={styles.addressText}>
                {invoice.company?.city && `${invoice.company.city}, `}
                {invoice.company?.state && `${invoice.company.state} `}
                {invoice.company?.zip}
            </Text>
            {invoice.company?.phone && (
                <Text style={styles.addressText}>Ph: {invoice.company.phone}</Text>
            )}
            {invoice.company?.email && (
                <Text style={styles.addressText}>Email: {invoice.company.email}</Text>
            )}
            {invoice.company?.gstin && (
                <Text style={styles.gstinText}>GSTIN: {invoice.company.gstin}</Text>
            )}
        </View>

        <View style={styles.invoiceInfoSection}>
            <Text style={dynamicStyles?.sectionTitle || styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Invoice No:</Text>
                <Text style={styles.infoValue}>{invoice.invoiceNumber || "INV-001"}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{formatDate(invoice.invoiceDate)}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Due Date:</Text>
                <Text style={styles.infoValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Terms:</Text>
                <Text style={styles.infoValue}>Net 30</Text>
            </View>
        </View>
    </View>
);

const ModernCustomerInfo = ({ invoice, dynamicStyles }) => (
    <View style={styles.customerSection}>
        <Text style={dynamicStyles?.sectionTitle || styles.sectionTitle}>Bill To</Text>
        <Text style={styles.customerName}>
            {invoice.customer?.name || invoice.customerName || "Customer Name"}
        </Text>
        {invoice.customer?.addressLine1 && (
            <Text style={styles.addressText}>{invoice.customer.addressLine1}</Text>
        )}
        <Text style={styles.addressText}>
            {invoice.customer?.city && `${invoice.customer.city}, `}
            {invoice.customer?.state && `${invoice.customer.state} `}
            {invoice.customer?.zip}
        </Text>
        {invoice.customer?.phone && (
            <Text style={styles.addressText}>Ph: {invoice.customer.phone}</Text>
        )}
        {invoice.customer?.email && (
            <Text style={styles.addressText}>Email: {invoice.customer.email}</Text>
        )}
    </View>
);

const ModernItemsTable = ({ invoice, totals, dynamicStyles }) => {
    const items = invoice.items || [];
    const tableHeaderCellStyle = dynamicStyles?.tableHeaderCell || styles.tableHeaderCell;
    const tableCellStyle = dynamicStyles?.tableCell || styles.tableCell;

    return (
        <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
                <Text style={[tableHeaderCellStyle, styles.col1]}>Sl.</Text>
                <Text style={[tableHeaderCellStyle, styles.col2]}>Description</Text>
                <Text style={[tableHeaderCellStyle, styles.col3]}>HSN/SAC</Text>
                <Text style={[tableHeaderCellStyle, styles.col4]}>Qty</Text>
                <Text style={[tableHeaderCellStyle, styles.col5]}>Rate</Text>
                <Text style={[tableHeaderCellStyle, styles.col6]}>Unit</Text>
                <Text style={[tableHeaderCellStyle, styles.col7]}>Amount</Text>
            </View>

            {items.map((item, index) => {
                const qty = parseFloat(item.quantity) || 1;
                const isEven = index % 2 === 0;

                return (
                    <View key={index} style={[styles.tableRow, !isEven && styles.tableRowAlt]}>
                        <View style={[styles.col1]}>
                            <Text style={[tableCellStyle, styles.tableCellCenter]}>
                                {index + 1}
                            </Text>
                        </View>
                        <View style={[styles.col2]}>
                            <Text style={[tableCellStyle]}>
                                {item.details || item.name || "Item"}
                            </Text>
                        </View>
                        <View style={[styles.col3]}>
                            <Text style={[tableCellStyle, styles.tableCellCenter]}>
                                {item.hsn || ""}
                            </Text>
                        </View>
                        <View style={[styles.col4]}>
                            <Text style={[tableCellStyle, styles.tableCellCenter]}>
                                {qty}
                            </Text>
                        </View>
                        <View style={[styles.col5]}>
                            <Text style={[tableCellStyle, styles.tableCellRight]}>
                                {formatCurrency(item.rate || 0).replace('₹', '')}
                            </Text>
                        </View>
                        <View style={[styles.col6]}>
                            <Text style={[tableCellStyle, styles.tableCellCenter]}>
                                {item.per || "Nos"}
                            </Text>
                        </View>
                        <View style={[styles.col7]}>
                            <Text style={[tableCellStyle, styles.tableCellRight]}>
                                {formatCurrency(item.amount || (qty * (item.rate || 0))).replace('₹', '')}
                            </Text>
                        </View>
                    </View>
                );
            })}

            <View style={styles.taxRow}>
                <Text style={styles.taxLabel}>CGST ({totals.cgstRate}%)</Text>
                <Text style={styles.taxAmount}>{formatCurrency(totals.cgstAmount)}</Text>
            </View>

            <View style={styles.taxRow}>
                <Text style={styles.taxLabel}>SGST ({totals.sgstRate}%)</Text>
                <Text style={styles.taxAmount}>{formatCurrency(totals.sgstAmount)}</Text>
            </View>

            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalAmount}>{formatCurrency(totals.grandTotal)}</Text>
            </View>
        </View>
    );
};

const ModernAmountInWords = ({ amount, dynamicStyles }) => (
    <View style={styles.amountWordsSection}>
        <Text style={styles.amountWordsTitle}>Amount in Words:</Text>
        <Text style={styles.amountWordsText}>
            INR {numberToWords(amount)}
        </Text>
    </View>
);

const ModernFooter = ({ invoice, dynamicStyles }) => (
    <View style={styles.footerSection}>
        <View style={styles.declarationBox}>
            <Text style={styles.declarationTitle}>Declaration</Text>
            <Text style={styles.declarationText}>
                We declare that this invoice shows the actual price of the goods described
                and that all particulars are true and correct.
            </Text>
        </View>

        <View style={styles.signatureBox}>
            <View style={styles.signatureArea}>
                {invoice.signature && (
                    <Image
                        src={invoice.signature}
                        style={{ width: 80, height: 40 }}
                    />
                )}
            </View>
            <Text style={styles.signatureText}>
                for {invoice.company?.companyName || "Company Name"}
            </Text>
            <Text style={styles.authorizedSignatory}>Authorized Signatory</Text>
        </View>
    </View>
);

// Main Modern Green Template Component
export const ModernGreenTemplate = (invoice) => {
    // Add debug logging
    console.log('🔍 ModernGreenTemplate - Invoice Data:', {
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
                fontSize: (styles.tableHeaderCell?.fontSize || 8) * fontScale,
            },
            tableCell: {
                ...styles.tableCell,
                fontSize: (styles.tableCell?.fontSize || 8) * fontScale,
            }
        });
    } catch (error) {
        console.warn('⚠️ [ModernGreenTemplate] Failed to create dynamic styles, using fallback:', error);
        // Fallback to static styles
        dynamicStyles = styles;
    }

    console.log(`🎨 [ModernGreenTemplate] Rendering with settings:`, {
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
        return (
            <Document>
                <Page size={pageSize} style={dynamicStyles.page}>
                    <ModernHeader invoice={invoice} dynamicStyles={dynamicStyles} />
                    <ModernCompanyInfo invoice={invoice} dynamicStyles={dynamicStyles} />
                    <ModernCustomerInfo invoice={invoice} dynamicStyles={dynamicStyles} />
                    <ModernItemsTable invoice={invoice} totals={totals} dynamicStyles={dynamicStyles} />
                    <ModernAmountInWords amount={totals.grandTotal} dynamicStyles={dynamicStyles} />
                    <ModernFooter invoice={invoice} dynamicStyles={dynamicStyles} />

                    {invoice.customerNotes && (
                        <View style={styles.notesSection}>
                            <Text style={[styles.notesTitle, { fontSize: (styles.notesTitle?.fontSize || 9) * fontScale }]}>Notes:</Text>
                            <Text style={[styles.notesText, { fontSize: (styles.notesText?.fontSize || 8) * fontScale }]}>{invoice.customerNotes}</Text>
                        </View>
                    )}

                    <Text style={[styles.footer, { fontSize: (styles.footer?.fontSize || 7) * fontScale }]}>
                        This is a Computer Generated Invoice
                    </Text>
                </Page>
            </Document>
        );
    } catch (error) {
        console.error('❌ [ModernGreenTemplate] Failed to create PDF document:', error);

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

export default ModernGreenTemplate;