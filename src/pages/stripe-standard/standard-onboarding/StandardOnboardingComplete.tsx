import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

interface AccountStatus {
  details_submitted: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  capabilities?: {
    card_payments?: string;
    transfers?: string;
    us_bank_account_ach_payments?: string;
    tax_reporting_us_1099_k?: string;
  };
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    pending_verification: string[];
    disabled_reason?: string;
  };
}

const CapabilityStatus: React.FC<{ label: string; status?: string }> = ({ label, status }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm"
  >
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="font-medium text-gray-900 dark:text-white mt-1">
      {status === 'active' ? (
        <span className="text-green-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Enabled
        </span>
      ) : (
        <span className="text-yellow-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6zm0 6a1 1 0 10-2 0h2z"
              clipRule="evenodd"
            />
          </svg>
          Pending
        </span>
      )}
    </p>
  </motion.div>
);

export const StandardOnboardingComplete: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);

  const accountId = searchParams.get('accountId');

  useEffect(() => {
    const checkAccountStatus = async () => {
      if (!accountId) {
        toast.error('No account ID provided');
        navigate('/standard-onboarding');
        return;
      }

      try {
        const response = await axios.get<AccountStatus>(
          `${import.meta.env.VITE_SERVERLESS_API_URL}/check-standard-account-status/${accountId}`,
          { timeout: 10000 }
        );

        setAccountStatus(response.data);

        if (response.data.details_submitted && response.data.charges_enabled) {
          toast.success('Account setup completed successfully!');
        }
      } catch (error) {
        let errorMessage = 'Failed to verify account status';

        if (error instanceof AxiosError) {
          errorMessage = error.response?.data?.message || error.message;
        }

        toast.error(errorMessage);
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
      const response = await axios.post<{ url: string }>(
        `${import.meta.env.VITE_SERVERLESS_API_URL}/create-standard-onboarding-link`,
        { accountId },
        { timeout: 10000 }
      );

      if (!response.data?.url) {
        throw new Error('No onboarding URL received');
      }

      // Smooth transition before redirect
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.location.href = response.data.url;
    } catch (error) {
      let errorMessage = 'Failed to continue onboarding';

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      }

      toast.error(errorMessage);
      console.error('Onboarding continuation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

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
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            >
              {accountStatus?.charges_enabled ? (
                <svg
                  className="w-10 h-10 text-white"
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
              ) : (
                <svg
                  className="w-10 h-10 text-white"
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
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 mb-4"
            >
              {accountStatus?.charges_enabled
                ? 'Account Setup Complete!'
                : 'Additional Information Required'}
            </motion.h1>

            <AnimatePresence>
              {accountStatus?.requirements?.currently_due.length ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Required Information:
                  </h2>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    {accountStatus.requirements.currently_due.map((requirement) => (
                      <motion.li
                        key={requirement}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-center space-x-2"
                      >
                        <span>•</span>
                        <span>{requirement.replace(/_/g, ' ').toLowerCase()}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="space-y-4">
              {!accountStatus?.charges_enabled && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContinueOnboarding}
                  disabled={loading}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium 
                    hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                    'Continue Onboarding'
                  )}
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/standard-dashboard')}
                className="w-full px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 
                  text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 
                  focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                Go to Dashboard
              </motion.button>
            </div>
          </div>

          {accountStatus?.charges_enabled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Capabilities
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <CapabilityStatus
                  label="Card Payments"
                  status={accountStatus.capabilities?.card_payments}
                />
                <CapabilityStatus
                  label="Transfers"
                  status={accountStatus.capabilities?.transfers}
                />
                <CapabilityStatus
                  label="ACH Payments"
                  status={accountStatus.capabilities?.us_bank_account_ach_payments}
                />
                <CapabilityStatus
                  label="Tax Reporting"
                  status={accountStatus.capabilities?.tax_reporting_us_1099_k}
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StandardOnboardingComplete;
