import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { useAuthStore } from '../../store/authStore';
import { PlanEditor } from '../../components/admin/PlanEditor';
import { SubscriptionPlan } from '../../types/subscription';

export function PlanManagementPage() {
  const { plans, togglePlanStatus, deletePlan } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (planId: string) => {
    deletePlan(planId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Plan
        </Button>
      </div>

      <div className="grid gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-black rounded-lg shadow-md overflow-hidden border dark:border-gray-800"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">{plan.name}</h2>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        plan.isActive
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Tier: {plan.tier}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePlanStatus(plan.id)}
                  >
                    {plan.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(plan.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-2xl font-bold">${plan.price}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showDeleteConfirm === plan.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t dark:border-gray-800 bg-red-50 dark:bg-red-900/20 p-4"
                >
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-medium">Confirm Deletion</p>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    Are you sure you want to delete this plan? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                    >
                      Delete Plan
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {(selectedPlan || isCreating) && (
          <PlanEditor
            plan={selectedPlan}
            isOpen={true}
            onClose={() => {
              setSelectedPlan(null);
              setIsCreating(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}