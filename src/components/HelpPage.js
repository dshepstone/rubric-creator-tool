import React, { useState, useMemo } from 'react';
import { useAssessment } from './SharedContext';
import {
    Search, BookOpen, Sparkles, FileText, Users, GraduationCap,
    ChevronRight, ChevronDown, ExternalLink, Download, Upload,
    AlertCircle, CheckCircle, Info, Lightbulb, Settings,
    Database, PlayCircle, Save, RefreshCw, Eye, Edit3,
    Star, Clock, Target, Award, BarChart3, FileSpreadsheet,
    ArrowRight, Zap, Shield, HelpCircle, Lock, Cloud,
    Timer, AlertTriangle, UserCheck, FileJson, Globe
} from 'lucide-react';

const HelpPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState({});
    const { setActiveTab } = useAssessment();

    // Toggle section expansion
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Navigation to specific tabs
    const navigateToTab = (tabId) => {
        setActiveTab(tabId);
    };

    // Help content sections for GradingPilot v2.0
    const helpSections = [
        {
            id: 'overview',
            title: 'GradingPilot Professional Suite v2.0',
            icon: HelpCircle,
            color: 'blue',
            content: {
                description: 'Advanced educational assessment platform with AI-powered tools, privacy-first design, and cloud integration',
                features: [
                    '🚀 AI-powered assignment and rubric generation',
                    '📊 Professional 7-level rubric creation system',
                    '👥 Excel-based class management with privacy protection',
                    '🔒 Privacy-first architecture with session-based storage',
                    '☁️ Cloud deployment with automatic scaling',
                    '⚡ Real-time grading with policy management',
                    '📱 Responsive design with enhanced accessibility',
                    '🔄 TanStack Query integration for optimal performance'
                ],
                newFeatures: [
                    'Grading Policy Manager - Dynamic policy configuration',
                    'Privacy-first data handling - No permanent student storage',
                    'Session-based temporary storage with auto-cleanup',
                    'Enhanced Excel import with validation',
                    'Cloud deployment capabilities',
                    'Real-time policy previews and calculations'
                ]
            }
        },
        {
            id: 'privacy',
            title: 'Privacy & Data Protection',
            icon: Shield,
            color: 'green',
            content: {
                description: 'GradingPilot v2.0 prioritizes student privacy with advanced data protection features',
                features: [
                    '🔒 No permanent student data storage',
                    '⏱️ Session-based temporary storage (1-hour default)',
                    '🗑️ Auto-delete on logout and session expiry',
                    '📥 JSON export for personal data ownership',
                    '🧹 Automatic cleanup of expired sessions',
                    '🚫 No tracking or analytics on student data',
                    '✅ GDPR and privacy compliance ready'
                ],
                details: [
                    {
                        title: 'Session Management',
                        description: 'All student data is stored temporarily in sessions that automatically expire',
                        features: [
                            'Configurable session timeout (default: 1 hour)',
                            'Automatic cleanup on browser close',
                            'Manual session clearing on logout',
                            'Session data export before expiry'
                        ]
                    },
                    {
                        title: 'Data Export',
                        description: 'Users can export their grading data as JSON files for personal storage',
                        features: [
                            'Complete grading session export',
                            'Class roster export (anonymized)',
                            'Rubric and policy export',
                            'Timestamps and metadata included'
                        ]
                    }
                ]
            }
        },
        {
            id: 'ai-prompt-generator',
            title: 'AI Rubric Prompt Generator',
            icon: Sparkles,
            color: 'purple',
            tabId: 'ai-prompt-generator',
            content: {
                description: 'Create comprehensive AI prompts for automated rubric generation using ChatGPT, Claude, or other AI systems',
                features: [
                    'Smart prompt generation based on assignment details',
                    'Integration with Assignment Prompt Generator data',
                    'Customizable criteria types (AI-suggested or user-defined)',
                    'Professional rubric structure templates',
                    'Learning objectives integration from CLOs',
                    'Weight percentage calculations',
                    'Copy-paste ready prompts for AI systems'
                ],
                workflow: [
                    'Import data from Assignment Prompt Generator or enter manually',
                    'Select assignment type and academic level',
                    'Choose criteria generation method (AI or custom)',
                    'Specify learning objectives and special considerations',
                    'Generate comprehensive AI prompt',
                    'Copy prompt to your preferred AI system',
                    'Import generated rubric back into Rubric Creator'
                ],
                tips: [
                    'Use specific assignment descriptions for better AI results',
                    'Include clear learning objectives for focused criteria',
                    'Specify student population for appropriate language level',
                    'Test with different AI systems for varied approaches'
                ]
            }
        },
        {
            id: 'assignment-prompt-generator',
            title: 'Assignment Prompt Generator',
            icon: FileText,
            color: 'blue',
            tabId: 'assignment-prompt-generator',
            content: {
                description: 'Generate complete assignment prompts and HTML pages with professional formatting',
                features: [
                    'Comprehensive assignment prompt creation',
                    'Course Learning Outcomes (CLO) integration',
                    'Due date and submission requirement management',
                    'Academic integrity and late policy integration',
                    'Professional HTML page generation',
                    'Citation style and submission format specification',
                    'Weight percentage and total points calculation'
                ],
                components: [
                    'Course and assignment metadata',
                    'Detailed assignment descriptions',
                    'Course Learning Outcomes (CLOs) with mapping',
                    'Evaluation criteria and rubric references',
                    'Submission requirements and formatting',
                    'Academic integrity statements',
                    'Late submission policies'
                ],
                outputs: [
                    'Professional HTML assignment page',
                    'Printable PDF-ready format',
                    'Data export for AI Rubric Generator',
                    'JSON backup for future editing'
                ]
            }
        },
        {
            id: 'rubric-creator',
            title: 'Professional Rubric Creator',
            icon: Target,
            color: 'orange',
            tabId: 'rubric-creator',
            content: {
                description: 'Create professional rubrics with the industry-standard 7-level assessment system',
                features: [
                    'Professional 7-level performance scale',
                    'Custom criteria with detailed descriptions',
                    'Rich text editing with formatting options',
                    'Real-time point calculation and weighting',
                    'Feedback library integration',
                    'Multiple export formats (JSON, HTML)',
                    'Direct transfer to Grading Tool',
                    'Preview mode with student view'
                ],
                levels: [
                    'Incomplete (0%) - No submission or unusable',
                    'Unacceptable (30%) - Below minimum standards',
                    'Developing (55%) - Approaching standards',
                    'Acceptable (70%) - Meets minimum standards (PASS)',
                    'Emerging (82%) - Above standard expectations',
                    'Accomplished (92%) - Strong professional quality',
                    'Exceptional (100%) - Outstanding professional quality'
                ],
                workflow: [
                    'Import assignment data or start from scratch',
                    'Define assessment criteria and weights',
                    'Write detailed performance level descriptions',
                    'Build reusable feedback libraries',
                    'Preview rubric in student-facing format',
                    'Export for distribution or transfer to grading',
                    'Use for batch grading with Class Manager'
                ],
                tips: [
                    'Start with 3-5 key criteria, expand as needed',
                    'Write observable, measurable descriptions',
                    'Use consistent language across all levels',
                    'Test rubric with sample student work',
                    'Build comprehensive feedback libraries'
                ]
            }
        },
        {
            id: 'class-manager',
            title: 'Enhanced Class Manager',
            icon: Users,
            color: 'indigo',
            tabId: 'class-manager',
            content: {
                description: 'Import and manage class rosters with Excel integration, privacy protection, and grading policy management',
                features: [
                    'Excel file import with intelligent validation',
                    'Automatic course metadata extraction',
                    'Privacy-compliant student data handling',
                    'Integration with Grading Policy Manager',
                    'Real-time grade calculations with policy preview',
                    'Batch grading session initialization',
                    'Export capabilities (JSON, anonymized)',
                    'Session-based temporary storage'
                ],
                excelRequirements: [
                    'First Name column (required)',
                    'Last Name column (required)',
                    'Student ID or Email (recommended)',
                    'Course metadata in designated cells',
                    'Program type specification for policy selection',
                    'Supported formats: .xlsx, .xls'
                ],
                privacyFeatures: [
                    'Temporary storage only - no permanent database',
                    'Auto-cleanup after session expiry',
                    'Manual data clearing on logout',
                    'Export options for instructor records',
                    'Anonymization tools for sharing'
                ],
                workflow: [
                    'Import Excel file with class roster',
                    'Validate and review imported data',
                    'Select appropriate grading policy',
                    'Preview grade calculations',
                    'Initialize batch grading session',
                    'Export data before session expires'
                ]
            }
        },
        {
            id: 'policy-manager',
            title: 'Grading Policy Manager (NEW)',
            icon: Settings,
            color: 'emerald',
            tabId: 'policy-manager',
            content: {
                description: 'Dynamic grading policy management with institutional standards and custom configurations',
                features: [
                    'Pre-loaded institutional policies (Conestoga, etc.)',
                    'Custom program type configurations',
                    'Dynamic grade scale management',
                    'Real-time policy preview and testing',
                    'Import/export policy configurations',
                    'Version control and audit trails',
                    'Multi-institutional support',
                    'Cloud synchronization capabilities'
                ],
                defaultPolicies: [
                    'Conestoga College - Degree Programs',
                    'Conestoga College - Diploma Programs',
                    'Conestoga College - Certificate Programs',
                    'Custom University Standards',
                    'K-12 Educational Standards'
                ],
                capabilities: [
                    'Create custom grading scales',
                    'Define program-specific policies',
                    'Set passing grade thresholds',
                    'Configure special grading rules',
                    'Manage effective date ranges',
                    'Export policies for institutional use'
                ],
                integration: [
                    'Seamless integration with Class Manager',
                    'Real-time grade calculations',
                    'Policy preview in class roster',
                    'Automatic policy selection by program type',
                    'Override capabilities for special cases'
                ]
            }
        },
        {
            id: 'grading-tool',
            title: 'Advanced Grading Tool',
            icon: GraduationCap,
            color: 'red',
            tabId: 'grading-tool',
            content: {
                description: 'Comprehensive grading interface with rubric integration, batch processing, and session management',
                features: [
                    'Integrated rubric-based grading',
                    'Batch grading with class roster navigation',
                    'Rich feedback composition with libraries',
                    'Draft and final grade management',
                    'Real-time calculation with policy integration',
                    'Session persistence with auto-save',
                    'Export capabilities (individual and batch)',
                    'Late policy integration and overrides'
                ],
                gradingFlow: [
                    'Load rubric from Rubric Creator',
                    'Import class roster from Class Manager',
                    'Start batch grading session',
                    'Grade each student with rubric criteria',
                    'Add personalized feedback and comments',
                    'Review and finalize grades',
                    'Export results and clear session'
                ],
                sessionFeatures: [
                    'Auto-save draft grades every 30 seconds',
                    'Resume interrupted grading sessions',
                    'Export session data before expiry',
                    'Navigate between students seamlessly',
                    'Track grading progress'
                ],
                exportOptions: [
                    'Individual grade reports (PDF)',
                    'Class grade summary (Excel)',
                    'Feedback compilation',
                    'Session data backup (JSON)'
                ]
            }
        },
        {
            id: 'excel-import',
            title: 'Excel Import & Testing',
            icon: FileSpreadsheet,
            color: 'green',
            tabId: 'excel-import-test',
            content: {
                description: 'Advanced Excel import functionality with validation, testing, and error handling',
                features: [
                    'Intelligent file format detection',
                    'Comprehensive data validation',
                    'Error reporting and suggestions',
                    'Course metadata extraction',
                    'Student data normalization',
                    'Privacy-compliant processing',
                    'Test mode for validation',
                    'Batch processing capabilities'
                ],
                supportedFormats: [
                    '.xlsx (Excel 2007+)',
                    '.xls (Excel 97-2003)',
                    'CSV files with proper encoding',
                    'Tab-delimited text files'
                ],
                validationChecks: [
                    'Required column presence',
                    'Data type validation',
                    'Duplicate student detection',
                    'Course metadata verification',
                    'Program type compatibility',
                    'Grading policy alignment'
                ],
                troubleshooting: [
                    'Clear error messages with line numbers',
                    'Suggestions for data correction',
                    'Sample file templates',
                    'Step-by-step resolution guides'
                ]
            }
        },
        {
            id: 'cloud-deployment',
            title: 'Cloud Integration',
            icon: Cloud,
            color: 'sky',
            content: {
                description: 'Professional cloud deployment with privacy-first architecture and minimal maintenance',
                features: [
                    'Docker-based containerization',
                    'Automatic SSL certificate management',
                    'Load balancing and auto-scaling',
                    'Redis session management',
                    'PostgreSQL policy storage',
                    'Nginx reverse proxy configuration',
                    'Automated backup and recovery',
                    'Health monitoring and alerts'
                ],
                privacyArchitecture: [
                    'No permanent student data storage',
                    'Session-only data persistence',
                    'Automatic session cleanup',
                    'Data export before deletion',
                    'GDPR compliance ready',
                    'Audit trail for policy changes'
                ],
                deployment: [
                    'One-command setup scripts',
                    'Copy-paste configuration files',
                    'Automated dependency installation',
                    'SSL certificate auto-renewal',
                    'Domain configuration support',
                    'Environment-specific configs'
                ],
                maintenance: [
                    'Monthly security updates (15 minutes)',
                    'Automatic session cleanup',
                    'Container health monitoring',
                    'Log rotation and management',
                    'Performance optimization'
                ]
            }
        },
        {
            id: 'workflow',
            title: 'Recommended Workflows',
            icon: ArrowRight,
            color: 'teal',
            content: {
                description: 'Optimized workflows for different use cases and scenarios',
                workflows: [
                    {
                        title: 'Complete Assignment Creation',
                        steps: [
                            '1. Use Assignment Prompt Generator to create detailed assignment',
                            '2. Export assignment data to AI Rubric Prompt Generator',
                            '3. Generate AI prompt and create rubric with ChatGPT/Claude',
                            '4. Import rubric into Rubric Creator for refinement',
                            '5. Export HTML assignment page for student distribution',
                            '6. Save rubric for grading when assignments are submitted'
                        ]
                    },
                    {
                        title: 'Class Setup and Grading',
                        steps: [
                            '1. Configure grading policies in Policy Manager',
                            '2. Import class roster via Excel in Class Manager',
                            '3. Preview grade calculations with selected policy',
                            '4. Load saved rubric in Grading Tool',
                            '5. Start batch grading session',
                            '6. Grade all students and export results',
                            '7. Clear session data to maintain privacy'
                        ]
                    },
                    {
                        title: 'Privacy-Compliant Operation',
                        steps: [
                            '1. Import student data into temporary session',
                            '2. Complete all grading within session timeout',
                            '3. Export grading results as JSON before expiry',
                            '4. Manually clear session or allow auto-cleanup',
                            '5. Store exported data in secure local storage',
                            '6. Re-import data if additional grading needed'
                        ]
                    }
                ]
            }
        },
        {
            id: 'troubleshooting',
            title: 'Troubleshooting & Support',
            icon: AlertCircle,
            color: 'red',
            content: {
                description: 'Common issues and solutions for GradingPilot v2.0',
                commonIssues: [
                    {
                        issue: 'Excel import fails with validation errors',
                        solutions: [
                            'Check file format (.xlsx or .xls only)',
                            'Ensure first row contains proper headers',
                            'Verify required columns: First Name, Last Name',
                            'Remove any merged cells or complex formatting',
                            'Try with Excel Import Test tool first'
                        ]
                    },
                    {
                        issue: 'Grading session expires unexpectedly',
                        solutions: [
                            'Export session data regularly during grading',
                            'Increase session timeout in settings (if available)',
                            'Use batch export before session expiry warning',
                            'Consider grading in smaller batches',
                            'Check browser auto-refresh settings'
                        ]
                    },
                    {
                        issue: 'Rubric not transferring to grading tool',
                        solutions: [
                            'Complete all required rubric fields',
                            'Save rubric explicitly before transferring',
                            'Check that all criteria have descriptions',
                            'Verify assignment information is complete',
                            'Try exporting and re-importing rubric'
                        ]
                    },
                    {
                        issue: 'Grade calculations seem incorrect',
                        solutions: [
                            'Verify grading policy is correctly selected',
                            'Check criterion weights sum to 100%',
                            'Review performance level multipliers',
                            'Test calculations with known values',
                            'Use Policy Manager preview feature'
                        ]
                    },
                    {
                        issue: 'Cloud deployment connection issues',
                        solutions: [
                            'Check server status and health endpoints',
                            'Verify SSL certificate validity',
                            'Test with direct IP if domain fails',
                            'Check firewall and port configurations',
                            'Review Docker container logs'
                        ]
                    }
                ]
            }
        },
        {
            id: 'advanced',
            title: 'Advanced Features & Tips',
            icon: Zap,
            color: 'yellow',
            content: {
                description: 'Power user features and optimization tips',
                features: [
                    {
                        title: 'Keyboard Shortcuts',
                        shortcuts: [
                            'Ctrl/Cmd + S: Save current work',
                            'Ctrl/Cmd + E: Export current data',
                            'Tab: Navigate between form fields',
                            'Escape: Close modal dialogs',
                            'Ctrl/Cmd + Enter: Submit forms'
                        ]
                    },
                    {
                        title: 'Batch Operations',
                        operations: [
                            'Bulk student import with validation',
                            'Mass rubric application to multiple assignments',
                            'Batch grade export for multiple classes',
                            'Policy deployment across institutions'
                        ]
                    },
                    {
                        title: 'Integration Tips',
                        tips: [
                            'Use JSON exports for LMS integration',
                            'Set up recurring backup schedules',
                            'Configure institutional branding',
                            'Customize grading policies per department',
                            'Implement automated policy updates'
                        ]
                    },
                    {
                        title: 'Performance Optimization',
                        optimizations: [
                            'Use smaller class batches for large rosters',
                            'Pre-load rubrics before grading sessions',
                            'Clear browser cache if experiencing slowdowns',
                            'Export data regularly to prevent loss',
                            'Use Chrome/Firefox for best performance'
                        ]
                    }
                ]
            }
        }
    ];

    // Filter sections based on search query
    const filteredSections = useMemo(() => {
        if (!searchQuery.trim()) return helpSections;

        const query = searchQuery.toLowerCase();
        return helpSections.filter(section => {
            const titleMatch = section.title.toLowerCase().includes(query);
            const descriptionMatch = section.content.description?.toLowerCase().includes(query);
            const featuresMatch = section.content.features?.some(feature =>
                feature.toString().toLowerCase().includes(query)
            );

            return titleMatch || descriptionMatch || featuresMatch;
        });
    }, [searchQuery]);

    // Color classes for different sections
    const getColorClasses = (color) => {
        const colors = {
            blue: 'border-blue-200 bg-blue-50 text-blue-800',
            purple: 'border-purple-200 bg-purple-50 text-purple-800',
            orange: 'border-orange-200 bg-orange-50 text-orange-800',
            indigo: 'border-indigo-200 bg-indigo-50 text-indigo-800',
            red: 'border-red-200 bg-red-50 text-red-800',
            green: 'border-green-200 bg-green-50 text-green-800',
            emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
            sky: 'border-sky-200 bg-sky-50 text-sky-800',
            teal: 'border-teal-200 bg-teal-50 text-teal-800',
            yellow: 'border-yellow-200 bg-yellow-50 text-yellow-800',
            gray: 'border-gray-200 bg-gray-50 text-gray-800'
        };
        return colors[color] || colors.gray;
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center mb-4">
                    <GraduationCap className="h-12 w-12 text-blue-600 mr-3" />
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">GradingPilot Help Center</h1>
                        <p className="text-lg text-gray-600 mt-2">Professional Suite v2.0 - Complete User Guide</p>
                    </div>
                </div>

                {/* Version Badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
                    <Star className="h-4 w-4 mr-2" />
                    Latest Version: Professional Suite v2.0 with Privacy-First Architecture
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search help topics, features, or troubleshooting..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    />
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
                    Quick Start Guide
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigateToTab('assignment-prompt-generator')}
                        className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left border border-blue-200"
                    >
                        <FileText className="h-6 w-6 text-blue-600 mb-2" />
                        <h3 className="font-medium text-gray-900">1. Create Assignment</h3>
                        <p className="text-sm text-gray-600">Start with assignment prompt generation</p>
                    </button>
                    <button
                        onClick={() => navigateToTab('rubric-creator')}
                        className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left border border-orange-200"
                    >
                        <Target className="h-6 w-6 text-orange-600 mb-2" />
                        <h3 className="font-medium text-gray-900">2. Build Rubric</h3>
                        <p className="text-sm text-gray-600">Create professional assessment rubrics</p>
                    </button>
                    <button
                        onClick={() => navigateToTab('class-manager')}
                        className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left border border-indigo-200"
                    >
                        <Users className="h-6 w-6 text-indigo-600 mb-2" />
                        <h3 className="font-medium text-gray-900">3. Grade Students</h3>
                        <p className="text-sm text-gray-600">Import classes and start grading</p>
                    </button>
                </div>
            </div>

            {/* Help Sections */}
            <div className="space-y-6">
                {filteredSections.map((section) => {
                    const isExpanded = expandedSections[section.id];
                    const IconComponent = section.icon;

                    return (
                        <div
                            key={section.id}
                            className={`border rounded-lg overflow-hidden ${getColorClasses(section.color)}`}
                        >
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-opacity-80 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <IconComponent className="h-6 w-6" />
                                    <div>
                                        <h2 className="text-xl font-semibold">{section.title}</h2>
                                        {section.content.description && (
                                            <p className="text-sm opacity-80 mt-1">
                                                {section.content.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {section.tabId && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigateToTab(section.tabId);
                                            }}
                                            className="px-3 py-1 bg-white bg-opacity-50 rounded-md text-sm font-medium hover:bg-opacity-70 transition-colors"
                                        >
                                            Open Tool
                                        </button>
                                    )}
                                    {isExpanded ? (
                                        <ChevronDown className="h-5 w-5" />
                                    ) : (
                                        <ChevronRight className="h-5 w-5" />
                                    )}
                                </div>
                            </button>

                            {/* Section Content */}
                            {isExpanded && (
                                <div className="px-6 pb-6 bg-white bg-opacity-50">
                                    {/* Features List */}
                                    {section.content.features && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                                            <ul className="space-y-2">
                                                {section.content.features.map((feature, index) => (
                                                    <li key={index} className="flex items-start space-x-2">
                                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                        <span className="text-gray-700">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* New Features */}
                                    {section.content.newFeatures && (
                                        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                                            <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                                                <Zap className="h-5 w-5 mr-2" />
                                                New in v2.0
                                            </h3>
                                            <ul className="space-y-2">
                                                {section.content.newFeatures.map((feature, index) => (
                                                    <li key={index} className="flex items-start space-x-2">
                                                        <Star className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                        <span className="text-green-700">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Workflow */}
                                    {section.content.workflow && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Workflow</h3>
                                            <ol className="space-y-2">
                                                {section.content.workflow.map((step, index) => (
                                                    <li key={index} className="flex items-start space-x-3">
                                                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                                            {index + 1}
                                                        </span>
                                                        <span className="text-gray-700">{step}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}

                                    {/* Workflows (multiple) */}
                                    {section.content.workflows && (
                                        <div className="space-y-6">
                                            {section.content.workflows.map((workflow, workflowIndex) => (
                                                <div key={workflowIndex} className="border border-gray-200 rounded-lg p-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                        {workflow.title}
                                                    </h3>
                                                    <ol className="space-y-2">
                                                        {workflow.steps.map((step, stepIndex) => (
                                                            <li key={stepIndex} className="flex items-start space-x-3">
                                                                <span className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-medium">
                                                                    {stepIndex + 1}
                                                                </span>
                                                                <span className="text-gray-700">{step}</span>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Levels */}
                                    {section.content.levels && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Assessment Levels</h3>
                                            <div className="space-y-2">
                                                {section.content.levels.map((level, index) => (
                                                    <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                                                        <span className="text-gray-700">{level}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tips */}
                                    {section.content.tips && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                                <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                                                Pro Tips
                                            </h3>
                                            <ul className="space-y-2">
                                                {section.content.tips.map((tip, index) => (
                                                    <li key={index} className="flex items-start space-x-2">
                                                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-gray-700">{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Common Issues */}
                                    {section.content.commonIssues && (
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Issues & Solutions</h3>
                                            {section.content.commonIssues.map((item, index) => (
                                                <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                                                    <h4 className="font-medium text-red-800 mb-2 flex items-center">
                                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                                        {item.issue}
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {item.solutions.map((solution, solutionIndex) => (
                                                            <li key={solutionIndex} className="flex items-start space-x-2">
                                                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                                <span className="text-red-700 text-sm">{solution}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Advanced Features */}
                                    {section.content.features?.filter(f => typeof f === 'object').length > 0 && (
                                        <div className="space-y-4">
                                            {section.content.features.filter(f => typeof f === 'object').map((feature, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <h4 className="font-medium text-gray-900 mb-2">{feature.title}</h4>
                                                    <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                                                    {feature.shortcuts && (
                                                        <ul className="space-y-1">
                                                            {feature.shortcuts.map((shortcut, shortcutIndex) => (
                                                                <li key={shortcutIndex} className="text-sm text-gray-600 font-mono">
                                                                    {shortcut}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    {feature.operations && (
                                                        <ul className="space-y-1">
                                                            {feature.operations.map((operation, opIndex) => (
                                                                <li key={opIndex} className="flex items-start space-x-2">
                                                                    <ArrowRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                                    <span className="text-sm text-gray-600">{operation}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    {feature.tips && (
                                                        <ul className="space-y-1">
                                                            {feature.tips.map((tip, tipIndex) => (
                                                                <li key={tipIndex} className="flex items-start space-x-2">
                                                                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                                                    <span className="text-sm text-gray-600">{tip}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    {feature.optimizations && (
                                                        <ul className="space-y-1">
                                                            {feature.optimizations.map((optimization, optIndex) => (
                                                                <li key={optIndex} className="flex items-start space-x-2">
                                                                    <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                                    <span className="text-sm text-gray-600">{optimization}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Additional Details */}
                                    {section.content.details && (
                                        <div className="space-y-4">
                                            {section.content.details.map((detail, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <h4 className="font-medium text-gray-900 mb-2">{detail.title}</h4>
                                                    <p className="text-gray-600 text-sm mb-3">{detail.description}</p>
                                                    {detail.features && (
                                                        <ul className="space-y-1">
                                                            {detail.features.map((feature, featureIndex) => (
                                                                <li key={featureIndex} className="flex items-start space-x-2">
                                                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                                    <span className="text-sm text-gray-600">{feature}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Additional Help?</h3>
                    <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <FileJson className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                            <h4 className="font-medium text-blue-900">Export Data</h4>
                            <p className="text-sm text-blue-700">Download session data for backup</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <Shield className="h-6 w-6 text-green-600 mx-auto mb-2" />
                            <h4 className="font-medium text-green-900">Privacy Compliant</h4>
                            <p className="text-sm text-green-700">No permanent data storage</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <Cloud className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                            <h4 className="font-medium text-purple-900">Cloud Ready</h4>
                            <p className="text-sm text-purple-700">Deploy anywhere</p>
                        </div>
                    </div>
                    <div className="mt-6 text-sm text-gray-500">
                        GradingPilot Professional Suite v2.0 - Advanced Educational Assessment Platform
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;