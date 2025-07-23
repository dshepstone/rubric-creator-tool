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

  // UPDATED: Import function to preserve weight percentage
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
      programLevel: assignmentPromptFormData.programLevel || formData.programLevel || 'Semester 3',
      subjectArea: assignmentPromptFormData.subjectArea?.trim() || 'General Studies',
      assignmentDescription: assignmentPromptFormData.assignmentDescription?.trim() || 'Assignment description imported from assignment prompt.',

      // Keep existing settings or set defaults
      criteriaType: formData.criteriaType || 'ai-suggested',
      numCriteria: formData.numCriteria || '4',
      timeFrameUnit: formData.timeFrameUnit || 'weeks',

      // UPDATED: Preserve weight percentage instead of converting to points
      weightPercentage: assignmentPromptFormData.weightPercentage || '',

      // Still calculate points for the prompt, but keep weight separate
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

    alert('Assignment data imported successfully! Weight percentage and all required fields have been populated. Review and adjust as needed.');
  };

  // Use shared form data, fallback to defaults if not available
  const formData = aiPromptFormData || {
    assignmentType: '',
    programType: '',
    programLevel: '',
    subjectArea: '',
    assignmentDescription: '',
    totalPoints: '100',
    weightPercentage: '', // NEW: Add weight percentage field
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
- Weight: ${formData.weightPercentage || 'TBD'}% of Final Grade
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
    "weight": ${formData.weightPercentage || 25},
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
      "description": "Demonstrates solid understanding and competent execution"
    },
    {
      "level": "accomplished",
      "name": "Accomplished",
      "multiplier": 0.95,
      "color": "#16a085",
      "description": "High-quality work showing strong mastery"
    },
    {
      "level": "exceptional",
      "name": "Exceptional",
      "multiplier": 1.0,
      "color": "#8e44ad",
      "description": "Outstanding work exceeding expectations"
    }
  ],
  "criteria": [
    {
      "id": "criterion_example",
      "name": "Example Criterion",
      "description": "Brief description of what this criterion assesses",
      "maxPoints": 25,
      "weight": 25,
      "levels": {
        "incomplete": {
          "pointRange": "0",
          "description": "Detailed description for incomplete level"
        },
        "unacceptable": {
          "pointRange": "1-10",
          "description": "Detailed description for unacceptable level"
        },
        "developing": {
          "pointRange": "11-15",
          "description": "Detailed description for developing level"
        },
        "acceptable": {
          "pointRange": "16-18",
          "description": "Detailed description for acceptable level"
        },
        "proficient": {
          "pointRange": "19-21",
          "description": "Detailed description for proficient level"
        },
        "accomplished": {
          "pointRange": "22-23",
          "description": "Detailed description for accomplished level"
        },
        "exceptional": {
          "pointRange": "24-25",
          "description": "Detailed description for exceptional level"
        }
      },
      "feedbackLibrary": {
        "strengths": [
          "Positive feedback example 1",
          "Positive feedback example 2",
          "Positive feedback example 3"
        ],
        "improvements": [
          "Improvement suggestion 1",
          "Improvement suggestion 2",
          "Improvement suggestion 3"
        ],
        "general": [
          "General feedback 1",
          "General feedback 2",
          "General feedback 3"
        ]
      }
    }
  ],
  "pointingSystem": "multiplier",
  "reversedOrder": false
}
\`\`\`

${formData.criteriaType === 'user-provided' && formData.userCriteria ?
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
            <>
              <div className="space-y-6">
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
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                        <option value="Semester 3">Semester 3</option>
                        <option value="Semester 4">Semester 4</option>
                        <option value="Semester 5">Semester 5</option>
                        <option value="Semester 6">Semester 6</option>
                        <option value="Semester 7">Semester 7</option>
                        <option value="Semester 8">Semester 8</option>
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

                    {/* NEW: Weight Percentage Field */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Weight (% of Final Grade)
                        </label>
                        <input
                          type="number"
                          value={formData.weightPercentage}
                          onChange={(e) => handleInputChange('weightPercentage', e.target.value)}
                          placeholder="25"
                          min="0"
                          max="100"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          💡 Assignment weight for final grade calculation
                        </p>
                      </div>

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
                        <p className="text-xs text-gray-600 mt-1">
                          💡 Total points for this assignment
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Number of Criteria (Optional)
                        </label>
                        <input
                          type="number"
                          value={formData.numCriteria}
                          onChange={(e) => handleInputChange('numCriteria', e.target.value)}
                          placeholder="4"
                          min="1"
                          max="20"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          💡 Choose 1-20 criteria (typically 3-6 for most assignments)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Criteria Generation Method
                        </label>
                        <select
                          value={formData.criteriaType}
                          onChange={(e) => handleInputChange('criteriaType', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="ai-suggested">AI Suggested</option>
                          <option value="user-provided">I'll Provide Criteria</option>
                        </select>
                      </div>
                    </div>

                    {formData.criteriaType === 'user-provided' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Criteria (one per line) *
                        </label>
                        <textarea
                          value={formData.userCriteria}
                          onChange={(e) => handleInputChange('userCriteria', e.target.value)}
                          placeholder="For example:
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
                      <textarea
                        value={formData.specialConsiderations}
                        onChange={(e) => handleInputChange('specialConsiderations', e.target.value)}
                        placeholder="Any accessibility needs, technology requirements, or other considerations..."
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={generatePrompt}
                    disabled={!isFormValid}
                    className={`px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-3 transition-all ${isFormValid
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <Sparkles className="w-6 h-6" />
                    Generate AI Prompt
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>

                {!isFormValid && (
                  <div className="text-center">
                    <p className="text-sm text-red-600">
                      Please fill in all required fields (*) to generate the prompt
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {/* Generated Prompt Display */}
              <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{generatedPrompt}</pre>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Copy to Clipboard
                </button>
                <button
                  onClick={exportPrompt}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download as File
                </button>
                <button
                  onClick={() => setShowPrompt(false)}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Go back to Rubric Generator
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Next Steps
                </h4>
                <ol className="text-blue-700 space-y-1 text-sm">
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