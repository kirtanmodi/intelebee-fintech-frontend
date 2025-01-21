import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

interface DashboardSettings {
  branding: {
    accentColor?: string;
    brandColor?: string;
    icon?: string;
    logo?: string;
  };
  features: {
    transactions: boolean;
    payouts: boolean;
    paymentMethods: boolean;
    customerSupport: boolean;
  };
  navigation: {
    returnUrl: string;
    supportUrl?: string;
  };
}

const ExpressDashboardConfig = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<DashboardSettings>({
    branding: {},
    features: {
      transactions: true,
      payouts: true,
      paymentMethods: true,
      customerSupport: true
    },
    navigation: {
      returnUrl: window.location.origin
    }
  });

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVERLESS_API_URL}/express-dashboard-settings`
      );
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching dashboard settings:', error);
      toast.error('Failed to load dashboard settings');
    }
  };

  const handleSettingChange = (
    section: keyof DashboardSettings,
    field: string,
    value: string | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVERLESS_API_URL}/update-dashboard-settings`,
        settings
      );
      toast.success('Dashboard settings updated successfully');
    } catch (error) {
      console.error('Error updating dashboard settings:', error);
      toast.error('Failed to update dashboard settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Express Dashboard Configuration
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Branding Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Branding</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accent Color
                </label>
                <input
                  type="color"
                  value={settings.branding.accentColor || '#635BFF'}
                  onChange={(e) => handleSettingChange('branding', 'accentColor', e.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 p-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={settings.branding.logo || ''}
                  onChange={(e) => handleSettingChange('branding', 'logo', e.target.value)}
                  placeholder="https://your-domain.com/logo.png"
                  className="input w-full"
                />
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Feature Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={feature}
                    checked={enabled}
                    onChange={(e) => handleSettingChange('features', feature, e.target.checked)}
                    className="form-checkbox h-5 w-5 text-primary-600"
                  />
                  <label
                    htmlFor={feature}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {feature.charAt(0).toUpperCase() + feature.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Navigation Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Navigation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Return URL
                </label>
                <input
                  type="url"
                  value={settings.navigation.returnUrl}
                  onChange={(e) => handleSettingChange('navigation', 'returnUrl', e.target.value)}
                  className="input w-full"
                  placeholder="https://your-domain.com/dashboard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Support URL
                </label>
                <input
                  type="url"
                  value={settings.navigation.supportUrl || ''}
                  onChange={(e) => handleSettingChange('navigation', 'supportUrl', e.target.value)}
                  className="input w-full"
                  placeholder="https://your-domain.com/support"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end space-x-4">
            <motion.button
              type="button"
              onClick={fetchCurrentSettings}
              className="btn btn-outline"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Reset
            </motion.button>
            <motion.button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ExpressDashboardConfig;
