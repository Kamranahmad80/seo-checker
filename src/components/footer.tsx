export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold mb-4">SEO Sensei</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your personal AI-powered SEO advisor for optimizing websites and improving search engine rankings. Get comprehensive SEO analysis and actionable recommendations.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Key Features</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a href="/#features" className="hover:text-blue-600 transition-colors">
                  Comprehensive SEO Audit
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-blue-600 transition-colors">
                  GitHub Repository Analysis
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-blue-600 transition-colors">
                  AI-Powered Recommendations
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                  Google SEO Guide
                </a>
              </li>
              <li>
                <a href="https://moz.com/beginners-guide-to-seo" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                  Moz SEO Beginners Guide
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} SEO Sensei - Best Free SEO Analyzer Tool. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
