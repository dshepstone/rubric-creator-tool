import * as XLSX from 'xlsx';

export const parseExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first worksheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const students = parseStudentData(jsonData);
                resolve(students);
            } catch (error) {
                reject(new Error(`Excel parsing failed: ${error.message}`));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
};

const parseStudentData = (data) => {
    if (data.length < 2) {
        throw new Error('Excel file must contain header row and at least one student');
    }

    const headers = data[0].map(h => h?.toString().toLowerCase().trim() || '');
    const students = [];

    // Flexible column detection
    const findColumn = (patterns) => {
        for (const pattern of patterns) {
            const index = headers.findIndex(h => h.includes(pattern));
            if (index !== -1) return index;
        }
        return -1;
    };

    const idCol = findColumn(['id', 'student_id', 'studentid', 'number']);
    const nameCol = findColumn(['name', 'student_name', 'studentname', 'full name']);
    const emailCol = findColumn(['email', 'student_email', 'studentemail', 'e-mail']);

    // Parse student rows
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.every(cell => !cell)) continue;

        const student = {
            id: idCol !== -1 ? row[idCol]?.toString().trim() : `student-${i}`,
            name: nameCol !== -1 ? row[nameCol]?.toString().trim() : 'Unknown Student',
            email: emailCol !== -1 ? (row[emailCol]?.toString().trim() || '') : '',
            program: '',
            level: '',
            status: 'Enrolled'
        };

        if (student.id && student.name) {
            students.push(student);
        }
    }

    return students;
};