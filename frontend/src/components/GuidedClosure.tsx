import { useState } from 'react';

import { useAuth } from '@context/AuthContext';
import { apiClient } from '@services/apiService';

interface GuidedClosureProps {
  personaId: string;
  personaName: string;
  onComplete: () => void;
}

const REFLECTIVE_QUESTIONS = [
  "What is one memory you want to cherish most about them?",
  "Is there something you wanted to say that you didn't get to?",
  "What will you do to remember them going forward?",
  "What did they teach you that you'll carry with you?",
  "How do you want to honor their memory?",
  "What would they want you to remember about them?",
  "What moments together brought you the most joy?",
  "How has this conversation helped you process your grief?",
  "What support do you need going forward?",
  "What would you tell someone else who is grieving?",
  "What legacy did they leave behind?",
  "How will you keep their memory alive?"
];

export const GuidedClosure = ({ personaId, personaName, onComplete }: GuidedClosureProps) => {
  const { token } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finalMessage, setFinalMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const currentQuestion = REFLECTIVE_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === REFLECTIVE_QUESTIONS.length - 1;

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < REFLECTIVE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      // Send final message and closure data to backend
      await apiClient.post(
        `/persona/${personaId}/chat`,
        {
          text: `Final reflection: ${finalMessage}`,
          clientMessageId: crypto.randomUUID(),
          closureData: {
            answers,
            finalMessage,
            completedAt: new Date().toISOString()
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onComplete();
    } catch (error) {
      console.error('Failed to save closure data:', error);
      // Still complete even if save fails
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.8)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>
            Guided Reflection
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Your time with {personaName} is coming to an end. Let's take a moment to reflect.
          </p>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            color: '#94a3b8'
          }}>
            <span>Question {currentQuestionIndex + 1} of {REFLECTIVE_QUESTIONS.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / REFLECTIVE_QUESTIONS.length) * 100)}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '4px',
            background: 'rgba(148, 163, 184, 0.2)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((currentQuestionIndex + 1) / REFLECTIVE_QUESTIONS.length) * 100}%`,
              height: '100%',
              background: '#38bdf8',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Question */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            color: '#e2e8f0',
            fontSize: '1.5rem',
            marginBottom: '1.5rem',
            lineHeight: '1.4'
          }}>
            {currentQuestion}
          </h2>
          
          {!isLastQuestion ? (
            <textarea
              value={answers[currentQuestionIndex] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Take your time to reflect and write your thoughts..."
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '1rem',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          ) : (
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#e2e8f0',
                fontWeight: '500'
              }}>
                Final Message
              </label>
              <textarea
                value={finalMessage}
                onChange={(e) => setFinalMessage(e.target.value)}
                placeholder="Write a final message to {personaName}..."
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '1rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <button
            type="button"
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            style={{
              padding: '0.75rem 1.5rem',
              background: currentQuestionIndex === 0 
                ? 'rgba(148, 163, 184, 0.2)' 
                : 'rgba(148, 163, 184, 0.3)',
              color: currentQuestionIndex === 0 ? '#64748b' : '#e2e8f0',
              border: 'none',
              borderRadius: '6px',
              cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Back
          </button>

          {!isLastQuestion ? (
            <button
              type="button"
              onClick={handleNext}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                marginLeft: 'auto'
              }}
            >
              Next Question
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={loading || !finalMessage.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                background: loading || !finalMessage.trim() ? '#475569' : '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                cursor: loading || !finalMessage.trim() ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                marginLeft: 'auto'
              }}
            >
              {loading ? 'Completing...' : 'Complete Reflection'}
            </button>
          )}
        </div>

        {/* Resources */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: '8px',
          border: '1px solid rgba(148, 163, 184, 0.1)'
        }}>
          <h3 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '1rem' }}>
            Grief Support Resources
          </h3>
          <ul style={{ color: '#94a3b8', margin: 0, paddingLeft: '1.5rem' }}>
            <li><strong>988 Suicide & Crisis Lifeline:</strong> Call or text 988</li>
            <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
            <li><strong>National Alliance on Mental Illness (NAMI):</strong> 1-800-950-NAMI</li>
            <li><strong>GriefShare:</strong> Find local grief support groups at griefshare.org</li>
            <li><strong>Psychology Today:</strong> Find therapists at psychologytoday.com</li>
          </ul>
        </div>
      </div>
    </main>
  );
};

