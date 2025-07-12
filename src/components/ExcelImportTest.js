// components/ExcelImportTest.js
import React, { useState } from 'react';
import { parseExcelFile, validateStudentData } from '../utils/excelParser';
import {
    Upload, FileText, Users, BookOpen,
    CheckCircle, AlertCircle, Info
} from 'lucide-react';

export default function ExcelImportTest() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);

    const handleUpload = async (f) => {
        if (!f) return;
        setFile(f);
        setLoading(true);
        setResult(null);

        const res = await parseExcelFile(f);
        if (res.success) {
            const validation = validateStudentData(res.students);
            setResult({ ...res, validation, fileName: f.name, fileSize: f.size, importTime: new Date().toLocaleString() });
        } else {
            setResult(res);
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: 1000, margin: '2rem auto', fontFamily: 'sans-serif' }}>
            <h1>📊 Excel Class List Import Test</h1>
            {!result && (
                <div style={{ border: '2px dashed #ccc', padding: '2rem', textAlign: 'center' }}>
                    <FileText size={48} />
                    <p>Upload your Class List Excel (.xls/.xlsx)</p>
                    <input
                        type="file"
                        accept=".xls,.xlsx"
                        style={{ display: 'none' }}
                        id="upload"
                        onChange={e => handleUpload(e.target.files[0])}
                        disabled={loading}
                    />
                    <label htmlFor="upload" style={{
                        display: 'inline-block', padding: '0.5rem 1rem',
                        background: '#3b82f6', color: 'white', borderRadius: 4,
                        cursor: 'pointer'
                    }}>
                        {loading ? 'Processing…' : 'Choose File'}
                    </label>
                </div>
            )}

            {result && (
                <>
                    {/* Import Summary */}
                    <div style={{
                        background: result.success ? '#dcfce7' : '#fee2e2',
                        border: `1px solid ${result.success ? '#86efac' : '#fca5a5'}`,
                        padding: '1rem', borderRadius: 6, marginTop: '1rem'
                    }}>
                        {result.success ? <CheckCircle color="#16a34a" /> : <AlertCircle color="#991b1b" />}
                        <strong style={{ marginLeft: 8 }}>
                            {result.success ? 'Import Successful!' : 'Import Failed'}
                        </strong>
                        {result.success && (
                            <div style={{ marginTop: 8, display: 'flex', gap: '2rem' }}>
                                <div><strong>File:</strong> {result.fileName} ({(result.fileSize / 1024).toFixed(1)} KB)</div>
                                <div><strong>Imported:</strong> {result.importTime}</div>
                                <div><strong>Students:</strong> {result.students.length}</div>
                                <div><strong>Data Quality:</strong> {result.validation.validationScore}%</div>
                            </div>
                        )}
                        {!result.success && <p style={{ marginTop: 8, color: '#991b1b' }}>{result.error}</p>}
                    </div>

                    {/* Course Info */}
                    {result.success && result.courseMetadata && (
                        <div style={{
                            border: '1px solid #bfdbfe', background: '#eff6ff',
                            padding: '1rem', borderRadius: 6, marginTop: '1rem'
                        }}>
                            <BookOpen color="#3b82f6" /><strong style={{ marginLeft: 8 }}>Course Information</strong>
                            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {[
                                    ['Course Code', result.courseMetadata.courseCode],
                                    ['Course Name', result.courseMetadata.courseName],
                                    ['Section', result.courseMetadata.section],
                                    ['Campus', result.courseMetadata.campus],
                                    ['Professors', result.courseMetadata.professors],
                                    ['Term', result.courseMetadata.term],
                                    ['Hours', result.courseMetadata.hours],
                                    ['Grade Scale', result.courseMetadata.gradeScale],
                                    ['Department', result.courseMetadata.department]
                                ].map(([k, v]) => (
                                    <React.Fragment key={k}>
                                        <dt style={{ fontWeight: 600 }}>{k}:</dt>
                                        <dd style={{ margin: 0 }}>{v || '—'}</dd>
                                    </React.Fragment>
                                ))}
                            </dl>
                        </div>
                    )}

                    {/* Validation */}
                    {result.success && (
                        <div style={{
                            border: '1px solid #e2e8f0', background: '#f8fafc',
                            padding: '1rem', borderRadius: 6, marginTop: '1rem'
                        }}>
                            <Info color="#6b7280" /><strong style={{ marginLeft: 8 }}>Data Validation Report</strong>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <div><strong>Total:</strong> {result.validation.totalStudents}</div>
                                <div><strong>Valid:</strong> {result.validation.validStudents}</div>
                                <div><strong>Issues:</strong> {result.validation.issues.length}</div>
                                <div><strong>Score:</strong> {result.validation.validationScore}%</div>
                            </div>
                        </div>
                    )}

                    {/* Student Table */}
                    {result.success && result.students.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                            <Users color="#6b7280" /><strong style={{ marginLeft: 8 }}>
                                Student List ({result.students.length})
                            </strong>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                                <thead style={{ background: '#f9fafb' }}>
                                    <tr>
                                        {['#', 'Component', 'ID', 'Name', 'Program', 'Level', 'Campus', 'Status', 'Email'].map(h => (
                                            <th key={h} style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.students.map((s, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '0.5rem' }}>{i + 1}</td>
                                            <td style={{ padding: '0.5rem' }}>{s.component}</td>
                                            <td style={{ padding: '0.5rem' }}>{s.id}</td>
                                            <td style={{ padding: '0.5rem' }}>{s.name}</td>
                                            <td style={{ padding: '0.5rem' }}>{s.program}</td>
                                            <td style={{ padding: '0.5rem' }}>{s.level}</td>
                                            <td style={{ padding: '0.5rem' }}>{s.campus}</td>
                                            <td style={{ padding: '0.5rem' }}>{s.status}</td>
                                            <td style={{ padding: '0.5rem' }}>{s.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Raw Debug */}
                    <details style={{ marginTop: '1rem' }}>
                        <summary>🔍 Debug JSON</summary>
                        <pre style={{ maxHeight: 200, overflow: 'auto', background: '#1f2937', color: '#f9fafb', padding: 8 }}>
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </details>
                </>
            )}
        </div>
    );
}
