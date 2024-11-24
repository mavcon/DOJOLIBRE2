import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/Button';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { SubscriptionPlan, SubscriptionPlanInput } from '../../types/subscription';

interface PlanEditorProps {
  plan: SubscriptionPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PlanEditor({ plan, isOpen, onClose }: PlanEditorProps) {
  const { addPlan, updatePlan } = useSubscriptionStore();
  const [formData, setFormData] = useState<SubscriptionPlanInput>({
    tier: plan?.tier || '',
    name: plan?.name || '',
    price: plan?.price || 0,
    features: plan?.features || [''],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SubscriptionPlanInput, string>>>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!formData.tier.trim()) {
      newErrors.tier = 'Tier is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (formData.features.some(f => !f.trim())) {
      newErrors.features = 'All features must be filled out';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    if (plan) {
      updatePlan(plan.id, formData);
    } else {
      addPlan(formData);
    }
    onClose();
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-2xl border dark:border-gray-800"
      >
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-800">
          <h2 className="text-xl font-semibold">
            {plan ? 'Edit Plan' : 'Create New Plan'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tier
              </label>
              <input
                type="text"
                value={formData.tier}
                onChange={e => setFormData(prev => ({ ...prev, tier: e.target.value }))}
                className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                placeholder="e.g., basic, pro, premium"
              />
              {errors.tier && (
                <p className="mt-1 text-sm text-red-600">{errors.tier}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                placeholder="Plan name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Price (USD)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
              step="0.01"
              min="0"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Features
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </Button>
            </div>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={e => updateFeature(index, e.target.value)}
                    className="flex-1 px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                    placeholder="Feature description"
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                    >
                      <Minus className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.features && (
              <p className="mt-1 text-sm text-red-600">{errors.features}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {plan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}