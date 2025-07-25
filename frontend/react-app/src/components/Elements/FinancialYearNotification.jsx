import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar, Building, TrendingUp, Info } from 'lucide-react';
import { Badge } from '../ui/badge';
import { generateFinancialYearPrefix, removeYearFromPrefix } from '../../utils/financialYearUtils';

const FinancialYearNotification = ({
    open,
    onOpenChange,
    notification,
    currentPrefix,
    companyName,
    onUpdatePrefix
}) => {
    const [newPrefix, setNewPrefix] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    React.useEffect(() => {
        if (open && currentPrefix) {
            // Generate suggested prefix
            const basePrefix = removeYearFromPrefix(currentPrefix);
            const suggestedPrefix = generateFinancialYearPrefix(basePrefix, true);
            setNewPrefix(suggestedPrefix);
        }
    }, [open, currentPrefix]);

    const handleUpdatePrefix = async () => {
        if (!newPrefix.trim()) return;

        setIsUpdating(true);
        try {
            await onUpdatePrefix(newPrefix.trim().toUpperCase());
            onOpenChange(false);
        } catch (error) {
            console.error('Error updating prefix:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSkip = () => {
        // Store that user skipped this notification for this FY
        localStorage.setItem(`fyNotificationSkipped_${notification?.newFY}`, 'true');
        onOpenChange(false);
    };

    if (!notification) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <AlertDialogTitle className="text-lg">{notification.title}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-sm leading-relaxed">
                        {notification.message}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4">
                    {/* Company Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Building className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">{companyName}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                            <div>
                                <span className="block">Current Prefix:</span>
                                <Badge variant="outline" className="mt-1">{currentPrefix}</Badge>
                            </div>
                            <div>
                                <span className="block">Financial Year:</span>
                                <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
                                    {notification.newFY}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Suggested Prefix */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <Label className="text-sm font-medium">Suggested New Prefix</Label>
                        </div>

                        <div className="space-y-2">
                            <Input
                                value={newPrefix}
                                onChange={(e) => setNewPrefix(e.target.value.toUpperCase())}
                                placeholder="Enter new prefix"
                                className="text-center font-mono text-lg"
                                maxLength={8}
                            />
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Info className="w-3 h-3" />
                                <span>Your next invoice will be: {newPrefix}0001</span>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-green-50 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-green-900 mb-2">Benefits of updating:</h4>
                        <ul className="text-xs text-green-700 space-y-1">
                            <li>• Better organization by financial year</li>
                            <li>• Easier tracking and reporting</li>
                            <li>• Compliance with accounting practices</li>
                            <li>• Clear separation between FY periods</li>
                        </ul>
                    </div>
                </div>

                <AlertDialogFooter className="flex gap-2">
                    <AlertDialogCancel onClick={handleSkip} className="flex-1">
                        Skip for Now
                    </AlertDialogCancel>
                    <Button
                        onClick={handleUpdatePrefix}
                        disabled={!newPrefix.trim() || isUpdating}
                        className="flex-1"
                    >
                        {isUpdating ? 'Updating...' : 'Update Prefix'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default FinancialYearNotification; 