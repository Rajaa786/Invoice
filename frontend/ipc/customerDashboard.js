// src/ipc/customerDashboard.js

const { ipcMain } = require("electron");
const log = require('electron-log/main');
const DatabaseManager = require("../db/db");
const { customers } = require("../db/schema/Customer");
const { eq } = require("drizzle-orm");

function registerCustomerDashboardIpc() {
  try {
    log.info('Registering Customer Dashboard IPC handlers...');
    const dbManager = DatabaseManager.getInstance();
    const db = dbManager.getDatabase();
    log.debug("Database instance initialized:", !!db);

    ipcMain.handle("add-customer", async (event, data) => {
      try {
        log.info("👥 Starting customer creation process for:", data.companyName || `${data.firstName} ${data.lastName}`);
        log.debug("📝 Received customer data:", {
          ...data,
          type: data.customerType || "Individual"
        });

        const gstin = data.gstApplicable === true ? data.gstin : null;
        const stateCode = data.gstApplicable === true ? data.stateCode : null;

        const result = await db.insert(customers).values({
          customerType: data.customerType || "Individual",
          salutation: data.salutation || null,
          firstName: data.firstName,
          lastName: data.lastName,
          panNumber: data.panNumber || null,

          companyName: data.companyName,
          currency: data.currency || "INR",

          gstApplicable: data.gstApplicable === true ? "Yes" : "No",
          gstin,
          stateCode,

          billingCountry: data.billingCountry,
          billingState: data.billingState,
          billingCity: data.billingCity,
          billingAddressLine1: data.billingAddressLine1,
          billingAddressLine2: data.billingAddressLine2 || null,
          billingContactNo: data.billingContactNo,
          billingEmail: data.billingEmail,
          billingAlternateContactNo: data.billingAlternateContactNo || null,

          shippingCountry: data.shippingCountry,
          shippingState: data.shippingState,
          shippingCity: data.shippingCity,
          shippingAddressLine1: data.shippingAddressLine1,
          shippingAddressLine2: data.shippingAddressLine2 || null,
          shippingContactNo: data.shippingContactNo,
          shippingEmail: data.shippingEmail,
          shippingAlternateContactNo: data.shippingAlternateContactNo || null,
        });

        log.info("✅ Customer created successfully:", result);
        return { success: true, result };
      } catch (err) {
        log.error("❌ Customer creation failed:", {
          error: err.message,
          stack: err.stack,
          customerName: data?.companyName || `${data?.firstName} ${data?.lastName}`,
          errorType: err.name
        });
        return { success: false, error: err.message };
      }
    });
    log.info("✅ IPC handler 'add-customer' registered successfully");

    // Register the IPC handler for retrieving customers
    ipcMain.handle("get-customer", async (event) => {
      try {
        log.debug("📋 Received get-customer request");
        const result = await db.select().from(customers);
        log.info(`📊 Retrieved ${result.length} customers from database`);
        return { success: true, customers: result };
      } catch (err) {
        log.error("❌ Error fetching customers:", {
          error: err.message,
          stack: err.stack,
          errorType: err.name
        });
        return { success: false, error: err.message };
      }
    });
    log.info("✅ IPC handler 'get-customer' registered successfully");

    // Register the IPC handler for updating customers
    ipcMain.handle("update-customer", async (event, data) => {
      try {
        if (!data || !data.id) {
          throw new Error("Invalid update data: missing customer ID");
        }

        const customerId = data.id;
        log.info("👥 Starting customer update process for ID:", customerId);
        log.debug("📝 Received customer update data:", {
          ...data,
          type: data.customerType || "Individual"
        });

        const gstin = data.gstApplicable === true ? data.gstin : null;
        const stateCode = data.gstApplicable === true ? data.stateCode : null;

        const result = await db
          .update(customers)
          .set({
            customerType: data.customerType || "Individual",
            salutation: data.salutation || null,
            firstName: data.firstName,
            lastName: data.lastName,
            panNumber: data.panNumber || null,

            companyName: data.companyName,
            currency: data.currency || "INR",

            gstApplicable: data.gstApplicable === true ? "Yes" : "No",
            gstin,
            stateCode,

            billingCountry: data.billingCountry,
            billingState: data.billingState,
            billingCity: data.billingCity,
            billingAddressLine1: data.billingAddressLine1,
            billingAddressLine2: data.billingAddressLine2 || null,
            billingContactNo: data.billingContactNo,
            billingEmail: data.billingEmail,
            billingAlternateContactNo: data.billingAlternateContactNo || null,

            shippingCountry: data.shippingCountry,
            shippingState: data.shippingState,
            shippingCity: data.shippingCity,
            shippingAddressLine1: data.shippingAddressLine1,
            shippingAddressLine2: data.shippingAddressLine2 || null,
            shippingContactNo: data.shippingContactNo,
            shippingEmail: data.shippingEmail,
            shippingAlternateContactNo: data.shippingAlternateContactNo || null,
          })
          .where(eq(customers.id, customerId))
          .returning();

        if (result.length === 0) {
          log.warn("⚠️ No customer found to update with ID:", customerId);
          return { success: false, error: "Customer not found" };
        }

        log.info("✅ Customer updated successfully:", result[0]);
        return { success: true, result: result[0] };
      } catch (err) {
        log.error("❌ Customer update failed:", {
          error: err.message,
          stack: err.stack,
          customerId: data?.id,
          errorType: err.name
        });
        return { success: false, error: err.message };
      }
    });
    log.info("✅ IPC handler 'update-customer' registered successfully");

    // Register the IPC handler for deleting customers
    ipcMain.handle("delete-customer", async (event, id) => {
      try {
        log.info("🗑️ Starting customer deletion process for ID:", id);
        const result = await db
          .delete(customers)
          .where(eq(customers.id, id))
          .returning();

        if (result.length === 0) {
          log.warn("⚠️ No customer found to delete with ID:", id);
          return { success: false, error: "Customer not found" };
        }

        log.info("✅ Customer deleted successfully:", result[0]);
        return { success: true, result: result[0] };
      } catch (err) {
        log.error("❌ Customer deletion failed:", {
          error: err.message,
          stack: err.stack,
          customerId: id,
          errorType: err.name
        });
        return { success: false, error: err.message };
      }
    });
    log.info("✅ IPC handler 'delete-customer' registered successfully");

    // Register the IPC handler for getting a single customer by ID
    ipcMain.handle("get-customer-by-id", async (event, id) => {
      try {
        log.debug("📋 Received get-customer-by-id request with id:", id);
        const result = await db
          .select()
          .from(customers)
          .where(eq(customers.id, id))
          .limit(1);

        if (result.length === 0) {
          log.warn("⚠️ No customer found with ID:", id);
          return { success: false, error: "Customer not found" };
        }

        log.debug("✓ Customer retrieved successfully:", result[0]);
        return { success: true, customer: result[0] };
      } catch (err) {
        log.error("❌ Error fetching customer by ID:", {
          error: err.message,
          stack: err.stack,
          customerId: id,
          errorType: err.name
        });
        return { success: false, error: err.message };
      }
    });
    log.info("✅ IPC handler 'get-customer-by-id' registered successfully");

  } catch (err) {
    log.error("❌ Failed to initialize customer dashboard IPC:", {
      error: err.message,
      stack: err.stack,
      errorType: err.name
    });
  }
}

module.exports = { registerCustomerDashboardIpc };
