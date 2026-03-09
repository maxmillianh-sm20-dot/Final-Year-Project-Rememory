import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@context/AuthContext';
import { apiClient } from '@services/apiService';

interface PersonaFormData {
  // Section 1: Relationship & Background
  name: string;
  relationship: string;
  relationshipDescription: string;
  personalityWords: string;
  quirks: string;

  // Section 2: Voice, Tone & Communication
  speakingStyle: string;
  commonPhrases: string;
  languages: string;
  howToReferToUser: string;

  // Section 3: Appearance & Physical Details
  physicalAppearance: string;
  distinctiveDetails: string;

  // Section 4: Shared Memories
  favoriteMemory: string;
  emotionalMemory: string;
  routineMemory: string;
  whatTheyMeant: string;

  // Section 5: Values & Beliefs
  values: string;
  religiousSpiritual: string;
  beliefs: string;
  howTheyComforted: string;

  // Section 6: Goals & Life Story
  dreams: string;
  proudOf: string;
  struggles: string;

  // Section 7: Emotional Triggers
  topicsToAvoid: string;
  sensitiveDates: string;
  comfortStyle: string;

  // Section 8: Boundaries
  avoidMedicalAdvice: boolean;
  avoidFinancialAdvice: boolean;
  avoidLegalAdvice: boolean;
  avoidPredictions: boolean;
  avoidPhysicalPresence: boolean;
  avoidComingBack: boolean;

  // Section 9: Guided Closure
  farewellStyle: string;
  buildCopingHabits: boolean;

  // Section 10: Crisis Safety
  checkInEmotionally: boolean;
  offerGrounding: boolean;
  severeDistressResponse: string;
}

export const PersonaCreation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token, refreshPersona } = useAuth();

  const [formData, setFormData] = useState<PersonaFormData>({
    name: '',
    relationship: '',
    relationshipDescription: '',
    personalityWords: '',
    quirks: '',
    speakingStyle: '',
    commonPhrases: '',
    languages: '',
    howToReferToUser: '',
    physicalAppearance: '',
    distinctiveDetails: '',
    favoriteMemory: '',
    emotionalMemory: '',
    routineMemory: '',
    whatTheyMeant: '',
    values: '',
    religiousSpiritual: '',
    beliefs: '',
    howTheyComforted: '',
    dreams: '',
    proudOf: '',
    struggles: '',
    topicsToAvoid: '',
    sensitiveDates: '',
    comfortStyle: '',
    avoidMedicalAdvice: true,
    avoidFinancialAdvice: true,
    avoidLegalAdvice: true,
    avoidPredictions: true,
    avoidPhysicalPresence: true,
    avoidComingBack: true,
    farewellStyle: '',
    buildCopingHabits: true,
    checkInEmotionally: true,
    offerGrounding: true,
    severeDistressResponse: ''
  });

  const totalSteps = 10;

  const updateField = (field: keyof PersonaFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      setError('You must be logged in to create a persona. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Transform form data to API format
      const traits = formData.personalityWords.split(',').map(t => t.trim()).filter(Boolean);
      const keyMemories = [
        formData.favoriteMemory,
        formData.emotionalMemory,
        formData.routineMemory,
        formData.whatTheyMeant
      ].filter(Boolean);
      const commonPhrases = formData.commonPhrases.split(',').map(p => p.trim()).filter(Boolean);

      const payload = {
        name: formData.name,
        relationship: formData.relationship,
        traits,
        keyMemories,
        commonPhrases,
        voiceSampleUrl: undefined, // Can be added later
        // Store additional context in a notes field or separate collection
        metadata: {
          relationshipDescription: formData.relationshipDescription,
          quirks: formData.quirks,
          speakingStyle: formData.speakingStyle,
          languages: formData.languages,
          howToReferToUser: formData.howToReferToUser,
          physicalAppearance: formData.physicalAppearance,
          distinctiveDetails: formData.distinctiveDetails,
          values: formData.values,
          religiousSpiritual: formData.religiousSpiritual,
          beliefs: formData.beliefs,
          howTheyComforted: formData.howTheyComforted,
          dreams: formData.dreams,
          proudOf: formData.proudOf,
          struggles: formData.struggles,
          topicsToAvoid: formData.topicsToAvoid,
          sensitiveDates: formData.sensitiveDates,
          comfortStyle: formData.comfortStyle,
          boundaries: {
            avoidMedicalAdvice: formData.avoidMedicalAdvice,
            avoidFinancialAdvice: formData.avoidFinancialAdvice,
            avoidLegalAdvice: formData.avoidLegalAdvice,
            avoidPredictions: formData.avoidPredictions,
            avoidPhysicalPresence: formData.avoidPhysicalPresence,
            avoidComingBack: formData.avoidComingBack
          },
          closurePreferences: {
            farewellStyle: formData.farewellStyle,
            buildCopingHabits: formData.buildCopingHabits
          },
          crisisSafety: {
            checkInEmotionally: formData.checkInEmotionally,
            offerGrounding: formData.offerGrounding,
            severeDistressResponse: formData.severeDistressResponse
          }
        }
      };

      const response = await apiClient.post('/persona', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        await refreshPersona();
        navigate('/');
      }
    } catch (err: unknown) {
      console.error('Persona creation error:', err);
      let errorMessage = 'Failed to create persona';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status: number; data?: { error?: { message?: string } } } };
        if (axiosError.response?.status === 404) {
          errorMessage = 'API endpoint not found. Please make sure the backend is running and restart the frontend dev server.';
        } else if (axiosError.response?.data?.error?.message) {
          errorMessage = axiosError.response.data.error.message;
        } else if (axiosError.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log out and log back in.';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Relationship & Background</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
              Help us understand who this person was to you and their basic background.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                What name should the AI use? *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                style={inputStyle}
                placeholder="e.g., Sarah, Mom, John"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                Who is this person to you? *
              </label>
              <input
                type="text"
                value={formData.relationship}
                onChange={(e) => updateField('relationship', e.target.value)}
                required
                style={inputStyle}
                placeholder="e.g., mother, partner, best friend, grandfather"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                How would you describe your relationship with them?
              </label>
              <textarea
                value={formData.relationshipDescription}
                onChange={(e) => updateField('relationshipDescription', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Describe the nature of your relationship..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                What are 3 words that best describe their personality? *
              </label>
              <input
                type="text"
                value={formData.personalityWords}
                onChange={(e) => updateField('personalityWords', e.target.value)}
                required
                style={inputStyle}
                placeholder="e.g., kind, humorous, thoughtful"
              />
              <small style={{ color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
                Separate words with commas
              </small>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                What are some quirks or little things they often did?
              </label>
              <textarea
                value={formData.quirks}
                onChange={(e) => updateField('quirks', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="e.g., always hummed while cooking, had a specific way of saying hello..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Voice, Tone & Communication Style</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
              Help the AI understand how they communicated.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                How did they usually speak? *
              </label>
              <select
                value={formData.speakingStyle}
                onChange={(e) => updateField('speakingStyle', e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">Select a style...</option>
                <option value="soft">Soft and gentle</option>
                <option value="direct">Direct and straightforward</option>
                <option value="humorous">Humorous and lighthearted</option>
                <option value="formal">Formal and proper</option>
                <option value="casual">Casual and relaxed</option>
                <option value="warm">Warm and affectionate</option>
                <option value="encouraging">Encouraging and supportive</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                Did they have any phrases they said often? *
              </label>
                <input
                  type="text"
                  value={formData.commonPhrases}
                  onChange={(e) => updateField('commonPhrases', e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="e.g., 'Everything will be okay', 'I love you', 'Take care of yourself'"
                />
                <small style={{ color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
                  Separate phrases with commas
                </small>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                What language or mix of languages did they speak?
              </label>
              <input
                type="text"
                value={formData.languages}
                onChange={(e) => updateField('languages', e.target.value)}
                style={inputStyle}
                placeholder="e.g., English, Spanish, mix of both"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                How should the AI refer to you?
              </label>
              <input
                type="text"
                value={formData.howToReferToUser}
                onChange={(e) => updateField('howToReferToUser', e.target.value)}
                style={inputStyle}
                placeholder="e.g., 'dear', 'sweetheart', your nickname"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Appearance & Physical Details</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
              Used only to help memory clarity and context.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                How would you describe their physical appearance?
              </label>
              <textarea
                value={formData.physicalAppearance}
                onChange={(e) => updateField('physicalAppearance', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="General description of how they looked..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                Is there any small detail you want the AI to remember?
              </label>
              <textarea
                value={formData.distinctiveDetails}
                onChange={(e) => updateField('distinctiveDetails', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="e.g., always wore a specific necklace, had a particular hairstyle, glasses, etc."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Shared Memories</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
              The AI will use these to create emotional grounding and context.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                What is your favourite memory with them? *
              </label>
              <textarea
                value={formData.favoriteMemory}
                onChange={(e) => updateField('favoriteMemory', e.target.value)}
                required
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                placeholder="Describe a cherished memory..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                What is a memory that still makes you emotional?
              </label>
              <textarea
                value={formData.emotionalMemory}
                onChange={(e) => updateField('emotionalMemory', e.target.value)}
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                placeholder="A memory that holds deep emotional significance..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                What routine or everyday thing did you do together?
              </label>
              <textarea
                value={formData.routineMemory}
                onChange={(e) => updateField('routineMemory', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Daily routines, traditions, or habits you shared..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                What did they mean to you? *
              </label>
              <textarea
                value={formData.whatTheyMeant}
                onChange={(e) => updateField('whatTheyMeant', e.target.value)}
                required
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                placeholder="Express what this person meant in your life..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Their Values & Beliefs</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
              This helps the AI respond in ways that align with their worldview.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                What values were important to them? *
              </label>
              <textarea
                value={formData.values}
                onChange={(e) => updateField('values', e.target.value)}
                required
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="e.g., family, work, kindness, discipline, religion, honesty..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                Were they religious or spiritual?
              </label>
              <textarea
                value={formData.religiousSpiritual}
                onChange={(e) => updateField('religiousSpiritual', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Their spiritual or religious beliefs, if any..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                What were their beliefs about life and people?
              </label>
              <textarea
                value={formData.beliefs}
                onChange={(e) => updateField('beliefs', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Their philosophy or worldview..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                How would they comfort someone who is hurting? *
              </label>
              <textarea
                value={formData.howTheyComforted}
                onChange={(e) => updateField('howTheyComforted', e.target.value)}
                required
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                placeholder="Their approach to providing comfort and support..."
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Their Goals & Life Story</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
              This helps the AI behave consistently with their life experiences.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                What was their dream or life goal?
              </label>
              <textarea
                value={formData.dreams}
                onChange={(e) => updateField('dreams', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Their aspirations, dreams, or life goals..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                What were they proud of?
              </label>
              <textarea
                value={formData.proudOf}
                onChange={(e) => updateField('proudOf', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Achievements, qualities, or things they took pride in..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                What struggles did they have?
              </label>
              <textarea
                value={formData.struggles}
                onChange={(e) => updateField('struggles', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Challenges they faced or overcame..."
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Emotional Triggers</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
              Help us avoid topics that might be harmful or triggering for you.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                Are there topics the AI should avoid?
              </label>
              <textarea
                value={formData.topicsToAvoid}
                onChange={(e) => updateField('topicsToAvoid', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Topics, subjects, or themes to avoid..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                Are there dates that are sensitive for you?
              </label>
              <textarea
                value={formData.sensitiveDates}
                onChange={(e) => updateField('sensitiveDates', e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Specific dates, anniversaries, or periods to be mindful of..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                Should the AI comfort you gently or directly? *
              </label>
              <select
                value={formData.comfortStyle}
                onChange={(e) => updateField('comfortStyle', e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">Select a style...</option>
                <option value="gentle">Gentle and soft</option>
                <option value="direct">Direct and straightforward</option>
                <option value="balanced">Balanced approach</option>
              </select>
            </div>
          </div>
        );

      case 8:
        return (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Boundaries & Safe-Mode</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
              Required for safety and to maintain healthy boundaries.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
                <input
                  type="checkbox"
                  checked={formData.avoidMedicalAdvice}
                  onChange={(e) => updateField('avoidMedicalAdvice', e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                Should the AI avoid giving medical advice?
              </label>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
                <input
                  type="checkbox"
                  checked={formData.avoidFinancialAdvice}
                  onChange={(e) => updateField('avoidFinancialAdvice', e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                Should the AI avoid giving financial advice?
              </label>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
                <input
                  type="checkbox"
                  checked={formData.avoidLegalAdvice}
                  onChange={(e) => updateField('avoidLegalAdvice', e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                Should the AI avoid giving legal advice?
              </label>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
                <input
                  type="checkbox"
                  checked={formData.avoidPredictions}
                  onChange={(e) => updateField('avoidPredictions', e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                Should the AI avoid making real-world predictions?
              </label>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
                <input
                  type="checkbox"
                  checked={formData.avoidPhysicalPresence}
                  onChange={(e) => updateField('avoidPhysicalPresence', e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                Should the AI avoid pretending to be physically present?
              </label>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
                <input
                  type="checkbox"
                  checked={formData.avoidComingBack}
                  onChange={(e) => updateField('avoidComingBack', e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                Should the AI avoid claiming it can "come back" or "see you"?
              </label>
            </div>
          </div>
        );

      case 9:
        return (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Guided Closure Preferences</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
              How should the AI help you during the final days of the 30-day period?
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                When the persona ends after 30 days, how should the farewell feel? *
              </label>
              <select
                value={formData.farewellStyle}
                onChange={(e) => updateField('farewellStyle', e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">Select a style...</option>
                <option value="gentle">Gentle and peaceful</option>
                <option value="encouraging">Encouraging and hopeful</option>
                <option value="symbolic">Symbolic and meaningful</option>
                <option value="celebration">Celebration of memories</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
                <input
                  type="checkbox"
                  checked={formData.buildCopingHabits}
                  onChange={(e) => updateField('buildCopingHabits', e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                Should the AI help you build healthy coping habits along the way?
              </label>
            </div>
          </div>
        );

      case 10:
        return (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Crisis-Safety Questions</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
              Important safety settings for your emotional wellbeing.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
                <input
                  type="checkbox"
                  checked={formData.checkInEmotionally}
                  onChange={(e) => updateField('checkInEmotionally', e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                Do you want the AI to check in on how you're coping emotionally?
              </label>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
                <input
                  type="checkbox"
                  checked={formData.offerGrounding}
                  onChange={(e) => updateField('offerGrounding', e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                Should the AI offer grounding techniques if you're overwhelmed?
              </label>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                How should the AI respond if you express severe distress? *
              </label>
              <textarea
                value={formData.severeDistressResponse}
                onChange={(e) => updateField('severeDistressResponse', e.target.value)}
                required
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                placeholder="Describe how you'd like the AI to respond in crisis situations..."
              />
            </div>

            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px'
            }}>
              <p style={{ color: '#fca5a5', margin: 0, fontSize: '0.875rem' }}>
                <strong>Important:</strong> If you're experiencing a mental health crisis, 
                please contact a mental health professional, crisis hotline, or emergency services immediately. 
                This AI is not a substitute for professional help.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '6px',
    color: '#e2e8f0',
    fontSize: '1rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  return (
    <main className="container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.8)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        {/* Progress indicator */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Step {currentStep} of {totalSteps}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '4px',
            background: 'rgba(148, 163, 184, 0.2)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(currentStep / totalSteps) * 100}%`,
              height: '100%',
              background: '#38bdf8',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        {renderStep()}

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '2.5rem',
          gap: '1rem'
        }}>
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            style={{
              padding: '0.75rem 1.5rem',
              background: currentStep === 1 ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)',
              color: currentStep === 1 ? '#64748b' : '#e2e8f0',
              border: 'none',
              borderRadius: '6px',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Back
          </button>

          {currentStep < totalSteps ? (
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
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: loading ? '#475569' : '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                marginLeft: 'auto'
              }}
            >
              {loading ? 'Creating Persona...' : 'Create Persona'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

