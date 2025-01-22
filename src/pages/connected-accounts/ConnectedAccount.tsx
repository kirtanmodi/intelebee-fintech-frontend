'use client';

import { Container } from '@/components';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { EmbeddedCheckoutModal } from './EmbeddedCheckout';
import EmbeddedUI from './EmbeddedUI';

export interface CheckoutSessionRequest {
  accountId: string;
  returnUrl: string;
  lineItems: Array<{
    price_data: {
      currency: string;
      product_data: {
        name: string;
      };
      unit_amount: number;
    };
    quantity: number;
  }>;
  mode: 'payment';
  uiMode: 'embedded';
}

export interface CheckoutSessionResponse {
  url: string;
  clientSecret: string;
  id: string;
}

interface Account {
  id: string;
  business_profile?: {
    name?: string;
  };
  charges_enabled: boolean;
  payouts_enabled: boolean;
  dashboard_settings?: {
    branding?: {
      accentColor?: string;
      logo?: string;
    };
    features?: {
      transactions: boolean;
      payouts: boolean;
      paymentMethods: boolean;
      customerSupport: boolean;
    };
  };
}

interface TestCard {
  number: string;
  scenario: string;
  instructions: string;
}

// interface AccountStatus {
//   details_submitted: boolean;
//   charges_enabled: boolean;
//   payouts_enabled: boolean;
//   capabilities?: {
//     card_payments?: string;
//     transfers?: string;
//     us_bank_account_ach_payments?: string;
//   };
//   requirements?: {
//     currently_due: string[];
//   };
// }

const testCards: TestCard[] = [
  {
    number: '4242424242424242',
    scenario: 'Successful payment',
    instructions: 'Payment succeeds without authentication'
  },
  {
    number: '4000002500003155',
    scenario: 'Authentication required',
    instructions: 'Payment requires authentication'
  },
  {
    number: '4000000000009995',
    scenario: 'Payment declined',
    instructions: 'Card declined (insufficient funds)'
  },
  {
    number: '6205500000000000004',
    scenario: 'UnionPay card',
    instructions: 'Variable length 13-19 digits'
  }
];

const ConnectedAccountsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    clientSecret: string;
    accountId: string;
  } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(10);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVERLESS_API_URL}/get-all-accounts`
      );
      setAccounts(response.data?.accounts?.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch accounts';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardAccess = async (accountId: string) => {
    try {
      setShowDashboardModal(true);
      setSelectedAccount(accountId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access dashboard';
      toast.error(errorMessage);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_SERVERLESS_API_URL}/delete-account`, {
        data: { accountId }
      });
      toast.success('Account deleted successfully');
      fetchAccounts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
      toast.error(errorMessage);
    }
  };

  const handleTestPayment = async (accountId: string) => {
    try {
      const amountInCents = Math.round(paymentAmount * 100);
      if (amountInCents < 50) {
        toast.error('Minimum payment amount is $0.50');
        return;
      }

      const response = await axios.post<CheckoutSessionResponse>(
        `${import.meta.env.VITE_SERVERLESS_API_URL}/create-checkout-session`,
        {
          accountId,
          returnUrl: `${window.location.origin}/connected-accounts?session_id={CHECKOUT_SESSION_ID}`,
          lineItems: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Test Product'
                },
                unit_amount: amountInCents
              },
              quantity: 1
            }
          ],
          mode: 'payment',
          uiMode: 'embedded'
        }
      );

      if (response.data?.clientSecret) {
        setCheckoutData({
          clientSecret: response.data.clientSecret,
          accountId
        });
      } else {
        throw new Error('No client secret received');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create test payment session';
      toast.error(errorMessage);
    }
  };

  const handleCloseCheckout = () => {
    setCheckoutData(null);
  };

  // const checkAccountStatus = async (accountId: string) => {
  //   try {
  //     const response = await axios.get<AccountStatus>(
  //       `${import.meta.env.VITE_SERVERLESS_API_URL}/check-standard-account-status/${accountId}`,
  //       { timeout: 10000 }
  //     );

  //     console.log('response.data', response.data);

  //     const body = response.data;

  //     if (body.charges_enabled) {
  //       toast.success('Account is fully enabled!');
  //     } else {
  //       toast.warning('Account setup is incomplete');
  //     }

  //     if (body.requirements?.currently_due.length) {
  //       toast.info(`Required information: ${body.requirements.currently_due.join(', ')}`);
  //     }
  //   } catch (error) {
  //     let errorMessage = 'Failed to verify account status';
  //     if (error instanceof AxiosError) {
  //       errorMessage = error.response?.data?.message || error.message;
  //     }
  //     toast.error(errorMessage);
  //   }
  // };

  const TestCardInfoModal = () => (
    <AnimatePresence>
      {showInfoModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowInfoModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Test Card Information</h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {testCards.map((card, index) => (
                <motion.div
                  key={card.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="font-mono text-sm mb-2">{card.number}</div>
                  <div className="text-sm font-semibold mb-1">{card.scenario}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {card.instructions}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground dark:text-foreground">
            Connected Accounts
          </h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchAccounts}
            className="btn btn-primary btn-sm"
          >
            Refresh
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-destructive/10 dark:bg-destructive/20 
                      text-destructive dark:text-destructive/90 text-sm 
                      border border-destructive/20 dark:border-destructive/30"
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="rounded-full h-8 w-8 border-2 border-primary border-t-transparent"
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {accounts.map((account) => (
                <motion.div
                  key={account.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  layout
                  className="bg-card dark:bg-card text-card-foreground 
                            dark:text-card-foreground rounded-lg p-6 border border-border
                            hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-2">
                        {account.business_profile?.name || 'Unnamed Account'}
                      </h3>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">
                        ID: {account.id}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            account.charges_enabled
                              ? 'bg-success dark:bg-success'
                              : 'bg-warning dark:bg-warning'
                          }`}
                        />
                        <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                          {account.charges_enabled ? 'Active' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                      {account.charges_enabled && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleDashboardAccess(account.id)}
                            className="w-full px-4 py-2 text-sm text-primary dark:text-primary 
                                 hover:bg-primary/10 dark:hover:bg-primary/20 
                                 rounded-lg transition-colors 
                                 bg-primary/5 dark:bg-primary/10
                                 border border-primary/20 dark:border-primary/30"
                          >
                            Access Dashboard
                          </motion.button>

                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  value={paymentAmount}
                                  onChange={(e) =>
                                    setPaymentAmount(Math.max(0.5, Number(e.target.value)))
                                  }
                                  className="w-full px-4 py-2 text-sm rounded-lg
                                           bg-white dark:bg-gray-800
                                           border border-gray-200 dark:border-gray-700
                                           focus:ring-2 focus:ring-primary/50 focus:border-primary
                                           transition-colors"
                                  min="0.50"
                                  step="0.01"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                  USD
                                </span>
                              </div>
                              <button
                                onClick={() => setShowInfoModal(true)}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                                         dark:hover:text-gray-200 transition-colors"
                                title="View test card information"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </button>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => handleTestPayment(account.id)}
                              className="w-full px-4 py-2 text-sm text-emerald-600 dark:text-emerald-500
                                     hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                                     rounded-lg transition-colors
                                     bg-emerald-50/50 dark:bg-emerald-900/10
                                     border border-emerald-200 dark:border-emerald-800
                                     flex items-center justify-center gap-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              Make Test Payment
                            </motion.button>
                          </div>
                        </>
                      )}
                      {/* <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => checkAccountStatus(account.id)}
                        className="w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-500
                                 hover:bg-blue-50 dark:hover:bg-blue-900/20
                                 rounded-lg transition-colors
                                 bg-blue-50/50 dark:bg-blue-900/10
                                 border border-blue-200 dark:border-blue-800
                                 flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Check Account Status
                      </motion.button> */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleDeleteAccount(account.id)}
                        className="w-full px-4 py-2 text-sm text-destructive dark:text-destructive 
                                 hover:bg-destructive/10 dark:hover:bg-destructive/20 
                                 rounded-lg transition-colors 
                                 bg-destructive/5 dark:bg-destructive/10
                                 border border-destructive/20 dark:border-destructive/30"
                      >
                        Delete Account
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Dashboard Configuration Modal */}
      <AnimatePresence mode="popLayout" presenceAffectsLayout={true}>
        {showDashboardModal && selectedAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDashboardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl w-full h-screen overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowDashboardModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6 text-gray-500 dark:text-gray-400"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              {selectedAccount && <EmbeddedUI accountId={selectedAccount} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {checkoutData && (
        <EmbeddedCheckoutModal
          clientSecret={checkoutData.clientSecret}
          accountId={checkoutData.accountId}
          onClose={handleCloseCheckout}
        />
      )}

      <TestCardInfoModal />
    </Container>
  );
};

export { ConnectedAccountsPage };
