import React from 'react';

export const Disclaimer = () => {
    return (
        <div className="w-full bg-amber-50/30 border-t border-amber-100/50 mt-auto">
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-3">
                <div className="flex items-start gap-2">
                    <svg
                        className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                    </svg>
                    <p className="text-amber-800 text-xs leading-relaxed">
                        <strong className="font-semibold">Important:</strong> Rememory is here to support you through grief, but it isn't a real person. If you're feeling unsafe, overwhelmed, or need urgent help, please reach out to your local emergency hotline or a licensed mental health professional.
                    </p>
                </div>
            </div>
        </div>
    );
};
