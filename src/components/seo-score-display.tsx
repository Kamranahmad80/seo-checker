"use client";

import { motion } from "framer-motion";

type ScoreProps = {
  overall: number;
  subscores: {
    performance: number;
    seo: number;
    accessibility: number;
    bestPractices: number;
  };
};

export default function SeoScoreDisplay({ overall, subscores }: ScoreProps) {
  const scoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">SEO Score</h2>
        <motion.div 
          className="relative mx-auto w-48 h-48"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-5xl font-bold ${scoreColor(overall)}`}>{overall}</span>
          </div>
          <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e6e6e6"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={overall >= 90 ? "#22c55e" : overall >= 70 ? "#eab308" : "#ef4444"}
              strokeWidth="10"
              strokeDasharray={`${overall * 2.83} 283`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Performance</h3>
          <div className="flex items-center">
            <span className={`text-xl font-bold ${scoreColor(subscores.performance)}`}>
              {subscores.performance}
            </span>
            <div className="ml-2 flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className={`h-full ${subscores.performance >= 90 ? 'bg-green-500' : subscores.performance >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${subscores.performance}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">SEO</h3>
          <div className="flex items-center">
            <span className={`text-xl font-bold ${scoreColor(subscores.seo)}`}>
              {subscores.seo}
            </span>
            <div className="ml-2 flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className={`h-full ${subscores.seo >= 90 ? 'bg-green-500' : subscores.seo >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${subscores.seo}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Accessibility</h3>
          <div className="flex items-center">
            <span className={`text-xl font-bold ${scoreColor(subscores.accessibility)}`}>
              {subscores.accessibility}
            </span>
            <div className="ml-2 flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className={`h-full ${subscores.accessibility >= 90 ? 'bg-green-500' : subscores.accessibility >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${subscores.accessibility}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Best Practices</h3>
          <div className="flex items-center">
            <span className={`text-xl font-bold ${scoreColor(subscores.bestPractices)}`}>
              {subscores.bestPractices}
            </span>
            <div className="ml-2 flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className={`h-full ${subscores.bestPractices >= 90 ? 'bg-green-500' : subscores.bestPractices >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${subscores.bestPractices}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
