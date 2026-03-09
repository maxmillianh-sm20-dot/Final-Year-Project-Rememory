import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { AppRoute, TOTAL_DAYS } from '../types';
import { RememoryLogo } from '../components/RememoryLogo';
import { auth } from '../services/firebaseService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const Dashboard = () => {
  const { state, daysRemaining, navigate, reloadPersona } = useApp();
  const [mood, setMood] = useState<string | null>(null);
  const [devLoading, setDevLoading] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  // Redirect to Closure if completed
  React.useEffect(() => {
    if (state.persona?.status === 'completed') {
      navigate(AppRoute.CLOSURE);
    }
  }, [state.persona?.status, navigate]);

  const progress = daysRemaining / TOTAL_DAYS;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - progress * circumference;

  const handleReset = async () => {
    if (!state.persona || !auth.currentUser) return;
    setDevLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`${API_BASE_URL}/persona/${state.persona.id}/reset-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (reloadPersona) await reloadPersona(true);
    } catch (error) {
      console.error('Reset failed:', error);
    } finally {
      setDevLoading(false);
    }
  };

  const handleAdvance = async () => {
    if (!state.persona || !auth.currentUser) return;
    setDevLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`${API_BASE_URL}/persona/${state.persona.id}/advance-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (reloadPersona) await reloadPersona(true);
    } catch (error) {
      console.error('Advance failed:', error);
    } finally {
      setDevLoading(false);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getPhaseContent = () => {
    if (daysRemaining > 15) {
      return {
        name: 'Warmth & Connection',
        starters: [
          'Tell me about your favorite childhood memory.',
          'What was the happiest day of your life?',
          'I miss your laugh. Tell me a joke.',
          'Remember that trip we took?'
        ]
      };
    } else if (daysRemaining > 5) {
      return {
        name: 'Depth & Reflection',
        starters: [
          'I\'ve been struggling with something...',
          'Is there anything you regret?',
          'I wish I had told you...',
          'How do I handle this feeling of emptiness?'
        ]
      };
    } else {
      return {
        name: 'Closure & Acceptance',
        starters: [
          'I don\'t know if I\'m ready to let go.',
          'What do you want for my future?',
          'I\'m scared to move on without you.',
          'Thank you for everything.'
        ]
      };
    }
  };

  const phaseContent = getPhaseContent();

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto animate-fade-in pb-12 relative">
      {/* DEV TOOLS - Absolute Positioned */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setShowDevTools(!showDevTools)}
          className="p-2 text-stone-300 hover:text-stone-500 transition-colors rounded-full hover:bg-stone-100"
          title="Developer Tools"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </button>
        
        {showDevTools && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-100 p-4 animate-fade-in z-50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Dev Controls</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleReset}
                disabled={devLoading}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-50 text-left"
              >
                Reset to Day 30
              </button>
              <button
                onClick={handleAdvance}
                disabled={devLoading}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-50 text-left"
              >
                Advance 5 Days
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Header with Logo */}
      <div className="mb-6">
        <RememoryLogo />
      </div>
      
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-stone-800 mb-2">
            {greeting()},{' '}
            <span className="italic text-stone-500 font-serif">Friend</span>
          </h1>
          <p className="text-stone-500 font-light text-lg">
            Your sanctuary for remembering {state.persona?.name || 'your loved one'}.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-sm font-semibold uppercase tracking-widest text-stone-400">Current Phase</div>
          <div className="text-xl font-serif text-indigo-500">{phaseContent.name}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
        <div className="glass-panel rounded-[2.5rem] p-8 md:col-span-2 md:row-span-2 relative overflow-hidden flex flex-col md:flex-row items-center justify-center gap-10 shadow-sm group hover:shadow-md transition-all bg-white/60">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-indigo-200/20 blur-3xl rounded-full animate-pulse-slow"></div>
            <svg className="w-64 h-64 transform -rotate-90 drop-shadow-md relative z-10" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r="120" stroke="#F5F5F4" strokeWidth="8" fill="none" />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <span className="font-display text-7xl text-stone-800">{daysRemaining}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-stone-400 mt-2 font-medium">Days Left</span>
            </div>
          </div>

          <div className="text-center md:text-left max-w-xs z-10">
            <h3 className="font-serif text-3xl text-stone-800 mb-4">The Gift of Time</h3>
            <p className="text-stone-500 leading-relaxed font-light text-lg">
              Use these {daysRemaining} days to say what needs to be said. This boundary exists to help you heal, not to rush you.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(AppRoute.CHAT)}
          className="glass-panel rounded-[2.5rem] p-6 flex flex-col justify-between group hover:bg-white transition-all shadow-sm hover:shadow-lg hover:-translate-y-1 bg-white/40"
        >
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </div>
          <div>
            <span className="block text-lg font-serif text-stone-800 mb-1">
              Write to {(state.persona?.name || '').split(' ')[0] || 'them'}
            </span>
            <span className="text-sm text-stone-400 group-hover:text-indigo-400 transition-colors">Send a message &rarr;</span>
          </div>
        </button>

        <button
          onClick={() => navigate(AppRoute.VOICE)}
          className="glass-panel rounded-[2.5rem] p-6 flex flex-col justify-between group hover:bg-white transition-all shadow-sm hover:shadow-lg hover:-translate-y-1 bg-white/40"
        >
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </div>
          <div>
            <span className="block text-lg font-serif text-stone-800 mb-1">Speak Freely</span>
            <span className="text-sm text-stone-400 group-hover:text-rose-400 transition-colors">Start voice session &rarr;</span>
          </div>
        </button>

        <div className="glass-panel rounded-[2.5rem] p-8 md:col-span-2 bg-gradient-to-br from-white/60 to-indigo-50/30 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4">Conversation Spark</h4>
            <p className="text-stone-500 mb-6">Not sure what to say? Try starting with this:</p>
          </div>
          <div className="grid gap-3">
            {phaseContent.starters.slice(0, 2).map((starter, i) => (
              <button
                key={i}
                className="w-full text-left p-4 rounded-xl bg-white/80 hover:bg-white border border-white hover:border-indigo-100 shadow-sm transition-all text-stone-700 italic"
                onClick={() => navigate(AppRoute.CHAT)}
              >
                "{starter}"
              </button>
            ))}
          </div>
        </div>

        {/* DEV TOOLS REMOVED FROM GRID */}

        <div className="glass-panel rounded-[2.5rem] p-8 md:col-span-2 bg-white/60">
          <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-6">How is your heart today?</h4>
          <div className="flex justify-between items-center gap-2">
            {['Heavy', 'Reflective', 'Okay', 'Peaceful'].map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`flex-1 py-4 rounded-2xl text-sm font-medium transition-all ${
                  mood === m ? 'bg-stone-800 text-white shadow-lg scale-105' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {mood && (
            <div className="mt-6 p-4 bg-stone-50 rounded-xl text-stone-600 text-sm animate-fade-in">
              Thank you for checking in. It's okay to feel {mood.toLowerCase()}. Be gentle with yourself today.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
