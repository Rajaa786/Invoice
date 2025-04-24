// src/main/ipc/invoiceIpc.js

const { ipcMain } = require("electron");
const DatabaseManager = require("../db/db");
const { invoices } = require("../db/schema/Invoice");
const { invoiceItems } = require("../db/schema/InvoiceItems"); // Assuming you have a schema for invoice items
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

      // Convert dates to ISO strings for SQLite storage
      const invoiceDateISO =
        invoiceData.invoiceDate instanceof Date
          ? invoiceData.invoiceDate.toISOString()
          : new Date(invoiceData.invoiceDate).toISOString();

      const dueDateISO =
        invoiceData.dueDate instanceof Date
          ? invoiceData.dueDate.toISOString()
          : new Date(invoiceData.dueDate).toISOString();

      // Calculate tax amounts if not provided
      const subtotal = parseFloat(invoiceData.subtotal) || 0;
      const cgstRate = invoiceData.cgstRate || 9; // Default 9%
      const sgstRate = invoiceData.sgstRate || 9; // Default 9%
      const cgstAmount = subtotal * (cgstRate / 100);
      const sgstAmount = subtotal * (sgstRate / 100);
      const totalAmount = subtotal + cgstAmount + sgstAmount;

      // Create the invoice record in the database
      const insertedInvoice = await db
        .insert(invoices)
        .values({
          companyId: invoiceData.companyId,
          customerId: invoiceData.customerId,
          invoiceNo: invoiceData.invoiceNumber,
          invoiceDate: invoiceDateISO,
          dueDate: dueDateISO,
          terms: invoiceData.paymentTerms || "0",
          ledger: invoiceData.incomeLedger || "",
          cgstRate: cgstRate,
          sgstRate: sgstRate,
          subtotal: subtotal,
          cgstAmount: cgstAmount,
          sgstAmount: sgstAmount,
          totalAmount: totalAmount,
          narration: invoiceData.customerNotes || "",
          termsAndConditions: invoiceData.termsAndConditions || "",
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

function registerInvoiceItemsIpc(ipcMain) {
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

  ipcMain.handle("invoiceItem:getAll", async (event, invoiceId) => {
    try {
      if (!invoiceId) {
        return {
          success: false,
          error: "Invoice ID is required",
        };
      }

      console.log("Fetching items for invoiceId:", invoiceId);
      // Fetch items for the given invoice ID
      const items = await db
        .select()
        .from(invoiceItems)
        .where("invoiceId", "=", invoiceId);

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


  // ipcMain.handle("get-invoice-items", async (event, invoiceId) => {
  //   try {
  //     console.log(
  //       `Received get-invoice-items request for invoice: ${invoiceId}`
  //     );

  //     // If invoiceId is provided, fetch items for that specific invoice
  //     if (invoiceId) {
  //       const result = await db
  //         .select({
  //           id: invoiceItems.id,
  //           invoiceId: invoiceItems.invoiceId,
  //           itemId: invoiceItems.itemId,
  //           itemDetails: invoiceItems.itemDetails,
  //           quantity: invoiceItems.quantity,
  //           rate: invoiceItems.rate,
  //           amount: invoiceItems.amount,
  //           // You can join with items table if needed
  //         })
  //         .from(invoiceItems)
  //         .where(eq(invoiceItems.invoiceId, invoiceId));

  //       console.log(
  //         `Retrieved ${result.length} invoice items for invoice #${invoiceId}`
  //       );
  //       return { success: true, invoiceItems: result };
  //     }
  //     // If no invoiceId provided, fetch all invoice items
  //     else {
  //       const result = await db.select().from(invoiceItems);

  //       console.log(`Retrieved ${result.length} invoice items from db`);
  //       return { success: true, invoiceItems: result };
  //     }
  //   } catch (err) {
  //     console.error("Get Invoice Items error:", err);
  //     return { success: false, error: err.message };
  //   }
  // });
}

module.exports = { registerInvoiceGeneratorIpc, registerInvoiceItemsIpc };
