// Grading Policy Manager Component with Percentage Calculators
// File: src/components/GradingPolicyManager.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
    Settings,
    Plus,
    Edit3,
    Trash2,
    Eye,
    Download,
    Upload,
    CheckCircle,
    AlertCircle,
    Calculator,
    BookOpen,
    Save,
    X,
    Copy,
    Clock,
    Info,
    Check,
    Percent
} from 'lucide-react';
import gradingPolicyService from '../services/gradingPolicyService';
import { useGradingPolicies, useGradeCalculation } from '../hooks/useGradingPolicies';
import { useAssessment, DEFAULT_LATE_POLICY } from './SharedContext';

const GradingPolicyManager = () => {
    // Use TanStack Query hooks instead of manual state
    const { data: policies = [], isLoading: loading } = useGradingPolicies();
    const gradeCalculation = useGradeCalculation();
    const {
        currentLatePolicy,
        setCurrentLatePolicy,
        customLatePolicies,
        saveCustomLatePolicy,
        updateCustomLatePolicy,
        deleteCustomLatePolicy,
        loadLatePoliciesFromStorage
    } = useAssessment();

    // Local component state
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [testGrade, setTestGrade] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [editingLatePolicy, setEditingLatePolicy] = useState(null);
    const [showLatePolicyForm, setShowLatePolicyForm] = useState(false);

    // New state for main tab navigation
    const [activeMainTab, setActiveMainTab] = useState('policies');

    // Set initial selected policy when policies load
    useEffect(() => {
        if (policies.length > 0 && !selectedPolicy) {
            setSelectedPolicy(policies[0]);
        }
    }, [policies, selectedPolicy]);

    // Load late policies from localStorage
    useEffect(() => {
        loadLatePoliciesFromStorage();
    }, [loadLatePoliciesFromStorage]);

    const testGradeCalculation = async () => {
        if (!testGrade || !selectedPolicy) return;

        const percentage = parseFloat(testGrade);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            setTestResult({ error: 'Please enter a valid percentage (0-100)' });
            return;
        }

        try {
            const result = await gradeCalculation.mutateAsync({
                percentage,
                policyId: selectedPolicy.id,
                programType: selectedPolicy.programTypes[0]
            });
            setTestResult(result);
        } catch (error) {
            setTestResult({ error: error.message });
        }
    };

    const PolicyCard = ({ policy, isSelected, onClick }) => (
        <div
            className={`p-4 border rounded-lg cursor-pointer transition-all ${isSelected
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{policy.name}</h3>
                <div className="flex gap-1">
                    {policy.isDefault && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Default
                        </span>
                    )}
                    {policy.isActive && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Active
                        </span>
                    )}
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">{policy.description}</p>

            <div className="flex flex-wrap gap-1 mb-3">
                {policy.programTypes?.map(type => (
                    <span key={type} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {type}
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-4 gap-1 text-xs">
                {policy.gradeScale?.slice(0, 4).map((grade, index) => (
                    <div key={index} className="text-center">
                        <div className="font-bold">{grade.letter}</div>
                        <div className="text-gray-500">{grade.minPercentage}%+</div>
                    </div>
                ))}
            </div>
        </div>
    );

    const PolicyPreview = ({ policy }) => {
        if (!policy) return null;

        return (
            <div className="bg-white p-6 rounded-lg border">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{policy.name}</h2>
                        <p className="text-gray-600">{policy.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setEditingPolicy(policy)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit Policy"
                        >
                            <Edit3 size={16} />
                        </button>
                        <button
                            onClick={() => downloadPolicy(policy)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Download Policy"
                        >
                            <Download size={16} />
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-medium mb-3">📊 Grade Scale</h3>
                        <div className="space-y-2">
                            {policy.gradeScale?.map((grade, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg">{grade.letter}</span>
                                        <span className="text-sm text-gray-600">
                                            ({grade.minPercentage}% - {grade.maxPercentage}%)
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        GPA: {grade.gpaPoints}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium mb-3">🧮 Test Calculator</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Test Percentage:
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={testGrade}
                                    onChange={(e) => setTestGrade(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter percentage (0-100)"
                                />
                            </div>
                            <button
                                onClick={testGradeCalculation}
                                disabled={!testGrade || !selectedPolicy}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Calculator size={16} />
                                Calculate Grade
                            </button>

                            {testResult && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    {testResult.error ? (
                                        <div className="flex items-center gap-2 text-red-600">
                                            <AlertCircle size={16} />
                                            <span>{testResult.error}</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Letter Grade:</span>
                                                <div className="text-xl font-bold">{testResult.data?.letterGrade}</div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">GPA Points:</span>
                                                <div className="font-medium">{testResult.data?.gpaPoints}</div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Status:</span>
                                                <div className={`font-medium ${testResult.data?.passingGrade ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {testResult.data?.passingGrade ? 'Passing' : 'Failing'}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Percentage:</span>
                                                <div className="font-medium">{testResult.data?.percentage}%</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <h4 className="font-medium mb-2">📊 Program Types</h4>
                            <div className="flex flex-wrap gap-2">
                                {policy.programTypes?.map(type => (
                                    <span key={type} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                        {gradingPolicyService.getSupportedProgramTypes()
                                            .find(pt => pt.value === type)?.label || type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const downloadPolicy = (policy) => {
        const dataStr = JSON.stringify(policy, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `${policy.name.replace(/\s+/g, '-').toLowerCase()}-policy.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const LatePolicyManager = () => {
        const availableLatePolicies = [
            DEFAULT_LATE_POLICY,
            ...customLatePolicies
        ];

        const handleEditLatePolicy = (policy) => {
            setEditingLatePolicy({ ...policy });
            setShowLatePolicyForm(true);
        };

        const handleSaveLatePolicy = (policyData) => {
            if (editingLatePolicy?.id && editingLatePolicy.id !== 'default') {
                updateCustomLatePolicy(editingLatePolicy.id, policyData);
            } else {
                saveCustomLatePolicy(policyData);
            }
            setShowLatePolicyForm(false);
            setEditingLatePolicy(null);
        };

        const handleDeleteLatePolicy = (policyId) => {
            if (window.confirm('Are you sure you want to delete this late policy?')) {
                deleteCustomLatePolicy(policyId);
                if (currentLatePolicy?.id === policyId) {
                    setCurrentLatePolicy(DEFAULT_LATE_POLICY);
                }
            }
        };

        return (
            <div className="bg-white p-6 rounded-lg border">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Clock className="text-orange-600" />
                            Late Policy Manager
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Configure penalty multipliers for late submissions
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingLatePolicy(null);
                            setShowLatePolicyForm(true);
                        }}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        New Late Policy
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableLatePolicies.map(policy => (
                        <div
                            key={policy.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${currentLatePolicy?.id === policy.id
                                    ? 'border-orange-500 bg-orange-50 shadow-md'
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                }`}
                            onClick={() => setCurrentLatePolicy(policy)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-800">{policy.name}</h3>
                                <div className="flex gap-1">
                                    {currentLatePolicy?.id === policy.id && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                            Active
                                        </span>
                                    )}
                                    {policy.id === 'default' && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            Default
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{policy.description}</p>

                            <div className="space-y-1 text-xs">
                                {Object.entries(policy.levels).slice(0, 3).map(([key, level]) => (
                                    <div key={key} className="flex justify-between">
                                        <span style={{ color: level.color }}>{level.name}</span>
                                        <span className="font-medium">×{level.multiplier}</span>
                                    </div>
                                ))}
                            </div>

                            {policy.id !== 'default' && (
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditLatePolicy(policy);
                                        }}
                                        className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteLatePolicy(policy.id);
                                        }}
                                        className="flex-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {showLatePolicyForm && (
                    <LatePolicyForm
                        policy={editingLatePolicy || {
                            name: '',
                            description: '',
                            levels: {
                                none: { name: 'On Time', multiplier: 1, description: 'No penalty', color: '#10b981' },
                                level1: { name: '1-2 Days Late', multiplier: 0.9, description: '10% penalty', color: '#f59e0b' }
                            }
                        }}
                        onSave={handleSaveLatePolicy}
                        onCancel={() => {
                            setShowLatePolicyForm(false);
                            setEditingLatePolicy(null);
                        }}
                    />
                )}
            </div>
        );
    };

    const LatePolicyForm = ({ policy, onSave, onCancel }) => {
        const [formData, setFormData] = useState(policy);

        const addLevel = () => {
            const key = `level_${Date.now()}`;
            setFormData(prev => ({
                ...prev,
                levels: { ...prev.levels, [key]: { name: '', multiplier: 1, description: '', color: '#ea580c' } }
            }));
        };

        const updateLevel = (key, field, value) => {
            setFormData(prev => ({
                ...prev,
                levels: {
                    ...prev.levels,
                    [key]: { ...prev.levels[key], [field]: field === 'multiplier' ? parseFloat(value) || 0 : value }
                }
            }));
        };

        const removeLevel = (key) => {
            setFormData(prev => {
                const updated = { ...prev.levels };
                delete updated[key];
                return { ...prev, levels: updated };
            });
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{formData.id ? 'Edit' : 'Create'} Late Policy</h2>
                        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Policy Name</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="e.g., Standard Late Policy"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                rows="2"
                                placeholder="Describe this late policy..."
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-medium text-gray-700">Late Levels</label>
                                <button
                                    onClick={addLevel}
                                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm flex items-center gap-1"
                                >
                                    <Plus size={14} />
                                    Add Level
                                </button>
                            </div>

                            <div className="space-y-3">
                                {Object.entries(formData.levels || {}).map(([key, level]) => (
                                    <div key={key} className="p-3 border border-gray-200 rounded-lg">
                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Level Name</label>
                                                <input
                                                    type="text"
                                                    value={level.name || ''}
                                                    onChange={(e) => updateLevel(key, 'name', e.target.value)}
                                                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                                                    placeholder="e.g., 1-2 Days Late"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Multiplier</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="1"
                                                    step="0.01"
                                                    value={level.multiplier || ''}
                                                    onChange={(e) => updateLevel(key, 'multiplier', e.target.value)}
                                                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                                                    placeholder="0.9"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                                <input
                                                    type="text"
                                                    value={level.description || ''}
                                                    onChange={(e) => updateLevel(key, 'description', e.target.value)}
                                                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                                                    placeholder="e.g., 10% penalty"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={level.color || '#ea580c'}
                                                        onChange={(e) => updateLevel(key, 'color', e.target.value)}
                                                        className="w-8 h-8 border border-gray-300 rounded"
                                                    />
                                                    {key !== 'none' && (
                                                        <button
                                                            onClick={() => removeLevel(key)}
                                                            className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => onSave(formData)}
                            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                        >
                            <Save size={16} />
                            Save Policy
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // New Percentage Calculators Component with its own state
    const PercentageCalculators = () => {
        // Calculator state moved to this component to prevent parent re-renders
        const [calc1Number, setCalc1Number] = useState('');
        const [calc1Percentage, setCalc1Percentage] = useState('');
        const [calc1Result, setCalc1Result] = useState(null);

        const [calc2Number1, setCalc2Number1] = useState('');
        const [calc2Number2, setCalc2Number2] = useState('');
        const [calc2Result, setCalc2Result] = useState(null);

        const [calc3Original, setCalc3Original] = useState('');
        const [calc3New, setCalc3New] = useState('');
        const [calc3Result, setCalc3Result] = useState(null);

        // Input handlers - now scoped to this component only
        const handleCalc1PercentageChange = useCallback((e) => {
            setCalc1Percentage(e.target.value);
        }, []);

        const handleCalc1NumberChange = useCallback((e) => {
            setCalc1Number(e.target.value);
        }, []);

        const handleCalc2Number1Change = useCallback((e) => {
            setCalc2Number1(e.target.value);
        }, []);

        const handleCalc2Number2Change = useCallback((e) => {
            setCalc2Number2(e.target.value);
        }, []);

        const handleCalc3OriginalChange = useCallback((e) => {
            setCalc3Original(e.target.value);
        }, []);

        const handleCalc3NewChange = useCallback((e) => {
            setCalc3New(e.target.value);
        }, []);

        // Calculator functions - now scoped to this component only
        const calculatePercentageOfNumber = useCallback(() => {
            const number = parseFloat(calc1Number);
            const percentage = parseFloat(calc1Percentage);

            if (isNaN(number) || isNaN(percentage)) {
                setCalc1Result({ error: 'Please enter valid numbers' });
                return;
            }

            const result = (percentage / 100) * number;
            setCalc1Result({
                result: result,
                calculation: `${percentage}% of ${number} = ${result}`,
                formula: `(${percentage} ÷ 100) × ${number} = ${result}`
            });
        }, [calc1Number, calc1Percentage]);

        const calculateNumberAsPercentage = useCallback(() => {
            const number1 = parseFloat(calc2Number1);
            const number2 = parseFloat(calc2Number2);

            if (isNaN(number1) || isNaN(number2) || number2 === 0) {
                setCalc2Result({ error: 'Please enter valid numbers (second number cannot be zero)' });
                return;
            }

            const result = (number1 / number2) * 100;
            setCalc2Result({
                result: result,
                calculation: `${number1} is ${result.toFixed(2)}% of ${number2}`,
                formula: `(${number1} ÷ ${number2}) × 100 = ${result.toFixed(2)}%`
            });
        }, [calc2Number1, calc2Number2]);

        const calculatePercentageChange = useCallback(() => {
            const original = parseFloat(calc3Original);
            const newValue = parseFloat(calc3New);

            if (isNaN(original) || isNaN(newValue) || original === 0) {
                setCalc3Result({ error: 'Please enter valid numbers (original number cannot be zero)' });
                return;
            }

            const change = newValue - original;
            const percentageChange = (change / original) * 100;
            const isIncrease = change > 0;

            setCalc3Result({
                result: Math.abs(percentageChange),
                change: change,
                isIncrease: isIncrease,
                calculation: `${isIncrease ? 'Increase' : 'Decrease'} of ${Math.abs(percentageChange).toFixed(2)}%`,
                formula: `((${newValue} - ${original}) ÷ ${original}) × 100 = ${percentageChange.toFixed(2)}%`,
                details: {
                    original: original,
                    new: newValue,
                    difference: change,
                    percentageChange: percentageChange
                }
            });
        }, [calc3Original, calc3New]);

        return (
            <div className="space-y-8">
                {/* Calculator 1: Percentage of a Number */}
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Percent className="text-blue-600" />
                        Percentage of a Number
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Calculate what percentage of a number equals. For example: What is 25% of 200?
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Percentage (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={calc1Percentage}
                                    onChange={handleCalc1PercentageChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter percentage (e.g., 25)"
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={calc1Number}
                                    onChange={handleCalc1NumberChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter number (e.g., 200)"
                                    autoComplete="off"
                                />
                            </div>
                            <button
                                onClick={calculatePercentageOfNumber}
                                disabled={!calc1Percentage || !calc1Number}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Calculator size={16} />
                                Calculate
                            </button>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            {calc1Result ? (
                                calc1Result.error ? (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle size={16} />
                                        <span>{calc1Result.error}</span>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600">
                                                {calc1Result.result}
                                            </div>
                                            <div className="text-lg text-gray-700 mt-2">
                                                {calc1Result.calculation}
                                            </div>
                                        </div>
                                        <div className="border-t pt-3">
                                            <h4 className="font-medium text-gray-700 mb-1">Formula:</h4>
                                            <div className="text-sm text-gray-600 font-mono bg-white p-2 rounded">
                                                {calc1Result.formula}
                                            </div>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="text-center text-gray-500">
                                    <Calculator className="mx-auto h-12 w-12 mb-2 opacity-50" />
                                    <p>Enter values and click Calculate to see the result</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Calculator 2: One Number as Percentage of Another */}
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Percent className="text-green-600" />
                        One Number as Percentage of Another
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Find what percentage one number is of another. For example: What percentage is 50 of 200?
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Number (Part)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={calc2Number1}
                                    onChange={handleCalc2Number1Change}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter first number (e.g., 50)"
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Second Number (Total)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={calc2Number2}
                                    onChange={handleCalc2Number2Change}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter second number (e.g., 200)"
                                    autoComplete="off"
                                />
                            </div>
                            <button
                                onClick={calculateNumberAsPercentage}
                                disabled={!calc2Number1 || !calc2Number2}
                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Calculator size={16} />
                                Calculate
                            </button>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            {calc2Result ? (
                                calc2Result.error ? (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle size={16} />
                                        <span>{calc2Result.error}</span>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-600">
                                                {calc2Result.result.toFixed(2)}%
                                            </div>
                                            <div className="text-lg text-gray-700 mt-2">
                                                {calc2Result.calculation}
                                            </div>
                                        </div>
                                        <div className="border-t pt-3">
                                            <h4 className="font-medium text-gray-700 mb-1">Formula:</h4>
                                            <div className="text-sm text-gray-600 font-mono bg-white p-2 rounded">
                                                {calc2Result.formula}
                                            </div>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="text-center text-gray-500">
                                    <Calculator className="mx-auto h-12 w-12 mb-2 opacity-50" />
                                    <p>Enter values and click Calculate to see the result</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Calculator 3: Percentage Increase/Decrease */}
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Percent className="text-purple-600" />
                        Percentage Increase/Decrease
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Calculate the percentage change between two numbers. For example: What's the percentage increase from 100 to 150?
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Original Number
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={calc3Original}
                                    onChange={handleCalc3OriginalChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter original number (e.g., 100)"
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Number
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={calc3New}
                                    onChange={handleCalc3NewChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter new number (e.g., 150)"
                                    autoComplete="off"
                                />
                            </div>
                            <button
                                onClick={calculatePercentageChange}
                                disabled={!calc3Original || !calc3New}
                                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Calculator size={16} />
                                Calculate
                            </button>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            {calc3Result ? (
                                calc3Result.error ? (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle size={16} />
                                        <span>{calc3Result.error}</span>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="text-center">
                                            <div className={`text-3xl font-bold ${calc3Result.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                                                {calc3Result.isIncrease ? '+' : '-'}{calc3Result.result.toFixed(2)}%
                                            </div>
                                            <div className="text-lg text-gray-700 mt-2">
                                                {calc3Result.calculation}
                                            </div>
                                        </div>
                                        <div className="border-t pt-3 space-y-2">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Original:</span>
                                                    <div className="font-medium">{calc3Result.details.original}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">New:</span>
                                                    <div className="font-medium">{calc3Result.details.new}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Difference:</span>
                                                    <div className={`font-medium ${calc3Result.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                                                        {calc3Result.change > 0 ? '+' : ''}{calc3Result.change}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Change:</span>
                                                    <div className={`font-medium ${calc3Result.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                                                        {calc3Result.details.percentageChange.toFixed(2)}%
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border-t pt-2">
                                                <h4 className="font-medium text-gray-700 mb-1">Formula:</h4>
                                                <div className="text-sm text-gray-600 font-mono bg-white p-2 rounded">
                                                    {calc3Result.formula}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="text-center text-gray-500">
                                    <Calculator className="mx-auto h-12 w-12 mb-2 opacity-50" />
                                    <p>Enter values and click Calculate to see the result</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading grading policies...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Settings className="text-blue-600" />
                            Policy Manager
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage grading policies and use percentage calculators
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Tab Navigation */}
            <div className="mb-6">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveMainTab('policies')}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-all ${activeMainTab === 'policies'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Settings size={16} />
                            Grading Policies
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveMainTab('calculators')}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-all ${activeMainTab === 'calculators'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Calculator size={16} />
                            Percentage Calculators
                        </div>
                    </button>
                </div>
            </div>

            {/* Content based on active tab */}
            {activeMainTab === 'policies' ? (
                <div>
                    <div className="mb-6">
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={16} />
                            New Policy
                        </button>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Policy List */}
                        <div className="lg:col-span-1">
                            <h2 className="text-lg font-semibold mb-4">Available Policies</h2>
                            <div className="space-y-3">
                                {policies.map(policy => (
                                    <PolicyCard
                                        key={policy.id}
                                        policy={policy}
                                        isSelected={selectedPolicy?.id === policy.id}
                                        onClick={() => setSelectedPolicy(policy)}
                                    />
                                ))}
                                {policies.length === 0 && (
                                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                                        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-600">No policies found</p>
                                        <p className="text-sm text-gray-500">Create your first grading policy</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Policy Preview */}
                        <div className="lg:col-span-2">
                            {selectedPolicy ? (
                                <PolicyPreview policy={selectedPolicy} />
                            ) : (
                                <div className="bg-white p-12 rounded-lg border border-gray-200">
                                    <div className="text-center">
                                        <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">Select a Policy</h3>
                                        <p className="text-gray-600">Choose a policy from the list to view details and test calculations</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Late Policy Manager Section */}
                    <div className="mt-12">
                        <LatePolicyManager />
                    </div>

                    {/* Development Mode Notice */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-800">
                                <AlertCircle size={16} />
                                <span className="font-medium">Development Mode</span>
                            </div>
                            <p className="text-sm text-yellow-700 mt-1">
                                Currently using local policies. When you deploy to Hostinger, this will connect to your policy management API.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                /* Percentage Calculators Tab */
                <PercentageCalculators />
            )}
        </div>
    );
};

export default GradingPolicyManager;