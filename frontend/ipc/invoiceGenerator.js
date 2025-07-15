// src/main/ipc/invoiceIpc.js

const { ipcMain } = require("electron");
const log = require('electron-log/main');
const { eq } = require("drizzle-orm");
const DatabaseManager = require("../db/db");
const { invoices } = require("../db/schema/Invoice");
const { invoiceItems } = require("../db/schema/InvoiceItems");
const { companies } = require("../db/schema/Company");
const { customers } = require("../db/schema/Customer");
const { sql } = require("drizzle-orm");
const dbManager = DatabaseManager.getInstance();
const db = dbManager.getDatabase();
log.debug("Database instance initialized:", !!db);

// Helper function for invoice number pattern recognition and generation
/**
 * Analyzes an invoice number given a known prefix.
 * Example: invoiceNo = 'PRO-CYP0001', prefix = 'PRO-CYP' => { prefix: 'PRO-CYP', sequence: 1, sequenceLength: 4, format: 'prefix-sequence' }
 */
function analyzeInvoicePattern(invoiceNo, prefix) {
  log.info("🔍 Analyzing invoice number pattern:", invoiceNo, "with prefix:", prefix);
  if (prefix && invoiceNo.startsWith(prefix)) {
    const sequencePart = invoiceNo.slice(prefix.length);
    log.info("🔍 Sequence part:", sequencePart);
    if (/^\d+$/.test(sequencePart)) {
      log.info("🔍 Sequence part is a number:", sequencePart);
      return {
        prefix,
        sequence: parseInt(sequencePart, 10),
        sequenceLength: sequencePart.length, // Preserve the original length for padding
        format: 'prefix-sequence'
      };
    }
  }
  // Fallback: treat as sequence-only if not matching
  log.warn("⚠️ Invoice number does not match expected prefix+sequence pattern:", invoiceNo, prefix);
  return {
    prefix: prefix || '',
    sequence: 0,
    sequenceLength: 4, // Default to 4 digits
    format: 'prefix-sequence'
  };
}

/**
 * Generates the next invoice number given a pattern and sequence.
 * Example: pattern = { prefix: 'PRO-CYP', sequence: 1, sequenceLength: 4 }, nextSequence = 2 => 'PRO-CYP0002'
 */
function generateNextNumber(pattern, sequence) {
  // Use the original sequence length from the pattern, or default to 4
  const padding = pattern.sequenceLength || 4;
  log.info("🔍 Padding:", padding);
  return `${pattern.prefix}${sequence.toString().padStart(padding, '0')}`;
}

function registerInvoiceGeneratorIpc() {
  // Add new handler for getting next invoice number with invoice type support
  ipcMain.handle("get-next-invoice-number", async (event, prefix = 'R', invoiceType = 'tax') => {
    try {
      log.info("🔄 Starting invoice number generation process");
      log.info("📌 Requested prefix:", prefix);
      log.info("📌 Invoice type:", invoiceType);

      // Add type-specific prefix for different invoice types
      let typePrefix = '';
      if (invoiceType === 'proforma') {
        typePrefix = 'PRO-';
      }

      // Get the latest invoice number with this prefix and type
      log.info("🔍 Searching for existing invoices with prefix pattern and type", `${typePrefix + prefix}`);
      const result = await db
        .select({ invoiceNo: invoices.invoiceNo })
        .from(invoices)
        .where(sql`invoice_no LIKE ${typePrefix + prefix + '%'} AND invoice_type = ${invoiceType}`)
        .orderBy(sql`invoice_no DESC`)
        .limit(1);

      log.info("📊 Database query result:", {
        found: result.length > 0,
        existingInvoices: result
      });

      if (result.length === 0) {
        // No existing invoices with this prefix and type
        // Generate first number based on prefix pattern
        const now = new Date();
        const currentYear = now.getFullYear().toString();
        const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');

        // Determine if prefix contains date pattern indicators
        let newNumber;
        if (prefix.includes('YYYY') || prefix.includes('MM')) {
          newNumber = typePrefix + prefix
            .replace('YYYY', currentYear)
            .replace('MM', currentMonth)
            .replace('####', '0001');
        } else {
          newNumber = `${typePrefix}${prefix}0001`;
        }

        log.info("✨ Creating first invoice number:", {
          prefix,
          typePrefix,
          invoiceType,
          newNumber,
          reason: "No existing invoices with this prefix and type"
        });
        return { success: true, invoiceNumber: newNumber };
      }

      // Analyze the pattern of the last invoice number
      const lastInvoiceNo = result[0].invoiceNo;
      const pattern = analyzeInvoicePattern(lastInvoiceNo, typePrefix + prefix);

      log.info("📝 Analyzed last invoice pattern:", {
        lastInvoiceNo,
        pattern
      });

      // Generate next number based on the pattern
      const nextSequence = pattern.sequence + 1;
      const nextNumber = generateNextNumber(pattern, nextSequence);

      log.info("✅ Generated next invoice number:", {
        lastInvoiceNo,
        pattern,
        nextSequence,
        nextNumber,
        invoiceType,
        steps: {
          patternRecognition: pattern.format,
          sequenceIncrement: nextSequence,
          finalNumber: nextNumber
        }
      });

      return { success: true, invoiceNumber: nextNumber };
    } catch (error) {
      log.error('❌ Error generating next invoice number:', {
        error: error.message,
        stack: error.stack,
        prefix,
        invoiceType
      });
      return { success: false, error: error.message };
    }
  });

  // Create a new invoice
  ipcMain.handle("add-invoice", async (event, invoiceData) => {
    try {
      log.info("Creating new invoice with data:", invoiceData);

      // Validate required fields
      if (
        !invoiceData.companyId ||
        !invoiceData.customerId ||
        !invoiceData.invoiceNumber
      ) {
        return {
          success: false,
          error:
            "Missing required fields: companyId, customerId, or invoiceNumber",
        };
      }

      // Convert dates to Date objects for Drizzle ORM timestamp mode
      const invoiceDateObj =
        invoiceData.invoiceDate instanceof Date
          ? invoiceData.invoiceDate
          : new Date(invoiceData.invoiceDate);

      const dueDateObj =
        invoiceData.dueDate instanceof Date
          ? invoiceData.dueDate
          : new Date(invoiceData.dueDate);

      // Validate that dates are valid
      if (isNaN(invoiceDateObj.getTime())) {
        throw new Error('Invalid invoice date provided');
      }
      if (isNaN(dueDateObj.getTime())) {
        throw new Error('Invalid due date provided');
      }

      // Calculate tax amounts if not provided
      const subtotal = parseFloat(invoiceData.subtotal) || 0;
      const cgstRate = invoiceData.cgstRate || 9; // Default 9%
      const sgstRate = invoiceData.sgstRate || 9; // Default 9%
      const cgstAmount = subtotal * (cgstRate / 100);
      const sgstAmount = subtotal * (sgstRate / 100);
      const totalAmount = subtotal + cgstAmount + sgstAmount;

      // Get current timestamp as Date object
      const currentTimestamp = new Date();

      // Create the invoice record in the database
      const insertedInvoice = await db
        .insert(invoices)
        .values({
          companyId: invoiceData.companyId,
          customerId: invoiceData.customerId,
          invoiceNo: invoiceData.invoiceNumber,
          invoiceDate: invoiceDateObj,
          dueDate: dueDateObj,
          terms: invoiceData.paymentTerms || "0",
          ledger: invoiceData.incomeLedger || "",
          status: invoiceData.status || "pending",
          cgstRate: cgstRate,
          sgstRate: sgstRate,
          subtotal: subtotal,
          cgstAmount: cgstAmount,
          sgstAmount: sgstAmount,
          totalAmount: totalAmount,
          discountAmount: parseFloat(invoiceData.discountAmount) || 0,
          discountPercentage: parseFloat(invoiceData.discountPercentage) || 0,
          narration: invoiceData.customerNotes || "",
          termsAndConditions: invoiceData.termsAndConditions || "",
          priority: invoiceData.priority || "normal",
          tags: invoiceData.tags || "",
          internalNotes: invoiceData.internalNotes || "",
          currency: invoiceData.currency || "INR",
          exchangeRate: parseFloat(invoiceData.exchangeRate) || 1.0,
          paymentMethod: invoiceData.paymentMethod || "",
          paymentReference: invoiceData.paymentReference || "",
          branchId: invoiceData.branchId || "",
          territory: invoiceData.territory || "",
          createdBy: invoiceData.createdBy || "",
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
          invoiceType: invoiceData.invoiceType || "tax",
        })
        .returning();

      log.info("max");
      const invoiceId = insertedInvoice[0].id;
      log.info("Inserted invoice ID:", invoiceId);

      // Process invoice items if they exist
      if (
        invoiceData.items &&
        Array.isArray(invoiceData.items) &&
        invoiceData.items.length > 0
      ) {
        // Transform items to match the database schema
        log.info("Items shubh:", invoiceData.items);
        const itemsToInsert = invoiceData.items.map((item) => ({
          invoiceId: invoiceId,
          itemId: item.id || 0, // If new item, use 0 or null as appropriate
          itemDetails: item.details || "",
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0,
        }));

        log.info("Items to insert:", itemsToInsert);
        // Insert all items in a batch
        await db.insert(invoiceItems).values(itemsToInsert);

        log.info(
          `Added ${itemsToInsert.length} items to invoice ${invoiceId}`
        );
      }

      log.info("Invoice created successfully:", insertedInvoice);

      return {
        success: true,
        data: insertedInvoice[0],
      };
    } catch (error) {
      log.error("Error creating invoice:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Get invoice by ID
  ipcMain.handle("get-invoice-by-id", async (event, invoiceId) => {
    try {
      log.info("🔍 Getting invoice by ID:", invoiceId);

      // Get the invoice
      const invoice = await db
        .select()
        .from(invoices)
        .where(sql`id = ${invoiceId}`)
        .limit(1);

      if (invoice.length === 0) {
        return {
          success: false,
          error: "Invoice not found"
        };
      }

      // Get the invoice items
      const items = await db
        .select()
        .from(invoiceItems)
        .where(sql`invoice_id = ${invoiceId}`);

      return {
        success: true,
        invoice: {
          ...invoice[0],
          items: items
        }
      };
    } catch (error) {
      log.error("❌ Error getting invoice by ID:", {
        error: error.message,
        stack: error.stack,
        invoiceId
      });
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Convert Proforma invoice to Tax invoice
  ipcMain.handle("convert-proforma-to-tax", async (event, proformaInvoiceId) => {
    try {
      log.info("🔄 Converting Proforma invoice to Tax invoice:", proformaInvoiceId);

      // Get the Proforma invoice
      const proformaInvoice = await db
        .select()
        .from(invoices)
        .where(sql`id = ${proformaInvoiceId} AND invoice_type = 'proforma'`)
        .limit(1);

      if (proformaInvoice.length === 0) {
        return {
          success: false,
          error: "Proforma invoice not found"
        };
      }

      // Get the Proforma invoice items
      const proformaItems = await db
        .select()
        .from(invoiceItems)
        .where(sql`invoice_id = ${proformaInvoiceId}`);

      // Generate a new Tax invoice number
      const companyId = proformaInvoice[0].companyId;
      const company = await db
        .select()
        .from(companies)
        .where(sql`id = ${companyId}`)
        .limit(1);

      const companyInitials = company.length > 0 ?
        (company[0].companyName || '').substring(0, 2).toUpperCase() : 'R';

      // Get next tax invoice number
      const nextInvoiceNumberResult = await ipcMain.handle("get-next-invoice-number", event, companyInitials, 'tax');

      if (!nextInvoiceNumberResult.success) {
        throw new Error(nextInvoiceNumberResult.error);
      }

      // Create a new Tax invoice based on the Proforma invoice
      const currentTimestamp = new Date();
      const taxInvoice = {
        ...proformaInvoice[0],
        id: undefined, // Remove ID to create a new record
        invoiceNo: nextInvoiceNumberResult.invoiceNumber,
        invoiceType: 'tax',
        convertedFromId: proformaInvoiceId,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp
      };

      // Insert the Tax invoice
      const insertedTaxInvoice = await db
        .insert(invoices)
        .values(taxInvoice)
        .returning();

      const taxInvoiceId = insertedTaxInvoice[0].id;

      // Insert the Tax invoice items
      const taxItemsToInsert = proformaItems.map(item => ({
        ...item,
        id: undefined, // Remove ID to create a new record
        invoiceId: taxInvoiceId
      }));

      await db.insert(invoiceItems).values(taxItemsToInsert);

      // Update the Proforma invoice status to 'converted'
      await db
        .update(invoices)
        .set({
          status: 'converted',
          updatedAt: currentTimestamp
        })
        .where(sql`id = ${proformaInvoiceId}`);

      return {
        success: true,
        taxInvoice: insertedTaxInvoice[0],
        message: "Proforma invoice successfully converted to Tax invoice"
      };
    } catch (error) {
      log.error("❌ Error converting Proforma invoice to Tax invoice:", {
        error: error.message,
        stack: error.stack,
        proformaInvoiceId
      });
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get all invoices
  ipcMain.handle("invoice:getAll", async () => {
    try {
      const allInvoices = await db.select().from(invoices);
      return {
        success: true,
        invoices: allInvoices,
      };
    } catch (error) {
      log.error("Error fetching invoices:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Get invoice by ID
  ipcMain.handle("invoice:getById", async (event, id) => {
    try {
      const invoice = await db
        .select()
        .from(invoices)
        .where(invoices.id.eq(id))
        .limit(1);

      if (invoice.length === 0) {
        return {
          success: false,
          error: "Invoice not found",
        };
      }

      return {
        success: true,
        invoice: invoice[0],
      };
    } catch (error) {
      log.error(`Error fetching invoice with ID ${id}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // In your main.js or API handler file
  ipcMain.handle("get-company-with-invoices", async () => {
    try {
      // First get all companies
      log.info("Fetching all companies...");
      const allCompanies = await db.select().from(companies);

      // For each company, get the total invoice amount
      const companiesWithInvoices = await Promise.all(
        allCompanies.map(async (company) => {
          // Get sum of all invoice amounts for this company
          const invoiceTotals = await db
            .select({
              totalAmount: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
              invoiceCount: sql`COUNT(${invoices.id})`,
            })
            .from(invoices)
            .where(eq(invoices.companyId, company.id));

          return {
            ...company,
            totalInvoiceAmount: invoiceTotals[0]?.totalAmount || 0,
            invoiceCount: invoiceTotals[0]?.invoiceCount || 0,
          };
        })
      );

      return { success: true, companies: companiesWithInvoices };
    } catch (error) {
      log.error("Error fetching companies with invoice data:", error);
      return { success: false, error: error.message };
    }
  });

  // Update an invoice
  // ipcMain.handle("invoice:update", async (event, { id, ...invoiceData }) => {
  //   try {
  //     if (!id) {
  //       return {
  //         success: false,
  //         error: "Invoice ID is required",
  //       };
  //     }

  //     // Prepare update data with the same transformations as in create
  //     const updateData = {};

  //     if (invoiceData.invoiceNumber)
  //       updateData.invoiceNo = invoiceData.invoiceNumber;

  //     if (invoiceData.invoiceDate) {
  //       updateData.invoiceDate = new Date(
  //         invoiceData.invoiceDate
  //       ).toISOString();
  //     }

  //     if (invoiceData.dueDate) {
  //       updateData.dueDate = new Date(invoiceData.dueDate).toISOString();
  //     }

  //     if (invoiceData.paymentTerms !== undefined)
  //       updateData.terms = invoiceData.paymentTerms;
  //     if (invoiceData.incomeLedger !== undefined)
  //       updateData.ledger = invoiceData.incomeLedger;
  //     if (invoiceData.customerNotes !== undefined)
  //       updateData.narration = invoiceData.customerNotes;
  //     if (invoiceData.termsAndConditions !== undefined)
  //       updateData.termsAndConditions = invoiceData.termsAndConditions;

  //     // Recalculate totals if needed
  //     if (invoiceData.subtotal !== undefined) {
  //       const subtotal = parseFloat(invoiceData.subtotal) || 0;
  //       const cgstRate = invoiceData.cgstRate || 9;
  //       const sgstRate = invoiceData.sgstRate || 9;
  //       const cgstAmount = subtotal * (cgstRate / 100);
  //       const sgstAmount = subtotal * (sgstRate / 100);
  //       const totalAmount = subtotal + cgstAmount + sgstAmount;

  //       updateData.subtotal = subtotal;
  //       updateData.cgstRate = cgstRate;
  //       updateData.sgstRate = sgstRate;
  //       updateData.cgstAmount = cgstAmount;
  //       updateData.sgstAmount = sgstAmount;
  //       updateData.totalAmount = totalAmount;
  //     }

  //     const updatedInvoice = await db
  //       .update(invoices)
  //       .set(updateData)
  //       .where(invoices.id.eq(id))
  //       .returning();

  //     return {
  //       success: true,
  //       invoice: updatedInvoice[0],
  //     };
  //   } catch (error) {
  //     log.error(`Error updating invoice with ID ${id}:`, error);
  //     return {
  //       success: false,
  //       error: error.message,
  //     };
  //   }
  // });

  // Delete an invoice
  // ipcMain.handle("invoice:delete", async (event, id) => {
  //   try {
  //     await db.delete(invoices).where(invoices.id.eq(id));

  //     return {
  //       success: true,
  //     };
  //   } catch (error) {
  //     log.error(`Error deleting invoice with ID ${id}:`, error);
  //     return {
  //       success: false,
  //       error: error.message,
  //     };
  //   }
  //   });

  // Payment recording handlers
  ipcMain.handle("record-payment", async (event, { invoiceId, paymentData }) => {
    try {
      log.info("💰 Recording payment for invoice:", invoiceId, paymentData);

      // Validate required fields
      if (!invoiceId || !paymentData) {
        return {
          success: false,
          error: "Invoice ID and payment data are required"
        };
      }

      // Check if invoice exists and is a tax invoice
      const invoice = await db
        .select()
        .from(invoices)
        .where(sql`id = ${invoiceId} AND invoice_type = 'tax'`)
        .limit(1);

      if (invoice.length === 0) {
        return {
          success: false,
          error: "Tax invoice not found"
        };
      }

      // Convert payment date to Date object
      const paymentDate = paymentData.date instanceof Date 
        ? paymentData.date 
        : new Date(paymentData.date);

      if (isNaN(paymentDate.getTime())) {
        return {
          success: false,
          error: "Invalid payment date"
        };
      }

      // Update invoice with payment details
      const updatedInvoice = await db
        .update(invoices)
        .set({
          paidDate: paymentDate,
          paymentMethod: paymentData.method || "",
          paymentReference: paymentData.notes || "",
          status: "paid",
          updatedAt: new Date()
        })
        .where(sql`id = ${invoiceId}`)
        .returning();

      log.info("✅ Payment recorded successfully:", updatedInvoice[0]);

      return {
        success: true,
        invoice: updatedInvoice[0]
      };
    } catch (error) {
      log.error("❌ Error recording payment:", error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle("update-payment", async (event, { invoiceId, paymentData }) => {
    try {
      log.info("🔄 Updating payment for invoice:", invoiceId, paymentData);

      // Validate required fields
      if (!invoiceId || !paymentData) {
        return {
          success: false,
          error: "Invoice ID and payment data are required"
        };
      }

      // Check if invoice exists and is a tax invoice
      const invoice = await db
        .select()
        .from(invoices)
        .where(sql`id = ${invoiceId} AND invoice_type = 'tax'`)
        .limit(1);

      if (invoice.length === 0) {
        return {
          success: false,
          error: "Tax invoice not found"
        };
      }

      // Convert payment date to Date object
      const paymentDate = paymentData.date instanceof Date 
        ? paymentData.date 
        : new Date(paymentData.date);

      if (isNaN(paymentDate.getTime())) {
        return {
          success: false,
          error: "Invalid payment date"
        };
      }

      // Update invoice with new payment details
      const updatedInvoice = await db
        .update(invoices)
        .set({
          paymentDate: paymentDate,
          paymentMethod: paymentData.method || "",
          paymentReference: paymentData.notes || "",
          updatedAt: new Date()
        })
        .where(sql`id = ${invoiceId}`)
        .returning();

      log.info("✅ Payment updated successfully:", updatedInvoice[0]);

      return {
        success: true,
        invoice: updatedInvoice[0]
      };
    } catch (error) {
      log.error("❌ Error updating payment:", error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle("mark-invoice-unpaid", async (event, invoiceId) => {
    try {
      log.info("❌ Marking invoice as unpaid:", invoiceId);

      // Validate required fields
      if (!invoiceId) {
        return {
          success: false,
          error: "Invoice ID is required"
        };
      }

      // Check if invoice exists and is a tax invoice
      const invoice = await db
        .select()
        .from(invoices)
        .where(sql`id = ${invoiceId} AND invoice_type = 'tax'`)
        .limit(1);

      if (invoice.length === 0) {
        return {
          success: false,
          error: "Tax invoice not found"
        };
      }

      // Update invoice to mark as unpaid
      const updatedInvoice = await db
        .update(invoices)
        .set({
          paidDate: null,
          paymentMethod: null,
          paymentReference: null,
          status: "pending",
          updatedAt: new Date()
        })
        .where(sql`id = ${invoiceId}`)
        .returning();

      log.info("✅ Invoice marked as unpaid:", updatedInvoice[0]);

      return {
        success: true,
        invoice: updatedInvoice[0]
      };
    } catch (error) {
      log.error("❌ Error marking invoice as unpaid:", error);
      return {
        success: false,
        error: error.message
      };
    }
  });
}

function registerInvoiceItemsIpc() {
  // Handle adding invoice items
  ipcMain.handle("add-invoice-items", async (event, items, invoiceId) => {
    try {
      log.info(`Adding ${items.length} items for invoice ID: ${invoiceId}`);

      if (!invoiceId) {
        return {
          success: false,
          error: "Invoice ID is required",
        };
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return {
          success: false,
          error: "No items provided or invalid items format",
        };
      }

      // Prepare items for insertion
      const itemsToInsert = items.map((item) => ({
        invoiceId: invoiceId,
        itemId: item.id || 0, // If new item, use 0 or null as appropriate
        itemDetails: item.details || "",
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
        amount: parseFloat(item.amount) || 0,
      }));

      // Insert all items in a batch
      const insertedItems = await db
        .insert(invoiceItems)
        .values(itemsToInsert)
        .returning();

      log.info(`Successfully added ${insertedItems.length} invoice items`);

      return {
        success: true,
        data: insertedItems,
      };
    } catch (error) {
      log.error("Error adding invoice items:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // ipcMain.removeHandler("invoiceItem:getAll");
  ipcMain.handle("invoiceItem:getAll", async (event, invoiceId) => {
    try {
      if (!invoiceId) {
        return {
          success: false,
          error: "Invoice ID is required",
        };
      }

      // console.log("Fetching items for invoiceId:", invoiceId);
      // Fetch items for the given invoice ID
      const items = await db
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, invoiceId));

      return {
        success: true,
        data: items,
      };
    } catch (error) {
      log.error("Error fetching invoice items:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  });
}

module.exports = { registerInvoiceGeneratorIpc, registerInvoiceItemsIpc };
