import React, { useEffect, useRef, useState } from 'react';
import { Upload, Download, FileText, Video, Plus, X, Save, FileDown, Bot, ArrowRight } from 'lucide-react';
import { useAssessment } from './SharedContext';
import { generatePDF } from '../utils/pdfFunctions';

const baseLevels = [
  { level: 'incomplete', name: 'Incomplete', multiplier: 0, color: '#94a3b8' },
  { level: 'unacceptable', name: 'Unacceptable', multiplier: 0.3, color: '#ef4444' },
  { level: 'developing', name: 'Developing', multiplier: 0.6, color: '#f97316' },
  { level: 'acceptable', name: 'Acceptable', multiplier: 0.8, color: '#22c55e' },
  { level: 'exceptional', name: 'Exceptional', multiplier: 1.0, color: '#3b82f6' },
];

const courseModules = {
  '2d-animation': {
    courseType: '2D Animation',
    version: '1.0',
    gradingSettings: { maxPoints: 100 },
    rubric: {
      assignmentInfo: {
        title: 'Animation Project',
        description: 'Create a short animated clip',
        weight: 25,
        passingThreshold: 60,
        totalPoints: 100,
      },
      rubricLevels: baseLevels,
      criteria: [
        { id: 'design', name: 'Animation Principles', description: 'Timing and spacing', maxPoints: 40 },
        { id: 'technical', name: 'Technical Execution', description: 'File quality and format', maxPoints: 30 },
        { id: 'story', name: 'Storytelling', description: 'Narrative and creativity', maxPoints: 30 },
      ],
    },
    feedbackLibrary: {
      strengths: ['Great timing', 'Smooth transitions'],
      improvements: ['More anticipation', 'Check spacing'],
      general: ['Good overall progress'],
    },
  },
  '3d-modeling': {
    courseType: '3D Modeling',
    version: '1.0',
    gradingSettings: { maxPoints: 100 },
    rubric: {
      assignmentInfo: {
        title: 'Modeling Project',
        description: 'Model a detailed object',
        weight: 30,
        passingThreshold: 60,
        totalPoints: 100,
      },
      rubricLevels: baseLevels,
      criteria: [
        { id: 'topology', name: 'Topology', description: 'Clean edge flow', maxPoints: 35 },
        { id: 'uv', name: 'UV Mapping', description: 'Efficient layout', maxPoints: 35 },
        { id: 'texture', name: 'Texturing', description: 'Material and shading quality', maxPoints: 30 },
      ],
    },
    feedbackLibrary: {
      strengths: ['Clean topology', 'Good shading'],
      improvements: ['Check UV stretching'],
      general: ['Nice modelling work'],
    },
  },
};

const allowedVideoDomains = ['syncsketch', 'panopto', 'youtube.com', 'youtu.be', 'vimeo.com'];

const GradingTemplate = () => {
  const {
    sharedRubric,
    sharedCourseDetails,
    setSharedRubric,
    transferRubricToGrading,
    clearSharedRubric,
    updateStudentInfo,
    updateCourseInfo,
    updateAssignmentInfo,
  } = useAssessment();

  const defaultModule = Object.keys(courseModules)[0];
  const [activeModule, setActiveModule] = useState(defaultModule);
  const [loadedRubric, setLoadedRubric] = useState(courseModules[defaultModule].rubric);
  const [rubricGrading, setRubricGrading] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [videoLinks, setVideoLinks] = useState([]);
  const [videoInput, setVideoInput] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [aiAssist, setAiAssist] = useState(false);
  const jsonInputRef = useRef(null);

  const [gradingData, setGradingData] = useState({
    student: { name: '', id: '', email: '' },
    course: { code: '', name: '', term: '' },
    assignment: {
      title: courseModules[defaultModule].rubric.assignmentInfo.title,
      dueDate: '',
      maxPoints: courseModules[defaultModule].gradingSettings.maxPoints,
    },
    feedback: { general: '', strengths: '', improvements: '' },
    latePolicy: 'none',
  });

  const initRubricGrading = (rubric) => {
    const obj = {};
    rubric.criteria.forEach((c) => {
      obj[c.id] = { level: null, comments: '' };
    });
    setRubricGrading(obj);
  };

  // Initialize with module rubric
  useEffect(() => {
    initRubricGrading(loadedRubric);
    setSharedRubric(loadedRubric);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update from shared rubric
  useEffect(() => {
    if (sharedRubric) {
      setLoadedRubric(sharedRubric);
      initRubricGrading(sharedRubric);
      updateAssignmentInfo({
        name: sharedRubric.assignmentInfo.title,
        maxPoints: sharedRubric.assignmentInfo.totalPoints,
      });
      setGradingData((prev) => ({
        ...prev,
        assignment: {
          ...prev.assignment,
          title: sharedRubric.assignmentInfo.title,
          maxPoints: sharedRubric.assignmentInfo.totalPoints,
        },
      }));
    }
  }, [sharedRubric]);

  // Update from shared course details
  useEffect(() => {
    if (sharedCourseDetails) {
      setGradingData((prev) => ({
        ...prev,
        student: { ...prev.student, ...sharedCourseDetails.student },
        course: { ...prev.course, ...sharedCourseDetails.course },
      }));
    }
  }, [sharedCourseDetails]);

  // Module change
  useEffect(() => {
    const mod = courseModules[activeModule];
    if (mod) {
      setLoadedRubric(mod.rubric);
      setSharedRubric(mod.rubric);
      initRubricGrading(mod.rubric);
      updateAssignmentInfo({
        name: mod.rubric.assignmentInfo.title,
        maxPoints: mod.gradingSettings.maxPoints,
      });
      setGradingData((prev) => ({
        ...prev,
        assignment: {
          ...prev.assignment,
          title: mod.rubric.assignmentInfo.title,
          maxPoints: mod.gradingSettings.maxPoints,
        },
      }));
    }
  }, [activeModule, setSharedRubric]);

  const handleLevelChange = (id, level) => {
    setRubricGrading((prev) => ({
      ...prev,
      [id]: { ...prev[id], level },
    }));
  };

  const handleCommentChange = (id, text) => {
    setRubricGrading((prev) => ({
      ...prev,
      [id]: { ...prev[id], comments: text },
    }));
  };

  const totalRawScore = () => {
    return loadedRubric.criteria.reduce((acc, c) => {
      const grade = rubricGrading[c.id];
      if (!grade || !grade.level) return acc;
      const levelObj = loadedRubric.rubricLevels.find((l) => l.level === grade.level);
      return acc + c.maxPoints * levelObj.multiplier;
    }, 0);
  };

  const lateMultiplier = () => {
    if (gradingData.latePolicy === 'none') return 1;
    if (gradingData.latePolicy === 'within24') return 0.8;
    return 0;
  };

  const finalScore = () => totalRawScore() * lateMultiplier();

  const handleFileUpload = (files) => {
    const list = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      type: file.type,
      size: file.size,
    }));

    Promise.all(
      list.map(
        (item) =>
          new Promise((res) => {
            if (item.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = (e) => {
                item.base64 = e.target.result;
                res(item);
              };
              reader.readAsDataURL(item.file);
            } else {
              res(item);
            }
          })
      )
    ).then((newList) => setAttachments((prev) => [...prev, ...newList]));
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const addVideoLink = () => {
    if (!videoInput.trim()) return;
    if (!allowedVideoDomains.some((d) => videoInput.includes(d))) {
      alert('Unsupported video provider');
      return;
    }
    setVideoLinks((prev) => [
      ...prev,
      { id: Date.now(), url: videoInput.trim(), title: videoTitle || 'Video' },
    ]);
    setVideoInput('');
    setVideoTitle('');
  };

  const removeVideo = (id) => setVideoLinks((prev) => prev.filter((v) => v.id !== id));

  const generateHTML = () => {
    const score = finalScore().toFixed(1);
    const raw = totalRawScore().toFixed(1);
    const max = loadedRubric.assignmentInfo.totalPoints;
    const percentage = ((score / max) * 100).toFixed(1);

    const rubricRows = loadedRubric.criteria
      .map((c) => {
        const g = rubricGrading[c.id];
        const level = g && g.level ? loadedRubric.rubricLevels.find((l) => l.level === g.level) : null;
        const pts = level ? (c.maxPoints * level.multiplier).toFixed(1) : '0';
        return `<tr><td>${c.name}</td><td>${c.maxPoints}</td><td>${level ? level.name : ''}</td><td>${pts}</td><td>${g?.comments || ''}</td></tr>`;
      })
      .join('');

    const attachHTML = attachments
      .map((att) => {
        if (att.type.startsWith('image/')) {
          return `<img src="${att.base64}" alt="${att.name}" style="max-width:300px;margin:10px;"/>`;
        }
        return `<div>${att.name}</div>`;
      })
      .join('');

    const videoHTML = videoLinks
      .map((v) => `<div><strong>${v.title}</strong><br/><iframe src="${v.url}" width="480" height="270"></iframe></div>`) 
      .join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>Grade Report</title></head><body>
<h1>Grade Report</h1>
<p><strong>Student:</strong> ${gradingData.student.name}</p>
<p><strong>Course:</strong> ${gradingData.course.code} - ${gradingData.course.name}</p>
<p><strong>Assignment:</strong> ${gradingData.assignment.title}</p>
<table border="1" cellpadding="5" cellspacing="0"><thead><tr><th>Criterion</th><th>Max</th><th>Level</th><th>Score</th><th>Comments</th></tr></thead><tbody>${rubricRows}</tbody></table>
<p><strong>Raw Score:</strong> ${raw} / ${max}</p>
<p><strong>Final Score:</strong> ${score} (${percentage}%)</p>
${gradingData.latePolicy !== 'none' ? `<p>Late penalty applied.</p>` : ''}
${attachHTML}
${videoHTML}
<p>Generated on ${new Date().toLocaleString()}</p>
</body></html>`;
  };

  const exportHTML = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'grade_report.html';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const html = generateHTML();
    generatePDF(html);
  };

  const saveJSON = () => {
    const data = {
      gradingData,
      rubricGrading,
      rubricInfo: loadedRubric,
      attachments,
      videoLinks,
      aiAssist,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'grading_data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.rubricInfo) {
          setLoadedRubric(data.rubricInfo);
          initRubricGrading(data.rubricInfo);
        }
        setGradingData(data.gradingData || gradingData);
        setAttachments(data.attachments || []);
        setVideoLinks(data.videoLinks || []);
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const clearRubric = () => {
    clearSharedRubric();
    setLoadedRubric(null);
    setRubricGrading({});
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            className="border rounded p-2"
            value={activeModule}
            onChange={(e) => setActiveModule(e.target.value)}
          >
            {Object.entries(courseModules).map(([key, mod]) => (
              <option key={key} value={key}>
                {mod.courseType}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600">v{courseModules[activeModule].version}</span>
          <button
            onClick={() => setAiAssist((v) => !v)}
            className={`ml-4 p-2 rounded-full border ${aiAssist ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'}`}
          >
            <Bot size={18} />
          </button>
        </div>
        <div className="flex gap-3">
          <input type="file" accept=".json" ref={jsonInputRef} onChange={loadJSON} className="hidden" />
          <button onClick={() => jsonInputRef.current?.click()} className="flex items-center gap-1 border px-3 py-2 rounded hover:bg-gray-100">
            <Upload size={16} /> Load Rubric JSON
          </button>
          <button onClick={saveJSON} className="flex items-center gap-1 border px-3 py-2 rounded hover:bg-gray-100">
            <Save size={16} /> Save Grading JSON
          </button>
          <button onClick={exportHTML} className="flex items-center gap-1 border px-3 py-2 rounded hover:bg-gray-100">
            <FileDown size={16} /> Export HTML Report
          </button>
          <button onClick={exportPDF} className="flex items-center gap-1 border px-3 py-2 rounded hover:bg-gray-100">
            <Download size={16} /> Export PDF
          </button>
          <button onClick={() => transferRubricToGrading(loadedRubric)} className="flex items-center gap-1 border px-3 py-2 rounded hover:bg-gray-100">
            <ArrowRight size={16} /> Transfer to Grading
          </button>
        </div>
      </div>

      {/* Student & Assignment Info */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <h2 className="text-lg font-semibold">Student & Course Info</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Student Name"
            value={gradingData.student.name}
            onChange={(e) => {
              const val = e.target.value;
              setGradingData((p) => ({ ...p, student: { ...p.student, name: val } }));
              updateStudentInfo({ name: val });
            }}
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Student ID"
            value={gradingData.student.id}
            onChange={(e) => {
              const val = e.target.value;
              setGradingData((p) => ({ ...p, student: { ...p.student, id: val } }));
              updateStudentInfo({ id: val });
            }}
            className="border rounded p-2"
          />
          <input
            type="email"
            placeholder="Student Email"
            value={gradingData.student.email}
            onChange={(e) => {
              const val = e.target.value;
              setGradingData((p) => ({ ...p, student: { ...p.student, email: val } }));
              updateStudentInfo({ email: val });
            }}
            className="border rounded p-2"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Course Code"
            value={gradingData.course.code}
            onChange={(e) => {
              const val = e.target.value;
              setGradingData((p) => ({ ...p, course: { ...p.course, code: val } }));
              updateCourseInfo({ code: val });
            }}
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Course Name"
            value={gradingData.course.name}
            onChange={(e) => {
              const val = e.target.value;
              setGradingData((p) => ({ ...p, course: { ...p.course, name: val } }));
              updateCourseInfo({ name: val });
            }}
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Term"
            value={gradingData.course.term}
            onChange={(e) => {
              const val = e.target.value;
              setGradingData((p) => ({ ...p, course: { ...p.course, term: val } }));
              updateCourseInfo({ term: val });
            }}
            className="border rounded p-2"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Assignment Title"
            value={gradingData.assignment.title}
            onChange={(e) => {
              const val = e.target.value;
              setGradingData((p) => ({ ...p, assignment: { ...p.assignment, title: val } }));
              updateAssignmentInfo({ name: val });
            }}
            className="border rounded p-2"
          />
          <input
            type="date"
            value={gradingData.assignment.dueDate}
            onChange={(e) => {
              const val = e.target.value;
              setGradingData((p) => ({ ...p, assignment: { ...p.assignment, dueDate: val } }));
              updateAssignmentInfo({ dueDate: val });
            }}
            className="border rounded p-2"
          />
          <input
            type="number"
            value={gradingData.assignment.maxPoints}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              setGradingData((p) => ({ ...p, assignment: { ...p.assignment, maxPoints: val } }));
              updateAssignmentInfo({ maxPoints: val });
            }}
            className="border rounded p-2"
          />
        </div>
      </div>

      {/* Rubric Table */}
      {loadedRubric && (
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <h2 className="text-lg font-semibold">Rubric Assessment</h2>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Criterion</th>
                <th className="border p-2 text-center">Max</th>
                <th className="border p-2 text-center">Level</th>
                <th className="border p-2 text-center">Score</th>
                <th className="border p-2 text-left">Comments</th>
              </tr>
            </thead>
            <tbody>
              {loadedRubric.criteria.map((c) => {
                const grade = rubricGrading[c.id] || {};
                const levelObj = grade.level && loadedRubric.rubricLevels.find((l) => l.level === grade.level);
                const points = levelObj ? (c.maxPoints * levelObj.multiplier).toFixed(1) : '0';
                return (
                  <tr key={c.id} className="border-b">
                    <td className="border p-2">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.description}</div>
                    </td>
                    <td className="border p-2 text-center">{c.maxPoints}</td>
                    <td className="border p-2 text-center">
                      <select
                        value={grade.level || ''}
                        onChange={(e) => handleLevelChange(c.id, e.target.value)}
                        className="border rounded p-1"
                      >
                        <option value="">-</option>
                        {loadedRubric.rubricLevels.map((l) => (
                          <option key={l.level} value={l.level} style={{ backgroundColor: l.color }}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border p-2 text-center">{points}</td>
                    <td className="border p-2">
                      <textarea
                        value={grade.comments || ''}
                        onChange={(e) => handleCommentChange(c.id, e.target.value)}
                        className="w-full border rounded p-1 text-sm"
                        rows="2"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="text-right font-semibold">Raw Score: {totalRawScore().toFixed(1)} / {loadedRubric.assignmentInfo.totalPoints}</div>
        </div>
      )}

      {/* Late Policy */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-2">
        <h2 className="text-lg font-semibold">Late Submission Policy</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="late" value="none" checked={gradingData.latePolicy === 'none'} onChange={() => setGradingData((p) => ({ ...p, latePolicy: 'none' }))} />
            On Time
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="late" value="within24" checked={gradingData.latePolicy === 'within24'} onChange={() => setGradingData((p) => ({ ...p, latePolicy: 'within24' }))} />
            Within 24 Hours (×0.8)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="late" value="after24" checked={gradingData.latePolicy === 'after24'} onChange={() => setGradingData((p) => ({ ...p, latePolicy: 'after24' }))} />
            After 24 Hours (×0)
          </label>
        </div>
        <div className="text-sm text-gray-500">Final Score: {finalScore().toFixed(1)}</div>
      </div>

      {/* Attachments */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <h2 className="text-lg font-semibold">Attachments</h2>
        <input type="file" multiple onChange={(e) => handleFileUpload(e.target.files)} className="border p-2 rounded" />
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-2 text-sm border p-2 rounded">
                <FileText size={14} />
                <span className="flex-1">{att.name}</span>
                <button onClick={() => removeAttachment(att.id)} className="text-red-600">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Links */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <h2 className="text-lg font-semibold">Video Links</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="url"
            placeholder="Video URL"
            value={videoInput}
            onChange={(e) => setVideoInput(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <input
            type="text"
            placeholder="Title"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button onClick={addVideoLink} className="border px-3 py-2 rounded bg-blue-50 flex items-center gap-1">
            <Plus size={16} /> Add
          </button>
        </div>
        {videoLinks.length > 0 && (
          <div className="space-y-2">
            {videoLinks.map((v) => (
              <div key={v.id} className="flex items-center gap-2 text-sm border p-2 rounded">
                <Video size={14} />
                <span className="flex-1">{v.title}</span>
                <button onClick={() => removeVideo(v.id)} className="text-red-600">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear Rubric */}
      <div className="text-right">
        {loadedRubric && (
          <button onClick={clearRubric} className="mt-2 px-3 py-2 border rounded text-red-600">
            Clear Rubric
          </button>
        )}
      </div>
    </div>
  );
};
export default GradingTemplate;
