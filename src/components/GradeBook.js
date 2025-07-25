// GradeBook.jsx - Complete Gradebook Management Component
// File: src/components/GradeBook.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Users, Plus, Edit3, Trash2, Download, Upload, Settings, Save,
    FileText, Calculator, Eye, RotateCcw, CheckCircle, AlertCircle,
    BookOpen, X, Copy, Database, Percent, GraduationCap, ClipboardList,
    TrendingUp, BarChart3, Grid3X3, Filter, Search, SortAsc, SortDesc,
    FileSpreadsheet, Calendar, Clock, Award, Target
} from 'lucide-react';
import { useAssessment } from './SharedContext';
import * as XLSX from 'xlsx';
// NOTE: Adjust the path if your services folder is located elsewhere
import gradingPolicyService from '../services/gradingPolicyService';

const GradeBook = () => {
    const {
        classList,
        setClassList,
        activeTab,
        setActiveTab,
        drafts,
        finalGrades,
    } = useAssessment();

    // Core gradebook state
    const [gradeBookData, setGradeBookData] = useState({
        projects: [],
        students: [],
        grades: {}, // studentId -> projectId -> grade data
        metadata: {
            courseName: '',
            courseCode: '',
            instructor: '',
            term: '',
            created: null,
            lastModified: null,
            gradingPolicy: 'degree'
        }
    });

    // UI state
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [viewMode, setViewMode] = useState('percentage'); // 'percentage', 'letter', 'both'
    const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null });
    const [editingProject, setEditingProject] = useState(null);
    const [projectEditValue, setProjectEditValue] = useState('');

    // Project form state - removed since we have inline editing

    // Statistics state
    const [statistics, setStatistics] = useState({
        classAverage: 0,
        highestGrade: 0,
        lowestGrade: 0,
        passingRate: 0,
        projectAverages: {}
    });

    // File input refs
    const importGradesRef = useRef(null);
    const importGradeBookRef = useRef(null);

    // Initialize gradebook with class list data and default projects
    useEffect(() => {
        if (classList && classList.students) {
            setGradeBookData(prev => ({
                ...prev,
                students: classList.students.map(student => ({
                    id: student.id,
                    name: student.name,
                    email: student.email || '',
                    program: student.program || ''
                })),
                // Initialize with 4 default empty projects if none exist
                projects: prev.projects.length === 0 ? [
                    {
                        id: 'project_1',
                        name: 'Project 1',
                        maxPoints: 100,
                        weight: 25,
                        dueDate: '',
                        description: '',
                        created: new Date().toISOString()
                    },
                    {
                        id: 'project_2',
                        name: 'Project 2',
                        maxPoints: 100,
                        weight: 25,
                        dueDate: '',
                        description: '',
                        created: new Date().toISOString()
                    },
                    {
                        id: 'project_3',
                        name: 'Project 3',
                        maxPoints: 100,
                        weight: 25,
                        dueDate: '',
                        description: '',
                        created: new Date().toISOString()
                    },
                    {
                        id: 'project_4',
                        name: 'Project 4',
                        maxPoints: 100,
                        weight: 25,
                        dueDate: '',
                        description: '',
                        created: new Date().toISOString()
                    }
                ] : prev.projects,
                metadata: {
                    ...prev.metadata,
                    courseName: classList.courseMetadata?.courseName || '',
                    courseCode: classList.courseMetadata?.courseCode || '',
                    instructor: classList.courseMetadata?.instructor || '',
                    term: classList.courseMetadata?.term || ''
                }
            }));
        } else if (gradeBookData.projects.length === 0) {
            // Initialize default projects even without class list
            setGradeBookData(prev => ({
                ...prev,
                projects: [
                    {
                        id: 'project_1',
                        name: 'Project 1',
                        maxPoints: 100,
                        weight: 25,
                        dueDate: '',
                        description: '',
                        created: new Date().toISOString()
                    },
                    {
                        id: 'project_2',
                        name: 'Project 2',
                        maxPoints: 100,
                        weight: 25,
                        dueDate: '',
                        description: '',
                        created: new Date().toISOString()
                    },
                    {
                        id: 'project_3',
                        name: 'Project 3',
                        maxPoints: 100,
                        weight: 25,
                        dueDate: '',
                        description: '',
                        created: new Date().toISOString()
                    },
                    {
                        id: 'project_4',
                        name: 'Project 4',
                        maxPoints: 100,
                        weight: 25,
                        dueDate: '',
                        description: '',
                        created: new Date().toISOString()
                    }
                ]
            }));
        }
    }, [classList]);

    // Calculate statistics whenever grades change
    useEffect(() => {
        calculateStatistics();
    }, [gradeBookData.grades, gradeBookData.projects]);

    // Grade calculation functions
    const getLetterGrade = (percentage, policy = 'degree') => {
        // Use the existing grading policy logic
        if (policy === 'certificate') {
            if (percentage >= 80) return 'A';
            if (percentage >= 70) return 'B';
            if (percentage >= 60) return 'C';
            return 'F';
        } else {
            // Standard degree policy
            if (percentage >= 97) return 'A+';
            if (percentage >= 93) return 'A';
            if (percentage >= 90) return 'A-';
            if (percentage >= 87) return 'B+';
            if (percentage >= 83) return 'B';
            if (percentage >= 80) return 'B-';
            if (percentage >= 77) return 'C+';
            if (percentage >= 73) return 'C';
            if (percentage >= 70) return 'C-';
            if (percentage >= 67) return 'D+';
            if (percentage >= 63) return 'D';
            if (percentage >= 60) return 'D-';
            return 'F';
        }
    };

    const calculateFinalGrade = (studentId) => {
        const studentGrades = gradeBookData.grades[studentId] || {};
        let totalWeightedScore = 0;
        let totalWeight = 0;

        gradeBookData.projects.forEach(project => {
            const gradeData = studentGrades[project.id];
            if (gradeData && gradeData.percentage !== null && gradeData.percentage !== undefined) {
                totalWeightedScore += (gradeData.percentage * project.weight) / 100;
                totalWeight += project.weight;
            }
        });

        if (totalWeight === 0) return { percentage: 0, letterGrade: 'N/A' };

        const finalPercentage = (totalWeightedScore / totalWeight) * 100;
        const letterGrade = getLetterGrade(finalPercentage, gradeBookData.metadata.gradingPolicy);

        return {
            percentage: Math.round(finalPercentage * 100) / 100,
            letterGrade
        };
    };

    const calculateStatistics = () => {
        const students = gradeBookData.students;
        const grades = gradeBookData.grades;

        if (students.length === 0) {
            setStatistics({
                classAverage: 0,
                highestGrade: 0,
                lowestGrade: 0,
                passingRate: 0,
                projectAverages: {}
            });
            return;
        }

        // Calculate final grades for all students
        const finalGrades = students.map(student => {
            const final = calculateFinalGrade(student.id);
            return final.percentage;
        }).filter(grade => grade > 0);

        if (finalGrades.length === 0) {
            setStatistics({
                classAverage: 0,
                highestGrade: 0,
                lowestGrade: 0,
                passingRate: 0,
                projectAverages: {}
            });
            return;
        }

        const classAverage = finalGrades.reduce((sum, grade) => sum + grade, 0) / finalGrades.length;
        const highestGrade = Math.max(...finalGrades);
        const lowestGrade = Math.min(...finalGrades);
        const passingGrades = finalGrades.filter(grade => grade >= 60).length;
        const passingRate = (passingGrades / finalGrades.length) * 100;

        // Calculate project averages
        const projectAverages = {};
        gradeBookData.projects.forEach(project => {
            const projectGrades = students.map(student => {
                const gradeData = grades[student.id]?.[project.id];
                return gradeData?.percentage;
            }).filter(grade => grade !== null && grade !== undefined);

            if (projectGrades.length > 0) {
                projectAverages[project.id] = projectGrades.reduce((sum, grade) => sum + grade, 0) / projectGrades.length;
            }
        });

        setStatistics({
            classAverage: Math.round(classAverage * 100) / 100,
            highestGrade: Math.round(highestGrade * 100) / 100,
            lowestGrade: Math.round(lowestGrade * 100) / 100,
            passingRate: Math.round(passingRate * 100) / 100,
            projectAverages
        });
    };

    // Project editing functions
    const startEditingProject = (projectId, field, currentValue) => {
        setEditingProject({ projectId, field });
        setProjectEditValue(currentValue || '');
    };

    const saveProjectEdit = () => {
        if (editingProject) {
            setGradeBookData(prev => ({
                ...prev,
                projects: prev.projects.map(project =>
                    project.id === editingProject.projectId
                        ? {
                            ...project, [editingProject.field]: editingProject.field === 'weight' || editingProject.field === 'maxPoints'
                                ? parseFloat(projectEditValue) || project[editingProject.field]
                                : projectEditValue
                        }
                        : project
                ),
                metadata: {
                    ...prev.metadata,
                    lastModified: new Date().toISOString()
                }
            }));
        }
        setEditingProject(null);
        setProjectEditValue('');
    };

    const cancelProjectEdit = () => {
        setEditingProject(null);
        setProjectEditValue('');
    };

    // Project management functions
    const addProject = () => {
        const newProject = {
            id: `project_${Date.now()}`,
            name: `Project ${gradeBookData.projects.length + 1}`,
            maxPoints: 100,
            weight: 25,
            dueDate: '',
            description: '',
            created: new Date().toISOString()
        };

        setGradeBookData(prev => ({
            ...prev,
            projects: [...prev.projects, newProject],
            metadata: {
                ...prev.metadata,
                lastModified: new Date().toISOString()
            }
        }));
    };
    const removeProject = (projectId) => {
        setConfirmDialog({
            show: true,
            message: 'Are you sure you want to remove this project? All grades for this project will be lost.',
            onConfirm: () => {
                setGradeBookData(prev => {
                    const newGrades = { ...prev.grades };
                    // Remove all grades for this project
                    Object.keys(newGrades).forEach(studentId => {
                        if (newGrades[studentId][projectId]) {
                            delete newGrades[studentId][projectId];
                        }
                    });

                    return {
                        ...prev,
                        projects: prev.projects.filter(p => p.id !== projectId),
                        grades: newGrades,
                        metadata: {
                            ...prev.metadata,
                            lastModified: new Date().toISOString()
                        }
                    };
                });
                setConfirmDialog({ show: false, message: '', onConfirm: null });
            }
        });
    };

    // Grade management functions - UPDATED for raw points
    const updateGrade = (studentId, projectId, value) => {
        const project = gradeBookData.projects.find(p => p.id === projectId);
        if (!project) return;

        const maxPoints = project.maxPoints || 100;
        let rawScore = parseFloat(value);

        if (isNaN(rawScore) || value.trim() === '') {
            // If input is empty or not a number, clear the grade
            const newGrades = { ...gradeBookData.grades };
            if (newGrades[studentId]) {
                newGrades[studentId][projectId] = { rawScore: null, percentage: null, letterGrade: null, lastModified: new Date().toISOString() };
            }
            setGradeBookData(prev => ({ ...prev, grades: newGrades }));
            return;
        }

        rawScore = Math.max(0, rawScore);

        const percentage = Math.round((rawScore / maxPoints) * 100);
        const letterGrade = getLetterGrade(percentage, gradeBookData.metadata.gradingPolicy);

        const newGrades = { ...gradeBookData.grades };
        if (!newGrades[studentId]) {
            newGrades[studentId] = {};
        }
        newGrades[studentId][projectId] = {
            rawScore,
            percentage,
            letterGrade,
            lastModified: new Date().toISOString()
        };

        setGradeBookData(prev => ({
            ...prev,
            grades: newGrades,
            metadata: { ...prev.metadata, lastModified: new Date().toISOString() }
        }));
    };

    // Cell editing functions - UPDATED for raw points
    const startEditing = (studentId, projectId) => {
        const currentGrade = gradeBookData.grades[studentId]?.[projectId];
        setSelectedCell({ studentId, projectId });
        setEditValue(currentGrade?.rawScore != null ? String(currentGrade.rawScore) : '');
        setIsEditing(true);
    };

    const saveEdit = () => {
        if (selectedCell) {
            updateGrade(selectedCell.studentId, selectedCell.projectId, editValue);
        }
        setIsEditing(false);
        setSelectedCell(null);
        setEditValue('');
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setSelectedCell(null);
        setEditValue('');
    };

    // Import/Export functions
    const exportGradeBook = () => {
        const exportData = {
            ...gradeBookData,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gradebook_${gradeBookData.metadata.courseCode || 'course'}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const importGradeBook = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                // Validate the imported data structure
                if (!importedData.projects || !importedData.students || !importedData.grades) {
                    throw new Error('Invalid gradebook file format');
                }

                setGradeBookData({
                    ...importedData,
                    metadata: {
                        ...importedData.metadata,
                        lastModified: new Date().toISOString()
                    }
                });

                alert('Gradebook imported successfully!');
            } catch (error) {
                console.error('Import error:', error);
                alert('Error importing gradebook: ' + error.message);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const exportToExcel = () => {
        const worksheetData = [];

        // Create header row
        const headerRow = ['Student ID', 'Student Name', 'Email', 'Program'];
        gradeBookData.projects.forEach(project => {
            headerRow.push(`${project.name} (Points)`);
            headerRow.push(`${project.name} (%)`);
            headerRow.push(`${project.name} (Letter)`);
        });
        headerRow.push('Final %', 'Final Grade');
        worksheetData.push(headerRow);

        // Add student data rows
        gradeBookData.students.forEach(student => {
            const row = [student.id, student.name, student.email, student.program];

            gradeBookData.projects.forEach(project => {
                const gradeData = gradeBookData.grades[student.id]?.[project.id];
                if (gradeData && gradeData.rawScore != null) {
                    row.push(gradeData.rawScore);
                    row.push(gradeData.percentage);
                    row.push(gradeData.letterGrade);
                } else {
                    row.push('', '', '');
                }
            });

            const finalGrade = calculateFinalGrade(student.id);
            row.push(finalGrade.percentage);
            row.push(finalGrade.letterGrade);

            worksheetData.push(row);
        });

        // Add statistics row
        worksheetData.push([]); // Empty row
        const statsRow = ['STATISTICS', '', '', ''];
        gradeBookData.projects.forEach(project => {
            const avg = statistics.projectAverages[project.id];
            statsRow.push(avg ? `${Math.round(avg * 100) / 100}` : '');
            statsRow.push('', ''); // for points and letter grade columns
        });
        statsRow.push(`${statistics.classAverage}%`);
        statsRow.push('');
        worksheetData.push(statsRow);

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Gradebook');

        // Write the file
        XLSX.writeFile(wb, `gradebook_${gradeBookData.metadata.courseCode || 'course'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const importGrades = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length < 2) {
                    throw new Error('No data found in the file');
                }

                // Process the imported data (implementation depends on your specific format)
                alert('Grade import functionality needs to be implemented based on your specific Excel format');

            } catch (error) {
                console.error('Import error:', error);
                alert('Error importing grades: ' + error.message);
            }
        };
        reader.readAsArrayBuffer(file);
        event.target.value = '';
    };

    // Filter and sort students
    const getFilteredAndSortedStudents = () => {
        let filtered = gradeBookData.students;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(student =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.id && student.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
                (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'id':
                    aValue = a.id.toString().toLowerCase();
                    bValue = b.id.toString().toLowerCase();
                    break;
                case 'finalGrade':
                    aValue = calculateFinalGrade(a.id).percentage;
                    bValue = calculateFinalGrade(b.id).percentage;
                    break;
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    };

    // Import grades from Grading Tool
    const handleImportGrades = (targetProjectId) => {
        if (!finalGrades && !drafts) {
            alert("No graded data available to import from the Grading Tool.");
            return;
        }

        const newGrades = { ...gradeBookData.grades };
        let importedCount = 0;

        gradeBookData.students.forEach(student => {
            const studentGradeData = finalGrades[student.id] || drafts[student.id];

            if (studentGradeData && studentGradeData.totalScore) {
                const rawScore = studentGradeData.totalScore.finalScore;
                const maxPoints = studentGradeData.rubric?.assignmentInfo?.totalPoints || 100;

                if (rawScore !== undefined && maxPoints > 0) {
                    const percentage = Math.round((rawScore / maxPoints) * 100);
                    const letterGrade = getLetterGrade(percentage, gradeBookData.metadata.gradingPolicy);

                    if (!newGrades[student.id]) {
                        newGrades[student.id] = {};
                    }

                    newGrades[student.id][targetProjectId] = {
                        rawScore: parseFloat(rawScore.toFixed(1)),
                        percentage: percentage,
                        letterGrade: letterGrade,
                        lastModified: new Date().toISOString()
                    };
                    importedCount++;
                }
            }
        });

        if (importedCount > 0) {
            setGradeBookData(prev => ({
                ...prev,
                grades: newGrades,
                metadata: { ...prev.metadata, lastModified: new Date().toISOString() }
            }));
            alert(`Successfully imported grades for ${importedCount} students.`);
        } else {
            alert("No matching student grades found in the Grading Tool's saved data.");
        }
    };


    // Define grid columns dynamically based on the number of projects
    const gridTemplateColumns = `minmax(240px, 1.5fr) repeat(${gradeBookData.projects.length}, minmax(220px, 1fr)) minmax(120px, 1fr)`;

    // Get the list of policies from the service
    const supportedPolicies = gradingPolicyService.getSupportedProgramTypes();

    // Component render
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <BookOpen className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Grade Book</h1>
                                <p className="text-gray-600">
                                    {gradeBookData.metadata.courseCode} - {gradeBookData.metadata.courseName}
                                </p>
                                {gradeBookData.students.length > 0 && (
                                    <p className="text-sm text-gray-500">
                                        {gradeBookData.students.length} students • {gradeBookData.projects.length} projects
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowSettings(true)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <Settings size={16} />
                                Settings
                            </button>
                            <button
                                onClick={addProject}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                <Plus size={16} />
                                Add Project
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="id">Sort by ID</option>
                                <option value="finalGrade">Sort by Final Grade</option>
                            </select>

                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                            </button>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={exportGradeBook}
                                className="flex items-center gap-2 px-3 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                                <Download size={16} />
                                Export JSON
                            </button>
                            <button
                                onClick={exportToExcel}
                                className="flex items-center gap-2 px-3 py-2 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                            >
                                <FileSpreadsheet size={16} />
                                Export Excel
                            </button>
                            <input
                                ref={importGradeBookRef}
                                type="file"
                                accept=".json"
                                onChange={importGradeBook}
                                className="hidden"
                            />
                            <button
                                onClick={() => importGradeBookRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                            >
                                <Upload size={16} />
                                Import
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                {gradeBookData.students.length > 0 && gradeBookData.projects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Class Average</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.classAverage}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <Award className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Highest Grade</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.highestGrade}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center">
                                <div className="bg-orange-100 p-2 rounded-lg">
                                    <Target className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Lowest Grade</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.lowestGrade}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Passing Rate</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.passingRate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {gradeBookData.students.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                        <p className="text-gray-600 mb-6">
                            Import a class list from the Class Manager to start using the gradebook.
                        </p>
                        <button
                            onClick={() => setActiveTab('class-manager')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Users size={16} />
                            Go to Class Manager
                        </button>
                    </div>
                ) : (
                    /* Gradebook Grid Layout */
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <div className="grid" style={{ gridTemplateColumns, minWidth: '900px' }}>
                                {/* Grid Header */}
                                <div className="sticky top-0 z-10 p-4 bg-gray-50 border-b border-r border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student
                                </div>
                                {gradeBookData.projects.map(project => (
                                    <div key={project.id} className="sticky top-0 z-10 p-4 bg-gray-50 border-b border-r border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider group relative">
                                        <div className="flex flex-col items-center space-y-1">
                                            {editingProject?.projectId === project.id && editingProject?.field === 'name' ? (
                                                <input
                                                    type="text"
                                                    value={projectEditValue}
                                                    onChange={(e) => setProjectEditValue(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') saveProjectEdit(); if (e.key === 'Escape') cancelProjectEdit(); }}
                                                    onBlur={saveProjectEdit}
                                                    className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center bg-white"
                                                    autoFocus
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => startEditingProject(project.id, 'name', project.name)}
                                                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer text-center"
                                                    title="Click to edit project name"
                                                >
                                                    {project.name}
                                                </button>
                                            )}
                                            <div className="flex items-center space-x-1">
                                                {editingProject?.projectId === project.id && editingProject?.field === 'weight' ? (
                                                    <input type="number" value={projectEditValue} onChange={(e) => setProjectEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveProjectEdit(); if (e.key === 'Escape') cancelProjectEdit(); }} onBlur={saveProjectEdit} className="w-16 px-1 py-1 text-xs border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" autoFocus />
                                                ) : (
                                                    <button onClick={() => startEditingProject(project.id, 'weight', project.weight.toString())} className="text-xs text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" title="Click to edit weight">{project.weight}%</button>
                                                )}
                                                <span className="text-xs text-gray-400">•</span>
                                                {editingProject?.projectId === project.id && editingProject?.field === 'maxPoints' ? (
                                                    <input type="number" value={projectEditValue} onChange={(e) => setProjectEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveProjectEdit(); if (e.key === 'Escape') cancelProjectEdit(); }} onBlur={saveProjectEdit} className="w-16 px-1 py-1 text-xs border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" autoFocus />
                                                ) : (
                                                    <button onClick={() => startEditingProject(project.id, 'maxPoints', project.maxPoints.toString())} className="text-xs text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" title="Click to edit max points">{project.maxPoints}pts</button>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleImportGrades(project.id)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-semibold mt-1 bg-blue-100 px-2 py-1 rounded-md hover:bg-blue-200 transition-colors"
                                                title="Import final grades from the Grading Tool for this project"
                                            >
                                                Import Grades
                                            </button>
                                        </div>
                                        <button onClick={() => removeProject(project.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all bg-white rounded shadow-sm" title="Remove project">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                <div className="sticky top-0 z-10 p-4 bg-blue-50 border-b border-l-2 border-blue-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Final Grade
                                </div>

                                {/* Grid Body */}
                                {getFilteredAndSortedStudents().flatMap((student, index) => {
                                    const finalGrade = calculateFinalGrade(student.id);
                                    const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

                                    return [
                                        <div key={`${student.id}-details`} className={`${rowBg} p-4 border-b border-r border-gray-200 flex flex-col justify-center`}>
                                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                            <div className="text-sm text-gray-500">ID: {student.id}</div>
                                            {student.email && <div className="text-xs text-gray-400">{student.email}</div>}
                                        </div>,
                                        ...gradeBookData.projects.map(project => {
                                            const isSelected = selectedCell?.studentId === student.id && selectedCell?.projectId === project.id;
                                            const gradeData = gradeBookData.grades[student.id]?.[project.id];

                                            return (
                                                <div key={`${student.id}-${project.id}`} className={`${rowBg} p-2 border-b border-r border-gray-200 flex items-center justify-center`}>
                                                    {isSelected && isEditing ? (
                                                        <input
                                                            type="number"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                                                            onBlur={saveEdit}
                                                            className="w-full px-2 py-1 text-sm border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                                            placeholder="Enter points"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <button
                                                            onClick={() => startEditing(student.id, project.id)}
                                                            className="w-full h-full p-2 text-sm rounded-lg transition-all min-h-[4rem] flex items-center justify-center hover:bg-gray-100"
                                                        >
                                                            {gradeData && gradeData.rawScore != null ? (
                                                                <div className="flex items-center justify-center space-x-3 text-sm w-full text-center">
                                                                    <span className="font-bold text-blue-800">{gradeData.rawScore}pts</span>
                                                                    <span className="text-gray-300">|</span>
                                                                    <span className="text-gray-600">{gradeData.percentage}%</span>
                                                                    <span className="text-gray-300">|</span>
                                                                    <span className={`font-semibold px-2 py-1 rounded-full text-xs ${gradeData.percentage >= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{gradeData.letterGrade}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">Enter grade</span>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        }),
                                        <div key={`${student.id}-final`} className={`${rowBg} p-4 border-b bg-blue-50 border-l-2 border-blue-200 flex flex-col items-center justify-center`}>
                                            {finalGrade.percentage > 0 ? (
                                                <>
                                                    <div className={`text-lg font-bold ${finalGrade.percentage >= 60 ? 'text-green-800' : 'text-red-800'}`}>{finalGrade.percentage}%</div>
                                                    <div className="text-xs font-normal opacity-75">{finalGrade.letterGrade}</div>
                                                </>
                                            ) : (
                                                <div className="text-gray-400">-</div>
                                            )}
                                        </div>
                                    ];
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Modal */}
                {showSettings && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 min-h-[580px]">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Gradebook Settings</h2>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course Code
                                    </label>
                                    <input
                                        type="text"
                                        value={gradeBookData.metadata.courseCode}
                                        onChange={(e) => setGradeBookData(prev => ({
                                            ...prev,
                                            metadata: { ...prev.metadata, courseCode: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course Name
                                    </label>
                                    <input
                                        type="text"
                                        value={gradeBookData.metadata.courseName}
                                        onChange={(e) => setGradeBookData(prev => ({
                                            ...prev,
                                            metadata: { ...prev.metadata, courseName: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Instructor
                                    </label>
                                    <input
                                        type="text"
                                        value={gradeBookData.metadata.instructor}
                                        onChange={(e) => setGradeBookData(prev => ({
                                            ...prev,
                                            metadata: { ...prev.metadata, instructor: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Term
                                    </label>
                                    <input
                                        type="text"
                                        value={gradeBookData.metadata.term}
                                        onChange={(e) => setGradeBookData(prev => ({
                                            ...prev,
                                            metadata: { ...prev.metadata, term: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., Fall 2025"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Grading Policy
                                    </label>
                                    <select
                                        value={gradeBookData.metadata.gradingPolicy}
                                        onChange={(e) => setGradeBookData(prev => ({
                                            ...prev,
                                            metadata: { ...prev.metadata, gradingPolicy: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {supportedPolicies.map(policy => (
                                            <option key={policy.value} value={policy.value}>
                                                {policy.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setGradeBookData(prev => ({
                                            ...prev,
                                            metadata: {
                                                ...prev.metadata,
                                                lastModified: new Date().toISOString()
                                            }
                                        }));
                                        setShowSettings(false);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Dialog */}
                {confirmDialog.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Confirm Action</h2>
                            </div>

                            <p className="text-gray-600 mb-6">
                                {confirmDialog.message}
                            </p>

                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => setConfirmDialog({ show: false, message: '', onConfirm: null })}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDialog.onConfirm}
                                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                                >
                                    Remove Project
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradeBook;