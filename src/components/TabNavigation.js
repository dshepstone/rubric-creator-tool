<<<<<<< HEAD
// TabNavigation.js - Updated with GradeBook Tab (Preserving ALL Original Features)
import React, { useRef } from 'react';
import { useAssessment } from './SharedContext';
import {
    FileText, GraduationCap, Users, ArrowRight, Database,
    PlayCircle, Clock, CheckCircle, AlertTriangle, Save, Upload,
    Sparkles, BookOpen, HelpCircle, Settings
} from 'lucide-react';

// Add grading policy hooks
=======
// TabNavigation.js
import React, { useRef } from 'react';
import { useAssessment } from './SharedContext';
import {
    FileText,
    GraduationCap,
    Users,
    ArrowRight,
    Database,
    PlayCircle,
    Clock,
    CheckCircle,
    AlertTriangle,
    Save,
    Upload,
    Sparkles,
    BookOpen,
    HelpCircle,
    Settings,
    Image
} from 'lucide-react';
>>>>>>> logo-insertion
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

<<<<<<< HEAD
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
=======
    const { data: availablePolicies = [], isLoading: policiesLoading } =
        useGradingPolicies({ isActive: true });

    // For the Import button
    const importSessionInputRef = useRef(null);
    const handleSessionImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => importSession(evt.target.result);
        reader.readAsText(file);
        e.target.value = '';
    };

    // === tabs definition ===
    const tabs = [
        { id: 'assignment-prompt-generator', name: 'Assignment Prompt', icon: BookOpen, description: 'Generate AI prompts and HTML for assignment pages' },
        { id: 'ai-prompt-generator', name: 'AI Rubric Prompt', icon: Sparkles, description: 'Generate AI prompts to create rubric JSON files' },
        { id: 'rubric-creator', name: 'Rubric Creator', icon: FileText, description: 'Create and edit assessment rubrics' },
        { id: 'class-manager', name: 'Class Manager', icon: Users, description: 'Import and manage class lists' },
        { id: 'grading-tool', name: 'Grading Tool', icon: GraduationCap, description: 'Grade assignments using rubrics' },
        { id: 'gradebook', name: 'Grade Book', icon: BookOpen, description: 'Comprehensive gradebook with multiple assignments' },
        { id: 'policy-manager', name: 'Policy Manager', icon: Settings, description: 'Manage dynamic grading policies and scales' },
        { id: 'logo-settings', name: 'Logo Settings', icon: Image, description: 'Upload and manage school logo for exports' },
        { id: 'help', name: 'Help', icon: HelpCircle, description: 'User guide and feature documentation' },
    ];

    const activeStyles = {
        'assignment-prompt-generator': 'active-assignment-prompt border-orange-500 text-orange-700',
        'ai-prompt-generator': 'active-ai-prompt border-blue-500 text-blue-700',
        'rubric-creator': 'active-rubric border-purple-500 text-purple-700',
        'class-manager': 'active-class border-indigo-500 text-indigo-700',
        'grading-tool': 'active-grading border-green-500 text-green-700',
        'gradebook': 'active-gradebook border-blue-600 text-blue-800',
        'policy-manager': 'active-policy border-teal-500 text-teal-700',
        'logo-settings': 'active-logo border-pink-500 text-pink-700',
        'help': 'active-help border-gray-500 text-gray-700',
    };

    // some booleans for the little badges…
    const hasRubricData = !!sharedRubric?.assignmentInfo?.title;
    const hasFormData = !!persistentFormData?.student?.name
        || !!persistentFormData?.course?.name
        || !!persistentFormData?.assignment?.name
        || (persistentFormData.attachments?.length > 0)
        || (persistentFormData.videoLinks?.length > 0);
    const hasClassListData = classList?.students?.length > 0;
    const hasActiveSession = gradingSession?.active;
    const hasPolicyData = availablePolicies.length > 0;
    const currentProgramType = classList?.courseMetadata?.programType || 'degree';

    // progress %
    const getGradingProgress = () => {
        if (!classList?.gradingProgress) return { completed: 0, total: 0, percentage: 0 };
        const completed = classList.gradingProgress.filter(p => p.status?.startsWith('completed')).length;
        const total = classList.students.length;
        return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };
    const progress = getGradingProgress();
    const gradebookStats = { students: classList?.students?.length || 0, projects: 0 };

    // logo from sessionStorage
    const getLogoStatus = () => {
        try {
            const logo = sessionStorage.getItem('schoolLogo');
            const name = sessionStorage.getItem('schoolLogoName');
            return { hasLogo: !!logo, logoName: name || 'No logo' };
        } catch {
            return { hasLogo: false, logoName: 'No logo' };
        }
    };
    const logoStatus = getLogoStatus();

    return (
        <div className="tab-navigation border-b border-gray-200 shadow-sm">
            <div className="max-w-8xl mx-auto">

                {/* ——— Primary Tabs Bar ——— */}
                <nav
                    className="flex justify-center space-x-2 px-6 overflow-x-auto"
                    aria-label="Tabs"
                >
                    {tabs.map(tab => {
>>>>>>> logo-insertion
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
<<<<<<< HEAD
                                className={`${isActive
                                    ? `border-b-2 ${activeStyles[tab.id]} bg-white shadow-sm`
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-transparent'
                                    } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm transition-all duration-200 flex items-start gap-2 min-w-fit`}
                                aria-current={isActive ? 'page' : undefined}
                                title={tab.description}
=======
                                aria-current={isActive ? 'page' : undefined}
                                title={tab.description}
                                className={`
                  whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm transition-all duration-200
                  flex items-start gap-2 min-w-fit
                  ${isActive
                                        ? `border-b-2 ${activeStyles[tab.id]} bg-white shadow-sm`
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-transparent'
                                    }
                `}
>>>>>>> logo-insertion
                            >
                                <Icon size={16} className="flex-shrink-0 mt-0.5" />
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium">{tab.name}</span>

<<<<<<< HEAD
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
=======
                                    {/* per‐tab badges */}
                                    {tab.id === 'ai-prompt-generator' && hasRubricData && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                                            <Sparkles size={10} className="mr-1 flex-shrink-0" /> AI Ready
                                        </span>
                                    )}

                                    {tab.id === 'rubric-creator' && hasRubricData && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 whitespace-nowrap">
                                            <Database size={10} className="mr-1 flex-shrink-0" /> Rubric Ready
                                        </span>
                                    )}

                                    {tab.id === 'class-manager' && (
                                        <>
                                            {hasClassListData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 whitespace-nowrap">
                                                    <Users size={10} className="mr-1 flex-shrink-0" /> {classList.students.length} Students
>>>>>>> logo-insertion
                                                </span>
                                            )}
                                            {progress.total > 0 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
<<<<<<< HEAD
                                                    <CheckCircle size={10} className="mr-1 flex-shrink-0" />
                                                    {progress.percentage}% Graded
=======
                                                    <CheckCircle size={10} className="mr-1 flex-shrink-0" /> {progress.percentage}% Graded
>>>>>>> logo-insertion
                                                </span>
                                            )}
                                            {hasActiveSession && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 whitespace-nowrap">
<<<<<<< HEAD
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
=======
                                                    <PlayCircle size={10} className="mr-1 flex-shrink-0" /> Active Session
                                                </span>
                                            )}
                                        </>
                                    )}

                                    {tab.id === 'policy-manager' && (
                                        <>
                                            {hasPolicyData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 whitespace-nowrap">
                                                    <Settings size={10} className="mr-1 flex-shrink-0" /> {availablePolicies.length} Policies
                                                </span>
                                            )}
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                                                <Database size={10} className="mr-1 flex-shrink-0" /> {currentProgramType.charAt(0).toUpperCase() + currentProgramType.slice(1)}
                                            </span>
                                            {policiesLoading && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 whitespace-nowrap">
                                                    <Clock size={10} className="mr-1 flex-shrink-0" /> Loading...
                                                </span>
                                            )}
                                        </>
                                    )}

                                    {tab.id === 'grading-tool' && (
                                        <>
                                            {hasRubricData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                                                    <Database size={10} className="mr-1 flex-shrink-0" /> Rubric Ready
>>>>>>> logo-insertion
                                                </span>
                                            )}
                                            {hasFormData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
<<<<<<< HEAD
                                                    <FileText size={10} className="mr-1 flex-shrink-0" />
                                                    Form Data
=======
                                                    <FileText size={10} className="mr-1 flex-shrink-0" /> Form Data
>>>>>>> logo-insertion
                                                </span>
                                            )}
                                            {hasActiveSession && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 whitespace-nowrap">
<<<<<<< HEAD
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
=======
                                                    <Clock size={10} className="mr-1 flex-shrink-0" /> In Progress
                                                </span>
                                            )}
                                        </>
                                    )}

                                    {tab.id === 'gradebook' && (
                                        <>
                                            {hasClassListData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                                                    <Users size={10} className="mr-1 flex-shrink-0" /> {gradebookStats.students} Students
>>>>>>> logo-insertion
                                                </span>
                                            )}
                                            {gradebookStats.projects > 0 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
<<<<<<< HEAD
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
=======
                                                    <FileText size={10} className="mr-1 flex-shrink-0" /> {gradebookStats.projects} Projects
                                                </span>
                                            )}
                                        </>
                                    )}

                                    {tab.id === 'logo-settings' && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 whitespace-nowrap">
                                            <Image size={10} className="mr-1 flex-shrink-0" /> {logoStatus.hasLogo ? 'Logo Ready' : 'No Logo'}
                                        </span>
                                    )}

                                    {tab.id === 'help' && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">
                                            <HelpCircle size={10} className="mr-1 flex-shrink-0" /> User Guide
>>>>>>> logo-insertion
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </nav>

<<<<<<< HEAD
                {/* Quick Actions Bar */}
                <div className="border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between px-6 py-2">
                        <div className="flex items-center gap-4">
                            {/* Session Management Controls */}
=======
                

                {/* ——— Quick Actions (unchanged) ——— */}
                <div className="border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between px-6 py-2">
                        <div className="flex items-center gap-4">
>>>>>>> logo-insertion
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={exportSession}
                                    className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-xs font-medium"
                                    title="Export Current Session"
                                >
<<<<<<< HEAD
                                    <Save size={12} />
                                    Export
                                </button>

=======
                                    <Save size={12} /> Export
                                </button>
>>>>>>> logo-insertion
                                <input
                                    ref={importSessionInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleSessionImport}
<<<<<<< HEAD
                                    style={{ display: 'none' }}
=======
                                    className="hidden"
>>>>>>> logo-insertion
                                />
                                <button
                                    onClick={() => importSessionInputRef.current?.click()}
                                    className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-xs font-medium"
                                    title="Import Session"
                                >
<<<<<<< HEAD
                                    <Upload size={12} />
                                    Import
                                </button>
                            </div>

                            {/* Help shortcut */}
=======
                                    <Upload size={12} /> Import
                                </button>
                            </div>

>>>>>>> logo-insertion
                            {activeTab !== 'help' && (
                                <button
                                    onClick={() => setActiveTab('help')}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                                    title="Need help? View user guide"
                                >
<<<<<<< HEAD
                                    <HelpCircle size={12} />
                                    Need Help?
                                </button>
                            )}

                            {/* Policy Manager shortcut - only show when class data exists */}
=======
                                    <HelpCircle size={12} /> Need Help?
                                </button>
                            )}

>>>>>>> logo-insertion
                            {activeTab !== 'policy-manager' && hasClassListData && (
                                <button
                                    onClick={() => setActiveTab('policy-manager')}
                                    className="flex items-center gap-1 text-teal-600 hover:text-teal-800 text-xs font-medium"
                                    title="Manage grading policies for your program type"
                                >
<<<<<<< HEAD
                                    <Settings size={12} />
                                    Manage Policies
=======
                                    <Settings size={12} /> Manage Policies
>>>>>>> logo-insertion
                                </button>
                            )}
                        </div>

<<<<<<< HEAD
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
=======
                        <div className="flex items-center gap-2">
                            {/* …all of your per‑tab quick‑action buttons… */}
>>>>>>> logo-insertion
                        </div>
                    </div>
                </div>
            </div>
        </div>
<<<<<<< HEAD


    );
};

export default TabNavigation;
=======
    );
};

export default TabNavigation;
>>>>>>> logo-insertion
