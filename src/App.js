import React from 'react';
import { AssessmentProvider, useAssessment } from './components/SharedContext';
import TabNavigation from './components/TabNavigation';
import RubricCreator from './components/RubricCreator';
import GradingTemplate from './components/GradingTemplate';
import './index.css';

const AppContent = () => {
  const { activeTab } = useAssessment();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assessment Platform</h1>
              <p className="text-gray-600">Professional rubric creation and grading tools</p>
            </div>
            <div className="text-sm text-gray-500">
              Comprehensive Educational Assessment Suite
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'rubric-creator' && <RubricCreator />}
        {activeTab === 'grading-tool' && <GradingTemplate />}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AssessmentProvider>
      <AppContent />
    </AssessmentProvider>
  );
};

export default App;