console.log('dialog.js loaded');

// Dialog State
let dialogState = {
    currentStep: 0,
    userIdea: '',
    dialogHistory: [],
    questions: [],
    currentQuestionIndex: 0,
    isDialogComplete: false
};

// Submit initial idea - make it globally accessible
async function submitIdea() {
    console.log('submitIdea() called');
    
    const ideaText = document.getElementById('ideaInput').value.trim();
    console.log('Idea text:', ideaText);
    
    if (!ideaText) {
        alert('Пожалуйста, опишите вашу идею');
        return;
    }

    dialogState.userIdea = ideaText;
    dialogState.currentStep = 1;
    
    // Hide initial section and show dialog
    document.getElementById('initialIdeaSection').classList.add('hidden');
    document.getElementById('aiDialogSection').classList.remove('hidden');
    
    // Add user's initial idea to dialog
    addDialogMessage(ideaText, 'user');
    
    // Generate initial questions
    await generateInitialQuestions();
}

// Make function globally accessible
window.submitIdea = submitIdea;

// Generate initial questions based on user's idea
async function generateInitialQuestions() {
    console.log('generateInitialQuestions() called');
    
    const loadingMessage = addDialogMessage('⏳ AI анализирует вашу идею и готовит вопросы...', 'ai');
    
    try {
        console.log('Checking API configuration...');
        console.log('apiKeyManager exists:', !!apiKeyManager);
        console.log('appState exists:', !!appState);
        
        const currentProvider = apiKeyManager ? apiKeyManager.currentProvider : appState.aiProvider;
        const currentApiKey = apiKeyManager ? apiKeyManager.getCurrentKey() : (appState.aiProvider === 'gemini' ? appState.geminiApiKey : appState.apiKey);
        const providerName = currentProvider === 'gemini' ? 'Gemini' : 'OpenAI';
        
        console.log('Current provider:', currentProvider);
        console.log('API key exists:', !!currentApiKey);
        
        if (!currentApiKey) {
            console.log('No API key found, switching to demo mode');
            // Demo mode - generate fake questions
            generateDemoQuestions(loadingMessage);
            return;
        }
        
        const prompt = `Ты эксперт по анализу бизнес-идей. Пользователь описал свою идею: "${dialogState.userIdea}"

Создай 5-6 наводящих вопросов для получения более детальной информации о:
1. Целевой аудитории и их проблемах
2. Конкурентах и рынке
3. Модели монетизации
4. Технических аспектах
5. Ресурсах и команде

ВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.

Вопросы должны быть конкретными и помогать лучше понять идею. Верни только список вопросов, каждый с новой строки, начиная с номера.`;

        let response;
        const currentProvider = apiKeyManager ? apiKeyManager.currentProvider : appState.aiProvider;
        if (currentProvider === 'gemini') {
            response = await callGeminiDirect(prompt);
        } else {
            response = await callOpenAIDirect(prompt);
        }
        
        // Remove loading message
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        // Parse questions from response
        const questions = parseQuestionsFromResponse(response);
        dialogState.questions = questions;
        
        // Show first question
        if (questions.length > 0) {
            addDialogMessage(questions[0], 'ai');
        }
        
    } catch (error) {
        console.error('Error при генерации вопросов:', error);
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        addDialogMessage('❌ Произошла ошибка при анализе идеи. Попробуйте еще раз.', 'ai');
    }
}

// Parse questions from AI response
function parseQuestionsFromResponse(response) {
    const lines = response.split('\n').filter(line => line.trim());
    const questions = [];
    
    for (const line of lines) {
        // Look for numbered questions (1., 2., etc.)
        const match = line.match(/^\d+\.\s*(.+)$/);
        if (match) {
            questions.push(match[1].trim());
        } else if (line.includes('?') && line.length > 10) {
            // If no numbering, but contains question mark
            questions.push(line.trim());
        }
    }
    
    return questions.slice(0, 6); // Limit to 6 questions
}

// Send user response to dialog
async function sendDialogResponse() {
    const responseText = document.getElementById('aiDialogInput').value.trim();
    if (!responseText) {
        alert('Пожалуйста, введите ваш ответ');
        return;
    }
    
    // Add user response to dialog
    addDialogMessage(responseText, 'user');
    document.getElementById('aiDialogInput').value = '';
    
    // Store in dialog history
    dialogState.dialogHistory.push({
        question: dialogState.questions[dialogState.currentQuestionIndex],
        answer: responseText
    });
    
    dialogState.currentQuestionIndex++;
    
    // Check if we have more questions
    if (dialogState.currentQuestionIndex < dialogState.questions.length) {
        // Show next question
        addDialogMessage(dialogState.questions[dialogState.currentQuestionIndex], 'ai');
    } else {
        // Generate final analysis
        await generateFinalAnalysis();
    }
}

// Make function globally accessible
window.sendDialogResponse = sendDialogResponse;

// Generate final analysis
async function generateFinalAnalysis() {
    const loadingMessage = addDialogMessage('⏳ AI создает финальный анализ вашей идеи...', 'ai');
    
    try {
        const currentProvider = apiKeyManager ? apiKeyManager.currentProvider : appState.aiProvider;
        const currentApiKey = apiKeyManager ? apiKeyManager.getCurrentKey() : (appState.aiProvider === 'gemini' ? appState.geminiApiKey : appState.apiKey);
        
        if (!currentApiKey) {
            console.log('No API key found for final analysis, using demo mode');
            generateDemoAnalysis(loadingMessage);
            return;
        }
        
        // Prepare dialog history for analysis
        const dialogSummary = dialogState.dialogHistory.map(item => 
            `Вопрос: ${item.question}\nОтвет: ${item.answer}`
        ).join('\n\n');
        
        const prompt = `Ты эксперт по анализу бизнес-идей. Проанализируй идею пользователя и создай детальный отчет.

Исходная идея: "${dialogState.userIdea}"

Диалог с пользователем:
${dialogSummary}

ВАЖНО: Ограничьте ваш ответ максимум 2000 символами. Будьте краткими и по существу.

Создай структурированный анализ в следующем формате:

## Краткое описание идеи
[Краткое описание в 2-3 предложения]

## Анализ проблемы
[Какие проблемы решает идея]

## Целевая аудитория
[Кто является целевой аудиторией]

## Конкурентный анализ
[Основные конкуренты и отличия]

## Модель монетизации
[Как планируется зарабатывать]

## Технические аспекты
[Что нужно для реализации]

## SWOT анализ
**Сильные стороны:**
- [список]

**Слабые стороны:**
- [список]

**Возможности:**
- [список]

**Угрозы:**
- [список]

## Рекомендации
[Конкретные рекомендации по развитию идеи]

Используй markdown форматирование.`;

        let response;
        if (currentProvider === 'gemini') {
            response = await callGeminiDirect(prompt);
        } else {
            response = await callOpenAIDirect(prompt);
        }
        
        // Remove loading message
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        // Show final analysis
        showFinalAnalysis(response);
        
    } catch (error) {
        console.error('Error при создании финального анализа:', error);
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        addDialogMessage('❌ Произошла ошибка при создании анализа. Попробуйте еще раз.', 'ai');
    }
}

// Show final analysis
function showFinalAnalysis(analysis) {
    dialogState.isDialogComplete = true;
    
    // Hide dialog section
    document.getElementById('aiDialogSection').classList.add('hidden');
    
    // Show final analysis section
    document.getElementById('finalAnalysisSection').classList.remove('hidden');
    
    // Populate analysis content
    const analysisContent = document.getElementById('finalAnalysisContent');
    if (typeof marked !== 'undefined') {
        analysisContent.innerHTML = marked.parse(analysis);
    } else {
        // Fallback formatting
        let formattedAnalysis = analysis
            .replace(/^## (.*$)/gim, '<h4>$1</h4>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        formattedAnalysis = '<p>' + formattedAnalysis + '</p>';
        formattedAnalysis = formattedAnalysis
            .replace(/<p><h4>/g, '<h4>')
            .replace(/<\/h4><\/p>/g, '</h4>')
            .replace(/<p><\/p>/g, '');
        
        analysisContent.innerHTML = formattedAnalysis;
    }
}

// Add message to dialog
function addDialogMessage(text, sender) {
    const messagesContainer = document.getElementById('aiDialogMessages');
    if (!messagesContainer) return null;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-dialog-message ${sender}`;
    
    if (sender === 'ai') {
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
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');
            messageDiv.innerHTML = formattedText;
        }
    } else {
        messageDiv.textContent = text;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv;
}

// Modified startIncubation function
function startIncubation() {
    if (!dialogState.isDialogComplete) {
        alert('Пожалуйста, завершите диалог с AI');
        return;
    }
    
    // Store the enhanced idea data
    appState.userIdeaText = dialogState.userIdea;
    appState.projectData.idea = dialogState.userIdea;
    appState.projectData.dialogHistory = dialogState.dialogHistory;
    appState.projectData.userInfo = {
        name: 'Пользователь',
        email: '',
        timestamp: new Date().toISOString()
    };

    appState.modules[0].status = 'active';
    
    // Activate first topic of the first module
    if (appState.modules[0].topics && appState.modules[0].topics.length > 0) {
        appState.modules[0].topics.forEach((topic, index) => {
            if (index === 0) {
                topic.status = 'active';
                topic.completedQuestions = 0;
            } else {
                topic.status = 'locked';
                topic.completedQuestions = 0;
            }
        });
    }
    
    // Hide welcome screen and show module content
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('moduleContent').classList.remove('hidden');
    
    renderModuleList();
    renderModuleContent();
    renderModulePassport(); // Changed from renderProjectPassport()
    initializePassportToggle(); // Initialize toggle functionality
}

// Make function globally accessible
window.startIncubation = startIncubation;

// Demo mode functions
function generateDemoQuestions(loadingMessage) {
    if (loadingMessage && loadingMessage.parentNode) {
        loadingMessage.remove();
    }
    
    console.log('Generating demo questions for idea:', dialogState.userIdea);
    
    // Demo questions based on the idea
    const demoQuestions = [
        "Кто ваша целевая аудитория и в чем их основная проблема?",
        "Какие альтернативные решения уже существуют на рынке?",
        "Как вы планируете монетизировать ваш продукт?",
        "Какие ресурсы вам нужны для реализации идеи?",
        "Как вы будете измерять успех вашего продукта?"
    ];
    
    dialogState.questions = demoQuestions;
    
    // Show first question
    if (demoQuestions.length > 0) {
        addDialogMessage(`🤖 ДЕМО РЕЖИМ: ${demoQuestions[0]}`, 'ai');
    }
}

// Demo final analysis
function generateDemoAnalysis(loadingMessage) {
    if (loadingMessage && loadingMessage.parentNode) {
        loadingMessage.remove();
    }
    
    console.log('Generating demo analysis for idea:', dialogState.userIdea);
    
    const demoAnalysis = `## 🤖 ДЕМО АНАЛИЗ

## Краткое описание идеи
${dialogState.userIdea}

## Анализ проблемы
Ваша идея направлена на решение актуальной проблемы современного рынка. Необходимо провести дополнительные исследования для валидации потребности целевой аудитории.

## Целевая аудитория
Основываясь на вашем описании, целевая аудитория включает активных пользователей цифровых технологий, готовых использовать инновационные решения.

## Конкурентный анализ
На рынке существуют альтернативные решения, но ваш подход имеет потенциал для дифференциации за счет уникальных особенностей.

## Модель монетизации
Рекомендуется рассмотреть несколько моделей монетизации: фримиум, подписка, комиссионная модель.

## Технические аспекты
Для реализации потребуется команда разработчиков, дизайнеров и продуктовых менеджеров.

## SWOT анализ

**Сильные стороны:**
- Инновационный подход
- Потенциал для масштабирования
- Актуальная проблематика

**Слабые стороны:**
- Необходимость значительных инвестиций
- Высокая конкуренция
- Технические риски

**Возможности:**
- Растущий рынок
- Партнерские возможности
- Международная экспансия

**Угрозы:**
- Изменения в регулировании
- Экономическая нестабильность
- Технологические изменения

## Рекомендации
1. Проведите MVP тестирование с minимальной группой пользователей
2. Изучите конкурентов более детально
3. Подготовьте детальный бизнес-план
4. Рассмотрите возможности привлечения инвестиций

*Это демо-анализ. Для получения полного профессионального анализа настройте API ключ в боковой панели.*`;

    showFinalAnalysis(demoAnalysis);
}

// Log successful loading
console.log('dialog.js functions initialized:', {
    submitIdea: typeof window.submitIdea,
    sendDialogResponse: typeof window.sendDialogResponse,
    startIncubation: typeof window.startIncubation
});
