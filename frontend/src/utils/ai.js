/**
 * Robust utility to query Pollinations AI text API with model rotation,
 * random seeding, and exponential backoff to handle rate limits (429 errors).
 */

const MODELS = ['openai', 'mistral', 'qwen-coder', 'gemma', 'gemini'];

export const generateAI = async (prompt) => {
  let lastError = null;

  for (const model of MODELS) {
    let retries = 2; // Retry twice per model
    let delay = 1000; // Start with 1s delay
    
    while (retries > 0) {
      try {
        const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=${model}&seed=${Math.floor(Math.random() * 1000000)}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const text = await response.text();
          // Verify we didn't get a JSON error response disguised as 200 OK
          if (text && !text.trim().startsWith('{"error":') && !text.includes('"status":429')) {
            return text;
          } else {
            throw new Error(text || "API returned error JSON");
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        lastError = err;
        console.warn(`AI model "${model}" failed. Retries left: ${retries - 1}. Error:`, err.message);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }
    // Proceed to next model in list if current model failed after all retries
  }
  
  throw lastError || new Error("All AI models failed to generate response.");
};
