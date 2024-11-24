export type NotificationType = 
  | 'message'
  | 'follow'
  | 'billing'
  | 'check-in';

export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
  metadata?: {
    senderId?: string;
    locationId?: string;
    messageId?: string;
    billingId?: string;
  };
}

// Re-export for backward compatibility
export type Notification = INotification;