import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield, Star, CheckCircle, XCircle, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { SubscriptionTier } from '../types/auth';

const SUBSCRIPTION_TIERS: Record<SubscriptionTier, {
  name: string;
  price: number;
  features: string[];
}> = {
  basic: {
    name: 'Basic',
    price: 29.99,
    features: [
      'Access to all locations',
      'Basic equipment usage',
      'Standard hours access',
      'Mobile app access',
    ],
  },
  pro: {
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
  },
  premium: {
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
  },
};

const PAYMENT_HISTORY = [
  {
    id: 'inv_123',
    date: new Date('2024-03-01'),
    amount: 49.99,
    status: 'paid',
    description: 'Pro Membership - March 2024',
  },
  {
    id: 'inv_122',
    date: new Date('2024-02-01'),
    amount: 49.99,
    status: 'paid',
    description: 'Pro Membership - February 2024',
  },
  {
    id: 'inv_121',
    date: new Date('2024-01-01'),
    amount: 49.99,
    status: 'paid',
    description: 'Pro Membership - January 2024',
  },
];

export function BillingPage() {
  const user = useAuthStore(state => state.user);
  
  // Only members can access billing
  if (!user || user.role !== 'MEMBER') {
    return null;
  }

  const currentTier = user.subscriptionTier ? SUBSCRIPTION_TIERS[user.subscriptionTier] : null;
  if (!currentTier) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Update Payment Method
        </Button>
      </div>

      {/* Current Subscription */}
      <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-semibold">Current Subscription</h2>
            <p className="text-gray-600 mt-1">Your subscription renews on April 1, 2024</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${currentTier.price}</p>
            <p className="text-sm text-gray-600">per month</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg mb-6">
          <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="font-medium text-indigo-900 dark:text-indigo-100">
              {currentTier.name} Plan
            </p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Active since {format(new Date(user.memberSince), 'MMMM yyyy')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentTier.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.entries(SUBSCRIPTION_TIERS) as [SubscriptionTier, typeof SUBSCRIPTION_TIERS[SubscriptionTier]][]).map(([key, tier]) => (
            <motion.div
              key={key}
              whileHover={{ y: -5 }}
              className={`p-6 rounded-lg border-2 ${
                key === user.subscriptionTier
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">{tier.name}</h3>
                {key === user.subscriptionTier && (
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                    Current
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold mb-4">${tier.price}</p>
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={key === user.subscriptionTier ? 'outline' : 'default'}
                className="w-full"
                disabled={key === user.subscriptionTier}
              >
                {key === user.subscriptionTier ? 'Current Plan' : 'Switch Plan'}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-6">Payment History</h2>
        <div className="space-y-4">
          {PAYMENT_HISTORY.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between py-3 border-b last:border-0 dark:border-gray-800"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${
                  payment.status === 'paid' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                }`}>
                  {payment.status === 'paid' ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{payment.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(payment.date, 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">${payment.amount}</span>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}