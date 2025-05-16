import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from './env-config';

interface SeoIssue {
  id: number;
  severity: string;
  title: string;
  description: string;
  howToFix: string;
}

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

/**
 * Generate AI-powered SEO suggestions based on the identified issues
 * @param url The URL or content being analyzed
 * @param issues List of SEO issues identified
 * @param metadata Optional metadata about the content
 * @returns Array of AI-generated suggestions
 */
export async function generateAiSuggestions(
  url: string, 
  issues: SeoIssue[],
  metadata?: any
): Promise<string[]> {
  try {
    // Skip if no Gemini API key is provided
    if (!ENV.GEMINI_API_KEY) {
      return generateFallbackSuggestions(issues);
    }

    // Create a prompt based on the issues and metadata
    const prompt = createSeoPrompt(url, issues, metadata);
    
    // Use Gemini Pro model for text-based tasks
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Generate content with the model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response into an array of suggestions
    return parseSuggestions(text);
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    // Fall back to rule-based suggestions if AI fails
    return generateFallbackSuggestions(issues);
  }
}

/**
 * Create a detailed prompt for the AI model based on the SEO issues found
 */
function createSeoPrompt(url: string, issues: SeoIssue[], metadata?: any): string {
  const issuesList = issues.map(issue => 
    `- ${issue.severity.toUpperCase()} SEVERITY: ${issue.title} - ${issue.description}`
  ).join('\\n');
  
  let metadataInfo = "";
  if (metadata) {
    if (metadata.title) metadataInfo += `Title: "${metadata.title}"\\n`;
    if (metadata.description) metadataInfo += `Meta Description: "${metadata.description}"\\n`;
    if (metadata.keywords && metadata.keywords.length) {
      metadataInfo += `Keywords: ${metadata.keywords.join(', ')}\\n`;
    }
  }
  
  return `You are an SEO expert analyzing the website: ${url}
  
The following SEO issues have been identified:
${issuesList}

${metadataInfo ? `Additional metadata:\\n${metadataInfo}` : ''}

Based on these issues, provide 4-6 specific, actionable suggestions to improve the website's SEO. 
Format your response as a numbered list of concise, specific recommendations that address the identified issues.
Each suggestion should be clear, actionable, and focused on measurable improvements.
  
For example:
1. [Your first suggestion]
2. [Your second suggestion]
...`;
}

/**
 * Parse AI response into an array of suggestions
 */
function parseSuggestions(text: string): string[] {
  // Clean up the response and extract suggestions
  const lines = text.split('\\n').filter(line => line.trim().length > 0);
  
  // Look for numbered lines (1. Something, 2. Something, etc.)
  const suggestions = lines
    .filter(line => /^\d+\./.test(line.trim()))
    .map(line => {
      // Remove the number prefix and trim
      return line.replace(/^\d+\.\s*/, '').trim();
    });
  
  // If we couldn't find properly formatted suggestions, return whole text split by lines
  if (suggestions.length === 0) {
    return lines.slice(0, 5);  // Take at most 5 lines
  }
  
  return suggestions;
}

/**
 * Generate fallback suggestions based on the identified issues
 * Used when AI generation fails or is not available
 */
function generateFallbackSuggestions(issues: SeoIssue[]): string[] {
  const suggestions: string[] = [];
  
  // Add issue-specific suggestions
  issues.forEach(issue => {
    if (issue.title.includes("meta description")) {
      suggestions.push("Write compelling meta descriptions (150-160 characters) that include keywords and a call to action");
    }
    if (issue.title.includes("alt text")) {
      suggestions.push("Add descriptive alt text to all images that includes relevant keywords while accurately describing the image");
    }
    if (issue.title.includes("heading")) {
      suggestions.push("Restructure your headings to follow a logical hierarchy (H1 → H2 → H3) and include target keywords");
    }
    if (issue.title.includes("page load")) {
      suggestions.push("Optimize images, minify CSS/JS, and leverage browser caching to improve page load speed");
    }
    if (issue.title.includes("mobile")) {
      suggestions.push("Improve mobile responsiveness with a mobile-first design approach and test across multiple devices");
    }
  });
  
  // Add general SEO suggestions to ensure we have enough
  const generalSuggestions = [
    "Implement schema markup (structured data) to help search engines understand your content better",
    "Create a comprehensive XML sitemap and submit it to Google Search Console",
    "Improve internal linking structure to help search engines discover and rank your important pages",
    "Add canonical tags to prevent duplicate content issues",
    "Create more in-depth content that thoroughly addresses user intent",
    "Optimize your title tags to include primary keywords near the beginning",
    "Secure your website with HTTPS if not already implemented"
  ];
  
  // Add general suggestions if we don't have enough issue-specific ones
  while (suggestions.length < 4) {
    const randomIndex = Math.floor(Math.random() * generalSuggestions.length);
    const suggestion = generalSuggestions[randomIndex];
    
    // Only add if not already included
    if (!suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  }
  
  return suggestions.slice(0, 6); // Return at most 6 suggestions
}
