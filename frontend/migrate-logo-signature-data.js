const DatabaseManager = require('./db/db');
const path = require('path');
const fs = require('fs');
const { getFileService } = require('./services/SimpleFileService');

/**
 * Migrate existing logo and signature paths to new filename format
 * This script preserves existing file references by copying files to the new naming convention
 */
async function migrateLegacyFileData() {
    console.log('🔄 Starting logo and signature data migration...');

    try {
        const dbManager = DatabaseManager.getInstance();
        const db = dbManager.getDatabase();
        const fileService = getFileService();

        // Get all companies with existing logo or signature paths
        const companies = await db.all(`
            SELECT id, company_name, logo_path, signature_path 
            FROM companies 
            WHERE logo_path IS NOT NULL OR signature_path IS NOT NULL
        `);

        console.log(`📊 Found ${companies.length} companies with existing file paths`);

        for (const company of companies) {
            console.log(`\n🏢 Processing company: ${company.company_name} (ID: ${company.id})`);

            let logoFileName = null;
            let signatureFileName = null;

            // Handle logo migration
            if (company.logo_path) {
                try {
                    console.log(`  📸 Migrating logo: ${company.logo_path}`);

                    // Check if old file exists
                    if (fs.existsSync(company.logo_path)) {
                        // Read the file
                        const fileBuffer = fs.readFileSync(company.logo_path);
                        const originalName = path.basename(company.logo_path);

                        // Save with new naming convention
                        logoFileName = await fileService.replaceCompanyLogo(
                            fileBuffer,
                            originalName,
                            company.id
                        );

                        console.log(`  ✅ Logo migrated: ${originalName} → ${logoFileName}`);
                    } else {
                        console.log(`  ⚠️ Logo file not found: ${company.logo_path}`);
                    }
                } catch (error) {
                    console.error(`  ❌ Error migrating logo for company ${company.id}:`, error.message);
                }
            }

            // Handle signature migration
            if (company.signature_path) {
                try {
                    console.log(`  ✍️ Migrating signature: ${company.signature_path}`);

                    // Check if old file exists
                    if (fs.existsSync(company.signature_path)) {
                        // Read the file
                        const fileBuffer = fs.readFileSync(company.signature_path);
                        const originalName = path.basename(company.signature_path);

                        // Save with new naming convention
                        signatureFileName = await fileService.replaceCompanySignature(
                            fileBuffer,
                            originalName,
                            company.id
                        );

                        console.log(`  ✅ Signature migrated: ${originalName} → ${signatureFileName}`);
                    } else {
                        console.log(`  ⚠️ Signature file not found: ${company.signature_path}`);
                    }
                } catch (error) {
                    console.error(`  ❌ Error migrating signature for company ${company.id}:`, error.message);
                }
            }

            // Update database with new filenames (before schema migration)
            if (logoFileName || signatureFileName) {
                const updates = [];
                const values = [];

                if (logoFileName) {
                    updates.push('logo_file_name = ?');
                    values.push(logoFileName);
                }

                if (signatureFileName) {
                    updates.push('signature_file_name = ?');
                    values.push(signatureFileName);
                }

                values.push(company.id);

                await db.run(`
                    UPDATE companies 
                    SET ${updates.join(', ')} 
                    WHERE id = ?
                `, ...values);

                console.log(`  📝 Database updated with new filenames`);
            }
        }

        console.log('\n✅ Logo and signature data migration completed successfully!');
        console.log('📋 Migration Summary:');
        console.log(`   - Companies processed: ${companies.length}`);
        console.log(`   - Files migrated to new naming convention`);
        console.log(`   - Database updated with new filename references`);
        console.log('\n💡 You can now safely run the schema migration');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run the migration if this script is executed directly
if (require.main === module) {
    migrateLegacyFileData()
        .then(() => {
            console.log('\n🎉 Migration completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateLegacyFileData }; 