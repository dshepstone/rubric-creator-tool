import React, { useState, useMemo } from 'react';
import { useAssessment } from './SharedContext';
import {
    Search, BookOpen, Sparkles, FileText, Users, GraduationCap,
    ChevronRight, ChevronDown, ExternalLink, Download, Upload,
    AlertCircle, CheckCircle, Info, Lightbulb, Settings,
    Database, PlayCircle, Save, RefreshCw, Eye, Edit3,
    Star, Clock, Target, Award, BarChart3, FileSpreadsheet,
    ArrowRight, Zap, Shield, HelpCircle, Lock, Cloud,
    Timer, AlertTriangle, UserCheck, FileJson, Globe, Copy
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

    // Code/Example Block Component
    const ExampleBlock = ({ title, children, language = 'text' }) => (
        <div className="my-4 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                {title}
            </div>
            <div className="p-4 bg-gray-50">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {children}
                </pre>
            </div>
        </div>
    );

    // Diagram Component
    const DiagramBlock = ({ title, children }) => (
        <div className="my-4 border border-blue-200 rounded-lg overflow-hidden bg-blue-50">
            <div className="bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 border-b border-blue-200">
                📊 {title}
            </div>
            <div className="p-4">
                <pre className="text-sm text-blue-800 whitespace-pre font-mono leading-relaxed">
                    {children}
                </pre>
            </div>
        </div>
    );

    // Step-by-step guide component
    const StepGuide = ({ steps }) => (
        <div className="my-4 space-y-3">
            {steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{step.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                        {step.example && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-md border-l-4 border-blue-400">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Example:</span>
                                <div className="mt-1 text-sm text-gray-800">{step.example}</div>
                            </div>
                        )}
                        {step.tip && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded-md border-l-4 border-yellow-400">
                                <span className="text-xs font-medium text-yellow-700 uppercase tracking-wide">💡 Tip:</span>
                                <div className="mt-1 text-sm text-yellow-800">{step.tip}</div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    // Enhanced help sections with detailed examples and diagrams
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
                systemArchitecture: `
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Assignment    │────│   AI Rubric     │────│   Rubric        │
│   Generator     │    │   Generator     │    │   Creator       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Class         │────│   Policy        │────│   Grading       │
│   Manager       │    │   Manager       │    │   Tool          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Privacy-First │
                    │   Data Layer    │
                    └─────────────────┘`,
                workflowOverview: [
                    {
                        title: 'Content Creation Workflow',
                        description: 'Create assignments and rubrics using AI assistance',
                        example: 'Assignment Generator → AI Prompt Generator → ChatGPT/Claude → Rubric Creator → HTML Export'
                    },
                    {
                        title: 'Grading Workflow',
                        description: 'Import students and grade using professional rubrics',
                        example: 'Excel Import → Policy Selection → Rubric Loading → Batch Grading → Results Export'
                    },
                    {
                        title: 'Privacy Workflow',
                        description: 'Maintain data privacy throughout the process',
                        example: 'Session Start → Temporary Storage → Grading → Export Results → Auto-Cleanup'
                    }
                ]
            }
        },
        {
            id: 'privacy',
            title: 'Privacy & Data Protection',
            icon: Shield,
            color: 'green',
            content: {
                description: 'GradingPilot v2.0 implements a privacy-first architecture ensuring complete student data protection',
                privacyModel: `
┌─────────────────────────────────────────────────────────────┐
│                    PRIVACY-FIRST ARCHITECTURE               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Upload    │───▶│   Session   │───▶│   Export    │     │
│  │   (.xlsx)   │    │  (1 Hour)   │    │   (.json)   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                  │            │
│         ▼                  ▼                  ▼            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ No Tracking │    │ Auto-Delete │    │ User Owned  │     │
│  │ No Storage  │    │ on Timeout  │    │ Data Only   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘`,
                exampleSession: [
                    {
                        title: 'Session Start',
                        description: 'When you import an Excel file, a temporary session begins',
                        example: 'Session ID: sess_abc123\nExpires: 2024-01-15 14:30 UTC\nData: Temporarily stored in encrypted session'
                    },
                    {
                        title: 'Active Grading',
                        description: 'All grading data is kept in session memory only',
                        example: 'Student: John Doe (temp_id_001)\nGrade: 85% (calculated in real-time)\nFeedback: Stored in session buffer'
                    },
                    {
                        title: 'Data Export',
                        description: 'Before session expires, export your grading data',
                        example: 'Export file: grades_2024-01-15.json\nContains: All grades, feedback, metadata\nSize: ~2.3MB for 30 students'
                    },
                    {
                        title: 'Auto-Cleanup',
                        description: 'Session automatically clears after expiry or logout',
                        example: 'Session expired: sess_abc123\nData purged: All student information\nRemaining: Only system logs (no personal data)'
                    }
                ],
                privacyChecklist: [
                    '✅ No permanent database storage of student information',
                    '✅ Session data encrypted in Redis cache',
                    '✅ Automatic expiry after configurable timeout',
                    '✅ Manual session clearing on logout',
                    '✅ Export functionality for data ownership',
                    '✅ No third-party analytics or tracking',
                    '✅ GDPR Article 17 compliance (Right to Erasure)',
                    '✅ Data minimization - only necessary fields stored'
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
                description: 'Create comprehensive assignment prompts with professional HTML output and seamless integration with other tools',
                detailedWorkflow: [
                    {
                        title: 'Setup Course Information',
                        description: 'Begin by entering your course details and metadata',
                        example: 'Course: COMP-2100 Advanced Programming\nInstructor: Dr. Sarah Chen\nTerm: Winter 2024\nProgram: Computer Science Diploma',
                        tip: 'Complete course information helps generate more accurate assignment prompts and ensures proper formatting'
                    },
                    {
                        title: 'Define Assignment Details',
                        description: 'Specify the assignment type, description, and requirements',
                        example: 'Type: Programming Project\nTitle: E-commerce Web Application\nDue Date: March 15, 2024\nWeight: 25% of final grade',
                        tip: 'Be specific about requirements - this data will be used by the AI Rubric Generator'
                    },
                    {
                        title: 'Add Course Learning Outcomes (CLOs)',
                        description: 'Map your assignment to specific learning outcomes',
                        example: 'CLO1: Design and implement object-oriented solutions\nCLO3: Apply web development frameworks\nCLO5: Demonstrate professional coding practices',
                        tip: 'CLOs automatically transfer to the AI Rubric Generator for criteria alignment'
                    },
                    {
                        title: 'Configure Submission Requirements',
                        description: 'Set up submission format, citation style, and technical requirements',
                        example: 'Format: ZIP file with source code\nCitation: APA Style for references\nSize limit: 10MB maximum\nFile types: .java, .html, .css, .js files only',
                        tip: 'Clear submission requirements reduce student confusion and grading time'
                    },
                    {
                        title: 'Generate HTML Assignment Page',
                        description: 'Create a professional, printable assignment document',
                        example: 'Output: Professional HTML page with institutional branding\nIncludes: All requirements, rubric reference, due dates\nFeatures: Print-friendly CSS, accessible design'
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
                description: 'Transform assignment details into comprehensive AI prompts for automated rubric generation using ChatGPT, Claude, or other AI systems',
                aiIntegrationFlow: `
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Assignment    │───▶│    AI Prompt    │───▶│   AI System     │
│     Data        │    │   Generator     │    │ (GPT/Claude)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  CLOs, Weight   │    │ Structured      │    │  Professional   │
│  Requirements   │    │ AI Prompt       │    │    Rubric       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                 │
                                 ▼
                    ┌─────────────────┐
                    │   Import to     │
                    │ Rubric Creator  │
                    └─────────────────┘`,
                examplePromptGeneration: [
                    {
                        title: 'Import Assignment Data',
                        description: 'Use the import feature to pull data from Assignment Prompt Generator',
                        example: 'Click "Import from Assignment Generator"\nAuto-populates: Assignment type, CLOs, weight percentage\nMaps learning objectives to rubric criteria',
                        tip: 'This ensures consistency between your assignment prompt and rubric'
                    },
                    {
                        title: 'Configure Rubric Parameters',
                        description: 'Set criteria count, type, and assessment focus',
                        example: 'Criteria Count: 5\nType: AI-Suggested (or User-Provided)\nFocus: Technical skills + Communication\nStudent Level: Post-secondary diploma',
                        tip: 'Match criteria count to assignment complexity - typically 4-6 for most assignments'
                    },
                    {
                        title: 'Generate AI Prompt',
                        description: 'Create a comprehensive prompt for your preferred AI system',
                        example: 'Generated prompt includes:\n- Assignment context and requirements\n- 7-level performance scale\n- Specific criteria requests\n- Learning objectives alignment\n- Professional formatting instructions'
                    },
                    {
                        title: 'Use with AI System',
                        description: 'Copy the generated prompt to ChatGPT, Claude, or similar AI',
                        example: 'Copy prompt → Paste in ChatGPT → Generate rubric → Copy result → Import to Rubric Creator',
                        tip: 'Different AI systems may produce varied results - try multiple for best outcome'
                    }
                ],
                samplePrompt: `Create a professional rubric for the following assignment:

**Assignment**: E-commerce Web Application Development
**Level**: Post-secondary Computer Science Diploma
**Weight**: 25% of final grade
**Total Points**: 100

**Learning Objectives**:
- CLO1: Design and implement object-oriented solutions
- CLO3: Apply web development frameworks effectively
- CLO5: Demonstrate professional coding practices

**Requirements**: Create a 7-level rubric with 5 criteria focusing on technical implementation, code quality, user interface design, functionality, and documentation.

**Performance Levels**:
- Exceptional (100%): Outstanding professional quality
- Accomplished (92%): Strong professional quality
- Emerging (82%): Above standard expectations
- Acceptable (70%): Meets minimum standards (PASS)
- Developing (55%): Approaching standards
- Unacceptable (30%): Below minimum standards
- Incomplete (0%): No submission or unusable

Please provide detailed descriptions for each criterion at each level...`
            }
        },
        {
            id: 'rubric-creator',
            title: 'Professional Rubric Creator',
            icon: Target,
            color: 'orange',
            tabId: 'rubric-creator',
            content: {
                description: 'Build comprehensive rubrics using the industry-standard 7-level assessment system with rich text editing and feedback libraries',
                rubricStructure: `
┌─────────────────────────────────────────────────────────────┐
│                    RUBRIC STRUCTURE                        │
├─────────────────────────────────────────────────────────────┤
│  Criterion 1    │ Level 1 │ Level 2 │ ... │ Level 7        │
│  (Weight: 25%)  │  (0%)   │  (30%)  │     │ (100%)         │
├─────────────────┼─────────┼─────────┼─────┼────────────────┤
│  Criterion 2    │ Level 1 │ Level 2 │ ... │ Level 7        │
│  (Weight: 20%)  │  (0%)   │  (30%)  │     │ (100%)         │
├─────────────────┼─────────┼─────────┼─────┼────────────────┤
│  Criterion 3    │ Level 1 │ Level 2 │ ... │ Level 7        │
│  (Weight: 30%)  │  (0%)   │  (30%)  │     │ (100%)         │
├─────────────────┼─────────┼─────────┼─────┼────────────────┤
│  Criterion 4    │ Level 1 │ Level 2 │ ... │ Level 7        │
│  (Weight: 25%)  │  (0%)   │  (30%)  │     │ (100%)         │
└─────────────────┴─────────┴─────────┴─────┴────────────────┘
Total Weight: 100%          Final Grade Calculation: Weighted Average`,
                detailedCreationProcess: [
                    {
                        title: 'Import or Create Assignment Info',
                        description: 'Start with assignment metadata and basic information',
                        example: 'Title: Database Design Project\nTotal Points: 100\nDue Date: March 20, 2024\nCourse: DBMS Fundamentals',
                        tip: 'Import from Assignment Generator to maintain consistency across documents'
                    },
                    {
                        title: 'Define Assessment Criteria',
                        description: 'Create 3-6 criteria that cover all aspects of the assignment',
                        example: 'Criterion 1: Database Design (30%)\nCriterion 2: SQL Implementation (25%)\nCriterion 3: Data Integrity (20%)\nCriterion 4: Documentation (15%)\nCriterion 5: Code Quality (10%)',
                        tip: 'Ensure weights total 100% - the system will warn you if they don\'t match'
                    },
                    {
                        title: 'Write Performance Level Descriptions',
                        description: 'Create detailed, observable descriptions for each level',
                        example: 'Exceptional (100%): Database design demonstrates advanced normalization, optimal indexing, and sophisticated relationship management with complete documentation.\n\nAccomplished (92%): Database design shows strong normalization principles, appropriate indexing, and clear relationships with comprehensive documentation.\n\n...continuing for all 7 levels',
                        tip: 'Use action verbs and specific, measurable language - avoid subjective terms like "good" or "poor"'
                    },
                    {
                        title: 'Build Feedback Libraries',
                        description: 'Create reusable comment banks for efficient grading',
                        example: 'Positive Feedback:\n- "Excellent use of foreign key constraints"\n- "Impressive query optimization techniques"\n\nImprovement Areas:\n- "Consider adding indexes for better performance"\n- "Review normalization rules for this table structure"',
                        tip: 'Organize feedback by criterion and performance level for quick access during grading'
                    },
                    {
                        title: 'Preview and Test',
                        description: 'Use the preview feature to see the student-facing rubric',
                        example: 'Preview shows:\n- Clean, professional layout\n- Point calculations\n- Grade percentage display\n- Printable format',
                        tip: 'Test the rubric with sample grades to ensure calculations work correctly'
                    },
                    {
                        title: 'Export and Share',
                        description: 'Export in multiple formats for different uses',
                        example: 'HTML Export: For student distribution and LMS upload\nJSON Export: For GradingPilot grading tool\nPDF Export: For printing and official records',
                        tip: 'Export HTML version early to share with students - transparency improves learning outcomes'
                    }
                ],
                levelDescriptionExample: `
CRITERION: Code Quality and Documentation

🏆 EXCEPTIONAL (100%):
Code demonstrates exceptional professional standards with comprehensive 
documentation, consistent formatting, meaningful variable names, efficient 
algorithms, and complete inline comments. Error handling is robust and 
user-friendly. Code follows all industry best practices.

⭐ ACCOMPLISHED (92%):
Code shows strong professional quality with good documentation, consistent 
formatting, clear variable names, and adequate comments. Error handling 
is present and functional. Follows most industry best practices.

📈 EMERGING (82%):
Code demonstrates above-average quality with basic documentation, mostly 
consistent formatting, generally clear variable names, and some comments. 
Basic error handling implemented. Follows some best practices.

✅ ACCEPTABLE (70% - PASS):
Code meets minimum professional standards with basic documentation, 
acceptable formatting, understandable variable names, and minimal comments. 
Basic functionality works correctly. Meets assignment requirements.

📝 DEVELOPING (55%):
Code shows developing skills with limited documentation, inconsistent 
formatting, some unclear variable names, and few comments. Functionality 
works but may have minor issues. Approaching requirements.

❌ UNACCEPTABLE (30%):
Code shows significant deficiencies with poor or missing documentation, 
inconsistent formatting, unclear variable names, and no comments. 
Functionality has major issues. Below minimum standards.

⚠️ INCOMPLETE (0%):
No code submitted, code doesn't run, or submission is unusable.
No evidence of understanding basic concepts.`
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
                excelFormatGuide: `
┌─────────────────────────────────────────────────────────────┐
│                  EXCEL IMPORT FORMAT                       │
├─────────────────────────────────────────────────────────────┤
│    A         B          C           D         E      F     │
│ ┌─────────┬─────────┬─────────────┬─────────┬─────┬──────┐  │
│ │ First   │ Last    │ Student ID  │ Email   │ ... │ ...  │  │
│ │ Name    │ Name    │ (Optional)  │(Optional│     │      │  │
│ ├─────────┼─────────┼─────────────┼─────────┼─────┼──────┤  │
│ │ John    │ Smith   │ 12345678    │ j.smith │     │      │  │
│ │ Sarah   │ Johnson │ 87654321    │ s.john  │     │      │  │
│ │ Mike    │ Brown   │ 11223344    │ m.brown │     │      │  │
│ └─────────┴─────────┴─────────────┴─────────┴─────┴──────┘  │
├─────────────────────────────────────────────────────────────┤
│                   COURSE METADATA                          │
│  Can be placed anywhere in the sheet:                      │
│                                                             │
│  Course Code:    COMP-2100                                 │
│  Course Name:    Advanced Programming                      │
│  Instructor:     Dr. Sarah Chen                            │
│  Term:           Winter 2024                               │
│  Program Type:   diploma                                   │
│  Section:        Section A                                 │
└─────────────────────────────────────────────────────────────┘`,
                importValidationProcess: [
                    {
                        title: 'File Format Validation',
                        description: 'System checks file type and basic structure',
                        example: 'Accepted: .xlsx, .xls files\nRejected: .csv, .txt, .pdf files\nValidation: Headers detected, data rows counted',
                        tip: 'Save Excel files in .xlsx format for best compatibility'
                    },
                    {
                        title: 'Required Column Detection',
                        description: 'System identifies required student information columns',
                        example: 'Required Found: ✅ First Name, ✅ Last Name\nOptional Found: ✅ Student ID, ✅ Email\nMissing: ⚠️ Phone Number (optional)',
                        tip: 'First Name and Last Name are required - other columns are optional but recommended'
                    },
                    {
                        title: 'Data Quality Check',
                        description: 'System validates data integrity and completeness',
                        example: 'Validation Results:\n✅ 28 students with complete names\n⚠️ 2 students missing email addresses\n❌ 1 duplicate name detected (John Smith)',
                        tip: 'Review validation warnings carefully - duplicates may need manual verification'
                    },
                    {
                        title: 'Course Metadata Extraction',
                        description: 'System automatically finds course information in the spreadsheet',
                        example: 'Auto-detected:\n✅ Course: COMP-2100 Advanced Programming\n✅ Instructor: Dr. Sarah Chen\n✅ Term: Winter 2024\n⚠️ Program Type: Not specified (defaulting to "degree")',
                        tip: 'Include program type to ensure correct grading policy selection'
                    },
                    {
                        title: 'Privacy Compliance Check',
                        description: 'System ensures data handling meets privacy standards',
                        example: 'Privacy Status: ✅ Compliant\n- Data stored in session only\n- Auto-expire set for 1 hour\n- No permanent database storage\n- Export functionality available',
                        tip: 'Export your grading data before the session expires to maintain records'
                    }
                ],
                excelTemplateExample: `
RECOMMENDED EXCEL TEMPLATE:

Row 1 (Headers):
┌─────────────┬──────────────┬─────────────┬──────────────────┬───────────┐
│  First Name │  Last Name   │ Student ID  │      Email       │  Section  │
├─────────────┼──────────────┼─────────────┼──────────────────┼───────────┤
│    John     │    Smith     │  12345678   │ j.smith@edu.ca   │     A     │
│    Sarah    │   Johnson    │  87654321   │ s.johnson@edu.ca │     A     │
│    Mike     │    Brown     │  11223344   │ m.brown@edu.ca   │     B     │
│   Emily     │   Davis      │  55667788   │ e.davis@edu.ca   │     A     │
└─────────────┴──────────────┴─────────────┴──────────────────┴───────────┘

Metadata (place anywhere):
Course Code: COMP-2100
Course Name: Advanced Programming  
Instructor: Dr. Sarah Chen
Term: Winter 2024
Program Type: diploma
Department: Computer Studies
Campus: Waterloo`,
                gradingPolicyIntegration: [
                    {
                        title: 'Automatic Policy Selection',
                        description: 'System selects appropriate grading policy based on program type',
                        example: 'Program Type: "diploma" detected\nSelected Policy: Conestoga College - Diploma Programs\nGrade Scale: A+ (95-100), A (90-94), A- (85-89)...',
                        tip: 'Verify the selected policy matches your institutional requirements'
                    },
                    {
                        title: 'Policy Preview and Testing',
                        description: 'Preview how grades will be calculated with selected policy',
                        example: 'Test Calculation:\n85% → B+ (3.3 GPA)\n92% → A- (3.7 GPA)\n76% → B (3.0 GPA)\nPassing Grade: 60% (D)',
                        tip: 'Use the preview feature to test edge cases and verify calculations'
                    },
                    {
                        title: 'Custom Policy Override',
                        description: 'Override default policy selection if needed',
                        example: 'Default: Conestoga Diploma\nOverride Options:\n- Conestoga Degree Programs\n- Custom University Standards\n- K-12 Educational Standards\n- Create New Policy',
                        tip: 'Create custom policies in the Policy Manager for specialized programs'
                    }
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
                description: 'Advanced grading policy management system for dynamic grade calculations, institutional compliance, and custom configurations',
                policyArchitecture: `
┌─────────────────────────────────────────────────────────────┐
│                GRADING POLICY ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │   Institution   │───▶│   Program       │               │
│  │   Policies      │    │   Types         │               │
│  └─────────────────┘    └─────────────────┘               │
│           │                       │                        │
│           ▼                       ▼                        │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │   Grade         │◄───│   Calculation   │               │
│  │   Scales        │    │   Engine        │               │
│  └─────────────────┘    └─────────────────┘               │
│           │                       │                        │
│           ▼                       ▼                        │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │   Student       │◄───│   Real-time     │               │
│  │   Grades        │    │   Updates       │               │
│  └─────────────────┘    └─────────────────┘               │
└─────────────────────────────────────────────────────────────┘`,
                policyCreationExample: [
                    {
                        title: 'Create New Grading Policy',
                        description: 'Define a new institutional or program-specific grading policy',
                        example: 'Policy Name: "Engineering Technology Programs"\nDescription: "Specialized grading for technology-focused programs"\nProgram Types: ["engineering-tech", "applied-tech"]\nEffective Date: 2024-09-01',
                        tip: 'Use descriptive names that clearly identify the policy purpose and scope'
                    },
                    {
                        title: 'Configure Grade Scale',
                        description: 'Set up the letter grades, percentages, and GPA values',
                        example: 'Grade Scale Configuration:\nA+ → 95-100% → 4.0 GPA → "Exceptional Achievement"\nA  → 90-94%  → 4.0 GPA → "Outstanding Achievement"\nA- → 85-89%  → 3.7 GPA → "Excellent Achievement"\nB+ → 80-84%  → 3.3 GPA → "Very Good Achievement"\n...continuing to F',
                        tip: 'Ensure percentage ranges don\'t overlap and cover 0-100% completely'
                    },
                    {
                        title: 'Set Special Rules',
                        description: 'Define any special grading rules or exceptions',
                        example: 'Special Rules:\n- Minimum 50% required for passing\n- Late assignments: -5% per day\n- Maximum late penalty: 25%\n- Re-submission allowed once\n- Plagiarism results in automatic 0%',
                        tip: 'Document all special rules clearly to ensure consistent application'
                    },
                    {
                        title: 'Test Policy Calculations',
                        description: 'Verify the policy works correctly with test data',
                        example: 'Test Results:\n87% → B+ (3.3 GPA) ✅\n59% → F (0.0 GPA) ✅\n95% → A+ (4.0 GPA) ✅\nBoundary Test: 84.5% → B+ ✅',
                        tip: 'Test boundary conditions (84.9%, 85.0%, 85.1%) to ensure proper rounding'
                    },
                    {
                        title: 'Deploy and Monitor',
                        description: 'Activate the policy and monitor its usage',
                        example: 'Deployment Status: ✅ Active\nClasses Using Policy: 12\nInstructors Using: 8\nLast Updated: 2024-01-15\nUsage Analytics: Available in dashboard',
                        tip: 'Monitor policy usage to identify any issues or needed adjustments'
                    }
                ],
                preloadedPolicies: `
CONESTOGA COLLEGE POLICIES (Pre-loaded):

┌─────────────────────────────────────────────────────────────┐
│  DEGREE PROGRAMS                                           │
├─────────────────────────────────────────────────────────────┤
│  A+ │ 95-100% │ 4.0 │ Exceptional Achievement            │
│  A  │ 90-94%  │ 4.0 │ Outstanding Achievement            │
│  A- │ 85-89%  │ 3.7 │ Excellent Achievement              │
│  B+ │ 80-84%  │ 3.3 │ Very Good Achievement              │
│  B  │ 75-79%  │ 3.0 │ Good Achievement                   │
│  B- │ 70-74%  │ 2.7 │ Satisfactory Achievement           │
│  C+ │ 65-69%  │ 2.3 │ Acceptable Achievement             │
│  C  │ 60-64%  │ 2.0 │ Marginal Achievement               │
│  D  │ 50-59%  │ 1.0 │ Minimal Achievement                │
│  F  │ 0-49%   │ 0.0 │ Inadequate Achievement             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  DIPLOMA PROGRAMS                                          │
├─────────────────────────────────────────────────────────────┤
│  A+ │ 90-100% │ 4.0 │ Exceptional Achievement            │
│  A  │ 85-89%  │ 4.0 │ Outstanding Achievement            │
│  A- │ 80-84%  │ 3.7 │ Excellent Achievement              │
│  B+ │ 77-79%  │ 3.3 │ Very Good Achievement              │
│  B  │ 73-76%  │ 3.0 │ Good Achievement                   │
│  B- │ 70-72%  │ 2.7 │ Satisfactory Achievement           │
│  C+ │ 67-69%  │ 2.3 │ Acceptable Achievement             │
│  C  │ 63-66%  │ 2.0 │ Marginal Achievement               │
│  C- │ 60-62%  │ 1.7 │ Minimal Achievement                │
│  D  │ 50-59%  │ 1.0 │ Conditional Achievement            │
│  F  │ 0-49%   │ 0.0 │ Inadequate Achievement             │
└─────────────────────────────────────────────────────────────┘`,
                importExportExample: [
                    {
                        title: 'Export Current Policies',
                        description: 'Backup or share your grading policies with other institutions',
                        example: 'Export Format: JSON\nFile Size: ~15KB for 5 policies\nIncludes: Policy definitions, grade scales, special rules\nCompatible: With other GradingPilot installations',
                        tip: 'Export policies regularly as backup before making changes'
                    },
                    {
                        title: 'Import External Policies',
                        description: 'Import policies from other institutions or previous backups',
                        example: 'Import Sources:\n- University of Waterloo standards\n- Previous semester configurations\n- Department-specific policies\n- Standardized institutional templates',
                        tip: 'Validate imported policies thoroughly before activating them'
                    }
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
                description: 'Comprehensive grading interface with rubric integration, batch processing, session management, and real-time calculations',
                gradingInterface: `
┌─────────────────────────────────────────────────────────────┐
│                    GRADING INTERFACE                       │
├─────────────────────────────────────────────────────────────┤
│  Student: John Smith (3/28)    [Previous] [Next] [Skip]    │
│  Assignment: Database Project   Grade: 87.5% (B+)          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 RUBRIC CRITERIA:                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Database Design (30%)              [Accomplished]   │   │
│  │ ● Description: Shows strong normalization...        │   │
│  │ ● Points: 27.6/30 (92%)                           │   │
│  │ ● Feedback: [Add specific feedback here...]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SQL Implementation (25%)           [Emerging]       │   │
│  │ ● Description: Above standard expectations...       │   │
│  │ ● Points: 20.5/25 (82%)                          │   │
│  │ ● Feedback: [Add specific feedback here...]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📝 OVERALL FEEDBACK:                                      │
│  [Comprehensive feedback area with rich text editing...]   │
│                                                             │
│  💾 [Save Draft] [Finalize Grade] [Export Individual]      │
└─────────────────────────────────────────────────────────────┘`,
                batchGradingWorkflow: [
                    {
                        title: 'Initialize Batch Grading Session',
                        description: 'Set up grading session with class roster and rubric',
                        example: 'Class: COMP-2100 Advanced Programming (28 students)\nRubric: Database Project Rubric (5 criteria)\nPolicy: Conestoga Diploma Programs\nSession Timeout: 60 minutes',
                        tip: 'Ensure you have exported your rubric from Rubric Creator before starting'
                    },
                    {
                        title: 'Navigate Between Students',
                        description: 'Efficiently move through your class roster during grading',
                        example: 'Navigation Options:\n- Previous/Next buttons\n- Student dropdown menu\n- Quick jump to ungraded students\n- Progress indicator (3/28 completed)',
                        tip: 'Use the "Skip" feature for incomplete submissions - return to them later'
                    },
                    {
                        title: 'Apply Rubric Criteria',
                        description: 'Grade each criterion using the loaded rubric',
                        example: 'For each criterion:\n1. Select performance level (Incomplete → Exceptional)\n2. Add specific feedback using comment library\n3. Override points if needed\n4. View real-time grade calculation',
                        tip: 'Build comprehensive comment libraries in Rubric Creator to speed up feedback'
                    },
                    {
                        title: 'Add Comprehensive Feedback',
                        description: 'Provide detailed, personalized feedback for each student',
                        example: 'Feedback Types:\n- Criterion-specific comments\n- Overall performance summary\n- Improvement suggestions\n- Positive reinforcement\n- Next steps for learning',
                        tip: 'Use rich text formatting to make feedback more readable and engaging'
                    },
                    {
                        title: 'Manage Drafts and Finals',
                        description: 'Save work-in-progress and finalize completed grades',
                        example: 'Draft Status: Auto-saved every 30 seconds\nFinal Status: Manually confirmed by instructor\nExport Options: Individual reports, batch summary\nBackup: Session data exportable as JSON',
                        tip: 'Export your session data regularly in case of unexpected browser closure'
                    }
                ],
                gradingCalculationExample: `
REAL-TIME GRADE CALCULATION EXAMPLE:

Assignment: Database Project (Total: 100 points)
Student: Sarah Johnson
Policy: Conestoga College - Diploma Programs

┌─────────────────────────────────────────────────────────────┐
│  CRITERION GRADES:                                         │
├─────────────────────────────────────────────────────────────┤
│  Database Design (30%)        Accomplished (92%)    27.6   │
│  SQL Implementation (25%)     Emerging (82%)        20.5   │
│  Data Integrity (20%)        Acceptable (70%)       14.0   │
│  Documentation (15%)         Accomplished (92%)     13.8   │
│  Code Quality (10%)          Exceptional (100%)     10.0   │
├─────────────────────────────────────────────────────────────┤
│  CALCULATION:                                              │
│  Weighted Average: (27.6 + 20.5 + 14.0 + 13.8 + 10.0)     │
│                  = 85.9/100 = 85.9%                       │
│                                                             │
│  Policy Application: Conestoga Diploma                     │
│  85.9% → A- (3.7 GPA) "Excellent Achievement"             │
│                                                             │
│  FINAL GRADE: 85.9% (A-)                                  │
└─────────────────────────────────────────────────────────────┘`,
                feedbackLibraryExample: [
                    {
                        title: 'Criterion-Specific Feedback',
                        description: 'Organize feedback by rubric criteria for quick access',
                        example: 'Database Design - Positive:\n"Excellent normalization demonstrates deep understanding"\n"Creative use of indexes improves performance"\n\nDatabase Design - Improvement:\n"Consider third normal form for better data integrity"\n"Foreign key relationships need strengthening"',
                        tip: 'Organize feedback by performance level (Exceptional, Accomplished, etc.) for faster selection'
                    },
                    {
                        title: 'Quick Insert Options',
                        description: 'Pre-written comments for common grading scenarios',
                        example: 'Quick Inserts:\n- "Well done! This meets all requirements."\n- "Good effort, but needs improvement in [specific area]"\n- "Excellent work that exceeds expectations"\n- "Please see me during office hours to discuss"',
                        tip: 'Customize quick inserts for your teaching style and common feedback patterns'
                    }
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
                description: 'Advanced Excel import system with comprehensive validation, error detection, and privacy-compliant processing',
                supportedFormats: `
SUPPORTED FILE FORMATS AND STRUCTURES:

┌─────────────────────────────────────────────────────────────┐
│  FILE FORMATS:                                             │
│  ✅ .xlsx (Excel 2007+)        - Recommended format       │
│  ✅ .xls (Excel 97-2003)       - Legacy support           │
│  ✅ .csv (Comma-separated)     - Basic support            │
│  ✅ .tsv (Tab-separated)       - Basic support            │
│  ❌ .pdf, .docx, .txt         - Not supported             │
├─────────────────────────────────────────────────────────────┤
│  STRUCTURE REQUIREMENTS:                                   │
│  ✅ Header row (Row 1)         - Required                 │
│  ✅ Data rows (Row 2+)         - At least 1 student       │
│  ✅ First Name column          - Required                 │
│  ✅ Last Name column           - Required                 │
│  ⚠️ Student ID column          - Recommended              │
│  ⚠️ Email column               - Recommended              │
│  ⚠️ Course metadata            - Auto-detected            │
└─────────────────────────────────────────────────────────────┘`,
                validationProcess: [
                    {
                        title: 'File Upload and Initial Validation',
                        description: 'System performs initial file checks before processing',
                        example: 'Upload: StudentList_COMP2100.xlsx (45KB)\nFormat Check: ✅ Valid Excel format\nSize Check: ✅ Under 10MB limit\nStructure: ✅ Headers detected in row 1\nData Rows: ✅ 28 students found',
                        tip: 'Keep files under 10MB for optimal performance - break large classes into smaller files if needed'
                    },
                    {
                        title: 'Column Mapping and Detection',
                        description: 'Intelligent detection of required and optional columns',
                        example: 'Column Mapping Results:\n✅ "First Name" → Column A (Required)\n✅ "Last Name" → Column B (Required)\n✅ "Student ID" → Column C (Recommended)\n⚠️ "Email Address" → Not found\n✅ "Section" → Column E (Optional)',
                        tip: 'Use standard column names like "First Name", "Last Name" for automatic detection'
                    },
                    {
                        title: 'Data Quality Validation',
                        description: 'Comprehensive checks for data integrity and completeness',
                        example: 'Data Quality Report:\n✅ 26 students with complete information\n⚠️ 2 students missing Student ID\n❌ 1 student with blank first name (Row 15)\n⚠️ 3 potential duplicate names detected\n✅ All email formats valid',
                        tip: 'Review all warnings carefully - they may indicate data entry errors in your source file'
                    },
                    {
                        title: 'Course Metadata Extraction',
                        description: 'Automatic detection of course information throughout the spreadsheet',
                        example: 'Metadata Detection:\n✅ Course Code: "COMP-2100" (Cell F2)\n✅ Course Name: "Advanced Programming" (Cell F3)\n✅ Instructor: "Dr. Sarah Chen" (Cell F4)\n✅ Term: "Winter 2024" (Cell F5)\n⚠️ Program Type: Not specified (defaulting to "degree")',
                        tip: 'Place course metadata in dedicated cells for reliable auto-detection'
                    },
                    {
                        title: 'Privacy Compliance Check',
                        description: 'Verification that import meets privacy standards',
                        example: 'Privacy Compliance: ✅ PASSED\n- No sensitive data permanently stored\n- Session-based processing only\n- Auto-expire set for 60 minutes\n- Export functionality confirmed\n- Data minimization applied',
                        tip: 'System automatically applies privacy safeguards - no additional action needed'
                    }
                ],
                errorHandlingExamples: `
COMMON IMPORT ERRORS AND SOLUTIONS:

❌ ERROR: "No headers detected in row 1"
   CAUSE: First row doesn't contain column names
   SOLUTION: Ensure row 1 has headers like "First Name", "Last Name"
   EXAMPLE: Move data up if it starts in row 3

❌ ERROR: "Required column 'First Name' not found" 
   CAUSE: Column header doesn't match expected format
   SOLUTION: Rename column header to exactly "First Name"
   ALTERNATIVES: "FirstName", "Given Name", "Student First Name"

❌ ERROR: "Duplicate student detected: John Smith appears 3 times"
   CAUSE: Same name appears multiple times in roster
   SOLUTION: Check for actual duplicates vs. different students
   EXAMPLE: Add middle initial or student ID to differentiate

❌ ERROR: "File format not supported: .pdf"
   CAUSE: Trying to upload non-Excel file
   SOLUTION: Convert PDF to Excel first, or request Excel version
   TOOLS: Adobe Acrobat, online PDF-to-Excel converters

⚠️ WARNING: "28 students found, but 3 missing email addresses"
   IMPACT: Email notifications won't work for these students
   SOLUTION: Add email addresses or proceed without them
   WORKAROUND: Manually distribute feedback to these students`,
                testModeFeatures: [
                    {
                        title: 'Safe Testing Environment',
                        description: 'Test import functionality without affecting real data',
                        example: 'Test Mode Features:\n- Process sample files safely\n- Validate format without importing\n- Generate detailed error reports\n- Preview data structure\n- Test grading policy integration',
                        tip: 'Always test with a small sample file before importing your full class roster'
                    },
                    {
                        title: 'Validation Report Generation',
                        description: 'Comprehensive reports on import quality and issues',
                        example: 'Validation Report Contents:\n- File structure analysis\n- Data quality metrics\n- Missing field identification\n- Duplicate detection results\n- Compatibility assessment\n- Recommendations for improvement',
                        tip: 'Save validation reports for documentation and troubleshooting'
                    }
                ],
                bestPracticesGuide: [
                    {
                        title: 'Excel File Preparation',
                        description: 'Optimize your Excel files for successful import',
                        example: 'Best Practices:\n1. Use .xlsx format (not .xls)\n2. Put headers in row 1\n3. No merged cells in data area\n4. Consistent data formatting\n5. Remove empty rows/columns\n6. Include course metadata',
                        tip: 'Clean up your Excel file before import - remove formatting, colors, and formulas'
                    },
                    {
                        title: 'Large Class Management',
                        description: 'Handle large class rosters efficiently',
                        example: 'For classes > 50 students:\n- Split into multiple files by section\n- Use batch processing\n- Export session data frequently\n- Consider multiple grading sessions\n- Plan for extended session timeouts',
                        tip: 'Break large classes (100+ students) into smaller batches for better performance'
                    }
                ]
            }
        },
        {
            id: 'cloud-deployment',
            title: 'Cloud Integration & Deployment',
            icon: Cloud,
            color: 'sky',
            content: {
                description: 'Professional cloud deployment with Docker containerization, privacy-first architecture, and minimal maintenance requirements',
                deploymentArchitecture: `
┌─────────────────────────────────────────────────────────────┐
│                CLOUD DEPLOYMENT ARCHITECTURE               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Internet ────▶ Nginx (SSL) ────▶ Load Balancer           │
│                    │                    │                  │
│                    ▼                    ▼                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                Docker Containers                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │   React     │  │   Node.js   │  │   Redis     │ │   │
│  │  │  Frontend   │  │    API      │  │  Sessions   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  │                         │                          │   │
│  │                         ▼                          │   │
│  │  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │ PostgreSQL  │  │   Backup    │                 │   │
│  │  │ (Policies)  │  │   System    │                 │   │
│  │  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Privacy Layer: No permanent student data storage          │
│  Security: SSL, Container isolation, Session encryption    │
└─────────────────────────────────────────────────────────────┘`,
                deploymentProcess: [
                    {
                        title: 'Server Preparation',
                        description: 'Set up your cloud server with required dependencies',
                        example: 'Server Requirements:\n- 2 CPU cores, 4GB RAM minimum\n- Ubuntu 20.04+ or similar Linux distribution\n- Docker and Docker Compose installed\n- Domain name (optional but recommended)\n- SSL certificate (auto-generated)',
                        tip: 'Hostinger Cloud Startup is perfect for this deployment - cost-effective and sufficient resources'
                    },
                    {
                        title: 'One-Command Deployment',
                        description: 'Deploy entire system with automated setup script',
                        example: 'Deployment Command:\n./deploy.sh\n\nWhat it does:\n- Installs all dependencies\n- Configures Docker containers\n- Sets up SSL certificates\n- Initializes database\n- Starts all services\n- Runs health checks',
                        tip: 'The entire deployment process takes about 15-20 minutes on a fresh server'
                    },
                    {
                        title: 'Environment Configuration',
                        description: 'Configure system settings for your institution',
                        example: 'Key Configuration:\n- DOMAIN_NAME=your-gradingpilot.com\n- SSL_EMAIL=admin@yourinstitution.edu\n- SESSION_TIMEOUT=3600 (1 hour)\n- DB_PASSWORD=secure_random_password\n- PRIVACY_MODE=strict',
                        tip: 'Use strong, unique passwords and keep your configuration file secure'
                    },
                    {
                        title: 'SSL and Security Setup',
                        description: 'Automatic SSL certificate generation and security hardening',
                        example: 'Security Features:\n✅ Let\'s Encrypt SSL (auto-renewal)\n✅ HTTPS redirect enforced\n✅ Security headers configured\n✅ Container isolation\n✅ Database access restricted\n✅ Session encryption enabled',
                        tip: 'SSL certificates automatically renew every 90 days - no manual intervention needed'
                    },
                    {
                        title: 'Health Monitoring',
                        description: 'Built-in monitoring and alerting for system health',
                        example: 'Monitoring Includes:\n- API endpoint health checks\n- Database connectivity tests\n- Session storage validation\n- Container resource usage\n- SSL certificate expiry alerts\n- Automated restart on failure',
                        tip: 'Check the health dashboard weekly to ensure everything is running smoothly'
                    }
                ],
                maintenanceSchedule: `
MAINTENANCE SCHEDULE (Minimal Effort Required):

┌─────────────────────────────────────────────────────────────┐
│  DAILY (Automated):                                       │
│  ✅ Container health checks                               │
│  ✅ Session cleanup (expired data)                       │
│  ✅ Log rotation                                          │
│  ✅ Backup verification                                   │
│  ✅ SSL certificate monitoring                            │
├─────────────────────────────────────────────────────────────┤
│  WEEKLY (Automated):                                      │
│  ✅ Security updates check                                │
│  ✅ Performance metrics review                            │
│  ✅ Storage cleanup                                       │
│  ✅ Container restart (if needed)                         │
├─────────────────────────────────────────────────────────────┤
│  MONTHLY (15 minutes manual):                             │
│  🔧 System package updates                               │
│  🔧 Docker image updates                                 │
│  🔧 Configuration review                                 │
│  🔧 Backup verification                                  │
│  📊 Usage analytics review                               │
├─────────────────────────────────────────────────────────────┤
│  QUARTERLY (1 hour manual):                               │
│  🔧 Security audit                                       │
│  🔧 Performance optimization                             │
│  🔧 Policy review and updates                            │
│  📊 Comprehensive system review                          │
└─────────────────────────────────────────────────────────────┘`,
                privacyCompliance: [
                    {
                        title: 'Data Retention Policy',
                        description: 'Automatic data lifecycle management for privacy compliance',
                        example: 'Data Lifecycle:\n- Student data: Session-only (max 1 hour)\n- System logs: 30 days retention\n- Policy data: Permanent (institutional)\n- Backup data: Encrypted, institution-controlled\n- Audit logs: 1 year retention (no personal data)',
                        tip: 'All data retention periods are configurable to meet your institutional requirements'
                    },
                    {
                        title: 'GDPR Compliance Features',
                        description: 'Built-in features for European data protection compliance',
                        example: 'GDPR Features:\n✅ Right to Erasure (automatic)\n✅ Data Minimization (only necessary data)\n✅ Purpose Limitation (education only)\n✅ Storage Limitation (session-based)\n✅ Data Portability (JSON export)\n✅ Transparency (clear privacy notices)',
                        tip: 'System is designed to be GDPR-compliant by default - no additional configuration needed'
                    }
                ]
            }
        },
        {
            id: 'workflow',
            title: 'Complete Workflow Examples',
            icon: ArrowRight,
            color: 'teal',
            content: {
                description: 'Step-by-step workflow examples for common use cases with detailed task completion guides',
                completeWorkflows: [
                    {
                        title: '🎯 Complete Assignment Creation Workflow',
                        description: 'From assignment concept to student-ready materials',
                        steps: [
                            {
                                title: 'Plan Your Assignment',
                                description: 'Define learning objectives and assignment requirements',
                                example: 'Assignment: Database Design Project\nLearning Objectives: Design normalized databases, implement SQL queries\nDue Date: 3 weeks from today\nWeight: 25% of final grade',
                                tip: 'Start with clear learning objectives - they drive everything else'
                            },
                            {
                                title: 'Use Assignment Prompt Generator',
                                description: 'Create detailed assignment prompt with all requirements',
                                example: 'Navigate to Assignment Prompt Generator tab\n→ Enter course info (COMP-2100, Dr. Chen, Winter 2024)\n→ Add assignment details (Database project, 25%, March 15)\n→ Define CLOs (CLO1: Database design, CLO3: SQL implementation)\n→ Set submission requirements (.sql files, documentation)\n→ Generate HTML page for students',
                                tip: 'Include all submission requirements to avoid student confusion later'
                            },
                            {
                                title: 'Generate AI Rubric Prompt',
                                description: 'Transform assignment into AI prompt for rubric creation',
                                example: 'Navigate to AI Rubric Prompt Generator\n→ Click "Import from Assignment Generator"\n→ Verify imported data (assignment type, CLOs, weight)\n→ Select "AI-Suggested" criteria type\n→ Set criteria count to 5\n→ Add special considerations (database normalization focus)\n→ Generate comprehensive AI prompt',
                                tip: 'Review imported data carefully - any errors here will affect your rubric quality'
                            },
                            {
                                title: 'Create Rubric with AI',
                                description: 'Use generated prompt with ChatGPT or Claude to create rubric',
                                example: 'Copy AI prompt from GradingPilot\n→ Paste into ChatGPT/Claude\n→ Review generated rubric for quality\n→ Request adjustments if needed ("Make level descriptions more specific")\n→ Copy final rubric text\n→ Return to GradingPilot',
                                tip: 'Don\'t accept the first AI output - iterate to get exactly what you need'
                            },
                            {
                                title: 'Refine in Rubric Creator',
                                description: 'Import AI rubric and customize for your needs',
                                example: 'Navigate to Rubric Creator\n→ Import assignment data\n→ Paste AI-generated rubric content\n→ Adjust criteria weights (Database Design 30%, SQL 25%, etc.)\n→ Refine level descriptions for clarity\n→ Build feedback libraries for each criterion\n→ Preview student-facing version',
                                tip: 'Build comprehensive feedback libraries now to save time during grading'
                            },
                            {
                                title: 'Export and Distribute',
                                description: 'Share assignment and rubric with students',
                                example: 'From Assignment Generator: Export HTML assignment page\n→ Upload to LMS or share via email\n→ From Rubric Creator: Export HTML rubric\n→ Share with students for transparency\n→ Export JSON rubric for later grading use',
                                tip: 'Share rubrics with students upfront - it improves learning outcomes and reduces grade disputes'
                            }
                        ]
                    },
                    {
                        title: '👥 Complete Class Setup and Grading Workflow',
                        description: 'From roster import to final grade export',
                        steps: [
                            {
                                title: 'Prepare Excel Class Roster',
                                description: 'Set up your class list with proper formatting',
                                example: 'Excel Setup:\n→ Row 1: Headers (First Name, Last Name, Student ID, Email)\n→ Row 2+: Student data\n→ Add course metadata (Course: COMP-2100, Instructor: Dr. Chen)\n→ Specify program type (diploma) for policy selection\n→ Save as .xlsx format',
                                tip: 'Include program type in metadata - it determines which grading policy is used'
                            },
                            {
                                title: 'Configure Grading Policy',
                                description: 'Set up or verify grading policies for your program',
                                example: 'Navigate to Policy Manager\n→ Review available policies (Conestoga Diploma, Degree, etc.)\n→ Test calculations with sample grades (85% → A-, 76% → B)\n→ Create custom policy if needed\n→ Verify policy matches institutional requirements',
                                tip: 'Test edge cases like 84.9% vs 85.0% to ensure proper grade boundaries'
                            },
                            {
                                title: 'Import Class Roster',
                                description: 'Load students with privacy protection and validation',
                                example: 'Navigate to Class Manager\n→ Upload Excel file (.xlsx)\n→ Review validation results (28 students found, 2 missing emails)\n→ Verify course metadata auto-detection\n→ Confirm grading policy selection (Conestoga Diploma)\n→ Note session expiry time (60 minutes)',
                                tip: 'Address validation warnings before proceeding - they may indicate data issues'
                            },
                            {
                                title: 'Load Grading Rubric',
                                description: 'Import the rubric created for this assignment',
                                example: 'Navigate to Grading Tool\n→ Import rubric JSON file\n→ Verify rubric criteria (Database Design 30%, SQL 25%, etc.)\n→ Check that total weights = 100%\n→ Review performance levels and point values\n→ Test with sample grade calculation',
                                tip: 'Double-check that this rubric matches the assignment students submitted'
                            },
                            {
                                title: 'Start Batch Grading',
                                description: 'Begin systematic grading of all students',
                                example: 'Click "Start Grading Session"\n→ Begin with first student (John Smith)\n→ Grade each criterion using rubric levels\n→ Add specific feedback from comment libraries\n→ Save draft and move to next student\n→ Use navigation buttons for efficiency',
                                tip: 'Grade in 45-minute focused sessions to maintain consistency and avoid fatigue'
                            },
                            {
                                title: 'Export Results and Cleanup',
                                description: 'Save grades and maintain privacy compliance',
                                example: 'Export options:\n→ Individual grade reports (PDF) for student feedback\n→ Class summary (Excel) for gradebook\n→ Session data (JSON) for backup\n→ Clear session data after export\n→ Verify all personal data removed',
                                tip: 'Export everything you need before session expires - data cannot be recovered after cleanup'
                            }
                        ]
                    },
                    {
                        title: '🔒 Privacy-Compliant Operation Workflow',
                        description: 'Maintain student privacy throughout the grading process',
                        steps: [
                            {
                                title: 'Session Initialization',
                                description: 'Start privacy-protected grading session',
                                example: 'System creates temporary session (sess_abc123)\n→ Session expires in 60 minutes\n→ All student data stored in encrypted session only\n→ No permanent database storage\n→ Privacy notice displayed to user',
                                tip: 'Note your session expiry time immediately - set a reminder 10 minutes before'
                            },
                            {
                                title: 'Active Grading with Privacy',
                                description: 'Grade while maintaining data protection',
                                example: 'Student data visible only during active session\n→ Grades calculated in real-time (not stored)\n→ Feedback stored in session buffer\n→ No data transmitted to external services\n→ Auto-save drafts locally in session',
                                tip: 'Work efficiently but thoroughly - you have limited session time'
                            },
                            {
                                title: 'Pre-Expiry Data Export',
                                description: 'Export your work before automatic cleanup',
                                example: 'Export checklist (10 minutes before expiry):\n→ ✅ Individual grade reports (PDF)\n→ ✅ Class summary spreadsheet (Excel)\n→ ✅ Complete session data (JSON backup)\n→ ✅ Feedback compilation\n→ ✅ Verify all exports completed successfully',
                                tip: 'Set multiple alarms - you cannot recover data after session expires'
                            },
                            {
                                title: 'Session Cleanup and Verification',
                                description: 'Ensure complete data removal',
                                example: 'Automatic cleanup occurs:\n→ All student personal data purged\n→ Session cache cleared\n→ Temporary files deleted\n→ Only system logs remain (no personal info)\n→ Cleanup confirmation displayed',
                                tip: 'Take screenshot of cleanup confirmation for your records if required by policy'
                            },
                            {
                                title: 'Secure Data Management',
                                description: 'Manage exported data according to institutional policy',
                                example: 'Data management:\n→ Store exported files on institutional secure storage\n→ Apply appropriate access controls\n→ Follow institutional retention policies\n→ Delete local copies when no longer needed\n→ Document data handling in your records',
                                tip: 'Your institution may have specific requirements for grade data storage and retention'
                            }
                        ]
                    }
                ]
            }
        },
        {
            id: 'troubleshooting',
            title: 'Troubleshooting & Common Issues',
            icon: AlertCircle,
            color: 'red',
            content: {
                description: 'Comprehensive troubleshooting guide with solutions for common issues and detailed resolution steps',
                detailedTroubleshooting: [
                    {
                        title: '📊 Excel Import Issues',
                        problems: [
                            {
                                issue: 'Excel file validation fails with "No headers detected"',
                                symptoms: 'Error message appears immediately after file selection',
                                diagnosis: 'First row doesn\'t contain recognizable column headers',
                                solution: 'Step-by-step fix:\n1. Open Excel file\n2. Ensure row 1 contains headers like "First Name", "Last Name"\n3. Remove any empty rows above headers\n4. Check for merged cells in header row\n5. Save file and try import again',
                                example: 'Incorrect: Row 1 is empty, data starts in row 3\nCorrect: Row 1 has "First Name | Last Name | Student ID"',
                                prevention: 'Always use row 1 for headers, avoid merged cells in data area'
                            },
                            {
                                issue: 'Import succeeds but shows "0 students found"',
                                symptoms: 'File uploads successfully but no student data is detected',
                                diagnosis: 'Column headers don\'t match expected format or data rows are empty',
                                solution: 'Resolution steps:\n1. Check column header spelling exactly: "First Name" not "FirstName"\n2. Verify data starts in row 2 (immediately after headers)\n3. Remove any completely empty rows in data area\n4. Ensure at least one student has both first and last name\n5. Save as .xlsx format and retry',
                                example: 'Problem: Headers are "Name" and "Surname"\nSolution: Change to "First Name" and "Last Name"',
                                prevention: 'Use the provided Excel template for guaranteed compatibility'
                            },
                            {
                                issue: 'Course metadata not detected automatically',
                                symptoms: 'Student data imports but course info shows as "TBD" or empty',
                                diagnosis: 'Course metadata not in recognizable format or location',
                                solution: 'Metadata setup:\n1. Add course info in dedicated cells (anywhere in spreadsheet)\n2. Use exact labels: "Course Code:", "Course Name:", "Instructor:", "Term:"\n3. Place values in adjacent cells\n4. Ensure no extra formatting or merged cells\n5. Re-import file',
                                example: 'Cell F2: "Course Code:" | Cell G2: "COMP-2100"\nCell F3: "Course Name:" | Cell G3: "Advanced Programming"',
                                prevention: 'Use consistent labeling and clear cell structure for metadata'
                            }
                        ]
                    },
                    {
                        title: '🎯 Rubric Creation and Transfer Issues',
                        problems: [
                            {
                                issue: 'Rubric won\'t transfer to Grading Tool',
                                symptoms: 'Transfer button is disabled or shows error message',
                                diagnosis: 'Rubric validation failed - missing required information',
                                solution: 'Validation checklist:\n1. ✅ Assignment title filled in\n2. ✅ Total points specified (usually 100)\n3. ✅ At least one criterion defined\n4. ✅ All criteria have descriptions for each level\n5. ✅ Criterion weights sum to 100%\n6. Save rubric and retry transfer',
                                example: 'Common issue: Weights are 30% + 25% + 20% + 15% = 90% (missing 10%)\nSolution: Adjust weights to total exactly 100%',
                                prevention: 'Use the weight validation feature - system warns when weights don\'t total 100%'
                            },
                            {
                                issue: 'Grade calculations seem incorrect in rubric preview',
                                symptoms: 'Expected grades don\'t match calculated grades',
                                diagnosis: 'Performance level multipliers or weights may be incorrect',
                                solution: 'Calculation debugging:\n1. Check each performance level multiplier:\n   - Exceptional: 1.0 (100%)\n   - Accomplished: 0.92 (92%)\n   - Emerging: 0.82 (82%)\n   - etc.\n2. Verify criterion weights total 100%\n3. Test with simple example: all "Accomplished" should = 92%\n4. Use calculator to verify: (92% × 30%) + (92% × 25%) + ... = 92%',
                                example: 'Test case: All criteria at "Accomplished" (92%)\nExpected: 92% overall\nIf different: Check multipliers and weights',
                                prevention: 'Always test rubric with known values before using for actual grading'
                            }
                        ]
                    },
                    {
                        title: '⏰ Session Management and Privacy Issues',
                        problems: [
                            {
                                issue: 'Session expires during grading, losing work',
                                symptoms: 'Sudden logout, data not available, session timeout message',
                                diagnosis: 'Session exceeded configured timeout period (default 60 minutes)',
                                solution: 'Session recovery steps:\n1. Check if auto-save data exists in browser\n2. Look for draft grades in local storage\n3. Re-import class roster (data lost, must start over)\n4. For future: Set reminders for 10 and 5 minutes before expiry\n5. Export session data every 15-20 minutes during grading',
                                example: 'Prevention strategy:\n- Start: 2:00 PM (expires 3:00 PM)\n- Reminder: 2:50 PM (export current work)\n- Reminder: 2:55 PM (finish current student and export)',
                                prevention: 'Work in focused 45-minute sessions, export frequently, set multiple alarms'
                            },
                            {
                                issue: 'Cannot export session data before expiry',
                                symptoms: 'Export buttons disabled or generate empty files',
                                diagnosis: 'Session may be corrupted or browser storage issues',
                                solution: 'Export troubleshooting:\n1. Try different export format (JSON vs Excel vs PDF)\n2. Refresh page and try export again\n3. Check browser console for error messages\n4. Try exporting individual student grades instead of batch\n5. As last resort: manually copy visible grade data',
                                example: 'If bulk export fails:\n1. Navigate to each student\n2. Copy grade and feedback text\n3. Paste into external document\n4. Manual but preserves work',
                                prevention: 'Test export function early in session, use multiple export formats'
                            }
                        ]
                    },
                    {
                        title: '☁️ Cloud Deployment and Performance Issues',
                        problems: [
                            {
                                issue: 'Slow performance or timeouts during file upload',
                                symptoms: 'Long loading times, upload failures, browser hangs',
                                diagnosis: 'Server resource constraints or network issues',
                                solution: 'Performance optimization:\n1. Check file size (keep under 5MB)\n2. Close other browser tabs\n3. Try during off-peak hours\n4. Use wired internet connection if possible\n5. Break large classes into smaller files\n6. Contact system administrator if persistent',
                                example: 'Large class optimization:\n- 120 students → split into 3 files of 40 students each\n- Grade in separate sessions\n- Combine results manually',
                                prevention: 'Regular server monitoring, capacity planning for peak usage'
                            },
                            {
                                issue: 'SSL certificate errors or connection refused',
                                symptoms: 'Browser security warnings, cannot access site',
                                diagnosis: 'SSL certificate expired or server configuration issue',
                                solution: 'SSL troubleshooting:\n1. Check if certificate expired (browser shows date)\n2. Try accessing via IP address instead of domain\n3. Clear browser cache and cookies\n4. Try different browser\n5. Contact system administrator\n6. Check server logs for specific error',
                                example: 'Temporary workaround: Use http://SERVER_IP:3000 (not secure, only for testing)',
                                prevention: 'Monitor certificate expiry dates, set up auto-renewal'
                            }
                        ]
                    }
                ],
                emergencyProcedures: [
                    {
                        title: '🚨 Data Loss Emergency Protocol',
                        description: 'What to do if grading work is lost due to system issues',
                        steps: [
                            '1. Don\'t panic - check all possible recovery options first',
                            '2. Check browser local storage and session storage',
                            '3. Look for auto-saved drafts in browser downloads',
                            '4. Check if any CSV/Excel exports were created',
                            '5. Review browser history for any cached data',
                            '6. Contact system administrator with session ID if available',
                            '7. Document what was lost for reconstruction',
                            '8. Begin re-grading with time extension if needed'
                        ],
                        prevention: 'Export work every 15-20 minutes, use multiple backup formats'
                    },
                    {
                        title: '⚡ System Outage Response',
                        description: 'Procedure when GradingPilot system is unavailable',
                        steps: [
                            '1. Check if issue is local (internet, browser) or system-wide',
                            '2. Try accessing from different device/network',
                            '3. Check system status page if available',
                            '4. Switch to offline grading if deadline approaching',
                            '5. Document grades in spreadsheet as backup',
                            '6. Contact technical support with error details',
                            '7. Plan for extended timeline if needed',
                            '8. Communicate delays to students if necessary'
                        ],
                        prevention: 'Have offline backup grading method ready, communicate system dependencies to administration'
                    }
                ]
            }
        },
        {
            id: 'advanced',
            title: 'Advanced Features & Power User Tips',
            icon: Zap,
            color: 'yellow',
            content: {
                description: 'Advanced functionality, optimization techniques, and power user features for maximum efficiency',
                advancedFeatures: [
                    {
                        title: '⚡ Keyboard Shortcuts and Speed Optimization',
                        description: 'Master keyboard shortcuts for lightning-fast grading',
                        shortcuts: [
                            'Ctrl/Cmd + S: Save current work (works in all tools)',
                            'Ctrl/Cmd + E: Export current data (context-dependent)',
                            'Tab: Navigate between form fields efficiently',
                            'Shift + Tab: Navigate backwards through fields',
                            'Enter: Submit forms or confirm selections',
                            'Escape: Close modal dialogs and cancel operations',
                            'Ctrl/Cmd + Enter: Quick submit in text areas',
                            'F11: Fullscreen mode for distraction-free grading'
                        ],
                        speedTips: [
                            'Use comment libraries extensively - build once, use many times',
                            'Grade similar assignments together for consistency',
                            'Use "Skip" feature for incomplete submissions, return later',
                            'Set up dual monitors: rubric on one, student work on other',
                            'Create standardized feedback templates for common issues',
                            'Use batch operations whenever possible'
                        ]
                    },
                    {
                        title: '🔄 Batch Operations and Automation',
                        description: 'Automate repetitive tasks and process multiple items efficiently',
                        batchFeatures: [
                            {
                                feature: 'Bulk Student Import',
                                description: 'Import multiple class rosters simultaneously',
                                example: 'Upload multiple Excel files:\n- COMP2100_SectionA.xlsx (30 students)\n- COMP2100_SectionB.xlsx (28 students)\n- COMP2100_SectionC.xlsx (32 students)\nResult: Combined roster of 90 students with section tracking',
                                tip: 'Ensure all files use the same column structure for smooth processing'
                            },
                            {
                                feature: 'Mass Rubric Application',
                                description: 'Apply the same rubric to multiple assignments or classes',
                                example: 'Create master rubric for "Programming Projects"\n→ Export as template\n→ Import to multiple classes\n→ Customize specific criteria per assignment\n→ Maintain consistency across sections',
                                tip: 'Build a library of reusable rubric templates for common assignment types'
                            },
                            {
                                feature: 'Batch Grade Export',
                                description: 'Export grades for multiple classes in one operation',
                                example: 'Select multiple grading sessions:\n→ Database Project - Section A\n→ Database Project - Section B\n→ Database Project - Section C\nExport: Combined gradebook with section identifiers',
                                tip: 'Use consistent naming conventions for easy batch selection'
                            }
                        ]
                    },
                    {
                        title: '🔗 Integration and API Usage',
                        description: 'Connect GradingPilot with other educational tools and systems',
                        integrations: [
                            {
                                system: 'Learning Management Systems (LMS)',
                                description: 'Export data compatible with popular LMS platforms',
                                example: 'LMS Integration:\n→ Export grades as CSV with student IDs\n→ Format matches Blackboard/Canvas import requirements\n→ Include assignment names and due dates\n→ Map GradingPilot grades to LMS grade columns',
                                tip: 'Test with small sample before importing full class grades to LMS'
                            },
                            {
                                system: 'Student Information Systems (SIS)',
                                description: 'Import student data and export final grades',
                                example: 'SIS Workflow:\n→ Export student roster from SIS\n→ Format for GradingPilot import\n→ Complete grading in GradingPilot\n→ Export final grades in SIS format\n→ Import to SIS for transcript recording',
                                tip: 'Maintain student ID consistency between systems for accurate matching'
                            },
                            {
                                system: 'External Backup Services',
                                description: 'Automatically backup grading data to cloud storage',
                                example: 'Backup Strategy:\n→ Export session data as JSON\n→ Upload to institutional Google Drive/OneDrive\n→ Organize by term and course\n→ Set retention policies per institutional requirements',
                                tip: 'Encrypt sensitive data before uploading to external services'
                            }
                        ]
                    },
                    {
                        title: '📊 Analytics and Reporting',
                        description: 'Advanced reporting features for grade analysis and insights',
                        analyticsFeatures: [
                            {
                                feature: 'Grade Distribution Analysis',
                                description: 'Comprehensive analysis of grade patterns and distributions',
                                example: 'Analytics Dashboard:\n→ Grade distribution histogram\n→ Performance by criterion analysis\n→ Comparison across sections\n→ Improvement trend tracking\n→ Outlier identification',
                                tip: 'Use analytics to identify criteria that may need rubric adjustment'
                            },
                            {
                                feature: 'Rubric Effectiveness Metrics',
                                description: 'Measure how well rubrics differentiate student performance',
                                example: 'Rubric Analysis:\n→ Criterion discrimination index\n→ Inter-rater reliability (if multiple graders)\n→ Student performance correlation\n→ Time-to-grade efficiency metrics',
                                tip: 'Review rubric effectiveness after each assignment to improve future versions'
                            }
                        ]
                    },
                    {
                        title: '🎨 Customization and Branding',
                        description: 'Customize GradingPilot appearance and functionality for your institution',
                        customizationOptions: [
                            {
                                feature: 'Institutional Branding',
                                description: 'Apply your institution\'s visual identity',
                                example: 'Branding Elements:\n→ Institution logo in header\n→ Custom color scheme (primary/secondary colors)\n→ Custom footer with contact information\n→ Institutional grading policy templates\n→ Custom email templates for notifications',
                                tip: 'Work with IT department to implement branding that matches institutional guidelines'
                            },
                            {
                                feature: 'Custom Grading Scales',
                                description: 'Create specialized grading scales for unique programs',
                                example: 'Custom Scale Example - Art Programs:\n→ "Masterful" (95-100%): Professional gallery quality\n→ "Proficient" (85-94%): Strong artistic execution\n→ "Developing" (75-84%): Shows artistic growth\n→ "Emerging" (65-74%): Basic artistic understanding\n→ "Novice" (0-64%): Needs fundamental development',
                                tip: 'Document custom scales thoroughly and train all instructors on their proper use'
                            }
                        ]
                    },
                    {
                        title: '🔐 Advanced Security and Compliance',
                        description: 'Enhanced security features for sensitive educational environments',
                        securityFeatures: [
                            {
                                feature: 'Multi-Factor Authentication (MFA)',
                                description: 'Additional security layer for instructor accounts',
                                example: 'MFA Setup:\n→ Email + SMS verification\n→ Authenticator app integration (Google Authenticator)\n→ Backup codes for account recovery\n→ Session timeout after inactivity\n→ Failed login attempt monitoring',
                                tip: 'Enable MFA for all instructors handling sensitive student data'
                            },
                            {
                                feature: 'Audit Trail and Compliance',
                                description: 'Comprehensive logging for regulatory compliance',
                                example: 'Audit Features:\n→ Grade change history with timestamps\n→ User access logs\n→ Data export/import tracking\n→ System configuration changes\n→ Privacy compliance verification',
                                tip: 'Review audit logs regularly and maintain them according to institutional policy'
                            }
                        ]
                    }
                ],
                performanceOptimization: [
                    {
                        title: 'Browser Optimization',
                        tips: [
                            'Use Chrome or Firefox for best performance',
                            'Clear browser cache weekly',
                            'Disable unnecessary browser extensions',
                            'Use browser in fullscreen mode for focus',
                            'Keep only one GradingPilot tab open',
                            'Restart browser daily to clear memory leaks'
                        ]
                    },
                    {
                        title: 'Workflow Optimization',
                        tips: [
                            'Grade similar assignments together for consistency',
                            'Use comment libraries extensively',
                            'Set up standardized workspace/environment',
                            'Grade in focused 45-60 minute sessions',
                            'Take breaks to maintain grading quality',
                            'Export work frequently as backup'
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
        <div className="max-w-7xl mx-auto p-6 bg-white">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center mb-4">
                    <GraduationCap className="h-12 w-12 text-blue-600 mr-3" />
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">GradingPilot Help Center</h1>
                        <p className="text-lg text-gray-600 mt-2">Professional Suite v2.0 - Complete User Guide with Examples</p>
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
                        placeholder="Search help topics, features, examples, or troubleshooting..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    />
                </div>
            </div>

            {/* Quick Start Guide */}
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
                                    {/* System Architecture Diagram */}
                                    {section.content.systemArchitecture && (
                                        <DiagramBlock title="System Architecture">
                                            {section.content.systemArchitecture}
                                        </DiagramBlock>
                                    )}

                                    {/* Privacy Model Diagram */}
                                    {section.content.privacyModel && (
                                        <DiagramBlock title="Privacy-First Data Model">
                                            {section.content.privacyModel}
                                        </DiagramBlock>
                                    )}

                                    {/* Deployment Architecture */}
                                    {section.content.deploymentArchitecture && (
                                        <DiagramBlock title="Cloud Deployment Architecture">
                                            {section.content.deploymentArchitecture}
                                        </DiagramBlock>
                                    )}

                                    {/* AI Integration Flow */}
                                    {section.content.aiIntegrationFlow && (
                                        <DiagramBlock title="AI Integration Workflow">
                                            {section.content.aiIntegrationFlow}
                                        </DiagramBlock>
                                    )}

                                    {/* Rubric Structure */}
                                    {section.content.rubricStructure && (
                                        <DiagramBlock title="Professional Rubric Structure">
                                            {section.content.rubricStructure}
                                        </DiagramBlock>
                                    )}

                                    {/* Excel Format Guide */}
                                    {section.content.excelFormatGuide && (
                                        <DiagramBlock title="Excel Import Format Requirements">
                                            {section.content.excelFormatGuide}
                                        </DiagramBlock>
                                    )}

                                    {/* Policy Architecture */}
                                    {section.content.policyArchitecture && (
                                        <DiagramBlock title="Grading Policy System Architecture">
                                            {section.content.policyArchitecture}
                                        </DiagramBlock>
                                    )}

                                    {/* Grading Interface */}
                                    {section.content.gradingInterface && (
                                        <DiagramBlock title="Advanced Grading Interface">
                                            {section.content.gradingInterface}
                                        </DiagramBlock>
                                    )}

                                    {/* Supported Formats */}
                                    {section.content.supportedFormats && (
                                        <DiagramBlock title="File Format Support Matrix">
                                            {section.content.supportedFormats}
                                        </DiagramBlock>
                                    )}

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

                                    {/* Workflow Overview */}
                                    {section.content.workflowOverview && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Workflow Overview</h3>
                                            <div className="space-y-3">
                                                {section.content.workflowOverview.map((workflow, index) => (
                                                    <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                                                        <h4 className="font-medium text-gray-900 mb-2">{workflow.title}</h4>
                                                        <p className="text-gray-600 text-sm mb-2">{workflow.description}</p>
                                                        <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                                                            {workflow.example}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Detailed Workflow */}
                                    {section.content.detailedWorkflow && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Step-by-Step Workflow</h3>
                                            <StepGuide steps={section.content.detailedWorkflow} />
                                        </div>
                                    )}

                                    {/* Detailed Creation Process */}
                                    {section.content.detailedCreationProcess && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Detailed Creation Process</h3>
                                            <StepGuide steps={section.content.detailedCreationProcess} />
                                        </div>
                                    )}

                                    {/* Import Validation Process */}
                                    {section.content.importValidationProcess && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Import Validation Process</h3>
                                            <StepGuide steps={section.content.importValidationProcess} />
                                        </div>
                                    )}

                                    {/* Policy Creation Example */}
                                    {section.content.policyCreationExample && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Policy Creation Example</h3>
                                            <StepGuide steps={section.content.policyCreationExample} />
                                        </div>
                                    )}

                                    {/* Batch Grading Workflow */}
                                    {section.content.batchGradingWorkflow && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Batch Grading Workflow</h3>
                                            <StepGuide steps={section.content.batchGradingWorkflow} />
                                        </div>
                                    )}

                                    {/* Validation Process */}
                                    {section.content.validationProcess && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Validation Process</h3>
                                            <StepGuide steps={section.content.validationProcess} />
                                        </div>
                                    )}

                                    {/* Deployment Process */}
                                    {section.content.deploymentProcess && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Deployment Process</h3>
                                            <StepGuide steps={section.content.deploymentProcess} />
                                        </div>
                                    )}

                                    {/* Example Session */}
                                    {section.content.exampleSession && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Session Example</h3>
                                            <StepGuide steps={section.content.exampleSession} />
                                        </div>
                                    )}

                                    {/* Example Prompt Generation */}
                                    {section.content.examplePromptGeneration && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Prompt Generation Example</h3>
                                            <StepGuide steps={section.content.examplePromptGeneration} />
                                        </div>
                                    )}

                                    {/* Grading Policy Integration */}
                                    {section.content.gradingPolicyIntegration && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Grading Policy Integration</h3>
                                            <StepGuide steps={section.content.gradingPolicyIntegration} />
                                        </div>
                                    )}

                                    {/* Import Export Example */}
                                    {section.content.importExportExample && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Import/Export Example</h3>
                                            <StepGuide steps={section.content.importExportExample} />
                                        </div>
                                    )}

                                    {/* Test Mode Features */}
                                    {section.content.testModeFeatures && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Mode Features</h3>
                                            <StepGuide steps={section.content.testModeFeatures} />
                                        </div>
                                    )}

                                    {/* Best Practices Guide */}
                                    {section.content.bestPracticesGuide && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Best Practices Guide</h3>
                                            <StepGuide steps={section.content.bestPracticesGuide} />
                                        </div>
                                    )}

                                    {/* Privacy Compliance */}
                                    {section.content.privacyCompliance && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Compliance Features</h3>
                                            <StepGuide steps={section.content.privacyCompliance} />
                                        </div>
                                    )}

                                    {/* Sample Prompt */}
                                    {section.content.samplePrompt && (
                                        <ExampleBlock title="Sample AI Prompt">
                                            {section.content.samplePrompt}
                                        </ExampleBlock>
                                    )}

                                    {/* Level Description Example */}
                                    {section.content.levelDescriptionExample && (
                                        <ExampleBlock title="Detailed Level Description Example">
                                            {section.content.levelDescriptionExample}
                                        </ExampleBlock>
                                    )}

                                    {/* Excel Template Example */}
                                    {section.content.excelTemplateExample && (
                                        <ExampleBlock title="Recommended Excel Template">
                                            {section.content.excelTemplateExample}
                                        </ExampleBlock>
                                    )}

                                    {/* Preloaded Policies */}
                                    {section.content.preloadedPolicies && (
                                        <ExampleBlock title="Pre-loaded Institutional Policies">
                                            {section.content.preloadedPolicies}
                                        </ExampleBlock>
                                    )}

                                    {/* Grading Calculation Example */}
                                    {section.content.gradingCalculationExample && (
                                        <ExampleBlock title="Real-Time Grade Calculation">
                                            {section.content.gradingCalculationExample}
                                        </ExampleBlock>
                                    )}

                                    {/* Feedback Library Example */}
                                    {section.content.feedbackLibraryExample && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Feedback Library Examples</h3>
                                            <StepGuide steps={section.content.feedbackLibraryExample} />
                                        </div>
                                    )}

                                    {/* Error Handling Examples */}
                                    {section.content.errorHandlingExamples && (
                                        <ExampleBlock title="Common Import Errors and Solutions">
                                            {section.content.errorHandlingExamples}
                                        </ExampleBlock>
                                    )}

                                    {/* Maintenance Schedule */}
                                    {section.content.maintenanceSchedule && (
                                        <ExampleBlock title="Cloud Maintenance Schedule">
                                            {section.content.maintenanceSchedule}
                                        </ExampleBlock>
                                    )}

                                    {/* Privacy Checklist */}
                                    {section.content.privacyChecklist && (
                                        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                                            <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                                                <Shield className="h-5 w-5 mr-2" />
                                                Privacy Compliance Checklist
                                            </h3>
                                            <ul className="space-y-2">
                                                {section.content.privacyChecklist.map((item, index) => (
                                                    <li key={index} className="flex items-start space-x-2">
                                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                        <span className="text-green-700 text-sm">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Complete Workflows */}
                                    {section.content.completeWorkflows && (
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Complete Workflow Examples</h3>
                                            {section.content.completeWorkflows.map((workflow, workflowIndex) => (
                                                <div key={workflowIndex} className="border border-gray-200 rounded-lg p-6 bg-white">
                                                    <div className="flex items-center mb-4">
                                                        <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                                            {workflowIndex + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-gray-900">{workflow.title}</h4>
                                                            <p className="text-gray-600 text-sm">{workflow.description}</p>
                                                        </div>
                                                    </div>
                                                    <StepGuide steps={workflow.steps} />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Detailed Troubleshooting */}
                                    {section.content.detailedTroubleshooting && (
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Detailed Troubleshooting Guide</h3>
                                            {section.content.detailedTroubleshooting.map((category, categoryIndex) => (
                                                <div key={categoryIndex} className="border border-red-200 rounded-lg p-6 bg-red-50">
                                                    <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                                                        <AlertTriangle className="h-5 w-5 mr-2" />
                                                        {category.title}
                                                    </h4>
                                                    <div className="space-y-4">
                                                        {category.problems.map((problem, problemIndex) => (
                                                            <div key={problemIndex} className="bg-white border border-red-200 rounded-lg p-4">
                                                                <h5 className="font-medium text-red-900 mb-2">❌ {problem.issue}</h5>

                                                                <div className="mb-3">
                                                                    <span className="text-xs font-medium text-red-700 uppercase tracking-wide">Symptoms:</span>
                                                                    <p className="text-sm text-red-700 mt-1">{problem.symptoms}</p>
                                                                </div>

                                                                <div className="mb-3">
                                                                    <span className="text-xs font-medium text-red-700 uppercase tracking-wide">Diagnosis:</span>
                                                                    <p className="text-sm text-red-700 mt-1">{problem.diagnosis}</p>
                                                                </div>

                                                                <div className="mb-3">
                                                                    <span className="text-xs font-medium text-green-700 uppercase tracking-wide">✓ Solution:</span>
                                                                    <div className="text-sm text-green-700 mt-1 whitespace-pre-line">{problem.solution}</div>
                                                                </div>

                                                                {problem.example && (
                                                                    <div className="mb-3 p-3 bg-gray-50 rounded border-l-4 border-blue-400">
                                                                        <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Example:</span>
                                                                        <div className="text-sm text-gray-800 mt-1 whitespace-pre-line">{problem.example}</div>
                                                                    </div>
                                                                )}

                                                                {problem.prevention && (
                                                                    <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                                                        <span className="text-xs font-medium text-yellow-700 uppercase tracking-wide">💡 Prevention:</span>
                                                                        <div className="text-sm text-yellow-800 mt-1">{problem.prevention}</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Emergency Procedures */}
                                    {section.content.emergencyProcedures && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                                                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                                                Emergency Procedures
                                            </h3>
                                            <div className="space-y-4">
                                                {section.content.emergencyProcedures.map((procedure, index) => (
                                                    <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                                                        <h4 className="font-medium text-red-800 mb-2">{procedure.title}</h4>
                                                        <p className="text-sm text-red-700 mb-3">{procedure.description}</p>
                                                        <ol className="space-y-1">
                                                            {procedure.steps.map((step, stepIndex) => (
                                                                <li key={stepIndex} className="text-sm text-red-700 flex items-start">
                                                                    <span className="font-medium mr-2">{stepIndex + 1}.</span>
                                                                    <span>{step}</span>
                                                                </li>
                                                            ))}
                                                        </ol>
                                                        {procedure.prevention && (
                                                            <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                                                <span className="text-xs font-medium text-yellow-700 uppercase tracking-wide">💡 Prevention:</span>
                                                                <div className="text-sm text-yellow-800 mt-1">{procedure.prevention}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Advanced Features */}
                                    {section.content.advancedFeatures && (
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Advanced Features</h3>
                                            {section.content.advancedFeatures.map((feature, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                                                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                        <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                                                        {feature.title}
                                                    </h4>
                                                    <p className="text-gray-600 text-sm mb-3">{feature.description}</p>

                                                    {feature.shortcuts && (
                                                        <div className="mb-3">
                                                            <h5 className="font-medium text-gray-800 mb-2">Keyboard Shortcuts:</h5>
                                                            <ul className="space-y-1">
                                                                {feature.shortcuts.map((shortcut, shortcutIndex) => (
                                                                    <li key={shortcutIndex} className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                                                                        {shortcut}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {feature.speedTips && (
                                                        <div className="mb-3">
                                                            <h5 className="font-medium text-gray-800 mb-2">Speed Optimization Tips:</h5>
                                                            <ul className="space-y-1">
                                                                {feature.speedTips.map((tip, tipIndex) => (
                                                                    <li key={tipIndex} className="flex items-start space-x-2">
                                                                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                                                        <span className="text-sm text-gray-600">{tip}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {feature.batchFeatures && (
                                                        <div className="space-y-3">
                                                            {feature.batchFeatures.map((batchFeature, batchIndex) => (
                                                                <div key={batchIndex} className="border border-gray-100 rounded p-3 bg-gray-50">
                                                                    <h6 className="font-medium text-gray-800 mb-2">{batchFeature.feature}</h6>
                                                                    <p className="text-sm text-gray-600 mb-2">{batchFeature.description}</p>
                                                                    <div className="text-xs text-gray-500 font-mono bg-white p-2 rounded border">
                                                                        {batchFeature.example}
                                                                    </div>
                                                                    {batchFeature.tip && (
                                                                        <div className="mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                                                            <span className="text-xs font-medium text-yellow-700 uppercase">💡 Tip:</span>
                                                                            <div className="text-sm text-yellow-800 mt-1">{batchFeature.tip}</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {feature.integrations && (
                                                        <div className="space-y-3">
                                                            {feature.integrations.map((integration, integrationIndex) => (
                                                                <div key={integrationIndex} className="border border-gray-100 rounded p-3 bg-gray-50">
                                                                    <h6 className="font-medium text-gray-800 mb-2">{integration.system}</h6>
                                                                    <p className="text-sm text-gray-600 mb-2">{integration.description}</p>
                                                                    <div className="text-xs text-gray-500 font-mono bg-white p-2 rounded border whitespace-pre-line">
                                                                        {integration.example}
                                                                    </div>
                                                                    {integration.tip && (
                                                                        <div className="mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                                                            <span className="text-xs font-medium text-yellow-700 uppercase">💡 Tip:</span>
                                                                            <div className="text-sm text-yellow-800 mt-1">{integration.tip}</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {feature.analyticsFeatures && (
                                                        <div className="space-y-3">
                                                            {feature.analyticsFeatures.map((analyticsFeature, analyticsIndex) => (
                                                                <div key={analyticsIndex} className="border border-gray-100 rounded p-3 bg-gray-50">
                                                                    <h6 className="font-medium text-gray-800 mb-2">{analyticsFeature.feature}</h6>
                                                                    <p className="text-sm text-gray-600 mb-2">{analyticsFeature.description}</p>
                                                                    <div className="text-xs text-gray-500 font-mono bg-white p-2 rounded border whitespace-pre-line">
                                                                        {analyticsFeature.example}
                                                                    </div>
                                                                    {analyticsFeature.tip && (
                                                                        <div className="mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                                                            <span className="text-xs font-medium text-yellow-700 uppercase">💡 Tip:</span>
                                                                            <div className="text-sm text-yellow-800 mt-1">{analyticsFeature.tip}</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {feature.customizationOptions && (
                                                        <div className="space-y-3">
                                                            {feature.customizationOptions.map((customization, customizationIndex) => (
                                                                <div key={customizationIndex} className="border border-gray-100 rounded p-3 bg-gray-50">
                                                                    <h6 className="font-medium text-gray-800 mb-2">{customization.feature}</h6>
                                                                    <p className="text-sm text-gray-600 mb-2">{customization.description}</p>
                                                                    <div className="text-xs text-gray-500 font-mono bg-white p-2 rounded border whitespace-pre-line">
                                                                        {customization.example}
                                                                    </div>
                                                                    {customization.tip && (
                                                                        <div className="mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                                                            <span className="text-xs font-medium text-yellow-700 uppercase">💡 Tip:</span>
                                                                            <div className="text-sm text-yellow-800 mt-1">{customization.tip}</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {feature.securityFeatures && (
                                                        <div className="space-y-3">
                                                            {feature.securityFeatures.map((security, securityIndex) => (
                                                                <div key={securityIndex} className="border border-gray-100 rounded p-3 bg-gray-50">
                                                                    <h6 className="font-medium text-gray-800 mb-2 flex items-center">
                                                                        <Shield className="h-4 w-4 mr-2 text-green-600" />
                                                                        {security.feature}
                                                                    </h6>
                                                                    <p className="text-sm text-gray-600 mb-2">{security.description}</p>
                                                                    <div className="text-xs text-gray-500 font-mono bg-white p-2 rounded border whitespace-pre-line">
                                                                        {security.example}
                                                                    </div>
                                                                    {security.tip && (
                                                                        <div className="mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                                                            <span className="text-xs font-medium text-yellow-700 uppercase">💡 Tip:</span>
                                                                            <div className="text-sm text-yellow-800 mt-1">{security.tip}</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Performance Optimization */}
                                    {section.content.performanceOptimization && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                                                Performance Optimization
                                            </h3>
                                            <div className="space-y-4">
                                                {section.content.performanceOptimization.map((category, index) => (
                                                    <div key={index} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                                                        <h4 className="font-medium text-yellow-800 mb-3">{category.title}</h4>
                                                        <ul className="space-y-2">
                                                            {category.tips.map((tip, tipIndex) => (
                                                                <li key={tipIndex} className="flex items-start space-x-2">
                                                                    <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                                    <span className="text-sm text-yellow-700">{tip}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
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