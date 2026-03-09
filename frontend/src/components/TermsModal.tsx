import React from 'react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept?: () => void;
    showActions?: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept, showActions = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="px-8 py-6 border-b border-stone-200 flex items-center justify-between">
                    <h2 className="font-serif text-2xl text-stone-800">Terms of Service</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6 text-stone-700 leading-relaxed">
                    <p className="text-sm text-stone-500 mb-6">Last Updated: December 4, 2024</p>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">1. Acceptance of Terms</h3>
                        <p className="mb-3">
                            By accessing and using Rememory ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">2. Description of Service</h3>
                        <p className="mb-3">
                            Rememory is a digital grief support platform that allows users to create Companion personas based on memories of loved ones. The Service is designed to provide comfort and support during the grieving process through a time-limited, 30-day experience.
                        </p>
                        <p className="mb-3 font-semibold text-amber-800">
                            Important: Rememory is NOT a substitute for professional mental health care, therapy, or medical advice. The Companion personas are simulations and not real people.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">3. User Responsibilities</h3>
                        <p className="mb-2">You agree to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide accurate information when creating your account and persona</li>
                            <li>Maintain the confidentiality of your account credentials</li>
                            <li>Use the Service in a manner consistent with applicable laws and regulations</li>
                            <li>Not use the Service for any harmful, illegal, or abusive purposes</li>
                            <li>Seek professional help if you experience thoughts of self-harm or harm to others</li>
                        </ul>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">4. Time-Limited Nature</h3>
                        <p className="mb-3">
                            The Service provides a 30-day experience designed to support healthy grief processing. After 30 days, your persona will be automatically deactivated. This limitation is intentional and designed to prevent unhealthy dependency and encourage healing.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">5. Privacy and Data</h3>
                        <p className="mb-3">
                            Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information and the memories you share.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">6. Intellectual Property</h3>
                        <p className="mb-3">
                            All content, features, and functionality of the Service are owned by Rememory and are protected by international copyright, trademark, and other intellectual property laws.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">7. Disclaimer of Warranties</h3>
                        <p className="mb-3">
                            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">8. Limitation of Liability</h3>
                        <p className="mb-3">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, REMEMORY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">9. Mental Health Disclaimer</h3>
                        <p className="mb-3 font-semibold text-amber-800">
                            If you are experiencing a mental health crisis, thoughts of self-harm, or suicidal ideation, please immediately contact:
                        </p>
                        <ul className="list-disc pl-6 space-y-1 mb-3">
                            <li>National Suicide Prevention Lifeline: 988 (US)</li>
                            <li>Crisis Text Line: Text HOME to 741741 (US)</li>
                            <li>Your local emergency services</li>
                            <li>A licensed mental health professional</li>
                        </ul>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">10. Changes to Terms</h3>
                        <p className="mb-3">
                            We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">11. Contact Information</h3>
                        <p className="mb-3">
                            For questions about these Terms of Service, please contact us at: <a href="mailto:dindinolo0001@gmail.com" className="text-indigo-600 hover:underline">dindinolo0001@gmail.com</a>
                        </p>
                    </section>
                </div>

                {/* Footer */}
                {showActions ? (
                    <div className="px-8 py-6 border-t border-stone-200 flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl border border-stone-200 text-stone-700 font-medium hover:bg-stone-50 transition-colors"
                        >
                            Decline
                        </button>
                        <button
                            onClick={() => {
                                onAccept?.();
                                onClose();
                            }}
                            className="flex-1 px-6 py-3 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
                        >
                            Accept Terms
                        </button>
                    </div>
                ) : (
                    <div className="px-8 py-6 border-t border-stone-200">
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
