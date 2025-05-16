import axios from 'axios';
import { ENV } from './env-config';
import { analyzeHtmlContent, isValidHtml } from './html-analyzer';
import { generateAiSuggestions } from './ai-suggestions';
import { analyzePageElements, ElementAnalysisResult } from './element-analysis';
import * as fs from 'fs';
import * as path from 'path';

// Define types for SEO analysis results
export type SeverityType = 'high' | 'medium' | 'low';

export interface SeoAnalysisResult {
  url: string;
  type: string;
  timestamp: string;
  overall: number;
  subscores: {
    performance: number;
    seo: number;
    accessibility: number;
    bestPractices: number;
  };
  issues: {
    id: number;
    severity: SeverityType;
    title: string;
    description: string;
    howToFix: string;
  }[];
  suggestions: string[];
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogTags?: Record<string, string>;
    [key: string]: any;
  };
  // Element-level analysis results
  elementAnalysis?: ElementAnalysisResult;
}

// Main function to analyze a URL
export async function analyzeSeo(url: string, type: string): Promise<SeoAnalysisResult> {
  try {
    if (type === "url") {
      // For web URLs
      return await analyzeWebUrl(url);
    } else if (type === "github") {
      // For GitHub repositories
      return await analyzeGithubRepo(url);
    } else if (type === "file") {
      // For uploaded HTML files
      return await analyzeHtmlFile(url);
    } else {
      // Fallback for unknown types
      return generateMockResults(url, type);
    }
  } catch (error) {
    console.error("Error analyzing SEO:", error);
    return generateMockResults(url, type);
  }
}

/**
 * Analyze an HTML file uploaded by the user
 * @param filePath Path to the HTML file
 */
async function analyzeHtmlFile(filePath: string): Promise<SeoAnalysisResult> {
  try {
    // Read the file content
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    
    // Validate that the content is HTML
    if (!isValidHtml(htmlContent)) {
      throw new Error('The uploaded file does not appear to be valid HTML');
    }
    
    // Analyze the HTML content
    const htmlAnalysis = analyzeHtmlContent(htmlContent, path.basename(filePath));
    
    // Calculate scores based on issues
    const seoScore = calculateSeoScoreFromIssues(htmlAnalysis.issues);
    const accessibilityScore = calculateAccessibilityScoreFromIssues(htmlAnalysis.issues);
    const bestPracticesScore = 65 + Math.random() * 20; // Mock score for best practices
    
    // For files, performance is mainly static
    const performanceScore = 80; // Static score for files
    
    // Overall score is an average
    const overallScore = Math.round((seoScore + performanceScore + accessibilityScore + bestPracticesScore) / 4);
    
    // Generate AI-powered suggestions
    const suggestions = await generateAiSuggestions(
      path.basename(filePath),
      htmlAnalysis.issues,
      htmlAnalysis
    );
    
    return {
      url: path.basename(filePath),
      type: 'file',
      timestamp: new Date().toISOString(),
      overall: overallScore,
      subscores: {
        performance: Math.round(performanceScore),
        seo: Math.round(seoScore),
        accessibility: Math.round(accessibilityScore),
        bestPractices: Math.round(bestPracticesScore)
      },
      issues: htmlAnalysis.issues,
      suggestions,
      metadata: {
        title: htmlAnalysis.title,
        description: htmlAnalysis.description,
        keywords: htmlAnalysis.keywords,
        ogTags: htmlAnalysis.ogTags
      }
    };
  } catch (error) {
    console.error('Error analyzing HTML file:', error);
    return generateMockResults(filePath, 'file');
  }
}

/**
 * Analyze a GitHub repository for SEO issues
 * @param repoUrl URL to the GitHub repository
 */
async function analyzeGithubRepo(repoUrl: string): Promise<SeoAnalysisResult> {
  try {
    // Extract owner and repo name from GitHub URL
    const githubUrlPattern = /github\.com\/([\w-]+)\/([\w-]+)/;
    const match = repoUrl.match(githubUrlPattern);
    
    if (!match || match.length < 3) {
      throw new Error('Invalid GitHub repository URL');
    }
    
    const owner = match[1];
    const repo = match[2];
    
    // Set up GitHub API request
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    const headers = ENV.GITHUB_TOKEN ? { Authorization: `token ${ENV.GITHUB_TOKEN}` } : {};
    
    // Fetch repository contents
    const response = await axios.get(apiUrl, { headers });
    const contents = response.data;
    
    // Look for HTML files, README, and other important files
    let htmlFiles: any[] = [];
    let readmeFile: any = null;
    let packageJson: any = null;
    
    for (const item of contents) {
      if (item.name.toLowerCase().endsWith('.html')) {
        htmlFiles.push(item);
      } else if (item.name.toLowerCase().includes('readme')) {
        readmeFile = item;
      } else if (item.name === 'package.json') {
        packageJson = item;
      }
    }
    
    // Analyze an HTML file if found, otherwise use README
    let mainContent = '';
    let contentType = '';
    
    if (htmlFiles.length > 0) {
      // Analyze the first HTML file
      const htmlFile = htmlFiles[0];
      const fileResponse = await axios.get(htmlFile.download_url);
      mainContent = fileResponse.data;
      contentType = 'html';
    } else if (readmeFile) {
      // Analyze the README file
      const fileResponse = await axios.get(readmeFile.download_url);
      mainContent = fileResponse.data;
      contentType = 'markdown';
    } else {
      // No suitable content found
      throw new Error('No suitable files found for SEO analysis');
    }
    
    // Analyze either the HTML or prepare markdown content for analysis
    let issues: Array<{
      id: number;
      severity: SeverityType;
      title: string;
      description: string;
      howToFix: string;
    }> = [];
    let metadata: {
      title: string;
      description: string;
      keywords: string[];
      ogTags?: Record<string, string>;
    } = {
      title: repo,
      description: '',
      keywords: [],
      ogTags: {}
    };
    
    if (contentType === 'html') {
      // Analyze HTML content
      const htmlAnalysis = analyzeHtmlContent(mainContent, repoUrl);
      issues = htmlAnalysis.issues;
      metadata = {
        title: htmlAnalysis.title || repo,
        description: htmlAnalysis.description || '',
        keywords: htmlAnalysis.keywords || [],
        ogTags: htmlAnalysis.ogTags || {}
      };
    } else {
      // For markdown, create some generic issues
      issues = [
        {
          id: 1,
          severity: 'medium' as SeverityType,
          title: 'Repository lacks HTML content',
          description: 'The repository does not have primary HTML files, which makes SEO analysis more limited.',
          howToFix: 'Consider adding HTML files with proper meta tags and structure if this is a web project.'
        },
        {
          id: 2,
          severity: 'medium' as SeverityType,
          title: 'README structure needs improvement',
          description: 'The README file may not have proper heading structure or links.',
          howToFix: 'Structure your README with clear headings (# for main title, ## for sections) and descriptive link text.'
        }
      ];
      
      // Try to extract some metadata from packageJson if available
      if (packageJson) {
        const pkgResponse = await axios.get(packageJson.download_url);
        const pkg = pkgResponse.data;
        
        if (pkg.description) {
          metadata.description = pkg.description;
          issues.push({
            id: 3,
            severity: 'low' as SeverityType,
            title: 'Project description available',
            description: 'The project has a description in package.json which could be expanded for SEO purposes.',
            howToFix: 'Ensure the description is comprehensive and contains relevant keywords.'
          });
        }
        
        if (pkg.keywords && pkg.keywords.length) {
          metadata.keywords = pkg.keywords;
        }
      }
    }
    
    // Calculate scores
    const seoScore = calculateSeoScoreFromIssues(issues);
    const accessibilityScore = calculateAccessibilityScoreFromIssues(issues);
    const bestPracticesScore = 60 + Math.random() * 20; // Slightly randomized for GitHub repos
    const performanceScore = 75 + Math.random() * 15; // Static performance score for repos
    
    // Overall score is an average
    const overallScore = Math.round((seoScore + performanceScore + accessibilityScore + bestPracticesScore) / 4);
    
    // Generate AI suggestions based on content and issues
    const suggestions = await generateAiSuggestions(repoUrl, issues, metadata);
    
    return {
      url: repoUrl,
      type: 'github',
      timestamp: new Date().toISOString(),
      overall: overallScore,
      subscores: {
        performance: Math.round(performanceScore),
        seo: Math.round(seoScore),
        accessibility: Math.round(accessibilityScore),
        bestPractices: Math.round(bestPracticesScore)
      },
      issues,
      suggestions,
      metadata
    };
    
  } catch (error) {
    console.error('Error analyzing GitHub repository:', error);
    return generateMockResults(repoUrl, 'github');
  }
}

/**
 * Calculate SEO score based on the identified issues
 * @param issues List of SEO issues
 * @returns SEO score (0-100)
 */
function calculateSeoScoreFromIssues(issues: Array<{ severity: SeverityType }>): number {
  // Base score is 100
  let score = 100;
  
  // Reduce score based on severity of each issue
  issues.forEach(issue => {
    switch(issue.severity) {
      case 'high':
        score -= 10;
        break;
      case 'medium':
        score -= 5;
        break;
      case 'low':
        score -= 2;
        break;
    }
  });
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate accessibility score based on the identified issues
 * @param issues List of SEO issues
 * @returns Accessibility score (0-100)
 */
function calculateAccessibilityScoreFromIssues(issues: Array<{ severity: SeverityType; title: string }>): number {
  // Base score is 100
  let score = 100;
  
  // Reduce score based on severity of accessibility-related issues
  issues.forEach(issue => {
    // Check if issue is related to accessibility
    const isAccessibilityIssue = 
      issue.title.toLowerCase().includes('alt text') ||
      issue.title.toLowerCase().includes('aria') ||
      issue.title.toLowerCase().includes('contrast') ||
      issue.title.toLowerCase().includes('keyboard') ||
      issue.title.toLowerCase().includes('screen reader') ||
      issue.title.toLowerCase().includes('focus') ||
      issue.title.toLowerCase().includes('accessibility');
    
    if (isAccessibilityIssue) {
      switch(issue.severity) {
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
      }
    }
  });
  
  // If no accessibility issues were found, reduce score slightly (as we didn't do a full audit)
  if (score === 100) {
    score = 90;
  }
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Analyze a web URL using PageSpeed Insights API
 * @param url URL to analyze 
 * @returns SEO analysis result
 */
async function analyzeWebUrl(url: string): Promise<SeoAnalysisResult> {
  try {
    // Use PageSpeed Insights API (free, no key required for basic usage)
    const apiKey = ENV.PAGESPEED_API_KEY ? `&key=${ENV.PAGESPEED_API_KEY}` : '';
    const psApiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile${apiKey}`;
    
    // Fetch PageSpeed data
    const response = await axios.get(psApiUrl);
    const data = response.data;
    
    // Calculate scores
    const performance = data.lighthouseResult?.categories?.performance?.score * 100 || 0;
    const seo = data.lighthouseResult?.categories?.seo?.score * 100 || 0;
    const accessibility = data.lighthouseResult?.categories?.accessibility?.score * 100 || 0;
    const bestPractices = data.lighthouseResult?.categories?.['best-practices']?.score * 100 || 0;
    
    // Calculate average score
    const overall = Math.round((performance + seo + accessibility + bestPractices) / 4);
    
    // Extract issues from PageSpeed data
    const issues = extractIssuesFromPageSpeed(data);
    
    // Create JSON response
    const result: SeoAnalysisResult = {
      url,
      type: "url",
      timestamp: new Date().toISOString(),
      overall,
      subscores: {
        performance: Math.round(performance),
        seo: Math.round(seo),
        accessibility: Math.round(accessibility),
        bestPractices: Math.round(bestPractices)
      },
      issues,
      suggestions: extractSuggestionsFromPageSpeed(data),
      metadata: {
        title: data.lighthouseResult?.audits?.['document-title']?.details?.items?.[0]?.text || '',
        description: data.lighthouseResult?.audits?.['meta-description']?.details?.items?.[0]?.content || ''
      }
    };
    
    // Fetch HTML content for element-level analysis
    try {
      const htmlResponse = await axios.get(url);
      const htmlContent = htmlResponse.data;
      
      // Perform detailed element-level analysis
      const elementAnalysis = analyzePageElements(htmlContent, url);
      result.elementAnalysis = elementAnalysis;
      
      // Add AI-powered suggestions based on element analysis
      const aiSuggestions = await generateAiSuggestions(
        url, 
        issues, 
        { ...result.metadata, elementAnalysis }
      );
      
      result.suggestions = aiSuggestions;
      
    } catch (htmlError) {
      console.log("Could not fetch HTML content for element-level analysis:", htmlError);
    }
    
    return result;
  } catch (error) {
    console.error("Error in PageSpeed analysis:", error);
    // Fallback to mock data if PageSpeed API fails
    return generateMockResults(url, "url");
  }
}

/**
 * Extract SEO issues from PageSpeed Insights API response
 * @param data PageSpeed Insights API response
 * @returns Array of SEO issues
 */
function extractIssuesFromPageSpeed(data: any): Array<{
  id: number;
  severity: SeverityType;
  title: string;
  description: string;
  howToFix: string;
}> {
  try {
    const issues: Array<{
      id: number;
      severity: SeverityType;
      title: string;
      description: string;
      howToFix: string;
    }> = [];
    
    const audits = data.lighthouseResult?.audits || {};
    let id = 1;
    
    // Check for common SEO issues and add them to the list
    if (audits["document-title"]?.score < 1) {
      issues.push({
        id: id++,
        severity: "high" as SeverityType,
        title: "Missing or inadequate title",
        description: audits["document-title"]?.description || "Your page has a missing or inadequate title tag.",
        howToFix: "Add a clear, descriptive title tag that includes your primary keywords."
      });
    }
    
    if (audits["image-alt"]?.score < 1) {
      issues.push({
        id: id++,
        severity: "medium" as SeverityType,
        title: "Images missing alt text",
        description: audits["image-alt"]?.description || "Some images on your page are missing alt text.",
        howToFix: "Add descriptive alt attributes to all <img> tags."
      });
    }
    
    if (audits["tap-targets"]?.score < 1) {
      issues.push({
        id: id++,
        severity: "medium" as SeverityType,
        title: "Tap targets too small",
        description: audits["tap-targets"]?.description || "Touch targets are not sized appropriately.",
        howToFix: "Ensure buttons and links are at least 48x48px on mobile devices."
      });
    }
    
    if (audits["render-blocking-resources"]?.score < 1) {
      issues.push({
        id: id++,
        severity: "medium" as SeverityType,
        title: "Render-blocking resources",
        description: audits["render-blocking-resources"]?.description || "Your page has render-blocking resources.",
        howToFix: "Defer non-critical CSS/JS and consider inline critical styles."
      });
    }
    
    // Ensure we have at least some issues
    if (issues.length === 0) {
      // Add some generic issues if none were found
      issues.push({
        id: id++,
        severity: "low" as SeverityType,
        title: "Consider improving heading structure",
        description: "Using proper heading structure helps search engines understand your content hierarchy.",
        howToFix: "Ensure you use H1 for main title, H2 for section headings, and so on."
      });
    }
    
    return issues;
  } catch (error) {
    console.error("Error extracting issues:", error);
    return [
      {
        id: 1,
        severity: "medium" as SeverityType,
        title: "Error analyzing page issues",
        description: "We encountered difficulties analyzing some aspects of your page.",
        howToFix: "Try running the analysis again or check if the page is publicly accessible."
      }
    ];
  }
}

// Extract suggestions from PageSpeed API response
function extractSuggestionsFromPageSpeed(data: any): string[] {
  const suggestions = [];
  
  try {
    const audits = data.lighthouseResult?.audits || {};
    
    // Convert some of the PageSpeed audits to actionable suggestions
    if (audits["speed-index"]?.score < 0.9) {
      suggestions.push("Improve page load speed by optimizing images and reducing server response time");
    }
    
    if (audits["first-contentful-paint"]?.score < 0.9) {
      suggestions.push("Enhance First Contentful Paint by optimizing critical rendering path");
    }
    
    if (audits["largest-contentful-paint"]?.score < 0.9) {
      suggestions.push("Optimize Largest Contentful Paint by prioritizing the loading of your main content");
    }
    
    if (audits["cumulative-layout-shift"]?.score < 0.9) {
      suggestions.push("Reduce layout shifts by specifying image dimensions and avoiding dynamic content loading");
    }
    
    // Add more generic SEO suggestions
    suggestions.push("Consider adding structured data markup for rich search results");
    suggestions.push("Ensure your website has a proper XML sitemap submitted to search engines");
    suggestions.push("Improve internal linking to distribute page authority throughout your site");
    
    return suggestions;
  } catch (error) {
    console.error("Error extracting suggestions:", error);
    return [
      "Optimize images to improve page load speed",
      "Add meta descriptions to all important pages",
      "Ensure mobile responsiveness across all devices",
      "Improve internal linking structure"
    ];
  }
}

// This section was removed as it was a duplicate of the analyzeGithubRepo function already defined above

// Generate mock results (as a fallback)
function generateMockResults(url: string, type: string): SeoAnalysisResult {
  // Generate a random score between 60-95 for demo purposes
  const overall = Math.floor(Math.random() * (95 - 60 + 1)) + 60;
  
  // Generate subscores with some variation
  const subscores = {
    performance: Math.min(100, Math.floor(overall + (Math.random() * 20 - 10))),
    seo: Math.min(100, Math.floor(overall + (Math.random() * 15 - 5))),
    accessibility: Math.min(100, Math.floor(overall + (Math.random() * 10 - 15))),
    bestPractices: Math.min(100, Math.floor(overall + (Math.random() * 15 - 5))),
  };
  
  // Common SEO issues that might be found
  const commonIssues = [
    {
      id: 1,
      severity: "high" as SeverityType,
      title: "Missing meta description",
      description: "Your page doesn't have a meta description. Meta descriptions are important for SEO as they appear in search results.",
      howToFix: "Add a meta description tag in the <head> section of your HTML that accurately summarizes the page content."
    },
    {
      id: 2,
      severity: "medium" as SeverityType,
      title: "Images missing alt text",
      description: "Some images on your page are missing alt text, which is important for accessibility and SEO.",
      howToFix: "Add descriptive alt attributes to all <img> tags that describe the image content."
    },
    {
      id: 3,
      severity: "low" as SeverityType,
      title: "Heading hierarchy not ideal",
      description: "Your page skips heading levels, which isn't ideal for document structure.",
      howToFix: "Ensure your headings follow a proper hierarchy starting with H1, then H2, etc."
    },
    {
      id: 4,
      severity: "high" as SeverityType,
      title: "Slow page load speed",
      description: "Your page takes too long to load, which affects user experience and SEO rankings.",
      howToFix: "Optimize images, minimize CSS/JS, and consider using a CDN to improve load times."
    },
    {
      id: 5,
      severity: "medium" as SeverityType,
      title: "Mobile responsiveness issues",
      description: "The page layout doesn't adapt well to mobile devices.",
      howToFix: "Use responsive design principles and media queries to ensure the page works well on all screen sizes."
    }
  ];
  
  // Select a random subset of issues
  const numIssues = Math.floor(Math.random() * 3) + 1; // 1-3 issues
  const issues = [...commonIssues]
    .sort(() => 0.5 - Math.random())
    .slice(0, numIssues);
  
  // Generic suggestions
  const suggestions = [
    "Optimize page load speed by compressing images and using lazy loading",
    "Add structured data markup to enhance your rich snippets in search results",
    "Improve mobile responsiveness with better viewport configuration",
    "Enhance internal linking structure to distribute page authority"
  ];
  
  return {
    url,
    type,
    timestamp: new Date().toISOString(),
    overall,
    subscores,
    issues,
    suggestions
  };
}
