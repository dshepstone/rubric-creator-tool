// Updated SharedContext.js with Course Information Fix
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

    // ---- ALIAS for backward-compatibility ----
    const gradingData = gradingFormData;
    const setGradingData = setGradingFormData;

    // Update functions for form data
    const updateStudentInfo = useCallback((updates) => {
        setGradingFormData(prev => ({
            ...prev,
            student: { ...prev.student, ...updates }
        }));
    }, []);

    const updateCourseInfo = useCallback((updates) => {
        setGradingFormData(prev => ({
            ...prev,
            course: { ...prev.course, ...updates }
        }));

        // **FIX:** Also update the shared course details immediately
        setSharedCourseDetails(prev => ({
            ...prev,
            course: {
                ...(prev?.course || {}),
                ...updates
            }
        }));
    }, []);

    const updateAssignmentInfo = useCallback((updates) => {
        setGradingFormData(prev => ({
            ...prev,
            assignment: { ...prev.assignment, ...updates }
        }));

        // **FIX:** Also update the shared assignment details immediately
        setSharedCourseDetails(prev => ({
            ...prev,
            assignment: {
                ...(prev?.assignment || {}),
                ...updates
            }
        }));
    }, []);

    // Clear functions
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

    // Draft and final grade management
    const saveDraft = useCallback((studentId, gradeData) => {
        setDrafts(prev => ({
            ...prev,
            [studentId]: {
                ...gradeData,
                savedAt: new Date().toISOString(),
                type: 'draft'
            }
        }));
        console.log('💾 Draft saved for student:', studentId);
    }, []);

    const loadDraft = useCallback((studentId) => {
        return drafts[studentId] || null;
    }, [drafts]);

    const saveFinalGrade = useCallback((studentId, gradeData) => {
        setFinalGrades(prev => ({
            ...prev,
            [studentId]: {
                ...gradeData,
                savedAt: new Date().toISOString(),
                type: 'final'
            }
        }));
        console.log('✅ Final grade saved for student:', studentId);
    }, []);

    const loadFinalGrade = useCallback((studentId) => {
        return finalGrades[studentId] || null;
    }, [finalGrades]);

    const getGradeStatus = useCallback((studentId) => {
        if (finalGrades[studentId]) return 'final';
        if (drafts[studentId]) return 'draft';
        return 'pending';
    }, [finalGrades, drafts]);

    // Session navigation
    const nextStudentInSession = useCallback(() => {
        if (!gradingSession.active || !classList) return false;

        const currentIndex = gradingSession.currentStudentIndex;
        if (currentIndex < classList.students.length - 1) {
            const nextIndex = currentIndex + 1;
            const nextStudent = classList.students[nextIndex];

            setGradingSession(prev => ({
                ...prev,
                currentStudentIndex: nextIndex,
                currentStudent: nextStudent
            }));

            setCurrentStudent(nextStudent);

            // **FIX:** Load course info for the next student too
            setGradingFormData(prev => ({
                ...prev,
                student: {
                    name: nextStudent.name,
                    id: nextStudent.id,
                    email: nextStudent.email
                },
                // Keep the existing course and assignment info
                course: sharedCourseDetails?.course || prev.course,
                assignment: sharedCourseDetails?.assignment || prev.assignment
            }));

            return true;
        }
        return false;
    }, [gradingSession, classList, sharedCourseDetails]);

    const previousStudentInSession = useCallback(() => {
        if (!gradingSession.active || !classList) return false;

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

            // **FIX:** Load course info for the previous student too
            setGradingFormData(prev => ({
                ...prev,
                student: {
                    name: prevStudent.name,
                    id: prevStudent.id,
                    email: prevStudent.email
                },
                // Keep the existing course and assignment info
                course: sharedCourseDetails?.course || prev.course,
                assignment: sharedCourseDetails?.assignment || prev.assignment
            }));

            return true;
        }
        return false;
    }, [gradingSession, classList, sharedCourseDetails]);

    // **MAIN FIX:** Initialize grading session with first student AND course info
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

        // **FIX:** Preserve the current course and assignment info when starting session
        const currentCourse = gradingFormData.course;
        const currentAssignment = gradingFormData.assignment;

        setGradingFormData(prev => ({
            ...prev,
            student: {
                name: firstStudent.name,
                id: firstStudent.id,
                email: firstStudent.email
            },
            // **CRITICAL:** Keep the current course and assignment info
            course: currentCourse,
            assignment: currentAssignment
        }));

        // **FIX:** Also update shared course details for navigation
        setSharedCourseDetails({
            course: currentCourse,
            assignment: currentAssignment,
            student: {
                name: firstStudent.name,
                id: firstStudent.id,
                email: firstStudent.email
            }
        });

        console.log('🚀 Grading session started with course info:', currentCourse);
        console.log('📚 Assignment info:', currentAssignment);
        console.log('👨‍🎓 First student:', firstStudent.name);

        return true;
    }, [gradingFormData]);

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

    const clearAllData = useCallback(() => {
        setSharedRubric(null);
        clearGradingFormData();
        clearRubricFormData();
    }, [clearGradingFormData, clearRubricFormData]);

    // **FIX:** Export all necessary functions in the value object
    const value = {
        // Shared states
        sharedRubric,
        setSharedRubric,
        sharedCourseDetails,
        setSharedCourseDetails,
        activeTab,
        setActiveTab,

        // Form data
        gradingData: gradingFormData,
        setGradingData: setGradingFormData,
        gradingFormData,
        setGradingFormData,
        rubricFormData,
        setRubricFormData,

        // Update functions
        updateStudentInfo,
        updateCourseInfo,
        updateAssignmentInfo,
        clearGradingFormData,
        clearRubricFormData,
        clearAllData,

        // Class and student management
        classList,
        setClassList,
        currentStudent,
        setCurrentStudent,

        // Draft and final grade management
        drafts,
        setDrafts,
        finalGrades,
        setFinalGrades,
        saveDraft,
        loadDraft,
        saveFinalGrade,
        loadFinalGrade,
        getGradeStatus,

        // Session management
        gradingSession,
        setGradingSession,
        nextStudentInSession,
        previousStudentInSession,
        updateGradingSession,
        initializeGradingSession,

        // Rubric management
        transferRubricToGrading
    };

    return (
        <AssessmentContext.Provider value={value}>
            {children}
        </AssessmentContext.Provider>
    );
};