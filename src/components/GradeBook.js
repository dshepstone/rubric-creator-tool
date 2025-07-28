// GradeBook.js - FIXED VERSION - No getSchoolLogo references
// Fixed the "+Add Project" button issue and removed all getSchoolLogo references

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Users, Plus, Edit3, Trash2, Download, Upload, Settings, Save,
    FileText, Calculator, Eye, RotateCcw, CheckCircle, AlertCircle,
    BookOpen, X, Copy, Database, Percent, GraduationCap, ClipboardList,
    TrendingUp, BarChart3, Grid3X3, Filter, Search, SortAsc, SortDesc,
    FileSpreadsheet, Calendar, Clock, Award, Target, Lock, FileDown,
    Shield, Timer
} from 'lucide-react';
import { useAssessment } from './SharedContext';
import { generateAssignmentHeader } from './logoIntegrationUtility';
import * as XLSX from 'xlsx';

/**
 * PRIVACY-FOCUSED GradeBook - Session-Only Storage
 * PRESERVES ALL ORIGINAL FUNCTIONALITY while implementing privacy controls
 */

const GradeBook = () => {
    const {
        classList,
        setClassList,
        activeTab,
        setActiveTab,
        drafts,
        finalGrades,
        gradeBook,
        setGradeBook,
        // PRIVACY: Session management
        sessionActive,
        sessionManager,
        extendSession
    } = useAssessment();

    // PRIVACY: Session monitoring state
    const [sessionWarning, setSessionWarning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);

    // FIX: Add local session state to handle edge cases
    const [localSessionActive, setLocalSessionActive] = useState(true);

    // FIX: Add flag to prevent sync loops
    const [isSyncing, setIsSyncing] = useState(false);

    // Core gradebook state - STARTS EMPTY but persists during session
    const [gradeBookData, setGradeBookData] = useState(() => {
        // During session, try to load from shared context first
        if (gradeBook && gradeBook.students && gradeBook.projects) {
            return gradeBook;
        }
        // Otherwise start empty
        return {
            projects: [],
            students: [],
            grades: {},
            metadata: {
                courseName: '',
                courseCode: '',
                instructor: '',
                term: '',
                created: null,
                lastModified: null,
                gradingPolicy: 'degree'
            }
        };
    });

    // UI state
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [viewMode, setViewMode] = useState('percentage');
    const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null });
    const [editingProject, setEditingProject] = useState(null);
    const [projectEditValue, setProjectEditValue] = useState('');
    const [isGradeBookLoaded, setIsGradeBookLoaded] = useState(() => {
        // Check if we have valid gradebook data from session
        return gradeBook && gradeBook.students && gradeBook.students.length > 0;
    });

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

    // FIX: Enhanced session monitoring with proper initialization handling
    useEffect(() => {
        console.log('Session status check:', { sessionActive, sessionManager });

        // CRITICAL FIX: During initialization, sessionActive starts as false
        // We need to allow functionality until we know the session is actually expired
        if (sessionActive === false && sessionManager) {
            // Check if there's a valid session in sessionStorage
            const isValidSession = sessionManager.isSessionValid();
            console.log('Session validation result:', isValidSession);

            if (isValidSession) {
                // Session is valid but state hasn't updated yet
                setLocalSessionActive(true);
            } else {
                // Session is actually invalid
                setLocalSessionActive(false);
                setSessionWarning(true);
            }
        } else if (sessionActive === true) {
            setLocalSessionActive(true);
        } else if (sessionActive === undefined || sessionActive === null) {
            // During initial render, assume active to prevent blocking
            console.log('Session status undefined, assuming active during initialization');
            setLocalSessionActive(true);
        }

        if (sessionActive === true && sessionManager) {
            // Update time remaining every minute
            const interval = setInterval(() => {
                const remaining = sessionManager.getTimeRemaining();
                setTimeRemaining(remaining);

                // Show warning at 5 minutes
                if (remaining <= 5 * 60 * 1000 && remaining > 0) {
                    setSessionWarning(true);
                }
            }, 60000);

            // Initial check
            const remaining = sessionManager.getTimeRemaining();
            setTimeRemaining(remaining);
            if (remaining <= 5 * 60 * 1000 && remaining > 0) {
                setSessionWarning(true);
            }

            return () => clearInterval(interval);
        }
    }, [sessionActive, sessionManager]);

    // FIX: Determine effective session status - allow during initialization
    const effectiveSessionActive = sessionActive !== false || localSessionActive;

    // PRIVACY: Sync with shared context for session persistence (prevent loops)
    useEffect(() => {
        if (gradeBookData.students.length > 0 && effectiveSessionActive && !isSyncing) {
            console.log('🔄 Syncing local state to shared context');
            setIsSyncing(true);
            setGradeBook(gradeBookData);
            // Reset sync flag after a brief delay
            setTimeout(() => setIsSyncing(false), 100);
        }
    }, [gradeBookData, setGradeBook, effectiveSessionActive, isSyncing]);

    // PRIVACY: Load from shared context ONLY on initial mount
    useEffect(() => {
        if (gradeBook && gradeBook.students && gradeBook.students.length > 0 && !isGradeBookLoaded && !isSyncing) {
            console.log('📊 Gradebook restored from session context (initial load only)');
            setGradeBookData(gradeBook);
            setIsGradeBookLoaded(true);
        }
    }, [gradeBook, isGradeBookLoaded, isSyncing]);

    // Initialize empty gradebook - NO AUTO-LOADING from localStorage
    useEffect(() => {
        console.log('📋 GradeBook initialized - session only storage');

        // Clear any old localStorage data for privacy
        try {
            localStorage.removeItem('gradeBookData');
            localStorage.removeItem('gradebook');
        } catch (e) {
            // Ignore errors
        }
    }, []);

    // Update statistics when data changes
    useEffect(() => {
        if (gradeBookData.students.length > 0) {
            calculateStatistics();
        }
    }, [gradeBookData.grades, gradeBookData.students, gradeBookData.projects]);

    // Calculate statistics
    const calculateStatistics = () => {
        const finalGrades = gradeBookData.students.map(student => calculateFinalGrade(student.id));
        const validGrades = finalGrades.filter(grade => grade.percentage > 0);

        if (validGrades.length === 0) {
            setStatistics({
                classAverage: 0,
                highestGrade: 0,
                lowestGrade: 0,
                passingRate: 0,
                projectAverages: {}
            });
            return;
        }

        const percentages = validGrades.map(grade => grade.percentage);
        const classAverage = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
        const highestGrade = Math.max(...percentages);
        const lowestGrade = Math.min(...percentages);
        const passingGrades = percentages.filter(p => p >= 60);
        const passingRate = Math.round((passingGrades.length / percentages.length) * 100);

        // Calculate project averages
        const projectAverages = {};
        gradeBookData.projects.forEach(project => {
            const projectGrades = gradeBookData.students
                .map(student => gradeBookData.grades[student.id]?.[project.id]?.percentage)
                .filter(grade => grade != null);

            if (projectGrades.length > 0) {
                projectAverages[project.id] = projectGrades.reduce((a, b) => a + b, 0) / projectGrades.length;
            }
        });

        setStatistics({
            classAverage,
            highestGrade,
            lowestGrade,
            passingRate,
            projectAverages
        });
    };

    // Grade calculation functions (preserved exactly)
    const getLetterGrade = (percentage, policy = 'degree') => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 85) return 'A';
        if (percentage >= 80) return 'A-';
        if (percentage >= 77) return 'B+';
        if (percentage >= 73) return 'B';
        if (percentage >= 70) return 'B-';
        if (percentage >= 67) return 'C+';
        if (percentage >= 63) return 'C';
        if (percentage >= 60) return 'C-';
        if (percentage >= 57) return 'D+';
        if (percentage >= 53) return 'D';
        if (percentage >= 50) return 'D-';
        return 'F';
    };

    const calculateFinalGrade = (studentId) => {
        const studentGrades = gradeBookData.grades[studentId] || {};
        const totalWeight = gradeBookData.projects.reduce((sum, project) => sum + project.weight, 0);

        if (totalWeight === 0) {
            return { percentage: 0, letterGrade: 'N/A' };
        }

        let weightedSum = 0;
        let completedWeight = 0;

        gradeBookData.projects.forEach(project => {
            const grade = studentGrades[project.id];
            if (grade && grade.percentage != null) {
                weightedSum += (grade.percentage * project.weight) / 100;
                completedWeight += project.weight;
            }
        });

        if (completedWeight === 0) {
            return { percentage: 0, letterGrade: 'N/A' };
        }

        const percentage = Math.round((weightedSum / completedWeight) * 100);
        const letterGrade = getLetterGrade(percentage, gradeBookData.metadata.gradingPolicy);

        return { percentage, letterGrade };
    };

    // FIX: Better addProject with user feedback and correct naming
    const addProject = () => {
        console.log('🎯 ADD PROJECT BUTTON CLICKED!');

        // CRITICAL FIX: Don't block during initialization
        // Only block if we're absolutely sure the session is expired
        if (sessionActive === false && sessionManager && !sessionManager.isSessionValid()) {
            console.warn('Session has actually expired');
            alert('Session has expired. Please refresh the page to start a new session.');
            return;
        }

        try {
            // Find the next available project number that doesn't conflict
            const existingNumbers = gradeBookData.projects
                .map(p => p.name.match(/Project (\d+)/))
                .filter(match => match)
                .map(match => parseInt(match[1]));

            const nextNumber = existingNumbers.length > 0
                ? Math.max(...existingNumbers) + 1
                : gradeBookData.projects.length + 1;

            const newProject = {
                id: `project_${Date.now()}`,
                name: `Project ${nextNumber}`,
                maxPoints: 100,
                weight: Math.max(0, 100 - gradeBookData.projects.reduce((sum, p) => sum + p.weight, 0)),
                created: new Date().toISOString()
            };

            console.log('Adding new project:', newProject);

            const updatedData = {
                ...gradeBookData,
                projects: [...gradeBookData.projects, newProject],
                metadata: { ...gradeBookData.metadata, lastModified: new Date().toISOString() }
            };

            // Update both local and shared state immediately
            setGradeBookData(updatedData);
            setGradeBook(updatedData);

            // SUCCESS FEEDBACK: Show user-friendly notification
            alert(`✅ "${newProject.name}" has been added successfully!\n\nMax Points: ${newProject.maxPoints}\nWeight: ${newProject.weight}%\n\nYou can now enter grades for this project.`);

            console.log('✅ Project added successfully:', newProject);
            console.log('📊 Updated gradebook with', updatedData.projects.length, 'projects');
        } catch (error) {
            console.error('❌ Error adding project:', error);
            alert('Error adding project: ' + error.message);
        }
    };

    const removeProject = (projectId) => {
        if (!effectiveSessionActive) {
            if (!window.confirm('Session may be expired. Do you want to continue removing the project?')) {
                return;
            }
        }

        setConfirmDialog({
            show: true,
            message: 'Are you sure you want to remove this project? All associated grades will be lost.',
            onConfirm: () => {
                setGradeBookData(prev => {
                    const newGrades = { ...prev.grades };
                    Object.keys(newGrades).forEach(studentId => {
                        delete newGrades[studentId][projectId];
                    });

                    return {
                        ...prev,
                        projects: prev.projects.filter(p => p.id !== projectId),
                        grades: newGrades,
                        metadata: { ...prev.metadata, lastModified: new Date().toISOString() }
                    };
                });
                setConfirmDialog({ show: false, message: '', onConfirm: null });
            }
        });
    };

    // Project inline editing (preserved exactly)
    const startProjectEdit = (project, field) => {
        if (!effectiveSessionActive) {
            if (!window.confirm('Session may be expired. Do you want to continue editing?')) {
                return;
            }
        }

        setEditingProject({ id: project.id, field });
        setProjectEditValue(project[field].toString());
    };

    const saveProjectEdit = () => {
        if (!editingProject) return;

        const { id, field } = editingProject;
        let value = projectEditValue;

        if (field === 'maxPoints' || field === 'weight') {
            value = Math.max(0, parseFloat(value) || 0);
        }

        setGradeBookData(prev => ({
            ...prev,
            projects: prev.projects.map(p =>
                p.id === id ? { ...p, [field]: value } : p
            ),
            metadata: { ...prev.metadata, lastModified: new Date().toISOString() }
        }));

        setEditingProject(null);
        setProjectEditValue('');
    };

    const cancelProjectEdit = () => {
        setEditingProject(null);
        setProjectEditValue('');
    };

    // Grade editing (preserved exactly with session checks)
    const updateGrade = (studentId, projectId, rawScore) => {
        if (!effectiveSessionActive) {
            if (!window.confirm('Session may be expired. Do you want to continue updating grades?')) {
                return;
            }
        }

        const project = gradeBookData.projects.find(p => p.id === projectId);
        if (!project) return;

        const score = parseFloat(rawScore) || 0;
        const percentage = Math.round((score / project.maxPoints) * 100);
        const letterGrade = getLetterGrade(percentage, gradeBookData.metadata.gradingPolicy);

        setGradeBookData(prev => ({
            ...prev,
            grades: {
                ...prev.grades,
                [studentId]: {
                    ...prev.grades[studentId],
                    [projectId]: {
                        rawScore: score,
                        percentage,
                        letterGrade,
                        lastModified: new Date().toISOString()
                    }
                }
            },
            metadata: { ...prev.metadata, lastModified: new Date().toISOString() }
        }));
    };

    // Cell editing (preserved exactly)
    const startCellEdit = (studentId, projectId) => {
        if (!effectiveSessionActive) {
            if (!window.confirm('Session may be expired. Do you want to continue editing?')) {
                return;
            }
        }

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

    // PRIVACY: Enhanced export functions with session checks
    const exportGradeBook = () => {
        if (!effectiveSessionActive) {
            if (!window.confirm('Session may be expired. Do you want to continue exporting?')) {
                return;
            }
        }

        if (!isGradeBookLoaded || gradeBookData.students.length === 0) {
            alert('No gradebook data to export. Please import or set up a gradebook first.');
            return;
        }

        const exportData = {
            ...gradeBookData,
            exportedAt: new Date().toISOString(),
            version: '1.0',
            sessionExport: true,
            privacyCompliant: true
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gradebook_${gradeBookData.metadata.courseCode || 'course'}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Import gradebook from JSON - REQUIRED TO POPULATE (preserved exactly with session checks)
    const importGradeBook = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!effectiveSessionActive) {
            if (!window.confirm('Session may be expired. Do you want to continue importing?')) {
                return;
            }
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                // Validate required structure
                if (!importedData.projects || !importedData.students || !importedData.grades) {
                    throw new Error('Invalid gradebook file format. Missing required fields.');
                }

                // Validate projects structure
                if (!Array.isArray(importedData.projects)) {
                    throw new Error('Invalid projects data structure.');
                }

                // Validate students structure
                if (!Array.isArray(importedData.students)) {
                    throw new Error('Invalid students data structure.');
                }

                // PRIVACY: Mark as session-only
                const sessionData = {
                    ...importedData,
                    metadata: {
                        ...importedData.metadata,
                        sessionOnly: true,
                        importedAt: new Date().toISOString()
                    }
                };

                // Set the gradebook data
                setGradeBookData(sessionData);
                setGradeBook(sessionData);
                setIsGradeBookLoaded(true);

                console.log('✅ Gradebook imported successfully (session-only)');
                alert(`Gradebook imported successfully!\n${importedData.students.length} students, ${importedData.projects.length} projects\n\n⚠️ Data will be cleared after 1 hour or when application restarts.`);

            } catch (error) {
                console.error('Import error:', error);
                alert('Error importing gradebook: ' + error.message);
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    };

    // Import grades from Grading Tool (preserved exactly with session checks)
    const handleImportGrades = (targetProjectId) => {
        if (!effectiveSessionActive) {
            if (!window.confirm('Session may be expired. Do you want to continue importing grades?')) {
                return;
            }
        }

        if (!finalGrades && !drafts) {
            alert("No graded data available to import from the Grading Tool.");
            return;
        }

        if (!isGradeBookLoaded) {
            alert("Please import a gradebook first before importing grades.");
            return;
        }

        const newGrades = { ...gradeBookData.grades };
        let importedCount = 0;

        gradeBookData.students.forEach(student => {
            const studentGradeData = finalGrades[student.id] || drafts[student.id];

            if (studentGradeData && studentGradeData.totalScore) {
                const rawScore = studentGradeData.totalScore.finalScore;
                const project = gradeBookData.projects.find(p => p.id === targetProjectId);
                const maxPoints = project?.maxPoints || 100;

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

    // Export to Excel (preserved exactly with session checks)
    const exportToExcel = () => {
        if (!effectiveSessionActive) {
            if (!window.confirm('Session may be expired. Do you want to continue exporting to Excel?')) {
                return;
            }
        }

        if (!isGradeBookLoaded || gradeBookData.students.length === 0) {
            alert('No gradebook data to export. Please import or set up a gradebook first.');
            return;
        }

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

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Gradebook');

        // Write the file
        XLSX.writeFile(wb, `gradebook_${gradeBookData.metadata.courseCode || 'course'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Export to HTML (new feature with proper header)
    const exportToHTML = () => {
        if (!effectiveSessionActive) {
            if (!window.confirm('Session may be expired. Do you want to continue exporting to HTML?')) {
                return;
            }
        }

        if (!isGradeBookLoaded || gradeBookData.students.length === 0) {
            alert('No gradebook data to export. Please import or set up a gradebook first.');
            return;
        }

        const currentDate = new Date().toLocaleDateString();
        const exportTime = new Date().toLocaleString();

        // Generate header using existing utility (consistent with other exports)
        const gradebookHeaderHTML = generateAssignmentHeader({
            title: `${gradeBookData.metadata.courseCode} - ${gradeBookData.metadata.courseName}`,
            subtitle: `Instructor: ${gradeBookData.metadata.instructor || 'N/A'} | Term: ${gradeBookData.metadata.term || 'N/A'}`,
            courseCode: gradeBookData.metadata.courseCode || 'Course',
            assignmentNumber: 'Gradebook'
        }, {
            maxHeight: 80,
            maxWidth: 200
        });

        // Calculate class statistics for the report
        const classAvg = statistics.classAverage;
        const highestGrade = statistics.highestGrade;
        const lowestGrade = statistics.lowestGrade;
        const passingRate = statistics.passingRate;

        // Generate HTML content with proper header
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gradebook - ${gradeBookData.metadata.courseCode}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.4;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header-section {
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #2563eb;
        }
        .export-info {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 10px;
            text-align: center;
        }
        .statistics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
            padding: 15px;
            background-color: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .stat-item {
            text-align: center;
        }
        .stat-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
        }
        .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
        }
        .gradebook-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
        }
        .gradebook-table th {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 8px 6px;
            text-align: center;
            font-weight: 600;
            color: #374151;
        }
        .gradebook-table td {
            border: 1px solid #d1d5db;
            padding: 6px;
            text-align: center;
        }
        .student-name {
            text-align: left !important;
            font-weight: 500;
            width: 200px;
        }
        .student-id {
            font-size: 10px;
            color: #6b7280;
        }
        .grade-cell {
            min-width: 80px;
        }
        .final-grade {
            background-color: #fef3c7;
            font-weight: bold;
        }
        .project-header {
            writing-mode: horizontal-tb;
            min-width: 80px;
        }
        .project-details {
            font-size: 10px;
            color: #6b7280;
            font-weight: normal;
        }
        @media print {
            body { margin: 10px; }
            .statistics { background-color: white !important; }
            .gradebook-table th { background-color: #f9fafb !important; }
            .container { max-width: none; }
        }
        .no-data {
            color: #9ca3af;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-section">
            ${gradebookHeaderHTML}
            <div class="export-info">Exported on ${exportTime} | Total Students: ${gradeBookData.students.length} | Total Projects: ${gradeBookData.projects.length}</div>
        </div>

        <div class="statistics">
            <div class="stat-item">
                <div class="stat-label">Class Average</div>
                <div class="stat-value">${classAvg}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Highest Grade</div>
                <div class="stat-value">${highestGrade}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Lowest Grade</div>
                <div class="stat-value">${lowestGrade}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Passing Rate</div>
                <div class="stat-value">${passingRate}%</div>
            </div>
        </div>

        <table class="gradebook-table">
            <thead>
                <tr>
                    <th class="student-name">Student</th>
                    ${gradeBookData.projects.map(project => `
                        <th class="project-header">
                            ${project.name}
                            <div class="project-details">
                                Max: ${project.maxPoints} | Weight: ${project.weight}%
                            </div>
                        </th>
                    `).join('')}
                    <th class="final-grade">Final Grade</th>
                </tr>
            </thead>
            <tbody>
                ${gradeBookData.students.map(student => {
            const finalGrade = calculateFinalGrade(student.id);
            return `
                        <tr>
                            <td class="student-name">
                                ${student.name}
                                <div class="student-id">${student.id}</div>
                            </td>
                            ${gradeBookData.projects.map(project => {
                const grade = gradeBookData.grades[student.id]?.[project.id];
                return `
                                    <td class="grade-cell">
                                        ${grade ? `
                                            ${grade.rawScore}/${project.maxPoints}<br>
                                            <span style="font-size: 10px; color: #6b7280;">
                                                ${grade.percentage}% (${grade.letterGrade})
                                            </span>
                                        ` : '<span class="no-data">-</span>'}
                                    </td>
                                `;
            }).join('')}
                            <td class="final-grade">
                                ${finalGrade.percentage}%<br>
                                <span style="font-size: 10px;">${finalGrade.letterGrade}</span>
                            </td>
                        </tr>
                    `;
        }).join('')}
            </tbody>
        </table>

        <div style="margin-top: 30px; padding: 15px; background-color: #f8fafc; border-radius: 8px; font-size: 11px; color: #6b7280;">
            <strong>Export Details:</strong><br>
            Generated by Privacy-Focused Gradebook | Session-Only Storage<br>
            Export Date: ${exportTime}<br>
            Course: ${gradeBookData.metadata.courseCode} - ${gradeBookData.metadata.courseName}<br>
            Last Modified: ${gradeBookData.metadata.lastModified ? new Date(gradeBookData.metadata.lastModified).toLocaleString() : 'N/A'}
        </div>
    </div>
</body>
</html>`;

        // Create and download the HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gradebook_${gradeBookData.metadata.courseCode || 'course'}_${new Date().toISOString().split('T')[0]}.html`;
        link.click();
        URL.revokeObjectURL(url);

        console.log('✅ HTML gradebook with proper header exported successfully');
    };

    // Initialize gradebook from class list (preserved exactly with session checks)
    const initializeFromClassList = () => {
        if (!effectiveSessionActive) {
            if (!window.confirm('Session may be expired. Do you want to continue initializing from class list?')) {
                return;
            }
        }

        if (!classList || !classList.students) {
            alert('No class list available. Please import a class list first.');
            return;
        }

        const newGradeBookData = {
            projects: [
                {
                    id: 'project_1',
                    name: 'Project 1',
                    maxPoints: 100,
                    weight: 25,
                    created: new Date().toISOString()
                },
                {
                    id: 'project_2',
                    name: 'Project 2',
                    maxPoints: 100,
                    weight: 25,
                    created: new Date().toISOString()
                },
                {
                    id: 'project_3',
                    name: 'Project 3',
                    maxPoints: 100,
                    weight: 25,
                    created: new Date().toISOString()
                },
                {
                    id: 'project_4',
                    name: 'Project 4',
                    maxPoints: 100,
                    weight: 25,
                    created: new Date().toISOString()
                }
            ],
            students: classList.students.map(student => ({
                id: student.id,
                name: student.name,
                email: student.email || '',
                program: student.program || ''
            })),
            grades: {},
            metadata: {
                courseName: classList.courseMetadata?.courseName || '',
                courseCode: classList.courseMetadata?.courseCode || '',
                instructor: classList.courseMetadata?.instructor || '',
                term: new Date().getFullYear().toString(),
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                gradingPolicy: 'degree',
                sessionOnly: true
            }
        };

        setGradeBookData(newGradeBookData);
        setGradeBook(newGradeBookData);
        setIsGradeBookLoaded(true);

        alert(`Gradebook initialized with ${classList.students.length} students and 4 default projects.\n\n⚠️ Data will be cleared after 1 hour or when application restarts.`);
    };

    // Filter and sort students (preserved exactly)
    const getFilteredAndSortedStudents = () => {
        let filtered = gradeBookData.students;

        if (searchTerm) {
            filtered = filtered.filter(student =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.id && student.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
                (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

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

    const filteredStudents = getFilteredAndSortedStudents();

    // PRIVACY: Session warning modal component
    const SessionWarningModal = () => {
        if (!sessionWarning) return null;

        const formatTime = (ms) => {
            const minutes = Math.floor(ms / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-mx-4">
                    <div className="flex items-center mb-4">
                        <Timer className="w-6 h-6 text-orange-500 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Session Warning
                        </h3>
                    </div>

                    <div className="mb-4">
                        <p className="text-gray-700 mb-2">
                            {effectiveSessionActive
                                ? `Your session will expire in ${timeRemaining ? formatTime(timeRemaining) : 'less than 5 minutes'}.`
                                : 'Your session has expired for privacy protection.'
                            }
                        </p>
                        <p className="text-sm text-gray-600">
                            {effectiveSessionActive
                                ? 'All gradebook data will be automatically cleared when the session expires. Export your work before the session ends.'
                                : 'All data has been cleared. Please refresh the page to start a new session.'
                            }
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {effectiveSessionActive ? (
                            <>
                                <button
                                    onClick={() => {
                                        extendSession();
                                        setSessionWarning(false);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Extend Session
                                </button>
                                <button
                                    onClick={() => setSessionWarning(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                >
                                    Continue
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Start New Session
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // PRIVACY: Enhanced empty state with privacy notices
    const EmptyStateWithPrivacy = () => (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Grade Book</h1>
                <p className="text-gray-600">
                    Privacy-focused gradebook with session-only storage
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs flex items-center gap-1">
                        <Shield size={12} />
                        Privacy Mode - Session Only
                    </span>
                    {timeRemaining && effectiveSessionActive && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1">
                            <Timer size={12} />
                            {Math.floor(timeRemaining / 60000)}min remaining
                        </span>
                    )}
                    {!effectiveSessionActive && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1">
                            <Lock size={12} />
                            Session Expired
                        </span>
                    )}
                </div>
            </div>

            {/* PRIVACY: Enhanced privacy notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                    <Lock className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-semibold text-yellow-800">
                        Privacy Protection Active
                    </span>
                </div>
                <div className="text-xs text-yellow-700 space-y-1">
                    <div>• Gradebook data stored in session memory only (not saved to disk)</div>
                    <div>• Automatic data clearing after 1 hour or application restart</div>
                    <div>• Manual import required - no automatic loading of previous data</div>
                    <div>• Export your work before session expires to avoid data loss</div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Gradebook Loaded</h3>
                <p className="text-gray-600 mb-6">
                    For privacy protection, the gradebook starts empty. Import a previously exported gradebook or create a new one.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => importGradeBookRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Upload className="h-4 w-4" />
                        Import Gradebook JSON
                    </button>

                    {classList && classList.students && (
                        <button
                            onClick={initializeFromClassList}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Plus className="h-4 w-4" />
                            Create from Class List
                        </button>
                    )}

                    {(!classList || !classList.students) && (
                        <button
                            onClick={() => setActiveTab('class-manager')}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                            <Users className="h-4 w-4" />
                            Go to Class Manager
                        </button>
                    )}
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
                    <h4 className="font-medium text-blue-900 mb-2">Privacy Features:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Session-only storage (1 hour maximum)</li>
                        <li>• No automatic data persistence</li>
                        <li>• Manual import/export required</li>
                        <li>• All data cleared on restart</li>
                        <li>• Cross-tab data sharing during active session</li>
                    </ul>
                </div>
            </div>

            <input
                type="file"
                ref={importGradeBookRef}
                onChange={importGradeBook}
                accept=".json"
                className="hidden"
            />
        </div>
    );

    // Render empty state if no gradebook loaded
    if (!isGradeBookLoaded || gradeBookData.students.length === 0) {
        return (
            <>
                <SessionWarningModal />
                <EmptyStateWithPrivacy />
            </>
        );
    }

    // Main gradebook interface
    return (
        <>
            <SessionWarningModal />

            <div className="max-w-7xl mx-auto p-6">
                {/* Header with enhanced session status */}
                <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Grade Book</h1>
                            <p className="text-gray-600 mt-1">
                                {gradeBookData.metadata.courseCode} - {gradeBookData.metadata.courseName}
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-sm">
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs flex items-center gap-1">
                                    <Shield size={12} />
                                    Privacy Mode - Session Only
                                </span>
                                {timeRemaining && effectiveSessionActive && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1">
                                        <Timer size={12} />
                                        {Math.floor(timeRemaining / 60000)}min remaining
                                    </span>
                                )}
                                {!effectiveSessionActive && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1">
                                        <Lock size={12} />
                                        Session May Be Expired
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => importGradeBookRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Upload className="h-4 w-4" />
                                Import JSON
                            </button>
                            <button
                                onClick={exportGradeBook}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Download className="h-4 w-4" />
                                Export JSON
                            </button>
                            <button
                                onClick={exportToExcel}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                Export Excel
                            </button>
                            <button
                                onClick={exportToHTML}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                <FileText className="h-4 w-4" />
                                Export HTML
                            </button>
                        </div>
                    </div>

                    {/* Statistics */}
                    {gradeBookData.students.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
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
                                        <TrendingUp className="h-5 w-5 text-green-600" />
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
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-3">
                            <button
                                onClick={addProject}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                title="Add new project"
                            >
                                <Plus className="h-4 w-4" />
                                Add Project
                            </button>
                        </div>

                        <div className="flex gap-3 items-center">
                            <div className="relative">
                                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search students..."
                                    className="w-80 pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="id">Sort by ID</option>
                                <option value="finalGrade">Sort by Final Grade</option>
                            </select>

                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Collapsible debug info panel */}
                <details className="mb-4">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        🔍 Debug Info ({gradeBookData.projects.length} projects)
                    </summary>
                    <div className="bg-gray-50 rounded-lg p-3 mt-2 text-xs border">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div>Sessions: {String(sessionActive)}</div>
                            <div>Effective: {String(effectiveSessionActive)}</div>
                            <div>Projects: {gradeBookData.projects.length}</div>
                            <div>Students: {gradeBookData.students.length}</div>
                        </div>
                        {gradeBookData.projects.length > 0 && (
                            <div className="mt-2 text-xs">
                                <div className="font-semibold text-gray-700">Current Projects:</div>
                                <div className="grid grid-cols-2 gap-1 mt-1">
                                    {gradeBookData.projects.map((project, index) => (
                                        <div key={project.id} className="text-gray-600">
                                            {index + 1}. {project.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </details>

                {/* Gradebook Table - IMPROVED RESPONSIVE DESIGN */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48 min-w-48">
                                        Student
                                    </th>
                                    {gradeBookData.projects.map(project => (
                                        <th key={project.id} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32 w-32">
                                            <div className="space-y-1">
                                                {editingProject?.id === project.id && editingProject?.field === 'name' ? (
                                                    <input
                                                        type="text"
                                                        value={projectEditValue}
                                                        onChange={(e) => setProjectEditValue(e.target.value)}
                                                        onBlur={saveProjectEdit}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') saveProjectEdit();
                                                            if (e.key === 'Escape') cancelProjectEdit();
                                                        }}
                                                        className="w-full px-1 py-1 text-xs border rounded"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <button
                                                        onClick={() => startProjectEdit(project, 'name')}
                                                        className="text-gray-900 hover:text-blue-600 font-medium text-xs leading-tight"
                                                        title="Click to edit project name"
                                                    >
                                                        {project.name}
                                                    </button>
                                                )}

                                                <div className="flex flex-col gap-1 text-xs text-gray-500">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span className="text-xs">Max:</span>
                                                        {editingProject?.id === project.id && editingProject?.field === 'maxPoints' ? (
                                                            <input
                                                                type="number"
                                                                value={projectEditValue}
                                                                onChange={(e) => setProjectEditValue(e.target.value)}
                                                                onBlur={saveProjectEdit}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') saveProjectEdit();
                                                                    if (e.key === 'Escape') cancelProjectEdit();
                                                                }}
                                                                className="w-12 px-1 py-0 text-xs border rounded"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <button
                                                                onClick={() => startProjectEdit(project, 'maxPoints')}
                                                                className="hover:text-blue-600 text-xs"
                                                            >
                                                                {project.maxPoints}
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-center gap-1">
                                                        <span className="text-xs">Wt:</span>
                                                        {editingProject?.id === project.id && editingProject?.field === 'weight' ? (
                                                            <input
                                                                type="number"
                                                                value={projectEditValue}
                                                                onChange={(e) => setProjectEditValue(e.target.value)}
                                                                onBlur={saveProjectEdit}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') saveProjectEdit();
                                                                    if (e.key === 'Escape') cancelProjectEdit();
                                                                }}
                                                                className="w-10 px-1 py-0 text-xs border rounded"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <button
                                                                onClick={() => startProjectEdit(project, 'weight')}
                                                                className="hover:text-blue-600 text-xs"
                                                            >
                                                                {project.weight}%
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleImportGrades(project.id)}
                                                        className="p-1 text-gray-400 hover:text-green-600"
                                                        title="Import grades from Grading Tool"
                                                    >
                                                        <Upload className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeProject(project.id)}
                                                        className="p-1 text-gray-400 hover:text-red-600"
                                                        title="Remove project"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24 min-w-24">
                                        Final Grade
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.map(student => {
                                    const finalGrade = calculateFinalGrade(student.id);
                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap w-48">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 truncate">{student.name}</div>
                                                    <div className="text-xs text-gray-500 truncate">{student.id}</div>
                                                </div>
                                            </td>
                                            {gradeBookData.projects.map(project => {
                                                const grade = gradeBookData.grades[student.id]?.[project.id];
                                                const isEditingCell = selectedCell?.studentId === student.id && selectedCell?.projectId === project.id;

                                                return (
                                                    <td
                                                        key={project.id}
                                                        className="px-2 py-4 whitespace-nowrap text-center cursor-pointer hover:bg-blue-50 w-32"
                                                        onClick={() => !isEditingCell && startCellEdit(student.id, project.id)}
                                                    >
                                                        {isEditingCell ? (
                                                            <input
                                                                type="number"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                onBlur={saveEdit}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') saveEdit();
                                                                    if (e.key === 'Escape') cancelEdit();
                                                                }}
                                                                className="w-16 px-1 py-1 border border-blue-500 rounded text-center text-sm"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <div className="text-xs">
                                                                {grade ? (
                                                                    <div>
                                                                        <div className="font-medium text-gray-900">
                                                                            {grade.rawScore}/{project.maxPoints}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {grade.percentage}% ({grade.letterGrade})
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-gray-400">-</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-4 py-4 whitespace-nowrap text-center w-24">
                                                <div className="text-xs">
                                                    <div className="font-medium text-gray-900">
                                                        {finalGrade.percentage}%
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {finalGrade.letterGrade}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* New Project Added Notification */}
                    {gradeBookData.projects.length > 4 && (
                        <div className="bg-green-50 border-t border-green-200 px-4 py-3">
                            <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm text-green-800">
                                    {gradeBookData.projects.length} projects are now available. Scroll horizontally if needed to see all projects.
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* PRIVACY: Enhanced privacy notice for active gradebook */}
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center mb-2">
                        <Shield className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="text-sm font-semibold text-yellow-800">
                            Privacy Protection Active
                        </span>
                    </div>
                    <div className="text-xs text-yellow-700 space-y-1">
                        <div>• Gradebook data persists during your current session only</div>
                        <div>• All data will be automatically cleared after 1 hour or when application restarts</div>
                        <div>• Export your gradebook regularly to avoid data loss</div>
                        <div>• No data is saved to your device's permanent storage</div>
                    </div>
                </div>

                {/* Hidden file inputs */}
                <input
                    type="file"
                    ref={importGradeBookRef}
                    onChange={importGradeBook}
                    accept=".json"
                    className="hidden"
                />

                {/* Confirmation Dialog */}
                {confirmDialog.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Action</h3>
                            <p className="text-gray-700 mb-4">{confirmDialog.message}</p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setConfirmDialog({ show: false, message: '', onConfirm: null })}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDialog.onConfirm}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default GradeBook;