'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components';
import axios from 'axios';

interface Account {
  id: string;
  business_profile?: {
    name?: string;
  };
  charges_enabled: boolean;
  payouts_enabled: boolean;
}

const ConnectedAccountsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

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
      console.error('Error fetching accounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_SERVERLESS_API_URL}/delete-account`, {
        data: { accountId }
      });
      fetchAccounts();
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
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
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 dark:bg-destructive/20 text-destructive dark:text-destructive/90 text-sm border border-destructive/20 dark:border-destructive/30">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-card dark:bg-card text-card-foreground dark:text-card-foreground rounded-lg p-6 border border-border"
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
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="mt-4 w-full px-4 py-2 text-sm text-destructive dark:text-destructive 
                      hover:bg-destructive/10 dark:hover:bg-destructive/20 
                      rounded-lg transition-colors 
                      bg-destructive/5 dark:bg-destructive/10
                      border border-destructive/20 dark:border-destructive/30"
                  >
                    Delete Account
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </Container>
  );
};

export { ConnectedAccountsPage };
