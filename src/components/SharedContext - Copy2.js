import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AssessmentContext = createContext();

export const useAssessment = () => {
    const context = useContext(AssessmentContext);
    if (!context) {
        throw new Error('useAssessment must be used within AssessmentProvider');
    }
    return context;
};

export const AssessmentProvider = ({ children }) => {
    // Shared rubric state
    const [sharedRubric, setSharedRubric] = useState(null);

    // Shared course-details state (for your GradingTemplate's setSharedCourseDetails)
    const [sharedCourseDetails, setSharedCourseDetails] = useState(null);

    // Active tab state
    const [activeTab, setActiveTab] = useState('rubric-creator');

    // ─── Persist imported class-list across tabs ───────────────────────
    const [classList, setClassList] = useState(null);

    // ─── Which student is being graded right now ──────────────────────
    const [currentStudent, setCurrentStudent] = useState(null);

    // ─── In-progress grading drafts, keyed by student ID ─────────────
    const [drafts, setDrafts] = useState({});

    // ─── Separate storage for final (submitted) grades ─────────────────
    const [finalGrades, setFinalGrades] = useState({});

    // ─── Batch grading session state ───────────────────────────────────
    const [gradingSession, setGradingSession] = useState({
        active: false,
        startTime: null,
        gradedStudents: [],
        totalStudents: 0,
        currentStudent: null,
        currentStudentIndex: 0
    });

    // Comprehensive persistent form data for grading tool
    const [gradingFormData, setGradingFormData] = useState({
        student: { name: '', id: '', email: '' },
        course: { code: '', name: '', instructor: '', term: '' },
        assignment: { name: '', dueDate: '', maxPoints: 100 },
        feedback: { general: '', strengths: '', improvements: '' },
        attachments: [],
        videoLinks: [],
        latePolicy: { level: 'none', penaltyApplied: false },
        rubricGrading: {},
        metadata: {
            gradedBy: '',
            gradedDate: '',
            aiAssisted: false,
            rubricIntegrated: false
        }
    });

    // ---- ALIAS for backward-compatibility ----
    const gradingData = gradingFormData;

    // Rubric form data state
    const [rubricFormData, setRubricFormData] = useState({
        assignmentInfo: {
            title: '',
            description: '',
            weight: 25,
            passingThreshold: 60,
            totalPoints: 100
        },
        rubricLevels: [
            { level: 'incomplete', name: 'Incomplete', description: 'No submission or unusable', color: '#95a5a6', multiplier: 0 },
            { level: 'unacceptable', name: 'Unacceptable', description: 'Below minimum standards', color: '#e74c3c', multiplier: 0.3 },
            { level: 'developing', name: 'Developing', description: 'Approaching standards', color: '#f39c12', multiplier: 0.55 },
            { level: 'acceptable', name: 'Acceptable (PASS)', description: 'Meets minimum standards', color: '#27ae60', multiplier: 0.7 },
            { level: 'emerging', name: 'Emerging', description: 'Above standard expectations', color: '#2980b9', multiplier: 0.82 },
            { level: 'accomplished', name: 'Accomplished', description: 'Strong professional quality', color: '#16a085', multiplier: 0.92 },
            { level: 'exceptional', name: 'Exceptional', description: 'Outstanding professional quality', color: '#8e44ad', multiplier: 1.0 }
        ],
        criteria: [
            {
                id: 'criterion-1',
                name: '',
                description: '',
                maxPoints: 20,
                weight: 20,
                levels: {},
                feedbackLibrary: {
                    strengths: [],
                    improvements: [],
                    general: []
                }
            }
        ],
        pointingSystem: 'multiplier',
        reversedOrder: false,
        expandedFeedback: {},
        modalEdit: { show: false, content: '', field: null, onSave: null }
    });

    // ─── Draft save/load ───────────────────────────────────────────────
    function saveDraft(studentId, data) {
        setDrafts(prev => ({ ...prev, [studentId]: data }));
    }

    function loadDraft(studentId) {
        return drafts[studentId] || null;
    }

    // ─── Final save/load ───────────────────────────────────────────────
    function saveFinalGrade(studentId, data) {
        setFinalGrades(prev => ({ ...prev, [studentId]: data }));
        setDrafts(prev => {
            const updated = { ...prev };
            delete updated[studentId];
            return updated;
        });
    }

    function loadFinalGrade(studentId) {
        return finalGrades[studentId] || null;
    }

    // ─── Helper to ask "what's this student's status?" ─────────────
    // returns 'final' if in finalGrades, 'draft' if in drafts, else 'not_started'
    const getGradeStatus = useCallback((studentId) => {
        if (finalGrades[studentId]) return 'final';
        if (drafts[studentId]) return 'draft';
        return 'not_started';
    }, [finalGrades, drafts]);

    // Helper to check if a student has a saved draft
    const hasDraft = useCallback((studentId) => {
        return studentId && drafts[studentId] != null;
    }, [drafts]);

    // Update functions for grading form data
    const updateStudentInfo = useCallback((student) => {
        setGradingFormData(prev => ({
            ...prev,
            student: {
                ...prev.student,
                ...student
            }
        }));
    }, []);

    const updateCourseInfo = useCallback((course) => {
        setGradingFormData(prev => ({
            ...prev,
            course: {
                ...prev.course,
                ...course
            }
        }));
    }, []);

    const updateAssignmentInfo = useCallback((assignment) => {
        setGradingFormData(prev => ({
            ...prev,
            assignment: {
                ...prev.assignment,
                ...assignment
            }
        }));
    }, []);

    const updateFeedbackInfo = useCallback((feedback) => {
        setGradingFormData(prev => ({
            ...prev,
            feedback: {
                ...prev.feedback,
                ...feedback
            }
        }));
    }, []);

    const updateAttachments = useCallback((attachments) => {
        setGradingFormData(prev => ({
            ...prev,
            attachments
        }));
    }, []);

    const updateVideoLinks = useCallback((videoLinks) => {
        setGradingFormData(prev => ({
            ...prev,
            videoLinks
        }));
    }, []);

    const updateLatePolicy = useCallback((latePolicy) => {
        setGradingFormData(prev => ({
            ...prev,
            latePolicy
        }));
    }, []);

    const updateRubricGrading = useCallback((criterionId, levelKey) => {
        setGradingFormData(prev => {
            const prevRubric = prev.rubricGrading || {};
            return {
                ...prev,
                rubricGrading: {
                    ...prevRubric,
                    [criterionId]: {
                        ...(prevRubric[criterionId] || {}),
                        selectedLevel: levelKey
                    }
                }
            };
        });
    }, []);

    const updateMetadata = useCallback((metadata) => {
        setGradingFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                ...metadata
            }
        }));
    }, []);

    // Update functions for rubric form data
    const updateRubricFormData = useCallback((updates) => {
        setRubricFormData(prev => ({
            ...prev,
            ...updates
        }));
    }, []);

    const updateRubricAssignmentInfo = useCallback((assignmentInfo) => {
        setRubricFormData(prev => ({
            ...prev,
            assignmentInfo: {
                ...prev.assignmentInfo,
                ...assignmentInfo
            }
        }));
    }, []);

    const updateRubricCriteria = useCallback((criteria) => {
        setRubricFormData(prev => ({
            ...prev,
            criteria
        }));
    }, []);

    const updateRubricLevels = useCallback((rubricLevels) => {
        setRubricFormData(prev => ({
            ...prev,
            rubricLevels
        }));
    }, []);

    const updateRubricSettings = useCallback((settings) => {
        setRubricFormData(prev => ({
            ...prev,
            ...settings
        }));
    }, []);

    // Clear functions
    const clearSharedRubric = useCallback(() => {
        setSharedRubric(null);
    }, []);

    const clearGradingFormData = useCallback(() => {
        setGradingFormData({
            student: { name: '', id: '', email: '' },
            course: { code: '', name: '', instructor: '', term: '' },
            assignment: { name: '', dueDate: '', maxPoints: 100 },
            feedback: { general: '', strengths: '', improvements: '' },
            attachments: [],
            videoLinks: [],
            latePolicy: { level: 'none', penaltyApplied: false },
            rubricGrading: {},
            metadata: {
                gradedBy: '',
                gradedDate: '',
                aiAssisted: false,
                rubricIntegrated: false
            }
        });
    }, []);

    const clearRubricFormData = useCallback(() => {
        setRubricFormData({
            assignmentInfo: {
                title: '',
                description: '',
                weight: 25,
                passingThreshold: 60,
                totalPoints: 100
            },
            rubricLevels: [
                { level: 'incomplete', name: 'Incomplete', description: 'No submission or unusable', color: '#95a5a6', multiplier: 0 },
                { level: 'unacceptable', name: 'Unacceptable', description: 'Below minimum standards', color: '#e74c3c', multiplier: 0.3 },
                { level: 'developing', name: 'Developing', description: 'Approaching standards', color: '#f39c12', multiplier: 0.55 },
                { level: 'acceptable', name: 'Acceptable (PASS)', description: 'Meets minimum standards', color: '#27ae60', multiplier: 0.7 },
                { level: 'emerging', name: 'Emerging', description: 'Above standard expectations', color: '#2980b9', multiplier: 0.82 },
                { level: 'accomplished', name: 'Accomplished', description: 'Strong professional quality', color: '#16a085', multiplier: 0.92 },
                { level: 'exceptional', name: 'Exceptional', description: 'Outstanding professional quality', color: '#8e44ad', multiplier: 1.0 }
            ],
            criteria: [
                {
                    id: 'criterion-1',
                    name: '',
                    description: '',
                    maxPoints: 20,
                    weight: 20,
                    levels: {},
                    feedbackLibrary: {
                        strengths: [],
                        improvements: [],
                        general: []
                    }
                }
            ],
            pointingSystem: 'multiplier',
            reversedOrder: false,
            expandedFeedback: {},
            modalEdit: { show: false, content: '', field: null, onSave: null }
        });
    }, []);

    const clearAllData = useCallback(() => {
        setSharedRubric(null);
        clearGradingFormData();
        clearRubricFormData();
    }, [clearGradingFormData, clearRubricFormData]);

    // Initialize grading session with first student
    const initializeGradingSession = useCallback((classListData) => {
        if (!classListData || !classListData.students.length) {
            return false;
        }

        const firstStudent = classListData.students[0];
        const session = {
            active: true,
            startTime: new Date().toISOString(),
            gradedStudents: [],
            totalStudents: classListData.students.length,
            currentStudent: firstStudent,
            currentStudentIndex: 0
        };

        setGradingSession(session);
        setCurrentStudent(firstStudent);

        // Load first student into grading form
        setGradingFormData(prev => ({
            ...prev,
            student: {
                name: firstStudent.name,
                id: firstStudent.id,
                email: firstStudent.email
            }
        }));

        // Auto-populate course from Excel import
        if (classListData.courseMetadata) {
            updateCourseInfo({
                code: classListData.courseMetadata.courseCode || '',
                name: classListData.courseMetadata.courseName || '',
                instructor: classListData.courseMetadata.professors || '',
                term: classListData.courseMetadata.term || ''
            });
        }

        // Auto-populate assignment from loaded rubric
        if (sharedRubric?.assignmentInfo) {
            updateAssignmentInfo({
                name: sharedRubric.assignmentInfo.title || '',
                maxPoints: sharedRubric.assignmentInfo.totalPoints || 100
            });
        }

        return true;
    }, [
        setGradingSession,
        setCurrentStudent,
        setGradingFormData,
        updateCourseInfo,
        updateAssignmentInfo,
        sharedRubric
    ]);

    // Navigate to next student in grading session
    const nextStudentInSession = useCallback((gradeType = 'draft') => {
        if (
            !gradingSession.active ||
            !classList ||
            gradingSession.currentStudentIndex >= classList.students.length - 1
        ) {
            return false;
        }

        const currentIdx = gradingSession.currentStudentIndex;
        const currentStudent = classList.students[currentIdx];

        // Mark their progress entry
        setClassList(prev => {
            const updated = [...prev.gradingProgress];
            updated[currentIdx] = {
                ...updated[currentIdx],
                status: gradeType === 'final' ? 'completed_final' : 'completed_draft',
                gradeType,
                lastModified: new Date().toISOString()
            };
            return { ...prev, gradingProgress: updated };
        });

        // Save draft or final grade
        if (gradeType === 'final') {
            saveFinalGrade(currentStudent.id, gradingData);
        } else {
            saveDraft(currentStudent.id, gradingData);
        }

        // Advance index
        const nextIndex = currentIdx + 1;
        const nextStudent = classList.students[nextIndex];

        // Update session object
        setGradingSession(prev => ({
            ...prev,
            currentStudentIndex: nextIndex,
            currentStudent: nextStudent,
            gradedStudents: [...prev.gradedStudents, currentStudent.id]
        }));

        // Update "current student" convenience state
        setCurrentStudent(nextStudent);

        // Prime the grading form for the new student
        setGradingFormData(prev => ({
            ...prev,
            student: {
                name: nextStudent.name,
                id: nextStudent.id,
                email: nextStudent.email
            }
        }));

        return true;
    }, [
        gradingSession,
        classList,
        gradingData,
        saveDraft,
        saveFinalGrade,
        setClassList,
        setGradingSession,
        setCurrentStudent,
        setGradingFormData
    ]);

    // Navigate to previous student in grading session
    const previousStudentInSession = useCallback(() => {
        if (!gradingSession.active || gradingSession.currentStudentIndex <= 0) {
            return false;
        }

        const prevIndex = gradingSession.currentStudentIndex - 1;
        const prevStudent = classList.students[prevIndex];

        setGradingSession(prev => ({
            ...prev,
            currentStudentIndex: prevIndex,
            currentStudent: prevStudent
        }));

        setCurrentStudent(prevStudent);

        setGradingFormData(prev => ({
            ...prev,
            student: {
                name: prevStudent.name,
                id: prevStudent.id,
                email: prevStudent.email
            }
        }));

        return true;
    }, [gradingSession, classList, setGradingSession, setCurrentStudent, setGradingFormData]);

    // Jump to specific student in session
    const jumpToStudentInSession = useCallback((index) => {
        if (!classList || index < 0 || index >= classList.students.length) {
            return false;
        }

        const student = classList.students[index];

        setGradingSession(prev => ({
            ...prev,
            currentStudentIndex: index,
            currentStudent: student
        }));

        setCurrentStudent(student);

        setGradingFormData(prev => ({
            ...prev,
            student: {
                name: student.name,
                id: student.id,
                email: student.email
            }
        }));

        return true;
    }, [classList, setGradingSession, setCurrentStudent, setGradingFormData]);

    // Update grading session
    const updateGradingSession = useCallback((updates) => {
        setGradingSession(prev => ({
            ...prev,
            ...updates
        }));
    }, []);

    // Rubric management functions
    const transferRubricToGrading = useCallback(() => {
        if (rubricFormData) {
            setSharedRubric(rubricFormData);
            setActiveTab('grading-tool');
        }
    }, [rubricFormData]);

    const transferRubricToGradingWithDetails = useCallback((details) => {
        if (rubricFormData) {
            setSharedRubric(rubricFormData);
            setSharedCourseDetails(details);
            setActiveTab('grading-tool');
        }
    }, [rubricFormData]);

    // Legacy compatibility - map persistent form data
    const persistentFormData = gradingFormData;
    const updatePersistentFormData = setGradingFormData;

    const value = {
        // Shared state
        sharedRubric,
        setSharedRubric,
        sharedCourseDetails,
        setSharedCourseDetails,

        // Navigation
        activeTab,
        setActiveTab,

        // Grading form data
        gradingData: gradingFormData,
        setGradingFormData,
        setGradingData: setGradingFormData,
        updateStudentInfo,
        updateCourseInfo,
        updateAssignmentInfo,
        updateFeedbackInfo,
        updateAttachments,
        updateVideoLinks,
        updateLatePolicy,
        updateRubricGrading,
        updateMetadata,

        // Rubric form data
        rubricFormData,
        setRubricFormData,
        updateRubricFormData,
        updateRubricAssignmentInfo,
        updateRubricCriteria,
        updateRubricLevels,
        updateRubricSettings,

        // Actions – rubric management
        transferRubricToGrading,
        transferRubricToGradingWithDetails,
        clearSharedRubric,

        // Actions – clear functions
        clearGradingFormData,
        clearRubricFormData,
        clearAllData,

        // Class & grading flow
        classList,
        setClassList,
        currentStudent,
        setCurrentStudent,

        // Draft & final helpers - UPDATED WITH MISSING FUNCTIONS
        drafts,
        saveDraft,
        loadDraft,
        saveFinalGrade,
        loadFinalGrade,  // ✅ ADDED - was missing
        finalGrades,     // ✅ ADDED - was missing
        getGradeStatus,
        hasDraft,

        // Session navigation
        nextStudentInSession,
        previousStudentInSession,
        jumpToStudentInSession,
        updateGradingSession,
        initializeGradingSession,

        // Expose grading session
        gradingSession,
        setGradingSession,

        // Legacy compatibility
        persistentFormData,
        updatePersistentFormData,
    };

    return (
        <AssessmentContext.Provider value={value}>
            {children}
        </AssessmentContext.Provider>
    );
};