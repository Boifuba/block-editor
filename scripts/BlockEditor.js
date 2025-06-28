/**
 * Block Editor Main Class
 * 
 * Main orchestrator class that coordinates between UI management and code generation.
 * This class acts as the central controller, initializing and managing the interaction
 * between the UIManager and CodeGenerator components.
 * 
 * Responsibilities:
 * - Initialize and coordinate UI and code generation components
 * - Provide a clean interface for external module integration
 * - Manage the overall editor lifecycle
 * - Handle component communication and state synchronization
 */

import { UIManager } from './ui/UIManager.js';
import { CodeGenerator } from './core/CodeGenerator.js';

export class BlockEditor {
    /**
     * Initialize the Block Editor with all its components
     * @param {jQuery} html - The jQuery-wrapped HTML element of the dialog
     */
    constructor(html) {
        this.html = html;
        
        console.log('Block Editor | Main Controller: Initializing Block Editor system');
        this._initializeComponents();
    }

    /**
     * Initialize all editor components and establish communication between them
     */
    _initializeComponents() {
        console.log('Block Editor | Main Controller: Setting up component architecture');
        
        // Initialize code generator first (no dependencies)
        this.codeGenerator = new CodeGenerator(null);
        console.log('Block Editor | Main Controller: Code generator initialized');
        
        // Initialize UI manager with code generator reference
        this.uiManager = new UIManager(this.html, this.codeGenerator);
        console.log('Block Editor | Main Controller: UI manager initialized');
        
        // Establish bidirectional communication between components
        this.codeGenerator.uiManager = this.uiManager;
        console.log('Block Editor | Main Controller: Component communication established');
        
        console.log('Block Editor | Main Controller: Block Editor system fully initialized and ready');
    }

    /**
     * Get the UI manager instance for external access
     * @returns {UIManager} The UI manager instance
     */
    getUIManager() {
        return this.uiManager;
    }

    /**
     * Get the code generator instance for external access
     * @returns {CodeGenerator} The code generator instance
     */
    getCodeGenerator() {
        return this.codeGenerator;
    }

    /**
     * Manually trigger code generation (for external use)
     */
    generateCode() {
        console.log('Block Editor | Main Controller: Manual code generation triggered');
        this.codeGenerator.generateCode();
    }

    /**
     * Get current workspace state (for external monitoring)
     * @returns {Object} Current workspace state information
     */
    getWorkspaceState() {
        const blocks = this.uiManager.getWorkspaceBlocks();
        const settings = this.uiManager.getCheckboxStates();
        
        return {
            blockCount: blocks.length,
            settings: settings,
            hasBlocks: blocks.length > 0
        };
    }

    /**
     * Clear the workspace (for external control)
     */
    clearWorkspace() {
        console.log('Block Editor | Main Controller: External workspace clear requested');
        this.uiManager._clearWorkspace();
    }
}