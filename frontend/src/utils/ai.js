/**
 * Robust utility to query Pollinations AI text API via secure backend proxy
 * to prevent 429 rate limit errors and hide the API key.
 */

export const generateAI = async (prompt) => {
  try {
    const response = await fetch('/api/public/ai-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (response.ok) {
      const text = await response.text();
      return text;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (err) {
    console.error('Failed to generate AI response via backend proxy:', err.message);
    throw err;
  }
};
