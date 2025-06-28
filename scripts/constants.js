/**
 * Block Editor Constants
 * 
 * This file contains all the block definitions and configuration constants
 * used throughout the Block Editor module. Each block has a name, icon,
 * default code, and description.
 * 
 * Block Types:
 * - Data blocks: Access actor data (attributes, skills, spells, costs)
 * - Text blocks: Labels and literal text content
 * - Operator blocks: Mathematical and logical operators
 * - Combat blocks: SK system combat values (ranged, melee, weapon damage, parry)
 * - Conditional blocks: Formula mode only (if, else, check, line, based, and)
 * - Utility blocks: Damage values and modifiers
 */

export const AVAILABLE_BLOCKS = {
    // Text and Label Blocks
    'label': {
        nome: "Label",
        icone: 'fas fa-tag',
        codigo: '',
        descricao: "Descriptive labels for fields and properties"
    },
    'text': {
        nome: "Text",
        icone: 'fas fa-font',
        codigo: '',
        descricao: "Custom literal text content"
    },

    // Actor Data Access Blocks
    'atributos': {
        nome: "Attributes",
        icone: 'fas fa-chart-bar',
        codigo: '',
        descricao: "Character attributes like Strength, Dexterity, etc."
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

    // Mathematical and Logical Operators
    'mod': {
        nome: "Modifier",
        icone: 'fas fa-calculator',
        codigo: '',
        descricao: "Numeric modifier for rolls and calculations"
    },
    'or': {
        nome: "Or",
        icone: 'fas fa-code-branch',
        codigo: '|',
        descricao: "Logical OR operator (always generates |)"
    },
    'and': {
        nome: "And",
        icone: 'fas fa-link',
        codigo: '&',
        descricao: "Logical AND operator (always generates &, Formula Mode only)"
    },

    // Combat System Blocks (SK Standard)
    'ranged': {
        nome: "Ranged",
        icone: 'fas fa-bow-arrow',
        codigo: '',
        descricao: "Ranged attack values (R: prefix)"
    },
    'melee': {
        nome: "Melee",
        icone: 'fas fa-sword',
        codigo: '',
        descricao: "Melee attack values (M: prefix)"
    },
    'weapond': {
        nome: "Weapon Damage",
        icone: 'fas fa-hand-fist',
        codigo: '',
        descricao: "Weapon damage values (D: prefix with quotes)"
    },
    'parry': {
        nome: "Parry",
        icone: 'fas fa-shield',
        codigo: '',
        descricao: "Parry defense values (P: prefix)"
    },
    'damage': {
        nome: "Damage",
        icone: 'fas fa-burst',
        codigo: '',
        descricao: "Damage values and calculations"
    },

    // Conditional Blocks (Formula Mode Only)
    'check': {
        nome: "Check",
        icone: 'fas fa-check-circle',
        codigo: '?',
        descricao: "Condition check operator (always generates ?)"
    },
    'if': {
        nome: "If",
        icone: 'fas fa-question-circle',
        codigo: '/if',
        descricao: "Conditional if statement (always generates /if)"
    },
    'else': {
        nome: "Else",
        icone: 'fas fa-exchange-alt',
        codigo: '/else',
        descricao: "Conditional else statement (always generates /else)"
    },
    'line': {
        nome: "Line",
        icone: 'fas fa-slash',
        codigo: '/',
        descricao: "Line separator (always generates /, Formula Mode only)"
    },
    'based': {
        nome: "Based",
        icone: 'fas fa-foundation',
        codigo: '',
        descricao: "Based on another value (Based: prefix, Formula Mode only)"
    }
};

/**
 * Blocks that are only visible in Formula Mode
 * These blocks provide conditional logic and advanced formatting
 */
export const FORMULA_ONLY_BLOCKS = ['if', 'else', 'line', 'based', 'and'];

/**
 * Blocks that have fixed, non-editable content
 * These blocks always generate the same output regardless of user input
 */
export const READONLY_BLOCKS = ['or', 'check', 'if', 'else', 'line', 'and'];

/**
 * HTML template for the Block Editor dialog
 * Contains the complete structure including palette, workspace, and output areas
 */
export const EDITOR_HTML_TEMPLATE = `
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
                        <div class="block-item" data-block-id="${id}" draggable="true" ${FORMULA_ONLY_BLOCKS.includes(id) ? 'style="display: none;"' : ''}>
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