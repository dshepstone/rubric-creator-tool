// SharedContext.js - Enhanced Privacy-Focused Session Management
// Preserves ALL existing functionality while implementing 1-hour session timeout

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AssessmentContext = createContext();

// Session configuration constants
const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const SESSION_WARNING_MS = 55 * 60 * 1000; // 55 minutes - warning time
const SESSION_KEY = 'gradingSession';

// Default late policy
export const DEFAULT_LATE_POLICY = {
    id: 'default',
    name: 'Standard Late Policy',
    type: 'percentage',
    penaltyRate: 10,
    gracePeriod: 0,
    maxPenalty: 100,
    levels: {
        none: { label: 'On Time', multiplier: 1.0, description: 'No penalty applied' },
        light: { label: 'Lightly Late', multiplier: 0.95, description: '5% penalty' },
        moderate: { label: 'Moderately Late', multiplier: 0.85, description: '15% penalty' },
        heavy: { label: 'Heavily Late', multiplier: 0.70, description: '30% penalty' },
        severe: { label: 'Severely Late', multiplier: 0.50, description: '50% penalty' }
    }
};

// Privacy-compliant session manager
class SessionManager {
    constructor() {
        this.sessionTimer = null;
        this.warningTimer = null;
        this.onSessionExpired = null;
        this.onSessionWarning = null;
    }

    startSession() {
        const sessionStart = Date.now();
        const sessionData = {
            startTime: sessionStart,
            expiryTime: sessionStart + SESSION_TIMEOUT_MS,
            isActive: true
        };

        // Store session metadata only (no user data)
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            console.log('✅ New session started, expires in 1 hour');
        } catch (error) {
            console.error('Failed to start session:', error);
        }

        this.setTimers();
        return sessionData;
    }

    setTimers() {
        // Clear existing timers
        this.clearTimers();

        // Set warning timer (55 minutes)
        this.warningTimer = setTimeout(() => {
            this.triggerWarning();
        }, SESSION_WARNING_MS);

        // Set expiry timer (60 minutes)
        this.sessionTimer = setTimeout(() => {
            this.expireSession();
        }, SESSION_TIMEOUT_MS);
    }

    triggerWarning() {
        console.warn('⚠️ Session expires in 5 minutes');
        if (this.onSessionWarning) {
            this.onSessionWarning();
        }
    }

    expireSession() {
        console.log('🕐 Session expired - clearing all data');
        this.clearAllSessionData();
        if (this.onSessionExpired) {
            this.onSessionExpired();
        }
    }

    clearTimers() {
        if (this.warningTimer) {
            clearTimeout(this.warningTimer);
            this.warningTimer = null;
        }
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    isSessionValid() {
        try {
            const sessionData = sessionStorage.getItem(SESSION_KEY);
            if (!sessionData) return false;

            const session = JSON.parse(sessionData);
            const now = Date.now();

            return session.isActive && now < session.expiryTime;
        } catch (error) {
            console.error('Session validation error:', error);
            return false;
        }
    }

    clearAllSessionData() {
        // Clear session storage
        try {
            sessionStorage.clear();
        } catch (error) {
            console.error('Failed to clear session storage:', error);
        }

        // Clear localStorage (legacy data) - PRIVACY REQUIREMENT
        try {
            localStorage.removeItem('gradingDrafts');
            localStorage.removeItem('finalGrades');
            localStorage.removeItem('customLatePolicies');
            localStorage.removeItem('currentLatePolicy');
            localStorage.removeItem('activeGradeBook');
            localStorage.removeItem('activeClassList');
            console.log('✅ All persistent data cleared for privacy');
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }

        this.clearTimers();
    }

    extendSession() {
        if (this.isSessionValid()) {
            this.startSession(); // Restart session with new timer
            return true;
        }
        return false;
    }

    getTimeRemaining() {
        try {
            const sessionData = sessionStorage.getItem(SESSION_KEY);
            if (!sessionData) return 0;

            const session = JSON.parse(sessionData);
            const now = Date.now();
            const remaining = session.expiryTime - now;

            return Math.max(0, remaining);
        } catch (error) {
            console.error('Error getting time remaining:', error);
            return 0;
        }
    }
}

export const AssessmentProvider = ({ children }) => {
    // Session management
    const [sessionManager] = useState(() => new SessionManager());
    const [sessionActive, setSessionActive] = useState(false);
    const [showSessionWarning, setShowSessionWarning] = useState(false);

    // PRESERVED: Navigation state
    const [activeTab, setActiveTab] = useState('class-manager');

    // PRESERVED: Shared state
    const [sharedRubric, setSharedRubric] = useState(null);
    const [sharedCourseDetails, setSharedCourseDetails] = useState(null);

    // PRESERVED: Class list and student management
    const [classList, setClassList] = useState(null);
    const [currentStudent, setCurrentStudent] = useState(null);

    // PRESERVED: Grading session state
    const [gradingSession, setGradingSession] = useState({
        active: false,
        classListData: null,
        currentStudentIndex: 0,
        currentStudent: null,
        startedAt: null
    });

    // PRESERVED: Form data states - session-only now
    const [gradingFormData, setGradingFormData] = useState({
        student: { name: '', id: '', email: '' },
        course: { code: '', name: '', instructor: '', semester: '', year: '' },
        assignment: { title: '', description: '', dueDate: '', totalPoints: 100, maxPoints: 100 },
        rubricGrading: {},
        feedback: { strengths: '', improvements: '', general: '' },
        attachments: [],
        videoLinks: [],
        metadata: { gradedBy: '', gradedDate: '', version: '1.0', notes: '' },
        latePolicy: {
            level: 'none',
            penaltyApplied: false,
            policyId: null,
            originalScore: null,
            adjustedScore: null,
            multiplier: 1.0
        }
    });

    const [rubricFormData, setRubricFormData] = useState({
        course: { code: '', name: '', instructor: '', semester: '', year: '' },
        assignment: { title: '', description: '', dueDate: '', totalPoints: 100, passingThreshold: 70 },
        criteria: []
    });

    // PRESERVED: AI form states
    const [aiPromptFormData, setAIPromptFormData] = useState({
        assignmentType: '',
        programType: 'diploma',
        programLevel: '',
        subjectArea: '',
        assignmentDescription: '',
        totalPoints: '100',
        weightPercentage: '',
        numCriteria: '4',
        criteriaType: 'ai-suggested',
        userCriteria: '',
        learningObjectives: '',
        studentPopulation: '',
        specialConsiderations: '',
        institutionType: 'college'
    });

    const [assignmentPromptFormData, setAssignmentPromptFormData] = useState({
        assignmentType: '',
        topic: '',
        difficultyLevel: '',
        learningObjectives: '',
        deliverables: '',
        constraints: '',
        additionalRequirements: ''
    });

    // PRESERVED: Grade management - session-only, no persistence
    const [drafts, setDrafts] = useState({});
    const [finalGrades, setFinalGrades] = useState({});

    // PRESERVED: Late policy management
    const [currentLatePolicy, setCurrentLatePolicy] = useState(DEFAULT_LATE_POLICY);
    const [customLatePolicies, setCustomLatePolicies] = useState([]);

    // PRESERVED: Grade book state - requires manual import
    const [gradeBook, setGradeBook] = useState(null);

    // Initialize session on mount - PRIVACY FEATURE
    useEffect(() => {
        // Clear all data on startup - privacy requirement
        sessionManager.clearAllSessionData();

        // Start new session
        sessionManager.startSession();
        setSessionActive(true);

        // Set up session event handlers
        sessionManager.onSessionWarning = () => {
            setShowSessionWarning(true);
        };

        sessionManager.onSessionExpired = () => {
            // Clear all application state
            clearAllData();
            setSessionActive(false);
            setShowSessionWarning(false);
            alert('Session expired after 1 hour. All data has been cleared for privacy.');
        };

        // Check for existing session validity
        if (!sessionManager.isSessionValid()) {
            sessionManager.startSession();
        }

        return () => {
            sessionManager.clearTimers();
        };
    }, []);

    // PRESERVED: AI Prompt form management
    const initializeAIPromptFormData = useCallback(() => {
        setAIPromptFormData({
            assignmentType: '',
            programType: 'diploma',
            programLevel: '',
            subjectArea: '',
            assignmentDescription: '',
            totalPoints: '100',
            weightPercentage: '',
            numCriteria: '4',
            criteriaType: 'ai-suggested',
            userCriteria: '',
            learningObjectives: '',
            studentPopulation: '',
            specialConsiderations: '',
            institutionType: 'college'
        });
    }, []);

    // PRESERVED: Form update functions
    const updateStudentInfo = useCallback((field, value) => {
        setGradingFormData(prev => ({
            ...prev,
            student: { ...prev.student, [field]: value }
        }));
    }, []);

    const updateCourseInfo = useCallback((field, value) => {
        setGradingFormData(prev => ({
            ...prev,
            course: { ...prev.course, [field]: value }
        }));
    }, []);

    const updateAssignmentInfo = useCallback((field, value) => {
        setGradingFormData(prev => ({
            ...prev,
            assignment: { ...prev.assignment, [field]: value }
        }));
    }, []);

    const updateFeedbackInfo = useCallback((field, value) => {
        setGradingFormData(prev => ({
            ...prev,
            feedback: { ...prev.feedback, [field]: value }
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

    const updateLatePolicyInfo = useCallback((field, value) => {
        setGradingFormData(prev => ({
            ...prev,
            latePolicy: { ...prev.latePolicy, [field]: value }
        }));
    }, []);

    const updateRubricGrading = useCallback((criterionId, data) => {
        setGradingFormData(prev => ({
            ...prev,
            rubricGrading: { ...prev.rubricGrading, [criterionId]: data }
        }));
    }, []);

    const updateMetadata = useCallback((field, value) => {
        setGradingFormData(prev => ({
            ...prev,
            metadata: { ...prev.metadata, [field]: value }
        }));
    }, []);

    // PRESERVED: AI Prompt form functions
    const updateAIPromptFormData = useCallback((field, value) => {
        setAIPromptFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const clearAIPromptFormData = useCallback(() => {
        setAIPromptFormData({
            assignmentType: '',
            programType: 'diploma',
            programLevel: '',
            subjectArea: '',
            assignmentDescription: '',
            totalPoints: '100',
            weightPercentage: '',
            numCriteria: '4',
            criteriaType: 'ai-suggested',
            userCriteria: '',
            learningObjectives: '',
            studentPopulation: '',
            specialConsiderations: '',
            institutionType: 'college'
        });
    }, []);

    // PRESERVED: Assignment Prompt form functions
    const updateAssignmentPromptFormData = useCallback((field, value) => {
        setAssignmentPromptFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const initializeAssignmentPromptFormData = useCallback((data) => {
        setAssignmentPromptFormData(data);
    }, []);

    const clearAssignmentPromptFormData = useCallback(() => {
        setAssignmentPromptFormData({
            assignmentType: '',
            topic: '',
            difficultyLevel: '',
            learningObjectives: '',
            deliverables: '',
            constraints: '',
            additionalRequirements: ''
        });
    }, []);

    // MODIFIED: Grade management - session-only, no localStorage persistence
    const saveDraft = useCallback((studentId, gradeData) => {
        if (!sessionActive) {
            console.warn('Cannot save draft - session inactive');
            return;
        }

        const draftData = {
            ...gradeData,
            savedAt: new Date().toISOString(),
            type: 'draft'
        };
        setDrafts(prev => ({ ...prev, [studentId]: draftData }));
        console.log('✅ Draft saved for student:', studentId, '(session only)');
    }, [sessionActive]);

    const loadDraft = useCallback((studentId) => {
        return drafts[studentId] || null;
    }, [drafts]);

    const saveFinalGrade = useCallback((studentId, gradeData) => {
        if (!sessionActive) {
            console.warn('Cannot save final grade - session inactive');
            return;
        }

        const finalData = {
            ...gradeData,
            finalizedAt: new Date().toISOString(),
            type: 'final'
        };
        setFinalGrades(prev => ({ ...prev, [studentId]: finalData }));

        // Remove from drafts when finalized
        setDrafts(prev => {
            const newDrafts = { ...prev };
            delete newDrafts[studentId];
            return newDrafts;
        });

        console.log('✅ Final grade saved for student:', studentId, '(session only)');
    }, [sessionActive]);

    const loadFinalGrade = useCallback((studentId) => {
        return finalGrades[studentId] || null;
    }, [finalGrades]);

    const getGradeStatus = useCallback((studentId) => {
        if (finalGrades[studentId]) return 'final';
        if (drafts[studentId]) return 'draft';
        return 'none';
    }, [drafts, finalGrades]);

    const hasDraft = useCallback((studentId) => {
        return getGradeStatus(studentId) === 'draft';
    }, [getGradeStatus]);

    const finalizeGrade = useCallback((studentId) => {
        const draft = loadDraft(studentId);
        if (draft) {
            saveFinalGrade(studentId, draft);
            return true;
        }
        return false;
    }, [loadDraft, saveFinalGrade]);

    const unlockGrade = useCallback((studentId) => {
        const finalGrade = loadFinalGrade(studentId);
        if (finalGrade) {
            saveDraft(studentId, { ...finalGrade, type: 'draft' });
            setFinalGrades(prev => {
                const newFinals = { ...prev };
                delete newFinals[studentId];
                return newFinals;
            });
            console.log('✅ Grade unlocked for student:', studentId);
            return true;
        }
        return false;
    }, [loadFinalGrade, saveDraft]);

    // PRESERVED: Grading session management
    const initializeGradingSession = useCallback((classListData, rubricData) => {
        if (!classListData || !classListData.students || classListData.students.length === 0) {
            console.warn('Cannot initialize grading session: No students found');
            return false;
        }

        const firstStudent = classListData.students[0];

        setGradingSession({
            active: true,
            classListData: classListData,
            currentStudentIndex: 0,
            currentStudent: firstStudent,
            startedAt: new Date().toISOString()
        });

        setCurrentStudent(firstStudent);

        // Auto-populate course information from class list
        if (classListData.courseMetadata) {
            updateCourseInfo('code', classListData.courseMetadata.courseCode || '');
            updateCourseInfo('name', classListData.courseMetadata.courseName || '');
            updateCourseInfo('instructor', classListData.courseMetadata.instructor ||
                classListData.courseMetadata.professors || '');
        }

        // Auto-populate assignment information from rubric
        if (rubricData && rubricData.assignmentInfo) {
            updateAssignmentInfo('title', rubricData.assignmentInfo.title || '');
            updateAssignmentInfo('description', rubricData.assignmentInfo.description || '');
            updateAssignmentInfo('totalPoints', rubricData.assignmentInfo.totalPoints || 100);
            updateAssignmentInfo('maxPoints', rubricData.assignmentInfo.totalPoints || 100);
        }

        // Auto-populate student information for first student
        updateStudentInfo('name', firstStudent.name || '');
        updateStudentInfo('id', firstStudent.id || '');
        updateStudentInfo('email', firstStudent.email || '');

        console.log('✅ Grading session initialized:', {
            totalStudents: classListData.students.length,
            firstStudent: firstStudent.name,
            courseInfo: classListData.courseMetadata
        });

        return true;
    }, [updateCourseInfo, updateAssignmentInfo, updateStudentInfo]);

    const updateGradingSession = useCallback((updates) => {
        setGradingSession(prev => ({ ...prev, ...updates }));
    }, []);

    const nextStudentInSession = useCallback((saveType = null) => {
        if (!gradingSession.active || !gradingSession.classListData) {
            console.warn('No active grading session');
            return false;
        }

        const nextIndex = gradingSession.currentStudentIndex + 1;
        if (nextIndex >= gradingSession.classListData.students.length) {
            console.log('Reached end of student list');
            return false;
        }

        const nextStudent = gradingSession.classListData.students[nextIndex];

        setGradingSession(prev => ({
            ...prev,
            currentStudentIndex: nextIndex,
            currentStudent: nextStudent
        }));

        setCurrentStudent(nextStudent);

        // Auto-populate student information for next student
        updateStudentInfo('name', nextStudent.name || '');
        updateStudentInfo('id', nextStudent.id || '');
        updateStudentInfo('email', nextStudent.email || '');

        console.log('✅ Moved to next student:', nextStudent.name);
        return true;
    }, [gradingSession, updateStudentInfo]);

    const previousStudentInSession = useCallback(() => {
        if (!gradingSession.active || !gradingSession.classListData) {
            console.warn('No active grading session');
            return false;
        }

        const prevIndex = gradingSession.currentStudentIndex - 1;
        if (prevIndex < 0) {
            console.log('Already at first student');
            return false;
        }

        const prevStudent = gradingSession.classListData.students[prevIndex];

        setGradingSession(prev => ({
            ...prev,
            currentStudentIndex: prevIndex,
            currentStudent: prevStudent
        }));

        setCurrentStudent(prevStudent);

        // Auto-populate student information for previous student
        updateStudentInfo('name', prevStudent.name || '');
        updateStudentInfo('id', prevStudent.id || '');
        updateStudentInfo('email', prevStudent.email || '');

        console.log('✅ Moved to previous student:', prevStudent.name);
        return true;
    }, [gradingSession, updateStudentInfo]);

    // PRESERVED: Late policy management functions
    const loadLatePoliciesFromStorage = useCallback(() => {
        // No longer loads from localStorage for privacy - keeps default policies only
        console.log('Late policies loaded from defaults only (privacy mode)');
    }, []);

    const saveCustomLatePolicy = useCallback((policyData) => {
        const newPolicy = {
            ...policyData,
            id: `custom-${Date.now()}`,
            createdAt: new Date().toISOString()
        };

        setCustomLatePolicies(prev => [...prev, newPolicy]);
        console.log('Custom late policy saved (session only)');
        return newPolicy;
    }, []);

    const updateCustomLatePolicy = useCallback((policyId, policyData) => {
        setCustomLatePolicies(prev =>
            prev.map(policy =>
                policy.id === policyId
                    ? { ...policy, ...policyData, updatedAt: new Date().toISOString() }
                    : policy
            )
        );
    }, []);

    const deleteCustomLatePolicy = useCallback((policyId) => {
        setCustomLatePolicies(prev => prev.filter(policy => policy.id !== policyId));
    }, []);

    const applyLatePolicy = useCallback((score, policyLevel) => {
        const activeLevels = currentLatePolicy?.levels || DEFAULT_LATE_POLICY.levels;
        const policyData = activeLevels[policyLevel] || activeLevels.none;
        return score * policyData.multiplier;
    }, [currentLatePolicy]);

    const calculateScoreWithLatePolicy = useCallback((rawScore, policyLevel) => {
        return applyLatePolicy(rawScore, policyLevel);
    }, [applyLatePolicy]);

    // PRESERVED: Utility functions
    const transferRubricToGrading = useCallback((rubricData) => {
        if (!rubricData) return;

        setSharedRubric(rubricData);

        setGradingFormData(prevData => ({
            ...prevData,
            course: rubricData.courseInfo || prevData.course,
            assignment: rubricData.assignmentInfo || prevData.assignment,
            rubricGrading: {}
        }));
    }, []);

    const transferRubricToGradingWithDetails = useCallback((rubricData, courseDetails) => {
        if (!rubricData) return;

        setSharedRubric(rubricData);
        if (courseDetails) setSharedCourseDetails(courseDetails);

        setGradingFormData(prevData => ({
            ...prevData,
            course: rubricData.courseInfo || prevData.course,
            assignment: rubricData.assignmentInfo || prevData.assignment,
            rubricGrading: {}
        }));
    }, []);

    const clearSharedRubric = useCallback(() => {
        setSharedRubric(null);
    }, []);

    const clearRubricFormData = useCallback(() => {
        setRubricFormData({
            course: { code: '', name: '', instructor: '', semester: '', year: '' },
            assignment: { title: '', description: '', dueDate: '', totalPoints: 100, passingThreshold: 70 },
            criteria: []
        });
    }, []);

    const clearGradingFormData = useCallback(() => {
        setGradingFormData({
            student: { name: '', id: '', email: '' },
            course: { code: '', name: '', instructor: '', semester: '', year: '' },
            assignment: { title: '', description: '', dueDate: '', totalPoints: 100, maxPoints: 100 },
            rubricGrading: {},
            feedback: { strengths: '', improvements: '', general: '' },
            attachments: [],
            videoLinks: [],
            metadata: { gradedBy: '', gradedDate: '', version: '1.0', notes: '' },
            latePolicy: {
                level: 'none',
                penaltyApplied: false,
                policyId: null,
                originalScore: null,
                adjustedScore: null,
                multiplier: 1.0
            }
        });
    }, []);

    // MODIFIED: Session management functions - privacy enhanced
    const extendSession = useCallback(() => {
        if (sessionManager.extendSession()) {
            setShowSessionWarning(false);
            alert('Session extended for another hour.');
        } else {
            alert('Unable to extend session. Please save your work and restart.');
        }
    }, [sessionManager]);

    const getSessionTimeRemaining = useCallback(() => {
        return sessionManager.getTimeRemaining();
    }, [sessionManager]);

    const clearAllData = useCallback(() => {
        setSharedRubric(null);
        setSharedCourseDetails(null);
        clearGradingFormData();
        clearRubricFormData();
        clearAIPromptFormData();
        clearAssignmentPromptFormData();
        setDrafts({});
        setFinalGrades({});
        setCustomLatePolicies([]);
        setCurrentLatePolicy(DEFAULT_LATE_POLICY);
        setClassList(null);
        setCurrentStudent(null);
        setGradingSession({
            active: false,
            classListData: null,
            currentStudentIndex: 0,
            currentStudent: null,
            startedAt: null
        });
        setGradeBook(null);
        console.log('✅ All application data cleared for privacy');
    }, [clearGradingFormData, clearRubricFormData, clearAIPromptFormData, clearAssignmentPromptFormData]);

    const exportSession = useCallback(() => {
        const sessionData = {
            rubric: sharedRubric,
            courseDetails: sharedCourseDetails,
            gradingData: gradingFormData,
            classList: classList,
            currentStudent: currentStudent,
            drafts: drafts,
            finalGrades: finalGrades,
            customLatePolicies: customLatePolicies,
            currentLatePolicy: currentLatePolicy,
            gradeBook: gradeBook,
            exportedAt: new Date().toISOString(),
            version: '2.0',
            sessionExport: true
        };

        const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `grading-session-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [sharedRubric, sharedCourseDetails, gradingFormData, classList, currentStudent, drafts, finalGrades, customLatePolicies, currentLatePolicy, gradeBook]);

    const importSession = useCallback((sessionData) => {
        try {
            const data = typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData;

            if (data.rubric) setSharedRubric(data.rubric);
            if (data.courseDetails) setSharedCourseDetails(data.courseDetails);
            if (data.gradingData) setGradingFormData(data.gradingData);
            if (data.classList) setClassList(data.classList);
            if (data.currentStudent) setCurrentStudent(data.currentStudent);
            if (data.drafts) setDrafts(data.drafts);
            if (data.finalGrades) setFinalGrades(data.finalGrades);
            if (data.customLatePolicies) setCustomLatePolicies(data.customLatePolicies);
            if (data.currentLatePolicy) setCurrentLatePolicy(data.currentLatePolicy);
            if (data.gradeBook) setGradeBook(data.gradeBook);

            console.log('✅ Session imported successfully');
        } catch (error) {
            console.error("Failed to import session:", error);
            alert("Error: Could not load the session file. Please ensure it's a valid session file.");
        }
    }, []);

    // Context value with ALL functions preserved
    const value = {
        // Session management - PRIVACY FEATURES
        sessionActive,
        showSessionWarning,
        extendSession,
        getSessionTimeRemaining,
        clearAllData,

        // Shared state
        sharedRubric,
        setSharedRubric,
        sharedCourseDetails,
        setSharedCourseDetails,

        // Navigation
        activeTab,
        setActiveTab,

        // AI Prompt Generator
        aiPromptFormData,
        updateAIPromptFormData,
        initializeAIPromptFormData,
        clearAIPromptFormData,

        // Assignment Prompt Generator
        assignmentPromptFormData,
        updateAssignmentPromptFormData,
        initializeAssignmentPromptFormData,
        clearAssignmentPromptFormData,

        // Grading form data
        gradingData: gradingFormData,
        setGradingData: setGradingFormData,
        clearGradingFormData,
        persistentFormData: gradingFormData,
        updatePersistentFormData: setGradingFormData,

        // Form update functions
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
        drafts,
        finalGrades,
        saveDraft,
        loadDraft,
        saveFinalGrade,
        loadFinalGrade,
        getGradeStatus,
        hasDraft,
        finalizeGrade,
        unlockGrade,

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

        // Late Policy Management
        currentLatePolicy,
        setCurrentLatePolicy,
        customLatePolicies,
        setCustomLatePolicies,
        loadLatePoliciesFromStorage,
        saveCustomLatePolicy,
        updateCustomLatePolicy,
        deleteCustomLatePolicy,
        applyLatePolicy,
        calculateScoreWithLatePolicy,

        // Utility functions
        transferRubricToGrading,
        transferRubricToGradingWithDetails,
        clearSharedRubric,
        clearRubricFormData,

        // Session management
        exportSession,
        importSession,

        // Grade book
        gradeBook,
        setGradeBook
    };

    return (
        <AssessmentContext.Provider value={value}>
            {children}
            {/* Session warning modal */}
            {showSessionWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-orange-600 mb-2">
                            ⚠️ Session Expiring Soon
                        </h3>
                        <p className="text-gray-700 mb-4">
                            Your session will expire in 5 minutes. All data will be cleared for privacy.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={extendSession}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Extend Session
                            </button>
                            <button
                                onClick={() => setShowSessionWarning(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AssessmentContext.Provider>
    );
};

export const useAssessment = () => {
    const context = useContext(AssessmentContext);
    if (!context) {
        throw new Error('useAssessment must be used within an AssessmentProvider');
    }
    return context;
};