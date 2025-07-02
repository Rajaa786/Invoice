/**
 * Template System Logger
 * Hybrid logging utility that uses console.log for renderer process display
 * and electron-log for persistent file logging via IPC
 */

export class TemplateLogger {
    constructor() {
        this.logLevel = process.env.NODE_ENV === 'development' ? 'debug' : 'info';
        this.sessionId = this.generateSessionId();
        this.logs = [];
        this.isElectron = typeof window !== 'undefined' && window.electronLog;

        console.log(`🚀 [TemplateLogger] Session started: ${this.sessionId}`);
        console.log(`📡 [TemplateLogger] Electron logging available: ${this.isElectron}`);

        // Log to electron-log if available
        if (this.isElectron) {
            window.electronLog.info('TemplateLogger', `Session started: ${this.sessionId}`);
        }
    }

    generateSessionId() {
        return `TLS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async log(level, component, action, data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            sessionId: this.sessionId,
            level,
            component,
            action,
            data
        };

        this.logs.push(logEntry);

        // Console output with emojis for renderer process (always show)
        const emoji = this.getEmojiForLevel(level);
        const message = `${emoji} [${component}] ${action}`;

        if (Object.keys(data).length > 0) {
            console.log(message, data);
        } else {
            console.log(message);
        }

        // Send to electron-log for persistent logging (if available)
        if (this.isElectron) {
            try {
                const logMessage = `${action}`;
                const logData = Object.keys(data).length > 0 ? data : null;

                switch (level) {
                    case 'debug':
                        await window.electronLog.debug(component, logMessage, logData);
                        break;
                    case 'info':
                        await window.electronLog.info(component, logMessage, logData);
                        break;
                    case 'warn':
                        await window.electronLog.warn(component, logMessage, logData);
                        break;
                    case 'error':
                        await window.electronLog.error(component, logMessage, data.error || null, logData);
                        break;
                    case 'success':
                        await window.electronLog.success(component, logMessage, logData);
                        break;
                    default:
                        await window.electronLog.info(component, logMessage, logData);
                }
            } catch (error) {
                console.warn('Failed to send log to electron-log:', error);
            }
        }

        // Store in localStorage for persistence (keep last 100 logs)
        this.persistLogs();
    }

    getEmojiForLevel(level) {
        const emojiMap = {
            debug: '🔍',
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            success: '✅'
        };
        return emojiMap[level] || 'ℹ️';
    }

    persistLogs() {
        try {
            const recentLogs = this.logs.slice(-100); // Keep only last 100 logs
            localStorage.setItem('templateSystemLogs', JSON.stringify(recentLogs));
        } catch (error) {
            console.warn('Failed to persist logs:', error);
        }
    }

    // Specific logging methods for different components
    templateSelection(action, data = {}) {
        this.log('info', 'TemplateSelection', action, data);
    }

    configurationManager(action, data = {}) {
        this.log('info', 'ConfigurationManager', action, data);
    }

    templateFactory(action, data = {}) {
        this.log('info', 'TemplateFactory', action, data);
    }

    pdfGeneration(action, data = {}) {
        this.log('info', 'PDFGeneration', action, data);
    }

    invoiceForm(action, data = {}) {
        this.log('info', 'InvoiceForm', action, data);
    }

    error(component, action, error, data = {}) {
        this.log('error', component, action, {
            error: error.message,
            stack: error.stack,
            ...data
        });
    }

    success(component, action, data = {}) {
        this.log('success', component, action, data);
    }

    warn(component, action, data = {}) {
        this.log('warn', component, action, data);
    }

    debug(component, action, data = {}) {
        if (this.logLevel === 'debug') {
            this.log('debug', component, action, data);
        }
    }

    // Get logs for debugging
    getLogs(component = null, level = null) {
        let filteredLogs = this.logs;

        if (component) {
            filteredLogs = filteredLogs.filter(log => log.component === component);
        }

        if (level) {
            filteredLogs = filteredLogs.filter(log => log.level === level);
        }

        return filteredLogs;
    }

    // Export logs for debugging
    exportLogs() {
        const logsData = {
            sessionId: this.sessionId,
            exportTime: new Date().toISOString(),
            logs: this.logs
        };

        const blob = new Blob([JSON.stringify(logsData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `template-system-logs-${this.sessionId}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.log('info', 'TemplateLogger', 'Logs exported', {
            logCount: this.logs.length
        });
    }

    // Export electron logs if available
    async exportElectronLogs() {
        if (!this.isElectron) {
            console.warn('Electron logging not available');
            return;
        }

        try {
            const logPaths = await window.electronLog.getLogPaths();
            const mainLog = await window.electronLog.readLogFile('main');
            const templateLog = await window.electronLog.readLogFile('template');

            const electronLogsData = {
                exportTime: new Date().toISOString(),
                logPaths,
                mainLog,
                templateLog
            };

            const blob = new Blob([JSON.stringify(electronLogsData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `electron-logs-${this.sessionId}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.success('TemplateLogger', 'Electron logs exported', {
                mainLogLines: mainLog.split('\n').length,
                templateLogLines: templateLog.split('\n').length
            });
        } catch (error) {
            this.error('TemplateLogger', 'Failed to export electron logs', error);
        }
    }

    // Clear logs
    clearLogs() {
        this.logs = [];
        localStorage.removeItem('templateSystemLogs');
        this.log('info', 'TemplateLogger', 'Logs cleared');
    }

    // Load persisted logs
    loadPersistedLogs() {
        try {
            const stored = localStorage.getItem('templateSystemLogs');
            if (stored) {
                const logs = JSON.parse(stored);
                this.logs = [...logs];
                console.log(`📂 [TemplateLogger] Loaded ${logs.length} persisted logs`);
            }
        } catch (error) {
            console.warn('Failed to load persisted logs:', error);
        }
    }

    // Track template selection flow
    trackTemplateSelectionFlow(templateId) {
        this.templateSelection('Flow Started', { templateId });

        return {
            configSave: (success) => {
                this.templateSelection('Configuration Save', {
                    templateId,
                    success,
                    step: 'config-save'
                });
            },
            uiUpdate: () => {
                this.templateSelection('UI Update', {
                    templateId,
                    step: 'ui-update'
                });
            },
            complete: (success, error = null) => {
                this.templateSelection('Flow Complete', {
                    templateId,
                    success,
                    error: error?.message,
                    step: 'complete'
                });
            }
        };
    }

    // Track PDF generation flow
    trackPdfGenerationFlow(invoiceData) {
        const invoiceId = invoiceData?.invoiceNumber || 'unknown';
        this.pdfGeneration('Flow Started', {
            invoiceId,
            hasCompany: !!invoiceData?.company,
            hasCustomer: !!invoiceData?.customer,
            itemCount: invoiceData?.items?.length || 0
        });

        return {
            templateFetch: (templateId) => {
                this.pdfGeneration('Template Fetch', {
                    invoiceId,
                    templateId,
                    step: 'template-fetch'
                });
            },
            templateLoad: (templateId, success) => {
                this.pdfGeneration('Template Load', {
                    invoiceId,
                    templateId,
                    success,
                    step: 'template-load'
                });
            },
            templateRender: (templateId, success, error = null) => {
                this.pdfGeneration('Template Render', {
                    invoiceId,
                    templateId,
                    success,
                    error: error?.message,
                    step: 'template-render'
                });
            },
            blobGeneration: (success, blobSize = null) => {
                this.pdfGeneration('Blob Generation', {
                    invoiceId,
                    success,
                    blobSize,
                    step: 'blob-generation'
                });
            },
            complete: (success, error = null) => {
                this.pdfGeneration('Flow Complete', {
                    invoiceId,
                    success,
                    error: error?.message,
                    step: 'complete'
                });
            }
        };
    }

    // Summary report
    generateSummaryReport() {
        const summary = {
            sessionId: this.sessionId,
            totalLogs: this.logs.length,
            logsByLevel: {},
            logsByComponent: {},
            errors: [],
            recentActivity: this.logs.slice(-10),
            isElectron: this.isElectron
        };

        // Count by level
        this.logs.forEach(log => {
            summary.logsByLevel[log.level] = (summary.logsByLevel[log.level] || 0) + 1;
            summary.logsByComponent[log.component] = (summary.logsByComponent[log.component] || 0) + 1;

            if (log.level === 'error') {
                summary.errors.push(log);
            }
        });

        console.table(summary.logsByLevel);
        console.table(summary.logsByComponent);

        if (summary.errors.length > 0) {
            console.group('🚨 Errors in this session:');
            summary.errors.forEach(error => {
                console.error(`[${error.component}] ${error.action}:`, error.data);
            });
            console.groupEnd();
        }

        console.log('📊 Logging Summary:', summary);

        // Also log summary to electron-log
        if (this.isElectron) {
            window.electronLog.info('TemplateLogger', 'Summary report generated', {
                totalLogs: summary.totalLogs,
                errorCount: summary.errors.length,
                components: Object.keys(summary.logsByComponent)
            });
        }

        return summary;
    }

    // Get electron log info if available
    async getElectronLogInfo() {
        if (!this.isElectron) {
            return { available: false };
        }

        try {
            const logPaths = await window.electronLog.getLogPaths();
            return {
                available: true,
                paths: logPaths
            };
        } catch (error) {
            console.error('Failed to get electron log info:', error);
            return { available: false, error: error.message };
        }
    }
}

// Create global instance
export const templateLogger = new TemplateLogger();

// Load any persisted logs
templateLogger.loadPersistedLogs();

// Add global access for debugging
if (typeof window !== 'undefined') {
    window.templateLogger = templateLogger;
}

export default templateLogger; 