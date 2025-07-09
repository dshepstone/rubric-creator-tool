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