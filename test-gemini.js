require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  console.log('Testing API key:', apiKey.substring(0, 20) + '...');
  console.log('');

  // Try to list available models using REST API
  try {
    console.log('Attempting to list models via REST API...');
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    console.log('✅ Available models:');
    response.data.models.forEach(model => {
      console.log(`  - ${model.name}`);
    });
    console.log('');
  } catch (e) {
    console.log('❌ Failed to list models:', e.response?.data || e.message);
    console.log('');
  }

  // Try various model names
  const modelsToTest = [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-pro',
    'models/gemini-pro',
    'models/gemini-1.5-flash-latest'
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello");
      console.log(`✅ ${modelName} works!`);
      console.log(`Response: ${result.response.text()}`);
      console.log('');
      break; // Stop on first success
    } catch (e) {
      console.log(`❌ ${modelName} failed: ${e.message}`);
    }
  }
}

listModels();
