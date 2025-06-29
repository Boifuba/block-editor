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
        id: 'consecutive-if',
        name: 'Consecutive If Blocks',
        description: 'Detecta blocos "If" consecutivos, o que pode indicar redundância lógica ou um problema estrutural.',
        pattern: ['if', 'if'],
        highlightIndex: -1,
        severity: 'warning',
        enabled: true
    },
    {
        id: 'consecutive-skills-after-label',
        name: 'Consecutive Skills After Label',
        description: 'Múltiplas perícias após um bloco de rótulo podem causar confusão na interpretação do código.',
        pattern: ['label', 'skills', 'skills'],
        highlightIndex: -1,
        severity: 'warning',
        enabled: true
    },
    {
        id: 'multiple-consecutive-skills',
        name: 'Multiple Consecutive Skills',
        description: 'Três ou mais blocos de perícias consecutivos podem indicar estrutura desnecessariamente complexa.',
        pattern: ['skills', 'skills', 'skills'],
        highlightIndex: -1,
        severity: 'error',
        enabled: true
    },
    {
        id: 'consecutive-attributes',
        name: 'Consecutive Attributes',
        description: 'Múltiplos atributos consecutivos podem indicar redundância ou erro de estruturação.',
        pattern: ['atributos', 'atributos'],
        highlightIndex: -1,
        severity: 'warning',
        enabled: true
    },
    {
        id: 'damage-before-attack',
        name: 'Damage Before Attack',
        description: 'Bloco de dano antes de ataque corpo a corpo pode indicar ordem incorreta dos elementos.',
        pattern: ['damage', 'melee'],
        highlightIndex: 0,
        severity: 'warning',
        enabled: true
    },
    {
        id: 'damage-before-ranged',
        name: 'Damage Before Ranged',
        description: 'Bloco de dano antes de ataque à distância pode indicar ordem incorreta dos elementos.',
        pattern: ['damage', 'ranged'],
        highlightIndex: 0,
        severity: 'warning',
        enabled: true
    },
    {
        id: 'unmatched-group-start',
        name: 'Unmatched Group Start',
        description: 'Bloco de início de grupo sem correspondente bloco de fim pode causar erro de sintaxe.',
        pattern: ['group-start'],
        highlightIndex: 0,
        severity: 'error',
        enabled: true
    },
    {
        id: 'unmatched-group-end',
        name: 'Unmatched Group End',
        description: 'Bloco de fim de grupo sem correspondente bloco de início pode causar erro de sintaxe.',
        pattern: ['group-end'],
        highlightIndex: 0,
        severity: 'error',
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
 * Validate group block matching
 * @param {Array} workspaceBlocks - Array of block IDs in workspace order
 * @returns {Array} Array of group validation issues
 */
export function validateGroupBlocks(workspaceBlocks) {
    const issues = [];
    const groupStack = [];
    
    workspaceBlocks.forEach((blockId, index) => {
        if (blockId === 'group-start') {
            groupStack.push(index);
        } else if (blockId === 'group-end') {
            if (groupStack.length === 0) {
                // Unmatched group-end
                issues.push({
                    ruleId: 'unmatched-group-end',
                    ruleName: 'Unmatched Group End',
                    description: 'Bloco de fim de grupo sem correspondente bloco de início pode causar erro de sintaxe.',
                    severity: 'error',
                    highlightIndex: index,
                    cssClass: SEVERITY_CLASSES.error
                });
            } else {
                groupStack.pop();
            }
        }
    });
    
    // Check for unmatched group-start blocks
    groupStack.forEach(startIndex => {
        issues.push({
            ruleId: 'unmatched-group-start',
            ruleName: 'Unmatched Group Start',
            description: 'Bloco de início de grupo sem correspondente bloco de fim pode causar erro de sintaxe.',
            severity: 'error',
            highlightIndex: startIndex,
            cssClass: SEVERITY_CLASSES.error
        });
    });
    
    return issues;
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
    
    // Check pattern-based rules
    for (const rule of enabledRules) {
        // Skip group validation rules as they are handled separately
        if (rule.id === 'unmatched-group-start' || rule.id === 'unmatched-group-end') {
            continue;
        }
        
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
    
    // Add group validation issues
    const groupIssues = validateGroupBlocks(workspaceBlocks);
    issues.push(...groupIssues);
    
    return issues;
}