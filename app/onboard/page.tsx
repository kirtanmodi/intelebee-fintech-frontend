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

export default function Onboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVERLESS_API_URL}/get-all-accounts`);
      setAccounts(response.data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch accounts");
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

  const handleOnboard = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("NEXT_PUBLIC_SERVERLESS_API_URL", process.env.NEXT_PUBLIC_SERVERLESS_API_URL);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVERLESS_API_URL}/create-onboarding-link`);
      console.log("response", response);

      if (!response.data.url) {
        throw new Error("Failed to create onboarding link");
      }

      const data = response.data;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4"
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700"
          >
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-8 text-center">
              Merchant Onboarding
            </h1>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOnboard}
              disabled={loading}
              className={`
                w-full py-4 px-6 rounded-xl 
                text-white font-medium text-lg
                transition-all duration-200
                bg-gradient-to-r from-blue-600 to-purple-600
                hover:from-blue-500 hover:to-purple-500
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
              `}
            >
              <span className="flex items-center justify-center">
                {loading && <LoadingSpinner size="md" />}
                {loading ? "Processing..." : "Start Onboarding"}
              </span>
            </motion.button>

            <p className="mt-6 text-gray-400 text-sm text-center">Begin your journey as a merchant partner</p>
          </motion.div>

          <div className="mt-8 w-full">
            <h2 className="text-xl font-semibold text-white mb-4">Connected Accounts</h2>
            {accounts.map((account) => (
              <div key={account.id} className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-4 mb-4 border border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white">{account.business_profile?.name || "Unnamed Account"}</p>
                    <p className="text-sm text-gray-400">ID: {account.id}</p>
                    <p className="text-sm text-gray-400">Status: {account.charges_enabled ? "Active" : "Pending"}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
