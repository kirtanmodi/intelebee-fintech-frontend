import React, { useState, useEffect } from 'react';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import {
  ConnectPayments,
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
  ConnectBalances,
  ConnectAccountManagement,
  ConnectPayouts,
  ConnectNotificationBanner
} from '@stripe/react-connect-js';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ErrorBoundary } from 'react-error-boundary';

interface EmbeddedUIProps {
  accountId: string;
}

interface AccountSessionResponse {
  success: boolean;
  clientSecret: string;
  error?: string;
}

const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="p-6 bg-red-50 rounded-lg shadow-lg m-4"
  >
    <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong:</h2>
    <p className="text-red-600 mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
    >
      Try again
    </button>
  </motion.div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
    />
  </div>
);

export default function EmbeddedUI({ accountId }: EmbeddedUIProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stripeConnectInstance] = useState(() => {
    const fetchClientSecret = async () => {
      try {
        const response = await axios.post<AccountSessionResponse>(
          `${import.meta.env.VITE_SERVERLESS_API_URL}/account-session`,
          { accountId },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
          }
        );

        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch client secret');
        }

        return response.data.clientSecret;
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
        toast.error(errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    };

    return loadConnectAndInitialize({
      publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      fetchClientSecret,
      appearance: {
        overlays: 'dialog',
        variables: {
          colorPrimary: '#625afa',
          fontFamily: '"Inter", system-ui, sans-serif',
          borderRadius: '8px',
          spacingUnit: '4px'
        }
      }
    });
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error)
    return <ErrorFallback error={{ message: error }} resetErrorBoundary={() => setError(null)} />;
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6"
      >
        <div className="max-w-7xl mx-auto">
          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <h2 className="text-xl font-semibold mb-4">Payments</h2>
                  <ConnectPayments />
                </motion.div>

                <motion.div
                  key="balances"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <h2 className="text-xl font-semibold mb-4">Balances</h2>
                  <ConnectBalances />
                </motion.div>

                <motion.div
                  key="onboarding"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <h2 className="text-xl font-semibold mb-4">Account Onboarding</h2>
                  <ConnectAccountOnboarding
                    onExit={() => toast.info('Account has exited onboarding')}
                    fullTermsOfServiceUrl={import.meta.env.VITE_TERMS_URL}
                    recipientTermsOfServiceUrl={import.meta.env.VITE_RECIPIENT_TERMS_URL}
                    privacyPolicyUrl={import.meta.env.VITE_PRIVACY_URL}
                    skipTermsOfServiceCollection={false}
                    collectionOptions={{
                      fields: 'eventually_due',
                      futureRequirements: 'include'
                    }}
                    onStepChange={(stepChange) => {
                      toast.info(`Progress: ${stepChange.step}`);
                    }}
                  />
                </motion.div>

                <motion.div
                  key="management"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <h2 className="text-xl font-semibold mb-4">Account Management</h2>
                  <ConnectAccountManagement
                    collectionOptions={{
                      fields: 'eventually_due',
                      futureRequirements: 'include'
                    }}
                  />
                </motion.div>

                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                  <ConnectNotificationBanner
                    collectionOptions={{
                      fields: 'eventually_due',
                      futureRequirements: 'include'
                    }}
                  />
                </motion.div>

                <motion.div
                  key="payouts"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <h2 className="text-xl font-semibold mb-4">Payouts</h2>
                  <ConnectPayouts />
                </motion.div>
              </AnimatePresence>
            </div>
          </ConnectComponentsProvider>
        </div>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </motion.div>
    </ErrorBoundary>
  );
}
