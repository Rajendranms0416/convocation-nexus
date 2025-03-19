
import React, { useState, useMemo, useEffect } from 'react';
import { DeviceLog } from '@/types';
import { getDeviceLogs, clearDeviceLogs } from '@/utils/deviceLogger';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, Trash2, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';

const DeviceUsageLogs: React.FC = () => {
  const [logs, setLogs] = useState<DeviceLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch logs on component mount
  useEffect(() => {
    refreshLogs();
  }, []);
  
  const refreshLogs = async () => {
    setIsLoading(true);
    try {
      const fetchedLogs = await getDeviceLogs();
      console.log('Fetched logs:', fetchedLogs);
      setLogs(fetchedLogs);
      toast({
        title: "Logs refreshed",
        description: `Retrieved ${fetchedLogs.length} device usage logs.`,
      });
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: "Error refreshing logs",
        description: "There was a problem retrieving the device logs.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearLogs = async () => {
    if (confirm('Are you sure you want to clear all device logs? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        await clearDeviceLogs();
        setLogs([]);
        toast({
          title: "Logs cleared",
          description: "All device usage logs have been cleared.",
        });
      } catch (error) {
        console.error('Error clearing logs:', error);
        toast({
          title: "Error clearing logs",
          description: "There was a problem clearing the device logs.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const totalMobileLogins = useMemo(() => 
    logs.filter(log => log.deviceType === 'mobile').length, 
    [logs]
  );
  
  const totalDesktopLogins = useMemo(() => 
    logs.filter(log => log.deviceType === 'desktop').length, 
    [logs]
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Device Usage Logs</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshLogs}
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleClearLogs}
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Mobile Logins</p>
              <p className="text-2xl font-bold">{totalMobileLogins}</p>
            </div>
            <div className="bg-convocation-50 p-3 rounded-full">
              <Smartphone className="h-6 w-6 text-convocation-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Desktop Logins</p>
              <p className="text-2xl font-bold">{totalDesktopLogins}</p>
            </div>
            <div className="bg-convocation-50 p-3 rounded-full">
              <Monitor className="h-6 w-6 text-convocation-600" />
            </div>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8 bg-white rounded-md border">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-convocation-500" />
          <p className="text-muted-foreground">Loading device logs...</p>
        </div>
      ) : logs.length > 0 ? (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.userName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {log.userRole.replace(/-/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {log.deviceType === 'mobile' ? 
                        <Smartphone className="h-4 w-4 text-convocation-600" /> : 
                        <Monitor className="h-4 w-4 text-convocation-600" />
                      }
                      <span className="capitalize">{log.deviceType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-md border">
          <p className="text-muted-foreground">No device usage logs available</p>
        </div>
      )}
    </div>
  );
};

export default DeviceUsageLogs;
