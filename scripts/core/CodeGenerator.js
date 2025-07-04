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
 * - Special bracketing when Label and If blocks are both present
 * - Special handling for Based blocks with ALL block types (not just spells)
 * - Special handling for modifier chains with & operators in Formula mode
 * - Processing group blocks to create grouped code structures with curly braces
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
        const { codeParts, hasLabelBlock, hasIfBlock } = this._processWorkspaceBlocks(blocks, settings);
        const finalCode = this._assembleFinalCode(codeParts, settings.formula, hasLabelBlock, hasIfBlock);
        
        console.log(`Block Editor | Code Generator: Code generation completed - Result: ${finalCode}`);
        this.uiManager.updateCodeDisplay(finalCode);
    }

    /**
     * Process all workspace blocks and convert them to formatted code parts
     * @param {NodeList} blocks - The workspace block elements
     * @param {Object} settings - Current checkbox settings
     * @returns {Object} Object containing codeParts, hasLabelBlock, and hasIfBlock
     */
    _processWorkspaceBlocks(blocks, settings) {
        console.log(`Block Editor | Code Generator: Processing ${blocks.length} workspace blocks`);
        
        let codeParts = [];
        let lastBlockType = null;
        let hasLabelBlock = false;
        let hasIfBlock = false;
        
        // In formula mode, detect modifier chains for special handling
        const modifierChains = settings.formula ? this._detectModifierChains(blocks) : [];
        
        // Process groups if in formula mode
        if (settings.formula) {
            codeParts = this._processGroupedBlocks(blocks, settings);
        } else {
            // Normal processing for non-formula mode
            blocks.forEach((block, index) => {
                const blockId = block.dataset.blockId;
                const textarea = block.querySelector('.block-code textarea');
                
                // Track presence of label and if blocks
                if (blockId === 'label') {
                    hasLabelBlock = true;
                }
                if (blockId === 'if') {
                    hasIfBlock = true;
                }
                
                if (textarea && textarea.value.trim()) {
                    const content = textarea.value.trim();
                    console.log(`Block Editor | Code Generator: Processing block ${index + 1}/${blocks.length} - Type: ${blockId}, Content: "${content}"`);
                    
                    // Check if this block is part of a modifier chain
                    const isInModifierChain = modifierChains.some(chain => 
                        chain.startIndex <= index && index <= chain.endIndex
                    );
                    
                    // Format the block content according to its type and settings
                    const formattedContent = this._formatBlockContent(blockId, content, settings.blind, blocks, index);
                    
                    // Handle special comma separation for consecutive text blocks
                    if (this._shouldAddCommaSeparator(lastBlockType, blockId, codeParts)) {
                        console.log('Block Editor | Code Generator: Adding comma separator for consecutive text blocks');
                        codeParts[codeParts.length - 1] += ',';
                    }
                    
                    // Calculate if special bracketing is active
                    const specialBracketingActive = hasLabelBlock && hasIfBlock;
                    
                    // Apply formula mode formatting if enabled
                    const finalContent = this._applyFormulaModeFormatting(
                        formattedContent, 
                        blockId, 
                        settings.formula, 
                        specialBracketingActive,
                        isInModifierChain
                    );
                    
                    if (finalContent !== null) {
                        codeParts.push(finalContent);
                    }
                    
                    lastBlockType = blockId;
                }
            });
        }
        
        // Post-process modifier chains in formula mode
        if (settings.formula && modifierChains.length > 0) {
            codeParts = this._processModifierChains(codeParts, modifierChains, blocks);
        }
        
        console.log(`Block Editor | Code Generator: Processed blocks into ${codeParts.length} code parts`);
        console.log(`Block Editor | Code Generator: Block presence - Label: ${hasLabelBlock}, If: ${hasIfBlock}`);
        
        return { codeParts, hasLabelBlock, hasIfBlock };
    }

    /**
     * Process blocks with group support for formula mode
     * @param {NodeList} blocks - The workspace block elements
     * @param {Object} settings - Current checkbox settings
     * @returns {Array} Array of processed code parts with groups
     */
    _processGroupedBlocks(blocks, settings) {
        console.log('Block Editor | Code Generator: Processing blocks with group support');
        
        const codeParts = [];
        const groupStack = [];
        let currentGroup = null;
        
        Array.from(blocks).forEach((block, index) => {
            const blockId = block.dataset.blockId;
            const textarea = block.querySelector('.block-code textarea');
            
            if (blockId === 'group-start') {
                console.log(`Block Editor | Code Generator: Starting new group at index ${index}`);
                // Start a new group
                currentGroup = {
                    startIndex: index,
                    parts: []
                };
                groupStack.push(currentGroup);
                // Add the opening brace
                codeParts.push('{');
                return;
            }
            
            if (blockId === 'group-end') {
                console.log(`Block Editor | Code Generator: Ending group at index ${index}`);
                // End the current group
                if (groupStack.length > 0) {
                    const completedGroup = groupStack.pop();
                    currentGroup = groupStack.length > 0 ? groupStack[groupStack.length - 1] : null;
                    
                    // Add the closing brace
                    codeParts.push('}');
                } else {
                    console.warn('Block Editor | Code Generator: Group end without matching group start');
                    codeParts.push('}');
                }
                return;
            }
            
            // Process regular blocks
            if (textarea && (textarea.value.trim() || blockId === 'or' || blockId === 'check' || blockId === 'if' || blockId === 'else' || blockId === 'line' || blockId === 'and')) {
                const content = textarea.value.trim();
                console.log(`Block Editor | Code Generator: Processing block ${index + 1}/${blocks.length} - Type: ${blockId}, Content: "${content}"`);
                
                // Format the block content according to its type and settings
                const formattedContent = this._formatBlockContent(blockId, content, settings.blind, blocks, index);
                
                // Apply formula mode formatting
                const finalContent = this._applyFormulaModeFormatting(
                    formattedContent, 
                    blockId, 
                    settings.formula, 
                    false, // Special bracketing not applicable in grouped mode
                    false  // Modifier chains handled separately
                );
                
                if (finalContent !== null) {
                    if (currentGroup) {
                        // Add to current group
                        currentGroup.parts.push(finalContent);
                    }
                    codeParts.push(finalContent);
                }
            }
        });
        
        // Warn about unclosed groups
        if (groupStack.length > 0) {
            console.warn(`Block Editor | Code Generator: ${groupStack.length} unclosed groups detected`);
        }
        
        return codeParts;
    }

    /**
     * Detect modifier chains in the workspace for special formatting
     * @param {NodeList} blocks - All workspace blocks
     * @returns {Array} Array of modifier chain objects with start/end indices
     */
    _detectModifierChains(blocks) {
        console.log('Block Editor | Code Generator: Detecting modifier chains for formula mode');
        
        const chains = [];
        let currentChain = null;
        
        Array.from(blocks).forEach((block, index) => {
            const blockId = block.dataset.blockId;
            
            if (blockId === 'mod' || blockId === 'and') {
                if (!currentChain) {
                    // Start a new chain if we find a mod block
                    if (blockId === 'mod') {
                        currentChain = { startIndex: index, endIndex: index, blocks: [index] };
                    }
                } else {
                    // Extend current chain
                    currentChain.endIndex = index;
                    currentChain.blocks.push(index);
                }
            } else {
                // End current chain if we hit a non-mod, non-and block
                if (currentChain && currentChain.blocks.length >= 3) { // At least mod + and + mod
                    chains.push(currentChain);
                    console.log(`Block Editor | Code Generator: Detected modifier chain from index ${currentChain.startIndex} to ${currentChain.endIndex}`);
                }
                currentChain = null;
            }
        });
        
        // Don't forget the last chain if it exists
        if (currentChain && currentChain.blocks.length >= 3) {
            chains.push(currentChain);
            console.log(`Block Editor | Code Generator: Detected final modifier chain from index ${currentChain.startIndex} to ${currentChain.endIndex}`);
        }
        
        return chains;
    }

    /**
     * Process modifier chains to combine them into single bracketed expressions
     * @param {Array} codeParts - Current code parts array
     * @param {Array} modifierChains - Detected modifier chains
     * @param {NodeList} blocks - All workspace blocks
     * @returns {Array} Updated code parts with combined modifier chains
     */
    _processModifierChains(codeParts, modifierChains, blocks) {
        console.log('Block Editor | Code Generator: Processing modifier chains for combination');
        
        // Process chains in reverse order to maintain indices
        for (let i = modifierChains.length - 1; i >= 0; i--) {
            const chain = modifierChains[i];
            
            // Extract the chain parts and combine them
            const chainParts = [];
            for (let j = chain.startIndex; j <= chain.endIndex; j++) {
                const block = blocks[j];
                const blockId = block.dataset.blockId;
                const textarea = block.querySelector('.block-code textarea');
                const content = textarea ? textarea.value.trim() : '';
                
                if (blockId === 'mod' && content) {
                    chainParts.push(content);
                } else if (blockId === 'and') {
                    chainParts.push('&');
                }
            }
            
            // Combine into single expression
            const combinedExpression = `[${chainParts.join(' ')}]`;
            console.log(`Block Editor | Code Generator: Combined modifier chain: ${combinedExpression}`);
            
            // Replace the chain parts in codeParts with the combined expression
            const startCodeIndex = this._findCodePartIndex(codeParts, chain.startIndex, blocks);
            const endCodeIndex = this._findCodePartIndex(codeParts, chain.endIndex, blocks);
            
            if (startCodeIndex !== -1 && endCodeIndex !== -1) {
                // Remove the individual parts and insert the combined expression
                const removeCount = endCodeIndex - startCodeIndex + 1;
                codeParts.splice(startCodeIndex, removeCount, combinedExpression);
            }
        }
        
        return codeParts;
    }

    /**
     * Find the index in codeParts that corresponds to a block index
     * @param {Array} codeParts - Current code parts
     * @param {number} blockIndex - Block index to find
     * @param {NodeList} blocks - All workspace blocks
     * @returns {number} Index in codeParts or -1 if not found
     */
    _findCodePartIndex(codeParts, blockIndex, blocks) {
        // This is a simplified approach - in practice, you might need more sophisticated mapping
        // For now, we'll assume a 1:1 correspondence with some adjustments for skipped blocks
        let codeIndex = 0;
        
        for (let i = 0; i <= blockIndex && codeIndex < codeParts.length; i++) {
            const block = blocks[i];
            const blockId = block.dataset.blockId;
            const textarea = block.querySelector('.block-code textarea');
            const hasContent = textarea && textarea.value.trim();
            
            if (hasContent) {
                if (i === blockIndex) {
                    return codeIndex;
                }
                codeIndex++;
            }
        }
        
        return -1;
    }

    /**
     * Format block content based on block type and current settings
     * @param {string} blockId - The block type identifier
     * @param {string} content - The raw content from the block
     * @param {boolean} blindMode - Whether blind mode is enabled
     * @param {NodeList} allBlocks - All workspace blocks for context analysis
     * @param {number} currentIndex - Index of current block being processed
     * @returns {string} Formatted content according to block type rules
     */
    _formatBlockContent(blockId, content, blindMode, allBlocks, currentIndex) {
        console.log(`Block Editor | Code Generator: Formatting content for block type: ${blockId}`);
        
        // Use formatting rules map for cleaner code organization
        const formatters = this._getContentFormatters();
        
        if (formatters[blockId]) {
            const formatted = formatters[blockId](content, blindMode, allBlocks, currentIndex);
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
            
            // Actor data blocks - with optional blind prefix and Based support
            'skills': (content, blindMode, allBlocks, currentIndex) => {
                // Check if the next block is a 'based' block
                const nextBlock = allBlocks && currentIndex < allBlocks.length - 1 ? allBlocks[currentIndex + 1] : null;
                const nextBlockId = nextBlock ? nextBlock.dataset.blockId : null;
                const nextBlockContent = nextBlock ? nextBlock.querySelector('.block-code textarea')?.value?.trim() : null;
                
                if (nextBlockId === 'based' && nextBlockContent) {
                    // Format as Sk:Skillname (Based:Attribute)
                    const prefix = blindMode ? '!' : '';
                    console.log(`Block Editor | Code Generator: Skills block followed by based block - formatting as combined expression`);
                    return `${prefix}Sk:${content} (Based:${nextBlockContent})`;
                } else {
                    // Normal skills formatting
                    return blindMode ? `!Sk:${content}` : `Sk:${content}`;
                }
            },
            'spells': (content, blindMode, allBlocks, currentIndex) => {
                // Check if the next block is a 'based' block
                const nextBlock = allBlocks && currentIndex < allBlocks.length - 1 ? allBlocks[currentIndex + 1] : null;
                const nextBlockId = nextBlock ? nextBlock.dataset.blockId : null;
                const nextBlockContent = nextBlock ? nextBlock.querySelector('.block-code textarea')?.value?.trim() : null;
                
                if (nextBlockId === 'based' && nextBlockContent) {
                    // Format as S:Spellname (Based:Attribute)
                    const prefix = blindMode ? '!' : '';
                    console.log(`Block Editor | Code Generator: Spells block followed by based block - formatting as combined expression`);
                    return `${prefix}S:${content} (Based:${nextBlockContent})`;
                } else {
                    // Normal spells formatting
                    return blindMode ? `!S: ${content}` : `S: ${content}`;
                }
            },
            'atributos': (content, blindMode, allBlocks, currentIndex) => {
                // Check if the next block is a 'based' block
                const nextBlock = allBlocks && currentIndex < allBlocks.length - 1 ? allBlocks[currentIndex + 1] : null;
                const nextBlockId = nextBlock ? nextBlock.dataset.blockId : null;
                const nextBlockContent = nextBlock ? nextBlock.querySelector('.block-code textarea')?.value?.trim() : null;
                
                if (nextBlockId === 'based' && nextBlockContent) {
                    // Format as Attribute (Based:OtherAttribute)
                    const prefix = blindMode ? '!' : '';
                    console.log(`Block Editor | Code Generator: Attributes block followed by based block - formatting as combined expression`);
                    return `${prefix}${content} (Based:${nextBlockContent})`;
                } else {
                    // Normal attributes formatting
                    return blindMode ? `!${content}` : content;
                }
            },
            'costs': (content, blindMode, allBlocks, currentIndex) => {
                // Check if the next block is a 'based' block
                const nextBlock = allBlocks && currentIndex < allBlocks.length - 1 ? allBlocks[currentIndex + 1] : null;
                const nextBlockId = nextBlock ? nextBlock.dataset.blockId : null;
                const nextBlockContent = nextBlock ? nextBlock.querySelector('.block-code textarea')?.value?.trim() : null;
                
                if (nextBlockId === 'based' && nextBlockContent) {
                    // Format as *Costs content (Based:Attribute)
                    console.log(`Block Editor | Code Generator: Costs block followed by based block - formatting as combined expression`);
                    return `*Costs ${content} (Based:${nextBlockContent})`;
                } else {
                    // Normal costs formatting
                    return `*Costs ${content}`;
                }
            },
            
            // Combat blocks - SK system prefixes with Based support
            'ranged': (content, blindMode, allBlocks, currentIndex) => {
                // Check if the next block is a 'based' block
                const nextBlock = allBlocks && currentIndex < allBlocks.length - 1 ? allBlocks[currentIndex + 1] : null;
                const nextBlockId = nextBlock ? nextBlock.dataset.blockId : null;
                const nextBlockContent = nextBlock ? nextBlock.querySelector('.block-code textarea')?.value?.trim() : null;
                
                if (nextBlockId === 'based' && nextBlockContent) {
                    // Format as R:content (Based:Attribute)
                    console.log(`Block Editor | Code Generator: Ranged block followed by based block - formatting as combined expression`);
                    return `R:${content} (Based:${nextBlockContent})`;
                } else {
                    // Normal ranged formatting
                    return `R:${content}`;
                }
            },
            'melee': (content, blindMode, allBlocks, currentIndex) => {
                // Check if the next block is a 'based' block
                const nextBlock = allBlocks && currentIndex < allBlocks.length - 1 ? allBlocks[currentIndex + 1] : null;
                const nextBlockId = nextBlock ? nextBlock.dataset.blockId : null;
                const nextBlockContent = nextBlock ? nextBlock.querySelector('.block-code textarea')?.value?.trim() : null;
                
                if (nextBlockId === 'based' && nextBlockContent) {
                    // Format as M:content (Based:Attribute)
                    console.log(`Block Editor | Code Generator: Melee block followed by based block - formatting as combined expression`);
                    return `M:${content} (Based:${nextBlockContent})`;
                } else {
                    // Normal melee formatting
                    return `M:${content}`;
                }
            },
            'weapond': (content, blindMode, allBlocks, currentIndex) => {
                // Check if the next block is a 'based' block
                const nextBlock = allBlocks && currentIndex < allBlocks.length - 1 ? allBlocks[currentIndex + 1] : null;
                const nextBlockId = nextBlock ? nextBlock.dataset.blockId : null;
                const nextBlockContent = nextBlock ? nextBlock.querySelector('.block-code textarea')?.value?.trim() : null;
                
                if (nextBlockId === 'based' && nextBlockContent) {
                    // Format as D:"content" (Based:Attribute)
                    console.log(`Block Editor | Code Generator: Weapon damage block followed by based block - formatting as combined expression`);
                    return `D:"${content}" (Based:${nextBlockContent})`;
                } else {
                    // Normal weapon damage formatting
                    return `D:"${content}"`;
                }
            },
            'parry': (content, blindMode, allBlocks, currentIndex) => {
                // Check if the next block is a 'based' block
                const nextBlock = allBlocks && currentIndex < allBlocks.length - 1 ? allBlocks[currentIndex + 1] : null;
                const nextBlockId = nextBlock ? nextBlock.dataset.blockId : null;
                const nextBlockContent = nextBlock ? nextBlock.querySelector('.block-code textarea')?.value?.trim() : null;
                
                if (nextBlockId === 'based' && nextBlockContent) {
                    // Format as P:content (Based:Attribute)
                    console.log(`Block Editor | Code Generator: Parry block followed by based block - formatting as combined expression`);
                    return `P:${content} (Based:${nextBlockContent})`;
                } else {
                    // Normal parry formatting
                    return `P:${content}`;
                }
            },
            
            // Utility blocks
            'damage': (content, blindMode, allBlocks, currentIndex) => {
                // Check if the next block is a 'based' block
                const nextBlock = allBlocks && currentIndex < allBlocks.length - 1 ? allBlocks[currentIndex + 1] : null;
                const nextBlockId = nextBlock ? nextBlock.dataset.blockId : null;
                const nextBlockContent = nextBlock ? nextBlock.querySelector('.block-code textarea')?.value?.trim() : null;
                
                if (nextBlockId === 'based' && nextBlockContent) {
                    // Format as content (Based:Attribute)
                    console.log(`Block Editor | Code Generator: Damage block followed by based block - formatting as combined expression`);
                    return `${content} (Based:${nextBlockContent})`;
                } else {
                    // Normal damage formatting
                    return content;
                }
            },
            'mod': (content, blindMode, allBlocks, currentIndex) => {
                // Check if the next block is a 'based' block
                const nextBlock = allBlocks && currentIndex < allBlocks.length - 1 ? allBlocks[currentIndex + 1] : null;
                const nextBlockId = nextBlock ? nextBlock.dataset.blockId : null;
                const nextBlockContent = nextBlock ? nextBlock.querySelector('.block-code textarea')?.value?.trim() : null;
                
                if (nextBlockId === 'based' && nextBlockContent) {
                    // Format as content (Based:Attribute)
                    console.log(`Block Editor | Code Generator: Modifier block followed by based block - formatting as combined expression`);
                    return `${content} (Based:${nextBlockContent})`;
                } else {
                    // Normal modifier formatting
                    return content;
                }
            },
            'based': (content, blindMode, allBlocks, currentIndex) => {
                // Check if the previous block was any block that can consume based blocks
                const prevBlock = allBlocks && currentIndex > 0 ? allBlocks[currentIndex - 1] : null;
                const prevBlockId = prevBlock ? prevBlock.dataset.blockId : null;
                
                // List of block types that can consume based blocks
                const consumingBlocks = ['spells', 'skills', 'atributos', 'costs', 'ranged', 'melee', 'weapond', 'parry', 'damage', 'mod'];
                
                if (prevBlockId && consumingBlocks.includes(prevBlockId)) {
                    // Skip this block as it was already processed with the previous block
                    console.log(`Block Editor | Code Generator: Based block following ${prevBlockId} - skipping as it was already processed`);
                    return null; // Return null to indicate this block should be skipped
                } else {
                    // Standalone based block - always format with parentheses (Based:Attribute)
                    console.log(`Block Editor | Code Generator: Standalone based block - formatting with (Based:) format`);
                    return `(Based:${content})`;
                }
            },
            
            // Fixed content blocks - always return the same value
            'or': () => '|',
            'and': () => '&',
            'check': () => '?',
            'if': () => '/if',
            'else': () => '/else',
            'line': () => '/',
            'group-start': () => '{',
            'group-end': () => '}'
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
     * @param {boolean} specialBracketingActive - Whether special bracketing is active (Label + If present)
     * @param {boolean} isInModifierChain - Whether this block is part of a modifier chain
     * @returns {string} Content with formula mode formatting applied
     */
    _applyFormulaModeFormatting(content, blockId, formulaMode, specialBracketingActive, isInModifierChain = false) {
        if (!formulaMode) {
            return content;
        }
        
        // Skip null content (e.g., based blocks that were processed with other blocks)
        if (content === null) {
            return null;
        }
        
        // In formula mode, if/else blocks are never wrapped in brackets
        if (blockId === 'if' || blockId === 'else') {
            console.log(`Block Editor | Code Generator: Formula mode - ${blockId} block not wrapped in brackets`);
            return content;
        }
        
        // In formula mode, label blocks are NEVER wrapped in individual brackets
        if (blockId === 'label') {
            console.log(`Block Editor | Code Generator: Formula mode - label block not wrapped in individual brackets`);
            return content;
        }
        
        // BASED blocks are NEVER wrapped in individual brackets in formula mode
        if (blockId === 'based') {
            console.log(`Block Editor | Code Generator: Formula mode - based block not wrapped in individual brackets`);
            return content;
        }
        
        // Group blocks are NEVER wrapped in individual brackets in formula mode
        if (blockId === 'group-start' || blockId === 'group-end') {
            console.log(`Block Editor | Code Generator: Formula mode - ${blockId} block not wrapped in individual brackets`);
            return content;
        }
        
        // Modifier and And blocks in chains are handled specially - don't wrap individually
        if (isInModifierChain && (blockId === 'mod' || blockId === 'and')) {
            console.log(`Block Editor | Code Generator: Formula mode - ${blockId} block in modifier chain, not wrapping individually`);
            return content;
        }
        
        // For text blocks in formula mode, remove quotes before wrapping in brackets
        if (blockId === 'text') {
            // Remove the outer quotes that were added by _formatBlockContent
            const unquotedContent = content.replace(/^"(.*)"$/, '$1');
            console.log(`Block Editor | Code Generator: Formula mode - text block quotes removed: "${content}" -> "${unquotedContent}"`);
            return `[${unquotedContent}]`;
        }
        
        // All other blocks get individual bracket wrapping in formula mode
        console.log(`Block Editor | Code Generator: Formula mode - wrapping ${blockId} block in individual brackets`);
        return `[${content}]`;
    }

    /**
     * Assemble the final code string with appropriate wrapping and syntax
     * @param {Array} codeParts - Array of formatted code parts
     * @param {boolean} formulaMode - Whether formula mode is enabled
     * @param {boolean} hasLabelBlock - Whether workspace contains a label block
     * @param {boolean} hasIfBlock - Whether workspace contains an if block
     * @returns {string} Final assembled code string
     */
    _assembleFinalCode(codeParts, formulaMode, hasLabelBlock, hasIfBlock) {
        // Filter out null parts (e.g., based blocks that were processed with other blocks)
        const filteredParts = codeParts.filter(part => part !== null);
        
        if (filteredParts.length === 0) {
            console.log('Block Editor | Code Generator: No code parts to assemble');
            return '';
        }
        
        console.log(`Block Editor | Code Generator: Assembling final code from ${filteredParts.length} parts in ${formulaMode ? 'formula' : 'normal'} mode`);
        
        // Calculate if special bracketing should be applied
        const specialBracketingActive = hasLabelBlock && hasIfBlock;
        
        if (specialBracketingActive) {
            console.log('Block Editor | Code Generator: Special bracketing active - wrapping entire expression in brackets');
            const intermediateCode = filteredParts.join(' ');
            return `[${intermediateCode}]`;
        }
        
        if (formulaMode) {
            // Formula mode: parts are already individually wrapped, just join with spaces
            const result = filteredParts.join(' ');
            console.log(`Block Editor | Code Generator: Formula mode assembly complete: ${result}`);
            return result;
        } else {
            // Normal mode: check for special cases, otherwise wrap everything
            return this._assembleNormalModeCode(filteredParts);
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