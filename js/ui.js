// Render module list in sidebar
function renderModuleList() {
    const moduleList = document.getElementById('moduleList');
    if (!moduleList) return;
    
    moduleList.innerHTML = '';

    appState.modules.forEach((module, index) => {
        const moduleItem = document.createElement('div');
        moduleItem.className = `module-item ${module.status}`;
        if (index === appState.currentModule) {
            moduleItem.classList.add('active');
        }

        const statusIcon = document.createElement('div');
        statusIcon.className = `module-status ${module.status}`;
        statusIcon.textContent = module.status === 'completed' ? '✓' : index + 1;

        const moduleText = document.createElement('div');
        moduleText.className = 'module-text';
        moduleText.textContent = module.title;

        moduleItem.appendChild(statusIcon);
        moduleItem.appendChild(moduleText);

        if (module.status !== 'locked') {
            moduleItem.onclick = () => switchToModule(index);
        }

        moduleList.appendChild(moduleItem);
    });
}

// Switch to specific module
function switchToModule(moduleIndex) {
    if (appState.modules[moduleIndex].status === 'locked') return;
    
    console.log('switchToModule called with index:', moduleIndex);
    console.log('Previous currentModule:', appState.currentModule);
    
    // Clean up chat popup event listeners when switching modules
    if (typeof cleanupPlanButtonListeners === 'function') {
        cleanupPlanButtonListeners();
    }
    
    appState.currentModule = moduleIndex;
    
    console.log('New currentModule:', appState.currentModule);
    
    renderModuleList();
    renderModuleContent();
    
    // Update admin module select if it exists
    const adminModuleSelect = document.getElementById('adminModuleSelect');
    if (adminModuleSelect && adminModuleSelect.value != moduleIndex) {
        adminModuleSelect.value = moduleIndex;
        console.log('Updated admin module select to:', moduleIndex);
    }
    
    // Ensure passport and button are updated after module switch
    setTimeout(() => {
        updateModuleActionButton();
        renderModulePassport();
        initializePassportToggle();
    }, 100);
}

// Render current module content
function renderModuleContent() {
    const currentModule = appState.modules[appState.currentModule];
    
    const moduleTitle = document.getElementById('moduleTitle');
    const moduleDescription = document.getElementById('moduleDescription');
    
    if (moduleTitle) moduleTitle.textContent = currentModule.title;
    if (moduleDescription) moduleDescription.textContent = currentModule.description;
    
    renderTopics(currentModule.topics);
    
    // Chat is now handled via popup, no need for inline chat section
    
    renderModulePassport(); // Added this line
    initializePassportToggle(); // Initialize toggle functionality
    
    const testSection = document.getElementById('testSection');
    const nextModuleBtn = document.getElementById('nextModuleBtn');
    
    if (testSection) testSection.classList.add('hidden');
    if (nextModuleBtn) nextModuleBtn.classList.add('hidden');
    
    // Module action buttons will be updated in setTimeout below
}

// Render topics grid
function renderTopics(topics) {
    const topicsGrid = document.getElementById('topicsGrid');
    if (!topicsGrid) return;
    
    topicsGrid.innerHTML = '';

    topics.forEach((topic, index) => {
        const topicCard = document.createElement('div');
        topicCard.className = `topic-card ${topic.status}`;
        
        // Добавляем обработчик клика только для активных топиков
        if (topic.status === 'active') {
            topicCard.onclick = () => selectTopic(topic);
        }

        const topicHeader = document.createElement('div');
        topicHeader.className = 'topic-header';

        const topicTitle = document.createElement('h4');
        topicTitle.className = 'topic-title';
        topicTitle.textContent = topic.title;

        // Добавляем индикатор статуса
        const statusIndicator = document.createElement('div');
        statusIndicator.className = `topic-status ${topic.status}`;
        if (topic.status === 'completed') {
            statusIndicator.textContent = '✓';
        } else if (topic.status === 'active') {
            statusIndicator.textContent = '●';
        } else {
            statusIndicator.textContent = '🔒';
        }

        topicHeader.appendChild(topicTitle);
        topicHeader.appendChild(statusIndicator);

        const topicDescription = document.createElement('p');
        topicDescription.className = 'topic-description';
        topicDescription.textContent = topic.description;

        // Добавляем прогресс для активных топиков
        if (topic.status === 'active' || topic.status === 'completed') {
            const progressBar = document.createElement('div');
            progressBar.className = 'topic-progress';
            
            const progressFill = document.createElement('div');
            progressFill.className = 'progress-fill';
            
            let progressPercent = 0;
            let progressText = '';
            
            if (topic.status === 'completed') {
                progressPercent = 100;
                progressText = 'Completed';
            } else {
                // For all modules - show "Не начато" for active topics
                progressPercent = 0;
                progressText = 'Не начато';
            }
            
            progressFill.style.width = `${progressPercent}%`;
            
            const progressTextElement = document.createElement('span');
            progressTextElement.className = 'progress-text';
            progressTextElement.textContent = progressText;
            
            progressBar.appendChild(progressFill);
            progressBar.appendChild(progressTextElement);
            
            topicCard.appendChild(topicHeader);
            topicCard.appendChild(topicDescription);
            topicCard.appendChild(progressBar);
        } else {
            topicCard.appendChild(topicHeader);
            topicCard.appendChild(topicDescription);
        }

        topicsGrid.appendChild(topicCard);
    });
}

// Render chat interface
function renderChat() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    chatMessages.innerHTML = '';
    
    const currentModule = appState.modules[appState.currentModule];
    const currentProvider = apiKeyManager ? apiKeyManager.currentProvider : appState.aiProvider;
    const providerName = currentProvider === 'gemini' ? 'Gemini Flash 2.0' : 'GPT-4';
    
    const chatTitle = document.getElementById('chatTitle');
    if (chatTitle) {
        chatTitle.textContent = `ИИ Агент Ментор`;
    }
    
    // No welcome message - chat starts with learning plan when topic is selected
}

// Add message to chat
function addMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return null;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    if (sender === 'assistant') {
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: false,
                mangle: false
            });
            messageDiv.innerHTML = marked.parse(text);
        } else {
            let formattedText = text
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/^• (.*$)/gim, '<li>$1</li>')
                .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>');
            
            formattedText = '<p>' + formattedText + '</p>';
            
            formattedText = formattedText
                .replace(/<p><h([1-6])>/g, '<h$1>')
                .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
                .replace(/<p><ul>/g, '<ul>')
                .replace(/<\/ul><\/p>/g, '</ul>')
                .replace(/<p><\/p>/g, '');
            
            messageDiv.innerHTML = formattedText;
        }
    } else {
        messageDiv.textContent = text;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

// Render project passport
function renderProjectPassport() {
    const passportContent = document.getElementById('passportContent');
    if (!passportContent) return;
    
    const idea = appState.projectData.idea || 'Не указана';
    const creationDate = new Date(appState.projectData.userInfo?.timestamp || Date.now()).toLocaleDateString('ru-RU');
    const currentModule = appState.modules[appState.currentModule]?.title || 'Не определен';
    const completedModules = appState.modules.filter(m => m.status === 'completed').length;
    const totalModules = appState.modules.length;
    const progressPercentage = Math.round((completedModules / totalModules) * 100);
    
    // Check if we have detailed project passport data
    const hasDetailedPassport = appState.projectPassport && appState.projectPassport.basicInfo;
    
    if (hasDetailedPassport) {
        // Render detailed passport
        const passport = appState.projectPassport;
        passportContent.innerHTML = `
            <div class="passport-detailed">
                <div class="passport-header">
                    <h3>📋 Project Passport: ${passport.basicInfo.projectName}</h3>
                    <p class="passport-tagline">${passport.basicInfo.tagline}</p>
                </div>
                
                <div class="passport-sections">
                    <div class="passport-section">
                        <h4>🏢 Basic Information</h4>
                        <div class="passport-vertical">
                            <div class="passport-item">
                                <strong>Industry:</strong><br>${passport.basicInfo.industry}
                            </div>
                            <div class="passport-item">
                                <strong>Этап:</strong><br>${passport.basicInfo.stage}
                            </div>
                            <div class="passport-item">
                                <strong>Team:</strong><br>${passport.basicInfo.teamSize}
                            </div>
                            <div class="passport-item">
                                <strong>Location:</strong><br>${passport.basicInfo.location}
                            </div>
                        </div>
                    </div>
                    
                    <div class="passport-section">
                        <h4>🎯 Problem and Solution</h4>
                        <div class="passport-vertical">
                            <div class="passport-item">
                                <strong>Problem:</strong><br>${passport.problem.description}
                            </div>
                            <div class="passport-item">
                                <strong>Solution:</strong><br>${passport.solution.description}
                            </div>
                        </div>
                    </div>
                    
                    <div class="passport-section">
                        <h4>📊 Market</h4>
                        <div class="passport-vertical">
                            <div class="passport-item">
                                <strong>Market Size:</strong><br>${passport.market.size}
                            </div>
                            <div class="passport-item">
                                <strong>Competitors:</strong><br>${passport.market.competitors.join(', ')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="passport-section">
                        <h4>💰 Business Model</h4>
                        <div class="passport-vertical">
                            <div class="passport-item">
                                <strong>Revenue Streams:</strong><br>${passport.businessModel.revenueStreams.join(', ')}
                            </div>
                            <div class="passport-item">
                                <strong>Pricing:</strong><br>${passport.businessModel.pricing.basic ? `Basic: ${passport.businessModel.pricing.basic}<br>` : ''}${passport.businessModel.pricing.premium ? `Premium: ${passport.businessModel.pricing.premium}` : passport.businessModel.pricing.premiumSubscription || ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="passport-section">
                        <h4>👥 Team</h4>
                        <div class="passport-vertical">
                            <div class="passport-item">
                                <strong>Founders:</strong><br>${passport.team.founders.map(f => f.name + ' (' + f.role + ')').join(', ')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="passport-section">
                        <h4>📈 Financials</h4>
                        <div class="passport-vertical">
                            <div class="passport-item">
                                <strong>Инвестиции:</strong><br>${passport.financials.funding.amount} (${passport.financials.funding.stage})
                            </div>
                            <div class="passport-item">
                                <strong>Прогноз выручки (year 1):</strong><br>${passport.financials.projections.year1.revenue}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Render simple passport
        passportContent.innerHTML = `
            <div class="passport-vertical">
                <div class="passport-item">
                    <h5>💡 Main Idea</h5>
                    <div class="idea-content">
                        <div class="idea-main">
                            <strong>Концепция:</strong>
                            <p>${idea.split('\n\n')[0]}</p>
                        </div>
                        
                        ${idea.includes('Key Features:') ? `
                        <div class="idea-features">
                            <strong>Key Features:</strong>
                            <ul>
                                ${idea.split('Key Features:')[1].split('Target Audience:')[0]
                                    .split('\n')
                                    .filter(line => line.trim().startsWith('-'))
                                    .map(feature => `<li>${feature.trim().substring(1).trim()}</li>`)
                                    .join('')}
                            </ul>
                        </div>
                        ` : ''}
                        
                        ${idea.includes('Target Audience:') ? `
                        <div class="idea-audience">
                            <strong>Target Audience:</strong>
                            <ul>
                                ${idea.split('Target Audience:')[1].split('Problem:')[0]
                                    .split('\n')
                                    .filter(line => line.trim().startsWith('-'))
                                    .map(audience => `<li>${audience.trim().substring(1).trim()}</li>`)
                                    .join('')}
                            </ul>
                        </div>
                        ` : ''}
                        
                        ${idea.includes('Problem:') ? `
                        <div class="idea-problem">
                            <strong>Problem:</strong>
                            <p>${idea.split('Problem:')[1].split('Solution:')[0].trim()}</p>
                        </div>
                        ` : ''}
                        
                        ${idea.includes('Solution:') ? `
                        <div class="idea-solution">
                            <strong>Solution:</strong>
                            <p>${idea.split('Solution:')[1].trim()}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="passport-item">
                    <h5>📅 Yesта создания</h5>
                    <p>${creationDate}</p>
                </div>
                
                <div class="passport-item">
                    <h5>🎯 Текущий этап</h5>
                    <p>${currentModule}</p>
                </div>
                
                <div class="passport-item">
                    <h5>📊 Общий прогресс</h5>
                    <p>${completedModules} из ${totalModules} modules completed (${progressPercentage}%)</p>
                </div>
            </div>
            
            <div class="passport-section" style="margin-top: var(--space-4);">
                <h5>📋 Детали проекта</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-3); margin-top: var(--space-3);">
                    <div>
                        <strong>Статус:</strong> ${appState.modules[appState.currentModule]?.status === 'active' ? '🟢 Активный' : '⚪ Ожидает'}
                    </div>
                    <div>
                        <strong>AI провайдер:</strong> ${currentProvider === 'gemini' ? 'Google Gemini' : 'OpenAI'}
                    </div>
                    <div>
                        <strong>Модель:</strong> ${currentProvider === 'gemini' ? appState.geminiModel : 'GPT-4'}
                    </div>
                    <div>
                        <strong>Последнее обновление:</strong> ${new Date().toLocaleString('ru-RU')}
                    </div>
                </div>
            </div>
        `;
    }
}

function renderModulePassport() {
    console.log('renderModulePassport called');
    console.log('appState.projectPassport:', appState.projectPassport);
    
    const modulePassportContent = document.getElementById('modulePassportContent');
    if (!modulePassportContent) {
        console.log('modulePassportContent not found');
        return;
    }
    
    // Check if we have detailed project passport data
    const hasDetailedPassport = appState.projectPassport && appState.projectPassport.basicInfo;
    console.log('hasDetailedPassport:', hasDetailedPassport);
    
    // Also make sure the passport toggle button is visible
    const passportModule = document.querySelector('.project-passport-module');
    if (passportModule) {
        passportModule.style.display = 'block';
        passportModule.style.visibility = 'visible';
        console.log('Made passport module visible');
    } else {
        console.log('ERROR: .project-passport-module not found in DOM');
    }
    console.log('appState.projectPassport:', appState.projectPassport);
    
    if (hasDetailedPassport) {
        // Render detailed passport
        const passport = appState.projectPassport;
        modulePassportContent.innerHTML = `
            <div class="passport-detailed">
                <div class="passport-header">
                    <h3>📋 Project Passport: ${passport.basicInfo.projectName}</h3>
                    <p class="passport-tagline">${passport.basicInfo.tagline}</p>
                </div>
                
                <div class="passport-sections">
                    <div class="passport-section">
                        <h4>🏢 Basic Information</h4>
                        <div class="passport-vertical">
                            <div class="passport-item">
                                <strong>Industry:</strong><br>${passport.basicInfo.industry}
                            </div>
                            <div class="passport-item">
                                <strong>Этап:</strong><br>${passport.basicInfo.stage}
                            </div>
                            <div class="passport-item">
                                <strong>Team:</strong><br>${passport.basicInfo.teamSize}
                            </div>
                            <div class="passport-item">
                                <strong>Location:</strong><br>${passport.basicInfo.location}
                            </div>
                        </div>
                    </div>
                    
                    <div class="passport-section">
                        <h4>🎯 Problem and Solution</h4>
                        <div class="passport-vertical">
                            <div class="passport-item">
                                <strong>Problem:</strong><br>${passport.problem.description}
                            </div>
                            <div class="passport-item">
                                <strong>Solution:</strong><br>${passport.solution.description}
                            </div>
                        </div>
                    </div>
                    
                    <div class="passport-section">
                        <h4>📊 Market</h4>
                        <div class="passport-vertical">
                            <div class="passport-item">
                                <strong>Market Size:</strong><br>${passport.market.size}
                            </div>
                            <div class="passport-item">
                                <strong>Competitors:</strong><br>${passport.market.competitors.join(', ')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="passport-section">
                        <h4>💰 Business Model</h4>
                        <div class="passport-vertical">
                            <div class="passport-item">
                                <strong>Revenue Streams:</strong><br>${passport.businessModel.revenueStreams.join(', ')}
                            </div>
                            <div class="passport-item">
                                <strong>Pricing:</strong><br>${passport.businessModel.pricing.basic ? `Basic: ${passport.businessModel.pricing.basic}<br>` : ''}${passport.businessModel.pricing.premium ? `Premium: ${passport.businessModel.pricing.premium}` : passport.businessModel.pricing.premiumSubscription || ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="passport-section">
                        <h4>👥 Team</h4>
                        <div class="passport-vertical">
                            <div class="passport-item">
                                <strong>Founders:</strong><br>${passport.team.founders.map(f => f.name + ' (' + f.role + ')').join(', ')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="passport-section">
                        <h4>📈 Financials</h4>
                        <div class="passport-vertical">
                            <div class="passport-item">
                                <strong>Инвестиции:</strong><br>${passport.financials.funding.amount} (${passport.financials.funding.stage})
                            </div>
                            <div class="passport-item">
                                <strong>Прогноз выручки (year 1):</strong><br>${passport.financials.projections.year1.revenue}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Render simple passport
        const idea = appState.projectData.idea || 'Не указана';
        const creationDate = new Date(appState.projectData.userInfo?.timestamp || Date.now()).toLocaleDateString('ru-RU');
        const currentModule = appState.modules[appState.currentModule]?.title || 'Не определен';
        const completedModules = appState.modules.filter(m => m.status === 'completed').length;
        const totalModules = appState.modules.length;
        const progressPercentage = Math.round((completedModules / totalModules) * 100);
        const currentModuleStatus = appState.modules[appState.currentModule]?.status === 'active' ? 'active' : 'pending';
        const currentProvider = apiKeyManager ? apiKeyManager.currentProvider : appState.aiProvider;
        
        modulePassportContent.innerHTML = `
            <div class="passport-vertical">
                <div class="passport-item">
                    <h5>💡 Main Idea</h5>
                    <div class="idea-content">
                        <div class="idea-main">
                            <strong>Концепция:</strong>
                            <p>${idea.split('\n\n')[0]}</p>
                        </div>
                        
                        ${idea.includes('Key Features:') ? `
                        <div class="idea-features">
                            <strong>Key Features:</strong>
                            <ul>
                                ${idea.split('Key Features:')[1].split('Target Audience:')[0]
                                    .split('\n')
                                    .filter(line => line.trim().startsWith('-'))
                                    .map(feature => `<li>${feature.trim().substring(1).trim()}</li>`)
                                    .join('')}
                            </ul>
                        </div>
                        ` : ''}
                        
                        ${idea.includes('Target Audience:') ? `
                        <div class="idea-audience">
                            <strong>Target Audience:</strong>
                            <ul>
                                ${idea.split('Target Audience:')[1].split('Problem:')[0]
                                    .split('\n')
                                    .filter(line => line.trim().startsWith('-'))
                                    .map(audience => `<li>${audience.trim().substring(1).trim()}</li>`)
                                    .join('')}
                            </ul>
                        </div>
                        ` : ''}
                        
                        ${idea.includes('Problem:') ? `
                        <div class="idea-problem">
                            <strong>Problem:</strong>
                            <p>${idea.split('Problem:')[1].split('Solution:')[0].trim()}</p>
                        </div>
                        ` : ''}
                        
                        ${idea.includes('Solution:') ? `
                        <div class="idea-solution">
                            <strong>Solution:</strong>
                            <p>${idea.split('Solution:')[1].trim()}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="passport-item">
                    <h5>📅 Yesта создания</h5>
                    <p>${creationDate}</p>
                </div>
                
                <div class="passport-item">
                    <h5>🎯 Текущий этап</h5>
                    <p>${currentModule}</p>
                    <div class="status-indicator status-${currentModuleStatus}">
                        ${currentModuleStatus === 'active' ? '🟢 Активный' : '⚪ Ожидает'}
                    </div>
                </div>
                
                <div class="passport-item">
                    <h5>📊 Общий прогресс</h5>
                    <p>${completedModules} из ${totalModules} modules completed</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <p style="margin-top: var(--space-2); font-size: 0.9rem; color: var(--text-muted);">${progressPercentage}%</p>
                </div>
                
                <div class="passport-item">
                    <h5>🤖 AI настройки</h5>
                    <p>Провайдер: ${currentProvider === 'gemini' ? 'Google Gemini' : 'OpenAI'}</p>
                    <p>Модель: ${currentProvider === 'gemini' ? appState.geminiModel : 'GPT-4'}</p>
                </div>
                
                <div class="passport-item">
                    <h5>🕒 Последнее обновление</h5>
                    <p>${new Date().toLocaleString('ru-RU')}</p>
                </div>
            </div>
        `;
    }
    
    // Add validation button to passport content after rendering
    setTimeout(() => {
        addValidationButtonToPassport();
        initializePassportToggle();
    }, 50);
}

// Add validation button to passport content
function addValidationButtonToPassport() {
    const modulePassportContent = document.getElementById('modulePassportContent');
    if (!modulePassportContent) return;
    
    // Check if validation button already exists
    const existingBtn = document.getElementById('validationResultsBtn');
    if (existingBtn) return;
    
    // Create validation section HTML
    const validationSection = `
        <div class="passport-validation-section">
            <button id="validationResultsBtn" class="btn secondary btn-sm validation-indicator-btn">
                <span id="validationIndicator" class="validation-indicator">💡</span>
                Результаты валидации
            </button>
        </div>
        <div id="moduleValidationContent" class="validation-results-content hidden">
            <!-- Module validation content will be populated here -->
        </div>
    `;
    
    // Add validation section to the end of passport content
    modulePassportContent.insertAdjacentHTML('beforeend', validationSection);
    
    console.log('Validation button added to passport');
}

// Add passport toggle functionality
function initializePassportToggle() {
    console.log('initializePassportToggle called');
    
    // Add small delay to ensure DOM is ready
    setTimeout(() => {
        const passportToggleBtn = document.getElementById('passportToggleBtn');
        const validationResultsBtn = document.getElementById('validationResultsBtn');
        const passportContent = document.getElementById('modulePassportContent');
        const validationContent = document.getElementById('moduleValidationContent');
        
        console.log('passportToggleBtn found:', !!passportToggleBtn);
        console.log('validationResultsBtn found:', !!validationResultsBtn);
        console.log('passportContent found:', !!passportContent);
        console.log('validationContent found:', !!validationContent);
        
        if (passportToggleBtn && passportContent) {
            // Remove any existing event listeners by cloning
            const newPassportBtn = passportToggleBtn.cloneNode(true);
            passportToggleBtn.parentNode.replaceChild(newPassportBtn, passportToggleBtn);
            
            newPassportBtn.addEventListener('click', function() {
                console.log('Passport toggle clicked');
                const isExpanded = newPassportBtn.classList.contains('expanded');
                
                if (isExpanded) {
                    // Collapse passport
                    console.log('Collapsing passport');
                    newPassportBtn.classList.remove('expanded');
                    passportContent.classList.remove('visible');
                    passportContent.classList.add('hidden');
                } else {
                    // Expand passport
                    console.log('Expanding passport');
                    newPassportBtn.classList.add('expanded');
                    passportContent.classList.remove('hidden');
                    passportContent.classList.add('visible');
                    
                    // Update validation indicator when passport opens
                    updateValidationIndicator();
                }
            });
            console.log('Passport toggle initialized successfully');
        }
        
        if (validationResultsBtn && validationContent) {
            // Remove any existing event listeners by cloning
            const newValidationBtn = validationResultsBtn.cloneNode(true);
            validationResultsBtn.parentNode.replaceChild(newValidationBtn, validationResultsBtn);
            
            newValidationBtn.addEventListener('click', function() {
                console.log('Validation results clicked');
                const isExpanded = validationContent.classList.contains('visible');
                
                if (isExpanded) {
                    // Collapse validation
                    console.log('Collapsing validation results');
                    validationContent.classList.remove('visible');
                    validationContent.classList.add('hidden');
                } else {
                    // Expand validation
                    console.log('Expanding validation results');
                    validationContent.classList.remove('hidden');
                    validationContent.classList.add('visible');
                    
                    // Render validation content
                    renderValidationResults();
                }
            });
            console.log('Validation results button initialized successfully');
        }
        
        // Update validation indicator when initializing
        updateValidationIndicator();
    }, 100);
}

// Update validation indicator based on data availability
function updateValidationIndicator() {
    const indicator = document.getElementById('validationIndicator');
    if (!indicator) return;
    
    const hasValidationData = appState.validationAnswers && appState.validationAnswers.finalScore !== undefined;
    
    indicator.className = 'validation-indicator';
    
    if (hasValidationData) {
        // Light on - data available
        indicator.classList.add('on');
        indicator.textContent = '💡'; // Bright bulb
    } else {
        // Light off - no data
        indicator.classList.add('off');
        indicator.textContent = '💡'; // Dimmed bulb
    }
}

// Render validation results in structured format
function renderValidationResults() {
    const validationContent = document.getElementById('moduleValidationContent');
    if (!validationContent) return;
    
    // Check if we have validation data
    const hasValidationData = appState.validationAnswers && appState.validationAnswers.finalScore !== undefined;
    
    if (!hasValidationData) {
        validationContent.innerHTML = `
            <div class="validation-empty">
                <div class="validation-empty-icon">📋</div>
                <h4>Yesнные валидации недоступны</h4>
                <p>Для просмотра результатов валидации необходимо сначала пройти процесс валидации в соответствующем модуле.</p>
                <div class="validation-hint">
                    <p><strong>Как получить данные валидации:</strong></p>
                    <ol>
                        <li>Перейдите в модуль "Валидация идеи"</li>
                        <li>Нажмите кнопку "Валидировать свою идею"</li>
                        <li>Ответьте на вопросы AI-агента</li>
                        <li>Получите детальный анализ</li>
                    </ol>
                </div>
            </div>
        `;
        return;
    }
    
    const validation = appState.validationAnswers;
    const currentModule = appState.modules[appState.currentModule]?.title || 'Не определен';
    
    validationContent.innerHTML = `
        <div class="validation-results">
            <div class="validation-header">
                <h3>✅ Результаты валидации проекта</h3>
                <div class="validation-score ${getScoreClass(validation.finalScore)}">
                    <span class="score-value">${validation.finalScore}/100</span>
                    <span class="score-label">баллов</span>
                </div>
            </div>
            
            <div class="validation-sections">
                <div class="validation-section">
                    <h4>📊 Общая оценка</h4>
                    <div class="validation-metrics">
                        <div class="metric-item">
                            <div class="metric-label">Итоговый балл</div>
                            <div class="metric-value score-${getScoreClass(validation.finalScore)}">${validation.finalScore}/100</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Уровень проекта</div>
                            <div class="metric-value">${getScoreLevel(validation.finalScore)}</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Yesта валидации</div>
                            <div class="metric-value">${new Date(validation.timestamp || Date.now()).toLocaleDateString('ru-RU')}</div>
                        </div>
                    </div>
                </div>
                
                <div class="validation-section">
                    <h4>📈 Статистика процесса</h4>
                    <div class="validation-stats">
                        <div class="stat-item">
                            <div class="stat-icon">❓</div>
                            <div class="stat-info">
                                <div class="stat-value">${validation.metrics.questionsAnswered}</div>
                                <div class="stat-label">Вопросов отвечено</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon">💡</div>
                            <div class="stat-info">
                                <div class="stat-value">${validation.metrics.guidingQuestionsUsed}</div>
                                <div class="stat-label">Наводящих вопросов</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon">📉</div>
                            <div class="stat-info">
                                <div class="stat-value">-${validation.metrics.pointsDeducted}</div>
                                <div class="stat-label">Штрафных баллов</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${validation.userAnswers && validation.userAnswers.length > 0 ? `
                <div class="validation-section">
                    <h4>💬 Ваши ответы</h4>
                    <div class="answers-list">
                        ${validation.userAnswers.map((answer, index) => `
                            <div class="answer-item">
                                <div class="answer-number">Ответ ${index + 1}</div>
                                <div class="answer-text">${answer}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${validation.aiFeedback && validation.aiFeedback.length > 0 ? `
                <div class="validation-section">
                    <h4>🤖 Обратная связь AI</h4>
                    <div class="feedback-list">
                        ${validation.aiFeedback.map((feedback, index) => `
                            <div class="feedback-item">
                                <div class="feedback-number">Отзыв ${index + 1}</div>
                                <div class="feedback-text">${feedback}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="validation-section">
                    <h4>🎯 Рекомендации</h4>
                    <div class="recommendations">
                        ${getValidationRecommendations(validation.finalScore)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get score class for styling
function getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
}

// Get score level text
function getScoreLevel(score) {
    if (score >= 80) return '🏆 Отличный проект';
    if (score >= 60) return '👍 Хороший проект';
    if (score >= 40) return '⚠️ Проект нуждается в доработке';
    return '❌ Проект требует серьезных изменений';
}

// Get validation recommendations based on score
function getValidationRecommendations(score) {
    if (score >= 80) {
        return `
            <div class="recommendation excellent">
                <div class="rec-icon">🎉</div>
                <div class="rec-content">
                    <h5>Отличная работа!</h5>
                    <p>Ваш проект показал высокие результаты валидации. Рекомендуем:</p>
                    <ul>
                        <li>Переходить к разработке MVP</li>
                        <li>Start поиск инвесторов</li>
                        <li>Проработать go-to-market стратегию</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (score >= 60) {
        return `
            <div class="recommendation good">
                <div class="rec-icon">👍</div>
                <div class="rec-content">
                    <h5>Хороший результат</h5>
                    <p>Проект имеет потенциал, но есть области для улучшения:</p>
                    <ul>
                        <li>Углубить исследование рынка</li>
                        <li>Уточнить ценностное предложение</li>
                        <li>Провести дополнительное интервью с клиентами</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (score >= 40) {
        return `
            <div class="recommendation fair">
                <div class="rec-icon">⚠️</div>
                <div class="rec-content">
                    <h5>Requires refinement</h5>
                    <p>Проект нуждается в существенных улучшениях:</p>
                    <ul>
                        <li>Пересмотреть проблему и решение</li>
                        <li>Изучить конкурентов более детально</li>
                        <li>Валидировать гипотезы с реальными пользователями</li>
                        <li>Проработать бизнес-модель</li>
                    </ul>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="recommendation poor">
                <div class="rec-icon">🔄</div>
                <div class="rec-content">
                    <h5>Кардинальная переработка</h5>
                    <p>Проект требует серьезных изменений:</p>
                    <ul>
                        <li>Пересмотреть концепцию проекта</li>
                        <li>Найти новую проблему или решение</li>
                        <li>Провести глубокое исследование рынка</li>
                        <li>Вернуться к этапу генерации идей</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after duration
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// Create and display the appropriate button for current module
function updateModuleActionButton() {
    console.log('=== updateModuleActionButton called ===');
    console.log('appState:', appState);
    console.log('currentModule index:', appState?.currentModule);
    
    // Wait for DOM to be ready
    if (document.readyState !== 'complete') {
        console.log('DOM not ready, scheduling updateModuleActionButton for later');
        setTimeout(updateModuleActionButton, 50);
        return;
    }
    
    if (!appState || !appState.modules || appState.currentModule === undefined) {
        console.log('ERROR: appState not ready!');
        console.log('appState exists:', !!appState);
        console.log('modules exists:', !!appState?.modules);
        console.log('currentModule defined:', appState?.currentModule !== undefined);
        return;
    }
    
    const currentModule = appState.modules[appState.currentModule];
    if (!currentModule) {
        console.log('ERROR: currentModule not found!', appState.currentModule);
        console.log('Available modules:', appState.modules.map(m => m.id));
        return;
    }
    
    console.log('Creating button for module:', currentModule.id, '-', currentModule.title);
    
    // Get the container
    const container = document.getElementById('moduleButtonContainer');
    if (!container) {
        console.log('ERROR: moduleButtonContainer not found!');
        return;
    }
    
    // Clear any existing button completely
    container.innerHTML = '';
    
    // Force DOM refresh
    container.offsetHeight;
    
    // Get button configurations from module-specific files
    const buttonConfigs = {};
    
    // Load configurations from each module file
    if (typeof getValidationButtonConfig === 'function') {
        buttonConfigs['validation'] = getValidationButtonConfig();
    } else {
        // Fallback for validation module
        buttonConfigs['validation'] = {
            id: 'validationBtn',
            text: '🎯 Валидировать свою идею',
            onclick: 'validateIdea()'
        };
    }
    
    if (typeof getMarketAnalysisButtonConfig === 'function') {
        buttonConfigs['market-analysis'] = getMarketAnalysisButtonConfig();
    }
    
    if (typeof getBusinessModelButtonConfig === 'function') {
        buttonConfigs['business-model'] = getBusinessModelButtonConfig();
    }
    
    if (typeof getMVPDevelopmentButtonConfig === 'function') {
        buttonConfigs['mvp-development'] = getMVPDevelopmentButtonConfig();
    }
    
    if (typeof getPitchDeckButtonConfig === 'function') {
        buttonConfigs['pitch-deck'] = getPitchDeckButtonConfig();
    }
    
    const config = buttonConfigs[currentModule.id];
    if (!config) {
        console.log('ERROR: No button config for module:', currentModule.id);
        console.log('Available button configs:', Object.keys(buttonConfigs));
        console.log('Module ID from config:', currentModule.id);
        console.log('Full currentModule object:', currentModule);
        return;
    }
    
    console.log('Found config for module:', currentModule.id, config);
    
    // Create the button element
    const button = document.createElement('button');
    button.className = 'btn primary module-action-button disabled';
    button.id = config.id;
    button.disabled = true;
    button.setAttribute('data-module', currentModule.id);
    button.innerHTML = config.text;
    
    // Set the onclick handler
    button.setAttribute('onclick', config.onclick);
    
    // Add the button to container
    container.appendChild(button);
    
    console.log('SUCCESS: Created button', config.id, 'for module', currentModule.id);
    console.log('Button text:', config.text);
    console.log('Button onclick:', config.onclick);
    console.log('Container now contains:', container.innerHTML);
}

// Enable current module action button
function enableCurrentModuleButton() {
    const button = document.querySelector('#moduleButtonContainer .module-action-button');
    if (button) {
        button.classList.remove('disabled');
        button.disabled = false;
    }
}

// Disable current module action button  
function disableCurrentModuleButton() {
    const button = document.querySelector('#moduleButtonContainer .module-action-button');
    if (button) {
        button.classList.add('disabled');
        button.disabled = true;
    }
}
