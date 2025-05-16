"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type InputType = "url" | "github";

export default function UrlInputForm() {
  const router = useRouter();
  const [inputType, setInputType] = useState<InputType>("url");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!inputValue.trim()) {
      setError("Please enter a valid input");
      return;
    }
    
    // URL validation for URL type
    if (inputType === "url") {
      try {
        // Simple URL validation
        new URL(inputValue);
      } catch (e) {
        setError("Please enter a valid URL (e.g., https://example.com)");
        return;
      }
    }
    
    // GitHub repo validation for GitHub type
    if (inputType === "github" && !inputValue.includes("github.com")) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }
    
    setIsLoading(true);
    
    // In a real implementation, we would send this data to the backend
    // For now, we'll navigate to the results page with the input as a query parameter
    setTimeout(() => {
      setIsLoading(false);
      router.push(`/results?type=${inputType}&url=${encodeURIComponent(inputValue)}`);
    }, 1000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/10">
        <div className="flex gap-2 mb-4">
          <Button 
            variant={inputType === "url" ? "default" : "outline"}
            onClick={() => setInputType("url")}
            className="flex-1"
          >
            Live URL
          </Button>
          <Button 
            variant={inputType === "github" ? "default" : "outline"}
            onClick={() => setInputType("github")}
            className="flex-1"
          >
            GitHub Repo
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
              <div className="flex">
                <input
                  type="text"
                  placeholder={inputType === "url" ? "https://example.com" : "https://github.com/username/repo"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className={`flex-1 px-4 py-2 rounded-l-lg border focus:outline-none focus:ring-2 ${error ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="rounded-l-none"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : "Analyze SEO"}
                </Button>
              </div>
              {error && (
                <div className="text-red-500 text-sm mt-2">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {error}
                  </span>
                </div>
              )}
            </div>
        </form>
      </div>
    </div>
  );
}
