// Grading Policy Manager Component
// File: src/components/GradingPolicyManager.jsx

import React, { useState, useEffect } from 'react';
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
    Clock
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
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                            title="Download Policy"
                        >
                            <Download size={16} />
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-3">📋 Grade Scale</h3>
                        <div className="space-y-2">
                            {policy.gradeScale?.map((grade, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg w-8">{grade.letter}</span>
                                        <span className="text-sm text-gray-600">
                                            {grade.minPercentage}% - {grade.maxPercentage}%
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">GPA: {grade.gpa}</div>
                                        <div className={`text-xs ${grade.passingGrade ? 'text-green-600' : 'text-red-600'}`}>
                                            {grade.passingGrade ? 'Passing' : 'Failing'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-3">🧮 Grade Calculator</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter Percentage (0-100)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={testGrade}
                                        onChange={(e) => setTestGrade(e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-lg"
                                        placeholder="85"
                                    />
                                    <button
                                        onClick={testGradeCalculation}
                                        disabled={gradeCalculation.isPending}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {gradeCalculation.isPending ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Calculator size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {testResult && (
                                <div className={`p-4 rounded-lg ${testResult.error
                                    ? 'bg-red-50 border border-red-200'
                                    : 'bg-green-50 border border-green-200'
                                    }`}>
                                    {testResult.error ? (
                                        <div className="flex items-center gap-2 text-red-800">
                                            <AlertCircle size={16} />
                                            <span>{testResult.error}</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-green-800">
                                                <CheckCircle size={16} />
                                                <span className="font-medium">Grade Calculated</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Letter Grade:</span>
                                                    <div className="font-bold text-lg">{testResult.data?.letter}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">GPA:</span>
                                                    <div className="font-bold text-lg">{testResult.data?.gpa}</div>
                                                </div>
                                                <div>
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
                            Grading Policy Manager
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage and preview dynamic grading scales for different program types
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        New Policy
                    </button>
                </div>
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

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-xl w-full p-6 overflow-y-auto max-h-[90vh]">
                <h2 className="text-lg font-bold mb-4">{formData.id ? 'Edit Late Policy' : 'New Late Policy'}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Levels</span>
                            <button onClick={addLevel} className="text-sm text-blue-600">Add Level</button>
                        </div>
                        <div className="space-y-3">
                            {Object.entries(formData.levels).map(([levelKey, level]) => (
                                <div key={levelKey} className="border p-2 rounded">
                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={level.name}
                                            onChange={(e) => updateLevel(levelKey, 'name', e.target.value)}
                                            className="p-1 border rounded"
                                            placeholder="Level Name"
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={level.multiplier}
                                            onChange={(e) => updateLevel(levelKey, 'multiplier', e.target.value)}
                                            className="p-1 border rounded"
                                            placeholder="Multiplier"
                                        />
                                        <input
                                            type="text"
                                            value={level.color}
                                            onChange={(e) => updateLevel(levelKey, 'color', e.target.value)}
                                            className="p-1 border rounded"
                                            placeholder="#ea580c"
                                        />
                                        <button onClick={() => removeLevel(levelKey)} className="text-red-600 text-sm">Remove</button>
                                    </div>
                                    <textarea
                                        value={level.description}
                                        onChange={(e) => updateLevel(levelKey, 'description', e.target.value)}
                                        className="w-full p-1 border rounded text-sm"
                                        rows={2}
                                        placeholder="Description"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                </div>
            </div>
        </div>
    );
};

const LatePolicyManager = () => {
    const {
        currentLatePolicy,
        setCurrentLatePolicy,
        customLatePolicies,
        saveCustomLatePolicy,
        updateCustomLatePolicy,
        deleteCustomLatePolicy
    } = useAssessment();

    const [showForm, setShowForm] = useState(false);
    const [formPolicy, setFormPolicy] = useState(null);

    const allPolicies = [DEFAULT_LATE_POLICY, ...(customLatePolicies || [])];

    const startCreate = () => {
        setFormPolicy({ id: null, name: '', description: '', levels: { none: { name: 'On Time', multiplier: 1, description: '', color: '#16a34a' } } });
        setShowForm(true);
    };

    const startEdit = (policy) => {
        setFormPolicy({ ...policy });
        setShowForm(true);
    };

    const handleSave = (policy) => {
        if (policy.id) {
            updateCustomLatePolicy(policy.id, policy);
            if (currentLatePolicy?.id === policy.id) setCurrentLatePolicy(policy);
        } else {
            const saved = saveCustomLatePolicy(policy);
            setCurrentLatePolicy(saved);
        }
        setShowForm(false);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock /> Late Policies
            </h2>
            <div className="space-y-3">
                {allPolicies.map(policy => (
                    <div key={policy.id} className="p-3 border rounded flex justify-between items-start">
                        <div>
                            <div className="font-medium">{policy.name}</div>
                            <div className="text-sm text-gray-600">{policy.description}</div>
                            {currentLatePolicy?.id === policy.id && (
                                <span className="text-green-600 text-xs">Active</span>
                            )}
                        </div>
                        <div className="flex gap-2 text-sm">
                            <button onClick={() => setCurrentLatePolicy(policy)} className="text-blue-600">Set Active</button>
                            {policy.id !== DEFAULT_LATE_POLICY.id && (
                                <>
                                    <button onClick={() => startEdit(policy)} className="text-indigo-600">Edit</button>
                                    <button onClick={() => deleteCustomLatePolicy(policy.id)} className="text-red-600">Delete</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={startCreate} className="mt-4 px-4 py-2 bg-green-600 text-white rounded">New Late Policy</button>

            {showForm && (
                <LatePolicyForm
                    policy={formPolicy}
                    onSave={handleSave}
                    onCancel={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default GradingPolicyManager;
