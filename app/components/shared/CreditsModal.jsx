import React from 'react';
import { X, Heart, Code, Sparkles } from 'lucide-react';

/**
 * CreditsModal - Easter egg credits modal showing author information
 * Triggered by Konami code or clicking version number
 */
const CreditsModal = ({ isOpen, onClose, triggeredBy = 'click' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Dashboard</h2>
              <p className="text-white/80 text-sm">v1.0.0</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              Built with <Heart className="inline h-4 w-4 text-red-500 mx-1" fill="currentColor" />
              and a lot of <Code className="inline h-4 w-4 text-blue-600 mx-1" />
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Created By</h3>
            <p className="text-lg font-medium text-gray-800">Luis F. Amadeo</p>
            <p className="text-sm text-gray-500">TechCo Inc, Inc.</p>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-amber-800 mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered By
            </h3>
            <p className="text-sm text-amber-700">
              Claude Code &amp; Claude Enterprise
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Anthropic&apos;s AI assistant for software engineering
            </p>
          </div>

          {triggeredBy === 'konami' && (
            <div className="text-center text-sm text-gray-500 mt-4 pt-4 border-t">
              <p className="font-mono">↑ ↑ ↓ ↓ ← → ← → B A</p>
              <p className="mt-1">You found the secret!</p>
            </div>
          )}

          <div className="text-center text-xs text-gray-400 mt-4">
            <p>MIT License &copy; 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsModal;
