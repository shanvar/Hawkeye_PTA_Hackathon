# AI Startup Incubator - IT Park Uzbekistan

A comprehensive web platform for incubating startups using artificial intelligence.

## 🚀 Features

- **Modular Learning System**: 5 core modules from idea validation to pitch deck creation
- **AI Consultant**: Integration with OpenAI GPT-4 and Google Gemini for personalized advice
- **Progress Tracking**: Track learning progress and module completion
- **Knowledge Testing**: Automated test generation for each module
- **Project Passport**: Structured storage of startup data
- **Corporate Design**: Styled in IT Park Uzbekistan corporate colors
- **Responsive**: Full mobile device support
- **Local Storage**: Data saved locally in browser
- **Modern Dark Theme**: Beautiful dark interface by default

## 📁 Project Structure

```
Version_2.0/
├── index.html              # Main application
├── Styles.css              # Corporate styling
├── config.json             # Module configuration
├── prompts.json            # AI prompts
├── project_data.json       # Project data template
├── api-keys.json           # Pre-configured API keys
├── js/                     # JavaScript modules
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
└── CLAUDE.md               # Claude Code guidance
```

## 🛠 Installation and Launch

### Option 1: Simple Launch (Recommended)

1. **Download files**:
   ```bash
   git clone [repository-url]
   cd Version_2.0
   ```

2. **Start local server**:

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

3. **Open browser**: `http://localhost:8000`

### Option 2: Using Live Server (VS Code)

1. Install "Live Server" extension in VS Code
2. Open project in VS Code
3. Right-click on `index.html` → "Open with Live Server"

### Option 3: Double Click (Limited Functionality)

You can open `index.html` directly in browser, but some features may not work due to CORS policy.

## ⚙️ Configuration

### 1. API Keys

For AI consultant to work, you need an API key:

**Google Gemini (Recommended):**
1. Get key at [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. In app, go to sidebar
3. Enter API key in "Your Google AI API key" field
4. Click "Save" and "Test"

**OpenAI:**
1. Get key at [platform.openai.com](https://platform.openai.com/api-keys)
2. Switch AI provider to "OpenAI GPT-4"
3. Enter API key
4. Click "Save" and "Test"

### 2. Module Configuration

Edit `config.json` to customize:
- Module names
- Topic content
- Test questions
- AI settings

### 3. Brand Customization

In `Styles.css` change CSS variables:
```css
:root {
  --brand-h: 100;        /* Hue */
  --brand-s: 55%;        /* Saturation */
  --brand-l: 46%;        /* Lightness */
}
```

## 🎯 How to Use

### Step 1: Getting Started
1. Open application
2. Describe your business idea in text field
3. Click "Submit Idea"

### Step 2: Complete Modules
1. **Idea Validation** - validate idea viability
2. **Market Analysis** - study market and competitors
3. **Business Model** - create sustainable model
4. **MVP Development** - define minimum product
5. **Pitch Deck** - prepare investor presentation

### Step 3: Study Materials
- Select interesting topic
- Study materials
- Ask AI consultant questions
- Take tests

### Step 4: Get Results
- Complete all modules
- Download project passport
- Receive final materials

## 📊 Learning Modules

### 1. Idea Validation (2-3 days)
- Validation methodology
- Problem analysis
- Target audience
- Competitive analysis

### 2. Market Analysis (3-4 days)
- Market size (TAM/SAM/SOM)
- Detailed competitor analysis
- Market trends
- Entry barriers
- SWOT analysis

### 3. Business Model (3-4 days)
- Business Model Canvas
- Monetization models
- Pricing
- Financial planning

### 4. MVP Development (5-7 days)
- Define key features
- Technical requirements
- UI/UX design
- Development plan

### 5. Pitch Deck (2-3 days)
- Presentation structure
- Problem and solution
- Financial projections
- Investment request

## 🔧 Technical Details

### Technologies
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Integration**: OpenAI GPT-4 / Google Gemini API
- **Storage**: LocalStorage for progress saving
- **Styling**: Custom CSS with IT Park corporate colors

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### API Integration
```javascript
// Example Gemini API call
const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contents: [{
      parts: [{ text: userMessage }]
    }]
  })
});
```

## 📱 Mobile Adaptation

Application fully adapted for mobile devices:
- Responsive sidebar
- Optimized input forms
- Touch-friendly interface
- State preservation on screen rotation

## 🔒 Security and Privacy

- API keys stored only in browser localStorage
- Project data not transmitted to external servers
- All AI requests go directly to providers
- Full data clearing capability

## 🛠 Development and Customization

### Adding a New Module

1. Update `config.json`:
```json
{
  "id": "new_module",
  "title": "New Module",
  "description": "Module description",
  "topics": [...],
  "testQuestions": [...]
}
```

2. Add handling in JavaScript:
```javascript
const newModuleHandler = {
  render: () => { /* display logic */ },
  validate: () => { /* validation logic */ }
};
```

### Changing AI Behavior

Edit `systemPrompt` for each module in configuration:
```json
"systemPrompt": "You are an expert in... Help the user..."
```

### Adding New Styles

Use CSS variables for consistency:
```css
.new-component {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}
```

## 📈 Development Plans

- [ ] Gemini API integration ✓
- [ ] PDF export
- [ ] Mentorship system
- [ ] Collaborative mode
- [ ] Telegram Bot integration
- [ ] Template marketplace
- [ ] Analytics dashboard
- [ ] Multi-language support

## 🤝 Support

If you encounter problems:

1. Check browser console (F12)
2. Verify API key correctness
3. Check internet connection
4. Clear localStorage if needed:
```javascript
localStorage.clear();
```

## 📄 License

Developed by Hawkeye team

## 👥 Development Team

- **Backend**: AI consultant based on GPT-4 / Gemini
- **Frontend**: Responsive web interface
- **Design**: IT Park corporate style
- **Content**: Expert startup materials

---

**Version**: 2.0
**Last Updated**: 2024
**Status**: Production Ready
