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
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
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
                            >
                                <Icon size={16} className="flex-shrink-0 mt-0.5" />
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium">{tab.name}</span>

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
                                                </span>
                                            )}
                                            {progress.total > 0 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                                                    <CheckCircle size={10} className="mr-1 flex-shrink-0" /> {progress.percentage}% Graded
                                                </span>
                                            )}
                                            {hasActiveSession && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 whitespace-nowrap">
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
                                                </span>
                                            )}
                                            {hasFormData && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                                                    <FileText size={10} className="mr-1 flex-shrink-0" /> Form Data
                                                </span>
                                            )}
                                            {hasActiveSession && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 whitespace-nowrap">
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
                                                </span>
                                            )}
                                            {gradebookStats.projects > 0 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
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
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </nav>

                

                {/* ——— Quick Actions (unchanged) ——— */}
                <div className="border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between px-6 py-2">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={exportSession}
                                    className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-xs font-medium"
                                    title="Export Current Session"
                                >
                                    <Save size={12} /> Export
                                </button>
                                <input
                                    ref={importSessionInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleSessionImport}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => importSessionInputRef.current?.click()}
                                    className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-xs font-medium"
                                    title="Import Session"
                                >
                                    <Upload size={12} /> Import
                                </button>
                            </div>

                            {activeTab !== 'help' && (
                                <button
                                    onClick={() => setActiveTab('help')}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                                    title="Need help? View user guide"
                                >
                                    <HelpCircle size={12} /> Need Help?
                                </button>
                            )}

                            {activeTab !== 'policy-manager' && hasClassListData && (
                                <button
                                    onClick={() => setActiveTab('policy-manager')}
                                    className="flex items-center gap-1 text-teal-600 hover:text-teal-800 text-xs font-medium"
                                    title="Manage grading policies for your program type"
                                >
                                    <Settings size={12} /> Manage Policies
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {/* …all of your per‑tab quick‑action buttons… */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TabNavigation;
