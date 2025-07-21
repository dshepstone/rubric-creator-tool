import React, { useState } from 'react';
import { Download, Sparkles, FileText, ArrowRight, Lightbulb, Upload } from 'lucide-react';
import { useAssessment } from './SharedContext';

const AIRubricPromptGenerator = () => {
  const {
    aiPromptFormData,
    updateAIPromptFormData,
    initializeAIPromptFormData,
    assignmentPromptFormData // ADD: Access to assignment data
  } = useAssessment();

  // Initialize form data if it doesn't exist
  React.useEffect(() => {
    if (!aiPromptFormData) {
      initializeAIPromptFormData();
    }
  }, [aiPromptFormData, initializeAIPromptFormData]);

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);

  const handleInputChange = (field, value) => {
    updateAIPromptFormData(field, value);
  };

  // ADD: Import function to map assignment data to AI prompt format
  const importAssignmentData = () => {
    if (!assignmentPromptFormData) {
      alert('No assignment data found to import. Please create an assignment first.');
      return;
    }

    // Map assignment data to AI prompt fields
    const mappedData = {
      // Ensure all required fields have values (no empty strings)
      assignmentType: assignmentPromptFormData.assignmentTitle?.trim() || 'Assignment',
      programType: formData.programType || 'Diploma',
      programLevel: assignmentPromptFormData.programLevel || formData.programLevel || 'Level (Semester) 3',
      subjectArea: assignmentPromptFormData.subjectArea?.trim() || 'General Studies',
      assignmentDescription: assignmentPromptFormData.assignmentDescription?.trim() || 'Assignment description imported from assignment prompt.',

      // Keep existing settings or set defaults
      criteriaType: formData.criteriaType || 'ai-suggested',
      numCriteria: formData.numCriteria || '4',
      timeFrameUnit: formData.timeFrameUnit || 'weeks',

      // Convert weight percentage to points (multiply by 4 to get reasonable point total)
      totalPoints: assignmentPromptFormData.weightPercentage ?
        (parseInt(assignmentPromptFormData.weightPercentage) * 4).toString() : '100',

      // Format learning outcomes from CLOs
      learningObjectives: assignmentPromptFormData.clos ?
        assignmentPromptFormData.clos
          .filter(clo => clo.text && clo.text.trim()) // Only include CLOs with text
          .map(clo => `${clo.type}${clo.number}: ${clo.text}`)
          .join('\n') : '',

      // Map special instructions to special considerations
      specialConsiderations: assignmentPromptFormData.specialInstructions?.trim() || '',

      // Set other fields
      studentPopulation: formData.studentPopulation || 'Mixed Ability',
      timeFrameNumber: formData.timeFrameNumber || '',
      userCriteria: formData.userCriteria || ''
    };

    // Update all the mapped data
    Object.entries(mappedData).forEach(([field, value]) => {
      updateAIPromptFormData(field, value);
    });

    alert('Assignment data imported successfully! All required fields have been populated. Review and adjust as needed.');
  };

  // Use shared form data, fallback to defaults if not available
  const formData = aiPromptFormData || {
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
  };

  // Force re-render when aiPromptFormData changes to ensure validation updates
  React.useEffect(() => {
    // This effect will run whenever aiPromptFormData changes, ensuring validation is rechecked
  }, [aiPromptFormData]);

  const generatePrompt = () => {
    const courseLevel = `${formData.programType} - ${formData.programLevel}`;
    const criteriaCount = formData.numCriteria || '4-6';
    const timeFrame = formData.timeFrameNumber ?
      `${formData.timeFrameNumber} ${formData.timeFrameUnit}` :
      'Standard assignment duration';

    // Criteria instructions based on user selection
    const criteriaInstructions = formData.criteriaType === 'user-provided' && formData.userCriteria
      ? `\n**User-Specified Criteria to Include:**\n${formData.userCriteria}\n\nPlease use these criteria as the basis for your rubric. You may refine the names and add detailed descriptions, but ensure all listed criteria are included.`
      : `\n**Criteria Generation:**\nPlease suggest ${criteriaCount} appropriate criteria for this ${formData.subjectArea} assignment. Base your suggestions on best practices for ${formData.assignmentType} assessment and the specified learning context.`;

    const prompt = `Create a comprehensive educational rubric for the following assignment:

**Assignment Type:** ${formData.assignmentType}
**Course Level:** ${courseLevel}
**Subject Area:** ${formData.subjectArea}
**Assignment Description:** ${formData.assignmentDescription}${criteriaInstructions}

**Specific Requirements:**
- Total Points: ${formData.totalPoints} points
- Number of Criteria: ${criteriaCount} main criteria
- Assessment Levels: Use this 7-level system:
  1. Incomplete (0x multiplier)
  2. Unacceptable (0.4x multiplier) 
  3. Developing (0.6x multiplier)
  4. Acceptable - PASS (0.75x multiplier)
  5. Proficient (0.85x multiplier)
  6. Accomplished (0.95x multiplier)
  7. Exceptional (1.0x multiplier)

**Output Format Required:**
Please provide the output as a complete JSON file matching this exact structure:

\`\`\`json
{
  "assignmentInfo": {
    "title": "${formData.assignmentType}",
    "description": "${formData.assignmentDescription}",
    "weight": 30,
    "totalPoints": ${formData.totalPoints},
    "passingThreshold": 65,
    "dueDate": "2025-04-15",
    "courseCode": "COURSE_CODE",
    "instructor": "Instructor Name"
  },
  "rubricLevels": [
    {
      "level": "incomplete",
      "name": "Incomplete",
      "multiplier": 0,
      "color": "#95a5a6",
      "description": "Work not submitted or completely unusable"
    },
    {
      "level": "unacceptable",
      "name": "Unacceptable", 
      "multiplier": 0.4,
      "color": "#e74c3c",
      "description": "Major deficiencies that prevent basic functionality"
    },
    {
      "level": "developing",
      "name": "Developing",
      "multiplier": 0.6,
      "color": "#f39c12",
      "description": "Shows effort but significant improvements needed"
    },
    {
      "level": "acceptable",
      "name": "Acceptable",
      "multiplier": 0.75,
      "color": "#27ae60",
      "description": "Meets basic requirements and learning objectives"
    },
    {
      "level": "proficient",
      "name": "Proficient",
      "multiplier": 0.85,
      "color": "#2980b9",
      "description": "Solid work that exceeds basic requirements"
    },
    {
      "level": "accomplished",
      "name": "Accomplished",
      "multiplier": 0.95,
      "color": "#16a085",
      "description": "High-quality work demonstrating advanced skills"
    },
    {
      "level": "exceptional",
      "name": "Exceptional",
      "multiplier": 1.0,
      "color": "#8e44ad",
      "description": "Outstanding work suitable for professional portfolio"
    }
  ],
  "criteria": [
    // Generate ${criteriaCount} criteria objects here, each with this EXACT structure:
    {
      "id": "descriptive_id_here", // Use descriptive IDs like "animation_principles", "technical_execution"
      "name": "Criterion Name Here",
      "description": "What this criterion measures",
      "maxPoints": 20, // Distribute ${formData.totalPoints} points across ${criteriaCount} criteria
      "feedbackLibrary": {
        "strengths": [
          "Strength comment 1",
          "Strength comment 2",
          // ... 8-12 total strength comments
        ],
        "improvements": [
          "Improvement suggestion 1", 
          "Improvement suggestion 2",
          // ... 8-12 total improvement comments
        ],
        "general": [
          "General comment 1",
          "General comment 2", 
          // ... 8-10 total general comments
        ]
      },
      "levels": {
        "incomplete": {
          "pointRange": "0",
          "description": "Description for incomplete level"
        },
        "unacceptable": {
          "pointRange": "X-Y",
          "description": "Description for unacceptable level"
        },
        "developing": {
          "pointRange": "X-Y",
          "description": "Description for developing level"
        },
        "acceptable": {
          "pointRange": "X-Y",
          "description": "Description for acceptable level"
        },
        "proficient": {
          "pointRange": "X-Y",
          "description": "Description for proficient level"
        },
        "accomplished": {
          "pointRange": "X-Y",
          "description": "Description for accomplished level"
        },
        "exceptional": {
          "pointRange": "X",
          "description": "Description for exceptional level (full points)"
        }
      }
    }
    // Repeat this structure for each criterion
  ]
}
\`\`\`

For each criterion, provide:
- Criterion name and appropriate point weight (distribute ${formData.totalPoints} points across ${criteriaCount} criteria)
- Brief description of what it measures
- Detailed performance descriptions for each of the 7 levels as objects with "pointRange" and "description"
- Feedback library with 8-12 "strengths" comments, 8-12 "improvements" comments, and 8-10 "general" comments

${formData.criteriaType === 'user-provided' ?
        `**NOTE:** The user has provided specific criteria. Ensure all listed criteria are included and refined with professional descriptions appropriate for ${formData.subjectArea} assessment.` :
        `**NOTE:** Generate appropriate criteria based on best practices for ${formData.assignmentType} assessment in ${formData.subjectArea}.`}

**CRITICAL FORMAT REQUIREMENTS:**
- Use descriptive IDs like "animation_principles", "technical_execution" for criterion IDs
- The "levels" object must contain objects with "pointRange" and "description" properties
- Calculate appropriate point ranges for each level based on the criterion's maxPoints
- Each level (incomplete, unacceptable, developing, acceptable, proficient, accomplished, exceptional) should be an object with pointRange and description
- Ensure the JSON is valid and complete - test it in a JSON validator before providing
- The output must be importable directly into the Rubric Creator tool

**Additional Context:**
- Learning objectives: ${formData.learningObjectives || 'To be determined based on assignment type'}
- Student population: ${formData.studentPopulation || 'Mixed ability'}
- Time frame: ${timeFrame}
- Special considerations: ${formData.specialConsiderations || 'None specified'}

Please generate a complete, ready-to-import, downloadable JSON file that matches the structure exactly and can be directly imported into the Rubric Creator tool.`;

    setGeneratedPrompt(prompt);
    setShowPrompt(true);
  };

  const exportPrompt = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedPrompt], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ai-rubric-prompt-${formData.assignmentType.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    alert('Prompt copied to clipboard!');
  };

  const isFormValid = formData.assignmentType?.trim() && formData.programType?.trim() &&
    formData.programLevel?.trim() && formData.subjectArea?.trim() && formData.assignmentDescription?.trim() &&
    (formData.criteriaType === 'ai-suggested' ||
      (formData.criteriaType === 'user-provided' && formData.userCriteria?.trim()));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        {/* UPDATED Header with Import Button */}
        <div className="bg-blue-900 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">AI Rubric Prompt Generator</h1>
                <p className="text-white">Generate AI prompts to create rubric JSON files for import</p>
              </div>
            </div>

            {/* ADD: Import Button */}
            {assignmentPromptFormData && (
              <button
                onClick={importAssignmentData}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-white/20"
                title="Import data from Assignment Prompt page"
              >
                <Upload className="w-4 h-4" />
                Import Assignment Data
              </button>
            )}
          </div>

          {/* ADD: Import Status Indicator */}
          {assignmentPromptFormData && (
            <div className="mt-3 text-sm text-blue-100">
              Available: {assignmentPromptFormData.assignmentTitle || 'Assignment'}
              {assignmentPromptFormData.assignmentNumber && ` #${assignmentPromptFormData.assignmentNumber}`}
              {assignmentPromptFormData.weightPercentage && ` (${assignmentPromptFormData.weightPercentage}%)`}
            </div>
          )}
        </div>

        <div className="p-6">
          {!showPrompt ? (
            <div>
              {/* Workflow Guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">How This Works</h3>
                    <div className="flex items-center gap-2 text-sm text-blue-800 mb-2">
                      <span className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center font-bold">1</span>
                      <span>Fill out assignment info & choose criteria method</span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center font-bold">2</span>
                      <span>Generate AI prompt</span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center font-bold">3</span>
                      <span>Copy to AI tool</span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center font-bold">4</span>
                      <span>Import JSON to Rubric Creator</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      💾 <strong>Note:</strong> Your form data is automatically saved and will persist when switching between tabs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assignment Type *
                    </label>
                    <input
                      type="text"
                      value={formData.assignmentType}
                      onChange={(e) => handleInputChange('assignmentType', e.target.value)}
                      placeholder="e.g., Research Paper, Digital Portfolio, Laboratory Report"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Program Type *
                    </label>
                    <select
                      value={formData.programType}
                      onChange={(e) => handleInputChange('programType', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select program type...</option>
                      <option value="Degree">Degree</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Graduate Certificate">Graduate Certificate</option>
                      <option value="Certificate">Certificate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Program Level *
                    </label>
                    <select
                      value={formData.programLevel}
                      onChange={(e) => handleInputChange('programLevel', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select program level...</option>
                      <option value="Level (Semester) 1">Level (Semester) 1</option>
                      <option value="Level (Semester) 2">Level (Semester) 2</option>
                      <option value="Level (Semester) 3">Level (Semester) 3</option>
                      <option value="Level (Semester) 4">Level (Semester) 4</option>
                      <option value="Level (Semester) 5">Level (Semester) 5</option>
                      <option value="Level (Semester) 6">Level (Semester) 6</option>
                      <option value="Level (Semester) 7">Level (Semester) 7</option>
                      <option value="Level (Semester) 8">Level (Semester) 8</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject Area *
                    </label>
                    <input
                      type="text"
                      value={formData.subjectArea}
                      onChange={(e) => handleInputChange('subjectArea', e.target.value)}
                      placeholder="e.g., English Literature, Computer Science, Biology"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Total Points
                      </label>
                      <input
                        type="number"
                        value={formData.totalPoints}
                        onChange={(e) => handleInputChange('totalPoints', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Number of Criteria (Optional)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.numCriteria}
                        onChange={(e) => handleInputChange('numCriteria', e.target.value)}
                        placeholder="e.g., 4 or 5 criteria"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Criteria Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Criteria Generation Method
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="ai-suggested"
                          name="criteriaType"
                          value="ai-suggested"
                          checked={formData.criteriaType === 'ai-suggested'}
                          onChange={(e) => handleInputChange('criteriaType', e.target.value)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="ai-suggested" className="ml-2 text-sm text-gray-700">
                          <strong>AI Suggested Criteria</strong> - Let AI suggest appropriate criteria for this subject area
                        </label>
                      </div>
                      <div className="flex items-start">
                        <input
                          type="radio"
                          id="user-provided"
                          name="criteriaType"
                          value="user-provided"
                          checked={formData.criteriaType === 'user-provided'}
                          onChange={(e) => handleInputChange('criteriaType', e.target.value)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 mt-1"
                        />
                        <label htmlFor="user-provided" className="ml-2 text-sm text-gray-700">
                          <strong>User Listed Criteria</strong> - Provide your own specific criteria list
                        </label>
                      </div>
                    </div>

                    {/* User Criteria Text Area */}
                    {formData.criteriaType === 'user-provided' && (
                      <div className="mt-3">
                        <textarea
                          value={formData.userCriteria}
                          onChange={(e) => handleInputChange('userCriteria', e.target.value)}
                          placeholder="List your criteria, one per line or separated by commas. For example:
• Technical Execution & Craft
• Creative Problem Solving
• Research & Process Documentation
• Presentation Quality"
                          rows="6"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          💡 Tip: List the specific criteria you want included. AI will create detailed descriptions and level definitions for each one.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assignment Description *
                    </label>
                    <textarea
                      value={formData.assignmentDescription}
                      onChange={(e) => handleInputChange('assignmentDescription', e.target.value)}
                      placeholder="Brief description of what students need to create/submit..."
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Learning Objectives
                    </label>
                    <textarea
                      value={formData.learningObjectives}
                      onChange={(e) => handleInputChange('learningObjectives', e.target.value)}
                      placeholder="List 2-3 key learning goals..."
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Student Skill Level & Population
                    </label>
                    <select
                      value={formData.studentPopulation}
                      onChange={(e) => handleInputChange('studentPopulation', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select student population...</option>
                      <option value="Beginner/Entry Level">Beginner/Entry Level</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Mixed Ability">Mixed Ability</option>
                      <option value="First-Year Students">First-Year Students</option>
                      <option value="Second-Year Students">Second-Year Students</option>
                      <option value="Third-Year Students">Third-Year Students</option>
                      <option value="Final-Year Students">Final-Year Students</option>
                      <option value="Graduate Students">Graduate Students</option>
                      <option value="Adult Learners/Continuing Education">Adult Learners/Continuing Education</option>
                      <option value="International Students">International Students</option>
                      <option value="Students with Learning Accommodations">Students with Learning Accommodations</option>
                      <option value="High-Achieving Students">High-Achieving Students</option>
                      <option value="Students Needing Additional Support">Students Needing Additional Support</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assignment Duration (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={formData.timeFrameNumber}
                      onChange={(e) => handleInputChange('timeFrameNumber', e.target.value)}
                      placeholder="e.g., 2"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={formData.timeFrameUnit}
                      onChange={(e) => handleInputChange('timeFrameUnit', e.target.value)}
                      className="w-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="days">days</option>
                      <option value="weeks">weeks</option>
                      <option value="months">months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Special Considerations
                  </label>
                  <input
                    type="text"
                    value={formData.specialConsiderations}
                    onChange={(e) => handleInputChange('specialConsiderations', e.target.value)}
                    placeholder="Accessibility, technology, or other requirements"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => {
                    initializeAIPromptFormData();
                    setShowPrompt(false);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Clear Form
                </button>

                <button
                  onClick={generatePrompt}
                  disabled={!isFormValid}
                  className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all ${isFormValid
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  <Sparkles className="w-5 h-5" />
                  Generate AI Prompt
                </button>
              </div>

              {/* Auto-save indicator */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  💾 Form data is automatically saved as you type
                </p>
              </div>
            </div>
          ) : (
            <div>
              {/* Generated Prompt Display */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Generated AI Prompt</h2>
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="text-gray-600 hover:text-gray-800 underline"
                  >
                    ← Back to Form
                  </button>
                </div>

                <div className="bg-gray-100 border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {generatedPrompt}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <FileText className="w-5 h-5" />
                  Copy to Clipboard
                </button>

                <button
                  onClick={exportPrompt}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  Export as Text File
                </button>
              </div>

              {/* Next Steps */}
              <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Next Steps:</h3>
                <ol className="text-sm text-green-800 space-y-1">
                  <li>1. Copy the prompt above</li>
                  <li>2. Paste it into your preferred AI tool (ChatGPT, Claude, etc.)</li>
                  <li>3. The AI will generate a complete JSON file</li>
                  <li>4. Save the JSON file and import it into the Rubric Creator</li>
                  <li>5. Customize and refine the rubric as needed</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRubricPromptGenerator;