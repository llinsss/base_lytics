import React from 'react';
import { useAIAnalytics } from '../hooks/useAIAnalytics';

export function AIInsights() {
  const { riskScore, predictions, recommendations } = useAIAnalytics();

  return (
    <div className="space-y-6">
      {/* Risk Score */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">🤖 AI Risk Assessment</h3>
        {riskScore && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Risk Level</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                riskScore.level === 'Low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                riskScore.level === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {riskScore.level}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className={`h-2 rounded-full ${
                  riskScore.level === 'Low' ? 'bg-green-500' :
                  riskScore.level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${riskScore.score}%` }}
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {riskScore.factors.map((factor, i) => (
                <div key={i}>• {factor}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Predictions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">📈 AI Predictions</h3>
        <div className="space-y-3">
          {predictions.map((pred, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">{pred.timeframe}</span>
              <div className="text-right">
                <div className="font-semibold dark:text-white">
                  {((pred.prediction - 1) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {(pred.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">💡 AI Recommendations</h3>
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-base-600 mt-1">•</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}