import { JSDOM } from 'jsdom';

interface HtmlAnalysisResult {
  title: string;
  description: string;
  keywords: string[];
  ogTags: Record<string, string>;
  issues: {
    id: number;
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    howToFix: string;
  }[];
  headings: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
    structure: string[];
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    withEmptyAlt: number;
  };
  links: {
    total: number;
    internal: number;
    external: number;
  };
}

/**
 * Analyze HTML content for SEO issues and optimizations
 * @param htmlContent The HTML content to analyze
 * @param url Optional URL for reference
 * @returns Analysis of the HTML content for SEO purposes
 */
export function analyzeHtmlContent(htmlContent: string, url: string = ''): HtmlAnalysisResult {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  const issues: HtmlAnalysisResult['issues'] = [];
  let id = 1;
  
  // Extract metadata
  const title = document.querySelector('title')?.textContent || '';
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
  const keywords = metaKeywords.split(',').map(k => k.trim()).filter(Boolean);
  
  // Extract Open Graph tags
  const ogTags: Record<string, string> = {};
  document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
    const property = tag.getAttribute('property');
    const content = tag.getAttribute('content');
    if (property && content) {
      ogTags[property.replace('og:', '')] = content;
    }
  });
  
  // Analyze headings
  const h1Elements = document.querySelectorAll('h1');
  const h2Elements = document.querySelectorAll('h2');
  const h3Elements = document.querySelectorAll('h3');
  const h4Elements = document.querySelectorAll('h4');
  const h5Elements = document.querySelectorAll('h5');
  const h6Elements = document.querySelectorAll('h6');
  
  const headingStructure: string[] = [];
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
    headingStructure.push(`${heading.tagName}: ${heading.textContent?.trim() || 'Empty heading'}`);
  });
  
  const headings = {
    h1: h1Elements.length,
    h2: h2Elements.length,
    h3: h3Elements.length,
    h4: h4Elements.length,
    h5: h5Elements.length,
    h6: h6Elements.length,
    structure: headingStructure
  };
  
  // Analyze images
  const allImages = document.querySelectorAll('img');
  const imagesWithAlt = document.querySelectorAll('img[alt]:not([alt=""])');
  const imagesWithEmptyAlt = document.querySelectorAll('img[alt=""]');
  
  const images = {
    total: allImages.length,
    withAlt: imagesWithAlt.length,
    withoutAlt: allImages.length - imagesWithAlt.length - imagesWithEmptyAlt.length,
    withEmptyAlt: imagesWithEmptyAlt.length
  };
  
  // Analyze links
  const allLinks = document.querySelectorAll('a[href]');
  let internalLinks = 0;
  let externalLinks = 0;
  
  allLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#') || href.startsWith('/') || (url && href.includes(new URL(url).hostname))) {
      internalLinks++;
    } else if (href.startsWith('http')) {
      externalLinks++;
    }
  });
  
  const links = {
    total: allLinks.length,
    internal: internalLinks,
    external: externalLinks
  };
  
  // Check for common SEO issues
  
  // Title issues
  if (!title) {
    issues.push({
      id: id++,
      severity: 'high',
      title: 'Missing page title',
      description: 'Your page is missing a title tag, which is critical for SEO.',
      howToFix: 'Add a descriptive title tag within the <head> section of your HTML.'
    });
  } else if (title.length < 10) {
    issues.push({
      id: id++,
      severity: 'medium',
      title: 'Title too short',
      description: `Your title tag is only ${title.length} characters long, which may not be descriptive enough.`,
      howToFix: 'Create a more descriptive title between 50-60 characters that includes key terms.'
    });
  } else if (title.length > 60) {
    issues.push({
      id: id++,
      severity: 'low',
      title: 'Title too long',
      description: `Your title tag is ${title.length} characters long, which may be truncated in search results.`,
      howToFix: 'Keep your title under 60 characters while maintaining key information.'
    });
  }
  
  // Meta description issues
  if (!metaDescription) {
    issues.push({
      id: id++,
      severity: 'high',
      title: 'Missing meta description',
      description: 'Your page is missing a meta description, which is important for SEO and click-through rates in search results.',
      howToFix: 'Add a meta description tag with a compelling summary of your page (around 150-160 characters).'
    });
  } else if (metaDescription.length < 50) {
    issues.push({
      id: id++,
      severity: 'medium',
      title: 'Meta description too short',
      description: `Your meta description is only ${metaDescription.length} characters long, which may not adequately describe your page.`,
      howToFix: 'Write a more descriptive meta description between 120-158 characters.'
    });
  } else if (metaDescription.length > 160) {
    issues.push({
      id: id++,
      severity: 'low',
      title: 'Meta description too long',
      description: `Your meta description is ${metaDescription.length} characters long and may be truncated in search results.`,
      howToFix: 'Keep your meta description under 158 characters while maintaining key information.'
    });
  }
  
  // Heading structure issues
  if (h1Elements.length === 0) {
    issues.push({
      id: id++,
      severity: 'high',
      title: 'Missing H1 heading',
      description: 'Your page does not have an H1 heading, which is important for page structure and SEO.',
      howToFix: 'Add a descriptive H1 heading that contains your primary keyword.'
    });
  } else if (h1Elements.length > 1) {
    issues.push({
      id: id++,
      severity: 'medium',
      title: 'Multiple H1 headings',
      description: `Your page has ${h1Elements.length} H1 headings. It's generally best to have a single H1.`,
      howToFix: 'Use only one H1 heading as the main title of your page and use H2-H6 for subheadings.'
    });
  }
  
  // Check for heading hierarchy issues
  if (h1Elements.length === 0 && h2Elements.length > 0) {
    issues.push({
      id: id++,
      severity: 'medium',
      title: 'H2 without H1',
      description: 'Your page uses H2 headings without an H1 heading.',
      howToFix: 'Add an H1 heading as the main title of your page before using H2 headings.'
    });
  }
  
  if (h2Elements.length === 0 && h3Elements.length > 0) {
    issues.push({
      id: id++,
      severity: 'low',
      title: 'H3 without H2',
      description: 'Your page uses H3 headings without H2 headings, which creates a gap in the heading hierarchy.',
      howToFix: 'Maintain proper heading hierarchy (H1 → H2 → H3) to improve page structure.'
    });
  }
  
  // Image issues
  if (images.total > 0 && images.withoutAlt > 0) {
    issues.push({
      id: id++,
      severity: 'medium',
      title: 'Images missing alt text',
      description: `${images.withoutAlt} out of ${images.total} images are missing alt text, which is important for accessibility and SEO.`,
      howToFix: 'Add descriptive alt attributes to all images that describe the content and function of the image.'
    });
  }
  
  // Link issues
  const linksWithoutText = Array.from(allLinks).filter(link => !link.textContent?.trim()).length;
  if (linksWithoutText > 0) {
    issues.push({
      id: id++,
      severity: 'medium',
      title: 'Links without text',
      description: `${linksWithoutText} links on your page have no text content, which is bad for accessibility and SEO.`,
      howToFix: 'Add descriptive text to all links to help users and search engines understand their purpose.'
    });
  }
  
  // Check for mobile viewport
  if (!document.querySelector('meta[name="viewport"]')) {
    issues.push({
      id: id++,
      severity: 'high',
      title: 'Missing viewport meta tag',
      description: 'Your page is missing the viewport meta tag, which is essential for mobile responsiveness.',
      howToFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the <head> section.'
    });
  }
  
  // Check for structured data
  const hasStructuredData = 
    !!document.querySelector('script[type="application/ld+json"]') || 
    Array.from(document.querySelectorAll('[itemscope], [itemprop]')).length > 0;
    
  if (!hasStructuredData) {
    issues.push({
      id: id++,
      severity: 'medium',
      title: 'Missing structured data',
      description: 'Your page does not appear to use structured data (schema.org) markup.',
      howToFix: 'Implement relevant schema.org markup to enhance your search engine listings with rich results.'
    });
  }
  
  return {
    title,
    description: metaDescription,
    keywords,
    ogTags,
    issues,
    headings,
    images,
    links
  };
}

/**
 * Check if the provided content appears to be valid HTML
 */
export function isValidHtml(content: string): boolean {
  // Simple checks to determine if string is likely HTML
  return content.includes('<html') && 
         content.includes('<head') && 
         content.includes('<body') &&
         content.includes('</html>');
}
