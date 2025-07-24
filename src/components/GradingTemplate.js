import React, { useState, useRef, useEffect } from 'react';
import {
  Download, Upload, FileText, Video, Plus, X, Save, FileDown, Bot,
  ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Users, PlayCircle,
  CheckCircle, Clock, SkipForward, SkipBack, Pause, RotateCcw
} from 'lucide-react';
import { useAssessment } from './SharedContext';

// Sample comprehensive rubric from the PDF
const sampleRubric = {
  assignmentInfo: {
    title: "Digital Portfolio Project - Final Showcase",
    description: "Students will create a comprehensive digital portfolio showcasing their best work from the semester, including 5-7 completed projects with professional presentation, artist statements, and technical documentation. The portfolio must demonstrate growth, technical proficiency, and creative vision suitable for industry presentation.",
    weight: 30,
    passingThreshold: 65,
    totalPoints: 120
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
      id: 'technical-proficiency',
      name: 'Technical Proficiency & Craft',
      description: 'Demonstration of technical skills, software mastery, and attention to detail in execution',
      maxPoints: 35,
      weight: 29,
      levels: {
        incomplete: { description: 'No technical work submitted or files corrupted/unusable.', pointRange: '0' },
        unacceptable: { description: 'Severe technical issues: poor resolution, improper file formats, broken links, or significant software handling problems that interfere with viewing work.', pointRange: '8-12' },
        developing: { description: 'Basic technical competency shown but with noticeable issues: inconsistent quality, some resolution problems, or workflow inefficiencies. Software use shows beginner-level understanding.', pointRange: '16-21' },
        acceptable: { description: 'Solid technical foundation with appropriate file formats, good resolution, and functional navigation. Demonstrates competent use of course software with minimal technical distractions.', pointRange: '22-26' },
        emerging: { description: 'Strong technical execution with excellent file management, optimized formats, and smooth user experience. Shows advanced software techniques and professional workflow habits.', pointRange: '27-30' },
        accomplished: { description: 'High-level technical mastery with innovative use of tools, excellent optimization, and seamless integration of multiple software platforms. Technical choices enhance artistic vision.', pointRange: '31-33' },
        exceptional: { description: 'Exceptional technical virtuosity demonstrating mastery of advanced techniques, custom solutions, and industry-standard workflows. Technical execution elevates the artistic content to professional levels.', pointRange: '34-35' }
      },
      feedbackLibrary: {
        strengths: [
          'Excellent file management and organization',
          'Professional-quality technical execution',
          'Innovative use of software tools',
          'Seamless integration across platforms'
        ],
        improvements: [
          'Optimize file sizes for web delivery',
          'Improve resolution consistency',
          'Review proper file naming conventions',
          'Consider mobile responsiveness'
        ],
        general: [
          'Technical skills show strong development',
          'Consider exploring advanced techniques',
          'Portfolio demonstrates software competency'
        ]
      }
    },
    {
      id: 'creative-vision',
      name: 'Creative Vision & Artistic Development',
      description: 'Originality, artistic voice, conceptual depth, and evolution of creative ideas',
      maxPoints: 30,
      weight: 25,
      levels: {
        incomplete: { description: 'No creative work presented or completely derivative.', pointRange: '0' },
        unacceptable: { description: 'Limited creativity with heavy reliance on tutorials or templates. Little evidence of personal artistic voice or original thinking.', pointRange: '7-10' },
        developing: { description: 'Some original ideas present but inconsistent development. Creative choices show potential but lack depth or coherent vision.', pointRange: '13-17' },
        acceptable: { description: 'Clear creative direction with personal style emerging. Shows good problem-solving and conceptual thinking with adequate originality.', pointRange: '18-22' },
        emerging: { description: 'Strong creative vision with distinctive personal style. Demonstrates innovative thinking and sophisticated conceptual development.', pointRange: '23-26' },
        accomplished: { description: 'Exceptional creative development with unique artistic voice. Shows mastery of design principles and innovative approaches to visual communication.', pointRange: '27-29' },
        exceptional: { description: 'Outstanding creative vision that pushes boundaries and demonstrates professional-level artistic development. Highly original and conceptually sophisticated.', pointRange: '30' }
      },
      feedbackLibrary: {
        strengths: [
          'Strong personal artistic voice',
          'Innovative conceptual approaches',
          'Excellent visual storytelling',
          'Distinctive creative style'
        ],
        improvements: [
          'Develop concepts more thoroughly',
          'Push creative boundaries further',
          'Strengthen visual hierarchy',
          'Consider audience engagement'
        ],
        general: [
          'Creative development shows strong growth',
          'Portfolio demonstrates artistic maturity',
          'Conceptual thinking is well-developed'
        ]
      }
    },
    {
      id: 'portfolio-presentation',
      name: 'Portfolio Presentation & Organization',
      description: 'Professional presentation, layout design, navigation, and overall user experience',
      maxPoints: 25,
      weight: 21,
      levels: {
        incomplete: { description: 'No organized presentation or completely inaccessible.', pointRange: '0' },
        unacceptable: { description: 'Poor organization with confusing navigation, inconsistent layout, or significant usability issues.', pointRange: '6-9' },
        developing: { description: 'Basic organization present but with layout inconsistencies or navigation problems. Shows understanding of presentation but needs refinement.', pointRange: '11-15' },
        acceptable: { description: 'Well-organized portfolio with clear navigation and consistent presentation. Professional appearance with good user experience.', pointRange: '16-19' },
        emerging: { description: 'Excellent presentation with sophisticated layout design, intuitive navigation, and engaging user interface.', pointRange: '20-22' },
        accomplished: { description: 'Exceptional presentation quality with innovative design solutions and seamless user experience. Portfolio itself demonstrates design mastery.', pointRange: '23-24' },
        exceptional: { description: 'Outstanding presentation that sets new standards for portfolio design. Every aspect contributes to a cohesive, professional brand experience.', pointRange: '25' }
      },
      feedbackLibrary: {
        strengths: [
          'Excellent visual hierarchy',
          'Professional layout design',
          'Intuitive navigation system',
          'Consistent branding throughout'
        ],
        improvements: [
          'Improve loading times',
          'Enhance mobile responsiveness',
          'Clarify navigation structure',
          'Strengthen visual consistency'
        ],
        general: [
          'Portfolio presentation is professional',
          'Layout demonstrates design understanding',
          'User experience is well-considered'
        ]
      }
    },
    {
      id: 'written-reflection',
      name: 'Written Reflection & Artist Statements',
      description: 'Quality of written analysis, self-reflection, and articulation of artistic process',
      maxPoints: 20,
      weight: 17,
      levels: {
        incomplete: { description: 'No written reflection provided.', pointRange: '0' },
        unacceptable: { description: 'Minimal or superficial writing with poor grammar and little insight into artistic process.', pointRange: '5-7' },
        developing: { description: 'Basic reflection with some insight but lacking depth or clear articulation of artistic development.', pointRange: '9-12' },
        acceptable: { description: 'Good written reflection that demonstrates understanding of artistic process and clear communication of ideas.', pointRange: '13-15' },
        emerging: { description: 'Strong written analysis with thoughtful reflection on artistic growth and articulate discussion of creative decisions.', pointRange: '16-17' },
        accomplished: { description: 'Exceptional written work that demonstrates deep understanding of artistic practice and sophisticated communication skills.', pointRange: '18-19' },
        exceptional: { description: 'Outstanding written reflection that contributes significantly to understanding of artistic development and creative practice.', pointRange: '20' }
      },
      feedbackLibrary: {
        strengths: [
          'Thoughtful artistic reflection',
          'Clear communication of ideas',
          'Strong analytical thinking',
          'Professional writing quality'
        ],
        improvements: [
          'Develop ideas more thoroughly',
          'Improve grammar and syntax',
          'Add more specific examples',
          'Strengthen conclusion'
        ],
        general: [
          'Written work shows good reflection',
          'Communication skills are developing',
          'Artistic awareness is evident'
        ]
      }
    },
    {
      id: 'professional-readiness',
      name: 'Professional Readiness & Industry Standards',
      description: 'Adherence to professional standards, industry practices, and career preparation',
      maxPoints: 10,
      weight: 8,
      levels: {
        incomplete: { description: 'No evidence of professional preparation.', pointRange: '0' },
        unacceptable: { description: 'Little attention to professional standards or industry expectations.', pointRange: '2-3' },
        developing: { description: 'Some awareness of professional practices but inconsistent application.', pointRange: '4-6' },
        acceptable: { description: 'Good understanding of professional standards with appropriate presentation for industry viewing.', pointRange: '7-8' },
        emerging: { description: 'Strong professional preparation with portfolio ready for industry presentation.', pointRange: '8-9' },
        accomplished: { description: 'Exceptional professional readiness exceeding industry standards.', pointRange: '9-10' },
        exceptional: { description: 'Outstanding professional preparation that demonstrates career readiness.', pointRange: '10' }
      },
      feedbackLibrary: {
        strengths: [
          'Industry-ready presentation',
          'Professional attention to detail',
          'Strong career preparation',
          'Excellent professional standards'
        ],
        improvements: [
          'Research industry standards',
          'Improve professional presentation',
          'Add career preparation elements',
          'Consider industry feedback'
        ],
        general: [
          'Shows strong professional development',
          'Portfolio demonstrates career readiness',
          'Professional standards are evident'
        ]
      }
    }
  ]
};

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
    getGradeStatus
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

  // Rubric-specific state
  const [loadedRubric, setLoadedRubric] = useState(() => {
    return sharedRubric || sampleRubric;
  });
  const [showRubricComments, setShowRubricComments] = useState({});
  const [showHeaderGuide, setShowHeaderGuide] = useState(false);

  const fileInputRef = useRef(null);
  const moduleInputRef = useRef(null);
  const rubricInputRef = useRef(null);

  // Video link management
  const [videoLinkInput, setVideoLinkInput] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  // **FIXED: Enhanced shared data synchronization**
  // Sync with sharedGradingData (updated by initializeGradingSession)
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
  }, [sharedGradingData?.course?.code, sharedGradingData?.course?.name,
  sharedGradingData?.course?.instructor, sharedGradingData?.course?.term]);

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

  // ── When we get new sharedCourseDetails, merge them in
  useEffect(() => {
    if (!sharedCourseDetails) return;
    setLocalGradingData(prev => ({
      ...prev,
      student: sharedCourseDetails.student || prev.student,
      course: sharedCourseDetails.course || prev.course,
      assignment: sharedCourseDetails.assignment || prev.assignment
    }));
  }, [sharedCourseDetails]);

  // Load shared data when available
  useEffect(() => {
    if (sharedRubric) {
      setLoadedRubric(sharedRubric);
    }
  }, [sharedRubric]);

  // ── When student changes, load any saved draft/final but keep course+assignment
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
        ...saved,
        student: currentStudent,
        course: prev.course,
        assignment: prev.assignment,
        metadata: prev.metadata
      }));
      setVideoLinkInput('');
      setVideoTitle('');
    } else {
      resetGradingForm();
    }
  }, [currentStudent, getGradeStatus, loadDraft, loadFinalGrade]);


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
  const getSafeLatePolicy = (level) => {
    if (!level || typeof level !== "string" || !latePolicyLevels[level]) {
      return latePolicyLevels.none;
    }
    return latePolicyLevels[level];
  };

  useEffect(() => {
    if (loadedRubric) {
      const initialGrading = {};
      loadedRubric.criteria.forEach(criterion => {
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
          name: loadedRubric.assignmentInfo?.title || prevData.assignment.name,
          maxPoints: loadedRubric.assignmentInfo?.totalPoints || prevData.assignment.maxPoints
        },
        rubricGrading: prevData.rubricGrading && Object.keys(prevData.rubricGrading).length > 0 ? prevData.rubricGrading : initialGrading,
        metadata: {
          ...prevData.metadata,
          rubricIntegrated: true
        }
      }));
    }
  }, [loadedRubric]);

  useEffect(() => {
    if (currentStudent?.id) {
      console.log('🔍 Loading data for student:', currentStudent.name);
      const gradeStatus = getGradeStatus(currentStudent.id);
      console.log('📊 Grade status:', gradeStatus);
      let savedData = null;

      if (gradeStatus === 'final') {
        savedData = loadFinalGrade ? loadFinalGrade(currentStudent.id) : null;
        console.log('📋 Loading final grade data:', savedData ? 'FOUND' : 'NOT FOUND');
      } else if (gradeStatus === 'draft') {
        savedData = loadDraft(currentStudent.id);
        console.log('📝 Loading draft data:', savedData ? 'FOUND' : 'NOT FOUND');
      }

      if (savedData) {
        const validLevels = ["none", "within24", "after24"];
        if (savedData.latePolicy && !validLevels.includes(savedData.latePolicy.level)) {
          savedData.latePolicy.level = "none";
        }
        console.log('✅ Successfully loaded saved grade data');
        setLocalGradingData(prevData => ({
          ...savedData,
          course: prevData.course,
          assignment: prevData.assignment,
          student: currentStudent,
          metadata: prevData.metadata
        }));
        setVideoLinkInput('');
        setVideoTitle('');
      } else {
        console.log('🆕 No saved data found, starting fresh');
        resetGradingForm();
      }
    }
  }, [currentStudent, getGradeStatus, loadDraft, loadFinalGrade]);
useEffect(() => {
  if (gradingData.latePolicy && !latePolicyLevels[gradingData.latePolicy.level]) {
    console.warn("Invalid late policy level detected:", gradingData.latePolicy.level);
    console.warn("Valid levels are:", Object.keys(latePolicyLevels));
    setGradingData(prevData => ({
      ...prevData,
      latePolicy: {
        ...prevData.latePolicy,
        level: "none"
      }
    }));
  }
}, [gradingData.latePolicy]);



  const calculateTotalScore = () => {
    let rawScore = 0;
    if (loadedRubric && gradingData.rubricGrading) {
      rawScore = Object.values(gradingData.rubricGrading).reduce((total, grading) => {
        const criterion = loadedRubric.criteria.find(c => c.id === grading.criterionId);
        if (criterion && grading.selectedLevel) {
          const level = loadedRubric.rubricLevels.find(l => l.level === grading.selectedLevel);
          if (level) {
            return total + (criterion.maxPoints * level.multiplier);
          }
        }
        return total;
      }, 0);
    }
    const latePolicyLevel = getSafeLatePolicy(gradingData.latePolicy?.level);
    const finalScore = rawScore * latePolicyLevel.multiplier;
    return {
      rawScore: rawScore,
      finalScore: finalScore,
      penaltyApplied: gradingData.latePolicy.level !== 'none',
      latePolicyDescription: latePolicyLevel.description
    };
  };

  const updateLatePolicy = (level) => {
    setGradingData(prevData => ({
      ...prevData,
      latePolicy: {
        level: level,
        penaltyApplied: level !== 'none'
      }
    }));
  };

  const updateRubricGrading = (criterionId, level, comments = null) => {
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
    setLocalGradingData(prevData => {
      const currentGrading = prevData.rubricGrading[criterionId];
      const currentComments = currentGrading?.customComments || '';
      const newComments = currentComments ? `${currentComments}\n• ${comment}` : `• ${comment}`;
      const newRubricState = {
        ...prevData.rubricGrading,
        [criterionId]: {
          ...currentGrading,
          criterionId,
          selectedLevel: currentGrading?.selectedLevel || null,
          customComments: newComments
        }
      };
      return {
        ...prevData,
        rubricGrading: newRubricState
      };
    });
  };

  const toggleRubricComments = (criterionId) => {
    setShowRubricComments(prev => ({
      ...prev,
      [criterionId]: !prev[criterionId]
    }));
  };

  const addVideoLink = () => {
    if (videoLinkInput.trim()) {
      setGradingData(prevData => ({
        ...prevData,
        videoLinks: [...prevData.videoLinks, {
          id: Date.now(),
          url: videoLinkInput.trim(),
          title: videoTitle.trim() || 'Video Link'
        }]
      }));
      setVideoLinkInput('');
      setVideoTitle('');
    }
  };

  const removeVideoLink = (id) => {
    setGradingData(prevData => ({
      ...prevData,
      videoLinks: prevData.videoLinks.filter(link => link.id !== id)
    }));
  };

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
      setGradingData(prevData => ({
        ...prevData,
        attachments: [...prevData.attachments, ...processedAttachments]
      }));
    });
  };

  const removeAttachment = (id) => {
    setGradingData(prevData => ({
      ...prevData,
      attachments: prevData.attachments.filter(att => att.id !== id)
    }));
  };

  const handleNextStudent = () => {
    handleNextStudentAsDraft();
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

  const handleNextStudentAsFinal = () => {
    if (currentStudent?.id) {
      console.log('✅ Finalizing grade for student:', currentStudent.name);
      saveFinalGrade(currentStudent.id, localGradingData);
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
    if (loadedRubric) {
      loadedRubric.criteria.forEach(criterion => {
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

  const handlePreviousStudent = () => {
    if (currentStudent?.id) {
      saveDraft(currentStudent.id, localGradingData);
    }
    const success = previousStudentInSession();
    if (!success) {
      console.log('Already at first student or no active session');
    }
  };

  const getCurrentStudentInfo = () => {
    if (!classList || !gradingSession?.active || !gradingSession.currentStudent) {
      return null;
    }
    const currentIndex = gradingSession.currentStudentIndex;
    const totalStudents = classList.students.length;
    const student = gradingSession.currentStudent;
    return {
      student,
      position: currentIndex + 1,
      total: totalStudents,
      isFirst: currentIndex === 0,
      isLast: currentIndex === totalStudents - 1
    };
  };

  const currentStudentInfo = getCurrentStudentInfo();

  // --- START: CODE FIX ---

  // Helper function to generate the student report HTML. This avoids code duplication.
  const generateStudentReportHTML = () => {
    const scoreCalculation = calculateTotalScore();
    const totalScore = scoreCalculation.finalScore;
    const rawScore = scoreCalculation.rawScore;
    const maxPoints = loadedRubric ? loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints;
    const percentage = ((totalScore / (maxPoints || 1)) * 100).toFixed(1);
    const penaltyApplied = scoreCalculation.penaltyApplied;

    const attachmentsHTML = gradingData.attachments.map((att, index) => {
      if (att.base64Data) {
        return `<div class="attachment-item"><img src="${att.base64Data}" alt="${att.name}" class="clickable-image" data-index="${index}" style="max-width: 200px; max-height: 200px; object-fit: contain; display: block; margin-bottom: 0.5rem; border: 1px solid #ddd; border-radius: 4px;" /><div style="font-size: 0.875rem; font-weight: 500; word-break: break-word;">${att.name}</div><div style="font-size: 0.75rem; color: #666;">${(att.size / 1024).toFixed(1)} KB</div><div style="font-size: 0.75rem; color: #007bff; margin-top: 4px;">Click to enlarge</div></div>`;
      } else {
        return `<div class="attachment-item"><div style="width: 40px; height: 40px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem auto;">📄</div><div style="font-size: 0.875rem; font-weight: 500; word-break: break-word;">${att.name}</div><div style="font-size: 0.75rem; color: #666;">${(att.size / 1024).toFixed(1)} KB</div></div>`;
      }
    }).join('');

    const videoLinksHTML = gradingData.videoLinks.map(link => `<div class="video-link-item" style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;"><div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;"><span style="font-size: 1.25rem;">🎥</span><strong style="color: #495057;">${link.title}</strong></div><a href="${link.url}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none; word-break: break-all;">${link.url}</a></div>`).join('');

    const rubricTableHTML = loadedRubric ? `
      <div class="rubric-section" style="margin-top: 30px;">
          <h3>📋 Detailed Rubric Assessment</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <strong>Assignment:</strong> ${loadedRubric.assignmentInfo.title}<br>
              <strong>Description:</strong> ${renderFormattedContent(loadedRubric.assignmentInfo.description)}<br>
              <strong>Weight:</strong> ${loadedRubric.assignmentInfo.weight}% of Final Grade<br>
              <strong>Passing Threshold:</strong> ${loadedRubric.assignmentInfo.passingThreshold}%  
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 0.9rem;">
              <thead><tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Criterion</th><th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Max Points</th><th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Level Achieved</th><th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Points Earned</th><th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Assessment & Comments</th></tr></thead>
              <tbody>
                  ${loadedRubric.criteria.map(criterion => {
      const grading = gradingData.rubricGrading[criterion.id];
      const level = grading?.selectedLevel ? loadedRubric.rubricLevels.find(l => l.level === grading.selectedLevel) : null;
      const points = level ? (criterion.maxPoints * level.multiplier).toFixed(1) : '0';
      const levelDescription = level && criterion.levels[level.level] ? renderFormattedContent(criterion.levels[level.level].description) : '';
      const additionalComments = grading?.customComments || '';
      return `<tr><td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"><strong style="color: #2c3e50;">${criterion.name}</strong><br><small style="color: #666; font-style: italic;">${renderFormattedContent(criterion.description)}</small></td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">${criterion.maxPoints}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; ${level ? `background-color: ${level.color}15; color: ${level.color}; font-weight: bold;` : ''}">${level ? level.name : 'Not Assessed'}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; font-size: 1.1em; color: #2c3e50;">${points}</td><td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">${levelDescription ? `<div style="margin-bottom: 10px; padding: 8px; background: #f8f9fa; border-left: 4px solid ${level.color}; border-radius: 4px;"><strong style="color: ${level.color};">Level Description:</strong><br><span style="font-size: 0.85em; line-height: 1.4;">${levelDescription}</span></div>` : ''}${additionalComments ? `<div style="margin-top: 8px; padding: 8px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;"><strong style="color: #856404;">Additional Comments:</strong><br><span style="font-size: 0.85em; line-height: 1.4; white-space: pre-wrap;">${additionalComments}</span></div>` : ''}${(!levelDescription && !additionalComments) ? '<em style="color: #999;">No assessment provided</em>' : ''}</td></tr>`;
    }).join('')}
              </tbody>
          </table>
          <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin-top: 20px;"><h4 style="color: #2e7d32; margin-bottom: 10px;">📊 Rubric Score Summary</h4><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;"><div><strong>Total Score:</strong> ${Math.round(totalScore * 10) / 10} / ${maxPoints}<br><strong>Percentage:</strong> ${percentage}%</div><div><strong>Grade Status:</strong><span style="color: ${percentage >= loadedRubric.assignmentInfo.passingThreshold ? '#4caf50' : '#f44336'}; font-weight: bold;">${percentage >= loadedRubric.assignmentInfo.passingThreshold ? '✓ PASSING' : '✗ NEEDS IMPROVEMENT'}</span></div>${penaltyApplied ? `<div style="color: #ff9800;"><strong>Late Penalty Applied:</strong><br>Raw Score: ${Math.round(rawScore * 10) / 10}</div>` : ''}</div></div>
      </div>` : '';

    const htmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Grade Report - ${gradingData.student.name}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:20px auto;padding:20px;line-height:1.6}.header{background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:30px}.score-summary{background:#e8f5e8;border:2px solid #4caf50;border-radius:8px;padding:20px;margin:20px 0;text-align:center}.late-policy-section{margin:30px 0;background:#fff5f5;border:1px solid #f87171;border-radius:8px;padding:20px}.feedback-section{margin:20px 0;padding:15px;background:#f9f9f9;border-radius:8px}.attachments{margin:30px 0}.attachment-item{display:inline-block;text-align:center;margin:1rem;padding:1rem;background:#fff;border:1px solid #ddd;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,.1);max-width:250px;vertical-align:top}.clickable-image{cursor:pointer;transition:all .3s ease;position:relative}.clickable-image:hover{transform:scale(1.05);box-shadow:0 4px 8px rgba(0,0,0,.2)}.video-links{margin:30px 0}.video-link-item{margin-bottom:1rem}.video-link-item a{color:#007bff;text-decoration:none}.video-link-item a:hover{text-decoration:underline}h1,h2,h3{color:#333}.image-modal{display:none;position:fixed;z-index:1000;left:0;top:0;width:100%;height:100%;background-color:rgba(0,0,0,.9);animation:fadeIn .3s ease}.image-modal.show{display:flex;align-items:center;justify-content:center}.modal-content{max-width:95%;max-height:95%;object-fit:contain;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.5);animation:zoomIn .3s ease}.close-modal{position:absolute;top:20px;right:30px;color:#fff;font-size:40px;font-weight:700;cursor:pointer;z-index:1001;background:rgba(0,0,0,.5);border-radius:50%;width:50px;height:50px;display:flex;align-items:center;justify-content:center;line-height:1}.close-modal:hover{background:rgba(0,0,0,.8)}.modal-caption{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#fff;background:rgba(0,0,0,.7);padding:10px 20px;border-radius:6px;text-align:center;max-width:80%}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes zoomIn{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}@media print{.attachment-item,.video-link-item{break-inside:avoid}.image-modal{display:none!important}}</style></head><body><div class="header"><h1>📋 Grade Report</h1><p><strong>Student:</strong> ${gradingData.student.name} (${gradingData.student.id})</p><p><strong>Course:</strong> ${gradingData.course?.code ?? ''} - ${gradingData.course?.name ?? ''}</p><p><strong>Assignment:</strong> ${gradingData.assignment.name}</p><p><strong>Instructor:</strong> ${gradingData.course?.instructor ?? ''}</p><p><strong>Term:</strong> ${gradingData.course?.term ?? ''}</p></div><div class="score-summary"><h2>📊 Final Score</h2><div style="font-size:2rem;font-weight:700;color:#2e7d32;margin:15px 0">${totalScore.toFixed(1)} / ${maxPoints} (${percentage}%)</div><p style="margin:10px 0;color:#555">${loadedRubric ? `Rubric: ${loadedRubric.assignmentInfo.title}` : ""}${penaltyApplied ? ` | Late Policy: ${getSafeLatePolicy(gradingData.latePolicy?.level).name}` : ""}</p></div>${penaltyApplied ? `<div class="late-policy-section"><h3 style="color:#dc2626">📅 Late Submission Policy Applied</h3><p><strong>Policy Status:</strong> ${getSafeLatePolicy(gradingData.latePolicy?.level).name}</p><p>${getSafeLatePolicy(gradingData.latePolicy?.level).description}</p><p><strong>Raw Score:</strong> ${Math.round(rawScore * 10) / 10}/${maxPoints} → <strong>Final Score:</strong> ${Math.round(totalScore * 10) / 10}/${maxPoints}</p></div>` : ""}${rubricTableHTML}${Object.entries(gradingData.feedback).filter(([e, t]) => t).map(([e, t]) => `<div class="feedback-section"><h3>${e.charAt(0).toUpperCase() + e.slice(1)} Feedback</h3><p>${t.replace(/\n/g, "<br>")}</p></div>`).join("")}${attachmentsHTML ? `<div class="attachments"><h3>📎 File Attachments</h3><div style="display: flex; flex-wrap: wrap; justify-content: flex-start;">${attachmentsHTML}</div></div>` : ""}${videoLinksHTML ? `<div class="video-links"><h3>🎥 Video Review Links</h3>${videoLinksHTML}</div>` : ""}<p style="margin-top:40px;text-align:center;color:#666;font-size:.9rem">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p><div id="imageModal" class="image-modal"><span class="close-modal" onclick="closeImageModal()">&times;</span><img class="modal-content" id="modalImage"><div class="modal-caption" id="modalCaption"></div></div><script>const attachmentData=${JSON.stringify(gradingData.attachments)};function openImageModal(e,t){const n=document.getElementById("imageModal"),o=document.getElementById("modalImage"),a=document.getElementById("modalCaption");n.classList.add("show"),o.src=e,a.textContent=t,document.body.style.overflow="hidden"}function closeImageModal(){document.getElementById("imageModal").classList.remove("show"),document.body.style.overflow="auto"}document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll(".clickable-image").forEach(e=>{e.addEventListener("click",function(){const e=parseInt(this.getAttribute("data-index")),t=attachmentData[e];t&&t.base64Data&&openImageModal(t.base64Data,t.name)})}),document.getElementById("imageModal").addEventListener("click",function(e){e.target===this&&closeImageModal()}),document.addEventListener("keydown",function(e){"Escape"===e.key&&closeImageModal()})})</script></body></html>`;

    return htmlContent;
  };

  // Function to export student grade data for AI feedback generation
  const exportAIFeedbackData = () => {
    if (!localGradingData.student?.name) {
      alert('Please ensure student information is loaded before exporting for AI feedback.');
      return;
    }

    // Calculate scores
    const scoreCalculation = calculateTotalScore();
    const maxPoints = loadedRubric ? loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints;
    const percentage = maxPoints > 0 ? Math.round((scoreCalculation.finalScore / maxPoints) * 100) : 0;

    // Determine letter grade
    const getLetterGrade = (percentage) => {
      if (percentage >= 90) return 'A';
      if (percentage >= 80) return 'B';
      if (percentage >= 70) return 'C';
      if (percentage >= 60) return 'D';
      return 'F';
    };

    // Build criteria performance data
    const criteriaPerformance = [];
    if (loadedRubric && localGradingData.rubricGrading) {
      loadedRubric.criteria.forEach(criterion => {
        const grading = localGradingData.rubricGrading[criterion.id];
        if (grading && grading.selectedLevel) {
          const level = loadedRubric.rubricLevels.find(l => l.level === grading.selectedLevel);
          const earnedPoints = criterion.maxPoints * (level?.multiplier || 0);
          const criterionPercentage = Math.round((earnedPoints / criterion.maxPoints) * 100);

          criteriaPerformance.push({
            name: criterion.name,
            description: criterion.description,
            maxPoints: criterion.maxPoints,
            earnedPoints: Math.round(earnedPoints * 10) / 10,
            level: grading.selectedLevel,
            levelName: level?.name || 'Unknown',
            levelDescription: level?.description || '',
            percentage: criterionPercentage,
            customComments: grading.customComments || ''
          });
        }
      });
    }

    // Create the structured data for AI
    const aiGradeData = {
      student: {
        firstName: localGradingData.student.name.split(' ')[0] || localGradingData.student.name,
        lastName: localGradingData.student.name.split(' ').slice(1).join(' ') || '',
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
        overallScore: Math.round(scoreCalculation.finalScore * 10) / 10,
        rawScore: Math.round(scoreCalculation.rawScore * 10) / 10,
        overallPercentage: percentage,
        letterGrade: getLetterGrade(percentage),
        passed: percentage >= (loadedRubric?.assignmentInfo?.passingThreshold || 60),
        latePenaltyApplied: scoreCalculation.penaltyApplied,
        latePolicyDescription: scoreCalculation.latePolicyDescription,
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

  // Updated function to generate concise AI feedback prompt
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

  // Combined function to export both files at once
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

  // --- END: CODE FIX ---

  // NEW HELPER FUNCTIONS FOR COURSE INFO
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

    const courseMetadata = classList.courseMetadata;
    const newCourseInfo = {
      code: courseMetadata.courseCode || '',
      name: courseMetadata.courseName || '',
      instructor: courseMetadata.instructor || courseMetadata.professors || '',
      term: courseMetadata.term || ''
    };

    // Update both local and shared state
    setGradingData(prevData => ({
      ...prevData,
      course: newCourseInfo
    }));

    Object.entries(newCourseInfo).forEach(([field, value]) => {
      updateCourseInfo(field, value);
    });

    console.log('📥 Pulled course data from class list:', newCourseInfo);
    alert(`Course information updated!\n\nCode: ${newCourseInfo.code}\nName: ${newCourseInfo.name}\nInstructor: ${newCourseInfo.instructor}\nTerm: ${newCourseInfo.term}`);
  };

  const isCourseDataMissing = () => {
    const course = gradingData?.course || {};
    return !course.code && !course.name && !course.instructor && !course.term;
  };


  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '1.5rem' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem 0.5rem 0 0',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
                📋 Professional Grading Interface
              </h1>
              <p style={{ color: '#bfdbfe', margin: 0 }}>
                {loadedRubric ? 'Comprehensive rubric-based assessment' : 'Streamlined grading with flexible assessment options'}
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

              {/* ADD THE NEW AI FEEDBACK BUTTON HERE */}
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
        </div>

        <div style={{ background: 'white', borderRadius: '0 0 0.5rem 0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <div style={{ padding: '1.5rem' }}>
            {/* Student Navigation Bar */}
            {currentStudentInfo && (
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                border: '1px solid #0284c7',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#0284c7',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}>
                      {currentStudentInfo.position}
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0c4a6e' }}>
                        {currentStudentInfo.student.name}
                      </h2>
                      <p style={{ margin: 0, color: '#0369a1', fontSize: '0.875rem' }}>
                        Student ID: {currentStudentInfo.student.id} | Email: {currentStudentInfo.student.email}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'center', color: '#0369a1' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                        {currentStudentInfo.position}/{currentStudentInfo.total}
                      </div>
                      <div style={{ fontSize: '0.75rem' }}>Progress</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={handlePreviousStudent}
                        disabled={currentStudentInfo.isFirst}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: currentStudentInfo.isFirst ? '#94a3b8' : '#3b82f6',
                          color: 'white',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          cursor: currentStudentInfo.isFirst ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        <ArrowLeft size={16} />
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
                          gap: '0.5rem',
                          background: '#f59e0b',
                          color: 'white',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        <Pause size={16} />
                        Pause Session
                      </button>

                      <button
                        onClick={handleNextStudent}
                        disabled={currentStudentInfo.isLast}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: currentStudentInfo.isLast ? '#94a3b8' : '#10b981',
                          color: 'white',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          cursor: currentStudentInfo.isLast ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        {currentStudentInfo.isLast ? (
                          <>
                            <CheckCircle size={16} />
                            Complete Session
                          </>
                        ) : (
                          <>
                            Next
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  background: '#e0f2fe',
                  borderRadius: '0.5rem',
                  height: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(currentStudentInfo.position / currentStudentInfo.total) * 100}%`,
                    background: 'linear-gradient(90deg, #0284c7 0%, #0ea5e9 100%)',
                    height: '100%',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
              </div>
            )}

            {/* Auto-save Indicator */}
            {sharedGradingData && (
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '1px solid #bbf7d0',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d' }}>
                  <div style={{ width: '8px', height: '8px', background: '#16a34a', borderRadius: '50%' }}></div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Auto-saved - Work preserved across tabs</span>
                </div>
              </div>
            )}

            {/* Quick Actions for Class Management */}
            {!currentStudentInfo && classList && classList.students?.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '1px solid #fbbf24',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#92400e', fontSize: '1.125rem', fontWeight: '600' }}>
                      Class List Available
                    </h3>
                    <p style={{ margin: 0, color: '#b45309', fontSize: '0.875rem' }}>
                      {classList.students.length} students ready for grading. Start a batch session to grade efficiently.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      initializeGradingSession(classList);
                      setActiveTab('grading-tool');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#d97706',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    <PlayCircle size={16} />
                    Start Batch Grading
                  </button>
                </div>
              </div>
            )}

            {/* ENHANCED Course Information Section */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>
                  Course Information
                </h2>

                {/* Pull Course Data Button - show if data is missing and classList has metadata */}
                {isCourseDataMissing() && classList?.courseMetadata && (
                  <button
                    onClick={pullCourseDataFromClassList}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#3b82f6',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                    title="Pull course information from imported class list"
                  >
                    <Download size={16} />
                    Pull Course Data
                  </button>
                )}
              </div>

              {/* Data source indicator */}
              {(() => {
                const effectiveData = getEffectiveCourseData();
                if (effectiveData.code || effectiveData.name) {
                  return (
                    <div style={{
                      background: '#f0f9ff',
                      border: '1px solid #0ea5e9',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      color: '#0369a1'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={16} />
                        <span>Course information loaded {gradingData.course?.code ? 'from grading session' : 'from class list metadata'}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Course Code (e.g., ART101)"
                  value={getEffectiveCourseData().code}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setGradingData(prevData => ({
                      ...prevData,
                      course: { ...prevData.course, code: newValue }
                    }));
                    updateCourseInfo('code', newValue);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: getEffectiveCourseData().code && !gradingData.course?.code ? '#f9fafb' : 'white'
                  }}
                />
                <input
                  type="text"
                  placeholder="Course Name"
                  value={getEffectiveCourseData().name}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setGradingData(prevData => ({
                      ...prevData,
                      course: { ...prevData.course, name: newValue }
                    }));
                    updateCourseInfo('name', newValue);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: getEffectiveCourseData().name && !gradingData.course?.name ? '#f9fafb' : 'white'
                  }}
                />
                <input
                  type="text"
                  placeholder="Instructor Name"
                  value={getEffectiveCourseData().instructor}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setGradingData(prevData => ({
                      ...prevData,
                      course: { ...prevData.course, instructor: newValue }
                    }));
                    updateCourseInfo('instructor', newValue);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: getEffectiveCourseData().instructor && !gradingData.course?.instructor ? '#f9fafb' : 'white'
                  }}
                />
                <input
                  type="text"
                  placeholder="Term (e.g., Fall 2024)"
                  value={getEffectiveCourseData().term}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setGradingData(prevData => ({
                      ...prevData,
                      course: { ...prevData.course, term: newValue }
                    }));
                    updateCourseInfo('term', newValue);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: getEffectiveCourseData().term && !gradingData.course?.term ? '#f9fafb' : 'white'
                  }}
                />
              </div>
            </div>

            {/* Student Information */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
                Student Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Student Name"
                  value={currentStudent?.name || gradingData.student?.name || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setGradingData(prevData => ({
                      ...prevData,
                      student: { ...prevData.student, name: newValue }
                    }));
                    updateStudentInfo('name', newValue);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    background: currentStudentInfo ? '#f3f4f6' : 'white'
                  }}
                  readOnly={!!currentStudentInfo}
                />
                <input
                  type="text"
                  placeholder="Student ID"
                  value={currentStudent?.id || gradingData.student?.id || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setGradingData(prevData => ({
                      ...prevData,
                      student: { ...prevData.student, id: newValue }
                    }));
                    updateStudentInfo('id', newValue);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    background: currentStudentInfo ? '#f3f4f6' : 'white'
                  }}
                  readOnly={!!currentStudentInfo}
                />
                <input
                  type="email"
                  placeholder="Student Email"
                  value={currentStudent?.email || gradingData.student?.email || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setGradingData(prevData => ({
                      ...prevData,
                      student: { ...prevData.student, email: newValue }
                    }));
                    updateStudentInfo('email', newValue);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    background: currentStudentInfo ? '#f3f4f6' : 'white'
                  }}
                  readOnly={!!currentStudentInfo}
                />
              </div>
            </div>

            {/* Assignment Details */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
                Assignment Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Assignment Name"
                  value={gradingData.assignment.name}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setGradingData(prevData => ({
                      ...prevData,
                      assignment: { ...prevData.assignment, name: newValue }
                    }));
                    updateAssignmentInfo({ name: newValue });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                />
                <input
                  type="date"
                  placeholder="Due Date"
                  value={gradingData.assignment.dueDate}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setGradingData(prevData => ({
                      ...prevData,
                      assignment: { ...prevData.assignment, dueDate: newValue }
                    }));
                    updateAssignmentInfo({ dueDate: newValue });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                />
                <input
                  type="number"
                  placeholder="Max Points"
                  value={gradingData.assignment.maxPoints}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 0;
                    setGradingData(prevData => ({
                      ...prevData,
                      assignment: { ...prevData.assignment, maxPoints: newValue }
                    }));
                    updateAssignmentInfo({ maxPoints: newValue });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            {/* Late Policy Section */}
            <div style={{
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
              border: '1px solid #fed7aa',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#9a3412' }}>
                📅 Late Submission Policy
              </h3>
              <div style={{
                background: 'white',
                border: '1px solid #fed7aa',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <p style={{ fontWeight: '500', marginBottom: '0.5rem', color: '#9a3412' }}>
                  Institutional Late Assignment Policy:
                </p>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#7c2d12' }}>
                  <li>• <strong>On Time:</strong> Assignments submitted on or before due date and time are marked out of 100%</li>
                  <li>• <strong>1-24 Hours Late:</strong> Assignments receive a 20% reduction and are marked out of 80%</li>
                  <li>• <strong>After 24 Hours:</strong> Assignments receive a mark of zero (0)</li>
                </ul>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: '500', marginBottom: '0.75rem', color: '#9a3412' }}>
                  Select submission status:
                </h4>

                {Object.entries(latePolicyLevels).map(([level, policy]) => (
                  <div
                    key={level}
                    onClick={() => updateLatePolicy(level)}
                    style={{
                      background: 'white',
                      border: `2px solid ${gradingData.latePolicy.level === level ? policy.color : '#d1d5db'}`,
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      marginBottom: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: gradingData.latePolicy.level === level ? 'translateY(-2px)' : 'none',
                      boxShadow: gradingData.latePolicy.level === level ? '0 8px 25px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                      backgroundColor: gradingData.latePolicy.level === level ? `linear-gradient(135deg, ${policy.color}15 0%, ${policy.color}25 100%)` : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: policy.color,
                        flexShrink: 0
                      }}></div>
                      <h5 style={{
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        margin: 0,
                        flex: 1,
                        color: policy.color
                      }}>
                        {policy.name}
                      </h5>
                      {level !== 'none' && (
                        <span style={{
                          fontSize: '0.9rem',
                          opacity: 0.8,
                          fontWeight: '500',
                          color: policy.color
                        }}>
                          (×{policy.multiplier === 0 ? '0' : policy.multiplier})
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      margin: 0,
                      color: '#6b7280'
                    }}>
                      {policy.description}
                    </p>
                  </div>
                ))}
              </div>

              {calculateTotalScore().penaltyApplied && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <h5 style={{ fontWeight: '500', color: '#991b1b', marginBottom: '0.5rem' }}>
                    ⚠️ Late Penalty Calculation
                  </h5>
                  <div style={{ fontSize: '0.875rem', color: '#7f1d1d' }}>
                    <p style={{ marginBottom: '0.25rem' }}>
                      <strong>Raw Score:</strong> {Math.round(calculateTotalScore().rawScore * 10) / 10} / {loadedRubric ? loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints}
                    </p>
                    <p style={{ marginBottom: '0.25rem' }}>
                      <strong>Late Penalty:</strong> ×{getSafeLatePolicy(gradingData.latePolicy?.level).multiplier}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Final Score:</strong> {Math.round(calculateTotalScore().finalScore * 10) / 10} / {loadedRubric ? loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints}
                    </p>
                  </div>
                </div>
              )}
            </div>

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
                {Math.round(calculateTotalScore().finalScore * 10) / 10}
                <span style={{ fontSize: '1.5rem', color: '#6b7280' }}>
                  / {loadedRubric ? loadedRubric.assignmentInfo.totalPoints : gradingData.assignment.maxPoints}
                </span>
              </div>
              <div style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '1rem' }}>
                ({Math.round((calculateTotalScore().finalScore / (loadedRubric ? (loadedRubric.assignmentInfo.totalPoints || 1) : (gradingData.assignment.maxPoints || 1))) * 1000) / 10}%)
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {loadedRubric && (
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
                {calculateTotalScore().penaltyApplied && (
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
                {currentStudentInfo && (
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
            {currentStudentInfo && (
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
                  Save your current grading progress as a draft. You can return to complete it later.
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

            {/* Loaded Rubric Section */}
            {loadedRubric && (
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
                      {loadedRubric.assignmentInfo.title}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#059669' }}>
                      {renderFormattedContent(loadedRubric.assignmentInfo.description)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', color: '#059669' }}>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Weight:</strong> {loadedRubric.assignmentInfo.weight}% of Final Grade
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Passing:</strong> {loadedRubric.assignmentInfo.passingThreshold}%
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Total Points:</strong> {loadedRubric.assignmentInfo.totalPoints}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rubric Grading Interface */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {loadedRubric.criteria.map((criterion) => {
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
                            onClick={() => toggleRubricComments(criterion.id)}
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
                          {loadedRubric.rubricLevels.map((level) => {
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
                              {loadedRubric.rubricLevels.map((level) => (
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
                              <strong>Selected Level:</strong> {loadedRubric.rubricLevels.find(l => l.level === currentGrading.selectedLevel)?.name}
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
                        {Math.round(calculateTotalScore().finalScore * 10) / 10}/{loadedRubric.assignmentInfo.totalPoints}
                      </div>
                      <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>
                        ({Math.round((calculateTotalScore().finalScore / (loadedRubric.assignmentInfo.totalPoints || 1)) * 1000) / 10}%)
                      </div>
                      {calculateTotalScore().penaltyApplied && (
                        <div style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '0.25rem' }}>
                          Raw: {Math.round(calculateTotalScore().rawScore * 10) / 10} (Late Penalty Applied)
                        </div>
                      )}
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: (calculateTotalScore().finalScore / (loadedRubric.assignmentInfo.totalPoints || 1)) * 100 >= loadedRubric.assignmentInfo.passingThreshold
                          ? '#16a34a' : '#dc2626'
                      }}>
                        {(calculateTotalScore().finalScore / (loadedRubric.assignmentInfo.totalPoints || 1)) * 100 >= loadedRubric.assignmentInfo.passingThreshold
                          ? '✓ PASSING' : '✗ NEEDS IMPROVEMENT'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NEW: Enhanced Complete and Grade Next Section */}
            {loadedRubric && currentStudentInfo && (
              <div style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                border: '2px solid #10b981',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginTop: '2rem',
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
                  onChange={(e) => handleFileUpload(e.target.files)}
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

            {/* Video Links Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                🎥 Video Review Links
              </h3>
              <div style={{
                background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                border: '1px solid #e9d5ff',
                borderRadius: '0.5rem',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.25rem'
                    }}>
                      Video URL
                    </label>
                    <input
                      type="url"
                      value={videoLinkInput}
                      onChange={(e) => setVideoLinkInput(e.target.value)}
                      placeholder="https://example.com/video..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div style={{ minWidth: '150px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.25rem'
                    }}>
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Video title"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'end' }}>
                    <button
                      onClick={addVideoLink}
                      disabled={!videoLinkInput.trim()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: videoLinkInput.trim() ? '#7c3aed' : '#9ca3af',
                        color: 'white',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: videoLinkInput.trim() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <Plus size={18} />
                      Add Video
                    </button>
                  </div>
                </div>
              </div>

              {gradingData.videoLinks.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                    Added Video Links ({gradingData.videoLinks.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {gradingData.videoLinks.map((videoLink) => (
                      <div key={videoLink.id} style={{
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              background: '#7c3aed',
                              borderRadius: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Video size={16} style={{ color: 'white' }} />
                            </div>
                            <div>
                              <p style={{ fontWeight: '500', color: '#374151' }}>{videoLink.title}</p>
                              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>External Link</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <a
                              href={videoLink.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: '#3b82f6',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.875rem',
                                textDecoration: 'none'
                              }}
                            >
                              Open Link
                            </a>
                            <button
                              onClick={() => removeVideoLink(videoLink.id)}
                              style={{
                                color: '#dc2626',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem'
                              }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingTemplate;
