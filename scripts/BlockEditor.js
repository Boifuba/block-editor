/**
 * Block Editor Class
 * 
 * Main class that handles all the logic for the Block Editor interface.
 * This includes drag and drop functionality, code generation, workspace management,
 * and user interactions.
 * 
 * Features:
 * - Drag and drop blocks from palette to workspace
 * - Automatic code generation based on block arrangement
 * - Two modes: Normal (wrapped in brackets) and Formula (individual brackets)
 * - Blind roll support (disabled in Formula mode)
 * - Block reordering within workspace
 * - Real-time code preview and execution
 */

import { AVAILABLE_BLOCKS, FORMULA_ONLY_BLOCKS, READONLY_BLOCKS } from './constants.js';

export class BlockEditor {
    /**
     * Initialize the Block Editor with the provided HTML element
     * @param {jQuery} html - The jQuery-wrapped HTML element of the dialog
     */
    constructor(html) {
        this.html = html;
        this.workspaceBlocks = [];
        this.draggedElement = null;
        this.draggedFromPalette = false;
        
        console.log('Block Editor | Initializing editor instance');
        this._setupEventListeners();
        this._initializeCheckboxStates();
    }

    /**
     * Set up all event listeners for the editor
     * Includes buttons, checkboxes, and drag/drop functionality
     */
    _setupEventListeners() {
        console.log('Block Editor | Setting up event listeners');
        
        // Button event listeners
        this.html.find('.btn-clear').on('click', () => this._clearWorkspace());
        this.html.find('.btn-copy').on('click', () => this._copyCode());
        this.html.find('.btn-execute').on('click', () => this._executeCode());
        
        // Checkbox event listeners
        this.html.find('#blind-checkbox').on('change', () => {
            console.log('Block Editor | Blind checkbox changed');
            this._generateCode();
        });
        
        this.html.find('#formula-checkbox').on('change', () => {
            console.log('Block Editor | Formula checkbox changed');
            this._toggleFormulaOnlyBlocks();
            this._handleCheckboxExclusivity();
            this._generateCode();
        });
        
        // Drag and drop setup
        this._setupPaletteDragAndDrop();
        this._setupWorkspaceDragAndDrop();
    }

    /**
     * Initialize checkbox states and block visibility on startup
     */
    _initializeCheckboxStates() {
        console.log('Block Editor | Initializing checkbox states');
        this._toggleFormulaOnlyBlocks();
        this._handleCheckboxExclusivity();
    }

    /**
     * Set up drag and drop functionality for palette blocks
     */
    _setupPaletteDragAndDrop() {
        console.log('Block Editor | Setting up palette drag and drop');
        
        const paletteItems = this.html.find('.block-item');
        
        paletteItems.each((index, element) => {
            element.addEventListener('dragstart', (e) => {
                console.log(`Block Editor | Starting drag for block: ${element.dataset.blockId}`);
                e.dataTransfer.setData('text/plain', element.dataset.blockId);
                element.classList.add('dragging');
                this.draggedFromPalette = true;
            });
            
            element.addEventListener('dragend', (e) => {
                console.log(`Block Editor | Ending drag for block: ${element.dataset.blockId}`);
                element.classList.remove('dragging');
                this.draggedFromPalette = false;
            });
        });
    }

    /**
     * Set up drag and drop functionality for the workspace area
     */
    _setupWorkspaceDragAndDrop() {
        console.log('Block Editor | Setting up workspace drag and drop');
        
        const workspaceArea = this.html.find('#workspace-area')[0];
        
        // Handle drag over workspace
        workspaceArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (this.draggedFromPalette) {
                workspaceArea.classList.add('drag-over');
            }
        });
        
        // Handle drag leave workspace
        workspaceArea.addEventListener('dragleave', (e) => {
            if (this.draggedFromPalette) {
                workspaceArea.classList.remove('drag-over');
            }
        });
        
        // Handle drop on workspace
        workspaceArea.addEventListener('drop', (e) => {
            e.preventDefault();
            workspaceArea.classList.remove('drag-over');
            
            if (this.draggedFromPalette) {
                const blockId = e.dataTransfer.getData('text/plain');
                console.log(`Block Editor | Dropping block ${blockId} on workspace`);
                this._addBlockToWorkspace(blockId);
            }
        });
    }

    /**
     * Add a block to the workspace
     * @param {string} blockId - The ID of the block to add
     */
    _addBlockToWorkspace(blockId) {
        if (!AVAILABLE_BLOCKS[blockId]) {
            console.warn(`Block Editor | Unknown block ID: ${blockId}`);
            return;
        }

        const block = AVAILABLE_BLOCKS[blockId];
        this.workspaceBlocks.push(blockId);
        
        console.log(`Block Editor | Adding block "${block.nome}" to workspace`);
        
        // Remove drop zone if this is the first block
        if (this.workspaceBlocks.length === 1) {
            this.html.find('#workspace-area').empty();
        }
        
        // Determine if block is readonly and set appropriate placeholder
        const isReadonly = READONLY_BLOCKS.includes(blockId);
        const placeholder = isReadonly ? "Read-only" : "Enter value...";
        const readonly = isReadonly ? 'readonly' : '';
        
        // Create the block element
        const blockElement = $(`
            <div class="workspace-block" data-block-id="${blockId}" draggable="true">
                <div class="block-header">
                    <i class="${block.icone}"></i>
                    <span>${block.nome}</span>
                    <button class="remove-block">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="block-code">
                    <textarea placeholder="${placeholder}" ${readonly}>${block.codigo}</textarea>
                </div>
            </div>
        `);
        
        // Position label blocks at the beginning, others at the end
        if (blockId === 'label') {
            this.html.find('#workspace-area').prepend(blockElement);
        } else {
            this.html.find('#workspace-area').append(blockElement);
        }
        
        // Set up block-specific event listeners
        this._setupBlockEventListeners(blockElement, blockId);
        
        ui.notifications.info(`"${block.nome}" block added to workspace.`);
        this._generateCode();
    }

    /**
     * Set up event listeners for a specific workspace block
     * @param {jQuery} blockElement - The block element
     * @param {string} blockId - The block ID
     */
    _setupBlockEventListeners(blockElement, blockId) {
        // Remove button functionality
        blockElement.find('.remove-block').on('click', (e) => {
            console.log(`Block Editor | Removing block: ${blockId}`);
            this._removeBlock(blockId, e.target);
        });
        
        // Textarea input listener for automatic code generation
        const textarea = blockElement.find('textarea')[0];
        textarea.addEventListener('input', () => {
            console.log(`Block Editor | Content changed in block: ${blockId}`);
            this._generateCode();
        });
        
        // Set up drag and drop for reordering
        this._setupBlockReordering(blockElement[0]);
    }

    /**
     * Set up drag and drop functionality for block reordering within workspace
     * @param {HTMLElement} workspaceBlock - The workspace block element
     */
    _setupBlockReordering(workspaceBlock) {
        workspaceBlock.addEventListener('dragstart', (e) => {
            console.log(`Block Editor | Starting reorder drag for: ${workspaceBlock.dataset.blockId}`);
            this.draggedElement = workspaceBlock;
            this.draggedFromPalette = false;
            workspaceBlock.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        workspaceBlock.addEventListener('dragend', (e) => {
            console.log(`Block Editor | Ending reorder drag for: ${workspaceBlock.dataset.blockId}`);
            workspaceBlock.classList.remove('dragging');
            this.draggedElement = null;
        });
        
        workspaceBlock.addEventListener('dragover', (e) => {
            if (!this.draggedFromPalette && this.draggedElement && this.draggedElement !== workspaceBlock) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            }
        });
        
        workspaceBlock.addEventListener('drop', (e) => {
            if (!this.draggedFromPalette && this.draggedElement && this.draggedElement !== workspaceBlock) {
                e.preventDefault();
                console.log('Block Editor | Reordering blocks in workspace');
                
                // Remove dragged element from current position
                const parent = this.draggedElement.parentNode;
                parent.removeChild(this.draggedElement);
                
                // Determine insertion position based on mouse position
                const rect = workspaceBlock.getBoundingClientRect();
                const midpoint = rect.left + rect.width / 2;
                
                if (e.clientX < midpoint) {
                    workspaceBlock.parentNode.insertBefore(this.draggedElement, workspaceBlock);
                } else {
                    workspaceBlock.parentNode.insertBefore(this.draggedElement, workspaceBlock.nextSibling);
                }
                
                this._generateCode();
            }
        });
    }

    /**
     * Remove a block from the workspace
     * @param {string} blockId - The ID of the block to remove
     * @param {HTMLElement} element - The remove button element
     */
    _removeBlock(blockId, element) {
        console.log(`Block Editor | Removing block from workspace: ${blockId}`);
        
        // Remove from tracking array
        const index = this.workspaceBlocks.indexOf(blockId);
        if (index > -1) {
            this.workspaceBlocks.splice(index, 1);
        }
        
        // Remove from DOM
        $(element).closest('.workspace-block').remove();
        
        // Show drop zone if no blocks remain
        if (this.workspaceBlocks.length === 0) {
            this.html.find('#workspace-area').html(`
                <div class="drop-zone">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>Drag blocks here to start building!</p>
                </div>
            `);
        }
        
        ui.notifications.info("Block removed from workspace.");
        this._generateCode();
    }

    /**
     * Generate code based on current workspace blocks
     * Handles both Normal and Formula modes with appropriate formatting
     */
    _generateCode() {
        console.log('Block Editor | Generating code from workspace blocks');
        
        const workspaceArea = this.html.find('#workspace-area')[0];
        const blocks = workspaceArea.querySelectorAll('.workspace-block');
        
        if (blocks.length === 0) {
            this.html.find('#codigo-gerado').val('');
            return;
        }
        
        // Get current checkbox states
        const blindChecked = this.html.find('#blind-checkbox')[0].checked;
        const formulaChecked = this.html.find('#formula-checkbox')[0].checked;
        
        console.log(`Block Editor | Code generation mode - Blind: ${blindChecked}, Formula: ${formulaChecked}`);
        
        let codeParts = [];
        let lastBlockType = null;
        
        blocks.forEach((block, index) => {
            const blockId = block.dataset.blockId;
            const textarea = block.querySelector('.block-code textarea');
            
            if (textarea && textarea.value.trim()) {
                let content = textarea.value.trim();
                content = this._formatBlockContent(blockId, content, blindChecked);
                
                // Handle comma separation for consecutive text blocks
                if (lastBlockType === 'text' && blockId === 'text' && codeParts.length > 0) {
                    codeParts[codeParts.length - 1] += ',';
                }
                
                // Apply formula mode formatting
                if (formulaChecked) {
                    // Never wrap if/else blocks in formula mode
                    if (blockId === 'if' || blockId === 'else') {
                        codeParts.push(content);
                    } else {
                        codeParts.push(`[${content}]`);
                    }
                } else {
                    codeParts.push(content);
                }
                
                lastBlockType = blockId;
            }
        });
        
        // Join parts and apply final wrapping
        let finalCode = this._assembleFinalCode(codeParts, formulaChecked);
        
        console.log(`Block Editor | Generated code: ${finalCode}`);
        this.html.find('#codigo-gerado').val(finalCode);
    }

    /**
     * Format block content based on block type and settings
     * @param {string} blockId - The block type ID
     * @param {string} content - The raw content
     * @param {boolean} blindChecked - Whether blind mode is enabled
     * @returns {string} Formatted content
     */
    _formatBlockContent(blockId, content, blindChecked) {
        switch (blockId) {
            case 'label':
            case 'text':
                return `"${content}"`;
            
            case 'skills':
                return blindChecked ? `!Sk:${content}` : `Sk:${content}`;
            
            case 'spells':
                return blindChecked ? `!S: ${content}` : `S: ${content}`;
            
            case 'atributos':
                return blindChecked ? `!${content}` : content;
            
            case 'costs':
                return `*Costs ${content}`;
            
            case 'damage':
                return content;
            
            case 'ranged':
                return `R:${content}`;
            
            case 'melee':
                return `M:${content}`;
            
            case 'weapond':
                return `D:"${content}"`;
            
            case 'parry':
                return `P:${content}`;
            
            case 'mod':
                return content;
            
            case 'or':
                return '|';
            
            case 'check':
                return '?';
            
            case 'if':
                return '/if';
            
            case 'else':
                return '/else';
            
            case 'line':
                return '/';
            
            case 'based':
                return `Based:${content}`;
            
            default:
                return content;
        }
    }

    /**
     * Assemble the final code string with appropriate wrapping
     * @param {string[]} codeParts - Array of formatted code parts
     * @param {boolean} formulaChecked - Whether formula mode is enabled
     * @returns {string} Final assembled code
     */
    _assembleFinalCode(codeParts, formulaChecked) {
        if (codeParts.length === 0) return '';
        
        if (formulaChecked) {
            return codeParts.join(' ');
        } else {
            // Check if we have any if/else blocks (should not be wrapped)
            const hasIfElse = codeParts.some(part => part === '/if' || part === '/else');
            if (hasIfElse) {
                return codeParts.join(' ');
            } else {
                return `[${codeParts.join(' ')}]`;
            }
        }
    }

    /**
     * Toggle visibility of formula-only blocks based on Formula Mode checkbox
     */
    _toggleFormulaOnlyBlocks() {
        const formulaChecked = this.html.find('#formula-checkbox')[0].checked;
        console.log(`Block Editor | Toggling formula-only blocks visibility: ${formulaChecked}`);
        
        FORMULA_ONLY_BLOCKS.forEach(blockId => {
            const blockElement = this.html.find(`[data-block-id="${blockId}"]`)[0];
            if (blockElement) {
                blockElement.style.display = formulaChecked ? 'flex' : 'none';
            }
        });
    }

    /**
     * Handle mutual exclusivity between Blind Roll and Formula Mode checkboxes
     */
    _handleCheckboxExclusivity() {
        const formulaCheckbox = this.html.find('#formula-checkbox')[0];
        const blindCheckbox = this.html.find('#blind-checkbox')[0];
        
        if (formulaCheckbox.checked) {
            console.log('Block Editor | Formula mode enabled, disabling blind roll');
            blindCheckbox.checked = false;
            blindCheckbox.disabled = true;
        } else {
            console.log('Block Editor | Formula mode disabled, enabling blind roll');
            blindCheckbox.disabled = false;
        }
    }

    /**
     * Clear all blocks from the workspace
     */
    _clearWorkspace() {
        console.log('Block Editor | Clearing workspace');
        
        this.workspaceBlocks = [];
        const workspaceArea = this.html.find('#workspace-area');
        workspaceArea.html(`
            <div class="drop-zone">
                <i class="fas fa-mouse-pointer"></i>
                <p>Drag blocks here to start building!</p>
            </div>
        `);
        this.html.find('#codigo-gerado').val('');
        ui.notifications.info("Workspace cleared successfully.");
    }

    /**
     * Copy the generated code to clipboard
     */
    _copyCode() {
        const code = this.html.find('#codigo-gerado').val();
        if (!code) {
            ui.notifications.warn("No code available to copy.");
            return;
        }
        
        console.log(`Block Editor | Copying code to clipboard: ${code}`);
        
        navigator.clipboard.writeText(code).then(() => {
            ui.notifications.success("Code copied to clipboard successfully!");
        }).catch(() => {
            ui.notifications.error("Failed to copy code. Please copy manually from the text area.");
        });
    }

    /**
     * Execute the generated code (send to chat)
     */
    _executeCode() {
        const code = this.html.find('#codigo-gerado').val();
        if (!code) {
            ui.notifications.warn("No code available to execute.");
            return;
        }
        
        console.log(`Block Editor | Executing code: ${code}`);
        
        try {
            // Send the generated code to chat as an OtF (On the Fly) command
            ChatMessage.create({
                user: game.user.id,
                content: `<div class="code-execution">
                    <h3><i class="fas fa-code"></i> OtF Command</h3>
                    <div class="code-content">${code}</div>
                </div>`
            });
            
            ui.notifications.info("Code executed successfully! Check chat for the OtF command.");
        } catch (error) {
            console.error('Block Editor | Error executing code:', error);
            ui.notifications.error("Error executing code: " + error.message);
        }
    }
}