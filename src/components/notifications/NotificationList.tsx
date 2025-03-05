
import React from 'react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Bell, BellOff, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationListProps {
  onClose?: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    unreadCount,
    clearNotifications,
  } = useNotifications();

  // Helper function to determine notification icon
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-convocation-success" />;
      case 'warning':
        return <Bell className="h-4 w-4 text-convocation-warning" />;
      case 'error':
        return <BellOff className="h-4 w-4 text-convocation-error" />;
      case 'update':
        return <Bell className="h-4 w-4 text-convocation-accent" />;
      default:
        return <Bell className="h-4 w-4 text-convocation-300" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }

    if (onClose) {
      onClose();
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <Bell className="mb-2 h-10 w-10 text-convocation-200" />
        <h3 className="mb-1 text-base font-medium">No notifications</h3>
        <p className="text-sm text-muted-foreground">
          When you have notifications, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-convocation-100 flex items-center justify-between bg-convocation-50">
        <h3 className="font-medium">Notifications</h3>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-8"
            >
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearNotifications}
            className="text-xs h-8 text-convocation-error hover:text-convocation-error hover:bg-convocation-error/10"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <ScrollArea className="max-h-[400px] overflow-auto">
        <div className="flex flex-col">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "p-3 border-b border-convocation-100 cursor-pointer hover:bg-convocation-50 transition-colors",
                !notification.read && "bg-convocation-50"
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex">
                <div className="mr-3 mt-0.5">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={cn("text-sm font-medium", !notification.read && "font-bold")}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-convocation-400 whitespace-nowrap ml-2">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-convocation-600 mt-1">{notification.message}</p>
                  {notification.actionUrl && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-xs text-convocation-accent mt-1 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(notification.actionUrl, '_blank');
                      }}
                    >
                      {notification.actionText || 'View details'}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NotificationList;
