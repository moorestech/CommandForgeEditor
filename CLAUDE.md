# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CommandForgeEditor is a visual scripting tool designed for game developers to create and manage scenario scripts (called "skits") without writing code. It provides an intuitive drag-and-drop interface for assembling sequences of commands that control game flow, dialogue, character actions, and other game events.

**Key Features:**
- Visual command arrangement with drag-and-drop functionality
- Real-time validation of command properties
- Extensible command system defined in YAML
- Multi-platform desktop application (Windows, macOS, Linux)
- Project-based workflow with file system integration
- Undo/redo, copy/paste, and other productivity features

**Target Users:** Game developers, scenario writers, and content creators who need to create complex game scripts without programming knowledge.

## Essential Commands

### Development
```bash
cd frontend
npm install           # Install dependencies
npm run dev          # Start development server
npm run tauri:dev    # Start Tauri app in development mode
```

### Testing
```bash
cd frontend
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run Playwright E2E tests
```

### Code Quality
```bash
cd frontend
npm run lint         # Run ESLint
npm run build        # Build for production (includes type checking)
```

### Build
```bash
cd frontend
npm run tauri:build  # Build Tauri app for production
```

## Architecture Overview

This is a desktop application for creating and editing game scenario scripts ("skits") using a no-code approach. The architecture follows a React frontend + Tauri backend pattern:

### Core Structure
- **Frontend**: React + TypeScript with Vite, located in `frontend/`
- **Desktop App**: Tauri (Rust) wrapper for cross-platform deployment
- **State Management**: Zustand with Immer for immutable updates
- **UI**: Shadcn UI components with Tailwind CSS
- **Drag & Drop**: dnd-kit library for command manipulation

### Key Data Models
- **Commands**: Defined in YAML files, represent individual actions/instructions
- **Skits**: JSON files containing sequences of commands with metadata
- **Command Definitions**: Schema definitions for command types and their properties

### Application Flow
1. **Command Loading**: `commands.yaml` defines available command types and their properties
2. **Skit Management**: Users create/edit skits by arranging commands in sequences
3. **Real-time Editing**: Left panel shows command list, right panel shows selected command properties
4. **File System**: Tauri handles file I/O for saving/loading skits and commands

### State Management (skitStore.ts)
The main application state includes:
- `skits`: All loaded skit files
- `currentSkitId`: Currently active skit
- `selectedCommandIds`: Multi-select support for commands
- `commandDefinitions`: Available command types from YAML
- `validationErrors`: Real-time validation feedback
- `history`: Undo/redo functionality

### Component Hierarchy
```
App
├── MainLayout
├── Toolbar (undo/redo, save, etc.)
├── CommandList (left panel - skit commands)
├── CommandEditor (right panel - selected command properties)
└── ValidationLog (bottom - error display)
```

### File System Integration
- **Development**: Uses sample files via fetch for web preview
- **Production**: Tauri APIs for actual file system access
- **Project Structure**: `commands.yaml` + `skits/` directory containing JSON files

### Reserved Commands
The system includes built-in command types like `group_start`/`group_end` for organizing commands into collapsible sections. These are merged with user-defined commands from YAML.

### Validation System
Real-time validation using JSON Schema validation (ajv) ensures commands have required properties and correct data types before saving.

## Development Notes

- The project supports both web development (using sample data) and Tauri desktop app modes
- All file operations must use Tauri APIs in production builds
- Command definitions are hot-reloadable during development
- The UI is fully keyboard accessible with shortcut support
- Multi-select operations (copy/cut/paste/delete) work across command groups
- Drag and drop reordering maintains proper command relationships

## Documentation

Comprehensive documentation is available in `memory-bank/doc/`:
- Overview and architecture details
- Data models and component structure
- Development guide and API reference
- Testing strategy and troubleshooting

## MCP Browser Automation

This project can be tested and demonstrated using Playwright MCP (Model Control Protocol) for browser automation. The application runs on `http://localhost:5173/` in development mode.

### UI Testing with MCP

**Available MCP Playwright Operations:**
- `mcp__playwright__browser_navigate`: Navigate to the development server
- `mcp__playwright__browser_snapshot`: Capture accessibility tree for UI analysis
- `mcp__playwright__browser_click`: Interact with UI elements
- `mcp__playwright__browser_type`: Input text into form fields
- `mcp__playwright__browser_select_option`: Choose dropdown options

**Key UI Areas for Testing:**
1. **Skit List** (Left panel): Shows available skits and creation options
2. **Command List** (Center panel): Displays numbered commands with drag handles
3. **Command Editor** (Right panel): Properties panel for selected commands
4. **Toolbar**: Action buttons (add, copy, cut, paste, delete, save)
5. **Language Switcher**: i18n language selection dropdown


**Important**: Please keep the documentation updated when making significant changes to the codebase. This includes:
- Adding new features or components
- Changing data models or API interfaces
- Modifying the build process or dependencies
- Updating development workflows