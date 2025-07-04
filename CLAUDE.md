# CLAUDE.md

## 【MUST GLOBAL】Gemini活用（プロジェクトのCLAUDE.mdより優先）

### 三位一体の開発原則
ユーザーの**意思決定**、Claudeの**分析と実行**、Geminiの**検証と助言**を組み合わせ、開発の質と速度を最大化する：
- **ユーザー**：プロジェクトの目的・要件・最終ゴールを定義し、最終的な意思決定を行う**意思決定者**
  - 反面、具体的なコーディングや詳細な計画を立てる力、タスク管理能力ははありません。
- **Claude**：高度な計画力・高品質な実装・リファクタリング・ファイル操作・タスク管理を担う**実行者**
  - 指示に対して忠実に、順序立てて実行する能力はありますが、意志がなく、思い込みは勘違いも多く、思考力は少し劣ります。
- **Gemini**：深いコード理解・Web検索 (Google検索) による最新情報へのアクセス・多角的な視点からの助言・技術的検証を行う**助言者**
  - プロジェクトのコードと、インターネット上の膨大な情報を整理し、的確な助言を与えてくれますが、実行力はありません。

### 実践ガイド
- **ユーザーの要求を受けたら即座に`gemini -p <質問内容>`で壁打ち**を必ず実施
- Geminiの意見を鵜呑みにせず、1意見として判断。聞き方を変えて多角的な意見を抽出
- Claude Code内蔵のWebSearchツールは使用しない
- Geminiがエラーの場合は、聞き方を工夫してリトライ：
  - ファイル名や実行コマンドを渡す（Geminiがコマンドを実行可能）
  - 複数回に分割して聞く

### 主要な活用場面
1. **実現不可能な依頼**: Claude Codeでは実現できない要求への対処 (例: `今日の天気は？`)
2. **前提確認**: ユーザー、Claude自身に思い込みや勘違い、過信がないかどうか逐一確認 (例: `この前提は正しいか？`）
3. **技術調査**: 最新情報・エラー解決・ドキュメント検索・調査方法の確認（例: `Rails 7.2の新機能を調べて`）
4. **設計検証**: アーキテクチャ・実装方針の妥当性確認（例: `この設計パターンは適切か？`）
5. **コードレビュー**: 品質・保守性・パフォーマンスの評価（例: `このコードの改善点は？`）
6. **計画立案**: タスクの実行計画レビュー・改善提案（例: `この実装計画の問題点は？`）
7. **技術選定**: ライブラリ・手法の比較検討 （例: `このライブラリは他と比べてどうか？`）

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
npm run test:e2e -- --ui  # Run E2E tests in interactive UI mode
npm run test -- --coverage  # Run tests with coverage report
```

### Code Quality
```bash
cd frontend
npm run lint         # Run ESLint
npm run build        # Build for production (includes type checking)
npx tsc --noEmit     # Quick type check without building
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
- **Path Aliasing**: `@/` maps to `./src/` for cleaner imports
- **Validation**: AJV for JSON Schema validation of command properties

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

### i18n System
The project features a dual-layer internationalization system:
- **Fixed translations**: UI elements defined in `i18n/config.ts`
- **Dynamic translations**: User-defined command labels loaded from project's `i18n/` folder
- **Translation keys**: Follow pattern `command.<commandId>.property.<propertyKey>.name`
- **Custom hook**: `useCommandTranslation()` for command-specific translations
- **Current default**: Japanese (`lng: 'ja'` in config.ts)

## Development Notes

- The project supports both web development (using sample data) and Tauri desktop app modes
- All file operations must use Tauri APIs in production builds
- Command definitions are hot-reloadable during development
- The UI is fully keyboard accessible with shortcut support
- Multi-select operations (copy/cut/paste/delete) work across command groups
- Drag and drop reordering maintains proper command relationships
- Test files are colocated with source files (`*.test.ts` alongside `*.ts`)
- E2E tests include visual regression testing with screenshots
- Vite base URL changes for GitHub Actions deployment

## Documentation

Comprehensive documentation is available in `memory-bank/doc/`:
- Overview and architecture details
- Data models and component structure
- Development guide and API reference
- Testing strategy and troubleshooting

Additional specifications in `specification/`:
- **I18N_SPECIFICATION.md**: Complete i18n system design
- **TMP_SUBROUTINE_SPECIFICATION.md**: Planned subroutine feature (future)
- **TMP_VARIABLE_SPECIFICATION.md**: Planned variable system (future)

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


## Development Best Practices

### Implementation Completion Checklist
- **必ず実行すべきビルドとテストのチェック**:
  - 実装が終わったあとは、frontendディレクトリで必ず`npm run build`と`npm run test`を実行する
  - これにより、ビルドエラーがないことと、テストがすべてパスすることを確認する