import React, { useState, useEffect } from 'react';
import { Upload, Eye, Download, Trash2, Save, AlertTriangle, Settings, Image, FileText, File } from 'lucide-react';

const SchoolLogoSettings = () => {
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoName, setLogoName] = useState('');
  const [logoSize, setLogoSize] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Load saved logo on component mount
  useEffect(() => {
    const savedLogo = sessionStorage.getItem('schoolLogo');
    const savedLogoName = sessionStorage.getItem('schoolLogoName');
    const savedLogoSize = sessionStorage.getItem('schoolLogoSize');
    
    if (savedLogo) {
      setLogo(savedLogo);
      setLogoPreview(savedLogo);
      setLogoName(savedLogoName || 'Unknown');
      setLogoSize(parseInt(savedLogoSize) || 0);
    }
  }, []);

  const handleFileUpload = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, SVG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Logo = e.target.result;
      setLogo(base64Logo);
      setLogoPreview(base64Logo);
      setLogoName(file.name);
      setLogoSize(file.size);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  const saveLogo = () => {
    if (!logo) {
      alert('Please select a logo first');
      return;
    }

    try {
      sessionStorage.setItem('schoolLogo', logo);
      sessionStorage.setItem('schoolLogoName', logoName);
      sessionStorage.setItem('schoolLogoSize', logoSize.toString());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      alert('Error saving logo. Please try again.');
    }
  };

  const removeLogo = () => {
    if (window.confirm('Are you sure you want to remove the school logo?')) {
      sessionStorage.removeItem('schoolLogo');
      sessionStorage.removeItem('schoolLogoName');
      sessionStorage.removeItem('schoolLogoSize');
      setLogo(null);
      setLogoPreview(null);
      setLogoName('');
      setLogoSize(0);
      setSaveStatus('removed');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Sample HTML export preview
  const getExportPreview = () => {
    const currentDate = new Date().toLocaleDateString('en-CA');
    const currentTime = new Date().toLocaleTimeString('en-CA');
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>Grade Report Preview</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-height: 80px; margin-bottom: 10px; }
    .report-title { color: #1e3a8a; margin: 10px 0; }
    .meta { color: #666; font-size: 14px; }
    .sample-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .sample-table th, .sample-table td { 
      border: 1px solid #ddd; 
      padding: 8px; 
      text-align: left; 
    }
    .sample-table th { background-color: #f5f5f5; }
  </style>
</head>
<body>
  <div class="header">
    ${logo ? `<img src="${logo}" alt="School Logo" class="logo" />` : ''}
    <h1 class="report-title">📊 Class Grade Report</h1>
    <div class="meta">
      COMP-101 – Introduction to Programming | Section: A<br>
      Rubric: Portfolio Assignment<br>
      Generated: ${currentDate} | ${currentTime}
    </div>
  </div>
  
  <table class="sample-table">
    <thead>
      <tr>
        <th>#</th><th>Student ID</th><th>Name</th><th>Grade</th><th>Letter</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>1</td><td>S001234</td><td>John Smith</td><td>87%</td><td>A-</td></tr>
      <tr><td>2</td><td>S001235</td><td>Jane Doe</td><td>93%</td><td>A</td></tr>
      <tr><td>3</td><td>S001236</td><td>Bob Johnson</td><td>78%</td><td>B</td></tr>
    </tbody>
  </table>
</body>
</html>`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">School Logo Settings</h1>
          </div>
          <p className="text-gray-600">
            Upload your school or institution logo to be included in all HTML grade reports and PDF exports.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Logo
            </h2>

            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
            >
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop your logo here, or{' '}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                  browse files
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: PNG, JPG, SVG, GIF (Max 5MB)
              </p>
            </div>

            {/* File Info */}
            {logo && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">{logoName}</p>
                    <p className="text-sm text-green-700">Size: {formatFileSize(logoSize)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveLogo}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={removeLogo}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Status */}
            {saveStatus && (
              <div className={`mt-4 p-3 rounded-lg ${
                saveStatus === 'saved' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {saveStatus === 'saved' 
                  ? '✅ Logo saved successfully! It will now appear in all exports.' 
                  : '🗑️ Logo removed successfully.'}
              </div>
            )}

            {/* Guidelines */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-2">Logo Guidelines</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Use high-resolution images for best quality</li>
                    <li>• Recommended size: 200-400px wide</li>
                    <li>• PNG format with transparent background works best</li>
                    <li>• Logo will be automatically resized to fit exports</li>
                    <li>• Stored in session only - will be cleared on restart</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Logo Preview
            </h2>

            {logoPreview ? (
              <div className="space-y-6">
                {/* Current Logo Display */}
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <img 
                    src={logoPreview} 
                    alt="School Logo" 
                    className="max-h-20 max-w-full mx-auto object-contain"
                  />
                  <p className="text-sm text-gray-600 mt-2">Current Logo</p>
                </div>

                {/* Export Preview Button */}
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4" />
                  {showPreview ? 'Hide' : 'Show'} Export Preview
                </button>

                {/* Integration Status */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Integration Status</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      HTML Grade Reports
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      PDF Exports
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      Individual Student Reports
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      Class Summary Reports
                    </div>
                  </div>
                </div>

                {/* Download Sample */}
                <button
                  onClick={() => {
                    const htmlContent = getExportPreview();
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'sample_report_with_logo.html';
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <Download className="h-4 w-4" />
                  Download Sample Report
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No logo uploaded</p>
                <p className="text-sm text-gray-400 mt-1">
                  Upload a logo to see the preview
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Export Preview Modal */}
        {showPreview && logoPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Export Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <div 
                  className="border border-gray-300 rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: getExportPreview() }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <File className="h-5 w-5" />
            Integration Instructions
          </h2>
          
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 mb-4">
              Once you've uploaded and saved your school logo, it will automatically appear in all exports from the GradingPilot system:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">How to access the logo in your code:</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`// Get the saved logo
const schoolLogo = sessionStorage.getItem('schoolLogo');

// Use in HTML exports
const logoHtml = schoolLogo 
  ? \`<img src="\${schoolLogo}" alt="School Logo" class="logo" />\`
  : '';

// Add to your export functions
const htmlContent = \`
<div class="header">
  \${logoHtml}
  <h1>Your Report Title</h1>
</div>
\`;`}
              </pre>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The logo is stored in session storage for privacy compliance. 
                You'll need to re-upload it each time you start a new session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolLogoSettings;