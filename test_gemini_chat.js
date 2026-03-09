
require('dotenv').config({ path: 'backend/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiChat() {
  const apiKey = process.env.LLM_API_KEY;
  const modelName = process.env.LLM_MODEL;

  console.log(`Testing Gemini Chat...`);
  console.log(`Model: ${modelName}`);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    systemInstruction: "You are a helpful assistant."
  });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Hi there!" }],
      },
    ],
  });

  try {
    const result = await chat.sendMessage("How are you?");
    const response = await result.response;
    console.log('Success! Response:', response.text());
  } catch (error) {
    console.error('Gemini Chat Error:', error.message);
    if (error.response) {
        console.error('Error Details:', JSON.stringify(error.response, null, 2));
    }
  }
}

testGeminiChat();
