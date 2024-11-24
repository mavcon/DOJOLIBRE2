// Update User interface to make subscriptionTier optional
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  memberSince: Date;
  isActive: boolean;
  subscriptionTier?: SubscriptionTier; // Only for MEMBER role
  partnerInfo?: {
    businessName: string;
    businessAddress: string;
    phone: string;
    verified: boolean;
  };
}