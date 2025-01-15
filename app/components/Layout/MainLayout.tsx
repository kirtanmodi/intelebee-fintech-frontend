"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed w-full top-0 z-50 backdrop-blur-lg bg-gray-900/50 border-b border-gray-800"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
              >
                Intelebee LLC.
              </motion.div>
            </Link>

            <div className="hidden md:flex space-x-6">
              {/* <NavLink href="/dashboard">Dashboard</NavLink> */}
              <NavLink href="/accounts">Accounts</NavLink>
              {/* <NavLink href="/onboard">Onboard</NavLink> */}
              {/* <NavLink href="/settings">Settings</NavLink> */}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
              <BellIcon />
            </motion.button> */}
            {/* <motion.div whileHover={{ scale: 1.05 }} className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" /> */}
          </div>
        </nav>
      </motion.header>

      <main className="pt-16 min-h-screen">{children}</main>

      <footer className="bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-4">About</h3>
              <p className="text-gray-400 text-sm">Professional platform for modern businesses.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/help" className="text-gray-400 hover:text-gray-300 text-sm transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-400 hover:text-gray-300 text-sm transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/privacy" className="text-gray-400 hover:text-gray-300 text-sm transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-gray-400 hover:text-gray-300 text-sm transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Intelebee LLC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <motion.a href={href} whileHover={{ scale: 1.05 }} className="text-gray-300 hover:text-white transition-colors">
      {children}
    </motion.a>
  );
}

// function BellIcon() {
//   return (
//     <svg className="h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={2}
//         d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//       />
//     </svg>
//   );
// }
