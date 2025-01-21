// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import axios from 'axios';
// import { toast } from 'sonner';

// interface OnboardingFormData {
//   email?: string;
//   business_profile?: {
//     name?: string;
//     url?: string;
//     support_email?: string;
//     support_phone?: string;
//   };
//   settings?: {
//     statement_descriptor?: string;
//     payout_schedule?: 'manual' | 'daily' | 'weekly' | 'monthly';
//   };
// }

// const payoutScheduleOptions = [
//   { value: 'manual', label: 'Manual' },
//   { value: 'daily', label: 'Daily' },
//   { value: 'weekly', label: 'Weekly' },
//   { value: 'monthly', label: 'Monthly' }
// ];

// const ExpressOnboarding = () => {
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState<OnboardingFormData>({
//     business_profile: {},
//     settings: {
//       payout_schedule: 'manual',
//       statement_descriptor: 'INTELEBEE PAY'
//     }
//   });

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     if (name.includes('.')) {
//       const [section, field] = name.split('.');
//       setFormData((prev) => ({
//         ...prev,
//         [section]: {
//           ...(prev[section as keyof OnboardingFormData] || {}),
//           [field]: value
//         }
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_SERVERLESS_API_URL}/create-onboarding-link`,
//         formData
//       );

//       console.log(response.data);

//       if (response.data?.url) {
//         window.location.href = response.data.url;
//       } else {
//         throw new Error('No onboarding URL received');
//       }
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : 'Failed to create onboarding link');
//       console.error('Onboarding error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="max-w-2xl mx-auto p-6"
//     >
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//           Stripe Express Onboarding
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email || ''}
//                 onChange={handleInputChange}
//                 className="input w-full"
//                 placeholder="business@example.com"
//               />
//             </div>

//             <div className="space-y-4">
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                 Business Profile
//               </h2>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Business Name
//                 </label>
//                 <input
//                   type="text"
//                   name="business_profile.name"
//                   value={formData.business_profile?.name || ''}
//                   onChange={handleInputChange}
//                   className="input w-full"
//                   placeholder="Your Business Name"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Website URL
//                 </label>
//                 <input
//                   type="url"
//                   name="business_profile.url"
//                   value={formData.business_profile?.url || ''}
//                   onChange={handleInputChange}
//                   className="input w-full"
//                   placeholder="https://yourbusiness.com"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Support Email
//                 </label>
//                 <input
//                   type="email"
//                   name="business_profile.support_email"
//                   value={formData.business_profile?.support_email || ''}
//                   onChange={handleInputChange}
//                   className="input w-full"
//                   placeholder="support@yourbusiness.com"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Support Phone
//                 </label>
//                 <input
//                   type="tel"
//                   name="business_profile.support_phone"
//                   value={formData.business_profile?.support_phone || ''}
//                   onChange={handleInputChange}
//                   className="input w-full"
//                   placeholder="+1234567890"
//                 />
//               </div>
//             </div>

//             <div className="space-y-4">
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Statement Descriptor
//                 </label>
//                 <input
//                   type="text"
//                   name="settings.statement_descriptor"
//                   value={formData.settings?.statement_descriptor || ''}
//                   onChange={handleInputChange}
//                   className="input w-full"
//                   placeholder="INTELEBEE PAY"
//                   maxLength={22}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Payout Schedule
//                 </label>
//                 <select
//                   name="settings.payout_schedule"
//                   value={formData.settings?.payout_schedule || 'manual'}
//                   onChange={handleInputChange}
//                   className="select w-full"
//                 >
//                   {payoutScheduleOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           <motion.button
//             type="submit"
//             disabled={loading}
//             className="btn btn-primary w-full"
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//           >
//             {loading ? (
//               <div className="flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
//                 Processing...
//               </div>
//             ) : (
//               'Start Onboarding'
//             )}
//           </motion.button>
//         </form>
//       </div>
//     </motion.div>
//   );
// };

// export default ExpressOnboarding;
