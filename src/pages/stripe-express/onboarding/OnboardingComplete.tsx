import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

interface AccountStatus {
  details_submitted: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    pending_verification: string[];
  };
}

const OnboardingComplete = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);

  const accountId = searchParams.get('accountId');
  const uid = searchParams.get('uid');

  useEffect(() => {
    const checkAccountStatus = async () => {
      if (!accountId) {
        toast.error('No account ID provided');
        navigate('/onboarding');
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVERLESS_API_URL}/check-account-status/${accountId}`
        );

        setAccountStatus(response.data);

        if (response.data.details_submitted && response.data.charges_enabled) {
          toast.success('Account setup completed successfully!');
        }
      } catch (error) {
        toast.error('Failed to verify account status');
        console.error('Status check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAccountStatus();
  }, [accountId, navigate]);

  const handleContinueOnboarding = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVERLESS_API_URL}/create-onboarding-link`,
        { accountId }
      );

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No onboarding URL received');
      }
    } catch (error) {
      toast.error('Failed to continue onboarding');
      console.error('Onboarding continuation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          {accountStatus?.charges_enabled ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900"
            >
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900"
            >
              <svg
                className="w-8 h-8 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </motion.div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {accountStatus?.charges_enabled
              ? 'Account Setup Complete!'
              : 'Additional Information Required'}
          </h1>

          {accountStatus?.requirements?.currently_due.length ? (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Required Information:
              </h2>
              <ul className="text-gray-600 dark:text-gray-400">
                {accountStatus.requirements.currently_due.map((requirement) => (
                  <li key={requirement} className="mb-1">
                    • {requirement.replace(/_/g, ' ').toLowerCase()}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-4">
            {!accountStatus?.charges_enabled && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinueOnboarding}
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Processing...
                  </div>
                ) : (
                  'Continue Onboarding'
                )}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
              className="btn btn-outline w-full"
            >
              Go to Dashboard
            </motion.button>
          </div>
        </div>

        {accountStatus?.charges_enabled && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Account Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Charges Enabled</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {accountStatus.charges_enabled ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Payouts Enabled</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {accountStatus.payouts_enabled ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OnboardingComplete;
