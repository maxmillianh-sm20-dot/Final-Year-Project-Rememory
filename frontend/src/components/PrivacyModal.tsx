import React from 'react';

interface PrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="px-8 py-6 border-b border-stone-200 flex items-center justify-between">
                    <h2 className="font-serif text-2xl text-stone-800">Privacy Policy</h2>
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
                        <h3 className="font-serif text-xl text-stone-800 mb-3">1. Introduction</h3>
                        <p className="mb-3">
                            Rememory ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our grief support service.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">2. Information We Collect</h3>

                        <h4 className="font-semibold text-stone-800 mb-2 mt-4">Personal Information</h4>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            <li>Email address and account credentials</li>
                            <li>Name (optional)</li>
                            <li>Profile information you choose to provide</li>
                        </ul>

                        <h4 className="font-semibold text-stone-800 mb-2">Persona Information</h4>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            <li>Information about your loved one (name, relationship, traits, memories)</li>
                            <li>Photos or images you upload</li>
                            <li>Voice samples (if provided)</li>
                        </ul>

                        <h4 className="font-semibold text-stone-800 mb-2">Usage Information</h4>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            <li>Chat messages and conversations with Companion personas</li>
                            <li>Login times and session data</li>
                            <li>Device information and IP address</li>
                            <li>Usage patterns and preferences</li>
                        </ul>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">3. How We Use Your Information</h3>
                        <p className="mb-2">We use your information to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide and maintain the Rememory service</li>
                            <li>Create and personalize Companion personas based on your input</li>
                            <li>Improve our service and user experience</li>
                            <li>Communicate with you about your account and service updates</li>
                            <li>Ensure the security and integrity of our platform</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">4. Data Storage and Security</h3>
                        <p className="mb-3">
                            We use industry-standard security measures to protect your data, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-3">
                            <li>Encryption of data in transit and at rest</li>
                            <li>Secure cloud storage via Firebase and Google Cloud Platform</li>
                            <li>Regular security audits and updates</li>
                            <li>Access controls and authentication measures</li>
                        </ul>
                        <p className="mb-3 text-amber-800 font-semibold">
                            However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">5. Data Sharing and Disclosure</h3>
                        <p className="mb-3">
                            We do NOT sell your personal information. We may share your information only in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Service Providers:</strong> Third-party services that help us operate (e.g., Firebase, Google Cloud, AI providers)</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                            <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information</li>
                        </ul>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">6. AI and Third-Party Services</h3>
                        <p className="mb-3">
                            We use AI services (such as Google's Gemini) to power persona interactions. Your conversations may be processed by these third-party AI providers. We anonymize data where possible and use these services in accordance with their privacy policies.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">7. Data Retention</h3>
                        <p className="mb-3">
                            We retain your data for as long as your account is active or as needed to provide services. After the 30-day persona period ends, persona data is archived but not immediately deleted. You can request deletion of your data at any time.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">8. Your Rights</h3>
                        <p className="mb-2">You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Export your data</li>
                            <li>Opt-out of certain data processing</li>
                            <li>Withdraw consent at any time</li>
                        </ul>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">9. Children's Privacy</h3>
                        <p className="mb-3">
                            Rememory is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">10. International Users</h3>
                        <p className="mb-3">
                            Your information may be transferred to and processed in countries other than your own. By using Rememory, you consent to such transfers.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">11. Changes to This Policy</h3>
                        <p className="mb-3">
                            We may update this Privacy Policy from time to time. We will notify you of any material changes via email or through the service.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-serif text-xl text-stone-800 mb-3">12. Contact Us</h3>
                        <p className="mb-3">
                            If you have questions about this Privacy Policy or our data practices, please contact us at:
                        </p>
                        <p className="mb-2">
                            Email: <a href="mailto:dindinolo0001@gmail.com" className="text-indigo-600 hover:underline">privacy@rememory.app</a>
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-stone-200">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
