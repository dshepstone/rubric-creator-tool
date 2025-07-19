import React, { useRef } from 'react';
import { useAssessment } from './SharedContext';
import {
    FileText, GraduationCap, Users, ArrowRight, Database,
    PlayCircle, Clock, CheckCircle, AlertTriangle, Save, Upload, Sparkles
} from 'lucide-react';

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
            id: 'ai-prompt-generator',
            name: 'AI Prompt Generator',
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
        }
    ];

    const activeStyles = {
        'ai-prompt-generator': 'active-ai-prompt border-blue-500 text-blue-700',
        'rubric-creator': 'active-rubric border-purple-500 text-purple-700',
        'class-manager': 'active-class  border-indigo-500 text-indigo-700',
        'grading-tool': 'active-grading border-green-500  text-green-700',
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

    // Calculate grading progress
    const getGradingProgress = () => {
        if (!classList || !classList.gradingProgress) return { completed: 0, total: 0, percentage: 0 };

        const completed = classList.gradingProgress.filter(p => p.status?.startsWith('completed')).length;
        const total = classList.students.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    };

    const progress = getGradingProgress();

    return (
        <div className="tab-navigation border-b border-gray-200 shadow-sm">
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
                                    ? `${activeStyles[tab.id]}`
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-6 font-medium text-sm flex items-center gap-2 transition-all duration-200`}
                            >
                                <Icon size={18} />
                                <div className="text-left">
                                    <div className="font-semibold">{tab.name}</div>
                                    <div className="text-xs opacity-75">{tab.description}</div>
                                </div>

                                {/* Status Indicators */}
                                <div className="flex flex-col gap-1 ml-2">
                                    {/* AI Prompt Generator Indicators */}
                                    {tab.id === 'ai-prompt-generator' && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            <Sparkles size={10} className="mr-1" />
                                            AI Assistant
                                        </span>
                                    )}

                                    {/* Rubric Creator Indicators */}
                                    {tab.id === 'rubric-creator' && hasRubricData && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            <FileText size={10} className="mr-1" />
                                            Active Rubric
                                        </span>
                                    )}

                                    {/* Class Manager Indicators */}
                                    {tab.id === 'class-manager' && hasClassListData && (
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                <Users size={10} className="mr-1" />
                                                {classList.students.length} Students
                                            </span>
                                            {progress.total > 0 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle size={10} className="mr-1" />
                                                    {progress.percentage}% Graded
                                                </span>
                                            )}
                                            {hasActiveSession && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    <PlayCircle size={10} className="mr-1" />
                                                    Active Session
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Grading Tool Indicators */}
                                    {tab.id === 'grading-tool' && (
                                        <div className="flex flex-col gap-1">
                                            {hasRubricData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <Database size={10} className="mr-1" />
                                                    Rubric Ready
                                                </span>
                                            )}
                                            {hasFormData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    <FileText size={10} className="mr-1" />
                                                    Data Saved
                                                </span>
                                            )}
                                            {hasActiveSession && gradingSession.currentStudent && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    <Clock size={10} className="mr-1" />
                                                    {gradingSession.currentStudent.name}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* Enhanced Quick Actions Bar */}
                <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm">
                            {/* Active Rubric Status */}
                            {hasRubricData && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>Active Rubric: <strong className="text-gray-800">{sharedRubric.assignmentInfo.title}</strong></span>
                                </div>
                            )}

                            {/* Class List Status */}
                            {hasClassListData && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                    <span>Class: <strong className="text-gray-800">{classList.students.length} students</strong></span>
                                    {progress.total > 0 && (
                                        <span className="text-gray-500">({progress.completed}/{progress.total} graded)</span>
                                    )}
                                </div>
                            )}

                            {/* Session Status */}
                            {hasActiveSession && (
                                <div className="flex items-center gap-2 text-orange-600">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                    <span>Session Active: <strong>{gradingSession.currentStudent?.name || 'Unknown'}</strong></span>
                                </div>
                            )}

                            {/* Default Status */}
                            {!hasRubricData && !hasClassListData && !hasFormData && (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <span>No active session data</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-3">
                            {/* NEW: Session Management Buttons */}
                            <button
                                onClick={() => importSessionInputRef.current?.click()}
                                className="flex items-center gap-2 text-gray-700 hover:text-gray-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow"
                            >
                                <Upload size={14} />
                                Load Session
                            </button>
                            <input
                                type="file"
                                ref={importSessionInputRef}
                                onChange={handleSessionImport}
                                accept=".json"
                                className="hidden"
                            />
                            <button
                                onClick={exportSession}
                                className="flex items-center gap-2 text-gray-700 hover:text-gray-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow"
                            >
                                <Save size={14} />
                                Save Session
                            </button>
                            <div className="w-px h-6 bg-gray-300"></div>

                            {/* Workflow indicators and quick actions */}
                            {!hasRubricData && activeTab !== 'rubric-creator' && activeTab !== 'ai-prompt-generator' && (
                                <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
                                    <AlertTriangle size={14} />
                                    <span className="text-sm">Create rubric first</span>
                                </div>
                            )}

                            {hasRubricData && !hasClassListData && activeTab !== 'class-manager' && (
                                <button
                                    onClick={() => setActiveTab('class-manager')}
                                    className="flex items-center gap-2 text-indigo-700 hover:text-indigo-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow"
                                >
                                    <Users size={14} />
                                    Import Class List
                                </button>
                            )}

                            {hasRubricData && hasClassListData && !hasActiveSession && activeTab !== 'class-manager' && (
                                <button
                                    onClick={() => {
                                        initializeGradingSession(classList);
                                        setActiveTab('grading-tool');
                                    }}
                                    className="flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow"
                                >
                                    <PlayCircle size={14} />
                                    Start Batch Grading
                                </button>
                            )}

                            {/* Tab-specific quick transfer buttons */}
                            {activeTab === 'ai-prompt-generator' && (
                                <button
                                    onClick={() => setActiveTab('rubric-creator')}
                                    className="flex items-center gap-2 text-purple-700 hover:text-purple-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-purple-200 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow"
                                >
                                    <ArrowRight size={14} />
                                    Go to Rubric Creator
                                </button>
                            )}

                            {activeTab === 'rubric-creator' && hasRubricData && hasClassListData && (
                                <button
                                    onClick={() => {
                                        initializeGradingSession(classList);
                                        setActiveTab('grading-tool');
                                    }}
                                    className="flex items-center gap-2 text-blue-700 hover:text-blue-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
                                >
                                    <ArrowRight size={14} />
                                    Start Grading
                                </button>
                            )}

                            {activeTab === 'rubric-creator' && hasRubricData && !hasClassListData && (
                                <button
                                    onClick={() => setActiveTab('class-manager')}
                                    className="flex items-center gap-2 text-indigo-700 hover:text-indigo-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow"
                                >
                                    <Users size={14} />
                                    Import Class
                                </button>
                            )}

                            {activeTab === 'class-manager' && hasRubricData && hasClassListData && (
                                <button
                                    onClick={() => setActiveTab('grading-tool')}
                                    className="flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow"
                                >
                                    <GraduationCap size={14} />
                                    Go to Grading
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

                            {activeTab === 'grading-tool' && hasClassListData && (
                                <button
                                    onClick={() => setActiveTab('class-manager')}
                                    className="flex items-center gap-2 text-indigo-700 hover:text-indigo-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow"
                                >
                                    <Users size={14} />
                                    Manage Class
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TabNavigation;