const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { app } = require('electron');

/**
 * Simple File Service for local file management
 * Stores files in Electron's userData directory for proper application data management
 */
class SimpleFileService {
    constructor() {
        // Store uploads in user data directory
        const userDataPath = app.getPath('userData');
        this.uploadsDir = path.join(userDataPath, 'uploads');
        this.ensureUploadsDir();
    }

    async ensureUploadsDir() {
        try {
            await fs.mkdir(this.uploadsDir, { recursive: true });
            console.log(`📁 Uploads directory ready: ${this.uploadsDir}`);
        } catch (error) {
            console.error('Failed to create uploads directory:', error);
        }
    }

    /**
     * Save uploaded file
     * @param {Buffer} fileBuffer - File buffer
     * @param {string} originalName - Original filename
     * @param {number} companyId - Company ID for naming
     * @param {string} type - 'logo' or 'signature'
     * @returns {Promise<string>} Saved filename
     */
    async saveFile(fileBuffer, originalName, companyId, type) {
        try {
            // Validate file type
            const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
            const extension = path.extname(originalName).toLowerCase();

            if (!allowedExtensions.includes(extension)) {
                throw new Error(`Invalid file type: ${extension}. Allowed: ${allowedExtensions.join(', ')}`);
            }

            // Generate filename: company_1_logo.png
            const filename = `company_${companyId}_${type}${extension}`;
            const filePath = path.join(this.uploadsDir, filename);

            // Delete existing file if it exists
            try {
                await fs.unlink(filePath);
                console.log(`🗑️ Deleted existing file: ${filename}`);
            } catch (error) {
                // File doesn't exist, that's fine
            }

            // Save new file
            await fs.writeFile(filePath, fileBuffer);
            console.log(`✅ File saved: ${filename} (${fileBuffer.length} bytes)`);

            return filename;
        } catch (error) {
            console.error('Error saving file:', error);
            throw error;
        }
    }

    /**
     * Get file URL for templates
     * @param {string} filename - Filename from database
     * @returns {string|null} File URL or null if no filename
     */
    getFileUrl(filename) {
        if (!filename) return null;
        return `uploads://${filename}`;
    }

    /**
     * Check if file exists
     * @param {string} filename - Filename to check
     * @returns {Promise<boolean>} True if file exists
     */
    async fileExists(filename) {
        if (!filename) return false;

        try {
            const filePath = path.join(this.uploadsDir, filename);
            await fs.access(filePath);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Delete file
     * @param {string} filename - Filename to delete
     * @returns {Promise<boolean>} True if deleted successfully
     */
    async deleteFile(filename) {
        if (!filename) return false;

        try {
            const filePath = path.join(this.uploadsDir, filename);
            await fs.unlink(filePath);
            console.log(`🗑️ File deleted: ${filename}`);
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }

    /**
     * Get file info
     * @param {string} filename - Filename to get info for
     * @returns {Promise<Object|null>} File stats or null
     */
    async getFileInfo(filename) {
        if (!filename) return null;

        try {
            const filePath = path.join(this.uploadsDir, filename);
            const stats = await fs.stat(filePath);

            return {
                filename,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                url: this.getFileUrl(filename)
            };
        } catch (error) {
            console.error('Error getting file info:', error);
            return null;
        }
    }

    /**
     * Replace company logo
     * @param {Buffer} fileBuffer - File buffer
     * @param {string} originalName - Original filename
     * @param {number} companyId - Company ID
     * @returns {Promise<string>} New filename
     */
    async replaceCompanyLogo(fileBuffer, originalName, companyId) {
        return this.saveFile(fileBuffer, originalName, companyId, 'logo');
    }

    /**
     * Replace company signature
     * @param {Buffer} fileBuffer - File buffer
     * @param {string} originalName - Original filename
     * @param {number} companyId - Company ID
     * @returns {Promise<string>} New filename
     */
    async replaceCompanySignature(fileBuffer, originalName, companyId) {
        return this.saveFile(fileBuffer, originalName, companyId, 'signature');
    }
}

// Singleton instance
let fileService = null;

function getFileService() {
    if (!fileService) {
        fileService = new SimpleFileService();
    }
    return fileService;
}

module.exports = { SimpleFileService, getFileService }; 