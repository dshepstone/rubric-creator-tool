// src/components/ClassListManager.js
import React, { useState, useRef } from 'react';
import { parseExcelFile, validateStudentData } from '../utils/excelParser';
import { useAssessment } from './SharedContext';
import {
    Upload, Users, GraduationCap, FileSpreadsheet, CheckCircle, AlertCircle,
    ArrowRight, Edit3, Download, Trash2, RefreshCw, BookOpen, UserCheck,
    Clock, BarChart3, Target, Award, FileText, PlayCircle, Pause
} from 'lucide-react';

const ClassListManager = () => {
    // Pull classList, currentStudent & helpers from context
    const {
        activeTab,
        setActiveTab,
        sharedRubric,
        gradingData,
        setGradingData,
        updateStudentInfo,
        updateCourseInfo,
        updateAssignmentInfo,
        clearGradingFormData,
        classList,
        setClassList,
        setCurrentStudent,
        gradingSession,
        setGradingSession,
        initializeGradingSession,
        hasDraft,
        loadDraft
    } = useAssessment();

    const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
    const [batchOperations, setBatchOperations] = useState({
        selectedStudents: [],
        exportQueue: [],
        isProcessing: false
    });
    const [loading, setLoading] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const fileInputRef = useRef(null);
    // Handle Excel file import
    const handleExcelImport = async (file) => {
        if (!file) return;
        setLoading(true);
        setImportResult(null);

        try {
            const result = await parseExcelFile(file);
            if (result.success) {
                const validation = validateStudentData(result.students);
                const classData = {
                    ...result,
                    validation,
                    fileName: file.name,
                    fileSize: file.size,
                    importTime: new Date().toISOString(),
                    gradingProgress: result.students.map(student => ({
                        studentId: student.id,
                        studentName: student.name,
                        status: 'pending', // pending, in-progress, completed
                        grade: null,
                        lastModified: null,
                        timeSpent: 0
                    }))
                };

                setClassList(classData);
                setImportResult(result);

                // Auto-populate course information from Excel
                if (result.courseMetadata) {
                    updateCourseInfo({
                        code: result.courseMetadata.courseCode || '',
                        name: result.courseMetadata.courseName || '',
                        instructor: result.courseMetadata.professors || '',
                        term: result.courseMetadata.term || ''
                    });
                }
            } else {
                setImportResult(result);
            }
        } catch (error) {
            setImportResult({
                success: false,
                error: error.message,
                students: []
            });
        }
        setLoading(false);
    };

    // Start batch grading session
    const startGradingSession = () => {
        if (!classList || !classList.students.length) return;
        // Use the new initialization function
        const success = initializeGradingSession(classList);
        if (success) {
            // Switch to grading tool
            setActiveTab('grading-tool');
        }
    };

    // Load student information into grading form
    const loadStudentForGrading = (student) => {
        updateStudentInfo({
            name: student.name,
            id: student.id,
            email: student.email
        });

        // Update assignment info if we have shared rubric
        if (sharedRubric) {
            updateAssignmentInfo({
                name: sharedRubric.assignmentInfo?.title || '',
                maxPoints: sharedRubric.assignmentInfo?.totalPoints || 100
            });
        }

        // Switch to grading tool
        setActiveTab('grading-tool');
    };

    // Navigate to next student
    const nextStudent = () => {
        if (!classList || currentStudentIndex >= classList.students.length - 1) return;

        // Mark current student as completed
        const updatedProgress = [...classList.gradingProgress];
        updatedProgress[currentStudentIndex] = {
            ...updatedProgress[currentStudentIndex],
            status: 'completed',
            lastModified: new Date().toISOString()
        };

        setClassList(prev => ({
            ...prev,
            gradingProgress: updatedProgress
        }));

        // Move to next student
        const nextIndex = currentStudentIndex + 1;
        setCurrentStudentIndex(nextIndex);

        if (nextIndex < classList.students.length) {
            loadStudentForGrading(classList.students[nextIndex]);

            // Update grading session
            setGradingSession(prev => ({
                ...prev,
                gradedStudents: [...prev.gradedStudents, classList.students[currentStudentIndex].id],
                currentStudent: classList.students[nextIndex]
            }));
        } else {
            // End of session
            setGradingSession(prev => ({
                ...prev,
                active: false,
                gradedStudents: [...prev.gradedStudents, classList.students[currentStudentIndex].id]
            }));
        }
    };

    // Navigate to previous student
    const previousStudent = () => {
        if (currentStudentIndex <= 0) return;

        const prevIndex = currentStudentIndex - 1;
        setCurrentStudentIndex(prevIndex);
        loadStudentForGrading(classList.students[prevIndex]);

        setGradingSession(prev => ({
            ...prev,
            currentStudent: classList.students[prevIndex]
        }));
    };

    // Jump to specific student
    const jumpToStudent = (index) => {
        if (!classList || index < 0 || index >= classList.students.length) return;

        setCurrentStudentIndex(index);
        loadStudentForGrading(classList.students[index]);

        setGradingSession(prev => ({
            ...prev,
            currentStudent: classList.students[index]
        }));
    };

    // Calculate grading progress
    const getGradingProgress = () => {
        if (!classList) return { completed: 0, total: 0, percentage: 0 };

        const completed = classList.gradingProgress?.filter(p => p.status === 'completed').length || 0;
        const total = classList.students.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    };

    // Export class grades
    const exportClassGrades = () => {
        if (!classList) return;

        const csvContent = [
            ['Student ID', 'Student Name', 'Email', 'Program', 'Status', 'Grade', 'Last Modified'],
            ...classList.students.map((student, index) => {
                const progress = classList.gradingProgress[index];
                return [
                    student.id,
                    student.name,
                    student.email,
                    student.program,
                    progress?.status || 'pending',
                    progress?.grade || 'Not Graded',
                    progress?.lastModified || 'Never'
                ];
            })
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${classList.courseMetadata?.courseCode || 'class'}_grades_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const progress = getGradingProgress();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-lg shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Class List Manager</h1>
                            <p className="text-indigo-100">Import, manage, and grade entire classes efficiently</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {classList && (
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{classList.students.length}</div>
                                    <div className="text-sm text-indigo-200">Students</div>
                                </div>
                            )}
                            <Users size={48} className="text-indigo-200" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-b-lg shadow-lg">
                    {/* Import Section */}
                    {!classList && (
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <FileSpreadsheet size={64} className="mx-auto mb-4 text-gray-400" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Import Class List</h2>
                                <p className="text-gray-600">Upload your institutional Excel file to get started</p>
                            </div>

                            <div className="max-w-lg mx-auto">
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg font-medium mb-2">
                                        {loading ? 'Processing...' : 'Drop Excel file here or click to browse'}
                                    </p>
                                    <p className="text-sm text-gray-500">Supports .xls and .xlsx files</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xls,.xlsx"
                                        onChange={(e) => handleExcelImport(e.target.files[0])}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                </div>

                                {importResult && !importResult.success && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-red-800">
                                            <AlertCircle size={20} />
                                            <span className="font-medium">Import Failed</span>
                                        </div>
                                        <p className="mt-1 text-red-700">{importResult.error}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Class Management Dashboard */}
                    {classList && (
                        <div className="p-6">
                            {/* Course Overview */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                {/* Course Info Card */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <BookOpen className="text-blue-600" size={24} />
                                        <h3 className="text-lg font-semibold text-blue-800">Course Information</h3>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Code:</strong> {classList.courseMetadata?.courseCode || 'N/A'}</div>
                                        <div><strong>Name:</strong> {classList.courseMetadata?.courseName || 'N/A'}</div>
                                        <div><strong>Section:</strong> {classList.courseMetadata?.section || 'N/A'}</div>
                                        <div><strong>Campus:</strong> {classList.courseMetadata?.campus || 'N/A'}</div>
                                        <div><strong>Term:</strong> {classList.courseMetadata?.term || 'N/A'}</div>
                                    </div>
                                </div>

                                {/* Progress Card */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <BarChart3 className="text-green-600" size={24} />
                                        <h3 className="text-lg font-semibold text-green-800">Grading Progress</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Completed</span>
                                            <span className="text-lg font-bold text-green-600">
                                                {progress.completed}/{progress.total}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${progress.percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-center text-sm text-green-600 font-medium">
                                            {progress.percentage}% Complete
                                        </div>
                                    </div>
                                </div>

                                {/* Session Status Card */}
                                <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Clock className="text-purple-600" size={24} />
                                        <h3 className="text-lg font-semibold text-purple-800">Session Status</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            {gradingSession.active ? (
                                                <>
                                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="text-sm font-medium text-green-600">Active Session</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                                    <span className="text-sm font-medium text-gray-600">No Active Session</span>
                                                </>
                                            )}
                                        </div>
                                        {gradingSession.active && gradingSession.currentStudent && (
                                            <div className="text-sm">
                                                <div><strong>Current:</strong> {gradingSession.currentStudent.name}</div>
                                                <div><strong>ID:</strong> {gradingSession.currentStudent.id}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-4 mb-8">
                                {!gradingSession.active ? (
                                    <button
                                        onClick={startGradingSession}
                                        disabled={!sharedRubric}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <PlayCircle size={20} />
                                        Start Batch Grading
                                    </button>
                                ) : (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setGradingSession(prev => ({ ...prev, active: false }))}
                                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium shadow-md transition-all"
                                        >
                                            <Pause size={20} />
                                            Pause Session
                                        </button>
                                        <button
                                            onClick={previousStudent}
                                            disabled={currentStudentIndex === 0}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 font-medium shadow-md transition-all disabled:opacity-50"
                                        >
                                            ← Previous
                                        </button>
                                        <button
                                            onClick={nextStudent}
                                            disabled={currentStudentIndex >= classList.students.length - 1}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 font-medium shadow-md transition-all disabled:opacity-50"
                                        >
                                            Next →
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={exportClassGrades}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium shadow-md transition-all"
                                >
                                    <Download size={20} />
                                    Export Grades
                                </button>

                                <button
                                    onClick={() => {
                                        setClassList(null);
                                        setImportResult(null);
                                        setGradingSession({ active: false, startTime: null, gradedStudents: [], totalStudents: 0, currentStudent: null });
                                        setCurrentStudentIndex(0);
                                    }}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium shadow-md transition-all"
                                >
                                    <RefreshCw size={20} />
                                    New Import
                                </button>
                            </div>

                            {/* Rubric Status */}
                            {!sharedRubric && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-center gap-2 text-yellow-800">
                                        <AlertCircle size={20} />
                                        <span className="font-medium">No Active Rubric</span>
                                    </div>
                                    <p className="mt-1 text-yellow-700">
                                        Create or load a rubric before starting batch grading.
                                        <button
                                            onClick={() => setActiveTab('rubric-creator')}
                                            className="ml-2 text-yellow-800 underline hover:text-yellow-900"
                                        >
                                            Go to Rubric Creator
                                        </button>
                                    </p>
                                </div>
                            )}

                            {/* Student List Table */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <Users size={20} />
                                        Student List ({classList.students.length})
                                    </h3>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {classList.students.map((student, index) => {
                                                const progress = classList.gradingProgress[index];
                                                const isCurrentStudent = gradingSession.active && index === gradingSession.currentStudentIndex;
                                                const studentHasDraft = hasDraft(student.id);
                                                return (
                                                    <tr
                                                        key={student.id}
                                                        className={`${isCurrentStudent ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'} transition-colors`}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                {progress?.status === 'completed' ? (
                                                                    <>
                                                                        <CheckCircle size={16} className="text-green-500" />
                                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completed</span>
                                                                    </>
                                                                ) : progress?.status === 'in-progress' ? (
                                                                    <>
                                                                        <Clock size={16} className="text-yellow-500" />
                                                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">In Progress</span>
                                                                    </>
                                                                ) : studentHasDraft ? (
                                                                    <>
                                                                        <FileText size={16} className="text-blue-500" />
                                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Draft Saved</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Pending</span>
                                                                    </>
                                                                )}
                                                                {isCurrentStudent && (
                                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">Current</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {student.id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {student.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {student.email}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {student.program}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button
                                                                onClick={() => {
                                                                    setCurrentStudent(student);
                                                                    // Load draft if it exists, otherwise start fresh
                                                                    if (studentHasDraft) {
                                                                        const draft = loadDraft(student.id);
                                                                        if (draft) {
                                                                            setGradingData(draft);
                                                                        }
                                                                    }
                                                                    setActiveTab('grading-tool');
                                                                }}
                                                                className={`px-3 py-1 rounded transition-colors text-sm font-medium ${studentHasDraft
                                                                        ? 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                                                                        : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                                                                    }`}
                                                            >
                                                                {studentHasDraft ? 'Continue Draft' : 'Grade'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Import Summary */}
                            <div className="mt-8 bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Import Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">File:</span>
                                        <div className="font-medium">{classList.fileName}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Import Date:</span>
                                        <div className="font-medium">{new Date(classList.importTime).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Data Quality:</span>
                                        <div className="font-medium">{classList.validation?.validationScore || 0}%</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Total Students:</span>
                                        <div className="font-medium">{classList.students.length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassListManager;