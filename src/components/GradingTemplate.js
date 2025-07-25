import React, { useState, useRef, useEffect } from 'react';
import {
  Download, Upload, FileText, Video, Plus, X, Save, FileDown, Bot,
  ArrowLeft, ArrowRight, Users, SkipForward, SkipBack, Pause,
  CheckCircle, AlertTriangle, Settings
} from 'lucide-react';
import { useAssessment, DEFAULT_LATE_POLICY } from './SharedContext';

// NO SAMPLE RUBRIC - START WITH EMPTY STATE
// This forces users to create or load a rubric before grading

const GradingTemplate = () => {
  // Get shared context - ENHANCED with new functions
  const {
    sharedRubric,
    setSharedRubric,
    sharedCourseDetails,
    setSharedCourseDetails,
    gradingData: sharedGradingData,
    setGradingData: setSharedGradingData,
    classList,
    gradingSession,
    nextStudentInSession,
    previousStudentInSession,
    updateGradingSession,
    setActiveTab,
    currentStudent,
    saveDraft,
    loadDraft,
    saveFinalGrade,
    loadFinalGrade,
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
  
  const [showRubricComments, setShowRubricComments] = useState({});


  const fileInputRef = useRef(null);
  
  const rubricInputRef = useRef(null);

  // Video link management
  const [videoLinkInput, setVideoLinkInput] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  // Additional state for comments display
  
  // Safely access the active late policy levels
  const getPolicyById = (policyId) => {
    if (!policyId) return null;
    if (policyId === DEFAULT_LATE_POLICY.id) return DEFAULT_LATE_POLICY;
    return customLatePolicies.find(p => p.id === policyId) || null;
  };

  const getSafeLatePolicy = (level, policyId) => {
    const policy = getPolicyById(policyId) || currentLatePolicy || DEFAULT_LATE_POLICY;
    const activeLevels = policy.levels || DEFAULT_LATE_POLICY.levels;
    if (!level || typeof level !== "string" || !activeLevels[level]) {
      return activeLevels.none;
    }
    return activeLevels[level];
  };

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
  }, [sharedGradingData, localGradingData.course.code, localGradingData.course.name, localGradingData.course.instructor, localGradingData.course.term]);

  

  // Auto-populate assignment info when rubric is loaded
  useEffect(() => {
    if (sharedRubric) {
      const initialGrading = {};
      sharedRubric.criteria.forEach(criterion => {
        initialGrading[criterion.id] = {
          criterionId: criterion.id,
          selectedLevel: null,
          customComments: ''
        };
      });

      setLocalGradingData(prevData => ({
        ...prevData,
        assignment: {
          ...prevData.assignment,
          name: sharedRubric.assignmentInfo?.title || prevData.assignment.name,
          maxPoints: sharedRubric.assignmentInfo?.totalPoints || prevData.assignment.maxPoints
        },
        rubricGrading: prevData.rubricGrading && Object.keys(prevData.rubricGrading).length > 0 ? prevData.rubricGrading : initialGrading,
        metadata: {
          ...prevData.metadata,
          rubricIntegrated: true
        }
      }));
    }
  }, [sharedRubric]);

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
}, [currentStudent?.id, getGradeStatus, loadFinalGrade, loadDraft, currentStudent]);

  // Enhanced calculation function
  const calculateTotalScore = () => {
    if (!sharedRubric || !sharedRubric.criteria) return { rawScore: 0, finalScore: 0, penaltyApplied: false, latePolicyDescription: '' };

    let totalRawScore = 0;
    let maxPossiblePoints = 0;

    // Calculate raw score from rubric grading
    sharedRubric.criteria.forEach(criterion => {
      const grading = gradingData.rubricGrading[criterion.id];
      if (grading && grading.selectedLevel && sharedRubric.rubricLevels) {
        const selectedLevel = sharedRubric.rubricLevels.find(level => level.level === grading.selectedLevel);
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
  }, [gradingData.rubricGrading, gradingData.latePolicy, currentLatePolicy, customLatePolicies, sharedRubric]);

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
    if (!sharedRubric) return; // Guard against null rubric

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
    if (!sharedRubric) return; // Guard against null rubric

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

  // Helper function to generate the student report HTML. This avoids code duplication.
  const generateStudentReportHTML = () => {
    const totalScore = scoreSummary.finalScore;
    const rawScore = scoreSummary.rawScore;
    const maxPoints = sharedRubric ? sharedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints;
    const percentage = ((totalScore / (maxPoints || 1)) * 100).toFixed(1);
    const penaltyApplied = scoreSummary.penaltyApplied;

    const attachmentsHTML = gradingData.attachments.map((att, index) => {
      if (att.base64Data) {
        return `<div class="attachment-item"><img src="${att.base64Data}" alt="${att.name}" class="clickable-image" data-index="${index}" style="max-width: 200px; max-height: 200px; object-fit: contain; display: block; margin-bottom: 0.5rem; border: 1px solid #ddd; border-radius: 4px;" /><div style="font-size: 0.875rem; font-weight: 500; word-break: break-word;">${att.name}</div><div style="font-size: 0.75rem; color: #666;">${(att.size / 1024).toFixed(1)} KB</div><div style="font-size: 0.75rem; color: #007bff; margin-top: 4px;">Click to enlarge</div></div>`;
      } else {
        return `<div class="attachment-item"><div style="width: 40px; height: 40px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem auto;">📄</div><div style="font-size: 0.875rem; font-weight: 500; word-break: break-word;">${att.name}</div><div style="font-size: 0.75rem; color: #666;">${(att.size / 1024).toFixed(1)} KB</div></div>`;
      }
    }).join('');

    const videoLinksHTML = gradingData.videoLinks.map(link => `<div class="video-link-item" style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;"><div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;"><span style="font-size: 1.25rem;">🎥</span><strong style="color: #495057;">${link.title}</strong></div><a href="${link.url}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none; word-break: break-all;">${link.url}</a></div>`).join('');

    const rubricTableHTML = sharedRubric ? `
      <div class="rubric-section" style="margin-top: 30px;">
          <h3>📋 Detailed Rubric Assessment</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <strong>Assignment:</strong> ${sharedRubric.assignmentInfo.title}<br>
              <strong>Description:</strong> ${renderFormattedContent(sharedRubric.assignmentInfo.description)}<br>
              <strong>Weight:</strong> ${sharedRubric.assignmentInfo.weight}% of Final Grade<br>
              <strong>Passing Threshold:</strong> ${sharedRubric.assignmentInfo.passingThreshold}%  
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 0.9rem;">
              <thead><tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Criterion</th><th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Max Points</th><th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Level Achieved</th><th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Points Earned</th><th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Assessment & Comments</th></tr></thead>
              <tbody>
                  ${sharedRubric.criteria.map(criterion => {
      const grading = gradingData.rubricGrading[criterion.id];
      const level = grading?.selectedLevel ? sharedRubric.rubricLevels.find(l => l.level === grading.selectedLevel) : null;
      const points = level ? (criterion.maxPoints * level.multiplier).toFixed(1) : '0';
      const levelDescription = level && criterion.levels[level.level] ? renderFormattedContent(criterion.levels[level.level].description) : '';
      const additionalComments = grading?.customComments || '';
      return `<tr><td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"><strong style="color: #2c3e50;">${criterion.name}</strong><br><small style="color: #666; font-style: italic;">${renderFormattedContent(criterion.description)}</small></td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">${criterion.maxPoints}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; ${level ? `background-color: ${level.color}15; color: ${level.color}; font-weight: bold;` : ''}">${level ? level.name : 'Not Assessed'}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; font-size: 1.1em; color: #2c3e50;">${points}</td><td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">${levelDescription ? `<div style="margin-bottom: 10px; padding: 8px; background: #f8f9fa; border-left: 4px solid ${level.color}; border-radius: 4px;"><strong style="color: ${level.color};">Level Description:</strong><br><span style="font-size: 0.85em; line-height: 1.4;">${levelDescription}</span></div>` : ''}${additionalComments ? `<div style="margin-top: 8px; padding: 8px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;"><strong style="color: #856404;">Additional Comments:</strong><br><span style="font-size: 0.85em; line-height: 1.4; white-space: pre-wrap;">${additionalComments}</span></div>` : ''}${(!levelDescription && !additionalComments) ? '<em style="color: #999;">No assessment provided</em>' : ''}</td></tr>`;
    }).join('')}
              </tbody>
          </table>
          <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin-top: 20px;"><h4 style="color: #2e7d32; margin-bottom: 10px;">📊 Rubric Score Summary</h4><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;"><div><strong>Total Score:</strong> ${Math.round(totalScore * 10) / 10} / ${maxPoints}<br><strong>Percentage:</strong> ${percentage}%</div><div><strong>Grade Status:</strong><span style="color: ${percentage >= sharedRubric.assignmentInfo.passingThreshold ? '#4caf50' : '#f44336'}; font-weight: bold;">${percentage >= sharedRubric.assignmentInfo.passingThreshold ? '✓ PASSING' : '✗ NEEDS IMPROVEMENT'}</span></div>${penaltyApplied ? `<div style="color: #ff9800;"><strong>Late Penalty Applied:</strong><br>Raw Score: ${Math.round(rawScore * 10) / 10}</div>` : ''}</div></div>
      </div>` : '';

    const getSafeLatePolicy = (level, policyId) => {
      const policy = getPolicyById(policyId) || currentLatePolicy || DEFAULT_LATE_POLICY;
      const activeLevels = policy.levels || DEFAULT_LATE_POLICY.levels;
      if (!level || typeof level !== "string" || !activeLevels[level]) {
        return activeLevels.none;
      }
      return activeLevels[level];
    };

    const getPolicyById = (policyId) => {
      if (!policyId) return null;
      if (policyId === DEFAULT_LATE_POLICY.id) return DEFAULT_LATE_POLICY;
      return customLatePolicies.find(p => p.id === policyId) || null;
    };

    const htmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Grade Report - ${gradingData.student.name}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:20px auto;padding:20px;line-height:1.6}.header{background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:30px}.score-summary{background:#e8f5e8;border:2px solid #4caf50;border-radius:8px;padding:20px;margin:20px 0;text-align:center}.late-policy-section{margin:30px 0;background:#fff5f5;border:1px solid #f87171;border-radius:8px;padding:20px}.feedback-section{margin:20px 0;padding:15px;background:#f9f9f9;border-radius:8px}.attachments{margin:30px 0}.attachment-item{display:inline-block;text-align:center;margin:1rem;padding:1rem;background:#fff;border:1px solid #ddd;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,.1);max-width:250px;vertical-align:top}.clickable-image{cursor:pointer;transition:all .3s ease;position:relative}.clickable-image:hover{transform:scale(1.05);box-shadow:0 4px 8px rgba(0,0,0,.2)}.video-links{margin:30px 0}.video-link-item{margin-bottom:1rem}.video-link-item a{color:#007bff;text-decoration:none}.video-link-item a:hover{text-decoration:underline}h1,h2,h3{color:#333}.image-modal{display:none;position:fixed;z-index:1000;left:0;top:0;width:100%;height:100%;background-color:rgba(0,0,0,.9);animation:fadeIn .3s ease}.image-modal.show{display:flex;align-items:center;justify-content:center}.modal-content{max-width:95%;max-height:95%;object-fit:contain;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.5);animation:zoomIn .3s ease}.close-modal{position:absolute;top:20px;right:30px;color:#fff;font-size:40px;font-weight:700;cursor:pointer;z-index:1001;background:rgba(0,0,0,.5);border-radius:50%;width:50px;height:50px;display:flex;align-items:center;justify-content:center;line-height:1}.close-modal:hover{background:rgba(0,0,0,.8)}.modal-caption{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#fff;background:rgba(0,0,0,.7);padding:10px 20px;border-radius:6px;text-align:center;max-width:80%}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes zoomIn{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}@media print{.attachment-item,.video-link-item{break-inside:avoid}.image-modal{display:none!important}}</style></head><body><div class="header"><h1>📋 Grade Report</h1><p><strong>Student:</strong> ${gradingData.student.name} (${gradingData.student.id})</p><p><strong>Course:</strong> ${gradingData.course?.code ?? ''} - ${gradingData.course?.name ?? ''}</p><p><strong>Assignment:</strong> ${gradingData.assignment.name}</p><p><strong>Instructor:</strong> ${gradingData.course?.instructor ?? ''}</p><p><strong>Term:</strong> ${gradingData.course?.term ?? ''}</p></div><div class="score-summary"><h2>📊 Final Score</h2><div style="font-size:2rem;font-weight:700;color:#2e7d32;margin:15px 0">${totalScore.toFixed(1)} / ${maxPoints} (${percentage}%)</div><p style="margin:10px 0;color:#555">${sharedRubric ? `Rubric: ${sharedRubric.assignmentInfo.title}` : ""}${penaltyApplied ? ` | Late Policy: ${getSafeLatePolicy(gradingData.latePolicy?.level).name}` : ""}</p></div>${penaltyApplied ? `<div class="late-policy-section"><h3 style="color:#dc2626">📅 Late Submission Policy Applied</h3><p><strong>Policy Status:</strong> ${getSafeLatePolicy(gradingData.latePolicy?.level).name}</p><p>${getSafeLatePolicy(gradingData.latePolicy?.level).description}</p><p><strong>Raw Score:</strong> ${Math.round(rawScore * 10) / 10}/${maxPoints} → <strong>Final Score:</strong> ${Math.round(totalScore * 10) / 10}/${maxPoints}</p></div>` : ""}${rubricTableHTML}${Object.entries(gradingData.feedback).filter(([e, t]) => t).map(([e, t]) => `<div class="feedback-section"><h3>${e.charAt(0).toUpperCase() + e.slice(1)} Feedback</h3><p>${t.replace(/\n/g, "<br>")}</p></div>`).join("")}${attachmentsHTML ? `<div class="attachments"><h3>📎 File Attachments</h3><div style="display: flex; flex-wrap: wrap; justify-content: flex-start;">${attachmentsHTML}</div></div>` : ""}${videoLinksHTML ? `<div class="video-links"><h3>🎥 Video Review Links</h3>${videoLinksHTML}</div>` : ""}<p style="margin-top:40px;text-align:center;color:#666;font-size:.9rem">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p><div id="imageModal" class="image-modal"><span class="close-modal" onclick="closeImageModal()">&times;</span><img class="modal-content" id="modalImage"><div class="modal-caption" id="modalCaption"></div></div><script>const attachmentData=${JSON.stringify(gradingData.attachments)};function openImageModal(e,t){const n=document.getElementById("imageModal"),o=document.getElementById("modalImage"),a=document.getElementById("modalCaption");n.classList.add("show"),o.src=e,a.textContent=t,document.body.style.overflow="hidden"}function closeImageModal(){document.getElementById("imageModal").classList.remove("show"),document.body.style.overflow="auto"}document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll(".clickable-image").forEach(e=>{e.addEventListener("click",function(){const e=parseInt(this.getAttribute("data-index")),t=attachmentData[e];t&&t.base64Data&&openImageModal(t.base64Data,t.name)})}),document.getElementById("imageModal").addEventListener("click",function(e){e.target===this&&closeImageModal()}),document.addEventListener("keydown",function(e){"Escape"===e.key&&closeImageModal()})})</script></body></html>`;

    return htmlContent;
  };

  // AI FEEDBACK EXPORT FUNCTIONS
  const exportAIFeedbackData = () => {
    if (!localGradingData.student?.name) {
      alert('Please ensure student information is loaded before exporting for AI feedback.');
      return;
    }

    // Calculate scores
    const maxPoints = sharedRubric ? sharedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints;
    const percentage = maxPoints > 0 ? (scoreSummary.finalScore / maxPoints * 100).toFixed(1) : 0;

    // Build criteria performance data
    const criteriaPerformance = (sharedRubric && sharedRubric.criteria) ? sharedRubric.criteria.map(criterion => {
      const grading = gradingData.rubricGrading[criterion.id];
      const selectedLevel = (grading?.selectedLevel && sharedRubric.rubricLevels) ?
        sharedRubric.rubricLevels.find(level => level.level === grading.selectedLevel) : null;

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
        title: localGradingData.assignment.name || (sharedRubric?.assignmentInfo?.title),
        description: sharedRubric?.assignmentInfo?.description || '',
        totalPoints: maxPoints,
        passingThreshold: sharedRubric?.assignmentInfo?.passingThreshold || 60,
        dueDate: localGradingData.assignment.dueDate
      },
      gradeData: {
        overallScore: Math.round(scoreSummary.finalScore * 10) / 10,
        rawScore: Math.round(scoreSummary.rawScore * 10) / 10,
        overallPercentage: percentage,
        letterGrade: getLetterGrade(percentage),
        passed: percentage >= (sharedRubric?.assignmentInfo?.passingThreshold || 60),
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
        rubricUsed: sharedRubric?.assignmentInfo?.title || 'Custom Rubric',
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

        if (!rubricData.assignmentInfo || !rubricData.criteria || !rubricData.rubricLevels) {
          alert('Invalid rubric format. Please ensure the rubric contains assignmentInfo, criteria, and rubricLevels.');
          return;
        }

        setSharedRubric(rubricData); // This is the only state update needed now
        alert(`Rubric "${rubricData.assignmentInfo.title}" loaded successfully!`);

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
    const percentage = sharedRubric ?
      (score.finalScore / sharedRubric.assignmentInfo.totalPoints * 100).toFixed(1) : 0;
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
      rubric: sharedRubric,
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
  const handlePreviousStudent = () => {
    if (currentStudent?.id) {
      saveDraft(currentStudent.id, localGradingData);
    }
    const success = previousStudentInSession();
    if (!success) {
      console.log('Already at first student or no active session');
    }
  };

  const handleNextStudent = () => {
    if (currentStudent?.id) {
      saveDraft(currentStudent.id, localGradingData);
    }
    const success = nextStudentInSession();
    if (!success) {
      console.log('Already at last student or no active session');
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

  const handleNextStudentAsDraft = () => {
    if (currentStudent?.id) {
      console.log('💾 Saving as draft for student:', currentStudent.name);
      saveDraft(currentStudent.id, localGradingData);
    }
    const success = nextStudentInSession('draft');
    if (!success) {
      alert('Grading session completed! All students have been graded.');
      setActiveTab('class-manager');
    } else {
      resetGradingForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log('✅ Draft saved, moved to next student (and scrolled to top)');
    }
  };

  const getCurrentStudentInfo = () => {
    if (!gradingSession?.active || !gradingSession.classListData?.students || !currentStudent) {
      return null;
    }
    const totalStudents = gradingSession.classListData.students.length;
    const currentIndex = gradingSession.currentStudentIndex || 0;
    return {
      student: currentStudent,
      position: currentIndex + 1,
      total: totalStudents,
      isFirst: currentIndex === 0,
      isLast: currentIndex >= totalStudents - 1
    };
  };

  const currentStudentInfo = getCurrentStudentInfo();

  const handleNextStudentAsFinal = () => {
    if (currentStudent?.id) {
      console.log('✅ Finalizing grade for student:', currentStudent.name);
      const finalGradeData = {
        ...localGradingData,
        totalScore: getTotalScore(),
        metadata: {
          ...localGradingData.metadata,
          gradedDate: new Date().toISOString(),
          rubricIntegrated: !!sharedRubric
        }
      };
      saveFinalGrade(currentStudent.id, finalGradeData);
    }
    const success = nextStudentInSession('final');
    if (!success) {
      alert('Grading session completed! All students have been graded.');
      setActiveTab('class-manager');
    } else {
      resetGradingForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log('✅ Final grade saved, moved to next student (and scrolled to top)');
    }
  };

  const resetGradingForm = () => {
    const initialRubricGrading = {};
    if (sharedRubric) {
      sharedRubric.criteria.forEach(criterion => {
        initialRubricGrading[criterion.id] = {
          criterionId: criterion.id,
          selectedLevel: null,
          customComments: ''
        };
      });
    }
    setLocalGradingData(prev => ({
      ...prev,
      course: sharedCourseDetails?.course ?? prev.course,
      assignment: sharedCourseDetails?.assignment ?? prev.assignment,
      feedback: { general: '', strengths: '', improvements: '' },
      attachments: [],
      videoLinks: [],
      latePolicy: { level: 'none', penaltyApplied: false },
      rubricGrading: initialRubricGrading
    }));
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
  if (!sharedRubric) {
    return (
      <div style={{
        padding: '2rem',
        maxWidth: '1440px',
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
      maxWidth: '1340px',
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

        <div style={{ display: 'flex', gap: '0.75rem' }}>
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
              background: '#7c3aed',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
            title="Export grade data and AI prompt for generating personalized feedback"
          >
            <Bot size={16} />
            Export for AI Feedback
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
      {sharedRubric && (
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
            Current Rubric: {sharedRubric.assignmentInfo.title}
          </h2>
          <p style={{ color: '#1e40af', margin: 0, fontSize: '0.9rem' }}>
            {sharedRubric.assignmentInfo.description || 'No description provided'}
          </p>
          <div style={{
            display: 'flex',
            gap: '2rem',
            marginTop: '0.75rem',
            fontSize: '0.875rem',
            color: '#1d4ed8'
          }}>
            <span><strong>Weight:</strong> {sharedRubric.assignmentInfo?.weight || 0}%</span>
            <span><strong>Total Points:</strong> {sharedRubric.assignmentInfo?.totalPoints || 0}</span>
            <span><strong>Passing:</strong> {sharedRubric.assignmentInfo?.passingThreshold || 0}%</span>
            <span><strong>Criteria:</strong> {sharedRubric.criteria?.length || 0}</span>
          </div>
        </div>
      )}

      {/* Grading Session Status */}
      {gradingSession && gradingSession.classListData?.students && (
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
                Student {gradingSession.currentStudentIndex + 1} of {gradingSession.classListData.students.length || 0}:
                <strong> {gradingSession.classListData.students[gradingSession.currentStudentIndex]?.name || 'Unknown'}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handlePreviousStudent}
                disabled={gradingSession.currentStudentIndex === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 1rem',
                  background: gradingSession.currentStudentIndex === 0 ? '#f3f4f6' : '#10b981',
                  color: gradingSession.currentStudentIndex === 0 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: gradingSession.currentStudentIndex === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                <SkipBack size={16} />
                Previous
              </button>

              <button
                onClick={() => {
                  updateGradingSession({ active: false });
                  setActiveTab('class-manager');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 1rem',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <Pause size={16} />
                Pause Session
              </button>

              <button
                onClick={handleNextStudent}
                disabled={gradingSession.currentStudentIndex >= (gradingSession.classListData.students.length || 0) - 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 1rem',
                  background: gradingSession.currentStudentIndex >= (gradingSession.classListData.students.length || 0) - 1 ? '#f3f4f6' : '#10b981',
                  color: gradingSession.currentStudentIndex >= (gradingSession.classListData.students.length || 0) - 1 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: gradingSession.currentStudentIndex >= (gradingSession.classListData.students.length || 0) - 1 ? 'not-allowed' : 'pointer',
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
      
      {sharedRubric && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#15803d', marginBottom: '0.5rem' }}>
                📋 Active Assignment Rubric
              </h3>
              <p style={{ color: '#16a34a', fontWeight: '600', fontSize: '1.1rem' }}>
                {sharedRubric.assignmentInfo.title}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#059669' }}>
                {renderFormattedContent(sharedRubric.assignmentInfo.description)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: '#059669' }}>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Weight:</strong> {sharedRubric.assignmentInfo.weight}% of Final Grade
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Passing:</strong> {sharedRubric.assignmentInfo.passingThreshold}%
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Total Points:</strong> {sharedRubric.assignmentInfo.totalPoints}
                </p>
              </div>
            </div>
          </div>

          {/* Rubric Grading Interface */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {sharedRubric.criteria.map((criterion) => {
              const currentGrading = gradingData.rubricGrading && gradingData.rubricGrading[criterion.id];
              const showComments = showRubricComments[criterion.id];

              return (
                <div key={criterion.id} style={{
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
                        {criterion.name}
                        <span style={{ color: '#3b82f6', marginLeft: '0.5rem' }}>
                          ({criterion.maxPoints} pts)
                        </span>
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        {renderFormattedContent(criterion.description)}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowRubricComments(prev => ({
                        ...prev,
                        [criterion.id]: !prev[criterion.id]
                      }))}
                      style={{
                        color: '#3b82f6',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.875rem',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        marginLeft: '1rem'
                      }}
                    >
                      {showComments ? 'Hide' : 'Show'} Level Details
                    </button>
                  </div>

                  {/* Level Selection */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    {sharedRubric.rubricLevels.map((level) => {
                      const isSelected = currentGrading?.selectedLevel === level.level;
                      const points = Math.round(criterion.maxPoints * level.multiplier);

                      return (
                        <button
                          key={level.level}
                          onClick={() => updateRubricGrading(criterion.id, level.level)}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: `2px solid ${isSelected ? level.color : '#d1d5db'}`,
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: isSelected ? level.color : 'white',
                            color: isSelected ? 'white' : '#374151',
                            transform: isSelected ? 'scale(1.05)' : 'none',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontWeight: '600' }}>{level.name}</div>
                          <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {level.level === 'incomplete' ? '0' : points} pts
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Level Descriptions */}
                  {showComments && (
                    <div style={{
                      background: '#f9fafb',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <h5 style={{ fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                        Level Descriptions:
                      </h5>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '0.75rem'
                      }}>
                        {sharedRubric.rubricLevels.map((level) => (
                          <div
                            key={level.level}
                            style={{
                              background: 'white',
                              borderRadius: '0.25rem',
                              border: '1px solid #d1d5db',
                              borderLeft: `4px solid ${level.color}`,
                              padding: '0.75rem'
                            }}
                          >
                            <div style={{ fontWeight: '500', fontSize: '0.875rem', color: level.color }}>
                              {level.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                              {criterion.levels[level.level]?.pointRange} pts
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#374151' }}>
                              {renderFormattedContent(criterion.levels[level.level]?.description)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Comments */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Additional Comments:
                    </label>

                    {/* Quick Feedback Dropdowns */}
                    {criterion.feedbackLibrary && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        {Object.entries(criterion.feedbackLibrary).map(([category, comments]) => (
                          <select
                            key={category}
                            onChange={(e) => {
                              if (e.target.value) {
                                addCriterionFeedback(criterion.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            defaultValue=""
                            style={{
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">Add {category}...</option>
                            {comments.map((comment, idx) => (
                              <option key={idx} value={comment}>{renderFormattedContent(comment)}</option>
                            ))}
                          </select>
                        ))}
                      </div>
                    )}

                    <textarea
                      value={currentGrading?.customComments || ''}
                      onChange={(e) => updateRubricGrading(criterion.id, currentGrading?.selectedLevel, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        resize: 'none',
                        minHeight: '80px'
                      }}
                      rows="3"
                      placeholder="Add specific feedback for this criterion..."
                    />
                  </div>

                  {/* Selected Level Feedback */}
                  {currentGrading?.selectedLevel && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      background: '#eff6ff',
                      borderRadius: '0.25rem',
                      border: '1px solid #bfdbfe'
                    }}>
                      <div style={{ fontSize: '0.875rem' }}>
                        <strong>Selected Level:</strong> {sharedRubric.rubricLevels.find(l => l.level === currentGrading.selectedLevel)?.name}
                        {' '}({criterion.levels[currentGrading.selectedLevel]?.pointRange} pts)
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#374151', marginTop: '0.25rem' }}>
                        {renderFormattedContent(criterion.levels[currentGrading.selectedLevel]?.description)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Rubric Summary */}
          <div style={{
            marginTop: '1.5rem',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
                  Rubric Score Summary
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Based on selected levels across all criteria
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>
                  {Math.round(scoreSummary.finalScore * 10) / 10}/{sharedRubric.assignmentInfo.totalPoints}
                </div>
                <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>
                  ({Math.round((scoreSummary.finalScore / (sharedRubric.assignmentInfo.totalPoints || 1)) * 1000) / 10}%)
                </div>
                {scoreSummary.penaltyApplied && (
                  <div style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '0.25rem' }}>
                    Raw: {Math.round(scoreSummary.rawScore * 10) / 10} (Late Penalty Applied)
                  </div>
                )}
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: (scoreSummary.finalScore / (sharedRubric.assignmentInfo.totalPoints || 1)) * 100 >= sharedRubric.assignmentInfo.passingThreshold
                    ? '#16a34a' : '#dc2626'
                }}>
                  {(scoreSummary.finalScore / (sharedRubric.assignmentInfo.totalPoints || 1)) * 100 >= sharedRubric.assignmentInfo.passingThreshold
                    ? '✓ PASSING' : '✗ NEEDS IMPROVEMENT'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    

      {/* Enhanced Complete and Grade Next Section */}
      {sharedRubric && (gradingData.student?.name || currentStudent) && (
        <div style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: '2px solid #10b981',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#047857', marginBottom: '1rem' }}>
            Ready to move to the next student?
          </h3>
          <p style={{ color: '#065f46', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Choose how to save the current grading before proceeding.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Save as Draft Button */}
            <button
              onClick={handleNextStudentAsDraft}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(251, 191, 36, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(251, 191, 36, 0.4)';
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>📝</span>
              Save & Grade Next Student
            </button>

            {/* Finalize & Grade Next Button */}
            <button
              onClick={handleNextStudentAsFinal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
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
              <span style={{ fontSize: '1.1rem' }}>✅</span>
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

      {/* Score Summary */}
      <div style={{
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        border: '1px solid #bbf7d0',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#15803d', marginBottom: '1rem' }}>
          📊 Final Score
        </h2>
        <div style={{ fontSize: '3rem', fontWeight: '700', color: '#16a34a', marginBottom: '1rem' }}>
          {Math.round(scoreSummary.finalScore * 10) / 10}
          <span style={{ fontSize: '1.5rem', color: '#6b7280' }}>
            / {sharedRubric ? sharedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints}
          </span>
        </div>
        <div style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '1rem' }}>
          ({Math.round((scoreSummary.finalScore / (sharedRubric ? (sharedRubric.assignmentInfo.totalPoints || 1) : (gradingData.assignment.maxPoints || 1))) * 1000) / 10}%)
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {sharedRubric && (
            <div style={{
              fontSize: '0.875rem',
              background: '#dcfce7',
              color: '#15803d',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem'
            }}>
              📋 Rubric Assessment Active
            </div>
          )}
          {scoreSummary.penaltyApplied && (
            <div style={{
              fontSize: '0.875rem',
              background: '#fee2e2',
              color: '#dc2626',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem'
            }}>
              ⏰ Late Penalty Applied
            </div>
          )}
          {gradingSession && gradingSession.classListData?.students && (
            <div style={{
              fontSize: '0.875rem',
              background: '#dbeafe',
              color: '#2563eb',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem'
            }}>
              👥 Batch Session Active
            </div>
          )}
        </div>
      </div>

      {/* Save Draft Section */}
      {currentStudent && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '1px solid #f59e0b',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#92400e', marginBottom: '0.75rem' }}>
            💾 Save Your Progress
          </h3>
          <p style={{ color: '#a16207', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Saves your work on the current student without navigating away from the page.
          </p>
          <button
            onClick={() => {
              if (currentStudent?.id) {
                saveDraft(currentStudent.id, localGradingData);
                // Show success feedback
                const button = document.activeElement;
                const originalText = button.innerHTML;
                const originalBg = button.style.background;
                button.innerHTML = '<span style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>Draft Saved!</span>';
                button.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                setTimeout(() => {
                  button.innerHTML = originalText;
                  button.style.background = originalBg;
                }, 2000);
              }
            }}
            disabled={!currentStudent?.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: currentStudent?.id ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : '#9ca3af',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: currentStudent?.id ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
              fontWeight: '600',
              boxShadow: currentStudent?.id ? '0 4px 12px rgba(245, 158, 11, 0.4)' : 'none',
              transform: 'translateY(0)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (currentStudent?.id) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.5)';
              }
            }}
            onMouseOut={(e) => {
              if (currentStudent?.id) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
              }
            }}
            title={currentStudent?.id ? 'Save current grading progress' : 'No student selected to save'}
          >
            <Save size={20} />
            Save Draft
          </button>
          {!currentStudent?.id && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#6b7280' }}>
              Select a student from the Class Manager to enable draft saving
            </p>
          )}
        </div>
      )}

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
                      padding: '1.5rem',
                      textAlign: 'center'
                    }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileUpload} // Pass the function directly
                      style={{ display: 'none' }}
                    />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: '#3b82f6',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          cursor: 'pointer',
                          margin: '0 auto'
                        }}
                      >
                        <Plus size={20} />
                        Add Files
                      </button>
                      <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                        Upload images, documents, or other files relevant to the assignment
                      </p>
                    </div>
      
                    {gradingData.attachments.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                          Uploaded Files ({gradingData.attachments.length})
                        </h4>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: '1rem'
                        }}>
                          {gradingData.attachments.map((file) => (
                            <div key={file.id} style={{
                              border: '1px solid #d1d5db',
                              borderRadius: '0.5rem',
                              overflow: 'hidden',
                              background: 'white'
                            }}>
                              {file.type.startsWith('image/') ? (
                                <div style={{ position: 'relative' }}>
                                  <img
                                    src={file.base64Data || URL.createObjectURL(file.file)}
                                    alt={file.name}
                                    style={{
                                      width: '100%',
                                      height: '150px',
                                      objectFit: 'cover'
                                    }}
                                  />
                                  <button
                                    onClick={() => removeAttachment(file.id)}
                                    style={{
                                      position: 'absolute',
                                      top: '0.5rem',
                                      right: '0.5rem',
                                      background: '#dc2626',
                                      color: 'white',
                                      borderRadius: '50%',
                                      width: '24px',
                                      height: '24px',
                                      border: 'none',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <div style={{ padding: '1rem' }}>
                                  <FileText size={40} style={{ color: '#6b7280', margin: '0 auto 0.5rem auto', display: 'block' }} />
                                </div>
                              )}
                              <div style={{ padding: '0.75rem' }}>
                                <p style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                  {file.name}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                                {!file.type.startsWith('image/') && (
                                  <button
                                    onClick={() => removeAttachment(file.id)}
                                    style={{
                                      marginTop: '0.5rem',
                                      color: '#dc2626',
                                      background: 'none',
                                      border: 'none',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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