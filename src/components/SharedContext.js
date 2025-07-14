import React, { createContext, useContext, useState, useCallback } from 'react';

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

    // Shared course-details state (for your GradingTemplate’s setSharedCourseDetails)
    const [sharedCourseDetails, setSharedCourseDetails] = useState(null);

    // Active tab state
    const [activeTab, setActiveTab] = useState('rubric-creator');
    // ─── Persist imported class-list across tabs ───────────────────────
    const [classList, setClassList] = useState(null);

    // ─── Which student is being graded right now ──────────────────────
    const [currentStudent, setCurrentStudent] = useState(null);

    // ─── In-progress grading drafts, keyed by student ID ─────────────
    const [drafts, setDrafts] = useState({});

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

    // Replace the existing navigation functions in SharedContext.js:
    // Navigate to next student in grading session
    const nextStudentInSession = useCallback(() => {
        if (!gradingSession.active || !classList || gradingSession.currentStudentIndex >= classList.students.length - 1) {
            return false; // End of session or no active session
        }

        const nextIndex = gradingSession.currentStudentIndex + 1;
        const nextStudent = classList.students[nextIndex];

        // Update session state
        setGradingSession(prev => ({
            ...prev,
            currentStudentIndex: nextIndex,
            currentStudent: nextStudent,
            gradedStudents: [...prev.gradedStudents, classList.students[gradingSession.currentStudentIndex].id]
        }));

        // Update current student
        setCurrentStudent(nextStudent);

        // Update grading form data with new student info
        setGradingFormData(prev => ({
            ...prev,
            student: {
                name: nextStudent.name,
                id: nextStudent.id,
                email: nextStudent.email
            }
        }));

        // Update class list progress
        const updatedProgress = [...classList.gradingProgress];
        updatedProgress[gradingSession.currentStudentIndex] = {
            ...updatedProgress[gradingSession.currentStudentIndex],
            status: 'completed',
            lastModified: new Date().toISOString()
        };

        setClassList(prev => ({
            ...prev,
            gradingProgress: updatedProgress
        }));

        return true; // Successfully moved to next student
    }, [gradingSession, classList, setGradingSession, setCurrentStudent, setClassList, setGradingFormData]);

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

        // Update grading form data with student info
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

    // Jump to specific student by index
    const jumpToStudentInSession = useCallback((index) => {
        if (!gradingSession.active || !classList || index < 0 || index >= classList.students.length) {
            return false;
        }

        const targetStudent = classList.students[index];

        setGradingSession(prev => ({
            ...prev,
            currentStudentIndex: index,
            currentStudent: targetStudent
        }));

        setCurrentStudent(targetStudent);

        // Update grading form data with student info
        setGradingFormData(prev => ({
            ...prev,
            student: {
                name: targetStudent.name,
                id: targetStudent.id,
                email: targetStudent.email
            }
        }));

        return true;
    }, [gradingSession, classList, setGradingSession, setCurrentStudent, setGradingFormData]);


    // Update grading session state
    const updateGradingSession = useCallback((updates) => {
        setGradingSession(prev => ({
            ...prev,
            ...updates
        }));
    }, [setGradingSession]);

    // Persistent form data for rubric creator
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

    // Transfer rubric to grading tool and switch tabs
    const transferRubricToGrading = useCallback((rubricData) => {
        setSharedRubric(rubricData);

        // Update grading form data with rubric information
        setGradingFormData(prev => ({
            ...prev,
            assignment: {
                ...prev.assignment,
                name: rubricData.assignmentInfo?.title || prev.assignment.name,
                maxPoints: rubricData.assignmentInfo?.totalPoints || prev.assignment.maxPoints
            },
            metadata: {
                ...prev.metadata,
                rubricIntegrated: true
            }
        }));

        setActiveTab('grading-tool');
    }, []);

    // Enhanced transfer function that preserves all form data
    const transferRubricToGradingWithDetails = useCallback((rubricData) => {
        setSharedRubric(rubricData);

        // Update grading form data with rubric information
        setGradingFormData(prev => ({
            ...prev,
            assignment: {
                ...prev.assignment,
                name: rubricData.assignmentInfo?.title || prev.assignment.name,
                maxPoints: rubricData.assignmentInfo?.totalPoints || prev.assignment.maxPoints
            },
            metadata: {
                ...prev.metadata,
                rubricIntegrated: true
            }
        }));

        setActiveTab('grading-tool');
    }, []);

    // Update functions for grading form data
    const updateGradingFormData = useCallback((updates) => {
        setGradingFormData(prev => ({
            ...prev,
            ...updates
        }));
    }, []);

    const updateStudentInfo = useCallback((studentInfo) => {
        setGradingFormData(prev => ({
            ...prev,
            student: {
                ...prev.student,
                ...studentInfo
            }
        }));
    }, []);

    const updateCourseInfo = useCallback((courseInfo) => {
        setGradingFormData(prev => ({
            ...prev,
            course: {
                ...prev.course,
                ...courseInfo
            }
        }));
    }, []);

    const updateAssignmentInfo = useCallback((assignmentInfo) => {
        setGradingFormData(prev => ({
            ...prev,
            assignment: {
                ...prev.assignment,
                ...assignmentInfo
            }
        }));
    }, []);

    const updateFeedbackInfo = useCallback((feedbackInfo) => {
        setGradingFormData(prev => ({
            ...prev,
            feedback: {
                ...prev.feedback,
                ...feedbackInfo
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

    const updateRubricGrading = useCallback((rubricGrading) => {
        setGradingFormData(prev => ({
            ...prev,
            rubricGrading
        }));
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

    // ─── Draft save/load ───────────────────────────────────────────────
    function saveDraft(studentId, data) {
        setDrafts(prev => ({ ...prev, [studentId]: data }));
    }
    function loadDraft(studentId) {
        return drafts[studentId] || null;
    }

    // Helper to check if a student has a saved draft
    const hasDraft = useCallback((studentId) => {
        return studentId && drafts[studentId] != null;
    }, [drafts]);

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

    // Legacy compatibility - map persistent form data
    const persistentFormData = gradingFormData;
    const updatePersistentFormData = updateGradingFormData;

    const value = {
        // Shared state
        sharedRubric,
        setSharedRubric,

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

        // Actions - rubric management
        transferRubricToGrading,
        transferRubricToGradingWithDetails,
        clearSharedRubric,

        // Actions - clear functions
        clearGradingFormData,
        clearRubricFormData,
        clearAllData,

        // ─── Class & grading flow ────────────────────────────────────────
        classList,
        setClassList,
        currentStudent,
        setCurrentStudent,
        drafts,
        saveDraft,
        loadDraft,
        hasDraft,
        nextStudentInSession,
        previousStudentInSession,
        jumpToStudentInSession,
        updateGradingSession,
        initializeGradingSession,

        // ─── Expose grading session ───────────────────────────────────────
        gradingSession,
        setGradingSession,

        // Legacy compatibility
        persistentFormData,
        updatePersistentFormData,
        sharedCourseDetails,
        setSharedCourseDetails,
    };

    return (
        <AssessmentContext.Provider value={value}>
            {children}
        </AssessmentContext.Provider>
    );
};