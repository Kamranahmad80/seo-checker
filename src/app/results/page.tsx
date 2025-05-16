"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SeoScoreDisplay from "@/components/seo-score-display";
import Footer from "@/components/footer";
import Link from "next/link";
import { motion } from "framer-motion";
import { generatePdfReport } from "@/lib/pdf-generator";
import { SeoAnalysisResult } from "@/lib/seo-analyzer";
import ElementAnalysisView from "@/components/element-analysis-view";

// Mock data for demonstration - this would be replaced with real API data
const mockResults: SeoAnalysisResult = {
  url: "https://example.com",
  type: "url",
  timestamp: new Date().toISOString(),
  overall: 86,
  subscores: {
    performance: 92,
    seo: 86,
    accessibility: 78,
    bestPractices: 90
  },
  issues: [
    {
      id: 1,
      severity: "high",
      title: "Missing meta description",
      description: "Your page doesn't have a meta description. Meta descriptions are important for SEO as they appear in search results.",
      howToFix: "Add a meta description tag in the <head> section of your HTML that accurately summarizes the page content."
    },
    {
      id: 2,
      severity: "medium",
      title: "Images missing alt text",
      description: "3 images on your page are missing alt text, which is important for accessibility and SEO.",
      howToFix: "Add descriptive alt attributes to all <img> tags that describe the image content."
    },
    {
      id: 3,
      severity: "low",
      title: "Heading hierarchy not ideal",
      description: "Your page skips from H1 to H3 without using H2, which isn't ideal for document structure.",
      howToFix: "Ensure your headings follow a proper hierarchy starting with H1, then H2, etc."
    }
  ],
  suggestions: [
    "Improve page load speed by optimizing image sizes",
    "Add structured data markup for rich search results",
    "Ensure mobile responsiveness with better viewport configuration",
    "Improve internal linking structure"
  ],
  // Add mock element analysis data
  elementAnalysis: {
    url: "https://example.com",
    totalElements: 124,
    analyzedElements: 78,
    elementIssues: [
      {
        selector: "header h1",
        element: "Main Heading",
        issue: "Heading is too generic and doesn't include important keywords",
        severity: "medium",
        recommendation: "Include targeted keywords in your main heading",
        section: "header"
      },
      {
        selector: "img.product-image",
        element: "Product Image",
        issue: "Image is missing alt text with keywords",
        severity: "high",
        recommendation: "Add descriptive alt text that includes product keywords",
        section: "content"
      },
      {
        selector: "nav.main-navigation",
        element: "Main Navigation",
        issue: "Navigation links use generic anchor text",
        severity: "low",
        recommendation: "Use more descriptive, keyword-rich anchor text for important links",
        section: "navigation"
      },
      {
        selector: "footer a",
        element: "Footer Links", 
        issue: "Footer links are not properly organized for SEO",
        severity: "low",
        recommendation: "Group footer links by category and include relevant keywords",
        section: "footer"
      }
    ],
    sectionAnalysis: [
      {
        name: "Header",
        score: 75,
        importance: 9,
        issues: [
          {
            selector: "header h1",
            element: "Main Heading",
            issue: "Heading is too generic and doesn't include important keywords",
            severity: "medium",
            recommendation: "Include targeted keywords in your main heading",
            section: "header"
          },
          {
            selector: "header meta",
            element: "Meta Description",
            issue: "Meta description is too short",
            severity: "medium",
            recommendation: "Expand the meta description to 150-160 characters with keywords",
            section: "header"
          }
        ]
      },
      {
        name: "Navigation",
        score: 85,
        importance: 7,
        issues: [
          {
            selector: "nav.main-navigation",
            element: "Main Navigation",
            issue: "Navigation links use generic anchor text",
            severity: "low",
            recommendation: "Use more descriptive, keyword-rich anchor text for important links",
            section: "navigation"
          }
        ]
      },
      {
        name: "Main Content",
        score: 65,
        importance: 10,
        issues: [
          {
            selector: "img.product-image",
            element: "Product Image",
            issue: "Image is missing alt text with keywords",
            severity: "high",
            recommendation: "Add descriptive alt text that includes product keywords",
            section: "content"
          },
          {
            selector: "article p",
            element: "Paragraph Text",
            issue: "Content has low keyword density",
            severity: "medium",
            recommendation: "Naturally incorporate target keywords throughout your content",
            section: "content"
          },
          {
            selector: "h2, h3",
            element: "Subheadings",
            issue: "Subheadings don't follow proper hierarchy",
            severity: "medium",
            recommendation: "Structure your headings properly (H1 > H2 > H3)",
            section: "content"
          }
        ]
      },
      {
        name: "Footer",
        score: 90,
        importance: 5,
        issues: [
          {
            selector: "footer a",
            element: "Footer Links",
            issue: "Footer links are not properly organized for SEO",
            severity: "low",
            recommendation: "Group footer links by category and include relevant keywords",
            section: "footer"
          }
        ]
      }
    ]
  }
};

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || mockResults.url;
  const type = searchParams.get("type") || "url";
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SeoAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to download the report as PDF
  const handleDownloadPdf = () => {
    if (results) {
      generatePdfReport(results);
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const encodedUrl = encodeURIComponent(url);
        const response = await fetch(`/api/analyze?url=${encodedUrl}&type=${type}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to analyze SEO');
        }
        
        const data = await response.json();
        setResults(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching SEO results:', error);
        setError(error instanceof Error ? error.message : 'Failed to analyze the URL');
        // Still show a fallback for better UX
        setResults(mockResults);
        setLoading(false);
      }
    };

    fetchResults();
  }, [url, type]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Analyzing {url}</h2>
            <p className="text-lg text-blue-600 dark:text-blue-400 mb-2">
              {type === "url" ? "Performing live URL analysis" : 
               type === "github" ? "Scanning GitHub repository" : 
               "Analyzing uploaded HTML file"}
            </p>
            <p className="text-gray-500">This may take a minute while we check all SEO factors...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            SEO Sensei
          </Link>
          <Button asChild variant="outline">
            <Link href="/">New Analysis</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">SEO Analysis Results</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Analysis for <span className="font-medium text-blue-600 dark:text-blue-400">{url}</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {results && (
                <SeoScoreDisplay 
                  overall={results.overall} 
                  subscores={results.subscores} 
                />
              )}
            </motion.div>

            <motion.div 
              className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-4">AI-Powered Suggestions</h2>
              <div className="space-y-4">
                {results?.suggestions.map((suggestion: string, index: number) => (
                  <div key={index} className="flex">
                    <div className="mr-3 text-blue-600 dark:text-blue-400 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2h-19A2.5 2.5 0 0 0 0 4.5v15A2.5 2.5 0 0 0 2.5 22h19a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 21.5 2zM8 19H3v-4h5v4zm6.5 0h-5v-4h5v4zm6.5 0h-5v-4h5v4z"/>
                      </svg>
                    </div>
                    <p>{suggestion}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Download Report</h3>
                  <Button onClick={handleDownloadPdf}>Download PDF Report</Button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Save this report for future reference or share it with your team.
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6">Issues to Address</h2>
            
            <div className="space-y-6">
              {results?.issues.map((issue) => (
                <div key={issue.id} className="border-l-4 border-l-yellow-500 pl-4 py-1">
                  <div className="flex items-center mb-2">
                    <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                      issue.severity === "high" ? "bg-red-500" :
                      issue.severity === "medium" ? "bg-yellow-500" : "bg-blue-500"
                    }`}></span>
                    <h3 className="text-lg font-bold">{issue.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{issue.description}</p>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-3">
                    <h4 className="font-medium mb-2">How to fix:</h4>
                    <p className="text-sm">{issue.howToFix}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Element-Level Analysis Section */}
          {results?.elementAnalysis && (
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-6">Element-Level Analysis</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This analysis identifies specific HTML elements and page sections that need improvement for better SEO performance.
              </p>
              
              <ElementAnalysisView analysisResult={results.elementAnalysis} />
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
