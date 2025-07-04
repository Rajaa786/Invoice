const { ipcMain } = require('electron');
const fileService = require('../services/SimpleFileService');
const DatabaseManager = require('../db/db');
const { companies } = require('../db/schema/Company');
const { eq } = require('drizzle-orm');
const log = require('electron-log/main');

/**
 * Register file management IPC handlers
 */
function registerFileHandlers() {
    log.info('Registering file management IPC handlers...');

    const db = DatabaseManager.getInstance().getDatabase();

    // Upload company logo
    ipcMain.handle('files:uploadLogo', async (event, { companyId, fileBuffer, originalName }) => {
        try {
            log.info(`Uploading logo for company ${companyId}: ${originalName}`);

            // Get company name for the file path
            const company = await db
                .select()
                .from(companies)
                .where(eq(companies.id, companyId))
                .get();

            if (!company) {
                throw new Error('Company not found');
            }

            // Convert buffer to base64
            const base64Data = `data:image/${originalName.split('.').pop()};base64,${fileBuffer.toString('base64')}`;

            // Save file using the new method
            const relativePath = fileService.saveBase64File(base64Data, company.companyName, 'logo');
            if (!relativePath) {
                throw new Error('Failed to save logo file');
            }

            // Update database
            await db
                .update(companies)
                .set({ logoFileName: relativePath })
                .where(eq(companies.id, companyId));

            log.info(`Logo uploaded successfully: ${relativePath}`);
            return {
                success: true,
                filename: relativePath,
                url: fileService.getBase64File(relativePath)
            };
        } catch (error) {
            log.error('Error uploading logo:', error);
            throw error;
        }
    });

    // Upload company signature
    ipcMain.handle('files:uploadSignature', async (event, { companyId, fileBuffer, originalName }) => {
        try {
            log.info(`Uploading signature for company ${companyId}: ${originalName}`);

            // Get company name for the file path
            const company = await db
                .select()
                .from(companies)
                .where(eq(companies.id, companyId))
                .get();

            if (!company) {
                throw new Error('Company not found');
            }

            // Convert buffer to base64
            const base64Data = `data:image/${originalName.split('.').pop()};base64,${fileBuffer.toString('base64')}`;

            // Save file using the new method
            const relativePath = fileService.saveBase64File(base64Data, company.companyName, 'signature');
            if (!relativePath) {
                throw new Error('Failed to save signature file');
            }

            // Update database
            await db
                .update(companies)
                .set({ signatureFileName: relativePath })
                .where(eq(companies.id, companyId));

            log.info(`Signature uploaded successfully: ${relativePath}`);
            return {
                success: true,
                filename: relativePath,
                url: fileService.getBase64File(relativePath)
            };
        } catch (error) {
            log.error('Error uploading signature:', error);
            throw error;
        }
    });

    // Get file info
    ipcMain.handle('files:getFileInfo', async (event, filename) => {
        try {
            const base64Data = fileService.getBase64File(filename);
            return {
                exists: !!base64Data,
                url: base64Data
            };
        } catch (error) {
            log.error('Error getting file info:', error);
            throw error;
        }
    });

    // Check if file exists
    ipcMain.handle('files:fileExists', async (event, filename) => {
        try {
            return !!fileService.getBase64File(filename);
        } catch (error) {
            log.error('Error checking file existence:', error);
            return false;
        }
    });

    // Delete file (removes from filesystem and database)
    ipcMain.handle('files:deleteFile', async (event, { companyId, type }) => {
        try {
            // Get current filename from database
            const company = await db
                .select()
                .from(companies)
                .where(eq(companies.id, companyId))
                .get();

            if (!company) {
                throw new Error('Company not found');
            }

            const fieldName = type === 'logo' ? 'logoFileName' : 'signatureFileName';
            const filename = company[fieldName];

            if (filename) {
                // Remove from database first
                await db
                    .update(companies)
                    .set({ [fieldName]: null })
                    .where(eq(companies.id, companyId));

                log.info(`${type} deleted successfully for company ${companyId}: ${filename}`);
            }

            return { success: true };
        } catch (error) {
            log.error(`Error deleting ${type}:`, error);
            throw error;
        }
    });

    // Get company assets (logo and signature URLs)
    ipcMain.handle('files:getCompanyAssets', async (event, companyId) => {
        try {
            const company = await db
                .select()
                .from(companies)
                .where(eq(companies.id, companyId))
                .get();

            if (!company) {
                return { logoUrl: null, signatureUrl: null };
            }

            return {
                logoUrl: company.logoFileName ? fileService.getBase64File(company.logoFileName) : null,
                signatureUrl: company.signatureFileName ? fileService.getBase64File(company.signatureFileName) : null,
                logoFileName: company.logoFileName,
                signatureFileName: company.signatureFileName
            };
        } catch (error) {
            log.error('Error getting company assets:', error);
            throw error;
        }
    });

    log.info('File management IPC handlers registered successfully');
}

module.exports = { registerFileHandlers }; 