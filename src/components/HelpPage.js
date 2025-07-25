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
                quickStart: [
                    {
                        title: 'Enter Course Information',
                        description: 'Provide basic course details and context',
                        example: 'Course Code: COMP-2100\nCourse Name: Advanced Database Systems\nInstructor: Dr. Sarah Chen\nTerm: Winter 2024\nProgram: Computer Science Diploma',
                        tip: 'This information will be automatically shared with other tools'
                    },
                    {
                        title: 'Define Assignment Details',
                        description: 'Specify assignment type, title, and weight',
                        example: 'Assignment Type: Database Design Project\nTitle: E-Commerce Database Implementation\nWeight: 25% of final grade\nDue Date: March 15, 2024',
                        tip: 'Weight percentage is used for policy calculations in grading'
                    },
                    {
                        title: 'Map Course Learning Objectives',
                        description: 'Connect assignment to specific CLOs',
                        example: 'CLO 1: Design normalized database schemas (Primary)\nCLO 3: Implement complex SQL queries (Secondary)\nCLO 5: Document technical decisions (Supporting)',
                        tip: 'Primary CLOs drive rubric criteria generation'
                    },
                    {
                        title: 'Specify Submission Requirements',
                        description: 'Detail what students must submit',
                        example: 'Required Files:\n• database_schema.sql (DDL statements)\n• sample_data.sql (INSERT statements)\n• queries.sql (Required queries)\n• documentation.pdf (Design decisions)',
                        tip: 'Clear requirements reduce student confusion and grading time'
                    },
                    {
                        title: 'Generate HTML Output',
                        description: 'Create professional assignment page',
                        example: 'Professional Layout:\n• Course header with metadata\n• Clear learning objectives\n• Detailed requirements\n• Submission instructions\n• Grading criteria preview',
                        tip: 'HTML can be uploaded directly to your LMS'
                    }
                ],
                htmlPreview: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>COMP-2100: Database Design Project</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
        .course-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .requirements { background: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; }
        @media print { body { font-size: 12pt; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>Database Design Project</h1>
        <p>COMP-2100: Advanced Database Systems | Dr. Sarah Chen | Winter 2024</p>
    </div>
    
    <div class="course-info">
        <h2>Assignment Overview</h2>
        <p><strong>Weight:</strong> 25% of final grade</p>
        <p><strong>Due Date:</strong> March 15, 2024, 11:59 PM</p>
    </div>
    
    <!-- Additional content sections... -->
</body>
</html>`
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
                promptStructure: `
┌─────────────────────────────────────────────────────────────┐
│                     AI PROMPT STRUCTURE                     │
├─────────────────────────────────────────────────────────────┤
│ 1. CONTEXT SETTING                                          │
│    • Assignment type and educational level                  │
│    • Subject area and learning objectives                   │
│    • Institutional requirements                             │
├─────────────────────────────────────────────────────────────┤
│ 2. RUBRIC SPECIFICATIONS                                    │
│    • 7-level assessment system (0x to 1.0x multipliers)    │
│    • Criteria count and focus areas                        │
│    • Point distribution and weight percentages             │
├─────────────────────────────────────────────────────────────┤
│ 3. OUTPUT FORMAT                                            │
│    • Complete JSON structure specification                  │
│    • Required fields and data types                        │
│    • Example format with placeholders                      │
├─────────────────────────────────────────────────────────────┤
│ 4. QUALITY GUIDELINES                                       │
│    • Observable, measurable criteria                       │
│    • Progressive difficulty across levels                  │
│    • Professional language standards                       │
└─────────────────────────────────────────────────────────────┘`,
                workflowSteps: [
                    {
                        title: 'Import or Enter Assignment Data',
                        description: 'Start with assignment information from previous step or enter manually',
                        example: 'Import from Assignment Generator:\n✓ Course: COMP-2100 Advanced Database Systems\n✓ Assignment: Database Design Project\n✓ CLOs: Design schemas, implement queries\n✓ Weight: 25%',
                        tip: 'Importing ensures consistency across your assessment materials'
                    },
                    {
                        title: 'Configure Criteria Generation',
                        description: 'Choose between AI-suggested criteria or provide your own',
                        example: 'AI-Suggested (Recommended):\n• System analyzes CLOs and assignment type\n• Suggests optimal criteria count (3-6)\n• Balances technical and soft skills\n\nUser-Provided:\n• Database Schema Design\n• SQL Query Implementation\n• Data Integrity & Constraints\n• Documentation Quality',
                        tip: 'AI-suggested often produces more balanced rubrics for complex assignments'
                    },
                    {
                        title: 'Customize Assessment Parameters',
                        description: 'Set point totals, criteria count, and special considerations',
                        example: 'Configuration:\n• Total Points: 100\n• Criteria Count: 5\n• Special Focus: Database normalization\n• Assessment Level: College diploma program',
                        tip: 'Match point totals to your gradebook system for easier integration'
                    },
                    {
                        title: 'Generate and Copy AI Prompt',
                        description: 'System creates optimized prompt for AI consumption',
                        example: 'Generated prompt includes:\n• Full context about assignment\n• Specific rubric requirements\n• JSON output format specification\n• Quality guidelines for AI',
                        tip: 'Copy the entire prompt - missing sections reduce AI output quality'
                    },
                    {
                        title: 'Use with AI Service',
                        description: 'Paste prompt into ChatGPT, Claude, or similar service',
                        example: 'AI Workflow:\n1. Paste complete prompt into AI chat\n2. Review generated rubric for quality\n3. Request refinements if needed\n4. Copy final JSON output\n5. Save as .json file for import',
                        tip: 'Don\'t accept first output - iterate for best results'
                    }
                ],
                promptExample: `Create a comprehensive educational rubric for the following assignment:

**Assignment Type:** Database Design Project
**Course Level:** College Diploma Program
**Subject Area:** Computer Science - Database Systems
**Assignment Description:** Students will design and implement a normalized database schema for an e-commerce system, including complex queries and constraints.

**Criteria Generation:**
Please suggest 5 appropriate criteria for this Computer Science assignment. Base your suggestions on best practices for Database Design Project assessment and the specified learning context.

**Specific Requirements:**
- Total Points: 100 points
- Weight: 25% of Final Grade
- Number of Criteria: 5 main criteria
- Assessment Levels: Use this 7-level system:
  1. Incomplete (0x multiplier)
  2. Unacceptable (0.4x multiplier) 
  3. Developing (0.6x multiplier)
  4. Acceptable - PASS (0.75x multiplier)
  5. Proficient (0.85x multiplier)
  6. Accomplished (0.95x multiplier)
  7. Exceptional (1.0x multiplier)

**Output Format Required:**
Please provide the output as a complete JSON file matching this exact structure:

\`\`\`json
{
  "assignmentInfo": {
    "title": "Database Design Project",
    "description": "Students will design and implement...",
    "weight": 25,
    "totalPoints": 100,
    "passingThreshold": 65,
    "dueDate": "2025-04-15",
    "courseCode": "COMP-2100",
    "instructor": "Dr. Sarah Chen"
  },
  "rubricLevels": [
    // 7-level system as specified above
  ],
  "criteria": [
    {
      "id": "criterion1",
      "name": "Database Schema Design",
      "description": "Quality of ERD, normalization, relationships",
      "maxPoints": 30,
      "levelDescriptions": {
        "incomplete": "No schema submitted or completely unusable",
        // ... descriptions for each level
      }
    }
    // ... additional criteria
  ]
}
\`\`\`

Please ensure each criterion has detailed, observable descriptions for all 7 levels.`
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
                levelSystem: `
┌─────────────────────────────────────────────────────────────┐
│                  7-LEVEL ASSESSMENT SYSTEM                 │
├─────────────────────────────────────────────────────────────┤
│ Level 7: EXCEPTIONAL    │ 1.00x │ 100% │ Exceeds all      │
│                         │       │      │ expectations     │
├─────────────────────────────────────────────────────────────┤
│ Level 6: ACCOMPLISHED   │ 0.95x │  95% │ High quality     │
│                         │       │      │ work             │
├─────────────────────────────────────────────────────────────┤
│ Level 5: PROFICIENT     │ 0.85x │  85% │ Solid work       │
│                         │       │      │ above average    │
├─────────────────────────────────────────────────────────────┤
│ Level 4: ACCEPTABLE     │ 0.75x │  75% │ MINIMUM PASS     │
│                         │       │      │ Meets requirements│
├─────────────────────────────────────────────────────────────┤
│ Level 3: DEVELOPING     │ 0.60x │  60% │ Below standard   │
│                         │       │      │ but improving    │
├─────────────────────────────────────────────────────────────┤
│ Level 2: UNACCEPTABLE   │ 0.40x │  40% │ Major problems   │
│                         │       │      │ need addressing  │
├─────────────────────────────────────────────────────────────┤
│ Level 1: INCOMPLETE     │ 0.00x │   0% │ Not submitted    │
│                         │       │      │ or unusable      │
└─────────────────────────────────────────────────────────────┘`,
                creationWorkflow: [
                    {
                        title: 'Initialize Assignment Information',
                        description: 'Start with basic assignment metadata and parameters',
                        example: 'Assignment Setup:\nTitle: Database Design Project\nDescription: Students create normalized schemas...\nTotal Points: 100\nPassing Threshold: 65%\nDue Date: March 15, 2024',
                        tip: 'Import from Assignment Generator to maintain consistency'
                    },
                    {
                        title: 'Add and Configure Criteria',
                        description: 'Create assessment criteria with appropriate point weights',
                        example: 'Sample Criteria:\n• Database Schema Design (30 points - 30%)\n• SQL Implementation (25 points - 25%)\n• Data Integrity (20 points - 20%)\n• Documentation (15 points - 15%)\n• Code Quality (10 points - 10%)\n\nTotal: 100 points (100%)',
                        tip: 'Ensure weights total 100% - system will validate automatically'
                    },
                    {
                        title: 'Write Level Descriptions',
                        description: 'Create detailed, observable descriptions for each performance level',
                        example: 'Criterion: Database Schema Design\n\nEXCEPTIONAL (100%):\nDemonstrates exceptional database design with advanced normalization (3NF+), optimal indexing strategies, sophisticated relationship management, and comprehensive constraint implementation. Schema shows deep understanding of performance optimization and industry best practices.\n\nACCOMPLISHED (95%):\nShows strong database design with proper normalization, appropriate indexing, clear relationships, and effective constraints. Demonstrates solid understanding of design principles with minor optimization opportunities.\n\n[Continue for all 7 levels...]',
                        tip: 'Use specific, measurable language - avoid subjective terms like "good" or "poor"'
                    },
                    {
                        title: 'Build Feedback Libraries',
                        description: 'Create reusable comment banks for efficient grading',
                        example: 'Feedback Library Examples:\n\nPositive Comments:\n• "Excellent use of foreign key constraints"\n• "Impressive query optimization techniques"\n• "Clear, professional documentation style"\n\nImprovement Areas:\n• "Consider adding indexes for performance"\n• "Review normalization rules for this table"\n• "Add comments to explain complex queries"\n\nNeutral Observations:\n• "Schema meets functional requirements"\n• "Queries return correct results"\n• "Documentation follows required format"',
                        tip: 'Organize feedback by criterion and performance level for quick access'
                    },
                    {
                        title: 'Test and Preview',
                        description: 'Use preview features to verify rubric appearance and calculations',
                        example: 'Testing Checklist:\n✓ All criteria weights total 100%\n✓ Point calculations work correctly\n✓ Level descriptions are clear and distinct\n✓ Student-facing preview looks professional\n✓ Feedback libraries are complete\n✓ Export formats work properly',
                        tip: 'Test with sample grades to ensure calculations are accurate'
                    },
                    {
                        title: 'Export and Distribute',
                        description: 'Generate rubric in appropriate formats for different uses',
                        example: 'Export Options:\n• JSON: For GradingPilot grading tool\n• HTML: For student distribution and LMS\n• PDF: For printing and official records\n• Preview: For real-time student viewing',
                        tip: 'Export HTML version early to share with students - transparency improves learning'
                    }
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
                privacyArchitecture: `
┌─────────────────────────────────────────────────────────────┐
│                    PRIVACY-FIRST DESIGN                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📁 Excel Upload                                            │
│      ↓                                                      │
│  🔍 Local Validation                                        │
│      ↓                                                      │
│  🔒 Encrypted Session Storage (60 min)                     │
│      ↓                                                      │
│  ⚡ In-Memory Processing Only                               │
│      ↓                                                      │
│  🗑️ Automatic Cleanup (No Persistence)                     │
│                                                             │
│  Key Privacy Features:                                      │
│  • No permanent database storage                           │
│  • Session-based encryption                                │
│  • Automatic data destruction                              │
│  • Local processing only                                   │
│  • GDPR compliant by design                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘`,
                excelFormat: `Required Excel Structure:

Column A: Student_ID (unique identifier)
Column B: First_Name 
Column C: Last_Name
Column D: Email_Address
Column E: Program_Type (diploma/degree/certificate)

Metadata Row (Row 1):
Course_Code | Course_Name | Instructor | Term | Section

Example:
COMP-2100 | Advanced Database Systems | Dr. Sarah Chen | Winter 2024 | 001

Student Data (Starting Row 2):
S001 | John | Smith | john.smith@email.com | diploma
S002 | Jane | Doe | jane.doe@email.com | diploma
S003 | Bob | Johnson | bob.j@email.com | degree`,
                importProcess: [
                    {
                        title: 'Prepare Excel File',
                        description: 'Format student data according to required structure',
                        example: 'File Requirements:\n• .xlsx format (not .xls or .csv)\n• Metadata in Row 1 (course info)\n• Student data starting Row 2\n• Required columns: ID, First_Name, Last_Name, Email, Program_Type\n• Program types: diploma, degree, certificate',
                        tip: 'Use official class rosters when possible - they typically have fewer formatting issues'
                    },
                    {
                        title: 'Upload and Validate',
                        description: 'Import file and review validation results',
                        example: 'Validation Report:\n✅ Found 28 students\n✅ Course metadata detected\n⚠️ 2 students missing email addresses\n⚠️ 1 invalid program type\n❌ 3 duplicate student IDs found\n\nActions Required:\n• Fix duplicate IDs\n• Add missing emails\n• Correct program types',
                        tip: 'Address all errors before proceeding - they can cause grading issues later'
                    },
                    {
                        title: 'Configure Privacy Settings',
                        description: 'Set session timeout and privacy preferences',
                        example: 'Privacy Configuration:\n• Session Timeout: 60 minutes (default)\n• Data Encryption: Enabled\n• Auto-cleanup: Enabled\n• Export Logging: Minimal\n• External Sharing: Disabled',
                        tip: 'Set calendar reminders for session expiry to avoid data loss'
                    },
                    {
                        title: 'Verify Policy Assignment',
                        description: 'Confirm correct grading policy based on program types',
                        example: 'Policy Detection:\n• Primary Program: Diploma (85% of students)\n• Selected Policy: School Diploma Programs\n• Grade Scale: A+ (90-100), A (85-89), B+ (80-84)...\n• Late Policy: 20% reduction after 24 hours',
                        tip: 'Mixed program types require manual policy selection'
                    }
                ],
                privacyCompliance: [
                    '✅ Right to Erasure: Automatic after 60 minutes',
                    '✅ Data Minimization: Only essential fields stored',
                    '✅ Purpose Limitation: Education use only',
                    '✅ Storage Limitation: Session-based, no persistence',
                    '✅ Data Portability: Export capabilities provided',
                    '✅ Transparency: Clear privacy notices shown',
                    '✅ Security: Encrypted session storage',
                    '✅ Consent: Institutional consent assumed for grades'
                ]
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
                policyTypes: `
┌─────────────────────────────────────────────────────────────┐
│                    POLICY CATEGORIES                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎓 SCHOOL DIPLOMA PROGRAMS                                 │
│     A+ (95-100%) A (90-94%) A- (85-89%)                    │
│     B+ (80-84%)  B (75-79%) B- (70-74%)                    │
│     C+ (67-69%)  C (64-66%) C- (60-63%)                    │
│     D  (50-59%)  F (0-49%)                                 │
│                                                             │
│  🏛️ UNIVERSITY DEGREE PROGRAMS                              │
│     A+ (90-100%) A (85-89%) A- (80-84%)                    │
│     B+ (77-79%)  B (73-76%) B- (70-72%)                    │
│     C+ (67-69%)  C (63-66%) C- (60-62%)                    │
│     D+ (57-59%)  D (53-56%) D- (50-52%)                    │
│     F  (0-49%)                                             │
│                                                             │
│  📜 CERTIFICATE PROGRAMS                                    │
│     Excellent (85-100%) Good (70-84%)                      │
│     Satisfactory (60-69%) Needs Improvement (0-59%)        │
│                                                             │
│  ⚙️ CUSTOM POLICIES                                         │
│     User-defined grade boundaries                          │
│     Custom late penalty structures                         │
│     Institution-specific requirements                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘`,
                policyConfiguration: [
                    {
                        title: 'Select Policy Template',
                        description: 'Choose appropriate policy for your program type',
                        example: 'Policy Selection:\n• School Diploma Programs (Most common)\n  - A+ starts at 95%\n  - Passing grade: 60% (C-)\n  - Late penalty: 20% after 24 hours\n\n• University Degree Programs\n  - A+ starts at 90%\n  - Passing grade: 50% (D-)\n  - Late penalty: 10% per day',
                        tip: 'Match policy to your institution\'s official grading scale'
                    },
                    {
                        title: 'Customize Grade Boundaries',
                        description: 'Adjust percentage ranges for each letter grade',
                        example: 'Boundary Adjustment:\nOriginal: A (90-94%), A- (85-89%)\nCustom:   A (88-94%), A- (83-87%)\n\nValidation:\n✅ No gaps between grades\n✅ All ranges sum to 100%\n✅ Passing threshold maintained',
                        tip: 'Small changes can significantly impact grade distribution'
                    },
                    {
                        title: 'Configure Late Penalties',
                        description: 'Set up late submission penalty structure',
                        example: 'Late Policy Options:\n\n1. Institutional Standard:\n   - On time: 100%\n   - 1-24 hours: 80% (20% penalty)\n   - >24 hours: 0%\n\n2. Graduated Penalties:\n   - 1-24 hours: 90% (10% penalty)\n   - 2-7 days: 70% (30% penalty)\n   - >7 days: 50% (50% penalty)',
                        tip: 'Align with institutional policy - document any deviations'
                    },
                    {
                        title: 'Test Policy Calculations',
                        description: 'Verify policy works correctly with sample grades',
                        example: 'Test Cases:\n• 89.5% → A- (should round to 90% for A?)\n• 84.9% → B+ (verify boundary behavior)\n• 67% + 20% late penalty = 53.6% → D\n• Edge case: exactly 85% → A- or B+?',
                        tip: 'Test edge cases and rounding behavior thoroughly'
                    },
                    {
                        title: 'Deploy and Monitor',
                        description: 'Activate policy and monitor for issues',
                        example: 'Deployment Checklist:\n✅ Policy validated with test cases\n✅ Backup of previous policy created\n✅ Team notified of changes\n✅ Documentation updated\n✅ First few grades manually verified',
                        tip: 'Keep old policy available in case rollback is needed'
                    }
                ]
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
                gradingInterface: `
┌─────────────────────────────────────────────────────────────┐
│                   GRADING INTERFACE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👤 STUDENT: John Smith (ID: S001)               [3/28]     │
│  ────────────────────────────────────────────────────────   │
│                                                             │
│  📋 DATABASE SCHEMA DESIGN (30 points)                     │
│  ┌─────────────────────────────────────────────────┐       │
│  │ ● Exceptional  ● Accomplished  ● Proficient     │       │
│  │ ○ Acceptable   ○ Developing    ○ Unacceptable   │       │
│  │ ○ Incomplete                                    │       │
│  └─────────────────────────────────────────────────┘       │
│  Points: 28.5/30 (95%) - Accomplished Level                │
│                                                             │
│  💬 Feedback: [Excellent normalization techniques...]      │
│  📎 Attachments: schema_diagram.png, notes.pdf             │
│                                                             │
│  ────────────────────────────────────────────────────────   │
│                                                             │
│  📊 OVERALL GRADE                                           │
│  Raw Score: 87.5/100 (87.5%)                              │
│  Policy Applied: School Diploma Programs                   │
│  Letter Grade: B+ (No late penalty)                        │
│  Status: PASSING (>60% threshold)                          │
│                                                             │
│  💾 [Save Draft]  [Finalize]  [Export Individual]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘`,
                gradingWorkflow: [
                    {
                        title: 'Initialize Grading Session',
                        description: 'Load rubric and class roster to begin grading',
                        example: 'Session Setup:\n1. Import rubric JSON file\n2. Verify criteria and point totals\n3. Load class roster (28 students)\n4. Confirm grading policy (School Diploma)\n5. Note session timeout (60 minutes)\n\nSession Info:\nRubric: Database Project (5 criteria, 100 points)\nPolicy: School Diploma Programs\nClass: COMP-2100-001 (28 students)\nExpires: 3:45 PM (set reminder!)',
                        tip: 'Export session data immediately after setup as backup'
                    },
                    {
                        title: 'Navigate to Student',
                        description: 'Select student and review submission materials',
                        example: 'Student Navigation:\n• Use dropdown: "Smith, John (S001)"\n• Or Previous/Next buttons\n• Or "Jump to Ungraded" option\n\nSubmission Review:\n• Check for all required files\n• Note late submission status\n• Review any special circumstances\n• Prepare workspace for assessment',
                        tip: 'Grade in alphabetical order to maintain consistency'
                    },
                    {
                        title: 'Assess Each Criterion',
                        description: 'Use rubric levels to evaluate each assessment criterion',
                        example: 'Criterion Assessment:\n\n1. Database Schema Design (30 pts)\n   Selected: Accomplished (95% = 28.5 pts)\n   Reason: Strong normalization, minor optimization opportunities\n\n2. SQL Implementation (25 pts)\n   Selected: Proficient (85% = 21.25 pts)\n   Reason: Queries work correctly, could be more efficient\n\n3. Continue for all criteria...',
                        tip: 'Read rubric descriptions carefully - maintain consistency across students'
                    },
                    {
                        title: 'Add Comprehensive Feedback',
                        description: 'Provide specific, actionable feedback using libraries and custom comments',
                        example: 'Feedback Strategy:\n\nStrengths (from library):\n• "Excellent use of foreign key constraints"\n• "Clear, logical table structure"\n\nAreas for Improvement:\n• "Consider adding indexes on frequently queried columns"\n• "Review third normal form rules for the Orders table"\n\nOverall Comment:\n• "Strong technical foundation with good understanding of database principles. Focus on performance optimization for advanced work."',
                        tip: 'Balance positive feedback with specific improvement suggestions'
                    },
                    {
                        title: 'Attach Supporting Materials',
                        description: 'Upload graded files, annotated images, or reference materials',
                        example: 'Attachment Options:\n• Annotated schema diagrams\n• Graded SQL files with comments\n• Screenshots of query results\n• Reference materials or examples\n• Voice recording explanations\n\nFile Support:\n• Images: PNG, JPG, GIF\n• Documents: PDF, DOC, TXT\n• Code: SQL, TXT, MD\n• Max size: 10MB per file',
                        tip: 'Visual feedback is especially valuable for technical assignments'
                    },
                    {
                        title: 'Finalize and Export',
                        description: 'Complete grading and export individual or batch results',
                        example: 'Completion Steps:\n1. Review final grade calculation\n2. Verify all feedback is complete\n3. Check for attached files\n4. Save as draft or finalize\n5. Export individual report (PDF)\n6. Continue to next student\n\nFinal Grade: 87.5% (B+)\nStatus: Passing\nFeedback: Complete\nAttachments: 3 files',
                        tip: 'Export individual reports immediately - session timeout can cause data loss'
                    }
                ],
                exportOptions: [
                    {
                        name: 'Individual PDF Report',
                        description: 'Comprehensive grade report for single student',
                        content: 'Student details, rubric assessment, feedback, attachments, grade breakdown'
                    },
                    {
                        name: 'Class Excel Summary',
                        description: 'Spreadsheet with all student grades and statistics',
                        content: 'Grade totals, percentages, letter grades, class statistics, policy info'
                    },
                    {
                        name: 'Session JSON Backup',
                        description: 'Complete session data for recovery or analysis',
                        content: 'All grading data, rubric, student info, timestamps, attachments'
                    },
                    {
                        name: 'AI Feedback Data',
                        description: 'Structured data for AI-powered feedback generation',
                        content: 'Grade data, rubric context, student info, feedback prompts'
                    }
                ]
            }
        },
        {
            id: 'troubleshooting',
            title: 'Troubleshooting Guide',
            icon: AlertTriangle,
            color: 'red',
            content: {
                description: 'Comprehensive troubleshooting guide for common issues, error resolution, and system optimization. Includes diagnostic steps and preventive measures.',
                commonIssues: [
                    {
                        category: 'File Import Problems',
                        issues: [
                            {
                                problem: 'Excel file won\'t import or shows format errors',
                                symptoms: 'Error messages about file format, missing data, or validation failures',
                                diagnosis: 'File format or structure doesn\'t match requirements',
                                solution: 'Verification Steps:\n1. Ensure file is .xlsx format (not .xls or .csv)\n2. Check metadata row (Row 1) has course information\n3. Verify student data starts in Row 2\n4. Confirm all required columns are present\n5. Check for special characters in names/emails\n6. Verify program types are valid (diploma/degree/certificate)\n\nQuick Fix:\n• Open file in Excel\n• Save As → Excel Workbook (.xlsx)\n• Remove any merged cells\n• Ensure no empty rows between data',
                                prevention: 'Use provided Excel template, avoid manual formatting changes'
                            },
                            {
                                problem: 'Rubric JSON import fails with parsing errors',
                                symptoms: 'JSON parse error messages, missing fields warnings, or incomplete rubric loading',
                                diagnosis: 'JSON structure is invalid or missing required fields',
                                solution: 'JSON Validation:\n1. Copy JSON to online validator (jsonlint.com)\n2. Check for missing commas, brackets, or quotes\n3. Verify all required fields exist:\n   - assignmentInfo (title, totalPoints, etc.)\n   - rubricLevels (all 7 levels with multipliers)\n   - criteria (id, name, maxPoints, descriptions)\n4. Ensure multipliers are numbers, not strings\n5. Check for trailing commas (not allowed in JSON)\n\nRepair Steps:\n• Fix syntax errors first\n• Add missing required fields\n• Verify multiplier values (0.0 to 1.0)\n• Test import with minimal rubric first',
                                prevention: 'Use AI-generated JSON, validate before saving, keep backup copies'
                            }
                        ]
                    },
                    {
                        category: 'Session and Privacy Issues',
                        issues: [
                            {
                                problem: 'Session expires during grading, losing work',
                                symptoms: 'Sudden logout, data not accessible, timeout warnings',
                                diagnosis: 'Session exceeded configured timeout period (default 60 minutes)',
                                solution: 'Recovery Steps:\n1. Check browser local storage for auto-saved drafts\n2. Look for temporary files in Downloads folder\n3. Re-import class roster (student data lost, must restart)\n4. Check if any individual reports were exported\n\nPrevention Strategy:\n• Set multiple alarms (50min, 55min, 58min warnings)\n• Export session data every 20 minutes during grading\n• Work in focused 45-minute blocks\n• Export individual reports immediately after grading each student',
                                prevention: 'Work efficiently, set timers, export frequently, consider shorter sessions'
                            },
                            {
                                problem: 'Cannot export data before session expires',
                                symptoms: 'Export buttons disabled, empty files generated, or browser crashes during export',
                                diagnosis: 'Session corruption, browser memory issues, or insufficient storage space',
                                solution: 'Emergency Export:\n1. Try different export formats (JSON → Excel → PDF)\n2. Export individual students instead of batch\n3. Clear browser cache and retry\n4. Close other browser tabs to free memory\n5. Try incognito/private browsing mode\n6. Copy visible data manually as last resort\n\nData Recovery:\n• Check browser Downloads folder\n• Look in browser local storage\n• Check for auto-saved drafts\n• Review any previously exported files',
                                prevention: 'Export early and often, monitor browser memory usage, close unnecessary tabs'
                            }
                        ]
                    },
                    {
                        category: 'Calculation and Grading Errors',
                        issues: [
                            {
                                problem: 'Grade calculations don\'t match expected values',
                                symptoms: 'Final grades different from manual calculations, unexpected letter grades, or percentage mismatches',
                                diagnosis: 'Policy application, multiplier errors, or weight distribution problems',
                                solution: 'Calculation Debugging:\n1. Verify rubric criterion weights total 100%\n2. Check each performance level multiplier:\n   - Exceptional: 1.0 (100%)\n   - Accomplished: 0.95 (95%)\n   - Proficient: 0.85 (85%)\n   - Acceptable: 0.75 (75%)\n   - Developing: 0.60 (60%)\n   - Unacceptable: 0.40 (40%)\n   - Incomplete: 0.0 (0%)\n3. Test with simple example (all "Accomplished" should = 95%)\n4. Verify grading policy is correctly applied\n5. Check for late penalty application\n\nManual Verification:\n• Calculate: (Score × Weight × Multiplier) for each criterion\n• Sum all criterion scores\n• Apply late penalty if applicable\n• Convert to letter grade using active policy',
                                prevention: 'Test rubrics before use, verify policies, double-check complex calculations'
                            }
                        ]
                    }
                ],
                diagnosticTools: [
                    {
                        name: 'Browser Console',
                        purpose: 'View JavaScript errors and system messages',
                        howTo: 'Press F12 → Console tab → Look for red error messages'
                    },
                    {
                        name: 'Network Tab',
                        purpose: 'Check for connection issues or failed requests',
                        howTo: 'F12 → Network tab → Reload page → Look for failed requests (red entries)'
                    },
                    {
                        name: 'Local Storage Inspector',
                        purpose: 'Examine stored session data',
                        howTo: 'F12 → Application tab → Local Storage → Check for gradingpilot data'
                    },
                    {
                        name: 'JSON Validator',
                        purpose: 'Validate rubric JSON structure',
                        howTo: 'Copy JSON to jsonlint.com or similar validator service'
                    }
                ]
            }
        },

        // GradeBook Help Section - Add this to your HelpPage.js component

        // Add this to the helpSections array in HelpPage.js
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
                gradingEfficiency: [
                    {
                        title: 'Batch Processing Strategy',
                        tips: [
                            'Review all submissions before starting to grade',
                            'Grade one criterion across all students before moving to next',
                            'Use feedback libraries extensively to maintain consistency',
                            'Set up physical workspace to minimize distractions',
                            'Grade during your most alert hours (usually mornings)'
                        ]
                    },
                    {
                        title: 'Consistency Maintenance',
                        tips: [
                            'Re-read rubric descriptions periodically during grading',
                            'Keep notes about edge cases and decisions',
                            'Grade anonymously when possible (use student IDs)',
                            'Take breaks every 45-60 minutes to maintain focus',
                            'Review first and last graded students for drift'
                        ]
                    },
                    {
                        title: 'Quality Assurance',
                        tips: [
                            'Double-check calculations for outlier grades',
                            'Review all feedback for professionalism and clarity',
                            'Verify file attachments are properly associated',
                            'Test export functions before finalizing grades',
                            'Keep backup copies of all grading data'
                        ]
                    }
                ],
                rubricDesign: [
                    {
                        title: 'Criterion Development',
                        tips: [
                            'Align criteria directly with course learning objectives',
                            'Use 3-6 criteria for most assignments (avoid overcomplication)',
                            'Make criteria observable and measurable',
                            'Weight criteria based on learning importance, not work volume',
                            'Include both technical skills and professional behaviors'
                        ]
                    },
                    {
                        title: 'Level Description Writing',
                        tips: [
                            'Use specific, action-oriented language',
                            'Describe what students DO, not what they don\'t do',
                            'Make clear distinctions between adjacent levels',
                            'Include examples of evidence for each level',
                            'Avoid subjective terms like "good" or "adequate"'
                        ]
                    },
                    {
                        title: 'Student Communication',
                        tips: [
                            'Share rubrics with students before assignment due date',
                            'Explain the 7-level system and multipliers',
                            'Provide examples of work at different levels',
                            'Encourage self-assessment using the rubric',
                            'Use rubric language in class discussions and feedback'
                        ]
                    }
                ],
                implementationGuide: [
                    {
                        phase: 'Planning Phase',
                        duration: '1-2 weeks before assignment',
                        tasks: [
                            'Create assignment prompt using Assignment Generator',
                            'Generate AI rubric and refine in Rubric Creator',
                            'Share HTML assignment page with students',
                            'Export rubric HTML for student reference',
                            'Prepare class roster Excel file'
                        ]
                    },
                    {
                        phase: 'Collection Phase',
                        duration: 'Assignment due date to grading start',
                        tasks: [
                            'Collect submissions in organized folder structure',
                            'Note late submissions and timestamps',
                            'Import class roster and verify data',
                            'Set up grading environment and workspace',
                            'Schedule uninterrupted grading time blocks'
                        ]
                    },
                    {
                        phase: 'Grading Phase',
                        duration: '2-5 days depending on class size',
                        tasks: [
                            'Start grading session with rubric import',
                            'Grade systematically using established order',
                            'Export individual reports immediately after each student',
                            'Take regular breaks to maintain consistency',
                            'Monitor session time and export data frequently'
                        ]
                    },
                    {
                        phase: 'Distribution Phase',
                        duration: '1 day after grading completion',
                        tasks: [
                            'Export final class summary to Excel',
                            'Upload grades to LMS or gradebook system',
                            'Distribute individual reports to students',
                            'Archive grading session data for records',
                            'Gather student feedback on rubric clarity'
                        ]
                    }
                ]
            }
        },
        {
            id: 'privacy-security',
            title: 'Privacy & Security',
            icon: Shield,
            color: 'green',
            content: {
                description: 'Comprehensive privacy protection and security measures implemented in GradingPilot. Designed for GDPR compliance and educational data protection.',
                privacyPrinciples: [
                    {
                        principle: 'Data Minimization',
                        implementation: 'Only essential student data is collected (ID, name, email, program type)',
                        compliance: 'GDPR Article 5(1)(c) - adequate, relevant, and limited to necessary'
                    },
                    {
                        principle: 'Purpose Limitation',
                        implementation: 'Data used exclusively for educational assessment and grading',
                        compliance: 'GDPR Article 5(1)(b) - collected for specified, explicit, legitimate purposes'
                    },
                    {
                        principle: 'Storage Limitation',
                        implementation: 'Session-based storage with automatic deletion after 60 minutes',
                        compliance: 'GDPR Article 5(1)(e) - kept for no longer than necessary'
                    },
                    {
                        principle: 'Security',
                        implementation: 'Client-side encryption, HTTPS transport, no permanent database storage',
                        compliance: 'GDPR Article 32 - appropriate technical and organizational measures'
                    }
                ],
                dataFlowDiagram: `
┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📱 User Device                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📂 Excel File Upload                                │   │
│  │      ↓                                              │   │
│  │ 🔍 Client-Side Validation                           │   │
│  │      ↓                                              │   │
│  │ 🔐 Browser Session Storage (Encrypted)             │   │
│  │      ↓                                              │   │
│  │ ⚡ In-Memory Processing                             │   │
│  │      ↓                                              │   │
│  │ 💾 Local Export (User Controlled)                  │   │
│  │      ↓                                              │   │
│  │ 🗑️ Automatic Cleanup (60min timeout)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🚫 NO SERVER STORAGE                                       │
│  🚫 NO DATABASE PERSISTENCE                                 │
│  🚫 NO THIRD-PARTY DATA SHARING                             │
│  🚫 NO CLOUD SYNCHRONIZATION                                │
│                                                             │
│  ✅ GDPR COMPLIANT BY DESIGN                                │
│  ✅ PRIVACY FIRST ARCHITECTURE                              │
│  ✅ USER DATA CONTROL                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘`,
                securityMeasures: [
                    {
                        measure: 'Client-Side Processing',
                        description: 'All data processing occurs in user\'s browser',
                        benefit: 'No server-side data exposure or storage risks'
                    },
                    {
                        measure: 'Session-Based Encryption',
                        description: 'Student data encrypted in browser session storage',
                        benefit: 'Protection against local data access by other applications'
                    },
                    {
                        measure: 'Automatic Data Destruction',
                        description: 'All data automatically deleted after session timeout',
                        benefit: 'No persistent data storage reduces long-term exposure risks'
                    },
                    {
                        measure: 'HTTPS Transport',
                        description: 'All communication encrypted in transit',
                        benefit: 'Protection against network-based attacks and eavesdropping'
                    },
                    {
                        measure: 'No Third-Party Integrations',
                        description: 'No external services access student data',
                        benefit: 'Eliminates third-party data sharing risks'
                    }
                ],
                complianceChecklist: [
                    '✅ Lawful basis for processing (educational institution consent)',
                    '✅ Data subject rights implementation (automatic erasure)',
                    '✅ Privacy by design and by default',
                    '✅ Data protection impact assessment completed',
                    '✅ Security measures appropriate to risk level',
                    '✅ Staff training on privacy procedures',
                    '✅ Data breach response procedures in place',
                    '✅ Record of processing activities maintained'
                ],
                userRights: [
                    {
                        right: 'Right to be Informed',
                        implementation: 'Clear privacy notices displayed during data collection'
                    },
                    {
                        right: 'Right of Access',
                        implementation: 'Users can export all their data at any time'
                    },
                    {
                        right: 'Right to Rectification',
                        implementation: 'Users can edit and correct data during session'
                    },
                    {
                        right: 'Right to Erasure',
                        implementation: 'Automatic data deletion after 60 minutes'
                    },
                    {
                        right: 'Right to Data Portability',
                        implementation: 'Export capabilities in multiple formats (JSON, Excel, PDF)'
                    }
                ]
            }
        }
    ];

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