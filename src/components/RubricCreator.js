import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Upload, Download, Save, FileText, RotateCcw, ChevronDown, ChevronUp, Maximize2, ArrowRight, Minimize2, Edit3 } from 'lucide-react';
import { useAssessment } from './SharedContext';

/**
 * ===================================================================================
 * MARKDOWN PASTE UTILITY
 * ===================================================================================
 * This function converts plain text (with markdown-like lists) into clean HTML.
 * It's designed to be robust and handle various list formats reliably.
 *
 * @param {string} text - The plain text from the clipboard.
 * @returns {string} - A clean HTML string.
 */
const pasteAsMarkdown = (text) => {
    if (!text) return '';

    const lines = text.split('\n');
    let html = '';
    let inList = false;
    let listType = null; // 'ol' or 'ul'

    const closeList = () => {
        if (inList) {
            html += `</${listType}>`;
            inList = false;
            listType = null;
        }
    };

    lines.forEach(line => {
        const trimmedLine = line.trim();
        const isNumberedList = /^\d+\.\s/.test(trimmedLine);
        const isBulletedList = /^(\*|-)\s/.test(trimmedLine);

        if (isNumberedList || isBulletedList) {
            const currentListType = isNumberedList ? 'ol' : 'ul';
            if (!inList || currentListType !== listType) {
                closeList();
                html += `<${currentListType}>`;
                inList = true;
                listType = currentListType;
            }
            // Remove the markdown prefix (e.g., "1. " or "* ")
            html += `<li>${trimmedLine.replace(/^(\d+\.|\*|-)\s/, '')}</li>`;
        } else {
            closeList();
            if (trimmedLine) {
                html += `<p>${trimmedLine}</p>`;
            } else {
                // If the line is empty, it acts as a paragraph break.
                // We don't add anything here, letting the paragraph tags handle spacing.
            }
        }
    });

    closeList(); // Ensure any open list is closed at the end.
    return html;
};


const RubricCreator = () => {
    // Get shared context functions and state
    const {
        sharedRubric,
        setSharedRubric,
        transferRubricToGradingWithDetails,
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
        type: null // 'assignment', 'criterion', or 'level'
    });
    const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

    // Use refs instead of state for rich text content to prevent cursor jumping
    const richTextContentRef = useRef('');
    const editorRef = useRef(null);

    // Refs for file inputs
    const importInputRef = useRef(null);

    // Helper functions for HTML content handling
    const containsHtml = (content) => {
        return content && /<[^>]*>/.test(content);
    };

    const stripHtml = (html) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    const sanitizeHtml = (html) => {
        // Create a temporary div to clean and validate HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.innerHTML;
    };

    // Cursor position management functions
    const saveCursorPosition = () => {
        const editor = editorRef.current;
        if (!editor) return null;

        const selection = window.getSelection();
        if (selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        return {
            startContainer: range.startContainer,
            startOffset: range.startOffset,
            endContainer: range.endContainer,
            endOffset: range.endOffset
        };
    };

    const restoreCursorPosition = (savedPosition) => {
        if (!savedPosition || !editorRef.current) return;

        try {
            const selection = window.getSelection();
            const range = document.createRange();

            range.setStart(savedPosition.startContainer, savedPosition.startOffset);
            range.setEnd(savedPosition.endContainer, savedPosition.endOffset);

            selection.removeAllRanges();
            selection.addRange(range);
        } catch (error) {
            // If cursor restoration fails, place cursor at end
            const editor = editorRef.current;
            const range = document.createRange();
            const selection = window.getSelection();

            range.selectNodeContents(editor);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

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

    // Open inline editor for text editing - FIXED to preserve HTML
    const openInlineEditor = (content, field, onSave, criterionId = null, level = null, type = 'assignment') => {
        // Initialize the ref with current content (preserve HTML)
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

        // Focus the editor after it's rendered
        setTimeout(() => {
            const editor = editorRef.current;
            if (editor) {
                // FIXED: Preserve HTML formatting when opening editor
                editor.innerHTML = content || '';
                editor.focus();
                // Place cursor at end
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(editor);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }, 100);
    };

    // Enhanced rich text editor functions
    const handleRichTextCommand = (command, value = null) => {
        const editor = editorRef.current;
        if (editor) {
            editor.focus();

            // Save cursor position before command
            const cursorPos = saveCursorPosition();

            document.execCommand(command, false, value);

            // Update our ref content with light cleaning to maintain consistency
            const currentContent = editor.innerHTML;
            // Only apply light cleaning for commands, not the heavy paste cleaning
            const lightCleaned = currentContent
                .replace(/(<br\s*\/?>\s*){4,}/gi, '<br><br><br>') // Limit consecutive line breaks
                .replace(/&nbsp;{3,}/gi, '&nbsp;&nbsp;'); // Limit consecutive spaces

            if (lightCleaned !== currentContent) {
                editor.innerHTML = lightCleaned;
            }

            richTextContentRef.current = editor.innerHTML;

            // Restore cursor position if needed
            setTimeout(() => {
                if (cursorPos && editor.contains(cursorPos.startContainer)) {
                    restoreCursorPosition(cursorPos);
                }
            }, 0);
        }
    };

    // Handle rich text changes without state updates
    const handleRichTextChange = (e) => {
        const editor = editorRef.current;
        if (editor) {
            // Update our ref with current content
            richTextContentRef.current = editor.innerHTML;
        }
    };

    // Corrected Code
    const handlePaste = (e) => {
        e.preventDefault();
        const clipboardData = e.clipboardData || window.clipboardData;
        let pasteData = '';

        // Prioritize HTML content if available
        if (clipboardData.types.includes('text/html')) {
            const dirtyHtml = clipboardData.getData('text/html');
            // Use the existing sanitize function to clean the HTML
            pasteData = sanitizeHtml(dirtyHtml);
        } else {
            // Fallback to the plain text markdown converter
            const plainText = clipboardData.getData('text/plain');
            pasteData = pasteAsMarkdown(plainText);
        }

        // Insert the cleaned HTML into the editor
        document.execCommand('insertHTML', false, pasteData);
    };


    // FIXED: Handle key events properly
    const handleKeyDown = (e) => {
        const editor = editorRef.current;
        if (!editor) return;

        if (e.key === 'Enter' && !e.shiftKey) {
            // Let the browser handle normal paragraph creation by default
            // Only clean afterwards if needed
            setTimeout(() => {
                const currentContent = editor.innerHTML;
                // Only clean if there are excessive breaks
                const cleaned = currentContent.replace(/(<br\s*\/?>\s*){4,}/gi, '<br><br><br>');
                if (cleaned !== currentContent) {
                    editor.innerHTML = cleaned;
                }
                richTextContentRef.current = editor.innerHTML;
            }, 0);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
            richTextContentRef.current = editor.innerHTML;
        }

        // Handle common keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    handleRichTextCommand('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    handleRichTextCommand('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    handleRichTextCommand('underline');
                    break;
            }
        }
    };

    // FIXED: Close inline editor and save HTML content instead of plain text
    const closeInlineEditor = (save = false) => {
        if (save && inlineEditor.onSave) {
            inlineEditor.onSave(richTextContentRef.current);
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

        setRubricData(prev => ({
            ...prev,
            criteria: prev.criteria.map(criterion =>
                criterion.id === criterionId
                    ? {
                        ...criterion,
                        feedbackLibrary: {
                            ...criterion.feedbackLibrary,
                            [category]: [...criterion.feedbackLibrary[category], item.trim()]
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

    // Transfer to grading tool directly
    const transferToGrading = () => {
        const exportData = prepareRubricForExport();
        transferRubricToGradingWithDetails(exportData);
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
    const exportToHTML = () => {
        const displayLevels = getDisplayLevels();
        const totalPoints = calculateTotalPoints();

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${rubricData.assignmentInfo.title || 'Assessment Rubric'} - Rubric</title>
    <style>
        body { font-family: 'Arial', sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #1e40af; }
        .header h1 { color: #1e40af; margin-bottom: 10px; }
        .assignment-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
        .rubric-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 0.85rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .rubric-table th, .rubric-table td { border: 1px solid #ddd; padding: 12px; text-align: left; vertical-align: top; }
        .rubric-table th { background: #1e40af; color: white; text-align: center; font-weight: 600; }
        .criterion-name { font-weight: bold; background: #f8fafc; padding: 15px; }
        .point-range { text-align: center; font-weight: bold; color: #1e40af; font-size: 1.1em; }
        .level-description { font-size: 0.9rem; line-height: 1.4; }
        .overall-score { background: #eff6ff; padding: 25px; border-radius: 8px; margin-top: 30px; border: 2px solid #bfdbfe; }
        .footer { margin-top: 40px; text-align: center; font-size: 0.9rem; color: #666; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        .level-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-top: 20px; }
        .level-card { text-align: center; padding: 15px; border-radius: 8px; border: 2px solid; }
        @media print { body { margin: 0; padding: 15px; } .level-grid { break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${rubricData.assignmentInfo.title || 'Assessment Rubric'}</h1>
        <p style="color: #64748b; font-size: 1.1em;">${stripHtml(rubricData.assignmentInfo.description) || 'No description provided'}</p>
    </div>
    
    <div class="assignment-info">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <p><strong>Assignment Weight:</strong> ${rubricData.assignmentInfo.weight}% of Final Grade</p>
            <p><strong>Passing Threshold:</strong> ${rubricData.assignmentInfo.passingThreshold}%</p>
            <p><strong>Total Points:</strong> ${totalPoints}</p>
            <p><strong>Number of Criteria:</strong> ${rubricData.criteria.length}</p>
        </div>
    </div>
    
    <table class="rubric-table">
        <thead>
            <tr>
                <th style="width: 20%">Criterion</th>
                ${displayLevels.map(level => `<th style="width: ${80 / displayLevels.length}%; background-color: ${level.color};">${level.name}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${rubricData.criteria.map(criterion => `
                <tr>
                    <td class="criterion-name">
                        <strong style="color: #1e40af; font-size: 1.1em;">${criterion.name || 'Unnamed Criterion'}</strong>
                        <div style="font-weight: normal; color: #475569; margin-top: 8px; font-style: italic;">
                            ${stripHtml(criterion.description) || 'No description provided'}
                        </div>
                        <div style="background: #1e40af; color: white; padding: 5px 10px; border-radius: 4px; margin-top: 10px; text-align: center; font-weight: bold;">
                            ${criterion.maxPoints} points
                        </div>
                    </td>
                    ${displayLevels.map(level => `
                        <td style="background-color: ${level.color}08;">
                            <div class="point-range" style="color: ${level.color}; margin-bottom: 10px;">
                                ${calculatePointRange(criterion, level.level)} pts
                            </div>
                            <div class="level-description">
                                ${stripHtml(criterion.levels[level.level]?.description) || '<em>Not defined</em>'}
                            </div>
                        </td>
                    `).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="overall-score">
        <h3 style="color: #1e40af; margin-bottom: 15px;">Overall Achievement Levels</h3>
        <p style="color: #475569; margin-bottom: 20px;">Each submission receives an overall achievement level based on total rubric score.</p>
        <div class="level-grid">
            ${displayLevels.map(level => `
                <div class="level-card" style="border-color: ${level.color}; background-color: ${level.color}15;">
                    <div style="font-weight: bold; color: ${level.color}; margin-bottom: 5px;">${level.name}</div>
                    <div style="font-size: 1.2em; font-weight: bold; margin: 8px 0; color: ${level.color};">
                        ${Math.round(totalPoints * level.multiplier)}+ pts
                    </div>
                    <div style="font-size: 0.8em; color: #64748b;">${(level.multiplier * 100).toFixed(0)}% or higher</div>
                </div>
            `).join('')}
        </div>
    </div>
    
    <div class="footer">
        <p><strong>Rubric Generated:</strong> ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
        <p>Total Possible Points: <strong>${totalPoints}</strong> | Criteria: <strong>${rubricData.criteria.length}</strong> | Levels: <strong>${rubricData.rubricLevels.length}</strong></p>
    </div>
</body>
</html>`;

        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(htmlBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rubric_${rubricData.assignmentInfo.title.replace(/\s+/g, '_') || 'display'}_${new Date().toISOString().split('T')[0]}.html`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // FIXED: Content display component that handles both HTML and plain text
    const ContentDisplay = ({ content, onEdit, placeholder, isTextarea = false, className = "" }) => {
        const hasHtml = containsHtml(content);

        if (hasHtml && !isTextarea) {
            return (
                <div className={`relative group ${className}`}>
                    <div
                        className="p-2 border rounded text-xs bg-white min-h-[80px] max-h-[300px] overflow-y-auto"
                        style={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            maxWidth: '100%'
                        }}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                    <button
                        type="button"
                        onClick={onEdit}
                        className="absolute top-1 right-1 opacity-70 group-hover:opacity-100 transition-opacity bg-blue-500 text-white rounded p-1 hover:bg-blue-600 cursor-pointer"
                        title="Open rich text editor"
                    >
                        <Edit3 size={12} />
                    </button>
                </div>
            );
        }

        if (isTextarea) {
            return (
                <div className="relative">
                    <textarea
                        value={content}
                        onChange={(e) => onEdit(e.target.value)}
                        className={`w-full p-3 border rounded-lg resize-both hover:border-blue-400 transition-all duration-200 pr-12 ${className}`}
                        rows="3"
                        placeholder={placeholder}
                        title="Type here for quick editing, or click the expand button for rich text editor"
                        style={{
                            minHeight: '80px',
                            maxHeight: '200px',
                            resize: 'both',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => onEdit(null, true)} // Signal to open rich editor
                        className="absolute top-2 right-2 z-10 opacity-70 hover:opacity-100 transition-opacity bg-blue-500 text-white rounded p-1 hover:bg-blue-600 cursor-pointer"
                        title="Open rich text editor"
                    >
                        <Maximize2 size={14} />
                    </button>
                </div>
            );
        }

        return (
            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => onEdit(e.target.value)}
                    className={`w-full p-2 border rounded text-xs resize-both hover:border-blue-400 transition-all duration-200 pr-8 ${className}`}
                    rows="2"
                    placeholder={placeholder}
                    title="Type here for quick editing, or click the expand button for rich text editor"
                    style={{
                        minHeight: '48px',
                        maxHeight: '200px',
                        resize: 'both',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                />
                <button
                    type="button"
                    onClick={() => onEdit(null, true)} // Signal to open rich editor
                    className="absolute top-1 right-1 z-10 opacity-70 hover:opacity-100 transition-opacity bg-blue-500 text-white rounded p-1 hover:bg-blue-600 cursor-pointer"
                    title="Open rich text editor"
                >
                    <Maximize2 size={12} />
                </button>
            </div>
        );
    };

    // Enhanced Rich Text Toolbar Component
    const RichTextToolbar = () => (
        <div className="border-b bg-gray-50 p-3">
            {/* Main Toolbar */}
            <div className="flex flex-wrap gap-1 mb-2">
                {/* Headings */}
                <div className="flex border-r border-gray-300 pr-2 mr-2">
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                handleRichTextCommand('formatBlock', e.target.value);
                                e.target.value = '';
                            }
                        }}
                        className="p-1 text-xs border rounded"
                        title="Text Format"
                    >
                        <option value="">Format</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="p">Paragraph</option>
                        <option value="blockquote">Quote</option>
                        <option value="pre">Code Block</option>
                    </select>
                </div>

                {/* Font Size */}
                <div className="flex border-r border-gray-300 pr-2 mr-2">
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                handleRichTextCommand('fontSize', e.target.value);
                                e.target.value = '';
                            }
                        }}
                        className="p-1 text-xs border rounded"
                        title="Font Size"
                    >
                        <option value="">Size</option>
                        <option value="1">Small</option>
                        <option value="3">Normal</option>
                        <option value="4">Medium</option>
                        <option value="5">Large</option>
                        <option value="6">X-Large</option>
                    </select>
                </div>

                {/* Text Formatting */}
                <div className="flex border-r border-gray-300 pr-2 mr-2">
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('bold')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Bold (Ctrl+B)"
                    >
                        <span className="font-bold">B</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('italic')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Italic (Ctrl+I)"
                    >
                        <span className="italic">I</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('underline')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Underline (Ctrl+U)"
                    >
                        <span className="underline">U</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('strikeThrough')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Strikethrough"
                    >
                        <span className="line-through">S</span>
                    </button>
                </div>

                {/* Colors */}
                <div className="flex border-r border-gray-300 pr-2 mr-2">
                    <input
                        type="color"
                        onChange={(e) => handleRichTextCommand('foreColor', e.target.value)}
                        className="w-8 h-8 border rounded cursor-pointer"
                        title="Text Color"
                    />
                    <input
                        type="color"
                        onChange={(e) => handleRichTextCommand('hiliteColor', e.target.value)}
                        className="w-8 h-8 border rounded cursor-pointer ml-1"
                        title="Highlight Color"
                    />
                </div>

                {/* Lists */}
                <div className="flex border-r border-gray-300 pr-2 mr-2">
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('insertUnorderedList')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Bullet List"
                    >
                        • List
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('insertOrderedList')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Numbered List"
                    >
                        1. List
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('outdent')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Decrease Indent"
                    >
                        ⇤
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('indent')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Increase Indent"
                    >
                        ⇥
                    </button>
                </div>

                {/* Alignment */}
                <div className="flex border-r border-gray-300 pr-2 mr-2">
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('justifyLeft')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Align Left"
                    >
                        ⫷
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('justifyCenter')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Align Center"
                    >
                        ≡
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('justifyRight')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Align Right"
                    >
                        ⫸
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('justifyFull')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Justify"
                    >
                        ⫼
                    </button>
                </div>

                {/* Special */}
                <div className="flex border-r border-gray-300 pr-2 mr-2">
                    <button
                        type="button"
                        onClick={() => {
                            const url = prompt('Enter URL:');
                            if (url) handleRichTextCommand('createLink', url);
                        }}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Insert Link"
                    >
                        🔗
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('insertHorizontalRule')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Insert Line"
                    >
                        ─
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('superscript')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Superscript"
                    >
                        x²
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('subscript')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Subscript"
                    >
                        x₂
                    </button>
                </div>

                {/* Actions */}
                <div className="flex">
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('undo')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Undo"
                    >
                        ↶
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('redo')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Redo"
                    >
                        ↷
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('removeFormat')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Clear Formatting"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Quick Actions Row */}
            <div className="pt-2 border-t border-gray-200">
                <div className="flex flex-wrap gap-1 text-xs">
                    <span className="text-gray-600 mr-2">Quick Insert:</span>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('insertHTML', '<strong>Example:</strong> ')}
                        className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
                    >
                        Add "Example:"
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('insertHTML', '<em>Note:</em> ')}
                        className="px-2 py-1 bg-green-100 hover:bg-green-200 rounded transition-colors"
                    >
                        Add "Note:"
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('insertHTML', '<strong>Requirements:</strong><ul><li></li><li></li><li></li></ul>')}
                        className="px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded transition-colors"
                    >
                        Add Requirements List
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRichTextCommand('insertHTML', '<ol><li><strong>First step</strong> - <em>description</em></li><li><strong>Second step</strong> - <em>description</em></li><li><strong>Third step</strong> - <em>description</em></li></ol>')}
                        className="px-2 py-1 bg-indigo-100 hover:bg-indigo-200 rounded transition-colors"
                    >
                        Add Formatted Steps
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const editor = editorRef.current;
                            if (editor) {
                                editor.innerHTML = '';
                                richTextContentRef.current = '';
                            }
                        }}
                        className="px-2 py-1 bg-red-100 hover:bg-red-200 rounded transition-colors"
                    >
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* FIXED: Added CSS for improved list rendering and table width constraints */}
            <style>{`
                .rubric-table-container table {
                    table-layout: fixed;
                    width: 100%;
                }
                .rubric-table-container td {
                    max-width: 0;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    white-space: pre-wrap;
                    vertical-align: top;
                }
                .rubric-table-container .criterion-column {
                    width: 200px;
                }
                .rubric-table-container .level-column {
                    width: calc((100% - 200px - 80px) / 7);
                }
                .rubric-table-container .actions-column {
                    width: 80px;
                }
                
                /* FIXED: Enhanced list styling for better paste rendering */
                .rich-text-editor li {
                    margin: 0.2em 0;
                    line-height: 1.4;
                }
                
                /* Kill stray <p> margin that might slip through */
                .rich-text-editor li p {
                    margin: 0;
                }
                
                /* Better spacing for lists overall */
                .rich-text-editor ul, .rich-text-editor ol {
                    margin: 0.5em 0;
                    padding-left: 1.5em;
                    line-height: 1.5;
                }
            `}</style>

            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
                {/* Header */}
                <div className="bg-blue-900 text-white p-6 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Professional Rubric Builder</h1>
                            <p className="text-blue-200">Create comprehensive assessment rubrics with detailed criteria and feedback</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={resetRubric}
                                className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded flex items-center gap-1 text-sm"
                                title="Reset to blank rubric"
                            >
                                <RotateCcw size={14} />
                                Reset
                            </button>
                            <button
                                onClick={() => importInputRef.current?.click()}
                                className="bg-purple-700 hover:bg-purple-600 px-3 py-2 rounded flex items-center gap-1 text-sm"
                                title="Import existing rubric JSON file"
                            >
                                <Upload size={14} />
                                Import
                            </button>
                            <button
                                onClick={transferToGrading}
                                className="bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded flex items-center gap-1 text-sm"
                                title="Transfer rubric directly to grading tool"
                            >
                                <ArrowRight size={14} />
                                Use for Grading
                            </button>
                            <button
                                onClick={saveRubric}
                                className="bg-teal-700 hover:bg-teal-600 px-3 py-2 rounded flex items-center gap-1 text-sm"
                                title="Save work in progress as JSON file"
                            >
                                <Save size={14} />
                                Save Draft
                            </button>
                            <button
                                onClick={exportForGrading}
                                className="bg-green-700 hover:bg-green-600 px-3 py-2 rounded flex items-center gap-1 text-sm"
                                title="Export final rubric for grading template"
                            >
                                <Download size={14} />
                                Export JSON
                            </button>
                            <button
                                onClick={exportToHTML}
                                className="bg-orange-700 hover:bg-orange-600 px-3 py-2 rounded flex items-center gap-1 text-sm"
                                title="Export HTML version for distribution"
                            >
                                <FileText size={14} />
                                Export HTML
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Auto-save Indicator */}
                    {sharedRubric && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                            <div className="flex items-center gap-2 text-green-800">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium">Auto-saved - Ready for grading tool</span>
                            </div>
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
                                        <strong>📝 Rich Text Editing:</strong> Type directly in any description box for quick editing, OR click the blue expand button (⤢) for powerful inline rich text editor with full formatting toolbar including headings, colors, links, lists, and more!
                                    </p>
                                    <p className="text-blue-800 text-sm mt-2">
                                        <strong>🎯 FIXED:</strong> Copy/paste from Word and Google Docs now preserves lists, formatting, and proper spacing with NO vertical gaps!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (% of Final Grade)</label>
                                <input
                                    type="number"
                                    value={rubricData.assignmentInfo.weight}
                                    onChange={(e) => updateAssignmentInfo('weight', parseInt(e.target.value) || 0)}
                                    className="w-full p-3 border rounded-lg"
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <ContentDisplay
                                    content={rubricData.assignmentInfo.description}
                                    onEdit={(value, openRichEditor) => {
                                        if (openRichEditor) {
                                            openInlineEditor(
                                                rubricData.assignmentInfo.description,
                                                'Assignment Description',
                                                (newContent) => updateAssignmentInfo('description', newContent),
                                                null,
                                                null,
                                                'assignment'
                                            );
                                        } else {
                                            updateAssignmentInfo('description', value);
                                        }
                                    }}
                                    placeholder="Detailed description of assignment requirements and expectations..."
                                    isTextarea={true}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Threshold (%)</label>
                                <input
                                    type="number"
                                    value={rubricData.assignmentInfo.passingThreshold}
                                    onChange={(e) => updateAssignmentInfo('passingThreshold', parseInt(e.target.value) || 0)}
                                    className="w-full p-3 border rounded-lg"
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Points (Auto-calculated)</label>
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
                                            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                        >
                                            <X size={16} />
                                            Cancel
                                        </button>
                                    </div>
                                </div>

                                <RichTextToolbar />

                                {/* Editor Content */}
                                <div className="p-4">
                                    <style>{`
                                        .rich-text-editor { line-height: 1.5; }
                                        .rich-text-editor h1 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; line-height: 1.2; }
                                        .rich-text-editor h2 { font-size: 1.3em; font-weight: bold; margin: 0.4em 0; line-height: 1.2; }
                                        .rich-text-editor h3 { font-size: 1.1em; font-weight: bold; margin: 0.3em 0; line-height: 1.2; }
                                        .rich-text-editor p { margin: 0.5em 0; line-height: 1.5; }
                                        .rich-text-editor ul, .rich-text-editor ol { margin: 0.5em 0; padding-left: 1.5em; line-height: 1.5; }
                                        .rich-text-editor li { margin: 0.2em 0; line-height: 1.4; }
                                        .rich-text-editor blockquote { 
                                            margin: 0.5em 0; 
                                            padding: 0.5em 1em; 
                                            border-left: 4px solid #e5e7eb; 
                                            background: #f9fafb; 
                                            font-style: italic;
                                            line-height: 1.5;
                                        }
                                        .rich-text-editor pre { 
                                            background: #f3f4f6; 
                                            padding: 0.5em; 
                                            border-radius: 4px; 
                                            font-family: monospace; 
                                            font-size: 0.9em; 
                                            white-space: pre-wrap;
                                            line-height: 1.3;
                                            margin: 0.5em 0;
                                        }
                                        .rich-text-editor a { color: #3b82f6; text-decoration: underline; }
                                        .rich-text-editor hr { margin: 1em 0; border: none; border-top: 1px solid #d1d5db; }
                                        .rich-text-editor div { margin: 0; }
                                        .rich-text-editor * { max-width: 100%; word-wrap: break-word; }
                                        
                                        /* Enhanced formatting support */
                                        .rich-text-editor strong, .rich-text-editor b { font-weight: bold; }
                                        .rich-text-editor em, .rich-text-editor i { font-style: italic; }
                                        .rich-text-editor u { text-decoration: underline; }
                                        .rich-text-editor strike, .rich-text-editor s { text-decoration: line-through; }
                                        .rich-text-editor sub { vertical-align: sub; font-size: smaller; }
                                        .rich-text-editor sup { vertical-align: super; font-size: smaller; }
                                    `}</style>
                                    <div
                                        ref={editorRef}
                                        contentEditable={true}
                                        onInput={handleRichTextChange}


                                        className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rich-text-editor"
                                        style={{
                                            minHeight: '200px',
                                            backgroundColor: '#fff',
                                            fontSize: '14px',
                                            lineHeight: '1.5',
                                            fontFamily: 'inherit',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word'
                                        }}
                                        suppressContentEditableWarning={true}
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
                                            <span>Use toolbar for advanced formatting</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            <strong>Shortcuts:</strong> Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline), Enter (New Paragraph), Tab (Indent)<br />
                                            <strong>FIXED Paste:</strong> Copy formatted text from Word/Google Docs - lists and formatting preserved with NO vertical gaps!
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

                    {/* FIXED: Rubric Table with width constraints */}
                    <div className="bg-white border rounded-lg overflow-hidden mb-6 rubric-table-container">
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Assessment Criteria Matrix</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setReversedOrder(!reversedOrder)}
                                    className="bg-indigo-700 hover:bg-indigo-600 px-3 py-2 rounded flex items-center gap-1 text-sm"
                                    title="Switch between ascending and descending level order"
                                >
                                    <RotateCcw size={14} />
                                    {reversedOrder ? 'High→Low' : 'Low→High'}
                                </button>
                                <button
                                    onClick={resetTextareaSizes}
                                    className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded flex items-center gap-1 text-sm"
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
                                        <th className="border p-3 text-left font-semibold criterion-column">
                                            Criterion ({rubricData.criteria.length})
                                        </th>
                                        {getDisplayLevels().map((level) => (
                                            <th
                                                key={level.level}
                                                className="border p-3 text-center font-semibold level-column"
                                                style={{
                                                    backgroundColor: level.color + '20',
                                                    color: level.color,
                                                    border: `2px solid ${level.color}`
                                                }}
                                            >
                                                <div className="font-bold">{level.name}</div>
                                                <div className="text-xs font-normal mt-1 opacity-75">
                                                    {level.description}
                                                </div>
                                            </th>
                                        ))}
                                        <th className="border p-3 text-center font-semibold actions-column">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rubricData.criteria.map((criterion, index) => (
                                        <React.Fragment key={criterion.id}>
                                            <tr>
                                                {/* Criterion Column */}
                                                <td className="border p-3 bg-gray-50 criterion-column">
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            value={criterion.name}
                                                            onChange={(e) => updateCriterion(criterion.id, 'name', e.target.value)}
                                                            className="w-full p-2 border rounded text-sm font-medium"
                                                            placeholder={`Criterion ${index + 1} name`}
                                                            style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                                                        />
                                                        <ContentDisplay
                                                            content={criterion.description}
                                                            onEdit={(value, openRichEditor) => {
                                                                if (openRichEditor) {
                                                                    openInlineEditor(
                                                                        criterion.description,
                                                                        `Criterion Description - ${criterion.name || 'Criterion'}`,
                                                                        (newContent) => updateCriterion(criterion.id, 'description', newContent),
                                                                        criterion.id,
                                                                        null,
                                                                        'criterion'
                                                                    );
                                                                } else {
                                                                    updateCriterion(criterion.id, 'description', value);
                                                                }
                                                            }}
                                                            placeholder="Brief description of what this criterion measures"
                                                        />
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
                                                    <td key={level.level} className="border p-3 align-top level-column">
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
                                                            <ContentDisplay
                                                                content={criterion.levels[level.level]?.description || ''}
                                                                onEdit={(value, openRichEditor) => {
                                                                    if (openRichEditor) {
                                                                        openInlineEditor(
                                                                            criterion.levels[level.level]?.description || '',
                                                                            `${level.name} Level - ${criterion.name || 'Criterion'}`,
                                                                            (newContent) => updateCriterionLevel(criterion.id, level.level, 'description', newContent),
                                                                            criterion.id,
                                                                            level.level,
                                                                            'level'
                                                                        );
                                                                    } else {
                                                                        updateCriterionLevel(criterion.id, level.level, 'description', value);
                                                                    }
                                                                }}
                                                                placeholder={`Describe ${level.name.toLowerCase()} performance...`}
                                                            />
                                                            {pointingSystem === 'custom' && (
                                                                <input
                                                                    type="text"
                                                                    value={criterion.levels[level.level]?.pointRange || ''}
                                                                    onChange={(e) => updateCriterionLevel(criterion.id, level.level, 'pointRange', e.target.value)}
                                                                    className="w-full p-1 border rounded text-xs text-center"
                                                                    placeholder="e.g., 18-20"
                                                                    style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                ))}

                                                {/* Actions Column */}
                                                <td className="border p-3 text-center actions-column">
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
                                                                            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                                                        >
                                                                            <X size={16} />
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <RichTextToolbar />

                                                                {/* Editor Content */}
                                                                <div className="p-4">
                                                                    <style>{`
                                                                    .rich-text-editor { line-height: 1.5; }
                                                                    .rich-text-editor h1 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; line-height: 1.2; }
                                                                    .rich-text-editor h2 { font-size: 1.3em; font-weight: bold; margin: 0.4em 0; line-height: 1.2; }
                                                                    .rich-text-editor h3 { font-size: 1.1em; font-weight: bold; margin: 0.3em 0; line-height: 1.2; }
                                                                    .rich-text-editor p { margin: 0.5em 0; line-height: 1.5; }
                                                                    .rich-text-editor ul, .rich-text-editor ol { margin: 0.5em 0; padding-left: 1.5em; line-height: 1.5; }
                                                                    .rich-text-editor li { margin: 0.2em 0; line-height: 1.4; }
                                                                    .rich-text-editor blockquote { 
                                                                        margin: 0.5em 0; 
                                                                        padding: 0.5em 1em; 
                                                                        border-left: 4px solid #e5e7eb; 
                                                                        background: #f9fafb; 
                                                                        font-style: italic;
                                                                        line-height: 1.5;
                                                                    }
                                                                    .rich-text-editor pre { 
                                                                        background: #f3f4f6; 
                                                                        padding: 0.5em; 
                                                                        border-radius: 4px; 
                                                                        font-family: monospace; 
                                                                        font-size: 0.9em; 
                                                                        white-space: pre-wrap;
                                                                        line-height: 1.3;
                                                                        margin: 0.5em 0;
                                                                    }
                                                                    .rich-text-editor a { color: #3b82f6; text-decoration: underline; }
                                                                    .rich-text-editor hr { margin: 1em 0; border: none; border-top: 1px solid #d1d5db; }
                                                                    .rich-text-editor div { margin: 0; }
                                                                    .rich-text-editor * { max-width: 100%; word-wrap: break-word; }
                                                                    
                                                                    /* Enhanced formatting support */
                                                                    .rich-text-editor strong, .rich-text-editor b { font-weight: bold; }
                                                                    .rich-text-editor em, .rich-text-editor i { font-style: italic; }
                                                                    .rich-text-editor u { text-decoration: underline; }
                                                                    .rich-text-editor strike, .rich-text-editor s { text-decoration: line-through; }
                                                                    .rich-text-editor sub { vertical-align: sub; font-size: smaller; }
                                                                    .rich-text-editor sup { vertical-align: super; font-size: smaller; }
                                                                `}</style>
                                                                    <div
                                                                        ref={editorRef}
                                                                        contentEditable={true}
                                                                        onInput={handleRichTextChange}


                                                                        className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rich-text-editor"
                                                                        style={{
                                                                            minHeight: '150px',
                                                                            backgroundColor: '#fff',
                                                                            fontSize: '14px',
                                                                            lineHeight: '1.5',
                                                                            fontFamily: 'inherit',
                                                                            whiteSpace: 'pre-wrap',
                                                                            wordBreak: 'break-word'
                                                                        }}
                                                                        suppressContentEditableWarning={true}
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
                                                                            <span>Use toolbar for formatting</span>
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            <strong>Shortcuts:</strong> Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline), Enter (New Paragraph), Tab (Indent)<br />
                                                                            <strong>FIXED Paste:</strong> Copy formatted text from Word/Google Docs - lists and formatting preserved with NO vertical gaps!
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
                                                                        title="Click to edit with rich text editor"
                                                                        style={{
                                                                            wordWrap: 'break-word',
                                                                            overflowWrap: 'break-word',
                                                                            whiteSpace: 'pre-wrap'
                                                                        }}
                                                                    >
                                                                        {stripHtml(item)}
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
                    </div>

                    {/* Overall Score Preview */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Achievement Level Preview</h3>
                        <p className="text-gray-600 mb-4">
                            Shows how total rubric scores map to achievement levels. Each submission receives a level based on its total points.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
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
