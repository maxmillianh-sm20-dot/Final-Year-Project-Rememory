import React, { useState } from 'react';

interface InspirationalEnvelopeProps {
    personaName?: string;
    userPurpose?: string;
}

// Collection of inspirational messages based on different purposes
const INSPIRATIONAL_MESSAGES = {
    grief: [
        "There is no such thing as an ending, just a new beginning of life.",
        "Grief is love with nowhere to go. But love never truly ends—it transforms, it grows within you, and it becomes part of who you are.",
        "The pain you feel is a testament to the love you shared. Carry that love forward, and let it guide you toward healing.",
        "Endings are not failures. They are completions. And every completion makes room for new growth.",
    ],
    closure: [
        "Closure isn't about forgetting. It's about finding peace with what was and hope for what's to come.",
        "You've honored your feelings, faced your pain, and taken steps toward healing. That takes immense courage.",
        "The words you never got to say have now been spoken. May they bring you the peace you deserve.",
    ],
    remembrance: [
        "Memory is a way of holding onto the things you love, the things you are, the things you never want to lose.",
        "Those we love don't go away, they walk beside us every day. Unseen, unheard, but always near, still loved, still missed, and very dear.",
        "What we once enjoyed and deeply loved we can never lose, for all that we love deeply becomes part of us.",
    ],
    healing: [
        "Healing doesn't mean the damage never existed. It means the damage no longer controls your life.",
        "You are not broken. You are breaking through. And on the other side of this pain is a version of you that is stronger, wiser, and more compassionate.",
        "Take your time. Healing is not linear. Some days will be harder than others, and that's okay. You're doing better than you think.",
    ],
    default: [
        "There is no such thing as an ending, just a new beginning of life.",
        "You've taken a brave step in your healing journey. Continue forward with compassion for yourself.",
        "The love and memories you carry will always be a part of you. Let them guide you toward peace and new beginnings.",
    ],
};

const getMessageForPurpose = (purpose?: string): string => {
    if (!purpose) return INSPIRATIONAL_MESSAGES.default[0];

    const lowerPurpose = purpose.toLowerCase();

    if (lowerPurpose.includes('grief') || lowerPurpose.includes('relieve')) {
        const messages = INSPIRATIONAL_MESSAGES.grief;
        return messages[Math.floor(Math.random() * messages.length)];
    }
    if (lowerPurpose.includes('closure') || lowerPurpose.includes('last words')) {
        const messages = INSPIRATIONAL_MESSAGES.closure;
        return messages[Math.floor(Math.random() * messages.length)];
    }
    if (lowerPurpose.includes('remember') || lowerPurpose.includes('honor')) {
        const messages = INSPIRATIONAL_MESSAGES.remembrance;
        return messages[Math.floor(Math.random() * messages.length)];
    }
    if (lowerPurpose.includes('express') || lowerPurpose.includes('unresolved')) {
        const messages = INSPIRATIONAL_MESSAGES.healing;
        return messages[Math.floor(Math.random() * messages.length)];
    }

    const messages = INSPIRATIONAL_MESSAGES.default;
    return messages[Math.floor(Math.random() * messages.length)];
};

export const InspirationalEnvelope: React.FC<InspirationalEnvelopeProps> = ({
    personaName = 'your loved one',
    userPurpose
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const message = getMessageForPurpose(userPurpose);

    return (
        <div className="w-full max-w-2xl mx-auto my-12">
            {!isOpen ? (
                // Closed Envelope
                <div
                    onClick={() => setIsOpen(true)}
                    className="relative cursor-pointer group"
                >
                    {/* Envelope Body */}
                    <div className="relative w-full aspect-[1.6/1] bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 rounded-lg shadow-2xl border border-rose-200/50 overflow-hidden transition-all duration-500 group-hover:shadow-3xl group-hover:scale-[1.02]">
                        {/* Envelope Flap Shadow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-rose-200/30 to-transparent h-1/2" />

                        {/* Decorative Seal */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full shadow-lg flex items-center justify-center border-4 border-white">
                            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>

                        {/* Text on Envelope */}
                        <div className="absolute bottom-8 left-0 right-0 text-center">
                            <p className="text-rose-700 font-serif text-lg italic px-8">
                                A message for you
                            </p>
                        </div>

                        {/* Hover Instruction */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                                <p className="text-xs text-stone-600 font-medium">Click to open</p>
                            </div>
                        </div>
                    </div>

                    {/* Envelope Flap (Top Triangle) */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden pointer-events-none">
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-200 origin-top transition-transform duration-500 group-hover:-translate-y-1"
                            style={{
                                clipPath: 'polygon(0 0, 50% 50%, 100% 0)',
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-rose-300/20 to-transparent" />
                        </div>
                    </div>
                </div>
            ) : (
                // Opened Envelope with Letter
                <div className="animate-fade-in relative">
                    {/* Opened Envelope (Background) */}
                    <div className="relative z-0 mt-48 w-[110%] -ml-[5%] aspect-[1.3/1] bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 rounded-lg shadow-xl border border-rose-200/50">
                        {/* Opened Flap */}
                        <div
                            className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden"
                            style={{
                                clipPath: 'polygon(0 0, 50% 50%, 100% 0)',
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-pink-300 transform -rotate-180 origin-center" />
                        </div>
                    </div>

                    {/* Letter Content */}
                    <div className="relative z-50 -mt-[30rem] mx-auto w-[85%] bg-white rounded-2xl shadow-2xl border border-stone-200 p-8 md:p-12 animate-slide-up">
                        {/* Decorative Header */}
                        <div className="flex justify-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="text-center space-y-6">
                            <h3 className="text-2xl md:text-3xl font-serif text-stone-800 leading-relaxed">
                                {message}
                            </h3>

                            <div className="pt-6 border-t border-stone-200">
                                <p className="text-stone-600 font-light leading-relaxed">
                                    Your journey with {personaName} has been one of courage, love, and healing.
                                    As you move forward, carry these memories with grace and know that you have honored
                                    your feelings in the most beautiful way.
                                </p>
                            </div>

                            <div className="pt-6">
                                <p className="text-sm text-stone-500 italic">
                                    — With compassion, Rememory
                                </p>
                            </div>
                        </div>

                        {/* Decorative Footer */}
                        <div className="mt-8 flex justify-center gap-2">
                            <div className="w-2 h-2 bg-stone-300 rounded-full"></div>
                            <div className="w-2 h-2 bg-stone-300 rounded-full"></div>
                            <div className="w-2 h-2 bg-stone-300 rounded-full"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
