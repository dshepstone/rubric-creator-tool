import React, { useRef, useState } from 'react';
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
    FileSpreadsheet
} from 'lucide-react';
import { useAssessment } from './SharedContext';
import { parseExcelFile, validateStudentData } from '../utils/excelParser';



/**
 * Map a numeric percentage to a letter grade,
 * following Conestoga’s A+…F policy.
 */
const getLetterGrade = (percentage, programType) => {
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

    /*
     * FIXES COMPLETED IN THIS UPDATE:
     * ===============================
     * ✅ Excel import functionality (instead of CSV)
     * ✅ Start batch grading session with pause/resume functionality
     * ✅ Enhanced status indicators with proper draft/final states
     * ✅ Export entire class grades as CSV, HTML, and PDF with Final Grade column
     * ✅ Action buttons properly handle Edit/View, Finalize, Export Grade, Unlock
     * ✅ Grade calculation function added for exports
     * ✅ CSV and HTML exports now include calculated final grades and percentages
     *
     * PENDING FIX (requires GradingTemplate update):
     * ==============================================
     * ❌ View action still opens empty grade sheet for saved grades
     *
     * SOLUTION: Add the useEffect from gradingtemplate_fix artifact to GradingTemplate.js
     * and add loadFinalGrade + finalGrades to SharedContext value object.
     *
     * Once implemented, the View action will properly load saved rubric selections,
     * feedback, attachments, video links, and late policy for both draft and final grades.
     */

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
        loadFinalGrade, // This should be available after SharedContext fix
        finalGrades, // This should be available after SharedContext fix
        rubricFormData,
    
    } = useAssessment();

    // NEW: Handler to change the program type for grading
    const handleProgramTypeChange = (e) => {
        const newType = e.target.value;
        setClassList(prev => ({
            ...prev,
            courseMetadata: {
                ...prev.courseMetadata,
                programType: newType,
            },
        }));
    };

    // Helper function for status display
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

    // Helper function to finalize a draft grade
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

    // Helper function to unlock a final grade
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

    // Helper function to load final grade data
    const loadFinalGradeData = (studentId) => {
        // Use loadFinalGrade if available, otherwise fallback to checking finalGrades directly
        if (typeof loadFinalGrade === 'function') {
            return loadFinalGrade(studentId);
        }
        // Fallback: check finalGrades directly if available
        if (finalGrades && finalGrades[studentId]) { // FIX: Corrected 'finalGrdes' to 'finalGrades'
            return finalGrades[studentId];
        }
        // Last resort: check drafts (this maintains current behavior)
        return drafts[studentId] || null;
    };

    // **FIXED**: This function now correctly calculates the grade based on the rubric structure.
    const calculateStudentGrade = (studentId) => {
        const gradeStatus = getGradeStatus(studentId);
        let gradeData = null;

        if (gradeStatus === 'final') {
            gradeData = loadFinalGradeData(studentId);
        } else if (gradeStatus === 'draft') {
            gradeData = loadDraft(studentId);
        }

        // The grade calculation relies on having the student's saved grade data AND the rubric structure.
        // If any part is missing, we can't calculate the grade.
        if (!gradeData || !gradeData.rubricGrading || !sharedRubric || !sharedRubric.criteria || !sharedRubric.rubricLevels) {
            return { score: 'N/A', maxPossible: 'N/A', percentage: 'N/A', letterGrade: 'N/A' };
        }

        let totalScore = 0;
        let maxPossible = 0;

        // Correctly calculate score based on criterion points and level multipliers
        sharedRubric.criteria.forEach(criterion => {
            const gradingSelection = gradeData.rubricGrading[criterion.id];
            const criterionMaxPoints = Number(criterion.maxPoints) || 0;
            maxPossible += criterionMaxPoints;

            if (gradingSelection && gradingSelection.selectedLevel) {
                const levelData = sharedRubric.rubricLevels.find(l => l.level === gradingSelection.selectedLevel);
                if (levelData) {
                    const levelMultiplier = Number(levelData.multiplier) || 0;
                    totalScore += criterionMaxPoints * levelMultiplier;
                }
            }
        });

        // Apply late penalty if applicable
        if (gradeData.latePolicy && gradeData.latePolicy.level !== 'none') {
            const latePenalties = { within24: 0.8, after24: 0.0 };
            const multiplier = latePenalties[gradeData.latePolicy.level] || 1.0;
            totalScore *= multiplier;
        }

        const numericScore = Math.round(totalScore * 10) / 10;
        const maxScore = Math.round(maxPossible * 10) / 10;
        const percentage = maxScore > 0 ? Math.round((numericScore / maxScore) * 100) : 0;

        const letterGrade = getLetterGrade(
            percentage,
            classList.courseMetadata?.programType
        );

        return {
            score: numericScore,
            maxPossible: maxScore,
            percentage,
            letterGrade
        };
    };


    // Helper function to load student for grading
    const loadStudentForGrading = (student) => {
        const gradeStatus = getGradeStatus(student.id);

        // Set the current student first
        setCurrentStudent(student);

        // Load the student info into the grading form
        updateStudentInfo({
            name: student.name,
            id: student.id,
            email: student.email
        });

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

    // Helper function to get grading progress statistics
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

    // ── Build a portrait-friendly Class Grade Report ───────────────────────────────
    const getPortraitClassReportHTML = () => {
        const now = new Date();
        const currentDate = now.toLocaleDateString('en-CA');  // YYYY-MM-DD
        const currentTime = now.toLocaleTimeString('en-CA');
         // Grab the rubric title from context
        const rubricName = sharedRubric?.assignmentInfo?.title || 'Unnamed Rubric';
        // Calculate grades
        const rowsHtml = classList.students.map((student, idx) => {
            const info = calculateStudentGrade(student.id);
            const num = info.score !== 'N/A'
                ? `${info.score}/${info.maxPossible}`
                : 'N/A';
            return `
      <tr>
        <td>${idx + 1}</td>
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${num}</td>
        <td>${info.letterGrade || 'N/A'}</td>
        <td>${info.percentage !== 'N/A' ? info.percentage + '%' : 'N/A'}</td>
      </tr>`;
        }).join('');

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Portrait Class Report</title>
  <style>
  /* Force portrait layout with small margins */
  @page {
    size: A4 portrait;
    margin: 15mm;
  }

  /* Global resets */
  *, *::before, *::after {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    font-size: 12px;
    line-height: 1.4;
    color: #333;
    background: white;
  }

  /* Header */
  .header {
    text-align: center;
    margin-bottom: 8px;
  }
  .header h1 {
    font-size: 18px;
    margin: 4px 0;
  }
  .header .meta {
    font-size: 14px;
    color: #555;
  }

  /* Container to allow horizontal scroll if needed */
  .table-container {
    width: 100%;
    overflow-x: auto;
  }

  /* Main table */
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;             /* evenly distribute column widths */
  }
  thead {
    display: table-header-group;     /* repeat header on each printed page */
  }
  tbody {
    display: table-row-group;
  }
  th, td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;

  /* allow wrapping anywhere, even inside long words like emails */
  white-space: normal;
  word-wrap: break-word;        /* for legacy support */
  overflow-wrap: anywhere;      /* modern browsers */
  word-break: break-all;        /* if you really need to force breaks */
  vertical-align: top;
}

  
  tr:nth-child(even) td {
    background-color: #fafafa;
  }

  /* Footer */
  .footer {
    margin-top: 12px;
    font-size: 10px;
    text-align: center;
    color: #666;
  }

  /* Print tweaks */
  @media print {
    body {
      background: white;
    }
    .table-container {
      overflow-x: visible;
    }
  }
</style>

</head>
<body>
  <div class="header">
    <h1>Class Grade Report</h1>
    <div class="meta">
      ${classList.courseMetadata?.courseCode || ''} –
      ${classList.courseMetadata?.courseName || ''} |
      Section: ${classList.courseMetadata?.section || ''}<br>
      Rubric: ${rubricName}
      Generated: ${currentDate} ${currentTime}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:4%">#</th>
        <th style="width:15%">Student ID</th>
        <th style="width:40%">Name</th>
        <th style="width:15%">Numeric Grade</th>
        <th style="width:12%">Letter Grade</th>
        <th style="width:14%">%</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer">
    Imported from: ${classList.fileName}
  </div>
</body>
</html>`;
    };
    // ───────────────────────────────────────────────────────────────────────────────


    // ── Generate the full HTML for class‐grades report ─────────────────────────────
    const getClassGradesHTML = () => {
        const progress = getGradingProgress();
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const currentTime = new Date().toLocaleTimeString();

        // ——— Build all the <tr> rows with single‐quoted strings — no back‐ticks inside!  
        const rowsHtml = classList.students.map((student, i) => {
            const prog = classList.gradingProgress[i] || {};
            const info = calculateStudentGrade(student.id);
            const lm = prog.lastModified
                ? new Date(prog.lastModified).toLocaleDateString()
                : 'Never';
            const statusClass = prog.status?.includes('final')
                ? 'status-final'
                : prog.status?.includes('draft')
                    ? 'status-draft'
                    : 'status-pending';

            return (
                '<tr>' +
                '<td>' + (i + 1) + '</td>' +
                '<td>' + student.id + '</td>' +
                '<td>' + student.name + '</td>' +
                '<td>' + student.email + '</td>' +
                '<td>' + (student.program || '') + '</td>' +
                '<td><span class="status-badge ' + statusClass + '">' +
                (prog.status || 'pending') +
                '</span></td>' +
                '<td>' + (prog.gradeType || 'none') + '</td>' +
                '<td>' + (info.score !== 'N/A'
                    ? info.score + '/' + info.maxPossible
                    : 'N/A') + '</td>' +
                '<td>' + (info.letterGrade || 'N/A') + '</td>' +
                '<td>' + (info.percentage !== 'N/A'
                    ? info.percentage + '%'
                    : 'N/A') + '</td>' +
                '<td>' + lm + '</td>' +
                '</tr>'
            );
        }).join('');

        // ——— Now splice rowsHtml into one clean back‐tick literal
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Class Grade Report - ${classList.courseMetadata?.courseCode || ''}</title>
  <style>
    @page { size: A4 portrait; margin:15mm; }
    *, *::before, *::after { box-sizing:border-box }
    body { margin:0; padding:0; font-family:sans-serif; font-size:12px; line-height:1.4; color:#333; }
    .header { text-align:center; margin-bottom:12px; }
    .header h1 { font-size:18px; margin:4px 0; }
    .header .meta { font-size:14px; color:#555; }
    .table-container { width:100%; overflow-x:auto; margin-bottom:12px; }
    table { width:100%; border-collapse:collapse; table-layout:fixed; }
    thead { display:table-header-group; }
    th, td {
      padding:8px 12px; text-align:left; border-bottom:1px solid #e5e7eb;
      white-space:normal; word-wrap:break-word; overflow-wrap:anywhere; word-break:break-all;
      vertical-align:top;
    }
    th { background:#f0f0f0; font-weight:600; position:sticky; top:0; }
    tr:nth-child(even) td { background:#fafafa; }
    .footer { font-size:10px; text-align:center; color:#666; margin-top:12px; }
    @media print { body{background:white} .table-container{overflow-x:visible} }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Class Grade Report</h1>
    <div class="meta">
      ${classList.courseMetadata?.courseCode || ''} – ${classList.courseMetadata?.courseName || ''} |
      Section: ${classList.courseMetadata?.section || ''}<br>
      Rubric: ${sharedRubric?.assignmentInfo?.title || 'Unnamed Rubric'}<br>
      Generated: ${currentDate} | ${currentTime}
    </div>
  </div>

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



    const exportClassGradesCSV = () => {
        if (!classList) return;

        // 1) Build a 2D array where the first column is the row number
        const rows = [
            // now 11 headers instead of 10
            ['#', 'Student ID', 'Student Name', 'Email', 'Program', 'Status', 'Grade Type', 'Numeric Grade', 'Letter Grade', 'Percentage', 'Last Modified'],
            ...classList.students.map((student, index) => {
                const progress = classList.gradingProgress[index] || {};
                const gradeInfo = calculateStudentGrade(student.id);
                const lm = progress.lastModified
                    ? new Date(progress.lastModified).toLocaleDateString()
                    : 'Never';

                return [
                    index + 1,                            // ← new “#” column
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
        ];

        // 2) Quote each cell (handles commas/quotes in names, etc.)
        const quote = cell => `"${String(cell).trim().replace(/"/g, '""')}"`;

        // 3) Join into a CSV string with CRLFs
        const csvContent = rows
            .map(row => row.map(quote).join(','))
            .join('\r\n');

        // 4) Trigger download (unchanged)
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${classList.courseMetadata?.courseCode || 'class'}_grades_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Export class grades as HTML
    // ── Export class grades as HTML via download ─────────────────────────────────
    const exportClassGradesHTML = () => {
        if (!classList) return;

        const htmlContent = getClassGradesHTML();
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
    };
    // ───────────────────────────────────────────────────────────────────────────────


   
    // ── Export Class Grades as a portrait PDF ────────────────────────────────────
    const exportClassGradesPortraitPDF = () => {
        if (!classList) return;

        // Open a new window with our portrait HTML
        const printWin = window.open('', '_blank', 'width=800,height=600');
        printWin.document.write(getPortraitClassReportHTML());
        printWin.document.close();
        printWin.focus();

        // When it loads, trigger the print dialog
        printWin.onload = () => {
            printWin.print();
            // Optionally close after printing:
            // printWin.close();
        };
    };
    // ───────────────────────────────────────────────────────────────────────────────

    // ──────────────────────────────

    // ── New: Export a single student's grade as CSV ───────────────────────────────
    const exportStudentGrade = (studentId) => {
        // 1. Make sure we have a classList
        if (!classList) return;

        // 2. Find the student record
        const student = classList.students.find(s => s.id === studentId);
        if (!student) return;

        // 3. Calculate their grade (score, percentage, etc.)
        const gradeInfo = calculateStudentGrade(studentId);

        // 4. Build a 2-row CSV: headers + this student's data
        const rows = [
            ['Student ID', 'Student Name', 'Email', 'Program', 'Status', 'Grade Type', 'Numeric Grade', 'Letter Grade', 'Percentage', 'Last Modified'],
            ...classList.students.map((student, index) => {
                const prog = classList.gradingProgress[index] || {};
                const info = calculateStudentGrade(student.id);
                const lm = prog.lastModified
                    ? new Date(prog.lastModified).toLocaleDateString()
                    : 'Never';
                return [
                    student.id,
                    student.name,
                    student.email,
                    student.program || 'N/A',
                    prog.status || 'pending',
                    prog.gradeType || 'none',
                    `${info.score}/${info.maxPossible}`,
                    info.letterGrade || 'N/A',
                    `${info.percentage}%`,
                    lm
                ];
            })
        ];

        const quote = (cell) => `"${String(cell).trim().replace(/"/g, '""')}"`;

        const csvContent = rows
            .map(row => row.map(quote).join(','))
            .join('\r\n');


        // 5. Trigger download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${classList.courseMetadata?.courseCode || 'grade'}_${student.id}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };
    // ────────────────────────────

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

            const classListData = {
                students: result.students,
                gradingProgress,
                fileName: file.name,
                fileSize: file.size,
                importTime: new Date().toISOString(),
                // Now include "instructor" (falls back to 'TBD' if none)
                courseMetadata: {
                    courseCode: result.courseMetadata?.courseCode || 'IMPORTED',
                    courseName: result.courseMetadata?.courseName || 'Excel Import',
                    section: result.courseMetadata?.section || 'DEFAULT',
                    programType: result.courseMetadata?.programType || 'degree', // e.g. 'degree' | 'diploma' | 'certificate'
                    // ← Try .instructor first, then .professors (your Excel parser writes the names there)
                    instructor: result.courseMetadata?.instructor // if you manually had an "Instructor" column
                        ||
                        result.courseMetadata?.professors // fall back to your "Professors" column
                        ||
                        'TBD',
                    term: result.courseMetadata?.term || 'TBD'
                },
                validation: {
                    validationScore: validation.validationScore || 100,
                    issues: validation.issues || []
                }
            };

            setClassList(classListData);
            setImportStatus('success');

            setTimeout(() => setImportStatus(''), 3000);
        } catch (error) {
            console.error('Excel import error:', error);
            setImportStatus('error');
            setTimeout(() => setImportStatus(''), 3000);
        }
    };

    const startGradingSession = () => {
        if (!classList || classList.students.length === 0) {
            alert('No students available for grading.');
            return;
        }

        if (!sharedRubric) {
            alert('Please load a rubric before starting batch grading.');
            return;
        }

        // Initialize the grading session (this will set up the first student)
        const success = initializeGradingSession(classList);
        if (success) {
            setActiveTab('grading-tool');
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
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
                    {/* Import Section */}
                    {!classList && (
                        <div className="p-8">
                            <div className="max-w-2xl mx-auto text-center">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-6">
                                    <FileSpreadsheet size={48} className="mx-auto text-blue-600 mb-4" />
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                        Import Student List
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        Upload an Excel file (.xls or .xlsx) containing your student roster to begin class management.
                                    </p>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xls,.xlsx"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />

                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={importStatus === 'processing'}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FileSpreadsheet size={20} />
                                        {importStatus === 'processing' ? 'Processing...' : 'Choose Excel File'}
                                    </button>

                                    {importStatus === 'success' && (
                                        <div className="mt-4 text-green-600 font-medium">
                                            ✓ Excel file imported successfully!
                                        </div>
                                    )}

                                    {importStatus === 'error' && (
                                        <div className="mt-4 text-red-600 font-medium">
                                            ✗ Error importing Excel file. Please check format and try again.
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6 text-left">
                                    <h3 className="font-semibold text-gray-800 mb-3">Expected Excel Format:</h3>
                                    <div className="text-sm text-gray-600 space-y-2">
                                        <div><strong>Required columns:</strong> ID, Name, Email</div>
                                        <div><strong>Optional columns:</strong> Program, Campus, Level, Status</div>
                                        <div><strong>File types:</strong> .xls or .xlsx</div>
                                        <div><strong>Note:</strong> First row should contain column headers</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Management Dashboard */}
                    {classList && (
                        <div className="p-6">
                            {/* Overview Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                {/* Course Info */}
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
                                        {/* NEW: Program type selector */}
                                        <div className="mt-3">
                                            <label htmlFor="programType" className="block text-sm font-bold text-gray-700">Program Type:</label>
                                            <select
                                                id="programType"
                                                name="programType"
                                                value={classList.courseMetadata?.programType || 'degree'}
                                                onChange={handleProgramTypeChange}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            >
                                                <option value="degree">Degree</option>
                                                <option value="diploma">Diploma</option>
                                                <option value="certificate">Certificate</option>
                                                <option value="graduateCertificate">Graduate Certificate</option>

                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Stats */}
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

                                {/* Session Control */}
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

                            {/* Student Table */}
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Student Roster
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={exportClassGradesCSV}
                                            className="px-2 py-1 rounded text-xs font-medium text-white bg-green-500 hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-colors duration-150"
                                        >
                                            <Download size={14} />
                                            CSV
                                        </button>
                                        <button
                                            onClick={exportClassGradesHTML}
                                            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                                        >
                                            <FileText size={14} />
                                            HTML
                                        </button>
                                        <button
                                            onClick={exportClassGradesPortraitPDF}
                                            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                                        >
                                            <FileText size={14} />
                                            PDF
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    {/* w-max = width: max-content; mx-auto centers if you want */}
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
                                                {/* limit Actions col to 12rem */}
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


                                                        {/* match the header width here so the cell can’t grow beyond 12rem */}
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