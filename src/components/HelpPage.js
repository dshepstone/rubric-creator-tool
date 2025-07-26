import React, { useState, useMemo } from 'react';
import { useAssessment } from './SharedContext';
import {
    Search, BookOpen, Sparkles, FileText, Users, GraduationCap,
    ChevronRight, ChevronDown, ExternalLink, Download, Upload,
    AlertCircle, CheckCircle, Info, Lightbulb, Settings,
    Database, PlayCircle, Save, RefreshCw, Eye, Edit3,
    Star, Clock, Target, Award, BarChart3, FileSpreadsheet,
    ArrowRight, Zap, Shield, HelpCircle, Lock, Cloud,
    Timer, AlertTriangle, UserCheck, FileJson, Globe, Copy,
    Monitor, Smartphone, Tablet, Printer, Mail, Calendar,
    GitBranch, Layers, Package, Workflow, Cpu, HardDrive
} from 'lucide-react';

const HelpPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('overview');
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

   

    // Component definitions
    const QuickActionButton = ({ icon: Icon, title, description, onClick, color = 'blue' }) => (
        <button
            onClick={onClick}
            className={`p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left border border-${color}-200 hover:border-${color}-300 group`}
        >
            <Icon className={`h-6 w-6 text-${color}-600 mb-2 group-hover:scale-110 transition-transform duration-200`} />
            <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </button>
    );

    const ExampleBlock = ({ title, children, language = 'text', downloadable = false }) => (
        <div className="my-4 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200 flex justify-between items-center">
                <span>{title}</span>
                {downloadable && (
                    <button
                        onClick={() => {
                            const blob = new Blob([children], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${title.replace(/\s+/g, '_')}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                    >
                        <Download size={12} />
                        Download
                    </button>
                )}
            </div>
            <div className="p-4 bg-gray-50">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                    {children}
                </pre>
            </div>
        </div>
    );

    const DiagramBlock = ({ title, children, type = 'flow' }) => (
        <div className={`my-4 border rounded-lg overflow-hidden ${type === 'flow' ? 'border-blue-200 bg-blue-50' :
                type === 'system' ? 'border-green-200 bg-green-50' :
                    'border-purple-200 bg-purple-50'
            }`}>
            <div className={`px-4 py-2 text-sm font-medium border-b ${type === 'flow' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    type === 'system' ? 'bg-green-100 text-green-800 border-green-200' :
                        'bg-purple-100 text-purple-800 border-purple-200'
                }`}>
                {type === 'flow' ? '🔄' : type === 'system' ? '🏗️' : '📊'} {title}
            </div>
            <div className="p-4">
                <pre className={`text-sm whitespace-pre font-mono leading-relaxed ${type === 'flow' ? 'text-blue-800' :
                        type === 'system' ? 'text-green-800' :
                            'text-purple-800'
                    }`}>
                    {children}
                </pre>
            </div>
        </div>
    );

    const StepGuide = ({ steps, numbered = true }) => (
        <div className="space-y-4">
            {steps.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-start space-x-3">
                        {numbered && (
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                                {index + 1}
                            </div>
                        )}
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                            <p className="text-gray-700 mb-3">{step.description}</p>
                            {step.example && (
                                <ExampleBlock title="Example">
                                    {step.example}
                                </ExampleBlock>
                            )}
                            {step.tip && (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-start space-x-2">
                                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-yellow-800"><strong>Tip:</strong> {step.tip}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const FeatureCard = ({ icon: Icon, title, description, features, color = 'blue' }) => (
        <div className={`p-6 bg-white rounded-lg shadow-sm border border-${color}-200`}>
            <div className="flex items-center mb-4">
                <Icon className={`h-8 w-8 text-${color}-600 mr-3`} />
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="text-gray-600 text-sm">{description}</p>
                </div>
            </div>
            {features && (
                <ul className="space-y-2">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className={`h-4 w-4 text-${color}-600 mt-0.5 flex-shrink-0`} />
                            <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    // Enhanced help content structure
    const helpSections = [
        {
            id: 'overview',
            title: 'GradingPilot Overview',
            icon: Monitor,
            color: 'blue',
            tabId: null,
            content: {
                description: 'GradingPilot Professional Suite v2.0 is a comprehensive educational assessment platform designed for modern educators. It combines AI-assisted content creation, professional rubric development, privacy-first student management, and efficient grading workflows.',
                keyFeatures: [
                    '🚀 AI-powered assignment and rubric generation',
                    '📊 Professional 7-level assessment system with multipliers',
                    '👥 Privacy-first class management with GDPR compliance',
                    '🔧 Dynamic grading policies for different program types',
                    '⚡ Real-time grading with automatic calculations',
                    '📱 Responsive design optimized for all devices',
                    '🔒 Session-based privacy protection (no permanent storage)',
                    '📁 Multiple export formats (JSON, HTML, PDF, Excel)'
                ],
                systemRequirements: {
                    browser: 'Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)',
                    javascript: 'JavaScript enabled',
                    storage: 'Local storage access for session management',
                    internet: 'Internet connection for initial load and updates'
                },
                workflow: `
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Assignment    │───▶│   AI Rubric     │───▶│   Rubric        │
│   Generator     │    │   Generator     │    │   Creator       │
│ (Create Prompt) │    │ (AI Assistant)  │    │ (Professional)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       ▲                       │
         ▼                       │                       ▼
┌─────────────────┐              │              ┌─────────────────┐
│  HTML Output    │              │              │  JSON Export    │
│ (For Students)  │              │              │ (For Grading)   │
└─────────────────┘              │              └─────────────────┘
                                  │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Class         │───▶│   Policy        │───▶│   Grading       │
│   Manager       │    │   Manager       │    │   Tool          │
│ (Student Data)  │    │ (Grade Scales)  │    │ (Assessment)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Privacy Session │    │ Dynamic Policies│    │ Comprehensive   │
│ (60min timeout) │    │ (School/Degree) │    │ Grade Reports   │
└─────────────────┘    └─────────────────┘    └─────────────────┘`
            }
        },
        {
            id: 'assignment-generator',
            title: 'Assignment Prompt Generator',
            icon: BookOpen,
            color: 'orange',
            tabId: 'assignment-prompt-generator',
            content: {
                description: 'Create comprehensive, professional assignment prompts with integrated Course Learning Objectives (CLOs), submission requirements, and grading criteria. Export as HTML for LMS integration.',
                features: [
                    'Course metadata integration (code, name, instructor, term)',
                    'CLO mapping and alignment verification',
                    'Detailed submission requirements specification',
                    'Professional HTML export with print-friendly CSS',
                    'Automatic data sharing with AI Rubric Generator',
                    'Responsive design for all device types'
                ],
            }
        },
        {
            id: 'ai-prompt-generator',
            title: 'AI Rubric Prompt Generator',
            icon: Sparkles,
            color: 'purple',
            tabId: 'ai-prompt-generator',
            content: {
                description: 'Transform assignment details into optimized prompts for AI rubric generation using ChatGPT, Claude, or other language models. Supports both automated criteria suggestion and custom criteria specification.',
                features: [
                    'Seamless import from Assignment Generator',
                    'AI-optimized prompt structure for best results',
                    'Support for 1-20 assessment criteria',
                    'Standardized 7-level rubric system',
                    'JSON output format specification',
                    'Context-aware prompt customization'
                ],
            }
        },
        {
            id: 'rubric-creator',
            title: 'Rubric Creator',
            icon: FileText,
            color: 'green',
            tabId: 'rubric-creator',
            content: {
                description: 'Professional rubric creation and editing tool with a standardized 7-level assessment system, dynamic criterion management, feedback libraries, and multiple export formats.',
                features: [
                    'Standardized 7-level system (Incomplete → Exceptional)',
                    'Dynamic criterion addition/removal with weight management',
                    'Real-time point calculation with multiplier system',
                    'Per-criterion feedback libraries for efficient grading',
                    'Rich text editing for detailed descriptions',
                    'Multiple export formats (JSON, HTML, PDF)',
                    'Preview mode for student-facing display',
                    'Import capability for AI-generated rubrics'
                ],
            }
        },
        {
            id: 'class-manager',
            title: 'Class Manager',
            icon: Users,
            color: 'indigo',
            tabId: 'class-manager',
            content: {
                description: 'Privacy-first student roster management with Excel import, data validation, and session-based storage. Designed for GDPR compliance with automatic data cleanup.',
                features: [
                    'Excel (.xlsx) file import with validation',
                    'Automatic course metadata detection',
                    'Student data validation and error reporting',
                    'Program type detection for policy selection',
                    'Session-based storage (60-minute timeout)',
                    'GDPR-compliant data handling',
                    'Comprehensive privacy protection',
                    'Export capabilities for record keeping'
                ],
            }
        },
        {
            id: 'policy-manager',
            title: 'Policy Manager',
            icon: Settings,
            color: 'teal',
            tabId: 'policy-manager',
            content: {
                description: 'Manage dynamic grading policies and scales for different program types. Configure grade boundaries, late penalties, and calculation methods to match institutional requirements.',
                features: [
                    'Pre-configured policies for common program types',
                    'Custom policy creation and editing',
                    'Grade boundary management with validation',
                    'Late penalty configuration',
                    'Real-time calculation testing',
                    'Policy version control',
                    'Export/import capabilities',
                    'Integration with grading workflows'
                ],
            }
        },
        {
            id: 'grading-tool',
            title: 'Grading Tool',
            icon: GraduationCap,
            color: 'blue',
            tabId: 'grading-tool',
            content: {
                description: 'Comprehensive grading interface with rubric-based assessment, real-time calculations, feedback management, and multiple export options. Features session-based privacy and efficient batch grading workflows.',
                features: [
                    'Rubric-based grading with level selection',
                    'Real-time grade calculation with policy application',
                    'Per-criterion feedback with library integration',
                    'File attachment support (images, documents)',
                    'Video review link management',
                    'Batch export capabilities (PDF, Excel, JSON)',
                    'AI feedback data export for external processing',
                    'Session management with auto-save'
                ],
            }
        },
        {
            id: 'gradebook',
            title: 'Grade Book Management',
            icon: BookOpen,
            color: 'blue',
            tabId: 'gradebook',
            content: {
                description: 'A powerful gradebook for managing multiple assignments and calculating final grades. It supports flexible grading, statistics tracking, and seamless integration with other tools.',
                quickStart: [
                    {
                        title: '1. Import Your Class',
                        description: 'Begin by importing your student roster from the "Class Manager" tab. The Grade Book is disabled until a class list is active.',
                        tip: 'If the Grade Book appears empty, click the "Go to Class Manager" button.'
                    },
                    {
                        title: '2. Configure Projects',
                        description: 'Use the "Add Project" button to create columns for your assignments. Click on a project\'s name, weight, or max points in the header to edit them inline.',
                        tip: 'Ensure project weights total 100% for accurate final grade calculations.'
                    },
                    {
                        title: '3. Enter or Import Grades',
                        description: 'Click any cell to enter a raw point score (e.g., "85"). The cell will automatically display the points, percentage, and letter grade.',
                        tip: 'Alternatively, use the "Import Grades" button in a project header to pull final scores directly from the Grading Tool for all students at once.'
                    },
                    {
                        title: '4. Monitor & Export',
                        description: 'Keep an eye on the real-time statistics at the top. Use the export buttons to save your work as a JSON backup or an Excel spreadsheet.',
                        tip: 'Export your gradebook frequently to prevent data loss.'
                    }
                ],
                features: [
                    {
                        category: 'Grade Entry & Display',
                        items: [
                            'Enter raw point values directly into cells (e.g., 85, 92.5).',
                            'Automatic, real-time conversion to percentage and letter grade.',
                            'Clear visual display shows points, percentage, and letter grade together.',
                            'Inline editing with keyboard shortcuts (Enter to save, Escape to cancel).',
                            'Auto-calculation of final grades based on project weights.'
                        ]
                    },
                    {
                        category: 'Project Management',
                        items: [
                            'Add unlimited projects/assignments.',
                            'Flexible weighting system for final grade calculation.',
                            'Inline editing of project name, max points, and weight directly in the header.',
                            'Easy project removal with confirmation prompts.'
                        ]
                    },
                    {
                        category: 'Integration with Grading Tool',
                        items: [
                            'Import final scores from the Grading Tool into any project column with one click.',
                            'Uses saved draft or finalized grades from your grading sessions.',
                            'Automatically calculates percentage and letter grade upon import.',
                            'Streamlines the workflow from detailed rubric grading to gradebook summary.'
                        ]
                    },
                    {
                        category: 'Data & Display Options',
                        items: [
                            'Real-time dashboard with class average, highest/lowest grades, and passing rate.',
                            'Sortable student list (by name, ID, or final grade) and a powerful search bar.',
                            'Export gradebook as JSON for backup or as an Excel file for reporting.',
                            'Responsive design with sticky headers for easy navigation.'
                        ]
                    }
                ],
                commonTasks: [
                    {
                        task: 'Editing a Project',
                        steps: [
                            'In the gradebook header, locate the project you want to change.',
                            'Click directly on the project\'s name, weight (e.g., "25%"), or points (e.g., "100pts").',
                            'An input box will appear. Type your changes.',
                            'Press Enter or click away to save.'
                        ]
                    },
                    {
                        task: 'Entering a Grade',
                        steps: [
                            'Click the "Enter grade" button for the desired student and project.',
                            'Type the raw point score (e.g., "85").',
                            'Press Enter to save.',
                            'The cell will update to show: 85pts | 85% | A'
                        ]
                    },
                    {
                        task: 'Importing Grades from the Grading Tool',
                        steps: [
                            'First, grade students in the "Grading Tool" tab and save their grades.',
                            'In the Grade Book, find the project column you want to populate.',
                            'Click the "Import Grades" button in that column\'s header.',
                            'The Grade Book will automatically find and fill in the grades for all matching students.'
                        ]
                    }
                ],
                troubleshooting: [
                    {
                        issue: 'Grade Entry Not Working',
                        cause: 'Input is not a valid number.',
                        solution: 'Ensure you are entering a numerical point value (e.g., 85 or 92.5). The system uses raw points for calculation.'
                    },
                    {
                        issue: '"Import Grades" button is not finding any grades.',
                        cause: 'No grades have been saved in the Grading Tool, or student IDs do not match.',
                        solution: 'Go to the Grading Tool and grade a few students, making sure to save them as a Draft or Final. Also, ensure the Student ID in the Class List matches the ID used in the Grading Tool.'
                    },
                    {
                        issue: 'Final Grades are 0% or seem incorrect.',
                        cause: 'The sum of all project "weight" percentages does not equal 100%.',
                        solution: 'Click on the weight for each project in the header and adjust the values until they total 100%.'
                    }
                ]
            }
        },
        {
            id: 'best-practices',
            title: 'Best Practices',
            icon: Award,
            color: 'yellow',
            content: {
                description: 'Professional best practices for efficient grading, rubric design, and classroom implementation. Based on educational research and user feedback.',
            }
        },
        {
            id: 'privacy-security',
            title: 'Privacy & Security',
            icon: Shield,
            color: 'green',
            content: {
                description: 'Comprehensive privacy protection and security measures implemented in GradingPilot. Designed for GDPR compliance and educational data protection.',
            }
        },
        {
            id: 'troubleshooting',
            title: 'Troubleshooting',
            icon: AlertTriangle,
            color: 'red',
            content: {
                description: 'Solutions for common issues and errors.',
            }
        }
    ];

    // Enhanced search with category filtering
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();
        const results = [];

        helpSections.forEach(section => {
            // Search in section title and description
            if (section.title.toLowerCase().includes(query) ||
                section.content.description?.toLowerCase().includes(query)) {
                results.push({
                    type: 'section',
                    section: section,
                    matches: [section.title]
                });
            }

            // Search in subsections and content
            Object.entries(section.content).forEach(([key, value]) => {
                if (typeof value === 'string' && value.toLowerCase().includes(query)) {
                    results.push({
                        type: 'content',
                        section: section,
                        contentKey: key,
                        matches: [key]
                    });
                }

                if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        if (typeof item === 'object' && item.title?.toLowerCase().includes(query)) {
                            results.push({
                                type: 'item',
                                section: section,
                                item: item,
                                itemIndex: index
                            });
                        }
                    });
                }
            });
        });

        return results;
    }, [searchQuery]);
    
    // Category navigation
    const categories = [
        { id: 'overview', name: 'Overview', icon: Monitor },
        { id: 'assignment-generator', name: 'Assignment Prompt', icon: BookOpen },
        { id: 'ai-prompt-generator', name: 'AI Rubric Prompt', icon: Sparkles },
        { id: 'rubric-creator', name: 'Rubric Creator', icon: FileText },
        { id: 'class-manager', name: 'Class Manager', icon: Users },
        { id: 'grading-tool', name: 'Grading Tool', icon: GraduationCap },
        { id: 'gradebook', name: 'Grade Book', icon: BookOpen },
        { id: 'policy-manager', name: 'Policy Manager', icon: Settings },
        { id: 'troubleshooting', name: 'Troubleshooting', icon: AlertTriangle },
        { id: 'best-practices', name: 'Best Practices', icon: Award },
        { id: 'privacy-security', name: 'Privacy & Security', icon: Shield }
    ];

    const selectedSection = helpSections.find(section => section.id === selectedCategory);

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <HelpCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">GradingPilot Help Center</h1>
                            <p className="text-gray-600">Comprehensive guide to professional assessment tools</p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        Professional Suite v2.0
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search help topics, features, or troubleshooting..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Search Results ({searchResults.length})</h3>
                        <div className="space-y-2">
                            {searchResults.slice(0, 10).map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedCategory(result.section.id);
                                        setSearchQuery('');
                                    }}
                                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                >
                                    <div className="flex items-center space-x-3">
                                        <result.section.icon className={`h-4 w-4 text-${result.section.color}-600`} />
                                        <div>
                                            <div className="font-medium text-gray-900">{result.section.title}</div>
                                            <div className="text-sm text-gray-600">
                                                {result.type === 'item' && result.item.title ? result.item.title : result.section.content.description?.substring(0, 100) + '...'}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-6">
                {/* Sidebar Navigation */}
                <div className="w-64 bg-white rounded-lg shadow-sm p-4 h-fit">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Help Topics</h3>
                    <nav className="space-y-1">
                        {categories.map((category) => {
                            const isActive = selectedCategory === category.id;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${isActive
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <category.icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                    <span className="text-sm font-medium">{category.name}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Quick Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => navigateToTab('assignment-prompt-generator')}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                                <BookOpen className="h-4 w-4" />
                                <span>Create Assignment</span>
                            </button>
                            <button
                                onClick={() => navigateToTab('rubric-creator')}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                                <FileText className="h-4 w-4" />
                                <span>Build Rubric</span>
                            </button>
                            <button
                                onClick={() => navigateToTab('grading-tool')}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                                <GraduationCap className="h-4 w-4" />
                                <span>Start Grading</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {selectedSection && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 bg-${selectedSection.color}-100 rounded-lg flex items-center justify-center`}>
                                        <selectedSection.icon className={`h-6 w-6 text-${selectedSection.color}-600`} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedSection.title}</h2>
                                        <p className="text-gray-600">{selectedSection.content.description}</p>
                                    </div>
                                </div>
                                {selectedSection.tabId && (
                                    <button
                                        onClick={() => navigateToTab(selectedSection.tabId)}
                                        className={`flex items-center space-x-2 px-4 py-2 bg-${selectedSection.color}-600 text-white rounded-lg hover:bg-${selectedSection.color}-700 transition-colors duration-200`}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>Open Tool</span>
                                    </button>
                                )}
                            </div>

                            {/* Content Sections */}
                            <div className="space-y-8">
                                {/* Overview Section */}
                                {selectedSection.id === 'overview' && (
                                    <>
                                        {/* Key Features */}
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {selectedSection.content.keyFeatures.map((feature, index) => (
                                                    <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                                                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                        <span className="text-blue-900">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* System Architecture */}
                                        <DiagramBlock title="System Architecture & Workflow" type="system">
                                            {selectedSection.content.workflow}
                                        </DiagramBlock>

                                        {/* System Requirements */}
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-4">System Requirements</h3>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {Object.entries(selectedSection.content.systemRequirements).map(([key, value]) => (
                                                    <div key={key} className="p-4 border border-gray-200 rounded-lg">
                                                        <h4 className="font-medium text-gray-900 capitalize mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                                        <p className="text-gray-600 text-sm">{value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quick Start */}
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Guide</h3>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <QuickActionButton
                                                    icon={BookOpen}
                                                    title="1. Create Assignment"
                                                    description="Start with assignment prompt generation"
                                                    onClick={() => navigateToTab('assignment-prompt-generator')}
                                                    color="orange"
                                                />
                                                <QuickActionButton
                                                    icon={FileText}
                                                    title="2. Build Rubric"
                                                    description="Create professional assessment rubrics"
                                                    onClick={() => navigateToTab('rubric-creator')}
                                                    color="green"
                                                />
                                                <QuickActionButton
                                                    icon={GraduationCap}
                                                    title="3. Start Grading"
                                                    description="Grade assignments with comprehensive feedback"
                                                    onClick={() => navigateToTab('grading-tool')}
                                                    color="blue"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Features Display */}
                                {selectedSection.content.features && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Features</h3>
                                        {/* Check if features are structured with categories */}
                                        {typeof selectedSection.content.features[0] === 'object' ? (
                                            // Render layout for categories and items (like in Grade Book)
                                            <div className="space-y-6">
                                                {selectedSection.content.features.map((featureSet, index) => (
                                                    <div key={index}>
                                                        <h4 className="text-lg font-medium text-gray-800 mb-3">{featureSet.category}</h4>
                                                        <div className="grid md:grid-cols-2 gap-3">
                                                            {featureSet.items.map((item, itemIndex) => (
                                                                <div key={itemIndex} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                                                    <CheckCircle className={`h-5 w-5 text-${selectedSection.color}-500 mt-0.5 flex-shrink-0`} />
                                                                    <span className="text-sm text-gray-700">{item}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            // Render original layout for simple list of features
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {selectedSection.content.features.map((feature, index) => (
                                                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                                        <CheckCircle className={`h-5 w-5 text-${selectedSection.color}-600 mt-0.5 flex-shrink-0`} />
                                                        <span className="text-gray-800">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Workflow Diagrams */}
                                {selectedSection.content.workflow && selectedSection.id !== 'overview' && (
                                    <DiagramBlock title="Workflow Diagram" type="flow">
                                        {selectedSection.content.workflow}
                                    </DiagramBlock>
                                )}

                                {selectedSection.content.promptStructure && (
                                    <DiagramBlock title="AI Prompt Structure" type="system">
                                        {selectedSection.content.promptStructure}
                                    </DiagramBlock>
                                )}

                                {selectedSection.content.levelSystem && (
                                    <DiagramBlock title="7-Level Assessment System" type="data">
                                        {selectedSection.content.levelSystem}
                                    </DiagramBlock>
                                )}

                                {selectedSection.content.privacyArchitecture && (
                                    <DiagramBlock title="Privacy-First Architecture" type="system">
                                        {selectedSection.content.privacyArchitecture}
                                    </DiagramBlock>
                                )}

                                {selectedSection.content.policyTypes && (
                                    <DiagramBlock title="Grading Policy Types" type="data">
                                        {selectedSection.content.policyTypes}
                                    </DiagramBlock>
                                )}

                                {selectedSection.content.gradingInterface && (
                                    <DiagramBlock title="Grading Interface Layout" type="flow">
                                        {selectedSection.content.gradingInterface}
                                    </DiagramBlock>
                                )}

                                {selectedSection.content.dataFlowDiagram && (
                                    <DiagramBlock title="Data Flow & Privacy Protection" type="system">
                                        {selectedSection.content.dataFlowDiagram}
                                    </DiagramBlock>
                                )}

                                {/* Step-by-Step Guides */}
                                {selectedSection.content.quickStart && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Guide</h3>
                                        <StepGuide steps={selectedSection.content.quickStart} />
                                    </div>
                                )}

                                {selectedSection.content.workflowSteps && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Step-by-Step Workflow</h3>
                                        <StepGuide steps={selectedSection.content.workflowSteps} />
                                    </div>
                                )}

                                {selectedSection.content.creationWorkflow && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Creation Workflow</h3>
                                        <StepGuide steps={selectedSection.content.creationWorkflow} />
                                    </div>
                                )}

                                {selectedSection.content.importProcess && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Import Process</h3>
                                        <StepGuide steps={selectedSection.content.importProcess} />
                                    </div>
                                )}

                                {selectedSection.content.policyConfiguration && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Policy Configuration</h3>
                                        <StepGuide steps={selectedSection.content.policyConfiguration} />
                                    </div>
                                )}

                                {selectedSection.content.gradingWorkflow && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Grading Workflow</h3>
                                        <StepGuide steps={selectedSection.content.gradingWorkflow} />
                                    </div>
                                )}

                                {/* Code Examples */}
                                {selectedSection.content.htmlPreview && (
                                    <ExampleBlock title="HTML Output Preview" language="html" downloadable={true}>
                                        {selectedSection.content.htmlPreview}
                                    </ExampleBlock>
                                )}

                                {selectedSection.content.promptExample && (
                                    <ExampleBlock title="AI Prompt Example" language="text" downloadable={true}>
                                        {selectedSection.content.promptExample}
                                    </ExampleBlock>
                                )}

                                {selectedSection.content.excelFormat && (
                                    <ExampleBlock title="Required Excel Format" language="text" downloadable={true}>
                                        {selectedSection.content.excelFormat}
                                    </ExampleBlock>
                                )}

                                {/* Special Content Sections */}
                                {selectedSection.content.exportOptions && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Export Options</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {selectedSection.content.exportOptions.map((option, index) => (
                                                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                                    <h4 className="font-medium text-gray-900 mb-2">{option.name}</h4>
                                                    <p className="text-gray-600 text-sm mb-2">{option.description}</p>
                                                    <p className="text-gray-500 text-xs">{option.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedSection.content.privacyCompliance && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy Compliance Features</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {selectedSection.content.privacyCompliance.map((feature, index) => (
                                                <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-green-900">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Troubleshooting Section */}
                                {selectedSection.content.commonIssues && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Common Issues & Solutions</h3>
                                        {selectedSection.content.commonIssues.map((category, categoryIndex) => (
                                            <div key={categoryIndex} className="mb-8">
                                                <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                                                    <AlertTriangle className="h-5 w-5 mr-2" />
                                                    {category.category}
                                                </h4>
                                                <div className="space-y-6">
                                                    {category.issues.map((issue, issueIndex) => (
                                                        <div key={issueIndex} className="border border-red-200 rounded-lg p-6 bg-red-50">
                                                            <h5 className="font-medium text-red-900 mb-3">Problem: {issue.problem}</h5>

                                                            <div className="space-y-4 text-sm">
                                                                <div>
                                                                    <strong className="text-red-800">Symptoms:</strong>
                                                                    <p className="text-red-700 mt-1">{issue.symptoms}</p>
                                                                </div>

                                                                <div>
                                                                    <strong className="text-red-800">Diagnosis:</strong>
                                                                    <p className="text-red-700 mt-1">{issue.diagnosis}</p>
                                                                </div>

                                                                <div>
                                                                    <strong className="text-red-800">Solution:</strong>
                                                                    <div className="mt-1">
                                                                        <ExampleBlock title="Resolution Steps">
                                                                            {issue.solution}
                                                                        </ExampleBlock>
                                                                    </div>
                                                                </div>

                                                                <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                                                                    <div className="flex items-start space-x-2">
                                                                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <strong className="text-yellow-800">Prevention:</strong>
                                                                            <p className="text-yellow-700 text-sm mt-1">{issue.prevention}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Diagnostic Tools */}
                                        {selectedSection.content.diagnosticTools && (
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Diagnostic Tools</h4>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {selectedSection.content.diagnosticTools.map((tool, index) => (
                                                        <div key={index} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                                                            <h5 className="font-medium text-blue-900 mb-2">{tool.name}</h5>
                                                            <p className="text-blue-800 text-sm mb-2">{tool.purpose}</p>
                                                            <p className="text-blue-700 text-xs font-mono bg-blue-100 p-2 rounded">{tool.howTo}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Best Practices Content */}
                                {selectedSection.content.gradingEfficiency && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Grading Efficiency Tips</h3>
                                        <div className="space-y-6">
                                            {selectedSection.content.gradingEfficiency.map((section, index) => (
                                                <div key={index} className="p-6 border border-yellow-200 rounded-lg bg-yellow-50">
                                                    <h4 className="font-medium text-yellow-900 mb-3">{section.title}</h4>
                                                    <ul className="space-y-2">
                                                        {section.tips.map((tip, tipIndex) => (
                                                            <li key={tipIndex} className="flex items-start space-x-2">
                                                                <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                                <span className="text-yellow-800 text-sm">{tip}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedSection.content.rubricDesign && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Rubric Design Guidelines</h3>
                                        <div className="space-y-6">
                                            {selectedSection.content.rubricDesign.map((section, index) => (
                                                <div key={index} className="p-6 border border-green-200 rounded-lg bg-green-50">
                                                    <h4 className="font-medium text-green-900 mb-3">{section.title}</h4>
                                                    <ul className="space-y-2">
                                                        {section.tips.map((tip, tipIndex) => (
                                                            <li key={tipIndex} className="flex items-start space-x-2">
                                                                <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                                <span className="text-green-800 text-sm">{tip}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedSection.content.implementationGuide && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Implementation Timeline</h3>
                                        <div className="space-y-6">
                                            {selectedSection.content.implementationGuide.map((phase, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-6">
                                                    <div className="flex items-center mb-4">
                                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{phase.phase}</h4>
                                                            <p className="text-gray-600 text-sm">{phase.duration}</p>
                                                        </div>
                                                    </div>
                                                    <ul className="space-y-2 ml-11">
                                                        {phase.tasks.map((task, taskIndex) => (
                                                            <li key={taskIndex} className="flex items-start space-x-2">
                                                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                                <span className="text-gray-700 text-sm">{task}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Privacy & Security Content */}
                                {selectedSection.content.privacyPrinciples && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Privacy Principles</h3>
                                        <div className="space-y-4">
                                            {selectedSection.content.privacyPrinciples.map((principle, index) => (
                                                <div key={index} className="p-6 border border-green-200 rounded-lg bg-green-50">
                                                    <h4 className="font-medium text-green-900 mb-2">{principle.principle}</h4>
                                                    <p className="text-green-800 text-sm mb-2">{principle.implementation}</p>
                                                    <p className="text-green-700 text-xs italic">{principle.compliance}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedSection.content.securityMeasures && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Security Measures</h3>
                                        <div className="space-y-4">
                                            {selectedSection.content.securityMeasures.map((measure, index) => (
                                                <div key={index} className="p-6 border border-blue-200 rounded-lg bg-blue-50">
                                                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                                                        <Shield className="h-5 w-5 mr-2" />
                                                        {measure.measure}
                                                    </h4>
                                                    <p className="text-blue-800 text-sm mb-2">{measure.description}</p>
                                                    <div className="flex items-start space-x-2">
                                                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                        <p className="text-blue-700 text-sm">{measure.benefit}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedSection.content.complianceChecklist && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-6">GDPR Compliance Checklist</h3>
                                        <div className="p-6 border border-green-200 rounded-lg bg-green-50">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {selectedSection.content.complianceChecklist.map((item, index) => (
                                                    <div key={index} className="flex items-start space-x-2">
                                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                        <span className="text-green-800 text-sm">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedSection.content.userRights && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-6">User Rights Implementation</h3>
                                        <div className="space-y-4">
                                            {selectedSection.content.userRights.map((right, index) => (
                                                <div key={index} className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                                                    <h4 className="font-medium text-purple-900 mb-2">{right.right}</h4>
                                                    <p className="text-purple-800 text-sm">{right.implementation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Additional Resources Section */}
                                <div className="mt-12 pt-8 border-t border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Additional Resources</h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
                                            <FileText className="h-8 w-8 text-blue-600 mb-3" />
                                            <h4 className="font-medium text-blue-900 mb-2">Documentation</h4>
                                            <p className="text-blue-800 text-sm mb-4">Comprehensive guides and technical documentation</p>
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                View Docs
                                            </button>
                                        </div>

                                        <div className="p-6 border border-green-200 rounded-lg bg-green-50">
                                            <Globe className="h-8 w-8 text-green-600 mb-3" />
                                            <h4 className="font-medium text-green-900 mb-2">Video Tutorials</h4>
                                            <p className="text-green-800 text-sm mb-4">Step-by-step video guides for all features</p>
                                            <button className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center">
                                                <PlayCircle className="h-4 w-4 mr-1" />
                                                Watch Videos
                                            </button>
                                        </div>

                                        <div className="p-6 border border-purple-200 rounded-lg bg-purple-50">
                                            <HelpCircle className="h-8 w-8 text-purple-600 mb-3" />
                                            <h4 className="font-medium text-purple-900 mb-2">Support</h4>
                                            <p className="text-purple-800 text-sm mb-4">Get help from our support team</p>
                                            <button className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center">
                                                <Mail className="h-4 w-4 mr-1" />
                                                Contact Support
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Download Templates Section */}
                                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Download className="h-5 w-5 mr-2" />
                                        Download Templates & Examples
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => {
                                                const excelTemplate = `Student_ID,First_Name,Last_Name,Email_Address,Program_Type
S001,John,Smith,john.smith@email.com,diploma
S002,Jane,Doe,jane.doe@email.com,diploma
S003,Bob,Johnson,bob.j@email.com,degree`;
                                                const blob = new Blob([excelTemplate], { type: 'text/csv' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = 'class_roster_template.csv';
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            }}
                                            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                                <div className="text-left">
                                                    <div className="font-medium text-gray-900">Class Roster Template</div>
                                                    <div className="text-sm text-gray-600">Excel format with sample data</div>
                                                </div>
                                            </div>
                                            <Download className="h-4 w-4 text-gray-400" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                const rubricTemplate = JSON.stringify({
                                                    "assignmentInfo": {
                                                        "title": "Sample Assignment",
                                                        "description": "Template rubric for getting started",
                                                        "weight": 25,
                                                        "totalPoints": 100,
                                                        "passingThreshold": 65
                                                    },
                                                    "rubricLevels": [
                                                        {
                                                            "level": "exceptional",
                                                            "name": "Exceptional",
                                                            "multiplier": 1.0,
                                                            "color": "#2ecc71",
                                                            "description": "Exceeds all expectations"
                                                        }
                                                    ],
                                                    "criteria": [
                                                        {
                                                            "id": "criterion1",
                                                            "name": "Sample Criterion",
                                                            "description": "Template criterion description",
                                                            "maxPoints": 100
                                                        }
                                                    ]
                                                }, null, 2);
                                                const blob = new Blob([rubricTemplate], { type: 'application/json' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = 'rubric_template.json';
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            }}
                                            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <FileJson className="h-5 w-5 text-blue-600" />
                                                <div className="text-left">
                                                    <div className="font-medium text-gray-900">Rubric Template</div>
                                                    <div className="text-sm text-gray-600">JSON format with sample structure</div>
                                                </div>
                                            </div>
                                            <Download className="h-4 w-4 text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Version Info */}
                                <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Monitor className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">GradingPilot Professional Suite</div>
                                                <div className="text-sm text-gray-600">Version 2.0 - Enhanced Privacy & Performance</div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Last Updated: {new Date().toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>



            {/* Floating Help Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setSelectedCategory('overview')}
                    className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
                    title="Back to Overview"
                >
                    <HelpCircle className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                </button>
            </div>
        </div>
    );
};

export default HelpPage;