
const persona = {
  keyMemories: undefined,
  commonPhrases: null
};

try {
  const prompt = `
    Memories: ${(persona.keyMemories || []).join(' | ')}
    Phrases: ${(persona.commonPhrases || []).join(' | ')}
  `;
  console.log("Success:", prompt);
} catch (e) {
  console.error("Crash:", e.message);
}
