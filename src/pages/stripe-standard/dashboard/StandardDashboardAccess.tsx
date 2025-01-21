import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

const StandardDashboardAccess = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateLoginLink = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVERLESS_API_URL}/create-standard-dashboard-link`,
        {
          returnUrl: `${window.location.origin}/dashboard`
        }
      );

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No dashboard login URL received');
      }
    } catch (error) {
      toast.error('Failed to generate dashboard access');
      console.error('Dashboard access error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900"
          >
            <svg
              className="w-8 h-8 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Your Stripe Dashboard
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Manage your business, view detailed analytics, and access all Stripe features through
            your full-featured Standard Dashboard.
          </p>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateLoginLink}
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Generating Access...
                </div>
              ) : (
                'Access Full Dashboard'
              )}
            </motion.button>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              You'll be redirected to your secure Stripe Standard Dashboard
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Standard Dashboard Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Complete Control</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Full access to all Stripe features, settings, and customization options
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Advanced Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detailed reporting, insights, and business metrics
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Payment Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Process refunds, manage disputes, and handle payouts
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Account Settings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update business information, manage team access, and configure notifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StandardDashboardAccess;
