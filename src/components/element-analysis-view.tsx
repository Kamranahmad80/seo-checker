"use client";

import { useState } from 'react';
import { ElementAnalysisResult } from '@/lib/element-analysis';
import { motion } from 'framer-motion';

interface ElementAnalysisViewProps {
  analysisResult: ElementAnalysisResult;
}

export default function ElementAnalysisView({ analysisResult }: ElementAnalysisViewProps) {
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("issues");
  
  // Get issues for the selected section or all issues
  const displayedIssues = selectedSection === "all" 
    ? analysisResult.elementIssues 
    : analysisResult.elementIssues.filter(issue => 
        capitalizeFirstLetter(issue.section) === selectedSection
      );
      
  // Helper function to get color class based on score
  const getScoreColorClass = (score: number): string => {
    if (score >= 90) return "bg-green-500 text-white";
    if (score >= 70) return "bg-yellow-500 text-white";
    if (score >= 50) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };
  
  // Helper function to get color class based on severity
  const getSeverityColorClass = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'low': return "bg-yellow-100 text-yellow-800";
      case 'medium': return "bg-orange-100 text-orange-800";
      case 'high': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Helper function to get text color based on severity
  const getSeverityTextColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'low': return "text-yellow-600";
      case 'medium': return "text-orange-600";
      case 'high': return "text-red-600";
      default: return "";
    }
  };
  
  // Helper function for section name capitalization
  function capitalizeFirstLetter(string: string): string {
    if (!string) return '';
    if (string === 'header') return 'Header';
    if (string === 'navigation') return 'Navigation';
    if (string === 'content') return 'Main Content';
    if (string === 'sidebar') return 'Sidebar';
    if (string === 'footer') return 'Footer';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <div className="space-y-8">
      {/* Main Analysis Card */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Element-Level Analysis</h2>
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              {analysisResult.analyzedElements} of {analysisResult.totalElements} elements analyzed
            </span>
          </div>
        </div>
        
        <div className="p-6">
          {/* Section Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {analysisResult.sectionAnalysis.map((section) => (
              <motion.div
                key={section.name}
                whileHover={{ scale: 1.02 }}
                className={`border rounded-lg p-4 cursor-pointer ${
                  selectedSection === section.name ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''
                }`}
                onClick={() => setSelectedSection(section.name)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{section.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${getScoreColorClass(section.score)}`}>
                    {section.score}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${section.score >= 90 ? 'bg-green-500' : 
                                                    section.score >= 70 ? 'bg-yellow-500' : 
                                                    section.score >= 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ width: `${section.score}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Importance: {section.importance}/10</span>
                  <span>{section.issues.length} issues</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex">
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'issues' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-500'}`}
                onClick={() => setActiveTab('issues')}
              >
                Issues by Element
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'sections' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-500'}`}
                onClick={() => setActiveTab('sections')}
              >
                Issues by Section
              </button>
            </div>
          </div>
          
          {/* Issues Tab Content */}
          {activeTab === 'issues' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <span className="font-medium">Filter by section:</span>
                <select 
                  className="px-3 py-1 border rounded" 
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  <option value="all">All Sections</option>
                  {analysisResult.sectionAnalysis.map((section) => (
                    <option key={section.name} value={section.name}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {displayedIssues.length > 0 ? (
                <div className="space-y-4">
                  {displayedIssues.map((issue, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">{issue.element}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({capitalizeFirstLetter(issue.section)} section)
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${getSeverityColorClass(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                      
                      <p className="mb-2">{issue.issue}</p>
                      
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded text-sm">
                        <span className="font-medium">Recommendation:</span> {issue.recommendation}
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-500">
                        <span className="font-medium">Selector:</span> <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{issue.selector}</code>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No issues found in this section. Great job!
                </div>
              )}
            </div>
          )}
          {/* Sections Tab Content */}
          {activeTab === 'sections' && (
            <div className="space-y-6">
              {analysisResult.sectionAnalysis.map((section) => (
                <div key={section.name} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">{section.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getScoreColorClass(section.score)}`}>
                      Score: {section.score}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">
                      SEO Importance: {section.importance}/10
                    </span>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${section.importance * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {section.issues.length > 0 ? (
                    <div className="space-y-3 mt-4">
                      <h4 className="font-medium">Issues Found:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        {section.issues.map((issue, idx) => (
                          <li key={idx} className="text-sm">
                            <span className={getSeverityTextColor(issue.severity)}>
                              {issue.element}:
                            </span>{' '}
                            {issue.issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No issues found in this section. Great job!
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Heatmap Visualization */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Page Structure Heatmap</h2>
        </div>
        
        <div className="p-6">
          <div className="border border-dashed rounded-lg p-4 text-center">
            <div className="mb-4 text-sm text-gray-500">
              A visual representation of your page with issue hotspots.
              <br />
              (In a browser extension, this would overlay on the actual website)
            </div>
            
            <div className="max-w-4xl mx-auto">
              {/* Simple mockup of a webpage layout */}
              <div className="grid grid-rows-[auto_1fr_auto] min-h-[400px] gap-2 border">
                {/* Header */}
                <div className={`p-4 text-center ${
                  getHeatmapColor(analysisResult, "Header")}`}>
                  <h3 className="font-bold">Header</h3>
                  <p className="text-xs">
                    {getIssueCountText(analysisResult, "Header")}
                  </p>
                </div>
                
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  {/* Main content */}
                  <div className={`p-4 ${getHeatmapColor(analysisResult, "Main Content")}`}>
                    <h3 className="font-bold">Main Content</h3>
                    <p className="text-xs">
                      {getIssueCountText(analysisResult, "Main Content")}
                    </p>
                  </div>
                  
                  {/* Sidebar */}
                  <div className={`p-4 w-32 ${getHeatmapColor(analysisResult, "Sidebar")}`}>
                    <h3 className="font-bold text-sm">Sidebar</h3>
                    <p className="text-xs">
                      {getIssueCountText(analysisResult, "Sidebar")}
                    </p>
                  </div>
                </div>
                
                {/* Footer */}
                <div className={`p-4 text-center ${getHeatmapColor(analysisResult, "Footer")}`}>
                  <h3 className="font-bold">Footer</h3>
                  <p className="text-xs">
                    {getIssueCountText(analysisResult, "Footer")}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center items-center gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 mr-2"></div>
                <span className="text-xs">No issues</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-100 mr-2"></div>
                <span className="text-xs">Minor issues</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-100 mr-2"></div>
                <span className="text-xs">Moderate issues</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 mr-2"></div>
                <span className="text-xs">Major issues</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get heatmap colors based on issue count and severity
function getHeatmapColor(analysisResult: ElementAnalysisResult, sectionName: string): string {
  const section = analysisResult.sectionAnalysis.find(s => s.name === sectionName);
  if (!section) return "bg-green-100";
  
  if (section.score >= 90) return "bg-green-100";
  if (section.score >= 70) return "bg-yellow-100";
  if (section.score >= 50) return "bg-orange-100";
  return "bg-red-100";
}

// Helper function to get issue count text
function getIssueCountText(analysisResult: ElementAnalysisResult, sectionName: string): string {
  const section = analysisResult.sectionAnalysis.find(s => s.name === sectionName);
  if (!section) return "No issues";
  
  const highCount = section.issues.filter(i => i.severity === 'high').length;
  const mediumCount = section.issues.filter(i => i.severity === 'medium').length;
  const lowCount = section.issues.filter(i => i.severity === 'low').length;
  
  if (highCount + mediumCount + lowCount === 0) return "No issues";
  
  return `${highCount > 0 ? `${highCount} high, ` : ''}${mediumCount > 0 ? `${mediumCount} medium, ` : ''}${lowCount > 0 ? `${lowCount} low` : ''}`.replace(/, $/, '');
}
