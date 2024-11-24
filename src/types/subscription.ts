export type SubscriptionTier = 'basic' | 'pro' | 'premium' | string;

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  price: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlanInput {
  tier: SubscriptionTier;
  name: string;
  price: number;
  features: string[];
}