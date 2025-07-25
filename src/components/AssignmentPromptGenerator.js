import React, { useState, useRef, useEffect } from 'react';
import { Download, Sparkles, FileText, ArrowRight, Lightbulb, BookOpen, Code, Plus, Minus, Upload, Save } from 'lucide-react';
import { useAssessment } from './SharedContext';

// Simple Rich Text Editor Component
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
        let cleanedHtml = html
            // Remove all HTML comments (<!-- … -->), including Word's conditional comments
            .replace(/<!--[\s\S]*?-->/g, '')
            // Remove style tags and their content
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            // Remove script tags and their content
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            // Remove XML declarations and Office-specific tags
            .replace(/<\?xml[^>]*>/gi, '')
            .replace(/<\/?o:p[^>]*>/gi, '')
            .replace(/<\/?v:[^>]*>/gi, '')
            .replace(/<\/?w:[^>]*>/gi, '');

        // Create a temporary container
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleanedHtml;

        // Remove all style attributes and Microsoft Office attributes
        const removeAttributes = (element) => {
            if (element.nodeType === Node.ELEMENT_NODE) {
                const attributesToRemove = [];
                for (let i = 0; i < element.attributes.length; i++) {
                    const attr = element.attributes[i];
                    if (attr.name.startsWith('mso-') ||
                        attr.name === 'style' ||
                        attr.name.startsWith('o:') ||
                        attr.name.startsWith('v:') ||
                        attr.name.startsWith('w:')) {
                        attributesToRemove.push(attr.name);
                    }
                }
                attributesToRemove.forEach(attrName => {
                    element.removeAttribute(attrName);
                });

                // Recursively clean child elements
                for (let child of element.children) {
                    removeAttributes(child);
                }
            }
        };

        removeAttributes(tempDiv);

        // Clean and rebuild DOM structure
        const cleanNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent.trim() ? document.createTextNode(node.textContent) : null;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'div', 'span'];

                if (allowedTags.includes(tagName)) {
                    const newNode = document.createElement(tagName);

                    // Copy allowed attributes (none for now, but could be expanded)

                    // Process children
                    for (const child of Array.from(node.childNodes)) {
                        const cleanedChild = cleanNode(child);
                        if (cleanedChild) {
                            newNode.appendChild(cleanedChild);
                        }
                    }
                    return newNode.childNodes.length > 0 || tagName === 'br' ? newNode : null;
                } else {
                    const fragment = document.createDocumentFragment();
                    for (const child of Array.from(node.childNodes)) {
                        const cleanedChild = cleanNode(child);
                        if (cleanedChild) {
                            fragment.appendChild(cleanedChild);
                        }
                    }
                    return fragment.childNodes.length > 0 ? fragment : null;
                }
            }
            return null;
        };

        const cleanedContainer = document.createElement('div');
        for (const child of Array.from(tempDiv.childNodes)) {
            const cleanedChild = cleanNode(child);
            if (cleanedChild) {
                cleanedContainer.appendChild(cleanedChild);
            }
        }

        // Final cleanup
        const finalHtml = cleanedContainer.innerHTML
            .replace(/<p[^>]*>\s*<\/p>/g, '')
            .replace(/\n\s*\n/g, '\n')
            .replace(/(<\/[^>]+>)\s+(<[^>]+>)/g, '$1$2')
            .trim();

        return finalHtml;
    };

    const handleInput = () => {
        if (onChange && editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const formatText = (command, value = null) => {
        if (editorRef.current) {
            editorRef.current.focus();
            setTimeout(() => {
                try {
                    document.execCommand(command, false, value);
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
                default:
                    break;
            }
        }
    };

    return (
        <div className="simple-rich-text-editor border border-gray-300 rounded-lg overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="bg-gray-100 border-b border-gray-300 p-2 flex gap-2 flex-wrap">
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                    onClick={() => formatText('bold')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-bold transition-colors text-gray-800"
                    title="Bold (Ctrl+B)"
                >
                    B
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('italic')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm italic transition-colors text-gray-800"
                    title="Italic (Ctrl+I)"
                >
                    I
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('underline')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm underline transition-colors text-gray-800"
                    title="Underline (Ctrl+U)"
                >
                    U
                </button>
                <div className="w-px bg-gray-300"></div>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('formatBlock', 'h3')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-bold transition-colors text-gray-800"
                    title="Heading 3"
                >
                    H3
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('formatBlock', 'p')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm transition-colors text-gray-800"
                    title="Paragraph"
                >
                    P
                </button>
                <div className="w-px bg-gray-300"></div>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('insertUnorderedList')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm transition-colors text-gray-800"
                    title="Bullet List"
                >
                    • List
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatText('insertOrderedList')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm transition-colors text-gray-800"
                    title="Numbered List"
                >
                    1. List
                </button>
                <div className="w-px bg-gray-300"></div>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        if (editorRef.current) {
                            editorRef.current.innerHTML = '';
                            onChange('');
                        }
                    }}
                    className="px-3 py-1 bg-red-50 border border-red-300 text-red-600 rounded hover:bg-red-100 text-sm transition-colors"
                    title="Clear"
                >
                    Clear
                </button>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                className="p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                style={{ maxHeight: '300px', overflowY: 'auto' }}
                suppressContentEditableWarning={true}
                data-placeholder={placeholder}
            />

            {/* CSS Styles for contentEditable */}
            <style>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    font-style: italic;
                }
                [contenteditable] strong, [contenteditable] b {
                    font-weight: bold;
                }
                [contenteditable] em, [contenteditable] i {
                    font-style: italic;
                }
                [contenteditable] u {
                    text-decoration: underline;
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

const AssignmentPromptGenerator = () => {
    const {
        assignmentPromptFormData,
        updateAssignmentPromptFormData,
        initializeAssignmentPromptFormData
    } = useAssessment();

    // Initialize form data if it doesn't exist
    React.useEffect(() => {
        if (!assignmentPromptFormData) {
            initializeAssignmentPromptFormData();
        }
    }, [assignmentPromptFormData, initializeAssignmentPromptFormData]);

    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [showPrompt, setShowPrompt] = useState(false);
    const [generatedHTML, setGeneratedHTML] = useState('');
    const [showHTML, setShowHTML] = useState(false);

    // ADD: File input ref for loading JSON
    const fileInputRef = useRef(null);

    const handleInputChange = (field, value) => {
        updateAssignmentPromptFormData(field, value);

        // Auto-sync submission folder number with assignment number
        if (field === 'assignmentNumber' && value) {
            updateAssignmentPromptFormData('submissionFolderNumber', value);
        }
    };

    // ADD: Save assignment data as JSON
    const saveAssignmentJSON = () => {
        if (!assignmentPromptFormData) {
            alert('No assignment data to save');
            return;
        }

        const dataToSave = {
            ...assignmentPromptFormData,
            savedDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(dataToSave, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;

        // Generate filename based on assignment title and number
        const assignmentTitle = assignmentPromptFormData.assignmentTitle || 'Assignment';
        const assignmentNumber = assignmentPromptFormData.assignmentNumber || 'X';
        const courseCode = assignmentPromptFormData.courseCode || 'Course';
        const filename = `${courseCode}_Assignment_${assignmentNumber}_${assignmentTitle.replace(/\s+/g, '_')}.json`;

        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('Assignment saved successfully!');
    };

    // ADD: Load assignment data from JSON
    const loadAssignmentJSON = () => {
        fileInputRef.current?.click();
    };

    // ADD: Handle file input change
    const handleFileLoad = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);

                // Validate the JSON structure
                if (typeof jsonData !== 'object' || !jsonData.assignmentTitle) {
                    throw new Error('Invalid assignment file format');
                }

                // Remove metadata fields before loading
                const { savedDate, version, ...assignmentData } = jsonData;

                // Load the data into the form
                Object.entries(assignmentData).forEach(([field, value]) => {
                    updateAssignmentPromptFormData(field, value);
                });

                alert(`Assignment loaded successfully!${savedDate ? `\nSaved: ${new Date(savedDate).toLocaleDateString()}` : ''}`);
            } catch (error) {
                console.error('Error loading assignment:', error);
                alert('Error loading assignment file. Please ensure it\'s a valid assignment JSON file.');
            }
        };
        reader.readAsText(file);

        // Reset the input to allow loading the same file again
        event.target.value = '';
    };

    // CLO management functions
    const addCLO = () => {
        const currentCLOs = formData.clos || [];
        if (currentCLOs.length < 15) {
            const newCLO = {
                id: Date.now(),
                number: (currentCLOs.length + 1).toString(),
                text: '',
                type: 'CLO'
            };
            const updatedCLOs = [...currentCLOs, newCLO];
            handleInputChange('clos', updatedCLOs);
        }
    };

    const removeCLO = (cloId) => {
        const currentCLOs = formData.clos || [];
        if (currentCLOs.length > 1) {
            const updatedCLOs = currentCLOs.filter(clo => clo.id !== cloId);
            handleInputChange('clos', updatedCLOs);
        }
    };

    const updateCLO = (cloId, field, value) => {
        const currentCLOs = formData.clos || [];
        const updatedCLOs = currentCLOs.map(clo =>
            clo.id === cloId ? { ...clo, [field]: value } : clo
        );
        handleInputChange('clos', updatedCLOs);
    };

    // Generate number options for CLO/ULO dropdown
    const generateNumberOptions = () => {
        const options = [];
        for (let i = 1; i <= 15; i++) {
            options.push(<option key={i} value={i.toString()}>{i}</option>);
            // Add decimal options for .1, .2, .3, .4, .5
            for (let j = 1; j <= 5; j++) {
                const decimal = `${i}.${j}`;
                options.push(<option key={decimal} value={decimal}>{decimal}</option>);
            }
        }
        return options;
    };

    // Generate week options for dropdown
    const generateWeekOptions = () => {
        const options = [<option key="default" value="">Select Week</option>];
        for (let i = 1; i <= 16; i++) {
            options.push(<option key={i} value={i.toString()}>{`Week ${i}`}</option>);
        }
        return options;
    };

    // Use shared form data, fallback to defaults if not available
    const formData = assignmentPromptFormData || {
        assignmentTitle: '',
        assignmentNumber: '1',
        weightPercentage: '',
        courseCode: '',
        programLevel: '',
        subjectArea: '',
        assignmentDescription: '',
        rationale: 'This assignment will evaluate the following Course Learning Outcomes:',
        clos: [
            { id: 1, number: '1', text: '', type: 'CLO' },
            { id: 2, number: '2', text: '', type: 'CLO' },
            { id: 3, number: '3', text: '', type: 'CLO' },
            { id: 4, number: '4', text: '', type: 'CLO' }
        ],
        directions: '',
        gradingDetails: '',
        dueWeek: '',
        dueDateCustom: '',
        submissionFolderNumber: '1',
        specialInstructions: '',
        tipsForSuccess: ''
    };

    const generateAIPrompt = () => {
        // Generate CLO text for the prompt
        const clos = formData.clos || [];
        const closText = clos
            .filter(clo => clo.text.trim() !== '')
            .map(clo => `- ${clo.type}${clo.number}: ${clo.text}`)
            .join('\n');

        // Generate due date text
        const dueText = formData.dueWeek ?
            `Week ${formData.dueWeek}${formData.dueDateCustom ? ` (${formData.dueDateCustom})` : ''}` :
            formData.dueDateCustom || 'See your Instructional Plan for exact due dates.';

        // Generate submission folder text
        const submissionFolderText = `Assignment ${formData.submissionFolderNumber || formData.assignmentNumber || 'X'}`;

        const prompt = `Create HTML code for an assignment details page that matches EXACTLY the structure and format of the provided template for D2L. Use the following assignment information:

**Assignment Information:**
- Assignment Title: Individual Assignment ${formData.assignmentNumber} (${formData.weightPercentage}%)
- Assignment Number: ${formData.assignmentNumber}
- Weight: ${formData.weightPercentage}%
- Course Code: ${formData.courseCode}
- Subject Area: ${formData.subjectArea}
- Due Date: ${dueText}
- Submission Folder: ${submissionFolderText}

**Assignment Content:**
- Description: ${formData.assignmentDescription}
- Rationale: ${formData.rationale}
- Learning Outcomes:
${closText}
- Directions: ${formData.directions}
- Grading Details: ${formData.gradingDetails}
- Tips for Success: ${formData.tipsForSuccess}
- Special Instructions: ${formData.specialInstructions}

**CRITICAL REQUIREMENTS:**
1. Use EXACTLY this HTML structure for D2L content area (NO DOCTYPE, html, head, or body tags):

\`\`\`html
<div class="container-fluid">
<div class="row justify-content-center">
<div class="col-sm-12 col-md-10">
<p><strong>Due:</strong>&nbsp; [DUE DATE]</p>
<p><strong>Submit to: </strong>The&nbsp;<strong>[SUBMISSION FOLDER]</strong>&nbsp;submission folder. Submission folders can be accessed by selecting <strong>Course Tools</strong> and then <strong>Assignments </strong>on the course navigation bar.</p>
<h2>Description</h2>
<p>[DESCRIPTION]</p>
<h3>Rationale</h3>
<p>[RATIONALE TEXT]</p>
<ul>
[LEARNING OUTCOME LIST ITEMS]
</ul>
<h2>Directions</h2>
<p>[DIRECTIONS]</p>
<h2>How Your Assignment Will be Graded</h2>
<p>[GRADING INFORMATION]</p>
<p>See your Program Handbook for the late policy.</p>
<h2>Tips for Success</h2>
<p>[TIPS FOR SUCCESS]</p>
</div>
</div>
</div>
\`\`\`

2. Replace all bracketed placeholders with the appropriate information provided above
3. This is for D2L content area - do NOT include DOCTYPE, html, head, or body tags
4. Follow the content structure exactly as shown in the simple template
5. Use proper HTML formatting with &lt;strong&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;p&gt; tags
6. For the learning outcome list, create &lt;li&gt; tags with the format: &lt;li&gt;CLO#: [text]&lt;/li&gt; or &lt;li&gt;ULO#: [text]&lt;/li&gt;
7. For grading section: use the provided grading details text
8. Keep the format simple and clean - this is the basic template structure

Generate complete, ready-to-paste HTML code for D2L content area that matches the simple template structure exactly.`;

        setGeneratedPrompt(prompt);
        setShowPrompt(true);
        setShowHTML(false);
    };

    const generateAssignmentHTML = () => {
        // Generate CLO list HTML
        const clos = formData.clos || [];
        const closHTML = clos
            .filter(clo => clo.text.trim() !== '')
            .map(clo => `    <li><strong>${clo.type} ${clo.number}:</strong> ${clo.text}</li>`)
            .join('\n');

        // Generate due date text
        const dueText = formData.dueWeek ?
            `(Week ${formData.dueWeek}${formData.dueDateCustom ? ` - ${formData.dueDateCustom}` : ''})` :
            formData.dueDateCustom ? `(${formData.dueDateCustom})` : '(See your Instructional Plan for exact due dates)';

        // Generate submission folder text
        const submissionFolderText = `Assignment ${formData.submissionFolderNumber || formData.assignmentNumber || 'X'}`;

        // Helper function to extract text content from HTML and format for display
        const formatRichTextForHTML = (htmlContent, fallbackText) => {
            if (!htmlContent || htmlContent.trim() === '') {
                return fallbackText;
            }

            // If it's already HTML content (contains HTML tags), use it as is
            if (htmlContent.includes('<') && htmlContent.includes('>')) {
                // Clean up the HTML content and ensure proper formatting
                return htmlContent
                    .replace(/<div>/g, '<p>')
                    .replace(/<\/div>/g, '</p>')
                    .replace(/<br\s*\/?>/g, '<br>')
                    .trim();
            } else {
                // If it's plain text, wrap in paragraph tags
                return `<p>${htmlContent}</p>`;
            }
        };

        const assignmentHTML = `<div class="container-fluid">
<div class="row justify-content-center">
<div class="col-sm-12 col-md-10">
  <h1>Assignment ${formData.assignmentNumber || 'X'}: ${formData.assignmentTitle || '[Assignment Title]'}</h1>
  <p><strong>Due:</strong> ${dueText}</p>
  <p><strong>Weight:</strong> ${formData.weightPercentage || 'X'}% of final grade</p>
  <p><strong>Submit to: </strong>The <strong>${submissionFolderText}</strong> submission folder. Submission folders can be accessed by selecting <strong>Course Tools</strong> and then <strong>Assignments</strong> on the course navigation bar.</p>
  <h2>Description</h2>
  <p>${formData.assignmentDescription || '[Please provide a short description of the assignment]'}</p>
  <h3>Rationale</h3>
  <p>${formData.rationale || 'This assignment will evaluate the following Course Learning Outcomes:'}</p>
  <ul>
${closHTML || '    <li><strong>CLO1:</strong> [Learning outcome description]</li>\n    <li><strong>CLO2:</strong> [Learning outcome description]</li>\n    <li><strong>CLO3:</strong> [Learning outcome description]</li>\n    <li><strong>CLO4:</strong> [Learning outcome description]</li>'}
  </ul>
  <h2>Directions</h2>
  ${formatRichTextForHTML(formData.directions, '<p>[Provide step-by-step instructions if applicable]</p>')}
  <h2>How Your Assignment Will be Graded</h2>
  ${formatRichTextForHTML(formData.gradingDetails, '<p>A rubric has been created and can be found attached to the submission folder. Your work will be evaluated on [specify criteria].</p>')}
  <p>See your Program Handbook for the late policy.</p>
  <h3>Tips for Success:</h3>
  ${formatRichTextForHTML(formData.tipsForSuccess, '<p>Tips for completing this assignment successfully will be provided here.</p>')}
${formData.specialInstructions && formData.specialInstructions.trim() !== '' ? `  <h3>Additional Information:</h3>\n  ${formatRichTextForHTML(formData.specialInstructions, '')}` : ''}
</div>
</div>
</div>`;

        setGeneratedHTML(assignmentHTML);
        setShowHTML(true);
        setShowPrompt(false);
    };

    const generateStudentHTML = () => {
        // Generate CLO list HTML
        const clos = formData.clos || [];
        const closHTML = clos
            .filter(clo => clo.text.trim() !== '')
            .map(clo => `        <li><strong>${clo.type} ${clo.number}:</strong> ${clo.text}</li>`)
            .join('\n');

        // Generate due date text
        const dueText = formData.dueWeek ?
            `Week ${formData.dueWeek}${formData.dueDateCustom ? ` - ${formData.dueDateCustom}` : ''}` :
            formData.dueDateCustom || 'See your Instructional Plan for exact due dates';

        // Generate submission folder text
        const submissionFolderText = `Assignment ${formData.submissionFolderNumber || formData.assignmentNumber || 'X'}`;

        // Helper function to extract text content from HTML and format for display
        const formatRichTextForStudentHTML = (htmlContent, fallbackText) => {
            if (!htmlContent || htmlContent.trim() === '') {
                return `<p>${fallbackText}</p>`;
            }

            // If it's already HTML content (contains HTML tags), use it as is
            if (htmlContent.includes('<') && htmlContent.includes('>')) {
                // Clean up the HTML content and ensure proper formatting
                return htmlContent
                    .replace(/<div>/g, '<p>')
                    .replace(/<\/div>/g, '</p>')
                    .replace(/<br\s*\/?>/g, '<br>')
                    .trim();
            } else {
                // If it's plain text, wrap in paragraph tags
                return `<p>${htmlContent}</p>`;
            }
        };

        const studentHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>${formData.courseCode || 'Course'} - Assignment ${formData.assignmentNumber || 'X'}: ${formData.assignmentTitle || 'Assignment Title'}</title>
    <style>
        /* Internal CSS styling */
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #3498db;
            --accent-color-a: #5D8CAE;
            --accent-color-b: #65A69E;
            --light-gray: #ecf0f1;
            --dark-gray: #7f8c8d;
            --white: #ffffff;
            --red: #e74c3c;
            --green: #27ae60;
            --yellow: #f39c12;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: var(--light-gray);
            color: var(--primary-color);
            line-height: 1.6;
            padding: 20px;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            background-color: var(--white);
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--secondary-color);
        }

        h1 {
            color: var(--primary-color);
            font-size: 2.2rem;
            margin-bottom: 10px;
        }

        h2 {
            color: var(--secondary-color);
            font-size: 1.8rem;
            margin: 25px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--light-gray);
        }

        h3 {
            color: var(--primary-color);
            font-size: 1.4rem;
            margin: 20px 0 10px 0;
        }

        p {
            margin-bottom: 15px;
        }

        ul, ol {
            margin-bottom: 20px;
            padding-left: 25px;
        }

        li {
            margin-bottom: 10px;
        }

        .important-box {
            background-color: #fef3e8;
            border-left: 4px solid var(--yellow);
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }

        .deadline-box {
            background-color: #ffebee;
            border-left: 4px solid var(--red);
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }

        .deliverables-box {
            background-color: #e8f4fd;
            border-left: 4px solid var(--secondary-color);
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }

        .instructor-box {
            background-color: #edf7ed;
            border-left: 4px solid var(--green);
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }

        footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            color: var(--dark-gray);
            font-size: 0.9rem;
            border-top: 1px solid var(--light-gray);
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Assignment ${formData.assignmentNumber || 'X'}: ${formData.assignmentTitle || 'Assignment Title'}</h1>
            <p>Weight: ${formData.weightPercentage || 'X'}% of Final Grade</p>
        </header>

        <div class="deadline-box">
            <h3>Due Date</h3>
            <p><strong>${dueText}</strong></p>
            <p>Submit to the ${submissionFolderText} dropbox on eConestoga</p>
        </div>

        <h2>Assignment Description</h2>
        <p>${formData.assignmentDescription || 'Assignment description will be provided here.'}</p>

        <h3>Rationale</h3>
        <p>${formData.rationale || 'This assignment will evaluate the following Course Learning Outcomes:'}</p>
        <ul>
${closHTML || '            <li><strong>CLO1:</strong> Learning outcome description</li>\n            <li><strong>CLO2:</strong> Learning outcome description</li>\n            <li><strong>CLO3:</strong> Learning outcome description</li>\n            <li><strong>CLO4:</strong> Learning outcome description</li>'}
        </ul>

        <h2>Directions</h2>
        ${formatRichTextForStudentHTML(formData.directions, 'Assignment directions will be provided here.')}

        <h2>How Your Assignment Will be Graded</h2>
        ${formatRichTextForStudentHTML(formData.gradingDetails, 'Grading information will be provided here.')}
        <p>See your Program Handbook for the late policy.</p>

        <h2>Tips for Success</h2>
        ${formatRichTextForStudentHTML(formData.tipsForSuccess, 'Tips for success will be provided here.')}

${formData.specialInstructions && formData.specialInstructions.trim() !== '' ? `        <h2>Additional Information</h2>
        ${formatRichTextForStudentHTML(formData.specialInstructions, '')}
` : ''}
        <footer>
            <p>${formData.courseCode || 'Course Code'} | ${new Date().getFullYear()}</p>
            <p>Last Updated: ${new Date().toLocaleDateString()}</p>
        </footer>
    </div>
</body>
</html>`;

        return studentHTML;
    };

    const exportStudentHTML = () => {
        const studentHTML = generateStudentHTML();
        const element = document.createElement('a');
        const file = new Blob([studentHTML], { type: 'text/html' });
        element.href = URL.createObjectURL(file);
        const assignmentNum = formData.assignmentNumber || 'X';
        const courseCode = formData.courseCode || 'Course';
        element.download = `${courseCode}_Assignment_${assignmentNum}_${formData.assignmentTitle.replace(/\s+/g, '_').toLowerCase()}_Student.html`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const exportPrompt = () => {
        const element = document.createElement('a');
        const file = new Blob([generatedPrompt], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        const assignmentNum = formData.assignmentNumber || 'X';
        element.download = `assignment-${assignmentNum}-ai-prompt-${formData.assignmentTitle.replace(/\s+/g, '-').toLowerCase()}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const exportHTML = () => {
        const element = document.createElement('a');
        const file = new Blob([generatedHTML], { type: 'text/html' });
        element.href = URL.createObjectURL(file);
        const submissionNumber = formData.submissionFolderNumber || formData.assignmentNumber || '1';
        element.download = `Assignment_${submissionNumber}_${formData.assignmentTitle.replace(/\s+/g, '_').toLowerCase()}_D2L.html`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const copyToClipboard = (content) => {
        navigator.clipboard.writeText(content);
        alert('Content copied to clipboard!');
    };

    const clearForm = () => {
        if (window.confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
            initializeAssignmentPromptFormData();
            setGeneratedPrompt('');
            setGeneratedHTML('');
            setShowPrompt(false);
            setShowHTML(false);
        }
    };

    // Form validation
    const isFormValid = formData.assignmentTitle?.trim() &&
        formData.assignmentNumber?.trim() &&
        formData.weightPercentage?.trim() &&
        formData.subjectArea?.trim() &&
        formData.assignmentDescription?.trim() &&
        (formData.clos || []).some(clo => clo.text?.trim());

    // Check if there's data to save
    const hasDataToSave = formData.assignmentTitle?.trim() ||
        formData.assignmentDescription?.trim() ||
        (formData.clos || []).some(clo => clo.text?.trim());

    if (!formData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* UPDATED Header with Save/Load buttons */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-orange-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Assignment Prompt Generator</h1>
                                <p className="text-gray-600">Create AI prompts and D2L HTML for assignment pages</p>
                            </div>
                        </div>

                        {/* ADD: Save/Load buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={saveAssignmentJSON}
                                disabled={!hasDataToSave}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${hasDataToSave
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                title="Save current assignment as JSON file"
                            >
                                <Save className="w-4 h-4" />
                                Save JSON
                            </button>

                            <button
                                onClick={loadAssignmentJSON}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 shadow-sm"
                                title="Load assignment from JSON file"
                            >
                                <Upload className="w-4 h-4" />
                                Load JSON
                            </button>
                        </div>
                    </div>

                    {/* ADD: Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileLoad}
                        className="hidden"
                    />

                    <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-lg p-6 border border-orange-200">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Lightbulb className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-2">How It Works</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-700 mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-xs">1</div>
                                        <span>Fill assignment details</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-xs">2</div>
                                        <span>Generate AI prompt or D2L HTML</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-xs">3</div>
                                        <span>Export or copy content</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                    The AI prompt helps ChatGPT create assignment pages, while the D2L HTML output can be pasted directly into D2L's content editor.
                                    <strong> Save your work as JSON files to easily resume later!</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rest of the existing form content remains exactly the same... */}
                {/* Assignment Information Form */}
                <div className="space-y-6">
                    {/* Basic Assignment Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4">Basic Assignment Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title *</label>
                                <input
                                    type="text"
                                    value={formData.assignmentTitle || ''}
                                    onChange={(e) => handleInputChange('assignmentTitle', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="e.g., Digital Portfolio Project"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Number *</label>
                                <input
                                    type="text"
                                    value={formData.assignmentNumber || ''}
                                    onChange={(e) => handleInputChange('assignmentNumber', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="e.g., 1, 2, 3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight Percentage *</label>
                                <input
                                    type="text"
                                    value={formData.weightPercentage || ''}
                                    onChange={(e) => handleInputChange('weightPercentage', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="e.g., 25"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Area *</label>
                                <input
                                    type="text"
                                    value={formData.subjectArea || ''}
                                    onChange={(e) => handleInputChange('subjectArea', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="e.g., Computer Graphics, Web Development"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                                <input
                                    type="text"
                                    value={formData.courseCode || ''}
                                    onChange={(e) => handleInputChange('courseCode', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="e.g., COMP1234"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Submission Folder Number</label>
                                <input
                                    type="text"
                                    value={formData.submissionFolderNumber || ''}
                                    onChange={(e) => handleInputChange('submissionFolderNumber', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="Auto-synced with Assignment Number"
                                />
                                <p className="text-sm text-gray-500 mt-1">Automatically syncs with Assignment Number when changed</p>
                            </div>
                        </div>
                    </div>

                    {/* Due Date Information */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-4">Due Date Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Week</label>
                                <select
                                    value={formData.dueWeek || ''}
                                    onChange={(e) => handleInputChange('dueWeek', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                >
                                    {generateWeekOptions()}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Due Date</label>
                                <input
                                    type="date"
                                    value={formData.dueDateCustom || ''}
                                    onChange={(e) => handleInputChange('dueDateCustom', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            If no dates provided, will default to "See your Instructional Plan for exact due dates."
                        </p>
                    </div>

                    {/* Assignment Content */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-800 mb-4">Assignment Content</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Description *</label>
                                <textarea
                                    value={formData.assignmentDescription || ''}
                                    onChange={(e) => handleInputChange('assignmentDescription', e.target.value)}
                                    className="w-full p-3 border rounded-lg h-24"
                                    placeholder="Provide a clear description of what students need to create or submit..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rationale</label>
                                <textarea
                                    value={formData.rationale || ''}
                                    onChange={(e) => handleInputChange('rationale', e.target.value)}
                                    className="w-full p-3 border rounded-lg h-20"
                                    placeholder="This assignment will evaluate the following Course Learning Outcomes:"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Course Learning Outcomes */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-purple-800">Learning Outcomes</h3>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={addCLO}
                                    disabled={(formData.clos || []).length >= 15}
                                    className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg font-medium ${(formData.clos || []).length >= 15
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                        }`}
                                >
                                    <Plus className="w-4 h-4" />
                                    Add CLO
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {(formData.clos || []).map((clo, index) => (
                                <div key={clo.id} className="flex items-start gap-3 p-3 bg-white rounded border">
                                    <div className="flex gap-2">
                                        <select
                                            value={clo.type}
                                            onChange={(e) => updateCLO(clo.id, 'type', e.target.value)}
                                            className="border rounded px-2 py-1 text-sm"
                                        >
                                            <option value="CLO">CLO</option>
                                            <option value="ULO">ULO</option>
                                        </select>
                                        <select
                                            value={clo.number}
                                            onChange={(e) => updateCLO(clo.id, 'number', e.target.value)}
                                            className="w-16 border rounded px-2 py-1 text-sm"
                                        >
                                            {generateNumberOptions()}
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        value={clo.text}
                                        onChange={(e) => updateCLO(clo.id, 'text', e.target.value)}
                                        className="flex-1 border rounded px-3 py-1"
                                        placeholder="Enter learning outcome description..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeCLO(clo.id)}
                                        disabled={(formData.clos || []).length <= 1}
                                        className={`p-1 rounded ${(formData.clos || []).length <= 1
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-red-600 hover:bg-red-50'
                                            }`}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {(!formData.clos || formData.clos.length === 0) && (
                            <div className="text-center py-8 text-gray-500">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No learning outcomes added yet.</p>
                                <p className="text-sm">Click "Add CLO" to add your first learning outcome.</p>
                            </div>
                        )}
                    </div>

                    {/* Assignment Instructions & Due Date */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-indigo-800 mb-4">Assignment Instructions & Due Date</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Directions</label>
                                <SimpleRichTextEditor
                                    value={formData.directions || ''}
                                    onChange={(html) => handleInputChange('directions', html)}
                                    placeholder="Provide step-by-step instructions for completing the assignment..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">How Your Assignment Will be Graded</label>
                                <SimpleRichTextEditor
                                    value={formData.gradingDetails || ''}
                                    onChange={(html) => handleInputChange('gradingDetails', html)}
                                    placeholder="Describe how the assignment will be graded..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tips for Success</label>
                                <SimpleRichTextEditor
                                    value={formData.tipsForSuccess || ''}
                                    onChange={(html) => handleInputChange('tipsForSuccess', html)}
                                    placeholder="Provide helpful tips and strategies for completing this assignment successfully..."
                                />
                                <p className="text-sm text-gray-600 mt-2">
                                    Share strategies, common pitfalls to avoid, recommended resources, or time management advice to help students succeed.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                                <SimpleRichTextEditor
                                    value={formData.specialInstructions || ''}
                                    onChange={(html) => handleInputChange('specialInstructions', html)}
                                    placeholder="Any additional notes or special requirements..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 flex-wrap">
                        <button
                            onClick={generateAIPrompt}
                            disabled={!isFormValid}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${isFormValid
                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <Sparkles className="w-5 h-5" />
                            Generate AI Prompt
                        </button>

                        <button
                            onClick={generateAssignmentHTML}
                            disabled={!isFormValid}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${isFormValid
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <Code className="w-5 h-5" />
                            Generate D2L HTML
                        </button>

                        <button
                            onClick={exportStudentHTML}
                            disabled={!isFormValid}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${isFormValid
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <FileText className="w-5 h-5" />
                            Export Student HTML
                        </button>

                        <button
                            onClick={clearForm}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
                        >
                            Clear Form
                        </button>
                    </div>

                    {!isFormValid && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-700">
                                <strong>⚠️ Required:</strong> Complete assignment title, number, weight, subject area, description, and at least one learning outcome.
                            </p>
                        </div>
                    )}
                </div>

                {/* Generated Content Display */}
                {(showPrompt || showHTML) && (
                    <div className="mt-8 bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {showPrompt ? 'Generated AI Prompt' : 'Generated D2L HTML'}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                {showPrompt
                                    ? 'Copy this prompt and paste it into ChatGPT to generate your assignment page'
                                    : 'Copy this HTML and paste it directly into D2L\'s content editor'
                                }
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-96 overflow-y-auto">
                                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                                    {showPrompt ? generatedPrompt : generatedHTML}
                                </pre>
                            </div>

                            <div className="flex gap-4 mt-4">
                                {showPrompt && (
                                    <>
                                        <button
                                            onClick={exportPrompt}
                                            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                                        >
                                            <Download className="w-4 h-4" />
                                            Export Prompt (.txt)
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(generatedPrompt)}
                                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Copy to Clipboard
                                        </button>
                                    </>
                                )}

                                {showHTML && (
                                    <>
                                        <button
                                            onClick={exportHTML}
                                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            <Download className="w-4 h-4" />
                                            Export D2L HTML
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(generatedHTML)}
                                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            <Code className="w-4 h-4" />
                                            Copy for D2L
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignmentPromptGenerator;