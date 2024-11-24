import { create } from 'zustand';
import { SubscriptionPlan, SubscriptionPlanInput } from '../types/subscription';

interface SubscriptionState {
  plans: SubscriptionPlan[];
  addPlan: (plan: SubscriptionPlanInput) => void;
  updatePlan: (id: string, plan: Partial<SubscriptionPlanInput>) => void;
  deletePlan: (id: string) => void;
  togglePlanStatus: (id: string) => void;
  getActivePlans: () => SubscriptionPlan[];
}

// Initial mock data
const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: '1',
    tier: 'basic',
    name: 'Basic',
    price: 29.99,
    features: [
      'Access to all locations',
      'Basic equipment usage',
      'Standard hours access',
      'Mobile app access',
    ],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    tier: 'pro',
    name: 'Pro',
    price: 49.99,
    features: [
      'All Basic features',
      'Premium equipment access',
      'Extended hours access',
      'Guest passes (2/month)',
      'Priority booking',
      'Fitness tracking',
    ],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    tier: 'premium',
    name: 'Premium',
    price: 79.99,
    features: [
      'All Pro features',
      'Unlimited guest passes',
      '24/7 access',
      'Personal training sessions',
      'Nutrition consultation',
      'Access to exclusive events',
      'Priority support',
    ],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plans: INITIAL_PLANS,

  addPlan: (planInput) => {
    const newPlan: SubscriptionPlan = {
      id: Date.now().toString(),
      ...planInput,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      plans: [...state.plans, newPlan],
    }));
  },

  updatePlan: (id, planUpdate) => {
    set((state) => ({
      plans: state.plans.map((plan) =>
        plan.id === id
          ? {
              ...plan,
              ...planUpdate,
              updatedAt: new Date(),
            }
          : plan
      ),
    }));
  },

  deletePlan: (id) => {
    set((state) => ({
      plans: state.plans.filter((plan) => plan.id !== id),
    }));
  },

  togglePlanStatus: (id) => {
    set((state) => ({
      plans: state.plans.map((plan) =>
        plan.id === id
          ? {
              ...plan,
              isActive: !plan.isActive,
              updatedAt: new Date(),
            }
          : plan
      ),
    }));
  },

  getActivePlans: () => {
    return get().plans.filter((plan) => plan.isActive);
  },
}));