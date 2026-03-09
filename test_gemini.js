
require('dotenv').config({ path: 'backend/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  const apiKey = process.env.LLM_API_KEY;
  const modelName = process.env.LLM_MODEL;

  console.log(`Testing Gemini API...`);
  console.log(`API Key: ${apiKey ? 'Present' : 'Missing'}`);
  console.log(`Model: ${modelName}`);

  if (!apiKey) {
    console.error('Error: LLM_API_KEY is missing.');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  try {
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    console.log('Success! Response:', response.text());
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    if (error.response) {
        console.error('Error Details:', JSON.stringify(error.response, null, 2));
    }
  }
}

testGemini();
