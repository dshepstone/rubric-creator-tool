// Updated SharedContext.js with Enhanced Draft/Final Grade Management
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
    const [sharedCourseDetails, setSharedCourseDetails] = useState(null);
    const [activeTab, setActiveTab] = useState('rubric-creator');

    // Class list and student management
    const [classList, setClassList] = useState(null);
    const [currentStudent, setCurrentStudent] = useState(null);

    // ENHANCED: Separate storage for draft and final grades
    const [drafts, setDrafts] = useState({});
    const [finalGrades, setFinalGrades] = useState({});

    // Batch grading session state
    const [gradingSession, setGradingSession] = useState({
        active: false,
        startTime: null,
        gradedStudents: [],
        totalStudents: 0,
        currentStudent: null,
        currentStudentIndex: 0
    });

    // Form data states
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

    // Form update functions
    const updateStudentInfo = useCallback((studentInfo) => {
        setGradingFormData(prev => ({
            ...prev,
            student: { ...prev.student, ...studentInfo }
        }));
    }, []);

    const updateCourseInfo = useCallback((courseInfo) => {
        setGradingFormData(prev => ({
            ...prev,
            course: { ...prev.course, ...courseInfo }
        }));
    }, []);

    const updateAssignmentInfo = useCallback((assignmentInfo) => {
        setGradingFormData(prev => ({
            ...prev,
            assignment: { ...prev.assignment, ...assignmentInfo }
        }));
    }, []);

    const updateFeedbackInfo = useCallback((feedbackInfo) => {
        setGradingFormData(prev => ({
            ...prev,
            feedback: { ...prev.feedback, ...feedbackInfo }
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

    const updateLatePolicyInfo = useCallback((latePolicyInfo) => {
        setGradingFormData(prev => ({
            ...prev,
            latePolicy: { ...prev.latePolicy, ...latePolicyInfo }
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
            metadata: { ...prev.metadata, ...metadata }
        }));
    }, []);

    // ENHANCED: Draft and Final Grade Management
    const saveDraft = useCallback((studentId, gradingData) => {
        const draftData = {
            ...gradingData,
            metadata: {
                ...gradingData.metadata,
                savedAt: new Date().toISOString(),
                status: 'draft'
            }
        };

        setDrafts(prev => ({
            ...prev,
            [studentId]: draftData
        }));

        console.log('✅ Draft saved for student:', studentId);
        return true;
    }, []);

    const loadDraft = useCallback((studentId) => {
        const draft = drafts[studentId];
        if (draft) {
            console.log('📝 Draft loaded for student:', studentId);
            return draft;
        }
        console.log('⚠️ No draft found for student:', studentId);
        return null;
    }, [drafts]);

    const saveFinalGrade = useCallback((studentId, gradingData) => {
        const finalData = {
            ...gradingData,
            metadata: {
                ...gradingData.metadata,
                savedAt: new Date().toISOString(),
                status: 'final'
            }
        };

        setFinalGrades(prev => ({
            ...prev,
            [studentId]: finalData
        }));

        // Remove from drafts when finalized
        setDrafts(prev => {
            const updated = { ...prev };
            delete updated[studentId];
            return updated;
        });

        console.log('🎯 Final grade saved for student:', studentId);
        return true;
    }, []);

    const loadFinalGrade = useCallback((studentId) => {
        const finalGrade = finalGrades[studentId];
        if (finalGrade) {
            console.log('🎯 Final grade loaded for student:', studentId);
            return finalGrade;
        }
        console.log('⚠️ No final grade found for student:', studentId);
        return null;
    }, [finalGrades]);

    const getGradeStatus = useCallback((studentId) => {
        if (finalGrades[studentId]) return 'final';
        if (drafts[studentId]) return 'draft';
        return 'not_started';
    }, [drafts, finalGrades]);

    // Navigation helpers for grading sessions
    const nextStudentInSession = useCallback((saveType = 'draft') => {
        if (!gradingSession?.active || !classList) return false;

        const currentIndex = gradingSession.currentStudentIndex;
        const students = classList.students;

        if (currentIndex < students.length - 1) {
            const nextIndex = currentIndex + 1;
            const nextStudent = students[nextIndex];

            setGradingSession(prev => ({
                ...prev,
                currentStudentIndex: nextIndex,
                currentStudent: nextStudent,
                gradedStudents: [...prev.gradedStudents, currentStudent.id]
            }));

            setCurrentStudent(nextStudent);
            return true;
        }

        // End of session
        setGradingSession(prev => ({
            ...prev,
            active: false,
            gradedStudents: [...prev.gradedStudents, currentStudent.id]
        }));
        return false;
    }, [gradingSession, classList, currentStudent]);

    const previousStudentInSession = useCallback(() => {
        if (!gradingSession?.active || !classList) return false;

        const currentIndex = gradingSession.currentStudentIndex;
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            const prevStudent = classList.students[prevIndex];

            setGradingSession(prev => ({
                ...prev,
                currentStudentIndex: prevIndex,
                currentStudent: prevStudent
            }));

            setCurrentStudent(prevStudent);
            return true;
        }
        return false;
    }, [gradingSession, classList]);

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

        console.log('🚀 Grading session started for', classListData.students.length, 'students');
        return true;
    }, []);

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
        updateLatePolicyInfo,
        updateRubricGrading,
        updateMetadata,

        // Draft and Final Grade Management
        saveDraft,
        loadDraft,
        saveFinalGrade,
        loadFinalGrade,
        finalGrades,
        drafts,
        getGradeStatus,

        // Class management
        classList,
        setClassList,
        currentStudent,
        setCurrentStudent,

        // Grading session
        gradingSession,
        setGradingSession,
        nextStudentInSession,
        previousStudentInSession,
        updateGradingSession,
        initializeGradingSession,

        // Rubric form data
        rubricFormData,
        setRubricFormData,

        // Utility functions
        transferRubricToGrading,
        transferRubricToGradingWithDetails,
        clearSharedRubric,
        clearGradingFormData,
        clearRubricFormData,
        clearAllData,

        // Legacy compatibility
        persistentFormData,
        updatePersistentFormData
    };

    return (
        <AssessmentContext.Provider value={value}>
            {children}
        </AssessmentContext.Provider>
    );
};