/**
 * PDF Report Generator for SEO Sensei
 * Uses browser's print functionality to create PDF reports
 */

import { SeoAnalysisResult } from './seo-analyzer';

export function generatePdfReport(results: SeoAnalysisResult): void {
  // Create a blob with the report HTML
  const blob = new Blob([generateReportHtml(results)], { type: 'text/html' });
  
  // Create a link element
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `seo-report-${results.url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
  
  // Append link to the body
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// Helper function to generate the report HTML
function generateReportHtml(results: SeoAnalysisResult): string {
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SEO Analysis Report for ${results.url}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #4f46e5;
        }
        .url {
          font-size: 16px;
          color: #666;
          word-break: break-all;
        }
        .timestamp {
          font-size: 14px;
          color: #888;
          margin-top: 5px;
        }
        .score-section {
          display: flex;
          margin: 30px 0;
        }
        .overall-score {
          flex: 1;
          text-align: center;
        }
        .overall-score .score {
          font-size: 64px;
          font-weight: bold;
        }
        .overall-score .label {
          font-size: 18px;
          color: #666;
        }
        .subscores {
          flex: 2;
        }
        .subscore {
          margin-bottom: 15px;
        }
        .subscore .name {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .subscore .bar {
          height: 10px;
          background-color: #eee;
          border-radius: 5px;
          overflow: hidden;
        }
        .subscore .fill {
          height: 100%;
          border-radius: 5px;
        }
        .score-90plus {
          color: #22c55e;
        }
        .score-70plus {
          color: #eab308;
        }
        .score-below70 {
          color: #ef4444;
        }
        .fill-90plus {
          background-color: #22c55e;
        }
        .fill-70plus {
          background-color: #eab308;
        }
        .fill-below70 {
          background-color: #ef4444;
        }
        .section {
          margin: 40px 0;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        .issue {
          margin-bottom: 25px;
          padding-left: 15px;
          border-left: 4px solid #eab308;
        }
        .issue-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
        }
        .issue-severity {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 10px;
        }
        .severity-high {
          background-color: #ef4444;
        }
        .severity-medium {
          background-color: #eab308;
        }
        .severity-low {
          background-color: #3b82f6;
        }
        .issue-description {
          margin-bottom: 10px;
          color: #555;
        }
        .issue-solution {
          background-color: #f5f5f5;
          padding: 10px 15px;
          border-radius: 5px;
        }
        .issue-solution-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .suggestion {
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .suggestion:last-child {
          border-bottom: none;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 14px;
          color: #888;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">SEO Sensei</div>
        <div class="url">${results.url}</div>
        <div class="timestamp">Report generated on ${new Date(results.timestamp).toLocaleDateString()} at ${new Date(results.timestamp).toLocaleTimeString()}</div>
      </div>
      
      <div class="score-section">
        <div class="overall-score">
          <div class="score ${results.overall >= 90 ? 'score-90plus' : results.overall >= 70 ? 'score-70plus' : 'score-below70'}">${results.overall}</div>
          <div class="label">Overall Score</div>
        </div>
        
        <div class="subscores">
          <div class="subscore">
            <div class="name">Performance: ${results.subscores.performance}</div>
            <div class="bar">
              <div class="fill ${results.subscores.performance >= 90 ? 'fill-90plus' : results.subscores.performance >= 70 ? 'fill-70plus' : 'fill-below70'}" style="width: ${results.subscores.performance}%;"></div>
            </div>
          </div>
          
          <div class="subscore">
            <div class="name">SEO: ${results.subscores.seo}</div>
            <div class="bar">
              <div class="fill ${results.subscores.seo >= 90 ? 'fill-90plus' : results.subscores.seo >= 70 ? 'fill-70plus' : 'fill-below70'}" style="width: ${results.subscores.seo}%;"></div>
            </div>
          </div>
          
          <div class="subscore">
            <div class="name">Accessibility: ${results.subscores.accessibility}</div>
            <div class="bar">
              <div class="fill ${results.subscores.accessibility >= 90 ? 'fill-90plus' : results.subscores.accessibility >= 70 ? 'fill-70plus' : 'fill-below70'}" style="width: ${results.subscores.accessibility}%;"></div>
            </div>
          </div>
          
          <div class="subscore">
            <div class="name">Best Practices: ${results.subscores.bestPractices}</div>
            <div class="bar">
              <div class="fill ${results.subscores.bestPractices >= 90 ? 'fill-90plus' : results.subscores.bestPractices >= 70 ? 'fill-70plus' : 'fill-below70'}" style="width: ${results.subscores.bestPractices}%;"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">Critical Issues to Address</h2>
        ${results.issues.map(issue => `
          <div class="issue">
            <div class="issue-title">
              <span class="issue-severity severity-${issue.severity}"></span>
              ${issue.title}
            </div>
            <div class="issue-description">${issue.description}</div>
            <div class="issue-solution">
              <div class="issue-solution-title">How to fix:</div>
              ${issue.howToFix}
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="section">
        <h2 class="section-title">AI-Powered Recommendations</h2>
        ${results.suggestions.map(suggestion => `
          <div class="suggestion">
            ${suggestion}
          </div>
        `).join('')}
      </div>
      
      <div class="footer">
        <p>Generated by SEO Sensei - Your personal AI-powered SEO advisor</p>
        <p class="no-print">This report is based on analysis performed on ${new Date(results.timestamp).toLocaleDateString()}</p>
      </div>
      
      <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 10px 20px; background-color: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Save as PDF
        </button>
      </div>
    </body>
    </html>
  `;
   // No action needed here as we're now directly downloading the file
  // The HTML content is returned by the generateReportHtml function
}
