const { ipcMain } = require("electron");
const log = require('electron-log/main');
const fs = require("fs");
const path = require("path");
const DatabaseManager = require("../db/db");
const { migrate } = require("drizzle-orm/better-sqlite3/migrator");

/**
 * Database Migration Runner using Drizzle's built-in migration system
 * More robust and efficient than custom implementation
 */
class MigrationRunner {
    constructor() {
        this.dbManager = DatabaseManager.getInstance();
        this.db = this.dbManager.getDatabase();
        // this.sqlite = this.dbManager.getSqliteInstance();
        this.migrationsFolder = path.resolve(__dirname, "../drizzle");
        log.info("MigrationRunner initialized");
        log.debug("migrationsFolder:", this.migrationsFolder);
    }

    /**
     * Run Drizzle migrations using built-in migrate function
     * Much more robust and efficient than custom implementation
     */
    async runDrizzleMigrations() {
        try {
            log.info('🔄 Running Drizzle migrations...');
            log.debug('Database instance:', !!this.db);
            log.debug('Migrations folder:', this.migrationsFolder);

            // Use Drizzle's built-in migrate function
            await migrate(this.db, {
                migrationsFolder: this.migrationsFolder
            });

            log.info('✅ Drizzle migrations completed successfully');
            return {
                success: true,
                message: 'All migrations applied successfully',
                method: 'drizzle-migrate'
            };
        } catch (error) {
            log.error('❌ Drizzle migration failed:', error);
            throw new Error(`Migration failed: ${error.message}`);
        }
    }

    /**
     * Get list of available migration files for status reporting
     */
    getAvailableMigrations() {
        try {
            const files = fs.readdirSync(this.migrationsFolder);
            return files
                .filter(file => file.endsWith('.sql'))
                .sort()
                .map(file => ({
                    filename: file,
                    path: path.join(this.migrationsFolder, file)
                }));
        } catch (error) {
            log.error('Error reading migrations directory:', error);
            return [];
        }
    }

    /**
     * Check if Drizzle migrations table exists (for status reporting)
     */
    async checkDrizzleMigrationsTable() {
        try {
            const result = this.sqlite.prepare(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='__drizzle_migrations'
            `).get();
            return !!result;
        } catch (error) {
            log.error('Error checking Drizzle migrations table:', error);
            return false;
        }
    }

    /**
     * Get applied migrations from Drizzle's migrations table
     */
    async getAppliedMigrations() {
        try {
            const tableExists = await this.checkDrizzleMigrationsTable();
            if (!tableExists) {
                return [];
            }

            const result = this.sqlite.prepare(`
                SELECT hash, created_at 
                FROM __drizzle_migrations 
                ORDER BY created_at
            `).all();

            return result;
        } catch (error) {
            log.error('Error getting applied migrations:', error);
            return [];
        }
    }

    /**
 * Run all pending migrations using Drizzle's migrate function
 */
    async runPendingMigrations() {
        try {
            // Simply use Drizzle's migrate function - it handles everything
            const result = await this.runDrizzleMigrations();

            // Get status information for response
            const available = this.getAvailableMigrations();
            const applied = await this.getAppliedMigrations();

            return {
                ...result,
                applied: applied.length,
                total: available.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            log.error('Error running migrations:', error);
            return {
                success: false,
                message: `Migration failed: ${error.message}`,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
 * Get migration status for Drizzle migrations
 */
    async getMigrationStatus() {
        try {
            const available = this.getAvailableMigrations();
            const appliedMigrations = await this.getAppliedMigrations();
            const tableExists = await this.checkDrizzleMigrationsTable();

            // For Drizzle migrations, we can't easily determine pending vs applied
            // without more complex logic, so we provide general status
            return {
                total: available.length,
                applied: appliedMigrations.length,
                pending: tableExists ? Math.max(0, available.length - appliedMigrations.length) : available.length,
                tableExists: tableExists,
                appliedMigrations: appliedMigrations,
                availableMigrations: available.map(m => m.filename),
                migrationsFolder: this.migrationsFolder,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            log.error('Error getting migration status:', error);
            throw error;
        }
    }

    /**
     * Check if database schema is up to date
     * For Drizzle migrations, this checks if migration table exists and has entries
     */
    async isSchemaUpToDate() {
        try {
            const tableExists = await this.checkDrizzleMigrationsTable();
            if (!tableExists) {
                return false; // No migrations have been run yet
            }

            const appliedMigrations = await this.getAppliedMigrations();
            const availableMigrations = this.getAvailableMigrations();

            // Simple heuristic: if we have applied migrations and available migrations,
            // assume we're up to date. Drizzle handles the detailed checking.
            return appliedMigrations.length > 0 && availableMigrations.length > 0;
        } catch (error) {
            log.error('Error checking schema status:', error);
            return false;
        }
    }
}

// Initialize migration runner
const migrationRunner = new MigrationRunner();

/**
 * Register migration IPC handlers
 */
function registerMigrationIpc() {
    log.info('Registering Migration IPC handlers...');

    // Run pending migrations
    ipcMain.handle("migration:runPending", async (event) => {
        try {
            log.info('Processing migration:runPending request');
            const result = await migrationRunner.runPendingMigrations();
            log.info(`Migration completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
            return result;
        } catch (error) {
            log.error('IPC Error - runPending:', error);
            throw error;
        }
    });

    // Get migration status
    ipcMain.handle("migration:getStatus", async (event) => {
        try {
            log.debug('Processing migration:getStatus request');
            const result = await migrationRunner.getMigrationStatus();
            log.debug(`Migration status: ${result.applied}/${result.total} applied`);
            return result;
        } catch (error) {
            log.error('IPC Error - getStatus:', error);
            throw error;
        }
    });

    // Check if schema is up to date
    ipcMain.handle("migration:isUpToDate", async (event) => {
        try {
            log.debug('Processing migration:isUpToDate request');
            const result = await migrationRunner.isSchemaUpToDate();
            log.debug(`Schema up to date: ${result}`);
            return result;
        } catch (error) {
            log.error('IPC Error - isUpToDate:', error);
            throw error;
        }
    });

    log.info('Migration IPC handlers registered successfully');
}

module.exports = { registerMigrationIpc, MigrationRunner }; 