/**
 * Element-level analysis module for SEO Sensei
 * Provides detailed analysis of specific HTML elements and page sections
 */

import { JSDOM } from 'jsdom';

export interface ElementIssue {
  selector: string;
  element: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
  section: 'header' | 'navigation' | 'content' | 'sidebar' | 'footer' | 'general';
}

export interface SectionAnalysis {
  name: string; // e.g., "Header", "Main Content", "Footer"
  score: number;
  issues: ElementIssue[];
  importance: number; // 1-10 scale, how important this section is for SEO
}

export interface ElementAnalysisResult {
  url: string;
  totalElements: number;
  analyzedElements: number;
  elementIssues: ElementIssue[];
  sectionAnalysis: SectionAnalysis[];
  screenshot?: string; // Base64 encoded screenshot (would be set by a browser extension)
}

/**
 * Analyze HTML content at the element level to identify specific SEO issues
 * @param htmlContent The HTML content to analyze
 * @param url The URL of the page being analyzed
 * @returns Detailed analysis of elements with issues
 */
export function analyzePageElements(htmlContent: string, url: string): ElementAnalysisResult {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  
  const elementIssues: ElementIssue[] = [];
  let id = 1;
  
  // Track all analyzed elements
  let analyzedElements = 0;
  let totalElements = 0;
  
  // Identify sections of the page
  const sections: {[key: string]: HTMLElement | null} = {
    header: document.querySelector('header') || document.querySelector('div[role="banner"]') || document.querySelector('.header'),
    navigation: document.querySelector('nav') || document.querySelector('div[role="navigation"]'),
    content: document.querySelector('main') || document.querySelector('div[role="main"]') || document.querySelector('.content'),
    sidebar: document.querySelector('aside') || document.querySelector('.sidebar'),
    footer: document.querySelector('footer') || document.querySelector('div[role="contentinfo"]') || document.querySelector('.footer')
  };
  
  // Initialize section analysis
  const sectionAnalysis: SectionAnalysis[] = [
    { name: "Header", score: 100, issues: [], importance: 8 },
    { name: "Navigation", score: 100, issues: [], importance: 7 },
    { name: "Main Content", score: 100, issues: [], importance: 10 },
    { name: "Sidebar", score: 100, issues: [], importance: 5 },
    { name: "Footer", score: 100, issues: [], importance: 4 },
    { name: "General", score: 100, issues: [], importance: 6 }
  ];
  
  // ======================================
  // Analyze specific elements with selectors
  // ======================================
  
  // Check title tag
  const title = document.querySelector('title');
  analyzedElements++;
  totalElements++;
  if (!title || !title.textContent) {
    const issue: ElementIssue = {
      selector: 'head > title',
      element: 'Title',
      issue: 'Missing page title',
      severity: 'high',
      recommendation: 'Add a descriptive title tag that includes primary keywords',
      section: 'header'
    };
    elementIssues.push(issue);
    const headerSection = sectionAnalysis.find(s => s.name === "Header");
    if (headerSection) {
      headerSection.issues.push(issue);
      headerSection.score -= 25;
    }
  } else if (title.textContent.length < 20) {
    const issue: ElementIssue = {
      selector: 'head > title',
      element: 'Title',
      issue: 'Title is too short',
      severity: 'medium',
      recommendation: 'Create a more descriptive title between 50-60 characters that includes key terms',
      section: 'header'
    };
    elementIssues.push(issue);
    const headerSection = sectionAnalysis.find(s => s.name === "Header");
    if (headerSection) {
      headerSection.issues.push(issue);
      headerSection.score -= 15;
    }
  } else if (title.textContent.length > 60) {
    const issue: ElementIssue = {
      selector: 'head > title',
      element: 'Title',
      issue: 'Title is too long',
      severity: 'low',
      recommendation: 'Keep your title under 60 characters to avoid truncation in search results',
      section: 'header'
    };
    elementIssues.push(issue);
    const headerSection = sectionAnalysis.find(s => s.name === "Header");
    if (headerSection) {
      headerSection.issues.push(issue);
      headerSection.score -= 10;
    }
  }
  
  // Check meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  analyzedElements++;
  totalElements++;
  if (!metaDescription || !metaDescription.getAttribute('content')) {
    const issue: ElementIssue = {
      selector: 'head > meta[name="description"]',
      element: 'Meta Description',
      issue: 'Missing meta description',
      severity: 'high',
      recommendation: 'Add a compelling meta description between 120-158 characters',
      section: 'header'
    };
    elementIssues.push(issue);
    const headerSection = sectionAnalysis.find(s => s.name === "Header");
    if (headerSection) {
      headerSection.issues.push(issue);
      headerSection.score -= 25;
    }
  } else if ((metaDescription.getAttribute('content') || '').length < 70) {
    const issue: ElementIssue = {
      selector: 'head > meta[name="description"]',
      element: 'Meta Description',
      issue: 'Meta description is too short',
      severity: 'medium',
      recommendation: 'Create a more compelling meta description between 120-158 characters',
      section: 'header'
    };
    elementIssues.push(issue);
    const headerSection = sectionAnalysis.find(s => s.name === "Header");
    if (headerSection) {
      headerSection.issues.push(issue);
      headerSection.score -= 15;
    }
  } else if ((metaDescription.getAttribute('content') || '').length > 160) {
    const issue: ElementIssue = {
      selector: 'head > meta[name="description"]',
      element: 'Meta Description',
      issue: 'Meta description is too long',
      severity: 'low',
      recommendation: 'Keep meta description under 158 characters to avoid truncation',
      section: 'header'
    };
    elementIssues.push(issue);
    const headerSection = sectionAnalysis.find(s => s.name === "Header");
    if (headerSection) {
      headerSection.issues.push(issue);
      headerSection.score -= 10;
    }
  }
  
  // Check for images without alt text
  const images = document.querySelectorAll('img');
  totalElements += images.length;
  images.forEach(img => {
    analyzedElements++;
    if (!img.hasAttribute('alt')) {
      const section = determineSectionForElement(img, sections);
      const issue: ElementIssue = {
        selector: getSelector(img),
        element: 'Image',
        issue: 'Image missing alt text',
        severity: 'medium',
        recommendation: 'Add descriptive alt text to the image that includes relevant keywords',
        section
      };
      elementIssues.push(issue);
      const sectionObj = sectionAnalysis.find(s => s.name === capitalizeFirstLetter(section));
      if (sectionObj) {
        sectionObj.issues.push(issue);
        sectionObj.score -= 10;
      }
    }
  });
  
  // Check for heading structure
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  totalElements += headings.length;
  let h1Count = 0;
  let previousHeadingLevel = 0;
  
  headings.forEach(heading => {
    analyzedElements++;
    const level = parseInt(heading.tagName.substring(1));
    
    if (level === 1) {
      h1Count++;
      if (h1Count > 1) {
        const section = determineSectionForElement(heading, sections);
        const issue: ElementIssue = {
          selector: getSelector(heading),
          element: 'H1 Heading',
          issue: 'Multiple H1 headings',
          severity: 'medium',
          recommendation: 'Use only one H1 heading as the main title of your page',
          section
        };
        elementIssues.push(issue);
        const sectionObj = sectionAnalysis.find(s => s.name === capitalizeFirstLetter(section));
        if (sectionObj) {
          sectionObj.issues.push(issue);
          sectionObj.score -= 15;
        }
      }
    }
    
    // Check for skipped heading levels
    if (previousHeadingLevel > 0 && level > previousHeadingLevel + 1) {
      const section = determineSectionForElement(heading, sections);
      const issue: ElementIssue = {
        selector: getSelector(heading),
        element: `H${level} Heading`,
        issue: `Skipped heading level (H${previousHeadingLevel} to H${level})`,
        severity: 'low',
        recommendation: 'Maintain proper heading hierarchy (H1 → H2 → H3) to improve page structure',
        section
      };
      elementIssues.push(issue);
      const sectionObj = sectionAnalysis.find(s => s.name === capitalizeFirstLetter(section));
      if (sectionObj) {
        sectionObj.issues.push(issue);
        sectionObj.score -= 5;
      }
    }
    
    previousHeadingLevel = level;
  });
  
  // Check for missing H1
  if (h1Count === 0) {
    const issue: ElementIssue = {
      selector: 'body',
      element: 'H1 Heading',
      issue: 'Missing H1 heading',
      severity: 'high',
      recommendation: 'Add an H1 heading as the main title of your page',
      section: 'content'
    };
    elementIssues.push(issue);
    const contentSection = sectionAnalysis.find(s => s.name === "Main Content");
    if (contentSection) {
      contentSection.issues.push(issue);
      contentSection.score -= 20;
    }
  }
  
  // Check for links without descriptive text
  const links = document.querySelectorAll('a[href]');
  totalElements += links.length;
  links.forEach(link => {
    analyzedElements++;
    if (!link.textContent || link.textContent.trim().length === 0 || 
        link.textContent.trim().toLowerCase() === 'click here' || 
        link.textContent.trim().toLowerCase() === 'read more') {
      const section = determineSectionForElement(link, sections);
      const issue: ElementIssue = {
        selector: getSelector(link),
        element: 'Link',
        issue: link.textContent ? 'Non-descriptive link text' : 'Link missing text content',
        severity: 'medium',
        recommendation: 'Use descriptive link text that explains where the link will take users',
        section
      };
      elementIssues.push(issue);
      const sectionObj = sectionAnalysis.find(s => s.name === capitalizeFirstLetter(section));
      if (sectionObj) {
        sectionObj.issues.push(issue);
        sectionObj.score -= 10;
      }
    }
  });
  
  // Check for long paragraphs (readability issue)
  const paragraphs = document.querySelectorAll('p');
  totalElements += paragraphs.length;
  paragraphs.forEach(p => {
    analyzedElements++;
    if (p.textContent && p.textContent.length > 300) {
      const section = determineSectionForElement(p, sections);
      const issue: ElementIssue = {
        selector: getSelector(p),
        element: 'Paragraph',
        issue: 'Long paragraph (over 300 characters)',
        severity: 'low',
        recommendation: 'Break long paragraphs into smaller chunks for better readability',
        section
      };
      elementIssues.push(issue);
      const sectionObj = sectionAnalysis.find(s => s.name === capitalizeFirstLetter(section));
      if (sectionObj) {
        sectionObj.issues.push(issue);
        sectionObj.score -= 5;
      }
    }
  });
  
  // Ensure all section scores are within 0-100 range
  sectionAnalysis.forEach(section => {
    section.score = Math.max(0, Math.min(100, section.score));
  });
  
  return {
    url,
    totalElements,
    analyzedElements,
    elementIssues,
    sectionAnalysis
  };
}

/**
 * Determine which section of the page an element belongs to
 */
function determineSectionForElement(element: Element, sections: {[key: string]: HTMLElement | null}): 'header' | 'navigation' | 'content' | 'sidebar' | 'footer' | 'general' {
  for (const [sectionName, sectionElement] of Object.entries(sections)) {
    if (sectionElement && sectionElement.contains(element)) {
      return sectionName as 'header' | 'navigation' | 'content' | 'sidebar' | 'footer' | 'general';
    }
  }
  return 'general';
}

/**
 * Get a CSS selector for an element
 * This is a simplified version; a real implementation would generate more precise selectors
 */
function getSelector(element: Element): string {
  let selector = element.tagName.toLowerCase();
  if (element.id) {
    selector += `#${element.id}`;
  } else if (element.classList.length > 0) {
    selector += `.${Array.from(element.classList).join('.')}`;
  }
  return selector;
}

/**
 * Capitalize the first letter of a string
 */
function capitalizeFirstLetter(string: string): string {
  if (string === 'header') return 'Header';
  if (string === 'navigation') return 'Navigation';
  if (string === 'content') return 'Main Content';
  if (string === 'sidebar') return 'Sidebar';
  if (string === 'footer') return 'Footer';
  return 'General';
}
