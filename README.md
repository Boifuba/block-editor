# Block Editor - Foundry VTT

An advanced module for Foundry VTT that allows creating and organizing code blocks visually through an intuitive and modern drag-and-drop interface.

## Overview

The Block Editor is a visual tool that simplifies the creation of complex commands in Foundry VTT. Through a drag-and-drop interface, users can build commands intuitively without needing to know specific syntax.

### Main Features

- **Intuitive Visual Interface**: Drag and drop blocks to create code
- **Specialized Blocks**: Specific blocks for different types of data and operations
- **Automatic Code Generation**: Converts visual organization into valid JavaScript code
- **Real-time Execution**: Execute generated code directly in Foundry
- **Easy Copying**: Copy generated code for use in macros or other scripts
- **Modern Interface**: Clean, responsive and accessible design
- **Two Operation Modes**: Normal and Formula for different needs
- **Keyboard Shortcuts**: Quick access via Ctrl+B
- **Multilingual Support**: Portuguese and English

## Code Architecture

The module has been completely refactored with a modular and well-organized architecture:

### File Structure

```
scripts/
├── main.js                 # Foundry VTT integration and entry point
├── BlockEditor.js          # Main orchestrator class
├── constants.js            # Block definitions and HTML templates
├── ui/
│   └── UIManager.js        # Interface management and interactions
└── core/
    └── CodeGenerator.js    # Code generation logic
```

### Component Responsibilities

#### **main.js** - Foundry VTT Integration
- Manages Foundry VTT hooks
- Registers module settings
- Processes chat commands (/blocks, /editor)
- Configures keyboard shortcuts
- Creates and manages dialogs
- Exposes module API

#### **BlockEditor.js** - Main Orchestrator
- Coordinates communication between components
- Initializes UIManager and CodeGenerator
- Provides clean interface for external access
- Manages editor lifecycle

#### **UIManager.js** - Interface Management
- Controls all user interactions
- Manages drag & drop between palette and workspace
- Handles button and checkbox events
- Controls block reordering in workspace
- Manages visual states and feedback

#### **CodeGenerator.js** - Code Generation
- Processes workspace blocks into code
- Applies specific formatting per block type
- Manages differences between Normal and Formula modes
- Assembles final code with appropriate syntax

#### **constants.js** - Definitions and Configurations
- Defines all available blocks
- Contains HTML templates
- Specifies Formula mode exclusive blocks
- Lists blocks with fixed content (read-only)

## Available Blocks

### Actor Data
- **Attributes**: Accesses `actor.system.attributes`
- **Spells**: Accesses `actor.system.spells` (prefix `S:`)
- **Skills**: Accesses `actor.system.skills` (prefix `Sk:`)
- **Costs**: Accesses `actor.system.currency` (prefix `*Costs`)

### Properties and Text
- **Label**: Gets `.label` from a field (always in quotes)
- **Text**: Literal text (always in quotes)

### Operators
- **Mod**: Numeric modifier (no quotes)
- **Or**: Logical OR operator (always generates `|`)

### Combat System (SK Standard)
- **Ranged**: Ranged attacks (prefix `R:`)
- **Melee**: Melee attacks (prefix `M:`)
- **Weapon Damage**: Weapon damage (prefix `D:` with quotes)
- **Parry**: Parry defense (prefix `P:`)
- **Damage**: Damage values (no prefix)

### Conditionals (Formula Mode Only)
- **Check**: Starts verification (always generates `?`)
- **If**: Conditional block (always generates `/if`)
- **Else**: Alternative block (always generates `/else`)
- **Line**: Line separator (always generates `/`)
- **Based**: Based on value (prefix `Based:`)

## Operation Modes

### Normal Mode
- Generates code wrapped in brackets: `[content]`
- Ideal for simple and direct commands
- Blind Roll available (adds prefix `!`)
- Example: `[M:Spear "Spear Attack"]`

### Formula Mode
- Each block is wrapped individually: `[block1] [block2]`
- Enables conditional blocks (If, Else, Line, Based)
- Automatically disables Blind Roll
- Ideal for complex commands
- Example: `/if [M:Spear] [D:"spear"]`

### Special Bracketing
- When both Label and If blocks are present, the entire expression is wrapped in brackets
- Example: `["Acrobatic Dodge!" /if [S:Acrobatics] [Dodge +2] /else [Dodge -2]]`

## How to Use

### 1. **Open the Editor**
- **Chat Command**: `/blocks` or `/editor`
- **Keyboard Shortcut**: `Ctrl + B`
- **Auto-open**: Configure in module settings

### 2. **Build Commands**
- Drag blocks from palette to workspace
- Organize blocks in desired order
- Edit block content by clicking on text fields
- Code is generated automatically as you edit

### 3. **Use Generated Code**
- **Copy**: Use "Copy" button to copy to clipboard
- **Execute**: Use "Execute" button to send directly to chat
- **Use in Macros**: Paste copied code into macros or scripts

## Practical Examples

### Simple Attack (Normal Mode)
```
Blocks: Melee → Text("Spear")
Result: [M:Spear "Spear"]
```

### Conditional Command (Formula Mode)
```
Blocks: If → Melee → Text("Spear") → Weapon Damage → Text("spear")
Result: /if [M:Spear] [D:"spear"]
```

### Attack with Damage (Formula Mode)
```
Blocks: Melee → Text("Sword") → Line → Damage → Text("1d8+2")
Result: [M:Sword] / [1d8+2]
```

### Test with Blind Roll (Normal Mode)
```
Blocks: Skills → Text("Athletics") (with Blind Roll enabled)
Result: [!Sk:Athletics]
```

### Special Bracketing Example
```
Blocks: Label → Text("Acrobatic Dodge!") → If → Spells → Text("Acrobatics") → Text("Dodge +2") → Else → Text("Dodge -2")
Result: ["Acrobatic Dodge!" /if [S:Acrobatics] [Dodge +2] /else [Dodge -2]]
```

## Installation

1. **Download Module**: Download module files
2. **Extract**: Extract to `modules` folder in your Foundry VTT
3. **Activate**: Activate module in world settings
4. **Use**: Use `/blocks` or `Ctrl + B` to open editor

## Settings

### Available Settings
- **Auto-open**: Opens editor when world loads
- **Blind Roll**: Adds prefix `!` (disabled in Formula Mode)
- **Formula Mode**: Enables conditional blocks and special formatting

### Commands and Shortcuts
- `/blocks` or `/editor`: Opens block editor
- `Ctrl + B`: Keyboard shortcut to open editor

## Automatic Formatting

### Automatic Prefixes
- **Skills**: `Sk:value` (no space)
- **Spells**: `S: value` (with space)
- **Costs**: `*Costs value`
- **Ranged**: `R:value` (no space)
- **Melee**: `M:value` (no space)
- **Weapon Damage**: `D:"value"` (with quotes, no space)
- **Parry**: `P:value` (no space)
- **Based**: `Based:value` (no space)

### Automatic Quotes
- **Label/Text**: Always in double quotes
- **Weapon Damage**: Always in double quotes

### Fixed Values (Non-editable)
- **Or**: Always generates `|`
- **Check**: Always generates `?`
- **If**: Always generates `/if`
- **Else**: Always generates `/else`
- **Line**: Always generates `/`

## Development

### Class Architecture

```javascript
// Main orchestrator class
class BlockEditor {
    constructor(html)              // Initializes components
    _initializeComponents()        // Configures communication between components
    getUIManager()                 // Access to UI manager
    getCodeGenerator()             // Access to code generator
    generateCode()                 // Manual code generation
    getWorkspaceState()            // Current workspace state
}

// Interface manager
class UIManager {
    constructor(html, codeGenerator)  // Initializes UI
    _setupEventListeners()           // Configures events
    _addBlockToWorkspace()           // Adds block to workspace
    _setupDragAndDropSystem()        // Drag & drop system
    _clearWorkspace()                // Clears workspace
    // ... other UI methods
}

// Code generator
class CodeGenerator {
    constructor(uiManager)           // Initializes generator
    generateCode()                   // Generates code from workspace
    _formatBlockContent()            // Formats block content
    _assembleFinalCode()             // Assembles final code
    // ... other generation methods
}
```

### Important Constants

```javascript
// Available blocks with configurations
AVAILABLE_BLOCKS = { ... }

// Blocks visible only in Formula Mode
FORMULA_ONLY_BLOCKS = ['if', 'else', 'line', 'based']

// Blocks with fixed content (non-editable)
READONLY_BLOCKS = ['or', 'check', 'if', 'else', 'line']
```

### Logs and Debugging

The module includes detailed logging to facilitate development and debugging:

```javascript
// Examples of informative logs
console.log('Block Editor | UI Manager: Adding block to workspace');
console.log('Block Editor | Code Generator: Processing 3 workspace blocks');
console.log('Block Editor | Main Controller: Component communication established');
```

## Compatibility

- **Foundry VTT**: v10+ (tested up to v13)
- **Systems**: Compatible with systems using SK standard
- **Browsers**: Chrome, Firefox, Safari, Edge (modern versions)

## Troubleshooting

### Common Issues

1. **Editor doesn't open**: Check if module is activated
2. **Blocks don't appear**: Check console for errors
3. **Code doesn't generate**: Make sure there are blocks in workspace
4. **Drag & drop doesn't work**: Check if browser supports HTML5 drag & drop

### Debugging

1. Open browser console (F12)
2. Look for messages starting with "Block Editor |"
3. Detailed logs show each operation performed
4. Report bugs with console information

## License

This module is distributed under MIT license. See LICENSE file for more details.

## Contribution

Contributions are welcome! Please:

1. Fork the project
2. Create a branch for your feature
3. Commit your changes
4. Open a Pull Request

## Support

For questions, issues or suggestions:

1. Check this documentation
2. Check browser console for detailed logs
3. Open an issue in the project repository
4. Include console information when reporting bugs

---

**Developed with love for the Foundry VTT community**