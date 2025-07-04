const fs = require('fs');
const path = require('path');
const log = require('electron-log/main');
const { app } = require('electron');

/**
 * Simple File Service for local file management
 * Stores files in Electron's userData directory for proper application data management
 */
class SimpleFileService {
    constructor() {
        // Get the user data directory
        this.userDataDir = app.getPath('userData');
        this.uploadsDir = path.join(this.userDataDir, 'uploads');
        this.logoDir = path.join(this.uploadsDir, 'logo');
        this.signDir = path.join(this.uploadsDir, 'sign');
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.uploadsDir, this.logoDir, this.signDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                log.info('Created directory:', dir);
            }
        });
    }

    getCompanyDirName(companyId, companyName) {
        if (!companyId || !companyName) {
            throw new Error('Company ID and name are required for file operations');
        }
        // Sanitize company name for directory use
        const sanitizedName = companyName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_') // Replace non-alphanumeric chars with underscore
            .replace(/_+/g, '_')        // Replace multiple underscores with single
            .replace(/^_|_$/g, '');     // Remove leading/trailing underscores
        
        return `${companyId}_${sanitizedName}`;
    }

    ensureCompanyDirectories(companyId, companyName) {
        if (!companyId || !companyName) {
            throw new Error('Company ID and name are required for file operations');
        }

        const companyDirName = this.getCompanyDirName(companyId, companyName);
        const companyLogoDir = path.join(this.logoDir, companyDirName);
        const companySignDir = path.join(this.signDir, companyDirName);

        [companyLogoDir, companySignDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                log.info('Created company directory:', dir);
            }
        });

        return {
            logoDir: companyLogoDir,
            signDir: companySignDir
        };
    }

    async saveBase64File(base64Data, companyId, companyName, type) {
        if (!base64Data || typeof base64Data !== 'string') {
            log.warn(`${type} data is invalid or not a base64 string.`);
            return null;
        }

        try {
            // Parse the base64 string
            const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                log.warn(`Invalid base64 format for ${type}`);
                return null;
            }

            const fileExtension = matches[1].split('/')[1];
            const data = matches[2];
            const fileBuffer = Buffer.from(data, 'base64');

            // Create directories for this company
            const { logoDir, signDir } = this.ensureCompanyDirectories(companyId, companyName);
            
            // Generate filename with timestamp
            const fileName = `${type}_${Date.now()}.${fileExtension}`;
            
            // Choose directory and create relative path
            const targetDir = type === 'logo' ? logoDir : signDir;
            const companyDirName = this.getCompanyDirName(companyId, companyName);
            const relativePath = path.join(type === 'logo' ? 'logo' : 'sign', companyDirName, fileName);
            const absolutePath = path.join(targetDir, fileName);

            // Clean up old files
            const files = fs.readdirSync(targetDir);
            for (const file of files) {
                if (file.startsWith(type + '_')) {
                    await fs.promises.unlink(path.join(targetDir, file));
                    log.info(`Cleaned up old ${type} file:`, file);
                }
            }

            // Write the new file
            await fs.promises.writeFile(absolutePath, fileBuffer);
            log.info(`${type} saved at: ${absolutePath}`);

            // Return the relative path for storage
            return relativePath;
        } catch (error) {
            log.error(`Error saving ${type} file:`, error);
            return null;
        }
    }

    getBase64File(relativePath) {
        try {
            if (!relativePath) {
                return null;
            }

            const absolutePath = path.join(this.uploadsDir, relativePath);
            
            if (!fs.existsSync(absolutePath)) {
                log.warn('File not found:', absolutePath);
                return null;
            }

            const fileBuffer = fs.readFileSync(absolutePath);
            const ext = path.extname(absolutePath).toLowerCase().substring(1);
            const mimeType = ext === 'png' ? 'image/png' : 
                            ext === 'svg' ? 'image/svg+xml' : 
                            ext === 'gif' ? 'image/gif' : 
                            'image/jpeg';

            return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
        } catch (error) {
            log.error('Error reading file:', error);
            return null;
        }
    }

    /**
     * Save uploaded file
     * @param {Buffer} fileBuffer - File buffer
     * @param {string} originalName - Original filename
     * @param {number} companyId - Company ID for naming
     * @param {string} companyName - Company name for directory
     * @param {string} type - 'logo' or 'signature'
     * @returns {Promise<string>} Saved filename
     */
    async saveFile(fileBuffer, originalName, companyId, companyName, type) {
        try {
            if (!companyId || !companyName) {
                throw new Error('Company ID and name are required for file operations');
            }

            // Validate file type
            const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
            const extension = path.extname(originalName).toLowerCase();

            if (!allowedExtensions.includes(extension)) {
                throw new Error(`Invalid file type: ${extension}. Allowed: ${allowedExtensions.join(', ')}`);
            }

            // Create company-specific directories
            const { logoDir, signDir } = this.ensureCompanyDirectories(companyId, companyName);
            const targetDir = type === 'logo' ? logoDir : signDir;

            // Generate filename: logo_timestamp.png or signature_timestamp.png
            const fileName = `${type}_${Date.now()}${extension}`;
            const companyDirName = this.getCompanyDirName(companyId, companyName);
            const relativePath = path.join(type === 'logo' ? 'logo' : 'sign', companyDirName, fileName);
            const absolutePath = path.join(targetDir, fileName);

            // Clean up old files
            const files = fs.readdirSync(targetDir);
            for (const file of files) {
                if (file.startsWith(type + '_')) {
                    await fs.promises.unlink(path.join(targetDir, file));
                    log.info(`Cleaned up old ${type} file:`, file);
                }
            }

            // Save new file
            await fs.promises.writeFile(absolutePath, fileBuffer);
            log.info(`✅ File saved: ${fileName} (${fileBuffer.length} bytes)`);

            return relativePath;
        } catch (error) {
            log.error('Error saving file:', error);
            throw error;
        }
    }

    /**
     * Get file URL for templates
     * @param {string} relativePath - Relative path from database
     * @returns {string|null} File URL or null if no path
     */
    getFileUrl(relativePath) {
        if (!relativePath) return null;
        return `uploads://${relativePath}`;
    }

    /**
     * Check if file exists
     * @param {string} relativePath - Relative path to check
     * @returns {Promise<boolean>} True if file exists
     */
    async fileExists(relativePath) {
        if (!relativePath) return false;

        try {
            const absolutePath = path.join(this.uploadsDir, relativePath);
            await fs.promises.access(absolutePath);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Delete file
     * @param {string} relativePath - Relative path to delete
     * @returns {Promise<boolean>} True if deleted successfully
     */
    async deleteFile(relativePath) {
        if (!relativePath) return false;

        try {
            const absolutePath = path.join(this.uploadsDir, relativePath);
            await fs.promises.unlink(absolutePath);
            log.info(`🗑️ File deleted: ${relativePath}`);
            return true;
        } catch (error) {
            log.error('Error deleting file:', error);
            return false;
        }
    }

    /**
     * Get file info
     * @param {string} relativePath - Relative path to get info for
     * @returns {Promise<Object|null>} File stats or null
     */
    async getFileInfo(relativePath) {
        if (!relativePath) return null;

        try {
            const absolutePath = path.join(this.uploadsDir, relativePath);
            const stats = await fs.promises.stat(absolutePath);

            return {
                path: relativePath,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                url: this.getFileUrl(relativePath)
            };
        } catch (error) {
            log.error('Error getting file info:', error);
            return null;
        }
    }

    /**
     * Replace company logo
     * @param {Buffer} fileBuffer - New logo file buffer
     * @param {string} originalName - Original filename
     * @param {number} companyId - Company ID
     * @param {string} companyName - Company name
     * @returns {Promise<string>} New relative path
     */
    async replaceCompanyLogo(fileBuffer, originalName, companyId, companyName) {
        return this.saveFile(fileBuffer, originalName, companyId, companyName, 'logo');
    }

    /**
     * Replace company signature
     * @param {Buffer} fileBuffer - New signature file buffer
     * @param {string} originalName - Original filename
     * @param {number} companyId - Company ID
     * @param {string} companyName - Company name
     * @returns {Promise<string>} New relative path
     */
    async replaceCompanySignature(fileBuffer, originalName, companyId, companyName) {
        return this.saveFile(fileBuffer, originalName, companyId, companyName, 'signature');
    }
}

// Create and export a singleton instance
const fileService = new SimpleFileService();
module.exports = fileService; 