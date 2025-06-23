import { jsPDF } from "jspdf";

export const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const usableWidth = pageWidth - (2 * margin);

    // Color scheme
    const colors = {
        primary: [41, 128, 185],
        text: [44, 62, 80],
        lightGray: [248, 249, 250],
        border: [189, 195, 199],
        accent: [39, 174, 96]
    };

    // Helper functions
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

    const truncateText = (text, maxWidth, fontSize = 9) => {
        doc.setFontSize(fontSize);
        let truncated = String(text || "");

        while (doc.getTextWidth(truncated) > maxWidth && truncated.length > 3) {
            truncated = truncated.slice(0, -1);
        }

        if (truncated.length < String(text || "").length && truncated.length > 3) {
            truncated = truncated.slice(0, -3) + "...";
        }

        return truncated;
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

    const calculateTotals = (items) => {
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

    // Start PDF generation
    let currentY = margin;
    const totals = calculateTotals(invoice.items || []);

    // === HEADER ===
    const headerHeight = 40;
    doc.setFillColor(...colors.primary);
    doc.rect(margin, currentY, usableWidth, headerHeight, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("TAX INVOICE", pageWidth / 2, currentY + 15, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Invoice #${invoice.invoiceNumber || "INV-001"}`, pageWidth / 2, currentY + 28, { align: "center" });

    currentY += headerHeight + 10;

    // === COMPANY & INVOICE DETAILS ===
    const detailsHeight = 45;
    const companyWidth = usableWidth * 0.6;
    const invoiceWidth = usableWidth * 0.4;

    // Company details
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.rect(margin, currentY, companyWidth, detailsHeight);

    let textY = currentY + 8;
    doc.setTextColor(...colors.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("FROM:", margin + 5, textY);

    textY += 8;
    doc.setFontSize(12);
    const companyName = invoice.company?.companyName || "Company Name";
    doc.text(truncateText(companyName, companyWidth - 10, 12), margin + 5, textY);

    textY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if (invoice.company?.addressLine1) {
        doc.text(truncateText(invoice.company.addressLine1, companyWidth - 10, 9), margin + 5, textY);
        textY += 5;
    }
    if (invoice.company?.city) {
        doc.text(truncateText(invoice.company.city, companyWidth - 10, 9), margin + 5, textY);
        textY += 5;
    }
    if (invoice.company?.gstin) {
        doc.setFont("helvetica", "bold");
        doc.text(`GSTIN: ${invoice.company.gstin}`, margin + 5, textY);
    }

    // Invoice details
    const invoiceStartX = margin + companyWidth;
    doc.rect(invoiceStartX, currentY, invoiceWidth, detailsHeight);

    const invoiceDetails = [
        ["Invoice No:", invoice.invoiceNumber || "INV-001"],
        ["Date:", formatDate(invoice.invoiceDate)],
        ["Due Date:", formatDate(invoice.dueDate)],
        ["Terms:", "30 Days"]
    ];

    const rowHeight = detailsHeight / invoiceDetails.length;
    const labelWidth = invoiceWidth * 0.45;

    invoiceDetails.forEach((detail, index) => {
        const y = currentY + (index * rowHeight);

        if (index > 0) {
            doc.line(invoiceStartX, y, invoiceStartX + invoiceWidth, y);
        }

        doc.line(invoiceStartX + labelWidth, currentY, invoiceStartX + labelWidth, currentY + detailsHeight);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(detail[0], invoiceStartX + 3, y + rowHeight / 2 + 2);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(truncateText(detail[1], invoiceWidth - labelWidth - 6, 9), invoiceStartX + labelWidth + 3, y + rowHeight / 2 + 2);
    });

    currentY += detailsHeight + 10;

    // === CUSTOMER DETAILS ===
    const customerHeight = 30;
    doc.rect(margin, currentY, usableWidth, customerHeight);

    textY = currentY + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("BILL TO:", margin + 5, textY);

    textY += 8;
    doc.setFontSize(12);
    const customerName = invoice.customer?.name || invoice.customerName || "Customer Name";
    doc.text(truncateText(customerName, usableWidth - 10, 12), margin + 5, textY);

    textY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if (invoice.customer?.addressLine1) {
        doc.text(truncateText(invoice.customer.addressLine1, usableWidth - 10, 9), margin + 5, textY);
    }

    currentY += customerHeight + 10;

    // === ITEMS TABLE ===
    const tableHeaderHeight = 15;
    const itemRowHeight = 12;

    // Column widths - ensure they add up to usableWidth
    const columns = [15, 85, 25, 20, 25, 20, 30]; // Total: 220
    const actualTotal = columns.reduce((sum, width) => sum + width, 0);
    if (actualTotal !== usableWidth) {
        const diff = usableWidth - actualTotal;
        columns[1] += diff; // Add difference to description column
    }

    // Table header
    doc.setFillColor(...colors.primary);
    doc.rect(margin, currentY, usableWidth, tableHeaderHeight, 'F');

    const headers = ["Sl.", "Description", "HSN/SAC", "Qty", "Rate", "Unit", "Amount"];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);

    let colX = margin;
    headers.forEach((header, i) => {
        if (i > 0) {
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(colX, currentY, colX, currentY + tableHeaderHeight);
        }

        doc.text(header, colX + columns[i] / 2, currentY + 9, { align: "center" });
        colX += columns[i];
    });

    currentY += tableHeaderHeight;

    // Table rows
    const items = invoice.items || [];
    let totalQuantity = 0;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.text);
    doc.setDrawColor(...colors.border);

    items.forEach((item, index) => {
        const qty = parseFloat(item.quantity) || 1;
        totalQuantity += qty;

        if (index % 2 === 1) {
            doc.setFillColor(...colors.lightGray);
            doc.rect(margin, currentY, usableWidth, itemRowHeight, 'F');
        }

        const rowData = [
            String(index + 1),
            item.details || item.name || "Item",
            item.hsn || "",
            String(qty),
            formatCurrency(item.rate || 0).replace('₹', ''),
            item.per || "Nos",
            formatCurrency(item.amount || (qty * (item.rate || 0))).replace('₹', '')
        ];

        colX = margin;
        rowData.forEach((data, i) => {
            let textX = colX + 2;
            let align = "left";

            if (i === 0 || i === 3 || i === 5) {
                textX = colX + columns[i] / 2;
                align = "center";
            } else if (i === 4 || i === 6) {
                textX = colX + columns[i] - 2;
                align = "right";
            }

            const displayText = truncateText(data, columns[i] - 4, 9);
            doc.text(displayText, textX, currentY + 8, { align });

            if (i < rowData.length - 1) {
                doc.line(colX + columns[i], currentY, colX + columns[i], currentY + itemRowHeight);
            }

            colX += columns[i];
        });

        doc.line(margin, currentY + itemRowHeight, margin + usableWidth, currentY + itemRowHeight);
        currentY += itemRowHeight;
    });

    // Tax rows
    const taxRowHeight = 10;

    // CGST
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, currentY, usableWidth, taxRowHeight, 'F');
    doc.text(`CGST (${totals.cgstRate}%)`, margin + 20, currentY + 6);
    doc.text(formatCurrency(totals.cgstAmount), margin + usableWidth - 5, currentY + 6, { align: "right" });
    doc.line(margin, currentY + taxRowHeight, margin + usableWidth, currentY + taxRowHeight);
    currentY += taxRowHeight;

    // SGST
    doc.rect(margin, currentY, usableWidth, taxRowHeight, 'F');
    doc.text(`SGST (${totals.sgstRate}%)`, margin + 20, currentY + 6);
    doc.text(formatCurrency(totals.sgstAmount), margin + usableWidth - 5, currentY + 6, { align: "right" });
    doc.line(margin, currentY + taxRowHeight, margin + usableWidth, currentY + taxRowHeight);
    currentY += taxRowHeight;

    // Total row
    const totalRowHeight = 15;
    doc.setFillColor(...colors.accent);
    doc.rect(margin, currentY, usableWidth, totalRowHeight, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL", margin + 20, currentY + 9);
    doc.text(String(totalQuantity), margin + columns[0] + columns[1] + columns[2] + columns[3] / 2, currentY + 9, { align: "center" });
    doc.text(formatCurrency(totals.grandTotal), margin + usableWidth - 5, currentY + 9, { align: "right" });

    currentY += totalRowHeight + 10;

    // === AMOUNT IN WORDS ===
    const wordsHeight = 20;
    doc.setDrawColor(...colors.border);
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, usableWidth, wordsHeight, 'FD');

    doc.setTextColor(...colors.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Amount in Words:", margin + 5, currentY + 8);

    doc.setFont("helvetica", "normal");
    const amountWords = numberToWords(totals.grandTotal);
    doc.text(`INR ${amountWords}`, margin + 5, currentY + 14);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("E & O.E", margin + usableWidth - 5, currentY + 8, { align: "right" });

    currentY += wordsHeight + 10;

    // === DECLARATION & SIGNATURE ===
    const bottomHeight = 35;
    const declarationWidth = usableWidth * 0.65;
    const signatureWidth = usableWidth * 0.35;

    // Declaration
    doc.rect(margin, currentY, declarationWidth, bottomHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("DECLARATION", margin + 5, currentY + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("We declare that this invoice shows the actual price of", margin + 5, currentY + 16);
    doc.text("the goods described and that all particulars are true", margin + 5, currentY + 20);
    doc.text("and correct.", margin + 5, currentY + 24);

    // Signature
    const signatureStartX = margin + declarationWidth;
    doc.rect(signatureStartX, currentY, signatureWidth, bottomHeight);

    if (invoice.signature) {
        try {
            doc.addImage(
                invoice.signature,
                "PNG",
                signatureStartX + 5,
                currentY + 5,
                signatureWidth - 10,
                15
            );
        } catch (error) {
            console.error("Error adding signature:", error);
        }
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`for ${invoice.company?.companyName || "Company Name"}`,
        signatureStartX + 5, currentY + 25);

    doc.setFont("helvetica", "bold");
    doc.text("Authorized Signatory",
        signatureStartX + signatureWidth - 5, currentY + 30, { align: "right" });

    currentY += bottomHeight + 10;

    // === FOOTER ===
    if (invoice.customerNotes) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("Notes:", margin, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(truncateText(invoice.customerNotes, usableWidth - 30, 8), margin + 25, currentY);
        currentY += 8;
    }

    doc.setTextColor(...colors.border);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.text("This is a Computer Generated Invoice",
        pageWidth / 2, pageHeight - margin - 5, { align: "center" });

    return doc;
}; 