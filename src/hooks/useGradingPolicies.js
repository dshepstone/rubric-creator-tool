// TanStack Query v5 hooks for Grading Policy Manager
// File: src/hooks/useGradingPolicies.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import gradingPolicyService from '../services/gradingPolicyService';

// Query keys
export const gradingPolicyKeys = {
    all: ['gradingPolicies'],
    lists: () => [...gradingPolicyKeys.all, 'list'],
    list: (filters) => [...gradingPolicyKeys.lists(), { filters }],
    details: () => [...gradingPolicyKeys.all, 'detail'],
    detail: (id) => [...gradingPolicyKeys.details(), id],
    byProgram: (programType) => [...gradingPolicyKeys.all, 'byProgram', programType],
};

// Hook to get all policies
export const useGradingPolicies = (params = {}) => {
    return useQuery({
        queryKey: gradingPolicyKeys.list(params),
        queryFn: () => gradingPolicyService.getPolicies(params),
        select: (data) => data.success ? data.data : [],
    });
};

// Hook to get policy for specific program type
export const useGradingPolicyForProgram = (programType) => {
    return useQuery({
        queryKey: gradingPolicyKeys.byProgram(programType),
        queryFn: () => gradingPolicyService.getPolicyForProgram(programType),
        enabled: !!programType,
        select: (data) => data.success ? data.data : null,
    });
};

// Hook for grade calculation
export const useGradeCalculation = () => {
    return useMutation({
        mutationFn: ({ percentage, policyId, programType, customProgramId }) =>
            gradingPolicyService.calculateGrade(percentage, policyId, programType, customProgramId),
    });
};

// Hook for policy validation
export const usePolicyValidation = () => {
    return useMutation({
        mutationFn: (policyData) => gradingPolicyService.validatePolicy(policyData),
    });
};

// Hook to create a new policy
export const useCreatePolicy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (policyData) => gradingPolicyService.createPolicy(policyData),
        onSuccess: () => {
            // When a new policy is created, refetch the list of all policies
            queryClient.invalidateQueries({ queryKey: gradingPolicyKeys.lists() });
        },
    });
};

// Hook to update a policy
export const useUpdatePolicy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ policyId, policyData }) => gradingPolicyService.updatePolicy(policyId, policyData),
        onSuccess: () => {
            // When a policy is updated, refetch the list of all policies
            queryClient.invalidateQueries({ queryKey: gradingPolicyKeys.lists() });
        },
    });
};

// Hook to delete a policy
export const useDeletePolicy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (policyId) => gradingPolicyService.deletePolicy(policyId),
        onSuccess: () => {
            // When a policy is deleted, refetch the list of all policies
            queryClient.invalidateQueries({ queryKey: gradingPolicyKeys.lists() });
        },
    });
};

// Custom hook for managing policy state in components
export const useGradingPolicyManager = () => {
    const queryClient = useQueryClient();

    const invalidatePolicies = () => {
        queryClient.invalidateQueries({ queryKey: gradingPolicyKeys.all });
    };

    const prefetchPolicyForProgram = (programType) => {
        queryClient.prefetchQuery({
            queryKey: gradingPolicyKeys.byProgram(programType),
            queryFn: () => gradingPolicyService.getPolicyForProgram(programType),
            staleTime: 1000 * 60 * 10, // 10 minutes
        });
    };

    return {
        invalidatePolicies,
        prefetchPolicyForProgram,
    };
};