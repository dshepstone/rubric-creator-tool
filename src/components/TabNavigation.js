import React from 'react';
import { useAssessment } from './SharedContext';
import { FileText, GraduationCap, ArrowRight, Database } from 'lucide-react';

const TabNavigation = () => {
    const { activeTab, setActiveTab, sharedRubric, persistentFormData } = useAssessment();

    const tabs = [
        {
            id: 'rubric-creator',
            name: 'Rubric Creator',
            icon: FileText,
            description: 'Create and edit assessment rubrics'
        },
        {
            id: 'grading-tool',
            name: 'Grading Tool',
            icon: GraduationCap,
            description: 'Grade assignments using rubrics'
        }
    ];

    // Check if there's data that indicates active work
    const hasRubricData = sharedRubric && sharedRubric.assignmentInfo?.title;
    const hasFormData = persistentFormData && (
        persistentFormData.student?.name ||
        persistentFormData.course?.name ||
        persistentFormData.assignment?.name ||
        persistentFormData.attachments?.length > 0 ||
        persistentFormData.videoLinks?.length > 0
    );

    return (
        <div className="border-b border-gray-200 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${isActive
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 relative`}
                            >
                                <Icon size={18} />
                                <div className="text-left">
                                    <div className="font-semibold">{tab.name}</div>
                                    <div className="text-xs opacity-75">{tab.description}</div>
                                </div>

                                {/* Status Indicators */}
                                <div className="flex flex-col gap-1 ml-2">
                                    {tab.id === 'grading-tool' && hasRubricData && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <Database size={10} className="mr-1" />
                                            Rubric Ready
                                        </span>
                                    )}
                                    {tab.id === 'grading-tool' && hasFormData && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            <FileText size={10} className="mr-1" />
                                            Data Saved
                                        </span>
                                    )}
                                    {tab.id === 'rubric-creator' && hasRubricData && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            <FileText size={10} className="mr-1" />
                                            In Progress
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* Quick Actions Bar */}
                <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                            {hasRubricData && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>Active Rubric: <strong className="text-gray-800">{sharedRubric.assignmentInfo.title}</strong></span>
                                </div>
                            )}
                            {hasFormData && !hasRubricData && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span>Form data preserved across tabs</span>
                                </div>
                            )}
                            {!hasRubricData && !hasFormData && (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <span>No active session data</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Transfer Button */}
                        {activeTab === 'rubric-creator' && hasRubricData && (
                            <button
                                onClick={() => setActiveTab('grading-tool')}
                                className="flex items-center gap-2 text-blue-700 hover:text-blue-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
                            >
                                <ArrowRight size={14} />
                                Switch to Grading
                            </button>
                        )}

                        {activeTab === 'grading-tool' && hasRubricData && (
                            <button
                                onClick={() => setActiveTab('rubric-creator')}
                                className="flex items-center gap-2 text-purple-700 hover:text-purple-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-purple-200 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow"
                            >
                                <FileText size={14} />
                                Edit Rubric
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TabNavigation;