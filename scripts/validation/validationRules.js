/**
 * Validation Rules for Block Editor
 * 
 * This file defines patterns that should be highlighted or flagged in the workspace.
 * Each rule specifies a pattern to detect and how to provide visual feedback.
 * 
 * Rule Structure:
 * - id: Unique identifier for the rule
 * - name: Human-readable name for the rule
 * - description: What the rule checks for
 * - pattern: Array of block types that form the problematic pattern
 * - highlightIndex: Which block in the pattern to highlight (0-based, -1 for last)
 * - severity: 'error', 'warning', or 'info'
 * - enabled: Whether the rule is active
 */

export const VALIDATION_RULES = [
    {
        id: 'consecutive-skills-after-label',
        name: 'Consecutive Skills After Label',
        description: 'Highlights the last skill when multiple skills follow a label block',
        pattern: ['label', 'skills', 'skills'],
        highlightIndex: -1, // -1 means last block in pattern
        severity: 'warning',
        enabled: true
    },
    {
        id: 'multiple-consecutive-skills',
        name: 'Multiple Consecutive Skills',
        description: 'Highlights when more than two skills are used consecutively',
        pattern: ['skills', 'skills', 'skills'],
        highlightIndex: -1,
        severity: 'error',
        enabled: true
    },
    {
        id: 'consecutive-attributes',
        name: 'Consecutive Attributes',
        description: 'Highlights when multiple attributes are used consecutively',
        pattern: ['atributos', 'atributos'],
        highlightIndex: -1,
        severity: 'warning',
        enabled: true
    },
    {
        id: 'text-without-context',
        name: 'Isolated Text Block',
        description: 'Highlights text blocks that appear without proper context',
        pattern: ['text'],
        highlightIndex: 0,
        severity: 'info',
        enabled: false // Disabled by default as it might be too noisy
    },
    {
        id: 'damage-before-attack',
        name: 'Damage Before Attack',
        description: 'Highlights damage blocks that appear before attack blocks',
        pattern: ['damage', 'melee'],
        highlightIndex: 0,
        severity: 'warning',
        enabled: true
    },
    {
        id: 'damage-before-ranged',
        name: 'Damage Before Ranged',
        description: 'Highlights damage blocks that appear before ranged blocks',
        pattern: ['damage', 'ranged'],
        highlightIndex: 0,
        severity: 'warning',
        enabled: true
    }
];

/**
 * CSS classes for different severity levels
 */
export const SEVERITY_CLASSES = {
    error: 'block-error-highlight',
    warning: 'block-warning-highlight',
    info: 'block-info-highlight'
};

/**
 * Check if a sequence of blocks matches a validation rule pattern
 * @param {Array} blockSequence - Array of block IDs to check
 * @param {Array} pattern - Pattern array from validation rule
 * @returns {boolean} Whether the sequence matches the pattern
 */
export function matchesPattern(blockSequence, pattern) {
    if (blockSequence.length < pattern.length) {
        return false;
    }
    
    // Check if the sequence ends with the pattern
    const sequenceEnd = blockSequence.slice(-pattern.length);
    return sequenceEnd.every((blockId, index) => blockId === pattern[index]);
}

/**
 * Find all validation issues in a workspace
 * @param {Array} workspaceBlocks - Array of block IDs in workspace order
 * @returns {Array} Array of validation issues found
 */
export function validateWorkspace(workspaceBlocks) {
    const issues = [];
    
    // Only check enabled rules
    const enabledRules = VALIDATION_RULES.filter(rule => rule.enabled);
    
    for (const rule of enabledRules) {
        // Check each possible position in the workspace
        for (let i = rule.pattern.length - 1; i < workspaceBlocks.length; i++) {
            const sequence = workspaceBlocks.slice(i - rule.pattern.length + 1, i + 1);
            
            if (matchesPattern(sequence, rule.pattern)) {
                // Calculate which block to highlight
                let highlightIndex;
                if (rule.highlightIndex === -1) {
                    highlightIndex = i; // Last block in pattern
                } else {
                    highlightIndex = i - rule.pattern.length + 1 + rule.highlightIndex;
                }
                
                issues.push({
                    ruleId: rule.id,
                    ruleName: rule.name,
                    description: rule.description,
                    severity: rule.severity,
                    highlightIndex: highlightIndex,
                    cssClass: SEVERITY_CLASSES[rule.severity]
                });
            }
        }
    }
    
    return issues;
}