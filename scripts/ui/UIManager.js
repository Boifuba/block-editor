/**
 * UI Manager for Block Editor
 * 
 * Handles all user interface interactions including drag and drop functionality,
 * block management, workspace operations, user input events, and visual feedback.
 * 
 * This class is responsible for:
 * - Setting up and managing event listeners
 * - Handling drag and drop operations between palette and workspace
 * - Managing workspace blocks (add, remove, reorder)
 * - Coordinating with CodeGenerator for automatic code generation
 * - Managing user interactions (copy, execute, clear)
 * - Applying visual feedback based on validation rules
 */

import { FORMULA_ONLY_BLOCKS, READONLY_BLOCKS } from '../constants.js';
import { validateWorkspace } from '../validation/validationRules.js';

export class UIManager {
    /**
     * Initialize the UI Manager
     * @param {jQuery} html - The jQuery-wrapped HTML element of the dialog
     * @param {CodeGenerator} codeGenerator - Instance of code generator for automatic updates
     */
    constructor(html, codeGenerator) {
        this.html = html;
        this.codeGenerator = codeGenerator;
        this.workspaceBlocks = [];
        this.draggedElement = null;
        this.draggedFromPalette = false;
        
        console.log('Block Editor | UI Manager: Initializing interface components');
        this._initializeInterface();
    }

    /**
     * Initialize the complete user interface
     * Sets up all event listeners and initial states
     */
    _initializeInterface() {
        console.log('Block Editor | UI Manager: Setting up complete interface');
        this._setupEventListeners();
        this._initializeCheckboxStates();
        this._setupDragAndDropSystem();
    }

    /**
     * Set up all event listeners for buttons and checkboxes
     */
    _setupEventListeners() {
        console.log('Block Editor | UI Manager: Configuring button and checkbox event listeners');
        
        // Button event listeners with clear logging
        this.html.find('.btn-clear').on('click', () => {
            console.log('Block Editor | UI Manager: Clear button clicked - clearing workspace');
            this._clearWorkspace();
        });
        
        this.html.find('.btn-copy').on('click', () => {
            console.log('Block Editor | UI Manager: Copy button clicked - copying generated code');
            this._copyCode();
        });
        
        this.html.find('.btn-execute').on('click', () => {
            console.log('Block Editor | UI Manager: Execute button clicked - running generated code');
            this._executeCode();
        });
        
        // Checkbox event listeners with state management
        this.html.find('#blind-checkbox').on('change', (event) => {
            const isChecked = event.target.checked;
            console.log(`Block Editor | UI Manager: Blind roll checkbox changed to: ${isChecked}`);
            this._triggerCodeGeneration();
        });
        
        this.html.find('#formula-checkbox').on('change', (event) => {
            const isChecked = event.target.checked;
            console.log(`Block Editor | UI Manager: Formula mode checkbox changed to: ${isChecked}`);
            this._handleFormulaModeToggle();
        });
    }

    /**
     * Initialize checkbox states and manage block visibility
     */
    _initializeCheckboxStates() {
        console.log('Block Editor | UI Manager: Initializing checkbox states and block visibility');
        this._toggleFormulaOnlyBlocks();
        this._handleCheckboxExclusivity();
    }

    /**
     * Set up the complete drag and drop system
     */
    _setupDragAndDropSystem() {
        console.log('Block Editor | UI Manager: Initializing drag and drop system');
        this._setupPaletteDragAndDrop();
        this._setupWorkspaceDragAndDrop();
    }

    /**
     * Configure drag and drop functionality for palette blocks
     */
    _setupPaletteDragAndDrop() {
        console.log('Block Editor | UI Manager: Setting up palette drag and drop handlers');
        
        const paletteItems = this.html.find('.block-item');
        
        paletteItems.each((index, element) => {
            // Drag start event - block begins being dragged from palette
            element.addEventListener('dragstart', (e) => {
                const blockId = element.dataset.blockId;
                console.log(`Block Editor | UI Manager: Drag started for palette block: ${blockId}`);
                
                e.dataTransfer.setData('text/plain', blockId);
                element.classList.add('dragging');
                this.draggedFromPalette = true;
            });
            
            // Drag end event - block drag operation completed
            element.addEventListener('dragend', (e) => {
                const blockId = element.dataset.blockId;
                console.log(`Block Editor | UI Manager: Drag ended for palette block: ${blockId}`);
                
                element.classList.remove('dragging');
                this.draggedFromPalette = false;
            });
        });
    }

    /**
     * Configure drag and drop functionality for workspace area
     */
    _setupWorkspaceDragAndDrop() {
        console.log('Block Editor | UI Manager: Setting up workspace drag and drop handlers');
        
        const workspaceArea = this.html.find('#workspace-area')[0];
        
        // Handle drag over workspace - visual feedback for valid drop zone
        workspaceArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (this.draggedFromPalette) {
                workspaceArea.classList.add('drag-over');
            }
        });
        
        // Handle drag leave workspace - remove visual feedback
        workspaceArea.addEventListener('dragleave', (e) => {
            if (this.draggedFromPalette) {
                workspaceArea.classList.remove('drag-over');
            }
        });
        
        // Handle drop on workspace - add block to workspace
        workspaceArea.addEventListener('drop', (e) => {
            e.preventDefault();
            workspaceArea.classList.remove('drag-over');
            
            if (this.draggedFromPalette) {
                const blockId = e.dataTransfer.getData('text/plain');
                console.log(`Block Editor | UI Manager: Block ${blockId} dropped on workspace - adding to workspace`);
                this._addBlockToWorkspace(blockId);
            }
        });
    }

    /**
     * Add a new block to the workspace
     * @param {string} blockId - The ID of the block to add from constants
     */
    _addBlockToWorkspace(blockId) {
        console.log(`Block Editor | UI Manager: Adding block ${blockId} to workspace`);
        
        // Import block definition dynamically to avoid circular dependencies
        import('../constants.js').then(({ AVAILABLE_BLOCKS }) => {
            if (!AVAILABLE_BLOCKS[blockId]) {
                console.error(`Block Editor | UI Manager: Unknown block ID attempted: ${blockId}`);
                ui.notifications.error(`Unknown block type: ${blockId}`);
                return;
            }

            const block = AVAILABLE_BLOCKS[blockId];
            this.workspaceBlocks.push(blockId);
            
            console.log(`Block Editor | UI Manager: Successfully adding "${block.nome}" block to workspace`);
            
            // Remove drop zone if this is the first block
            if (this.workspaceBlocks.length === 1) {
                console.log('Block Editor | UI Manager: First block added - removing drop zone placeholder');
                this.html.find('#workspace-area').empty();
            }
            
            // Create and configure the block element
            const blockElement = this._createBlockElement(blockId, block);
            this._positionBlockInWorkspace(blockElement, blockId);
            this._setupBlockEventListeners(blockElement, blockId);
            
            // Provide user feedback and trigger code generation
            ui.notifications.info(`"${block.nome}" block added to workspace.`);
            this._triggerCodeGeneration();
        });
    }

    /**
     * Create a DOM element for a workspace block
     * @param {string} blockId - The block identifier
     * @param {Object} block - The block definition object
     * @returns {jQuery} The created block element
     */
    _createBlockElement(blockId, block) {
        console.log(`Block Editor | UI Manager: Creating DOM element for block: ${blockId}`);
        
        // Determine if block content is editable
        const isReadonly = READONLY_BLOCKS.includes(blockId);
        const placeholder = isReadonly ? "Read-only block" : "Enter block content...";
        const readonly = isReadonly ? 'readonly' : '';
        
        // Create the complete block structure
        const blockElement = $(`
            <div class="workspace-block" data-block-id="${blockId}" draggable="true">
                <div class="block-header">
                    <i class="${block.icone}"></i>
                    <span>${block.nome}</span>
                    <button class="remove-block" title="Remove this block">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="block-code">
                    <textarea placeholder="${placeholder}" ${readonly}>${block.codigo}</textarea>
                </div>
            </div>
        `);
        
        return blockElement;
    }

    /**
     * Position a block element in the workspace based on block type
     * @param {jQuery} blockElement - The block element to position
     * @param {string} blockId - The block identifier for positioning logic
     */
    _positionBlockInWorkspace(blockElement, blockId) {
        console.log(`Block Editor | UI Manager: Positioning block ${blockId} in workspace`);
        
        // Label blocks should appear at the beginning for better UX
        if (blockId === 'label') {
            console.log('Block Editor | UI Manager: Positioning label block at beginning of workspace');
            this.html.find('#workspace-area').prepend(blockElement);
        } else {
            console.log('Block Editor | UI Manager: Positioning block at end of workspace');
            this.html.find('#workspace-area').append(blockElement);
        }
    }

    /**
     * Set up event listeners for a specific workspace block
     * @param {jQuery} blockElement - The block element
     * @param {string} blockId - The block identifier
     */
    _setupBlockEventListeners(blockElement, blockId) {
        console.log(`Block Editor | UI Manager: Setting up event listeners for workspace block: ${blockId}`);
        
        // Remove button functionality
        blockElement.find('.remove-block').on('click', (e) => {
            console.log(`Block Editor | UI Manager: Remove button clicked for block: ${blockId}`);
            this._removeBlock(blockId, e.target);
        });
        
        // Textarea input listener for automatic code generation
        const textarea = blockElement.find('textarea')[0];
        textarea.addEventListener('input', () => {
            console.log(`Block Editor | UI Manager: Content changed in block: ${blockId} - triggering code generation`);
            this._triggerCodeGeneration();
        });
        
        // Set up drag and drop for block reordering
        this._setupBlockReordering(blockElement[0]);
    }

    /**
     * Configure drag and drop functionality for block reordering within workspace
     * @param {HTMLElement} workspaceBlock - The workspace block element
     */
    _setupBlockReordering(workspaceBlock) {
        const blockId = workspaceBlock.dataset.blockId;
        console.log(`Block Editor | UI Manager: Setting up reordering drag and drop for block: ${blockId}`);
        
        // Start dragging a workspace block for reordering
        workspaceBlock.addEventListener('dragstart', (e) => {
            console.log(`Block Editor | UI Manager: Starting reorder drag for workspace block: ${blockId}`);
            this.draggedElement = workspaceBlock;
            this.draggedFromPalette = false;
            workspaceBlock.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        // End dragging a workspace block
        workspaceBlock.addEventListener('dragend', (e) => {
            console.log(`Block Editor | UI Manager: Ending reorder drag for workspace block: ${blockId}`);
            workspaceBlock.classList.remove('dragging');
            this.draggedElement = null;
        });
        
        // Handle drag over another workspace block
        workspaceBlock.addEventListener('dragover', (e) => {
            if (!this.draggedFromPalette && this.draggedElement && this.draggedElement !== workspaceBlock) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            }
        });
        
        // Handle drop on another workspace block for reordering
        workspaceBlock.addEventListener('drop', (e) => {
            if (!this.draggedFromPalette && this.draggedElement && this.draggedElement !== workspaceBlock) {
                e.preventDefault();
                console.log(`Block Editor | UI Manager: Reordering blocks - moving ${this.draggedElement.dataset.blockId} relative to ${blockId}`);
                
                this._performBlockReordering(workspaceBlock, e);
            }
        });
    }

    /**
     * Perform the actual block reordering operation
     * @param {HTMLElement} targetBlock - The block being dropped onto
     * @param {DragEvent} event - The drop event for position calculation
     */
    _performBlockReordering(targetBlock, event) {
        console.log('Block Editor | UI Manager: Executing block reordering operation');
        
        // Remove dragged element from current position
        const parent = this.draggedElement.parentNode;
        parent.removeChild(this.draggedElement);
        
        // Determine insertion position based on mouse position
        const rect = targetBlock.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;
        
        if (event.clientX < midpoint) {
            console.log('Block Editor | UI Manager: Inserting block before target');
            targetBlock.parentNode.insertBefore(this.draggedElement, targetBlock);
        } else {
            console.log('Block Editor | UI Manager: Inserting block after target');
            targetBlock.parentNode.insertBefore(this.draggedElement, targetBlock.nextSibling);
        }
        
        this._triggerCodeGeneration();
    }

    /**
     * Remove a block from the workspace
     * @param {string} blockId - The ID of the block to remove
     * @param {HTMLElement} element - The remove button element
     */
    _removeBlock(blockId, element) {
        console.log(`Block Editor | UI Manager: Removing block from workspace: ${blockId}`);
        
        // Remove from tracking array
        const index = this.workspaceBlocks.indexOf(blockId);
        if (index > -1) {
            this.workspaceBlocks.splice(index, 1);
            console.log(`Block Editor | UI Manager: Block ${blockId} removed from tracking array at index ${index}`);
        }
        
        // Remove from DOM
        $(element).closest('.workspace-block').remove();
        
        // Show drop zone if no blocks remain
        if (this.workspaceBlocks.length === 0) {
            console.log('Block Editor | UI Manager: No blocks remaining - showing drop zone');
            this._showDropZone();
        }
        
        ui.notifications.info("Block removed from workspace.");
        this._triggerCodeGeneration();
    }

    /**
     * Display the drop zone when workspace is empty
     */
    _showDropZone() {
        console.log('Block Editor | UI Manager: Displaying drop zone for empty workspace');
        this.html.find('#workspace-area').html(`
            <div class="drop-zone">
                <i class="fas fa-mouse-pointer"></i>
                <p>Drag blocks here to start building!</p>
            </div>
        `);
    }

    /**
     * Clear all blocks from the workspace
     */
    _clearWorkspace() {
        console.log('Block Editor | UI Manager: Clearing all blocks from workspace');
        
        this.workspaceBlocks = [];
        this._showDropZone();
        this.html.find('#codigo-gerado').val('');
        
        ui.notifications.info("Workspace cleared successfully.");
        console.log('Block Editor | UI Manager: Workspace cleared and reset to initial state');
    }

    /**
     * Copy the generated code to clipboard
     */
    _copyCode() {
        const code = this.html.find('#codigo-gerado').val();
        
        if (!code) {
            console.log('Block Editor | UI Manager: Copy attempted but no code available');
            ui.notifications.warn("No code available to copy.");
            return;
        }
        
        console.log(`Block Editor | UI Manager: Copying code to clipboard: ${code}`);
        
        navigator.clipboard.writeText(code).then(() => {
            console.log('Block Editor | UI Manager: Code successfully copied to clipboard');
            ui.notifications.success("Code copied to clipboard successfully!");
        }).catch((error) => {
            console.error('Block Editor | UI Manager: Failed to copy code to clipboard:', error);
            ui.notifications.error("Failed to copy code. Please copy manually from the text area.");
        });
    }

    /**
     * Execute the generated code by sending it to chat
     */
    _executeCode() {
        const code = this.html.find('#codigo-gerado').val();
        
        if (!code) {
            console.log('Block Editor | UI Manager: Execute attempted but no code available');
            ui.notifications.warn("No code available to execute.");
            return;
        }
        
        console.log(`Block Editor | UI Manager: Executing generated code: ${code}`);
        
        try {
            // Send the generated code to chat as an OtF (On the Fly) command
            ChatMessage.create({
                user: game.user.id,
                content: `<div class="code-execution">
                    <h3><i class="fas fa-code"></i> OtF Command</h3>
                    <div class="code-content">${code}</div>
                </div>`
            });
            
            console.log('Block Editor | UI Manager: Code successfully executed and sent to chat');
            ui.notifications.info("Code executed successfully! Check chat for the OtF command.");
        } catch (error) {
            console.error('Block Editor | UI Manager: Error executing code:', error);
            ui.notifications.error("Error executing code: " + error.message);
        }
    }

    /**
     * Handle formula mode toggle and related state changes
     */
    _handleFormulaModeToggle() {
        console.log('Block Editor | UI Manager: Handling formula mode toggle');
        this._toggleFormulaOnlyBlocks();
        this._handleCheckboxExclusivity();
        this._triggerCodeGeneration();
    }

    /**
     * Toggle visibility of formula-only blocks based on Formula Mode checkbox
     */
    _toggleFormulaOnlyBlocks() {
        const formulaChecked = this.html.find('#formula-checkbox')[0].checked;
        console.log(`Block Editor | UI Manager: Toggling formula-only blocks visibility: ${formulaChecked ? 'visible' : 'hidden'}`);
        
        FORMULA_ONLY_BLOCKS.forEach(blockId => {
            const blockElement = this.html.find(`[data-block-id="${blockId}"]`)[0];
            if (blockElement) {
                blockElement.style.display = formulaChecked ? 'flex' : 'none';
                console.log(`Block Editor | UI Manager: Block ${blockId} visibility set to: ${formulaChecked ? 'visible' : 'hidden'}`);
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
            console.log('Block Editor | UI Manager: Formula mode enabled - disabling blind roll checkbox');
            blindCheckbox.checked = false;
            blindCheckbox.disabled = true;
        } else {
            console.log('Block Editor | UI Manager: Formula mode disabled - enabling blind roll checkbox');
            blindCheckbox.disabled = false;
        }
    }

    /**
     * Apply visual feedback based on validation rules
     */
    _applyVisualFeedback() {
        console.log('Block Editor | UI Manager: Applying visual feedback based on validation rules');
        
        // Get current workspace block sequence
        const workspaceBlocks = this.getWorkspaceBlocks();
        const blockSequence = Array.from(workspaceBlocks).map(block => block.dataset.blockId);
        
        console.log(`Block Editor | UI Manager: Current block sequence: [${blockSequence.join(', ')}]`);
        
        // Clear existing validation classes
        this.html.find('.workspace-block').removeClass('block-error-highlight block-warning-highlight block-info-highlight');
        this.html.find('.validation-indicator').remove();
        
        // Validate workspace and apply feedback
        const validationIssues = validateWorkspace(blockSequence);
        
        if (validationIssues.length > 0) {
            console.log(`Block Editor | UI Manager: Found ${validationIssues.length} validation issues`);
            
            validationIssues.forEach((issue, index) => {
                console.log(`Block Editor | UI Manager: Issue ${index + 1}: ${issue.ruleName} - highlighting block at index ${issue.highlightIndex}`);
                
                const blockToHighlight = workspaceBlocks[issue.highlightIndex];
                if (blockToHighlight) {
                    // Add highlight class
                    $(blockToHighlight).addClass(issue.cssClass);
                    
                    // Add validation indicator
                    const indicator = $(`
                        <div class="validation-indicator ${issue.severity}" title="${issue.description}">
                            ${issue.severity === 'error' ? '!' : issue.severity === 'warning' ? '⚠' : 'i'}
                        </div>
                    `);
                    $(blockToHighlight).append(indicator);
                    
                    console.log(`Block Editor | UI Manager: Applied ${issue.severity} highlight to block: ${blockToHighlight.dataset.blockId}`);
                }
            });
        } else {
            console.log('Block Editor | UI Manager: No validation issues found - workspace is clean');
        }
    }

    /**
     * Trigger code generation through the code generator and apply visual feedback
     */
    _triggerCodeGeneration() {
        console.log('Block Editor | UI Manager: Triggering code generation and visual feedback');
        this.codeGenerator.generateCode();
        this._applyVisualFeedback();
    }

    /**
     * Get current workspace blocks for code generation
     * @returns {Array} Array of workspace block elements
     */
    getWorkspaceBlocks() {
        const workspaceArea = this.html.find('#workspace-area')[0];
        return workspaceArea.querySelectorAll('.workspace-block');
    }

    /**
     * Get current checkbox states
     * @returns {Object} Object containing checkbox states
     */
    getCheckboxStates() {
        return {
            blind: this.html.find('#blind-checkbox')[0].checked,
            formula: this.html.find('#formula-checkbox')[0].checked
        };
    }

    /**
     * Update the generated code display
     * @param {string} code - The generated code to display
     */
    updateCodeDisplay(code) {
        console.log(`Block Editor | UI Manager: Updating code display with: ${code}`);
        this.html.find('#codigo-gerado').val(code);
    }
}