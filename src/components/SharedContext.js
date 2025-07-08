import React, { createContext, useContext, useState } from 'react';

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

    // Shared course details state
    const [sharedCourseDetails, setSharedCourseDetails] = useState(null);

    // Grading data state
    const [gradingData, setGradingData] = useState(null);

    // Active tab state
    const [activeTab, setActiveTab] = useState('rubric-creator');

    // Transfer rubric to grading tool and switch tabs
    const transferRubricToGrading = (rubricData) => {
        setSharedRubric(rubricData);
        setActiveTab('grading-tool');
    };

    // Clear shared rubric
    const clearSharedRubric = () => {
        setSharedRubric(null);
    };

    // Clear shared course details
    const clearSharedCourseDetails = () => {
        setSharedCourseDetails(null);
    };

    // Clear all shared data
    const clearAllSharedData = () => {
        setSharedRubric(null);
        setSharedCourseDetails(null);
        setGradingData(null);
    };

    // Update course details
    const updateCourseDetails = (courseDetails) => {
        setSharedCourseDetails(prev => ({
            ...prev,
            ...courseDetails
        }));
    };

    // Update specific sections of course details
    const updateStudentInfo = (studentInfo) => {
        setSharedCourseDetails(prev => ({
            ...prev,
            student: {
                ...prev?.student,
                ...studentInfo
            }
        }));
    };

    const updateCourseInfo = (courseInfo) => {
        setSharedCourseDetails(prev => ({
            ...prev,
            course: {
                ...prev?.course,
                ...courseInfo
            }
        }));
    };

    const updateAssignmentInfo = (assignmentInfo) => {
        setSharedCourseDetails(prev => ({
            ...prev,
            assignment: {
                ...prev?.assignment,
                ...assignmentInfo
            }
        }));
    };

    // Extract course details from rubric if available
    const extractCourseDetailsFromRubric = (rubricData) => {
        if (rubricData?.assignmentInfo) {
            const courseDetails = {
                assignment: {
                    name: rubricData.assignmentInfo.title,
                    maxPoints: rubricData.assignmentInfo.totalPoints,
                    weight: rubricData.assignmentInfo.weight,
                    passingThreshold: rubricData.assignmentInfo.passingThreshold
                }
            };
            setSharedCourseDetails(courseDetails);
        }
    };

    // Enhanced transfer function that also extracts course details
    const transferRubricToGradingWithDetails = (rubricData) => {
        setSharedRubric(rubricData);
        extractCourseDetailsFromRubric(rubricData);
        setActiveTab('grading-tool');
    };

    const value = {
        // Shared state
        sharedRubric,
        setSharedRubric,
        sharedCourseDetails,
        setSharedCourseDetails,
        gradingData,
        setGradingData,

        // Navigation
        activeTab,
        setActiveTab,

        // Actions - rubric management
        transferRubricToGrading,
        transferRubricToGradingWithDetails,
        clearSharedRubric,

        // Actions - course details management
        clearSharedCourseDetails,
        updateCourseDetails,
        updateStudentInfo,
        updateCourseInfo,
        updateAssignmentInfo,
        extractCourseDetailsFromRubric,

        // Actions - general
        clearAllSharedData
    };

    return (
        <AssessmentContext.Provider value={value}>
            {children}
        </AssessmentContext.Provider>
    );
};