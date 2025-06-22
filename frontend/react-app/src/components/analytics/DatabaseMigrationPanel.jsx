import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
    Database,
    Play,
    CheckCircle,
    AlertTriangle,
    Clock,
    RefreshCw,
    Info
} from 'lucide-react';

/**
 * Database Migration Management Panel
 * Provides UI for viewing and running database migrations
 */
export default function DatabaseMigrationPanel() {
    const [migrationStatus, setMigrationStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [runningMigration, setRunningMigration] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [error, setError] = useState(null);

    // Load migration status on component mount
    useEffect(() => {
        loadMigrationStatus();
    }, []);

    /**
     * Load current migration status
     */
    const loadMigrationStatus = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const status = await window.electron.migration.getStatus();
            setMigrationStatus(status);
        } catch (error) {
            console.error('Error loading migration status:', error);
            setError('Failed to load migration status: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Run pending migrations
     */
    const runPendingMigrations = async () => {
        setRunningMigration(true);
        setError(null);
        setLastResult(null);

        try {
            const result = await window.electron.migration.runPending();
            setLastResult(result);

            if (result.success) {
                // Reload status after successful migration
                await loadMigrationStatus();
            }
        } catch (error) {
            console.error('Error running migrations:', error);
            setError('Failed to run migrations: ' + error.message);
        } finally {
            setRunningMigration(false);
        }
    };

    /**
     * Check if schema is up to date
     */
    const checkSchemaStatus = async () => {
        try {
            const isUpToDate = await window.electron.migration.isUpToDate();
            return isUpToDate;
        } catch (error) {
            console.error('Error checking schema status:', error);
            return false;
        }
    };

    /**
     * Get status badge variant
     */
    const getStatusVariant = () => {
        if (!migrationStatus) return 'secondary';
        if (migrationStatus.pending === 0) return 'success';
        return 'warning';
    };

    /**
     * Get status text
     */
    const getStatusText = () => {
        if (!migrationStatus) return 'Loading...';
        if (migrationStatus.pending === 0) return 'Up to date';
        return `${migrationStatus.pending} pending`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Database className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">Database Migrations</h2>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMigrationStatus}
                    disabled={isLoading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Last Migration Result */}
            {lastResult && (
                <Alert variant={lastResult.success ? "default" : "destructive"}>
                    {lastResult.success ? (
                        <CheckCircle className="h-4 w-4" />
                    ) : (
                        <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                        {lastResult.message}
                        {lastResult.applied > 0 && (
                            <span className="ml-2 text-sm">
                                ({lastResult.applied} migrations applied)
                            </span>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {/* Migration Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Migration Status</span>
                        <Badge variant={getStatusVariant()}>
                            {getStatusText()}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {migrationStatus ? (
                        <div className="space-y-4">
                            {/* Status Overview */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {migrationStatus.applied}
                                    </div>
                                    <div className="text-sm text-gray-500">Applied</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {migrationStatus.pending}
                                    </div>
                                    <div className="text-sm text-gray-500">Pending</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {migrationStatus.total}
                                    </div>
                                    <div className="text-sm text-gray-500">Total</div>
                                </div>
                            </div>

                            {/* Available Migrations */}
                            {migrationStatus.availableMigrations && migrationStatus.availableMigrations.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        Available Migrations ({migrationStatus.availableMigrations.length})
                                    </h4>
                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                        {migrationStatus.availableMigrations.map((migration, index) => (
                                            <div
                                                key={migration}
                                                className="flex items-center justify-between p-2 bg-blue-50 rounded border"
                                            >
                                                <span className="text-sm">{migration}</span>
                                                <Badge variant="outline" size="sm" className="text-blue-600">
                                                    Available
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Applied Migrations */}
                            {migrationStatus.appliedMigrations && migrationStatus.appliedMigrations.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        Applied Migrations ({migrationStatus.appliedMigrations.length})
                                    </h4>
                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                        {migrationStatus.appliedMigrations.map((migration, index) => (
                                            <div
                                                key={migration.hash || index}
                                                className="flex items-center justify-between p-2 bg-green-50 rounded border"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {migration.hash ? `Migration ${index + 1}` : migration}
                                                    </span>
                                                    {migration.created_at && (
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(migration.created_at * 1000).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <Badge variant="outline" size="sm" className="text-green-600">
                                                    Applied
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Run Migrations Button */}
                            <div className="pt-4 border-t">
                                <Button
                                    onClick={runPendingMigrations}
                                    disabled={runningMigration}
                                    className="w-full"
                                >
                                    {runningMigration ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Running Drizzle Migrations...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4 mr-2" />
                                            Run Drizzle Migrations
                                            {migrationStatus.pending > 0 && (
                                                <span className="ml-1">({migrationStatus.pending} pending)</span>
                                            )}
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Drizzle will automatically detect and apply any pending schema changes
                                </p>
                            </div>

                            {/* No Pending Migrations */}
                            {migrationStatus.pending === 0 && (
                                <div className="text-center py-4">
                                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-green-600 font-medium">Database schema is up to date!</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        All migrations have been successfully applied.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Loading State
                        <div className="space-y-4 animate-pulse">
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="text-center">
                                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        About Database Migrations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm space-y-2">
                        <p>
                            Database migrations are version-controlled schema changes that keep your database
                            structure up to date with the latest application features.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>Migrations are applied automatically when needed</li>
                            <li>Each migration runs only once and is tracked</li>
                            <li>Failed migrations can be safely retried</li>
                            <li>Always backup your database before running migrations in production</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 