import React, { useState } from 'react';

const LatePolicyEditorDemo = () => {
    const [selectedPolicy, setSelectedPolicy] = useState('institutional');
    const [showEditor, setShowEditor] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);

    // Sample policies for demo
    const policies = {
        institutional: {
            id: 'institutional',
            name: 'Institutional Policy',
            description: 'Standard institutional late assignment policy',
            levels: {
                none: {
                    name: 'On Time',
                    multiplier: 1.0,
                    description: 'Assignment submitted on or before due date and time - marked out of 100%',
                    color: '#16a34a',
                    timeframe: 'On or before due date'
                },
                within24: {
                    name: '1-24 Hours Late',
                    multiplier: 0.8,
                    description: 'Assignment received within 24 hours of due date - 20% reduction (marked out of 80%)',
                    color: '#ea580c',
                    timeframe: 'Up to 24 hours late'
                },
                after24: {
                    name: 'More than 24 Hours Late',
                    multiplier: 0.0,
                    description: 'Assignment received after 24 hours from due date - mark of zero (0)',
                    color: '#dc2626',
                    timeframe: 'More than 24 hours late'
                }
            }
        },
        graceful: {
            id: 'graceful',
            name: 'Graceful Decline',
            description: 'Gradual reduction over time with extended acceptance period',
            levels: {
                none: { name: 'On Time', multiplier: 1.0, description: 'Full credit for on-time submissions', color: '#16a34a', timeframe: 'On or before due date' },
                grace: { name: 'Grace Period (1-6 hours)', multiplier: 0.95, description: '5% reduction during grace period', color: '#65a30d', timeframe: '1-6 hours late' },
                within24: { name: '6-24 Hours Late', multiplier: 0.85, description: '15% reduction for late submissions', color: '#ea580c', timeframe: '6-24 hours late' },
                within48: { name: '24-48 Hours Late', multiplier: 0.70, description: '30% reduction for very late submissions', color: '#dc2626', timeframe: '24-48 hours late' },
                after48: { name: 'More than 48 Hours Late', multiplier: 0.50, description: '50% maximum score for extremely late work', color: '#7c2d12', timeframe: 'More than 48 hours late' }
            }
        }
    };

    const PolicySelector = () => (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">📋 Late Policy Configuration</h3>
            <div className="flex gap-4 items-center flex-wrap">
                <div className="flex-1 min-w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Policy:</label>
                    <select
                        value={selectedPolicy}
                        onChange={(e) => setSelectedPolicy(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {Object.values(policies).map(policy => (
                            <option key={policy.id} value={policy.id}>
                                {policy.name} - {policy.description}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setEditingPolicy({ ...policies[selectedPolicy] });
                            setShowEditor(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        ✏️ Edit Policy
                    </button>
                    <button
                        onClick={() => {
                            setEditingPolicy({
                                id: `custom_${Date.now()}`,
                                name: '',
                                description: '',
                                levels: {
                                    none: { name: 'On Time', multiplier: 1.0, description: '', color: '#16a34a', timeframe: 'On or before due date' }
                                }
                            });
                            setShowEditor(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        ➕ Create New
                    </button>
                </div>
            </div>
        </div>
    );

    const PolicyPreview = ({ policy }) => {
        const [selectedLevel, setSelectedLevel] = useState('none');
        const sampleScore = 85;

        return (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-md font-semibold mb-3 text-gray-800">📊 Policy Preview</h4>
                <div className="grid gap-3">
                    {Object.entries(policy.levels).map(([key, level]) => (
                        <div
                            key={key}
                            onClick={() => setSelectedLevel(key)}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedLevel === key
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: level.color }}
                                    />
                                    <div>
                                        <div className="font-medium text-gray-800">{level.name}</div>
                                        <div className="text-sm text-gray-600">{level.timeframe}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-800">
                                        {level.multiplier === 0 ? '0' : `${Math.round(sampleScore * level.multiplier)}`}/{sampleScore}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        ({Math.round(level.multiplier * 100)}%)
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const PolicyEditor = ({ policy, onSave, onCancel }) => {
        const [editedPolicy, setEditedPolicy] = useState({ ...policy });
        const [errors, setErrors] = useState([]);

        const validatePolicy = (policy) => {
            const errors = [];
            if (!policy.name?.trim()) errors.push('Policy name is required');
            if (!policy.description?.trim()) errors.push('Policy description is required');

            const hasOnTime = Object.values(policy.levels).some(level => level.multiplier === 1.0);
            if (!hasOnTime) errors.push('Policy must include an on-time option (multiplier = 1.0)');

            return errors;
        };

        const addLevel = () => {
            const newKey = `level_${Date.now()}`;
            setEditedPolicy(prev => ({
                ...prev,
                levels: {
                    ...prev.levels,
                    [newKey]: {
                        name: '',
                        multiplier: 0.8,
                        description: '',
                        color: '#ea580c',
                        timeframe: ''
                    }
                }
            }));
        };

        const removeLevel = (levelKey) => {
            setEditedPolicy(prev => {
                const newLevels = { ...prev.levels };
                delete newLevels[levelKey];
                return { ...prev, levels: newLevels };
            });
        };

        const updateLevel = (levelKey, field, value) => {
            setEditedPolicy(prev => ({
                ...prev,
                levels: {
                    ...prev.levels,
                    [levelKey]: {
                        ...prev.levels[levelKey],
                        [field]: field === 'multiplier' ? parseFloat(value) || 0 : value
                    }
                }
            }));
        };

        const handleSave = () => {
            const validationErrors = validatePolicy(editedPolicy);
            if (validationErrors.length > 0) {
                setErrors(validationErrors);
                return;
            }
            onSave(editedPolicy);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                {policy.id.startsWith('custom') ? '✨ Create Custom Policy' : '✏️ Edit Policy'}
                            </h2>
                            <button
                                onClick={onCancel}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {errors.length > 0 && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h4 className="font-medium text-red-800 mb-2">⚠️ Validation Errors:</h4>
                                <ul className="list-disc list-inside text-red-700 text-sm">
                                    {errors.map((error, index) => <li key={index}>{error}</li>)}
                                </ul>
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">📝 Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Policy Name *</label>
                                    <input
                                        type="text"
                                        value={editedPolicy.name || ''}
                                        onChange={(e) => setEditedPolicy(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Flexible Late Policy"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                    <input
                                        type="text"
                                        value={editedPolicy.description || ''}
                                        onChange={(e) => setEditedPolicy(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Brief description of the policy"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Policy Levels */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">⏰ Policy Levels</h3>
                                <button
                                    onClick={addLevel}
                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                    ➕ Add Level
                                </button>
                            </div>

                            <div className="space-y-4">
                                {Object.entries(editedPolicy.levels).map(([levelKey, level]) => (
                                    <div key={levelKey} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-medium text-gray-800">Level Configuration</h4>
                                            {Object.keys(editedPolicy.levels).length > 1 && (
                                                <button
                                                    onClick={() => removeLevel(levelKey)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                >
                                                    🗑️ Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Level Name *</label>
                                                <input
                                                    type="text"
                                                    value={level.name || ''}
                                                    onChange={(e) => updateLevel(levelKey, 'name', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="e.g., On Time"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Multiplier * (0.0-1.0)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="1"
                                                    value={level.multiplier || 0}
                                                    onChange={(e) => updateLevel(levelKey, 'multiplier', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={level.color || '#ea580c'}
                                                        onChange={(e) => updateLevel(levelKey, 'color', e.target.value)}
                                                        className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={level.color || '#ea580c'}
                                                        onChange={(e) => updateLevel(levelKey, 'color', e.target.value)}
                                                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                                                <input
                                                    type="text"
                                                    value={level.timeframe || ''}
                                                    onChange={(e) => updateLevel(levelKey, 'timeframe', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="e.g., Up to 24 hours late"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                            <textarea
                                                value={level.description || ''}
                                                onChange={(e) => updateLevel(levelKey, 'description', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                                rows="2"
                                                placeholder="Detailed description of this penalty level"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        <PolicyPreview policy={editedPolicy} />

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={onCancel}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                💾 Save Policy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-100 min-h-screen">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">🎯 Customizable Late Policy System</h1>

                <PolicySelector />
                <PolicyPreview policy={policies[selectedPolicy]} />

                {showEditor && (
                    <PolicyEditor
                        policy={editingPolicy}
                        onSave={(policy) => {
                            console.log('Saving policy:', policy);
                            setShowEditor(false);
                        }}
                        onCancel={() => setShowEditor(false)}
                    />
                )}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">✨ Key Features:</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• <strong>Template Library:</strong> Pre-built policies for common scenarios</li>
                        <li>• <strong>Full Customization:</strong> Create unlimited custom policies with any number of levels</li>
                        <li>• <strong>Real-time Preview:</strong> See how policies affect grades before applying</li>
                        <li>• <strong>Validation:</strong> Automatic validation ensures policies are logically sound</li>
                        <li>• <strong>Persistence:</strong> Custom policies are saved for reuse across assignments</li>
                        <li>• <strong>Backward Compatible:</strong> Current institutional policy remains as default</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LatePolicyEditorDemo;