// src/main/ipc/invoiceIpc.js

const { ipcMain } = require("electron");
const { eq } = require("drizzle-orm");
const DatabaseManager = require("../db/db");
const { invoices } = require("../db/schema/Invoice");
const { invoiceItems } = require("../db/schema/InvoiceItems");
const { companies } = require("../db/schema/Company");
const { customers } = require("../db/schema/Customer");
const { sql } = require("drizzle-orm");
const dbManager = DatabaseManager.getInstance();
const db = dbManager.getDatabase();
console.log("Database instance initialized:", !!db);
function registerInvoiceGeneratorIpc() {
  // Create a new invoice
  ipcMain.handle("add-invoice", async (event, invoiceData) => {
    try {
      console.log("Creating new invoice with data:", invoiceData);

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

      console.log("max");
      const invoiceId = insertedInvoice[0].id;
      console.log("Inserted invoice ID:", invoiceId);

      // Process invoice items if they exist
      if (
        invoiceData.items &&
        Array.isArray(invoiceData.items) &&
        invoiceData.items.length > 0
      ) {
        // Transform items to match the database schema
        console.log("Items shubh:", invoiceData.items);
        const itemsToInsert = invoiceData.items.map((item) => ({
          invoiceId: invoiceId,
          itemId: item.id || 0, // If new item, use 0 or null as appropriate
          itemDetails: item.details || "",
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0,
        }));

        console.log("Items to insert:", itemsToInsert);
        // Insert all items in a batch
        await db.insert(invoiceItems).values(itemsToInsert);

        console.log(
          `Added ${itemsToInsert.length} items to invoice ${invoiceId}`
        );
      }

      console.log("Invoice created successfully:", insertedInvoice);

      return {
        success: true,
        data: insertedInvoice[0],
      };
    } catch (error) {
      console.error("Error creating invoice:", error);
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
      console.error("Error fetching invoices:", error);
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
      console.error(`Error fetching invoice with ID ${id}:`, error);
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
      console.error("Error fetching companies with invoice data:", error);
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
  //     console.error(`Error updating invoice with ID ${id}:`, error);
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
  //     console.error(`Error deleting invoice with ID ${id}:`, error);
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
      console.log(`Adding ${items.length} items for invoice ID: ${invoiceId}`);

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

      console.log(`Successfully added ${insertedItems.length} invoice items`);

      return {
        success: true,
        data: insertedItems,
      };
    } catch (error) {
      console.error("Error adding invoice items:", error);
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
      console.error("Error fetching invoice items:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  });
}

module.exports = { registerInvoiceGeneratorIpc, registerInvoiceItemsIpc };
