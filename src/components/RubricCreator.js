import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Upload, Download, Save, FileText, RotateCcw, ChevronDown, ChevronUp, Maximize2, ArrowRight } from 'lucide-react';
import { useAssessment } from './SharedContext';

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
    const [modalEdit, setModalEdit] = useState({ show: false, content: '', field: null, onSave: null });
    const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

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

    // Open modal for text editing
    const openModalEdit = (content, field, onSave) => {
        setModalEdit({
            show: true,
            content,
            field,
            onSave
        });
    };

    // Close modal and save if needed
    const closeModalEdit = (save = false) => {
        if (save && modalEdit.onSave) {
            modalEdit.onSave(modalEdit.content);
        }
        setModalEdit({ show: false, content: '', field: null, onSave: null });
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
        <p style="color: #64748b; font-size: 1.1em;">${rubricData.assignmentInfo.description || 'No description provided'}</p>
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
                            ${criterion.description || 'No description provided'}
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
                                        Right-click any text area for full-page editing mode.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Assignment Information */}
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
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
                                <textarea
                                    value={rubricData.assignmentInfo.description}
                                    onChange={(e) => updateAssignmentInfo('description', e.target.value)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        openModalEdit(
                                            rubricData.assignmentInfo.description,
                                            'Assignment Description',
                                            (newContent) => updateAssignmentInfo('description', newContent)
                                        );
                                    }}
                                    className="w-full p-3 border rounded-lg resize-both"
                                    rows="3"
                                    placeholder="Detailed description of assignment requirements and expectations..."
                                    title="Right-click for full-page editor"
                                    style={{ minHeight: '80px', maxHeight: '200px', resize: 'both' }}
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
                                    className="bg-indigo-700 hover:bg-indigo-600 px-3 py-2 rounded flex items-center gap-1 text-sm"
                                    title="Switch between ascending and descending level order"
                                >
                                    <RotateCcw size={14} />
                                    {reversedOrder ? 'High→Low' : 'Low→High'}
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
                                        <tr key={criterion.id}>
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
                                                    <textarea
                                                        value={criterion.description}
                                                        onChange={(e) => updateCriterion(criterion.id, 'description', e.target.value)}
                                                        onContextMenu={(e) => {
                                                            e.preventDefault();
                                                            openModalEdit(
                                                                criterion.description,
                                                                'Criterion Description',
                                                                (newContent) => updateCriterion(criterion.id, 'description', newContent)
                                                            );
                                                        }}
                                                        className="w-full p-2 border rounded text-xs resize-both"
                                                        rows="2"
                                                        placeholder="Brief description of what this criterion measures"
                                                        title="Right-click for full-page editor"
                                                        style={{ minHeight: '48px', maxHeight: '200px', resize: 'both' }}
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
                                                        <textarea
                                                            value={criterion.levels[level.level]?.description || ''}
                                                            onChange={(e) => updateCriterionLevel(criterion.id, level.level, 'description', e.target.value)}
                                                            onContextMenu={(e) => {
                                                                e.preventDefault();
                                                                openModalEdit(
                                                                    criterion.levels[level.level]?.description || '',
                                                                    `${level.name} Description - ${criterion.name || 'Criterion'}`,
                                                                    (newContent) => updateCriterionLevel(criterion.id, level.level, 'description', newContent)
                                                                );
                                                            }}
                                                            className="w-full p-2 border rounded text-xs resize-both"
                                                            rows="4"
                                                            placeholder={`Describe ${level.name.toLowerCase()} performance...`}
                                                            title="Right-click for full-page editor"
                                                            style={{ minHeight: '80px', maxHeight: '300px', resize: 'both' }}
                                                        />
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
                                                                            openModalEdit(
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
                                                                                }
                                                                            );
                                                                        }}
                                                                        title="Click to edit"
                                                                    >
                                                                        {item}
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

                {/* Full-Page Text Editor Modal */}
                {modalEdit.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    <Maximize2 size={20} className="inline mr-2" />
                                    Edit: {modalEdit.field}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => closeModalEdit(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                                    >
                                        <Save size={16} />
                                        Save & Close
                                    </button>
                                    <button
                                        onClick={() => closeModalEdit(false)}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 p-4">
                                <textarea
                                    value={modalEdit.content}
                                    onChange={(e) => setModalEdit(prev => ({ ...prev, content: e.target.value }))}
                                    className="w-full h-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your detailed text here..."
                                    style={{ minHeight: '400px' }}
                                />
                            </div>
                            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                                <p className="text-sm text-gray-600">
                                    <strong>💡 Full-Page Editor:</strong> Use this space for detailed descriptions and comprehensive feedback comments.
                                    Your changes are automatically saved when you click "Save & Close".
                                </p>
                            </div>
                        </div>
                    </div>
                )}

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