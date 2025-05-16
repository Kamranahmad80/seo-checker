// Environment variables configuration with hardcoded fallbacks for development
// In production, these should be properly set in environment variables

export const ENV = {
  // Gemini API key - in production, use process.env.GEMINI_API_KEY
  GEMINI_API_KEY: "AIzaSyBdJHjDR_uUj3N7dm5lZg7Sxo_yLbJIFsc",
  
  // PageSpeed Insights API key (optional, can work without key with lower rate limits)
  PAGESPEED_API_KEY: "",
  
  // GitHub API settings
  GITHUB_TOKEN: "" // Optional for higher rate limits on public repos
};

// Function to check if required environment variables are set
export function checkRequiredEnv(): boolean {
  if (!ENV.GEMINI_API_KEY) {
    console.warn("Gemini API key not set. AI-powered suggestions will not work properly.");
    return false;
  }
  return true;
}
