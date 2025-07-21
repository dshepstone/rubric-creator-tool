import React, { useState, useMemo } from 'react';
import { useAssessment } from './SharedContext';
import {
    Search, BookOpen, Sparkles, FileText, Users, GraduationCap,
    ChevronRight, ChevronDown, ExternalLink, Download, Upload,
    AlertCircle, CheckCircle, Info, Lightbulb, Settings,
    Database, PlayCircle, Save, RefreshCw, Eye, Edit3,
    Star, Clock, Target, Award, BarChart3, FileSpreadsheet,
    ArrowRight, Zap, Shield, HelpCircle
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

    // Help content sections
    const helpSections = [
        {
            id: 'overview',
            title: 'Platform Overview',
            icon: HelpCircle,
            color: 'gray',
            content: {
                description: 'Complete educational assessment platform with AI-powered tools',
                features: [
                    'Generate assignment prompts and HTML pages',
                    'Create AI prompts for rubric generation',
                    'Build professional rubrics with 7-level assessment system',
                    'Import and manage class lists from Excel files',
                    'Grade assignments with integrated rubric system',
                    'Export session data and results'
                ],
                quickStart: [
                    'Start with Assignment Prompt Generator to create your assignment',
                    'Use AI Rubric Prompt Generator to get AI assistance with rubric creation',
                    'Build your detailed rubric in Rubric Creator',
                    'Import your class list in Class Manager',
                    'Begin grading in Grading Tool'
                ]
            }
        },
        {
            id: 'assignment-prompt',
            title: 'Assignment Prompt Generator',
            icon: BookOpen,
            color: 'orange',
            tabId: 'assignment-prompt-generator',
            content: {
                description: 'Generate AI prompts and complete HTML assignment pages',
                features: [
                    'Create detailed assignment descriptions',
                    'Generate AI prompts for assignment creation',
                    'Export HTML pages for student distribution',
                    'Include learning objectives and requirements',
                    'Specify assessment criteria and deliverables'
                ],
                howTo: [
                    'Enter assignment title and basic information',
                    'Add detailed assignment description',
                    'List learning objectives (2-3 key goals)',
                    'Specify special requirements or constraints',
                    'Generate AI prompt or export HTML page',
                    'Use the HTML output in your LMS or website'
                ],
                tips: [
                    'Be specific about deliverables and expectations',
                    'Include clear success criteria',
                    'Consider student skill level when writing requirements',
                    'Test the HTML output before distributing to students'
                ]
            }
        },
        {
            id: 'ai-rubric-prompt',
            title: 'AI Rubric Prompt Generator',
            icon: Sparkles,
            color: 'blue',
            tabId: 'ai-prompt-generator',
            content: {
                description: 'Generate optimized prompts for AI to create detailed rubrics',
                features: [
                    'Smart prompt generation for AI rubric creation',
                    'Customizable assessment levels and criteria',
                    'Integration with popular AI platforms',
                    'Export ready-to-use prompts',
                    'Professional rubric structure templates'
                ],
                howTo: [
                    'Enter assignment title and description',
                    'Specify the number of assessment levels (typically 4-7)',
                    'Choose criteria generation method (AI suggestions or custom)',
                    'Add learning objectives and special requirements',
                    'Generate the AI prompt',
                    'Copy and paste into your preferred AI tool (ChatGPT, Claude, etc.)',
                    'Import the AI-generated JSON into Rubric Creator'
                ],
                tips: [
                    'Be specific about your assessment goals',
                    'Include context about student level and course',
                    'Review AI-generated rubrics carefully before use',
                    'Test the rubric with sample work before full implementation'
                ]
            }
        },
        {
            id: 'rubric-creator',
            title: 'Rubric Creator',
            icon: FileText,
            color: 'purple',
            tabId: 'rubric-creator',
            content: {
                description: 'Professional rubric creation tool with 7-level assessment system',
                features: [
                    '7-level performance scale (Incomplete → Exceptional)',
                    'Dynamic criterion management with custom point values',
                    'Rich text editing for detailed level descriptions',
                    'Feedback library system for efficient grading',
                    'Automatic point calculation with multiplier system',
                    'Export options: JSON for grading, HTML for students',
                    'Professional formatting and layout'
                ],
                howTo: [
                    'Enter assignment information (title, weight, passing threshold)',
                    'Add assessment criteria using the "Add Criterion" button',
                    'Set point values and weights for each criterion',
                    'Define performance level descriptions for each criterion',
                    'Build feedback libraries with pre-written comments',
                    'Preview the rubric layout and point calculations',
                    'Export as JSON for grading or HTML for student distribution',
                    'Use "Use for Grading" button to transfer to Grading Tool'
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
                tips: [
                    'Start with 3-5 key criteria, add more as needed',
                    'Write clear, observable descriptions for each level',
                    'Use consistent language across criteria',
                    'Build comprehensive feedback libraries to save time during grading',
                    'Test your rubric with sample student work',
                    'Consider the total points and weighting carefully'
                ]
            }
        },
        {
            id: 'class-manager',
            title: 'Class Manager',
            icon: Users,
            color: 'indigo',
            tabId: 'class-manager',
            content: {
                description: 'Import and manage class rosters with Excel integration',
                features: [
                    'Excel file import with automatic validation',
                    'Support for .xlsx and .xls formats',
                    'Course metadata extraction (name, instructor, term)',
                    'Student roster management with ID and email support',
                    'Batch operations and progress tracking',
                    'Integration with grading workflow',
                    'Export capabilities for grade books'
                ],
                howTo: [
                    'Prepare Excel file with student information',
                    'Use the "Import Excel File" button to upload',
                    'Review imported data for accuracy',
                    'Verify course information (automatically extracted)',
                    'Check student roster completeness',
                    'Use "Start Batch Grading" to begin assessment',
                    'Monitor progress through grading indicators'
                ],
                excelFormat: [
                    'Required columns: Student Name, Student ID',
                    'Optional columns: Email, Course Name, Instructor, Term',
                    'First row should contain headers',
                    'Course information can be in metadata or separate columns',
                    'File formats: .xlsx or .xls',
                    'Maximum recommended: 500 students per file'
                ],
                excelExample: {
                    description: 'Example Excel file structure with sample data',
                    headers: ['Student Name', 'Student ID', 'Email', 'Course Name', 'Instructor', 'Term'],
                    sampleRows: [
                        ['John Smith', 'JS001', 'john.smith@email.com', 'Web Design Fundamentals', 'Prof. Anderson', 'Fall 2024'],
                        ['Sarah Johnson', 'SJ002', 'sarah.johnson@email.com', 'Web Design Fundamentals', 'Prof. Anderson', 'Fall 2024'],
                        ['Michael Chen', 'MC003', 'michael.chen@email.com', 'Web Design Fundamentals', 'Prof. Anderson', 'Fall 2024'],
                        ['Emily Rodriguez', 'ER004', 'emily.rodriguez@email.com', 'Web Design Fundamentals', 'Prof. Anderson', 'Fall 2024'],
                        ['David Kim', 'DK005', 'david.kim@email.com', 'Web Design Fundamentals', 'Prof. Anderson', 'Fall 2024']
                    ],
                    notes: [
                        'Each student should have a unique Student ID',
                        'Email addresses should be valid and unique',
                        'Course information can be the same for all students in a class',
                        'Headers are case-sensitive and should match exactly',
                        'Empty cells are allowed but may cause validation warnings'
                    ]
                },
                preparationChecklist: [
                    'Verify all student names are spelled correctly and consistently formatted',
                    'Confirm student IDs follow your institution\'s standard format',
                    'Check that email addresses are current and properly formatted',
                    'Ensure course name, instructor, and term information is consistent',
                    'Remove any test data, duplicate entries, or placeholder rows',
                    'Save the file in Excel format (.xlsx or .xls)',
                    'Test the import with a small subset before processing the full class'
                ],
                tips: [
                    'Keep Excel files simple and clean - avoid merged cells or complex formatting',
                    'Ensure student IDs are unique and consistent across all records',
                    'Include course information for better organization and automatic metadata',
                    'Test with a small sample (3-5 students) before importing large classes',
                    'Save files in .xlsx format for best compatibility',
                    'Double-check email addresses for validity before import',
                    'Use consistent naming conventions for courses and instructors',
                    'Remove any empty rows or columns that might cause parsing errors',
                    'Backup your original files before making any modifications',
                    'Consider creating a template file for future class imports'
                ]
            }
        },
        {
            id: 'grading-tool',
            title: 'Grading Tool',
            icon: GraduationCap,
            color: 'green',
            tabId: 'grading-tool',
            content: {
                description: 'Comprehensive grading interface with rubric integration',
                features: [
                    'Level-based assessment using imported rubrics',
                    'Automatic point calculation and grade conversion',
                    'Rich feedback system with pre-built comments',
                    'Student navigation with progress tracking',
                    'Draft saving and session management',
                    'Attachment and video link support',
                    'Late policy handling and penalty calculation',
                    'Export options for LMS integration'
                ],
                howTo: [
                    'Ensure rubric is loaded (from Rubric Creator)',
                    'Import class list (from Class Manager)',
                    'Start grading session or continue existing session',
                    'Navigate between students using the student selector',
                    'Assess each criterion by selecting performance levels',
                    'Add personalized feedback using the comment system',
                    'Apply late policies if necessary',
                    'Save drafts frequently during grading',
                    'Finalize and export grades when complete'
                ],
                gradingWorkflow: [
                    'Review student submission and assignment requirements',
                    'Assess each criterion against the rubric levels',
                    'Select appropriate performance level for each criterion',
                    'Add specific feedback using the feedback library',
                    'Review total score and grade calculation',
                    'Save progress and move to next student',
                    'Export final grades for gradebook entry'
                ],
                tips: [
                    'Grade in batches for consistency',
                    'Use feedback libraries to maintain consistent comments',
                    'Take breaks during long grading sessions',
                    'Double-check calculations and final grades',
                    'Keep backup copies of grading sessions',
                    'Provide constructive, specific feedback'
                ]
            }
        },
        {
            id: 'workflows',
            title: 'Common Workflows',
            icon: ArrowRight,
            color: 'teal',
            content: {
                description: 'Step-by-step guides for common platform workflows',
                workflows: [
                    {
                        title: 'Complete Assessment Setup',
                        steps: [
                            'Create assignment prompt → Assignment Prompt Generator',
                            'Generate AI rubric prompt → AI Rubric Prompt Generator',
                            'Build detailed rubric → Rubric Creator',
                            'Import class roster → Class Manager',
                            'Begin grading → Grading Tool'
                        ]
                    },
                    {
                        title: 'Quick Rubric Creation',
                        steps: [
                            'Go directly to Rubric Creator',
                            'Enter assignment information',
                            'Add 3-5 key criteria',
                            'Define performance levels',
                            'Export for immediate use'
                        ]
                    },
                    {
                        title: 'Batch Grading Session',
                        steps: [
                            'Prepare rubric in Rubric Creator',
                            'Import class list in Class Manager',
                            'Use "Use for Grading" button for automatic setup',
                            'Grade students systematically',
                            'Export results for gradebook'
                        ]
                    },
                    {
                        title: 'Session Management',
                        steps: [
                            'Export current session regularly (Save button)',
                            'Import previous sessions to continue work',
                            'Use draft system for work-in-progress',
                            'Backup important rubrics and class data'
                        ]
                    }
                ]
            }
        },
        {
            id: 'troubleshooting',
            title: 'Troubleshooting',
            icon: AlertCircle,
            color: 'red',
            content: {
                description: 'Common issues and solutions',
                problems: [
                    {
                        issue: 'Excel import not working',
                        solutions: [
                            'Check file format (.xlsx or .xls only)',
                            'Ensure first row contains headers',
                            'Verify required columns are present',
                            'Try with a smaller sample file first'
                        ]
                    },
                    {
                        issue: 'Rubric not transferring to grading',
                        solutions: [
                            'Complete all required rubric fields',
                            'Save rubric before transferring',
                            'Check that criteria have been defined',
                            'Verify assignment information is complete'
                        ]
                    },
                    {
                        issue: 'Lost grading progress',
                        solutions: [
                            'Use Export Session regularly to backup work',
                            'Check draft system for saved progress',
                            'Import last saved session',
                            'Enable browser local storage'
                        ]
                    },
                    {
                        issue: 'Calculations seem incorrect',
                        solutions: [
                            'Verify criterion weights add up correctly',
                            'Check performance level multipliers',
                            'Review total points settings',
                            'Test with known values'
                        ]
                    }
                ]
            }
        },
        {
            id: 'advanced',
            title: 'Advanced Features',
            icon: Settings,
            color: 'indigo',
            content: {
                description: 'Advanced functionality and customization options',
                features: [
                    {
                        title: 'Custom Feedback Libraries',
                        description: 'Create reusable comment banks for efficient grading',
                        details: [
                            'Build criterion-specific feedback collections',
                            'Organize comments by strengths, improvements, and general',
                            'Use rich text formatting for professional appearance',
                            'Share feedback libraries between rubrics'
                        ]
                    },
                    {
                        title: 'Session Management',
                        description: 'Advanced session handling for complex workflows',
                        details: [
                            'Export complete application state',
                            'Import sessions across devices',
                            'Maintain multiple active projects',
                            'Backup and restore capabilities'
                        ]
                    },
                    {
                        title: 'Batch Operations',
                        description: 'Efficient handling of large classes',
                        details: [
                            'Process multiple students simultaneously',
                            'Apply consistent grading standards',
                            'Export bulk results for LMS integration',
                            'Progress tracking and resumption'
                        ]
                    }
                ]
            }
        },
        {
            id: 'best-practices',
            title: 'Best Practices',
            icon: Star,
            color: 'yellow',
            content: {
                description: 'Professional tips for effective assessment',
                practices: [
                    {
                        category: 'Rubric Design',
                        tips: [
                            'Use clear, observable criteria',
                            'Align with learning objectives',
                            'Provide specific examples for each level',
                            'Test with sample student work',
                            'Keep language consistent across criteria'
                        ]
                    },
                    {
                        category: 'Grading Efficiency',
                        tips: [
                            'Grade all students on one criterion before moving to the next',
                            'Use feedback libraries for consistent comments',
                            'Take regular breaks during long sessions',
                            'Save progress frequently',
                            'Double-check final calculations'
                        ]
                    },
                    {
                        category: 'Student Communication',
                        tips: [
                            'Share rubrics before assignment is due',
                            'Provide clear, constructive feedback',
                            'Focus on specific improvements',
                            'Highlight strengths as well as areas for growth',
                            'Be consistent in expectations across all students'
                        ]
                    },
                    {
                        category: 'Data Management',
                        tips: [
                            'Export sessions regularly for backup',
                            'Keep organized file naming conventions',
                            'Maintain secure storage of student data',
                            'Document rubric changes and versions',
                            'Archive completed sessions appropriately'
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
            // Search in title
            if (section.title.toLowerCase().includes(query)) return true;

            // Search in content
            const content = JSON.stringify(section.content).toLowerCase();
            return content.includes(query);
        });
    }, [searchQuery]);

    // Helper components
    const FeatureList = ({ items, icon: ItemIcon = CheckCircle }) => (
        <ul className="space-y-2">
            {items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                    <ItemIcon size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                </li>
            ))}
        </ul>
    );

    const StepsList = ({ steps, numbered = true }) => (
        <ol className={`space-y-2 ${numbered ? 'list-decimal list-inside' : ''}`}>
            {steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                    {numbered && <span className="font-medium text-blue-600 min-w-[1.5rem]">{index + 1}.</span>}
                    <span className="text-gray-700">{step}</span>
                </li>
            ))}
        </ol>
    );

    const SectionHeader = ({ section, isExpanded, onToggle }) => (
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
        >
            <div className="flex items-center gap-3">
                <section.icon size={24} className={`text-${section.color}-600`} />
                <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-600">{section.content.description}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {section.tabId && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab(section.tabId);
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                        title={`Go to ${section.title}`}
                    >
                        <ExternalLink size={14} className="inline mr-1" />
                        Open
                    </button>
                )}
                {isExpanded ? (
                    <ChevronDown size={20} className="text-gray-600" />
                ) : (
                    <ChevronRight size={20} className="text-gray-600" />
                )}
            </div>
        </button>
    );

    return (
        <div className="help-page min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">User Guide & Help</h1>
                    <p className="text-gray-600 text-lg">
                        Complete documentation for the Assessment Platform
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-lg">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search help topics, features, or functions..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        />
                    </div>
                    {searchQuery && (
                        <p className="mt-2 text-sm text-gray-600">
                            {filteredSections.length} result{filteredSections.length !== 1 ? 's' : ''} found
                        </p>
                    )}
                </div>

                {/* Help Sections */}
                <div className="space-y-6">
                    {filteredSections.map((section) => {
                        const isExpanded = expandedSections[section.id];

                        return (
                            <div key={section.id} className="bg-white rounded-lg shadow-sm border">
                                <SectionHeader
                                    section={section}
                                    isExpanded={isExpanded}
                                    onToggle={() => toggleSection(section.id)}
                                />

                                {isExpanded && (
                                    <div className="p-6 border-t border-gray-100">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Features */}
                                            {section.content.features && (
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <Star size={18} className="text-yellow-500" />
                                                        Key Features
                                                    </h4>
                                                    <FeatureList items={section.content.features} />
                                                </div>
                                            )}

                                            {/* How To */}
                                            {section.content.howTo && (
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <Target size={18} className="text-blue-500" />
                                                        How to Use
                                                    </h4>
                                                    <StepsList steps={section.content.howTo} />
                                                </div>
                                            )}

                                            {/* Quick Start */}
                                            {section.content.quickStart && (
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <Zap size={18} className="text-green-500" />
                                                        Quick Start
                                                    </h4>
                                                    <StepsList steps={section.content.quickStart} />
                                                </div>
                                            )}

                                            {/* Tips */}
                                            {section.content.tips && (
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <Lightbulb size={18} className="text-yellow-500" />
                                                        Pro Tips
                                                    </h4>
                                                    <FeatureList items={section.content.tips} icon={Info} />
                                                </div>
                                            )}

                                            {/* Assessment Levels */}
                                            {section.content.levels && (
                                                <div className="lg:col-span-2">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <Award size={18} className="text-purple-500" />
                                                        Assessment Levels
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {section.content.levels.map((level, index) => (
                                                            <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                                                                <span className="text-sm font-medium text-gray-900">{level}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Excel Format */}
                                            {section.content.excelFormat && (
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <FileSpreadsheet size={18} className="text-green-600" />
                                                        Excel Format Requirements
                                                    </h4>
                                                    <FeatureList items={section.content.excelFormat} icon={CheckCircle} />
                                                </div>
                                            )}

                                            {/* Workflows */}
                                            {section.content.workflows && (
                                                <div className="lg:col-span-2">
                                                    <div className="space-y-6">
                                                        {section.content.workflows.map((workflow, index) => (
                                                            <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                                <h5 className="font-semibold text-blue-900 mb-2">{workflow.title}</h5>
                                                                <StepsList steps={workflow.steps} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Grading Workflow */}
                                            {section.content.gradingWorkflow && (
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <BarChart3 size={18} className="text-green-500" />
                                                        Grading Workflow
                                                    </h4>
                                                    <StepsList steps={section.content.gradingWorkflow} />
                                                </div>
                                            )}

                                            {/* Problems and Solutions */}
                                            {section.content.problems && (
                                                <div className="lg:col-span-2">
                                                    <div className="space-y-4">
                                                        {section.content.problems.map((problem, index) => (
                                                            <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                                                                <h5 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                                                                    <AlertCircle size={16} />
                                                                    {problem.issue}
                                                                </h5>
                                                                <div className="pl-6">
                                                                    <FeatureList items={problem.solutions} icon={CheckCircle} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Advanced Features */}
                                            {section.content.features && typeof section.content.features[0] === 'object' && (
                                                <div className="lg:col-span-2">
                                                    <div className="space-y-6">
                                                        {section.content.features.map((feature, index) => (
                                                            <div key={index} className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                                                <h5 className="font-semibold text-indigo-900 mb-2">{feature.title}</h5>
                                                                <p className="text-indigo-800 mb-3">{feature.description}</p>
                                                                <FeatureList items={feature.details} icon={CheckCircle} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Best Practices */}
                                            {section.content.practices && (
                                                <div className="lg:col-span-2">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {section.content.practices.map((practice, index) => (
                                                            <div key={index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                                                <h5 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                                                                    <Star size={16} />
                                                                    {practice.category}
                                                                </h5>
                                                                <FeatureList items={practice.tips} icon={Lightbulb} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                        <Info size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">Need More Help?</h3>
                            <p className="text-blue-800 mb-4">
                                This comprehensive guide covers all major features and workflows. For specific questions or advanced customizations, consider:
                            </p>
                            <ul className="space-y-2 text-blue-800">
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-blue-600" />
                                    Testing features with sample data first
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-blue-600" />
                                    Exporting sessions regularly as backups
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-blue-600" />
                                    Starting with simple workflows and building complexity
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;