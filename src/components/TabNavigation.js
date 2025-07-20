import React, { useRef } from 'react';
import { useAssessment } from './SharedContext';
import {
    FileText, GraduationCap, Users, ArrowRight, Database,
    PlayCircle, Clock, CheckCircle, AlertTriangle, Save, Upload, Sparkles, BookOpen // ADDED BookOpen
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
        }
    ];

    const activeStyles = {
        'ai-prompt-generator': 'active-ai-prompt border-blue-500 text-blue-700',
        'assignment-prompt-generator': 'active-assignment-prompt border-orange-500 text-orange-700', // NEW STYLE
        'rubric-creator': 'active-rubric border-purple-500 text-purple-700',
        'class-manager': 'active-class border-indigo-500 text-indigo-700',
        'grading-tool': 'active-grading border-green-500 text-green-700',
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
                <nav className="flex space-x-2 px-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${isActive
                                    ? `${activeStyles[tab.id]} border-b-2 bg-white`
                                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                                    } flex flex-col items-center px-4 py-3 text-sm font-medium transition-all duration-200 min-w-max`}
                            >
                                <Icon size={18} className="mb-1" />
                                <span className="hidden sm:block">{tab.name}</span>
                                <span className="text-xs text-gray-400 hidden lg:block max-w-32 text-center">
                                    {tab.description}
                                </span>

                                {/* Status indicators */}
                                <div className="flex flex-wrap gap-1 mt-1 justify-center">
                                    {/* AI Prompt Generator indicators */}
                                    {tab.id === 'ai-prompt-generator' && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                                            <Sparkles size={10} className="mr-1 flex-shrink-0" />
                                            Rubric AI
                                        </span>
                                    )}

                                    {/* Assignment Prompt Generator indicators */}
                                    {tab.id === 'assignment-prompt-generator' && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 whitespace-nowrap">
                                            <BookOpen size={10} className="mr-1 flex-shrink-0" />
                                            Assignment AI
                                        </span>
                                    )}

                                    {/* Rubric Creator indicators */}
                                    {tab.id === 'rubric-creator' && hasRubricData && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 whitespace-nowrap">
                                            <Database size={10} className="mr-1 flex-shrink-0" />
                                            Rubric Ready
                                        </span>
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
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* Quick Actions Bar */}
                <div className="border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between px-6 py-2">
                        <div className="flex items-center gap-4">
                            <input
                                ref={importSessionInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleSessionImport}
                                className="hidden"
                            />
                            <button
                                onClick={() => importSessionInputRef.current?.click()}
                                className="flex items-center gap-2 text-gray-700 hover:text-gray-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow"
                            >
                                <Upload size={14} />
                                Import Session
                            </button>
                            <button
                                onClick={exportSession}
                                className="flex items-center gap-2 text-gray-700 hover:text-gray-800 text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow"
                            >
                                <Save size={14} />
                                Save Session
                            </button>
                            <div className="w-px h-6 bg-gray-300"></div>

                            {/* Workflow indicators and quick actions */}
                            {!hasRubricData && activeTab !== 'rubric-creator' && activeTab !== 'ai-prompt-generator' && activeTab !== 'assignment-prompt-generator' && (
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
                                    <GraduationCap size={14} />
                                    Start Grading
                                </button>
                            )}

                            {!hasClassListData && activeTab !== 'class-manager' && activeTab !== 'rubric-creator' && activeTab !== 'ai-prompt-generator' && activeTab !== 'assignment-prompt-generator' && (
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