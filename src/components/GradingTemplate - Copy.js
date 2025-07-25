import React, { useState, useRef, useEffect } from 'react';
import {
  Download, Upload, FileText, Video, Plus, X, Save, FileDown, Bot,
  ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Users, PlayCircle,
  CheckCircle, Clock, SkipForward, SkipBack, Pause, RotateCcw, AlertTriangle,
  BookOpen, Settings
} from 'lucide-react';
import { useAssessment, DEFAULT_LATE_POLICY } from './SharedContext';

// NO SAMPLE RUBRIC - START WITH EMPTY STATE
// This forces users to create or load a rubric before grading

const GradingTemplate = () => {
  // Get shared context - ENHANCED with new functions
  const {
    sharedRubric,
    sharedCourseDetails,
    setSharedCourseDetails,
    gradingData: sharedGradingData,
    setGradingData: setSharedGradingData,
    updateStudentInfo,
    updateCourseInfo,
    updateAssignmentInfo,
    clearGradingFormData,
    classList,
    setClassList,
    setCurrentStudent,
    gradingSession,
    setGradingSession,
    nextStudentInSession,
    previousStudentInSession,
    updateGradingSession,
    initializeGradingSession,
    setActiveTab,
    currentStudent,
    saveDraft,
    loadDraft,
    // NEW: Add the draft/final grade functions
    saveFinalGrade,
    loadFinalGrade,
    finalGrades,
    getGradeStatus,
    currentLatePolicy,
    customLatePolicies
  } = useAssessment();

  // Helper function to convert HTML content to readable text format
  const renderFormattedContent = (htmlContent) => {
    if (!htmlContent) return '';

    // Convert basic HTML to readable text format
    let textContent = htmlContent
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<ul[^>]*>/gi, '')
      .replace(/<\/ol>/gi, '\n')
      .replace(/<ol[^>]*>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
      .trim();

    return textContent;
  };

  // State for all grading data - initialize from shared context or defaults
  const [localGradingData, setLocalGradingData] = useState(() => {
    // 1) Try loading a saved draft first
    if (currentStudent?.id) {
      const draft = loadDraft(currentStudent.id);
      if (draft) {
        return draft;
      }
    }
    // 2) If rubric was just transferred, use that
    if (sharedGradingData) {
      return {
        ...sharedGradingData,
        student: currentStudent || sharedGradingData.student || { name: '', id: '', email: '' }
      };
    }
    // 3) Otherwise, start fresh for this student
    return {
      student: currentStudent || { name: '', id: '', email: '' },
      course: sharedCourseDetails?.course || { code: '', name: '', instructor: '', term: '' },
      assignment: sharedCourseDetails?.assignment || { name: '', dueDate: '', maxPoints: 100 },
      feedback: { general: '', strengths: '', improvements: '' },
      attachments: [],
      videoLinks: [],
      latePolicy: { level: 'none', penaltyApplied: false },
      metadata: {
        gradedBy: '',
        gradedDate: '',
        aiAssisted: false,
        rubricIntegrated: false
      },
      rubricGrading: {}
    };
  });

  // Use local grading data as the main state - THIS IS NOW THE SINGLE SOURCE OF TRUTH
  const gradingData = localGradingData;
  const setGradingData = setLocalGradingData;

  // Rubric-specific state - MODIFIED: Default to null instead of sampleRubric
  const [loadedRubric, setLoadedRubric] = useState(() => {
    return sharedRubric || null; // NO DEFAULT SAMPLE RUBRIC
  });
  const [showRubricComments, setShowRubricComments] = useState({});
  const [showHeaderGuide, setShowHeaderGuide] = useState(false);

  const fileInputRef = useRef(null);
  const moduleInputRef = useRef(null);
  const rubricInputRef = useRef(null);

  // Video link management
  const [videoLinkInput, setVideoLinkInput] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  // Additional state for comments display
  const [showComments, setShowComments] = useState(false);

  // Enhanced shared data synchronization
  useEffect(() => {
    if (!sharedGradingData) return;

    console.log('🔄 Checking shared grading data for course info:', sharedGradingData.course);

    // Only update course info if it's not empty and different from current
    if (sharedGradingData.course &&
      (sharedGradingData.course.code || sharedGradingData.course.name ||
        sharedGradingData.course.instructor || sharedGradingData.course.term)) {

      const needsSync =
        sharedGradingData.course.code !== localGradingData.course.code ||
        sharedGradingData.course.name !== localGradingData.course.name ||
        sharedGradingData.course.instructor !== localGradingData.course.instructor ||
        sharedGradingData.course.term !== localGradingData.course.term;

      if (needsSync) {
        console.log('✅ Syncing course data from shared context to local state');
        setLocalGradingData(prev => ({
          ...prev,
          course: {
            code: sharedGradingData.course.code || prev.course.code,
            name: sharedGradingData.course.name || prev.course.name,
            instructor: sharedGradingData.course.instructor || prev.course.instructor,
            term: sharedGradingData.course.term || prev.course.term
          }
        }));
      }
    }
  }, [sharedGradingData]);

  // Sync with sharedRubric
  useEffect(() => {
    if (sharedRubric && sharedRubric !== loadedRubric) {
      console.log('✅ Syncing rubric from shared context:', sharedRubric.assignmentInfo?.title || 'Untitled');
      setLoadedRubric(sharedRubric);
    }
  }, [sharedRubric, loadedRubric]);

  // Auto-save to shared context whenever gradingData changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSharedGradingData(gradingData);
      setSharedCourseDetails({
        student: gradingData.student,
        course: gradingData.course,
        assignment: gradingData.assignment
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [gradingData, setSharedGradingData, setSharedCourseDetails]);

  // When we get new sharedCourseDetails, merge them in
  useEffect(() => {
    if (!sharedCourseDetails) return;
    setLocalGradingData(prev => ({
      ...prev,
      student: sharedCourseDetails.student || prev.student,
      course: sharedCourseDetails.course || prev.course,
      assignment: sharedCourseDetails.assignment || prev.assignment
    }));
  }, [sharedCourseDetails]);

  // When student changes, load any saved draft/final but keep course+assignment
  useEffect(() => {
    if (!currentStudent?.id) return;

    const status = getGradeStatus(currentStudent.id);
    let saved = null;
    if (status === 'final' && loadFinalGrade) {
      saved = loadFinalGrade(currentStudent.id);
    } else if (status === 'draft') {
      saved = loadDraft(currentStudent.id);
    }

    if (saved) {
      setLocalGradingData(prev => ({
        ...saved, // Use saved data
        course: prev.course, // Keep current course info
        assignment: prev.assignment // Keep current assignment info
      }));
    } else {
      // Fresh slate for this student, but keep course/assignment
      setLocalGradingData(prev => ({
        ...prev,
        student: currentStudent,
        feedback: { general: '', strengths: '', improvements: '' },
        attachments: [],
        videoLinks: [],
        latePolicy: { level: 'none', penaltyApplied: false },
        rubricGrading: {}
      }));
    }
  }, [currentStudent?.id, getGradeStatus, loadFinalGrade, loadDraft]);

  // Enhanced calculation function
  const calculateTotalScore = () => {
    if (!loadedRubric || !loadedRubric.criteria) return { rawScore: 0, finalScore: 0, penaltyApplied: false, latePolicyDescription: '' };

    let totalRawScore = 0;
    let maxPossiblePoints = 0;

    // Calculate raw score from rubric grading
    loadedRubric.criteria.forEach(criterion => {
      const grading = gradingData.rubricGrading[criterion.id];
      if (grading && grading.selectedLevel && loadedRubric.rubricLevels) {
        const selectedLevel = loadedRubric.rubricLevels.find(level => level.level === grading.selectedLevel);
        if (selectedLevel) {
          totalRawScore += criterion.maxPoints * selectedLevel.multiplier;
        }
      }
      maxPossiblePoints += criterion.maxPoints;
    });

    // Apply late policy penalty
    const activeLatePolicy = currentLatePolicy || DEFAULT_LATE_POLICY;
    const latePolicyLevel = activeLatePolicy.levels[gradingData.latePolicy.level] || activeLatePolicy.levels.none;
    const finalScore = totalRawScore * latePolicyLevel.multiplier;

    return {
      rawScore: totalRawScore,
      finalScore: finalScore,
      penaltyApplied: gradingData.latePolicy.level !== 'none',
      latePolicyDescription: latePolicyLevel.description
    };
  };

  const [scoreSummary, setScoreSummary] = useState(calculateTotalScore());

  useEffect(() => {
    setScoreSummary(calculateTotalScore());
  }, [gradingData.rubricGrading, gradingData.latePolicy, currentLatePolicy, customLatePolicies, loadedRubric]);

  const updateLatePolicy = (level) => {
    setGradingData(prevData => ({
      ...prevData,
      latePolicy: {
        level: level,
        penaltyApplied: level !== 'none',
        policyId: currentLatePolicy?.id || DEFAULT_LATE_POLICY.id
      }
    }));
  };

  const updateRubricGrading = (criterionId, level, comments = null) => {
    if (!loadedRubric) return; // Guard against null rubric

    setLocalGradingData(prevData => {
      const existingGrading = prevData.rubricGrading[criterionId];
      const existingComments = existingGrading?.customComments || '';
      const newRubricState = {
        ...prevData.rubricGrading,
        [criterionId]: {
          criterionId,
          selectedLevel: level,
          customComments: comments !== null ? comments : existingComments
        }
      };
      return {
        ...prevData,
        rubricGrading: newRubricState
      };
    });
  };

  const addCriterionFeedback = (criterionId, comment) => {
    if (!loadedRubric) return; // Guard against null rubric

    setLocalGradingData(prevData => {
      const currentGrading = prevData.rubricGrading[criterionId];
      const currentComments = currentGrading?.customComments || '';
      const newComments = currentComments ?
        `${currentComments}\n${comment}` : comment;

      return {
        ...prevData,
        rubricGrading: {
          ...prevData.rubricGrading,
          [criterionId]: {
            ...currentGrading,
            customComments: newComments
          }
        }
      };
    });
  };

  // HELPER FUNCTIONS FOR COURSE INFO
  const getEffectiveCourseData = () => {
    const course = gradingData?.course || {};
    const metadata = classList?.courseMetadata;

    return {
      code: course.code || metadata?.courseCode || '',
      name: course.name || metadata?.courseName || '',
      instructor: course.instructor || metadata?.instructor || metadata?.professors || '',
      term: course.term || metadata?.term || ''
    };
  };

  const pullCourseDataFromClassList = () => {
    if (!classList?.courseMetadata) {
      alert('No class list course metadata available to pull from.');
      return;
    }

    const metadata = classList.courseMetadata;
    setGradingData(prevData => ({
      ...prevData,
      course: {
        code: metadata.courseCode || prevData.course.code,
        name: metadata.courseName || prevData.course.name,
        instructor: metadata.instructor || metadata.professors || prevData.course.instructor,
        term: metadata.term || prevData.course.term
      }
    }));

    alert('Course information has been pulled from the class list!');
  };

  // LETTER GRADE CALCULATION
  const getLetterGrade = (percentage) => {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  };

  // HTML REPORT GENERATION
  const generateStudentReportHTML = () => {
    const effectiveCourse = getEffectiveCourseData();
    const totalScore = getTotalScore();

    // Generate attachments HTML with file type detection
    const attachmentsHTML = gradingData.attachments
      .map((attachment, index) => {
        const isImage = attachment.type && attachment.type.startsWith('image/');

        if (isImage && attachment.base64Data) {
          return `<div class="attachment-item image-attachment">
            <img src="${attachment.base64Data}" 
                 alt="${attachment.name}" 
                 class="clickable-image" 
                 data-index="${index}"
                 style="max-width: 150px; max-height: 150px; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s ease;"
                 onmouseover="this.style.transform='scale(1.05)'" 
                 onmouseout="this.style.transform='scale(1)'" />
            <div class="attachment-name">${attachment.name}</div>
          </div>`;
        } else {
          return `<div class="attachment-item file-attachment">
            <div class="file-icon">📄</div>
            <div class="attachment-name">${attachment.name}</div>
            <div class="file-size">${(attachment.size / 1024).toFixed(1)} KB</div>
          </div>`;
        }
      })
      .join('');

    // Generate video links HTML
    const videoLinksHTML = gradingData.videoLinks
      .map(link => `<div class="video-link">
        <div class="video-info">
          <strong>${link.title}</strong><br>
          <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.url}</a>
          <div class="video-date">Added: ${link.addedDate}</div>
        </div>
      </div>`)
      .join('');

    // Generate rubric HTML if available
    let rubricHTML = '';
    if (loadedRubric && loadedRubric.criteria) {
      rubricHTML = `
        <div class="rubric-section">
          <h2>📊 Detailed Rubric Assessment</h2>
          ${loadedRubric.criteria.map(criterion => {
        const grading = gradingData.rubricGrading[criterion.id];
        const selectedLevel = (grading?.selectedLevel && loadedRubric.rubricLevels) ?
          loadedRubric.rubricLevels.find(level => level.level === grading.selectedLevel) : null;
        const points = selectedLevel ? (criterion.maxPoints * selectedLevel.multiplier).toFixed(1) : '0.0';

        return `
              <div class="criterion">
                <div class="criterion-header">
                  <h3>${criterion.name}</h3>
                  <div class="criterion-points">${points}/${criterion.maxPoints} pts</div>
                </div>
                <div class="criterion-description">${renderFormattedContent(criterion.description)}</div>
                ${selectedLevel ? `
                  <div class="selected-level" style="background-color: ${selectedLevel.color}20; border-left: 4px solid ${selectedLevel.color};">
                    <strong>${selectedLevel.name}</strong> (${Math.round(selectedLevel.multiplier * 100)}%)
                    ${criterion.levels && criterion.levels[selectedLevel.level]?.description ?
              `<div class="level-description">${renderFormattedContent(criterion.levels[selectedLevel.level].description)}</div>` : ''
            }
                  </div>
                ` : '<div class="no-level">Not assessed</div>'}
                ${grading?.customComments ? `
                  <div class="custom-comments">
                    <strong>Instructor Comments:</strong>
                    <div>${grading.customComments}</div>
                  </div>
                ` : ''}
              </div>
            `;
      }).join('')}
        </div>`;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grade Report - ${gradingData.student.name}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header h1 { margin: 0; font-size: 2.2em; font-weight: 300; }
        .header .course-info { margin-top: 15px; font-size: 1.1em; opacity: 0.9; }
        .grade-summary { background: white; padding: 25px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .grade-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 20px 0; }
        .grade-item { text-align: center; padding: 20px; background: #f8f9ff; border-radius: 8px; border: 2px solid #e1e5f2; }
        .grade-value { font-size: 2em; font-weight: bold; color: #5a67d8; margin-bottom: 5px; }
        .grade-label { font-size: 0.9em; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .section { background: white; padding: 25px; margin-bottom: 25px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .section h2 { color: #4a5568; border-bottom: 3px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }
        .feedback-section { background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 20px; border-radius: 8px; margin: 15px 0; }
        .rubric-section .criterion { margin-bottom: 25px; padding: 20px; background: #fdfdfd; border-radius: 8px; border: 1px solid #e2e8f0; }
        .criterion-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .criterion-header h3 { margin: 0; color: #2d3748; }
        .criterion-points { font-weight: bold; color: #5a67d8; font-size: 1.1em; }
        .selected-level { padding: 15px; margin: 15px 0; border-radius: 6px; }
        .custom-comments { background: #f7fafc; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #4299e1; }
        .attachments { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; margin-top: 20px; }
        .attachment-item { text-align: center; padding: 15px; background: #f8f9ff; border-radius: 8px; border: 1px solid #e1e5f2; }
        .attachment-name { margin-top: 10px; font-size: 0.9em; font-weight: 500; }
        .file-icon { font-size: 2.5em; margin-bottom: 10px; }
        .file-size { font-size: 0.8em; color: #666; margin-top: 5px; }
        .video-link { padding: 15px; background: #f1f5f9; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #3182ce; }
        .video-date { font-size: 0.8em; color: #666; margin-top: 5px; }
        .pass-status { padding: 10px 20px; border-radius: 20px; font-weight: bold; display: inline-block; margin-top: 10px; }
        .pass { background: #c6f6d5; color: #22543d; }
        .fail { background: #fed7d7; color: #742a2a; }
        .late-penalty { background: #fef5e7; color: #744210; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ed8936; }
        .image-modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.9); }
        .image-modal.show { display: block; }
        .modal-content { margin: auto; display: block; max-width: 90%; max-height: 90%; margin-top: 5%; }
        .close-modal { position: absolute; top: 15px; right: 35px; color: #f1f1f1; font-size: 40px; font-weight: bold; cursor: pointer; }
        .modal-caption { margin: auto; display: block; width: 80%; max-width: 700px; text-align: center; color: #ccc; padding: 10px 0; }
        @media print { .image-modal { display: none !important; } body { background: white; } .section, .grade-summary { box-shadow: none; border: 1px solid #ddd; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 Grade Report</h1>
        <div class="course-info">
            <strong>${gradingData.student.name}</strong> (${gradingData.student.id})<br>
            ${effectiveCourse.code} - ${effectiveCourse.name}<br>
            ${effectiveCourse.instructor} • ${effectiveCourse.term}
        </div>
    </div>

    <div class="grade-summary">
        <h2>🎯 Grade Summary</h2>
        <div class="grade-grid">
            <div class="grade-item">
                <div class="grade-value">${totalScore.finalScore.toFixed(1)}</div>
                <div class="grade-label">Final Score</div>
            </div>
            <div class="grade-item">
                <div class="grade-value">${totalScore.percentage}%</div>
                <div class="grade-label">Percentage</div>
            </div>
            <div class="grade-item">
                <div class="grade-value">${getLetterGrade(parseFloat(totalScore.percentage))}</div>
                <div class="grade-label">Letter Grade</div>
            </div>
            <div class="grade-item">
                <div class="grade-value">${loadedRubric ? loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints}</div>
                <div class="grade-label">Total Points</div>
            </div>
        </div>
        
        <div class="pass-status ${totalScore.finalScore >= (loadedRubric ? loadedRubric.assignmentInfo.passingThreshold / 100 * loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints * 0.6) ? 'pass' : 'fail'}">
            ${totalScore.finalScore >= (loadedRubric ? loadedRubric.assignmentInfo.passingThreshold / 100 * loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints * 0.6) ? '✅ PASS' : '❌ FAIL'}
        </div>

        ${totalScore.penaltyApplied ? `
            <div class="late-penalty">
                <strong>⏰ Late Penalty Applied:</strong> ${totalScore.latePolicyDescription}
            </div>
        ` : ''}
    </div>

    ${gradingData.feedback.general || gradingData.feedback.strengths || gradingData.feedback.improvements ? `
        <div class="section">
            <h2>💬 Instructor Feedback</h2>
            ${gradingData.feedback.general ? `
                <div class="feedback-section">
                    <h3>Overall Comments</h3>
                    <p>${gradingData.feedback.general}</p>
                </div>
            ` : ''}
            ${gradingData.feedback.strengths ? `
                <div class="feedback-section">
                    <h3>✅ Strengths</h3>
                    <p>${gradingData.feedback.strengths}</p>
                </div>
            ` : ''}
            ${gradingData.feedback.improvements ? `
                <div class="feedback-section">
                    <h3>📈 Areas for Improvement</h3>
                    <p>${gradingData.feedback.improvements}</p>
                </div>
            ` : ''}
        </div>
    ` : ''}

    ${rubricHTML}

    ${attachmentsHTML ? `<div class="section"><h2>📎 File Attachments</h2><div class="attachments">${attachmentsHTML}</div></div>` : ''}

    ${videoLinksHTML ? `<div class="section"><h2>🎥 Video Review Links</h2>${videoLinksHTML}</div>` : ''}

    <p style="margin-top: 40px; text-align: center; color: #666; font-size: 0.9rem;">
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
    </p>

    <div id="imageModal" class="image-modal">
        <span class="close-modal" onclick="closeImageModal()">&times;</span>
        <img class="modal-content" id="modalImage">
        <div class="modal-caption" id="modalCaption"></div>
    </div>

    <script>
        const attachmentData = ${JSON.stringify(gradingData.attachments)};

        function openImageModal(src, caption) {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImage');
            const modalCaption = document.getElementById('modalCaption');
            
            modal.classList.add('show');
            modalImg.src = src;
            modalCaption.textContent = caption;
            document.body.style.overflow = 'hidden';
        }

        function closeImageModal() {
            document.getElementById('imageModal').classList.remove('show');
            document.body.style.overflow = 'auto';
        }

        document.addEventListener('DOMContentLoaded', function() {
            // Add click handlers to images
            document.querySelectorAll('.clickable-image').forEach(img => {
                img.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    const attachment = attachmentData[index];
                    if (attachment && attachment.base64Data) {
                        openImageModal(attachment.base64Data, attachment.name);
                    }
                });
            });

            // Close modal when clicking outside
            document.getElementById('imageModal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeImageModal();
                }
            });

            // Close modal with Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeImageModal();
                }
            });
        });
    </script>
</body>
</html>`;

    return htmlContent;
  };

  // AI FEEDBACK EXPORT FUNCTIONS
  const exportAIFeedbackData = () => {
    if (!localGradingData.student?.name) {
      alert('Please ensure student information is loaded before exporting for AI feedback.');
      return;
    }

    // Calculate scores
    const maxPoints = loadedRubric ? loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints;
    const percentage = maxPoints > 0 ? (scoreSummary.finalScore / maxPoints * 100).toFixed(1) : 0;

    // Build criteria performance data
    const criteriaPerformance = (loadedRubric && loadedRubric.criteria) ? loadedRubric.criteria.map(criterion => {
      const grading = gradingData.rubricGrading[criterion.id];
      const selectedLevel = (grading?.selectedLevel && loadedRubric.rubricLevels) ?
        loadedRubric.rubricLevels.find(level => level.level === grading.selectedLevel) : null;

      return {
        name: criterion.name,
        maxPoints: criterion.maxPoints,
        earnedPoints: selectedLevel ? (criterion.maxPoints * selectedLevel.multiplier).toFixed(1) : 0,
        level: selectedLevel ? selectedLevel.name : 'Not Assessed',
        levelDescription: selectedLevel ? selectedLevel.description : '',
        customComments: grading?.customComments || '',
        percentage: selectedLevel ? Math.round(selectedLevel.multiplier * 100) : 0
      };
    }) : [];

    const aiGradeData = {
      student: {
        firstName: localGradingData.student.name.split(' ')[0] || '',
        fullName: localGradingData.student.name,
        id: localGradingData.student.id,
        email: localGradingData.student.email
      },
      course: {
        code: localGradingData.course.code,
        name: localGradingData.course.name,
        instructor: localGradingData.course.instructor,
        term: localGradingData.course.term
      },
      assignment: {
        title: localGradingData.assignment.name || (loadedRubric?.assignmentInfo?.title),
        description: loadedRubric?.assignmentInfo?.description || '',
        totalPoints: maxPoints,
        passingThreshold: loadedRubric?.assignmentInfo?.passingThreshold || 60,
        dueDate: localGradingData.assignment.dueDate
      },
      gradeData: {
        overallScore: Math.round(scoreSummary.finalScore * 10) / 10,
        rawScore: Math.round(scoreSummary.rawScore * 10) / 10,
        overallPercentage: percentage,
        letterGrade: getLetterGrade(percentage),
        passed: percentage >= (loadedRubric?.assignmentInfo?.passingThreshold || 60),
        latePenaltyApplied: scoreSummary.penaltyApplied,
        latePolicyDescription: scoreSummary.latePolicyDescription,
        criteria: criteriaPerformance
      },
      existingFeedback: {
        general: localGradingData.feedback.general || '',
        strengths: localGradingData.feedback.strengths || '',
        improvements: localGradingData.feedback.improvements || ''
      },
      metadata: {
        gradedDate: new Date().toISOString(),
        rubricUsed: loadedRubric?.assignmentInfo?.title || 'Custom Rubric',
        totalCriteria: criteriaPerformance.length,
        exportedForAI: true
      }
    };

    // Export as JSON file
    const dataStr = JSON.stringify(aiGradeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Feedback_Data_${localGradingData.student.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    return aiGradeData;
  };

  const generateAIFeedbackPrompt = () => {
    const gradeData = exportAIFeedbackData();
    if (!gradeData) return;

    const studentFirstName = gradeData.student.firstName;
    const courseName = gradeData.course.name || 'this course';
    const assignmentTitle = gradeData.assignment.title || 'assignment';

    // Determine student level context
    const getStudentLevel = () => {
      const courseCode = gradeData.course.code.toUpperCase();
      if (courseCode.includes('100') || courseCode.includes('1')) return 'first-year undergraduate';
      if (courseCode.includes('200') || courseCode.includes('2')) return 'second-year undergraduate';
      if (courseCode.includes('300') || courseCode.includes('3')) return 'third-year undergraduate';
      if (courseCode.includes('400') || courseCode.includes('4')) return 'senior undergraduate';
      if (courseCode.includes('500') || courseCode.includes('6') || courseCode.includes('8')) return 'graduate';
      return 'undergraduate';
    };

    const prompt = `You are an experienced instructor writing concise, personal feedback for a student. Write feedback that sounds natural and conversational, but keep it brief and focused.

STUDENT GRADE DATA:
${JSON.stringify(gradeData, null, 2)}

Write feedback in this exact structure:

**Opening Paragraph:** Start with "${studentFirstName}" and write 2-3 sentences giving your overall impression of their ${assignmentTitle}. Mention their ${gradeData.gradeData.overallPercentage}% (${gradeData.gradeData.letterGrade}) performance and whether they ${gradeData.gradeData.passed ? 'met' : 'did not meet'} course standards. ${gradeData.gradeData.latePenaltyApplied ? 'Briefly acknowledge the late submission but focus on work quality.' : ''} Keep it warm but honest, appropriate for a ${getStudentLevel()} student.

**Key Observations:**
Write 3-5 concise bullet points (use actual bullet points •) covering:
• Their strongest performance area (mention specific criteria that scored highest)
• One area showing good progress or solid competency  
• One specific area for improvement with a concrete suggestion
• ${gradeData.gradeData.latePenaltyApplied ? 'A brief note about time management for future assignments' : 'An encouragement about their overall skill development'}
• One forward-looking suggestion for growth in ${courseName}

**Conclusion:**
Write 1-2 sentences encouraging ${studentFirstName}'s continued development and expressing confidence in their potential.

**Final Note:**
Add: "Your complete grade report with detailed rubric assessment is attached for download."

**WRITING STYLE:**
- Conversational and personal, like speaking directly to ${studentFirstName}
- Specific to their actual performance levels and criteria
- Encouraging but honest
- Professional yet warm
- Use their actual criterion names and performance levels from the data
- Keep each bullet point to 1-2 sentences maximum

**Context:**
- Student: ${gradeData.student.fullName}
- Course: ${gradeData.course.code} - ${gradeData.course.name}
- Assignment: ${assignmentTitle}
- Instructor: ${gradeData.course.instructor}

Write the feedback now, making it sound personal and genuine while keeping it concise and well-structured.`;

    // Export prompt as text file
    const promptBlob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(promptBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Feedback_Prompt_${gradeData.student.firstName}_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    console.log('AI Feedback Prompt Generated:', prompt);
    return prompt;
  };

  const exportForAIFeedback = () => {
    try {
      // First export the grade data
      const gradeData = exportAIFeedbackData();
      if (!gradeData) return;

      // Then generate and export the prompt
      setTimeout(() => {
        generateAIFeedbackPrompt();
        alert(`AI feedback files exported successfully for ${gradeData.student.fullName}!\n\nFiles created:\n1. Grade data JSON\n2. AI prompt text file\n\nUse these files with your preferred AI service to generate personalized feedback.`);
      }, 500); // Small delay to ensure first download completes

    } catch (error) {
      console.error('Error exporting AI feedback data:', error);
      alert('Error exporting AI feedback data. Please check the console for details.');
    }
  };

  // FILE UPLOAD HANDLERS
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const processFiles = files.map(file => {
      return new Promise((resolve) => {
        const newAttachment = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          file: file
        };

        // If it's an image, convert to base64 for display
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            newAttachment.base64Data = e.target.result;
            resolve(newAttachment);
          };
          reader.readAsDataURL(file);
        } else {
          resolve(newAttachment);
        }
      });
    });

    Promise.all(processFiles).then(newAttachments => {
      setGradingData(prevData => ({
        ...prevData,
        attachments: [...prevData.attachments, ...newAttachments]
      }));
    });
  };

  const removeAttachment = (attachmentId) => {
    setGradingData(prevData => ({
      ...prevData,
      attachments: prevData.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  // VIDEO LINK HANDLERS
  const addVideoLink = () => {
    if (!videoLinkInput.trim()) return;

    const newVideoLink = {
      id: Date.now(),
      url: videoLinkInput,
      title: videoTitle || 'Video Link',
      addedDate: new Date().toLocaleDateString()
    };

    setGradingData(prevData => ({
      ...prevData,
      videoLinks: [...prevData.videoLinks, newVideoLink]
    }));

    setVideoLinkInput('');
    setVideoTitle('');
  };

  const removeVideoLink = (linkId) => {
    setGradingData(prevData => ({
      ...prevData,
      videoLinks: prevData.videoLinks.filter(link => link.id !== linkId)
    }));
  };

  // RUBRIC LOADING
  const handleRubricUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rubricData = JSON.parse(e.target.result);

        // Validate required structure
        if (!rubricData.assignmentInfo || !rubricData.criteria || !rubricData.rubricLevels) {
          alert('Invalid rubric format. Please ensure the rubric contains assignmentInfo, criteria, and rubricLevels.');
          return;
        }

        setLoadedRubric(rubricData);
        alert(`Rubric "${rubricData.assignmentInfo.title}" loaded successfully!`);

        // Reset rubric grading when new rubric is loaded
        setGradingData(prevData => ({
          ...prevData,
          rubricGrading: {}
        }));
      } catch (error) {
        alert('Error loading rubric: Invalid JSON format');
        console.error('Rubric loading error:', error);
      }
    };
    reader.readAsText(file);
  };

  // Enhanced total score calculation with grade percentage
  const getTotalScore = () => {
    const score = calculateTotalScore();
    const percentage = loadedRubric ?
      (score.finalScore / loadedRubric.assignmentInfo.totalPoints * 100).toFixed(1) : 0;
    return { ...score, percentage };
  };

  // EXPORT FUNCTIONS
  const exportToHTML = () => {
    const htmlContent = generateStudentReportHTML();
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(htmlBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grade_report_${gradingData.student.name || 'student'}_${gradingData.assignment.name || 'assignment'}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const html = generateStudentReportHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const exportGradingData = () => {
    const exportData = {
      ...gradingData,
      rubric: loadedRubric,
      totalScore: getTotalScore(),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `grading-${gradingData.student.name?.replace(/\s+/g, '-') || 'student'}-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // GRADING SESSION HANDLERS
  const handleNextStudent = () => {
    if (!gradingSession) return;

    const success = nextStudentInSession();
    if (success) {
      // Clear current grading data and load next student's draft if available
      const nextStudent = gradingSession.students[gradingSession.currentIndex];
      const draft = loadDraft(nextStudent.id);

      if (draft) {
        setLocalGradingData(draft);
      } else {
        // Initialize fresh data for next student
        setLocalGradingData({
          student: nextStudent,
          course: gradingData.course,
          assignment: gradingData.assignment,
          feedback: { general: '', strengths: '', improvements: '' },
          attachments: [],
          videoLinks: [],
          latePolicy: { level: 'none', penaltyApplied: false },
          metadata: {
            gradedBy: '',
            gradedDate: '',
            aiAssisted: false,
            rubricIntegrated: false
          },
          rubricGrading: {}
        });
      }
    }
  };

  const handlePreviousStudent = () => {
    if (!gradingSession) return;

    const success = previousStudentInSession();
    if (success) {
      const prevStudent = gradingSession.students[gradingSession.currentIndex];
      const draft = loadDraft(prevStudent.id);

      if (draft) {
        setLocalGradingData(draft);
      } else {
        setLocalGradingData({
          student: prevStudent,
          course: gradingData.course,
          assignment: gradingData.assignment,
          feedback: { general: '', strengths: '', improvements: '' },
          attachments: [],
          videoLinks: [],
          latePolicy: { level: 'none', penaltyApplied: false },
          metadata: {
            gradedBy: '',
            gradedDate: '',
            aiAssisted: false,
            rubricIntegrated: false
          },
          rubricGrading: {}
        });
      }
    }
  };

  // SAVING HANDLERS
  const handleSaveDraft = () => {
    if (!currentStudent?.id) {
      alert('No student selected for saving draft');
      return;
    }

    saveDraft(currentStudent.id, gradingData);
    alert(`Draft saved for ${currentStudent.name || 'current student'}`);
  };

  const handleSaveFinalGrade = () => {
    if (!currentStudent?.id) {
      alert('No student selected for final grade');
      return;
    }

    const finalGradeData = {
      ...gradingData,
      totalScore: getTotalScore(),
      metadata: {
        ...gradingData.metadata,
        gradedDate: new Date().toISOString(),
        rubricIntegrated: !!loadedRubric
      }
    };

    saveFinalGrade(currentStudent.id, finalGradeData);
    alert(`Final grade saved for ${currentStudent.name || 'current student'}`);

    // Automatically move to next student if in a grading session
    if (gradingSession && gradingSession.currentIndex < gradingSession.students.length - 1) {
      setTimeout(() => {
        handleNextStudent();
      }, 1000);
    }
  };

  // NEW: No Rubric UI Component
  const NoRubricUI = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fde68a 100%)',
      borderRadius: '1rem',
      border: '2px dashed #f59e0b',
      padding: '3rem',
      margin: '2rem 0',
      textAlign: 'center'
    }}>
      <AlertTriangle
        size={80}
        style={{
          color: '#d97706',
          marginBottom: '1.5rem',
          filter: 'drop-shadow(0 2px 4px rgba(217, 119, 6, 0.3))'
        }}
      />

      <h2 style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: '#92400e',
        marginBottom: '1rem',
        textShadow: '0 1px 2px rgba(146, 64, 14, 0.1)'
      }}>
        No Rubric Loaded
      </h2>

      <p style={{
        fontSize: '1.1rem',
        color: '#a16207',
        marginBottom: '2rem',
        maxWidth: '600px',
        lineHeight: '1.6'
      }}>
        A rubric is required before you can begin grading students. Please create a new rubric or load an existing one to get started.
      </p>

      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setActiveTab('rubric-creator')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.5)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
          }}
        >
          <FileText size={20} />
          Create New Rubric
        </button>

        <button
          onClick={() => rubricInputRef.current?.click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }}
        >
          <Upload size={20} />
          Load Existing Rubric
        </button>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
        color: '#78350f',
        maxWidth: '500px'
      }}>
        <strong>💡 Tip:</strong> You can also use the AI Rubric Prompt Generator to create rubric prompts for AI tools, or generate assignment prompts before creating your rubric.
      </div>

      <input
        ref={rubricInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleRubricUpload}
      />
    </div>
  );

  // If no rubric is loaded, show the No Rubric UI
  if (!loadedRubric) {
    return (
      <div style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          borderRadius: '0.75rem',
          border: '1px solid #d1d5db'
        }}>
          <Settings size={32} style={{ color: '#6b7280' }} />
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>
              🎯 Grading Tool
            </h1>
            <p style={{
              color: '#6b7280',
              margin: 0,
              fontSize: '1rem'
            }}>
              Assessment and feedback management system
            </p>
          </div>
        </div>

        <NoRubricUI />
      </div>
    );
  }

  // Regular grading interface when rubric is loaded
  const totalScore = getTotalScore();
  const gradeStatus = currentStudent?.id ? getGradeStatus(currentStudent.id) : 'none';

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        borderRadius: '0.75rem',
        border: '1px solid #d1d5db'
      }}>
        <Settings size={32} style={{ color: '#6b7280' }} />
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1f2937',
            margin: 0
          }}>
            🎯 Grading Tool
          </h1>
          <p style={{
            color: '#6b7280',
            margin: 0,
            fontSize: '1rem'
          }}>
            Assessment and feedback management system
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => rubricInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: 'pointer',
              color: '#374151'
            }}
          >
            <Upload size={16} />
            Load Rubric
          </button>

          <button
            onClick={exportGradingData}
            disabled={!currentStudent}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: currentStudent ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: currentStudent ? 'pointer' : 'not-allowed',
              color: currentStudent ? '#374151' : '#9ca3af'
            }}
          >
            <FileDown size={16} />
            Export
          </button>
        </div>
      </div>

      <input
        ref={rubricInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleRubricUpload}
      />

      {/* Current Rubric Info */}
      {loadedRubric && (
        <div style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          border: '1px solid #93c5fd',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1e40af',
            margin: '0 0 0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FileText size={20} />
            Current Rubric: {loadedRubric.assignmentInfo.title}
          </h2>
          <p style={{ color: '#1e40af', margin: 0, fontSize: '0.9rem' }}>
            {loadedRubric.assignmentInfo.description || 'No description provided'}
          </p>
          <div style={{
            display: 'flex',
            gap: '2rem',
            marginTop: '0.75rem',
            fontSize: '0.875rem',
            color: '#1d4ed8'
          }}>
            <span><strong>Weight:</strong> {loadedRubric.assignmentInfo.weight}%</span>
            <span><strong>Total Points:</strong> {loadedRubric.assignmentInfo.totalPoints}</span>
            <span><strong>Passing:</strong> {loadedRubric.assignmentInfo.passingThreshold}%</span>
            <span><strong>Criteria:</strong> {loadedRubric.criteria.length}</span>
          </div>
        </div>
      )}

      {/* Grading Session Status */}
      {gradingSession && (
        <div style={{
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          border: '1px solid #6ee7b7',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#047857',
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Users size={18} />
                Batch Grading Session Active
              </h3>
              <p style={{ color: '#047857', margin: 0, fontSize: '0.9rem' }}>
                Student {gradingSession.currentIndex + 1} of {gradingSession.students.length}:
                <strong> {gradingSession.students[gradingSession.currentIndex]?.name || 'Unknown'}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handlePreviousStudent}
                disabled={gradingSession.currentIndex === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 1rem',
                  background: gradingSession.currentIndex === 0 ? '#f3f4f6' : '#10b981',
                  color: gradingSession.currentIndex === 0 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: gradingSession.currentIndex === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                <SkipBack size={16} />
                Previous
              </button>

              <button
                onClick={handleNextStudent}
                disabled={gradingSession.currentIndex >= gradingSession.students.length - 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 1rem',
                  background: gradingSession.currentIndex >= gradingSession.students.length - 1 ? '#f3f4f6' : '#10b981',
                  color: gradingSession.currentIndex >= gradingSession.students.length - 1 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: gradingSession.currentIndex >= gradingSession.students.length - 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                Next
                <SkipForward size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Information */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
          👤 Student Information
        </h3>
        <div style={{
          background: 'linear-gradient(135deg, #fafaff 0%, #f3f4f6 100%)',
          border: '1px solid #d1d5db',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Student Name
              </label>
              <input
                type="text"
                value={gradingData.student.name}
                onChange={(e) => setGradingData(prevData => ({
                  ...prevData,
                  student: { ...prevData.student, name: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter student name"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Student ID
              </label>
              <input
                type="text"
                value={gradingData.student.id}
                onChange={(e) => setGradingData(prevData => ({
                  ...prevData,
                  student: { ...prevData.student, id: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter student ID"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Email
              </label>
              <input
                type="email"
                value={gradingData.student.email}
                onChange={(e) => setGradingData(prevData => ({
                  ...prevData,
                  student: { ...prevData.student, email: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter email address"
              />
            </div>
          </div>

          {gradeStatus !== 'none' && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: gradeStatus === 'final' ? '#dcfce7' : '#fef3c7',
              border: `1px solid ${gradeStatus === 'final' ? '#86efac' : '#fde047'}`,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: gradeStatus === 'final' ? '#047857' : '#a16207'
            }}>
              <strong>
                {gradeStatus === 'final' ? '✅ Final Grade Saved' : '📝 Draft Saved'}
              </strong>
              {gradeStatus === 'final' && ' - This student has been fully graded'}
              {gradeStatus === 'draft' && ' - You can continue editing this draft'}
            </div>
          )}
        </div>
      </div>

      {/* Course Information */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, color: '#374151' }}>
            🏫 Course Information
          </h3>
          {classList && classList.courseMetadata && (
            <button
              onClick={pullCourseDataFromClassList}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.375rem 0.75rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <Download size={14} />
              Pull Course Data
            </button>
          )}
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fafaff 0%, #f3f4f6 100%)',
          border: '1px solid #d1d5db',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Course Code
              </label>
              <input
                type="text"
                value={gradingData.course.code}
                onChange={(e) => setGradingData(prevData => ({
                  ...prevData,
                  course: { ...prevData.course, code: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="e.g., CS 101"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Course Name
              </label>
              <input
                type="text"
                value={gradingData.course.name}
                onChange={(e) => setGradingData(prevData => ({
                  ...prevData,
                  course: { ...prevData.course, name: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="e.g., Introduction to Computer Science"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Instructor
              </label>
              <input
                type="text"
                value={gradingData.course.instructor}
                onChange={(e) => setGradingData(prevData => ({
                  ...prevData,
                  course: { ...prevData.course, instructor: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Instructor name"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Term
              </label>
              <input
                type="text"
                value={gradingData.course.term}
                onChange={(e) => setGradingData(prevData => ({
                  ...prevData,
                  course: { ...prevData.course, term: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="e.g., Fall 2024"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Information */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
          📋 Assignment Information
        </h3>
        <div style={{
          background: 'linear-gradient(135deg, #fafaff 0%, #f3f4f6 100%)',
          border: '1px solid #d1d5db',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Assignment Name
              </label>
              <input
                type="text"
                value={gradingData.assignment.name}
                onChange={(e) => setGradingData(prevData => ({
                  ...prevData,
                  assignment: { ...prevData.assignment, name: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Assignment title"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Due Date
              </label>
              <input
                type="date"
                value={gradingData.assignment.dueDate}
                onChange={(e) => setGradingData(prevData => ({
                  ...prevData,
                  assignment: { ...prevData.assignment, dueDate: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Max Points
              </label>
              <input
                type="number"
                value={gradingData.assignment.maxPoints}
                onChange={(e) => setGradingData(prevData => ({
                  ...prevData,
                  assignment: { ...prevData.assignment, maxPoints: parseInt(e.target.value) || 100 }
                }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                min="1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Late Policy */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
          ⏰ Late Policy
        </h3>
        <div style={{
          background: 'linear-gradient(135deg, #fafaff 0%, #f3f4f6 100%)',
          border: '1px solid #d1d5db',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {Object.entries((currentLatePolicy || DEFAULT_LATE_POLICY).levels).map(([levelKey, levelData]) => (
              <label
                key={levelKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: gradingData.latePolicy.level === levelKey ? levelData.color : '#f9fafb',
                  color: gradingData.latePolicy.level === levelKey ? 'white' : '#374151',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  border: `2px solid ${gradingData.latePolicy.level === levelKey ? levelData.color : '#e5e7eb'}`,
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="radio"
                  name="latePolicy"
                  value={levelKey}
                  checked={gradingData.latePolicy.level === levelKey}
                  onChange={(e) => updateLatePolicy(e.target.value)}
                  style={{ margin: 0 }}
                />
                {levelData.name}
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  ({Math.round(levelData.multiplier * 100)}%)
                </span>
              </label>
            ))}
          </div>

          {gradingData.latePolicy.level !== 'none' && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: '#fef3c7',
              border: '1px solid #fde047',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#a16207'
            }}>
              <strong>Late Policy Applied:</strong> {(currentLatePolicy || DEFAULT_LATE_POLICY).levels[gradingData.latePolicy.level]?.description}
            </div>
          )}
        </div>
      </div>

      {/* Rubric Grading */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
          📊 Rubric Assessment
        </h3>

        {loadedRubric && loadedRubric.criteria && loadedRubric.criteria.map((criterion, criterionIndex) => (
          <div
            key={criterion.id}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 0.5rem 0'
                }}>
                  {criterion.name}
                </h4>
                {criterion.description && (
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    margin: '0 0 0.75rem 0',
                    lineHeight: '1.5'
                  }}>
                    {renderFormattedContent(criterion.description)}
                  </p>
                )}
              </div>
              <div style={{
                textAlign: 'right',
                marginLeft: '1rem'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {criterion.maxPoints} pts
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#64748b'
                }}>
                  Weight: {criterion.weight}%
                </div>
              </div>
            </div>

            {/* Performance Levels */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              {loadedRubric && loadedRubric.rubricLevels && loadedRubric.rubricLevels.map((level) => {
                const isSelected = gradingData.rubricGrading[criterion.id]?.selectedLevel === level.level;
                const levelDescription = criterion.levels[level.level];
                const pointValue = criterion.maxPoints * level.multiplier;

                return (
                  <button
                    key={level.level}
                    onClick={() => updateRubricGrading(criterion.id, level.level)}
                    style={{
                      padding: '1rem',
                      background: isSelected ?
                        `linear-gradient(135deg, ${level.color} 0%, ${level.color}dd 100%)` :
                        'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      color: isSelected ? 'white' : '#374151',
                      border: `2px solid ${isSelected ? level.color : '#e2e8f0'}`,
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? '600' : '500',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 4px 12px ${level.color}40` : '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.target.style.borderColor = level.color;
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div style={{
                      fontWeight: '600',
                      marginBottom: '0.25rem',
                      fontSize: '0.875rem'
                    }}>
                      {level.name}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      opacity: 0.9,
                      marginBottom: '0.5rem'
                    }}>
                      {pointValue.toFixed(1)} pts ({Math.round(level.multiplier * 100)}%)
                    </div>
                    {levelDescription && (
                      <div style={{
                        fontSize: '0.7rem',
                        opacity: 0.8,
                        lineHeight: '1.3'
                      }}>
                        {levelDescription.description ?
                          renderFormattedContent(levelDescription.description).substring(0, 100) + '...' :
                          level.description.substring(0, 100) + '...'
                        }
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Comments */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Custom Comments for {criterion.name}
              </label>
              <textarea
                value={gradingData.rubricGrading[criterion.id]?.customComments || ''}
                onChange={(e) => updateRubricGrading(criterion.id,
                  gradingData.rubricGrading[criterion.id]?.selectedLevel || '',
                  e.target.value
                )}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
                placeholder={`Specific feedback for ${criterion.name}...`}
              />
            </div>

            {/* Feedback Library (if available) */}
            {criterion.feedbackLibrary && Object.keys(criterion.feedbackLibrary).length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => setShowRubricComments(prev => ({
                    ...prev,
                    [criterion.id]: !prev[criterion.id]
                  }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  {showRubricComments[criterion.id] ?
                    <ChevronUp size={16} /> :
                    <ChevronDown size={16} />
                  }
                  Feedback Library
                </button>

                {showRubricComments[criterion.id] && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '1rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem'
                  }}>
                    {Object.entries(criterion.feedbackLibrary).map(([category, comments]) => (
                      <div key={category} style={{ marginBottom: '1rem' }}>
                        <h5 style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '0.5rem',
                          textTransform: 'capitalize'
                        }}>
                          {category}
                        </h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {comments.map((comment, index) => (
                            <button
                              key={index}
                              onClick={() => addCriterionFeedback(criterion.id, comment)}
                              style={{
                                padding: '0.375rem 0.75rem',
                                background: '#ffffff',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                color: '#374151',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.background = '#3b82f6';
                                e.target.style.color = 'white';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.background = '#ffffff';
                                e.target.style.color = '#374151';
                              }}
                            >
                              + {comment}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Score Summary */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
          🎯 Score Summary
        </h3>
        <div style={{
          background: (loadedRubric && totalScore.finalScore >= (loadedRubric.assignmentInfo.passingThreshold / 100 * loadedRubric.assignmentInfo.totalPoints)) ?
            'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' :
            'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
          border: `1px solid ${(loadedRubric && totalScore.finalScore >= (loadedRubric.assignmentInfo.passingThreshold / 100 * loadedRubric.assignmentInfo.totalPoints)) ?
            '#86efac' : '#fca5a5'}`,
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                Raw Score
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
                {totalScore.rawScore.toFixed(1)}/{loadedRubric ? loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                Final Score
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
                {totalScore.finalScore.toFixed(1)}/{loadedRubric ? loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                Percentage
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
                {totalScore.percentage}%
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                Status
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: (loadedRubric && totalScore.finalScore >= (loadedRubric.assignmentInfo.passingThreshold / 100 * loadedRubric.assignmentInfo.totalPoints)) ?
                  '#047857' : '#dc2626'
              }}>
                {(loadedRubric && totalScore.finalScore >= (loadedRubric.assignmentInfo.passingThreshold / 100 * loadedRubric.assignmentInfo.totalPoints)) ?
                  '✅ PASS' : '❌ FAIL'
                }
              </div>
            </div>
          </div>

          {totalScore.penaltyApplied && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#a16207'
            }}>
              <strong>Late Penalty Applied:</strong> {totalScore.latePolicyDescription}
            </div>
          )}
        </div>
      </div>

      {/* Export and Save Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
          📤 Export & Save Actions
        </h3>
        <div style={{
          background: 'linear-gradient(135deg, #fafaff 0%, #f3f4f6 100%)',
          border: '1px solid #d1d5db',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}>
            <button
              onClick={exportToHTML}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#16a34a',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              <FileDown size={16} />
              Export HTML
            </button>

            <button
              type="button"
              onClick={exportToPDF}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              <FileText size={16} />
              Export PDF
            </button>

            <button
              onClick={exportForAIFeedback}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              <Bot size={16} />
              AI Feedback
            </button>
          </div>

          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: 0,
            fontStyle: 'italic'
          }}>
            {loadedRubric ?
              'Comprehensive rubric-based assessment' :
              'Streamlined grading with flexible assessment options'
            }
          </p>

          {/* Save Actions for Students */}
          {currentStudent && (
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleSaveDraft}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.4)';
                  }}
                >
                  <Save size={16} />
                  Save Draft
                </button>

                <button
                  onClick={handleSaveFinalGrade}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.4)';
                  }}
                >
                  <CheckCircle size={16} />
                  Finalize & Grade Next Student
                </button>
              </div>

              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                color: '#065f46'
              }}>
                <strong>Draft:</strong> Save progress, can edit later • <strong>Finalize:</strong> Complete grading, ready for student/LMS
              </div>
            </div>
          )}
        </div>
      </div>

      {/* General Feedback Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
          📝 General Feedback
        </h3>
        <div style={{
          background: 'linear-gradient(135deg, #fafaff 0%, #f3f4f6 100%)',
          border: '1px solid #d1d5db',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Overall Comments
              </label>
              <textarea
                value={gradingData.feedback.general}
                onChange={(e) => setGradingData(prevData => ({
                  ...prevData,
                  feedback: { ...prevData.feedback, general: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  resize: 'none',
                  minHeight: '100px'
                }}
                rows="4"
                placeholder="General comments about the assignment..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Strengths
                </label>
                <textarea
                  value={gradingData.feedback.strengths}
                  onChange={(e) => setGradingData(prevData => ({
                    ...prevData,
                    feedback: { ...prevData.feedback, strengths: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    resize: 'none',
                    minHeight: '100px'
                  }}
                  rows="4"
                  placeholder="What the student did well..."
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Areas for Improvement
                </label>
                <textarea
                  value={gradingData.feedback.improvements}
                  onChange={(e) => setGradingData(prevData => ({
                    ...prevData,
                    feedback: { ...prevData.feedback, improvements: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    resize: 'none',
                    minHeight: '100px'
                  }}
                  rows="4"
                  placeholder="Suggestions for improvement..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Attachments */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
          📎 File Attachments
        </h3>
        <div style={{
          border: '2px dashed #d1d5db',
          borderRadius: '0.5rem',
          padding: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #fafaff 0%, #f9fafb 100%)'
        }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              margin: '0 auto'
            }}
          >
            <Plus size={16} />
            Add Files
          </button>

          {gradingData.attachments.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Attached Files:
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {gradingData.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: '#f3f4f6',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem'
                    }}
                  >
                    <FileText size={14} />
                    <span>{attachment.name}</span>
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0.125rem'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Links */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
          🎥 Video Links
        </h3>
        <div style={{
          background: 'linear-gradient(135deg, #fafaff 0%, #f3f4f6 100%)',
          border: '1px solid #d1d5db',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="url"
              value={videoLinkInput}
              onChange={(e) => setVideoLinkInput(e.target.value)}
              placeholder="Enter video URL (YouTube, Vimeo, etc.)"
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
            />
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Video title (optional)"
              style={{
                width: '200px',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
            />
            <button
              onClick={addVideoLink}
              disabled={!videoLinkInput.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: videoLinkInput.trim() ? '#10b981' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: videoLinkInput.trim() ? 'pointer' : 'not-allowed',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              <Video size={16} />
              Add
            </button>
          </div>

          {gradingData.videoLinks.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Video Links:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {gradingData.videoLinks.map((link) => (
                  <div
                    key={link.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  >
                    <Video size={16} style={{ color: '#6b7280' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', fontSize: '0.875rem', color: '#374151' }}>
                        {link.title}
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.75rem',
                          color: '#3b82f6',
                          textDecoration: 'none'
                        }}
                      >
                        {link.url}
                      </a>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {link.addedDate}
                    </span>
                    <button
                      onClick={() => removeVideoLink(link.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradingTemplate;