import React, { useState, useRef, useEffect } from 'react';
import { Download, Sparkles, FileText, ArrowRight, Lightbulb, Upload, HelpCircle, Settings, Plus, Minus } from 'lucide-react';
import { useAssessment } from './SharedContext';
import gradingPolicyService from '../services/gradingPolicyService';

// SimpleRichTextEditor component (exact copy from AssignmentPromptGenerator.js)
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

const AIRubricPromptGenerator = () => {
  const {
    aiPromptFormData,
    updateAIPromptFormData,
    initializeAIPromptFormData,
    assignmentPromptFormData // ADD: Access to assignment data
  } = useAssessment();

  // Initialize form data if it doesn't exist
  React.useEffect(() => {
    if (!aiPromptFormData) {
      initializeAIPromptFormData();
    }
  }, [aiPromptFormData, initializeAIPromptFormData]);

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);

  const handleInputChange = (field, value) => {
    updateAIPromptFormData(field, value);
  };

  // UPDATED: Import function to preserve weight percentage
  const importAssignmentData = () => {
    if (!assignmentPromptFormData) {
      alert('No assignment data found to import. Please create an assignment first.');
      return;
    }

    // Map assignment data to AI prompt fields
    const mappedData = {
      // Ensure all required fields have values (no empty strings)
      assignmentType: assignmentPromptFormData.assignmentTitle?.trim() || 'Assignment',
      programType: formData.programType || 'Diploma',
      programLevel: assignmentPromptFormData.programLevel || formData.programLevel || 'Semester 3',
      subjectArea: assignmentPromptFormData.subjectArea?.trim() || 'General Studies',
      assignmentDescription: assignmentPromptFormData.assignmentDescription?.trim() || 'Assignment description imported from assignment prompt.',

      // Keep existing settings or set defaults
      criteriaType: formData.criteriaType || 'ai-suggested',
      numCriteria: formData.numCriteria || '4',
      timeFrameUnit: formData.timeFrameUnit || 'weeks',

      // UPDATED: Preserve weight percentage instead of converting to points
      weightPercentage: assignmentPromptFormData.weightPercentage || '',

      // Still calculate points for the prompt, but keep weight separate
      totalPoints: assignmentPromptFormData.weightPercentage ?
        (parseInt(assignmentPromptFormData.weightPercentage) * 4).toString() : '100',

      // Format learning outcomes from CLOs (convert to CLO array format)
      learningObjectives: assignmentPromptFormData.clos ?
        assignmentPromptFormData.clos
          .filter(clo => clo.text && clo.text.trim()) // Only include CLOs with text
          .map(clo => ({
            id: Date.now() + Math.random(), // Generate unique IDs
            number: clo.number,
            text: clo.text,
            type: clo.type
          })) : [],

      // Map special instructions to special considerations
      specialConsiderations: assignmentPromptFormData.specialInstructions?.trim() || '',

      // Set other fields
      studentPopulation: formData.studentPopulation || 'Mixed Ability',
      timeFrameNumber: formData.timeFrameNumber || '',
      userCriteria: formData.userCriteria || ''
    };

    // Update all the mapped data
    Object.entries(mappedData).forEach(([field, value]) => {
      updateAIPromptFormData(field, value);
    });

    alert('Assignment data imported successfully! Weight percentage and all required fields have been populated. Review and adjust as needed.');
  };

  // Use shared form data, fallback to defaults if not available
  const formData = aiPromptFormData || {
    assignmentType: '',
    programType: '',
    programLevel: '',
    subjectArea: '',
    assignmentDescription: '',
    totalPoints: '100',
    weightPercentage: '', // NEW: Add weight percentage field
    numCriteria: '4',
    criteriaType: 'ai-suggested',
    userCriteria: '',
    learningObjectives: [ // Changed from string to array of CLO objects
      { id: 1, number: '1', text: '', type: 'CLO' },
      { id: 2, number: '2', text: '', type: 'CLO' },
      { id: 3, number: '3', text: '', type: 'CLO' },
      { id: 4, number: '4', text: '', type: 'CLO' }
    ],
    studentPopulation: '',
    timeFrameNumber: '',
    timeFrameUnit: 'weeks',
    specialConsiderations: '',
    achievementLevels: '7' // NEW: Add achievement levels field with default 7
  };

  // Force re-render when aiPromptFormData changes to ensure validation updates
  React.useEffect(() => {
    // This effect will run whenever aiPromptFormData changes, ensuring validation is rechecked
  }, [aiPromptFormData]);

  // NEW: Define achievement level templates that match RubricCreator.js
  const levelTemplates = {
    2: [
      { level: 'unacceptable', name: 'Unacceptable', multiplier: 0, description: 'Does not meet standards' },
      { level: 'acceptable', name: 'Acceptable', multiplier: 1.0, description: 'Meets standards' }
    ],
    3: [
      { level: 'unacceptable', name: 'Unacceptable', multiplier: 0, description: 'Does not meet standards' },
      { level: 'developing', name: 'Developing', multiplier: 0.6, description: 'Approaching standards' },
      { level: 'acceptable', name: 'Acceptable', multiplier: 1.0, description: 'Meets standards' }
    ],
    4: [
      { level: 'incomplete', name: 'Incomplete', multiplier: 0, description: 'No submission' },
      { level: 'developing', name: 'Developing', multiplier: 0.5, description: 'Needs improvement' },
      { level: 'acceptable', name: 'Acceptable', multiplier: 0.75, description: 'Meets standards' },
      { level: 'accomplished', name: 'Accomplished', multiplier: 1.0, description: 'Exceeds standards' }
    ],
    5: [
      { level: 'incomplete', name: 'Incomplete', multiplier: 0, description: 'No submission' },
      { level: 'unacceptable', name: 'Unacceptable', multiplier: 0.3, description: 'Below standards' },
      { level: 'developing', name: 'Developing', multiplier: 0.55, description: 'Approaching standards' },
      { level: 'acceptable', name: 'Acceptable', multiplier: 0.75, description: 'Meets standards' },
      { level: 'accomplished', name: 'Accomplished', multiplier: 1.0, description: 'Exceeds standards' }
    ],
    6: [
      { level: 'incomplete', name: 'Incomplete', multiplier: 0, description: 'No submission' },
      { level: 'unacceptable', name: 'Unacceptable', multiplier: 0.3, description: 'Below standards' },
      { level: 'developing', name: 'Developing', multiplier: 0.55, description: 'Approaching standards' },
      { level: 'acceptable', name: 'Acceptable', multiplier: 0.7, description: 'Meets standards' },
      { level: 'accomplished', name: 'Accomplished', multiplier: 0.85, description: 'Exceeds standards' },
      { level: 'exceptional', name: 'Exceptional', multiplier: 1.0, description: 'Outstanding quality' }
    ],
    7: [
      { level: 'incomplete', name: 'Incomplete', multiplier: 0, description: 'No submission or unusable' },
      { level: 'unacceptable', name: 'Unacceptable', multiplier: 0.3, description: 'Below minimum standards' },
      { level: 'developing', name: 'Developing', multiplier: 0.55, description: 'Approaching standards' },
      { level: 'acceptable', name: 'Acceptable (PASS)', multiplier: 0.7, description: 'Meets minimum standards' },
      { level: 'emerging', name: 'Emerging', multiplier: 0.82, description: 'Above standard expectations' },
      { level: 'accomplished', name: 'Accomplished', multiplier: 0.92, description: 'Strong professional quality' },
      { level: 'exceptional', name: 'Exceptional', multiplier: 1.0, description: 'Outstanding professional quality' }
    ]
  };

  // NEW: Function to generate achievement levels prompt text
  const generateAchievementLevelsText = () => {
    const selectedLevels = parseInt(formData.achievementLevels) || 7;
    const template = levelTemplates[selectedLevels];

    if (!template) return '';

    return template.map((level, index) =>
      `  ${index + 1}. ${level.name} (${level.multiplier}x multiplier)`
    ).join('\n');
  };

  // NEW: Function to generate rubric levels JSON for the prompt
  const generateRubricLevelsJSON = () => {
    const selectedLevels = parseInt(formData.achievementLevels) || 7;
    const template = levelTemplates[selectedLevels];

    if (!template) return '';

    const colors = ['#95a5a6', '#e74c3c', '#f39c12', '#27ae60', '#2980b9', '#16a085', '#8e44ad'];

    return template.map((level, index) => `    {
      "level": "${level.level}",
      "name": "${level.name}",
      "multiplier": ${level.multiplier},
      "color": "${colors[index] || '#95a5a6'}",
      "description": "${level.description}"
    }`).join(',\n');
  };

  // CLO management functions (from AssignmentPromptGenerator.js)
  const addCLO = () => {
    const currentCLOs = formData.learningObjectives || [];
    if (currentCLOs.length < 15) {
      const newCLO = {
        id: Date.now(),
        number: (currentCLOs.length + 1).toString(),
        text: '',
        type: 'CLO'
      };
      const updatedCLOs = [...currentCLOs, newCLO];
      handleInputChange('learningObjectives', updatedCLOs);
    }
  };

  const removeCLO = (cloId) => {
    const currentCLOs = formData.learningObjectives || [];
    if (currentCLOs.length > 1) {
      const updatedCLOs = currentCLOs.filter(clo => clo.id !== cloId);
      handleInputChange('learningObjectives', updatedCLOs);
    }
  };

  const updateCLO = (cloId, field, value) => {
    const currentCLOs = formData.learningObjectives || [];
    const updatedCLOs = currentCLOs.map(clo =>
      clo.id === cloId ? { ...clo, [field]: value } : clo
    );
    handleInputChange('learningObjectives', updatedCLOs);
  };

  // Generate number options for CLO/ULO dropdown (from AssignmentPromptGenerator.js)
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

  // Helper function to convert HTML content to readable text for AI prompts (from RubricCreator.js)
  const renderFormattedContent = (htmlContent) => {
    if (!htmlContent) return '';

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

  const generatePrompt = () => {
    const courseLevel = `${formData.programType} - ${formData.programLevel}`;
    const criteriaCount = formData.numCriteria || '4-6';
    const timeFrame = formData.timeFrameNumber ?
      `${formData.timeFrameNumber} ${formData.timeFrameUnit}` :
      'Standard assignment duration';

    // Criteria instructions based on user selection - convert HTML to readable text
    const criteriaInstructions = formData.criteriaType === 'user-provided' && formData.userCriteria
      ? `\n**User-Specified Criteria to Include:**\n${renderFormattedContent(formData.userCriteria)}\n\nPlease use these criteria as the basis for your rubric. You may refine the names and add detailed descriptions, but ensure all listed criteria are included.`
      : `\n**Criteria Generation:**\nPlease suggest ${criteriaCount} appropriate criteria for this ${formData.subjectArea} assignment. Base your suggestions on best practices for ${formData.assignmentType} assessment and the specified learning context.`;

    // NEW: Generate achievement levels text and get template
    const selectedLevels = parseInt(formData.achievementLevels) || 7;
    const template = levelTemplates[selectedLevels];
    const achievementLevelsText = generateAchievementLevelsText();
    const rubricLevelsJSON = generateRubricLevelsJSON();

    // Convert CLOs array to text for prompt
    const learningObjectivesText = Array.isArray(formData.learningObjectives)
      ? formData.learningObjectives
        .filter(clo => clo.text && clo.text.trim())
        .map(clo => `${clo.type}${clo.number}: ${clo.text}`)
        .join('\n')
      : formData.learningObjectives || 'To be determined based on assignment type';

    const prompt = `Create a comprehensive educational rubric for the following assignment:

**Assignment Type:** ${formData.assignmentType}
**Course Level:** ${courseLevel}
**Subject Area:** ${formData.subjectArea}
**Assignment Description:** ${formData.assignmentDescription}${criteriaInstructions}

**Specific Requirements:**
- Total Points: ${formData.totalPoints} points
- Weight: ${formData.weightPercentage || 'TBD'}% of Final Grade
- Number of Criteria: ${criteriaCount} main criteria
- Assessment Levels: Use this ${selectedLevels}-level system:
${achievementLevelsText}

**Output Format Required:**
Please provide the output as a complete JSON file matching this exact structure:

\`\`\`json
{
  "assignmentInfo": {
    "title": "${formData.assignmentType}",
    "description": "${formData.assignmentDescription}",
    "weight": ${formData.weightPercentage || 25},
    "totalPoints": ${formData.totalPoints},
    "passingThreshold": 65,
    "dueDate": "2025-04-15",
    "courseCode": "COURSE_CODE",
    "instructor": "Instructor Name"
  },
  "rubricLevels": [
${rubricLevelsJSON}
  ],
  "criteria": [
    {
      "id": "criterion_id_1",
      "name": "Criterion Name 1",
      "description": "Detailed description of what this criterion assesses",
      "maxPoints": 25,
      "levels": {
${template.map(level => `        "${level.level}": {
          "pointRange": "Calculate appropriate range",
          "description": "Detailed description for this level"
        }`).join(',\n')}
      },
      "feedbackLibrary": {
        "strengths": [
          "Strong example feedback for good performance",
          "Another positive feedback option"
        ],
        "improvements": [
          "Suggestion for improvement",
          "Another improvement suggestion"
        ],
        "specific": [
          "Specific technical feedback",
          "Another specific comment"
        ]
      }
    }
  ]
}
\`\`\`

**Important Notes:**
${formData.criteriaType === 'user-provided' ?
        `**NOTE:** The user has provided specific criteria. Ensure all listed criteria are included and refined with professional descriptions appropriate for ${formData.subjectArea} assessment.` :
        `**NOTE:** Generate appropriate criteria based on best practices for ${formData.assignmentType} assessment in ${formData.subjectArea}.`}

**CRITICAL FORMAT REQUIREMENTS:**
- Use descriptive IDs like "animation_principles", "technical_execution" for criterion IDs
- The "levels" object must contain objects with "pointRange" and "description" properties
- Calculate appropriate point ranges for each level based on the criterion's maxPoints
- Each level (${template.map(l => l.level).join(', ')}) should be an object with pointRange and description
- Ensure the JSON is valid and complete - test it in a JSON validator before providing
- The output must be importable directly into the Rubric Creator tool

**Additional Context:**
- Learning objectives: ${learningObjectivesText}
- Student population: ${formData.studentPopulation || 'Mixed ability'}
- Time frame: ${timeFrame}
- Special considerations: ${renderFormattedContent(formData.specialConsiderations) || 'None specified'}

Please generate a complete, ready-to-import, downloadable JSON file that matches the structure exactly and can be directly imported into the Rubric Creator tool.`;

    setGeneratedPrompt(prompt);
    setShowPrompt(true);
  };

  const exportPrompt = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedPrompt], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ai-rubric-prompt-${formData.assignmentType.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    alert('Prompt copied to clipboard!');
  };

  const isFormValid = formData.assignmentType?.trim() && formData.programType?.trim() &&
    formData.programLevel?.trim() && formData.subjectArea?.trim() && formData.assignmentDescription?.trim() &&
    (formData.criteriaType === 'ai-suggested' ||
      (formData.criteriaType === 'user-provided' && formData.userCriteria?.trim())) &&
    // Check if there's at least one learning objective with text
    (Array.isArray(formData.learningObjectives)
      ? formData.learningObjectives.some(clo => clo.text?.trim())
      : formData.learningObjectives?.trim());

  // Helper function to export current form data as JSON
  const exportFormData = () => {
    const dataToExport = {
      ...formData,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `ai-rubric-prompt-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Helper function to import form data from JSON
  const importFormData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          // Update form data with imported values
          Object.entries(importedData).forEach(([field, value]) => {
            if (field !== 'exportDate' && field !== 'version') {
              updateAIPromptFormData(field, value);
            }
          });
          alert('Form data imported successfully!');
        } catch (error) {
          alert('Error importing file: Please ensure it\'s a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <Sparkles className="text-yellow-500" size={40} />
                AI Rubric Prompt Generator
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Generate comprehensive prompts for AI tools to create professional educational rubrics
              </p>
            </div>

            {!showPrompt ? (
              <>
                {/* Import Assignment Data Button */}
                {assignmentPromptFormData && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-800">Import Assignment Data</h3>
                        <p className="text-blue-600 text-sm">
                          Assignment detected: "{assignmentPromptFormData.assignmentTitle || 'Untitled'}"
                        </p>
                      </div>
                      <button
                        onClick={importAssignmentData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Import Data
                      </button>
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Assignment Information */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="text-blue-600" size={20} />
                        Assignment Information
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assignment Type *
                          </label>
                          <input
                            type="text"
                            value={formData.assignmentType}
                            onChange={(e) => handleInputChange('assignmentType', e.target.value)}
                            placeholder="e.g., Portfolio Project, Research Paper, Presentation"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Program Type *
                            </label>
                            <select
                              value={formData.programType}
                              onChange={(e) => handleInputChange('programType', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Type</option>
                              <option value="Certificate">Certificate</option>
                              <option value="Diploma">Diploma</option>
                              <option value="Degree">Degree</option>
                              <option value="Graduate Certificate">Graduate Certificate</option>
                              <option value="Masters">Masters</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Program Level *
                            </label>
                            <select
                              value={formData.programLevel}
                              onChange={(e) => handleInputChange('programLevel', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Level</option>
                              <option value="Semester 1">Semester 1</option>
                              <option value="Semester 2">Semester 2</option>
                              <option value="Semester 3">Semester 3</option>
                              <option value="Semester 4">Semester 4</option>
                              <option value="Semester 5">Semester 5</option>
                              <option value="Semester 6">Semester 6</option>
                              <option value="Year 1">Year 1</option>
                              <option value="Year 2">Year 2</option>
                              <option value="Year 3">Year 3</option>
                              <option value="Year 4">Year 4</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject Area *
                          </label>
                          <input
                            type="text"
                            value={formData.subjectArea}
                            onChange={(e) => handleInputChange('subjectArea', e.target.value)}
                            placeholder="e.g., Digital Media, Business Administration, Web Development"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assignment Description *
                          </label>
                          <SimpleRichTextEditor
                            value={formData.assignmentDescription || ''}
                            onChange={(html) => handleInputChange('assignmentDescription', html)}
                            placeholder="Detailed description of what students need to accomplish..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Rubric Configuration */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Settings className="text-green-600" size={20} />
                        Rubric Configuration
                      </h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Total Points
                            </label>
                            <input
                              type="number"
                              value={formData.totalPoints}
                              onChange={(e) => handleInputChange('totalPoints', e.target.value)}
                              placeholder="100"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Weight (% of Final Grade)
                            </label>
                            <input
                              type="number"
                              value={formData.weightPercentage}
                              onChange={(e) => handleInputChange('weightPercentage', e.target.value)}
                              placeholder="25"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Number of Criteria
                            </label>
                            <select
                              value={formData.numCriteria}
                              onChange={(e) => handleInputChange('numCriteria', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="3">3 Criteria</option>
                              <option value="4">4 Criteria</option>
                              <option value="5">5 Criteria</option>
                              <option value="6">6 Criteria</option>
                              <option value="7">7 Criteria</option>
                              <option value="8">8 Criteria</option>
                            </select>
                          </div>

                          {/* NEW: Achievement Levels Dropdown */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Achievement Levels
                            </label>
                            <select
                              value={formData.achievementLevels}
                              onChange={(e) => handleInputChange('achievementLevels', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="2">2 Levels (Simple)</option>
                              <option value="3">3 Levels (Basic)</option>
                              <option value="4">4 Levels (Standard)</option>
                              <option value="5">5 Levels (Detailed)</option>
                              <option value="6">6 Levels (Advanced)</option>
                              <option value="7">7 Levels (Professional)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              {formData.achievementLevels === '2' && 'Simple pass/fail assessment'}
                              {formData.achievementLevels === '3' && 'Basic progression levels'}
                              {formData.achievementLevels === '4' && 'Standard rubric with clear progression'}
                              {formData.achievementLevels === '5' && 'Detailed assessment levels'}
                              {formData.achievementLevels === '6' && 'Advanced professional assessment'}
                              {formData.achievementLevels === '7' && 'Comprehensive professional grading'}
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Criteria Type
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                              <input
                                type="radio"
                                name="criteriaType"
                                value="ai-suggested"
                                checked={formData.criteriaType === 'ai-suggested'}
                                onChange={(e) => handleInputChange('criteriaType', e.target.value)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 mr-3"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                AI-Suggested Criteria
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  Recommended
                                </span>
                              </span>
                            </label>
                            <label className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                              <input
                                type="radio"
                                name="criteriaType"
                                value="user-provided"
                                checked={formData.criteriaType === 'user-provided'}
                                onChange={(e) => handleInputChange('criteriaType', e.target.value)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 mr-3"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                User-Provided Criteria
                              </span>
                            </label>
                          </div>
                        </div>

                        {formData.criteriaType === 'user-provided' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your Criteria *
                            </label>
                            <SimpleRichTextEditor
                              value={formData.userCriteria || ''}
                              onChange={(html) => handleInputChange('userCriteria', html)}
                              placeholder="List your criteria using rich text formatting:

• Content Quality - Demonstrates thorough understanding
• Technical Skills - Shows proficiency in required tools  
• Presentation - Clear and professional communication
• Documentation - Complete and well-organized materials

You can use:
- Bullet points or numbered lists
- Bold text for emphasis
- Multiple paragraphs for organization"
                            />
                            <div className="mt-2 text-xs text-gray-500">
                              💡 Tip: Use bullet points or numbered lists to organize your criteria clearly
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Learning Context */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Lightbulb className="text-purple-600" size={20} />
                        Learning Context
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Learning Objectives
                            </label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={addCLO}
                                disabled={(formData.learningObjectives || []).length >= 15}
                                className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg font-medium ${(formData.learningObjectives || []).length >= 15
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
                            {(formData.learningObjectives || []).map((clo, index) => (
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
                                  disabled={(formData.learningObjectives || []).length <= 1}
                                  className={`p-1 rounded ${(formData.learningObjectives || []).length <= 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-red-600 hover:bg-red-50'
                                    }`}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {(!formData.learningObjectives || formData.learningObjectives.length === 0) && (
                            <div className="text-center py-8 text-gray-500">
                              <p>No learning outcomes added yet.</p>
                              <p className="text-sm">Click "Add CLO" to add your first learning outcome.</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Student Population
                          </label>
                          <select
                            value={formData.studentPopulation}
                            onChange={(e) => handleInputChange('studentPopulation', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Population</option>
                            <option value="Beginner Level">Beginner Level</option>
                            <option value="Intermediate Level">Intermediate Level</option>
                            <option value="Advanced Level">Advanced Level</option>
                            <option value="Mixed Ability">Mixed Ability</option>
                            <option value="Adult Learners">Adult Learners</option>
                            <option value="International Students">International Students</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Time Frame
                            </label>
                            <input
                              type="number"
                              value={formData.timeFrameNumber}
                              onChange={(e) => handleInputChange('timeFrameNumber', e.target.value)}
                              placeholder="2"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Unit
                            </label>
                            <select
                              value={formData.timeFrameUnit}
                              onChange={(e) => handleInputChange('timeFrameUnit', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="weeks">Weeks</option>
                              <option value="classes">Classes</option>
                              <option value="months">Months</option>
                              <option value="days">Days</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Special Considerations
                          </label>
                          <SimpleRichTextEditor
                            value={formData.specialConsiderations || ''}
                            onChange={(html) => handleInputChange('specialConsiderations', html)}
                            placeholder="Any special requirements, accommodations, or considerations..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* NEW: Achievement Levels Preview */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Settings className="text-orange-600" size={20} />
                        Achievement Levels Preview
                      </h3>

                      <div className="space-y-2">
                        {levelTemplates[parseInt(formData.achievementLevels) || 7]?.map((level, index) => (
                          <div key={level.level} className="flex justify-between items-center p-2 bg-white rounded border">
                            <span className="font-medium">{index + 1}. {level.name}</span>
                            <span className="text-sm text-gray-600">{level.multiplier}x multiplier</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-sm text-gray-600 mt-3">
                        This {formData.achievementLevels}-level system will be used in your generated rubric.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="mt-8 text-center">
                  <div className="mb-4">
                    <button
                      onClick={generatePrompt}
                      disabled={!isFormValid}
                      className={`px-12 py-4 rounded-xl font-bold text-lg flex items-center gap-4 mx-auto transition-all duration-300 ${isFormValid
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      <Sparkles className="w-6 h-6" />
                      Generate AI Prompt
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>

                  {!isFormValid && (
                    <div className="text-center">
                      <p className="text-sm text-red-600">
                        Please fill in all required fields (*) and add at least one learning objective to generate the prompt
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                {/* Generated Prompt Display */}
                <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{generatedPrompt}</pre>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={copyToClipboard}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={exportPrompt}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download as File
                  </button>
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Go back to Rubric Generator
                  </button>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Next Steps
                  </h4>
                  <ol className="text-blue-700 space-y-1 text-sm">
                    <li>1. Copy the prompt above</li>
                    <li>2. Paste it into your preferred AI tool (ChatGPT, Claude, etc.)</li>
                    <li>3. The AI will generate a complete JSON file</li>
                    <li>4. Save the JSON file and import it into the Rubric Creator</li>
                    <li>5. Customize and refine the rubric as needed</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRubricPromptGenerator;