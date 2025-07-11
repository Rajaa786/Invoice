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

// Helper functions for invoice number pattern recognition and generation
function analyzeInvoicePattern(invoiceNo) {
  log.info("🔍 Analyzing invoice number pattern:", invoiceNo);

  // Common patterns:
  // 1. PREFIX-NUMBER (e.g., INV-0001, R-P-0001)
  // 2. PREFIX/YYYY/MM/NUMBER (e.g., INV/2024/03/0001)
  // 3. PREFIX-YYYY-SEQUENCE (e.g., INV-2024-0001)
  // 4. YYYY-PREFIX-SEQUENCE (e.g., 2024-INV-0001)
  // 5. Simple sequence with prefix (e.g., INV0001)

  const patterns = [
    {
      // Pattern: PREFIX/YYYY/MM/SEQUENCE
      regex: /^([A-Za-z-]+)\/(\d{4})\/(\d{2})\/(\d+)$/,
      type: 'date-based',
      extract: (match) => ({
        prefix: match[1],
        year: match[2],
        month: match[3],
        sequence: parseInt(match[4], 10),
        format: 'prefix/year/month/sequence'
      })
    },
    {
      // Pattern: PREFIX-YYYY-SEQUENCE
      regex: /^([A-Za-z-]+)-(\d{4})-(\d+)$/,
      type: 'year-based',
      extract: (match) => ({
        prefix: match[1],
        year: match[2],
        sequence: parseInt(match[3], 10),
        format: 'prefix-year-sequence'
      })
    },
    {
      // Pattern: YYYY-PREFIX-SEQUENCE
      regex: /^(\d{4})-([A-Za-z-]+)-(\d+)$/,
      type: 'year-prefix',
      extract: (match) => ({
        year: match[1],
        prefix: match[2],
        sequence: parseInt(match[3], 10),
        format: 'year-prefix-sequence'
      })
    },
    {
      // Pattern: PREFIX-NUMBER (with optional multi-part prefix)
      regex: /^([A-Za-z]-[A-Za-z]-|[A-Za-z]-|[A-Za-z]+)(\d+)$/,
      type: 'simple',
      extract: (match) => ({
        prefix: match[1],
        sequence: parseInt(match[2], 10),
        format: 'prefix-sequence'
      })
    }
  ];

  for (const pattern of patterns) {
    const match = invoiceNo.match(pattern.regex);
    if (match) {
      const result = pattern.extract(match);
      log.info("✅ Pattern recognized:", {
        originalNumber: invoiceNo,
        patternType: pattern.type,
        ...result
      });
      return result;
    }
  }

  // If no pattern matches, treat the whole string as a sequence
  log.warn("⚠️ No standard pattern recognized, treating as simple sequence:", invoiceNo);
  return {
    prefix: '',
    sequence: parseInt(invoiceNo, 10) || 0,
    format: 'sequence-only'
  };
}

function generateNextNumber(pattern, sequence, padding = 4) {
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  
  switch (pattern.format) {
    case 'prefix/year/month/sequence':
      // Reset sequence if year/month changes
      if (pattern.year !== currentYear || pattern.month !== currentMonth) {
        sequence = 1;
      }
      return `${pattern.prefix}/${currentYear}/${currentMonth}/${sequence.toString().padStart(padding, '0')}`;
    
    case 'prefix-year-sequence':
      // Reset sequence if year changes
      if (pattern.year !== currentYear) {
        sequence = 1;
      }
      return `${pattern.prefix}-${currentYear}-${sequence.toString().padStart(padding, '0')}`;
    
    case 'year-prefix-sequence':
      // Reset sequence if year changes
      if (pattern.year !== currentYear) {
        sequence = 1;
      }
      return `${currentYear}-${pattern.prefix}-${sequence.toString().padStart(padding, '0')}`;
    
    case 'prefix-sequence':
      return `${pattern.prefix}${sequence.toString().padStart(padding, '0')}`;
    
    default:
      return sequence.toString().padStart(padding, '0');
  }
}

function registerInvoiceGeneratorIpc() {
  // Add new handler for getting next invoice number
  ipcMain.handle("get-next-invoice-number", async (event, prefix = 'R') => {
    try {
      log.info("🔄 Starting invoice number generation process");
      log.info("📌 Requested prefix:", prefix);
      
      // Get the latest invoice number with this prefix
      log.info("🔍 Searching for existing invoices with prefix pattern");
      const result = await db
        .select({ invoiceNo: invoices.invoiceNo })
        .from(invoices)
        .where(sql`invoice_no LIKE ${prefix + '%'}`)
        .orderBy(sql`invoice_no DESC`)
        .limit(1);

      log.info("📊 Database query result:", {
        found: result.length > 0,
        existingInvoices: result
      });

      if (result.length === 0) {
        // No existing invoices with this prefix
        // Generate first number based on prefix pattern
        const now = new Date();
        const currentYear = now.getFullYear().toString();
        const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
        
        // Determine if prefix contains date pattern indicators
        let newNumber;
        if (prefix.includes('YYYY') || prefix.includes('MM')) {
          newNumber = prefix
            .replace('YYYY', currentYear)
            .replace('MM', currentMonth)
            .replace('####', '0001');
        } else {
          newNumber = `${prefix}0001`;
        }

        log.info("✨ Creating first invoice number:", {
          prefix,
          newNumber,
          reason: "No existing invoices with this prefix"
        });
        return { success: true, invoiceNumber: newNumber };
      }

      // Analyze the pattern of the last invoice number
      const lastInvoiceNo = result[0].invoiceNo;
      const pattern = analyzeInvoicePattern(lastInvoiceNo);
      
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
        prefix
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
  // });
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
