/**
 * Block Editor Main Module
 * 
 * Entry point and Foundry VTT integration layer for the Block Editor module.
 * Handles all Foundry-specific functionality including hooks, settings, commands,
 * and dialog management.
 * 
 * Features:
 * - Module initialization and Foundry VTT integration
 * - Settings registration and management
 * - Auto-open functionality based on user preferences
 * - Chat command integration (/blocks, /editor)
 * - Keyboard shortcut support (Ctrl+B)
 * - Dialog creation and lifecycle management
 * - Module API exposure for external access
 */

import { BlockEditor } from './BlockEditor.js';
import { EDITOR_HTML_TEMPLATE } from './constants.js';

/**
 * Initialize the Block Editor module when Foundry VTT starts
 * Sets up module settings and API exposure
 */
Hooks.once('init', async function() {
    console.log('Block Editor | Foundry Integration: Starting module initialization');
    
    // Register module settings for user configuration
    _registerModuleSettings();
    
    // Expose module API for external access and integration
    _exposeModuleAPI();
    
    console.log('Block Editor | Foundry Integration: Module initialization completed successfully');
});

/**
 * Handle module ready state and execute auto-open functionality if enabled
 */
Hooks.once('ready', async function() {
    console.log('Block Editor | Foundry Integration: Module ready - Foundry VTT fully loaded');
    
    // Check user settings and auto-open editor if configured
    _handleAutoOpenFunctionality();
    
    // Set up global keyboard shortcuts
    _setupKeyboardShortcuts();
    
    console.log('Block Editor | Foundry Integration: Ready state processing complete');
});

/**
 * Handle chat commands for opening the editor
 * Intercepts specific commands and prevents them from appearing in chat
 */
Hooks.on("chatMessage", (chatLog, message, chatData) => {
    const command = message.toLowerCase().trim();
    
    if (command === "/blocks" || command === "/editor") {
        console.log(`Block Editor | Foundry Integration: Chat command intercepted: ${command}`);
        openBlockEditor();
        return false; // Prevent the command from appearing in chat
    }
});

/**
 * Register all module settings with Foundry VTT
 */
function _registerModuleSettings() {
    console.log('Block Editor | Foundry Integration: Registering module settings');
    
    game.settings.register("block-editor", "autoOpen", {
        name: "Auto-open Block Editor",
        hint: "Automatically opens the Block Editor when Foundry VTT loads. Useful for frequent users of the editor.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            console.log(`Block Editor | Foundry Integration: Auto-open setting changed to: ${value}`);
        }
    });
    
    console.log('Block Editor | Foundry Integration: Module settings registered successfully');
}

/**
 * Expose module API for external access and integration
 */
function _exposeModuleAPI() {
    console.log('Block Editor | Foundry Integration: Exposing module API');
    
    const moduleAPI = {
        openEditor: openBlockEditor,
        BlockEditor: BlockEditor,
        version: "1.0.0",
        isReady: () => game.ready
    };
    
    game.modules.get('block-editor').api = moduleAPI;
    console.log('Block Editor | Foundry Integration: Module API exposed successfully');
}

/**
 * Handle auto-open functionality based on user settings
 */
function _handleAutoOpenFunctionality() {
    const autoOpenEnabled = game.settings.get("block-editor", "autoOpen");
    
    if (autoOpenEnabled) {
        console.log('Block Editor | Foundry Integration: Auto-open enabled - scheduling editor to open in 1 second');
        
        setTimeout(() => {
            console.log('Block Editor | Foundry Integration: Executing auto-open functionality');
            openBlockEditor();
        }, 1000); // Delay to ensure Foundry is fully ready
    } else {
        console.log('Block Editor | Foundry Integration: Auto-open disabled - editor will not open automatically');
    }
}

/**
 * Set up global keyboard shortcuts for the editor
 */
function _setupKeyboardShortcuts() {
    console.log('Block Editor | Foundry Integration: Setting up keyboard shortcuts');
    
    document.addEventListener('keydown', (event) => {
        // Ctrl+B to open Block Editor
        if (event.ctrlKey && event.key === 'b') {
            console.log('Block Editor | Foundry Integration: Keyboard shortcut Ctrl+B detected');
            event.preventDefault();
            openBlockEditor();
        }
    });
    
    console.log('Block Editor | Foundry Integration: Keyboard shortcuts configured (Ctrl+B)');
}

/**
 * Main function to create and display the Block Editor dialog
 * Handles dialog configuration, creation, and component initialization
 */
function openBlockEditor() {
    console.log('Block Editor | Foundry Integration: Opening Block Editor dialog');
    
    // Configure dialog with appropriate settings
    const dialogConfig = _createDialogConfiguration();
    
    // Create and display the dialog
    const dialog = new Dialog(dialogConfig, {
        width: 900,
        height: 700,
        resizable: true,
        classes: ["block-editor-dialog"]
    });
    
    dialog.render(true);
    console.log('Block Editor | Foundry Integration: Block Editor dialog created and rendered successfully');
}

/**
 * Create the dialog configuration object
 * @returns {Object} Dialog configuration for Foundry VTT
 */
function _createDialogConfiguration() {
    console.log('Block Editor | Foundry Integration: Creating dialog configuration');
    
    return {
        title: "Block Editor - Foundry VTT",
        content: EDITOR_HTML_TEMPLATE,
        buttons: {}, // No default buttons - using custom interface
        default: "close",
        render: (html) => {
            console.log('Block Editor | Foundry Integration: Dialog rendered - initializing Block Editor components');
            
            try {
                // Initialize the main Block Editor system
                const blockEditor = new BlockEditor(html);
                console.log('Block Editor | Foundry Integration: Block Editor components initialized successfully');
                
                // Store reference for potential external access
                html.data('blockEditor', blockEditor);
                
            } catch (error) {
                console.error('Block Editor | Foundry Integration: Error initializing Block Editor:', error);
                ui.notifications.error("Failed to initialize Block Editor. Check console for details.");
            }
        },
        close: () => {
            console.log('Block Editor | Foundry Integration: Block Editor dialog closed and cleaned up');
        }
    };
}

// Log successful script loading
console.log('Block Editor | Foundry Integration: Main integration script loaded successfully');