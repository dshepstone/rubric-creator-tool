// src/App.js
import React, { useState, useEffect } from 'react';
import { AssessmentProvider, useAssessment } from './components/SharedContext';
import TabNavigation from './components/TabNavigation';
import AIRubricPromptGenerator from './components/AIRubricPromptGenerator';
import AssignmentPromptGenerator from './components/AssignmentPromptGenerator';
import RubricCreator from './components/RubricCreator';
import ClassListManager from './components/ClassListManager';
import GradingTemplate from './components/GradingTemplate';
import ExcelImportTest from './components/ExcelImportTest';
import HelpPage from './components/HelpPage';
import GradingPolicyManager from './components/GradingPolicyManager';
import './index.css';

// Add TanStack Query imports
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';

// Scroll to Top Button Component
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when scrolled more than 200px (reduced threshold)
      if (window.pageYOffset > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Add scroll listener with throttling for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          toggleVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Enhanced scroll to top with multiple fallback methods
  const scrollToTop = () => {
    setIsScrolling(true);

    console.log('🔝 Scroll to top button clicked');

    // Method 1: Try smooth scroll first
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });

      // Fallback: If smooth scroll doesn't work, use immediate scroll
      setTimeout(() => {
        if (window.pageYOffset > 50) {
          console.log('📜 Fallback: Using immediate scroll');
          window.scrollTo(0, 0);
          // Try document.body scroll as well
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
        }
        setIsScrolling(false);
      }, 1500);

    } catch (error) {
      console.log('⚠️ Scroll error, using fallback:', error);
      // Immediate scroll fallback
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      setIsScrolling(false);
    }
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          disabled={isScrolling}
          className={`
            fixed bottom-6 right-6 z-50
            w-14 h-14 
            bg-gray-900 hover:bg-black
            text-white rounded-full 
            shadow-2xl hover:shadow-3xl
            border-2 border-gray-700 hover:border-gray-600
            transform transition-all duration-200 
            ${isScrolling
              ? 'scale-95 opacity-75 cursor-wait'
              : 'hover:scale-105 active:scale-95 cursor-pointer'
            }
            flex items-center justify-center
            backdrop-blur-sm
            ring-2 ring-white ring-opacity-20
            hover:ring-opacity-40
          `}
          style={{
            background: isScrolling
              ? 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
              : 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
          }}
          title="Scroll to top of page"
          aria-label="Scroll to top of page"
        >
          {isScrolling ? (
            // Enhanced loading spinner
            <div className="relative">
              <svg
                className="w-6 h-6 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : (
            // Enhanced up arrow icon
            <svg
              className="w-7 h-7 drop-shadow-sm"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25a.75.75 0 01.75.75v16.19l6.22-6.22a.75.75 0 111.06 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 111.06-1.06l6.22 6.22V3a.75.75 0 01.75-.75z"
                clipRule="evenodd"
                transform="rotate(180 12 12)"
              />
            </svg>
          )}

          {/* Pulse ring animation when visible */}
          <div className="absolute inset-0 rounded-full bg-gray-900 opacity-20 animate-ping" />
        </button>
      )}

      {/* Enhanced scroll progress indicator */}
      {isVisible && (
        <div className="fixed bottom-[5.5rem] right-6 z-40">
          <div className="w-14 h-2 bg-gray-800 bg-opacity-50 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 rounded-full"
              style={{
                width: `${Math.min(
                  (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100,
                  100
                )}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && isVisible && (
        <div className="fixed bottom-24 right-6 z-40 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          Scroll: {Math.round(window.pageYOffset)}px
        </div>
      )}
    </>
  );
};

const AppContent = () => {
  const { activeTab } = useAssessment();

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* GradingPilot Logo */}
              <img
                src="/GradingPilot-Vector-Logo-v01.png"
                alt="GradingPilot Logo"
                className="h-20 w-20 object-contain"
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.target.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GradingPilot</h1>
                <p className="text-gray-600">Advanced grading and rubric creation tools for educators</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              GradingPilot Professional Suite v2.0
            </div>
          </div>
        </div>
      </div>

      <TabNavigation />

      <div className="tab-content">
        {activeTab === 'ai-prompt-generator' && <AIRubricPromptGenerator />}
        {activeTab === 'assignment-prompt-generator' && <AssignmentPromptGenerator />}
        {activeTab === 'rubric-creator' && <RubricCreator />}
        {activeTab === 'class-manager' && <ClassListManager />}
        {activeTab === 'policy-manager' && <GradingPolicyManager />}
        {activeTab === 'grading-tool' && <GradingTemplate />}
        {activeTab === 'excel-import-test' && <ExcelImportTest />}
        {activeTab === 'help' && <HelpPage />}
      </div>

      {/* Scroll to Top Button - Available on all pages */}
      <ScrollToTopButton />
    </div>
  );
};

// Updated App component with QueryClient integration
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AssessmentProvider>
        <AppContent />
      </AssessmentProvider>

      {/* Add ReactQuery DevTools for development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-left"
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>


);
};

export default App;
