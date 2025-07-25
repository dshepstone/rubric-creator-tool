// TabNavigation.js - Updated with GradeBook Tab (Preserving ALL Original Features)
import React, { useRef } from 'react';
import { useAssessment } from './SharedContext';
import {
    FileText, GraduationCap, Users, ArrowRight, Database,
    PlayCircle, Clock, CheckCircle, AlertTriangle, Save, Upload,
    Sparkles, BookOpen, HelpCircle, Settings
} from 'lucide-react';

// Add grading policy hooks
import { useGradingPolicies } from '../hooks/useGradingPolicies';

const TabNavigation = () => {
    const {
        activeTab,
        setActiveTab,
        sharedRubric,
        persistentFormData,
        classList,
        gradingSession,
        initializeGradingSession,
        exportSession,
        importSession,
    } = useAssessment();

    // Add grading policy state
    const { data: availablePolicies = [], isLoading: policiesLoading } = useGradingPolicies({ isActive: true });

    const importSessionInputRef = useRef(null);

    const handleSessionImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            importSession(content);
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input to allow re-uploading the same file
    };

    const tabs = [
        {
            id: 'assignment-prompt-generator',
            name: 'Assignment Prompt',
            icon: BookOpen,
            description: 'Generate AI prompts and HTML for assignment pages'
        },
        {
            id: 'ai-prompt-generator',
            name: 'AI Rubric Prompt',
            icon: Sparkles,
            description: 'Generate AI prompts to create rubric JSON files'
        },
        {
            id: 'rubric-creator',
            name: 'Rubric Creator',
            icon: FileText,
            description: 'Create and edit assessment rubrics'
        },
        {
            id: 'class-manager',
            name: 'Class Manager',
            icon: Users,
            description: 'Import and manage class lists'
        },
        {
            id: 'grading-tool',
            name: 'Grading Tool',
            icon: GraduationCap,
            description: 'Grade assignments using rubrics'
        },
        {
            id: 'gradebook',
            name: 'Grade Book',
            description: 'Comprehensive gradebook with multiple assignments',
            icon: BookOpen
        },
        {
            id: 'policy-manager',
            name: 'Policy Manager',
            icon: Settings,
            description: 'Manage dynamic grading policies and scales'
        },
        {
            id: 'help',
            name: 'Help',
            icon: HelpCircle,
            description: 'User guide and feature documentation'
        }
    ];

    const activeStyles = {
        'ai-prompt-generator': 'active-ai-prompt border-blue-500 text-blue-700',
        'assignment-prompt-generator': 'active-assignment-prompt border-orange-500 text-orange-700',
        'rubric-creator': 'active-rubric border-purple-500 text-purple-700',
        'class-manager': 'active-class border-indigo-500 text-indigo-700',
        'policy-manager': 'active-policy border-teal-500 text-teal-700',
        'grading-tool': 'active-grading border-green-500 text-green-700',
        'gradebook': 'active-gradebook border-blue-600 text-blue-800',
        'help': 'active-help border-gray-500 text-gray-700',
    };

    // Check if there's data that indicates active work
    const hasRubricData = sharedRubric && sharedRubric.assignmentInfo?.title;
    const hasFormData = persistentFormData && (
        persistentFormData.student?.name ||
        persistentFormData.course?.name ||
        persistentFormData.assignment?.name ||
        persistentFormData.attachments?.length > 0 ||
        persistentFormData.videoLinks?.length > 0
    );
    const hasClassListData = classList && classList.students?.length > 0;
    const hasActiveSession = gradingSession?.active;

    // Add grading policy status checks
    const hasPolicyData = availablePolicies && availablePolicies.length > 0;
    const currentProgramType = classList?.courseMetadata?.programType || 'degree';

    // Calculate grading progress
    const getGradingProgress = () => {
        if (!classList || !classList.gradingProgress) return { completed: 0, total: 0, percentage: 0 };

        const completed = classList.gradingProgress.filter(p => p.status?.startsWith('completed')).length;
        const total = classList.students.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    };

    const progress = getGradingProgress();

    // Calculate gradebook statistics
    const getGradebookStats = () => {
        if (!hasClassListData) return { students: 0, projects: 0 };

        // This would need to be enhanced based on actual gradebook data structure
        // For now, we'll show basic class stats
        return {
            students: classList.students.length,
            projects: 0 // This would be calculated from gradebook data
        };
    };

    const gradebookStats = getGradebookStats();

    return (
        <div className="tab-navigation border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto">
                <nav className="flex space-x-2 px-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${isActive
                                    ? `border-b-2 ${activeStyles[tab.id]} bg-white shadow-sm`
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-transparent'
                                    } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm transition-all duration-200 flex items-start gap-2 min-w-fit`}
                                aria-current={isActive ? 'page' : undefined}
                                title={tab.description}
                            >
                                <Icon size={16} className="flex-shrink-0 mt-0.5" />
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium">{tab.name}</span>

                                    {/* AI Prompt Generator indicators */}
                                    {tab.id === 'ai-prompt-generator' && (
                                        <div className="flex flex-col gap-1">
                                            {hasRubricData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                                                    <Sparkles size={10} className="mr-1 flex-shrink-0" />
                                                    AI Ready
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Rubric Creator indicators */}
                                    {tab.id === 'rubric-creator' && (
                                        <div className="flex flex-col gap-1">
                                            {hasRubricData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 whitespace-nowrap">
                                                    <Database size={10} className="mr-1 flex-shrink-0" />
                                                    Rubric Ready
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Class Manager indicators */}
                                    {tab.id === 'class-manager' && (
                                        <div className="flex flex-col gap-1">
                                            {hasClassListData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 whitespace-nowrap">
                                                    <Users size={10} className="mr-1 flex-shrink-0" />
                                                    {classList.students.length} Students
                                                </span>
                                            )}
                                            {progress.total > 0 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                                                    <CheckCircle size={10} className="mr-1 flex-shrink-0" />
                                                    {progress.percentage}% Graded
                                                </span>
                                            )}
                                            {hasActiveSession && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 whitespace-nowrap">
                                                    <PlayCircle size={10} className="mr-1 flex-shrink-0" />
                                                    Active Session
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Policy Manager indicators */}
                                    {tab.id === 'policy-manager' && (
                                        <div className="flex flex-col gap-1">
                                            {hasPolicyData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 whitespace-nowrap">
                                                    <Settings size={10} className="mr-1 flex-shrink-0" />
                                                    {availablePolicies.length} Policies
                                                </span>
                                            )}
                                            {currentProgramType && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                                                    <Database size={10} className="mr-1 flex-shrink-0" />
                                                    {currentProgramType.charAt(0).toUpperCase() + currentProgramType.slice(1)}
                                                </span>
                                            )}
                                            {policiesLoading && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 whitespace-nowrap">
                                                    <Clock size={10} className="mr-1 flex-shrink-0" />
                                                    Loading...
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Grading Tool Indicators */}
                                    {tab.id === 'grading-tool' && (
                                        <div className="flex flex-col gap-1">
                                            {hasRubricData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                                                    <Database size={10} className="mr-1 flex-shrink-0" />
                                                    Rubric Ready
                                                </span>
                                            )}
                                            {hasFormData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                                                    <FileText size={10} className="mr-1 flex-shrink-0" />
                                                    Form Data
                                                </span>
                                            )}
                                            {hasActiveSession && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 whitespace-nowrap">
                                                    <Clock size={10} className="mr-1 flex-shrink-0" />
                                                    In Progress
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* GradeBook indicators */}
                                    {tab.id === 'gradebook' && (
                                        <div className="flex flex-col gap-1">
                                            {hasClassListData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                                                    <Users size={10} className="mr-1 flex-shrink-0" />
                                                    {gradebookStats.students} Students
                                                </span>
                                            )}
                                            {gradebookStats.projects > 0 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                                                    <FileText size={10} className="mr-1 flex-shrink-0" />
                                                    {gradebookStats.projects} Projects
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Help tab indicator */}
                                    {tab.id === 'help' && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">
                                            <HelpCircle size={10} className="mr-1 flex-shrink-0" />
                                            User Guide
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* Quick Actions Bar */}
                <div className="border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between px-6 py-2">
                        <div className="flex items-center gap-4">
                            {/* Session Management Controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={exportSession}
                                    className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-xs font-medium"
                                    title="Export Current Session"
                                >
                                    <Save size={12} />
                                    Export
                                </button>

                                <input
                                    ref={importSessionInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleSessionImport}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    onClick={() => importSessionInputRef.current?.click()}
                                    className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-xs font-medium"
                                    title="Import Session"
                                >
                                    <Upload size={12} />
                                    Import
                                </button>
                            </div>

                            {/* Help shortcut */}
                            {activeTab !== 'help' && (
                                <button
                                    onClick={() => setActiveTab('help')}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                                    title="Need help? View user guide"
                                >
                                    <HelpCircle size={12} />
                                    Need Help?
                                </button>
                            )}

                            {/* Policy Manager shortcut - only show when class data exists */}
                            {activeTab !== 'policy-manager' && hasClassListData && (
                                <button
                                    onClick={() => setActiveTab('policy-manager')}
                                    className="flex items-center gap-1 text-teal-600 hover:text-teal-800 text-xs font-medium"
                                    title="Manage grading policies for your program type"
                                >
                                    <Settings size={12} />
                                    Manage Policies
                                </button>
                            )}
                        </div>

                        {/* Smart workflow navigation buttons - PRESERVING ALL ORIGINAL LOGIC */}
                        <div className="flex items-center gap-2">
                            {activeTab === 'ai-prompt-generator' && hasRubricData && (
                                <button
                                    onClick={() => setActiveTab('rubric-creator')}
                                    className="flex items-center gap-2 text-purple-700 hover:text-purple-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-purple-200 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow"
                                >
                                    <FileText size={14} />
                                    Edit Rubric
                                </button>
                            )}

                            {activeTab === 'rubric-creator' && hasRubricData && hasClassListData && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setActiveTab('policy-manager')}
                                        className="flex items-center gap-2 text-teal-700 hover:text-teal-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-teal-200 hover:border-teal-300 transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <Settings size={14} />
                                        Check Policies
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('grading-tool')}
                                        className="flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <GraduationCap size={14} />
                                        Start Grading
                                    </button>
                                </div>
                            )}

                            {activeTab === 'class-manager' && hasRubricData && hasClassListData && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setActiveTab('policy-manager')}
                                        className="flex items-center gap-2 text-teal-700 hover:text-teal-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-teal-200 hover:border-teal-300 transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <Settings size={14} />
                                        Review Policies
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('grading-tool')}
                                        className="flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <GraduationCap size={14} />
                                        Go to Grading
                                    </button>
                                </div>
                            )}

                            {activeTab === 'policy-manager' && hasClassListData && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setActiveTab('class-manager')}
                                        className="flex items-center gap-2 text-indigo-700 hover:text-indigo-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <Users size={14} />
                                        Back to Class
                                    </button>
                                    {hasRubricData && (
                                        <button
                                            onClick={() => setActiveTab('grading-tool')}
                                            className="flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            <GraduationCap size={14} />
                                            Start Grading
                                        </button>
                                    )}
                                </div>
                            )}

                            {activeTab === 'grading-tool' && hasRubricData && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setActiveTab('policy-manager')}
                                        className="flex items-center gap-2 text-teal-700 hover:text-teal-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-teal-200 hover:border-teal-300 transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <Settings size={14} />
                                        Policies
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('rubric-creator')}
                                        className="flex items-center gap-2 text-purple-700 hover:text-purple-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-purple-200 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <FileText size={14} />
                                        Edit Rubric
                                    </button>
                                </div>
                            )}

                            {activeTab === 'grading-tool' && hasClassListData && (
                                <button
                                    onClick={() => setActiveTab('class-manager')}
                                    className="flex items-center gap-2 text-indigo-700 hover:text-indigo-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow"
                                >
                                    <Users size={14} />
                                    Manage Class
                                </button>
                            )}

                            {/* GradeBook Quick Actions */}
                            {activeTab === 'gradebook' && !hasClassListData && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">Get Started:</span>
                                    <button
                                        onClick={() => setActiveTab('class-manager')}
                                        className="flex items-center gap-2 text-indigo-700 hover:text-indigo-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <Users size={14} />
                                        Import Class List
                                    </button>
                                </div>
                            )}

                            {activeTab === 'gradebook' && hasClassListData && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">Quick Actions:</span>
                                    <button
                                        onClick={() => setActiveTab('class-manager')}
                                        className="flex items-center gap-2 text-indigo-700 hover:text-indigo-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <Users size={14} />
                                        Manage Students
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('policy-manager')}
                                        className="flex items-center gap-2 text-teal-700 hover:text-teal-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-teal-200 hover:border-teal-300 transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <Settings size={14} />
                                        Grading Policies
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default TabNavigation;