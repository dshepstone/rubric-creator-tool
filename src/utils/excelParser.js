// utils/excelParser.js
import * as XLSX from 'xlsx';

/**
 * Parse Excel file and extract students + metadata
 */
export const parseExcelFile = async (file) => {
    try {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false });

        // 1️⃣ Find the real “Component | ID | Name…” header row
        const tableInfo = findStudentDataTable(raw);
        if (!tableInfo.found) throw new Error('Couldn’t locate the student table header.');

        // 2️⃣ Slice out just the student rows
        const headers = raw[tableInfo.headerRow];
        const rows = raw.slice(tableInfo.dataStartRow, tableInfo.dataEndRow + 1);
        const students = parseStudentData(headers, rows);

        // 3️⃣ Pull in all the extra course-level info
        const courseMetadata = extractCourseMetadata(raw, students);

        return {
            success: true,
            students,
            courseMetadata,
            totalRows: raw.length,
            dataRows: rows.length,
            headers,
            tableInfo,
            message: `Parsed ${students.length} students from ${rows.length} rows.`
        };

    } catch (err) {
        console.error(err);
        return {
            success: false,
            error: err.message,
            students: []
        };
    }
};

/**
 * Validate student array (no changes here)
 */
export const validateStudentData = (students) => {
    const validation = {
        totalStudents: students.length,
        validStudents: 0,
        issues: [],
        completeness: { withId: 0, withName: 0, withEmail: 0, withProgram: 0, withLevel: 0, withCampus: 0, withStatus: 0 },
        duplicateIds: [],
        invalidEmails: [],
        missingRequired: [],
        validationScore: 0
    };
    const seen = new Set();

    students.forEach((s, i) => {
        let ok = true;
        // ID
        if (!s.id) {
            validation.issues.push(`Row ${i + 1}: Missing ID`); ok = false;
        } else {
            validation.completeness.withId++;
            if (seen.has(s.id)) {
                validation.duplicateIds.push(s.id);
                validation.issues.push(`Row ${i + 1}: Duplicate ID ${s.id}`);
                ok = false;
            }
            seen.add(s.id);
        }
        // Name
        if (!s.name) {
            validation.issues.push(`Row ${i + 1}: Missing Name`); ok = false;
        } else {
            validation.completeness.withName++;
        }
        // Email (optional)
        if (s.email) {
            validation.completeness.withEmail++;
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!re.test(s.email)) {
                validation.invalidEmails.push(s.email);
                validation.issues.push(`Row ${i + 1}: Bad Email ${s.email}`);
            }
        }
        // Program, Level, Campus, Status
        if (s.program) validation.completeness.withProgram++;
        if (s.level) validation.completeness.withLevel++;
        if (s.campus) validation.completeness.withCampus++;
        if (s.status) validation.completeness.withStatus++;

        if (ok) validation.validStudents++;
    });

    validation.validationScore = students.length
        ? Math.round((validation.validStudents / students.length) * 100)
        : 0;

    return validation;
};


/*–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––*/
/*                            Internal helpers                             */
/*–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––*/

// 1) Locate the header row by looking for at least 4 of our known column names
const findStudentDataTable = (data) => {
    const isHeader = (r) => {
        const txt = r.join(' ').toLowerCase();
        return ['component', 'id', 'name', 'email', 'program', 'level', 'campus', 'status']
            .filter(t => txt.includes(t)).length >= 4;
    };
    for (let i = 0; i < data.length; i++) {
        if (isHeader(data[i])) {
            const start = i + 1;
            const end = findDataEndRow(data, start);
            return { found: true, headerRow: i, dataStartRow: start, dataEndRow: end };
        }
    }
    return { found: false };
};

// 2) Walk forward until a row has <3 non-blank cells
const findDataEndRow = (data, start) => {
    let last = start;
    for (let i = start; i < data.length; i++) {
        const nonBlank = data[i].filter(c => String(c).trim() !== '').length;
        if (nonBlank < 3) break;
        last = i;
    }
    return last;
};

// 3) Map headers → student props
const parseStudentData = (hdrs, rows) => {
    const idx = {};
    hdrs.forEach((h, i) => {
        const t = String(h).toLowerCase();
        if (t.includes('component')) idx.component = i;
        if (t.includes('id')) idx.id = i;
        if (t.includes('name')) idx.name = i;
        if (t.includes('email')) idx.email = i;
        if (t.includes('program')) idx.program = i;
        if (t.includes('level')) idx.level = i;
        if (t.includes('campus')) idx.campus = i;
        if (t.includes('status')) idx.status = i;
    });

    return rows
        .map(r => ({
            component: String(r[idx.component] || '').trim(),
            id: String(r[idx.id] || '').trim(),
            name: String(r[idx.name] || '').trim(),
            email: String(r[idx.email] || '').trim(),
            program: String(r[idx.program] || '').trim(),
            level: String(r[idx.level] || '').trim(),
            campus: String(r[idx.campus] || '').trim(),
            status: String(r[idx.status] || '').trim(),
        }))
        .filter(s => s.id && s.name);
};

// 4) Extract **all** header-card fields
const extractCourseMetadata = (raw, students) => {
    const md = {
        courseCode: '',
        courseName: '',
        section: '',
        campus: '',
        professors: '',
        term: '',
        hours: '',
        gradeScale: '',
        department: '',
        totalStudents: students.length
    };

    const nextNonEmpty = (row, i) => {
        for (let j = i + 1; j < row.length; j++) {
            if (String(row[j]).trim() !== '') return String(row[j]).trim();
        }
        return '';
    };

    for (let i = 0; i < Math.min(raw.length, 15); i++) {
        const row = raw[i].map(c => String(c).trim());
        const line = row.join(' ');

        // — Term —
        const tm = line.match(/\b(Fall|Winter|Spring|Summer)\s+(\d{4})\b/);
        if (tm) md.term = `${tm[1]} ${tm[2]}`;

        // — Code / Name / Section / Campus —
        // row[0] like "DSGN8060 - Animation Methodologies II (100)  Section 1 - Doon"
        if (!md.courseCode && row[0].match(/^([A-Z0-9]+)\s*[-–]/)) {
            const parts = row[0].split(/[-–]/).map(p => p.trim());
            md.courseCode = parts[0];
            // rebuild the rest without parentheses
            let rest = parts.slice(1).join(' - ').replace(/\(.*?\)/g, '').trim();

            // Section
            const S = rest.match(/Section\s+(\w+)/i);
            if (S) md.section = `Section ${S[1]}`;

            // Campus = last part
            if (parts.length >= 3) {
                md.campus = `${parts[parts.length - 1].trim()} Campus`;
            }

            // Course name = text before "Section"
            md.courseName = rest.split(/Section/i)[0].trim();
        }

        // — Professors —
        const pi = row.findIndex(c => /Professors?:/i.test(c));
        if (pi > -1) {
            md.professors = nextNonEmpty(row, pi);
        }

        // — Hours —
        const hi = row.findIndex(c => /Hours:/i.test(c));
        if (hi > -1) {
            md.hours = nextNonEmpty(row, hi);
        }

        // — Grade Scale —
        const gi = row.findIndex(c => /Grade Scale:/i.test(c));
        if (gi > -1) {
            md.gradeScale = nextNonEmpty(row, gi);
        }

        // — Department (Delivery Dept:) —
        const di = row.findIndex(c => /(Delivery\s+)?Dept:/i.test(c));
        if (di > -1) {
            md.department = nextNonEmpty(row, di);
        }
    }

    return md;
};
