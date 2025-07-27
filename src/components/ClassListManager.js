import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
    Upload,
    Users,
    BookOpen,
    GraduationCap,
    Play,
    Download,
    CheckCircle,
    Clock,
    AlertCircle,
    Unlock,
    FileText,
    ExternalLink,
    FileSpreadsheet,
    CheckCircle2,
    Settings
} from 'lucide-react';
import { useAssessment, DEFAULT_LATE_POLICY } from './SharedContext';
import { parseExcelFile, validateStudentData } from '../utils/excelParser';
import { getSchoolLogo, generateReportHeader, getReportStyles, hasSchoolLogo } from './logoIntegrationUtility';

// Add new imports for grading policy management
import gradingPolicyService from '../services/gradingPolicyService';
import {
    useGradingPolicies,
    useGradingPolicyForProgram,
    useGradeCalculation,
    useGradingPolicyManager
} from '../hooks/useGradingPolicies';
// Add gradebook utilities import for letter grade calculation
import { percentageToLetterGrade } from '../utils/gradebookUtilis';
/**
 * Enhanced getLetterGrade function with dynamic policy support
 * Falls back to original hardcoded scales if policy service fails
 */
const getLetterGrade = async (percentage, programType, customProgramId = null, selectedPolicy = null) => {
    // Try dynamic policy calculation first
    try {
        const result = await gradingPolicyService.calculateGrade(
            percentage,
            selectedPolicy?.id,
            programType,
            customProgramId
        );

        if (result.success) {
            return result.data.letter;
        }
    } catch (error) {
        console.warn('Dynamic grading failed, using legacy fallback:', error);
    }

    // Legacy fallback - your original hardcoded scales (preserved exactly)
    const scales = {
        degree: [
            { min: 90, grade: 'A+' },
            { min: 80, grade: 'A' },
            { min: 75, grade: 'B+' },
            { min: 70, grade: 'B' },
            { min: 65, grade: 'C+' },
            { min: 60, grade: 'C' },
            { min: 0, grade: 'F' }
        ],
        diploma: [
            { min: 90, grade: 'A+' },
            { min: 80, grade: 'A' },
            { min: 75, grade: 'B+' },
            { min: 70, grade: 'B' },
            { min: 65, grade: 'C+' },
            { min: 60, grade: 'C' },
            { min: 0, grade: 'F' }
        ],
        certificate: [
            { min: 90, grade: 'A+' },
            { min: 80, grade: 'A' },
            { min: 75, grade: 'B+' },
            { min: 70, grade: 'B' },
            { min: 65, grade: 'C+' },
            { min: 60, grade: 'C' },
            { min: 0, grade: 'F' }
        ],
        graduateCertificate: [
            { min: 90, grade: 'A+' },
            { min: 80, grade: 'A' },
            { min: 75, grade: 'B+' },
            { min: 70, grade: 'B' },
            { min: 65, grade: 'C+' },
            { min: 60, grade: 'C' },
            { min: 0, grade: 'F' }
        ]
    };

    // Pick the right scale (default to degree if missing)
    const scale = scales[programType] || scales.degree;

    // Find the first entry where percentage ≥ min
    const entry = scale.find(e => percentage >= e.min);

    return entry ? entry.grade : 'N/A';
};

const ClassListManager = () => {
    const fileInputRef = useRef(null);
    const [importStatus, setImportStatus] = useState('');

    // Add new grading policy state management using TanStack Query hooks
    const { data: availablePolicies = [], isLoading: policiesLoading } = useGradingPolicies({ isActive: true });
    const [currentProgramType, setCurrentProgramType] = useState('degree');
    const { data: selectedPolicy } = useGradingPolicyForProgram(currentProgramType);
    const gradeCalculation = useGradeCalculation();
    const { prefetchPolicyForProgram } = useGradingPolicyManager();

    const {
        classList,
        setClassList,
        gradingSession,
        setGradingSession,
        initializeGradingSession,
        setActiveTab,
        setCurrentStudent,
        hasDraft,
        getGradeStatus,
        saveFinalGrade,
        loadDraft,
        saveDraft,
        drafts,
        sharedRubric,
        updateStudentInfo,
        updateAssignmentInfo,
        updateCourseInfo, // FIXED: Added updateCourseInfo from the context
        loadFinalGrade,
        finalGrades,
        rubricFormData,
        currentLatePolicy,
    } = useAssessment();

    

    // Load current program type from class metadata and update policy
    useEffect(() => {
        if (classList?.courseMetadata?.programType) {
            setCurrentProgramType(classList.courseMetadata.programType);
        }
    }, [classList?.courseMetadata?.programType]);

    // Prefetch policies for better UX
    useEffect(() => {
        const programTypes = ['degree', 'diploma', 'certificate', 'graduateCertificate', 'apprenticeship', 'healthScience', 'gasTechnician'];
        programTypes.forEach(type => {
            if (type !== currentProgramType) {
                prefetchPolicyForProgram(type);
            }
        });
    }, [currentProgramType, prefetchPolicyForProgram]);

    // Enhanced handler to change the program type for grading with policy loading
    const handleProgramTypeChange = (e) => {
        const newType = e.target.value;
        setCurrentProgramType(newType);
        setClassList(prev => ({
            ...prev,
            courseMetadata: {
                ...prev.courseMetadata,
                programType: newType,
            },
        }));
    };

    // Helper function for status display (preserved exactly from original)
    const getStatusDisplay = (progress, studentId) => {
        const gradeStatus = getGradeStatus(studentId);

        if (gradeStatus === 'final') {
            return (
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                        Final
                    </span>
                </div>
            );
        } else if (gradeStatus === 'draft') {
            return (
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                        Draft
                    </span>
                </div>
            );
        } else if (progress?.status === 'in-progress') {
            return (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                        In Progress
                    </span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        Not Started
                    </span>
                </div>
            );
        }
    };

    // Helper function to finalize a draft grade (preserved exactly from original)
    const finalizeGrade = (studentId) => {
        const draftData = drafts[studentId];
        if (draftData) {
            saveFinalGrade(studentId, draftData);

            // Update class list progress
            const studentIndex = classList.students.findIndex(s => s.id === studentId);
            if (studentIndex >= 0) {
                const updatedProgress = [...classList.gradingProgress];
                updatedProgress[studentIndex] = {
                    ...updatedProgress[studentIndex],
                    status: 'completed_final',
                    lastModified: new Date().toISOString(),
                    gradeType: 'final'
                };
                setClassList(prev => ({
                    ...prev,
                    gradingProgress: updatedProgress
                }));
            }
        }
    };

    // Helper function to unlock a final grade (preserved exactly from original)
    const unlockGrade = (studentId) => {
        // For now, we'll implement this by updating the class list progress
        // The actual unlocking logic should be implemented in SharedContext
        const studentIndex = classList.students.findIndex(s => s.id === studentId);
        if (studentIndex >= 0) {
            const updatedProgress = [...classList.gradingProgress];
            updatedProgress[studentIndex] = {
                ...updatedProgress[studentIndex],
                status: 'completed_draft',
                lastModified: new Date().toISOString(),
                gradeType: 'draft'
            };
            setClassList(prev => ({
                ...prev,
                gradingProgress: updatedProgress
            }));
        }

        // Note: Full unlock functionality requires additional implementation in SharedContext
        console.log('Unlock grade for student:', studentId);
    };

    // Helper function to load final grade data (preserved exactly from original)
    const loadFinalGradeData = (studentId) => {
        // Use loadFinalGrade if available, otherwise fallback to checking finalGrades directly
        if (typeof loadFinalGrade === 'function') {
            return loadFinalGrade(studentId);
        }
        // Fallback: check finalGrades directly if available
        if (finalGrades && finalGrades[studentId]) {
            return finalGrades[studentId];
        }
        // Last resort: check drafts (this maintains current behavior)
        return drafts[studentId] || null;
    };

    // **ENHANCED**: This function now uses dynamic grading with fallback to legacy calculation
    // ENHANCED calculateStudentGrade function for ClassListManager.js
    // Replace the existing calculateStudentGrade function (around lines 200-280)

    const calculateStudentGrade = async (studentId) => {
        const gradeStatus = getGradeStatus(studentId);
        let gradeData = null;

        if (gradeStatus === 'final') {
            gradeData = loadFinalGradeData(studentId);
        } else if (gradeStatus === 'draft') {
            gradeData = loadDraft(studentId);
        }

        // If no grade data, return empty result
        if (!gradeData || !sharedRubric || !sharedRubric.criteria) {
            return {
                score: 'N/A',
                maxPossible: sharedRubric?.assignmentInfo?.totalPoints || 100,
                percentage: 'N/A',
                letterGrade: 'N/A'
            };
        }

        // Calculate raw score from rubric grading
        let totalScore = 0;
        let maxScore = sharedRubric.assignmentInfo?.totalPoints || 0;

        if (gradeData.rubricGrading) {
            sharedRubric.criteria.forEach(criterion => {
                const rubricGrading = gradeData.rubricGrading[criterion.id];
                if (rubricGrading && rubricGrading.selectedLevel) {
                    const level = sharedRubric.rubricLevels.find(l => l.level === rubricGrading.selectedLevel);
                    if (level) {
                        totalScore += criterion.maxPoints * level.multiplier;
                    }
                }
            });
        }

        // Apply late policy if applicable
        const activeLevels = currentLatePolicy?.levels || DEFAULT_LATE_POLICY.levels;
        let finalScore = totalScore;

        if (gradeData.latePolicy && gradeData.latePolicy.level !== 'none') {
            const latePolicyLevel = activeLevels[gradeData.latePolicy.level] || activeLevels.none;
            finalScore = totalScore * latePolicyLevel.multiplier;
        }

        // Calculate percentage
        const percentage = maxScore > 0 ? Math.round((finalScore / maxScore) * 100) : 0;

        // ENHANCED: Determine program type from student and class data
        const student = classList.students.find(s => s.id === studentId);
        const programType = student?.program?.toLowerCase() ||
            classList.courseMetadata?.programType?.toLowerCase() ||
            'degree'; // default fallback

        // ENHANCED: Use dynamic letter grade calculation with proper program type detection
        let letterGrade = 'N/A';

        try {
            // First try using the grading policy service
            if (gradingPolicyService) {
                const gradeResult = await gradingPolicyService.calculateGrade(
                    percentage,
                    null, // policyId - let it auto-select
                    programType,
                    classList.courseMetadata?.customProgramId
                );

                if (gradeResult.success && gradeResult.data?.letter) {
                    letterGrade = gradeResult.data.letter;
                }
            }

            // Fallback to gradebook utilities if grading service fails
            if (letterGrade === 'N/A') {
                // Import the utility function if not already imported from '../utils/gradebookUtilis'
                if (typeof percentageToLetterGrade === 'function') {
                    letterGrade = percentageToLetterGrade(percentage, programType);
                } else {
                    // Manual fallback calculation
                    letterGrade = getLetterGradeFallback(percentage, programType);
                }
            }
        } catch (error) {
            console.warn('Error calculating letter grade, using fallback:', error);
            letterGrade = getLetterGradeFallback(percentage, programType);
        }

        return {
            score: Math.round(finalScore * 10) / 10,
            maxPossible: maxScore,
            percentage,
            letterGrade
        };
    };

    // ENHANCED: Fallback letter grade calculation function
    const getLetterGradeFallback = (percentage, programType = 'degree') => {
        // Define grading scales for different program types
        const gradingScales = {
            degree: [
                { min: 90, grade: 'A+' },
                { min: 85, grade: 'A' },
                { min: 80, grade: 'A-' },
                { min: 77, grade: 'B+' },
                { min: 73, grade: 'B' },
                { min: 70, grade: 'B-' },
                { min: 67, grade: 'C+' },
                { min: 63, grade: 'C' },
                { min: 60, grade: 'C-' },
                { min: 50, grade: 'D' },
                { min: 0, grade: 'F' }
            ],
            diploma: [
                { min: 90, grade: 'A+' },
                { min: 80, grade: 'A' },
                { min: 75, grade: 'B+' },
                { min: 70, grade: 'B' },
                { min: 65, grade: 'C+' },
                { min: 60, grade: 'C' },
                { min: 50, grade: 'D' },
                { min: 0, grade: 'F' }
            ],
            certificate: [
                { min: 80, grade: 'A' },
                { min: 70, grade: 'B' },
                { min: 60, grade: 'C' },
                { min: 0, grade: 'F' }
            ]
        };

        const scale = gradingScales[programType] || gradingScales.degree;

        for (const { min, grade } of scale) {
            if (percentage >= min) {
                return grade;
            }
        }

        return 'F';
    };

    // Helper function to load student for grading (preserved exactly from original)
    const loadStudentForGrading = (student) => {
        const gradeStatus = getGradeStatus(student.id);

        // Set the current student first
        setCurrentStudent(student);

        // Load the student info into the grading form
        updateStudentInfo('name', student.name || '');
        updateStudentInfo('id', student.id || '');
        updateStudentInfo('email', student.email || '');

        // Load rubric assignment info if available
        if (sharedRubric) {
            updateAssignmentInfo({
                name: sharedRubric.assignmentInfo?.title || '',
                maxPoints: sharedRubric.assignmentInfo?.totalPoints || 100
            });
        }

        // Provide user feedback and load appropriate data
        if (gradeStatus === 'final') {
            const finalData = loadFinalGradeData(student.id);
            console.log(`Loading final grade for ${student.name}:`, finalData ? 'Found' : 'Not found');
        } else if (gradeStatus === 'draft') {
            const draftData = loadDraft(student.id);
            console.log(`Loading draft for ${student.name}:`, draftData ? 'Found' : 'Not found');
        } else {
            console.log(`Starting new grade for ${student.name}`);
        }

        // Switch to grading tool - the GradingTemplate useEffect will handle loading the data
        setActiveTab('grading-tool');

        // Note: The actual data loading happens in GradingTemplate's useEffect for currentStudent
    };

    // Helper function to get grading progress statistics (preserved exactly from original)
    const getGradingProgress = () => {
        if (!classList) return { completed: 0, total: 0, percentage: 0, final: 0, draft: 0 };

        const final = classList.gradingProgress.filter(p =>
            p.status?.startsWith('completed_final')
        ).length;

        const draft = classList.gradingProgress.filter(p =>
            p.status?.startsWith('completed_draft')
        ).length;

        const completed = final + draft;
        const total = classList.students.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage, final, draft };
    };

    // FIXED: Export class grades as CSV with async/await properly handled
    const exportClassGradesCSV = async () => {
        if (!classList) return;

        console.log('🔄 Starting CSV export with async grade calculations...');

        // 1) Calculate grades for all students asynchronously
        const studentGrades = await Promise.all(
            classList.students.map(async (student, index) => {
                const progress = classList.gradingProgress[index] || {};
                const gradeInfo = await calculateStudentGrade(student.id);
                const lm = progress.lastModified
                    ? new Date(progress.lastModified).toLocaleDateString()
                    : 'Never';

                return [
                    index + 1,                            // # column
                    student.id,
                    student.name,
                    student.email,
                    student.program || 'N/A',
                    progress.status || 'pending',
                    progress.gradeType || 'none',
                    gradeInfo.score !== 'N/A'
                        ? `${gradeInfo.score}/${gradeInfo.maxPossible}`
                        : 'N/A',
                    gradeInfo.letterGrade || 'N/A',
                    gradeInfo.percentage !== 'N/A'
                        ? `${gradeInfo.percentage}%`
                        : 'N/A',
                    lm
                ];
            })
        );

        // 2) Build the complete data array with headers
        const rows = [
            ['#', 'Student ID', 'Student Name', 'Email', 'Program', 'Status', 'Grade Type', 'Numeric Grade', 'Letter Grade', 'Percentage', 'Last Modified'],
            ...studentGrades
        ];

        // 3) Quote each cell and create CSV
        const quote = cell => `"${String(cell).trim().replace(/"/g, '""')}"`;
        const csvContent = rows
            .map(row => row.map(quote).join(','))
            .join('\r\n');

        // 4) Trigger download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${classList.courseMetadata?.courseCode || 'class'}_grades_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        console.log('✅ CSV export completed with letter grades');
    };

    // Enhanced version of your existing getClassGradesHTML function
    const getClassGradesHTMLWithLogo = async () => {
        const now = new Date();
        const currentDate = now.toLocaleDateString('en-CA');
        const currentTime = now.toLocaleTimeString('en-CA');

        console.log('🔄 Generating class grades HTML with logo...');

        // Calculate grades for all students asynchronously (your existing logic)
        const studentRows = await Promise.all(
            classList.students.map(async (student, idx) => {
                const info = await calculateStudentGrade(student.id);
                const gradeDisplay = info.score !== 'N/A' ? `${info.score}%` : 'N/A';
                const letterGrade = info.letterGrade || 'N/A';
                const percentage = info.score !== 'N/A' ? `${info.score}%` : 'N/A';
                const lastModified = classList.gradingProgress[idx]?.lastModified
                    ? new Date(classList.gradingProgress[idx].lastModified).toLocaleDateString('en-CA')
                    : 'Not graded';

                return `
        <tr>
          <td>${idx + 1}</td>
          <td>${student.id}</td>
          <td>${student.name}</td>
          <td>${student.email}</td>
          <td>${student.program}</td>
          <td>${classList.gradingProgress[idx]?.status || 'pending'}</td>
          <td>${classList.gradingProgress[idx]?.gradeType || 'N/A'}</td>
          <td>${gradeDisplay}</td>
          <td>${letterGrade}</td>
          <td>${percentage}</td>
          <td>${lastModified}</td>
        </tr>
      `;
            })
        );

        const rowsHtml = studentRows.join('');

        // Use the logo utility to generate header
        const reportData = {
            title: '📊 Class Grade Report',  // ← FIXED: Correct title for class report
            courseCode: classList.courseMetadata?.courseCode || '',
            courseName: classList.courseMetadata?.courseName || '',
            section: classList.courseMetadata?.section || '',
            rubricTitle: sharedRubric?.assignmentInfo?.title || 'Unnamed Rubric'
        };

        return `<!DOCTYPE html>
<html>
<head>
  <title>Class Grade Report</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${getReportStyles()}
</head>
<body>
  ${generateReportHeader(reportData)}

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>#</th><th>Student ID</th><th>Name</th><th>Email</th>
          <th>Program</th><th>Status</th><th>Grade Type</th>
          <th>Final Grade</th><th>Letter Grade</th><th>Percentage</th><th>Last Modified</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </div>

  <div class="footer">
    Imported from: ${classList.fileName}
  </div>
</body>
</html>`;
    };

    // FIXED: Export class grades as HTML with async/await properly handled
    const exportClassGradesHTML = async () => {
        if (!classList) return;

        console.log('🔄 Exporting HTML with async grade calculations...');

        // Use the logo-enhanced version
        const htmlContent = await getClassGradesHTMLWithLogo();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `${classList.courseMetadata?.courseCode || 'Class'}_grades.html`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        console.log('✅ HTML export completed with letter grades and logo');
    };

    // Enhanced version of your existing getPortraitClassReportHTML function
    const getPortraitClassReportHTMLWithLogo = async () => {
        const now = new Date();
        const currentDate = now.toLocaleDateString('en-CA');
        const currentTime = now.toLocaleTimeString('en-CA');
        const rubricName = sharedRubric?.assignmentInfo?.title || 'Unnamed Rubric';

        console.log('🔄 Generating portrait report with logo and async grade calculations...');

        // Calculate grades for all students asynchronously (your existing logic)
        const studentRows = await Promise.all(
            classList.students.map(async (student, idx) => {
                const info = await calculateStudentGrade(student.id);
                const num = info.score !== 'N/A'
                    ? parseFloat(info.score)
                    : null;

                const rowClass = num !== null
                    ? (num >= 80 ? 'high-grade' : num >= 60 ? 'medium-grade' : 'low-grade')
                    : 'no-grade';

                return `
        <tr class="${rowClass}">
          <td style="text-align:center">${idx + 1}</td>
          <td>${student.id}</td>
          <td><strong>${student.name}</strong></td>
          <td>${student.email}</td>
          <td>${student.program}</td>
          <td style="text-align:center">${info.score !== 'N/A' ? `${info.score}%` : 'N/A'}</td>
          <td style="text-align:center; font-weight:bold">${info.letterGrade || 'N/A'}</td>
        </tr>
      `;
            })
        );

        const studentRowsHtml = studentRows.join('');

        // Use the logo utility to generate header
        const reportData = {
            title: '📊 Class Grade Report (Portrait)',
            courseCode: classList.courseMetadata?.courseCode || '',
            courseName: classList.courseMetadata?.courseName || '',
            section: classList.courseMetadata?.section || '',
            rubricTitle: rubricName
        };

        return `<!DOCTYPE html>
<html>
<head>
  <title>Class Grade Report</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${getReportStyles()}
  <style>
    .high-grade { background-color: #d4edda !important; }
    .medium-grade { background-color: #fff3cd !important; }
    .low-grade { background-color: #f8d7da !important; }
    .no-grade { background-color: #f8f9fa !important; }
    
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    
    @media print {
      body { 
        font-size: 10pt; 
        background: white;
      }
      .school-logo, .report-logo { 
        max-height: 50px !important; 
      }
      table { 
        page-break-inside: auto; 
      }
      tr { 
        page-break-inside: avoid; 
        page-break-after: auto; 
      }
      thead { 
        display: table-header-group; 
      }
    }
  </style>
</head>
<body>
  ${generateReportHeader(reportData, { maxHeight: 60 })}

  <div class="table-container">
    <table>
      <thead>
        <tr style="background-color: #2563eb; color: white;">
          <th style="text-align:center">#</th>
          <th>Student ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Program</th>
          <th style="text-align:center">Grade</th>
          <th style="text-align:center">Letter</th>
        </tr>
      </thead>
      <tbody>
        ${studentRowsHtml}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
      <strong>Grade Distribution Summary</strong><br>
      Report generated on ${currentDate} at ${currentTime}<br>
      Total Students: ${classList.students.length} | Rubric: ${rubricName}
    </div>
  </div>
</body>
</html>`;
    };

    // FIXED: Export portrait PDF with async/await properly handled
    const exportClassGradesPortraitPDF = async () => {
        if (!classList) return;

        console.log('🔄 Generating PDF with async grade calculations and logo...');

        // Use the logo-enhanced version
        const htmlContent = await getPortraitClassReportHTMLWithLogo();
        const printWin = window.open('', '_blank', 'width=800,height=600');
        printWin.document.write(htmlContent);
        printWin.document.close();
        printWin.focus();

        printWin.onload = () => {
            printWin.print();
        };

        console.log('✅ PDF generation completed with letter grades and logo');
    };

    // Complete exportStudentGrade function for ClassListManager.js (preserved exactly from original)
    const exportStudentGrade = (studentId) => {
        // 1. Make sure we have a classList and sharedRubric
        if (!classList || !sharedRubric) {
            alert('No class list or rubric available. Please ensure both are loaded.');
            return;
        }

        // 2. Find the student in the class list
        const student = classList.students.find(s => s.id === studentId);
        if (!student) {
            alert('Student not found in class list.');
            return;
        }

        // 3. Load the student's grade data
        const gradeStatus = getGradeStatus(studentId);
        let gradeData = null;

        if (gradeStatus === 'final') {
            gradeData = loadFinalGradeData(studentId);
        } else if (gradeStatus === 'draft') {
            gradeData = loadDraft(studentId);
        } else {
            alert('No grade data found for this student. Please grade the student first.');
            return;
        }

        if (!gradeData) {
            alert('Unable to load grade data for this student.');
            return;
        }

        // 4. Access active late policy levels
        const activeLevels = currentLatePolicy?.levels || DEFAULT_LATE_POLICY.levels;
        const getSafeLatePolicy = (level) => {
            if (!level || typeof level !== "string" || !activeLevels[level]) {
                return activeLevels.none;
            }
            return activeLevels[level];
        };

        // 5. Calculate scores (replicated from GradingTemplate.js)
        const calculateTotalScore = () => {
            if (!sharedRubric || !gradeData.rubricGrading) {
                return { finalScore: 0, rawScore: 0, penaltyApplied: false };
            }

            let totalScore = 0;
            const totalPossible = sharedRubric.assignmentInfo.totalPoints;

            sharedRubric.criteria.forEach(criterion => {
                const rubricGrading = gradeData.rubricGrading[criterion.id];
                if (rubricGrading && rubricGrading.selectedLevel) {
                    const level = sharedRubric.rubricLevels.find(l => l.level === rubricGrading.selectedLevel);
                    if (level) {
                        const points = criterion.maxPoints * level.multiplier;
                        totalScore += points;
                    }
                }
            });

            const rawScore = totalScore;
            let finalScore = totalScore;
            let penaltyApplied = false;

            // Apply late penalty if applicable
            if (gradeData.latePolicy && gradeData.latePolicy.level !== 'none') {
                const latePolicyLevel = getSafeLatePolicy(gradeData.latePolicy?.level);
                if (latePolicyLevel) {
                    finalScore = totalScore * latePolicyLevel.multiplier;
                    penaltyApplied = true;
                }
            }

            return { finalScore, rawScore, penaltyApplied };
        };

        // 6. Generate HTML report (based on GradingTemplate.js generateStudentReportHTML)
        // 6. Generate HTML report with logo integration (UPDATED VERSION)
        const generateStudentReportHTML = () => {
            const scoreCalculation = calculateTotalScore();
            const totalScore = scoreCalculation.finalScore;
            const rawScore = scoreCalculation.rawScore;
            const maxPoints = sharedRubric.assignmentInfo.totalPoints;
            const percentage = ((totalScore / (maxPoints || 1)) * 100).toFixed(1);
            const penaltyApplied = scoreCalculation.penaltyApplied;

            // Generate attachments HTML (UNCHANGED)
            const attachmentsHTML = gradeData.attachments?.map((att, index) => {
                if (att.base64Data) {
                    return `<div class="attachment-item"><img src="${att.base64Data}" alt="${att.name}" class="clickable-image" data-index="${index}" style="max-width: 200px; max-height: 200px; object-fit: contain; display: block; margin-bottom: 0.5rem; border: 1px solid #ddd; border-radius: 4px;" /><div style="font-size: 0.875rem; font-weight: 500; word-break: break-word;">${att.name}</div><div style="font-size: 0.75rem; color: #666;">${(att.size / 1024).toFixed(1)} KB</div><div style="font-size: 0.75rem; color: #007bff; margin-top: 4px;">Click to enlarge</div></div>`;
                } else {
                    return `<div class="attachment-item"><div style="width: 40px; height: 40px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem auto;">📄</div><div style="font-size: 0.875rem; font-weight: 500; word-break: break-word;">${att.name}</div><div style="font-size: 0.75rem; color: #666;">${(att.size / 1024).toFixed(1)} KB</div></div>`;
                }
            }).join('') || '';

            // Generate video links HTML (UNCHANGED)
            const videoLinksHTML = gradeData.videoLinks?.map(link =>
                `<div class="video-link-item" style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;"><div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;"><span style="font-size: 1.25rem;">🎥</span><strong style="color: #495057;">${link.title}</strong></div><a href="${link.url}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none; word-break: break-all;">${link.url}</a></div>`
            ).join('') || '';

            // Generate rubric table HTML (UNCHANGED)
            const rubricTableHTML = sharedRubric ? `
    <div style="margin: 30px 0;">
        <h3>📊 Detailed Rubric Assessment</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9rem;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Criterion</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: center; width: 120px;">Level Achieved</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: center; width: 80px;">Points</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Details & Comments</th>
                </tr>
            </thead>
            <tbody>
                ${sharedRubric.criteria.map(criterion => {
                const rubricGrading = gradeData.rubricGrading?.[criterion.id];
                const selectedLevel = rubricGrading?.selectedLevel;
                const level = selectedLevel ? sharedRubric.rubricLevels.find(l => l.level === selectedLevel) : null;
                const points = level ? Math.round(criterion.maxPoints * level.multiplier * 10) / 10 : 0;
                const levelDescription = level && criterion.levels?.[selectedLevel]?.description ? criterion.levels[selectedLevel].description : '';
                const additionalComments = rubricGrading?.customComments || '';

                return `<tr>
                            <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">
                                <strong>${criterion.name}</strong><br>
                                <small style="color: #666;">${criterion.description || ''}</small><br>
                                <small style="color: #888;">Max Points: ${criterion.maxPoints}</small>
                            </td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; vertical-align: top;">
                                <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; background: ${level?.color || '#f0f0f0'}; color: white;">
                                    ${level?.name || 'Not Assessed'}
                                </span>
                            </td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; font-size: 1.1em; color: #2c3e50;">${points}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">
                                ${levelDescription ? `<div style="margin-bottom: 10px; padding: 8px; background: #f8f9fa; border-left: 4px solid ${level.color}; border-radius: 4px;"><strong style="color: ${level.color};">Level Description:</strong><br><span style="font-size: 0.85em; line-height: 1.4;">${levelDescription}</span></div>` : ''}
                                ${additionalComments ? `<div style="margin-top: 8px; padding: 8px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;"><strong style="color: #856404;">Additional Comments:</strong><br><span style="font-size: 0.85em; line-height: 1.4; white-space: pre-wrap;">${additionalComments}</span></div>` : ''}
                                ${(!levelDescription && !additionalComments) ? '<em style="color: #999;">No assessment provided</em>' : ''}
                            </td>
                        </tr>`;
            }).join('')}
            </tbody>
        </table>
        <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <h4 style="color: #2e7d32; margin-bottom: 10px;">📊 Rubric Score Summary</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div><strong>Total Score:</strong> ${Math.round(totalScore * 10) / 10} / ${maxPoints}<br><strong>Percentage:</strong> ${percentage}%</div>
                <div><strong>Grade Status:</strong><span style="color: ${percentage >= sharedRubric.assignmentInfo.passingThreshold ? '#4caf50' : '#f44336'}; font-weight: bold;">${percentage >= sharedRubric.assignmentInfo.passingThreshold ? '✓ PASSING' : '✗ NEEDS IMPROVEMENT'}</span></div>
                ${penaltyApplied ? `<div style="color: #ff9800;"><strong>Late Penalty Applied:</strong><br>Raw Score: ${Math.round(rawScore * 10) / 10}</div>` : ''}
            </div>
        </div>
    </div>` : '';

            // NEW: Generate header with logo using utility
            const reportData = {
                title: `📄 Individual Grade Report: ${student.name}`,
                courseCode: classList.courseMetadata?.courseCode || gradeData.course?.code || '',
                courseName: classList.courseMetadata?.courseName || gradeData.course?.name || '',
                section: classList.courseMetadata?.section || '',
                rubricTitle: sharedRubric?.assignmentInfo?.title || gradeData.assignment?.name || 'Unnamed Rubric'
            };

            const headerHtml = generateReportHeader(reportData, { maxHeight: 60 });

            // Complete HTML document with logo integration
            const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grade Report - ${student.name}</title>
    ${getReportStyles()}
    <style>
        /* Additional styles specific to individual reports */
        .score-summary { 
            background: #e8f5e8; 
            border: 2px solid #4caf50; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
            text-align: center; 
        }
        .late-policy-section { 
            margin: 30px 0; 
            background: #fff5f5; 
            border: 1px solid #f87171; 
            border-radius: 8px; 
            padding: 20px; 
        }
        .feedback-section { 
            margin: 20px 0; 
            padding: 15px; 
            background: #f9f9f9; 
            border-radius: 8px; 
        }
        .attachments { 
            margin: 30px 0; 
        }
        .attachment-item { 
            display: inline-block; 
            text-align: center; 
            margin: 1rem; 
            padding: 1rem; 
            background: #fff; 
            border: 1px solid #ddd; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,.1); 
            max-width: 250px; 
            vertical-align: top; 
        }
        .clickable-image { 
            cursor: pointer; 
            transition: all .3s ease; 
            position: relative; 
        }
        .clickable-image:hover { 
            transform: scale(1.05); 
            box-shadow: 0 4px 8px rgba(0,0,0,.2); 
        }
        .video-links { 
            margin: 30px 0; 
        }
        .video-link-item { 
            margin-bottom: 1rem; 
        }
        .video-link-item a { 
            color: #007bff; 
            text-decoration: none; 
        }
        .video-link-item a:hover { 
            text-decoration: underline; 
        }
        .image-modal { 
            display: none; 
            position: fixed; 
            z-index: 1000; 
            left: 0; 
            top: 0; 
            width: 100%; 
            height: 100%; 
            background-color: rgba(0,0,0,.9); 
            animation: fadeIn .3s ease; 
        }
        .image-modal.show { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
        }
        .modal-content { 
            max-width: 95%; 
            max-height: 95%; 
            object-fit: contain; 
            border-radius: 8px; 
            box-shadow: 0 4px 20px rgba(0,0,0,.5); 
            animation: zoomIn .3s ease; 
        }
        .close-modal { 
            position: absolute; 
            top: 20px; 
            right: 30px; 
            color: #fff; 
            font-size: 40px; 
            font-weight: 700; 
            cursor: pointer; 
            z-index: 1001; 
            background: rgba(0,0,0,.5); 
            border-radius: 50%; 
            width: 50px; 
            height: 50px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            line-height: 1; 
        }
        .close-modal:hover { 
            background: rgba(0,0,0,.8); 
        }
        .modal-caption { 
            position: absolute; 
            bottom: 20px; 
            left: 50%; 
            transform: translateX(-50%); 
            color: #fff; 
            background: rgba(0,0,0,.7); 
            padding: 10px 20px; 
            border-radius: 6px; 
            text-align: center; 
            max-width: 80%; 
        }
        @keyframes fadeIn { 
            from { opacity: 0; } 
            to { opacity: 1; } 
        }
        @keyframes zoomIn { 
            from { transform: scale(.5); opacity: 0; } 
            to { transform: scale(1); opacity: 1; } 
        }
        @media print { 
            .attachment-item, .video-link-item { 
                break-inside: avoid; 
            } 
            .image-modal { 
                display: none!important; 
            } 
        }
    </style>
</head>
<body>
    ${headerHtml}

    <div class="score-summary">
        <h2>📊 Final Score</h2>
        <div style="font-size: 2rem; font-weight: 700; color: #2e7d32; margin: 15px 0;">
            ${totalScore.toFixed(1)} / ${maxPoints} (${percentage}%)
        </div>
        <p style="margin: 10px 0; color: #555;">
            ${sharedRubric ? `Rubric: ${sharedRubric.assignmentInfo.title}` : ""}
            ${penaltyApplied ? ` | Late Policy: ${getSafeLatePolicy(gradeData.latePolicy?.level).name}` : ""}
        </p>
    </div>

    ${penaltyApplied ? `
        <div class="late-policy-section">
            <h3 style="color: #dc2626;">📅 Late Submission Policy Applied</h3>
            <p><strong>Policy Status:</strong> ${getSafeLatePolicy(gradeData.latePolicy?.level).name}</p>
            <p>${getSafeLatePolicy(gradeData.latePolicy?.level).description}</p>
            <p><strong>Raw Score:</strong> ${Math.round(rawScore * 10) / 10}/${maxPoints} → <strong>Final Score:</strong> ${Math.round(totalScore * 10) / 10}/${maxPoints}</p>
        </div>
    ` : ""}

    ${rubricTableHTML}

    ${Object.entries(gradeData.feedback || {}).filter(([key, text]) => text).map(([key, text]) => `
        <div class="feedback-section">
            <h3>${key.charAt(0).toUpperCase() + key.slice(1)} Feedback</h3>
            <p>${text.replace(/\n/g, "<br>")}</p>
        </div>
    `).join("")}

    ${attachmentsHTML ? `
        <div class="attachments">
            <h3>📎 File Attachments</h3>
            <div style="display: flex; flex-wrap: wrap; justify-content: flex-start;">
                ${attachmentsHTML}
            </div>
        </div>
    ` : ""}

    ${videoLinksHTML ? `
        <div class="video-links">
            <h3>🎥 Video Review Links</h3>
            ${videoLinksHTML}
        </div>
    ` : ""}

    <div class="footer">
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            <strong>Individual Grade Report</strong><br>
            Report generated on ${new Date().toLocaleDateString('en-CA')} at ${new Date().toLocaleTimeString('en-CA')}<br>
            Student: ${student.name} | Assignment: ${sharedRubric?.assignmentInfo?.title || 'Unnamed Assignment'}
            ${hasSchoolLogo() ? '<br>Generated with institutional branding' : ''}
        </div>
    </div>

    <div id="imageModal" class="image-modal">
        <span class="close-modal" onclick="closeImageModal()">&times;</span>
        <img class="modal-content" id="modalImage">
        <div class="modal-caption" id="modalCaption"></div>
    </div>

    <script>
        const attachmentData = ${JSON.stringify(gradeData.attachments || [])};
        
        function openImageModal(src, caption) {
            const modal = document.getElementById("imageModal");
            const modalImg = document.getElementById("modalImage");
            const modalCaption = document.getElementById("modalCaption");
            modal.classList.add("show");
            modalImg.src = src;
            modalCaption.textContent = caption;
            document.body.style.overflow = "hidden";
        }
        
        function closeImageModal() {
            document.getElementById("imageModal").classList.remove("show");
            document.body.style.overflow = "auto";
        }
        
        document.addEventListener("DOMContentLoaded", function() {
            document.querySelectorAll(".clickable-image").forEach(img => {
                img.addEventListener("click", function() {
                    const index = parseInt(this.getAttribute("data-index"));
                    const attachment = attachmentData[index];
                    if (attachment && attachment.base64Data) {
                        openImageModal(attachment.base64Data, attachment.name);
                    }
                });
            });
            
            document.getElementById("imageModal").addEventListener("click", function(e) {
                if (e.target === this) {
                    closeImageModal();
                }
            });
            
            document.addEventListener("keydown", function(e) {
                if (e.key === "Escape") {
                    closeImageModal();
                }
            });
        });
    </script>
</body>
</html>`;

            return htmlContent;
        };

        // 7. Generate and export the HTML file
        try {
            const htmlContent = generateStudentReportHTML();
            const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(htmlBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `grade_report_${student.name.replace(/[^a-zA-Z0-9]/g, '_')}_${sharedRubric.assignmentInfo?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'assignment'}.html`;
            link.click();
            URL.revokeObjectURL(url);

            console.log(`✅ Individual grade report exported for student: ${student.name}`);
        } catch (error) {
            console.error('Error generating individual grade report:', error);
            alert('Error generating grade report. Please check the console for details.');
        }
    };

    // File upload handling (preserved exactly from original)
    // COMPLETE ENHANCED handleFileUpload function - replaces lines ~600-650 in ClassListManager.js
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImportStatus('processing');

        try {
            // Use Excel parser instead of manual CSV parsing
            const result = await parseExcelFile(file);

            if (!result.success) {
                throw new Error(result.error || 'Failed to parse Excel file');
            }

            // Validate the parsed student data
            const validation = validateStudentData(result.students);

            if (result.students.length === 0) {
                throw new Error('No valid student records found in Excel file');
            }

            // Create grading progress tracking for each student
            const gradingProgress = result.students.map(() => ({
                status: 'pending',
                lastModified: null,
                gradeType: null
            }));

            // ENHANCED: Create the class list data structure with proper field mapping
            const classListData = {
                students: result.students,
                gradingProgress,
                fileName: file.name,
                fileSize: file.size,
                importTime: new Date().toISOString(),
                courseMetadata: {
                    courseCode: result.courseMetadata?.courseCode || 'IMPORTED',
                    courseName: result.courseMetadata?.courseName || 'Excel Import',
                    section: result.courseMetadata?.section || 'DEFAULT',
                    programType: result.courseMetadata?.programType || 'degree',
                    // ENHANCED: Handle both instructor and professors fields
                    professors: result.courseMetadata?.professors || 'TBD',
                    instructor: result.courseMetadata?.instructor || result.courseMetadata?.professors || 'TBD',
                    term: result.courseMetadata?.term || 'TBD',
                    hours: result.courseMetadata?.hours || '',
                    gradeScale: result.courseMetadata?.gradeScale || '',
                    department: result.courseMetadata?.department || '',
                    campus: result.courseMetadata?.campus || '',
                    totalStudents: result.students.length
                },
                validation: {
                    validationScore: validation.validationScore || 100,
                    issues: validation.issues || []
                }
            };

            setClassList(classListData);
            setImportStatus('success');

            // ENHANCED: Auto-populate course information using corrected field mapping
            if (result.courseMetadata) {
                const courseInfo = {
                    code: result.courseMetadata.courseCode || '',
                    name: result.courseMetadata.courseName || '',
                    instructor: result.courseMetadata.instructor || result.courseMetadata.professors || '',
                    term: result.courseMetadata.term || ''
                };

                console.log('📊 Auto-populating course info from Excel:', courseInfo);
                // Note: updateCourseInfo should be available from useAssessment hook
                if (typeof updateCourseInfo === 'function') {
                    Object.entries(courseInfo).forEach(([field, value]) => {
                        updateCourseInfo(field, value);
                    });
                }
            }

            console.log('✅ Excel import completed successfully:', {
                students: result.students.length,
                courseMetadata: classListData.courseMetadata
            });

            setTimeout(() => setImportStatus(''), 3000);
        } catch (error) {
            console.error('Excel import error:', error);
            setImportStatus('error');
            setTimeout(() => setImportStatus(''), 3000);
        }
    };

    // ENHANCED startGradingSession function - replaces lines ~670-690 in ClassListManager.js
    const startGradingSession = () => {
        if (!classList || classList.students.length === 0) {
            alert('No students available for grading.');
            return;
        }

        if (!sharedRubric) {
            alert('Please load a rubric before starting batch grading.');
            return;
        }

        console.log('🚀 Starting grading session with class data:', {
            studentCount: classList.students.length,
            courseMetadata: classList.courseMetadata,
            rubricTitle: sharedRubric.assignmentInfo?.title
        });

        // Initialize the grading session with enhanced data
        const success = initializeGradingSession(classList);

        if (success) {
            setActiveTab('grading-tool');

            // Show enhanced success message with course info confirmation
            const courseInfo = classList.courseMetadata;
            alert(
                `🎯 Batch Grading Started!\n\n` +
                `Rubric: ${sharedRubric.assignmentInfo?.title || 'Untitled'}\n` +
                `Students: ${classList.students.length}\n` +
                `Course: ${courseInfo?.courseCode || 'N/A'} - ${courseInfo?.courseName || 'N/A'}\n` +
                `Instructor: ${courseInfo?.instructor || courseInfo?.professors || 'N/A'}\n` +
                `Term: ${courseInfo?.term || 'N/A'}\n\n` +
                `Starting with: ${classList.students[0]?.name || 'First Student'}`
            );
        } else {
            alert('Failed to initialize grading session. Please check the console for details.');
        }
    };

    // Pause the grading session
    const pauseGradingSession = () => {
        setGradingSession(prev => ({
            ...prev,
            active: false
        }));
    };

    // Resume the grading session
    const resumeGradingSession = () => {
        setGradingSession(prev => ({
            ...prev,
            active: true
        }));
        setActiveTab('grading-tool');
    };

    // NEW: Policy Preview Component
    const PolicyPreview = ({ policy }) => {
        if (!policy) return null;

        return (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm">
                    📋 Active Grading Policy: {policy.name}
                </h4>
                <p className="text-xs text-blue-700 mb-2">{policy.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-xs">
                    {policy.gradeScale?.slice(0, 4).map((grade, index) => (
                        <div key={index} className="bg-white p-1 rounded border text-center">
                            <div className="font-bold text-blue-800">{grade.letter}</div>
                            <div className="text-blue-600">{grade.minPercentage}%+</div>
                        </div>
                    ))}
                </div>

                {policy.gradeScale?.length > 4 && (
                    <div className="text-xs text-blue-600 mt-1">
                        ...and {policy.gradeScale.length - 4} more grades
                    </div>
                )}
            </div>
        );
    };

    // Enhanced program type dropdown with policy support
    const renderEnhancedProgramTypeDropdown = () => {
        const programTypes = gradingPolicyService.getSupportedProgramTypes();

        return (
            <div>
                <label htmlFor="programType" className="block text-sm font-bold text-gray-700">Program Type:</label>
                <select
                    id="programType"
                    name="programType"
                    value={classList.courseMetadata?.programType || 'degree'}
                    onChange={handleProgramTypeChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    {programTypes.map(type => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>

                {/* Policy Preview */}
                {selectedPolicy && <PolicyPreview policy={selectedPolicy} />}

                {/* Policy Loading Indicator */}
                {(policiesLoading || gradeCalculation.isPending) && (
                    <div className="flex items-center gap-2 text-blue-600 mt-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs">
                            {policiesLoading ? 'Loading grading policies...' : 'Calculating grade...'}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-7xl mx-auto">
                {/* Header (preserved exactly from original) */}
                <div className="bg-gradient-to-r text-gray-800 p-6 rounded-t-lg shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Class List Manager</h1>
                            <p className="text-gray-600">
                                Import, manage, and grade entire classes efficiently
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {classList && (
                                <div className="text-right">
                                    <div className="text-2xl font-bold">
                                        {classList.students.length}
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        Students
                                    </div>
                                </div>
                            )}
                            <Users size={48} className="text-gray-700" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-b-lg shadow-lg">
                    {/* Import Section (preserved exactly from original) */}
                    {!classList && (
                        <div className="p-8">
                            <div className="grid lg:grid-cols-3 gap-8">

                                {/* Left Column - Upload Area */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                        {/* Upload Header */}
                                        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-8 py-6 relative">
                                            {/* Semi-transparent overlay for better text contrast */}
                                            <div className="absolute inset-0 bg-black/20"></div>

                                            <div className="flex items-center space-x-3 relative z-10">
                                                <div className="bg-white/30 rounded-lg p-3 backdrop-blur-sm">
                                                    <FileSpreadsheet size={32} className="text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="text-3xl font-bold text-white drop-shadow-lg">Import Student List</h2>
                                                    <p className="text-gray-100 font-semibold text-lg drop-shadow-md">Upload your Excel file to get started</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Drag and Drop Area */}
                                        <div className="p-8">
                                            <div className="relative border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gray-50 rounded-xl p-12 text-center transition-all duration-300">
                                                <input
                                                    type="file"
                                                    accept=".xls,.xlsx"
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                    id="excel-upload"
                                                    ref={fileInputRef}
                                                />

                                                <div className="space-y-4">
                                                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <Upload size={32} className="text-gray-400" />
                                                    </div>

                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                            Drop your Excel file here
                                                        </h3>
                                                        <p className="text-gray-600 mb-6">
                                                            or click to browse and select your student roster
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                    >
                                                        Choose Excel File
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Status Messages */}
                                            {importStatus === 'loading' && (
                                                <div className="mt-6 flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                    <span className="text-blue-800 font-medium">
                                                        📊 Processing Excel file...
                                                    </span>
                                                </div>
                                            )}

                                            {importStatus === 'success' && (
                                                <div className="mt-6 flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <CheckCircle2 size={20} className="text-green-600" />
                                                    <span className="text-green-800 font-medium">
                                                        ✅ Excel file imported successfully!
                                                    </span>
                                                </div>
                                            )}

                                            {importStatus === 'error' && (
                                                <div className="mt-6 flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                                    <AlertCircle size={20} className="text-red-600" />
                                                    <span className="text-red-800 font-medium">
                                                        ✗ Error importing Excel file. Please check format and try again.
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Format Requirements */}
                                <div className="space-y-6">

                                    {/* Format Requirements Card */}
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                                <FileText size={20} className="mr-2 text-blue-600" />
                                                Excel Format Requirements
                                            </h3>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-2">Required Columns</h4>
                                                <div className="space-y-1">
                                                    {['ID', 'Name', 'Email'].map((col) => (
                                                        <div key={col} className="flex items-center space-x-2">
                                                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                                            <span className="text-sm text-gray-700">{col}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-2">Optional Columns</h4>
                                                <div className="space-y-1">
                                                    {['Program', 'Campus', 'Level', 'Status'].map((col) => (
                                                        <div key={col} className="flex items-center space-x-2">
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                            <span className="text-sm text-gray-700">{col}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100">
                                                <div className="space-y-2 text-sm text-gray-600">
                                                    <div className="flex items-start space-x-2">
                                                        <span className="font-medium">File types:</span>
                                                        <span>.xls or .xlsx</span>
                                                    </div>
                                                    <div className="flex items-start space-x-2">
                                                        <span className="font-medium">Headers:</span>
                                                        <span>First row should contain column names</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tips Card */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                                            <BookOpen size={20} className="mr-2" />
                                            Pro Tips
                                        </h3>
                                        <ul className="space-y-2 text-sm text-blue-800">
                                            <li className="flex items-start space-x-2">
                                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                                                <span>Include all required columns for best results</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                                                <span>Ensure email addresses are properly formatted</span>
                                            </li>
                                            <li className="flex items-start space-x-2">
                                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                                                <span>Remove any empty rows or columns</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Sample Template Download */}
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <Download size={20} className="mr-2 text-green-600" />
                                            Need Help?
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Download our sample template to ensure your Excel file is formatted correctly.
                                        </p>
                                        <button
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = '/Example-Class-List.xlsx';
                                                link.download = 'Example-Class-List.xlsx';
                                                link.click();
                                            }}
                                            className="w-full bg-green-100 hover:bg-green-200 text-green-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                                        >
                                            <Download size={16} />
                                            Download Sample Template
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Management Dashboard (preserved with enhanced program type dropdown) */}
                    {classList && (
                        <div className="p-6">
                            {/* Overview Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                {/* Course Info with Enhanced Program Type Dropdown */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <BookOpen className="text-blue-600" size={24} />
                                        <h3 className="text-lg font-semibold text-blue-800">
                                            Course Information
                                        </h3>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <strong>Code:</strong>{' '}
                                            {classList.courseMetadata?.courseCode || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Name:</strong>{' '}
                                            {classList.courseMetadata?.courseName || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Section:</strong>{' '}
                                            {classList.courseMetadata?.section || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Professor:</strong>{' '}
                                            {classList.courseMetadata?.instructor || 'N/A'}
                                        </div>

                                        {/* ENHANCED: Program type selector with policy preview */}
                                        <div className="mt-3">
                                            {renderEnhancedProgramTypeDropdown()}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Stats (preserved exactly from original) */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <GraduationCap className="text-green-600" size={24} />
                                        <h3 className="text-lg font-semibold text-green-800">
                                            Grading Progress
                                        </h3>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <strong>Total Students:</strong> {classList.students.length}
                                        </div>
                                        <div>
                                            <strong>Final Grades:</strong>{' '}
                                            {getGradingProgress().final}
                                        </div>
                                        <div>
                                            <strong>Draft Grades:</strong>{' '}
                                            {getGradingProgress().draft}
                                        </div>
                                        <div>
                                            <strong>Completion:</strong>{' '}
                                            {getGradingProgress().percentage}%
                                        </div>
                                    </div>
                                </div>

                                {/* Session Control (preserved exactly from original) */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Play className="text-purple-600" size={24} />
                                        <h3 className="text-lg font-semibold text-purple-800">
                                            Batch Grading Session
                                        </h3>
                                    </div>
                                    <div className="space-y-3">
                                        {!gradingSession?.active ? (
                                            <div>
                                                <div className="text-sm text-purple-600 mb-2">
                                                    {gradingSession?.currentStudentIndex > 0
                                                        ? `Paused at student ${gradingSession.currentStudentIndex + 1} of ${classList.students.length}`
                                                        : 'Ready to start batch grading'
                                                    }
                                                </div>
                                                <div className="flex gap-2">
                                                    {gradingSession?.currentStudentIndex > 0 ? (
                                                        <button
                                                            onClick={resumeGradingSession}
                                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                                                        >
                                                            <Play size={16} />
                                                            Resume Session
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={startGradingSession}
                                                            disabled={!sharedRubric}
                                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Play size={16} />
                                                            Start Batch Grading
                                                        </button>
                                                    )}
                                                    {!sharedRubric && (
                                                        <div className="text-xs text-purple-600 mt-1">
                                                            Load a rubric first
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="text-sm text-green-600 font-medium mb-2">
                                                    ✓ Session Active - Student {gradingSession.currentStudentIndex + 1} of {classList.students.length}
                                                </div>
                                                <button
                                                    onClick={pauseGradingSession}
                                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                                                >
                                                    <Clock size={16} />
                                                    Pause Session
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Student Table (preserved exactly from original) */}
                            <div className="bg-white border border-gray-200 rounded-lg">
                                {/* FIXED: Export button handlers that properly handle async functions */}
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Student Roster
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={async () => {
                                                console.log('🔄 Starting CSV export...');
                                                await exportClassGradesCSV();
                                            }}
                                            className="px-2 py-1 rounded text-xs font-medium text-white bg-green-500 hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-colors duration-150"
                                        >
                                            <Download size={14} />
                                            CSV
                                        </button>
                                        <button
                                            onClick={async () => {
                                                console.log('🔄 Starting HTML export...');
                                                await exportClassGradesHTML();
                                            }}
                                            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                                        >
                                            <FileText size={14} />
                                            HTML
                                        </button>
                                        <button
                                            onClick={async () => {
                                                console.log('🔄 Starting PDF export...');
                                                await exportClassGradesPortraitPDF();
                                            }}
                                            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                                        >
                                            <FileText size={14} />
                                            PDF
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="table-auto w-max mx-auto">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    #
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Student ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Program
                                                </th>
                                                <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {classList.students.map((student, index) => {
                                                const progress = classList.gradingProgress[index];
                                                const isCurrentStudent = gradingSession.active && index === gradingSession.currentStudentIndex;
                                                const gradeStatus = getGradeStatus(student.id);

                                                return (
                                                    <tr
                                                        key={student.id}
                                                        className={`${isCurrentStudent
                                                            ? 'bg-blue-50 border-l-4 border-blue-500'
                                                            : 'hover:bg-gray-50'
                                                            } transition-colors`}
                                                    >
                                                        <td className="px-4 py-2 whitespace-normal break-words text-sm text-gray-900 max-w-xs">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusDisplay(progress, student.id)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {student.id}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-normal break-words text-sm text-gray-900 max-w-xs">
                                                            {student.name}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-normal break-words text-sm text-gray-500 max-w-xs">
                                                            {student.email}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {student.program}
                                                        </td>

                                                        <td className="w-48 px-4 py-2 text-sm whitespace-normal">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {/* View or Edit */}
                                                                <button
                                                                    onClick={() => loadStudentForGrading(student)}
                                                                    className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 duration-150"
                                                                >
                                                                    {gradeStatus === 'final' ? 'View' : 'Edit'}
                                                                </button>

                                                                {/* Finalize draft */}
                                                                {gradeStatus === 'draft' && (
                                                                    <button
                                                                        onClick={() => finalizeGrade(student.id)}
                                                                        className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors focus:ring-2 focus:ring-green-500 duration-150"
                                                                    >
                                                                        Finalize
                                                                    </button>
                                                                )}

                                                                {/* Export Grade (always visible) */}
                                                                <button
                                                                    onClick={() => exportStudentGrade(student.id)}
                                                                    className="flex items-center gap-1 px-3 py-1 bg-purple-500 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors focus:ring-2 focus:ring-purple-500 duration-150"
                                                                >
                                                                    <ExternalLink size={14} />
                                                                    Export Grade
                                                                </button>

                                                                {/* Unlock (only for final) */}
                                                                {gradeStatus === 'final' && (
                                                                    <button
                                                                        onClick={() => unlockGrade(student.id)}
                                                                        className="flex items-center gap-1 px-3 py-1 bg-orange-500 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors focus:ring-2 focus:ring-orange-500 duration-150"
                                                                    >
                                                                        <Unlock size={14} />
                                                                        Unlock
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Import Summary (preserved exactly from original) */}
                            <div className="mt-8 bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Import Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">File:</span>
                                        <div className="font-medium">{classList.fileName}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Import Date:</span>
                                        <div className="font-medium">
                                            {new Date(classList.importTime).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Data Quality:</span>
                                        <div className="font-medium">
                                            {classList.validation?.validationScore || 0}%
                                        </div>
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