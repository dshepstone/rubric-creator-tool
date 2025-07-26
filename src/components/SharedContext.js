// Complete Fixed SharedContext.js - Fully Merged with ALL Original Features + Late Policy Enhancement
// This version preserves EVERY function and feature from the original while adding late policy support

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ensureUniqueCriterionIds } from '../utils/ensureUniqueCriterionIds';
const AssessmentContext = createContext();

export const useAssessment = () => {
    const context = useContext(AssessmentContext);
    if (!context) {
        throw new Error('useAssessment must be used within AssessmentProvider');
    }
    return context;
};

// DEFAULT LATE POLICY SYSTEM
export const DEFAULT_LATE_POLICY = {
    id: 'institutional',
    name: 'Institutional Policy',
    description: 'Standard institutional late assignment policy',
    levels: {
        none: {
            name: 'On Time',
            multiplier: 1.0,
            description: 'Assignment submitted on or before due date and time - marked out of 100%',
            color: '#16a34a',
            timeframe: 'On or before due date'
        },
        within24: {
            name: '1-24 Hours Late',
            multiplier: 0.8,
            description: 'Assignment received within 24 hours of due date - 20% reduction (marked out of 80%)',
            color: '#ea580c',
            timeframe: 'Up to 24 hours late'
        },
        after24: {
            name: 'More than 24 Hours Late',
            multiplier: 0.0,
            description: 'Assignment received after 24 hours from due date - mark of zero (0)',
            color: '#dc2626',
            timeframe: 'More than 24 hours late'
        }
    }
};

export const AssessmentProvider = ({ children }) => {
    // ORIGINAL: Shared rubric state
    const [sharedRubric, setSharedRubric] = useState(null);
    const [sharedCourseDetails, setSharedCourseDetails] = useState(null);
    const [activeTab, setActiveTab] = useState('assignment-prompt-generator');
    const [gradeBook, setGradeBook] = useState(null);
    const [isGradeBookInitialized, setIsGradeBookInitialized] = useState(false);

    // ORIGINAL: AI Prompt Generator state (for rubrics)
    const [aiPromptFormData, setAIPromptFormData] = useState(null);

    // ORIGINAL: Assignment Prompt Generator state
    const [assignmentPromptFormData, setAssignmentPromptFormData] = useState(null);

    // ORIGINAL: Class list and student management
    const [classList, setClassList] = useState(null);
    const [currentStudent, setCurrentStudent] = useState(null);

    // ORIGINAL: Grading session state
    const [gradingSession, setGradingSession] = useState({
        active: false,
        classListData: null,
        currentStudentIndex: 0,
        currentStudent: null,
        startedAt: null
    });

    // ORIGINAL: Form data states
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

    // ORIGINAL: Draft and final grade storage
    const [drafts, setDrafts] = useState({});
    const [finalGrades, setFinalGrades] = useState({});

    // NEW: Late policy management
    const [currentLatePolicy, setCurrentLatePolicy] = useState(DEFAULT_LATE_POLICY);
    const [customLatePolicies, setCustomLatePolicies] = useState([]);

    // ORIGINAL: AI Prompt form management
    const initializeAIPromptFormData = useCallback(() => {
        setAIPromptFormData({
            assignmentType: '',
            programType: 'diploma', // Default to diploma program type to match policy system
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
            timeFrameNumber: '',
            timeFrameUnit: 'weeks',
            specialConsiderations: ''
        });
    }, []);

    const updateAIPromptFormData = useCallback((field, value) => {
        setAIPromptFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const clearAIPromptFormData = useCallback(() => {
        setAIPromptFormData(null);
    }, []);

    // ORIGINAL: Assignment Prompt form management
    const initializeAssignmentPromptFormData = useCallback(() => {
        setAssignmentPromptFormData({
            assignmentTitle: '',
            assignmentNumber: '',
            assignmentDescription: '',
            weightPercentage: '',
            subjectArea: '',
            programLevel: '',
            clos: [],
            specialInstructions: ''
        });
    }, []);

    const updateAssignmentPromptFormData = useCallback((field, value) => {
        setAssignmentPromptFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const clearAssignmentPromptFormData = useCallback(() => {
        setAssignmentPromptFormData(null);
    }, []);

    // ORIGINAL: Grading form update functions
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
        setGradingFormData(prev => ({ ...prev, attachments }));
    }, []);

    const updateVideoLinks = useCallback((videoLinks) => {
        setGradingFormData(prev => ({ ...prev, videoLinks }));
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

    // ORIGINAL: Draft and final grade management
    const saveDraft = useCallback((studentId, gradeData) => {
        const draftData = {
            ...gradeData,
            savedAt: new Date().toISOString(),
            type: 'draft'
        };
        setDrafts(prev => ({ ...prev, [studentId]: draftData }));

        // Also save to localStorage for persistence
        try {
            const existingDrafts = JSON.parse(localStorage.getItem('gradingDrafts') || '{}');
            existingDrafts[studentId] = draftData;
            localStorage.setItem('gradingDrafts', JSON.stringify(existingDrafts));
        } catch (error) {
            console.error('Failed to save draft to localStorage:', error);
        }

        console.log('✅ Draft saved for student:', studentId);
    }, []);

    const loadDraft = useCallback((studentId) => {
        // First check memory
        if (drafts[studentId]) {
            return drafts[studentId];
        }

        // Then check localStorage
        try {
            const existingDrafts = JSON.parse(localStorage.getItem('gradingDrafts') || '{}');
            if (existingDrafts[studentId]) {
                // Update memory with localStorage data
                setDrafts(prev => ({ ...prev, [studentId]: existingDrafts[studentId] }));
                return existingDrafts[studentId];
            }
        } catch (error) {
            console.error('Failed to load draft from localStorage:', error);
        }

        return null;
    }, [drafts]);

    const saveFinalGrade = useCallback((studentId, gradeData) => {
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

        // Also save to localStorage and remove draft
        try {
            const existingFinals = JSON.parse(localStorage.getItem('finalGrades') || '{}');
            existingFinals[studentId] = finalData;
            localStorage.setItem('finalGrades', JSON.stringify(existingFinals));

            const existingDrafts = JSON.parse(localStorage.getItem('gradingDrafts') || '{}');
            delete existingDrafts[studentId];
            localStorage.setItem('gradingDrafts', JSON.stringify(existingDrafts));
        } catch (error) {
            console.error('Failed to save final grade to localStorage:', error);
        }

        console.log('✅ Final grade saved for student:', studentId);
    }, []);

    const loadFinalGrade = useCallback((studentId) => {
        // First check memory
        if (finalGrades[studentId]) {
            return finalGrades[studentId];
        }

        // Then check localStorage
        try {
            const existingFinals = JSON.parse(localStorage.getItem('finalGrades') || '{}');
            if (existingFinals[studentId]) {
                // Update memory with localStorage data
                setFinalGrades(prev => ({ ...prev, [studentId]: existingFinals[studentId] }));
                return existingFinals[studentId];
            }
        } catch (error) {
            console.error('Failed to load final grade from localStorage:', error);
        }

        return null;
    }, [finalGrades]);

    const getGradeStatus = useCallback((studentId) => {
        if (finalGrades[studentId] || (localStorage.getItem('finalGrades') &&
            JSON.parse(localStorage.getItem('finalGrades'))[studentId])) {
            return 'final';
        }
        if (drafts[studentId] || (localStorage.getItem('gradingDrafts') &&
            JSON.parse(localStorage.getItem('gradingDrafts'))[studentId])) {
            return 'draft';
        }
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
            // Move final grade back to draft
            saveDraft(studentId, { ...finalGrade, type: 'draft' });

            // Remove from final grades
            setFinalGrades(prev => {
                const newFinals = { ...prev };
                delete newFinals[studentId];
                return newFinals;
            });

            // Also update localStorage
            try {
                const existingFinals = JSON.parse(localStorage.getItem('finalGrades') || '{}');
                delete existingFinals[studentId];
                localStorage.setItem('finalGrades', JSON.stringify(existingFinals));
            } catch (error) {
                console.error('Failed to update localStorage:', error);
            }

            console.log('✅ Grade unlocked for student:', studentId);
            return true;
        }
        return false;
    }, [loadFinalGrade, saveDraft]);

    // ORIGINAL: Grading session management
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

    // NEW: Late policy management functions
    const loadLatePoliciesFromStorage = useCallback(() => {
        try {
            const stored = localStorage.getItem('customLatePolicies');
            if (stored) {
                const policies = JSON.parse(stored);
                setCustomLatePolicies(policies);
            }

            const currentPolicyStored = localStorage.getItem('currentLatePolicy');
            if (currentPolicyStored) {
                const policy = JSON.parse(currentPolicyStored);
                setCurrentLatePolicy(policy);
            }
        } catch (error) {
            console.error('Failed to load late policies from localStorage:', error);
        }
    }, []);

    const saveCustomLatePolicy = useCallback((policyData) => {
        const newPolicy = {
            ...policyData,
            id: `custom-${Date.now()}`,
            createdAt: new Date().toISOString()
        };

        setCustomLatePolicies(prev => [...prev, newPolicy]);

        try {
            const updated = [...customLatePolicies, newPolicy];
            localStorage.setItem('customLatePolicies', JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to save custom late policy:', error);
        }

        return newPolicy;
    }, [customLatePolicies]);

    const updateCustomLatePolicy = useCallback((policyId, policyData) => {
        setCustomLatePolicies(prev =>
            prev.map(policy =>
                policy.id === policyId
                    ? { ...policy, ...policyData, updatedAt: new Date().toISOString() }
                    : policy
            )
        );

        try {
            const updated = customLatePolicies.map(policy =>
                policy.id === policyId
                    ? { ...policy, ...policyData, updatedAt: new Date().toISOString() }
                    : policy
            );
            localStorage.setItem('customLatePolicies', JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to update custom late policy:', error);
        }
    }, [customLatePolicies]);

    const deleteCustomLatePolicy = useCallback((policyId) => {
        setCustomLatePolicies(prev => prev.filter(policy => policy.id !== policyId));

        try {
            const updated = customLatePolicies.filter(policy => policy.id !== policyId);
            localStorage.setItem('customLatePolicies', JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to delete custom late policy:', error);
        }

        // If this was the current policy, reset to default
        if (currentLatePolicy.id === policyId) {
            setCurrentLatePolicy(DEFAULT_LATE_POLICY);
        }
    }, [customLatePolicies, currentLatePolicy]);

    const applyLatePolicy = useCallback((score, level, policyId = null) => {
        const policy = policyId
            ? [...customLatePolicies, DEFAULT_LATE_POLICY].find(p => p.id === policyId)
            : currentLatePolicy;

        if (!policy || !policy.levels[level]) {
            return { adjustedScore: score, penaltyApplied: false };
        }

        const multiplier = policy.levels[level].multiplier;
        const adjustedScore = score * multiplier;

        return {
            adjustedScore: Math.round(adjustedScore * 10) / 10, // Round to 1 decimal
            penaltyApplied: level !== 'none',
            multiplier: multiplier,
            policyUsed: policy.name,
            levelUsed: policy.levels[level].name
        };
    }, [customLatePolicies, currentLatePolicy]);

    const calculateScoreWithLatePolicy = useCallback((baseScore, latePolicyLevel = 'none') => {
        const policyLevel = currentLatePolicy.levels[latePolicyLevel];
        if (!policyLevel) {
            return baseScore;
        }

        const adjustedScore = baseScore * policyLevel.multiplier;

        updateLatePolicyInfo('originalScore', baseScore);
        updateLatePolicyInfo('adjustedScore', adjustedScore);
        updateLatePolicyInfo('multiplier', policyLevel.multiplier);
        updateLatePolicyInfo('penaltyApplied', latePolicyLevel !== 'none');

        return adjustedScore;
    }, [currentLatePolicy, updateLatePolicyInfo]);

    // ORIGINAL: Clear form data functions
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

    const clearRubricFormData = useCallback(() => {
        setRubricFormData({
            course: { code: '', name: '', instructor: '', semester: '', year: '' },
            assignment: { title: '', description: '', dueDate: '', totalPoints: 100, passingThreshold: 70 },
            criteria: []
        });
    }, []);

    // ORIGINAL: Transfer and utility functions
    const transferRubricToGrading = useCallback(() => {
        if (sharedRubric) {
            setGradingFormData(prev => ({
                ...prev,
                course: sharedRubric.courseInfo || prev.course,
                assignment: sharedRubric.assignmentInfo || prev.assignment
            }));
        }
    }, [sharedRubric]);

    const transferRubricToGradingWithDetails = useCallback((rubricData) => {
        if (rubricData) {
            setGradingFormData(prev => ({
                ...prev,
                course: rubricData.courseInfo || prev.course,
                assignment: rubricData.assignmentInfo || prev.assignment,
                rubricGrading: {}
            }));
        }
    }, []);

    const clearSharedRubric = useCallback(() => {
        setSharedRubric(null);
    }, []);

    // ORIGINAL: Session management
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
            exportedAt: new Date().toISOString(),
            version: '2.0'
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
    }, [sharedRubric, sharedCourseDetails, gradingFormData, classList, currentStudent, drafts, finalGrades, customLatePolicies, currentLatePolicy]);

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

            // Import late policy data if available
            if (data.customLatePolicies) setCustomLatePolicies(data.customLatePolicies);
            if (data.currentLatePolicy) setCurrentLatePolicy(data.currentLatePolicy);

            console.log('✅ Session imported successfully with late policy data');
        } catch (error) {
            console.error("Failed to import session:", error);
            alert("Error: Could not load the session file. Please ensure it's a valid session file.");
        }
    }, []);

    const clearAllData = useCallback(() => {
        setSharedRubric(null);
        clearGradingFormData();
        clearRubricFormData();
        clearAIPromptFormData();
        clearAssignmentPromptFormData();
        setDrafts({});
        setFinalGrades({});
        setCustomLatePolicies([]);
        setCurrentLatePolicy(DEFAULT_LATE_POLICY);

        // Also clear localStorage
        try {
            localStorage.removeItem('gradingDrafts');
            localStorage.removeItem('finalGrades');
            localStorage.removeItem('customLatePolicies');
            localStorage.removeItem('currentLatePolicy');
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    }, [clearGradingFormData, clearRubricFormData, clearAIPromptFormData, clearAssignmentPromptFormData]);

    // Context value with ALL functions
    const value = {
        // Shared state
        sharedRubric,
        setSharedRubric,
        sharedCourseDetails,
        setSharedCourseDetails,

        // Navigation
        activeTab,
        setActiveTab,

        // AI Prompt Generator (for rubrics)
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
        clearAllData,

        // Session management
        exportSession,
        importSession,

        //grade book
        gradeBook,
        setGradeBook
    };

    return (
        <AssessmentContext.Provider value={value}>
            {children}
        </AssessmentContext.Provider>
    );
};

export default AssessmentProvider;