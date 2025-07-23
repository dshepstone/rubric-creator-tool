// Complete SharedContext.js - Fully Merged with ALL Original Features + Late Policy Enhancement
// This version preserves EVERY function and feature from the original while adding late policy support

import React, { createContext, useContext, useState, useCallback } from 'react';

const AssessmentContext = createContext();

export const useAssessment = () => {
    const context = useContext(AssessmentContext);
    if (!context) {
        throw new Error('useAssessment must be used within AssessmentProvider');
    }
    return context;
};

// DEFAULT LATE POLICY SYSTEM
const DEFAULT_LATE_POLICY = {
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

    // ORIGINAL: AI Prompt Generator state (for rubrics)
    const [aiPromptFormData, setAIPromptFormData] = useState(null);

    // ORIGINAL: Assignment Prompt Generator state
    const [assignmentPromptFormData, setAssignmentPromptFormData] = useState(null);

    // ORIGINAL: Class list and student management
    const [classList, setClassList] = useState(null);
    const [currentStudent, setCurrentStudent] = useState(null);

    // ORIGINAL: Separate storage for draft and final grades
    const [drafts, setDrafts] = useState({});
    const [finalGrades, setFinalGrades] = useState({});

    // NEW: Late Policy State Management
    const [currentLatePolicy, setCurrentLatePolicy] = useState(DEFAULT_LATE_POLICY);
    const [customLatePolicies, setCustomLatePolicies] = useState([]);

    // ORIGINAL: Batch grading session state
    const [gradingSession, setGradingSession] = useState({
        active: false,
        startTime: null,
        gradedStudents: [],
        totalStudents: 0,
        currentStudent: null,
        currentStudentIndex: 0
    });

    // ORIGINAL: Rubric form data state
    const [rubricFormData, setRubricFormData] = useState({
        course: { code: '', name: '', instructor: '', semester: '', year: '' },
        assignment: { title: '', description: '', dueDate: '', totalPoints: 100, passingThreshold: 70 },
        criteria: []
    });

    // ENHANCED: Form data states with late policy support
    const [gradingFormData, setGradingFormData] = useState({
        student: { name: '', id: '', email: '' },
        course: { code: '', name: '', instructor: '', semester: '', year: '' },
        assignment: { title: '', description: '', dueDate: '', totalPoints: 100, maxPoints: 100 },
        rubricGrading: {},
        feedback: { strengths: '', improvements: '', general: '' },
        attachments: [],
        videoLinks: [],
        metadata: { gradedBy: '', gradedDate: '', version: '1.0', notes: '' },
        // NEW: Late policy integration
        latePolicy: {
            level: 'none',
            penaltyApplied: false,
            policyId: null,
            originalScore: null,
            adjustedScore: null,
            multiplier: 1.0
        }
    });

    // ORIGINAL: AI Prompt form data update function
    const updateAIPromptFormData = useCallback((field, value) => {
        setAIPromptFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // ORIGINAL: Initialize AI prompt form data
    const initializeAIPromptFormData = useCallback((courseData) => {
        setAIPromptFormData({
            course: courseData || { code: '', name: '', instructor: '', semester: '', year: '' },
            assignment: { title: '', description: '', learningObjectives: [], skillsAssessed: [] },
            rubricType: 'analytical',
            criteria: [],
            customInstructions: ''
        });
    }, []);

    // ORIGINAL: Clear AI prompt form data
    const clearAIPromptFormData = useCallback(() => {
        setAIPromptFormData(null);
    }, []);

    // ORIGINAL: Assignment Prompt form data update function
    const updateAssignmentPromptFormData = useCallback((field, value) => {
        setAssignmentPromptFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // ORIGINAL: Initialize assignment prompt form data
    const initializeAssignmentPromptFormData = useCallback((courseData) => {
        setAssignmentPromptFormData({
            course: courseData || { code: '', name: '', instructor: '', semester: '', year: '' },
            assignmentType: 'project',
            learningObjectives: [],
            skillsToAssess: [],
            deliverables: [],
            timeline: { duration: '', milestones: [] },
            resources: [],
            customRequirements: ''
        });
    }, []);

    // ORIGINAL: Clear assignment prompt form data  
    const clearAssignmentPromptFormData = useCallback(() => {
        setAssignmentPromptFormData(null);
    }, []);

    // ORIGINAL: Update student information
    const updateStudentInfo = useCallback((field, value) => {
        setGradingFormData(prev => ({
            ...prev,
            student: { ...prev.student, [field]: value }
        }));
    }, []);

    // ORIGINAL: Update course information
    const updateCourseInfo = useCallback((field, value) => {
        setGradingFormData(prev => ({
            ...prev,
            course: { ...prev.course, [field]: value }
        }));
    }, []);

    // ORIGINAL: Update assignment information
    const updateAssignmentInfo = useCallback((field, value) => {
        setGradingFormData(prev => ({
            ...prev,
            assignment: { ...prev.assignment, [field]: value }
        }));
    }, []);

    // ORIGINAL: Update feedback information
    const updateFeedbackInfo = useCallback((field, value) => {
        setGradingFormData(prev => ({
            ...prev,
            feedback: { ...prev.feedback, [field]: value }
        }));
    }, []);

    // ORIGINAL: Update attachments
    const updateAttachments = useCallback((attachments) => {
        setGradingFormData(prev => ({ ...prev, attachments }));
    }, []);

    // ORIGINAL: Update video links
    const updateVideoLinks = useCallback((videoLinks) => {
        setGradingFormData(prev => ({ ...prev, videoLinks }));
    }, []);

    // ORIGINAL: Update rubric grading
    const updateRubricGrading = useCallback((criterionId, data) => {
        setGradingFormData(prev => ({
            ...prev,
            rubricGrading: { ...prev.rubricGrading, [criterionId]: data }
        }));
    }, []);

    // ORIGINAL: Update metadata
    const updateMetadata = useCallback((field, value) => {
        setGradingFormData(prev => ({
            ...prev,
            metadata: { ...prev.metadata, [field]: value }
        }));
    }, []);

    // NEW: Update late policy information
    const updateLatePolicyInfo = useCallback((field, value) => {
        setGradingFormData(prev => ({
            ...prev,
            latePolicy: { ...prev.latePolicy, [field]: value }
        }));
    }, []);

    // Apply a late policy to a given score and update grading data
    const applyLatePolicy = useCallback((policyId, level, originalScore) => {
        const policy = customLatePolicies.find(p => p.id === policyId) || currentLatePolicy;
        if (!policy || !policy.levels[level]) return originalScore;

        const multiplier = policy.levels[level].multiplier;
        const adjustedScore = originalScore * multiplier;

        setGradingFormData(prevData => ({
            ...prevData,
            latePolicy: {
                ...prevData.latePolicy,
                level,
                policyId,
                originalScore,
                adjustedScore,
                multiplier,
                penaltyApplied: level !== 'none'
            }
        }));

        return adjustedScore;
    }, [customLatePolicies, currentLatePolicy]);

    // ORIGINAL: Clear grading form data
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

    // ORIGINAL: Clear rubric form data
    const clearRubricFormData = useCallback(() => {
        setRubricFormData({
            course: { code: '', name: '', instructor: '', semester: '', year: '' },
            assignment: { title: '', description: '', dueDate: '', totalPoints: 100, passingThreshold: 70 },
            criteria: []
        });
    }, []);

    // ORIGINAL: Transfer rubric to grading
    const transferRubricToGrading = useCallback(() => {
        if (sharedRubric) {
            setGradingFormData(prev => ({
                ...prev,
                course: sharedRubric.courseInfo || prev.course,
                assignment: sharedRubric.assignmentInfo || prev.assignment
            }));
        }
    }, [sharedRubric]);

    // ORIGINAL: Transfer rubric to grading with details
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

    // ORIGINAL: Clear shared rubric
    const clearSharedRubric = useCallback(() => {
        setSharedRubric(null);
    }, []);

    // ENHANCED: Draft and Final Grade Management with Late Policy
    const saveDraft = useCallback((studentId, gradeData) => {
        const draftData = {
            ...gradeData,
            savedAt: new Date().toISOString(),
            isDraft: true,
            latePolicy: gradeData.latePolicy || gradingFormData.latePolicy
        };

        setDrafts(prev => ({ ...prev, [studentId]: draftData }));

        // Also save to localStorage for persistence
        const existingDrafts = JSON.parse(localStorage.getItem('gradingDrafts') || '{}');
        existingDrafts[studentId] = draftData;
        localStorage.setItem('gradingDrafts', JSON.stringify(existingDrafts));

        console.log('✅ Draft saved for student:', studentId);
    }, [gradingFormData.latePolicy]);

    const loadDraft = useCallback((studentId) => {
        let draft = drafts[studentId];

        // Try loading from localStorage if not in memory
        if (!draft) {
            const existingDrafts = JSON.parse(localStorage.getItem('gradingDrafts') || '{}');
            draft = existingDrafts[studentId];
            if (draft) {
                setDrafts(prev => ({ ...prev, [studentId]: draft }));
            }
        }

        if (draft) {
            setGradingFormData(draft);
            console.log('✅ Draft loaded for student:', studentId);
            return true;
        }
        return false;
    }, [drafts]);

    const saveFinalGrade = useCallback((studentId, gradeData) => {
        const finalData = {
            ...gradeData,
            finalizedAt: new Date().toISOString(),
            isDraft: false,
            latePolicy: gradeData.latePolicy || gradingFormData.latePolicy
        };

        setFinalGrades(prev => ({ ...prev, [studentId]: finalData }));

        // Remove from drafts since it's now final
        setDrafts(prev => {
            const newDrafts = { ...prev };
            delete newDrafts[studentId];
            return newDrafts;
        });

        // Update localStorage
        const existingFinal = JSON.parse(localStorage.getItem('finalGrades') || '{}');
        existingFinal[studentId] = finalData;
        localStorage.setItem('finalGrades', JSON.stringify(existingFinal));

        const existingDrafts = JSON.parse(localStorage.getItem('gradingDrafts') || '{}');
        delete existingDrafts[studentId];
        localStorage.setItem('gradingDrafts', JSON.stringify(existingDrafts));

        console.log('✅ Final grade saved for student:', studentId);
    }, [gradingFormData.latePolicy]);

    const loadFinalGrade = useCallback((studentId) => {
        let finalGrade = finalGrades[studentId];

        // Try loading from localStorage if not in memory
        if (!finalGrade) {
            const existingFinal = JSON.parse(localStorage.getItem('finalGrades') || '{}');
            finalGrade = existingFinal[studentId];
            if (finalGrade) {
                setFinalGrades(prev => ({ ...prev, [studentId]: finalGrade }));
            }
        }

        return finalGrade || null;
    }, [finalGrades]);

    const getGradeStatus = useCallback((studentId) => {
        if (finalGrades[studentId]) return 'final';
        if (drafts[studentId]) return 'draft';
        return 'not_started';
    }, [drafts, finalGrades]);

    const hasDraft = useCallback((studentId) => {
        return !!drafts[studentId] || !!(JSON.parse(localStorage.getItem('gradingDrafts') || '{}')[studentId]);
    }, [drafts]);

    const finalizeGrade = useCallback((studentId) => {
        const draft = drafts[studentId];
        if (draft) {
            saveFinalGrade(studentId, draft);
            return true;
        }
        return false;
    }, [drafts, saveFinalGrade]);

    const unlockGrade = useCallback((studentId) => {
        const finalGrade = finalGrades[studentId];
        if (finalGrade) {
            saveDraft(studentId, { ...finalGrade, isDraft: true });

            setFinalGrades(prev => {
                const newFinals = { ...prev };
                delete newFinals[studentId];
                return newFinals;
            });

            // Update localStorage
            const existingFinal = JSON.parse(localStorage.getItem('finalGrades') || '{}');
            delete existingFinal[studentId];
            localStorage.setItem('finalGrades', JSON.stringify(existingFinal));

            console.log('✅ Grade unlocked for editing:', studentId);
            return true;
        }
        return false;
    }, [finalGrades, saveDraft]);

    // NEW: Late Policy Management Functions
    const loadLatePoliciesFromStorage = useCallback(() => {
        try {
            const saved = localStorage.getItem('customLatePolicies');
            if (saved) {
                const policies = JSON.parse(saved);
                setCustomLatePolicies(policies);
            }

            const currentSaved = localStorage.getItem('currentLatePolicy');
            if (currentSaved) {
                const current = JSON.parse(currentSaved);
                setCurrentLatePolicy(current);
            }
        } catch (error) {
            console.error('Error loading late policies:', error);
        }
    }, []);

    const saveCustomLatePolicy = useCallback((policy) => {
        const newPolicy = {
            ...policy,
            id: policy.id || `custom_${Date.now()}`,
            isCustom: true,
            createdAt: new Date().toISOString()
        };

        setCustomLatePolicies(prev => {
            const updated = prev.filter(p => p.id !== newPolicy.id);
            updated.push(newPolicy);
            localStorage.setItem('customLatePolicies', JSON.stringify(updated));
            return updated;
        });

        return newPolicy;
    }, []);

    const updateCustomLatePolicy = useCallback((policyId, updates) => {
        setCustomLatePolicies(prev => {
            const updated = prev.map(p =>
                p.id === policyId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
            );
            localStorage.setItem('customLatePolicies', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const deleteCustomLatePolicy = useCallback((policyId) => {
        setCustomLatePolicies(prev => {
            const updated = prev.filter(p => p.id !== policyId);
            localStorage.setItem('customLatePolicies', JSON.stringify(updated));
            return updated;
        });

        // If deleted policy was current, reset to default
        if (currentLatePolicy?.id === policyId) {
            setCurrentLatePolicy(DEFAULT_LATE_POLICY);
            localStorage.setItem('currentLatePolicy', JSON.stringify(DEFAULT_LATE_POLICY));
        }
    }, [currentLatePolicy]);

    const calculateScoreWithLatePolicy = useCallback((rawScore, lateLevel) => {
        if (!currentLatePolicy || !lateLevel || lateLevel === 'none') {
            return {
                rawScore,
                finalScore: rawScore,
                penaltyApplied: false,
                multiplier: 1.0
            };
        }

        const level = currentLatePolicy.levels[lateLevel];
        if (!level) {
            return {
                rawScore,
                finalScore: rawScore,
                penaltyApplied: false,
                multiplier: 1.0
            };
        }

        const finalScore = Math.round(rawScore * level.multiplier * 100) / 100;

        return {
            rawScore,
            finalScore,
            penaltyApplied: level.multiplier < 1.0,
            multiplier: level.multiplier
        };
    }, [currentLatePolicy]);

    // ORIGINAL: Grading session management
    const initializeGradingSession = useCallback((classListData) => {
        if (!classListData || !classListData.students || classListData.students.length === 0) {
            console.error('Cannot initialize grading session: Invalid class list data');
            return false;
        }

        const newSession = {
            active: true,
            startTime: new Date().toISOString(),
            gradedStudents: [],
            totalStudents: classListData.students.length,
            currentStudent: classListData.students[0],
            currentStudentIndex: 0,
            classListData: classListData
        };

        setGradingSession(newSession);
        setCurrentStudent(classListData.students[0]);

        console.log('✅ Grading session initialized:', newSession);
        return true;
    }, []);

    const updateGradingSession = useCallback((updates) => {
        setGradingSession(prev => ({ ...prev, ...updates }));
    }, []);

    const nextStudentInSession = useCallback(() => {
        if (!gradingSession.active || !gradingSession.classListData) {
            console.warn('No active grading session');
            return false;
        }

        const nextIndex = gradingSession.currentStudentIndex + 1;
        if (nextIndex >= gradingSession.totalStudents) {
            console.log('✅ Reached end of class list');
            return false;
        }

        const nextStudent = gradingSession.classListData.students[nextIndex];

        setGradingSession(prev => ({
            ...prev,
            currentStudentIndex: nextIndex,
            currentStudent: nextStudent
        }));

        setCurrentStudent(nextStudent);

        console.log('✅ Moved to next student:', nextStudent.name);
        return true;
    }, [gradingSession]);

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

        console.log('✅ Moved to previous student:', prevStudent.name);
        return true;
    }, [gradingSession]);

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
            if (sessionData.rubric) setSharedRubric(sessionData.rubric);
            if (sessionData.courseDetails) setSharedCourseDetails(sessionData.courseDetails);
            if (sessionData.gradingData) setGradingFormData(sessionData.gradingData);
            if (sessionData.classList) setClassList(sessionData.classList);
            if (sessionData.currentStudent) setCurrentStudent(sessionData.currentStudent);
            if (sessionData.drafts) setDrafts(sessionData.drafts);
            if (sessionData.finalGrades) setFinalGrades(sessionData.finalGrades);

            // Import late policy data if available
            if (sessionData.customLatePolicies) setCustomLatePolicies(sessionData.customLatePolicies);
            if (sessionData.currentLatePolicy) setCurrentLatePolicy(sessionData.currentLatePolicy);

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
        importSession
    };

    return (
        <AssessmentContext.Provider value={value}>
            {children}
        </AssessmentContext.Provider>
    );
};

export default AssessmentProvider;
