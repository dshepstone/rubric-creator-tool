import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Upload, Download, Save, FileText, RotateCcw, ChevronDown, ChevronUp, Maximize2, ArrowRight } from 'lucide-react'; 
import { useAssessment } from './SharedContext';

const RubricCreator = () => {
    // Default rubric levels (5+2 design)
    const { setSharedRubric, transferRubricToGrading } = useAssessment();
    
    const defaultLevels = [
        { level: 'incomplete', name: 'Incomplete', description: 'No submission or unusable', color: '#95a5a6', multiplier: 0 },
        { level: 'unacceptable', name: 'Unacceptable', description: 'Below minimum standards', color: '#e74c3c', multiplier: 0.3 },
        { level: 'developing', name: 'Developing', description: 'Approaching standards', color: '#f39c12', multiplier: 0.55 },
        { level: 'acceptable', name: 'Acceptable (PASS)', description: 'Meets minimum standards', color: '#27ae60', multiplier: 0.7 },
        { level: 'emerging', name: 'Emerging', description: 'Above standard expectations', color: '#2980b9', multiplier: 0.82 },
        { level: 'accomplished', name: 'Accomplished', description: 'Strong professional quality', color: '#16a085', multiplier: 0.92 },
        { level: 'exceptional', name: 'Exceptional', description: 'Outstanding professional quality', color: '#8e44ad', multiplier: 1.0 }
    ];

    // State management
    const [rubricData, setRubricData] = useState({
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
    });

    const [pointingSystem, setPointingSystem] = useState('multiplier');
    const [reversedOrder, setReversedOrder] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [expandedFeedback, setExpandedFeedback] = useState({});
    const [modalEdit, setModalEdit] = useState({ show: false, content: '', field: null, onSave: null });

    // Refs for file inputs
    const importInputRef = useRef(null);

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

    useEffect(() => {
        setRubricData(prev => ({
            ...prev,
            assignmentInfo: {
                ...prev.assignmentInfo,
                totalPoints: calculateTotalPoints()
            }
        }));
    }, [rubricData.criteria, calculateTotalPoints]); // ← This fixes the warning

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
        setRubricData(prev => ({
            ...prev,
            criteria: prev.criteria.map(criterion =>
                criterion.id === criterionId
                    ? {
                        ...criterion,
                        feedbackLibrary: {
                            ...criterion.feedbackLibrary,
                            [category]: [...criterion.feedbackLibrary[category], item]
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
        link.download = `rubric_${rubricData.assignmentInfo.title.replace(/\s+/g, '_')}_draft.json`;
        link.click();
    };

    // Export rubric for grading template
    const exportForGrading = () => {
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

        // Save to shared context for grading tool
        setSharedRubric(exportData);

        // Also download as before
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rubric_${rubricData.assignmentInfo.title.replace(/\s+/g, '_')}_final.json`;
        link.click();
    };

    // Transfer to grading tool directly
    const transferToGrading = () => {
        const exportData = { ...rubricData };

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

        transferRubricToGrading(exportData);
    };

    // Import rubric data
    const importRubric = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    setRubricData(importedData);
                } catch (error) {
                    alert('Error loading rubric. Please check the JSON format.');
                }
            };
            reader.readAsText(file);
        }
    };

    // Export to HTML
    const exportToHTML = () => {
        const displayLevels = getDisplayLevels();

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${rubricData.assignmentInfo.title} - Rubric</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333; }
        .assignment-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
        .rubric-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 0.85rem; }
        .rubric-table th, .rubric-table td { border: 1px solid #ddd; padding: 10px; text-align: left; vertical-align: top; }
        .rubric-table th { background: #2c3e50; color: white; text-align: center; font-weight: 600; }
        .level-header { text-align: center; font-weight: bold; }
        .criterion-name { font-weight: bold; background: #f8f9fa; }
        .point-range { text-align: center; font-weight: bold; color: #2c3e50; }
        .overall-score { background: #e8f4fd; padding: 20px; border-radius: 8px; margin-top: 30px; }
        .footer { margin-top: 40px; text-align: center; font-size: 0.9rem; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${rubricData.assignmentInfo.title}</h1>
        <p>${rubricData.assignmentInfo.description}</p>
    </div>
    
    <div class="assignment-info">
        <p><strong>Assignment Weight:</strong> ${rubricData.assignmentInfo.weight}% of Final Grade</p>
        <p><strong>Passing Threshold:</strong> ${rubricData.assignmentInfo.passingThreshold}%</p>
        <p><strong>Total Points:</strong> ${rubricData.assignmentInfo.totalPoints}</p>
    </div>
    
    <table class="rubric-table">
        <thead>
            <tr>
                <th style="width: 20%">Criterion</th>
                ${displayLevels.map(level => `<th style="width: ${80 / displayLevels.length}%">${level.name}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${rubricData.criteria.map(criterion => `
                <tr>
                    <td class="criterion-name">
                        <strong>${criterion.name}</strong> (${criterion.maxPoints} pts)
                        <br><small style="color: #666; font-style: italic;">${criterion.description}</small>
                    </td>
                    ${displayLevels.map(level => `
                        <td>
                            <div class="point-range">${calculatePointRange(criterion, level.level)} pts</div>
                            <div style="margin-top: 8px; font-size: 0.9rem;">
                                ${criterion.levels[level.level]?.description || 'Not defined'}
                            </div>
                        </td>
                    `).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="overall-score">
        <h3>Overall Score</h3>
        <p>Each submission is assigned a level of achievement based on its overall rubric score.</p>
        <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
            ${displayLevels.map(level => `
                <div style="flex: 1; min-width: 120px; text-align: center; padding: 10px; border: 2px solid ${level.color}; border-radius: 8px; background: ${level.color}15;">
                    <div style="font-weight: bold; color: ${level.color};">${level.name}</div>
                    <div style="font-size: 0.9rem; margin-top: 5px;">${Math.round(rubricData.assignmentInfo.totalPoints * level.multiplier)} or more</div>
                </div>
            `).join('')}
        </div>
    </div>
    
    <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()} | Total Points: ${rubricData.assignmentInfo.totalPoints}</p>
    </div>
</body>
</html>`;

        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(htmlBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rubric_${rubricData.assignmentInfo.title.replace(/\s+/g, '_')}_display.html`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
                {/* Header */}
                <div className="bg-blue-900 text-white p-6 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Rubric Creation Tool</h1>
                            <p className="text-blue-200">Professional Rubric Builder for Educational Assessment</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => importInputRef.current?.click()}
                                className="bg-purple-700 hover:bg-purple-600 px-3 py-2 rounded flex items-center gap-1 text-sm"
                                title="Import AI-generated rubric content or existing rubric"
                            >
                                <Upload size={14} />
                                Import
                            </button>
                            <button
                                onClick={transferToGrading}
                                className="bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded flex items-center gap-1 text-sm"
                                title="Send rubric directly to grading tool"
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
                                title="Export final rubric for use in grading template"
                            >
                                <Download size={14} />
                                Export JSON
                            </button>
                            <button
                                onClick={exportToHTML}
                                className="bg-orange-700 hover:bg-orange-600 px-3 py-2 rounded flex items-center gap-1 text-sm"
                                title="Export HTML version for student distribution"
                            >
                                <FileText size={14} />
                                Export HTML
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Button Guide */}
                    <div className="bg-gray-50 border border-gray-300 rounded-lg mb-6">
                        <button
                            onClick={() => setShowGuide(!showGuide)}
                            className="w-full p-3 text-left font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                        >
                            📖 Button Guide & Instructions
                            <span className={`transform transition-transform ${showGuide ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        {showGuide && (
                            <div className="p-4 border-t border-gray-300 text-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">🔧 Rubric Building</h4>
                                        <ul className="space-y-1 text-gray-700">
                                            <li><strong>Import:</strong> Load AI-generated rubric content or existing rubrics</li>
                                            <li><strong>Save Draft:</strong> Save work in progress (JSON format)</li>
                                            <li><strong>Export JSON:</strong> Final rubric for grading template use</li>
                                            <li><strong>Export HTML:</strong> Student-friendly display version</li>
                                            <li><strong>Reverse Order:</strong> Switch between low→high and high→low level ordering</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">📝 Usage Instructions</h4>
                                        <ul className="space-y-1 text-gray-700">
                                            <li>1. Fill in assignment information</li>
                                            <li>2. Add/remove criteria as needed</li>
                                            <li>3. Define level descriptions for each criterion</li>
                                            <li>4. Add feedback library items (optional)</li>
                                            <li>5. Export JSON for grading template</li>
                                            <li>6. Export HTML for student distribution</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Assignment Information */}
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4">Assignment Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title</label>
                                <input
                                    type="text"
                                    value={rubricData.assignmentInfo.title}
                                    onChange={(e) => setRubricData(prev => ({
                                        ...prev,
                                        assignmentInfo: { ...prev.assignmentInfo, title: e.target.value }
                                    }))}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="e.g., Assignment 4: Animation B Final"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (% of Final Grade)</label>
                                <input
                                    type="number"
                                    value={rubricData.assignmentInfo.weight}
                                    onChange={(e) => setRubricData(prev => ({
                                        ...prev,
                                        assignmentInfo: { ...prev.assignmentInfo, weight: parseInt(e.target.value) || 0 }
                                    }))}
                                    className="w-full p-3 border rounded-lg"
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={rubricData.assignmentInfo.description}
                                    onChange={(e) => setRubricData(prev => ({
                                        ...prev,
                                        assignmentInfo: { ...prev.assignmentInfo, description: e.target.value }
                                    }))}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        openModalEdit(
                                            rubricData.assignmentInfo.description,
                                            'Assignment Description',
                                            (newContent) => setRubricData(prev => ({
                                                ...prev,
                                                assignmentInfo: { ...prev.assignmentInfo, description: newContent }
                                            }))
                                        );
                                    }}
                                    className="w-full p-3 border rounded-lg resize-both"
                                    rows="2"
                                    placeholder="Brief description of the assignment and its requirements"
                                    title="Right-click for full-page editor"
                                    style={{ minHeight: '60px', maxHeight: '200px', resize: 'both' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Threshold (%)</label>
                                <input
                                    type="number"
                                    value={rubricData.assignmentInfo.passingThreshold}
                                    onChange={(e) => setRubricData(prev => ({
                                        ...prev,
                                        assignmentInfo: { ...prev.assignmentInfo, passingThreshold: parseInt(e.target.value) || 0 }
                                    }))}
                                    className="w-full p-3 border rounded-lg"
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Points (Calculated)</label>
                                <input
                                    type="number"
                                    value={calculateTotalPoints()}
                                    disabled
                                    className="w-full p-3 border rounded-lg bg-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Point System Selection */}
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Point Calculation System</h4>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pointSystem"
                                    value="multiplier"
                                    checked={pointingSystem === 'multiplier'}
                                    onChange={(e) => setPointingSystem(e.target.value)}
                                    className="mr-2"
                                />
                                Automatic (Multiplier-based): Points calculated automatically based on level multipliers
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
                                Custom: Manually set point ranges for each level
                            </label>
                        </div>
                    </div>

                    {/* Rubric Table */}
                    <div className="bg-white border rounded-lg overflow-hidden mb-6">
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Rubric Matrix</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setReversedOrder(!reversedOrder)}
                                    className="bg-indigo-700 hover:bg-indigo-600 px-3 py-2 rounded flex items-center gap-1 text-sm"
                                    title="Reverse level order (lowest to highest or highest to lowest)"
                                >
                                    <RotateCcw size={14} />
                                    {reversedOrder ? 'Standard' : 'Reverse'} Order
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
                                            Criterion
                                        </th>
                                        {getDisplayLevels().map((level) => (
                                            <th
                                                key={level.level}
                                                className="border p-3 text-center font-semibold"
                                                style={{ backgroundColor: level.color + '20', color: level.color, minWidth: '150px' }}
                                            >
                                                {level.name}
                                            </th>
                                        ))}
                                        <th className="border p-3 text-center font-semibold" style={{ width: '80px' }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rubricData.criteria.map((criterion) => (
                                        <tr key={criterion.id}>
                                            {/* Criterion Column */}
                                            <td className="border p-3 bg-gray-50">
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={criterion.name}
                                                        onChange={(e) => updateCriterion(criterion.id, 'name', e.target.value)}
                                                        className="w-full p-2 border rounded text-sm font-medium"
                                                        placeholder="Criterion name"
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
                                                        placeholder="Brief description"
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
                                                            <div className="font-bold text-sm" style={{ color: level.color }}>
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
                                                                    `${level.name} Description`,
                                                                    (newContent) => updateCriterionLevel(criterion.id, level.level, 'description', newContent)
                                                                );
                                                            }}
                                                            className="w-full p-2 border rounded text-xs resize-both"
                                                            rows="4"
                                                            placeholder={`${level.name} description...`}
                                                            title="Right-click for full-page editor"
                                                            style={{ minHeight: '80px', maxHeight: '300px', resize: 'both' }}
                                                        />
                                                        {pointingSystem === 'custom' && (
                                                            <input
                                                                type="text"
                                                                value={criterion.levels[level.level]?.pointRange || ''}
                                                                onChange={(e) => updateCriterionLevel(criterion.id, level.level, 'pointRange', e.target.value)}
                                                                className="w-full p-1 border rounded text-xs text-center"
                                                                placeholder="Point range"
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                            ))}

                                            {/* Actions Column */}
                                            <td className="border p-3 text-center">
                                                <button
                                                    onClick={() => removeCriterion(criterion.id)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                    disabled={rubricData.criteria.length === 1}
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

                    {/* Feedback Library Management - Accordion Style */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Feedback Libraries</h3>
                        <div className="space-y-4">
                            {rubricData.criteria.map((criterion) => (
                                <div key={criterion.id} className="bg-gray-50 border rounded-lg">
                                    <button
                                        onClick={() => toggleFeedbackExpansion(criterion.id)}
                                        className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <div>
                                            <h4 className="font-semibold text-gray-800">
                                                {criterion.name || 'Unnamed Criterion'} - Feedback Library
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {criterion.feedbackLibrary.strengths.length +
                                                    criterion.feedbackLibrary.improvements.length +
                                                    criterion.feedbackLibrary.general.length} feedback items
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
                                                                {category} Comments
                                                            </label>
                                                            <button
                                                                onClick={() => {
                                                                    const newComment = prompt(`Add ${category} comment:`);
                                                                    if (newComment) {
                                                                        addFeedbackItem(criterion.id, category, newComment);
                                                                    }
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                            >
                                                                + Add
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                                            {criterion.feedbackLibrary[category].map((item, index) => (
                                                                <div key={index} className="flex items-start gap-2 text-xs">
                                                                    <span
                                                                        className="flex-1 p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100"
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
                                                                        title="Click to edit in full-page editor"
                                                                    >
                                                                        {item}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => removeFeedbackItem(criterion.id, category, index)}
                                                                        className="text-red-600 hover:text-red-800 mt-1"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {criterion.feedbackLibrary[category].length === 0 && (
                                                                <div className="text-xs text-gray-500 italic text-center py-4">
                                                                    No {category} comments added
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
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Overall Score Breakdown</h3>
                        <p className="text-gray-600 mb-4">Each submission is assigned a level of achievement based on its overall rubric score.</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                            {getDisplayLevels().map((level) => (
                                <div
                                    key={level.level}
                                    className="text-center p-3 rounded-lg border-2"
                                    style={{
                                        borderColor: level.color,
                                        backgroundColor: level.color + '15'
                                    }}
                                >
                                    <div className="font-semibold text-sm" style={{ color: level.color }}>
                                        {level.name}
                                    </div>
                                    <div className="text-lg font-bold mt-1" style={{ color: level.color }}>
                                        {Math.round(calculateTotalPoints() * level.multiplier)}
                                    </div>
                                    <div className="text-xs text-gray-600">or more</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Full-Page Text Editor Modal */}
                {modalEdit.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Edit {modalEdit.field}
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
                                    placeholder="Enter your text here..."
                                    style={{ minHeight: '400px' }}
                                />
                            </div>
                            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                                <p className="text-sm text-gray-600">
                                    <strong>Tip:</strong> Use this full-page editor for longer descriptions and detailed feedback comments.
                                    Click "Save & Close" to apply your changes.
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