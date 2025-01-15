"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MainLayout from "../components/Layout/MainLayout";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import axios from "axios";

interface Account {
  id: string;
  business_profile?: {
    name?: string;
  };
  charges_enabled: boolean;
  payouts_enabled: boolean;
}

export default function Accounts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVERLESS_API_URL}/get-all-accounts`);
      setAccounts(response.data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_SERVERLESS_API_URL}/delete-account`, {
        data: { accountId },
      });
      fetchAccounts();
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err instanceof Error ? err.message : "Failed to delete account");
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Connected Accounts</h1>
          <motion.a
            href="/onboard"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl text-white font-medium 
              bg-gradient-to-r from-blue-600 to-purple-600 
              hover:from-blue-500 hover:to-purple-500
              transition-all duration-200"
          >
            Add New Account
          </motion.a>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-700"
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{account.business_profile?.name || "Unnamed Account"}</h3>
                    <p className="text-sm text-gray-400 mb-1">ID: {account.id}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${account.charges_enabled ? "bg-green-500" : "bg-yellow-500"}`} />
                      <span className="text-sm text-gray-400">{account.charges_enabled ? "Active" : "Pending"}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
                        text-red-400 rounded-lg text-sm transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}
