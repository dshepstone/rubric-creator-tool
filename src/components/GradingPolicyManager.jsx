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
    Copy
} from 'lucide-react';
import gradingPolicyService from '../services/gradingPolicyService';
import { useGradingPolicies, useGradeCalculation } from '../hooks/useGradingPolicies';

const GradingPolicyManager = () => {
    // Use TanStack Query hooks instead of manual state
    const { data: policies = [], isLoading: loading } = useGradingPolicies();
    const gradeCalculation = useGradeCalculation();

    // Local component state
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [testGrade, setTestGrade] = useState('');
    const [testResult, setTestResult] = useState(null);

    // Set initial selected policy when policies load
    useEffect(() => {
        if (policies.length > 0 && !selectedPolicy) {
            setSelectedPolicy(policies[0]);
        }
    }, [policies, selectedPolicy]);

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

export default GradingPolicyManager;
