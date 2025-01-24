import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schema
const phoneRegex = /^\d{10}$/;
const einRegex = /^\d{9}$/;
const routingRegex = /^\d{9}$/;
const accountRegex = /^\d{4,17}$/;

const merchantSchema = z.object({
  type: z.number().default(2),
  name: z.string().min(1, 'Company name is required'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().nullable(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'Please enter valid state code'),
  zip: z.string().min(5, 'Valid ZIP code required'),
  country: z.string().default('USA'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
  ein: z.string().regex(einRegex, 'Invalid EIN'),
  website: z.string().url('Invalid website URL'),
  tcVersion: z.string().default('1.0'),
  currency: z.string().default('USD'),
  accounts: z.array(
    z.object({
      primary: z.string().default('1'),
      currency: z.string().default('USD'),
      account: z.object({
        method: z.string().default('8'),
        number: z.string().regex(accountRegex, 'Invalid account number'),
        routing: z.string().regex(routingRegex, 'Invalid routing number')
      })
    })
  ),
  merchant: z.object({
    dba: z.string().nullable(),
    new: z.string().default('1'),
    mcc: z.string().default('1799'),
    status: z.string().default('1'),
    members: z.array(
      z.object({
        title: z.string().min(1, 'Title is required'),
        first: z.string().min(1, 'First name is required'),
        middle: z.string().nullable(),
        last: z.string().min(1, 'Last name is required'),
        // ssn: z.string().nullable(),
        dob: z.string().regex(/^\d{8}$/, 'Date format: YYYYMMDD'),
        dl: z.string().min(1, 'Driver license number required'),
        dlstate: z.string().length(2, 'Valid state code required'),
        ownership: z.number().min(0).max(10000),
        email: z.string().email('Invalid email address'),
        phone: z.string().regex(phoneRegex, 'Invalid phone number'),
        primary: z.string().default('1'),
        address1: z.string().min(1, 'Address is required'),
        address2: z.string().nullable(),
        city: z.string().min(1, 'City is required'),
        state: z.string().length(2, 'Valid state code required'),
        zip: z.string().min(5, 'Valid ZIP code required'),
        country: z.string().default('USA')
      })
    )
  })
});

// Add this function at the top level of the file, outside the component
const generateRandomData = () => {
  const randomNum = (length: number) =>
    Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  const randomDate = () => {
    const year = Math.floor(Math.random() * (2000 - 1960) + 1960);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  return {
    type: 2,
    name: `Sample Company ${randomNum(4)}`,
    address1: `${randomNum(4)} Business Street`,
    address2: Math.random() > 0.5 ? `Suite ${randomNum(3)}` : '',
    city: 'Frisco',
    state: 'TX',
    zip: `75${randomNum(3)}`,
    country: 'USA',
    phone: `855${randomNum(7)}`,
    email: `business${randomNum(4)}@example.com`,
    ein: randomNum(9),
    website: `https://example${randomNum(3)}.com`,
    tcVersion: '1.0',
    currency: 'USD',
    accounts: [
      {
        primary: '1',
        currency: 'USD',
        account: {
          method: '8',
          number: randomNum(10),
          routing: '021000021'
        }
      }
    ],
    merchant: {
      dba: '',
      new: '1',
      mcc: '1799',
      status: '1',
      members: [
        {
          title: 'CEO',
          first: 'John',
          middle: Math.random() > 0.5 ? 'Michael' : '',
          last: 'Smith',
          // ssn: '',
          dob: randomDate(),
          dl: `DL${randomNum(8)}`,
          dlstate: 'NY',
          ownership: 10000,
          email: `member${randomNum(4)}@example.com`,
          phone: `590${randomNum(7)}`,
          primary: '1',
          address1: `${randomNum(4)} Residential Ave`,
          address2: '',
          city: 'Rico',
          state: 'CO',
          zip: randomNum(5),
          country: 'USA'
        }
      ]
    }
  };
};

// Add this interface near the top of the file
interface PayrixResponse {
  data: {
    response: {
      data: [
        {
          id: string;
          name: string;
          merchant: {
            id: string;
            members: [
              {
                id: string;
                title: string;
                first: string;
                last: string;
                email: string;
              }
            ];
          };
          accounts: [
            {
              id: string;
              token: string;
              account: {
                number: string;
                routing: string;
              };
            }
          ];
        }
      ];
      errors: any[];
    };
  };
}

declare global {
  interface Window {
    PayFrame: {
      config: {
        apiKey: string;
        merchant: string;
        image: string;
        name: string;
        description: string;
        hideBillingAddress: boolean;
        amount: number;
        color: string;
        mode: string;
      };
      popup: () => void;
    };
  }
}

export {};

const PayrixOnboarding: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 2,
    name: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    phone: '',
    email: '',
    ein: '',
    website: '',
    tcVersion: '1.0',
    currency: 'USD',
    accounts: [
      {
        primary: '1',
        currency: 'USD',
        account: {
          method: '8',
          number: '',
          routing: ''
        }
      }
    ],
    merchant: {
      dba: '',
      new: '1',
      mcc: '1799',
      status: '1',
      members: [
        {
          title: '',
          first: '',
          middle: '',
          last: '',
          // ssn: '',
          dob: '',
          dl: '',
          dlstate: '',
          ownership: 10000,
          email: '',
          phone: '',
          primary: '1',
          address1: '',
          address2: '',
          city: '',
          state: '',
          zip: '',
          country: 'USA'
        }
      ]
    }
  });

  // Add this state
  const [successData, setSuccessData] = useState<
    PayrixResponse['data']['response']['data'][0] | null
  >(null);

  // Add state for amount
  const [amount, setAmount] = useState<number>(10000);

  useEffect(() => {
    // Load PayFrame script
    const script = document.createElement('script');
    script.src = 'https://test-api.payrix.com/payFrameScript';
    script.async = true;
    script.onload = () => {
      // Configure PayFrame after script loads
      const PayFrame = (window as any).PayFrame;
      PayFrame.config = {
        apiKey: '4523385f4af70adf260eadf0f6ea4e95',
        merchant: 't1_mer_67929642066fcb5dee2818b',
        image:
          'https://images.squarespace-cdn.com/content/v1/65bcce1aeef21c33179ebbe8/91823e55-20f2-41e5-83eb-74071343b672/Untitled_design__8_-removebg-preview.png',
        name: 'IntelebeeLLC',
        description: 'test description',
        hideBillingAddress: true,
        amount: amount,
        color: '64b5f6',
        mode: 'txn'
      };
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      merchantSchema.parse(formData);

      const response = await axios.post<PayrixResponse>(
        `${import.meta.env.VITE_PAYRIX_API_URL}/payrix/merchant`,
        formData
      );

      console.log(response);

      if (response.status === 200) {
        setSuccessData(response?.data?.data?.response?.data[0]);
        toast.success('Merchant account created successfully');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || 'Failed to create merchant account');
      }
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section?: string,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (section === 'accounts') {
      setFormData((prev) => ({
        ...prev,
        accounts: prev.accounts.map((acc, i) =>
          i === index ? { ...acc, account: { ...acc.account, [name]: value } } : acc
        )
      }));
    } else if (section === 'members') {
      setFormData((prev) => ({
        ...prev,
        merchant: {
          ...prev.merchant,
          members: prev.merchant.members.map((member, i) =>
            i === index ? { ...member, [name]: value } : member
          )
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Add this handler
  const handleFillSampleData = () => {
    setFormData(generateRandomData());
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseFloat(e.target.value) * 100;
    setAmount(newAmount);
    if (window.PayFrame) {
      window.PayFrame.config.amount = newAmount;
    }
  };

  const handlePayFramePopup = () => {
    if (window.PayFrame?.popup) {
      window.PayFrame.popup();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <motion.h1
        className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Payrix Onboarding
      </motion.h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Entity Company"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                EIN
              </label>
              <input
                type="text"
                name="ein"
                value={formData.ein}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address Line 1
              </label>
              <input
                type="text"
                name="address1"
                value={formData.address1}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="1234 River Lane"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                name="address2"
                value={formData.address2 || ''}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Suite 100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Frisco"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="TX"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="75034"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="8556729749"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="entity.email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Banking Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Banking Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Number
              </label>
              <input
                type="text"
                name="number"
                value={formData.accounts[0].account.number}
                onChange={(e) => handleInputChange(e, 'accounts', 0)}
                className="input w-full"
                placeholder="Account Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Routing Number
              </label>
              <input
                type="text"
                name="routing"
                value={formData.accounts[0].account.routing}
                onChange={(e) => handleInputChange(e, 'accounts', 0)}
                className="input w-full"
                placeholder="Routing Number"
              />
            </div>
          </div>
        </div>

        {/* Member Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Member Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.merchant.members[0].title}
                onChange={(e) => handleInputChange(e, 'members', 0)}
                className="input w-full"
                placeholder="CEO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first"
                value={formData.merchant.members[0].first}
                onChange={(e) => handleInputChange(e, 'members', 0)}
                className="input w-full"
                placeholder="First Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Middle Name (Optional)
              </label>
              <input
                type="text"
                name="middle"
                value={formData.merchant.members[0].middle || ''}
                onChange={(e) => handleInputChange(e, 'members', 0)}
                className="input w-full"
                placeholder="Middle Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last"
                value={formData.merchant.members[0].last}
                onChange={(e) => handleInputChange(e, 'members', 0)}
                className="input w-full"
                placeholder="Last Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Birth
              </label>
              <input
                type="text"
                name="dob"
                value={formData.merchant.members[0].dob}
                onChange={(e) => handleInputChange(e, 'members', 0)}
                className="input w-full"
                placeholder="YYYYMMDD"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Driver's License
              </label>
              <input
                type="text"
                name="dl"
                value={formData.merchant.members[0].dl}
                onChange={(e) => handleInputChange(e, 'members', 0)}
                className="input w-full"
                placeholder="Driver's License Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Driver's License State
              </label>
              <input
                type="text"
                name="dlstate"
                value={formData.merchant.members[0].dlstate}
                onChange={(e) => handleInputChange(e, 'members', 0)}
                className="input w-full"
                placeholder="NY"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ownership Percentage
              </label>
              <input
                type="number"
                name="ownership"
                value={formData.merchant.members[0].ownership}
                onChange={(e) => handleInputChange(e, 'members', 0)}
                className="input w-full"
                placeholder="10000"
                max="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Member Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.merchant.members[0].email}
                onChange={(e) => handleInputChange(e, 'members', 0)}
                className="input w-full"
                placeholder="member@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Member Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.merchant.members[0].phone}
                onChange={(e) => handleInputChange(e, 'members', 0)}
                className="input w-full"
                placeholder="5903324578"
              />
            </div>
          </div>
        </div>

        {/* Add this before the submit button */}
        <div className="flex gap-4">
          <motion.button
            type="button"
            onClick={handleFillSampleData}
            className="w-full py-3 px-4 bg-secondary text-gray-700 rounded-lg font-medium
              hover:bg-secondary-dark focus:ring-2 focus:ring-secondary focus:ring-offset-2
              transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Fill with Sample Data
          </motion.button>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium
              hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <span>Processing...</span>
              </div>
            ) : (
              'Submit Application'
            )}
          </motion.button>
        </div>
      </form>

      {/* Add this success modal */}
      {successData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSuccessData(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Merchant Account Created Successfully
              </h2>
              <button
                onClick={() => setSuccessData(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Entity Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Entity Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Entity ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{successData.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Business Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{successData.name}</p>
                  </div>
                </div>
              </div>

              {/* Merchant Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Merchant Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Merchant ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {successData.merchant.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Primary Contact</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {successData.merchant.members[0].first} {successData.merchant.members[0].last}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Account Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Account ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {successData.accounts[0].id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Account Token</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {successData.accounts[0].token}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setSuccessData(null)}
                  className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Add functionality to download JSON
                    const dataStr = JSON.stringify(successData, null, 2);
                    const blob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `merchant-${successData.id}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Download Details
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        style={{}}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-4 mt-4">
          <input
            type="number"
            placeholder="Amount"
            onChange={handleAmountChange}
            defaultValue={amount / 100}
            className="w-[300px] h-[30px] px-2 border border-gray-300 rounded"
          />
          <button
            onClick={handlePayFramePopup}
            className="w-[300px] h-[30px] bg-[#64b5f6] text-white cursor-pointer border-0"
          >
            Test Payment Frame
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PayrixOnboarding;
