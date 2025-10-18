// Admin Panel Functions

// Toggle admin panel visibility
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    
    if (adminPanel.classList.contains('hidden')) {
        adminPanel.classList.remove('hidden');
        adminToggleBtn.textContent = '🔧 Hide Admin Panel';
        populateAdminModuleSelect();
        updateAdminStatus();
    } else {
        adminPanel.classList.add('hidden');
        adminToggleBtn.textContent = '🔧 Admin Panel';
    }
}

// Populate module select dropdown
function populateAdminModuleSelect() {
    const select = document.getElementById('adminModuleSelect');
    if (!select) {
        console.log('adminModuleSelect not found');
        return;
    }
    
    console.log('Populating admin module select with', appState.modules.length, 'modules');
    
    select.innerHTML = '<option value="">Select module...</option>';
    
    appState.modules.forEach((module, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${index + 1}. ${module.title} (${module.status})`;
        select.appendChild(option);
        console.log(`Added module option: ${index} - ${module.title}`);
    });
    
    // Set current module as selected
    if (appState.currentModule !== undefined && appState.currentModule >= 0) {
        select.value = appState.currentModule;
        console.log(`Set current module in select: ${appState.currentModule}`);
    }
    
    // Also populate topic select when module changes
    populateAdminTopicSelect();
}

// Populate topic select dropdown
function populateAdminTopicSelect() {
    const moduleSelect = document.getElementById('adminModuleSelect');
    const topicSelect = document.getElementById('adminTopicSelect');
    
    if (!topicSelect || !moduleSelect) return;
    
    const moduleIndex = parseInt(moduleSelect.value);
    
    if (isNaN(moduleIndex) || moduleIndex < 0 || moduleIndex >= appState.modules.length) {
        topicSelect.innerHTML = '<option value="">First select a module...</option>';
        return;
    }
    
    const module = appState.modules[moduleIndex];
    topicSelect.innerHTML = '<option value="">Select topic...</option>';
    
    if (module.topics && module.topics.length > 0) {
        module.topics.forEach((topic, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${index + 1}. ${topic.title} (${topic.status})`;
            topicSelect.appendChild(option);
        });
    }
}

// Handle module select change
function handleModuleSelectChange() {
    const select = document.getElementById('adminModuleSelect');
    const moduleIndex = parseInt(select.value);
    
    if (isNaN(moduleIndex) || moduleIndex < 0 || moduleIndex >= appState.modules.length) {
        // Just update topic select without switching
        populateAdminTopicSelect();
        return;
    }
    
    // Switch to module
    switchToModuleByAdmin(moduleIndex);
}

// Switch to module by admin
function switchToModuleByAdmin(moduleIndex) {
    // Use provided moduleIndex or get from select
    if (moduleIndex === undefined) {
        const select = document.getElementById('adminModuleSelect');
        moduleIndex = parseInt(select.value);
    }
    
    if (isNaN(moduleIndex) || moduleIndex < 0 || moduleIndex >= appState.modules.length) {
        showAdminStatus('Select module from list', 'warning');
        return;
    }
    
    console.log('switchToModuleByAdmin called with moduleIndex:', moduleIndex);
    console.log('Current module before switch:', appState.currentModule);
    console.log('Target module:', appState.modules[moduleIndex]);
    
    // Unlock the module if it's locked
    appState.modules[moduleIndex].status = 'active';
    
    // Activate first topic of the module
    const module = appState.modules[moduleIndex];
    if (module.topics && module.topics.length > 0) {
        module.topics.forEach((topic, index) => {
            if (index === 0) {
                topic.status = 'active';
                topic.completedQuestions = 0;
            } else {
                topic.status = 'locked';
                topic.completedQuestions = 0;
            }
        });
    }
    
    // Show welcome screen if we're on welcome screen
    const welcomeScreen = document.getElementById('welcomeScreen');
    const moduleContent = document.getElementById('moduleContent');
    
    if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
        welcomeScreen.classList.add('hidden');
        moduleContent.classList.remove('hidden');
    }
    
    // Switch to module using the main switchToModule function
    switchToModule(moduleIndex);
    
    // Update topic select
    populateAdminTopicSelect();
    
    // Handle chat visibility and messages based on module
    const chatSection = document.getElementById('chatSection');
    const chatMessages = document.getElementById('chatMessages');
    
    if (module.id === 'validation') {
        // Hide chat section for validation module initially
        if (chatSection) chatSection.classList.add('hidden');
        // Don't add any messages to hidden chat
    } else {
        // Show chat section for other modules
        if (chatSection) chatSection.classList.remove('hidden');
        if (chatMessages) {
            chatMessages.innerHTML = '';
            addMessage(`🎉 **Welcome to module: ${module.title}!**\n\n${module.description}\n\nAsk any questions about this topic, and the AI Mentor Agent will help you understand.`, 'assistant');
        }
    }
    
    console.log('Current module after switch:', appState.currentModule);
    
    saveProgress();
    showAdminStatus(`Switched to module "${appState.modules[moduleIndex].title}" completed`, 'success');
}

// Unlock all modules
function unlockAllModules() {
    appState.modules.forEach((module, index) => {
        if (index === 0) {
            module.status = 'pending';
        } else {
            module.status = 'active';
        }
    });
    
    renderModuleList();
    saveProgress();
    showAdminStatus('All modules unlocked', 'success');
}

// Reset progress
function resetProgress() {
    // Reset modules
    appState.modules.forEach((module, index) => {
        module.status = index === 0 ? 'pending' : 'locked';
        module.progress = 0;
        
        // Reset topics if they exist
        if (module.topics) {
            module.topics.forEach((topic, topicIndex) => {
                topic.status = topicIndex === 0 ? 'active' : 'locked';
                topic.completedQuestions = 0;
            });
        }
    });
    
    // Reset current module
    appState.currentModule = 0;
    
    // Clear project data
    appState.projectData = {};
    
    // Clear localStorage
    localStorage.removeItem('aiIncubatorProgress');
    
    // Reset UI
    renderModuleList();
    updateOverallProgress();
    
    // Show welcome screen
    const welcomeScreen = document.getElementById('welcomeScreen');
    const moduleContent = document.getElementById('moduleContent');
    
    if (welcomeScreen) welcomeScreen.classList.remove('hidden');
    if (moduleContent) moduleContent.classList.add('hidden');
    
    // Clear idea input
    const ideaInput = document.getElementById('ideaInput');
    if (ideaInput) ideaInput.value = '';
    
    showAdminStatus('Progress reset', 'success');
}

// Complete all modules
function completeAllModules() {
    appState.modules.forEach(module => {
        module.status = 'completed';
        module.progress = 100;
        
        // Complete all topics if they exist
        if (module.topics) {
            module.topics.forEach(topic => {
                topic.status = 'completed';
                topic.completedQuestions = 4; // Max questions
            });
        }
    });
    
    renderModuleList();
    updateOverallProgress();
    saveProgress();
    showAdminStatus('All modules completed', 'success');
}

// Unlock all topics in all modules
function unlockAllTopics() {
    appState.modules.forEach(module => {
        if (module.topics && module.topics.length > 0) {
            module.topics.forEach(topic => {
                topic.status = 'active';
            });
        }
    });
    
    renderModuleList();
    renderTopics(appState.modules[appState.currentModule].topics);
    saveProgress();
    showAdminStatus('All topics unlocked', 'success');
}

// Reset all topics in all modules
function resetAllTopics() {
    appState.modules.forEach(module => {
        if (module.topics && module.topics.length > 0) {
            module.topics.forEach((topic, index) => {
                topic.status = index === 0 ? 'active' : 'locked';
                topic.completedQuestions = 0;
            });
        }
    });
    
    renderModuleList();
    renderTopics(appState.modules[appState.currentModule].topics);
    saveProgress();
    showAdminStatus('All topics reset', 'success');
}

// Complete all topics in all modules
function completeAllTopics() {
    appState.modules.forEach(module => {
        if (module.topics && module.topics.length > 0) {
            module.topics.forEach(topic => {
                topic.status = 'completed';
                topic.completedQuestions = 4; // Max questions
            });
        }
    });
    
    renderModuleList();
    renderTopics(appState.modules[appState.currentModule].topics);
    saveProgress();
    showAdminStatus('All topics completed', 'success');
}

// Switch to specific topic by admin
function switchToTopicByAdmin() {
    const moduleSelect = document.getElementById('adminModuleSelect');
    const topicSelect = document.getElementById('adminTopicSelect');
    
    const moduleIndex = parseInt(moduleSelect.value);
    const topicIndex = parseInt(topicSelect.value);
    
    if (isNaN(moduleIndex) || isNaN(topicIndex)) {
        showAdminStatus('Select module and topic', 'warning');
        return;
    }
    
    if (moduleIndex < 0 || moduleIndex >= appState.modules.length) {
        showAdminStatus('Invalid module', 'error');
        return;
    }
    
    const module = appState.modules[moduleIndex];
    if (!module.topics || topicIndex < 0 || topicIndex >= module.topics.length) {
        showAdminStatus('Invalid topic', 'error');
        return;
    }
    
    // Switch to module first
    switchToModule(moduleIndex);
    
    // Unlock the specific topic
    module.topics[topicIndex].status = 'active';
    
    // Start the topic
    const topic = module.topics[topicIndex];
    selectTopic(topic);
    
    // Update UI
    renderTopics(module.topics);
    saveProgress();
    
    showAdminStatus(`Switched to topic "${topic.title}" completed`, 'success');
}

// Load test idea
function loadTestIdea() {
    const testIdea = `AI-powered startup incubator platform that guides founders from idea to ready MVP. The platform includes 6 interactive modules: idea validation, product formation, draft MVP creation, financial model development, market analysis, and pitch deck preparation. AI personalizes learning for the user's project, automatically creates materials (PRD, code, financial model, presentation), tracks progress, and provides recommendations.

Key Features:
- Personalized learning plan
- Project artifact generation (PRD, MVP code, financial model, presentation)
- Interactive tests and feedback
- Integration with Sortabase and external APIs
- Material export in PDF, XLSX, PPTX, ZIP
- Progress system and certificate

Target Audience:
- Aspiring startup founders
- Students in entrepreneurship programs
- Corporate innovators
- Small teams preparing for accelerators or investors

Problem:
Founders spend months and significant resources preparing a startup without a structured plan, clear methodology, and access to experts.

Solution:
Centralized AI platform that combines learning, key material generation, progress tracking, and investor readiness in one place, reducing time from idea to ready product several times over.`;
    
    // Set project data
    appState.projectData = {
        idea: testIdea,
        createdAt: new Date().toISOString()
    };
    
    // Show in idea input if on welcome screen
    const ideaInput = document.getElementById('ideaInput');
    if (ideaInput) {
        ideaInput.value = testIdea;
    }
    
    // Show in chat if in module
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages && chatMessages.children.length === 0) {
        addMessage(`📝 **Test idea loaded:**\n\n${testIdea}`, 'assistant');
    }
    
    saveProgress();
    showAdminStatus('Test idea loaded', 'success');
}

// Clear test data
function clearTestData() {
    // Clear project data
    appState.projectData = {};
    
    // Clear idea input
    const ideaInput = document.getElementById('ideaInput');
    if (ideaInput) {
        ideaInput.value = '';
    }
    
    // Clear chat if in module
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        const currentModule = appState.modules[appState.currentModule];
        addMessage(`🧹 **Test data cleared.**\n\nWelcome to module "${currentModule.title}"! Ask any questions about this topic.`, 'assistant');
    }
    
    saveProgress();
    showAdminStatus('Test data cleared', 'success');
}

// Note: Comprehensive test data has been removed.
// The app now uses test-data.json file and English fallback data below.

// Load comprehensive test data
function loadComprehensiveTestData() {
    console.log('loadComprehensiveTestData called');
    
    // Try to load data from test-data.json file first, then use fallback
    fetch('test-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch test-data.json');
            }
            return response.json();
        })
        .then(testData => {
            console.log('testData loaded from file:', testData);
            loadTestDataToState(testData);
        })
        .catch(error => {
            console.error('Error fetching test-data.json, using fallback data:', error);
            
            // Fallback data - inline copy of test-data.json
            const fallbackData = {
                "projectData": {
                    "idea": "AI-powered startup incubator platform with learning and material generation",
                    "createdAt": "2025-08-15T10:00:00.000Z",
                    "updatedAt": "2025-08-15T10:00:00.000Z",
                    "status": "active"
                },
                "userIdeaText": "AI-powered startup incubator platform that guides founders from idea to ready MVP. The platform includes 6 interactive modules: idea validation, product formation, draft MVP creation, financial model development, market analysis, and pitch deck preparation. AI personalizes learning for the user's project, automatically creates materials (PRD, code, financial model, presentation), tracks progress, and provides recommendations.\n\nKey Features:\n- Personalized learning plan\n- Project artifact generation (PRD, MVP code, financial model, presentation)\n- Interactive tests and feedback\n- Integration with Sortabase and external APIs\n- Material export in PDF, XLSX, PPTX, ZIP\n- Progress system and certificate\n\nTarget Audience:\n- Aspiring startup founders\n- Students in entrepreneurship programs\n- Corporate innovators\n- Small teams preparing for accelerators or investors\n\nProblem: Founders spend months and significant resources preparing a startup without a structured plan and access to experts.\n\nSolution: Automated AI platform that teaches, guides, and creates key project materials step by step, reducing time from idea to ready product.",
                "projectPassport": {
                    "basicInfo": {
                        "projectName": "AI Startup Incubator",
                        "tagline": "From Idea to MVP with AI",
                        "industry": "EdTech / Startup Tools / AI",
                        "stage": "MVP Development",
                        "teamSize": "3 founders",
                        "location": "Tashkent, Uzbekistan"
                    },
                    "problem": {
                        "description": "Entrepreneurs and startup teams lack clear structure, tools, and expert support for quickly and effectively creating a product and preparing for investors."
                    },
                    "solution": {
                        "description": "Interactive AI platform that teaches, accompanies, and generates key project materials from idea validation to ready MVP."
                    },
                    "market": {
                        "size": "TAM: $15B (global EdTech and startup tools market), SAM: $3B (AI-driven startup tools), SOM: $100M (personalized AI platforms for startups)",
                        "competitors": ["Y Combinator Startup School", "Notion + ChatGPT", "Founder Institute"]
                    },
                    "businessModel": {
                        "revenueStreams": ["Premium subscription", "Corporate licenses", "Integration commission", "AI credits"],
                        "pricing": {
                            "basic": "Free",
                            "premium": "$20/month"
                        }
                    },
                    "team": {
                        "founders": [
                            {"name": "Bahodir Foziljonov", "role": "Co-founder"},
                            {"name": "Nodir Foziljonov", "role": "Co-founder"},
                            {"name": "Anvar Shakhidi", "role": "Co-founder"}
                        ],
                        "teamSize": 3
                    },
                    "financials": {
                        "funding": {
                            "stage": "Pre-seed",
                            "amount": "$500K"
                        },
                        "projections": {
                            "year1": {
                                "revenue": "$120K"
                            }
                        }
                    }
                }
            };
            
            loadTestDataToState(fallbackData);
            showAdminStatus('Full test data loaded (fallback)', 'success');
        });
}

// Helper function to load test data into state
function loadTestDataToState(testData) {
    try {
        // Load project data
        if (testData.projectData) {
            appState.projectData = testData.projectData;
        }
        
        // Load user idea
        if (testData.userIdeaText) {
            appState.userIdeaText = testData.userIdeaText;
        }
        
        // Load project passport
        if (testData.projectPassport) {
            appState.projectPassport = testData.projectPassport;
        }
        
        // Load validation answers
        if (testData.validationAnswers) {
            appState.validationAnswers = testData.validationAnswers;
        }
        
        // Load market analysis
        if (testData.marketAnalysis) {
            appState.marketAnalysis = testData.marketAnalysis;
        }
        
        // Load business model
        if (testData.businessModel) {
            appState.businessModel = testData.businessModel;
        }
        
        // Load MVP features
        if (testData.mvpFeatures) {
            appState.mvpFeatures = testData.mvpFeatures;
        }
        
        // Load pitch deck
        if (testData.pitchDeck) {
            appState.pitchDeck = testData.pitchDeck;
        }
        
        // Update UI
        const ideaInput = document.getElementById('ideaInput');
        if (ideaInput) {
            ideaInput.value = testData.userIdeaText || '';
        }
        
        // Show in chat if in module
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
            const currentModule = appState.modules[appState.currentModule];
            addMessage(`📋 **Full test data loaded!**

🎯 **Project:** ${testData.projectPassport?.basicInfo?.projectName || 'AI Startup Incubator'}
📝 **Idea:** ${testData.projectData?.idea || 'AI-платформа инкубатор'}

Теперь у вас есть полные данные для тестирования всех функций системы:
• Детальный паспорт проекта
• Ответы на вопросы валидации
• Анализ рынка
• Бизнес-модель
• MVP функции
• Pitch deck

Welcome to module "${currentModule.title}"!`, 'assistant');
        }
        
        // Update passport display with delay to ensure DOM is ready
        setTimeout(() => {
            console.log('About to call renderModulePassport');
            console.log('appState.projectPassport:', appState.projectPassport);
            if (typeof renderModulePassport === 'function') {
                console.log('renderModulePassport function exists, calling it');
                renderModulePassport();
            } else {
                console.log('renderModulePassport function not found');
            }
        }, 200);
        
        saveProgress();
        
    } catch (error) {
        console.error('Error loading test data into state:', error);
        showAdminStatus('Error loading test data: ' + error.message, 'error');
    }
}

// Load test data for specific module
function loadModuleTestData(moduleId) {
    if (!moduleId) return; // Skip if no module selected
    
    // Load data from test-data.json file
    fetch('test-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch test-data.json');
            }
            return response.json();
        })
        .then(testData => {
            try {
        const module = appState.modules[moduleId];
        
        if (!module) {
            throw new Error('Module not found');
        }
        
        // Load basic project data
        if (testData.projectData) {
            appState.projectData = testData.projectData;
        }
        
        if (testData.userIdeaText) {
            appState.userIdeaText = testData.userIdeaText;
        }
        
        // Load module-specific data
        switch (moduleId) {
            case 'validation':
                if (testData.validationAnswers) {
                    appState.validationAnswers = testData.validationAnswers;
                }
                break;
            case 'market':
                if (testData.marketAnalysis) {
                    appState.marketAnalysis = testData.marketAnalysis;
                }
                break;
            case 'business':
                if (testData.businessModel) {
                    appState.businessModel = testData.businessModel;
                }
                break;
            case 'mvp':
                if (testData.mvpFeatures) {
                    appState.mvpFeatures = testData.mvpFeatures;
                }
                break;
            case 'pitch':
                if (testData.pitchDeck) {
                    appState.pitchDeck = testData.pitchDeck;
                }
                break;
            case 'passport':
                if (testData.projectPassport) {
                    appState.projectPassport = testData.projectPassport;
                }
                break;
        }
        
        // Update UI
        const ideaInput = document.getElementById('ideaInput');
        if (ideaInput) {
            ideaInput.value = testData.userIdeaText || '';
        }
        
        // Switch to the selected module
        selectModule(moduleId);
        
        // Show in chat
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
            addMessage(`📋 **Test data for module "${module.title}" loaded!**

🎯 **Project:** ${testData.projectPassport?.basicInfo?.projectName || 'AI Startup Incubator'}
📝 **Idea:** ${testData.projectData?.idea || 'AI-powered startup incubator platform'}

Data loaded for working with module "${module.title}".

Welcome to module "${module.title}"!`, 'assistant');
        }
        
        // Update passport display
        if (typeof renderModulePassport === 'function') {
            renderModulePassport();
        }
        
                saveProgress();
                showAdminStatus(`Test data for module "${module.title}" loaded`, 'success');
                
                // Reset the select dropdown
                const moduleDataSelect = document.getElementById('moduleDataSelect');
                if (moduleDataSelect) {
                    moduleDataSelect.value = '';
                }
                
            } catch (error) {
                console.error('Error loading module test data:', error);
                showAdminStatus('Error loading module data: ' + error.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error fetching test-data.json:', error);
            showAdminStatus('Error loading test-data.json file: ' + error.message, 'error');
        });
}

// Clear comprehensive test data
function clearComprehensiveTestData() {
    // Clear all test-related data
    appState.projectData = {};
    appState.userIdeaText = '';
    appState.projectPassport = null;
    appState.validationAnswers = null;
    appState.marketAnalysis = null;
    appState.businessModel = null;
    appState.mvpFeatures = null;
    appState.pitchDeck = null;
    
    // Clear idea input
    const ideaInput = document.getElementById('ideaInput');
    if (ideaInput) {
        ideaInput.value = '';
    }
    
    // Clear chat
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        const currentModule = appState.modules[appState.currentModule];
        addMessage(`🧹 **All test data cleared.**\n\nWelcome to module "${currentModule.title}"! Ask any questions about this topic.`, 'assistant');
    }
    
    // Update passport display
    setTimeout(() => {
        if (typeof renderModulePassport === 'function') {
            renderModulePassport();
        }
    }, 100);
    
    saveProgress();
    showAdminStatus('All test data cleared', 'success');
}

// Update admin status
function updateAdminStatus() {
    const statusDiv = document.getElementById('adminStatus');
    if (!statusDiv) return;
    
    const completedModules = appState.modules.filter(m => m.status === 'completed').length;
    const totalModules = appState.modules.length;
    const currentModule = appState.modules[appState.currentModule];
    const currentModel = appState.geminiModel || 'gemini-2.0-flash-exp';
    
    // Получаем информацию о состоянии
    const stateInfo = window.getStateInfo ? window.getStateInfo() : { historySize: 0, lastSnapshot: 'No' };
    
    statusDiv.innerHTML = `
        <strong>Current module:</strong> ${currentModule.title}<br>
        <strong>Status:</strong> ${currentModule.status}<br>
        <strong>Progress:</strong> ${completedModules}/${totalModules} modules completed<br>
        <strong>Idea:</strong> ${appState.projectData?.idea ? 'Loaded' : 'Not loaded'}<br>
        <strong>AI Provider:</strong> ${appState.aiProvider}<br>
        <strong>Gemini Model:</strong> ${currentModel}<br>
        <strong>State history:</strong> ${stateInfo.historySize} entries<br>
        <strong>Last snapshot:</strong> ${stateInfo.lastSnapshot}
    `;
}

// Show admin status message
function showAdminStatus(message, type = 'info') {
    const statusDiv = document.getElementById('adminStatus');
    if (!statusDiv) return;
    
    statusDiv.className = `admin-status ${type}`;
    statusDiv.textContent = message;
    
    // Auto-clear after 3 seconds
    setTimeout(() => {
        updateAdminStatus();
    }, 3000);
}

// Switch to next Gemini model
function switchToNextGeminiModel() {
    const models = ['gemini-2.0-flash-exp', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
    const currentModel = appState.geminiModel || 'gemini-2.0-flash-exp';
    const currentIndex = models.indexOf(currentModel);
    
    if (currentIndex >= 0 && currentIndex < models.length - 1) {
        const nextModel = models[currentIndex + 1];
        appState.geminiModel = nextModel;
        localStorage.setItem('aiIncubatorGeminiModel', nextModel);
        
        // Update select
        const modelSelect = document.getElementById('geminiModelSelect');
        if (modelSelect) {
            modelSelect.value = nextModel;
        }
        
        showAdminStatus(`Switched to model: ${nextModel}`, 'success');
    } else {
        showAdminStatus('Reached end of models list', 'warning');
    }
}

// Reset to default model
function resetToDefaultModel() {
    appState.geminiModel = 'gemini-2.0-flash-exp';
    localStorage.setItem('aiIncubatorGeminiModel', 'gemini-2.0-flash-exp');
    
    // Update select
    const modelSelect = document.getElementById('geminiModelSelect');
    if (modelSelect) {
        modelSelect.value = 'gemini-2.5-pro';
    }
    
    showAdminStatus('Reset to default model: gemini-2.5-pro', 'success');
}

// State Management Functions

// Undo last action
function undoLastAction() {
    if (window.undoLastAction && window.undoLastAction()) {
        showNotification('Undo performed successfully', 'success');
        updateAdminStatus();
    } else {
        showNotification('No actions to undo', 'warning');
    }
}

// Clear state history
function clearStateHistory() {
    if (window.clearStateHistory) {
        window.clearStateHistory();
        showNotification('State history cleared', 'success');
        updateAdminStatus();
    } else {
        showNotification('Error clearing history', 'error');
    }
}

// API Logs Management Functions

// Export logs for current module
function exportCurrentModuleLogs() {
    if (!window.apiLogger) {
        alert('API Logger not initialized');
        return;
    }
    
    const currentModuleId = window.apiLogger.getCurrentModule();
    const logs = window.apiLogger.getModuleLogs(currentModuleId);
    
    if (logs.length === 0) {
        alert(`No logs for module: ${currentModuleId}`);
        return;
    }
    
    window.apiLogger.exportModuleLogs(currentModuleId);
    
    // Update admin status
    const statusDiv = document.getElementById('adminStatus');
    if (statusDiv) {
        statusDiv.innerHTML = `✅ Exported module logs: ${currentModuleId} (${logs.length} entries)`;
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 5000);
    }
}

// Export all module logs
function exportAllModuleLogs() {
    if (!window.apiLogger) {
        alert('API Logger not initialized');
        return;
    }
    
    const stats = window.apiLogger.getStatistics();
    
    if (stats.totalRequests === 0) {
        alert('No logs to export');
        return;
    }
    
    window.apiLogger.exportAllLogs();
    
    // Update admin status
    const statusDiv = document.getElementById('adminStatus');
    if (statusDiv) {
        statusDiv.innerHTML = `✅ Exported all logs (${stats.totalModules} modules, ${stats.totalRequests} requests)`;
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 5000);
    }
}

// Show API logs statistics
function showApiLogsStatistics() {
    if (!window.apiLogger) {
        alert('API Logger not initialized');
        return;
    }
    
    const stats = window.apiLogger.getStatistics();
    
    let message = `📊 API Logs Statistics:\n\n`;
    message += `Allго modules: ${stats.totalModules}\n`;
    message += `Allго requests: ${stats.totalRequests}\n`;
    message += `Total responses: ${stats.totalResponses}\n\n`;
    
    if (stats.totalModules > 0) {
        message += `Breakdown by modules:\n`;
        for (const [moduleId, moduleStats] of Object.entries(stats.moduleStats)) {
            message += `- ${moduleStats.title} (${moduleId}): ${moduleStats.requests} requests, ${moduleStats.responses} responses\n`;
        }
    }
    
    alert(message);
}

// Clear API logs
function clearApiLogs() {
    if (!window.apiLogger) {
        alert('API Logger not initialized');
        return;
    }
    
    const stats = window.apiLogger.getStatistics();
    
    if (stats.totalRequests === 0) {
        alert('No logs to clear');
        return;
    }
    
    const confirmed = confirm(`Are you sure you want to clear all logs?\n\nThis will delete ${stats.totalRequests} requests из ${stats.totalModules} modules.`);
    
    if (confirmed) {
        window.apiLogger.clearAllLogs();
        
        // Update admin status
        const statusDiv = document.getElementById('adminStatus');
        if (statusDiv) {
            statusDiv.innerHTML = '✅ All logs cleared';
            setTimeout(() => {
                statusDiv.innerHTML = '';
            }, 3000);
        }
    }
}

// Export app state
function exportAppState() {
    if (window.exportAppState) {
        window.exportAppState();
        showNotification('State exported', 'success');
    } else {
        showNotification('Error exporting state', 'error');
    }
}

// Import app state
function importAppState() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file && window.importAppState) {
            window.importAppState(file)
                .then(() => {
                    showNotification('State imported successfully', 'success');
                    updateAdminStatus();
                    // Перезагружаем UI
                    renderModuleList();
                    renderModuleContent();
                    updateModuleActionButton();
                    updateOverallProgress();
                })
                .catch((error) => {
                    showNotification('Error importing state: ' + error.message, 'error');
                });
        }
    };
    input.click();
}
