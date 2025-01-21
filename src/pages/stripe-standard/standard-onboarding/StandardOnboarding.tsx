import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schema
const emailSchema = z.string().email('Please enter a valid email address');

const businessTypeSchema = z.enum(['individual', 'company', 'non_profit', 'government_entity'], {
  errorMap: () => ({ message: 'Please select a valid business type' })
});

interface OnboardingFormData {
  email: string;
  business_type: z.infer<typeof businessTypeSchema>;
}

const businessTypeOptions = [
  { value: 'individual', label: 'Individual', icon: '👤' },
  { value: 'company', label: 'Company', icon: '🏢' },
  { value: 'non_profit', label: 'Non-Profit', icon: '🤝' },
  { value: 'government_entity', label: 'Government Entity', icon: '🏛️' }
] as const;

export const StandardOnboarding: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingFormData, string>>>({});
  const [formData, setFormData] = useState<OnboardingFormData>({
    email: '',
    business_type: 'individual'
  });

  const validateForm = useCallback((): boolean => {
    try {
      emailSchema.parse(formData.email);
      businessTypeSchema.parse(formData.business_type);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = error.errors.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.path[0]]: curr.message
          }),
          {}
        );
        setErrors(newErrors);
      }
      return false;
    }
  }, [formData]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the form errors');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post<{ url: string }>(
        `${import.meta.env.VITE_SERVERLESS_API_URL}/standard/onboarding`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (!response.data?.url) {
        throw new Error('No onboarding URL received');
      }

      // Smooth transition before redirect
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.location.href = response.data.url;
    } catch (error) {
      let errorMessage = 'Failed to create onboarding link';

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="w-full max-w-2xl">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 backdrop-blur-lg border border-gray-100 dark:border-gray-700"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <div className="space-y-6">
            <div className="text-center">
              <motion.h1
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Stripe Standard Onboarding
              </motion.h1>
              <motion.p
                className="mt-2 text-gray-600 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Start accepting payments in minutes
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    } focus:border-transparent focus:ring-2 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="business@example.com"
                    disabled={loading}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-1 text-sm text-red-500"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Type
                  </label>
                  <select
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.business_type
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    } focus:border-transparent focus:ring-2 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    disabled={loading}
                  >
                    {businessTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <AnimatePresence>
                    {errors.business_type && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-1 text-sm text-red-500"
                      >
                        {errors.business_type}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl bg-primary text-white font-medium 
                  hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Start Onboarding'
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
