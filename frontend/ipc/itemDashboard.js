const { ipcMain } = require("electron");
const log = require('electron-log/main');
const DatabaseManager = require("../db/db");
const { items } = require("../db/schema/Item");
const { eq } = require("drizzle-orm");

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

  } catch (err) {
    log.error("❌ Failed to initialize item dashboard IPC:", {
      error: err.message,
      stack: err.stack,
      errorType: err.name
    });
  }
}

module.exports = { registerItemDashboardIpc };
