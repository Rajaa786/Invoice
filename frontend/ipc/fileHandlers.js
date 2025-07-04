const { ipcMain } = require('electron');
const { getFileService } = require('../services/SimpleFileService');
const DatabaseManager = require('../db/db');
const { companies } = require('../db/schema/Company');
const { eq } = require('drizzle-orm');
const log = require('electron-log/main');

/**
 * Register file management IPC handlers
 */
function registerFileHandlers() {
    log.info('Registering file management IPC handlers...');

    const fileService = getFileService();
    const db = DatabaseManager.getInstance().getDatabase();

    // Upload company logo
    ipcMain.handle('files:uploadLogo', async (event, { companyId, fileBuffer, originalName }) => {
        try {
            log.info(`Uploading logo for company ${companyId}: ${originalName}`);

            // Save file
            const filename = await fileService.replaceCompanyLogo(
                Buffer.from(fileBuffer),
                originalName,
                companyId
            );

            // Update database
            await db
                .update(companies)
                .set({ logoFileName: filename })
                .where(eq(companies.id, companyId));

            log.info(`Logo uploaded successfully: ${filename}`);
            return {
                success: true,
                filename,
                url: fileService.getFileUrl(filename)
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

            // Save file
            const filename = await fileService.replaceCompanySignature(
                Buffer.from(fileBuffer),
                originalName,
                companyId
            );

            // Update database
            await db
                .update(companies)
                .set({ signatureFileName: filename })
                .where(eq(companies.id, companyId));

            log.info(`Signature uploaded successfully: ${filename}`);
            return {
                success: true,
                filename,
                url: fileService.getFileUrl(filename)
            };
        } catch (error) {
            log.error('Error uploading signature:', error);
            throw error;
        }
    });

    // Get file info
    ipcMain.handle('files:getFileInfo', async (event, filename) => {
        try {
            return await fileService.getFileInfo(filename);
        } catch (error) {
            log.error('Error getting file info:', error);
            throw error;
        }
    });

    // Check if file exists
    ipcMain.handle('files:fileExists', async (event, filename) => {
        try {
            return await fileService.fileExists(filename);
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
                // Delete file from filesystem
                await fileService.deleteFile(filename);

                // Remove from database
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
                logoUrl: company.logoFileName ? fileService.getFileUrl(company.logoFileName) : null,
                signatureUrl: company.signatureFileName ? fileService.getFileUrl(company.signatureFileName) : null,
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