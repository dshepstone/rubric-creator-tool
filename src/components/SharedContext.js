// Updated SharedContext.js with Enhanced Draft/Final Grade Management + AI Prompt Generator + Assignment Prompt Generator
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
    const [activeTab, setActiveTab] = useState('assignment-prompt-generator'); // Updated to start with assignment prompt generator

    // AI Prompt Generator state (for rubrics)
    const [aiPromptFormData, setAIPromptFormData] = useState(null);

    // NEW: Assignment Prompt Generator state
    const [assignmentPromptFormData, setAssignmentPromptFormData] = useState(null);

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

    // AI Prompt Generator functions (for rubrics)
    const initializeAIPromptFormData = useCallback(() => {
        setAIPromptFormData({
            assignmentType: '',
            programType: '',
            programLevel: '',
            subjectArea: '',
            assignmentDescription: '',
            totalPoints: '100',
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
        setAIPromptFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const clearAIPromptFormData = useCallback(() => {
        setAIPromptFormData(null);
    }, []);

    // NEW: Assignment Prompt Generator functions
    const initializeAssignmentPromptFormData = useCallback(() => {
        setAssignmentPromptFormData({
            assignmentTitle: '',
            assignmentNumber: '',
            weightPercentage: '',
            courseCode: '',
            programLevel: '',
            subjectArea: '',
            assignmentDescription: '',
            rationale: 'This assignment will evaluate the following Course Learning Outcomes:',
            clos: [
                { id: 1, number: '1', text: '', type: 'CLO' },
                { id: 2, number: '2', text: '', type: 'CLO' },
                { id: 3, number: '3', text: '', type: 'CLO' },
                { id: 4, number: '4', text: '', type: 'CLO' }
            ],
            directions: '',
            gradingMethod: 'rubric',
            gradingDetails: '',
            dueDate: '',
            submissionFolder: 'Assignment X',
            specialInstructions: ''
        });
    }, []);

    const updateAssignmentPromptFormData = useCallback((field, value) => {
        setAssignmentPromptFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const clearAssignmentPromptFormData = useCallback(() => {
        setAssignmentPromptFormData(null);
    }, []);

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

    const hasDraft = useCallback((studentId) => {
        return drafts[studentId] !== undefined;
    }, [drafts]);

    const loadDraft = useCallback((studentId) => {
        const draft = drafts[studentId];
        if (draft) {
            console.log('📝 Draft loaded for student:', studentId);
            return draft;
        }
        console.log('⚠️ No draft found for student:', studentId);
        return null;
    }, [drafts]);

    const saveFinalGrade = useCallback((studentId, data) => {
        console.log('✅ Saving final grade for student:', studentId);
        setFinalGrades(prev => ({ ...prev, [studentId]: data }));

        // Remove from drafts once finalized
        setDrafts(prev => {
            const updated = { ...prev };
            delete updated[studentId];
            return updated;
        });

        // Update class list progress
        if (classList) {
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
    }, [classList, setDrafts, setClassList]);

    const loadFinalGrade = useCallback((studentId) => {
        return finalGrades[studentId] || null;
    }, [finalGrades]);

    const getGradeStatus = useCallback((studentId) => {
        if (finalGrades[studentId]) return 'final';
        if (drafts[studentId]) return 'draft';
        return 'not_started';
    }, [finalGrades, drafts]);

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

    // **FIX APPLIED HERE: Replaced the old function with the new, corrected version.**
    const initializeGradingSession = useCallback((classListData) => {
        // 1. Guard against missing or empty class list
        if (!classListData || !classListData.students?.length) {
            return false;
        }

        // 2. Extract the students array and the imported course metadata
        const { students, courseMetadata } = classListData;

        // 3. Pick the first student to start the session
        const firstStudent = students[0];

        // 4. Build and set the grading session state
        const session = {
            active: true,
            startTime: new Date().toISOString(),
            gradedStudents: [],
            totalStudents: students.length,
            currentStudent: firstStudent,
            currentStudentIndex: 0
        };
        setGradingSession(session);
        setCurrentStudent(firstStudent);

        // 5. Prefill the grading form: student + course details
        setGradingFormData(prev => ({
            ...prev,
            student: {
                name: firstStudent.name,
                id: firstStudent.id,
                email: firstStudent.email
            },
            course: {
                code: courseMetadata?.courseCode ?? prev.course.code,
                name: courseMetadata?.courseName ?? prev.course.name,
                instructor: courseMetadata?.instructor ?? prev.course.instructor,
                term: courseMetadata?.term ?? prev.course.term,
            },
            assignment: sharedCourseDetails?.assignment ?? prev.assignment
        }));

        console.log(
            `🚀 Grading session started for ${students.length} students`
        );
        return true;

    }, [sharedCourseDetails]);

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

    // UPDATED: Export Session Function with AI Prompt Data and Assignment Prompt Data
    const exportSession = useCallback(() => {
        const sessionData = {
            sharedRubric,
            classList,
            drafts,
            finalGrades,
            activeTab,
            currentStudent,
            gradingSession,
            sharedCourseDetails,
            aiPromptFormData, // AI Rubric prompt data
            assignmentPromptFormData, // NEW: Assignment prompt data
        };
        const dataStr = JSON.stringify(sessionData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
        link.download = `grading-session-${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [sharedRubric, classList, drafts, finalGrades, activeTab, currentStudent, gradingSession, sharedCourseDetails, aiPromptFormData, assignmentPromptFormData]);

    // UPDATED: Import Session Function with AI Prompt Data and Assignment Prompt Data
    const importSession = useCallback((jsonContent) => {
        try {
            const sessionData = JSON.parse(jsonContent);
            if (sessionData && typeof sessionData === 'object') {
                setSharedRubric(sessionData.sharedRubric || null);
                setClassList(sessionData.classList || null);
                setDrafts(sessionData.drafts || {});
                setFinalGrades(sessionData.finalGrades || {});
                setActiveTab(sessionData.activeTab || 'assignment-prompt-generator');
                setCurrentStudent(sessionData.currentStudent || null);
                setGradingSession(sessionData.gradingSession || { active: false });
                setSharedCourseDetails(sessionData.sharedCourseDetails || null);
                setAIPromptFormData(sessionData.aiPromptFormData || null); // AI Rubric prompt data
                setAssignmentPromptFormData(sessionData.assignmentPromptFormData || null); // NEW: Assignment prompt data
                alert('Session loaded successfully!');
            } else {
                throw new Error('Invalid file format.');
            }
        } catch (error) {
            console.error("Failed to import session:", error);
            alert("Error: Could not load the session file. Please ensure it's a valid session file.");
        }
    }, []);

    // Finalize a draft grade
    const finalizeGrade = useCallback((studentId) => {
        const draftData = drafts[studentId];
        if (draftData) {
            saveFinalGrade(studentId, draftData);
            console.log('🎯 Finalized draft for student:', studentId);
        }
    }, [drafts, saveFinalGrade]);

    // Unlock a final grade (convert back to draft)
    const unlockGrade = useCallback((studentId) => {
        const finalData = finalGrades[studentId];
        if (finalData) {
            // Move from final back to draft
            setDrafts(prev => ({ ...prev, [studentId]: finalData }));
            setFinalGrades(prev => {
                const updated = { ...prev };
                delete updated[studentId];
                return updated;
            });

            // Update class list progress
            if (classList) {
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
            }

            console.log('🔓 Unlocked final grade for student:', studentId);
        }
    }, [finalGrades, setDrafts, setFinalGrades, classList, setClassList]);

    const clearAllData = useCallback(() => {
        setSharedRubric(null);
        clearGradingFormData();
        clearRubricFormData();
        clearAIPromptFormData(); // Clear AI Rubric prompt data
        clearAssignmentPromptFormData(); // NEW: Clear assignment prompt data
    }, [clearGradingFormData, clearRubricFormData, clearAIPromptFormData, clearAssignmentPromptFormData]);

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

        // AI Prompt Generator (for rubrics)
        aiPromptFormData,
        updateAIPromptFormData,
        initializeAIPromptFormData,
        clearAIPromptFormData,

        // NEW: Assignment Prompt Generator
        assignmentPromptFormData,
        updateAssignmentPromptFormData,
        initializeAssignmentPromptFormData,
        clearAssignmentPromptFormData,

        // Grading form data
        gradingData: gradingFormData,
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

        // Draft and Final Grade Management - ENHANCED
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

        // Utility functions
        transferRubricToGrading,
        transferRubricToGradingWithDetails,
        clearSharedRubric,
        clearGradingFormData,
        clearRubricFormData,
        clearAllData,

        // Session management
        exportSession,
        importSession,

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