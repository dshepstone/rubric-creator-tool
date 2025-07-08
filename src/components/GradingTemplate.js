import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, FileText, Video, Plus, X, Save, FileDown } from 'lucide-react';
import { useAssessment } from './SharedContext';

// Built-in Course Modules
const courseModules = {
    "2d-animation": {
        courseType: "2D Animation",
        version: "1.0",
        gradingSettings: {
            maxPoints: 100,
            passingGrade: 70,
            fileTypes: ['.mp4', '.mov', '.gif', '.jpg', '.png'],
            submissionRequirements: ['Animation file', 'Process documentation'],
            supportedVideoLinks: ['SyncSketch', 'Panopto', 'YouTube', 'Vimeo']
        },
        rubric: [
            { criteria: 'Animation Principles', maxPoints: 30, score: 0, comments: '', description: 'Timing, spacing, squash & stretch, anticipation' },
            { criteria: 'Technical Execution', maxPoints: 25, score: 0, comments: '', description: 'Frame rate, resolution, file quality' },
            { criteria: 'Creativity & Storytelling', maxPoints: 25, score: 0, comments: '', description: 'Original concept, narrative clarity' },
            { criteria: 'Process & Documentation', maxPoints: 20, score: 0, comments: '', description: 'Planning sketches, workflow organization' }
        ],
        feedbackLibrary: {
            strengths: [
                'Excellent timing and spacing throughout the animation',
                'Strong understanding of squash and stretch principles',
                'Creative and engaging storytelling approach',
                'Professional frame-by-frame animation technique'
            ],
            improvements: [
                'Work on timing consistency in key sequences',
                'Add more anticipation before major actions',
                'Improve lip sync accuracy and mouth shapes',
                'Consider adding more secondary animation'
            ],
            general: [
                'This shows strong progress in animation fundamentals',
                'Consider studying reference footage for realistic motion',
                'Excellent creative problem-solving in animation challenges'
            ]
        }
    }
};

const GradingTemplate = () => {
    // Get shared context
    const {
        sharedRubric,
        sharedCourseDetails,
        clearSharedRubric,
        updateStudentInfo,
        updateCourseInfo,
        updateAssignmentInfo
    } = useAssessment();

    // Current active course module
    const [activeModule, setActiveModule] = useState("2d-animation");
    const [customModules, setCustomModules] = useState({});

    // All available modules (built-in + custom)
    const allModules = { ...courseModules, ...customModules };
    const currentModule = allModules[activeModule];

    // State for all grading data
    const [gradingData, setGradingData] = useState({
        student: {
            name: sharedCourseDetails?.student?.name || '',
            id: sharedCourseDetails?.student?.id || '',
            email: sharedCourseDetails?.student?.email || ''
        },
        course: {
            code: sharedCourseDetails?.course?.code || '',
            name: sharedCourseDetails?.course?.name || '',
            instructor: sharedCourseDetails?.course?.instructor || '',
            term: sharedCourseDetails?.course?.term || ''
        },
        assignment: {
            name: sharedCourseDetails?.assignment?.name || '',
            dueDate: sharedCourseDetails?.assignment?.dueDate || '',
            maxPoints: sharedCourseDetails?.assignment?.maxPoints || currentModule?.gradingSettings?.maxPoints || 100
        },
        rubric: currentModule?.rubric ? [...currentModule.rubric] : [],
        feedback: {
            general: '',
            strengths: '',
            improvements: ''
        },
        attachments: [],
        videoLinks: [],
        latePolicy: {
            level: 'none', // 'none', 'within24', 'after24'
            penaltyApplied: false
        },
        metadata: {
            moduleUsed: activeModule,
            moduleVersion: currentModule?.version || "1.0",
            gradedBy: '',
            gradedDate: '',
            aiAssisted: false,
            rubricIntegrated: !!sharedRubric
        }
    });

    // Rubric-specific state initialized from any shared rubric
    const initialRubricGrading = sharedRubric
        ? Object.fromEntries(
            sharedRubric.criteria.map(c => [
                c.id,
                { criterionId: c.id, selectedLevel: null, customComments: '' }
            ])
        )
        : {};
    const [loadedRubric, setLoadedRubric] = useState(sharedRubric);
    const [rubricGrading, setRubricGrading] = useState(initialRubricGrading);
    const [showRubricComments, setShowRubricComments] = useState({});

    const fileInputRef = useRef(null);
    const rubricInputRef = useRef(null);

    // Video link management
    const [videoLinkInput, setVideoLinkInput] = useState('');
    const [videoTitle, setVideoTitle] = useState('');

    // Late Policy Levels
    const latePolicyLevels = {
        none: {
            name: 'On Time',
            multiplier: 1.0,
            description: 'Assignment submitted on or before due date and time - marked out of 100%',
            color: '#16a34a'
        },
        within24: {
            name: '1-24 Hours Late',
            multiplier: 0.8,
            description: 'Assignment received within 24 hours of due date - 20% reduction (marked out of 80%)',
            color: '#ea580c'
        },
        after24: {
            name: 'More than 24 Hours Late',
            multiplier: 0.0,
            description: 'Assignment received after 24 hours from due date - mark of zero (0)',
            color: '#dc2626'
        }
    };

    // Sync with shared rubric when it changes
    useEffect(() => {
        if (sharedRubric) {
            setLoadedRubric(sharedRubric);

            const initialGrading = {};
            sharedRubric.criteria.forEach(c => {
                initialGrading[c.id] = { criterionId: c.id, selectedLevel: null, customComments: '' };
            });
            setRubricGrading(initialGrading);

            updateAssignmentInfo({
                name: sharedRubric.assignmentInfo?.title || '',
                maxPoints: sharedRubric.assignmentInfo?.totalPoints || 0
            });

            setGradingData(prev => ({
                ...prev,
                assignment: {
                    ...prev.assignment,
                    name: sharedRubric.assignmentInfo?.title || '',
                    maxPoints: sharedRubric.assignmentInfo?.totalPoints || prev.assignment.maxPoints
                },
                feedback: { general: '', strengths: '', improvements: '' },
                attachments: [],
                videoLinks: [],
                latePolicy: { level: 'none', penaltyApplied: false },
                metadata: { ...prev.metadata, rubricIntegrated: true }
            }));
        } else {
            setLoadedRubric(null);
            setRubricGrading({});
            setGradingData(prev => ({
                ...prev,
                metadata: { ...prev.metadata, rubricIntegrated: false }
            }));
        }
    }, [sharedRubric]);

    // Sync with shared course details
    useEffect(() => {
        if (sharedCourseDetails) {
            setGradingData(prev => ({
                ...prev,
                student: {
                    name: sharedCourseDetails.student?.name || prev.student.name,
                    id: sharedCourseDetails.student?.id || prev.student.id,
                    email: sharedCourseDetails.student?.email || prev.student.email
                },
                course: {
                    code: sharedCourseDetails.course?.code || prev.course.code,
                    name: sharedCourseDetails.course?.name || prev.course.name,
                    instructor: sharedCourseDetails.course?.instructor || prev.course.instructor,
                    term: sharedCourseDetails.course?.term || prev.course.term
                },
                assignment: {
                    ...prev.assignment,
                    name: sharedCourseDetails.assignment?.name || prev.assignment.name,
                    dueDate: sharedCourseDetails.assignment?.dueDate || prev.assignment.dueDate
                }
            }));
        }
    }, [sharedCourseDetails]);

    // Calculate total score with late policy applied
    const calculateTotalScore = () => {
        let rawScore = 0;

        if (loadedRubric) {
            // Calculate score from rubric grading
            rawScore = Object.values(rubricGrading).reduce((total, grading) => {
                const criterion = loadedRubric.criteria.find(c => c.id === grading.criterionId);
                if (criterion && grading.selectedLevel) {
                    const level = loadedRubric.rubricLevels.find(l => l.level === grading.selectedLevel);
                    return total + (criterion.maxPoints * level.multiplier);
                }
                return total;
            }, 0);
        } else {
            rawScore = gradingData.rubric.reduce((total, item) => total + item.score, 0);
        }

        // Apply late policy penalty
        const latePolicyLevel = latePolicyLevels[gradingData.latePolicy.level];
        const finalScore = rawScore * latePolicyLevel.multiplier;

        return {
            rawScore: rawScore,
            finalScore: finalScore,
            penaltyApplied: gradingData.latePolicy.level !== 'none',
            latePolicyDescription: latePolicyLevel.description
        };
    };

    // Update late policy
    const updateLatePolicy = (level) => {
        setGradingData(prev => ({
            ...prev,
            latePolicy: {
                level: level,
                penaltyApplied: level !== 'none'
            }
        }));
    };

    // Load rubric file (for external rubrics)
    const loadRubric = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const rubricData = JSON.parse(e.target.result);

                    if (!rubricData.criteria || !rubricData.rubricLevels) {
                        alert('Invalid rubric format. Please check the rubric structure.');
                        return;
                    }

                    setLoadedRubric(rubricData);

                    // Initialize rubric grading state
                    const initialGrading = {};
                    rubricData.criteria.forEach(criterion => {
                        initialGrading[criterion.id] = {
                            criterionId: criterion.id,
                            selectedLevel: null,
                            customComments: ''
                        };
                    });
                    setRubricGrading(initialGrading);

                    // Update assignment details if provided
                    if (rubricData.assignmentInfo) {
                        setGradingData(prev => ({
                            ...prev,
                            assignment: {
                                ...prev.assignment,
                                name: rubricData.assignmentInfo.title || prev.assignment.name,
                                maxPoints: rubricData.assignmentInfo.totalPoints || prev.assignment.maxPoints
                            },
                            metadata: {
                                ...prev.metadata,
                                rubricIntegrated: false // This is an external rubric
                            }
                        }));
                    }

                } catch (error) {
                    alert('Error loading rubric. Please check the JSON format.');
                }
            };
            reader.readAsText(file);
        }
    };

    // Clear loaded rubric and reset state
    const clearRubric = () => {
        clearSharedRubric();
        setLoadedRubric(null);
        setRubricGrading({});
        setGradingData(prev => ({
            ...prev,
            feedback: { general: '', strengths: '', improvements: '' },
            attachments: [],
            videoLinks: [],
            latePolicy: { level: 'none', penaltyApplied: false },
            metadata: { ...prev.metadata, rubricIntegrated: false }
        }));
    };

    // Update rubric grading
    const updateRubricGrading = (criterionId, level, comments = null) => {
        setRubricGrading(prev => {
            const existingGrading = prev[criterionId];
            const existingComments = existingGrading?.customComments || '';

            return {
                ...prev,
                [criterionId]: {
                    criterionId,
                    selectedLevel: level,
                    customComments: comments !== null ? comments : existingComments
                }
            };
        });
    };

    // Handle file uploads
    const handleFileUpload = (files) => {
        const newAttachments = Array.from(files).map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
        }));

        Promise.all(newAttachments.map(attachment => {
            return new Promise((resolve) => {
                if (attachment.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        attachment.base64Data = e.target.result;
                        resolve(attachment);
                    };
                    reader.readAsDataURL(attachment.file);
                } else {
                    resolve(attachment);
                }
            });
        })).then(processedAttachments => {
            setGradingData(prev => ({
                ...prev,
                attachments: [...prev.attachments, ...processedAttachments]
            }));
        });
    };

    // Remove attachment
    const removeAttachment = (id) => {
        setGradingData(prev => ({
            ...prev,
            attachments: prev.attachments.filter(att => att.id !== id)
        }));
    };

    // Add video link
    const addVideoLink = () => {
        if (videoLinkInput.trim()) {
            setGradingData(prev => ({
                ...prev,
                videoLinks: [...prev.videoLinks, {
                    id: Date.now(),
                    url: videoLinkInput.trim(),
                    title: videoTitle.trim() || 'Video Link'
                }]
            }));
            setVideoLinkInput('');
            setVideoTitle('');
        }
    };

    // Remove video link
    const removeVideoLink = (id) => {
        setGradingData(prev => ({
            ...prev,
            videoLinks: prev.videoLinks.filter(link => link.id !== id)
        }));
    };

    // Export to HTML for D2L
    const exportToHTML = () => {
        const scoreCalculation = calculateTotalScore();
        const totalScore = scoreCalculation.finalScore;
        const rawScore = scoreCalculation.rawScore;
        const maxPoints = loadedRubric ? loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints;
        const percentage = ((totalScore / maxPoints) * 100).toFixed(1);
        const penaltyApplied = scoreCalculation.penaltyApplied;

        // Generate rubric table HTML if rubric is loaded
        const rubricTableHTML = loadedRubric ? `
    <div class="rubric-section" style="margin-top: 30px;">
        <h3>📋 Detailed Rubric Assessment</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <strong>Assignment:</strong> ${loadedRubric.assignmentInfo.title}<br>
            <strong>Weight:</strong> ${loadedRubric.assignmentInfo.weight}% of Final Grade<br>
            <strong>Passing Threshold:</strong> ${loadedRubric.assignmentInfo.passingThreshold}%  
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 0.9rem;">
            <thead>
                <tr style="background: #2c3e50; color: white;">
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Criterion</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Max Points</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Level Achieved</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Points Earned</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Comments</th>
                </tr>
            </thead>
            <tbody>
                ${loadedRubric.criteria.map(criterion => {
            const grading = rubricGrading[criterion.id];
            const level = grading?.selectedLevel ? loadedRubric.rubricLevels.find(l => l.level === grading.selectedLevel) : null;
            const points = level ? (criterion.maxPoints * level.multiplier).toFixed(1) : '0';
            return `
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">
                                <strong>${criterion.name}</strong><br>
                                <small style="color: #666;">${criterion.description}</small>
                            </td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${criterion.maxPoints}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${level ? level.name : 'Not Assessed'}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">${points}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${grading?.customComments || 'No additional comments'}</td>
                        </tr>
                    `;
        }).join('')}
            </tbody>
        </table>
    </div>
        ` : '';

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grade Report - ${gradingData.student.name}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; line-height: 1.6; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .score-summary { background: #e8f5e8; border: 2px solid #4caf50; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .late-policy-section { margin: 30px 0; background: #fff5f5; border: 1px solid #f87171; border-radius: 8px; padding: 20px; }
        .feedback-section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
        .attachments { margin: 20px 0; }
        .attachment-item { display: inline-block; background: #e3f2fd; padding: 8px 12px; margin: 4px; border-radius: 4px; }
        .image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
        .image-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .image-info { padding: 10px; background: #f8f9fa; }
        .image-name { font-weight: bold; margin: 0; }
        .image-size { margin: 5px 0 0 0; color: #666; font-size: 0.8rem; }
        h1, h2, h3 { color: #333; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 Grade Report</h1>
        <p><strong>Student:</strong> ${gradingData.student.name} (${gradingData.student.id})</p>
        <p><strong>Course:</strong> ${gradingData.course.code} - ${gradingData.course.name}</p>
        <p><strong>Assignment:</strong> ${gradingData.assignment.name}</p>
        <p><strong>Instructor:</strong> ${gradingData.course.instructor}</p>
        <p><strong>Term:</strong> ${gradingData.course.term}</p>
    </div>

    <div class="score-summary">
        <h2>📊 Final Score</h2>
        <div style="font-size: 2rem; font-weight: bold; color: #2e7d32; margin: 15px 0;">
            ${totalScore.toFixed(1)} / ${maxPoints} (${percentage}%)
        </div>
        <p style="margin: 10px 0; color: #555;">
            ${loadedRubric ? `Rubric: ${loadedRubric.assignmentInfo.title}` : `Module: ${currentModule?.courseType} v${currentModule?.version || '1.0'}`}
            ${penaltyApplied ? ` | Late Policy: ${latePolicyLevels[gradingData.latePolicy.level].name}` : ''}
        </p>
    </div>

    ${penaltyApplied ? `
    <div class="late-policy-section">
        <h3 style="color: #dc2626; border-bottom: 1px solid #f87171; padding-bottom: 5px;">📅 Late Submission Policy Applied</h3>
        <div style="margin-top: 15px;">
            <h4 style="color: #991b1b; margin-bottom: 10px;">Policy Status: ${latePolicyLevels[gradingData.latePolicy.level].name}</h4>
            <p style="margin-bottom: 15px; color: #7f1d1d;">${latePolicyLevels[gradingData.latePolicy.level].description}</p>
            
            <div style="background: white; border: 1px solid #fecaca; border-radius: 6px; padding: 15px;">
                <h5 style="margin: 0 0 10px 0; color: #991b1b;">Institutional Late Assignment Policy:</h5>
                <ul style="margin: 0; padding-left: 20px; color: #7f1d1d; font-size: 0.9rem;">
                    <li style="margin-bottom: 5px;"><strong>On Time:</strong> Assignments submitted on or before due date and time are marked out of 100%</li>
                    <li style="margin-bottom: 5px;"><strong>1-24 Hours Late:</strong> Assignments receive a 20% reduction and are marked out of 80%</li>
                    <li style="margin-bottom: 5px;"><strong>After 24 Hours:</strong> Assignments receive a mark of zero (0)</li>
                </ul>
            </div>
        </div>
    </div>
    ` : ''}

    ${rubricTableHTML}
    
    ${Object.entries(gradingData.feedback).filter(([key, value]) => value).map(([key, value]) => `
        <div class="feedback-section">
            <h3>${key.charAt(0).toUpperCase() + key.slice(1)} Feedback</h3>
            <p>${value.replace(/\n/g, '<br>')}</p>
        </div>
    `).join('')}
    
    ${gradingData.attachments.length > 0 ? `
    <div class="attachments">
        <h3>File Attachments</h3>
        ${gradingData.attachments.filter(att => !att.type.startsWith('image/')).map(att => `<span class="attachment-item">${att.name}</span>`).join('')}
        
        ${gradingData.attachments.filter(att => att.type.startsWith('image/')).length > 0 ? `
        <div style="margin-top: 20px;">
            <h4>📸 Images (${gradingData.attachments.filter(att => att.type.startsWith('image/')).length})</h4>
            <div class="image-grid">
                ${gradingData.attachments
                        .filter(att => att.type.startsWith('image/'))
                        .map(att => `
                    <div class="image-card">
                        <div style="background: #f9f9f9; display: flex; align-items: center; justify-content: center; min-height: 150px;">
                            <img src="${att.base64Data || att.url}" alt="${att.name}" style="max-width: 100%; max-height: 150px; object-fit: contain;">
                        </div>
                        <div class="image-info">
                            <p class="image-name">${att.name}</p>
                            <p class="image-size">${(att.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    </div>
    ` : ''}

    <p style="margin-top: 40px; text-align: center; color: #666; font-size: 0.9rem;">
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
    </p>
</body>
</html>`;

        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(htmlBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `grade_report_${gradingData.student.name || 'student'}_${gradingData.assignment.name || 'assignment'}.html`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Save grading data to JSON
    const saveToJSON = () => {
        const dataToSave = {
            ...gradingData,
            rubricData: loadedRubric ? {
                rubricInfo: loadedRubric,
                rubricGrading: rubricGrading
            } : null,
            timestamp: new Date().toISOString()
        };

        const jsonBlob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(jsonBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `grading_data_${gradingData.student.name || 'student'}_${gradingData.assignment.name || 'assignment'}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Load grading data from JSON
    const loadFromJSON = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const loadedData = JSON.parse(e.target.result);
                    setGradingData(loadedData);

                    // Handle rubric data if present
                    if (loadedData.rubricData) {
                        setLoadedRubric(loadedData.rubricData.rubricInfo);
                        setRubricGrading(loadedData.rubricData.rubricGrading || {});
                    }

                    if (loadedData.metadata?.moduleUsed && allModules[loadedData.metadata.moduleUsed]) {
                        setActiveModule(loadedData.metadata.moduleUsed);
                    }
                } catch (error) {
                    alert('Error loading file. Please check the JSON format.');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">📋 Grading Template</h1>
                            <p className="text-gray-600">Streamlined grading with late policy enforcement</p>
                            {sharedRubric && (
                                <p className="text-green-600 font-medium mt-1">
                                    ✓ Using shared rubric: {sharedRubric.assignmentInfo?.title}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={saveToJSON}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Save size={20} />
                                Save Progress
                            </button>
                            <button
                                onClick={exportToHTML}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <FileDown size={20} />
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* Course Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <input
                                    type="text"
                                    placeholder="Course Code (e.g., ART101)"
                                    value={gradingData.course.code}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        setGradingData(prev => ({
                                            ...prev,
                                            course: { ...prev.course, code: newValue }
                                        }));
                                        updateCourseInfo({ code: newValue });
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="text"
                                    placeholder="Course Name"
                                    value={gradingData.course.name}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        setGradingData(prev => ({
                                            ...prev,
                                            course: { ...prev.course, name: newValue }
                                        }));
                                        updateCourseInfo({ name: newValue });
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="text"
                                    placeholder="Instructor Name"
                                    value={gradingData.course.instructor}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        setGradingData(prev => ({
                                            ...prev,
                                            course: { ...prev.course, instructor: newValue }
                                        }));
                                        updateCourseInfo({ instructor: newValue });
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="text"
                                    placeholder="Term (e.g., Fall 2024)"
                                    value={gradingData.course.term}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        setGradingData(prev => ({
                                            ...prev,
                                            course: { ...prev.course, term: newValue }
                                        }));
                                        updateCourseInfo({ term: newValue });
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Student Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="Student Name"
                                    value={gradingData.student.name}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        setGradingData(prev => ({
                                            ...prev,
                                            student: { ...prev.student, name: newValue }
                                        }));
                                        updateStudentInfo({ name: newValue });
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="text"
                                    placeholder="Student ID"
                                    value={gradingData.student.id}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        setGradingData(prev => ({
                                            ...prev,
                                            student: { ...prev.student, id: newValue }
                                        }));
                                        updateStudentInfo({ id: newValue });
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="email"
                                    placeholder="Student Email"
                                    value={gradingData.student.email}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        setGradingData(prev => ({
                                            ...prev,
                                            student: { ...prev.student, email: newValue }
                                        }));
                                        updateStudentInfo({ email: newValue });
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-6">Assignment Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="Assignment Name"
                                    value={gradingData.assignment.name}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        setGradingData(prev => ({
                                            ...prev,
                                            assignment: { ...prev.assignment, name: newValue }
                                        }));
                                        updateAssignmentInfo({ name: newValue });
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="date"
                                    placeholder="Due Date"
                                    value={gradingData.assignment.dueDate}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        setGradingData(prev => ({
                                            ...prev,
                                            assignment: { ...prev.assignment, dueDate: newValue }
                                        }));
                                        updateAssignmentInfo({ dueDate: newValue });
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    placeholder="Max Points"
                                    value={gradingData.assignment.maxPoints}
                                    onChange={(e) => {
                                        const newValue = parseInt(e.target.value) || 0;
                                        setGradingData(prev => ({
                                            ...prev,
                                            assignment: { ...prev.assignment, maxPoints: newValue }
                                        }));
                                        updateAssignmentInfo({ maxPoints: newValue });
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Shared Rubric Section */}
                        {loadedRubric && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 rounded-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-green-800 mb-2">📋 Active Assignment Rubric</h3>
                                        <p className="text-green-700 font-semibold">{loadedRubric.assignmentInfo.title}</p>
                                        <p className="text-sm text-green-600">{loadedRubric.assignmentInfo.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-green-600">
                                            <p><strong>Weight:</strong> {loadedRubric.assignmentInfo.weight}% of Final Grade</p>
                                            <p><strong>Passing:</strong> {loadedRubric.assignmentInfo.passingThreshold}%</p>
                                            <p><strong>Total Points:</strong> {loadedRubric.assignmentInfo.totalPoints}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Rubric Grading Interface */}
                                <div className="space-y-6">
                                    {loadedRubric.criteria.map((criterion) => {
                                        const currentGrading = rubricGrading[criterion.id];
                                        const showComments = showRubricComments[criterion.id];

                                        return (
                                            <div key={criterion.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-semibold text-gray-800">
                                                            {criterion.name}
                                                            <span className="text-blue-600 ml-2">({criterion.maxPoints} pts)</span>
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
                                                    </div>
                                                </div>

                                                {/* Level Selection */}
                                                <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-4">
                                                    {loadedRubric.rubricLevels.map((level) => {
                                                        const isSelected = currentGrading?.selectedLevel === level.level;
                                                        const points = Math.round(criterion.maxPoints * level.multiplier);

                                                        return (
                                                            <button
                                                                key={level.level}
                                                                onClick={() => updateRubricGrading(criterion.id, level.level)}
                                                                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${isSelected
                                                                    ? 'border-current text-white transform scale-105 shadow-md'
                                                                    : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                                                                    }`}
                                                                style={{
                                                                    backgroundColor: isSelected ? level.color : 'white',
                                                                    borderColor: isSelected ? level.color : undefined,
                                                                }}
                                                            >
                                                                <div className="font-semibold">{level.name}</div>
                                                                <div className="text-xs mt-1">
                                                                    {level.level === 'incomplete' ? '0' : points} pts
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Custom Comments */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Additional Comments:
                                                    </label>
                                                    <textarea
                                                        value={currentGrading?.customComments || ''}
                                                        onChange={(e) => updateRubricGrading(criterion.id, currentGrading?.selectedLevel, e.target.value)}
                                                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        rows="3"
                                                        placeholder="Add specific feedback for this criterion..."
                                                    />
                                                </div>

                                                {/* Selected Level Feedback */}
                                                {currentGrading?.selectedLevel && (
                                                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                                        <div className="text-sm">
                                                            <strong>Selected Level:</strong> {loadedRubric.rubricLevels.find(l => l.level === currentGrading.selectedLevel)?.name}
                                                            {' '}({criterion.levels[currentGrading.selectedLevel]?.pointRange} pts)
                                                        </div>
                                                        <div className="text-sm text-gray-700 mt-1">
                                                            {criterion.levels[currentGrading.selectedLevel]?.description}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Rubric Summary */}
                                <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800">Rubric Score Summary</h4>
                                            <p className="text-sm text-gray-600">
                                                Based on selected levels across all criteria
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {Math.round(calculateTotalScore().finalScore * 10) / 10}/{loadedRubric.assignmentInfo.totalPoints}
                                            </div>
                                            <div className="text-lg text-gray-600">
                                                ({Math.round((calculateTotalScore().finalScore / loadedRubric.assignmentInfo.totalPoints) * 1000) / 10}%)
                                            </div>
                                            {calculateTotalScore().penaltyApplied && (
                                                <div className="text-sm text-red-600 mt-1">
                                                    Raw: {Math.round(calculateTotalScore().rawScore * 10) / 10} (Late Penalty Applied)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Late Policy Section */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="late-policy-container">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Late Submission Policy</h3>
                                <div className="late-policy-info-box">
                                    <p className="font-medium mb-2 text-gray-800">Institutional Late Assignment Policy:</p>
                                    <ul className="space-y-1 text-sm text-gray-700">
                                        <li>• <strong>On Time:</strong> Assignments submitted on or before due date and time are marked out of 100%</li>
                                        <li>• <strong>1-24 Hours Late:</strong> Assignments receive a 20% reduction and are marked out of 80%</li>
                                        <li>• <strong>After 24 Hours:</strong> Assignments receive a mark of zero (0)</li>
                                    </ul>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-800 mb-3">Select submission status:</h4>

                                    {Object.entries(latePolicyLevels).map(([level, policy]) => (
                                        <div
                                            key={level}
                                            className={`late-policy-card ${level} ${gradingData.latePolicy.level === level ? 'selected' : ''}`}
                                            onClick={() => updateLatePolicy(level)}
                                        >
                                            <div className="late-policy-header">
                                                <input
                                                    type="checkbox"
                                                    checked={gradingData.latePolicy.level === level}
                                                    onChange={() => updateLatePolicy(level)}
                                                    className="late-policy-checkbox"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <span
                                                    className="late-policy-icon"
                                                    style={{ backgroundColor: policy.color }}
                                                ></span>
                                                <h5 className="late-policy-title" style={{ color: policy.color }}>
                                                    {policy.name}
                                                </h5>
                                                {level !== 'none' && (
                                                    <span className="late-policy-multiplier">
                                                        (×{policy.multiplier === 0 ? '0' : policy.multiplier})
                                                    </span>
                                                )}
                                            </div>
                                            <p className="late-policy-description">{policy.description}</p>
                                        </div>
                                    ))}
                                </div>

                                {calculateTotalScore().penaltyApplied && (
                                    <div className="late-policy-calculation">
                                        <h5 className="font-medium text-red-800 mb-2">⚠️ Late Penalty Calculation</h5>
                                        <div className="text-sm text-red-700 space-y-1">
                                            <p><strong>Raw Score:</strong> {Math.round(calculateTotalScore().rawScore * 10) / 10} / {loadedRubric ? loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints}</p>
                                            <p><strong>Late Penalty:</strong> ×{latePolicyLevels[gradingData.latePolicy.level].multiplier}</p>
                                            <p><strong>Final Score:</strong> {Math.round(calculateTotalScore().finalScore * 10) / 10} / {loadedRubric ? loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Score Summary */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Final Score</h2>
                                <div className="text-6xl font-bold text-green-600 mb-4">
                                    {Math.round(calculateTotalScore().finalScore * 10) / 10}
                                    <span className="text-2xl text-gray-500">
                                        / {loadedRubric ? loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints}
                                    </span>
                                </div>
                                <div className="text-xl text-gray-600 mb-4">
                                    ({Math.round((calculateTotalScore().finalScore / (loadedRubric ? loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints)) * 1000) / 10}%)
                                </div>
                                <div className="flex justify-center gap-4 flex-wrap">
                                    {loadedRubric && (
                                        <div className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded">
                                            📋 Rubric Assessment Active
                                        </div>
                                    )}
                                    {calculateTotalScore().penaltyApplied && (
                                        <div className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded">
                                            ⏰ Late Penalty Applied
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Feedback Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">💬 Feedback</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">General Feedback</label>
                                    <textarea
                                        value={gradingData.feedback.general}
                                        onChange={(e) => setGradingData(prev => ({
                                            ...prev,
                                            feedback: { ...prev.feedback, general: e.target.value }
                                        }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="4"
                                        placeholder="Enter general feedback for the student..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Strengths</label>
                                    <textarea
                                        value={gradingData.feedback.strengths}
                                        onChange={(e) => setGradingData(prev => ({
                                            ...prev,
                                            feedback: { ...prev.feedback, strengths: e.target.value }
                                        }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="3"
                                        placeholder="What did the student do well?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Areas for Improvement</label>
                                    <textarea
                                        value={gradingData.feedback.improvements}
                                        onChange={(e) => setGradingData(prev => ({
                                            ...prev,
                                            feedback: { ...prev.feedback, improvements: e.target.value }
                                        }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="3"
                                        placeholder="What areas need improvement?"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* File Attachments */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">📎 Attachments</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                                >
                                    <Upload size={20} />
                                    Upload Files
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={(e) => handleFileUpload(e.target.files)}
                                    className="hidden"
                                />

                                {gradingData.attachments.length > 0 && (
                                    <div className="space-y-2">
                                        {gradingData.attachments.map((attachment) => (
                                            <div key={attachment.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                                <FileText size={16} className="text-gray-500" />
                                                <span className="flex-1 text-sm">{attachment.name}</span>
                                                <button
                                                    onClick={() => removeAttachment(attachment.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Video Links */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎥 Video Links</h3>
                            <div className="space-y-3">
                                <input
                                    type="url"
                                    value={videoLinkInput}
                                    onChange={(e) => setVideoLinkInput(e.target.value)}
                                    placeholder="Video URL"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="text"
                                    value={videoTitle}
                                    onChange={(e) => setVideoTitle(e.target.value)}
                                    placeholder="Video Title (optional)"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    onClick={addVideoLink}
                                    disabled={!videoLinkInput.trim()}
                                    className="w-full flex items-center justify-center gap-2 bg-purple-50 text-purple-700 p-3 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors disabled:opacity-50"
                                >
                                    <Plus size={20} />
                                    Add Video
                                </button>

                                {gradingData.videoLinks.length > 0 && (
                                    <div className="space-y-2">
                                        {gradingData.videoLinks.map((link) => (
                                            <div key={link.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                                <Video size={16} className="text-gray-500" />
                                                <span className="flex-1 text-sm">{link.title}</span>
                                                <button
                                                    onClick={() => removeVideoLink(link.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Quick Actions</h3>
                            <div className="space-y-3">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={loadFromJSON}
                                    ref={rubricInputRef}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => rubricInputRef.current?.click()}
                                    className="w-full flex items-center justify-center gap-2 bg-purple-50 text-purple-700 p-3 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                                >
                                    <Upload size={20} />
                                    Load Saved Data
                                </button>
                                {loadedRubric && (
                                    <button
                                        onClick={clearRubric}
                                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                                    >
                                        <X size={20} />
                                        Clear Rubric
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradingTemplate;