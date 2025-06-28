// Register module when Foundry initializes
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
    
    // Define module API
    game.modules.get('block-editor').api = {
        openEditor: openBlockEditor
    };
});

// When Foundry is ready
Hooks.once('ready', async function() {
    console.log('Block Editor | Module loaded and ready!');
    
    // Check if should auto-open
    if (game.settings.get("block-editor", "autoOpen")) {
        setTimeout(() => game.modules.get('block-editor').api.openEditor(), 1000);
    }
});

// Definition of available blocks - with fixed values for some blocks
const AVAILABLE_BLOCKS = {
    'label': {
        nome: "Label",
        icone: 'fas fa-tag',
        codigo: '',
        descricao: "Descriptive labels"
    },
    'atributos': {
        nome: "Attributes",
        icone: 'fas fa-chart-bar',
        codigo: '',
        descricao: "Character attributes like Strength, Dexterity, etc."
    },
    'equal': {
        nome: "Equal",
        icone: 'fas fa-equals',
        codigo: '',
        descricao: "Equality comparison operator"
    },
    'mod': {
        nome: "Modifier",
        icone: 'fas fa-calculator',
        codigo: '',
        descricao: "Numeric modifier for rolls"
    },
    'spells': {
        nome: "Spells",
        icone: 'fas fa-magic',
        codigo: '',
        descricao: "Magic spells and abilities"
    },
    'skills': {
        nome: "Skills",
        icone: 'fas fa-cogs',
        codigo: '',
        descricao: "Character skills and proficiencies"
    },
    'costs': {
        nome: "Costs",
        icone: 'fas fa-coins',
        codigo: '',
        descricao: "Resource costs for actions"
    },
    'text': {
        nome: "Text",
        icone: 'fas fa-font',
        codigo: '',
        descricao: "Custom text content"
    },
    'damage': {
        nome: "Damage",
        icone: 'fas fa-sword',
        codigo: '',
        descricao: "Damage values and calculations"
    },
    'line': {
        nome: "Line",
        icone: 'fas fa-slash',
        codigo: '/',
        descricao: "Line separator"
    },
    'ranged': {
        nome: "Ranged",
        icone: 'fas fa-bow-arrow',
        codigo: '',
        descricao: "Ranged attack values"
    },
    'melee': {
        nome: "Melee",
        icone: 'fas fa-sword',
        codigo: '',
        descricao: "Melee attack values"
    },
    'weapond': {
        nome: "Weapon Damage",
        icone: 'fas fa-hammer',
        codigo: '',
        descricao: "Weapon damage values"
    },
    'parry': {
        nome: "Parry",
        icone: 'fas fa-shield',
        codigo: '',
        descricao: "Parry defense values"
    },
    'or': {
        nome: "Or",
        icone: 'fas fa-code-branch',
        codigo: '|',
        descricao: "Logical OR operator"
    },
    'check': {
        nome: "Check",
        icone: 'fas fa-check-circle',
        codigo: '?',
        descricao: "Condition check operator"
    },
    'if': {
        nome: "If",
        icone: 'fas fa-question-circle',
        codigo: '/if',
        descricao: "Conditional if statement"
    },
    'else': {
        nome: "Else",
        icone: 'fas fa-exchange-alt',
        codigo: '/else',
        descricao: "Conditional else statement"
    },
    'based': {
        nome: "Based",
        icone: 'fas fa-foundation',
        codigo: '',
        descricao: "Based on another value"
    }
};

// Main function that opens the block editor
function openBlockEditor() {
    // HTML content of the editor
    const htmlContent = `
        <div class="block-editor-content">
      
            
            <div class="editor-main">
                <div class="blocks-palette">
                    <div class="checkbox-controls">
                        <label>
                            <input type="checkbox" id="blind-checkbox"> Blind Roll
                        </label>
                        <label>
                            <input type="checkbox" id="formula-checkbox"> Formula Mode
                        </label>
                    </div>
                    <h3><i class="fas fa-th-large"></i> Blocks Palette</h3>
                    <div class="palette-grid" id="palette-grid">
                        ${Object.entries(AVAILABLE_BLOCKS).map(([id, bloco]) => `
                            <div class="block-item" data-block-id="${id}" draggable="true" ${(['if', 'else'].includes(id)) ? 'style="display: none;"' : ''}>
                                <i class="${bloco.icone}"></i>
                                <span>${bloco.nome}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="workspace">
                    <h3><i class="fas fa-hammer"></i> Workspace</h3>
                    <div class="workspace-area" id="workspace-area">
                        <div class="drop-zone">
                            <i class="fas fa-mouse-pointer"></i>
                            <p>Drag blocks here to start building!</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="code-output">
                <h3><i class="fas fa-terminal"></i> Generated Code</h3>
                <textarea id="codigo-gerado" placeholder="Generated code will appear here automatically when you add and edit blocks..."></textarea>
                <div class="output-controls">
                    <button type="button" class="btn-clear">
                        <i class="fas fa-trash"></i> Clear
                    </button>
                    <button type="button" class="btn-copy">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button type="button" class="btn-execute">
                        <i class="fas fa-play"></i> Execute
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Dialog configuration
    const dialogConfig = {
        title: "Block Editor",
        content: htmlContent,
        buttons: {},
        default: "close",
        render: (html) => {
            console.log("Block Editor | Editor rendered");
            initializeEditor(html);
        },
        close: () => {
            console.log("Block Editor | Editor closed and cleaned");
        }
    };
    
    // Create and show dialog
    new Dialog(dialogConfig, {
        width: 900,
        height: 700,
        resizable: true,
        classes: ["block-editor-dialog"]
    }).render(true);
}

// Initialize editor with drag and drop functionality
function initializeEditor(html) {
    let workspaceBlocks = [];
    let draggedElement = null;
    let draggedFromPalette = false;
    
    // Internal function to automatically generate code
    function generateCode() {
        const workspaceArea = html.find('#workspace-area')[0];
        const blocks = workspaceArea.querySelectorAll('.workspace-block');
        
        if (blocks.length === 0) {
            html.find('#codigo-gerado').val('');
            return;
        }
        
        // Get checkbox states
        const blindChecked = html.find('#blind-checkbox')[0].checked;
        const formulaChecked = html.find('#formula-checkbox')[0].checked;
        
        let codeParts = [];
        let lastBlockType = null;
        
        blocks.forEach((block, index) => {
            const blockId = block.dataset.blockId;
            const textarea = block.querySelector('.block-code textarea');
            
            if (textarea && textarea.value.trim()) {
                let content = textarea.value.trim();
                
                // Apply specific formatting based on block type
                switch (blockId) {
                    case 'label':
                    case 'text':
                        // Wrap in double quotes
                        content = `"${content}"`;
                        break;
                    case 'skills':
                        // Add Sk: prefix (no space) and blind prefix if checked
                        content = blindChecked ? `!Sk:${content}` : `Sk:${content}`;
                        break;
                    case 'spells':
                        // Add S: prefix and blind prefix if checked
                        content = blindChecked ? `!S: ${content}` : `S: ${content}`;
                        break;
                    case 'atributos':
                        // Add blind prefix if checked
                        content = blindChecked ? `!${content}` : content;
                        break;
                    case 'costs':
                        // Add *Costs prefix
                        content = `*Costs ${content}`;
                        break;
                    case 'damage':
                        // Damage has no asterisk, just the value
                        content = content;
                        break;
                    case 'ranged':
                        // Add R: prefix (SK standard)
                        content = `R:${content}`;
                        break;
                    case 'melee':
                        // Add M: prefix (SK standard)
                        content = `M:${content}`;
                        break;
                    case 'weapond':
                        // Add D: prefix (SK standard)
                        content = `D:${content}`;
                        break;
                    case 'parry':
                        // Add P: prefix (SK standard)
                        content = `P:${content}`;
                        break;
                    case 'equal':
                        // Equal is =value without spaces
                        content = `=${content}`;
                        break;
                    case 'mod':
                        // Mod has no quotes
                        content = content;
                        break;
                    case 'or':
                        // OR is always "|" without quotes
                        content = '|';
                        break;
                    case 'check':
                        // Check is always "?" without quotes
                        content = '?';
                        break;
                    case 'if':
                        // If is always "/if" without quotes and NEVER wrapped
                        content = '/if';
                        break;
                    case 'else':
                        // Else is always "/else" without quotes and NEVER wrapped
                        content = '/else';
                        break;
                    case 'line':
                        // Line is always "/" without quotes
                        content = '/';
                        break;
                    case 'based':
                        // Based adds "Based:" prefix
                        content = `Based:${content}`;
                        break;
                    default:
                        // Other blocks keep content as is
                        break;
                }
                
                // Add comma between two consecutive text blocks
                if (lastBlockType === 'text' && blockId === 'text' && codeParts.length > 0) {
                    codeParts[codeParts.length - 1] += ',';
                }
                
                // Handle formula mode - if/else blocks are NEVER wrapped
                if (formulaChecked) {
                    if (blockId === 'if' || blockId === 'else') {
                        codeParts.push(content); // Never wrap if/else
                    } else {
                        codeParts.push(`[${content}]`);
                    }
                } else {
                    if (blockId === 'if' || blockId === 'else') {
                        codeParts.push(content); // Never wrap if/else
                    } else {
                        codeParts.push(content);
                    }
                }
                
                lastBlockType = blockId;
            }
        });
        
        // Join parts and wrap appropriately
        let finalCode = '';
        if (codeParts.length > 0) {
            if (formulaChecked) {
                finalCode = codeParts.join(' ');
            } else {
                // Check if we have any if/else blocks
                const hasIfElse = codeParts.some(part => part === '/if' || part === '/else');
                if (hasIfElse) {
                    // Don't wrap the entire thing if it contains if/else
                    finalCode = codeParts.join(' ');
                } else {
                    finalCode = `[${codeParts.join(' ')}]`;
                }
            }
        }
        
        html.find('#codigo-gerado').val(finalCode);
    }
    
    // Function to toggle if/else blocks visibility
    function toggleIfElseBlocks() {
        const formulaChecked = html.find('#formula-checkbox')[0].checked;
        const ifBlock = html.find('[data-block-id="if"]')[0];
        const elseBlock = html.find('[data-block-id="else"]')[0];
        
        if (formulaChecked) {
            ifBlock.style.display = 'flex';
            elseBlock.style.display = 'flex';
        } else {
            ifBlock.style.display = 'none';
            elseBlock.style.display = 'none';
        }
    }
    
    // Functions for buttons
    function clearWorkspace() {
        workspaceBlocks = [];
        const workspaceArea = html.find('#workspace-area');
        workspaceArea.html(`
            <div class="drop-zone">
                <i class="fas fa-mouse-pointer"></i>
                <p>Drag blocks here to start building!</p>
            </div>
        `);
        html.find('#codigo-gerado').val('');
        ui.notifications.info("Workspace cleared.");
    }
    
    function copyCode() {
        const code = html.find('#codigo-gerado').val();
        if (!code) {
            ui.notifications.warn("No code to copy.");
            return;
        }
        
        navigator.clipboard.writeText(code).then(() => {
            ui.notifications.success("Code copied to clipboard!");
        }).catch(() => {
            ui.notifications.error("Failed to copy code. Please copy manually.");
        });
    }
    
    function executeCode() {
        const code = html.find('#codigo-gerado').val();
        if (!code) {
            ui.notifications.warn("No blocks in workspace to execute.");
            return;
        }
        
        try {
            // Simulate code execution (in a real environment, you would implement specific logic)
            console.log("Executing code:", code);
            ui.notifications.info("Code executed successfully!");
            
            // Send to chat
            ChatMessage.create({
                user: game.user.id,
                content: `<div class="code-execution">
                    <h3><i class="fas fa-code"></i>OtF</h3>
                ${code}
                </div>`
            });
        } catch (error) {
            ui.notifications.error("Error executing code: " + error.message);
        }
    }
    
    function removeBlock(blockId, element) {
        const index = workspaceBlocks.indexOf(blockId);
        if (index > -1) {
            workspaceBlocks.splice(index, 1);
        }
        
        $(element).closest('.workspace-block').remove();
        
        // If no more blocks, show drop zone again
        if (workspaceBlocks.length === 0) {
            html.find('#workspace-area').html(`
                <div class="drop-zone">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>Drag blocks here to start building!</p>
                </div>
            `);
        }
        
        ui.notifications.info("Block removed.");
        
        // Automatically generate code after removing block
        generateCode();
    }
    
    // Attach event listeners to buttons
    html.find('.btn-clear').on('click', clearWorkspace);
    html.find('.btn-copy').on('click', copyCode);
    html.find('.btn-execute').on('click', executeCode);
    
    // Add event listeners for drag and drop from palette
    const paletteItems = html.find('.block-item');
    const workspaceArea = html.find('#workspace-area')[0];
    
    // Drag start on palette blocks
    paletteItems.each(function() {
        this.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.dataset.blockId);
            this.classList.add('dragging');
            draggedFromPalette = true;
        });
        
        this.addEventListener('dragend', function(e) {
            this.classList.remove('dragging');
            draggedFromPalette = false;
        });
    });
    
    // Drop zone in workspace
    workspaceArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        if (draggedFromPalette) {
            this.classList.add('drag-over');
        }
    });
    
    workspaceArea.addEventListener('dragleave', function(e) {
        if (draggedFromPalette) {
            this.classList.remove('drag-over');
        }
    });
    
    workspaceArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        if (draggedFromPalette) {
            const blockId = e.dataTransfer.getData('text/plain');
            addBlockToWorkspace(blockId, html);
        }
    });
    
    // Add event listeners for checkboxes to regenerate code and toggle if/else
    html.find('#blind-checkbox').each(function() {
        this.addEventListener('change', generateCode);
    });
    
    html.find('#formula-checkbox').each(function() {
        this.addEventListener('change', function() {
            toggleIfElseBlocks();
            generateCode();
        });
    });
    
    function addBlockToWorkspace(blockId, html) {
        if (!AVAILABLE_BLOCKS[blockId]) return;
        
        const block = AVAILABLE_BLOCKS[blockId];
        workspaceBlocks.push(blockId);
        
        // Remove drop zone if it's the first block
        if (workspaceBlocks.length === 1) {
            html.find('#workspace-area').empty();
        }
        
        // Define placeholder and readonly for fixed blocks
        let placeholder = "Enter value...";
        let readonly = '';
        
        if (['or', 'check', 'if', 'else', 'line'].includes(blockId)) {
            placeholder = "Read-only";
            readonly = 'readonly';
        }
        
        // Create block element in workspace with editable textarea
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
        
        // If it's a label block, prepend it; otherwise append
        if (blockId === 'label') {
            html.find('#workspace-area').prepend(blockElement);
        } else {
            html.find('#workspace-area').append(blockElement);
        }
        
        // Attach event listener to remove button
        blockElement.find('.remove-block').on('click', function() {
            removeBlock(blockId, this);
        });
        
        // Add event listener for textarea to automatically generate code
        const textarea = blockElement.find('textarea')[0];
        textarea.addEventListener('input', generateCode);
        
        // Add drag and drop functionality for reordering
        const workspaceBlock = blockElement[0];
        workspaceBlock.addEventListener('dragstart', function(e) {
            draggedElement = this;
            draggedFromPalette = false;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        workspaceBlock.addEventListener('dragend', function(e) {
            this.classList.remove('dragging');
            draggedElement = null;
        });
        
        workspaceBlock.addEventListener('dragover', function(e) {
            if (!draggedFromPalette && draggedElement && draggedElement !== this) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            }
        });
        
        workspaceBlock.addEventListener('drop', function(e) {
            if (!draggedFromPalette && draggedElement && draggedElement !== this) {
                e.preventDefault();
                
                // Remove dragged element from current position
                const parent = draggedElement.parentNode;
                parent.removeChild(draggedElement);
                
                // Determine insertion position
                const rect = this.getBoundingClientRect();
                const midpoint = rect.left + rect.width / 2;
                
                if (e.clientX < midpoint) {
                    // Insert before current element
                    this.parentNode.insertBefore(draggedElement, this);
                } else {
                    // Insert after current element
                    this.parentNode.insertBefore(draggedElement, this.nextSibling);
                }
                
                // Regenerate code after reordering
                generateCode();
            }
        });
        
        ui.notifications.info(`"${block.nome}" block added.`);
        
        // Automatically generate code after adding block
        generateCode();
    }
}

// Add chat command to open editor
Hooks.on("chatMessage", (chatLog, message, chatData) => {
    if (message === "/blocks" || message === "/editor") {
        openBlockEditor();
        return false;
    }
});

console.log("Block Editor | Main script loaded");