// API Logger Module
// Logs all API requests and responses to JSON files by module

class APILogger {
    constructor() {
        this.logs = new Map(); // Separate logs for each module
        this.currentModule = null;
        this.requestCounter = 0;
    }

    // Set current module for logging context
    setCurrentModule(moduleId) {
        this.currentModule = moduleId;
        if (!this.logs.has(moduleId)) {
            this.logs.set(moduleId, []);
        }
    }

    // Get current module ID
    getCurrentModule() {
        // Try to get from appState if available
        if (typeof appState !== 'undefined' && appState.currentModule !== undefined && appState.modules) {
            const module = appState.modules[appState.currentModule];
            return module ? module.id : 'unknown';
        }
        return this.currentModule || 'unknown';
    }

    // Log API request
    logRequest(url, requestData, method = 'POST') {
        const moduleId = this.getCurrentModule();
        this.requestCounter++;
        
        const logEntry = {
            id: this.requestCounter,
            timestamp: new Date().toISOString(),
            type: 'request',
            module: moduleId,
            url: url,
            method: method,
            requestData: this.sanitizeData(requestData),
            metadata: {
                userAgent: navigator.userAgent,
                sessionId: this.getSessionId(),
                moduleTitle: this.getModuleTitle(moduleId)
            }
        };

        if (!this.logs.has(moduleId)) {
            this.logs.set(moduleId, []);
        }
        
        this.logs.get(moduleId).push(logEntry);
        console.log(`[API Logger] Request logged for module ${moduleId}:`, logEntry);
        
        return logEntry.id; // Return ID for matching with response
    }

    // Log API response
    logResponse(requestId, responseData, success = true, error = null) {
        const moduleId = this.getCurrentModule();
        
        const logEntry = {
            id: this.requestCounter + 0.1, // Slight increment to maintain order
            requestId: requestId,
            timestamp: new Date().toISOString(),
            type: 'response',
            module: moduleId,
            success: success,
            responseData: success ? this.sanitizeData(responseData) : null,
            error: error,
            metadata: {
                responseSize: success ? JSON.stringify(responseData).length : 0,
                processingTime: this.calculateProcessingTime(requestId)
            }
        };

        if (!this.logs.has(moduleId)) {
            this.logs.set(moduleId, []);
        }
        
        this.logs.get(moduleId).push(logEntry);
        console.log(`[API Logger] Response logged for module ${moduleId}:`, logEntry);
    }

    // Calculate processing time between request and response
    calculateProcessingTime(requestId) {
        const moduleId = this.getCurrentModule();
        const moduleLogs = this.logs.get(moduleId) || [];
        const request = moduleLogs.find(log => log.id === requestId && log.type === 'request');
        
        if (request) {
            const requestTime = new Date(request.timestamp);
            const responseTime = new Date();
            return responseTime - requestTime; // milliseconds
        }
        
        return 0;
    }

    // Sanitize data to remove sensitive information
    sanitizeData(data) {
        if (typeof data === 'string') {
            return data.length > 5000 ? data.substring(0, 5000) + '...[truncated]' : data;
        }
        
        if (typeof data === 'object' && data !== null) {
            const sanitized = JSON.parse(JSON.stringify(data));
            
            // Remove or mask sensitive data
            if (sanitized.key) {
                sanitized.key = '***MASKED***';
            }
            if (sanitized.apiKey) {
                sanitized.apiKey = '***MASKED***';
            }
            
            return sanitized;
        }
        
        return data;
    }

    // Get session ID for tracking
    getSessionId() {
        if (!window.apiLoggerSessionId) {
            window.apiLoggerSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return window.apiLoggerSessionId;
    }

    // Get module title for better readability
    getModuleTitle(moduleId) {
        if (typeof appState !== 'undefined' && appState.modules) {
            const module = appState.modules.find(m => m.id === moduleId);
            return module ? module.title : moduleId;
        }
        return moduleId;
    }

    // Export logs for a specific module to JSON file
    exportModuleLogs(moduleId) {
        const moduleLogs = this.logs.get(moduleId) || [];
        
        if (moduleLogs.length === 0) {
            console.log(`[API Logger] No logs found for module ${moduleId}`);
            return;
        }

        const exportData = {
            module: {
                id: moduleId,
                title: this.getModuleTitle(moduleId)
            },
            sessionId: this.getSessionId(),
            exportedAt: new Date().toISOString(),
            totalRequests: moduleLogs.filter(log => log.type === 'request').length,
            totalResponses: moduleLogs.filter(log => log.type === 'response').length,
            logs: moduleLogs
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api_logs_${moduleId}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log(`[API Logger] Logs exported for module ${moduleId}:`, exportData);
    }

    // Export all logs
    exportAllLogs() {
        const allLogs = {};
        
        for (const [moduleId, logs] of this.logs.entries()) {
            allLogs[moduleId] = {
                module: {
                    id: moduleId,
                    title: this.getModuleTitle(moduleId)
                },
                logs: logs
            };
        }

        const exportData = {
            sessionId: this.getSessionId(),
            exportedAt: new Date().toISOString(),
            modules: allLogs
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api_logs_all_modules_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('[API Logger] All logs exported:', exportData);
    }

    // Get logs for a specific module
    getModuleLogs(moduleId) {
        return this.logs.get(moduleId) || [];
    }

    // Get all logs
    getAllLogs() {
        const result = {};
        for (const [moduleId, logs] of this.logs.entries()) {
            result[moduleId] = logs;
        }
        return result;
    }

    // Clear logs for a specific module
    clearModuleLogs(moduleId) {
        this.logs.delete(moduleId);
        console.log(`[API Logger] Logs cleared for module ${moduleId}`);
    }

    // Clear all logs
    clearAllLogs() {
        this.logs.clear();
        this.requestCounter = 0;
        console.log('[API Logger] All logs cleared');
    }

    // Get statistics
    getStatistics() {
        const stats = {
            totalModules: this.logs.size,
            totalRequests: 0,
            totalResponses: 0,
            moduleStats: {}
        };

        for (const [moduleId, logs] of this.logs.entries()) {
            const requests = logs.filter(log => log.type === 'request').length;
            const responses = logs.filter(log => log.type === 'response').length;
            
            stats.totalRequests += requests;
            stats.totalResponses += responses;
            
            stats.moduleStats[moduleId] = {
                title: this.getModuleTitle(moduleId),
                requests: requests,
                responses: responses,
                totalLogs: logs.length
            };
        }

        return stats;
    }
}

// Create global instance
window.apiLogger = new APILogger();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APILogger;
}