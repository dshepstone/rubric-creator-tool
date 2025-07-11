import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Upload, Download, Save, FileText, RotateCcw, ChevronDown, ChevronUp, Maximize2, ArrowRight, Minimize2 } from 'lucide-react';
import { useAssessment } from './SharedContext';

// Simple Rich Text Editor Component to replace the problematic ReactQuill
const SimpleRichTextEditor = React.forwardRef(({ value, onChange, placeholder }, ref) => {
    const editorRef = useRef(null);
    const [isEditorReady, setIsEditorReady] = useState(false);

    useEffect(() => {
        if (editorRef.current) {
            setIsEditorReady(true);
            // Set initial content
            if (value && editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [value]);

    const handlePaste = (e) => {
        e.preventDefault();
        const clipboard = e.clipboardData;
        const htmlData = clipboard.getData('text/html');
        const textData = clipboard.getData('text/plain');

        let cleanContent;
        if (htmlData) {
            // Enhanced HTML sanitization - preserve more formatting including lists
            cleanContent = sanitizeHtml(htmlData);
        } else {
            // Convert plain text to HTML, preserving line breaks
            cleanContent = textData
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\r\n|\r|\n/g, '<br>');
        }

        // Focus the editor first
        editorRef.current.focus();
        
        // Insert the content
        if (document.queryCommandSupported('insertHTML')) {
            document.execCommand('insertHTML', false, cleanContent);
        } else {
            // Fallback for browsers that don't support insertHTML
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cleanContent;
                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                range.insertNode(fragment);
            }
        }
        
        // Trigger onChange
        if (onChange) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const sanitizeHtml = (html) => {
        // First, remove all style blocks, comments, and Microsoft Word specific content
        let cleanedHtml = html
            // Remove HTML comments (including the massive style block from Word)
            .replace(/<!--[\s\S]*?-->/g, '')
            // Remove style tags and their content
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            // Remove script tags and their content
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            // Remove XML declarations and Office-specific tags
            .replace(/<\?xml[^>]*>/gi, '')
            .replace(/<\/?o:p[^>]*>/gi, '')
            .replace(/<\/?v:[^>]*>/gi, '')
            .replace(/<\/?w:[^>]*>/gi, '')
            // Remove Microsoft Word conditional comments
            .replace(/<!--\[if[^>]*>[\s\S]*?<!\[endif\]-->/gi, '');

        // Create a temporary container
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleanedHtml;
        
        // Remove all style attributes and Microsoft Office attributes
        const removeAttributes = (element) => {
            if (element.nodeType === Node.ELEMENT_NODE) {
                // Get all attributes to remove
                const attributesToRemove = [];
                for (let i = 0; i < element.attributes.length; i++) {
                    const attr = element.attributes[i];
                    // Remove style attributes, class attributes, and any mso-* attributes
                    if (attr.name === 'style' || 
                        attr.name === 'class' || 
                        attr.name.startsWith('mso-') ||
                        attr.name.startsWith('data-') ||
                        attr.name === 'lang' ||
                        attr.name === 'dir') {
                        attributesToRemove.push(attr.name);
                    }
                }
                
                // Remove the attributes
                attributesToRemove.forEach(attrName => {
                    element.removeAttribute(attrName);
                });
                
                // Recursively clean child elements
                Array.from(element.children).forEach(child => {
                    removeAttributes(child);
                });
            }
        };
        
        removeAttributes(tempDiv);
        
        // Convert Microsoft Word's complex list structures to simple HTML lists
        const convertWordLists = (container) => {
            // Find paragraphs that are actually list items (they contain bullet symbols or are indented)
            const paragraphs = container.querySelectorAll('p');
            let currentList = null;
            let currentListType = null;
            
            paragraphs.forEach(p => {
                const text = p.textContent.trim();
                const isListItem = text.startsWith('·') || 
                                 text.startsWith('•') || 
                                 text.startsWith('-') ||
                                 text.match(/^\d+\./) ||
                                 p.style.marginLeft ||
                                 p.className?.includes('List');
                
                if (isListItem) {
                    // Determine if it's ordered or unordered
                    const isOrdered = text.match(/^\d+\./);
                    const listType = isOrdered ? 'ol' : 'ul';
                    
                    // Create new list if needed
                    if (!currentList || currentListType !== listType) {
                        currentList = document.createElement(listType);
                        currentListType = listType;
                        p.parentNode.insertBefore(currentList, p);
                    }
                    
                    // Create list item
                    const li = document.createElement('li');
                    
                    // Clean the text (remove bullet symbols and extra spacing)
                    let cleanText = text
                        .replace(/^[·•\-]\s*/, '') // Remove bullet symbols
                        .replace(/^\d+\.\s*/, '') // Remove number prefix
                        .trim();
                    
                    // Move the paragraph content to the list item
                    li.innerHTML = cleanText;
                    currentList.appendChild(li);
                    
                    // Remove the original paragraph
                    p.remove();
                } else {
                    // Reset list tracking for non-list content
                    currentList = null;
                    currentListType = null;
                }
            });
        };
        
        convertWordLists(tempDiv);
        
        // Define allowed tags
        const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        
        // Function to recursively clean nodes and remove disallowed tags
        const cleanNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                // Clean up text content - remove extra whitespace
                const cleanText = node.textContent.replace(/\s+/g, ' ').trim();
                return cleanText ? document.createTextNode(cleanText) : null;
            }
            
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                
                if (allowedTags.includes(tagName)) {
                    const newNode = document.createElement(tagName);
                    
                    // Recursively clean children
                    Array.from(node.childNodes).forEach(child => {
                        const cleanedChild = cleanNode(child);
                        if (cleanedChild) {
                            newNode.appendChild(cleanedChild);
                        }
                    });
                    
                    // Only return the node if it has content
                    return newNode.textContent.trim() || newNode.children.length > 0 ? newNode : null;
                } else {
                    // For disallowed tags (like div, span), extract their children
                    const fragment = document.createDocumentFragment();
                    Array.from(node.childNodes).forEach(child => {
                        const cleanedChild = cleanNode(child);
                        if (cleanedChild) {
                            fragment.appendChild(cleanedChild);
                        }
                    });
                    return fragment.childNodes.length > 0 ? fragment : null;
                }
            }
            
            return null;
        };
        
        const cleanedContainer = document.createElement('div');
        Array.from(tempDiv.childNodes).forEach(child => {
            const cleanedChild = cleanNode(child);
            if (cleanedChild) {
                cleanedContainer.appendChild(cleanedChild);
            }
        });
        
        // Final cleanup - remove empty paragraphs and normalize spacing
        const finalHtml = cleanedContainer.innerHTML
            .replace(/<p[^>]*>\s*<\/p>/g, '') // Remove empty paragraphs
            .replace(/\n\s*\n/g, '\n') // Remove multiple line breaks
            .replace(/(<\/[^>]+>)\s+(<[^>]+>)/g, '$1$2') // Remove spaces between tags
            .trim();
        
        return finalHtml;
    };

    const handleInput = () => {
        if (onChange && editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const formatText = (command, value = null) => {
        // Focus the editor first to ensure commands work
        if (editorRef.current) {
            editorRef.current.focus();
            
            // Small delay to ensure focus is set
            setTimeout(() => {
                try {
                    const success = document.execCommand(command, false, value);
                    if (!success) {
                        console.warn(`Command ${command} not successful`);
                    }
                    
                    // Trigger onChange after formatting
                    if (onChange && editorRef.current) {
                        onChange(editorRef.current.innerHTML);
                    }
                } catch (error) {
                    console.error(`Error executing command ${command}:`, error);
                }
            }, 10);
        }
    };

    const handleKeyDown = (e) => {
        // Handle some common keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    formatText('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    formatText('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    formatText('underline');
                    break;
            }
        }
    };

    return (
        <div className="simple-rich-text-editor border border-gray-300 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-2 flex-wrap">
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                    onClick={() => formatText('bold')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-bold transition-colors"
                    title="Bold (Ctrl+B)"
                >
                    B
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('italic')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm italic transition-colors"
                    title="Italic (Ctrl+I)"
                >
                    I
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('underline')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm underline transition-colors"
                    title="Underline (Ctrl+U)"
                >
                    U
                </button>
                <div className="w-px bg-gray-300"></div>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('formatBlock', 'h3')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-bold transition-colors"
                    title="Heading 3"
                >
                    H3
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('formatBlock', 'p')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm transition-colors"
                    title="Paragraph"
                >
                    P
                </button>
                <div className="w-px bg-gray-300"></div>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('insertUnorderedList')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm transition-colors"
                    title="Bullet List"
                >
                    • List
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('insertOrderedList')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm transition-colors"
                    title="Numbered List"
                >
                    1. List
                </button>
                <div className="w-px bg-gray-300"></div>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('outdent')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm transition-colors"
                    title="Decrease Indent"
                >
                    ←
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('indent')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm transition-colors"
                    title="Increase Indent"
                >
                    →
                </button>
                <div className="w-px bg-gray-300"></div>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('removeFormat')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm text-red-600 transition-colors"
                    title="Clear Formatting"
                >
                    Clear
                </button>
            </div>

            {/* Editor Content */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                style={{ 
                    lineHeight: '1.5',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                }}
                dangerouslySetInnerHTML={{ __html: value || '' }}
                suppressContentEditableWarning={true}
                data-placeholder={placeholder}
            />

            {/* Enhanced styling for lists and editor */}
            <style jsx>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    font-style: italic;
                    pointer-events: none;
                }
                [contenteditable]:focus:before {
                    content: none;
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
        type: null // 'assignment', 'criterion', 'level', or 'feedback'
    });
    const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

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
        <p style="color: #64748b; font-size: 1.1em;">${renderFormattedContent(rubricData.assignmentInfo.description) || 'No description provided'}</p>
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
                            ${renderFormattedContent(criterion.description) || 'No description provided'}
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
                                ${criterion.levels[level.level]?.description || '<em>Not defined</em>'}
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

    return (
        <div className="min-h-screen bg-gray-50 p-6">
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
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
                                        <strong>📝 Rich Text Editing:</strong> Type directly in any description box for quick edits, or click the blue expand button (⤢) to open the full editor. Paste formatting from Word or the web is preserved.
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
                                <div className="relative">
                                    <textarea
                                        value={renderFormattedContent(rubricData.assignmentInfo.description)}
                                        onChange={(e) => updateAssignmentInfo('description', convertFormattedTextToHtml(e.target.value))}
                                        className="w-full p-3 border rounded-lg resize-y hover:border-blue-400 transition-all duration-200 pr-12"
                                        rows="3"
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
                                        className="absolute top-2 right-2 z-10 opacity-70 hover:opacity-100 transition-opacity bg-blue-500 text-white rounded p-1 hover:bg-blue-600 cursor-pointer"
                                        title="Open rich text editor"
                                    >
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
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

                    {/* Rubric Table */}
                    <div className="bg-white border rounded-lg overflow-hidden mb-6">
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Assessment Criteria Matrix</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setReversedOrder(!reversedOrder)}
                                    className="bg-indigo-700 hover:bg-indigo-600 px-3 py-2 rounded flex items-center gap-1 text-sm text-white"
                                    title="Switch between ascending and descending level order"
                                >
                                    <RotateCcw size={14} />
                                    {reversedOrder ? 'High→Low' : 'Low→High'}
                                </button>
                                <button
                                    onClick={resetTextareaSizes}
                                    className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded flex items-center gap-1 text-sm text-white"
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
                                                                className="absolute top-1 right-1 z-10 opacity-70 hover:opacity-100 transition-opacity bg-blue-500 text-white rounded p-1 hover:bg-blue-600 cursor-pointer"
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
                                                                    className="absolute top-1 right-1 z-10 opacity-70 hover:opacity-100 transition-opacity bg-blue-500 text-white rounded p-1 hover:bg-blue-600 cursor-pointer"
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
                                                                        className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
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