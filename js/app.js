// Application State
let appState = {
    currentModule: 0,
    modules: [],
    projectData: {},
    apiKey: '',
    geminiApiKey: '',
    geminiModel: 'gemini-2.0-flash-exp',
    aiProvider: 'gemini',
    testAnswers: [],
    currentQuestion: 0,
    userIdeaText: ''
};

// Initialize Application
async function initApp() {
    console.log('Initializing app...');
    
    // Initialize modules from config if not already loaded
    if (!appState.modules || appState.modules.length === 0) {
        console.log('Initializing modules from config...');
        appState.modules = JSON.parse(JSON.stringify(moduleConfig)); // Deep copy
        
        // Debug: log all module IDs
        console.log('=== MODULE IDS DEBUG ===');
        appState.modules.forEach((module, index) => {
            console.log(`Module ${index}: id="${module.id}", title="${module.title}"`);
        });
        console.log('========================');
    }
    
    // Загружаем промпты
    if (window.promptManager) {
        await window.promptManager.loadPrompts();
        
        // Обновляем системные промпты модулей из загруженных промптов
        if (window.promptManager.isLoaded) {
            appState.modules.forEach(module => {
                const systemPrompt = window.promptManager.getModuleSystemPrompt(module.id);
                if (systemPrompt) {
                    module.systemPrompt = systemPrompt;
                }
            });
        }
    }
    
    loadApiKeys();
    loadProgress();
    
    // Загружаем историю состояний
    if (window.stateManager) {
        window.stateManager.loadHistory();
    }
    
    // Initialize validation state
    initValidationState();
    
    // Initialize admin panel
    updateAdminStatus();
    
    renderModuleList();
    renderModuleContent();
    updateModuleActionButton();
    updateOverallProgress();
    
    console.log('App initialized successfully');
}

// Load API keys
function loadApiKeys() {
    const savedOpenAiKey = localStorage.getItem('aiIncubatorApiKey');
    const savedGeminiKey = localStorage.getItem('aiIncubatorGeminiApiKey');
    const savedProvider = localStorage.getItem('aiIncubatorProvider') || 'gemini';
    const savedGeminiModel = localStorage.getItem('aiIncubatorGeminiModel') || 'gemini-2.0-flash-exp';
    
    if (savedOpenAiKey) {
        appState.apiKey = savedOpenAiKey;
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            apiKeyInput.value = savedOpenAiKey;
        }
    }
    
    if (savedGeminiKey) {
        appState.geminiApiKey = savedGeminiKey;
        const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
        if (geminiApiKeyInput) {
            geminiApiKeyInput.value = savedGeminiKey;
        }
    }
    
    appState.aiProvider = savedProvider;
    appState.geminiModel = savedGeminiModel;
    
    const aiProviderSelect = document.getElementById('aiProviderSelect');
    const geminiModelSelect = document.getElementById('geminiModelSelect');
    
    if (aiProviderSelect) {
        aiProviderSelect.value = savedProvider;
    }
    
    if (geminiModelSelect) {
        geminiModelSelect.value = savedGeminiModel;
    }
    
    // Initialize API Key Manager if available
    if (window.apiKeyManager) {
        window.apiKeyManager.init().then(() => {
            console.log('API Key Manager initialized in loadInitialState');
        }).catch(error => {
            console.error('Error initializing API Key Manager in loadInitialState:', error);
        });
    }
}

// Save progress
function saveProgress() {
    localStorage.setItem('aiIncubatorProgress', JSON.stringify({
        currentModule: appState.currentModule,
        modules: appState.modules,
        projectData: appState.projectData
    }));
    
    // Создаем снапшот состояния для истории
    if (window.stateManager) {
        window.stateManager.createSnapshot();
    }
}

// Load progress from localStorage
function loadProgress() {
    try {
        // Load API keys
        const savedApiKey = localStorage.getItem('aiIncubatorApiKey');
        const savedGeminiApiKey = localStorage.getItem('aiIncubatorGeminiApiKey');
        const savedProvider = localStorage.getItem('aiIncubatorProvider');
        const savedGeminiModel = localStorage.getItem('aiIncubatorGeminiModel');
        
        if (savedApiKey) {
            appState.apiKey = savedApiKey;
        }
        
        if (savedGeminiApiKey) {
            appState.geminiApiKey = savedGeminiApiKey;
        }
        
        if (savedProvider) {
            appState.aiProvider = savedProvider;
        }
        
        if (savedGeminiModel) {
            appState.geminiModel = savedGeminiModel;
        }
        
        // Load saved progress
        const savedProgress = localStorage.getItem('aiIncubatorProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            
            // Merge saved progress with current module config
            appState.modules = appState.modules.map((module, index) => {
                const savedModule = progress.modules[index];
                if (savedModule) {
                    return {
                        ...module,
                        status: savedModule.status || 'pending',
                        progress: savedModule.progress || 0,
                        topics: module.topics ? module.topics.map((topic, topicIndex) => {
                            const savedTopic = savedModule.topics?.[topicIndex];
                            return {
                                ...topic,
                                status: savedTopic?.status || (topicIndex === 0 ? 'active' : 'locked'),
                                completedQuestions: savedTopic?.completedQuestions || 0
                            };
                        }) : []
                    };
                }
                return module;
            });
            
            appState.currentModule = progress.currentModule || 0;
            
            // Load project data
            if (progress.projectData) {
                appState.projectData = { ...appState.projectData, ...progress.projectData };
            }
            
            // Load user idea
            if (progress.userIdeaText) {
                appState.userIdeaText = progress.userIdeaText;
                const ideaInput = document.getElementById('ideaInput');
                if (ideaInput) {
                    ideaInput.value = progress.userIdeaText;
                }
            }
        }
        
        // Always show welcome screen initially
        document.getElementById('welcomeScreen').classList.remove('hidden');
        document.getElementById('moduleContent').classList.add('hidden');
        
        // Initialize passport toggle if we're in module view
        if (document.getElementById('moduleContent') && !document.getElementById('moduleContent').classList.contains('hidden')) {
            initializePassportToggle();
        }
        
            } catch (error) {
            console.error('Error loading progress:', error);
        }
}



// Update overall progress
function updateOverallProgress() {
    const completedModules = appState.modules.filter(m => m.status === 'completed').length;
    const progress = (completedModules / appState.modules.length) * 100;
    const overallProgress = document.getElementById('overallProgress');
    if (overallProgress) {
        overallProgress.style.width = `${progress}%`;
    }
}

// Clear cache and reset progress
function clearCacheAndReset() {
    console.log('Clearing cache and resetting progress...');
    
    // Clear localStorage
    localStorage.removeItem('aiIncubatorProgress');
    localStorage.removeItem('aiIncubatorApiKey');
    localStorage.removeItem('aiIncubatorGeminiApiKey');
    localStorage.removeItem('aiIncubatorProvider');
    localStorage.removeItem('aiIncubatorGeminiModel');
    localStorage.removeItem('aiIncubatorCurrentState');
    localStorage.removeItem('aiIncubatorHistory');
    
    // Очищаем историю состояний
    if (window.stateManager) {
        window.stateManager.clearHistory();
    }
    
    // Reset app state
    appState = {
        currentModule: 0,
        modules: [],
        projectData: {},
        apiKey: '',
        geminiApiKey: '',
        geminiModel: 'gemini-2.0-flash-exp',
        aiProvider: 'gemini',
        testAnswers: [],
        currentQuestion: 0,
        userIdeaText: ''
    };
    
    // Reinitialize
    initApp();
    
    console.log('Cache cleared and progress reset');
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Check if moduleConfig is available
    if (typeof moduleConfig === 'undefined') {
        console.error('moduleConfig is not defined!');
        return;
    }
    
    console.log('moduleConfig found:', moduleConfig);
    
    initApp();
    
    // Handle Enter key in chat
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Handle Enter key in dialog
    const aiDialogInput = document.getElementById('aiDialogInput');
    if (aiDialogInput) {
        aiDialogInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendDialogResponse();
            }
        });
    }
    
    // Handle Enter key in idea input
    const ideaInput = document.getElementById('ideaInput');
    if (ideaInput) {
        ideaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitIdea();
            }
        });
    }
    
    console.log('App initialized successfully!');
    
    // Update module action button after everything is loaded
    setTimeout(() => {
        if (typeof updateModuleActionButton === 'function') {
            updateModuleActionButton();
        }
    }, 100);
});

