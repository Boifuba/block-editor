/**
 * Code Generator for Block Editor
 * 
 * Handles all code generation logic including content formatting,
 * mode-specific processing, and final code assembly.
 * 
 * This class is responsible for:
 * - Generating code from workspace blocks
 * - Formatting block content based on type and settings
 * - Handling Normal vs Formula mode differences
 * - Assembling final code with proper wrapping and syntax
 */

import { AVAILABLE_BLOCKS } from '../constants.js';

export class CodeGenerator {
    /**
     * Initialize the Code Generator
     * @param {UIManager} uiManager - Reference to UI manager for accessing workspace state
     */
    constructor(uiManager) {
        this.uiManager = uiManager;
        
        console.log('Block Editor | Code Generator: Initializing code generation engine');
    }

    /**
     * Generate code based on current workspace blocks and settings
     * Main entry point for code generation process
     */
    generateCode() {
        console.log('Block Editor | Code Generator: Starting code generation process');
        
        const blocks = this.uiManager.getWorkspaceBlocks();
        
        if (blocks.length === 0) {
            console.log('Block Editor | Code Generator: No blocks in workspace - clearing code display');
            this.uiManager.updateCodeDisplay('');
            return;
        }
        
        // Get current settings from UI
        const settings = this.uiManager.getCheckboxStates();
        console.log(`Block Editor | Code Generator: Generation settings - Blind: ${settings.blind}, Formula: ${settings.formula}`);
        
        // Process blocks and generate code
        const codeParts = this._processWorkspaceBlocks(blocks, settings);
        const finalCode = this._assembleFinalCode(codeParts, settings.formula);
        
        console.log(`Block Editor | Code Generator: Code generation completed - Result: ${finalCode}`);
        this.uiManager.updateCodeDisplay(finalCode);
    }

    /**
     * Process all workspace blocks and convert them to formatted code parts
     * @param {NodeList} blocks - The workspace block elements
     * @param {Object} settings - Current checkbox settings
     * @returns {Array} Array of formatted code parts
     */
    _processWorkspaceBlocks(blocks, settings) {
        console.log(`Block Editor | Code Generator: Processing ${blocks.length} workspace blocks`);
        
        let codeParts = [];
        let lastBlockType = null;
        
        blocks.forEach((block, index) => {
            const blockId = block.dataset.blockId;
            const textarea = block.querySelector('.block-code textarea');
            
            if (textarea && textarea.value.trim()) {
                const content = textarea.value.trim();
                console.log(`Block Editor | Code Generator: Processing block ${index + 1}/${blocks.length} - Type: ${blockId}, Content: "${content}"`);
                
                // Format the block content according to its type and settings
                const formattedContent = this._formatBlockContent(blockId, content, settings.blind);
                
                // Handle special comma separation for consecutive text blocks
                if (this._shouldAddCommaSeparator(lastBlockType, blockId, codeParts)) {
                    console.log('Block Editor | Code Generator: Adding comma separator for consecutive text blocks');
                    codeParts[codeParts.length - 1] += ',';
                }
                
                // Apply formula mode formatting if enabled
                const finalContent = this._applyFormulaModeFormatting(formattedContent, blockId, settings.formula);
                codeParts.push(finalContent);
                
                lastBlockType = blockId;
            }
        });
        
        console.log(`Block Editor | Code Generator: Processed blocks into ${codeParts.length} code parts`);
        return codeParts;
    }

    /**
     * Format block content based on block type and current settings
     * @param {string} blockId - The block type identifier
     * @param {string} content - The raw content from the block
     * @param {boolean} blindMode - Whether blind mode is enabled
     * @returns {string} Formatted content according to block type rules
     */
    _formatBlockContent(blockId, content, blindMode) {
        console.log(`Block Editor | Code Generator: Formatting content for block type: ${blockId}`);
        
        // Use formatting rules map for cleaner code organization
        const formatters = this._getContentFormatters();
        
        if (formatters[blockId]) {
            const formatted = formatters[blockId](content, blindMode);
            console.log(`Block Editor | Code Generator: Block ${blockId} formatted from "${content}" to "${formatted}"`);
            return formatted;
        }
        
        console.log(`Block Editor | Code Generator: No specific formatter for ${blockId} - using content as-is`);
        return content;
    }

    /**
     * Get content formatting functions for each block type
     * @returns {Object} Map of block types to formatting functions
     */
    _getContentFormatters() {
        return {
            // Text and label blocks - always wrapped in quotes
            'label': (content) => `"${content}"`,
            'text': (content) => `"${content}"`,
            
            // Actor data blocks - with optional blind prefix
            'skills': (content, blindMode) => blindMode ? `!Sk:${content}` : `Sk:${content}`,
            'spells': (content, blindMode) => blindMode ? `!S: ${content}` : `S: ${content}`,
            'atributos': (content, blindMode) => blindMode ? `!${content}` : content,
            'costs': (content) => `*Costs ${content}`,
            
            // Combat blocks - SK system prefixes
            'ranged': (content) => `R:${content}`,
            'melee': (content) => `M:${content}`,
            'weapond': (content) => `D:"${content}"`,
            'parry': (content) => `P:${content}`,
            
            // Utility blocks
            'damage': (content) => content,
            'mod': (content) => content,
            'based': (content) => `Based:${content}`,
            
            // Fixed content blocks - always return the same value
            'or': () => '|',
            'check': () => '?',
            'if': () => '/if',
            'else': () => '/else',
            'line': () => '/'
        };
    }

    /**
     * Check if a comma separator should be added between blocks
     * @param {string} lastBlockType - The previous block type
     * @param {string} currentBlockType - The current block type
     * @param {Array} codeParts - Current array of code parts
     * @returns {boolean} Whether to add comma separator
     */
    _shouldAddCommaSeparator(lastBlockType, currentBlockType, codeParts) {
        return lastBlockType === 'text' && currentBlockType === 'text' && codeParts.length > 0;
    }

    /**
     * Apply formula mode formatting to content if enabled
     * @param {string} content - The formatted content
     * @param {string} blockId - The block type identifier
     * @param {boolean} formulaMode - Whether formula mode is enabled
     * @returns {string} Content with formula mode formatting applied
     */
    _applyFormulaModeFormatting(content, blockId, formulaMode) {
        if (!formulaMode) {
            return content;
        }
        
        // In formula mode, if/else blocks are never wrapped in brackets
        if (blockId === 'if' || blockId === 'else') {
            console.log(`Block Editor | Code Generator: Formula mode - ${blockId} block not wrapped in brackets`);
            return content;
        }
        
        // All other blocks get individual bracket wrapping in formula mode
        console.log(`Block Editor | Code Generator: Formula mode - wrapping ${blockId} block in individual brackets`);
        return `[${content}]`;
    }

    /**
     * Assemble the final code string with appropriate wrapping and syntax
     * @param {Array} codeParts - Array of formatted code parts
     * @param {boolean} formulaMode - Whether formula mode is enabled
     * @returns {string} Final assembled code string
     */
    _assembleFinalCode(codeParts, formulaMode) {
        if (codeParts.length === 0) {
            console.log('Block Editor | Code Generator: No code parts to assemble');
            return '';
        }
        
        console.log(`Block Editor | Code Generator: Assembling final code from ${codeParts.length} parts in ${formulaMode ? 'formula' : 'normal'} mode`);
        
        if (formulaMode) {
            // Formula mode: parts are already individually wrapped, just join with spaces
            const result = codeParts.join(' ');
            console.log(`Block Editor | Code Generator: Formula mode assembly complete: ${result}`);
            return result;
        } else {
            // Normal mode: check for special cases, otherwise wrap everything
            return this._assembleNormalModeCode(codeParts);
        }
    }

    /**
     * Assemble code for normal (non-formula) mode
     * @param {Array} codeParts - Array of formatted code parts
     * @returns {string} Assembled code for normal mode
     */
    _assembleNormalModeCode(codeParts) {
        console.log('Block Editor | Code Generator: Assembling code for normal mode');
        
        // Check if we have any if/else blocks (should not be wrapped in normal mode)
        const hasConditionalBlocks = codeParts.some(part => part === '/if' || part === '/else');
        
        if (hasConditionalBlocks) {
            console.log('Block Editor | Code Generator: Conditional blocks detected - not wrapping in brackets');
            return codeParts.join(' ');
        } else {
            console.log('Block Editor | Code Generator: Normal mode - wrapping all content in brackets');
            return `[${codeParts.join(' ')}]`;
        }
    }
}