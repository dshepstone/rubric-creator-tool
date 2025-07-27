// Enhanced RubricCreator.js with complete class‑list integration and batch‑grading functionality
import React, { useState, useEffect, useRef } from 'react';
import { useAssessment } from './SharedContext';
import { ensureUniqueCriterionIds } from '../utils/ensureUniqueCriterionIds';
import { generateReportHeader, hasSchoolLogo } from './logoIntegrationUtility';


import {
    Plus,
    X,
    Save,
    Upload,
    Download,
    FileText,
    RotateCcw,
    Minimize2,
    ChevronUp,
    ChevronDown,
    Maximize2,
    ArrowRight,
    AlertTriangle,
    CheckCircle,
    Code,       
    Settings
} from 'lucide-react';


// SimpleRichTextEditor component (assuming it exists)
const SimpleRichTextEditor = React.forwardRef(({ value, onChange, placeholder }, ref) => {
    useEffect(() => {
        if (ref.current) {
            ref.current.innerHTML = value || '';
        }
    }, [value, ref]);

    return (
        <div className="rich-text-editor">
            <div
                ref={ref}
                contentEditable
                onInput={(e) => onChange(e.target.innerHTML)}
                className="min-h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ minHeight: '120px' }}
                dangerouslySetInnerHTML={{ __html: value || '' }}
                placeholder={placeholder}
            />
            <style>{`
                [contenteditable]:empty:before {
                    content: attr(placeholder);
                    color: #9ca3af;
                    font-style: italic;
                }
                [contenteditable] ul {
                    list-style-type: disc;
                    margin-left: 1.5em;
                    margin-top: 0.5em;
                    margin-bottom: 0.5em;
                }
                [contenteditable] ol {
                    list-style-type: decimal;
                    margin-left: 1.5em;
                    margin-top: 0.5em;
                    margin-bottom: 0.5em;
                }
                [contenteditable] li {
                    margin-bottom: 0.25em;
                }
                [contenteditable] h3 {
                    font-size: 1.25em;
                    font-weight: bold;
                    margin-top: 0.5em;
                    margin-bottom: 0.5em;
                }
                [contenteditable] p {
                    margin-bottom: 0.5em;
                }
                [contenteditable] p:last-child {
                    margin-bottom: 0;
                }
            `}</style>
        </div>
    );
});



SimpleRichTextEditor.displayName = 'SimpleRichTextEditor';

// CORRECTED: Complete Components for RubricCreator.js
// Insert these components before "const RubricCreator = () => {"

// JSON Paste Panel Component
const JSONPastePanel = ({ onImport, isOpen, onToggle }) => {
    const [jsonInput, setJsonInput] = React.useState('');
    const [error, setError] = React.useState('');

    const handleImport = () => {
        try {
            const parsed = JSON.parse(jsonInput);

            // Use the enhanced validation
            const validation = validateRubricStructure(parsed);

            if (!validation.isValid) {
                setError('Invalid rubric structure:\n' + validation.errors.join('\n'));
                return;
            }

            onImport(parsed);
            setJsonInput('');
            setError('');
            onToggle(); // Close the panel

        } catch (err) {
            if (err instanceof SyntaxError) {
                setError('Invalid JSON format. Please check your JSON syntax.');
            } else {
                setError(err.message);
            }
        }
    };

    const handleClear = () => {
        setJsonInput('');
        setError('');
    };

    return (
        <div className="border border-gray-200 rounded-lg mb-6">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors rounded-t-lg"
            >
                <div className="flex items-center gap-3">
                    <Code className="text-purple-600" size={20} />
                    <span className="font-semibold text-gray-800">📋 Paste JSON Rubric</span>
                </div>
                <ChevronDown
                    className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    size={20}
                />
            </button>

            {isOpen && (
                <div className="p-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-4">
                        Paste a complete rubric JSON structure below. This is an alternative to file upload for quick importing.
                    </p>

                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder={`Paste your rubric JSON here, for example:
{
  "assignmentInfo": {
    "title": "Web Development Project",
    "totalPoints": 100
  },
  "rubricLevels": [...],
  "criteria": [...]
}`}
                        className="w-full h-48 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-y"
                    />

                    {error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleImport}
                            disabled={!jsonInput.trim()}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                        >
                            <Upload size={14} />
                            Import JSON
                        </button>
                        <button
                            onClick={handleClear}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Achievement Level Control Component
const AchievementLevelControl = ({ rubricData, setRubricData }) => {
    const [levelCount, setLevelCount] = React.useState(rubricData.rubricLevels.length);

    // Predefined level templates for different counts
    const levelTemplates = {
        2: [
            { level: 'unacceptable', name: 'Unacceptable', description: 'Does not meet standards', color: '#e74c3c', multiplier: 0 },
            { level: 'acceptable', name: 'Acceptable', description: 'Meets standards', color: '#27ae60', multiplier: 1.0 }
        ],
        3: [
            { level: 'unacceptable', name: 'Unacceptable', description: 'Does not meet standards', color: '#e74c3c', multiplier: 0 },
            { level: 'developing', name: 'Developing', description: 'Approaching standards', color: '#f39c12', multiplier: 0.6 },
            { level: 'acceptable', name: 'Acceptable', description: 'Meets standards', color: '#27ae60', multiplier: 1.0 }
        ],
        4: [
            { level: 'incomplete', name: 'Incomplete', description: 'No submission', color: '#95a5a6', multiplier: 0 },
            { level: 'developing', name: 'Developing', description: 'Needs improvement', color: '#f39c12', multiplier: 0.5 },
            { level: 'acceptable', name: 'Acceptable', description: 'Meets standards', color: '#27ae60', multiplier: 0.75 },
            { level: 'accomplished', name: 'Accomplished', description: 'Exceeds standards', color: '#2980b9', multiplier: 1.0 }
        ],
        5: [
            { level: 'incomplete', name: 'Incomplete', description: 'No submission', color: '#95a5a6', multiplier: 0 },
            { level: 'unacceptable', name: 'Unacceptable', description: 'Below standards', color: '#e74c3c', multiplier: 0.3 },
            { level: 'developing', name: 'Developing', description: 'Approaching standards', color: '#f39c12', multiplier: 0.55 },
            { level: 'acceptable', name: 'Acceptable', description: 'Meets standards', color: '#27ae60', multiplier: 0.75 },
            { level: 'accomplished', name: 'Accomplished', description: 'Exceeds standards', color: '#2980b9', multiplier: 1.0 }
        ],
        6: [
            { level: 'incomplete', name: 'Incomplete', description: 'No submission', color: '#95a5a6', multiplier: 0 },
            { level: 'unacceptable', name: 'Unacceptable', description: 'Below standards', color: '#e74c3c', multiplier: 0.3 },
            { level: 'developing', name: 'Developing', description: 'Approaching standards', color: '#f39c12', multiplier: 0.55 },
            { level: 'acceptable', name: 'Acceptable', description: 'Meets standards', color: '#27ae60', multiplier: 0.7 },
            { level: 'accomplished', name: 'Accomplished', description: 'Exceeds standards', color: '#2980b9', multiplier: 0.85 },
            { level: 'exceptional', name: 'Exceptional', description: 'Outstanding quality', color: '#8e44ad', multiplier: 1.0 }
        ],
        7: [
            { level: 'incomplete', name: 'Incomplete', description: 'No submission or unusable', color: '#95a5a6', multiplier: 0 },
            { level: 'unacceptable', name: 'Unacceptable', description: 'Below minimum standards', color: '#e74c3c', multiplier: 0.3 },
            { level: 'developing', name: 'Developing', description: 'Approaching standards', color: '#f39c12', multiplier: 0.55 },
            { level: 'acceptable', name: 'Acceptable (PASS)', description: 'Meets minimum standards', color: '#27ae60', multiplier: 0.7 },
            { level: 'emerging', name: 'Emerging', description: 'Above standard expectations', color: '#2980b9', multiplier: 0.82 },
            { level: 'accomplished', name: 'Accomplished', description: 'Strong professional quality', color: '#16a085', multiplier: 0.92 },
            { level: 'exceptional', name: 'Exceptional', description: 'Outstanding professional quality', color: '#8e44ad', multiplier: 1.0 }
        ]
    };

    const handleLevelCountChange = (newCount) => {
        if (newCount < 2 || newCount > 7) return;

        const template = levelTemplates[newCount];
        setLevelCount(newCount);

        // Update rubric data with new levels
        setRubricData(prev => ({
            ...prev,
            rubricLevels: [...template],
            // Update criteria to remove any level references that no longer exist
            criteria: prev.criteria.map(criterion => ({
                ...criterion,
                levels: Object.fromEntries(
                    template.map(level => [level.level, criterion.levels[level.level] || { description: '', pointRange: '' }])
                )
            }))
        }));
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Settings className="text-blue-600" size={20} />
                    Achievement Level Configuration
                </h3>
                <div className="text-sm text-gray-600">
                    Current: {levelCount} levels
                </div>
            </div>

            <div className="grid grid-cols-6 gap-2 mb-4">
                {[2, 3, 4, 5, 6, 7].map(count => (
                    <button
                        key={count}
                        onClick={() => handleLevelCountChange(count)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${levelCount === count
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                            }`}
                    >
                        {count} Levels
                    </button>
                ))}
            </div>

            <div className="text-sm text-gray-600 space-y-1">
                <p><strong>2-3 Levels:</strong> Simple pass/fail or basic progression</p>
                <p><strong>4-5 Levels:</strong> Standard rubric with clear progression</p>
                <p><strong>6-7 Levels:</strong> Detailed assessment with fine-grained feedback</p>
            </div>

            {levelCount !== rubricData.rubricLevels.length && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                    ⚠️ Changing level count will reset level descriptions for all criteria
                </div>
            )}
        </div>
    );
};


// Enhanced JSON validation function
const validateRubricStructure = (data) => {
    const errors = [];

    // Check assignmentInfo
    if (!data.assignmentInfo || typeof data.assignmentInfo !== 'object') {
        errors.push('Missing or invalid assignmentInfo object');
    } else {
        // Validate required assignmentInfo fields
        if (!data.assignmentInfo.hasOwnProperty('title')) {
            errors.push('assignmentInfo.title is required');
        }
        if (!data.assignmentInfo.hasOwnProperty('weight')) {
            errors.push('assignmentInfo.weight is required');
        }
        if (!data.assignmentInfo.hasOwnProperty('totalPoints')) {
            errors.push('assignmentInfo.totalPoints is required');
        }
    }

    // Check criteria - must be an array
    if (!Array.isArray(data.criteria)) {
        errors.push('criteria must be an array');
    } else if (data.criteria.length === 0) {
        errors.push('criteria array cannot be empty');
    } else {
        // Validate each criterion
        data.criteria.forEach((criterion, index) => {
            if (!criterion.id) {
                errors.push(`Criterion ${index + 1}: missing id`);
            }
            if (!criterion.hasOwnProperty('maxPoints') || typeof criterion.maxPoints !== 'number') {
                errors.push(`Criterion ${index + 1}: maxPoints must be a number`);
            }
            if (!criterion.feedbackLibrary || typeof criterion.feedbackLibrary !== 'object') {
                errors.push(`Criterion ${index + 1}: missing feedbackLibrary object`);
            } else {
                // Ensure feedbackLibrary has required arrays
                ['strengths', 'improvements', 'general'].forEach(category => {
                    if (!Array.isArray(criterion.feedbackLibrary[category])) {
                        criterion.feedbackLibrary[category] = [];
                    }
                });
            }
            if (!criterion.levels || typeof criterion.levels !== 'object') {
                criterion.levels = {};
            }
        });
    }

    // Check rubricLevels - must be an array
    if (!Array.isArray(data.rubricLevels)) {
        errors.push('rubricLevels must be an array');
    } else if (data.rubricLevels.length === 0) {
        errors.push('rubricLevels array cannot be empty');
    } else {
        // Validate each level
        data.rubricLevels.forEach((level, index) => {
            if (!level.level) {
                errors.push(`Rubric level ${index + 1}: missing level identifier`);
            }
            if (!level.name) {
                errors.push(`Rubric level ${index + 1}: missing name`);
            }
            if (!level.hasOwnProperty('multiplier') || typeof level.multiplier !== 'number') {
                errors.push(`Rubric level ${index + 1}: multiplier must be a number`);
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
        data: data
    };
};

const RubricCreator = () => {
    // ENHANCED: Get shared context functions and state with class list access
    const {
        sharedRubric,
        setSharedRubric,
        transferRubricToGradingWithDetails,
        setActiveTab,
        classList, // ADDED: Access to class list
        initializeGradingSession, // ADDED: Access to grading session function
        activeTab
    } = useAssessment();

    // Default rubric levels (7-level system)
    const defaultLevels = [
        { level: 'incomplete', name: 'Incomplete', description: 'No submission or unusable', color: '#95a5a6', multiplier: 0 },
        { level: 'unacceptable', name: 'Unacceptable', description: 'Below minimum standards', color: '#e74c3c', multiplier: 0.3 },
        { level: 'developing', name: 'Developing', description: 'Approaching standards', color: '#f39c12', multiplier: 0.55 },
        { level: 'acceptable', name: 'Acceptable (PASS)', description: 'Meets minimum standards', color: '#27ae60', multiplier: 0.7 },
        { level: 'emerging', name: 'Emerging', description: 'Above standard expectations', color: '#2980b9', multiplier: 0.82 },
        { level: 'accomplished', name: 'Accomplished', description: 'Strong professional quality', color: '#16a085', multiplier: 0.92 },
        { level: 'exceptional', name: 'Exceptional', description: 'Outstanding professional quality', color: '#8e44ad', multiplier: 1.0 }
    ];

    // Initialize state from shared context or defaults
    const [rubricData, setRubricData] = useState(() => {
        if (sharedRubric) {
            return sharedRubric;
        }
        return {
            assignmentInfo: {
                title: '',
                description: '',
                weight: 25,
                passingThreshold: 60,
                totalPoints: 100
            },
            rubricLevels: [...defaultLevels],
            criteria: [
                {
                    id: 'criterion-1',
                    name: '',
                    description: '',
                    maxPoints: 20,
                    weight: 20,
                    levels: {},
                    feedbackLibrary: {
                        strengths: [],
                        improvements: [],
                        general: []
                    }
                }
            ]
        };
    });

    const [pointingSystem, setPointingSystem] = useState('multiplier');
    const [reversedOrder, setReversedOrder] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [expandedFeedback, setExpandedFeedback] = useState({});
    const [inlineEditor, setInlineEditor] = useState({
        show: false,
        content: '',
        field: null,
        onSave: null,
        criterionId: null,
        level: null,
        type: null // 'assignment', 'criterion', 'level', or 'feedback'
    });
    const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

    const [showJSONPaste, setShowJSONPaste] = useState(false);

    // Use refs to store editor content and DOM node
    const richTextContentRef = useRef('');
    const editorRef = useRef(null);

    // Refs for file inputs
    const importInputRef = useRef(null);

    // Auto-save to shared context whenever rubricData changes
    useEffect(() => {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }

        const timeoutId = setTimeout(() => {
            setSharedRubric(rubricData);
        }, 1000); // Auto-save after 1 second of inactivity

        setAutoSaveTimeout(timeoutId);

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [rubricData, setSharedRubric]);

    // Load shared rubric when it changes externally
    useEffect(() => {
        if (sharedRubric && activeTab === 'rubric-creator') {
            setRubricData(sharedRubric);
        }
    }, [sharedRubric, activeTab]);

    // Toggle feedback section expansion
    const toggleFeedbackExpansion = (criterionId) => {
        setExpandedFeedback(prev => ({
            ...prev,
            [criterionId]: !prev[criterionId]
        }));
    };

    // Launch the inline rich text editor
    const openInlineEditor = (content, field, onSave, criterionId = null, level = null, type = 'assignment') => {
        // Initialize the ref with current content
        richTextContentRef.current = content || '';

        setInlineEditor({
            show: true,
            content: content || '',
            field,
            onSave,
            criterionId,
            level,
            type
        });
    };

    // Helper function to safely render HTML content in textareas
    const renderFormattedContent = (htmlContent) => {
        if (!htmlContent) return '';

        // Create a temporary div to extract text while preserving some formatting
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // Convert basic HTML to readable text format
        let textContent = htmlContent
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<p[^>]*>/gi, '')
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
            .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
            .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
            .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
            .replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_')
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
            .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n')
            .replace(/<\/ul>/gi, '\n')
            .replace(/<ul[^>]*>/gi, '')
            .replace(/<\/ol>/gi, '\n')
            .replace(/<ol[^>]*>/gi, '')
            .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
            .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
            .trim();

        return textContent;
    };

    // Helper function to convert formatted text back to HTML
    const convertFormattedTextToHtml = (text) => {
        if (!text) return '';

        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<u>$1</u>')
            .replace(/### (.*?)\n/g, '<h3>$1</h3>')
            .replace(/• (.*?)\n/g, '<li>$1</li>')
            .replace(/\n/g, '<br>')
            .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    };

    // Toggle all textareas to expanded or collapsed state
    const toggleAllTextareas = (expand) => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            if (expand) {
                textarea.style.height = '200px';
                textarea.style.maxHeight = '400px';
            } else {
                // Reset to default sizes based on context
                if (textarea.closest('.assignment-info')) {
                    textarea.style.height = '80px';
                    textarea.style.maxHeight = '200px';
                } else if (textarea.closest('td')) {
                    if (textarea.rows <= 2) {
                        textarea.style.height = '48px';
                        textarea.style.maxHeight = '200px';
                    } else {
                        textarea.style.height = '80px';
                        textarea.style.maxHeight = '300px';
                    }
                }
            }
        });
    };

    // Close inline editor and optionally save
    const closeInlineEditor = (save = false) => {
        if (save && inlineEditor.onSave) {
            // Get the current content from ref (most up-to-date)
            const finalContent = richTextContentRef.current;
            inlineEditor.onSave(finalContent);
        }

        setInlineEditor({
            show: false,
            content: '',
            field: null,
            onSave: null,
            criterionId: null,
            level: null,
            type: null
        });
        richTextContentRef.current = '';
    };

    // Reset textarea sizes to original dimensions
    const resetTextareaSizes = () => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            // Reset to default sizes based on context
            if (textarea.closest('.assignment-info')) {
                textarea.style.height = '80px';
                textarea.style.maxHeight = '200px';
            } else if (textarea.closest('td')) {
                // Criterion or level descriptions
                if (textarea.rows <= 2) {
                    textarea.style.height = '48px';
                    textarea.style.maxHeight = '200px';
                } else {
                    textarea.style.height = '80px';
                    textarea.style.maxHeight = '300px';
                }
            }
            textarea.style.width = '100%';
        });
    };

    // Calculate total points based on current settings
    const calculateTotalPoints = () => {
        return rubricData.criteria.reduce((total, criterion) => total + criterion.maxPoints, 0);
    };

    // Update assignment info and recalculate total points
    const updateAssignmentInfo = (field, value) => {
        setRubricData(prev => {
            const updated = {
                ...prev,
                assignmentInfo: { ...prev.assignmentInfo, [field]: value }
            };

            // Auto-calculate total points
            if (field !== 'totalPoints') {
                updated.assignmentInfo.totalPoints = calculateTotalPoints();
            }

            return updated;
        });
    };

    // Add new criterion
    const addCriterion = () => {
        const newCriterion = {
            id: `criterion-${Date.now()}`,
            name: '',
            description: '',
            maxPoints: 20,
            weight: 20,
            levels: {},
            feedbackLibrary: {
                strengths: [],
                improvements: [],
                general: []
            }
        };

        setRubricData(prev => ({
            ...prev,
            criteria: [...prev.criteria, newCriterion]
        }));
    };

    // Remove criterion
    const removeCriterion = (criterionId) => {
        setRubricData(prev => ({
            ...prev,
            criteria: prev.criteria.filter(c => c.id !== criterionId)
        }));
    };

    // Update criterion
    const updateCriterion = (criterionId, field, value) => {
        setRubricData(prev => ({
            ...prev,
            criteria: prev.criteria.map(criterion =>
                criterion.id === criterionId
                    ? { ...criterion, [field]: value }
                    : criterion
            )
        }));
    };

    // Update criterion level description
    const updateCriterionLevel = (criterionId, level, field, value) => {
        setRubricData(prev => ({
            ...prev,
            criteria: prev.criteria.map(criterion =>
                criterion.id === criterionId
                    ? {
                        ...criterion,
                        levels: {
                            ...criterion.levels,
                            [level]: {
                                ...criterion.levels[level],
                                [field]: value
                            }
                        }
                    }
                    : criterion
            )
        }));
    };

    // Add feedback item to criterion
    const addFeedbackItem = (criterionId, category, item) => {
        if (!item || !item.trim()) return;

        const htmlItem = convertFormattedTextToHtml(item.trim());

        setRubricData(prev => ({
            ...prev,
            criteria: prev.criteria.map(criterion =>
                criterion.id === criterionId
                    ? {
                        ...criterion,
                        feedbackLibrary: {
                            ...criterion.feedbackLibrary,
                            [category]: [...criterion.feedbackLibrary[category], htmlItem]
                        }
                    }
                    : criterion
            )
        }));
    };

    // Remove feedback item
    const removeFeedbackItem = (criterionId, category, index) => {
        setRubricData(prev => ({
            ...prev,
            criteria: prev.criteria.map(criterion =>
                criterion.id === criterionId
                    ? {
                        ...criterion,
                        feedbackLibrary: {
                            ...criterion.feedbackLibrary,
                            [category]: criterion.feedbackLibrary[category].filter((_, i) => i !== index)
                        }
                    }
                    : criterion
            )
        }));
    };

    // Calculate point range for a level
    const calculatePointRange = (criterion, level) => {
        const rubricLevel = rubricData.rubricLevels.find(l => l.level === level);
        if (!rubricLevel) return '0';

        if (pointingSystem === 'multiplier') {
            const points = Math.round(criterion.maxPoints * rubricLevel.multiplier);
            return level === 'incomplete' ? '0' : points.toString();
        } else {
            // Custom points would be entered directly
            return criterion.levels[level]?.pointRange || '0';
        }
    };

    // Get display levels (potentially reversed)
    const getDisplayLevels = () => {
        return reversedOrder ? [...rubricData.rubricLevels].reverse() : rubricData.rubricLevels;
    };

    // Save rubric to JSON
    const saveRubric = () => {
        const dataStr = JSON.stringify(rubricData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rubric_${rubricData.assignmentInfo.title.replace(/\s+/g, '_') || 'draft'}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Export rubric for grading template
    const exportForGrading = () => {
        const exportData = prepareRubricForExport();

        // Save to shared context for grading tool
        setSharedRubric(exportData);

        // Also download as backup
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rubric_${rubricData.assignmentInfo.title.replace(/\s+/g, '_') || 'export'}_final.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Prepare rubric data for export/transfer
    const prepareRubricForExport = () => {
        const exportData = { ...rubricData };

        // Ensure all criterion levels have proper point ranges
        exportData.criteria = exportData.criteria.map(criterion => ({
            ...criterion,
            levels: Object.fromEntries(
                rubricData.rubricLevels.map(level => [
                    level.level,
                    {
                        pointRange: calculatePointRange(criterion, level.level),
                        description: criterion.levels[level.level]?.description || ''
                    }
                ])
            )
        }));

        // Update total points
        exportData.assignmentInfo.totalPoints = calculateTotalPoints();

        return exportData;
    };

    // ENHANCED: Transfer to grading tool with class list validation and batch grading
    const transferToGrading = () => {
        const exportData = prepareRubricForExport();

        // STEP 1: Check if class list is loaded and has course metadata
        if (!classList || !classList.students || classList.students.length === 0) {
            // If no class list, show confirmation dialog
            const userChoice = window.confirm(
                "No class list has been loaded yet.\n\n" +
                "Would you like to:\n" +
                "• Click 'OK' to go to Class Manager to load a class list first\n" +
                "• Click 'Cancel' to proceed to Grading Tool for individual grading\n\n" +
                "Note: Batch grading requires a loaded class list with course information."
            );

            if (userChoice) {
                // User chose to load class list first
                setSharedRubric(exportData);
                setActiveTab('class-manager');
                alert("Rubric saved! Please import your class list, then use 'Start Batch Grading' to begin.");
                return;
            } else {
                // User chose to proceed with individual grading
                setSharedRubric(exportData);
                setActiveTab('grading-tool');
                console.log('✅ Rubric transferred for individual grading:', exportData.assignmentInfo?.title || 'Untitled');
                return;
            }
        }

        // STEP 2: Class list exists - proceed with batch grading setup
        setSharedRubric(exportData);

        // STEP 3: Enhanced initialization with course data verification
        console.log('🔄 Initializing grading session with course metadata:', classList.courseMetadata);

        const success = initializeGradingSession(classList);

        if (success) {
            // STEP 4: Switch to grading tool
            setActiveTab('grading-tool');

            // STEP 5: Show enhanced success message with course info
            const courseInfo = classList.courseMetadata || {};
            const hasCompleteInfo = courseInfo.courseCode && courseInfo.courseName &&
                (courseInfo.instructor || courseInfo.professors) && courseInfo.term;

            alert(
                `🎯 Batch Grading Started!\n\n` +
                `Rubric: ${exportData.assignmentInfo?.title || 'Untitled'}\n` +
                `Class: ${classList.students.length} students\n` +
                `Starting with: ${classList.students[0]?.name || 'First Student'}\n\n` +
                `Course Information:\n` +
                `• Code: ${courseInfo.courseCode || 'Not specified'}\n` +
                `• Name: ${courseInfo.courseName || 'Not specified'}\n` +
                `• Instructor: ${courseInfo.instructor || courseInfo.professors || 'Not specified'}\n` +
                `• Term: ${courseInfo.term || 'Not specified'}\n\n` +
                `${hasCompleteInfo ?
                    '✅ Course information has been automatically loaded from your class list.' :
                    '⚠️ Some course information is missing. You can manually enter it in the grading tool or use the "Pull Course Data" button.'}`
            );

            console.log('✅ Batch grading session started:', {
                rubric: exportData.assignmentInfo?.title,
                students: classList.students.length,
                firstStudent: classList.students[0]?.name,
                courseMetadata: classList.courseMetadata
            });
        } else {
            // Fallback if session initialization fails
            setActiveTab('grading-tool');
            alert('Rubric transferred, but batch grading session could not be initialized. You can grade individual students and manually enter course information.');
        }
    };

    // Import rubric data
    const importRubric = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    // Validate the imported data structure
                    if (importedData.assignmentInfo && importedData.criteria && importedData.rubricLevels) {
                        setRubricData(importedData);
                    } else {
                        alert('Invalid rubric format. Please check the JSON structure.');
                    }
                } catch (error) {
                    alert('Error loading rubric. Please check the JSON format.');
                    console.error('Import error:', error);
                }
            };
            reader.readAsText(file);
        }
        // Reset file input
        event.target.value = '';
    };

    // Enhanced JSON validation function
    const validateRubricStructure = (data) => {
        const errors = [];

        // Check assignmentInfo
        if (!data.assignmentInfo || typeof data.assignmentInfo !== 'object') {
            errors.push('Missing or invalid assignmentInfo object');
        } else {
            // Validate required assignmentInfo fields
            if (!data.assignmentInfo.hasOwnProperty('title')) {
                errors.push('assignmentInfo.title is required');
            }
            if (!data.assignmentInfo.hasOwnProperty('weight')) {
                errors.push('assignmentInfo.weight is required');
            }
            if (!data.assignmentInfo.hasOwnProperty('totalPoints')) {
                errors.push('assignmentInfo.totalPoints is required');
            }
        }

        // Check criteria - must be an array
        if (!Array.isArray(data.criteria)) {
            errors.push('criteria must be an array');
        } else if (data.criteria.length === 0) {
            errors.push('criteria array cannot be empty');
        } else {
            // Validate each criterion
            data.criteria.forEach((criterion, index) => {
                if (!criterion.id) {
                    errors.push(`Criterion ${index + 1}: missing id`);
                }
                if (!criterion.hasOwnProperty('maxPoints') || typeof criterion.maxPoints !== 'number') {
                    errors.push(`Criterion ${index + 1}: maxPoints must be a number`);
                }
                if (!criterion.feedbackLibrary || typeof criterion.feedbackLibrary !== 'object') {
                    errors.push(`Criterion ${index + 1}: missing feedbackLibrary object`);
                } else {
                    // Ensure feedbackLibrary has required arrays
                    ['strengths', 'improvements', 'general'].forEach(category => {
                        if (!Array.isArray(criterion.feedbackLibrary[category])) {
                            criterion.feedbackLibrary[category] = [];
                        }
                    });
                }
                if (!criterion.levels || typeof criterion.levels !== 'object') {
                    criterion.levels = {};
                }
            });
        }

        // Check rubricLevels - must be an array
        if (!Array.isArray(data.rubricLevels)) {
            errors.push('rubricLevels must be an array');
        } else if (data.rubricLevels.length === 0) {
            errors.push('rubricLevels array cannot be empty');
        } else {
            // Validate each level
            data.rubricLevels.forEach((level, index) => {
                if (!level.level) {
                    errors.push(`Rubric level ${index + 1}: missing level identifier`);
                }
                if (!level.name) {
                    errors.push(`Rubric level ${index + 1}: missing name`);
                }
                if (!level.hasOwnProperty('multiplier') || typeof level.multiplier !== 'number') {
                    errors.push(`Rubric level ${index + 1}: multiplier must be a number`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            data: data
        };
    };

    // Enhanced Import from JSON paste function
    const importFromJSON = (jsonData) => {
        try {
            // Validate the structure
            const validation = validateRubricStructure(jsonData);

            if (!validation.isValid) {
                const errorMessage = 'Invalid rubric structure:\n' + validation.errors.join('\n');
                alert(errorMessage);
                console.error('JSON validation errors:', validation.errors);
                return;
            }

            // Ensure the data has default values for any missing optional fields
            const processedData = {
                assignmentInfo: {
                    title: '',
                    description: '',
                    weight: 25,
                    passingThreshold: 60,
                    totalPoints: 100,
                    ...jsonData.assignmentInfo
                },
                rubricLevels: [...jsonData.rubricLevels],
                criteria: jsonData.criteria.map(criterion => ({
                    id: criterion.id || `criterion-${Date.now()}-${Math.random()}`,
                    name: criterion.name || '',
                    description: criterion.description || '',
                    maxPoints: criterion.maxPoints || 20,
                    weight: criterion.weight || 20,
                    levels: criterion.levels || {},
                    feedbackLibrary: {
                        strengths: [],
                        improvements: [],
                        general: [],
                        ...criterion.feedbackLibrary
                    }
                }))
            };

            setRubricData(processedData);
            console.log('✅ Rubric imported successfully from JSON paste');

        } catch (error) {
            alert('Error processing JSON data: ' + error.message);
            console.error('JSON import error:', error);
        }
    };

    

    // Reset to default rubric
    const resetRubric = () => {
        if (window.confirm('Are you sure you want to reset to default rubric? This will lose all current work.')) {
            const defaultRubric = {
                assignmentInfo: {
                    title: '',
                    description: '',
                    weight: 25,
                    passingThreshold: 60,
                    totalPoints: 100
                },
                rubricLevels: [...defaultLevels],
                criteria: [
                    {
                        id: 'criterion-1',
                        name: '',
                        description: '',
                        maxPoints: 20,
                        weight: 20,
                        levels: {},
                        feedbackLibrary: {
                            strengths: [],
                            improvements: [],
                            general: []
                        }
                    }
                ]
            };
            setRubricData(defaultRubric);
        }
    };

    // Export to HTML
    // Export to HTML
    const exportToHTML = () => {
        const displayLevels = getDisplayLevels();
        const totalPoints = calculateTotalPoints();

        // Generate header with logo
        const reportData = {
            title: `${rubricData.assignmentInfo.title || 'Assessment Rubric'} - Rubric`,
            courseCode: '',
            courseName: '',
            section: '',
            rubricTitle: ''
        };

        const headerHtml = generateReportHeader(reportData, { maxHeight: 60 });

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${rubricData.assignmentInfo.title || 'Assessment Rubric'} - Rubric</title>
    <style>
        body { font-family: 'Arial', sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; line-height: 1.4; }
        .header { margin-bottom: 30px; }
        .assignment-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
        .rubric-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 0.85rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .rubric-table th, .rubric-table td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; vertical-align: top; }
        .rubric-table th { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; font-weight: 600; }
        .criterion-header { background: #f1f5f9; font-weight: 600; color: #334155; }
        .level-exceptional { background: #dcfce7; border-left: 4px solid #16a34a; }
        .level-proficient { background: #dbeafe; border-left: 4px solid #2563eb; }
        .level-developing { background: #fef3c7; border-left: 4px solid #d97706; }
        .level-inadequate { background: #fee2e2; border-left: 4px solid #dc2626; }
        .points { font-weight: 600; color: #059669; text-align: center; }
        .footer { margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; text-align: center; font-size: 0.875rem; color: #64748b; }
        .school-logo, .report-logo, .assignment-logo { max-height: 60px; max-width: 200px; object-fit: contain; }
        
        @media print {
            body { font-size: 10pt; background: white; }
            .school-logo, .report-logo, .assignment-logo { max-height: 40px !important; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
        }
    </style>
</head>
<body>
    ${headerHtml}

    <div class="assignment-info">
        <h2 style="margin: 0 0 15px 0; color: #1e40af;">Assignment Information</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; font-size: 0.95rem;">
            <div><strong>Weight:</strong> ${rubricData.assignmentInfo.weight || 0}%</div>
            <div><strong>Total Points:</strong> ${totalPoints}</div>
            <div><strong>Passing Threshold:</strong> ${rubricData.assignmentInfo.passingThreshold || 60}%</div>
        </div>
        ${rubricData.assignmentInfo.description ? `<div style="margin-top: 15px;"><strong>Description:</strong><br>${rubricData.assignmentInfo.description}</div>` : ''}
    </div>

    <table class="rubric-table">
        <thead>
            <tr>
                <th style="width: 15%;">Criterion</th>
                ${displayLevels.map(level => `<th style="width: ${85 / displayLevels.length}%;">${level.name} (${level.level})</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${rubricData.criteria.map((criterion, index) => `
                <tr>
                    <td class="criterion-header">
                        <strong>${criterion.name || `Criterion ${index + 1}`}</strong>
                        <div style="font-size: 0.8em; color: #64748b; margin-top: 5px;">
                            ${criterion.weight || 0} points
                        </div>
                        ${criterion.description ? `<div style="font-size: 0.85em; margin-top: 8px; color: #475569;">${criterion.description}</div>` : ''}
                    </td>
                    ${displayLevels.map(level => {
            const levelData = criterion.levels[level.level] || {};
            const points = calculatePointRange(criterion, level.level);
            const levelClass = `level-${level.level.toLowerCase()}`;

            return `
                            <td class="${levelClass}">
                                <div class="points" style="margin-bottom: 8px; font-size: 1.1em;">
                                    ${points} pts
                                </div>
                                <div style="font-size: 0.9em; line-height: 1.4;">
                                    ${levelData.description || `No description provided for ${level.name} level.`}
                                </div>
                            </td>
                        `;
        }).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p><strong>Assessment Rubric</strong></p>
        <p>Generated on ${new Date().toLocaleDateString('en-CA')} at ${new Date().toLocaleTimeString('en-CA')}</p>
        ${hasSchoolLogo() ? '<p>Generated with institutional branding</p>' : ''}
    </div>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rubric_${(rubricData.assignmentInfo.title || 'assessment').replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.html`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
                {/* ENHANCED: Header with better organized button layout and class list status */}
                <div className="bg-blue-900 text-white p-6 rounded-t-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">Professional Rubric Builder</h1>
                            <p className="text-white">Create comprehensive assessment rubrics with detailed criteria and feedback</p>
                        </div>
                    </div>

                    {/* ENHANCED: Organized button layout with class list status indicators */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Primary Actions */}
                        <div>
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-2">
                                Primary Actions
                            </h3>
                            <div className="flex flex-col gap-2">
                                {/* ENHANCED: "Use for Grading" button with status indicator */}
                                <div className="relative">
                                    <button
                                        onClick={transferToGrading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 w-full"
                                        title={classList && classList.students?.length
                                            ? `Start batch grading with ${classList.students.length} students`
                                            : "Transfer rubric to grading tool (individual grading)"
                                        }
                                    >
                                        <ArrowRight size={16} />
                                        Use for Grading
                                        {classList && classList.students?.length > 0 && (
                                            <span className="ml-auto bg-green-800 text-xs px-2 py-1 rounded-full">
                                                {classList.students.length} students
                                            </span>
                                        )}
                                    </button>

                                    {/* Status indicator */}
                                    <div className="mt-1 text-xs text-white">
                                        {classList && classList.students?.length > 0
                                            ? `✅ Class list loaded (${classList.students.length} students) - Will start batch grading`
                                            : "⚠️ No class list - Individual grading mode"
                                        }
                                    </div>
                                </div>

                                <button
                                    onClick={exportForGrading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium shadow-md transition-all duration-200"
                                    title="Export final rubric for grading template"
                                >
                                    <Download size={14} />
                                    Export JSON
                                </button>
                            </div>
                        </div>

                        {/* File Operations */}
                        <div>
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-2">
                                File Operations
                            </h3>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => importInputRef.current?.click()}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded flex items-center gap-1 text-sm font-medium shadow-md transition-all duration-200"
                                    title="Import existing rubric JSON file"
                                >
                                    <Upload size={14} />
                                    Import
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={saveRubric}
                                        className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded flex items-center gap-1 text-sm font-medium shadow-md transition-all duration-200 flex-1"
                                        title="Save work in progress as JSON file"
                                    >
                                        <Save size={14} />
                                        Save Draft
                                    </button>
                                    <button
                                        onClick={exportToHTML}
                                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded flex items-center gap-1 text-sm font-medium shadow-md transition-all duration-200 flex-1"
                                        title="Export HTML version for distribution"
                                    >
                                        <FileText size={14} />
                                        Export HTML
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Utility Actions */}
                        <div>
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-2">
                                Utility Actions
                            </h3>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={resetRubric}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded flex items-center gap-1 text-sm font-medium shadow-md transition-all duration-200"
                                    title="Reset to blank rubric"
                                >
                                    <RotateCcw size={14} />
                                    Reset
                                </button>
                                <button
                                    onClick={() => setReversedOrder(!reversedOrder)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded flex items-center gap-1 text-sm font-medium shadow-md transition-all duration-200"
                                    title="Switch between ascending and descending level order"
                                >
                                    <RotateCcw size={14} />
                                    {reversedOrder ? 'High→Low' : 'Low→High'}
                                </button>
                                <button
                                    onClick={() => resetTextareaSizes()}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded flex items-center gap-1 text-sm font-medium shadow-md transition-all duration-200"
                                    title="Reset all text boxes to original size"
                                >
                                    <Minimize2 size={14} />
                                    Reset Sizes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Auto-save Indicator */}
                    {sharedRubric && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                            <div className="flex items-center gap-2 text-green-800">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">Auto-saved - Ready for grading tool</span>
                                {classList && classList.students?.length > 0 && (
                                    <span className="ml-auto text-xs bg-green-100 px-2 py-1 rounded">
                                        Class list ready: {classList.students.length} students
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ENHANCED: Add class list status notification */}
                    {!classList || !classList.students?.length ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 text-yellow-800">
                                <AlertTriangle size={20} />
                                <span className="font-medium">No Class List Loaded</span>
                            </div>
                            <p className="mt-1 text-yellow-700">
                                For batch grading, load a class list first.{' '}
                                <button
                                    onClick={() => setActiveTab('class-manager')}
                                    className="underline hover:no-underline font-medium"
                                >
                                    Go to Class Manager
                                </button>
                            </p>
                        </div>
                    ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 text-blue-800">
                                <CheckCircle size={20} />
                                <span className="font-medium">Class List Ready</span>
                            </div>
                            <p className="mt-1 text-blue-700">
                                {classList.students.length} students loaded.
                                <strong> "Use for Grading"</strong> will start batch grading automatically.
                            </p>
                        </div>
                    )}

                    {/* Button Guide */}
                    <div className="bg-gray-50 border border-gray-300 rounded-lg mb-6">
                        <button
                            onClick={() => setShowGuide(!showGuide)}
                            className="w-full p-3 text-left font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                        >
                            📖 Quick Start Guide & Button Functions
                            <span className={`transform transition-transform ${showGuide ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        {showGuide && (
                            <div className="p-4 border-t border-gray-300 text-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">🔧 Building Your Rubric</h4>
                                        <ul className="space-y-1 text-gray-700">
                                            <li><strong>Reset:</strong> Clear all data and start fresh</li>
                                            <li><strong>Reset Sizes:</strong> Return all text boxes to original size</li>
                                            <li><strong>Import:</strong> Load AI-generated or existing rubric files</li>
                                            <li><strong>Use for Grading:</strong> Send directly to grading tool</li>
                                            <li><strong>Save Draft:</strong> Download work-in-progress (JSON)</li>
                                            <li><strong>Export JSON:</strong> Final rubric for grading template</li>
                                            <li><strong>Export HTML:</strong> Student-friendly display version</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">📝 Step-by-Step Process</h4>
                                        <ol className="space-y-1 text-gray-700">
                                            <li>1. Fill in assignment details and requirements</li>
                                            <li>2. Add criteria using "Add Criterion" button</li>
                                            <li>3. Define level descriptions for each criterion</li>
                                            <li>4. Add feedback library items (optional but recommended)</li>
                                            <li>5. Use "Use for Grading" to switch to grading tool</li>
                                            <li>6. Export HTML for student distribution</li>
                                        </ol>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-blue-800 text-sm">
                                        <strong>💡 Tip:</strong> Work is auto-saved every second. Switch between tabs freely - your progress is preserved.
                                    </p>
                                    <p className="text-blue-800 text-sm mt-2">
                                        <strong>📝 Rich Text Editing:</strong> Type directly in any description box for quick edits, or click the blue expand button (⤢) to open the full editor. Paste formatting from Word or the web is preserved.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rest of the component content (Assignment Information, Point System, Rubric Table, etc.) */}
                    {/* ... keeping all the existing form content exactly as it was ... */}
                    {/* This includes: Assignment Information, Point System Selection, Rubric Table, Feedback Library Management, Overall Score Preview */}

                    {/* Assignment Information */}
                    <div className="assignment-info bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4">Assignment Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title *</label>
                                <input
                                    type="text"
                                    value={rubricData.assignmentInfo.title}
                                    onChange={(e) => updateAssignmentInfo('title', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="e.g., Digital Portfolio Project - Final Showcase"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Weight (% of Final Grade)
                                </label>
                                <input
                                    type="number"
                                    value={rubricData.assignmentInfo.weight}
                                    onChange={(e) =>
                                        updateAssignmentInfo('weight', parseInt(e.target.value, 10) || 0)
                                    }
                                    className="w-full p-3 border rounded-lg"
                                    min={0}
                                    max={100}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={renderFormattedContent(rubricData.assignmentInfo.description)}
                                        onChange={(e) =>
                                            updateAssignmentInfo(
                                                'description',
                                                convertFormattedTextToHtml(e.target.value)
                                            )
                                        }
                                        className="w-full p-3 border rounded-lg resize-y hover:border-blue-400 transition-all duration-200 pr-12"
                                        rows={3}
                                        placeholder="Detailed description of assignment requirements and expectations..."
                                        title="Type here for quick editing, or click the expand button for rich text editor"
                                        style={{ minHeight: '80px', maxHeight: '200px', resize: 'both' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            openInlineEditor(
                                                rubricData.assignmentInfo.description,
                                                'Assignment Description',
                                                (newContent) => updateAssignmentInfo('description', newContent),
                                                null,
                                                null,
                                                'assignment'
                                            );
                                        }}
                                        className="absolute top-1 right-1 z-10 bg-blue-500 text-white rounded p-1 hover:bg-blue-700 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                                        title="Open rich text editor"
                                    >
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Passing Threshold (%)
                                </label>
                                <input
                                    type="number"
                                    value={rubricData.assignmentInfo.passingThreshold}
                                    onChange={(e) =>
                                        updateAssignmentInfo('passingThreshold', parseInt(e.target.value, 10) || 0)
                                    }
                                    className="w-full p-3 border rounded-lg"
                                    min={0}
                                    max={100}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Total Points (Auto-calculated)
                                </label>
                                <input
                                    type="number"
                                    value={calculateTotalPoints()}
                                    disabled
                                    className="w-full p-3 border rounded-lg bg-gray-100 font-semibold"
                                />
                            </div>
                        </div>

                        {/* Inline Rich Text Editor for Assignment */}
                        {inlineEditor.show && inlineEditor.type === 'assignment' && (
                            <div className="mt-6 border-2 border-blue-300 rounded-lg bg-white shadow-lg">
                                {/* Editor Header */}
                                <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <Maximize2 size={20} className="text-blue-600" />
                                        Rich Text Editor: {inlineEditor.field}
                                    </h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => closeInlineEditor(true)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                        >
                                            <Save size={16} />
                                            Save & Close
                                        </button>
                                        <button
                                            onClick={() => closeInlineEditor(false)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                        >
                                            <X size={16} />
                                            Cancel
                                        </button>
                                    </div>
                                </div>

                                {/* Editor Content */}
                                <div className="p-4">
                                    <SimpleRichTextEditor
                                        ref={editorRef}
                                        value={inlineEditor.content}
                                        onChange={(html) => {
                                            richTextContentRef.current = html;
                                        }}
                                        placeholder="Enter detailed assignment description..."
                                    />
                                </div>

                                {/* Footer */}
                                <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-lg">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Rich Text Editor Active
                                            </span>
                                            <span>Paste rich text from other sources</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            <strong>Features:</strong> Headers, Bold, Italic, Lists, Links, Colors
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Point System Selection */}
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Point Calculation System</h4>
                        <div className="flex gap-6">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pointSystem"
                                    value="multiplier"
                                    checked={pointingSystem === 'multiplier'}
                                    onChange={(e) => setPointingSystem(e.target.value)}
                                    className="mr-2"
                                />
                                <span className="text-sm">
                                    <strong>Automatic (Recommended):</strong> Points calculated using level multipliers
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pointSystem"
                                    value="custom"
                                    checked={pointingSystem === 'custom'}
                                    onChange={(e) => setPointingSystem(e.target.value)}
                                    className="mr-2"
                                />
                                <span className="text-sm">
                                    <strong>Custom:</strong> Manually set point ranges for each level
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* JSON Paste Panel */}
                    <JSONPastePanel
                        onImport={importFromJSON}
                        isOpen={showJSONPaste}
                        onToggle={() => setShowJSONPaste(!showJSONPaste)}
                    />

                    {/* Achievement Level Configuration */}
                    <AchievementLevelControl
                        rubricData={rubricData}
                        setRubricData={setRubricData}
                    />

                    {/* Rubric Table */}
                    <div className="bg-white border rounded-lg overflow-hidden mb-6">
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Assessment Criteria Matrix</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setReversedOrder(!reversedOrder)}
                                    className="bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-2 rounded flex items-center gap-1 text-sm"
                                    title="Switch between ascending and descending level order"
                                >
                                    <RotateCcw size={14} />
                                    {reversedOrder ? 'High→Low' : 'Low→High'}
                                </button>
                                <button
                                    onClick={resetTextareaSizes}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded flex items-center gap-1 text-sm"
                                    title="Reset all textarea sizes to original dimensions"
                                >
                                    <Minimize2 size={14} />
                                    Reset Sizes
                                </button>
                                <button
                                    onClick={addCriterion}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add Criterion
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border p-3 text-left font-semibold" style={{ width: '200px' }}>
                                            Criterion ({rubricData.criteria.length})
                                        </th>
                                        {getDisplayLevels().map((level) => (
                                            <th
                                                key={level.level}
                                                className="border p-3 text-center font-semibold"
                                                style={{
                                                    backgroundColor: level.color + '20',
                                                    color: level.color,
                                                    minWidth: '150px',
                                                    border: `2px solid ${level.color}`
                                                }}
                                            >
                                                <div className="font-bold">{level.name}</div>
                                                <div className="text-xs font-normal mt-1 opacity-75">
                                                    {level.description}
                                                </div>
                                            </th>
                                        ))}
                                        <th className="border p-3 text-center font-semibold" style={{ width: '80px' }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rubricData.criteria.map((criterion, index) => (
                                        <React.Fragment key={criterion.id}>
                                            <tr>
                                                {/* Criterion Column */}
                                                <td className="border p-3 bg-gray-50">
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            value={criterion.name}
                                                            onChange={(e) => updateCriterion(criterion.id, 'name', e.target.value)}
                                                            className="w-full p-2 border rounded text-sm font-medium"
                                                            placeholder={`Criterion ${index + 1} name`}
                                                        />
                                                        <div className="relative">
                                                            <textarea
                                                                value={renderFormattedContent(criterion.description)}
                                                                onChange={(e) => updateCriterion(criterion.id, 'description', convertFormattedTextToHtml(e.target.value))}
                                                                className="w-full p-2 border rounded text-xs resize-y hover:border-blue-400 transition-all duration-200 pr-8"
                                                                rows="2"
                                                                placeholder="Brief description of what this criterion measures"
                                                                title="Type here for quick editing, or click the expand button for rich text editor"
                                                                style={{ minHeight: '48px', maxHeight: '200px', resize: 'both' }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    openInlineEditor(
                                                                        criterion.description,
                                                                        `Criterion Description - ${criterion.name || 'Criterion'}`,
                                                                        (newContent) => updateCriterion(criterion.id, 'description', newContent),
                                                                        criterion.id,
                                                                        null,
                                                                        'criterion'
                                                                    );
                                                                }}
                                                                className="absolute top-1 right-1 z-10 opacity-70 hover:opacity-100 transition-opacity bg-blue-500 text-white rounded p-1 hover:bg-blue-700 cursor-pointer"
                                                                title="Open rich text editor"
                                                            >
                                                                <Maximize2 size={12} />
                                                            </button>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <div className="flex-1">
                                                                <label className="text-xs text-gray-600">Max Points</label>
                                                                <input
                                                                    type="number"
                                                                    value={criterion.maxPoints}
                                                                    onChange={(e) => updateCriterion(criterion.id, 'maxPoints', parseInt(e.target.value) || 0)}
                                                                    className="w-full p-1 border rounded text-sm"
                                                                    min="0"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Level Columns */}
                                                {getDisplayLevels().map((level) => (
                                                    <td key={level.level} className="border p-3 align-top">
                                                        <div className="space-y-2">
                                                            <div className="text-center">
                                                                <div
                                                                    className="font-bold text-sm px-2 py-1 rounded"
                                                                    style={{
                                                                        color: level.color,
                                                                        backgroundColor: level.color + '20'
                                                                    }}
                                                                >
                                                                    {calculatePointRange(criterion, level.level)} pts
                                                                </div>
                                                            </div>
                                                            <div className="relative">
                                                                <textarea
                                                                    value={renderFormattedContent(criterion.levels[level.level]?.description || '')}
                                                                    onChange={(e) => updateCriterionLevel(criterion.id, level.level, 'description', convertFormattedTextToHtml(e.target.value))}
                                                                    className="w-full p-2 border rounded text-xs resize-y hover:border-blue-400 transition-all duration-200 pr-8"
                                                                    rows="4"
                                                                    placeholder={`Describe ${level.name.toLowerCase()} performance...`}
                                                                    title="Type here for quick editing, or click the expand button for rich text editor"
                                                                    style={{ minHeight: '80px', maxHeight: '300px', resize: 'both' }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        openInlineEditor(
                                                                            criterion.levels[level.level]?.description || '',
                                                                            `${level.name} Level - ${criterion.name || 'Criterion'}`,
                                                                            (newContent) => updateCriterionLevel(criterion.id, level.level, 'description', newContent),
                                                                            criterion.id,
                                                                            level.level,
                                                                            'level'
                                                                        );
                                                                    }}
                                                                    className="absolute top-1 right-1 z-10 opacity-70 hover:opacity-100 transition-opacity bg-blue-500 text-white rounded p-1 hover:bg-blue-700 cursor-pointer"
                                                                    title="Open rich text editor"
                                                                >
                                                                    <Maximize2 size={12} />
                                                                </button>
                                                            </div>
                                                            {pointingSystem === 'custom' && (
                                                                <input
                                                                    type="text"
                                                                    value={criterion.levels[level.level]?.pointRange || ''}
                                                                    onChange={(e) => updateCriterionLevel(criterion.id, level.level, 'pointRange', e.target.value)}
                                                                    className="w-full p-1 border rounded text-xs text-center"
                                                                    placeholder="e.g., 18-20"
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                ))}

                                                {/* Actions Column */}
                                                <td className="border p-3 text-center">
                                                    <button
                                                        onClick={() => removeCriterion(criterion.id)}
                                                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                                        disabled={rubricData.criteria.length === 1}
                                                        title={rubricData.criteria.length === 1 ? "Cannot remove the last criterion" : "Remove this criterion"}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Inline Rich Text Editor for Criterion or Level */}
                                            {inlineEditor.show &&
                                                inlineEditor.criterionId === criterion.id &&
                                                (inlineEditor.type === 'criterion' || inlineEditor.type === 'level') && (
                                                    <tr>
                                                        <td colSpan={getDisplayLevels().length + 2} className="border-0 p-0">
                                                            <div className="border-2 border-blue-300 rounded-lg bg-white shadow-lg m-2">
                                                                {/* Editor Header */}
                                                                <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                                                                    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                                        <Maximize2 size={20} className="text-blue-600" />
                                                                        Rich Text Editor: {inlineEditor.field}
                                                                    </h4>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => closeInlineEditor(true)}
                                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                                                        >
                                                                            <Save size={16} />
                                                                            Save & Close
                                                                        </button>
                                                                        <button
                                                                            onClick={() => closeInlineEditor(false)}
                                                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                                                        >
                                                                            <X size={16} />
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Editor Content */}
                                                                <div className="p-4">
                                                                    <SimpleRichTextEditor
                                                                        ref={editorRef}
                                                                        value={inlineEditor.content}
                                                                        onChange={(html) => {
                                                                            richTextContentRef.current = html;
                                                                        }}
                                                                        placeholder={`Enter ${inlineEditor.type === 'criterion' ? 'criterion description' : 'level description'}...`}
                                                                    />
                                                                </div>

                                                                {/* Footer */}
                                                                <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-lg">
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                            <span className="flex items-center gap-2">
                                                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                                Rich Text Editor Active
                                                                            </span>
                                                                            <span>Paste rich text from other sources</span>
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            <strong>Features:</strong> Headers, Bold, Italic, Lists, Links, Colors
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Feedback Library Management */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Feedback Libraries</h3>
                        <p className="text-sm text-gray-600 mb-4">Build reusable feedback comments for quick grading. These will be available as dropdowns during assessment.</p>

                        <div className="space-y-4">
                            {rubricData.criteria.map((criterion) => (
                                <div key={criterion.id} className="bg-gray-50 border rounded-lg">
                                    <button
                                        onClick={() => toggleFeedbackExpansion(criterion.id)}
                                        className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <div>
                                            <h4 className="font-semibold text-gray-800">
                                                {criterion.name || `Criterion ${rubricData.criteria.indexOf(criterion) + 1}`} - Feedback Library
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {criterion.feedbackLibrary.strengths.length +
                                                    criterion.feedbackLibrary.improvements.length +
                                                    criterion.feedbackLibrary.general.length} feedback items stored
                                            </p>
                                        </div>
                                        {expandedFeedback[criterion.id] ? (
                                            <ChevronUp size={20} className="text-gray-500" />
                                        ) : (
                                            <ChevronDown size={20} className="text-gray-500" />
                                        )}
                                    </button>

                                    {expandedFeedback[criterion.id] && (
                                        <div className="p-4 border-t border-gray-200 bg-white">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                {['strengths', 'improvements', 'general'].map((category) => (
                                                    <div key={category} className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-sm font-medium text-gray-700 capitalize">
                                                                {category === 'strengths' ? '👍 Strengths' :
                                                                    category === 'improvements' ? '🔧 Improvements' :
                                                                        '💬 General'} Comments
                                                            </label>
                                                            <button
                                                                onClick={() => {
                                                                    const newComment = prompt(`Add ${category} comment:`);
                                                                    if (newComment && newComment.trim()) {
                                                                        addFeedbackItem(criterion.id, category, newComment.trim());
                                                                    }
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 px-2 py-1 rounded"
                                                            >
                                                                + Add
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                                            {criterion.feedbackLibrary[category].map((item, index) => (
                                                                <div key={index} className="flex items-start gap-2 text-xs">
                                                                    <span
                                                                        className="flex-1 p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100 transition-colors"
                                                                        onClick={() => {
                                                                            openInlineEditor(
                                                                                item,
                                                                                `${category} Comment`,
                                                                                (newContent) => {
                                                                                    const updatedFeedback = [...criterion.feedbackLibrary[category]];
                                                                                    // Store formatted HTML so formatting persists in exports
                                                                                    updatedFeedback[index] = newContent;
                                                                                    setRubricData(prev => ({
                                                                                        ...prev,
                                                                                        criteria: prev.criteria.map(c =>
                                                                                            c.id === criterion.id
                                                                                                ? {
                                                                                                    ...c,
                                                                                                    feedbackLibrary: {
                                                                                                        ...c.feedbackLibrary,
                                                                                                        [category]: updatedFeedback
                                                                                                    }
                                                                                                }
                                                                                                : c
                                                                                        )
                                                                                    }));
                                                                                },
                                                                                criterion.id,
                                                                                null,
                                                                                'feedback'
                                                                            );
                                                                        }}
                                                                        title="Click to edit"
                                                                        style={{ resize: 'both', minHeight: '40px' }}
                                                                    >
                                                                        {renderFormattedContent(item)}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => removeFeedbackItem(criterion.id, category, index)}
                                                                        className="text-red-600 hover:text-red-800 mt-1 p-1 hover:bg-red-50 rounded"
                                                                        title="Remove this comment"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {criterion.feedbackLibrary[category].length === 0 && (
                                                                <div className="text-xs text-gray-500 italic text-center py-4 border border-dashed border-gray-300 rounded">
                                                                    No {category} comments yet - click "Add" to create some
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Inline Rich Text Editor for Feedback */}
                        {inlineEditor.show && inlineEditor.type === 'feedback' && (
                            <div className="mt-6 border-2 border-blue-300 rounded-lg bg-white shadow-lg">
                                {/* Editor Header */}
                                <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <Maximize2 size={20} className="text-blue-600" />
                                        Rich Text Editor: {inlineEditor.field}
                                    </h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => closeInlineEditor(true)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                        >
                                            <Save size={16} />
                                            Save & Close
                                        </button>
                                        <button
                                            onClick={() => closeInlineEditor(false)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                        >
                                            <X size={16} />
                                            Cancel
                                        </button>
                                    </div>
                                </div>

                                {/* Editor Content */}
                                <div className="p-4">
                                    <SimpleRichTextEditor
                                        ref={editorRef}
                                        value={inlineEditor.content}
                                        onChange={(html) => {
                                            richTextContentRef.current = html;
                                        }}
                                        placeholder="Enter feedback comment..."
                                    />
                                </div>

                                {/* Footer */}
                                <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-lg">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Rich Text Editor Active
                                            </span>
                                            <span>Paste rich text from other sources</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            <strong>Features:</strong> Headers, Bold, Italic, Lists, Links, Colors
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Overall Score Preview */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Achievement Level Preview</h3>
                        <p className="text-gray-600 mb-4">
                            Shows how total rubric scores map to achievement levels.
                            Currently using {rubricData.rubricLevels.length} levels.
                            Each submission receives a level based on its total points.
                        </p>

                        <div className={`grid gap-3 ${rubricData.rubricLevels.length <= 4
                                ? `grid-cols-${rubricData.rubricLevels.length}`
                                : rubricData.rubricLevels.length <= 6
                                    ? 'grid-cols-3 md:grid-cols-6'
                                    : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-7'
                            }`}>
                            {getDisplayLevels().map((level) => {
                                const totalPoints = calculateTotalPoints();
                                const pointsForLevel = Math.round(totalPoints * level.multiplier);
                                return (
                                    <div
                                        key={level.level}
                                        className="text-center p-3 rounded-lg border-2 transition-all hover:transform hover:scale-105"
                                        style={{
                                            borderColor: level.color,
                                            backgroundColor: level.color + '15'
                                        }}
                                    >
                                        <div className="font-semibold text-sm" style={{ color: level.color }}>
                                            {level.name}
                                        </div>
                                        <div className="text-lg font-bold mt-1" style={{ color: level.color }}>
                                            {pointsForLevel}+
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {totalPoints > 0 ? `${Math.round((pointsForLevel / totalPoints) * 100)}%+` : '-%'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {calculateTotalPoints() === 0 && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-center">
                                <p className="text-yellow-800 text-sm">
                                    Add criteria with point values to see the achievement level breakdown
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hidden file inputs */}
                <input
                    ref={importInputRef}
                    type="file"
                    accept=".json"
                    onChange={importRubric}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default RubricCreator;