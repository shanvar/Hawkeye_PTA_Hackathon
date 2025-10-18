# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Startup Incubator - A web-based platform for incubating startups using artificial intelligence. Built for IT Park Uzbekistan with corporate branding, this application guides users through 5 modules from idea validation to pitch deck creation.

**Tech Stack**: Vanilla JavaScript (ES6+), HTML5, CSS3, LocalStorage for persistence
**AI Integration**: OpenAI GPT-4 and Google Gemini API
**Language**: Russian (UI and content)

## Running the Application

### Local Development Server

The application requires a local server (CORS restrictions prevent direct file opening):

**Python 3:**
```bash
python -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js:**
```bash
npx http-server
```

Then open `http://localhost:8000` in your browser.

### VS Code Live Server

1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

## Architecture

### State Management System

The application uses a custom state management system (`js/state-manager.js`) with:

- **Auto-save**: Creates snapshots every 5 seconds
- **History tracking**: Maintains up to 50 states
- **Undo functionality**: Allows reverting to previous states
- **Export/Import**: JSON-based state persistence

Key state manager functions:
- `createSnapshot()` - Creates state snapshot
- `undo()` - Reverts to previous state
- `restoreState(state)` - Restores specific state
- `exportAppState()` - Exports state to JSON file
- `importAppState(file)` - Imports state from file

Global state object (`appState` in `js/app.js`):
```javascript
{
  currentModule: 0,           // Current module index
  modules: [],                // Module configurations
  projectData: {},            // Project passport data
  apiKey: '',                 // OpenAI API key
  geminiApiKey: '',          // Gemini API key
  geminiModel: '',           // Selected Gemini model
  aiProvider: 'gemini',      // 'gemini' or 'openai'
  testAnswers: [],           // Quiz answers
  currentQuestion: 0,        // Current quiz question
  userIdeaText: ''          // User's business idea
}
```

### Module System

The application has 5 learning modules defined in `config.json`:

1. **validation** - Idea validation (2-3 days)
2. **market_analysis** - Market analysis (3-4 days)
3. **business_model** - Business model creation (3-4 days)
4. **mvp_development** - MVP development (5-7 days)
5. **pitch_deck** - Pitch deck creation (2-3 days)

Each module contains:
- Topics with content and exercises
- Test questions for knowledge validation
- Deliverables (PDFs, presentations, etc.)
- System prompts for AI assistance

Module IDs must match keys in `prompts.json` for AI functionality.

### AI Integration Architecture

**Two modes of API key management** (`js/api-key-manager.js`):

1. **Ready Keys Mode** (`🔑 Готовые ключи`):
   - Pre-configured keys from `api-keys.json`
   - Automatic rotation based on usage
   - Load tracking and status monitoring

2. **Custom Key Mode** (`⚙️ Свой ключ`):
   - User-provided API keys stored in localStorage
   - Full control over API usage
   - Keys: `aiIncubatorApiKey`, `aiIncubatorGeminiApiKey`

**AI API calls** (`js/api.js`):
- OpenAI: `https://api.openai.com/v1/chat/completions`
- Gemini: `https://generativelanguage.googleapis.com/v1/models/{model}:generateContent`

### Prompt Management System

Centralized prompts in `prompts.json`:

- **Module prompts**: System prompts for each module's AI assistant
- **Chat prompts**: Dynamic learning flow prompts (learning plan, teaching aspects, answer evaluation)
- **Validation prompts**: Question generation for quizzes

Access via `window.promptManager` (defined in `js/prompt-manager.js`):
```javascript
const systemPrompt = window.promptManager.getModuleSystemPrompt(moduleId);
const chatPrompt = window.promptManager.getChatPrompt(promptType, variables);
```

### Key JavaScript Files

- **`js/app.js`**: Main application logic, initialization, module rendering
- **`js/state-manager.js`**: State management with history and undo
- **`js/api-key-manager.js`**: API key management (ready/custom modes)
- **`js/api.js`**: AI API integration functions
- **`js/prompt-manager.js`**: Centralized prompt management
- **`js/chat.js`**: Chat interface with AI assistant
- **`js/ui.js`**: UI utilities and notifications
- **`js/validation.js`**: Idea validation module logic
- **`js/market-analysis.js`**: Market analysis module
- **`js/business-model.js`**: Business model module
- **`js/mvp-development.js`**: MVP development module
- **`js/pitch-deck.js`**: Pitch deck module
- **`js/admin.js`**: Admin panel functionality
- **`js/dialog.js`**: Modal dialog system

### Data Storage (LocalStorage)

- `aiIncubatorCurrentState` - Current application state
- `aiIncubatorHistory` - State history (up to 50 snapshots)
- `aiIncubatorProgress` - Legacy progress tracking (kept for compatibility)
- `aiIncubatorApiKey` - OpenAI API key
- `aiIncubatorGeminiApiKey` - Google Gemini API key
- `aiIncubatorProvider` - Selected AI provider ('gemini' or 'openai')
- `aiIncubatorGeminiModel` - Selected Gemini model

### CSS Architecture

`Styles.css` uses CSS custom properties for theming:

```css
:root {
  --brand-h: 100;        /* Hue (IT Park green) */
  --brand-s: 55%;        /* Saturation */
  --brand-l: 46%;        /* Lightness */
}
```

Generated color scales: `--brand-50` through `--brand-900`
Spacing scale: `--space-1` through `--space-10`
Border radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`

## Testing

Test files for different components:

- `test-state-manager.html` - State management testing
- `test-api-keys.html` - API key management testing
- `test-admin.html` - Admin panel testing
- `test.html` - General testing

Open test files in browser with local server running.

## Configuration Files

- **`config.json`**: Module configuration, AI settings, integrations
- **`prompts.json`**: All AI prompts for easy customization
- **`api-keys.json`**: Pre-configured API keys (ready mode)
- **`api-keys-example.json`**: Example structure for api-keys.json
- **`project_data.json`**: Template for project passport structure

## Common Development Tasks

### Adding a New Module

1. Add module configuration to `config.json`:
```json
{
  "id": "new_module",
  "title": "New Module Title",
  "description": "...",
  "duration": "X days",
  "topics": [...],
  "testQuestions": [...],
  "deliverables": [...]
}
```

2. Add system prompt to `prompts.json`:
```json
"new_module": {
  "id": "new_module",
  "title": "New Module Title",
  "systemPrompt": "You are an expert in..."
}
```

3. Create module-specific JavaScript file if needed: `js/new-module.js`

4. Add module rendering logic to `js/app.js` (follow existing patterns)

### Modifying AI Behavior

Edit system prompts in `prompts.json` under:
- `prompts.modules.{module_id}.systemPrompt` - Module-specific AI personality
- `prompts.chat.*` - Dynamic learning flow prompts

### Customizing Branding

Change CSS variables in `Styles.css`:
```css
:root {
  --brand-h: [new hue];
  --brand-s: [new saturation];
  --brand-l: [new lightness];
}
```

## Important Notes

### Module ID Consistency

Module IDs must match across:
1. `config.json` modules array
2. `prompts.json` module keys
3. `project_data.json` moduleProgress keys

Mismatch causes AI assistant to fail.

### State Management Events

Auto-snapshots are created on:
- Topic completion
- Module navigation
- Progress changes
- Every 5 seconds (if state changed)

Disable auto-save: `window.stateManager.stopAutoSave()`

### API Key Security

- Custom keys stored in localStorage only (not transmitted to any server except AI providers)
- Ready keys should be configured by admin in `api-keys.json`
- Never commit real API keys to version control

### Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Requires localStorage support.

## File Structure

```
Version_2.0/
├── index.html              # Main application
├── Styles.css              # Corporate styling
├── config.json             # Module configuration
├── prompts.json            # AI prompts
├── project_data.json       # Project data template
├── api-keys.json           # Pre-configured API keys
├── js/
│   ├── app.js              # Main application logic
│   ├── state-manager.js    # State management
│   ├── api-key-manager.js  # API key management
│   ├── api.js              # AI API integration
│   ├── prompt-manager.js   # Prompt management
│   ├── chat.js             # Chat interface
│   ├── ui.js               # UI utilities
│   ├── validation.js       # Validation module
│   ├── market-analysis.js  # Market analysis module
│   ├── business-model.js   # Business model module
│   ├── mvp-development.js  # MVP development module
│   ├── pitch-deck.js       # Pitch deck module
│   ├── admin.js            # Admin panel
│   └── dialog.js           # Modal dialogs
└── test-*.html             # Test files
```

## Documentation Files

- `README.md` - Main project documentation (Russian)
- `QUICK_START.md` - Quick start guide for state management
- `STATE_MANAGEMENT.md` - Detailed state management documentation
- `API_KEYS_GUIDE.md` - API key setup and usage guide
- `ADMIN_SETUP.md` - Admin panel setup guide
- `PROMPTS_GUIDE.md` - Prompt customization guide
- `SETUP.md` - General setup instructions
- `CHANGELOG.md` - Version history
- `CHANGELOG_API_KEYS.md` - API key system changes
