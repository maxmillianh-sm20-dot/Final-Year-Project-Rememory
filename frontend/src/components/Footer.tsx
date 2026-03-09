import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { AppRoute } from '../types';
import { TermsModal } from './TermsModal';
import { PrivacyModal } from './PrivacyModal';

export const Footer = () => {
  const { navigate } = useApp();
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <footer className="w-full bg-white/80 backdrop-blur-lg border-t border-stone-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Section */}
          <div>
            <h3 className="font-serif font-bold text-stone-800 mb-4 text-lg">Company</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate(AppRoute.LANDING)}
                  className="text-stone-600 hover:text-stone-900 text-sm transition-colors text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <a href="#" className="text-stone-600 hover:text-stone-900 text-sm transition-colors">
                  Foundation
                </a>
              </li>
              <li>
                <a href="#" className="text-stone-600 hover:text-stone-900 text-sm transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Terms & Policies Section */}
          <div>
            <h3 className="font-serif font-bold text-stone-800 mb-4 text-lg">Terms & Policies</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setShowTerms(true)}
                  className="text-stone-600 hover:text-stone-900 text-sm transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowPrivacy(true)}
                  className="text-stone-600 hover:text-stone-900 text-sm transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="font-serif font-bold text-stone-800 mb-4 text-lg">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@rememory.app" className="text-stone-600 hover:text-stone-900 text-sm transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-stone-600 hover:text-stone-900 text-sm transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="font-serif font-bold text-stone-800 mb-4 text-lg">Connect</h3>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/rememory"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5 text-stone-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/rememory"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-stone-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/rememory"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5 text-stone-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-stone-200 text-center">
          <p className="text-stone-500 text-sm">
            © {new Date().getFullYear()} Rememory. All rights reserved.
          </p>
          <p className="text-stone-400 text-xs mt-2">
            A gentle space for remembrance and healing.
          </p>
        </div>
      </div>

      {/* Modals */}
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </footer>
  );
};

