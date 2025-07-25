// Frontend service for Grading Policy Manager with TanStack Query v5 support
// File: src/services/gradingPolicyService.js

import axios from 'axios';

class GradingPolicyService {
    constructor() {
        // Use local JSON data for development, API for production
        this.useLocalData = process.env.NODE_ENV === 'development' && !process.env.REACT_APP_API_URL;

        if (!this.useLocalData) {
            this.client = axios.create({
                baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // policies for local development
        this.localPolicies = this.initializeLocalPolicies();
    }

    // Initialize local policies for development
    initializeLocalPolicies() {
        return {
            'standard-2024': {
                id: 'standard-2024',
                name: 'Standard (Current)',
                description: 'Standard grading policy for degree, diploma, certificate, and graduate certificate programs',
                programTypes: ['degree', 'diploma', 'certificate', 'graduateCertificate'],
                gradeScale: [
                    { letter: 'A+', gpa: 4.0, minPercentage: 90, maxPercentage: 100, passingGrade: true },
                    { letter: 'A', gpa: 3.75, minPercentage: 80, maxPercentage: 89, passingGrade: true },
                    { letter: 'B+', gpa: 3.25, minPercentage: 75, maxPercentage: 79, passingGrade: true },
                    { letter: 'B', gpa: 3.0, minPercentage: 70, maxPercentage: 74, passingGrade: true },
                    { letter: 'C+', gpa: 2.25, minPercentage: 65, maxPercentage: 69, passingGrade: true },
                    { letter: 'C', gpa: 2.0, minPercentage: 60, maxPercentage: 64, passingGrade: true },
                    { letter: 'D', gpa: 1.0, minPercentage: 55, maxPercentage: 59, passingGrade: false },
                    { letter: 'F', gpa: 0.0, minPercentage: 0, maxPercentage: 54, passingGrade: false }
                ],
                isActive: true,
                isDefault: true
            },
            'apprenticeship-2024': {
                id: 'apprenticeship-2024',
                name: 'Apprenticeship (Current)',
                description: 'Apprenticeship programs with higher passing requirements (70%)',
                programTypes: ['apprenticeship'],
                gradeScale: [
                    { letter: 'A+', gpa: 4.0, minPercentage: 90, maxPercentage: 100, passingGrade: true },
                    { letter: 'A', gpa: 3.75, minPercentage: 80, maxPercentage: 89, passingGrade: true },
                    { letter: 'B+', gpa: 3.25, minPercentage: 75, maxPercentage: 79, passingGrade: true },
                    { letter: 'B', gpa: 3.0, minPercentage: 70, maxPercentage: 74, passingGrade: true },
                    { letter: 'F', gpa: 0.0, minPercentage: 0, maxPercentage: 69, passingGrade: false }
                ],
                isActive: true,
                isDefault: false
            },
            'health-science-2024': {
                id: 'health-science-2024',
                name: 'Health Science (Current)',
                description: 'Health science programs with higher passing requirements (65%)',
                programTypes: ['healthScience'],
                gradeScale: [
                    { letter: 'A+', gpa: 4.0, minPercentage: 90, maxPercentage: 100, passingGrade: true },
                    { letter: 'A', gpa: 3.75, minPercentage: 80, maxPercentage: 89, passingGrade: true },
                    { letter: 'B+', gpa: 3.25, minPercentage: 75, maxPercentage: 79, passingGrade: true },
                    { letter: 'B', gpa: 3.0, minPercentage: 70, maxPercentage: 74, passingGrade: true },
                    { letter: 'C+', gpa: 2.25, minPercentage: 65, maxPercentage: 69, passingGrade: true },
                    { letter: 'F', gpa: 0.0, minPercentage: 0, maxPercentage: 64, passingGrade: false }
                ],
                isActive: true,
                isDefault: false
            },
            'gas-technician-2024': {
                id: 'gas-technician-2024',
                name: 'GAS Technician (Current)',
                description: 'GAS technician programs with highest passing requirements (75%)',
                programTypes: ['gasTechnician'],
                gradeScale: [
                    { letter: 'A+', gpa: 4.0, minPercentage: 90, maxPercentage: 100, passingGrade: true },
                    { letter: 'A', gpa: 3.75, minPercentage: 80, maxPercentage: 89, passingGrade: true },
                    { letter: 'B+', gpa: 3.25, minPercentage: 75, maxPercentage: 79, passingGrade: true },
                    { letter: 'F', gpa: 0.0, minPercentage: 0, maxPercentage: 74, passingGrade: false }
                ],
                isActive: true,
                isDefault: false
            }
        };
    }

    // Get all grading policies
    async getPolicies(params = {}) {
        if (this.useLocalData) {
            const policies = Object.values(this.localPolicies);

            // Apply filters if specified
            let filteredPolicies = policies;

            if (params.programType) {
                filteredPolicies = policies.filter(policy =>
                    policy.programTypes.includes(params.programType)
                );
            }

            if (params.isActive !== undefined) {
                filteredPolicies = filteredPolicies.filter(policy =>
                    policy.isActive === params.isActive
                );
            }

            return { data: filteredPolicies, success: true };
        }

        try {
            const response = await this.client.get('/grading-policies', { params });
            return { data: response.data, success: true };
        } catch (error) {
            console.error('Error fetching policies:', error);
            return { data: [], success: false, error: error.message };
        }
    }

    // Get policy for specific program type
    async getPolicyForProgram(programType) {
        if (this.useLocalData) {
            const policy = Object.values(this.localPolicies).find(p =>
                p.programTypes.includes(programType) && p.isActive
            );
            return policy ? { data: policy, success: true } : { data: null, success: false };
        }

        try {
            const response = await this.client.get(`/grading-policies/by-program/${programType}`);
            return { data: response.data, success: true };
        } catch (error) {
            console.error('Error fetching policy for program:', error);
            return { data: null, success: false, error: error.message };
        }
    }

    // Calculate letter grade from percentage
    async calculateGrade(percentage, policyId = null, programType = 'degree', customProgramId = null) {
        if (this.useLocalData) {
            return this.calculateGradeLocal(percentage, policyId, programType);
        }

        try {
            const response = await this.client.post('/grading-policies/calculate-grade', {
                percentage,
                policyId,
                programType,
                customProgramId
            });
            return { data: response.data, success: true };
        } catch (error) {
            console.error('Error calculating grade:', error);
            // Fallback to local calculation
            return this.calculateGradeLocal(percentage, policyId, programType);
        }
    }

    // Local grade calculation for development/fallback
    calculateGradeLocal(percentage, policyId = null, programType = 'degree') {
        try {
            let policy;

            if (policyId) {
                policy = this.localPolicies[policyId];
            } else {
                // Find policy by program type
                policy = Object.values(this.localPolicies).find(p =>
                    p.programTypes.includes(programType) && p.isActive
                );
            }

            // Fallback to standard policy
            if (!policy) {
                policy = this.localPolicies['standard-2024'];
            }

            // Find the appropriate grade
            const grade = policy.gradeScale.find(scale =>
                percentage >= scale.minPercentage && percentage <= scale.maxPercentage
            );

            if (grade) {
                return {
                    data: {
                        letter: grade.letter,
                        gpa: grade.gpa,
                        passingGrade: grade.passingGrade,
                        percentage: percentage,
                        policy: {
                            id: policy.id,
                            name: policy.name
                        }
                    },
                    success: true
                };
            }

            // Fallback for invalid percentage
            return {
                data: {
                    letter: 'F',
                    gpa: 0.0,
                    passingGrade: false,
                    percentage: percentage,
                    policy: {
                        id: policy.id,
                        name: policy.name
                    }
                },
                success: true
            };

        } catch (error) {
            console.error('Local grade calculation failed:', error);
            return {
                data: {
                    letter: 'F',
                    gpa: 0.0,
                    passingGrade: false,
                    percentage: percentage,
                    error: 'Calculation failed'
                },
                success: false,
                error: error.message
            };
        }
    }

    // Validate policy data
    async validatePolicy(policyData) {
        const errors = [];

        // Check required fields
        if (!policyData.name) errors.push('Policy name is required');
        if (!policyData.programTypes || policyData.programTypes.length === 0) {
            errors.push('At least one program type is required');
        }
        if (!policyData.gradeScale || policyData.gradeScale.length === 0) {
            errors.push('Grade scale is required');
        }

        // Check grade scale integrity
        if (policyData.gradeScale) {
            const sortedGrades = [...policyData.gradeScale].sort((a, b) => b.minPercentage - a.minPercentage);

            for (let i = 0; i < sortedGrades.length - 1; i++) {
                if (sortedGrades[i].minPercentage <= sortedGrades[i + 1].maxPercentage) {
                    errors.push('Grade scale ranges overlap or have gaps');
                    break;
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Get supported program types
    getSupportedProgramTypes() {
        return [
            { value: 'degree', label: 'Degree Programs' },
            { value: 'diploma', label: 'Diploma Programs' },
            { value: 'certificate', label: 'Certificate Programs' },
            { value: 'graduateCertificate', label: 'Graduate Certificate' },
            { value: 'apprenticeship', label: 'Apprenticeship Programs' },
            { value: 'healthScience', label: 'Health Science Programs' },
            { value: 'gasTechnician', label: 'GAS Technician Programs' },
            { value: 'other', label: 'Other/Custom Programs' }
        ];
    }
}

// Create singleton instance
export const gradingPolicyService = new GradingPolicyService();
export default gradingPolicyService;