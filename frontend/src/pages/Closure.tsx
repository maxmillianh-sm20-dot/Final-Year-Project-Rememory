import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { RememoryLogo } from '../components/RememoryLogo';
import { InspirationalEnvelope } from '../components/InspirationalEnvelope';
import { AppRoute } from '../types';
import { closePersona, resetSession } from '../services/apiService';
import { auth } from '../services/firebaseService';

const QUESTIONS = [
  {
    id: 'q1',
    text: 'What is one memory of your loved one that still brings meaning to you today?',
  },
  {
    id: 'q2',
    text: 'Is there something you never had the chance to say, but would like to express now?',
  },
  {
    id: 'q3',
    text: 'What have you learned about yourself during these past 30 days of reflection?',
  },
  {
    id: 'q4',
    text: 'What feelings are you choosing to carry forward as you continue healing?',
  },
];

export const Closure = () => {
  const { state, navigate, reloadPersona } = useApp();
  const [step, setStep] = useState(0); // 0: Intro, 1: Letter, 2: Complete
  const [letterContent, setLetterContent] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If persona is already completed, show completion screen immediately
  React.useEffect(() => {
    if (state.persona?.status === 'completed' && step !== 2) {
      setStep(2);
    }
  }, [state.persona?.status]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!state.persona?.id) {
        console.error('No persona found');
        return;
      }
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        console.error('No auth token found');
        return;
      }

      // Send as 'farewell' answer
      await closePersona(state.persona.id, { farewell: letterContent }, token);
      if (reloadPersona) await reloadPersona();

      setStep(2); // Go to completion page
      setShowConfirm(false);
    } catch (error) {
      console.error('Closure submission failed:', error);
      setIsSubmitting(false);
    }
  };

  const handleReturnHome = () => {
    navigate(AppRoute.LANDING);
  };

  // --- RENDERERS ---

  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 pb-32 text-center bg-[#FDFCFB]">
        <div className="absolute top-0 left-0 w-full p-6">
          <RememoryLogo size="sm" />
        </div>

        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-8 shadow-sm">
          <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
        </div>

        <h2 className="text-4xl font-serif text-stone-800 mb-6">Your Closure Is Complete</h2>
        <p className="text-stone-600 mb-8 leading-relaxed max-w-md mx-auto font-light text-lg">
          Thank you for honoring your emotions and taking this courageous final step.
        </p>

        {/* Inspirational Envelope */}
        <div className="w-full max-w-2xl mx-auto mb-12">
          <InspirationalEnvelope 
            personaName={state.persona?.name} 
            userPurpose={state.persona?.purpose} 
          />
        </div>

        <div className="relative z-[60] mt-12 flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => navigate(AppRoute.SETUP)}
            className="w-full px-8 py-4 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Begin a New Journey
          </button>
          
          <button
            onClick={() => {
              alert("Your journey is preserved. You can safely close the app or log out, and return here anytime.");
            }}
            className="w-full px-8 py-4 rounded-full bg-transparent border border-stone-300 text-stone-500 font-medium hover:bg-stone-50 transition-all"
          >
            Rest Here
          </button>
          
          <p className="text-xs text-stone-400 mt-4 max-w-xs mx-auto leading-relaxed">
            "Rest Here" will keep this account in a completed state. You can return anytime to read your letter, or start a new journey when you are ready.
          </p>
        </div>

        {/* DEV ONLY: Reset Button */}
        <button
          onClick={async () => {
            if (!state.persona?.id || !auth.currentUser) return;
            const token = await auth.currentUser.getIdToken();
            await resetSession(state.persona.id, token);
            if (reloadPersona) await reloadPersona(true);
            navigate(AppRoute.DASHBOARD);
          }}
          className="mt-8 text-xs text-stone-400 hover:text-stone-600 underline"
        >
          [DEV] Reset Simulation
        </button>
      </div>
    );
  }

  // Intro Step
  if (step === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden bg-[#FDFCFB]">
        <div className="absolute top-6 left-6 z-10">
          <RememoryLogo size="sm" />
        </div>

        {/* Background Elements */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-amber-50/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="mb-8 inline-block p-4 rounded-full bg-stone-50 border border-stone-100 shadow-sm">
            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif text-stone-800 mb-6 leading-tight">
            Your Journey With {state.persona?.name || 'This Persona'} <br /> Has Come to a Close
          </h1>
          <p className="text-lg text-stone-500 font-light mb-12 max-w-lg mx-auto">
            This is your moment to say goodbye in your own words.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] border border-white shadow-xl text-center max-w-3xl w-full">
          <p className="text-xl text-stone-700 leading-relaxed font-serif italic mb-8">
            "You've shared memories, thoughts, and feelings that mattered. Now, we invite you to write one final letter."
          </p>
          <p className="text-stone-600 leading-relaxed mb-10 max-w-xl mx-auto">
            It's normal to feel sadness, gratitude, or uncertainty. This letter is a space for you to express what remains—to say the things you still need to say, and then let them go.
          </p>

          <button
            onClick={() => setStep(1)}
            className="px-12 py-4 rounded-full bg-stone-900 text-white text-lg font-medium hover:bg-stone-800 transition-all shadow-lg hover:scale-105 hover:-translate-y-1"
          >
            Write Final Letter
          </button>
        </div>
      </div>
    );
  }

  // Letter Step
  return (
    <div className="min-h-screen flex flex-col p-6 md:p-12 max-w-4xl mx-auto relative bg-[#FDFCFB]">
      <div className="absolute top-6 left-6">
        <RememoryLogo size="sm" />
      </div>

      <div className="flex-1 flex flex-col justify-center pt-20 pb-10">
        <div className="mb-8 text-center">
          <span className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-3 block">
            Final Farewell
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-stone-800 leading-tight mb-4">
            A Letter to {state.persona?.name || 'Your Loved One'}
          </h2>
          
          <div className="max-w-2xl mx-auto bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-sm text-amber-900/70 leading-relaxed">
            <p className="font-medium mb-1">Please consider this letter as your final words.</p>
            <p>
              This content will not be sent to the Companion. It is a symbolic act of release—like writing a letter and burning it—allowing your words to disappear as you let go.
            </p>
          </div>
        </div>

        {/* Letter UI */}
        <div className="bg-[#fffdf9] p-8 md:p-12 rounded-xl shadow-sm border border-stone-200 relative mx-auto w-full max-w-3xl">
          {/* Paper Texture/Lines Effect */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5" 
               style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 2rem', marginTop: '3rem' }}>
          </div>

          <div className="relative z-10 font-serif text-lg text-stone-800">
            <div className="mb-6 text-stone-500">
              {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            
            <div className="mb-4">
              Dear {state.persona?.name || '...'},
            </div>

            <textarea
              className="w-full bg-transparent border-none p-0 text-lg text-stone-800 focus:ring-0 outline-none resize-none leading-8 min-h-[300px] placeholder-stone-300"
              placeholder="Write your message here..."
              value={letterContent}
              onChange={(e) => setLetterContent(e.target.value)}
              autoFocus
              spellCheck={false}
            />

            <div className="mt-8 text-right">
              <p className="mb-2">Sincerely,</p>
              <p className="font-medium">{state.persona?.userNickname || 'Me'}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!letterContent.trim()}
            className="px-12 py-4 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
          >
            Seal & Release Letter
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] max-w-lg w-full shadow-2xl transform scale-100 transition-all">
            <h3 className="text-2xl font-serif text-stone-800 mb-4">Are you ready to let go?</h3>
            <p className="text-stone-600 mb-8 leading-relaxed">
              Once you submit this letter, the session will end. You will no longer be able to chat with this persona.
              <br/><br/>
              This is a brave step. Take it when you are ready.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-all shadow-md"
              >
                {isSubmitting ? 'Releasing...' : 'Yes, Release Letter'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-transparent text-stone-500 hover:bg-stone-50 transition-all"
              >
                Not yet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
