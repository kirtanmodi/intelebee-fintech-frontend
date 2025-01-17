import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

type OnboardingType = 'express' | 'standard' | 'custom';

const Demo1LightSidebarPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OnboardingType>('express');
  const [email, setEmail] = useState('');

  const handleOnboard = async (type: OnboardingType) => {
    setLoading(true);
    setError(null);

    try {
      if (type === 'standard' && !email) {
        throw new Error('Email is required for standard onboarding');
      }

      const endpoint =
        type === 'standard'
          ? `${import.meta.env.VITE_SERVERLESS_API_URL}/create-standard-onboarding`
          : `${import.meta.env.VITE_SERVERLESS_API_URL}/create-onboarding-link`;

      const payload = type === 'standard' ? { email } : { type };

      const response = await axios.post(endpoint, payload);

      if (!response.data?.url) {
        throw new Error('Failed to create onboarding link');
      }

      window.location.href = response.data.url;
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = (type: OnboardingType) => {
    const contents = {
      express: {
        title: 'Express Onboarding',
        description: 'Quick and simple setup with pre-configured settings.',
        buttonText: 'Start Express Onboarding'
      },
      standard: {
        title: 'Standard Connect',
        description: 'Full-featured onboarding with customizable options.',
        buttonText: 'Start Standard Onboarding'
      },
      custom: {
        title: 'Custom Integration',
        description: 'Advanced setup with complete control over the integration.',
        buttonText: 'Start Custom Onboarding'
      }
    };

    const content = contents[type];

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">{content.title}</h2>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
            <svg
              className="h-5 w-5 text-primary dark:text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </span>
        </div>

        <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-6">
          {content.description}
        </p>

        {type === 'standard' && (
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 rounded bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 dark:border-destructive/30 text-destructive dark:text-destructive/90 text-sm"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleOnboard(type)}
          disabled={loading}
          className={`
            w-full py-2.5 px-4 rounded-lg
            text-sm font-medium
            transition-all duration-200
            bg-primary hover:bg-primary/90 text-primary-foreground
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-card
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing
            </span>
          ) : (
            content.buttonText
          )}
        </motion.button>
      </div>
    );
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading title="Dashboard" description="Welcome to the Dashboard" />
        </Toolbar>

        <div className="py-6 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="col-span-1 bg-card dark:bg-card text-card-foreground dark:text-card-foreground rounded-lg shadow-sm border border-border"
            >
              <div className="border-b border-border">
                <nav className="flex">
                  {(['express', 'standard', 'custom'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`
                        flex-1 px-4 py-2 text-sm font-medium text-center
                        ${
                          activeTab === tab
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }
                      `}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
              {renderTabContent(activeTab)}
            </motion.div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { Demo1LightSidebarPage };
