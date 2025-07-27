/**
 * School Logo Integration Utility
 * Helper functions to integrate school logos into exports
 */

/**
 * Get the saved school logo from session storage
 * @returns {string|null} Base64 encoded logo or null if not found
 */
export const getSchoolLogo = () => {
    try {
        return sessionStorage.getItem('schoolLogo');
    } catch (error) {
        console.warn('Error accessing school logo from session storage:', error);
        return null;
    }
};

/**
 * Get school logo metadata
 * @returns {object} Object containing logo name, size, and data
 */
export const getSchoolLogoInfo = () => {
    try {
        const logo = sessionStorage.getItem('schoolLogo');
        const name = sessionStorage.getItem('schoolLogoName');
        const size = sessionStorage.getItem('schoolLogoSize');

        return {
            logo,
            name: name || 'Unknown',
            size: parseInt(size) || 0,
            exists: !!logo
        };
    } catch (error) {
        console.warn('Error accessing school logo info:', error);
        return {
            logo: null,
            name: 'Unknown',
            size: 0,
            exists: false
        };
    }
};

/**
 * Check if school logo exists
 * @returns {boolean} True if logo exists
 */
export const hasSchoolLogo = () => {
    return !!getSchoolLogo();
};

/**
 * Generate HTML for logo display in exports
 * @param {object} options - Styling options for the logo
 * @returns {string} HTML string for logo or empty string if no logo
 */
export const getLogoHtml = (options = {}) => {
    const logo = getSchoolLogo();
    if (!logo) return '';

    const {
        className = 'school-logo',
        style = '',
        alt = 'School Logo',
        maxHeight = 80,
        maxWidth = 300
    } = options;

    const inlineStyle = `max-height: ${maxHeight}px; max-width: ${maxWidth}px; object-fit: contain; ${style}`;

    return `<img src="${logo}" alt="${alt}" class="${className}" style="${inlineStyle}" />`;
};

/**
 * UPDATED: Enhanced HTML header with logo positioned on the right side
 * @param {object} reportData - Report information
 * @param {object} logoOptions - Logo styling options
 * @returns {string} Complete HTML header with logo on right side
 */
export const generateReportHeader = (reportData, logoOptions = {}) => {
    const {
        title = 'Grade Report',
        courseCode = '',
        courseName = '',
        section = '',
        rubricTitle = 'Unnamed Rubric'
    } = reportData;

    const currentDate = new Date().toLocaleDateString('en-CA');
    const currentTime = new Date().toLocaleTimeString('en-CA');

    const logoHtml = getLogoHtml({
        className: 'report-logo',
        maxHeight: 80,
        style: 'margin-bottom: 10px;',
        ...logoOptions
    });

    return `
    <div class="header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px;">
      <div class="header-content" style="flex: 1;">
        <h1 style="color: #1e3a8a; margin: 0 0 10px 0; font-size: 24px;">${title}</h1>
        <div class="meta" style="color: #666; font-size: 14px; line-height: 1.5;">
          ${courseCode ? `<strong>${courseCode}</strong> – ${courseName}${section ? ` | Section: ${section}` : ''}<br>` : ''}
          ${rubricTitle ? `Rubric: ${rubricTitle}<br>` : ''}
          Generated: ${currentDate} | ${currentTime}
        </div>
      </div>
      ${logoHtml ? `<div class="logo-container" style="flex-shrink: 0; margin-left: 20px;">${logoHtml}</div>` : ''}
    </div>`;
};

/**
 * NEW: Generate assignment header with logo positioned on the right side
 * @param {object} assignmentData - Assignment information
 * @param {object} logoOptions - Logo styling options
 * @returns {string} Complete HTML header for assignments
 */
export const generateAssignmentHeader = (assignmentData, logoOptions = {}) => {
    const {
        title = 'Assignment',
        assignmentNumber = '',
        courseCode = '',
        weight = ''
    } = assignmentData;

    const logoHtml = getLogoHtml({
        className: 'assignment-logo',
        maxHeight: 60,
        style: 'margin-bottom: 0;',
        ...logoOptions
    });

    return `
    <div class="assignment-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
      <div class="assignment-info" style="flex: 1;">
        <h1 style="color: #1e40af; margin: 0 0 5px 0; font-size: 28px;">Assignment ${assignmentNumber}: ${title}</h1>
        <div class="assignment-meta" style="color: #666; font-size: 14px;">
          ${courseCode ? `<span style="font-weight: 500;">${courseCode}</span> | ` : ''}Weight: ${weight}% of final grade
        </div>
      </div>
      ${logoHtml ? `<div class="logo-container" style="flex-shrink: 0; margin-left: 20px;">${logoHtml}</div>` : ''}
    </div>`;
};

/**
 * Complete CSS styles for logo-enhanced reports
 * @returns {string} CSS styles including logo styling
 */
export const getReportStyles = () => {
    return `
    <style>
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        margin: 20px; 
        line-height: 1.6; 
        color: #333;
      }
      .header { 
        text-align: center; 
        margin-bottom: 30px; 
        padding-bottom: 20px; 
        border-bottom: 2px solid #e5e7eb;
      }
      .school-logo, .report-logo { 
        max-height: 80px; 
        max-width: 300px; 
        object-fit: contain; 
        margin-bottom: 10px;
        display: block;
        margin-left: auto;
        margin-right: auto;
      }
      .report-title { 
        color: #1e3a8a; 
        margin: 10px 0; 
        font-size: 24px;
        font-weight: bold;
      }
      .meta { 
        color: #666; 
        font-size: 14px; 
        line-height: 1.5;
      }
      .table-container { 
        overflow-x: auto; 
        margin: 20px 0;
      }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-top: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      th, td { 
        border: 1px solid #d1d5db; 
        padding: 12px 8px; 
        text-align: left; 
      }
      th { 
        background-color: #f9fafb; 
        font-weight: 600;
        color: #374151;
      }
      tr:nth-child(even) { 
        background-color: #f9fafb; 
      }
      tr:hover { 
        background-color: #f3f4f6; 
      }
      .footer { 
        text-align: center; 
        color: #666; 
        margin-top: 30px; 
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
      }
      @media print { 
        body { background: white; }
        .table-container { overflow-x: visible; }
        .school-logo, .report-logo { 
          max-height: 60px; 
          break-inside: avoid;
        }
      }
    </style>
  `;
};