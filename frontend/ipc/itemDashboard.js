const { ipcMain } = require("electron");
const log = require('electron-log/main');
const DatabaseManager = require("../db/db");
const { items } = require("../db/schema/Item");
const { companyItems } = require("../db/schema/CompanyItems");
const { companies } = require("../db/schema/Company");
const { eq, and } = require("drizzle-orm");

function registerItemDashboardIpc() {
  try {
    log.info('Registering Item Dashboard IPC handlers...');
    const dbManager = DatabaseManager.getInstance();
    const db = dbManager.getDatabase();
    log.debug("Database instance initialized:", !!db);

    // Register the IPC handler for adding items
    ipcMain.handle("add-items", async (event, data) => {
      try {
        log.info("📦 Starting item creation process for:", data.name);
        log.debug("📝 Received item data:", {
          ...data,
          sellingPrice: parseFloat(data.sellingPrice || 0)
        });

        const result = await db.insert(items).values({
          type: data.itemType || "Goods",
          name: data.name,
          hsnSacCode: data.hsnSacCode || null,
          unit: data.unit || null,
          sellingPrice: parseFloat(data.sellingPrice || 0),
          description: data.description || null,
          currency: "INR", // Fixed for now
        });

        log.info("✅ Item created successfully:", result);
        return { success: true, result };
      } catch (err) {
        log.error("❌ Item creation failed:", {
          error: err.message,
          stack: err.stack,
          itemName: data?.name,
          errorType: err.name
        });
        return { success: false, error: err.message };
      }
    });
    log.info("✅ IPC handler 'add-items' registered successfully");

    // Register the IPC handler for retrieving items
    ipcMain.handle("get-Item", async (event) => {
      try {
        log.debug("📋 Received get-item request");
        const result = await db.select().from(items);
        log.info(`📊 Retrieved ${result.length} items from database`);
        return { success: true, items: result };
      } catch (err) {
        log.error("❌ Error fetching items:", {
          error: err.message,
          stack: err.stack,
          errorType: err.name
        });
        return { success: false, error: err.message };
      }
    });
    log.info("✅ IPC handler 'get-Item' registered successfully");

    // Register the IPC handler for updating items
    ipcMain.handle("update-item", async (event, data) => {
      try {
        if (!data || !data.id) {
          throw new Error("Invalid update data: missing item ID");
        }

        const itemId = data.id;
        log.info("📦 Starting item update process for ID:", itemId);
        log.debug("📝 Received item update data:", {
          ...data,
          sellingPrice: parseFloat(data.sellingPrice || 0)
        });

        const result = await db
          .update(items)
          .set({
            type: data.type || "Goods",
            name: data.name,
            hsnSacCode: data.hsnSacCode || null,
            unit: data.unit || null,
            sellingPrice: parseFloat(data.sellingPrice || 0),
            description: data.description || null,
            currency: "INR", // Fixed for now
          })
          .where(eq(items.id, itemId))
          .returning();

        if (result.length === 0) {
          log.warn("⚠️ No item found to update with ID:", itemId);
          return { success: false, error: "Item not found" };
        }

        log.info("✅ Item updated successfully:", result[0]);
        return { success: true, result: result[0] };
      } catch (err) {
        log.error("❌ Item update failed:", {
          error: err.message,
          stack: err.stack,
          itemId: data?.id,
          errorType: err.name
        });
        return { success: false, error: err.message };
      }
    });
    log.info("✅ IPC handler 'update-item' registered successfully");

    // Register the IPC handler for deleting items
    ipcMain.handle("delete-item", async (event, id) => {
      try {
        log.info("🗑️ Starting item deletion process for ID:", id);
        const result = await db
          .delete(items)
          .where(eq(items.id, id))
          .returning();

        if (result.length === 0) {
          log.warn("⚠️ No item found to delete with ID:", id);
          return { success: false, error: "Item not found" };
        }

        log.info("✅ Item deleted successfully:", result[0]);
        return { success: true, result: result[0] };
      } catch (err) {
        log.error("❌ Item deletion failed:", {
          error: err.message,
          stack: err.stack,
          itemId: id,
          errorType: err.name
        });
        return { success: false, error: err.message };
      }
    });
    log.info("✅ IPC handler 'delete-item' registered successfully");

    // Register the IPC handler for getting a single item by ID
    ipcMain.handle("get-item-by-id", async (event, id) => {
      try {
        log.debug("📋 Received get-item-by-id request with id:", id);
        const result = await db
          .select()
          .from(items)
          .where(eq(items.id, id))
          .limit(1);

        if (result.length === 0) {
          log.warn("⚠️ No item found with ID:", id);
          return { success: false, error: "Item not found" };
        }

        log.debug("✓ Item retrieved successfully:", result[0]);
        return { success: true, item: result[0] };
      } catch (err) {
        log.error("❌ Error fetching item by ID:", {
          error: err.message,
          stack: err.stack,
          itemId: id,
          errorType: err.name
        });
        return { success: false, error: err.message };
      }
    });
    log.info("✅ IPC handler 'get-item-by-id' registered successfully");

    // Register the IPC handler for getting companies associated with an item
    ipcMain.handle("get-item-companies", async (event, itemId) => {
      try {
        log.debug("📋 Received get-item-companies request for item ID:", itemId);
        
        // First, check if the item exists
        const itemExists = await db
          .select({ id: items.id })
          .from(items)
          .where(eq(items.id, itemId))
          .get();
          
        if (!itemExists) {
          log.warn("⚠️ No item found with ID:", itemId);
          return { success: false, error: "Item not found" };
        }
        
        // Get all company IDs associated with this item
        const companyItemsResult = await db
          .select({ companyId: companyItems.companyId })
          .from(companyItems)
          .where(eq(companyItems.itemId, itemId));
          
        // Get the full company details for each company ID
        const companiesResult = await db
          .select()
          .from(companies)
          .where(eq(companies.id, companyItemsResult.map(ci => ci.companyId)));
          
        log.info(`✅ Retrieved ${companiesResult.length} companies for item ID: ${itemId}`);
        return { success: true, companies: companiesResult };
      } catch (err) {
        log.error("❌ Error fetching item companies:", {
          error: err.message,
          stack: err.stack,
          itemId,
          errorType: err.name
        });
        return { success: false, error: err.message };
      }
    });
    log.info("✅ IPC handler 'get-item-companies' registered successfully");
    
    // Register the IPC handler for updating companies associated with an item
    ipcMain.handle("update-item-companies", async (event, itemId, companyIds) => {
      try {
        log.info("📝 Updating companies for item ID:", itemId);
        log.debug("📝 New company IDs:", companyIds);
        
        // First, check if the item exists
        const itemExists = await db
          .select({ id: items.id })
          .from(items)
          .where(eq(items.id, itemId))
          .get();
          
        if (!itemExists) {
          log.warn("⚠️ No item found with ID:", itemId);
          return { success: false, error: "Item not found" };
        }
        
        // Delete all existing associations for this item
        await db
          .delete(companyItems)
          .where(eq(companyItems.itemId, itemId));
          
        // If there are company IDs to add, insert them
        if (companyIds && companyIds.length > 0) {
          // Create an array of objects for batch insert
          const companyItemsToInsert = companyIds.map(companyId => ({
            itemId,
            companyId,
            createdAt: new Date() // Add timestamp for new associations
          }));
          
          // Insert all new associations
          await db.insert(companyItems).values(companyItemsToInsert);
        }
        
        log.info(`✅ Updated companies for item ID: ${itemId}. Added ${companyIds?.length || 0} associations.`);
        return { success: true };
      } catch (err) {
        log.error("❌ Error updating item companies:", {
          error: err.message,
          stack: err.stack,
          itemId,
          companyIds,
          errorType: err.name
        });
        return { success: false, error: err.message };
      }
    });
    log.info("✅ IPC handler 'update-item-companies' registered successfully");
    
  } catch (err) {
    log.error("❌ Failed to initialize item dashboard IPC:", {
      error: err.message,
      stack: err.stack,
      errorType: err.name
    });
  }
}

module.exports = { registerItemDashboardIpc };
