'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components';
import axios from 'axios';
import { toast } from 'sonner';

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

const ConnectedAccountsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showDashboardModal, setShowDashboardModal] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVERLESS_API_URL}/get-all-accounts`
      );
      setAccounts(response.data);
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
      const response = await axios.post(
        `${import.meta.env.VITE_SERVERLESS_API_URL}/create-express-dashboard-link`,
        {
          accountId,
          returnUrl: `${window.location.origin}/connected-accounts`
        }
      );

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No dashboard login URL received');
      }
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

  const handleUpdateSettings = async (accountId: string) => {
    setSelectedAccount(accountId);
    setShowDashboardModal(true);
  };

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

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleUpdateSettings(account.id)}
                        disabled={updating === account.id}
                        className="w-full px-4 py-2 text-sm text-primary dark:text-primary 
                                 hover:bg-primary/10 dark:hover:bg-primary/20 
                                 rounded-lg transition-colors 
                                 bg-primary/5 dark:bg-primary/10
                                 border border-primary/20 dark:border-primary/30"
                      >
                        {updating === account.id ? 'Updating...' : 'Configure Dashboard'}
                      </motion.button>

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
      <AnimatePresence>
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
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={`/dashboard-config/${selectedAccount}`}
                className="w-full h-[80vh]"
                title="Dashboard Configuration"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

export { ConnectedAccountsPage };
