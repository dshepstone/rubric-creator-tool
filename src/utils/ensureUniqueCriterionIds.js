/**
 * ensureUniqueCriterionIds.js
 *
 * Guarantees that every criterion in a rubric array has a **unique** `id`.
 * ─────────────────────────────────────────────────────────────────────────
 * • If an `id` is missing, it generates one (`criterion_<index>`).  
 * • If a duplicate is detected, it appends a short random hash (`_<abcd>`)  
 *   until the value is unique.  
 * • The original objects are **not** mutated; a shallow‑copy is returned.
 *
 * Usage:
 *   import ensureUniqueCriterionIds from "./utils/ensureUniqueCriterionIds";
 *   const safeCriteria = ensureUniqueCriterionIds(rawCriteria);
 */

/**
 * @typedef {Object} Criterion
 * @property {string} [id]   Optional unique identifier for the criterion
 * // ...other rubric‑specific properties
 */

/**
 * @param {Criterion[]} criteria  Array of criterion objects
 * @returns {Criterion[]}         New array with unique, collision‑free ids
 */
export function ensureUniqueCriterionIds(criteria = []) {
    const seen = new Set();

    return criteria.map((criterion, index) => {
        // Create a shallow copy to avoid side‑effects
        const c = { ...criterion };

        // Fallback ID if none provided
        let id = (c.id ?? `criterion_${index}`).trim();

        // Resolve collisions by appending a short random suffix
        while (seen.has(id)) {
            id = `${id}_${Math.random().toString(36).slice(2, 6)}`;
        }

        seen.add(id);
        c.id = id;
        return c;
    });
}

export default ensureUniqueCriterionIds;
