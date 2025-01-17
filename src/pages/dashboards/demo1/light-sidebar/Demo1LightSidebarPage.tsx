import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Demo1LightSidebarPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOnboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVERLESS_API_URL}/create-onboarding-link`
      );

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

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading title="Dashboard" description="Welcome to the Dashboard" />
        </Toolbar>

        <div className="py-6 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Onboarding Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-card dark:bg-card text-card-foreground dark:text-card-foreground rounded-lg shadow-sm border border-border"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Merchant Setup</h2>
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
                  Complete your merchant verification and start accepting payments today.
                </p>

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
                  onClick={handleOnboard}
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
                    'Start Onboarding'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { Demo1LightSidebarPage };
