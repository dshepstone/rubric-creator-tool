// GradeBook Utility Functions
// File: src/utils/gradebookUtils.js

/**
 * Grade calculation and conversion utilities for the GradeBook component
 */

// Grade conversion mappings
export const GRADE_MAPPINGS = {
    degree: {
        'A+': { min: 97, max: 100, points: 4.0 },
        'A': { min: 93, max: 96.99, points: 4.0 },
        'A-': { min: 90, max: 92.99, points: 3.7 },
        'B+': { min: 87, max: 89.99, points: 3.3 },
        'B': { min: 83, max: 86.99, points: 3.0 },
        'B-': { min: 80, max: 82.99, points: 2.7 },
        'C+': { min: 77, max: 79.99, points: 2.3 },
        'C': { min: 73, max: 76.99, points: 2.0 },
        'C-': { min: 70, max: 72.99, points: 1.7 },
        'D+': { min: 67, max: 69.99, points: 1.3 },
        'D': { min: 63, max: 66.99, points: 1.0 },
        'D-': { min: 60, max: 62.99, points: 0.7 },
        'F': { min: 0, max: 59.99, points: 0.0 }
    },
    certificate: {
        'A': { min: 80, max: 100, points: 4.0 },
        'B': { min: 70, max: 79.99, points: 3.0 },
        'C': { min: 60, max: 69.99, points: 2.0 },
        'F': { min: 0, max: 59.99, points: 0.0 }
    }
};

/**
 * Convert percentage to letter grade based on grading policy
 * @param {number} percentage - Grade percentage (0-100)
 * @param {string} policy - Grading policy ('degree', 'certificate', etc.)
 * @returns {string} Letter grade
 */
export const percentageToLetterGrade = (percentage, policy = 'degree') => {
    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
        return 'N/A';
    }

    const gradeMap = GRADE_MAPPINGS[policy] || GRADE_MAPPINGS.degree;

    for (const [grade, range] of Object.entries(gradeMap)) {
        if (percentage >= range.min && percentage <= range.max) {
            return grade;
        }
    }

    return 'F';
};

/**
 * Convert letter grade to percentage (midpoint of range)
 * @param {string} letterGrade - Letter grade (A+, A, B+, etc.)
 * @param {string} policy - Grading policy
 * @returns {number} Percentage value
 */
export const letterGradeToPercentage = (letterGrade, policy = 'degree') => {
    const gradeMap = GRADE_MAPPINGS[policy] || GRADE_MAPPINGS.degree;
    const grade = gradeMap[letterGrade.toUpperCase()];

    if (!grade) return 0;

    // Return midpoint of the range
    return Math.round((grade.min + grade.max) / 2);
};

/**
 * Parse various grade input formats
 * @param {string} input - Grade input string
 * @param {number} maxPoints - Maximum points for the assignment
 * @param {string} policy - Grading policy
 * @returns {Object} Parsed grade data
 */
export const parseGradeInput = (input, maxPoints = 100, policy = 'degree') => {
    if (!input || typeof input !== 'string') {
        return { percentage: null, letterGrade: null, rawScore: null, isValid: false };
    }

    const trimmedInput = input.trim();

    // Handle percentage input (85% or 85)
    if (trimmedInput.includes('%')) {
        const percentage = parseFloat(trimmedInput.replace('%', ''));
        if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
            return {
                percentage: Math.round(percentage * 100) / 100,
                letterGrade: percentageToLetterGrade(percentage, policy),
                rawScore: (percentage / 100) * maxPoints,
                isValid: true
            };
        }
    }

    // Handle fraction input (85/100)
    if (trimmedInput.includes('/')) {
        const [numerator, denominator] = trimmedInput.split('/').map(n => parseFloat(n.trim()));
        if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
            const percentage = (numerator / denominator) * 100;
            return {
                percentage: Math.round(percentage * 100) / 100,
                letterGrade: percentageToLetterGrade(percentage, policy),
                rawScore: numerator,
                isValid: true
            };
        }
    }

    // Handle raw number input
    const numericValue = parseFloat(trimmedInput);
    if (!isNaN(numericValue)) {
        // If number is <= 100, treat as percentage; otherwise as raw score
        if (numericValue <= 100) {
            return {
                percentage: Math.round(numericValue * 100) / 100,
                letterGrade: percentageToLetterGrade(numericValue, policy),
                rawScore: (numericValue / 100) * maxPoints,
                isValid: true
            };
        } else {
            // Treat as raw score
            const percentage = (numericValue / maxPoints) * 100;
            return {
                percentage: Math.round(percentage * 100) / 100,
                letterGrade: percentageToLetterGrade(percentage, policy),
                rawScore: numericValue,
                isValid: true
            };
        }
    }

    // Handle letter grade input
    const letterGrade = trimmedInput.toUpperCase();
    const gradeMap = GRADE_MAPPINGS[policy] || GRADE_MAPPINGS.degree;

    if (gradeMap[letterGrade]) {
        const percentage = letterGradeToPercentage(letterGrade, policy);
        return {
            percentage,
            letterGrade,
            rawScore: (percentage / 100) * maxPoints,
            isValid: true
        };
    }

    return { percentage: null, letterGrade: null, rawScore: null, isValid: false };
};

/**
 * Calculate weighted final grade for a student
 * @param {Array} projects - Array of project objects with weights
 * @param {Object} studentGrades - Student's grades for all projects
 * @returns {Object} Final grade calculation
 */
export const calculateWeightedGrade = (projects, studentGrades) => {
    if (!projects || !studentGrades || projects.length === 0) {
        return { percentage: 0, letterGrade: 'N/A', weightedScore: 0, totalWeight: 0 };
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;
    let gradedProjects = 0;

    projects.forEach(project => {
        const gradeData = studentGrades[project.id];
        if (gradeData && gradeData.percentage !== null && gradeData.percentage !== undefined) {
            totalWeightedScore += (gradeData.percentage * project.weight) / 100;
            totalWeight += project.weight;
            gradedProjects++;
        }
    });

    if (totalWeight === 0 || gradedProjects === 0) {
        return { percentage: 0, letterGrade: 'N/A', weightedScore: 0, totalWeight: 0 };
    }

    const finalPercentage = (totalWeightedScore / totalWeight) * 100;

    return {
        percentage: Math.round(finalPercentage * 100) / 100,
        letterGrade: percentageToLetterGrade(finalPercentage),
        weightedScore: totalWeightedScore,
        totalWeight,
        gradedProjects
    };
};

/**
 * Calculate class statistics
 * @param {Array} students - Array of student objects
 * @param {Array} projects - Array of project objects
 * @param {Object} grades - All grades data
 * @param {string} policy - Grading policy
 * @returns {Object} Class statistics
 */
export const calculateClassStatistics = (students, projects, grades, policy = 'degree') => {
    if (!students || !projects || !grades || students.length === 0) {
        return {
            classAverage: 0,
            highestGrade: 0,
            lowestGrade: 0,
            passingRate: 0,
            totalStudents: 0,
            gradedStudents: 0,
            projectAverages: {},
            gradeDistribution: {}
        };
    }

    // Calculate final grades for all students
    const finalGrades = students.map(student => {
        const studentGrades = grades[student.id] || {};
        const finalGrade = calculateWeightedGrade(projects, studentGrades);
        return {
            studentId: student.id,
            percentage: finalGrade.percentage,
            letterGrade: finalGrade.letterGrade
        };
    }).filter(grade => grade.percentage > 0);

    if (finalGrades.length === 0) {
        return {
            classAverage: 0,
            highestGrade: 0,
            lowestGrade: 0,
            passingRate: 0,
            totalStudents: students.length,
            gradedStudents: 0,
            projectAverages: {},
            gradeDistribution: {}
        };
    }

    // Calculate basic statistics
    const percentages = finalGrades.map(g => g.percentage);
    const classAverage = percentages.reduce((sum, grade) => sum + grade, 0) / percentages.length;
    const highestGrade = Math.max(...percentages);
    const lowestGrade = Math.min(...percentages);
    const passingGrades = percentages.filter(grade => grade >= 60).length;
    const passingRate = (passingGrades / percentages.length) * 100;

    // Calculate project averages
    const projectAverages = {};
    projects.forEach(project => {
        const projectGrades = students.map(student => {
            const gradeData = grades[student.id]?.[project.id];
            return gradeData?.percentage;
        }).filter(grade => grade !== null && grade !== undefined);

        if (projectGrades.length > 0) {
            projectAverages[project.id] = {
                average: Math.round((projectGrades.reduce((sum, grade) => sum + grade, 0) / projectGrades.length) * 100) / 100,
                highest: Math.max(...projectGrades),
                lowest: Math.min(...projectGrades),
                count: projectGrades.length
            };
        }
    });

    // Calculate grade distribution
    const gradeDistribution = {};
    const gradeMap = GRADE_MAPPINGS[policy] || GRADE_MAPPINGS.degree;

    Object.keys(gradeMap).forEach(grade => {
        gradeDistribution[grade] = 0;
    });

    finalGrades.forEach(grade => {
        if (gradeDistribution.hasOwnProperty(grade.letterGrade)) {
            gradeDistribution[grade.letterGrade]++;
        }
    });

    return {
        classAverage: Math.round(classAverage * 100) / 100,
        highestGrade: Math.round(highestGrade * 100) / 100,
        lowestGrade: Math.round(lowestGrade * 100) / 100,
        passingRate: Math.round(passingRate * 100) / 100,
        totalStudents: students.length,
        gradedStudents: finalGrades.length,
        projectAverages,
        gradeDistribution
    };
};

/**
 * Validate gradebook data structure
 * @param {Object} gradebookData - Gradebook data to validate
 * @returns {Object} Validation result
 */
export const validateGradebookData = (gradebookData) => {
    const errors = [];
    const warnings = [];

    // Check required properties
    if (!gradebookData.projects || !Array.isArray(gradebookData.projects)) {
        errors.push('Projects array is required');
    }

    if (!gradebookData.students || !Array.isArray(gradebookData.students)) {
        errors.push('Students array is required');
    }

    if (!gradebookData.grades || typeof gradebookData.grades !== 'object') {
        errors.push('Grades object is required');
    }

    // Validate project weights
    if (gradebookData.projects && gradebookData.projects.length > 0) {
        const totalWeight = gradebookData.projects.reduce((sum, project) => sum + (project.weight || 0), 0);
        if (Math.abs(totalWeight - 100) > 0.01) {
            warnings.push(`Project weights total ${totalWeight}% (should be 100%)`);
        }

        // Check for duplicate project names
        const projectNames = gradebookData.projects.map(p => p.name);
        const duplicateNames = projectNames.filter((name, index) => projectNames.indexOf(name) !== index);
        if (duplicateNames.length > 0) {
            warnings.push(`Duplicate project names found: ${duplicateNames.join(', ')}`);
        }
    }

    // Validate student data
    if (gradebookData.students && gradebookData.students.length > 0) {
        const studentIds = gradebookData.students.map(s => s.id);
        const duplicateIds = studentIds.filter((id, index) => studentIds.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
            errors.push(`Duplicate student IDs found: ${duplicateIds.join(', ')}`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Export gradebook data to Excel format
 * @param {Object} gradebookData - Complete gradebook data
 * @param {Object} statistics - Calculated statistics
 * @returns {Array} Array of arrays for Excel export
 */
export const formatGradebookForExcel = (gradebookData, statistics) => {
    const worksheetData = [];

    // Header information
    worksheetData.push(['Course:', gradebookData.metadata?.courseName || '']);
    worksheetData.push(['Code:', gradebookData.metadata?.courseCode || '']);
    worksheetData.push(['Instructor:', gradebookData.metadata?.instructor || '']);
    worksheetData.push(['Term:', gradebookData.metadata?.term || '']);
    worksheetData.push(['Generated:', new Date().toLocaleString()]);
    worksheetData.push([]); // Empty row

    // Column headers
    const headerRow = ['Student ID', 'Student Name', 'Email', 'Program'];
    gradebookData.projects.forEach(project => {
        headerRow.push(`${project.name} (${project.weight}%)`);
    });
    headerRow.push('Final %', 'Final Grade');
    worksheetData.push(headerRow);

    // Student data rows
    gradebookData.students.forEach(student => {
        const row = [student.id, student.name, student.email || '', student.program || ''];

        gradebookData.projects.forEach(project => {
            const gradeData = gradebookData.grades[student.id]?.[project.id];
            if (gradeData && gradeData.percentage !== null) {
                row.push(gradeData.percentage);
            } else {
                row.push('');
            }
        });

        const finalGrade = calculateWeightedGrade(gradebookData.projects, gradebookData.grades[student.id] || {});
        row.push(finalGrade.percentage);
        row.push(finalGrade.letterGrade);

        worksheetData.push(row);
    });

    // Statistics section
    worksheetData.push([]); // Empty row
    worksheetData.push(['STATISTICS']);
    worksheetData.push(['Class Average:', statistics.classAverage + '%']);
    worksheetData.push(['Highest Grade:', statistics.highestGrade + '%']);
    worksheetData.push(['Lowest Grade:', statistics.lowestGrade + '%']);
    worksheetData.push(['Passing Rate:', statistics.passingRate + '%']);
    worksheetData.push(['Total Students:', statistics.totalStudents]);
    worksheetData.push(['Graded Students:', statistics.gradedStudents]);

    // Project averages
    if (Object.keys(statistics.projectAverages).length > 0) {
        worksheetData.push([]); // Empty row
        worksheetData.push(['PROJECT AVERAGES']);
        gradebookData.projects.forEach(project => {
            const avg = statistics.projectAverages[project.id];
            if (avg) {
                worksheetData.push([project.name + ':', avg.average + '%']);
            }
        });
    }

    return worksheetData;
};

/**
 * Generate a sample gradebook for testing
 * @param {number} studentCount - Number of students to generate
 * @param {number} projectCount - Number of projects to generate
 * @returns {Object} Sample gradebook data
 */
export const generateSampleGradebook = (studentCount = 10, projectCount = 4) => {
    const students = [];
    const projects = [];
    const grades = {};

    // Generate students
    for (let i = 1; i <= studentCount; i++) {
        students.push({
            id: `STU${i.toString().padStart(3, '0')}`,
            name: `Student ${i}`,
            email: `student${i}@example.com`,
            program: i % 3 === 0 ? 'Honors' : 'Regular'
        });
    }

    // Generate projects
    const projectNames = ['Assignment 1', 'Midterm Exam', 'Final Project', 'Participation'];
    const weights = [25, 25, 35, 15];

    for (let i = 0; i < projectCount; i++) {
        projects.push({
            id: `proj_${i + 1}`,
            name: projectNames[i] || `Project ${i + 1}`,
            maxPoints: 100,
            weight: weights[i] || Math.round(100 / projectCount),
            dueDate: new Date(Date.now() + (i * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            description: `Sample project ${i + 1}`,
            created: new Date().toISOString()
        });
    }

    // Generate random grades
    students.forEach(student => {
        grades[student.id] = {};
        projects.forEach(project => {
            // Generate random grade between 60-95
            const percentage = Math.round((Math.random() * 35 + 60) * 100) / 100;
            grades[student.id][project.id] = {
                percentage,
                letterGrade: percentageToLetterGrade(percentage),
                rawScore: percentage,
                lastModified: new Date().toISOString()
            };
        });
    });

    return {
        projects,
        students,
        grades,
        metadata: {
            courseName: 'Sample Course',
            courseCode: 'SMPL101',
            instructor: 'Dr. Sample',
            term: 'Fall 2024',
            created: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            gradingPolicy: 'degree'
        }
    };
};