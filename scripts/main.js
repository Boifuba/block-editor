/**
 * Block Editor Main Module
 * 
 * Entry point for the Block Editor module. Handles Foundry VTT integration,
 * module initialization, settings registration, and dialog management.
 * 
 * Features:
 * - Module initialization and settings registration
 * - Auto-open functionality based on user settings
 * - Chat command integration (/blocks, /editor)
 * - Keyboard shortcut support (Ctrl+B)
 * - Dialog creation and management
 */

import { BlockEditor } from './BlockEditor.js';
import { EDITOR_HTML_TEMPLATE } from './constants.js';

/**
 * Initialize the Block Editor module when Foundry starts
 */
Hooks.once('init', async function() {
    console.log('Block Editor | Initializing module...');
    
    // Register module settings
    game.settings.register("block-editor", "autoOpen", {
        name: "Auto-open Editor",
        hint: "Automatically open the Block Editor when Foundry VTT loads.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });
    
    // Define module API for external access
    game.modules.get('block-editor').api = {
        openEditor: openBlockEditor,
        BlockEditor: BlockEditor
    };
    
    console.log('Block Editor | Module initialization complete');
});

/**
 * Handle module ready state and auto-open functionality
 */
Hooks.once('ready', async function() {
    console.log('Block Editor | Module ready and fully loaded');
    
    // Check if auto-open is enabled and open editor after a delay
    if (game.settings.get("block-editor", "autoOpen")) {
        console.log('Block Editor | Auto-open enabled, opening editor in 1 second');
        setTimeout(() => {
            game.modules.get('block-editor').api.openEditor();
        }, 1000);
    }
});

/**
 * Handle chat commands for opening the editor
 */
Hooks.on("chatMessage", (chatLog, message, chatData) => {
    if (message === "/blocks" || message === "/editor") {
        console.log(`Block Editor | Chat command received: ${message}`);
        openBlockEditor();
        return false; // Prevent the command from appearing in chat
    }
});

/**
 * Handle keyboard shortcuts
 */
Hooks.on("ready", () => {
    document.addEventListener('keydown', (event) => {
        // Ctrl+B to open Block Editor
        if (event.ctrlKey && event.key === 'b') {
            console.log('Block Editor | Keyboard shortcut Ctrl+B pressed');
            event.preventDefault();
            openBlockEditor();
        }
    });
});

/**
 * Main function to open the Block Editor dialog
 * Creates a new dialog with the editor interface and initializes the BlockEditor class
 */
function openBlockEditor() {
    console.log('Block Editor | Opening editor dialog');
    
    // Dialog configuration
    const dialogConfig = {
        title: "Block Editor - Foundry VTT",
        content: EDITOR_HTML_TEMPLATE,
        buttons: {}, // No default buttons, using custom ones in the interface
        default: "close",
        render: (html) => {
            console.log('Block Editor | Dialog rendered, initializing editor');
            // Initialize the BlockEditor class with the rendered HTML
            new BlockEditor(html);
        },
        close: () => {
            console.log('Block Editor | Dialog closed and cleaned up');
        }
    };
    
    // Create and display the dialog
    const dialog = new Dialog(dialogConfig, {
        width: 900,
        height: 700,
        resizable: true,
        classes: ["block-editor-dialog"]
    });
    
    dialog.render(true);
    console.log('Block Editor | Dialog created and rendered');
}

console.log('Block Editor | Main script loaded successfully');