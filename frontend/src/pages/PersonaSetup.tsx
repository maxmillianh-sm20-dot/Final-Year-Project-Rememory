import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { AppRoute } from '../types';
import { RememoryLogo } from '../components/RememoryLogo';
import { TermsModal } from '../components/TermsModal';
import { PrivacyModal } from '../components/PrivacyModal';
import { fetchPersonas } from '../services/apiService';
import { auth } from '../services/firebaseService';

const RELATIONSHIP_OPTIONS = [
  "Mother", "Father", "Husband", "Wife", "Partner", 
  "Son", "Daughter", "Sister", "Brother", 
  "Grandmother", "Grandfather", "Other"
];

export const PersonaSetup = () => {
  const { createPersona, updatePersona, state, navigate } = useApp();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  // Only treat as editing if the persona is ACTIVE. 
  // If it's completed/expired, we are creating a NEW one.
  const isEditing = !!state.persona && state.hasOnboarded && state.persona.status === 'active';

  const [takenRelationships, setTakenRelationships] = useState<Record<string, number>>({});
  const [totalPersonas, setTotalPersonas] = useState(0);

  useEffect(() => {
    const loadExisting = async () => {
      if (state.isAuthenticated && auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          const list = await fetchPersonas(token);
          setTotalPersonas(list.length);
          
          const counts: Record<string, number> = {};
          list.forEach(p => {
            // Don't count the current one if we are editing
            if (isEditing && state.persona && p.id === state.persona.id) return;
            
            // Normalize to match the dropdown options if possible, or just count exact matches
            // The backend compares using toLowerCase()
            const rel = p.relationship.trim(); 
            counts[rel] = (counts[rel] || 0) + 1;
          });
          console.log('Taken relationships:', counts);
          setTakenRelationships(counts);
        } catch (e) {
          console.error("Failed to load existing personas", e);
        }
      }
    };
    loadExisting();
  }, [isEditing, state.persona, state.isAuthenticated]);

  // Block creation if limit reached (unless editing)
  if (!isEditing && totalPersonas >= 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#FDFCFB]">
        <div className="absolute top-0 left-0 w-full p-6">
          <RememoryLogo size="sm" />
        </div>
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-serif text-stone-800 mb-4">Account Limit Reached</h2>
          <p className="text-stone-600 mb-8 leading-relaxed">
            You have reached the maximum limit of 3 personas for this account. 
            To create a new one, you would need to delete an existing persona from your dashboard settings (if available) or contact support.
          </p>
          <button
            onClick={() => navigate(AppRoute.DASHBOARD)}
            className="px-8 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isRelationshipDisabled = (rel: string) => {
    // Check exact match first
    let count = takenRelationships[rel] || 0;
    
    // Also check case-insensitive match against keys in takenRelationships
    const lowerRel = rel.toLowerCase();
    Object.keys(takenRelationships).forEach(taken => {
      if (taken.toLowerCase() === lowerRel && taken !== rel) {
        count += takenRelationships[taken];
      }
    });

    // Normalize for siblings check
    if (lowerRel.includes('sister') || lowerRel.includes('brother') || lowerRel.includes('sibling')) {
      // Count ALL siblings (sisters + brothers + siblings)
      let siblingCount = 0;
      Object.keys(takenRelationships).forEach(taken => {
        const t = taken.toLowerCase();
        if (t.includes('sister') || t.includes('brother') || t.includes('sibling')) {
          siblingCount += takenRelationships[taken];
        }
      });
      // If we are checking "Sister", we need to see if we already have 2 of THIS specific type
      // The requirement was: "sister and brother siblings and others can create 2 times"
      // This implies 2 sisters allowed, OR 2 brothers allowed. Not 2 siblings total.
      // So the original logic was actually closer, but let's be robust.
      
      // Revert to specific type check:
      return count >= 2;
    }
    
    return count >= 1;
  };

  const [formData, setFormData] = useState({
    // Step 1 - Purpose
    purpose: '',
    purposeDescription: '',
    // Step 2
    name: '',
    relationship: '',
    customRelationship: '',
    relationshipDescription: '',
    traits: '',
    quirks: '',
    // Step 2
    speakingStyle: '',
    commonPhrases: '',
    languages: '',
    userNickname: '',
    // Step 3
    appearance: '',
    appearanceDetail: '',
    // Step 4
    favoriteMemory: '',
    emotionalMemory: '',
    routine: '',
    meaning: '',
    // Step 5
    values: '',
    spirituality: '',
    beliefs: '',
    comfortStyle: '',
    // Step 6
    lifeGoal: '',
    proudOf: '',
    struggles: '',
    // Step 7
    avoidTopics: '',
    sensitiveDates: '',
    comfortMethod: '',
    // Step 8
    avoidMedical: false,
    avoidFinancial: false,
    avoidLegal: false,
    avoidPredictions: false,
    avoidPhysicalPresence: false,
    avoidReturnClaims: false,
    // Step 9
    farewellStyle: '',
    copingHabits: false,
    // Step 10
    emotionalCheckin: false,
    groundingTechniques: false,
    distressResponse: '',
    // Terms
    agreedToTerms: false,
  });

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    if (isEditing && state.persona) {
      const bio = state.persona.biography || '';
      const memories = state.persona.memories || '';
      const speakingStyleFull = state.persona.speakingStyle || '';

      console.log('=== EDITING PERSONA ===');
      console.log('Biography:', bio);
      console.log('Memories:', memories);
      console.log('Speaking Style:', speakingStyleFull);

      // Helper to extract field by label - prevents duplication
      const extract = (label: string, source: string = bio) => {
        // Escape special regex characters
        const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Match content until next field or section
        const regex = new RegExp(`${escapedLabel}:\\s*(.+?)(?=\\n\\s*[A-Z][\\w\\s]+:|\\n\\s*\\[|$)`, 'is');
        const match = source.match(regex);

        if (match && match[1]) {
          let value = match[1].trim();

          // Remove duplicate lines
          const lines = value.split('\n');
          const seen = new Set();
          const uniqueLines = [];

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !seen.has(trimmed)) {
              seen.add(trimmed);
              uniqueLines.push(line);
            }
          }

          value = uniqueLines.join('\n').trim();
          console.log(`Extracted ${label}:`, value.substring(0, 80) + '...');
          return value;
        }

        console.log(`Could not extract ${label}`);
        return '';
      };

      // Helper for booleans - improved to handle various formats
      const extractBool = (label: string) => {
        // First try standard extraction
        const val = extract(label);
        if (val.toLowerCase() === 'true') return true;

        // Fallback: Look for the pattern directly in the bio
        // Matches: "Avoid Medical: true" or "Avoid Medical: true" (case insensitive)
        const regex = new RegExp(`${label}:\\s*true`, 'i');
        return regex.test(bio);
      };

      setFormData((prev) => ({
        ...prev,
        name: state.persona?.name || '',
        relationship: (() => {
            const rel = state.persona?.relationship || '';
            if (!rel) return '';
            const match = RELATIONSHIP_OPTIONS.find(opt => opt.toLowerCase() === rel.toLowerCase());
            return match || 'Other';
        })(),
        customRelationship: (() => {
            const rel = state.persona?.relationship || '';
            if (!rel) return '';
            const match = RELATIONSHIP_OPTIONS.find(opt => opt.toLowerCase() === rel.toLowerCase());
            return match ? '' : rel;
        })(),
        traits: state.persona?.traits || '',
        userNickname: state.persona?.userNickname || '',
        commonPhrases: Array.isArray(state.persona?.commonPhrases)
          ? state.persona?.commonPhrases.join(', ')
          : (state.persona?.commonPhrases || ''),

        // Extract from speaking style
        speakingStyle: extract('Style', speakingStyleFull) || state.persona?.speakingStyle || '',
        languages: extract('Languages', speakingStyleFull),

        // Extract from memories - handle comma-separated string
        favoriteMemory: (() => {
          const extracted = extract('Favorite Memory', memories);
          if (extracted) return extracted;
          // Fallback: split comma-separated memories
          const memArray = memories.split(',').map(m => m.trim()).filter(Boolean);
          return memArray[0] || '';
        })(),
        emotionalMemory: (() => {
          const extracted = extract('Emotional Memory', memories);
          if (extracted) return extracted;
          const memArray = memories.split(',').map(m => m.trim()).filter(Boolean);
          return memArray[1] || '';
        })(),
        routine: (() => {
          const extracted = extract('Routine', memories);
          if (extracted) return extracted;
          const memArray = memories.split(',').map(m => m.trim()).filter(Boolean);
          return memArray[2] || '';
        })(),
        meaning: (() => {
          const extracted = extract('Meaning', memories);
          if (extracted) return extracted;
          const memArray = memories.split(',').map(m => m.trim()).filter(Boolean);
          return memArray[3] || '';
        })(),

        // Smart Hydration from Biography
        purpose: extract('Purpose'),
        purposeDescription: extract('Purpose Description'),
        relationshipDescription: extract('Relationship Description'),
        quirks: extract('Quirks'),
        appearance: extract('Physical Appearance'),
        appearanceDetail: extract('Key Detail'),
        values: extract('Values'),
        spirituality: extract('Spirituality'),
        beliefs: extract('Beliefs'),
        comfortStyle: extract('Comfort Style'),
        lifeGoal: extract('Life Goal'),
        proudOf: extract('Proud Of'),
        struggles: extract('Struggles'),
        avoidTopics: extract('Avoid Topics'),
        sensitiveDates: extract('Sensitive Dates'),
        comfortMethod: extract('Comfort Method'),
        farewellStyle: extract('Farewell Style'),
        distressResponse: extract('Distress Response'),

        // Booleans
        avoidMedical: state.persona?.avoidMedicalAdvice ?? extractBool('Avoid Medical'),
        avoidFinancial: state.persona?.avoidFinancialAdvice ?? extractBool('Avoid Financial'),
        avoidLegal: state.persona?.avoidLegalAdvice ?? extractBool('Avoid Legal'),
        avoidPredictions: state.persona?.avoidPredictions ?? extractBool('Avoid Predictions'),
        avoidPhysicalPresence: state.persona?.avoidPhysicalPresence ?? extractBool('Avoid Physical Presence'),
        avoidReturnClaims: state.persona?.avoidComingBack ?? extractBool('Avoid Return Claims'),
        copingHabits: state.persona?.copingHabits ?? extractBool('Build Coping Habits'),
        emotionalCheckin: state.persona?.emotionalCheckin ?? extractBool('Emotional Checkin'),
        groundingTechniques: state.persona?.groundingTechniques ?? extractBool('Grounding Techniques'),

        // Auto-check terms when editing (user already agreed when creating)
        agreedToTerms: true,
      }));
    }
  }, [isEditing, state.persona]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    // Validate step 1 (purpose) before proceeding
    if (step === 1 && !formData.purpose) {
      alert('Please select your purpose for creating this persona.');
      return;
    }
    if (step < 11) {
      setStep((s) => s + 1);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (step < 11) {
      setStep((s) => s + 1);
      return;
    }

    // Check terms acceptance for both creating and editing
    if (!formData.agreedToTerms) {
      alert('You must agree to the Terms of Service and Privacy Policy to save changes.');
      return;
    }

    try {
      setSubmitting(true);

      // Construct the rich biography from all the new fields
      // Note: Boundaries and Crisis settings are now stored as separate boolean fields
      const biography = `
        [User Purpose]
        Purpose: ${formData.purpose}${formData.purposeDescription ? ` - ${formData.purposeDescription}` : ''}
        
        [Relationship Context]
        Relationship Description: ${formData.relationshipDescription}
        Quirks: ${formData.quirks}
        
        [Appearance]
        Physical Appearance: ${formData.appearance}
        Key Detail: ${formData.appearanceDetail}
        
        [Values & Beliefs]
        Values: ${formData.values}
        Spirituality: ${formData.spirituality}
        Beliefs: ${formData.beliefs}
        Comfort Style: ${formData.comfortStyle}
        
        [Life Story]
        Life Goal: ${formData.lifeGoal}
        Proud Of: ${formData.proudOf}
        Struggles: ${formData.struggles}
        
        [Emotional Triggers & Safety]
        Avoid Topics: ${formData.avoidTopics}
        Sensitive Dates: ${formData.sensitiveDates}
        Comfort Method: ${formData.comfortMethod}
        
        [Closure Preferences]
        Farewell Style: ${formData.farewellStyle}
        Distress Response: ${formData.distressResponse}
      `.trim();

      const memories = `
        Favorite Memory: ${formData.favoriteMemory}
        Emotional Memory: ${formData.emotionalMemory}
        Routine: ${formData.routine}
        Meaning: ${formData.meaning}
      `.trim();

      const fullSpeakingStyle = `
        Style: ${formData.speakingStyle}
        Languages: ${formData.languages}
      `.trim();

      // Ensure biography doesn't exceed the database limit (50,000 chars)
      // Remove any duplicate sections from biography
      const deduplicateBiography = (text: string): string => {
        const sections = text.split(/(\[[^\]]+\])/g); // Split by section headers like [Life Story]
        const seen = new Set();
        const uniqueSections = [];

        for (const section of sections) {
          const trimmed = section.trim();
          if (!trimmed) continue;

          // For section headers, always keep them
          if (trimmed.startsWith('[')) {
            uniqueSections.push(section);
            continue;
          }

          // For content, remove duplicate lines
          const lines = trimmed.split('\n');
          const seenLines = new Set();
          const uniqueLines = [];

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !seenLines.has(trimmedLine)) {
              seenLines.add(trimmedLine);
              uniqueLines.push(line);
            }
          }

          if (uniqueLines.length > 0) {
            uniqueSections.push(uniqueLines.join('\n'));
          }
        }

        return uniqueSections.join('\n').trim();
      };

      const deduplicatedBiography = deduplicateBiography(biography);
      console.log(`Biography deduplicated: ${biography.length} -> ${deduplicatedBiography.length} chars`);

      // Truncate to 45,000 to leave buffer for safety
      const MAX_BIOGRAPHY_LENGTH = 45000;
      let finalBiography = deduplicatedBiography;
      if (deduplicatedBiography.length > MAX_BIOGRAPHY_LENGTH) {
        console.warn(`Biography too long (${deduplicatedBiography.length} chars). Truncating to ${MAX_BIOGRAPHY_LENGTH} chars.`);
        finalBiography = deduplicatedBiography.substring(0, MAX_BIOGRAPHY_LENGTH) + '\n\n[Content truncated due to length]';
        alert(`Your persona details are very detailed (${deduplicatedBiography.length} characters)! We've saved the first ${MAX_BIOGRAPHY_LENGTH} characters. Consider shortening some descriptions if you want to include everything.`);
      }

      const payload = {
        name: formData.name,
        relationship: formData.relationship === 'Other' ? formData.customRelationship : formData.relationship,
        traits: formData.traits,
        memories: memories,
        speakingStyle: fullSpeakingStyle,
        userNickname: formData.userNickname,
        biography: finalBiography,
        commonPhrases: String(formData.commonPhrases || ''),
        // Step 8 - Boundaries (Safety)
        avoidMedicalAdvice: formData.avoidMedical,
        avoidFinancialAdvice: formData.avoidFinancial,
        avoidLegalAdvice: formData.avoidLegal,
        avoidPredictions: formData.avoidPredictions,
        avoidPhysicalPresence: formData.avoidPhysicalPresence,
        avoidComingBack: formData.avoidReturnClaims,
        // Step 9-10 - Crisis Support
        copingHabits: formData.copingHabits,
        emotionalCheckin: formData.emotionalCheckin,
        groundingTechniques: formData.groundingTechniques,
      };

      console.log('=== SAVING PERSONA ===');
      console.log('Is Editing:', isEditing);

      if (isEditing) {
        // When editing, only send fields that have actually changed
        const changedFields: any = { id: state.persona?.id };

        // Helper function to check if a field has changed
        const hasChanged = (newValue: any, oldValue: any) => {
          if (typeof newValue === 'boolean') return newValue !== oldValue;
          if (Array.isArray(newValue)) return JSON.stringify(newValue) !== JSON.stringify(oldValue);
          return newValue !== oldValue && newValue !== '' && newValue !== undefined;
        };

        // Check each field for changes
        if (hasChanged(finalBiography, state.persona?.biography)) {
          changedFields.biography = finalBiography;
        }
        if (hasChanged(memories, state.persona?.memories)) {
          changedFields.memories = memories;
        }
        if (hasChanged(fullSpeakingStyle, state.persona?.speakingStyle)) {
          changedFields.speakingStyle = fullSpeakingStyle;
        }
        if (hasChanged(formData.userNickname, state.persona?.userNickname)) {
          changedFields.userNickname = formData.userNickname;
        }
        if (hasChanged(formData.traits, state.persona?.traits)) {
          changedFields.traits = formData.traits;
        }
        if (hasChanged(String(formData.commonPhrases || ''), state.persona?.commonPhrases)) {
          changedFields.commonPhrases = String(formData.commonPhrases || '');
        }

        // Check boolean fields
        if (hasChanged(formData.avoidMedical, state.persona?.avoidMedicalAdvice)) {
          changedFields.avoidMedicalAdvice = formData.avoidMedical;
        }
        if (hasChanged(formData.avoidFinancial, state.persona?.avoidFinancialAdvice)) {
          changedFields.avoidFinancialAdvice = formData.avoidFinancial;
        }
        if (hasChanged(formData.avoidLegal, state.persona?.avoidLegalAdvice)) {
          changedFields.avoidLegalAdvice = formData.avoidLegal;
        }
        if (hasChanged(formData.avoidPredictions, state.persona?.avoidPredictions)) {
          changedFields.avoidPredictions = formData.avoidPredictions;
        }
        if (hasChanged(formData.avoidPhysicalPresence, state.persona?.avoidPhysicalPresence)) {
          changedFields.avoidPhysicalPresence = formData.avoidPhysicalPresence;
        }
        if (hasChanged(formData.avoidReturnClaims, state.persona?.avoidComingBack)) {
          changedFields.avoidComingBack = formData.avoidReturnClaims;
        }
        if (hasChanged(formData.copingHabits, state.persona?.copingHabits)) {
          changedFields.copingHabits = formData.copingHabits;
        }
        if (hasChanged(formData.emotionalCheckin, state.persona?.emotionalCheckin)) {
          changedFields.emotionalCheckin = formData.emotionalCheckin;
        }
        if (hasChanged(formData.groundingTechniques, state.persona?.groundingTechniques)) {
          changedFields.groundingTechniques = formData.groundingTechniques;
        }

        // Only update if there are actual changes (more than just the ID)
        if (Object.keys(changedFields).length > 1) {
          console.log('Changed fields:', JSON.stringify(changedFields, null, 2));
          await updatePersona(changedFields as any);
          console.log('✅ Persona updated successfully');
        } else {
          console.log('ℹ️ No changes detected, skipping update');
        }
      } else {
        // When creating, send all fields
        console.log('Payload:', JSON.stringify(payload, null, 2));
        await createPersona(payload as any);
        console.log('✅ Persona created successfully');
      }
      navigate(AppRoute.DASHBOARD);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unable to save persona. Please try again.';

      // If we get a 400 "Persona already exists", we should just redirect to dashboard
      if (message.includes('Persona already exists') || message.includes('persona_exists')) {
        navigate(AppRoute.DASHBOARD);
        return;
      }

      if (message.includes('Persona not found') || message.includes('persona_not_found')) {
        try {
          // Recreate logic if needed, similar to before
          const biography = `
            [Relationship Context]
            Relationship Description: ${formData.relationshipDescription}
            Quirks: ${formData.quirks}
            
            [Appearance]
            Physical Appearance: ${formData.appearance}
            Key Detail: ${formData.appearanceDetail}
            
            [Values & Beliefs]
            Values: ${formData.values}
            Spirituality: ${formData.spirituality}
            Beliefs: ${formData.beliefs}
            Comfort Style: ${formData.comfortStyle}
            
            [Life Story]
            Life Goal: ${formData.lifeGoal}
            Proud Of: ${formData.proudOf}
            Struggles: ${formData.struggles}
            
            [Emotional Triggers & Safety]
            Avoid Topics: ${formData.avoidTopics}
            Sensitive Dates: ${formData.sensitiveDates}
            Comfort Method: ${formData.comfortMethod}
            
            [Closure Preferences]
            Farewell Style: ${formData.farewellStyle}
            Distress Response: ${formData.distressResponse}
          `.trim();

          const memories = `
            Favorite Memory: ${formData.favoriteMemory}
            Emotional Memory: ${formData.emotionalMemory}
            Routine: ${formData.routine}
            Meaning: ${formData.meaning}
          `.trim();

          const fullSpeakingStyle = `
            Style: ${formData.speakingStyle}
            Languages: ${formData.languages}
          `.trim();

          // Ensure biography doesn't exceed the database limit
          const MAX_BIOGRAPHY_LENGTH = 45000;
          let finalBiography = biography;
          if (biography.length > MAX_BIOGRAPHY_LENGTH) {
            console.warn(`Biography too long (${biography.length} chars). Truncating to ${MAX_BIOGRAPHY_LENGTH} chars.`);
            finalBiography = biography.substring(0, MAX_BIOGRAPHY_LENGTH) + '\n\n[Content truncated due to length]';
            alert(`Your persona details are very detailed (${biography.length} characters)! We've saved the first ${MAX_BIOGRAPHY_LENGTH} characters. Consider shortening some descriptions if you want to include everything.`);
          }

          const payload = {
            name: formData.name,
            relationship: formData.relationship === 'Other' ? formData.customRelationship : formData.relationship,
            traits: formData.traits,
            memories: memories,
            speakingStyle: fullSpeakingStyle,
            userNickname: formData.userNickname,
            biography: finalBiography,
            commonPhrases: String(formData.commonPhrases || ''),
            // Step 8 - Boundaries (Safety)
            avoidMedicalAdvice: formData.avoidMedical,
            avoidFinancialAdvice: formData.avoidFinancial,
            avoidLegalAdvice: formData.avoidLegal,
            avoidPredictions: formData.avoidPredictions,
            avoidPhysicalPresence: formData.avoidPhysicalPresence,
            avoidComingBack: formData.avoidReturnClaims,
            // Step 9-10 - Crisis Support
            copingHabits: formData.copingHabits,
            emotionalCheckin: formData.emotionalCheckin,
            groundingTechniques: formData.groundingTechniques,
          };
          await createPersona(payload as any);
          navigate(AppRoute.DASHBOARD);
          return;
        } catch (createErr) {
          console.error('Failed to recreate persona:', createErr);
          alert('This persona no longer exists on the server and could not be restored. You will be redirected to create a new one.');
          localStorage.removeItem('rememory_persona_cache');
          window.location.reload();
          return;
        }
      }

      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (state.persona) {
      navigate(AppRoute.DASHBOARD);
    } else {
      navigate(AppRoute.LANDING);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-serif text-stone-800">Why are you creating this persona?</h3>
            <p className="text-sm text-stone-500 mb-4">Understanding your purpose helps us create a more meaningful experience for you.</p>
            <SelectGroup
              label="What is your primary reason for using this persona? *"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              options={[
                '',
                'To express feelings I never got to share',
                'To say my last words and find closure',
                'To relieve my grief and process emotions',
                'To remember and honor their memory',
                'To have conversations I wish we could have had',
                'To feel their presence and comfort',
                'To work through unresolved feelings',
                'Other (please describe)'
              ]}
              required
            />
            {formData.purpose === 'Other (please describe)' && (
              <TextAreaGroup
                label="Please describe your purpose"
                name="purposeDescription"
                value={formData.purposeDescription || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Tell us more about why you're creating this persona..."
              />
            )}
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-sm text-indigo-800">
                <strong>Remember:</strong> This is a time-limited space (30 days) designed to help you heal and find peace. We're here to support your journey.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-serif text-stone-800">Relationship & Background</h3>
            <p className="text-sm text-stone-500 mb-4">Help us understand who this person was to you and their basic background.</p>
            <InputGroup 
              label="What name should the Companion use? *" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g. Grandma Rose" 
              autoFocus 
              disabled={isEditing}
              readOnly={isEditing}
            />
            <div className="group">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-indigo-500 transition-colors">
                Who is this person to you? *
              </label>
              <div className="relative">
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  disabled={isEditing}
                  className="w-full p-4 bg-white rounded-xl border border-stone-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-lg text-stone-700 appearance-none disabled:bg-stone-50 disabled:text-stone-500"
                >
                  <option value="">Select relationship...</option>
                  {RELATIONSHIP_OPTIONS.filter(opt => {
                    // Filter out disabled options unless it's the currently selected one (for editing)
                    const disabled = isRelationshipDisabled(opt);
                    return !disabled || opt === formData.relationship;
                  }).map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {formData.relationship === 'Other' && (
              <InputGroup 
                label="Please specify relationship *" 
                name="customRelationship" 
                value={formData.customRelationship} 
                onChange={handleChange} 
                placeholder="e.g. Step-mother, Foster Father" 
                disabled={isEditing}
                readOnly={isEditing}
              />
            )}
            <TextAreaGroup label="How would you describe your relationship with them?" name="relationshipDescription" value={formData.relationshipDescription} onChange={handleChange} rows={2} />
            <InputGroup label="What are 3 words that best describe their personality? *" name="traits" value={formData.traits} onChange={handleChange} placeholder="e.g. Kind, Witty, Gentle" />
            <TextAreaGroup label="What are some quirks or little things they often did?" name="quirks" value={formData.quirks} onChange={handleChange} rows={2} />
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-serif text-stone-800">Voice, Tone & Communication Style</h3>
            <p className="text-sm text-stone-500 mb-4">Help the Companion understand how they communicated.</p>
            <SelectGroup
              label="How did they usually speak? *"
              name="speakingStyle"
              value={formData.speakingStyle}
              onChange={handleChange}
              options={[
                "Soft and gentle",
                "Direct and straightforward",
                "Humorous and lighthearted",
                "Formal and proper",
                "Casual and relaxed",
                "Warm and affectionate",
                "Encouraging and supportive"
              ]}
            />
            <TextAreaGroup label="Did they have any phrases they said often? *" name="commonPhrases" value={formData.commonPhrases} onChange={handleChange} rows={2} placeholder="Separate phrases with commas" />
            <InputGroup label="What language or mix of languages did they speak?" name="languages" value={formData.languages} onChange={handleChange} />
            <InputGroup label="How should the Companion refer to you?" name="userNickname" value={formData.userNickname} onChange={handleChange} placeholder="e.g. Sweetheart, Buddy" />
          </div>
        );
      case 4:
        return (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-serif text-stone-800">Appearance & Physical Details</h3>
            <p className="text-sm text-stone-500 mb-4">Used only to help memory clarity and context.</p>
            <TextAreaGroup label="How would you describe their physical appearance?" name="appearance" value={formData.appearance} onChange={handleChange} rows={3} />
            <TextAreaGroup label="Is there any small detail you want the Companion to remember?" name="appearanceDetail" value={formData.appearanceDetail} onChange={handleChange} rows={2} />
          </div>
        );
      case 5:
        return (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-serif text-stone-800">Shared Memories</h3>
            <p className="text-sm text-stone-500 mb-4">The Companion will use these to create emotional grounding and context.</p>
            <TextAreaGroup label="What is your favourite memory with them? *" name="favoriteMemory" value={formData.favoriteMemory} onChange={handleChange} rows={3} />
            <TextAreaGroup label="What is a memory that still makes you emotional?" name="emotionalMemory" value={formData.emotionalMemory} onChange={handleChange} rows={3} />
            <TextAreaGroup label="What routine or everyday thing did you do together?" name="routine" value={formData.routine} onChange={handleChange} rows={2} />
            <TextAreaGroup label="What did they mean to you? *" name="meaning" value={formData.meaning} onChange={handleChange} rows={2} />
          </div>
        );
      case 6:
        return (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-serif text-stone-800">Their Values & Beliefs</h3>
            <p className="text-sm text-stone-500 mb-4">This helps the Companion respond in ways that align with their worldview.</p>
            <TextAreaGroup label="What values were important to them? *" name="values" value={formData.values} onChange={handleChange} rows={2} />
            <InputGroup label="Were they religious or spiritual?" name="spirituality" value={formData.spirituality} onChange={handleChange} />
            <TextAreaGroup label="What were their beliefs about life and people?" name="beliefs" value={formData.beliefs} onChange={handleChange} rows={2} />
            <TextAreaGroup label="How would they comfort someone who is hurting? *" name="comfortStyle" value={formData.comfortStyle} onChange={handleChange} rows={2} />
          </div>
        );
      case 7:
        return (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-serif text-stone-800">Their Goals & Life Story</h3>
            <p className="text-sm text-stone-500 mb-4">This helps the Companion behave consistently with their life experiences.</p>
            <TextAreaGroup label="What was their dream or life goal?" name="lifeGoal" value={formData.lifeGoal} onChange={handleChange} rows={2} />
            <TextAreaGroup label="What were they proud of?" name="proudOf" value={formData.proudOf} onChange={handleChange} rows={2} />
            <TextAreaGroup label="What struggles did they have?" name="struggles" value={formData.struggles} onChange={handleChange} rows={2} />
          </div>
        );
      case 8:
        return (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-serif text-stone-800">Emotional Triggers</h3>
            <p className="text-sm text-stone-500 mb-4">Help us avoid topics that might be harmful or triggering for you.</p>
            <TextAreaGroup label="Are there topics the Companion should avoid?" name="avoidTopics" value={formData.avoidTopics} onChange={handleChange} rows={2} />
            <InputGroup label="Are there dates that are sensitive for you?" name="sensitiveDates" value={formData.sensitiveDates} onChange={handleChange} />
            <SelectGroup
              label="Should the Companion comfort you gently or directly? *"
              name="comfortMethod"
              value={formData.comfortMethod}
              onChange={handleChange}
              options={["Gentle and soft", "Direct and straightforward", "Balanced approach"]}
            />
          </div>
        );
      case 9:
        return (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-serif text-stone-800">Boundaries & Safe-Mode</h3>
            <p className="text-sm text-stone-500 mb-4">Required for safety and to maintain healthy boundaries.</p>
            <CheckboxGroup label="Should the Companion avoid giving medical advice?" name="avoidMedical" checked={formData.avoidMedical} onChange={handleChange} />
            <CheckboxGroup label="Should the Companion avoid giving financial advice?" name="avoidFinancial" checked={formData.avoidFinancial} onChange={handleChange} />
            <CheckboxGroup label="Should the Companion avoid giving legal advice?" name="avoidLegal" checked={formData.avoidLegal} onChange={handleChange} />
            <CheckboxGroup label="Should the Companion avoid making real-world predictions?" name="avoidPredictions" checked={formData.avoidPredictions} onChange={handleChange} />
            <CheckboxGroup label="Should the Companion avoid pretending to be physically present?" name="avoidPhysicalPresence" checked={formData.avoidPhysicalPresence} onChange={handleChange} />
            <CheckboxGroup label="Should the Companion avoid claiming it can 'come back' or 'see you'?" name="avoidReturnClaims" checked={formData.avoidReturnClaims} onChange={handleChange} />
          </div>
        );
      case 10:
        return (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-serif text-stone-800">Guided Closure Preferences</h3>
            <p className="text-sm text-stone-500 mb-4">How should the Companion help you during the final days of the 30-day period?</p>
            <SelectGroup
              label="When the persona ends after 30 days, how should the farewell feel? *"
              name="farewellStyle"
              value={formData.farewellStyle}
              onChange={handleChange}
              options={["Gentle and peaceful", "Encouraging and hopeful", "Symbolic and meaningful", "Celebration of memories"]}
            />
            <CheckboxGroup label="Should the Companion help you build healthy coping habits along the way?" name="copingHabits" checked={formData.copingHabits} onChange={handleChange} />
          </div>
        );
      case 11:
        return (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-serif text-stone-800">Crisis-Safety Questions</h3>
            <p className="text-sm text-stone-500 mb-4">Important safety settings for your emotional wellbeing.</p>
            <CheckboxGroup label="Do you want the Companion to check in on how you're coping emotionally?" name="emotionalCheckin" checked={formData.emotionalCheckin} onChange={handleChange} />
            <CheckboxGroup label="Should the Companion offer grounding techniques if you're overwhelmed?" name="groundingTechniques" checked={formData.groundingTechniques} onChange={handleChange} />
            <TextAreaGroup label="How should the Companion respond if you express severe distress? *" name="distressResponse" value={formData.distressResponse} onChange={handleChange} rows={3} />
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 mt-4">
              Important: If you're experiencing a mental health crisis, please contact a mental health professional, crisis hotline, or emergency services immediately. This Companion is not a substitute for professional help.
            </div>

            {/* Terms Acceptance */}
            <div className="mt-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
              <h4 className="font-semibold text-stone-800 mb-4">Legal Agreement Required</h4>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleChange}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-stone-700 leading-relaxed">
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Privacy Policy
                  </button>
                  . I understand that this is a time-limited (30-day) grief support tool and not a substitute for professional mental health care. *
                </span>
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 md:p-8 relative z-20">
      {/* Header with Logo */}
      <div className="w-full max-w-4xl mb-4">
        <RememoryLogo />
      </div>

      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-fade-in">
        <div className="w-full md:w-1/3 bg-stone-900 p-10 md:p-12 text-stone-50 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-indigo-500/30 rounded-full blur-[60px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-rose-500/30 rounded-full blur-[60px] animate-pulse-slow"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white mb-6 border border-white/20 font-serif">
                {step}
              </div>
              {isEditing && (
                <button onClick={handleCancel} className="text-xs text-stone-400 hover:text-white uppercase tracking-widest">
                  Cancel
                </button>
              )}
            </div>

            <h2 className="font-display text-3xl md:text-4xl mb-4 leading-tight">
              Step {step} of 11
            </h2>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-white transition-all duration-500" style={{ width: `${(step / 10) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3 p-8 md:p-16 flex flex-col bg-gradient-to-br from-white to-stone-50 overflow-y-auto max-h-[800px]">
          <form onSubmit={(e) => e.preventDefault()} className="flex-1 flex flex-col justify-center">
            {renderStep()}

            <div className="mt-12 flex justify-end gap-4 items-center">
              {step > 1 && <BackButton onClick={() => setStep((s) => s - 1)} />}
              {step < 11 ? (
                <ActionButton
                  key="continue"
                  type="button"
                  onClick={handleNext}
                >
                  Continue &rarr;
                </ActionButton>
              ) : (
                <ActionButton
                  key="save"
                  type="button"
                  variant="primary"
                  disabled={submitting || !formData.agreedToTerms}
                  onClick={handleSave}
                >
                  {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Persona'}
                </ActionButton>
              )}
            </div>

            {/* Accuracy Reminder */}
            <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-indigo-800 leading-relaxed">
                  <strong className="font-semibold">Tip:</strong> The more accurate and detailed information you provide, the more authentic and meaningful your conversations with the Companion will be.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modals */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  );
};

const InputGroup = ({ label, readOnly, ...props }: any) => (
  <div className="group">
    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-indigo-500 transition-colors">
      {label}
    </label>
    <input
      className={`w-full py-3 px-4 bg-white rounded-xl border border-stone-200 focus:border-indigo-500 outline-none transition-all text-lg text-stone-800 placeholder:text-stone-300 ${readOnly ? 'cursor-not-allowed text-stone-500' : ''
        }`}
      {...props}
    />
  </div>
);

const TextAreaGroup = ({ label, ...props }: any) => (
  <div className="group">
    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-indigo-500 transition-colors">
      {label}
    </label>
    <textarea
      className="w-full p-4 bg-white rounded-xl border border-stone-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-lg text-stone-700 placeholder:text-stone-300 leading-relaxed resize-none"
      {...props}
    />
  </div>
);

const SelectGroup = ({ label, options, ...props }: any) => (
  <div className="group">
    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-indigo-500 transition-colors">
      {label}
    </label>
    <select
      className="w-full p-4 bg-white rounded-xl border border-stone-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-lg text-stone-700"
      {...props}
    >
      <option value="">Select a style...</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);


const CheckboxGroup = ({ label, checked, onChange, name }: any) => (
  <label className="flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200 cursor-pointer hover:border-indigo-300 transition-all">
    <input
      type="checkbox"
      name={name}
      checked={!!checked}
      onChange={onChange}
      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 cursor-pointer"
    />
    <span className="text-stone-700 font-medium">{label}</span>
  </label>
);

const ActionButton = ({ children, onClick, type = 'button', variant = 'primary', disabled = false }: any) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-8 py-4 rounded-full font-medium text-lg transition-all shadow-lg active:scale-95 ${variant === 'primary'
      ? 'bg-stone-900 text-white hover:bg-stone-800 hover:scale-105'
      : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
      } ${disabled ? 'opacity-60 cursor-not-allowed scale-100' : ''}`}
  >
    {children}
  </button>
);

const BackButton = ({ onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    className="px-6 py-4 text-stone-500 font-medium hover:text-stone-800 transition-colors"
  >
    Back
  </button>
);
