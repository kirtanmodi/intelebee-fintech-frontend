import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

type IntegrationType = 'express' | 'standard' | 'custom' | 'connected';

interface IntegrationCard {
  id: IntegrationType;
  title: string;
  description: string;
  path: string;
  icon: JSX.Element;
}

const Demo1LightSidebarPage = () => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState<IntegrationType | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const integrationCards: IntegrationCard[] = [
    // {
    //   id: 'express',
    //   title: 'Stripe Express',
    //   description: 'Quick and simple setup with pre-configured settings for rapid integration.',
    //   path: '/stripe-express/onboarding',
    //   icon: (
    //     <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M13 10V3L4 14h7v7l9-11h-7z"
    //       />
    //     </svg>
    //   )
    // },
    {
      id: 'standard',
      title: 'Stripe Standard',
      description: 'Full-featured integration with customizable options and advanced features.',
      path: '/stripe-standard/onboarding',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
          />
        </svg>
      )
    },
    // {
    //   id: 'custom',
    //   title: 'Stripe Custom',
    //   description: 'Advanced setup with complete control over the integration process.',
    //   path: '/stripe-custom',
    //   icon: (
    //     <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
    //       />
    //     </svg>
    //   )
    // },
    {
      id: 'connected',
      title: 'Connected Accounts',
      description: 'Manage and monitor all your connected Stripe accounts in one place.',
      path: '/connected-accounts',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      )
    }
  ];

  const handleCardClick = async (card: IntegrationCard) => {
    try {
      setActiveCard(card.id);
      setIsNavigating(true);
      await new Promise((resolve) => setTimeout(resolve, 400)); // Animation delay
      navigate(card.path);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsNavigating(false);
      setActiveCard(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Integration Dashboard"
            description="Choose your preferred Stripe integration method"
          />
        </Toolbar>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
        >
          {integrationCards.map((card) => (
            <motion.div
              key={card.id}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(card)}
              className={`
                relative overflow-hidden
                p-6 rounded-xl cursor-pointer
                bg-card dark:bg-card/80
                border border-border hover:border-primary/50
                transition-colors duration-300
                ${isNavigating ? 'pointer-events-none' : ''}
                ${activeCard === card.id ? 'ring-2 ring-primary' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">{card.icon}</div>
                <motion.div whileHover={{ rotate: 15 }} className="text-primary">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </motion.div>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-foreground">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.description}</p>

              {activeCard === card.id && (
                <motion.div
                  layoutId="highlight"
                  className="absolute inset-0 bg-primary/5 dark:bg-primary/10"
                  initial={false}
                  transition={{
                    type: 'spring',
                    bounce: 0.2,
                    duration: 0.6
                  }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Fragment>
  );
};

export { Demo1LightSidebarPage };
