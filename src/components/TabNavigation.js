import React from 'react';
import { useAssessment } from './SharedContext';
import { FileText, GraduationCap, ArrowRight } from 'lucide-react';

const TabNavigation = () => {
    const { activeTab, setActiveTab, sharedRubric } = useAssessment();

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

    return (
        <div className="border-b border-gray-200 bg-white">
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
                                    } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 transition-all`}
                            >
                                <Icon size={18} />
                                <div className="text-left">
                                    <div className="font-semibold">{tab.name}</div>
                                    <div className="text-xs opacity-75">{tab.description}</div>
                                </div>
                                {tab.id === 'grading-tool' && sharedRubric && (
                                    <div className="ml-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Rubric Loaded
                                        </span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Quick Transfer Button */}
                {activeTab === 'rubric-creator' && sharedRubric && (
                    <div className="px-6 py-3 bg-blue-50 border-t border-blue-200">
                        <button
                            onClick={() => setActiveTab('grading-tool')}
                            className="flex items-center gap-2 text-blue-700 hover:text-blue-800 text-sm font-medium"
                        >
                            <ArrowRight size={16} />
                            Use this rubric for grading
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabNavigation;